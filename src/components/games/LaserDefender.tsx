'use client';

import React, { useEffect, useState } from 'react';
import { soundManager } from '@/lib/games/soundManager';
import { saveHighScore, unlockBadge } from '@/lib/games/badgeSystem';
import { ArrowLeft, RotateCcw, Volume2, VolumeX, Sparkles, Trophy, Zap, ShieldAlert } from 'lucide-react';

interface LaserDefenderProps {
  onBack: () => void;
}

interface Meteor {
  id: number;
  num1: number;
  num2: number;
  op: '+' | '-' | '×';
  answer: number;
  options: number[];
}

type DifficultyMode = 'easy' | 'medium' | 'high';

function generateMeteor(id: number, diffMode: DifficultyMode = 'medium'): Meteor {
  const ops: ('+' | '-' | '×')[] = diffMode === 'easy' ? ['+', '-'] : ['+', '-', '×'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let num1 = 1;
  let num2 = 1;
  let answer = 2;

  const maxNum = diffMode === 'easy' ? 12 : diffMode === 'medium' ? 25 : 50;

  if (op === '+') {
    num1 = Math.floor(Math.random() * maxNum) + 1;
    num2 = Math.floor(Math.random() * maxNum) + 1;
    answer = num1 + num2;
  } else if (op === '-') {
    num1 = Math.floor(Math.random() * maxNum) + 5;
    num2 = Math.floor(Math.random() * (num1 - 1)) + 1;
    answer = num1 - num2;
  } else {
    num1 = Math.floor(Math.random() * (diffMode === 'easy' ? 6 : diffMode === 'medium' ? 10 : 12)) + 2;
    num2 = Math.floor(Math.random() * (diffMode === 'easy' ? 5 : diffMode === 'medium' ? 8 : 10)) + 2;
    answer = num1 * num2;
  }

  const optionsSet = new Set<number>([answer]);
  while (optionsSet.size < 4) {
    const delta = (Math.floor(Math.random() * 5) + 1) * (Math.random() > 0.5 ? 1 : -1);
    optionsSet.add(Math.max(1, answer + delta));
  }

  const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);
  return { id, num1, num2, op, answer, options };
}

export default function LaserDefender({ onBack }: LaserDefenderProps) {
  const [diffMode, setDiffMode] = useState<DifficultyMode>('medium');
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [meteorCount, setMeteorCount] = useState(0);
  const [currentMeteor, setCurrentMeteor] = useState<Meteor>(() => generateMeteor(1, 'medium'));
  const [gameOver, setGameOver] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Meteor descent tick
  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      setHealth(prev => {
        const drain = diffMode === 'easy' ? 1 : diffMode === 'medium' ? 2 : 4;
        if (prev <= drain) {
          endGame();
          return 0;
        }
        return prev - drain;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameOver, diffMode]);

  const changeDifficulty = (mode: DifficultyMode) => {
    soundManager.playPop();
    setDiffMode(mode);
    setScore(0);
    setHealth(100);
    setMeteorCount(0);
    setGameOver(false);
    setCurrentMeteor(generateMeteor(1, mode));
  };

  const handleShoot = (selectedVal: number) => {
    if (gameOver) return;

    if (selectedVal === currentMeteor.answer) {
      soundManager.playPop();
      soundManager.playCorrect();

      const newScore = score + (diffMode === 'easy' ? 15 : diffMode === 'medium' ? 20 : 30);
      setScore(newScore);
      setHealth(prev => Math.min(100, prev + 8));

      saveHighScore('laser_defender', newScore);
      if (newScore >= 100) {
        unlockBadge('laser_defender');
      }

      setMeteorCount(prev => prev + 1);
      setCurrentMeteor(generateMeteor(meteorCount + 2, diffMode));
    } else {
      soundManager.playWrong();
      const penalty = diffMode === 'easy' ? 10 : diffMode === 'medium' ? 20 : 30;
      setHealth(prev => Math.max(0, prev - penalty));
      if (health <= penalty) {
        endGame();
      }
    }
  };

  const endGame = () => {
    setGameOver(true);
    soundManager.playVictory();
  };

  const restartGame = () => {
    setScore(0);
    setHealth(100);
    setMeteorCount(0);
    setGameOver(false);
    setCurrentMeteor(generateMeteor(1, diffMode));
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
          <div className="flex items-center gap-2 bg-red-950 border border-red-600 px-3 py-1 rounded-none">
            <Zap className="w-4 h-4 text-red-400" />
            <span className="text-xs font-black uppercase text-red-300">Laser Planet Defense</span>
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
                      ? 'bg-amber-600 text-white'
                      : 'bg-red-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center min-w-[100px]">
            <span className="text-[10px] text-slate-500 uppercase font-black block">Shield Health</span>
            <div className="w-full bg-slate-950 border border-slate-800 h-3 rounded-none overflow-hidden">
              <div
                style={{ width: `${health}%` }}
                className={`h-full transition-all duration-300 ${
                  health > 50 ? 'bg-emerald-500' : health > 20 ? 'bg-amber-500' : 'bg-red-500'
                }`}
              />
            </div>
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

      {/* Defense Screen */}
      <div className="relative min-h-[380px] sm:min-h-[420px] p-4 sm:p-5 flex flex-col items-center justify-between bg-slate-950">
        {!gameOver ? (
          <>
            {/* Incoming Meteor Target */}
            <div className="w-full max-w-md bg-slate-900 border border-red-500/50 rounded-none p-6 text-center shadow-lg space-y-3 my-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-950 border border-red-600 text-red-400 text-[10px] font-black uppercase">
                <ShieldAlert className="w-3.5 h-3.5" /> INCOMING METEOR HAZARD
              </div>
              <h3 className="text-4xl font-black text-white font-mono tracking-wider">
                {currentMeteor.num1} {currentMeteor.op} {currentMeteor.num2} = ?
              </h3>
            </div>

            {/* Laser Cannon Cannons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-xl">
              {currentMeteor.options.map((val, idx) => (
                <button
                  key={idx}
                  onClick={() => handleShoot(val)}
                  className="h-24 rounded-none bg-gradient-to-t from-red-950 to-slate-900 border-2 border-red-500 hover:border-red-400 active:scale-95 text-white font-black text-2xl shadow-md cursor-pointer transition flex flex-col items-center justify-center gap-1 hover:bg-red-900/30"
                >
                  <span className="text-[10px] uppercase text-red-400 font-black">LASER {idx + 1}</span>
                  <span>{val}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="bg-slate-900 border border-slate-700 rounded-none p-6 max-w-sm w-full text-center shadow-2xl">
            <Trophy className="w-10 h-10 text-amber-400 mx-auto mb-3" />
            <h3 className="text-2xl font-black text-white mb-1">SHIELD COLLAPSED!</h3>
            <p className="text-xs text-slate-400 mb-4">Final Score: <strong className="text-amber-400 text-lg">{score}</strong></p>

            <div className="flex gap-3 mt-4">
              <button
                onClick={restartGame}
                className="flex-1 py-2.5 px-4 rounded-none bg-red-600 hover:bg-red-500 border border-red-400 font-black text-xs text-white uppercase tracking-wider cursor-pointer"
              >
                DEFEND AGAIN
              </button>
              <button
                onClick={onBack}
                className="px-4 py-2.5 rounded-none bg-slate-800 hover:bg-slate-700 border border-slate-700 font-black text-xs text-slate-300 uppercase cursor-pointer"
              >
                HUB
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
