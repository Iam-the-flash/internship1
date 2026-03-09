export interface GameProgress {
  gameId: string;
  highScore: number;
  highestLevel: number;
  totalGamesPlayed: number;
  totalScore: number;
  lastPlayed: string;
  achievements: string[];
  customStats: Record<string, number>;
}

export interface PlayerData {
  games: Record<string, GameProgress>;
  totalPlaytime: number;
  firstPlayed: string;
}

const STORAGE_KEY = "playlearn_progress";

function loadPlayerData(): PlayerData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { games: {}, totalPlaytime: 0, firstPlayed: new Date().toISOString() };
}

function savePlayerData(data: PlayerData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getPlayerData(): PlayerData {
  return loadPlayerData();
}

export function getGameProgress(gameId: string): GameProgress {
  const data = loadPlayerData();
  return (
    data.games[gameId] ?? {
      gameId,
      highScore: 0,
      highestLevel: 0,
      totalGamesPlayed: 0,
      totalScore: 0,
      lastPlayed: "",
      achievements: [],
      customStats: {},
    }
  );
}

export function saveGameResult(
  gameId: string,
  score: number,
  level: number,
  customStats?: Record<string, number>
) {
  const data = loadPlayerData();
  const prev = data.games[gameId] ?? {
    gameId,
    highScore: 0,
    highestLevel: 0,
    totalGamesPlayed: 0,
    totalScore: 0,
    lastPlayed: "",
    achievements: [],
    customStats: {},
  };

  const updated: GameProgress = {
    ...prev,
    highScore: Math.max(prev.highScore, score),
    highestLevel: Math.max(prev.highestLevel, level),
    totalGamesPlayed: prev.totalGamesPlayed + 1,
    totalScore: prev.totalScore + score,
    lastPlayed: new Date().toISOString(),
    customStats: { ...prev.customStats, ...customStats },
  };

  // Auto-achievements
  const newAchievements = [...prev.achievements];
  if (updated.totalGamesPlayed === 1 && !newAchievements.includes("first_play"))
    newAchievements.push("first_play");
  if (updated.totalGamesPlayed >= 10 && !newAchievements.includes("dedicated"))
    newAchievements.push("dedicated");
  if (updated.highScore >= 100 && !newAchievements.includes("century"))
    newAchievements.push("century");
  if (updated.highScore >= 500 && !newAchievements.includes("high_achiever"))
    newAchievements.push("high_achiever");
  if (updated.highestLevel >= 5 && !newAchievements.includes("level_master"))
    newAchievements.push("level_master");
  if (updated.highestLevel >= 10 && !newAchievements.includes("expert"))
    newAchievements.push("expert");
  updated.achievements = newAchievements;

  data.games[gameId] = updated;
  savePlayerData(data);

  return updated;
}

export function clearAllProgress() {
  localStorage.removeItem(STORAGE_KEY);
}

export const ACHIEVEMENT_LABELS: Record<string, { emoji: string; title: string; desc: string }> = {
  first_play: { emoji: "🎮", title: "First Steps", desc: "Played your first game" },
  dedicated: { emoji: "🔥", title: "Dedicated Learner", desc: "Played 10 games" },
  century: { emoji: "💯", title: "Century Club", desc: "Scored 100+ in a game" },
  high_achiever: { emoji: "🏆", title: "High Achiever", desc: "Scored 500+ in a game" },
  level_master: { emoji: "⭐", title: "Level Master", desc: "Reached level 5" },
  expert: { emoji: "👑", title: "Expert", desc: "Reached level 10" },
};
