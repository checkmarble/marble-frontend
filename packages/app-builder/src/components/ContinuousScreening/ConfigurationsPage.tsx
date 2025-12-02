import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { useContinuousScreeningConfigurationsQuery } from '@app-builder/queries/continuous-screening/configurations';
import { getRoute } from '@app-builder/utils/routes';
import QueryString from 'qs';
import { useState } from 'react';
import { match } from 'ts-pattern';
import { ButtonV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { BreadCrumbs } from '../Breadcrumbs';
import GridTable from '../GridTable';
import { Page } from '../Page';
import { Spinner } from '../Spinner';
import { CopyToClipboardChip } from './CopyToClipboardChip';
import { CreationModal } from './CreationModal';

export const ConfigurationsPage = () => {
  const configurationsQuery = useContinuousScreeningConfigurationsQuery();
  const [creationModalOpen, setCreationModalOpen] = useState(false);
  const navigate = useAgnosticNavigation();

  const handleCreationSubmit = (value: { name: string; description: string }) => {
    const qs = QueryString.stringify(value, { addQueryPrefix: true });
    navigate({
      pathname: getRoute('/continuous-screening/create'),
      search: qs,
    });
  };

  return (
    <Page.Main>
      <Page.Header className="justify-between">
        <BreadCrumbs />
        <div>
          <ButtonV2 variant="primary" onClick={() => setCreationModalOpen(true)}>
            Add a configuration
          </ButtonV2>
        </div>
      </Page.Header>
      <Page.Container>
        <Page.ContentV2>
          {match(configurationsQuery)
            .with({ isPending: true }, () => (
              <div className="flex flex-col gap-v2-sm items-center justify-center py-10 border border-grey-border rounded-lg bg-white">
                <Spinner className="size-10 text-purple-65" />
                <span>Loading configurations...</span>
              </div>
            ))
            .with({ isError: true }, () => <div>Error</div>)
            .with({ isSuccess: true }, ({ data: configurations }) => {
              if (!configurations) return null;
              if (configurations.length === 0) {
                return (
                  <div className="flex flex-col gap-v2-sm items-center justify-center py-10 border border-grey-border rounded-lg bg-white">
                    <Icon icon="scan-eye" className="size-10 text-purple-65" />
                    <span>No configurations found</span>
                    <ButtonV2 variant="primary" onClick={() => setCreationModalOpen(true)}>
                      <Icon icon="plus" className="size-4" />
                      Add a configuration
                    </ButtonV2>
                  </div>
                );
              }

              return (
                <GridTable.Table className="grid-cols-[minmax(0,_33.33%)_repeat(4,_1fr)]">
                  <GridTable.Row className="font-semibold border-b border-grey-border">
                    <GridTable.Cell>Name of configuration</GridTable.Cell>
                    <GridTable.Cell>Datasets</GridTable.Cell>
                    <GridTable.Cell>Object types</GridTable.Cell>
                    <GridTable.Cell>Target inbox</GridTable.Cell>
                    <GridTable.Cell>Status</GridTable.Cell>
                  </GridTable.Row>
                  {configurations.map((item) => (
                    <GridTable.Row key={item.id} className="hover:bg-grey-98">
                      <GridTable.Cell>
                        <div className="flex gap-v2-md items-center">
                          <span className="truncate">{item.name}</span>
                          <CopyToClipboardChip value={item.stableId} className="min-w-40" />
                        </div>
                      </GridTable.Cell>
                      <GridTable.Cell>{item.datasets.join(', ')}</GridTable.Cell>
                      <GridTable.Cell>{item.objectTypes.join(', ')}</GridTable.Cell>
                      <GridTable.Cell>{item.inbox.name}</GridTable.Cell>
                      <GridTable.Cell>{item.enabled ? 'Active' : 'Inactive'}</GridTable.Cell>
                    </GridTable.Row>
                  ))}
                </GridTable.Table>
              );
            })
            .exhaustive()}
          <CreationModal open={creationModalOpen} onOpenChange={setCreationModalOpen} onSubmit={handleCreationSubmit} />
        </Page.ContentV2>
      </Page.Container>
    </Page.Main>
  );
};
