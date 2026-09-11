'use client';

import React, { useState, useEffect } from 'react';
import { soundManager } from '@/lib/games/soundManager';
import { saveHighScore, unlockBadge } from '@/lib/games/badgeSystem';
import { ArrowLeft, RotateCcw, Volume2, VolumeX, Trophy, Star, Check, X, ArrowRight } from 'lucide-react';

interface FractionCarnivalProps {
  onBack: () => void;
}

export interface FractionProblem {
  id: string;
  numerator: number;
  denominator: number;
  options: FractionOption[];
  correctIndex: number;
}

export interface FractionOption {
  id: number;
  numerator: number;
  denominator: number;
  shapeType: 'circle' | 'square' | 'bar' | 'triangle';
}

// SVG Fraction Renderers
const ORANGE = '#f97316';
const STROKE_COLOR = '#ea580c';

const FractionCircle: React.FC<{ numerator: number; denominator: number }> = ({ numerator, denominator }) => {
  const size = 100;
  const radius = 42;
  const cx = size / 2;
  const cy = size / 2;

  // Render pie slices
  const slices = [];
  const anglePerSlice = (2 * Math.PI) / denominator;

  for (let i = 0; i < denominator; i++) {
    const startAngle = i * anglePerSlice - Math.PI / 2;
    const endAngle = (i + 1) * anglePerSlice - Math.PI / 2;

    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);

    const isShaded = i < numerator;
    const largeArcFlag = anglePerSlice > Math.PI ? 1 : 0;

    const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

    slices.push(
      <path
        key={i}
        d={pathData}
        fill={isShaded ? ORANGE : '#ffffff'}
        stroke={STROKE_COLOR}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    );
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-md">
      <circle cx={cx} cy={cy} r={radius} fill="#ffffff" stroke={STROKE_COLOR} strokeWidth="3" />
      {slices}
    </svg>
  );
};

const FractionSquare: React.FC<{ numerator: number; denominator: number }> = ({ numerator, denominator }) => {
  const size = 100;
  const padding = 12;
  const side = size - padding * 2;
  const colWidth = side / denominator;

  const rects = [];
  for (let i = 0; i < denominator; i++) {
    const isShaded = i < numerator;
    rects.push(
      <rect
        key={i}
        x={padding + i * colWidth}
        y={padding}
        width={colWidth}
        height={side}
        fill={isShaded ? ORANGE : '#ffffff'}
        stroke={STROKE_COLOR}
        strokeWidth="2.5"
      />
    );
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-md">
      <rect x={padding} y={padding} width={side} height={side} fill="#ffffff" stroke={STROKE_COLOR} strokeWidth="3" rx="2" />
      {rects}
    </svg>
  );
};

const FractionBar: React.FC<{ numerator: number; denominator: number }> = ({ numerator, denominator }) => {
  const width = 60;
  const height = 100;
  const paddingX = 12;
  const paddingY = 10;
  const barWidth = width - paddingX * 2;
  const barHeight = height - paddingY * 2;
  const rowHeight = barHeight / denominator;

  const rows = [];
  for (let i = 0; i < denominator; i++) {
    // Shade from middle or top
    const isShaded = i >= Math.floor((denominator - numerator) / 2) && i < Math.floor((denominator - numerator) / 2) + numerator;
    rows.push(
      <rect
        key={i}
        x={paddingX}
        y={paddingY + i * rowHeight}
        width={barWidth}
        height={rowHeight}
        fill={isShaded ? ORANGE : '#ffffff'}
        stroke={STROKE_COLOR}
        strokeWidth="2.5"
      />
    );
  }

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="drop-shadow-md">
      <rect x={paddingX} y={paddingY} width={barWidth} height={barHeight} fill="#ffffff" stroke={STROKE_COLOR} strokeWidth="3" rx="2" />
      {rows}
    </svg>
  );
};

const FractionTriangle: React.FC<{ numerator: number; denominator: number }> = ({ numerator, denominator }) => {
  const width = 100;
  const height = 100;

  // Split triangle into denominator vertical slices from top vertex to base
  const topX = 50;
  const topY = 12;
  const leftBaseX = 12;
  const baseLineY = 88;
  const rightBaseX = 88;
  const baseWidth = rightBaseX - leftBaseX;

  const slices = [];
  for (let i = 0; i < denominator; i++) {
    const xBaseStart = leftBaseX + (i / denominator) * baseWidth;
    const xBaseEnd = leftBaseX + ((i + 1) / denominator) * baseWidth;
    const isShaded = i < numerator;

    const pathData = `M ${topX} ${topY} L ${xBaseEnd} ${baseLineY} L ${xBaseStart} ${baseLineY} Z`;

    slices.push(
      <path
        key={i}
        d={pathData}
        fill={isShaded ? ORANGE : '#ffffff'}
        stroke={STROKE_COLOR}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    );
  }

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="drop-shadow-md">
      <path
        d={`M ${topX} ${topY} L ${rightBaseX} ${baseLineY} L ${leftBaseX} ${baseLineY} Z`}
        fill="#ffffff"
        stroke={STROKE_COLOR}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {slices}
    </svg>
  );
};

// Shape Renderer Switcher
const ShapeRenderer: React.FC<{ option: FractionOption }> = ({ option }) => {
  switch (option.shapeType) {
    case 'circle':
      return <FractionCircle numerator={option.numerator} denominator={option.denominator} />;
    case 'square':
      return <FractionSquare numerator={option.numerator} denominator={option.denominator} />;
    case 'bar':
      return <FractionBar numerator={option.numerator} denominator={option.denominator} />;
    case 'triangle':
      return <FractionTriangle numerator={option.numerator} denominator={option.denominator} />;
    default:
      return <FractionCircle numerator={option.numerator} denominator={option.denominator} />;
  }
};

// Questions Generator
function generateCarnivalQuestions(count = 5): FractionProblem[] {
  const fractionPool: Array<{ n: number; d: number }> = [
    { n: 1, d: 4 },
    { n: 1, d: 2 },
    { n: 1, d: 3 },
    { n: 2, d: 3 },
    { n: 3, d: 4 },
    { n: 2, d: 5 },
    { n: 3, d: 5 },
    { n: 1, d: 6 },
    { n: 5, d: 6 },
    { n: 3, d: 8 }
  ];

  const shapeTypes: Array<'circle' | 'square' | 'bar' | 'triangle'> = ['circle', 'square', 'bar', 'triangle'];

  // Shuffle fraction pool
  const shuffledFractions = [...fractionPool].sort(() => Math.random() - 0.5);

  return shuffledFractions.slice(0, count).map((target, qIndex) => {
    const correctVal = target.n / target.d;

    // Pick 3 distinct distractor fractions
    const distractors: Array<{ n: number; d: number }> = [];
    const poolWithoutTarget = fractionPool.filter(f => f.n / f.d !== correctVal);
    const shuffledDistractors = [...poolWithoutTarget].sort(() => Math.random() - 0.5);

    for (let i = 0; i < 3; i++) {
      distractors.push(shuffledDistractors[i]);
    }

    // Combine and shuffle correct + distractors
    const allFractionOptions = [target, ...distractors].sort(() => Math.random() - 0.5);
    const correctIndex = allFractionOptions.findIndex(f => f.n === target.n && f.d === target.d);

    // Assign different shapes
    const shuffledShapes = [...shapeTypes].sort(() => Math.random() - 0.5);

    const options: FractionOption[] = allFractionOptions.map((f, idx) => ({
      id: idx,
      numerator: f.n,
      denominator: f.d,
      shapeType: shuffledShapes[idx]
    }));

    return {
      id: `q_${qIndex}_${Date.now()}`,
      numerator: target.n,
      denominator: target.d,
      options,
      correctIndex
    };
  });
}

export default function FractionCarnival({ onBack }: FractionCarnivalProps) {
  const [questions, setQuestions] = useState<FractionProblem[]>([]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [totalStars, setTotalStars] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const [isMuted, setIsMuted] = useState(false);
  const TOTAL_ROUNDS = 5;

  useEffect(() => {
    startNewGame();
    setIsMuted(soundManager.getMuted());
  }, []);

  const startNewGame = () => {
    const newQuestions = generateCarnivalQuestions(TOTAL_ROUNDS);
    setQuestions(newQuestions);
    setCurrentRoundIndex(0);
    setSelectedOptionIndex(null);
    setIsAnswered(false);
    setScore(0);
    setStreak(0);
    setTotalStars(0);
    setIsGameOver(false);
  };

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const currentQuestion = questions[currentRoundIndex];

  const handleSelectOption = (index: number) => {
    if (isAnswered || !currentQuestion) return;

    setSelectedOptionIndex(index);
    setIsAnswered(true);

    const isRight = index === currentQuestion.correctIndex;

    if (isRight) {
      soundManager.playCorrect();
      const points = 20 + streak * 5;
      const newScore = score + points;
      const newStreak = streak + 1;
      setScore(newScore);
      setStreak(newStreak);
      setTotalStars(prev => prev + 1);
    } else {
      soundManager.playWrong();
      setStreak(0);
    }
  };

  const handleNextRound = () => {
    soundManager.playFlip();

    if (currentRoundIndex + 1 >= TOTAL_ROUNDS) {
      // Game finished
      soundManager.playVictory();
      saveHighScore('fraction_carnival', score);
      if (score >= 100) {
        unlockBadge('fraction_master');
      }
      setIsGameOver(true);
    } else {
      setCurrentRoundIndex(prev => prev + 1);
      setSelectedOptionIndex(null);
      setIsAnswered(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center select-none font-sans pb-6">
      {/* Top Header Controls */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Hub
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">🎪</span>
            <div>
              <h1 className="text-sm font-black tracking-wider text-amber-400 uppercase">Fraction Carnival</h1>
              <p className="text-[11px] text-slate-400 font-semibold">Carnival Fraction Matcher</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-black text-amber-300">{score}</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase">pts</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-black text-yellow-300">{totalStars}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleMute}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
            <button
              onClick={startNewGame}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
              title="Restart Game"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {!isGameOver && currentQuestion ? (
        /* Main Carnival Booth Stage */
        <div className="w-full relative rounded-3xl overflow-hidden border-4 border-slate-800 bg-slate-950 shadow-2xl">
          {/* Booth Roof & Progress Indicator Marquee */}
          <div className="w-full bg-gradient-to-b from-blue-950 via-slate-900 to-slate-950 border-b border-blue-900/50 pt-5 pb-4 px-6 flex flex-col items-center relative">
            {/* Top Weathervane / Arrow icon */}
            <div className="flex items-center justify-center gap-1 text-slate-400 mb-3">
              <span className="text-slate-500 text-xs font-bold tracking-widest uppercase">🎪 CARNIVAL STALL</span>
            </div>

            {/* Roof Progress Indicator Lights (5 Dots) */}
            <div className="flex items-center gap-3 mb-4 bg-slate-950/80 px-5 py-2 rounded-full border border-slate-800 shadow-inner">
              {Array.from({ length: TOTAL_ROUNDS }).map((_, idx) => {
                const isCompleted = idx < currentRoundIndex;
                const isCurrent = idx === currentRoundIndex;
                return (
                  <div
                    key={idx}
                    className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${isCompleted
                        ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.6)]'
                        : isCurrent
                          ? 'bg-blue-500 ring-2 ring-blue-300 animate-pulse'
                          : 'bg-slate-800 border border-slate-700'
                      }`}
                  >
                    {isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                );
              })}
            </div>

            {/* Instructional Banner */}
            <div className="bg-slate-900/90 border border-blue-800/40 rounded-xl px-6 py-2.5 shadow-md max-w-xl text-center">
              <p className="text-sm md:text-base font-semibold text-slate-100 tracking-wide">
                Identify the shape in which the shaded part shows the fraction.
              </p>
            </div>

            {/* Roof Scallop Edge Decorative Trim */}
            <div className="absolute -bottom-2 left-0 right-0 flex justify-between overflow-hidden opacity-30 pointer-events-none">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="w-6 h-4 bg-blue-900 rounded-b-full border-t border-blue-700 -mx-1" />
              ))}
            </div>
          </div>

          {/* Booth Interior Background Scene */}
          <div className="w-full relative bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 p-6 md:p-10 min-h-[380px] flex flex-col justify-between items-center">
            {/* Hanging Visual Fraction Options (4 Strings) */}
            <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 pt-2 z-10">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedOptionIndex === index;
                const isRightAnswer = index === currentQuestion.correctIndex;

                let borderStyle = 'border-slate-700/60 hover:border-amber-400/80 bg-slate-900/80';
                if (isAnswered) {
                  if (isRightAnswer) {
                    borderStyle = 'border-emerald-400 bg-emerald-950/60 ring-4 ring-emerald-500/40 scale-105 shadow-[0_0_20px_rgba(16,185,129,0.4)]';
                  } else if (isSelected) {
                    borderStyle = 'border-rose-500 bg-rose-950/60 ring-4 ring-rose-500/30 scale-95 opacity-80';
                  } else {
                    borderStyle = 'border-slate-800 bg-slate-950/40 opacity-40';
                  }
                }

                return (
                  <div key={option.id} className="flex flex-col items-center relative group">
                    {/* Vertical Suspended String */}
                    <div className="w-0.5 h-10 bg-slate-500/60 group-hover:bg-amber-400/60 transition-colors" />

                    {/* Hanging Option Card */}
                    <button
                      onClick={() => handleSelectOption(index)}
                      disabled={isAnswered}
                      className={`w-full flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${borderStyle} ${!isAnswered ? 'hover:-translate-y-1 shadow-lg hover:shadow-amber-500/10' : ''
                        }`}
                    >
                      <div className="p-2 flex items-center justify-center">
                        <ShapeRenderer option={option} />
                      </div>

                      {/* Answer Feedback Indicator Badge */}
                      {isAnswered && isRightAnswer && (
                        <div className="mt-2 flex items-center gap-1 text-emerald-400 font-bold text-xs bg-emerald-950/90 px-2.5 py-0.5 rounded-full border border-emerald-500">
                          <Check className="w-3.5 h-3.5" /> Correct!
                        </div>
                      )}
                      {isAnswered && isSelected && !isRightAnswer && (
                        <div className="mt-2 flex items-center gap-1 text-rose-400 font-bold text-xs bg-rose-950/90 px-2.5 py-0.5 rounded-full border border-rose-500">
                          <X className="w-3.5 h-3.5" /> Try Again
                        </div>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Bottom Display Counter Bar */}
            <div className="w-full mt-8 pt-4 flex flex-col md:flex-row items-center justify-between gap-4 z-10">
              {/* Spacer left */}
              <div className="hidden md:block w-32" />

              {/* Central Riveted Target Fraction Display Card */}
              <div className="relative bg-slate-900 border-4 border-blue-500/60 rounded-2xl p-5 shadow-[0_0_25px_rgba(59,130,246,0.3)] flex flex-col items-center justify-center min-w-[130px]">
                {/* 4 Rivet Corner Dots */}
                <div className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-slate-500 border border-slate-700" />
                <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-slate-500 border border-slate-700" />
                <div className="absolute bottom-1.5 left-1.5 w-2 h-2 rounded-full bg-slate-500 border border-slate-700" />
                <div className="absolute bottom-1.5 right-1.5 w-2 h-2 rounded-full bg-slate-500 border border-slate-700" />

                {/* Fraction Display Box */}
                <div className="bg-white rounded-xl px-7 py-3 border-2 border-blue-400 text-slate-950 flex flex-col items-center justify-center shadow-inner">
                  <span className="text-3xl font-black leading-none tracking-tight">{currentQuestion.numerator}</span>
                  <div className="w-9 h-1 bg-slate-950 my-1 rounded-full" />
                  <span className="text-3xl font-black leading-none tracking-tight">{currentQuestion.denominator}</span>
                </div>
              </div>

              {/* Right Next Button */}
              <div className="w-full md:w-32 flex justify-end">
                {isAnswered && (
                  <button
                    onClick={handleNextRound}
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm uppercase tracking-wider rounded-full shadow-lg hover:shadow-amber-500/40 transition cursor-pointer animate-pulse"
                  >
                    Next <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Game Over Score Summary Modal */
        <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl max-w-lg">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-3xl mb-4">
            🏆
          </div>

          <h2 className="text-2xl font-black text-white mb-1">Carnival Master!</h2>
          <p className="text-xs text-slate-400 mb-6 font-semibold">You completed all fraction challenges in the booth!</p>

          <div className="w-full grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Final Score</p>
              <p className="text-2xl font-black text-amber-400 mt-1">{score} pts</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Stars Earned</p>
              <p className="text-2xl font-black text-yellow-400 mt-1 flex items-center justify-center gap-1">
                <Star className="w-5 h-5 fill-yellow-400" /> {totalStars}
              </p>
            </div>
          </div>

          {score >= 100 && (
            <div className="w-full bg-amber-950/40 border border-amber-500/40 rounded-2xl p-3.5 mb-6 flex items-center gap-3 text-left">
              <span className="text-2xl">🎪</span>
              <div>
                <p className="text-xs font-black text-amber-300">Badge Unlocked: Fraction Master!</p>
                <p className="text-[11px] text-amber-200/80">Scored 100+ points matching carnival fraction shapes.</p>
              </div>
            </div>
          )}

          <div className="w-full flex items-center gap-3">
            <button
              onClick={startNewGame}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Play Again
            </button>
            <button
              onClick={onBack}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
            >
              Back to Hub
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
