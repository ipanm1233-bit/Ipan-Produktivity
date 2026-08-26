import React, { useState, useEffect } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Music, 
  Radio, 
  ExternalLink, 
  CheckCircle2, 
  Minimize2, 
  Clock, 
  Flame, 
  Headphones, 
  Sliders, 
  Plus, 
  Layers,
  ChevronRight,
  Info
} from 'lucide-react';
import { Task, VoiceSettings } from '../../types';
import { playAmbientSound, stopAmbientSound, setAmbientVolume, getCurrentAmbientType } from '../../utils/ambientAudio';
import { playChime, speakText } from '../../utils/audio';

export type MusicProvider = 'ambient' | 'spotify' | 'applemusic';

export interface FocusSessionState {
  isActive: boolean;
  isPaused: boolean;
  durationMinutes: number;
  remainingSeconds: number;
  selectedTaskId: string | null;
  musicProvider: MusicProvider;
  ambientType: 'binaural' | 'lofi' | 'rain' | 'brown_noise' | 'forest';
  ambientVolume: number;
  spotifyPlaylistId: string;
  customSpotifyUrl: string;
  appleMusicEmbedUrl: string;
  customAppleMusicUrl: string;
  completedSessionsCount: number;
}

interface FocusSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize: () => void;
  sessionState: FocusSessionState;
  setSessionState: React.Dispatch<React.SetStateAction<FocusSessionState>>;
  tasks: Task[];
  onCompleteTask?: (taskId: string) => void;
  voiceSettings: VoiceSettings;
  darkMode: boolean;
}

// Curated Focus Playlists for Spotify
const SPOTIFY_FOCUS_PLAYLISTS = [
  { id: '37i9dQZF1DWZeKCadgRdKQ', name: 'Deep Focus', desc: 'Konsentrasi tinggi & ambient lembut' },
  { id: '37i9dQZF1DXdLEN7aqioXM', name: 'Lofi Beats', desc: 'Chill beats rileks & belajar' },
  { id: '37i9dQZF1DX4sWSpwq3LiO', name: 'Peaceful Piano', desc: 'Instrumen piano penenang pikiran' },
  { id: '37i9dQZF1DWXLeA8Omikj7', name: 'Brain Food', desc: 'Elektronik hipnotik & produktif' },
  { id: '37i9dQZF1DX3rxVfibe1L0', name: 'Focus Flow', desc: 'Aliran nada fokus tanpa vokal' },
  { id: '37i9dQZF1DXbITWG1ZJKYt', name: 'Jazz Background', desc: 'Akustik jazz santai di kedai kopi' },
];

// Curated Focus Playlists for Apple Music
const APPLE_MUSIC_FOCUS_PLAYLISTS = [
  { 
    url: 'https://embed.music.apple.com/us/playlist/pure-focus/pl.u-76oNkDvFv59m1X', 
    appUrl: 'https://music.apple.com/us/playlist/pure-focus/pl.u-76oNkDvFv59m1X',
    name: 'Pure Focus', 
    desc: 'Musik fokus instrumental pilihan Apple Music' 
  },
  { 
    url: 'https://embed.music.apple.com/us/playlist/beatstrumentals/pl.704eb5351f7344e78297b830f6e4d75d', 
    appUrl: 'https://music.apple.com/us/playlist/beatstrumentals/pl.704eb5351f7344e78297b830f6e4d75d',
    name: 'BEATstrumentals', 
    desc: 'Lo-Fi & instrumental hip-hop mellow' 
  },
  { 
    url: 'https://embed.music.apple.com/us/playlist/piano-chill/pl.2b0e6e332fdf4b7a91164da3162127b5', 
    appUrl: 'https://music.apple.com/us/playlist/piano-chill/pl.2b0e6e332fdf4b7a91164da3162127b5',
    name: 'Piano Chill', 
    desc: 'Alunan piano lembut kontemplatif' 
  },
  { 
    url: 'https://embed.music.apple.com/us/playlist/ambient-chill/pl.d3e8e19e0cfd4c82b4923f1b3e8e8e7c', 
    appUrl: 'https://music.apple.com/us/playlist/ambient-chill/pl.d3e8e19e0cfd4c82b4923f1b3e8e8e7c',
    name: 'Ambient Chill', 
    desc: 'Gelombang suara atmosferik relaksasi' 
  },
];

// Curated Procedural Ambient Soundscapes
const AMBIENT_SOUNDSCAPES = [
  { id: 'binaural', name: 'Gelombang Alpha 432Hz', icon: '🧠', desc: 'Frekuensi binaural 10Hz untuk fokus mendalam' },
  { id: 'lofi', name: 'Lofi Chords Pad', icon: '🎹', desc: 'Progresi akord jazz lofi hangat & vinyl chill' },
  { id: 'rain', name: 'Hujan & Gemuruh Santai', icon: '🌧️', desc: 'Suara rintik hujan menyejukkan pikiran' },
  { id: 'brown_noise', name: 'Deep Brown Noise', icon: '🌌', desc: 'Meredam kebisingan luar untuk konsentrasi total' },
  { id: 'forest', name: 'Aliran Sungai & Hutan', icon: '🍃', desc: 'Gemericik air sungai & suasana alam terbuka' },
];

const TIMER_PRESETS = [15, 25, 45, 60, 90];

export const FocusSessionModal: React.FC<FocusSessionModalProps> = ({
  isOpen,
  onClose,
  onMinimize,
  sessionState,
  setSessionState,
  tasks,
  onCompleteTask,
  voiceSettings,
  darkMode,
}) => {
  const [customInputUrl, setCustomInputUrl] = useState('');
  const [showCustomUrlInput, setShowCustomUrlInput] = useState(false);

  // Sync ambient audio whenever ambient is selected & session is active/playing
  useEffect(() => {
    if (sessionState.isActive && !sessionState.isPaused && sessionState.musicProvider === 'ambient') {
      playAmbientSound(sessionState.ambientType, sessionState.ambientVolume);
    } else if (sessionState.musicProvider !== 'ambient' || sessionState.isPaused || !sessionState.isActive) {
      stopAmbientSound();
    }
  }, [sessionState.isActive, sessionState.isPaused, sessionState.musicProvider, sessionState.ambientType]);

  // Handle ambient volume updates
  const handleVolumeChange = (vol: number) => {
    setSessionState((prev) => ({ ...prev, ambientVolume: vol }));
    setAmbientVolume(vol);
  };

  // Convert Spotify URL/URI to Embed URL
  const getSpotifyEmbedSrc = () => {
    const raw = sessionState.customSpotifyUrl || sessionState.spotifyPlaylistId;
    let embedPath = `playlist/${sessionState.spotifyPlaylistId}`;

    if (sessionState.customSpotifyUrl) {
      const url = sessionState.customSpotifyUrl.trim();
      // Match spotify:playlist:xxx or open.spotify.com/playlist/xxx / track / album
      const match = url.match(/spotify\.com\/(playlist|track|album|show|episode)\/([a-zA-Z0-9]+)/i) ||
                    url.match(/spotify:(playlist|track|album|show|episode):([a-zA-Z0-9]+)/i);
      if (match) {
        embedPath = `${match[1]}/${match[2]}`;
      }
    }

    return `https://open.spotify.com/embed/${embedPath}?utm_source=generator&theme=${darkMode ? 0 : 1}`;
  };

  // Convert Apple Music URL to Embed URL
  const getAppleMusicEmbedSrc = () => {
    if (sessionState.customAppleMusicUrl) {
      let url = sessionState.customAppleMusicUrl.trim();
      if (url.includes('music.apple.com') && !url.includes('embed.music.apple.com')) {
        url = url.replace('music.apple.com', 'embed.music.apple.com');
      }
      return url;
    }
    return sessionState.appleMusicEmbedUrl;
  };

  // Handle Custom URL Submit
  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInputUrl) return;

    if (sessionState.musicProvider === 'spotify') {
      setSessionState((prev) => ({
        ...prev,
        customSpotifyUrl: customInputUrl,
      }));
    } else if (sessionState.musicProvider === 'applemusic') {
      let url = customInputUrl.trim();
      if (url.includes('music.apple.com') && !url.includes('embed.music.apple.com')) {
        url = url.replace('music.apple.com', 'embed.music.apple.com');
      }
      setSessionState((prev) => ({
        ...prev,
        customAppleMusicUrl: url,
      }));
    }
    setCustomInputUrl('');
    setShowCustomUrlInput(false);
  };

  // Timer Controls
  const handleTogglePlay = () => {
    if (!sessionState.isActive) {
      // Start fresh session
      const name = voiceSettings.userName || 'Ipan';
      playChime('success');
      if (voiceSettings.enabled) {
        speakText(`Sesi fokus ${sessionState.durationMinutes} menit dimulai, ${name}. Selamat berkonsentrasi!`, voiceSettings);
      }
      setSessionState((prev) => ({
        ...prev,
        isActive: true,
        isPaused: false,
        remainingSeconds: prev.durationMinutes * 60,
      }));
    } else {
      // Toggle Pause/Resume
      setSessionState((prev) => ({
        ...prev,
        isPaused: !prev.isPaused,
      }));
    }
  };

  const handleResetTimer = () => {
    stopAmbientSound();
    setSessionState((prev) => ({
      ...prev,
      isActive: false,
      isPaused: false,
      remainingSeconds: prev.durationMinutes * 60,
    }));
  };

  const handleSelectPreset = (mins: number) => {
    setSessionState((prev) => ({
      ...prev,
      durationMinutes: mins,
      remainingSeconds: mins * 60,
      isActive: false,
      isPaused: false,
    }));
  };

  const formatTime = (totalSecs: number) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Progress percentage
  const totalDurationSeconds = sessionState.durationMinutes * 60;
  const progressPercent = totalDurationSeconds > 0 
    ? Math.min(100, Math.max(0, ((totalDurationSeconds - sessionState.remainingSeconds) / totalDurationSeconds) * 100))
    : 0;

  // Active task object
  const activeTask = tasks.find((t) => t.id === sessionState.selectedTaskId);
  const pendingTasks = tasks.filter((t) => !t.completed);

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/75 backdrop-blur-md transition-all duration-300 ${
        isOpen ? 'opacity-100 pointer-events-auto visible' : 'opacity-0 pointer-events-none invisible'
      }`}
      onClick={onClose}
      aria-hidden={!isOpen}
    >
      <div 
        className={`w-full max-w-4xl max-h-[92vh] flex flex-col rounded-[32px] overflow-hidden border shadow-2xl transition-all duration-300 ${
          isOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'
        } ${
          darkMode 
            ? 'bg-[#1C1815] border-white/15 text-[#FAF4EE] shadow-black/80' 
            : 'bg-[#FAF4EE] border-white/80 text-[#3E2F26] shadow-[0_20px_50px_rgba(186,163,143,0.35)]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* TOP HEADER */}
        <div className={`flex items-center justify-between px-5 sm:px-6 py-4 border-b ${
          darkMode ? 'border-white/10 bg-[#251E1A]' : 'border-[#EDE0D4] bg-[#F4E9DF]'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight">
                  Ruang Sesi Fokus
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500 text-white">
                  Focus Mode
                </span>
              </div>
              <p className="text-xs text-orange-600 dark:text-orange-400 font-semibold">
                Tingkatkan konsentrasi dengan pengatur waktu & alunan musik fokus
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 sm:space-x-2">
            {/* Minimize button */}
            <button
              onClick={onMinimize}
              title="Kecilkan ke Bar Mengambang (Floating Focus Bar)"
              className="p-2 rounded-xl text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            {/* Close */}
            <button
              onClick={onClose}
              title="Tutup Modal"
              className="p-2 rounded-xl text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* TOP SECTION: FOCUS TIMER & TASK SELECTION */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
            
            {/* LEFT: 3D CLAY TIMER CLOCK (5 cols) */}
            <div className={`md:col-span-5 p-5 rounded-3xl border flex flex-col items-center justify-between text-center relative overflow-hidden ${
              darkMode 
                ? 'bg-gradient-to-b from-[#251E1A] to-[#1E1815] border-white/10' 
                : 'bg-gradient-to-b from-white to-[#F9EFE7] border-orange-200/60 shadow-sm'
            }`}>
              {/* Background ambient glow pulse when active */}
              {sessionState.isActive && !sessionState.isPaused && (
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/10 via-amber-500/15 to-orange-500/10 rounded-3xl blur-xl animate-pulse pointer-events-none" />
              )}

              {/* Top Preset Pills */}
              <div className="w-full flex items-center justify-center gap-1.5 flex-wrap mb-3">
                {TIMER_PRESETS.map((mins) => (
                  <button
                    key={mins}
                    disabled={sessionState.isActive}
                    onClick={() => handleSelectPreset(mins)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                      sessionState.durationMinutes === mins
                        ? 'bg-orange-500 text-white shadow-sm'
                        : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-orange-950/40 disabled:opacity-50'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>

              {/* Circular Focus Clock Visual */}
              <div className="relative my-2 flex items-center justify-center">
                {/* SVG Progress Ring */}
                <svg className="w-44 h-44 sm:w-48 sm:h-48 transform -rotate-90">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="42%"
                    className={`stroke-current ${darkMode ? 'text-neutral-800' : 'text-orange-100'}`}
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="50%"
                    cy="50%"
                    r="42%"
                    className="stroke-current text-orange-500 transition-all duration-1000 ease-linear"
                    strokeWidth="8"
                    strokeDasharray="264"
                    strokeDashoffset={264 - (264 * progressPercent) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>

                {/* Center Timer Countdown */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-mono text-3xl sm:text-4xl font-black tracking-tight text-[#3E2F26] dark:text-[#FAF4EE]">
                    {formatTime(sessionState.remainingSeconds)}
                  </span>
                  <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400 mt-1 flex items-center space-x-1">
                    {sessionState.isActive ? (
                      sessionState.isPaused ? (
                        <span>⏸️ Dijeda</span>
                      ) : (
                        <span className="flex items-center space-x-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block mr-1"></span>
                          <span>Sedang Berjalan</span>
                        </span>
                      )
                    ) : (
                      <span>Siap Mulai</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Play/Pause/Reset */}
              <div className="w-full flex items-center justify-center space-x-3 mt-3">
                <button
                  onClick={handleTogglePlay}
                  className={`flex-1 py-3 px-4 rounded-2xl font-black text-sm text-white shadow-md flex items-center justify-center space-x-2 active:scale-95 transition ${
                    sessionState.isActive && !sessionState.isPaused
                      ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30'
                      : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-orange-500/30'
                  }`}
                >
                  {sessionState.isActive && !sessionState.isPaused ? (
                    <>
                      <Pause className="w-4 h-4 fill-white" />
                      <span>Jeda</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      <span>{sessionState.isActive ? 'Lanjutkan' : 'Mulai Fokus'}</span>
                    </>
                  )}
                </button>

                {sessionState.isActive && (
                  <button
                    onClick={handleResetTimer}
                    title="Ulangi Waktu"
                    className="p-3 rounded-2xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700 transition active:scale-95"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Stats footer */}
              <div className="mt-3 flex items-center justify-between w-full text-[11px] text-[#8A796E] dark:text-[#A8988D] pt-2 border-t border-gray-200/50 dark:border-white/5">
                <span className="flex items-center space-x-1">
                  <Flame className="w-3.5 h-3.5 text-orange-500" />
                  <span>Sesi Selesai: <strong>{sessionState.completedSessionsCount}</strong></span>
                </span>
                <span>Target: {sessionState.durationMinutes}m</span>
              </div>
            </div>

            {/* RIGHT: TASK FOCUS TARGET & MUSIC PROVIDER SWITCHER (7 cols) */}
            <div className="md:col-span-7 flex flex-col justify-between space-y-4">
              
              {/* Task Target Selector */}
              <div className={`p-4 rounded-3xl border ${
                darkMode ? 'bg-[#251E1A] border-white/10' : 'bg-white border-orange-200/60 shadow-sm'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-black text-[#3E2F26] dark:text-[#FAF4EE] flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-orange-500" />
                    <span>Target Tugas yang Difokuskan</span>
                  </label>
                  {activeTask && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-300">
                      Aktif
                    </span>
                  )}
                </div>

                <select
                  value={sessionState.selectedTaskId || ''}
                  onChange={(e) => {
                    const val = e.target.value || null;
                    setSessionState((prev) => ({ ...prev, selectedTaskId: val }));
                  }}
                  className="w-full px-3.5 py-2.5 rounded-2xl text-xs font-bold border border-orange-200 dark:border-neutral-700 bg-[#FAF4EE] dark:bg-[#1E1815] text-[#3E2F26] dark:text-[#FAF4EE] focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                >
                  <option value="">-- Bebas / Fokus Tanpa Tugas Tertentu --</option>
                  {pendingTasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      📌 {t.title} ({t.priority.toUpperCase()})
                    </option>
                  ))}
                </select>

                {activeTask && (
                  <div className="mt-2.5 p-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200/80 dark:border-orange-900/40 flex items-center justify-between">
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-extrabold text-[#3E2F26] dark:text-[#FAF4EE] truncate">
                        {activeTask.title}
                      </p>
                      {activeTask.dueDate && (
                        <p className="text-[10px] text-orange-600 dark:text-orange-400 font-semibold">
                          Batas waktu: {new Date(activeTask.dueDate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                    {onCompleteTask && (
                      <button
                        onClick={() => onCompleteTask(activeTask.id)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black shadow-xs active:scale-95 transition flex-shrink-0"
                      >
                        Selesai ✓
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* MUSIC PROVIDER SELECTION TABS */}
              <div className={`p-4 rounded-3xl border ${
                darkMode ? 'bg-[#251E1A] border-white/10' : 'bg-white border-orange-200/60 shadow-sm'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black text-[#3E2F26] dark:text-[#FAF4EE] flex items-center space-x-1.5">
                    <Music className="w-4 h-4 text-orange-500" />
                    <span>Pilih Sumber Musik Fokus</span>
                  </span>
                  <span className="text-[10px] font-bold text-[#8A796E] dark:text-[#A8988D]">
                    Hubungkan Playlist
                  </span>
                </div>

                {/* Tabs: Spotify | Apple Music | Ambient Lo-Fi */}
                <div className="grid grid-cols-3 gap-2">
                  
                  {/* Spotify Tab */}
                  <button
                    type="button"
                    onClick={() => {
                      setSessionState((prev) => ({ ...prev, musicProvider: 'spotify' }));
                      stopAmbientSound();
                    }}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center space-y-1.5 ${
                      sessionState.musicProvider === 'spotify'
                        ? 'bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/20'
                        : 'bg-[#FAF4EE] dark:bg-[#1E1815] border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300 hover:border-emerald-500'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-[#1DB954] text-white flex items-center justify-center shadow-xs">
                      <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.498 17.306c-.217.355-.679.467-1.034.25-2.834-1.732-6.402-2.124-10.603-1.164-.403.092-.807-.162-.899-.565-.092-.403.162-.807.565-.899 4.6-1.052 8.544-.61 11.721 1.344.355.217.467.679.25 1.034zm1.467-3.264c-.273.444-.858.586-1.302.313-3.243-1.993-8.188-2.568-12.024-1.403-.497.151-1.026-.135-1.177-.632-.151-.497.135-1.026.632-1.177 4.385-1.332 9.83-.692 13.558 1.597.444.273.586.858.313 1.302zm.126-3.41c-3.89-2.31-10.31-2.523-14.028-1.394-.596.181-1.228-.157-1.409-.753-.181-.596.157-1.228.753-1.409 4.276-1.298 11.36-1.05 15.824 1.6c.535.317.708 1.01.391 1.545-.317.535-1.01.708-1.545.391z"/>
                      </svg>
                    </div>
                    <span className="text-xs font-black">Spotify</span>
                  </button>

                  {/* Apple Music Tab */}
                  <button
                    type="button"
                    onClick={() => {
                      setSessionState((prev) => ({ ...prev, musicProvider: 'applemusic' }));
                      stopAmbientSound();
                    }}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center space-y-1.5 ${
                      sessionState.musicProvider === 'applemusic'
                        ? 'bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/20'
                        : 'bg-[#FAF4EE] dark:bg-[#1E1815] border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300 hover:border-rose-500'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-[#FA243C] text-white flex items-center justify-center shadow-xs">
                      <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.63 1.35-.57.65-.97 1.7-0.83 2.72 1 .08 1.91-.47 2.53-1.22z"/>
                      </svg>
                    </div>
                    <span className="text-xs font-black">Apple Music</span>
                  </button>

                  {/* Built-in Ambient Tab */}
                  <button
                    type="button"
                    onClick={() => {
                      setSessionState((prev) => ({ ...prev, musicProvider: 'ambient' }));
                      if (sessionState.isActive && !sessionState.isPaused) {
                        playAmbientSound(sessionState.ambientType, sessionState.ambientVolume);
                      }
                    }}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center space-y-1.5 ${
                      sessionState.musicProvider === 'ambient'
                        ? 'bg-amber-500 text-white border-amber-400 shadow-md shadow-amber-500/20'
                        : 'bg-[#FAF4EE] dark:bg-[#1E1815] border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300 hover:border-amber-500'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
                      <Radio className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-black">Suara Alam</span>
                  </button>

                </div>
              </div>

            </div>

          </div>

          {/* BOTTOM SECTION: ACTIVE PLAYER & PLAYLIST SELECTOR */}
          <div className={`p-4 sm:p-5 rounded-3xl border ${
            darkMode ? 'bg-[#251E1A] border-white/10' : 'bg-white border-orange-200/60 shadow-sm'
          }`}>
            
            {/* 1. SPOTIFY PLAYER VIEW */}
            {sessionState.musicProvider === 'spotify' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-black flex items-center space-x-2 text-emerald-600 dark:text-emerald-400">
                      <span>🎵 Spotify Focus Player</span>
                    </h4>
                    <p className="text-xs text-[#8A796E] dark:text-[#A8988D]">
                      Pilih playlist instan atau masukkan link Spotify favorit Anda
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowCustomUrlInput(!showCustomUrlInput)}
                      className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-neutral-700 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
                    >
                      {showCustomUrlInput ? 'Tutup Input Link' : '+ Masukkan Link Sendiri'}
                    </button>
                    <a
                      href={`https://open.spotify.com/playlist/${sessionState.spotifyPlaylistId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-[#1DB954] hover:bg-[#1aa34a] text-white text-xs font-extrabold shadow-sm flex items-center space-x-1 transition"
                    >
                      <span>Buka Aplikasi</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Custom URL Form */}
                {showCustomUrlInput && (
                  <form onSubmit={handleApplyCustomUrl} className="flex gap-2 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50">
                    <input
                      type="text"
                      placeholder="Tempel link Spotify playlist / lagu (https://open.spotify.com/playlist/...)"
                      value={customInputUrl}
                      onChange={(e) => setCustomInputUrl(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl text-xs font-semibold border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-[#1E1815] text-[#3E2F26] dark:text-[#FAF4EE] focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-sm"
                    >
                      Terapkan
                    </button>
                  </form>
                )}

                {/* Curated Spotify Playlist Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SPOTIFY_FOCUS_PLAYLISTS.map((pl) => {
                    const isSelected = sessionState.spotifyPlaylistId === pl.id && !sessionState.customSpotifyUrl;
                    return (
                      <button
                        key={pl.id}
                        onClick={() => {
                          setSessionState((prev) => ({
                            ...prev,
                            spotifyPlaylistId: pl.id,
                            customSpotifyUrl: '',
                          }));
                        }}
                        className={`p-2.5 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 shadow-xs'
                            : 'bg-gray-50 dark:bg-neutral-800/40 border-gray-200 dark:border-neutral-700 hover:border-emerald-400'
                        }`}
                      >
                        <p className={`text-xs font-black truncate ${isSelected ? 'text-emerald-700 dark:text-emerald-300' : 'text-[#3E2F26] dark:text-[#FAF4EE]'}`}>
                          {pl.name}
                        </p>
                        <p className="text-[10px] text-[#8A796E] dark:text-[#A8988D] truncate">
                          {pl.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* Spotify Iframe Embed Player */}
                <div className="w-full rounded-2xl overflow-hidden shadow-md border border-emerald-500/20 bg-black min-h-[152px]">
                  <iframe
                    title="Spotify Focus Player"
                    src={getSpotifyEmbedSrc()}
                    width="100%"
                    height="152"
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    className="rounded-2xl"
                  />
                </div>
              </div>
            )}

            {/* 2. APPLE MUSIC PLAYER VIEW */}
            {sessionState.musicProvider === 'applemusic' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-black flex items-center space-x-2 text-rose-600 dark:text-rose-400">
                      <span>🍎 Apple Music Focus Player</span>
                    </h4>
                    <p className="text-xs text-[#8A796E] dark:text-[#A8988D]">
                      Alunan fokus berkualitas tinggi dari kurasi resmi Apple Music
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowCustomUrlInput(!showCustomUrlInput)}
                      className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-neutral-700 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
                    >
                      {showCustomUrlInput ? 'Tutup Input Link' : '+ Masukkan Link Apple Music'}
                    </button>
                    <a
                      href={sessionState.customAppleMusicUrl || sessionState.appleMusicEmbedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-[#FA243C] hover:bg-[#d61b31] text-white text-xs font-extrabold shadow-sm flex items-center space-x-1 transition"
                    >
                      <span>Buka Aplikasi</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Custom URL Form */}
                {showCustomUrlInput && (
                  <form onSubmit={handleApplyCustomUrl} className="flex gap-2 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50">
                    <input
                      type="text"
                      placeholder="Tempel link Apple Music playlist (https://music.apple.com/...)"
                      value={customInputUrl}
                      onChange={(e) => setCustomInputUrl(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl text-xs font-semibold border border-rose-300 dark:border-rose-800 bg-white dark:bg-[#1E1815] text-[#3E2F26] dark:text-[#FAF4EE] focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-sm"
                    >
                      Terapkan
                    </button>
                  </form>
                )}

                {/* Curated Apple Music Playlist Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {APPLE_MUSIC_FOCUS_PLAYLISTS.map((pl) => {
                    const isSelected = sessionState.appleMusicEmbedUrl === pl.url && !sessionState.customAppleMusicUrl;
                    return (
                      <button
                        key={pl.url}
                        onClick={() => {
                          setSessionState((prev) => ({
                            ...prev,
                            appleMusicEmbedUrl: pl.url,
                            customAppleMusicUrl: '',
                          }));
                        }}
                        className={`p-2.5 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-500 shadow-xs'
                            : 'bg-gray-50 dark:bg-neutral-800/40 border-gray-200 dark:border-neutral-700 hover:border-rose-400'
                        }`}
                      >
                        <p className={`text-xs font-black truncate ${isSelected ? 'text-rose-700 dark:text-rose-300' : 'text-[#3E2F26] dark:text-[#FAF4EE]'}`}>
                          {pl.name}
                        </p>
                        <p className="text-[10px] text-[#8A796E] dark:text-[#A8988D] truncate">
                          {pl.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* Apple Music Iframe Embed Player */}
                <div className="w-full rounded-2xl overflow-hidden shadow-md border border-rose-500/20 bg-black min-h-[175px]">
                  <iframe
                    title="Apple Music Focus Player"
                    src={getAppleMusicEmbedSrc()}
                    width="100%"
                    height="175"
                    frameBorder="0"
                    allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
                    sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
                    className="rounded-2xl"
                  />
                </div>
              </div>
            )}

            {/* 3. BUILT-IN AMBIENT SOUNDSCAPES VIEW */}
            {sessionState.musicProvider === 'ambient' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-black flex items-center space-x-2 text-amber-600 dark:text-amber-400">
                      <span>🧘 Suara Alam & Ambient Lo-Fi (Offline)</span>
                    </h4>
                    <p className="text-xs text-[#8A796E] dark:text-[#A8988D]">
                      Synthesizer audio prosedural tanpa perlu login atau koneksi internet
                    </p>
                  </div>

                  {/* Volume Slider */}
                  <div className="flex items-center space-x-2 bg-gray-100 dark:bg-neutral-800 px-3 py-1.5 rounded-2xl">
                    <Volume2 className="w-4 h-4 text-amber-500" />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={sessionState.ambientVolume}
                      onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                      className="w-20 sm:w-28 accent-amber-500 cursor-pointer"
                    />
                    <span className="text-[11px] font-mono font-bold w-7 text-right">
                      {Math.round(sessionState.ambientVolume * 100)}%
                    </span>
                  </div>
                </div>

                {/* Soundscapes Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {AMBIENT_SOUNDSCAPES.map((amb) => {
                    const isSelected = sessionState.ambientType === amb.id;
                    return (
                      <button
                        key={amb.id}
                        onClick={() => {
                          setSessionState((prev) => ({ ...prev, ambientType: amb.id as any }));
                          if (sessionState.isActive && !sessionState.isPaused) {
                            playAmbientSound(amb.id as any, sessionState.ambientVolume);
                          }
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all flex items-start space-x-3 ${
                          isSelected
                            ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-500 shadow-sm'
                            : 'bg-gray-50 dark:bg-neutral-800/40 border-gray-200 dark:border-neutral-700 hover:border-amber-400'
                        }`}
                      >
                        <span className="text-xl flex-shrink-0">{amb.icon}</span>
                        <div className="min-w-0">
                          <p className={`text-xs font-black truncate ${isSelected ? 'text-amber-700 dark:text-amber-300' : 'text-[#3E2F26] dark:text-[#FAF4EE]'}`}>
                            {amb.name}
                          </p>
                          <p className="text-[10px] text-[#8A796E] dark:text-[#A8988D] line-clamp-2 mt-0.5">
                            {amb.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

        </div>

        {/* MODAL FOOTER */}
        <div className={`px-6 py-3.5 border-t flex items-center justify-between ${
          darkMode ? 'border-white/10 bg-[#251E1A]' : 'border-[#EDE0D4] bg-[#F4E9DF]'
        }`}>
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#8A796E] dark:text-[#A8988D]">
            <Info className="w-3.5 h-3.5 text-orange-500" />
            <span>Mode fokus akan tetap berjalan di bar mengambang jika modal ini diminimalkan.</span>
          </div>

          <button
            onClick={onMinimize}
            className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs shadow-sm transition active:scale-95 flex items-center space-x-1.5"
          >
            <span>Kecilkan Layar</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
