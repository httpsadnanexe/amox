'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/auth-provider';
import type { Post } from '@/lib/types';
import { PostCard } from '@/components/post-card';
import { PostSkeleton } from '@/components/skeletons';
import { CreatePost } from '@/components/create-post';
import { Users, User, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'npc_week' | 'student_desc';

export default function StudentsPage() {
  const { user, profile } = useAuth();
  const [tab, setTab] = useState<Tab>('npc_week');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = profile?.is_admin === true;

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('posts')
      .select('*, profiles(username)')
      .eq('category', tab)
      .order('created_at', { ascending: false })
      .limit(20);

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

      setPosts(postsWithVotes);
    }
    setLoading(false);
  }, [tab, user]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div className="animate-fade-in">
        <h1 className="font-helvetica-bold text-2xl md:text-3xl text-foreground flex items-center gap-2">
          <Users className="w-6 h-6 text-emerald-400" />
          Students
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          NPC of the Week and student archetypes. Only admins can post here.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setTab('npc_week')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-200',
            tab === 'npc_week' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
          )}
        >
          <GraduationCap className="w-3.5 h-3.5" /> Teacher Descriptions
        </button>
        <button
          onClick={() => setTab('student_desc')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-200',
            tab === 'student_desc' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
          )}
        >
          <Users className="w-3.5 h-3.5" /> Student Descriptions
        </button>
      </div>

      {isAdmin && <CreatePost category={tab} />}

      {loading ? (
        <div className="space-y-3">
          <PostSkeleton />
          <PostSkeleton />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="font-helvetica-bold text-lg">Nothing here yet</p>
          <p className="text-sm">Admin will post something soon!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
