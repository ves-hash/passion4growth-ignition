import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQSection = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Do you only do LinkedIn?',
      a: 'LinkedIn is a primary channel, not our identity. We build revenue systems including positioning, outbound, inbound, and partnerships.'
    },
    {
      q: 'How do you measure success?',
      a: 'SQLs, deals created, win rate, cycle time, and revenue. No fluff.'
    },
    {
      q: 'What do you need from us?',
      a: 'Access, clarity, and a decision-maker. We drive; you steer the vision.'
    },
    {
      q: 'How fast can we see results?',
      a: 'Early momentum often starts in 30–60 days; predictability compounds month over month.'
    }
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-12 text-center">
            Questions, Answered.
          </h2>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-border rounded-lg overflow-hidden">
                <button
                  className="w-full px-6 py-4 text-left bg-background hover:bg-secondary/50 transition-colors duration-200 flex items-center justify-between"
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                >
                  <span className="font-semibold text-foreground">{faq.q}</span>
                  {openFAQ === index ? (
                    <ChevronUp className="h-5 w-5 text-accent" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-accent" />
                  )}
                </button>
                {openFAQ === index && (
                  <div className="px-6 py-4 bg-secondary/20 border-t border-border">
                    <p className="text-muted-foreground">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;