import {
  isTracfinRequestError,
  parseTracfinConfigurationErrors,
  type TracfinConfigurationError,
  type TracfinMapping,
} from '@app-builder/models/tracfin';

/** Diagnostic codes of `ValidateConfiguration` (backend `usecases/tracfin/catalog.go`). */
export const TRACFIN_CONFIGURATION_ERROR_CODES = [
  'INVALID_MAPPING_ID',
  'INVALID_MAPPING_TARGET',
  'INVALID_MAPPING_SOURCE',
  'INVALID_ENTITY_TYPE',
  'INVALID_UNIT_OPERATION',
  'INVALID_DISCRIMINATOR',
  'INVALID_MAPPING_PATH',
  'INCONSISTENT_MAPPING_PATH',
  'MISSING_SOURCE_CODE',
  'CONTRADICTORY_CODE_MAPPING',
  'UNKNOWN_CATALOG_CODE',
  'CATALOG_UNAVAILABLE',
  'EXCLUDED_CATALOG_CODE',
  'INVALID_AMOUNT_UNIT',
  'INVALID_CURRENCY_TARGET',
  'MISSING_TARGET_CURRENCY',
  'INCOMPATIBLE_TARGET_CURRENCY',
  'INVALID_CURRENCY_EVIDENCE',
  'INCOMPATIBLE_SOURCE_CURRENCY',
  'UNKNOWN_CURRENCY',
  'INCOMPATIBLE_PROFILE',
] as const;

export type TracfinConfigurationErrorCode = (typeof TRACFIN_CONFIGURATION_ERROR_CODES)[number];

export function isKnownConfigurationErrorCode(code: string): code is TracfinConfigurationErrorCode {
  return (TRACFIN_CONFIGURATION_ERROR_CODES as readonly string[]).includes(code);
}

/** Why a PUT failed, in the terms the screen reacts to. */
export type TracfinSaveFailure =
  /** 409: the revision moved. The form is kept. */
  | { kind: 'conflict' }
  /** 400 with diagnostics: `invalid TRACFIN configuration: CODE /field; ...`. */
  | { kind: 'invalid'; errors: TracfinConfigurationError[]; message: string }
  /** 400 whose message carries no diagnostic (invalid settings answer a bare 400). */
  | { kind: 'rejected'; message: string | null }
  | { kind: 'forbidden' }
  | { kind: 'too_large' }
  | { kind: 'unavailable'; message: string | null };

export function classifySaveFailure(error: unknown): TracfinSaveFailure {
  if (!isTracfinRequestError(error)) {
    return { kind: 'unavailable', message: error instanceof Error ? error.message : null };
  }
  const { kind, message } = error.error;
  switch (kind) {
    case 'conflict':
      return { kind: 'conflict' };
    case 'forbidden':
      return { kind: 'forbidden' };
    case 'too_large':
      return { kind: 'too_large' };
    case 'bad_request': {
      const errors = parseTracfinConfigurationErrors(message ?? '');
      return errors.length > 0 ? { kind: 'invalid', errors, message: message ?? '' } : { kind: 'rejected', message };
    }
    default:
      return { kind: 'unavailable', message };
  }
}

export type TracfinErrorPlacement = {
  /** Distinct codes by mapping id: every mapping whose target is the error's field gets the code. */
  byMappingId: Record<string, string[]>;
  /** Distinct codes by settings field id. */
  bySettingField: Record<string, string[]>;
  /** Codes that name no field, or a field that is neither a mapping target nor a setting. */
  general: TracfinConfigurationError[];
};

function addDistinct(record: Record<string, string[]>, key: string, code: string) {
  const codes = record[key] ?? [];
  if (!codes.includes(code)) record[key] = [...codes, code];
}

/**
 * Attaches each `{ code, fieldId }` to every mapping whose `target_field` is the field and to the
 * setting field when the field is one; whatever cannot be placed stays visible in the page-level list.
 */
export function placeConfigurationErrors({
  errors,
  mappings,
  settingFieldIds,
}: {
  errors: readonly TracfinConfigurationError[];
  mappings: readonly TracfinMapping[];
  settingFieldIds: ReadonlySet<string>;
}): TracfinErrorPlacement {
  const placement: TracfinErrorPlacement = { byMappingId: {}, bySettingField: {}, general: [] };
  for (const error of errors) {
    let placed = false;
    if (error.fieldId !== null) {
      for (const mapping of mappings) {
        if (mapping.target_field !== error.fieldId) continue;
        addDistinct(placement.byMappingId, mapping.id, error.code);
        placed = true;
      }
      if (settingFieldIds.has(error.fieldId)) {
        addDistinct(placement.bySettingField, error.fieldId, error.code);
        placed = true;
      }
    }
    if (!placed) placement.general.push(error);
  }
  return placement;
}
