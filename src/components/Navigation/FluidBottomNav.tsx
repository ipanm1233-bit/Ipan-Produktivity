import React from 'react';
import { motion } from 'motion/react';
import { 
  Home, 
  CheckSquare, 
  DollarSign, 
  Calendar as CalendarIcon, 
  BarChart3 
} from 'lucide-react';

interface FluidBottomNavProps {
  activeTab: 'dashboard' | 'tasks' | 'calendar' | 'finance' | 'analytics';
  onSelectTab: (tab: 'dashboard' | 'tasks' | 'calendar' | 'finance' | 'analytics') => void;
  darkMode: boolean;
}

interface TabItem {
  id: 'dashboard' | 'tasks' | 'finance' | 'calendar' | 'analytics';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABS: TabItem[] = [
  { id: 'dashboard', label: 'Beranda', icon: Home },
  { id: 'tasks', label: 'Tugas', icon: CheckSquare },
  { id: 'finance', label: 'Keuangan', icon: DollarSign },
  { id: 'calendar', label: 'Kalender', icon: CalendarIcon },
  { id: 'analytics', label: 'Statistik', icon: BarChart3 },
];

export const FluidBottomNav: React.FC<FluidBottomNavProps> = ({
  activeTab,
  onSelectTab,
  darkMode,
}) => {
  return (
    <div className="md:hidden fixed bottom-3 left-3 right-3 z-40 max-w-md mx-auto pointer-events-none">
      <nav
        aria-label="Mobile Fluid Navigation"
        className={`pointer-events-auto relative px-2 py-1.5 rounded-[26px] border flex items-center justify-between backdrop-blur-2xl transition-colors duration-300 ${
          darkMode
            ? 'bg-[#201B18]/95 border-white/10 shadow-[0_12px_32px_rgba(0,0,0,0.65)]'
            : 'bg-[#FAF3EC]/95 border-white/90 shadow-[0_12px_32px_rgba(186,163,143,0.35)]'
        }`}
        style={{
          marginBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className="relative flex-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-2xl min-h-[50px] transition-all group focus:outline-none select-none"
            >
              {/* FLUID FLOATING ORB (Ball animation that follows the active menu) */}
              {isActive && (
                <motion.div
                  layoutId="fluidNavOrb"
                  className="absolute inset-x-1.5 top-0.5 bottom-0.5 rounded-2xl z-0 overflow-hidden"
                  transition={{
                    type: 'spring',
                    stiffness: 380,
                    damping: 30,
                    mass: 0.8,
                  }}
                >
                  {/* 3D Clay Fluid Ball Gradient */}
                  <div className="w-full h-full rounded-2xl bg-gradient-to-b from-[#FB923C] via-[#EA580C] to-[#C2410C] shadow-[0_4px_14px_rgba(234,88,12,0.45)] border border-white/40 flex items-center justify-center relative">
                    {/* Top glossy sphere light specular reflection */}
                    <div className="absolute top-1 left-2 right-2 h-2.5 rounded-full bg-gradient-to-b from-white/60 to-transparent pointer-events-none" />
                    {/* Bottom subtle shadow inside orb */}
                    <div className="absolute bottom-1 left-3 right-3 h-1.5 rounded-full bg-black/20 pointer-events-none" />
                  </div>
                </motion.div>
              )}

              {/* Icon & Label Content */}
              <div className="relative z-10 flex flex-col items-center justify-center">
                <motion.div
                  animate={{
                    scale: isActive ? 1.15 : 1,
                    y: isActive ? -1 : 0,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className={`p-1 transition-colors duration-200 ${
                    isActive
                      ? 'text-white'
                      : 'text-[#8A796E] dark:text-[#A8988D] group-hover:text-[#3E2F26] dark:group-hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </motion.div>

                <span
                  className={`text-[9.5px] tracking-tight truncate whitespace-nowrap transition-colors duration-200 leading-none mt-0.5 font-bold ${
                    isActive
                      ? 'text-white font-extrabold drop-shadow-xs'
                      : 'text-[#8A796E] dark:text-[#A8988D]'
                  }`}
                >
                  {tab.label}
                </span>
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
