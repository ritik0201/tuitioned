'use client';

import React from 'react';
import { GameConfig } from '@/lib/games/types';
import { Play, Trophy, HelpCircle } from 'lucide-react';

interface GameCardProps {
  game: GameConfig;
  highScore: number;
  onPlay: (gameId: string) => void;
  onHowToPlay: (game: GameConfig) => void;
}

export default function GameCard({ game, highScore, onPlay, onHowToPlay }: GameCardProps) {
  return (
    <div className="relative group rounded-none p-6 bg-slate-900 border border-slate-800 hover:border-indigo-500 transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-lg">
      {/* Background Subtle Glow */}
      <div className={`absolute top-0 right-0 w-32 h-32 blur-2xl opacity-15 pointer-events-none ${game.bgGlow}`} />

      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-none bg-slate-800 text-indigo-400 border border-slate-700">
            {game.category}
          </span>

          <div className="flex items-center gap-1 text-amber-400 bg-amber-950/50 border border-amber-500/40 px-2.5 py-0.5 rounded-none text-xs font-black">
            <Trophy className="w-3.5 h-3.5" /> {highScore}
          </div>
        </div>

        {/* Big Visual Icon & Title */}
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-16 h-16 rounded-none ${game.gradient} flex items-center justify-center text-4xl shadow-md border border-white/20 shrink-0 transform group-hover:scale-105 transition`}>
            {game.icon}
          </div>
          <div>
            <h3 className="text-lg font-black text-white group-hover:text-indigo-400 transition leading-tight">
              {game.title}
            </h3>
            <span className="text-xs font-bold text-slate-400 block mt-0.5">{game.subtitle}</span>
          </div>
        </div>
      </div>

      {/* Sharp Action Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 mt-2 gap-2">
        <button
          onClick={() => onHowToPlay(game)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-none bg-slate-800 hover:bg-slate-700 font-black text-xs text-slate-300 transition cursor-pointer border border-slate-700"
        >
          <HelpCircle className="w-3.5 h-3.5 text-cyan-400" /> HOW TO PLAY
        </button>

        <button
          onClick={() => onPlay(game.id)}
          className={`flex items-center gap-2 px-5 py-2 rounded-none ${game.gradient} hover:brightness-110 font-black text-xs text-white shadow-md transition cursor-pointer border border-white/20 active:scale-95`}
        >
          <Play className="w-3.5 h-3.5 fill-white" /> PLAY
        </button>
      </div>
    </div>
  );
}
