import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface GameCardProps {
  title: string;
  description: string;
  emoji: string;
  difficulty: "Easy" | "Medium" | "Hard";
  path: string;
  color: "green" | "blue" | "purple" | "coral" | "primary";
}

const difficultyColors = {
  Easy: "bg-game-green/15 text-game-green",
  Medium: "bg-accent/15 text-accent",
  Hard: "bg-game-coral/15 text-game-coral",
};

const GameCard = ({ title, description, emoji, difficulty, path, color }: GameCardProps) => {
  const navigate = useNavigate();

  return (
    <div className="bg-card rounded-2xl shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-1 overflow-hidden group cursor-pointer"
      onClick={() => navigate(path)}
    >
      {/* Icon area */}
      <div className="h-36 bg-secondary flex items-center justify-center relative overflow-hidden">
        <span className="text-6xl group-hover:scale-110 transition-transform duration-300">
          {emoji}
        </span>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-lg font-bold font-primary text-card-foreground">{title}</h3>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${difficultyColors[difficulty]}`}>
            {difficulty}
          </span>
        </div>
        <p className="text-sm text-muted-foreground font-secondary leading-relaxed mb-4">
          {description}
        </p>
        <Button variant="play" size="sm" className="w-full">
          ▶ Play Now
        </Button>
      </div>
    </div>
  );
};

export default GameCard;
