'use client';

import { useRef, useEffect } from 'react';

// ── Vaporwave generative music engine ──────────────────────────────
// Slow tempo, lush detuned pads, jazzy 7th/9th chords, lo-fi reverb,
// tape warble, randomised arpeggios.
// Auto-starts on first user interaction (browser autoplay policy).

const BPM = 72;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
const FADE_IN = 1.5;

// Chord progression (MIDI) — Fmaj9 → Dm7 → Bbmaj7 → C9
const CHORDS: number[][] = [
  [53, 57, 60, 64, 67],   // Fmaj9
  [50, 53, 57, 60, 64],   // Dm7
  [46, 50, 53, 57, 60],   // Bbmaj7
  [48, 52, 55, 59, 62],   // C9
];
const BASS_NOTES = [41, 38, 34, 36]; // F2 D2 Bb1 C2

function midiToFreq(midi: number) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// ── Engine state ───────────────────────────────────────────────────

interface Engine {
  ctx: AudioContext;
  master: GainNode;
  reverb: ConvolverNode;
  lfo: OscillatorNode;
  warbleLfo: OscillatorNode;
  warbleGain: GainNode;
  nextChordTime: number;
  chordIdx: number;
  running: boolean;
  schedulerId: ReturnType<typeof setTimeout> | null;
}

// ── Procedural reverb ──────────────────────────────────────────────

function createReverb(ctx: AudioContext): ConvolverNode {
  const conv = ctx.createConvolver();
  const rate = ctx.sampleRate;
  const len = rate * 3;
  const buf = ctx.createBuffer(2, len, rate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.2);
    }
  }
  conv.buffer = buf;
  return conv;
}

// ── Pad: detuned saws + lowpass + tape warble ──────────────────────

function playPad(e: Engine, chord: number[], time: number) {
  const dur = BAR * 0.95;
  const ctx = e.ctx;

  chord.forEach((note) => {
    const freq = midiToFreq(note);

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';
    osc1.frequency.setValueAtTime(freq, time);
    osc2.frequency.setValueAtTime(freq * 1.003, time);

    // Tape warble: shared LFO → per-osc frequency modulation
    const w1 = ctx.createGain();
    const w2 = ctx.createGain();
    w1.gain.setValueAtTime(freq * 0.002, time);
    w2.gain.setValueAtTime(freq * 0.002, time);
    e.warbleGain.connect(w1);
    e.warbleGain.connect(w2);
    w1.connect(osc1.frequency);
    w2.connect(osc2.frequency);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, time);
    filter.frequency.linearRampToValueAtTime(1400, time + dur * 0.3);
    filter.frequency.linearRampToValueAtTime(600, time + dur);
    filter.Q.setValueAtTime(1.5, time);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.045, time + dur * 0.15);
    gain.gain.linearRampToValueAtTime(0.035, time + dur * 0.6);
    gain.gain.linearRampToValueAtTime(0, time + dur);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(e.reverb);
    gain.connect(e.master);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + dur + 0.1);
    osc2.stop(time + dur + 0.1);

    osc1.onended = () => {
      osc1.disconnect(); osc2.disconnect();
      filter.disconnect(); gain.disconnect();
      w1.disconnect(); w2.disconnect();
    };
  });
}

// ── Bass: triangle + lowpass ───────────────────────────────────────

function playBass(e: Engine, note: number, time: number) {
  const dur = BAR * 0.85;
  const ctx = e.ctx;
  const freq = midiToFreq(note);

  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, time);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(300, time);
  filter.Q.setValueAtTime(2, time);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(0.12, time + 0.08);
  gain.gain.linearRampToValueAtTime(0.08, time + dur * 0.5);
  gain.gain.linearRampToValueAtTime(0, time + dur);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(e.master);

  osc.start(time);
  osc.stop(time + dur + 0.1);

  osc.onended = () => {
    osc.disconnect(); filter.disconnect(); gain.disconnect();
  };
}

// ── Arpeggio: sine, randomised skips ───────────────────────────────

function playArp(e: Engine, chord: number[], barStart: number) {
  const ctx = e.ctx;
  const step = BEAT;
  const notes = [chord[2], chord[3], chord[4], chord[3]];

  notes.forEach((note, i) => {
    if (Math.random() < 0.2) return;

    const time = barStart + step * i;
    const freq = midiToFreq(note + 12);
    const dur = step * 0.7;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.025, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.003, time + dur);
    gain.gain.linearRampToValueAtTime(0, time + dur + 0.05);

    osc.connect(gain);
    gain.connect(e.reverb);

    osc.start(time);
    osc.stop(time + dur + 0.1);

    osc.onended = () => { osc.disconnect(); gain.disconnect(); };
  });
}

// ── Scheduler ──────────────────────────────────────────────────────

function scheduleAhead(e: Engine) {
  const LOOKAHEAD = 0.5;
  while (e.nextChordTime < e.ctx.currentTime + LOOKAHEAD) {
    const chord = CHORDS[e.chordIdx % CHORDS.length];
    const bass = BASS_NOTES[e.chordIdx % BASS_NOTES.length];

    playPad(e, chord, e.nextChordTime);
    playBass(e, bass, e.nextChordTime);
    playArp(e, chord, e.nextChordTime);

    e.chordIdx++;
    e.nextChordTime += BAR;
  }
}

// ── Engine lifecycle ───────────────────────────────────────────────

function createEngine(): Engine {
  const ctx = new AudioContext();

  const master = ctx.createGain();
  master.gain.setValueAtTime(0, ctx.currentTime);
  master.gain.linearRampToValueAtTime(0.7, ctx.currentTime + FADE_IN);
  master.connect(ctx.destination);

  const reverb = createReverb(ctx);
  const reverbGain = ctx.createGain();
  reverbGain.gain.setValueAtTime(0.5, ctx.currentTime);
  reverb.connect(reverbGain);
  reverbGain.connect(master);

  // Master wobble LFO (volume)
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.type = 'sine';
  lfo.frequency.setValueAtTime(0.15, ctx.currentTime);
  lfoGain.gain.setValueAtTime(0.06, ctx.currentTime);
  lfo.connect(lfoGain);
  lfoGain.connect(master.gain);
  lfo.start();

  // Tape warble LFO (pitch drift on pads)
  const warbleLfo = ctx.createOscillator();
  const warbleGain = ctx.createGain();
  warbleLfo.type = 'sine';
  warbleLfo.frequency.setValueAtTime(0.05, ctx.currentTime);
  warbleGain.gain.setValueAtTime(1, ctx.currentTime);
  warbleLfo.connect(warbleGain);
  warbleLfo.start();

  const engine: Engine = {
    ctx, master, reverb, lfo, warbleLfo, warbleGain,
    nextChordTime: ctx.currentTime + 0.1,
    chordIdx: 0,
    running: true,
    schedulerId: null,
  };

  function loop() {
    if (!engine.running) return;
    scheduleAhead(engine);
    engine.schedulerId = setTimeout(loop, 200);
  }
  loop();

  return engine;
}

function destroyEngine(e: Engine) {
  e.running = false;
  if (e.schedulerId !== null) clearTimeout(e.schedulerId);
  e.lfo.stop();
  e.warbleLfo.stop();
  e.ctx.close();
}

// ── React hook — auto-start on first interaction ───────────────────

export function useVaporwaveAudio() {
  const engineRef = useRef<Engine | null>(null);

  useEffect(() => {
    function boot() {
      if (engineRef.current) return;
      engineRef.current = createEngine();
      // Remove listeners once audio is started
      window.removeEventListener('click', boot);
      window.removeEventListener('touchstart', boot);
      window.removeEventListener('keydown', boot);
    }

    window.addEventListener('click', boot, { once: false });
    window.addEventListener('touchstart', boot, { once: false });
    window.addEventListener('keydown', boot, { once: false });

    return () => {
      window.removeEventListener('click', boot);
      window.removeEventListener('touchstart', boot);
      window.removeEventListener('keydown', boot);
      if (engineRef.current) {
        destroyEngine(engineRef.current);
        engineRef.current = null;
      }
    };
  }, []);
}
