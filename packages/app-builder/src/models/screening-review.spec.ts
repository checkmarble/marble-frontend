import { describe, expect, it } from 'vitest';
import {
  adjacentScreeningReviewItem,
  buildScreeningReviewItems,
  groupScreeningReviewItems,
  matchedScreeningReviewFields,
  screeningReviewTopicFamilies,
} from './screening-review';
import { datasetReviewScreening, objectReviewScreening, reviewCase } from './screening-review.test-helpers';

describe('screening review stream', () => {
  it.each([
    { screening: objectReviewScreening(), customers: ['alice', 'alice'], records: ['record-high', 'record-low'] },
    {
      screening: { ...objectReviewScreening(), triggerType: 'object_updated' as const },
      customers: ['alice', 'alice'],
      records: ['record-high', 'record-low'],
    },
    {
      screening: datasetReviewScreening(),
      customers: ['alice', 'bob'],
      records: ['shared-list-record', 'shared-list-record'],
    },
  ])('normalizes $screening.triggerType into customer/list-record pairs', ({ screening, customers, records }) => {
    const items = buildScreeningReviewItems([reviewCase('case', [screening])]);
    expect(items.map((item) => item.customer.objectId)).toEqual(customers);
    expect(items.map((item) => item.listRecord.id)).toEqual(records);
    expect(items.map((item) => item.matchId)).toEqual(screening.matches.map((match) => match.id));
    expect(
      items.every((item) => item.caseId === 'case' && item.screeningId === screening.id && item.inboxId === 'inbox'),
    ).toBe(true);
    expect(items.every((item) => item.topics.includes('sanction'))).toBe(true);
    expect(items.every((item) => item.listRecord.caption !== item.customer.name)).toBe(true);
  });

  it('reads every screening and groups the same customer across cases and trigger types', () => {
    const groups = groupScreeningReviewItems(
      buildScreeningReviewItems([
        reviewCase('older', [objectReviewScreening('one'), objectReviewScreening('two')]),
        reviewCase('newer', [datasetReviewScreening()], { createdAt: '2026-11-03T10:00:00Z' }),
      ]),
    );
    expect(groups).toHaveLength(2);
    expect(groups.find((group) => group.customer.objectId === 'alice')?.items).toHaveLength(5);
    expect(new Set(groups.flatMap((group) => group.items.map((item) => item.id))).size).toBe(6);
    expect(groups[0]?.items.some((item) => item.caseId === 'older')).toBe(true);
  });

  it('separates identical object IDs from different object types', () => {
    const first = objectReviewScreening('first');
    const second = { ...objectReviewScreening('second'), objectType: 'organizations' };
    expect(groupScreeningReviewItems(buildScreeningReviewItems([reviewCase('case', [first, second])]))).toHaveLength(2);
  });

  it('counts reviewed hits but navigates only pending hits; partial groups and unscanned pages have incomplete counts', () => {
    const screening = objectReviewScreening();
    screening.matches[0]!.status = 'no_hit';
    screening.partial = true;
    const groups = groupScreeningReviewItems(buildScreeningReviewItems([reviewCase('case', [screening])]));
    expect(groups[0]).toMatchObject({ remaining: 1, total: 2, incomplete: true });
    expect(groups[0]?.items.map((item) => item.matchId)).toEqual(['screening-1-low']);
    expect(groupScreeningReviewItems(buildScreeningReviewItems([reviewCase('case')]), true)[0]?.incomplete).toBe(true);
    screening.status = 'confirmed_hit';
    expect(groupScreeningReviewItems(buildScreeningReviewItems([reviewCase('case', [screening])]))).toEqual([]);
  });

  it.each([objectReviewScreening(), datasetReviewScreening()])(
    'defines next-hit order and stops at boundaries for $triggerType',
    (screening) => {
      const groups = groupScreeningReviewItems(buildScreeningReviewItems([reviewCase('case', [screening])]));
      const first = groups[0]!.items[0]!;
      const last = groups.at(-1)!.items.at(-1)!;
      expect(adjacentScreeningReviewItem(groups, first.id, -1)).toBeUndefined();
      expect(adjacentScreeningReviewItem(groups, first.id, 1)?.id).toBe(last.id);
      expect(adjacentScreeningReviewItem(groups, last.id, -1)?.id).toBe(first.id);
      expect(adjacentScreeningReviewItem(groups, last.id, 1)).toBeUndefined();
      expect(adjacentScreeningReviewItem(groups, first.id, 1, true)?.id).toBe(groups[1]?.items[0]?.id);
    },
  );

  it('orders customers by newest case and hits by topic, score, then identity', () => {
    const screening = objectReviewScreening();
    screening.matches[0]!.payload.properties['topics'] = ['role.pep'];
    const groups = groupScreeningReviewItems(
      buildScreeningReviewItems([
        reviewCase('old', [screening]),
        reviewCase('new', [objectReviewScreening('new-screening', 'bob')], { createdAt: '2026-11-03T10:00:00Z' }),
      ]),
    );
    expect(groups.map((group) => group.customer.name)).toEqual(['Bob', 'Alice']);
    expect(groups[1]?.items.map((item) => item.matchId)).toEqual(['screening-1-low', 'screening-1-high']);
  });

  it('uses all request queries for the snapshot name and a stable fallback if none exists', () => {
    const screening = objectReviewScreening();
    screening.request.searchInput.queries = {
      first: { schema: 'Person', properties: {} },
      second: { schema: 'Person', properties: { name: ['Snapshot name'] } },
    };
    expect(buildScreeningReviewItems([reviewCase('case', [screening])])[0]?.customer.name).toBe('Snapshot name');
    screening.request.searchInput.queries = {};
    expect(buildScreeningReviewItems([reviewCase('case', [screening])])[0]?.customer.name).toBe('people · alice');
    expect(buildScreeningReviewItems([reviewCase('decision', [screening], { type: 'decision' })])).toEqual([]);
  });

  it.each([
    { name: 'object trigger', customer: 'object' as const },
    { name: 'dataset trigger', customer: 'dataset' as const },
  ])('compares customer and list record values for the $name', ({ customer }) => {
    const compare = (customerProperties: Record<string, string[]>, listProperties: Record<string, string[]>) => {
      if (customer === 'object') {
        const screening = objectReviewScreening();
        screening.request.searchInput.queries = { customer: { schema: 'Person', properties: customerProperties } };
        screening.matches[0]!.payload.properties = listProperties;
        return matchedScreeningReviewFields(buildScreeningReviewItems([reviewCase('case', [screening])])[0]!);
      }
      const screening = datasetReviewScreening();
      screening.matches[0]!.payload.properties = customerProperties;
      screening.opensanctionEntityPayload.properties = listProperties;
      return matchedScreeningReviewFields(buildScreeningReviewItems([reviewCase('case', [screening])])[0]!);
    };
    expect(compare({ birthDate: ['1991-05-01'] }, { birthDate: ['1991-05-01'] })).toEqual(['birthDate']);
    expect(compare({ birthDate: ['1991-05-01T00:00:00Z'] }, { birthDate: ['1991-05-01'] })).toEqual(['birthDate']);
    expect(compare({ birthDate: ['1991-05-01'] }, { birthDate: ['1991'] })).toEqual([]);
    expect(compare({ birthDate: ['1991'] }, { birthDate: ['1991'] })).toEqual([]);
    expect(compare({ birthDate: ['1991-05'] }, { birthDate: ['1991-05'] })).toEqual([]);
    expect(compare({ birthDate: ['1991-02-30'] }, { birthDate: ['1991-02-30'] })).toEqual([]);
    expect(compare({ birthDate: ['unknown'] }, { birthDate: ['unknown'] })).toEqual([]);
    expect(compare({ birthDate: ['1991-05-01'] }, { birthDate: ['1991-05-02'] })).toEqual([]);
    expect(compare({ nationality: ['Egypt'] }, { nationality: ['eg'] })).toEqual(['nationality']);
    expect(compare({ nationality: ['EG'] }, { citizenship: ['eg'] })).toEqual(['nationality']);
    expect(compare({ nationality: ['France'] }, { nationality: ['eg'] })).toEqual([]);
    expect(compare({ nationality: [''] }, { nationality: [''] })).toEqual([]);
    expect(compare({}, { birthDate: ['1991-05-01'], nationality: ['eg'] })).toEqual([]);
    expect(compare({ birthDate: ['1991-05-01'], nationality: ['eg'] }, {})).toEqual([]);
    expect(
      compare({ birthDate: ['1991-05-01'], nationality: ['eg'] }, { birthDate: ['1991-05-01'], nationality: ['eg'] }),
    ).toEqual(['birthDate', 'nationality']);
  });

  it('keeps the customer entity type for both trigger types', () => {
    const items = buildScreeningReviewItems([reviewCase('case', [objectReviewScreening(), datasetReviewScreening()])]);
    expect(new Set(items.map((item) => item.customer.schema))).toEqual(new Set(['Person']));
    const screening = objectReviewScreening();
    screening.request.searchInput.queries = {};
    expect(buildScreeningReviewItems([reviewCase('case', [screening])])[0]?.customer.schema).toBeUndefined();
  });

  it('reduces topics to ordered families and skips unknown topics', () => {
    expect(screeningReviewTopicFamilies(['crime.fraud', 'role.pep', 'sanction', 'sanction.linked', 'isAlive'])).toEqual(
      ['sanctions', 'peps', 'adverse-media'],
    );
    expect(screeningReviewTopicFamilies(['filter.something', 'unknown'])).toEqual([]);
  });
});
