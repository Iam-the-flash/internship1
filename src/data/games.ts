export interface GameData {
  title: string;
  description: string;
  emoji: string;
  difficulty: "Easy" | "Medium" | "Hard";
  path: string;
  color: "green" | "blue" | "purple" | "coral" | "primary";
}

export const allGames: GameData[] = [
  {
    title: "Math Runner",
    description: "Run forward while solving math equations to avoid obstacles. Practice mental math at speed!",
    emoji: "🏃",
    difficulty: "Easy",
    path: "/game/math-runner",
    color: "primary",
  },
  {
    title: "Physics Jump",
    description: "Jump between platforms and experience gravity and momentum. How high can you go?",
    emoji: "🚀",
    difficulty: "Medium",
    path: "/game/physics-jump",
    color: "blue",
  },
  {
    title: "Formula Drop",
    description: "Catch the correct formula variables as they fall from the sky. Learn physics equations!",
    emoji: "🧪",
    difficulty: "Medium",
    path: "/game/formula-drop",
    color: "purple",
  },
  {
    title: "Logic Builder",
    description: "Solve puzzles using ramps, weights, levers and platforms. Think like an engineer!",
    emoji: "🔧",
    difficulty: "Hard",
    path: "/game/logic-builder",
    color: "coral",
  },
];
