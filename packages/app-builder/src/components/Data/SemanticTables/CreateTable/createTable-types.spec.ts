import { tableLifecycleSchema } from '@app-builder/schemas/data';
import { describe, expect, it } from 'vitest';
import { defaultCreateTableFormValues, validateValues } from './createTable-types';

describe('lifecycle duration validation', () => {
  it('accepts null as an explicit duration clear in the server payload', () => {
    expect(
      tableLifecycleSchema.safeParse({
        enabled: true,
        delete_stale_rows_after: null,
        delete_active_rows_after: null,
      }).success,
    ).toBe(true);
  });

  it('rejects browser-invalid numeric input instead of treating it as an empty duration', () => {
    const result = validateValues(
      {
        ...defaultCreateTableFormValues,
        name: 'transactions',
        lifecycle: {
          ...defaultCreateTableFormValues.lifecycle,
          deleteActiveRowsAfter: { unit: 'months', invalid: true },
        },
      },
      'table',
      ((key: string) => key) as never,
      true,
    );

    expect(result).toEqual({
      ok: false,
      errors: [
        {
          kind: 'table',
          field: 'lifecycle',
          message: 'data:lifecycle.validation_positive_integer',
        },
      ],
    });
  });

  it('allows an intentionally empty lifecycle duration', () => {
    const result = validateValues(
      { ...defaultCreateTableFormValues, name: 'transactions' },
      'table',
      ((key: string) => key) as never,
      true,
    );

    expect(result).toEqual({ ok: true });
  });
});
