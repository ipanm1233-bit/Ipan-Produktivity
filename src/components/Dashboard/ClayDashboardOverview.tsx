import React, { useState } from 'react';
import { 
  Task, 
  Transaction, 
  TaskCategory, 
  FinanceCategory, 
  MonthlyBudgetConfig, 
  VoiceSettings 
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
  Tag, 
  Plus, 
  ArrowUpRight, 
  Sparkles, 
  Play, 
  Pause,
  Layers,
  Award,
  DollarSign,
  Briefcase,
  Music,
  Heart,
  Timer
} from 'lucide-react';
import { speakText, playChime } from '../../utils/audio';
import heroImg from '../../assets/images/male_hero_clay_1787560757332.jpg';

interface ClayDashboardOverviewProps {
  tasks: Task[];
  transactions: Transaction[];
  taskCategories: TaskCategory[];
  financeCategories: FinanceCategory[];
  budgetConfig: MonthlyBudgetConfig;
  voiceSettings: VoiceSettings;
  onToggleTaskComplete: (id: string) => void;
  onOpenNewTaskModal: () => void;
  onOpenNewTxModal: () => void;
  onNavigateTab: (tab: 'dashboard' | 'tasks' | 'calendar' | 'finance' | 'analytics') => void;
  darkMode: boolean;
}

export const ClayDashboardOverview: React.FC<ClayDashboardOverviewProps> = ({
  tasks,
  transactions,
  taskCategories,
  financeCategories,
  budgetConfig,
  voiceSettings,
  onToggleTaskComplete,
  onOpenNewTaskModal,
  onOpenNewTxModal,
  onNavigateTab,
  darkMode,
}) => {
  const [isPlayingBrief, setIsPlayingBrief] = useState(false);
  const [activeBarIndex, setActiveBarIndex] = useState<number | null>(null);

  // User details
  const userName = voiceSettings.userName || 'Ipan';

  // Task metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = tasks.filter(t => !t.completed);
  const pendingCount = pendingTasks.length;

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

  // Voice briefing trigger
  const handlePlayVoiceBriefing = async () => {
    if (isPlayingBrief) return;
    setIsPlayingBrief(true);
    playChime('success');

    const topTask = pendingTasks[0]?.title || 'semua tugasmu sudah beres';
    const briefText = `Selamat ${greetingTime.toLowerCase()}, ${userName}! Hari ini kamu memiliki ${pendingCount} tugas yang perlu diselesaikan. Tugas prioritas utamamu adalah ${topTask}. Sisa saldo dompetmu saat ini adalah Rp ${netBalance.toLocaleString('id-ID')}. Tetap semangat dan produktif hari ini!`;

    await speakText(briefText, voiceSettings);
    setIsPlayingBrief(false);
  };

  const handleSpeakSingleTask = async (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    playChime('reminder');
    const dueTime = new Date(task.dueDate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const text = `Tugas: ${task.title}. Batas waktu jam ${dueTime}.`;
    await speakText(text, voiceSettings);
  };

  // Weekly bar data
  const daysOfWeek = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  const weeklyActivity = [
    { day: 'Sen', value: 4, height: '65%', color: 'from-amber-400 to-orange-500' },
    { day: 'Sel', value: 6, height: '90%', color: 'from-orange-400 to-rose-500' },
    { day: 'Rab', value: 3, height: '50%', color: 'from-rose-400 to-pink-500' },
    { day: 'Kam', value: 5, height: '78%', color: 'from-emerald-400 to-teal-500' },
    { day: 'Jum', value: 4, height: '60%', color: 'from-teal-400 to-cyan-500' },
    { day: 'Sab', value: 7, height: '98%', color: 'from-cyan-400 to-blue-500' },
    { day: 'Min', value: 5, height: '75%', color: 'from-indigo-400 to-purple-500' },
  ];

  // Category distribution for pie / donut breakdown
  const categoryDist = [
    { label: 'Pekerjaan', percent: 45, color: '#E67E51' },
    { label: 'Belanja & Makan', percent: 25, color: '#F2A365' },
    { label: 'Tagihan Rutin', percent: 15, color: '#68B0AB' },
    { label: 'Investasi/Kas', percent: 10, color: '#8E9AAF' },
    { label: 'Lain-lain', percent: 5, color: '#CBC0D3' },
  ];

  return (
    <div className="space-y-6">
      
      {/* 3D HERO BANNER CARD (Soft Claymorphism & Male Character Scene) */}
      <section className={`relative rounded-[32px] overflow-hidden p-6 sm:p-8 transition-all ${
        darkMode 
          ? 'bg-gradient-to-r from-[#2C2420] via-[#241E1C] to-[#1E1917] border border-white/10 shadow-2xl' 
          : 'bg-gradient-to-r from-[#FDEFE3] via-[#FDF3EA] to-[#F7E6D7] border-2 border-white/80 shadow-[0_12px_32px_rgba(195,160,135,0.22)]'
      }`}>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
          
          {/* Left: 3D Illustration / Character Graphic */}
          <div className="relative w-full max-w-[280px] sm:max-w-[340px] aspect-video lg:aspect-4/3 rounded-2xl overflow-hidden border-2 border-white/90 shadow-[0_8px_24px_rgba(0,0,0,0.12)] flex-shrink-0 group">
            <img
              src={heroImg}
              alt="Male productivity workspace 3D illustration"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
            <span className="absolute bottom-2.5 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold tracking-wider uppercase border border-white/20">
              Personal Workspace 3D
            </span>
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

            {/* 3D Clay Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={handlePlayVoiceBriefing}
                disabled={isPlayingBrief}
                className="clay-button-primary px-5 py-3 rounded-full text-xs font-bold flex items-center space-x-2 shadow-lg transition"
              >
                <Play className={`w-4 h-4 fill-white ${isPlayingBrief ? 'animate-spin' : ''}`} />
                <span>{isPlayingBrief ? 'Memutar Suara AI...' : 'Dengarkan Briefing Suara'}</span>
              </button>

              <button
                onClick={onOpenNewTaskModal}
                className={`clay-button px-5 py-3 rounded-full text-xs font-bold flex items-center space-x-2 transition ${
                  darkMode ? 'text-zinc-200' : 'text-[#5A453A]'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Tugas Baru</span>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 4 STAT CARDS (3D Claymorphic Bento Metrics) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Card 1: Tasks Done */}
        <div className={`clay-card p-5 transition-transform hover:-translate-y-1 ${
          darkMode ? 'bg-[#25201D]' : 'bg-[#FAF3EC]'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner border border-emerald-500/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              +18% minggu ini
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
          <p className="text-[10px] text-[#8A796E] dark:text-[#A8988D] mt-1 font-medium">
            {pendingCount} tugas tersisa
          </p>
        </div>

        {/* Card 2: Wallet Balance */}
        <div className={`clay-card p-5 transition-transform hover:-translate-y-1 ${
          darkMode ? 'bg-[#25201D]' : 'bg-[#FAF3EC]'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-inner border border-rose-500/30">
              <Heart className="w-6 h-6 fill-rose-500/30" />
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
              +8% hemat
            </span>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A796E] dark:text-[#A8988D] block">
            Saldo Kas & Dompet
          </span>
          <div className="flex items-baseline space-x-1 mt-1">
            <h3 className={`text-xl sm:text-2xl font-black ${darkMode ? 'text-white' : 'text-[#3E2F26]'}`}>
              Rp {netBalance > 0 ? (netBalance / 1000).toLocaleString('id-ID') : '0'}k
            </h3>
          </div>
          <p className="text-[10px] text-[#8A796E] dark:text-[#A8988D] mt-1 font-medium">
            Total Kas Masuk Rp {(totalIncome / 1000000).toFixed(1)}jt
          </p>
        </div>

        {/* Card 3: Monthly Expense */}
        <div className={`clay-card p-5 transition-transform hover:-translate-y-1 ${
          darkMode ? 'bg-[#25201D]' : 'bg-[#FAF3EC]'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-inner border border-amber-500/30">
              <Timer className="w-6 h-6" />
            </div>
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
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
          <div className="flex items-baseline space-x-1 mt-1">
            <h3 className={`text-xl sm:text-2xl font-black ${darkMode ? 'text-white' : 'text-[#3E2F26]'}`}>
              Rp {(totalExpense / 1000).toLocaleString('id-ID')}k
            </h3>
          </div>
          <p className="text-[10px] text-[#8A796E] dark:text-[#A8988D] mt-1 font-medium">
            Batas Anggaran Rp {(totalBudget / 1000000).toFixed(1)}jt
          </p>
        </div>

        {/* Card 4: Focus Streak */}
        <div className={`clay-card p-5 transition-transform hover:-translate-y-1 ${
          darkMode ? 'bg-[#25201D]' : 'bg-[#FAF3EC]'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner border border-blue-500/30">
              <Flame className="w-6 h-6 fill-blue-500/30" />
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
              Level 4 Pro
            </span>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A796E] dark:text-[#A8988D] block">
            Streak Produktivitas
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <h3 className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-[#3E2F26]'}`}>
              7 <span className="text-sm font-bold text-[#8A796E] dark:text-[#A8988D]">Hari Berturut-turut</span>
            </h3>
          </div>
          <p className="text-[10px] text-[#8A796E] dark:text-[#A8988D] mt-1 font-medium">
            🔥 Pertahankan ritme kerjamu!
          </p>
        </div>

      </section>

      {/* MIDDLE ROW: 3D CLAY CHARTS & BREAKDOWN */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: 3D Rounded Weekly Activity Bar Chart (7 Cols) */}
        <div className={`lg:col-span-7 clay-card p-6 ${
          darkMode ? 'bg-[#25201D]' : 'bg-[#FAF3EC]'
        }`}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className={`text-base font-extrabold ${darkMode ? 'text-white' : 'text-[#3E2F26]'}`}>
                Aktivitas & Fokus Mingguan
              </h3>
              <p className="text-xs text-[#8A796E] dark:text-[#A8988D] mt-0.5 font-medium">
                Penyelesaian tugas harian dalam 7 hari terakhir
              </p>
            </div>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#EAE0D5] dark:bg-[#332C28] text-[#5A453A] dark:text-[#C5B7AE] border border-white/20">
              Minggu Ini ▾
            </span>
          </div>

          {/* 3D Bar Chart Visual */}
          <div className="h-44 flex items-end justify-between px-2 pt-4 pb-1">
            {weeklyActivity.map((item, idx) => (
              <div 
                key={item.day} 
                className="flex flex-col items-center flex-1 group cursor-pointer"
                onMouseEnter={() => setActiveBarIndex(idx)}
                onMouseLeave={() => setActiveBarIndex(null)}
              >
                {/* Tooltip on hover */}
                <div className={`text-[10px] font-bold px-2 py-0.5 rounded-md mb-2 transition-all ${
                  activeBarIndex === idx 
                    ? 'bg-[#3E2F26] text-white opacity-100 scale-100' 
                    : 'opacity-0 scale-95 pointer-events-none'
                }`}>
                  {item.value} tugas
                </div>

                {/* 3D Clay Pill Bar */}
                <div className="w-7 sm:w-9 bg-[#E8DDD2] dark:bg-[#322A26] rounded-full h-32 flex items-end p-1 shadow-inner relative overflow-hidden">
                  <div 
                    style={{ height: item.height }}
                    className={`w-full rounded-full bg-gradient-to-t ${item.color} shadow-md transition-all duration-500 group-hover:brightness-110 relative`}
                  >
                    <div className="absolute top-1 left-1 right-1 h-2 bg-white/40 rounded-full"></div>
                  </div>
                </div>

                {/* Day label */}
                <span className={`text-[11px] font-bold mt-2.5 ${
                  activeBarIndex === idx ? 'text-orange-600 dark:text-orange-400' : 'text-[#8A796E] dark:text-[#A8988D]'
                }`}>
                  {item.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Category Breakdown Donut / Pie Chart (5 Cols) */}
        <div className={`lg:col-span-5 clay-card p-6 ${
          darkMode ? 'bg-[#25201D]' : 'bg-[#FAF3EC]'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`text-base font-extrabold ${darkMode ? 'text-white' : 'text-[#3E2F26]'}`}>
                Distribusi Kategori
              </h3>
              <p className="text-xs text-[#8A796E] dark:text-[#A8988D] mt-0.5 font-medium">
                Alokasi fokus waktu & pengeluaran
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-2">
            
            {/* Donut Chart representation */}
            <div className="relative w-32 h-32 flex items-center justify-center flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                {/* Segment 1: Pekerjaan (45%) */}
                <path
                  className="text-[#E67E51] transition-all"
                  strokeWidth="6"
                  strokeDasharray="45, 100"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Segment 2: Belanja (25%) */}
                <path
                  className="text-[#F2A365] transition-all"
                  strokeWidth="6"
                  strokeDashoffset="-45"
                  strokeDasharray="25, 100"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Segment 3: Tagihan (15%) */}
                <path
                  className="text-[#68B0AB] transition-all"
                  strokeWidth="6"
                  strokeDashoffset="-70"
                  strokeDasharray="15, 100"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Segment 4: Investasi (10%) */}
                <path
                  className="text-[#8E9AAF] transition-all"
                  strokeWidth="6"
                  strokeDashoffset="-85"
                  strokeDasharray="10, 100"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-lg font-black leading-tight text-[#E67E51]">45%</span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#8A796E] dark:text-[#A8988D]">
                  Utama
                </span>
              </div>
            </div>

            {/* Legend Breakdown */}
            <div className="flex-1 space-y-2 w-full">
              {categoryDist.map((cat) => (
                <div key={cat.label} className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span 
                      className="w-3 h-3 rounded-full shadow-xs" 
                      style={{ backgroundColor: cat.color }}
                    ></span>
                    <span className="font-bold text-[#5A453A] dark:text-[#C5B7AE]">{cat.label}</span>
                  </div>
                  <span className="font-extrabold text-[#3E2F26] dark:text-white">{cat.percent}%</span>
                </div>
              ))}
            </div>

          </div>
        </div>

      </section>

      {/* BOTTOM ROW: RECENT TASKS & FINANCIAL DAILY MIX */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Recently Planned Tasks with Audio Button */}
        <div className={`clay-card p-6 ${
          darkMode ? 'bg-[#25201D]' : 'bg-[#FAF3EC]'
        }`}>
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
            {tasks.slice(0, 4).map((task) => (
              <div
                key={task.id}
                onClick={() => onToggleTaskComplete(task.id)}
                className={`p-3.5 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
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
                    className="p-1 text-orange-600 focus:outline-none"
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
            ))}
          </div>
        </div>

        {/* Right: Financial Transactions & Daily Mix */}
        <div className={`clay-card p-6 ${
          darkMode ? 'bg-[#25201D]' : 'bg-[#FAF3EC]'
        }`}>
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
            {transactions.slice(0, 4).map((tx) => (
              <div
                key={tx.id}
                className={`p-3 rounded-2xl border flex items-center justify-between ${
                  darkMode ? 'bg-[#2E2824] border-white/10' : 'bg-white border-white'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                    tx.type === 'income'
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                  }`}>
                    {tx.type === 'income' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <h4 className={`text-xs sm:text-sm font-bold truncate ${darkMode ? 'text-zinc-100' : 'text-[#3E2F26]'}`}>
                      {tx.title}
                    </h4>
                    <span className="text-[10px] text-[#8A796E] dark:text-[#A8988D] capitalize font-medium">
                      {tx.date} • {tx.paymentMethod}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-xs sm:text-sm font-black ${
                    tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {tx.type === 'income' ? '+' : '-'} Rp {tx.amount.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Add Buttons */}
          <div className="pt-3 mt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-end space-x-2">
            <button
              onClick={onOpenNewTxModal}
              className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Catat Transaksi</span>
            </button>
          </div>
        </div>

      </section>

      {/* BOTTOM CLAY PILL BANNER (Music & Productivity Tips AI) */}
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

    </div>
  );
};
