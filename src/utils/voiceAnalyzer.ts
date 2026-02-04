export interface VoiceMetrics {
  volume: number; smoothVolume: number; isSilent: boolean; totalSilenceDuration: number;
  pauseCount: number; averageSpeechVolume: number; estimatedPace: number; volumeVariance: number; peakVolume: number;
}

export class VoiceAnalyzer {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private dataArray: Uint8Array | null = null;
  private animationId: number | null = null;
  private metrics: VoiceMetrics = { volume: 0, smoothVolume: 0, isSilent: true, totalSilenceDuration: 0, pauseCount: 0, averageSpeechVolume: 0, estimatedPace: 120, volumeVariance: 0, peakVolume: 0 };
  private volumeHistory: number[] = [];
  private lastSilenceStart = 0;
  private wasSilent = true;
  private startTime = 0;
  private speechVolumeSum = 0;
  private speechSamples = 0;

  async start(onUpdate: (m: VoiceMetrics) => void): Promise<boolean> {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      this.audioContext = new AudioContext();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      source.connect(this.analyser);
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      this.startTime = Date.now();
      this.lastSilenceStart = Date.now();
      this.analyze(onUpdate);
      return true;
    } catch { return false; }
  }

  private analyze(onUpdate: (m: VoiceMetrics) => void) {
    if (!this.analyser || !this.dataArray) return;
    this.analyser.getByteFrequencyData(this.dataArray);
    const avg = this.dataArray.reduce((a, b) => a + b, 0) / this.dataArray.length / 255;
    this.metrics.volume = avg;
    this.metrics.smoothVolume = this.metrics.smoothVolume * 0.9 + avg * 0.1;
    const now = Date.now(), isSilent = avg < 0.02;
    if (isSilent && !this.wasSilent) this.lastSilenceStart = now;
    else if (!isSilent && this.wasSilent) { const dur = (now - this.lastSilenceStart) / 1000; if (dur > 0.5) this.metrics.pauseCount++; this.metrics.totalSilenceDuration += dur; }
    if (!isSilent) { this.speechVolumeSum += avg; this.speechSamples++; this.metrics.peakVolume = Math.max(this.metrics.peakVolume, avg); }
    this.wasSilent = isSilent; this.metrics.isSilent = isSilent;
    this.volumeHistory.push(avg); if (this.volumeHistory.length > 100) this.volumeHistory.shift();
    if (this.volumeHistory.length > 10) { const mean = this.volumeHistory.reduce((a, b) => a + b, 0) / this.volumeHistory.length; this.metrics.volumeVariance = Math.sqrt(this.volumeHistory.reduce((a, v) => a + Math.pow(v - mean, 2), 0) / this.volumeHistory.length); }
    if (this.speechSamples > 0) this.metrics.averageSpeechVolume = this.speechVolumeSum / this.speechSamples;
    const totalTime = (now - this.startTime) / 1000;
    if (totalTime > 5) this.metrics.estimatedPace = Math.round(100 + this.metrics.pauseCount * 5);
    onUpdate({ ...this.metrics });
    this.animationId = requestAnimationFrame(() => this.analyze(onUpdate));
  }

  stop(): { metrics: VoiceMetrics } {
    if (this.animationId) { cancelAnimationFrame(this.animationId); this.animationId = null; }
    if (this.mediaStream) { this.mediaStream.getTracks().forEach(t => t.stop()); this.mediaStream = null; }
    if (this.audioContext) { this.audioContext.close(); this.audioContext = null; }
    return { metrics: { ...this.metrics } };
  }
}
