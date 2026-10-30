import { useTranslation } from 'react-i18next';
import { useTracfinDraftEditorContext } from '../editor/TracfinDraftEditorContext';
import { FieldEditor } from '../fields/FieldEditor';
import { topLevelAddress } from '../sections/section-addresses';
import { GLOBAL_AMOUNT_FIELD_ID, OPERATIONS_CATALOG_ID } from './operations-model';

/**
 * The global suspicion amount, on its own: typed by the analyst as an exact decimal string and saved
 * like any other field. It is never the sum of the lines (two lines may record the same object), so
 * the screen computes, suggests and displays no total of any kind.
 */
export function GlobalAmount() {
  const { t } = useTranslation(['tracfin']);
  const { draft, catalogIndex } = useTracfinDraftEditorContext();
  const field = catalogIndex.field(GLOBAL_AMOUNT_FIELD_ID);
  if (!field) return null;
  return (
    <section
      aria-label={t('tracfin:draft.operations.global_amount.title')}
      className="border-grey-border flex min-w-0 flex-col gap-md rounded-lg border p-md"
    >
      <h3 className="text-default font-semibold">{t('tracfin:draft.operations.global_amount.title')}</h3>
      <p className="text-grey-secondary text-xs">{t('tracfin:draft.operations.global_amount.help')}</p>
      <FieldEditor address={topLevelAddress(draft, OPERATIONS_CATALOG_ID)} field={field} />
    </section>
  );
}
