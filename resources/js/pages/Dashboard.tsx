import { Head, usePage, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImportModal } from '@/components/import-modal';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import { Film, Tv, Eye, Clock, Users, TrendingUp, Plus, ArrowRight } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
];

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

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

interface WatchStats {
    daily: Array<{ date: string; movies: number; series: number }>;
    monthly: Array<{ month: string; movies: number; series: number }>;
    yearly: Array<{ year: string; movies: number; series: number }>;
    custom: Array<{ date: string; movies: number; series: number }>;
}

export default function Dashboard() {
    const { stats, auth, recentToWatch, recentWatched, watchStats } = usePage<{ 
        stats: Stats; 
        auth: { user: { is_admin: boolean; name: string } };
        recentToWatch?: Movie[];
        recentWatched?: Movie[];
        watchStats?: WatchStats;
    }>().props;
    
    const isAdmin = auth.user.is_admin;
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [chartView, setChartView] = useState<'daily' | 'monthly' | 'yearly' | 'custom'>('daily');
    const [customFrom, setCustomFrom] = useState('');
    const [customTo, setCustomTo] = useState('');
    const [showCustomInputs, setShowCustomInputs] = useState(false);

    const handleChartViewChange = (view: 'daily' | 'monthly' | 'yearly' | 'custom') => {
        setChartView(view);
        if (view === 'custom') {
            setShowCustomInputs(true);
        } else {
            setShowCustomInputs(false);
        }
    };

    const handleApplyCustomRange = () => {
        if (customFrom && customTo) {
            router.get('/dashboard', { from: customFrom, to: customTo }, { preserveScroll: true });
        }
    };

    const getChartData = () => {
        if (!watchStats) return { labels: [], datasets: [] };

        let data: Array<{ date?: string; month?: string; year?: string; movies: number; series: number }> = [];
        let labels: string[] = [];

        switch (chartView) {
            case 'daily':
                data = watchStats.daily || [];
                labels = data.map(d => {
                    if (!d.date) return '';
                    const date = new Date(d.date);
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                });
                break;
            case 'monthly':
                data = watchStats.monthly || [];
                labels = data.map(d => {
                    if (!d.month) return '';
                    const [year, month] = d.month.split('-');
                    const date = new Date(parseInt(year), parseInt(month) - 1);
                    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
                });
                break;
            case 'yearly':
                data = watchStats.yearly || [];
                labels = data.map(d => d.year || '');
                break;
            case 'custom':
                data = watchStats.custom || [];
                labels = data.map(d => {
                    if (!d.date) return '';
                    const date = new Date(d.date);
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                });
                break;
        }

        return {
            labels,
            datasets: [
                {
                    label: 'Movies',
                    data: data.map(d => d.movies),
                    borderColor: '#F5C518',
                    backgroundColor: 'rgba(245, 197, 24, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#F5C518',
                    pointBorderColor: '#F5C518',
                },
                {
                    label: 'Series',
                    data: data.map(d => d.series),
                    borderColor: '#60a5fa',
                    backgroundColor: 'rgba(96, 165, 250, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#60a5fa',
                    pointBorderColor: '#60a5fa',
                },
            ],
        };
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                align: 'end' as const,
                labels: {
                    color: '#9CA3AF',
                    usePointStyle: true,
                    padding: 15,
                },
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#F5C518',
                bodyColor: '#E5E7EB',
                borderColor: '#374151',
                borderWidth: 1,
                padding: 12,
                displayColors: true,
                callbacks: {
                    label: function(context: any) {
                        return `${context.dataset.label}: ${context.parsed.y}`;
                    }
                }
            },
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                },
                ticks: {
                    color: '#6B7280',
                },
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                },
                ticks: {
                    color: '#6B7280',
                    precision: 0,
                },
            },
        },
    };

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

    <div className="relative z-10 p-4 sm:p-8">

        {/* Greeting */}
        <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-4xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                {getGreeting()}, {auth.user.name.split(' ')[0]}!
            </h1>
            <p className="text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>
                {isAdmin ? 'Overview of all users and movies' : "Here's what's happening with your watchlist"}
            </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {statCards.map((stat, index) => (
                <div key={index} className="watchly-stat-card p-4 sm:p-6 flex items-center justify-between">
                    <div
                        className="p-2 sm:p-3 rounded-xl"
                        style={{ background: 'var(--gold-bg)', color: 'var(--gold)' }}
                    >
                        <stat.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div className="text-right">
                        <div className="text-2xl sm:text-3xl font-bold mb-0.5" style={{ color: 'var(--text-primary)' }}>
                            {stat.value}
                        </div>
                        <div className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {stat.label}
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {!isAdmin && (
            <>
                {/* Recent To Watch */}
                {/* {recentToWatch && recentToWatch.length > 0 && (
                    <div className="mb-6 sm:mb-8">
                        <div className="flex items-center justify-between mb-4 sm:mb-6">
                            <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: 'var(--gold)' }} />
                                <h2 className="text-lg sm:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                    Recent To Watch
                                </h2>
                            </div>
                            <Link href="/movies/to-watch">
                                <button className="flex items-center gap-1 text-xs sm:text-sm font-medium hover:underline" style={{ color: 'var(--gold)' }}>
                                    View all <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </button>
                            </Link>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5">
                            {recentToWatch.slice(0, 5).map((movie) => (
                                <div key={movie.id} className="watchly-card overflow-hidden cursor-pointer">
                                    <div className="aspect-2/3 bg-neutral-800 relative">
                                        {movie.poster && movie.poster !== 'N/A' ? (
                                            <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-3xl">🎬</div>
                                        )}
                                        <div className="absolute top-1.5 right-1.5">
                                            <span
                                                className="px-1.5 py-0.5 text-xs font-semibold rounded"
                                                style={{
                                                    background: movie.type === 'movie' ? 'var(--movie)' : 'var(--series)',
                                                    color: 'white'
                                                }}
                                            >
                                                {movie.type}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-2 sm:p-3">
                                        <h3 className="font-bold text-xs sm:text-sm mb-0.5 line-clamp-1" style={{ color: 'var(--text-primary)' }}>
                                            {movie.title}
                                        </h3>
                                        <p className="text-xs hidden sm:block" style={{ color: 'var(--text-secondary)' }}>
                                            {movie.genre?.split(',')[0]} • {movie.year}
                                        </p>
                                        <p className="text-xs sm:hidden" style={{ color: 'var(--text-secondary)' }}>
                                            {movie.year}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )} */}

                {/* Chart + Recent To Watch List — two column */}
                {watchStats && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">

                        {/* Chart */}
                        <div className="lg:col-span-2 watchly-card p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
                                <h2 className="text-lg sm:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                    Watch Activity
                                </h2>
                                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                    {[
                                        { key: 'daily', label: 'Per Day' },
                                        { key: 'monthly', label: 'Per Month' },
                                        { key: 'yearly', label: 'Per Year' },
                                        { key: 'custom', label: 'Custom' },
                                    ].map(({ key, label }) => (
                                        <Button
                                            key={key}
                                            size="sm"
                                            onClick={() => handleChartViewChange(key)}
                                            className="text-xs sm:text-sm"
                                            style={
                                                chartView === key
                                                    ? { background: 'var(--gold)', color: '#0D1117' }
                                                    : { border: '1px solid var(--card-border)', background: 'transparent', color: 'var(--text-primary)' }
                                            }
                                        >
                                            {label}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {showCustomInputs && (
                                <div className="flex flex-col sm:flex-row gap-2 mb-4 sm:mb-6">
                                    <Input
                                        type="date"
                                        value={customFrom}
                                        onChange={(e) => setCustomFrom(e.target.value)}
                                        style={{ borderColor: 'var(--card-border)', color: 'var(--text-primary)' }}
                                    />
                                    <Input
                                        type="date"
                                        value={customTo}
                                        onChange={(e) => setCustomTo(e.target.value)}
                                        style={{ borderColor: 'var(--card-border)', color: 'var(--text-primary)' }}
                                    />
                                    <Button
                                        onClick={handleApplyCustomRange}
                                        disabled={!customFrom || !customTo}
                                        className="flex-shrink-0"
                                        style={{ background: 'var(--gold)', color: '#0D1117' }}
                                    >
                                        Apply
                                    </Button>
                                </div>
                            )}

                            <div className="border-t pt-4 sm:pt-6" style={{ borderColor: 'var(--card-border)' }}>
                                <div className="h-[220px] sm:h-[300px]">
                                    <Line data={getChartData()} options={chartOptions} />
                                </div>
                            </div>
                        </div>

                        {/* Recent To Watch List */}
                        {recentToWatch && recentToWatch.length > 0 && (
                            <div className="watchly-card p-4 sm:p-6 flex flex-col">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-base sm:text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                                        Up Next
                                    </h2>
                                    <Link href="/movies/to-watch">
                                        <button className="text-xs hover:underline" style={{ color: 'var(--gold)' }}>
                                            View all
                                        </button>
                                    </Link>
                                </div>
                                <div className="flex flex-col gap-3 flex-1">
                                    {recentToWatch.slice(0, 3).map((movie) => (
                                        <div key={movie.id} className="flex gap-3 items-start">
                                            <div className="w-10 h-14 sm:w-12 sm:h-16 bg-neutral-800 rounded overflow-hidden flex-shrink-0 relative">
                                                {movie.poster && movie.poster !== 'N/A' ? (
                                                    <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-lg">🎬</div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-xs sm:text-sm line-clamp-1 mb-0.5" style={{ color: 'var(--text-primary)' }}>
                                                    {movie.title}
                                                </h4>
                                                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                                    {movie.year}
                                                </p>
                                                <span
                                                    className="text-xs px-1.5 py-0.5 rounded mt-1 inline-block"
                                                    style={{
                                                        background: movie.type === 'movie' ? 'var(--movie)' : 'var(--series)',
                                                        color: 'white'
                                                    }}
                                                >
                                                    {movie.type}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Recently Watched */}
                {recentWatched && recentWatched.length > 0 && (
                    <div className="mb-6 sm:mb-8">
                        <div className="flex items-center justify-between mb-4 sm:mb-6">
                            <div className="flex items-center gap-2">
                                <Eye className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: 'var(--gold)' }} />
                                <h2 className="text-lg sm:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                    Recently Watched
                                </h2>
                            </div>
                            <Link href="/movies/watched">
                                <button className="flex items-center gap-1 text-xs sm:text-sm font-medium hover:underline" style={{ color: 'var(--gold)' }}>
                                    View all <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </button>
                            </Link>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5">
                            {recentWatched.slice(0, 5).map((movie) => (
                                <div key={movie.id} className="watchly-card overflow-hidden cursor-pointer">
                                    <div className="aspect-2/3 bg-neutral-800 relative">
                                        {movie.poster && movie.poster !== 'N/A' ? (
                                            <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-3xl">🎬</div>
                                        )}
                                        {movie.user_rating && (
                                            <div className="absolute top-1.5 right-1.5">
                                                <span
                                                    className="px-1.5 py-0.5 text-xs font-bold rounded"
                                                    style={{ background: 'var(--gold)', color: '#0D1117' }}
                                                >
                                                    {movie.user_rating}/10
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-2 sm:p-3">
                                        <h3 className="font-bold text-xs sm:text-sm mb-0.5 line-clamp-1" style={{ color: 'var(--text-primary)' }}>
                                            {movie.title}
                                        </h3>
                                        <p className="text-xs hidden sm:block" style={{ color: 'var(--text-secondary)' }}>
                                            {movie.genre?.split(',')[0]} • {movie.year}
                                        </p>
                                        <p className="text-xs sm:hidden" style={{ color: 'var(--text-secondary)' }}>
                                            {movie.year}
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
            <div className="watchly-stat-card p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 sm:p-3 rounded-xl" style={{ background: 'var(--gold-bg)', color: 'var(--gold)' }}>
                        <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        Most Popular Movie
                    </h3>
                </div>
                <div className="text-base sm:text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {stats.most_imported.title}
                </div>
                <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                    Added by {stats.most_imported.users_count} users
                </div>
            </div>
        )}
    </div>

    {/* FAB */}
    {!isAdmin && (
        <button onClick={() => setImportModalOpen(true)} className="watchly-fab" aria-label="Add movie">
            <Plus className="h-6 w-6 text-black" />
        </button>
    )}

    <ImportModal open={importModalOpen} onClose={() => setImportModalOpen(false)} />
</AppLayout>
    );
}
