/**
 * Sound effects generator using pure Web Audio API.
 * No external audio files or network dependencies required.
 */

class SoundEffects {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Check localStorage for saved mute preference
    try {
      const saved = localStorage.getItem('soccer_sound_muted');
      if (saved !== null) {
        this.isMuted = JSON.parse(saved);
      }
    } catch {
      this.isMuted = false;
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    try {
      localStorage.setItem('soccer_sound_muted', JSON.stringify(muted));
    } catch {
      // Ignore
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  /**
   * Authentic dual-tone soccer referee whistle!
   */
  public playWhistle(short: boolean = false) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const duration = short ? 0.25 : 0.6;

      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();
      const vibrato = this.ctx.createOscillator();
      const vibratoGain = this.ctx.createGain();

      // Classic pea-whistle frequencies
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(2600, now);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(2950, now);

      // Rapid vibrato
      vibrato.frequency.setValueAtTime(32, now);
      vibratoGain.gain.setValueAtTime(140, now);
      vibrato.connect(osc1.frequency);
      vibrato.connect(osc2.frequency);

      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.exponentialRampToValueAtTime(0.35, now + 0.04);
      gainNode.gain.setValueAtTime(0.35, now + duration - 0.08);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      vibrato.start(now);
      osc1.start(now);
      osc2.start(now);

      vibrato.stop(now + duration);
      osc1.stop(now + duration);
      osc2.stop(now + duration);
    } catch {
      // Ignore audio failure
    }
  }

  /**
   * Joyful celebration chime arpeggio for finishing a drill or winning a badge
   */
  public playCelebration() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // C5, E5, G5, C6 notes
      const notes = [523.25, 659.25, 783.99, 1046.5];

      notes.forEach((freq, idx) => {
        const noteTime = now + idx * 0.12;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.001, noteTime);
        gain.gain.linearRampToValueAtTime(0.25, noteTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(noteTime);
        osc.stop(noteTime + 0.45);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * Short countdown beep (higher pitch for GO!)
   */
  public playBeep(isGo: boolean = false) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = isGo ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(isGo ? 880 : 440, now);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (isGo ? 0.35 : 0.15));

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + (isGo ? 0.36 : 0.16));
    } catch {
      // Ignore
    }
  }

  /**
   * Subtle click
   */
  public playClick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.frequency.setValueAtTime(600, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // Ignore
    }
  }
}

export const sound = new SoundEffects();
