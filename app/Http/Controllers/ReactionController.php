<?php

namespace App\Http\Controllers;

use App\Models\Reaction;
use App\Models\Recommendation;
use Illuminate\Http\Request;

class ReactionController extends Controller
{
    public function toggle(Request $request)
    {
        $request->validate([
            'recommendation_id' => 'required|exists:recommendations,id',
            'type' => 'required|in:fire,heart,mind_blown,skip',
        ]);

        $recommendation = Recommendation::findOrFail($request->recommendation_id);
        
        $existing = Reaction::where('user_id', auth()->id())
            ->where('recommendation_id', $request->recommendation_id)
            ->first();

        if (!$existing) {
            // Create new reaction
            Reaction::create([
                'user_id' => auth()->id(),
                'recommendation_id' => $request->recommendation_id,
                'type' => $request->type,
            ]);
            $userReaction = $request->type;
        } elseif ($existing->type === $request->type) {
            // Toggle off - delete
            $existing->delete();
            $userReaction = null;
        } else {
            // Update to new type
            $existing->update(['type' => $request->type]);
            $userReaction = $request->type;
        }

        // Get updated reaction counts
        $reactions = Reaction::where('recommendation_id', $request->recommendation_id)->get();
        $reactionCounts = [
            'fire' => $reactions->where('type', 'fire')->count(),
            'heart' => $reactions->where('type', 'heart')->count(),
            'mind_blown' => $reactions->where('type', 'mind_blown')->count(),
            'skip' => $reactions->where('type', 'skip')->count(),
        ];

        return response()->json([
            'reaction_counts' => $reactionCounts,
            'user_reaction' => $userReaction,
        ]);
    }
}
