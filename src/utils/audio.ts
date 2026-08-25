import { Task, VoiceSettings } from '../types';

let audioCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioCtxClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// User-gesture priming function to unlock browser audio & speech synthesis
export function initAudioOnUserGesture() {
  try {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      // Small prime utterance to ensure mobile Safari/Chrome WebSpeech is fully unblocked
      const dummy = new SpeechSynthesisUtterance('');
      dummy.volume = 0;
      window.speechSynthesis.speak(dummy);
    }
  } catch (e) {
    console.warn('Audio user-gesture init warning:', e);
  }
}

// Play melodic chimes using Web Audio API
export function playChime(type: 'success' | 'alert' | 'warning' | 'reminder' | 'pop') {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    if (type === 'success') {
      // Pleasant upward chord (C5 - E5 - G5 - C6)
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + i * 0.08);
        gain.gain.setValueAtTime(0.12, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.4);
      });
    } else if (type === 'warning' || type === 'alert') {
      // Two-tone attention tone
      [440, 587.33].forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + i * 0.12);
        gain.gain.setValueAtTime(0.15, now + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.3);
      });
    } else if (type === 'reminder') {
      // Soft double bell
      [880, 1174.66].forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + i * 0.1);
        gain.gain.setValueAtTime(0.12, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.4);
      });
    } else {
      // Quick pop
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    }
  } catch (err) {
    console.warn('Audio chime play failed:', err);
  }
}

// Generate Stage-Specific Voice Prompt (30m, 10m, 5m, 0m / selesai)
export function generateStageVoicePrompt(
  task: Task, 
  stageMinutes: number, 
  settings: VoiceSettings
): string {
  if (task.customVoicePrompt && task.customVoicePrompt.trim().length > 0) {
    return task.customVoicePrompt;
  }

  const name = settings.userName || 'Ipan';
  const dueTime = new Date(task.dueDate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  if (stageMinutes === 30) {
    switch (settings.style) {
      case 'motivational':
        return `Semangat ${name}! Tugas "${task.title}" tersisa 30 menit lagi sebelum tenggat jam ${dueTime}. Persiapkan dan mulai selesaikan sekarang, kamu pasti bisa!`;
      case 'formal':
        return `Pemberitahuan tenggat 30 menit untuk ${name}. Tugas "${task.title}" akan jatuh tempo pukul ${dueTime}. Mohon periksa dan tuntaskan.`;
      case 'casual':
        return `Hai ${name}! Pengingat 30 menit nih, tugas "${task.title}" batasnya jam ${dueTime}. Yuk dicicil biar beres!`;
      case 'concise':
      default:
        return `Pengingat 30 menit: Tugas "${task.title}", tenggat pukul ${dueTime}.`;
    }
  }

  if (stageMinutes === 10) {
    switch (settings.style) {
      case 'motivational':
        return `Perhatian ${name}! Waktu untuk tugas "${task.title}" tersisa 10 menit lagi. Ayo fokus selesaikan tahap akhirnya sekarang!`;
      case 'formal':
        return `Peringatan 10 menit untuk ${name}. Tenggat tugas "${task.title}" tersisa 10 menit menuju pukul ${dueTime}.`;
      case 'casual':
        return `Hai ${name}, tinggal 10 menit lagi nih buat tugas "${task.title}". Segera rapikan ya!`;
      case 'concise':
      default:
        return `Peringatan 10 menit: Tugas "${task.title}", batas pukul ${dueTime}.`;
    }
  }

  if (stageMinutes === 5) {
    switch (settings.style) {
      case 'motivational':
        return `Mendesak ${name}! Tinggal 5 menit terakhir untuk tugas "${task.title}". Ayo selesaikan sekarang juga!`;
      case 'formal':
        return `Peringatan mendesak untuk ${name}. Waktu tugas "${task.title}" tersisa 5 menit. Segera tindak lanjuti.`;
      case 'casual':
        return `Waduh ${name}, tinggal 5 menit lagi untuk "${task.title}". Tuntaskan sekarang yuk!`;
      case 'concise':
      default:
        return `Mendesak 5 menit: Tugas "${task.title}" segera berakhir.`;
    }
  }

  // stageMinutes === 0 (Selesai / Tenggat Waktu Tercapai)
  switch (settings.style) {
    case 'motivational':
      return `Waktu tenggat selesai, ${name}! Batas waktu tugas "${task.title}" pukul ${dueTime} telah tercapai. Apakah tugas ini sudah selesai? Jangan lupa tandai selesai ya!`;
    case 'formal':
      return `Pemberitahuan resmi untuk ${name}. Tenggat waktu tugas "${task.title}" telah berakhir pukul ${dueTime}. Silakan verifikasi dan tandai penyelesaian.`;
    case 'casual':
      return `Hai ${name}, waktu untuk tugas "${task.title}" sudah habis nih. Kalau sudah beres, langsung centang ya!`;
    case 'concise':
    default:
      return `Tenggat tercapai: Batas waktu tugas "${task.title}" telah habis.`;
  }
}

// Generate Personalized Speech text for task deadline
export function generateTaskVoicePrompt(task: Task, settings: VoiceSettings): string {
  if (task.customVoicePrompt && task.customVoicePrompt.trim().length > 0) {
    return task.customVoicePrompt;
  }

  const name = settings.userName || 'Ipan';
  const priorityId = task.priority === 'urgent' ? 'sangat mendesak' : task.priority === 'high' ? 'tinggi' : task.priority === 'medium' ? 'sedang' : 'rendah';
  
  const dueTime = new Date(task.dueDate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  switch (settings.style) {
    case 'motivational':
      return `Semangat ${name}! Kamu punya tugas penting: "${task.title}". Tenggat waktunya pukul ${dueTime}. Ayo selesaikan sekarang, kamu pasti bisa!`;
    case 'formal':
      return `Pemberitahuan resmi untuk ${name}. Tugas berjudul "${task.title}" dengan prioritas ${priorityId} memiliki batas waktu pukul ${dueTime}. Mohon segera ditindaklanjuti.`;
    case 'casual':
      return `Hai ${name}! Jangan lupa ya, tugas "${task.title}" batasnya jam ${dueTime}. Yuk beresin biar santai setelahnya!`;
    case 'concise':
    default:
      return `Pengingat tugas: "${task.title}". Batas waktu jam ${dueTime}.`;
  }
}

// Generate Voice prompt for budget alerts
export function generateBudgetVoicePrompt(
  type: 'warning' | 'exceeded',
  categoryName: string,
  percentUsed: number,
  settings: VoiceSettings
): string {
  const name = settings.userName || 'Ipan';

  if (type === 'exceeded') {
    return `Perhatian ${name}! Pengeluaran untuk kategori ${categoryName} telah melebihi batas anggaran bulanan, mencapai ${percentUsed.toFixed(0)} persen. Mohon periksa keuangan Anda.`;
  } else {
    return `Peringatan anggaran untuk ${name}. Pengeluaran ${categoryName} sudah mencapai ${percentUsed.toFixed(0)} persen dari batas yang ditetapkan. Harap berhati-hati dalam berbelanja.`;
  }
}

// Active Audio Element reference
let currentAudioPlayer: HTMLAudioElement | null = null;

// Stop any currently playing speech audio
export function stopSpeaking() {
  try {
    if (currentAudioPlayer) {
      currentAudioPlayer.pause();
      currentAudioPlayer.currentTime = 0;
      currentAudioPlayer = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  } catch (e) {
    console.warn('Error stopping speech:', e);
  }
}

// Speak personalized text using chosen system voice or high-fidelity server TTS
export async function speakText(text: string, settings: VoiceSettings): Promise<void> {
  if (!settings.enabled) {
    console.log('Voice assistant is disabled in settings');
    return;
  }

  stopSpeaking();

  const cleanText = text
    .replace(/Rp\s?/g, 'Rupiah ')
    .replace(/%/g, ' persen ')
    .replace(/\//g, ' atau ')
    .trim();

  if (!cleanText) return;

  // 1. If user explicitly chose a specific browser voice URI, prioritize Web Speech API
  if (settings.voiceURI && typeof window !== 'undefined' && 'speechSynthesis' in window) {
    const success = await speakViaWebSpeech(cleanText, settings);
    if (success) return;
  }

  // 2. Otherwise try high-fidelity natural Indonesian voice via server TTS
  const playedViaServerTTS = await new Promise<boolean>((resolve) => {
    try {
      const audioUrl = `/api/tts?text=${encodeURIComponent(cleanText)}&lang=id`;
      const audio = new Audio(audioUrl);
      currentAudioPlayer = audio;
      
      audio.volume = settings.volume !== undefined ? Math.max(0, Math.min(1, Number(settings.volume))) : 1.0;
      audio.playbackRate = settings.rate ? Math.max(0.5, Math.min(2.0, Number(settings.rate))) : 1.0;

      let resolved = false;
      const onDone = (success: boolean) => {
        if (!resolved) {
          resolved = true;
          if (currentAudioPlayer === audio) {
            currentAudioPlayer = null;
          }
          resolve(success);
        }
      };

      audio.onended = () => onDone(true);
      audio.onerror = (e) => {
        console.warn('Server TTS failed, switching to browser speech synthesis fallback:', e);
        onDone(false);
      };

      // Failsafe timeout
      setTimeout(() => {
        if (!resolved) {
          onDone(true);
        }
      }, 25000);

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Audio.play() failed:', err);
          onDone(false);
        });
      }
    } catch (err) {
      console.warn('Server TTS error:', err);
      resolve(false);
    }
  });

  if (playedViaServerTTS) {
    return;
  }

  // 3. Fallback: Browser Web Speech API
  await speakViaWebSpeech(cleanText, settings);
}

// Speak via Browser Web Speech API helper
async function speakViaWebSpeech(cleanText: string, settings: VoiceSettings): Promise<boolean> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  return new Promise((resolve) => {
    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = Number(settings.rate) || 1.0;
      utterance.pitch = Number(settings.pitch) || 1.0;
      utterance.volume = settings.volume !== undefined ? Number(settings.volume) : 1.0;
      utterance.lang = 'id-ID';

      const voices = window.speechSynthesis.getVoices();
      if (settings.voiceURI && voices.length > 0) {
        const selectedVoice = voices.find((v) => v.voiceURI === settings.voiceURI);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
          utterance.lang = selectedVoice.lang || 'id-ID';
        }
      } else if (voices.length > 0) {
        const idVoice = voices.find(
          (v) => v.lang.toLowerCase().startsWith('id') || 
                 v.lang.toLowerCase().startsWith('in') || 
                 v.name.toLowerCase().includes('indonesia')
        );
        if (idVoice) {
          utterance.voice = idVoice;
        }
      }

      utterance.onend = () => resolve(true);
      utterance.onerror = () => resolve(false);

      window.speechSynthesis.speak(utterance);

      setTimeout(() => {
        resolve(true);
      }, 20000);
    } catch (err) {
      console.warn('SpeechSynthesis error:', err);
      resolve(false);
    }
  });
}

// Intelligent Natural Language Parser for Voice to Task
export interface ParsedVoiceTask {
  title: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedMinutes?: number;
  dueDate: string;
  category?: string;
}

export function parseVoiceToTask(
  spokenText: string, 
  availableCategories: { id: string; name: string }[]
): ParsedVoiceTask {
  const text = spokenText.trim();
  const lower = text.toLowerCase();

  // Detect priority
  let priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium';
  if (lower.includes('urgent') || lower.includes('mendesak') || lower.includes('darurat') || lower.includes('segera')) {
    priority = 'urgent';
  } else if (lower.includes('penting') || lower.includes('prioritas tinggi') || lower.includes('tinggi')) {
    priority = 'high';
  } else if (lower.includes('santai') || lower.includes('rendah') || lower.includes('nanti')) {
    priority = 'low';
  }

  // Detect category
  let matchedCategory: string | undefined = undefined;
  for (const cat of availableCategories) {
    if (lower.includes(cat.name.toLowerCase()) || lower.includes(cat.id.toLowerCase())) {
      matchedCategory = cat.id;
      break;
    }
  }

  // Detect target date / time
  const targetDate = new Date();
  
  if (lower.includes('besok')) {
    targetDate.setDate(targetDate.getDate() + 1);
  } else if (lower.includes('lusa')) {
    targetDate.setDate(targetDate.getDate() + 2);
  }

  // Match hour expressions like "jam 5", "jam 17:00", "pukul 8 malam", etc.
  const timeMatch = lower.match(/(?:jam|pukul)\s*(\d{1,2})(?::(\d{2}))?\s*(pagi|siang|sore|malam)?/);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1], 10);
    const mins = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const period = timeMatch[3];

    if (period === 'malam' && hours < 12) {
      hours += 12;
    } else if (period === 'sore' && hours < 12 && hours <= 6) {
      hours += 12;
    } else if (period === 'siang' && hours < 12 && hours <= 2) {
      hours += 12;
    }
    targetDate.setHours(hours, mins, 0, 0);
  } else {
    // Default 2 hours from now
    targetDate.setHours(targetDate.getHours() + 2, 0, 0, 0);
  }

  // Clean title by removing triggers
  let cleanTitle = text
    .replace(/(?:tambahkan|buatkan|bikin|buat|catat|ingatkan|tolong)\s+(?:tugas|agenda|jadwal)?/gi, '')
    .replace(/(?:dengan\s+)?prioritas\s+(?:urgent|mendesak|tinggi|penting|sedang|rendah)/gi, '')
    .replace(/(?:jam|pukul)\s*\d{1,2}(?::\d{2})?\s*(?:pagi|siang|sore|malam)?/gi, '')
    .replace(/\b(besok|lusa|hari ini|sekarang|urgent|mendesak|penting)\b/gi, '')
    .trim();

  // Capitalize first letter
  if (cleanTitle) {
    cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
  } else {
    cleanTitle = text.charAt(0).toUpperCase() + text.slice(1);
  }

  const localIso = new Date(targetDate.getTime() - targetDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

  return {
    title: cleanTitle || text,
    priority,
    dueDate: localIso,
    category: matchedCategory,
    estimatedMinutes: 45,
  };
}

// Get all available system speech voices with async retry
export function getAvailableVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve([]);
      return;
    }

    let voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }

    const handleVoicesChanged = () => {
      voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
        resolve(voices);
      }
    };

    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);

    setTimeout(() => {
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      resolve(window.speechSynthesis.getVoices());
    }, 600);
  });
}
