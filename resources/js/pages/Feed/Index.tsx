import { Head, router, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Following Feed', href: '/feed' },
];

interface Activity {
    id: number;
    type: 'added' | 'watched' | 'recommended';
    created_at: string;
    meta: any;
    user: { id: number; name: string; username: string; avatar: string | null };
    movie: {
        id: number;
        imdb_id: string;
        title: string;
        year: number;
        type: string;
        poster: string;
        genre: string;
        imdb_rating: string;
    };
    in_my_list: boolean;
    already_watched: boolean;
}

export default function Index({
    activities,
    following_count,
}: {
    activities: { data: Activity[] };
    following_count: number;
}) {
    const handleAddToList = (movieId: number) => {
        router.post('/movies/from-recommendation', { movie_id: movieId });
    };

    const getActivityMessage = (activity: Activity) => {
        switch (activity.type) {
            case 'added':
                return (
                    <>
                        added <span style={{ color: 'var(--gold)' }}>{activity.movie.title}</span> to their watchlist
                    </>
                );
            case 'watched':
                return (
                    <>
                        watched <span style={{ color: 'var(--gold)' }}>{activity.movie.title}</span>
                        {activity.meta?.rating && ` · gave it ${activity.meta.rating}/10 ⭐`}
                    </>
                );
            case 'recommended':
                return (
                    <>
                        recommended <span style={{ color: 'var(--gold)' }}>{activity.movie.title}</span>
                        {activity.meta?.note && (
                            <span className="italic">
                                {' '}
                                · "{activity.meta.note.substring(0, 80)}
                                {activity.meta.note.length > 80 ? '...' : ''}"
                            </span>
                        )}
                    </>
                );
        }
    };

    if (following_count === 0) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Following Feed" />
                <div className="relative z-10 flex h-full flex-1 flex-col items-center justify-center p-8">
                    <Users size={50} className="mb-4" style={{ color: 'var(--text-secondary)' }} />
                    <h2 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                        Follow other users to see their activity
                    </h2>
                    <Button
                        onClick={() => router.get('/users')}
                        className="mt-4 text-black"
                        style={{ background: 'var(--gold)' }}
                    >
                        Explore Users →
                    </Button>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Following Feed" />
            <div className="relative z-10 flex h-full flex-1 flex-col gap-6 p-4 sm:p-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        Following Feed
                    </h1>
                    <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
                        Activity from people you follow
                    </p>
                </div>

                <div className="space-y-4">
                    {activities.data.map((activity) => (
                        <div key={activity.id} className="watchly-card p-3 sm:p-4 flex gap-3 sm:gap-4 items-start">

                            <Link href={`/users/${activity.user.username}`} className="flex-shrink-0">
                                <div
                                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-bold"
                                    style={{ background: 'var(--gold)', color: '#0D1117' }}
                                >
                                    {activity.user.name.charAt(0).toUpperCase()}
                                </div>
                            </Link>

                            <div className="flex-1 min-w-0">
                                <p className="text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
                                    <Link
                                        href={`/users/${activity.user.username}`}
                                        className="font-bold hover:underline"
                                        style={{ color: 'var(--gold)' }}
                                    >
                                        {activity.user.name}
                                    </Link>{' '}
                                    {getActivityMessage(activity)}
                                </p>
                                <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
                                    {new Date(activity.created_at).toLocaleDateString()}
                                </p>
                                {!activity.in_my_list && !activity.already_watched && (
                                    <Button
                                        size="sm"
                                        onClick={() => handleAddToList(activity.movie.id)}
                                        className="text-black sm:hidden"
                                        style={{ background: 'var(--gold)' }}
                                    >
                                        + Add to list
                                    </Button>
                                )}
                            </div>

                            {activity.movie.poster && activity.movie.poster !== 'N/A' && (
                                <img
                                    src={activity.movie.poster}
                                    alt={activity.movie.title}
                                    className="w-12 h-18 sm:w-16 sm:h-24 object-cover rounded flex-shrink-0"
                                />
                            )}

                            {!activity.in_my_list && !activity.already_watched && (
                                <Button
                                    size="sm"
                                    onClick={() => handleAddToList(activity.movie.id)}
                                    className="text-black self-center flex-shrink-0 hidden sm:flex"
                                    style={{ background: 'var(--gold)' }}
                                >
                                    Add to my list
                                </Button>
                            )}

                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
