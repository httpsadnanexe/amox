'use client';

import { TeachersVoting } from '@/components/teachers-voting';
import { GraduationCap } from 'lucide-react';

export default function TeachersPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div className="animate-fade-in">
        <h1 className="font-helvetica-bold text-2xl md:text-3xl text-foreground flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-pink-400" />
          Rate Your Teachers
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Vote for your favourite teachers. Every vote counts (anonymously, of course).
        </p>
      </div>

      <TeachersVoting />
    </div>
  );
}
