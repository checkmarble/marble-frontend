import { TRACFIN_TEXT_OR_REFERENCE_FIELDS } from '@app-builder/models/tracfin';
import { defaultTracfinFieldRenderers, type TracfinFieldRendererRegistry } from '../fields/registry';
import { ReferenceModeRenderer } from './ReferenceModeRenderer';

/**
 * The default renderers plus the explicit « declared person/support vs free text » toggle on the four
 * `text_or_reference` fields. Provided around the operation lines only: the generic default of those
 * kinds (picker or free text, Task 4) is unchanged elsewhere.
 */
export const operationFieldRenderers: TracfinFieldRendererRegistry = {
  byField: {
    ...defaultTracfinFieldRenderers.byField,
    ...Object.fromEntries(TRACFIN_TEXT_OR_REFERENCE_FIELDS.map((id) => [id, ReferenceModeRenderer])),
  },
  byKind: defaultTracfinFieldRenderers.byKind,
};
