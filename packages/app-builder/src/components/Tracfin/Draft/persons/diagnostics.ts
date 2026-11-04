/** The prefill diagnostics that say something about the selection a block is attached to. */
export const SELECTION_DIAGNOSTIC_CODES = [
  'SELECTION_STALE',
  'SELECTION_PARENT_CHANGED',
  'SOURCE_UNAVAILABLE',
  'MAPPING_UNAVAILABLE',
  'LINK_UNAVAILABLE',
  'NAVIGATION_INDEX_UNAVAILABLE',
] as const;

export type SelectionDiagnosticCode = (typeof SELECTION_DIAGNOSTIC_CODES)[number];

export const isSelectionDiagnostic = (code: string): code is SelectionDiagnosticCode =>
  (SELECTION_DIAGNOSTIC_CODES as readonly string[]).includes(code);
