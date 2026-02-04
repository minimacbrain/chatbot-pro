'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { 
  MessageSquare, 
  Inbox, 
  Database, 
  Palette, 
  Code, 
  LogOut,
  Bot
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Inbox', icon: Inbox },
  { href: '/dashboard/sources', label: 'Knowledge Base', icon: Database },
  { href: '/dashboard/widget', label: 'Widget', icon: Palette },
  { href: '/dashboard/embed', label: 'Embed Code', icon: Code },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[var(--surface-secondary)]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 w-60 h-screen bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="h-16 px-6 flex items-center border-b border-gray-100">
          <Link href="/dashboard" className="flex items-center gap-2 text-[var(--primary)]">
            <MessageSquare className="w-6 h-6" />
            <span className="font-bold text-lg">ChatBot Pro</span>
          </Link>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = item.href === '/dashboard' 
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  w-full px-3 py-2 rounded-lg
                  flex items-center gap-3
                  text-sm font-medium
                  transition-colors
                  ${isActive 
                    ? 'bg-[var(--primary-light)] text-[var(--primary)]' 
                    : 'text-[var(--text-secondary)] hover:bg-[var(--surface-tertiary)] hover:text-[var(--text-primary)]'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        {/* Bot indicator */}
        <div className="px-3 py-3 border-t border-gray-100">
          <div className="px-3 py-2 bg-[var(--surface-secondary)] rounded-lg flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--primary-light)] flex items-center justify-center">
              <Bot className="w-4 h-4 text-[var(--primary)]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-[var(--text-primary)] truncate">My Chatbot</div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[var(--success)]" />
                <span className="text-xs text-[var(--text-secondary)]">Active</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sign out */}
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={handleSignOut}
            className="w-full px-3 py-2 rounded-lg flex items-center gap-3 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="ml-60 p-6">
        {children}
      </main>
    </div>
  );
}
