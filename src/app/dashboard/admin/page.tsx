'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Server,
  Database,
  Cpu,
  Activity,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Lock,
} from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { formatDate, formatDateTime } from '@/lib/utils';

export default function AdminPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAdminStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        const errJson = await res.json().catch(() => ({}));
        setError(errJson.error?.message || 'Access restricted');
      }
    } catch (e) {
      console.error(e);
      setError('Failed to fetch admin stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminStats();
  }, []);

  if (error) {
    return (
      <div className="p-12 text-center max-w-md mx-auto rounded-2xl glass-panel border space-y-3">
        <Lock className="w-10 h-10 text-rose-400 mx-auto" />
        <h3 className="text-base font-bold text-white">Administrator Access Required</h3>
        <p className="text-xs text-slate-400">{error}</p>
      </div>
    );
  }

  const stats = data?.stats || {};
  const health = data?.systemHealth || {};

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
            <span>Admin & System Health Monitor</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time infrastructure health, queue diagnostics, worker status, and security audit logs.
          </p>
        </div>
      </div>

      {/* System Health Cards Grid */}
      <div className="rounded-2xl glass-panel p-6 border space-y-4">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Server className="w-4 h-4 text-emerald-400" />
          <span>Core Infrastructure Health</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <Database className="w-3.5 h-3.5 text-blue-400" /> Database
            </span>
            <div className="flex items-center gap-2 pt-1 font-bold text-emerald-400 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>{health.database || 'HEALTHY'}</span>
            </div>
            <p className="text-[10px] text-slate-500">Prisma Client & SQLite/Postgres</p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <Activity className="w-3.5 h-3.5 text-purple-400" /> Publishing Queue
            </span>
            <div className="flex items-center gap-2 pt-1 font-bold text-purple-400 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>{health.redis || 'ONLINE'}</span>
            </div>
            <p className="text-[10px] text-slate-500">15s Worker Scheduler Loop</p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" /> AI Content Engine
            </span>
            <div className="flex items-center gap-2 pt-1 font-bold text-cyan-400 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>{health.aiProvider || 'READY'}</span>
            </div>
            <p className="text-[10px] text-slate-500">Modular Prompt Pipeline</p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> Memory & Uptime
            </span>
            <div className="pt-1 font-mono text-slate-200 text-xs font-bold">
              <span>{health.memoryUsageMb || 48} MB Heap</span>
            </div>
            <p className="text-[10px] text-slate-500">Uptime: {Math.round(health.uptimeSeconds || 0)}s</p>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Registered Users"
          value={stats.totalUsers || 0}
          icon={Users}
          gradient="blue"
        />
        <StatCard
          title="Connected LinkedIn Accounts"
          value={stats.totalConnectedAccounts || 0}
          icon={CheckCircle2}
          gradient="emerald"
        />
        <StatCard
          title="Total Scheduled Queue"
          value={stats.totalScheduled || 0}
          icon={Clock}
          gradient="purple"
        />
      </div>

      {/* Audit Log Trail */}
      <div className="rounded-2xl glass-panel p-6 border space-y-4">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Security & Publishing Audit Trail
        </h3>

        <div className="divide-y divide-white/10 max-h-80 overflow-y-auto">
          {data?.recentLogs?.map((log: any) => (
            <div key={log.id} className="py-3 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="font-semibold text-white font-mono">{log.action}</span>
                <p className="text-[11px] text-slate-400">
                  User: {log.user?.name || log.userId} • Entity: {log.entityType} {log.entityId && `(${log.entityId.slice(0, 8)}...)`}
                </p>
              </div>

              <span className="text-[11px] text-slate-500 font-mono">
                {formatDateTime(log.createdAt)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
