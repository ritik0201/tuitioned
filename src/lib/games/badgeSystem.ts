import { Badge, HighScore, UserStats } from './types';

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'math_wizard',
    title: 'Math Wizard',
    description: 'Score 100+ points in Math Balloon Pop!',
    icon: '🧙‍♂️',
    unlocked: false,
    gameId: 'math_balloon'
  },
  {
    id: 'space_cadet',
    title: 'Space Cadet',
    description: 'Complete Space Memory in under 12 moves',
    icon: '🚀',
    unlocked: false,
    gameId: 'space_memory'
  },
  {
    id: 'word_ninja',
    title: 'Word Ninja',
    description: 'Spell 5 words correctly in Word Ninja',
    icon: '🥷',
    unlocked: false,
    gameId: 'word_ninja'
  },
  {
    id: 'color_maestro',
    title: 'Color Maestro',
    description: 'Create 10 sound combos in Shape Mixer',
    icon: '🎨',
    unlocked: false,
    gameId: 'shape_mixer'
  },
  {
    id: 'dino_runner',
    title: 'Dino Champion',
    description: 'Score 100+ points in Dino Quiz Runner!',
    icon: '🦖',
    unlocked: false,
    gameId: 'dino_runner'
  },
  {
    id: 'star_tracer',
    title: 'Star Stargazer',
    description: 'Connect 3 space constellations in Star Connect!',
    icon: '🌌',
    unlocked: false,
    gameId: 'constellation'
  },
  {
    id: 'code_explorer',
    title: 'Galactic Coder',
    description: 'Complete 3 logic levels in Code Galaxy Quest!',
    icon: '🤖',
    unlocked: false,
    gameId: 'code_galaxy'
  },
  {
    id: 'spelling_bee',
    title: 'Spelling Champion',
    description: 'Score 100+ points in Cyber Spelling Bee!',
    icon: '🐝',
    unlocked: false,
    gameId: 'spelling_bee'
  },
  {
    id: 'laser_defender',
    title: 'Laser Defender',
    description: 'Score 100+ points in Laser Planet Defense!',
    icon: '⚡',
    unlocked: false,
    gameId: 'laser_defender'
  },
  {
    id: 'star_collector',
    title: 'Star Collector',
    description: 'Earn 50 stars across all mini-games',
    icon: '⭐',
    unlocked: false
  },
  {
    id: 'game_master',
    title: 'Arcade Master',
    description: 'Play at least 4 mini-games in the arcade',
    icon: '🏆',
    unlocked: false
  }
];

const STORAGE_KEYS = {
  BADGES: 'tuitioned_user_badges',
  SCORES: 'tuitioned_high_scores',
  STATS: 'tuitioned_user_stats',
  PLAYED_GAMES: 'tuitioned_played_games'
};

export function getStoredBadges(): Badge[] {
  if (typeof window === 'undefined') return INITIAL_BADGES;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BADGES);
    if (!raw) return INITIAL_BADGES;
    const storedBadges: Record<string, boolean> = JSON.parse(raw);
    return INITIAL_BADGES.map(b => ({
      ...b,
      unlocked: !!storedBadges[b.id]
    }));
  } catch {
    return INITIAL_BADGES;
  }
}

export function unlockBadge(badgeId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BADGES);
    const storedBadges: Record<string, boolean> = raw ? JSON.parse(raw) : {};
    if (!storedBadges[badgeId]) {
      storedBadges[badgeId] = true;
      localStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(storedBadges));
      return true;
    }
  } catch {
    // Ignore error
  }
  return false;
}

export function getStoredHighScores(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SCORES);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveHighScore(gameId: string, score: number): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const scores = getStoredHighScores();
    if (!scores[gameId] || score > scores[gameId]) {
      scores[gameId] = score;
      localStorage.setItem(STORAGE_KEYS.SCORES, JSON.stringify(scores));
      return true;
    }
  } catch {
    // Ignore error
  }
  return false;
}

export function recordGamePlayed(gameId: string) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PLAYED_GAMES);
    const played: string[] = raw ? JSON.parse(raw) : [];
    if (!played.includes(gameId)) {
      played.push(gameId);
      localStorage.setItem(STORAGE_KEYS.PLAYED_GAMES, JSON.stringify(played));
    }
    if (played.length >= 4) {
      unlockBadge('game_master');
    }
  } catch {
    // Ignore error
  }
}

export function getUserStats(): UserStats {
  if (typeof window === 'undefined') {
    return { totalStars: 0, gamesPlayed: 0, streakDays: 1, badgesUnlocked: 0 };
  }
  const badges = getStoredBadges();
  const unlockedCount = badges.filter(b => b.unlocked).length;
  const scores = getStoredHighScores();
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const totalStars = Math.floor(totalScore / 10) + unlockedCount * 5;

  return {
    totalStars,
    gamesPlayed: Object.keys(scores).length,
    streakDays: 1,
    badgesUnlocked: unlockedCount
  };
}
