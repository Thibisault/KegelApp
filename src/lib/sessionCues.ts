import type { SessionSegment } from '../types/app';

type CueKind = 'activate' | 'release' | 'complete';

interface CuePlaybackOptions {
  vibrationEnabled: boolean;
  soundEnabled: boolean;
}

interface ToneStep {
  frequency: number;
  durationSeconds: number;
  gain: number;
  gapSeconds?: number;
  glideToFrequency?: number;
  type?: OscillatorType;
}

interface CueDebugEntry {
  cueKind: CueKind;
  source: string;
  at: number;
}

declare global {
  interface Window {
    __sessionCueDebug?: CueDebugEntry[];
    webkitAudioContext?: typeof AudioContext;
  }
}

let sharedAudioContext: AudioContext | null = null;

const vibrationPatterns: Record<CueKind, number | number[]> = {
  activate: [40, 24, 52],
  release: [20, 28, 84],
  complete: [40, 48, 40, 48, 160],
};

const tonePatterns: Record<CueKind, ToneStep[]> = {
  activate: [
    { frequency: 620, durationSeconds: 0.06, gain: 0.05, gapSeconds: 0.025, type: 'triangle' },
    { frequency: 860, durationSeconds: 0.085, gain: 0.06, type: 'triangle' },
  ],
  release: [
    {
      frequency: 430,
      glideToFrequency: 280,
      durationSeconds: 0.16,
      gain: 0.055,
      gapSeconds: 0.035,
      type: 'sine',
    },
    { frequency: 250, durationSeconds: 0.08, gain: 0.03, type: 'sine' },
  ],
  complete: [
    { frequency: 660, durationSeconds: 0.08, gain: 0.05, gapSeconds: 0.035, type: 'triangle' },
    { frequency: 880, durationSeconds: 0.085, gain: 0.055, gapSeconds: 0.04, type: 'triangle' },
    { frequency: 1100, durationSeconds: 0.22, gain: 0.07, type: 'triangle' },
  ],
};

function debugCue(entry: CueDebugEntry) {
  if (typeof window === 'undefined' || !Array.isArray(window.__sessionCueDebug)) {
    return;
  }

  window.__sessionCueDebug.push(entry);
}

function getAudioContext() {
  if (typeof window === 'undefined') {
    return null;
  }

  const AudioContextClass = window.AudioContext ?? window.webkitAudioContext;
  if (!AudioContextClass) {
    return null;
  }

  if (!sharedAudioContext) {
    sharedAudioContext = new AudioContextClass();
  }

  return sharedAudioContext;
}

function scheduleToneSequence(audioContext: AudioContext, cueKind: CueKind) {
  const sequence = tonePatterns[cueKind];
  let cursor = audioContext.currentTime + 0.01;

  sequence.forEach((step) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const filterNode = audioContext.createBiquadFilter();

    oscillator.type = step.type ?? 'sine';
    oscillator.frequency.setValueAtTime(step.frequency, cursor);

    if (step.glideToFrequency) {
      oscillator.frequency.exponentialRampToValueAtTime(
        step.glideToFrequency,
        cursor + step.durationSeconds,
      );
    }

    filterNode.type = 'lowpass';
    filterNode.frequency.setValueAtTime(2200, cursor);

    gainNode.gain.setValueAtTime(0.0001, cursor);
    gainNode.gain.exponentialRampToValueAtTime(
      Math.max(0.0001, step.gain),
      cursor + 0.015,
    );
    gainNode.gain.exponentialRampToValueAtTime(
      0.0001,
      cursor + step.durationSeconds,
    );

    oscillator.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(cursor);
    oscillator.stop(cursor + step.durationSeconds + 0.02);
    cursor += step.durationSeconds + (step.gapSeconds ?? 0);
  });
}

async function playAudioCue(cueKind: CueKind) {
  const audioContext = getAudioContext();
  if (!audioContext) {
    return;
  }

  if (audioContext.state === 'suspended') {
    try {
      await audioContext.resume();
    } catch {
      return;
    }
  }

  scheduleToneSequence(audioContext, cueKind);
}

function playVibrationCue(cueKind: CueKind) {
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) {
    return;
  }

  navigator.vibrate(vibrationPatterns[cueKind]);
}

function cueKindForSegment(segment: SessionSegment): CueKind | null {
  switch (segment.kind) {
    case 'contract':
    case 'hold':
    case 'inhale':
      return 'activate';
    case 'release':
    case 'exhale':
      return 'release';
    default:
      return null;
  }
}

function triggerCue(cueKind: CueKind, source: string, options: CuePlaybackOptions) {
  debugCue({
    cueKind,
    source,
    at: Date.now(),
  });

  if (options.vibrationEnabled) {
    playVibrationCue(cueKind);
  }

  if (options.soundEnabled) {
    void playAudioCue(cueKind);
  }
}

export function primeSessionCueAudio() {
  const audioContext = getAudioContext();
  if (!audioContext || audioContext.state !== 'suspended') {
    return;
  }

  void audioContext.resume().catch(() => {
    // Browsers may refuse resume until a trusted gesture; the session will retry on first cue.
  });
}

export function triggerSegmentCue(segment: SessionSegment, options: CuePlaybackOptions) {
  const cueKind = cueKindForSegment(segment);
  if (!cueKind) {
    return;
  }

  triggerCue(cueKind, segment.kind, options);
}

export function triggerCompletionCue(options: CuePlaybackOptions) {
  triggerCue('complete', 'session-complete', options);
}
