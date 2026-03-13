import { useEffect, useMemo, useRef, useState } from 'react';

import { triggerCompletionCue, triggerSegmentCue } from '../lib/sessionCues';
import type { GeneratedSession, SessionSegment } from '../types/app';

type PlaybackStatus = 'running' | 'paused' | 'completed';

interface UseSessionPlaybackOptions {
  session: GeneratedSession;
  vibrationEnabled: boolean;
  soundEnabled: boolean;
  onComplete: (actualDurationSeconds: number) => void;
}

function findSegmentIndex(cumulativeDurationsMs: number[], elapsedMs: number) {
  const index = cumulativeDurationsMs.findIndex((time) => elapsedMs < time);
  return index === -1 ? cumulativeDurationsMs.length - 1 : index;
}

export function useSessionPlayback({
  session,
  vibrationEnabled,
  soundEnabled,
  onComplete,
}: UseSessionPlaybackOptions) {
  const [status, setStatus] = useState<PlaybackStatus>('running');
  const [elapsedMs, setElapsedMs] = useState(0);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);

  const frameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedAtRef = useRef<number | null>(null);
  const totalPausedMsRef = useRef(0);
  const didCompleteRef = useRef(false);
  const currentSegmentIndexRef = useRef(0);
  const onCompleteRef = useRef(onComplete);
  const vibrationEnabledRef = useRef(vibrationEnabled);
  const soundEnabledRef = useRef(soundEnabled);

  const cumulativeDurationsMs = useMemo(() => {
    return session.segments.reduce<number[]>((durations, segment) => {
      const previousTotal = durations.at(-1) ?? 0;
      return [...durations, previousTotal + segment.durationSeconds * 1000];
    }, []);
  }, [session.segments]);

  const currentSegment = session.segments[currentSegmentIndex] ?? session.segments.at(-1)!;
  const segmentStartMs = currentSegmentIndex === 0 ? 0 : cumulativeDurationsMs[currentSegmentIndex - 1];
  const segmentEndMs = cumulativeDurationsMs[currentSegmentIndex];
  const segmentElapsedMs = Math.max(0, elapsedMs - segmentStartMs);
  const totalProgress = Math.min(1, elapsedMs / (session.totalDurationSeconds * 1000));
  const segmentProgress = Math.min(
    1,
    segmentElapsedMs / Math.max(1, segmentEndMs - segmentStartMs),
  );

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    vibrationEnabledRef.current = vibrationEnabled;
  }, [vibrationEnabled]);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  function playSegmentCue(segment: SessionSegment) {
    triggerSegmentCue(segment, {
      vibrationEnabled: vibrationEnabledRef.current,
      soundEnabled: soundEnabledRef.current,
    });
  }

  useEffect(() => {
    if (status !== 'running') {
      return;
    }

    const step = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
        currentSegmentIndexRef.current = 0;
        playSegmentCue(session.segments[0]);
      }

      const effectiveElapsed = timestamp - startTimeRef.current - totalPausedMsRef.current;
      if (effectiveElapsed >= session.totalDurationSeconds * 1000) {
        if (!didCompleteRef.current) {
          didCompleteRef.current = true;
          triggerCompletionCue({
            vibrationEnabled: vibrationEnabledRef.current,
            soundEnabled: soundEnabledRef.current,
          });
          setStatus('completed');
          setElapsedMs(session.totalDurationSeconds * 1000);
          onCompleteRef.current(session.totalDurationSeconds);
        }
        return;
      }

      const nextSegmentIndex = findSegmentIndex(cumulativeDurationsMs, effectiveElapsed);
      if (currentSegmentIndexRef.current !== nextSegmentIndex) {
        currentSegmentIndexRef.current = nextSegmentIndex;
        setCurrentSegmentIndex(nextSegmentIndex);
        playSegmentCue(session.segments[nextSegmentIndex]);
      }
      setElapsedMs(effectiveElapsed);
      frameRef.current = requestAnimationFrame(step);
    };

    frameRef.current = requestAnimationFrame(step);
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [status, cumulativeDurationsMs, session]);

  function pause() {
    if (status !== 'running') {
      return;
    }

    pausedAtRef.current = performance.now();
    setStatus('paused');
  }

  function resume() {
    if (status !== 'paused') {
      return;
    }

    if (pausedAtRef.current !== null) {
      totalPausedMsRef.current += performance.now() - pausedAtRef.current;
      pausedAtRef.current = null;
    }
    setStatus('running');
  }

  return {
    status,
    currentSegment,
    currentSegmentIndex,
    elapsedMs,
    segmentElapsedMs,
    totalProgress,
    segmentProgress,
    pause,
    resume,
  };
}
