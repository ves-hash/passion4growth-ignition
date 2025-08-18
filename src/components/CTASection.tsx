import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar } from 'lucide-react';

const CTASection = () => {
  return (
    <section id="book-call" className="py-24 bg-gradient-to-br from-primary to-accent relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                Ready to Build a Deal Flow You Can Trust?
              </h2>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                Let's position you as the obvious choice and reach buyers who are ready now.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
              <Button 
                variant="secondary" 
                size="lg" 
                className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 shadow-strong"
                asChild
              >
                <a href="https://calendly.com/your-link?timezone=Europe/Sofia" target="_blank" rel="noopener noreferrer">
                  <Calendar className="mr-2 h-5 w-5" />
                  Book Your Strategy Call
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>

            <div className="pt-8">
              <div className="inline-flex items-center space-x-2 text-white/80 text-sm">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>15-minute strategy session</span>
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>No sales pitch</span>
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>Clear next steps</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;