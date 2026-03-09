import Header from "@/components/Header";
import GameCard from "@/components/GameCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { allGames } from "@/data/games";

const Index = () => {
  const navigate = useNavigate();
  const featuredGames = allGames.slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 text-center">
        <div className="animate-fade-in">
          <div className="inline-block mb-6">
            <span className="text-6xl animate-float inline-block">🎯</span>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold font-primary text-foreground mb-6 leading-tight tracking-tight">
            Play. Learn. <span className="text-accent">Think.</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground font-secondary max-w-xl mx-auto mb-10 leading-relaxed">
            Learn mathematics and physics through fun interactive games. 
            No setup, no instructions — just click and start playing!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button variant="hero" size="xl" onClick={() => navigate("/games")}>
              🚀 Play Now
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate("/about")}>
              Learn More
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 flex flex-wrap justify-center gap-8 sm:gap-16 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          {[
            { value: "4+", label: "Games" },
            { value: "All Ages", label: "Accessibility" },
            { value: "Free", label: "Always" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold font-primary text-accent">{stat.value}</p>
              <p className="text-sm text-muted-foreground font-secondary">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Games */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold font-primary text-foreground mb-3">Featured Games ⭐</h2>
          <p className="text-muted-foreground font-secondary">Pick a game and start learning instantly</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredGames.map((game) => (
            <GameCard key={game.title} {...game} />
          ))}
        </div>
        <div className="text-center mt-10">
          <Button variant="outline" size="lg" onClick={() => navigate("/games")}>
            View All Games →
          </Button>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-secondary py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold font-primary text-foreground mb-4">
            Ready to start learning? 🧠
          </h2>
          <p className="text-muted-foreground font-secondary mb-8">
            Click once. Play instantly. Learn naturally. It's that simple.
          </p>
          <Button variant="hero" size="xl" onClick={() => navigate("/games")}>
            Browse Games
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center border-t border-border">
        <p className="text-sm text-muted-foreground font-secondary">
          🎮 PlayLearn — Built for curious minds of all ages
        </p>
      </footer>
    </div>
  );
};

export default Index;
