'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  LogOut,
  Shield,
  Key,
  ExternalLink,
  Info,
  Check,
} from 'lucide-react';
import { Linkedin } from '@/components/icons/LinkedInIcon';
import { formatDate } from '@/lib/utils';

export default function LinkedInAccountPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading LinkedIn settings...</div>}>
      <LinkedInAccountContent />
    </Suspense>
  );
}

function LinkedInAccountContent() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');
  const connectedParam = searchParams.get('connected');

  const [account, setAccount] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/linkedin/profile');
      if (res.ok) {
        const data = await res.json();
        setAccount(data.account || null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleConnect = async () => {
    try {
      const res = await fetch('/api/linkedin/connect');
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect your LinkedIn account? Scheduled posts will be paused.')) return;
    setDisconnecting(true);
    try {
      const res = await fetch('/api/linkedin/disconnect', { method: 'POST' });
      if (res.ok) {
        await loadProfile();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Linkedin className="w-6 h-6 text-[#0a66c2] fill-current" />
            <span>LinkedIn Account Integration</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your official OAuth 2.0 connection for automated post publishing.
          </p>
        </div>
      </div>

      {/* URL Banner Notices */}
      {connectedParam && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-xs text-emerald-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Your LinkedIn account has been successfully authenticated and connected!</span>
        </div>
      )}

      {errorParam && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-xs text-rose-300">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <div>
            <span className="font-bold">OAuth Error:</span> {errorParam}
          </div>
        </div>
      )}

      {/* Main Connection Card */}
      <div className="rounded-2xl glass-panel p-6 border space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#0a66c2]/10 border border-[#0a66c2]/30 flex items-center justify-center text-[#0a66c2]">
              <Linkedin className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">LinkedIn Profile</h3>
              <p className="text-xs text-slate-400">Official OAuth 2.0 Community Management API</p>
            </div>
          </div>

          <span
            className={`text-xs font-bold px-3 py-1 rounded-full border ${
              account
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}
          >
            {account ? 'CONNECTED' : 'DISCONNECTED'}
          </span>
        </div>

        {account ? (
          <div className="space-y-6">
            {/* Account Details */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={account.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt="LinkedIn User"
                  className="w-14 h-14 rounded-full border-2 border-blue-500/40 object-cover"
                />
                <div>
                  <h4 className="font-bold text-white text-base">{account.displayName}</h4>
                  <p className="text-xs text-slate-400">{account.headline || 'LinkedIn Creator'}</p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Member ID: {account.providerAccountId}
                  </p>
                </div>
              </div>

              {account.profileUrl && (
                <a
                  href={account.profileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium border border-white/10 flex items-center gap-1.5 transition self-start sm:self-center"
                >
                  <span>View Profile</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Scope Permissions List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Authorized LinkedIn Permissions</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white">w_member_social</span>
                    <p className="text-slate-400 text-[11px]">Publish UGC posts and media directly to your personal feed.</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white">openid & profile</span>
                    <p className="text-slate-400 text-[11px]">Retrieve name and profile avatar for accurate in-app previews.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <Key className="w-3.5 h-3.5 text-purple-400" />
                <span>AES-256 Encrypted Token Storage</span>
              </div>
              <p className="text-slate-300">
                Your LinkedIn OAuth tokens are encrypted with military-grade AES-256-GCM. Client secrets and raw access tokens are never exposed to the frontend.
              </p>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={handleConnect}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-semibold border border-blue-500/30 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reconnect / Refresh Token</span>
              </button>

              <button
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold border border-rose-500/30 transition disabled:opacity-50"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect LinkedIn</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#0a66c2]/10 border border-[#0a66c2]/20 text-[#0a66c2] flex items-center justify-center mx-auto">
              <Linkedin className="w-8 h-8 fill-current" />
            </div>

            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base font-bold text-white">No LinkedIn Account Connected</h3>
              <p className="text-xs text-slate-400">
                Connect your account via official LinkedIn OAuth 2.0 to begin scheduling and auto-publishing posts.
              </p>
            </div>

            <button
              onClick={handleConnect}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0a66c2] hover:bg-[#004182] text-white text-xs font-bold shadow-lg shadow-[#0a66c2]/25 transition transform active:scale-95"
            >
              <Linkedin className="w-4 h-4 fill-current" />
              <span>Connect LinkedIn Account</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
