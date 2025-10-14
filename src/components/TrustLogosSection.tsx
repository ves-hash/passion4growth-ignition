import logo1 from '@/assets/logos/logo-1.png';
import logo2 from '@/assets/logos/logo-2.png';
import dilon from '@/assets/logos/dilon.png';
import arfa7 from '@/assets/logos/arfa7.png';
import logo5 from '@/assets/logos/logo-5.png';
import cashlend from '@/assets/logos/cashlend.png';
import forkpoint from '@/assets/logos/forkpoint.png';
import myfoot from '@/assets/logos/myfoot.png';
import logo9 from '@/assets/logos/logo-9.png';
import newwave from '@/assets/logos/newwave.png';
import hoploud from '@/assets/logos/hoploud.png';
import hexagon from '@/assets/logos/hexagon.png';

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
    { src: logo9, alt: 'Client logo' },
    { src: newwave, alt: 'New Wave Digital' },
    { src: hoploud, alt: 'Hoploud' },
    { src: hexagon, alt: 'Client logo' }
  ];

  return (
    <section className="py-16" style={{ backgroundColor: '#fbf5f4' }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm text-muted-foreground mb-8 text-center">
            Trusted by B2B founders across EU & US
          </p>
          <div className="relative overflow-hidden">
            <div className="flex animate-scroll gap-x-12">
              {[...trustLogos, ...trustLogos].map((logo, index) => (
                <img 
                  key={index} 
                  src={logo.src} 
                  alt={logo.alt}
                  className="h-6 object-contain opacity-60 hover:opacity-100 transition-opacity duration-300 flex-shrink-0 grayscale brightness-0"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustLogosSection;
