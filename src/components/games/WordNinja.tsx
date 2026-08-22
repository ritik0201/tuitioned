'use client';

import React, { useEffect, useState } from 'react';
import { soundManager } from '@/lib/games/soundManager';
import { saveHighScore, unlockBadge } from '@/lib/games/badgeSystem';
import { ArrowLeft, RotateCcw, Volume2, VolumeX, Sparkles, Trophy, RefreshCw } from 'lucide-react';

interface WordNinjaProps {
  onBack: () => void;
}

interface WordDefinition {
  word: string;
  hint: string;
  category: string;
}

const MASTER_WORD_BANK: WordDefinition[] = [
  { word: 'CAT', hint: 'A friendly furry pet 🐱', category: 'Animals' },
  { word: 'LION', hint: 'King of the jungle 🦁', category: 'Animals' },
  { word: 'BEAR', hint: 'Loves eating honey 🐻', category: 'Animals' },
  { word: 'STAR', hint: 'Shines bright in the night sky 🌟', category: 'Space' },
  { word: 'MOON', hint: 'Orbits planet Earth 🌙', category: 'Space' },
  { word: 'COMET', hint: 'Shooting star with a tail ☄️', category: 'Space' },
  { word: 'BRAIN', hint: 'Helps you think and learn 🧠', category: 'Science' },
  { word: 'LIGHT', hint: 'Fills dark room with brightness 💡', category: 'Science' },
  { word: 'MAGIC', hint: 'Full of wonder and spells ✨', category: 'Wonder' },
  { word: 'PLANET', hint: 'Earth is our home 🌍', category: 'Space' },
  { word: 'SMART', hint: 'Super intelligent 🎓', category: 'General' },
  { word: 'SUNNY', hint: 'Warm and full of light ☀️', category: 'Nature' },
  { word: 'OCEAN', hint: 'Vast blue body of water 🌊', category: 'Nature' },
  { word: 'FOREST', hint: 'Full of green trees 🌲', category: 'Nature' },
  { word: 'NINJA', hint: 'Stealthy martial artist 🥷', category: 'Action' }
];

export default function WordNinja({ onBack }: WordNinjaProps) {
  const [wordList, setWordList] = useState<WordDefinition[]>([]);
  const [wordIndex, setWordIndex] = useState(0);
  const [currentLetters, setCurrentLetters] = useState<string[]>([]);
  const [letterPool, setLetterPool] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [wordsCompleted, setWordsCompleted] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  const [isMuted, setIsMuted] = useState(false);

  // Generate randomized word sequence
  const initGameSession = () => {
    const shuffled = [...MASTER_WORD_BANK].sort(() => Math.random() - 0.5);
    setWordList(shuffled);
    setWordIndex(0);
    setScore(0);
    setWordsCompleted(0);
    setStreak(0);
    setTimeLeft(45);
    setGameOver(false);
    setupWord(0, shuffled);
  };

  const setupWord = (index: number, list: WordDefinition[] = wordList) => {
    if (list.length === 0) return;
    const targetObj = list[index % list.length];
    const targetLetters = targetObj.word.split('');
    setCurrentLetters([]);

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const distractorCount = Math.max(3, 8 - targetLetters.length);
    const distractors: string[] = [];

    while (distractors.length < distractorCount) {
      const char = alphabet[Math.floor(Math.random() * alphabet.length)];
      if (!targetLetters.includes(char)) distractors.push(char);
    }

    const pool = [...targetLetters, ...distractors].sort(() => Math.random() - 0.5);
    setLetterPool(pool);
  };

  useEffect(() => {
    initGameSession();
  }, []);

  // Timer
  useEffect(() => {
    if (gameOver) return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timer);
          finishGame();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameOver]);

  const currentWordObj = wordList[wordIndex % (wordList.length || 1)] || MASTER_WORD_BANK[0];

  const handleLetterClick = (letter: string, poolIndex: number) => {
    if (gameOver || !currentWordObj) return;

    const targetWord = currentWordObj.word;
    const neededIndex = currentLetters.length;
    const expectedLetter = targetWord[neededIndex];

    if (letter === expectedLetter) {
      soundManager.playPop();
      soundManager.playCorrect();

      const newLetters = [...currentLetters, letter];
      setCurrentLetters(newLetters);

      setLetterPool(prev => prev.filter((_, idx) => idx !== poolIndex));

      if (newLetters.length === targetWord.length) {
        const points = 30 + streak * 5;
        const newScore = score + points;
        const newCompleted = wordsCompleted + 1;
        const newStreak = streak + 1;

        setScore(newScore);
        setWordsCompleted(newCompleted);
        setStreak(newStreak);

        if (newCompleted >= 5) {
          unlockBadge('word_ninja');
        }

        setTimeout(() => {
          const nextIndex = wordIndex + 1;
          setWordIndex(nextIndex);
          setupWord(nextIndex, wordList);
        }, 500);
      }
    } else {
      soundManager.playWrong();
      setStreak(0);
    }
  };

  const finishGame = () => {
    setGameOver(true);
    soundManager.playVictory();
    saveHighScore('word_ninja', score);
    if (wordsCompleted >= 5) {
      unlockBadge('word_ninja');
    }
  };

  const toggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 text-white font-sans select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-800/80 backdrop-blur-md border-b border-slate-700">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 transition text-sm font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Hub
          </button>
          <div className="flex items-center gap-2 bg-amber-900/40 border border-amber-500/30 px-3 py-1 rounded-xl">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-bold text-amber-200">Word Ninja</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={initGameSession}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600/60 hover:bg-amber-500 text-xs font-bold text-amber-200 border border-amber-400/30 transition cursor-pointer"
            title="Generate Random Word Bank"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Randomize Words
          </button>

          <div className="text-center">
            <span className="text-xs text-slate-400 block uppercase tracking-wider">Score</span>
            <span className="text-xl font-extrabold text-amber-400">{score}</span>
          </div>

          <div className="text-center min-w-[60px]">
            <span className="text-xs text-slate-400 block uppercase tracking-wider">Time</span>
            <span className={`text-xl font-extrabold ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-cyan-400'}`}>
              {timeLeft}s
            </span>
          </div>

          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 transition cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Game Stage */}
      <div className="relative min-h-[380px] sm:min-h-[420px] p-4 sm:p-6 flex flex-col items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-amber-950 overflow-hidden">
        {!gameOver && currentWordObj ? (
          <div className="w-full max-w-xl flex flex-col items-center gap-8">
            <div className="bg-slate-800/90 border border-amber-500/40 rounded-2xl p-6 text-center shadow-xl w-full">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-2">
                [{currentWordObj.category}] {currentWordObj.hint}:
              </span>
              <div className="flex justify-center gap-3">
                {currentWordObj.word.split('').map((char, idx) => {
                  const filled = currentLetters[idx];
                  return (
                    <div
                      key={idx}
                      className={`w-12 h-14 rounded-xl flex items-center justify-center font-black text-2xl border-2 transition-all ${
                        filled
                          ? 'bg-emerald-500 border-emerald-300 text-white shadow-lg scale-105'
                          : 'bg-slate-900 border-slate-700 text-slate-500'
                      }`}
                    >
                      {filled || '_'}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 w-full py-4">
              {letterPool.map((char, idx) => (
                <button
                  key={`${char}-${idx}`}
                  onClick={() => handleLetterClick(char, idx)}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-2xl shadow-xl transform transition-transform hover:scale-110 active:scale-95 border-2 border-white/40 cursor-pointer flex items-center justify-center"
                >
                  {char}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-slate-800/95 border border-slate-700 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl backdrop-blur-lg animate-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-500/40">
              <Trophy className="w-8 h-8" />
            </div>

            <h3 className="text-3xl font-extrabold text-white mb-2">Word Ninja Complete!</h3>
            <p className="text-slate-400 text-sm mb-6">You spelled {wordsCompleted} words!</p>

            <div className="flex gap-4">
              <button
                onClick={initGameSession}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 font-bold text-white shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-5 h-5" /> Play New Word Challenge
              </button>
              <button
                onClick={onBack}
                className="px-5 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 font-bold text-slate-200 transition cursor-pointer"
              >
                Hub
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
