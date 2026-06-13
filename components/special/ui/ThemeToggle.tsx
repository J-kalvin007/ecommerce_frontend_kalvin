

'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="dropdown dropdown-end">
      <button
        tabIndex={0}
        className="btn btn-ghost btn-circle"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? (
          <Sun className="w-5 h-5" />
        ) : (
          <Moon className="w-5 h-5" />
        )}
      </button>
      <ul
        tabIndex={0}
        className="dropdown-content z-[1] menu p-2 shadow-2xl bg-base-200 rounded-box w-52 mt-4"
      >
        <li>
          <button onClick={() => setTheme('light')}>
            <Sun className="w-4 h-4" />
            Mode Clair
          </button>
        </li>
        <li>
          <button onClick={() => setTheme('dark')}>
            <Moon className="w-4 h-4" />
            Mode Sombre
          </button>
        </li>
        <div className="divider my-1"></div>
        <li>
          <button onClick={() => setTheme('forest')}>
            <div className="w-4 h-4 rounded bg-gradient-to-r from-emerald-400 to-green-500"></div>
            Forest
          </button>
        </li>
        <li>
          <button onClick={() => setTheme('business')}>
            <div className="w-4 h-4 rounded bg-gradient-to-r from-blue-500 to-cyan-500"></div>
            Business
          </button>
        </li>
        <li>
          <button onClick={() => setTheme('forest')}>
            <div className="w-4 h-4 rounded bg-gradient-to-r from-green-500 to-emerald-500"></div>
            Forest
          </button>
        </li>
        <li>
          <button onClick={() => setTheme('synthwave')}>
            <div className="w-4 h-4 rounded bg-gradient-to-r from-purple-500 to-pink-500"></div>
            Synthwave
          </button>
        </li>
      </ul>
    </div>
  );
}