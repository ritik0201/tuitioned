'use client';

import React from 'react';
import { GameConfig } from '@/lib/games/types';
import { X, HelpCircle, Target, Sparkles, Trophy, BookOpen } from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  game: GameConfig | null;
  onClose: () => void;
}

export default function HowToPlayModal({ isOpen, game, onClose }: HowToPlayModalProps) {
  if (!isOpen || !game) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-none shadow-2xl p-6 text-white font-sans overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-none ${game.gradient} flex items-center justify-center text-3xl border border-white/20 shadow-md`}>
              {game.icon}
            </div>
            <div>
              <h2 className="text-xl font-black text-white">{game.title}</h2>
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">{game.subtitle}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-none bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer border border-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
          {/* Quick Info Badges */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-slate-950 border border-slate-800 rounded-none">
              <span className="text-[10px] text-slate-500 font-black uppercase block">Category</span>
              <span className="text-xs font-black text-indigo-400 uppercase">{game.category}</span>
            </div>
            <div className="p-2 bg-slate-950 border border-slate-800 rounded-none">
              <span className="text-[10px] text-slate-500 font-black uppercase block">Age Range</span>
              <span className="text-xs font-black text-amber-400">{game.ageRange} Yrs</span>
            </div>
            <div className="p-2 bg-slate-950 border border-slate-800 rounded-none">
              <span className="text-[10px] text-slate-500 font-black uppercase block">Difficulty</span>
              <span className="text-xs font-black text-emerald-400">{game.difficulty}</span>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase text-slate-300 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-indigo-400" /> Step-by-Step Rules
            </h3>
            <div className="bg-slate-950 border border-slate-800 p-4 space-y-2.5">
              {game.instructions.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs font-bold text-slate-300 leading-relaxed">
                  <span className="w-5 h-5 bg-indigo-950 text-indigo-400 border border-indigo-500/50 flex items-center justify-center text-[10px] font-black shrink-0">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Skills Learned */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase text-slate-300 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-purple-400" /> Skills Learned
            </h3>
            <div className="flex flex-wrap gap-2">
              {game.skillsLearned.map((skill, idx) => (
                <span key={idx} className="px-3 py-1 bg-purple-950 text-purple-300 border border-purple-500/40 text-xs font-black uppercase">
                  ✨ {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Trophy Challenge */}
          <div className="p-3.5 bg-amber-950/40 border border-amber-500/40 flex items-center gap-3">
            <Trophy className="w-6 h-6 text-amber-400 shrink-0" />
            <div>
              <span className="text-[10px] font-black uppercase text-amber-400 block">Trophy Goal</span>
              <p className="text-xs font-bold text-amber-200">Play to earn points & unlock achievement badges for your trophy case!</p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-none border border-indigo-400 cursor-pointer shadow-md"
          >
            GOT IT! LET'S PLAY 🚀
          </button>
        </div>
      </div>
    </div>
  );
}
