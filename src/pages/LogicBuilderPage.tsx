import { useCallback } from "react";
import GamePlayer from "@/components/GamePlayer";
import { LogicBuilderEngine } from "@/games/LogicBuilder";

const LogicBuilderPage = () => {
  const createEngine = useCallback(() => new LogicBuilderEngine(), []);
  return (
    <GamePlayer gameId="logic-builder" title="Logic Builder" emoji="🔧"
      instructions="Drag pieces from the bottom into the build zone. Place all pieces correctly to solve each puzzle!"
      createEngine={createEngine} />
  );
};

export default LogicBuilderPage;
