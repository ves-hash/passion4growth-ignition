import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const ProgramsSection = () => {
  const programs = [
    {
      name: 'Done-For-You (BDaS)',
      outcome: 'A predictable pipeline without adding headcount.',
      bullets: [
        'Full outbound motion + intent signals',
        'CRM + KPIs + weekly optimization',
        'Executive insights, not noise'
      ],
      priceNote: 'Optional: starting at €5k/mo',
      cta: { label: 'See If We\'re a Fit', href: '#book-call' }
    },
    {
      name: 'Go-To-Market (GTM)',
      outcome: 'Enter, validate, and scale with partnerships.',
      bullets: [
        'ICP & positioning sprints',
        'Offer packaging & pricing tests',
        'Co-selling partner acquisition'
      ],
      priceNote: 'Optional: from €1.1k–€2.2k/mo tiers',
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
      priceNote: 'Launch cohort: €1k/mo (first 3 months) → €250/mo',
      cta: { label: 'Explore the Accelerator', href: '/services#accelerator' }
    }
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Choose Your Program
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
                  <p className="text-sm text-muted-foreground mb-4">
                    {program.priceNote}
                  </p>
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

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            Prices are indicative; final scope on discovery.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProgramsSection;