import type {
  ExerciseDefinition,
  ExerciseProfiles,
  SessionDurationMinutes,
  SessionFeedback,
} from '../types/app';

export const APP_STORAGE_KEY = 'kegel-app-state-v1';
export const APP_DATA_VERSION = 1;
export const MAX_HISTORY_ITEMS = 90;
export const SESSION_REFERENCE_SECONDS = 120;
export const AVAILABLE_DURATIONS: SessionDurationMinutes[] = [2, 5, 10];

export const EXERCISE_DEFINITIONS: ExerciseDefinition[] = [
  {
    type: 'quick',
    name: 'Rapides',
    shortDescription: 'Courtes impulsions pour la réactivité.',
    longDescription:
      'Des contractions brèves et nettes, avec relâchement court pour travailler la réponse musculaire.',
    toneKey: 'sage',
  },
  {
    type: 'long',
    name: 'Longues',
    shortDescription: 'Maintiens plus longs pour l’endurance.',
    longDescription:
      'Un rythme posé avec maintien plus long, récupération ample et repos entre séries.',
    toneKey: 'sky',
  },
  {
    type: 'relax',
    name: 'Relaxation',
    shortDescription: 'Respiration et détente guidées.',
    longDescription:
      'Un cycle inspirer-expirer sobre pour éviter de ne faire que du serrage et relâcher en douceur.',
    toneKey: 'sand',
  },
  {
    type: 'mixed',
    name: 'Mixte',
    shortDescription: 'Un bloc rapide puis un bloc long.',
    longDescription:
      'Une séance simple et équilibrée qui alterne activation courte puis maintien plus calme.',
    toneKey: 'coral',
  },
];

export const FEEDBACK_MESSAGES: Record<SessionFeedback, string> = {
  too_easy: 'Prochaine séance un peu plus dense sur cet exercice.',
  just_right: 'Le profil reste inchangé pour garder ce bon rythme.',
  too_hard: 'Prochaine séance allégée pour retrouver une sensation confortable.',
};

export const PROFILE_BOUNDS = {
  quick: {
    contractionSeconds: { min: 1, max: 2 },
    releaseSeconds: { min: 1.5, max: 4 },
    repsPerSet: { min: 6, max: 24 },
    sets: { min: 2, max: 7 },
    restBetweenSetsSeconds: { min: 10, max: 35 },
  },
  long: {
    holdSeconds: { min: 3, max: 10 },
    releaseSeconds: { min: 4, max: 9 },
    repsPerSet: { min: 4, max: 12 },
    sets: { min: 2, max: 6 },
    restBetweenSetsSeconds: { min: 15, max: 40 },
  },
  relax: {
    inhaleSeconds: { min: 3, max: 6 },
    exhaleSeconds: { min: 4, max: 10 },
    cyclesTarget: { min: 8, max: 18 },
    totalDurationPreference: { min: 120, max: 600 },
  },
  mixed: {
    fastBlockWeight: { min: 0.35, max: 0.65 },
    longBlockWeight: { min: 0.35, max: 0.65 },
    restBetweenBlocksSeconds: { min: 8, max: 24 },
  },
} as const satisfies Record<string, unknown>;

export function getDefaultExerciseProfiles(): ExerciseProfiles {
  return {
    quick: {
      type: 'quick',
      contractionSeconds: 1,
      releaseSeconds: 2,
      repsPerSet: 10,
      sets: 3,
      restBetweenSetsSeconds: 20,
    },
    long: {
      type: 'long',
      holdSeconds: 4,
      releaseSeconds: 5,
      repsPerSet: 6,
      sets: 2,
      restBetweenSetsSeconds: 25,
    },
    relax: {
      type: 'relax',
      inhaleSeconds: 4,
      exhaleSeconds: 6,
      cyclesTarget: 12,
      totalDurationPreference: 180,
    },
    mixed: {
      type: 'mixed',
      fastBlockWeight: 0.55,
      longBlockWeight: 0.45,
      restBetweenBlocksSeconds: 12,
      quick: {
        type: 'quick',
        contractionSeconds: 1,
        releaseSeconds: 2.5,
        repsPerSet: 8,
        sets: 2,
        restBetweenSetsSeconds: 18,
      },
      long: {
        type: 'long',
        holdSeconds: 4,
        releaseSeconds: 5,
        repsPerSet: 4,
        sets: 2,
        restBetweenSetsSeconds: 20,
      },
    },
  };
}

