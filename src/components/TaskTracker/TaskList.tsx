import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Calendar as CalendarIcon, 
  Search, 
  Filter, 
  Plus, 
  Volume2, 
  ExternalLink, 
  Download, 
  Edit3, 
  Trash2, 
  Flame, 
  AlertTriangle, 
  CheckSquare, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  Zap,
  Target,
  ArrowUpRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Task, TaskCategory, PriorityLevel, VoiceSettings } from '../../types';
import { playChime, speakText, generateTaskVoicePrompt } from '../../utils/audio';
import { getGoogleCalendarUrl, downloadIcsCalendar } from '../../utils/calendar';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (task: Task) => void;
  onOpenNewTaskModal: () => void;
  categories: TaskCategory[];
  voiceSettings: VoiceSettings;
  darkMode: boolean;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onToggleComplete,
  onDeleteTask,
  onEditTask,
  onOpenNewTaskModal,
  categories,
  voiceSettings,
  darkMode,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'today' | 'overdue' | 'urgent' | 'completed'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedTaskIds, setExpandedTaskIds] = useState<Record<string, boolean>>({});

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  // Statistics calculation
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const todayTasks = tasks.filter((t) => t.dueDate && t.dueDate.slice(0, 10) === todayStr);
  const todayCompleted = todayTasks.filter((t) => t.completed).length;
  const overdueTasks = tasks.filter((t) => !t.completed && t.dueDate && new Date(t.dueDate) < now);
  const urgentTasks = tasks.filter((t) => !t.completed && t.priority === 'urgent');

  // Streak calculation (mocked/active)
  const streakDays = completedTasks > 0 ? 5 : 1;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const toggleSubtaskExpand = (taskId: string) => {
    setExpandedTaskIds((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const handleCheckboxClick = (task: Task) => {
    if (!task.completed) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#2563eb', '#3b82f6', '#10b981', '#f59e0b'],
        });
      } catch (e) {
        // ignore if not supported
      }
      playChime('success');
    } else {
      playChime('pop');
    }
    onToggleComplete(task.id);
  };

  const handleSpeakTask = (task: Task) => {
    const text = generateTaskVoicePrompt(task, voiceSettings);
    speakText(text, voiceSettings);
  };

  const handleSpeakDailyBriefing = () => {
    const name = voiceSettings.userName || 'Sahabat';
    const pendingCount = todayTasks.length - todayCompleted;
    let briefing = `Halo ${name}. Hari ini kamu memiliki ${todayTasks.length} target tugas, dengan ${pendingCount} tugas yang masih perlu diselesaikan. `;
    if (overdueTasks.length > 0) {
      briefing += `Perhatian: Ada ${overdueTasks.length} tugas yang telah melewati tenggat waktu. `;
    }
    if (voiceSettings.style === 'motivational') {
      briefing += `Ayo fokus dan selesaikan satu per satu. Kamu pasti bisa melewati hari ini dengan produktif!`;
    } else {
      briefing += `Tetap fokus dan selesaikan tugas prioritas utamamu.`;
    }
    speakText(briefing, voiceSettings);
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }

    if (selectedCategory !== 'all' && t.category !== selectedCategory) {
      return false;
    }

    if (selectedFilter === 'completed') return t.completed;
    if (selectedFilter === 'today') {
      return t.dueDate && t.dueDate.slice(0, 10) === todayStr;
    }
    if (selectedFilter === 'overdue') {
      return !t.completed && t.dueDate && new Date(t.dueDate) < now;
    }
    if (selectedFilter === 'urgent') {
      return !t.completed && t.priority === 'urgent';
    }

    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const aDate = new Date(a.dueDate).getTime();
    const bDate = new Date(b.dueDate).getTime();
    return aDate - bDate;
  });

  const getPriorityBadge = (p: PriorityLevel) => {
    switch (p) {
      case 'urgent':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#FFEBEB] dark:bg-[#3D1A1E] text-[#E11D48] border border-rose-200/80 dark:border-rose-900/40 shadow-[1px_2px_4px_rgba(225,29,72,0.15)]">
            🚨 Urgent
          </span>
        );
      case 'high':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#FFF6E5] dark:bg-[#382613] text-[#D97706] border border-amber-200/80 dark:border-amber-900/40 shadow-[1px_2px_4px_rgba(217,119,6,0.15)]">
            Tinggi
          </span>
        );
      case 'medium':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#EEF4FF] dark:bg-[#152544] text-[#2563EB] border border-blue-200/80 dark:border-blue-900/40 shadow-[1px_2px_4px_rgba(37,99,235,0.15)]">
            Sedang
          </span>
        );
      case 'low':
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#EAFBF3] dark:bg-[#123023] text-[#059669] border border-emerald-200/80 dark:border-emerald-900/40 shadow-[1px_2px_4px_rgba(5,150,105,0.15)]">
            Rendah
          </span>
        );
    }
  };

  const getCategoryInfo = (catId: string) => {
    return categories.find((c) => c.id === catId) || { name: catId, color: '#3b82f6' };
  };

  const formatDueDateLabel = (dueDateStr: string, isCompleted: boolean) => {
    if (!dueDateStr) return null;
    const due = new Date(dueDateStr);
    const diffMs = due.getTime() - now.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const isToday = due.toDateString() === now.toDateString();
    const timeStr = due.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    if (isCompleted) {
      return (
        <span className="text-[#8A796E] dark:text-[#A8988D] flex items-center space-x-1.5 font-medium">
          <CalendarIcon className="w-3.5 h-3.5" />
          <span>{due.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} {timeStr}</span>
        </span>
      );
    }

    if (diffMs < 0) {
      const overdueHours = Math.abs(Math.floor(diffMinutes / 60));
      return (
        <span className="text-rose-500 font-bold flex items-center space-x-1.5">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Terlewat ({overdueHours > 24 ? `${Math.floor(overdueHours / 24)} hari lalu` : `${Math.abs(diffMinutes)} mnt lalu`})</span>
        </span>
      );
    }

    if (isToday) {
      if (diffMinutes <= 60) {
        return (
          <span className="text-amber-600 font-bold flex items-center space-x-1.5 animate-pulse">
            <Clock className="w-3.5 h-3.5" />
            <span>Hari ini {timeStr} ({diffMinutes} mnt lagi!)</span>
          </span>
        );
      }
      return (
        <span className="text-blue-600 font-semibold flex items-center space-x-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>Hari ini {timeStr}</span>
        </span>
      );
    }

    return (
      <span className="text-[#8A796E] dark:text-[#A8988D] flex items-center space-x-1.5 font-medium">
        <CalendarIcon className="w-3.5 h-3.5" />
        <span>{due.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })} {timeStr}</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* 3D Clay Bento Grid Header & Statistics (Symmetrical & Adaptive Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-12 gap-3.5 sm:gap-4">
        
        {/* Bento Card 1: Today's Focus (Col span 4 on XL) */}
        <div className="xl:col-span-4 p-4.5 sm:p-5 clay-card flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-orange-600 dark:text-orange-400 flex items-center space-x-1.5">
              <Target className="w-4 h-4" />
              <span>Target Hari Ini</span>
            </span>
            <span className="clay-badge text-[10px] px-2 py-0.5 font-extrabold text-[#7D6B5E] dark:text-[#C5B7AD]">
              {todayStr}
            </span>
          </div>

          <div className="my-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#3E2F26] dark:text-[#FAF4EE]">{todayCompleted}</span>
              <span className="text-lg sm:text-xl font-bold text-[#A8988D]">/ {todayTasks.length}</span>
              <span className="text-xs font-bold text-[#8A796E] dark:text-[#BDB0A4] ml-1">tugas selesai</span>
            </div>
            <p className="text-xs text-[#8A796E] dark:text-[#BDB0A4] mt-1 leading-relaxed">
              {todayTasks.length === 0 
                ? 'Belum ada agenda tugas untuk hari ini.' 
                : todayCompleted === todayTasks.length 
                ? '🎉 Luar biasa! Semua target hari ini terselesaikan!' 
                : `Masih ada ${todayTasks.length - todayCompleted} tugas prioritas perlu dituntaskan.`}
            </p>
          </div>

          <div className="space-y-1.5 mt-2">
            <div className="w-full bg-[#EADCCF] dark:bg-[#2F2925] h-2.5 rounded-full overflow-hidden shadow-inner">
              <div 
                className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full transition-all duration-500 shadow-md" 
                style={{ width: `${todayTasks.length ? (todayCompleted / todayTasks.length) * 100 : 0}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-bold text-[#8A796E] dark:text-[#A8988D]">
              <span>Progres Harian</span>
              <span>{todayTasks.length ? Math.round((todayCompleted / todayTasks.length) * 100) : 0}%</span>
            </div>
          </div>
        </div>

        {/* Bento Card 2: Voice AI Companion Briefing (Col span 5 on XL) */}
        <div className="xl:col-span-5 p-4.5 sm:p-5 clay-card flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-[#FAF3EC] via-[#F4E8DC] to-[#F1DFC9] dark:from-[#211D1A] dark:via-[#26201B] dark:to-[#2B211A]">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-orange-600 dark:text-orange-400 flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Pengingat Suara Personal</span>
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider shadow-sm ${
                voiceSettings.enabled 
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' 
                  : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700'
              }`}>
                {voiceSettings.enabled ? 'Suara Aktif' : 'Muted'}
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-extrabold mb-1 text-[#3E2F26] dark:text-[#FAF4EE]">
              Halo, <span className="text-orange-600 dark:text-orange-400">{voiceSettings.userName || 'Ipan'}</span>! 👋
            </h3>
            <p className="text-xs text-[#8A796E] dark:text-[#BDB0A4] leading-relaxed line-clamp-2">
              {voiceSettings.style === 'motivational' && '🔥 Siap taklukkan target hari ini? Klik untuk dengarkan ringkasan audio!'}
              {voiceSettings.style === 'formal' && '📋 Sistem siap membacakan ringkasan jadwal dan tenggat waktu terkini Anda.'}
              {voiceSettings.style === 'casual' && '☕ Yuk santai tapi produktif! Tekan audio untuk mendengarkan agenda.'}
              {voiceSettings.style === 'concise' && '⚡ Pengingat instan siap dibacakan langsung ke telingamu.'}
            </p>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#E8DACB] dark:border-white/10 flex items-center justify-between gap-2">
            <button
              onClick={handleSpeakDailyBriefing}
              className="clay-button-primary flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold active:scale-95 transition"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Dengarkan Ringkasan</span>
            </button>
            <span className="text-[10px] text-[#8A796E] dark:text-[#A8988D] font-bold capitalize">
              Gaya: {voiceSettings.style || 'Motivasi'}
            </span>
          </div>
        </div>

        {/* Bento Card 3: Key Metrics Quick Stack (Col span 3 on XL, or 2 cols on mobile/tablet) */}
        <div className="sm:col-span-2 xl:col-span-3 grid grid-cols-2 xl:grid-cols-1 gap-3.5">
          
          {/* Completion Rate Pill */}
          <div className="p-3.5 sm:p-4 clay-card-sm flex items-center justify-between">
            <div className="min-w-0">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8A796E] dark:text-[#A8988D] block">Total Selesai</span>
              <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">{completionRate}%</div>
              <span className="text-[10px] sm:text-[11px] font-bold text-[#8A796E] dark:text-[#A8988D] truncate block">{completedTasks} dari {totalTasks} tugas</span>
            </div>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800 shadow-inner flex-shrink-0 ml-1.5">
              <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>

          {/* Attention / Streak Pill */}
          <div className={`p-3.5 sm:p-4 clay-card-sm flex items-center justify-between ${
            overdueTasks.length > 0 ? 'bg-[#FFF2F2] dark:bg-[#2C191C]' : ''
          }`}>
            <div className="min-w-0">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8A796E] dark:text-[#A8988D] block truncate">
                {overdueTasks.length > 0 ? 'Perlu Perhatian' : 'Fokus Streak'}
              </span>
              <div className={`text-xl sm:text-2xl font-extrabold mt-0.5 truncate ${overdueTasks.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`}>
                {overdueTasks.length > 0 ? `${overdueTasks.length} Terlewat` : `${streakDays} Hari 🔥`}
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold text-[#8A796E] dark:text-[#A8988D] truncate block">
                {overdueTasks.length > 0 ? `${urgentTasks.length} mendesak` : 'Fokus konsisten!'}
              </span>
            </div>
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center border shadow-inner flex-shrink-0 ml-1.5 ${
              overdueTasks.length > 0
                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                : 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800'
            }`}>
              {overdueTasks.length > 0 ? <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" /> : <Flame className="w-4 h-4 sm:w-5 sm:h-5" />}
            </div>
          </div>

        </div>

      </div>

      {/* Bento Controls Bar: Search, Category Filters, & Actions */}
      <div className="p-3.5 sm:p-5 clay-card w-full overflow-hidden">
        <div className="flex flex-col md:flex-row gap-2.5 sm:gap-3 items-stretch md:items-center justify-between">
          
          {/* 3D Inset Search Input */}
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A796E] dark:text-[#A8988D]" />
            <input
              id="search-tasks-input"
              type="text"
              placeholder="Cari tugas, subtugas, atau catatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 clay-input-pill text-xs sm:text-sm font-semibold text-[#3E2F26] dark:text-[#FAF4EE] placeholder-[#A8988D] focus:outline-none transition"
            />
          </div>

          {/* Category Filter & Actions (Mobile Responsive & Symmetric) */}
          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap sm:flex-nowrap">
            <div className="flex items-center space-x-1.5 flex-1 sm:flex-initial min-w-[130px]">
              <Filter className="w-4 h-4 text-[#8A796E] dark:text-[#A8988D] flex-shrink-0" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2.5 clay-button rounded-2xl text-xs sm:text-sm font-bold text-[#3E2F26] dark:text-[#FAF4EE] focus:outline-none cursor-pointer"
              >
                <option value="all">Semua Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Export All to iCal (.ICS) */}
            <button
              onClick={() => downloadIcsCalendar(tasks, 'semua-jadwal-tugas.ics')}
              title="Ekspor Seluruh Jadwal ke Format Kalender (.ICS)"
              className="clay-button p-2.5 rounded-2xl text-xs font-bold text-[#6B5A4E] dark:text-[#D4C7BC] flex items-center justify-center space-x-1.5 flex-shrink-0"
            >
              <Download className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <span className="hidden sm:inline">Ekspor .ICS</span>
            </button>

            {/* Add Task Primary CTA */}
            <button
              id="add-task-main-cta-btn"
              onClick={onOpenNewTaskModal}
              className="clay-button-primary flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold whitespace-nowrap min-w-[120px]"
            >
              <Plus className="w-4 h-4 flex-shrink-0" />
              <span>Tambah Tugas</span>
            </button>
          </div>
        </div>

        {/* 3D Filter Pills */}
        <div className="flex items-center space-x-2 mt-3.5 pt-3 border-t border-[#E8DACB] dark:border-white/10 overflow-x-auto pb-1 max-w-full">
          {[
            { id: 'all', label: 'Semua Tugas', count: totalTasks },
            { id: 'today', label: 'Hari Ini', count: todayTasks.length },
            { id: 'urgent', label: '🚨 Mendesak', count: urgentTasks.length },
            { id: 'overdue', label: 'Terlambat', count: overdueTasks.length },
            { id: 'completed', label: 'Selesai', count: completedTasks },
          ].map((tab) => {
            const isActive = selectedFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id as any)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold transition whitespace-nowrap flex items-center space-x-2 ${
                  isActive
                    ? 'clay-button-primary text-white'
                    : 'clay-button text-[#6B5A4E] dark:text-[#D4C7BC]'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                  isActive 
                    ? 'bg-white/30 text-white shadow-inner' 
                    : 'bg-[#EADCCF] dark:bg-[#38312B] text-[#6B5A4E] dark:text-[#D4C7BC]'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Task 3D Clay Cards List */}
      <div className="space-y-3.5">
        {sortedTasks.length === 0 ? (
          <div className="clay-card text-center py-16 px-4">
            <div className="w-14 h-14 rounded-3xl bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 mx-auto flex items-center justify-center mb-3 shadow-[3px_5px_12px_rgba(216,107,62,0.2)] border border-orange-200 dark:border-orange-800">
              <CheckSquare className="w-7 h-7" />
            </div>
            <h3 className="text-base font-extrabold text-[#3E2F26] dark:text-[#FAF4EE] mb-1">
              Tidak ada tugas yang ditemukan
            </h3>
            <p className="text-xs max-w-sm mx-auto mb-5 text-[#8A796E] dark:text-[#BDB0A4] font-medium leading-relaxed">
              {searchQuery || selectedCategory !== 'all' || selectedFilter !== 'all'
                ? 'Coba ganti kata kunci pencarian atau filter kategori Anda.'
                : 'Mulai harimu dengan menambahkan tugas pertama untuk meningkatkan produktivitas.'}
            </p>
            <button
              onClick={onOpenNewTaskModal}
              className="clay-button-primary inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl text-xs font-extrabold"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Tugas Baru</span>
            </button>
          </div>
        ) : (
          sortedTasks.map((task) => {
            const cat = getCategoryInfo(task.category);
            const isExpanded = !!expandedTaskIds[task.id];
            const completedSubtasksCount = task.subtasks?.filter((s) => s.completed).length || 0;
            const totalSubtasksCount = task.subtasks?.length || 0;

            return (
              <div
                key={task.id}
                id={`task-card-${task.id}`}
                className={`clay-card p-5 transition-all duration-200 ${
                  task.completed ? 'opacity-70 bg-[#F4EAE0] dark:bg-[#1E1A17]' : ''
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  
                  {/* Left: 3D Checkbox & Content */}
                  <div className="flex items-start space-x-3 sm:space-x-3.5 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleCheckboxClick(task)}
                      className="mt-0.5 text-zinc-400 hover:text-orange-500 transition flex-shrink-0"
                      title={task.completed ? 'Tandai belum selesai' : 'Tandai selesai'}
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500 filter drop-shadow-[0_2px_4px_rgba(16,185,129,0.3)]" />
                      ) : (
                        <Circle className="w-5 h-5 sm:w-6 sm:h-6 text-[#A8988D] hover:text-orange-500 transition" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      
                      {/* Title, Category & Priority Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5">
                        <h4 className={`text-sm sm:text-base font-extrabold leading-snug break-words ${
                          task.completed ? 'line-through text-[#8A796E]' : 'text-[#3E2F26] dark:text-[#FAF4EE]'
                        }`}>
                          {task.title}
                        </h4>
                        {getPriorityBadge(task.priority)}
                        <span 
                          className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider border shadow-sm whitespace-nowrap"
                          style={{ 
                            backgroundColor: `${cat.color}18`, 
                            borderColor: `${cat.color}40`, 
                            color: cat.color 
                          }}
                        >
                          {cat.name}
                        </span>
                      </div>

                      {/* Description */}
                      {task.description && (
                        <p className={`text-xs mb-2.5 line-clamp-2 leading-relaxed font-medium ${
                          task.completed ? 'text-[#8A796E]' : 'text-[#6B5A4E] dark:text-[#D4C7BC]'
                        }`}>
                          {task.description}
                        </p>
                      )}

                      {/* Due Date & Subtasks Info */}
                      <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1.5 text-xs font-semibold">
                        {formatDueDateLabel(task.dueDate, task.completed)}

                        {totalSubtasksCount > 0 && (
                          <button
                            type="button"
                            onClick={() => toggleSubtaskExpand(task.id)}
                            className="text-[#8A796E] dark:text-[#BDB0A4] hover:text-orange-600 flex items-center space-x-1 text-xs font-bold"
                          >
                            <span>Subtugas: {completedSubtasksCount}/{totalSubtasksCount}</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>

                      {/* Expanded Subtask List */}
                      {isExpanded && totalSubtasksCount > 0 && (
                        <div className="mt-3 p-3 sm:p-3.5 rounded-2xl bg-[#F0E4D7] dark:bg-[#1A1715] border border-white/60 dark:border-white/5 space-y-2 text-xs shadow-inner">
                          {task.subtasks.map((st) => (
                            <div key={st.id} className="flex items-center space-x-2.5">
                              <span className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full flex-shrink-0 ${st.completed ? 'bg-emerald-500' : 'bg-[#A8988D]'}`} />
                              <span className={`break-words ${st.completed ? 'line-through text-[#8A796E]' : 'text-[#3E2F26] dark:text-[#FAF4EE] font-bold'}`}>
                                {st.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                    </div>
                  </div>

                  {/* Right Actions Menu with 3D Clay Buttons */}
                  <div className="flex items-center justify-end space-x-1.5 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E8DACB] dark:border-white/5 w-full sm:w-auto">
                    
                    {/* Voice Reminder Audio Speaker Button */}
                    <button
                      type="button"
                      onClick={() => handleSpeakTask(task)}
                      title="Dengarkan Pengingat Suara untuk Tugas Ini"
                      className="clay-button p-2 rounded-xl text-orange-600 dark:text-orange-400"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>

                    {/* Google Calendar Direct Sync Button */}
                    <a
                      href={getGoogleCalendarUrl(task)}
                      target="_blank"
                      rel="noreferrer"
                      title="Sinkronkan / Tambah ke Google Calendar"
                      className="clay-button p-2 rounded-xl text-[#6B5A4E] dark:text-[#D4C7BC]"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    {/* Edit Task Button */}
                    <button
                      type="button"
                      onClick={() => onEditTask(task)}
                      title="Ubah Tugas"
                      className="clay-button p-2 rounded-xl text-amber-600 dark:text-amber-400"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Delete Task Button */}
                    <button
                      type="button"
                      onClick={() => onDeleteTask(task.id)}
                      title="Hapus Tugas"
                      className="clay-button p-2 rounded-xl text-rose-600 dark:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

