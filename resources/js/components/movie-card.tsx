import { Eye, Trash2, Star, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

interface MovieCardProps {
    movie: Movie;
    onClick?: (movie: Movie) => void;
    onMarkWatched?: (movie: Movie) => void;
    onDelete?: (movie: Movie) => void;
    onRecommend?: (movie: Movie) => void;
    showActions?: boolean;
    showRecommend?: boolean;
}

export function MovieCard({ movie, onClick, onMarkWatched, onDelete, onRecommend, showActions = true, showRecommend = false }: MovieCardProps) {
    return (
        <div className="watchly-card overflow-hidden">
            <div 
                className="aspect-2/3 overflow-hidden cursor-pointer relative" 
                
                onClick={() => onClick?.(movie)}
            >
                {movie.poster && movie.poster !== 'N/A' ? (
                    <img
                        src={movie.poster}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                        🎬
                    </div>
                )}
                <div className="absolute top-2 right-2 flex flex-col gap-2">
                    <span 
                        className="px-2 py-1 text-xs font-semibold rounded-lg"
                        style={{ 
                            background: movie.type === 'movie' ? 'var(--movie)' : 'var(--series)',
                            color: 'white'
                        }}
                    >
                        {movie.type}
                    </span>
                    {movie.imdb_rating && movie.imdb_rating !== 'N/A' && (
                        <span 
                            className="px-2 py-1 text-xs font-bold rounded-lg"
                            style={{ 
                                background: 'var(--gold)',
                                color: '#0D1117'
                            }}
                        >
                            ⭐ {movie.imdb_rating}
                        </span>
                    )}
                    {movie.user_rating && (
                        <span 
                            className="px-2 py-1 text-xs font-bold rounded-lg"
                            style={{ 
                                background: 'var(--gold)',
                                color: '#0D1117'
                            }}
                        >
                            {movie.user_rating}/10
                        </span>
                    )}
                </div>
            </div>
            <div className="p-4">
                <h3 
                    className="font-bold text-sm mb-1 line-clamp-1 cursor-pointer hover:underline" 
                    style={{ color: 'var(--text-primary)' }}
                    onClick={() => onClick?.(movie)}
                >
                    {movie.title}
                </h3>
                <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
                    {movie.genre?.split(',')[0]} • {movie.year}
                </p>
                
                {showActions && (onMarkWatched || onDelete) && (
                    <div className="flex gap-2">
                        {onMarkWatched && (
                            <Button
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onMarkWatched(movie);
                                }}
                                className="flex-1 text-black hover:opacity-90"
                                style={{ background: 'var(--gold)' }}
                            >
                                <Eye className="h-4 w-4 mr-1" />
                                Watch
                            </Button>
                        )}
                        {onDelete && (
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(movie);
                                }}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                )}
                
                {showRecommend && onRecommend && (
                    <div className="mt-2">
                        {!movie.user_already_recommended ? (
                            <Button
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRecommend(movie);
                                }}
                                variant="outline"
                                className="w-full"
                                style={{ borderColor: 'var(--card-border)' }}
                            >
                                <ThumbsUp className="h-4 w-4 mr-1" />
                                Recommend
                            </Button>
                        ) : (
                            <Button
                                size="sm"
                                disabled
                                className="w-full"
                                style={{ background: 'var(--gold)', color: '#0D1117', opacity: 0.7 }}
                            >
                                Recommended ✓
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
