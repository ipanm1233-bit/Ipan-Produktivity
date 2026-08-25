import React, { useState, useEffect } from 'react';
import { 
  X, 
  Volume2, 
  VolumeX, 
  User, 
  Sparkles, 
  Play, 
  Sliders, 
  Check, 
  BellRing,
  HelpCircle,
  Square
} from 'lucide-react';
import { VoiceSettings } from '../../types';
import { getAvailableVoices, speakText, stopSpeaking, initAudioOnUserGesture } from '../../utils/audio';
import { triggerTestMobileNotification } from '../../utils/notifications';

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  voiceSettings: VoiceSettings;
  onSaveVoiceSettings: (settings: VoiceSettings) => void;
  darkMode: boolean;
}

export const VoiceSettingsModal: React.FC<VoiceSettingsModalProps> = ({
  isOpen,
  onClose,
  voiceSettings,
  onSaveVoiceSettings,
  darkMode,
}) => {
  const [enabled, setEnabled] = useState(voiceSettings.enabled);
  const [userName, setUserName] = useState(voiceSettings.userName || 'Budi');
  const [style, setStyle] = useState<VoiceSettings['style']>(voiceSettings.style || 'motivational');
  const [voiceURI, setVoiceURI] = useState(voiceSettings.voiceURI || '');
  const [rate, setRate] = useState(voiceSettings.rate || 1.0);
  const [pitch, setPitch] = useState(voiceSettings.pitch || 1.0);
  const [volume, setVolume] = useState(voiceSettings.volume ?? 1.0);
  const [taskAlertsEnabled, setTaskAlertsEnabled] = useState(voiceSettings.taskAlertsEnabled ?? true);
  const [financeAlertsEnabled, setFinanceAlertsEnabled] = useState(voiceSettings.financeAlertsEnabled ?? true);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isPlayingTest, setIsPlayingTest] = useState(false);

  useEffect(() => {
    getAvailableVoices().then((voices) => {
      setAvailableVoices(voices);
      if (!voiceURI && voices.length > 0) {
        const indonesian = voices.find((v) => v.lang.startsWith('id') || v.lang.startsWith('in'));
        if (indonesian) setVoiceURI(indonesian.voiceURI);
      }
    });
  }, [voiceURI]);

  if (!isOpen) return null;

  const handleTestVoice = async () => {
    if (isPlayingTest) {
      stopSpeaking();
      setIsPlayingTest(false);
      return;
    }
    setIsPlayingTest(true);
    const testSettings: VoiceSettings = {
      enabled: true,
      userName: userName || 'Sahabat',
      style,
      voiceURI,
      rate,
      pitch,
      volume,
      lang: 'id-ID',
      taskAlertsEnabled,
      financeAlertsEnabled,
    };

    let sampleSpeech = '';
    if (style === 'motivational') {
      sampleSpeech = `Semangat ${userName}! Kamu punya tugas penting: "Selesaikan Laporan Evaluasi". Batas waktunya jam 16:30. Ayo selesaikan sekarang, kamu pasti bisa!`;
    } else if (style === 'formal') {
      sampleSpeech = `Pemberitahuan resmi untuk ${userName}. Tugas berjudul "Selesaikan Laporan Evaluasi" berprioritas tinggi memiliki batas waktu jam 16:30. Mohon segera ditindaklanjuti.`;
    } else if (style === 'casual') {
      sampleSpeech = `Hai ${userName}! Jangan lupa ya, tugas "Selesaikan Laporan Evaluasi" batasnya jam 16:30. Yuk beresin biar santai setelahnya!`;
    } else {
      sampleSpeech = `Pengingat tugas untuk ${userName}: Selesaikan Laporan Evaluasi pukul 16:30.`;
    }

    try {
      await speakText(sampleSpeech, testSettings);
    } finally {
      setIsPlayingTest(false);
    }
  };

  const handleSave = () => {
    onSaveVoiceSettings({
      ...voiceSettings,
      enabled,
      userName: userName.trim() || 'Sahabat',
      style,
      voiceURI,
      rate,
      pitch,
      volume,
      lang: 'id-ID',
      taskAlertsEnabled,
      financeAlertsEnabled,
      characterAvatar: voiceSettings.characterAvatar,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg clay-modal flex flex-col max-h-[88vh] sm:max-h-[85vh] rounded-[24px] sm:rounded-[32px] overflow-hidden my-auto shadow-2xl transition-all">
        
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#E8DACB] dark:border-white/10 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-200 dark:border-orange-800 shadow-inner flex-shrink-0">
              <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-[#3E2F26] dark:text-[#FAF4EE]">Personalisasi Suara AI</h2>
              <p className="text-[11px] sm:text-xs text-[#8A796E] dark:text-[#BDB0A4] font-medium line-clamp-1">
                Atur gaya bicara, nama panggilan, dan intonasi suara AI
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

        {/* Content Body */}
        <div className="p-3.5 sm:p-6 space-y-3.5 sm:space-y-4 overflow-y-auto flex-1">
          
          {/* Main Switch */}
          <div className={`p-4 rounded-2xl transition flex items-center justify-between ${
            enabled
              ? 'clay-card border-2 border-orange-500/50 bg-orange-50/50 dark:bg-orange-950/30'
              : 'clay-card-sm opacity-80'
          }`}>
            <div className="flex items-center space-x-3.5">
              {enabled ? (
                <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 shadow-inner">
                  <Volume2 className="w-5 h-5" />
                </div>
              ) : (
                <div className="p-2 rounded-xl bg-[#E8DACB] dark:bg-[#1E1A17] text-[#8A796E] shadow-inner">
                  <VolumeX className="w-5 h-5" />
                </div>
              )}
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold text-[#3E2F26] dark:text-[#FAF4EE]">Aktifkan Pengingat Suara Otomatis</h4>
                <p className="text-[11px] text-[#8A796E] dark:text-[#BDB0A4] font-medium">
                  Ucapkan tugas tenggat waktu & peringatan limit anggaran
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#D8C7B5] dark:bg-[#3E342D] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600 shadow-inner"></div>
            </label>
          </div>

          {/* User Name */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider mb-2 text-[#8A796E] dark:text-[#BDB0A4]">
              <User className="w-3.5 h-3.5 inline mr-1 text-orange-600 dark:text-orange-400" />
              Nama Panggilan Pengguna
            </label>
            <input
              type="text"
              placeholder="Contoh: Ipan, Alex, Budi"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-4 py-3 clay-input text-sm font-bold focus:outline-none"
            />
            <p className="text-[11px] text-[#8A796E] dark:text-[#BDB0A4] mt-1 font-medium">
              Nama ini akan disapa saat pengingat suara berbunyi.
            </p>
          </div>

          {/* Style / Tone Selector */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider mb-2 text-[#8A796E] dark:text-[#BDB0A4]">
              <Sparkles className="w-3.5 h-3.5 inline mr-1 text-orange-600 dark:text-orange-400" />
              Gaya & Karakter Ucapan
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: 'motivational', label: '🔥 Semangat / Motivasi', desc: 'Beri dorongan positif dan antusias' },
                { id: 'casual', label: '☕ Santai / Kasual', desc: 'Gaya ramah seperti teman dekat' },
                { id: 'formal', label: '👔 Formal & Sopan', desc: 'Bahasa baku dan terstruktur' },
                { id: 'concise', label: '⚡ Singkat & Tegas', desc: 'Langsung pada inti tenggat waktu' },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStyle(st.id as any)}
                  className={`p-3.5 rounded-2xl text-left transition ${
                    style === st.id
                      ? 'clay-card border-2 border-orange-500 bg-orange-50/70 dark:bg-orange-950/40 text-[#3E2F26] dark:text-[#FAF4EE]'
                      : 'clay-card-sm text-[#5A453A] dark:text-[#D4C7BC] hover:-translate-y-0.5'
                  }`}
                >
                  <div className="text-xs font-extrabold">{st.label}</div>
                  <div className="text-[10px] text-[#8A796E] dark:text-[#A8988D] font-medium mt-1 leading-snug">{st.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Voice Engine Selector */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider mb-2 text-[#8A796E] dark:text-[#BDB0A4]">
              Pilihan Suara Sistem (TTS)
            </label>
            <select
              value={voiceURI}
              onChange={(e) => setVoiceURI(e.target.value)}
              className="w-full px-4 py-3 clay-input text-xs font-bold focus:outline-none"
            >
              {availableVoices.length === 0 ? (
                <option value="">Default Browser Voice (ID/EN)</option>
              ) : (
                availableVoices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Sliders: Rate & Pitch */}
          <div className="grid grid-cols-2 gap-4 pt-1">
            <div className="p-3.5 rounded-2xl clay-card-sm">
              <div className="flex justify-between text-xs font-extrabold mb-2 text-[#8A796E] dark:text-[#BDB0A4]">
                <span>Kecepatan Bicara</span>
                <span className="text-orange-600 dark:text-orange-400">{rate}x</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.5"
                step="0.1"
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="w-full accent-orange-600 cursor-pointer"
              />
            </div>

            <div className="p-3.5 rounded-2xl clay-card-sm">
              <div className="flex justify-between text-xs font-extrabold mb-2 text-[#8A796E] dark:text-[#BDB0A4]">
                <span>Tinggi Nada (Pitch)</span>
                <span className="text-orange-600 dark:text-orange-400">{pitch}x</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.4"
                step="0.1"
                value={pitch}
                onChange={(e) => setPitch(Number(e.target.value))}
                className="w-full accent-orange-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Alert Type Toggles */}
          <div className="pt-3 border-t border-[#E8DACB] dark:border-white/10 space-y-2.5">
            <label className="flex items-center justify-between text-xs font-bold cursor-pointer p-2.5 rounded-xl hover:bg-orange-50/50 dark:hover:bg-orange-950/20 transition">
              <span className="text-[#3E2F26] dark:text-[#FAF4EE]">Pengingat Suara untuk Tenggat Tugas</span>
              <input
                type="checkbox"
                checked={taskAlertsEnabled}
                onChange={(e) => setTaskAlertsEnabled(e.target.checked)}
                className="rounded-lg text-orange-600 focus:ring-orange-500 w-4 h-4 bg-[#EDE0D2] dark:bg-[#25201C] border-[#D4C4B2]"
              />
            </label>

            <label className="flex items-center justify-between text-xs font-bold cursor-pointer p-2.5 rounded-xl hover:bg-orange-50/50 dark:hover:bg-orange-950/20 transition">
              <span className="text-[#3E2F26] dark:text-[#FAF4EE]">Peringatan Suara saat Anggaran Mendekati Batas</span>
              <input
                type="checkbox"
                checked={financeAlertsEnabled}
                onChange={(e) => setFinanceAlertsEnabled(e.target.checked)}
                className="rounded-lg text-orange-600 focus:ring-orange-500 w-4 h-4 bg-[#EDE0D2] dark:bg-[#25201C] border-[#D4C4B2]"
              />
            </label>
          </div>

          {/* Test Action Buttons */}
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => {
                initAudioOnUserGesture();
                handleTestVoice();
              }}
              className={`w-full py-3 px-3 rounded-2xl clay-button text-orange-600 dark:text-orange-400 font-extrabold text-xs flex items-center justify-center space-x-2 transition ${
                isPlayingTest ? 'border-2 border-orange-500 bg-orange-50/80 dark:bg-orange-950/40' : ''
              }`}
            >
              {isPlayingTest ? (
                <>
                  <Square className="w-4 h-4 fill-orange-600 dark:fill-orange-400 animate-pulse" />
                  <span className="flex items-center space-x-1">
                    <span>Stop Suara</span>
                  </span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Uji Coba Suara AI</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={async () => {
                initAudioOnUserGesture();
                const success = await triggerTestMobileNotification();
                if (!success) {
                  alert('Silakan izinkan izin notifikasi pada browser/perangkat Anda.');
                }
              }}
              className="w-full py-3 px-3 rounded-2xl clay-button text-sky-600 dark:text-sky-400 font-extrabold text-xs flex items-center justify-center space-x-2 transition"
            >
              <BellRing className="w-4 h-4" />
              <span>Tes Notifikasi HP (Push & Getar)</span>
            </button>
          </div>

          {/* Multi-stage Info Box */}
          <div className="p-3 rounded-2xl bg-[#EDE0D2]/60 dark:bg-[#201C19] border border-[#D8C7B8] dark:border-white/5 text-[11px] text-[#8A796E] dark:text-[#BDB0A4] space-y-1">
            <div className="font-extrabold text-[#3E2F26] dark:text-[#FAF4EE] flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <span>Jadwal Pengingat Bertahap Aktif:</span>
            </div>
            <p>
              Notifikasi otomatis dikirim pada <strong>30 menit</strong>, <strong>10 menit</strong>, <strong>5 menit sebelum tenggat</strong>, dan <strong>saat waktu tugas selesai</strong> dengan nada lonceng & suara asisten.
            </p>
          </div>

        </div>

        {/* Footer (Mobile Adaptive & Symmetric) */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-t border-[#E8DACB] dark:border-white/10 flex items-center justify-end space-x-2.5 sm:space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 sm:flex-initial clay-button px-5 py-2.5 rounded-2xl text-xs font-bold text-[#8A796E] dark:text-[#D4C7BC]"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 sm:flex-initial clay-button-primary px-6 py-2.5 rounded-2xl text-xs font-extrabold"
          >
            Simpan Pengaturan Suara
          </button>
        </div>

      </div>
    </div>
  );
};
