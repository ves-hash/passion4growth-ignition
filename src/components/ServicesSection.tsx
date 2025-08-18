import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Target, BarChart3 } from 'lucide-react';

const ServicesSection = () => {
  const services = [
    {
      icon: Target,
      name: 'Positioning & Authority',
      outcome: 'Become the obvious choice.',
      bullets: ['Message-market fit', 'Executive profiles', 'Social proof system']
    },
    {
      icon: Users,
      name: 'Targeted Visibility & Outreach',
      outcome: 'Conversations with buyers that can say yes.',
      bullets: ['LinkedIn + partner motions', 'Intent-driven follow-ups', 'Calendar-ready opportunities']
    },
    {
      icon: BarChart3,
      name: 'Deal Flow & Ops',
      outcome: 'A pipeline you can trust.',
      bullets: ['CRM hygiene', 'Weekly KPIs', 'Learn → optimize → scale']
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-secondary/30 to-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            What We Do Best
          </h2>
          <p className="text-xl text-muted-foreground">
            Three pillars. One system.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card key={index} className="text-center hover:shadow-strong transition-all duration-300 border-2 hover:border-accent">
                <CardHeader className="pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-foreground mb-2">
                    {service.name}
                  </CardTitle>
                  <CardDescription className="text-lg font-medium text-accent">
                    {service.outcome}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-2">
                    {service.bullets.map((bullet, bulletIndex) => (
                      <li key={bulletIndex} className="text-muted-foreground text-sm">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;