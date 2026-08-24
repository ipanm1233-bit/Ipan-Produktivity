import React, { useState } from 'react';
import { X, Lock, ShieldCheck, KeyRound, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { playChime } from '../../utils/audio';

interface SecurityPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
}

const PIN_STORAGE_KEY = 'taskplan_security_pin';
const PIN_ENABLED_KEY = 'taskpan_pin_enabled';
const DEFAULT_PIN = '1234';

export const SecurityPinModal: React.FC<SecurityPinModalProps> = ({
  isOpen,
  onClose,
  darkMode,
}) => {
  const [currentSavedPin, setCurrentSavedPin] = useState<string>(() => {
    return localStorage.getItem(PIN_STORAGE_KEY) || DEFAULT_PIN;
  });

  const [pinEnabled, setPinEnabled] = useState<boolean>(() => {
    return localStorage.getItem(PIN_ENABLED_KEY) !== 'false';
  });

  // State for PIN change form
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPins, setShowPins] = useState(false);

  if (!isOpen) return null;

  const handleTogglePinEnabled = () => {
    const next = !pinEnabled;
    setPinEnabled(next);
    localStorage.setItem(PIN_ENABLED_KEY, next ? 'true' : 'false');
    playChime('pop');
    setSuccessMsg(next ? 'Kunci PIN saat buka aplikasi telah diaktifkan' : 'Kunci PIN dinonaktifkan saat buka aplikasi');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleSaveNewPin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // 1. Verify old pin
    if (oldPin !== currentSavedPin) {
      setErrorMsg('PIN Lama tidak sesuai! Masukkan PIN aktif Anda saat ini.');
      playChime('warning');
      return;
    }

    // 2. Validate new pin format (must be 4 digits)
    if (!/^\d{4}$/.test(newPin)) {
      setErrorMsg('PIN Baru harus terdiri dari 4 digit angka.');
      playChime('warning');
      return;
    }

    // 3. Check confirmation
    if (newPin !== confirmPin) {
      setErrorMsg('Konfirmasi PIN baru tidak cocok.');
      playChime('warning');
      return;
    }

    // Save
    localStorage.setItem(PIN_STORAGE_KEY, newPin);
    setCurrentSavedPin(newPin);
    setOldPin('');
    setNewPin('');
    setConfirmPin('');
    setSuccessMsg('PIN Keamanan berhasil diperbarui!');
    playChime('success');

    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className={`relative w-full max-w-md p-6 sm:p-7 rounded-[32px] transition-all ${
        darkMode
          ? 'bg-[#221E1B] text-[#FAF4EE] border border-white/10 shadow-2xl'
          : 'bg-[#FAF3EC] text-[#3E2F26] border-2 border-white/80 shadow-[0_16px_40px_rgba(186,163,143,0.3)]'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E8DACB] dark:border-white/10 mb-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">Keamanan PIN Aplikasi</h2>
              <p className="text-xs text-[#8A796E] dark:text-[#BDB0A4]">Proteksi buka aplikasi & otentikasi data</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#8A796E] hover:text-[#3E2F26] dark:hover:text-white bg-black/5 dark:bg-white/5 hover:bg-black/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toggle Enable PIN on App Startup */}
        <div className={`p-4 rounded-2xl mb-5 flex items-center justify-between border ${
          darkMode ? 'bg-[#2A2420] border-white/5' : 'bg-white border-orange-100'
        }`}>
          <div className="space-y-0.5">
            <span className="text-xs font-black block">Kunci PIN Saat Buka Aplikasi</span>
            <span className="text-[11px] text-[#8A796E] dark:text-[#BDB0A4]">
              {pinEnabled ? 'Aplikasi terkunci setiap kali dibuka' : 'Aplikasi langsung terbuka tanpa PIN'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleTogglePinEnabled}
            className={`w-12 h-7 flex items-center rounded-full p-1 transition duration-300 ${
              pinEnabled ? 'bg-orange-500' : 'bg-gray-400 dark:bg-gray-600'
            }`}
          >
            <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition duration-300 ${
              pinEnabled ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
        </div>

        {/* Change PIN Form */}
        <form onSubmit={handleSaveNewPin} className="space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-orange-600 dark:text-orange-400 flex items-center space-x-1.5">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Ganti PIN 4-Digit</span>
            </span>

            <button
              type="button"
              onClick={() => setShowPins(!showPins)}
              className="text-[11px] font-bold text-[#8A796E] dark:text-[#BDB0A4] hover:text-orange-600 dark:hover:text-orange-400 flex items-center space-x-1"
            >
              {showPins ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              <span>{showPins ? 'Sembunyikan' : 'Lihat'}</span>
            </button>
          </div>

          {/* Old PIN Input */}
          <div>
            <label className="block text-[11px] font-bold mb-1 text-[#6D5A4E] dark:text-[#C5B7AE]">
              PIN Lama (Saat Ini)
            </label>
            <input
              type={showPins ? 'text' : 'password'}
              maxLength={4}
              value={oldPin}
              onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ''))}
              placeholder="Ketik 4 digit PIN lama"
              required
              className={`w-full px-4 py-2.5 rounded-2xl text-center text-base tracking-widest font-mono font-bold border transition focus:outline-none ${
                darkMode
                  ? 'bg-[#1D1917] border-white/10 text-white focus:border-orange-500'
                  : 'bg-white border-orange-200 text-[#3E2F26] focus:border-orange-500 shadow-inner'
              }`}
            />
          </div>

          {/* New PIN & Confirm New PIN */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold mb-1 text-[#6D5A4E] dark:text-[#C5B7AE]">
                PIN Baru
              </label>
              <input
                type={showPins ? 'text' : 'password'}
                maxLength={4}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                placeholder="4 digit"
                required
                className={`w-full px-3 py-2.5 rounded-2xl text-center text-base tracking-widest font-mono font-bold border transition focus:outline-none ${
                  darkMode
                    ? 'bg-[#1D1917] border-white/10 text-white focus:border-orange-500'
                    : 'bg-white border-orange-200 text-[#3E2F26] focus:border-orange-500 shadow-inner'
                }`}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold mb-1 text-[#6D5A4E] dark:text-[#C5B7AE]">
                Konfirmasi PIN
              </label>
              <input
                type={showPins ? 'text' : 'password'}
                maxLength={4}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                placeholder="4 digit"
                required
                className={`w-full px-3 py-2.5 rounded-2xl text-center text-base tracking-widest font-mono font-bold border transition focus:outline-none ${
                  darkMode
                    ? 'bg-[#1D1917] border-white/10 text-white focus:border-orange-500'
                    : 'bg-white border-orange-200 text-[#3E2F26] focus:border-orange-500 shadow-inner'
                }`}
              />
            </div>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="flex items-center space-x-2 text-xs text-rose-500 font-bold bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center space-x-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-2 flex items-center space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-2xl text-xs font-bold text-[#8A796E] hover:text-[#3E2F26] dark:hover:text-white bg-black/5 dark:bg-white/5 transition"
            >
              Tutup
            </button>

            <button
              type="submit"
              className="flex-1 py-2.5 rounded-2xl text-xs font-extrabold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-md transition active:scale-95 flex items-center justify-center space-x-1.5"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Simpan PIN Baru</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
