import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  BellRing, 
  CheckCheck, 
  Trash2, 
  AlertTriangle, 
  Clock, 
  Flame, 
  Radio, 
  CheckCircle2,
  Sparkles,
  Info
} from 'lucide-react';
import { NotificationItem } from '../../types';
import { requestNotificationPermission, getNotificationPermissionState, showBrowserNotification } from '../../utils/notifications';
import { playChime } from '../../utils/audio';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onClearAll: () => void;
  onSelectNotification?: (item: NotificationItem) => void;
  darkMode: boolean;
  openInstallModal?: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onClearAll,
  darkMode,
  openInstallModal,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'alerts'>('all');
  const [showPermissionBanner, setShowPermissionBanner] = useState(true);

  if (!isOpen) return null;

  const permissionState = getNotificationPermissionState();
  const unreadCount = notifications.filter(n => !n.read).length;
  const alertCount = notifications.filter(n => n.type.includes('warning') || n.type.includes('exceeded') || n.type.includes('deadline')).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'alerts') return n.type.includes('warning') || n.type.includes('exceeded') || n.type.includes('deadline');
    return true;
  });

  const handleRequestPermission = async () => {
    const perm = await requestNotificationPermission();
    if (perm === 'granted') {
      playChime('success');
      showBrowserNotification('🔔 Notifikasi Browser Aktif!', {
        body: 'Anda sekarang akan menerima pemberitahuan tenggat waktu dan peringatan anggaran secara tepat waktu.',
      });
      setShowPermissionBanner(false);
    }
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'task_deadline':
        return <Clock className="w-3.5 h-3.5 text-blue-500" />;
      case 'budget_exceeded':
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />;
      case 'budget_warning':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />;
      case 'streak_achievement':
        return <Flame className="w-3.5 h-3.5 text-orange-500" />;
      case 'sync_update':
      default:
        return <Radio className="w-3.5 h-3.5 text-emerald-500" />;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-stretch justify-center sm:justify-end bg-black/60 backdrop-blur-sm transition-opacity p-0 sm:p-0"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md max-h-[80vh] sm:max-h-full sm:h-full flex flex-col clay-card rounded-t-[28px] sm:rounded-t-none sm:rounded-l-3xl shadow-2xl transition-all duration-300 overflow-hidden border-t sm:border-t-0 sm:border-l border-white/40 dark:border-white/10"
      >
        {/* Mobile Pull Bar Indicator */}
        <div className="w-12 h-1 rounded-full bg-[#8A796E]/30 dark:bg-white/20 mx-auto mt-2.5 mb-1 sm:hidden flex-shrink-0" />

        {/* Compact Header */}
        <div className="px-4 py-3 sm:px-5 sm:py-4 border-b border-[#E8DACB] dark:border-white/10 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-200 dark:border-orange-800 shadow-inner flex-shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm sm:text-base font-extrabold text-[#3E2F26] dark:text-[#FAF4EE]">
                  Notifikasi
                </h2>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-orange-500 text-white text-[10px] font-black">
                    {unreadCount} baru
                  </span>
                )}
              </div>
              <p className="text-[10.5px] sm:text-xs text-[#8A796E] dark:text-[#BDB0A4] font-medium line-clamp-1">
                Pengingat tugas & anggaran kas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="clay-button p-1.5 sm:p-2 rounded-xl text-[#8A796E] dark:text-[#D4C7BC] flex-shrink-0 hover:text-[#3E2F26] dark:hover:text-white"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Compact Push Permission Banner */}
        {permissionState !== 'granted' && showPermissionBanner && (
          <div className="mx-3.5 mt-2.5 p-2.5 rounded-xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent border border-orange-300/60 dark:border-orange-500/30 flex items-center justify-between gap-2 text-xs flex-shrink-0">
            <div className="flex items-center space-x-2 min-w-0">
              <BellRing className="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0" />
              <span className="text-[11px] font-bold text-[#4A3B32] dark:text-[#E8DACB] truncate">
                Izinkan pemberitahuan pop-up browser
              </span>
            </div>
            <div className="flex items-center space-x-1.5 flex-shrink-0">
              <button
                onClick={handleRequestPermission}
                className="px-2.5 py-1 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-[10.5px] rounded-lg shadow-sm active:scale-95 transition"
              >
                Aktifkan
              </button>
              <button
                onClick={() => setShowPermissionBanner(false)}
                className="p-1 text-[#8A796E] hover:text-[#3E2F26] dark:hover:text-white"
                title="Sembunyikan"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Clean Tabs & Bulk Actions */}
        <div className="px-3.5 py-2 flex items-center justify-between border-b border-[#E8DACB]/60 dark:border-white/5 text-xs flex-shrink-0 bg-black/[0.02] dark:bg-white/[0.02]">
          {/* Filter Pills */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition ${
                filter === 'all'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-[#8A796E] dark:text-[#BDB0A4] hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              Semua ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition ${
                filter === 'unread'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-[#8A796E] dark:text-[#BDB0A4] hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              Belum Dibaca ({unreadCount})
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="text-orange-600 dark:text-orange-400 hover:underline font-extrabold text-[11px] flex items-center space-x-1 transition cursor-pointer"
                title="Tandai semua telah dibaca"
              >
                <CheckCheck className="w-3 h-3" />
                <span className="hidden xs:inline">Baca Semua</span>
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-rose-600 dark:text-rose-400 hover:underline font-extrabold text-[11px] flex items-center space-x-1 transition cursor-pointer"
                title="Hapus semua riwayat"
              >
                <Trash2 className="w-3 h-3" />
                <span className="hidden xs:inline">Hapus</span>
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 divide-y divide-transparent">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-10 sm:py-14 px-4 text-[#8A796E]">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2 border border-emerald-200 dark:border-emerald-900/50 shadow-inner">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="font-extrabold text-[#3E2F26] dark:text-[#FAF4EE] text-xs sm:text-sm">
                {filter === 'unread' ? 'Semua notifikasi telah dibaca' : 'Tidak ada notifikasi'}
              </p>
              <p className="mt-0.5 text-[11px] text-[#8A796E] dark:text-[#BDB0A4] font-medium max-w-xs mx-auto">
                {filter === 'unread' 
                  ? 'Bagus! Kamu sudah mengecek semua pemberitahuan.' 
                  : 'Tugas dan pengeluaran kamu berjalan dengan aman dan terpantau.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((n) => (
              <div
                key={n.id}
                className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl transition border ${
                  !n.read
                    ? 'border-orange-400/50 bg-orange-50/70 dark:bg-orange-950/30 shadow-xs'
                    : 'border-[#E8DACB]/60 dark:border-white/5 bg-white/40 dark:bg-[#26201C]/40 opacity-85'
                }`}
              >
                <div className="flex items-start space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-orange-100/80 dark:bg-orange-950/80 border border-orange-200 dark:border-orange-800 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-[11.5px] sm:text-xs font-extrabold truncate text-[#3E2F26] dark:text-[#FAF4EE]">
                        {n.title}
                      </h4>
                      <span className="text-[9.5px] sm:text-[10px] text-[#8A796E] dark:text-[#BDB0A4] font-bold flex-shrink-0">
                        {new Date(n.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-[#5A453A] dark:text-[#D4C7BC] mt-0.5 leading-snug font-medium line-clamp-2">
                      {n.message}
                    </p>
                  </div>
                  {!n.read && (
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0 mt-1.5" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Compact Footer with PWA & Test Link */}
        <div className="px-3.5 py-2 sm:py-2.5 border-t border-[#E8DACB] dark:border-white/10 flex items-center justify-between text-[10px] sm:text-[10.5px] flex-shrink-0 bg-black/[0.02] dark:bg-white/[0.02]">
          <p className="text-[#8A796E] dark:text-[#BDB0A4] font-medium flex items-center space-x-1 truncate">
            <Sparkles className="w-3 h-3 text-orange-500 inline flex-shrink-0" />
            <span className="truncate">Pengingat aktif real-time</span>
          </p>
          {openInstallModal && (
            <button
              onClick={() => {
                onClose();
                openInstallModal();
              }}
              className="text-orange-600 dark:text-orange-400 hover:underline font-extrabold flex-shrink-0 ml-2"
            >
              📱 Install App ke HP
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

