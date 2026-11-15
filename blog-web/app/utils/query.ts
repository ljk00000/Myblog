export function textQuery(value: unknown): string {
  return typeof value === 'string' ? value.trim().slice(0, 200) : ''
}
export function positiveQuery(value: unknown, fallback = 1): number {
  const text = typeof value === 'string' ? value : ''
  return /^[1-9]\d*$/.test(text) && Number.isSafeInteger(Number(text)) ? Number(text) : fallback
}
export function optionalId(value: unknown): number | undefined {
  return positiveQuery(value, 0) || undefined
}
