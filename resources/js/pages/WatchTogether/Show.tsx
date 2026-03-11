import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import axios from 'axios';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { ImportModal } from '@/components/import-modal';
import { Copy, ThumbsUp, ThumbsDown, Check, LogOut, Plus } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';

interface Member {
    id: number;
    name: string;
    avatar: string | null;
    role: string;
}

interface Movie {
    id: number;
    imdb_id: string;
    title: string;
    year: number;
    type: string;
    poster: string;
    genre: string;
    imdb_rating: string;
    status: string;
    watched_at: string | null;
    added_by: Member;
    vote_summary: {
        up: number;
        down: number;
        user_vote: string | null;
    };
    meta: any;
}

interface Room {
    id: number;
    name: string;
    invite_code: string | null;
}

export default function Show({
    room,
    members,
    to_watch,
    watched,
}: {
    room: Room;
    members: Member[];
    to_watch: Movie[];
    watched: Movie[];
}) {
    const { auth } = usePage().props as any;
    const currentUserId = auth?.user?.id;
    
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Watch Together', href: '/watch-together' },
        { title: room.name, href: `/watch-together/${room.id}` },
    ];

    const [importModalOpen, setImportModalOpen] = useState(false);
    const [localToWatch, setLocalToWatch] = useState(to_watch);
    const [copiedCode, setCopiedCode] = useState(false);

    const handleCopyCode = () => {
        if (room.invite_code) {
            navigator.clipboard.writeText(room.invite_code);
            setCopiedCode(true);
            setTimeout(() => setCopiedCode(false), 2000);
        }
    };

    const handleVote = async (movieId: number, vote: string, index: number) => {
        const prevVote = localToWatch[index].vote_summary.user_vote;
        const prevCounts = { ...localToWatch[index].vote_summary };

        // Optimistic update
        const newMovies = [...localToWatch];
        if (prevVote === vote) {
            newMovies[index].vote_summary.user_vote = null;
            newMovies[index].vote_summary[vote as 'up' | 'down']--;
        } else {
            if (prevVote) {
                newMovies[index].vote_summary[prevVote as 'up' | 'down']--;
            }
            newMovies[index].vote_summary.user_vote = vote;
            newMovies[index].vote_summary[vote as 'up' | 'down']++;
        }
        setLocalToWatch(newMovies);

        try {
            const response = await axios.post(`/watch-together/${room.id}/vote`, {
                movie_id: movieId,
                vote,
            });
            newMovies[index].vote_summary = response.data.vote_summary;
            setLocalToWatch([...newMovies]);
        } catch (error) {
            // Revert on error
            newMovies[index].vote_summary = prevCounts;
            newMovies[index].vote_summary.user_vote = prevVote;
            setLocalToWatch([...newMovies]);
        }
    };

    const handleMarkWatched = (movieId: number) => {
        router.post(`/watch-together/${room.id}/mark-watched`, { movie_id: movieId });
    };

    const handleLeave = () => {
        if (confirm('Are you sure you want to leave this room?')) {
            router.post(`/watch-together/${room.id}/leave`);
        }
    };

    // Get top 3 voted movies
    const topVoted = [...localToWatch]
        .sort((a, b) => (b.vote_summary.up - b.vote_summary.down) - (a.vote_summary.up - a.vote_summary.down))
        .slice(0, 3);

    const otherMember = members.find((m) => m.id !== currentUserId);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
    <Head title={room.name} />
    <div className="relative z-10 flex h-full flex-1 flex-col gap-6 p-4 sm:p-8">

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {room.name}
                </h1>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {members.map((member) => (
                        <div
                            key={member.id}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{ background: 'var(--gold)', color: '#0D1117' }}
                            title={member.name}
                        >
                            {member.name.charAt(0).toUpperCase()}
                        </div>
                    ))}
                </div>
            </div>
            <Button
                onClick={handleLeave}
                variant="outline"
                size="sm"
                className="flex-shrink-0 gap-1.5"
                style={{ borderColor: 'var(--card-border)' }}
            >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Leave Room</span>
            </Button>
        </div>

        {/* Invite Code */}
        {room.invite_code && (
            <div className="watchly-card p-3 sm:p-4">
                <p className="text-xs sm:text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Invite your friend to join:
                </p>
                <div className="flex gap-2">
                    <code
                        className="flex-1 px-3 py-2 rounded font-mono text-sm sm:text-lg min-w-0 tracking-widest"
                        style={{ background: 'var(--background)', color: 'var(--gold)' }}
                    >
                        {room.invite_code}
                    </code>
                    <Button
                        onClick={handleCopyCode}
                        size="sm"
                        className="flex-shrink-0"
                        style={{ background: 'var(--gold)', color: '#0D1117' }}
                    >
                        {copiedCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                </div>
            </div>
        )}

        {/* Vote to Watch Next */}
        {topVoted.length > 0 && (
            <div className="watchly-card p-3 sm:p-4">
                <h2 className="text-base sm:text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                    🗳️ Vote to Watch Next
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {topVoted.map((movie, idx) => {
                        const netVotes = movie.vote_summary.up - movie.vote_summary.down;
                        const isTopPick = idx === 0 && netVotes > 0;
                        return (
                            <div
                                key={movie.id}
                                className="rounded-lg p-3 relative"
                                style={{
                                    border: isTopPick ? '1px solid var(--gold)' : '1px solid var(--card-border)',
                                    background: isTopPick ? 'color-mix(in srgb, var(--gold) 5%, transparent)' : 'transparent',
                                }}
                            >
                                {isTopPick && (
                                    <span
                                        className="absolute -top-2.5 left-3 px-2 py-0.5 text-xs font-bold rounded-full"
                                        style={{ background: 'var(--gold)', color: '#0D1117' }}
                                    >
                                        ⭐ Top Pick
                                    </span>
                                )}
                                <h3 className="font-bold text-sm mb-3 mt-1 pr-2 line-clamp-2" style={{ color: 'var(--text-primary)' }}>
                                    {movie.title}
                                </h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleVote(movie.id, 'up', localToWatch.indexOf(movie))}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm flex-1 justify-center font-medium transition-opacity hover:opacity-80"
                                        style={{
                                            background: movie.vote_summary.user_vote === 'up' ? 'var(--gold)' : 'transparent',
                                            border: '1px solid var(--card-border)',
                                            color: movie.vote_summary.user_vote === 'up' ? '#0D1117' : 'var(--text-secondary)',
                                        }}
                                    >
                                        <ThumbsUp className="h-3.5 w-3.5" /> {movie.vote_summary.up}
                                    </button>
                                    <button
                                        onClick={() => handleVote(movie.id, 'down', localToWatch.indexOf(movie))}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm flex-1 justify-center font-medium transition-opacity hover:opacity-80"
                                        style={{
                                            background: movie.vote_summary.user_vote === 'down' ? 'var(--gold)' : 'transparent',
                                            border: '1px solid var(--card-border)',
                                            color: movie.vote_summary.user_vote === 'down' ? '#0D1117' : 'var(--text-secondary)',
                                        }}
                                    >
                                        <ThumbsDown className="h-3.5 w-3.5" /> {movie.vote_summary.down}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        )}

        {/* Movies Section Header */}
        <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Movies/Series
            </h2>
            <Button
                onClick={() => setImportModalOpen(true)}
                size="sm"
                className="text-black gap-1.5"
                style={{ background: 'var(--gold)' }}
            >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Movie</span>
            </Button>
        </div>

        {/* Movie Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* To Watch */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-base sm:text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                        To Watch
                    </h3>
                    <span
                        className="px-2 py-0.5 rounded-full text-xs font-bold"
                        style={{ background: 'var(--gold)', color: '#0D1117' }}
                    >
                        {localToWatch.length}
                    </span>
                </div>
                <div className="space-y-3">
                    {localToWatch.map((movie) => {
                        const confirmedBy = movie.meta?.confirmed_by || [];
                        const userConfirmed = confirmedBy.includes(currentUserId);
                        const otherConfirmed = otherMember && confirmedBy.includes(otherMember.id);

                        return (
                            <div key={movie.id} className="watchly-card p-3 sm:p-4 flex gap-3 sm:gap-4">
                                {movie.poster && movie.poster !== 'N/A' ? (
                                    <img
                                        src={movie.poster}
                                        alt={movie.title}
                                        className="w-12 sm:w-16 h-[72px] sm:h-24 object-cover rounded flex-shrink-0"
                                    />
                                ) : (
                                    <div className="w-12 sm:w-16 h-[72px] sm:h-24 flex items-center justify-center text-xl rounded bg-neutral-800 flex-shrink-0">
                                        🎬
                                    </div>
                                )}
                                <div className="flex-1 min-w-0 flex flex-col justify-between">
                                    <div>
                                        <h4 className="font-bold text-sm sm:text-base leading-tight" style={{ color: 'var(--text-primary)' }}>
                                            {movie.title}
                                        </h4>
                                        <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                                            {movie.year} • {movie.genre?.split(',')[0]}
                                        </p>
                                        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                                            Added by {movie.added_by.name}
                                        </p>
                                        
                                        {/* Vote buttons */}
                                        <div className="flex gap-2 mt-2">
                                            <button
                                                onClick={() => handleVote(movie.id, 'up', localToWatch.indexOf(movie))}
                                                className="flex items-center gap-1 px-2 py-1 rounded text-xs"
                                                style={{
                                                    background:
                                                        movie.vote_summary.user_vote === 'up'
                                                            ? 'var(--gold)'
                                                            : 'transparent',
                                                    border: '1px solid var(--card-border)',
                                                    color:
                                                        movie.vote_summary.user_vote === 'up'
                                                            ? '#0D1117'
                                                            : 'var(--text-secondary)',
                                                }}
                                            >
                                                <ThumbsUp className="h-3 w-3" /> {movie.vote_summary.up}
                                            </button>
                                            <button
                                                onClick={() => handleVote(movie.id, 'down', localToWatch.indexOf(movie))}
                                                className="flex items-center gap-1 px-2 py-1 rounded text-xs"
                                                style={{
                                                    background:
                                                        movie.vote_summary.user_vote === 'down'
                                                            ? 'var(--gold)'
                                                            : 'transparent',
                                                    border: '1px solid var(--card-border)',
                                                    color:
                                                        movie.vote_summary.user_vote === 'down'
                                                            ? '#0D1117'
                                                            : 'var(--text-secondary)',
                                                }}
                                            >
                                                <ThumbsDown className="h-3 w-3" /> {movie.vote_summary.down}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        {userConfirmed ? (
                                            <Button size="sm" disabled className="text-xs w-full sm:w-auto" style={{ opacity: 0.7 }}>
                                                Waiting for {otherMember?.name}...
                                            </Button>
                                        ) : otherConfirmed ? (
                                            <Button
                                                size="sm"
                                                onClick={() => handleMarkWatched(movie.id)}
                                                className="text-black text-xs w-full sm:w-auto"
                                                style={{ background: 'var(--gold)' }}
                                            >
                                                ✓ Confirm Watched
                                            </Button>
                                        ) : (
                                            <Button
                                                size="sm"
                                                onClick={() => handleMarkWatched(movie.id)}
                                                variant="outline"
                                                className="text-xs w-full sm:w-auto"
                                                style={{ borderColor: 'var(--card-border)' }}
                                            >
                                                Mark as Watched
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Watched */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-base sm:text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                        Watched
                    </h3>
                    <span
                        className="px-2 py-0.5 rounded-full text-xs font-bold"
                        style={{ background: 'var(--card-border)', color: 'var(--text-secondary)' }}
                    >
                        {watched.length}
                    </span>
                </div>
                <div className="space-y-3">
                    {watched.map((movie) => (
                        <div key={movie.id} className="watchly-card p-3 sm:p-4 flex gap-3 sm:gap-4">
                            {movie.poster && movie.poster !== 'N/A' ? (
                                <img
                                    src={movie.poster}
                                    alt={movie.title}
                                    className="w-12 sm:w-16 h-[72px] sm:h-24 object-cover rounded flex-shrink-0 opacity-70"
                                />
                            ) : (
                                <div className="w-12 sm:w-16 h-[72px] sm:h-24 flex items-center justify-center text-xl rounded bg-neutral-800 flex-shrink-0 opacity-70">
                                    🎬
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-sm sm:text-base leading-tight" style={{ color: 'var(--text-primary)' }}>
                                    {movie.title}
                                </h4>
                                <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                                    {movie.year} • {movie.genre?.split(',')[0]}
                                </p>
                                <p className="text-xs mt-2 font-medium" style={{ color: 'var(--gold)' }}>
                                    ✓ Watched together
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    </div>

    <ImportModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        importUrl={`/watch-together/${room.id}/add-movie`}
        importData={(imdbId) => ({ imdb_id: imdbId })}
    />
</AppLayout>
    );
}
