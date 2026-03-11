import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';

interface Movie {
    id: number;
    title: string;
    poster: string;
    year: number;
}

interface WatchedModalProps {
    open: boolean;
    onClose: () => void;
    movie: Movie | null;
}

export function WatchedModal({ open, onClose, movie }: WatchedModalProps) {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!movie || rating === 0 || submitting) return;

        setSubmitting(true);
        
        router.post(`/movies/${movie.id}/mark-watched`, {
            user_rating: rating,
        }, {
            onSuccess: () => {
                setSubmitting(false);
                setRating(0);
                onClose();
            },
            onError: () => {
                setSubmitting(false);
            },
        });
    };

    if (!movie) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="bg-neutral-900 border-neutral-800 text-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Mark as Watched</DialogTitle>
                    <DialogDescription className="text-neutral-400">
                        Rate this movie from 1 to 10 stars
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="flex gap-4">
                        <div className="w-24 h-36 bg-neutral-800 rounded overflow-hidden flex-shrink-0">
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
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">{movie.title}</h3>
                            <p className="text-neutral-400">{movie.year}</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-3">Your Rating</label>
                        <div className="flex gap-2 justify-center">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => setRating(value)}
                                    onMouseEnter={() => setHoveredRating(value)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    className="transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`h-8 w-8 ${
                                            value <= (hoveredRating || rating)
                                                ? 'fill-[#F5C518] text-[#F5C518]'
                                                : 'text-neutral-600'
                                        }`}
                                    />
                                </button>
                            ))}
                        </div>
                        <div className="text-center mt-2 text-[#F5C518] font-semibold">
                            {rating > 0 ? `${rating}/10` : 'Select a rating'}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} className="border-neutral-700">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={rating === 0 || submitting}
                        className="bg-[#F5C518] text-black hover:bg-[#F5C518]/90"
                    >
                        {submitting ? 'Saving...' : 'Confirm'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
