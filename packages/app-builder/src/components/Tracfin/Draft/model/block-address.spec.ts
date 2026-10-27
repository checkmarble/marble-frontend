import { describe, expect, it } from 'vitest';
import { cloneDraft, draftWithout, findByCatalogId } from '../test-utils/draft-test-data';
import {
  addressKey,
  blockAddress,
  collectBlockIds,
  normalizeAddress,
  resolveAddress,
  singletonChildAddress,
  virtualAddress,
} from './block-address';

describe('block addresses', () => {
  it('names a missing singleton by the deepest block that exists and the chain to create', () => {
    const draft = draftWithout('/ds/context');
    const root = draft.document.root;
    const address = singletonChildAddress(root, blockAddress(root.id), '/ds/context');
    expect(address).toEqual(virtualAddress(root.id, ['/ds/context']));
    expect(resolveAddress(root, address)).toBeNull();
    // Below a virtual block, the chain grows.
    expect(singletonChildAddress(root, address, '/ds/context/general')).toEqual(
      virtualAddress(root.id, ['/ds/context', '/ds/context/general']),
    );
  });

  it('turns a virtual address into the real block once the document holds it', () => {
    const draft = cloneDraft();
    const root = draft.document.root;
    const context = findByCatalogId(root, '/ds/context')!;
    const general = findByCatalogId(root, '/ds/context/general')!;
    const stale = virtualAddress(root.id, ['/ds/context', '/ds/context/general']);
    expect(normalizeAddress(root, stale)).toEqual(blockAddress(general.id));
    expect(resolveAddress(root, stale)?.id).toBe(general.id);
    // A partially created chain keeps the rest to create.
    const partial = virtualAddress(root.id, ['/ds/context', '/ds/context/information']);
    expect(normalizeAddress(root, partial)).toEqual(virtualAddress(context.id, ['/ds/context/information']));
  });

  it('is null when the anchor is gone, and has distinct keys per address', () => {
    const root = cloneDraft().document.root;
    expect(normalizeAddress(root, blockAddress('missing'))).toBeNull();
    expect(normalizeAddress(root, virtualAddress('missing', ['/ds/x']))).toBeNull();
    expect(addressKey(blockAddress('a'))).not.toBe(addressKey(virtualAddress('a', [])));
  });

  it('collects a subtree', () => {
    const root = cloneDraft().document.root;
    const personnes = findByCatalogId(root, '/ds/personnes')!;
    const ids = collectBlockIds(personnes);
    expect(ids.has(personnes.id)).toBe(true);
    expect(ids.has(findByCatalogId(root, '/ds/personnes/pp/etatCivil')!.id)).toBe(true);
    expect(ids.has(root.id)).toBe(false);
  });
});
