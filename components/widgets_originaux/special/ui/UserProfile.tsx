'use client';

import { User, Mail, Phone, MapPin, Calendar, Edit, Shield, CreditCard, Bell, Globe, Award, LogOut, X, Camera, Clock } from 'lucide-react';
import { useUI } from '@/hooks/useUI';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '@/store/theme.store';
import Button from './Button';
import Card from './Card';
import Badge from './Badge';

export default function UserProfile() {
  const { closeAllModals } = useUI();
  const [activeTab, setActiveTab] = useState('profile');
  const { resolvedTheme: theme } = useThemeStore();
  const isDark = theme === 'dark';

  const user = {
    name: 'Administrateur',
    email: 'admin@lotuspro.com',
    phone: '+33 1 23 45 67 89',
    location: 'Paris, France',
    joinDate: '15 Janvier 2023',
    role: 'Administrateur Principal',
    department: 'Direction Générale',
    company: 'Lotus Technologies',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin&backgroundColor=10b981',
    plan: 'Enterprise',
    status: 'Actif',
    lastLogin: 'Aujourd\'hui, 09:42',
  };

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'billing', label: 'Licence', icon: CreditCard },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={`
          relative w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]
          ${isDark ? 'bg-[#071217]' : 'bg-gray-50'}
        `}
      >
        {/* Banner Area */}
        <div className="h-48 relative overflow-hidden bg-[#071217]">
          <div className="absolute inset-0 bg-gradient-to-r from-[#23BE31]/20 to-[#071217] z-10" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 z-0" />
          <div className="absolute top-0 right-0 p-8 z-20">
            <button
              onClick={closeAllModals}
              className="p-2 rounded-full bg-black/20 text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Profile Header Block (Overlapping) */}
        <div className="px-8 -mt-20 relative z-20 flex flex-col md:flex-row items-end gap-6 pb-6 border-b border-gray-200 dark:border-gray-800">
          <div className="relative group">
            <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-[#071217] shadow-xl bg-white relative">
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#23BE31] rounded-full border-4 border-[#071217] flex items-center justify-center text-white">
              <Award className="w-4 h-4" />
            </div>
          </div>

          <div className="flex-1 mb-2">
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.name}</h1>
            <div className="flex items-center gap-2 mt-1 opacity-80">
              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${isDark ? 'bg-white/10 text-white' : 'bg-gray-200 text-gray-700'}`}>
                {user.role}
              </span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-500">{user.email}</span>
            </div>
          </div>

          <div className="flex gap-3 mb-2">
            <Button variant="outline" size="sm" icon={Edit}>
              Modifier
            </Button>
            <Button variant="danger" size="sm" icon={LogOut}>
              Déconnexion
            </Button>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Navigation */}
          <div className={`w-64 p-6 border-r hidden md:block ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
            <div className="space-y-1">
              {tabs.map(tab => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                       w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm
                       ${isActive
                        ? 'bg-[#23BE31]/10 text-[#23BE31]'
                        : isDark ? 'text-gray-400 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-100'
                      }
                     `}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            <div className="mt-8 pt-8 border-t border-gray-700/20">
              <div className={`p-4 rounded-xl ${isDark ? 'bg-[#23BE31]/5' : 'bg-emerald-50'}`}>
                <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-[#23BE31]' : 'text-emerald-700'}`}>
                  Plan Actuel
                </h4>
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Enterprise</span>
                  <Badge status="success" text="Actif" />
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-[#23BE31]" />
                </div>
                <p className="text-[10px] mt-2 opacity-60">Renouvellement dans 14 jours</p>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-white dark:bg-[#071217]">
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <h3 className={`text-lg font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Informations Personnelles</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <Card className="p-4" variant={isDark ? 'outline' : 'default'}>
                      <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Contact</div>
                      <div className="flex items-center gap-3 mb-2">
                        <Mail className="w-4 h-4 text-[#23BE31]" />
                        <span className={isDark ? 'text-gray-200' : 'text-gray-800'}>{user.email}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-[#23BE31]" />
                        <span className={isDark ? 'text-gray-200' : 'text-gray-800'}>{user.phone}</span>
                      </div>
                    </Card>

                    <Card className="p-4" variant={isDark ? 'outline' : 'default'}>
                      <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Organisation</div>
                      <div className="mb-1 font-semibold dark:text-gray-200">{user.company}</div>
                      <div className="text-sm opacity-70 mb-2">{user.department}</div>
                      <div className="flex items-center gap-2 text-xs opacity-50">
                        <MapPin className="w-3 h-3" />
                        {user.location}
                      </div>
                    </Card>
                  </div>

                  <div className="mt-8">
                    <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Dernière Activité</h3>
                    <div className={`p-4 rounded-xl border ${isDark ? 'border-gray-800 bg-[#0f1d24]' : 'border-gray-100 bg-gray-50'}`}>
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-full bg-green-500/10 text-green-500">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-semibold dark:text-gray-200">Session active</div>
                          <div className="text-sm opacity-60">Connecté depuis Chrome sur Windows • {user.lastLogin}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              {/* Other tabs would go here */}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}