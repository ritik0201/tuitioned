'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { GameConfig, GameCategory, UserStats } from '@/lib/games/types';
import { soundManager } from '@/lib/games/soundManager';
import { getStoredBadges, getStoredHighScores, getUserStats, recordGamePlayed } from '@/lib/games/badgeSystem';
import GamesHubHeader from '@/components/games/GamesHubHeader';
import GameCard from '@/components/games/GameCard';
import BadgeModal from '@/components/games/BadgeModal';
import HowToPlayModal from '@/components/games/HowToPlayModal';
import { Sparkles, Gamepad2, Brain, Rocket, Music, Search, Zap } from 'lucide-react';

// Dynamic game imports for Next.js SSR safety
const MathBalloonPop = dynamic(() => import('@/components/games/MathBalloonPop'), { ssr: false });
const SpaceMemoryMatch = dynamic(() => import('@/components/games/SpaceMemoryMatch'), { ssr: false });
const ColorShapeMixer = dynamic(() => import('@/components/games/ColorShapeMixer'), { ssr: false });
const ConstellationConnect = dynamic(() => import('@/components/games/ConstellationConnect'), { ssr: false });
const CodeGalaxy = dynamic(() => import('@/components/games/CodeGalaxy'), { ssr: false });
const LaserDefender = dynamic(() => import('@/components/games/LaserDefender'), { ssr: false });

const GAMES_DATA: GameConfig[] = [
  {
    id: 'math_balloon',
    title: 'Math Balloon Pop!',
    subtitle: 'Fast Math Arcade',
    description: 'Solve arithmetic problems by popping balloons!',
    category: 'math',
    icon: '🎈',
    gradient: 'bg-gradient-to-br from-purple-600 to-pink-600',
    borderColor: 'border-purple-500/30',
    bgGlow: 'bg-purple-500',
    difficulty: 'Easy',
    ageRange: '5-12',
    instructions: [
      '1. Read the target math equation shown at top of the stage.',
      '2. Tap the floating balloon containing the correct answer.',
      '3. Maintain your streak to earn level multipliers and bonus points!',
      '4. Score 100+ points to unlock the Math Wizard badge!'
    ],
    skillsLearned: ['Mental Arithmetic', 'Speed Math', 'Focus']
  },
  {
    id: 'space_memory',
    title: 'Space Memory',
    subtitle: 'Cosmic Cards',
    description: 'Flip celestial cards and match planet pairs!',
    category: 'space',
    icon: '🪐',
    gradient: 'bg-gradient-to-br from-indigo-600 to-blue-600',
    borderColor: 'border-indigo-500/30',
    bgGlow: 'bg-indigo-500',
    difficulty: 'Medium',
    ageRange: '4-10',
    instructions: [
      '1. Tap cosmic cards to flip them over.',
      '2. Memorize celestial planet icons and find matching pairs.',
      '3. Clear all 6 pairs in minimum total moves!',
      '4. Finish under 12 moves to unlock the Space Cadet badge!'
    ],
    skillsLearned: ['Visual Memory', 'Concentration', 'Pattern Matching']
  },
   {
    id: 'laser_defender',
    title: 'Laser Planet Defense',
    subtitle: 'Space Math Laser Cannon',
    description: 'Blast incoming meteor hazards by solving target equations!',
    category: 'math',
    icon: '⚡',
    gradient: 'bg-gradient-to-br from-red-600 to-amber-600',
    borderColor: 'border-red-500/30',
    bgGlow: 'bg-red-500',
    difficulty: 'Hard',
    ageRange: '6-14',
    instructions: [
      '1. Inspect the math problem on the incoming meteor hazard.',
      '2. Fire the laser cannon matching the correct calculation answer.',
      '3. Protect planet shield health before the timer runs out!',
      '4. Score 100+ points to earn the Laser Defender badge!'
    ],
    skillsLearned: ['Mental Math', 'Reaction Speed', 'Problem Solving']
  },
  {
    id: 'code_galaxy',
    title: 'Code Galaxy Quest',
    subtitle: 'Rover Programming Logic',
    description: 'Guide the cosmic rover with code commands!',
    category: 'logic',
    icon: '🤖',
    gradient: 'bg-gradient-to-br from-indigo-600 to-cyan-600',
    borderColor: 'border-indigo-500/30',
    bgGlow: 'bg-indigo-500',
    difficulty: 'Hard',
    ageRange: '6-14',
    instructions: [
      '1. Inspect the grid map with rover 🤖, star ⭐, and finish 🏁.',
      '2. Add directional code commands (Up ⬆️, Right ➡️, Down ⬇️).',
      '3. Tap "RUN CODE" to execute your program sequence!',
      '4. Complete 3 logic levels for the Galactic Coder badge!'
    ],
    skillsLearned: ['Programming Logic', 'Sequencing', 'Spatial Reasoning']
  },

  {
    id: 'shape_mixer',
    title: 'Shape Synth Lab',
    subtitle: 'Audio Music Synth',
    description: 'Tap colorful shapes to compose musical tunes!',
    category: 'logic',
    icon: '🎨',
    gradient: 'bg-gradient-to-br from-pink-600 to-rose-600',
    borderColor: 'border-pink-500/30',
    bgGlow: 'bg-pink-500',
    difficulty: 'Easy',
    ageRange: '3-10',
    instructions: [
      '1. Tap colorful synth shapes to play musical notes.',
      '2. Sequence different notes to create your custom melody.',
      '3. Tap "PLAY MELODY" to listen to your song composition!',
      '4. Create 10 sound combos for the Color Maestro badge!'
    ],
    skillsLearned: ['Audio Synthesis', 'Creative Composition', 'Auditory Memory']
  },

  {
    id: 'constellation',
    title: 'Constellation Connect',
    subtitle: 'Star Tracing Puzzle',
    description: 'Connect numbered glowing stars to unlock space maps!',
    category: 'space',
    icon: '🌌',
    gradient: 'bg-gradient-to-br from-cyan-600 to-blue-600',
    borderColor: 'border-cyan-500/30',
    bgGlow: 'bg-cyan-500',
    difficulty: 'Easy',
    ageRange: '4-11',
    instructions: [
      '1. Inspect the starry night sky map.',
      '2. Tap numbered stars in numerical order (1 ➡️ 2 ➡️ 3 ➡️ 4...).',
      '3. Complete the star trace to reveal glowing constellations!',
      '4. Connect 3 constellations for Star Stargazer badge!'
    ],
    skillsLearned: ['Number Ordering', 'Fine Motor Skills', 'Astronomy']
  }
];

export default function StudentGamesPage() {
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<GameCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isBadgesOpen, setIsBadgesOpen] = useState(false);
  const [howToPlayGame, setHowToPlayGame] = useState<GameConfig | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [userStats, setUserStats] = useState<UserStats>({
    totalStars: 0,
    gamesPlayed: 0,
    streakDays: 1,
    badgesUnlocked: 0
  });
  const [highScores, setHighScores] = useState<Record<string, number>>({});

  const refreshData = () => {
    setUserStats(getUserStats());
    setHighScores(getStoredHighScores());
    setIsMuted(soundManager.getMuted());
  };

  useEffect(() => {
    refreshData();
  }, [activeGameId]);

  const handleLaunchGame = (gameId: string) => {
    soundManager.playPop();
    recordGamePlayed(gameId);
    setActiveGameId(gameId);
  };

  const handleBackToHub = () => {
    soundManager.playFlip();
    setActiveGameId(null);
    refreshData();
  };

  const toggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const filteredGames = GAMES_DATA.filter(game => {
    const matchesCategory = selectedCategory === 'all' || game.category === selectedCategory;
    const matchesSearch =
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full bg-slate-950 text-white font-sans select-none">
      {/* Header - shown on Hub dashboard */}
      {!activeGameId && (
        <GamesHubHeader
          stats={userStats}
          onOpenBadges={() => {
            soundManager.playFlip();
            setIsBadgesOpen(true);
          }}
          isMuted={isMuted}
          onToggleMute={toggleMute}
        />
      )}

      {/* Main Area */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 py-2">
        {activeGameId ? (
          /* Active Game Player Overlay */
          <div className="w-full flex justify-center py-1">
            {activeGameId === 'math_balloon' && <MathBalloonPop onBack={handleBackToHub} />}
            {activeGameId === 'laser_defender' && <LaserDefender onBack={handleBackToHub} />}
            {activeGameId === 'space_memory' && <SpaceMemoryMatch onBack={handleBackToHub} />}
            {activeGameId === 'code_galaxy' && <CodeGalaxy onBack={handleBackToHub} />}
            {activeGameId === 'shape_mixer' && <ColorShapeMixer onBack={handleBackToHub} />}
            {activeGameId === 'constellation' && <ConstellationConnect onBack={handleBackToHub} />}
          </div>
        ) : (
          /* Dashboard */
          <div className="flex flex-col gap-6">
            {/* Sharp Category Tabs & Search */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Sharp Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 scrollbar-none">
                {[
                  { id: 'all', label: 'ALL GAMES', icon: <Gamepad2 className="w-3.5 h-3.5" /> },
                  { id: 'math', label: 'MATH', icon: <Brain className="w-3.5 h-3.5 text-purple-400" /> },
                  { id: 'space', label: 'SPACE', icon: <Rocket className="w-3.5 h-3.5 text-indigo-400" /> },
                  { id: 'words', label: 'WORDS', icon: <Sparkles className="w-3.5 h-3.5 text-amber-400" /> },
                  { id: 'arcade', label: 'ARCADE', icon: <Zap className="w-3.5 h-3.5 text-emerald-400" /> },
                  { id: 'logic', label: 'LOGIC', icon: <Music className="w-3.5 h-3.5 text-pink-400" /> }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      soundManager.playPop();
                      setSelectedCategory(tab.id as GameCategory);
                    }}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider cursor-pointer border transition ${
                      selectedCategory === tab.id
                        ? 'bg-indigo-600 border-indigo-400 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative w-full md:w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search games..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 focus:border-indigo-500 text-xs font-bold text-white placeholder-slate-500 outline-none"
                />
              </div>
            </div>

            {/* Sharp Games Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredGames.map(game => (
                <GameCard
                  key={game.id}
                  game={game}
                  highScore={highScores[game.id] || 0}
                  onPlay={handleLaunchGame}
                  onHowToPlay={(selectedGame) => {
                    soundManager.playFlip();
                    setHowToPlayGame(selectedGame);
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Trophy Modal */}
      <BadgeModal
        isOpen={isBadgesOpen}
        onClose={() => setIsBadgesOpen(false)}
        badges={getStoredBadges()}
      />

      {/* How To Play Modal */}
      <HowToPlayModal
        isOpen={!!howToPlayGame}
        game={howToPlayGame}
        onClose={() => setHowToPlayGame(null)}
      />
    </div>
  );
}
