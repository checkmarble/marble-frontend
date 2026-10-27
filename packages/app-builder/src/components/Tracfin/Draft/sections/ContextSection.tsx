import { useTranslation } from 'react-i18next';
import { Typo } from 'ui-design-system';
import { useTracfinDraftEditorContext } from '../editor/TracfinDraftEditorContext';
import { TracfinBlockEditor } from '../fields/TracfinBlockEditor';
import { rootAddress, topLevelAddress } from './section-addresses';

const ANALYSIS_FIELD_ID = '/ds/analyse';

/** The context of the suspicion (`/ds/context/**`) and the analysis text (`/ds/analyse`, a field of the root). */
export function ContextSection() {
  const { t } = useTranslation(['tracfin']);
  const { draft } = useTracfinDraftEditorContext();
  return (
    <div className="flex flex-col gap-lg">
      <section
        aria-labelledby="tracfin-section-context"
        className="border-grey-border bg-surface-card flex flex-col gap-md rounded-lg border p-md"
      >
        <Typo as="h2" variant="title2" id="tracfin-section-context">
          {t('tracfin:draft.sections.context_context')}
        </Typo>
        <TracfinBlockEditor address={topLevelAddress(draft, '/ds/context')} catalogId="/ds/context" />
      </section>
      <section
        aria-labelledby="tracfin-section-analysis"
        className="border-grey-border bg-surface-card flex flex-col gap-md rounded-lg border p-md"
      >
        <Typo as="h2" variant="title2" id="tracfin-section-analysis">
          {t('tracfin:draft.sections.context_analysis')}
        </Typo>
        <TracfinBlockEditor address={rootAddress(draft)} catalogId="/ds" include={(id) => id === ANALYSIS_FIELD_ID} />
      </section>
    </div>
  );
}
