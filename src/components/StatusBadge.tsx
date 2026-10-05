import React from 'react';
import {
  CheckCircle2,
  Clock,
  FileText,
  AlertCircle,
  XCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatusBadgeProps {
  status: 'DRAFT' | 'READY' | 'SCHEDULED' | 'PROCESSING' | 'PUBLISHED' | 'FAILED' | 'CANCELLED' | string;
  className?: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, className, size = 'md' }: StatusBadgeProps) {
  const normalized = (status || 'DRAFT').toUpperCase();

  const configs: Record<
    string,
    { label: string; icon: React.ComponentType<{ className?: string }>; bg: string; text: string; border: string }
  > = {
    PUBLISHED: {
      label: 'Published',
      icon: CheckCircle2,
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/20',
    },
    SCHEDULED: {
      label: 'Scheduled',
      icon: Clock,
      bg: 'bg-blue-500/10',
      text: 'text-blue-400',
      border: 'border-blue-500/20',
    },
    PROCESSING: {
      label: 'Publishing...',
      icon: Loader2,
      bg: 'bg-indigo-500/10',
      text: 'text-indigo-400',
      border: 'border-indigo-500/20',
    },
    READY: {
      label: 'Ready',
      icon: Sparkles,
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
      border: 'border-purple-500/20',
    },
    DRAFT: {
      label: 'Draft',
      icon: FileText,
      bg: 'bg-slate-500/10',
      text: 'text-slate-400',
      border: 'border-slate-500/20',
    },
    FAILED: {
      label: 'Failed',
      icon: AlertCircle,
      bg: 'bg-rose-500/10',
      text: 'text-rose-400',
      border: 'border-rose-500/20',
    },
    CANCELLED: {
      label: 'Cancelled',
      icon: XCircle,
      bg: 'bg-zinc-500/10',
      text: 'text-zinc-400',
      border: 'border-zinc-500/20',
    },
  };

  const config = configs[normalized] || configs.DRAFT;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full border transition-colors',
        config.bg,
        config.text,
        config.border,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        className
      )}
    >
      <Icon className={cn('w-3.5 h-3.5', normalized === 'PROCESSING' && 'animate-spin')} />
      {config.label}
    </span>
  );
}
