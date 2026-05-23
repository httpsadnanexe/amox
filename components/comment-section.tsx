'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/auth-provider';
import type { Comment } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CommentSkeleton } from '@/components/skeletons';
import { ArrowUp, ArrowDown, Send, MessageCircle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface CommentSectionProps {
  postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = profile?.is_admin === true;

  const fetchComments = useCallback(async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('*, profiles(username)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      let commentsWithVotes: Comment[] = data as Comment[];

      if (user) {
        const commentIds = commentsWithVotes.map((c) => c.id);
        if (commentIds.length > 0) {
          const { data: votes } = await supabase
            .from('comment_votes')
            .select('comment_id, vote_type')
            .eq('user_id', user.id)
            .in('comment_id', commentIds);

          const voteMap = new Map(votes?.map((v) => [v.comment_id, v.vote_type]));
          commentsWithVotes = commentsWithVotes.map((c) => ({
            ...c,
            user_vote: (voteMap.get(c.id) as 'up' | 'down') ?? null,
          }));
        }
      }

      setComments(commentsWithVotes);
    }
    setLoading(false);
  }, [postId, user]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async () => {
    if (!user || !newComment.trim() || submitting) return;
    setSubmitting(true);

    const { error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        content: newComment.trim(),
      });

    if (!error) {
      setNewComment('');
      fetchComments();
    }
    setSubmitting(false);
  };

  const handleCommentVote = async (commentId: string, type: 'up' | 'down', currentVote: 'up' | 'down' | null) => {
    if (!user) return;

    try {
      if (currentVote === type) {
        await supabase
          .from('comment_votes')
          .delete()
          .eq('user_id', user.id)
          .eq('comment_id', commentId);
      } else if (currentVote) {
        await supabase
          .from('comment_votes')
          .update({ vote_type: type })
          .eq('user_id', user.id)
          .eq('comment_id', commentId);
      } else {
        await supabase
          .from('comment_votes')
          .insert({ user_id: user.id, comment_id: commentId, vote_type: type });
      }
      fetchComments();
    } catch {
      // silently fail
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (!error) {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      toast.success('Comment deleted');
    } else {
      toast.error('Failed to delete comment');
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-helvetica-bold text-base flex items-center gap-2">
        <MessageCircle className="w-4 h-4" />
        Comments ({comments.length})
      </h3>

      {user && (
        <div className="flex gap-2">
          <Input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Drop a comment..."
            className="bg-secondary border-border text-foreground"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <Button
            onClick={handleSubmit}
            disabled={submitting || !newComment.trim()}
            size="icon"
            className="bg-foreground text-background hover:bg-foreground/90 shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      )}

      {!user && (
        <p className="text-xs text-muted-foreground text-center">Sign in to comment</p>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <CommentSkeleton key={i} />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No comments yet. Be the first!
        </p>
      ) : (
        <div className="space-y-1">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 py-3 border-b border-border/50 animate-fade-in">
              <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs font-medium text-muted-foreground shrink-0">
                {(comment.profiles?.username ?? 'A')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    {comment.profiles?.username ?? 'anonymous'}
                  </span>
                  <span className="text-xs text-muted-foreground/60">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-foreground break-words">{comment.content}</p>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={() => handleCommentVote(comment.id, 'up', comment.user_vote ?? null)}
                    disabled={!user}
                    className={cn(
                      'vote-btn p-0.5 rounded text-muted-foreground hover:text-foreground disabled:opacity-30',
                      comment.user_vote === 'up' && 'upvoted'
                    )}
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs text-muted-foreground">
                    {comment.upvotes - comment.downvotes}
                  </span>
                  <button
                    onClick={() => handleCommentVote(comment.id, 'down', comment.user_vote ?? null)}
                    disabled={!user}
                    className={cn(
                      'vote-btn p-0.5 rounded text-muted-foreground hover:text-foreground disabled:opacity-30',
                      comment.user_vote === 'down' && 'downvoted'
                    )}
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="p-0.5 rounded text-muted-foreground hover:text-red-400 transition-colors ml-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
