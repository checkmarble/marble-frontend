import { type ScreeningMatchPayload } from '@app-builder/models/screening';
import { type FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

import { screeningsI18n } from '../screenings-i18n';
import { FreeformMatchCard } from './FreeformMatchCard';

interface FreeformSearchResultsProps {
  results: ScreeningMatchPayload[] | null;
}

export const FreeformSearchResults: FunctionComponent<FreeformSearchResultsProps> = ({ results }) => {
  const { t } = useTranslation(screeningsI18n);

  // Initial state - no search performed yet
  if (results === null) {
    return (
      <div className="bg-surface-card border border-grey-border flex h-full flex-col items-center justify-center gap-4 rounded-md p-8">
        <Icon icon="search" className="text-grey-placeholder size-12" />
        <div className="text-center">
          <p className="text-s text-grey-placeholder">{t('screenings:freeform_search.initial_state')}</p>
        </div>
      </div>
    );
  }

  // No results found
  if (results.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <h2 className="text-l font-semibold text-grey-primary">{t('screenings:freeform_search.results_title')}</h2>
          <span className="text-s text-grey-placeholder">
            {t('screenings:freeform_search.results_count', { count: 0 })}
          </span>
        </div>
        <div className="bg-surface-card border border-grey-border flex flex-col items-center gap-4 rounded-md p-8">
          <Icon icon="search" className="text-grey-placeholder size-12" />
          <div className="text-center">
            <p className="text-s font-semibold text-grey-primary">{t('screenings:freeform_search.no_results_title')}</p>
            <p className="text-s text-grey-placeholder">{t('screenings:freeform_search.no_results_description')}</p>
          </div>
        </div>
      </div>
    );
  }

  // Results found
  return (
    <div className="flex flex-col gap-2">
      <div className="bg-surface-card border border-grey-border flex items-center rounded-md px-4 py-3">
        <div className="text-s flex items-center gap-2">
          <span className="font-semibold text-grey-primary">{t('screenings:freeform_search.results_title')}</span>
          <span className="text-grey-placeholder">
            {t('screenings:freeform_search.results_count', { count: results.length })}
          </span>
        </div>
      </div>

      {results.map((entity) => (
        <FreeformMatchCard key={entity.id} entity={entity} defaultOpen={results.length === 1} />
      ))}
    </div>
  );
};

export default FreeformSearchResults;
