import { AlertTriangle, Target, TrendingUp } from 'lucide-react';

const ProblemSection = () => {
  const pains = [
    {
      icon: AlertTriangle,
      text: "You're visible — but not to the right people."
    },
    {
      icon: Target,
      text: "Your pipeline is unpredictable and hard to forecast."
    },
    {
      icon: TrendingUp,
      text: "Your team is chasing conversations that never close."
    }
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-12">
            If You're Here, You've Felt This.
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {pains.map((pain, index) => {
              const Icon = pain.icon;
              return (
                <div key={index} className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {pain.text}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="space-y-6 text-center">
            <p className="text-xl text-accent font-semibold">
              This slows growth, leaks time, and hides the real opportunities.
            </p>
            <p className="text-lg text-foreground max-w-3xl mx-auto">
              We combine positioning, targeted visibility, partnerships, and BD systems so you win bigger, better deals — predictably.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;