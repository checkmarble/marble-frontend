/**
 * Regex for data model names (table names, field names).
 * Must start with a lowercase letter, followed by lowercase alphanumeric or underscores.
 */
export const dataModelNameRegex = /^[a-z][a-z0-9_]*$/;

export function isValidDataModelName(name: string): boolean {
  return dataModelNameRegex.test(name);
}
