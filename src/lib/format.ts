import type {
  ExerciseType,
  SessionFeedback,
  SessionSegment,
} from '../types/app';

const feedbackLabels: Record<SessionFeedback, string> = {
  too_easy: 'Trop facile',
  just_right: 'Bien',
  too_hard: 'Trop dur',
};

const exerciseLabels: Record<ExerciseType, string> = {
  quick: 'Rapides',
  long: 'Longues',
  relax: 'Relaxation',
  mixed: 'Mixte',
};

export function formatClock(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (safeSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export function formatMinutes(totalSeconds: number) {
  const minutes = Math.round(totalSeconds / 60);
  return `${minutes} min`;
}

export function formatExerciseLabel(exerciseType: ExerciseType) {
  return exerciseLabels[exerciseType];
}

export function formatFeedbackLabel(feedback: SessionFeedback) {
  return feedbackLabels[feedback];
}

export function formatSegmentMeta(segment: SessionSegment) {
  if (
    segment.setIndex &&
    segment.setCount &&
    segment.repIndex &&
    segment.repCount
  ) {
    return `Série ${segment.setIndex}/${segment.setCount} · rep ${segment.repIndex}/${segment.repCount}`;
  }

  if (segment.setIndex && segment.setCount) {
    return `Série ${segment.setIndex}/${segment.setCount}`;
  }

  return segment.blockLabel ?? '';
}

export function formatCompletedAt(isoDate: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoDate));
}

