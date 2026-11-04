import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTracfinDraftEditorContext } from '../editor/TracfinDraftEditorContext';
import { personDisplayName } from './display-name';
import { declaredPersons } from './document';
import type { PersonKind } from './person-kinds';

export type DeclaredPersonEntry = {
  id: string;
  kind: PersonKind;
  /** The computed name, or the placeholder when the person has none yet. */
  name: string;
  hasName: boolean;
};

/**
 * The declared people of the draft, with the name each goes by. The people are declared once, in
 * the Persons section; everything else (operations, managers, links) references them by block id.
 */
export function useDeclaredPersons(): DeclaredPersonEntry[] {
  const { t } = useTranslation(['tracfin']);
  const { draft } = useTracfinDraftEditorContext();
  const root = draft.document.root;
  const unnamed = t('tracfin:draft.persons.unnamed');
  return useMemo(
    () =>
      declaredPersons(root).map(({ block, kind }) => {
        const name = personDisplayName(block, kind);
        return { id: block.id, kind, name: name ?? unnamed, hasName: name !== null };
      }),
    [root, unnamed],
  );
}

/** Name lookup by block id for the people of the draft. */
export function usePersonNameOf(): (blockId: string) => string | null {
  const persons = useDeclaredPersons();
  return (blockId) => persons.find((person) => person.id === blockId)?.name ?? null;
}
