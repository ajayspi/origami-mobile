// -----------------------------------------------------------------------------
// Wind Glide Academy — Procedural ASMR Web Audio Synthesizer
// 100% procedural Web Audio API audio synthesis: zero external audio assets.
// -----------------------------------------------------------------------------

const PENTATONIC_FREQS = [523.25, 587.33, 659.25, 783.99, 880.00]; // C5, D5, E5, G5, A5

class GameAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private windSource: AudioBufferSourceNode | null = null;
  private windFilter: BiquadFilterNode | null = null;
  private windGain: GainNode | null = null;
  private currentWindFreq = 300;
  private initialized = false;

  public init(): void {
    if (this.initialized && this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return;
    }

    try {
      const AudioCtx = (typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext))
        || (globalThis as any).AudioContext;
      if (!AudioCtx) return;

      this.ctx = new AudioCtx();
      if (!this.ctx) return;
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.85;
      this.masterGain.connect(this.ctx.destination);

      this.setupWindLoop();
      this.initialized = true;
    } catch {
      // Audio not supported or blocked
    }
  }

  public isReady(): boolean {
    return this.initialized && this.ctx !== null;
  }

  public getCurrentWindFrequency(): number {
    return this.currentWindFreq;
  }

  private setupWindLoop(): void {
    if (!this.ctx || !this.masterGain) return;

    try {
      const bufferSize = this.ctx.sampleRate * 2; // 2.0s buffer
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Generate pink/white noise
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        data[i] = (b0 + b1 + b2 + white * 0.1) * 0.15;
      }

      this.windFilter = this.ctx.createBiquadFilter();
      this.windFilter.type = 'bandpass';
      this.windFilter.Q.value = 1.8;
      this.windFilter.frequency.value = 300;

      this.windGain = this.ctx.createGain();
      this.windGain.gain.value = 0.0;

      this.windSource = this.ctx.createBufferSource();
      this.windSource.buffer = buffer;
      this.windSource.loop = true;

      this.windSource.connect(this.windFilter);
      this.windFilter.connect(this.windGain);
      this.windGain.connect(this.masterGain);

      this.windSource.start(0);
    } catch {}
  }

  public updateWindRustle(airspeed: number): void {
    if (!this.ctx || !this.windFilter || !this.windGain) return;

    const clampedSpeed = Math.max(0, airspeed);
    const speedFactor = Math.min(clampedSpeed / 30, 1.0);
    this.currentWindFreq = 300 + speedFactor * 1900; // 300Hz to 2200Hz

    const targetGain = Math.min(clampedSpeed / 25, 1.0) * 0.28;
    const now = this.ctx.currentTime;

    try {
      this.windFilter.frequency.setValueAtTime(this.currentWindFreq, now);
      this.windGain.gain.setValueAtTime(targetGain, now);
    } catch {}
  }

  public playLaunchSnap(): void {
    if (!this.ctx || !this.masterGain) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.035);

      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {}
  }

  public playStarChime(pitchIndex = 0): void {
    if (!this.ctx || !this.masterGain) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    try {
      const freq = PENTATONIC_FREQS[pitchIndex % PENTATONIC_FREQS.length];
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.5);
    } catch {}
  }

  public playThermalHum(): void {
    if (!this.ctx || !this.masterGain) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(90, now);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.85);
    } catch {}
  }

  public playDeflectionThud(): void {
    if (!this.ctx || !this.masterGain) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.06);

      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch {}
  }

  public playVictoryFanfare(): void {
    if (!this.ctx || !this.masterGain) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 triumphant fanfare
      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const noteTime = now + idx * 0.12;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteTime);
        gain.gain.setValueAtTime(0.35, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.45);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(noteTime);
        osc.stop(noteTime + 0.5);
      });
    } catch {}
  }

  public playBarrelRoll(): void {
    if (!this.ctx || !this.masterGain) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.linearRampToValueAtTime(1180, now + 0.25);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.55);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.45, now + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.6);
    } catch {}
  }

  public playLoopWhoosh(): void {
    if (!this.ctx || !this.masterGain) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(680, now + 0.45);
      osc.frequency.linearRampToValueAtTime(380, now + 0.85);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0.5, now + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.9);
    } catch {}
  }

  public playFlutterRustle(): void {
    if (!this.ctx || !this.masterGain) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(55, now);
      osc.frequency.linearRampToValueAtTime(75, now + 0.15);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch {}
  }

  public playRocketThruster(): void {
    if (!this.ctx || !this.masterGain) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    try {
      const now = this.ctx.currentTime;

      // Deep Rocket Sub Rumble
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sawtooth';
      subOsc.frequency.setValueAtTime(75, now);
      subOsc.frequency.linearRampToValueAtTime(135, now + 0.35);
      subOsc.frequency.exponentialRampToValueAtTime(35, now + 0.85);

      subGain.gain.setValueAtTime(0.38, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

      subOsc.connect(subGain);
      subGain.connect(this.masterGain);
      subOsc.start(now);
      subOsc.stop(now + 0.9);

      // Fiery Jet Turbine Burn Sweep
      const jetOsc = this.ctx.createOscillator();
      const jetGain = this.ctx.createGain();
      jetOsc.type = 'triangle';
      jetOsc.frequency.setValueAtTime(340, now);
      jetOsc.frequency.linearRampToValueAtTime(820, now + 0.3);
      jetOsc.frequency.exponentialRampToValueAtTime(160, now + 0.75);

      jetGain.gain.setValueAtTime(0.42, now);
      jetGain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);

      jetOsc.connect(jetGain);
      jetGain.connect(this.masterGain);
      jetOsc.start(now);
      jetOsc.stop(now + 0.8);
    } catch {}
  }

  public stopFlightAudio(): void {
    if (!this.ctx || !this.windGain) return;
    try {
      const now = this.ctx.currentTime;
      this.windGain.gain.setValueAtTime(0.0, now);
    } catch {}
  }
}

export const gameAudio = new GameAudioSynthesizer();
