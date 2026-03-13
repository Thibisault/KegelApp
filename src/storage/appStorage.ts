import { APP_DATA_VERSION, APP_STORAGE_KEY, MAX_HISTORY_ITEMS } from '../domain/constants';
import { createDefaultAppState, getDefaultSettings } from '../domain/defaults';
import { sanitizeExerciseProfile, sanitizeExerciseProfiles } from '../domain/profiles';
import type {
  AppSettings,
  PersistedAppState,
  SessionHistoryEntry,
} from '../types/app';

function canUseLocalStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function sanitizeSettings(settings: Partial<AppSettings> | undefined): AppSettings {
  const defaults = getDefaultSettings();
  return {
    favoriteDurationMinutes:
      settings?.favoriteDurationMinutes === 2 ||
      settings?.favoriteDurationMinutes === 5 ||
      settings?.favoriteDurationMinutes === 10
        ? settings.favoriteDurationMinutes
        : defaults.favoriteDurationMinutes,
    vibrationEnabled:
      typeof settings?.vibrationEnabled === 'boolean'
        ? settings.vibrationEnabled
        : defaults.vibrationEnabled,
    soundEnabled:
      typeof settings?.soundEnabled === 'boolean'
        ? settings.soundEnabled
        : defaults.soundEnabled,
    reducedMotion:
      typeof settings?.reducedMotion === 'boolean' ? settings.reducedMotion : defaults.reducedMotion,
  };
}

function sanitizeHistoryEntry(entry: Partial<SessionHistoryEntry> | undefined): SessionHistoryEntry | null {
  if (!entry?.id || !entry.generatedSessionId || !entry.exerciseType || !entry.completedAt) {
    return null;
  }

  try {
    const completedAt = new Date(entry.completedAt).toISOString();
    return {
      id: entry.id,
      generatedSessionId: entry.generatedSessionId,
      exerciseType: entry.exerciseType,
      completedAt,
      targetDurationSeconds: Math.max(0, Math.round(entry.targetDurationSeconds ?? 0)),
      actualDurationSeconds: Math.max(0, Math.round(entry.actualDurationSeconds ?? 0)),
      feedback:
        entry.feedback === 'too_easy' ||
        entry.feedback === 'just_right' ||
        entry.feedback === 'too_hard'
          ? entry.feedback
          : 'just_right',
      summary: typeof entry.summary === 'string' ? entry.summary : '',
      profileSnapshot: sanitizeExerciseProfile(entry.profileSnapshot, entry.exerciseType),
    };
  } catch {
    return null;
  }
}

export function sanitizePersistedState(input: unknown): PersistedAppState {
  if (!input || typeof input !== 'object') {
    return createDefaultAppState();
  }

  const candidate = input as Partial<PersistedAppState>;

  return {
    version: APP_DATA_VERSION,
    settings: sanitizeSettings(candidate.settings),
    profiles: sanitizeExerciseProfiles(candidate.profiles),
    history: Array.isArray(candidate.history)
      ? candidate.history
          .map((entry) => sanitizeHistoryEntry(entry))
          .filter((entry): entry is SessionHistoryEntry => entry !== null)
          .slice(0, MAX_HISTORY_ITEMS)
      : [],
  };
}

export function loadAppState() {
  if (!canUseLocalStorage()) {
    return createDefaultAppState();
  }

  try {
    const raw = window.localStorage.getItem(APP_STORAGE_KEY);
    if (!raw) {
      return createDefaultAppState();
    }

    return sanitizePersistedState(JSON.parse(raw));
  } catch {
    return createDefaultAppState();
  }
}

export function saveAppState(state: PersistedAppState) {
  if (!canUseLocalStorage()) {
    return;
  }

  window.localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(state));
}

export function exportAppState(state: PersistedAppState) {
  return JSON.stringify(state, null, 2);
}

export function parseImportedState(rawText: string) {
  return sanitizePersistedState(JSON.parse(rawText));
}
