<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Movie extends Model
{
    protected $fillable = [
        'imdb_id',
        'title',
        'type',
        'year',
        'plot',
        'poster',
        'director',
        'actors',
        'genre',
        'runtime',
        'imdb_rating',
        'ratings',
    ];

    protected $casts = [
        'ratings' => 'array',
        'year' => 'integer',
    ];

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class)
            ->withPivot('status', 'user_rating', 'watched_at')
            ->withTimestamps();
    }
}
