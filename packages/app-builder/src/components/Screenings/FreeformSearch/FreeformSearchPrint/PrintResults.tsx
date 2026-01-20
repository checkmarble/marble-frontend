import { type ScreeningMatchPayload } from '@app-builder/models/screening';
import { type FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { match, P } from 'ts-pattern';

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

  return match(results)
    .with([], () => (
      <div className="border-grey-border rounded-md border p-8 text-center">
        <p className="text-s text-grey-placeholder">{t('screenings:freeform_search.no_results_title')}</p>
      </div>
    ))
    .with(P.array(), (data) => (
      <div className="flex flex-col">
        <h2 className="text-m text-grey-primary mb-2 font-semibold">
          {t('screenings:freeform_search.results_title')} (
          {t('screenings:freeform_search.results_count', { count: data.length })})
        </h2>
        {data.map((entity) => (
          <PrintResultCard key={entity.id} entity={entity} />
        ))}
      </div>
    ))
    .exhaustive();
};

export default PrintResults;
