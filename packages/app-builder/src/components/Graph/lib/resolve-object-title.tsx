export function resolveTitle(label: string | undefined, objectId: string) {
  const trimmed = label?.trim();
  if (trimmed && trimmed !== '-') return trimmed;
  return objectId;
}
