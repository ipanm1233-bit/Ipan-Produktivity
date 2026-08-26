import { AppSyncData, Task, Transaction, RecurringBill, TaskCategory, FinanceCategory, MonthlyBudgetConfig, VoiceSettings } from '../types';

const STORAGE_KEY = 'productivity_finance_data_v1';
const ROOM_KEY = 'productivity_sync_room_id';

export const DEFAULT_TASK_CATEGORIES: TaskCategory[] = [
  { id: 'work', name: 'Pekerjaan & Karir', color: '#3b82f6', icon: 'Briefcase' },
  { id: 'study', name: 'Belajar & Kuliah', color: '#8b5cf6', icon: 'BookOpen' },
  { id: 'personal', name: 'Pribadi & Hobi', color: '#10b981', icon: 'User' },
  { id: 'health', name: 'Kesehatan & Olahraga', color: '#ef4444', icon: 'Heart' },
  { id: 'finance', name: 'Keuangan & Bisnis', color: '#f59e0b', icon: 'DollarSign' },
];

export const DEFAULT_FINANCE_CATEGORIES: FinanceCategory[] = [
  // Pengeluaran Rutin (Fixed / Routine Expenses)
  { id: 'kos', name: 'Sewa Kos & Tempat Tinggal', type: 'expense', expenseGroup: 'routine', color: '#8b5cf6', budgetLimit: 1200000 },
  { id: 'bills', name: 'Tagihan Listrik PLN & Air', type: 'expense', expenseGroup: 'routine', color: '#6366f1', budgetLimit: 450000 },
  { id: 'internet', name: 'WiFi & Paket Data Internet', type: 'expense', expenseGroup: 'routine', color: '#06b6d4', budgetLimit: 300000 },
  { id: 'installments', name: 'BPJS, Asuransi & Cicilan', type: 'expense', expenseGroup: 'routine', color: '#ec4899', budgetLimit: 250000 },
  { id: 'subscriptions', name: 'Langganan Digital (Netflix/Spotify)', type: 'expense', expenseGroup: 'routine', color: '#d946ef', budgetLimit: 100000 },

  // Pengeluaran Sehari-hari (Daily / Variable Expenses)
  { id: 'food', name: 'Makanan & Minuman Harian', type: 'expense', expenseGroup: 'daily', color: '#f97316', budgetLimit: 1300000 },
  { id: 'transport', name: 'Transportasi & Bensin', type: 'expense', expenseGroup: 'daily', color: '#14b8a6', budgetLimit: 400000 },
  { id: 'shopping', name: 'Belanja Kebutuhan & Rumah', type: 'expense', expenseGroup: 'daily', color: '#f43f5e', budgetLimit: 500000 },
  { id: 'entertainment', name: 'Hiburan, Kafe & Rekreasi', type: 'expense', expenseGroup: 'daily', color: '#eab308', budgetLimit: 350000 },
  { id: 'health_exp', name: 'Kesehatan, Vitamin & Obat', type: 'expense', expenseGroup: 'daily', color: '#10b981', budgetLimit: 200000 },

  // Pemasukan (Income)
  { id: 'salary', name: 'Gaji Pokok & Tunjangan', type: 'income', color: '#22c55e' },
  { id: 'freelance', name: 'Freelance & Side Project', type: 'income', color: '#3b82f6' },
  { id: 'investment', name: 'Investasi & Passive Income', type: 'income', color: '#a855f7' },
];

export const DEFAULT_RECURRING_BILLS: RecurringBill[] = [
  {
    id: 'bill-1',
    title: 'Sewa Kos Bulanan',
    amount: 1200000,
    dueDateDay: 5,
    category: 'kos',
    expenseGroup: 'routine',
    reminderDaysBefore: 3,
    notes: 'Transfer via BCA ke pemilik kos',
    paymentMethod: 'transfer',
    paidMonths: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'bill-2',
    title: 'Tagihan Listrik PLN & Token',
    amount: 350000,
    dueDateDay: 15,
    category: 'bills',
    expenseGroup: 'routine',
    reminderDaysBefore: 2,
    notes: 'Bayar sebelum tanggal 20 agar tidak kena denda',
    paymentMethod: 'ewallet',
    paidMonths: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'bill-3',
    title: 'WiFi IndiHome Fiber',
    amount: 280000,
    dueDateDay: 20,
    category: 'internet',
    expenseGroup: 'routine',
    reminderDaysBefore: 2,
    notes: 'Internet kos / rumah',
    paymentMethod: 'transfer',
    paidMonths: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'bill-4',
    title: 'Iuran BPJS Kesehatan',
    amount: 150000,
    dueDateDay: 10,
    category: 'installments',
    expenseGroup: 'routine',
    reminderDaysBefore: 3,
    notes: 'Autodebet / Mobile JKN',
    paymentMethod: 'transfer',
    paidMonths: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'bill-5',
    title: 'Langganan Spotify & YouTube Prem',
    amount: 85000,
    dueDateDay: 25,
    category: 'subscriptions',
    expenseGroup: 'routine',
    reminderDaysBefore: 1,
    notes: 'Paket langganan audio & video',
    paymentMethod: 'credit_card',
    paidMonths: [],
    createdAt: new Date().toISOString(),
  },
];

export const DEFAULT_MONTHLY_BUDGET: MonthlyBudgetConfig = {
  totalBudget: 5050000,
  routineBudget: 2300000, // Rutin (Kos, PLN, WiFi, BPJS, Langganan)
  dailyBudget: 2750000,   // Sehari-hari (Makan, Transport, Belanja, Hiburan, Medis)
  categoryBudgets: {
    kos: 1200000,
    bills: 450000,
    internet: 300000,
    installments: 250000,
    subscriptions: 100000,
    food: 1300000,
    transport: 400000,
    shopping: 500000,
    entertainment: 350000,
    health_exp: 200000,
  },
  alertThresholdPercent: 80,
};

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  enabled: true,
  lang: 'id-ID',
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
  userName: 'Ipan',
  style: 'motivational',
  financeAlertsEnabled: true,
  taskAlertsEnabled: true,
  billAlertsEnabled: true,
};

function getSampleDate(offsetDays = 0, hour = 14, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function getSampleDateString(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

export const SAMPLE_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Selesaikan Laporan Evaluasi Bulanan',
    description: 'Menyusun analisis metrik kerja dan roadmap proyek Q3.',
    category: 'work',
    priority: 'high',
    dueDate: getSampleDate(0, 16, 30),
    reminderMinutesBefore: 15,
    completed: false,
    createdAt: new Date().toISOString(),
    estimatedMinutes: 60,
    subtasks: [
      { id: 'st-1', title: 'Kumpulkan data mingguan', completed: true },
      { id: 'st-2', title: 'Buat grafik performa', completed: false },
      { id: 'st-3', title: 'Kirim ke tim manajer', completed: false },
    ],
    voiceReminderEnabled: true,
  },
  {
    id: 'task-2',
    title: 'Review Modul Kursus TypeScript & Cloud',
    description: 'Mempelajari arsitektur fullstack dan optimasi real-time sync.',
    category: 'study',
    priority: 'medium',
    dueDate: getSampleDate(1, 19, 0),
    reminderMinutesBefore: 30,
    completed: false,
    createdAt: new Date().toISOString(),
    estimatedMinutes: 45,
    subtasks: [
      { id: 'st-4', title: 'Tonton video Bab 4', completed: true },
      { id: 'st-5', title: 'Kerjakan studi kasus', completed: false },
    ],
    voiceReminderEnabled: true,
  },
  {
    id: 'task-3',
    title: 'Jogging Sore 5 KM & Peregangan',
    description: 'Latihan kardio rutin untuk menjaga kebugaran tubuh.',
    category: 'health',
    priority: 'medium',
    dueDate: getSampleDate(0, 17, 30),
    reminderMinutesBefore: 15,
    completed: true,
    completedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    estimatedMinutes: 40,
    subtasks: [],
    voiceReminderEnabled: true,
  },
  {
    id: 'task-4',
    title: 'Evaluasi Portofolio Keuangan & Investasi',
    description: 'Alokasikan sisa anggaran bulanan ke tabungan darurat.',
    category: 'finance',
    priority: 'urgent',
    dueDate: getSampleDate(2, 20, 0),
    reminderMinutesBefore: 60,
    completed: false,
    createdAt: new Date().toISOString(),
    estimatedMinutes: 30,
    subtasks: [
      { id: 'st-6', title: 'Cek saldo rekening', completed: true },
      { id: 'st-7', title: 'Top-up reksadana/deposito', completed: false },
    ],
    voiceReminderEnabled: true,
  },
  {
    id: 'task-5',
    title: 'Weekly Standup & Sync Perangkat Proyek',
    description: 'Sinkronisasi task lintas tim dan backup data real-time.',
    category: 'work',
    priority: 'high',
    dueDate: getSampleDate(-1, 10, 0),
    reminderMinutesBefore: 15,
    completed: true,
    completedAt: getSampleDate(-1, 11, 0),
    createdAt: getSampleDate(-2, 9, 0),
    estimatedMinutes: 30,
    subtasks: [],
  },
];

export const SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    title: 'Gaji Bulanan & Tunjangan',
    amount: 7500000,
    type: 'income',
    category: 'salary',
    date: getSampleDateString(-5),
    paymentMethod: 'transfer',
    notes: 'Payroll resmi',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tx-2',
    title: 'Sewa Kos Bulan Berjalan',
    amount: 1200000,
    type: 'expense',
    expenseGroup: 'routine',
    category: 'kos',
    date: getSampleDateString(-5),
    paymentMethod: 'transfer',
    notes: 'Tagihan rutin kos',
    relatedBillId: 'bill-1',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tx-3',
    title: 'Belanja Mingguan Supermarket',
    amount: 450000,
    type: 'expense',
    expenseGroup: 'daily',
    category: 'food',
    date: getSampleDateString(-3),
    paymentMethod: 'ewallet',
    notes: 'Bahan makanan dan sayur',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tx-4',
    title: 'Bensin & Tol Mobil/Motor',
    amount: 180000,
    type: 'expense',
    expenseGroup: 'daily',
    category: 'transport',
    date: getSampleDateString(-1),
    paymentMethod: 'ewallet',
    notes: 'Transportasi harian',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tx-5',
    title: 'Side Project Web Design',
    amount: 1800000,
    type: 'income',
    category: 'freelance',
    date: getSampleDateString(-2),
    paymentMethod: 'transfer',
    notes: 'Pembayaran termin 1',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tx-6',
    title: 'Makan Siang & Kopi Santai',
    amount: 75000,
    type: 'expense',
    expenseGroup: 'daily',
    category: 'food',
    date: getSampleDateString(0),
    paymentMethod: 'cash',
    notes: 'Makan siang & es kopi',
    createdAt: new Date().toISOString(),
  },
];

export function generateSyncRoomId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function getSyncRoomId(): string {
  let roomId = localStorage.getItem(ROOM_KEY);
  if (!roomId) {
    roomId = generateSyncRoomId();
    localStorage.setItem(ROOM_KEY, roomId);
  }
  return roomId;
}

export function setSyncRoomId(roomId: string): void {
  localStorage.setItem(ROOM_KEY, roomId.trim().toUpperCase());
}

export function loadInitialData(): AppSyncData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      
      // Calculate routine and daily budget if missing
      const monthlyBudget = parsed.monthlyBudget || DEFAULT_MONTHLY_BUDGET;
      if (!monthlyBudget.routineBudget || !monthlyBudget.dailyBudget) {
        let routineSum = 0;
        let dailySum = 0;
        const cats = parsed.financeCategories || DEFAULT_FINANCE_CATEGORIES;
        cats.forEach((c: FinanceCategory) => {
          if (c.type === 'expense') {
            const catLimit = monthlyBudget.categoryBudgets?.[c.id] || c.budgetLimit || 0;
            if (c.expenseGroup === 'routine' || ['kos', 'bills', 'internet', 'installments', 'subscriptions'].includes(c.id)) {
              routineSum += catLimit;
            } else {
              dailySum += catLimit;
            }
          }
        });
        monthlyBudget.routineBudget = routineSum > 0 ? routineSum : 2300000;
        monthlyBudget.dailyBudget = dailySum > 0 ? dailySum : 2750000;
        monthlyBudget.totalBudget = monthlyBudget.totalBudget || (monthlyBudget.routineBudget + monthlyBudget.dailyBudget);
      }

      return {
        tasks: parsed.tasks || SAMPLE_TASKS,
        transactions: parsed.transactions || SAMPLE_TRANSACTIONS,
        bills: Array.isArray(parsed.bills) ? parsed.bills : DEFAULT_RECURRING_BILLS,
        taskCategories: parsed.taskCategories || DEFAULT_TASK_CATEGORIES,
        financeCategories: parsed.financeCategories || DEFAULT_FINANCE_CATEGORIES,
        monthlyBudget,
        voiceSettings: parsed.voiceSettings || DEFAULT_VOICE_SETTINGS,
        characterAvatar: parsed.characterAvatar,
        notifications: parsed.notifications || [],
        theme: parsed.theme || 'dark',
        lastUpdated: parsed.lastUpdated || Date.now(),
        syncRoomId: getSyncRoomId(),
      };
    }
  } catch (err) {
    console.error('Error reading localStorage:', err);
  }

  const initialRoomId = getSyncRoomId();
  const initialData: AppSyncData = {
    tasks: SAMPLE_TASKS,
    transactions: SAMPLE_TRANSACTIONS,
    bills: DEFAULT_RECURRING_BILLS,
    taskCategories: DEFAULT_TASK_CATEGORIES,
    financeCategories: DEFAULT_FINANCE_CATEGORIES,
    monthlyBudget: DEFAULT_MONTHLY_BUDGET,
    voiceSettings: DEFAULT_VOICE_SETTINGS,
    notifications: [],
    theme: 'dark',
    lastUpdated: Date.now(),
    syncRoomId: initialRoomId,
  };

  saveLocalData(initialData);
  return initialData;
}

export function saveLocalData(data: AppSyncData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Error saving to localStorage:', err);
  }
}

// Push to server for multi-device sync
export async function pushDataToServer(data: AppSyncData): Promise<{ success: boolean; connectedDevices?: number }> {
  try {
    const response = await fetch(`/api/sync/${data.syncRoomId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tasks: data.tasks,
        finances: data.transactions,
        bills: data.bills,
        categories: data.taskCategories,
        financeCategories: data.financeCategories,
        monthlyBudget: data.monthlyBudget.totalBudget,
        routineBudget: data.monthlyBudget.routineBudget,
        dailyBudget: data.monthlyBudget.dailyBudget,
        categoryBudgets: data.monthlyBudget.categoryBudgets,
        voiceSettings: data.voiceSettings,
        characterAvatar: data.characterAvatar,
        theme: data.theme,
        lastUpdated: Date.now(),
      }),
    });

    if (response.ok) {
      const resData = await response.json();
      return { success: true, connectedDevices: resData.connectedDevices };
    }
  } catch (err) {
    console.warn('Sync server push failed, saved locally:', err);
  }
  return { success: false };
}

// Pull from server for room
export async function pullDataFromServer(roomId: string): Promise<Partial<AppSyncData> | null> {
  try {
    const response = await fetch(`/api/sync/${roomId}`);
    if (response.ok) {
      const result = await response.json();
      if (result.payload) {
        const p = result.payload;
        return {
          tasks: p.tasks,
          transactions: p.finances,
          bills: p.bills || DEFAULT_RECURRING_BILLS,
          taskCategories: p.categories,
          financeCategories: p.financeCategories,
          monthlyBudget: {
            totalBudget: p.monthlyBudget || DEFAULT_MONTHLY_BUDGET.totalBudget,
            routineBudget: p.routineBudget || DEFAULT_MONTHLY_BUDGET.routineBudget,
            dailyBudget: p.dailyBudget || DEFAULT_MONTHLY_BUDGET.dailyBudget,
            categoryBudgets: p.categoryBudgets || DEFAULT_MONTHLY_BUDGET.categoryBudgets,
            alertThresholdPercent: 80,
          },
          voiceSettings: p.voiceSettings,
          characterAvatar: p.characterAvatar,
          theme: p.theme,
          lastUpdated: p.lastUpdated,
        };
      }
    }
  } catch (err) {
    console.warn('Sync server pull error:', err);
  }
  return null;
}
