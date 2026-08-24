import React, { useState } from 'react';
import { 
  X, 
  Wifi, 
  Smartphone, 
  Laptop, 
  Copy, 
  Check, 
  RefreshCw, 
  Upload, 
  Download, 
  Radio, 
  ShieldCheck,
  QrCode
} from 'lucide-react';
import { AppSyncData } from '../../types';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncRoomId: string;
  onChangeSyncRoomId: (newRoomId: string) => void;
  onForceSync: () => void;
  isSyncing: boolean;
  appData: AppSyncData;
  onImportData: (data: AppSyncData) => void;
  darkMode: boolean;
}

export const SyncModal: React.FC<SyncModalProps> = ({
  isOpen,
  onClose,
  syncRoomId,
  onChangeSyncRoomId,
  onForceSync,
  isSyncing,
  appData,
  onImportData,
  darkMode,
}) => {
  const [inputRoomId, setInputRoomId] = useState('');
  const [copied, setCopied] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(syncRoomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputRoomId.trim()) return;
    onChangeSyncRoomId(inputRoomId.trim().toUpperCase());
    setInputRoomId('');
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(appData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `backup-productivity-finance-${syncRoomId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.tasks && parsed.transactions) {
            onImportData(parsed);
            setImportStatus('Data berhasil diimpor!');
            setTimeout(() => setImportStatus(null), 3000);
          } else {
            setImportStatus('Format file tidak sesuai.');
          }
        } catch (err) {
          setImportStatus('Gagal membaca file JSON.');
        }
      };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg clay-modal flex flex-col max-h-[88vh] sm:max-h-[85vh] rounded-[24px] sm:rounded-[32px] overflow-hidden my-auto shadow-2xl transition-all">
        
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#E8DACB] dark:border-white/10 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-200 dark:border-orange-800 shadow-inner flex-shrink-0">
              <Radio className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-[#3E2F26] dark:text-[#FAF4EE]">Sinkronisasi Real-Time</h2>
              <p className="text-[11px] sm:text-xs text-[#8A796E] dark:text-[#BDB0A4] font-medium line-clamp-1">
                Hubungkan HP, Laptop, atau Tablet dengan Kode Sync
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="clay-button p-2 sm:p-2.5 rounded-xl sm:rounded-2xl text-[#8A796E] dark:text-[#D4C7BC] flex-shrink-0"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3.5 sm:p-6 space-y-3.5 sm:space-y-4 overflow-y-auto flex-1">
          
          {/* Active Room Code Card */}
          <div className="p-5 rounded-3xl clay-card text-center relative overflow-hidden">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-orange-600 dark:text-orange-400 block mb-1">
              Kode Room Sinkronisasi Anda
            </span>
            <div className="flex items-center justify-center space-x-3 my-2">
              <span className="font-mono text-3xl font-black tracking-widest text-[#3E2F26] dark:text-[#FAF4EE]">
                {syncRoomId}
              </span>
              <button
                onClick={handleCopyCode}
                title="Salin Kode"
                className="clay-button p-2 rounded-xl text-[#3E2F26] dark:text-[#FAF4EE]"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex items-center justify-center space-x-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span>Koneksi Firebase Firestore & Real-Time Cloud Aktif</span>
            </div>
          </div>

          {/* Quick sync instruction */}
          <div className="flex items-center space-x-3.5 p-4 rounded-2xl clay-card-sm text-xs">
            <div className="flex -space-x-1.5 flex-shrink-0">
              <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-500/30">
                <Smartphone className="w-4 h-4" />
              </div>
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Laptop className="w-4 h-4" />
              </div>
            </div>
            <p className="flex-1 text-[11px] leading-relaxed text-[#5A453A] dark:text-[#D4C7BC] font-medium">
              Buka aplikasi ini di browser perangkat lain, masukkan kode <b className="text-orange-600 dark:text-orange-400 font-extrabold">{syncRoomId}</b> di bawah ini. Semua tugas dan catatan keuangan akan sinkron otomatis secara instan.
            </p>
          </div>

          {/* Join existing Room */}
          <form onSubmit={handleJoinRoom} className="space-y-2">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-[#8A796E] dark:text-[#BDB0A4]">
              Gabung ke Room / Perangkat Lain
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                maxLength={10}
                placeholder="Masukkan Kode Room (mis: ABC123)"
                value={inputRoomId}
                onChange={(e) => setInputRoomId(e.target.value.toUpperCase())}
                className="flex-1 px-4 py-3 clay-input text-sm font-mono font-black tracking-wider focus:outline-none uppercase"
              />
              <button
                type="submit"
                className="clay-button-primary px-6 py-3 rounded-2xl text-xs font-extrabold"
              >
                Tautkan
              </button>
            </div>
          </form>

          {/* Manual Force Sync Button */}
          <div>
            <button
              onClick={onForceSync}
              disabled={isSyncing}
              className="w-full py-3 rounded-2xl clay-button text-xs font-extrabold text-[#3E2F26] dark:text-[#FAF4EE] flex items-center justify-center space-x-2 transition"
            >
              <RefreshCw className={`w-4 h-4 text-orange-600 dark:text-orange-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Menyinkronkan Data...' : 'Sinkronkan Sekarang Secara Manual'}</span>
            </button>
          </div>

          {/* Backup & Restore Section */}
          <div className="pt-3 border-t border-[#E8DACB] dark:border-white/10">
            <span className="block text-xs font-extrabold uppercase tracking-wider text-[#8A796E] dark:text-[#BDB0A4] mb-2">
              Cadangan Data (Backup & Restore)
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleExportJson}
                className="clay-button py-2.5 px-3 rounded-2xl text-xs font-extrabold text-[#3E2F26] dark:text-[#FAF4EE] flex items-center justify-center space-x-1.5"
              >
                <Download className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <span>Unduh JSON</span>
              </button>

              <label className="clay-button py-2.5 px-3 rounded-2xl text-xs font-extrabold text-[#3E2F26] dark:text-[#FAF4EE] flex items-center justify-center space-x-1.5 cursor-pointer text-center">
                <Upload className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Pulihkan JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJson}
                  className="hidden"
                />
              </label>
            </div>
            {importStatus && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-extrabold text-center mt-2.5 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                {importStatus}
              </p>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E8DACB] dark:border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="clay-button px-6 py-2.5 rounded-2xl text-xs font-bold text-[#8A796E] dark:text-[#D4C7BC]"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
