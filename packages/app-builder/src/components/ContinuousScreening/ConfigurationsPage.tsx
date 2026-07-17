import { Panel } from '@app-builder/components/Panel';
import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import {
  ContinuousScreeningConfig,
  PrevalidationCreateContinuousScreeningConfig,
} from '@app-builder/models/continuous-screening';
import { ScreeningAvailableFiltersAdapted } from '@app-builder/models/screening';
import { ContinuousScreeningConfiguration } from '@app-builder/queries/continuous-screening/configurations';
import QueryString from 'qs';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match, P } from 'ts-pattern';
import { Button, ExpandableGroupTagLine, Tag, Typo } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { CopyToClipboardButton } from '../CopyToClipboardButton';
import GridTable from '../GridTable';
import { makeDatasetsMap } from '../ListAndTopicConfiguration/dataset-selection-provider-utils';
import { findDatasetOrTopicByKey, useDatasetTitle } from '../ListAndTopicConfiguration/dataset-utils';
import { Page } from '../Page';
import { ConfigurationPanel } from './ConfigurationPanel';
import { CreationModal } from './CreationModal';
import { PartialCreateContinuousScreeningConfig } from './context/CreationStepper';
import { EditionValidationPanel } from './EditionValidationPanel';
import { PanelAddCsv } from './PanelAddCsv';

type ConfigurationsPageProps = {
  canEdit: boolean;
  configurations: ContinuousScreeningConfiguration[];
  datasets: ScreeningAvailableFiltersAdapted;
};

export const ConfigurationsPage = ({ canEdit, configurations, datasets }: ConfigurationsPageProps) => {
  const { t } = useTranslation(['common', 'continuousScreening', 'navigation']);
  const { formatItemName } = useDatasetTitle();
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
      <Page.Content width="table">
        <div className="flex items-center justify-between">
          <Typo variant="title1">{t('navigation:continuous-screening.configurations')}</Typo>
          {canEdit ? (
            <Button variant="primary" onClick={() => setCreationModalOpen(true)}>
              {t('continuousScreening:configurations.add_configuration')}
            </Button>
          ) : null}
        </div>
        {match(configurations)
          .with(P.nullish, () => null)
          .with(P.array(), (configurations) =>
            configurations.length === 0 ? (
              <div className="flex flex-col gap-sm items-center justify-center py-2xl border border-grey-border rounded-lg bg-surface-card">
                <Icon icon="scan-eye" className="size-10 text-purple-primary" />
                <span>{t('continuousScreening:configurations.list.empty')}</span>
                {canEdit ? (
                  <Button variant="primary" onClick={() => setCreationModalOpen(true)}>
                    <Icon icon="plus" className="size-4" />
                    {t('continuousScreening:configurations.add_configuration')}
                  </Button>
                ) : null}
              </div>
            ) : (
              <GridTable.Table className="grid-cols-[minmax(0,_33.33%)_repeat(4,_1fr)]">
                <GridTable.Row isHeader>
                  <GridTable.Cell>{t('continuousScreening:configurations.list.column.name')}</GridTable.Cell>
                  <GridTable.Cell>{t('continuousScreening:configurations.list.column.datasets')}</GridTable.Cell>
                  <GridTable.Cell>{t('continuousScreening:configurations.list.column.object_types')}</GridTable.Cell>
                  <GridTable.Cell>{t('continuousScreening:configurations.list.column.target_inbox')}</GridTable.Cell>
                  <GridTable.Cell>{''}</GridTable.Cell>
                </GridTable.Row>
                {configurations.map((item) => (
                  <GridTable.Row
                    key={item.id}
                    className="hover:bg-grey-background-light"
                    onClick={() => handleRowClick(item)}
                  >
                    <GridTable.Cell className="flex gap-md items-center justify-between">
                      <span className="truncate">{item.name}</span>
                      <CopyToClipboardButton toCopy={item.stableId} className="min-w-40" size="chip" rounded>
                        <span className="text-xs">{item.stableId}</span>
                      </CopyToClipboardButton>
                    </GridTable.Cell>
                    <GridTable.Cell className="min-w-0">
                      <div className="flex min-w-0 w-full max-w-[20vw] overflow-hidden">
                        <ExpandableGroupTagLine
                          items={item.datasets.map((d) => {
                            const resolvedItem = findDatasetOrTopicByKey(datasets, d);
                            const itemName = resolvedItem ? formatItemName(resolvedItem) : d;
                            return (
                              <Tag key={d} color="grey">
                                <span className="max-w-[15ch] truncate" title={itemName}>
                                  {itemName}
                                </span>
                              </Tag>
                            );
                          })}
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
                    <GridTable.Cell>
                      <PanelAddCsv configuration={item} />
                    </GridTable.Cell>
                  </GridTable.Row>
                ))}
              </GridTable.Table>
            ),
          )
          .exhaustive()}

        <CreationModal open={creationModalOpen} onOpenChange={setCreationModalOpen} onSubmit={handleCreationSubmit} />
        {editingConfig && draft ? (
          <Panel.Root open onOpenChange={handlePanelOpenChange}>
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
                datasets={datasets}
                onCancel={() => setUpdatedConfig(null)}
              />
            ) : null}
          </Panel.Root>
        ) : null}
      </Page.Content>
    </Page.Main>
  );
};
