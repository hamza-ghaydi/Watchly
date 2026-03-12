<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSessionCookie
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Start session if not already started
        if (!$request->hasSession()) {
            $request->setLaravelSession(
                app('session.store')
            );
        }

        $response = $next($request);

        // Force session cookie settings for mobile compatibility
        if (app()->environment('production')) {
            $sessionName = config('session.cookie');
            
            // Get all cookies from response
            $cookies = $response->headers->getCookies();
            
            foreach ($cookies as $cookie) {
                if ($cookie->getName() === $sessionName) {
                    // Remove old cookie
                    $response->headers->removeCookie($sessionName);
                    
                    // Add new cookie with correct settings
                    $response->headers->setCookie(
                        cookie(
                            $sessionName,
                            $cookie->getValue(),
                            config('session.lifetime'),
                            config('session.path'),
                            config('session.domain'),
                            true, // secure
                            true, // httpOnly
                            false, // raw
                            'none' // sameSite
                        )
                    );
                    break;
                }
            }
        }

        return $response;
    }
}
