import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface Movie {
    id: number;
    title: string;
    year: number;
    poster: string;
    user_rating?: number;
}

interface RecommendModalProps {
    open: boolean;
    onClose: () => void;
    movie: Movie | null;
}

export function RecommendModal({ open, onClose, movie }: RecommendModalProps) {
    const [note, setNote] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!movie || submitting) return;
        
        setSubmitting(true);
        setError('');
        
        router.post('/recommendations', {
            movie_id: movie.id,
            note: note,
        }, {
            onSuccess: () => {
                setSubmitting(false);
                setNote('');
                onClose();
            },
            onError: (errors) => {
                setSubmitting(false);
                console.error('Recommendation error:', errors);
                setError(errors.movie_id || 'Failed to recommend movie');
            },
        });
    };

    if (!movie) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent style={{ borderColor: 'var(--card-border)' }}>
                <DialogHeader>
                    <DialogTitle style={{ color: 'var(--text-primary)' }}>Recommend to Community</DialogTitle>
                    <DialogDescription style={{ color: 'var(--text-secondary)' }}>
                        Share this movie with the Watchly community and tell them why you recommend it
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="text-red-400 text-sm">{error}</div>
                    )}
                    <div className="flex gap-4">
                        {movie.poster && movie.poster !== 'N/A' && (
                            <img src={movie.poster} alt={movie.title} className="w-20 h-30 object-cover rounded" />
                        )}
                        <div>
                            <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>
                                {movie.title}
                            </h3>
                            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                {movie.year}
                            </p>
                            {movie.user_rating && (
                                <p className="text-sm mt-1" style={{ color: 'var(--gold)' }}>
                                    Your rating: {movie.user_rating}/10 ⭐
                                </p>
                            )}
                        </div>
                    </div>
                    <div>
                        <Textarea
                            placeholder="Why do you recommend this? (optional)"
                            value={note}
                            onChange={(e) => setNote(e.target.value.substring(0, 160))}
                            maxLength={160}
                            rows={3}
                            style={{ borderColor: 'var(--card-border)', color: 'var(--text-primary)' }}
                        />
                        <p className="text-xs mt-1 text-right" style={{ color: 'var(--text-secondary)' }}>
                            {160 - note.length} characters remaining
                        </p>
                    </div>
                    <div className="flex gap-2 justify-end">
                        <Button type="button" variant="outline" onClick={onClose} style={{ borderColor: 'var(--card-border)' }}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={submitting}
                            className="text-black"
                            style={{ background: 'var(--gold)' }}
                        >
                            {submitting ? 'Recommending...' : 'Recommend'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
