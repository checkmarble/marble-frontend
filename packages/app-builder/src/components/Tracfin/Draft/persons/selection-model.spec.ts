import type { TracfinMapping } from '@app-builder/models/tracfin';
import { tracfinConfigurationFixture } from '@app-builder/models/tracfin/__fixtures__';
import { describe, expect, it } from 'vitest';
import { personsTestIndex } from '../test-utils/persons-test-data';
import {
  bindingsAbove,
  bindingsOf,
  buildSelection,
  chooseRecord,
  clearRecord,
  descendantIds,
  groupByRootTable,
  isStepReachable,
  mappingsOwnedBy,
  mergePathSteps,
  rootStep,
} from './selection-model';

const mappings = tracfinConfigurationFixture.mappings!;
const byId = (id: string) => mappings.find((mapping) => mapping.id === id)!;

describe('mappingsOwnedBy (compatible mappings of a block)', () => {
  it('keeps the ingested mappings whose target is owned by the block', () => {
    const civil = mappingsOwnedBy(mappings, personsTestIndex, '/ds/personnes/pp/etatCivil');
    expect(civil.map((mapping) => mapping.id)).toEqual([
      'map-user-last-name',
      'map-user-first-name',
      'map-user-gender',
    ]);
    const activity = mappingsOwnedBy(mappings, personsTestIndex, '/ds/personnes/pp/activite');
    expect(activity.map((mapping) => mapping.id)).toEqual(['map-employer-name', 'map-user-employer-name']);
  });

  it('owns an attribute of a support block through the block itself', () => {
    const card = mappingsOwnedBy(
      mappings,
      personsTestIndex,
      '/ds/personnes/pp/referencesFinancieres/referenceFinanciereNumeroCarteBancaire',
    );
    expect(card.map((mapping) => mapping.id)).toEqual(['map-card-number']);
  });

  it('never offers a decision snapshot mapping or a block nothing targets', () => {
    expect(mappingsOwnedBy(mappings, personsTestIndex, '/ds/operations/operation')).toEqual([]);
    expect(mappingsOwnedBy(mappings, personsTestIndex, '/ds/personnes/pnc')).toEqual([]);
  });
});

describe('groupByRootTable', () => {
  const company: TracfinMapping = {
    id: 'map-company',
    target_field: '/ds/personnes/pp/etatCivil/nomNaissance',
    source: { kind: 'ingested', table: 'companies', field: 'name' },
  };

  it('groups by the table the source starts from and keeps the current mapping as anchor', () => {
    const owned = [...mappingsOwnedBy(mappings, personsTestIndex, '/ds/personnes/pp/etatCivil'), company];
    const groups = groupByRootTable(owned, 'map-user-first-name');
    expect(groups.map((group) => group.table)).toEqual(['users', 'companies']);
    expect(groups[0]!.anchorMappingId).toBe('map-user-first-name');
    expect(groups[1]!.anchorMappingId).toBe('map-company');
  });

  it('anchors on the first mapping when the current one is not in the group', () => {
    const owned = mappingsOwnedBy(mappings, personsTestIndex, '/ds/personnes/pp/etatCivil');
    expect(groupByRootTable(owned, 'gone')[0]!.anchorMappingId).toBe('map-user-last-name');
  });
});

describe('mergePathSteps', () => {
  it('has no step for mappings read from the root record', () => {
    expect(mergePathSteps([byId('map-user-last-name')])).toEqual({ steps: [], inconsistent: [] });
  });

  it('chains the steps of a path, parents first', () => {
    const { steps } = mergePathSteps([byId('map-card-number')]);
    expect(steps.map((step) => [step.id, step.parent_id, step.direction])).toEqual([
      ['accounts', 'root', 'inverse'],
      ['cards', 'accounts', 'inverse'],
    ]);
    expect(steps[0]).not.toHaveProperty('record_id');
  });

  it('merges the paths of several mappings: a shared step once, branches after their parent', () => {
    const step = (id: string, parent: string, table: string) => ({
      id,
      parent_id: parent,
      link: id,
      direction: 'forward' as const,
      table,
    });
    const make = (id: string, path: ReturnType<typeof step>[]): TracfinMapping => ({
      id,
      target_field: '/x',
      source: { kind: 'ingested', table: 'users', field: 'f', path },
    });
    const merged = mergePathSteps([
      make('m1', [step('a', 'root', 'A'), step('b', 'a', 'B')]),
      make('m2', [step('a', 'root', 'A'), step('c', 'a', 'C')]),
      make('m3', [step('d', 'root', 'D')]),
    ]);
    expect(merged.steps.map((entry) => entry.id)).toEqual(['a', 'b', 'c', 'd']);
    expect(merged.inconsistent).toEqual([]);
  });

  it('flags a step id that two mappings use for different hops', () => {
    const make = (id: string, link: string): TracfinMapping => ({
      id,
      target_field: '/x',
      source: {
        kind: 'ingested',
        table: 'users',
        field: 'f',
        path: [{ id: 'a', parent_id: 'root', link, direction: 'forward', table: 'A' }],
      },
    });
    expect(mergePathSteps([make('m1', 'one'), make('m2', 'two')]).inconsistent).toEqual(['a']);
  });
});

describe('bindings', () => {
  const { steps } = mergePathSteps([byId('map-card-number')]);
  const [accounts, cards] = steps as [(typeof steps)[number], (typeof steps)[number]];

  it('finds the steps below a step', () => {
    expect([...descendantIds(steps, 'accounts')]).toEqual(['cards']);
    expect([...descendantIds(steps, 'cards')]).toEqual([]);
  });

  it('makes a step reachable once the record of its parent is chosen', () => {
    expect(isStepReachable(accounts, {})).toBe(true);
    expect(isStepReachable(cards, {})).toBe(false);
    expect(isStepReachable(cards, chooseRecord(steps, {}, accounts, 'A2').bindings)).toBe(true);
  });

  it('copies the step with the chosen record id', () => {
    const { bindings, dropped } = chooseRecord(steps, {}, accounts, 'A2');
    expect(bindings['accounts']).toEqual({ ...accounts, record_id: 'A2' });
    expect(dropped).toEqual([]);
  });

  it('drops the choices below a step when its record changes, and reports them', () => {
    const first = chooseRecord(steps, chooseRecord(steps, {}, accounts, 'A2').bindings, cards, 'C3').bindings;
    const changed = chooseRecord(steps, first, accounts, 'A1');
    expect(Object.keys(changed.bindings)).toEqual(['accounts']);
    expect(changed.bindings['accounts']!.record_id).toBe('A1');
    expect(changed.dropped).toEqual(['cards']);
  });

  it('keeps the choices below when the same record is chosen again', () => {
    const first = chooseRecord(steps, chooseRecord(steps, {}, accounts, 'A2').bindings, cards, 'C3').bindings;
    const again = chooseRecord(steps, first, accounts, 'A2');
    expect(again.bindings['cards']!.record_id).toBe('C3');
    expect(again.dropped).toEqual([]);
  });

  it('un-choosing a step drops what is below it', () => {
    const first = chooseRecord(steps, chooseRecord(steps, {}, accounts, 'A2').bindings, cards, 'C3').bindings;
    const cleared = clearRecord(steps, first, 'accounts');
    expect(cleared.bindings).toEqual({});
    expect(cleared.dropped).toEqual(['cards']);
  });

  it('lists the records chosen on the way to a step, parents first', () => {
    const bindings = chooseRecord(steps, {}, accounts, 'A2').bindings;
    expect(bindingsAbove(steps, bindings, 'accounts')).toEqual([]);
    expect(bindingsAbove(steps, bindings, 'cards').map((step) => step.record_id)).toEqual(['A2']);
    expect(bindingsAbove(steps, {}, 'cards')).toEqual([]);
  });

  it('builds the selection of the contract: the root and the bindings in step order', () => {
    const bindings = chooseRecord(steps, chooseRecord(steps, {}, accounts, 'A2').bindings, cards, 'C3').bindings;
    const selection = buildSelection({
      mappingId: 'map-card-number',
      root: rootStep('users', 'user_8841'),
      steps,
      bindings,
    });
    expect(selection).toEqual({
      mapping_id: 'map-card-number',
      root: { id: 'root', table: 'users', record_id: 'user_8841' },
      bindings: [
        { id: 'accounts', parent_id: 'root', link: 'user', direction: 'inverse', table: 'accounts', record_id: 'A2' },
        { id: 'cards', parent_id: 'accounts', link: 'account', direction: 'inverse', table: 'cards', record_id: 'C3' },
      ],
    });
    expect(bindingsOf(selection)['cards']!.record_id).toBe('C3');
  });

  it('sends no bindings key for a root-only selection', () => {
    expect(buildSelection({ mappingId: 'm', root: rootStep('users', 'u1'), steps: [], bindings: {} })).toEqual({
      mapping_id: 'm',
      root: { id: 'root', table: 'users', record_id: 'u1' },
    });
  });
});
