'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Flag } from 'lucide-react';
import { toast } from 'sonner';

interface ReportDialogProps {
  postId?: string;
  commentId?: string;
}

export function ReportDialog({ postId, commentId }: ReportDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user || !reason.trim()) return;
    setLoading(true);

    const { error } = await supabase.from('reports').insert({
      reporter_id: user.id,
      post_id: postId ?? null,
      comment_id: commentId ?? null,
      reason: reason.trim(),
    });

    if (!error) {
      toast.success('Report submitted');
      setReason('');
      setOpen(false);
    } else {
      toast.error('Failed to submit report');
    }
    setLoading(false);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors">
          <Flag className="w-3.5 h-3.5" />
        </button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-helvetica-bold text-foreground">Report Content</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why are you reporting this?"
            className="bg-secondary border-border text-foreground"
            maxLength={500}
          />
          <Button
            onClick={handleSubmit}
            disabled={loading || !reason.trim()}
            className="w-full bg-foreground text-background hover:bg-foreground/90"
          >
            {loading ? 'Submitting...' : 'Submit Report'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
