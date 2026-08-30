/**
 * PULSE ROUTER — Safe Web Audio Synthesizer with Resilient Aliases
 */

class ControlRoomAudioEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.volume = 0.75;
    this.ringInterval = null;
  }

  _initContext() {
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch (e) {}
  }

  setMuted(muted) {
    this.muted = !!muted;
    if (this.muted) {
      this.stopIncomingCallRing();
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, parseFloat(val) || 0.75));
  }

  // Incoming ring
  startIncomingCallRing() {
    try {
      if (this.muted) return;
      this._initContext();
      if (!this.ctx) return;
      this.stopIncomingCallRing();

      const playRingBurst = () => {
        try {
          if (this.muted || !this.ctx) return;
          const now = this.ctx.currentTime;
          const osc1 = this.ctx.createOscillator();
          const osc2 = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc1.type = 'sine';
          osc2.type = 'sine';
          osc1.frequency.setValueAtTime(440, now);
          osc2.frequency.setValueAtTime(480, now);

          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.18 * this.volume, now + 0.05);
          gain.gain.setValueAtTime(0.18 * this.volume, now + 0.8);
          gain.gain.linearRampToValueAtTime(0, now + 0.9);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(this.ctx.destination);

          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + 1.0);
          osc2.stop(now + 1.0);
        } catch (err) {}
      };

      playRingBurst();
      this.ringInterval = setInterval(playRingBurst, 3500);
    } catch (e) {}
  }

  playIncomingCallRing() {
    this.startIncomingCallRing();
  }

  stopIncomingCallRing() {
    try {
      if (this.ringInterval) {
        clearInterval(this.ringInterval);
        this.ringInterval = null;
      }
    } catch (e) {}
  }

  // Dispatch siren burst
  playDispatchAlarm() {
    try {
      if (this.muted) return;
      this._initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.exponentialRampToValueAtTime(950, now + 0.15);
      osc.frequency.exponentialRampToValueAtTime(650, now + 0.3);

      gain.gain.setValueAtTime(0.15 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.38);
    } catch (e) {}
  }

  // Driver acceptance harmonic ascending chime
  playDriverAcceptedChime() {
    try {
      if (this.muted) return;
      this._initContext();
      if (!this.ctx) return;

      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((freq, idx) => {
        const now = this.ctx.currentTime + idx * 0.08;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.15 * this.volume, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.35);
      });
    } catch (e) {}
  }

  playDriverAcceptChime() {
    this.playDriverAcceptedChime();
  }

  playCountdownTick(secondsLeft) {
    try {
      if (this.muted) return;
      this._initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const isUrgent = secondsLeft <= 3;
      const freq = isUrgent ? 880 : 520;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.2 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (isUrgent ? 0.12 : 0.08));

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {}
  }

  playTimeoutAlert() {
    try {
      if (this.muted) return;
      this._initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.setValueAtTime(300, now + 0.15);

      gain.gain.setValueAtTime(0.18 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {}
  }

  playRerouteAlert() {
    this.playTimeoutAlert();
  }

  playCompletionChord() {
    try {
      if (this.muted) return;
      this._initContext();
      if (!this.ctx) return;

      const chord = [440, 554.37, 659.25, 880];
      chord.forEach(freq => {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.12 * this.volume, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 1.3);
      });
    } catch (e) {}
  }
}

export const AudioEngine = new ControlRoomAudioEngine();
