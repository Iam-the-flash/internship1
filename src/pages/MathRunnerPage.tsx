import { useCallback } from "react";
import GamePlayer from "@/components/GamePlayer";
import { MathRunnerEngine } from "@/games/MathRunner";

const MathRunnerPage = () => {
  const createEngine = useCallback(() => new MathRunnerEngine(), []);
  return (
    <GamePlayer gameId="math-runner" title="Math Runner" emoji="🏃"
      instructions="You have 3 lives (♥). Jump with Space/↑ or tap. Solve math questions by pressing 1-3 or clicking. Collect power-ups: ⏱ slow-mo, 💡 hint, ❤ extra life!"
      createEngine={createEngine} />
  );
};

export default MathRunnerPage;
