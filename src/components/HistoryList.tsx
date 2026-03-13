import { buildHistorySummary } from '../domain/insights';
import { formatCompletedAt, formatExerciseLabel } from '../lib/format';
import type { SessionHistoryEntry } from '../types/app';

interface HistoryListProps {
  history: SessionHistoryEntry[];
}

export function HistoryList({ history }: HistoryListProps) {
  return (
    <section className="soft-card rounded-[28px] border border-white/70 p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">Historique</p>
          <h2 className="mt-2 font-display text-2xl text-ink">Dernières séances</h2>
        </div>
        <div className="rounded-full bg-white/72 px-4 py-2 text-sm text-ink/62">
          {history.length} au total
        </div>
      </div>

      {history.length === 0 ? (
        <div className="mt-5 rounded-[24px] bg-white/68 p-4 text-sm leading-6 text-ink/62">
          Aucune séance enregistrée pour le moment. Commence par une session rapide et l’historique se remplira ici.
        </div>
      ) : (
        <div className="mt-5 grid gap-3">
          {history.slice(0, 6).map((entry) => (
            <article
              key={entry.id}
              className="rounded-[24px] bg-white/74 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-base font-semibold text-ink">
                    {formatExerciseLabel(entry.exerciseType)}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-ink/65">{buildHistorySummary(entry)}</p>
                </div>
                <p className="text-xs uppercase tracking-[0.12em] text-ink/45">
                  {formatCompletedAt(entry.completedAt)}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

