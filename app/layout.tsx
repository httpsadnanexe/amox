import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '@/components/providers/auth-provider';
import { Navbar } from '@/components/navbar';
import { MobileNav } from '@/components/mobile-nav';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: 'A.M. Oxford Online',
  description: 'Anonymous school community - Confessions, Tea, Rankings & More',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: '#0a0a0a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-helvetica min-h-screen bg-background text-foreground">
        <AuthProvider>
          <Navbar />
          <main className="pt-14 pb-20 md:pb-8">
            {children}
          </main>
          <MobileNav />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
