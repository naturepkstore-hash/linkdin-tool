'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  PenSquare,
  Calendar,
  Clock,
  FileText,
  CheckCircle2,
  Layers,
  Sparkles,
  Image as ImageIcon,
  BarChart3,
  Settings,
  ShieldAlert,
  LogOut,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { Linkedin } from '@/components/icons/LinkedInIcon';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Create Post', href: '/dashboard/create', icon: PenSquare, highlight: true },
    { label: 'Content Calendar', href: '/dashboard/calendar', icon: Calendar },
    { label: 'Scheduled Posts', href: '/dashboard/scheduled', icon: Clock },
    { label: 'Drafts', href: '/dashboard/drafts', icon: FileText },
    { label: 'Published', href: '/dashboard/published', icon: CheckCircle2 },
    { label: 'Content Series', href: '/dashboard/series', icon: Layers, badge: '365 Plan' },
    { label: 'AI Writer', href: '/dashboard/ai-writer', icon: Sparkles, badge: 'AI' },
    { label: 'Media Library', href: '/dashboard/media', icon: ImageIcon },
    { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { label: 'LinkedIn Account', href: '/dashboard/linkedin', icon: Linkedin },
    { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col h-screen sticky top-0 bg-[#0a0e24]/90 backdrop-blur-xl border-r border-white/10 z-40">
      {/* Brand Logo */}
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition">
            <Zap className="w-5 h-5 fill-white" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1">
              PostFlow <span className="text-xs px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30">AI</span>
            </span>
            <p className="text-[10px] text-slate-400 -mt-0.5 font-medium">LinkedIn Automation</p>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
                isActive
                  ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/10 text-white border border-blue-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5',
                item.highlight && !isActive && 'text-blue-400 bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/20'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    'w-4 h-4 transition-colors',
                    isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200',
                    item.highlight && 'text-blue-400'
                  )}
                />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        {/* Admin Link */}
        <div className="pt-3 mt-3 border-t border-white/5">
          <Link
            href="/dashboard/admin"
            className={cn(
              'flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-slate-400 hover:text-amber-300 hover:bg-amber-500/10',
              pathname.startsWith('/dashboard/admin') && 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            )}
          >
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Admin & Health</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </Link>
        </div>
      </div>

      {/* Bottom Footer Section */}
      <div className="p-3 border-t border-white/10 bg-[#070a1a]/60">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
        >
          <div className="flex items-center gap-2.5">
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </div>
          <span className="text-[10px] text-slate-500">v1.0.0</span>
        </button>
      </div>
    </aside>
  );
}
