'use client';

import React, { useState } from 'react';
import { soundManager } from '@/lib/games/soundManager';
import { saveHighScore, unlockBadge } from '@/lib/games/badgeSystem';
import { ArrowLeft, Play, RotateCcw, Volume2, VolumeX, Sparkles, Trophy, Cpu, ArrowRight, ArrowUp, ArrowDown, Star } from 'lucide-react';

interface CodeGalaxyProps {
  onBack: () => void;
}

type Command = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

interface Collectible {
  id: string;
  icon: string;
  name: string;
  points: number;
  x: number;
  y: number;
}

interface Level {
  id: number;
  gridSize: number;
  start: { x: number; y: number };
  target: { x: number; y: number };
  collectibles: Collectible[];
}

type DifficultyMode = 'easy' | 'medium' | 'high';

const COLLECTIBLE_TYPES = [
  { icon: '⭐', name: 'Cosmic Star', points: 20 },
  { icon: '💎', name: 'Space Crystal', points: 25 },
  { icon: '⚡', name: 'Energy Core', points: 30 },
  { icon: '🔮', name: 'Quantum Orb', points: 35 },
  { icon: '🛸', name: 'Alien Relic', points: 40 },
  { icon: '👑', name: 'Stellar Crown', points: 50 }
];

function generateProceduralLevel(levelIdx: number, diffMode: DifficultyMode): Level {
  const gridSize = diffMode === 'easy' ? 4 : diffMode === 'medium' ? 5 : 6;
  const start = { x: 0, y: Math.floor(Math.random() * gridSize) };
  
  let targetY = Math.floor(Math.random() * gridSize);
  while (targetY === start.y && gridSize > 3) {
    targetY = Math.floor(Math.random() * gridSize);
  }
  const target = { x: gridSize - 1, y: targetY };

  const count = diffMode === 'easy' ? 2 : diffMode === 'medium' ? 3 : 4;
  const collectibles: Collectible[] = [];
  const usedCoords = new Set<string>([`${start.x},${start.y}`, `${target.x},${target.y}`]);

  for (let i = 0; i < count; i++) {
    let cx = Math.floor(Math.random() * gridSize);
    let cy = Math.floor(Math.random() * gridSize);
    let key = `${cx},${cy}`;
    
    let attempts = 0;
    while (usedCoords.has(key) && attempts < 20) {
      cx = Math.floor(Math.random() * gridSize);
      cy = Math.floor(Math.random() * gridSize);
      key = `${cx},${cy}`;
      attempts++;
    }

    if (!usedCoords.has(key)) {
      usedCoords.add(key);
      const itemInfo = COLLECTIBLE_TYPES[i % COLLECTIBLE_TYPES.length];
      collectibles.push({
        id: `c_${levelIdx}_${i}_${Date.now()}`,
        icon: itemInfo.icon,
        name: itemInfo.name,
        points: itemInfo.points,
        x: cx,
        y: cy
      });
    }
  }

  return {
    id: levelIdx + 1,
    gridSize,
    start,
    target,
    collectibles
  };
}

export default function CodeGalaxy({ onBack }: CodeGalaxyProps) {
  const [diffMode, setDiffMode] = useState<DifficultyMode>('medium');
  const [levelIdx, setLevelIdx] = useState(0);
  const [currentLevel, setCurrentLevel] = useState<Level>(() => generateProceduralLevel(0, 'medium'));
  const [commands, setCommands] = useState<Command[]>([]);
  const [roverPos, setRoverPos] = useState(currentLevel.start);
  const [collectedIds, setCollectedIds] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [levelSuccess, setLevelSuccess] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const maxCmds = diffMode === 'easy' ? 10 : diffMode === 'medium' ? 12 : 15;

  const changeDifficulty = (mode: DifficultyMode) => {
    soundManager.playPop();
    setDiffMode(mode);
    setLevelIdx(0);
    const newLvl = generateProceduralLevel(0, mode);
    setCurrentLevel(newLvl);
    setRoverPos(newLvl.start);
    setCommands([]);
    setScore(0);
    setCollectedIds([]);
    setLevelSuccess(false);
  };

  const addCommand = (cmd: Command) => {
    if (isRunning || commands.length >= maxCmds) return;
    soundManager.playPop();
    setCommands([...commands, cmd]);
  };

  const removeCommand = (index: number) => {
    if (isRunning) return;
    soundManager.playPop();
    setCommands(commands.filter((_, i) => i !== index));
  };

  const runCode = async () => {
    if (commands.length === 0 || isRunning) return;
    setIsRunning(true);

    let curX = currentLevel.start.x;
    let curY = currentLevel.start.y;
    const collectedSet = new Set<string>();

    for (let i = 0; i < commands.length; i++) {
      const cmd = commands[i];
      if (cmd === 'RIGHT') curX = Math.min(currentLevel.gridSize - 1, curX + 1);
      if (cmd === 'LEFT') curX = Math.max(0, curX - 1);
      if (cmd === 'UP') curY = Math.max(0, curY - 1);
      if (cmd === 'DOWN') curY = Math.min(currentLevel.gridSize - 1, curY + 1);

      soundManager.playTone(400 + i * 40);
      setRoverPos({ x: curX, y: curY });

      // Check item collection at current rover position
      currentLevel.collectibles.forEach(item => {
        if (item.x === curX && item.y === curY && !collectedSet.has(item.id)) {
          collectedSet.add(item.id);
          soundManager.playTone(650 + collectedSet.size * 80);
          setCollectedIds(Array.from(collectedSet));
        }
      });

      await new Promise(res => setTimeout(res, 400));
    }

    if (curX === currentLevel.target.x && curY === currentLevel.target.y) {
      soundManager.playCorrect();
      soundManager.playVictory();

      // Compute total collected points
      const collectedPoints = currentLevel.collectibles
        .filter(c => collectedSet.has(c.id))
        .reduce((sum, c) => sum + c.points, 0);

      const levelCompletionBonus = 30;
      const totalEarned = levelCompletionBonus + collectedPoints;
      const newScore = score + totalEarned;
      
      setScore(newScore);
      setLevelSuccess(true);

      saveHighScore('code_galaxy', newScore);
      if (levelIdx + 1 >= 3) {
        unlockBadge('code_explorer');
      }
    } else {
      soundManager.playWrong();
    }

    setIsRunning(false);
  };

  const nextLevel = () => {
    const nextIdx = levelIdx + 1;
    setLevelIdx(nextIdx);
    setCommands([]);
    const nextLvl = generateProceduralLevel(nextIdx, diffMode);
    setCurrentLevel(nextLvl);
    setRoverPos(nextLvl.start);
    setCollectedIds([]);
    setLevelSuccess(false);
  };

  const resetRover = () => {
    setCommands([]);
    setRoverPos(currentLevel.start);
    setCollectedIds([]);
    setLevelSuccess(false);
  };

  const toggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto bg-slate-900 rounded-none overflow-hidden border border-slate-800 text-white font-sans select-none shadow-xl">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-none bg-slate-800 hover:bg-slate-700 transition text-xs font-black cursor-pointer border border-slate-700"
          >
            <ArrowLeft className="w-4 h-4" /> HUB
          </button>
          <div className="flex items-center gap-2 bg-indigo-950 border border-indigo-600 px-3 py-1 rounded-none">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-black uppercase text-indigo-300">Code Galaxy Quest</span>
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
                      ? 'bg-indigo-600 text-white'
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
            <span className="text-[10px] text-slate-500 uppercase font-black block">Level</span>
            <span className="text-lg font-black text-indigo-400">Lvl {levelIdx + 1}</span>
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

      {/* Stage Area */}
      <div className="relative min-h-[380px] sm:min-h-[420px] p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-950">
        {/* Grid World */}
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <div
            className="grid gap-2 bg-slate-900 border border-slate-800 p-4 shadow-xl"
            style={{
              gridTemplateColumns: `repeat(${currentLevel.gridSize}, minmax(0, 1fr))`
            }}
          >
            {Array.from({ length: currentLevel.gridSize * currentLevel.gridSize }).map((_, idx) => {
              const x = idx % currentLevel.gridSize;
              const y = Math.floor(idx / currentLevel.gridSize);
              const isRover = roverPos.x === x && roverPos.y === y;
              const isTarget = currentLevel.target.x === x && currentLevel.target.y === y;

              // Find collectible at this grid cell
              const collectible = currentLevel.collectibles.find(c => c.x === x && c.y === y);
              const isItemUncollected = collectible && !collectedIds.includes(collectible.id);

              return (
                <div
                  key={idx}
                  className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl relative"
                >
                  {isRover && '🤖'}
                  {isTarget && !isRover && '🏁'}
                  {isItemUncollected && !isRover && (
                    <span className="animate-pulse duration-700">{collectible.icon}</span>
                  )}
                </div>
              );
            })}
          </div>

          {levelSuccess && (
            <div className="bg-emerald-950 border border-emerald-500 p-4 text-center space-y-2 w-full max-w-xs">
              <Sparkles className="w-6 h-6 text-emerald-400 mx-auto" />
              <h4 className="text-sm font-black text-emerald-300 uppercase">Mission Accomplished!</h4>
              <p className="text-xs text-emerald-200">
                Captured {collectedIds.length}/{currentLevel.collectibles.length} collectibles!
              </p>
              <button
                onClick={nextLevel}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase rounded-none border border-emerald-400 cursor-pointer"
              >
                NEXT LEVEL →
              </button>
            </div>
          )}
        </div>

        {/* Command & Collectibles Panel */}
        <div className="w-full md:w-72 bg-slate-900 border border-slate-800 p-5 space-y-4 shadow-lg">
          {/* Collectibles HUD */}
          <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-none space-y-1">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400">
              <span>Collectibles</span>
              <span className="text-indigo-400">({collectedIds.length}/{currentLevel.collectibles.length})</span>
            </div>
            <div className="flex gap-2 text-xl flex-wrap">
              {currentLevel.collectibles.map(item => {
                const isCollected = collectedIds.includes(item.id);
                return (
                  <span
                    key={item.id}
                    title={`${item.name} (+${item.points} pts)`}
                    className={`transition-all ${isCollected ? 'opacity-100 scale-110' : 'opacity-30 grayscale'}`}
                  >
                    {item.icon}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Command Sequence</h4>
            <span className="text-[10px] font-black text-indigo-400">({commands.length}/{maxCmds})</span>
          </div>

          {/* Command Sequence Display */}
          <div className="min-h-[100px] bg-slate-950 border border-slate-800 p-3 flex flex-wrap gap-2 content-start">
            {commands.length === 0 ? (
              <span className="text-[10px] text-slate-600 font-bold uppercase">Click buttons below to add code!</span>
            ) : (
              commands.map((cmd, i) => (
                <button
                  key={i}
                  onClick={() => removeCommand(i)}
                  className="px-2.5 py-1 bg-indigo-950 border border-indigo-600 text-indigo-300 text-xs font-black rounded-none cursor-pointer"
                >
                  {cmd === 'UP' && '⬆️ Up'}
                  {cmd === 'DOWN' && '⬇️ Down'}
                  {cmd === 'LEFT' && '⬅️ Left'}
                  {cmd === 'RIGHT' && '➡️ Right'}
                </button>
              ))
            )}
          </div>

          {/* 4-Way Directional Pad */}
          <div className="grid grid-cols-4 gap-1.5">
            <button
              onClick={() => addCommand('UP')}
              disabled={isRunning}
              title="Add Up Command"
              className="py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-black text-slate-200 cursor-pointer uppercase flex items-center justify-center"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => addCommand('DOWN')}
              disabled={isRunning}
              title="Add Down Command"
              className="py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-black text-slate-200 cursor-pointer uppercase flex items-center justify-center"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
            <button
              onClick={() => addCommand('LEFT')}
              disabled={isRunning}
              title="Add Left Command"
              className="py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-black text-slate-200 cursor-pointer uppercase flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => addCommand('RIGHT')}
              disabled={isRunning}
              title="Add Right Command"
              className="py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-black text-slate-200 cursor-pointer uppercase flex items-center justify-center"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={runCode}
              disabled={isRunning || commands.length === 0}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider rounded-none border border-indigo-400 cursor-pointer flex items-center justify-center gap-1"
            >
              <Play className="w-3.5 h-3.5" /> RUN CODE
            </button>
            <button
              onClick={resetRover}
              className="px-3 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-xs uppercase rounded-none border border-slate-700 cursor-pointer"
              title="Reset Sequence"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
