import React from 'react';
import { 
  Play, 
  Pause, 
  Maximize2, 
  X, 
  Headphones, 
  Flame, 
  Volume2, 
  VolumeX, 
  Radio, 
  Music,
  CheckCircle2
} from 'lucide-react';
import { FocusSessionState } from './FocusSessionModal';
import { Task } from '../../types';

interface FloatingFocusBarProps {
  sessionState: FocusSessionState;
  setSessionState: React.Dispatch<React.SetStateAction<FocusSessionState>>;
  onMaximize: () => void;
  onStopSession: () => void;
  tasks: Task[];
  darkMode: boolean;
}

export const FloatingFocusBar: React.FC<FloatingFocusBarProps> = ({
  sessionState,
  setSessionState,
  onMaximize,
  onStopSession,
  tasks,
  darkMode,
}) => {
  if (!sessionState.isActive) return null;

  const activeTask = tasks.find((t) => t.id === sessionState.selectedTaskId);

  const formatTime = (totalSecs: number) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleTogglePause = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSessionState((prev) => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const totalDurationSeconds = sessionState.durationMinutes * 60;
  const progressPercent = totalDurationSeconds > 0 
    ? Math.min(100, Math.max(0, ((totalDurationSeconds - sessionState.remainingSeconds) / totalDurationSeconds) * 100))
    : 0;

  return (
    <div 
      className="fixed z-40 bottom-18 md:bottom-6 right-3 md:right-6 max-w-sm w-[calc(100%-1.5rem)] md:w-auto animate-slideUp"
    >
      <div 
        onClick={onMaximize}
        className={`group relative cursor-pointer px-4 py-3 rounded-2xl md:rounded-3xl border shadow-2xl backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.99] flex items-center justify-between gap-3.5 ${
          darkMode 
            ? 'bg-[#221C18]/95 border-orange-500/30 text-white shadow-black/80' 
            : 'bg-white/95 border-orange-200 text-[#3E2F26] shadow-[0_12px_32px_rgba(234,88,12,0.22)]'
        }`}
      >
        {/* Subtle top progress bar */}
        <div className="absolute top-0 left-3 right-3 h-1 bg-gray-100 dark:bg-neutral-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-1000"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Left: Icon & Timer */}
        <div className="flex items-center space-x-3 min-w-0">
          <div className="relative">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md flex-shrink-0 ${
              sessionState.musicProvider === 'spotify' 
                ? 'bg-[#1DB954]' 
                : sessionState.musicProvider === 'applemusic' 
                ? 'bg-[#FA243C]' 
                : 'bg-gradient-to-tr from-orange-500 to-amber-400'
            }`}>
              <Headphones className="w-5 h-5" />
            </div>
            {!sessionState.isPaused && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
              </span>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center space-x-1.5">
              <span className="font-mono text-base font-black tracking-tight">
                {formatTime(sessionState.remainingSeconds)}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-orange-500/15 text-orange-600 dark:text-orange-400 uppercase">
                {sessionState.musicProvider === 'spotify' ? 'Spotify' : sessionState.musicProvider === 'applemusic' ? 'Apple Music' : 'Ambient'}
              </span>
            </div>

            <p className="text-[11px] font-semibold text-[#8A796E] dark:text-[#A8988D] truncate max-w-[150px] sm:max-w-[190px]">
              {activeTask ? `🎯 ${activeTask.title}` : 'Sesi Fokus Berjalan...'}
            </p>
          </div>
        </div>

        {/* Right: Controls (Play/Pause, Maximize, Stop) */}
        <div className="flex items-center space-x-1 flex-shrink-0">
          <button
            type="button"
            onClick={handleTogglePause}
            title={sessionState.isPaused ? 'Lanjutkan' : 'Jeda'}
            className="p-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white shadow-xs active:scale-95 transition"
          >
            {sessionState.isPaused ? (
              <Play className="w-3.5 h-3.5 fill-white" />
            ) : (
              <Pause className="w-3.5 h-3.5 fill-white" />
            )}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMaximize();
            }}
            title="Buka Ruang Fokus Penuh"
            className="p-2 rounded-xl text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onStopSession();
            }}
            title="Akhiri Sesi Fokus"
            className="p-2 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
