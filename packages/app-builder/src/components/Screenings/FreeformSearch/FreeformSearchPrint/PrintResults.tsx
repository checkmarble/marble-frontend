import { PrintSection } from '@app-builder/components/Print';
import { type ScreeningMatchPayload } from '@app-builder/models/screening';
import { type FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import { screeningsI18n } from '../../screenings-i18n';
import { PrintResultCard } from './PrintResultCard';

interface PrintResultsProps {
  results: ScreeningMatchPayload[];
}

/**
 * Print-friendly results list showing all results expanded.
 */
export const PrintResults: FunctionComponent<PrintResultsProps> = ({ results }) => {
  const { t } = useTranslation(screeningsI18n);

  if (results.length === 0) {
    return (
      <PrintSection>
        <div className="text-center p-8 border border-grey-border rounded-md">
          <p className="text-s text-grey-placeholder">{t('screenings:freeform_search.no_results_title')}</p>
        </div>
      </PrintSection>
    );
  }

  return (
    <PrintSection
      title={`${t('screenings:freeform_search.results_title')} (${t('screenings:freeform_search.results_count', { count: results.length })})`}
    >
      <div className="flex flex-col">
        {results.map((entity) => (
          <PrintResultCard key={entity.id} entity={entity} />
        ))}
      </div>
    </PrintSection>
  );
};

export default PrintResults;
