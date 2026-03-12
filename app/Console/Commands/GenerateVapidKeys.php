<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class GenerateVapidKeys extends Command
{
    protected $signature = 'webpush:vapid';
    protected $description = 'Generate VAPID keys for Web Push notifications';

    public function handle()
    {
        try {
            $keys = \Minishlink\WebPush\VAPID::createVapidKeys();

            $this->info('VAPID keys generated successfully!');
            $this->newLine();
            $this->line('Add these to your .env file:');
            $this->newLine();
            $this->line('VAPID_PUBLIC_KEY=' . $keys['publicKey']);
            $this->line('VAPID_PRIVATE_KEY=' . $keys['privateKey']);
            $this->line('VAPID_SUBJECT=mailto:your-email@example.com');
            $this->newLine();

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('Failed to generate VAPID keys: ' . $e->getMessage());
            $this->newLine();
            $this->line('You can generate keys online at: https://vapidkeys.com/');
            $this->line('Or use this Node.js command:');
            $this->line('npx web-push generate-vapid-keys');
            $this->newLine();

            return Command::FAILURE;
        }
    }
}
