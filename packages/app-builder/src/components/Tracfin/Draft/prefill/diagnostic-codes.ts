import { isSelectionDiagnostic } from '../persons/diagnostics';

/**
 * The codes of the `sources` layer the prefill reports (backend `ResolvePrefill`, `periodProposals`,
 * `duplicateSnapshotDiagnostics`). Each has a French explanation under `draft.prefill.diagnostics.*`;
 * a code this list does not know is shown with the generic text.
 */
export const KNOWN_PREFILL_DIAGNOSTIC_CODES = [
  'SOURCE_UNAVAILABLE',
  'LINK_UNAVAILABLE',
  'NAVIGATION_INDEX_UNAVAILABLE',
  'MAPPING_UNAVAILABLE',
  'SELECTION_STALE',
  'SELECTION_PARENT_CHANGED',
  'UNKNOWN_CODE',
  'CURRENCY_UNKNOWN',
  'CURRENCY_MISMATCH',
  'INVALID_SOURCE_DATE',
  'REFERENCE_SELECTION_REQUIRED',
  'POTENTIAL_DUPLICATE_OPERATION',
  'PARTIAL_PERIOD',
  // Emitted by the backend as well, beyond the documented list.
  'UNKNOWN_DISCRIMINATOR',
  'CURRENCY_OR_UNIT_UNKNOWN',
  'TARGET_OCCURRENCE_REQUIRED',
  'PARENT_OCCURRENCE_REQUIRED',
  'SETTINGS_OCCURRENCE_REQUIRED',
  'SNAPSHOT_INVALID',
  'SOURCE_TYPE_UNSUPPORTED',
  'INVALID_MAPPING_TARGET',
  'INCOMPATIBLE_PROFILE',
  'CATALOG_UNAVAILABLE',
] as const;

export const isKnownPrefillDiagnosticCode = (code: string): boolean =>
  (KNOWN_PREFILL_DIAGNOSTIC_CODES as readonly string[]).includes(code);

/** What the analyst can do about a diagnostic from the field it locates. */
export type DiagnosticFix = 'choose_code' | 'choose_object';

export function diagnosticFixOf(code: string): DiagnosticFix | null {
  if (code === 'UNKNOWN_CODE') return 'choose_code';
  if (code === 'REFERENCE_SELECTION_REQUIRED') return 'choose_object';
  return null;
}

/**
 * True when the block shows the diagnostic itself: a section that provides block extras (the Persons
 * section) renders the selection codes with their actions, so the generic rendering leaves them out.
 */
export const isHandledByBlockExtras = (code: string, hasExtras: boolean): boolean =>
  hasExtras && isSelectionDiagnostic(code);
