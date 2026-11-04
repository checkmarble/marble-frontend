import { useTranslation } from 'react-i18next';
import { Typo } from 'ui-design-system';
import { useTracfinDraftEditorContext } from '../editor/TracfinDraftEditorContext';
import { TracfinBlockEditor } from '../fields/TracfinBlockEditor';
import { topLevelAddress } from './section-addresses';

const BLOCKS = [
  { catalogId: '/ds/organisme', titleKey: 'tracfin:draft.sections.declaration_organisme' },
  { catalogId: '/ds/declarant', titleKey: 'tracfin:draft.sections.declaration_declarant' },
  { catalogId: '/ds/contact', titleKey: 'tracfin:draft.sections.declaration_contact' },
] as const;

/** Organisme, déclarant and contact. The blocks the draft does not hold yet are created by the first value typed in them. */
export function DeclarationSection() {
  const { t } = useTranslation(['tracfin']);
  const { draft } = useTracfinDraftEditorContext();
  return (
    <div className="flex flex-col gap-lg">
      {BLOCKS.map(({ catalogId, titleKey }) => (
        <section
          key={catalogId}
          aria-labelledby={`tracfin-section-${catalogId}`}
          className="border-grey-border bg-surface-card flex flex-col gap-md rounded-lg border p-md"
        >
          <Typo as="h2" variant="title2" id={`tracfin-section-${catalogId}`}>
            {t(titleKey)}
          </Typo>
          <TracfinBlockEditor address={topLevelAddress(draft, catalogId)} catalogId={catalogId} />
        </section>
      ))}
    </div>
  );
}
