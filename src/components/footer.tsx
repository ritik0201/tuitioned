import React from 'react';
import { 
  Instagram, 
  Twitter, 
  Linkedin, 
  Github, 
  Mail, 
  Phone, 
  MapPin, 
  ChevronRight,
  Globe,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

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
    { href: '#', icon: Twitter, label: 'Twitter' },
    { href: 'https://www.instagram.com/wearetuitioned?igsh=MXBnMWwxbms2MDNmZw==', icon: Instagram, label: 'Instagram' },
    { href: 'https://www.linkedin.com/company/tuitioned/', icon: Linkedin, label: 'LinkedIn' },
  ];

  return (
    <footer className="relative bg-slate-950 pt-16 pb-8 overflow-hidden">
      {/* Neon Top Border Accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
      
      {/* Background Glows */}
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px] -mr-48 -mb-48" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px] -ml-48 -mt-48" />

      <div className="container mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 pb-16 border-b border-white/5">
          {/* Brand Section */}
          <div className="lg:col-span-4 space-y-8">
            <Link href="/" className="inline-block">
              <span className="text-3xl font-black italic tracking-tighter text-slate-100 italic">
                TuitionEd
              </span>
            </Link>
            <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
              Empowering learners worldwide through personalized, high-performance education protocols. 
              <span className="block mt-4 text-indigo-400 font-black italic flex items-center gap-2 tracking-widest text-[10px] uppercase">
                <Sparkles className="h-3 w-3" />
                Forging the Future
              </span>
            </p>
            
            <div className="flex items-center gap-4">
              {socialLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link 
                    key={item.label} 
                    href={item.href} 
                    className="h-10 w-10 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-400 hover:border-indigo-500/30 transition-all hover:-translate-y-1 shadow-lg"
                  >
                    <Icon className="h-5 w-5" />
                    <span className="sr-only">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Links Grid */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            {footerLinks.map((section) => (
              <div key={section.title} className="space-y-6">
                <h3 className="text-sm font-black uppercase text-slate-200 tracking-[0.2em] italic">
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.links.map((item) => (
                    <li key={item.label}>
                      <Link 
                        href={item.href} 
                        className="text-slate-500 hover:text-indigo-400 transition-colors flex items-center gap-1 group font-bold text-sm"
                      >
                        <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all" />
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic">
            <span className="flex items-center gap-2">
              <Globe className="h-3 w-3" />
              Global Deployment OK
            </span>
            <span className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 bg-green-500 rounded-full" />
              System Status: Nominal
            </span>
          </div>
          
          <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">
            &copy; {new Date().getFullYear()} TuitionEd Infinity Protocol. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
