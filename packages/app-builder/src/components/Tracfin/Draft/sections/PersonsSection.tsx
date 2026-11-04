import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Typo } from 'ui-design-system';
import { useTracfinDraftEditorContext } from '../editor/TracfinDraftEditorContext';
import { TracfinBlockExtrasContext } from '../fields/block-extras';
import { BlockSelectionPanel } from '../persons/BlockSelectionPanel';
import { PersonGroup } from '../persons/PersonGroup';
import { personKinds } from '../persons/person-kinds';
import { computePersonRoles } from '../persons/roles';

/**
 * The people of the declaration: natural persons, legal entities and people not known to the bank,
 * each declared once. Operations, managers and links reference these cards; the roles a person
 * plays there are computed from the document and shown on its card.
 */
export function PersonsSection() {
  const { t } = useTranslation(['tracfin']);
  const { draft } = useTracfinDraftEditorContext();
  const roles = useMemo(() => computePersonRoles(draft.document.root), [draft.document.root]);

  return (
    <TracfinBlockExtrasContext.Provider value={BlockSelectionPanel}>
      <div className="flex flex-col gap-lg">
        <Typo as="h2" variant="title2">
          {t('tracfin:draft.sections.persons')}
        </Typo>
        <p className="text-grey-secondary text-s">{t('tracfin:draft.persons.intro')}</p>
        {personKinds.map((kind) => (
          <PersonGroup key={kind} kind={kind} rolesByPerson={roles} />
        ))}
      </div>
    </TracfinBlockExtrasContext.Provider>
  );
}
