'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/auth-provider';
import { ArrowUp, ArrowDown, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const FEATURED_TEACHERS = [
  'Mr. Amit Banerjee',
  'Farah Masood',
  'Fareha Ashfaq Ansari',
  'Hera Ali',
  'Arshiya Reyaz Ansari',
  'Fareha Maroof',
  'Mohd Yahya',
  'Mohd Zameer Shariq',
  'Ashraful',
  'Farog Ahamad',
  'Salman',
  'Adiba Ahmad',
  'Alveena Rizwan',
  'Nazia Ahmad',
  'Saba Khan',
  'Hina Upadhyay',
];

interface TeacherVote {
  name: string;
  postId: string;
  upvotes: number;
  downvotes: number;
  userVote: 'up' | 'down' | null;
}

export function TeachersVoting() {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState<TeacherVote[]>([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);

  const fetchTeachers = useCallback(async () => {
    if (user) {
      for (const teacherName of FEATURED_TEACHERS) {
        const { data: existing } = await supabase
          .from('posts')
          .select('id')
          .eq('title', teacherName)
          .eq('category', 'teacher')
          .maybeSingle();

        if (!existing) {
          await supabase
            .from('posts')
            .insert({
              user_id: user.id,
              title: teacherName,
              content: `Rate ${teacherName}`,
              category: 'teacher',
            });
        }
      }
    }

    const { data } = await supabase
      .from('posts')
      .select('id, title, upvotes, downvotes')
      .eq('category', 'teacher')
      .in('title', FEATURED_TEACHERS);

    if (data && data.length > 0) {
      const teacherMap = new Map(data.map((t) => [t.title, { id: t.id, upvotes: t.upvotes, downvotes: t.downvotes }]));

      let userVotes = new Map<string, 'up' | 'down'>();
      if (user) {
        const postIds = data.map((t) => t.id);
        const { data: voteDetails } = await supabase
          .from('votes')
          .select('post_id, vote_type')
          .eq('user_id', user.id)
          .in('post_id', postIds);

        const votePostMap = new Map(data.map((t) => [t.id, t.title]));
        voteDetails?.forEach((v) => {
          const teacherName = votePostMap.get(v.post_id);
          if (teacherName) userVotes.set(teacherName, v.vote_type as 'up' | 'down');
        });
      }

      const teacherVotes: TeacherVote[] = FEATURED_TEACHERS.map((name) => {
        const teacherData = teacherMap.get(name);
        return {
          name,
          postId: teacherData?.id ?? '',
          upvotes: teacherData?.upvotes ?? 0,
          downvotes: teacherData?.downvotes ?? 0,
          userVote: userVotes.get(name) ?? null,
        };
      });

      teacherVotes.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
      setTeachers(teacherVotes);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const handleVote = async (teacherName: string, voteType: 'up' | 'down') => {
    if (!user || voting) return;
    setVoting(true);

    try {
      const teacher = teachers.find((t) => t.name === teacherName);
      if (!teacher || !teacher.postId) return;

      if (teacher.userVote === voteType) {
        await supabase
          .from('votes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', teacher.postId);

        setTeachers((prev) => {
          const updated = prev.map((t) =>
            t.name === teacherName
              ? {
                  ...t,
                  upvotes: voteType === 'up' ? t.upvotes - 1 : t.upvotes,
                  downvotes: voteType === 'down' ? t.downvotes - 1 : t.downvotes,
                  userVote: null,
                }
              : t
          );
          updated.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
          return updated;
        });
      } else {
        const previousVote = teachers.find((t) => t.userVote !== null && t.name !== teacherName);
        if (previousVote && previousVote.postId) {
          await supabase
            .from('votes')
            .delete()
            .eq('user_id', user.id)
            .eq('post_id', previousVote.postId);
        }

        if (teacher.userVote) {
          await supabase
            .from('votes')
            .update({ vote_type: voteType })
            .eq('user_id', user.id)
            .eq('post_id', teacher.postId);
        } else {
          await supabase
            .from('votes')
            .insert({ user_id: user.id, post_id: teacher.postId, vote_type: voteType });
        }

        setTeachers((prev) => {
          let updated = prev.map((t) => {
            if (t.name === teacherName) {
              return {
                ...t,
                upvotes: voteType === 'up' ? t.upvotes + 1 : teacher.userVote === 'up' ? t.upvotes - 1 : t.upvotes,
                downvotes: voteType === 'down' ? t.downvotes + 1 : teacher.userVote === 'down' ? t.downvotes - 1 : t.downvotes,
                userVote: voteType,
              };
            }
            if (previousVote && t.name === previousVote.name) {
              return {
                ...t,
                upvotes: t.userVote === 'up' ? t.upvotes - 1 : t.upvotes,
                downvotes: t.userVote === 'down' ? t.downvotes - 1 : t.downvotes,
                userVote: null,
              };
            }
            return t;
          });
          updated.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
          return updated;
        });
      }
    } catch {
      toast.error('Vote failed');
    }
    setVoting(false);
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-14 rounded-lg skeleton-shimmer" />
        ))}
      </div>
    );
  }

  const maxScore = teachers.length > 0 ? teachers[0].upvotes - teachers[0].downvotes : 0;
  const topTeachers = teachers.filter((t) => (t.upvotes - t.downvotes) === maxScore && maxScore > 0);
  const restTeachers = teachers.filter((t) => !topTeachers.includes(t));

  return (
    <div className="space-y-3">
      {topTeachers.length > 0 && (
        <div className="space-y-2">
          {topTeachers.map((teacher) => {
            const score = teacher.upvotes - teacher.downvotes;
            return (
              <div
                key={teacher.name}
                className="bg-gradient-to-r from-card to-secondary/50 rounded-xl border-2 border-amber-500/30 p-4 flex items-center justify-between animate-scale-in"
              >
                <div className="flex items-center gap-3">
                  <Crown className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <p className="font-helvetica-bold text-base text-foreground">{teacher.name}</p>
                    <p className="text-xs text-amber-400/80">Top Rated</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn(
                    'text-lg font-helvetica-bold min-w-[2.5rem] text-center',
                    score > 0 ? 'text-red-400' : score < 0 ? 'text-blue-400' : 'text-muted-foreground'
                  )}>
                    {score}
                  </span>
                  <button
                    onClick={() => handleVote(teacher.name, 'up')}
                    disabled={!user || voting}
                    className={cn(
                      'vote-btn p-2.5 rounded-lg hover:bg-secondary disabled:opacity-30 transition-all duration-200',
                      teacher.userVote === 'up' ? 'bg-red-500/20 text-red-400' : 'text-muted-foreground hover:text-red-400'
                    )}
                  >
                    <ArrowUp className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => handleVote(teacher.name, 'down')}
                    disabled={!user || voting}
                    className={cn(
                      'vote-btn p-2.5 rounded-lg hover:bg-secondary disabled:opacity-30 transition-all duration-200',
                      teacher.userVote === 'down' ? 'bg-blue-500/20 text-blue-400' : 'text-muted-foreground hover:text-blue-400'
                    )}
                  >
                    <ArrowDown className="w-6 h-6" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="space-y-1.5">
        {restTeachers.map((teacher) => {
          const score = teacher.upvotes - teacher.downvotes;
          return (
            <div
              key={teacher.name}
              className="bg-card rounded-lg border border-border p-3 flex items-center justify-between hover:border-border/80 transition-all duration-200"
            >
              <span className="text-sm font-medium text-foreground">{teacher.name}</span>
              <div className="flex items-center gap-2">
                <span className={cn(
                  'text-sm font-bold min-w-[2rem] text-center',
                  score > 0 ? 'text-red-400' : score < 0 ? 'text-blue-400' : 'text-muted-foreground'
                )}>
                  {score}
                </span>
                <button
                  onClick={() => handleVote(teacher.name, 'up')}
                  disabled={!user || voting}
                  className={cn(
                    'vote-btn p-2 rounded-lg hover:bg-secondary disabled:opacity-30 transition-all duration-200',
                    teacher.userVote === 'up' ? 'bg-red-500/20 text-red-400' : 'text-muted-foreground hover:text-red-400'
                  )}
                >
                  <ArrowUp className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleVote(teacher.name, 'down')}
                  disabled={!user || voting}
                  className={cn(
                    'vote-btn p-2 rounded-lg hover:bg-secondary disabled:opacity-30 transition-all duration-200',
                    teacher.userVote === 'down' ? 'bg-blue-500/20 text-blue-400' : 'text-muted-foreground hover:text-blue-400'
                  )}
                >
                  <ArrowDown className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {!user && (
        <p className="text-xs text-muted-foreground text-center pt-1">Sign in to vote for a teacher</p>
      )}
    </div>
  );
}
