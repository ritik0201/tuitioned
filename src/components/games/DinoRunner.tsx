'use client';

import React, { useEffect, useState } from 'react';
import { soundManager } from '@/lib/games/soundManager';
import { saveHighScore, unlockBadge } from '@/lib/games/badgeSystem';
import { ArrowLeft, RotateCcw, Volume2, VolumeX, Sparkles, Trophy, Heart } from 'lucide-react';

interface DinoRunnerProps {
  onBack: () => void;
}

interface Question {
  question: string;
  options: string[];
  correct: number;
}

const TRIVIA_QUESTIONS: Question[] = [
  { question: 'What do Dinosaurs eat if they are Herbivores?', options: ['Plants 🌱', 'Meat 🥩', 'Rocks 🪨'], correct: 0 },
  { question: 'Which planet is known as the Red Planet?', options: ['Mars 🪐', 'Venus 🌟', 'Jupiter 🌕'], correct: 0 },
  { question: 'What is 15 + 25?', options: ['40', '35', '50'], correct: 0 },
  { question: 'How many legs does a spider have?', options: ['8 🕷️', '6 🐝', '4 🐶'], correct: 0 },
  { question: 'Which gas do humans need to breathe?', options: ['Oxygen 💨', 'Helium 🎈', 'Carbon Dioxide 🌫️'], correct: 0 },
  { question: 'What is 8 x 5?', options: ['40', '45', '35'], correct: 0 },
  { question: 'Which animal is the largest living mammal?', options: ['Blue Whale 🐋', 'Elephant 🐘', 'Giraffe 🦒'], correct: 0 }
];

export default function DinoRunner({ onBack }: DinoRunnerProps) {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [obstaclePos, setObstaclePos] = useState(100);
  const [gameOver, setGameOver] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const currentQ = TRIVIA_QUESTIONS[questionIdx % TRIVIA_QUESTIONS.length];

  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      setObstaclePos(prev => {
        if (prev <= 0) return 100;
        return prev - 2;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [gameOver]);

  const handleAnswer = (optionIndex: number) => {
    if (gameOver) return;

    if (optionIndex === currentQ.correct) {
      soundManager.playPop();
      soundManager.playCorrect();

      setIsJumping(true);
      setTimeout(() => setIsJumping(false), 800);

      const newScore = score + 20;
      setScore(newScore);

      if (newScore >= 100) {
        unlockBadge('dino_runner');
      }

      setQuestionIdx(prev => prev + 1);
    } else {
      soundManager.playWrong();
      const newLives = lives - 1;
      setLives(newLives);

      if (newLives <= 0) {
        endGame();
      }
    }
  };

  const endGame = () => {
    setGameOver(true);
    soundManager.playVictory();
    saveHighScore('dino_runner', score);
    if (score >= 100) {
      unlockBadge('dino_runner');
    }
  };

  const restartGame = () => {
    setScore(0);
    setLives(3);
    setQuestionIdx(0);
    setObstaclePos(100);
    setGameOver(false);
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
          <div className="flex items-center gap-2 bg-emerald-950 border border-emerald-600 px-3 py-1 rounded-none">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-black uppercase text-emerald-300">Dino Quiz Runner</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1">
            {[1, 2, 3].map(heart => (
              <Heart
                key={heart}
                className={`w-4 h-4 ${heart <= lives ? 'fill-red-500 text-red-500' : 'text-slate-700'}`}
              />
            ))}
          </div>

          <div className="text-center">
            <span className="text-[10px] text-slate-500 uppercase font-black block">Score</span>
            <span className="text-lg font-black text-emerald-400">{score}</span>
          </div>

          <button
            onClick={toggleSound}
            className="p-1.5 rounded-none bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Runner Screen */}
      <div className="relative min-h-[380px] sm:min-h-[420px] p-4 sm:p-5 flex flex-col items-center justify-between bg-slate-950 overflow-hidden">
        {!gameOver ? (
          <>
            <div className="relative w-full h-36 bg-slate-900 border-b-2 border-emerald-500 rounded-none overflow-hidden flex items-end px-8">
              <div
                className={`text-4xl transition-all duration-300 transform ${
                  isJumping ? '-translate-y-16 scale-110' : 'translate-y-0'
                }`}
              >
                🦖
              </div>
              <div style={{ left: `${obstaclePos}%` }} className="absolute bottom-3 text-2xl transition-none">
                🌵
              </div>
            </div>

            <div className="w-full max-w-lg bg-slate-900 border border-emerald-500/40 rounded-none p-5 text-center shadow-lg mt-4">
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-1">
                Answer correctly to jump!
              </span>
              <h3 className="text-base font-extrabold text-white mb-4">{currentQ.question}</h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {currentQ.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    className="py-2.5 px-3 rounded-none bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white font-black text-xs shadow-md transition border border-emerald-400/40 cursor-pointer uppercase"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-slate-900 border border-slate-700 rounded-none p-6 max-w-sm w-full text-center shadow-2xl">
            <Trophy className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-2xl font-black text-white mb-1">RUN COMPLETE!</h3>
            <p className="text-xs text-slate-400 mb-4">Final Score: <strong className="text-emerald-400 text-lg">{score}</strong></p>

            <div className="flex gap-3 mt-4">
              <button
                onClick={restartGame}
                className="flex-1 py-2.5 px-4 rounded-none bg-emerald-600 hover:bg-emerald-500 border border-emerald-400 font-black text-xs text-white uppercase tracking-wider cursor-pointer"
              >
                RUN AGAIN
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
