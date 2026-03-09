import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Pause, Play, RotateCcw, LogOut } from "lucide-react";
import type { GameEngine } from "@/games/types";
import { saveGameResult } from "@/lib/progress";

interface GamePlayerProps {
  gameId: string;
  title: string;
  emoji: string;
  instructions: string;
  createEngine: () => GameEngine;
}

const GamePlayer = ({ gameId, title, emoji, instructions, createEngine }: GamePlayerProps) => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [paused, setPaused] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  useEffect(() => {
    if (showInstructions) {
      const timer = setTimeout(() => setShowInstructions(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showInstructions]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = createEngine();
    engineRef.current = engine;

    engine.onStateChange = (s, l) => {
      setScore(s);
      setLevel(l);
    };
    engine.onGameOver = (fs) => {
      setFinalScore(fs);
      setGameOver(true);
      // Auto-save progress
      const result = saveGameResult(gameId, fs, engine.getLevel());
      setIsNewHighScore(result.highScore === fs && fs > 0);
    };

    engine.init(canvas);
    engine.start();

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [createEngine, gameId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const container = canvas.parentElement;
    if (!container) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = Math.min(rect.width * 0.6, 500);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const togglePause = useCallback(() => {
    const engine = engineRef.current;
    if (!engine || gameOver) return;
    if (engine.isPaused()) {
      engine.resume();
      setPaused(false);
    } else {
      engine.pause();
      setPaused(true);
    }
  }, [gameOver]);

  const handleRestart = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.restart();
    setScore(0);
    setLevel(1);
    setGameOver(false);
    setFinalScore(0);
    setPaused(false);
    setIsNewHighScore(false);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top info bar */}
      <div className="bg-card border-b border-border px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{emoji}</span>
          <h1 className="text-lg font-bold font-primary text-foreground hidden sm:block">{title}</h1>
        </div>
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="text-center">
            <p className="text-xs text-muted-foreground font-secondary">Score</p>
            <p className="text-lg font-bold font-primary text-accent">{score}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground font-secondary">Level</p>
            <p className="text-lg font-bold font-primary text-foreground">{level}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={togglePause} disabled={gameOver}>
            {paused ? <Play size={20} /> : <Pause size={20} />}
          </Button>
        </div>
      </div>

      {/* Game area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 relative">
        {showInstructions && (
          <div
            className="absolute top-8 z-30 bg-card border border-border rounded-2xl shadow-hover px-6 py-4 max-w-sm text-center animate-fade-in cursor-pointer"
            onClick={() => setShowInstructions(false)}
          >
            <p className="text-sm font-semibold font-primary text-foreground mb-1">How to Play</p>
            <p className="text-sm text-muted-foreground font-secondary">{instructions}</p>
            <p className="text-xs text-muted-foreground/60 font-secondary mt-2">Tap to dismiss</p>
          </div>
        )}

        {paused && !gameOver && (
          <div className="absolute inset-0 z-20 bg-foreground/20 backdrop-blur-sm flex items-center justify-center rounded-2xl">
            <div className="bg-card rounded-2xl shadow-hover p-8 text-center animate-scale-in">
              <p className="text-2xl font-bold font-primary text-foreground mb-4">⏸ Paused</p>
              <Button variant="hero" size="lg" onClick={togglePause}>Resume</Button>
            </div>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 z-20 bg-foreground/20 backdrop-blur-sm flex items-center justify-center rounded-2xl">
            <div className="bg-card rounded-2xl shadow-hover p-8 text-center animate-scale-in max-w-sm">
              <p className="text-4xl mb-3">🎉</p>
              <p className="text-2xl font-bold font-primary text-foreground mb-2">Game Over!</p>
              {isNewHighScore && (
                <p className="text-sm font-semibold text-game-green font-secondary mb-1">🏆 New High Score!</p>
              )}
              <p className="text-3xl font-bold font-primary text-accent mb-1">{finalScore}</p>
              <p className="text-sm text-muted-foreground font-secondary mb-1">points earned</p>
              <p className="text-xs text-muted-foreground font-secondary mb-6">Level {level} reached • Progress saved ✓</p>
              <div className="flex gap-3 justify-center">
                <Button variant="hero" size="lg" onClick={handleRestart}>
                  <RotateCcw size={18} /> Play Again
                </Button>
                <Button variant="outline" size="lg" onClick={() => navigate("/games")}>
                  <LogOut size={18} /> Exit
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="w-full max-w-4xl relative">
          <canvas
            ref={canvasRef}
            className="w-full rounded-2xl bg-card shadow-card block"
            style={{ imageRendering: "pixelated" }}
          />
        </div>
      </div>

      {/* Bottom controls */}
      <div className="bg-card border-t border-border px-6 py-4 flex justify-center gap-4">
        <Button variant="play" size="lg" onClick={handleRestart}>
          <RotateCcw size={18} /> Restart
        </Button>
        <Button variant="outline" size="lg" onClick={() => navigate("/games")}>
          <LogOut size={18} /> Exit to Library
        </Button>
      </div>
    </div>
  );
};

export default GamePlayer;
