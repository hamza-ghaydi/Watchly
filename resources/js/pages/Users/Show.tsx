import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, UserMinus, Users } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';

interface User {
    id: number;
    name: string;
    username: string;
    avatar: string | null;
    created_at: string;
}

interface Stats {
    total_movies: number;
    total_series: number;
    total_watched: number;
    total_recommendations: number;
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
}

interface Recommendation {
    id: number;
    note: string;
    created_at: string;
    movie: Movie;
    reaction_counts: {
        fire: number;
        heart: number;
        mind_blown: number;
        skip: number;
    };
}

export default function Show({
    profile_user,
    stats,
    is_following,
    followers_count,
    following_count,
    mutual_follow,
    recent_watched,
    public_recommendations,
}: {
    profile_user: User;
    stats: Stats;
    is_following: boolean;
    followers_count: number;
    following_count: number;
    mutual_follow: boolean;
    recent_watched: Movie[];
    public_recommendations: Recommendation[];
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Users', href: '/users' },
        { title: profile_user.name, href: `/users/${profile_user.username}` },
    ];

    const [following, setFollowing] = useState(is_following);
    const [followersCount, setFollowersCount] = useState(followers_count);

    const handleFollow = () => {
        router.post(`/users/${profile_user.id}/follow`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                setFollowing(!following);
                setFollowersCount(following ? followersCount - 1 : followersCount + 1);
            },
        });
    };

    const handleInviteToWatch = () => {
        router.visit('/watch-together');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={profile_user.name} />
            <div className="relative z-10 flex h-full flex-1 flex-col gap-6 p-8">
                <div className="watchly-card p-6">
                    <div className="flex items-start gap-6">
                        <div
                            className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold"
                            style={{ background: 'var(--gold)', color: '#0D1117' }}
                        >
                            {profile_user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                    {profile_user.name}
                                </h1>
                                {mutual_follow && (
                                    <span
                                        className="px-2 py-1 text-xs font-bold rounded"
                                        style={{ background: 'var(--gold)', color: '#0D1117' }}
                                    >
                                        Mutual
                                    </span>
                                )}
                            </div>
                            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                                @{profile_user.username}
                            </p>
                            <div className="flex gap-4 mb-4">
                                <div>
                                    <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                                        {followersCount}
                                    </span>
                                    <span className="text-sm ml-1" style={{ color: 'var(--text-secondary)' }}>
                                        followers
                                    </span>
                                </div>
                                <div>
                                    <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                                        {following_count}
                                    </span>
                                    <span className="text-sm ml-1" style={{ color: 'var(--text-secondary)' }}>
                                        following
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleFollow}
                                    style={{ 
                                        background: following ? 'transparent' : 'var(--gold)', 
                                        color: following ? 'var(--text-primary)' : '#0D1117',
                                        border: following ? '1px solid var(--card-border)' : 'none' 
                                    }}
                                >
                                    {following ? (
                                        <>
                                            <UserMinus className="h-4 w-4 mr-2" />
                                            Unfollow
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="h-4 w-4 mr-2" />
                                            Follow
                                        </>
                                    )}
                                </Button>
                                {mutual_follow && (
                                    <Button
                                        onClick={handleInviteToWatch}
                                        variant="outline"
                                        style={{ borderColor: 'var(--card-border)', color: 'var(--text-primary)' }}
                                    >
                                        <Users className="h-4 w-4 mr-2" />
                                        Invite to Watch Together
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="watchly-card p-4 text-center">
                                <div className="text-2xl font-bold" style={{ color: 'var(--gold)' }}>
                                    {stats.total_movies}
                                </div>
                                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                    Movies
                                </div>
                            </div>
                            <div className="watchly-card p-4 text-center">
                                <div className="text-2xl font-bold" style={{ color: 'var(--gold)' }}>
                                    {stats.total_series}
                                </div>
                                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                    Series
                                </div>
                            </div>
                            <div className="watchly-card p-4 text-center">
                                <div className="text-2xl font-bold" style={{ color: 'var(--gold)' }}>
                                    {stats.total_watched}
                                </div>
                                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                    Watched
                                </div>
                            </div>
                            <div className="watchly-card p-4 text-center">
                                <div className="text-2xl font-bold" style={{ color: 'var(--gold)' }}>
                                    {stats.total_recommendations}
                                </div>
                                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                    Recommendations
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Tabs defaultValue="watched" className="w-full">
                    <TabsList className="w-full justify-start">
                        <TabsTrigger value="watched">Recently Watched</TabsTrigger>
                        <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                    </TabsList>
                    <TabsContent value="watched" className="mt-6">
                        {recent_watched.length === 0 ? (
                            <div className="watchly-card p-8 text-center">
                                <p style={{ color: 'var(--text-secondary)' }}>No watched movies yet</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                {recent_watched.map((movie) => (
                                    <div key={movie.id} className="watchly-card p-3">
                                        {movie.poster && movie.poster !== 'N/A' ? (
                                            <img
                                                src={movie.poster}
                                                alt={movie.title}
                                                className="w-full h-48 object-cover rounded mb-2"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                }}
                                            />
                                        ) : null}
                                        <div
                                            className={`w-full h-48 flex items-center justify-center text-4xl rounded mb-2 bg-neutral-800 ${movie.poster && movie.poster !== 'N/A' ? 'hidden' : ''}`}
                                        >
                                            🎬
                                        </div>
                                        <h3 className="font-bold text-sm line-clamp-2" style={{ color: 'var(--text-primary)' }}>
                                            {movie.title}
                                        </h3>
                                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                            {movie.year}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                    <TabsContent value="recommendations" className="mt-6">
                        {public_recommendations.length === 0 ? (
                            <div className="watchly-card p-8 text-center">
                                <p style={{ color: 'var(--text-secondary)' }}>No recommendations yet</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {public_recommendations.map((rec) => (
                                    <div key={rec.id} className="watchly-card p-4 flex gap-4">
                                        {rec.movie.poster && rec.movie.poster !== 'N/A' ? (
                                            <img
                                                src={rec.movie.poster}
                                                alt={rec.movie.title}
                                                className="w-24 h-36 object-cover rounded"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                }}
                                            />
                                        ) : null}
                                        <div
                                            className={`w-24 h-36 flex items-center justify-center text-4xl rounded bg-neutral-800 ${rec.movie.poster && rec.movie.poster !== 'N/A' ? 'hidden' : ''}`}
                                        >
                                            🎬
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                                                {rec.movie.title}
                                            </h3>
                                            <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                                                {rec.movie.year} • {rec.movie.genre?.split(',')[0]}
                                            </p>
                                            {rec.note && (
                                                <p className="text-sm mb-3" style={{ color: 'var(--text-primary)' }}>
                                                    "{rec.note}"
                                                </p>
                                            )}
                                            <div className="flex gap-3">
                                                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                                    😊 {rec.reaction_counts.fire}
                                                </span>
                                                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                                    😐 {rec.reaction_counts.heart}
                                                </span>
                                                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                                    ☹️ {rec.reaction_counts.mind_blown}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
