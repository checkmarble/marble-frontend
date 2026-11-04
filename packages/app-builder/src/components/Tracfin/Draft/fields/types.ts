import type { TracfinCatalogField, TracfinFieldInput } from '@app-builder/models/tracfin';
import type { TracfinFieldCodes } from '@app-builder/models/tracfin/catalog-index';
import type { ComponentType } from 'react';
import type { FieldOccurrence } from '../model/field-values';

/**
 * What a field control receives for ONE occurrence of a field. A control only shows the value and
 * reports what the analyst did; queuing, saving and owners of attributes are handled by the editor.
 */
export type TracfinFieldControlProps = {
  field: TracfinCatalogField;
  /** Translated label; use it as the accessible name of the control. */
  label: string;
  /** Unique DOM id for the control (the label points to it). */
  inputId: string;
  occurrence: FieldOccurrence;
  codes: TracfinFieldCodes;
  /** The control cannot be edited (an attribute whose owner is not saved yet, a saving in progress). */
  disabled: boolean;
  /** Queues this value for the occurrence (the owner of an attribute is added by the editor). */
  onSet: (input: TracfinFieldInput) => void;
  /** Empties the occurrence on purpose. An empty text is the same thing. */
  onClear: () => void;
  /** A decimal that is not a number: kept locally and shown as invalid, never sent. */
  onInvalidDecimal: (text: string) => void;
  /** The edit is finished (blur, a choice made): the editor saves what is pending. */
  onCommit: () => void;
};

export type TracfinFieldRenderer = ComponentType<TracfinFieldControlProps>;
