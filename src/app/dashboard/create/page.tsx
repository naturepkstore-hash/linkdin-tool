'use client';

import React, { useState, useEffect, useTransition, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Sparkles,
  Calendar,
  Clock,
  Send,
  Save,
  Image as ImageIcon,
  X,
  Upload,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Hash,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { LinkedInPreview } from '@/components/LinkedInPreview';
import { ContentQualityCard } from '@/components/ContentQualityCard';
import { QualityAnalysis, analyzeContentQuality } from '@/lib/quality';

export default function CreatePostPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading editor...</div>}>
      <CreatePostContent />
    </Suspense>
  );
}

function CreatePostContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const [isPending, startTransition] = useTransition();

  const [content, setContent] = useState('');
  const [contentType, setContentType] = useState<'TEXT' | 'IMAGE'>('TEXT');
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaId, setMediaId] = useState<string | null>(null);

  // Scheduling options
  const [publishMode, setPublishMode] = useState<'publish_now' | 'schedule' | 'draft'>('schedule');
  const [scheduledDate, setScheduledDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [scheduledTime, setScheduledTime] = useState('09:30');
  const [userTimezone, setUserTimezone] = useState('UTC');

  // Author details
  const [author, setAuthor] = useState<{
    name: string;
    headline: string;
    avatarUrl: string | null;
  }>({
    name: 'Alex Rivera',
    headline: 'Head of Growth & Content Strategy | LinkedIn Creator',
    avatarUrl: null,
  });

  // Quality Analysis
  const [qualityAnalysis, setQualityAnalysis] = useState<QualityAnalysis | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<{ message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Hashtag suggestions
  const suggestedHashtags = [
    '#SEO',
    '#LinkedInGrowth',
    '#PersonalBrand',
    '#ContentStrategy',
    '#B2BMarketing',
    '#Leadership',
    '#Productivity',
  ];

  useEffect(() => {
    async function initData() {
      try {
        const [authRes, liRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/linkedin/profile'),
        ]);

        if (authRes.ok) {
          const authData = await authRes.json();
          if (authData.user) {
            setUserTimezone(authData.user.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);
          }
        }

        if (liRes.ok) {
          const liData = await liRes.json();
          if (liData.account) {
            setAuthor({
              name: liData.account.displayName,
              headline: liData.account.headline || 'LinkedIn Creator',
              avatarUrl: liData.account.avatarUrl,
            });
          }
        }

        // If edit mode, load existing post
        if (editId) {
          const postRes = await fetch(`/api/posts/${editId}`);
          if (postRes.ok) {
            const pData = await postRes.json();
            if (pData.post) {
              setContent(pData.post.content);
              setContentType(pData.post.contentType || 'TEXT');
              if (pData.post.media?.length > 0) {
                setMediaUrl(pData.post.media[0].fileUrl);
                setMediaId(pData.post.media[0].id);
              }
              if (pData.post.scheduledAt) {
                const d = new Date(pData.post.scheduledAt);
                setScheduledDate(d.toISOString().split('T')[0]);
                setScheduledTime(d.toTimeString().slice(0, 5));
                setPublishMode('schedule');
              }
            }
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    initData();
  }, [editId]);

  // Live Quality Evaluation
  useEffect(() => {
    if (!content.trim()) {
      setQualityAnalysis(null);
      setDuplicateWarning(null);
      return;
    }

    const localAnalysis = analyzeContentQuality(content);
    setQualityAnalysis(localAnalysis);

    const debounceCheck = setTimeout(async () => {
      try {
        const res = await fetch('/api/ai/quality', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, currentPostId: editId }),
        });
        if (res.ok) {
          const data = await res.json();
          setDuplicateWarning(data.duplicateWarning || null);
        }
      } catch (err) {
        console.error(err);
      }
    }, 600);

    return () => clearTimeout(debounceCheck);
  }, [content, editId]);

  // Image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.media) {
        setMediaUrl(data.media.fileUrl);
        setMediaId(data.media.id);
        setContentType('IMAGE');
      } else {
        alert(data.error?.message || 'Failed to upload image');
      }
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    }
  };

  const insertHashtag = (tag: string) => {
    if (content.includes(tag)) return;
    setContent((prev) => (prev ? `${prev} ${tag}` : tag));
  };

  const handleSavePost = async (actionOverride?: 'draft' | 'schedule' | 'publish_now') => {
    const chosenAction = actionOverride || publishMode;

    if (!content.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter post content before saving.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      let targetScheduledAt: string | null = null;
      if (chosenAction === 'schedule') {
        const combined = new Date(`${scheduledDate}T${scheduledTime}:00`);
        targetScheduledAt = combined.toISOString();
      }

      const payload = {
        content,
        contentType,
        action: chosenAction,
        scheduledAt: targetScheduledAt,
        timezone: userTimezone,
        mediaIds: mediaId ? [mediaId] : [],
      };

      let res;
      if (editId) {
        res = await fetch(`/api/posts/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();

      if (data.success) {
        if (chosenAction === 'publish_now') {
          setStatusMessage({ type: 'success', text: 'Post published successfully to LinkedIn!' });
          setTimeout(() => router.push('/dashboard/published'), 1200);
        } else if (chosenAction === 'schedule') {
          setStatusMessage({ type: 'success', text: 'Post scheduled successfully!' });
          setTimeout(() => router.push('/dashboard/scheduled'), 1200);
        } else {
          setStatusMessage({ type: 'success', text: 'Draft saved successfully!' });
          setTimeout(() => router.push('/dashboard/drafts'), 1200);
        }
      } else {
        setStatusMessage({
          type: 'error',
          text: data.error?.message || 'Action failed. Please check your settings.',
        });
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'An unexpected network error occurred.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Top Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-400" />
            <span>{editId ? 'Edit LinkedIn Post' : 'Create LinkedIn Post'}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Write, optimize, preview, and schedule content through the official LinkedIn API.
          </p>
        </div>

        {/* Status Alert Banner */}
        {statusMessage && (
          <div
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
              statusMessage.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}
      </div>

      {/* Main Grid: Left Editor | Right Live Preview & Quality Analyzer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Post Editor (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl glass-panel p-6 border space-y-5">
            {/* Content Type Selector */}
            <div className="flex items-center gap-2 pb-3 border-b border-white/10">
              <span className="text-xs font-semibold text-slate-400 mr-2">Format:</span>
              <button
                type="button"
                onClick={() => setContentType('TEXT')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                  contentType === 'TEXT' && !mediaUrl
                    ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                    : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                }`}
              >
                Text Post
              </button>
              <button
                type="button"
                onClick={() => setContentType('IMAGE')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                  contentType === 'IMAGE' || mediaUrl
                    ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                    : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Text + Image</span>
              </button>
            </div>

            {/* Post Textarea */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300">Post Copy</label>
                <span
                  className={`text-xs font-mono ${
                    content.length > 2800
                      ? 'text-rose-400 font-bold'
                      : content.length > 2000
                      ? 'text-amber-400'
                      : 'text-slate-400'
                  }`}
                >
                  {content.length} / 3,000 characters
                </span>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                placeholder="Write your LinkedIn post here... 

Tip: Start with a punchy 1-2 line hook, leave whitespace for skimming, and close with an engaging question."
                className="w-full p-4 rounded-xl bg-[#060814] border border-white/10 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 leading-relaxed transition"
              />
            </div>

            {/* Hashtag Suggestions */}
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
                <Hash className="w-3.5 h-3.5 text-purple-400" />
                <span className="font-semibold text-slate-300">Recommended Hashtags:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {suggestedHashtags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => insertHashtag(tag)}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-purple-500/20 text-slate-300 hover:text-purple-300 border border-white/10 text-xs font-medium transition"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Image / Media Upload Section */}
            {(contentType === 'IMAGE' || mediaUrl) && (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Attached Image</span>
                  {mediaUrl && (
                    <button
                      onClick={() => {
                        setMediaUrl(null);
                        setMediaId(null);
                      }}
                      className="text-rose-400 hover:underline text-[11px] flex items-center gap-1"
                    >
                      <X className="w-3 h-3" /> Remove image
                    </button>
                  )}
                </label>

                {mediaUrl ? (
                  <div className="relative rounded-xl overflow-hidden border border-white/10 max-h-56 bg-black/40">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={mediaUrl} alt="Attached" className="w-full h-48 object-cover" />
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-white/10 hover:border-blue-500/40 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition bg-white/[0.02]">
                    <Upload className="w-6 h-6 text-slate-400 mb-2" />
                    <span className="text-xs font-semibold text-slate-200">Click to upload image</span>
                    <span className="text-[11px] text-slate-500 mt-0.5">JPG, PNG, WEBP (Max 10MB)</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            )}

            {/* Scheduling & Publishing Options Panel */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-950/30 to-purple-950/20 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Publishing Mode
                </span>
                <span className="text-[11px] text-blue-400 font-mono">
                  Timezone: {userTimezone}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPublishMode('schedule')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                    publishMode === 'schedule'
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                      : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Schedule</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPublishMode('publish_now')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                    publishMode === 'publish_now'
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                      : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>Publish Now</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPublishMode('draft')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                    publishMode === 'draft'
                      ? 'bg-slate-700 text-white border-slate-600 shadow-md'
                      : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                  }`}
                >
                  <Save className="w-4 h-4" />
                  <span>Draft</span>
                </button>
              </div>

              {/* Date & Time pickers if Schedule mode */}
              {publishMode === 'schedule' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-[11px] font-medium text-slate-400 block mb-1">
                      Scheduled Date
                    </label>
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full p-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-400 block mb-1">
                      Scheduled Time
                    </label>
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full p-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Submission Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => handleSavePost('draft')}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition disabled:opacity-50"
              >
                Save as Draft
              </button>

              <button
                type="button"
                onClick={() => handleSavePost()}
                disabled={isSubmitting || !content.trim()}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition flex items-center gap-2 disabled:opacity-50 ${
                  publishMode === 'publish_now'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/20'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-blue-500/25'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : publishMode === 'publish_now' ? (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Publish Immediately</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4" />
                    <span>Schedule LinkedIn Post</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live LinkedIn Preview & Quality Analysis (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live Realistic LinkedIn Feed Preview */}
          <LinkedInPreview
            authorName={author.name}
            authorHeadline={author.headline}
            authorAvatar={author.avatarUrl}
            content={content}
            imageUrl={mediaUrl}
          />

          {/* Content Quality & Duplicate Detector Card */}
          <ContentQualityCard
            analysis={qualityAnalysis}
            duplicateWarning={duplicateWarning}
          />
        </div>
      </div>
    </div>
  );
}
