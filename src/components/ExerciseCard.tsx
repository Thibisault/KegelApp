import { formatCompletedAt, formatFeedbackLabel } from '../lib/format';
import { toneBadgeClass, toneSurfaceClass } from '../lib/theme';
import type {
  ExerciseDefinition,
  SessionDurationMinutes,
  SessionHistoryEntry,
} from '../types/app';

interface ExerciseCardProps {
  exercise: ExerciseDefinition;
  preview: string;
  duration: SessionDurationMinutes;
  lastEntry?: SessionHistoryEntry;
  onStart: () => void;
}

export function ExerciseCard({
  exercise,
  preview,
  duration,
  lastEntry,
  onStart,
}: ExerciseCardProps) {
  return (
    <article
      className={[
        'soft-card grain-overlay relative overflow-hidden rounded-[28px] border p-5 sm:p-6',
        toneSurfaceClass[exercise.toneKey],
      ].join(' ')}
    >
      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div
              className={[
                'inline-flex rounded-full px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase',
                toneBadgeClass[exercise.toneKey],
              ].join(' ')}
            >
              {exercise.name}
            </div>
            <div>
              <h3 className="font-display text-2xl text-ink">{exercise.shortDescription}</h3>
              <p className="mt-2 text-sm leading-6 text-ink/70">{exercise.longDescription}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1.2fr_1fr]">
          <div className="rounded-3xl bg-white/72 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">
              Profil du prochain passage
            </p>
            <p className="mt-2 text-sm leading-6 text-ink/75">{preview}</p>
          </div>
          <div className="rounded-3xl bg-white/56 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">
              Dernier ressenti
            </p>
            {lastEntry ? (
              <>
                <p className="mt-2 text-base font-medium text-ink">
                  {formatFeedbackLabel(lastEntry.feedback)}
                </p>
                <p className="mt-1 text-sm text-ink/60">{formatCompletedAt(lastEntry.completedAt)}</p>
              </>
            ) : (
              <p className="mt-2 text-sm text-ink/60">Aucune séance enregistrée pour l’instant.</p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onStart}
          className="min-h-15 rounded-[20px] bg-ink px-5 text-base font-semibold text-white transition hover:bg-ink/92"
        >
          Démarrer {duration} min
        </button>
      </div>
    </article>
  );
}

