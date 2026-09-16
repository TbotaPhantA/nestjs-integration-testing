export function ensureNumber<T>(n: T, error?: string | Error): number {
  if (typeof n !== 'number' || !Number.isFinite(n)) {
    throw error instanceof Error
      ? error
      : new Error(error ?? `Expected a number, got ${typeof n}`);
  }

  return n;
}
