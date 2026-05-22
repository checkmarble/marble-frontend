export function setAdditionalFields(
  fields: string[],
  prev: Record<string, string | undefined>,
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const field of fields) {
    result[field] = prev[field] ?? '';
  }
  return result;
}
