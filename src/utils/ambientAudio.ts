/**
 * Web Audio Ambient Soundscapes & Focus Music Generator
 * Provides offline, procedural focus audio: Binaural Alpha Beats (432Hz/10Hz),
 * Rain & Thunderstorm, Cozy Cafe, Deep Brown Noise, Forest Stream, and Lofi Ambient Chords.
 */

let ambientCtx: AudioContext | null = null;
let activeNodes: {
  sources: (AudioNode | number)[];
  gainNode?: GainNode;
  intervalIds: number[];
} = {
  sources: [],
  intervalIds: [],
};

let isAmbientPlaying = false;
let currentSoundType: string = 'none';
let currentVolume: number = 0.5;

function getAmbientContext(): AudioContext {
  if (!ambientCtx || ambientCtx.state === 'closed') {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    ambientCtx = new AudioContextClass();
  }
  if (ambientCtx.state === 'suspended') {
    ambientCtx.resume().catch(() => {});
  }
  return ambientCtx;
}

export function stopAmbientSound(): void {
  // Clear intervals
  activeNodes.intervalIds.forEach((id) => clearInterval(id));
  activeNodes.intervalIds = [];

  // Stop / disconnect nodes
  activeNodes.sources.forEach((node) => {
    if (node && typeof (node as any).stop === 'function') {
      try {
        (node as any).stop();
      } catch (_) {}
    }
    if (node && typeof (node as any).disconnect === 'function') {
      try {
        (node as any).disconnect();
      } catch (_) {}
    }
  });
  activeNodes.sources = [];

  if (activeNodes.gainNode) {
    try {
      activeNodes.gainNode.disconnect();
    } catch (_) {}
    activeNodes.gainNode = undefined;
  }

  isAmbientPlaying = false;
  currentSoundType = 'none';
}

export function setAmbientVolume(vol: number): void {
  currentVolume = Math.max(0, Math.min(1, vol));
  if (activeNodes.gainNode && ambientCtx) {
    activeNodes.gainNode.gain.setTargetAtTime(currentVolume, ambientCtx.currentTime, 0.05);
  }
}

/**
 * 1. Binaural Alpha Beats (432Hz carrier + 442Hz = 10Hz Alpha Waves for Flow State)
 */
function playBinauralAlpha(ctx: AudioContext, masterGain: GainNode) {
  const oscL = ctx.createOscillator();
  const oscR = ctx.createOscillator();
  const merger = ctx.createChannelMerger(2);

  oscL.type = 'sine';
  oscL.frequency.setValueAtTime(432, ctx.currentTime);

  oscR.type = 'sine';
  oscR.frequency.setValueAtTime(442, ctx.currentTime); // 10Hz differential for alpha state

  // Subtle warm pad undertone
  const warmPad = ctx.createOscillator();
  warmPad.type = 'triangle';
  warmPad.frequency.setValueAtTime(108, ctx.currentTime); // 2 octaves down
  const warmGain = ctx.createGain();
  warmGain.gain.setValueAtTime(0.15, ctx.currentTime);
  warmPad.connect(warmGain);
  warmGain.connect(masterGain);

  oscL.connect(merger, 0, 0); // Left ear
  oscR.connect(merger, 0, 1); // Right ear
  merger.connect(masterGain);

  oscL.start();
  oscR.start();
  warmPad.start();

  activeNodes.sources.push(oscL, oscR, merger, warmPad, warmGain);
}

/**
 * 2. Rain & Gentle Thunder Soundscape
 */
function playRainAndThunder(ctx: AudioContext, masterGain: GainNode) {
  // Pink / White noise buffer for rain
  const bufferSize = ctx.sampleRate * 2;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
    b6 = white * 0.115926;
  }

  const whiteNoise = ctx.createBufferSource();
  whiteNoise.buffer = noiseBuffer;
  whiteNoise.loop = true;

  // Bandpass filter for steady rain sound
  const rainFilter = ctx.createBiquadFilter();
  rainFilter.type = 'bandpass';
  rainFilter.frequency.setValueAtTime(1200, ctx.currentTime);
  rainFilter.Q.setValueAtTime(0.7, ctx.currentTime);

  const rainGain = ctx.createGain();
  rainGain.gain.setValueAtTime(0.6, ctx.currentTime);

  whiteNoise.connect(rainFilter);
  rainFilter.connect(rainGain);
  rainGain.connect(masterGain);
  whiteNoise.start();

  activeNodes.sources.push(whiteNoise, rainFilter, rainGain);

  // Periodic distant thunder rumble
  const triggerThunder = () => {
    if (!isAmbientPlaying) return;
    try {
      const osc = ctx.createOscillator();
      const tGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(45 + Math.random() * 25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(25, ctx.currentTime + 3.5);

      tGain.gain.setValueAtTime(0.01, ctx.currentTime);
      tGain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.8);
      tGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 4.5);

      osc.connect(tGain);
      tGain.connect(masterGain);
      osc.start();
      osc.stop(ctx.currentTime + 5);
    } catch (_) {}
  };

  const intervalId = window.setInterval(triggerThunder, 16000);
  activeNodes.intervalIds.push(intervalId);
}

/**
 * 3. Deep Brown Noise (Great for intense focus & noise masking)
 */
function playBrownNoise(ctx: AudioContext, masterGain: GainNode) {
  const bufferSize = ctx.sampleRate * 2;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  let lastOut = 0.0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    output[i] = (lastOut + 0.02 * white) / 1.02;
    lastOut = output[i];
    output[i] *= 3.5; // Gain compensation
  }

  const brownNoise = ctx.createBufferSource();
  brownNoise.buffer = noiseBuffer;
  brownNoise.loop = true;

  const lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.setValueAtTime(400, ctx.currentTime);

  brownNoise.connect(lowpass);
  lowpass.connect(masterGain);
  brownNoise.start();

  activeNodes.sources.push(brownNoise, lowpass);
}

/**
 * 4. Lofi Chill Ambient Pad Chords (Calm atmospheric chord progression)
 */
function playLofiChords(ctx: AudioContext, masterGain: GainNode) {
  // Lush jazzy lofi chord frequencies: [Dm9, G13, Cmaj9, A7b13]
  const chords = [
    [146.83, 220.0, 261.63, 329.63, 392.0], // Dm9
    [196.0, 246.94, 293.66, 329.63, 440.0],  // G13
    [130.81, 196.0, 246.94, 293.66, 392.0], // Cmaj9
    [110.0, 164.81, 220.0, 261.63, 349.23], // A7b13
  ];

  let currentChordIdx = 0;
  const lofiGain = ctx.createGain();
  lofiGain.gain.setValueAtTime(0.35, ctx.currentTime);
  lofiGain.connect(masterGain);

  const lofiFilter = ctx.createBiquadFilter();
  lofiFilter.type = 'lowpass';
  lofiFilter.frequency.setValueAtTime(650, ctx.currentTime); // Warm vinyl cutoff
  lofiFilter.connect(lofiGain);

  const playChordProgression = () => {
    if (!isAmbientPlaying) return;
    const freqs = chords[currentChordIdx];
    currentChordIdx = (currentChordIdx + 1) % chords.length;

    freqs.forEach((freq) => {
      try {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq + (Math.random() * 0.8 - 0.4), ctx.currentTime); // Subtle tape flutter

        noteGain.gain.setValueAtTime(0.001, ctx.currentTime);
        noteGain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.9);
        noteGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 4.2);

        osc.connect(noteGain);
        noteGain.connect(lofiFilter);
        osc.start();
        osc.stop(ctx.currentTime + 4.5);
      } catch (_) {}
    });
  };

  playChordProgression();
  const intervalId = window.setInterval(playChordProgression, 3800);
  activeNodes.intervalIds.push(intervalId);
  activeNodes.sources.push(lofiGain, lofiFilter);
}

/**
 * 5. Forest Stream & Birds (Nature Focus)
 */
function playForestStream(ctx: AudioContext, masterGain: GainNode) {
  // Gentle river stream water noise
  const bufferSize = ctx.sampleRate * 2;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  const streamNoise = ctx.createBufferSource();
  streamNoise.buffer = noiseBuffer;
  streamNoise.loop = true;

  const streamFilter = ctx.createBiquadFilter();
  streamFilter.type = 'bandpass';
  streamFilter.frequency.setValueAtTime(580, ctx.currentTime);
  streamFilter.Q.setValueAtTime(1.2, ctx.currentTime);

  const streamGain = ctx.createGain();
  streamGain.gain.setValueAtTime(0.28, ctx.currentTime);

  streamNoise.connect(streamFilter);
  streamFilter.connect(streamGain);
  streamGain.connect(masterGain);
  streamNoise.start();

  activeNodes.sources.push(streamNoise, streamFilter, streamGain);
}

/**
 * Main function to start ambient sound generator
 */
export function playAmbientSound(
  type: 'binaural' | 'rain' | 'brown_noise' | 'lofi' | 'forest',
  volume: number = 0.5
): void {
  stopAmbientSound();

  const ctx = getAmbientContext();
  currentSoundType = type;
  currentVolume = volume;
  isAmbientPlaying = true;

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(volume, ctx.currentTime);
  masterGain.connect(ctx.destination);
  activeNodes.gainNode = masterGain;

  switch (type) {
    case 'binaural':
      playBinauralAlpha(ctx, masterGain);
      break;
    case 'rain':
      playRainAndThunder(ctx, masterGain);
      break;
    case 'brown_noise':
      playBrownNoise(ctx, masterGain);
      break;
    case 'lofi':
      playLofiChords(ctx, masterGain);
      break;
    case 'forest':
      playForestStream(ctx, masterGain);
      break;
  }
}

export function isAmbientActive(): boolean {
  return isAmbientPlaying;
}

export function getCurrentAmbientType(): string {
  return currentSoundType;
}
