import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import {
    Play,
    Film,
    Tv,
    Star,
    CheckCircle,
    Clock,
    ArrowRight,
    Import,
    BarChart3,
    ExternalLink,
    Sparkles,
} from 'lucide-react';

export default function Welcome({ canRegister = true }: { canRegister?: boolean }) {
    const { auth } = usePage().props as any;

    const movies = [
        {
            title: 'Inception',
            genre: 'Sci-Fi',
            year: '2010',
            rating: '8.8',
            hue: '210',
            poster: 'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg',
        },
        {
            title: 'The Dark Knight',
            genre: 'Action',
            year: '2008',
            rating: '9.0',
            hue: '240',
            poster: 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg',
        },
        {
            title: 'Interstellar',
            genre: 'Sci-Fi',
            year: '2014',
            rating: '8.6',
            hue: '200',
            poster: 'https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg',
        },
        {
            title: 'Dune: Part Two',
            genre: 'Sci-Fi',
            year: '2024',
            rating: '8.5',
            hue: '30',
            poster: 'data:image/jpeg;base64,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',
        },
        {
            title: 'Oppenheimer',
            genre: 'Drama',
            year: '2023',
            rating: '8.9',
            hue: '20',
            poster: 'https://m.media-amazon.com/images/M/MV5BMDBmYTZjNjUtN2M1MS00MTQ2LTk2ODgtNzc2M2QyZGE5NTVjXkEyXkFqcGdeQXVyNzAwMjU2MTY@._V1_SX300.jpg',
        },
        {
            title: 'Poor Things',
            genre: 'Comedy',
            year: '2023',
            rating: '8.1',
            hue: '270',
            poster: 'data:image/jpeg;base64,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',
        },
    ];

    const features = [
        {
            icon: <Import className="w-5 h-5 text-[#F5C518]" />,
            title: 'Import from IMDB',
            desc: 'Paste an IMDB URL or search by title. Poster, rating, plot and cast auto-fetched instantly.',
        },
        {
            icon: <Star className="w-5 h-5 text-[#F5C518]" />,
            title: 'Your Own Rating',
            desc: 'Rate every film on your personal scale. Your taste, your score — not the crowd\'s.',
        },
        {
            icon: <BarChart3 className="w-5 h-5 text-[#F5C518]" />,
            title: 'Stats at a Glance',
            desc: 'Movies vs series, watched vs queued — all visible from a beautiful cinema dashboard.',
        },
    ];

    return (
        <>
            <Head title="Watchly — Your Cinema Universe">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400;1,600&family=DM+Sans:wght@300;400;500&display=swap"
                    rel="stylesheet"
                />
                <style>{`
                    .font-display { font-family: 'Cormorant Garamond', serif; }
                    .font-body    { font-family: 'DM Sans', sans-serif; }
                    @keyframes float {
                        0%, 100% { transform: translateY(0px); }
                        50%      { transform: translateY(-8px); }
                    }
                    @keyframes fadeUp {
                        from { opacity: 0; transform: translateY(20px); }
                        to   { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes pulse-dot {
                        0%, 100% { opacity: 1; transform: scale(1); }
                        50%      { opacity: 0.4; transform: scale(0.75); }
                    }
                    .anim-1 { animation: fadeUp 0.65s ease both; }
                    .anim-2 { animation: fadeUp 0.65s 0.12s ease both; }
                    .anim-3 { animation: fadeUp 0.65s 0.24s ease both; }
                    .anim-4 { animation: fadeUp 0.65s 0.36s ease both; }
                    .anim-5 { animation: fadeUp 0.65s 0.48s ease both; }
                    .card-float { animation: float 5s ease-in-out infinite; }
                    .pulse-dot  { animation: pulse-dot 2s ease-in-out infinite; }
                    .card-float:nth-child(2) { animation-delay: -0.8s; }
                    .card-float:nth-child(3) { animation-delay: -1.6s; }
                    .card-float:nth-child(4) { animation-delay: -2.4s; }
                    .card-float:nth-child(5) { animation-delay: -3.2s; }
                    .card-float:nth-child(6) { animation-delay: -4.0s; }
                `}</style>
            </Head>

            {/* PAGE WRAPPER */}
            <div className="font-body min-h-screen bg-[#070B14] text-[#F9FAFB] overflow-x-hidden relative">

                {/* Ambient background glows */}
                <div className="pointer-events-none fixed inset-0 z-0">
                    <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-[#F5C518] opacity-[0.04] blur-[120px]" />
                    <div className="absolute bottom-[10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-[#3B82F6] opacity-[0.05] blur-[100px]" />
                    <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#A855F7] opacity-[0.02] blur-[140px]" />
                </div>

                {/* ── NAV ── */}
                <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-12 py-4 bg-[#070B14]/80 backdrop-blur-xl border-b border-white/[0.06]">

                    {/* Logo */}
                    <div className="flex items-center gap-2.5">
                        <img src="/images/Watchly.png" className='w-18' alt="Watchly" />
                    </div>

                    {/* Auth links */}
                    <div className="flex items-center gap-3">
                        {auth?.user ? (
                            <Link
                                href={dashboard()}
                                className="flex items-center gap-2 bg-[#F5C518] text-[#0D0A00] text-sm font-medium px-5 py-2 rounded-xl transition-all hover:bg-[#ffd700] hover:shadow-[0_0_20px_rgba(245,197,24,0.4)] hover:-translate-y-px"
                            >
                                Dashboard
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="text-sm text-[#9CA3AF] hover:text-white px-4 py-2 rounded-xl border border-white/10 hover:border-[#F5C518]/30 hover:bg-[#F5C518]/5 transition-all"
                                >
                                    Sign in
                                </Link>
                                {canRegister && (
                                    <Link
                                        href={register()}
                                        className="flex items-center gap-2 bg-[#F5C518] text-[#0D0A00] text-sm font-medium px-5 py-2 rounded-xl transition-all hover:bg-[#ffd700] hover:shadow-[0_0_20px_rgba(245,197,24,0.4)] hover:-translate-y-px"
                                    >
                                        Get Started
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                )}
                            </>
                        )}
                    </div>
                </nav>

                {/* ── HERO ── */}
                <section className="relative z-10 pt-32 pb-20 px-6 lg:px-12 max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">

                        {/* Left: copy */}
                        <div>
                            {/* Eyebrow */}
                            <div className="anim-1 inline-flex items-center gap-2 bg-[#F5C518]/10 border border-[#F5C518]/20 rounded-full px-4 py-1.5 mb-7">
                                <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-[#F5C518]" />
                                <span className="text-[#F5C518] text-xs font-medium tracking-widest uppercase">
                                    Your personal cinema universe
                                </span>
                            </div>

                            {/* Headline */}
                            <h1 className="anim-2 font-display text-[clamp(48px,5vw,72px)] font-light leading-[1.05] tracking-tight text-white mb-6">
                                Every film you've{' '}
                                <br />
                                <em className="text-[#F5C518] not-italic font-normal">lived through</em>,
                                <br />
                                remembered.
                            </h1>

                            {/* Subtitle */}
                            <p className="anim-3 text-[#9CA3AF] text-base leading-relaxed font-light mb-10 max-w-md">
                                Import from IMDB, track what you've watched, rate on your own scale.
                                Your movies, your story — beautifully organized.
                            </p>

                            {/* CTAs */}
                            <div className="anim-4 flex flex-wrap items-center gap-3 mb-14">
                                <Link
                                    href={canRegister ? register() : login()}
                                    className="flex items-center gap-2.5 bg-[#F5C518] text-[#0D0A00] font-medium px-7 py-3.5 rounded-xl text-sm transition-all hover:bg-[#ffd700] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(245,197,24,0.4)]"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    Start for free
                                </Link>
                                <Link
                                    href={login()}
                                    className="flex items-center gap-2.5 bg-white/[0.04] border border-white/10 text-[#9CA3AF] hover:text-white hover:border-[#F5C518]/30 hover:bg-[#F5C518]/5 font-medium px-7 py-3.5 rounded-xl text-sm transition-all backdrop-blur-sm"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Sign in
                                </Link>
                            </div>

                            
                        </div>

                        {/* Right: movie card grid */}
                        <div className="hidden lg:block">
                            <div
                                className="grid grid-cols-3 gap-3"
                                style={{ transform: 'perspective(900px) rotateY(-10deg) rotateX(4deg)', transformOrigin: 'right center' }}
                            >
                                {movies.map((m, i) => (
                                    <div
                                        key={i}
                                        className="card-float relative rounded-xl overflow-hidden border border-white/[0.08] hover:border-[#F5C518]/40 transition-colors cursor-default"
                                        style={{ aspectRatio: '2/3', background: `hsl(${m.hue} 40% 8%)` }}
                                    >
                                        {/* Poster image */}
                                        <img
                                            src={m.poster}
                                            alt={m.title}
                                            className="absolute inset-0 w-full h-full object-cover"
                                            loading="lazy"
                                        />

                                        {/* Scan lines */}
                                        <div
                                            className="absolute inset-0 opacity-10 z-[1]"
                                            style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.04) 3px, rgba(255,255,255,0.04) 4px)' }}
                                        />
                                        {/* Bottom fade */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10 z-[2]" />

                                        {/* Rating badge */}
                                        <div className="absolute top-2 right-2 z-10 bg-[#F5C518]/90 text-[#0D0A00] text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                                            <Star className="w-2 h-2 fill-[#0D0A00]" />
                                            {m.rating}
                                        </div>

                                        {/* Info */}
                                        <div className="absolute bottom-0 left-0 right-0 p-2.5 z-10">
                                            <p className="text-[10px] font-medium text-white leading-tight mb-0.5 truncate">{m.title}</p>
                                            <p className="text-[9px] text-white/40">{m.genre} · {m.year}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Divider */}
                <div className="relative z-10 mx-6 lg:mx-12 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />

                {/* ── FEATURES ── */}
                <section className="relative z-10 py-20 px-6 lg:px-12 max-w-7xl mx-auto">
                    <p className="text-center text-[10px] uppercase tracking-[0.3em] text-[#F5C518] font-medium mb-3">
                        Why Watchly
                    </p>
                    <h2 className="font-display text-[clamp(32px,3.5vw,48px)] font-light text-center text-white mb-14 tracking-tight">
                        Everything your watchlist needs
                    </h2>

                    <div className="grid md:grid-cols-3 gap-5">
                        {features.map((f) => (
                            <div
                                key={f.title}
                                className="group relative bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.07] hover:border-[#F5C518]/25 rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
                            >
                                {/* Top gold line on hover */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 group-hover:w-24 h-px bg-gradient-to-r from-transparent via-[#F5C518] to-transparent transition-all duration-500" />

                                <div className="w-11 h-11 rounded-xl bg-[#F5C518]/10 border border-[#F5C518]/20 flex items-center justify-center mb-6">
                                    {f.icon}
                                </div>
                                <h3 className="font-display text-xl font-semibold text-white mb-3 tracking-tight">
                                    {f.title}
                                </h3>
                                <p className="text-[#9CA3AF] text-sm leading-relaxed font-light">
                                    {f.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Divider */}
                <div className="relative z-10 mx-6 lg:mx-12 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />

                {/* ── MINI FEATURE STRIP ── */}
                <section className="relative z-10 py-12 px-6 lg:px-12 max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { icon: <Film className="w-4 h-4" />, label: 'Track Movies' },
                            { icon: <Tv className="w-4 h-4" />, label: 'Track Series' },
                            { icon: <Clock className="w-4 h-4" />, label: 'Watchlist Queue' },
                            { icon: <CheckCircle className="w-4 h-4" />, label: 'Mark as Watched' },
                        ].map((item) => (
                            <div
                                key={item.label}
                                className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3"
                            >
                                <span className="text-[#F5C518]">{item.icon}</span>
                                <span className="text-sm text-[#9CA3AF] font-light">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── CTA CARD ── */}
                <section className="relative z-10 px-6 lg:px-12 pb-24 max-w-7xl mx-auto">
                    <div className="relative bg-white/[0.03] border border-white/[0.08] rounded-3xl p-12 lg:p-20 text-center overflow-hidden">
                        {/* Top gold line */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-[#F5C518] to-transparent" />
                        {/* Radial glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-48 bg-[#F5C518]/[0.04] blur-3xl rounded-full pointer-events-none" />

                        <h2 className="font-display text-[clamp(36px,4vw,56px)] font-light text-white mb-4 tracking-tight leading-tight">
                            Your cinema,{' '}
                            <em className="text-[#F5C518] not-italic">curated by you.</em>
                        </h2>
                        <p className="text-[#9CA3AF] text-base font-light mb-10 max-w-md mx-auto leading-relaxed">
                            Join Watchly and start building your personal movie universe today.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            {canRegister ? (
                                <Link
                                    href={register()}
                                    className="flex items-center gap-2.5 bg-[#F5C518] text-[#0D0A00] font-medium px-8 py-3.5 rounded-xl text-sm transition-all hover:bg-[#ffd700] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(245,197,24,0.45)]"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    Create free account
                                </Link>
                            ) : (
                                <Link
                                    href={login()}
                                    className="flex items-center gap-2.5 bg-[#F5C518] text-[#0D0A00] font-medium px-8 py-3.5 rounded-xl text-sm transition-all hover:bg-[#ffd700] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(245,197,24,0.45)]"
                                >
                                    Sign in to Watchly
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            )}
                        </div>
                    </div>
                </section>

                {/* ── FOOTER ── */}
                <footer className="relative z-10 border-t border-white/[0.06] px-6 lg:px-12 py-6 flex flex-col md:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-md bg-[#F5C518] flex items-center justify-center">
                            <Play className="w-2.5 h-2.5 text-[#0D0A00] fill-[#0D0A00]" />
                        </div>
                        <span className="font-display text-sm text-[#9CA3AF]">Watchly</span>
                    </div>

                    <p className="text-[11px] text-[#4B5563]">
                        © {new Date().getFullYear()} Watchly · Built with Laravel & Inertia.js
                    </p>

                    <a
                        href="https://hamza-rhaidi.vercel.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-[11px] text-[#4B5563] hover:text-[#F5C518] transition-colors group"
                    >
                        Built by{' '}
                        <span className="text-[#9CA3AF] group-hover:text-[#F5C518] transition-colors font-medium">
                            Hamza Rhaidi
                        </span>
                        <ExternalLink className="w-3 h-3" />
                    </a>
                </footer>
            </div>
        </>
    );
}