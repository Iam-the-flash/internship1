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
    title: "Math Pop!",
    description: "Pop the bubble with the correct answer. Quick mental math for everyone!",
    emoji: "🫧",
    difficulty: "Easy",
    path: "/game/math-pop",
    color: "primary",
  },
  {
    title: "Gravity Lab",
    description: "Drop objects and experiment with gravity. Learn physics hands-on!",
    emoji: "🍎",
    difficulty: "Medium",
    path: "/game/gravity-lab",
    color: "green",
  },
  {
    title: "Number Rush",
    description: "Race against the clock! Solve as many math problems as you can.",
    emoji: "⚡",
    difficulty: "Medium",
    path: "/game/number-rush",
    color: "purple",
  },
  {
    title: "Balance Scale",
    description: "Place weights to balance the scale. Learn about equations naturally!",
    emoji: "⚖️",
    difficulty: "Easy",
    path: "/game/balance-scale",
    color: "blue",
  },
];
