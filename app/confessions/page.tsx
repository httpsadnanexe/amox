'use client';

import { useState } from 'react';
import { PostFeed } from '@/components/post-feed';
import { CreatePost } from '@/components/create-post';
import { useAuth } from '@/components/providers/auth-provider';
import { Heart, Flame, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

type SortMode = 'created_at' | 'upvotes';

export default function ConfessionsPage() {
  const { user } = useAuth();
  const [sort, setSort] = useState<SortMode>('created_at');

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div className="animate-fade-in">
        <h1 className="font-helvetica-bold text-2xl md:text-3xl text-foreground flex items-center gap-2">
          <Heart className="w-6 h-6 text-red-400" />
          Confession Corner
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Anonymously share your deepest school secrets. No judgement.
        </p>
      </div>

      {user && <CreatePost category="confession" />}

      <div className="flex items-center gap-2">
        <button
          onClick={() => setSort('created_at')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-200',
            sort === 'created_at'
              ? 'bg-secondary text-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
          )}
        >
          <Clock className="w-3.5 h-3.5" /> New
        </button>
        <button
          onClick={() => setSort('upvotes')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-200',
            sort === 'upvotes'
              ? 'bg-secondary text-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
          )}
        >
          <Flame className="w-3.5 h-3.5" /> Hot
        </button>
      </div>

      <PostFeed category="confession" orderBy={sort} />
    </div>
  );
}
