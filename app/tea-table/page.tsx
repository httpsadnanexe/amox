'use client';

import { useState } from 'react';
import { PostFeed } from '@/components/post-feed';
import { CreatePost } from '@/components/create-post';
import { useAuth } from '@/components/providers/auth-provider';
import type { PostCategory } from '@/lib/types';
import { Coffee, Flame, Clock, Laugh, ChartBar as BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'tea' | 'meme' | 'poll';
type SortMode = 'created_at' | 'upvotes';

export default function TeaTablePage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('tea');
  const [sort, setSort] = useState<SortMode>('created_at');

  const categoryMap: Record<Tab, PostCategory> = {
    tea: 'tea',
    meme: 'meme',
    poll: 'poll',
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div className="animate-fade-in">
        <h1 className="font-helvetica-bold text-2xl md:text-3xl text-foreground flex items-center gap-2">
          <Coffee className="w-6 h-6 text-amber-400" />
          Tea Table
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Spill the tea, drop memes, vote on polls. The drama lives here.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setTab('tea')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-200',
            tab === 'tea' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
          )}
        >
          <Coffee className="w-3.5 h-3.5" /> Tea
        </button>
        <button
          onClick={() => setTab('meme')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-200',
            tab === 'meme' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
          )}
        >
          <Laugh className="w-3.5 h-3.5" /> Memes
        </button>
        <button
          onClick={() => setTab('poll')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-200',
            tab === 'poll' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
          )}
        >
          <BarChart3 className="w-3.5 h-3.5" /> Polls
        </button>
      </div>

      {user && <CreatePost category={categoryMap[tab]} />}

      {/* Sort */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setSort('created_at')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-200',
            sort === 'created_at' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
          )}
        >
          <Clock className="w-3.5 h-3.5" /> New
        </button>
        <button
          onClick={() => setSort('upvotes')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-200',
            sort === 'upvotes' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
          )}
        >
          <Flame className="w-3.5 h-3.5" /> Hot
        </button>
      </div>

      <PostFeed category={categoryMap[tab]} orderBy={sort} />
    </div>
  );
}
