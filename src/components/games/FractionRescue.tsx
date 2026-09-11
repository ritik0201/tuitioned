'use client';

import React, { useState, useEffect, useRef } from 'react';
import { soundManager } from '@/lib/games/soundManager';
import { saveHighScore, unlockBadge } from '@/lib/games/badgeSystem';
import { ArrowLeft, RotateCcw, Volume2, VolumeX, Trophy, Star, Check, Sparkles, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';

interface FractionRescueProps {
  onBack: () => void;
}

interface RoundProblem {
  id: number;
  numerator: number;
  denominator: number;
  maxLineValue: number; // 1 or 2
  hintText: string;
}

const TOTAL_ROUNDS = 5;

// Generate 5 distinct rounds with varying difficulty
function generateRounds(): RoundProblem[] {
  const pools: Array<{ n: number; d: number; maxVal?: number }> = [
    // Round 1 - Easy
    { n: 1, d: 2 }, { n: 2, d: 3 }, { n: 3, d: 4 }, { n: 2, d: 5 },
    // Round 2 - Easy/Med
    { n: 3, d: 5 }, { n: 5, d: 6 }, { n: 3, d: 8 }, { n: 4, d: 5 },
    // Round 3 - Med (like screenshot: 5/8)
    { n: 5, d: 8 }, { n: 7, d: 10 }, { n: 5, d: 6 }, { n: 3, d: 10 },
    // Round 4 - Med/Hard
    { n: 7, d: 8 }, { n: 9, d: 10 }, { n: 5, d: 12 }, { n: 7, d: 12 },
    // Round 5 - Challenge
    { n: 11, d: 12 }, { n: 5, d: 8 }, { n: 7, d: 9 }, { n: 4, d: 6 }
  ];

  // Pick 1 from each difficulty tier
  const rounds: RoundProblem[] = [];

  const tier1 = pools.slice(0, 4);
  const tier2 = pools.slice(4, 8);
  const tier3 = pools.slice(8, 12);
  const tier4 = pools.slice(12, 16);
  const tier5 = pools.slice(16, 20);

  const picked = [
    tier1[Math.floor(Math.random() * tier1.length)],
    tier2[Math.floor(Math.random() * tier2.length)],
    tier3[Math.floor(Math.random() * tier3.length)],
    tier4[Math.floor(Math.random() * tier4.length)],
    tier5[Math.floor(Math.random() * tier5.length)]
  ];

  picked.forEach((p, idx) => {
    rounds.push({
      id: idx + 1,
      numerator: p.n,
      denominator: p.d,
      maxLineValue: p.maxVal || 1,
      hintText: `Divide the line into ${p.d} equal parts, then count ${p.n} parts from 0.`
    });
  });

  return rounds;
}

export default function FractionRescue({ onBack }: FractionRescueProps) {
  const [rounds, setRounds] = useState<RoundProblem[]>([]);
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  
  // Game states
  const [partsCount, setPartsCount] = useState(1); // User's denominator setting
  const [selectedTick, setSelectedTick] = useState(0); // User's numerator setting
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  // Animation & Feedback state
  const [isFlightAnimating, setIsFlightAnimating] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: ''
  });
  
  // Helicopter flight x percentage (0..100%)
  const [copterXPercent, setCopterXPercent] = useState(15);
  // Basket lowering offset (px)
  const [basketY, setBasketY] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const currentProblem = rounds[currentRoundIdx] || {
    id: 1,
    numerator: 5,
    denominator: 8,
    maxLineValue: 1,
    hintText: 'Divide line into 8 parts and select 5/8'
  };

  useEffect(() => {
    startNewGame();
    setIsMuted(soundManager.getMuted());
  }, []);

  const startNewGame = () => {
    const newRounds = generateRounds();
    setRounds(newRounds);
    setCurrentRoundIdx(0);
    setPartsCount(1);
    setSelectedTick(0);
    setScore(0);
    setStreak(0);
    setGameEnded(false);
    setIsNewHighScore(false);
    setCopterXPercent(15);
    setBasketY(0);
    setFeedback({ type: 'idle', message: 'Start with dividing the number line into equal number of parts.' });
  };

  const handleNextRound = () => {
    if (currentRoundIdx + 1 < TOTAL_ROUNDS) {
      setCurrentRoundIdx(prev => prev + 1);
      setPartsCount(1);
      setSelectedTick(0);
      setCopterXPercent(15);
      setBasketY(0);
      setFeedback({ type: 'idle', message: 'Start with dividing the number line into equal number of parts.' });
    } else {
      // Game Finish
      finishGame();
    }
  };

  const finishGame = () => {
    setGameEnded(true);
    soundManager.playVictory();
    const finalScore = score;
    const isHigh = saveHighScore('fraction_rescue', finalScore);
    if (isHigh) setIsNewHighScore(true);

    if (finalScore >= 100) {
      unlockBadge('fraction_pilot');
    }
  };

  // Adjust parts count (denominator)
  const handlePartsChange = (delta: number) => {
    if (isFlightAnimating) return;
    soundManager.playPop();
    const maxVal = currentProblem.maxLineValue;
    const next = Math.max(1, Math.min(12, partsCount + delta));
    setPartsCount(next);
    
    // Clamp selected tick to new parts
    if (selectedTick > next) {
      setSelectedTick(next);
    }

    if (next === currentProblem.denominator) {
      setFeedback({
        type: 'idle',
        message: `Great! The line is in ${next} parts. Now click/select tick mark ${currentProblem.numerator}/${next}.`
      });
    } else {
      setFeedback({
        type: 'idle',
        message: `Divided into ${next} parts. (Target: ${currentProblem.numerator}/${currentProblem.denominator})`
      });
    }
  };

  // Handle direct tick click on the line
  const handleTickClick = (tickIdx: number) => {
    if (isFlightAnimating) return;
    soundManager.playPop();
    setSelectedTick(tickIdx);
    setFeedback({
      type: 'idle',
      message: `Selected ${tickIdx}/${partsCount}. Click 'Check' to launch rescue!`
    });
  };

  // Check action: Animate Helicopter to the fraction tick mark
  const handleCheck = () => {
    if (isFlightAnimating) return;

    setIsFlightAnimating(true);
    soundManager.playPop();

    // Calculate target X percentage for helicopter
    // Number line spans X from 12% to 88% on the canvas
    const startX = 12;
    const endX = 88;
    const targetFraction = selectedTick / partsCount;
    const finalXPercent = startX + targetFraction * (endX - startX);

    // Animate helicopter moving across
    let currentX = copterXPercent;
    const step = (finalXPercent - currentX) / 25;
    let count = 0;

    const interval = setInterval(() => {
      count++;
      currentX += step;
      setCopterXPercent(currentX);

      if (count >= 25) {
        clearInterval(interval);
        setCopterXPercent(finalXPercent);

        // Lower basket down to line
        setBasketY(120);

        setTimeout(() => {
          evaluateAnswer();
        }, 600);
      }
    }, 30);
  };

  const evaluateAnswer = () => {
    const isCorrectParts = partsCount === currentProblem.denominator;
    const isCorrectTick = selectedTick === currentProblem.numerator;
    const isCorrect = isCorrectParts && isCorrectTick;

    if (isCorrect) {
      soundManager.playCorrect();
      setShowConfetti(true);

      const addedPoints = 20 + streak * 5;
      setScore(prev => prev + addedPoints);
      setStreak(prev => prev + 1);

      setFeedback({
        type: 'success',
        message: `🎉 AWESOME! You rescued Panda at ${currentProblem.numerator}/${currentProblem.denominator}! (+${addedPoints} pts)`
      });

      setTimeout(() => {
        setBasketY(0);
        setShowConfetti(false);
        setIsFlightAnimating(false);
        handleNextRound();
      }, 2000);
    } else {
      soundManager.playWrong();
      setStreak(0);

      let errMessage = '';
      if (!isCorrectParts) {
        errMessage = `Oops! Panda needs ${currentProblem.denominator} equal parts, but you set ${partsCount} parts.`;
      } else {
        errMessage = `You selected ${selectedTick}/${partsCount}, but Panda is at ${currentProblem.numerator}/${currentProblem.denominator}!`;
      }

      setFeedback({
        type: 'error',
        message: errMessage
      });

      setTimeout(() => {
        setBasketY(0);
        setIsFlightAnimating(false);
      }, 1800);
    }
  };

  const toggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  // Compute number line tick positions for SVG
  const lineStartX = 12; // in percentage
  const lineEndX = 88; // in percentage
  const lineY = 280; // in SVG px coordinate (viewBox 0 0 1000 450)

  const ticks = [];
  for (let i = 0; i <= partsCount; i++) {
    const pct = lineStartX + (i / partsCount) * (lineEndX - lineStartX);
    ticks.push({
      index: i,
      pct,
      svgX: (pct / 100) * 1000
    });
  }

  // Target fraction coordinate for visual indicator flag
  const targetPct = lineStartX + (selectedTick / partsCount) * (lineEndX - lineStartX);
  const targetSvgX = (targetPct / 100) * 1000;

  return (
    <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl text-white select-none flex flex-col">
      {/* Top Header Bar */}
      <div className="bg-slate-950/80 backdrop-blur border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-bold transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Hub
        </button>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-lg shadow-md">
            🚁
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wide text-white uppercase flex items-center gap-2">
              Helicopter Fraction Rescue
            </h1>
            <p className="text-[11px] text-amber-400 font-medium">Number Line Fraction Navigator</p>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1 rounded-md border border-slate-700 text-xs">
            <span className="text-slate-400 font-semibold">ROUND:</span>
            <span className="font-black text-amber-400">{currentRoundIdx + 1} / {TOTAL_ROUNDS}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1 rounded-md border border-slate-700 text-xs">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-black text-amber-300">{score}</span>
          </div>

          {streak > 1 && (
            <div className="hidden sm:flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded text-xs font-black animate-pulse">
              <Star className="w-3 h-3 fill-amber-400" />
              {streak}x STREAK
            </div>
          )}

          <button
            onClick={toggleMute}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Canvas / Graphic Stage */}
      <div className="relative w-full h-[440px] bg-gradient-to-b from-teal-900 via-emerald-950 to-slate-950 overflow-hidden">
        {/* SVG Background Landscape & Graphics */}
        <svg viewBox="0 0 1000 450" className="w-full h-full absolute inset-0 preserve-3d">
          <defs>
            {/* Sky / River Gradients */}
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2d4a3e" />
              <stop offset="60%" stopColor="#1e382b" />
              <stop offset="100%" stopColor="#13271d" />
            </linearGradient>

            <linearGradient id="hillGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3d6b52" />
              <stop offset="100%" stopColor="#234232" />
            </linearGradient>

            <linearGradient id="islandGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4a7c59" />
              <stop offset="85%" stopColor="#355e42" />
              <stop offset="100%" stopColor="#7c5227" />
            </linearGradient>

            <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2b5974" />
              <stop offset="100%" stopColor="#183648" />
            </linearGradient>
          </defs>

          {/* Sky background */}
          <rect width="1000" height="450" fill="url(#skyGrad)" />

          {/* Clouds */}
          <path d="M 100 80 Q 120 60 150 70 Q 180 50 210 70 Q 240 60 260 80 Z" fill="#ffffff" opacity="0.12" />
          <path d="M 650 90 Q 670 70 700 80 Q 730 60 760 80 Q 790 70 810 90 Z" fill="#ffffff" opacity="0.1" />

          {/* Water edges */}
          <rect x="0" y="320" width="1000" height="130" fill="url(#waterGrad)" />

          {/* Distant Hills */}
          <path d="M -50 330 Q 150 210 400 290 Q 650 220 900 300 Q 1050 280 1100 330 Z" fill="url(#hillGrad)" />

          {/* Pine Trees (Background Layer) */}
          {[60, 140, 220, 310, 680, 750, 840, 920].map((x, i) => (
            <g key={i} transform={`translate(${x}, ${190 + (i % 3) * 15}) scale(${0.7 + (i % 2) * 0.2})`}>
              {/* Trunk */}
              <rect x="-4" y="80" width="8" height="30" fill="#422a18" />
              {/* Pine Triangles */}
              <polygon points="0,0 -28,50 28,50" fill="#1b4d32" />
              <polygon points="0,25 -35,75 35,75" fill="#245d3e" />
              <polygon points="0,45 -42,95 42,95" fill="#163f28" />
            </g>
          ))}

          {/* Island Landmass (Foreground) */}
          <path
            d="M 50 370 Q 70 290 120 270 L 880 270 Q 930 290 950 370 Q 800 400 500 400 Q 200 400 50 370 Z"
            fill="url(#islandGrad)"
            stroke="#294633"
            strokeWidth="3"
          />
          {/* Island Soil layer */}
          <path d="M 50 370 Q 200 400 500 400 Q 800 400 950 370 L 945 385 Q 800 415 500 415 Q 200 415 55 385 Z" fill="#8c5828" />

          {/* Top Right Pulley Platform Structure (Reference Detail) */}
          <g transform="translate(760, 20)">
            <rect x="0" y="0" width="120" height="14" rx="4" fill="#654321" stroke="#3d2612" strokeWidth="2" />
            {[15, 30, 45, 60, 75, 90, 105].map((x, i) => (
              <circle key={i} cx={x} cy="7" r="3" fill="#2d1c0c" />
            ))}
          </g>

          {/* Number Line Structure */}
          <g>
            {/* Base line glow */}
            <line x1="120" y1={lineY} x2="880" y2={lineY} stroke="#fde047" strokeWidth="8" opacity="0.25" strokeLinecap="round" />
            {/* White main line */}
            <line x1="120" y1={lineY} x2="880" y2={lineY} stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />

            {/* End Point Circles (0 and 1) */}
            <circle cx="120" cy={lineY} r="7" fill="#ffffff" stroke="#eab308" strokeWidth="3" />
            <circle cx="880" cy={lineY} r="7" fill="#ffffff" stroke="#eab308" strokeWidth="3" />

            {/* End Labels 0 and 1 */}
            <text x="120" y={lineY + 36} textAnchor="middle" fill="#ffffff" fontSize="22" fontWeight="900" fontFamily="sans-serif">
              0
            </text>
            <text x="880" y={lineY + 36} textAnchor="middle" fill="#ffffff" fontSize="22" fontWeight="900" fontFamily="sans-serif">
              {currentProblem.maxLineValue}
            </text>

            {/* Render dynamic division ticks */}
            {ticks.map((t) => {
              const isSelected = t.index === selectedTick;
              return (
                <g key={t.index} className="cursor-pointer" onClick={() => handleTickClick(t.index)}>
                  {/* Clickable hit area */}
                  <rect x={t.svgX - 15} y={lineY - 30} width="30" height="60" fill="transparent" />

                  {/* Tick line */}
                  <line
                    x1={t.svgX}
                    y1={lineY - 12}
                    x2={t.svgX}
                    y2={lineY + 12}
                    stroke={isSelected ? '#f59e0b' : '#ffffff'}
                    strokeWidth={isSelected ? '5' : '3'}
                  />

                  {/* Tick marker dot */}
                  <circle
                    cx={t.svgX}
                    cy={lineY}
                    r={isSelected ? '6' : '3'}
                    fill={isSelected ? '#f59e0b' : '#ffffff'}
                  />

                  {/* Tick label fraction */}
                  {t.index > 0 && t.index < partsCount && (
                    <text
                      x={t.svgX}
                      y={lineY + 32}
                      textAnchor="middle"
                      fill={isSelected ? '#fbbf24' : '#cbd5e1'}
                      fontSize="14"
                      fontWeight={isSelected ? '900' : '700'}
                    >
                      {t.index}/{partsCount}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Selected Target Flag Pin on the Number Line */}
            <g transform={`translate(${targetSvgX}, ${lineY})`} className="transition-transform duration-200">
              {/* Pulse circle */}
              <circle cx="0" cy="0" r="14" fill="#f59e0b" opacity="0.3" className="animate-ping" />
              {/* Pin point */}
              <polygon points="0,0 -8,-25 8,-25" fill="#f59e0b" />
              <circle cx="0" cy="-25" r="10" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
              <text x="0" y="-21" textAnchor="middle" fill="#78350f" fontSize="11" fontWeight="900">
                {selectedTick}
              </text>
            </g>
          </g>
        </svg>

        {/* Instruction Banner Text (Center Overlay) */}
        <div className="absolute top-28 left-1/2 -translate-x-1/2 w-11/12 max-w-xl text-center pointer-events-none z-10">
          <div
            className={`px-5 py-2.5 rounded-full shadow-xl border backdrop-blur-md transition-all duration-300 ${
              feedback.type === 'success'
                ? 'bg-emerald-500/90 border-emerald-300 text-white animate-bounce'
                : feedback.type === 'error'
                ? 'bg-rose-600/90 border-rose-400 text-white animate-shake'
                : 'bg-slate-900/85 border-slate-700/80 text-slate-100'
            }`}
          >
            <p className="text-sm sm:text-base font-extrabold tracking-wide drop-shadow">
              {feedback.message}
            </p>
          </div>
        </div>

        {/* Flying Helicopter & Panda Group */}
        <div
          className="absolute top-6 transition-all duration-75 z-20"
          style={{
            left: `${copterXPercent}%`,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="relative flex flex-col items-center">
            {/* Thought Bubble with Target Fraction */}
            <div className="absolute -right-20 -top-4 bg-amber-100 border-2 border-amber-600 text-slate-900 px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 animate-pulse z-30">
              <div className="flex flex-col items-center justify-center leading-none text-xs font-black text-amber-950">
                <span>{currentProblem.numerator}</span>
                <span className="w-full h-[2px] bg-amber-900 my-[1px]" />
                <span>{currentProblem.denominator}</span>
              </div>
              <div className="w-2.5 h-2.5 bg-amber-100 border-r-2 border-b-2 border-amber-600 rotate-45 absolute -left-1.5 top-1/2 -translate-y-1/2" />
            </div>

            {/* Orange Helicopter SVG */}
            <svg width="120" height="70" viewBox="0 0 120 70" className="drop-shadow-xl">
              {/* Spinning Main Rotor */}
              <g className="animate-spin origin-[60px_8px]" style={{ animationDuration: '0.15s' }}>
                <line x1="10" y1="8" x2="110" y2="8" stroke="#cbd5e1" strokeWidth="3" opacity="0.8" />
                <circle cx="60" cy="8" r="4" fill="#475569" />
              </g>
              <line x1="60" y1="8" x2="60" y2="18" stroke="#334155" strokeWidth="3" />

              {/* Helicopter Tail & Small Rotor */}
              <path d="M 50 35 L 5 30 L 5 22 Z" fill="#ea580c" />
              <g className="animate-spin origin-[5px_26px]" style={{ animationDuration: '0.2s' }}>
                <line x1="5" y1="16" x2="5" y2="36" stroke="#94a3b8" strokeWidth="2.5" />
              </g>

              {/* Body Cabin */}
              <ellipse cx="65" cy="36" rx="35" ry="22" fill="#f97316" stroke="#ea580c" strokeWidth="2" />
              {/* Cockpit Window */}
              <path d="M 72 20 Q 95 24 95 38 Q 80 44 72 40 Z" fill="#38bdf8" opacity="0.85" stroke="#0284c7" strokeWidth="1.5" />
              <path d="M 85 24 Q 92 27 92 34 Z" fill="#ffffff" opacity="0.6" />

              {/* Landing Skids */}
              <line x1="45" y1="58" x2="85" y2="58" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
              <line x1="52" y1="48" x2="50" y2="58" stroke="#334155" strokeWidth="2.5" />
              <line x1="78" y1="48" x2="80" y2="58" stroke="#334155" strokeWidth="2.5" />
            </svg>

            {/* Rope Cable extending down to basket */}
            <div
              className="w-[2px] bg-amber-800 transition-all duration-300"
              style={{ height: `${40 + basketY}px` }}
            />

            {/* Basket with Panda */}
            <div
              className="relative -mt-1 transition-all duration-300 flex items-center justify-center"
              style={{ transform: `translateY(${basketY > 0 ? 0 : 0}px)` }}
            >
              {/* Basket */}
              <div className="w-11 h-10 bg-amber-600 border-2 border-amber-800 rounded-b-xl shadow-md flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#b45309_1px,transparent_1px)] [background-size:4px_4px] opacity-40" />

                {/* Panda Character */}
                <div className="relative z-10 -mt-3 flex flex-col items-center">
                  {/* Ears */}
                  <div className="flex justify-between w-7 -mb-1">
                    <div className="w-2.5 h-2.5 bg-slate-900 rounded-full" />
                    <div className="w-2.5 h-2.5 bg-slate-900 rounded-full" />
                  </div>
                  {/* Face */}
                  <div className="w-7 h-6 bg-white border border-slate-300 rounded-full flex flex-col items-center justify-center relative shadow-sm">
                    {/* Eye patches */}
                    <div className="flex justify-between w-5 mt-0.5">
                      <div className="w-1.5 h-2 bg-slate-900 rounded-full flex items-center justify-center">
                        <div className="w-0.5 h-0.5 bg-white rounded-full" />
                      </div>
                      <div className="w-1.5 h-2 bg-slate-900 rounded-full flex items-center justify-center">
                        <div className="w-0.5 h-0.5 bg-white rounded-full" />
                      </div>
                    </div>
                    {/* Nose */}
                    <div className="w-1 h-0.5 bg-slate-900 rounded-full -mt-0.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Celebration Confetti */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2.5 h-2.5 rounded-sm animate-ping"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 50}%`,
                  backgroundColor: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'][i % 5],
                  animationDuration: `${0.6 + Math.random() * 0.8}s`
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Control Deck (Bottom Section matching reference slider & check button) */}
      <div className="bg-slate-950 p-4 sm:p-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Equal Parts Stepper Slider Control */}
        <div className="flex flex-col gap-1.5 w-full md:w-auto">
          <label className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <span>1. Divide Number Line (Denominator):</span>
            <span className="text-amber-400 font-bold">Parts = {partsCount}</span>
          </label>

          <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-full border border-slate-700 shadow-inner">
            {/* Decrease Parts Button */}
            <button
              onClick={() => handlePartsChange(-1)}
              disabled={partsCount <= 1 || isFlightAnimating}
              className="w-10 h-10 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-amber-950 rounded-full flex items-center justify-center font-black text-lg transition shadow cursor-pointer active:scale-95"
            >
              <ChevronLeft className="w-6 h-6 stroke-[3]" />
            </button>

            {/* Parts Track Bar Display */}
            <div className="flex-1 min-w-[160px] max-w-[240px] px-3 flex items-center justify-between">
              <span className="text-xs font-black text-slate-400">1</span>
              <div className="flex-1 mx-3 h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-200"
                  style={{ width: `${(partsCount / 12) * 100}%` }}
                />
              </div>
              <span className="text-xs font-black text-slate-400">12</span>
            </div>

            {/* Increase Parts Button */}
            <button
              onClick={() => handlePartsChange(1)}
              disabled={partsCount >= 12 || isFlightAnimating}
              className="w-10 h-10 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-amber-950 rounded-full flex items-center justify-center font-black text-lg transition shadow cursor-pointer active:scale-95"
            >
              <ChevronRight className="w-6 h-6 stroke-[3]" />
            </button>
          </div>
        </div>

        {/* Position / Numerator Selector */}
        <div className="flex flex-col gap-1.5 w-full md:w-auto">
          <label className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <span>2. Position Marker (Numerator):</span>
            <span className="text-amber-400 font-bold">Tick = {selectedTick}/{partsCount}</span>
          </label>

          <div className="flex items-center gap-1.5 overflow-x-auto max-w-xs sm:max-w-md py-1 scrollbar-none">
            {[...Array(partsCount + 1)].map((_, idx) => (
              <button
                key={idx}
                onClick={() => handleTickClick(idx)}
                disabled={isFlightAnimating}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer border ${
                  selectedTick === idx
                    ? 'bg-amber-500 border-amber-400 text-amber-950 shadow-md scale-105'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                {idx}/{partsCount}
              </button>
            ))}
          </div>
        </div>

        {/* "Check" / "Rescue" Action Button */}
        <div className="w-full md:w-auto flex justify-end">
          <button
            onClick={handleCheck}
            disabled={isFlightAnimating}
            className="w-full md:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-base uppercase tracking-wider rounded-full shadow-lg shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Check className="w-5 h-5 stroke-[3]" />
            Check Rescue
          </button>
        </div>
      </div>

      {/* Game Complete Modal Overlay */}
      {gameEnded && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-center shadow-2xl flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-3xl shadow-xl shadow-amber-500/20">
              🚁
            </div>

            <div>
              <h2 className="text-2xl font-black text-white">RESCUE MISSION COMPLETE!</h2>
              <p className="text-sm text-slate-400 mt-1">You navigated the fraction number lines like a pro!</p>
            </div>

            {isNewHighScore && (
              <div className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                NEW HIGH SCORE!
              </div>
            )}

            <div className="w-full bg-slate-950 rounded-xl p-4 border border-slate-800 flex justify-around">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Final Score</p>
                <p className="text-2xl font-black text-amber-400">{score}</p>
              </div>
              <div className="w-[1px] bg-slate-800" />
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Rounds Solved</p>
                <p className="text-2xl font-black text-emerald-400">{TOTAL_ROUNDS} / {TOTAL_ROUNDS}</p>
              </div>
            </div>

            {score >= 100 && (
              <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl w-full text-left">
                <div className="text-2xl">🚁</div>
                <div>
                  <p className="text-xs font-black text-amber-400">BADGE UNLOCKED!</p>
                  <p className="text-xs text-slate-200 font-bold">Fraction Rescue Pilot</p>
                </div>
              </div>
            )}

            <div className="flex gap-3 w-full mt-2">
              <button
                onClick={startNewGame}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Play Again
              </button>
              <button
                onClick={onBack}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition cursor-pointer"
              >
                Back to Hub
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
