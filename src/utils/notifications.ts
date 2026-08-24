import { Task, Transaction, MonthlyBudgetConfig, VoiceSettings, NotificationItem } from '../types';
import { playChime, speakText, generateTaskVoicePrompt, generateBudgetVoicePrompt } from './audio';

// Request notification permission from browser
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notifications');
    return 'denied';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return 'denied';
  }
}

export function isNotificationSupported(): boolean {
  return 'Notification' in window;
}

export function getNotificationPermissionState(): NotificationPermission {
  if (!('Notification' in window)) return 'denied';
  return Notification.permission;
}

// Show browser native notification
export function showBrowserNotification(title: string, options?: NotificationOptions) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  // If service worker is ready, trigger through service worker
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.ready.then((reg) => {
      reg.showNotification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });
    }).catch(() => {
      try {
        new Notification(title, { icon: '/favicon.ico', ...options });
      } catch (e) {
        console.warn('Notification error:', e);
      }
    });
  } else {
    try {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });
    } catch (e) {
      console.warn('Native notification display error:', e);
    }
  }
}

// Periodic check for upcoming task deadlines and budget alerts
export function checkDeadlinesAndBudgets(
  tasks: Task[],
  transactions: Transaction[],
  budgetConfig: MonthlyBudgetConfig,
  voiceSettings: VoiceSettings,
  onNewNotification: (notification: NotificationItem) => void,
  onTaskNotified: (taskId: string) => void
) {
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // 1. Check Task Deadlines
  tasks.forEach((task) => {
    if (task.completed || !task.dueDate || task.notified) return;

    const dueDate = new Date(task.dueDate);
    const diffMs = dueDate.getTime() - now.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);

    const reminderThreshold = task.reminderMinutesBefore || 15;

    // Trigger if within reminder window and not yet passed by more than 10 mins
    if (diffMinutes <= reminderThreshold && diffMinutes >= -10) {
      const isOverdue = diffMinutes < 0;
      const title = isOverdue
        ? `🚨 Tugas Terlewat: ${task.title}`
        : `⏰ Pengingat Tenggat: ${task.title}`;
      
      const message = isOverdue
        ? `Tenggat waktu tugas ini telah berakhir ${Math.abs(diffMinutes)} menit yang lalu.`
        : `Tenggat waktu dalam ${diffMinutes} menit (${dueDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })})`;

      // Native browser notification
      showBrowserNotification(title, {
        body: message,
        tag: `task-${task.id}`,
      });

      // Melodic chime
      playChime('alert');

      // Voice reminder
      if (voiceSettings.enabled && (task.voiceReminderEnabled ?? true) && voiceSettings.taskAlertsEnabled) {
        const speech = generateTaskVoicePrompt(task, voiceSettings);
        speakText(speech, voiceSettings);
      }

      // Add to in-app notification center
      const notifItem: NotificationItem = {
        id: `notif-${task.id}-${Date.now()}`,
        title,
        message,
        type: 'task_deadline',
        timestamp: new Date().toISOString(),
        read: false,
      };

      onNewNotification(notifItem);
      onTaskNotified(task.id);
    }
  });

  // 2. Check Budget Alerts for Current Month
  const currentMonthExpenses = transactions.filter(
    (t) => t.type === 'expense' && t.date.startsWith(currentMonthStr)
  );

  const totalExpense = currentMonthExpenses.reduce((sum, t) => sum + t.amount, 0);

  if (budgetConfig.totalBudget > 0) {
    const usagePercent = (totalExpense / budgetConfig.totalBudget) * 100;
    const threshold = budgetConfig.alertThresholdPercent || 80;

    // Warning check
    const warnedKey = `budget-warned-${currentMonthStr}`;
    const exceededKey = `budget-exceeded-${currentMonthStr}`;

    if (usagePercent >= 100 && !sessionStorage.getItem(exceededKey)) {
      sessionStorage.setItem(exceededKey, 'true');
      const title = '⚠️ Anggaran Bulanan Melebihi Batas!';
      const msg = `Total pengeluaran bulan ini (Rp ${totalExpense.toLocaleString('id-ID')}) telah melebihi batas anggaran total (Rp ${budgetConfig.totalBudget.toLocaleString('id-ID')}).`;

      showBrowserNotification(title, { body: msg, tag: 'budget-exceeded' });
      playChime('warning');

      if (voiceSettings.enabled && voiceSettings.financeAlertsEnabled) {
        const speech = generateBudgetVoicePrompt('exceeded', 'Total Bulanan', usagePercent, voiceSettings);
        speakText(speech, voiceSettings);
      }

      onNewNotification({
        id: `budget-exceeded-${Date.now()}`,
        title,
        message: msg,
        type: 'budget_exceeded',
        timestamp: new Date().toISOString(),
        read: false,
      });
    } else if (usagePercent >= threshold && usagePercent < 100 && !sessionStorage.getItem(warnedKey)) {
      sessionStorage.setItem(warnedKey, 'true');
      const title = '🔔 Peringatan Anggaran Bulanan';
      const msg = `Pengeluaran bulan ini sudah mencapai ${usagePercent.toFixed(0)}% dari batas total anggaran Anda.`;

      showBrowserNotification(title, { body: msg, tag: 'budget-warning' });
      playChime('warning');

      if (voiceSettings.enabled && voiceSettings.financeAlertsEnabled) {
        const speech = generateBudgetVoicePrompt('warning', 'Total Bulanan', usagePercent, voiceSettings);
        speakText(speech, voiceSettings);
      }

      onNewNotification({
        id: `budget-warn-${Date.now()}`,
        title,
        message: msg,
        type: 'budget_warning',
        timestamp: new Date().toISOString(),
        read: false,
      });
    }
  }
}
