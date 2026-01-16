import { type SearchableSchema } from '@app-builder/constants/screening-entity';
import { type ScreeningMatchPayload } from '@app-builder/models/screening';
import { type FreeformSearchInput } from '@app-builder/routes/ressources+/screenings+/freeform-search';
import { type FunctionComponent, useCallback, useState } from 'react';

import { FreeformSearchForm } from './FreeformSearchForm';
import { FreeformSearchResults } from './FreeformSearchResults';

export interface FreeformSearchState {
  results: ScreeningMatchPayload[];
  inputs: {
    entityType: SearchableSchema;
    fields: Record<string, string>;
    datasets: string[];
    threshold: number | undefined;
  };
}

interface FreeformSearchPageProps {
  onSearchComplete?: (state: FreeformSearchState) => void;
}

export const FreeformSearchPage: FunctionComponent<FreeformSearchPageProps> = ({ onSearchComplete }) => {
  const [results, setResults] = useState<ScreeningMatchPayload[] | null>(null);

  const handleSearchComplete = useCallback(
    (data: ScreeningMatchPayload[], inputs: FreeformSearchInput) => {
      setResults(data);
      onSearchComplete?.({
        results: data,
        inputs: {
          entityType: inputs.entityType,
          fields: inputs.fields as Record<string, string>,
          datasets: inputs.datasets ?? [],
          threshold: inputs.threshold,
        },
      });
    },
    [onSearchComplete],
  );

  return (
    <div className="flex h-full flex-col gap-6 lg:flex-row">
      {/* Left sidebar - filters */}
      <div className="w-full shrink-0 overflow-y-auto lg:w-1/4">
        <div className="bg-surface-card border-grey-border rounded-lg border p-4">
          <FreeformSearchForm onSearchComplete={handleSearchComplete} />
        </div>
      </div>

      {/* Right content - results */}
      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">
        <FreeformSearchResults results={results} />
      </div>
    </div>
  );
};

export default FreeformSearchPage;
