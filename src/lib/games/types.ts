export type GameCategory = 'all' | 'math' | 'space' | 'words' | 'logic' | 'arcade';

export interface GameConfig {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: Exclude<GameCategory, 'all'>;
  icon: string;
  gradient: string;
  borderColor: string;
  bgGlow: string;
  difficulty: 'Easy' | 'Medium' | 'Fun Challenge';
  ageRange: string;
  instructions: string[];
  skillsLearned: string[];
  featured?: boolean;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  gameId?: string;
}

export interface HighScore {
  gameId: string;
  score: number;
  date: string;
  playerName?: string;
}

export interface UserStats {
  totalStars: number;
  gamesPlayed: number;
  streakDays: number;
  badgesUnlocked: number;
}
