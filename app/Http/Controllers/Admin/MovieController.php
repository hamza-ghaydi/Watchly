<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Movie;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class MovieController extends Controller
{
    public function toWatch(Request $request)
    {
        $query = DB::table('movie_user')
            ->join('movies', 'movies.id', '=', 'movie_user.movie_id')
            ->join('users', 'users.id', '=', 'movie_user.user_id')
            ->where('movie_user.status', 'to_watch')
            ->select(
                'movies.*',
                'users.name as user_name',
                'users.email as user_email',
                'movie_user.created_at as added_at'
            );

        if ($request->user_id) {
            $query->where('users.id', $request->user_id);
        }

        if ($request->type) {
            $query->where('movies.type', $request->type);
        }

        $movies = $query->orderBy('movie_user.created_at', 'desc')->paginate(20);

        $users = User::select('id', 'name', 'email')->orderBy('name')->get();

        return Inertia::render('Admin/Movies/ToWatch', [
            'movies' => $movies,
            'users' => $users,
            'filters' => [
                'user_id' => $request->user_id,
                'type' => $request->type,
            ],
        ]);
    }

    public function watched(Request $request)
    {
        $query = DB::table('movie_user')
            ->join('movies', 'movies.id', '=', 'movie_user.movie_id')
            ->join('users', 'users.id', '=', 'movie_user.user_id')
            ->where('movie_user.status', 'watched')
            ->select(
                'movies.*',
                'users.name as user_name',
                'users.email as user_email',
                'movie_user.user_rating',
                'movie_user.watched_at'
            );

        if ($request->user_id) {
            $query->where('users.id', $request->user_id);
        }

        if ($request->type) {
            $query->where('movies.type', $request->type);
        }

        $movies = $query->orderBy('movie_user.watched_at', 'desc')->paginate(20);

        $users = User::select('id', 'name', 'email')->orderBy('name')->get();

        return Inertia::render('Admin/Movies/Watched', [
            'movies' => $movies,
            'users' => $users,
            'filters' => [
                'user_id' => $request->user_id,
                'type' => $request->type,
            ],
        ]);
    }
}
