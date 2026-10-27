import type { TracfinCatalogField } from '@app-builder/models/tracfin';
import type { TracfinFieldCodes } from '@app-builder/models/tracfin/catalog-index';
import { createContext, useContext } from 'react';
import { ReferenceFieldRenderer, TextOrReferenceFieldRenderer } from '../persons/pickers/ReferenceFieldRenderer';
import { BooleanControl } from './BooleanControl';
import { CodeControl } from './CodeControl';
import { DecimalControl } from './DecimalControl';
import { ReferenceControl, TextOrReferenceControl } from './ReferenceControl';
import { TextControl } from './TextControl';
import type { TracfinFieldRenderer } from './types';

/**
 * Renderers that take over from the generic controls.
 *
 * Resolution order for a field: `byField[field.id]`, then `byKind[field.value_kind]`, then the
 * generic control of the value kind (text / code picker / boolean / decimal / reference).
 *
 * Tasks 4, 6 and 7 plug their pickers in here, for example
 * `byField['/ds/operations/operation/emetteurTypeEmetteur'] = PersonReferencePicker`.
 */
export type TracfinFieldRendererRegistry = {
  readonly byField: Readonly<Record<string, TracfinFieldRenderer>>;
  readonly byKind: Readonly<Partial<Record<TracfinCatalogField['value_kind'], TracfinFieldRenderer>>>;
};

/** No renderer of its own: every field gets the generic control of its value kind. */
export const genericTracfinFieldRenderers: TracfinFieldRendererRegistry = {
  byField: {},
  byKind: {},
};

/**
 * The renderers the draft screen ships with. References are not typed in: a reference field gets
 * the picker of what it points to (a declared person, a piece, a support of a person), and the four
 * `text_or_reference` fields of an operation get that picker or free text. A section that needs
 * another renderer for one field adds it to `byField`.
 */
export const defaultTracfinFieldRenderers: TracfinFieldRendererRegistry = {
  byField: {},
  byKind: { reference: ReferenceFieldRenderer, text_or_reference: TextOrReferenceFieldRenderer },
};

export const TracfinFieldRenderersContext = createContext<TracfinFieldRendererRegistry>(defaultTracfinFieldRenderers);

export const useTracfinFieldRenderers = () => useContext(TracfinFieldRenderersContext);

export function resolveFieldRenderer(
  registry: TracfinFieldRendererRegistry,
  field: TracfinCatalogField,
  codes: TracfinFieldCodes,
): TracfinFieldRenderer {
  const registered = registry.byField[field.id] ?? registry.byKind[field.value_kind];
  if (registered) return registered;
  switch (field.value_kind) {
    case 'boolean':
      return BooleanControl;
    case 'decimal':
      return DecimalControl;
    case 'reference':
      return ReferenceControl;
    case 'text_or_reference':
      return TextOrReferenceControl;
    case 'text':
      return Array.isArray(codes) ? CodeControl : TextControl;
  }
}
