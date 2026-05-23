'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/auth-provider';
import type { Post } from '@/lib/types';
import { PostCard } from '@/components/post-card';
import { PostSkeleton } from '@/components/skeletons';
import { CreatePost } from '@/components/create-post';
import { CircleAlert as AlertCircle, Info } from 'lucide-react';

export default function NoticesPage() {
  const { user, profile } = useAuth();
  const [notices, setNotices] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = profile?.is_admin === true;

  const fetchNotices = useCallback(async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles(username)')
      .eq('category', 'notice')
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      let noticesWithVotes: Post[] = data as Post[];

      if (user) {
        const postIds = noticesWithVotes.map((p) => p.id);
        if (postIds.length > 0) {
          const { data: votes } = await supabase
            .from('votes')
            .select('post_id, vote_type')
            .eq('user_id', user.id)
            .in('post_id', postIds);

          const voteMap = new Map(votes?.map((v) => [v.post_id, v.vote_type]));
          noticesWithVotes = noticesWithVotes.map((p) => ({
            ...p,
            user_vote: (voteMap.get(p.id) as 'up' | 'down') ?? null,
          }));
        }
      }

      setNotices(noticesWithVotes);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div className="animate-fade-in">
        <h1 className="font-helvetica-bold text-2xl md:text-3xl text-foreground flex items-center gap-2">
          <AlertCircle className="w-6 h-6 text-blue-400" />
          Notices
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Important updates and information from admin
        </p>
      </div>

      {isAdmin && <CreatePost category="notice" />}

      {loading ? (
        <div className="space-y-3">
          <PostSkeleton />
          <PostSkeleton />
        </div>
      ) : notices.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground">
          <Info className="w-8 h-8 mx-auto mb-3 text-blue-400" />
          <p className="font-helvetica-bold text-lg">No notices yet</p>
          <p className="text-sm mt-1">Check back later for important updates and announcements</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notices.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
