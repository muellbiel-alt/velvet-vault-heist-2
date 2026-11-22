// Small WebAudio synth: every sound is built from oscillators and filtered noise, no files.
// The audio context is created on the first user gesture; until then the game stays silent.
export function createAudio() {
  let context = null;
  let master = null;
  let muted = false;
  let beepTimer = 0;

  function ensure() {
    if (context) return true;
    try {
      const AudioContext = window.AudioContext ?? window.webkitAudioContext;
      if (!AudioContext) return false;
      context = new AudioContext();
      master = context.createGain();
      master.gain.value = 0.35;
      master.connect(context.destination);
      return true;
    } catch {
      return false;
    }
  }

  function tone(freq, seconds, type, gainValue, slideTo) {
    if (!ensure() || muted) return;
    const now = context.currentTime;
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, now + seconds);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(gainValue, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + seconds);
    osc.connect(gain);
    gain.connect(master);
    osc.start(now);
    osc.stop(now + seconds + 0.05);
  }

  function noise(seconds, gainValue, filterFreq) {
    if (!ensure() || muted) return;
    const now = context.currentTime;
    const length = Math.max(1, Math.floor(context.sampleRate * seconds));
    const buffer = context.createBuffer(1, length, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    const source = context.createBufferSource();
    source.buffer = buffer;
    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterFreq;
    const gain = context.createGain();
    gain.gain.setValueAtTime(gainValue, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + seconds);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    source.start(now);
  }

  return {
    unlock() {
      if (ensure() && context.state === 'suspended') context.resume();
    },
    toggleMute() {
      muted = !muted;
      return muted;
    },
    step() {
      noise(0.07, 0.12, 900);
    },
    coin() {
      tone(1568, 0.12, 'triangle', 0.25);
      tone(2093, 0.18, 'triangle', 0.2);
    },
    smoke() {
      noise(0.5, 0.3, 500);
    },
    pickup() {
      tone(659, 0.12, 'sine', 0.3);
      tone(988, 0.22, 'sine', 0.3);
    },
    diamond() {
      tone(523, 0.14, 'sine', 0.3);
      tone(659, 0.14, 'sine', 0.3);
      tone(784, 0.14, 'sine', 0.3);
      tone(1047, 0.3, 'sine', 0.32);
    },
    spotted() {
      tone(220, 0.5, 'sawtooth', 0.22, 440);
    },
    caught() {
      tone(392, 0.25, 'sawtooth', 0.25, 196);
      tone(196, 0.6, 'sawtooth', 0.25, 98);
    },
    win() {
      [523, 659, 784, 1047].forEach((freq, index) => {
        setTimeout(() => tone(freq, 0.28, 'triangle', 0.3), index * 110);
      });
    },
    cameraBeep(delta) {
      if (!ensure() || muted) return;
      beepTimer += delta;
      if (beepTimer >= 2.4) {
        beepTimer = 0;
        tone(1180, 0.06, 'sine', 0.08);
      }
    },
  };
}
