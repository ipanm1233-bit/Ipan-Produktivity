import React from 'react';
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
  Volume2
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
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onClearAll,
  darkMode,
}) => {
  if (!isOpen) return null;

  const permissionState = getNotificationPermissionState();

  const handleRequestPermission = async () => {
    const perm = await requestNotificationPermission();
    if (perm === 'granted') {
      playChime('success');
      showBrowserNotification('🔔 Notifikasi Browser Aktif!', {
        body: 'Anda sekarang akan menerima pemberitahuan tenggat waktu dan peringatan anggaran secara tepat waktu.',
      });
    }
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'task_deadline':
        return <Clock className="w-4 h-4 text-blue-400" />;
      case 'budget_exceeded':
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case 'budget_warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'streak_achievement':
        return <Flame className="w-4 h-4 text-amber-400" />;
      case 'sync_update':
      default:
        return <Radio className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-md h-full flex flex-col clay-card rounded-none rounded-l-3xl shadow-2xl transition-transform duration-300 overflow-hidden">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#E8DACB] dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-200 dark:border-orange-800 shadow-inner flex-shrink-0">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#3E2F26] dark:text-[#FAF4EE]">Pusat Notifikasi Push</h2>
              <p className="text-xs text-[#8A796E] dark:text-[#BDB0A4] font-medium">
                Pengingat tenggat & peringatan limit anggaran
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="clay-button p-2 rounded-2xl text-[#8A796E] dark:text-[#D4C7BC]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Push Permission Prompt if not granted */}
        {permissionState !== 'granted' && (
          <div className="p-4 m-4 rounded-2xl clay-card-sm border-2 border-orange-400/40 flex items-start space-x-3">
            <BellRing className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <h4 className="font-extrabold text-orange-600 dark:text-orange-400">
                Aktifkan Notifikasi Desktop
              </h4>
              <p className="text-[#5A453A] dark:text-[#D4C7BC] mt-1 leading-relaxed font-medium">
                Dapatkan notifikasi push langsung saat tenggat waktu mendekat atau anggaran melebihi batas.
              </p>
              <button
                onClick={handleRequestPermission}
                className="mt-3 px-4 py-2 clay-button-primary font-extrabold rounded-xl text-xs"
              >
                Izinkan Notifikasi Push
              </button>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="px-5 py-3 flex items-center justify-between border-b border-[#E8DACB] dark:border-white/10 text-xs">
          <span className="text-[#8A796E] dark:text-[#BDB0A4] font-extrabold">
            {notifications.length} pemberitahuan
          </span>
          <div className="flex items-center space-x-3">
            <button
              onClick={onMarkAllRead}
              className="text-orange-600 dark:text-orange-400 hover:underline font-extrabold flex items-center space-x-1 transition cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Tandai Dibaca</span>
            </button>
            <span className="text-[#8A796E]">•</span>
            <button
              onClick={onClearAll}
              className="text-rose-600 dark:text-rose-400 hover:underline font-extrabold flex items-center space-x-1 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Bersihkan</span>
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="text-center py-16 text-[#8A796E] text-xs">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500/80" />
              <p className="font-extrabold text-[#3E2F26] dark:text-[#FAF4EE] text-sm">
                Tidak ada notifikasi baru
              </p>
              <p className="mt-1 text-[#8A796E] dark:text-[#BDB0A4] font-medium">
                Semua tugas dan anggaran Anda dalam status aman dan terpantau.
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3.5 rounded-2xl clay-card-sm transition ${
                  !n.read
                    ? 'border-2 border-orange-500/40 bg-orange-50/40 dark:bg-orange-950/20'
                    : 'opacity-70'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-xl bg-orange-100/60 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 flex-shrink-0 mt-0.5 shadow-inner">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold truncate text-[#3E2F26] dark:text-[#FAF4EE]">
                        {n.title}
                      </h4>
                      <span className="text-[10px] text-[#8A796E] dark:text-[#BDB0A4] font-bold">
                        {new Date(n.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-[#5A453A] dark:text-[#D4C7BC] mt-1 leading-snug font-medium">
                      {n.message}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E8DACB] dark:border-white/10 text-center">
          <p className="text-[11px] text-[#8A796E] dark:text-[#BDB0A4] font-medium">
            Sistem pengingat berjalan secara real-time di latar belakang.
          </p>
        </div>

      </div>
    </div>
  );
};
