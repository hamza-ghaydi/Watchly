import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Trash2, Star, Calendar, Clock, Film } from 'lucide-react';

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
    director?: string;
    actors?: string;
    runtime?: string;
    user_rating?: number;
    watched_at?: string;
}

interface MovieDetailsModalProps {
    open: boolean;
    onClose: () => void;
    movie: Movie | null;
    onMarkWatched?: (movie: Movie) => void;
    onDelete?: (movie: Movie) => void;
    showActions?: boolean;
}

export function MovieDetailsModal({ 
    open, 
    onClose, 
    movie, 
    onMarkWatched, 
    onDelete,
    showActions = true 
}: MovieDetailsModalProps) {
    if (!movie) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent 
                className="max-w-4xl max-h-[90vh] overflow-y-auto"
                style={{ background: 'var(--surface)', borderColor: 'var(--card-border)' }}
            >
                <DialogHeader>
                    <DialogTitle style={{ color: 'var(--text-primary)' }}>
                        {movie.title}
                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Poster */}
                    <div className="md:col-span-1">
                        <div className="aspect-2/3 rounded-lg overflow-hidden" style={{ background: 'var(--background)' }}>
                            {movie.poster && movie.poster !== 'N/A' ? (
                                <img
                                    src={movie.poster}
                                    alt={movie.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-6xl">
                                    🎬
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Details */}
                    <div className="md:col-span-2 space-y-4">
                        {/* Badges */}
                        <div className="flex flex-wrap gap-2">
                            <span 
                                className="px-3 py-1 text-sm font-semibold rounded-lg"
                                style={{ 
                                    background: movie.type === 'movie' ? 'var(--movie)' : 'var(--series)',
                                    color: 'white'
                                }}
                            >
                                {movie.type}
                            </span>
                            {movie.imdb_rating && movie.imdb_rating !== 'N/A' && (
                                <span 
                                    className="px-3 py-1 text-sm font-bold rounded-lg"
                                    style={{ 
                                        background: 'var(--gold)',
                                        color: '#0D1117'
                                    }}
                                >
                                    ⭐ {movie.imdb_rating} IMDB
                                </span>
                            )}
                            {movie.user_rating && (
                                <span 
                                    className="px-3 py-1 text-sm font-bold rounded-lg flex items-center gap-1"
                                    style={{ 
                                        background: 'var(--watched)',
                                        color: 'white'
                                    }}
                                >
                                    <Star className="h-4 w-4 fill-current" />
                                    {movie.user_rating}/10 Your Rating
                                </span>
                            )}
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            {movie.year && (
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" style={{ color: 'var(--gold)' }} />
                                    <div>
                                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Year</div>
                                        <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{movie.year}</div>
                                    </div>
                                </div>
                            )}
                            {movie.runtime && (
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" style={{ color: 'var(--gold)' }} />
                                    <div>
                                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Runtime</div>
                                        <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{movie.runtime}</div>
                                    </div>
                                </div>
                            )}
                            {movie.genre && (
                                <div className="flex items-center gap-2 col-span-2">
                                    <Film className="h-4 w-4" style={{ color: 'var(--gold)' }} />
                                    <div>
                                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Genre</div>
                                        <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{movie.genre}</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Plot */}
                        {movie.plot && movie.plot !== 'N/A' && (
                            <div>
                                <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                                    Plot
                                </h3>
                                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                    {movie.plot}
                                </p>
                            </div>
                        )}

                        {/* Director */}
                        {movie.director && movie.director !== 'N/A' && (
                            <div>
                                <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                                    Director
                                </h3>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                    {movie.director}
                                </p>
                            </div>
                        )}

                        {/* Actors */}
                        {movie.actors && movie.actors !== 'N/A' && (
                            <div>
                                <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                                    Cast
                                </h3>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                    {movie.actors}
                                </p>
                            </div>
                        )}

                        {/* Watched Date */}
                        {movie.watched_at && (
                            <div>
                                <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                                    Watched On
                                </h3>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                    {new Date(movie.watched_at).toLocaleDateString('en-US', { 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                    })}
                                </p>
                            </div>
                        )}

                        {/* Actions */}
                        {showActions && (
                            <div className="flex gap-2 pt-4">
                                {onMarkWatched && (
                                    <Button
                                        onClick={() => {
                                            onMarkWatched(movie);
                                            onClose();
                                        }}
                                        className="flex-1 text-black hover:opacity-90"
                                        style={{ background: 'var(--gold)' }}
                                    >
                                        <Eye className="h-4 w-4 mr-2" />
                                        Mark as Watched
                                    </Button>
                                )}
                                {onDelete && (
                                    <Button
                                        variant="destructive"
                                        onClick={() => {
                                            onDelete(movie);
                                            onClose();
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
