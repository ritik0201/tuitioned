'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Sparkles } from 'lucide-react';

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
      <div className={`w-14 h-8 rounded-full bg-slate-200/50 dark:bg-slate-800/50 border border-slate-300/40 dark:border-slate-700/40 animate-pulse ${className}`} />
    );
  }

  const isDark = resolvedTheme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <button
        onClick={toggleTheme}
        type="button"
        className={`relative w-14 h-8 rounded-full p-1 transition-colors duration-500 shadow-inner outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 cursor-pointer overflow-hidden group select-none border ${
          isDark
            ? 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-indigo-500/30 shadow-indigo-950/50'
            : 'bg-gradient-to-r from-amber-200 via-sky-300 to-sky-400 border-amber-300/60 shadow-sky-200/50'
        }`}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        aria-label="Toggle theme mode"
      >
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <AnimatePresence mode="wait">
            {isDark ? (
              <motion.div
                key="dark-stars"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full relative"
              >
                {/* Tiny star dots for dark mode */}
                <span className="absolute top-1.5 left-2.5 w-1 h-1 rounded-full bg-white/90 shadow-[0_0_3px_#fff] animate-pulse" />
                <span className="absolute bottom-2 left-4 w-0.5 h-0.5 rounded-full bg-white/70" />
                <span className="absolute top-2 left-6 w-1 h-1 rounded-full bg-indigo-200/80 shadow-[0_0_3px_#a5b4fc]" />
              </motion.div>
            ) : (
              <motion.div
                key="light-clouds"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full relative"
              >
                {/* Soft sun rays / cloud hints for light mode */}
                <span className="absolute bottom-0 right-1.5 w-4 h-2 rounded-t-full bg-white/60 backdrop-blur-xs" />
                <span className="absolute top-1 right-5 w-2 h-2 rounded-full bg-amber-100/50" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sliding Knob */}
        <motion.div
          className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center shadow-md border backdrop-blur-xs ${
            isDark
              ? 'bg-gradient-to-tr from-indigo-900 to-slate-800 border-indigo-400/40 text-amber-300 shadow-indigo-500/30'
              : 'bg-gradient-to-tr from-amber-400 to-yellow-300 border-amber-200 text-amber-900 shadow-amber-500/40'
          }`}
          animate={{
            x: isDark ? 24 : 0,
            rotate: isDark ? 360 : 0,
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
          }}
        >
          <AnimatePresence mode="wait">
            {isDark ? (
              <motion.div
                key="moon-icon"
                initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                transition={{ duration: 0.2 }}
              >
                <Moon className="w-3.5 h-3.5 text-amber-300 fill-amber-300/20" />
              </motion.div>
            ) : (
              <motion.div
                key="sun-icon"
                initial={{ opacity: 0, rotate: 90, scale: 0.5 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: -90, scale: 0.5 }}
                transition={{ duration: 0.2 }}
              >
                <Sun className="w-3.5 h-3.5 text-amber-950 fill-amber-900/20" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </button>

      {showText && (
        <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${isDark ? 'bg-indigo-400 shadow-[0_0_6px_#818cf8]' : 'bg-amber-500 shadow-[0_0_6px_#f59e0b]'}`} />
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </span>
      )}
    </div>
  );
}

export default ThemeToggle;
