'use client';

import React, { useEffect, useState } from 'react';
import { soundManager } from '@/lib/games/soundManager';
import { saveHighScore, unlockBadge } from '@/lib/games/badgeSystem';
import { ArrowLeft, RotateCcw, Volume2, VolumeX, Sparkles, Trophy, Star, RefreshCw } from 'lucide-react';

interface SpaceMemoryMatchProps {
  onBack: () => void;
}

interface CardItem {
  id: number;
  symbol: string;
  name: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const ALL_SPACE_SYMBOLS = [
  { symbol: '🚀', name: 'Rocket' },
  { symbol: '🪐', name: 'Saturn' },
  { symbol: '👾', name: 'Alien' },
  { symbol: '🌟', name: 'Star' },
  { symbol: '☄️', name: 'Comet' },
  { symbol: '🛰️', name: 'Satellite' },
  { symbol: '🧑‍🚀', name: 'Astronaut' },
  { symbol: '🌙', name: 'Moon' },
  { symbol: '☀️', name: 'Sun' },
  { symbol: '🛸', name: 'UFO' },
  { symbol: '🌌', name: 'Galaxy' },
  { symbol: '🔭', name: 'Telescope' },
  { symbol: '💥', name: 'Supernova' },
  { symbol: '🌠', name: 'Shooting Star' },
  { symbol: '⚡', name: 'Plasma' },
  { symbol: '🔮', name: 'Crystal' }
];

export default function SpaceMemoryMatch({ onBack }: SpaceMemoryMatchProps) {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [time, setTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [starsEarned, setStarsEarned] = useState(3);
  const [themeName, setThemeName] = useState('Cosmic Fleet');

  // Procedurally pick 6 random pairs out of 16 symbols every time!
  const initDeck = () => {
    const shuffledPool = [...ALL_SPACE_SYMBOLS].sort(() => Math.random() - 0.5);
    const selectedSix = shuffledPool.slice(0, 6);
    
    const deck: CardItem[] = [];
    const pairs = [...selectedSix, ...selectedSix];
    const shuffledPairs = pairs.sort(() => Math.random() - 0.5);

    shuffledPairs.forEach((item, index) => {
      deck.push({
        id: index,
        symbol: item.symbol,
        name: item.name,
        isFlipped: false,
        isMatched: false
      });
    });

    setCards(deck);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setIsLocked(false);
    setIsCompleted(false);
    setTime(0);
    setStarsEarned(3);
    setThemeName(`Galactic Sector #${Math.floor(Math.random() * 900) + 100}`);
  };

  useEffect(() => {
    initDeck();
  }, []);

  // Timer
  useEffect(() => {
    if (isCompleted) return;
    const timer = setInterval(() => {
      setTime(t => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isCompleted]);

  const handleCardClick = (id: number) => {
    if (isLocked) return;
    const target = cards.find(c => c.id === id);
    if (!target || target.isFlipped || target.isMatched) return;

    soundManager.playFlip();

    const updatedCards = cards.map(c => c.id === id ? { ...c, isFlipped: true } : c);
    setCards(updatedCards);

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setIsLocked(true);
      setMoves(m => m + 1);
      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find(c => c.id === firstId);
      const secondCard = cards.find(c => c.id === secondId);

      if (firstCard && secondCard && firstCard.symbol === secondCard.symbol) {
        soundManager.playCorrect();
        setTimeout(() => {
          setCards(prev => prev.map(c => (c.id === firstId || c.id === secondId) ? { ...c, isMatched: true } : c));
          setFlippedCards([]);
          setIsLocked(false);

          const newMatches = matches + 1;
          setMatches(newMatches);

          if (newMatches === 6) {
            handleVictory(moves + 1);
          }
        }, 400);
      } else {
        soundManager.playWrong();
        setTimeout(() => {
          setCards(prev => prev.map(c => (c.id === firstId || c.id === secondId) ? { ...c, isFlipped: false } : c));
          setFlippedCards([]);
          setIsLocked(false);
        }, 800);
      }
    }
  };

  const handleVictory = (finalMoves: number) => {
    setIsCompleted(true);
    soundManager.playVictory();

    let stars = 3;
    if (finalMoves > 16) stars = 1;
    else if (finalMoves > 10) stars = 2;
    setStarsEarned(stars);

    const score = Math.max(10, 200 - finalMoves * 10 - time * 2);
    saveHighScore('space_memory', score);

    if (finalMoves <= 12) {
      unlockBadge('space_cadet');
    }
  };

  const toggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto bg-slate-900 rounded-none overflow-hidden shadow-2xl border border-slate-800 text-white font-sans select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-800/80 backdrop-blur-md border-b border-slate-700">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-none bg-slate-700 hover:bg-slate-600 transition text-sm font-semibold cursor-pointer border border-slate-600"
          >
            <ArrowLeft className="w-4 h-4" /> Hub
          </button>
          <div className="flex items-center gap-2 bg-indigo-900/40 border border-indigo-500/30 px-3 py-1 rounded-none">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-bold text-indigo-200">Space Memory ({themeName})</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={initDeck}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-none bg-indigo-600/60 hover:bg-indigo-500 text-xs font-bold text-indigo-200 border border-indigo-400/30 transition cursor-pointer"
            title="Generate Random Deck"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Shuffle Deck
          </button>

          <div className="text-center">
            <span className="text-xs text-slate-400 block uppercase tracking-wider">Moves</span>
            <span className="text-xl font-extrabold text-indigo-400">{moves}</span>
          </div>

          <div className="text-center min-w-[60px]">
            <span className="text-xs text-slate-400 block uppercase tracking-wider">Time</span>
            <span className="text-xl font-extrabold text-cyan-400">{time}s</span>
          </div>

          <button
            onClick={toggleSound}
            className="p-2 rounded-none bg-slate-700 hover:bg-slate-600 text-slate-200 transition cursor-pointer border border-slate-600"
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Cards Area */}
      <div className="relative min-h-[380px] sm:min-h-[420px] p-4 sm:p-6 flex flex-col items-center justify-center bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900">
        {!isCompleted ? (
          <div className="grid grid-cols-3 md:grid-cols-4 gap-4 w-full max-w-xl">
            {cards.map(card => {
              const showFace = card.isFlipped || card.isMatched;

              return (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  disabled={card.isMatched}
                  className={`h-28 rounded-none flex items-center justify-center text-4xl transition-all transform duration-300 shadow-xl cursor-pointer border-2 ${
                    card.isMatched
                      ? 'bg-emerald-900/30 border-emerald-500/50 scale-95 opacity-60'
                      : showFace
                      ? 'bg-indigo-600 border-indigo-300 scale-105'
                      : 'bg-slate-800 hover:bg-slate-700 border-indigo-500/30 hover:scale-105'
                  }`}
                >
                  {showFace ? (
                    <span className="animate-in zoom-in duration-200">{card.symbol}</span>
                  ) : (
                    <span className="text-indigo-400 font-extrabold text-2xl font-mono">?</span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-800/95 border border-slate-700 rounded-none p-8 max-w-md w-full text-center shadow-2xl backdrop-blur-lg animate-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-none bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4 border border-indigo-500/40">
              <Trophy className="w-8 h-8" />
            </div>

            <h3 className="text-3xl font-extrabold text-white mb-2">Space Mission Clear!</h3>
            <p className="text-slate-400 text-sm mb-4">You matched all celestial pairs in {themeName}!</p>

            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3].map(star => (
                <Star
                  key={star}
                  className={`w-8 h-8 ${star <= starsEarned ? 'fill-amber-400 text-amber-400 animate-bounce' : 'text-slate-600'}`}
                />
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={initDeck}
                className="flex-1 py-3 px-4 rounded-none bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 font-bold text-white shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-5 h-5" /> Play New Random Deck
              </button>
              <button
                onClick={onBack}
                className="px-5 py-3 rounded-none bg-slate-700 hover:bg-slate-600 font-bold text-slate-200 transition cursor-pointer border border-slate-600"
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
