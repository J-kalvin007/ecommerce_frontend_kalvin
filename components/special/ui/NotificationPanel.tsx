'use client';

import { Bell, Check, Trash2, Clock, AlertCircle, CheckCircle, XCircle, MessageSquare, Settings } from 'lucide-react';
import { useUI } from '@/hooks/useUI';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';

interface Notification {
  id: number;
  type: 'success' | 'warning' | 'error' | 'info' | 'message';
  title: string;
  description: string;
  time: string;
  unread: boolean;
  priority: 'high' | 'medium' | 'low';
}

export default function NotificationPanel() {
  const { isNotificationPanelOpen, toggleNotificationPanel } = useUI();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, type: 'success', title: 'Commande complétée', description: 'La commande #ORD-7841 a été traitée avec succès.', time: 'Il y a 5 min', unread: true, priority: 'medium' },
    { id: 2, type: 'warning', title: 'Stock faible', description: 'Le produit "iPhone 15 Pro" est presque épuisé.', time: 'Il y a 1 heure', unread: true, priority: 'high' },
    { id: 3, type: 'error', title: 'Erreur de paiement', description: 'Échec du paiement pour la commande #ORD-7838.', time: 'Il y a 2 heures', unread: false, priority: 'high' },
    { id: 4, type: 'info', title: 'Maintenance planifiée', description: 'Maintenance système prévue ce soir à 22h.', time: 'Il y a 5 heures', unread: false, priority: 'medium' },
    { id: 5, type: 'message', title: 'Nouveau message', description: 'Vous avez reçu un message de Sophie Bernard.', time: 'Il y a 1 jour', unread: false, priority: 'low' },
    { id: 6, type: 'success', title: 'Nouvel utilisateur', description: 'Thomas Dubois s\'est inscrit sur la plateforme.', time: 'Il y a 2 jours', unread: false, priority: 'low' },
    { id: 7, type: 'warning', title: 'Expiration de licence', description: 'Votre licence expirera dans 7 jours.', time: 'Il y a 3 jours', unread: false, priority: 'medium' },
    { id: 8, type: 'info', title: 'Mise à jour disponible', description: 'Une nouvelle version de l\'application est disponible.', time: 'Il y a 4 jours', unread: false, priority: 'low' },
  ]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'priority'>('all');

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'warning': return AlertCircle;
      case 'error': return XCircle;
      case 'message': return MessageSquare;
      default: return Bell;
    }
  };

  const COLORS = {
    success: '#23BE31',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    message: '#8b5cf6'
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return notification.unread;
    if (filter === 'priority') return notification.priority === 'high';
    return true;
  });

  const handleMarkAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, unread: false } : notif
      )
    );
  };

  const handleDelete = (id: number) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, unread: false })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  return (
    <AnimatePresence>
      {isNotificationPanelOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
            onClick={() => toggleNotificationPanel()}
          />
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`
              absolute right-0 mt-2 w-[400px] z-50 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl border
              ${isDark
                ? 'bg-[#0f1d24]/95 border-[#23BE31]/20'
                : 'bg-white/95 border-gray-100'
              }
            `}
          >
            {/* Header */}
            <div className={`
              p-6 border-b 
              ${isDark ? 'border-[#23BE31]/10 bg-[#23BE31]/5' : 'border-gray-100 bg-gray-50/50'}
            `}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${isDark ? 'bg-[#23BE31]/20 text-[#23BE31]' : 'bg-emerald-100 text-[#23BE31]'}`}>
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>Notifications</h3>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {notifications.filter(n => n.unread).length} non lues
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleMarkAllAsRead}
                    className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                    title="Tout marquer comme lu"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleClearAll}
                    className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                    title="Tout effacer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Filter tabs */}
              <div className="flex gap-2 p-1 rounded-xl bg-black/5 dark:bg-white/5">
                {['all', 'unread', 'priority'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab as any)}
                    className={`
                      flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold capitalize transition-all
                      ${filter === tab
                        ? (isDark ? 'bg-[#23BE31] text-white shadow-lg' : 'bg-white text-gray-900 shadow')
                        : (isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900')
                      }
                    `}
                  >
                    {tab === 'all' ? 'Toutes' : tab === 'unread' ? 'Non lues' : 'Prioritaires'}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              <AnimatePresence initial={false}>
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map((notification) => {
                    const Icon = getIcon(notification.type);
                    const color = COLORS[notification.type];

                    return (
                      <motion.div
                        key={notification.id}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`
                          relative p-4 border-b transition-colors group
                          ${isDark
                            ? 'border-[#23BE31]/5 hover:bg-white/5'
                            : 'border-gray-50 hover:bg-gray-50'
                          }
                          ${notification.unread ? (isDark ? 'bg-[#23BE31]/5' : 'bg-green-50/50') : ''}
                        `}
                      >
                        <div className="flex gap-4">
                          <div className="relative mt-1">
                            <div className={`p-2 rounded-xl bg-opacity-10`} style={{ backgroundColor: `${color}20`, color: color }}>
                              <Icon className="w-5 h-5" />
                            </div>
                            {notification.unread && (
                              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#23BE31] rounded-full border-2 border-white dark:border-[#0f1d24]" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1">
                              <h4 className={`text-sm font-semibold truncate pr-2 ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                                {notification.title}
                              </h4>
                              <span className="text-[10px] text-gray-400 whitespace-nowrap flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {notification.time}
                              </span>
                            </div>

                            <p className={`text-xs leading-relaxed mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {notification.description}
                            </p>

                            <div className="flex items-center justify-between">
                              {notification.priority === 'high' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-500/10 text-red-500">
                                  <AlertCircle className="w-3 h-3" />
                                  Urgent
                                </span>
                              )}

                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
                                {!notification.unread && (
                                  <button onClick={() => handleDelete(notification.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                                {notification.unread && (
                                  <button onClick={() => handleMarkAsRead(notification.id)} className="text-[#23BE31] hover:text-[#1fa92c] transition-colors">
                                    <Check className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-12 text-center"
                  >
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                      <Bell className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Aucune notification
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className={`p-3 text-center border-t ${isDark ? 'border-[#23BE31]/10' : 'border-gray-100'}`}>
              <button
                onClick={() => toggleNotificationPanel()}
                className="text-xs font-medium text-[#23BE31] hover:underline"
              >
                Voir l'historique complet
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}