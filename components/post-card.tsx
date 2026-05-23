'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/auth-provider';
import type { Post } from '@/lib/types';
import { ArrowUp, ArrowDown, MessageCircle, Clock, Pin, Trash2, Flag, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ReportDialog } from '@/components/report-dialog';
import { toast } from 'sonner';

function getPostLink(post: Post): string {
  const categoryRoutes: Record<string, string> = {
    confession: 'confessions',
    tea: 'tea-table',
    meme: 'tea-table',
    poll: 'tea-table',
    npc_week: 'rankings',
    student_desc: 'rankings',
    teacher: 'teachers',
    dare: 'dares',
  };
  const route = categoryRoutes[post.category] ?? '';
  return `/${route}/${post.id}`;
}

interface PostCardProps {
  post: Post;
  onVoteChange?: (postId: string, newUpvotes: number, newDownvotes: number, userVote: 'up' | 'down' | null) => void;
  compact?: boolean;
  fullContent?: boolean;
  onDelete?: (postId: string) => void;
}

export function PostCard({ post, onVoteChange, compact, fullContent, onDelete }: PostCardProps) {
  const { user, profile } = useAuth();
  const [upvotes, setUpvotes] = useState(post.upvotes);
  const [downvotes, setDownvotes] = useState(post.downvotes);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(post.user_vote ?? null);
  const [voting, setVoting] = useState(false);

  const isAdmin = profile?.is_admin === true;
  const score = upvotes - downvotes;

  const handleVote = async (type: 'up' | 'down') => {
    if (!user || voting) return;
    setVoting(true);

    try {
      if (userVote === type) {
        const { error } = await supabase
          .from('votes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', post.id);
        if (error) throw error;

        if (type === 'up') setUpvotes((p) => p - 1);
        else setDownvotes((p) => p - 1);
        setUserVote(null);
        onVoteChange?.(post.id, type === 'up' ? upvotes - 1 : upvotes, type === 'down' ? downvotes - 1 : downvotes, null);
      } else {
        if (userVote) {
          const { error } = await supabase
            .from('votes')
            .update({ vote_type: type })
            .eq('user_id', user.id)
            .eq('post_id', post.id);
          if (error) throw error;

          if (type === 'up') {
            setUpvotes((p) => p + 1);
            setDownvotes((p) => p - 1);
          } else {
            setUpvotes((p) => p - 1);
            setDownvotes((p) => p + 1);
          }
        } else {
          const { error } = await supabase
            .from('votes')
            .insert({ user_id: user.id, post_id: post.id, vote_type: type });
          if (error) throw error;

          if (type === 'up') setUpvotes((p) => p + 1);
          else setDownvotes((p) => p + 1);
        }
        setUserVote(type);
        onVoteChange?.(post.id, type === 'up' ? upvotes + 1 : upvotes - 1, type === 'down' ? downvotes + 1 : downvotes - 1, type);
      }
    } catch {
      // silently fail
    }
    setVoting(false);
  };

  const handleDelete = async () => {
    const { error } = await supabase.from('posts').delete().eq('id', post.id);
    if (!error) {
      toast.success('Post deleted');
      onDelete?.(post.id);
    } else {
      toast.error('Failed to delete');
    }
  };

  const handlePin = async () => {
    const { error } = await supabase
      .from('posts')
      .update({ is_pinned: !post.is_pinned })
      .eq('id', post.id);

    if (!error) {
      toast.success(post.is_pinned ? 'Post unpinned' : 'Post pinned');
    } else {
      toast.error('Failed to pin post');
    }
  };

  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });
  const postLink = getPostLink(post);

  return (
    <div className={cn(
      'bg-card rounded-xl border border-border p-4 transition-all duration-200 hover:border-border/80 animate-fade-in',
      post.is_pinned && 'border-yellow-500/30'
    )}>
      <div className="flex items-center gap-2 mb-2">
        {post.is_pinned && <Pin className="w-3.5 h-3.5 text-yellow-500" />}
        <span className="text-sm text-muted-foreground">
          {post.profiles?.username ?? 'anonymous'}
          {post.profiles?.is_admin && <span className="ml-1 text-amber-400 font-medium">(admin)</span>}
        </span>
        <span className="text-xs text-muted-foreground/60 ml-auto flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {timeAgo}
        </span>
      </div>

      <Link href={postLink}>
        <h3 className={cn(
          'font-helvetica-bold text-foreground mb-1 hover:text-foreground/80 transition-colors',
          compact ? 'text-sm' : 'text-base'
        )}>
          {post.title}
        </h3>
        {post.content && !compact && (
          <p className="text-sm text-muted-foreground mb-3">
            {post.content}
          </p>
        )}
      </Link>

      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {post.tags.map((tag) => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleVote('up')}
            disabled={!user || voting}
            className={cn(
              'vote-btn p-1 rounded hover:bg-secondary/50 disabled:opacity-30',
              userVote === 'up' && 'upvoted'
            )}
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <span className={cn(
            'text-sm font-medium min-w-[2ch] text-center',
            score > 0 ? 'text-red-400' : score < 0 ? 'text-blue-400' : 'text-muted-foreground'
          )}>
            {score}
          </span>
          <button
            onClick={() => handleVote('down')}
            disabled={!user || voting}
            className={cn(
              'vote-btn p-1 rounded hover:bg-secondary/50 disabled:opacity-30',
              userVote === 'down' && 'downvoted'
            )}
          >
            <ArrowDown className="w-4 h-4" />
          </button>
        </div>

        <Link
          href={postLink}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{post.comment_count}</span>
        </Link>

        <div className="ml-auto flex items-center gap-1">
          {user && <ReportDialog postId={post.id} />}
          {isAdmin && (
            <>
              <button
                onClick={handlePin}
                className={cn(
                  'p-1 rounded transition-colors',
                  post.is_pinned
                    ? 'text-yellow-500 hover:text-yellow-400'
                    : 'text-muted-foreground hover:text-yellow-500'
                )}
              >
                <Pin className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleDelete}
                className="p-1 rounded text-muted-foreground hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
