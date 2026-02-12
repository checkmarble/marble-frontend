import { type ScreeningMatchPayload } from '@app-builder/models/screening';
import { type FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { match, P } from 'ts-pattern';

import { Callout } from '../../Callout';
import { screeningsI18n } from '../screenings-i18n';
import { FreeformMatchCard } from './FreeformMatchCard';
import { DEFAULT_LIMIT } from './LimitPopover';

interface FreeformSearchResultsProps {
  results: ScreeningMatchPayload[] | null;
  limit?: number;
  searchTerm?: string;
}

export const FreeformSearchResults: FunctionComponent<FreeformSearchResultsProps> = ({
  results,
  limit,
  searchTerm,
}) => {
  const { t } = useTranslation(screeningsI18n);
  const effectiveLimit = limit ?? DEFAULT_LIMIT;
  const mayHaveMoreResults = results !== null && results.length === effectiveLimit;

  return match(results)
    .with(null, () => (
      // Initial state - no search performed yet
      <div className="bg-surface-card border-grey-border rounded-lg border p-4">
        <p className="text-s text-grey-secondary">{t('screenings:freeform_search.initial_state')}</p>
      </div>
    ))
    .with([], () => (
      // No results found
      <div className="bg-surface-card border-grey-border rounded-lg border p-4">
        <p className="text-s text-grey-secondary">{t('screenings:freeform_search.no_results_title')}</p>
        <p className="text-s text-grey-placeholder mt-1">{t('screenings:freeform_search.no_results_description')}</p>
      </div>
    ))
    .with(P.array(), (data) => (
      // Results found
      <div className="flex flex-col gap-2">
        <div className="bg-surface-card border-grey-border flex flex-col gap-2 rounded-md border px-4 py-3">
          <div className="text-s flex items-center gap-2">
            <span className="text-grey-primary font-semibold">{t('screenings:freeform_search.results_title')}</span>
            <span className="text-grey-placeholder">
              {t('screenings:freeform_search.results_count', { count: data.length })}
            </span>
          </div>
          {mayHaveMoreResults && (
            <Callout color="orange" icon="warning">
              {t('screenings:freeform_search.limit_warning')}
            </Callout>
          )}
        </div>

        {data.map((entity) => (
          <FreeformMatchCard key={entity.id} entity={entity} defaultOpen={data.length === 1} searchTerm={searchTerm} />
        ))}
      </div>
    ))
    .exhaustive();
};

export default FreeformSearchResults;
