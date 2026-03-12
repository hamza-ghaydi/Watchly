import { Head, router } from '@inertiajs/react';
import React, { useState } from 'react';
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
    bio: string | null;
    created_at: string;
    followers_count: number;
    following_count: number;
    is_following: boolean;
    is_mutual: boolean;
}

export default function Index({ users, search }: { users: { data: User[] }; search: string }) {
    const [searchQuery, setSearchQuery] = useState(search || '');
    const [localUsers, setLocalUsers] = useState(users.data);

    // Update local users when users prop changes (after search)
    React.useEffect(() => {
        setLocalUsers(users.data);
    }, [users.data]);

    const handleSearch = () => {
        router.get('/users', { search: searchQuery }, { 
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleFollow = async (userId: number, index: number) => {
        const prevFollowing = localUsers[index].is_following;
        const prevFollowersCount = localUsers[index].followers_count;
        const prevMutual = localUsers[index].is_mutual;
        
        const newUsers = [...localUsers];
        newUsers[index].is_following = !prevFollowing;
        
        // Update followers count
        if (!prevFollowing) {
            // Following: increment followers
            newUsers[index].followers_count = prevFollowersCount + 1;
            // Check if it becomes mutual (they already follow us)
            // We can't know for sure without server data, so we'll update after response
        } else {
            // Unfollowing: decrement followers
            newUsers[index].followers_count = Math.max(0, prevFollowersCount - 1);
            // If it was mutual, it's no longer mutual
            newUsers[index].is_mutual = false;
        }
        
        setLocalUsers(newUsers);

        try {
            const response = await axios.post(`/users/${userId}/follow`);
            // Update with server response if available
            if (response.data) {
                newUsers[index].followers_count = response.data.followers_count || newUsers[index].followers_count;
                newUsers[index].is_mutual = response.data.is_mutual || false;
                setLocalUsers([...newUsers]);
            }
        } catch (error) {
            // Revert on error
            newUsers[index].is_following = prevFollowing;
            newUsers[index].followers_count = prevFollowersCount;
            newUsers[index].is_mutual = prevMutual;
            setLocalUsers([...newUsers]);
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
                                        className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold overflow-hidden"
                                        style={{ background: (user.avatar && user.avatar !== '') ? 'transparent' : 'var(--gold)', color: '#0D1117' }}
                                    >
                                        {user.avatar && user.avatar !== '' ? (
                                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            user.name.charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3
                                                className="font-bold cursor-pointer hover:underline"
                                                style={{ color: 'var(--text-primary)' }}
                                                onClick={() => router.get(`/users/${user.username}`)}
                                            >
                                                {user.name}
                                            </h3>
                                            {user.is_mutual && (
                                                <span
                                                    className="px-1.5 py-0.5 text-xs font-bold rounded"
                                                    style={{ background: 'var(--gold)', color: '#0D1117' }}
                                                >
                                                    Friend
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                                            @{user.username}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {user.bio && (
                                <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                                    {user.bio}
                                </p>
                            )}
                            <div className="flex gap-4 mb-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                <div>
                                    <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                                        {user.followers_count}
                                    </span>{' '}
                                    followers
                                </div>
                                <div>
                                    <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                                        {user.following_count}
                                    </span>{' '}
                                    following
                                </div>
                            </div>
                            <Button
                                size="sm"
                                onClick={() => handleFollow(user.id, index)}
                                className="w-full"
                                variant={user.is_following ? 'outline' : 'default'}
                                style={
                                    user.is_following
                                        ? { borderColor: 'var(--card-border)', color: 'var(--text-primary)' }
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
