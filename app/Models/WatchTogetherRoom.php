<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class WatchTogetherRoom extends Model
{
    protected $fillable = ['name', 'invite_code'];

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'watch_together_members', 'room_id', 'user_id')
            ->withPivot('role', 'last_visited_at')
            ->withTimestamps();
    }

    public function movies(): BelongsToMany
    {
        return $this->belongsToMany(Movie::class, 'watch_together_movies', 'room_id', 'movie_id')
            ->withPivot('added_by', 'status', 'meta', 'watched_at')
            ->withTimestamps();
    }
}
