import type { TracfinBlock } from '@app-builder/models/tracfin';

/**
 * Where a block lives in the draft document.
 *
 * - `block`: an existing block, by its server id.
 * - `virtual`: a singleton block that is not in the document yet (the draft starts without
 *   `/ds/context`, for instance). It is the chain of catalog ids to create under `anchorId`, the
 *   deepest block that exists. The first edit inside it sends `add_block` (with a temporary alias)
 *   for each missing level, then the edit itself, in one PATCH.
 *
 * Pending edits keep an address, never a block object: when the block appears in the document
 * (after a save, a reload) {@link normalizeAddress} turns the address into the real block.
 */
export type TracfinBlockAddress =
  | { readonly kind: 'block'; readonly id: string }
  | { readonly kind: 'virtual'; readonly anchorId: string; readonly path: readonly string[] };

export const blockAddress = (id: string): TracfinBlockAddress => ({ kind: 'block', id });

export const virtualAddress = (anchorId: string, path: readonly string[]): TracfinBlockAddress => ({
  kind: 'virtual',
  anchorId,
  path,
});

export function addressKey(address: TracfinBlockAddress): string {
  return address.kind === 'block' ? `b:${address.id}` : `v:${address.anchorId}>${address.path.join('>')}`;
}

export function findBlock(root: TracfinBlock, id: string): TracfinBlock | null {
  if (root.id === id) return root;
  for (const child of root.children ?? []) {
    const found = findBlock(child, id);
    if (found) return found;
  }
  return null;
}

/** Ids of the block and of everything below it. */
export function collectBlockIds(block: TracfinBlock, into: Set<string> = new Set()): Set<string> {
  into.add(block.id);
  for (const child of block.children ?? []) collectBlockIds(child, into);
  return into;
}

export function childrenOfCatalogId(block: TracfinBlock | null, catalogId: string): TracfinBlock[] {
  return (block?.children ?? []).filter((child) => child.catalog_id === catalogId);
}

/**
 * The address as the document sees it now: a virtual address whose chain was created (wholly or in
 * part) becomes the real block (or a shorter virtual address). `null` when the anchor is gone.
 */
export function normalizeAddress(root: TracfinBlock, address: TracfinBlockAddress): TracfinBlockAddress | null {
  if (address.kind === 'block') return findBlock(root, address.id) ? address : null;
  let current = findBlock(root, address.anchorId);
  if (!current) return null;
  for (let index = 0; index < address.path.length; index++) {
    const next: TracfinBlock | undefined = childrenOfCatalogId(current, address.path[index]!)[0];
    if (!next) return virtualAddress(current.id, address.path.slice(index));
    current = next;
  }
  return blockAddress(current.id);
}

/** The block an address designates, or `null` when it is virtual (or its block is gone). */
export function resolveAddress(root: TracfinBlock, address: TracfinBlockAddress): TracfinBlock | null {
  const normalized = normalizeAddress(root, address);
  return normalized?.kind === 'block' ? findBlock(root, normalized.id) : null;
}

/** The address of a singleton child of `parent`: the existing block, or the virtual one to create. */
export function singletonChildAddress(
  root: TracfinBlock,
  parent: TracfinBlockAddress,
  childCatalogId: string,
): TracfinBlockAddress {
  const normalizedParent = normalizeAddress(root, parent) ?? parent;
  if (normalizedParent.kind === 'virtual') {
    return virtualAddress(normalizedParent.anchorId, [...normalizedParent.path, childCatalogId]);
  }
  const existing = childrenOfCatalogId(findBlock(root, normalizedParent.id), childCatalogId)[0];
  return existing ? blockAddress(existing.id) : virtualAddress(normalizedParent.id, [childCatalogId]);
}
