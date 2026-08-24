import React from 'react';
import { 
  Home, 
  CheckSquare, 
  DollarSign, 
  Calendar as CalendarIcon, 
  BarChart3, 
  Volume2, 
  Radio, 
  Crown, 
  Sparkles, 
  Settings, 
  Flame, 
  Award,
  Smartphone,
  Lock,
  ShieldCheck
} from 'lucide-react';
import { VoiceSettings } from '../../types';
import taskplanLogo from '../../assets/images/taskplan_app_logo_1787564199598.jpg';
import avatarImg from '../../assets/images/male_avatar_3d_1787560743768.jpg';

interface ClaySidebarProps {
  activeTab: 'dashboard' | 'tasks' | 'calendar' | 'finance' | 'analytics';
  setActiveTab: (tab: 'dashboard' | 'tasks' | 'calendar' | 'finance' | 'analytics') => void;
  userName: string;
  syncRoomId: string;
  isSyncing: boolean;
  openSyncModal: () => void;
  openVoiceModal: () => void;
  darkMode: boolean;
  onStartFocusBrief?: () => void;
  openInstallModal?: () => void;
  onLockApp?: () => void;
}

export const ClaySidebar: React.FC<ClaySidebarProps> = ({
  activeTab,
  setActiveTab,
  userName,
  syncRoomId,
  isSyncing,
  openSyncModal,
  openVoiceModal,
  darkMode,
  onStartFocusBrief,
  openInstallModal,
  onLockApp,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'tasks', label: 'Tugas & Target', icon: CheckSquare },
    { id: 'finance', label: 'Keuangan & Kas', icon: DollarSign },
    { id: 'calendar', label: 'Kalender Agenda', icon: CalendarIcon },
    { id: 'analytics', label: 'Grafik Statistik', icon: BarChart3 },
  ];

  return (
    <aside className={`w-64 flex-shrink-0 flex flex-col justify-between p-4 sm:p-5 rounded-[32px] transition-all duration-300 ${
      darkMode 
        ? 'bg-[#221E1B] border border-white/10 shadow-2xl shadow-black/60' 
        : 'bg-[#FAF3EC] border-2 border-white/80 shadow-[0_12px_32px_rgba(186,163,143,0.22)]'
    }`}>
      
      {/* Top Section: Brand Logo & Profile Card */}
      <div className="space-y-4">
        
        {/* Brand App 3D Logo Header */}
        <div className="flex items-center space-x-3 px-2 py-2 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/5 dark:from-orange-500/20 dark:to-transparent border border-orange-200/70 dark:border-orange-900/40">
          <div className="w-11 h-11 rounded-2xl p-1 bg-gradient-to-tr from-orange-500 to-amber-400 shadow-[0_4px_12px_rgba(234,88,12,0.35)] overflow-hidden flex-shrink-0 border border-white/60">
            <img
              src={taskplanLogo}
              alt="TaskPan 3D Logo"
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-1.5">
              <span className="font-black text-base text-[#3E2F26] dark:text-[#FAF4EE] tracking-tight">TaskPan</span>
              <span className="px-1.5 py-0.5 rounded-md bg-orange-500 text-white text-[9px] font-black uppercase tracking-wider shadow-xs">3D Pro</span>
            </div>
            <p className="text-[10px] text-orange-600 dark:text-orange-400 font-bold truncate">Target & Kas Tracker</p>
          </div>
        </div>

        {/* User 3D Avatar & Greeting */}
        <div className="flex flex-col items-center text-center space-y-2 pt-1 pb-1">
          <div className="relative group cursor-pointer" onClick={openVoiceModal} title="Atur Suara & Profil">
            <div className="w-18 h-18 rounded-full p-1 border-3 border-orange-400/80 shadow-[0_8px_20px_rgba(230,126,81,0.35)] overflow-hidden bg-gradient-to-tr from-orange-400 to-amber-300">
              <img
                src={avatarImg}
                alt="3D male avatar portrait"
                referrerPolicy="no-referrer"
                className="w-full h-full rounded-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <span className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center text-[10px] text-white font-bold" title="Online & Active">
              ✓
            </span>
          </div>

          <div>
            <h2 className={`text-base font-extrabold flex items-center justify-center space-x-1.5 ${
              darkMode ? 'text-zinc-100' : 'text-[#3E2F26]'
            }`}>
              <span>Hi, {userName || 'Ipan'}!</span>
              <span>👋</span>
            </h2>
            <p className="text-[11px] font-semibold text-orange-600 dark:text-orange-400 mt-0.5">
              Personal Pro Workspace
            </p>
          </div>
        </div>

        {/* Navigation Items (3D Clay Style) */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? 'clay-button-primary shadow-md'
                    : darkMode
                    ? 'text-[#C5B7AE] hover:text-white hover:bg-white/5'
                    : 'text-[#6D5A4E] hover:text-[#3E2F26] hover:bg-[#F2E7DC]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'opacity-80'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}

          {/* Quick Trigger for Voice Assistant */}
          <button
            id="sidebar-voice-btn"
            onClick={openVoiceModal}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              darkMode
                ? 'text-[#C5B7AE] hover:text-white hover:bg-white/5'
                : 'text-[#6D5A4E] hover:text-[#3E2F26] hover:bg-[#F2E7DC]'
            }`}
          >
            <Volume2 className="w-4 h-4 text-orange-500 opacity-90" />
            <span className="truncate">Suara & AI Asisten</span>
          </button>

          {/* Quick Trigger for Sync Hub */}
          <button
            id="sidebar-sync-btn"
            onClick={openSyncModal}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              darkMode
                ? 'text-[#C5B7AE] hover:text-white hover:bg-white/5'
                : 'text-[#6D5A4E] hover:text-[#3E2F26] hover:bg-[#F2E7DC]'
            }`}
          >
            <Radio className={`w-4 h-4 ${isSyncing ? 'animate-spin text-orange-500' : 'text-emerald-500'}`} />
            <span className="truncate">Sync Room ({syncRoomId})</span>
          </button>

          {/* Quick Trigger for Install PWA & Mobile Notifications */}
          {openInstallModal && (
            <button
              id="sidebar-install-pwa-btn"
              onClick={openInstallModal}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                darkMode
                  ? 'text-orange-400 hover:text-white hover:bg-orange-500/10'
                  : 'text-orange-700 hover:text-orange-900 hover:bg-orange-100/60'
              }`}
            >
              <Smartphone className="w-4 h-4 text-orange-500" />
              <span className="truncate">Install App ke HP</span>
            </button>
          )}

          {/* Quick Lock PIN Security */}
          {onLockApp && (
            <button
              id="sidebar-lock-pin-btn"
              onClick={onLockApp}
              title="Kunci Layar dengan PIN Keamanan"
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                darkMode
                  ? 'text-amber-400 hover:text-white hover:bg-amber-500/10'
                  : 'text-amber-800 hover:text-amber-950 hover:bg-amber-100/60'
              }`}
            >
              <Lock className="w-4 h-4 text-amber-500" />
              <span className="truncate">Kunci Layar (PIN)</span>
            </button>
          )}
        </nav>

      </div>

      {/* Bottom Pro Card (Crown & Focus Session) */}
      <div className={`p-4 rounded-2xl relative overflow-hidden transition-all mt-4 ${
        darkMode 
          ? 'bg-gradient-to-br from-[#38281E] to-[#2A1D16] border border-orange-500/20' 
          : 'bg-gradient-to-br from-[#FDE8D7] to-[#FCD9C0] border border-orange-300/40 shadow-sm'
      }`}>
        <div className="flex items-center space-x-2.5 mb-2">
          <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-md">
            <Crown className="w-4 h-4 fill-white" />
          </div>
          <div>
            <h4 className="text-xs font-black text-orange-800 dark:text-orange-300">
              Mode Fokus Pro
            </h4>
            <p className="text-[10px] text-orange-700/80 dark:text-orange-400/80 font-medium">
              Streak 7 Hari 🔥
            </p>
          </div>
        </div>

        <p className="text-[11px] text-[#6D5A4E] dark:text-[#C5B7AE] leading-tight mb-3 font-medium">
          Tingkatkan produktivitas harian dan pantau target tanpa distraksi!
        </p>

        <button
          onClick={onStartFocusBrief}
          className="w-full py-2 px-3 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-[11px] shadow-md transition active:scale-95 flex items-center justify-center space-x-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Mulai Sesi Fokus</span>
        </button>
      </div>

    </aside>
  );
};
