import { useCallback } from "react";
import GamePlayer from "@/components/GamePlayer";
import { PhysicsJumpEngine } from "@/games/PhysicsJump";

const PhysicsJumpPage = () => {
  const createEngine = useCallback(() => new PhysicsJumpEngine(), []);
  return (
    <GamePlayer gameId="physics-jump" title="Physics Jump" emoji="🚀"
      instructions="Use ← → arrow keys to move. Jump automatically on platforms. How high can you climb?"
      createEngine={createEngine} />
  );
};

export default PhysicsJumpPage;
