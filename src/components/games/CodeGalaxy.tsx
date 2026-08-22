'use client';

import React, { useState } from 'react';
import { soundManager } from '@/lib/games/soundManager';
import { saveHighScore, unlockBadge } from '@/lib/games/badgeSystem';
import { ArrowLeft, Play, RotateCcw, Volume2, VolumeX, Sparkles, Trophy, Cpu, ArrowRight, ArrowUp, ArrowDown, Star } from 'lucide-react';

interface CodeGalaxyProps {
  onBack: () => void;
}

type Command = 'RIGHT' | 'UP' | 'DOWN';

interface Level {
  id: number;
  gridSize: number;
  start: { x: number; y: number };
  target: { x: number; y: number };
  starPos: { x: number; y: number };
}

const PROCEDURAL_LEVELS: Level[] = [
  { id: 1, gridSize: 4, start: { x: 0, y: 0 }, target: { x: 3, y: 0 }, starPos: { x: 1, y: 0 } },
  { id: 2, gridSize: 4, start: { x: 0, y: 0 }, target: { x: 2, y: 2 }, starPos: { x: 2, y: 0 } },
  { id: 3, gridSize: 5, start: { x: 0, y: 0 }, target: { x: 4, y: 3 }, starPos: { x: 2, y: 1 } },
  { id: 4, gridSize: 5, start: { x: 0, y: 1 }, target: { x: 4, y: 4 }, starPos: { x: 3, y: 2 } }
];

export default function CodeGalaxy({ onBack }: CodeGalaxyProps) {
  const [levelIdx, setLevelIdx] = useState(0);
  const [commands, setCommands] = useState<Command[]>([]);
  const [roverPos, setRoverPos] = useState({ x: 0, y: 0 });
  const [isRunning, setIsRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [starCollected, setStarCollected] = useState(false);
  const [levelSuccess, setLevelSuccess] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const currentLevel = PROCEDURAL_LEVELS[levelIdx % PROCEDURAL_LEVELS.length];

  const addCommand = (cmd: Command) => {
    if (isRunning || commands.length >= 8) return;
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
    let collected = false;

    for (let i = 0; i < commands.length; i++) {
      const cmd = commands[i];
      if (cmd === 'RIGHT') curX = Math.min(currentLevel.gridSize - 1, curX + 1);
      if (cmd === 'UP') curY = Math.max(0, curY - 1);
      if (cmd === 'DOWN') curY = Math.min(currentLevel.gridSize - 1, curY + 1);

      soundManager.playTone(400 + i * 50);
      setRoverPos({ x: curX, y: curY });

      if (curX === currentLevel.starPos.x && curY === currentLevel.starPos.y) {
        collected = true;
        setStarCollected(true);
      }

      await new Promise(res => setTimeout(res, 450));
    }

    if (curX === currentLevel.target.x && curY === currentLevel.target.y) {
      soundManager.playCorrect();
      soundManager.playVictory();
      const points = 30 + (collected ? 20 : 0);
      const newScore = score + points;
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
    const nextLvl = PROCEDURAL_LEVELS[nextIdx % PROCEDURAL_LEVELS.length];
    setRoverPos(nextLvl.start);
    setStarCollected(false);
    setLevelSuccess(false);
  };

  const resetRover = () => {
    setCommands([]);
    setRoverPos(currentLevel.start);
    setStarCollected(false);
    setLevelSuccess(false);
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
          <div className="flex items-center gap-2 bg-indigo-950 border border-indigo-600 px-3 py-1 rounded-none">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-black uppercase text-indigo-300">Code Galaxy Quest</span>
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

      {/* Stage */}
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
              const isStar = currentLevel.starPos.x === x && currentLevel.starPos.y === y && !starCollected;

              return (
                <div
                  key={idx}
                  className="w-14 h-14 bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl relative"
                >
                  {isRover && '🤖'}
                  {isTarget && !isRover && '🏁'}
                  {isStar && !isRover && '⭐'}
                </div>
              );
            })}
          </div>

          {levelSuccess && (
            <div className="bg-emerald-950 border border-emerald-500 p-4 text-center space-y-2 w-full max-w-xs">
              <Sparkles className="w-6 h-6 text-emerald-400 mx-auto" />
              <h4 className="text-sm font-black text-emerald-300 uppercase">Mission Accomplished!</h4>
              <button
                onClick={nextLevel}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase rounded-none border border-emerald-400 cursor-pointer"
              >
                NEXT LEVEL →
              </button>
            </div>
          )}
        </div>

        {/* Command Panel */}
        <div className="w-full md:w-72 bg-slate-900 border border-slate-800 p-5 space-y-4 shadow-lg">
          <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Command Sequence</h4>

          <div className="min-h-[120px] bg-slate-950 border border-slate-800 p-3 flex flex-wrap gap-2 content-start">
            {commands.length === 0 ? (
              <span className="text-[10px] text-slate-600 font-bold uppercase">Click buttons below to add code!</span>
            ) : (
              commands.map((cmd, i) => (
                <button
                  key={i}
                  onClick={() => removeCommand(i)}
                  className="px-2.5 py-1 bg-indigo-950 border border-indigo-600 text-indigo-300 text-xs font-black rounded-none cursor-pointer"
                >
                  {cmd === 'RIGHT' && '➡️ Right'}
                  {cmd === 'UP' && '⬆️ Up'}
                  {cmd === 'DOWN' && '⬇️ Down'}
                </button>
              ))
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => addCommand('UP')}
              disabled={isRunning}
              className="py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-black text-slate-200 cursor-pointer uppercase"
            >
              <ArrowUp className="w-4 h-4 mx-auto" />
            </button>
            <button
              onClick={() => addCommand('RIGHT')}
              disabled={isRunning}
              className="py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-black text-slate-200 cursor-pointer uppercase"
            >
              <ArrowRight className="w-4 h-4 mx-auto" />
            </button>
            <button
              onClick={() => addCommand('DOWN')}
              disabled={isRunning}
              className="py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-black text-slate-200 cursor-pointer uppercase"
            >
              <ArrowDown className="w-4 h-4 mx-auto" />
            </button>
          </div>

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
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
