<?php

namespace App\Http\Controllers;

use App\Models\ActivityFeed;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FeedController extends Controller
{
    public function index(Request $request)
    {
        $followingIds = auth()->user()->following()->pluck('following_id')->toArray();

        if (empty($followingIds)) {
            return Inertia::render('Feed/Index', [
                'activities' => [
                    'data' => [],
                    'current_page' => 1,
                    'last_page' => 1,
                ],
                'following_count' => 0,
            ]);
        }

        $activities = ActivityFeed::whereIn('user_id', $followingIds)
            ->with(['user:id,name,username,avatar', 'movie'])
            ->orderBy('created_at', 'desc')
            ->paginate(20)
            ->through(function ($activity) {
                $inMyList = auth()->user()->movies()->where('movies.id', $activity->movie_id)->exists();
                $alreadyWatched = auth()->user()->movies()
                    ->where('movies.id', $activity->movie_id)
                    ->wherePivot('status', 'watched')
                    ->exists();

                return [
                    'id' => $activity->id,
                    'type' => $activity->type,
                    'created_at' => $activity->created_at,
                    'meta' => $activity->meta,
                    'user' => [
                        'id' => $activity->user->id,
                        'name' => $activity->user->name,
                        'username' => $activity->user->username,
                        'avatar' => $activity->user->avatar,
                    ],
                    'movie' => [
                        'id' => $activity->movie->id,
                        'imdb_id' => $activity->movie->imdb_id,
                        'title' => $activity->movie->title,
                        'year' => $activity->movie->year,
                        'type' => $activity->movie->type,
                        'poster' => $activity->movie->poster,
                        'genre' => $activity->movie->genre,
                        'imdb_rating' => $activity->movie->imdb_rating,
                    ],
                    'in_my_list' => $inMyList,
                    'already_watched' => $alreadyWatched,
                ];
            });

        return Inertia::render('Feed/Index', [
            'activities' => $activities,
            'following_count' => count($followingIds),
        ]);
    }
}
