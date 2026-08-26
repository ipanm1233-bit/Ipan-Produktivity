import React, { useState, useEffect, useRef } from 'react';
import { 
  AppSyncData, 
  Task, 
  Transaction, 
  RecurringBill,
  TaskCategory, 
  FinanceCategory, 
  MonthlyBudgetConfig, 
  VoiceSettings, 
  NotificationItem 
} from './types';
import { 
  loadInitialData, 
  saveLocalData, 
  pushDataToServer, 
  getSyncRoomId, 
  setSyncRoomId,
  DEFAULT_RECURRING_BILLS 
} from './utils/storage';
import { 
  saveToFirestore, 
  loadFromFirestore, 
  subscribeToFirestoreRoom 
} from './utils/firestoreService';
import { checkDeadlinesAndBudgets, syncScheduledAlarmsWithServiceWorker } from './utils/notifications';
import { speakText, playChime, initAudioOnUserGesture } from './utils/audio';
import { ClaySidebar } from './components/Sidebar/ClaySidebar';
import { ClayDashboardOverview } from './components/Dashboard/ClayDashboardOverview';
import { Navbar } from './components/Navbar';
import { TaskList } from './components/TaskTracker/TaskList';
import { TaskModal } from './components/TaskTracker/TaskModal';
import { WeeklyProgressChart } from './components/TaskTracker/WeeklyProgressChart';
import { FinanceDashboard } from './components/FinanceTracker/FinanceDashboard';
import { TransactionModal } from './components/FinanceTracker/TransactionModal';
import { CalendarSchedule } from './components/CalendarView/CalendarSchedule';
import { VoiceSettingsModal } from './components/VoiceSettings/VoiceSettingsModal';
import { SyncModal } from './components/SyncModal/SyncModal';
import { NotificationDrawer } from './components/Notifications/NotificationDrawer';
import { InstallPwaModal } from './components/InstallModal/InstallPwaModal';
import { FluidBottomNav } from './components/Navigation/FluidBottomNav';
import { ClayPinLock } from './components/PinLock/ClayPinLock';
import { SecurityPinModal } from './components/PinLock/SecurityPinModal';
import { QuickTaskEntryModal } from './components/Tasks/QuickTaskEntryModal';
import { FocusSessionModal, FocusSessionState } from './components/FocusMode/FocusSessionModal';
import { FloatingFocusBar } from './components/FocusMode/FloatingFocusBar';
import { stopAmbientSound } from './utils/ambientAudio';
import { 
  Home, 
  CheckSquare, 
  Calendar as CalendarIcon, 
  DollarSign, 
  BarChart3 
} from 'lucide-react';

export default function App() {
  const [appData, setAppData] = useState<AppSyncData>(loadInitialData);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks' | 'calendar' | 'finance' | 'analytics'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('productivity_theme') === 'dark';
  });

  // Security PIN Lock Screen State (Enabled when opening app)
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    return localStorage.getItem('taskpan_pin_enabled') !== 'false';
  });

  // Focus Mode & Ambient/Spotify/Apple Music Session State
  const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);
  const [focusSessionState, setFocusSessionState] = useState<FocusSessionState>(() => {
    try {
      const saved = localStorage.getItem('taskpan_focus_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          isPaused: true, // Start paused on page refresh
        };
      }
    } catch (e) {
      console.warn('Failed to parse saved focus state:', e);
    }
    return {
      isActive: false,
      isPaused: false,
      durationMinutes: 25,
      remainingSeconds: 25 * 60,
      selectedTaskId: null,
      musicProvider: 'ambient',
      ambientType: 'binaural',
      ambientVolume: 0.5,
      spotifyPlaylistId: '37i9dQZF1DWZeKCadgRdKQ',
      customSpotifyUrl: '',
      appleMusicEmbedUrl: 'https://embed.music.apple.com/us/playlist/pure-focus/pl.u-76oNkDvFv59m1X',
      customAppleMusicUrl: '',
      completedSessionsCount: 0,
    };
  });

  // Modal visibility states
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskInitialDueDate, setTaskInitialDueDate] = useState<string | undefined>(undefined);
  
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txToEdit, setTxToEdit] = useState<Transaction | null>(null);
  const [txInitialDate, setTxInitialDate] = useState<string | undefined>(undefined);

  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isSecurityPinModalOpen, setIsSecurityPinModalOpen] = useState(false);
  const [isQuickEntryModalOpen, setIsQuickEntryModalOpen] = useState(false);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [connectedDevicesCount, setConnectedDevicesCount] = useState(1);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isIncomingSyncRef = useRef<boolean>(false);

  // Apply dark mode class to root HTML
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('productivity_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('productivity_theme', 'light');
    }
  }, [darkMode]);

  // Scroll to top when switching tab views
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  // Persist locally and trigger debounced sync push to server & Firestore
  useEffect(() => {
    if (isIncomingSyncRef.current) {
      isIncomingSyncRef.current = false;
      return;
    }

    saveLocalData(appData);

    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(async () => {
      setIsSyncing(true);
      // 1. Push to server SSE room
      const res = await pushDataToServer(appData);
      if (res.connectedDevices) setConnectedDevicesCount(res.connectedDevices);

      // 2. Persist in cloud database (Firebase Firestore)
      const roomId = appData.syncRoomId || getSyncRoomId();
      await saveToFirestore(roomId, appData);

      setIsSyncing(false);
    }, 600);

    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [appData]);

  // Initial load from Firestore if room exists
  useEffect(() => {
    const roomId = appData.syncRoomId || getSyncRoomId();
    let isMounted = true;

    // First fetch latest from Firestore on boot
    loadFromFirestore(roomId).then((cloudData) => {
      if (!isMounted || !cloudData) return;
      if (!appData.lastUpdated || (cloudData.lastUpdated && cloudData.lastUpdated > appData.lastUpdated)) {
        isIncomingSyncRef.current = true;
        setAppData((prev) => ({
          ...prev,
          tasks: cloudData.tasks || prev.tasks,
          transactions: cloudData.transactions || prev.transactions,
          bills: Array.isArray(cloudData.bills) ? cloudData.bills : (prev.bills || DEFAULT_RECURRING_BILLS),
          taskCategories: cloudData.taskCategories || prev.taskCategories,
          financeCategories: cloudData.financeCategories || prev.financeCategories,
          monthlyBudget: cloudData.monthlyBudget || prev.monthlyBudget,
          voiceSettings: cloudData.voiceSettings || prev.voiceSettings,
          theme: cloudData.theme || prev.theme,
          notifications: cloudData.notifications || prev.notifications,
          lastUpdated: cloudData.lastUpdated || Date.now(),
        }));
      }
    });

    // Subscribe to real-time Firestore sync
    const unsubscribeFirestore = subscribeToFirestoreRoom(roomId, (cloudData) => {
      if (!isMounted || !cloudData) return;
      if (!appData.lastUpdated || (cloudData.lastUpdated && cloudData.lastUpdated > appData.lastUpdated)) {
        isIncomingSyncRef.current = true;
        setAppData((prev) => ({
          ...prev,
          tasks: cloudData.tasks || prev.tasks,
          transactions: cloudData.transactions || prev.transactions,
          bills: Array.isArray(cloudData.bills) ? cloudData.bills : (prev.bills || DEFAULT_RECURRING_BILLS),
          taskCategories: cloudData.taskCategories || prev.taskCategories,
          financeCategories: cloudData.financeCategories || prev.financeCategories,
          monthlyBudget: cloudData.monthlyBudget || prev.monthlyBudget,
          voiceSettings: cloudData.voiceSettings || prev.voiceSettings,
          theme: cloudData.theme || prev.theme,
          notifications: cloudData.notifications || prev.notifications,
          lastUpdated: cloudData.lastUpdated || Date.now(),
        }));
      }
    });

    return () => {
      isMounted = false;
      if (unsubscribeFirestore) unsubscribeFirestore();
    };
  }, [appData.syncRoomId]);

  // Real-Time Server-Sent Events (SSE) listener for multi-device sync fallback
  useEffect(() => {
    const roomId = appData.syncRoomId || getSyncRoomId();
    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource(`/api/sync/stream/${roomId}`);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'SYNC_UPDATE' && data.payload) {
            const p = data.payload;
            // Only update if newer
            if (!appData.lastUpdated || (p.lastUpdated && p.lastUpdated > appData.lastUpdated)) {
              isIncomingSyncRef.current = true;
              setAppData((prev) => ({
                ...prev,
                tasks: p.tasks || prev.tasks,
                transactions: p.finances || p.transactions || prev.transactions,
                bills: Array.isArray(p.bills) ? p.bills : (prev.bills || DEFAULT_RECURRING_BILLS),
                taskCategories: p.categories || p.taskCategories || prev.taskCategories,
                financeCategories: p.financeCategories || prev.financeCategories,
                monthlyBudget: typeof p.monthlyBudget === 'number' 
                  ? { totalBudget: p.monthlyBudget, categoryBudgets: p.categoryBudgets || prev.monthlyBudget.categoryBudgets, alertThresholdPercent: 80 }
                  : (p.monthlyBudget || prev.monthlyBudget),
                voiceSettings: p.voiceSettings || prev.voiceSettings,
                theme: p.theme || prev.theme,
                lastUpdated: p.lastUpdated || Date.now(),
              }));
            }
          }
        } catch (e) {
          // ignore heartbeat / format errors
        }
      };

      eventSource.onerror = () => {
        // SSE auto-reconnects
      };
    } catch (err) {
      console.warn('SSE connect error:', err);
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [appData.syncRoomId]);

  // Background deadline & budget & recurring bills alert watcher (runs every 10 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      checkDeadlinesAndBudgets(
        appData.tasks,
        appData.transactions,
        appData.monthlyBudget,
        appData.voiceSettings,
        (newNotif) => {
          setAppData((prev) => ({
            ...prev,
            notifications: [newNotif, ...prev.notifications].slice(0, 50),
          }));
        },
        (taskId, stage) => {
          setAppData((prev) => ({
            ...prev,
            tasks: prev.tasks.map((t) =>
              t.id === taskId
                ? {
                    ...t,
                    notifiedStages: Array.from(new Set([...(t.notifiedStages || []), stage])),
                    notified: true,
                  }
                : t
            ),
          }));
        },
        appData.bills || []
      );
    }, 10000);

    return () => clearInterval(interval);
  }, [appData.tasks, appData.transactions, appData.monthlyBudget, appData.voiceSettings, appData.bills]);

  // Sync scheduled background alarms with Service Worker (for alerts when browser tab is closed/backgrounded)
  useEffect(() => {
    syncScheduledAlarmsWithServiceWorker(appData.tasks, appData.bills || []);
  }, [appData.tasks, appData.bills]);

  // Focus Session Countdown Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (focusSessionState.isActive && !focusSessionState.isPaused) {
      interval = setInterval(() => {
        setFocusSessionState((prev) => {
          if (prev.remainingSeconds <= 1) {
            // Sesi Selesai!
            stopAmbientSound();
            playChime('success');
            const name = appData.voiceSettings.userName || 'Ipan';
            const activeTask = appData.tasks.find((t) => t.id === prev.selectedTaskId);
            const taskMsg = activeTask ? ` untuk tugas "${activeTask.title}"` : '';

            if (appData.voiceSettings.enabled) {
              speakText(
                `Selamat ${name}! Sesi fokus ${prev.durationMinutes} menit${taskMsg} telah selesai. Luar biasa! Waktunya istirahat sejenak.`,
                appData.voiceSettings
              );
            }

            // Tambahkan notifikasi pencapaian
            const newNotifItem: NotificationItem = {
              id: `focus-done-${Date.now()}`,
              title: '🎉 Sesi Fokus Selesai!',
              message: `Hebat! Kamu telah menuntaskan sesi fokus ${prev.durationMinutes} menit${taskMsg}.`,
              type: 'system',
              timestamp: new Date().toISOString(),
              read: false,
            };

            setAppData((appPrev) => ({
              ...appPrev,
              notifications: [newNotifItem, ...appPrev.notifications].slice(0, 50),
            }));

            return {
              ...prev,
              isActive: false,
              isPaused: false,
              remainingSeconds: prev.durationMinutes * 60,
              completedSessionsCount: (prev.completedSessionsCount || 0) + 1,
            };
          }

          return {
            ...prev,
            remainingSeconds: prev.remainingSeconds - 1,
          };
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [focusSessionState.isActive, focusSessionState.isPaused, appData.voiceSettings, appData.tasks]);

  // Persist Focus Session State to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('taskpan_focus_state', JSON.stringify(focusSessionState));
    } catch (e) {
      // ignore
    }
  }, [focusSessionState]);

  // Task Handlers
  const handleSaveTask = (task: Task) => {
    setAppData((prev) => {
      const exists = prev.tasks.some((t) => t.id === task.id);
      const updatedTasks = exists
        ? prev.tasks.map((t) => (t.id === task.id ? task : t))
        : [task, ...prev.tasks];
      return { ...prev, tasks: updatedTasks, lastUpdated: Date.now() };
    });
  };

  const handleToggleTaskComplete = (taskId: string) => {
    setAppData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              completed: !t.completed,
              completedAt: !t.completed ? new Date().toISOString() : undefined,
            }
          : t
      ),
      lastUpdated: Date.now(),
    }));
  };

  const handleDeleteTask = (taskId: string) => {
    setAppData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== taskId),
      lastUpdated: Date.now(),
    }));
  };

  const handleAddTaskCategory = (cat: TaskCategory) => {
    setAppData((prev) => ({
      ...prev,
      taskCategories: [...prev.taskCategories, cat],
      lastUpdated: Date.now(),
    }));
  };

  // Transaction Handlers
  const handleSaveTransaction = (tx: Transaction) => {
    setAppData((prev) => {
      const exists = prev.transactions.some((t) => t.id === tx.id);
      const updated = exists
        ? prev.transactions.map((t) => (t.id === tx.id ? tx : t))
        : [tx, ...prev.transactions];
      return { ...prev, transactions: updated, lastUpdated: Date.now() };
    });
  };

  const handleDeleteTransaction = (txId: string) => {
    setAppData((prev) => ({
      ...prev,
      transactions: prev.transactions.filter((t) => t.id !== txId),
      lastUpdated: Date.now(),
    }));
  };

  const handleAddFinanceCategory = (cat: FinanceCategory) => {
    setAppData((prev) => ({
      ...prev,
      financeCategories: [...prev.financeCategories, cat],
      lastUpdated: Date.now(),
    }));
  };

  // Recurring Bill Handlers
  const handleSaveBill = (bill: RecurringBill) => {
    setAppData((prev) => {
      const currentBills = prev.bills || [];
      const exists = currentBills.some((b) => b.id === bill.id);
      const updatedBills = exists
        ? currentBills.map((b) => (b.id === bill.id ? bill : b))
        : [bill, ...currentBills];
      return { ...prev, bills: updatedBills, lastUpdated: Date.now() };
    });
  };

  const handleDeleteBill = (billId: string) => {
    setAppData((prev) => ({
      ...prev,
      bills: (prev.bills || []).filter((b) => b.id !== billId),
      lastUpdated: Date.now(),
    }));
  };

  const handleToggleBillPaid = (bill: RecurringBill, isPaid: boolean, createTransaction: boolean) => {
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    setAppData((prev) => {
      const currentBills = prev.bills || [];
      const updatedBills = currentBills.map((b) => {
        if (b.id !== bill.id) return b;
        const currentPaidMonths = b.paidMonths || [];
        const newPaidMonths = isPaid
          ? Array.from(new Set([...currentPaidMonths, currentMonthStr]))
          : currentPaidMonths.filter((m) => m !== currentMonthStr);
        return { ...b, paidMonths: newPaidMonths };
      });

      let updatedTransactions = prev.transactions;
      if (isPaid && createTransaction) {
        const newTx: Transaction = {
          id: `tx-bill-${bill.id}-${Date.now()}`,
          title: `Pembayaran ${bill.title}`,
          amount: bill.amount,
          type: 'expense',
          category: bill.category,
          expenseGroup: 'routine',
          date: new Date().toISOString(),
          paymentMethod: bill.paymentMethod || 'transfer',
          notes: `Otomatis dicatat dari pengingat tagihan bulanan (${currentMonthStr})`,
          relatedBillId: bill.id,
          createdAt: new Date().toISOString(),
        };
        updatedTransactions = [newTx, ...prev.transactions];
      }

      return {
        ...prev,
        bills: updatedBills,
        transactions: updatedTransactions,
        lastUpdated: Date.now(),
      };
    });
  };

  const handleUpdateBudget = (budgetConfig: MonthlyBudgetConfig) => {
    setAppData((prev) => ({
      ...prev,
      monthlyBudget: budgetConfig,
      lastUpdated: Date.now(),
    }));
  };

  // Voice Settings Handler
  const handleSaveVoiceSettings = (voiceSettings: VoiceSettings) => {
    setAppData((prev) => ({
      ...prev,
      voiceSettings,
      lastUpdated: Date.now(),
    }));
  };

  // Sync Room Handler
  const handleChangeSyncRoomId = (newRoomId: string) => {
    setSyncRoomId(newRoomId);
    setAppData((prev) => ({
      ...prev,
      syncRoomId: newRoomId,
      lastUpdated: Date.now(),
    }));
  };

  const handleForceSync = async () => {
    setIsSyncing(true);
    await pushDataToServer(appData);
    setIsSyncing(false);
  };

  const handleImportData = (imported: AppSyncData) => {
    setAppData({
      ...imported,
      lastUpdated: Date.now(),
    });
  };

  // Notification Handlers
  const unreadNotifsCount = appData.notifications.filter((n) => !n.read).length;

  const handleMarkAllNotifsRead = () => {
    setAppData((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
  };

  const handleClearAllNotifs = () => {
    setAppData((prev) => ({
      ...prev,
      notifications: [],
    }));
  };

  const handleOpenFocusModal = (taskId?: string) => {
    initAudioOnUserGesture();
    if (taskId) {
      setFocusSessionState((prev) => ({
        ...prev,
        selectedTaskId: taskId,
      }));
    }
    setIsFocusModalOpen(true);
  };

  const handleStopFocusSession = () => {
    stopAmbientSound();
    setFocusSessionState((prev) => ({
      ...prev,
      isActive: false,
      isPaused: false,
      remainingSeconds: prev.durationMinutes * 60,
    }));
  };

  const handleStartFocusTask = (taskId: string) => {
    handleOpenFocusModal(taskId);
  };

  const handleStartFocusBrief = () => {
    handleOpenFocusModal();
  };

  // Handle Unlock App Screen: Read aloud existing tasks & open Quick Task Entry Popup
  const handleUnlockApp = () => {
    setIsLocked(false);
    initAudioOnUserGesture();

    // 1. Voice briefing: Read aloud existing tasks in natural Indonesian
    const name = appData.voiceSettings.userName || 'Ipan';
    const pendingTasks = appData.tasks.filter((t) => !t.completed);

    let speechPrompt = '';
    if (pendingTasks.length === 0) {
      speechPrompt = `Selamat datang kembali di TaskPan, ${name}! Saat ini belum ada tugas aktif yang tertunda. Silakan buat tugas baru atau atur rencana produktivitasmu hari ini.`;
    } else if (pendingTasks.length === 1) {
      const t = pendingTasks[0];
      const dueTime = t.dueDate ? ` dengan batas waktu jam ${new Date(t.dueDate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}` : '';
      speechPrompt = `Selamat datang di TaskPan, ${name}! Kamu memiliki 1 tugas aktif: "${t.title}"${dueTime}. Ayo selesaikan sekarang!`;
    } else {
      const taskListSpoken = pendingTasks
        .slice(0, 3)
        .map((t, idx) => {
          const timeStr = t.dueDate ? ` (jam ${new Date(t.dueDate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })})` : '';
          return `Tugas ${idx + 1}: "${t.title}"${timeStr}`;
        })
        .join('. ');
      const extraCount = pendingTasks.length > 3 ? ` dan ${pendingTasks.length - 3} tugas lainnya` : '';
      speechPrompt = `Selamat datang di TaskPan, ${name}! Kamu memiliki ${pendingTasks.length} tugas aktif hari ini. ${taskListSpoken}${extraCount}. Mau mulai kerjakan atau tambahkan tugas apa sekarang?`;
    }

    if (appData.voiceSettings.enabled) {
      speakText(speechPrompt, appData.voiceSettings);
    }

    // 2. Immediately open the Quick Task Popup Modal
    setIsQuickEntryModalOpen(true);
  };

  // Filtered tasks for search query
  const displayedTasks = searchQuery.trim()
    ? appData.tasks.filter(t => 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        t.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : appData.tasks;

  // Render PIN Lock Screen if locked on startup or manually locked
  if (isLocked) {
    return (
      <ClayPinLock
        onUnlock={handleUnlockApp}
        darkMode={darkMode}
        userName={appData.voiceSettings.userName || 'Ipan'}
      />
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      darkMode ? 'bg-[#181513] text-[#FAF4EE]' : 'bg-[#F5EBE1] text-[#3E2F26]'
    }`}>
      
      <div className="max-w-[1440px] mx-auto px-3 sm:px-4 md:px-5 lg:px-6 pt-[calc(env(safe-area-inset-top,0px)+0.6rem)] sm:pt-4 md:pt-5 lg:pt-6 pb-6 flex flex-col md:flex-row gap-3.5 sm:gap-4 lg:gap-6 items-start">
        
        {/* LEFT 3D CLAY SIDEBAR (Desktop/Tablet) */}
        <div className="hidden md:block sticky top-6">
          <ClaySidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            userName={appData.voiceSettings.userName || 'Ipan'}
            syncRoomId={appData.syncRoomId}
            isSyncing={isSyncing}
            openSyncModal={() => setIsSyncModalOpen(true)}
            openVoiceModal={() => setIsVoiceModalOpen(true)}
            openInstallModal={() => setIsInstallModalOpen(true)}
            openSecurityPinModal={() => setIsSecurityPinModalOpen(true)}
            onLockApp={() => setIsLocked(true)}
            darkMode={darkMode}
            onStartFocusBrief={handleStartFocusBrief}
            openFocusModal={() => handleOpenFocusModal()}
            isFocusActive={focusSessionState.isActive}
          />
        </div>

        {/* RIGHT MAIN WORKSPACE VIEW */}
        <div className="flex-1 min-w-0 w-full space-y-4">
          
          {/* Top Clay Search & Action Bar */}
          <Navbar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            syncRoomId={appData.syncRoomId}
            isSyncing={isSyncing}
            connectedDevicesCount={connectedDevicesCount}
            openSyncModal={() => setIsSyncModalOpen(true)}
            openVoiceModal={() => setIsVoiceModalOpen(true)}
            openNotificationDrawer={() => setIsNotificationDrawerOpen(true)}
            openInstallModal={() => setIsInstallModalOpen(true)}
            openSecurityPinModal={() => setIsSecurityPinModalOpen(true)}
            onLockApp={() => setIsLocked(true)}
            openFocusModal={() => handleOpenFocusModal()}
            isFocusActive={focusSessionState.isActive}
            unreadNotifsCount={unreadNotifsCount}
            voiceSettings={appData.voiceSettings}
            setVoiceSettings={(updater) => {
              setAppData((prev) => ({
                ...prev,
                voiceSettings: typeof updater === 'function' ? updater(prev.voiceSettings) : updater,
              }));
            }}
            openAddTask={() => {
              setTaskToEdit(null);
              setIsTaskModalOpen(true);
            }}
            openAddTransaction={() => {
              setTxToEdit(null);
              setIsTxModalOpen(true);
            }}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          {/* Active Content Tab */}
          <main className="pb-24 md:pb-8">
            
            {activeTab === 'dashboard' && (
              <ClayDashboardOverview
                tasks={displayedTasks}
                transactions={appData.transactions}
                taskCategories={appData.taskCategories}
                financeCategories={appData.financeCategories}
                budgetConfig={appData.monthlyBudget}
                voiceSettings={appData.voiceSettings}
                characterConfig={appData.characterAvatar || appData.voiceSettings.characterAvatar}
                onSaveCharacterConfig={(newCharConfig) => {
                  setAppData((prev) => ({
                    ...prev,
                    characterAvatar: newCharConfig,
                    voiceSettings: {
                      ...prev.voiceSettings,
                      characterAvatar: newCharConfig,
                    },
                  }));
                }}
                onToggleTaskComplete={handleToggleTaskComplete}
                onOpenNewTaskModal={() => {
                  setTaskToEdit(null);
                  setIsTaskModalOpen(true);
                }}
                onOpenNewTxModal={() => {
                  setTxToEdit(null);
                  setIsTxModalOpen(true);
                }}
                onNavigateTab={setActiveTab}
                openFocusModal={() => handleOpenFocusModal()}
                isFocusActive={focusSessionState.isActive}
                darkMode={darkMode}
              />
            )}

            {activeTab === 'tasks' && (
              <TaskList
                tasks={displayedTasks}
                onToggleComplete={handleToggleTaskComplete}
                onDeleteTask={handleDeleteTask}
                onEditTask={(t) => {
                  setTaskToEdit(t);
                  setIsTaskModalOpen(true);
                }}
                onOpenNewTaskModal={() => {
                  setTaskToEdit(null);
                  setIsTaskModalOpen(true);
                }}
                onStartFocusTask={handleStartFocusTask}
                categories={appData.taskCategories}
                voiceSettings={appData.voiceSettings}
                darkMode={darkMode}
              />
            )}

            {activeTab === 'calendar' && (
              <CalendarSchedule
                tasks={displayedTasks}
                taskCategories={appData.taskCategories}
                transactions={appData.transactions}
                financeCategories={appData.financeCategories}
                onOpenNewTaskModal={(defaultDate) => {
                  setTaskToEdit(null);
                  setTaskInitialDueDate(defaultDate);
                  setIsTaskModalOpen(true);
                }}
                onOpenNewTxModal={(defaultDate) => {
                  setTxToEdit(null);
                  setTxInitialDate(defaultDate);
                  setIsTxModalOpen(true);
                }}
                onEditTask={(t) => {
                  setTaskToEdit(t);
                  setTaskInitialDueDate(undefined);
                  setIsTaskModalOpen(true);
                }}
                onToggleComplete={handleToggleTaskComplete}
                onEditTx={(tx) => {
                  setTxToEdit(tx);
                  setTxInitialDate(undefined);
                  setIsTxModalOpen(true);
                }}
                onDeleteTx={handleDeleteTransaction}
                darkMode={darkMode}
              />
            )}

            {activeTab === 'finance' && (
              <FinanceDashboard
                transactions={appData.transactions}
                categories={appData.financeCategories}
                budgetConfig={appData.monthlyBudget}
                bills={appData.bills || []}
                onUpdateBudget={handleUpdateBudget}
                onSaveBill={handleSaveBill}
                onDeleteBill={handleDeleteBill}
                onToggleBillPaid={handleToggleBillPaid}
                onOpenNewTxModal={() => {
                  setTxToEdit(null);
                  setIsTxModalOpen(true);
                }}
                onEditTx={(tx) => {
                  setTxToEdit(tx);
                  setIsTxModalOpen(true);
                }}
                onDeleteTx={handleDeleteTransaction}
                darkMode={darkMode}
              />
            )}

            {activeTab === 'analytics' && (
              <WeeklyProgressChart
                tasks={appData.tasks}
                taskCategories={appData.taskCategories}
                transactions={appData.transactions}
                financeCategories={appData.financeCategories}
                budgetConfig={appData.monthlyBudget}
                darkMode={darkMode}
              />
            )}

          </main>

        </div>

      </div>

      {/* FLUID MOBILE BOTTOM NAVIGATION BAR WITH 3D ORB */}
      <FluidBottomNav
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        darkMode={darkMode}
      />

      {/* Modals & Slide-over Drawers */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskToEdit(null);
          setTaskInitialDueDate(undefined);
        }}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
        initialDueDate={taskInitialDueDate}
        categories={appData.taskCategories}
        onAddCategory={handleAddTaskCategory}
        voiceSettings={appData.voiceSettings}
        darkMode={darkMode}
      />

      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setTxToEdit(null);
          setTxInitialDate(undefined);
        }}
        onSave={handleSaveTransaction}
        txToEdit={txToEdit}
        initialDate={txInitialDate}
        categories={appData.financeCategories}
        onAddCategory={handleAddFinanceCategory}
        darkMode={darkMode}
      />

      <VoiceSettingsModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        voiceSettings={appData.voiceSettings}
        onSaveVoiceSettings={handleSaveVoiceSettings}
        darkMode={darkMode}
      />

      <SyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        syncRoomId={appData.syncRoomId}
        onChangeSyncRoomId={handleChangeSyncRoomId}
        onForceSync={handleForceSync}
        isSyncing={isSyncing}
        appData={appData}
        onImportData={handleImportData}
        darkMode={darkMode}
      />

      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        notifications={appData.notifications}
        onMarkAllRead={handleMarkAllNotifsRead}
        onClearAll={handleClearAllNotifs}
        openInstallModal={() => setIsInstallModalOpen(true)}
        darkMode={darkMode}
      />

      <InstallPwaModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        darkMode={darkMode}
      />

      {/* Security PIN Manager Modal (Inside App) */}
      <SecurityPinModal
        isOpen={isSecurityPinModalOpen}
        onClose={() => setIsSecurityPinModalOpen(false)}
        darkMode={darkMode}
      />

      {/* Quick Task Entry Modal (Voice & Text Task Input) */}
      <QuickTaskEntryModal
        isOpen={isQuickEntryModalOpen}
        onClose={() => setIsQuickEntryModalOpen(false)}
        onSaveTask={handleSaveTask}
        categories={appData.taskCategories}
        existingTasks={appData.tasks}
        darkMode={darkMode}
        voiceSettings={appData.voiceSettings}
        userName={appData.voiceSettings.userName || 'Ipan'}
      />

      {/* Floating Focus Mini Player Widget (When minimized / navigating tabs) */}
      {!isFocusModalOpen && (
        <FloatingFocusBar
          sessionState={focusSessionState}
          setSessionState={setFocusSessionState}
          onMaximize={() => setIsFocusModalOpen(true)}
          onStopSession={handleStopFocusSession}
          tasks={appData.tasks}
          darkMode={darkMode}
        />
      )}

      {/* Focus Mode & Music Hub Room (Spotify, Apple Music, Binaural / Lofi Ambient) */}
      <FocusSessionModal
        isOpen={isFocusModalOpen}
        onClose={() => setIsFocusModalOpen(false)}
        onMinimize={() => setIsFocusModalOpen(false)}
        sessionState={focusSessionState}
        setSessionState={setFocusSessionState}
        tasks={appData.tasks}
        voiceSettings={appData.voiceSettings}
        darkMode={darkMode}
      />

    </div>
  );
}

