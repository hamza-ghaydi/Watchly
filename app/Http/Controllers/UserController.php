<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::where('role', 'user')
            ->where('id', '!=', auth()->id()) // Exclude current user
            ->withCount(['followers', 'following']);

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $users = $query->orderBy('created_at', 'desc')
            ->paginate(20)
            ->through(fn($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'avatar' => $user->avatar,
                'bio' => $user->bio,
                'created_at' => $user->created_at,
                'followers_count' => $user->followers_count,
                'following_count' => $user->following_count,
                'is_following' => auth()->user()->isFollowing($user->id),
                'is_mutual' => auth()->user()->isFollowing($user->id) && $user->isFollowing(auth()->id()),
            ]);

        return Inertia::render('Users/Index', [
            'users' => $users,
            'search' => $request->search,
        ]);
    }

    public function show($username)
    {
        $user = User::where('username', $username)
            ->where('role', 'user')
            ->firstOrFail();

        $stats = [
            'total_movies' => $user->movies()->where('type', 'movie')->count(),
            'total_series' => $user->movies()->where('type', 'series')->count(),
            'total_watched' => $user->movies()->wherePivot('status', 'watched')->count(),
            'total_recommendations' => $user->recommendations()->count(),
        ];

        $isFollowing = auth()->user()->isFollowing($user->id);
        $followersCount = $user->followers()->count();
        $followingCount = $user->following()->count();
        
        // Check mutual follow
        $mutualFollow = $isFollowing && $user->isFollowing(auth()->id());

        // Recent watched movies (last 6)
        $recentWatched = $user->movies()
            ->wherePivot('status', 'watched')
            ->orderBy('movie_user.watched_at', 'desc')
            ->limit(6)
            ->get()
            ->map(fn($movie) => [
                'id' => $movie->id,
                'imdb_id' => $movie->imdb_id,
                'title' => $movie->title,
                'year' => $movie->year,
                'type' => $movie->type,
                'poster' => $movie->poster,
                'genre' => $movie->genre,
                'imdb_rating' => $movie->imdb_rating,
            ]);

        // Public recommendations
        $publicRecommendations = $user->recommendations()
            ->with('movie')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($rec) {
                $reactions = $rec->reactions;
                return [
                    'id' => $rec->id,
                    'note' => $rec->note,
                    'created_at' => $rec->created_at,
                    'movie' => [
                        'id' => $rec->movie->id,
                        'imdb_id' => $rec->movie->imdb_id,
                        'title' => $rec->movie->title,
                        'year' => $rec->movie->year,
                        'type' => $rec->movie->type,
                        'poster' => $rec->movie->poster,
                        'genre' => $rec->movie->genre,
                        'imdb_rating' => $rec->movie->imdb_rating,
                    ],
                    'reaction_counts' => [
                        'fire' => $reactions->where('type', 'fire')->count(),
                        'heart' => $reactions->where('type', 'heart')->count(),
                        'mind_blown' => $reactions->where('type', 'mind_blown')->count(),
                        'skip' => $reactions->where('type', 'skip')->count(),
                    ],
                ];
            });

        // Get available rooms for invite (only if mutual follow)
        $availableRooms = [];
        if ($mutualFollow) {
            $availableRooms = auth()->user()->watchTogetherRooms()
                ->withCount('members')
                ->get()
                ->filter(fn($room) => $room->members_count < 2)
                ->map(fn($room) => [
                    'id' => $room->id,
                    'name' => $room->name,
                    'invite_code' => $room->invite_code,
                    'members_count' => $room->members_count,
                ])
                ->values();
        }

        return Inertia::render('Users/Show', [
            'profile_user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'avatar' => $user->avatar,
                'bio' => $user->bio,
                'created_at' => $user->created_at,
            ],
            'stats' => $stats,
            'is_following' => $isFollowing,
            'followers_count' => $followersCount,
            'following_count' => $followingCount,
            'mutual_follow' => $mutualFollow,
            'recent_watched' => $recentWatched,
            'public_recommendations' => $publicRecommendations,
            'available_rooms' => $availableRooms,
        ]);
    }
}
