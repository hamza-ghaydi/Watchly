<?php

namespace App\Http\Controllers;

use App\Models\Movie;
use App\Models\Notification;
use App\Models\WatchTogetherRoom;
use App\Services\ActivityFeedService;
use App\Services\OmdbService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class WatchTogetherController extends Controller
{
    public function __construct(private OmdbService $omdbService)
    {
    }

    public function index()
    {
        $rooms = auth()->user()->watchTogetherRooms()
            ->withCount('movies')
            ->with(['members' => function ($query) {
                $query->select('users.id', 'users.name', 'users.avatar');
            }])
            ->get()
            ->map(function ($room) {
                // Calculate unread activity count
                $membership = $room->members->where('id', auth()->id())->first();
                $lastVisited = $membership->pivot->last_visited_at;
                
                $unreadCount = 0;
                if ($lastVisited) {
                    $unreadCount = DB::table('watch_together_movies')
                        ->where('room_id', $room->id)
                        ->where('created_at', '>', $lastVisited)
                        ->count();
                }

                return [
                    'id' => $room->id,
                    'name' => $room->name,
                    'members' => $room->members->map(fn($m) => [
                        'id' => $m->id,
                        'name' => $m->name,
                        'avatar' => $m->avatar,
                    ]),
                    'movies_count' => $room->movies_count,
                    'unread_count' => $unreadCount,
                ];
            });

        return Inertia::render('WatchTogether/Index', [
            'rooms' => $rooms,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:50',
        ]);

        // Generate unique invite code
        do {
            $code = strtoupper(Str::random(4) . '-' . Str::random(4));
        } while (WatchTogetherRoom::where('invite_code', $code)->exists());

        $room = WatchTogetherRoom::create([
            'name' => $request->name,
            'invite_code' => $code,
        ]);

        // Add creator as owner
        $room->members()->attach(auth()->id(), [
            'role' => 'owner',
            'last_visited_at' => now(),
        ]);

        return redirect()->route('watch-together.show', $room)->with('success', 'Room created successfully!');
    }

    public function join(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
        ]);

        $room = WatchTogetherRoom::where('invite_code', $request->code)->first();

        if (!$room) {
            return back()->withErrors(['code' => 'Invalid invite code']);
        }

        // Check if already a member
        if ($room->members()->where('user_id', auth()->id())->exists()) {
            return back()->withErrors(['code' => 'You are already a member of this room']);
        }

        // Check room capacity
        if ($room->members()->count() >= 2) {
            return back()->withErrors(['code' => 'Room is full']);
        }

        // Add as member
        $room->members()->attach(auth()->id(), [
            'role' => 'member',
            'last_visited_at' => now(),
        ]);

        // Notify owner
        $owner = $room->members()->wherePivot('role', 'owner')->first();
        if ($owner) {
            Notification::create([
                'user_id' => $owner->id,
                'type' => 'watch_together_joined',
                'message' => auth()->user()->name . ' joined your Watch Together room',
                'url' => '/watch-together/' . $room->id,
                'meta' => ['room_id' => $room->id],
            ]);
        }

        return redirect()->route('watch-together.show', $room)->with('success', 'Joined room successfully!');
    }

    public function show(WatchTogetherRoom $room)
    {
        // Authorize: must be member
        if (!$room->members()->where('user_id', auth()->id())->exists()) {
            abort(403, 'Unauthorized action.');
        }

        // Update last visited
        $room->members()->updateExistingPivot(auth()->id(), [
            'last_visited_at' => now(),
        ]);

        // Get movies with vote summary
        $movies = $room->movies()
            ->get()
            ->map(function ($movie) use ($room) {
                // Get the user who added this movie
                $addedBy = \App\Models\User::select('id', 'name', 'avatar')
                    ->find($movie->pivot->added_by);
                
                // Get votes
                $votes = DB::table('watch_together_votes')
                    ->where('room_id', $room->id)
                    ->where('movie_id', $movie->id)
                    ->get();

                $userVote = $votes->where('user_id', auth()->id())->first()?->vote;

                $meta = json_decode($movie->pivot->meta, true) ?? [];

                return [
                    'id' => $movie->id,
                    'imdb_id' => $movie->imdb_id,
                    'title' => $movie->title,
                    'year' => $movie->year,
                    'type' => $movie->type,
                    'poster' => $movie->poster,
                    'genre' => $movie->genre,
                    'imdb_rating' => $movie->imdb_rating,
                    'status' => $movie->pivot->status,
                    'watched_at' => $movie->pivot->watched_at,
                    'added_by' => $addedBy ? [
                        'id' => $addedBy->id,
                        'name' => $addedBy->name,
                        'avatar' => $addedBy->avatar,
                    ] : [
                        'id' => 0,
                        'name' => 'Unknown',
                        'avatar' => null,
                    ],
                    'vote_summary' => [
                        'up' => $votes->where('vote', 'up')->count(),
                        'down' => $votes->where('vote', 'down')->count(),
                        'user_vote' => $userVote,
                    ],
                    'meta' => $meta,
                ];
            });

        $toWatch = $movies->where('status', 'to_watch')->values();
        $watched = $movies->where('status', 'watched')->values();

        // Get pending watched confirmations
        $pendingWatched = $toWatch->filter(function ($movie) {
            $meta = $movie['meta'];
            return isset($meta['confirmed_by']) && !in_array(auth()->id(), $meta['confirmed_by']);
        })->values();

        $members = $room->members->map(fn($m) => [
            'id' => $m->id,
            'name' => $m->name,
            'avatar' => $m->avatar,
            'role' => $m->pivot->role,
        ]);

        // Only show invite code if room has < 2 members
        $inviteCode = $room->members()->count() < 2 ? $room->invite_code : null;

        return Inertia::render('WatchTogether/Show', [
            'room' => [
                'id' => $room->id,
                'name' => $room->name,
                'invite_code' => $inviteCode,
            ],
            'members' => $members,
            'to_watch' => $toWatch,
            'watched' => $watched,
            'pending_watched' => $pendingWatched,
        ]);
    }

    public function addMovie(Request $request, WatchTogetherRoom $room)
    {
        // Authorize: must be member
        if (!$room->members()->where('user_id', auth()->id())->exists()) {
            abort(403, 'Unauthorized action.');
        }

        $request->validate([
            'imdb_id' => 'required|string',
        ]);

        // Fetch/create movie
        $movieData = $this->omdbService->getByImdbId($request->imdb_id);
        
        $movie = Movie::firstOrCreate(
            ['imdb_id' => $movieData['imdbID']],
            [
                'title' => $movieData['Title'],
                'type' => strtolower($movieData['Type']),
                'year' => $movieData['Year'] !== 'N/A' ? (int) $movieData['Year'] : null,
                'plot' => $movieData['Plot'] !== 'N/A' ? $movieData['Plot'] : null,
                'poster' => $movieData['Poster'] !== 'N/A' ? $movieData['Poster'] : null,
                'director' => $movieData['Director'] ?? null,
                'actors' => $movieData['Actors'] ?? null,
                'genre' => $movieData['Genre'] ?? null,
                'runtime' => $movieData['Runtime'] ?? null,
                'imdb_rating' => $movieData['imdbRating'] ?? null,
                'ratings' => $movieData['Ratings'] ?? null,
            ]
        );

        // Check if already in room
        if ($room->movies()->where('movie_id', $movie->id)->exists()) {
            return back()->withErrors(['imdb_id' => 'Already in this room']);
        }

        // Add to room
        $room->movies()->attach($movie->id, [
            'added_by' => auth()->id(),
            'status' => 'to_watch',
        ]);

        // Notify other member
        $otherMember = $room->members()->where('user_id', '!=', auth()->id())->first();
        if ($otherMember) {
            Notification::create([
                'user_id' => $otherMember->id,
                'type' => 'watch_together_movie_added',
                'message' => auth()->user()->name . ' added ' . $movie->title . ' to your room',
                'url' => '/watch-together/' . $room->id,
                'meta' => ['room_id' => $room->id, 'movie_id' => $movie->id],
            ]);
        }

        // Record activity
        ActivityFeedService::record(auth()->id(), 'added', $movie->id, []);

        return back()->with('success', 'Movie added to room!');
    }

    public function vote(Request $request, WatchTogetherRoom $room)
    {
        // Authorize: must be member
        if (!$room->members()->where('user_id', auth()->id())->exists()) {
            abort(403, 'Unauthorized action.');
        }

        $request->validate([
            'movie_id' => 'required|exists:movies,id',
            'vote' => 'required|in:up,down',
        ]);

        $existing = DB::table('watch_together_votes')
            ->where('room_id', $room->id)
            ->where('movie_id', $request->movie_id)
            ->where('user_id', auth()->id())
            ->first();

        if (!$existing) {
            // Create new vote
            DB::table('watch_together_votes')->insert([
                'room_id' => $room->id,
                'movie_id' => $request->movie_id,
                'user_id' => auth()->id(),
                'vote' => $request->vote,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } elseif ($existing->vote === $request->vote) {
            // Toggle off - delete
            DB::table('watch_together_votes')
                ->where('id', $existing->id)
                ->delete();
        } else {
            // Update to new vote
            DB::table('watch_together_votes')
                ->where('id', $existing->id)
                ->update(['vote' => $request->vote, 'updated_at' => now()]);
        }

        // Get updated vote summary
        $votes = DB::table('watch_together_votes')
            ->where('room_id', $room->id)
            ->where('movie_id', $request->movie_id)
            ->get();

        $userVote = $votes->where('user_id', auth()->id())->first()?->vote;

        return response()->json([
            'vote_summary' => [
                'up' => $votes->where('vote', 'up')->count(),
                'down' => $votes->where('vote', 'down')->count(),
                'user_vote' => $userVote,
            ],
        ]);
    }

    public function markWatched(Request $request, WatchTogetherRoom $room)
    {
        // Authorize: must be member
        if (!$room->members()->where('user_id', auth()->id())->exists()) {
            abort(403, 'Unauthorized action.');
        }

        $request->validate([
            'movie_id' => 'required|exists:movies,id',
        ]);

        $movie = $room->movies()->where('movie_id', $request->movie_id)->first();
        if (!$movie) {
            abort(404);
        }

        $meta = json_decode($movie->pivot->meta, true) ?? [];
        $confirmedBy = $meta['confirmed_by'] ?? [];

        // Check if other member already confirmed
        $otherMember = $room->members()->where('user_id', '!=', auth()->id())->first();
        
        if (in_array($otherMember->id, $confirmedBy)) {
            // Both confirmed - mark as watched
            $room->movies()->updateExistingPivot($request->movie_id, [
                'status' => 'watched',
                'watched_at' => now(),
                'meta' => json_encode([]),
            ]);

            // Notify both members
            foreach ($room->members as $member) {
                Notification::create([
                    'user_id' => $member->id,
                    'type' => 'watch_together_watched',
                    'message' => 'Both confirmed — ' . $movie->title . ' marked as watched!',
                    'url' => '/watch-together/' . $room->id,
                    'meta' => ['room_id' => $room->id, 'movie_id' => $movie->id],
                ]);
            }

            return back()->with('success', 'Movie marked as watched!');
        } else {
            // Store this user's confirmation
            $confirmedBy[] = auth()->id();
            $room->movies()->updateExistingPivot($request->movie_id, [
                'meta' => json_encode(['confirmed_by' => $confirmedBy]),
            ]);

            // Notify other member
            if ($otherMember) {
                Notification::create([
                    'user_id' => $otherMember->id,
                    'type' => 'watch_together_watched',
                    'message' => auth()->user()->name . ' marked ' . $movie->title . ' as watched — do you confirm?',
                    'url' => '/watch-together/' . $room->id,
                    'meta' => ['room_id' => $room->id, 'movie_id' => $movie->id],
                ]);
            }

            return back()->with('success', 'Waiting for confirmation from other member');
        }
    }

    public function leave(WatchTogetherRoom $room)
    {
        // Authorize: must be member
        if (!$room->members()->where('user_id', auth()->id())->exists()) {
            abort(403, 'Unauthorized action.');
        }

        $isOwner = $room->members()->wherePivot('role', 'owner')->where('user_id', auth()->id())->exists();
        $otherMember = $room->members()->where('user_id', '!=', auth()->id())->first();

        if ($isOwner && $otherMember) {
            // Transfer ownership
            $room->members()->updateExistingPivot($otherMember->id, ['role' => 'owner']);
        }

        // Remove user
        $room->members()->detach(auth()->id());

        // If last member, delete room
        if ($room->members()->count() === 0) {
            $room->movies()->detach();
            DB::table('watch_together_votes')->where('room_id', $room->id)->delete();
            $room->delete();
        }

        return redirect()->route('watch-together.index')->with('success', 'Left room successfully');
    }
}
