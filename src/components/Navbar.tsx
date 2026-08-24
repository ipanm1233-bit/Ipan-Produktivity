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
  Layers
} from 'lucide-react';
import { VoiceSettings } from '../types';

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
    <header className={`sticky top-2 sm:top-4 z-30 transition-colors duration-200 py-3 sm:py-3.5 px-3.5 sm:px-6 mb-3 rounded-2xl sm:rounded-3xl border overflow-visible ${
      darkMode 
        ? 'bg-[#1F1B18]/95 border-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.5)] backdrop-blur-xl' 
        : 'bg-[#FAF3EC]/95 border-white/80 shadow-[0_8px_24px_rgba(186,163,143,0.22)] backdrop-blur-xl'
    }`}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 overflow-visible">
        
        {/* Top/Left Row: View Title & Action Buttons on Mobile */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3 overflow-visible">
          <div className="flex items-center min-w-0">
            <h1 className={`text-lg sm:text-2xl font-black tracking-tight truncate ${
              darkMode ? 'text-white' : 'text-[#3E2F26]'
            }`}>
              {getTabTitle()}
            </h1>
          </div>

          {/* Action buttons (Shown on Mobile in top row for quick access) */}
          <div className="flex md:hidden items-center space-x-2 overflow-visible flex-shrink-0">
            {/* Quick Add Task */}
            <button
              onClick={openAddTask}
              className="clay-button-primary px-3 h-9 rounded-xl text-xs font-extrabold flex items-center space-x-1 shadow-sm active:scale-95 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tugas</span>
            </button>

            {/* Notification Bell (Mobile) */}
            <div className="relative inline-flex items-center justify-center overflow-visible">
              <button
                id="mobile-notification-bell-btn"
                onClick={openNotificationDrawer}
                title="Notifikasi & Peringatan"
                className="clay-button w-9 h-9 rounded-xl flex items-center justify-center text-[#5A453A] dark:text-[#C5B7AE] active:scale-95 transition"
              >
                <Bell className="w-4 h-4" />
              </button>
              {unreadNotifsCount > 0 && (
                <span className="pointer-events-none absolute -top-1.5 -right-1.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white shadow-md ring-2 ring-white dark:ring-[#1F1B18] z-20">
                  {unreadNotifsCount > 9 ? '9+' : unreadNotifsCount}
                </span>
              )}
            </div>

            {/* Theme Toggle (Mobile) */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? 'Tema Terang' : 'Tema Gelap'}
              className="clay-button w-9 h-9 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-300 active:scale-95 transition"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Center: 3D Soft Neumorphic Search Bar */}
        <div className="w-full md:flex-1 md:max-w-md md:mx-4">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3.5 text-[#8A796E] dark:text-[#A8988D] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tugas, transaksi, pengingat..."
              className={`clay-input w-full pl-10 pr-8 py-2 sm:py-2.5 text-xs font-semibold focus:outline-none transition ${
                darkMode ? 'text-white placeholder-zinc-500' : 'text-[#3E2F26] placeholder-[#9A8A7E]'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-xs text-[#8A796E] font-bold hover:text-orange-500"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Right: Quick Action Icons & Statuses (Desktop & Mobile Sync) */}
        <div className="flex items-center space-x-2 w-full md:w-auto justify-between md:justify-end overflow-visible">
          
          {/* Real-Time Sync Status Pill */}
          <button
            id="sync-room-pill-btn"
            onClick={openSyncModal}
            title={`Sinkronisasi Real-Time Room: ${syncRoomId}`}
            className="clay-button px-2.5 sm:px-3 h-10 rounded-2xl text-xs font-bold flex items-center space-x-1.5 flex-shrink-0 active:scale-95 transition"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-[10px] sm:text-[11px] font-bold text-[#5A453A] dark:text-[#C5B7AE]">
              {syncRoomId}
            </span>
            <Radio className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-orange-500' : 'text-emerald-500'}`} />
          </button>

          {/* Desktop/Tablet Icon Actions */}
          <div className="hidden md:flex items-center space-x-2 flex-shrink-0 overflow-visible">
            {/* Voice Reminder Quick Button */}
            <button
              id="voice-toggle-btn"
              onClick={openVoiceModal}
              title={voiceSettings.enabled ? 'Pengingat Suara Aktif' : 'Pengingat Suara Nonaktif'}
              className="clay-button w-10 h-10 rounded-2xl text-xs font-bold flex items-center justify-center text-orange-600 dark:text-orange-400 flex-shrink-0 active:scale-95 transition"
            >
              {voiceSettings.enabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Notification Center Bell (Desktop with safe outer badge) */}
            <div className="relative inline-flex items-center justify-center overflow-visible">
              <button
                id="notification-bell-btn"
                onClick={openNotificationDrawer}
                title="Notifikasi & Peringatan Tenggat Waktu"
                className="clay-button w-10 h-10 rounded-2xl text-xs font-bold flex items-center justify-center text-[#5A453A] dark:text-[#C5B7AE] flex-shrink-0 active:scale-95 transition"
              >
                <Bell className="w-4 h-4" />
              </button>
              {unreadNotifsCount > 0 && (
                <span className="pointer-events-none absolute -top-1.5 -right-1.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white shadow-md ring-2 ring-white dark:ring-[#1F1B18] z-20">
                  {unreadNotifsCount > 9 ? '9+' : unreadNotifsCount}
                </span>
              )}
            </div>

            {/* Dark / Light Mode Toggle */}
            <button
              id="theme-toggle-btn"
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? 'Beralih ke Tema Terang (Warm Clay)' : 'Beralih ke Tema Gelap'}
              className="clay-button w-10 h-10 rounded-2xl text-xs font-bold flex items-center justify-center text-amber-600 dark:text-amber-300 flex-shrink-0 active:scale-95 transition"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Desktop Add Task Primary CTA */}
            <button
              id="quick-add-task-btn"
              onClick={openAddTask}
              className="clay-button-primary h-10 px-4 rounded-2xl text-xs font-extrabold flex items-center space-x-1.5 shadow-md active:scale-95 transition flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Tugas</span>
            </button>
          </div>

        </div>

      </div>
    </header>
  );
};


