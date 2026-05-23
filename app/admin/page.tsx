'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { supabase } from '@/lib/supabase';
import type { Post, Report, Profile } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PostSkeleton } from '@/components/skeletons';
import { Shield, FileText, TriangleAlert as AlertTriangle, Users, Trash2, Check, Ban } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [postCount, setPostCount] = useState(0);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && (!user || !profile?.is_admin)) {
      router.push('/');
    }
  }, [user, profile, loading, router]);

  useEffect(() => {
    if (!user || !profile?.is_admin) return;

    const fetchData = async () => {
      const [reportsRes, postsRes, userCountRes, postCountRes] = await Promise.all([
        supabase.from('reports').select('*').eq('is_resolved', false).order('created_at', { ascending: false }).limit(20),
        supabase.from('posts').select('*, profiles(username)').order('created_at', { ascending: false }).limit(10),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('posts').select('id', { count: 'exact', head: true }),
      ]);

      if (reportsRes.data) setReports(reportsRes.data as Report[]);
      if (postsRes.data) setRecentPosts(postsRes.data as Post[]);
      if (userCountRes.count !== null) setUserCount(userCountRes.count);
      if (postCountRes.count !== null) setPostCount(postCountRes.count);
      setLoadingData(false);
    };

    fetchData();
  }, [user, profile]);

  const handleDeletePost = async (postId: string) => {
    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (!error) {
      setRecentPosts((prev) => prev.filter((p) => p.id !== postId));
      toast.success('Post deleted');
    } else {
      toast.error('Failed to delete');
    }
  };

  const handleResolveReport = async (reportId: string) => {
    const { error } = await supabase.from('reports').update({ is_resolved: true }).eq('id', reportId);
    if (!error) {
      setReports((prev) => prev.filter((r) => r.id !== reportId));
      toast.success('Report resolved');
    }
  };

  const handleLockPost = async (postId: string, isLocked: boolean) => {
    const { error } = await supabase.from('posts').update({ is_locked: !isLocked }).eq('id', postId);
    if (!error) {
      setRecentPosts((prev) =>
        prev.map((p) => p.id === postId ? { ...p, is_locked: !isLocked } : p)
      );
      toast.success(isLocked ? 'Post unlocked' : 'Post locked');
    }
  };

  if (loading || !user || !profile?.is_admin) {
    return <div className="max-w-3xl mx-auto px-4 py-6"><PostSkeleton /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div className="animate-fade-in">
        <h1 className="font-helvetica-bold text-2xl md:text-3xl text-foreground flex items-center gap-2">
          <Shield className="w-6 h-6 text-amber-400" />
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Moderate content and manage the community.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 animate-slide-up">
        <Card className="bg-card border-border">
          <CardContent className="p-3 text-center">
            <Users className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
            <p className="font-helvetica-bold text-lg">{userCount}</p>
            <p className="text-xs text-muted-foreground">Users</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-3 text-center">
            <FileText className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
            <p className="font-helvetica-bold text-lg">{postCount}</p>
            <p className="text-xs text-muted-foreground">Posts</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-3 text-center">
            <AlertTriangle className="w-4 h-4 text-red-400 mx-auto mb-1" />
            <p className="font-helvetica-bold text-lg">{reports.length}</p>
            <p className="text-xs text-muted-foreground">Reports</p>
          </CardContent>
        </Card>
      </div>

      {/* Reports */}
      {reports.length > 0 && (
        <div>
          <h2 className="font-helvetica-bold text-base mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" /> Pending Reports
          </h2>
          <div className="space-y-2">
            {reports.map((report) => (
              <Card key={report.id} className="bg-card border-border">
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground">{report.reason}</p>
                    <p className="text-xs text-muted-foreground">
                      {report.post_id ? 'Post' : 'Comment'} report
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-border text-muted-foreground"
                    onClick={() => handleResolveReport(report.id)}
                  >
                    <Check className="w-3 h-3 mr-1" /> Resolve
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recent posts */}
      <div>
        <h2 className="font-helvetica-bold text-base mb-3">Recent Posts</h2>
        {loadingData ? (
          <div className="space-y-3"><PostSkeleton /><PostSkeleton /></div>
        ) : (
          <div className="space-y-2">
            {recentPosts.map((post) => (
              <Card key={post.id} className="bg-card border-border">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{post.title}</p>
                      <p className="text-xs text-muted-foreground">
                        by {post.profiles?.username ?? 'anon'} - {post.category}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={() => handleLockPost(post.id, post.is_locked)}
                      >
                        <Ban className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-red-400 hover:text-red-300"
                        onClick={() => handleDeletePost(post.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
