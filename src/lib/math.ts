export function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function clampInteger(value: number, min: number, max: number) {
  return Math.round(clampNumber(value, min, max));
}

export function roundToStep(value: number, step: number) {
  return Math.round(value / step) * step;
}

export function sumNumbers(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

export function uniqueDateKey(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}
