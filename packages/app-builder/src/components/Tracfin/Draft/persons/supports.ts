import type { TracfinBlock } from '@app-builder/models/tracfin';
import { findBlock } from '../model/block-address';
import { walkBlocks } from './document';
import { isSupportCatalogId } from './person-kinds';

/** The supports (financial references) that belong to a person, in document order. */
export function supportsOfPerson(root: TracfinBlock, personBlockId: string): TracfinBlock[] {
  const person = findBlock(root, personBlockId);
  const supports: TracfinBlock[] = [];
  if (person) {
    walkBlocks(person, (block) => {
      if (isSupportCatalogId(block.catalog_id)) supports.push(block);
    });
  }
  return supports;
}

const NOT_IDENTIFYING = /\/@(id|lien|soldeRestant)$/;

/** What tells two supports of one type apart: the first value the analyst entered (an IBAN, a card number...). */
export function supportIdentifier(support: TracfinBlock): string | null {
  for (const [fieldId, values] of Object.entries(support.fields ?? {})) {
    if (NOT_IDENTIFYING.test(fieldId)) continue;
    for (const value of values) if (value.kind === 'text' && value.text?.trim()) return value.text.trim();
  }
  return null;
}
