import { PROFILE_BOUNDS } from './constants';
import { sanitizeExerciseProfile } from './profiles';
import { clampNumber, roundToStep } from '../lib/math';
import type {
  ExerciseProfile,
  LongExerciseProfile,
  MixedExerciseProfile,
  QuickExerciseProfile,
  RelaxExerciseProfile,
  SessionFeedback,
} from '../types/app';

function adjustQuickProfile(profile: QuickExerciseProfile, feedback: SessionFeedback) {
  if (feedback === 'just_right') {
    return profile;
  }

  if (feedback === 'too_easy') {
    if (profile.repsPerSet < PROFILE_BOUNDS.quick.repsPerSet.max) {
      return sanitizeExerciseProfile(
        { ...profile, repsPerSet: profile.repsPerSet + 2 },
        'quick',
      ) as QuickExerciseProfile;
    }

    if (profile.releaseSeconds > PROFILE_BOUNDS.quick.releaseSeconds.min) {
      return sanitizeExerciseProfile(
        {
          ...profile,
          releaseSeconds: roundToStep(profile.releaseSeconds - 0.5, 0.5),
        },
        'quick',
      ) as QuickExerciseProfile;
    }

    return sanitizeExerciseProfile({ ...profile, sets: profile.sets + 1 }, 'quick') as QuickExerciseProfile;
  }

  if (profile.repsPerSet > PROFILE_BOUNDS.quick.repsPerSet.min) {
    return sanitizeExerciseProfile({ ...profile, repsPerSet: profile.repsPerSet - 2 }, 'quick') as QuickExerciseProfile;
  }

  if (profile.releaseSeconds < PROFILE_BOUNDS.quick.releaseSeconds.max) {
    return sanitizeExerciseProfile(
      {
        ...profile,
        releaseSeconds: roundToStep(profile.releaseSeconds + 0.5, 0.5),
      },
      'quick',
    ) as QuickExerciseProfile;
  }

  return sanitizeExerciseProfile({ ...profile, sets: profile.sets - 1 }, 'quick') as QuickExerciseProfile;
}

function adjustLongProfile(profile: LongExerciseProfile, feedback: SessionFeedback) {
  if (feedback === 'just_right') {
    return profile;
  }

  if (feedback === 'too_easy') {
    if (profile.holdSeconds < PROFILE_BOUNDS.long.holdSeconds.max) {
      return sanitizeExerciseProfile({ ...profile, holdSeconds: profile.holdSeconds + 1 }, 'long') as LongExerciseProfile;
    }

    if (profile.repsPerSet < PROFILE_BOUNDS.long.repsPerSet.max) {
      return sanitizeExerciseProfile({ ...profile, repsPerSet: profile.repsPerSet + 1 }, 'long') as LongExerciseProfile;
    }

    return sanitizeExerciseProfile(
      {
        ...profile,
        restBetweenSetsSeconds: profile.restBetweenSetsSeconds - 1,
      },
      'long',
    ) as LongExerciseProfile;
  }

  if (profile.holdSeconds > PROFILE_BOUNDS.long.holdSeconds.min) {
    return sanitizeExerciseProfile({ ...profile, holdSeconds: profile.holdSeconds - 1 }, 'long') as LongExerciseProfile;
  }

  if (profile.repsPerSet > PROFILE_BOUNDS.long.repsPerSet.min) {
    return sanitizeExerciseProfile({ ...profile, repsPerSet: profile.repsPerSet - 1 }, 'long') as LongExerciseProfile;
  }

  return sanitizeExerciseProfile(
    {
      ...profile,
      restBetweenSetsSeconds: profile.restBetweenSetsSeconds + 1,
    },
    'long',
  ) as LongExerciseProfile;
}

function adjustRelaxProfile(profile: RelaxExerciseProfile, feedback: SessionFeedback) {
  if (feedback === 'just_right') {
    return profile;
  }

  if (feedback === 'too_easy') {
    if (profile.cyclesTarget < PROFILE_BOUNDS.relax.cyclesTarget.max) {
      return sanitizeExerciseProfile({ ...profile, cyclesTarget: profile.cyclesTarget + 1 }, 'relax') as RelaxExerciseProfile;
    }

    return sanitizeExerciseProfile({ ...profile, exhaleSeconds: profile.exhaleSeconds + 1 }, 'relax') as RelaxExerciseProfile;
  }

  if (profile.cyclesTarget > PROFILE_BOUNDS.relax.cyclesTarget.min) {
    return sanitizeExerciseProfile({ ...profile, cyclesTarget: profile.cyclesTarget - 1 }, 'relax') as RelaxExerciseProfile;
  }

  return sanitizeExerciseProfile({ ...profile, exhaleSeconds: profile.exhaleSeconds - 1 }, 'relax') as RelaxExerciseProfile;
}

function normalizeMixedWeights(profile: MixedExerciseProfile) {
  const fastWeight = clampNumber(
    profile.fastBlockWeight,
    PROFILE_BOUNDS.mixed.fastBlockWeight.min,
    PROFILE_BOUNDS.mixed.fastBlockWeight.max,
  );
  const normalizedFast = roundToStep(fastWeight, 0.05);
  const normalizedLong = roundToStep(1 - normalizedFast, 0.05);
  const total = normalizedFast + normalizedLong;

  return {
    ...profile,
    fastBlockWeight: roundToStep(normalizedFast / total, 0.05),
    longBlockWeight: roundToStep(normalizedLong / total, 0.05),
  };
}

function adjustMixedProfile(profile: MixedExerciseProfile, feedback: SessionFeedback) {
  if (feedback === 'just_right') {
    return profile;
  }

  const focus = profile.fastBlockWeight >= profile.longBlockWeight ? 'quick' : 'long';

  if (focus === 'quick') {
    const updatedQuick =
      feedback === 'too_easy'
        ? adjustQuickProfile(profile.quick, 'too_easy')
        : adjustQuickProfile(profile.quick, 'too_hard');

    const shifted = normalizeMixedWeights({
      ...profile,
      quick: updatedQuick,
      fastBlockWeight:
        feedback === 'too_easy' ? profile.fastBlockWeight + 0.05 : profile.fastBlockWeight - 0.05,
      longBlockWeight:
        feedback === 'too_easy' ? profile.longBlockWeight - 0.05 : profile.longBlockWeight + 0.05,
    });

    return sanitizeExerciseProfile(shifted, 'mixed') as MixedExerciseProfile;
  }

  const updatedLong =
    feedback === 'too_easy'
      ? adjustLongProfile(profile.long, 'too_easy')
      : adjustLongProfile(profile.long, 'too_hard');

  const shifted = normalizeMixedWeights({
    ...profile,
    long: updatedLong,
    fastBlockWeight:
      feedback === 'too_easy' ? profile.fastBlockWeight - 0.05 : profile.fastBlockWeight + 0.05,
    longBlockWeight:
      feedback === 'too_easy' ? profile.longBlockWeight + 0.05 : profile.longBlockWeight - 0.05,
  });

  return sanitizeExerciseProfile(shifted, 'mixed') as MixedExerciseProfile;
}

export function adaptExerciseProfile(profile: ExerciseProfile, feedback: SessionFeedback) {
  switch (profile.type) {
    case 'quick':
      return adjustQuickProfile(profile, feedback);
    case 'long':
      return adjustLongProfile(profile, feedback);
    case 'relax':
      return adjustRelaxProfile(profile, feedback);
    case 'mixed':
      return adjustMixedProfile(profile, feedback);
  }
}
