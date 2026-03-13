import { FEEDBACK_MESSAGES } from '../domain/constants';
import { formatClock, formatFeedbackLabel } from '../lib/format';
import type {
  GeneratedSession,
  SessionFeedback,
} from '../types/app';

interface FeedbackPanelProps {
  session: GeneratedSession;
  actualDurationSeconds: number;
  selectedFeedback?: SessionFeedback;
  onSelect: (feedback: SessionFeedback) => void;
  onBackHome: () => void;
}

const FEEDBACK_OPTIONS: SessionFeedback[] = ['too_easy', 'just_right', 'too_hard'];

export function FeedbackPanel({
  session,
  actualDurationSeconds,
  selectedFeedback,
  onSelect,
  onBackHome,
}: FeedbackPanelProps) {
  return (
    <main className="app-shell">
      <div className="mx-auto flex min-h-[calc(100dvh-2.4rem)] w-full max-w-2xl flex-col gap-4">
        <section className="soft-card rounded-[32px] border border-white/70 p-6 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">
            Séance terminée
          </p>
          <h1 className="mt-2 font-display text-4xl text-ink">{session.exerciseName}</h1>
          <p className="mt-3 text-base leading-7 text-ink/70">{session.summary.note}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl bg-white/74 p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-ink/45">Durée</p>
              <p className="mt-2 text-2xl font-semibold text-ink">{formatClock(actualDurationSeconds)}</p>
            </div>
            <div className="rounded-3xl bg-white/74 p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-ink/45">{session.summary.detail}</p>
              <p className="mt-2 text-2xl font-semibold text-ink">{session.summary.detailValue}</p>
            </div>
            <div className="rounded-3xl bg-white/74 p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-ink/45">Résumé</p>
              <p className="mt-2 text-base font-semibold text-ink">{session.summary.headline}</p>
            </div>
          </div>
        </section>

        <section className="soft-card rounded-[32px] border border-white/70 p-6 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">
            Comment c’était ?
          </p>
          <div className="mt-5 grid gap-3">
            {FEEDBACK_OPTIONS.map((feedback) => {
              const isSelected = feedback === selectedFeedback;
              return (
                <button
                  key={feedback}
                  type="button"
                  onClick={() => onSelect(feedback)}
                  disabled={Boolean(selectedFeedback)}
                  className={[
                    'min-h-15 rounded-[22px] px-5 text-left text-base font-semibold transition',
                    isSelected
                      ? 'bg-ink text-white'
                      : 'bg-white/72 text-ink hover:bg-white disabled:opacity-60',
                  ].join(' ')}
                >
                  {formatFeedbackLabel(feedback)}
                </button>
              );
            })}
          </div>

          {selectedFeedback ? (
            <div className="mt-5 rounded-[24px] bg-sage-500/10 p-4 text-sm leading-6 text-ink/72">
              {FEEDBACK_MESSAGES[selectedFeedback]}
            </div>
          ) : null}

          <button
            type="button"
            onClick={onBackHome}
            className="mt-6 min-h-14 rounded-full bg-white/78 px-5 text-base font-semibold text-ink"
          >
            Retour à l’accueil
          </button>
        </section>
      </div>
    </main>
  );
}

