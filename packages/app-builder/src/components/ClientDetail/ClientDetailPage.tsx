import { BreadCrumbs } from '@app-builder/components/Breadcrumbs';
import { Page } from '@app-builder/components/Page';
import { DataModelObject } from '@app-builder/models';
import { SCORING_LEVELS_COLORS, SCORING_LEVELS_LABELS, type ScoringSettings } from '@app-builder/models/scoring';
import { useRelatedCasesByObjectQuery } from '@app-builder/queries/cases/related-cases-by-object';
import { useGetAnnotationsQuery } from '@app-builder/queries/data/get-annotations';
import { useDataModelWithOptionsQuery } from '@app-builder/queries/data/get-data-model-with-options';
import { useGetObjectCasesQuery } from '@app-builder/queries/data/get-object-cases';
import { useQueryClient } from '@tanstack/react-query';
import { Client360Table, type ScoringScore } from 'marble-api';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Button, cn, Popover } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { ClientDocumentsPopover } from '../Annotations/ClientDocumentsPopover';
import { DataFields } from '../Data/DataVisualisation/DataFields';
import { DataModelExplorer } from '../DataModelExplorer/DataModelExplorer';
import { DataModelExplorerProvider } from '../DataModelExplorer/Provider';
import { PanelContainer, PanelHeader, PanelRoot } from '../Panel';
import { Spinner } from '../Spinner';
import { AlertHitsList } from './AlertHitsList';
import { ClientComments } from './ClientComments';
import { DocumentsList } from './DocumentsList';
import { MonitoringHitsList } from './MonitoringHitsList';
import { ObjectHierarchy } from './ObjectHierarchy';
import { ScoreDetailPanel } from './ScoreDetailPanel';
import { TitleBar } from './TitleBar';

type ClientDetailPageProps = {
  objectType: string;
  objectId: string;
  objectDetails: DataModelObject;
  metadata: Client360Table;
  allMetadata: Client360Table[];
  scoringSettings: ScoringSettings | null;
  activeScore: ScoringScore | null;
};

export const ClientDetailPage = ({
  objectType,
  objectId,
  objectDetails,
  metadata,
  allMetadata,
  scoringSettings,
  activeScore,
}: ClientDetailPageProps) => {
  const { t } = useTranslation(['common', 'client360']);
  const dataModelQuery = useDataModelWithOptionsQuery();
  const annotationsQuery = useGetAnnotationsQuery(objectType, objectId, true);
  const [showExplorer, setShowExplorer] = useState(false);
  const [isEditingDocuments, setIsEditingDocuments] = useState(false);
  const queryClient = useQueryClient();
  const containerRef = useRef<HTMLDivElement>(null);
  const [showHierarchyPanel, setShowHierarchyPanel] = useState(false);
  const [showMonitoringHitsPanel, setShowMonitoringHitsPanel] = useState(false);
  const monitoringHitsQuery = useRelatedCasesByObjectQuery(objectType, objectId);
  const monitoringHitsCount = monitoringHitsQuery.data?.cases.length ?? 0;
  const [showAlertHitsPanel, setShowAlertHitsPanel] = useState(false);
  const alertHitsQuery = useGetObjectCasesQuery(objectType, objectId);
  const alertHitsCount = alertHitsQuery.data?.cases.length ?? 0;
  const [showScorePanel, setShowScorePanel] = useState(false);

  let [scoreColor, scoreLabel] = ['', ''];

  if (scoringSettings && activeScore) {
    scoreColor =
      SCORING_LEVELS_COLORS[scoringSettings.maxRiskLevel as 3 | 4 | 5 | 6][activeScore.risk_level - 1] ?? 'inherit';
    scoreLabel =
      SCORING_LEVELS_LABELS[scoringSettings.maxRiskLevel as 3 | 4 | 5 | 6][activeScore.risk_level - 1] ??
      activeScore.risk_level.toString();
  }

  const handleScoreClick = () => setShowScorePanel(true);

  return (
    <DataModelExplorerProvider>
      <Page.Main>
        <Page.Header>
          <BreadCrumbs back="/client-detail" />
        </Page.Header>
        <Page.Container ref={containerRef}>
          <Page.ContentV2 className="gap-v2-lg">
            <TitleBar
              objectType={objectType}
              objectId={objectId}
              objectDetails={objectDetails}
              annotationsQuery={annotationsQuery}
              metadata={metadata}
            />
            {/* Client details */}
            <div className="flex gap-v2-md">
              {/* Score card */}
              {scoringSettings && activeScore ? (
                <button
                  type="button"
                  className="flex flex-col gap-v2-sm border rounded-lg p-v2-md py-v2-sm w-[180px] self-start shrink-0 items-start"
                  style={{ borderColor: scoreColor, backgroundColor: `${scoreColor}20` }}
                  onClick={handleScoreClick}
                >
                  <span className="text-small">{t('client360:client_detail.risk_level')}</span>
                  <div className="flex gap-v2-xs items-center">
                    <div className="size-4 rounded-full" style={{ backgroundColor: scoreColor }} />
                    <span className="font-semibold">{scoreLabel}</span>
                    <Icon icon="eye" className="size-4" />
                  </div>
                </button>
              ) : null}
              {/* Client fields card */}
              <Card className="grow">
                <div className="min-h-[140px]">
                  {match(dataModelQuery)
                    .with({ isPending: true }, () => {
                      return (
                        <div className="flex justify-center items-center min-h-[140px]">
                          <Spinner className="size-10" />
                        </div>
                      );
                    })
                    .with({ isError: true }, () => {
                      return <div>{t('common:generic_fetch_data_error')}</div>;
                    })
                    .with({ isSuccess: true }, (dmQuery) => {
                      return (
                        <DataFields
                          table={objectType}
                          object={objectDetails}
                          options={{
                            layout: '2-columns',
                          }}
                        />
                      );
                    })
                    .exhaustive()}
                </div>
                {/* <div></div>
              <div className="w-px self-stretch bg-grey-border max-lg:hidden" />
              <div></div> */}
              </Card>
            </div>

            {/* Client timeline */}
            {/* <Card className="flex flex-col gap-v2-sm">
              <div className="font-medium">User's history</div>
              <ClientTimeline />
            </Card> */}

            {/* Client relationships */}
            <div className="grid grid-cols-1 lg:grid-cols-[7fr_5fr] gap-v2-md">
              <div className="flex flex-col gap-v2-md">
                <Card className="flex flex-col gap-v2-sm">
                  <div className="flex justify-between items-center">
                    <div className="font-medium">{t('client360:client_detail.monitoring_hits.title')}</div>
                    {monitoringHitsCount > 3 ? (
                      <Button appearance="link" onClick={() => setShowMonitoringHitsPanel(true)}>
                        <span>{t('common:show')}</span>
                        <Icon icon="eye" className="size-4" />
                      </Button>
                    ) : null}
                  </div>
                  <MonitoringHitsList monitoringHitsQuery={monitoringHitsQuery} />
                </Card>
                <Card className="flex flex-col gap-v2-sm">
                  <div className="flex justify-between items-center">
                    <div className="font-medium">{t('client360:client_detail.alert_hits.title')}</div>
                    {alertHitsCount > 3 ? (
                      <Button appearance="link" onClick={() => setShowAlertHitsPanel(true)}>
                        <span>{t('common:show')}</span>
                        <Icon icon="eye" className="size-4" />
                      </Button>
                    ) : null}
                  </div>
                  <AlertHitsList alertHitsQuery={alertHitsQuery} />
                </Card>
              </div>
              <Card className="flex flex-col gap-v2-sm">
                <div className="flex justify-between items-center">
                  <div className="font-medium">{t('client360:client_detail.hierarchy.title')}</div>
                  <Button appearance="link" onClick={() => setShowHierarchyPanel(true)}>
                    <span>{t('common:show')}</span>
                    <Icon icon="eye" className="size-4" />
                  </Button>
                </div>
                <ObjectHierarchy
                  objectType={objectType}
                  objectId={objectId}
                  metadata={metadata}
                  allMetadata={allMetadata}
                  dataModelQuery={dataModelQuery}
                  handleExplore={() => setShowExplorer(true)}
                />
              </Card>
            </div>

            {/* Client documents */}
            <div className="flex flex-col gap-v2-sm">
              <div className="flex justify-between items-center">
                <div className="font-medium">{t('client360:client_detail.documents.title')}</div>
                <div>
                  <Popover.Root open={isEditingDocuments} onOpenChange={setIsEditingDocuments}>
                    <Popover.Trigger asChild>
                      <Button variant="secondary">
                        <Icon icon="add-circle" className="size-4" />
                        <span>{t('client360:client_detail.documents.add_button')}</span>
                      </Button>
                    </Popover.Trigger>
                    <Popover.Content
                      side="bottom"
                      align="end"
                      sideOffset={4}
                      collisionPadding={10}
                      className="w-[340px]"
                    >
                      <ClientDocumentsPopover
                        tableName={objectType}
                        objectId={objectId}
                        onAnnotateSuccess={() => {
                          setIsEditingDocuments(false);
                          queryClient.invalidateQueries({ queryKey: ['annotations', objectType, objectId] });
                        }}
                      />
                    </Popover.Content>
                  </Popover.Root>
                </div>
              </div>
              <Card className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-v2-md">
                <DocumentsList objectType={objectType} objectId={objectId} />
              </Card>
            </div>

            {/* Client comments */}
            <div className="flex flex-col gap-v2-sm">
              <div className="font-medium">{t('client360:client_detail.comments.title')}</div>
              <ClientComments
                objectType={objectType}
                objectId={objectId}
                annotationsQuery={annotationsQuery}
                root={containerRef}
              />
            </div>
          </Page.ContentV2>
        </Page.Container>
      </Page.Main>
      <PanelRoot open={showAlertHitsPanel} onOpenChange={setShowAlertHitsPanel}>
        <PanelContainer size="xxl">
          <PanelHeader>{t('client360:client_detail.alert_hits.panel_title')}</PanelHeader>
          <div className="text-small">
            <AlertHitsList alertHitsQuery={alertHitsQuery} showAll />
          </div>
        </PanelContainer>
      </PanelRoot>
      <PanelRoot open={showMonitoringHitsPanel} onOpenChange={setShowMonitoringHitsPanel}>
        <PanelContainer size="xxl">
          <PanelHeader>{t('client360:client_detail.monitoring_hits.panel_title')}</PanelHeader>
          <div className="text-small">
            <MonitoringHitsList monitoringHitsQuery={monitoringHitsQuery} showAll />
          </div>
        </PanelContainer>
      </PanelRoot>
      <PanelRoot open={showHierarchyPanel} onOpenChange={setShowHierarchyPanel}>
        <PanelContainer size="xxl">
          <PanelHeader>{t('client360:client_detail.hierarchy.title')}</PanelHeader>
          <ObjectHierarchy
            showAll
            objectType={objectType}
            objectId={objectId}
            metadata={metadata}
            allMetadata={allMetadata}
            dataModelQuery={dataModelQuery}
            handleExplore={() => setShowExplorer(true)}
          />
        </PanelContainer>
      </PanelRoot>
      <PanelRoot open={showExplorer} onOpenChange={setShowExplorer}>
        <PanelContainer className="max-w-[90vw]">
          <PanelHeader>{t('client360:client_detail.data_exploration.panel_title')}</PanelHeader>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <DataModelExplorer dataModel={dataModelQuery.data?.dataModel ?? []} />
          </div>
        </PanelContainer>
      </PanelRoot>
      {scoringSettings && activeScore ? (
        <ScoreDetailPanel
          open={showScorePanel}
          onOpenChange={setShowScorePanel}
          objectType={objectType}
          activeScore={activeScore}
          scoringSettings={scoringSettings}
        />
      ) : null}
    </DataModelExplorerProvider>
  );
};

const Card = ({ children, className }: { children?: React.ReactNode; className?: string }) => {
  return (
    <div className={cn('p-v2-lg border border-grey-border rounded-v2-md bg-surface-card', className)}>{children}</div>
  );
};
