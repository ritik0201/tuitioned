'use client';

import React, { useState, useEffect } from 'react';
import { soundManager } from '@/lib/games/soundManager';
import { saveHighScore, unlockBadge } from '@/lib/games/badgeSystem';
import { ArrowLeft, RotateCcw, Volume2, VolumeX, Sparkles, Trophy, Star, RefreshCw } from 'lucide-react';

interface ConstellationConnectProps {
  onBack: () => void;
}

interface StarNode {
  id: number;
  x: number; // percentage
  y: number; // percentage
  noteFreq: number;
}

interface Constellation {
  id: string;
  name: string;
  description: string;
  symbol: string;
  nodes: StarNode[];
}

const CONSTELLATIONS_LIBRARY: Omit<Constellation, 'nodes'>[] = [
  { id: 'ursa_major', name: 'Ursa Major (Big Dipper)', description: 'The giant cosmic ladle of the northern night sky!', symbol: '🌌' },
  { id: 'orion', name: 'Orion the Hunter', description: 'Famous constellation carrying the Belt of Stars!', symbol: '🏹' },
  { id: 'cassiopeia', name: 'Cassiopeia the Queen', description: 'Resembles a giant W shining in deep space!', symbol: '👑' },
  { id: 'cygnus', name: 'Cygnus the Northern Cross', description: 'The majestic stellar swan floating in space!', symbol: '🦅' },
  { id: 'pegasus', name: 'Pegasus the Winged Horse', description: 'Four bright stars creating the Great Square!', symbol: '🐴' }
];

const NOTE_FREQS = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50];

function generateProceduralNodes(count: number): StarNode[] {
  const nodes: StarNode[] = [];
  const padding = 15;
  
  for (let i = 1; i <= count; i++) {
    const x = Math.floor(Math.random() * (100 - padding * 2)) + padding;
    const y = Math.floor(Math.random() * (100 - padding * 2)) + padding;
    const noteFreq = NOTE_FREQS[(i - 1) % NOTE_FREQS.length];
    nodes.push({ id: i, x, y, noteFreq });
  }

  return nodes;
}

type DifficultyMode = 'easy' | 'medium' | 'high';

export default function ConstellationConnect({ onBack }: ConstellationConnectProps) {
  const [diffMode, setDiffMode] = useState<DifficultyMode>('easy');
  const [constellation, setConstellation] = useState<Constellation | null>(null);
  const [nextExpectedId, setNextExpectedId] = useState(1);
  const [connectedNodes, setConnectedNodes] = useState<StarNode[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [score, setScore] = useState(0);
  const [isConstellationDone, setIsConstellationDone] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Generate procedurally random constellation
  const initProceduralConstellation = (overrideDiff?: DifficultyMode) => {
    const activeDiff = overrideDiff || diffMode;
    const nodeCount = activeDiff === 'easy' ? 4 : activeDiff === 'medium' ? 7 : 10;
    const baseInfo = CONSTELLATIONS_LIBRARY[Math.floor(Math.random() * CONSTELLATIONS_LIBRARY.length)];
    const generatedNodes = generateProceduralNodes(nodeCount);

    setConstellation({
      ...baseInfo,
      name: `${baseInfo.name} #${Math.floor(Math.random() * 80) + 10}`,
      nodes: generatedNodes
    });
    setNextExpectedId(1);
    setConnectedNodes([]);
    setIsConstellationDone(false);
  };

  const changeDifficulty = (mode: DifficultyMode) => {
    soundManager.playPop();
    setDiffMode(mode);
    initProceduralConstellation(mode);
  };

  useEffect(() => {
    initProceduralConstellation();
  }, []);

  const handleStarClick = (node: StarNode) => {
    if (isConstellationDone || !constellation) return;

    if (node.id === nextExpectedId) {
      soundManager.playTone(node.noteFreq);
      soundManager.playPop();

      const newConnected = [...connectedNodes, node];
      setConnectedNodes(newConnected);
      setNextExpectedId(prev => prev + 1);

      if (newConnected.length === constellation.nodes.length) {
        soundManager.playCorrect();
        soundManager.playVictory();

        setIsConstellationDone(true);
        const points = diffMode === 'easy' ? 30 : diffMode === 'medium' ? 50 : 80;
        const newScore = score + points;
        const newCompleted = completedCount + 1;

        setScore(newScore);
        setCompletedCount(newCompleted);
        saveHighScore('constellation', newScore);

        if (newCompleted >= 3) {
          unlockBadge('star_tracer');
        }
      }
    } else {
      soundManager.playWrong();
    }
  };

  const toggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 text-white font-sans select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between px-6 py-4 bg-slate-800/80 backdrop-blur-md border-b border-slate-700 gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 transition text-sm font-semibold cursor-pointer border border-slate-600"
          >
            <ArrowLeft className="w-4 h-4" /> Hub
          </button>
          <div className="flex items-center gap-2 bg-cyan-900/40 border border-cyan-500/30 px-3 py-1 rounded-xl">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-bold text-cyan-200">Constellation Connect 🌌</span>
          </div>

          <div className="flex items-center bg-slate-900 border border-slate-700 p-0.5 rounded-xl">
            {(['easy', 'medium', 'high'] as DifficultyMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => changeDifficulty(mode)}
                className={`px-2 py-1 text-[10px] font-black uppercase tracking-wider transition cursor-pointer ${
                  diffMode === mode
                    ? mode === 'easy'
                      ? 'bg-emerald-600 text-white'
                      : mode === 'medium'
                      ? 'bg-cyan-600 text-white'
                      : 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => initProceduralConstellation()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600/60 hover:bg-cyan-500 text-xs font-bold text-cyan-200 border border-cyan-400/30 transition cursor-pointer"
            title="Generate Random Constellation"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Random Sky Map
          </button>

          <div className="text-center">
            <span className="text-xs text-slate-400 block uppercase tracking-wider">Score</span>
            <span className="text-xl font-extrabold text-cyan-400">{score}</span>
          </div>

          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 transition cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Sky Canvas Container */}
      <div className="relative min-h-[380px] sm:min-h-[420px] p-4 sm:p-5 flex flex-col items-center justify-between bg-gradient-to-b from-slate-950 via-slate-900 to-blue-950 overflow-hidden">
        {constellation && (
          <div className="bg-slate-800/90 border border-cyan-500/40 rounded-2xl px-6 py-3 text-center shadow-lg backdrop-blur-md">
            <h3 className="text-lg font-black text-white flex items-center justify-center gap-2">
              <span>{constellation.symbol}</span> {constellation.name}
            </h3>
            <p className="text-xs text-cyan-300 font-medium">{constellation.description}</p>
            <span className="text-[10px] text-slate-400 mt-1 block uppercase tracking-widest">
              Connect stars in numerical sequence: Node #{nextExpectedId}
            </span>
          </div>
        )}

        {/* Star Field */}
        <div className="relative w-full max-w-xl h-80 my-4 bg-slate-950/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {connectedNodes.map((node, idx) => {
              if (idx === 0) return null;
              const prev = connectedNodes[idx - 1];
              return (
                <line
                  key={idx}
                  x1={`${prev.x}%`}
                  y1={`${prev.y}%`}
                  x2={`${node.x}%`}
                  y2={`${node.y}%`}
                  stroke="#38bdf8"
                  strokeWidth="3"
                  strokeDasharray="4 4"
                  className="animate-pulse"
                />
              );
            })}
          </svg>

          {constellation?.nodes.map(node => {
            const isConnected = connectedNodes.some(n => n.id === node.id);
            const isNext = node.id === nextExpectedId;

            return (
              <button
                key={node.id}
                onClick={() => handleStarClick(node)}
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center font-black text-sm transition-all transform z-10 cursor-pointer shadow-lg border-2 ${
                  isConnected
                    ? 'bg-cyan-500 border-cyan-300 text-white scale-110 shadow-cyan-500/50'
                    : isNext
                    ? 'bg-amber-500 border-white text-white animate-bounce scale-125 shadow-amber-500/80'
                    : 'bg-slate-800 border-slate-600 text-slate-400 hover:scale-105'
                }`}
              >
                {isConnected ? '⭐' : node.id}
              </button>
            );
          })}
        </div>

        {isConstellationDone && (
          <div className="animate-in fade-in zoom-in duration-300 flex flex-col items-center gap-3">
            <div className="text-emerald-400 font-extrabold text-lg flex items-center gap-2">
              <Star className="w-5 h-5 fill-emerald-400" /> Star Map Unlocked!
            </div>
            <button
              onClick={() => initProceduralConstellation()}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-bold text-white shadow-xl transition transform hover:scale-105 cursor-pointer"
            >
              Generate Next Procedural Star Map 🌌
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
