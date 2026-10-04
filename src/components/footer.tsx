'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Instagram, 
  Linkedin, 
  Twitter, 
  Youtube, 
  Mail, 
  MapPin, 
  ArrowUp,
  ArrowRight,
  BookOpen,
  ShieldCheck,
  Headphones
} from 'lucide-react';

const footerLinks = {
  courses: [
    { label: 'K-12 School Tuition', href: 'https://tuition-ed.com/k-12-school-time-courses/' },
    { label: 'Mathematics & Science', href: '/get-a-free-trial' },
    { label: 'Language & Communication', href: '/get-a-free-trial' },
    { label: 'Coding & Technology', href: '/get-a-free-trial' },
    { label: 'Exam Preparation', href: '/get-a-free-trial' },
  ],
  company: [
    { label: 'About Us', href: 'https://tuition-ed.com/about-us/' },
    { label: 'Pricing Plans', href: '/pricing' },
    { label: 'Educational Blog', href: 'https://tuition-ed.com/blog/' },
    { label: 'Contact Us', href: 'https://tuition-ed.com/contact-us/' },
    { label: 'Become a Teacher', href: '/get-a-free-trial' },
  ],
  support: [
    { label: 'Book Free Trial', href: '/get-a-free-trial' },
    { label: 'Help Center', href: 'https://tuition-ed.com/contact-us/' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Policy', href: '#' },
  ],
};

const Footer = () => {
  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const socialLinks = [
    { href: 'https://www.instagram.com/wearetuitioned?igsh=MXBnMWwxbms2MDNmZw==', icon: Instagram, label: 'Instagram' },
    { href: 'https://www.linkedin.com/company/tuitioned/', icon: Linkedin, label: 'LinkedIn' },
    { href: '#', icon: Twitter, label: 'Twitter' },
    { href: '#', icon: Youtube, label: 'YouTube' },
  ];

  return (
    <footer className="relative bg-card border-t border-border text-foreground pt-16 pb-12 transition-colors duration-200">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Top CTA Banner */}
        <div className="bg-background border border-border p-8 md:p-10 mb-16 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Start Learning Today
              </span>
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                Ready to Transform Your Academics?
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xl">
                Book a 1-on-1 trial class with our verified expert tutors and experience personalized learning tailored to your goals.
              </p>
            </div>

            <div className="lg:col-span-5 flex lg:justify-end">
              <Link
                href="/get-a-free-trial"
                className="inline-flex items-center justify-center gap-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 py-4 text-base transition-all shadow-md hover:shadow-lg hover:scale-[1.02] cursor-pointer whitespace-nowrap"
              >
                <span>Book Free Trial Now</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Feature Highlights Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 mb-12 border-b border-border">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 text-primary border border-primary/20 shrink-0">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">Personalized Curriculum</h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Tailored 1-on-1 tutoring sessions focused on your individual learning goals and pace.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 text-primary border border-primary/20 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">Verified Expert Educators</h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Learn directly from passionate, background-checked mentors and academic specialists.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 text-primary border border-primary/20 shrink-0">
              <Headphones className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">Dedicated Support</h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Our support team is always ready to assist students, parents, and educators.
              </p>
            </div>
          </div>
        </div>

        {/* Main Footer Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-12 border-b border-border">
          {/* Brand Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              <Link href="/" className="inline-block text-2xl font-extrabold tracking-tight text-foreground">
                Tuition<span className="text-primary">-ed</span>
              </Link>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
                Empowering students worldwide through interactive 1-on-1 online tutoring, K-12 academic excellence, and custom skill development.
              </p>
            </div>

            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <a href="mailto:support@tuition-ed.com" className="hover:text-foreground transition-colors">
                  support@tuition-ed.com
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span>Global Online Learning Platform</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-2 pt-1">
              {socialLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label}
                    className="p-2.5 bg-background border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-4">
                Courses
              </h4>
              <ul className="space-y-2.5 text-sm">
                {footerLinks.courses.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-4">
                Company
              </h4>
              <ul className="space-y-2.5 text-sm">
                {footerLinks.company.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-4">
                Support & Legal
              </h4>
              <ul className="space-y-2.5 text-sm">
                {footerLinks.support.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} TuitionEd. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <span className="hidden md:inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              1-on-1 Class Trial Sessions Available
            </span>

            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer"
              aria-label="Back to top"
            >
              <span>Back to top</span>
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

