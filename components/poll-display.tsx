'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/auth-provider';
import type { PollOption } from '@/lib/types';
import { cn } from '@/lib/utils';

interface PollDisplayProps {
  postId: string;
  options: PollOption[];
}

export function PollDisplay({ postId, options: initialOptions }: PollDisplayProps) {
  const { user } = useAuth();
  const [options, setOptions] = useState(initialOptions);
  const [votedOption, setVotedOption] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const totalVotes = options.reduce((sum, o) => sum + o.vote_count, 0);

  useEffect(() => {
    const fetchUserVote = async () => {
      if (!user) return;
      const optionIds = options.map((o) => o.id);
      if (optionIds.length === 0) return;

      const { data } = await supabase
        .from('poll_votes')
        .select('poll_option_id')
        .eq('user_id', user.id)
        .in('poll_option_id', optionIds)
        .maybeSingle();

      if (data) {
        setVotedOption(data.poll_option_id);
      }
    };
    fetchUserVote();
  }, [user, options]);

  const handleVote = useCallback(async (optionId: string) => {
    if (!user || votedOption || loading) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('poll_votes')
        .insert({ user_id: user.id, poll_option_id: optionId });

      if (!error) {
        setVotedOption(optionId);
        setOptions((prev) =>
          prev.map((o) =>
            o.id === optionId ? { ...o, vote_count: o.vote_count + 1 } : o
          )
        );
      }
    } catch {
      // silently fail
    }
    setLoading(false);
  }, [user, votedOption, loading]);

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3 animate-fade-in">
      <h3 className="font-helvetica-bold text-sm text-foreground">Poll</h3>
      {options.map((option) => {
        const percentage = totalVotes > 0 ? Math.round((option.vote_count / totalVotes) * 100) : 0;
        const isVoted = votedOption === option.id;

        return (
          <button
            key={option.id}
            onClick={() => handleVote(option.id)}
            disabled={!!votedOption || !user || loading}
            className={cn(
              'w-full relative rounded-lg border p-3 text-left transition-all duration-200 overflow-hidden',
              isVoted ? 'border-foreground/30 bg-secondary' : 'border-border hover:border-border/80',
              !user && 'cursor-default',
              votedOption && votedOption !== option.id && 'opacity-60'
            )}
          >
            {votedOption && (
              <div
                className="absolute inset-y-0 left-0 bg-foreground/5 transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            )}
            <div className="relative flex items-center justify-between">
              <span className="text-sm text-foreground">{option.option_text}</span>
              {votedOption && (
                <span className="text-xs text-muted-foreground font-medium">
                  {percentage}% ({option.vote_count})
                </span>
              )}
            </div>
          </button>
        );
      })}
      <p className="text-xs text-muted-foreground">
        {totalVotes} vote{totalVotes !== 1 ? 's' : ''} total
        {!user && ' - Sign in to vote'}
      </p>
    </div>
  );
}
