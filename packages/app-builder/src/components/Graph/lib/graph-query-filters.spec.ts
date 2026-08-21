import { describe, expect, it } from 'vitest';
import { graphFilterParamsEqual, toGenerateGraphFilterParams } from './graph-query-filters';

describe('toGenerateGraphFilterParams', () => {
  it('sends sorted table names and omits relations when every group is selected', () => {
    expect(
      toGenerateGraphFilterParams({
        selectedTableNames: ['users', 'accounts'],
        selectedRelationGroupIds: null,
      }),
    ).toEqual({ types: 'accounts,users' });
  });

  it('sends an empty types string when no tables are selected', () => {
    expect(
      toGenerateGraphFilterParams({
        selectedTableNames: [],
        selectedRelationGroupIds: null,
      }),
    ).toEqual({ types: '' });
  });

  it('sends an empty same_field_relations when the user cleared every group', () => {
    expect(
      toGenerateGraphFilterParams({
        selectedTableNames: ['users'],
        selectedRelationGroupIds: [],
      }),
    ).toEqual({ types: 'users', same_field_relations: '' });
  });

  it('sends sorted group ids for a subset', () => {
    expect(
      toGenerateGraphFilterParams({
        selectedTableNames: ['users'],
        selectedRelationGroupIds: ['b', 'a'],
      }),
    ).toEqual({ types: 'users', same_field_relations: 'a,b' });
  });
});

describe('graphFilterParamsEqual', () => {
  it('treats omitted and undefined same_field_relations as equal', () => {
    expect(graphFilterParamsEqual({ types: 'users' }, { types: 'users' })).toBe(true);
    expect(graphFilterParamsEqual({ types: 'users' }, { types: 'users', same_field_relations: '' })).toBe(false);
  });
});
