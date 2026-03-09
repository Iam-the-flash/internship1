import Header from "@/components/Header";

const Progress = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-16 text-center">
        <div className="animate-fade-in">
          <span className="text-5xl mb-6 inline-block">📊</span>
          <h1 className="text-4xl font-bold font-primary text-foreground mb-4">Your Progress</h1>
          <p className="text-lg text-muted-foreground font-secondary mb-8">
            Track your learning journey across all games.
          </p>

          <div className="bg-card rounded-2xl p-10 shadow-card">
            <span className="text-4xl mb-4 inline-block">🚧</span>
            <h3 className="text-xl font-bold font-primary text-card-foreground mb-2">Coming Soon!</h3>
            <p className="text-muted-foreground font-secondary">
              We're building a progress tracking system so you can see your improvements over time. 
              For now, just keep playing and having fun!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Progress;
