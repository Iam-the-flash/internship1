import Header from "@/components/Header";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="text-center animate-fade-in">
          <span className="text-5xl mb-6 inline-block">📚</span>
          <h1 className="text-4xl font-bold font-primary text-foreground mb-4">About PlayLearn</h1>
          <p className="text-lg text-muted-foreground font-secondary leading-relaxed mb-8">
            PlayLearn is a free educational gaming platform designed to make learning math and physics 
            accessible to everyone — from young children to adults.
          </p>
        </div>

        <div className="space-y-6 animate-fade-in" style={{ animationDelay: "0.15s" }}>
          {[
            {
              emoji: "🎯",
              title: "Our Philosophy",
              text: "Click Once. Play Instantly. Learn Naturally. We believe learning should be effortless and fun. No complicated setups, no lengthy tutorials — just open a game and start learning."
            },
            {
              emoji: "🌍",
              title: "For Everyone",
              text: "Our games are designed with accessibility in mind. Large buttons, clear text, simple controls, and intuitive gameplay ensure that users of all ages and abilities can enjoy learning."
            },
            {
              emoji: "🧠",
              title: "Learn by Doing",
              text: "Every game on PlayLearn is grounded in real educational concepts from mathematics and physics. You'll build intuition naturally through play, not memorization."
            },
          ].map((item) => (
            <div key={item.title} className="bg-card rounded-2xl p-6 shadow-card">
              <div className="flex items-start gap-4">
                <span className="text-3xl">{item.emoji}</span>
                <div>
                  <h3 className="text-lg font-bold font-primary text-card-foreground mb-1">{item.title}</h3>
                  <p className="text-muted-foreground font-secondary leading-relaxed">{item.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default About;
