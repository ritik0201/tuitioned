'use client';

import React from 'react';
import { Badge } from '@/lib/games/types';
import { X, Trophy, Lock, CheckCircle2 } from 'lucide-react';

interface BadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  badges: Badge[];
}

export default function BadgeModal({ isOpen, onClose, badges }: BadgeModalProps) {
  if (!isOpen) return null;

  const unlockedCount = badges.filter(b => b.unlocked).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-none p-6 shadow-2xl text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-none bg-purple-950 border border-purple-600 flex items-center justify-center text-purple-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-wider uppercase text-white">BADGES ({unlockedCount}/{badges.length})</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[55vh] overflow-y-auto pr-1">
          {badges.map(badge => (
            <div
              key={badge.id}
              className={`flex items-center gap-3 p-3 rounded-none border transition ${
                badge.unlocked
                  ? 'bg-slate-950 border-purple-500/50'
                  : 'bg-slate-950/40 border-slate-800 opacity-50'
              }`}
            >
              <div className="w-12 h-12 rounded-none bg-slate-900 border border-slate-700 flex items-center justify-center text-2xl shrink-0">
                {badge.unlocked ? badge.icon : <Lock className="w-5 h-5 text-slate-600" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <h4 className="font-extrabold text-xs text-white truncate">{badge.title}</h4>
                  {badge.unlocked && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                </div>
                <p className="text-[11px] text-slate-400 leading-tight line-clamp-2">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-800 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-purple-600 border border-purple-400 font-black text-xs uppercase tracking-wider text-white shadow-md cursor-pointer hover:bg-purple-500"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
