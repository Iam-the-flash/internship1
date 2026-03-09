import { motion } from "framer-motion";
import Header from "@/components/Header";
import GameCard from "@/components/GameCard";

const games = [
  {
    title: "Math Pop!",
    description: "Pop the bubble with the correct answer. Quick mental math for everyone!",
    emoji: "🫧",
    color: "primary" as const,
    path: "/game/math-pop",
    ageRange: "All Ages",
  },
  {
    title: "Gravity Lab",
    description: "Drop objects and see how gravity works. Learn physics by experimenting!",
    emoji: "🍎",
    color: "secondary" as const,
    path: "/game/gravity-lab",
    ageRange: "Ages 8+",
  },
  {
    title: "Number Rush",
    description: "Race against the clock! Solve as many math problems as you can.",
    emoji: "⚡",
    color: "accent" as const,
    path: "/game/number-rush",
    ageRange: "All Ages",
  },
  {
    title: "Balance Scale",
    description: "Place weights to balance the scale. Learn about equations naturally!",
    emoji: "⚖️",
    color: "blue" as const,
    path: "/game/balance-scale",
    ageRange: "Ages 6+",
  },
];

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 20 } },
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl sm:text-6xl font-bold font-display text-foreground mb-4">
            Learn by <span className="text-primary">Playing</span> 🎯
          </h1>
          <p className="text-lg text-muted-foreground font-body max-w-lg mx-auto">
            Pick a game below and start learning instantly. No signups, no instructions — just fun!
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
        >
          {games.map((game) => (
            <motion.div key={game.title} variants={item}>
              <GameCard {...game} />
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-sm text-muted-foreground mt-12 font-body"
        >
          🧠 Built for curious minds of all ages — from 6 to 96!
        </motion.p>
      </main>
    </div>
  );
};

export default Index;
