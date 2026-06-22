'use client';

import { Search, X, Loader2, Command } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useUI } from '@/hooks/useUI';
import { useThemeStore } from '@/store/theme.store';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchBarProps {
  mobile?: boolean;
}

export default function SearchBar({ mobile = false }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isSearchExpanded, toggleSearch } = useUI();
  const { resolvedTheme: theme } = useThemeStore();
  const isDark = theme === 'dark';
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setLoading(true);
      // Simuler une recherche
      setTimeout(() => setLoading(false), 1000);
    }
  };

  return (
    <div ref={containerRef} className={`relative ${mobile ? 'w-full' : ''}`}>
      <form onSubmit={handleSearch} className={`relative transition-all duration-300 ${mobile ? 'w-full' : 'w-[400px]'}`}>
        <motion.div
          animate={{
            boxShadow: isFocused
              ? '0 0 0 2px rgba(35, 190, 49, 0.2)'
              : '0 0 0 0px rgba(0, 0, 0, 0)',
            backgroundColor: isDark
              ? isFocused ? '#0f1d24' : 'rgba(255,255,255,0.05)'
              : isFocused ? '#ffffff' : '#f3f4f6'
          }}
          className={`
             relative rounded-xl overflow-hidden border transition-colors
             ${isDark ? 'border-[#23BE31]/10' : 'border-gray-200'}
           `}
        >
          <input
            type="text"
            placeholder="Rechercher..."
            className={`
              w-full pl-12 pr-10 py-2.5 bg-transparent
              text-sm transition-all focus:outline-none
              ${isDark ? 'text-white placeholder:text-gray-500' : 'text-gray-900 placeholder:text-gray-400'}
            `}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
          />

          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            {loading ? (
              <Loader2 className="w-5 h-5 text-[#23BE31] animate-spin" />
            ) : (
              <Search className={`w-5 h-5 ${isFocused ? 'text-[#23BE31]' : 'text-gray-400'}`} />
            )}
          </div>

          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}

          {!query && (
            <div className={`
              absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[10px] font-medium border
              ${isDark
                ? 'border-gray-700 text-gray-500 bg-white/5'
                : 'border-gray-200 text-gray-400 bg-white'
              }
            `}>
              ⌘K
            </div>
          )}
        </motion.div>
      </form>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {isFocused && (query || true) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className={`
              absolute top-full left-0 right-0 mt-2 rounded-xl shadow-2xl border overflow-hidden z-50 backdrop-blur-xl
              ${isDark
                ? 'bg-[#0f1d24]/95 border-[#23BE31]/20'
                : 'bg-white/95 border-gray-100'
              }
            `}
          >
            <div className="p-2">
              <div className={`px-3 py-2 text-xs font-semibold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Suggestions
              </div>

              <div className="space-y-1">
                {[
                  { label: "Produits récents", icon: Command },
                  { label: "Clients actifs", icon: Command },
                  { label: "Commandes en cours", icon: Command },
                ].map((item, i) => (
                  <button
                    key={i}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors group
                      ${isDark
                        ? 'hover:bg-[#23BE31]/10 text-gray-300 hover:text-white'
                        : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'
                      }
                    `}
                  >
                    <div className={`
                      p-1.5 rounded-md
                      ${isDark ? 'bg-white/5 group-hover:bg-[#23BE31]/20 text-gray-400 group-hover:text-[#23BE31]' : 'bg-gray-100 group-hover:bg-emerald-50 text-gray-400 group-hover:text-[#23BE31]'}
                    `}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={`
              mt-2 border-t p-2 bg-opacity-50
              ${isDark ? 'border-[#23BE31]/10 bg-[#23BE31]/5' : 'border-gray-50 bg-gray-50'}
            `}>
              <p className="text-xs text-center text-gray-400">
                Appuyez sur <span className="font-semibold">Entrée</span> pour rechercher
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}