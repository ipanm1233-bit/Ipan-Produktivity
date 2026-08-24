import React, { useState, useEffect } from 'react';
import { Lock, Unlock, ShieldCheck, KeyRound, Sparkles, Delete, RefreshCw, Eye, EyeOff } from 'lucide-react';
import taskplanLogo from '../../assets/images/taskplan_app_logo_1787564199598.jpg';
import ipanAvatar from '../../assets/images/ipan_avatar_clay_1787564213642.jpg';
import { playChime } from '../../utils/audio';

interface ClayPinLockProps {
  onUnlock: () => void;
  darkMode: boolean;
  userName?: string;
}

const PIN_STORAGE_KEY = 'taskplan_security_pin';
const DEFAULT_PIN = '1234';

export const ClayPinLock: React.FC<ClayPinLockProps> = ({
  onUnlock,
  darkMode,
  userName = 'Ipan',
}) => {
  const [pin, setPin] = useState<string>('');
  const [savedPin, setSavedPin] = useState<string>(() => {
    return localStorage.getItem(PIN_STORAGE_KEY) || DEFAULT_PIN;
  });
  const [isSettingNewPin, setIsSettingNewPin] = useState(false);
  const [newPinStep, setNewPinStep] = useState<'enter_new' | 'confirm_new'>('enter_new');
  const [tempNewPin, setTempNewPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [showNumbers, setShowNumbers] = useState(false);

  const targetLength = 4;

  // Handle number click
  const handleDigit = (digit: string) => {
    if (pin.length < targetLength) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setErrorMsg('');

      if (nextPin.length === targetLength) {
        verifyOrAdvance(nextPin);
      }
    }
  };

  // Handle backspace / delete
  const handleDelete = () => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
      setErrorMsg('');
    }
  };

  // Handle clear
  const handleClear = () => {
    setPin('');
    setErrorMsg('');
  };

  // Verify PIN or advance setup
  const verifyOrAdvance = (enteredPin: string) => {
    if (isSettingNewPin) {
      if (newPinStep === 'enter_new') {
        setTempNewPin(enteredPin);
        setNewPinStep('confirm_new');
        setPin('');
        playChime('success');
      } else {
        // Confirm step
        if (enteredPin === tempNewPin) {
          localStorage.setItem(PIN_STORAGE_KEY, enteredPin);
          setSavedPin(enteredPin);
          setIsSettingNewPin(false);
          setNewPinStep('enter_new');
          setTempNewPin('');
          setPin('');
          playChime('success');
          onUnlock();
        } else {
          triggerError('PIN konfirmasi tidak cocok! Ulangi.');
          setPin('');
          setNewPinStep('enter_new');
          setTempNewPin('');
        }
      }
    } else {
      // Normal unlock verification
      const currentPin = localStorage.getItem(PIN_STORAGE_KEY) || DEFAULT_PIN;
      if (enteredPin === currentPin) {
        playChime('success');
        onUnlock();
      } else {
        triggerError('PIN salah. Silakan coba lagi.');
        setPin('');
      }
    }
  };

  const triggerError = (msg: string) => {
    setIsShaking(true);
    setErrorMsg(msg);
    playChime('reminder');
    setTimeout(() => {
      setIsShaking(false);
    }, 600);
  };

  // Physical keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, isSettingNewPin, newPinStep, tempNewPin, savedPin]);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 select-none ${
      darkMode ? 'bg-[#181513]' : 'bg-[#F5EBE1]'
    }`}>
      
      {/* Background soft ambient glowing circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl" />
      </div>

      <div className={`relative w-full max-w-sm p-6 sm:p-8 rounded-[36px] flex flex-col items-center text-center transition-all ${
        darkMode 
          ? 'bg-[#221E1B] border border-white/10 shadow-2xl shadow-black/80' 
          : 'bg-[#FAF3EC] border-2 border-white/80 shadow-[0_16px_40px_rgba(186,163,143,0.3)]'
      }`}>
        
        {/* App Logo & Avatar Badge */}
        <div className="relative mb-4">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl p-1.5 bg-gradient-to-tr from-orange-400 to-amber-300 shadow-[0_10px_25px_rgba(230,126,81,0.4)] overflow-hidden">
            <img
              src={taskplanLogo}
              alt="TaskPlan 3D Logo"
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
          <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full p-0.5 bg-white shadow-md overflow-hidden border border-orange-200">
            <img
              src={ipanAvatar}
              alt="Ipan Avatar"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>

        {/* Header Greeting */}
        <div className="space-y-1 mb-6">
          <div className="flex items-center justify-center space-x-1.5 text-xs font-black uppercase tracking-wider text-orange-600 dark:text-orange-400">
            <ShieldCheck className="w-4 h-4" />
            <span>TaskPan Security</span>
          </div>
          <h2 className={`text-xl sm:text-2xl font-black ${
            darkMode ? 'text-[#FAF4EE]' : 'text-[#3E2F26]'
          }`}>
            {isSettingNewPin 
              ? (newPinStep === 'enter_new' ? 'Buat PIN Baru' : 'Konfirmasi PIN Baru')
              : `Halo, ${userName}!`}
          </h2>
          <p className="text-xs text-[#8A796E] dark:text-[#BDB0A4] font-medium max-w-xs">
            {isSettingNewPin
              ? (newPinStep === 'enter_new' ? 'Masukkan 4 digit PIN baru Anda' : 'Ketik ulang PIN baru untuk mengonfirmasi')
              : 'Masukkan 4-digit PIN keamanan untuk membuka TaskPan'
            }
          </p>
        </div>

        {/* 4 Clay Dot Indicators */}
        <div className={`flex items-center justify-center space-x-4 mb-4 ${isShaking ? 'animate-bounce' : ''}`}>
          {Array.from({ length: targetLength }).map((_, index) => {
            const isFilled = index < pin.length;
            return (
              <div
                key={index}
                className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full transition-all duration-300 flex items-center justify-center ${
                  isFilled
                    ? 'bg-gradient-to-tr from-orange-500 to-amber-400 scale-125 shadow-[0_4px_12px_rgba(234,88,12,0.4)]'
                    : darkMode
                    ? 'bg-[#332C27] border border-white/10'
                    : 'bg-[#E8DACB] border border-black/5 shadow-inner'
                }`}
              >
                {isFilled && showNumbers && (
                  <span className="text-[10px] text-white font-extrabold">{pin[index]}</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Error Feedback Message */}
        <div className="h-6 mb-2 flex items-center justify-center">
          {errorMsg ? (
            <span className="text-xs text-rose-500 dark:text-rose-400 font-bold animate-pulse">
              {errorMsg}
            </span>
          ) : (
            <span className="text-[10px] text-[#A8988D] dark:text-[#7A6B60] font-medium">
              PIN Bawaan: <code className="font-mono font-black text-orange-600 dark:text-orange-400">1234</code>
            </span>
          )}
        </div>

        {/* 3D Clay Numeric Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[260px] mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleDigit(num)}
              className={`h-13 rounded-2xl text-lg font-black transition-all active:scale-90 flex items-center justify-center ${
                darkMode
                  ? 'bg-[#2E2824] hover:bg-[#38312C] text-white border border-white/10 shadow-md'
                  : 'bg-white hover:bg-orange-50 text-[#3E2F26] border border-orange-100 shadow-[0_4px_12px_rgba(0,0,0,0.06)]'
              }`}
            >
              {num}
            </button>
          ))}

          {/* Bottom row: Clear, 0, Backspace */}
          <button
            onClick={handleClear}
            title="Hapus Semua"
            className={`h-13 rounded-2xl text-xs font-extrabold transition-all active:scale-90 flex items-center justify-center ${
              darkMode
                ? 'bg-[#2A2420] text-[#A8988D] hover:text-white border border-white/5'
                : 'bg-[#F2E7DC] text-[#7A685D] hover:text-[#3E2F26] border border-black/5'
            }`}
          >
            C
          </button>

          <button
            onClick={() => handleDigit('0')}
            className={`h-13 rounded-2xl text-lg font-black transition-all active:scale-90 flex items-center justify-center ${
              darkMode
                ? 'bg-[#2E2824] hover:bg-[#38312C] text-white border border-white/10 shadow-md'
                : 'bg-white hover:bg-orange-50 text-[#3E2F26] border border-orange-100 shadow-[0_4px_12px_rgba(0,0,0,0.06)]'
            }`}
          >
            0
          </button>

          <button
            onClick={handleDelete}
            title="Hapus Digit Terakhir"
            className={`h-13 rounded-2xl text-sm font-black transition-all active:scale-90 flex items-center justify-center ${
              darkMode
                ? 'bg-[#2A2420] text-[#A8988D] hover:text-white border border-white/5'
                : 'bg-[#F2E7DC] text-[#7A685D] hover:text-[#3E2F26] border border-black/5'
            }`}
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Footer Actions: Change PIN & Show/Hide */}
        <div className="flex items-center justify-between w-full max-w-[260px] pt-1 text-xs text-[#8A796E] dark:text-[#BDB0A4] font-bold">
          <button
            onClick={() => {
              setIsSettingNewPin(!isSettingNewPin);
              setNewPinStep('enter_new');
              setTempNewPin('');
              setPin('');
              setErrorMsg('');
            }}
            className="hover:text-orange-600 dark:hover:text-orange-400 flex items-center space-x-1 transition"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>{isSettingNewPin ? 'Batal' : 'Ganti PIN'}</span>
          </button>

          <button
            onClick={() => setShowNumbers(!showNumbers)}
            className="hover:text-orange-600 dark:hover:text-orange-400 flex items-center space-x-1 transition"
          >
            {showNumbers ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showNumbers ? 'Sembunyikan' : 'Lihat'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
