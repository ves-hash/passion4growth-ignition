import logo1 from '@/assets/logos/logo-1.png';
import logo2 from '@/assets/logos/logo-2.png';
import dilon from '@/assets/logos/dilon.png';
import arfa7 from '@/assets/logos/arfa7.png';
import logo5 from '@/assets/logos/logo-5.png';
import cashlend from '@/assets/logos/cashlend.png';
import forkpoint from '@/assets/logos/forkpoint.png';
import myfoot from '@/assets/logos/myfoot.png';
import logo9 from '@/assets/logos/logo-9.png';

const TrustLogosSection = () => {
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
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm text-muted-foreground mb-8 text-center">
            Trusted by B2B founders across EU & US
          </p>
          <div className="flex items-center justify-center gap-x-12 flex-wrap gap-y-6">
            {trustLogos.map((logo, index) => (
              <img 
                key={index} 
                src={logo.src} 
                alt={logo.alt}
                className="h-6 object-contain opacity-40 hover:opacity-100 transition-opacity duration-300"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustLogosSection;
