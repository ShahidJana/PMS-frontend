import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function DarkToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      aria-label="Toggle dark mode"
      onClick={toggleTheme}
      className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-yellow-400 border border-slate-200 dark:border-slate-700 transition-all active:scale-95 hover:bg-slate-200 dark:hover:bg-slate-700 shadow-sm"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
