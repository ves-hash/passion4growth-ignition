import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const ProgramsSection = () => {
  const programs = [
    {
      name: 'Go-To-Market (GTM)',
      outcome: 'Enter, validate, and scale with partnerships.',
      bullets: [
        'ICP & positioning sprints',
        'Offer packaging & pricing tests',
        'Co-selling partner acquisition'
      ],
      cta: { label: 'Discuss GTM', href: '#book-call' }
    },
    {
      name: 'LinkedIn Growth Accelerator',
      outcome: 'Authority that attracts the right conversations.',
      bullets: [
        'Profile authority + content engine',
        'Signal-based outbound',
        'SQL visibility reporting'
      ],
      cta: { label: 'Explore the Accelerator', href: '/services#accelerator' }
    },
    {
      name: 'Business Development (BDaS)',
      outcome: 'A predictable pipeline without adding headcount.',
      bullets: [
        'Full outbound motion + intent signals',
        'CRM + KPIs + weekly optimization',
        'Executive insights, not noise'
      ],
      cta: { label: 'See If We\'re a Fit', href: '#book-call' }
    }
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Choose Your Service
          </h2>
          <p className="text-xl text-muted-foreground">
            Pick the path that fits your stage. Same revenue engine under the hood.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {programs.map((program, index) => (
            <Card key={index} className="relative group hover:shadow-strong transition-all duration-300 border-2 hover:border-accent">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-foreground mb-2">
                  {program.name}
                </CardTitle>
                <CardDescription className="text-lg font-medium text-accent">
                  {program.outcome}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {program.bullets.map((bullet, bulletIndex) => (
                    <li key={bulletIndex} className="flex items-start space-x-2">
                      <CheckCircle2 className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{bullet}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-4 border-t border-border">
                  <Button 
                    variant="outline" 
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary" 
                    asChild
                  >
                    <a href={program.cta.href}>
                      {program.cta.label}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </section>
  );
};

export default ProgramsSection;