import { Head, router, usePage, Link } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash2, Shield, User as UserIcon, Plus, Pencil } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Users', href: '/admin/users' },
];

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    watched_count: number;
    to_watch_count: number;
    created_at: string;
}

interface PaginatedUsers {
    data: User[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export default function Users() {
    const { users, auth } = usePage<{ users: PaginatedUsers; auth: { user: { id: number } } }>().props;
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const handleDelete = (user: User) => {
        setSelectedUser(user);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (selectedUser) {
            router.delete(`/admin/users/${selectedUser.id}`, {
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setSelectedUser(null);
                },
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Users</h1>
                        <p className="text-neutral-400 mt-1">Manage user accounts and roles</p>
                    </div>
                    <Link href="/admin/users/create">
                        <Button className="bg-[#F5C518] text-black hover:bg-[#F5C518]/90">
                            <Plus className="h-4 w-4 mr-2" />
                            Add User
                        </Button>
                    </Link>
                </div>

                <Card className="bg-neutral-900 border-neutral-800">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b border-neutral-800">
                                <tr>
                                    <th className="text-left p-4 text-neutral-400 font-medium">User</th>
                                    <th className="text-left p-4 text-neutral-400 font-medium">Role</th>
                                    <th className="text-left p-4 text-neutral-400 font-medium">Watched</th>
                                    <th className="text-left p-4 text-neutral-400 font-medium">To Watch</th>
                                    <th className="text-left p-4 text-neutral-400 font-medium">Joined</th>
                                    <th className="text-right p-4 text-neutral-400 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.data.map((user) => (
                                    <tr key={user.id} className="border-b border-neutral-800 last:border-0">
                                        <td className="p-4">
                                            <div>
                                                <div className="font-medium text-white">{user.name}</div>
                                                <div className="text-sm text-neutral-400">{user.email}</div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <Badge
                                                variant="secondary"
                                                className={
                                                    user.role === 'admin'
                                                        ? 'bg-[#F5C518] text-black'
                                                        : 'bg-neutral-700'
                                                }
                                            >
                                                {user.role === 'admin' ? (
                                                    <Shield className="h-3 w-3 mr-1" />
                                                ) : (
                                                    <UserIcon className="h-3 w-3 mr-1" />
                                                )}
                                                {user.role}
                                                {user.id === auth.user.id && ' (You)'}
                                            </Badge>
                                        </td>
                                        <td className="p-4 text-white">{user.watched_count}</td>
                                        <td className="p-4 text-white">{user.to_watch_count}</td>
                                        <td className="p-4 text-neutral-400">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex gap-2 justify-end">
                                                {user.id !== auth.user.id && (
                                                    <>
                                                        <Link href={`/admin/users/${user.id}/edit`}>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="border-neutral-700"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => handleDelete(user)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {users.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {Array.from({ length: users.last_page }, (_, i) => i + 1).map((page) => (
                            <Button
                                key={page}
                                variant={page === users.current_page ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => router.get(`/admin/users?page=${page}`)}
                                className={
                                    page === users.current_page
                                        ? 'bg-[#F5C518] text-black'
                                        : 'border-neutral-700'
                                }
                            >
                                {page}
                            </Button>
                        ))}
                    </div>
                )}
            </div>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="bg-neutral-900 border-neutral-800 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                        <AlertDialogDescription className="text-neutral-400">
                            Are you sure you want to delete {selectedUser?.name}? This will remove all their movies.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-neutral-700">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
