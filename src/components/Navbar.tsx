import React from 'react';
import { 
  Volume2, 
  VolumeX, 
  Moon, 
  Sun, 
  Wifi, 
  Bell, 
  Plus, 
  Radio, 
  Search,
  Menu,
  Sparkles,
  Layers,
  Smartphone,
  ShieldCheck,
  Lock,
  Headphones,
  Tablet,
  RotateCw
} from 'lucide-react';
import { VoiceSettings } from '../types';
import { TaskPanLogo } from './Common/TaskPanLogo';

interface NavbarProps {
  activeTab: 'dashboard' | 'tasks' | 'calendar' | 'finance' | 'analytics';
  setActiveTab: (tab: 'dashboard' | 'tasks' | 'calendar' | 'finance' | 'analytics') => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  syncRoomId: string;
  isSyncing: boolean;
  connectedDevicesCount: number;
  openSyncModal: () => void;
  openVoiceModal: () => void;
  openNotificationDrawer: () => void;
  unreadNotifsCount: number;
  voiceSettings: VoiceSettings;
  setVoiceSettings: React.Dispatch<React.SetStateAction<VoiceSettings>>;
  openAddTask: () => void;
  openAddTransaction: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  openInstallModal?: () => void;
  onLockApp?: () => void;
  openSecurityPinModal?: () => void;
  openFocusModal?: () => void;
  isFocusActive?: boolean;
  isTablet?: boolean;
  isTabletPortrait?: boolean;
  isTabletLandscape?: boolean;
  onRequestLandscape?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  darkMode,
  setDarkMode,
  syncRoomId,
  isSyncing,
  connectedDevicesCount,
  openSyncModal,
  openVoiceModal,
  openNotificationDrawer,
  unreadNotifsCount,
  voiceSettings,
  openAddTask,
  openAddTransaction,
  searchQuery,
  setSearchQuery,
  openInstallModal,
  onLockApp,
  openSecurityPinModal,
  openFocusModal,
  isFocusActive,
  isTablet,
  isTabletPortrait,
  isTabletLandscape,
  onRequestLandscape,
}) => {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard';
      case 'tasks': return 'Tugas & Target';
      case 'calendar': return 'Kalender Agenda';
      case 'finance': return 'Keuangan & Kas';
      case 'analytics': return 'Statistik & Analisis';
      default: return 'Dashboard';
    }
  };

  return (
    <header 
      style={{ top: 'calc(env(safe-area-inset-top, 0px) + 0.65rem)' }}
      className={`sticky z-30 transition-all duration-200 py-3 sm:py-3.5 px-3.5 sm:px-5 mb-3.5 sm:mb-4 rounded-[22px] sm:rounded-3xl border ${
        darkMode 
          ? 'bg-[#1F1B18]/95 border-white/10 shadow-[0_10px_28px_rgba(0,0,0,0.55)] backdrop-blur-xl' 
          : 'bg-[#FAF3EC]/95 border-white/85 shadow-[0_10px_28px_rgba(186,163,143,0.25)] backdrop-blur-xl'
      }`}
    >
      <div className="w-full flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 md:gap-3">
        
        {/* Top/Left Row: App Logo & View Title & Mobile Actions */}
        <div className="flex items-center justify-between w-full md:w-auto gap-2">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            {/* TaskPan 3D App Logo */}
            <div className="w-8.5 h-8.5 sm:w-10 sm:h-10 rounded-2xl p-0.5 bg-gradient-to-tr from-orange-500 to-amber-400 shadow-[0_4px_12px_rgba(234,88,12,0.3)] flex items-center justify-center flex-shrink-0 border border-white/70">
              <TaskPanLogo size="sm" className="w-7 h-7 sm:w-9 sm:h-9" />
            </div>
            
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5 leading-none mb-0.5">
                <span className="font-black text-[9px] sm:text-[10px] text-orange-600 dark:text-orange-400 tracking-wider uppercase">TaskPan</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
              </div>
              <h1 className={`text-sm sm:text-lg font-black tracking-tight truncate ${
                darkMode ? 'text-white' : 'text-[#3E2F26]'
              }`}>
                {getTabTitle()}
              </h1>
            </div>
          </div>

          {/* Action buttons (Mobile only: clean compact pill row) */}
          <div className="flex md:hidden items-center space-x-1 flex-shrink-0">
            {/* Tablet Orientation Rotate Button (Mobile / Tablet Portrait) */}
            {isTablet && isTabletPortrait && onRequestLandscape && (
              <button
                onClick={onRequestLandscape}
                title="Putar Layar ke Tablet Landscape"
                className="clay-button px-2 h-8 rounded-xl text-[10px] font-bold flex items-center space-x-1 text-orange-600 dark:text-orange-400 active:scale-95 transition"
              >
                <RotateCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
                <span className="hidden sm:inline">Landscape</span>
              </button>
            )}

            {/* Real-Time Sync Status Pill (Mobile) */}
            <button
              id="mobile-sync-room-btn"
              onClick={openSyncModal}
              title={`Sync Room: ${syncRoomId}`}
              className="clay-button px-2 h-8 rounded-xl text-[10px] font-bold flex items-center space-x-1 active:scale-95 transition"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-[9px] text-[#5A453A] dark:text-[#C5B7AE]">
                {syncRoomId}
              </span>
            </button>

            {/* Focus Mode Trigger (Mobile) */}
            {openFocusModal && (
              <button
                id="mobile-focus-btn"
                onClick={openFocusModal}
                title="Sesi Fokus & Musik (Spotify / Apple Music / Lo-Fi)"
                className={`w-8 h-8 rounded-xl flex items-center justify-center active:scale-95 transition relative ${
                  isFocusActive
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm'
                    : 'clay-button text-orange-600 dark:text-orange-400'
                }`}
              >
                <Headphones className={`w-3.5 h-3.5 ${isFocusActive ? 'animate-pulse' : ''}`} />
                {isFocusActive && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                )}
              </button>
            )}

            {/* Quick Add Task */}
            <button
              onClick={openAddTask}
              className="clay-button-primary px-2.5 h-8 rounded-xl text-[11px] font-extrabold flex items-center space-x-1 shadow-sm active:scale-95 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tugas</span>
            </button>

            {/* Notification Bell (Mobile) */}
            <div className="relative inline-flex items-center justify-center">
              <button
                id="mobile-notification-bell-btn"
                onClick={openNotificationDrawer}
                title="Notifikasi"
                className="clay-button w-8 h-8 rounded-xl flex items-center justify-center text-[#5A453A] dark:text-[#C5B7AE] active:scale-95 transition"
              >
                <Bell className="w-3.5 h-3.5" />
              </button>
              {unreadNotifsCount > 0 && (
                <span className="pointer-events-none absolute -top-1 -right-1 flex h-3.5 min-w-3.5 px-0.5 items-center justify-center rounded-full bg-rose-500 text-[8px] font-black text-white shadow-md ring-1 ring-white dark:ring-[#1F1B18] z-20">
                  {unreadNotifsCount > 9 ? '9+' : unreadNotifsCount}
                </span>
              )}
            </div>

            {/* Theme Toggle (Mobile) */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? 'Tema Terang' : 'Tema Gelap'}
              className="clay-button w-8 h-8 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-300 active:scale-95 transition"
            >
              {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Center: 3D Soft Neumorphic Search Bar */}
        <div className="w-full md:flex-1 md:max-w-xs lg:md:max-w-sm md:mx-2">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 absolute left-3 text-[#8A796E] dark:text-[#A8988D] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tugas, transaksi, pengingat..."
              className={`clay-input w-full pl-8.5 pr-7 py-1.5 sm:py-2 text-xs font-semibold focus:outline-none transition ${
                darkMode ? 'text-white placeholder-zinc-500' : 'text-[#3E2F26] placeholder-[#9A8A7E]'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-xs text-[#8A796E] font-bold hover:text-orange-500"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Right: Quick Action Icons & Statuses (Desktop & Tablet) */}
        <div className="hidden md:flex items-center space-x-1.5 lg:space-x-2 flex-shrink-0">
          
          {/* Real-Time Sync Status Pill */}
          <button
            id="sync-room-pill-btn"
            onClick={openSyncModal}
            title={`Sinkronisasi Real-Time Room: ${syncRoomId}`}
            className="clay-button px-2.5 h-9 rounded-xl text-xs font-bold flex items-center space-x-1.5 flex-shrink-0 active:scale-95 transition"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-[10px] lg:text-[11px] font-bold text-[#5A453A] dark:text-[#C5B7AE]">
              {syncRoomId}
            </span>
            <Radio className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-orange-500' : 'text-emerald-500'}`} />
          </button>

          {/* Tablet Landscape Mode Active Badge */}
          {isTablet && isTabletLandscape && (
            <div 
              title="Mode Tablet Landscape Aktif"
              className="hidden md:flex items-center space-x-1.5 px-2.5 h-9 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 text-xs font-bold flex-shrink-0"
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="hidden xl:inline text-[11px]">Tablet Landscape</span>
            </div>
          )}

          {/* Install PWA / Mobile App Button */}
          {openInstallModal && (
            <button
              id="install-app-btn"
              onClick={openInstallModal}
              title="Aplikasi Layar Utama (PWA) & Notifikasi HP"
              className="clay-button w-9 h-9 rounded-xl text-xs font-bold flex items-center justify-center text-orange-600 dark:text-orange-400 flex-shrink-0 active:scale-95 transition"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          )}

          {/* Security PIN Settings & Change PIN */}
          {openSecurityPinModal && (
            <button
              id="desktop-security-pin-btn"
              onClick={openSecurityPinModal}
              title="Pengaturan PIN Keamanan (Ganti PIN)"
              className="clay-button w-9 h-9 rounded-xl text-xs font-bold flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0 active:scale-95 transition"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>
          )}

          {/* Quick Lock App Screen */}
          {onLockApp && (
            <button
              id="desktop-lock-app-btn"
              onClick={onLockApp}
              title="Kunci Layar Sekarang (PIN)"
              className="clay-button w-9 h-9 rounded-xl text-xs font-bold flex items-center justify-center text-[#5A453A] dark:text-[#C5B7AE] flex-shrink-0 active:scale-95 transition"
            >
              <Lock className="w-4 h-4" />
            </button>
          )}

          {/* Focus Mode Quick Button (Desktop) */}
          {openFocusModal && (
            <button
              id="desktop-focus-btn"
              onClick={openFocusModal}
              title="Sesi Fokus & Musik (Spotify / Apple Music / Suara Alam)"
              className={`h-9 px-3 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 flex-shrink-0 active:scale-95 transition relative ${
                isFocusActive
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                  : 'clay-button text-orange-600 dark:text-orange-400'
              }`}
            >
              <Headphones className={`w-4 h-4 ${isFocusActive ? 'animate-pulse' : ''}`} />
              <span className="hidden lg:inline">{isFocusActive ? 'Sesi Berjalan' : 'Mode Fokus'}</span>
              {isFocusActive && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
              )}
            </button>
          )}

          {/* Voice Reminder Quick Button */}
          <button
            id="voice-toggle-btn"
            onClick={openVoiceModal}
            title={voiceSettings.enabled ? 'Pengingat Suara Aktif' : 'Pengingat Suara Nonaktif'}
            className="clay-button w-9 h-9 rounded-xl text-xs font-bold flex items-center justify-center text-orange-600 dark:text-orange-400 flex-shrink-0 active:scale-95 transition"
          >
            {voiceSettings.enabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Notification Center Bell */}
          <div className="relative inline-flex items-center justify-center">
            <button
              id="notification-bell-btn"
              onClick={openNotificationDrawer}
              title="Notifikasi & Peringatan Tenggat Waktu"
              className="clay-button w-9 h-9 rounded-xl text-xs font-bold flex items-center justify-center text-[#5A453A] dark:text-[#C5B7AE] flex-shrink-0 active:scale-95 transition"
            >
              <Bell className="w-4 h-4" />
            </button>
            {unreadNotifsCount > 0 && (
              <span className="pointer-events-none absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[8px] font-black text-white shadow-md ring-2 ring-white dark:ring-[#1F1B18] z-20">
                {unreadNotifsCount > 9 ? '9+' : unreadNotifsCount}
              </span>
            )}
          </div>

          {/* Dark / Light Mode Toggle */}
          <button
            id="theme-toggle-btn"
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? 'Tema Terang' : 'Tema Gelap'}
            className="clay-button w-9 h-9 rounded-xl text-xs font-bold flex items-center justify-center text-amber-600 dark:text-amber-300 flex-shrink-0 active:scale-95 transition"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Desktop Add Task Primary CTA */}
          <button
            id="quick-add-task-btn"
            onClick={openAddTask}
            className="clay-button-primary h-9 px-3.5 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 shadow-md active:scale-95 transition flex-shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tugas</span>
          </button>
        </div>

      </div>
    </header>
  );
};
