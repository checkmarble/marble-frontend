import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';
import { z } from 'zod/v4';

import { collectFormValidationIssues } from './screening-form-validation';

const t = ((key: string) => {
  if (key === 'scenarios:sanction.match_settings.title') return 'Matching settings';
  if (key === 'scenarios:edit_sanction.required_fields_error') return 'Please fill at least one field';
  if (key === 'scenarios:edit_screening.name_required') return 'Name is required';
  return key;
}) as TFunction;

const schema = z.object({
  name: z.string().min(1),
  entityType: z.enum(['Person', 'Organization', 'Vehicle', 'Thing']).optional(),
  query: z.record(z.string(), z.any()),
});

describe('collectFormValidationIssues', () => {
  it('returns section source for missing match criteria', () => {
    const issues = collectFormValidationIssues({ name: 'Screening', entityType: 'Person', query: {} }, schema, t);

    expect(issues).toEqual([
      {
        message: 'Matching settings: Please fill at least one field',
        source: { type: 'section', section: 'matchSettings' },
      },
    ]);
  });

  it('returns field source for empty name', () => {
    const issues = collectFormValidationIssues(
      { name: '', entityType: 'Person', query: { name: { id: '1', name: 'FieldAccess', children: [] } } },
      schema,
      t,
    );

    expect(issues).toContainEqual({
      message: 'Name is required',
      source: { type: 'field', field: 'name' },
    });
  });
});
