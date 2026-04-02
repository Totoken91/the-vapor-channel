'use client';

import { useRef, useEffect } from 'react';

// ── Vaporwave generative music engine ──────────────────────────────
// Slow tempo, lush detuned pads, jazzy 7th/9th chords, lo-fi reverb,
// tape warble, randomised arpeggios, dynamic density, ear candy.
// Auto-starts on first user interaction (browser autoplay policy).

const BPM = 72;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
const FADE_IN = 1.5;

// ── Chord sections — 4 × 4 bars = 16 bars before possible repeat ──

interface Section {
  chords: number[][];
  bass: number[];
}

const SECTIONS: Section[] = [
  { // A: Fmaj9 → Dm7 → Bbmaj7 → C9 (original)
    chords: [[53,57,60,64,67],[50,53,57,60,64],[46,50,53,57,60],[48,52,55,59,62]],
    bass: [41, 38, 34, 36],
  },
  { // B: Ebmaj7 → Cm9 → Abmaj7 → Bb7
    chords: [[51,55,58,62,65],[48,51,55,58,63],[44,48,51,55,58],[46,50,53,57,60]],
    bass: [39, 36, 32, 34],
  },
  { // C: Dbmaj9 → Bbm7 → Gbmaj7 → Ab9
    chords: [[49,53,56,60,63],[46,49,53,56,61],[42,46,49,53,56],[44,48,51,55,58]],
    bass: [37, 34, 30, 32],
  },
  { // D: Am7 → Fmaj7 → Dm9 → Em7 (relative minor)
    chords: [[45,48,52,55,60],[41,45,48,52,57],[38,41,45,48,53],[40,43,47,50,55]],
    bass: [33, 29, 26, 28],
  },
];

// ── Arp pattern pool ───────────────────────────────────────────────

const ARP_PATTERNS: number[][] = [
  [2, 3, 4, 3],       // up-down (original)
  [0, 2, 4, 3],       // root-skip-top-down
  [4, 3, 2, 1],       // descending
  [2, 4, 2, 0],       // skip
  [1, 3, 4, 2],       // jumpy
  [0, 2, 3, 4, 3, 2], // 6-note extended
];

function midiToFreq(midi: number) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

// ── Engine state ───────────────────────────────────────────────────

interface Engine {
  ctx: AudioContext;
  master: GainNode;
  reverb: ConvolverNode;
  lfo: OscillatorNode;
  warbleLfo: OscillatorNode;
  warbleGain: GainNode;
  noiseBuffer: AudioBuffer;
  nextChordTime: number;
  sectionIdx: number;
  barInSection: number;
  barCount: number;
  breakdownBars: number; // >0 = in breakdown (counts down)
  nextBreakdown: number; // bars until next breakdown
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

function createNoiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

// ── Pad: detuned saws + lowpass + tape warble ──────────────────────

function playPad(e: Engine, chord: number[], time: number, breakdown: boolean) {
  const dur = BAR * 0.95;
  const ctx = e.ctx;

  // Randomised filter/envelope per chord
  const cutoffBase = rand(600, 1100);
  const cutoffPeak = breakdown ? cutoffBase * 0.7 : cutoffBase + rand(300, 900);
  const cutoffEnd = rand(400, 800);
  const attackFrac = rand(0.08, 0.28);
  const peakGain = rand(0.035, 0.055);
  const sustainFrac = rand(0.4, 0.7);
  const filterQ = rand(1.0, 3.0);

  chord.forEach((note) => {
    const freq = midiToFreq(note);

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';
    osc1.frequency.setValueAtTime(freq, time);
    osc2.frequency.setValueAtTime(freq * 1.003, time);

    // Tape warble
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
    filter.frequency.setValueAtTime(cutoffBase, time);
    filter.frequency.linearRampToValueAtTime(cutoffPeak, time + dur * 0.3);
    filter.frequency.linearRampToValueAtTime(cutoffEnd, time + dur);
    filter.Q.setValueAtTime(filterQ, time);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(peakGain, time + dur * attackFrac);
    gain.gain.linearRampToValueAtTime(peakGain * 0.75, time + dur * sustainFrac);
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

// ── Bass: triangle + lowpass + variation ────────────────────────────

function playBass(e: Engine, note: number, time: number) {
  const ctx = e.ctx;
  const r = Math.random();

  // 10% silence
  if (r < 0.10) return;

  // 20% octave up
  const actualNote = r < 0.30 ? note + 12 : note;

  // 25% two-note pattern (root then fifth)
  const twoNote = r >= 0.30 && r < 0.55;

  const dur1 = twoNote ? BAR * 0.4 : BAR * 0.85;
  const freq1 = midiToFreq(actualNote);

  // First note
  playBassNote(ctx, e.master, freq1, time, dur1);

  // Second note (fifth or fourth)
  if (twoNote) {
    const interval = Math.random() < 0.6 ? 7 : 5; // fifth or fourth
    const freq2 = midiToFreq(actualNote + interval);
    playBassNote(ctx, e.master, freq2, time + BEAT * 2, BAR * 0.35);
  }

  // 15% ghost note on beat 3
  if (r >= 0.55 && r < 0.70) {
    const ghostFreq = midiToFreq(actualNote);
    playBassNote(ctx, e.master, ghostFreq, time + BEAT * 2, BEAT * 0.3, 0.03);
  }
}

function playBassNote(
  ctx: AudioContext, dest: GainNode,
  freq: number, time: number, dur: number, peakGain = 0.12,
) {
  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, time);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(300, time);
  filter.Q.setValueAtTime(2, time);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(peakGain, time + 0.08);
  gain.gain.linearRampToValueAtTime(peakGain * 0.65, time + dur * 0.5);
  gain.gain.linearRampToValueAtTime(0, time + dur);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(dest);

  osc.start(time);
  osc.stop(time + dur + 0.1);

  osc.onended = () => {
    osc.disconnect(); filter.disconnect(); gain.disconnect();
  };
}

// ── Arpeggio: varied patterns, octaves, rhythm ─────────────────────

function playArp(e: Engine, chord: number[], barStart: number) {
  const ctx = e.ctx;
  const pattern = pick(ARP_PATTERNS);

  // Rhythm mode
  const rhythmRoll = Math.random();
  let step: number;
  let count: number;
  if (rhythmRoll < 0.60) {
    step = BEAT; count = pattern.length;                        // normal
  } else if (rhythmRoll < 0.85) {
    step = BEAT / 2; count = Math.min(pattern.length * 2, 8);  // double-time
  } else {
    step = BEAT * 2; count = Math.min(pattern.length, 2);      // half-time
  }

  const skipRate = rand(0.10, 0.35);

  for (let i = 0; i < count; i++) {
    if (Math.random() < skipRate) continue;

    const noteIdx = pattern[i % pattern.length];
    if (noteIdx >= chord.length) continue;
    const note = chord[noteIdx];

    // Octave variation: 70% +12, 20% +24, 10% +0
    const octRoll = Math.random();
    const octave = octRoll < 0.70 ? 12 : octRoll < 0.90 ? 24 : 0;

    const time = barStart + step * i;
    if (time >= barStart + BAR) break; // don't overflow into next bar

    const freq = midiToFreq(note + octave);
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
  }
}

// ── Ear candy — rare random events ─────────────────────────────────

function maybePlayCandy(e: Engine, chord: number[], time: number) {
  const ctx = e.ctx;
  const r = Math.random();

  if (r < 0.05) {
    // Bell: high sine, long decay
    const note = pick(chord) + 24 + Math.floor(Math.random() * 12);
    const freq = midiToFreq(note);
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.015, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 1.5);
    gain.gain.linearRampToValueAtTime(0, time + 1.6);
    osc.connect(gain);
    gain.connect(e.reverb);
    osc.start(time);
    osc.stop(time + 1.7);
    osc.onended = () => { osc.disconnect(); gain.disconnect(); };

  } else if (r < 0.09) {
    // Vinyl crackle: filtered noise burst
    const dur = rand(0.3, 0.8);
    const src = ctx.createBufferSource();
    src.buffer = e.noiseBuffer;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(rand(3000, 5000), time);
    hp.Q.setValueAtTime(0.7, time);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(8000, time);
    bp.Q.setValueAtTime(3, time);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.008, time + 0.02);
    gain.gain.linearRampToValueAtTime(0.008, time + dur * 0.7);
    gain.gain.linearRampToValueAtTime(0, time + dur);
    src.connect(hp);
    hp.connect(bp);
    bp.connect(gain);
    gain.connect(e.master);
    src.start(time);
    src.stop(time + dur + 0.05);
    src.onended = () => { src.disconnect(); hp.disconnect(); bp.disconnect(); gain.disconnect(); };

  } else if (r < 0.12) {
    // Ghost echo: chord tone ±octave, long reverb tail
    const note = pick(chord) + (Math.random() < 0.5 ? -12 : 24);
    const freq = midiToFreq(note);
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.012, time + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 2.0);
    gain.gain.linearRampToValueAtTime(0, time + 2.1);
    osc.connect(gain);
    gain.connect(e.reverb);
    osc.start(time);
    osc.stop(time + 2.2);
    osc.onended = () => { osc.disconnect(); gain.disconnect(); };

  } else if (r < 0.15) {
    // Sub drop: very low sine rumble
    const freq = rand(30, 50);
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.04, time + 0.5);
    gain.gain.linearRampToValueAtTime(0, time + 2.0);
    osc.connect(gain);
    gain.connect(e.master);
    osc.start(time);
    osc.stop(time + 2.1);
    osc.onended = () => { osc.disconnect(); gain.disconnect(); };
  }
}

// ── Scheduler ──────────────────────────────────────────────────────

function scheduleAhead(e: Engine) {
  const LOOKAHEAD = 0.5;
  while (e.nextChordTime < e.ctx.currentTime + LOOKAHEAD) {
    const section = SECTIONS[e.sectionIdx];
    const chord = section.chords[e.barInSection];
    const bass = section.bass[e.barInSection];
    const inBreakdown = e.breakdownBars > 0;

    // Pad always plays
    playPad(e, chord, e.nextChordTime, inBreakdown);

    // Bass: skip during breakdown, 85% otherwise
    if (!inBreakdown && Math.random() < 0.85) {
      playBass(e, bass, e.nextChordTime);
    }

    // Arp: skip during breakdown, 80% otherwise
    if (!inBreakdown && Math.random() < 0.80) {
      playArp(e, chord, e.nextChordTime);
    }

    // Ear candy (can play during breakdown too)
    maybePlayCandy(e, chord, e.nextChordTime);

    // Advance
    e.barInSection++;
    e.barCount++;

    // Breakdown tracking
    if (inBreakdown) {
      e.breakdownBars--;
    } else {
      e.nextBreakdown--;
      if (e.nextBreakdown <= 0) {
        e.breakdownBars = 2;
        e.nextBreakdown = 12 + Math.floor(Math.random() * 8);
      }
    }

    // Section transition
    if (e.barInSection >= 4) {
      e.barInSection = 0;
      const r = Math.random();
      if (r >= 0.50) {
        if (r < 0.90) {
          // Adjacent section
          const dir = Math.random() < 0.5 ? 1 : SECTIONS.length - 1;
          e.sectionIdx = (e.sectionIdx + dir) % SECTIONS.length;
        } else {
          // Random jump
          e.sectionIdx = Math.floor(Math.random() * SECTIONS.length);
        }
      }
      // else: stay on current section
    }

    e.nextChordTime += BAR;
  }
}

// ── Engine lifecycle ───────────────────────────────────────────────

function createEngine(): Engine {
  const ctx = new AudioContext();
  // Some browsers start AudioContext suspended even from a user gesture —
  // explicitly resume to guarantee playback.
  if (ctx.state === 'suspended') ctx.resume();

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

  // Pre-generated noise for vinyl crackle
  const noiseBuffer = createNoiseBuffer(ctx, 0.5);

  const engine: Engine = {
    ctx, master, reverb, lfo, warbleLfo, warbleGain, noiseBuffer,
    nextChordTime: ctx.currentTime + 0.1,
    sectionIdx: Math.floor(Math.random() * SECTIONS.length),
    barInSection: 0,
    barCount: 0,
    breakdownBars: 0,
    nextBreakdown: 12 + Math.floor(Math.random() * 8),
    running: true,
    schedulerId: null,
  };

  function loop() {
    if (!engine.running) return;
    try { scheduleAhead(engine); } catch (err) { console.warn('audio scheduler:', err); }
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
      try {
        engineRef.current = createEngine();
      } catch (err) {
        console.warn('audio boot failed:', err);
        return;
      }
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
