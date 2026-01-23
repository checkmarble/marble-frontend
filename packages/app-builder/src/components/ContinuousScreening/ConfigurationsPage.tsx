import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import {
  ContinuousScreeningConfig,
  PrevalidationCreateContinuousScreeningConfig,
} from '@app-builder/models/continuous-screening';
import { useContinuousScreeningConfigurationsQuery } from '@app-builder/queries/continuous-screening/configurations';
import { getRoute } from '@app-builder/utils/routes';
import QueryString from 'qs';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { ButtonV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { BreadCrumbs } from '../Breadcrumbs';
import GridTable from '../GridTable';
import { Page } from '../Page';
import { usePanel } from '../Panel';
import { Spinner } from '../Spinner';
import { ConfigurationPanel } from './ConfigurationPanel';
import { CopyToClipboardChip } from './CopyToClipboardChip';
import { CreationModal } from './CreationModal';
import { EditionValidationPanel } from './EditionValidationPanel';
import { Capsule } from './shared/Capsule';

const CellCapsule = ({ children }: { children: React.ReactNode }) => {
  return <Capsule className="max-w-50 truncate">{children}</Capsule>;
};

export const ConfigurationsPage = ({ canEdit }: { canEdit: boolean }) => {
  const { t } = useTranslation(['common', 'continuousScreening']);
  const configurationsQuery = useContinuousScreeningConfigurationsQuery();
  const [creationModalOpen, setCreationModalOpen] = useState(false);
  const navigate = useAgnosticNavigation();
  const { openPanel } = usePanel();

  const handleCreationSubmit = (value: { name: string; description: string }) => {
    const qs = QueryString.stringify(value, { addQueryPrefix: true });
    navigate({
      pathname: getRoute('/continuous-screening/create'),
      search: qs,
    });
  };

  const handleUpdate = (
    baseConfig: ContinuousScreeningConfig,
    updatedConfig: PrevalidationCreateContinuousScreeningConfig,
  ) => {
    openPanel(<EditionValidationPanel baseConfig={baseConfig} updatedConfig={updatedConfig} />);
  };

  const handleRowClick = (item: ContinuousScreeningConfig) => {
    openPanel(<ConfigurationPanel config={item} onUpdate={(updatedConfig) => handleUpdate(item, updatedConfig)} />);
  };

  return (
    <Page.Main>
      <Page.Header className="justify-between">
        <BreadCrumbs />
        <div>
          {canEdit ? (
            <ButtonV2 variant="primary" onClick={() => setCreationModalOpen(true)}>
              {t('continuousScreening:configurations.add_configuration')}
            </ButtonV2>
          ) : null}
        </div>
      </Page.Header>
      <Page.Container>
        <Page.ContentV2>
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
                <ButtonV2 variant="secondary" onClick={() => configurationsQuery.refetch()}>
                  {t('common:retry')}
                </ButtonV2>
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
                      <ButtonV2 variant="primary" onClick={() => setCreationModalOpen(true)}>
                        <Icon icon="plus" className="size-4" />
                        {t('continuousScreening:configurations.add_configuration')}
                      </ButtonV2>
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
                        <CopyToClipboardChip value={item.stableId} className="min-w-40" />
                      </GridTable.Cell>
                      <GridTable.Cell>
                        {item.datasets[0] ? <CellCapsule>{item.datasets[0]}</CellCapsule> : null}
                        {item.datasets.length > 1 ? <CellCapsule>+{item.datasets.length - 1}</CellCapsule> : null}
                      </GridTable.Cell>
                      <GridTable.Cell className="overflow-x-auto">
                        {item.objectTypes.slice(0, 3).map((ot) => (
                          <CellCapsule key={ot}>{ot}</CellCapsule>
                        ))}
                        {item.objectTypes.length > 3 ? <CellCapsule>+{item.objectTypes.length - 3}</CellCapsule> : null}
                      </GridTable.Cell>
                      <GridTable.Cell>{item.inbox?.name}</GridTable.Cell>
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
