import React, { useState, useEffect } from 'react';
import { 
  X, 
  DollarSign, 
  Calendar, 
  Tag, 
  CreditCard, 
  FileText, 
  TrendingDown, 
  TrendingUp,
  Plus
} from 'lucide-react';
import { Transaction, TransactionType, FinanceCategory } from '../../types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Transaction) => void;
  txToEdit?: Transaction | null;
  initialDate?: string;
  categories: FinanceCategory[];
  onAddCategory: (cat: FinanceCategory) => void;
  darkMode: boolean;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  txToEdit,
  initialDate,
  categories,
  onAddCategory,
  darkMode,
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer' | 'ewallet' | 'credit_card'>('transfer');
  const [notes, setNotes] = useState('');

  const [isAddingNewCat, setIsAddingNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#f97316');

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (txToEdit) {
      setTitle(txToEdit.title);
      setAmount(txToEdit.amount);
      setType(txToEdit.type);
      setCategory(txToEdit.category);
      setDate(txToEdit.date || today);
      setPaymentMethod(txToEdit.paymentMethod || 'transfer');
      setNotes(txToEdit.notes || '');
    } else {
      setTitle('');
      setAmount('');
      setType('expense');
      const firstExpenseCat = categories.find((c) => c.type === 'expense')?.id || 'food';
      setCategory(firstExpenseCat);
      setDate(initialDate || today);
      setPaymentMethod('ewallet');
      setNotes('');
    }
  }, [txToEdit, initialDate, isOpen, categories]);

  if (!isOpen) return null;

  const relevantCategories = categories.filter((c) => c.type === type);

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const firstCat = categories.find((c) => c.type === newType)?.id;
    if (firstCat) setCategory(firstCat);
  };

  const handleCreateCategory = () => {
    if (!newCatName.trim()) return;
    const catId = 'fcat-' + Date.now();
    const newCat: FinanceCategory = {
      id: catId,
      name: newCatName.trim(),
      type,
      color: newCatColor,
    };
    onAddCategory(newCat);
    setCategory(catId);
    setNewCatName('');
    setIsAddingNewCat(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount || Number(amount) <= 0) return;

    const txData: Transaction = {
      id: txToEdit ? txToEdit.id : 'tx-' + Date.now(),
      title: title.trim(),
      amount: Number(amount),
      type,
      category: category || (type === 'expense' ? 'food' : 'salary'),
      date: date || new Date().toISOString().split('T')[0],
      paymentMethod,
      notes: notes.trim() || undefined,
      createdAt: txToEdit ? txToEdit.createdAt : new Date().toISOString(),
    };

    onSave(txData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg clay-modal overflow-hidden transition-all my-8">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E8DACB] dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-inner ${
              type === 'expense'
                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
            }`}>
              {type === 'expense' ? <TrendingDown className="w-6 h-6" /> : <TrendingUp className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#3E2F26] dark:text-[#FAF4EE]">
                {txToEdit ? 'Ubah Transaksi' : 'Catat Transaksi Keuangan'}
              </h2>
              <p className="text-xs text-[#8A796E] dark:text-[#BDB0A4] font-medium">
                Catat pengeluaran atau pemasukan untuk pantau anggaran
              </p>
            </div>
          </div>
          <button
            id="close-tx-modal-btn"
            onClick={onClose}
            className="clay-button p-2.5 rounded-2xl text-[#8A796E] dark:text-[#D4C7BC]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Income vs Expense Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-[#E8DACB] dark:bg-[#1C1816] shadow-inner">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2.5 text-xs font-extrabold rounded-xl flex items-center justify-center space-x-2 transition cursor-pointer ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-[0_4px_12px_rgba(225,29,72,0.35)]'
                  : 'text-[#7D6B5F] dark:text-[#BDB0A4] hover:text-[#3E2F26]'
              }`}
            >
              <TrendingDown className="w-4 h-4" />
              <span>Pengeluaran (Expense)</span>
            </button>

            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2.5 text-xs font-extrabold rounded-xl flex items-center justify-center space-x-2 transition cursor-pointer ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-[0_4px_12px_rgba(16,185,129,0.35)]'
                  : 'text-[#7D6B5F] dark:text-[#BDB0A4] hover:text-[#3E2F26]'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Pemasukan (Income)</span>
            </button>
          </div>

          {/* Amount / Nominal */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider mb-2 text-[#8A796E] dark:text-[#BDB0A4]">
              Jumlah Nominal (Rupiah) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-base text-[#8A796E]">
                Rp
              </span>
              <input
                id="tx-amount-input"
                type="number"
                required
                min="1"
                placeholder="Contoh: 150000"
                value={amount}
                onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full pl-12 pr-4 py-3 clay-input text-lg font-black text-[#3E2F26] dark:text-[#FAF4EE] focus:outline-none transition"
              />
            </div>
            {amount !== '' && Number(amount) > 0 && (
              <p className="text-[11px] font-extrabold text-orange-600 dark:text-orange-400 mt-1.5">
                Terformat: Rp {Number(amount).toLocaleString('id-ID')}
              </p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider mb-2 text-[#8A796E] dark:text-[#BDB0A4]">
              Keterangan Transaksi <span className="text-rose-500">*</span>
            </label>
            <input
              id="tx-title-input"
              type="text"
              required
              placeholder="Contoh: Makan Siang Resto, Tagihan Internet Fiber"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 clay-input text-sm font-bold text-[#3E2F26] dark:text-[#FAF4EE] placeholder-[#A8988D] focus:outline-none transition"
            />
          </div>

          {/* Grid: Category & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Category */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#8A796E] dark:text-[#BDB0A4]">
                  <Tag className="w-3.5 h-3.5 inline mr-1 text-orange-600 dark:text-orange-400" />
                  Kategori
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddingNewCat(!isAddingNewCat)}
                  className="text-[11px] font-bold text-orange-600 dark:text-orange-400 hover:underline"
                >
                  {isAddingNewCat ? 'Batal' : '+ Kategori'}
                </button>
              </div>

              {isAddingNewCat ? (
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
                  id="tx-category-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 clay-button rounded-2xl text-sm font-bold text-[#3E2F26] dark:text-[#FAF4EE] focus:outline-none cursor-pointer"
                >
                  {relevantCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider mb-2 text-[#8A796E] dark:text-[#BDB0A4]">
                <CreditCard className="w-3.5 h-3.5 inline mr-1 text-orange-600 dark:text-orange-400" />
                Metode Pembayaran
              </label>
              <select
                id="tx-payment-method-select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3.5 py-2.5 clay-button rounded-2xl text-sm font-bold text-[#3E2F26] dark:text-[#FAF4EE] focus:outline-none cursor-pointer"
              >
                <option value="ewallet">E-Wallet (GoPay, OVO, Dana)</option>
                <option value="transfer">Transfer Bank (BCA, Mandiri, BRI)</option>
                <option value="cash">Tunai (Cash)</option>
                <option value="credit_card">Kartu Kredit / PayLater</option>
              </select>
            </div>

          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider mb-2 text-[#8A796E] dark:text-[#BDB0A4]">
              <Calendar className="w-3.5 h-3.5 inline mr-1 text-orange-600 dark:text-orange-400" />
              Tanggal Transaksi
            </label>
            <input
              id="tx-date-input"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 clay-input text-sm font-bold text-[#3E2F26] dark:text-[#FAF4EE] focus:outline-none cursor-pointer"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider mb-2 text-[#8A796E] dark:text-[#BDB0A4]">
              <FileText className="w-3.5 h-3.5 inline mr-1 text-orange-600 dark:text-orange-400" />
              Catatan Tambahan (Opsional)
            </label>
            <input
              type="text"
              placeholder="Catatan kecil / nomor struk / rincian..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 clay-input text-sm font-medium text-[#3E2F26] dark:text-[#FAF4EE] placeholder-[#A8988D] focus:outline-none"
            />
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
              id="save-tx-submit-btn"
              type="submit"
              className={`px-6 py-2.5 rounded-2xl text-xs font-extrabold text-white shadow-lg transition active:scale-95 cursor-pointer ${
                type === 'expense'
                  ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
              }`}
            >
              {txToEdit ? 'Simpan Perubahan' : 'Catat Transaksi'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
