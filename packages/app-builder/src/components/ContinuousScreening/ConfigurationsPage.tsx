import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import {
  ContinuousScreeningConfig,
  PrevalidationCreateContinuousScreeningConfig,
} from '@app-builder/models/continuous-screening';
import { useContinuousScreeningConfigurationsQuery } from '@app-builder/queries/continuous-screening/configurations';
import QueryString from 'qs';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Button, ExpandableGroupTagLine, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { CopyToClipboardButton } from '../CopyToClipboardButton';
import GridTable from '../GridTable';
import { makeDatasetsMap } from '../ListAndTopicConfiguration/dataset-selection-provider-utils';
import { useDatasetTitle } from '../ListAndTopicConfiguration/dataset-utils';
import { Page } from '../Page';
import { PanelRoot } from '../Panel/Panel';
import { Spinner } from '../Spinner';
import { ConfigurationPanel } from './ConfigurationPanel';
import { CreationModal } from './CreationModal';
import { PartialCreateContinuousScreeningConfig } from './context/CreationStepper';
import { EditionValidationPanel } from './EditionValidationPanel';

export const ConfigurationsPage = ({ canEdit }: { canEdit: boolean }) => {
  const { t } = useTranslation(['common', 'continuousScreening', 'navigation']);
  const { formatDatasetTitle } = useDatasetTitle();
  const configurationsQuery = useContinuousScreeningConfigurationsQuery();
  const [creationModalOpen, setCreationModalOpen] = useState(false);
  const navigate = useAgnosticNavigation();

  const [editingConfig, setEditingConfig] = useState<ContinuousScreeningConfig | null>(null);
  const [draft, setDraft] = useState<PartialCreateContinuousScreeningConfig | null>(null);
  const [updatedConfig, setUpdatedConfig] = useState<PrevalidationCreateContinuousScreeningConfig | null>(null);

  const handlePanelOpenChange = () => {
    setEditingConfig(null);
    setDraft(null);
    setUpdatedConfig(null);
  };

  const handleCreationSubmit = (value: { name: string; description: string }) => {
    const qs = QueryString.stringify(value, { addQueryPrefix: true });

    navigate({
      pathname: '/continuous-screening/create',
      search: qs,
    });
  };

  const handleRowClick = (baseConfig: ContinuousScreeningConfig) => {
    const datasetsMap = makeDatasetsMap(baseConfig.datasets);
    const newConfig = {
      name: baseConfig.name,
      description: baseConfig.description ?? '',
      mappingConfigs: baseConfig.objectTypes.map((ot) => ({ objectType: ot, ftmEntity: null, fieldMapping: {} })),
      matchThreshold: baseConfig.matchThreshold,
      matchLimit: baseConfig.matchLimit,
      inboxId: baseConfig.inboxId,
      inboxName: null,
      datasets: datasetsMap,
    };
    setEditingConfig(baseConfig);
    setDraft(newConfig);
  };

  return (
    <Page.Main>
      <Page.Container>
        <Page.ContentV2 className="gap-v2-md">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">{t('navigation:continuous-screening.configurations')}</h1>
            {canEdit ? (
              <Button variant="primary" onClick={() => setCreationModalOpen(true)}>
                {t('continuousScreening:configurations.add_configuration')}
              </Button>
            ) : null}
          </div>
          {match(configurationsQuery)
            .with({ isPending: true }, () => (
              <div className="flex flex-col gap-v2-sm items-center justify-center py-10 border border-grey-border rounded-lg bg-surface-card">
                <Spinner className="size-10 text-purple-primary" />
                <span>{t('continuousScreening:configurations.list.loading')}</span>
              </div>
            ))
            .with({ isError: true }, () => (
              <div className="flex flex-col gap-v2-sm items-center justify-center py-10 border border-grey-border rounded-lg bg-surface-card">
                <div className="">{t('common:generic_fetch_data_error')}</div>
                <Button variant="secondary" onClick={() => configurationsQuery.refetch()}>
                  {t('common:retry')}
                </Button>
              </div>
            ))
            .with({ isSuccess: true }, ({ data: configurations }) => {
              if (!configurations) return null;
              if (configurations.length === 0) {
                return (
                  <div className="flex flex-col gap-v2-sm items-center justify-center py-10 border border-grey-border rounded-lg bg-surface-card">
                    <Icon icon="scan-eye" className="size-10 text-purple-primary" />
                    <span>{t('continuousScreening:configurations.list.empty')}</span>
                    {canEdit ? (
                      <Button variant="primary" onClick={() => setCreationModalOpen(true)}>
                        <Icon icon="plus" className="size-4" />
                        {t('continuousScreening:configurations.add_configuration')}
                      </Button>
                    ) : null}
                  </div>
                );
              }

              return (
                <GridTable.Table className="grid-cols-[minmax(0,_33.33%)_repeat(3,_1fr)]">
                  <GridTable.Row className="font-semibold border-b border-grey-border">
                    <GridTable.Cell>{t('continuousScreening:configurations.list.column.name')}</GridTable.Cell>
                    <GridTable.Cell>{t('continuousScreening:configurations.list.column.datasets')}</GridTable.Cell>
                    <GridTable.Cell>{t('continuousScreening:configurations.list.column.object_types')}</GridTable.Cell>
                    <GridTable.Cell>{t('continuousScreening:configurations.list.column.target_inbox')}</GridTable.Cell>
                  </GridTable.Row>
                  {configurations.map((item) => (
                    <GridTable.Row
                      key={item.id}
                      className="hover:bg-grey-background-light"
                      onClick={() => handleRowClick(item)}
                    >
                      <GridTable.Cell className="flex gap-v2-md items-center justify-between">
                        <span className="truncate">{item.name}</span>
                        <CopyToClipboardButton toCopy={item.stableId} className="min-w-40" size="chip" rounded>
                          <span className="text-xs">{item.stableId}</span>
                        </CopyToClipboardButton>
                      </GridTable.Cell>
                      <GridTable.Cell className="min-w-0">
                        <div className="flex min-w-0 w-full max-w-[20vw] overflow-hidden">
                          <ExpandableGroupTagLine
                            items={item.datasets.map((d) => (
                              <Tag key={d} color="grey">
                                {formatDatasetTitle(d)}
                              </Tag>
                            ))}
                          />
                        </div>
                      </GridTable.Cell>
                      <GridTable.Cell className="min-w-0">
                        <div className="flex min-w-0 w-full max-w-[20vw] overflow-hidden">
                          <ExpandableGroupTagLine
                            items={item.objectTypes.map((ot) => (
                              <Tag key={ot} color="grey">
                                {ot}
                              </Tag>
                            ))}
                          />
                        </div>
                      </GridTable.Cell>
                      <GridTable.Cell>{item.inbox?.name}</GridTable.Cell>
                    </GridTable.Row>
                  ))}
                </GridTable.Table>
              );
            })
            .exhaustive()}
          <CreationModal open={creationModalOpen} onOpenChange={setCreationModalOpen} onSubmit={handleCreationSubmit} />
          {editingConfig && draft ? (
            <PanelRoot open onOpenChange={handlePanelOpenChange}>
              <ConfigurationPanel
                baseConfig={editingConfig}
                newConfig={draft}
                onUpdate={(config) => {
                  setUpdatedConfig(config);
                }}
              />
              {updatedConfig ? (
                <EditionValidationPanel
                  baseConfig={editingConfig}
                  updatedConfig={updatedConfig}
                  onCancel={() => setUpdatedConfig(null)}
                />
              ) : null}
            </PanelRoot>
          ) : null}
        </Page.ContentV2>
      </Page.Container>
    </Page.Main>
  );
};
