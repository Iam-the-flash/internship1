import { useCallback } from "react";
import GamePlayer from "@/components/GamePlayer";
import { FormulaDropEngine } from "@/games/FormulaDrop";

const FormulaDropPage = () => {
  const createEngine = useCallback(() => new FormulaDropEngine(), []);
  return (
    <GamePlayer gameId="formula-drop" title="Formula Drop" emoji="🧪"
      instructions="Move your catcher with the mouse to catch the correct formula variable. Avoid wrong answers!"
      createEngine={createEngine} />
  );
};

export default FormulaDropPage;
