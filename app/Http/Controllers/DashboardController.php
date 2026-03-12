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

            // Get watch statistics
            $watchStats = $this->getWatchStats($user, request('from'), request('to'));

            return Inertia::render('Dashboard', [
                'stats' => $stats,
                'recentToWatch' => $recentToWatch,
                'recentWatched' => $recentWatched,
                'watchStats' => $watchStats,
            ]);
        }
    }

    private function getWatchStats($user, $from = null, $to = null)
    {
        $driver = DB::connection()->getDriverName();
        
        // Daily stats (last 30 days)
        $dailyData = DB::table('movie_user')
            ->join('movies', 'movies.id', '=', 'movie_user.movie_id')
            ->where('movie_user.user_id', $user->id)
            ->where('movie_user.status', 'watched')
            ->whereNotNull('movie_user.watched_at')
            ->where('movie_user.watched_at', '>=', now()->subDays(30))
            ->select(
                DB::raw('DATE(movie_user.watched_at) as date'),
                DB::raw('SUM(CASE WHEN movies.type = "movie" THEN 1 ELSE 0 END) as movies'),
                DB::raw('SUM(CASE WHEN movies.type = "series" THEN 1 ELSE 0 END) as series')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        // Fill in missing days
        $daily = [];
        for ($i = 29; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $daily[] = [
                'date' => $date,
                'movies' => isset($dailyData[$date]) ? (int) $dailyData[$date]->movies : 0,
                'series' => isset($dailyData[$date]) ? (int) $dailyData[$date]->series : 0,
            ];
        }

        // Monthly stats (last 12 months) - Use database-specific date formatting
        if ($driver === 'sqlite') {
            $monthFormat = 'strftime("%Y-%m", movie_user.watched_at)';
        } else {
            $monthFormat = 'DATE_FORMAT(movie_user.watched_at, "%Y-%m")';
        }

        $monthlyData = DB::table('movie_user')
            ->join('movies', 'movies.id', '=', 'movie_user.movie_id')
            ->where('movie_user.user_id', $user->id)
            ->where('movie_user.status', 'watched')
            ->whereNotNull('movie_user.watched_at')
            ->where('movie_user.watched_at', '>=', now()->subMonths(12))
            ->select(
                DB::raw($monthFormat . ' as month'),
                DB::raw('SUM(CASE WHEN movies.type = "movie" THEN 1 ELSE 0 END) as movies'),
                DB::raw('SUM(CASE WHEN movies.type = "series" THEN 1 ELSE 0 END) as series')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy('month');

        // Fill in missing months
        $monthly = [];
        for ($i = 11; $i >= 0; $i--) {
            $month = now()->subMonths($i)->format('Y-m');
            $monthly[] = [
                'month' => $month,
                'movies' => isset($monthlyData[$month]) ? (int) $monthlyData[$month]->movies : 0,
                'series' => isset($monthlyData[$month]) ? (int) $monthlyData[$month]->series : 0,
            ];
        }

        // Yearly stats (all years) - Use database-specific year extraction
        if ($driver === 'sqlite') {
            $yearFormat = 'strftime("%Y", movie_user.watched_at)';
        } else {
            $yearFormat = 'YEAR(movie_user.watched_at)';
        }

        $yearlyData = DB::table('movie_user')
            ->join('movies', 'movies.id', '=', 'movie_user.movie_id')
            ->where('movie_user.user_id', $user->id)
            ->where('movie_user.status', 'watched')
            ->whereNotNull('movie_user.watched_at')
            ->select(
                DB::raw($yearFormat . ' as year'),
                DB::raw('SUM(CASE WHEN movies.type = "movie" THEN 1 ELSE 0 END) as movies'),
                DB::raw('SUM(CASE WHEN movies.type = "series" THEN 1 ELSE 0 END) as series')
            )
            ->groupBy(DB::raw($yearFormat))
            ->orderBy('year')
            ->get()
            ->keyBy('year');

        // Fill in missing years (from first year to current year)
        $yearly = [];
        if ($yearlyData->isNotEmpty()) {
            $firstYear = (int) $yearlyData->keys()->first();
            $currentYear = (int) now()->format('Y');
            
            for ($year = $firstYear; $year <= $currentYear; $year++) {
                $yearStr = (string) $year;
                $yearly[] = [
                    'year' => $yearStr,
                    'movies' => isset($yearlyData[$yearStr]) ? (int) $yearlyData[$yearStr]->movies : 0,
                    'series' => isset($yearlyData[$yearStr]) ? (int) $yearlyData[$yearStr]->series : 0,
                ];
            }
        }

        // Custom range if provided
        $custom = [];
        if ($from && $to) {
            $customData = DB::table('movie_user')
                ->join('movies', 'movies.id', '=', 'movie_user.movie_id')
                ->where('movie_user.user_id', $user->id)
                ->where('movie_user.status', 'watched')
                ->whereNotNull('movie_user.watched_at')
                ->whereBetween('movie_user.watched_at', [$from, $to])
                ->select(
                    DB::raw('DATE(movie_user.watched_at) as date'),
                    DB::raw('SUM(CASE WHEN movies.type = "movie" THEN 1 ELSE 0 END) as movies'),
                    DB::raw('SUM(CASE WHEN movies.type = "series" THEN 1 ELSE 0 END) as series')
                )
                ->groupBy('date')
                ->orderBy('date')
                ->get()
                ->keyBy('date');

            // Fill in missing days in custom range
            $start = \Carbon\Carbon::parse($from);
            $end = \Carbon\Carbon::parse($to);
            
            while ($start->lte($end)) {
                $dateStr = $start->format('Y-m-d');
                $custom[] = [
                    'date' => $dateStr,
                    'movies' => isset($customData[$dateStr]) ? (int) $customData[$dateStr]->movies : 0,
                    'series' => isset($customData[$dateStr]) ? (int) $customData[$dateStr]->series : 0,
                ];
                $start->addDay();
            }
        }

        return [
            'daily' => $daily,
            'monthly' => $monthly,
            'yearly' => $yearly,
            'custom' => $custom,
        ];
    }
}
