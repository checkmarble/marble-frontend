import { tracfinConfigurationFixture, tracfinDraftFixture } from '@app-builder/models/tracfin/__fixtures__';
import { describe, expect, it } from 'vitest';
import {
  tracfinCaseInputSchema,
  tracfinChangeInputSchema,
  tracfinConfigurationInputSchema,
  tracfinCreateDraftInputSchema,
  tracfinNavigateInputSchema,
  tracfinPatchDraftInputSchema,
  tracfinRevisionInputSchema,
} from './tracfin';

const caseId = tracfinDraftFixture.case_id;
const blockId = tracfinDraftFixture.document.root.id;
const root = { id: 'root', table: 'users', record_id: 'user_8841' };
const selection = { mapping_id: 'map-user-last-name', root };

const setField = {
  action: 'set_field' as const,
  field: { block_id: blockId, field_id: '/ds/analyse' },
  value: { kind: 'text' as const, text: 'Analyse' },
};

describe('case ids', () => {
  it('accepts a UUID and refuses anything else', () => {
    expect(tracfinCaseInputSchema.safeParse({ caseId }).success).toBe(true);
    expect(tracfinCaseInputSchema.safeParse({ caseId: 'not-a-uuid' }).success).toBe(false);
    expect(tracfinCaseInputSchema.safeParse({ caseId: '' }).success).toBe(false);
    expect(tracfinCaseInputSchema.safeParse({}).success).toBe(false);
  });

  it('applies to every case payload', () => {
    const body = { expected_revision: 1 };
    expect(tracfinRevisionInputSchema.safeParse({ caseId: 'x', body }).success).toBe(false);
    expect(tracfinCreateDraftInputSchema.safeParse({ caseId: 'x', body: { declarant_is_actor: false } }).success).toBe(
      false,
    );
    expect(
      tracfinPatchDraftInputSchema.safeParse({ caseId: 'x', body: { ...body, changes: [setField] } }).success,
    ).toBe(false);
    expect(
      tracfinNavigateInputSchema.safeParse({ caseId: 'x', body: { selection, step_id: 'employer' } }).success,
    ).toBe(false);
  });
});

describe('unknown members', () => {
  it('are refused at the top level of a payload', () => {
    expect(tracfinCaseInputSchema.safeParse({ caseId, organizationId: caseId }).success).toBe(false);
    expect(tracfinRevisionInputSchema.safeParse({ caseId, body: { expected_revision: 2 }, extra: true }).success).toBe(
      false,
    );
  });

  it('are refused in a body', () => {
    expect(tracfinRevisionInputSchema.safeParse({ caseId, body: { expected_revision: 2, revision: 2 } }).success).toBe(
      false,
    );
    expect(
      tracfinCreateDraftInputSchema.safeParse({ caseId, body: { declarant_is_actor: true, case_id: caseId } }).success,
    ).toBe(false);
  });

  it('are refused deep inside a change', () => {
    const patch = (change: object) =>
      tracfinPatchDraftInputSchema.safeParse({ caseId, body: { expected_revision: 3, changes: [change] } }).success;

    expect(patch(setField)).toBe(true);
    expect(patch({ ...setField, unexpected: 1 })).toBe(false);
    expect(patch({ ...setField, field: { ...setField.field, index: 0 } })).toBe(false);
    expect(patch({ ...setField, value: { ...setField.value, origin: { source: 'manual' } } })).toBe(false);
    expect(
      patch({ action: 'set_selection', block_id: blockId, selection: { ...selection, root: { ...root, extra: 'x' } } }),
    ).toBe(false);
    expect(patch({ action: 'set_relation', relation: { block_id: blockId, label: 'x' } })).toBe(false);
  });

  it('are refused in a navigation selection and in a configuration', () => {
    expect(
      tracfinNavigateInputSchema.safeParse({
        caseId,
        body: { selection: { ...selection, bindings: [{ ...root, kind: 'x' }] }, step_id: 'employer' },
      }).success,
    ).toBe(false);

    const body = {
      expected_revision: 0,
      settings: [{ field: { field_id: '/ds/organisme/libelle' }, value: { kind: 'text' as const, text: 'Bank' } }],
      mappings: [],
    };
    expect(tracfinConfigurationInputSchema.safeParse(body).success).toBe(true);
    expect(tracfinConfigurationInputSchema.safeParse({ ...body, org_id: caseId }).success).toBe(false);
    expect(
      tracfinConfigurationInputSchema.safeParse({
        ...body,
        settings: [{ field: { field_id: '/ds/organisme/libelle', block_id: 'b' }, value: body.settings[0]?.value }],
      }).success,
    ).toBe(false);
  });
});

describe('changes', () => {
  it('cannot be empty', () => {
    expect(
      tracfinPatchDraftInputSchema.safeParse({ caseId, body: { expected_revision: 3, changes: [] } }).success,
    ).toBe(false);
  });

  it('must name a known action', () => {
    expect(tracfinChangeInputSchema.safeParse({ ...setField, action: 'move_block' }).success).toBe(false);
    expect(tracfinChangeInputSchema.safeParse({ field: setField.field }).success).toBe(false);
  });

  it('refuse a source file or decision that is not a canonical lowercase UUID', () => {
    const file = '0b1c8a7e-5c1f-4d3a-9e2b-6f7a8b9c0d1e';
    expect(
      tracfinChangeInputSchema.safeParse({ action: 'add_block', block_id: 'piece-temp', source_file_id: file }).success,
    ).toBe(true);
    expect(
      tracfinChangeInputSchema.safeParse({
        action: 'add_block',
        block_id: 'piece-temp',
        source_file_id: file.toUpperCase(),
      }).success,
    ).toBe(false);
    expect(
      tracfinChangeInputSchema.safeParse({ action: 'add_block', block_id: 'piece-temp', source_file_id: 'file-1' })
        .success,
    ).toBe(false);
    expect(
      tracfinChangeInputSchema.safeParse({
        action: 'set_selection',
        block_id: blockId,
        selection: { ...selection, decision_id: file, historical_type: 'transactions' },
      }).success,
    ).toBe(true);
    expect(
      tracfinChangeInputSchema.safeParse({
        action: 'set_selection',
        block_id: blockId,
        selection: { ...selection, decision_id: file.toUpperCase(), historical_type: 'transactions' },
      }).success,
    ).toBe(false);
  });

  it('keep decimals as strings', () => {
    const decimal = (value: unknown) =>
      tracfinChangeInputSchema.safeParse({
        action: 'set_field',
        field: setField.field,
        value: { kind: 'decimal', decimal: value },
      }).success;
    expect(decimal('1234.50')).toBe(true);
    expect(decimal(1234.5)).toBe(false);
  });
});

describe('revisions', () => {
  it('must be an integer of at least 1 for a draft, 0 to create a configuration', () => {
    const revision = (expected_revision: number) =>
      tracfinRevisionInputSchema.safeParse({ caseId, body: { expected_revision } }).success;
    expect(revision(1)).toBe(true);
    expect(revision(0)).toBe(false);
    expect(revision(-1)).toBe(false);
    expect(revision(1.5)).toBe(false);

    const configuration = (expected_revision: number) =>
      tracfinConfigurationInputSchema.safeParse({ expected_revision, settings: [], mappings: [] }).success;
    expect(configuration(0)).toBe(true);
    expect(configuration(-1)).toBe(false);
  });

  it('is required, so that an omitted guard is never read as a creation', () => {
    expect(tracfinRevisionInputSchema.safeParse({ caseId, body: {} }).success).toBe(false);
    expect(tracfinConfigurationInputSchema.safeParse({ settings: [], mappings: [] }).success).toBe(false);
  });

  it('keeps `false` for declarant_is_actor, which the server requires', () => {
    expect(tracfinCreateDraftInputSchema.safeParse({ caseId, body: { declarant_is_actor: false } }).success).toBe(true);
    expect(tracfinCreateDraftInputSchema.safeParse({ caseId, body: {} }).success).toBe(false);
  });
});

describe('navigation', () => {
  const navigate = (body: object) => tracfinNavigateInputSchema.safeParse({ caseId, body }).success;

  it('requires a selection and a step', () => {
    expect(navigate({ selection, step_id: 'employer' })).toBe(true);
    expect(navigate({ selection })).toBe(false);
    expect(navigate({ step_id: 'employer' })).toBe(false);
    expect(navigate({ selection, step_id: '' })).toBe(false);
  });

  it('bounds the limit to 1..100', () => {
    expect(navigate({ selection, step_id: 'employer', limit: 1 })).toBe(true);
    expect(navigate({ selection, step_id: 'employer', limit: 100 })).toBe(true);
    expect(navigate({ selection, step_id: 'employer', limit: 0 })).toBe(false);
    expect(navigate({ selection, step_id: 'employer', limit: 101 })).toBe(false);
    expect(navigate({ selection, step_id: 'employer', limit: 25.5 })).toBe(false);
  });

  it('requires a non-empty cursor of at most 4096 characters', () => {
    expect(navigate({ selection, step_id: 'employer', cursor: 'abc' })).toBe(true);
    expect(navigate({ selection, step_id: 'employer', cursor: 'a'.repeat(4096) })).toBe(true);
    expect(navigate({ selection, step_id: 'employer', cursor: '' })).toBe(false);
    expect(navigate({ selection, step_id: 'employer', cursor: 'a'.repeat(4097) })).toBe(false);
  });
});

describe('fixtures', () => {
  it('the configuration fixture, as the settings page will resubmit it, is a valid PUT body', () => {
    const settings = Object.entries(tracfinConfigurationFixture.settings.root.children?.[0]?.fields ?? {}).flatMap(
      ([fieldId, values]) =>
        values
          .filter((value) => value.kind === 'text')
          .map((value) => ({
            field: { field_id: fieldId },
            value: { kind: 'text' as const, text: value.text },
          })),
    );
    expect(settings.length).toBeGreaterThan(0);

    const parsed = tracfinConfigurationInputSchema.safeParse({
      expected_revision: tracfinConfigurationFixture.revision,
      settings,
      mappings: tracfinConfigurationFixture.mappings,
    });
    expect(parsed.error?.issues).toBeUndefined();
    expect(parsed.success).toBe(true);
  });

  it('a selection stored in the draft fixture is a valid selection to send back', () => {
    const blocks = tracfinDraftFixture.document.root.children?.find((block) => block.catalog_id === '/ds/personnes');
    const stored = blocks?.children?.[0]?.children?.find((block) => block.selection)?.selection;
    expect(stored).toBeDefined();
    expect(
      tracfinNavigateInputSchema.safeParse({ caseId, body: { selection: stored, step_id: 'employer' } }).success,
    ).toBe(true);
  });
});
