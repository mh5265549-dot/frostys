// Web Audio API Sound Synthesizer for Shop Transitions
// Completely client-side, zero external dependencies or network requests

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (typeof window === 'undefined') return null;
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch {
    return null;
  }
}

// Sizzle / flame whoosh when entering Frosty's Grill
export function playGrillSizzleSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    
    // Warm low drone/whoosh
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.2);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.5);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.6);

    // Subtle crackle noise
    const bufferSize = ctx.sampleRate * 0.35;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 1200;
    noiseFilter.Q.value = 3;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.06, now + 0.05);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noise.start(now + 0.05);
    noise.stop(now + 0.45);
  } catch {
    // Ignore audio synthesis errors on strict browsers
  }
}

// Chilled ice sparkle / chime when entering Frosty's Ice Cream
export function playIceCreamFrostSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [587.33, 783.99, 987.77, 1174.66]; // D5, G5, B5, D6 arpeggio chime

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      gain.gain.setValueAtTime(0.001, now + idx * 0.07);
      gain.gain.linearRampToValueAtTime(0.09, now + idx * 0.07 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.07 + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.45);
    });
  } catch {
    // Ignore audio errors on strict browsers
  }
}

// Universal shop transition sound player
export function playShopTransitionSound(targetShop: 'all' | 'ice-cream' | 'grill') {
  if (targetShop === 'grill') {
    playGrillSizzleSound();
  } else if (targetShop === 'ice-cream') {
    playIceCreamFrostSound();
  } else {
    // For 'all' merged transition, play a gentle sparkle chime
    playIceCreamFrostSound();
    setTimeout(() => {
      playGrillSizzleSound();
    }, 120);
  }
}

