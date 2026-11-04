import type { TracfinMapping } from '@app-builder/models/tracfin';
import { tracfinDataModelFixture } from '@app-builder/models/tracfin/__fixtures__';
import { describe, expect, it } from 'vitest';
import { buildPathStep, getPathEndTable, getStepStatus, listAvailableHops } from './path-hops';

const dataModel = tracfinDataModelFixture;

function ingested(id: string, table: string, path: TracfinMapping['source']['path'] = []): TracfinMapping {
  return { id, target_field: '/ds/x', source: { kind: 'ingested', entity_type: 'Person', table, field: 'f', path } };
}

describe('listAvailableHops', () => {
  it('lists the forward hops (links the table is the child of), then the inverse ones (links it is the parent of)', () => {
    expect(listAvailableHops(dataModel, 'users')).toEqual([
      { link: 'employer', direction: 'forward', table: 'companies', indexed: true },
      { link: 'affiliated_company', direction: 'forward', table: 'companies', indexed: true },
      { link: 'user', direction: 'inverse', table: 'accounts', indexed: true },
      { link: 'borrower', direction: 'inverse', table: 'loans', indexed: false },
    ]);
  });

  it('flags an inverse hop without a valid navigation option as not indexed', () => {
    const [employerOfCompany] = listAvailableHops(dataModel, 'companies');
    expect(employerOfCompany).toMatchObject({ link: 'employer', direction: 'inverse', table: 'users', indexed: false });
  });

  it('requires the navigation option to be valid and to match the link fields', () => {
    const pending = dataModel.map((table) =>
      table.name === 'users'
        ? {
            ...table,
            navigationOptions: table.navigationOptions?.map((option) => ({ ...option, status: 'pending' as const })),
          }
        : table,
    );
    expect(listAvailableHops(pending, 'users').find((hop) => hop.table === 'accounts')?.indexed).toBe(false);

    const otherFilter = dataModel.map((table) =>
      table.name === 'users'
        ? {
            ...table,
            navigationOptions: table.navigationOptions?.map((option) => ({ ...option, filterFieldName: 'other' })),
          }
        : table,
    );
    expect(listAvailableHops(otherFilter, 'users').find((hop) => hop.table === 'accounts')?.indexed).toBe(false);
  });

  it('offers nothing from a table that is not in the data model', () => {
    expect(listAvailableHops(dataModel, 'gone')).toEqual([]);
  });
});

describe('getStepStatus', () => {
  it('checks a stored step against the data model', () => {
    const step = { id: 'accounts', parent_id: 'root', link: 'user', direction: 'inverse' as const, table: 'accounts' };
    expect(getStepStatus(dataModel, 'users', step)).toBe('ok');
    expect(getStepStatus(dataModel, 'users', { ...step, link: 'borrower', table: 'loans' })).toBe('not_indexed');
    expect(getStepStatus(dataModel, 'users', { ...step, link: 'renamed' })).toBe('unknown_link');
    // The same link walked the wrong way is not the same hop.
    expect(getStepStatus(dataModel, 'users', { ...step, direction: 'forward' })).toBe('unknown_link');
  });
});

describe('getPathEndTable', () => {
  it('is the root table for an empty path and the last step table otherwise', () => {
    expect(getPathEndTable('users', [])).toBe('users');
    expect(
      getPathEndTable('users', [
        { id: 'a', table: 'accounts' },
        { id: 'c', table: 'cards' },
      ]),
    ).toBe('cards');
  });
});

describe('buildPathStep', () => {
  const accounts = { link: 'user', direction: 'inverse' as const, table: 'accounts' };
  const cards = { link: 'account', direction: 'inverse' as const, table: 'cards' };

  it('chains parent_id from root and names a new step after its table', () => {
    const first = buildPathStep({ mappings: [], mappingId: 'm1', rootTable: 'users', kept: [], hop: accounts });
    expect(first).toEqual({ id: 'accounts', parent_id: 'root', link: 'user', direction: 'inverse', table: 'accounts' });

    const second = buildPathStep({ mappings: [], mappingId: 'm1', rootTable: 'users', kept: [first], hop: cards });
    expect(second).toEqual({
      id: 'cards',
      parent_id: 'accounts',
      link: 'account',
      direction: 'inverse',
      table: 'cards',
    });
  });

  it('reuses the id of an identical hop defined by another mapping of the same root table', () => {
    const other = ingested('other', 'users', [
      { id: 'my-accounts', parent_id: 'root', link: 'user', direction: 'inverse', table: 'accounts' },
    ]);
    const step = buildPathStep({ mappings: [other], mappingId: 'm1', rootTable: 'users', kept: [], hop: accounts });
    expect(step.id).toBe('my-accounts');
  });

  it('does not reuse an id from a mapping of another root table, nor from the mapping being edited', () => {
    const step = { id: 'x', parent_id: 'root', link: 'user', direction: 'inverse' as const, table: 'accounts' };
    const otherRoot = ingested('other', 'companies', [step]);
    const itself = ingested('m1', 'users', [step]);
    expect(
      buildPathStep({ mappings: [otherRoot, itself], mappingId: 'm1', rootTable: 'users', kept: [], hop: accounts }).id,
    ).toBe('accounts');
  });

  it('does not reuse the id of a hop that differs by parent, link, direction or table', () => {
    const base = { id: 'taken', parent_id: 'root', link: 'user', direction: 'inverse' as const, table: 'accounts' };
    const differing = [
      { ...base, parent_id: 'elsewhere' },
      { ...base, link: 'owner' },
      { ...base, direction: 'forward' as const },
    ].map((step) => ingested('other', 'users', [step]));
    for (const other of differing) {
      expect(
        buildPathStep({ mappings: [other], mappingId: 'm1', rootTable: 'users', kept: [], hop: accounts }).id,
      ).toBe('accounts');
    }
  });

  it('tells two different hops to the same table apart, without taking an id another hop uses', () => {
    const employer = { link: 'employer', direction: 'forward' as const, table: 'companies' };
    const affiliated = { link: 'affiliated_company', direction: 'forward' as const, table: 'companies' };

    const first = buildPathStep({ mappings: [], mappingId: 'm1', rootTable: 'users', kept: [], hop: employer });
    const second = buildPathStep({
      mappings: [ingested('m1', 'users', [first])],
      mappingId: 'm2',
      rootTable: 'users',
      kept: [],
      hop: affiliated,
    });

    expect(first.id).toBe('companies');
    expect(second.id).toBe('companies-affiliated-company');
  });

  it('never takes the reserved root id', () => {
    const step = buildPathStep({
      mappings: [],
      mappingId: 'm1',
      rootTable: 'users',
      kept: [],
      hop: { link: 'l', direction: 'forward', table: 'root' },
    });
    expect(step.id).not.toBe('root');
  });
});
