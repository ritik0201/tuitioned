'use client';

import React, { useState } from 'react';
import { soundManager } from '@/lib/games/soundManager';
import { saveHighScore, unlockBadge } from '@/lib/games/badgeSystem';
import { ArrowLeft, RotateCcw, Volume2, VolumeX, Sparkles, Trophy, Type, HelpCircle } from 'lucide-react';

interface SpellingBeeProps {
  onBack: () => void;
}

interface WordChallenge {
  word: string;
  hint: string;
  category: string;
}

const WORDS_BANK: WordChallenge[] = [
  { word: 'PLANET', hint: 'A cosmic celestial body orbiting a star', category: 'Astronomy 🪐' },
  { word: 'ROCKET', hint: 'Vehicle engineered to travel into deep space', category: 'Science 🚀' },
  { word: 'GALAXY', hint: 'A massive system of millions or billions of stars', category: 'Cosmos 🌌' },
  { word: 'PYTHON', hint: 'A popular and friendly computer coding language', category: 'Tech 🐍' },
  { word: 'MAGNET', hint: 'Object that produces a magnetic field', category: 'Physics 🧲' },
  { word: 'ENERGY', hint: 'The capacity for doing work or powering things', category: 'Science ⚡' },
  { word: 'SYSTEM', hint: 'A set of connected things working together', category: 'Logic ⚙️' }
];

export default function SpellingBee({ onBack }: SpellingBeeProps) {
  const [wordIndex, setWordIndex] = useState(0);
  const [userLetters, setUserLetters] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const currentChallenge = WORDS_BANK[wordIndex % WORDS_BANK.length];
  const targetWord = currentChallenge.word;

  // Scramble letters
  const [scrambledLetters, setScrambledLetters] = useState<string[]>(() => 
    targetWord.split('').sort(() => Math.random() - 0.5)
  );

  const handleSelectLetter = (letter: string, idx: number) => {
    soundManager.playPop();
    soundManager.playTone(300 + userLetters.length * 40);

    const nextUserLetters = [...userLetters, letter];
    setUserLetters(nextUserLetters);

    const remaining = [...scrambledLetters];
    remaining.splice(idx, 1);
    setScrambledLetters(remaining);

    // Check if word complete
    if (nextUserLetters.length === targetWord.length) {
      const formedWord = nextUserLetters.join('');
      if (formedWord === targetWord) {
        soundManager.playCorrect();
        soundManager.playVictory();

        const newStreak = streak + 1;
        const newScore = score + 25 + newStreak * 5;
        setScore(newScore);
        setStreak(newStreak);

        saveHighScore('spelling_bee', newScore);
        if (newScore >= 100) {
          unlockBadge('spelling_bee');
        }

        setTimeout(() => {
          loadNextWord(newStreak);
        }, 800);
      } else {
        soundManager.playWrong();
        setStreak(0);
      }
    }
  };

  const loadNextWord = (currentStreak: number) => {
    const nextIdx = wordIndex + 1;
    setWordIndex(nextIdx);
    setUserLetters([]);
    const nextChallenge = WORDS_BANK[nextIdx % WORDS_BANK.length];
    setScrambledLetters(nextChallenge.word.split('').sort(() => Math.random() - 0.5));
  };

  const clearCurrent = () => {
    soundManager.playPop();
    setUserLetters([]);
    setScrambledLetters(targetWord.split('').sort(() => Math.random() - 0.5));
  };

  const toggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto bg-slate-900 rounded-none overflow-hidden border border-slate-800 text-white font-sans select-none shadow-xl">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-none bg-slate-800 hover:bg-slate-700 transition text-xs font-black cursor-pointer border border-slate-700"
          >
            <ArrowLeft className="w-4 h-4" /> HUB
          </button>
          <div className="flex items-center gap-2 bg-amber-950 border border-amber-600 px-3 py-1 rounded-none">
            <Type className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-black uppercase text-amber-300">Cyber Spelling Bee</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center">
            <span className="text-[10px] text-slate-500 uppercase font-black block">Streak</span>
            <span className="text-lg font-black text-emerald-400">🔥 {streak}</span>
          </div>

          <div className="text-center">
            <span className="text-[10px] text-slate-500 uppercase font-black block">Score</span>
            <span className="text-lg font-black text-amber-400">{score}</span>
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
        {/* Hint Box */}
        <div className="w-full max-w-xl bg-slate-900 border border-amber-500/40 rounded-none p-5 text-center shadow-lg space-y-2">
          <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase text-amber-400">
            <HelpCircle className="w-4 h-4" />
            <span>Category: {currentChallenge.category}</span>
          </div>
          <p className="text-sm font-bold text-slate-200">{currentChallenge.hint}</p>
        </div>

        {/* Word Display Boxes */}
        <div className="flex items-center justify-center gap-3 my-6">
          {Array.from({ length: targetWord.length }).map((_, idx) => {
            const char = userLetters[idx];
            return (
              <div
                key={idx}
                className={`w-12 h-14 rounded-none border-2 flex items-center justify-center text-2xl font-black transition-all ${
                  char ? 'border-amber-400 bg-amber-950/60 text-amber-300 shadow-md' : 'border-slate-800 bg-slate-900 text-transparent'
                }`}
              >
                {char || '_'}
              </div>
            );
          })}
        </div>

        {/* Scrambled Letter Tiles */}
        <div className="flex flex-wrap justify-center gap-3 max-w-md w-full">
          {scrambledLetters.map((char, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectLetter(char, idx)}
              className="w-12 h-12 rounded-none bg-amber-600 hover:bg-amber-500 active:scale-95 text-white font-black text-xl border border-amber-300 shadow-md cursor-pointer transition transform hover:-translate-y-1"
            >
              {char}
            </button>
          ))}
        </div>

        {/* Control Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={clearCurrent}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 font-black text-xs text-slate-300 uppercase rounded-none cursor-pointer"
          >
            RESET WORD
          </button>
        </div>
      </div>
    </div>
  );
}
