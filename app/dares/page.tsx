'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/auth-provider';
import type { Post } from '@/lib/types';
import { PostCard } from '@/components/post-card';
import { PostSkeleton } from '@/components/skeletons';
import { CreatePost } from '@/components/create-post';
import { Target, Flame } from 'lucide-react';

export default function DaresPage() {
  const { user, profile } = useAuth();
  const [dares, setDares] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = profile?.is_admin === true;

  const fetchDares = useCallback(async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles(username)')
      .eq('category', 'dare')
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data) {
      let daresWithVotes: Post[] = data as Post[];

      if (user) {
        const postIds = daresWithVotes.map((p) => p.id);
        if (postIds.length > 0) {
          const { data: votes } = await supabase
            .from('votes')
            .select('post_id, vote_type')
            .eq('user_id', user.id)
            .in('post_id', postIds);

          const voteMap = new Map(votes?.map((v) => [v.post_id, v.vote_type]));
          daresWithVotes = daresWithVotes.map((p) => ({
            ...p,
            user_vote: (voteMap.get(p.id) as 'up' | 'down') ?? null,
          }));
        }
      }

      setDares(daresWithVotes);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchDares();
  }, [fetchDares]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div className="animate-fade-in">
        <h1 className="font-helvetica-bold text-2xl md:text-3xl text-foreground flex items-center gap-2">
          <Target className="w-6 h-6 text-orange-400" />
          School Dares IRL
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Admin drops dares. You complete them. Legends are made.
        </p>
      </div>

      {isAdmin && <CreatePost category="dare" />}

      {loading ? (
        <div className="space-y-3">
          <PostSkeleton />
          <PostSkeleton />
        </div>
      ) : dares.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground">
          <Flame className="w-8 h-8 mx-auto mb-3 text-orange-400" />
          <p className="font-helvetica-bold text-lg">No active dares</p>
          <p className="text-sm mt-1">The admin will post a dare soon. Stay ready!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {dares.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
