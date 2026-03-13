import { EXERCISE_DEFINITIONS, SESSION_REFERENCE_SECONDS } from './constants';
import { formatFeedbackLabel } from '../lib/format';
import { uniqueDateKey } from '../lib/math';
import type {
  AppStats,
  ExerciseProfile,
  ExerciseType,
  PersistedAppState,
  SessionHistoryEntry,
} from '../types/app';

export function getExerciseDefinition(exerciseType: ExerciseType) {
  return EXERCISE_DEFINITIONS.find((exercise) => exercise.type === exerciseType)!;
}

export function getLastSessionForExercise(history: SessionHistoryEntry[], exerciseType: ExerciseType) {
  return history.find((entry) => entry.exerciseType === exerciseType);
}

export function buildExercisePreview(profile: ExerciseProfile) {
  switch (profile.type) {
    case 'quick':
      return `${profile.contractionSeconds}s / ${profile.releaseSeconds}s · ${profile.sets} séries courtes`;
    case 'long':
      return `Maintien ${profile.holdSeconds}s · relâche ${profile.releaseSeconds}s`;
    case 'relax':
      return `Souffle ${profile.inhaleSeconds}/${profile.exhaleSeconds} · ${profile.cyclesTarget} cycles de base`;
    case 'mixed':
      return `Bloc rapide ${Math.round(profile.fastBlockWeight * 100)}% · bloc long ${Math.round(
        profile.longBlockWeight * 100,
      )}%`;
  }
}

export function buildHistorySummary(entry: SessionHistoryEntry) {
  return `${entry.summary} · ${formatFeedbackLabel(entry.feedback).toLowerCase()}`;
}

export function computeAppStats(state: PersistedAppState): AppStats {
  const totalSessions = state.history.length;
  const totalMinutes = Math.round(
    state.history.reduce((total, entry) => total + entry.actualDurationSeconds, 0) / 60,
  );

  const recentEntries = state.history.filter((entry) => {
    const diff = Date.now() - new Date(entry.completedAt).getTime();
    return diff <= 7 * 24 * 60 * 60 * 1000;
  });

  const uniqueDays = new Set(state.history.map((entry) => uniqueDateKey(entry.completedAt)));
  const sortedDays = [...uniqueDays].sort().reverse();
  let streakDays = 0;
  const current = new Date();

  while (true) {
    const dateKey = uniqueDateKey(current);
    if (sortedDays.includes(dateKey)) {
      streakDays += 1;
      current.setDate(current.getDate() - 1);
      continue;
    }

    if (streakDays === 0) {
      current.setDate(current.getDate() - 1);
      const yesterdayKey = uniqueDateKey(current);
      if (sortedDays.includes(yesterdayKey)) {
        streakDays += 1;
        current.setDate(current.getDate() - 1);
        continue;
      }
    }
    break;
  }

  return {
    totalSessions,
    totalMinutes,
    streakDays,
    lastSevenDays: recentEntries.length,
  };
}

export function buildIntensityHint(profile: ExerciseProfile, targetDurationSeconds: number) {
  const durationScale = targetDurationSeconds / SESSION_REFERENCE_SECONDS;

  switch (profile.type) {
    case 'quick':
      return durationScale > 2.5 ? 'cadence soutenue mais respirable' : 'rythme net et compact';
    case 'long':
      return durationScale > 2.5 ? 'endurance posée avec récupérations' : 'maintien calme et stable';
    case 'relax':
      return 'respiration ample et relâchement guidé';
    case 'mixed':
      return 'activation puis détente tonique';
  }
}
