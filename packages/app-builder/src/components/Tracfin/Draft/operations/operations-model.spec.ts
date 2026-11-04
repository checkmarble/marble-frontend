import type { TracfinDraft, TracfinMapping } from '@app-builder/models/tracfin';
import { describe, expect, it } from 'vitest';
import { DECISION, decision, line, operationsDraft } from '../test-utils/operations-test-data';
import { summarizeTrigger } from './decision-summary';
import { duplicatePeerPositions } from './duplicates';
import { operationCapacity, principalOperations, selectedDecisionIds } from './operations-model';
import { planAddOperations } from './plan-add-operations';
import { buildSnapshotSelection, snapshotMappingFor } from './snapshot-selection';
import { effectiveMode, modeOfState } from './text-reference-mode';

const manyLines = (count: number) =>
  Array.from({ length: count }, (_, index) =>
    line(`line-${index}`, `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`),
  );

describe('capacity', () => {
  it('counts the principal operations and what is left', () => {
    const draft = operationsDraft({ lines: manyLines(12) });
    expect(operationCapacity(draft.document.root)).toEqual({ count: 12, max: 30, remaining: 18, overMaximum: false });
  });

  it('is empty without a /ds/operations block', () => {
    expect(operationCapacity(operationsDraft().document.root)).toMatchObject({ count: 0, remaining: 30 });
  });

  it('never goes negative above the maximum, and flags it', () => {
    const draft = operationsDraft({ lines: manyLines(32) });
    expect(operationCapacity(draft.document.root)).toEqual({ count: 32, max: 30, remaining: 0, overMaximum: true });
    expect(principalOperations(draft.document.root)).toHaveLength(32);
  });

  it('lists the decisions already on a line, ignoring lines without one', () => {
    const draft = operationsDraft({ lines: [line('a', DECISION.one), line('b'), line('c', DECISION.two)] });
    expect([...selectedDecisionIds(draft.document.root)]).toEqual([DECISION.one, DECISION.two]);
  });
});

describe('snapshot mapping lookup', () => {
  const mappings: TracfinMapping[] = [
    { id: 'ingested', target_field: '/x', source: { kind: 'ingested', table: 'Transfer' } },
    { id: 'other', target_field: '/x', source: { kind: 'decision_snapshot', historical_type: 'Other' } },
    { id: 'first', target_field: '/x', source: { kind: 'decision_snapshot', historical_type: 'Transfer' } },
    { id: 'second', target_field: '/y', source: { kind: 'decision_snapshot', historical_type: 'Transfer' } },
  ];

  it('takes the first decision_snapshot mapping of the same historical type, never an ingested one', () => {
    expect(snapshotMappingFor(mappings, 'Transfer')?.id).toBe('first');
    expect(snapshotMappingFor(mappings, 'Other')?.id).toBe('other');
  });

  it('finds none when the type has no snapshot mapping', () => {
    expect(snapshotMappingFor(mappings, 'Unknown')).toBeNull();
    expect(snapshotMappingFor([], 'Transfer')).toBeNull();
  });
});

describe('selection body', () => {
  it('carries the mapping, the decision id as listed and the historical type, without bindings', () => {
    const selection = buildSnapshotSelection({ mappingId: 'm', decisionId: DECISION.three, historicalType: 'Removed' });
    expect(selection).toEqual({
      mapping_id: 'm',
      root: { id: 'root', table: 'Removed' },
      decision_id: DECISION.three,
      historical_type: 'Removed',
    });
    expect(Object.keys(selection)).not.toContain('bindings');
    expect(Object.keys(selection)).not.toContain('snapshot_field');
  });
});

describe('planAddOperations', () => {
  const plan = (draft: TracfinDraft, decisions: { id: string; triggerObjectType: string }[]) =>
    planAddOperations({ draft, decisions });

  it('adds a line then its selection per decision, in order', () => {
    const result = plan(operationsDraft({ lines: [] }), [
      { id: DECISION.one, triggerObjectType: 'Transfer' },
      { id: DECISION.two, triggerObjectType: 'DeletedType' },
    ]);
    expect(result.ops.map((op) => op.type)).toEqual(['add_block', 'set_selection', 'add_block', 'set_selection']);
    expect(result.added.map((entry) => entry.linked)).toEqual([true, true]);
    expect(result.refused).toEqual([]);
  });

  it('adds a line without selection when no snapshot mapping exists for the type', () => {
    const result = plan(operationsDraft({ lines: [] }), [{ id: DECISION.one, triggerObjectType: 'Nowhere' }]);
    expect(result.ops.map((op) => op.type)).toEqual(['add_block']);
    expect(result.added).toEqual([{ decisionId: DECISION.one, historicalType: 'Nowhere', linked: false }]);
  });

  it('refuses a decision already selected, or listed twice, before any request', () => {
    const result = plan(operationsDraft({ lines: [line('a', DECISION.one)] }), [
      { id: DECISION.one, triggerObjectType: 'Transfer' },
      { id: DECISION.two, triggerObjectType: 'Transfer' },
      { id: DECISION.two, triggerObjectType: 'Transfer' },
    ]);
    expect(result.refused).toEqual([
      { decisionId: DECISION.one, reason: 'already_selected' },
      { decisionId: DECISION.two, reason: 'already_selected' },
    ]);
    expect(result.added.map((entry) => entry.decisionId)).toEqual([DECISION.two]);
  });

  it('refuses what exceeds the remaining capacity and plans nothing for a full draft', () => {
    const full = plan(operationsDraft({ lines: manyLines(30) }), [{ id: DECISION.one, triggerObjectType: 'Transfer' }]);
    expect(full.ops).toEqual([]);
    expect(full.refused).toEqual([{ decisionId: DECISION.one, reason: 'capacity' }]);

    const nearly = plan(operationsDraft({ lines: manyLines(29) }), [
      { id: DECISION.one, triggerObjectType: 'Transfer' },
      { id: DECISION.two, triggerObjectType: 'Transfer' },
    ]);
    expect(nearly.added).toHaveLength(1);
    expect(nearly.refused).toEqual([{ decisionId: DECISION.two, reason: 'capacity' }]);
  });
});

describe('text or reference mode', () => {
  const ref = { kind: 'reference', reference: { block_id: 'p' } } as const;

  it('lets the value shown decide, numeric text included', () => {
    expect(effectiveMode({ state: { kind: 'text', text: '12345' }, saved: null })).toBe('text');
    expect(effectiveMode({ state: ref, saved: null })).toBe('reference');
  });

  it('starts from the saved value: a reference whose picker was just emptied stays in reference mode', () => {
    expect(effectiveMode({ state: { kind: 'cleared' }, saved: ref })).toBe('reference');
    expect(effectiveMode({ state: { kind: 'empty' }, saved: { kind: 'text', text: '99' } })).toBe('text');
    expect(effectiveMode({ state: { kind: 'cleared' }, saved: null })).toBe('text');
  });

  it('keeps the mode the field was last seen in once its value is gone', () => {
    expect(effectiveMode({ state: { kind: 'cleared' }, saved: { kind: 'cleared' }, remembered: 'reference' })).toBe(
      'reference',
    );
    // ... but a value shown wins over what was remembered.
    expect(effectiveMode({ state: { kind: 'text', text: 'x' }, saved: null, remembered: 'reference' })).toBe('text');
  });

  it('follows the analyst choice over the stored value', () => {
    const stored = { kind: 'text', text: 'x' } as const;
    expect(effectiveMode({ state: stored, saved: stored, chosen: 'reference' })).toBe('reference');
    expect(effectiveMode({ state: ref, saved: ref, chosen: 'text' })).toBe('text');
    expect(effectiveMode({ state: { kind: 'empty' }, saved: null, chosen: 'reference' })).toBe('reference');
  });

  it('reads the representation of a value, nothing for an empty one', () => {
    expect(modeOfState(ref)).toBe('reference');
    expect(modeOfState({ kind: 'text', text: 'x' })).toBe('text');
    expect(modeOfState({ kind: 'text', text: '' })).toBeNull();
    expect(modeOfState({ kind: 'cleared' })).toBeNull();
    expect(modeOfState(null)).toBeNull();
  });
});

describe('duplicate peers', () => {
  it('reads the other lines from the diagnostic sources', () => {
    const lines = [line('a', DECISION.one), line('b', DECISION.two), line('c', DECISION.three)];
    const diagnostic = {
      sources: [
        { kind: 'decision_snapshot', decision_id: DECISION.one },
        { kind: 'decision_snapshot', decision_id: DECISION.three },
      ],
    };
    expect(duplicatePeerPositions(diagnostic, lines[0]!, lines)).toEqual([3]);
    expect(duplicatePeerPositions({}, lines[0]!, lines)).toEqual([]);
  });
});

describe('trigger summary', () => {
  it('keeps the object id as recorded and up to three other scalar fields', () => {
    const summary = summarizeTrigger({
      object_id: 'T-77',
      amount: 12.5,
      label: 'x'.repeat(60),
      nested: { a: 1 } as never,
      empty: '',
      a: 'one',
      b: 'two',
    });
    expect(summary.objectId).toBe('T-77');
    expect(summary.fields.map((field) => field.name)).toEqual(['amount', 'label', 'a']);
    expect(summary.fields[1]!.value).toHaveLength(40);
  });

  it('tolerates a trigger object without an id', () => {
    expect(summarizeTrigger({ amount: 1 }).objectId).toBeNull();
    expect(decision(DECISION.one, 'T', 'x').triggerObject['object_id']).toBe('x');
  });
});
