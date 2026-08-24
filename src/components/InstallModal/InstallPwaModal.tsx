import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Download, 
  X, 
  CheckCircle2, 
  Share2, 
  PlusSquare, 
  Bell, 
  Sparkles, 
  Check, 
  Zap, 
  Vibrate, 
  Radio,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { 
  requestNotificationPermission, 
  getNotificationPermissionState, 
  triggerTestMobileNotification 
} from '../../utils/notifications';

import { TaskPanLogo } from '../Common/TaskPanLogo';

interface InstallPwaModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
}

export const InstallPwaModal: React.FC<InstallPwaModalProps> = ({
  isOpen,
  onClose,
  darkMode,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [notifState, setNotifState] = useState<NotificationPermission>('default');
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode (installed PWA)
    const checkStandalone = () => {
      const isDisplayStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isNavigatorStandalone = (navigator as any).standalone === true;
      setIsStandalone(isDisplayStandalone || isNavigatorStandalone);
    };
    checkStandalone();

    // Device detection
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isAndroidDevice = /android/.test(userAgent);
    setIsIOS(isIosDevice);
    setIsAndroid(isAndroidDevice);

    setNotifState(getNotificationPermissionState());

    // Listen for Chrome/Android beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the PWA install prompt');
        setDeferredPrompt(null);
        onClose();
      }
    }
  };

  const handleTestNotification = async () => {
    const success = await triggerTestMobileNotification();
    setNotifState(getNotificationPermissionState());
    if (success) {
      setTestSent(true);
      setTimeout(() => setTestSent(false), 4000);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-black/60 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md clay-card rounded-[28px] sm:rounded-[32px] p-5 sm:p-6 shadow-2xl overflow-hidden relative border border-white/60 dark:border-white/10 max-h-[90vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 clay-button p-2 rounded-xl text-[#8A796E] dark:text-[#C5B7AE] hover:text-[#3E2F26] dark:hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with 3D Icon */}
        <div className="flex items-center space-x-3.5 mb-5">
          <div className="w-13 h-13 rounded-2xl p-1 bg-gradient-to-tr from-orange-500 to-amber-400 text-white flex items-center justify-center shadow-lg flex-shrink-0 border border-white/60">
            <TaskPanLogo size="md" className="w-11 h-11 rounded-xl" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-[#3E2F26] dark:text-[#FAF4EE] tracking-tight">
              Aplikasi Layar Utama (PWA)
            </h2>
            <p className="text-xs text-orange-600 dark:text-orange-400 font-bold">
              Tambahkan ke HP & Aktifkan Notifikasi
            </p>
          </div>
        </div>

        {/* Standalone Status */}
        {isStandalone ? (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center space-x-3 mb-4">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <div className="text-xs">
              <span className="font-extrabold block">Aplikasi Sudah Terpasang!</span>
              <span className="text-[11px] opacity-90">Anda sedang menjalankan TaskPan dalam mode layar utama (Standalone App).</span>
            </div>
          </div>
        ) : null}

        {/* Direct Install Button for Android / Chrome */}
        {deferredPrompt && (
          <div className="mb-4">
            <button
              onClick={handleInstallClick}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm shadow-xl shadow-orange-500/30 flex items-center justify-center space-x-2 transition active:scale-95 border border-white/30"
            >
              <Download className="w-4 h-4" />
              <span>Install ke Layar Utama HP Sekarang</span>
            </button>
          </div>
        )}

        {/* Step by Step Guide for Mobile Browsers */}
        <div className="space-y-3 mb-5">
          <h3 className="text-xs font-black text-[#3E2F26] dark:text-[#FAF4EE] uppercase tracking-wider">
            {isIOS ? '📱 Panduan iPhone / iPad (Safari):' : '📱 Panduan Android / Chrome:'}
          </h3>

          {isIOS ? (
            <div className="p-3.5 rounded-2xl clay-card-sm space-y-2.5 text-xs">
              <div className="flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-orange-500 text-white font-black text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </span>
                <p className="text-[#5A453A] dark:text-[#D4C7BC] font-medium leading-relaxed">
                  Buka website ini di browser <strong className="text-orange-600 dark:text-orange-400 font-bold">Safari</strong>, lalu ketuk tombol <strong className="font-bold">Bagikan (Share)</strong> <Share2 className="w-3.5 h-3.5 inline text-blue-500 mx-0.5" /> di bilah navigasi bawah.
                </p>
              </div>
              <div className="flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-orange-500 text-white font-black text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </span>
                <p className="text-[#5A453A] dark:text-[#D4C7BC] font-medium leading-relaxed">
                  Gulir ke bawah dan pilih menu <strong className="text-orange-600 dark:text-orange-400 font-bold">"Tambahkan ke Layar Utama" (Add to Home Screen)</strong> <PlusSquare className="w-3.5 h-3.5 inline text-orange-500 mx-0.5" />.
                </p>
              </div>
              <div className="flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-orange-500 text-white font-black text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </span>
                <p className="text-[#5A453A] dark:text-[#D4C7BC] font-medium leading-relaxed">
                  Ketuk <strong className="font-bold">"Tambah"</strong> di pojok kanan atas. Ikon aplikasi TaskPan akan muncul di layar utama HP Anda!
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl clay-card-sm space-y-2.5 text-xs">
              <div className="flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-orange-500 text-white font-black text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </span>
                <p className="text-[#5A453A] dark:text-[#D4C7BC] font-medium leading-relaxed">
                  Ketuk menu titik tiga <strong className="font-bold">⁝ (Opsi)</strong> di pojok kanan atas browser Chrome / browser HP Anda.
                </p>
              </div>
              <div className="flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-orange-500 text-white font-black text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </span>
                <p className="text-[#5A453A] dark:text-[#D4C7BC] font-medium leading-relaxed">
                  Pilih menu <strong className="text-orange-600 dark:text-orange-400 font-bold">"Install Aplikasi"</strong> atau <strong className="text-orange-600 dark:text-orange-400 font-bold">"Tambahkan ke Layar Utama"</strong>.
                </p>
              </div>
              <div className="flex items-start space-x-2.5">
                <span className="w-5 h-5 rounded-full bg-orange-500 text-white font-black text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </span>
                <p className="text-[#5A453A] dark:text-[#D4C7BC] font-medium leading-relaxed">
                  Aplikasi akan terpasang otomatis dan bekerja secara mandiri layaknya aplikasi Play Store dengan akses notifikasi & getaran HP!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Notification & Vibration Tester */}
        <div className="p-4 rounded-2xl bg-orange-50/70 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/60 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <h4 className="text-xs font-black text-[#3E2F26] dark:text-[#FAF4EE]">
                Uji Notifikasi & Getaran HP
              </h4>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              notifState === 'granted' 
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' 
                : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
            }`}>
              {notifState === 'granted' ? '✓ Izin Aktif' : 'Perlu Izin'}
            </span>
          </div>

          <p className="text-[11px] text-[#5A453A] dark:text-[#D4C7BC] font-medium leading-snug mb-3">
            Notifikasi tenggat waktu tugas dan peringatan limit pengeluaran kas akan berbunyi & bergetar di HP Anda secara otomatis.
          </p>

          <button
            onClick={handleTestNotification}
            className="w-full py-2.5 px-3 rounded-xl clay-button text-orange-600 dark:text-orange-400 font-extrabold text-xs flex items-center justify-center space-x-2 transition active:scale-95 shadow-sm"
          >
            {testSent ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Notifikasi Terkirim ke HP! 📳</span>
              </>
            ) : (
              <>
                <Bell className="w-3.5 h-3.5" />
                <span>Kirim Notifikasi Uji Coba ke HP Sekarang</span>
              </>
            )}
          </button>
        </div>

        {/* Feature Benefits List */}
        <div className="grid grid-cols-2 gap-2 text-[10.5px] font-bold text-[#5A453A] dark:text-[#C5B7AE] mb-4">
          <div className="flex items-center space-x-1.5 p-2 rounded-xl bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/5">
            <Zap className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            <span className="truncate">Akses Cepat Instan</span>
          </div>
          <div className="flex items-center space-x-1.5 p-2 rounded-xl bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/5">
            <Radio className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
            <span className="truncate">Sinkronisasi Realtime</span>
          </div>
          <div className="flex items-center space-x-1.5 p-2 rounded-xl bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/5">
            <Vibrate className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
            <span className="truncate">Pengingat Getar HP</span>
          </div>
          <div className="flex items-center space-x-1.5 p-2 rounded-xl bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/5">
            <ShieldCheck className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
            <span className="truncate">Penyimpanan Aman</span>
          </div>
        </div>

        {/* Close CTA */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl clay-button font-bold text-xs text-[#5A453A] dark:text-[#D4C7BC]"
        >
          Mengerti
        </button>
      </div>
    </div>
  );
};
