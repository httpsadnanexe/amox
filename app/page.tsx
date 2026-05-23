'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';
import { PostCard } from '@/components/post-card';
import { CreatePost } from '@/components/create-post';
import { TeachersVoting } from '@/components/teachers-voting';
import { supabase } from '@/lib/supabase';
import type { Post } from '@/lib/types';
import { PostSkeleton } from '@/components/skeletons';
import { Heart, Coffee, Users, GraduationCap, Zap, TrendingUp, ArrowRight, MessageCircle, Target, Flame, CircleAlert as AlertCircle } from 'lucide-react';

const quickLinks = [
  { href: '/confessions', label: 'Confessions', icon: Heart, desc: 'Anonymous secrets', color: 'text-red-400' },
  { href: '/tea-table', label: 'Tea Table', icon: Coffee, desc: 'Gossip & memes', color: 'text-amber-400' },
  { href: '/rankings', label: 'Students', icon: Users, desc: 'NPC & student archetypes', color: 'text-emerald-400' },
  { href: '/teachers', label: 'Teachers', icon: GraduationCap, desc: 'Teacher rankings', color: 'text-pink-400' },
  { href: '/dares', label: 'Dares', icon: Target, desc: 'School challenges', color: 'text-orange-400' },
  { href: '/notices', label: 'Notices', icon: AlertCircle, desc: 'Admin updates & info', color: 'text-blue-400' },
];

export default function HomePage() {
  const { user } = useAuth();
  const [trendingPost, setTrendingPost] = useState<Post | null>(null);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [dares, setDares] = useState<Post[]>([]);
  const [loadingDares, setLoadingDares] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*, profiles(username)')
        .order('upvotes', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data && !error) {
        let userVote = null;
        if (user) {
          const { data: vote } = await supabase
            .from('votes')
            .select('vote_type')
            .eq('user_id', user.id)
            .eq('post_id', data.id)
            .maybeSingle();
          userVote = vote?.vote_type ?? null;
        }
        setTrendingPost({ ...data, user_vote: userVote } as Post);
      }
      setLoadingTrending(false);
    };

    const fetchDares = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*, profiles(username)')
        .eq('category', 'dare')
        .order('created_at', { ascending: false })
        .limit(5);

      if (data && !error) {
        setDares(data as Post[]);
      }
      setLoadingDares(false);
    };

    fetchTrending();
    fetchDares();
  }, [user]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Discord Banner */}
      <a
        href="https://discord.gg/Y3Xw83uuAb"
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-gradient-to-r from-[#5865F2] to-[#4752C4] rounded-xl p-4 md:p-6 text-white hover:shadow-lg transition-all duration-300 animate-fade-in group"
      >
        <div className="flex items-center gap-3 md:gap-4">
          <MessageCircle className="w-6 h-6 md:w-8 md:h-8 shrink-0 group-hover:scale-110 transition-transform" />
          <div className="flex-1">
            <h2 className="font-helvetica-bold text-base md:text-lg">Join The Oxfordian Exclusive Cult</h2>
            <p className="text-sm text-white/80">Connect with the community on Discord</p>
          </div>
          <ArrowRight className="w-5 h-5 shrink-0 group-hover:translate-x-1 transition-transform" />
        </div>
      </a>

      <div className="animate-fade-in">
        <h1 className="font-helvetica-bold text-3xl md:text-4xl text-foreground mb-2">
          A.M. Oxford Online
        </h1>
        <p className="text-muted-foreground text-sm">
          The anonymous school community. Spill tea, confess, rank, and vibe.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-slide-up">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="bg-card border border-border rounded-xl p-3 hover:border-border/80 transition-all duration-200 group"
          >
            <link.icon className={`w-5 h-5 ${link.color} mb-2 group-hover:scale-110 transition-transform duration-200`} />
            <p className="font-helvetica-bold text-sm text-foreground">{link.label}</p>
            <p className="text-xs text-muted-foreground">{link.desc}</p>
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground animate-fade-in">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Community active</span>
        </div>
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Trending now</span>
        </div>
      </div>

      {user && <CreatePost category="confession" />}

      {/* Teacher Stats Banner */}
      {trendingPost && (
        <div className="grid grid-cols-2 gap-3 animate-fade-in">
          {/* Pookie Teacher (Most Upvotes) */}
          <div className="bg-gradient-to-br from-amber-500/20 to-amber-500/10 border border-amber-500/30 rounded-xl p-4">
            <p className="text-xs text-amber-400/70 mb-2 font-medium">POOKIE TEACHER</p>
            <p className="font-helvetica-bold text-sm text-foreground">Most Loved</p>
            <p className="text-xs text-amber-400 mt-1 truncate">See in ranking</p>
          </div>

          {/* Cruelest Teacher (Most Downvotes) */}
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <p className="text-xs text-blue-400/70 mb-2 font-medium">CRUELEST TEACHER</p>
            <p className="font-helvetica-bold text-sm text-foreground">Most Feared</p>
            <p className="text-xs text-blue-400 mt-1 truncate">See in ranking</p>
          </div>
        </div>
      )}

      {/* Rate Your Teachers - all teachers, no view all */}
      <div>
        <h2 className="font-helvetica-bold text-lg mb-3 flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-pink-400" />
          Rate Your Teachers
        </h2>
        <TeachersVoting />
      </div>

      {/* School Dares IRL */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-helvetica-bold text-lg flex items-center gap-2">
            <Target className="w-4 h-4 text-orange-400" />
            School Dares IRL
          </h2>
          <Link
            href="/dares"
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {loadingDares ? (
          <PostSkeleton />
        ) : dares.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-4 text-center text-muted-foreground">
            <Flame className="w-6 h-6 mx-auto mb-2 text-orange-400" />
            <p className="text-sm">No active dares yet. Admin will post one soon!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {dares.slice(0, 2).map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>

      {/* Trending - single most viewed post */}
      <div>
        <h2 className="font-helvetica-bold text-lg mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          Trending
        </h2>
        {loadingTrending ? (
          <PostSkeleton />
        ) : trendingPost ? (
          <PostCard post={trendingPost} />
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No posts yet</p>
        )}
      </div>
    </div>
  );
}
