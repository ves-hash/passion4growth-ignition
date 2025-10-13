import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import logo1 from '@/assets/logos/logo-1.png';
import logo2 from '@/assets/logos/logo-2.png';
import dilon from '@/assets/logos/dilon.png';
import arfa7 from '@/assets/logos/arfa7.png';
import logo5 from '@/assets/logos/logo-5.png';
import cashlend from '@/assets/logos/cashlend.png';
import forkpoint from '@/assets/logos/forkpoint.png';
import myfoot from '@/assets/logos/myfoot.png';
import logo9 from '@/assets/logos/logo-9.png';

interface PersonaOption {
  key: string;
  label: string;
  headline: string;
  subheadline: string;
  proof: string;
}

const HeroSection = () => {
  const [selectedPersona, setSelectedPersona] = useState<string>('saas');

  const personaOptions: PersonaOption[] = [
    {
      key: 'saas',
      label: 'SaaS Founder',
      headline: 'Land Enterprise Deals with Buying Teams That Matter',
      subheadline: 'Stand out in crowded categories, trigger intent on LinkedIn, and build a pipeline you can forecast.',
      proof: 'Recent wins: ACVs ↑, cycle time ↓'
    },
    {
      key: 'logistics',
      label: 'Logistics Executive',
      headline: 'Win Strategic Partnerships in Logistics & 3PL',
      subheadline: 'Positioning + targeted outreach to decision-makers that convert into long-term contracts.',
      proof: '45 meetings in 2 months — logistics case'
    },
    {
      key: 'wholesale',
      label: 'Wholesale CEO',
      headline: 'Open High-Margin Accounts, Predictably',
      subheadline: 'Partner motions + BD systems that turn visibility into purchase orders.',
      proof: 'New market entries in weeks'
    }
  ];

  const currentPersona = personaOptions.find(p => p.key === selectedPersona) || personaOptions[0];
  
  const trustLogos = [
    { src: logo1, alt: 'Client logo' },
    { src: logo2, alt: 'Client logo' },
    { src: dilon, alt: 'Dilon' },
    { src: arfa7, alt: 'Arfa7' },
    { src: logo5, alt: 'Client logo' },
    { src: cashlend, alt: 'Cashlend' },
    { src: forkpoint, alt: 'Forkpoint' },
    { src: myfoot, alt: 'MyFoot' },
    { src: logo9, alt: 'Client logo' }
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-accent-light/5 pt-20 pb-24 sm:pt-24 sm:pb-32">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNlYTFkMjUiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>
      
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Left Column - Content */}
            <div className="animate-fade-in">
              {/* Persona Switcher */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-muted-foreground mb-3">
                  I'm a...
                </label>
                <div className="flex flex-wrap gap-2">
                  {personaOptions.map((persona) => (
                    <button
                      key={persona.key}
                      onClick={() => setSelectedPersona(persona.key)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        selectedPersona === persona.key
                          ? 'bg-primary text-primary-foreground shadow-soft'
                          : 'bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground'
                      }`}
                    >
                      {persona.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Content */}
              <div className="space-y-6">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                  {currentPersona.headline}
                </h1>
                
                <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                  {currentPersona.subheadline}
                </p>

                <div className="flex items-center space-x-2 text-accent font-medium">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>{currentPersona.proof}</span>
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button variant="primary" size="lg" className="group" asChild>
                    <a href="#book-call">
                      Book a Strategy Call
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </a>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <a href="#case-studies">See Case Studies</a>
                  </Button>
                </div>
              </div>

              {/* Trust Bar */}
              <div className="mt-12 pt-8 border-t border-border">
                <p className="text-sm text-muted-foreground mb-4">
                  Trusted by B2B founders across EU & US
                </p>
                <div className="flex flex-wrap items-center gap-8 opacity-70">
                  {trustLogos.map((logo, index) => (
                    <img 
                      key={index} 
                      src={logo.src} 
                      alt={logo.alt}
                      className="h-8 object-contain grayscale hover:grayscale-0 transition-all duration-300"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Visual */}
            <div className="animate-slide-up">
              <div className="relative">
                <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-8 border border-border">
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-center mb-8">The Revenue Engine</h3>
                    
                    <div className="space-y-4">
                      {[
                        { step: '1', title: 'Visibility', desc: 'Position as obvious choice' },
                        { step: '2', title: 'Conversations', desc: 'Ready-to-buy prospects' },
                        { step: '3', title: 'Deals', desc: 'Predictable pipeline' }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center space-x-4 p-4 bg-background rounded-lg shadow-soft">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold">
                            {item.step}
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground">{item.title}</h4>
                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                          </div>
                          {index < 2 && (
                            <div className="ml-auto">
                              <ArrowRight className="h-4 w-4 text-accent" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;