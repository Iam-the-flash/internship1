import { useCallback } from "react";
import GamePlayer from "@/components/GamePlayer";
import { MathRunnerEngine } from "@/games/MathRunner";

const MathRunnerPage = () => {
  const createEngine = useCallback(() => new MathRunnerEngine(), []);
  return (
    <GamePlayer gameId="math-runner" title="Math Runner" emoji="🏃"
      instructions="Jump with Space/↑ or click. Solve math questions by pressing 1, 2, 3 or clicking answers."
      createEngine={createEngine} />
  );
};

export default MathRunnerPage;
