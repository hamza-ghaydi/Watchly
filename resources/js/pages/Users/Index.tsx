import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import axios from 'axios';
import AppLayout from '@/layouts/app-layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Explore Users', href: '/users' },
];

interface User {
    id: number;
    name: string;
    username: string;
    avatar: string | null;
    created_at: string;
    stats: {
        total_movies: number;
        total_series: number;
        total_watched: number;
    };
    is_following: boolean;
}

export default function Index({ users, search }: { users: { data: User[] }; search: string }) {
    const [searchQuery, setSearchQuery] = useState(search || '');
    const [localUsers, setLocalUsers] = useState(users.data);

    const handleSearch = () => {
        router.get('/users', { search: searchQuery }, { preserveState: true });
    };

    const handleFollow = async (userId: number, index: number) => {
        const prevFollowing = localUsers[index].is_following;
        const newUsers = [...localUsers];
        newUsers[index].is_following = !prevFollowing;
        setLocalUsers(newUsers);

        try {
            await axios.post(`/users/${userId}/follow`);
        } catch (error) {
            newUsers[index].is_following = prevFollowing;
            setLocalUsers(newUsers);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Explore Users" />
            <div className="relative z-10 flex h-full flex-1 flex-col gap-6 p-8">
                <div>
                    <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        Explore Users
                    </h1>
                    <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
                        Find and follow other Watchly users
                    </p>
                </div>

                <div className="flex gap-2">
                    <Input
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        style={{ borderColor: 'var(--card-border)', color: 'var(--text-primary)' }}
                    />
                    <Button onClick={handleSearch} className="text-black" style={{ background: 'var(--gold)' }}>
                        <Search className="h-4 w-4" />
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {localUsers.map((user, index) => (
                        <div key={user.id} className="watchly-card p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
                                        style={{ background: 'var(--gold)', color: '#0D1117' }}
                                    >
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3
                                            className="font-bold cursor-pointer hover:underline"
                                            style={{ color: 'var(--text-primary)' }}
                                            onClick={() => router.get(`/users/${user.username}`)}
                                        >
                                            {user.name}
                                        </h3>
                                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                            @{user.username}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-4 mb-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                <div>
                                    <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                                        {user.stats.total_watched}
                                    </span>{' '}
                                    watched
                                </div>
                                <div>
                                    <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                                        {user.stats.total_movies + user.stats.total_series}
                                    </span>{' '}
                                    total
                                </div>
                            </div>
                            <Button
                                size="sm"
                                onClick={() => handleFollow(user.id, index)}
                                className="w-full"
                                variant={user.is_following ? 'outline' : 'default'}
                                style={
                                    user.is_following
                                        ? { borderColor: 'var(--card-border)' }
                                        : { background: 'var(--gold)', color: '#0D1117' }
                                }
                            >
                                {user.is_following ? 'Following' : 'Follow'}
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
