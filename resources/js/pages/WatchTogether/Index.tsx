import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Users, Plus } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Watch Together', href: '/watch-together' },
];

interface Room {
    id: number;
    name: string;
    members: Array<{ id: number; name: string; avatar: string | null }>;
    movies_count: number;
    unread_count: number;
}

export default function Index({ rooms }: { rooms: Room[] }) {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [joinModalOpen, setJoinModalOpen] = useState(false);
    const [showInviteCode, setShowInviteCode] = useState(false);
    const [inviteCode, setInviteCode] = useState('');

    const createForm = useForm({ name: '' });
    const joinForm = useForm({ code: '' });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!createForm.data.name.trim()) {
            return;
        }

        createForm.post('/watch-together', {
            preserveScroll: false,
            preserveState: false,
            onSuccess: () => {
                setCreateModalOpen(false);
                createForm.reset();
            },
            onError: (errors) => {
                console.error('Failed to create room:', errors);
            },
        });
    };

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        joinForm.post('/watch-together/join', {
            onSuccess: () => {
                setJoinModalOpen(false);
                joinForm.reset();
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Watch Together" />
            <div className="relative z-10 flex h-full flex-1 flex-col gap-6 p-4 sm:p-8">
                <div className="flex items-start sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                            Watch Together
                        </h1>
                        <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
                            Share watchlists with friends
                        </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                        <Button onClick={() => setJoinModalOpen(true)} variant="outline" size="sm" className="sm:size-default" style={{ borderColor: 'var(--card-border)' }}>
                            Join Room
                        </Button>
                        <Button onClick={() => setCreateModalOpen(true)} size="sm" className="sm:size-default text-black" style={{ background: 'var(--gold)' }}>
                            <Plus className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Create Room</span>
                        </Button>
                    </div>
                </div>

                {rooms.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <Users size={50} className="mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} />
                            <h2 className="text-xl sm:text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                                No rooms yet
                            </h2>
                            <p className="mb-4 text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>
                                Create a room or join one with an invite code
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
                        {rooms.map((room) => (
                            <div
                                key={room.id}
                                className="watchly-card p-4 sm:p-6 cursor-pointer hover:opacity-80"
                                onClick={() => router.get(`/watch-together/${room.id}`)}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <h3 className="font-bold text-base sm:text-lg" style={{ color: 'var(--text-primary)' }}>
                                        {room.name}
                                    </h3>
                                    {room.unread_count > 0 && (
                                        <span
                                            className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
                                            style={{ background: 'var(--gold)' }}
                                        />
                                    )}
                                </div>
                                <div className="flex items-center gap-2 mb-3 flex-wrap">
                                    {room.members.map((member) => (
                                        <div
                                            key={member.id}
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                            style={{ background: 'var(--gold)', color: '#0D1117' }}
                                        >
                                            {member.name.charAt(0).toUpperCase()}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                    {room.movies_count} movies
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
                <DialogContent style={{ borderColor: 'var(--card-border)' }} className="w-[90vw] max-w-md rounded-lg">
                    <DialogHeader>
                        <DialogTitle style={{ color: 'var(--text-primary)' }}>Create Watch Together Room</DialogTitle>
                        <DialogDescription style={{ color: 'var(--text-secondary)' }}>
                            Create a shared watchlist room to watch movies with a friend
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <Input
                            placeholder="Room name"
                            value={createForm.data.name}
                            onChange={(e) => createForm.setData('name', e.target.value)}
                            maxLength={50}
                            style={{ borderColor: 'var(--card-border)', color: 'var(--text-primary)' }}
                        />
                        <div className="flex gap-2 justify-end">
                            <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)} style={{ borderColor: 'var(--card-border)' }}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createForm.processing} className="text-black" style={{ background: 'var(--gold)' }}>
                                Create
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={joinModalOpen} onOpenChange={setJoinModalOpen}>
                <DialogContent style={{ borderColor: 'var(--card-border)' }} className="w-[90vw] max-w-md rounded-lg">
                    <DialogHeader>
                        <DialogTitle style={{ color: 'var(--text-primary)' }}>Join Watch Together Room</DialogTitle>
                        <DialogDescription style={{ color: 'var(--text-secondary)' }}>
                            Enter the invite code shared by your friend to join their room
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleJoin} className="space-y-4">
                        <Input
                            placeholder="Enter invite code (e.g., WTCH-4X9K)"
                            value={joinForm.data.code}
                            onChange={(e) => joinForm.setData('code', e.target.value.toUpperCase())}
                            style={{ borderColor: 'var(--card-border)', color: 'var(--text-primary)' }}
                        />
                        <div className="flex gap-2 justify-end">
                            <Button type="button" variant="outline" onClick={() => setJoinModalOpen(false)} style={{ borderColor: 'var(--card-border)' }}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={joinForm.processing} className="text-black" style={{ background: 'var(--gold)' }}>
                                Join
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
