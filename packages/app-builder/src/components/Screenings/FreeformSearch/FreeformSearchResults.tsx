import { type ScreeningMatchPayload } from '@app-builder/models/screening';
import { type FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { match, P } from 'ts-pattern';
import { Icon } from 'ui-icons';

import { screeningsI18n } from '../screenings-i18n';
import { FreeformMatchCard } from './FreeformMatchCard';

interface FreeformSearchResultsProps {
  results: ScreeningMatchPayload[] | null;
}

export const FreeformSearchResults: FunctionComponent<FreeformSearchResultsProps> = ({ results }) => {
  const { t } = useTranslation(screeningsI18n);

  return match(results)
    .with(null, () => (
      // Initial state - no search performed yet
      <div className="bg-surface-card border-grey-border flex h-full flex-col items-center justify-center gap-4 rounded-md border p-8">
        <Icon icon="search" className="text-grey-placeholder size-12" />
        <div className="text-center">
          <p className="text-s text-grey-placeholder">{t('screenings:freeform_search.initial_state')}</p>
        </div>
      </div>
    ))
    .with([], () => (
      // No results found
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <h2 className="text-l text-grey-primary font-semibold">{t('screenings:freeform_search.results_title')}</h2>
          <span className="text-s text-grey-placeholder">
            {t('screenings:freeform_search.results_count', { count: 0 })}
          </span>
        </div>
        <div className="bg-surface-card border-grey-border flex flex-col items-center gap-4 rounded-md border p-8">
          <Icon icon="search" className="text-grey-placeholder size-12" />
          <div className="text-center">
            <p className="text-s text-grey-primary font-semibold">{t('screenings:freeform_search.no_results_title')}</p>
            <p className="text-s text-grey-placeholder">{t('screenings:freeform_search.no_results_description')}</p>
          </div>
        </div>
      </div>
    ))
    .with(P.array(), (data) => (
      // Results found
      <div className="flex flex-col gap-2">
        <div className="bg-surface-card border-grey-border flex items-center rounded-md border px-4 py-3">
          <div className="text-s flex items-center gap-2">
            <span className="text-grey-primary font-semibold">{t('screenings:freeform_search.results_title')}</span>
            <span className="text-grey-placeholder">
              {t('screenings:freeform_search.results_count', { count: data.length })}
            </span>
          </div>
        </div>

        {data.map((entity) => (
          <FreeformMatchCard key={entity.id} entity={entity} defaultOpen={data.length === 1} />
        ))}
      </div>
    ))
    .exhaustive();
};

export default FreeformSearchResults;
