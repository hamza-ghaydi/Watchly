import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { MovieCard } from '@/components/movie-card';
import { MovieDetailsModal } from '@/components/movie-details-modal';
import { RecommendModal } from '@/components/recommend-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { PopcornIcon, Search } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Watched', href: '/movies/watched' },
];

interface Movie {
    id: number;
    imdb_id: string;
    title: string;
    type: string;
    year: number;
    poster: string;
    genre: string;
    imdb_rating: string;
    plot: string;
    user_rating?: number;
    watched_at?: string;
    user_already_recommended?: boolean;
}

interface Filters {
    search?: string;
    type?: string;
    genre?: string;
    rating?: string;
    user_rating?: string;
}

export default function Watched() {
    const { movies, genres, filters } = usePage<{ movies: Movie[]; genres: string[]; filters: Filters }>().props;
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [recommendModalOpen, setRecommendModalOpen] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [typeFilter, setTypeFilter] = useState(filters.type || 'all');
    const [genreFilter, setGenreFilter] = useState(filters.genre || 'all');
    const [ratingFilter, setRatingFilter] = useState(filters.rating || 'all');
    const [userRatingFilter, setUserRatingFilter] = useState(filters.user_rating || 'all');

    const handleFilter = () => {
        const params = new URLSearchParams();
        if (searchQuery) params.set('search', searchQuery);
        if (typeFilter !== 'all') params.set('type', typeFilter);
        if (genreFilter !== 'all') params.set('genre', genreFilter);
        if (ratingFilter !== 'all') params.set('rating', ratingFilter);
        if (userRatingFilter !== 'all') params.set('user_rating', userRatingFilter);

        router.get(`/movies/watched?${params.toString()}`, {}, { preserveState: true });
    };

    const handleClearFilters = () => {
        setSearchQuery('');
        setTypeFilter('all');
        setGenreFilter('all');
        setRatingFilter('all');
        setUserRatingFilter('all');
        router.get('/movies/watched');
    };

    const handleDelete = (movie: Movie) => {
        setSelectedMovie(movie);
        setDetailsModalOpen(false);
        setDeleteDialogOpen(true);
    };

    const handleRecommend = (movie: Movie) => {
        setSelectedMovie(movie);
        setDetailsModalOpen(false);
        setRecommendModalOpen(true);
    };

    const handleCardClick = (movie: Movie) => {
        setSelectedMovie(movie);
        setDetailsModalOpen(true);
    };

    const confirmDelete = () => {
        if (selectedMovie) {
            router.delete(`/movies/${selectedMovie.id}`, {
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setSelectedMovie(null);
                },
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Watched" />
            <div className="relative z-10 flex h-full flex-1 flex-col gap-6 p-8">
                <div>
                    <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Watched</h1>
                    <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Movies and series you've watched</p>
                </div>

                {/* Filters */}
                <div className="watchly-card p-4">
                    <div className="flex items-center gap-2 flex-wrap">

                        <Input
                            placeholder="Search by title..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                            style={{ borderColor: 'var(--card-border)', color: 'var(--text-primary)' }}
                            className="flex-1 min-w-[160px]"
                        />

                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger style={{ borderColor: 'var(--card-border)' }} className="w-[120px]">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent style={{ borderColor: 'var(--card-border)' }}>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="movie">Movies</SelectItem>
                                <SelectItem value="series">Series</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={genreFilter} onValueChange={setGenreFilter}>
                            <SelectTrigger style={{ borderColor: 'var(--card-border)' }} className="w-[130px]">
                                <SelectValue placeholder="Genre" />
                            </SelectTrigger>
                            <SelectContent style={{ borderColor: 'var(--card-border)' }}>
                                <SelectItem value="all">All Genres</SelectItem>
                                {genres.map((genre) => (
                                    <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={ratingFilter} onValueChange={setRatingFilter}>
                            <SelectTrigger style={{ borderColor: 'var(--card-border)' }} className="w-[140px]">
                                <SelectValue placeholder="IMDB Rating" />
                            </SelectTrigger>
                            <SelectContent style={{ borderColor: 'var(--card-border)' }}>
                                <SelectItem value="all">All Ratings</SelectItem>
                                <SelectItem value="9">9+ ⭐</SelectItem>
                                <SelectItem value="8">8+ ⭐</SelectItem>
                                <SelectItem value="7">7+ ⭐</SelectItem>
                                <SelectItem value="6">6+ ⭐</SelectItem>
                                <SelectItem value="5">5+ ⭐</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={userRatingFilter} onValueChange={setUserRatingFilter}>
                            <SelectTrigger style={{ borderColor: 'var(--card-border)' }} className="w-[130px]">
                                <SelectValue placeholder="My Rating" />
                            </SelectTrigger>
                            <SelectContent style={{ borderColor: 'var(--card-border)' }}>
                                <SelectItem value="all">All My Ratings</SelectItem>
                                <SelectItem value="9">9+ ⭐</SelectItem>
                                <SelectItem value="8">8+ ⭐</SelectItem>
                                <SelectItem value="7">7+ ⭐</SelectItem>
                                <SelectItem value="6">6+ ⭐</SelectItem>
                                <SelectItem value="5">5+ ⭐</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button
                            onClick={handleFilter}
                            className="text-black hover:opacity-90"
                            style={{ background: 'var(--gold)' }}
                        >
                            <Search className="h-4 w-4 mr-2" />
                            Apply Filters
                        </Button>

                        <Button
                            onClick={handleClearFilters}
                            variant="outline"
                            style={{ borderColor: 'var(--card-border)' }}
                            className="bg-red-700"
                        >
                            Clear
                        </Button>

                    </div>
                </div>

                {movies.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-6xl mb-4 "><PopcornIcon className='mx-auto text-red-600' size={50} /></div>
                            <h2 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No watched movies yet</h2>
                            <p style={{ color: 'var(--text-secondary)' }}>Start watching movies from your list</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                        {movies.map((movie) => (
                            <MovieCard
                                key={movie.id}
                                movie={movie}
                                onClick={handleCardClick}
                                onDelete={handleDelete}
                                onRecommend={handleRecommend}
                                showActions={true}
                                showRecommend={true}
                            />
                        ))}
                    </div>
                )}
            </div>

            <MovieDetailsModal
                open={detailsModalOpen}
                onClose={() => setDetailsModalOpen(false)}
                movie={selectedMovie}
                onDelete={handleDelete}
                showActions={true}
            />
            <RecommendModal
                open={recommendModalOpen}
                onClose={() => setRecommendModalOpen(false)}
                movie={selectedMovie}
            />
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent style={{ borderColor: 'var(--card-border)' }}>
                    <AlertDialogHeader>
                        <AlertDialogTitle style={{ color: 'var(--text-primary)' }}>Delete Movie</AlertDialogTitle>
                        <AlertDialogDescription style={{ color: 'var(--text-secondary)' }}>
                            Are you sure you want to remove "{selectedMovie?.title}" from your list?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel style={{ borderColor: 'var(--card-border)' }}>Cancel</AlertDialogCancel>
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
