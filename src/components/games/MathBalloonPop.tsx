'use client';

import React, { useEffect, useRef, useState } from 'react';
import { soundManager } from '@/lib/games/soundManager';
import { saveHighScore, unlockBadge } from '@/lib/games/badgeSystem';
import { ArrowLeft, RotateCcw, Volume2, VolumeX, Trophy, Star, Sparkles } from 'lucide-react';

interface MathBalloonPopProps {
  onBack: () => void;
}

interface Question {
  text: string;
  answer: number;
  options: number[];
}

type DifficultyMode = 'easy' | 'medium' | 'high';

function generateQuestion(level: number, diffMode: DifficultyMode = 'easy'): Question {
  let text = '';
  let answer = 0;
  const qType = Math.floor(Math.random() * 4); // Variety of problem types per ease level

  if (diffMode === 'easy') {
    if (qType === 0) {
      // Basic addition
      const n1 = Math.floor(Math.random() * 15) + 1;
      const n2 = Math.floor(Math.random() * 15) + 1;
      answer = n1 + n2;
      text = `${n1} + ${n2} = ?`;
    } else if (qType === 1) {
      // Subtraction
      const n1 = Math.floor(Math.random() * 15) + 5;
      const n2 = Math.floor(Math.random() * n1) + 1;
      answer = n1 - n2;
      text = `${n1} - ${n2} = ?`;
    } else if (qType === 2) {
      // Missing addend: ? + 4 = 10
      const ans = Math.floor(Math.random() * 10) + 1;
      const n2 = Math.floor(Math.random() * 10) + 1;
      const sum = ans + n2;
      answer = ans;
      text = `? + ${n2} = ${sum}`;
    } else {
      // Simple double addition
      const n1 = Math.floor(Math.random() * 6) + 1;
      const n2 = Math.floor(Math.random() * 6) + 1;
      const n3 = Math.floor(Math.random() * 6) + 1;
      answer = n1 + n2 + n3;
      text = `${n1} + ${n2} + ${n3} = ?`;
    }
  } else if (diffMode === 'medium') {
    if (qType === 0) {
      // Multiplication
      const n1 = Math.floor(Math.random() * 10) + 2;
      const n2 = Math.floor(Math.random() * 10) + 2;
      answer = n1 * n2;
      text = `${n1} × ${n2} = ?`;
    } else if (qType === 1) {
      // Missing minuend: ? - 8 = 12
      const ans = Math.floor(Math.random() * 20) + 10;
      const sub = Math.floor(Math.random() * 10) + 1;
      const result = ans - sub;
      answer = ans;
      text = `? - ${sub} = ${result}`;
    } else if (qType === 2) {
      // Division without remainder
      const mult = Math.floor(Math.random() * 9) + 2;
      answer = Math.floor(Math.random() * 10) + 1;
      const dividend = mult * answer;
      text = `${dividend} ÷ ${mult} = ?`;
    } else {
      // Mixed add/sub
      const n1 = Math.floor(Math.random() * 30) + 10;
      const n2 = Math.floor(Math.random() * 20) + 5;
      const n3 = Math.floor(Math.random() * 10) + 1;
      answer = n1 + n2 - n3;
      text = `${n1} + ${n2} - ${n3} = ?`;
    }
  } else {
    // High difficulty
    if (qType === 0) {
      // Multi-step math: (A + B) × C
      const a = Math.floor(Math.random() * 6) + 2;
      const b = Math.floor(Math.random() * 6) + 1;
      const c = Math.floor(Math.random() * 5) + 2;
      answer = (a + b) * c;
      text = `(${a} + ${b}) × ${c} = ?`;
    } else if (qType === 1) {
      // Multi-step math: (A × B) - C
      const a = Math.floor(Math.random() * 9) + 3;
      const b = Math.floor(Math.random() * 8) + 2;
      const c = Math.floor(Math.random() * 15) + 1;
      answer = a * b - c;
      text = `(${a} × ${b}) - ${c} = ?`;
    } else if (qType === 2) {
      // Larger division: A ÷ B
      const divisor = Math.floor(Math.random() * 12) + 3;
      answer = Math.floor(Math.random() * 15) + 4;
      const dividend = divisor * answer;
      text = `${dividend} ÷ ${divisor} = ?`;
    } else {
      // Missing factor: ? × 7 = 56
      const ans = Math.floor(Math.random() * 12) + 2;
      const factor = Math.floor(Math.random() * 10) + 2;
      const prod = ans * factor;
      answer = ans;
      text = `? × ${factor} = ${prod}`;
    }
  }

  const optionsSet = new Set<number>([answer]);
  while (optionsSet.size < 4) {
    const delta = (Math.floor(Math.random() * 6) + 1) * (Math.random() > 0.5 ? 1 : -1);
    const fake = Math.max(1, answer + delta);
    optionsSet.add(fake);
  }

  const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);
  return { text, answer, options };
}

const BALLOON_DATA = [
  { bg: 'from-pink-500 via-rose-500 to-red-600', shadow: 'rgba(244,63,94,0.6)', tie: 'bg-red-700' },
  { bg: 'from-emerald-400 via-green-500 to-emerald-700', shadow: 'rgba(16,185,129,0.6)', tie: 'bg-emerald-800' },
  { bg: 'from-blue-400 via-indigo-500 to-purple-600', shadow: 'rgba(99,102,241,0.6)', tie: 'bg-purple-800' },
  { bg: 'from-amber-400 via-orange-500 to-red-500', shadow: 'rgba(245,158,11,0.6)', tie: 'bg-orange-700' },
  { bg: 'from-purple-400 via-fuchsia-500 to-pink-600', shadow: 'rgba(217,70,239,0.6)', tie: 'bg-fuchsia-800' },
  { bg: 'from-cyan-400 via-teal-500 to-blue-600', shadow: 'rgba(6,182,212,0.6)', tie: 'bg-blue-800' }
];

export default function MathBalloonPop({ onBack }: MathBalloonPopProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<any>(null);

  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState(1);
  const [question, setQuestion] = useState<Question>(() => generateQuestion(1));
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  const [isMuted, setIsMuted] = useState(false);
  const [newRecord, setNewRecord] = useState(false);

  useEffect(() => {
    if (gameOver) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameOver]);

  useEffect(() => {
    let isMounted = true;

    async function initPhaser() {
      if (typeof window === 'undefined' || !containerRef.current) return;
      const Phaser = (await import('phaser')).default;
      if (!isMounted || !containerRef.current) return;

      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
      }

      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        parent: containerRef.current,
        width: 800,
        height: 500,
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH
        },
        backgroundColor: '#0f172a',
        physics: {
          default: 'arcade',
          arcade: { gravity: { x: 0, y: -60 }, debug: false }
        },
        scene: {
          create: function (this: Phaser.Scene) {
            for (let i = 0; i < 40; i++) {
              const x = Phaser.Math.Between(0, 800);
              const y = Phaser.Math.Between(0, 500);
              const star = this.add.circle(x, y, Phaser.Math.Between(1, 3), 0xffffff, 0.4);
              this.tweens.add({
                targets: star,
                alpha: 0.8,
                duration: Phaser.Math.Between(1000, 3000),
                yoyo: true,
                repeat: -1
              });
            }
          }
        }
      };

      phaserGameRef.current = new Phaser.Game(config);
    }

    initPhaser();

    return () => {
      isMounted = false;
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
      }
    };
  }, []);

  const [diffMode, setDiffMode] = useState<DifficultyMode>('easy');

  const changeDifficulty = (mode: DifficultyMode) => {
    soundManager.playPop();
    setDiffMode(mode);
    setScore(0);
    setStreak(0);
    setLevel(1);
    setTimeLeft(mode === 'easy' ? 45 : mode === 'medium' ? 35 : 25);
    setGameOver(false);
    setQuestion(generateQuestion(1, mode));
  };

  const handlePop = (selectedAnswer: number) => {
    if (gameOver) return;

    if (selectedAnswer === question.answer) {
      soundManager.playPop();
      soundManager.playCorrect();
      const points = (diffMode === 'easy' ? 10 : diffMode === 'medium' ? 15 : 25) + streak * 2;
      const nextScore = score + points;
      const nextStreak = streak + 1;

      setScore(nextScore);
      setStreak(nextStreak);

      if (nextStreak >= 5) setLevel(3);
      else if (nextStreak >= 2) setLevel(2);

      if (nextScore >= 100) {
        unlockBadge('math_wizard');
      }

      setQuestion(generateQuestion(nextStreak >= 5 ? 3 : nextStreak >= 2 ? 2 : 1, diffMode));
    } else {
      soundManager.playWrong();
      setStreak(0);
    }
  };

  const endGame = () => {
    setGameOver(true);
    soundManager.playVictory();
    const isNewHigh = saveHighScore('math_balloon', score);
    setNewRecord(isNewHigh);
    if (score >= 100) {
      unlockBadge('math_wizard');
    }
  };

  const restartGame = () => {
    setScore(0);
    setStreak(0);
    setLevel(1);
    setTimeLeft(diffMode === 'easy' ? 45 : diffMode === 'medium' ? 35 : 25);
    setGameOver(false);
    setNewRecord(false);
    setQuestion(generateQuestion(1, diffMode));
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
          <div className="flex items-center gap-2 bg-purple-950 border border-purple-600 px-3 py-1 rounded-none">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-black uppercase text-purple-300">Math Balloon Pop</span>
          </div>

          {/* Difficulty Selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 p-0.5 rounded-none">
            {(['easy', 'medium', 'high'] as DifficultyMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => changeDifficulty(mode)}
                className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider transition cursor-pointer ${
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
          <div className="text-center">
            <span className="text-[10px] text-slate-500 uppercase font-black block">Score</span>
            <span className="text-lg font-black text-amber-400">{score}</span>
          </div>

          <div className="text-center">
            <span className="text-[10px] text-slate-500 uppercase font-black block">Streak</span>
            <span className="text-lg font-black text-emerald-400">🔥 {streak}</span>
          </div>

          <div className="text-center min-w-[50px]">
            <span className="text-[10px] text-slate-500 uppercase font-black block">Time</span>
            <span className={`text-lg font-black ${timeLeft <= 10 ? 'text-red-400' : 'text-cyan-400'}`}>
              {timeLeft}s
            </span>
          </div>

          <button
            onClick={toggleSound}
            className="p-1.5 rounded-none bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Stage Area */}
      <div className="relative min-h-[380px] sm:min-h-[420px] w-full flex flex-col items-center justify-center bg-slate-950 overflow-hidden p-4 sm:p-6">
        <div ref={containerRef} className="absolute inset-0 z-0 pointer-events-none overflow-hidden [&>canvas]:!w-full [&>canvas]:!h-full [&>canvas]:!object-cover" />

        {!gameOver ? (
          <div className="relative z-10 w-full max-w-2xl flex flex-col items-center gap-6 py-4">
            <div className="bg-slate-900/90 backdrop-blur border border-indigo-500/60 rounded-none px-8 py-4 text-center shadow-xl">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block mb-1">Pop the balloon with the correct answer:</span>
              <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-wider">{question.text}</div>
            </div>

            {/* Floating 3D Balloons Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 w-full max-w-2xl mt-4 px-2 justify-items-center">
              {question.options.map((val, idx) => {
                const balloon = BALLOON_DATA[idx % BALLOON_DATA.length];

                return (
                  <button
                    key={`${val}-${idx}`}
                    onClick={() => handlePop(val)}
                    className="group relative flex flex-col items-center justify-center transition-all transform hover:scale-110 active:scale-95 cursor-pointer focus:outline-none py-2"
                  >
                    {/* Real 3D Glossy Balloon Shape */}
                    <div 
                      className={`relative w-28 h-36 sm:w-32 sm:h-40 rounded-[50%_50%_50%_50%/42%_42%_58%_58%] bg-gradient-to-b ${balloon.bg} flex flex-col items-center justify-center transition-all duration-300 group-hover:brightness-110 border border-white/30`}
                      style={{
                        boxShadow: `0 14px 28px -4px ${balloon.shadow}, inset 0 -8px 14px rgba(0,0,0,0.35)`
                      }}
                    >
                      {/* Glossy Top Reflection */}
                      <div className="absolute top-3 left-4 w-7 h-11 bg-gradient-to-br from-white/60 to-transparent rounded-full transform -rotate-45 pointer-events-none blur-[0.5px]" />
                      <div className="absolute top-4 left-5 w-2 h-4 bg-white/80 rounded-full transform -rotate-45 pointer-events-none" />

                      {/* Number inside Balloon */}
                      <span className="relative z-10 text-4xl sm:text-5xl font-black text-white drop-shadow-[0_3px_6px_rgba(0,0,0,0.8)] font-mono">
                        {val}
                      </span>

                      {/* Balloon Tie Knot */}
                      <div className={`absolute -bottom-2.5 w-4 h-3.5 ${balloon.tie} rounded-b-md border-t border-black/20`} />
                    </div>

                    {/* Balloon String */}
                    <div className="w-0.5 h-10 sm:h-12 bg-gradient-to-b from-white/80 via-white/40 to-transparent shadow-sm" />
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="relative z-20 bg-slate-900/95 border border-slate-700 rounded-none p-6 max-w-sm w-full text-center shadow-2xl backdrop-blur-md">
            <Trophy className="w-10 h-10 text-amber-400 mx-auto mb-3" />
            <h3 className="text-2xl font-black text-white mb-1">TIME'S UP!</h3>
            <p className="text-xs text-slate-400 mb-4">Final Score: <strong className="text-amber-400 text-lg">{score}</strong></p>

            <div className="flex gap-3 mt-4">
              <button
                onClick={restartGame}
                className="flex-1 py-2.5 px-4 rounded-none bg-emerald-600 hover:bg-emerald-500 border border-emerald-400 font-black text-xs text-white uppercase tracking-wider cursor-pointer"
              >
                PLAY AGAIN
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
