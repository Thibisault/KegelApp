import type { ExerciseDefinition, SegmentTone } from '../types/app';

export const toneSurfaceClass: Record<ExerciseDefinition['toneKey'], string> = {
  sage: 'tone-sage border-sage-100/70',
  sky: 'tone-sky border-sky-100/70',
  sand: 'tone-sand border-sand-100/70',
  coral: 'tone-coral border-coral-100/70',
};

export const toneBadgeClass: Record<ExerciseDefinition['toneKey'], string> = {
  sage: 'bg-sage-500/12 text-sage-500',
  sky: 'bg-sky-400/12 text-sky-400',
  sand: 'bg-sand-400/14 text-sand-400',
  coral: 'bg-coral-400/14 text-coral-400',
};

export const segmentAccentByTone: Record<SegmentTone, string> = {
  activate: '#6c8b78',
  release: '#c59f64',
  calm: '#6d8e9e',
  neutral: '#96a29b',
};

