'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { PostCard } from '@/components/post-card';
import { ProfileSkeleton, PostSkeleton } from '@/components/skeletons';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Post, Achievement } from '@/lib/types';
import { useState } from 'react';
import { User, FileText, MessageCircle, ArrowUp, Award, LogOut, Shield, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, profile, signOut, loading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const [postsRes, achievementsRes] = await Promise.all([
        supabase
          .from('posts')
          .select('*, profiles(username)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('achievements')
          .select('*')
          .eq('user_id', user.id)
          .order('earned_at', { ascending: false }),
      ]);

      if (postsRes.data) setPosts(postsRes.data as Post[]);
      if (achievementsRes.data) setAchievements(achievementsRes.data as Achievement[]);
      setLoadingData(false);
    };

    fetchData();
  }, [user]);

  const handleDeletePost = async (postId: string) => {
    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (!error) {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      toast.success('Post deleted');
    } else {
      toast.error('Failed to delete');
    }
  };

  if (loading || !user || !profile) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <ProfileSkeleton />
      </div>
    );
  }

  const isAdmin = profile.is_admin;

  const stats = [
    { label: 'Posts', value: profile.posts_count, icon: FileText },
    { label: 'Comments', value: profile.comments_count, icon: MessageCircle },
    { label: 'Upvotes', value: profile.upvotes_received, icon: ArrowUp },
    { label: 'Aura', value: profile.aura, icon: Shield },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div className="animate-fade-in">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
            <User className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h1 className="font-helvetica-bold text-2xl text-foreground">{profile.username}</h1>
            <p className="text-sm text-muted-foreground">
              Anonymous member
              {isAdmin && <span className="ml-2 text-amber-400 font-medium">Admin</span>}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-slide-up">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-card border-border">
            <CardContent className="p-3 text-center">
              <stat.icon className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
              <p className="font-helvetica-bold text-lg text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {isAdmin && (
        <div className="flex gap-2 animate-fade-in">
          <Link href="/admin">
            <Button variant="outline" className="border-border text-muted-foreground hover:text-foreground">
              <Shield className="w-4 h-4 mr-2" /> Admin Dashboard
            </Button>
          </Link>
          <Link href="/dares">
            <Button variant="outline" className="border-border text-muted-foreground hover:text-foreground">
              Post a Dare
            </Button>
          </Link>
        </div>
      )}

      {achievements.length > 0 && (
        <div className="animate-fade-in">
          <h2 className="font-helvetica-bold text-base mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" /> Achievements
          </h2>
          <div className="flex flex-wrap gap-2">
            {achievements.map((a) => (
              <span
                key={a.id}
                className="text-xs px-3 py-1.5 rounded-full bg-secondary text-foreground border border-border"
              >
                {a.achievement_type}
              </span>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="font-helvetica-bold text-base mb-3">Your Posts</h2>
        {loadingData ? (
          <div className="space-y-3">
            <PostSkeleton />
            <PostSkeleton />
          </div>
        ) : posts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No posts yet. Go make some noise!
          </p>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <div key={post.id} className="relative">
                <PostCard post={post} compact />
                <button
                  onClick={() => handleDeletePost(post.id)}
                  className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-secondary/50 transition-all duration-200"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-4">
        <Button
          variant="outline"
          onClick={signOut}
          className="w-full border-border text-muted-foreground hover:text-foreground"
        >
          <LogOut className="w-4 h-4 mr-2" /> Sign Out
        </Button>
      </div>
    </div>
  );
}
