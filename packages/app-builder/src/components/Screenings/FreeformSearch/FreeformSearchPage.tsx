import { PrintHeader, PrintView } from '@app-builder/components/Print';
import { type ScreeningMatchPayload } from '@app-builder/models/screening';
import { type FreeformSearchInput } from '@app-builder/routes/ressources+/screenings+/freeform-search';
import { useOrganizationDetails } from '@app-builder/services/organization/organization-detail';
import { type FunctionComponent, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { screeningsI18n } from '../screenings-i18n';
import { FreeformSearchForm } from './FreeformSearchForm';
import { PrintResults, type PrintSearchInputs, PrintSearchSummary } from './FreeformSearchPrint';
import { FreeformSearchResults } from './FreeformSearchResults';

export const FreeformSearchPage: FunctionComponent = () => {
  const { t } = useTranslation(screeningsI18n);
  const { currentUser } = useOrganizationDetails();
  const [results, setResults] = useState<ScreeningMatchPayload[] | null>(null);
  const [searchInputs, setSearchInputs] = useState<PrintSearchInputs | null>(null);

  const userName = [currentUser.actorIdentity.firstName, currentUser.actorIdentity.lastName].filter(Boolean).join(' ');

  const handleSearchComplete = useCallback((data: ScreeningMatchPayload[], inputs: FreeformSearchInput) => {
    setResults(data);
    setSearchInputs({
      entityType: inputs.entityType,
      fields: inputs.fields as Record<string, string>,
      datasets: inputs.datasets ?? [],
      threshold: inputs.threshold,
    });
  }, []);

  const hasResults = results !== null && results.length > 0;

  const printAction =
    hasResults && searchInputs ? (
      <PrintView
        title={t('screenings:print.title')}
        trigger={
          <Button variant="secondary">
            <Icon icon="download" className="size-4" />
            {t('screenings:print.open_print_view')}
          </Button>
        }
      >
        <PrintHeader title={t('screenings:print.title')} userName={userName} />
        <PrintSearchSummary searchInputs={searchInputs} />
        <PrintResults results={results} />
      </PrintView>
    ) : undefined;

  return (
    <div className="flex h-full flex-col gap-6 lg:flex-row">
      {/* Left sidebar - filters */}
      <div className="shrink-0 overflow-y-auto w-full lg:w-1/4">
        <div className="bg-surface-card border-grey-border rounded-lg border p-4">
          <FreeformSearchForm onSearchComplete={handleSearchComplete} />
        </div>
      </div>

      {/* Right content - results */}
      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">
        <FreeformSearchResults results={results} action={printAction} />
      </div>
    </div>
  );
};

export default FreeformSearchPage;
