import { useTranslation } from 'react-i18next';
import { useTracfinDraftEditorContext } from '../editor/TracfinDraftEditorContext';
import { TracfinBlockEditor } from '../fields/TracfinBlockEditor';
import { topLevelAddress } from '../sections/section-addresses';
import { OPERATIONS_CATALOG_ID, PERIOD_FIELD_IDS } from './operations-model';

/**
 * The period (`dateDebut`, `dateFin`) and the non-financial flag. The period may be proposed by the
 * prefill from the dates of the selected operations; a partial proposal stays « à revoir » until the
 * analyst confirms or corrects it (the generic « Confirmer » flow of the field).
 */
export function OperationPeriod() {
  const { t } = useTranslation(['tracfin']);
  const { draft } = useTracfinDraftEditorContext();
  const wanted = (id: string) => (PERIOD_FIELD_IDS as readonly string[]).includes(id);
  return (
    <section
      aria-label={t('tracfin:draft.operations.period.title')}
      className="border-grey-border flex min-w-0 flex-col gap-md rounded-lg border p-md"
    >
      <h3 className="text-default font-semibold">{t('tracfin:draft.operations.period.title')}</h3>
      <p className="text-grey-secondary text-xs">{t('tracfin:draft.operations.period.help')}</p>
      <TracfinBlockEditor
        address={topLevelAddress(draft, OPERATIONS_CATALOG_ID)}
        catalogId={OPERATIONS_CATALOG_ID}
        include={wanted}
      />
    </section>
  );
}
