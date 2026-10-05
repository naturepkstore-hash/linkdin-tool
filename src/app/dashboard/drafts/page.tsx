'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Copy,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDrafts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/posts?status=DRAFT&limit=50');
      if (res.ok) {
        const data = await res.json();
        setDrafts(data.posts || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrafts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this draft?')) return;
    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      if (res.ok) loadDrafts();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-slate-400" />
            <span>Drafts</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Unscheduled post concepts and ideas saved for later refinement.
          </p>
        </div>

        <Link
          href="/dashboard/create"
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Draft</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-12 text-center text-xs text-slate-400">Loading drafts...</div>
        ) : drafts.length === 0 ? (
          <div className="col-span-full p-16 text-center rounded-2xl glass-panel border">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white">No drafts found</h3>
            <p className="text-xs text-slate-400 mt-1">Start writing a post or generate one with AI.</p>
            <Link
              href="/dashboard/create"
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Post</span>
            </Link>
          </div>
        ) : (
          drafts.map((post) => (
            <div
              key={post.id}
              className="rounded-2xl glass-panel-interactive border p-5 flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Saved {formatDate(post.updatedAt)}</span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-white/5 border border-white/5">
                    Draft
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-200 line-clamp-4 leading-relaxed">
                  {post.content}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <Link
                  href={`/dashboard/create?edit=${post.id}`}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-semibold border border-blue-500/30 transition"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Open in Editor</span>
                </Link>

                <button
                  onClick={() => handleDelete(post.id)}
                  title="Delete Draft"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
