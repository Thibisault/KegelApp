export type ExerciseType = 'quick' | 'long' | 'relax' | 'mixed';

export type SessionFeedback = 'too_easy' | 'just_right' | 'too_hard';

export type SessionDurationMinutes = 2 | 5 | 10;

export type SegmentKind =
  | 'prepare'
  | 'contract'
  | 'hold'
  | 'release'
  | 'inhale'
  | 'exhale'
  | 'rest'
  | 'transition';

export type SegmentTone = 'activate' | 'release' | 'calm' | 'neutral';

export interface SessionSegment {
  id: string;
  kind: SegmentKind;
  label: string;
  cue: string;
  durationSeconds: number;
  tone: SegmentTone;
  blockLabel?: string;
  setIndex?: number;
  setCount?: number;
  repIndex?: number;
  repCount?: number;
}

export interface QuickExerciseProfile {
  type: 'quick';
  contractionSeconds: number;
  releaseSeconds: number;
  repsPerSet: number;
  sets: number;
  restBetweenSetsSeconds: number;
}

export interface LongExerciseProfile {
  type: 'long';
  holdSeconds: number;
  releaseSeconds: number;
  repsPerSet: number;
  sets: number;
  restBetweenSetsSeconds: number;
}

export interface RelaxExerciseProfile {
  type: 'relax';
  inhaleSeconds: number;
  exhaleSeconds: number;
  cyclesTarget: number;
  totalDurationPreference: number;
}

export interface MixedExerciseProfile {
  type: 'mixed';
  fastBlockWeight: number;
  longBlockWeight: number;
  restBetweenBlocksSeconds: number;
  quick: QuickExerciseProfile;
  long: LongExerciseProfile;
}

export interface ExerciseProfiles {
  quick: QuickExerciseProfile;
  long: LongExerciseProfile;
  relax: RelaxExerciseProfile;
  mixed: MixedExerciseProfile;
}

export type ExerciseProfile = ExerciseProfiles[ExerciseType];

export interface SessionConfig {
  exerciseType: ExerciseType;
  durationMinutes: SessionDurationMinutes;
  targetDurationSeconds: number;
  generatedAt: string;
}

export interface SessionSummary {
  headline: string;
  detail: string;
  detailValue: string;
  note: string;
}

export interface GeneratedSession {
  id: string;
  config: SessionConfig;
  exerciseName: string;
  segments: SessionSegment[];
  totalDurationSeconds: number;
  summary: SessionSummary;
  intensityHint: string;
}

export interface SessionHistoryEntry {
  id: string;
  generatedSessionId: string;
  exerciseType: ExerciseType;
  completedAt: string;
  targetDurationSeconds: number;
  actualDurationSeconds: number;
  feedback: SessionFeedback;
  summary: string;
  profileSnapshot: ExerciseProfile;
}

export interface AppSettings {
  favoriteDurationMinutes: SessionDurationMinutes;
  vibrationEnabled: boolean;
  soundEnabled: boolean;
  reducedMotion: boolean;
}

export interface PersistedAppState {
  version: number;
  settings: AppSettings;
  profiles: ExerciseProfiles;
  history: SessionHistoryEntry[];
}

export interface ExerciseDefinition {
  type: ExerciseType;
  name: string;
  shortDescription: string;
  longDescription: string;
  toneKey: 'sage' | 'sky' | 'sand' | 'coral';
}

export interface AppStats {
  totalSessions: number;
  totalMinutes: number;
  streakDays: number;
  lastSevenDays: number;
}
