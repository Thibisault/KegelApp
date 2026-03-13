import { buildIntensityHint, getExerciseDefinition } from './insights';
import { SESSION_REFERENCE_SECONDS } from './constants';
import { clampInteger, sumNumbers } from '../lib/math';
import type {
  ExerciseProfile,
  GeneratedSession,
  LongExerciseProfile,
  MixedExerciseProfile,
  QuickExerciseProfile,
  RelaxExerciseProfile,
  SessionConfig,
  SessionSegment,
  SegmentTone,
} from '../types/app';

interface BlockSummary {
  totalSets?: number;
  totalReps?: number;
  totalCycles?: number;
}

interface BlockBuild {
  segments: SessionSegment[];
  summary: BlockSummary;
}

function scaleForDuration(targetDurationSeconds: number, exponent: number) {
  return Math.pow(targetDurationSeconds / SESSION_REFERENCE_SECONDS, exponent);
}

function createSegment(
  id: string,
  label: string,
  cue: string,
  durationSeconds: number,
  tone: SegmentTone,
  kind: SessionSegment['kind'],
  extras?: Partial<SessionSegment>,
): SessionSegment {
  return {
    id,
    label,
    cue,
    durationSeconds,
    tone,
    kind,
    ...extras,
  };
}

function distributeCounts(total: number, bucketCount: number, minEach: number, maxEach: number) {
  if (bucketCount <= 0) {
    return [];
  }

  const counts = Array.from({ length: bucketCount }, () => minEach);
  let remaining = Math.max(0, total - minEach * bucketCount);
  let index = 0;

  while (remaining > 0) {
    if (counts[index] < maxEach) {
      counts[index] += 1;
      remaining -= 1;
    }

    index = (index + 1) % bucketCount;
  }

  return counts;
}

function buildFillSegment(remainingSeconds: number, label: string, cue: string, id: string) {
  if (remainingSeconds <= 0) {
    return [];
  }

  return [createSegment(id, label, cue, remainingSeconds, 'calm', 'rest')];
}

function buildQuickBlock(
  targetDurationSeconds: number,
  profile: QuickExerciseProfile,
  prefix: string,
  blockLabel?: string,
): BlockBuild {
  const repDuration = profile.contractionSeconds + profile.releaseSeconds;
  const scaledSets = clampInteger(
    profile.sets * scaleForDuration(targetDurationSeconds, 0.45),
    1,
    8,
  );
  const preferredTotalReps = clampInteger(
    profile.repsPerSet * profile.sets * scaleForDuration(targetDurationSeconds, 0.98),
    6,
    200,
  );
  let setCount = scaledSets;

  while (setCount > 1) {
    const minimalTime = setCount * 6 * repDuration + (setCount - 1) * profile.restBetweenSetsSeconds;
    if (minimalTime <= targetDurationSeconds) {
      break;
    }
    setCount -= 1;
  }

  const maxTotalReps = Math.max(
    6,
    Math.floor((targetDurationSeconds - (setCount - 1) * profile.restBetweenSetsSeconds) / repDuration),
  );
  const totalReps = clampInteger(preferredTotalReps, setCount * 6, maxTotalReps);
  const repsBySet = distributeCounts(totalReps, setCount, 6, 24);
  const segments: SessionSegment[] = [];
  let segmentIndex = 0;

  repsBySet.forEach((reps, setIndex) => {
    for (let repIndex = 0; repIndex < reps; repIndex += 1) {
      const commonMeta = {
        blockLabel,
        setIndex: setIndex + 1,
        setCount,
        repIndex: repIndex + 1,
        repCount: reps,
      };

      segments.push(
        createSegment(
          `${prefix}-contract-${segmentIndex++}`,
          'Contracte',
          repIndex === reps - 1 ? 'Dernière répétition' : 'Activation courte',
          profile.contractionSeconds,
          'activate',
          'contract',
          commonMeta,
        ),
      );
      segments.push(
        createSegment(
          `${prefix}-release-${segmentIndex++}`,
          'Relâche',
          'Laisse redescendre',
          profile.releaseSeconds,
          'release',
          'release',
          commonMeta,
        ),
      );
    }

    if (setIndex < repsBySet.length - 1) {
      segments.push(
        createSegment(
          `${prefix}-rest-${segmentIndex++}`,
          'Repos',
          'Série suivante',
          profile.restBetweenSetsSeconds,
          'neutral',
          'rest',
          {
            blockLabel,
            setIndex: setIndex + 1,
            setCount,
          },
        ),
      );
    }
  });

  const usedSeconds = sumNumbers(segments.map((segment) => segment.durationSeconds));
  segments.push(
    ...buildFillSegment(
      targetDurationSeconds - usedSeconds,
      'Respire calmement',
      'Reste souple',
      `${prefix}-cooldown`,
    ),
  );

  return {
    segments,
    summary: {
      totalSets: setCount,
      totalReps,
    },
  };
}

function buildLongBlock(
  targetDurationSeconds: number,
  profile: LongExerciseProfile,
  prefix: string,
  blockLabel?: string,
): BlockBuild {
  const repDuration = profile.holdSeconds + profile.releaseSeconds;
  const scaledSets = clampInteger(
    profile.sets * scaleForDuration(targetDurationSeconds, 0.42),
    1,
    7,
  );
  const preferredTotalReps = clampInteger(
    profile.repsPerSet * profile.sets * scaleForDuration(targetDurationSeconds, 0.85),
    4,
    120,
  );
  let setCount = scaledSets;

  while (setCount > 1) {
    const minimalTime = setCount * 4 * repDuration + (setCount - 1) * profile.restBetweenSetsSeconds;
    if (minimalTime <= targetDurationSeconds) {
      break;
    }
    setCount -= 1;
  }

  const maxTotalReps = Math.max(
    4,
    Math.floor((targetDurationSeconds - (setCount - 1) * profile.restBetweenSetsSeconds) / repDuration),
  );
  const totalReps = clampInteger(preferredTotalReps, setCount * 4, maxTotalReps);
  const repsBySet = distributeCounts(totalReps, setCount, 4, 12);
  const segments: SessionSegment[] = [];
  let segmentIndex = 0;

  repsBySet.forEach((reps, setIndex) => {
    for (let repIndex = 0; repIndex < reps; repIndex += 1) {
      const commonMeta = {
        blockLabel,
        setIndex: setIndex + 1,
        setCount,
        repIndex: repIndex + 1,
        repCount: reps,
      };

      segments.push(
        createSegment(
          `${prefix}-hold-${segmentIndex++}`,
          'Maintiens',
          repIndex === reps - 1 ? 'Tiens encore un instant' : 'Reste stable',
          profile.holdSeconds,
          'activate',
          'hold',
          commonMeta,
        ),
      );
      segments.push(
        createSegment(
          `${prefix}-release-${segmentIndex++}`,
          'Relâche',
          'Relâche complètement',
          profile.releaseSeconds,
          'release',
          'release',
          commonMeta,
        ),
      );
    }

    if (setIndex < repsBySet.length - 1) {
      segments.push(
        createSegment(
          `${prefix}-rest-${segmentIndex++}`,
          'Repos',
          'Série suivante',
          profile.restBetweenSetsSeconds,
          'neutral',
          'rest',
          {
            blockLabel,
            setIndex: setIndex + 1,
            setCount,
          },
        ),
      );
    }
  });

  const usedSeconds = sumNumbers(segments.map((segment) => segment.durationSeconds));
  segments.push(
    ...buildFillSegment(
      targetDurationSeconds - usedSeconds,
      'Respire calmement',
      'Récupération douce',
      `${prefix}-cooldown`,
    ),
  );

  return {
    segments,
    summary: {
      totalSets: setCount,
      totalReps,
    },
  };
}

function buildRelaxBlock(
  targetDurationSeconds: number,
  profile: RelaxExerciseProfile,
  prefix: string,
  blockLabel?: string,
): BlockBuild {
  const cycleDuration = profile.inhaleSeconds + profile.exhaleSeconds;
  const preferredCycles = clampInteger(
    profile.cyclesTarget * scaleForDuration(targetDurationSeconds, 0.98),
    4,
    120,
  );
  const maxCycles = Math.max(4, Math.floor(targetDurationSeconds / cycleDuration));
  const cycles = clampInteger(preferredCycles, 4, maxCycles);
  const segments: SessionSegment[] = [];

  for (let cycleIndex = 0; cycleIndex < cycles; cycleIndex += 1) {
    segments.push(
      createSegment(
        `${prefix}-inhale-${cycleIndex}`,
        'Respire',
        cycleIndex === cycles - 1 ? 'Dernier cycle' : 'Inspire doucement',
        profile.inhaleSeconds,
        'calm',
        'inhale',
        {
          blockLabel,
          repIndex: cycleIndex + 1,
          repCount: cycles,
        },
      ),
    );
    segments.push(
      createSegment(
        `${prefix}-exhale-${cycleIndex}`,
        'Relâche',
        'Expire plus longuement',
        profile.exhaleSeconds,
        'release',
        'exhale',
        {
          blockLabel,
          repIndex: cycleIndex + 1,
          repCount: cycles,
        },
      ),
    );
  }

  const usedSeconds = sumNumbers(segments.map((segment) => segment.durationSeconds));
  segments.push(
    ...buildFillSegment(
      targetDurationSeconds - usedSeconds,
      'Laisse descendre',
      'Détente simple',
      `${prefix}-cooldown`,
    ),
  );

  return {
    segments,
    summary: {
      totalCycles: cycles,
    },
  };
}

function generateQuickSession(config: SessionConfig, profile: QuickExerciseProfile): GeneratedSession {
  const exercise = getExerciseDefinition('quick');
  const prepareSeconds = 4;
  const block = buildQuickBlock(config.targetDurationSeconds - prepareSeconds, profile, 'quick');
  const segments = [
    createSegment('quick-prepare', 'Prêt', 'Installe-toi', prepareSeconds, 'neutral', 'prepare'),
    ...block.segments,
  ];

  return {
    id: crypto.randomUUID(),
    config,
    exerciseName: exercise.name,
    segments,
    totalDurationSeconds: config.targetDurationSeconds,
    summary: {
      headline: `${block.summary.totalReps ?? 0} impulsions`,
      detail: 'Séries',
      detailValue: `${block.summary.totalSets ?? 0}`,
      note: 'Contractions courtes, relâchements nets.',
    },
    intensityHint: buildIntensityHint(profile, config.targetDurationSeconds),
  };
}

function generateLongSession(config: SessionConfig, profile: LongExerciseProfile): GeneratedSession {
  const exercise = getExerciseDefinition('long');
  const prepareSeconds = 4;
  const block = buildLongBlock(config.targetDurationSeconds - prepareSeconds, profile, 'long');
  const segments = [
    createSegment('long-prepare', 'Prêt', 'Installe-toi', prepareSeconds, 'neutral', 'prepare'),
    ...block.segments,
  ];

  return {
    id: crypto.randomUUID(),
    config,
    exerciseName: exercise.name,
    segments,
    totalDurationSeconds: config.targetDurationSeconds,
    summary: {
      headline: `${block.summary.totalReps ?? 0} maintiens`,
      detail: 'Séries',
      detailValue: `${block.summary.totalSets ?? 0}`,
      note: 'Tenue calme, récupération ample.',
    },
    intensityHint: buildIntensityHint(profile, config.targetDurationSeconds),
  };
}

function generateRelaxSession(config: SessionConfig, profile: RelaxExerciseProfile): GeneratedSession {
  const exercise = getExerciseDefinition('relax');
  const prepareSeconds = 4;
  const block = buildRelaxBlock(config.targetDurationSeconds - prepareSeconds, profile, 'relax');
  const segments = [
    createSegment('relax-prepare', 'Prêt', 'Laisse les épaules descendre', prepareSeconds, 'neutral', 'prepare'),
    ...block.segments,
  ];

  return {
    id: crypto.randomUUID(),
    config,
    exerciseName: exercise.name,
    segments,
    totalDurationSeconds: config.targetDurationSeconds,
    summary: {
      headline: `${block.summary.totalCycles ?? 0} cycles guidés`,
      detail: 'Rythme',
      detailValue: `${profile.inhaleSeconds}/${profile.exhaleSeconds}`,
      note: 'Respiration calme et relâchement progressif.',
    },
    intensityHint: buildIntensityHint(profile, config.targetDurationSeconds),
  };
}

function generateMixedSession(config: SessionConfig, profile: MixedExerciseProfile): GeneratedSession {
  const exercise = getExerciseDefinition('mixed');
  const prepareSeconds = 4;
  const blockBreakSeconds = profile.restBetweenBlocksSeconds;
  const remainingForBlocks = config.targetDurationSeconds - prepareSeconds - blockBreakSeconds;
  const normalizedFastWeight = profile.fastBlockWeight / (profile.fastBlockWeight + profile.longBlockWeight);
  const fastTarget = Math.max(36, Math.round(remainingForBlocks * normalizedFastWeight));
  const longTarget = Math.max(36, remainingForBlocks - fastTarget);
  const startWithQuick = normalizedFastWeight >= 0.5;

  const firstBlock = startWithQuick
    ? buildQuickBlock(fastTarget, profile.quick, 'mixed-fast', 'Bloc rapide')
    : buildLongBlock(longTarget, profile.long, 'mixed-long', 'Bloc maintien');
  const secondBlock = startWithQuick
    ? buildLongBlock(longTarget, profile.long, 'mixed-long', 'Bloc maintien')
    : buildQuickBlock(fastTarget, profile.quick, 'mixed-fast', 'Bloc rapide');

  const segments = [
    createSegment('mixed-prepare', 'Prêt', 'Installe-toi', prepareSeconds, 'neutral', 'prepare'),
    ...firstBlock.segments,
    createSegment(
      'mixed-transition',
      'Série suivante',
      startWithQuick ? 'Passe au maintien' : 'Passe au rythme rapide',
      blockBreakSeconds,
      'neutral',
      'transition',
    ),
    ...secondBlock.segments,
  ];

  const totalQuickReps =
    (startWithQuick ? firstBlock.summary.totalReps : secondBlock.summary.totalReps) ?? 0;
  const totalLongReps =
    (startWithQuick ? secondBlock.summary.totalReps : firstBlock.summary.totalReps) ?? 0;

  return {
    id: crypto.randomUUID(),
    config,
    exerciseName: exercise.name,
    segments,
    totalDurationSeconds: config.targetDurationSeconds,
    summary: {
      headline: `${totalQuickReps} rapides · ${totalLongReps} maintiens`,
      detail: 'Structure',
      detailValue: startWithQuick ? 'rapide puis long' : 'long puis rapide',
      note: 'Une séance équilibrée, simple à suivre.',
    },
    intensityHint: buildIntensityHint(profile, config.targetDurationSeconds),
  };
}

export function generateSession(config: SessionConfig, profile: ExerciseProfile): GeneratedSession {
  switch (profile.type) {
    case 'quick':
      return generateQuickSession(config, profile);
    case 'long':
      return generateLongSession(config, profile);
    case 'relax':
      return generateRelaxSession(config, profile);
    case 'mixed':
      return generateMixedSession(config, profile);
  }
}
