<?php

namespace App\Http\Controllers;

use App\Models\Follow;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;

class FollowController extends Controller
{
    public function toggle(User $user)
    {
        // Cannot follow yourself
        if ($user->id === auth()->id()) {
            return response()->json(['error' => 'Cannot follow yourself'], 422);
        }

        // Cannot follow admin
        if ($user->isAdmin()) {
            return response()->json(['error' => 'Cannot follow admin accounts'], 403);
        }

        $existing = Follow::where('follower_id', auth()->id())
            ->where('following_id', $user->id)
            ->first();

        if ($existing) {
            // Unfollow
            $existing->delete();
            $following = false;
        } else {
            // Follow
            Follow::create([
                'follower_id' => auth()->id(),
                'following_id' => $user->id,
            ]);

            // Notify target user
            Notification::create([
                'user_id' => $user->id,
                'type' => 'new_follower',
                'message' => auth()->user()->name . ' started following you',
                'url' => '/users/' . auth()->user()->username,
                'meta' => ['follower_id' => auth()->id()],
            ]);

            $following = true;
        }

        $followersCount = $user->followers()->count();
        $isMutual = $following && $user->isFollowing(auth()->id());

        return response()->json([
            'following' => $following,
            'followers_count' => $followersCount,
            'is_mutual' => $isMutual,
        ]);
    }
}
