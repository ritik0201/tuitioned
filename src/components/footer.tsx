import React from 'react';
import { FaInstagram, FaTwitter, FaLinkedin } from 'react-icons/fa';

const footerLinks = [
  {
    title: 'Courses',
    links: [
      { label: 'K-12 Tuition', href: 'https://tuition-ed.com/k-12-school-time-courses/' },
      { label: 'Language Learning', href: '#' },
      { label: 'Coding & Tech', href: '#' },
      { label: 'Music & Arts', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: 'https://tuition-ed.com/about-us/' },
      { label: 'Careers', href: '#' },
      { label: 'Contact Us', href: 'https://tuition-ed.com/contact-us/' },
      { label: 'Become a Teacher', href: '#' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Blog', href: 'https://tuition-ed.com/blog/' },
      { label: 'Community', href: '#' },
      { label: 'Help Center', href: '#' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Cookie Policy', href: '#' },
    ],
  },
];

const Footer = () => {
  const socialLinks = [
    { href: '#', icon: FaTwitter, label: 'Twitter' },
    { href: 'https://www.instagram.com/wearetuitioned?igsh=MXBnMWwxbms2MDNmZw==', icon: FaInstagram, label: 'Instagram' },
    { href: 'https://www.linkedin.com/company/tuitioned/', icon: FaLinkedin, label: 'LinkedIn' },
  ];
  const Logo = () => (
    <span className="font-bold text-xl tracking-tight">
      Tuition-ed
    </span>
  );

  return (
    <footer className="bg-black">
      <div className="container mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <Logo />
            <p className="text-sm text-secondary-foreground/80">
              Your partner in online learning and academic excellence.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              {footerLinks.slice(0, 2).map((section) => (
                <div key={section.title}>
                  <h3 className="text-sm font-semibold leading-6">{section.title}</h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {section.links.map((item) => (
                      <li key={item.label}>
                        <a href={item.href} className="text-sm leading-6 text-secondary-foreground/80 hover:text-primary">
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              {footerLinks.slice(2, 4).map((section) => (
                <div key={section.title}>
                  <h3 className="text-sm font-semibold leading-6">{section.title}</h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {section.links.map((item) => (
                      <li key={item.label}>
                        <a href={item.href} className="text-sm leading-6 text-secondary-foreground/80 hover:text-primary">
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-secondary-foreground/10 pt-8 sm:mt-20 lg:mt-24 md:flex md:items-center md:justify-between">
          <div className="flex space-x-6 md:order-2">
            {socialLinks.map((item) => (
              <a key={item.label} href={item.href} className="hover:text-primary">
                <span className="sr-only">{item.label}</span>
                <item.icon className="h-6 w-6" aria-hidden="true" />
              </a>
            ))}
          </div>
          <p className="mt-8 text-xs leading-5 md:order-1 md:mt-0">
              &copy; {new Date().getFullYear()} Tuition-ed. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;