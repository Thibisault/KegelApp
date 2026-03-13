import { PROFILE_BOUNDS } from './constants';
import { getDefaultExerciseProfiles } from './constants';
import { clampInteger, clampNumber, roundToStep } from '../lib/math';
import type {
  ExerciseProfile,
  ExerciseProfiles,
  LongExerciseProfile,
  MixedExerciseProfile,
  QuickExerciseProfile,
  RelaxExerciseProfile,
} from '../types/app';

function sanitizeQuickProfile(profile: Partial<QuickExerciseProfile> | undefined): QuickExerciseProfile {
  const defaults = getDefaultExerciseProfiles().quick;
  return {
    type: 'quick',
    contractionSeconds: clampInteger(
      profile?.contractionSeconds ?? defaults.contractionSeconds,
      PROFILE_BOUNDS.quick.contractionSeconds.min,
      PROFILE_BOUNDS.quick.contractionSeconds.max,
    ),
    releaseSeconds: roundToStep(
      clampNumber(
        profile?.releaseSeconds ?? defaults.releaseSeconds,
        PROFILE_BOUNDS.quick.releaseSeconds.min,
        PROFILE_BOUNDS.quick.releaseSeconds.max,
      ),
      0.5,
    ),
    repsPerSet: clampInteger(
      profile?.repsPerSet ?? defaults.repsPerSet,
      PROFILE_BOUNDS.quick.repsPerSet.min,
      PROFILE_BOUNDS.quick.repsPerSet.max,
    ),
    sets: clampInteger(
      profile?.sets ?? defaults.sets,
      PROFILE_BOUNDS.quick.sets.min,
      PROFILE_BOUNDS.quick.sets.max,
    ),
    restBetweenSetsSeconds: clampInteger(
      profile?.restBetweenSetsSeconds ?? defaults.restBetweenSetsSeconds,
      PROFILE_BOUNDS.quick.restBetweenSetsSeconds.min,
      PROFILE_BOUNDS.quick.restBetweenSetsSeconds.max,
    ),
  };
}

function sanitizeLongProfile(profile: Partial<LongExerciseProfile> | undefined): LongExerciseProfile {
  const defaults = getDefaultExerciseProfiles().long;
  return {
    type: 'long',
    holdSeconds: clampInteger(
      profile?.holdSeconds ?? defaults.holdSeconds,
      PROFILE_BOUNDS.long.holdSeconds.min,
      PROFILE_BOUNDS.long.holdSeconds.max,
    ),
    releaseSeconds: clampInteger(
      profile?.releaseSeconds ?? defaults.releaseSeconds,
      PROFILE_BOUNDS.long.releaseSeconds.min,
      PROFILE_BOUNDS.long.releaseSeconds.max,
    ),
    repsPerSet: clampInteger(
      profile?.repsPerSet ?? defaults.repsPerSet,
      PROFILE_BOUNDS.long.repsPerSet.min,
      PROFILE_BOUNDS.long.repsPerSet.max,
    ),
    sets: clampInteger(
      profile?.sets ?? defaults.sets,
      PROFILE_BOUNDS.long.sets.min,
      PROFILE_BOUNDS.long.sets.max,
    ),
    restBetweenSetsSeconds: clampInteger(
      profile?.restBetweenSetsSeconds ?? defaults.restBetweenSetsSeconds,
      PROFILE_BOUNDS.long.restBetweenSetsSeconds.min,
      PROFILE_BOUNDS.long.restBetweenSetsSeconds.max,
    ),
  };
}

function sanitizeRelaxProfile(profile: Partial<RelaxExerciseProfile> | undefined): RelaxExerciseProfile {
  const defaults = getDefaultExerciseProfiles().relax;
  return {
    type: 'relax',
    inhaleSeconds: clampInteger(
      profile?.inhaleSeconds ?? defaults.inhaleSeconds,
      PROFILE_BOUNDS.relax.inhaleSeconds.min,
      PROFILE_BOUNDS.relax.inhaleSeconds.max,
    ),
    exhaleSeconds: clampInteger(
      profile?.exhaleSeconds ?? defaults.exhaleSeconds,
      PROFILE_BOUNDS.relax.exhaleSeconds.min,
      PROFILE_BOUNDS.relax.exhaleSeconds.max,
    ),
    cyclesTarget: clampInteger(
      profile?.cyclesTarget ?? defaults.cyclesTarget,
      PROFILE_BOUNDS.relax.cyclesTarget.min,
      PROFILE_BOUNDS.relax.cyclesTarget.max,
    ),
    totalDurationPreference: clampInteger(
      profile?.totalDurationPreference ?? defaults.totalDurationPreference,
      PROFILE_BOUNDS.relax.totalDurationPreference.min,
      PROFILE_BOUNDS.relax.totalDurationPreference.max,
    ),
  };
}

function sanitizeMixedProfile(profile: Partial<MixedExerciseProfile> | undefined): MixedExerciseProfile {
  const defaults = getDefaultExerciseProfiles().mixed;
  const fastWeight = clampNumber(
    profile?.fastBlockWeight ?? defaults.fastBlockWeight,
    PROFILE_BOUNDS.mixed.fastBlockWeight.min,
    PROFILE_BOUNDS.mixed.fastBlockWeight.max,
  );
  const longWeight = clampNumber(
    profile?.longBlockWeight ?? defaults.longBlockWeight,
    PROFILE_BOUNDS.mixed.longBlockWeight.min,
    PROFILE_BOUNDS.mixed.longBlockWeight.max,
  );
  const weightTotal = fastWeight + longWeight;

  return {
    type: 'mixed',
    fastBlockWeight: roundToStep(fastWeight / weightTotal, 0.05),
    longBlockWeight: roundToStep(longWeight / weightTotal, 0.05),
    restBetweenBlocksSeconds: clampInteger(
      profile?.restBetweenBlocksSeconds ?? defaults.restBetweenBlocksSeconds,
      PROFILE_BOUNDS.mixed.restBetweenBlocksSeconds.min,
      PROFILE_BOUNDS.mixed.restBetweenBlocksSeconds.max,
    ),
    quick: sanitizeQuickProfile(profile?.quick),
    long: sanitizeLongProfile(profile?.long),
  };
}

export function sanitizeExerciseProfile(profile: Partial<ExerciseProfile> | undefined, type: ExerciseProfile['type']) {
  switch (type) {
    case 'quick':
      return sanitizeQuickProfile(profile as Partial<QuickExerciseProfile> | undefined);
    case 'long':
      return sanitizeLongProfile(profile as Partial<LongExerciseProfile> | undefined);
    case 'relax':
      return sanitizeRelaxProfile(profile as Partial<RelaxExerciseProfile> | undefined);
    case 'mixed':
      return sanitizeMixedProfile(profile as Partial<MixedExerciseProfile> | undefined);
  }
}

export function sanitizeExerciseProfiles(profiles: Partial<ExerciseProfiles> | undefined): ExerciseProfiles {
  return {
    quick: sanitizeQuickProfile(profiles?.quick),
    long: sanitizeLongProfile(profiles?.long),
    relax: sanitizeRelaxProfile(profiles?.relax),
    mixed: sanitizeMixedProfile(profiles?.mixed),
  };
}

