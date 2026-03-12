<?php

namespace App\Services;

use App\Models\PushSubscription;
use App\Models\User;
use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;

class WebPushService
{
    protected WebPush $webPush;

    public function __construct()
    {
        $auth = [
            'VAPID' => [
                'subject' => config('services.vapid.subject'),
                'publicKey' => config('services.vapid.public_key'),
                'privateKey' => config('services.vapid.private_key'),
            ],
        ];

        $this->webPush = new WebPush($auth);
    }

    public function sendNotification(User $user, string $title, string $body, ?string $url = null): bool
    {
        $subscriptions = $user->pushSubscriptions;

        if ($subscriptions->isEmpty()) {
            return false;
        }

        $payload = json_encode([
            'title' => $title,
            'body' => $body,
            'url' => $url,
            'tag' => 'watchly-' . time(),
        ]);

        $success = false;

        foreach ($subscriptions as $subscription) {
            try {
                $pushSubscription = Subscription::create([
                    'endpoint' => $subscription->endpoint,
                    'publicKey' => $subscription->public_key,
                    'authToken' => $subscription->auth_token,
                    'contentEncoding' => $subscription->content_encoding,
                ]);

                $this->webPush->queueNotification($pushSubscription, $payload);
                $success = true;
            } catch (\Exception $e) {
                \Log::error('Failed to queue push notification: ' . $e->getMessage());
            }
        }

        // Send all queued notifications
        try {
            $reports = $this->webPush->flush();

            // Remove invalid subscriptions
            foreach ($reports as $report) {
                if (!$report->isSuccess() && $report->isSubscriptionExpired()) {
                    PushSubscription::where('endpoint', $report->getEndpoint())->delete();
                }
            }
        } catch (\Exception $e) {
            \Log::error('Failed to send push notifications: ' . $e->getMessage());
        }

        return $success;
    }

    public function sendToMultipleUsers(array $users, string $title, string $body, ?string $url = null): void
    {
        foreach ($users as $user) {
            $this->sendNotification($user, $title, $body, $url);
        }
    }
}
