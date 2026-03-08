import { Head, usePage, Link } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ImportModal } from '@/components/import-modal';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import { Film, Tv, Eye, Clock, Users, TrendingUp, Plus, ArrowRight } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
];

interface Stats {
    total_movies?: number;
    total_series?: number;
    watched?: number;
    to_watch?: number;
    total_users?: number;
    total_watched?: number;
    total_to_watch?: number;
    most_imported?: {
        title: string;
        users_count: number;
    };
}

interface Movie {
    id: number;
    title: string;
    poster: string;
    genre: string;
    year: number;
    type: string;
    imdb_rating?: string;
    user_rating?: number;
}

export default function Dashboard() {
    const { stats, auth, recentToWatch, recentWatched } = usePage<{ 
        stats: Stats; 
        auth: { user: { is_admin: boolean; name: string } };
        recentToWatch?: Movie[];
        recentWatched?: Movie[];
    }>().props;
    
    const isAdmin = auth.user.is_admin;
    const [importModalOpen, setImportModalOpen] = useState(false);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    const statCards = isAdmin ? [
        { icon: Users, label: 'Total Users', value: stats.total_users || 0, color: '#3B82F6' },
        { icon: Film, label: 'Total Movies', value: stats.total_movies || 0, color: '#F97316' },
        { icon: Eye, label: 'Total Watched', value: stats.total_watched || 0, color: '#22C55E' },
        { icon: Clock, label: 'To Watch', value: stats.total_to_watch || 0, color: '#A855F7' },
    ] : [
        { icon: Film, label: 'Movies', value: stats.total_movies || 0, color: '#F97316' },
        { icon: Tv, label: 'Series', value: stats.total_series || 0, color: '#A855F7' },
        { icon: Eye, label: 'Watched', value: stats.watched || 0, color: '#22C55E' },
        { icon: Clock, label: 'To Watch', value: stats.to_watch || 0, color: '#3B82F6' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            
            {/* Main Content */}
            <div className="relative z-10 p-8">
                {/* Greeting Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                        {getGreeting()}, {auth.user.name.split(' ')[0]}!
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        {isAdmin ? 'Overview of all users and movies' : 'Here\'s what\'s happening with your watchlist'}
                    </p>
                </div>

                {/* Stat Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {statCards.map((stat, index) => (
                        <div key={index} className="watchly-stat-card p-6 flex items-center justify-between">
                            <div className="flex items-start justify-between mb-4 ">
                                <div 
                                    className="p-3 rounded-xl"
                                    style={{ 
                                        background: 'var(--gold-bg)',
                                        color: 'var(--gold)'
                                    }}
                                >
                                    <stat.icon className="h-6 w-6" />
                                </div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                                    {stat.value}
                                </div>
                                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                    {stat.label}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Movie Sections - Only for non-admin users */}
                {!isAdmin && (
                    <>
                        {/* Recent To Watch Section */}
                        {recentToWatch && recentToWatch.length > 0 && (
                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <Clock className="h-6 w-6" style={{ color: 'var(--gold)' }} />
                                        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                            Recent To Watch
                                        </h2>
                                    </div>
                                    <Link href="/movies/to-watch">
                                        <button 
                                            className="flex items-center gap-2 text-sm font-medium hover:underline transition-all"
                                            style={{ color: 'var(--gold)' }}
                                        >
                                            View all
                                            <ArrowRight className="h-4 w-4" />
                                        </button>
                                    </Link>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                                    {recentToWatch.slice(0, 5).map((movie) => (
                                        <div key={movie.id} className="watchly-card overflow-hidden cursor-pointer">
                                            <div className="aspect-2/3 bg-neutral-800 relative">
                                                {movie.poster && movie.poster !== 'N/A' ? (
                                                    <img
                                                        src={movie.poster}
                                                        alt={movie.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-4xl">
                                                        🎬
                                                    </div>
                                                )}
                                                <div className="absolute top-2 right-2">
                                                    <span 
                                                        className="px-2 py-1 text-xs font-semibold rounded-lg"
                                                        style={{ 
                                                            background: movie.type === 'movie' ? 'var(--movie)' : 'var(--series)',
                                                            color: 'white'
                                                        }}
                                                    >
                                                        {movie.type}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-bold text-sm mb-1 line-clamp-1" style={{ color: 'var(--text-primary)' }}>
                                                    {movie.title}
                                                </h3>
                                                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                                    {movie.genre?.split(',')[0]} • {movie.year}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recently Watched Section */}
                        {recentWatched && recentWatched.length > 0 && (
                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <Eye className="h-6 w-6" style={{ color: 'var(--gold)' }} />
                                        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                            Recently Watched
                                        </h2>
                                    </div>
                                    <Link href="/movies/watched">
                                        <button 
                                            className="flex items-center gap-2 text-sm font-medium hover:underline transition-all"
                                            style={{ color: 'var(--gold)' }}
                                        >
                                            View all
                                            <ArrowRight className="h-4 w-4" />
                                        </button>
                                    </Link>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                                    {recentWatched.slice(0, 5).map((movie) => (
                                        <div key={movie.id} className="watchly-card overflow-hidden cursor-pointer">
                                            <div className="aspect-2/3 bg-neutral-800 relative">
                                                {movie.poster && movie.poster !== 'N/A' ? (
                                                    <img
                                                        src={movie.poster}
                                                        alt={movie.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-4xl">
                                                        🎬
                                                    </div>
                                                )}
                                                {movie.user_rating && (
                                                    <div className="absolute top-2 right-2">
                                                        <span 
                                                            className="px-2 py-1 text-xs font-bold rounded-lg"
                                                            style={{ 
                                                                background: 'var(--gold)',
                                                                color: '#0D1117'
                                                            }}
                                                        >
                                                            {movie.user_rating}/10
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-bold text-sm mb-1 line-clamp-1" style={{ color: 'var(--text-primary)' }}>
                                                    {movie.title}
                                                </h3>
                                                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                                    {movie.genre?.split(',')[0]} • {movie.year}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Admin Most Popular */}
                {isAdmin && stats.most_imported && (
                    <div className="watchly-stat-card p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div 
                                className="p-3 rounded-xl"
                                style={{ 
                                    background: 'var(--gold-bg)',
                                    color: 'var(--gold)'
                                }}
                            >
                                <TrendingUp className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                Most Popular Movie
                            </h3>
                        </div>
                        <div className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {stats.most_imported.title}
                        </div>
                        <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                            Added by {stats.most_imported.users_count} users
                        </div>
                    </div>
                )}
            </div>

            {/* Floating Action Button */}
            {!isAdmin && (
                <button 
                    onClick={() => setImportModalOpen(true)}
                    className="watchly-fab"
                    aria-label="Add movie"
                >
                    <Plus className="h-6 w-6 text-black" />
                </button>
            )}

            <ImportModal open={importModalOpen} onClose={() => setImportModalOpen(false)} />
        </AppLayout>
    );
}
