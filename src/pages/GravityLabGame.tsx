import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";

interface Ball {
  id: number;
  x: number;
  y: number;
  vy: number;
  radius: number;
  mass: number;
  color: string;
  landed: boolean;
}

const GRAVITY = 0.4;
const BOUNCE = 0.6;
const FRICTION = 0.99;
const COLORS = [
  "hsl(16, 85%, 61%)",
  "hsl(174, 52%, 52%)",
  "hsl(262, 60%, 62%)",
  "hsl(42, 95%, 60%)",
  "hsl(340, 72%, 65%)",
];

const GravityLabGame = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ballsRef = useRef<Ball[]>([]);
  const animRef = useRef<number>(0);
  const [gravity, setGravity] = useState(GRAVITY);
  const [ballCount, setBallCount] = useState(0);
  const nextId = useRef(0);

  const addBall = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const mass = Math.random() * 2 + 0.5;
      const radius = 12 + mass * 10;
      ballsRef.current.push({
        id: nextId.current++,
        x,
        y,
        vy: 0,
        radius,
        mass,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        landed: false,
      });
      setBallCount(ballsRef.current.length);
    },
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw ground
      ctx.fillStyle = "hsl(40, 20%, 88%)";
      ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
      ctx.fillStyle = "hsl(40, 15%, 80%)";
      ctx.fillRect(0, canvas.height - 40, canvas.width, 2);

      for (const ball of ballsRef.current) {
        ball.vy += gravity * ball.mass;
        ball.y += ball.vy;
        ball.vy *= FRICTION;

        const ground = canvas.height - 40 - ball.radius;
        if (ball.y >= ground) {
          ball.y = ground;
          ball.vy = -ball.vy * BOUNCE;
          if (Math.abs(ball.vy) < 1) {
            ball.vy = 0;
            ball.landed = true;
          }
        }

        // Draw ball
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = ball.color;
        ctx.fill();

        // Inner highlight
        ctx.beginPath();
        ctx.arc(ball.x - ball.radius * 0.25, ball.y - ball.radius * 0.25, ball.radius * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.fill();

        // Mass label
        ctx.fillStyle = "white";
        ctx.font = `bold ${Math.max(10, ball.radius * 0.6)}px Nunito`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${ball.mass.toFixed(1)}`, ball.x, ball.y);
      }

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [gravity]);

  const clearBalls = () => {
    ballsRef.current = [];
    setBallCount(0);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground transition-colors font-body text-sm"
          >
            ← Back to Games
          </button>
          <span className="text-sm text-muted-foreground font-body">
            🍎 {ballCount} objects dropped
          </span>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold font-display text-foreground mb-2">
            Gravity Lab 🍎
          </h2>
          <p className="text-muted-foreground font-body text-sm">
            Click anywhere to drop an object. Bigger = heavier. Try changing gravity!
          </p>
        </div>

        <div className="flex items-center gap-4 justify-center mb-4">
          <label className="text-sm font-semibold font-body text-foreground">
            Gravity: {gravity.toFixed(1)}
          </label>
          <input
            type="range"
            min="0.1"
            max="1.5"
            step="0.1"
            value={gravity}
            onChange={(e) => setGravity(parseFloat(e.target.value))}
            className="w-40 accent-primary"
          />
          <button
            onClick={clearBalls}
            className="text-sm bg-muted text-foreground px-4 py-2 rounded-lg font-body hover:bg-muted/80 transition-colors"
          >
            Clear All
          </button>
        </div>

        <canvas
          ref={canvasRef}
          onClick={addBall}
          className="w-full h-[400px] rounded-2xl bg-card shadow-card cursor-crosshair"
        />

        <div className="mt-4 bg-card rounded-xl p-4 shadow-soft">
          <p className="text-sm text-muted-foreground font-body">
            💡 <strong className="text-foreground">Did you know?</strong> Heavier objects and lighter objects fall at the same speed in a vacuum! Here, heavier objects accelerate faster to show mass effects. Try setting gravity to 0.1 — that's like being on the Moon!
          </p>
        </div>
      </main>
    </div>
  );
};

export default GravityLabGame;
