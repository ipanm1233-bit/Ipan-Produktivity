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
    <header className={`sticky top-0 z-30 transition-colors duration-200 py-2.5 sm:py-3.5 px-3.5 sm:px-6 mb-2 ${
      darkMode ? 'bg-[#181513]/90 backdrop-blur-md' : 'bg-[#F5EBE1]/90 backdrop-blur-md'
    }`}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 sm:gap-4">
        
        {/* Top/Left Row: View Title, Badges & Mobile Fast Actions */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <h1 className={`text-lg sm:text-2xl font-black tracking-tight truncate ${
              darkMode ? 'text-white' : 'text-[#3E2F26]'
            }`}>
              {getTabTitle()}
            </h1>
            <span className="hidden sm:inline-flex text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30 uppercase tracking-wider flex-shrink-0">
              3D Workspace
            </span>
          </div>

          {/* Mobile Right Bar: Fast Task CTA and Notification */}
          <div className="flex md:hidden items-center space-x-2 flex-shrink-0">
            <button
              onClick={openAddTask}
              className="clay-button-primary px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center space-x-1 shadow-sm active:scale-95 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tugas</span>
            </button>
            <button
              onClick={openNotificationDrawer}
              className="relative p-2 rounded-xl bg-white/80 dark:bg-[#2A2522] border border-white/60 dark:border-white/10 shadow-sm text-zinc-700 dark:text-zinc-200"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-sm">
                  {unreadNotifsCount > 9 ? '9+' : unreadNotifsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Center: 3D Soft Neumorphic Search Bar */}
        <div className="w-full md:max-w-md">
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

        {/* Right: Quick Action Icons & Statuses (Horizontal scroll on narrow screens or tidy flex) */}
        <div className="flex items-center space-x-1.5 sm:space-x-2.5 w-full md:w-auto justify-between md:justify-end overflow-x-auto pb-0.5 md:pb-0">
          
          {/* Real-Time Sync Status Pill */}
          <button
            id="sync-room-pill-btn"
            onClick={openSyncModal}
            title={`Sinkronisasi Real-Time Room: ${syncRoomId}`}
            className="clay-button px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-xs font-bold flex items-center space-x-1.5 flex-shrink-0"
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

          <div className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
            {/* Voice Reminder Quick Button */}
            <button
              id="voice-toggle-btn"
              onClick={openVoiceModal}
              title={voiceSettings.enabled ? 'Pengingat Suara Aktif' : 'Pengingat Suara Nonaktif'}
              className="clay-button p-2 sm:p-2.5 rounded-xl sm:rounded-2xl text-xs font-bold flex items-center justify-center text-orange-600 dark:text-orange-400"
            >
              {voiceSettings.enabled ? <Volume2 className="w-3.5 sm:w-4 h-3.5 sm:h-4" /> : <VolumeX className="w-3.5 sm:w-4 h-3.5 sm:h-4" />}
            </button>

            {/* Notification Center Bell (Hidden on small mobile since placed at top row) */}
            <button
              id="notification-bell-btn"
              onClick={openNotificationDrawer}
              title="Notifikasi & Peringatan Tenggat Waktu"
              className="hidden md:flex clay-button relative p-2.5 rounded-2xl text-xs font-bold items-center justify-center text-[#5A453A] dark:text-[#C5B7AE]"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-sm">
                  {unreadNotifsCount > 9 ? '9+' : unreadNotifsCount}
                </span>
              )}
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              id="theme-toggle-btn"
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? 'Beralih ke Tema Terang (Warm Clay)' : 'Beralih ke Tema Gelap'}
              className="clay-button p-2 sm:p-2.5 rounded-xl sm:rounded-2xl text-xs font-bold flex items-center justify-center text-amber-600 dark:text-amber-300"
            >
              {darkMode ? <Sun className="w-3.5 sm:w-4 h-3.5 sm:h-4" /> : <Moon className="w-3.5 sm:w-4 h-3.5 sm:h-4" />}
            </button>

            {/* Desktop Add Task Primary CTA */}
            <button
              id="quick-add-task-btn"
              onClick={openAddTask}
              className="hidden md:flex clay-button-primary px-3.5 py-2.5 rounded-2xl text-xs font-extrabold items-center space-x-1.5 shadow-md active:scale-95 transition"
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


