'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  X,
  Play,
  Trash2,
  Copy,
  Edit,
  Globe,
  Sparkles,
} from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { formatDate, formatDateTime } from '@/lib/utils';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [posts, setPosts] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const loadCalendarPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/calendar?year=${year}&month=${month + 1}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalendarPosts();
  }, [year, month]);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Build calendar matrix
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Sun) - 6 (Sat)
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays = [];

  // Previous month padding days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarDays.push({
      day: daysInPrevMonth - i,
      month: month - 1,
      year: month === 0 ? year - 1 : year,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push({
      day: d,
      month: month,
      year: year,
      isCurrentMonth: true,
    });
  }

  // Next month padding days to complete 35 or 42 grid
  const remaining = 35 - calendarDays.length > 0 ? 35 - calendarDays.length : 42 - calendarDays.length;
  for (let d = 1; d <= remaining; d++) {
    calendarDays.push({
      day: d,
      month: month + 1,
      year: month === 11 ? year + 1 : year,
      isCurrentMonth: false,
    });
  }

  const filteredPosts = posts.filter((p) => {
    if (statusFilter === 'ALL') return true;
    return p.status === statusFilter;
  });

  const getPostsForDay = (cellYear: number, cellMonth: number, cellDay: number) => {
    return filteredPosts.filter((p) => {
      const targetDate = p.scheduledAt ? new Date(p.scheduledAt) : p.publishedAt ? new Date(p.publishedAt) : null;
      if (!targetDate) return false;
      return (
        targetDate.getFullYear() === cellYear &&
        targetDate.getMonth() === cellMonth &&
        targetDate.getDate() === cellDay
      );
    });
  };

  const isToday = (cellYear: number, cellMonth: number, cellDay: number) => {
    const today = new Date();
    return (
      today.getFullYear() === cellYear &&
      today.getMonth() === cellMonth &&
      today.getDate() === cellDay
    );
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-blue-400" />
            <span>Content Calendar</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Visual roadmap of all scheduled, draft, and published LinkedIn content.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10 text-xs">
            {['ALL', 'SCHEDULED', 'PUBLISHED', 'DRAFT'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <Link
            href="/dashboard/create"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Post</span>
          </Link>
        </div>
      </div>

      {/* Calendar Navigation Bar */}
      <div className="flex items-center justify-between glass-panel p-4 rounded-2xl border">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-white">
            {monthNames[month]} <span className="text-blue-400 font-mono">{year}</span>
          </h2>
          <button
            onClick={goToToday}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-medium transition"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-2xl glass-panel border overflow-hidden">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-white/10 bg-white/[0.02] text-center text-xs font-bold text-slate-400 py-3">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>

        {/* Month Grid Cells */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-white/10 min-h-[560px]">
          {calendarDays.map((cell, idx) => {
            const dayPosts = getPostsForDay(cell.year, cell.month, cell.day);
            const currentIsToday = isToday(cell.year, cell.month, cell.day);

            return (
              <div
                key={idx}
                className={`p-2 min-h-[110px] flex flex-col justify-between transition group relative ${
                  cell.isCurrentMonth ? 'bg-transparent' : 'bg-black/20 text-slate-600'
                } ${currentIsToday ? 'bg-blue-600/10' : 'hover:bg-white/[0.02]'}`}
              >
                {/* Cell Header */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                      currentIsToday
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                        : cell.isCurrentMonth
                        ? 'text-slate-300'
                        : 'text-slate-600'
                    }`}
                  >
                    {cell.day}
                  </span>

                  {cell.isCurrentMonth && (
                    <Link
                      href={`/dashboard/create?date=${cell.year}-${String(cell.month + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`}
                      title="Schedule post on this day"
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-blue-400 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>

                {/* Day Posts List */}
                <div className="space-y-1.5 my-1 flex-1 overflow-y-auto max-h-24">
                  {dayPosts.map((post) => (
                    <button
                      key={post.id}
                      onClick={() => setSelectedPost(post)}
                      className={`w-full text-left p-1.5 rounded-lg border text-[11px] font-medium truncate transition flex items-center gap-1 ${
                        post.status === 'PUBLISHED'
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/20'
                          : post.status === 'SCHEDULED'
                          ? 'bg-blue-500/10 text-blue-300 border-blue-500/20 hover:bg-blue-500/20'
                          : 'bg-slate-500/10 text-slate-300 border-slate-500/20 hover:bg-slate-500/20'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0"></span>
                      <span className="truncate">{post.content}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Side Slide-Over Inspector Drawer for Selected Post */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#0d1226] border-l border-white/10 h-full p-6 flex flex-col justify-between overflow-y-auto shadow-2xl">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <StatusBadge status={selectedPost.status} />
                  <span className="text-xs text-slate-400 font-mono">
                    {selectedPost.scheduledAt
                      ? formatDateTime(selectedPost.scheduledAt)
                      : formatDate(selectedPost.publishedAt)}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Post Content */}
              <div className="p-4 rounded-xl bg-[#060814] border border-white/10 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                {selectedPost.content}
              </div>

              {/* Media if attached */}
              {selectedPost.media?.length > 0 && (
                <div className="rounded-xl overflow-hidden border border-white/10 bg-black/40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedPost.media[0].fileUrl}
                    alt="Media"
                    className="w-full max-h-60 object-cover"
                  />
                </div>
              )}

              {/* LinkedIn URL if published */}
              {selectedPost.providerPostUrl && (
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs flex items-center justify-between">
                  <span className="text-blue-300 font-semibold">Live on LinkedIn:</span>
                  <a
                    href={selectedPost.providerPostUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
                  >
                    View Post <Globe className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-white/10 flex items-center justify-between gap-3">
              <Link
                href={`/dashboard/create?edit=${selectedPost.id}`}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Post</span>
              </Link>

              <button
                onClick={() => setSelectedPost(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium border border-white/10 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
