'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Clock,
  CheckCircle2,
  Layers,
  Sparkles,
  Plus,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Eye,
  MessageSquare,
  ThumbsUp,
  Play,
  Trash2,
  Calendar,
} from 'lucide-react';
import { Linkedin } from '@/components/icons/LinkedInIcon';
import { StatCard } from '@/components/StatCard';
import { StatusBadge } from '@/components/StatusBadge';
import { formatDate, formatDateTime, formatNumber } from '@/lib/utils';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ name: string; timezone: string } | null>(null);
  const [stats, setStats] = useState({
    totalPosts: 0,
    scheduled: 0,
    published: 0,
    drafts: 0,
  });
  const [activityData, setActivityData] = useState<Array<{ date: string; posts: number; impressions: number }>>([]);
  const [upcomingPosts, setUpcomingPosts] = useState<Array<any>>([]);
  const [recentPublished, setRecentPublished] = useState<Array<any>>([]);
  const [linkedInAccount, setLinkedInAccount] = useState<any>(null);
  const [chartRange, setChartRange] = useState<'7d' | '30d'>('7d');

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [authRes, postsRes, analyticsRes, liRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/posts?limit=50'),
        fetch(`/api/analytics?range=${chartRange}`),
        fetch('/api/linkedin/profile'),
      ]);

      if (authRes.ok) {
        const data = await authRes.json();
        setUser(data.user);
      }

      if (postsRes.ok) {
        const data = await postsRes.json();
        const all = data.posts || [];
        const scheduled = all.filter((p: any) => p.status === 'SCHEDULED');
        const published = all.filter((p: any) => p.status === 'PUBLISHED');
        const drafts = all.filter((p: any) => p.status === 'DRAFT');

        setStats({
          totalPosts: all.length,
          scheduled: scheduled.length,
          published: published.length,
          drafts: drafts.length,
        });

        setUpcomingPosts(scheduled.slice(0, 4));
        setRecentPublished(published.slice(0, 4));
      }

      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setActivityData(data.chartData || []);
      }

      if (liRes.ok) {
        const data = await liRes.json();
        setLinkedInAccount(data.account || null);
      }
    } catch (e) {
      console.error('Error fetching dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [chartRange]);

  const handleInstantPublish = async (postId: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}/publish`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        loadDashboardData();
      } else {
        alert(data.error?.message || 'Publishing failed');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Heading & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            {getGreeting()}, <span className="gradient-text">{user?.name || 'Creator'}</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Here's what's happening with your LinkedIn content engine.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/ai-writer"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl glass-panel text-xs font-semibold text-purple-300 hover:text-white border-purple-500/30 hover:border-purple-500/60 transition"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>AI Writer</span>
          </Link>
          <Link
            href="/dashboard/create"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/25 transition transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create Post</span>
          </Link>
        </div>
      </div>

      {/* 4 Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Posts"
          value={stats.totalPosts}
          subtitle="All created content assets"
          trend={{ value: '+14%', isPositive: true }}
          icon={FileText}
          gradient="blue"
        />
        <StatCard
          title="Scheduled"
          value={stats.scheduled}
          subtitle="In publishing queue"
          trend={{ value: '+4 upcoming', isPositive: true }}
          icon={Clock}
          gradient="purple"
        />
        <StatCard
          title="Published"
          value={stats.published}
          subtitle="Live on LinkedIn feed"
          trend={{ value: '+28%', isPositive: true }}
          icon={CheckCircle2}
          gradient="emerald"
        />
        <StatCard
          title="Drafts"
          value={stats.drafts}
          subtitle="In-progress concepts"
          icon={Layers}
          gradient="cyan"
        />
      </div>

      {/* Middle Section: Publishing Activity Chart & LinkedIn Connection Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl glass-panel p-6 border flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h3 className="font-semibold text-white text-base">Publishing & Reach Activity</h3>
              <p className="text-xs text-slate-400 mt-0.5">LinkedIn impressions & post trends</p>
            </div>
            <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10 text-xs">
              <button
                onClick={() => setChartRange('7d')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  chartRange === '7d' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setChartRange('30d')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  chartRange === '30d' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                30 Days
              </button>
            </div>
          </div>

          <div className="h-64 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0d1226',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="impressions"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorImpressions)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* LinkedIn Connection Status Card (1 col) */}
        <div className="rounded-2xl glass-panel p-6 border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Linkedin className="w-5 h-5 text-[#0a66c2] fill-current" />
                <h3 className="font-semibold text-white text-base">LinkedIn Account</h3>
              </div>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                  linkedInAccount
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}
              >
                {linkedInAccount ? 'CONNECTED' : 'NOT CONNECTED'}
              </span>
            </div>

            {linkedInAccount ? (
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={linkedInAccount.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt="LinkedIn Avatar"
                    className="w-12 h-12 rounded-full border border-blue-500/30 object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-white text-sm">{linkedInAccount.displayName}</h4>
                    <p className="text-xs text-slate-400 line-clamp-1">{linkedInAccount.headline || 'LinkedIn Creator'}</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Official OAuth Scope:</span>
                    <span className="text-blue-400 font-medium">w_member_social</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Token Status:</span>
                    <span className="text-emerald-400 font-medium">Active & Valid</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6 text-center py-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-3">
                  <Linkedin className="w-6 h-6 fill-current" />
                </div>
                <h4 className="text-sm font-semibold text-white">Connect your LinkedIn</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Authenticate securely using official LinkedIn OAuth 2.0 to auto-publish scheduled posts.
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-white/10">
            <Link
              href="/dashboard/linkedin"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-semibold border border-blue-500/30 transition"
            >
              <span>{linkedInAccount ? 'Manage LinkedIn Account' : 'Connect LinkedIn Profile'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Upcoming Scheduled Posts & Recent Published Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Posts */}
        <div className="rounded-2xl glass-panel p-6 border">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <h3 className="font-semibold text-white text-base">Upcoming Scheduled Posts</h3>
            </div>
            <Link
              href="/dashboard/scheduled"
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
            >
              View all ({stats.scheduled}) <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {upcomingPosts.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No scheduled posts yet.</p>
                <Link
                  href="/dashboard/create"
                  className="inline-flex items-center gap-1.5 text-xs text-blue-400 font-semibold mt-2 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> Schedule your first post
                </Link>
              </div>
            ) : (
              upcomingPosts.map((post) => (
                <div
                  key={post.id}
                  className="p-3.5 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/30 transition flex items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-200 line-clamp-2">{post.content}</p>
                    <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
                      <span>{formatDateTime(post.scheduledAt)}</span>
                      <span>•</span>
                      <StatusBadge status={post.status} size="sm" />
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleInstantPublish(post.id)}
                      title="Publish Now"
                      className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>
                    <Link
                      href={`/dashboard/create?edit=${post.id}`}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition text-xs font-semibold px-2"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Published Posts */}
        <div className="rounded-2xl glass-panel p-6 border">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h3 className="font-semibold text-white text-base">Recent Published Posts</h3>
            </div>
            <Link
              href="/dashboard/published"
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
            >
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {recentPublished.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No published posts yet.</p>
              </div>
            ) : (
              recentPublished.map((post) => (
                <div
                  key={post.id}
                  className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-200 line-clamp-2">{post.content}</p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                      <span>{formatDate(post.publishedAt)}</span>
                      {post.analytics && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-blue-400 font-medium">
                            <Eye className="w-3 h-3" /> {formatNumber(post.analytics.impressions)}
                          </span>
                          <span className="flex items-center gap-1 text-purple-400 font-medium">
                            <ThumbsUp className="w-3 h-3" /> {formatNumber(post.analytics.reactions)}
                          </span>
                          <span className="flex items-center gap-1 text-emerald-400 font-medium">
                            <MessageSquare className="w-3 h-3" /> {formatNumber(post.analytics.comments)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {post.providerPostUrl && (
                    <a
                      href={post.providerPostUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition text-xs font-semibold px-2 flex items-center gap-1"
                    >
                      <span>Feed</span>
                      <ArrowRight className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return <ArrowRight className={className} />;
}
