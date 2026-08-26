import React, { useState } from 'react';
import { RecurringBill, FinanceCategory } from '../../types';
import { 
  X, 
  Calendar, 
  DollarSign, 
  Bell, 
  Plus, 
  Trash2, 
  Edit2, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Sparkles,
  CreditCard,
  Building2,
  Zap,
  Wifi,
  ShieldCheck,
  Tv,
  Check
} from 'lucide-react';
import { getBillDueStatus } from '../../utils/budgetCalculator';
import confetti from 'canvas-confetti';

interface BillReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  bills: RecurringBill[];
  categories: FinanceCategory[];
  onSaveBill: (bill: RecurringBill) => void;
  onDeleteBill: (billId: string) => void;
  onTogglePaidStatus: (bill: RecurringBill, isPaid: boolean, createTransaction: boolean) => void;
}

export const BillReminderModal: React.FC<BillReminderModalProps> = ({
  isOpen,
  onClose,
  bills,
  categories,
  onSaveBill,
  onDeleteBill,
  onTogglePaidStatus,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingBillId, setEditingBillId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDateDay, setDueDateDay] = useState(5);
  const [category, setCategory] = useState('kos');
  const [reminderDaysBefore, setReminderDaysBefore] = useState(3);
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'transfer' | 'ewallet' | 'cash' | 'credit_card'>('transfer');
  const [deletingBillId, setDeletingBillId] = useState<string | null>(null);

  if (!isOpen) return null;

  const routineCategories = categories.filter(
    (c) => c.type === 'expense' && (c.expenseGroup === 'routine' || ['kos', 'bills', 'internet', 'installments', 'subscriptions'].includes(c.id))
  );

  const resetForm = () => {
    setIsEditing(false);
    setEditingBillId(null);
    setTitle('');
    setAmount('');
    setDueDateDay(5);
    setCategory(routineCategories[0]?.id || 'kos');
    setReminderDaysBefore(3);
    setNotes('');
    setPaymentMethod('transfer');
  };

  const handleStartAdd = () => {
    resetForm();
    setIsEditing(true);
  };

  const handleStartEdit = (bill: RecurringBill) => {
    setEditingBillId(bill.id);
    setTitle(bill.title);
    setAmount(bill.amount.toString());
    setDueDateDay(bill.dueDateDay);
    setCategory(bill.category);
    setReminderDaysBefore(bill.reminderDaysBefore || 3);
    setNotes(bill.notes || '');
    setPaymentMethod(bill.paymentMethod || 'transfer');
    setIsEditing(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount.replace(/[^0-9]/g, ''));
    if (!title.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    const newBill: RecurringBill = {
      id: editingBillId || `bill-${Date.now()}`,
      title: title.trim(),
      amount: parsedAmount,
      dueDateDay: Number(dueDateDay),
      category,
      expenseGroup: 'routine',
      reminderDaysBefore: Number(reminderDaysBefore),
      notes: notes.trim(),
      paymentMethod,
      paidMonths: editingBillId ? bills.find((b) => b.id === editingBillId)?.paidMonths || [] : [],
      createdAt: new Date().toISOString(),
    };

    onSaveBill(newBill);
    resetForm();
  };

  const currentYearMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

  const getCategoryIcon = (catId: string) => {
    switch (catId) {
      case 'kos':
        return <Building2 className="w-4 h-4 text-purple-500" />;
      case 'bills':
        return <Zap className="w-4 h-4 text-amber-500" />;
      case 'internet':
        return <Wifi className="w-4 h-4 text-cyan-500" />;
      case 'installments':
        return <ShieldCheck className="w-4 h-4 text-rose-500" />;
      case 'subscriptions':
        return <Tv className="w-4 h-4 text-pink-500" />;
      default:
        return <CreditCard className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="clay-card w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-orange-200/50 dark:border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                Pengingat Tagihan Rutin Bulanan
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Kelola sewa kos, PLN, WiFi, BPJS & cicilan rutin dengan notifikasi otomatis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white bg-orange-100/50 dark:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          
          {isEditing ? (
            /* Add / Edit Form */
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-neutral-800">
                <span className="text-sm font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  {editingBillId ? 'Edit Tagihan Rutin' : 'Tambah Tagihan Rutin Baru'}
                </span>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400"
                >
                  Batal
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Nama Tagihan / Pengeluaran Rutin *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Sewa Kos Bulanan, Token PLN, WiFi IndiHome, BPJS..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="clay-input w-full px-4 py-2.5 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Nominal Tagihan (Rp) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                      Rp
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="1.200.000"
                      value={amount ? Number(amount.replace(/[^0-9]/g, '')).toLocaleString('id-ID') : ''}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9]/g, '');
                        setAmount(raw);
                      }}
                      className="clay-input w-full pl-10 pr-4 py-2.5 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Kategori Tagihan
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="clay-input w-full px-3 py-2.5 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {routineCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Tanggal Jatuh Tempo Bulanan *
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Setiap tanggal</span>
                    <select
                      value={dueDateDay}
                      onChange={(e) => setDueDateDay(Number(e.target.value))}
                      className="clay-input flex-1 px-3 py-2.5 text-sm font-bold text-purple-600 dark:text-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                        <option key={day} value={day}>
                          Tanggal {day}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Waktu Pengingat (Notifikasi & Suara)
                  </label>
                  <select
                    value={reminderDaysBefore}
                    onChange={(e) => setReminderDaysBefore(Number(e.target.value))}
                    className="clay-input w-full px-3 py-2.5 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value={0}>Tepat pada Hari Jatuh Tempo (Hari H)</option>
                    <option value={1}>1 Hari Sebelumnya (H-1)</option>
                    <option value={2}>2 Hari Sebelumnya (H-2)</option>
                    <option value={3}>3 Hari Sebelumnya (H-3 - Rekomendasi)</option>
                    <option value={5}>5 Hari Sebelumnya (H-5)</option>
                    <option value={7}>1 Minggu Sebelumnya (H-7)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Metode Pembayaran Pilihan
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="clay-input w-full px-3 py-2.5 text-sm text-gray-800 dark:text-white focus:outline-none"
                  >
                    <option value="transfer">Transfer Bank (BCA, Mandiri, BRI, dll)</option>
                    <option value="ewallet">E-Wallet (GoPay, OVO, Dana, ShopeePay)</option>
                    <option value="credit_card">Kartu Kredit / Debit Online</option>
                    <option value="cash">Tunai (Cash)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Catatan / Nomor Rekening / ID Pelanggan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: No Rek BCA 123456789 an Bu Kos / No PLN 54321"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="clay-input w-full px-4 py-2.5 text-sm text-gray-800 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="clay-button px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="clay-button-primary px-6 py-2.5 rounded-xl text-xs font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  {editingBillId ? 'Simpan Perubahan' : 'Tambahkan Tagihan'}
                </button>
              </div>
            </form>
          ) : (
            /* Bills List View */
            <div className="space-y-4">
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-800 dark:text-white">
                    Daftar Tagihan Rutin ({bills.length})
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Bulan ini ({new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })})
                  </p>
                </div>
                <button
                  onClick={handleStartAdd}
                  className="clay-button-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Tagihan
                </button>
              </div>

              {bills.length === 0 ? (
                <div className="clay-card-sm p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    Belum Ada Tagihan Rutin
                  </h4>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    Daftarkan tagihan bulanan seperti kos, listrik, internet, atau cicilan untuk mendapatkan pengingat suara & notifikasi otomatis.
                  </p>
                  <button
                    onClick={handleStartAdd}
                    className="clay-button-primary px-5 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Tambah Tagihan Sekarang
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {bills.map((bill) => {
                    const statusInfo = getBillDueStatus(bill);
                    const isPaid = statusInfo.isPaidThisMonth;

                    return (
                      <div
                        key={bill.id}
                        className={`clay-card-sm p-4 transition-all duration-200 ${
                          isPaid
                            ? 'opacity-85 border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/10'
                            : statusInfo.status === 'overdue'
                            ? 'border-rose-500/40 bg-rose-50/30 dark:bg-rose-950/20'
                            : statusInfo.status === 'due_today'
                            ? 'border-amber-500/50 bg-amber-50/30 dark:bg-amber-950/20 shadow-md ring-2 ring-amber-500/30'
                            : ''
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          
                          {/* Title & Info */}
                          <div className="flex items-start gap-3 flex-1">
                            <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-neutral-800 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5">
                              {getCategoryIcon(bill.category)}
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-sm font-bold ${isPaid ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-white'}`}>
                                  {bill.title}
                                </span>
                                
                                {/* Status badge */}
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                                    isPaid
                                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                                      : statusInfo.status === 'overdue'
                                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 animate-pulse'
                                      : statusInfo.status === 'due_today'
                                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                                  }`}
                                >
                                  {isPaid ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                  {statusInfo.statusText}
                                </span>
                              </div>

                              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                                <span className="font-bold text-gray-700 dark:text-gray-200">
                                  Rp {bill.amount.toLocaleString('id-ID')}
                                </span>
                                <span>•</span>
                                <span>Tiap tgl {bill.dueDateDay}</span>
                                <span>•</span>
                                <span>Pengingat H-{bill.reminderDaysBefore || 3}</span>
                              </div>

                              {bill.notes && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                                  {bill.notes}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                            
                            {/* Toggle Paid Button */}
                            <button
                              onClick={() => {
                                const nextPaid = !isPaid;
                                if (nextPaid) {
                                  confetti({
                                    particleCount: 40,
                                    spread: 50,
                                    origin: { y: 0.6 },
                                  });
                                }
                                onTogglePaidStatus(bill, nextPaid, nextPaid);
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                                isPaid
                                  ? 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700'
                                  : 'clay-button text-gray-700 dark:text-gray-200 hover:border-emerald-500'
                              }`}
                              title={isPaid ? 'Tandai Belum Lunas' : 'Tandai Lunas & Catat Pengeluaran'}
                            >
                              <CheckCircle2 className={`w-4 h-4 ${isPaid ? 'text-white' : 'text-gray-400'}`} />
                              {isPaid ? 'Lunas' : 'Bayar'}
                            </button>

                            {/* Delete Confirmation or Normal Controls */}
                            {deletingBillId === bill.id ? (
                              <div className="flex items-center gap-1.5 p-1 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl">
                                <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 pl-1.5">
                                  Hapus?
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    onDeleteBill(bill.id);
                                    setDeletingBillId(null);
                                  }}
                                  className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold shadow-sm transition-all"
                                >
                                  Ya, Hapus
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeletingBillId(null)}
                                  className="px-2 py-1 rounded-lg bg-gray-200 dark:bg-neutral-700 hover:bg-gray-300 dark:hover:bg-neutral-600 text-gray-700 dark:text-gray-200 text-[11px] font-semibold"
                                >
                                  Batal
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                {/* Edit */}
                                <button
                                  type="button"
                                  onClick={() => handleStartEdit(bill)}
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                                  title="Edit Tagihan"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>

                                {/* Delete */}
                                <button
                                  type="button"
                                  onClick={() => setDeletingBillId(bill.id)}
                                  className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                                  title="Hapus Tagihan"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}

                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

        </div>

        {/* Footer info */}
        <div className="p-4 bg-orange-50/50 dark:bg-neutral-900/50 border-t border-orange-200/50 dark:border-white/10 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-purple-500" />
            <span>Notifikasi otomatis aktif menjelang tanggal jatuh tempo</span>
          </div>
          <button
            onClick={onClose}
            className="clay-button px-4 py-1.5 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
