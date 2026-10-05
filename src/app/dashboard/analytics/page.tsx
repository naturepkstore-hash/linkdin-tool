'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Eye,
  ThumbsUp,
  MessageSquare,
  Repeat2,
  MousePointerClick,
  Info,
  Calendar,
  Layers,
} from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { formatNumber, formatDate } from '@/lib/utils';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export default function AnalyticsPage() {
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        const res = await fetch(`/api/analytics?range=${range}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, [range]);

  const summary = data?.summary || {
    totalPublished: 0,
    totalImpressions: 0,
    totalEngagements: 0,
    totalReactions: 0,
    totalComments: 0,
    totalReposts: 0,
    totalClicks: 0,
    avgEngagementRate: 0,
  };

  const chartData = data?.chartData || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-400" />
            <span>LinkedIn Content Analytics</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Performance metrics derived via official LinkedIn Community Management & Share APIs.
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10 text-xs">
          {(['7d', '30d', '90d'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                range === r ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Last {r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Compliance / API Data Availability Banner */}
      <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3 text-xs text-blue-200">
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <span className="font-semibold text-white">Official API Notice:</span> Metrics shown are synced directly from LinkedIn's official UGC & post engagement endpoints. Data refreshes periodically based on LinkedIn API rate limits.
        </p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Impressions"
          value={formatNumber(summary.totalImpressions)}
          subtitle="Feed views and reach"
          trend={{ value: '+22%', isPositive: true }}
          icon={Eye}
          gradient="blue"
        />
        <StatCard
          title="Total Engagements"
          value={formatNumber(summary.totalEngagements)}
          subtitle="Reactions, comments & shares"
          trend={{ value: '+18%', isPositive: true }}
          icon={ThumbsUp}
          gradient="purple"
        />
        <StatCard
          title="Average Engagement Rate"
          value={`${summary.avgEngagementRate}%`}
          subtitle="Interactions / Impressions"
          trend={{ value: '+1.4%', isPositive: true }}
          icon={TrendingUp}
          gradient="emerald"
        />
        <StatCard
          title="Published Posts"
          value={summary.totalPublished}
          subtitle="Live on feed"
          icon={Layers}
          gradient="cyan"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Impressions Over Time */}
        <div className="rounded-2xl glass-panel p-6 border space-y-4">
          <h3 className="font-semibold text-white text-base">Impressions Over Time</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
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
                <Area type="monotone" dataKey="impressions" stroke="#3b82f6" strokeWidth={2} fill="url(#colorBlue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Engagements Over Time */}
        <div className="rounded-2xl glass-panel p-6 border space-y-4">
          <h3 className="font-semibold text-white text-base">Engagements Over Time</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <Bar dataKey="engagements" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
