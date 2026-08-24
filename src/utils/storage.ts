import { AppSyncData, Task, Transaction, TaskCategory, FinanceCategory, MonthlyBudgetConfig, VoiceSettings } from '../types';

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
  { id: 'food', name: 'Makanan & Minuman', type: 'expense', color: '#f97316', budgetLimit: 1500000 },
  { id: 'transport', name: 'Transportasi & Bensin', type: 'expense', color: '#06b6d4', budgetLimit: 600000 },
  { id: 'bills', name: 'Tagihan & Utilitas', type: 'expense', color: '#8b5cf6', budgetLimit: 800000 },
  { id: 'shopping', name: 'Belanja & Kebutuhan', type: 'expense', color: '#ec4899', budgetLimit: 1000000 },
  { id: 'entertainment', name: 'Hiburan & Langganan', type: 'expense', color: '#eab308', budgetLimit: 400000 },
  { id: 'health_exp', name: 'Kesehatan & Obat', type: 'expense', color: '#10b981', budgetLimit: 300000 },
  { id: 'salary', name: 'Gaji Pokok', type: 'income', color: '#22c55e' },
  { id: 'freelance', name: 'Freelance & Side Project', type: 'income', color: '#3b82f6' },
  { id: 'investment', name: 'Investasi & Dividen', type: 'income', color: '#a855f7' },
];

export const DEFAULT_MONTHLY_BUDGET: MonthlyBudgetConfig = {
  totalBudget: 5000000,
  categoryBudgets: {
    food: 1500000,
    transport: 600000,
    bills: 800000,
    shopping: 1000000,
    entertainment: 400000,
    health_exp: 300000,
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
    title: 'Gaji Bulanan & Bonus Kinerja',
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
    title: 'Belanja Mingguan Supermarket',
    amount: 450000,
    type: 'expense',
    category: 'food',
    date: getSampleDateString(-3),
    paymentMethod: 'ewallet',
    notes: 'Bahan makanan dan buah',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tx-3',
    title: 'Tagihan Listrik & Internet Fiber',
    amount: 550000,
    type: 'expense',
    category: 'bills',
    date: getSampleDateString(-4),
    paymentMethod: 'transfer',
    notes: 'Tagihan rutin bulanan',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tx-4',
    title: 'Bensin Kendaraan & Tol',
    amount: 180000,
    type: 'expense',
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
    title: 'Makan Siang Tim',
    amount: 85000,
    type: 'expense',
    category: 'food',
    date: getSampleDateString(0),
    paymentMethod: 'cash',
    notes: 'Makan siang resto lokal',
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
      return {
        tasks: parsed.tasks || SAMPLE_TASKS,
        transactions: parsed.transactions || SAMPLE_TRANSACTIONS,
        taskCategories: parsed.taskCategories || DEFAULT_TASK_CATEGORIES,
        financeCategories: parsed.financeCategories || DEFAULT_FINANCE_CATEGORIES,
        monthlyBudget: parsed.monthlyBudget || DEFAULT_MONTHLY_BUDGET,
        voiceSettings: parsed.voiceSettings || DEFAULT_VOICE_SETTINGS,
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
        categories: data.taskCategories,
        financeCategories: data.financeCategories,
        monthlyBudget: data.monthlyBudget.totalBudget,
        categoryBudgets: data.monthlyBudget.categoryBudgets,
        voiceSettings: data.voiceSettings,
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
          taskCategories: p.categories,
          financeCategories: p.financeCategories,
          monthlyBudget: {
            totalBudget: p.monthlyBudget || DEFAULT_MONTHLY_BUDGET.totalBudget,
            categoryBudgets: p.categoryBudgets || DEFAULT_MONTHLY_BUDGET.categoryBudgets,
            alertThresholdPercent: 80,
          },
          voiceSettings: p.voiceSettings,
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
