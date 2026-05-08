// Generates success.wav (2s fanfare) and failure.wav (1s sad sound)
const fs = require('fs');
const path = require('path');

const SR = 44100; // sample rate

function writeWav(filename, samples) {
  const dataSize = samples.length * 2;
  const buf = Buffer.alloc(44 + dataSize);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);   // PCM
  buf.writeUInt16LE(1, 22);   // mono
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(dataSize, 40);
  for (let i = 0; i < samples.length; i++) {
    const v = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE(Math.round(v * 32767), 44 + i * 2);
  }
  fs.writeFileSync(filename, buf);
}

// Brass-like tone: fundamental + harmonics
function brass(freq, t) {
  return (
    Math.sin(2 * Math.PI * freq * t) * 0.55 +
    Math.sin(2 * Math.PI * freq * 2 * t) * 0.22 +
    Math.sin(2 * Math.PI * freq * 3 * t) * 0.12 +
    Math.sin(2 * Math.PI * freq * 4 * t) * 0.07 +
    Math.sin(2 * Math.PI * freq * 5 * t) * 0.04
  );
}

// ADSR envelope
function adsr(t, dur, a, d, s, r) {
  if (t < a) return t / a;
  if (t < a + d) return 1 - (1 - s) * (t - a) / d;
  if (t < dur - r) return s;
  if (t < dur) return s * (dur - t) / r;
  return 0;
}

function normalize(samples) {
  let peak = 0;
  for (let i = 0; i < samples.length; i++) {
    const abs = Math.abs(samples[i]);
    if (abs > peak) peak = abs;
  }
  if (peak > 0) for (let i = 0; i < samples.length; i++) samples[i] /= peak * 1.05;
  return samples;
}

// --- SUCCESS (2.0s) -------------------------------------------------------
function generateSuccess() {
  const totalSamples = Math.round(SR * 2.0);
  const out = new Float32Array(totalSamples);

  // Frequency helpers (equal temperament, A4=440)
  const C5  = 523.25, E5 = 659.25, G5 = 783.99;
  const C6  = 1046.5, E6 = 1318.5, G6 = 1567.98;

  const notes = [
    // Quick ascending pickup: C-E-G
    { freqs: [C5],          start: 0.00, dur: 0.13, amp: 0.32 },
    { freqs: [E5],          start: 0.13, dur: 0.13, amp: 0.32 },
    { freqs: [G5],          start: 0.26, dur: 0.13, amp: 0.32 },
    // First chord C-E-G-C' sustained
    { freqs: [C5,E5,G5,C6], start: 0.40, dur: 0.60, amp: 0.22 },
    // Short flourish run: G5-C6-E6
    { freqs: [G5],          start: 1.08, dur: 0.10, amp: 0.32 },
    { freqs: [C6],          start: 1.18, dur: 0.10, amp: 0.32 },
    { freqs: [E6],          start: 1.28, dur: 0.10, amp: 0.32 },
    // Final grand chord C-E-G-C'-E'-G'
    { freqs: [C5,E5,G5,C6,E6,G6], start: 1.40, dur: 0.60, amp: 0.16 },
  ];

  notes.forEach(({ freqs, start, dur, amp }) => {
    const s0 = Math.round(start * SR);
    const sN = Math.min(Math.round((start + dur) * SR), totalSamples);
    for (let i = s0; i < sN; i++) {
      const t  = (i - s0) / SR;
      const tA = i / SR;
      const env = adsr(t, dur, 0.01, 0.04, 0.75, 0.08);
      let v = 0;
      freqs.forEach(f => { v += brass(f, tA); });
      out[i] += v * env * amp;
    }
  });

  return normalize(out);
}

// --- FAILURE (1.0s) -------------------------------------------------------
function generateFailure() {
  const totalSamples = Math.round(SR * 1.0);
  const out = new Float32Array(totalSamples);

  // Sad trombone: Bb4 → G4 → Eb4 → C4 descending
  const Bb4 = 466.16, G4 = 392.00, Eb4 = 311.13, C4 = 261.63;

  const notes = [
    { freq: Bb4, start: 0.00, dur: 0.28, amp: 0.45 },
    { freq: G4,  start: 0.24, dur: 0.26, amp: 0.42 },
    { freq: Eb4, start: 0.46, dur: 0.22, amp: 0.38 },
    { freq: C4,  start: 0.64, dur: 0.36, amp: 0.32 },
  ];

  notes.forEach(({ freq, start, dur, amp }) => {
    const s0 = Math.round(start * SR);
    const sN = Math.min(Math.round((start + dur) * SR), totalSamples);
    for (let i = s0; i < sN; i++) {
      const t  = (i - s0) / SR;
      const tA = i / SR;
      const env = adsr(t, dur, 0.015, 0.03, 0.65, 0.10);
      // Slight vibrato for "wah" feel
      const vib = 1 + 0.012 * Math.sin(2 * Math.PI * 5.5 * t);
      const v = brass(freq * vib, tA);
      out[i] += v * env * amp;
    }
  });

  return normalize(out);
}

const outDir = path.join(__dirname, '../public/sounds');
fs.mkdirSync(outDir, { recursive: true });

writeWav(path.join(outDir, 'success.wav'), generateSuccess());
console.log('✓ public/sounds/success.wav (2.0s fanfare)');

writeWav(path.join(outDir, 'failure.wav'), generateFailure());
console.log('✓ public/sounds/failure.wav (1.0s sad trombone)');
