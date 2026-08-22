// Sound Manager using Web Audio API and Howler for crystal clear audio SFX

class SoundManager {
  private isMuted: boolean = false;
  private volume: number = 0.8;
  private audioCtx: AudioContext | null = null;
  private unlocked: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const savedMute = localStorage.getItem('tuitioned_games_muted');
      if (savedMute !== null) {
        this.isMuted = JSON.parse(savedMute);
      }

      // Auto-unlock AudioContext on first user interaction anywhere on the page
      const unlockAudio = () => {
        this.initAudioContext();
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }
        this.unlocked = true;
        window.removeEventListener('pointerdown', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
        window.removeEventListener('click', unlockAudio);
      };

      window.addEventListener('pointerdown', unlockAudio, { once: true });
      window.addEventListener('keydown', unlockAudio, { once: true });
      window.addEventListener('click', unlockAudio, { once: true });
    }
  }

  private initAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('tuitioned_games_muted', JSON.stringify(this.isMuted));
    }
    if (!this.isMuted) {
      this.playTestSound();
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Play test audio chime when user clicks sound button
  public playTestSound() {
    this.playTone(523.25);
  }

  // Play popping sound for balloons/bubbles
  public playPop() {
    if (this.isMuted) return;
    const ctx = this.initAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(this.volume * 0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.11);
    } catch {
      // Audio error fallback
    }
  }

  // Play correct answer cheer chime
  public playCorrect() {
    if (this.isMuted) return;
    const ctx = this.initAudioContext();
    if (!ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.value = freq;

        const startTime = ctx.currentTime + index * 0.08;
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(this.volume * 0.4, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.31);
      });
    } catch {
      // ignore
    }
  }

  // Play wrong answer buzzer sound
  public playWrong() {
    if (this.isMuted) return;
    const ctx = this.initAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(240, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(this.volume * 0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.26);
    } catch {
      // ignore
    }
  }

  // Play card flip sound
  public playFlip() {
    if (this.isMuted) return;
    const ctx = this.initAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(350, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.06);

      gain.gain.setValueAtTime(this.volume * 0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    } catch {
      // ignore
    }
  }

  // Play victory fanfare
  public playVictory() {
    if (this.isMuted) return;
    const ctx = this.initAudioContext();
    if (!ctx) return;

    try {
      const melody = [
        { f: 523.25, d: 0.15 },
        { f: 659.25, d: 0.15 },
        { f: 783.99, d: 0.15 },
        { f: 1046.5, d: 0.45 }
      ];
      let now = ctx.currentTime;
      melody.forEach(note => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.value = note.f;

        gain.gain.setValueAtTime(this.volume * 0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + note.d);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + note.d);
        now += note.d * 0.85;
      });
    } catch {
      // ignore
    }
  }

  // Play note chime for shape mixer and star connects
  public playTone(frequency: number) {
    if (this.isMuted) return;
    const ctx = this.initAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = frequency;

      gain.gain.setValueAtTime(this.volume * 0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {
      // ignore
    }
  }
}

export const soundManager = new SoundManager();
