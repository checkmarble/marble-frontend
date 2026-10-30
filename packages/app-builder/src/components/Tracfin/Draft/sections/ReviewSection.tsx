import { useTranslation } from 'react-i18next';
import { Typo } from 'ui-design-system';
import { ExportOutcomeNotice } from '../review/ExportOutcomeNotice';
import { LastExportCard } from '../review/LastExportCard';
import { ReviewActions } from '../review/ReviewActions';
import { ValidationCard } from '../review/ValidationCard';

/**
 * Review and export of the SAVED revision: the internal checks with their layers and diagnostics (each
 * one leads to its field), the export, and the last export with its integrity-checked download.
 * Exporting never closes the case, changes its status or touches the manual SAR.
 */
export function ReviewSection() {
  const { t } = useTranslation(['tracfin']);
  return (
    <div className="flex flex-col gap-lg">
      <Typo as="h2" variant="title2">
        {t('tracfin:draft.sections.review')}
      </Typo>
      <p className="text-grey-secondary text-s">{t('tracfin:draft.review.intro')}</p>
      <p className="text-grey-secondary text-s">{t('tracfin:draft.review.wording_note')}</p>
      <ReviewActions />
      <ExportOutcomeNotice />
      <ValidationCard />
      <LastExportCard />
    </div>
  );
}
