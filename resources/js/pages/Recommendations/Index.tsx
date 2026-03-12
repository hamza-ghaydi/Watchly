import { Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Flame, Heart, Zap, Moon, Meh, Smile, Frown, MessageCircle, Send } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Community Picks', href: '/recommendations' },
];

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
    movie: Movie;
    recommenders: Array<{ id: number; name: string; avatar: string | null }>;
    recommenders_label: string;
    others_names: string[];
    latest_note: string | null;
    total_recommenders: number;
    reaction_counts: { fire: number; heart: number; mind_blown: number; };
    user_already_recommended: boolean;
    user_reaction: string | null;
    recommendation_id: number;
    comments_count: number;
    can_add_to_watchlist: boolean;
    already_watched: boolean;
}

interface Comment {
    id: number;
    body: string;
    created_at: string;
    user: {
        id: number;
        name: string;
        username: string;
        avatar: string | null;
    };
    replies?: Comment[];
}

export default function Index() {
    const { recommendations, sort } = usePage<{
        recommendations: { data: Recommendation[]; current_page: number; last_page: number };
        sort: string;
    }>().props;

    const [localRecs, setLocalRecs] = useState(recommendations.data);
    const [commentModalOpen, setCommentModalOpen] = useState(false);
    const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [commentBody, setCommentBody] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [replyingTo, setReplyingTo] = useState<{ id: number; username: string } | null>(null);

    // Update local state when recommendations change from server
    useEffect(() => {
        setLocalRecs(recommendations.data);
    }, [recommendations.data]);

    const handleSort = (newSort: string) => {
        router.get('/recommendations', { sort: newSort }, { 
            preserveScroll: true,
        });
    };

    const handleReaction = async (recIndex: number, type: string, recommendationId: number) => {
        const rec = localRecs[recIndex];
        const prevReaction = rec.user_reaction;
        const prevCounts = { ...rec.reaction_counts };

        // Optimistic update
        const newRecs = [...localRecs];
        if (prevReaction === type) {
            // Toggle off
            newRecs[recIndex].user_reaction = null;
            newRecs[recIndex].reaction_counts = {
                ...newRecs[recIndex].reaction_counts,
                [type]: Math.max(0, newRecs[recIndex].reaction_counts[type as keyof typeof prevCounts] - 1)
            };
        } else {
            // Change or add reaction
            if (prevReaction) {
                newRecs[recIndex].reaction_counts = {
                    ...newRecs[recIndex].reaction_counts,
                    [prevReaction]: Math.max(0, newRecs[recIndex].reaction_counts[prevReaction as keyof typeof prevCounts] - 1)
                };
            }
            newRecs[recIndex].user_reaction = type;
            newRecs[recIndex].reaction_counts = {
                ...newRecs[recIndex].reaction_counts,
                [type]: newRecs[recIndex].reaction_counts[type as keyof typeof prevCounts] + 1
            };
        }
        setLocalRecs(newRecs);

        try {
            const response = await axios.post('/reactions/toggle', {
                recommendation_id: recommendationId,
                type,
            });
            // Update with server response
            newRecs[recIndex].reaction_counts = response.data.reaction_counts;
            newRecs[recIndex].user_reaction = response.data.user_reaction;
            setLocalRecs([...newRecs]);
        } catch (error: any) {
            console.error('Reaction error:', error.response?.data);
            // Revert on error
            newRecs[recIndex].user_reaction = prevReaction;
            newRecs[recIndex].reaction_counts = prevCounts;
            setLocalRecs([...newRecs]);
        }
    };

    const handleAddToWatchlist = (movieId: number, index: number) => {
        const newRecs = [...localRecs];
        newRecs[index].can_add_to_watchlist = false;
        setLocalRecs(newRecs);

        router.post('/movies/from-recommendation', { movie_id: movieId });
    };

    const handleOpenComments = async (rec: Recommendation, index: number) => {
        setSelectedRec({ ...rec, index } as any);
        setCommentModalOpen(true);
        setLoadingComments(true);
        setComments([]);
        setCommentBody('');

        try {
            const response = await axios.get(`/recommendations/${rec.recommendation_id}/comments`);
            setComments(response.data.comments);
        } catch (error) {
            console.error('Failed to load comments:', error);
        } finally {
            setLoadingComments(false);
        }
    };

    const handlePostComment = async () => {
        if (!selectedRec || !commentBody.trim()) return;

        setSubmittingComment(true);
        try {
            const response = await axios.post(`/recommendations/${selectedRec.recommendation_id}/comments`, {
                body: commentBody.trim(),
                parent_id: replyingTo?.id || null,
            });

            if (replyingTo) {
                // Add reply to the parent comment
                const newComments = comments.map(comment => {
                    if (comment.id === replyingTo.id) {
                        return {
                            ...comment,
                            replies: [...(comment.replies || []), response.data.comment],
                        };
                    }
                    return comment;
                });
                setComments(newComments);
            } else {
                // Add new top-level comment
                setComments([...comments, response.data.comment]);
            }

            setCommentBody('');
            setReplyingTo(null);

            // Update comments count in local state
            const newRecs = [...localRecs];
            const recIndex = (selectedRec as any).index;
            newRecs[recIndex].comments_count += 1;
            setLocalRecs(newRecs);
        } catch (error) {
            console.error('Failed to post comment:', error);
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleReply = (commentId: number, username: string) => {
        setReplyingTo({ id: commentId, username });
        setCommentBody('');
    };

    const handleCancelReply = () => {
        setReplyingTo(null);
        setCommentBody('');
    };

    const handleCloseCommentModal = () => {
        setCommentModalOpen(false);
        setSelectedRec(null);
        setComments([]);
        setCommentBody('');
        setReplyingTo(null);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Community Picks" />
            <div className="relative z-10 flex h-full flex-1 flex-col gap-6 p-4 sm:p-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        Community Picks
                    </h1>
                    <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
                        Movies and series recommended by the Watchly community
                    </p>
                </div>

                <div className="flex gap-2 flex-wrap">
                    <Button
                        variant={sort === 'most_recommended' ? 'default' : 'outline'}
                        onClick={() => handleSort('most_recommended')}
                        className="text-xs sm:text-sm"
                        style={
                            sort === 'most_recommended'
                                ? { background: 'var(--gold)', color: '#0D1117' }
                                : { borderColor: 'var(--card-border)' }
                        }
                    >
                        Most Recommended
                    </Button>
                    <Button
                        variant={sort === 'most_recent' ? 'default' : 'outline'}
                        onClick={() => handleSort('most_recent')}
                        className="text-xs sm:text-sm"
                        style={
                            sort === 'most_recent'
                                ? { background: 'var(--gold)', color: '#0D1117' }
                                : { borderColor: 'var(--card-border)' }
                        }
                    >
                        Most Recent
                    </Button>
                    <Button
                        variant={sort === 'highest_rated' ? 'default' : 'outline'}
                        onClick={() => handleSort('highest_rated')}
                        className="text-xs sm:text-sm"
                        style={
                            sort === 'highest_rated'
                                ? { background: 'var(--gold)', color: '#0D1117' }
                                : { borderColor: 'var(--card-border)' }
                        }
                    >
                        Highest Rated
                    </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5">
                    {localRecs.map((rec, index) => (
                        <div key={rec.movie.id} className="watchly-card overflow-hidden">
                            <div className="aspect-2/3 overflow-hidden relative">
                                {rec.movie.poster && rec.movie.poster !== 'N/A' ? (
                                    <img src={rec.movie.poster} alt={rec.movie.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl">🎬</div>
                                )}
                                <div className="absolute top-2 right-2">
                                    <span
                                        className="px-2 py-1 text-xs font-bold rounded-lg"
                                        style={{ background: 'var(--gold)', color: '#0D1117' }}
                                    >
                                        ⭐ {rec.movie.imdb_rating}
                                    </span>
                                </div>
                            </div>
                            <div className="p-2 sm:p-4">
                                <h3 className="font-bold text-xs sm:text-sm mb-1 line-clamp-2" style={{ color: 'var(--text-primary)' }}>
                                    {rec.movie.title}
                                </h3>
                                <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
                                    {rec.movie.genre?.split(',')[0]} · {rec.movie.year}
                                </p>
                                <div className="border-t pt-2 mb-2" style={{ borderColor: 'var(--card-border)' }}>
                                    <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                                        Recommended by:{' '}
                                        {rec.others_names.length > 0 ? (
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <span className="cursor-help" style={{ color: 'var(--gold)' }}>
                                                            {rec.recommenders_label}
                                                        </span>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{rec.others_names.join(', ')}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        ) : (
                                            <span style={{ color: 'var(--gold)' }}>{rec.recommenders_label}</span>
                                        )}
                                    </p>
                                    {rec.latest_note && (
                                        <p className="text-xs italic mb-2 hidden sm:block" style={{ color: 'var(--text-secondary)' }}>
                                            "{rec.latest_note.substring(0, 80)}{rec.latest_note.length > 80 ? '...' : ''}"
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-1 sm:gap-2 mb-3">
                                    {[
                                        { type: 'fire', icon: Flame, emoji: <Smile /> },
                                        { type: 'heart', icon: Heart, emoji: <Meh /> },
                                        { type: 'mind_blown', icon: Zap, emoji: <Frown /> },
                                    ].map(({ type, emoji }) => (
                                        <button
                                            key={type}
                                            onClick={() => handleReaction(index, type, rec.recommendation_id)}
                                            className="flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded text-xs flex-1 justify-center"
                                            style={{
                                                background: rec.user_reaction === type ? 'var(--gold)' : 'transparent',
                                                border: `1px solid ${rec.user_reaction === type ? 'var(--gold)' : 'var(--card-border)'}`,
                                                color: rec.user_reaction === type ? '#0D1117' : 'var(--text-secondary)',
                                            }}
                                        >
                                            {emoji} {rec.reaction_counts[type as keyof typeof rec.reaction_counts]}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => handleOpenComments(rec, index)}
                                    className="flex items-center justify-center gap-1 px-2 py-1 rounded text-xs mb-3 w-full"
                                    style={{
                                        border: '1px solid var(--card-border)',
                                        color: 'var(--text-secondary)',
                                    }}
                                >
                                    <MessageCircle className="h-3 w-3" />
                                    {rec.comments_count || 0} {(rec.comments_count || 0) === 1 ? 'comment' : 'comments'}
                                </button>
                                {rec.can_add_to_watchlist && !rec.already_watched && (
                                    <Button
                                        size="sm"
                                        onClick={() => handleAddToWatchlist(rec.movie.id, index)}
                                        className="w-full text-black text-xs"
                                        style={{ background: 'var(--gold)' }}
                                    >
                                        + Add to Watchlist
                                    </Button>
                                )}
                                {!rec.can_add_to_watchlist && !rec.already_watched && (
                                    <Button size="sm" disabled className="w-full text-xs" style={{ opacity: 0.5 }}>
                                        In your list
                                    </Button>
                                )}
                                {rec.already_watched && (
                                    <Button size="sm" disabled className="w-full text-xs" style={{ opacity: 0.5 }}>
                                        Already watched
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Comment Modal */}
            <Dialog open={commentModalOpen} onOpenChange={handleCloseCommentModal}>
    <DialogContent
        className="w-[90vw] max-w-lg max-h-[85vh] overflow-hidden flex flex-col rounded-xl"
        style={{  borderColor: 'var(--card-border)' }}
    >
        {/* Header */}
        <DialogHeader className="pb-3 border-b" style={{ borderColor: 'var(--card-border)' }}>
            <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" style={{ color: 'var(--gold)' }} />
                <DialogTitle style={{ color: 'var(--text-primary)' }}>
                    Comments
                </DialogTitle>
            </div>
            <DialogDescription className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
                Share your thoughts about this recommendation
            </DialogDescription>
        </DialogHeader>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3 min-h-0">
            {loadingComments ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2" style={{ color: 'var(--text-secondary)' }}>
                    <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--gold)', borderTopColor: 'transparent' }} />
                    <span className="text-sm">Loading comments...</span>
                </div>
            ) : comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                    <MessageCircle className="h-10 w-10 opacity-30" />
                    <p className="text-sm font-medium">No comments yet</p>
                    <p className="text-xs opacity-70">Be the first to share your thoughts!</p>
                </div>
            ) : (
                comments.map((comment) => (
                    <div key={comment.id} className="space-y-2">
                        <div
                            className="p-3 rounded-lg transition-opacity hover:opacity-90"
                            style={{ border: '1px solid var(--card-border)', background: 'var(--background)' }}
                        >
                            <div className="flex items-start gap-2.5">
                                <div className="flex-shrink-0">
                                    {comment.user.avatar ? (
                                        <img
                                            src={comment.user.avatar}
                                            alt={comment.user.name}
                                            className="w-8 h-8 rounded-full object-cover ring-1"
                                        />
                                    ) : (
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                                            style={{ background: 'var(--gold)', color: '#0D1117' }}
                                        >
                                            {comment.user.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                        <span className="font-semibold text-sm leading-none" style={{ color: 'var(--gold)' }}>
                                            {comment.user.name}
                                        </span>
                                        <span className="text-xs leading-none" style={{ color: 'var(--text-secondary)' }}>
                                            @{comment.user.username}
                                        </span>
                                        <span className="text-xs leading-none ml-auto" style={{ color: 'var(--text-secondary)' }}>
                                            {comment.created_at}
                                        </span>
                                    </div>
                                    <p className="text-sm break-words leading-relaxed mb-2" style={{ color: 'var(--text-primary)' }}>
                                        {comment.body}
                                    </p>
                                    <button
                                        onClick={() => handleReply(comment.id, comment.user.username)}
                                        className="text-xs font-medium hover:underline"
                                        style={{ color: 'var(--gold)' }}
                                    >
                                        Reply
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                            <div className="ml-8 space-y-2">
                                {comment.replies.map((reply) => (
                                    <div
                                        key={reply.id}
                                        className="p-3 rounded-lg transition-opacity hover:opacity-90"
                                        style={{ border: '1px solid var(--card-border)', background: 'var(--background)' }}
                                    >
                                        <div className="flex items-start gap-2.5">
                                            <div className="flex-shrink-0">
                                                {reply.user.avatar ? (
                                                    <img
                                                        src={reply.user.avatar}
                                                        alt={reply.user.name}
                                                        className="w-7 h-7 rounded-full object-cover ring-1"
                                                    />
                                                ) : (
                                                    <div
                                                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                                                        style={{ background: 'var(--gold)', color: '#0D1117' }}
                                                    >
                                                        {reply.user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                                    <span className="font-semibold text-sm leading-none" style={{ color: 'var(--gold)' }}>
                                                        {reply.user.name}
                                                    </span>
                                                    <span className="text-xs leading-none" style={{ color: 'var(--text-secondary)' }}>
                                                        @{reply.user.username}
                                                    </span>
                                                    <span className="text-xs leading-none ml-auto" style={{ color: 'var(--text-secondary)' }}>
                                                        {reply.created_at}
                                                    </span>
                                                </div>
                                                <p className="text-sm break-words leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                                                    {reply.body}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>

        {/* Comment Input */}
        <div className="border-t pt-3 mt-auto" style={{ borderColor: 'var(--card-border)' }}>
            {replyingTo && (
                <div className="flex items-center justify-between mb-2 p-2 rounded" style={{ background: 'var(--background)', border: '1px solid var(--card-border)' }}>
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        Replying to <span style={{ color: 'var(--gold)' }}>@{replyingTo.username}</span>
                    </span>
                    <button
                        onClick={handleCancelReply}
                        className="text-xs font-medium hover:underline"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        Cancel
                    </button>
                </div>
            )}
            <Textarea
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                placeholder={replyingTo ? `Reply to @${replyingTo.username}...` : "Write a comment..."}
                maxLength={500}
                rows={2}
                className="mb-2 w-full resize-none text-sm"
                style={{
                    borderColor: 'var(--card-border)',
                    color: 'var(--text-primary)',
                    background: 'var(--background)',
                }}
            />
            <div className="flex items-center justify-between gap-2">
                <span className="text-xs" style={{ color: commentBody.length > 450 ? '#f87171' : 'var(--text-secondary)' }}>
                    {commentBody.length}/500
                </span>
                <Button
                    onClick={handlePostComment}
                    disabled={!commentBody.trim() || submittingComment}
                    size="sm"
                    style={{
                        background: 'var(--gold)',
                        color: '#0D1117',
                        opacity: !commentBody.trim() || submittingComment ? 0.5 : 1,
                    }}
                >
                    {submittingComment ? (
                        <span className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full border border-t-transparent animate-spin" style={{ borderColor: '#0D1117', borderTopColor: 'transparent' }} />
                            Posting...
                        </span>
                    ) : (
                        <span className="flex items-center gap-1.5">
                            <Send className="h-3.5 w-3.5" />
                            Post
                        </span>
                    )}
                </Button>
            </div>
        </div>
    </DialogContent>
</Dialog>
        </AppLayout>
    );
}
