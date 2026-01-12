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
 * Does NOT use PrintSection wrapper to allow natural page flow with search summary.
 */
export const PrintResults: FunctionComponent<PrintResultsProps> = ({ results }) => {
  const { t } = useTranslation(screeningsI18n);

  if (results.length === 0) {
    return (
      <div className="text-center p-8 border border-grey-border rounded-md">
        <p className="text-s text-grey-placeholder">{t('screenings:freeform_search.no_results_title')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <h2 className="text-m font-semibold text-grey-primary mb-2">
        {t('screenings:freeform_search.results_title')} (
        {t('screenings:freeform_search.results_count', { count: results.length })})
      </h2>
      {results.map((entity) => (
        <PrintResultCard key={entity.id} entity={entity} />
      ))}
    </div>
  );
};

export default PrintResults;
