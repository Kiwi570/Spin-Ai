let audioContext: AudioContext | null = null;
function getAudioContext(): AudioContext { if (!audioContext) audioContext = new AudioContext(); return audioContext; }
function playTone(f: number, d: number, v = 0.3) {
  try { const ctx = getAudioContext(), o = ctx.createOscillator(), g = ctx.createGain(); o.connect(g); g.connect(ctx.destination); o.frequency.value = f; g.gain.setValueAtTime(0, ctx.currentTime); g.gain.linearRampToValueAtTime(v, ctx.currentTime + 0.01); g.gain.linearRampToValueAtTime(0, ctx.currentTime + d); o.start(ctx.currentTime); o.stop(ctx.currentTime + d); } catch {}
}

export const audio = {
  init: () => { try { getAudioContext(); } catch {} },
  playSelect: () => playTone(800, 0.08, 0.15),
  playSuccess: () => { playTone(523, 0.1, 0.2); setTimeout(() => playTone(659, 0.1, 0.2), 100); setTimeout(() => playTone(784, 0.15, 0.2), 200); },
  playError: () => playTone(200, 0.2, 0.2),
  playCountdown: (n: number) => playTone(440 + (3 - n) * 100, 0.15, 0.25),
  playRecordStart: () => { playTone(660, 0.1, 0.2); setTimeout(() => playTone(880, 0.15, 0.25), 100); },
  playRecordStop: () => { playTone(880, 0.1, 0.2); setTimeout(() => playTone(660, 0.15, 0.2), 100); },
  playCrystal: () => { playTone(523, 0.15, 0.15); setTimeout(() => playTone(659, 0.15, 0.15), 150); setTimeout(() => playTone(784, 0.15, 0.15), 300); setTimeout(() => playTone(1047, 0.3, 0.2), 450); },
  playLevelUp: () => { [523, 659, 784, 1047, 1319].forEach((f, i) => setTimeout(() => playTone(f, 0.2, 0.2), i * 100)); },
  playTransition: () => playTone(600, 0.05, 0.1),
  playReveal: () => { playTone(400, 0.1, 0.15); setTimeout(() => playTone(600, 0.15, 0.2), 100); },
  haptics: {
    light: () => { if ('vibrate' in navigator) navigator.vibrate(10); },
    medium: () => { if ('vibrate' in navigator) navigator.vibrate(25); },
    success: () => { if ('vibrate' in navigator) navigator.vibrate([30, 50, 30]); },
    countdown: () => { if ('vibrate' in navigator) navigator.vibrate(15); },
  },
};
