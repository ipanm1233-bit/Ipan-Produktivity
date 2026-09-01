import React, { useState } from 'react';
import { 
  Tablet, 
  RotateCw, 
  Sparkles, 
  X, 
  Maximize2, 
  CheckCircle2,
  Sliders,
  Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TabletOrientationState } from '../../hooks/useTabletOrientation';

interface TabletLandscapePromptProps {
  orientation: TabletOrientationState;
  darkMode: boolean;
}

export const TabletLandscapePrompt: React.FC<TabletLandscapePromptProps> = ({
  orientation,
  darkMode,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isTryingLock, setIsTryingLock] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // If in landscape, reset dismissed state so it triggers if they ever rotate back to portrait
  React.useEffect(() => {
    if (orientation.isLandscape && orientation.isTablet) {
      if (isDismissed) {
        setIsDismissed(false);
      }
    }
  }, [orientation.isLandscape, orientation.isTablet, isDismissed]);

  const handleRequestLandscape = async () => {
    setIsTryingLock(true);
    const success = await orientation.requestLandscape();
    setIsTryingLock(false);
    if (success) {
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    }
  };

  // Only render on tablet devices in portrait mode or if floating re-open pill is active
  if (!orientation.isTabletPortrait) return null;

  return (
    <>
      {/* Floating Mini Pill when user dismissed the full overlay */}
      {isDismissed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="fixed z-50 bottom-24 right-4 md:bottom-6 md:right-6"
        >
          <button
            onClick={() => setIsDismissed(false)}
            className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-full border shadow-xl backdrop-blur-xl transition-all active:scale-95 ${
              darkMode
                ? 'bg-[#221C18]/95 border-orange-500/40 text-orange-400 shadow-black/80'
                : 'bg-white/95 border-orange-300 text-orange-800 shadow-[0_8px_24px_rgba(234,88,12,0.25)]'
            }`}
          >
            <RotateCw className="w-4 h-4 animate-spin text-orange-500" style={{ animationDuration: '4s' }} />
            <span className="text-xs font-black">Saran: Putar ke Landscape</span>
          </button>
        </motion.div>
      )}

      {/* Main Overlay Modal / Card for Tablet Portrait Mode */}
      <AnimatePresence>
        {!isDismissed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`w-full max-w-lg rounded-[32px] p-6 sm:p-8 border shadow-2xl relative overflow-hidden flex flex-col items-center text-center ${
                darkMode
                  ? 'bg-[#1F1A17] border-white/10 text-[#FAF4EE] shadow-black/80'
                  : 'bg-[#FAF3EC] border-white/80 text-[#3E2F26] shadow-[0_24px_60px_rgba(186,163,143,0.4)]'
              }`}
            >
              {/* Background ambient glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-gradient-to-br from-orange-500/20 to-amber-400/20 blur-2xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-gradient-to-br from-orange-600/15 to-transparent blur-2xl pointer-events-none" />

              {/* Close / Dismiss button */}
              <button
                type="button"
                onClick={() => setIsDismissed(true)}
                className="absolute top-4 right-4 p-2.5 rounded-2xl clay-button text-[#8A796E] dark:text-[#D4C7BC] hover:text-[#3E2F26] dark:hover:text-white"
                title="Lanjutkan dalam mode tegak"
              >
                <X className="w-4 h-4" />
              </button>

              {/* 3D Animated Tablet Illustration */}
              <div className="relative my-4 flex items-center justify-center">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-orange-500 to-amber-400 p-1 shadow-[0_12px_28px_rgba(234,88,12,0.35)] flex items-center justify-center border-2 border-white/80">
                  <div className="w-full h-full rounded-[22px] bg-[#2E241E] flex items-center justify-center relative overflow-hidden">
                    
                    {/* Rotating tablet icon visual */}
                    <motion.div
                      animate={{
                        rotate: [0, 0, 90, 90, 0],
                        scale: [1, 1, 1.08, 1.08, 1],
                      }}
                      transition={{
                        duration: 3.5,
                        repeat: Infinity,
                        repeatDelay: 0.5,
                        ease: 'easeInOut',
                      }}
                      className="w-14 h-14 rounded-xl border-2 border-orange-400 bg-orange-500/20 flex flex-col items-center justify-between p-1.5 shadow-md"
                    >
                      <div className="w-4 h-1 rounded-full bg-white/50" />
                      <div className="w-full flex-1 my-1 rounded-md bg-white/10 flex items-center justify-center">
                        <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                      </div>
                      <div className="w-2 h-2 rounded-full bg-orange-400/80" />
                    </motion.div>

                    {/* Rotation indicator ring */}
                    <div className="absolute inset-0 border-2 border-dashed border-orange-500/30 rounded-[22px] pointer-events-none" />
                  </div>
                </div>

                {/* Floating 3D Badge */}
                <span className="absolute -bottom-2 -right-2 px-2.5 py-1 rounded-full bg-white dark:bg-neutral-800 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-neutral-700 text-[10px] font-black shadow-md flex items-center space-x-1">
                  <RotateCw className="w-3 h-3 text-orange-500" />
                  <span>90° Landscape</span>
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-2 mt-2">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 text-xs font-black">
                  <Tablet className="w-3.5 h-3.5" />
                  <span>Tampilan Tablet Terdeteksi</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-[#3E2F26] dark:text-[#FAF4EE] tracking-tight">
                  Pastikan Tablet dalam Posisi Landscape
                </h3>

                <p className="text-xs sm:text-sm text-[#8A796E] dark:text-[#BDB0A4] font-medium max-w-md mx-auto leading-relaxed">
                  Putar tablet Anda ke posisi <span className="font-bold text-orange-600 dark:text-orange-400">Mendatar (Landscape)</span> untuk menikmati tata letak produktivitas lengkap: Sidebar 3D, Kalender 2 kolom, Grafik mingguan, dan Ruang Fokus musik.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="w-full mt-6 space-y-2.5">
                <button
                  type="button"
                  onClick={handleRequestLandscape}
                  disabled={isTryingLock}
                  className="w-full py-3 sm:py-3.5 px-5 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-black text-sm shadow-[0_8px_20px_rgba(234,88,12,0.35)] transition-all active:scale-98 flex items-center justify-center space-x-2"
                >
                  <RotateCw className={`w-4 h-4 ${isTryingLock ? 'animate-spin' : ''}`} />
                  <span>{isTryingLock ? 'Mengatur Layar...' : 'Kunci / Putar ke Layar Landscape'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsDismissed(true)}
                  className="w-full py-2.5 sm:py-3 px-4 rounded-2xl clay-button text-[#8A796E] dark:text-[#D4C7BC] font-bold text-xs transition active:scale-98"
                >
                  Lanjutkan dalam Mode Tegak (Portrait)
                </button>
              </div>

              {/* Tip footer */}
              <p className="text-[11px] text-[#A8988D] dark:text-[#7A6E65] mt-4 flex items-center justify-center space-x-1">
                <span>💡 Cukup putar fisik tablet Anda ke samping (horizontal)</span>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
