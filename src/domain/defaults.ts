import { APP_DATA_VERSION, getDefaultExerciseProfiles } from './constants';
import type { AppSettings, PersistedAppState } from '../types/app';

export function getDefaultSettings(): AppSettings {
  return {
    favoriteDurationMinutes: 5,
    vibrationEnabled: true,
    reducedMotion: false,
  };
}

export function createDefaultAppState(): PersistedAppState {
  return {
    version: APP_DATA_VERSION,
    settings: getDefaultSettings(),
    profiles: getDefaultExerciseProfiles(),
    history: [],
  };
}

