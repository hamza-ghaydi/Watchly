<?php

namespace App\Http\Controllers;

use App\Exceptions\OmdbException;
use App\Models\Movie;
use App\Services\OmdbService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MovieController extends Controller
{
    public function __construct(private OmdbService $omdbService)
    {
    }

    public function toWatch(Request $request)
    {
        $query = auth()->user()->movies()
            ->wherePivot('status', 'to_watch');

        // Search by title
        if ($request->filled('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        // Filter by type
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        // Filter by genre
        if ($request->filled('genre')) {
            $query->where('genre', 'like', '%' . $request->genre . '%');
        }

        // Filter by rating
        if ($request->filled('rating')) {
            $query->where('imdb_rating', '>=', $request->rating);
        }

        $movies = $query->orderBy('movie_user.created_at', 'desc')
            ->get()
            ->map(fn ($movie) => [
                'id' => $movie->id,
                'imdb_id' => $movie->imdb_id,
                'title' => $movie->title,
                'type' => $movie->type,
                'year' => $movie->year,
                'poster' => $movie->poster,
                'genre' => $movie->genre,
                'imdb_rating' => $movie->imdb_rating,
                'plot' => $movie->plot,
                'director' => $movie->director,
                'actors' => $movie->actors,
                'runtime' => $movie->runtime,
            ]);

        // Get unique genres for filter
        $genres = auth()->user()->movies()
            ->whereNotNull('genre')
            ->pluck('genre')
            ->flatMap(fn ($genre) => explode(', ', $genre))
            ->unique()
            ->sort()
            ->values();

        return Inertia::render('Movies/ToWatch', [
            'movies' => $movies,
            'genres' => $genres,
            'filters' => [
                'search' => $request->search,
                'type' => $request->type,
                'genre' => $request->genre,
                'rating' => $request->rating,
            ],
        ]);
    }

    public function watched(Request $request)
    {
        $query = auth()->user()->movies()
            ->wherePivot('status', 'watched');

        // Search by title
        if ($request->filled('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        // Filter by type
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        // Filter by genre
        if ($request->filled('genre')) {
            $query->where('genre', 'like', '%' . $request->genre . '%');
        }

        // Filter by rating
        if ($request->filled('rating')) {
            $query->where('imdb_rating', '>=', $request->rating);
        }

        // Filter by user rating
        if ($request->filled('user_rating')) {
            $query->wherePivot('user_rating', '>=', $request->user_rating);
        }

        $movies = $query->orderBy('movie_user.watched_at', 'desc')
            ->get()
            ->map(fn ($movie) => [
                'id' => $movie->id,
                'imdb_id' => $movie->imdb_id,
                'title' => $movie->title,
                'type' => $movie->type,
                'year' => $movie->year,
                'poster' => $movie->poster,
                'genre' => $movie->genre,
                'imdb_rating' => $movie->imdb_rating,
                'plot' => $movie->plot,
                'director' => $movie->director,
                'actors' => $movie->actors,
                'runtime' => $movie->runtime,
                'user_rating' => $movie->pivot->user_rating,
                'watched_at' => $movie->pivot->watched_at,
            ]);

        // Get unique genres for filter
        $genres = auth()->user()->movies()
            ->whereNotNull('genre')
            ->pluck('genre')
            ->flatMap(fn ($genre) => explode(', ', $genre))
            ->unique()
            ->sort()
            ->values();

        return Inertia::render('Movies/Watched', [
            'movies' => $movies,
            'genres' => $genres,
            'filters' => [
                'search' => $request->search,
                'type' => $request->type,
                'genre' => $request->genre,
                'rating' => $request->rating,
                'user_rating' => $request->user_rating,
            ],
        ]);
    }

    public function search(Request $request)
    {
        $request->validate([
            'q' => 'required|string|min:2',
        ]);

        try {
            $results = $this->omdbService->searchByTitle($request->q);
            
            return response()->json([
                'results' => $results,
            ]);
        } catch (OmdbException $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    public function import(Request $request)
    {
        $request->validate([
            'type' => 'required|in:manual,url',
            'query' => 'required|string',
        ]);

        try {
            // Get movie data from OMDB
            if ($request->input('type') === 'url') {
                $movieData = $this->omdbService->getByUrl($request->input('query'));
            } else {
                // For manual type, query should be an IMDB ID
                $movieData = $this->omdbService->getByImdbId($request->input('query'));
            }

            // Check if user already has this movie
            $existingMovie = auth()->user()->movies()
                ->where('imdb_id', $movieData['imdbID'])
                ->first();

            if ($existingMovie) {
                return back()->withErrors(['query' => 'This movie is already in your list.']);
            }

            // Create or get movie
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

            // Attach to user with to_watch status
            auth()->user()->movies()->attach($movie->id, [
                'status' => 'to_watch',
            ]);

            return back()->with('success', 'Movie added to your list!');
        } catch (OmdbException $e) {
            return back()->withErrors(['query' => $e->getMessage()]);
        }
    }

    public function markWatched(Request $request, Movie $movie)
    {
        // Authorize: movie must belong to user
        $userMovie = auth()->user()->movies()->where('movies.id', $movie->id)->first();
        
        if (! $userMovie) {
            abort(403, 'Unauthorized action.');
        }

        $request->validate([
            'user_rating' => 'required|integer|min:1|max:10',
        ]);

        auth()->user()->movies()->updateExistingPivot($movie->id, [
            'status' => 'watched',
            'user_rating' => $request->user_rating,
            'watched_at' => now(),
        ]);

        return back()->with('success', 'Movie marked as watched!');
    }

    public function destroy(Movie $movie)
    {
        // Authorize: movie must belong to user
        $userMovie = auth()->user()->movies()->where('movies.id', $movie->id)->first();
        
        if (! $userMovie) {
            abort(403, 'Unauthorized action.');
        }

        // Detach from user
        auth()->user()->movies()->detach($movie->id);

        // If no users have this movie, delete it
        if ($movie->users()->count() === 0) {
            $movie->delete();
        }

        return back()->with('success', 'Movie removed from your list!');
    }
}
