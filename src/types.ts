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

export interface FinanceCategory {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
  budgetLimit?: number; // Optional monthly category budget limit
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string; // category id or name
  date: string; // YYYY-MM-DD
  paymentMethod: 'cash' | 'transfer' | 'ewallet' | 'credit_card';
  notes?: string;
  createdAt: string;
}

export interface CategoryBudget {
  categoryId: string;
  limit: number;
}

export interface MonthlyBudgetConfig {
  totalBudget: number; // Overall monthly spending target
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
  characterAvatar?: CharacterAvatarConfig;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'task_deadline' | 'budget_warning' | 'budget_exceeded' | 'streak_achievement' | 'sync_update';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface AppSyncData {
  tasks: Task[];
  transactions: Transaction[];
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
