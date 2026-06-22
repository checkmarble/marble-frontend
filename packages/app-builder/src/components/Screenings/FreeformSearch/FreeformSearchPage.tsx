import { type SearchableSchema } from '@app-builder/constants/screening-entity';
import { type ScreeningMatchPayload } from '@app-builder/models/screening';
import { type ListConfigFilters } from '@app-builder/queries/screening/lists-config';
import { type FreeformSearchInput } from '@app-builder/server-fns/screenings';
import { type FunctionComponent, useCallback, useState } from 'react';

import { FreeformSearchForm } from './FreeformSearchForm';
import { FreeformSearchResults } from './FreeformSearchResults';

export interface FreeformSearchState {
  searchId: string;
  results: ScreeningMatchPayload[];
  inputs: {
    entityType: SearchableSchema;
    fields: Record<string, string>;
    datasets: string[];
    threshold: number | undefined;
    limit: number | undefined;
  };
}

interface FreeformSearchPageProps {
  onSearchComplete?: (state: FreeformSearchState) => void;
  listConfig: ListConfigFilters;
}

export const FreeformSearchPage: FunctionComponent<FreeformSearchPageProps> = ({ onSearchComplete, listConfig }) => {
  const [results, setResults] = useState<ScreeningMatchPayload[] | null>(null);
  const [currentLimit, setCurrentLimit] = useState<number | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState<string | undefined>(undefined);

  const handleSearchComplete = useCallback(
    (result: { id: string; matches: ScreeningMatchPayload[] }, inputs: FreeformSearchInput) => {
      setResults(result.matches);
      setCurrentLimit(inputs.limit);
      // Extract the 'name' field value as the search term for highlighting
      setSearchTerm(inputs.fields.name as string | undefined);
      onSearchComplete?.({
        searchId: result.id,
        results: result.matches,
        inputs: {
          entityType: inputs.entityType,
          fields: inputs.fields as Record<string, string>,
          datasets: inputs.datasets ?? [],
          threshold: inputs.threshold,
          limit: inputs.limit,
        },
      });
    },
    [onSearchComplete],
  );

  return (
    <div className="flex h-full flex-col gap-lg lg:flex-row">
      {/* Left sidebar - filters */}
      <div className="w-full shrink-0 overflow-y-auto lg:w-1/4">
        <FreeformSearchForm onSearchComplete={handleSearchComplete} listConfig={listConfig} />
      </div>

      {/* Right content - results */}
      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">
        <FreeformSearchResults results={results} limit={currentLimit} searchTerm={searchTerm} />
      </div>
    </div>
  );
};

export default FreeformSearchPage;
