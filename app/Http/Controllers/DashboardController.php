<?php

namespace App\Http\Controllers;

use App\Models\Movie;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        if ($user->isAdmin()) {
            // Admin dashboard stats
            $stats = [
                'total_users' => User::count(),
                'total_movies' => Movie::count(),
                'total_watched' => DB::table('movie_user')->where('status', 'watched')->count(),
                'total_to_watch' => DB::table('movie_user')->where('status', 'to_watch')->count(),
                'most_imported' => Movie::withCount('users')
                    ->orderBy('users_count', 'desc')
                    ->first(),
            ];

            return Inertia::render('Dashboard', [
                'stats' => $stats,
            ]);
        } else {
            // User dashboard stats
            $stats = [
                'total_movies' => $user->movies()->where('type', 'movie')->count(),
                'total_series' => $user->movies()->where('type', 'series')->count(),
                'watched' => $user->movies()->wherePivot('status', 'watched')->count(),
                'to_watch' => $user->movies()->wherePivot('status', 'to_watch')->count(),
            ];

            // Get recent movies for user dashboard
            $recentToWatch = $user->movies()
                ->wherePivot('status', 'to_watch')
                ->orderBy('movie_user.created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(fn ($movie) => [
                    'id' => $movie->id,
                    'title' => $movie->title,
                    'poster' => $movie->poster,
                    'genre' => $movie->genre,
                    'year' => $movie->year,
                    'type' => $movie->type,
                    'imdb_rating' => $movie->imdb_rating,
                ]);

            $recentWatched = $user->movies()
                ->wherePivot('status', 'watched')
                ->orderBy('movie_user.watched_at', 'desc')
                ->limit(5)
                ->get()
                ->map(fn ($movie) => [
                    'id' => $movie->id,
                    'title' => $movie->title,
                    'poster' => $movie->poster,
                    'genre' => $movie->genre,
                    'year' => $movie->year,
                    'type' => $movie->type,
                    'imdb_rating' => $movie->imdb_rating,
                    'user_rating' => $movie->pivot->user_rating,
                ]);

            return Inertia::render('Dashboard', [
                'stats' => $stats,
                'recentToWatch' => $recentToWatch,
                'recentWatched' => $recentWatched,
            ]);
        }
    }
}
