export type FieldErrors = Record<string, string>

// Drops one field's error, used when the visitor edits that field again.
export function withoutError(errors: FieldErrors, key: string): FieldErrors {
  if (!(key in errors)) return errors
  const next = { ...errors }
  delete next[key]
  return next
}
