import { FinanceCategory, Transaction, RecurringBill, ExpenseGroup } from '../types';

export type BudgetDistributionPreset = 'smart_balanced' | 'priority_needs' | 'lifestyle_flexible' | 'equal_split';

export interface PresetInfo {
  id: BudgetDistributionPreset;
  name: string;
  badge: string;
  description: string;
  ratios: Record<string, number>; // fallback ratios by category id or keyword
}

export interface GroupBudgetSummary {
  group: ExpenseGroup;
  title: string;
  description: string;
  budgetAllocated: number;
  spent: number;
  remaining: number;
  percentUsed: number;
  isOverBudget: boolean;
  categories: {
    category: FinanceCategory;
    budget: number;
    spent: number;
    percentUsed: number;
  }[];
}

export interface BillDueStatus {
  bill: RecurringBill;
  isPaidThisMonth: boolean;
  dueDateString: string; // e.g. "2026-08-05"
  daysRemaining: number; // e.g. -2 (overdue), 0 (today), 3 (3 days left)
  status: 'paid' | 'overdue' | 'due_today' | 'due_soon' | 'upcoming';
  statusText: string;
  urgencyColor: 'emerald' | 'rose' | 'amber' | 'blue' | 'gray';
}

export const BUDGET_PRESETS: PresetInfo[] = [
  {
    id: 'smart_balanced',
    name: 'Rasio Seimbang TaskPan (50/30/20)',
    badge: 'Rekomendasi',
    description: 'Alokasi terstruktur: ~45% Pos Rutin (Kos, PLN, Internet, BPJS) & ~55% Pos Sehari-hari (Makan, Belanja, Hiburan).',
    ratios: {
      kos: 0.25,
      bills: 0.08,
      internet: 0.06,
      installments: 0.06,
      subscriptions: 0.03,
      food: 0.26,
      transport: 0.09,
      shopping: 0.09,
      entertainment: 0.05,
      health_exp: 0.03,
    },
  },
  {
    id: 'priority_needs',
    name: 'Fokus Kebutuhan & Hemat',
    badge: 'Mode Hemat',
    description: 'Prioritas tinggi pada kos, tagihan wajib, dan makanan pokok, menekan belanja dan hiburan.',
    ratios: {
      kos: 0.28,
      bills: 0.10,
      internet: 0.06,
      installments: 0.06,
      subscriptions: 0.02,
      food: 0.30,
      transport: 0.08,
      shopping: 0.05,
      health_exp: 0.03,
      entertainment: 0.02,
    },
  },
  {
    id: 'lifestyle_flexible',
    name: 'Gaya Hidup & Fleksibel',
    badge: 'Fleksibel',
    description: 'Alokasi lebih leluasa untuk eksplorasi kuliner, kafe, hiburan, dan belanja santai.',
    ratios: {
      kos: 0.22,
      bills: 0.07,
      internet: 0.05,
      installments: 0.05,
      subscriptions: 0.04,
      food: 0.25,
      shopping: 0.14,
      entertainment: 0.10,
      transport: 0.05,
      health_exp: 0.03,
    },
  },
  {
    id: 'equal_split',
    name: 'Bagi Rata ke Seluruh Kategori',
    badge: 'Rata Sama',
    description: 'Membagi total anggaran dalam porsi yang sama besar ke setiap kategori pengeluaran.',
    ratios: {},
  },
];

/**
 * Determine if category belongs to routine (fixed/recurring) or daily (lifestyle/variable)
 */
export function getCategoryExpenseGroup(category?: FinanceCategory | null): ExpenseGroup {
  if (!category) return 'daily';
  if (category.expenseGroup) return category.expenseGroup;
  
  const idLower = category.id.toLowerCase();
  const nameLower = category.name.toLowerCase();
  if (
    idLower === 'kos' ||
    idLower === 'bills' ||
    idLower === 'internet' ||
    idLower === 'installments' ||
    idLower === 'subscriptions' ||
    nameLower.includes('kos') ||
    nameLower.includes('tagihan') ||
    nameLower.includes('listrik') ||
    nameLower.includes('pln') ||
    nameLower.includes('wifi') ||
    nameLower.includes('bpjs') ||
    nameLower.includes('cicilan') ||
    nameLower.includes('langganan')
  ) {
    return 'routine';
  }
  return 'daily';
}

/**
 * Calculates budget, spending, and breakdown separated into:
 * 1. Routine expenses (Kos, Tagihan PLN/Air, Internet, Cicilan, Langganan)
 * 2. Daily expenses (Makan/Minum, Belanja, Bensin/Transport, Hiburan, Medis)
 */
export function calculateExpenseGroupBreakdown(
  categories: FinanceCategory[],
  categoryBudgets: Record<string, number>,
  transactions: Transaction[],
  selectedMonthYear: string // "YYYY-MM"
): {
  routine: GroupBudgetSummary;
  daily: GroupBudgetSummary;
  totalBudget: number;
  totalSpent: number;
  overallPercentUsed: number;
} {
  const expenseCategories = categories.filter((c) => c.type === 'expense');

  // Filter transactions by selected month
  const monthTransactions = transactions.filter((t) => {
    return t.type === 'expense' && t.date.startsWith(selectedMonthYear);
  });

  const catSpendingMap: Record<string, number> = {};
  monthTransactions.forEach((t) => {
    catSpendingMap[t.category] = (catSpendingMap[t.category] || 0) + t.amount;
  });

  const routineCats: FinanceCategory[] = [];
  const dailyCats: FinanceCategory[] = [];

  expenseCategories.forEach((c) => {
    const group = getCategoryExpenseGroup(c);
    if (group === 'routine') {
      routineCats.push(c);
    } else {
      dailyCats.push(c);
    }
  });

  const buildSummary = (
    group: ExpenseGroup,
    title: string,
    description: string,
    cats: FinanceCategory[]
  ): GroupBudgetSummary => {
    let budgetAllocated = 0;
    let spent = 0;

    const catDetails = cats.map((c) => {
      const b = categoryBudgets[c.id] || c.budgetLimit || 0;
      const s = catSpendingMap[c.id] || 0;
      budgetAllocated += b;
      spent += s;
      return {
        category: c,
        budget: b,
        spent: s,
        percentUsed: b > 0 ? Math.round((s / b) * 100) : 0,
      };
    });

    const percentUsed = budgetAllocated > 0 ? Math.round((spent / budgetAllocated) * 100) : 0;
    const remaining = Math.max(0, budgetAllocated - spent);
    const isOverBudget = spent > budgetAllocated && budgetAllocated > 0;

    return {
      group,
      title,
      description,
      budgetAllocated,
      spent,
      remaining,
      percentUsed,
      isOverBudget,
      categories: catDetails,
    };
  };

  const routineSummary = buildSummary(
    'routine',
    'Pengeluaran Rutin & Tagihan Tetap',
    'Sewa kos, listrik PLN, WiFi, BPJS, cicilan, dan langganan bulanan',
    routineCats
  );

  const dailySummary = buildSummary(
    'daily',
    'Pengeluaran Fleksibel Sehari-hari',
    'Makan & minum, belanja kebutuhan, transportasi/bensin, hiburan & kafe',
    dailyCats
  );

  const totalBudget = routineSummary.budgetAllocated + dailySummary.budgetAllocated;
  const totalSpent = routineSummary.spent + dailySummary.spent;
  const overallPercentUsed = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  return {
    routine: routineSummary,
    daily: dailySummary,
    totalBudget,
    totalSpent,
    overallPercentUsed,
  };
}

/**
 * Calculates current month status for a recurring bill
 */
export function getBillDueStatus(
  bill: RecurringBill,
  currentDate = new Date()
): BillDueStatus {
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-indexed
  const currentDay = currentDate.getDate();

  const yearMonth = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  const isPaidThisMonth = (bill.paidMonths || []).includes(yearMonth);

  // Due date for current month
  // Handle edge cases where day is 31 but month has 30 or 28 days
  const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const actualDueDay = Math.min(bill.dueDateDay, daysInCurrentMonth);
  const dueDate = new Date(currentYear, currentMonth, actualDueDay);
  const dueDateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(actualDueDay).padStart(2, '0')}`;

  const diffTime = dueDate.getTime() - new Date(currentYear, currentMonth, currentDay).getTime();
  const daysRemaining = Math.round(diffTime / (1000 * 60 * 60 * 24));

  let status: BillDueStatus['status'] = 'upcoming';
  let statusText = `Jatuh tempo tgl ${actualDueDay}`;
  let urgencyColor: BillDueStatus['urgencyColor'] = 'blue';

  if (isPaidThisMonth) {
    status = 'paid';
    statusText = 'Lunas Bulan Ini';
    urgencyColor = 'emerald';
  } else if (daysRemaining < 0) {
    status = 'overdue';
    statusText = `Lewat ${Math.abs(daysRemaining)} hari!`;
    urgencyColor = 'rose';
  } else if (daysRemaining === 0) {
    status = 'due_today';
    statusText = 'Jatuh tempo HARI INI!';
    urgencyColor = 'rose';
  } else if (daysRemaining <= (bill.reminderDaysBefore || 3)) {
    status = 'due_soon';
    statusText = `${daysRemaining} hari lagi (H-${daysRemaining})`;
    urgencyColor = 'amber';
  } else {
    status = 'upcoming';
    statusText = `${daysRemaining} hari lagi`;
    urgencyColor = 'blue';
  }

  return {
    bill,
    isPaidThisMonth,
    dueDateString,
    daysRemaining,
    status,
    statusText,
    urgencyColor,
  };
}

/**
 * Intelligently distributes a total budget across expense categories.
 */
export function calculateAutoCategoryBudgets(
  totalBudget: number,
  expenseCategories: FinanceCategory[],
  presetId: BudgetDistributionPreset = 'smart_balanced'
): Record<string, number> {
  if (!totalBudget || totalBudget <= 0 || expenseCategories.length === 0) {
    const empty: Record<string, number> = {};
    expenseCategories.forEach((c) => {
      empty[c.id] = 0;
    });
    return empty;
  }

  const preset = BUDGET_PRESETS.find((p) => p.id === presetId) || BUDGET_PRESETS[0];

  let rawWeights: Record<string, number> = {};

  if (presetId === 'equal_split') {
    const equalWeight = 1 / expenseCategories.length;
    expenseCategories.forEach((c) => {
      rawWeights[c.id] = equalWeight;
    });
  } else {
    let totalRawWeight = 0;
    expenseCategories.forEach((c) => {
      let weight = preset.ratios[c.id];

      if (weight === undefined) {
        const lower = c.name.toLowerCase();
        if (lower.includes('kos') || lower.includes('kost') || lower.includes('kontrakan')) {
          weight = 0.25;
        } else if (lower.includes('makan') || lower.includes('food') || lower.includes('kuliner')) {
          weight = 0.25;
        } else if (lower.includes('tagihan') || lower.includes('listrik') || lower.includes('pln')) {
          weight = 0.08;
        } else if (lower.includes('wifi') || lower.includes('internet')) {
          weight = 0.06;
        } else if (lower.includes('bpjs') || lower.includes('cicilan') || lower.includes('asuransi')) {
          weight = 0.06;
        } else if (lower.includes('belanja') || lower.includes('shop') || lower.includes('kebutuhan')) {
          weight = 0.10;
        } else if (lower.includes('transport') || lower.includes('bensin') || lower.includes('kendaraan')) {
          weight = 0.08;
        } else if (lower.includes('hiburan') || lower.includes('ent') || lower.includes('jalan') || lower.includes('hobi')) {
          weight = 0.07;
        } else if (lower.includes('sehat') || lower.includes('obat') || lower.includes('health') || lower.includes('medis')) {
          weight = 0.05;
        } else {
          weight = 0.05;
        }
      }

      rawWeights[c.id] = weight;
      totalRawWeight += weight;
    });

    if (totalRawWeight > 0) {
      expenseCategories.forEach((c) => {
        rawWeights[c.id] = rawWeights[c.id] / totalRawWeight;
      });
    }
  }

  const result: Record<string, number> = {};
  let totalAllocated = 0;
  let maxCatId = expenseCategories[0].id;
  let maxVal = -1;

  expenseCategories.forEach((c) => {
    const share = rawWeights[c.id] || (1 / expenseCategories.length);
    let roundedAmount = Math.round((totalBudget * share) / 5000) * 5000;
    result[c.id] = roundedAmount;
    totalAllocated += roundedAmount;

    if (roundedAmount > maxVal) {
      maxVal = roundedAmount;
      maxCatId = c.id;
    }
  });

  const diff = totalBudget - totalAllocated;
  if (diff !== 0 && result[maxCatId] !== undefined) {
    result[maxCatId] = Math.max(0, result[maxCatId] + diff);
  }

  return result;
}

/**
 * Calculates category budget distribution based on previous months' spending ratios.
 */
export function calculateFromHistoricalSpending(
  totalBudget: number,
  expenseCategories: FinanceCategory[],
  transactions: Transaction[]
): Record<string, number> {
  if (!totalBudget || totalBudget <= 0 || expenseCategories.length === 0) {
    return calculateAutoCategoryBudgets(totalBudget, expenseCategories, 'smart_balanced');
  }

  const spendingByCat: Record<string, number> = {};
  let totalSpent = 0;

  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      spendingByCat[t.category] = (spendingByCat[t.category] || 0) + t.amount;
      totalSpent += t.amount;
    });

  if (totalSpent === 0) {
    return calculateAutoCategoryBudgets(totalBudget, expenseCategories, 'smart_balanced');
  }

  const result: Record<string, number> = {};
  let totalAllocated = 0;
  let maxCatId = expenseCategories[0].id;
  let maxVal = -1;

  expenseCategories.forEach((c) => {
    const catSpent = spendingByCat[c.id] || 0;
    const ratio = catSpent > 0 ? catSpent / totalSpent : 1 / (expenseCategories.length * 2);
    let roundedAmount = Math.round((totalBudget * ratio) / 5000) * 5000;
    result[c.id] = roundedAmount;
    totalAllocated += roundedAmount;

    if (roundedAmount > maxVal) {
      maxVal = roundedAmount;
      maxCatId = c.id;
    }
  });

  const diff = totalBudget - totalAllocated;
  if (diff !== 0 && result[maxCatId] !== undefined) {
    result[maxCatId] = Math.max(0, result[maxCatId] + diff);
  }

  return result;
}

