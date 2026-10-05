'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Clock,
  Play,
  Edit,
  Trash2,
  Copy,
  XCircle,
  Plus,
  AlertCircle,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import { Linkedin } from '@/components/icons/LinkedInIcon';
import { StatusBadge } from '@/components/StatusBadge';
import { formatDateTime } from '@/lib/utils';

export default function ScheduledPostsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const loadScheduledPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/posts?status=SCHEDULED&limit=50');
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
    loadScheduledPosts();
  }, []);

  const handlePublishNow = async (postId: string) => {
    setActionLoadingId(postId);
    try {
      const res = await fetch(`/api/posts/${postId}/publish`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        loadScheduledPosts();
      } else {
        alert(data.error?.message || 'Publishing failed');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancelSchedule = async (postId: string) => {
    if (!confirm('Are you sure you want to cancel this scheduled post? It will be moved to Drafts.')) return;
    try {
      const res = await fetch(`/api/posts/${postId}/cancel`, { method: 'POST' });
      if (res.ok) {
        loadScheduledPosts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDuplicate = async (postId: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}/duplicate`, { method: 'POST' });
      if (res.ok) {
        alert('Post duplicated as draft.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
      if (res.ok) {
        loadScheduledPosts();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-400" />
            <span>Scheduled Posts Queue</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Posts waiting to be processed automatically by the background publisher worker.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadScheduledPosts}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <Link
            href="/dashboard/create"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Post</span>
          </Link>
        </div>
      </div>

      {/* Posts List / Table Card */}
      <div className="rounded-2xl glass-panel border overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading scheduled queue...</div>
        ) : posts.length === 0 ? (
          <div className="p-16 text-center">
            <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white">No scheduled posts in the queue</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Your content calendar is currently clear. Schedule upcoming LinkedIn updates to maintain consistent presence.
            </p>
            <Link
              href="/dashboard/create"
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create & Schedule Post</span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {posts.map((post) => (
              <div
                key={post.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.02] transition"
              >
                {/* Left: Content & Media */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  {post.media?.length > 0 && (
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-black/40">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.media[0].fileUrl}
                        alt="Media"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 line-clamp-2 leading-relaxed">
                      {post.content}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1 font-mono text-blue-400">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDateTime(post.scheduledAt)}
                      </span>

                      {post.socialAccount && (
                        <span className="flex items-center gap-1 text-slate-300">
                          <Linkedin className="w-3 h-3 text-[#0a66c2] fill-current" />
                          {post.socialAccount.displayName}
                        </span>
                      )}

                      <StatusBadge status={post.status} size="sm" />

                      {post.lastError && (
                        <span className="text-amber-400 text-[11px] flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {post.lastError}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5 self-end md:self-center shrink-0">
                  <button
                    onClick={() => handlePublishNow(post.id)}
                    disabled={actionLoadingId === post.id}
                    title="Publish Immediately"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Publish Now</span>
                  </button>

                  <Link
                    href={`/dashboard/create?edit=${post.id}`}
                    title="Edit Post"
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={() => handleDuplicate(post.id)}
                    title="Duplicate"
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleCancelSchedule(post.id)}
                    title="Cancel Schedule"
                    className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(post.id)}
                    title="Delete"
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
