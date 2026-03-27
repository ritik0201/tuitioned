"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  User, 
  LogOut, 
  Menu, 
  BrainCircuit, 
  X,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import UserProfileMenu from '@/components/UserProfileMenu';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
  { text: 'Dashboard', icon: LayoutDashboard, href: '/student/dashboard' },
  { text: 'My Courses', icon: BookOpen, href: '/student/courses' },
  { text: 'AI Test', icon: BrainCircuit, href: '/student/test' },
  { text: 'Profile', icon: User, href: '/student/profile' },
];

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const userName = session?.user?.fullName || 'Student';
  const userInitial = userName.charAt(0).toUpperCase();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500/30">
      {/* Top Header - Now Full Width and Topmost */}
      <header className="fixed top-0 left-0 right-0 z-50 flex h-20 items-center justify-between px-6 md:px-10 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-8">
          <Link href="/" className="inline-block">
            <span className="text-2xl font-bold text-white tracking-tight">
              TuitionEd
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
           <UserProfileMenu userType="student" />
           <button 
             onClick={() => setIsSidebarOpen(!isSidebarOpen)}
             className="p-2 bg-slate-900 border border-slate-800 rounded-xl lg:hidden text-slate-400 hover:text-white"
           >
             {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
           </button>
        </div>
      </header>

      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Now starts below the header */}
      <aside className={cn(
        "fixed top-20 left-0 h-[calc(100vh-5rem)] w-72 bg-slate-900/80 backdrop-blur-2xl border-r border-slate-800 z-40 transition-transform duration-300 lg:translate-x-0 overflow-y-auto scrollbar-hide",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full py-6">
          {/* Navigation Links */}
          <nav className="flex-1 px-4 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link 
                  key={item.text} 
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-2xl transition-all group relative overflow-hidden",
                    isActive 
                      ? "bg-indigo-500/10 border border-indigo-500/30 text-white shadow-[0_0_20px_rgba(99,102,241,0.1)]" 
                      : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-full" />
                  )}
                  <div className="flex items-center gap-4 relative z-10">
                    <Icon className={cn(
                      "h-5 w-5 transition-transform group-hover:scale-110",
                      isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-indigo-400"
                    )} />
                    <span className="font-bold tracking-tight">{item.text}</span>
                  </div>
                  {isActive && <ChevronRight className="h-4 w-4 text-indigo-400/50" />}
                </Link>
              );
            })}
          </nav>

          {/* User Section (Bottom) */}
          <div className="p-6 mt-auto border-t border-slate-800">
            <div className="p-4 bg-slate-950/50 rounded-[1.5rem] border border-slate-800 mb-4 flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center font-black text-white shadow-lg">
                {userInitial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-white truncate">{userName}</p>
                <div className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">Online</span>
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full h-12 rounded-xl bg-red-500/5 hover:bg-red-500/10 text-red-400 hover:text-red-300 border border-red-500/20 font-bold transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-72 pt-20 flex flex-col min-h-screen">
        {/* Page Content */}
        <main className="flex-1 p-6 md:p-10 lg:p-12">
          {children}
        </main>
      </div>
    </div>
  );
}
