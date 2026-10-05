import React, { useState } from 'react';
import {
  Globe,
  MoreHorizontal,
  ThumbsUp,
  MessageSquare,
  Repeat2,
  Send,
  Heart,
  Lightbulb,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LinkedInPreviewProps {
  authorName?: string;
  authorHeadline?: string;
  authorAvatar?: string | null;
  content: string;
  imageUrl?: string | null;
  className?: string;
}

export function LinkedInPreview({
  authorName = 'Alex Rivera',
  authorHeadline = 'Head of Growth & Content Strategy | LinkedIn Creator',
  authorAvatar,
  content,
  imageUrl,
  className,
}: LinkedInPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [liked, setLiked] = useState(false);

  const defaultAvatar =
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

  // Format content with bold hashtag styling
  const renderFormattedText = (text: string) => {
    if (!text) {
      return (
        <span className="text-slate-500 italic">
          Your LinkedIn post content will appear here in real time...
        </span>
      );
    }

    const trimmed = isExpanded ? text : text.slice(0, 220);
    const shouldShowSeeMore = !isExpanded && text.length > 220;

    // Highlight hashtags in blue
    const parts = trimmed.split(/(#[a-zA-Z0-9_]+)/g);

    return (
      <>
        <div className="whitespace-pre-wrap leading-relaxed text-[14px] text-slate-100 font-normal">
          {parts.map((part, i) => {
            if (part.startsWith('#')) {
              return (
                <span key={i} className="text-[#70b5f9] hover:underline cursor-pointer font-medium">
                  {part}
                </span>
              );
            }
            return <span key={i}>{part}</span>;
          })}
          {shouldShowSeeMore && (
            <button
              onClick={() => setIsExpanded(true)}
              className="text-slate-400 hover:text-white ml-1 font-semibold hover:underline"
            >
              ...see more
            </button>
          )}
        </div>
      </>
    );
  };

  return (
    <div
      className={cn(
        'w-full max-w-[550px] mx-auto rounded-xl border border-slate-800 bg-[#1b1f23] text-slate-100 shadow-2xl overflow-hidden',
        className
      )}
    >
      {/* Header banner / badge */}
      <div className="bg-slate-900/90 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1.5 font-medium text-slate-300">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          Live LinkedIn Post Preview
        </span>
        <span className="text-[11px] text-slate-500">Desktop & Mobile View</span>
      </div>

      {/* Author Section */}
      <div className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={authorAvatar || defaultAvatar}
              alt={authorName}
              className="w-12 h-12 rounded-full object-cover border border-slate-700"
            />
            <div>
              <div className="flex items-center gap-1">
                <h4 className="font-semibold text-white text-sm hover:underline cursor-pointer">
                  {authorName}
                </h4>
                <span className="text-xs text-slate-400">• 1st</span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-1 max-w-[340px]">
                {authorHeadline}
              </p>
              <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                <span>Just now</span>
                <span>•</span>
                <Globe className="w-3 h-3" />
              </div>
            </div>
          </div>
          <button className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-3">{renderFormattedText(content)}</div>
      </div>

      {/* Optional Media Image */}
      {imageUrl && (
        <div className="mt-2 border-y border-slate-800 bg-black/40 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Attached Post Media"
            className="w-full max-h-[380px] object-cover object-center"
          />
        </div>
      )}

      {/* Reactions count bar */}
      <div className="px-4 py-2.5 flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 mt-1">
        <div className="flex items-center gap-1.5">
          <div className="flex -space-x-1 items-center">
            <span className="w-4 h-4 rounded-full bg-[#378fe9] flex items-center justify-center text-white text-[9px] shadow-sm">
              <ThumbsUp className="w-2.5 h-2.5" />
            </span>
            <span className="w-4 h-4 rounded-full bg-[#df704d] flex items-center justify-center text-white text-[9px] shadow-sm">
              <Heart className="w-2.5 h-2.5" />
            </span>
            <span className="w-4 h-4 rounded-full bg-[#ebbb35] flex items-center justify-center text-white text-[9px] shadow-sm">
              <Lightbulb className="w-2.5 h-2.5" />
            </span>
          </div>
          <span className="hover:text-blue-400 hover:underline cursor-pointer ml-1">
            {liked ? 'Alex Rivera and 42 others' : '42'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hover:text-blue-400 hover:underline cursor-pointer">12 comments</span>
          <span>•</span>
          <span className="hover:text-blue-400 hover:underline cursor-pointer">4 reposts</span>
        </div>
      </div>

      {/* Interactive visual buttons bar */}
      <div className="px-2 py-1 flex items-center justify-between text-xs font-semibold text-slate-300">
        <button
          onClick={() => setLiked(!liked)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-slate-800/80 transition flex-1 justify-center',
            liked ? 'text-[#70b5f9]' : 'text-slate-300'
          )}
        >
          <ThumbsUp className={cn('w-4 h-4', liked && 'fill-current')} />
          <span>Like</span>
        </button>

        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-slate-800/80 transition flex-1 justify-center text-slate-300">
          <MessageSquare className="w-4 h-4" />
          <span>Comment</span>
        </button>

        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-slate-800/80 transition flex-1 justify-center text-slate-300">
          <Repeat2 className="w-4 h-4" />
          <span>Repost</span>
        </button>

        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-slate-800/80 transition flex-1 justify-center text-slate-300">
          <Send className="w-4 h-4" />
          <span>Send</span>
        </button>
      </div>
    </div>
  );
}
