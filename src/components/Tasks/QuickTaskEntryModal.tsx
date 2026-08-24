import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Plus, 
  Sparkles, 
  Mic, 
  MicOff, 
  Calendar, 
  Clock, 
  Flag, 
  Tag, 
  CheckCircle2, 
  Volume2, 
  ArrowRight,
  ListTodo,
  Flame
} from 'lucide-react';
import { Task, TaskCategory, PriorityLevel, VoiceSettings } from '../../types';
import { playChime, speakText } from '../../utils/audio';

interface QuickTaskEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTask: (task: Task) => void;
  categories: TaskCategory[];
  existingTasks: Task[];
  darkMode: boolean;
  voiceSettings: VoiceSettings;
  userName?: string;
}

export const QuickTaskEntryModal: React.FC<QuickTaskEntryModalProps> = ({
  isOpen,
  onClose,
  onSaveTask,
  categories,
  existingTasks,
  darkMode,
  voiceSettings,
  userName = 'Ipan',
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(categories[0]?.id || 'Kerja');
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setHours(17, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const pendingTasks = existingTasks.filter(t => !t.completed);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
    }
  }, [isOpen]);

  // Voice speech recognition for quick input
  const toggleVoiceInput = () => {
    if (typeof window === 'undefined') return;

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      alert('Fitur input suara (Speech Recognition) belum didukung pada browser ini.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.lang = 'id-ID';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        playChime('pop');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setTitle((prev) => (prev ? `${prev} ${transcript}` : transcript));
          playChime('success');
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn('Voice recognition error:', e);
      setIsListening(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask: Task = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title: title.trim(),
      category: category || categories[0]?.id || 'Kerja',
      priority,
      dueDate: dueDate || new Date().toISOString(),
      reminderMinutesBefore: 15,
      completed: false,
      createdAt: new Date().toISOString(),
      subtasks: [],
      voiceReminderEnabled: true,
    };

    onSaveTask(newTask);
    playChime('success');

    // Friendly voice confirmation
    if (voiceSettings.enabled) {
      const prompt = `Tugas "${newTask.title}" berhasil ditambahkan. Semangat mengerjakannya, ${userName}!`;
      speakText(prompt, voiceSettings);
    }

    setTitle('');
    onClose();
  };

  const quickSuggestions = [
    'Selesaikan Laporan Harian',
    'Follow up Proyek & Klien',
    'Review Anggaran & Pengeluaran',
    'Olahraga & Istirahat 20 Menit',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-fadeIn">
      <div className={`relative w-full max-w-lg p-6 sm:p-7 rounded-[36px] transition-all overflow-hidden ${
        darkMode
          ? 'bg-[#221E1B] text-[#FAF4EE] border border-white/10 shadow-2xl'
          : 'bg-[#FAF3EC] text-[#3E2F26] border-2 border-white/80 shadow-[0_20px_50px_rgba(186,163,143,0.35)]'
      }`}>
        
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E8DACB] dark:border-white/10 mb-4 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-orange-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] uppercase font-black tracking-widest text-orange-600 dark:text-orange-400">Rencana Kerja Cepat</span>
                <span className="px-1.5 py-0.2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-black rounded-md">Live</span>
              </div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">Mau Kerjakan Apa Hari Ini, {userName}?</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#8A796E] hover:text-[#3E2F26] dark:hover:text-white bg-black/5 dark:bg-white/5 hover:bg-black/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {/* Main Task Title Input with Speech to text button */}
          <div>
            <label className="block text-xs font-black text-[#5A453A] dark:text-[#C5B7AE] mb-1.5">
              Judul Tugas / Rencana Kerja
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Selesaikan desain proposal klien..."
                required
                className={`w-full pl-4 pr-12 py-3 rounded-2xl text-sm font-bold border transition focus:outline-none ${
                  darkMode
                    ? 'bg-[#1D1917] border-white/10 text-white placeholder:text-[#66574D] focus:border-orange-500'
                    : 'bg-white border-orange-200 text-[#3E2F26] placeholder:text-[#A8988D] focus:border-orange-500 shadow-inner'
                }`}
              />

              <button
                type="button"
                onClick={toggleVoiceInput}
                title={isListening ? 'Berhenti mendengarkan' : 'Bicara untuk ketik otomatis'}
                className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl flex items-center justify-center transition active:scale-90 ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse shadow-md'
                    : 'bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 hover:bg-orange-200'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quick Suggestions Chips */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-[#8A796E] dark:text-[#BDB0A4] uppercase tracking-wider">
              Saran Cepat:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickSuggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setTitle(suggestion);
                    playChime('pop');
                  }}
                  className={`text-[11px] px-2.5 py-1 rounded-xl font-bold transition active:scale-95 ${
                    darkMode
                      ? 'bg-[#2E2723] text-[#C5B7AE] hover:text-white hover:bg-white/10'
                      : 'bg-white text-[#6D5A4E] hover:text-[#3E2F26] hover:bg-orange-100/60 border border-orange-100 shadow-2xs'
                  }`}
                >
                  + {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Priority & Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Priority Selector */}
            <div>
              <label className="block text-[11px] font-bold text-[#5A453A] dark:text-[#C5B7AE] mb-1">
                Prioritas Tugas
              </label>
              <div className="grid grid-cols-4 gap-1">
                {[
                  { id: 'low', label: 'Rendah', color: 'text-blue-500' },
                  { id: 'medium', label: 'Sedang', color: 'text-amber-500' },
                  { id: 'high', label: 'Tinggi', color: 'text-orange-500' },
                  { id: 'urgent', label: 'Mendesak', color: 'text-rose-500' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setPriority(p.id as PriorityLevel);
                      playChime('pop');
                    }}
                    className={`py-1.5 text-[10px] font-extrabold rounded-xl transition ${
                      priority === p.id
                        ? 'bg-orange-500 text-white shadow-xs'
                        : darkMode
                        ? 'bg-[#1D1917] text-[#A8988D] border border-white/5'
                        : 'bg-white text-[#7A685D] border border-orange-100 shadow-2xs'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Selector */}
            <div>
              <label className="block text-[11px] font-bold text-[#5A453A] dark:text-[#C5B7AE] mb-1">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full px-3 py-1.5 rounded-xl text-xs font-bold border transition focus:outline-none ${
                  darkMode
                    ? 'bg-[#1D1917] border-white/10 text-white focus:border-orange-500'
                    : 'bg-white border-orange-200 text-[#3E2F26] focus:border-orange-500 shadow-inner'
                }`}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Tasks Summary Briefing */}
          {pendingTasks.length > 0 && (
            <div className={`p-3 rounded-2xl border ${
              darkMode ? 'bg-[#1C1816] border-white/5' : 'bg-white/80 border-orange-100'
            }`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-black text-orange-600 dark:text-orange-400 flex items-center space-x-1">
                  <ListTodo className="w-3.5 h-3.5" />
                  <span>{pendingTasks.length} Tugas Sedang Berjalan:</span>
                </span>
                <span className="text-[10px] text-[#8A796E] dark:text-[#A8988D] font-medium">Siap diselesaikan</span>
              </div>
              <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                {pendingTasks.slice(0, 3).map((t) => (
                  <div key={t.id} className="flex items-center space-x-2 text-xs truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                    <span className="font-bold truncate text-[#4A3B32] dark:text-[#E8DACB]">{t.title}</span>
                  </div>
                ))}
                {pendingTasks.length > 3 && (
                  <p className="text-[10px] text-[#8A796E] font-medium italic">
                    + {pendingTasks.length - 3} tugas lainnya...
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl text-xs font-bold text-[#8A796E] hover:text-[#3E2F26] dark:hover:text-white bg-black/5 dark:bg-white/5 transition active:scale-95"
            >
              Lanjut ke Dashboard
            </button>

            <button
              type="submit"
              disabled={!title.trim()}
              className={`flex-1 py-3 rounded-2xl text-xs font-extrabold text-white transition active:scale-95 shadow-md flex items-center justify-center space-x-1.5 ${
                title.trim()
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-orange-500/30'
                  : 'bg-gray-400 opacity-50 cursor-not-allowed'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Tambahkan & Mulai</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
