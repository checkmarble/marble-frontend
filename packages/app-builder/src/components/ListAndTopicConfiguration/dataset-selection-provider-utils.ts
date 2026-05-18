export function makeDatasetsMap(selected: string[]): Record<string, boolean> {
  return Object.fromEntries(selected.map((name) => [name, true]));
}
