import type { CSSProperties } from 'react';

import { formatClock, formatSegmentMeta } from '../lib/format';
import { segmentAccentByTone } from '../lib/theme';
import { useSessionPlayback } from '../hooks/useSessionPlayback';
import type { GeneratedSession } from '../types/app';

interface SessionPlayerProps {
  session: GeneratedSession;
  vibrationEnabled: boolean;
  soundEnabled: boolean;
  reducedMotion: boolean;
  onComplete: (actualDurationSeconds: number) => void;
  onQuit: () => void;
}

export function SessionPlayer({
  session,
  vibrationEnabled,
  soundEnabled,
  reducedMotion,
  onComplete,
  onQuit,
}: SessionPlayerProps) {
  const {
    status,
    currentSegment,
    elapsedMs,
    totalProgress,
    segmentProgress,
    pause,
    resume,
  } = useSessionPlayback({
    session,
    vibrationEnabled,
    soundEnabled,
    onComplete,
  });

  const remainingSeconds = Math.max(0, session.totalDurationSeconds - Math.floor(elapsedMs / 1000));
  const accent = segmentAccentByTone[currentSegment.tone];
  const progressStyle = {
    '--ring-progress': totalProgress,
    '--ring-accent': accent,
  } as CSSProperties;

  return (
    <main className="app-shell">
      <div className="mx-auto flex min-h-[calc(100dvh-2.4rem)] w-full max-w-3xl flex-col gap-4">
        <header className="soft-card flex items-center justify-between rounded-[24px] border border-white/60 px-4 py-3">
          <button
            type="button"
            onClick={onQuit}
            className="min-h-12 rounded-full bg-white/72 px-4 text-sm font-semibold text-ink"
          >
            Quitter
          </button>
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.14em] text-ink/45">Séance en cours</p>
            <h1 className="font-display text-2xl text-ink">{session.exerciseName}</h1>
          </div>
          <button
            type="button"
            onClick={status === 'paused' ? resume : pause}
            className="min-h-12 rounded-full bg-ink px-4 text-sm font-semibold text-white"
          >
            {status === 'paused' ? 'Reprendre' : 'Pause'}
          </button>
        </header>

        <section className="soft-card relative flex flex-1 flex-col justify-between overflow-hidden rounded-[36px] border border-white/70 px-5 py-6 sm:px-7 sm:py-7">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.75),transparent_46%)]" />

          <div className="relative z-10 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-ink/45">Temps restant</p>
              <p className="mt-1 text-3xl font-semibold text-ink">{formatClock(remainingSeconds)}</p>
            </div>
            <div className="rounded-full bg-white/72 px-4 py-2 text-sm text-ink/68">
              {formatSegmentMeta(currentSegment) || 'Rythme guidé'}
            </div>
          </div>

          <div className="relative z-10 flex flex-1 items-center justify-center py-6">
            <div
              className={[
                'session-ring flex aspect-square w-full max-w-[20rem] items-center justify-center rounded-full p-5',
                reducedMotion || status === 'paused' ? '' : 'pulse-soft',
              ].join(' ')}
              style={progressStyle}
            >
              <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white/88 px-6 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/45">
                  {currentSegment.blockLabel ?? 'Action actuelle'}
                </p>
                <h2 className="mt-4 font-display text-[2.6rem] leading-none text-ink sm:text-[3rem]">
                  {currentSegment.label}
                </h2>
                <p className="mt-3 text-base text-ink/68">{currentSegment.cue}</p>
                <p className="mt-6 text-sm font-medium text-ink/56">
                  {formatClock(Math.ceil((currentSegment.durationSeconds * (1 - segmentProgress))))}
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 space-y-4">
            <div className="h-3 overflow-hidden rounded-full bg-ink/8">
              <div
                className="h-full rounded-full transition-[width] duration-200"
                style={{ width: `${Math.round(totalProgress * 100)}%`, backgroundColor: accent }}
              />
            </div>
            <div className="flex items-center justify-between gap-4 text-sm text-ink/62">
              <span>{session.summary.headline}</span>
              <span>{session.intensityHint}</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
