<?php

namespace App\Services;

use App\Models\ActivityFeed;
use Illuminate\Support\Facades\Log;

class ActivityFeedService
{
    public static function record(int $userId, string $type, int $movieId, array $meta = []): void
    {
        try {
            ActivityFeed::create([
                'user_id' => $userId,
                'type' => $type,
                'movie_id' => $movieId,
                'meta' => $meta,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to record activity feed', [
                'user_id' => $userId,
                'type' => $type,
                'movie_id' => $movieId,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
