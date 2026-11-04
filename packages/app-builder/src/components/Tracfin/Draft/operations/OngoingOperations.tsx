import { useTranslation } from 'react-i18next';
import { useTracfinDraftEditorContext } from '../editor/TracfinDraftEditorContext';
import { ChildBlocks } from '../fields/ChildBlocks';
import { topLevelAddress } from '../sections/section-addresses';
import { ONGOING_OPERATION_CATALOG_ID, OPERATIONS_CATALOG_ID } from './operations-model';

/**
 * Operations in progress, declared by hand (up to 30): the issuer is a declared person and the
 * financial reference a support of that person, both picked with the Persons section's pickers.
 */
export function OngoingOperations() {
  const { t } = useTranslation(['tracfin']);
  const { draft, catalogIndex } = useTracfinDraftEditorContext();
  const child = catalogIndex.field(ONGOING_OPERATION_CATALOG_ID);
  if (!child) return null;
  return (
    <section
      aria-label={t('tracfin:draft.operations.ongoing.title')}
      className="border-grey-border flex min-w-0 flex-col gap-md rounded-lg border p-md"
    >
      <p className="text-grey-secondary text-xs">{t('tracfin:draft.operations.ongoing.help')}</p>
      <ChildBlocks parent={topLevelAddress(draft, OPERATIONS_CATALOG_ID)} child={child} />
    </section>
  );
}
