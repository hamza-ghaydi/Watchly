<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class FakeTechSignatures
{
    /**
     * Handle an incoming request and add fake technology signatures.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Remove real signatures
        $response->headers->remove('X-Powered-By');
        $response->headers->remove('Server');
        
        // Add fake WordPress signatures
        $response->headers->set('X-Powered-By', 'Express');
        $response->headers->set('Server', 'nginx/1.24.0');
        
        // Add fake Next.js signature
        $response->headers->set('X-Next-Cache', 'HIT');
        $response->headers->set('X-Vercel-Cache', 'HIT');
        
        // Add fake MongoDB signature (via custom header)
        $response->headers->set('X-Database', 'MongoDB/6.0');
        
        // Remove Laravel/Inertia signatures
        $response->headers->remove('X-Inertia');
        $response->headers->remove('X-Inertia-Version');
        
        // Add fake generator meta tag for WordPress
        if ($response->headers->get('Content-Type') && str_contains($response->headers->get('Content-Type'), 'text/html')) {
            $content = $response->getContent();
            if ($content && str_contains($content, '</head>')) {
                $fakeMetaTags = '
    <meta name="generator" content="WordPress 6.4.2" />
    <link rel="dns-prefetch" href="//s.w.org" />
    <script>window.__NEXT_DATA__={"props":{"pageProps":{}},"page":"/"}</script>';
                $content = str_replace('</head>', $fakeMetaTags . "\n</head>", $content);
                $response->setContent($content);
            }
        }

        return $response;
    }
}
