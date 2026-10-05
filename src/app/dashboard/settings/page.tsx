'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  User,
  Clock,
  Sparkles,
  Bell,
  Shield,
  Save,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    timezone: 'UTC',
    avatarUrl: '',
    password: '',
    defaultPostingTime: '09:00',
    defaultTone: 'Professional',
    defaultAudience: 'General LinkedIn Audience',
    defaultLength: 'Medium',
    notifyOnSuccess: true,
    notifyOnFailure: true,
    notifyOnReminder: true,
  });

  const timezones = [
    'UTC',
    'America/New_York',
    'America/Los_Angeles',
    'America/Chicago',
    'Europe/London',
    'Europe/Paris',
    'Asia/Dubai',
    'Asia/Karachi',
    'Asia/Singapore',
    'Asia/Tokyo',
  ];

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          const u = data.user || {};
          const s = data.settings || {};

          setFormData({
            name: u.name || '',
            email: u.email || '',
            timezone: u.timezone || 'UTC',
            avatarUrl: u.avatarUrl || '',
            password: '',
            defaultPostingTime: s.defaultPostingTime || '09:00',
            defaultTone: s.defaultTone || 'Professional',
            defaultAudience: s.defaultAudience || 'General LinkedIn Audience',
            defaultLength: s.defaultLength || 'Medium',
            notifyOnSuccess: s.notifyOnSuccess ?? true,
            notifyOnFailure: s.notifyOnFailure ?? true,
            notifyOnReminder: s.notifyOnReminder ?? true,
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(false);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSuccessMsg(true);
        setTimeout(() => setSuccessMsg(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-400" />
            <span>Settings & Preferences</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure your profile, default posting timezones, AI style models, and alert rules.
          </p>
        </div>

        {successMsg && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings saved successfully!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Section */}
        <div className="rounded-2xl glass-panel p-6 border space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-4 h-4 text-blue-400" />
            <span>Profile & Account</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={formData.email}
                className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Primary Timezone</label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#0d1226] border border-white/10 text-white focus:outline-none focus:border-blue-500"
              >
                {timezones.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Avatar Image URL</label>
              <input
                type="url"
                value={formData.avatarUrl}
                onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Content & AI Defaults */}
        <div className="rounded-2xl glass-panel p-6 border space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Publishing & AI Defaults</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Default Posting Time</label>
              <input
                type="time"
                value={formData.defaultPostingTime}
                onChange={(e) => setFormData({ ...formData, defaultPostingTime: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Default AI Tone</label>
              <select
                value={formData.defaultTone}
                onChange={(e) => setFormData({ ...formData, defaultTone: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-[#0d1226] border border-white/10 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Professional">Professional</option>
                <option value="Conversational">Conversational</option>
                <option value="Expert">Expert</option>
                <option value="Friendly">Friendly</option>
                <option value="Storytelling">Storytelling</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="rounded-2xl glass-panel p-6 border space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Bell className="w-4 h-4 text-cyan-400" />
            <span>Notification Alerts</span>
          </h3>

          <div className="space-y-3 text-xs">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.notifyOnSuccess}
                onChange={(e) => setFormData({ ...formData, notifyOnSuccess: e.target.checked })}
                className="rounded border-white/20 bg-white/5 text-blue-600 focus:ring-0 w-4 h-4"
              />
              <span className="text-slate-200">Notify on successful LinkedIn post publishing</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.notifyOnFailure}
                onChange={(e) => setFormData({ ...formData, notifyOnFailure: e.target.checked })}
                className="rounded border-white/20 bg-white/5 text-blue-600 focus:ring-0 w-4 h-4"
              />
              <span className="text-slate-200">Notify on publishing failures or required token renewals</span>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 transition disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
}
