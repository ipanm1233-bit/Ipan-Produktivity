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
  Sparkles,
  Zap,
  RotateCcw,
  Layers,
  Calculator,
  Check,
  Bell,
  Clock,
  ShoppingBag,
  Wifi,
  ShieldCheck,
  Tv,
  AlertCircle
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip 
} from 'recharts';
import { Transaction, FinanceCategory, MonthlyBudgetConfig, RecurringBill, ExpenseGroup } from '../../types';
import { 
  calculateAutoCategoryBudgets, 
  calculateFromHistoricalSpending, 
  calculateExpenseGroupBreakdown,
  getBillDueStatus,
  getCategoryExpenseGroup,
  BUDGET_PRESETS, 
  BudgetDistributionPreset 
} from '../../utils/budgetCalculator';
import { BillReminderModal } from './BillReminderModal';
import confetti from 'canvas-confetti';

interface FinanceDashboardProps {
  transactions: Transaction[];
  categories: FinanceCategory[];
  budgetConfig: MonthlyBudgetConfig;
  bills: RecurringBill[];
  onUpdateBudget: (config: MonthlyBudgetConfig) => void;
  onSaveBill: (bill: RecurringBill) => void;
  onDeleteBill: (billId: string) => void;
  onToggleBillPaid: (bill: RecurringBill, isPaid: boolean, createTransaction: boolean) => void;
  onOpenNewTxModal: () => void;
  onEditTx: (tx: Transaction) => void;
  onDeleteTx: (id: string) => void;
  darkMode: boolean;
}

export const FinanceDashboard: React.FC<FinanceDashboardProps> = ({
  transactions,
  categories,
  budgetConfig,
  bills,
  onUpdateBudget,
  onSaveBill,
  onDeleteBill,
  onToggleBillPaid,
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
  const [selectedType, setSelectedType] = useState<'all' | 'routine' | 'daily' | 'income'>('all');
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [isSettingBudget, setIsSettingBudget] = useState(false);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);

  const [tempTotalBudget, setTempTotalBudget] = useState(budgetConfig.totalBudget);
  const [tempThreshold, setTempThreshold] = useState(budgetConfig.alertThresholdPercent || 80);
  const [tempCategoryBudgets, setTempCategoryBudgets] = useState<Record<string, number>>(
    budgetConfig.categoryBudgets || {}
  );
  const [autoDistributeEnabled, setAutoDistributeEnabled] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState<BudgetDistributionPreset>('smart_balanced');

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

  // Separated Routine vs Daily breakdown
  const groupBreakdown = calculateExpenseGroupBreakdown(
    categories,
    budgetConfig.categoryBudgets || {},
    transactions,
    selectedMonth
  );

  // Filtered transactions for table
  const filteredTransactions = monthTransactions.filter((t) => {
    if (selectedType === 'income' && t.type !== 'income') return false;
    if (selectedType === 'routine') {
      if (t.type !== 'expense') return false;
      const grp = t.expenseGroup || getCategoryExpenseGroup(categories.find((c) => c.id === t.category));
      if (grp !== 'routine') return false;
    }
    if (selectedType === 'daily') {
      if (t.type !== 'expense') return false;
      const grp = t.expenseGroup || getCategoryExpenseGroup(categories.find((c) => c.id === t.category));
      if (grp !== 'daily') return false;
    }
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

  // Helper to trigger recalculation
  const handleAutoDistribute = (
    total: number, 
    preset: BudgetDistributionPreset = selectedPreset,
    useHistory = false
  ) => {
    if (useHistory) {
      const calculated = calculateFromHistoricalSpending(total, expenseCategories, transactions);
      setTempCategoryBudgets(calculated);
    } else {
      const calculated = calculateAutoCategoryBudgets(total, expenseCategories, preset);
      setTempCategoryBudgets(calculated);
    }
  };

  const handleTotalBudgetChange = (newTotal: number) => {
    setTempTotalBudget(newTotal);
    if (autoDistributeEnabled) {
      handleAutoDistribute(newTotal, selectedPreset);
    }
  };

  // Open modal with fresh state
  const handleOpenBudgetModal = () => {
    const total = budgetConfig.totalBudget;
    setTempTotalBudget(total);
    setTempThreshold(budgetConfig.alertThresholdPercent || 80);
    
    const existing = budgetConfig.categoryBudgets || {};
    const hasExistingBudgets = Object.values(existing).some((v) => Number(v) > 0);
    if (hasExistingBudgets) {
      setTempCategoryBudgets(existing);
    } else if (total > 0) {
      const calculated = calculateAutoCategoryBudgets(total, expenseCategories, 'smart_balanced');
      setTempCategoryBudgets(calculated);
    } else {
      setTempCategoryBudgets({});
    }
    setIsSettingBudget(true);
  };

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

  // Urgent and upcoming bills
  const billStatuses = (bills || []).map((bill) => getBillDueStatus(bill));
  const unpaidBills = billStatuses.filter((s) => !s.isPaidThisMonth);
  const urgentBills = unpaidBills.filter((s) => s.status === 'overdue' || s.status === 'due_today' || s.status === 'due_soon');

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
                Pencatatan Keuangan & Anggaran Terpisah
              </span>
              <span className="text-[#8A796E]">•</span>
              <span className="text-[10px] text-[#8A796E] dark:text-[#BDB0A4] font-bold">{selectedMonth}</span>
            </div>
            <h2 className="text-xl font-extrabold text-[#3E2F26] dark:text-[#FAF4EE]">Dompet & Tagihan Rutin</h2>
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

          {/* Manage Recurring Bills Button */}
          <button
            id="open-bills-modal-btn"
            onClick={() => setIsBillModalOpen(true)}
            className="clay-button p-2.5 sm:px-4 sm:py-2.5 rounded-2xl text-xs font-extrabold flex items-center space-x-1.5 text-purple-700 dark:text-purple-400 border border-purple-300/40"
          >
            <Bell className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Pengingat Tagihan ({bills.length})</span>
          </button>

          {/* Setting Budget Target Button */}
          <button
            id="open-budget-settings-btn"
            onClick={handleOpenBudgetModal}
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

      {/* Urgent Bill Reminder Alert Banner (If Any Bills Due/Overdue) */}
      {urgentBills.length > 0 && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-purple-500/10 via-rose-500/10 to-amber-500/10 border-2 border-purple-500/30 dark:border-purple-500/20 backdrop-blur-sm shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md animate-pulse">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <span>Pengingat Tagihan Mendesak ({urgentBills.length})</span>
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Tagihan rutin yang perlu dibayar bulan ini
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsBillModalOpen(true)}
              className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
            >
              Lihat Semua
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {urgentBills.map((s) => (
              <div
                key={s.bill.id}
                className="clay-card-sm p-3.5 flex items-center justify-between gap-3 bg-white/70 dark:bg-neutral-900/70"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-gray-800 dark:text-white truncate">
                      {s.bill.title}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                      s.status === 'overdue'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                        : s.status === 'due_today'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                    }`}>
                      {s.statusText}
                    </span>
                  </div>
                  <p className="text-xs font-extrabold text-gray-700 dark:text-gray-200 mt-0.5">
                    Rp {s.bill.amount.toLocaleString('id-ID')}
                  </p>
                </div>

                <button
                  onClick={() => {
                    confetti({ particleCount: 30, spread: 40, origin: { y: 0.6 } });
                    onToggleBillPaid(s.bill, true, true);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-sm shrink-0"
                >
                  Bayar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

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
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8A796E] dark:text-[#BDB0A4]">Status Total Anggaran</span>
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

      {/* SEPARATED BUDGET CARDS: 1. POS RUTIN (KOS/TAGIHAN) & 2. POS SEHARI-HARI (MAKAN/HIBURAN) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CARD 1: PENGELUARAN RUTIN & TAGIHAN TETAP */}
        <div className="p-6 rounded-3xl clay-card border-2 border-purple-500/25 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200 dark:border-purple-800 shadow-inner shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  Pos Anggaran Wajib
                </span>
                <h3 className="text-base font-extrabold text-gray-800 dark:text-white">
                  Pengeluaran Rutin & Tagihan
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Kos, PLN/Listrik, WiFi, Cicilan, BPJS & Langganan
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsBillModalOpen(true)}
              className="clay-button px-3 py-1.5 rounded-xl text-xs font-bold text-purple-600 dark:text-purple-400 shrink-0 flex items-center gap-1"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Jadwal Tagihan</span>
            </button>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5 bg-purple-50/50 dark:bg-purple-950/20 p-3.5 rounded-2xl border border-purple-100 dark:border-purple-900/30">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-gray-600 dark:text-gray-300">
                Terpakai: Rp {groupBreakdown.routine.spent.toLocaleString('id-ID')}
              </span>
              <span className="text-purple-700 dark:text-purple-300">
                Alokasi: Rp {groupBreakdown.routine.budgetAllocated.toLocaleString('id-ID')} ({groupBreakdown.routine.percentUsed}%)
              </span>
            </div>

            <div className="w-full bg-purple-200/50 dark:bg-neutral-800 h-3 rounded-full overflow-hidden shadow-inner p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  groupBreakdown.routine.isOverBudget
                    ? 'bg-rose-600 shadow-[0_2px_8px_rgba(225,29,72,0.4)]'
                    : 'bg-gradient-to-r from-purple-500 to-indigo-600'
                }`}
                style={{ width: `${Math.min(100, groupBreakdown.routine.percentUsed)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 pt-0.5">
              <span>Sisa Alokasi: Rp {groupBreakdown.routine.remaining.toLocaleString('id-ID')}</span>
              <span>{groupBreakdown.routine.categories.length} Kategori Rutin</span>
            </div>
          </div>

          {/* Sub Categories list for Routine */}
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {groupBreakdown.routine.categories.map(({ category: cat, budget, spent, percentUsed }) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/60 dark:bg-neutral-900/60 border border-gray-100 dark:border-white/5 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="font-bold text-gray-700 dark:text-gray-300">{cat.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-gray-800 dark:text-white">
                    Rp {spent.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[10px] text-gray-500 ml-1">
                    / {budget > 0 ? `Rp ${budget.toLocaleString('id-ID')}` : 'Belum diset'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CARD 2: PENGELUARAN FLEKSIBEL SEHARI-HARI */}
        <div className="p-6 rounded-3xl clay-card border-2 border-orange-500/25 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-200 dark:border-orange-800 shadow-inner shrink-0">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                  Pos Anggaran Fleksibel
                </span>
                <h3 className="text-base font-extrabold text-gray-800 dark:text-white">
                  Pengeluaran Sehari-hari
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Makan & Minum, Bensin, Belanja, Hiburan, Medis
                </p>
              </div>
            </div>

            <button
              onClick={onOpenNewTxModal}
              className="clay-button-primary px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Catat Harian</span>
            </button>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5 bg-orange-50/50 dark:bg-orange-950/20 p-3.5 rounded-2xl border border-orange-100 dark:border-orange-900/30">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-gray-600 dark:text-gray-300">
                Terpakai: Rp {groupBreakdown.daily.spent.toLocaleString('id-ID')}
              </span>
              <span className="text-orange-700 dark:text-orange-300">
                Alokasi: Rp {groupBreakdown.daily.budgetAllocated.toLocaleString('id-ID')} ({groupBreakdown.daily.percentUsed}%)
              </span>
            </div>

            <div className="w-full bg-orange-200/50 dark:bg-neutral-800 h-3 rounded-full overflow-hidden shadow-inner p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  groupBreakdown.daily.isOverBudget
                    ? 'bg-rose-600 shadow-[0_2px_8px_rgba(225,29,72,0.4)]'
                    : 'bg-gradient-to-r from-orange-500 to-amber-500'
                }`}
                style={{ width: `${Math.min(100, groupBreakdown.daily.percentUsed)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 pt-0.5">
              <span>Sisa Alokasi: Rp {groupBreakdown.daily.remaining.toLocaleString('id-ID')}</span>
              <span>{groupBreakdown.daily.categories.length} Kategori Harian</span>
            </div>
          </div>

          {/* Sub Categories list for Daily */}
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {groupBreakdown.daily.categories.map(({ category: cat, budget, spent, percentUsed }) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/60 dark:bg-neutral-900/60 border border-gray-100 dark:border-white/5 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="font-bold text-gray-700 dark:text-gray-300">{cat.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-gray-800 dark:text-white">
                    Rp {spent.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[10px] text-gray-500 ml-1">
                    / {budget > 0 ? `Rp ${budget.toLocaleString('id-ID')}` : 'Belum diset'}
                  </span>
                </div>
              </div>
            ))}
          </div>
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
              onClick={handleOpenBudgetModal}
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
                      <span className="font-extrabold text-[#3E2F26] dark:text-[#FAF4EE]">
                        {cat.name} {cat.expenseGroup ? `(${cat.expenseGroup === 'routine' ? 'Rutin' : 'Harian'})` : ''}
                      </span>
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
              {[
                { id: 'all', label: 'Semua' },
                { id: 'routine', label: 'Pos Rutin (Kos/Tagihan)' },
                { id: 'daily', label: 'Pos Harian' },
                { id: 'income', label: 'Pemasukan' },
              ].map((tp) => (
                <button
                  key={tp.id}
                  onClick={() => setSelectedType(tp.id as any)}
                  className={`px-3 py-1.5 rounded-xl font-extrabold capitalize transition ${
                    selectedType === tp.id
                      ? 'clay-button-primary shadow-sm text-white'
                      : 'text-[#6B5A4E] dark:text-[#BDB0A4] hover:text-[#3E2F26]'
                  }`}
                >
                  {tp.label}
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
              const txGroup = tx.expenseGroup || (tx.type === 'expense' ? getCategoryExpenseGroup(categories.find((c) => c.id === tx.category)) : null);

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
                        : txGroup === 'routine'
                        ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30'
                        : 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30'
                    }`}>
                      {tx.type === 'income' ? (
                        <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : txGroup === 'routine' ? (
                        <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
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
                        {txGroup === 'routine' && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-300/40">
                            Rutin / Tagihan
                          </span>
                        )}
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
                          : txGroup === 'routine'
                          ? 'text-purple-600 dark:text-purple-400'
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

      {/* Bill Reminder Modal */}
      <BillReminderModal
        isOpen={isBillModalOpen}
        onClose={() => setIsBillModalOpen(false)}
        bills={bills}
        categories={categories}
        onSaveBill={onSaveBill}
        onDeleteBill={onDeleteBill}
        onTogglePaidStatus={onToggleBillPaid}
      />

      {/* Modal: Set Monthly Budget with Auto-Calculation & Distribution */}
      {isSettingBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-xl clay-modal p-5 sm:p-6 transition my-6 shadow-2xl border border-white/40 dark:border-white/10">
            
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-[#E8DACB] dark:border-white/10 mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-2xl bg-orange-100 dark:bg-orange-950/70 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-200 dark:border-orange-800 shadow-inner flex-shrink-0">
                  <Calculator className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#3E2F26] dark:text-[#FAF4EE]">
                    Pengaturan Anggaran & Pembagian Otomatis
                  </h3>
                  <p className="text-[11px] sm:text-xs text-[#8A796E] dark:text-[#BDB0A4] font-medium">
                    Sistem otomatis mengalokasikan pos rutin (kos/tagihan) dan pos fleksibel harian secara proporsional.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 max-h-[72vh] overflow-y-auto pr-1">
              
              {/* Total Monthly Budget Input & Quick Buttons */}
              <div className="p-4 rounded-2xl bg-[#EDE0D2]/70 dark:bg-[#1E1A17] border border-[#D8C7B8] dark:border-white/5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black uppercase tracking-wider text-[#3E2F26] dark:text-[#FAF4EE]">
                    Target Total Anggaran Bulanan
                  </label>
                  <span className="text-xs font-black text-orange-600 dark:text-orange-400">
                    Rp {Number(tempTotalBudget || 0).toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-black text-orange-600 dark:text-orange-400">
                    Rp
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="50000"
                    placeholder="Contoh: 5000000"
                    value={tempTotalBudget || ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? 0 : Number(e.target.value);
                      handleTotalBudgetChange(val);
                    }}
                    className="w-full pl-11 pr-4 py-3 clay-input text-base sm:text-lg font-black text-[#3E2F26] dark:text-[#FAF4EE] focus:outline-none"
                  />
                </div>

                {/* Quick Budget Chips */}
                <div className="flex items-center flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8A796E] dark:text-[#A8988D] mr-1">
                    Pilihan Cepat:
                  </span>
                  {[
                    { label: 'Rp 2 Jt', val: 2000000 },
                    { label: 'Rp 3.5 Jt', val: 3500000 },
                    { label: 'Rp 5 Jt', val: 5000000 },
                    { label: 'Rp 7.5 Jt', val: 7500000 },
                    { label: 'Rp 10 Jt', val: 10000000 },
                    { label: 'Rp 15 Jt', val: 15000000 },
                  ].map((chip) => (
                    <button
                      key={chip.val}
                      type="button"
                      onClick={() => handleTotalBudgetChange(chip.val)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-black transition ${
                        tempTotalBudget === chip.val
                          ? 'clay-button-primary shadow-sm'
                          : 'clay-button text-[#5A453A] dark:text-[#D4C7BC]'
                      }`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Smart Auto Distribution Model Selection */}
              <div className="p-4 rounded-2xl bg-[#F0E4D7] dark:bg-[#1A1715] border border-orange-200/60 dark:border-orange-900/30 space-y-3 shadow-inner">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    <span className="text-xs font-extrabold text-[#3E2F26] dark:text-[#FAF4EE]">
                      Model Pembagian Cerdas Otomatis
                    </span>
                  </div>

                  {/* Auto-calculate checkbox */}
                  <label className="flex items-center space-x-2 cursor-pointer text-xs font-bold text-[#6B5A4E] dark:text-[#BDB0A4]">
                    <input
                      type="checkbox"
                      checked={autoDistributeEnabled}
                      onChange={(e) => setAutoDistributeEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 accent-orange-600 cursor-pointer"
                    />
                    <span className="text-[11px]">Hitung otomatis saat ketik</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {BUDGET_PRESETS.map((preset) => {
                    const isSelected = selectedPreset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setSelectedPreset(preset.id);
                          handleAutoDistribute(tempTotalBudget, preset.id);
                        }}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl text-center transition-all ${
                          isSelected
                            ? 'clay-button-primary scale-[1.02] shadow-sm'
                            : 'clay-button opacity-75 hover:opacity-100 text-[#3E2F26] dark:text-[#FAF4EE]'
                        }`}
                      >
                        <span className="text-xs font-black truncate w-full">{preset.badge}</span>
                        <span className={`text-[9px] font-semibold truncate w-full ${isSelected ? 'text-white/90' : 'text-[#8A796E] dark:text-[#A8988D]'}`}>
                          {preset.name}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Option to use historical spending if transactions exist */}
                {transactions.some((t) => t.type === 'expense') && (
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => handleAutoDistribute(tempTotalBudget, selectedPreset, true)}
                      className="text-[11px] font-extrabold text-orange-600 dark:text-orange-400 hover:underline flex items-center space-x-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5 inline" />
                      <span>Bagi Proporsional Berdasarkan Riwayat Transaksi Nyata</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAutoDistribute(tempTotalBudget, selectedPreset)}
                      className="clay-button px-3 py-1.5 rounded-xl text-[10px] font-black text-orange-600 dark:text-orange-400 flex items-center space-x-1"
                    >
                      <Zap className="w-3 h-3" />
                      <span>Bagi Ulang</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Live Allocation Summary Progress Bar */}
              {(() => {
                const totalAllocated = expenseCategories.reduce(
                  (sum, c) => sum + (tempCategoryBudgets[c.id] || 0),
                  0
                );
                const target = tempTotalBudget || 0;
                const allocatedPercent = target > 0 ? (totalAllocated / target) * 100 : 0;
                const diff = target - totalAllocated;
                const isExact = diff === 0 && target > 0;
                const isOver = diff < 0;

                return (
                  <div className="p-3.5 rounded-2xl bg-[#EDE0D2]/50 dark:bg-[#201C19] border border-[#D8C7B8]/60 dark:border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-[#8A796E] dark:text-[#BDB0A4]">
                        Total Terbagi ke Kategori:
                      </span>
                      <div className="text-right">
                        <span className={`font-black ${isOver ? 'text-rose-600' : isExact ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#3E2F26] dark:text-[#FAF4EE]'}`}>
                          Rp {totalAllocated.toLocaleString('id-ID')}
                        </span>
                        <span className="text-[10px] text-[#8A796E] ml-1">
                          ({allocatedPercent.toFixed(0)}%)
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-[#E5D7CA] dark:bg-[#2A231F] h-2.5 rounded-full overflow-hidden shadow-inner">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOver ? 'bg-rose-600' : isExact ? 'bg-emerald-500' : 'bg-orange-500'
                        }`}
                        style={{ width: `${Math.min(100, allocatedPercent)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      {isExact ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center space-x-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>100% Sempurna Teralokasikan</span>
                        </span>
                      ) : isOver ? (
                        <span className="text-rose-600 font-extrabold flex items-center space-x-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Melebihi target Rp {Math.abs(diff).toLocaleString('id-ID')}</span>
                        </span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 font-extrabold">
                          Sisa belum terbagi: Rp {diff.toLocaleString('id-ID')}
                        </span>
                      )}
                      
                      <span className="text-[10px] text-[#8A796E] font-medium">
                        Target: Rp {target.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Per-Category Calculated Amounts */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black uppercase tracking-wider text-[#8A796E] dark:text-[#BDB0A4]">
                    Rincian Pembagian per Kategori Pengeluaran
                  </label>
                  <span className="text-[10px] text-[#8A796E] font-semibold">
                    (Bisa disesuaikan manual)
                  </span>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {expenseCategories.map((c) => {
                    const currentAmt = tempCategoryBudgets[c.id] || 0;
                    const catPercent = tempTotalBudget > 0 ? (currentAmt / tempTotalBudget) * 100 : 0;
                    const grp = getCategoryExpenseGroup(c);

                    return (
                      <div
                        key={c.id}
                        className="p-3 rounded-2xl bg-[#FAF3EC] dark:bg-[#201C19] border border-white/70 dark:border-white/5 space-y-2 shadow-sm transition hover:border-orange-300 dark:hover:border-orange-800"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <span
                              className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-sm"
                              style={{ backgroundColor: c.color }}
                            />
                            <div className="truncate">
                              <span className="font-black text-xs text-[#3E2F26] dark:text-[#FAF4EE] block truncate">
                                {c.name}
                              </span>
                              <span className="text-[9px] text-gray-500 uppercase font-bold">
                                {grp === 'routine' ? 'Pos Rutin / Tagihan' : 'Pos Sehari-hari'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 flex-shrink-0">
                            {/* Percentage badge */}
                            <span
                              className="px-2 py-0.5 rounded-full text-[10px] font-black border shadow-sm"
                              style={{
                                backgroundColor: `${c.color}15`,
                                borderColor: `${c.color}35`,
                                color: c.color,
                              }}
                            >
                              {catPercent.toFixed(0)}%
                            </span>

                            {/* Direct Rupiah Input */}
                            <div className="relative w-36 sm:w-44">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#8A796E]">
                                Rp
                              </span>
                              <input
                                type="number"
                                min="0"
                                step="10000"
                                placeholder="0"
                                value={tempCategoryBudgets[c.id] !== undefined ? tempCategoryBudgets[c.id] : ''}
                                onChange={(e) => {
                                  const val = e.target.value === '' ? 0 : Number(e.target.value);
                                  setTempCategoryBudgets({
                                    ...tempCategoryBudgets,
                                    [c.id]: val,
                                  });
                                }}
                                className="w-full pl-8 pr-2.5 py-1.5 clay-input text-xs font-black text-[#3E2F26] dark:text-[#FAF4EE] focus:outline-none text-right"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Interactive percentage quick slider */}
                        {tempTotalBudget > 0 && (
                          <div className="flex items-center space-x-2 pt-0.5">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              step="1"
                              value={Math.min(100, Math.round(catPercent))}
                              onChange={(e) => {
                                const newPct = Number(e.target.value);
                                const newAmt = Math.round(((tempTotalBudget * newPct) / 100) / 5000) * 5000;
                                setTempCategoryBudgets({
                                  ...tempCategoryBudgets,
                                  [c.id]: newAmt,
                                });
                              }}
                              className="w-full accent-orange-600 cursor-pointer h-1.5 bg-[#E5D7CA] dark:bg-[#2A231F] rounded-lg"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Notification Threshold */}
              <div className="pt-3 border-t border-[#E8DACB] dark:border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black uppercase tracking-wider text-[#8A796E] dark:text-[#BDB0A4]">
                    Ambang Batas Peringatan Notifikasi (% Terpakai)
                  </label>
                  <span className="font-black text-sm text-orange-600 dark:text-orange-400">
                    {tempThreshold}%
                  </span>
                </div>
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
                </div>
                <p className="text-[10px] text-[#8A796E] dark:text-[#A8988D] font-medium">
                  Sistem akan mengirim push notification & pengingat suara di HP saat pengeluaran menyentuh {tempThreshold}%.
                </p>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#E8DACB] dark:border-white/10 mt-4">
              <button
                type="button"
                onClick={() => setIsSettingBudget(false)}
                className="clay-button px-4 py-2.5 rounded-2xl text-xs font-bold text-[#8A796E] dark:text-[#D4C7BC]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveBudgetConfig}
                className="clay-button-primary px-6 py-2.5 rounded-2xl text-xs font-black flex items-center space-x-1.5 shadow-lg shadow-orange-500/20"
              >
                <Check className="w-4 h-4" />
                <span>Simpan Anggaran</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};



