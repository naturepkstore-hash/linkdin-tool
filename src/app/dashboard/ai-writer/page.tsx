'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  RefreshCw,
  Zap,
  ArrowRight,
  Copy,
  Check,
  Send,
  Sliders,
  Flame,
  MessageSquarePlus,
  Minimize2,
  Maximize2,
  Briefcase,
  Smile,
  Hash,
  Loader2,
} from 'lucide-react';
import { LinkedInPreview } from '@/components/LinkedInPreview';

export default function AIWriterPage() {
  const router = useRouter();

  const [topic, setTopic] = useState('');
  const [goal, setGoal] = useState('Personal Brand');
  const [tone, setTone] = useState('Professional');
  const [audience, setAudience] = useState('General LinkedIn Audience');
  const [length, setLength] = useState<'Short' | 'Medium' | 'Long'>('Medium');
  const [cta, setCta] = useState('');

  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [copied, setCopied] = useState(false);

  const contentGoals = [
    'Personal Brand',
    'SEO Tips',
    'Educational',
    'Lead Generation',
    'Engagement',
    'Storytelling',
    'Promotional',
    'Case Study',
    'Industry News',
  ];

  const toneOptions = [
    'Professional',
    'Conversational',
    'Expert',
    'Friendly',
    'Storytelling',
    'Simple',
  ];

  const audienceOptions = [
    'General LinkedIn Audience',
    'Marketing Professionals',
    'SEO Beginners',
    'Business Owners',
    'Shopify Store Owners',
    'Agencies',
  ];

  const handleGenerate = async () => {
    if (!topic.trim()) {
      alert('Please enter a topic for your LinkedIn post.');
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          goal,
          tone,
          audience,
          length,
          cta,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setGeneratedContent(data.data.content);
      } else {
        alert(data.error?.message || 'Generation failed');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImproveAction = async (action: string) => {
    if (!generatedContent.trim()) return;
    setIsImproving(true);
    try {
      const res = await fetch('/api/ai/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: generatedContent,
          action,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setGeneratedContent(data.content);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsImproving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendToEditor = () => {
    sessionStorage.setItem('postflow_prefill_content', generatedContent);
    router.push('/dashboard/create');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-400" />
            <span>AI LinkedIn Content Strategist</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Generate viral hooks, high-converting frameworks, and tailored thought leadership posts in seconds.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Prompt Engine Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="rounded-2xl glass-panel p-6 border space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-purple-400" />
              <span>Prompt Parameters</span>
            </h3>

            {/* Topic */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Topic or Key Idea <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={3}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Why most B2B founders fail to build organic LinkedIn pipeline..."
                className="w-full p-3 rounded-xl bg-[#060814] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Content Goal */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Content Goal</label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#060814] border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                {contentGoals.map((g) => (
                  <option key={g} value={g} className="bg-[#0d1226]">
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {/* Tone & Length */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tone of Voice</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#060814] border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  {toneOptions.map((t) => (
                    <option key={t} value={t} className="bg-[#0d1226]">
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Post Length</label>
                <select
                  value={length}
                  onChange={(e) => setLength(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-[#060814] border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="Short" className="bg-[#0d1226]">Short (~300 chars)</option>
                  <option value="Medium" className="bg-[#0d1226]">Medium (~800 chars)</option>
                  <option value="Long" className="bg-[#0d1226]">Long (~1500 chars)</option>
                </select>
              </div>
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Audience</label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#060814] border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                {audienceOptions.map((a) => (
                  <option key={a} value={a} className="bg-[#0d1226]">
                    {a}
                  </option>
                ))}
              </select>
            </div>

            {/* CTA */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Custom Call To Action (Optional)
              </label>
              <input
                type="text"
                value={cta}
                onChange={(e) => setCta(e.target.value)}
                placeholder="e.g. What is your #1 growth channel? Drop it below 👇"
                className="w-full p-2.5 rounded-xl bg-[#060814] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !topic.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-purple-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Engineering LinkedIn Post...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-white" />
                  <span>Generate Post</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Area: AI Output & One-Click Rewrites (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="rounded-2xl glass-panel p-6 border space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Generated Output
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  disabled={!generatedContent}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs transition disabled:opacity-40"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={handleSendToEditor}
                  disabled={!generatedContent}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition disabled:opacity-40"
                >
                  <span>Export to Post Editor</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Editable Output Box */}
            <textarea
              rows={11}
              value={generatedContent}
              onChange={(e) => setGeneratedContent(e.target.value)}
              placeholder="Your AI-crafted LinkedIn post will appear here. You can refine, edit, and click any improvement shortcut below..."
              className="w-full p-4 rounded-xl bg-[#060814] border border-white/10 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 leading-relaxed font-normal"
            />

            {/* 8 AI Improvement Actions */}
            <div className="pt-3 border-t border-white/10 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
                Instant AI Enhancers & Rewrites
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => handleImproveAction('add_hook')}
                  disabled={!generatedContent || isImproving}
                  className="p-2 rounded-xl bg-white/5 hover:bg-purple-500/20 text-slate-300 hover:text-purple-300 border border-white/10 text-xs font-medium transition flex items-center gap-1.5 justify-center"
                >
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Add Viral Hook</span>
                </button>

                <button
                  onClick={() => handleImproveAction('add_cta')}
                  disabled={!generatedContent || isImproving}
                  className="p-2 rounded-xl bg-white/5 hover:bg-purple-500/20 text-slate-300 hover:text-purple-300 border border-white/10 text-xs font-medium transition flex items-center gap-1.5 justify-center"
                >
                  <MessageSquarePlus className="w-3.5 h-3.5 text-blue-400" />
                  <span>Add CTA</span>
                </button>

                <button
                  onClick={() => handleImproveAction('shorten')}
                  disabled={!generatedContent || isImproving}
                  className="p-2 rounded-xl bg-white/5 hover:bg-purple-500/20 text-slate-300 hover:text-purple-300 border border-white/10 text-xs font-medium transition flex items-center gap-1.5 justify-center"
                >
                  <Minimize2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Shorten</span>
                </button>

                <button
                  onClick={() => handleImproveAction('expand')}
                  disabled={!generatedContent || isImproving}
                  className="p-2 rounded-xl bg-white/5 hover:bg-purple-500/20 text-slate-300 hover:text-purple-300 border border-white/10 text-xs font-medium transition flex items-center gap-1.5 justify-center"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Expand</span>
                </button>

                <button
                  onClick={() => handleImproveAction('professional')}
                  disabled={!generatedContent || isImproving}
                  className="p-2 rounded-xl bg-white/5 hover:bg-purple-500/20 text-slate-300 hover:text-purple-300 border border-white/10 text-xs font-medium transition flex items-center gap-1.5 justify-center"
                >
                  <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                  <span>More Professional</span>
                </button>

                <button
                  onClick={() => handleImproveAction('conversational')}
                  disabled={!generatedContent || isImproving}
                  className="p-2 rounded-xl bg-white/5 hover:bg-purple-500/20 text-slate-300 hover:text-purple-300 border border-white/10 text-xs font-medium transition flex items-center gap-1.5 justify-center"
                >
                  <Smile className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Conversational</span>
                </button>

                <button
                  onClick={() => handleImproveAction('hashtags')}
                  disabled={!generatedContent || isImproving}
                  className="p-2 rounded-xl bg-white/5 hover:bg-purple-500/20 text-slate-300 hover:text-purple-300 border border-white/10 text-xs font-medium transition flex items-center gap-1.5 justify-center"
                >
                  <Hash className="w-3.5 h-3.5 text-pink-400" />
                  <span>Hashtags</span>
                </button>

                <button
                  onClick={handleGenerate}
                  disabled={!topic.trim() || isGenerating}
                  className="p-2 rounded-xl bg-white/5 hover:bg-purple-500/20 text-slate-300 hover:text-purple-300 border border-white/10 text-xs font-medium transition flex items-center gap-1.5 justify-center"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
                  <span>Regenerate</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
