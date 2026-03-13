import React from 'react';
import { Link } from '@inertiajs/react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';
import images from '@/constants/images';

function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    // Fix for iOS Safari: Force page reload when restored from bfcache
    // iOS Safari aggressively caches pages, causing stale CSRF tokens
    React.useEffect(() => {
        const handlePageShow = (event: PageTransitionEvent) => {
            // If page is restored from bfcache, reload to get fresh CSRF token
            if (event.persisted) {
                console.log('[iOS Fix] Page restored from cache, reloading for fresh CSRF token');
                window.location.reload();
            }
        };

        window.addEventListener('pageshow', handlePageShow);

        return () => {
            window.removeEventListener('pageshow', handlePageShow);
        };
    }, []);

    return (
        <div className="relative min-h-svh flex items-center justify-center overflow-hidden">

            {/* ── Background image ── */}
            <img
                src={images.bgwatchly}
                alt="Watchly"
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none"
            />

            {/* ── Extra depth overlay ── */}
            <div className="absolute inset-0 bg-[#070B14]/60" />

            {/* ── Center darkening vignette so card pops ── */}
            <div className="absolute inset-0 bg-radial-[ellipse_60%_60%_at_50%_50%] from-transparent via-transparent to-[#070B14]/70 pointer-events-none" />

            {/* ── Ambient gold glow top-left ── */}
            <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-[#F5C518] opacity-[0.06] blur-[120px] pointer-events-none" />

            {/* ── Ambient blue glow bottom-right ── */}
            <div className="absolute -bottom-24 -right-24 w-[400px] h-[400px] rounded-full bg-[#3B82F6] opacity-[0.07] blur-[100px] pointer-events-none" />

            {/* ── Glass card ── */}
            <div className="relative z-10 w-full max-w-sm mx-4">
                <div className="
                    bg-white/[0.04]
                    backdrop-blur-2xl
                    border border-white/[0.10]
                    rounded-2xl
                    p-8
                    shadow-[0_24px_80px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)]
                ">
                    {/* Top gold accent line */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-[#F5C518] to-transparent rounded-full" />

                    <div className="flex flex-col gap-7">

                        {/* Logo + heading */}
                        <div className="flex flex-col items-center gap-5">
                            <Link
                                href={home()}
                                className="flex flex-col items-center gap-2 group"
                            >
                                <div className="transition-transform duration-300 group-hover:scale-105">
                                    <img
                                        src={images.logo}
                                        alt="Watchly"
                                        className="w-50 object-contain drop-shadow-[0_0_16px_rgba(245,197,24,0.35)]"
                                    />
                                </div>
                                <span className="sr-only">Watchly</span>
                            </Link>

                            <div className="space-y-1.5 text-center">
                                <h1 className="text-lg font-semibold text-white tracking-tight">
                                    {title}
                                </h1>
                                <p className="text-sm text-[#9CA3AF] leading-relaxed">
                                    {description}
                                </p>
                            </div>
                        </div>

                        {/* Form children */}
                        <div className="[&_input]:bg-white/[0.06] [&_input]:border-white/[0.10] [&_input]:text-white [&_input]:placeholder:text-white/30 [&_input:focus]:border-[#F5C518]/40 [&_input:focus]:ring-[#F5C518]/10 [&_label]:text-[#9CA3AF] [&_label]:text-sm">
                            {children}
                        </div>

                    </div>
                </div>

                {/* Built by */}
                <p className="mt-5 text-center text-[11px] text-white/20">
                    Built by{' '}
                    <a
                        href="https://hamza-rhaidi.vercel.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/40 hover:text-[#F5C518] transition-colors"
                    >
                        Hamza Rhaidi
                    </a>
                </p>
            </div>
        </div>
    );
}
