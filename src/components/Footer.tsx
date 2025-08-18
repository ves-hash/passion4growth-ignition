const Footer = () => {
  const footerColumns = [
    {
      title: 'Passion4Growth',
      links: [
        { label: 'Programs', href: '/programs' },
        { label: 'Services', href: '/services' },
        { label: 'Process', href: '/#process' }
      ]
    },
    {
      title: 'Resources',
      links: [
        { label: 'Revenue Engine Playbook', href: '/playbook' },
        { label: 'Insights', href: '/insights' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy', href: '/privacy' },
        { label: 'Terms', href: '/terms' },
        { label: 'Cookie Settings', href: '/cookies' }
      ]
    }
  ];

  return (
    <footer className="bg-muted text-white py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P4G</span>
              </div>
              <span className="font-montserrat font-bold text-xl">
                Passion4Growth
              </span>
            </div>
            <p className="text-white/80 text-sm">
              Revenue Growth Partner for B2B founders and executive teams.
            </p>
          </div>

          {/* Links Columns */}
          {footerColumns.map((column, index) => (
            <div key={index}>
              <h3 className="font-semibold text-white mb-4">{column.title}</h3>
              <ul className="space-y-2">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a 
                      href={link.href}
                      className="text-white/70 hover:text-white transition-colors duration-200 text-sm"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/60 text-sm">
              © Passion4Growth. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="mailto:privacy@passion4growth.com" className="text-white/60 hover:text-white text-sm transition-colors duration-200">
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;