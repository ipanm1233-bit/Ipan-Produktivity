import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Download, 
  ExternalLink, 
  Clock, 
  CheckCircle2, 
  Circle, 
  CalendarDays,
  X,
  ArrowUpRight,
  ArrowDownRight,
  CheckSquare,
  DollarSign,
  CreditCard,
  Edit3,
  Trash2,
  Tag,
  Sparkles
} from 'lucide-react';
import { Task, TaskCategory, Transaction, FinanceCategory } from '../../types';
import { downloadIcsCalendar, getGoogleCalendarUrl } from '../../utils/calendar';

interface CalendarScheduleProps {
  tasks: Task[];
  taskCategories: TaskCategory[];
  transactions: Transaction[];
  financeCategories: FinanceCategory[];
  onOpenNewTaskModal: (defaultDate?: string) => void;
  onOpenNewTxModal: (defaultDate?: string) => void;
  onEditTask: (task: Task) => void;
  onToggleComplete: (id: string) => void;
  onEditTx?: (tx: Transaction) => void;
  onDeleteTx?: (id: string) => void;
  darkMode: boolean;
}

export const CalendarSchedule: React.FC<CalendarScheduleProps> = ({
  tasks,
  taskCategories,
  transactions,
  financeCategories,
  onOpenNewTaskModal,
  onOpenNewTxModal,
  onEditTask,
  onToggleComplete,
  onEditTx,
  onDeleteTx,
  darkMode,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'all' | 'tasks' | 'finance'>('all');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getTasksForDate = (dateStr: string) => {
    return tasks.filter((t) => t.dueDate && t.dueDate.startsWith(dateStr));
  };

  const getTransactionsForDate = (dateStr: string) => {
    return transactions.filter((tx) => tx.date && tx.date.startsWith(dateStr));
  };

  const handleDayClick = (dateStr: string) => {
    setSelectedDateStr(dateStr);
    setActiveModalTab('all');
    setIsDetailModalOpen(true);
  };

  const getTaskCategory = (catId: string) => {
    return taskCategories.find((c) => c.id === catId) || { name: 'Umum', color: '#f97316' };
  };

  const getFinanceCategory = (catId: string) => {
    return financeCategories.find((c) => c.id === catId) || { name: 'Lainnya', color: '#8A796E' };
  };

  const todayStr = new Date().toISOString().slice(0, 10);

  // Calendar cells generation
  const calendarCells: Array<{ day: number; isCurrentMonth: boolean; dateStr: string }> = [];

  // Previous month trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const prevM = month === 0 ? 12 : month;
    const prevY = month === 0 ? year - 1 : year;
    calendarCells.push({
      day: dayNum,
      isCurrentMonth: false,
      dateStr: `${prevY}-${String(prevM).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({
      day: d,
      isCurrentMonth: true,
      dateStr: dStr,
    });
  }

  // Next month leading days to complete grid symmetrically (35 or 42 cells)
  const remainingCells = 42 - calendarCells.length;
  const cellsToAdd = remainingCells >= 7 ? remainingCells - 7 : remainingCells;
  for (let d = 1; d <= cellsToAdd; d++) {
    const nextM = month + 2 > 12 ? 1 : month + 2;
    const nextY = month + 2 > 12 ? year + 1 : year;
    calendarCells.push({
      day: d,
      isCurrentMonth: false,
      dateStr: `${nextY}-${String(nextM).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
    });
  }

  // Selected date data for modal
  const selectedTasks = selectedDateStr ? getTasksForDate(selectedDateStr) : [];
  const selectedTxs = selectedDateStr ? getTransactionsForDate(selectedDateStr) : [];
  const selectedIncome = selectedTxs.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const selectedExpense = selectedTxs.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const completedTasksCount = selectedTasks.filter(t => t.completed).length;

  const formatShortRupiah = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1).replace('.0', '')}jt`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}rb`;
    return num.toString();
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30">Tinggi</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">Sedang</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30">Rendah</span>;
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      
      {/* Bento Calendar Header & Navigation Controls */}
      <div className="p-5 sm:p-7 clay-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 transition">
        <div className="flex items-center space-x-3.5 sm:space-x-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-200 dark:border-orange-800 shadow-inner flex-shrink-0">
            <CalendarIcon className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                Kalender & Jadwal Terpadu
              </span>
              <span className="text-[#8A796E]">•</span>
              <span className="text-[10px] text-[#8A796E] dark:text-[#BDB0A4] font-bold">{monthNames[month]} {year}</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-[#3E2F26] dark:text-[#FAF4EE] tracking-tight">
              {monthNames[month]} {year}
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 justify-end">
          {/* Month Stepper Buttons */}
          <div className="flex items-center space-x-1 p-1 rounded-2xl bg-[#E8DACB] dark:bg-[#1E1A17] shadow-inner">
            <button
              onClick={handlePrevMonth}
              className="clay-button p-2 rounded-xl text-[#5A453A] dark:text-[#D4C7BC]"
              title="Bulan Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="clay-button px-3 py-1.5 text-xs font-extrabold rounded-xl text-[#3E2F26] dark:text-[#FAF4EE]"
            >
              Hari Ini
            </button>
            <button
              onClick={handleNextMonth}
              className="clay-button p-2 rounded-xl text-[#5A453A] dark:text-[#D4C7BC]"
              title="Bulan Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Export to .ICS */}
          <button
            onClick={() => downloadIcsCalendar(tasks, `jadwal-${monthNames[month]}-${year}.ics`)}
            className="clay-button flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl text-xs font-extrabold text-[#5A453A] dark:text-[#D4C7BC]"
            title="Unduh file kalender .ICS untuk Google Calendar atau Apple Calendar"
          >
            <Download className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
            <span className="hidden sm:inline">Ekspor .ICS</span>
            <span className="sm:hidden">.ICS</span>
          </button>

          {/* Quick Add Task */}
          <button
            onClick={() => onOpenNewTaskModal(todayStr + 'T14:00')}
            className="clay-button-primary flex items-center space-x-1.5 px-4 py-2 sm:py-2.5 rounded-2xl text-xs font-extrabold shadow-sm active:scale-95 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Tugas</span>
          </button>
        </div>
      </div>

      {/* Main Month Bento Grid View */}
      <div className="p-3.5 sm:p-6 clay-card">
        
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 sm:mb-3 text-center">
          {daysOfWeek.map((d, i) => (
            <div
              key={d}
              className={`py-1.5 sm:py-2 text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-xl ${
                i === 0 
                  ? 'text-rose-600 dark:text-rose-400 bg-rose-500/10' 
                  : i === 6 
                  ? 'text-orange-600 dark:text-orange-400 bg-orange-500/10' 
                  : 'text-[#8A796E] dark:text-[#BDB0A4]'
              }`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Day Cells Grid */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
          {calendarCells.map((cell, idx) => {
            const cellTasks = getTasksForDate(cell.dateStr);
            const cellTxs = getTransactionsForDate(cell.dateStr);
            const isToday = cell.dateStr === todayStr;
            const isSelected = selectedDateStr === cell.dateStr;
            const totalEvents = cellTasks.length + cellTxs.length;

            const dayIncome = cellTxs.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0);
            const dayExpense = cellTxs.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);

            return (
              <div
                key={idx}
                onClick={() => handleDayClick(cell.dateStr)}
                role="button"
                tabIndex={0}
                className={`min-h-[76px] sm:min-h-[102px] p-1.5 sm:p-2.5 rounded-2xl flex flex-col justify-between transition-all select-none cursor-pointer group ${
                  !cell.isCurrentMonth
                    ? 'opacity-35 bg-[#EDE0D2]/50 dark:bg-[#1A1614]/40 border border-transparent text-[#9C8A7E]'
                    : isToday
                    ? 'bg-orange-50 dark:bg-orange-950/40 border-2 border-orange-500 text-[#3E2F26] dark:text-[#FAF4EE] shadow-[0_4px_16px_rgba(249,115,22,0.25)] ring-2 ring-orange-400/30'
                    : isSelected
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-500 text-[#3E2F26] dark:text-[#FAF4EE] shadow-md'
                    : 'bg-[#FDFBF7] dark:bg-[#25201C] border border-[#E8DACB] dark:border-white/5 hover:border-orange-300 dark:hover:border-orange-700 hover:-translate-y-0.5 text-[#3E2F26] dark:text-[#FAF4EE] shadow-[0_3px_10px_rgba(180,150,130,0.1)]'
                }`}
              >
                {/* Cell Header: Day Number & Event Badge */}
                <div className="flex items-center justify-between">
                  <span className={`text-xs sm:text-sm font-black w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-xl transition ${
                    isToday 
                      ? 'clay-button-primary text-white shadow-sm scale-105' 
                      : 'group-hover:text-orange-600 dark:group-hover:text-orange-400'
                  }`}>
                    {cell.day}
                  </span>

                  {totalEvents > 0 && (
                    <span className="text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/25 shadow-xs">
                      {totalEvents}
                    </span>
                  )}
                </div>

                {/* Event Indicators (Sleek, uncluttered badges & dots) */}
                <div className="space-y-1 mt-1 overflow-hidden">
                  
                  {/* Desktop: Neat mini chips */}
                  <div className="hidden sm:flex flex-col space-y-1">
                    {cellTasks.length > 0 && (
                      <div className="flex items-center space-x-1 px-1.5 py-0.5 rounded-lg bg-orange-100/90 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 text-[10px] font-extrabold border border-orange-200 dark:border-orange-800/60 shadow-2xs truncate">
                        <CheckSquare className="w-2.5 h-2.5 flex-shrink-0 text-orange-600 dark:text-orange-400" />
                        <span className="truncate">{cellTasks[0].title}</span>
                      </div>
                    )}

                    {cellTxs.length > 0 && (
                      <div className={`flex items-center space-x-1 px-1.5 py-0.5 rounded-lg text-[9px] font-extrabold border shadow-2xs truncate ${
                        dayExpense > 0 
                          ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/60'
                          : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60'
                      }`}>
                        {dayExpense > 0 ? (
                          <>
                            <ArrowDownRight className="w-2.5 h-2.5 flex-shrink-0 text-rose-500" />
                            <span className="truncate">-Rp{formatShortRupiah(dayExpense)}</span>
                          </>
                        ) : (
                          <>
                            <ArrowUpRight className="w-2.5 h-2.5 flex-shrink-0 text-emerald-500" />
                            <span className="truncate">+Rp{formatShortRupiah(dayIncome)}</span>
                          </>
                        )}
                      </div>
                    )}

                    {totalEvents > 2 && (
                      <span className="text-[9px] text-[#8A796E] dark:text-[#A8988D] font-black px-1">
                        +{totalEvents - 2} lagi...
                      </span>
                    )}
                  </div>

                  {/* Mobile: Micro colored indicator dots */}
                  <div className="flex sm:hidden items-center justify-center space-x-1 pt-1">
                    {cellTasks.length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-orange-500 shadow-xs" title={`${cellTasks.length} tugas`} />
                    )}
                    {dayIncome > 0 && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs" title="Pemasukan" />
                    )}
                    {dayExpense > 0 && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 shadow-xs" title="Pengeluaran" />
                    )}
                  </div>

                </div>

              </div>
            );
          })}
        </div>

        {/* Legend Hint */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-[#E8DACB] dark:border-white/10 text-[11px] text-[#8A796E] dark:text-[#BDB0A4] font-semibold">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              <span>Tugas & Agenda</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Pemasukan</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Pengeluaran</span>
            </div>
          </div>
          <span className="text-[10px] text-[#A8988D] hidden sm:inline">
            Klik pada tanggal untuk melihat pop-up detail lengkap
          </span>
        </div>

      </div>

      {/* POP-UP DETAIL MODAL (3D CLAYMORPHIC MODAL) */}
      {isDetailModalOpen && selectedDateStr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150">
          <div 
            className="relative w-full max-w-2xl clay-modal flex flex-col max-h-[88vh] sm:max-h-[85vh] rounded-[24px] sm:rounded-[32px] overflow-hidden my-auto shadow-2xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Modal Header */}
            <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#E8DACB] dark:border-white/10 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-orange-100 dark:bg-orange-950/70 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-200 dark:border-orange-800 shadow-inner flex-shrink-0">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <h2 className="text-sm sm:text-base font-black text-[#3E2F26] dark:text-[#FAF4EE] truncate">
                      {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString('id-ID', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </h2>
                    {selectedDateStr === todayStr && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-orange-500 text-white shadow-xs flex-shrink-0">
                        Hari Ini
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] sm:text-xs text-[#8A796E] dark:text-[#BDB0A4] font-medium mt-0.5 line-clamp-1">
                    Ringkasan agenda tugas dan transaksi keuangan harian
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="clay-button p-2 sm:p-2.5 rounded-xl sm:rounded-2xl text-[#8A796E] dark:text-[#D4C7BC] hover:text-[#3E2F26] transition flex-shrink-0 ml-2"
                title="Tutup Modal"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Quick Summary Bento Ribbon */}
            <div className="px-4 sm:px-6 pt-3 sm:pt-4 pb-2 grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 flex-shrink-0">
              <div className="p-2.5 sm:p-3 rounded-2xl clay-card-sm flex flex-col justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8A796E] dark:text-[#BDB0A4]">
                  Total Tugas
                </span>
                <div className="flex items-baseline space-x-1.5 mt-0.5">
                  <span className="text-base sm:text-lg font-black text-[#3E2F26] dark:text-[#FAF4EE]">
                    {selectedTasks.length}
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                    ({completedTasksCount} selesai)
                  </span>
                </div>
              </div>

              <div className="p-2.5 sm:p-3 rounded-2xl clay-card-sm flex flex-col justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Pemasukan
                </span>
                <span className="text-xs sm:text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">
                  +Rp {selectedIncome.toLocaleString('id-ID')}
                </span>
              </div>

              <div className="col-span-2 sm:col-span-1 p-2.5 sm:p-3 rounded-2xl clay-card-sm flex flex-col justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  Pengeluaran
                </span>
                <span className="text-xs sm:text-base font-black text-rose-600 dark:text-rose-400 mt-0.5 truncate">
                  -Rp {selectedExpense.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Modal Navigation Pill Tabs */}
            <div className="px-4 sm:px-6 pt-1.5 pb-2 flex items-center justify-between flex-shrink-0 border-b border-[#E8DACB] dark:border-white/10 gap-2">
              <div className="flex items-center space-x-1 p-1 rounded-2xl bg-[#E8DACB] dark:bg-[#1E1A17] shadow-inner text-[11px] sm:text-xs font-extrabold overflow-x-auto">
                <button
                  onClick={() => setActiveModalTab('all')}
                  className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl transition whitespace-nowrap ${
                    activeModalTab === 'all'
                      ? 'clay-button-primary text-white shadow-xs'
                      : 'text-[#5A453A] dark:text-[#D4C7BC] hover:text-[#3E2F26]'
                  }`}
                >
                  Semua ({selectedTasks.length + selectedTxs.length})
                </button>
                <button
                  onClick={() => setActiveModalTab('tasks')}
                  className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl transition whitespace-nowrap ${
                    activeModalTab === 'tasks'
                      ? 'clay-button-primary text-white shadow-xs'
                      : 'text-[#5A453A] dark:text-[#D4C7BC] hover:text-[#3E2F26]'
                  }`}
                >
                  Tugas ({selectedTasks.length})
                </button>
                <button
                  onClick={() => setActiveModalTab('finance')}
                  className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl transition whitespace-nowrap ${
                    activeModalTab === 'finance'
                      ? 'clay-button-primary text-white shadow-xs'
                      : 'text-[#5A453A] dark:text-[#D4C7BC] hover:text-[#3E2F26]'
                  }`}
                >
                  Keuangan ({selectedTxs.length})
                </button>
              </div>

              {/* Fast Action Buttons */}
              <div className="flex items-center space-x-1.5 flex-shrink-0">
                <button
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    onOpenNewTaskModal(selectedDateStr + 'T14:00');
                  }}
                  className="clay-button-primary p-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs font-extrabold flex items-center space-x-1 shadow-xs"
                  title="Tambah tugas di tanggal ini"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Tugas</span>
                </button>

                <button
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    onOpenNewTxModal(selectedDateStr);
                  }}
                  className="clay-button p-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs font-extrabold text-orange-600 dark:text-orange-400 flex items-center space-x-1 shadow-xs"
                  title="Tambah transaksi di tanggal ini"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Transaksi</span>
                </button>
              </div>
            </div>

            {/* Scrollable Content Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
              
              {/* SECTION 1: TASKS */}
              {(activeModalTab === 'all' || activeModalTab === 'tasks') && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#8A796E] dark:text-[#BDB0A4] flex items-center space-x-1.5">
                      <CheckSquare className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                      <span>Agenda & Tugas ({selectedTasks.length})</span>
                    </h3>
                  </div>

                  {selectedTasks.length === 0 ? (
                    <div className="text-center py-6 px-4 rounded-2xl border-2 border-dashed border-[#E8DACB] dark:border-white/10 text-xs text-[#8A796E] dark:text-[#A8988D] font-medium">
                      Tidak ada tugas yang dijadwalkan pada tanggal ini.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {selectedTasks.map((t) => {
                        const cat = getTaskCategory(t.category);
                        return (
                          <div
                            key={t.id}
                            className={`p-3.5 sm:p-4 rounded-2xl clay-card-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                              t.completed ? 'opacity-70 bg-[#F4EAE0] dark:bg-[#1E1A17]' : ''
                            }`}
                          >
                            <div className="flex items-start space-x-3 min-w-0 flex-1">
                              <button
                                type="button"
                                onClick={() => onToggleComplete(t.id)}
                                className="cursor-pointer mt-0.5 flex-shrink-0"
                                title={t.completed ? 'Tandai belum selesai' : 'Tandai selesai'}
                              >
                                {t.completed ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-500 filter drop-shadow-xs" />
                                ) : (
                                  <Circle className="w-5 h-5 text-[#8A796E] hover:text-orange-500 transition" />
                                )}
                              </button>

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                                  <h4 className={`text-xs sm:text-sm font-extrabold truncate ${
                                    t.completed ? 'line-through text-[#8A796E]' : 'text-[#3E2F26] dark:text-[#FAF4EE]'
                                  }`}>
                                    {t.title}
                                  </h4>
                                  {getPriorityBadge(t.priority)}
                                  <span 
                                    className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border shadow-2xs"
                                    style={{
                                      backgroundColor: `${cat.color}15`,
                                      borderColor: `${cat.color}35`,
                                      color: cat.color,
                                    }}
                                  >
                                    {cat.name}
                                  </span>
                                </div>

                                {t.description && (
                                  <p className="text-[11px] text-[#6B5A4E] dark:text-[#D4C7BC] line-clamp-1 mb-1 font-medium">
                                    {t.description}
                                  </p>
                                )}

                                <div className="flex items-center space-x-2 text-[10px] text-[#8A796E] dark:text-[#BDB0A4] font-semibold">
                                  <Clock className="w-3 h-3 text-orange-600 dark:text-orange-400" />
                                  <span>{new Date(t.dueDate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
                                  {t.subtasks && t.subtasks.length > 0 && (
                                    <>
                                      <span>•</span>
                                      <span>{t.subtasks.filter(s => s.completed).length}/{t.subtasks.length} Subtugas</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end space-x-2 flex-shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-[#E8DACB] dark:border-white/5">
                              <a
                                href={getGoogleCalendarUrl(t)}
                                target="_blank"
                                rel="noreferrer"
                                title="Buka di Google Calendar"
                                className="clay-button p-2 rounded-xl text-orange-600 dark:text-orange-400"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                              <button
                                onClick={() => {
                                  setIsDetailModalOpen(false);
                                  onEditTask(t);
                                }}
                                className="clay-button px-3 py-1.5 rounded-xl text-xs font-extrabold text-[#5A453A] dark:text-[#D4C7BC]"
                              >
                                Edit
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 2: TRANSACTIONS */}
              {(activeModalTab === 'all' || activeModalTab === 'finance') && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#8A796E] dark:text-[#BDB0A4] flex items-center space-x-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Catatan Transaksi Keuangan ({selectedTxs.length})</span>
                    </h3>
                  </div>

                  {selectedTxs.length === 0 ? (
                    <div className="text-center py-6 px-4 rounded-2xl border-2 border-dashed border-[#E8DACB] dark:border-white/10 text-xs text-[#8A796E] dark:text-[#A8988D] font-medium">
                      Belum ada transaksi keuangan yang tercatat pada tanggal ini.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {selectedTxs.map((tx) => {
                        const cat = getFinanceCategory(tx.category);
                        return (
                          <div
                            key={tx.id}
                            className="p-3.5 sm:p-4 rounded-2xl clay-card-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="flex items-center space-x-3 min-w-0 flex-1">
                              <div className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 border shadow-inner ${
                                tx.type === 'income'
                                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                  : 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30'
                              }`}>
                                {tx.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                  <h4 className="text-xs sm:text-sm font-extrabold truncate text-[#3E2F26] dark:text-[#FAF4EE]">
                                    {tx.title}
                                  </h4>
                                  <span
                                    className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border shadow-2xs"
                                    style={{
                                      backgroundColor: `${cat.color}20`,
                                      borderColor: `${cat.color}40`,
                                      color: cat.color,
                                    }}
                                  >
                                    {cat.name}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2 text-[10px] text-[#8A796E] dark:text-[#BDB0A4] mt-0.5 font-medium">
                                  <span className="capitalize font-bold">{tx.paymentMethod}</span>
                                  {tx.notes && (
                                    <>
                                      <span>•</span>
                                      <span className="truncate max-w-[150px]">{tx.notes}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Price & Action */}
                            <div className="flex items-center justify-between sm:justify-end space-x-2.5 flex-shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-[#E8DACB] dark:border-white/5">
                              <span className={`text-xs sm:text-sm font-black ${
                                tx.type === 'income'
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-rose-600 dark:text-rose-400'
                              }`}>
                                {tx.type === 'income' ? '+' : '-'}Rp {tx.amount.toLocaleString('id-ID')}
                              </span>

                              <div className="flex items-center space-x-1">
                                {onEditTx && (
                                  <button
                                    onClick={() => {
                                      setIsDetailModalOpen(false);
                                      onEditTx(tx);
                                    }}
                                    title="Ubah Transaksi"
                                    className="clay-button p-1.5 rounded-xl text-amber-600 dark:text-amber-400"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {onDeleteTx && (
                                  <button
                                    onClick={() => onDeleteTx(tx.id)}
                                    title="Hapus Transaksi"
                                    className="clay-button p-1.5 rounded-xl text-rose-600 dark:text-rose-400"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="px-5 sm:px-6 py-3.5 border-t border-[#E8DACB] dark:border-white/10 flex items-center justify-between flex-shrink-0 bg-[#F9F5F0]/60 dark:bg-[#1E1A17]/60">
              <span className="text-[11px] text-[#8A796E] dark:text-[#BDB0A4] font-medium">
                {selectedTasks.length + selectedTxs.length} aktivitas pada tanggal ini
              </span>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="clay-button px-5 py-2 rounded-2xl text-xs font-extrabold text-[#5A453A] dark:text-[#D4C7BC]"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
