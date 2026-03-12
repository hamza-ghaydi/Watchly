<?php

namespace App\Http\Controllers;

use App\Models\PushSubscription;
use Illuminate\Http\Request;

class PushSubscriptionController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'endpoint' => 'required|string',
            'keys.p256dh' => 'required|string',
            'keys.auth' => 'required|string',
        ]);

        // Delete existing subscription for this endpoint
        PushSubscription::where('endpoint', $request->endpoint)->delete();

        // Create new subscription
        $subscription = PushSubscription::create([
            'user_id' => auth()->id(),
            'endpoint' => $request->endpoint,
            'public_key' => $request->input('keys.p256dh'),
            'auth_token' => $request->input('keys.auth'),
            'content_encoding' => $request->input('contentEncoding', 'aesgcm'),
        ]);

        return response()->json([
            'success' => true,
            'subscription' => $subscription,
        ]);
    }

    public function destroy(Request $request)
    {
        $request->validate([
            'endpoint' => 'required|string',
        ]);

        PushSubscription::where('user_id', auth()->id())
            ->where('endpoint', $request->endpoint)
            ->delete();

        return response()->json(['success' => true]);
    }

    public function getPublicKey()
    {
        $publicKey = config('services.vapid.public_key');
        
        return response()->json([
            'publicKey' => $publicKey,
        ]);
    }
}
