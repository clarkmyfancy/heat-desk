export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

export const sum = (values: number[]): number => values.reduce((acc, value) => acc + value, 0);

export const pct = (value: number, total: number): number => {
  if (total === 0) return 0;
  return (value / total) * 100;
};

export const seededDefault = (): number => Math.floor(Date.now() % 2_147_483_647);
