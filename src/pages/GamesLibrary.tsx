import Header from "@/components/Header";
import GameCard from "@/components/GameCard";
import { allGames } from "@/data/games";

const GamesLibrary = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-4xl font-bold font-primary text-foreground mb-3">Game Library 🎮</h1>
          <p className="text-muted-foreground font-secondary text-lg">
            All our educational games in one place. Click any game to start playing!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: "0.15s" }}>
          {allGames.map((game) => (
            <GameCard key={game.title} {...game} />
          ))}
        </div>

        {allGames.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground font-secondary text-lg">
              More games coming soon! 🚀
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default GamesLibrary;
