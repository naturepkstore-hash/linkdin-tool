'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bell,
  Search,
  Plus,
  CheckCircle2,
  AlertCircle,
  Menu,
  X,
  Sparkles,
  Layers,
  Calendar,
  Clock,
  Settings,
} from 'lucide-react';
import { Linkedin } from '@/components/icons/LinkedInIcon';
import { cn } from '@/lib/utils';

export function Topbar() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; message: string; type: string; isRead: boolean; createdAt: string }>>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLinkedInConnected, setIsLinkedInConnected] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; avatarUrl?: string } | null>(null);

  useEffect(() => {
    // Fetch user & notification data
    async function loadData() {
      try {
        const [authRes, notifRes, liRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/notifications'),
          fetch('/api/linkedin/profile'),
        ]);

        if (authRes.ok) {
          const data = await authRes.json();
          setUser(data.user);
        }

        if (notifRes.ok) {
          const data = await notifRes.json();
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        }

        if (liRes.ok) {
          const data = await liRes.json();
          setIsLinkedInConnected(data.connected);
        }
      } catch (e) {
        console.error('Topbar data fetch error:', e);
      }
    }

    loadData();

  }, []);

  const markAllNotificationsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
      setUnreadCount(0);
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="h-16 sticky top-0 z-30 bg-[#070a1a]/80 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Mobile Menu Button & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="relative w-full hidden sm:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search posts, series, hashtags..."
            className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* LinkedIn Connection Status Pill */}
        <Link
          href="/dashboard/linkedin"
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition',
            isLinkedInConnected
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20 animate-pulse'
          )}
        >
          <Linkedin className="w-3.5 h-3.5 fill-current" />
          <span className="hidden sm:inline">
            {isLinkedInConnected ? 'LinkedIn Active' : 'Connect LinkedIn'}
          </span>
          {isLinkedInConnected ? (
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          ) : (
            <AlertCircle className="w-3 h-3 text-amber-400" />
          )}
        </Link>

        {/* Quick Action: Create Post */}
        <Link
          href="/dashboard/create"
          className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition transform active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Post</span>
        </Link>

        {/* Notification Bell with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl glass-dropdown border border-white/10 p-4 shadow-2xl z-50">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-white text-sm">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] text-blue-400 hover:underline font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="mt-3 max-h-72 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No notifications yet.</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={cn(
                        'p-2.5 rounded-xl border text-xs transition',
                        n.isRead
                          ? 'bg-white/5 border-white/5 text-slate-400'
                          : 'bg-blue-500/10 border-blue-500/20 text-slate-200'
                      )}
                    >
                      <div className="flex items-center justify-between font-semibold text-white">
                        <span>{n.title}</span>
                        <span className="text-[10px] text-slate-500 font-normal">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="mt-1 text-slate-300 line-clamp-2">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar */}
        <Link href="/dashboard/settings" className="flex items-center gap-2.5 pl-2 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt="User"
            className="w-8 h-8 rounded-full object-cover border border-white/20 group-hover:border-blue-400 transition"
          />
        </Link>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-[#070a1a]/95 backdrop-blur-2xl z-50 p-6 flex flex-col space-y-3">
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 p-3 rounded-xl bg-white/5 text-white"
          >
            <Sparkles className="w-5 h-5 text-blue-400" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/dashboard/create"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 p-3 rounded-xl bg-blue-600/20 text-blue-300 font-semibold border border-blue-500/30"
          >
            <Plus className="w-5 h-5 text-blue-400" />
            <span>Create Post</span>
          </Link>
          <Link
            href="/dashboard/calendar"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 p-3 rounded-xl bg-white/5 text-white"
          >
            <Calendar className="w-5 h-5 text-purple-400" />
            <span>Content Calendar</span>
          </Link>
          <Link
            href="/dashboard/scheduled"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 p-3 rounded-xl bg-white/5 text-white"
          >
            <Clock className="w-5 h-5 text-cyan-400" />
            <span>Scheduled Posts</span>
          </Link>
          <Link
            href="/dashboard/series"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 p-3 rounded-xl bg-white/5 text-white"
          >
            <Layers className="w-5 h-5 text-indigo-400" />
            <span>365-Day Content Series</span>
          </Link>
          <Link
            href="/dashboard/settings"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 p-3 rounded-xl bg-white/5 text-white"
          >
            <Settings className="w-5 h-5 text-slate-400" />
            <span>Settings</span>
          </Link>
        </div>
      )}
    </header>
  );
}
