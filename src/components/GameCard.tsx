import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface GameCardProps {
  title: string;
  description: string;
  emoji: string;
  color: "primary" | "secondary" | "accent" | "green" | "blue" | "pink" | "yellow";
  path: string;
  ageRange: string;
}

const colorMap = {
  primary: "bg-primary",
  secondary: "bg-secondary",
  accent: "bg-accent",
  green: "bg-game-green",
  blue: "bg-game-blue",
  pink: "bg-game-pink",
  yellow: "bg-game-yellow",
};

const GameCard = ({ title, description, emoji, color, path, ageRange }: GameCardProps) => {
  const navigate = useNavigate();

  return (
    <motion.button
      onClick={() => navigate(path)}
      className={`${colorMap[color]} relative overflow-hidden rounded-2xl p-8 text-left shadow-card transition-shadow hover:shadow-game w-full min-h-[220px] flex flex-col justify-between cursor-pointer group`}
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="absolute top-4 right-4 text-5xl opacity-30 group-hover:opacity-50 transition-opacity">
        {emoji}
      </div>
      <div>
        <span className="inline-block rounded-full bg-card/20 px-3 py-1 text-xs font-semibold text-primary-foreground mb-3">
          {ageRange}
        </span>
        <h3 className="text-2xl font-bold text-primary-foreground font-display">{title}</h3>
      </div>
      <p className="text-sm text-primary-foreground/80 font-body mt-2">{description}</p>
      <div className="mt-4 inline-flex items-center gap-2 text-primary-foreground font-semibold text-sm">
        ▶ Play Now
      </div>
    </motion.button>
  );
};

export default GameCard;
