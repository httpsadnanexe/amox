'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/auth-provider';
import type { PostCategory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, X, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface CreatePostProps {
  category: PostCategory;
  onPostCreated?: () => void;
}

export function CreatePost({ category, onPostCreated }: CreatePostProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    setLoading(true);

    try {
      const tagArray = tags
        .split(',')
        .map((t) => t.trim().toLowerCase().replace(/[^a-z0-9]/g, ''))
        .filter(Boolean);

      const { data: post, error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          title: title.trim(),
          content: content.trim(),
          category,
          tags: tagArray,
        })
        .select()
        .single();

      if (error) throw error;

      if (category === 'poll' && post) {
        const validOptions = pollOptions.filter((o) => o.trim());
        if (validOptions.length >= 2) {
          const { error: pollError } = await supabase
            .from('poll_options')
            .insert(
              validOptions.map((option) => ({
                post_id: post.id,
                option_text: option.trim(),
              }))
            );
          if (pollError) throw pollError;
        }
      }

      setTitle('');
      setContent('');
      setTags('');
      setPollOptions(['', '']);
      setOpen(false);
      toast.success('Post created!');
      onPostCreated?.();
    } catch {
      toast.error('Failed to create post');
    }
    setLoading(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full bg-card border border-border rounded-xl p-3 text-left text-muted-foreground hover:text-foreground hover:border-border/80 transition-all duration-200 flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        <span className="text-sm">Drop your {category === 'confession' ? 'confession' : category === 'tea' ? 'tea' : 'post'}...</span>
      </button>
    );
  }

  return (
    <Card className="bg-card border-border animate-scale-in">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="font-helvetica-bold text-base">
            New {category === 'confession' ? 'Confession' : category === 'tea' ? 'Tea' : category === 'poll' ? 'Poll' : 'Post'}
          </CardTitle>
          <button
            onClick={() => setOpen(false)}
            className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="bg-secondary border-border text-foreground"
          maxLength={200}
        />
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind? (optional)"
          className="bg-secondary border-border text-foreground min-h-[80px]"
          maxLength={2000}
        />
        <Input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Tags (comma separated, e.g. funny, school, exams)"
          className="bg-secondary border-border text-foreground"
        />

        {category === 'poll' && (
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Poll Options</label>
            {pollOptions.map((option, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...pollOptions];
                    newOptions[i] = e.target.value;
                    setPollOptions(newOptions);
                  }}
                  placeholder={`Option ${i + 1}`}
                  className="bg-secondary border-border text-foreground"
                />
                {pollOptions.length > 2 && (
                  <button
                    onClick={() => setPollOptions(pollOptions.filter((_, idx) => idx !== i))}
                    className="p-2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            {pollOptions.length < 6 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-border text-muted-foreground"
                onClick={() => setPollOptions([...pollOptions, ''])}
              >
                <Plus className="w-3 h-3 mr-1" /> Add Option
              </Button>
            )}
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={loading || !title.trim()}
          className="w-full bg-foreground text-background hover:bg-foreground/90 font-helvetica-bold"
        >
          <Send className="w-4 h-4 mr-2" />
          {loading ? 'Posting...' : 'Post Anonymously'}
        </Button>
      </CardContent>
    </Card>
  );
}
