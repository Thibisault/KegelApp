import { startTransition, useEffect, useMemo, useState } from 'react';

import { adaptExerciseProfile } from '../domain/adaptation';
import { MAX_HISTORY_ITEMS } from '../domain/constants';
import { createDefaultAppState } from '../domain/defaults';
import {
  exportAppState,
  loadAppState,
  parseImportedState,
  saveAppState,
} from '../storage/appStorage';
import type {
  ExerciseType,
  GeneratedSession,
  PersistedAppState,
  SessionDurationMinutes,
  SessionFeedback,
  SessionHistoryEntry,
} from '../types/app';

export function useAppState() {
  const [state, setState] = useState<PersistedAppState>(() => loadAppState());

  useEffect(() => {
    saveAppState(state);
  }, [state]);

  const actions = useMemo(
    () => ({
      setFavoriteDuration(durationMinutes: SessionDurationMinutes) {
        setState((current) => ({
          ...current,
          settings: {
            ...current.settings,
            favoriteDurationMinutes: durationMinutes,
          },
        }));
      },
      updateSetting<Key extends keyof PersistedAppState['settings']>(
        key: Key,
        value: PersistedAppState['settings'][Key],
      ) {
        setState((current) => ({
          ...current,
          settings: {
            ...current.settings,
            [key]: value,
          },
        }));
      },
      completeSession(session: GeneratedSession, actualDurationSeconds: number, feedback: SessionFeedback) {
        startTransition(() => {
          setState((current) => {
            const currentProfile = current.profiles[session.config.exerciseType];
            const historyEntry: SessionHistoryEntry = {
              id: crypto.randomUUID(),
              generatedSessionId: session.id,
              exerciseType: session.config.exerciseType,
              completedAt: new Date().toISOString(),
              targetDurationSeconds: session.config.targetDurationSeconds,
              actualDurationSeconds,
              feedback,
              summary: session.summary.headline,
              profileSnapshot: currentProfile,
            };
            const nextProfile = adaptExerciseProfile(currentProfile, feedback);

            return {
              ...current,
              profiles: {
                ...current.profiles,
                [session.config.exerciseType]: nextProfile,
              },
              history: [historyEntry, ...current.history].slice(0, MAX_HISTORY_ITEMS),
            };
          });
        });
      },
      resetExercise(exerciseType: ExerciseType) {
        setState((current) => ({
          ...current,
          profiles: {
            ...current.profiles,
            [exerciseType]: createDefaultAppState().profiles[exerciseType],
          },
        }));
      },
      resetAll() {
        setState(createDefaultAppState());
      },
      exportData() {
        return exportAppState(state);
      },
      importData(rawText: string) {
        const imported = parseImportedState(rawText);
        setState(imported);
      },
    }),
    [state],
  );

  return {
    state,
    actions,
  };
}
