'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/auth-provider';
import type { Post } from '@/lib/types';
import { PostCard } from '@/components/post-card';
import { CommentSection } from '@/components/comment-section';
import { PostSkeleton } from '@/components/skeletons';
import { ArrowLeft } from 'lucide-react';

export default function RankingPostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*, profiles(username)')
        .eq('id', params.id)
        .maybeSingle();

      if (!error && data) {
        let userVote = null;
        if (user) {
          const { data: vote } = await supabase
            .from('votes')
            .select('vote_type')
            .eq('user_id', user.id)
            .eq('post_id', params.id)
            .maybeSingle();
          userVote = vote?.vote_type ?? null;
        }
        setPost({ ...data, user_vote: userVote } as Post);
      }
      setLoading(false);
    };
    fetchPost();
  }, [params.id, user]);

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-6"><PostSkeleton /></div>;
  if (!post) return <div className="max-w-3xl mx-auto px-4 py-6 text-center text-muted-foreground">Post not found</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <PostCard post={post} />
      <CommentSection postId={post.id} />
    </div>
  );
}
