/**
 * Síntesis de sonido mediante Web Audio API para feedback auditivo inmediato en modo Kiosco
 */

class AudioFeedbackController {
  constructor() {
    this.ctx = null;
  }

  initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Tono agradable ascendente para ENTRADA (Verde)
  playEntryBeep() {
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, this.ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880.00, this.ctx.currentTime + 0.14); // A5

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.22);
    } catch (e) {
      console.warn('Audio feedback no disponible:', e);
    }
  }

  // Tono de dos notas para SALIDA (Azul)
  playExitBeep() {
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(783.99, this.ctx.currentTime); // G5
      osc.frequency.exponentialRampToValueAtTime(523.25, this.ctx.currentTime + 0.18); // C5

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch (e) {
      console.warn('Audio feedback no disponible:', e);
    }
  }

  // Doble tono suave para AVISO / YA REGISTRADO (Ámbar)
  playWarningBeep() {
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime); // A4
      osc.frequency.setValueAtTime(440, this.ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.28);
    } catch (e) {
      console.warn('Audio feedback no disponible:', e);
    }
  }

  // Tono grave para ERROR / QR NO RECONOCIDO (Rojo)
  playErrorBeep() {
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, this.ctx.currentTime); // A3
      osc.frequency.linearRampToValueAtTime(160, this.ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);
    } catch (e) {
      console.warn('Audio feedback no disponible:', e);
    }
  }

  playFeedbackForType(tipo) {
    if (tipo === 'ENTRADA') this.playEntryBeep();
    else if (tipo === 'SALIDA') this.playExitBeep();
    else if (tipo === 'COMPLETADO') this.playWarningBeep();
    else this.playErrorBeep();
  }
}

export const audioFeedback = new AudioFeedbackController();
