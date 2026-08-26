import React, { useState } from 'react';
import { 
  Task, 
  Transaction, 
  TaskCategory, 
  FinanceCategory, 
  MonthlyBudgetConfig, 
  VoiceSettings,
  CharacterAvatarConfig
} from '../../types';
import { 
  CheckCircle2, 
  Circle, 
  TrendingUp, 
  TrendingDown, 
  Flame, 
  Volume2, 
  Clock, 
  Calendar, 
  Plus, 
  ArrowUpRight, 
  Sparkles, 
  Play, 
  Layers,
  DollarSign,
  Heart,
  Timer,
  Check,
  Zap,
  Tag,
  Image as ImageIcon,
  Square,
  Upload,
  Camera,
  RotateCw,
  Film,
  Headphones
} from 'lucide-react';
import { speakText, playChime, stopSpeaking } from '../../utils/audio';
import clayAvatarBg from '../../assets/images/clay_avatar_bg_1787581636772.jpg';
import clayAvatarCutout from '../../assets/images/clay_avatar_cutout_1787581662245.jpg';
import { CharacterCustomizerModal } from './CharacterCustomizerModal';
import { DEFAULT_CHARACTER_CONFIG } from '../../data/characterPresets';

interface ClayDashboardOverviewProps {
  tasks: Task[];
  transactions: Transaction[];
  taskCategories: TaskCategory[];
  financeCategories: FinanceCategory[];
  budgetConfig: MonthlyBudgetConfig;
  voiceSettings: VoiceSettings;
  characterConfig?: CharacterAvatarConfig;
  onSaveCharacterConfig?: (config: CharacterAvatarConfig) => void;
  onToggleTaskComplete: (id: string) => void;
  onOpenNewTaskModal: () => void;
  onOpenNewTxModal: () => void;
  onNavigateTab: (tab: 'dashboard' | 'tasks' | 'calendar' | 'finance' | 'analytics') => void;
  openFocusModal?: () => void;
  isFocusActive?: boolean;
  darkMode: boolean;
}

export const ClayDashboardOverview: React.FC<ClayDashboardOverviewProps> = ({
  tasks,
  transactions,
  taskCategories,
  financeCategories,
  budgetConfig,
  voiceSettings,
  characterConfig = DEFAULT_CHARACTER_CONFIG,
  onSaveCharacterConfig,
  onToggleTaskComplete,
  onOpenNewTaskModal,
  onOpenNewTxModal,
  onNavigateTab,
  openFocusModal,
  isFocusActive,
  darkMode,
}) => {
  const [isPlayingBrief, setIsPlayingBrief] = useState(false);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHoveredAvatar, setIsHoveredAvatar] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  // Character config values with fallback
  const charUrl = characterConfig.url || DEFAULT_CHARACTER_CONFIG.url;
  const charScale = characterConfig.scale ?? DEFAULT_CHARACTER_CONFIG.scale;
  const charFlip = characterConfig.flipHorizontal ?? false;
  const charPodium = characterConfig.showPodium ?? true;
  const charAnim = characterConfig.animationStyle || 'float';
  const charGlow = (characterConfig.glowColor ?? 'orange') as 'orange' | 'emerald' | 'cyan' | 'purple' | 'amber' | 'none';
  const charMode = characterConfig.mode || 'transparent_cutout';
  const isGif = characterConfig.isGif ?? false;
  const isTransparent = characterConfig.isTransparent ?? true;

  // Mouse tilt tracking for 3D parallax pop-out effect
  const handleAvatarMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 20, y: -y * 20 });
  };

  const handleAvatarMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHoveredAvatar(false);
  };

  // User details
  const userName = voiceSettings.userName || 'Ipan';

  // Task metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = tasks.filter(t => !t.completed);
  const pendingCount = pendingTasks.length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Finance calculations
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;
  const totalBudget = budgetConfig.totalBudget || 5000000;
  const budgetUsedPercent = Math.min(100, Math.round((totalExpense / totalBudget) * 100));

  // Glow map
  const glowMap = {
    orange: 'bg-orange-500/25',
    emerald: 'bg-emerald-500/25',
    cyan: 'bg-cyan-500/25',
    purple: 'bg-purple-500/25',
    amber: 'bg-amber-500/25',
    none: 'hidden',
  };

  // Determine greeting based on local time
  const currentHour = new Date().getHours();
  let greetingTime = 'Pagi';
  let greetingIcon = '☀️';
  if (currentHour >= 11 && currentHour < 15) {
    greetingTime = 'Siang';
    greetingIcon = '🌤️';
  } else if (currentHour >= 15 && currentHour < 18) {
    greetingTime = 'Sore';
    greetingIcon = '🌇';
  } else if (currentHour >= 18 || currentHour < 5) {
    greetingTime = 'Malam';
    greetingIcon = '🌙';
  }

  // Voice briefing trigger with toggle support
  const handlePlayVoiceBriefing = async () => {
    if (isPlayingBrief) {
      stopSpeaking();
      setIsPlayingBrief(false);
      return;
    }
    setIsPlayingBrief(true);
    playChime('success');

    const topTask = pendingTasks[0]?.title || 'semua tugasmu sudah beres';
    const briefText = `Selamat ${greetingTime.toLowerCase()}, ${userName}! Hari ini kamu memiliki ${pendingCount} tugas yang perlu diselesaikan. Tugas prioritas utamamu adalah ${topTask}. Sisa saldo dompetmu saat ini adalah Rp ${netBalance.toLocaleString('id-ID')}. Tetap semangat dan produktif hari ini!`;

    try {
      await speakText(briefText, voiceSettings);
    } finally {
      setIsPlayingBrief(false);
    }
  };

  const handleSpeakSingleTask = async (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    playChime('reminder');
    const dueTime = new Date(task.dueDate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const text = `Tugas: ${task.title}. Batas waktu jam ${dueTime}.`;
    await speakText(text, voiceSettings);
  };

  // Generate dynamic 7 days weekly data based on real tasks
  const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const today = new Date();
  
  const weeklyActivity = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (6 - i));
    const dayKey = d.toISOString().slice(0, 10);
    const dayName = daysOfWeek[d.getDay()];
    
    // Real task completions or defaults
    const doneOnDay = tasks.filter(
      (t) => (t.completedAt && t.completedAt.slice(0, 10) === dayKey) ||
             (t.completed && t.dueDate && t.dueDate.slice(0, 10) === dayKey)
    ).length;
    
    const plannedOnDay = tasks.filter(
      (t) => t.dueDate && t.dueDate.slice(0, 10) === dayKey
    ).length;

    // Use actual count if tasks exist, otherwise aesthetic baseline
    const val = (doneOnDay > 0 || plannedOnDay > 0) 
      ? Math.max(doneOnDay, plannedOnDay)
      : [4, 6, 3, 5, 4, 7, 5][i];

    const maxVal = 8;
    const heightPercent = Math.max(20, Math.min(100, Math.round((val / maxVal) * 100)));
    
    const gradients = [
      'from-amber-400 to-orange-500',
      'from-orange-400 to-rose-500',
      'from-rose-400 to-pink-500',
      'from-emerald-400 to-teal-500',
      'from-teal-400 to-cyan-500',
      'from-cyan-400 to-blue-500',
      'from-indigo-400 to-purple-500',
    ];

    return {
      day: dayName,
      dateLabel: `${d.getDate()}/${d.getMonth() + 1}`,
      value: val,
      height: `${heightPercent}%`,
      color: gradients[i % gradients.length],
      isToday: i === 6,
    };
  });

  // Calculate dynamic category distribution from actual categories
  const dynamicDist = taskCategories.length > 0 ? taskCategories.slice(0, 4).map((cat, index) => {
    const catTasks = tasks.filter(t => t.category === cat.id).length;
    const colors = ['#E67E51', '#F2A365', '#68B0AB', '#8E9AAF'];
    return {
      label: cat.name,
      count: catTasks,
      percent: totalTasks > 0 ? Math.round((catTasks / totalTasks) * 100) : [45, 25, 18, 12][index] || 15,
      color: cat.color || colors[index % colors.length],
    };
  }) : [
    { label: 'Pekerjaan', count: 4, percent: 45, color: '#E67E51' },
    { label: 'Belanja & Makan', count: 2, percent: 25, color: '#F2A365' },
    { label: 'Tagihan Rutin', count: 2, percent: 18, color: '#68B0AB' },
    { label: 'Investasi/Kas', count: 1, percent: 12, color: '#8E9AAF' },
  ];

  return (
    <div className="space-y-6">
      
      {/* 1. HERO BANNER CARD (Claymorphism & 3D Interactive Pop-Out Character Scene) */}
      <section className={`relative rounded-[32px] overflow-visible p-5 sm:p-7 transition-all ${
        darkMode 
          ? 'bg-gradient-to-r from-[#2C2420] via-[#241E1C] to-[#1E1917] border border-white/10 shadow-2xl' 
          : 'bg-gradient-to-r from-[#FDEFE3] via-[#FDF3EA] to-[#F7E6D7] border-2 border-white/80 shadow-[0_12px_32px_rgba(195,160,135,0.22)]'
      }`}>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
          
          {/* Left: 3D Clay / Animated GIF Character Illustration (Clean & Minimalist 3D Stage) */}
          <div 
            className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-square sm:aspect-4/3 flex items-center justify-center flex-shrink-0 select-none group perspective-1000 cursor-pointer"
            onClick={() => setIsCustomizerOpen(true)}
            onMouseMove={(e) => {
              setIsHoveredAvatar(true);
              handleAvatarMouseMove(e);
            }}
            onMouseLeave={handleAvatarMouseLeave}
            title="Klik untuk kustomisasi karakter (Foto PNG / Animasi GIF)"
          >
            {/* Subtle Minimalist Quick Edit Button in Corner */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsCustomizerOpen(true);
              }}
              className="absolute top-0 right-0 sm:right-2 z-30 p-2 sm:p-2.5 rounded-2xl bg-white/85 dark:bg-[#251E1A]/85 backdrop-blur-md border border-white/60 dark:border-white/10 text-[#8A796E] dark:text-[#C5B7AE] hover:text-orange-600 dark:hover:text-orange-400 shadow-md hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 flex items-center space-x-1 text-xs font-bold"
              title="Kustomisasi Karakter"
            >
              <Camera className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-[10px] hidden sm:inline">Ganti</span>
            </button>

            {charMode === 'transparent_cutout' ? (
              /* --- MODE 3D CUTOUT POP-OUT (Clean Floating Character & Podium) --- */
              <div 
                className="relative w-full h-full flex items-center justify-center"
                style={{ perspective: '1000px' }}
              >
                {/* 3D Clay Podium Base (Pedestal) */}
                {charPodium && (
                  <div className={`absolute -bottom-2 w-[82%] h-13 rounded-[36px] transition-all duration-500 border-2 ${
                    darkMode 
                      ? 'bg-gradient-to-b from-[#352B25] to-[#1F1916] border-white/10 shadow-[0_16px_32px_rgba(0,0,0,0.7)]' 
                      : 'bg-gradient-to-b from-[#F2E0D0] to-[#E5CCA8] border-white/90 shadow-[0_14px_28px_rgba(180,140,110,0.35)]'
                  }`}>
                    <div className="absolute inset-x-4 top-1.5 h-1.5 rounded-full bg-white/40 blur-xs"></div>
                  </div>
                )}

                {/* Ambient Soft Glow Behind Character */}
                {charGlow !== 'none' && (
                  <div className={`absolute -top-6 w-44 h-44 rounded-full blur-2xl pointer-events-none transition-all ${glowMap[charGlow]}`}></div>
                )}

                {/* 3D Character Popping OUT of the Frame (Transparent Background with Silhouette Drop Shadow) */}
                <div 
                  className={`relative z-20 w-full h-full flex items-center justify-center transition-transform duration-200 ease-out ${
                    charAnim === 'float' ? 'animate-float' :
                    charAnim === 'bounce' ? 'animate-bounce [animation-duration:2.5s]' :
                    charAnim === 'pulse' ? 'animate-pulse' :
                    charAnim === 'gentle' ? 'animate-float [animation-duration:6s]' : ''
                  }`}
                  style={{
                    transform: `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg) translateY(${isHoveredAvatar ? -12 : -4}px) scale(${isHoveredAvatar ? charScale * 1.04 : charScale}) ${charFlip ? 'scaleX(-1)' : ''}`,
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <img
                    src={charUrl}
                    alt="Karakter Pendamping Transparan"
                    referrerPolicy="no-referrer"
                    className="w-[92%] h-[115%] object-contain object-bottom filter drop-shadow-[0_18px_24px_rgba(0,0,0,0.35)] transition-transform duration-300 pointer-events-none"
                    style={{
                      transform: 'translateZ(30px)',
                    }}
                  />
                </div>
              </div>
            ) : (
              /* --- MODE STUDIO CLAY (Inside Rounded 3D Frame) --- */
              <div 
                className="relative w-full h-full rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-white/90 shadow-[0_8px_24px_rgba(0,0,0,0.12)] bg-[#F5ECE2] dark:bg-[#1A1614]"
              >
                <img
                  src={charUrl}
                  alt="Karakter Pendamping Studio"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            )}
          </div>

          {/* Right: Content & Action */}
          <div className="flex-1 text-center lg:text-left space-y-3">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-600 dark:text-orange-400 text-xs font-bold">
              <span>{greetingIcon}</span>
              <span>Selamat {greetingTime}, {userName}!</span>
            </div>

            <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight ${
              darkMode ? 'text-[#FAF4EE]' : 'text-[#3E2F26]'
            }`}>
              Siap taklukkan target produktivitas hari ini?
            </h1>

            <p className={`text-xs sm:text-sm max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium ${
              darkMode ? 'text-[#C5B7AE]' : 'text-[#7D6B5F]'
            }`}>
              Kamu punya <b className="text-orange-600 dark:text-orange-400 font-bold">{pendingCount} tugas aktif</b> yang menunggu. Pantau juga pengeluaran agar tetap dalam batas anggaran bulanan.
            </p>

            {/* Clay Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={handlePlayVoiceBriefing}
                className={`clay-button-primary px-5 py-2.5 sm:py-3 rounded-full text-xs font-bold flex items-center space-x-2 shadow-lg transition active:scale-95 ${
                  isPlayingBrief ? 'ring-2 ring-white/60 bg-gradient-to-r from-orange-600 to-amber-600' : ''
                }`}
              >
                {isPlayingBrief ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-white animate-pulse" />
                    <span className="flex items-center space-x-1.5">
                      <span>Sedang Berbicara</span>
                      <span className="flex space-x-0.5 items-center">
                        <span className="w-1 h-3 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1 h-4 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-1 h-2 bg-white rounded-full animate-bounce"></span>
                      </span>
                    </span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Dengarkan Briefing Suara AI</span>
                  </>
                )}
              </button>

              <button
                onClick={onOpenNewTaskModal}
                className={`clay-button px-5 py-2.5 sm:py-3 rounded-full text-xs font-bold flex items-center space-x-2 transition active:scale-95 ${
                  darkMode ? 'text-zinc-200' : 'text-[#5A453A]'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Tugas Baru</span>
              </button>

              {openFocusModal && (
                <button
                  onClick={openFocusModal}
                  className={`px-5 py-2.5 sm:py-3 rounded-full text-xs font-black flex items-center space-x-2 shadow-md transition active:scale-95 ${
                    isFocusActive
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white animate-pulse'
                      : 'bg-white dark:bg-neutral-800 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-neutral-700 hover:bg-orange-50 dark:hover:bg-neutral-700'
                  }`}
                >
                  <Headphones className="w-4 h-4 text-orange-500" />
                  <span>{isFocusActive ? 'Ruang Fokus Berjalan' : 'Sesi Fokus & Musik'}</span>
                </button>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* 2. 4 SYMMETRICAL STAT CARDS (Equal height & balanced rhythm) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 items-stretch">
        
        {/* Card 1: Tasks Done */}
        <div className={`clay-card p-5 flex flex-col justify-between transition-transform hover:-translate-y-1 ${
          darkMode ? 'bg-[#25201D]' : 'bg-[#FAF3EC]'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner border border-emerald-500/30">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                {taskCompletionRate}% selesai
              </span>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A796E] dark:text-[#A8988D] block">
              Tugas Selesai
            </span>
            <div className="flex items-baseline space-x-2 mt-1">
              <h3 className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-[#3E2F26]'}`}>
                {completedTasks}<span className="text-sm font-bold text-[#8A796E] dark:text-[#A8988D]">/{totalTasks}</span>
              </h3>
            </div>
          </div>
          <div className="pt-3 mt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[10px] text-[#8A796E] dark:text-[#A8988D] font-medium">
            <span>{pendingCount} tugas aktif</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{completedTasks} tuntas</span>
          </div>
        </div>

        {/* Card 2: Wallet Balance */}
        <div className={`clay-card p-5 flex flex-col justify-between transition-transform hover:-translate-y-1 ${
          darkMode ? 'bg-[#25201D]' : 'bg-[#FAF3EC]'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-inner border border-rose-500/30">
                <Heart className="w-6 h-6 fill-rose-500/30" />
              </div>
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                netBalance >= 0 
                  ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30' 
                  : 'bg-rose-500/15 text-rose-600 border-rose-500/30'
              }`}>
                {netBalance >= 0 ? '+Surplus' : '-Defisit'}
              </span>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A796E] dark:text-[#A8988D] block">
              Saldo Kas & Dompet
            </span>
            <div className="flex items-baseline space-x-1 mt-1 min-w-0">
              <h3 className={`text-xl sm:text-2xl font-black truncate ${darkMode ? 'text-white' : 'text-[#3E2F26]'}`}>
                Rp {netBalance > 0 ? (netBalance / 1000).toLocaleString('id-ID') : '0'}k
              </h3>
            </div>
          </div>
          <div className="pt-3 mt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[10px] text-[#8A796E] dark:text-[#A8988D] font-medium">
            <span>Masuk: Rp {(totalIncome / 1000000).toFixed(1)}jt</span>
            <span className="text-rose-500 font-semibold">Keluar: Rp {(totalExpense / 1000000).toFixed(1)}jt</span>
          </div>
        </div>

        {/* Card 3: Monthly Expense */}
        <div className={`clay-card p-5 flex flex-col justify-between transition-transform hover:-translate-y-1 ${
          darkMode ? 'bg-[#25201D]' : 'bg-[#FAF3EC]'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-inner border border-amber-500/30">
                <Timer className="w-6 h-6" />
              </div>
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                budgetUsedPercent > 80 
                  ? 'bg-rose-500/15 text-rose-600 border-rose-500/30' 
                  : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
              }`}>
                {budgetUsedPercent}% limit
              </span>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A796E] dark:text-[#A8988D] block">
              Pengeluaran Bulan Ini
            </span>
            <div className="flex items-baseline space-x-1 mt-1 min-w-0">
              <h3 className={`text-xl sm:text-2xl font-black truncate ${darkMode ? 'text-white' : 'text-[#3E2F26]'}`}>
                Rp {(totalExpense / 1000).toLocaleString('id-ID')}k
              </h3>
            </div>
          </div>
          <div className="pt-3 mt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[10px] text-[#8A796E] dark:text-[#A8988D] font-medium">
            <span>Batas Anggaran</span>
            <span className="font-bold text-[#5A453A] dark:text-[#C5B7AE]">Rp {(totalBudget / 1000000).toFixed(1)}jt</span>
          </div>
        </div>

        {/* Card 4: Focus Streak */}
        <div className={`clay-card p-5 flex flex-col justify-between transition-transform hover:-translate-y-1 ${
          darkMode ? 'bg-[#25201D]' : 'bg-[#FAF3EC]'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner border border-blue-500/30">
                <Flame className="w-6 h-6 fill-blue-500/30" />
              </div>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                Level 4 Pro
              </span>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A796E] dark:text-[#A8988D] block">
              Streak Produktivitas
            </span>
            <div className="flex items-baseline space-x-2 mt-1">
              <h3 className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-[#3E2F26]'}`}>
                7 <span className="text-sm font-bold text-[#8A796E] dark:text-[#A8988D]">Hari Berturut</span>
              </h3>
            </div>
          </div>
          <div className="pt-3 mt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[10px] text-[#8A796E] dark:text-[#A8988D] font-medium">
            <span>🔥 Konsistensi tinggi</span>
            <span className="font-bold text-orange-500">Pertahankan!</span>
          </div>
        </div>

      </section>

      {/* 3. MIDDLE ROW: BALANCED 3D CLAY CHARTS & BREAKDOWN */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left: 3D Rounded Weekly Activity Bar Chart (7 Cols) */}
        <div className={`lg:col-span-7 clay-card p-5 sm:p-6 flex flex-col justify-between ${
          darkMode ? 'bg-[#25201D]' : 'bg-[#FAF3EC]'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className={`text-base font-extrabold ${darkMode ? 'text-white' : 'text-[#3E2F26]'}`}>
                  Aktivitas & Fokus Mingguan
                </h3>
                <p className="text-xs text-[#8A796E] dark:text-[#A8988D] mt-0.5 font-medium">
                  Tugas yang diselesaikan dalam 7 hari terakhir
                </p>
              </div>
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#EAE0D5] dark:bg-[#332C28] text-[#5A453A] dark:text-[#C5B7AE] border border-white/20">
                7 Hari Terakhir
              </span>
            </div>

            {/* Info hover banner */}
            <div className="h-6 flex items-center justify-end px-1">
              {hoveredBarIndex !== null ? (
                <span className="text-xs font-extrabold text-orange-600 dark:text-orange-400 bg-orange-500/10 px-2.5 py-0.5 rounded-full border border-orange-500/20">
                  {weeklyActivity[hoveredBarIndex].day} ({weeklyActivity[hoveredBarIndex].dateLabel}): {weeklyActivity[hoveredBarIndex].value} tugas
                </span>
              ) : (
                <span className="text-[11px] text-[#8A796E] dark:text-[#A8988D] font-medium">
                  Arahkan kursor ke bar untuk detail harian
                </span>
              )}
            </div>

            {/* 3D Bar Chart Visual */}
            <div className="h-44 flex items-end justify-between px-2 pt-2 pb-1 gap-2 sm:gap-3">
              {weeklyActivity.map((item, idx) => (
                <div 
                  key={item.day} 
                  className="flex flex-col items-center flex-1 group cursor-pointer"
                  onMouseEnter={() => setHoveredBarIndex(idx)}
                  onMouseLeave={() => setHoveredBarIndex(null)}
                >
                  {/* 3D Clay Pill Bar */}
                  <div className="w-full max-w-[36px] bg-[#E8DDD2] dark:bg-[#322A26] rounded-full h-32 flex items-end p-1 shadow-inner relative overflow-hidden">
                    <div 
                      style={{ height: item.height }}
                      className={`w-full rounded-full bg-gradient-to-t ${item.color} shadow-md transition-all duration-300 group-hover:brightness-110 relative`}
                    >
                      <div className="absolute top-1 left-1 right-1 h-2 bg-white/40 rounded-full"></div>
                    </div>
                  </div>

                  {/* Day label */}
                  <span className={`text-[11px] font-bold mt-2.5 transition-colors ${
                    hoveredBarIndex === idx 
                      ? 'text-orange-600 dark:text-orange-400 font-black' 
                      : item.isToday 
                      ? 'text-orange-500 font-extrabold'
                      : 'text-[#8A796E] dark:text-[#A8988D]'
                  }`}>
                    {item.day}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs text-[#8A796E] dark:text-[#A8988D]">
            <span>Total minggu ini: <strong className="text-[#3E2F26] dark:text-white">{weeklyActivity.reduce((s, a) => s + a.value, 0)} tugas</strong></span>
            <button
              onClick={() => onNavigateTab('analytics')}
              className="text-orange-600 dark:text-orange-400 font-bold hover:underline flex items-center space-x-1"
            >
              <span>Lihat Detail Statistik</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Category Breakdown Donut / Pie Chart (5 Cols) */}
        <div className={`lg:col-span-5 clay-card p-5 sm:p-6 flex flex-col justify-between ${
          darkMode ? 'bg-[#25201D]' : 'bg-[#FAF3EC]'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className={`text-base font-extrabold ${darkMode ? 'text-white' : 'text-[#3E2F26]'}`}>
                  Distribusi Kategori
                </h3>
                <p className="text-xs text-[#8A796E] dark:text-[#A8988D] mt-0.5 font-medium">
                  Alokasi fokus waktu & tugas
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-1">
              
              {/* Donut Chart representation */}
              <div className="relative w-32 h-32 flex items-center justify-center flex-shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  {/* Base Circle */}
                  <path
                    className="text-[#E8DDD2] dark:text-[#322A26]"
                    strokeWidth="5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Segment 1: Pekerjaan (45%) */}
                  <path
                    stroke="#E67E51"
                    strokeWidth="5.5"
                    strokeDasharray="45, 100"
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Segment 2: Belanja (25%) */}
                  <path
                    stroke="#F2A365"
                    strokeWidth="5.5"
                    strokeDashoffset="-45"
                    strokeDasharray="25, 100"
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Segment 3: Tagihan (18%) */}
                  <path
                    stroke="#68B0AB"
                    strokeWidth="5.5"
                    strokeDashoffset="-70"
                    strokeDasharray="18, 100"
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Segment 4: Investasi (12%) */}
                  <path
                    stroke="#8E9AAF"
                    strokeWidth="5.5"
                    strokeDashoffset="-88"
                    strokeDasharray="12, 100"
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-lg font-black leading-tight text-[#E67E51]">
                    {dynamicDist[0]?.percent || 45}%
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#8A796E] dark:text-[#A8988D]">
                    Fokus
                  </span>
                </div>
              </div>

              {/* Legend Breakdown */}
              <div className="flex-1 space-y-2 w-full">
                {dynamicDist.map((cat) => (
                  <div key={cat.label} className="flex items-center justify-between text-xs p-1.5 rounded-xl bg-white/40 dark:bg-black/20">
                    <div className="flex items-center space-x-2 min-w-0">
                      <span 
                        className="w-3 h-3 rounded-full shadow-xs flex-shrink-0" 
                        style={{ backgroundColor: cat.color }}
                      ></span>
                      <span className="font-bold text-[#5A453A] dark:text-[#C5B7AE] truncate">{cat.label}</span>
                    </div>
                    <span className="font-black text-[#3E2F26] dark:text-white flex-shrink-0 ml-2">{cat.percent}%</span>
                  </div>
                ))}
              </div>

            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs text-[#8A796E] dark:text-[#A8988D]">
            <span>{dynamicDist.length} kategori aktif</span>
            <button
              onClick={() => onNavigateTab('tasks')}
              className="text-orange-600 dark:text-orange-400 font-bold hover:underline flex items-center space-x-1"
            >
              <span>Kelola Kategori</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </section>

      {/* 4. BOTTOM ROW: SYMMETRICAL RECENT TASKS & RECENT TRANSACTIONS */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        {/* Left: Recently Planned Tasks */}
        <div className={`clay-card p-5 sm:p-6 flex flex-col justify-between ${
          darkMode ? 'bg-[#25201D]' : 'bg-[#FAF3EC]'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h3 className={`text-base font-extrabold ${darkMode ? 'text-white' : 'text-[#3E2F26]'}`}>
                  Tugas Prioritas Hari Ini
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('tasks')}
                className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center space-x-1"
              >
                <span>Lihat Semua</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {tasks.length > 0 ? (
                tasks.slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onToggleTaskComplete(task.id)}
                    className={`p-3 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
                      task.completed
                        ? darkMode
                          ? 'bg-[#1E1917]/50 border-white/5 opacity-60'
                          : 'bg-[#F2E8DF]/60 border-black/5 opacity-60'
                        : darkMode
                        ? 'bg-[#2E2824] border-white/10 hover:border-orange-500/40 shadow-sm'
                        : 'bg-white border-white hover:border-orange-300 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleTaskComplete(task.id);
                        }}
                        className="p-1 text-orange-600 focus:outline-none flex-shrink-0"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                        ) : (
                          <Circle className="w-5 h-5 text-[#A8988D]" />
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <h4 className={`text-xs sm:text-sm font-bold truncate ${
                          task.completed ? 'line-through text-[#8A796E]' : darkMode ? 'text-zinc-100' : 'text-[#3E2F26]'
                        }`}>
                          {task.title}
                        </h4>
                        <div className="flex items-center space-x-2 mt-0.5 text-[11px] text-[#8A796E] dark:text-[#A8988D]">
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1 text-orange-500" />
                            {new Date(task.dueDate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span>•</span>
                          <span className="capitalize font-semibold">{task.priority}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      title="Dengarkan Pengingat Suara"
                      onClick={(e) => handleSpeakSingleTask(task, e)}
                      className="p-2 rounded-xl bg-[#FAF3EC] dark:bg-[#3A322D] hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-white/30 transition ml-2 flex-shrink-0"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center rounded-2xl bg-white/40 dark:bg-black/20 text-xs text-[#8A796E] dark:text-[#A8988D]">
                  Belum ada tugas hari ini. Klik tombol di bawah untuk menambahkan!
                </div>
              )}
            </div>
          </div>

          {/* Symmetrical Footer Action */}
          <div className="pt-3 mt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
            <span className="text-xs text-[#8A796E] dark:text-[#A8988D] font-medium">
              {pendingCount} tugas tersisa
            </span>
            <button
              onClick={onOpenNewTaskModal}
              className="clay-button-primary px-4 py-2 rounded-full text-xs font-bold shadow-md transition active:scale-95 flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Tugas</span>
            </button>
          </div>
        </div>

        {/* Right: Symmetrical Financial Transactions */}
        <div className={`clay-card p-5 sm:p-6 flex flex-col justify-between ${
          darkMode ? 'bg-[#25201D]' : 'bg-[#FAF3EC]'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
                <h3 className={`text-base font-extrabold ${darkMode ? 'text-white' : 'text-[#3E2F26]'}`}>
                  Transaksi & Kas Terkini
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('finance')}
                className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center space-x-1"
              >
                <span>Lihat Keuangan</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {transactions.length > 0 ? (
                transactions.slice(0, 4).map((tx) => (
                  <div
                    key={tx.id}
                    className={`p-3 rounded-2xl border flex items-center justify-between ${
                      darkMode ? 'bg-[#2E2824] border-white/10' : 'bg-white border-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center border flex-shrink-0 ${
                        tx.type === 'income'
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                      }`}>
                        {tx.type === 'income' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className={`text-xs sm:text-sm font-bold truncate ${darkMode ? 'text-zinc-100' : 'text-[#3E2F26]'}`}>
                          {tx.title}
                        </h4>
                        <span className="text-[10px] text-[#8A796E] dark:text-[#A8988D] capitalize font-medium block truncate">
                          {tx.date} • {tx.paymentMethod}
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 ml-2">
                      <span className={`text-xs sm:text-sm font-black ${
                        tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {tx.type === 'income' ? '+' : '-'} Rp {tx.amount.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center rounded-2xl bg-white/40 dark:bg-black/20 text-xs text-[#8A796E] dark:text-[#A8988D]">
                  Belum ada transaksi tercatat. Catat transaksi baru di bawah!
                </div>
              )}
            </div>
          </div>

          {/* Symmetrical Footer Action */}
          <div className="pt-3 mt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
            <span className="text-xs text-[#8A796E] dark:text-[#A8988D] font-medium">
              {transactions.length} catatan transaksi
            </span>
            <button
              onClick={onOpenNewTxModal}
              className="clay-button-emerald px-4 py-2 rounded-full text-xs font-bold shadow-md transition active:scale-95 flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Catat Transaksi</span>
            </button>
          </div>
        </div>

      </section>

      {/* 5. BOTTOM CLAY PILL BANNER */}
      <section className={`rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border transition ${
        darkMode 
          ? 'bg-gradient-to-r from-[#2B2724] to-[#241F1C] border-white/10 text-zinc-100' 
          : 'bg-gradient-to-r from-[#EBF4EC] to-[#E3EFE5] border-white text-[#2C4A34] shadow-[0_8px_20px_rgba(160,190,170,0.2)]'
      }`}>
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-inner flex-shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold">
              Tips Cerdas Produktivitas & Keuangan Harian ✨
            </h4>
            <p className="text-[11px] opacity-80 mt-0.5 leading-relaxed font-medium">
              Alokasikan minimal 20% pemasukan awal untuk tabungan darurat sebelum belanja barang konsumtif.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab('finance')}
          className="clay-button px-5 py-2.5 rounded-full text-xs font-extrabold text-emerald-700 dark:text-emerald-300 hover:scale-105 transition flex-shrink-0"
        >
          Kelola Anggaran
        </button>
      </section>

      {/* Character / Companion Customization Modal (GIF & Transparent Cutout) */}
      <CharacterCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        characterConfig={characterConfig}
        onSaveCharacterConfig={(newConfig) => {
          if (onSaveCharacterConfig) {
            onSaveCharacterConfig(newConfig);
          }
        }}
        darkMode={darkMode}
      />

    </div>
  );
};
