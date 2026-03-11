<?php

namespace App\Http\Controllers;

use App\Models\Movie;
use App\Models\Recommendation;
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
                $query->orderBy('movies.imdb_rating', 'desc');
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
            $reactionCounts = [
                'fire' => $allReactions->where('type', 'fire')->count(),
                'heart' => $allReactions->where('type', 'heart')->count(),
                'mind_blown' => $allReactions->where('type', 'mind_blown')->count(),
                'skip' => $allReactions->where('type', 'skip')->count(),
            ];

            // Check user's recommendation and reaction
            $userRec = $movieRecs->where('user_id', auth()->id())->first();
            $userReaction = $userRec ? $allReactions->where('user_id', auth()->id())->first()?->type : null;

            // Check if user can add to watchlist
            $inList = auth()->user()->movies()->where('movies.id', $movieId)->exists();
            $alreadyWatched = auth()->user()->movies()
                ->where('movies.id', $movieId)
                ->wherePivot('status', 'watched')
                ->exists();

            // Get first recommendation ID for reactions (users react to the movie, not a specific recommendation)
            $firstRecommendationId = $movieRecs->first()->id;

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
                'can_add_to_watchlist' => !$inList,
                'already_watched' => $alreadyWatched,
                'sort_key' => $count, // For sorting by most_recommended
            ];
        }

        // Sort the grouped results
        $groupedCollection = collect($grouped);
        if ($sort === 'most_recommended') {
            $groupedCollection = $groupedCollection->sortByDesc('sort_key');
        } elseif ($sort === 'highest_rated') {
            $groupedCollection = $groupedCollection->sortByDesc('movie.imdb_rating');
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
}
