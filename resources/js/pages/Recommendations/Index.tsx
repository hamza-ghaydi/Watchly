import { Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Flame, Heart, Zap, Moon, Meh, Smile, Frown } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Community Picks', href: '/recommendations' },
];

interface Movie {
    id: number;
    imdb_id: string;
    title: string;
    year: number;
    type: string;
    poster: string;
    genre: string;
    imdb_rating: string;
}

interface Recommendation {
    movie: Movie;
    recommenders: Array<{ id: number; name: string; avatar: string | null }>;
    recommenders_label: string;
    others_names: string[];
    latest_note: string | null;
    total_recommenders: number;
    reaction_counts: { fire: number; heart: number; mind_blown: number; };
    user_already_recommended: boolean;
    user_reaction: string | null;
    recommendation_id: number;
    can_add_to_watchlist: boolean;
    already_watched: boolean;
}

export default function Index() {
    const { recommendations, sort } = usePage<{
        recommendations: { data: Recommendation[]; current_page: number; last_page: number };
        sort: string;
    }>().props;

    const [localRecs, setLocalRecs] = useState(recommendations.data);

    // Update local state when recommendations change from server
    useEffect(() => {
        setLocalRecs(recommendations.data);
    }, [recommendations.data]);

    const handleSort = (newSort: string) => {
        router.get('/recommendations', { sort: newSort }, { 
            preserveScroll: true,
        });
    };

    const handleReaction = async (recIndex: number, type: string, recommendationId: number) => {
        const rec = localRecs[recIndex];
        const prevReaction = rec.user_reaction;
        const prevCounts = { ...rec.reaction_counts };

        // Optimistic update
        const newRecs = [...localRecs];
        if (prevReaction === type) {
            // Toggle off
            newRecs[recIndex].user_reaction = null;
            newRecs[recIndex].reaction_counts = {
                ...newRecs[recIndex].reaction_counts,
                [type]: Math.max(0, newRecs[recIndex].reaction_counts[type as keyof typeof prevCounts] - 1)
            };
        } else {
            // Change or add reaction
            if (prevReaction) {
                newRecs[recIndex].reaction_counts = {
                    ...newRecs[recIndex].reaction_counts,
                    [prevReaction]: Math.max(0, newRecs[recIndex].reaction_counts[prevReaction as keyof typeof prevCounts] - 1)
                };
            }
            newRecs[recIndex].user_reaction = type;
            newRecs[recIndex].reaction_counts = {
                ...newRecs[recIndex].reaction_counts,
                [type]: newRecs[recIndex].reaction_counts[type as keyof typeof prevCounts] + 1
            };
        }
        setLocalRecs(newRecs);

        try {
            const response = await axios.post('/reactions/toggle', {
                recommendation_id: recommendationId,
                type,
            });
            // Update with server response
            newRecs[recIndex].reaction_counts = response.data.reaction_counts;
            newRecs[recIndex].user_reaction = response.data.user_reaction;
            setLocalRecs([...newRecs]);
        } catch (error: any) {
            console.error('Reaction error:', error.response?.data);
            // Revert on error
            newRecs[recIndex].user_reaction = prevReaction;
            newRecs[recIndex].reaction_counts = prevCounts;
            setLocalRecs([...newRecs]);
        }
    };

    const handleAddToWatchlist = (movieId: number, index: number) => {
        const newRecs = [...localRecs];
        newRecs[index].can_add_to_watchlist = false;
        setLocalRecs(newRecs);

        router.post('/movies/from-recommendation', { movie_id: movieId });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Community Picks" />
            <div className="relative z-10 flex h-full flex-1 flex-col gap-6 p-4 sm:p-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        Community Picks
                    </h1>
                    <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
                        Movies and series recommended by the Watchly community
                    </p>
                </div>

                <div className="flex gap-2 flex-wrap">
                    <Button
                        variant={sort === 'most_recommended' ? 'default' : 'outline'}
                        onClick={() => handleSort('most_recommended')}
                        className="text-xs sm:text-sm"
                        style={
                            sort === 'most_recommended'
                                ? { background: 'var(--gold)', color: '#0D1117' }
                                : { borderColor: 'var(--card-border)' }
                        }
                    >
                        Most Recommended
                    </Button>
                    <Button
                        variant={sort === 'most_recent' ? 'default' : 'outline'}
                        onClick={() => handleSort('most_recent')}
                        className="text-xs sm:text-sm"
                        style={
                            sort === 'most_recent'
                                ? { background: 'var(--gold)', color: '#0D1117' }
                                : { borderColor: 'var(--card-border)' }
                        }
                    >
                        Most Recent
                    </Button>
                    <Button
                        variant={sort === 'highest_rated' ? 'default' : 'outline'}
                        onClick={() => handleSort('highest_rated')}
                        className="text-xs sm:text-sm"
                        style={
                            sort === 'highest_rated'
                                ? { background: 'var(--gold)', color: '#0D1117' }
                                : { borderColor: 'var(--card-border)' }
                        }
                    >
                        Highest Rated
                    </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5">
                    {localRecs.map((rec, index) => (
                        <div key={rec.movie.id} className="watchly-card overflow-hidden">
                            <div className="aspect-2/3 overflow-hidden relative">
                                {rec.movie.poster && rec.movie.poster !== 'N/A' ? (
                                    <img src={rec.movie.poster} alt={rec.movie.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl">🎬</div>
                                )}
                                <div className="absolute top-2 right-2">
                                    <span
                                        className="px-2 py-1 text-xs font-bold rounded-lg"
                                        style={{ background: 'var(--gold)', color: '#0D1117' }}
                                    >
                                        ⭐ {rec.movie.imdb_rating}
                                    </span>
                                </div>
                            </div>
                            <div className="p-2 sm:p-4">
                                <h3 className="font-bold text-xs sm:text-sm mb-1 line-clamp-2" style={{ color: 'var(--text-primary)' }}>
                                    {rec.movie.title}
                                </h3>
                                <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
                                    {rec.movie.genre?.split(',')[0]} · {rec.movie.year}
                                </p>
                                <div className="border-t pt-2 mb-2" style={{ borderColor: 'var(--card-border)' }}>
                                    <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                                        Recommended by:{' '}
                                        {rec.others_names.length > 0 ? (
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <span className="cursor-help" style={{ color: 'var(--gold)' }}>
                                                            {rec.recommenders_label}
                                                        </span>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{rec.others_names.join(', ')}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        ) : (
                                            <span style={{ color: 'var(--gold)' }}>{rec.recommenders_label}</span>
                                        )}
                                    </p>
                                    {rec.latest_note && (
                                        <p className="text-xs italic mb-2 hidden sm:block" style={{ color: 'var(--text-secondary)' }}>
                                            "{rec.latest_note.substring(0, 80)}{rec.latest_note.length > 80 ? '...' : ''}"
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-1 sm:gap-2 mb-3">
                                    {[
                                        { type: 'fire', icon: Flame, emoji: <Smile /> },
                                        { type: 'heart', icon: Heart, emoji: <Meh /> },
                                        { type: 'mind_blown', icon: Zap, emoji: <Frown /> },
                                    ].map(({ type, emoji }) => (
                                        <button
                                            key={type}
                                            onClick={() => handleReaction(index, type, rec.recommendation_id)}
                                            className="flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded text-xs flex-1 justify-center"
                                            style={{
                                                background: rec.user_reaction === type ? 'var(--gold)' : 'transparent',
                                                border: `1px solid ${rec.user_reaction === type ? 'var(--gold)' : 'var(--card-border)'}`,
                                                color: rec.user_reaction === type ? '#0D1117' : 'var(--text-secondary)',
                                            }}
                                        >
                                            {emoji} {rec.reaction_counts[type as keyof typeof rec.reaction_counts]}
                                        </button>
                                    ))}
                                </div>
                                {rec.can_add_to_watchlist && !rec.already_watched && (
                                    <Button
                                        size="sm"
                                        onClick={() => handleAddToWatchlist(rec.movie.id, index)}
                                        className="w-full text-black text-xs"
                                        style={{ background: 'var(--gold)' }}
                                    >
                                        + Add to Watchlist
                                    </Button>
                                )}
                                {!rec.can_add_to_watchlist && !rec.already_watched && (
                                    <Button size="sm" disabled className="w-full text-xs" style={{ opacity: 0.5 }}>
                                        In your list
                                    </Button>
                                )}
                                {rec.already_watched && (
                                    <Button size="sm" disabled className="w-full text-xs" style={{ opacity: 0.5 }}>
                                        Already watched
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
