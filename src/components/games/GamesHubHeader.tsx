'use client';

import React from 'react';
import { UserStats } from '@/lib/games/types';
import { Volume2, VolumeX, Star, Trophy, Gamepad2, Sparkles } from 'lucide-react';

interface GamesHubHeaderProps {
  stats: UserStats;
  onOpenBadges: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export default function GamesHubHeader({
  stats,
  onOpenBadges,
  isMuted,
  onToggleMute
}: GamesHubHeaderProps) {
  return (
    <header className="w-full bg-slate-900 border-b border-slate-800 sticky top-0 z-40 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-none bg-indigo-600 flex items-center justify-center text-white border border-indigo-400">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-wider uppercase flex items-center gap-2">
              KIDS ARCADE <Sparkles className="w-4 h-4 text-amber-400" />
            </h1>
          </div>
        </div>

        {/* Sharp Stats & Controls */}
        <div className="flex items-center gap-3">
          {/* Star Counter */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3.5 py-1.5 rounded-none text-xs font-black text-amber-400">
            <Star className="w-4 h-4 fill-amber-400" /> {stats.totalStars}
          </div>

          {/* Badges */}
          <button
            onClick={onOpenBadges}
            className="flex items-center gap-1.5 bg-indigo-950 border border-indigo-600/60 hover:border-indigo-400 px-3.5 py-1.5 rounded-none text-xs font-black text-indigo-300 transition cursor-pointer"
          >
            <Trophy className="w-4 h-4 text-purple-400" /> {stats.badgesUnlocked} BADGES
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleMute}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-black transition cursor-pointer"
          >
            {isMuted ? (
              <span className="text-red-400 flex items-center gap-1"><VolumeX className="w-4 h-4" /> MUTED</span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1"><Volume2 className="w-4 h-4" /> SOUND ON</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
