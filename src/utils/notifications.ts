import { Task, Transaction, RecurringBill, MonthlyBudgetConfig, VoiceSettings, NotificationItem } from '../types';
import { 
  playChime, 
  speakText, 
  generateStageVoicePrompt, 
  generateTaskVoicePrompt, 
  generateBudgetVoicePrompt,
  generateBillVoicePrompt 
} from './audio';
import { getBillDueStatus } from './budgetCalculator';

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

// Show browser & mobile native notification with vibration
export function showBrowserNotification(title: string, options?: NotificationOptions) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  // Trigger device hardware vibration if supported (Android / Mobile)
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([300, 120, 300, 120, 500]);
    } catch (e) {
      // Ignore vibration errors
    }
  }

  const enhancedOptions: NotificationOptions & { vibrate?: number[]; renotify?: boolean } = {
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [300, 120, 300, 120, 500],
    renotify: true,
    ...options,
  };

  // If service worker is ready, trigger through service worker (best for mobile devices)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((reg) => {
        reg.showNotification(title, enhancedOptions as any);
      })
      .catch(() => {
        try {
          new Notification(title, enhancedOptions);
        } catch (e) {
          console.warn('Native notification display error:', e);
        }
      });
  } else {
    try {
      new Notification(title, enhancedOptions);
    } catch (e) {
      console.warn('Native notification fallback error:', e);
    }
  }
}

// Helper to trigger an immediate test notification for mobile users
export async function triggerTestMobileNotification(): Promise<boolean> {
  const perm = await requestNotificationPermission();
  if (perm === 'granted') {
    playChime('success');
    showBrowserNotification('🎉 Notifikasi TaskPan Aktif!', {
      body: 'Hebat! Notifikasi HP siap mengingatkan Anda pada 30 menit, 10 menit, 5 menit sebelum tenggat, dan saat waktu tugas atau tagihan tiba.',
      tag: 'taskpan-welcome-test',
    });
    return true;
  }
  return false;
}

// Periodic check for upcoming task deadlines, recurring bills, and budget alerts
export function checkDeadlinesAndBudgets(
  tasks: Task[],
  transactions: Transaction[],
  budgetConfig: MonthlyBudgetConfig,
  voiceSettings: VoiceSettings,
  onNewNotification: (notification: NotificationItem) => void,
  onTaskStageNotified: (taskId: string, stage: number) => void,
  bills?: RecurringBill[]
) {
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const currentDateStr = `${currentMonthStr}-${String(now.getDate()).padStart(2, '0')}`;

  // 1. Check Multi-Stage Task Deadlines (30m, 10m, 5m, dan 0m / selesai)
  tasks.forEach((task) => {
    if (task.completed || !task.dueDate) return;

    const dueDate = new Date(task.dueDate);
    const diffMs = dueDate.getTime() - now.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const dueTimeFormatted = dueDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    // Multi-stage list: default to [30, 10, 5, 0] (or task configured stages)
    const stages: number[] = task.reminderStages && task.reminderStages.length > 0
      ? task.reminderStages
      : [30, 10, 5, 0];

    const alreadyNotified = task.notifiedStages || (task.notified ? [15] : []);

    stages.forEach((stage) => {
      if (alreadyNotified.includes(stage)) return;

      let isTriggerMatch = false;
      let title = '';
      let message = '';
      let soundType: 'alert' | 'warning' = 'alert';

      if (stage === 30 && diffMinutes <= 30 && diffMinutes > 10) {
        isTriggerMatch = true;
        title = `⏰ 30 Menit Menuju Tenggat: ${task.title}`;
        message = `Tugas "${task.title}" tersisa 30 menit lagi (Pukul ${dueTimeFormatted}). Persiapkan sekarang!`;
      } else if (stage === 10 && diffMinutes <= 10 && diffMinutes > 5) {
        isTriggerMatch = true;
        title = `⚠️ 10 Menit Menuju Tenggat: ${task.title}`;
        message = `Perhatian! Tugas "${task.title}" tersisa 10 menit lagi sebelum batas waktu pukul ${dueTimeFormatted}.`;
        soundType = 'warning';
      } else if (stage === 5 && diffMinutes <= 5 && diffMinutes > 0) {
        isTriggerMatch = true;
        title = `🚨 Mendesak (5 Menit): ${task.title}`;
        message = `Segera selesaikan! Waktu tugas "${task.title}" tersisa 5 menit terakhir.`;
        soundType = 'warning';
      } else if (stage === 0 && diffMinutes <= 0 && diffMinutes >= -30) {
        isTriggerMatch = true;
        title = `⌛ Waktu Tenggat Selesai: ${task.title}`;
        message = `Batas waktu tugas "${task.title}" telah tiba pukul ${dueTimeFormatted}. Silakan tandai jika sudah selesai!`;
        soundType = 'warning';
      }

      if (isTriggerMatch) {
        // Native mobile / desktop push notification
        showBrowserNotification(title, {
          body: message,
          tag: `task-${task.id}-stage-${stage}`,
        });

        // Melodic chime
        playChime(soundType);

        // Personalized Voice reminder
        if (voiceSettings.enabled && (task.voiceReminderEnabled ?? true) && voiceSettings.taskAlertsEnabled) {
          const speech = generateStageVoicePrompt(task, stage, voiceSettings);
          speakText(speech, voiceSettings);
        }

        // Add to in-app notification center
        const notifItem: NotificationItem = {
          id: `notif-${task.id}-s${stage}-${Date.now()}`,
          title,
          message,
          type: 'task_deadline',
          timestamp: new Date().toISOString(),
          read: false,
          relatedId: task.id,
        };

        onNewNotification(notifItem);
        onTaskStageNotified(task.id, stage);
      }
    });
  });

  // 2. Check Recurring Bills Due Dates & Reminders
  if (bills && bills.length > 0) {
    bills.forEach((bill) => {
      const statusInfo = getBillDueStatus(bill, now);
      if (statusInfo.isPaidThisMonth) return;

      const billNotifKey = `bill-alert-${bill.id}-${currentDateStr}`;
      if (sessionStorage.getItem(billNotifKey)) return;

      let isTrigger = false;
      let title = '';
      let message = '';
      let notifType: 'bill_reminder' | 'bill_overdue' = 'bill_reminder';
      let soundType: 'alert' | 'warning' = 'alert';

      const amountStr = `Rp ${bill.amount.toLocaleString('id-ID')}`;

      if (statusInfo.status === 'due_today') {
        isTrigger = true;
        title = `💳 Tagihan Jatuh Tempo Hari Ini: ${bill.title}`;
        message = `Tagihan ${bill.title} sebesar ${amountStr} jatuh tempo hari ini (tgl ${bill.dueDateDay}). Segera lakukan pembayaran.`;
        soundType = 'warning';
      } else if (statusInfo.status === 'overdue') {
        isTrigger = true;
        title = `⚠️ Tagihan Terlambat: ${bill.title}`;
        message = `Tagihan ${bill.title} (${amountStr}) telah melewati tanggal jatuh tempo (${Math.abs(statusInfo.daysRemaining)} hari lalu).`;
        notifType = 'bill_overdue';
        soundType = 'warning';
      } else if (statusInfo.status === 'due_soon') {
        isTrigger = true;
        title = `📅 Pengingat Tagihan (H-${statusInfo.daysRemaining}): ${bill.title}`;
        message = `Tagihan ${bill.title} (${amountStr}) akan jatuh tempo dalam ${statusInfo.daysRemaining} hari lagi (tanggal ${bill.dueDateDay}).`;
      }

      if (isTrigger) {
        sessionStorage.setItem(billNotifKey, 'true');

        showBrowserNotification(title, {
          body: message,
          tag: `bill-${bill.id}-${statusInfo.status}`,
        });

        playChime(soundType);

        if (voiceSettings.enabled && (voiceSettings.billAlertsEnabled ?? voiceSettings.financeAlertsEnabled ?? true)) {
          const speech = generateBillVoicePrompt(
            bill.title,
            bill.amount,
            statusInfo.status === 'due_today' ? 'due_today' : statusInfo.status === 'overdue' ? 'overdue' : 'due_soon',
            statusInfo.daysRemaining,
            voiceSettings
          );
          speakText(speech, voiceSettings);
        }

        onNewNotification({
          id: `bill-notif-${bill.id}-${Date.now()}`,
          title,
          message,
          type: notifType,
          timestamp: new Date().toISOString(),
          read: false,
          relatedId: bill.id,
        });
      }
    });
  }

  // 3. Check Budget Alerts for Current Month
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

/**
 * Schedule background notification alarms in Service Worker
 * Ensures notifications are triggered on mobile / desktop even when the app tab is closed
 */
export function syncScheduledAlarmsWithServiceWorker(tasks: Task[], bills: RecurringBill[]): void {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

  const now = Date.now();
  const alarms: Array<{ id: string; title: string; body: string; time: number; tag: string }> = [];

  // 1. Task stage alarms (30m, 10m, 5m, 0m)
  tasks.forEach((task) => {
    if (task.completed || !task.dueDate) return;
    const dueTime = new Date(task.dueDate).getTime();
    if (isNaN(dueTime) || dueTime < now) return;

    const stages = [
      { stage: 30, offsetMs: 30 * 60 * 1000, label: '30 menit lagi' },
      { stage: 10, offsetMs: 10 * 60 * 1000, label: '10 menit lagi' },
      { stage: 5, offsetMs: 5 * 60 * 1000, label: '5 menit lagi' },
      { stage: 0, offsetMs: 0, label: 'Batas waktu sekarang' },
    ];

    stages.forEach((s) => {
      const alarmTime = dueTime - s.offsetMs;
      if (alarmTime > now) {
        alarms.push({
          id: `task-${task.id}-stage-${s.stage}`,
          title: `⏰ Pengingat Tugas: ${task.title}`,
          body: `Batas waktu tugas "${task.title}" ${s.label}!`,
          time: alarmTime,
          tag: `task-${task.id}-${s.stage}`,
        });
      }
    });
  });

  // 2. Bill due date alarms
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  if (bills && Array.isArray(bills)) {
    bills.forEach((bill) => {
      const currentMonthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
      if (bill.paidMonths?.includes(currentMonthStr)) return;

      const dueDateThisMonth = new Date(currentYear, currentMonth, bill.dueDateDay, 8, 0, 0, 0);
      const reminderDays = bill.reminderDaysBefore || 3;
      const reminderDate = new Date(currentYear, currentMonth, bill.dueDateDay - reminderDays, 8, 0, 0, 0);

      const amountFormatted = `Rp ${bill.amount.toLocaleString('id-ID')}`;

      if (reminderDate.getTime() > now) {
        alarms.push({
          id: `bill-${bill.id}-reminder-soon`,
          title: `📅 Pengingat Tagihan: ${bill.title}`,
          body: `Tagihan ${bill.title} (${amountFormatted}) akan jatuh tempo dalam ${reminderDays} hari lagi.`,
          time: reminderDate.getTime(),
          tag: `bill-${bill.id}-soon`,
        });
      }

      if (dueDateThisMonth.getTime() > now) {
        alarms.push({
          id: `bill-${bill.id}-due-today`,
          title: `💳 Tagihan Jatuh Tempo Hari Ini: ${bill.title}`,
          body: `Tagihan ${bill.title} sebesar ${amountFormatted} jatuh tempo hari ini. Segera lakukan pembayaran!`,
          time: dueDateThisMonth.getTime(),
          tag: `bill-${bill.id}-today`,
        });
      }
    });
  }

  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'SCHEDULE_ALARMS',
      alarms,
    });
  } else {
    navigator.serviceWorker.ready
      .then((reg) => {
        if (reg.active) {
          reg.active.postMessage({
            type: 'SCHEDULE_ALARMS',
            alarms,
          });
        }
      })
      .catch(() => {});
  }
}

