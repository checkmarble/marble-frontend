import type { DetailedCaseDecision } from '@app-builder/models/cases';
import type { TracfinBlock, TracfinCatalog, TracfinDraft, TracfinMapping } from '@app-builder/models/tracfin';
import { getTracfinCatalogIndex } from '@app-builder/models/tracfin/catalog-index';
import { entry } from './draft-test-data';
import { block, personsDraft, personsTestCatalog, text } from './persons-test-data';

const OP = '/ds/operations/operation';
const ONGOING = '/ds/operations/operationEnCours';
const pattern = (value: string) => ({ kind: 'pattern', value, source_line: 1 });
const DATE = '\\d{2}/\\d{2}/\\d{4}';

/**
 * The persons catalog plus the nodes of the operations section that the cut of the real profile
 * lacks: same ids, cardinalities, required fields and value kinds as the manifest, documentation left
 * out. Existing nodes (operation, montantTotal, the four text-or-reference fields...) are kept.
 */
function buildCatalog(): TracfinCatalog {
  const extra = [
    entry('/ds/operations/dateDebut', '/ds/operations', 'field', '1', '1', { constraints: [pattern(DATE)] }),
    entry('/ds/operations/dateFin', '/ds/operations', 'field', '1', '1', { constraints: [pattern(DATE)] }),
    entry('/ds/operations/soupconElementsNonFinanciers', '/ds/operations', 'field', '0', '1', {
      value_kind: 'boolean',
    }),
    entry(`${OP}/autretypeOperation`, OP, 'field', '0', '1'),
    entry(`${OP}/paysArriveeFonds`, OP, 'field', '0', '1'),
    entry(`${OP}/commentaires`, OP, 'field', '0', '1', {
      constraints: [{ kind: 'maxLength', value: '700', source_line: 1 }],
    }),
    entry(`${ONGOING}/identEmetteur`, ONGOING, 'field', '0', '1', { value_kind: 'reference' }),
    entry(`${ONGOING}/refFinanciere`, ONGOING, 'field', '0', '1', { value_kind: 'reference' }),
    entry(`${ONGOING}/autretypeOperation`, ONGOING, 'field', '0', '1'),
    entry(`${ONGOING}/dateLimiteExecution`, ONGOING, 'field', '1', '1', { constraints: [pattern(DATE)] }),
    entry(`${ONGOING}/heureLimiteExecution`, ONGOING, 'field', '0', '1', { constraints: [pattern('\\d{2}:\\d{2}')] }),
  ];
  const fields = { ...personsTestCatalog.profile.fields };
  for (const field of extra) if (!(field.id in fields)) fields[field.id] = field;
  return { ...personsTestCatalog, profile: { ...personsTestCatalog.profile, hash: 'operations-test-profile', fields } };
}

export const operationsTestCatalog = buildCatalog();
export const operationsTestIndex = getTracfinCatalogIndex(operationsTestCatalog.profile);

/** Canonical lowercase UUIDs, as the server lists them. */
export const DECISION = {
  one: '11111111-1111-4111-8111-111111111111',
  two: '22222222-2222-4222-8222-222222222222',
  three: '33333333-3333-4333-8333-333333333333',
  four: '44444444-4444-4444-8444-444444444444',
} as const;

/** `decision_snapshot` mappings of the configuration: a transfer, and a type that left the data model. */
export const snapshotMappings: TracfinMapping[] = [
  {
    id: 'map-transfer-amount',
    target_field: `${OP}/montantTotal`,
    source: { kind: 'decision_snapshot', historical_type: 'Transfer', field: 'amount' },
  },
  {
    id: 'map-deleted-amount',
    target_field: `${OP}/montantTotal`,
    source: { kind: 'decision_snapshot', historical_type: 'DeletedType', field: 'amount' },
  },
];

export function decision(
  id: string,
  triggerObjectType: string,
  objectId: string,
  extra: Partial<DetailedCaseDecision> = {},
): DetailedCaseDecision {
  return {
    id,
    createdAt: '2026-03-04T10:30:00.000Z',
    triggerObject: { object_id: objectId, amount: 1200.5, label: 'Virement' },
    triggerObjectType,
    outcome: 'decline',
    pivotValues: [],
    scenario: { id: 'scenario-1', name: 'Fraude virements', scenarioIterationId: 'it-1', version: 3 },
    score: 80,
    rules: [],
    screenings: [],
    ...extra,
  };
}

export function line(id: string, decisionId?: string, historicalType = 'Transfer', fields = {}): TracfinBlock {
  return block(
    OP,
    {
      fields,
      ...(decisionId
        ? {
            selection: {
              mapping_id: 'map-transfer-amount',
              root: { id: 'root', table: historicalType },
              decision_id: decisionId,
              historical_type: historicalType,
            },
          }
        : {}),
    },
    id,
  );
}

/** A support of the person `pp-1`, to pick as the financial reference of an operation. */
export const ibanSupport = (id = 'iban-1', iban = 'FR76-PP'): TracfinBlock =>
  block(
    '/ds/personnes/pp/referencesFinancieres',
    {
      children: [
        block(
          '/ds/personnes/pp/referencesFinancieres/referenceFinanciereIban',
          {
            fields: { '/ds/personnes/pp/referencesFinancieres/referenceFinanciereIban/@iban': [text('v-iban', iban)] },
          },
          id,
        ),
      ],
    },
    `${id}-container`,
  );

/**
 * The persons draft (pp-1 Jeanne Martin, with an IBAN) plus the snapshot mappings. `lines` are put
 * under a `/ds/operations` block (id `operations-1`); with no argument the draft has no operations at all.
 */
export function operationsDraft({
  lines,
  ongoing = [],
  fields = {},
  diagnostics,
}: {
  lines?: TracfinBlock[];
  ongoing?: TracfinBlock[];
  fields?: TracfinBlock['fields'];
  diagnostics?: TracfinDraft['diagnostics'];
} = {}): TracfinDraft {
  return personsDraft((draft, persons) => {
    draft.configuration.mappings = [...(draft.configuration.mappings ?? []), ...snapshotMappings];
    persons.children![0]!.children!.push(ibanSupport());
    if (lines) {
      draft.document.root.children!.push(
        block('/ds/operations', { children: [...lines, ...ongoing], ...(fields ? { fields } : {}) }, 'operations-1'),
      );
    }
    if (diagnostics) draft.diagnostics = diagnostics;
  });
}
