import type { ChangeEvent } from 'react';
import { useRef, useState } from 'react';

import { buildExercisePreview } from '../domain/insights';
import { formatExerciseLabel } from '../lib/format';
import type { ExerciseProfiles, ExerciseType, PersistedAppState } from '../types/app';

interface SettingsPanelProps {
  state: PersistedAppState;
  onToggleVibration: (enabled: boolean) => void;
  onToggleSound: (enabled: boolean) => void;
  onToggleReducedMotion: (enabled: boolean) => void;
  onResetExercise: (exerciseType: ExerciseType) => void;
  onResetAll: () => void;
  onExport: () => string;
  onImport: (rawText: string) => void;
}

const PROFILE_KEYS: ExerciseType[] = ['quick', 'long', 'relax', 'mixed'];

function downloadJsonFile(contents: string) {
  const blob = new Blob([contents], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'kegel-app-data.json';
  anchor.click();
  URL.revokeObjectURL(url);
}

export function SettingsPanel({
  state,
  onToggleVibration,
  onToggleSound,
  onToggleReducedMotion,
  onResetExercise,
  onResetAll,
  onExport,
  onImport,
}: SettingsPanelProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [message, setMessage] = useState('');

  async function handleImportFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const rawText = await file.text();
      onImport(rawText);
      setMessage('Données importées avec succès.');
    } catch {
      setMessage('Import impossible. Le fichier JSON semble invalide.');
    } finally {
      event.target.value = '';
    }
  }

  function renderProfileSummary(profiles: ExerciseProfiles, exerciseType: ExerciseType) {
    return buildExercisePreview(profiles[exerciseType]);
  }

  return (
    <section className="soft-card rounded-[28px] border border-white/70 p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">Réglages</p>
      <h2 className="mt-2 font-display text-2xl text-ink">Préférences et données</h2>

      <div className="mt-5 grid gap-3">
        <label className="flex min-h-16 items-center justify-between rounded-[22px] bg-white/74 px-4 py-3">
          <div>
            <p className="font-medium text-ink">Vibration légère</p>
            <p className="text-sm text-ink/58">Pattern distinct pour contracter, relâcher et signaler la fin.</p>
          </div>
          <input
            type="checkbox"
            checked={state.settings.vibrationEnabled}
            onChange={(event) => onToggleVibration(event.target.checked)}
            className="h-5 w-5 accent-[#6c8b78]"
          />
        </label>

        <label className="flex min-h-16 items-center justify-between rounded-[22px] bg-white/74 px-4 py-3">
          <div>
            <p className="font-medium text-ink">Sons guidés</p>
            <p className="text-sm text-ink/58">Trois signatures sonores pour contraction, relâchement et fin.</p>
          </div>
          <input
            type="checkbox"
            checked={state.settings.soundEnabled}
            onChange={(event) => onToggleSound(event.target.checked)}
            className="h-5 w-5 accent-[#6c8b78]"
          />
        </label>

        <label className="flex min-h-16 items-center justify-between rounded-[22px] bg-white/74 px-4 py-3">
          <div>
            <p className="font-medium text-ink">Animations réduites</p>
            <p className="text-sm text-ink/58">Désactive les pulsations si tu préfères un rendu plus calme.</p>
          </div>
          <input
            type="checkbox"
            checked={state.settings.reducedMotion}
            onChange={(event) => onToggleReducedMotion(event.target.checked)}
            className="h-5 w-5 accent-[#6c8b78]"
          />
        </label>
      </div>

      <div className="mt-6 grid gap-3">
        {PROFILE_KEYS.map((exerciseType) => (
          <article key={exerciseType} className="rounded-[24px] bg-white/74 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-ink">{formatExerciseLabel(exerciseType)}</p>
                <p className="mt-1 text-sm leading-6 text-ink/62">
                  {renderProfileSummary(state.profiles, exerciseType)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onResetExercise(exerciseType)}
                className="min-h-11 rounded-full bg-white px-4 text-sm font-semibold text-ink"
              >
                Reset
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => downloadJsonFile(onExport())}
          className="min-h-12 rounded-full bg-ink px-4 text-sm font-semibold text-white"
        >
          Export JSON
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="min-h-12 rounded-full bg-white px-4 text-sm font-semibold text-ink"
        >
          Import JSON
        </button>
        <button
          type="button"
          onClick={onResetAll}
          className="min-h-12 rounded-full bg-coral-400/12 px-4 text-sm font-semibold text-ink"
        >
          Réinitialiser toutes les données
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        onChange={handleImportFile}
        className="hidden"
      />

      {message ? <p className="mt-4 text-sm text-ink/62">{message}</p> : null}

      <p className="mt-6 text-sm leading-6 text-ink/56">
        Application personnelle de routine et bien-être. Ce n’est pas un dispositif médical.
        En cas de douleur ou gêne inhabituelle, interromps la séance.
      </p>
    </section>
  );
}
