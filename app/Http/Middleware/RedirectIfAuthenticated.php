<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RedirectIfAuthenticated
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string ...$guards): Response
    {
        $guards = empty($guards) ? [null] : $guards;

        foreach ($guards as $guard) {
            if (Auth::guard($guard)->check()) {
                // Check if it's a PWA request (standalone mode)
                $isPWA = $request->header('X-Requested-With') === 'PWA' 
                    || $request->query('mode') === 'standalone'
                    || $request->cookie('pwa_mode') === 'true';

                // Always redirect authenticated users to dashboard
                return redirect()->route('dashboard');
            }
        }

        $response = $next($request);

        // Prevent iOS Safari from caching auth pages (causes stale CSRF tokens)
        $response->headers->set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
        $response->headers->set('Pragma', 'no-cache');
        $response->headers->set('Expires', '0');

        return $response;
    }
}
