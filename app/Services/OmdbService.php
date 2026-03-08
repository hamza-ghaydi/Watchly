<?php

namespace App\Services;

use App\Exceptions\OmdbException;
use App\Models\Setting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class OmdbService
{
    private const BASE_URL = 'https://www.omdbapi.com/';

    private function getApiKey(): string
    {
        $apiKey = Cache::remember('omdb_api_key', 3600, function () {
            return Setting::get('omdb_api_key');
        });

        if (! $apiKey) {
            throw new OmdbException('OMDB API key is not configured. Please configure it in settings.');
        }

        return $apiKey;
    }

    public function searchByTitle(string $title): array
    {
        $response = Http::withOptions(['verify' => false])->get(self::BASE_URL, [
            'apikey' => $this->getApiKey(),
            's' => $title,
        ]);

        $data = $response->json();

        if (isset($data['Error'])) {
            throw new OmdbException($this->formatError($data['Error']));
        }

        if (!isset($data['Response']) || $data['Response'] === 'False') {
            return [];
        }

        if (! isset($data['Search'])) {
            return [];
        }

        return $data['Search'];
    }

    public function getByImdbId(string $imdbId): array
    {
        $response = Http::withOptions(['verify' => false])->get(self::BASE_URL, [
            'apikey' => $this->getApiKey(),
            'i' => $imdbId,
            'plot' => 'full',
        ]);

        $data = $response->json();

        if (isset($data['Error'])) {
            throw new OmdbException($this->formatError($data['Error']));
        }

        if ($data['Response'] === 'False') {
            throw new OmdbException('Movie not found.');
        }

        return $data;
    }

    public function getByUrl(string $imdbUrl): array
    {
        // Extract IMDB ID from URL (e.g., https://www.imdb.com/title/tt0111161/)
        if (preg_match('/tt\d+/', $imdbUrl, $matches)) {
            return $this->getByImdbId($matches[0]);
        }

        throw new OmdbException('Invalid IMDB URL. Could not extract IMDB ID.');
    }

    public function testConnection(): array
    {
        try {
            $apiKey = $this->getApiKey();
            
            // Make a direct test request
            $response = Http::withOptions(['verify' => false])->get(self::BASE_URL, [
                'apikey' => $apiKey,
                'i' => 'tt0111161',
                'plot' => 'full',
            ]);

            $data = $response->json();

            // Log the response for debugging
            \Log::info('OMDB Test Response', ['data' => $data, 'status' => $response->status()]);

            if (isset($data['Error'])) {
                return [
                    'success' => false,
                    'error' => $this->formatError($data['Error']),
                ];
            }

            if (!isset($data['Response']) || $data['Response'] === 'False') {
                return [
                    'success' => false,
                    'error' => $data['Error'] ?? 'Unknown error occurred',
                ];
            }
            
            return [
                'success' => true,
                'movie_title' => $data['Title'] ?? 'Unknown',
            ];
        } catch (OmdbException $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => 'Connection failed: ' . $e->getMessage(),
            ];
        }
    }

    private function formatError(string $error): string
    {
        return match (true) {
            str_contains($error, 'Invalid API key') => 'Invalid OMDB API key. Please check your configuration.',
            str_contains($error, 'Request limit reached') => 'OMDB API request limit reached. Please try again later.',
            str_contains($error, 'Movie not found') => 'Movie not found in OMDB database.',
            default => $error,
        };
    }
}
