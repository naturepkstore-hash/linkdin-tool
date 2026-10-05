'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Globe,
  Eye,
  ThumbsUp,
  MessageSquare,
  Repeat2,
  TrendingUp,
  Plus,
  RefreshCw,
  Copy,
} from 'lucide-react';
import { formatDate, formatDateTime, formatNumber } from '@/lib/utils';
import { StatusBadge } from '@/components/StatusBadge';

export default function PublishedPostsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPublished = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/posts?status=PUBLISHED&limit=50');
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
    loadPublished();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            <span>Published Posts</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Historical log of all live posts published through official LinkedIn integration.
          </p>
        </div>

        <button
          onClick={loadPublished}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="rounded-2xl glass-panel border overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading published history...</div>
        ) : posts.length === 0 ? (
          <div className="p-16 text-center">
            <CheckCircle2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white">No published posts recorded</h3>
            <p className="text-xs text-slate-400 mt-1">Once scheduled posts are published to LinkedIn, they will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {posts.map((post) => (
              <div key={post.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.02] transition">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  {post.media?.length > 0 && (
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-black/40">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={post.media[0].fileUrl} alt="Media" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="space-y-2 flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-200 line-clamp-2 leading-relaxed">
                      {post.content}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span>Published {formatDateTime(post.publishedAt)}</span>
                      <span>•</span>
                      <StatusBadge status={post.status} size="sm" />

                      {post.analytics && (
                        <div className="flex items-center gap-3 ml-2 text-xs font-medium">
                          <span className="flex items-center gap-1 text-blue-400">
                            <Eye className="w-3.5 h-3.5" /> {formatNumber(post.analytics.impressions)} impressions
                          </span>
                          <span className="flex items-center gap-1 text-purple-400">
                            <ThumbsUp className="w-3.5 h-3.5" /> {formatNumber(post.analytics.reactions)} reactions
                          </span>
                          <span className="flex items-center gap-1 text-emerald-400">
                            <MessageSquare className="w-3.5 h-3.5" /> {formatNumber(post.analytics.comments)} comments
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  {post.providerPostUrl ? (
                    <a
                      href={post.providerPostUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-semibold border border-blue-500/30 transition"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>View on LinkedIn</span>
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-500 font-mono">ID: {post.providerPostId || 'Verified'}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
