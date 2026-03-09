import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";

function generateProblem(level: number) {
  const maxNum = 5 + level * 3;
  const ops = level > 3 ? ["+", "-", "×"] : ["+", "-"];
  const op = ops[Math.floor(Math.random() * ops.length)] as "+" | "-" | "×";
  let a: number, b: number, answer: number;

  switch (op) {
    case "+":
      a = Math.floor(Math.random() * maxNum) + 1;
      b = Math.floor(Math.random() * maxNum) + 1;
      answer = a + b;
      break;
    case "-":
      a = Math.floor(Math.random() * maxNum) + 2;
      b = Math.floor(Math.random() * a);
      answer = a - b;
      break;
    case "×":
      a = Math.floor(Math.random() * 10) + 1;
      b = Math.floor(Math.random() * 10) + 1;
      answer = a * b;
      break;
  }

  return { text: `${a} ${op} ${b}`, answer };
}

const NumberRushGame = () => {
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [problem, setProblem] = useState(() => generateProblem(1));
  const [input, setInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(90);
  const [gameOver, setGameOver] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [flash, setFlash] = useState<"correct" | "wrong" | null>(null);

  useEffect(() => {
    if (gameOver) return;
    const t = setInterval(() => setTimeLeft((v) => {
      if (v <= 1) { setGameOver(true); return 0; }
      return v - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [gameOver]);

  const submit = useCallback(() => {
    if (!input.trim() || gameOver) return;
    const val = parseInt(input);
    if (val === problem.answer) {
      const newCorrect = correct + 1;
      setCorrect(newCorrect);
      setScore((s) => s + 10 * level);
      setFlash("correct");
      if (newCorrect % 5 === 0) setLevel((l) => l + 1);
      setProblem(generateProblem(level));
    } else {
      setFlash("wrong");
    }
    setInput("");
    setTimeout(() => setFlash(null), 300);
  }, [input, problem, level, correct, gameOver]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") submit();
  };

  const restart = () => {
    setScore(0); setLevel(1); setCorrect(0);
    setTimeLeft(90); setGameOver(false); setInput("");
    setProblem(generateProblem(1));
  };

  const progressPercent = (timeLeft / 90) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-xl mx-auto px-6 py-8 text-center">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground transition-colors font-body text-sm">
            ← Back to Games
          </button>
          <div className="flex gap-4 text-sm font-semibold font-body">
            <span className="text-secondary">Lv.{level}</span>
            <span className="text-primary">🏆 {score}</span>
          </div>
        </div>

        {/* Timer bar */}
        <div className="w-full h-3 bg-muted rounded-full mb-8 overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {gameOver ? (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="py-12">
            <h2 className="text-4xl font-bold font-display text-foreground mb-4">⚡ Incredible!</h2>
            <p className="text-2xl font-display text-primary mb-1">Score: {score}</p>
            <p className="text-muted-foreground font-body mb-2">Level reached: {level} • {correct} correct answers</p>
            <div className="flex gap-4 justify-center mt-8">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={restart}
                className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold font-display text-lg shadow-card">
                Play Again ▶
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate("/")}
                className="bg-muted text-foreground px-8 py-3 rounded-xl font-semibold font-display text-lg">
                More Games
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <>
            <motion.div
              key={problem.text}
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className={`rounded-2xl p-10 mb-8 shadow-card transition-colors ${
                flash === "correct" ? "bg-game-green" : flash === "wrong" ? "bg-destructive" : "bg-card"
              }`}
            >
              <p className="text-sm text-muted-foreground font-body mb-2">Solve quickly!</p>
              <h2 className={`text-5xl font-bold font-display ${flash ? "text-primary-foreground" : "text-foreground"}`}>
                {problem.text} = ?
              </h2>
            </motion.div>

            <div className="flex gap-3 max-w-xs mx-auto">
              <input
                type="number"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                autoFocus
                className="flex-1 bg-card border-2 border-border rounded-xl px-4 py-4 text-2xl font-bold font-display text-foreground text-center focus:border-primary focus:outline-none shadow-soft transition-colors"
                placeholder="?"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={submit}
                className="bg-primary text-primary-foreground px-6 py-4 rounded-xl font-bold font-display text-xl shadow-card"
              >
                →
              </motion.button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default NumberRushGame;
