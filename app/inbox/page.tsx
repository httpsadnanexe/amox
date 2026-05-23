'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUp, Bell, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: string;
  is_read: boolean;
  created_at: string;
  from_user_id: string | null;
  post_id: string | null;
  comment_id: string | null;
  from_profile?: { username: string } | null;
}

export default function InboxPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('notifications')
      .select('*, from_profile:profiles!notifications_from_user_id_fkey(username)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      setNotifications(data as unknown as Notification[]);
    }
    setLoadingData(false);
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAllRead = async () => {
    if (!user) return;
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const markRead = async (id: string) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
    setNotifications((prev) =>
      prev.map((n) => n.id === id ? { ...n, is_read: true } : n)
    );
  };

  if (loading || !user || !profile) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 text-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const getIcon = (type: string) => {
    if (type === 'post_upvote') return <ArrowUp className="w-4 h-4 text-red-400" />;
    if (type === 'comment_upvote') return <ArrowUp className="w-4 h-4 text-red-400" />;
    return <Bell className="w-4 h-4 text-muted-foreground" />;
  };

  const getMessage = (n: Notification) => {
    const username = n.from_profile?.username ?? 'Someone';
    if (n.type === 'post_upvote') return `${username} upvoted your post`;
    if (n.type === 'comment_upvote') return `${username} upvoted your comment`;
    return 'New notification';
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between animate-fade-in">
        <h1 className="font-helvetica-bold text-2xl md:text-3xl text-foreground flex items-center gap-2">
          <Bell className="w-6 h-6 text-amber-400" />
          Inbox
          {unreadCount > 0 && (
            <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">{unreadCount}</span>
          )}
        </h1>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllRead}
            className="border-border text-muted-foreground hover:text-foreground"
          >
            <Check className="w-3 h-3 mr-1" /> Mark all read
          </Button>
        )}
      </div>

      <Card className="bg-card border-border animate-slide-up">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Your Aura</p>
            <p className="font-helvetica-bold text-2xl text-foreground">{profile.aura}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Earned from upvotes</p>
            <p className="text-sm text-amber-400">+{profile.aura} aura points</p>
          </div>
        </CardContent>
      </Card>

      {loadingData ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 rounded-lg skeleton-shimmer" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="font-helvetica-bold">No notifications yet</p>
          <p className="text-sm">When someone upvotes your content, you will see it here</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {notifications.map((n) => (
            <Card
              key={n.id}
              className={cn(
                'bg-card border-border transition-all duration-200',
                !n.is_read && 'border-amber-500/30 bg-secondary/30'
              )}
            >
              <CardContent className="p-3 flex items-center gap-3">
                <div className="shrink-0">{getIcon(n.type)}</div>
                <div className="flex-1 min-w-0" onClick={() => !n.is_read && markRead(n.id)}>
                  <p className={cn('text-sm', !n.is_read ? 'text-foreground font-medium' : 'text-muted-foreground')}>
                    {getMessage(n)}
                  </p>
                  <p className="text-xs text-muted-foreground/60">
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                  </p>
                </div>
                {!n.is_read && (
                  <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
