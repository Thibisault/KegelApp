import { AVAILABLE_DURATIONS } from '../domain/constants';
import type { SessionDurationMinutes } from '../types/app';

interface DurationPickerProps {
  value: SessionDurationMinutes;
  onChange: (duration: SessionDurationMinutes) => void;
}

export function DurationPicker({ value, onChange }: DurationPickerProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {AVAILABLE_DURATIONS.map((duration) => {
        const isActive = duration === value;
        return (
          <button
            key={duration}
            type="button"
            onClick={() => onChange(duration)}
            className={[
              'min-h-14 rounded-full px-5 text-base font-medium transition',
              isActive
                ? 'bg-sage-500 text-white shadow-lg shadow-sage-500/20'
                : 'soft-card bg-white/65 text-ink hover:bg-white',
            ].join(' ')}
            aria-pressed={isActive}
          >
            {duration} min
          </button>
        );
      })}
    </div>
  );
}

