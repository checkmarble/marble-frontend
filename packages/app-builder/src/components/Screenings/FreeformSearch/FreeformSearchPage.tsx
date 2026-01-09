import { type ScreeningMatchPayload } from '@app-builder/models/screening';
import { type FunctionComponent, useCallback, useState } from 'react';

import { FreeformSearchForm } from './FreeformSearchForm';
import { FreeformSearchResults } from './FreeformSearchResults';

export const FreeformSearchPage: FunctionComponent = () => {
  const [results, setResults] = useState<ScreeningMatchPayload[] | null>(null);

  const handleSearchComplete = useCallback((data: ScreeningMatchPayload[]) => {
    setResults(data);
  }, []);

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Form - full width at top */}
      <div className="bg-surface-card border-grey-border shrink-0 rounded-lg border p-4">
        <FreeformSearchForm onSearchComplete={handleSearchComplete} />
      </div>

      {/* Results - fills remaining space */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <FreeformSearchResults results={results} />
      </div>
    </div>
  );
};

export default FreeformSearchPage;
