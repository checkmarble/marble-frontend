import type { TracfinBlock } from '@app-builder/models/tracfin';
import { walkBlocks } from './document';
import { personCatalogId, personKinds } from './person-kinds';

export type PersonRoleKind =
  /** Manager of a legal entity (`pm/dirigeant/idPersonne`). */
  | 'dirigeant'
  /** Beneficial owner of a legal entity (`pm/dirigeant/idBeneficiaireEffectif`). */
  | 'beneficial_owner'
  /** The other end of a link declared by another person (`lienAutrePersonneDejaDeclaree/idPersonne`). */
  | 'relation_target'
  /** Issuer or beneficiary of an operation. */
  | 'emitter'
  | 'beneficiary'
  | 'other';

export type PersonRole = {
  kind: PersonRoleKind;
  /** The block that holds the reference. */
  holderBlockId: string;
  fieldId: string;
  /** The declared person the holder belongs to (the entity whose manager it is, the person who declared the link...). */
  holderPersonId: string | null;
};

function roleKindOf(fieldId: string): PersonRoleKind {
  const name = fieldId.split('/').pop() ?? '';
  switch (name) {
    case 'idBeneficiaireEffectif':
      return 'beneficial_owner';
    case 'emetteurTypeEmetteur':
    case 'identEmetteur':
      return 'emitter';
    case 'beneficiaireTypeBeneficiaire':
      return 'beneficiary';
    case 'idPersonne':
      return fieldId.includes('/lienAutrePersonneDejaDeclaree/') ? 'relation_target' : 'dirigeant';
    default:
      return 'other';
  }
}

/**
 * The roles each declared person plays elsewhere in the document, read from the references that
 * point to it. A person is declared once and referenced everywhere else, so this is the only place
 * where « who is this person for the declaration » is known: it is computed, never stored.
 * Returns the roles by person block id; a person nobody references has no entry.
 */
export function computePersonRoles(root: TracfinBlock): Map<string, PersonRole[]> {
  const personIds = new Set<string>();
  walkBlocks(root, (block) => {
    if (personKinds.some((kind) => personCatalogId(kind) === block.catalog_id)) personIds.add(block.id);
  });

  const roles = new Map<string, PersonRole[]>();
  walkBlocks(root, (block, ancestors) => {
    const holderPerson = [...ancestors, block].reverse().find((candidate) => personIds.has(candidate.id));
    for (const [fieldId, values] of Object.entries(block.fields ?? {})) {
      for (const value of values) {
        const target = value.kind === 'reference' ? value.reference?.block_id : undefined;
        if (!target || !personIds.has(target)) continue;
        const list = roles.get(target) ?? [];
        list.push({
          kind: roleKindOf(fieldId),
          holderBlockId: block.id,
          fieldId,
          holderPersonId: holderPerson && holderPerson.id !== target ? holderPerson.id : null,
        });
        roles.set(target, list);
      }
    }
  });
  return roles;
}
