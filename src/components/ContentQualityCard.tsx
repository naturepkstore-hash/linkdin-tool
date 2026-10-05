import React from 'react';
import { QualityAnalysis } from '@/lib/quality';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  TrendingUp,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContentQualityCardProps {
  analysis: QualityAnalysis | null;
  duplicateWarning?: { message: string } | null;
  className?: string;
}

export function ContentQualityCard({
  analysis,
  duplicateWarning,
  className,
}: ContentQualityCardProps) {
  if (!analysis) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (score >= 50) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  };

  return (
    <div className={cn('rounded-2xl glass-panel p-5 border', className)}>
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-semibold text-white text-sm">Post Quality Analyzer</h4>
            <p className="text-xs text-slate-400">Algorithmic LinkedIn engagement score</p>
          </div>
        </div>

        <div
          className={cn(
            'flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold',
            getScoreColor(analysis.overallScore)
          )}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{analysis.overallScore} / 100</span>
        </div>
      </div>

      {/* Duplicate Warning Alert */}
      {duplicateWarning && (
        <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-amber-300 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Duplicate Notice:</span> {duplicateWarning.message}
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
        {/* Hook Strength */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
          <span className="text-slate-400">Hook Strength</span>
          <div className="flex items-center gap-1.5 mt-1 font-semibold">
            {analysis.hookScore === 'Excellent' || analysis.hookScore === 'Good' ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span
              className={
                analysis.hookScore === 'Excellent'
                  ? 'text-emerald-400'
                  : analysis.hookScore === 'Good'
                  ? 'text-blue-400'
                  : 'text-amber-400'
              }
            >
              {analysis.hookScore}
            </span>
          </div>
        </div>

        {/* CTA Presence */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
          <span className="text-slate-400">Call-To-Action (CTA)</span>
          <div className="flex items-center gap-1.5 mt-1 font-semibold">
            {analysis.ctaScore === 'Present' ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span className={analysis.ctaScore === 'Present' ? 'text-emerald-400' : 'text-slate-400'}>
              {analysis.ctaScore}
            </span>
          </div>
        </div>

        {/* Readability */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
          <span className="text-slate-400">Readability</span>
          <div className="flex items-center gap-1.5 mt-1 font-semibold text-slate-200">
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>{analysis.readabilityScore} Flow</span>
          </div>
        </div>

        {/* Hashtags */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
          <span className="text-slate-400">Hashtags</span>
          <div className="flex items-center gap-1.5 mt-1 font-semibold">
            <span className="text-purple-400">#{analysis.hashtagCount}</span>
            <span className="text-slate-400">({analysis.hashtagStatus})</span>
          </div>
        </div>
      </div>

      {/* Actionable Suggestions */}
      {analysis.suggestions.length > 0 && (
        <div className="mt-4 pt-3 border-t border-white/10">
          <p className="text-[11px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">
            Recommendations
          </p>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {analysis.suggestions.slice(0, 3).map((suggestion, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
