<?php

namespace App\Console\Commands;

use App\Models\Setting;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class TestOmdb extends Command
{
    protected $signature = 'omdb:test {apikey?}';
    protected $description = 'Test OMDB API connection';

    public function handle()
    {
        $apiKey = $this->argument('apikey') ?? Setting::get('omdb_api_key');

        if (!$apiKey) {
            $this->error('No API key provided. Use: php artisan omdb:test YOUR_API_KEY');
            return 1;
        }

        $this->info('Testing OMDB API with key: ' . substr($apiKey, 0, 4) . '****');

        try {
            $response = Http::get('https://www.omdbapi.com/', [
                'apikey' => $apiKey,
                'i' => 'tt0111161',
            ]);

            $this->info('Response Status: ' . $response->status());
            $this->info('Response Body:');
            $this->line(json_encode($response->json(), JSON_PRETTY_PRINT));

            $data = $response->json();

            if (isset($data['Error'])) {
                $this->error('API Error: ' . $data['Error']);
                return 1;
            }

            if (isset($data['Title'])) {
                $this->info('✓ Success! Found movie: ' . $data['Title']);
                return 0;
            }

            $this->error('Unexpected response format');
            return 1;

        } catch (\Exception $e) {
            $this->error('Exception: ' . $e->getMessage());
            return 1;
        }
    }
}
