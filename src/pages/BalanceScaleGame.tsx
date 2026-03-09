import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";

interface Weight {
  id: number;
  value: number;
  side: "left" | "right" | "bank";
}

const AVAILABLE = [1, 2, 3, 4, 5, 7, 10];

function generateTarget() {
  const numWeights = Math.floor(Math.random() * 2) + 2;
  let total = 0;
  for (let i = 0; i < numWeights; i++) {
    total += AVAILABLE[Math.floor(Math.random() * AVAILABLE.length)];
  }
  return total;
}

const BalanceScaleGame = () => {
  const navigate = useNavigate();
  const [target] = useState(() => generateTarget());
  const [weights, setWeights] = useState<Weight[]>([]);
  const [nextId, setNextId] = useState(0);
  const [solved, setSolved] = useState(false);

  const rightTotal = weights.filter((w) => w.side === "right").reduce((s, w) => s + w.value, 0);
  const diff = target - rightTotal;
  const tilt = diff > 0 ? Math.min(diff * 2, 15) : Math.max(diff * 2, -15);

  const addWeight = (value: number) => {
    if (solved) return;
    const newWeights = [...weights, { id: nextId, value, side: "right" as const }];
    setWeights(newWeights);
    setNextId(nextId + 1);
    const newTotal = newWeights.filter((w) => w.side === "right").reduce((s, w) => s + w.value, 0);
    if (newTotal === target) setSolved(true);
  };

  const removeWeight = (id: number) => {
    if (solved) return;
    setWeights(weights.filter((w) => w.id !== id));
  };

  const reset = () => {
    setWeights([]);
    setSolved(false);
  };

  const newPuzzle = () => {
    setWeights([]);
    setSolved(false);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-2xl mx-auto px-6 py-8 text-center">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground transition-colors font-body text-sm">
            ← Back to Games
          </button>
        </div>

        <h2 className="text-3xl font-bold font-display text-foreground mb-2">Balance Scale ⚖️</h2>
        <p className="text-muted-foreground font-body text-sm mb-8">
          The left side weighs <strong className="text-primary">{target}</strong>. Add weights to the right side to balance it!
        </p>

        {/* Scale visualization */}
        <div className="relative h-48 mb-8">
          {/* Fulcrum */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[24px] border-r-[24px] border-b-[32px] border-l-transparent border-r-transparent border-b-muted" />

          {/* Beam */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[80%] h-2 bg-foreground/20 rounded-full origin-center"
            animate={{ rotate: solved ? 0 : tilt }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            {/* Left pan */}
            <div className="absolute -left-2 -top-12 w-24 flex flex-col items-center">
              <div className="bg-game-blue rounded-lg px-3 py-2 text-primary-foreground font-bold font-display text-lg shadow-card">
                {target}
              </div>
              <div className="w-1 h-4 bg-foreground/20" />
            </div>

            {/* Right pan */}
            <div className="absolute -right-2 -top-16 w-32 flex flex-col items-center">
              <div className="flex flex-wrap gap-1 justify-center max-w-[120px]">
                {weights.filter((w) => w.side === "right").map((w) => (
                  <motion.button
                    key={w.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    onClick={() => removeWeight(w.id)}
                    className="bg-primary text-primary-foreground rounded-md px-2 py-1 text-xs font-bold font-display shadow-soft cursor-pointer"
                    title="Click to remove"
                  >
                    {w.value}
                  </motion.button>
                ))}
              </div>
              <div className="w-1 h-4 bg-foreground/20 mt-1" />
              <div className="text-sm text-muted-foreground font-body mt-0.5">{rightTotal}</div>
            </div>
          </motion.div>
        </div>

        {solved ? (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mb-8">
            <p className="text-3xl font-bold font-display text-game-green mb-4">✅ Balanced!</p>
            <div className="flex gap-4 justify-center">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={newPuzzle}
                className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold font-display shadow-card">
                New Puzzle ▶
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground font-body mb-4">
              Tap a weight to add it. Tap placed weights to remove.
            </p>
            <div className="flex flex-wrap gap-3 justify-center mb-6">
              {AVAILABLE.map((v) => (
                <motion.button
                  key={v}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => addWeight(v)}
                  className="bg-card shadow-card rounded-xl w-14 h-14 flex items-center justify-center text-xl font-bold font-display text-foreground hover:shadow-game transition-shadow"
                >
                  {v}
                </motion.button>
              ))}
            </div>
            <button onClick={reset} className="text-sm text-muted-foreground hover:text-foreground font-body transition-colors">
              Reset weights
            </button>
          </>
        )}

        {rightTotal > target && !solved && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-destructive font-body text-sm mt-4">
            Too heavy! Remove some weights.
          </motion.p>
        )}

        <div className="mt-8 bg-card rounded-xl p-4 shadow-soft">
          <p className="text-sm text-muted-foreground font-body">
            💡 <strong className="text-foreground">Math tip:</strong> This is just like solving an equation! {target} = ? + ? — find the right combination of numbers that add up.
          </p>
        </div>
      </main>
    </div>
  );
};

export default BalanceScaleGame;
