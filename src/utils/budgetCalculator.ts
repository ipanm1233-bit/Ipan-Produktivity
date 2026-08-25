import { FinanceCategory, Transaction } from '../types';

export type BudgetDistributionPreset = 'smart_balanced' | 'priority_needs' | 'lifestyle_flexible' | 'equal_split';

export interface PresetInfo {
  id: BudgetDistributionPreset;
  name: string;
  badge: string;
  description: string;
  ratios: Record<string, number>; // fallback ratios by category id or keyword
}

export const BUDGET_PRESETS: PresetInfo[] = [
  {
    id: 'smart_balanced',
    name: 'Rasio Seimbang TaskPan',
    badge: 'Rekomendasi (50/30/20)',
    description: 'Proporsi seimbang untuk kebutuhan pokok (makanan, tagihan, transportasi) dan gaya hidup.',
    ratios: {
      food: 0.30, // 30% Makanan & Minuman
      bills: 0.20, // 20% Tagihan & Utilitas
      shopping: 0.20, // 20% Belanja & Kebutuhan
      transport: 0.12, // 12% Transportasi & Bensin
      entertainment: 0.10, // 10% Hiburan & Langganan
      health_exp: 0.08, // 8% Kesehatan & Obat
    },
  },
  {
    id: 'priority_needs',
    name: 'Fokus Kebutuhan & Hemat',
    badge: 'Mode Hemat',
    description: 'Prioritas tinggi pada makanan dan tagihan wajib, menekan biaya belanja konsumtif & hiburan.',
    ratios: {
      food: 0.35,
      bills: 0.25,
      transport: 0.15,
      shopping: 0.12,
      health_exp: 0.08,
      entertainment: 0.05,
    },
  },
  {
    id: 'lifestyle_flexible',
    name: 'Gaya Hidup & Fleksibel',
    badge: 'Fleksibel',
    description: 'Alokasi lebih leluasa untuk belanja, hiburan, dan eksplorasi kuliner.',
    ratios: {
      food: 0.25,
      shopping: 0.22,
      entertainment: 0.18,
      bills: 0.15,
      transport: 0.12,
      health_exp: 0.08,
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
 * Intelligently distributes a total budget across expense categories.
 * Ensures clean rounding and guarantees that the sum of category budgets
 * matches the total budget exactly.
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
    // 1. Assign weight based on preset ratios or fallback keywords
    let totalRawWeight = 0;
    expenseCategories.forEach((c) => {
      let weight = preset.ratios[c.id];

      if (weight === undefined) {
        // Fallback matching by name keyword
        const lower = c.name.toLowerCase();
        if (lower.includes('makan') || lower.includes('food') || lower.includes('kuliner')) {
          weight = 0.30;
        } else if (lower.includes('tagihan') || lower.includes('listrik') || lower.includes('wifi') || lower.includes('bill')) {
          weight = 0.20;
        } else if (lower.includes('belanja') || lower.includes('shop') || lower.includes('kebutuhan')) {
          weight = 0.18;
        } else if (lower.includes('transport') || lower.includes('bensin') || lower.includes('kendaraan')) {
          weight = 0.12;
        } else if (lower.includes('hiburan') || lower.includes('ent') || lower.includes('jalan') || lower.includes('hobi')) {
          weight = 0.10;
        } else if (lower.includes('sehat') || lower.includes('obat') || lower.includes('health') || lower.includes('medis')) {
          weight = 0.08;
        } else {
          weight = 0.10; // default weight for generic custom category
        }
      }

      rawWeights[c.id] = weight;
      totalRawWeight += weight;
    });

    // Normalize weights to sum exactly to 1.0
    if (totalRawWeight > 0) {
      expenseCategories.forEach((c) => {
        rawWeights[c.id] = rawWeights[c.id] / totalRawWeight;
      });
    }
  }

  // Calculate rounded monetary amounts (round to nearest Rp 5.000 for clean look)
  const result: Record<string, number> = {};
  let totalAllocated = 0;
  let maxCatId = expenseCategories[0].id;
  let maxVal = -1;

  expenseCategories.forEach((c) => {
    const share = rawWeights[c.id] || (1 / expenseCategories.length);
    // Round to nearest 5,000
    let roundedAmount = Math.round((totalBudget * share) / 5000) * 5000;
    result[c.id] = roundedAmount;
    totalAllocated += roundedAmount;

    if (roundedAmount > maxVal) {
      maxVal = roundedAmount;
      maxCatId = c.id;
    }
  });

  // Adjust any small rounding difference on the largest category to guarantee exact sum match
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

  // If no transactions, fallback to smart balanced preset
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
