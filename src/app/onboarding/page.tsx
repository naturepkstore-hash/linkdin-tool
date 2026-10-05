'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Zap,
  CheckCircle2,
  ArrowRight,
  Globe,
  Target,
  Sparkles,
  Check,
} from 'lucide-react';
import { Linkedin } from '@/components/icons/LinkedInIcon';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
  const [selectedGoals, setSelectedGoals] = useState<string[]>(['Personal Brand', 'SEO']);

  const goals = [
    'Personal Brand',
    'SEO & Organic Traffic',
    'Lead Generation',
    'B2B Marketing',
    'Founder Storytelling',
    'Education & Tips',
  ];

  const toggleGoal = (goal: string) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter((g) => g !== goal));
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  const handleFinish = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#070913]">
      <div className="w-full max-w-xl space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-between px-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                  step === s
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
                    : step > s
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-white/5 text-slate-500 border border-white/10'
                }`}
              >
                {step > s ? <Check className="w-3.5 h-3.5" /> : s}
              </div>
              {s < 5 && <div className={`w-8 sm:w-12 h-0.5 ${step > s ? 'bg-emerald-500/40' : 'bg-white/10'}`}></div>}
            </div>
          ))}
        </div>

        {/* Wizard Card */}
        <div className="rounded-2xl glass-panel p-6 sm:p-8 border space-y-6">
          {step === 1 && (
            <div className="text-center space-y-4 py-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white mx-auto shadow-xl">
                <Zap className="w-7 h-7 fill-white" />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Welcome to PostFlow AI</h2>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                Your end-to-end command center to craft, schedule, and auto-publish viral LinkedIn content that builds lasting organic authority.
              </p>
              <button
                onClick={() => setStep(2)}
                className="mt-4 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 transition inline-flex items-center gap-2"
              >
                <span>Continue Setup</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Select Your Primary Timezone</h3>
                  <p className="text-xs text-slate-400">Ensures your posts publish at peak local engagement hours.</p>
                </div>
              </div>

              <div className="pt-2">
                <input
                  type="text"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#060814] border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-white/10">
                <button
                  onClick={() => setStep(3)}
                  className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition flex items-center gap-2"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#0a66c2]/20 text-[#0a66c2]">
                  <Linkedin className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Connect Your LinkedIn Account</h3>
                  <p className="text-xs text-slate-400">Official OAuth 2.0 authorization with encryption.</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300 space-y-2">
                <p className="leading-relaxed">
                  PostFlow AI connects directly via official LinkedIn Community APIs. You can authenticate now or skip and connect later in settings.
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <button
                  onClick={() => setStep(4)}
                  className="text-xs text-slate-400 hover:text-white font-medium"
                >
                  Skip for now
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold shadow-md transition"
                >
                  Connect & Continue
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">What Are Your Core Content Goals?</h3>
                  <p className="text-xs text-slate-400">We will calibrate your AI prompts and templates accordingly.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                {goals.map((goal) => {
                  const isSelected = selectedGoals.includes(goal);
                  return (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => toggleGoal(goal)}
                      className={`p-3 rounded-xl border text-xs font-semibold text-left transition flex items-center justify-between ${
                        isSelected
                          ? 'bg-purple-600/20 border-purple-500/40 text-purple-300 shadow-sm'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>{goal}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-end pt-4 border-t border-white/10">
                <button
                  onClick={() => setStep(5)}
                  className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition flex items-center gap-2"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="text-center space-y-4 py-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                <Sparkles className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-white">You&apos;re All Set!</h2>
              <p className="text-xs text-slate-300 max-w-sm mx-auto">
                Your workspace is ready. Jump into your dashboard and schedule your first LinkedIn post.
              </p>
              <button
                onClick={handleFinish}
                className="mt-4 px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white text-xs font-bold shadow-lg shadow-blue-500/25 transition"
              >
                Enter Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
