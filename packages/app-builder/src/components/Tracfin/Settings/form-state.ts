import type {
  TracfinBlock,
  TracfinConfiguration,
  TracfinConfigurationInput,
  TracfinFieldInput,
  TracfinMapping,
  TracfinMappingSource,
  TracfinPathStep,
  TracfinSettingInput,
  TracfinValue,
} from '@app-builder/models/tracfin';
import type { TracfinCatalogIndex } from '@app-builder/models/tracfin/catalog-index';
import * as R from 'remeda';

/**
 * What the administrator edits: the organisme / contact settings by catalog field id, and the
 * mappings exactly as the server stores them (no UI-only member lives in the mappings, so what is
 * edited is what is sent).
 */
export type TracfinConfigurationFormState = {
  settings: Record<string, TracfinFieldInput>;
  mappings: TracfinMapping[];
};

function dropUndefined<T extends object>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, member]) => member !== undefined)) as T;
}

function toFieldInput(value: TracfinValue): TracfinFieldInput | null {
  switch (value.kind) {
    case 'text':
      return { kind: 'text', text: value.text ?? '' };
    case 'decimal':
      return { kind: 'decimal', decimal: value.decimal ?? '' };
    case 'boolean':
      return { kind: 'boolean', boolean: value.boolean ?? false };
    // A setting is never a reference (the server refuses it) and a cleared value is an absence.
    default:
      return null;
  }
}

/**
 * Reads the settings back from the stored document: every block is walked, and the first value of
 * each field becomes its input, keeping the kind the server stored. Server ids and origins are not
 * part of an input: the server allocates them again on every replacement.
 */
export function readSettings(root: TracfinBlock | undefined): Record<string, TracfinFieldInput> {
  const settings: Record<string, TracfinFieldInput> = {};
  const visit = (block: TracfinBlock) => {
    for (const [fieldId, values] of Object.entries(block.fields ?? {})) {
      if (Object.hasOwn(settings, fieldId)) continue;
      const first = values.find((value) => value.kind !== 'cleared');
      const input = first ? toFieldInput(first) : null;
      if (input) settings[fieldId] = input;
    }
    block.children?.forEach(visit);
  };
  if (root) visit(root);
  return settings;
}

/** The form state of a loaded configuration; `null` (no configuration yet) is an empty form. */
export function configurationToFormState(configuration: TracfinConfiguration | null): TracfinConfigurationFormState {
  return {
    settings: readSettings(configuration?.settings.root),
    // The server serialises an empty list as `null`.
    mappings: configuration?.mappings ?? [],
  };
}

export function isFormStateEqual(a: TracfinConfigurationFormState, b: TracfinConfigurationFormState): boolean {
  return R.isDeepEqual(a, b);
}

/** A blank field is an absent setting: PUT replaces everything, so omitting it clears it. */
export function isEmptySetting(input: TracfinFieldInput): boolean {
  switch (input.kind) {
    case 'text':
      return (input.text ?? '').trim() === '';
    case 'decimal':
      return (input.decimal ?? '').trim() === '';
    case 'boolean':
      return input.boolean === undefined;
    case 'reference':
      return input.reference === undefined;
  }
}

/** Sets a text-like setting; emptying it removes it, so an untouched and an emptied field look the same. */
export function setSettingText(
  settings: Record<string, TracfinFieldInput>,
  fieldId: string,
  kind: 'text' | 'decimal',
  value: string,
): Record<string, TracfinFieldInput> {
  const { [fieldId]: _previous, ...others } = settings;
  // Only an empty input removes the setting: a typed space is not an emptied field (the PUT body omits blanks).
  if (value === '') return others;
  return { ...others, [fieldId]: kind === 'decimal' ? { kind, decimal: value } : { kind, text: value } };
}

export function setSettingBoolean(
  settings: Record<string, TracfinFieldInput>,
  fieldId: string,
  value: boolean | null,
): Record<string, TracfinFieldInput> {
  const { [fieldId]: _previous, ...others } = settings;
  return value === null ? others : { ...others, [fieldId]: { kind: 'boolean', boolean: value } };
}

/** The text of a text-like setting, for display in an input. */
export function settingText(input: TracfinFieldInput | undefined): string {
  if (!input) return '';
  return input.kind === 'decimal' ? (input.decimal ?? '') : (input.text ?? '');
}

function toValueInput(input: TracfinFieldInput): TracfinFieldInput {
  switch (input.kind) {
    case 'text':
      return { kind: 'text', text: input.text ?? '' };
    case 'decimal':
      return { kind: 'decimal', decimal: input.decimal ?? '' };
    case 'boolean':
      return { kind: 'boolean', boolean: input.boolean ?? false };
    case 'reference':
      return dropUndefined({ kind: 'reference', reference: input.reference });
  }
}

/**
 * Empty settings are omitted. An attribute of simple content whose owner has no value is omitted
 * too: the server refuses it (« attribute requires its scalar owner ») with a bare 400 that names
 * nothing, and the owner's value is what makes the attribute meaningful.
 */
export function buildSettingInputs(
  settings: Record<string, TracfinFieldInput>,
  catalogIndex: TracfinCatalogIndex,
): TracfinSettingInput[] {
  const hasValue = (fieldId: string) => Object.hasOwn(settings, fieldId) && !isEmptySetting(settings[fieldId]!);
  const inputs: TracfinSettingInput[] = [];
  for (const [fieldId, input] of Object.entries(settings)) {
    if (isEmptySetting(input)) continue;
    const field = catalogIndex.field(fieldId);
    if (field?.attribute && catalogIndex.field(field.parent)?.kind === 'field' && !hasValue(field.parent)) continue;
    inputs.push({ field: { field_id: fieldId }, value: toValueInput(input) });
  }
  return inputs;
}

function toStepInput(step: TracfinPathStep): TracfinPathStep {
  return dropUndefined({
    id: step.id,
    parent_id: step.parent_id,
    link: step.link,
    direction: step.direction,
    table: step.table,
    record_id: step.record_id,
  });
}

function toSourceInput(source: TracfinMappingSource): TracfinMappingSource {
  return dropUndefined({
    unit_operation: source.unit_operation,
    kind: source.kind,
    entity_type: source.entity_type,
    table: source.table,
    field: source.field,
    historical_type: source.historical_type,
    path: source.path?.map(toStepInput),
  });
}

/** Lists every member the contract names, and nothing else, so no UI-only key can reach the server. */
export function toMappingInput(mapping: TracfinMapping): TracfinMapping {
  return dropUndefined({
    discriminator: mapping.discriminator
      ? { field: mapping.discriminator.field, values: [...mapping.discriminator.values] }
      : undefined,
    id: mapping.id,
    target_field: mapping.target_field,
    source: toSourceInput(mapping.source),
    codes: mapping.codes?.map(({ source, target }) => ({ source, target })),
    unit: mapping.unit,
    target_currency: mapping.target_currency,
    currency: mapping.currency
      ? dropUndefined({ field: mapping.currency.field, constant: mapping.currency.constant })
      : undefined,
  });
}

/** The PUT body: replaces the whole configuration, guarded by the revision that was read. */
export function buildConfigurationInput({
  state,
  expectedRevision,
  catalogIndex,
}: {
  state: TracfinConfigurationFormState;
  expectedRevision: number;
  catalogIndex: TracfinCatalogIndex;
}): TracfinConfigurationInput {
  return {
    expected_revision: expectedRevision,
    settings: buildSettingInputs(state.settings, catalogIndex),
    mappings: state.mappings.map(toMappingInput),
  };
}
