// Unhurried, Child-Centric Mobile Speech Controller
// Enforces generous calm pauses between instructions without continuous overlapping narration

export interface SpeechControllerState {
  isSpeaking: boolean;
  isEnabled: boolean;
  currentText: string | null;
}

class MobileSpeechManager {
  private _isEnabled: boolean = true;
  private _isSpeaking: boolean = false;
  private _listeners: Set<(state: SpeechControllerState) => void> = new Set();
  private _lastSpokenText: string | null = null;
  private _cooldownTimer: any = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public subscribe(listener: (state: SpeechControllerState) => void): () => void {
    this._listeners.add(listener);
    listener(this.getState());
    return () => this._listeners.delete(listener);
  }

  public getState(): SpeechControllerState {
    return {
      isSpeaking: this._isSpeaking,
      isEnabled: this._isEnabled,
      currentText: this._lastSpokenText,
    };
  }

  private _notify(): void {
    const state = this.getState();
    this._listeners.forEach(fn => fn(state));
  }

  public setEnabled(enabled: boolean): void {
    this._isEnabled = enabled;
    if (!enabled) {
      this.stop();
    }
    this._notify();
  }

  public toggle(): boolean {
    this.setEnabled(!this._isEnabled);
    return this._isEnabled;
  }

  public stop(): void {
    if (this._cooldownTimer) {
      clearTimeout(this._cooldownTimer);
      this._cooldownTimer = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this._isSpeaking = false;
    this._notify();
  }

  /**
   * Speak a step instruction with unhurried child-friendly cadence (~105 wpm).
   * Automatically strips markdown and enforces a generous pause before speaking.
   */
  public speak(text: string, onDone?: () => void): void {
    this.stop();

    if (!this._isEnabled || !text || text.trim().length === 0) {
      onDone?.();
      return;
    }

    const clean = text
      .replace(/[#*`_~]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    this._lastSpokenText = clean;

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      onDone?.();
      return;
    }

    // 400ms gentle pause before speaking to allow child's eye to adjust to the step
    this._cooldownTimer = setTimeout(() => {
      try {
        const utterance = new SpeechSynthesisUtterance(clean);
        utterance.rate = 0.88; // Calm, unhurried pacing for children
        utterance.pitch = 1.05; // Friendly, warm tone
        utterance.lang = 'en-US';

        utterance.onstart = () => {
          this._isSpeaking = true;
          this._notify();
        };

        utterance.onend = () => {
          this._isSpeaking = false;
          this._notify();
          onDone?.();
        };

        utterance.onerror = () => {
          this._isSpeaking = false;
          this._notify();
          onDone?.();
        };

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        this._isSpeaking = false;
        this._notify();
        onDone?.();
      }
    }, 400);
  }

  public replay(): void {
    if (this._lastSpokenText) {
      this.speak(this._lastSpokenText);
    }
  }
}

export const mobileSpeech = new MobileSpeechManager();
