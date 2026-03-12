<?php

namespace App\Http\Controllers;

use App\Models\Follow;
use App\Models\Notification;
use App\Models\User;
use App\Services\WebPushService;
use Illuminate\Http\Request;

class FollowController extends Controller
{
    public function __construct(private WebPushService $webPushService)
    {
    }

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
            $message = auth()->user()->name . ' started following you';
            Notification::create([
                'user_id' => $user->id,
                'type' => 'new_follower',
                'message' => $message,
                'url' => '/users/' . auth()->user()->username,
                'meta' => ['follower_id' => auth()->id()],
            ]);

            // Send push notification
            $this->webPushService->sendNotification(
                $user,
                'New Follower',
                $message,
                url('/users/' . auth()->user()->username)
            );

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
