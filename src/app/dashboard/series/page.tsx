'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Layers,
  Sparkles,
  Calendar,
  Clock,
  Plus,
  Play,
  CheckCircle2,
  Edit,
  X,
  RefreshCw,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Loader2,
  Upload,
  FileText,
} from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { formatDate } from '@/lib/utils';

export default function ContentSeriesPage() {
  const [seriesList, setSeriesList] = useState<any[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // New series modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSeriesData, setNewSeriesData] = useState({
    name: '365-Day SEO Mastery Series',
    description: 'Daily actionable SEO tips and frameworks.',
    startDate: new Date().toISOString().split('T')[0],
    frequency: 'DAILY',
    postingTime: '09:00',
    totalDays: 365,
    initialTopic: 'SEO Fundamentals & Strategy',
  });

  // Bulk Import modal
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');

  // Edit series post modal
  const [editingPost, setEditingPost] = useState<any | null>(null);

  // Month and search filters
  const [selectedMonth, setSelectedMonth] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');

  const MONTHS_LIST = [
    { num: 0, label: 'All 365 Days', range: [1, 365] },
    { num: 1, label: 'M1: Brand Foundation', range: [1, 31] },
    { num: 2, label: 'M2: Keyword Research', range: [32, 62] },
    { num: 3, label: 'M3: On-Page SEO', range: [63, 93] },
    { num: 4, label: 'M4: Technical SEO', range: [94, 124] },
    { num: 5, label: 'M5: Content SEO', range: [125, 155] },
    { num: 6, label: 'M6: Link Building', range: [156, 186] },
    { num: 7, label: 'M7: Local SEO (PK)', range: [187, 217] },
    { num: 8, label: 'M8: GSC & Analytics', range: [218, 248] },
    { num: 9, label: 'M9: SEO Audits', range: [249, 279] },
    { num: 10, label: 'M10: Case Studies', range: [280, 310] },
    { num: 11, label: 'M11: Advanced SEO', range: [311, 341] },
    { num: 12, label: 'M12: Branding & Leads', range: [342, 365] },
  ];

  const handleLoadDefault365Plan = async () => {
    if (!selectedSeries) return;
    if (!confirm('This will load all 365 days of your curated SEO Growth Plan into this series. Proceed?')) return;
    setIsImporting(true);
    try {
      const res = await fetch(`/api/series/${selectedSeries.id}/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usePreset: 'seo-365' }),
      });

      const data = await res.json();
      if (data.success) {
        alert(`🎉 Successfully loaded all 365 days of your SEO Roadmap!`);
        await loadSeriesDetails(selectedSeries.id);
        await loadSeries();
      } else {
        alert(data.error?.message || 'Failed to load plan');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsImporting(false);
    }
  };

  const loadSeriesDetails = async (id: string) => {
    try {
      const res = await fetch(`/api/series/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedSeries(data.series);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadSeries = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/series');
      if (!res.ok) {
        setSeriesList([]);
        setSelectedSeries(null);
        return;
      }

      const data = await res.json();
      const list = Array.isArray(data?.series) ? data.series : [];
      setSeriesList(list);

      if (list.length > 0) {
        setSelectedSeries((current: any) => {
          if (current && list.some((item: any) => item.id === current.id)) {
            return list.find((item: any) => item.id === current.id) ?? list[0];
          }
          return list[0];
        });
      } else {
        setSelectedSeries(null);
      }
    } catch (e) {
      console.error(e);
      setSeriesList([]);
      setSelectedSeries(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSeries();
  }, []);

  const handleCreateSeries = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/series', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSeriesData),
      });

      if (res.ok) {
        setShowCreateModal(false);
        await loadSeries();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleBulkImport = async () => {
    if (!selectedSeries || !importText.trim()) return;
    setIsImporting(true);
    try {
      const res = await fetch(`/api/series/${selectedSeries.id}/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: importText }),
      });

      const data = await res.json();
      if (data.success) {
        alert(`Successfully imported ${data.importedCount} days into your series!`);
        setShowImportModal(false);
        setImportText('');
        await loadSeriesDetails(selectedSeries.id);
        await loadSeries();
      } else {
        alert(data.error?.message || 'Import failed');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setImportText(text || '');
    };
    reader.readAsText(file);
  };

  const handleBatchGenerate = async () => {
    if (!selectedSeries) return;
    setIsGenerating(true);
    try {
      const existingCount = selectedSeries.seriesPosts?.length || 0;
      const res = await fetch(`/api/series/${selectedSeries.id}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDay: existingCount + 1,
          endDay: Math.min(existingCount + 10, selectedSeries.totalDays),
        }),
      });

      if (res.ok) {
        await loadSeriesDetails(selectedSeries.id);
        await loadSeries();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleScheduleAllReady = async () => {
    if (!selectedSeries) return;
    setIsScheduling(true);
    try {
      const res = await fetch(`/api/series/${selectedSeries.id}/schedule`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        alert(`Successfully scheduled ${data.scheduledCount} posts to your LinkedIn queue!`);
        await loadSeriesDetails(selectedSeries.id);
        await loadSeries();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsScheduling(false);
    }
  };

  const handleSaveSeriesPost = async () => {
    if (!editingPost) return;
    try {
      const res = await fetch(`/api/series/post/${editingPost.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: editingPost.topic,
          content: editingPost.content,
          status: editingPost.status,
        }),
      });

      if (res.ok) {
        setEditingPost(null);
        await loadSeriesDetails(selectedSeries.id);
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
            <Layers className="w-6 h-6 text-purple-400" />
            <span>Content Series & 365-Day Plan</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Build long-term authority series, import pre-made 365-day plans, or batch-schedule full campaigns.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedSeries && (
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-semibold border border-blue-500/30 transition"
            >
              <Upload className="w-4 h-4" />
              <span>Import 365-Day Plan</span>
            </button>
          )}

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Series</span>
          </button>
        </div>
      </div>

      {/* Series Grid / Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Series List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Campaigns</h3>
          {seriesList.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setSelectedSeries(null);
                loadSeriesDetails(s.id);
              }}
              className={`w-full text-left p-4 rounded-2xl border transition flex flex-col justify-between space-y-2 ${
                selectedSeries?.id === s.id
                  ? 'bg-purple-600/10 border-purple-500/40 shadow-lg'
                  : 'glass-panel hover:border-white/20'
              }`}
            >
              <div className="flex items-start justify-between">
                <h4 className="font-bold text-white text-sm">{s.name}</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {s.totalDays} Days
                </span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-1">{s.description || 'Continuous content series'}</p>

              {/* Progress bar */}
              <div className="pt-2 border-t border-white/5 space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                  <span>{s.stats?.scheduled + s.stats?.published} of {s.totalDays} Active</span>
                  <span className="text-emerald-400">{s.stats?.published} Published</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                    style={{ width: `${Math.min(100, ((s.stats?.scheduled + s.stats?.published) / s.totalDays) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Right: Selected Series Workspace (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          {selectedSeries ? (
            <div className="rounded-2xl glass-panel p-6 border space-y-6">
              {/* Series Workspace Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white">{selectedSeries.name}</h2>
                    <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
                      {selectedSeries.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Frequency: {selectedSeries.frequency} • Default Time: {selectedSeries.postingTime} • Timezone: {selectedSeries.timezone}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleLoadDefault365Plan}
                    disabled={isImporting}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 text-xs font-bold border border-amber-500/30 transition shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Load 365-Day Plan</span>
                  </button>

                  <button
                    onClick={() => setShowImportModal(true)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition"
                  >
                    <Upload className="w-3.5 h-3.5 text-blue-400" />
                    <span>Import Custom</span>
                  </button>

                  <button
                    onClick={handleBatchGenerate}
                    disabled={isGenerating}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-semibold border border-purple-500/30 transition disabled:opacity-50"
                  >
                    {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span>Generate +10</span>
                  </button>

                  <button
                    onClick={handleScheduleAllReady}
                    disabled={isScheduling}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md transition disabled:opacity-50"
                  >
                    {isScheduling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                    <span>Schedule Ready Posts</span>
                  </button>
                </div>
              </div>

              {/* Month Navigation Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-white/5 text-[11px] scrollbar-thin">
                {MONTHS_LIST.map((m) => {
                  const isActive = selectedMonth === m.num;
                  return (
                    <button
                      key={m.num}
                      onClick={() => setSelectedMonth(m.num)}
                      className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-semibold transition shrink-0 ${
                        isActive
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                      }`}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>

              {/* Search filter */}
              <div className="flex items-center justify-between gap-4">
                <input
                  type="text"
                  placeholder="Search day or keyword (e.g. 'Technical SEO', 'Day 45')..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:max-w-md px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
                <span className="text-[11px] text-slate-400 whitespace-nowrap font-medium">
                  Showing {
                    (selectedSeries.seriesPosts || []).filter((p: any) => {
                      const inMonth =
                        selectedMonth === 0 ||
                        (p.dayNumber >= MONTHS_LIST[selectedMonth]?.range[0] &&
                          p.dayNumber <= MONTHS_LIST[selectedMonth]?.range[1]);
                      const matchQuery =
                        !searchQuery ||
                        p.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        `Day ${p.dayNumber}`.toLowerCase().includes(searchQuery.toLowerCase());
                      return inMonth && matchQuery;
                    }).length
                  } / {selectedSeries.seriesPosts?.length || 0} Days
                </span>
              </div>

              {/* Days List */}
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {(selectedSeries.seriesPosts || [])
                  .filter((post: any) => {
                    const inMonth =
                      selectedMonth === 0 ||
                      (post.dayNumber >= MONTHS_LIST[selectedMonth]?.range[0] &&
                        post.dayNumber <= MONTHS_LIST[selectedMonth]?.range[1]);
                    const matchQuery =
                      !searchQuery ||
                      post.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      `Day ${post.dayNumber}`.toLowerCase().includes(searchQuery.toLowerCase());
                    return inMonth && matchQuery;
                  })
                  .map((post: any) => (
                  <div
                    key={post.id}
                    className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-purple-500/30 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold text-xs flex items-center justify-center shrink-0">
                        {post.dayNumber}
                      </span>

                      <div className="space-y-1 flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{post.topic}</h4>
                        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed font-sans">
                          {post.content || 'Content not yet generated.'}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
                          <span>{formatDate(post.scheduledDate)} @ {post.scheduledTime}</span>
                          <span>•</span>
                          <StatusBadge status={post.status} size="sm" />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setEditingPost(post)}
                      className="self-end sm:self-center px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition flex items-center gap-1 shrink-0"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Review / Edit</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl glass-panel p-12 text-center border">
              <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-white">Select a Content Series</h3>
              <p className="text-xs text-slate-400 mt-1">Choose an existing series or create a new 365-day plan.</p>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Import 365-Day Plan Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-[#0d1226] border border-white/10 p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-white text-base">Bulk Import 365-Day Content Plan</h3>
              </div>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Paste your list of topics or complete posts below (one per line, or CSV format). We will automatically map them into Day 1 to Day 365 in your series.
            </p>

            {/* Upload File shortcut */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <FileText className="w-4 h-4 text-purple-400" />
                <span>Upload .txt or .csv file</span>
              </div>
              <label className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer transition">
                <span>Browse File</span>
                <input
                  type="file"
                  accept=".txt,.csv,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Textarea */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Paste 365 Days Topics / Posts:
              </label>
              <textarea
                rows={12}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Day 1: What I Want to Become Known For in SEO
Day 2: My SEO Learning Roadmap & Core Frameworks
Day 3: 3 SEO Skills Every Beginner Should Build First
Day 4: What I Wish I Knew Before Starting SEO
...
Day 365: Final Reflections & Year in Review"
                className="w-full p-3 rounded-xl bg-[#060814] border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500 font-mono leading-relaxed"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                {importText.split('\n').filter((l) => l.trim().length > 0).length} days detected in input text
              </span>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-xs font-medium hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkImport}
                disabled={isImporting || !importText.trim()}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-bold shadow-md transition disabled:opacity-50 flex items-center gap-2"
              >
                {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                <span>Import All Days Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New Series Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#0d1226] border border-white/10 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-white text-base">Create Content Series</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSeries} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Series Name</label>
                <input
                  type="text"
                  required
                  value={newSeriesData.name}
                  onChange={(e) => setNewSeriesData({ ...newSeriesData, name: e.target.value })}
                  placeholder="e.g. 365-Day SEO Mastery Series"
                  className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Core Topic / Theme</label>
                <input
                  type="text"
                  value={newSeriesData.initialTopic}
                  onChange={(e) => setNewSeriesData({ ...newSeriesData, initialTopic: e.target.value })}
                  placeholder="e.g. SEO, Growth, Leadership"
                  className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Total Days</label>
                  <input
                    type="number"
                    value={newSeriesData.totalDays}
                    onChange={(e) => setNewSeriesData({ ...newSeriesData, totalDays: parseInt(e.target.value) || 30 })}
                    className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Posting Time</label>
                  <input
                    type="time"
                    value={newSeriesData.postingTime}
                    onChange={(e) => setNewSeriesData({ ...newSeriesData, postingTime: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 font-medium hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md"
                >
                  Create Series
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Series Post Modal */}
      {editingPost && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-2xl bg-[#0d1226] border border-white/10 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-white text-base">Edit Day {editingPost.dayNumber} Post</h3>
              <button onClick={() => setEditingPost(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Day Topic</label>
                <input
                  type="text"
                  value={editingPost.topic}
                  onChange={(e) => setEditingPost({ ...editingPost, topic: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Post Content</label>
                <textarea
                  rows={8}
                  value={editingPost.content || ''}
                  onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[#060814] border border-white/10 text-white focus:outline-none focus:border-blue-500 leading-relaxed"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingPost(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 font-medium hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveSeriesPost}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
