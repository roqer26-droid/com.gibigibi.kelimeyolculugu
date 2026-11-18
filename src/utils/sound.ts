// Web Audio API ile harici dosya gerektirmeyen, ferah ve yumuşak bulmaca ses efektleri

class SoundManager {
  private ctx: AudioContext | null = null;
  private enabled = true;

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  private getContext(): AudioContext | null {
    if (!this.enabled || typeof window === 'undefined') return null;
    try {
      if (!this.ctx) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;
        if (!AudioCtx) return null;
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        void this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  private playTone(
    freq: number,
    duration: number,
    options?: {
      type?: OscillatorType;
      volume?: number;
      delay?: number;
      slideTo?: number;
    }
  ): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime + (options?.delay ?? 0);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = options?.type ?? 'sine';
    osc.frequency.setValueAtTime(freq, now);
    if (options?.slideTo) {
      osc.frequency.exponentialRampToValueAtTime(options.slideTo, now + duration);
    }

    const vol = options?.volume ?? 0.12;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.014);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  /**
   * Harf seçildiğinde seçilen harf sırasına göre yükselen pentatonik nota çalar.
   */
  public playSelectLetter(stepIndex: number): void {
    // C major pentatonik frekansları (yumuşak, müzikal yükseliş)
    const scale = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51];
    const freq = scale[Math.min(stepIndex, scale.length - 1)];
    this.playTone(freq, 0.13, { type: 'sine', volume: 0.11 });
    this.playTone(freq * 1.5, 0.09, { type: 'triangle', volume: 0.03 });
  }

  /**
   * Geri sürükleyerek son harf iptal edildiğinde yumuşak alçalan ton çalar.
   */
  public playDeselectLetter(): void {
    this.playTone(460, 0.1, { type: 'sine', volume: 0.07, slideTo: 340 });
  }

  /**
   * Doğru hedef kelime bulunduğunda parlak yükselen akor çalar.
   */
  public playCorrectWord(): void {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.24, {
        type: 'triangle',
        volume: 0.11,
        delay: idx * 0.055,
      });
    });
  }

  /**
   * Bonus kelime bulunduğunda parıltılı zil efekti çalar.
   */
  public playBonusWord(): void {
    this.playTone(783.99, 0.2, { type: 'sine', volume: 0.1 });
    this.playTone(1174.66, 0.28, { type: 'sine', volume: 0.1, delay: 0.07 });
    this.playTone(1567.98, 0.22, { type: 'triangle', volume: 0.05, delay: 0.12 });
  }

  /**
   * Yanlış kelimede kısa ve yumuşak uyarı tonu çalar.
   */
  public playInvalidWord(): void {
    this.playTone(230, 0.14, { type: 'triangle', volume: 0.09, slideTo: 185 });
  }

  /**
   * Daha önce bulunmuş kelimede nazik çift tık tonu çalar.
   */
  public playAlreadyFound(): void {
    this.playTone(440, 0.1, { type: 'sine', volume: 0.07 });
    this.playTone(440, 0.1, { type: 'sine', volume: 0.06, delay: 0.11 });
  }

  /**
   * İpucu harfi açıldığında parlak sihirli ton çalar.
   */
  public playHint(): void {
    const notes = [659.25, 880, 1174.66];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.22, {
        type: 'sine',
        volume: 0.09,
        delay: idx * 0.06,
      });
    });
  }

  /**
   * Harfleri karıştırırken hafif mekanik tıkırtı sesi.
   */
  public playShuffle(): void {
    this.playTone(360, 0.06, { type: 'triangle', volume: 0.06, slideTo: 520 });
    this.playTone(480, 0.06, { type: 'triangle', volume: 0.05, delay: 0.05, slideTo: 620 });
  }

  /**
   * Bölüm tamamlandığında neşeli kutlama fanfarı çalar.
   */
  public playLevelComplete(): void {
    const melody = [
      { f: 523.25, d: 0.18, t: 0.0 },
      { f: 659.25, d: 0.18, t: 0.1 },
      { f: 783.99, d: 0.22, t: 0.2 },
      { f: 1046.5, d: 0.45, t: 0.32 },
      { f: 783.99, d: 0.18, t: 0.48 },
      { f: 1046.5, d: 0.55, t: 0.6 },
    ];
    for (const note of melody) {
      this.playTone(note.f, note.d, {
        type: 'triangle',
        volume: 0.12,
        delay: note.t,
      });
      this.playTone(note.f * 0.5, note.d, {
        type: 'sine',
        volume: 0.05,
        delay: note.t,
      });
    }
  }

  /**
   * Hafif düğme tıklama sesi.
   */
  public playClick(): void {
    this.playTone(540, 0.06, { type: 'sine', volume: 0.05, slideTo: 600 });
  }
}

export const soundManager = new SoundManager();
