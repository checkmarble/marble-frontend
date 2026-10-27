import { TRACFIN_MAX_PRINCIPAL_OPERATIONS, type TracfinBlock } from '@app-builder/models/tracfin';
import { childrenOfCatalogId } from '../model/block-address';

export const OPERATIONS_CATALOG_ID = '/ds/operations';
export const OPERATION_CATALOG_ID = '/ds/operations/operation';
export const ONGOING_OPERATION_CATALOG_ID = '/ds/operations/operationEnCours';

/** `/ds/operations/montantTotal`: the global suspicion amount, entered by the analyst and never computed. */
export const GLOBAL_AMOUNT_FIELD_ID = '/ds/operations/montantTotal';
/** The fields of the section block itself that are not an amount: the period and the non-financial flag. */
export const PERIOD_FIELD_IDS = [
  '/ds/operations/dateDebut',
  '/ds/operations/dateFin',
  '/ds/operations/soupconElementsNonFinanciers',
] as const;

export const POTENTIAL_DUPLICATE_CODE = 'POTENTIAL_DUPLICATE_OPERATION';

/** The `/ds/operations` block, or `null` while the draft has none (the first edit creates it). */
export function operationsBlock(root: TracfinBlock): TracfinBlock | null {
  return childrenOfCatalogId(root, OPERATIONS_CATALOG_ID)[0] ?? null;
}

/** The principal operation lines, in document order. */
export function principalOperations(root: TracfinBlock): TracfinBlock[] {
  return childrenOfCatalogId(operationsBlock(root), OPERATION_CATALOG_ID);
}

/** The decision a line was built from (`selection.decision_id`), or `null` for a line without one. */
export const decisionOfLine = (line: TracfinBlock): string | null => line.selection?.decision_id || null;

/** Ids of the decisions already selected on a principal operation line. */
export function selectedDecisionIds(root: TracfinBlock): Set<string> {
  const ids = new Set<string>();
  for (const line of principalOperations(root)) {
    const id = decisionOfLine(line);
    if (id) ids.add(id);
  }
  return ids;
}

export type OperationCapacity = {
  count: number;
  max: number;
  /** Lines that can still be added: never negative, even for a draft already above the maximum. */
  remaining: number;
  /** The draft holds more lines than the maximum (nothing is ever truncated). */
  overMaximum: boolean;
};

/**
 * The room left for principal operation lines. The maximum is the backend's (`maximum 30 principal
 * operations`, the 31st `add_block` is a 400): enforced here first so that the analyst gets a message
 * and no request is sent. A draft already above it keeps all its lines.
 */
export function operationCapacity(
  root: TracfinBlock,
  max: number = TRACFIN_MAX_PRINCIPAL_OPERATIONS,
): OperationCapacity {
  const count = principalOperations(root).length;
  return { count, max, remaining: Math.max(0, max - count), overMaximum: count > max };
}
