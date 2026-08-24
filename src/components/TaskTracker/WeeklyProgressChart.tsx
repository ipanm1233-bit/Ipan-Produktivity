import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area,
  CartesianGrid,
  Legend
} from 'recharts';
import { 
  BarChart3, 
  PieChart as PieIcon, 
  TrendingUp, 
  TrendingDown,
  Award, 
  CheckCircle2, 
  Flame, 
  Clock, 
  Target, 
  Sparkles,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Wallet,
  CalendarDays,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Task, TaskCategory, Transaction, FinanceCategory, MonthlyBudgetConfig } from '../../types';

interface WeeklyProgressChartProps {
  tasks: Task[];
  taskCategories: TaskCategory[];
  transactions?: Transaction[];
  financeCategories?: FinanceCategory[];
  budgetConfig?: MonthlyBudgetConfig;
  darkMode: boolean;
}

export const WeeklyProgressChart: React.FC<WeeklyProgressChartProps> = ({
  tasks,
  taskCategories,
  transactions = [],
  financeCategories = [],
  budgetConfig,
  darkMode,
}) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');
  const [activeSection, setActiveSection] = useState<'all' | 'tasks' | 'finance'>('all');

  const daysCount = timeRange === '7d' ? 7 : 30;
  const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const today = new Date();

  // Generate daily metrics for tasks & transactions
  const timeSeriesData = Array.from({ length: daysCount }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (daysCount - 1 - i));
    const dayKey = d.toISOString().slice(0, 10);
    const dayName = daysOfWeek[d.getDay()];
    const dateLabel = `${d.getDate()}/${d.getMonth() + 1}`;

    // Tasks due on this day or completed on this day
    const tasksOnDay = tasks.filter(
      (t) => t.dueDate && t.dueDate.slice(0, 10) === dayKey
    );
    const completedOnDay = tasks.filter(
      (t) => (t.completedAt && t.completedAt.slice(0, 10) === dayKey) || 
             (t.completed && t.dueDate && t.dueDate.slice(0, 10) === dayKey)
    );

    // Transactions on this day
    const dayTxs = transactions.filter(
      (tx) => tx.date && tx.date.slice(0, 10) === dayKey
    );
    const dayIncome = dayTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const dayExpense = dayTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    return {
      name: timeRange === '7d' ? dayName : dateLabel,
      fullDate: `${dayName}, ${dateLabel}`,
      totalTasks: Math.max(tasksOnDay.length, completedOnDay.length),
      selesai: completedOnDay.length,
      tertunda: Math.max(0, tasksOnDay.length - completedOnDay.length),
      pemasukan: dayIncome,
      pengeluaran: dayExpense,
      netFlow: dayIncome - dayExpense,
    };
  });

  // Calculate overall task metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const overallRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Task Category distribution
  const taskCategoryStats = taskCategories.map((cat) => {
    const catTasks = tasks.filter((t) => t.category === cat.id);
    const catCompleted = catTasks.filter((t) => t.completed).length;
    return {
      name: cat.name,
      total: catTasks.length,
      completed: catCompleted,
      color: cat.color || '#F97316',
    };
  }).filter((c) => c.total > 0);

  // Financial Metrics
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)) : 0;

  // Finance Category Distribution
  const expenseCategories = financeCategories.filter(c => c.type === 'expense');
  const expenseCatStats = expenseCategories.map((cat) => {
    const catTxs = transactions.filter(t => t.category === cat.id && t.type === 'expense');
    const totalAmount = catTxs.reduce((sum, t) => sum + t.amount, 0);
    return {
      name: cat.name,
      total: totalAmount,
      color: cat.color || '#E67E51',
    };
  }).filter(c => c.total > 0);

  // Payment Method Breakdown
  const paymentStats = [
    { method: 'E-Wallet', count: transactions.filter(t => t.paymentMethod === 'ewallet').length, amount: transactions.filter(t => t.paymentMethod === 'ewallet').reduce((s, t) => s + t.amount, 0) },
    { method: 'Transfer Bank', count: transactions.filter(t => t.paymentMethod === 'transfer').length, amount: transactions.filter(t => t.paymentMethod === 'transfer').reduce((s, t) => s + t.amount, 0) },
    { method: 'Tunai (Cash)', count: transactions.filter(t => t.paymentMethod === 'cash').length, amount: transactions.filter(t => t.paymentMethod === 'cash').reduce((s, t) => s + t.amount, 0) },
    { method: 'Kartu Kredit/Debit', count: transactions.filter(t => t.paymentMethod === 'credit_card').length, amount: transactions.filter(t => t.paymentMethod === 'credit_card').reduce((s, t) => s + t.amount, 0) },
  ].filter(p => p.count > 0);

  // Productivity Score formula
  const productivityScore = Math.min(100, Math.round(overallRate * 0.7 + (completedTasks >= 5 ? 30 : completedTasks * 6)));

  const chartTheme = {
    textColor: darkMode ? '#C5B7AE' : '#6B5A4E',
    gridColor: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    tooltipBg: darkMode ? '#221E1B' : '#FAF3EC',
    tooltipBorder: darkMode ? 'rgba(255,255,255,0.1)' : '#E8DACB',
  };

  const formatShortRupiah = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1).replace('.0', '')}jt`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}rb`;
    return num.toString();
  };

  return (
    <div className="space-y-6">
      
      {/* Bento Header & Navigation Filter Bar */}
      <div className="p-5 sm:p-7 clay-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 transition">
        <div className="flex items-center space-x-3.5 sm:space-x-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-200 dark:border-orange-800 shadow-inner flex-shrink-0">
            <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                Pusat Analitik & Laporan
              </span>
              <span className="text-[#8A796E]">•</span>
              <span className="text-[10px] text-[#8A796E] dark:text-[#BDB0A4] font-bold">Terpadu Real-Time</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-[#3E2F26] dark:text-[#FAF4EE] tracking-tight">
              Statistik Produktivitas & Keuangan
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-end">
          
          {/* Section Selector Tab */}
          <div className="flex items-center space-x-1 p-1 rounded-2xl bg-[#E8DACB] dark:bg-[#1E1A17] shadow-inner text-xs font-extrabold">
            <button
              onClick={() => setActiveSection('all')}
              className={`px-3 py-1.5 rounded-xl transition ${
                activeSection === 'all'
                  ? 'clay-button-primary text-white shadow-xs'
                  : 'text-[#5A453A] dark:text-[#D4C7BC] hover:text-[#3E2F26]'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setActiveSection('tasks')}
              className={`px-3 py-1.5 rounded-xl transition ${
                activeSection === 'tasks'
                  ? 'clay-button-primary text-white shadow-xs'
                  : 'text-[#5A453A] dark:text-[#D4C7BC] hover:text-[#3E2F26]'
              }`}
            >
              Tugas
            </button>
            <button
              onClick={() => setActiveSection('finance')}
              className={`px-3 py-1.5 rounded-xl transition ${
                activeSection === 'finance'
                  ? 'clay-button-primary text-white shadow-xs'
                  : 'text-[#5A453A] dark:text-[#D4C7BC] hover:text-[#3E2F26]'
              }`}
            >
              Keuangan
            </button>
          </div>

          {/* Timeframe Toggle (7D / 30D) */}
          <div className="flex items-center space-x-1 p-1 rounded-2xl bg-[#E8DACB] dark:bg-[#1E1A17] shadow-inner text-xs font-extrabold">
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-3 py-1.5 rounded-xl transition ${
                timeRange === '7d'
                  ? 'clay-button text-orange-600 dark:text-orange-400 font-black shadow-xs'
                  : 'text-[#5A453A] dark:text-[#D4C7BC]'
              }`}
            >
              7 Hari
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-3 py-1.5 rounded-xl transition ${
                timeRange === '30d'
                  ? 'clay-button text-orange-600 dark:text-orange-400 font-black shadow-xs'
                  : 'text-[#5A453A] dark:text-[#D4C7BC]'
              }`}
            >
              30 Hari
            </button>
          </div>

        </div>
      </div>

      {/* 4 Symmetrical 3D Clay KPI Metric Ribbon Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Skor Produktivitas */}
        <div className="p-5 rounded-3xl clay-card flex flex-col justify-between transition hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#8A796E] dark:text-[#BDB0A4] uppercase tracking-wider">
              Skor Produktivitas
            </span>
            <div className="w-10 h-10 rounded-2xl bg-orange-500/15 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-500/25 shadow-inner">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-orange-600 dark:text-orange-400">
              {productivityScore}
            </span>
            <span className="text-xs font-bold text-[#8A796E] dark:text-[#A8988D]">/ 100 Poin</span>
          </div>
          <div className="mt-2 text-[11px] text-[#6B5A4E] dark:text-[#C5B7AE] font-semibold flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            <span className="truncate">
              {productivityScore >= 80 ? '🌟 Performa luar biasa konsisten' : productivityScore >= 60 ? '👍 Produktivitas stabil & baik' : '⚡ Perlu dorongan fokus'}
            </span>
          </div>
        </div>

        {/* Metric 2: Tingkat Penyelesaian Tugas */}
        <div className="p-5 rounded-3xl clay-card flex flex-col justify-between transition hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#8A796E] dark:text-[#BDB0A4] uppercase tracking-wider">
              Tugas Terselesaikan
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/25 shadow-inner">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {overallRate}%
            </span>
            <span className="text-xs font-bold text-[#8A796E] dark:text-[#A8988D]">
              ({completedTasks}/{totalTasks} tugas)
            </span>
          </div>
          <div className="mt-2.5 w-full bg-[#E8DACB] dark:bg-[#1E1A17] h-2 rounded-full overflow-hidden shadow-inner">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${overallRate}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Arus Kas Bersih (Net Flow) */}
        <div className="p-5 rounded-3xl clay-card flex flex-col justify-between transition hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#8A796E] dark:text-[#BDB0A4] uppercase tracking-wider">
              Arus Kas Bersih
            </span>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-inner ${
              netBalance >= 0 
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25' 
                : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/25'
            }`}>
              {netBalance >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-1 min-w-0">
            <span className={`text-2xl sm:text-3xl font-black truncate ${
              netBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}>
              {netBalance >= 0 ? '+' : '-'}Rp {Math.abs(netBalance).toLocaleString('id-ID')}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-[#6B5A4E] dark:text-[#C5B7AE] font-semibold flex items-center justify-between">
            <span className="text-emerald-600 dark:text-emerald-400">+Rp {formatShortRupiah(totalIncome)}</span>
            <span className="text-rose-600 dark:text-rose-400">-Rp {formatShortRupiah(totalExpense)}</span>
          </div>
        </div>

        {/* Metric 4: Rasio Tabungan / Efisiensi Budget */}
        <div className="p-5 rounded-3xl clay-card flex flex-col justify-between transition hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#8A796E] dark:text-[#BDB0A4] uppercase tracking-wider">
              Rasio Tabungan
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/25 shadow-inner">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-amber-600 dark:text-amber-400">
              {savingsRate}%
            </span>
            <span className="text-xs font-bold text-[#8A796E] dark:text-[#A8988D]">dari pemasukan</span>
          </div>
          <div className="mt-2.5 w-full bg-[#E8DACB] dark:bg-[#1E1A17] h-2 rounded-full overflow-hidden shadow-inner">
            <div 
              className="bg-amber-500 h-full rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${Math.min(100, savingsRate)}%` }}
            />
          </div>
        </div>

      </div>

      {/* SECTION 1: PRIMARY CHARTS (TASK COMPLETION & CASH FLOW TIMELINES) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart A: 7D / 30D Task Completion Bar Chart */}
        {(activeSection === 'all' || activeSection === 'tasks') && (
          <div className="p-5 sm:p-6 clay-card flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-[#3E2F26] dark:text-[#FAF4EE] flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <span>Tren Penyelesaian Tugas ({timeRange === '7d' ? '7 Hari' : '30 Hari'})</span>
                </h3>
                <p className="text-xs text-[#8A796E] dark:text-[#BDB0A4] mt-0.5 font-medium">
                  Rasio tugas selesai vs tertunda harian
                </p>
              </div>
            </div>

            <div className="h-64 sm:h-72 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} vertical={false} />
                  <XAxis dataKey="name" stroke={chartTheme.textColor} fontSize={11} tickLine={false} />
                  <YAxis stroke={chartTheme.textColor} fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: chartTheme.tooltipBg, 
                      borderColor: chartTheme.tooltipBorder,
                      borderRadius: '16px',
                      fontSize: '12px',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                      color: darkMode ? '#FAF4EE' : '#3E2F26',
                      fontWeight: 'bold',
                    }} 
                  />
                  <Legend 
                    verticalAlign="top" 
                    height={36}
                    wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} 
                  />
                  <Bar dataKey="selesai" name="Selesai" fill="#EA580C" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="tertunda" name="Tertunda" fill={darkMode ? '#4A3E36' : '#C5B7AE'} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Chart B: Cash Flow Income vs Expense Area Chart */}
        {(activeSection === 'all' || activeSection === 'finance') && (
          <div className="p-5 sm:p-6 clay-card flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-[#3E2F26] dark:text-[#FAF4EE] flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>Dinamika Arus Kas ({timeRange === '7d' ? '7 Hari' : '30 Hari'})</span>
                </h3>
                <p className="text-xs text-[#8A796E] dark:text-[#BDB0A4] mt-0.5 font-medium">
                  Perbandingan tren nominal pemasukan dan pengeluaran
                </p>
              </div>
            </div>

            <div className="h-64 sm:h-72 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#F43F5E" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} vertical={false} />
                  <XAxis dataKey="name" stroke={chartTheme.textColor} fontSize={11} tickLine={false} />
                  <YAxis 
                    stroke={chartTheme.textColor} 
                    fontSize={10} 
                    tickLine={false}
                    tickFormatter={(val) => formatShortRupiah(val)}
                  />
                  <Tooltip 
                    formatter={(value: any) => [`Rp ${Number(value).toLocaleString('id-ID')}`, '']}
                    contentStyle={{ 
                      backgroundColor: chartTheme.tooltipBg, 
                      borderColor: chartTheme.tooltipBorder,
                      borderRadius: '16px',
                      fontSize: '12px',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                      color: darkMode ? '#FAF4EE' : '#3E2F26',
                      fontWeight: 'bold',
                    }} 
                  />
                  <Legend 
                    verticalAlign="top" 
                    height={36}
                    wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} 
                  />
                  <Area type="monotone" dataKey="pemasukan" name="Pemasukan" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#incomeGradient)" />
                  <Area type="monotone" dataKey="pengeluaran" name="Pengeluaran" stroke="#F43F5E" strokeWidth={2.5} fillOpacity={1} fill="url(#expenseGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

      </div>

      {/* SECTION 2: BREAKDOWN GRIDS (CATEGORIES & PRIORITIES) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Task Category Breakdown */}
        {(activeSection === 'all' || activeSection === 'tasks') && (
          <div className="p-5 sm:p-6 clay-card flex flex-col justify-between">
            <div>
              <h3 className="text-base font-extrabold text-[#3E2F26] dark:text-[#FAF4EE] flex items-center space-x-2 mb-1">
                <PieIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <span>Distribusi Kategori Tugas</span>
              </h3>
              <p className="text-xs text-[#8A796E] dark:text-[#BDB0A4] mb-4 font-medium">
                Alokasi fokus waktu berdasarkan bidang aktivitas
              </p>

              {taskCategoryStats.length > 0 ? (
                <div className="space-y-4">
                  <div className="h-44 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={taskCategoryStats}
                          dataKey="total"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={65}
                          paddingAngle={4}
                        >
                          {taskCategoryStats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-2 text-xs">
                    {taskCategoryStats.map((cat, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-xl clay-card-sm">
                        <div className="flex items-center space-x-2 min-w-0">
                          <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                          <span className="font-extrabold truncate text-[#3E2F26] dark:text-[#FAF4EE]">{cat.name}</span>
                        </div>
                        <div className="font-bold text-[#8A796E] dark:text-[#BDB0A4]">
                          {cat.completed}/{cat.total} selesai
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-xs text-[#8A796E] dark:text-[#A8988D] font-medium">
                  Belum ada data kategori tugas
                </div>
              )}
            </div>
          </div>
        )}

        {/* Card 2: Expense Category Breakdown */}
        {(activeSection === 'all' || activeSection === 'finance') && (
          <div className="p-5 sm:p-6 clay-card flex flex-col justify-between">
            <div>
              <h3 className="text-base font-extrabold text-[#3E2F26] dark:text-[#FAF4EE] flex items-center space-x-2 mb-1">
                <PieIcon className="w-5 h-5 text-rose-500" />
                <span>Pengeluaran per Kategori</span>
              </h3>
              <p className="text-xs text-[#8A796E] dark:text-[#BDB0A4] mb-4 font-medium">
                Komposisi alokasi dana dan pos pengeluaran
              </p>

              {expenseCatStats.length > 0 ? (
                <div className="space-y-4">
                  <div className="h-44 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expenseCatStats}
                          dataKey="total"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={65}
                          paddingAngle={4}
                        >
                          {expenseCatStats.map((entry, index) => (
                            <Cell key={`cell-exp-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(val: any) => [`Rp ${Number(val).toLocaleString('id-ID')}`, 'Total']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-2 text-xs">
                    {expenseCatStats.map((cat, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-xl clay-card-sm">
                        <div className="flex items-center space-x-2 min-w-0">
                          <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                          <span className="font-extrabold truncate text-[#3E2F26] dark:text-[#FAF4EE]">{cat.name}</span>
                        </div>
                        <div className="font-black text-rose-600 dark:text-rose-400">
                          Rp {formatShortRupiah(cat.total)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-xs text-[#8A796E] dark:text-[#A8988D] font-medium">
                  Belum ada data pengeluaran
                </div>
              )}
            </div>
          </div>
        )}

        {/* Card 3: Priority & Urgency Levels */}
        {(activeSection === 'all' || activeSection === 'tasks') && (
          <div className="p-5 sm:p-6 clay-card flex flex-col justify-between">
            <div>
              <h3 className="text-base font-extrabold text-[#3E2F26] dark:text-[#FAF4EE] flex items-center space-x-2 mb-1">
                <Target className="w-5 h-5 text-amber-500" />
                <span>Alokasi Tingkat Prioritas</span>
              </h3>
              <p className="text-xs text-[#8A796E] dark:text-[#BDB0A4] mb-4 font-medium">
                Komposisi urgensi tugas untuk manajemen waktu optimal
              </p>

              <div className="space-y-3.5 pt-1">
                {[
                  { label: 'Mendesak (Urgent)', key: 'urgent', color: 'bg-rose-500', count: tasks.filter(t => t.priority === 'urgent').length },
                  { label: 'Tinggi (High)', key: 'high', color: 'bg-amber-500', count: tasks.filter(t => t.priority === 'high').length },
                  { label: 'Sedang (Medium)', key: 'medium', color: 'bg-blue-500', count: tasks.filter(t => t.priority === 'medium').length },
                  { label: 'Rendah (Low)', key: 'low', color: 'bg-emerald-500', count: tasks.filter(t => t.priority === 'low').length },
                ].map((p, i) => {
                  const percent = totalTasks > 0 ? (p.count / totalTasks) * 100 : 0;
                  return (
                    <div key={i} className="p-2.5 rounded-2xl clay-card-sm space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-[#3E2F26] dark:text-[#FAF4EE]">{p.label}</span>
                        <span className="text-[#8A796E] dark:text-[#BDB0A4] font-black">{p.count} ({percent.toFixed(0)}%)</span>
                      </div>
                      <div className="w-full bg-[#E8DACB] dark:bg-[#1E1A17] h-2 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className={`${p.color} h-full rounded-full transition-all duration-500`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Smart Insight Pill */}
            <div className="mt-4 p-3 rounded-2xl bg-orange-500/10 dark:bg-orange-950/40 border border-orange-500/20 text-xs text-[#5A453A] dark:text-[#D4C7BC] font-medium flex items-center space-x-2">
              <Zap className="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0" />
              <span>Prioritaskan tugas <strong>Mendesak & Tinggi</strong> di awal pagi untuk efisiensi energi optimal.</span>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
