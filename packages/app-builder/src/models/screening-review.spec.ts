import { type ContinuousScreeningDto } from 'marble-api';
import { describe, expect, it } from 'vitest';
import { adaptContinuousScreening } from './continuous-screening';
import {
  adjacentScreeningReviewItem,
  buildScreeningReviewItems,
  compareScreeningReviewFields,
  groupScreeningReviewItems,
  type ScreeningReviewSignals,
  screeningReviewChipFields,
  screeningReviewTopicFamilies,
} from './screening-review';
import stagingObjectAddedDto from './screening-review.staging-object-added.json';
import { datasetReviewScreening, objectReviewScreening, reviewCase } from './screening-review.test-helpers';

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
      // Nationality: ISO codes or English names, no Close.
      { field: 'nationality', customer: ['Egypt'], list: ['eg'], state: 'same' },
      { field: 'nationality', customer: ['France'], list: ['eg'], state: 'different' },
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
