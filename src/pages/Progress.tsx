import Header from "@/components/Header";
import { getPlayerData, getGameProgress, clearAllProgress, ACHIEVEMENT_LABELS } from "@/lib/progress";
import { allGames } from "@/data/games";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Trophy, Flame, Star, BarChart3, Trash2 } from "lucide-react";

const GAME_ID_MAP: Record<string, string> = {
  "/game/math-runner": "math-runner",
  "/game/physics-jump": "physics-jump",
  "/game/formula-drop": "formula-drop",
  "/game/logic-builder": "logic-builder",
};

const STAT_LABELS: Record<string, Record<string, string>> = {
  "physics-jump": { heightReached: "Highest Height" },
  "logic-builder": { puzzlesSolved: "Puzzles Solved" },
};

const Progress = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(() => getPlayerData());

  const totalGames = Object.values(data.games).reduce((s, g) => s + g.totalGamesPlayed, 0);
  const totalScore = Object.values(data.games).reduce((s, g) => s + g.totalScore, 0);
  const allAchievements = new Set(Object.values(data.games).flatMap((g) => g.achievements));

  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear all progress? This cannot be undone.")) {
      clearAllProgress();
      setData(getPlayerData());
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-4xl font-bold font-primary text-foreground mb-3">Progress Dashboard 📊</h1>
          <p className="text-muted-foreground font-secondary text-lg">
            Track your learning journey across all games
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          {[
            { icon: <Flame size={22} className="text-accent" />, value: totalGames, label: "Games Played" },
            { icon: <Trophy size={22} className="text-accent" />, value: totalScore, label: "Total Points" },
            { icon: <Star size={22} className="text-accent" />, value: allAchievements.size, label: "Achievements" },
            { icon: <BarChart3 size={22} className="text-accent" />, value: Object.keys(data.games).length, label: "Games Tried" },
          ].map((stat) => (
            <div key={stat.label} className="bg-card rounded-2xl p-5 shadow-card text-center">
              <div className="flex justify-center mb-2">{stat.icon}</div>
              <p className="text-2xl font-bold font-primary text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground font-secondary">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Per-Game Progress */}
        <h2 className="text-2xl font-bold font-primary text-foreground mb-4">Game Progress</h2>
        <div className="space-y-4 mb-10 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          {allGames.map((game) => {
            const gameId = GAME_ID_MAP[game.path] || game.path;
            const progress = getGameProgress(gameId);
            const hasPlayed = progress.totalGamesPlayed > 0;

            return (
              <div
                key={game.title}
                className="bg-card rounded-2xl shadow-card p-5 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-3xl flex-shrink-0">{game.emoji}</span>
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold font-primary text-card-foreground">{game.title}</h3>
                    {hasPlayed ? (
                      <p className="text-xs text-muted-foreground font-secondary">
                        Last played {new Date(progress.lastPlayed).toLocaleDateString()}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground font-secondary">Not played yet</p>
                    )}
                  </div>
                </div>

                {hasPlayed ? (
                  <div className="flex flex-wrap gap-4 sm:gap-6 items-center">
                    <div className="text-center">
                      <p className="text-lg font-bold font-primary text-accent">{progress.highScore}</p>
                      <p className="text-xs text-muted-foreground font-secondary">High Score</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold font-primary text-foreground">{progress.highestLevel}</p>
                      <p className="text-xs text-muted-foreground font-secondary">Best Level</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold font-primary text-foreground">{progress.totalGamesPlayed}</p>
                      <p className="text-xs text-muted-foreground font-secondary">Plays</p>
                    </div>
                    {/* Custom stats */}
                    {Object.entries(progress.customStats).map(([key, val]) => (
                      <div key={key} className="text-center">
                        <p className="text-lg font-bold font-primary text-foreground">{val}</p>
                        <p className="text-xs text-muted-foreground font-secondary">
                          {STAT_LABELS[gameId]?.[key] || key}
                        </p>
                      </div>
                    ))}
                    <Button variant="play" size="sm" onClick={() => navigate(game.path)}>
                      ▶ Play
                    </Button>
                  </div>
                ) : (
                  <Button variant="play" size="sm" onClick={() => navigate(game.path)}>
                    ▶ Start Playing
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {/* Achievements */}
        <h2 className="text-2xl font-bold font-primary text-foreground mb-4">Achievements 🏅</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          {Object.entries(ACHIEVEMENT_LABELS).map(([key, ach]) => {
            const unlocked = allAchievements.has(key);
            return (
              <div
                key={key}
                className={`rounded-2xl p-4 border-2 transition-all ${
                  unlocked
                    ? "bg-card shadow-card border-accent"
                    : "bg-muted border-border opacity-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{unlocked ? ach.emoji : "🔒"}</span>
                  <div>
                    <p className="font-bold font-primary text-foreground text-sm">{ach.title}</p>
                    <p className="text-xs text-muted-foreground font-secondary">{ach.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Clear data */}
        {totalGames > 0 && (
          <div className="text-center pt-4 border-t border-border">
            <button
              onClick={handleClear}
              className="text-sm text-muted-foreground hover:text-destructive font-secondary transition-colors inline-flex items-center gap-1.5"
            >
              <Trash2 size={14} /> Clear all progress
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Progress;
