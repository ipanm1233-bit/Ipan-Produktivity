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

// Speak personalized text using high-fidelity Indonesian TTS with Web Speech API fallback
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

  // Primary: High-fidelity natural Indonesian voice via server TTS
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

      // Failsafe timeout in case network hangs
      setTimeout(() => {
        if (!resolved) {
          onDone(true);
        }
      }, 30000);

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Audio.play() blocked or failed:', err);
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

  // Fallback: Browser Web Speech API
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported on this browser.');
      resolve();
      return;
    }

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

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      window.speechSynthesis.speak(utterance);

      setTimeout(() => {
        resolve();
      }, 20000);
    } catch (err) {
      console.warn('Fallback SpeechSynthesis failed:', err);
      resolve();
    }
  });
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
