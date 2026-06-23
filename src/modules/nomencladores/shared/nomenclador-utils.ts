export function normalizeName(value: string): string {
  return value.trim().replace(/\b\w/g, (c) => c.toUpperCase());
}
