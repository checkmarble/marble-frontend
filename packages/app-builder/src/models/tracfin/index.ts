import { isHttpError, marbleApiErrorMessage } from '@app-builder/models/http-errors';
import {
  BAD_REQUEST,
  CONFLICT,
  FORBIDDEN,
  NOT_FOUND,
  REQUEST_TIMEOUT,
  REQUEST_TOO_LONG,
  UNPROCESSABLE_ENTITY,
} from '@app-builder/utils/http/http-status-codes';
import type {
  TracfinAttachmentDto,
  TracfinBlockDto,
  TracfinCatalogDto,
  TracfinCatalogFieldDto,
  TracfinChangeInputDto,
  TracfinConfigurationDto,
  TracfinConfigurationInputDto,
  TracfinContextDto,
  TracfinContextRootDto,
  TracfinCreateDraftInputDto,
  TracfinDiagnosticDto,
  TracfinDraftDto,
  TracfinDraftInputDto,
  TracfinExportDto,
  TracfinFieldInputDto,
  TracfinFieldRefDto,
  TracfinLimitsDto,
  TracfinMappingDto,
  TracfinMappingSourceDto,
  TracfinNavigateInputDto,
  TracfinNavigationPageDto,
  TracfinOriginDto,
  TracfinPathStepDto,
  TracfinPrefillProposalDto,
  TracfinPrefillResultDto,
  TracfinProfileDto,
  TracfinReferenceDto,
  TracfinRevisionInputDto,
  TracfinSelectionDto,
  TracfinSettingInputDto,
  TracfinSourceRefDto,
  TracfinValidationDto,
  TracfinValidationLayerDto,
  TracfinValueDto,
} from 'marble-api';

/**
 * The draft document, the configuration and every command keep the exact server JSON shape
 * (snake_case, server IDs): the server refuses unknown members, so there is no camelCase adapter
 * for the document tree. These are plain aliases of the generated DTOs.
 */
export type TracfinFieldRef = TracfinFieldRefDto;
export type TracfinReference = TracfinReferenceDto;
export type TracfinPathStep = TracfinPathStepDto;
export type TracfinSourceRef = TracfinSourceRefDto;
export type TracfinOrigin = TracfinOriginDto;
export type TracfinValue = TracfinValueDto;
export type TracfinAttachment = TracfinAttachmentDto;
export type TracfinSelection = TracfinSelectionDto;
export type TracfinBlock = TracfinBlockDto;
export type TracfinDiagnostic = TracfinDiagnosticDto;
export type TracfinValidationLayer = TracfinValidationLayerDto;
export type TracfinValidation = TracfinValidationDto;
export type TracfinMapping = TracfinMappingDto;
export type TracfinMappingSource = TracfinMappingSourceDto;
export type TracfinConfiguration = TracfinConfigurationDto;
export type TracfinExport = TracfinExportDto;
export type TracfinDraft = TracfinDraftDto;
export type TracfinFieldInput = TracfinFieldInputDto;
export type TracfinSettingInput = TracfinSettingInputDto;
export type TracfinChangeInput = TracfinChangeInputDto;
export type TracfinChangeAction = TracfinChangeInputDto['action'];
export type TracfinConfigurationInput = TracfinConfigurationInputDto;
export type TracfinDraftInput = TracfinDraftInputDto;
export type TracfinCreateDraftInput = TracfinCreateDraftInputDto;
export type TracfinRevisionInput = TracfinRevisionInputDto;
export type TracfinContext = TracfinContextDto;
export type TracfinContextRoot = TracfinContextRootDto;
export type TracfinNavigateInput = TracfinNavigateInputDto;
export type TracfinNavigationPage = TracfinNavigationPageDto;
export type TracfinPrefillProposal = TracfinPrefillProposalDto;
export type TracfinPrefillResult = TracfinPrefillResultDto;
export type TracfinCatalog = TracfinCatalogDto;
export type TracfinProfile = TracfinProfileDto;
export type TracfinCatalogField = TracfinCatalogFieldDto;
export type TracfinLimits = TracfinLimitsDto;

/** Limits of the profile that the UI enforces before the server does. */
export const TRACFIN_MAX_PRINCIPAL_OPERATIONS = 30;
export const TRACFIN_MAX_PIECES = 15;

/**
 * Operation fields that accept an internal reference or free text, even when the text is numeric
 * (catalog `value_kind: text_or_reference`).
 */
export const TRACFIN_TEXT_OR_REFERENCE_FIELDS = [
  '/ds/operations/operation/emetteurTypeEmetteur',
  '/ds/operations/operation/refFinanciereEmission',
  '/ds/operations/operation/beneficiaireTypeBeneficiaire',
  '/ds/operations/operation/refFinanciereReception',
] as const;

const CANONICAL_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/**
 * True for the canonical lowercase 8-4-4-4-12 form. The server compares `source_file_id` and
 * `selection.decision_id` as strings, so only the form it returned is accepted.
 */
export function isCanonicalUuid(id: string): boolean {
  return CANONICAL_UUID.test(id);
}

export const tracfinApiErrorKinds = [
  'bad_request',
  'forbidden',
  'not_found',
  'timeout',
  'conflict',
  'too_large',
  'unprocessable',
  'server',
  'network',
] as const;

export type TracfinApiErrorKind = (typeof tracfinApiErrorKinds)[number];

/**
 * Thrown HttpErrors do not reliably cross the server-function boundary, so TRACFIN server functions
 * return this plain, serializable description instead.
 */
export type TracfinApiError = {
  kind: TracfinApiErrorKind;
  status: number | null;
  message: string | null;
  errorCode?: string;
};

export type TracfinResult<T> = { ok: true; data: T } | { ok: false; error: TracfinApiError };

function kindFromStatus(status: number): TracfinApiErrorKind {
  switch (status) {
    case BAD_REQUEST:
      return 'bad_request';
    case FORBIDDEN:
      return 'forbidden';
    case NOT_FOUND:
      return 'not_found';
    case REQUEST_TIMEOUT:
      return 'timeout';
    case CONFLICT:
      return 'conflict';
    case REQUEST_TOO_LONG:
      return 'too_large';
    case UNPROCESSABLE_ENTITY:
      return 'unprocessable';
    default:
      // 5xx, but also any status the contract does not name (401 after a failed refresh, 429, ...).
      return 'server';
  }
}

function errorCodeOf(data: unknown): string | undefined {
  if (typeof data !== 'object' || data === null || !('error_code' in data)) return undefined;
  const code = data.error_code;
  // The backend always writes `error_code`, as an empty string when it has none.
  return typeof code === 'string' && code !== '' ? code : undefined;
}

/** An HttpError is classified by status; anything else (fetch failure, aborted request) is a network error. */
export function adaptTracfinApiError(error: unknown): TracfinApiError {
  if (!isHttpError(error)) {
    return { kind: 'network', status: null, message: error instanceof Error && error.message ? error.message : null };
  }
  const adapted: TracfinApiError = {
    kind: kindFromStatus(error.status),
    status: error.status,
    message: marbleApiErrorMessage(error),
  };
  const errorCode = errorCodeOf(error.data);
  if (errorCode) adapted.errorCode = errorCode;
  return adapted;
}

export type TracfinConfigurationError = { code: string; fieldId: string | null };

const CONFIGURATION_ERROR_PREFIX = 'invalid TRACFIN configuration:';
// `CODE /target/field`, with an optional wrapping suffix (`: bad parameter`) on the last item.
const CONFIGURATION_ERROR_ITEM = /^([A-Z][A-Z0-9_]*)(?:\s+([^\s:;]+))?\s*(?::.*)?$/;

/**
 * Reads the 400 message of a rejected configuration PUT:
 * `invalid TRACFIN configuration: CODE /target/field; CODE2 /other: bad parameter`.
 * A diagnostic without a target field keeps its code and a `null` field. Returns `[]` when the
 * message is not a configuration error.
 */
export function parseTracfinConfigurationErrors(message: string): TracfinConfigurationError[] {
  const start = message.indexOf(CONFIGURATION_ERROR_PREFIX);
  if (start === -1) return [];
  const errors: TracfinConfigurationError[] = [];
  for (const item of message.slice(start + CONFIGURATION_ERROR_PREFIX.length).split(';')) {
    const match = CONFIGURATION_ERROR_ITEM.exec(item.trim());
    if (match?.[1]) errors.push({ code: match[1], fieldId: match[2] ?? null });
  }
  return errors;
}

/**
 * Runs a repository call and describes its outcome as a `TracfinResult`. A redirect (an
 * authentication redirect, for instance) is not a failure of the request and is re-thrown.
 */
export async function toTracfinResult<T>(run: () => Promise<T>): Promise<TracfinResult<T>> {
  try {
    return { ok: true, data: await run() };
  } catch (error) {
    if (error instanceof Response && error.status >= 300 && error.status < 400) throw error;
    return { ok: false, error: adaptTracfinApiError(error) };
  }
}

/**
 * Thrown by the query and mutation hooks when a server function returned a failed result, so React
 * Query sees a failure while callers can still branch on `error.kind` (for instance `conflict`).
 */
export class TracfinRequestError extends Error {
  override name = 'TracfinRequestError';

  constructor(readonly error: TracfinApiError) {
    super(error.message ?? `TRACFIN request failed (${error.kind})`);
  }
}

export function isTracfinRequestError(error: unknown): error is TracfinRequestError {
  return error instanceof TracfinRequestError;
}

export function unwrapTracfinResult<T>(result: TracfinResult<T>): T {
  if (result.ok) return result.data;
  throw new TracfinRequestError(result.error);
}

/** For a resource whose absence is a normal state (no draft yet, no configuration yet): 404 is `null`. */
export function unwrapTracfinResultOrNull<T>(result: TracfinResult<T>): T | null {
  if (!result.ok && result.error.kind === 'not_found') return null;
  return unwrapTracfinResult(result);
}
