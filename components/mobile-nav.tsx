'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Chrome as Home, Heart, Coffee, Users, GraduationCap, Target, CircleAlert as AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/confessions', label: 'Confess', icon: Heart },
  { href: '/tea-table', label: 'Tea', icon: Coffee },
  { href: '/rankings', label: 'Students', icon: Users },
  { href: '/teachers', label: 'Teach', icon: GraduationCap },
  { href: '/dares', label: 'Dares', icon: Target },
  { href: '/notices', label: 'Notices', icon: AlertCircle },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50 md:hidden">
      <div className="flex items-center justify-around h-16 px-1 overflow-x-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-all duration-200 shrink-0',
                isActive
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className={cn('w-5 h-5', isActive && 'scale-110')} style={{ transition: 'transform 0.15s ease' }} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
