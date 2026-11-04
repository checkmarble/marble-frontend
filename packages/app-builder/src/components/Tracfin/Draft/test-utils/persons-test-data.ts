import type {
  TracfinBlock,
  TracfinCatalog,
  TracfinCatalogField,
  TracfinDraft,
  TracfinMapping,
} from '@app-builder/models/tracfin';
import { getTracfinCatalogIndex } from '@app-builder/models/tracfin/catalog-index';
import { cloneDraft, draftTestCatalog, entry, findByCatalogId } from './draft-test-data';

type Spec = [id: string, kind: 'block' | 'field', min: string, max: string, extra?: Partial<TracfinCatalogField>];

const parentOf = (id: string) => id.replace(/\/[^/]+$/, '');

function node([id, kind, min, max, extra]: Spec): TracfinCatalogField {
  const name = id.split('/').pop() ?? id;
  return entry(id, parentOf(id), kind, min, max, { attribute: name.startsWith('@'), ...extra });
}

const relationCodes = ['relationsentrepersonnes.csv'];

/** The three links of a person, as in the real profile (cardinality, required fields, code lists). */
function relationSpecs(kind: string): Spec[] {
  const base = `/ds/personnes/${kind}`;
  const common = (name: string): Spec[] => [
    [`${base}/${name}`, 'block', '0', '10'],
    [`${base}/${name}/typeRelation`, 'block', '0', '10'],
    [`${base}/${name}/typeRelation/categorieRelation`, 'field', '1', '1', { catalogs: relationCodes }],
    [`${base}/${name}/typeRelation/sousCategorieRelation`, 'field', '0', '1', { catalogs: relationCodes }],
    [`${base}/${name}/precisionRelation`, 'field', '0', '1'],
    [`${base}/${name}/certitude`, 'field', '0', '1', { value_kind: 'boolean' }],
  ];
  return [
    ...common('lienAutrePersonneDejaDeclaree'),
    [`${base}/lienAutrePersonneDejaDeclaree/idPersonne`, 'field', '1', '1', { value_kind: 'reference' }],
    [`${base}/lienAutrePersonneDejaDeclaree/precisions`, 'field', '0', '1'],
    ...common('lienAutrePp'),
    [`${base}/lienAutrePp/nom`, 'field', '1', '1'],
    [`${base}/lienAutrePp/prenom`, 'field', '1', '1'],
    ...common('lienAutrePm'),
    [`${base}/lienAutrePm/denominationSociale`, 'field', '1', '1'],
  ];
}

const supportAttributes: Record<string, [name: string, min: string][]> = {
  Iban: [
    ['lien', '0'],
    ['iban', '1'],
  ],
  IdentifiantCompte: [
    ['lien', '0'],
    ['bic', '1'],
    ['numeroCompte', '0'],
  ],
  NumeroCarteBancaire: [
    ['lien', '0'],
    ['numeroCarteBancaire', '1'],
  ],
  NumeroCartePrepayee: [
    ['lien', '0'],
    ['NumeroCartePrepayee', '1'],
  ],
  NumeroCheque: [
    ['lien', '0'],
    ['NumeroCheque', '1'],
  ],
  NumeroContrat: [
    ['lien', '0'],
    ['NumeroContrat', '1'],
  ],
  CryptoActif: [
    ['lien', '0'],
    ['CryptoActif', '0'],
  ],
  CagnotteEnLigne: [
    ['lien', '0'],
    ['CagnotteEnLigne', '1'],
  ],
  PortefeuilleElectronique: [
    ['lien', '0'],
    ['PortefeuilleElectronique', '0'],
  ],
  Especes: [['lien', '0']],
  Inconnue: [['lien', '0']],
  Autre: [
    ['lien', '0'],
    ['AutreType', '1'],
    ['NumeroReference', '1'],
  ],
};

/** The twelve support blocks of a person, with their attributes (the calculated `@id` included). */
function supportSpecs(kind: string): Spec[] {
  const container = `/ds/personnes/${kind}/referencesFinancieres`;
  return [
    [container, 'block', '0', '1'],
    ...Object.entries(supportAttributes).flatMap(([type, attributes]): Spec[] => [
      [`${container}/referenceFinanciere${type}`, 'block', '0', '20'],
      [`${container}/referenceFinanciere${type}/@id`, 'field', '1', '1', { coverage: 'calculated' }],
      ...attributes.map(([name, min]): Spec => [`${container}/referenceFinanciere${type}/@${name}`, 'field', min, '1']),
    ]),
  ];
}

const specs: Spec[] = [
  ['/ds/personnes', 'block', '0', '1'],
  ['/ds/personnes/pp', 'block', '0', '30'],
  ['/ds/personnes/pp/etatCivil', 'block', '1', '1'],
  ['/ds/personnes/pp/etatCivil/nomNaissance', 'field', '0', '1'],
  ['/ds/personnes/pp/etatCivil/nomDusage', 'field', '0', '1'],
  ['/ds/personnes/pp/etatCivil/prenom', 'field', '0', '5'],
  ['/ds/personnes/pp/etatCivil/dateNaissance', 'field', '0', '1'],
  ['/ds/personnes/pp/etatCivil/idPieceJointe', 'field', '0', '15', { value_kind: 'reference' }],
  ['/ds/personnes/pp/activite', 'block', '0', '1'],
  ['/ds/personnes/pp/activite/denominationSociale', 'field', '0', '1'],
  ...supportSpecs('pp'),
  ...relationSpecs('pp'),
  ['/ds/personnes/pm', 'block', '0', '30'],
  ['/ds/personnes/pm/implication', 'field', '1', '1'],
  ['/ds/personnes/pm/activiteCoordonnee', 'block', '1', '1'],
  ['/ds/personnes/pm/activiteCoordonnee/denominationSociale', 'field', '0', '1'],
  ['/ds/personnes/pm/activiteCoordonnee/enseigneSigle', 'field', '0', '1'],
  ['/ds/personnes/pm/dirigeant', 'block', '0', '3'],
  ['/ds/personnes/pm/dirigeant/autreDirigeantP/nom', 'field', '0', '1'],
  ['/ds/personnes/pm/dirigeant/autreDirigeantP/prenom', 'field', '0', '1'],
  ['/ds/personnes/pm/dirigeant/autreDirigeantM/denominationSociale', 'field', '0', '1'],
  ['/ds/personnes/pm/dirigeant/idBeneficiaireEffectif', 'field', '0', '1', { value_kind: 'reference' }],
  ...supportSpecs('pm'),
  ...relationSpecs('pm'),
  ['/ds/personnes/pnc', 'block', '0', '30'],
  ['/ds/personnes/pnc/implication', 'field', '0', '1'],
  ['/ds/personnes/pnc/elementsIdentification', 'field', '0', '1'],
  ...supportSpecs('pnc'),
  ...relationSpecs('pnc'),
  ['/ds/pieceJointe/piece', 'block', '1', '15'],
  ['/ds/pieceJointe/piece/libelle', 'field', '0', '1'],
  ['/ds/operations/operation/emetteurTypeEmetteur', 'field', '0', '1', { value_kind: 'text_or_reference' }],
  ['/ds/operations/operation/refFinanciereEmission', 'field', '0', '1', { value_kind: 'text_or_reference' }],
];

/**
 * The draft test catalog plus the nodes of the persons section that the cut of the real profile
 * lacks: the same ids, cardinalities, required fields and value kinds as the manifest, only the
 * documentation left out. Existing nodes are kept as they are.
 */
function buildCatalog(): TracfinCatalog {
  const fields = { ...draftTestCatalog.profile.fields };
  for (const spec of specs) if (!(spec[0] in fields)) fields[spec[0]] = node(spec);
  return {
    ...draftTestCatalog,
    profile: {
      ...draftTestCatalog.profile,
      hash: 'persons-test-profile',
      fields,
      codes: {
        ...draftTestCatalog.profile.codes,
        'relationsentrepersonnes.csv': [
          { value: 'TLP54', label: 'Lien familial' },
          { value: 'TLP57', label: 'Economique ou financier' },
        ],
      },
    },
  };
}

export const personsTestCatalog = buildCatalog();
export const personsTestIndex = getTracfinCatalogIndex(personsTestCatalog.profile);

/** Mappings the persons tests add to the draft configuration: a company can fill a legal entity. */
export const companyMappings: TracfinMapping[] = [
  {
    id: 'map-company-name',
    target_field: '/ds/personnes/pm/activiteCoordonnee/denominationSociale',
    source: { kind: 'ingested', entity_type: 'Company', table: 'companies', field: 'name' },
  },
];

let counter = 0;
export function block(
  catalogId: string,
  extra: Partial<TracfinBlock> = {},
  id: string = `${catalogId.split('/').slice(-2).join('-')}-${++counter}`,
): TracfinBlock {
  return { id, catalog_id: catalogId, ...extra };
}

export const text = (id: string, value: string) => ({ id, kind: 'text' as const, text: value });
export const reference = (id: string, blockId: string, personBlockId?: string) => ({
  id,
  kind: 'reference' as const,
  reference: { block_id: blockId, ...(personBlockId ? { person_block_id: personBlockId } : {}) },
});

/**
 * The fixture draft with its person given a name, and the company mapping added to the copied
 * configuration. The person has the id `pp-1`; it keeps the selections of the fixture (users /
 * user_8841).
 */
export function personsDraft(mutate?: (draft: TracfinDraft, persons: TracfinBlock) => void): TracfinDraft {
  const draft = cloneDraft();
  draft.configuration.mappings = [...(draft.configuration.mappings ?? []), ...companyMappings];
  const persons = findByCatalogId(draft.document.root, '/ds/personnes')!;
  const pp = persons.children![0]!;
  pp.id = 'pp-1';
  const civil = pp.children!.find((child) => child.catalog_id === '/ds/personnes/pp/etatCivil')!;
  civil.id = 'civil-1';
  civil.fields = {
    '/ds/personnes/pp/etatCivil/nomNaissance': [text('v-nom', 'Martin')],
    '/ds/personnes/pp/etatCivil/prenom': [text('v-prenom', 'Jeanne')],
  };
  mutate?.(draft, persons);
  return draft;
}
