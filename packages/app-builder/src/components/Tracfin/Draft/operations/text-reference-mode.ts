import type { FieldValueState } from '../model/field-values';

/** How a `text_or_reference` field of an operation is entered: a declared person or support, or free text. */
export type ReferenceMode = 'reference' | 'text';

/**
 * The mode to show. A saved or pending value decides (a reference is a reference, a text is a text,
 * whatever it looks like: numeric text is never turned into a reference); with nothing in the field
 * the analyst's last choice stands.
 */
export function effectiveMode(state: FieldValueState, chosen: ReferenceMode): ReferenceMode {
  if (state.kind === 'reference') return 'reference';
  if (state.kind === 'text' && state.text !== '') return 'text';
  return chosen;
}

/** Switching mode empties the other representation on purpose (`clear_field`), then the new value is set. */
export function switchNeedsClear(state: FieldValueState, next: ReferenceMode): boolean {
  return (state.kind === 'reference' && next === 'text') || (state.kind === 'text' && next === 'reference');
}
