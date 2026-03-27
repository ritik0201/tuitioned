'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './navbar';
import Footer from './footer';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  
  // Define routes that should NOT show the global navbar and footer
  const isDashboard = pathname.startsWith('/student') || 
                      pathname.startsWith('/teacher') || 
                      pathname.startsWith('/admin');

  if (isDashboard) {
    return (
      <div className="min-h-screen bg-slate-950">
        {children}
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="pt-16">{children}</div>
      <Footer />
    </>
  );
}
