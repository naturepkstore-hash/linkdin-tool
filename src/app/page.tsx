'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Zap,
  Sparkles,
  Calendar,
  Clock,
  CheckCircle2,
  Layers,
  ArrowRight,
  ShieldCheck,
  BarChart3,
  Globe,
  Star,
  ChevronRight,
  MessageSquare,
  ThumbsUp,
  Flame,
  Check,
} from 'lucide-react';
import { Linkedin } from '@/components/icons/LinkedInIcon';
import { LinkedInPreview } from '@/components/LinkedInPreview';

export default function LandingPage() {
  const [demoTopic, setDemoTopic] = useState('How we scaled SEO traffic from 0 to 50k visitors/mo');
  const [demoContent, setDemoContent] = useState(
    `90% of LinkedIn creators quit after 3 weeks.\n\nHere is what separates the top 1% from everyone else:\n\n1. They pick 1 core problem to solve.\n2. They write for practitioners, not algorithms.\n3. They build repeatable systems to schedule 30 days ahead.\n\nConsistency in execution beats sporadic brilliance every time.\n\nWhat is your #1 content goal this quarter? Drop it below 👇\n\n#LinkedInGrowth #PersonalBrand #SEO #Marketing`
  );

  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-[#070913]/80 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
              PostFlow <span className="text-xs px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30">AI</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#how-it-works" className="hover:text-white transition">How It Works</a>
            <a href="#series-365" className="hover:text-white transition">365-Day Plan</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
            <a href="#faq" className="hover:text-white transition">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 transition transform active:scale-95"
            >
              Start Creating Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-blue-600/20 to-purple-600/20 blur-[120px] pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Create. Schedule. Publish. Grow.</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight">
            Automate Your <br className="hidden sm:inline" />
            <span className="gradient-text">LinkedIn Content Engine.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Create, optimize with AI, schedule 365 days in advance, and auto-publish directly through the official LinkedIn API. Zero scraping. 100% compliant.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-sm font-bold shadow-xl shadow-blue-500/25 transition transform active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Start Creating Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-sm font-semibold border border-white/10 transition flex items-center justify-center gap-2"
            >
              <Linkedin className="w-4 h-4 text-[#0a66c2] fill-current" />
              <span>Sign In with Demo Account</span>
            </Link>
          </div>

          {/* Social Proof Badges */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Official LinkedIn OAuth 2.0
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-400" /> Modular AI Prompt Engine
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-400" /> Idempotent Auto-Publisher
            </span>
          </div>
        </div>

        {/* Live Interactive Preview Demo */}
        <div className="max-w-4xl mx-auto mt-16 rounded-3xl p-2 bg-gradient-to-b from-white/15 to-white/5 border border-white/10 shadow-2xl">
          <div className="rounded-2xl bg-[#0a0e24] p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span className="ml-2 text-xs font-semibold text-slate-400">Live LinkedIn Feed Simulator</span>
              </div>
              <span className="text-xs text-blue-400 font-mono">Real-Time Algorithmic Preview</span>
            </div>

            <LinkedInPreview
              authorName="Alex Rivera"
              authorHeadline="Head of Growth & SEO Strategy | LinkedIn Creator"
              content={demoContent}
            />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-white/10 bg-[#070a1a]/50">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-xs font-bold text-blue-400 uppercase tracking-wider">Enterprise Architecture</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Everything you need to dominate LinkedIn.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl glass-panel-interactive border space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Linkedin className="w-5 h-5 fill-current" />
              </div>
              <h3 className="font-bold text-white text-base">Official LinkedIn API</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect securely using official OAuth 2.0 and publish posts with full UGC protocol compliance. No account bans or password exposure.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-panel-interactive border space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">AI Prompt Engine</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Craft viral hooks, strategic value breakdowns, and tailored CTAs adapted to your specific industry tone and target audience.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-panel-interactive border space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">365-Day Series Planner</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Build authority with structured multi-day campaigns like &quot;365-Day SEO Mastery&quot; or &quot;30-Day Founder Playbook&quot; in a single click.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-panel-interactive border space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Interactive Content Calendar</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Filter by drafts, scheduled, and published statuses across monthly and weekly layouts with instant drag-and-drop side inspectors.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-panel-interactive border space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Post Quality Analyzer</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Live algorithmic evaluation of hook strength, readability score, hashtag density, and duplicate content protection before scheduling.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-panel-interactive border space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Deep Analytics</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Track impressions, reactions, comments, reposts, and engagement rates directly from official LinkedIn data feeds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-xs font-bold text-purple-400 uppercase tracking-wider">Streamlined Workflow</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              From blank idea to published LinkedIn post in 4 steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl glass-panel border space-y-3 relative">
              <span className="text-3xl font-black text-blue-500/30 font-mono">01</span>
              <h4 className="font-bold text-white text-sm">Connect Profile</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                1-click official LinkedIn OAuth handshake. Tokens are encrypted server-side.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-panel border space-y-3 relative">
              <span className="text-3xl font-black text-purple-500/30 font-mono">02</span>
              <h4 className="font-bold text-white text-sm">Draft or AI Generate</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Use the AI writer to generate hooks, frameworks, or write freehand in the rich editor.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-panel border space-y-3 relative">
              <span className="text-3xl font-black text-cyan-500/30 font-mono">03</span>
              <h4 className="font-bold text-white text-sm">Schedule Ahead</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pick your preferred local date, time, and timezone. It is queued automatically.
              </p>
            </div>

            <div className="p-6 rounded-2xl glass-panel border space-y-3 relative">
              <span className="text-3xl font-black text-emerald-500/30 font-mono">04</span>
              <h4 className="font-bold text-white text-sm">Auto-Published</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Background publisher delivers the post with media and logs analytics immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-white/10 bg-[#070a1a]/50">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-xs font-bold text-blue-400 uppercase tracking-wider">Simple & Transparent</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Start free, upgrade as you scale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free */}
            <div className="p-8 rounded-3xl glass-panel border space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs font-bold text-slate-400 uppercase">Starter</span>
                <div className="flex items-baseline gap-1 text-white">
                  <span className="text-4xl font-extrabold">$0</span>
                  <span className="text-xs text-slate-400">/month</span>
                </div>
                <p className="text-xs text-slate-400">Perfect for individuals starting out on LinkedIn.</p>

                <ul className="space-y-2.5 text-xs text-slate-300 pt-4 border-t border-white/10">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" /> 1 Connected LinkedIn Profile
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" /> 20 Scheduled Posts / month
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" /> Basic AI Writer Engine
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" /> Content Calendar
                  </li>
                </ul>
              </div>

              <Link
                href="/register"
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/10 text-center transition"
              >
                Get Started Free
              </Link>
            </div>

            {/* Pro (Highlighted) */}
            <div className="p-8 rounded-3xl bg-gradient-to-b from-blue-900/30 to-purple-900/20 border-2 border-blue-500/50 space-y-6 flex flex-col justify-between shadow-2xl shadow-blue-500/10 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider shadow">
                Most Popular
              </div>

              <div className="space-y-4">
                <span className="text-xs font-bold text-blue-400 uppercase">Creator Pro</span>
                <div className="flex items-baseline gap-1 text-white">
                  <span className="text-4xl font-extrabold">$29</span>
                  <span className="text-xs text-slate-400">/month</span>
                </div>
                <p className="text-xs text-slate-400">For creators and founders scaling organic pipeline.</p>

                <ul className="space-y-2.5 text-xs text-slate-200 pt-4 border-t border-white/10">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-400 shrink-0" /> Unlimited Scheduled Posts
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-400 shrink-0" /> 365-Day Series Planner
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-400 shrink-0" /> Advanced AI Strategist & Hook Engine
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-400 shrink-0" /> Quality & Duplicate Inspector
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-400 shrink-0" /> Full Analytics History
                  </li>
                </ul>
              </div>

              <Link
                href="/register"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-bold text-center shadow-lg transition"
              >
                Upgrade to Pro
              </Link>
            </div>

            {/* Agency */}
            <div className="p-8 rounded-3xl glass-panel border space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs font-bold text-slate-400 uppercase">Agency & Team</span>
                <div className="flex items-baseline gap-1 text-white">
                  <span className="text-4xl font-extrabold">$79</span>
                  <span className="text-xs text-slate-400">/month</span>
                </div>
                <p className="text-xs text-slate-400">For agencies managing multiple client LinkedIn accounts.</p>

                <ul className="space-y-2.5 text-xs text-slate-300 pt-4 border-t border-white/10">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" /> Multiple LinkedIn Accounts
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" /> Unlimited Content Series
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" /> Custom AI Tone Profiles
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" /> Priority Worker Queue
                  </li>
                </ul>
              </div>

              <Link
                href="/register"
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/10 text-center transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-xs font-bold text-blue-400 uppercase tracking-wider">Frequently Asked Questions</h2>
            <p className="text-3xl font-extrabold text-white tracking-tight">Everything you need to know.</p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-5 rounded-2xl glass-panel border space-y-2">
              <h4 className="font-bold text-white text-sm">Is this compliant with LinkedIn&apos;s Terms of Service?</h4>
              <p className="text-slate-400 leading-relaxed">
                Yes, 100%. PostFlow AI uses exclusively the official LinkedIn OAuth 2.0 and Community Management REST APIs. We never scrape, never use cookie injection, and never ask for passwords.
              </p>
            </div>

            <div className="p-5 rounded-2xl glass-panel border space-y-2">
              <h4 className="font-bold text-white text-sm">How does the 365-Day Series Plan work?</h4>
              <p className="text-slate-400 leading-relaxed">
                You can create a structured topic curriculum and let the AI generate daily content slots from Day 1 to Day 365. You can review and edit each post before 1-click scheduling into the publishing queue.
              </p>
            </div>

            <div className="p-5 rounded-2xl glass-panel border space-y-2">
              <h4 className="font-bold text-white text-sm">How are timezones handled?</h4>
              <p className="text-slate-400 leading-relaxed">
                All scheduled dates are converted to UTC in the database, while always displaying and scheduling according to your selected local timezone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="border-t border-white/10 py-12 px-4 text-center space-y-4 bg-[#05070e]">
        <div className="flex items-center justify-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <Zap className="w-4 h-4 fill-white" />
          </div>
          <span className="font-bold text-white text-sm">PostFlow AI</span>
        </div>
        <p className="text-xs text-slate-500">
          © 2026 PostFlow AI. Create. Schedule. Publish. Grow. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
