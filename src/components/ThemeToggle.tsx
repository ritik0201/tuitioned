'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  showText?: boolean;
}

export function ThemeToggle({ className = '', showText = false }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-9 h-9 rounded-xl bg-slate-200/50 dark:bg-slate-800/50 border border-slate-300/40 dark:border-slate-700/40 animate-pulse ${className}`} />
    );
  }

  const isDark = resolvedTheme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center gap-2 p-2 rounded-xl transition-all duration-300
        bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300/80
        dark:bg-slate-800/80 dark:hover:bg-slate-700/90 dark:text-amber-400 dark:border-slate-700/60
        shadow-sm hover:shadow active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer
        ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle light and dark mode"
    >
      <div className="relative w-5 h-5 flex items-center justify-center overflow-hidden">
        <Sun
          className={`w-5 h-5 text-amber-500 transition-all duration-500 transform ${
            isDark ? 'rotate-90 scale-0 opacity-0 absolute' : 'rotate-0 scale-100 opacity-100'
          }`}
        />
        <Moon
          className={`w-5 h-5 text-blue-400 transition-all duration-500 transform ${
            isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0 absolute'
          }`}
        />
      </div>
      {showText && (
        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </span>
      )}
      <span className="sr-only">Toggle mode</span>
    </button>
  );
}

export default ThemeToggle;
