import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  Tag, 
  Flag, 
  CheckSquare, 
  Plus, 
  Trash2, 
  Volume2, 
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { Task, PriorityLevel, TaskCategory, SubTask, VoiceSettings } from '../../types';
import { getGoogleCalendarUrl, downloadIcsCalendar } from '../../utils/calendar';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  taskToEdit?: Task | null;
  initialDueDate?: string;
  categories: TaskCategory[];
  onAddCategory: (category: TaskCategory) => void;
  voiceSettings: VoiceSettings;
  darkMode: boolean;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  taskToEdit,
  initialDueDate,
  categories,
  onAddCategory,
  voiceSettings,
  darkMode,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('work');
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [dueDate, setDueDate] = useState('');
  const [reminderMinutesBefore, setReminderMinutesBefore] = useState(15);
  const [estimatedMinutes, setEstimatedMinutes] = useState(45);
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [voiceReminderEnabled, setVoiceReminderEnabled] = useState(true);
  const [customVoicePrompt, setCustomVoicePrompt] = useState('');
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#3b82f6');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setCategory(taskToEdit.category);
      setPriority(taskToEdit.priority);
      setDueDate(taskToEdit.dueDate ? taskToEdit.dueDate.slice(0, 16) : '');
      setReminderMinutesBefore(taskToEdit.reminderMinutesBefore || 15);
      setEstimatedMinutes(taskToEdit.estimatedMinutes || 45);
      setSubtasks(taskToEdit.subtasks || []);
      setVoiceReminderEnabled(taskToEdit.voiceReminderEnabled ?? true);
      setCustomVoicePrompt(taskToEdit.customVoicePrompt || '');
    } else {
      // Default to today + 2 hours
      const now = new Date();
      now.setHours(now.getHours() + 2, 0, 0, 0);
      const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      
      setTitle('');
      setDescription('');
      setCategory(categories[0]?.id || 'work');
      setPriority('medium');
      setDueDate(initialDueDate || localIso);
      setReminderMinutesBefore(15);
      setEstimatedMinutes(45);
      setSubtasks([]);
      setVoiceReminderEnabled(true);
      setCustomVoicePrompt('');
    }
  }, [taskToEdit, initialDueDate, isOpen, categories]);

  if (!isOpen) return null;

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const newSub: SubTask = {
      id: 'sub-' + Date.now() + Math.random().toString(36).substr(2, 4),
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    setSubtasks([...subtasks, newSub]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks(
      subtasks.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
  };

  const handleCreateCategory = () => {
    if (!newCatName.trim()) return;
    const catId = 'cat-' + Date.now();
    const newCat: TaskCategory = {
      id: catId,
      name: newCatName.trim(),
      color: newCatColor,
    };
    onAddCategory(newCat);
    setCategory(catId);
    setNewCatName('');
    setIsAddingNewCategory(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const taskData: Task = {
      id: taskToEdit ? taskToEdit.id : 'task-' + Date.now(),
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : new Date().toISOString(),
      reminderMinutesBefore: Number(reminderMinutesBefore),
      completed: taskToEdit ? taskToEdit.completed : false,
      completedAt: taskToEdit ? taskToEdit.completedAt : undefined,
      createdAt: taskToEdit ? taskToEdit.createdAt : new Date().toISOString(),
      estimatedMinutes: Number(estimatedMinutes),
      subtasks,
      voiceReminderEnabled,
      customVoicePrompt: customVoicePrompt.trim() || undefined,
      notified: false,
    };

    onSave(taskData);
    onClose();
  };

  const tempTask: Task = {
    id: taskToEdit?.id || 'temp',
    title: title || 'Tugas Baru',
    description,
    category,
    priority,
    dueDate: dueDate ? new Date(dueDate).toISOString() : new Date().toISOString(),
    reminderMinutesBefore,
    completed: false,
    createdAt: new Date().toISOString(),
    estimatedMinutes,
    subtasks,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl clay-modal flex flex-col max-h-[88vh] sm:max-h-[85vh] rounded-[24px] sm:rounded-[32px] overflow-hidden my-auto shadow-2xl transition-all">
        
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#E8DACB] dark:border-white/10 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-200 dark:border-orange-800 shadow-inner flex-shrink-0">
              <CheckSquare className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-[#3E2F26] dark:text-[#FAF4EE]">
                {taskToEdit ? 'Ubah Tugas' : 'Tambah Tugas Baru'}
              </h2>
              <p className="text-[11px] sm:text-xs text-[#8A796E] dark:text-[#BDB0A4] font-medium line-clamp-1">
                Lengkapi prioritas, tenggat waktu, dan pengingat suara
              </p>
            </div>
          </div>
          <button
            id="close-task-modal-btn"
            onClick={onClose}
            className="clay-button p-2 sm:p-2.5 rounded-xl sm:rounded-2xl text-[#8A796E] dark:text-[#D4C7BC] flex-shrink-0"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-3.5 sm:p-6 space-y-3.5 sm:space-y-4 overflow-y-auto flex-1">
          
          {/* Title */}
          <div>
            <label className="block text-[11px] sm:text-xs font-extrabold uppercase tracking-wider mb-1.5 text-[#8A796E] dark:text-[#BDB0A4]">
              Judul Tugas <span className="text-rose-500">*</span>
            </label>
            <input
              id="task-title-input"
              type="text"
              required
              placeholder="Contoh: Selesaikan Desain Wireframe Dashboard"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 clay-input text-xs sm:text-sm font-bold text-[#3E2F26] dark:text-[#FAF4EE] placeholder-[#A8988D] focus:outline-none transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] sm:text-xs font-extrabold uppercase tracking-wider mb-1.5 text-[#8A796E] dark:text-[#BDB0A4]">
              Deskripsi & Catatan
            </label>
            <textarea
              id="task-desc-input"
              rows={2}
              placeholder="Tambahkan detail instruksi atau link referensi..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 clay-input text-xs sm:text-sm font-medium text-[#3E2F26] dark:text-[#FAF4EE] placeholder-[#A8988D] focus:outline-none transition resize-none"
            />
          </div>

          {/* Grid: Priority & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Priority */}
            <div>
              <label className="block text-[11px] sm:text-xs font-extrabold uppercase tracking-wider mb-1.5 text-[#8A796E] dark:text-[#BDB0A4]">
                <Flag className="w-3.5 h-3.5 inline mr-1 text-orange-600 dark:text-orange-400" />
                Tingkat Prioritas
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['low', 'medium', 'high', 'urgent'] as PriorityLevel[]).map((lvl) => {
                  const labels: Record<PriorityLevel, { text: string }> = {
                    low: { text: 'Rendah' },
                    medium: { text: 'Sedang' },
                    high: { text: 'Tinggi' },
                    urgent: { text: 'Mendesak' },
                  };
                  const isSelected = priority === lvl;
                  return (
                    <button
                      type="button"
                      key={lvl}
                      onClick={() => setPriority(lvl)}
                      className={`py-2 px-1 text-[11px] sm:text-xs font-extrabold rounded-xl sm:rounded-2xl transition cursor-pointer ${
                        isSelected 
                          ? 'clay-button-primary text-white' 
                          : 'clay-button text-[#6B5A4E] dark:text-[#D4C7BC]'
                      }`}
                    >
                      {labels[lvl].text}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-[#8A796E] dark:text-[#BDB0A4]">
                  <Tag className="w-3.5 h-3.5 inline mr-1 text-orange-600 dark:text-orange-400" />
                  Kategori
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddingNewCategory(!isAddingNewCategory)}
                  className="text-[10px] sm:text-[11px] font-bold text-orange-600 dark:text-orange-400 hover:underline"
                >
                  {isAddingNewCategory ? 'Batal' : '+ Kategori Baru'}
                </button>
              </div>

              {isAddingNewCategory ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Nama Kategori..."
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs clay-input font-bold text-[#3E2F26] dark:text-[#FAF4EE] focus:outline-none"
                  />
                  <input
                    type="color"
                    value={newCatColor}
                    onChange={(e) => setNewCatColor(e.target.value)}
                    className="w-9 h-9 rounded-xl cursor-pointer border-0 bg-transparent"
                  />
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    className="clay-button-primary px-3 py-2 rounded-xl text-xs font-bold"
                  >
                    Simpan
                  </button>
                </div>
              ) : (
                <select
                  id="task-category-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 clay-button rounded-2xl text-sm font-bold text-[#3E2F26] dark:text-[#FAF4EE] focus:outline-none cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Grid: Due Date & Reminder Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Due Date & Time */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider mb-2 text-[#8A796E] dark:text-[#BDB0A4]">
                <Calendar className="w-3.5 h-3.5 inline mr-1 text-orange-600 dark:text-orange-400" />
                Tenggat Waktu (Tanggal & Jam)
              </label>
              <input
                id="task-duedate-input"
                type="datetime-local"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 clay-input text-sm font-bold text-[#3E2F26] dark:text-[#FAF4EE] focus:outline-none cursor-pointer"
              />
            </div>

            {/* Reminder Alert Timing */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider mb-2 text-[#8A796E] dark:text-[#BDB0A4]">
                <Clock className="w-3.5 h-3.5 inline mr-1 text-orange-600 dark:text-orange-400" />
                Pengingat Push
              </label>
              <select
                value={reminderMinutesBefore}
                onChange={(e) => setReminderMinutesBefore(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 clay-button rounded-2xl text-sm font-bold text-[#3E2F26] dark:text-[#FAF4EE] focus:outline-none cursor-pointer"
              >
                <option value={0}>Tepat saat tenggat</option>
                <option value={5}>5 menit sebelumnya</option>
                <option value={15}>15 menit sebelumnya</option>
                <option value={30}>30 menit sebelumnya</option>
                <option value={60}>1 jam sebelumnya</option>
                <option value={1440}>1 hari sebelumnya</option>
              </select>
            </div>
          </div>

          {/* Subtasks / Checklist */}
          <div className="space-y-2">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-[#8A796E] dark:text-[#BDB0A4]">
              Daftar Subtugas / Checklist ({subtasks.filter((s) => s.completed).length}/{subtasks.length})
            </label>
            
            {subtasks.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-[#F0E4D7] dark:bg-[#1A1715] border border-white/60 dark:border-white/5 space-y-2 shadow-inner">
                {subtasks.map((st) => (
                  <div key={st.id} className="flex items-center justify-between text-xs py-1">
                    <label className="flex items-center space-x-2.5 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={st.completed}
                        onChange={() => handleToggleSubtask(st.id)}
                        className="rounded-lg text-orange-600 focus:ring-orange-500 w-4 h-4"
                      />
                      <span className={st.completed ? 'line-through text-[#8A796E]' : 'text-[#3E2F26] dark:text-[#FAF4EE] font-bold'}>
                        {st.title}
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(st.id)}
                      className="clay-button p-1.5 rounded-xl text-rose-600 dark:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Tambahkan langkah subtugas..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                className="flex-1 px-3.5 py-2.5 clay-input text-xs font-bold text-[#3E2F26] dark:text-[#FAF4EE] placeholder-[#A8988D] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="clay-button-primary flex items-center space-x-1 px-4 py-2.5 rounded-2xl text-xs font-extrabold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah</span>
              </button>
            </div>
          </div>

          {/* Voice Reminder Customization */}
          <div className="p-4 clay-card-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Volume2 className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <span className="text-xs font-extrabold text-[#3E2F26] dark:text-[#FAF4EE]">Pengingat Suara Khusus Tugas Ini</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={voiceReminderEnabled}
                  onChange={(e) => setVoiceReminderEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#D8C7B8] dark:bg-[#38312B] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600 shadow-inner"></div>
              </label>
            </div>

            {voiceReminderEnabled && (
              <div className="mt-2">
                <input
                  type="text"
                  placeholder={`Default ucapan: "Semangat ${voiceSettings.userName}! Kamu punya tugas..."`}
                  value={customVoicePrompt}
                  onChange={(e) => setCustomVoicePrompt(e.target.value)}
                  className="w-full px-3.5 py-2.5 clay-input text-xs font-bold text-[#3E2F26] dark:text-[#FAF4EE] placeholder-[#A8988D] focus:outline-none"
                />
                <p className="text-[10px] text-[#8A796E] dark:text-[#A8988D] mt-1 font-medium">
                  Kosongkan jika ingin menggunakan format ucapan otomatis sesuai gaya ({voiceSettings.style}).
                </p>
              </div>
            )}
          </div>

          {/* Third-party Calendar Quick Export Preview */}
          <div className="pt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#E8DACB] dark:border-white/10">
            <div className="flex items-center space-x-2 text-xs text-[#8A796E] dark:text-[#A8988D] font-bold">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <span>Dukungan Kalender Pihak Ketiga:</span>
            </div>
            <div className="flex items-center space-x-2">
              <a
                href={getGoogleCalendarUrl(tempTask)}
                target="_blank"
                rel="noreferrer"
                className="clay-button flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-[11px] font-extrabold text-[#6B5A4E] dark:text-[#D4C7BC]"
              >
                <span>Google Calendar</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <button
                type="button"
                onClick={() => downloadIcsCalendar([tempTask], `${title || 'tugas'}.ics`)}
                className="clay-button flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-[11px] font-extrabold text-[#6B5A4E] dark:text-[#D4C7BC]"
              >
                <span>Unduh .ICS</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="clay-button px-5 py-2.5 rounded-2xl text-xs font-bold text-[#8A796E] dark:text-[#D4C7BC]"
            >
              Batal
            </button>
            <button
              id="save-task-submit-btn"
              type="submit"
              className="clay-button-primary px-6 py-2.5 rounded-2xl text-xs font-extrabold"
            >
              {taskToEdit ? 'Simpan Perubahan' : 'Tambah Tugas'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
