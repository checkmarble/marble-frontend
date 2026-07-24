import { type FtmEntityPersonOption, type FtmEntityV2 } from '@app-builder/models/data-model';

export type NonPersonSemantic = Exclude<FtmEntityV2, 'person'>;

export type GraphTypeMeta =
  | { kind: 'person'; semanticType: 'person'; defaultSubEntity: FtmEntityPersonOption }
  | { kind: 'entity'; semanticType: NonPersonSemantic }
  | { kind: 'pivot' };

/**
 * Maps raw graphData node `type` values to Marble data-model semantic types.
 * Pivots are path glue only — they do not form their own group nodes.
 */
export const graphTypeToSemantic: Record<string, GraphTypeMeta> = {
  user: { kind: 'person', semanticType: 'person', defaultSubEntity: 'natural' },
  account: { kind: 'entity', semanticType: 'account' },
  transactions: { kind: 'entity', semanticType: 'transaction' },
  devices: { kind: 'entity', semanticType: 'event' },
  same_iban: { kind: 'pivot' },
  same_ip: { kind: 'pivot' },
};

/** Short labels for group nodes in the UI. */
export const semanticTypeLabel: Record<NonPersonSemantic, string> = {
  account: 'Account',
  transaction: 'Transaction',
  event: 'Event',
  other: 'Other',
};

export function resolveGraphTypeMeta(type: string): GraphTypeMeta {
  return graphTypeToSemantic[type] ?? { kind: 'entity', semanticType: 'other' };
}

export function isPersonType(type: string): boolean {
  return resolveGraphTypeMeta(type).kind === 'person';
}

export function isPivotType(type: string): boolean {
  return resolveGraphTypeMeta(type).kind === 'pivot';
}

export function getNonPersonSemantic(type: string): NonPersonSemantic | null {
  const meta = resolveGraphTypeMeta(type);
  if (meta.kind === 'entity') return meta.semanticType;
  return null;
}

export function getPersonSubEntity(type: string): FtmEntityPersonOption {
  const meta = resolveGraphTypeMeta(type);
  if (meta.kind === 'person') return meta.defaultSubEntity;
  return 'generic';
}
