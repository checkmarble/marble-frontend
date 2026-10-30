import type { TracfinBlock } from '@app-builder/models/tracfin';
import type { TracfinBlockAddress } from '../../model/block-address';
import { personContaining } from '../document';

/**
 * The declared person that contains the block an address designates (a link, a manager, a support...),
 * or `null` for a block that lies outside any person (an operation). A virtual address is judged by
 * the block it hangs from.
 */
export function holderPersonId(root: TracfinBlock, address: TracfinBlockAddress): string | null {
  const blockId = address.kind === 'block' ? address.id : address.anchorId;
  return personContaining(root, blockId)?.block.id ?? null;
}
