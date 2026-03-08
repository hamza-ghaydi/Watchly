import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImportModal } from '@/components/import-modal';
import { Plus } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'All To Watch', href: '/admin/movies/to-watch' },
];

interface Movie {
    id: number;
    title: string;
    type: string;
    year: number;
    poster: string;
    user_name: string;
    user_email: string;
    added_at: string;
}

interface PaginatedMovies {
    data: Movie[];
    current_page: number;
    last_page: number;
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface Filters {
    user_id?: number;
    type?: string;
}

export default function ToWatch() {
    const { movies, users, filters } = usePage<{
        movies: PaginatedMovies;
        users: User[];
        filters: Filters;
    }>().props;
    const [importModalOpen, setImportModalOpen] = useState(false);

    const handleFilterChange = (key: string, value: string) => {
        const params = new URLSearchParams(window.location.search);
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.get(`/admin/movies/to-watch?${params.toString()}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="All To Watch" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">All To Watch</h1>
                        <p className="text-neutral-400 mt-1">Movies and series users want to watch</p>
                    </div>
                    <Button
                        onClick={() => setImportModalOpen(true)}
                        className="bg-[#F5C518] text-black hover:bg-[#F5C518]/90"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Movie
                    </Button>
                </div>

                <div className="flex gap-4">
                    <Select value={filters.user_id?.toString() || 'all'} onValueChange={(v) => handleFilterChange('user_id', v === 'all' ? '' : v)}>
                        <SelectTrigger className="w-64 bg-neutral-800 border-neutral-700">
                            <SelectValue placeholder="Filter by user" />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-800 border-neutral-700">
                            <SelectItem value="all">All Users</SelectItem>
                            {users.map((user) => (
                                <SelectItem key={user.id} value={user.id.toString()}>
                                    {user.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={filters.type || 'all'} onValueChange={(v) => handleFilterChange('type', v === 'all' ? '' : v)}>
                        <SelectTrigger className="w-48 bg-neutral-800 border-neutral-700">
                            <SelectValue placeholder="Filter by type" />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-800 border-neutral-700">
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="movie">Movies</SelectItem>
                            <SelectItem value="series">Series</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Card className="bg-neutral-900 border-neutral-800">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b border-neutral-800">
                                <tr>
                                    <th className="text-left p-4 text-neutral-400 font-medium">Movie/Series</th>
                                    <th className="text-left p-4 text-neutral-400 font-medium">Type</th>
                                    <th className="text-left p-4 text-neutral-400 font-medium">Year</th>
                                    <th className="text-left p-4 text-neutral-400 font-medium">User</th>
                                    <th className="text-left p-4 text-neutral-400 font-medium">Added</th>
                                </tr>
                            </thead>
                            <tbody>
                                {movies.data.map((movie) => (
                                    <tr key={`${movie.id}-${movie.user_email}`} className="border-b border-neutral-800 last:border-0">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-16 bg-neutral-800 rounded overflow-hidden flex-shrink-0">
                                                    {movie.poster && movie.poster !== 'N/A' ? (
                                                        <img
                                                            src={movie.poster}
                                                            alt={movie.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-2xl">
                                                            🎬
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="font-medium text-white">{movie.title}</div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <Badge variant="secondary" className="bg-neutral-800">
                                                {movie.type}
                                            </Badge>
                                        </td>
                                        <td className="p-4 text-white">{movie.year}</td>
                                        <td className="p-4">
                                            <div>
                                                <div className="text-white">{movie.user_name}</div>
                                                <div className="text-sm text-neutral-400">{movie.user_email}</div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-neutral-400">
                                            {new Date(movie.added_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            <ImportModal open={importModalOpen} onClose={() => setImportModalOpen(false)} />
        </AppLayout>
    );
}
