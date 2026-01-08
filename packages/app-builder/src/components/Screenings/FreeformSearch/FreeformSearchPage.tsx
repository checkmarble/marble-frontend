import { type ScreeningMatchPayload } from '@app-builder/models/screening';
import { type FunctionComponent, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { screeningsI18n } from '../screenings-i18n';
import { FreeformSearchForm } from './FreeformSearchForm';
import { FreeformSearchResults } from './FreeformSearchResults';

export const FreeformSearchPage: FunctionComponent = () => {
  const { t } = useTranslation(screeningsI18n);
  const [results, setResults] = useState<ScreeningMatchPayload[] | null>(null);

  const handleSearchComplete = useCallback((data: ScreeningMatchPayload[]) => {
    setResults(data);
  }, []);

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Header */}
      <div className="flex shrink-0 flex-col gap-1">
        <h1 className="text-l font-bold text-grey-primary">{t('screenings:freeform_search.title')}</h1>
        <p className="text-s text-grey-placeholder">{t('screenings:freeform_search.description')}</p>
      </div>

      {/* Main content - fills remaining space */}
      <div className="grid min-h-0 flex-1 grid-cols-3 gap-6">
        {/* Form - 1/3 */}
        <div className="col-span-1 overflow-y-auto">
          <div className="bg-surface-card border-grey-border rounded-lg border p-6">
            <FreeformSearchForm onSearchComplete={handleSearchComplete} />
          </div>
        </div>

        {/* Results - 2/3 */}
        <div className="col-span-2 overflow-y-auto">
          <FreeformSearchResults results={results} />
        </div>
      </div>
    </div>
  );
};

export default FreeformSearchPage;
