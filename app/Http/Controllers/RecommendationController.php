<?php

namespace App\Http\Controllers;

use App\Models\Movie;
use App\Models\Recommendation;
use App\Models\Comment;
use App\Services\ActivityFeedService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class RecommendationController extends Controller
{
    public function index(Request $request)
    {
        $sort = $request->get('sort', 'most_recommended');
        
        // Get all recommendations with their movies
        $query = Recommendation::with(['movie', 'user:id,name,avatar', 'reactions'])
            ->join('movies', 'movies.id', '=', 'recommendations.movie_id');

        // Apply sorting
        switch ($sort) {
            case 'most_recent':
                $query->orderBy('recommendations.created_at', 'desc');
                break;
            case 'highest_rated':
                // For highest_rated, we'll sort by fire reactions after grouping
                $query->orderBy('recommendations.created_at', 'desc');
                break;
            case 'most_recommended':
            default:
                // For most_recommended, we'll group after fetching
                $query->orderBy('recommendations.created_at', 'desc');
                break;
        }

        $recommendations = $query->select('recommendations.*')->get();

        // Group by movie
        $groupedByMovie = $recommendations->groupBy('movie_id');
        
        // Build response array
        $grouped = [];
        foreach ($groupedByMovie as $movieId => $movieRecs) {
            $firstRec = $movieRecs->first();
            
            $recommenders = $movieRecs->map(fn($r) => [
                'id' => $r->user->id,
                'name' => $r->user->name,
                'avatar' => $r->user->avatar,
            ])->toArray();

            // Build recommenders label
            $count = count($recommenders);
            if ($count === 1) {
                $recommendersLabel = $recommenders[0]['name'];
                $othersNames = [];
            } elseif ($count === 2) {
                $recommendersLabel = $recommenders[0]['name'] . ' & ' . $recommenders[1]['name'];
                $othersNames = [];
            } else {
                $recommendersLabel = $recommenders[0]['name'] . ' & ' . ($count - 1) . ' others';
                $othersNames = array_slice(array_column($recommenders, 'name'), 1);
            }

            // Get latest note
            $latestNote = $movieRecs->whereNotNull('note')->sortByDesc('created_at')->first()?->note;

            // Calculate reaction counts
            $allReactions = $movieRecs->flatMap(fn($r) => $r->reactions);
            $fireCount = $allReactions->where('type', 'fire')->count();
            $heartCount = $allReactions->where('type', 'heart')->count();
            $mindBlownCount = $allReactions->where('type', 'mind_blown')->count();
            
            $reactionCounts = [
                'fire' => $fireCount,
                'heart' => $heartCount,
                'mind_blown' => $mindBlownCount,
            ];

            // Check user's recommendation and reaction
            $userRec = $movieRecs->where('user_id', auth()->id())->first();
            
            // Get user's reaction (check all reactions for this movie from current user)
            $userReaction = $allReactions->where('user_id', auth()->id())->first()?->type;

            // Check if user can add to watchlist
            $inList = auth()->user()->movies()->where('movies.id', $movieId)->exists();
            $alreadyWatched = auth()->user()->movies()
                ->where('movies.id', $movieId)
                ->wherePivot('status', 'watched')
                ->exists();

            // Get first recommendation ID for reactions (users react to the movie, not a specific recommendation)
            $firstRecommendationId = $movieRecs->first()->id;
            
            // Get total comments count for this movie (manually count all comments including replies)
            $recommendationIds = $movieRecs->pluck('id');
            $totalComments = Comment::whereIn('recommendation_id', $recommendationIds)->count();
            
            // Get most recent recommendation date for sorting
            $mostRecentDate = $movieRecs->max('created_at');

            $grouped[$movieId] = [
                'movie' => [
                    'id' => $firstRec->movie->id,
                    'imdb_id' => $firstRec->movie->imdb_id,
                    'title' => $firstRec->movie->title,
                    'year' => $firstRec->movie->year,
                    'type' => $firstRec->movie->type,
                    'poster' => $firstRec->movie->poster,
                    'genre' => $firstRec->movie->genre,
                    'imdb_rating' => $firstRec->movie->imdb_rating,
                ],
                'recommenders' => $recommenders,
                'recommenders_label' => $recommendersLabel,
                'others_names' => $othersNames,
                'latest_note' => $latestNote,
                'total_recommenders' => $count,
                'reaction_counts' => $reactionCounts,
                'user_already_recommended' => $userRec !== null,
                'user_reaction' => $userReaction,
                'recommendation_id' => $firstRecommendationId,
                'comments_count' => $totalComments,
                'can_add_to_watchlist' => !$inList,
                'already_watched' => $alreadyWatched,
                'sort_recommenders' => $count, // For sorting by most_recommended
                'sort_fire_reactions' => $fireCount, // For sorting by highest_rated
                'sort_recent_date' => $mostRecentDate, // For sorting by most_recent
            ];
        }

        // Sort the grouped results
        $groupedCollection = collect($grouped);
        if ($sort === 'most_recommended') {
            $groupedCollection = $groupedCollection->sortByDesc('sort_recommenders');
        } elseif ($sort === 'highest_rated') {
            $groupedCollection = $groupedCollection->sortByDesc('sort_fire_reactions');
        } elseif ($sort === 'most_recent') {
            $groupedCollection = $groupedCollection->sortByDesc('sort_recent_date');
        }

        // Paginate manually
        $page = $request->get('page', 1);
        $perPage = 12;
        $total = $groupedCollection->count();
        $items = $groupedCollection->slice(($page - 1) * $perPage, $perPage)->values();

        return Inertia::render('Recommendations/Index', [
            'recommendations' => [
                'data' => $items->toArray(),
                'current_page' => $page,
                'last_page' => ceil($total / $perPage),
                'per_page' => $perPage,
                'total' => $total,
            ],
            'sort' => $sort,
        ]);
    }

    public function store(Request $request)
    {
        // Authorize: user must have this movie in watched list with rating
        $userMovie = auth()->user()->movies()
            ->where('movies.id', $request->movie_id)
            ->wherePivot('status', 'watched')
            ->whereNotNull('movie_user.user_rating')
            ->first();

        if (!$userMovie) {
            return back()->withErrors(['movie_id' => 'You must watch and rate this movie before recommending it.']);
        }

        $request->validate([
            'movie_id' => 'required|exists:movies,id',
            'note' => 'nullable|string|max:160',
        ]);

        // Check for duplicate
        $existing = Recommendation::where('user_id', auth()->id())
            ->where('movie_id', $request->movie_id)
            ->first();

        if ($existing) {
            return back()->withErrors(['movie_id' => 'You already recommended this movie']);
        }

        $recommendation = Recommendation::create([
            'user_id' => auth()->id(),
            'movie_id' => $request->movie_id,
            'note' => $request->note,
        ]);

        // Record activity
        ActivityFeedService::record(
            auth()->id(),
            'recommended',
            $request->movie_id,
            ['note' => $request->note]
        );

        return back()->with('success', 'Movie recommended successfully!');
    }

    public function destroy(Recommendation $recommendation)
    {
        // Authorize: owner or admin
        if ($recommendation->user_id !== auth()->id() && !auth()->user()->isAdmin()) {
            abort(403, 'Unauthorized action.');
        }

        // Delete reactions
        $recommendation->reactions()->delete();
        
        $recommendation->delete();

        return back()->with('success', 'Recommendation removed successfully!');
    }

    public function getComments(Recommendation $recommendation)
    {
        $comments = $recommendation->comments()
            ->whereNull('parent_id') // Only get top-level comments
            ->with(['user:id,name,username,avatar', 'replies.user:id,name,username,avatar'])
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function($comment) {
                return [
                    'id' => $comment->id,
                    'body' => $comment->body,
                    'created_at' => $comment->created_at->diffForHumans(),
                    'user' => [
                        'id' => $comment->user->id,
                        'name' => $comment->user->name,
                        'username' => $comment->user->username,
                        'avatar' => $comment->user->avatar,
                    ],
                    'replies' => $comment->replies->map(fn($reply) => [
                        'id' => $reply->id,
                        'body' => $reply->body,
                        'created_at' => $reply->created_at->diffForHumans(),
                        'user' => [
                            'id' => $reply->user->id,
                            'name' => $reply->user->name,
                            'username' => $reply->user->username,
                            'avatar' => $reply->user->avatar,
                        ],
                    ]),
                ];
            });

        return response()->json([
            'comments' => $comments,
            'recommendation' => [
                'id' => $recommendation->id,
                'movie' => [
                    'title' => $recommendation->movie->title,
                ],
                'user' => [
                    'name' => $recommendation->user->name,
                ],
            ],
        ]);
    }

    public function storeComment(Request $request, Recommendation $recommendation)
    {
        $request->validate([
            'body' => 'required|string|max:500',
            'parent_id' => 'nullable|exists:comments,id',
        ]);

        // If parent_id is provided, verify it belongs to this recommendation
        if ($request->parent_id) {
            $parentComment = Comment::find($request->parent_id);
            if (!$parentComment || $parentComment->recommendation_id !== $recommendation->id) {
                return response()->json(['error' => 'Invalid parent comment'], 400);
            }
        }

        $comment = $recommendation->comments()->create([
            'user_id' => auth()->id(),
            'body' => $request->body,
            'parent_id' => $request->parent_id,
        ]);

        $comment->load('user:id,name,username,avatar');

        return response()->json([
            'comment' => [
                'id' => $comment->id,
                'body' => $comment->body,
                'created_at' => $comment->created_at->diffForHumans(),
                'user' => [
                    'id' => $comment->user->id,
                    'name' => $comment->user->name,
                    'username' => $comment->user->username,
                    'avatar' => $comment->user->avatar,
                ],
                'replies' => [],
            ],
        ]);
    }
}
