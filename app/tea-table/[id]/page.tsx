'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/auth-provider';
import type { Post } from '@/lib/types';
import { PostCard } from '@/components/post-card';
import { CommentSection } from '@/components/comment-section';
import { PollDisplay } from '@/components/poll-display';
import { PostSkeleton } from '@/components/skeletons';
import { ArrowLeft } from 'lucide-react';

export default function TeaPostDetailPage() {
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

      if (error || !data) {
        setLoading(false);
        return;
      }

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

      let pollOptions = [];
      if (data.category === 'poll') {
        const { data: options } = await supabase
          .from('poll_options')
          .select('*')
          .eq('post_id', params.id);
        pollOptions = options ?? [];
      }

      setPost({ ...data, user_vote: userVote, poll_options: pollOptions } as Post);
      setLoading(false);
    };

    fetchPost();
  }, [params.id, user]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <PostSkeleton />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 text-center text-muted-foreground">
        <p>Post not found</p>
        <button onClick={() => router.back()} className="mt-4 text-sm underline">Go back</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <PostCard post={post} />

      {post.category === 'poll' && post.poll_options && (
        <PollDisplay postId={post.id} options={post.poll_options} />
      )}

      <CommentSection postId={post.id} />
    </div>
  );
}
