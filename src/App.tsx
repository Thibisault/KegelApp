import { useEffect, useMemo, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

import { DurationPicker } from './components/DurationPicker';
import { ExerciseCard } from './components/ExerciseCard';
import { FeedbackPanel } from './components/FeedbackPanel';
import { HistoryList } from './components/HistoryList';
import { InstallPromptCard } from './components/InstallPromptCard';
import { SessionPlayer } from './components/SessionPlayer';
import { SettingsPanel } from './components/SettingsPanel';
import { EXERCISE_DEFINITIONS, FEEDBACK_MESSAGES } from './domain/constants';
import {
  buildExercisePreview,
  computeAppStats,
  getLastSessionForExercise,
} from './domain/insights';
import { generateSession } from './domain/generation';
import { useAppState } from './hooks/useAppState';
import { usePwaInstall } from './hooks/usePwaInstall';
import type {
  ExerciseType,
  GeneratedSession,
  SessionDurationMinutes,
  SessionFeedback,
} from './types/app';

type ScreenState =
  | { kind: 'home' }
  | { kind: 'session'; session: GeneratedSession }
  | {
      kind: 'feedback';
      session: GeneratedSession;
      actualDurationSeconds: number;
      selectedFeedback?: SessionFeedback;
    };

function buildSessionForExercise(exerciseType: ExerciseType, durationMinutes: SessionDurationMinutes, state: ReturnType<typeof useAppState>['state']) {
  return generateSession(
    {
      exerciseType,
      durationMinutes,
      targetDurationSeconds: durationMinutes * 60,
      generatedAt: new Date().toISOString(),
    },
    state.profiles[exerciseType],
  );
}

export default function App() {
  const { state, actions } = useAppState();
  const [screen, setScreen] = useState<ScreenState>({ kind: 'home' });
  const [transientMessage, setTransientMessage] = useState('');

  const stats = useMemo(() => computeAppStats(state), [state]);
  const { canInstall, promptInstall } = usePwaInstall();
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  useEffect(() => {
    if (!transientMessage) {
      return;
    }

    const timeout = window.setTimeout(() => setTransientMessage(''), 3600);
    return () => window.clearTimeout(timeout);
  }, [transientMessage]);

  function handleStart(exerciseType: ExerciseType) {
    const duration = state.settings.favoriteDurationMinutes;
    const session = buildSessionForExercise(exerciseType, duration, state);
    setScreen({ kind: 'session', session });
  }

  function handleSessionComplete(session: GeneratedSession, actualDurationSeconds: number) {
    setScreen({
      kind: 'feedback',
      session,
      actualDurationSeconds,
    });
  }

  function handleFeedback(feedback: SessionFeedback) {
    if (screen.kind !== 'feedback' || screen.selectedFeedback) {
      return;
    }

    actions.completeSession(screen.session, screen.actualDurationSeconds, feedback);
    setTransientMessage(FEEDBACK_MESSAGES[feedback]);
    setScreen({
      ...screen,
      selectedFeedback: feedback,
    });
  }

  function handleQuitSession() {
    const confirmed = window.confirm('Quitter la séance en cours ?');
    if (confirmed) {
      setScreen({ kind: 'home' });
    }
  }

  if (screen.kind === 'session') {
    return (
      <SessionPlayer
        session={screen.session}
        vibrationEnabled={state.settings.vibrationEnabled}
        reducedMotion={state.settings.reducedMotion}
        onComplete={(actualDurationSeconds) =>
          handleSessionComplete(screen.session, actualDurationSeconds)
        }
        onQuit={handleQuitSession}
      />
    );
  }

  if (screen.kind === 'feedback') {
    return (
      <FeedbackPanel
        session={screen.session}
        actualDurationSeconds={screen.actualDurationSeconds}
        selectedFeedback={screen.selectedFeedback}
        onSelect={handleFeedback}
        onBackHome={() => setScreen({ kind: 'home' })}
      />
    );
  }

  return (
    <main className="app-shell">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 sm:gap-5">
        {needRefresh || offlineReady ? (
          <section className="soft-card rounded-[22px] border border-white/70 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-ink">
                  {needRefresh
                    ? 'Une nouvelle version est prête.'
                    : 'L’application est prête pour un usage hors ligne.'}
                </p>
                <p className="mt-1 text-sm text-ink/62">
                  {needRefresh
                    ? 'Recharge pour appliquer les dernières améliorations.'
                    : 'Tu peux maintenant l’utiliser sans connexion après installation.'}
                </p>
              </div>
              <div className="flex gap-3">
                {needRefresh ? (
                  <button
                    type="button"
                    onClick={() => void updateServiceWorker(true)}
                    className="min-h-12 rounded-full bg-ink px-4 text-sm font-semibold text-white"
                  >
                    Recharger
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    setNeedRefresh(false);
                    setOfflineReady(false);
                  }}
                  className="min-h-12 rounded-full bg-white px-4 text-sm font-semibold text-ink"
                >
                  Fermer
                </button>
              </div>
            </div>
          </section>
        ) : null}

        {transientMessage ? (
          <section className="soft-card rounded-[22px] border border-sage-100/70 bg-sage-500/6 p-4 text-sm text-ink/72">
            {transientMessage}
          </section>
        ) : null}

        <section className="soft-card relative overflow-hidden rounded-[34px] border border-white/70 px-5 py-6 sm:px-7 sm:py-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.85),transparent_36%)]" />
          <div className="relative z-10 grid gap-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/45">
                Routine personnelle
              </p>
              <h1 className="mt-3 max-w-xl font-display text-[3rem] leading-[0.96] text-ink sm:text-[4rem]">
                Kegel App
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-ink/70">
                Un coach minimaliste pour choisir un exercice, lancer une durée courte et suivre une séance claire.
                Pensé d’abord pour le téléphone, rapide à ouvrir, fluide à utiliser et discret.
              </p>

              <div className="mt-5 rounded-[24px] bg-white/74 p-4 text-sm leading-6 text-ink/62">
                Application personnelle de routine et bien-être, pas un dispositif médical.
                En cas de douleur ou gêne inhabituelle, interromps la séance.
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-2">
              <div className="rounded-[26px] bg-white/76 p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-ink/45">Séances</p>
                <p className="mt-2 text-3xl font-semibold text-ink">{stats.totalSessions}</p>
              </div>
              <div className="rounded-[26px] bg-white/76 p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-ink/45">Minutes</p>
                <p className="mt-2 text-3xl font-semibold text-ink">{stats.totalMinutes}</p>
              </div>
              <div className="rounded-[26px] bg-white/76 p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-ink/45">Streak</p>
                <p className="mt-2 text-3xl font-semibold text-ink">{stats.streakDays} j</p>
              </div>
              <div className="rounded-[26px] bg-white/76 p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-ink/45">7 jours</p>
                <p className="mt-2 text-3xl font-semibold text-ink">{stats.lastSevenDays}</p>
              </div>
            </div>
          </div>
        </section>

        {canInstall ? <InstallPromptCard onInstall={promptInstall} /> : null}

        <section className="soft-card rounded-[28px] border border-white/70 p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">Durée de séance</p>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-2xl text-ink">Choisis un créneau simple</h2>
              <p className="mt-1 text-sm text-ink/62">
                La durée reste sous ton contrôle. L’application ajuste seulement la densité interne.
              </p>
            </div>
            <DurationPicker
              value={state.settings.favoriteDurationMinutes}
              onChange={(duration) => actions.setFavoriteDuration(duration)}
            />
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          {EXERCISE_DEFINITIONS.map((exercise) => (
            <ExerciseCard
              key={exercise.type}
              exercise={exercise}
              duration={state.settings.favoriteDurationMinutes}
              preview={buildExercisePreview(state.profiles[exercise.type])}
              lastEntry={getLastSessionForExercise(state.history, exercise.type)}
              onStart={() => handleStart(exercise.type)}
            />
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <HistoryList history={state.history} />
          <SettingsPanel
            state={state}
            onToggleVibration={(enabled) => actions.updateSetting('vibrationEnabled', enabled)}
            onToggleReducedMotion={(enabled) => actions.updateSetting('reducedMotion', enabled)}
            onResetExercise={(exerciseType) => actions.resetExercise(exerciseType)}
            onResetAll={() => actions.resetAll()}
            onExport={() => actions.exportData()}
            onImport={(rawText) => actions.importData(rawText)}
          />
        </section>
      </div>
    </main>
  );
}
