import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import axios from 'axios';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, UserMinus, Users } from 'lucide-react';
import { showToast } from '@/utils/toast';
import type { BreadcrumbItem } from '@/types';

interface User {
    id: number;
    name: string;
    username: string;
    avatar: string | null;
    bio: string | null;
    created_at: string;
}

interface Room {
    id: number;
    name: string;
    invite_code: string;
    members_count: number;
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
    available_rooms,
}: {
    profile_user: User;
    stats: Stats;
    is_following: boolean;
    followers_count: number;
    following_count: number;
    mutual_follow: boolean;
    recent_watched: Movie[];
    public_recommendations: Recommendation[];
    available_rooms?: Room[];
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Users', href: '/users' },
        { title: profile_user.name, href: `/users/${profile_user.username}` },
    ];

    const [following, setFollowing] = useState(is_following);
    const [followersCount, setFollowersCount] = useState(followers_count);
    const [isMutual, setIsMutual] = useState(mutual_follow);
    const [isLoading, setIsLoading] = useState(false);
    const [inviteModalOpen, setInviteModalOpen] = useState(false);
    const [invitingToRoom, setInvitingToRoom] = useState<number | null>(null);
    const [newRoomName, setNewRoomName] = useState('');
    const [creatingRoom, setCreatingRoom] = useState(false);

    const handleFollow = async () => {
        if (isLoading) return;

        setIsLoading(true);
        try {
            const response = await axios.post(`/users/${profile_user.id}/follow`);
            setFollowing(response.data.following);
            setFollowersCount(response.data.followers_count);
            setIsMutual(response.data.is_mutual);
        } catch (error) {
            console.error('Failed to toggle follow:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInviteToWatch = () => {
        setInviteModalOpen(true);
    };

    const handleInviteToRoom = async (roomId: number) => {
        if (invitingToRoom) return;

        setInvitingToRoom(roomId);
        try {
            await axios.post(`/watch-together/${roomId}/invite`, {
                user_id: profile_user.id,
            });
            setInviteModalOpen(false);
            showToast(`${profile_user.name} has been invited to the room!`, 'success');
        } catch (error: any) {
            console.error('Failed to invite user:', error);
            showToast(error.response?.data?.error || 'Failed to invite user', 'error');
        } finally {
            setInvitingToRoom(null);
        }
    };

    const handleCreateRoomForInvite = async () => {
        if (!newRoomName.trim() || creatingRoom) return;

        setCreatingRoom(true);
        try {
            const response = await axios.post('/watch-together', { name: newRoomName });
            const roomId = response.data.room_id;

            // Invite the user to the newly created room
            await axios.post(`/watch-together/${roomId}/invite`, {
                user_id: profile_user.id,
            });

            // Redirect to the new room
            router.visit(`/watch-together/${roomId}`);
        } catch (error) {
            console.error('Failed to create room:', error);
            setCreatingRoom(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={profile_user.name} />
            <div className="relative z-10 flex h-full flex-1 flex-col gap-6 p-4 sm:p-8">

                {/* Profile Card */}
                <div className="watchly-card p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">

                        {/* Avatar */}
                        <div
                            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-3xl sm:text-4xl font-bold overflow-hidden flex-shrink-0"
                            style={{ background: profile_user.avatar ? 'transparent' : 'var(--gold)', color: '#0D1117' }}
                        >
                            {profile_user.avatar ? (
                                <img src={profile_user.avatar} alt={profile_user.name} className="w-full h-full object-cover" />
                            ) : (
                                profile_user.name.charAt(0).toUpperCase()
                            )}
                        </div>

                        {/* Info + Stats */}
                        <div className="flex-1 min-w-0 w-full">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">

                                {/* Left: name, bio, followers, buttons */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                                        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                            {profile_user.name}
                                        </h1>
                                        {isMutual && (
                                            <span className="px-2 py-1 text-xs font-bold rounded" style={{ background: 'var(--gold)', color: '#0D1117' }}>
                                                Friend
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                                        @{profile_user.username}
                                    </p>
                                    {profile_user.bio && (
                                        <p className="text-sm mb-3" style={{ color: 'var(--text-primary)' }}>
                                            {profile_user.bio}
                                        </p>
                                    )}
                                    <div className="flex gap-4 mb-4">
                                        <div>
                                            <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{followersCount}</span>
                                            <span className="text-sm ml-1" style={{ color: 'var(--text-secondary)' }}>followers</span>
                                        </div>
                                        <div>
                                            <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{following_count}</span>
                                            <span className="text-sm ml-1" style={{ color: 'var(--text-secondary)' }}>following</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 flex-wrap">
                                        <Button
                                            onClick={handleFollow}
                                            disabled={isLoading}
                                            style={{
                                                background: following ? 'transparent' : 'var(--gold)',
                                                color: following ? 'var(--text-primary)' : '#0D1117',
                                                border: following ? '1px solid var(--card-border)' : 'none',
                                                opacity: isLoading ? 0.5 : 1,
                                            }}
                                        >
                                            {following ? (
                                                <><UserMinus className="h-4 w-4 mr-2" />Unfollow</>
                                            ) : (
                                                <><UserPlus className="h-4 w-4 mr-2" />Follow</>
                                            )}
                                        </Button>
                                        {isMutual && (
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

                                {/* Right: Stats */}
                                <div className="grid grid-cols-4 sm:grid-cols-2 gap-2 sm:w-36 flex-shrink-0">
                                    <div className="watchly-card p-2 sm:p-4 text-center">
                                        <div className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--gold)' }}>{stats.total_movies}</div>
                                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Movies</div>
                                    </div>
                                    <div className="watchly-card p-2 sm:p-4 text-center">
                                        <div className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--gold)' }}>{stats.total_series}</div>
                                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Series</div>
                                    </div>
                                    <div className="watchly-card p-2 sm:p-4 text-center">
                                        <div className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--gold)' }}>{stats.total_watched}</div>
                                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Watched</div>
                                    </div>
                                    <div className="watchly-card p-2 sm:p-4 text-center">
                                        <div className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--gold)' }}>{stats.total_recommendations}</div>
                                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Recs</div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="watched" className="w-full">
                    <TabsList className="w-full justify-start">
                        <TabsTrigger value="watched">Recently Watched</TabsTrigger>
                        <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                    </TabsList>

                    {/* Watched Tab */}
                    <TabsContent value="watched" className="mt-6">
                        {recent_watched.length === 0 ? (
                            <div className="bg-[#0A0A0A] p-8 text-center">
                                <p style={{ color: 'var(--text-secondary)' }}>No watched movies yet</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 bg-[#0A0A0A]">
                                {recent_watched.map((movie) => (
                                    <div key={movie.id} className="watchly-card p-2 sm:p-3">
                                        {movie.poster && movie.poster !== 'N/A' ? (
                                            <img
                                                src={movie.poster}
                                                alt={movie.title}
                                                className="w-full aspect-[2/3] object-cover rounded mb-2"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                }}
                                            />
                                        ) : null}
                                        <div className={`w-full aspect-[2/3] flex items-center justify-center text-4xl rounded mb-2 bg-neutral-800 ${movie.poster && movie.poster !== 'N/A' ? 'hidden' : ''}`}>
                                            🎬
                                        </div>
                                        <h3 className="font-bold text-xs line-clamp-2" style={{ color: 'var(--text-primary)' }}>
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

                    {/* Recommendations Tab */}
                    <TabsContent value="recommendations" className="mt-6">
                        {public_recommendations.length === 0 ? (
                            <div className="p-8 text-center bg-[#0A0A0A]">
                                <p style={{ color: 'var(--text-secondary)' }}>No recommendations yet</p>
                            </div>
                        ) : (
                            <div className="space-y-3 bg-[#0A0A0A]">
                                {public_recommendations.map((rec) => (
                                    <div key={rec.id} className="watchly-card p-3 sm:p-4 flex gap-3 sm:gap-4">
                                        {rec.movie.poster && rec.movie.poster !== 'N/A' ? (
                                            <img
                                                src={rec.movie.poster}
                                                alt={rec.movie.title}
                                                className="w-14 sm:w-24 h-20 sm:h-36 object-cover rounded flex-shrink-0"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                }}
                                            />
                                        ) : null}
                                        <div className={`w-14 sm:w-24 h-20 sm:h-36 flex items-center justify-center text-4xl rounded bg-neutral-800 flex-shrink-0 ${rec.movie.poster && rec.movie.poster !== 'N/A' ? 'hidden' : ''}`}>
                                            🎬
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-sm sm:text-lg leading-tight" style={{ color: 'var(--text-primary)' }}>
                                                {rec.movie.title}
                                            </h3>
                                            <p className="text-xs sm:text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                                                {rec.movie.year} • {rec.movie.genre?.split(',')[0]}
                                            </p>
                                            {rec.note && (
                                                <p className="text-xs sm:text-sm mb-3 italic" style={{ color: 'var(--text-primary)' }}>
                                                    "{rec.note}"
                                                </p>
                                            )}
                                            <div className="flex gap-3 flex-wrap">
                                                <span className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>😊 {rec.reaction_counts.fire}</span>
                                                <span className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>😐 {rec.reaction_counts.heart}</span>
                                                <span className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>☹️ {rec.reaction_counts.mind_blown}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* Invite Modal */}
            <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
                <DialogContent style={{ borderColor: 'var(--card-border)' }} className="w-[90vw] max-w-md rounded-lg">
                    <DialogHeader>
                        <DialogTitle style={{ color: 'var(--text-primary)' }}>
                            Invite {profile_user.name} to Watch Together
                        </DialogTitle>
                        <DialogDescription style={{ color: 'var(--text-secondary)' }}>
                            {available_rooms && available_rooms.length > 0
                                ? 'Click on a room to invite them, or create a new room'
                                : 'Create a new Watch Together room to invite them'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {available_rooms && available_rooms.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Your Rooms</h4>
                                <div className="space-y-2">
                                    {available_rooms.map((room) => (
                                        <button
                                            key={room.id}
                                            onClick={() => handleInviteToRoom(room.id)}
                                            disabled={invitingToRoom === room.id}
                                            className="w-full watchly-card p-3 flex items-center justify-between hover:opacity-80 transition-opacity"
                                        >
                                            <div className="text-left">
                                                <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{room.name}</p>
                                                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{room.members_count}/2 members</p>
                                            </div>
                                            {invitingToRoom === room.id ? (
                                                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Inviting...</span>
                                            ) : (
                                                <span className="text-xs" style={{ color: 'var(--gold)' }}>Click to invite →</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                                <div className="relative my-4">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t" style={{ borderColor: 'var(--card-border)' }} />
                                    </div>
                                    <div className="relative flex justify-center text-xs">
                                        <span className="px-2" style={{ background: 'var(--card-bg)', color: 'var(--text-secondary)' }}>OR</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div>
                            <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Create New Room</h4>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Room name"
                                    value={newRoomName}
                                    onChange={(e) => setNewRoomName(e.target.value)}
                                    maxLength={50}
                                    style={{ borderColor: 'var(--card-border)', color: 'var(--text-primary)' }}
                                />
                                <Button
                                    onClick={handleCreateRoomForInvite}
                                    disabled={creatingRoom || !newRoomName.trim()}
                                    style={{ background: 'var(--gold)', color: '#0D1117' }}
                                >
                                    Create
                                </Button>
                            </div>
                        </div>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            {profile_user.name} will receive a notification and be added to the room
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
