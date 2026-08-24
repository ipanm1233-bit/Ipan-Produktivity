import { Task, VoiceSettings } from '../types';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioCtxClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
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
        gain.gain.setValueAtTime(0.15, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.45);
      });
    } else if (type === 'warning' || type === 'alert') {
      // Two-tone attention tone
      [440, 587.33].forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + i * 0.15);
        gain.gain.setValueAtTime(0.2, now + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.15);
        osc.stop(now + i * 0.15 + 0.35);
      });
    } else if (type === 'reminder') {
      // Soft double bell
      [880, 1174.66].forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + i * 0.12);
        gain.gain.setValueAtTime(0.18, now + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.55);
      });
    } else {
      // Quick pop
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    }
  } catch (err) {
    console.warn('Audio play failed:', err);
  }
}

// Generate Personalized Speech text for task deadline
export function generateTaskVoicePrompt(task: Task, settings: VoiceSettings): string {
  if (task.customVoicePrompt && task.customVoicePrompt.trim().length > 0) {
    return task.customVoicePrompt;
  }

  const name = settings.userName || 'Sahabat';
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
  const name = settings.userName || 'Sahabat';

  if (type === 'exceeded') {
    return `Perhatian ${name}! Pengeluaran untuk kategori ${categoryName} telah melebihi batas anggaran bulanan, mencapai ${percentUsed.toFixed(0)}%. Mohon periksa keuangan Anda.`;
  } else {
    return `Peringatan anggaran untuk ${name}. Pengeluaran ${categoryName} sudah mencapai ${percentUsed.toFixed(0)}% dari batas yang ditetapkan. Harap berhati-hati dalam berbelanja.`;
  }
}

// Speak personalized text using Web Speech API
export function speakText(text: string, settings: VoiceSettings): Promise<void> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported on this browser.');
      resolve();
      return;
    }

    if (!settings.enabled) {
      resolve();
      return;
    }

    window.speechSynthesis.cancel(); // Stop any pending speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = settings.rate || 1.0;
    utterance.pitch = settings.pitch || 1.0;
    utterance.volume = settings.volume !== undefined ? settings.volume : 1.0;

    const voices = window.speechSynthesis.getVoices();
    if (settings.voiceURI) {
      const selectedVoice = voices.find((v) => v.voiceURI === settings.voiceURI);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    } else {
      // Find Indonesian voice if available, else standard fallback
      const idVoice = voices.find((v) => v.lang.startsWith('id') || v.lang.startsWith('in'));
      if (idVoice) {
        utterance.voice = idVoice;
      }
    }

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    // Play initial gentle chime before speaking
    playChime('reminder');

    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 200);
  });
}

// Get all available system speech voices
export function getAvailableVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      resolve([]);
      return;
    }

    let voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }

    window.speechSynthesis.onvoiceschanged = () => {
      voices = window.speechSynthesis.getVoices();
      resolve(voices);
    };

    setTimeout(() => {
      resolve(window.speechSynthesis.getVoices());
    }, 800);
  });
}
