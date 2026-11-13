/**
 * The hits selected for a batch No hit, each with the comment it records. The comment box edits every
 * comment at once. Hits can keep different comments after an undo or a failed batch brings back hits
 * beside the ones already selected, so each retries with its own comment.
 */
export type BatchSelection = ReadonlyMap<string, string>;

export const emptyBatchSelection: BatchSelection = new Map();

/** The comment every selected hit records, or undefined when they differ. */
export function sharedBatchComment(selection: BatchSelection): string | undefined {
  const comments = new Set(selection.values());
  return comments.size > 1 ? undefined : ([...comments][0] ?? '');
}

/** Adds hits with the shared comment, or none when comments differ. */
export function withSelected(selection: BatchSelection, ids: readonly string[]): BatchSelection {
  const comment = sharedBatchComment(selection) ?? '';
  const next = new Map(selection);
  for (const id of ids) if (!next.has(id)) next.set(id, comment);
  return next;
}

export function withoutSelected(selection: BatchSelection, ids: readonly string[]): BatchSelection {
  const next = new Map(selection);
  for (const id of ids) next.delete(id);
  return next;
}

export function toggleSelected(selection: BatchSelection, id: string): BatchSelection {
  return selection.has(id) ? withoutSelected(selection, [id]) : withSelected(selection, [id]);
}

export function withBatchComment(selection: BatchSelection, comment: string): BatchSelection {
  return new Map([...selection.keys()].map((id) => [id, comment]));
}

/** Brings hits back beside the current selection, each with its own comment. */
export function withRestored(selection: BatchSelection, restored: BatchSelection): BatchSelection {
  return new Map([...selection, ...restored]);
}
