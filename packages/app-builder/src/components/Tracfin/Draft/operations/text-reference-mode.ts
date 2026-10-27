import type { FieldValueState } from '../model/field-values';

/** How a `text_or_reference` field of an operation is entered: a declared person or support, or free text. */
export type ReferenceMode = 'reference' | 'text';

/** The representation a value is in; `null` for nothing (empty, cleared, or an empty text). */
export function modeOfState(state: FieldValueState | null): ReferenceMode | null {
  if (state?.kind === 'reference') return 'reference';
  if (state?.kind === 'text' && state.text !== '') return 'text';
  return null;
}

/**
 * The mode to show. The analyst's explicit choice stands. Without one, the value shown decides (a
 * reference is a reference, a text is a text, whatever it looks like: numeric text is never turned
 * into a reference), then the mode the field was last seen in (`remembered`: emptying a picker leaves
 * the field in reference mode), then the SAVED value, then free text.
 *
 * Switching mode is local: it changes nothing in the draft. The stored value is replaced when the
 * analyst sets a value in the new mode (a `set_field` on the same occurrence replaces the value, the
 * server accepts either kind for these fields), so a click on the radio never loses anything.
 */
export function effectiveMode({
  state,
  saved,
  chosen = null,
  remembered = null,
}: {
  state: FieldValueState;
  saved: FieldValueState | null;
  chosen?: ReferenceMode | null;
  remembered?: ReferenceMode | null;
}): ReferenceMode {
  return chosen ?? modeOfState(state) ?? remembered ?? modeOfState(saved) ?? 'text';
}
