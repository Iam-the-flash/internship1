import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";

interface Bubble {
  id: number;
  value: number;
  x: number;
  y: number;
}

function generateQuestion() {
  const ops = ["+", "-", "×"] as const;
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a: number, b: number, answer: number;

  switch (op) {
    case "+":
      a = Math.floor(Math.random() * 20) + 1;
      b = Math.floor(Math.random() * 20) + 1;
      answer = a + b;
      break;
    case "-":
      a = Math.floor(Math.random() * 20) + 5;
      b = Math.floor(Math.random() * a);
      answer = a - b;
      break;
    case "×":
      a = Math.floor(Math.random() * 10) + 1;
      b = Math.floor(Math.random() * 10) + 1;
      answer = a * b;
      break;
  }

  const wrongAnswers = new Set<number>();
  while (wrongAnswers.size < 3) {
    const wrong = answer + Math.floor(Math.random() * 11) - 5;
    if (wrong !== answer && wrong >= 0) wrongAnswers.add(wrong);
  }

  const options = [answer, ...wrongAnswers].sort(() => Math.random() - 0.5);
  return { text: `${a} ${op} ${b}`, answer, options };
}

const MathPopGame = () => {
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [question, setQuestion] = useState(generateQuestion);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (gameOver) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setGameOver(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameOver]);

  const handleAnswer = useCallback(
    (value: number) => {
      if (gameOver) return;
      if (value === question.answer) {
        setScore((s) => s + 10 + streak * 2);
        setStreak((s) => s + 1);
        setFeedback("correct");
      } else {
        setStreak(0);
        setFeedback("wrong");
      }
      setTimeout(() => {
        setFeedback(null);
        setQuestion(generateQuestion());
      }, 400);
    },
    [question, streak, gameOver]
  );

  const restart = () => {
    setScore(0);
    setStreak(0);
    setTimeLeft(60);
    setGameOver(false);
    setQuestion(generateQuestion());
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-2xl mx-auto px-6 py-8 text-center">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground transition-colors font-body text-sm"
          >
            ← Back to Games
          </button>
          <div className="flex gap-4 items-center">
            <span className="text-sm font-semibold text-muted-foreground font-body">
              ⏱ {timeLeft}s
            </span>
            <span className="text-sm font-semibold text-primary font-body">
              🏆 {score}
            </span>
          </div>
        </div>

        {gameOver ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="py-16"
          >
            <h2 className="text-4xl font-bold font-display text-foreground mb-4">
              Time's Up! 🎉
            </h2>
            <p className="text-2xl font-display text-primary mb-2">Score: {score}</p>
            <p className="text-muted-foreground font-body mb-8">Great job! Want to try again?</p>
            <div className="flex gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={restart}
                className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold font-display text-lg shadow-card"
              >
                Play Again ▶
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/")}
                className="bg-muted text-foreground px-8 py-3 rounded-xl font-semibold font-display text-lg"
              >
                More Games
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <>
            {streak >= 3 && (
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-game-yellow font-bold font-display text-sm mb-2"
              >
                🔥 {streak} streak!
              </motion.p>
            )}
            <motion.div
              key={question.text}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`rounded-2xl p-10 mb-8 shadow-card transition-colors ${
                feedback === "correct"
                  ? "bg-game-green"
                  : feedback === "wrong"
                  ? "bg-destructive"
                  : "bg-card"
              }`}
            >
              <p className="text-lg text-muted-foreground font-body mb-2">What is...</p>
              <h2 className={`text-5xl font-bold font-display ${feedback ? "text-primary-foreground" : "text-foreground"}`}>
                {question.text} = ?
              </h2>
            </motion.div>

            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              {question.options.map((opt, i) => (
                <motion.button
                  key={`${question.text}-${opt}-${i}`}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => handleAnswer(opt)}
                  className="bg-card shadow-card rounded-xl py-5 text-2xl font-bold font-display text-foreground hover:shadow-game transition-shadow"
                >
                  {opt}
                </motion.button>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default MathPopGame;
