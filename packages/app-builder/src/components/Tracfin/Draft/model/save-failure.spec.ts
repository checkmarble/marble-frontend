import { tracfinApiErrorKinds } from '@app-builder/models/tracfin';
import { describe, expect, it } from 'vitest';
import { classifySaveFailure } from './save-failure';

describe('classifySaveFailure', () => {
  it('reads every kind of error', () => {
    const kinds = Object.fromEntries(
      tracfinApiErrorKinds.map((kind) => [kind, classifySaveFailure({ kind, status: null, message: 'm' }).kind]),
    );
    expect(kinds).toEqual({
      bad_request: 'invalid',
      forbidden: 'rejected',
      not_found: 'rejected',
      timeout: 'unavailable',
      conflict: 'conflict',
      too_large: 'too_large',
      unprocessable: 'rejected',
      server: 'unavailable',
      network: 'unavailable',
    });
  });
});
