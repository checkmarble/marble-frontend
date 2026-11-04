import type { TracfinDraft } from '@app-builder/models/tracfin';
import { blockAddress, singletonChildAddress, type TracfinBlockAddress } from '../model/block-address';

/** Address of the root block `/ds`. */
export const rootAddress = (draft: TracfinDraft): TracfinBlockAddress => blockAddress(draft.document.root.id);

/** Address of a singleton block under the root (`/ds/organisme`...): the block, or the virtual one to create. */
export function topLevelAddress(draft: TracfinDraft, catalogId: string): TracfinBlockAddress {
  return singletonChildAddress(draft.document.root, rootAddress(draft), catalogId);
}
