import type { TracfinBlock } from '@app-builder/models/tracfin';
import { childrenOfCatalogId } from '../model/block-address';
import { PERSONS_CATALOG_ID, type PersonKind, PIECE_CATALOG_ID, personCatalogId, personKinds } from './person-kinds';

/** Every block of the document, depth first. */
export function walkBlocks(
  block: TracfinBlock,
  visit: (block: TracfinBlock, ancestors: readonly TracfinBlock[]) => void,
) {
  const go = (current: TracfinBlock, ancestors: readonly TracfinBlock[]) => {
    visit(current, ancestors);
    for (const child of current.children ?? []) go(child, [...ancestors, current]);
  };
  go(block, []);
}

/** The blocks from the root down to the block with this id (both included), or `[]`. */
export function pathTo(root: TracfinBlock, blockId: string): TracfinBlock[] {
  if (root.id === blockId) return [root];
  for (const child of root.children ?? []) {
    const path = pathTo(child, blockId);
    if (path.length > 0) return [root, ...path];
  }
  return [];
}

export function personsContainer(root: TracfinBlock): TracfinBlock | null {
  return childrenOfCatalogId(root, PERSONS_CATALOG_ID)[0] ?? null;
}

export function personsOfKind(root: TracfinBlock, kind: PersonKind): TracfinBlock[] {
  return childrenOfCatalogId(personsContainer(root), personCatalogId(kind));
}

/** Every declared person, natural persons first, in document order within a kind. */
export function declaredPersons(root: TracfinBlock): { block: TracfinBlock; kind: PersonKind }[] {
  return personKinds.flatMap((kind) => personsOfKind(root, kind).map((block) => ({ block, kind })));
}

/** The pieces of the declaration (`/ds/pieceJointe/piece`), as Task 7 creates them. */
export function declaredPieces(root: TracfinBlock): TracfinBlock[] {
  const container = childrenOfCatalogId(root, '/ds/pieceJointe')[0] ?? null;
  return childrenOfCatalogId(container, PIECE_CATALOG_ID);
}

/** The first non-empty text of a field of a block (a cleared or empty occurrence holds nothing). */
export function firstText(block: TracfinBlock | null | undefined, fieldId: string): string | null {
  for (const value of block?.fields?.[fieldId] ?? []) {
    if (value.kind === 'text' && value.text && value.text.trim() !== '') return value.text.trim();
  }
  return null;
}

/** The nearest declared person that contains the block (the block itself when it is one). */
export function personContaining(
  root: TracfinBlock,
  blockId: string,
): { block: TracfinBlock; kind: PersonKind } | null {
  const path = pathTo(root, blockId);
  for (let index = path.length - 1; index >= 0; index--) {
    const candidate = path[index]!;
    const kind = personKinds.find((entry) => personCatalogId(entry) === candidate.catalog_id);
    if (kind) return { block: candidate, kind };
  }
  return null;
}

/** The record of the client base a person is attached to: the root of the first selection among its blocks. */
export function personRoot(person: TracfinBlock): { table: string; recordId: string } | null {
  let found: { table: string; recordId: string } | null = null;
  walkBlocks(person, (block) => {
    const root = block.selection?.root;
    if (!found && root?.record_id) found = { table: root.table, recordId: root.record_id };
  });
  return found;
}
