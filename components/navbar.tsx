'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { Chrome as Home, Heart, Coffee, Users, GraduationCap, User, LogOut, LogIn, Menu, X, Bell, Target, CircleAlert as AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/confessions', label: 'Confessions', icon: Heart },
  { href: '/tea-table', label: 'Tea Table', icon: Coffee },
  { href: '/rankings', label: 'Students', icon: Users },
  { href: '/teachers', label: 'Teachers', icon: GraduationCap },
  { href: '/dares', label: 'Dares', icon: Target },
  { href: '/notices', label: 'Notices', icon: AlertCircle },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-helvetica-bold text-lg tracking-tight text-foreground hover:opacity-80 transition-opacity">
        
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm transition-all duration-200',
                  pathname === item.href
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                )}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            {user && profile ? (
              <>
                <Link
                  href="/inbox"
                  className={cn(
                    'p-2 rounded-lg transition-all duration-200',
                    pathname === '/inbox'
                      ? 'bg-secondary text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  )}
                >
                  <Bell className="w-4 h-4" />
                </Link>
                <Link
                  href="/profile"
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-200',
                    pathname === '/profile'
                      ? 'bg-secondary text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  )}
                >
                  <User className="w-4 h-4" />
                  <span>{profile.username}</span>
                </Link>
                <button
                  onClick={signOut}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <Link
                href="/auth"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-secondary text-foreground hover:bg-secondary/80 transition-all duration-200"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground transition-all duration-200"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        className={cn(
          'fixed top-14 right-0 bottom-0 z-40 w-64 bg-card border-l border-border md:hidden transition-transform duration-200',
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200',
                pathname === item.href
                  ? 'bg-secondary text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              )}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          ))}

          <div className="border-t border-border my-3" />

          {user && profile ? (
            <>
              <Link
                href="/inbox"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200',
                  pathname === '/inbox'
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                )}
              >
                <Bell className="w-4 h-4" />
                <span>Inbox</span>
              </Link>
              <Link
                href="/profile"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200',
                  pathname === '/profile'
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                )}
              >
                <User className="w-4 h-4" />
                <span>{profile.username}</span>
              </Link>
              <button
                onClick={() => { signOut(); setMobileOpen(false); }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-200 w-full"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <Link
              href="/auth"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm bg-secondary text-foreground hover:bg-secondary/80 transition-all duration-200"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
