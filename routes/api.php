<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;

Route::post('/client-error', function (Request $request) {
    Log::error('Mobile client error', [
        'error' => $request->input('error'),
        'stack' => $request->input('stack'),
        'url' => $request->input('url'),
        'agent' => $request->input('userAgent'),
    ]);

    return response()->json(['ok' => true]);
});
