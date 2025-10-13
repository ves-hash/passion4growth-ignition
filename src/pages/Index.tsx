import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import TrustLogosSection from '@/components/TrustLogosSection';
import ProblemSection from '@/components/ProblemSection';
import ServicesSection from '@/components/ServicesSection';
import ProgramsSection from '@/components/ProgramsSection';
import CaseStudiesSection from '@/components/CaseStudiesSection';
import FAQSection from '@/components/FAQSection';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <TrustLogosSection />
        <ProblemSection />
        <ServicesSection />
        <ProgramsSection />
        <CaseStudiesSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
