export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';

export interface TaskCategory {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: string; // category id or name
  priority: PriorityLevel;
  dueDate: string; // ISO string e.g. "2026-08-25T14:00"
  reminderMinutesBefore?: number; // 0, 5, 10, 15, 30, 60, 1440
  reminderStages?: number[]; // Multi-stage reminder countdown: e.g. [30, 10, 5, 0] (30m, 10m, 5m, at deadline)
  notifiedStages?: number[]; // Stages that have already fired for this task
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  estimatedMinutes?: number;
  subtasks: SubTask[];
  voiceReminderEnabled?: boolean;
  customVoicePrompt?: string;
  notified?: boolean;
}

export type TransactionType = 'expense' | 'income';
export type ExpenseGroup = 'routine' | 'daily'; // 'routine' (Tagihan, Kos, Cicilan, Langganan) vs 'daily' (Makan, Hiburan, Belanja, Transport)

export interface FinanceCategory {
  id: string;
  name: string;
  type: TransactionType;
  expenseGroup?: ExpenseGroup; // Separates fixed/routine vs daily/lifestyle expenses
  color: string;
  budgetLimit?: number; // Optional monthly category budget limit
  icon?: string;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  expenseGroup?: ExpenseGroup; // Separates routine vs daily
  category: string; // category id or name
  date: string; // YYYY-MM-DD
  paymentMethod: 'cash' | 'transfer' | 'ewallet' | 'credit_card';
  notes?: string;
  relatedBillId?: string; // If paid from a recurring bill reminder
  createdAt: string;
}

export interface RecurringBill {
  id: string;
  title: string; // e.g. "Sewa Kos Bulanan", "Tagihan Listrik PLN", "WiFi Fiber", "BPJS Kesehatan"
  amount: number;
  dueDateDay: number; // 1 - 31 (day of the month)
  category: string; // categoryId e.g. 'kos', 'bills', 'internet'
  expenseGroup: 'routine';
  reminderDaysBefore: number; // e.g. 3 (H-3), 1 (H-1), 0 (Hari H)
  notes?: string;
  paymentMethod?: 'cash' | 'transfer' | 'ewallet' | 'credit_card';
  paidMonths?: string[]; // Array of "YYYY-MM" when this bill was paid
  autoCreateTransaction?: boolean;
  createdAt: string;
}

export interface CategoryBudget {
  categoryId: string;
  limit: number;
}

export interface MonthlyBudgetConfig {
  totalBudget: number; // Overall monthly spending target
  routineBudget?: number; // Anggaran Rutin (Tagihan, Kos, Cicilan, Langganan)
  dailyBudget?: number; // Anggaran Sehari-hari (Makan, Hiburan, Belanja, Transportasi)
  categoryBudgets: Record<string, number>; // categoryId -> limit amount
  alertThresholdPercent: number; // default 80
}

export interface CharacterAvatarConfig {
  url?: string;
  presetId?: string;
  name?: string;
  isTransparent?: boolean;
  isGif?: boolean;
  scale?: number; // 0.8 to 1.5
  flipHorizontal?: boolean;
  showPodium?: boolean;
  animationStyle?: 'float' | 'bounce' | 'pulse' | 'gentle' | 'none';
  glowColor?: 'orange' | 'emerald' | 'cyan' | 'purple' | 'amber' | 'none';
  mode?: 'transparent_cutout' | 'studio_frame';
}

export interface VoiceSettings {
  enabled: boolean;
  voiceURI?: string;
  lang: string; // default 'id-ID' or 'en-US'
  rate: number; // 0.8 - 1.5
  pitch: number; // 0.8 - 1.3
  volume: number; // 0 - 1
  userName: string;
  style: 'motivational' | 'formal' | 'casual' | 'concise';
  customTemplate?: string;
  financeAlertsEnabled: boolean;
  taskAlertsEnabled: boolean;
  billAlertsEnabled?: boolean;
  characterAvatar?: CharacterAvatarConfig;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'task_deadline' | 'budget_warning' | 'budget_exceeded' | 'bill_reminder' | 'bill_overdue' | 'streak_achievement' | 'sync_update' | 'focus_completed' | 'system';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  relatedId?: string;
}

export interface AppSyncData {
  tasks: Task[];
  transactions: Transaction[];
  bills: RecurringBill[];
  taskCategories: TaskCategory[];
  financeCategories: FinanceCategory[];
  monthlyBudget: MonthlyBudgetConfig;
  voiceSettings: VoiceSettings;
  characterAvatar?: CharacterAvatarConfig;
  notifications: NotificationItem[];
  theme: 'dark' | 'light' | 'system';
  lastUpdated: number;
  syncRoomId: string;
}
