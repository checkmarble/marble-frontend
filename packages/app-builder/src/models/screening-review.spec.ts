import { type ContinuousScreeningDto } from 'marble-api';
import { describe, expect, it } from 'vitest';
import { adaptContinuousScreening } from './continuous-screening';
import {
  adjacentScreeningReviewItem,
  applyScreeningReviewSession,
  awaitsEscalation,
  awaitsMoreMatches,
  buildScreeningReviewItems,
  canEscalateScreeningReviewCase,
  compareScreeningReviewFields,
  countScreeningReviewFilters,
  emptyScreeningReviewSession,
  groupScreeningReviewItems,
  isListedInScreeningReviewSession,
  isPendingReviewItem,
  isSettledScreeningReviewGroup,
  matchesScreeningReviewFilter,
  needsFalsePositiveClosure,
  nextPendingScreeningReviewItem,
  type ScreeningReviewItem,
  type ScreeningReviewSession,
  type ScreeningReviewSignals,
  screeningReviewCards,
  screeningReviewCaseFollowUp,
  screeningReviewCategoryCounts,
  screeningReviewChipFields,
  screeningReviewGroupPendingItems,
  screeningReviewHitsSkippedBy,
  screeningReviewScreeningState,
  screeningReviewTopicFamilies,
  willEscalateScreeningReviewCase,
} from './screening-review';
import stagingObjectAddedDto from './screening-review.staging-object-added.json';
import {
  datasetReviewScreening,
  objectReviewScreening,
  reviewCase,
  withMatchStatus,
  withTentativeReview,
} from './screening-review.test-helpers';

const TRIGGERS = ['object_added', 'dataset_updated'] as const;

type MotivaCase = {
  field: string;
  customer: string[];
  list: string[];
  signals: ScreeningReviewSignals;
  state: string;
  signal: string | undefined;
};

/** Builds the review item for one customer/list-record pair, through either screening direction. */
function reviewItem(
  trigger: (typeof TRIGGERS)[number],
  customer: Record<string, string[]>,
  listRecord: Record<string, string[]>,
  signals: ScreeningReviewSignals = {},
) {
  if (trigger === 'object_added') {
    const screening = objectReviewScreening();
    screening.request.searchInput.queries = { customer: { schema: 'Person', properties: customer } };
    screening.matches[0]!.payload = { ...screening.matches[0]!.payload, properties: listRecord, ...signals };
    return buildScreeningReviewItems([reviewCase('case', [screening])])[0]!;
  }
  const screening = datasetReviewScreening();
  screening.matches[0]!.payload = { ...screening.matches[0]!.payload, properties: customer, ...signals };
  screening.opensanctionEntityPayload.properties = listRecord;
  return buildScreeningReviewItems([reviewCase('case', [screening])])[0]!;
}

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

  it('reads every screening and groups by case, then by customer, oldest case first', () => {
    const groups = groupScreeningReviewItems(
      buildScreeningReviewItems([
        reviewCase('older', [objectReviewScreening('one'), objectReviewScreening('two')]),
        reviewCase('newer', [datasetReviewScreening()], { createdAt: '2026-11-03T10:00:00Z' }),
      ]),
    );
    // The same customer gets a group in each of its cases.
    expect(groups.map((group) => [group.caseId, group.customer.objectId, group.items.length])).toEqual([
      ['older', 'alice', 4],
      ['newer', 'alice', 1],
      ['newer', 'bob', 1],
    ]);
    expect(new Set(groups.flatMap((group) => group.items.map((item) => item.id))).size).toBe(6);
  });

  it('separates identical object IDs from different object types', () => {
    const first = objectReviewScreening('first');
    const second = { ...objectReviewScreening('second'), objectType: 'organizations' };
    expect(groupScreeningReviewItems(buildScreeningReviewItems([reviewCase('case', [first, second])]))).toHaveLength(2);
  });

  it('lists a group by its pending hits and shows its decided ones; partial groups and unscanned pages have incomplete counts', () => {
    const screening = objectReviewScreening();
    screening.matches[0]!.status = 'no_hit';
    screening.partial = true;
    const groups = groupScreeningReviewItems(buildScreeningReviewItems([reviewCase('case', [screening])]));
    expect(groups[0]).toMatchObject({ remaining: 1, total: 2, incomplete: true });
    // A partly reviewed case loads with its No hit hits, last.
    expect(groups[0]?.items.map((item) => [item.matchId, item.status])).toEqual([
      ['screening-1-low', 'pending'],
      ['screening-1-high', 'no_hit'],
    ]);
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

  it('orders groups by oldest case and hits by topic, score, then identity', () => {
    const screening = objectReviewScreening();
    screening.matches[0]!.payload.properties['topics'] = ['role.pep'];
    const groups = groupScreeningReviewItems(
      buildScreeningReviewItems([
        reviewCase('old', [screening]),
        reviewCase('new', [objectReviewScreening('new-screening', 'bob')], { createdAt: '2026-11-03T10:00:00Z' }),
      ]),
    );
    expect(groups.map((group) => group.customer.name)).toEqual(['Alice', 'Bob']);
    expect(groups[0]?.items.map((item) => item.matchId)).toEqual(['screening-1-low', 'screening-1-high']);
  });

  it('stacks two No hit hits or more at the end of their group, as one stop, unless expanded', () => {
    const screening = objectReviewScreening();
    screening.matches.push(
      { ...screening.matches[0]!, id: 'third', opensanctionEntityId: 'record-3', status: 'no_hit' },
      { ...screening.matches[0]!, id: 'fourth', opensanctionEntityId: 'record-4', status: 'no_hit' },
    );
    screening.matches[0]!.status = 'no_hit';
    const groups = groupScreeningReviewItems(
      buildScreeningReviewItems([reviewCase('case', [screening])]),
      false,
      () => true,
    );
    const [group] = groups;
    const cards = screeningReviewCards(group!);
    expect(
      cards.map((card) => (card.kind === 'hit' ? card.item.matchId : card.items.map((item) => item.matchId))),
    ).toEqual(['screening-1-low', ['fourth', 'screening-1-high', 'third']]);
    const byMatch = (matchId: string) => group!.items.find((item) => item.matchId === matchId)!.id;
    // The stack is one stop, on its first hit.
    expect(adjacentScreeningReviewItem(groups, byMatch('screening-1-low'), 1)?.matchId).toBe('fourth');
    expect(adjacentScreeningReviewItem(groups, byMatch('third'), -1)?.matchId).toBe('screening-1-low');
    expect(adjacentScreeningReviewItem(groups, byMatch('fourth'), 1)).toBeUndefined();

    const expanded = new Set([group!.key]);
    expect(screeningReviewCards(group!, expanded).every((card) => card.kind === 'hit')).toBe(true);
    expect(adjacentScreeningReviewItem(groups, byMatch('fourth'), 1, false, expanded)?.matchId).toBe(
      'screening-1-high',
    );

    // A single No hit hit stays a card of its own.
    screening.matches.splice(2);
    const single = groupScreeningReviewItems(
      buildScreeningReviewItems([reviewCase('case', [screening])]),
      false,
      () => true,
    );
    expect(screeningReviewCards(single[0]!).map((card) => card.kind)).toEqual(['hit', 'hit']);
  });

  it('uses all request queries for the snapshot name and a stable fallback if none exists', () => {
    const screening = objectReviewScreening();
    screening.request.searchInput.queries = {
      first: { schema: 'Person', properties: {} },
      second: { schema: 'Person', properties: { name: ['Snapshot name'] } },
    };
    expect(buildScreeningReviewItems([reviewCase('case', [screening])])[0]?.customer.name).toBe('Snapshot name');
    screening.request.searchInput.queries = {
      only: { schema: 'Person', properties: { firstName: ['Amira'], lastName: ['Nasser'] } },
    };
    expect(buildScreeningReviewItems([reviewCase('case', [screening])])[0]?.customer.name).toBe('Amira Nasser');
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
        return screeningReviewChipFields(
          compareScreeningReviewFields(buildScreeningReviewItems([reviewCase('case', [screening])])[0]!),
        );
      }
      const screening = datasetReviewScreening();
      screening.matches[0]!.payload.properties = customerProperties;
      screening.opensanctionEntityPayload.properties = listProperties;
      return screeningReviewChipFields(
        compareScreeningReviewFields(buildScreeningReviewItems([reviewCase('case', [screening])])[0]!),
      );
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
    expect(compare({ country: ['US'] }, { country: ['us'] })).toEqual(['country']);
    expect(compare({ country: ['US'] }, { citizenship: ['us'] })).toEqual(['country']);
    expect(compare({ birthCountry: ['France'] }, { birthCountry: ['fr'] })).toEqual(['country']);
    expect(compare({ country: ['US'] }, { country: ['bs'] })).toEqual([]);
    expect(compare({ nationality: ['EG'], country: ['US'] }, { nationality: ['eg'], country: ['us'] })).toEqual([
      'nationality',
      'country',
    ]);
    expect(compare({}, { birthDate: ['1991-05-01'], nationality: ['eg'] })).toEqual([]);
    expect(compare({ birthDate: ['1991-05-01'], nationality: ['eg'] }, {})).toEqual([]);
    expect(
      compare({ birthDate: ['1991-05-01'], nationality: ['eg'] }, { birthDate: ['1991-05-01'], nationality: ['eg'] }),
    ).toEqual(['birthDate', 'nationality']);
    expect(compare({ name: ['Alice'], idNumber: ['AB-1'] }, { name: ['Alice'], idNumber: ['ab1'] })).toEqual([
      'identifier',
    ]);
    expect(
      compare(
        { birthDate: ['1991-05-01'], idNumber: ['AB-1'], passportNumber: ['P1'] },
        { birthDate: ['1991'], idNumber: ['ab1'], passportNumber: ['P1'] },
      ),
    ).toEqual(['identifier']);
  });

  it.each([objectReviewScreening(), datasetReviewScreening()])(
    'carries the Motiva signals of each match for $triggerType',
    (screening) => {
      screening.matches[0]!.payload.features = { name_literal_match: 1 };
      screening.matches[0]!.payload.explanations = { dob_year_disjoint: { score: 1, weighted: -0.15 } };
      const [first, second] = buildScreeningReviewItems([reviewCase('case', [screening])]);
      expect(first?.signals).toEqual({
        features: { name_literal_match: 1 },
        explanations: { dob_year_disjoint: { score: 1, weighted: -0.15 } },
      });
      expect(second?.signals).toEqual({});
    },
  );

  describe.each(TRIGGERS)('field comparison for %s', (trigger) => {
    it.each([
      // Name: token sets, compared with the main name and the aliases.
      { field: 'name', customer: ['Amira Nasser'], list: ['Amira Nasser'], state: 'same' },
      { field: 'name', customer: ['NASSER Amira'], list: ['Amira Nasser'], state: 'same' },
      { field: 'name', customer: ['Amïra Nasser'], list: ['amira  nasser'], state: 'same' },
      { field: 'name', customer: ['Amira Nasser'], list: ['Amira M. Nasser'], state: 'close' },
      { field: 'name', customer: ['Amira Nasser'], list: ['Nasser Holdings'], state: 'close' },
      { field: 'name', customer: ['Amira Nasser'], list: ['Paolo Bianchi'], state: 'different' },
      { field: 'name', customer: ['Al Bo'], list: ['Al Cy'], state: 'different' },
      { field: 'name', customer: [], list: ['Amira Nasser'], state: 'missing' },
      // Date of birth: same day, consistent partial date or same year.
      { field: 'birthDate', customer: ['1991-05-01'], list: ['1991-05-01'], state: 'same' },
      { field: 'birthDate', customer: ['1991-05-01T00:00:00Z'], list: ['1991-05-01'], state: 'same' },
      { field: 'birthDate', customer: ['1991-05-01'], list: ['1991'], state: 'close' },
      { field: 'birthDate', customer: ['1991-05'], list: ['1991-05-20'], state: 'close' },
      { field: 'birthDate', customer: ['1991-05-01'], list: ['1991-08-12'], state: 'close' },
      { field: 'birthDate', customer: ['1991'], list: ['1991'], state: 'close' },
      { field: 'birthDate', customer: ['1991-05-01'], list: ['1992-05-01'], state: 'different' },
      { field: 'birthDate', customer: ['1991-05'], list: ['1992-05-01'], state: 'different' },
      { field: 'birthDate', customer: ['1991-02-30'], list: ['1991-02-28'], state: 'missing' },
      { field: 'birthDate', customer: ['unknown'], list: ['1991-02-28'], state: 'missing' },
      { field: 'birthDate', customer: ['1991-05-01'], list: [], state: 'missing' },
      // Nationality: ISO alpha-2 or alpha-3 codes or English names, no Close.
      { field: 'nationality', customer: ['Egypt'], list: ['eg'], state: 'same' },
      { field: 'nationality', customer: ['FRA'], list: ['fr'], state: 'same' },
      { field: 'nationality', customer: ['Turkey'], list: ['tr'], state: 'same' },
      { field: 'nationality', customer: ['Czech Republic'], list: ['cz'], state: 'same' },
      { field: 'nationality', customer: ["Cote d'Ivoire"], list: ['ci'], state: 'same' },
      { field: 'nationality', customer: ['France'], list: ['eg'], state: 'different' },
      { field: 'nationality', customer: ['French'], list: ['fr'], state: 'missing' },
      { field: 'nationality', customer: [''], list: ['eg'], state: 'missing' },
      // Identifiers: separators and case ignored, no Close.
      { field: 'idNumber', customer: ['AB-123 456'], list: ['ab123456'], state: 'same' },
      { field: 'idNumber', customer: ['AB123456'], list: ['AB123457'], state: 'different' },
      { field: 'idNumber', customer: ['AB123456'], list: [], state: 'missing' },
    ])('$field: $customer vs $list is $state', ({ field, customer, list, state }) => {
      const row = compareScreeningReviewFields(
        reviewItem(trigger, { name: ['Placeholder'], [field]: customer }, { name: ['Placeholder'], [field]: list }),
      ).find((comparison) => comparison.field === field);
      expect(row?.state).toBe(state);
      expect(row?.source).toBe('browser');
    });

    it('reads citizenship into the nationality row and lets the best pair of values decide', () => {
      const rows = compareScreeningReviewFields(
        reviewItem(
          trigger,
          { name: ['Amira Nasser'], nationality: ['FR', 'EG'], birthDate: ['1980-01-01', '1991-05-01'] },
          { name: ['Amira Nasser'], citizenship: ['eg'], birthDate: ['1975', '1991-05-01'] },
        ),
      );
      expect(rows.find((row) => row.field === 'nationality')).toMatchObject({
        state: 'same',
        customerValues: ['EG', 'FR'],
        listRecordValues: ['eg'],
      });
      expect(rows.find((row) => row.field === 'birthDate')).toMatchObject({
        state: 'same',
        customerValues: ['1991-05-01', '1980-01-01'],
        listRecordValues: ['1991-05-01', '1975'],
      });
    });

    it('compares a country row against the list record’s other country properties, as Motiva does', () => {
      const viaCitizenship = compareScreeningReviewFields(
        reviewItem(trigger, { name: ['Sam Fried'], country: ['US'] }, { name: ['Sam Fried'], citizenship: ['us'] }),
        ['name', 'country'],
      ).find((row) => row.field === 'country');
      expect(viaCitizenship).toMatchObject({
        state: 'same',
        source: 'browser',
        customerValues: ['US'],
        listRecordValues: [],
        viaProperty: { property: 'citizenship', value: 'us' },
      });
      // A matching value beats a differing one of the row's own property.
      const overOwnValue = compareScreeningReviewFields(
        reviewItem(
          trigger,
          { name: ['Sam Fried'], country: ['US'] },
          { name: ['Sam Fried'], country: ['bs'], citizenship: ['us'] },
        ),
        ['name', 'country'],
      ).find((row) => row.field === 'country');
      expect(overOwnValue).toMatchObject({
        state: 'same',
        listRecordValues: ['bs'],
        viaProperty: { property: 'citizenship', value: 'us' },
      });
      // The row's own value wins a tie.
      const ownValue = compareScreeningReviewFields(
        reviewItem(
          trigger,
          { name: ['Sam Fried'], country: ['US'] },
          { name: ['Sam Fried'], country: ['us'], citizenship: ['us'] },
        ),
        ['name', 'country'],
      ).find((row) => row.field === 'country');
      expect(ownValue).toMatchObject({ state: 'same', listRecordValues: ['us'] });
      expect(ownValue?.viaProperty).toBeUndefined();
    });

    it('marks a name matched through an alias, and prefers the main name on a tie', () => {
      const viaAlias = compareScreeningReviewFields(
        reviewItem(trigger, { name: ['A. Nasser'] }, { name: ['Amira Nasser'], alias: ['A. Nasser'] }),
      )[0];
      expect(viaAlias).toMatchObject({ field: 'name', state: 'same', viaAlias: 'A. Nasser' });
      expect(viaAlias?.listRecordValues).toEqual(['Amira Nasser']);
      const mainName = compareScreeningReviewFields(
        reviewItem(trigger, { name: ['Amira Nasser'] }, { name: ['Amira Nasser'], weakAlias: ['Amira Nasser'] }),
      )[0];
      expect(mainName?.viaAlias).toBeUndefined();
      // The main name wins the tie even when it pairs with a later customer value.
      const laterMainName = compareScreeningReviewFields(
        reviewItem(trigger, { name: ['A. Nasser', 'Amira Nasser'] }, { name: ['Amira Nasser'], alias: ['A. Nasser'] }),
      )[0];
      expect(laterMainName).toMatchObject({ state: 'same', customerValues: ['Amira Nasser', 'A. Nasser'] });
      expect(laterMainName?.viaAlias).toBeUndefined();
    });

    it('keeps a repeated name component when building the name from first and last names', () => {
      const row = compareScreeningReviewFields(
        reviewItem(trigger, { firstName: ['Ali'], lastName: ['Ali'] }, { name: ['Ali Ali'] }),
      )[0];
      expect(row).toMatchObject({ field: 'name', state: 'same', customerValues: ['Ali Ali'] });
    });

    it('compares the mapped fields in table order, and hides fields empty on both sides', () => {
      const item = reviewItem(
        trigger,
        { name: ['Amira Nasser'], passportNumber: ['P123'], email: ['amira@example.com'] },
        { name: ['Amira Nasser'], birthDate: ['1991-05-01'], email: ['amira@example.com'], position: ['Minister'] },
      );
      const fields = (mapped?: string[]) => compareScreeningReviewFields(item, mapped).map((row) => row.field);
      expect(fields(['email', 'passportNumber', 'birthDate', 'nationality', 'name'])).toEqual([
        'name',
        'birthDate',
        'passportNumber',
        'email',
      ]);
      expect(fields(['passportNumber'])).toEqual(['name', 'passportNumber']);
      // Without a mapping, the entity type's screenable fields are compared; `position` never is.
      expect(fields()).toEqual(['name', 'birthDate', 'passportNumber', 'email']);
      expect(compareScreeningReviewFields(item).map((row) => row.state)).toEqual([
        'same',
        'missing',
        'missing',
        'same',
      ]);
    });

    it.each<MotivaCase>([
      // Name signals; `features` only lists non-zero features.
      {
        field: 'name',
        customer: ['Amira Nasser'],
        list: ['Amira Nasir'],
        signals: { features: { name_literal_match: 1 } },
        state: 'same',
        signal: 'name_literal_match',
      },
      {
        field: 'name',
        customer: ['Mohamed Aly'],
        list: ['Muhammad Ali'],
        signals: { features: { person_name_phonetic_match: 1 } },
        state: 'close',
        signal: 'person_name_phonetic_match',
      },
      {
        field: 'name',
        customer: ['Mohamed Aly'],
        list: ['Muhammad Ali'],
        signals: { features: { person_name_jaro_winkler: 0.8 } },
        state: 'close',
        signal: 'person_name_jaro_winkler',
      },
      {
        field: 'name',
        customer: ['Amira Nasser'],
        list: ['Amira Nasser'],
        signals: { explanations: { last_name_mismatch: { score: 1, weighted: -0.2 } } },
        state: 'different',
        signal: 'last_name_mismatch',
      },
      {
        field: 'name',
        customer: ['Amira Nasser'],
        list: ['Amira Nasir'],
        signals: { features: { person_name_phonetic_match: 1, name_literal_match: 1 } },
        state: 'same',
        signal: 'name_literal_match',
      },
      // Explanations take precedence over features, and a zero score has not fired.
      {
        field: 'name',
        customer: ['Mohamed Aly'],
        list: ['Muhammad Ali'],
        signals: {
          features: { person_name_phonetic_match: 1 },
          explanations: { person_name_phonetic_match: { score: 0, detail: 'no match' } },
        },
        state: 'different',
        signal: undefined,
      },
      // An explanation without a score falls back to the feature.
      {
        field: 'name',
        customer: ['Mohamed Aly'],
        list: ['Muhammad Ali'],
        signals: {
          features: { person_name_phonetic_match: 1 },
          explanations: { person_name_phonetic_match: { detail: 'phonetic match' } },
        },
        state: 'close',
        signal: 'person_name_phonetic_match',
      },
      // Date of birth penalties.
      {
        field: 'birthDate',
        customer: ['1991-05-01'],
        list: ['1991'],
        signals: { explanations: { dob_year_disjoint: { score: 1, weighted: -0.15 } } },
        state: 'different',
        signal: 'dob_year_disjoint',
      },
      {
        field: 'birthDate',
        customer: ['1991-05-01'],
        list: ['1991-05-02'],
        signals: { features: { dob_day_disjoint: 1 } },
        state: 'close',
        signal: 'dob_day_disjoint',
      },
      {
        field: 'birthDate',
        customer: ['1991-05-01'],
        list: ['1992-05-02'],
        signals: { features: { dob_day_disjoint: 1 } },
        state: 'different',
        signal: 'dob_day_disjoint',
      },
      // Country, gender and identifier signals.
      {
        field: 'nationality',
        customer: ['France'],
        list: ['fr'],
        signals: { features: { country_mismatch: 1 } },
        state: 'different',
        signal: 'country_mismatch',
      },
      {
        field: 'gender',
        customer: ['female'],
        list: ['female'],
        signals: { features: { gender_mismatch: 1 } },
        state: 'different',
        signal: 'gender_mismatch',
      },
      {
        field: 'idNumber',
        customer: ['AB-123'],
        list: ['AB124'],
        signals: { features: { identifier_match: 1 } },
        state: 'same',
        signal: 'identifier_match',
      },
      // Missing always comes from the data.
      {
        field: 'birthDate',
        customer: [],
        list: ['1991-05-01'],
        signals: { features: { dob_year_disjoint: 1 } },
        state: 'missing',
        signal: undefined,
      },
    ])(
      'Motiva $signals on $field: $customer vs $list is $state',
      ({ field, customer, list, signals, state, signal }) => {
        const row = compareScreeningReviewFields(
          reviewItem(
            trigger,
            { name: ['Placeholder'], [field]: customer },
            { name: ['Placeholder'], [field]: list },
            signals,
          ),
          ['name', field],
        ).find((comparison) => comparison.field === field);
        expect(row).toMatchObject({ state, source: signal ? 'motiva' : 'browser' });
        expect(row?.signal).toBe(signal);
      },
    );

    it('applies an identifier match only when a single identifier is compared', () => {
      const rows = compareScreeningReviewFields(
        reviewItem(
          trigger,
          { name: ['Amira Nasser'], idNumber: ['AB123'], passportNumber: ['P1'] },
          { name: ['Amira Nasser'], idNumber: ['AB123'], passportNumber: ['P2'] },
          { features: { identifier_match: 1 } },
        ),
      );
      expect(rows.map(({ field, state, source }) => [field, state, source])).toEqual([
        ['name', 'same', 'browser'],
        ['idNumber', 'same', 'browser'],
        ['passportNumber', 'different', 'browser'],
      ]);
    });

    it('falls back to the fields of the entity type', () => {
      const item = reviewItem(trigger, { name: ['Ever Given'], imoNumber: ['IMO 9811000'] }, { name: ['EVER GIVEN'] });
      item.customer.schema = 'Vessel';
      item.listRecord.schema = 'Vessel';
      item.listRecord.properties['imoNumber'] = ['imo9811000'];
      expect(compareScreeningReviewFields(item).map(({ field, state }) => [field, state])).toEqual([
        ['name', 'same'],
        ['imoNumber', 'same'],
      ]);
    });
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

  it('counts topics and lists in each category', () => {
    expect(
      Object.fromEntries(
        screeningReviewCategoryCounts(
          [
            'sanctions',
            'pep',
            'pep.kind.primary',
            'pep.kind.secondary',
            'pep.category.govt_branch_member',
            'pep.status.active',
            'adverse_media',
            'adverse_media.kind.enforcement',
            'adverse_media.category.asset_freeze',
            'adverse_media.category.excluded_party',
            'alive',
          ],
          ['sanctions'],
        ),
      ),
    ).toEqual({ sanctions: 2, peps: 2, 'adverse-media': 3 });
    expect(
      Object.fromEntries(
        screeningReviewCategoryCounts(['crime.fraud', 'role.pep', 'sanction', 'sanction.linked', 'isAlive'], []),
      ),
    ).toEqual({ sanctions: 2, peps: 1, 'adverse-media': 1 });
    expect(Object.fromEntries(screeningReviewCategoryCounts([], ['peps', 'peps', 'sanctions']))).toEqual({
      peps: 2,
      sanctions: 1,
    });
    expect(Object.fromEntries(screeningReviewCategoryCounts(['filter.something', 'unknown'], []))).toEqual({});
  });

  // A real `object_added` screening from staging, pseudonymized. The customer was screened on
  // first and last name only; the stored payloads carry Motiva `features` but no `explanations`.
  describe('real customer-triggered payload', () => {
    const items = buildScreeningReviewItems([
      reviewCase('case', [adaptContinuousScreening(stagingObjectAddedDto as unknown as ContinuousScreeningDto)]),
    ]);
    const nameRows = (mapped?: string[], withSignals = true) =>
      items.map((item) => {
        const row = compareScreeningReviewFields(withSignals ? item : { ...item, signals: {} }, mapped)[0];
        return [row?.field, row?.state, row?.source, row?.signal];
      });

    it('names the customer from the first and last name', () => {
      expect(items).toHaveLength(3);
      expect(items.every((item) => item.customer.name !== 'user · ' + item.customer.objectId)).toBe(true);
      expect(new Set(items.map((item) => item.customer.name)).size).toBe(1);
    });

    it('lets the stored Motiva features decide the name state', () => {
      expect(nameRows(['firstName', 'lastName'])).toEqual([
        ['name', 'close', 'motiva', 'person_name_phonetic_match'],
        ['name', 'same', 'motiva', 'name_literal_match'],
        ['name', 'close', 'motiva', 'person_name_phonetic_match'],
      ]);
      // Without the features, the browser can't see the phonetic match of the first hit.
      expect(nameRows(['firstName', 'lastName'], false).map(([, state]) => state)).toEqual([
        'different',
        'same',
        'close',
      ]);
    });

    it('compares only the mapped name, or marks the unscreened fields Missing without a mapping', () => {
      expect(items.map((item) => compareScreeningReviewFields(item, ['firstName', 'lastName']).length)).toEqual([
        1, 1, 1,
      ]);
      const fallback = compareScreeningReviewFields(items[1]!);
      expect(fallback[0]?.state).toBe('same');
      expect(fallback.slice(1).every((row) => row.state === 'missing' && !row.customerValues.length)).toBe(true);
      expect(fallback.slice(1).length).toBeGreaterThan(0);
      expect(screeningReviewChipFields(fallback)).toEqual([]);
    });
  });
});

describe('screening review session', () => {
  const items = buildScreeningReviewItems([reviewCase('case', [objectReviewScreening(), datasetReviewScreening()])]);
  const byMatch = (matchId: string) => items.find((item) => item.matchId === matchId)!;
  const decide = (
    item: ScreeningReviewItem,
    decision: 'confirmed_hit' | 'no_hit',
    screening: Partial<ScreeningReviewSession['screenings'][string]> = {},
  ): ScreeningReviewSession => ({
    decided: { [item.id]: { item, decision, written: true } },
    screenings: { [item.screeningId]: { status: 'in_review', caseClosed: false, ...screening } },
    hiddenCases: [],
    escalated: {},
  });
  const listedGroups = (session: ScreeningReviewSession, source = items) =>
    groupScreeningReviewItems(applyScreeningReviewSession(source, session), false, (item) =>
      isListedInScreeningReviewSession(item, session),
    );

  it('skips the other pending hits of a customer-triggered screening on Hit, and nothing on a list update', () => {
    const objectHit = byMatch('screening-1-high');
    const datasetHit = byMatch('dataset-1-alice');
    expect(screeningReviewHitsSkippedBy(items, objectHit).map((item) => item.matchId)).toEqual(['screening-1-low']);
    expect(screeningReviewHitsSkippedBy(items, datasetHit)).toEqual([]);

    const afterObjectHit = applyScreeningReviewSession(items, decide(objectHit, 'confirmed_hit'));
    expect(Object.fromEntries(afterObjectHit.map((item) => [item.matchId, item.status]))).toEqual({
      'screening-1-high': 'confirmed_hit',
      'screening-1-low': 'skipped',
      'dataset-1-alice': 'pending',
      'dataset-1-bob': 'pending',
    });
    const afterDatasetHit = applyScreeningReviewSession(items, decide(datasetHit, 'confirmed_hit'));
    expect(afterDatasetHit.find((item) => item.matchId === 'dataset-1-bob')?.status).toBe('pending');
    expect(applyScreeningReviewSession(items, decide(objectHit, 'no_hit')).map((item) => item.status)).toEqual([
      'no_hit',
      'pending',
      'pending',
      'pending',
    ]);
  });

  it('keeps a partial screening with matches to load listed behind a Hit on the same customer', () => {
    const withHit = objectReviewScreening();
    withHit.matches = withHit.matches.slice(0, 1).map((match) => ({ ...match, status: 'confirmed_hit' as const }));
    const partial = { ...objectReviewScreening(), id: 'screening-2', partial: true };
    partial.matches = partial.matches
      .slice(0, 1)
      .map((match) => ({ ...match, id: `${match.id}-2`, status: 'no_hit' as const }));
    const source = buildScreeningReviewItems([reviewCase('case', [withHit, partial])]);
    const [group] = listedGroups(emptyScreeningReviewSession, source);
    expect(group?.items.map((item) => [item.screeningId, item.status])).toEqual([
      [withHit.id, 'confirmed_hit'],
      ['screening-2', 'no_hit'],
    ]);
    expect(group?.setAside).toBe(0);
  });

  it('keeps decided hits listed after their case leaves the server data, until the case is hidden', () => {
    const decided = byMatch('screening-1-high');
    const session = decide(decided, 'no_hit', { status: 'no_hit', caseClosed: true });
    const groups = listedGroups(session, []);
    expect(groups[0]?.items).toMatchObject([{ id: decided.id, status: 'no_hit', screeningStatus: 'no_hit' }]);
    expect(groups[0]).toMatchObject({ remaining: 0, total: 1 });
    expect(listedGroups({ ...session, hiddenCases: ['case'] }, [])).toEqual([]);
  });

  it('lists the hits of screenings decided this visit, and counts only pending hits as remaining', () => {
    const session = decide(byMatch('screening-1-high'), 'confirmed_hit', { status: 'confirmed_hit' });
    const alice = listedGroups(session)[0]!;
    // After a Hit, the skipped and No hit hits are only counted.
    expect(alice.items.map((item) => [item.matchId, item.status])).toEqual([
      ['screening-1-high', 'confirmed_hit'],
      ['dataset-1-alice', 'pending'],
    ]);
    expect(alice).toMatchObject({ remaining: 1, total: 3, setAside: 1 });
    expect(listedGroups(decide(byMatch('screening-1-high'), 'no_hit'))[0]).toMatchObject({ setAside: 0 });
    expect(listedGroups(emptyScreeningReviewSession).flatMap((group) => group.items)).toHaveLength(4);
  });

  it('settles a group without a Hit once nothing is left to decide and its decisions are written', () => {
    const [high, low] = buildScreeningReviewItems([reviewCase('case', [objectReviewScreening()])]);
    const both = (written: boolean, decision: 'no_hit' | 'confirmed_hit' = 'no_hit'): ScreeningReviewSession => ({
      decided: {
        [high!.id]: { item: high!, decision, written: true },
        [low!.id]: { item: low!, decision: 'no_hit', written },
      },
      screenings: {},
      hiddenCases: [],
      escalated: {},
    });
    const settled = (session: ScreeningReviewSession, source = [high!, low!]) =>
      groupScreeningReviewItems(applyScreeningReviewSession(source, session), false, (item) =>
        isListedInScreeningReviewSession(item, session),
      ).map((group) => isSettledScreeningReviewGroup(group, session));
    expect(settled(emptyScreeningReviewSession)).toEqual([false]);
    // Still undoable: the stack stays.
    expect(settled(both(false))).toEqual([false]);
    expect(settled(both(true))).toEqual([true]);
    // A Hit keeps the group.
    expect(settled(both(true, 'confirmed_hit'))).toEqual([false]);
    // So do matches still to load.
    const partial = [high!, low!].map((item) => ({ ...item, partial: true }));
    expect(settled(both(true), partial)).toEqual([false]);
  });

  it('opens the same customer’s next pending hit first, then the next customer, wrapping around', () => {
    const groups = listedGroups(emptyScreeningReviewSession);
    const [high, datasetAlice, low] = groups[0]!.items;
    const bob = groups[1]!.items[0]!;
    expect(nextPendingScreeningReviewItem(groups, high!.id)?.id).toBe(datasetAlice!.id);
    expect(nextPendingScreeningReviewItem(groups, low!.id)?.id).toBe(high!.id);
    expect(nextPendingScreeningReviewItem(groups, bob.id)?.id).toBe(high!.id);

    const skipped = decide(byMatch('screening-1-high'), 'confirmed_hit', { status: 'confirmed_hit' });
    const afterHit = listedGroups(skipped);
    expect(nextPendingScreeningReviewItem(afterHit, high!.id)?.matchId).toBe('dataset-1-alice');
    const onlyOne = listedGroups(emptyScreeningReviewSession, [high!]);
    expect(nextPendingScreeningReviewItem(onlyOne, high!.id)).toBeUndefined();
  });

  it.each([
    [{ status: 'confirmed_hit' as const }, false, 'confirmed_hit'],
    [{ status: 'no_hit' as const, caseClosed: true }, false, 'case_closed'],
    [{ status: 'no_hit' as const, caseClosed: false }, false, 'closure_pending'],
    [{ status: 'in_review' as const }, true, 'load_more'],
    [{ status: 'in_review' as const }, false, 'in_review'],
  ])('derives the screening state from %o (partial: %s) as %s', (result, partial, state) => {
    const screening = objectReviewScreening();
    screening.partial = partial;
    screening.matches = screening.matches.slice(0, 1);
    const [item] = buildScreeningReviewItems([reviewCase('case', [screening])]);
    const session = decide(item!, 'no_hit', result);
    expect(screeningReviewScreeningState(applyScreeningReviewSession([item!], session), item!, session)).toBe(state);
  });

  it('takes a fresh terminal status over the in_review saved after a failed readback, but not the reverse', () => {
    const decided = byMatch('screening-1-high');
    const readbackFailed = decide(decided, 'confirmed_hit', { status: 'in_review' });
    const refetched = items.map((item) =>
      item.screeningId === decided.screeningId ? { ...item, screeningStatus: 'confirmed_hit' as const } : item,
    );
    const afterRefetch = applyScreeningReviewSession(refetched, readbackFailed);
    expect(afterRefetch.find((item) => item.id === decided.id)?.screeningStatus).toBe('confirmed_hit');
    const fresh = refetched.find((item) => item.id === decided.id)!;
    expect(screeningReviewScreeningState(afterRefetch, fresh, readbackFailed)).toBe('confirmed_hit');

    const confirmed = decide(decided, 'confirmed_hit', { status: 'confirmed_hit' });
    const stale = applyScreeningReviewSession(items, confirmed);
    expect(stale.find((item) => item.id === decided.id)?.screeningStatus).toBe('confirmed_hit');
    expect(screeningReviewScreeningState(stale, decided, confirmed)).toBe('confirmed_hit');
  });

  describe('before the write', () => {
    const unwritten = (
      decisions: readonly (readonly [ScreeningReviewItem, 'confirmed_hit' | 'no_hit'])[],
      screenings: ScreeningReviewSession['screenings'] = {},
    ): ScreeningReviewSession => ({
      decided: Object.fromEntries(decisions.map(([item, decision]) => [item.id, { item, decision, written: false }])),
      screenings,
      hiddenCases: [],
      escalated: {},
    });
    const state = (session: ScreeningReviewSession, matchId: string, source = items) => {
      const applied = applyScreeningReviewSession(source, session);
      return screeningReviewScreeningState(applied, applied.find((item) => item.matchId === matchId)!, session);
    };

    it('predicts a customer-triggered Hit, and leaves a list-update Hit in review until its last hit', () => {
      const session = unwritten([[byMatch('screening-1-high'), 'confirmed_hit']]);
      expect(state(session, 'screening-1-high')).toBe('confirmed_hit');
      expect(state(unwritten([[byMatch('dataset-1-alice'), 'confirmed_hit']]), 'dataset-1-alice')).toBe('in_review');
      expect(
        state(
          unwritten([
            [byMatch('dataset-1-alice'), 'confirmed_hit'],
            [byMatch('dataset-1-bob'), 'no_hit'],
          ]),
          'dataset-1-bob',
        ),
      ).toBe('confirmed_hit');
    });

    it('predicts closure only once every screening of the case ends at no_hit', () => {
      const allObjectHits = unwritten([
        [byMatch('screening-1-high'), 'no_hit'],
        [byMatch('screening-1-low'), 'no_hit'],
      ]);
      // The list-update screening of the same case is still in review.
      expect(state(allObjectHits, 'screening-1-low')).toBe('closure_pending');
      const objectOnly = buildScreeningReviewItems([reviewCase('case', [objectReviewScreening()])]);
      const [high, low] = objectOnly;
      const session = unwritten([
        [high!, 'no_hit'],
        [low!, 'no_hit'],
      ]);
      expect(state(session, 'screening-1-low', objectOnly)).toBe('case_closed');
      expect(state(unwritten([[high!, 'no_hit']]), 'screening-1-high', objectOnly)).toBe('in_review');
    });

    it('keeps a partial screening in review, and prefers the prediction over an older write', () => {
      const screening = objectReviewScreening();
      screening.partial = true;
      screening.matches = screening.matches.slice(0, 1);
      const partial = buildScreeningReviewItems([reviewCase('case', [screening])]);
      expect(state(unwritten([[partial[0]!, 'no_hit']]), 'screening-1-high', partial)).toBe('load_more');

      const objectOnly = buildScreeningReviewItems([reviewCase('case', [objectReviewScreening()])]);
      const [high, low] = objectOnly;
      const session: ScreeningReviewSession = {
        decided: {
          [high!.id]: { item: high!, decision: 'no_hit', written: true },
          [low!.id]: { item: low!, decision: 'no_hit', written: false },
        },
        screenings: { [high!.screeningId]: { status: 'in_review', caseClosed: false } },
        hiddenCases: [],
        escalated: {},
      };
      expect(state(session, 'screening-1-low', objectOnly)).toBe('case_closed');
    });

    it('selects the pending hits of the active hit’s group', () => {
      const groups = listedGroups(unwritten([[byMatch('screening-1-high'), 'no_hit']]));
      const alice = groups[0]!.items.find((item) => item.matchId === 'dataset-1-alice')!;
      expect(screeningReviewGroupPendingItems(groups, alice.id).map((item) => item.matchId)).toEqual([
        'dataset-1-alice',
        'screening-1-low',
      ]);
      expect(screeningReviewGroupPendingItems(groups, 'missing')).toEqual([]);
    });
  });

  it('closes on load only when every screening ended at no_hit and the case is open', () => {
    const noHit = { ...objectReviewScreening(), status: 'no_hit' as const };
    expect(needsFalsePositiveClosure(reviewCase('case', [noHit]))).toBe(true);
    expect(needsFalsePositiveClosure(reviewCase('case', [noHit], { status: 'closed' }))).toBe(false);
    expect(needsFalsePositiveClosure(reviewCase('case', [noHit, objectReviewScreening('other')]))).toBe(false);
    expect(needsFalsePositiveClosure(reviewCase('case', []))).toBe(false);
    expect(needsFalsePositiveClosure(reviewCase('case', [{ ...noHit, status: 'confirmed_hit' }]))).toBe(false);
  });
});

describe('screening review filters', () => {
  const pending = buildScreeningReviewItems([reviewCase('open')]);
  const closed = buildScreeningReviewItems([
    reviewCase(
      'closed',
      [
        {
          ...objectReviewScreening('ended'),
          status: 'no_hit',
          matches: objectReviewScreening('ended').matches.map((match) => ({ ...match, status: 'no_hit' as const })),
        },
      ],
      { status: 'closed' },
    ),
  ]);

  it('splits hits between To review and Validated, and All holds both', () => {
    const items = [...pending, ...closed];
    expect(items.filter((item) => matchesScreeningReviewFilter(item, 'to_review'))).toEqual(pending);
    expect(items.filter((item) => matchesScreeningReviewFilter(item, 'validated'))).toEqual(closed);
    expect(items.filter((item) => matchesScreeningReviewFilter(item, 'all'))).toEqual(items);
    expect(countScreeningReviewFilters(items)).toEqual({ all: 4, to_review: 2, validated: 2 });
  });

  it('counts a pending match of an ended screening as validated', () => {
    const [item] = buildScreeningReviewItems([
      reviewCase('confirmed', [{ ...objectReviewScreening(), status: 'confirmed_hit' }]),
    ]);
    expect(matchesScreeningReviewFilter(item!, 'validated')).toBe(true);
  });

  it('reads a closed case from the server as closed, without a write this visit', () => {
    const [item] = closed;
    expect(screeningReviewScreeningState(closed, item!, emptyScreeningReviewSession)).toBe('case_closed');
    const [open] = buildScreeningReviewItems([
      reviewCase('open-ended', [{ ...objectReviewScreening(), status: 'no_hit' }]),
    ]);
    expect(screeningReviewScreeningState([open!], open!, emptyScreeningReviewSession)).toBe('closure_pending');
  });

  it('lets a refresh that finds the case closed supersede an earlier failed closure', () => {
    const [item] = closed;
    const failedClosure = {
      ...emptyScreeningReviewSession,
      screenings: { [item!.screeningId]: { status: 'no_hit' as const, caseClosed: false } },
    };
    expect(screeningReviewScreeningState(closed, item!, failedClosure)).toBe('case_closed');
  });

  it('takes no decision on a pending hit of a case closed by other means', () => {
    const [item] = buildScreeningReviewItems([
      reviewCase('closed-by-hand', [objectReviewScreening()], { status: 'closed' }),
    ]);
    expect(item?.status).toBe('pending');
    expect(isPendingReviewItem(item!)).toBe(false);
    // Nor are more of its matches offered.
    const partial = buildScreeningReviewItems([
      reviewCase('closed-partial', [{ ...objectReviewScreening(), partial: true }], { status: 'closed' }),
    ]);
    expect(screeningReviewScreeningState(partial, partial[0]!, emptyScreeningReviewSession)).toBe('in_review');
    expect(awaitsMoreMatches(partial[0]!)).toBe(false);
  });
});

describe('screening review tentative reviews', () => {
  const high = 'screening-1-high';
  const low = 'screening-1-low';
  const itemOf = (items: ScreeningReviewItem[], matchId: string) => items.find((item) => item.matchId === matchId)!;

  it.each([
    ['the case’s inbox', 'inbox', { all: 2, to_review: 1, validated: 1 }, undefined],
    ['the inbox the case was escalated from', 'first-inbox', { all: 2, to_review: 2, validated: 0 }, high],
  ] as const)('counts and lists a hit tentatively reviewed in %s', (_, inboxId, counts, nextFromLow) => {
    const items = buildScreeningReviewItems([
      reviewCase('case', [withTentativeReview(objectReviewScreening(), high, { inboxId })]),
    ]);
    expect(countScreeningReviewFilters(items)).toEqual(counts);
    const groups = groupScreeningReviewItems(items);
    expect(groups[0]!.items.map((item) => item.matchId)).toEqual([high, low]);
    expect(groups[0]!.remaining).toBe(counts.to_review);
    expect(nextPendingScreeningReviewItem(groups, itemOf(items, low).id)?.matchId).toBe(nextFromLow);
  });

  it('keeps a hit tentatively reviewed this visit pending until the server reports a final decision', () => {
    const items = buildScreeningReviewItems([reviewCase('case')]);
    const item = itemOf(items, high);
    const session: ScreeningReviewSession = {
      ...emptyScreeningReviewSession,
      decided: {
        [item.id]: {
          item,
          decision: 'confirmed_hit',
          tentativeReview: {
            id: 'session',
            authorId: 'analyst',
            comment: 'Unsure',
            status: 'confirmed_hit',
            inboxId: item.inboxId,
            createdAt: '2026-11-02T10:00:00Z',
          },
          written: true,
        },
      },
    };
    const applied = applyScreeningReviewSession(items, session);
    expect(itemOf(applied, high)).toMatchObject({ status: 'pending', tentativeReview: { id: 'session' } });
    expect(awaitsEscalation(itemOf(applied, high))).toBe(true);
    expect(itemOf(applied, low).status).toBe('pending');
    expect(screeningReviewHitsSkippedBy(applied, itemOf(applied, low)).map((other) => other.matchId)).toEqual([high]);

    const finalized = buildScreeningReviewItems([
      reviewCase('case', [withMatchStatus(withTentativeReview(objectReviewScreening(), high), 'no_hit', [high])]),
    ]);
    expect(itemOf(applyScreeningReviewSession(finalized, session), high)).toMatchObject({
      status: 'no_hit',
      tentativeReview: null,
    });
  });

  it('sets aside a tentatively reviewed hit when a sibling’s final Hit is applied', () => {
    const items = buildScreeningReviewItems([reviewCase('case')]);
    const tentative = itemOf(items, low);
    const hit = itemOf(items, high);
    const session: ScreeningReviewSession = {
      ...emptyScreeningReviewSession,
      decided: {
        [tentative.id]: {
          item: tentative,
          decision: 'no_hit',
          tentativeReview: {
            id: 'session',
            authorId: 'analyst',
            comment: 'Unsure',
            status: 'no_hit',
            inboxId: tentative.inboxId,
            createdAt: '2026-11-02T10:00:00Z',
          },
          written: true,
        },
        [hit.id]: { item: hit, decision: 'confirmed_hit', written: true },
      },
    };
    const applied = applyScreeningReviewSession(items, session);
    expect(itemOf(applied, low)).toMatchObject({ status: 'skipped', tentativeReview: null });
    expect(itemOf(applied, high).status).toBe('confirmed_hit');

    const [group] = groupScreeningReviewItems(applied, false, (item) =>
      isListedInScreeningReviewSession(item, session),
    );
    expect(group?.items.map((item) => item.matchId)).toEqual([high]);
    expect(group).toMatchObject({ setAside: 1 });
  });

  it('predicts the escalation once the case has nothing left to review', () => {
    const withTentative = withTentativeReview(objectReviewScreening(), high);
    const open = buildScreeningReviewItems([reviewCase('case', [withTentative])]);
    expect(willEscalateScreeningReviewCase(open, 'case')).toBe(false);
    expect(canEscalateScreeningReviewCase(open, 'case')).toBe(false);

    const done = buildScreeningReviewItems([reviewCase('case', [withMatchStatus(withTentative, 'no_hit', [low])])]);
    expect(willEscalateScreeningReviewCase(done, 'case')).toBe(true);
    expect(canEscalateScreeningReviewCase(done, 'case')).toBe(true);

    const partial = buildScreeningReviewItems([
      reviewCase('case', [{ ...withMatchStatus(withTentative, 'no_hit', [low]), partial: true }]),
    ]);
    expect(willEscalateScreeningReviewCase(partial, 'case')).toBe(false);
    expect(canEscalateScreeningReviewCase(partial, 'case')).toBe(true);

    const finalOnly = buildScreeningReviewItems([
      reviewCase('case', [withMatchStatus(objectReviewScreening(), 'no_hit')]),
    ]);
    expect(willEscalateScreeningReviewCase(finalOnly, 'case')).toBe(false);
  });

  it('shows a case whose escalation is due as pending escalation, once its decisions are written', () => {
    const due = buildScreeningReviewItems([
      reviewCase('case', [withMatchStatus(withTentativeReview(objectReviewScreening(), high), 'no_hit', [low])]),
    ]);
    expect(screeningReviewScreeningState(due, itemOf(due, high), emptyScreeningReviewSession)).toBe(
      'escalation_pending',
    );
    const unwritten: ScreeningReviewSession = {
      ...emptyScreeningReviewSession,
      decided: { [itemOf(due, low).id]: { item: itemOf(due, low), decision: 'no_hit', written: false } },
    };
    expect(screeningReviewScreeningState(due, itemOf(due, high), unwritten)).not.toBe('escalation_pending');
  });

  it('shows an escalated case as escalated, and keeps its hits listed once the server drops them', () => {
    const items = buildScreeningReviewItems([reviewCase('case', [withTentativeReview(objectReviewScreening(), high)])]);
    const session = { ...emptyScreeningReviewSession, escalated: { case: items } };
    expect(screeningReviewScreeningState(items, itemOf(items, high), session)).toBe('escalated');
    const kept = applyScreeningReviewSession([], session);
    expect(kept.map((item) => item.matchId)).toEqual([high, low]);
    expect(kept.every((item) => isListedInScreeningReviewSession(item, session))).toBe(true);
  });
});

describe('screening review case follow-up', () => {
  const high = 'screening-1-high';
  const low = 'screening-1-low';
  const tentative = withTentativeReview(objectReviewScreening(), high);
  const done = withMatchStatus(tentative, 'no_hit', [low]);
  const ended = (status: 'no_hit' | 'confirmed_hit') => ({
    ...withMatchStatus(objectReviewScreening(), status),
    status,
  });
  const fromInbox = (inboxId: string) =>
    withMatchStatus(withTentativeReview(objectReviewScreening(), high, { inboxId }), 'no_hit', [low]);

  it.each([
    ['escalate', 'the other hit is No hit', reviewCase('case', [done])],
    ['escalate', 'the other hit is Hit', reviewCase('case', [withMatchStatus(tentative, 'confirmed_hit', [low])])],
    ['escalate', 'both hits are tentative', reviewCase('case', [withTentativeReview(tentative, low)])],
    [
      'escalate',
      'a tentative review from its new inbox replaced the earlier one',
      reviewCase('case', [fromInbox('second')], { inboxId: 'second' }),
    ],
    ['none', 'a hit is still to review', reviewCase('case', [tentative])],
    ['none', 'the tentative review is from the inbox it was escalated from', reviewCase('case', [fromInbox('first')])],
    ['none', 'another screening is still to review', reviewCase('case', [done, objectReviewScreening('other')])],
    ['none', 'matches are still to load', reviewCase('case', [{ ...done, partial: true }])],
    ['none', 'it is closed', reviewCase('case', [done], { status: 'closed' })],
    ['none', 'it is assigned to someone else', reviewCase('case', [done], { assignedTo: 'someone-else' })],
    ['close', 'every screening ended at No hit', reviewCase('case', [ended('no_hit')])],
    ['none', 'a screening ended at Hit', reviewCase('case', [ended('confirmed_hit')])],
    ['none', 'no hit is tentative', reviewCase('case', [objectReviewScreening()])],
  ] as const)('follows up with %s when %s', (expected, _, caseDetail) => {
    expect(screeningReviewCaseFollowUp(caseDetail, 'analyst')).toBe(expected);
  });
});
