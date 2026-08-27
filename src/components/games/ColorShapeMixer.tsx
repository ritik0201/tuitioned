'use client';

import React, { useState } from 'react';
import { soundManager } from '@/lib/games/soundManager';
import { saveHighScore, unlockBadge } from '@/lib/games/badgeSystem';
import { ArrowLeft, Volume2, VolumeX, Sparkles, Music } from 'lucide-react';

interface ColorShapeMixerProps {
  onBack: () => void;
}

interface ShapeItem {
  id: string;
  type: 'circle' | 'square' | 'triangle' | 'star';
  color: string;
  name: string;
  frequency: number;
}

type DifficultyMode = 'easy' | 'medium' | 'high';

const SHAPES: ShapeItem[] = [
  { id: '1', type: 'circle', color: '#FF597B', name: 'Ruby Circle (C5)', frequency: 523.25 },
  { id: '2', type: 'square', color: '#4E65FF', name: 'Sapphire Square (D5)', frequency: 587.33 },
  { id: '3', type: 'triangle', color: '#38EF7D', name: 'Emerald Triangle (E5)', frequency: 659.25 },
  { id: '4', type: 'star', color: '#FF9F43', name: 'Golden Star (G5)', frequency: 783.99 },
  { id: '5', type: 'circle', color: '#A55EEA', name: 'Amethyst Orb (A5)', frequency: 880.00 },
  { id: '6', type: 'square', color: '#00CEC9', name: 'Cyan Prism (B5)', frequency: 987.77 },
  { id: '7', type: 'star', color: '#FD79A8', name: 'Starlight Core (C6)', frequency: 1046.50 }
];

export default function ColorShapeMixer({ onBack }: ColorShapeMixerProps) {
  const [diffMode, setDiffMode] = useState<DifficultyMode>('easy');
  const [activeCombo, setActiveCombo] = useState<ShapeItem[]>([]);
  const [comboCount, setComboCount] = useState(0);
  const [score, setScore] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const availableShapes = diffMode === 'easy' ? SHAPES.slice(0, 3) : diffMode === 'medium' ? SHAPES.slice(0, 5) : SHAPES;

  const changeDifficulty = (mode: DifficultyMode) => {
    soundManager.playPop();
    setDiffMode(mode);
    setActiveCombo([]);
  };

  const handleShapeClick = (shape: ShapeItem) => {
    soundManager.playTone(shape.frequency);
    const newCombo = [...activeCombo, shape];
    setActiveCombo(newCombo);
    const newCount = comboCount + 1;
    setComboCount(newCount);
    const points = diffMode === 'easy' ? 10 : diffMode === 'medium' ? 15 : 25;
    const newScore = score + points;
    setScore(newScore);

    saveHighScore('shape_mixer', newScore);
    if (newCount >= 10) {
      unlockBadge('color_maestro');
    }
  };

  const playFullMelody = () => {
    if (activeCombo.length === 0) return;
    activeCombo.forEach((shape, index) => {
      setTimeout(() => {
        soundManager.playTone(shape.frequency);
      }, index * 250);
    });
  };

  const clearCanvas = () => {
    setActiveCombo([]);
  };

  const toggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto bg-slate-900 rounded-none overflow-hidden border border-slate-800 text-white font-sans select-none shadow-xl">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-none bg-slate-800 hover:bg-slate-700 transition text-xs font-black cursor-pointer border border-slate-700"
          >
            <ArrowLeft className="w-4 h-4" /> HUB
          </button>
          <div className="flex items-center gap-2 bg-pink-950 border border-pink-600 px-3 py-1 rounded-none">
            <Sparkles className="w-4 h-4 text-pink-400" />
            <span className="text-xs font-black uppercase text-pink-300">Shape Synth Lab</span>
          </div>

          <div className="flex items-center bg-slate-900 border border-slate-800 p-0.5 rounded-none">
            {(['easy', 'medium', 'high'] as DifficultyMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => changeDifficulty(mode)}
                className={`px-2 py-1 text-[10px] font-black uppercase tracking-wider transition cursor-pointer ${
                  diffMode === mode
                    ? mode === 'easy'
                      ? 'bg-emerald-600 text-white'
                      : mode === 'medium'
                      ? 'bg-pink-600 text-white'
                      : 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center">
            <span className="text-[10px] text-slate-500 uppercase font-black block">Score</span>
            <span className="text-lg font-black text-pink-400">{score}</span>
          </div>

          <button
            onClick={toggleSound}
            className="p-1.5 rounded-none bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Stage */}
      <div className="relative min-h-[380px] sm:min-h-[420px] p-4 sm:p-5 flex flex-col items-center justify-between bg-slate-950">
        <div className="flex items-center justify-center gap-2 min-h-[80px] w-full flex-wrap py-2">
          {activeCombo.length === 0 ? (
            <span className="text-slate-600 text-xs font-bold uppercase tracking-wider">Tap shapes to compose tunes!</span>
          ) : (
            activeCombo.slice(-10).map((item, idx) => (
              <div
                key={idx}
                style={{ backgroundColor: item.color }}
                className="w-10 h-10 rounded-none border border-white/40 flex items-center justify-center text-xs font-black text-white"
              >
                ♪
              </div>
            ))
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-4 w-full max-w-xl">
          {availableShapes.map(shape => (
            <button
              key={shape.id}
              onClick={() => handleShapeClick(shape)}
              style={{ backgroundColor: shape.color }}
              className="h-24 rounded-none flex flex-col items-center justify-center gap-1 shadow-md border-2 border-white/30 transition transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span className="text-2xl">
                {shape.type === 'circle' && '🔴'}
                {shape.type === 'square' && '🟦'}
                {shape.type === 'triangle' && '🔺'}
                {shape.type === 'star' && '⭐'}
              </span>
              <span className="text-[10px] font-black text-white uppercase">{shape.type}</span>
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={playFullMelody}
            disabled={activeCombo.length === 0}
            className="px-5 py-2 rounded-none bg-pink-600 hover:bg-pink-500 border border-pink-400 font-black text-xs text-white uppercase tracking-wider cursor-pointer disabled:opacity-50"
          >
            PLAY MELODY ♪
          </button>
          <button
            onClick={clearCanvas}
            className="px-5 py-2 rounded-none bg-slate-800 hover:bg-slate-700 border border-slate-700 font-black text-xs text-slate-300 uppercase cursor-pointer"
          >
            CLEAR
          </button>
        </div>
      </div>
    </div>
  );
}
