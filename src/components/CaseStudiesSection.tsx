import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, TrendingUp } from 'lucide-react';

const CaseStudiesSection = () => {
  const caseStudies = [
    {
      client: 'Dilon',
      result: '45 meetings in 2 months + major logistics partnership',
      before: 'Low brand visibility. No structure in outbound.',
      after: 'Consistent meetings with top-tier decision-makers and a flagship partnership.',
      cta: { label: 'View Case', href: '/case-studies/dilon' }
    },
    {
      client: 'Direx',
      result: '20 qualified leads per month in a complex B2B niche',
      before: 'Reliance on referrals only.',
      after: 'New-market entry strategy delivering partnerships within weeks.',
      cta: { label: 'View Case', href: '/case-studies/direx' }
    },
    {
      client: 'Craftberry',
      result: 'Stronger inbound pipeline and higher SQL quality',
      before: 'Limited awareness in target industries.',
      after: 'Positioning + outreach system attracting ideal buyers.',
      cta: { label: 'View Case', href: '/case-studies/craftberry' }
    }
  ];

  return (
    <section id="case-studies" className="py-24 bg-gradient-to-br from-accent-light/5 to-primary/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            From Invisible to In-Demand
          </h2>
          <p className="text-xl text-muted-foreground">
            Real companies. Real deals. Systems that keep compounding.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {caseStudies.map((study, index) => (
            <Card key={index} className="group hover:shadow-strong transition-all duration-300 bg-background">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <CardTitle className="text-lg font-bold text-foreground">
                    {study.client}
                  </CardTitle>
                  <TrendingUp className="h-5 w-5 text-accent" />
                </div>
                <CardDescription className="text-accent font-semibold text-base">
                  {study.result}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Before:</h4>
                    <p className="text-foreground text-sm">{study.before}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">After:</h4>
                    <p className="text-foreground text-sm">{study.after}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary"
                    asChild
                  >
                    <a href={study.cta.href}>
                      {study.cta.label}
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
            Results reflect specific scopes; your outcomes may vary.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CaseStudiesSection;