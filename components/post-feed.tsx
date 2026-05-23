'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/auth-provider';
import type { Post } from '@/lib/types';
import { PostCard } from '@/components/post-card';
import { PostSkeleton } from '@/components/skeletons';

interface PostFeedProps {
  category?: string;
  orderBy?: string;
  limit?: number;
}

export function PostFeed({ category, orderBy = 'created_at', limit = 20 }: PostFeedProps) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastPostRef = useRef<HTMLDivElement | null>(null);

  const fetchPosts = useCallback(async (offset = 0) => {
    if (offset === 0) setLoading(true);
    else setLoadingMore(true);

    let query = supabase
      .from('posts')
      .select('*, profiles(username)')
      .order(orderBy, { ascending: orderBy === 'upvotes' })
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (!error && data) {
      let postsWithVotes: Post[] = data as Post[];

      if (user) {
        const postIds = postsWithVotes.map((p) => p.id);
        if (postIds.length > 0) {
          const { data: votes } = await supabase
            .from('votes')
            .select('post_id, vote_type')
            .eq('user_id', user.id)
            .in('post_id', postIds);

          const voteMap = new Map(votes?.map((v) => [v.post_id, v.vote_type]));
          postsWithVotes = postsWithVotes.map((p) => ({
            ...p,
            user_vote: (voteMap.get(p.id) as 'up' | 'down') ?? null,
          }));
        }
      }

      if (category === 'poll') {
        const pollPostIds = postsWithVotes.filter((p) => p.category === 'poll').map((p) => p.id);
        if (pollPostIds.length > 0) {
          const { data: options } = await supabase
            .from('poll_options')
            .select('*')
            .in('post_id', pollPostIds);
          const optionsMap = new Map<string, typeof options>();
          options?.forEach((o) => {
            const arr = optionsMap.get(o.post_id) || [];
            arr.push(o);
            optionsMap.set(o.post_id, arr);
          });
          postsWithVotes = postsWithVotes.map((p) => ({
            ...p,
            poll_options: optionsMap.get(p.id) || [],
          }));
        }
      }

      if (offset === 0) {
        setPosts(postsWithVotes);
      } else {
        setPosts((prev) => [...prev, ...postsWithVotes]);
      }
      setHasMore(data.length === limit);
    }

    if (offset === 0) setLoading(false);
    else setLoadingMore(false);
  }, [category, orderBy, limit, user]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const lastPostCallback = useCallback(
    (node: HTMLDivElement | null) => {
      if (loadingMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchPosts(posts.length);
        }
      });

      if (node) observer.current.observe(node);
      lastPostRef.current = node;
    },
    [loadingMore, hasMore, fetchPosts, posts.length]
  );

  const handleVoteChange = (postId: string, newUpvotes: number, newDownvotes: number, userVote: 'up' | 'down' | null) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, upvotes: newUpvotes, downvotes: newDownvotes, user_vote: userVote } : p
      )
    );
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <PostSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg font-helvetica-bold mb-1">Nothing here yet</p>
        <p className="text-sm">Be the first to post!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((post, index) => (
        <div
          key={post.id}
          ref={index === posts.length - 1 ? lastPostCallback : undefined}
        >
          <PostCard post={post} onVoteChange={handleVoteChange} />
        </div>
      ))}
      {loadingMore && (
        <div className="space-y-3">
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}
    </div>
  );
}
