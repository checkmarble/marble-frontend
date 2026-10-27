import { adaptTracfinApiError, isTracfinRequestError, type TracfinApiError } from '@app-builder/models/tracfin';

/**
 * Why a PATCH did not go through, as the screen reacts to it:
 * - `conflict` (409): the draft changed elsewhere; compare before anything is re-sent.
 * - `invalid` (400): the server refused a change; the edits are kept, one can be discarded.
 * - `too_large` (413): the technical size limit of a request.
 * - `unavailable` (408, 5xx, network): the outcome is uncertain; read the draft again.
 * - `rejected`: anything else (403, 404, 422): the message is shown.
 */
export type TracfinSaveFailure =
  | { kind: 'conflict' }
  | { kind: 'invalid'; message: string | null }
  | { kind: 'too_large' }
  | { kind: 'unavailable'; message: string | null }
  | { kind: 'rejected'; message: string | null };

export function toApiError(error: unknown): TracfinApiError {
  return isTracfinRequestError(error) ? error.error : adaptTracfinApiError(error);
}

export function classifySaveFailure(error: TracfinApiError): TracfinSaveFailure {
  switch (error.kind) {
    case 'conflict':
      return { kind: 'conflict' };
    case 'bad_request':
      return { kind: 'invalid', message: error.message };
    case 'too_large':
      return { kind: 'too_large' };
    case 'timeout':
    case 'server':
    case 'network':
      return { kind: 'unavailable', message: error.message };
    case 'forbidden':
    case 'not_found':
    case 'unprocessable':
      return { kind: 'rejected', message: error.message };
  }
}
