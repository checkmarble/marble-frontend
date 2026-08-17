import { type GraphEdgeData } from '@app-builder/models/graph';

export function resolveTitle(label: string | undefined, objectId: string) {
  const trimmed = label?.trim();
  if (trimmed && trimmed !== '-') return trimmed;
  return objectId;
}

/** Placeholder: edge metadata will produce the displayed label. */
export function resolveEdgeLabel(_edge: GraphEdgeData): string | undefined {
  return undefined;
}
