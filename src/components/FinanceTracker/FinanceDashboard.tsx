import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  DollarSign, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  Sliders, 
  PieChart as PieIcon, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldAlert,
  CreditCard,
  Building2,
  Banknote,
  Smartphone,
  Calendar,
  Sparkles
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis 
} from 'recharts';
import { Transaction, FinanceCategory, MonthlyBudgetConfig } from '../../types';

interface FinanceDashboardProps {
  transactions: Transaction[];
  categories: FinanceCategory[];
  budgetConfig: MonthlyBudgetConfig;
  onUpdateBudget: (config: MonthlyBudgetConfig) => void;
  onOpenNewTxModal: () => void;
  onEditTx: (tx: Transaction) => void;
  onDeleteTx: (id: string) => void;
  darkMode: boolean;
}

export const FinanceDashboard: React.FC<FinanceDashboardProps> = ({
  transactions,
  categories,
  budgetConfig,
  onUpdateBudget,
  onOpenNewTxModal,
  onEditTx,
  onDeleteTx,
  darkMode,
}) => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'expense' | 'income'>('all');
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [isSettingBudget, setIsSettingBudget] = useState(false);
  const [tempTotalBudget, setTempTotalBudget] = useState(budgetConfig.totalBudget);
  const [tempThreshold, setTempThreshold] = useState(budgetConfig.alertThresholdPercent || 80);
  const [tempCategoryBudgets, setTempCategoryBudgets] = useState<Record<string, number>>(
    budgetConfig.categoryBudgets || {}
  );

  // Filter transactions by month
  const monthTransactions = transactions.filter((t) => t.date.startsWith(selectedMonth));

  // Calculations
  const totalIncome = monthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = monthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  const budgetUsagePercent = budgetConfig.totalBudget > 0
    ? (totalExpense / budgetConfig.totalBudget) * 100
    : 0;

  const remainingBudget = Math.max(0, budgetConfig.totalBudget - totalExpense);
  const isOverBudget = totalExpense > budgetConfig.totalBudget && budgetConfig.totalBudget > 0;
  const isWarningBudget = budgetUsagePercent >= (budgetConfig.alertThresholdPercent || 80) && !isOverBudget;

  // Filtered transactions for table
  const filteredTransactions = monthTransactions.filter((t) => {
    if (selectedType !== 'all' && t.type !== selectedType) return false;
    if (selectedCat !== 'all' && t.category !== selectedCat) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchNotes = t.notes?.toLowerCase().includes(q);
      if (!matchTitle && !matchNotes) return false;
    }
    return true;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Category expense breakdown for charts
  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const categoryExpenseData = expenseCategories.map((cat) => {
    const sum = monthTransactions
      .filter((t) => t.type === 'expense' && t.category === cat.id)
      .reduce((s, t) => s + t.amount, 0);
    const limit = budgetConfig.categoryBudgets[cat.id] || 0;
    return {
      id: cat.id,
      name: cat.name,
      amount: sum,
      limit,
      color: cat.color,
      percentOfTotal: totalExpense > 0 ? (sum / totalExpense) * 100 : 0,
      percentOfLimit: limit > 0 ? (sum / limit) * 100 : 0,
    };
  }).filter((c) => c.amount > 0);

  const handleSaveBudgetConfig = () => {
    onUpdateBudget({
      totalBudget: Number(tempTotalBudget),
      categoryBudgets: tempCategoryBudgets,
      alertThresholdPercent: Number(tempThreshold),
    });
    setIsSettingBudget(false);
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'transfer':
        return <Building2 className="w-3.5 h-3.5 text-blue-500" title="Transfer Bank" />;
      case 'ewallet':
        return <Smartphone className="w-3.5 h-3.5 text-cyan-500" title="E-Wallet" />;
      case 'credit_card':
        return <CreditCard className="w-3.5 h-3.5 text-purple-500" title="Kartu Kredit" />;
      case 'cash':
      default:
        return <Banknote className="w-3.5 h-3.5 text-emerald-500" title="Tunai" />;
    }
  };

  const getCategoryInfo = (catId: string, type: string) => {
    return categories.find((c) => c.id === catId) || {
      name: catId,
      color: type === 'expense' ? '#f43f5e' : '#10b981',
    };
  };

  return (
    <div className="space-y-6">
      
      {/* Bento Header & Month Selector */}
      <div className="p-6 sm:p-7 clay-card flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 transition">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-200 dark:border-orange-800 shadow-inner flex-shrink-0">
            <Wallet className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                Pencatatan Keuangan
              </span>
              <span className="text-[#8A796E]">•</span>
              <span className="text-[10px] text-[#8A796E] dark:text-[#BDB0A4] font-bold">{selectedMonth}</span>
            </div>
            <h2 className="text-xl font-extrabold text-[#3E2F26] dark:text-[#FAF4EE]">Dompet & Anggaran Bulanan</h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Month input selector */}
          <input
            id="finance-month-picker"
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3.5 py-2.5 clay-input rounded-2xl text-xs font-extrabold text-[#3E2F26] dark:text-[#FAF4EE] focus:outline-none cursor-pointer"
          />

          {/* Setting Budget Target Button */}
          <button
            id="open-budget-settings-btn"
            onClick={() => setIsSettingBudget(true)}
            className="clay-button p-2.5 sm:px-4 sm:py-2.5 rounded-2xl text-xs font-extrabold flex items-center space-x-1.5 text-[#5A453A] dark:text-[#D4C7BC]"
          >
            <Sliders className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <span className="hidden sm:inline">Set Anggaran</span>
          </button>

          {/* Add Transaction CTA */}
          <button
            id="add-tx-main-cta-btn"
            onClick={onOpenNewTxModal}
            className="clay-button-primary flex items-center space-x-1.5 px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Transaksi</span>
          </button>
        </div>
      </div>

      {/* Main Financial Bento Grid Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Income */}
        <div className="p-5 clay-card transition-transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8A796E] dark:text-[#BDB0A4]">Total Pemasukan</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-inner">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              Rp {totalIncome.toLocaleString('id-ID')}
            </span>
          </div>
          <span className="text-[11px] text-[#8A796E] dark:text-[#A8988D] mt-1 font-medium block">
            {monthTransactions.filter((t) => t.type === 'income').length} transaksi tercatat
          </span>
        </div>

        {/* Total Expense */}
        <div className="p-5 clay-card transition-transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8A796E] dark:text-[#BDB0A4]">Total Pengeluaran</span>
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/30 shadow-inner">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
              Rp {totalExpense.toLocaleString('id-ID')}
            </span>
          </div>
          <span className="text-[11px] text-[#8A796E] dark:text-[#A8988D] mt-1 font-medium block">
            {monthTransactions.filter((t) => t.type === 'expense').length} transaksi keluar
          </span>
        </div>

        {/* Net Cash Flow / Sisa Saldo */}
        <div className="p-5 clay-card transition-transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8A796E] dark:text-[#BDB0A4]">Sisa Saldo Bersih</span>
            <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-500/30 shadow-inner">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className={`text-2xl font-black ${netBalance >= 0 ? 'text-[#3E2F26] dark:text-[#FAF4EE]' : 'text-rose-600 dark:text-rose-400'}`}>
              Rp {netBalance.toLocaleString('id-ID')}
            </span>
          </div>
          <span className="text-[11px] text-[#8A796E] dark:text-[#A8988D] mt-1 font-medium block">
            {netBalance >= 0 ? 'Surplus kas positif' : 'Defisit pengeluaran'}
          </span>
        </div>

        {/* Budget Status Meter */}
        <div className="p-5 clay-card transition-transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8A796E] dark:text-[#BDB0A4]">Status Anggaran</span>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-inner ${
              isOverBudget
                ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30 animate-pulse'
                : isWarningBudget
                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
            }`}>
              {isOverBudget ? <ShieldAlert className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-1">
            <span className={`text-2xl font-black ${
              isOverBudget ? 'text-rose-600 dark:text-rose-400' : isWarningBudget ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
            }`}>
              {budgetUsagePercent.toFixed(0)}%
            </span>
            <span className="text-xs text-[#8A796E] dark:text-[#A8988D] font-bold">terpakai</span>
          </div>
          <span className="text-[11px] text-[#8A796E] dark:text-[#A8988D] mt-1 font-medium block truncate">
            {isOverBudget ? '⚠️ Melebihi batas!' : isWarningBudget ? '🔔 Waspada kuota menipis' : `Sisa Rp ${remainingBudget.toLocaleString('id-ID')}`}
          </span>
        </div>

      </div>

      {/* Monthly Budget Progress Bento Banner */}
      <div className={`p-6 rounded-3xl clay-card transition-all ${
        isOverBudget 
          ? 'border-2 border-rose-500/40 bg-rose-50/50 dark:bg-rose-950/20' 
          : isWarningBudget
          ? 'border-2 border-amber-500/40 bg-amber-50/50 dark:bg-amber-950/20'
          : ''
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-extrabold text-[#3E2F26] dark:text-[#FAF4EE]">
                Penggunaan Anggaran Bulanan
              </h3>
              {isOverBudget && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-600 text-white shadow-sm">
                  OVER-BUDGET
                </span>
              )}
              {isWarningBudget && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500 text-white shadow-sm">
                  MENDEKATI LIMIT ({budgetConfig.alertThresholdPercent || 80}%)
                </span>
              )}
            </div>
            <p className="text-xs text-[#8A796E] dark:text-[#BDB0A4] mt-0.5 font-medium">
              Target Anggaran: Rp {budgetConfig.totalBudget.toLocaleString('id-ID')} • Terpakai: Rp {totalExpense.toLocaleString('id-ID')}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-extrabold text-orange-600 dark:text-orange-400">
              Sisa Kuota: Rp {remainingBudget.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-[#E5D7CA] dark:bg-[#201C19] h-3.5 rounded-full overflow-hidden p-0.5 shadow-inner border border-white/40 dark:border-white/5">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isOverBudget
                ? 'bg-rose-600 shadow-[0_2px_8px_rgba(225,29,72,0.4)]'
                : isWarningBudget
                ? 'bg-amber-500 shadow-[0_2px_8px_rgba(245,158,11,0.4)]'
                : 'bg-gradient-to-r from-orange-500 to-amber-500 shadow-[0_2px_8px_rgba(249,115,22,0.4)]'
            }`}
            style={{ width: `${Math.min(100, budgetUsagePercent)}%` }}
          />
        </div>
      </div>

      {/* Category Budgets & Breakdown Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Category Expense Donut Chart */}
        <div className="p-6 clay-card">
          <h3 className="text-base font-extrabold text-[#3E2F26] dark:text-[#FAF4EE] flex items-center space-x-2 mb-1">
            <PieIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <span>Alokasi Pengeluaran per Kategori</span>
          </h3>
          <p className="text-xs text-[#8A796E] dark:text-[#BDB0A4] mb-4 font-medium">
            Komposisi biaya untuk evaluasi pola pengeluaran bulanan
          </p>

          {categoryExpenseData.length > 0 ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="w-44 h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryExpenseData}
                      dataKey="amount"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={68}
                      paddingAngle={4}
                    >
                      {categoryExpenseData.map((entry, index) => (
                        <Cell key={`fcell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val: any) => `Rp ${Number(val).toLocaleString('id-ID')}`} 
                      contentStyle={{ backgroundColor: '#2B2520', borderColor: '#3E352E', borderRadius: '1rem', color: '#fff', fontWeight: 'bold' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex-1 space-y-2 text-xs w-full">
                {categoryExpenseData.map((cat, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-2xl clay-card-sm">
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: cat.color }} />
                      <span className="font-bold text-[#3E2F26] dark:text-[#FAF4EE]">{cat.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-[#3E2F26] dark:text-[#FAF4EE]">Rp {cat.amount.toLocaleString('id-ID')}</div>
                      <div className="text-[10px] text-[#8A796E] dark:text-[#A8988D] font-medium">{cat.percentOfTotal.toFixed(0)}% total</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-xs text-[#8A796E] font-medium">
              Belum ada data pengeluaran di bulan ini
            </div>
          )}
        </div>

        {/* Category Budget Limits Progress */}
        <div className="p-6 clay-card">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-base font-extrabold text-[#3E2F26] dark:text-[#FAF4EE] flex items-center space-x-2">
              <Sliders className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <span>Batas Anggaran per Kategori</span>
            </h3>
            <button
              onClick={() => setIsSettingBudget(true)}
              className="text-xs text-orange-600 dark:text-orange-400 hover:underline font-extrabold"
            >
              Ubah Limit
            </button>
          </div>
          <p className="text-xs text-[#8A796E] dark:text-[#BDB0A4] mb-4 font-medium">
            Monitoring batas maksimal pengeluaran per pos biaya
          </p>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {expenseCategories.map((cat) => {
              const spent = monthTransactions
                .filter((t) => t.type === 'expense' && t.category === cat.id)
                .reduce((sum, t) => sum + t.amount, 0);
              const limit = budgetConfig.categoryBudgets[cat.id] || 0;
              const percent = limit > 0 ? (spent / limit) * 100 : 0;
              const isOver = limit > 0 && spent > limit;

              return (
                <div key={cat.id} className="space-y-1.5 p-2 rounded-2xl bg-[#F2E6DA] dark:bg-[#1C1816] border border-white/50 dark:border-white/5">
                  <div className="flex justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: cat.color }} />
                      <span className="font-extrabold text-[#3E2F26] dark:text-[#FAF4EE]">{cat.name}</span>
                    </div>
                    <div className="text-right">
                      <span className={`font-extrabold ${isOver ? 'text-rose-600' : 'text-[#3E2F26] dark:text-[#FAF4EE]'}`}>
                        Rp {spent.toLocaleString('id-ID')}
                      </span>
                      <span className="text-[#8A796E] font-medium">
                        {limit > 0 ? ` / Rp ${limit.toLocaleString('id-ID')}` : ' (No limit)'}
                      </span>
                    </div>
                  </div>
                  {limit > 0 && (
                    <div className="w-full bg-[#E5D7CA] dark:bg-[#2A231F] h-2 rounded-full overflow-hidden shadow-inner">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOver ? 'bg-rose-600' : percent >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, percent)}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Transactions History Bento Table */}
      <div className="p-6 clay-card">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-extrabold text-[#3E2F26] dark:text-[#FAF4EE]">Riwayat Transaksi Bulan Ini</h3>
            <p className="text-xs text-[#8A796E] dark:text-[#BDB0A4] font-medium">
              Total {filteredTransactions.length} transaksi tercatat
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Type selector */}
            <div className="flex p-1 rounded-2xl bg-[#E8DACB] dark:bg-[#1E1A17] text-xs shadow-inner">
              {(['all', 'expense', 'income'] as const).map((tp) => (
                <button
                  key={tp}
                  onClick={() => setSelectedType(tp)}
                  className={`px-3 py-1.5 rounded-xl font-extrabold capitalize transition ${
                    selectedType === tp
                      ? 'clay-button-primary shadow-sm text-white'
                      : 'text-[#6B5A4E] dark:text-[#BDB0A4] hover:text-[#3E2F26]'
                  }`}
                >
                  {tp === 'all' ? 'Semua' : tp === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
                </button>
              ))}
            </div>

            {/* Category dropdown */}
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="px-3.5 py-2 clay-button rounded-2xl text-xs font-extrabold text-[#3E2F26] dark:text-[#FAF4EE] focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Transactions list */}
        <div className="space-y-2.5">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12 text-xs text-[#8A796E] font-medium">
              Tidak ada catatan transaksi pada filter yang dipilih.
            </div>
          ) : (
            filteredTransactions.map((tx) => {
              const cat = getCategoryInfo(tx.category, tx.type);
              return (
                <div
                  key={tx.id}
                  id={`tx-card-${tx.id}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-2xl clay-card-sm transition gap-2.5 sm:gap-4"
                >
                  <div className="flex items-center space-x-3 sm:space-x-3.5 min-w-0 flex-1">
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center flex-shrink-0 border shadow-inner ${
                      tx.type === 'income'
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30'
                    }`}>
                      {tx.type === 'income' ? <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" /> : <ArrowDownRight className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <h4 className="text-xs sm:text-sm font-extrabold truncate text-[#3E2F26] dark:text-[#FAF4EE]">
                          {tx.title}
                        </h4>
                        <span
                          className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider border shadow-sm whitespace-nowrap"
                          style={{
                            backgroundColor: `${cat.color}20`,
                            borderColor: `${cat.color}40`,
                            color: cat.color,
                          }}
                        >
                          {cat.name}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 text-[10px] sm:text-[11px] text-[#8A796E] dark:text-[#BDB0A4] mt-0.5 font-medium">
                        <span>{new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                        <span>•</span>
                        <div className="flex items-center space-x-1">
                          {getPaymentIcon(tx.paymentMethod)}
                          <span className="capitalize">{tx.paymentMethod}</span>
                        </div>
                        {tx.notes && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-[120px] sm:max-w-[150px]">{tx.notes}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-2.5 sm:space-x-3 flex-shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-[#E8DACB] dark:border-white/5">
                    <div className="text-left sm:text-right">
                      <span className={`text-xs sm:text-sm font-black ${
                        tx.type === 'income'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {tx.type === 'income' ? '+' : '-'} Rp {tx.amount.toLocaleString('id-ID')}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => onEditTx(tx)}
                        title="Ubah Transaksi"
                        className="clay-button p-1.5 sm:p-2 rounded-xl text-amber-600 dark:text-amber-400"
                      >
                        <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteTx(tx.id)}
                        title="Hapus Transaksi"
                        className="clay-button p-1.5 sm:p-2 rounded-xl text-rose-600 dark:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal: Set Monthly Budget & Category Budgets */}
      {isSettingBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg clay-modal p-6 transition my-8">
            <h3 className="text-base font-extrabold text-[#3E2F26] dark:text-[#FAF4EE] mb-1">Pengaturan Batas Anggaran Bulanan</h3>
            <p className="text-xs text-[#8A796E] dark:text-[#BDB0A4] mb-4 font-medium">
              Tentukan target maksimal pengeluaran bulanan dan batas per kategori untuk sistem notifikasi otomatis.
            </p>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              
              {/* Total Monthly Budget */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider mb-1.5 text-[#8A796E] dark:text-[#BDB0A4]">
                  Target Total Anggaran Bulanan (Rp)
                </label>
                <input
                  type="number"
                  min="0"
                  value={tempTotalBudget}
                  onChange={(e) => setTempTotalBudget(Number(e.target.value))}
                  className="w-full px-4 py-3 clay-input text-sm font-extrabold text-[#3E2F26] dark:text-[#FAF4EE] focus:outline-none"
                />
              </div>

              {/* Threshold percent */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider mb-1.5 text-[#8A796E] dark:text-[#BDB0A4]">
                  Ambang Batas Peringatan Notifikasi (% Terpakai)
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min="50"
                    max="95"
                    step="5"
                    value={tempThreshold}
                    onChange={(e) => setTempThreshold(Number(e.target.value))}
                    className="flex-1 accent-orange-600 cursor-pointer"
                  />
                  <span className="font-black text-sm w-12 text-center text-orange-600 dark:text-orange-400">{tempThreshold}%</span>
                </div>
                <p className="text-[11px] text-[#8A796E] dark:text-[#A8988D] mt-1 font-medium">
                  Sistem akan mengirim push notification & pengingat suara saat pengeluaran menyentuh {tempThreshold}%.
                </p>
              </div>

              {/* Category Budgets */}
              <div className="pt-3 border-t border-[#E8DACB] dark:border-white/10">
                <label className="block text-xs font-extrabold uppercase tracking-wider mb-2 text-[#8A796E] dark:text-[#BDB0A4]">
                  Batas Maksimal per Kategori (Opsional)
                </label>
                <div className="space-y-2">
                  {expenseCategories.map((c) => (
                    <div key={c.id} className="flex items-center justify-between space-x-2 text-xs">
                      <div className="flex items-center space-x-2 w-40">
                        <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: c.color }} />
                        <span className="truncate font-bold text-[#3E2F26] dark:text-[#FAF4EE]">{c.name}</span>
                      </div>
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A796E] text-xs font-extrabold">Rp</span>
                        <input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={tempCategoryBudgets[c.id] || ''}
                          onChange={(e) => {
                            const val = e.target.value === '' ? 0 : Number(e.target.value);
                            setTempCategoryBudgets({
                              ...tempCategoryBudgets,
                              [c.id]: val,
                            });
                          }}
                          className="w-full pl-9 pr-3 py-2 clay-input text-xs font-extrabold text-[#3E2F26] dark:text-[#FAF4EE] focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#E8DACB] dark:border-white/10 mt-4">
              <button
                type="button"
                onClick={() => setIsSettingBudget(false)}
                className="clay-button px-4 py-2 rounded-2xl text-xs font-bold text-[#8A796E] dark:text-[#D4C7BC]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveBudgetConfig}
                className="clay-button-primary px-5 py-2.5 rounded-2xl text-xs font-extrabold"
              >
                Simpan Anggaran
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

