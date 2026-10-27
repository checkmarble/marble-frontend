import type { TracfinCatalogField } from '@app-builder/models/tracfin';

export const PERSONS_CATALOG_ID = '/ds/personnes';

/** The three kinds of declared person: natural person, legal entity, person not known to the bank. */
export const personKinds = ['pp', 'pm', 'pnc'] as const;
export type PersonKind = (typeof personKinds)[number];

export const personCatalogId = (kind: PersonKind): string => `${PERSONS_CATALOG_ID}/${kind}`;

export function personKindOf(catalogId: string): PersonKind | null {
  return personKinds.find((kind) => catalogId === personCatalogId(kind)) ?? null;
}

/** The support (financial reference) types a person can carry, in the order of the XSD. */
export const supportTypes = [
  'Iban',
  'IdentifiantCompte',
  'NumeroCarteBancaire',
  'NumeroCartePrepayee',
  'NumeroCheque',
  'NumeroContrat',
  'CryptoActif',
  'CagnotteEnLigne',
  'PortefeuilleElectronique',
  'Especes',
  'Inconnue',
  'Autre',
] as const;
export type SupportType = (typeof supportTypes)[number];

export const supportsContainerId = (kind: PersonKind): string => `${personCatalogId(kind)}/referencesFinancieres`;

export const supportCatalogId = (kind: PersonKind, type: SupportType): string =>
  `${supportsContainerId(kind)}/referenceFinanciere${type}`;

/** True for the catalog id of a support block (`/ds/personnes/<kind>/referencesFinancieres/referenceFinanciere<Type>`). */
export function isSupportCatalogId(catalogId: string): boolean {
  return /^\/ds\/personnes\/(pp|pm|pnc)\/referencesFinancieres\/referenceFinanciere[A-Za-z]+$/.test(catalogId);
}

/** A person's links with other people: to a declared person, to a natural person or to a legal entity that is not declared. */
export const relationBlockNames = ['lienAutrePersonneDejaDeclaree', 'lienAutrePp', 'lienAutrePm'] as const;
export type RelationBlockName = (typeof relationBlockNames)[number];

export const relationCatalogId = (kind: PersonKind, name: RelationBlockName): string =>
  `${personCatalogId(kind)}/${name}`;

export function relationNameOf(catalogId: string): RelationBlockName | null {
  const match = /^\/ds\/personnes\/(?:pp|pm|pnc)\/(lienAutrePersonneDejaDeclaree|lienAutrePp|lienAutrePm)$/.exec(
    catalogId,
  );
  return (match?.[1] as RelationBlockName | undefined) ?? null;
}

/** The sub-blocks of a person that carry the client's identity: where a root selection goes when a person is added from client data. */
export const identityBlockIds: Record<'pp' | 'pm', readonly string[]> = {
  pp: ['/ds/personnes/pp/etatCivil'],
  pm: ['/ds/personnes/pm/activiteCoordonnee'],
};

/** What a reference field points to, from the backend `referenceTarget` rules (they go by the field name). */
export type ReferenceTarget =
  | { kind: 'person' }
  | { kind: 'piece' }
  /** `personFieldName`: the sibling field of the same block that names the person the support belongs to. */
  | { kind: 'support'; personFieldName: string };

const PERSON_REFERENCE_NAMES = new Set([
  'idPersonne',
  'idBeneficiaireEffectif',
  'emetteurTypeEmetteur',
  'beneficiaireTypeBeneficiaire',
  'identEmetteur',
]);

const PIECE_REFERENCE_NAMES = new Set(['idPieceJointe', 'idPieceJointeDonneesConnexion']);

const SUPPORT_PERSON_FIELD: Record<string, string> = {
  refFinanciereEmission: 'emetteurTypeEmetteur',
  refFinanciereReception: 'beneficiaireTypeBeneficiaire',
  refFinanciere: 'identEmetteur',
};

export function referenceTargetOf(field: Pick<TracfinCatalogField, 'id' | 'name'>): ReferenceTarget | null {
  const name = field.id.split('/').pop() ?? field.name;
  if (PERSON_REFERENCE_NAMES.has(name)) return { kind: 'person' };
  if (PIECE_REFERENCE_NAMES.has(name)) return { kind: 'piece' };
  const personFieldName = SUPPORT_PERSON_FIELD[name];
  return personFieldName ? { kind: 'support', personFieldName } : null;
}

export const PIECE_CATALOG_ID = '/ds/pieceJointe/piece';

/** `/ds/personnes/pp/referencesFinancieres/referenceFinanciereIban` -> `Iban`. */
export function supportTypeOf(catalogId: string): SupportType | null {
  const name = /\/referenceFinanciere([A-Za-z]+)$/.exec(catalogId)?.[1];
  return supportTypes.find((type) => type === name) ?? null;
}
