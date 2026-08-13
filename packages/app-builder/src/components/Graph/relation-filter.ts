/**
 * Which pivot relation labels exist, and which of them the user kept on.
 * The two lists only ever make sense together, so they travel as one value.
 */
export type RelationFilter = {
  /** Every configured relation label, deduplicated. */
  available: string[];
  /** The subset the user kept visible. */
  selected: string[];
};

export const EMPTY_RELATION_FILTER: RelationFilter = { available: [], selected: [] };

/** Pivots whose type matches no configured relation label are never filtered out. */
export function allowsPivot(filter: RelationFilter, rawType: string): boolean {
  if (!filter.available.includes(rawType)) return true;
  return filter.selected.includes(rawType);
}

/**
 * Reconcile the filter with the configured labels: on first load everything is
 * selected; afterwards the user's picks are kept and newly added labels are
 * selected too.
 */
export function withAvailableLabels(filter: RelationFilter, labels: string[]): RelationFilter {
  const available = [...new Set(labels)];
  if (filter.selected.length === 0) return { available, selected: available };

  const kept = filter.selected.filter((label) => available.includes(label));
  const added = available.filter((label) => !filter.selected.includes(label));
  return { available, selected: [...kept, ...added] };
}

export function withLabelToggled(filter: RelationFilter, label: string): RelationFilter {
  const selected = filter.selected.includes(label)
    ? filter.selected.filter((item) => item !== label)
    : [...filter.selected, label];
  return { ...filter, selected };
}
