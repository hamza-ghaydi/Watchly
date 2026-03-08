<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Services\OmdbService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
    {
        $apiKey = Setting::get('omdb_api_key', '');

        return Inertia::render('Admin/Settings', [
            'api_key' => $apiKey,
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'api_key' => 'required|string',
        ]);

        Setting::set('omdb_api_key', $request->api_key);
        Cache::forget('omdb_api_key');

        return back()->with('success', 'API key updated successfully!');
    }

    public function test(OmdbService $omdbService)
    {
        $result = $omdbService->testConnection();

        return response()->json($result);
    }
}
