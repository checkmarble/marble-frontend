import { ClientDocumentsPopover } from '@app-builder/components/Annotations/ClientDocumentsPopover';
import { BackButton } from '@app-builder/components/Breadcrumbs';
import { DataFields } from '@app-builder/components/Data/DataVisualisation/DataFields';
import { DataExplorerPanel } from '@app-builder/components/DataModelExplorer/DataExplorerPanel';
import { DataModelExplorerProvider } from '@app-builder/components/DataModelExplorer/Provider';
import { Page } from '@app-builder/components/Page';
import { Spinner } from '@app-builder/components/Spinner';
import { DataModelObject, isAnalyst } from '@app-builder/models';
import { SCORING_LEVELS_COLORS, SCORING_LEVELS_LABEL_KEYS, type ScoringSettings } from '@app-builder/models/scoring';
import { useRelatedCasesByObjectQuery } from '@app-builder/queries/cases/related-cases-by-object';
import { useActiveConfigsForObjectQuery } from '@app-builder/queries/continuous-screening/active-configs-for-object';
import { useGetAnnotationsQuery } from '@app-builder/queries/data/get-annotations';
import { useGetObjectCasesQuery } from '@app-builder/queries/data/get-object-cases';
import { useScoreLatestQuery } from '@app-builder/queries/scoring/get-score-latest';
import { useDataModel, useDataModelFeatureAccess } from '@app-builder/services/data/data-model';
import { getGraphExplorationDisplay, isAccessible } from '@app-builder/services/feature-access';
import { useOrganizationDetails } from '@app-builder/services/organization/organization-detail';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Client360Table, type ScoringScore } from 'marble-api';
import { type FeatureAccessLevelDto } from 'marble-api/generated/feature-access-api';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Button, Card, cn, Panel, Popover, Tag, Typo } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { MainLinksGraph, mainLinksGraphMinHeight } from '../CaseManager/MainLinksGraph';
import { GraphSessionProvider, useGraphSession } from '../Graph/contexts/GraphSessionContext';
import { GraphAccessPlaceholder } from '../Graph/GraphAccessPlaceholder';
import { SessionGraphCanvas } from '../Graph/SessionGraphCanvas';
import { pageLayoutGutter } from '../Page/page-layout';
import { AlertHitsList } from './AlertHitsList';
import { ClientComments } from './ClientComments';
import { ConfigureMonitoringForObjectId } from './ConfigureMonitoringForObjectId';
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
  userScoringAccess: FeatureAccessLevelDto;
  isAdmin: boolean;
};

export const ClientDetailPage = ({
  objectType,
  objectId,
  objectDetails,
  metadata,
  allMetadata,
  scoringSettings,
  activeScore,
  userScoringAccess,
  isAdmin,
}: ClientDetailPageProps) => {
  const { t } = useTranslation(['common', 'client360', 'user-scoring']);
  const { currentUser } = useOrganizationDetails();
  const canConfigureUserScoring = isAccessible(userScoringAccess) && !isAnalyst(currentUser);
  const dataModel = useDataModel();
  const graphDisplay = getGraphExplorationDisplay(useDataModelFeatureAccess());
  const annotationsQuery = useGetAnnotationsQuery(objectType, objectId, true);
  const [showExplorer, setShowExplorer] = useState(false);
  const [isEditingDocuments, setIsEditingDocuments] = useState(false);
  const queryClient = useQueryClient();
  const containerRef = useRef<HTMLDivElement>(null);
  const [showHierarchyPanel, setShowHierarchyPanel] = useState(false);
  const [showMonitoringHitsPanel, setShowMonitoringHitsPanel] = useState(false);
  const monitoringHitsQuery = useRelatedCasesByObjectQuery(objectType, objectId);
  const monitoringHitsCount = monitoringHitsQuery.data?.cases.length ?? 0;
  const activeConfigsQuery = useActiveConfigsForObjectQuery(objectType, objectId);
  const [showAlertHitsPanel, setShowAlertHitsPanel] = useState(false);
  const alertHitsQuery = useGetObjectCasesQuery(objectType, objectId);
  const alertHitsCount = alertHitsQuery.data?.cases.length ?? 0;
  const [showScorePanel, setShowScorePanel] = useState(false);
  // Prefer client-fetched score (includes evaluations), same source as UserScoreBadge
  const scoreLatestQuery = useScoreLatestQuery(objectType, objectId);
  const scoreForPanel = scoreLatestQuery.data?.score ?? activeScore;

  let [scoreColor, scoreLabel] = ['', ''];

  if (scoringSettings && activeScore) {
    scoreColor =
      SCORING_LEVELS_COLORS[scoringSettings.maxRiskLevel as 3 | 4 | 5 | 6][activeScore.risk_level] ?? 'inherit';
    scoreLabel = t(
      SCORING_LEVELS_LABEL_KEYS[scoringSettings.maxRiskLevel as 3 | 4 | 5 | 6][activeScore.risk_level] ??
        activeScore.risk_level.toString(),
    );
  }

  const handleScoreClick = () => setShowScorePanel(true);

  return (
    <DataModelExplorerProvider>
      <Page.Main>
        <Page.Header className="gap-md">
          <BackButton back="/client-detail" />
          <TitleBar
            objectType={objectType}
            objectId={objectId}
            objectDetails={objectDetails}
            annotationsQuery={annotationsQuery}
            metadata={metadata}
          />
        </Page.Header>
        <Page.Container ref={containerRef}>
          <Page.Content width="table">
            {/* Client details */}
            <div className="flex gap-md">
              {/* Score card */}
              {isAccessible(userScoringAccess) ? (
                scoringSettings && activeScore ? (
                  <button
                    type="button"
                    className="flex flex-col gap-sm border rounded-lg p-md py-sm w-[180px] self-start shrink-0 items-start"
                    style={{ borderColor: scoreColor, backgroundColor: `${scoreColor}20` }}
                    onClick={handleScoreClick}
                  >
                    <span className="text-small">{t('client360:client_detail.risk_level')}</span>
                    <div className="flex gap-xs items-center">
                      <div className="size-4 rounded-full" style={{ backgroundColor: scoreColor }} />
                      <span className="font-semibold">{scoreLabel}</span>
                      <Icon icon="eye" className="size-4" />
                    </div>
                  </button>
                ) : canConfigureUserScoring ? (
                  <div className="border-purple-border bg-purple-background-light flex flex-col items-center gap-sm rounded-lg border p-md py-sm w-[180px] self-start shrink-0 text-center">
                    <Icon icon="comet" className="size-10 shrink-0" />
                    <span className="text-xs">{t('client360:client_detail.risk_level')}</span>
                    <Link
                      to="/user-scoring"
                      className="border-purple-primary text-purple-primary text-xs font-medium w-full rounded-lg border py-xs text-center hover:bg-purple-primary/10 transition-colors"
                    >
                      {t('client360:client_detail.risk_level.configure')}
                    </Link>
                  </div>
                ) : null
              ) : (
                <div className="border-purple-border bg-purple-background-light flex flex-col items-center gap-sm rounded-lg border p-md py-sm w-[180px] self-start shrink-0 text-center">
                  <Icon icon="comet" className="size-10 shrink-0" />
                  <span className="text-xs">{t('client360:client_detail.risk_level')}</span>
                  <a
                    href="https://checkmarble.com/upgrade"
                    target="_blank"
                    rel="noreferrer"
                    className="border-purple-primary text-purple-primary text-xs font-medium w-full rounded-lg border py-xs text-center hover:bg-purple-primary/10 transition-colors"
                  >
                    {t('client360:client_detail.risk_level.upgrade')}
                  </a>
                </div>
              )}
              <div
                className={cn(
                  'grid grid-cols-1 grow',
                  pageLayoutGutter.gap,
                  graphDisplay !== 'hidden' && 'lg:grid-cols-2',
                )}
              >
                {/* Client fields card */}
                <Card>
                  <div className="min-h-[140px]">
                    <DataFields
                      table={objectType}
                      object={objectDetails}
                      options={{ displayExpandButton: true, maxVisibleFields: 12 }}
                    />
                  </div>
                </Card>
                {graphDisplay === 'graph' ? (
                  <div className={cn('flex flex-1 flex-col gap-sm', mainLinksGraphMinHeight)}>
                    <div className="flex shrink-0 justify-between items-center">
                      <Typo variant="title2">{t('cases:manager.clients.main_links_title')}</Typo>
                      <PanelGraphLinks objectType={objectType} objectId={objectId} />
                    </div>
                    <MainLinksGraph objectType={objectType} objectId={objectId} dataModel={dataModel} />
                  </div>
                ) : graphDisplay === 'placeholder' ? (
                  <div className={cn('flex flex-1 flex-col gap-sm', mainLinksGraphMinHeight)}>
                    <Typo variant="title2">{t('cases:manager.clients.main_links_title')}</Typo>
                    <GraphAccessPlaceholder />
                  </div>
                ) : null}
              </div>
            </div>

            {/* Client relationships */}
            <div className={cn('grid grid-cols-1 lg:grid-cols-[7fr_5fr]', pageLayoutGutter.gap)}>
              <div className={cn('flex flex-col', pageLayoutGutter.gap)}>
                <Card className="flex flex-col gap-sm">
                  <div className="flex justify-between items-center">
                    <div className="font-medium">{t('client360:client_detail.monitoring_hits.title')}</div>
                    {monitoringHitsCount > 3 ? (
                      <Button appearance="link" onClick={() => setShowMonitoringHitsPanel(true)}>
                        <span>{t('common:show')}</span>
                        <Icon icon="eye" className="size-4" />
                      </Button>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-sm bg-grey-background-light border border-grey-border py-sm px-md rounded-md mb-sm">
                    {match(activeConfigsQuery)
                      .with({ isPending: true }, () => (
                        <div className="flex justify-center items-center grow py-xs">
                          <Spinner className="size-4" />
                        </div>
                      ))
                      .with({ isError: true }, () => (
                        <span className="text-s text-grey-secondary">{t('common:generic_fetch_data_error')}</span>
                      ))
                      .with({ isSuccess: true }, ({ data: activeConfigurations }) => {
                        const hasActiveMonitoring = activeConfigurations.length > 0;

                        return (
                          <>
                            <div
                              className={cn(
                                'flex items-center gap-xs shrink-0',
                                hasActiveMonitoring ? 'text-green-primary' : 'text-grey-secondary',
                              )}
                            >
                              <span
                                className={cn(
                                  'size-2 rounded-full',
                                  hasActiveMonitoring ? 'bg-green-primary' : 'bg-grey-secondary',
                                )}
                              />
                              <span className="text-s font-medium">
                                {hasActiveMonitoring
                                  ? t('client360:client_detail.monitoring_hits.active_monitoring')
                                  : t('client360:client_detail.monitoring_hits.no_active_monitoring')}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-xs grow items-center">
                              {activeConfigurations.map((config) => (
                                <Tag key={config.stableId} color="purple" size="small">
                                  {config.name}
                                </Tag>
                              ))}
                              {isAdmin ? (
                                <ConfigureMonitoringForObjectId
                                  objectType={objectType}
                                  objectId={objectId}
                                  activeConfigurations={activeConfigurations}
                                  label={
                                    hasActiveMonitoring
                                      ? undefined
                                      : t('client360:client_detail.monitoring_hits.configure')
                                  }
                                />
                              ) : null}
                            </div>
                          </>
                        );
                      })
                      .exhaustive()}
                  </div>

                  <MonitoringHitsList monitoringHitsQuery={monitoringHitsQuery} />
                </Card>
                <Card className="flex flex-col gap-sm">
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
              <Card className="flex flex-col gap-sm">
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
                  dataModel={dataModel}
                  handleExplore={() => setShowExplorer(true)}
                />
              </Card>
            </div>

            {/* Client documents */}
            <div className="flex flex-col gap-sm">
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
              <Card className="@container">
                <DocumentsList objectType={objectType} objectId={objectId} />
              </Card>
            </div>

            {/* Client comments */}
            <div className="flex flex-col gap-sm">
              <div className="font-medium">{t('client360:client_detail.comments.title')}</div>
              <ClientComments
                objectType={objectType}
                objectId={objectId}
                annotationsQuery={annotationsQuery}
                root={containerRef}
              />
            </div>
          </Page.Content>
        </Page.Container>
      </Page.Main>
      <Panel.Root open={showAlertHitsPanel} onOpenChange={setShowAlertHitsPanel}>
        <Panel.Container size="medium">
          <Panel.Content>
            <Panel.Header>{t('client360:client_detail.alert_hits.panel_title')}</Panel.Header>
            <AlertHitsList alertHitsQuery={alertHitsQuery} showAll />
          </Panel.Content>
        </Panel.Container>
      </Panel.Root>
      <Panel.Root open={showMonitoringHitsPanel} onOpenChange={setShowMonitoringHitsPanel}>
        <Panel.Container size="medium">
          <Panel.Content>
            <Panel.Header>{t('client360:client_detail.monitoring_hits.panel_title')}</Panel.Header>
            <MonitoringHitsList monitoringHitsQuery={monitoringHitsQuery} showAll />
          </Panel.Content>
        </Panel.Container>
      </Panel.Root>
      <Panel.Root open={showHierarchyPanel} onOpenChange={setShowHierarchyPanel}>
        <Panel.Container size="small">
          <Panel.Content>
            <Panel.Header>{t('client360:client_detail.hierarchy.title')}</Panel.Header>
            <ObjectHierarchy
              showAll
              objectType={objectType}
              objectId={objectId}
              metadata={metadata}
              allMetadata={allMetadata}
              dataModel={dataModel}
              handleExplore={() => setShowExplorer(true)}
            />
          </Panel.Content>
        </Panel.Container>
      </Panel.Root>
      <DataExplorerPanel open={showExplorer} onOpenChange={setShowExplorer} dataModel={dataModel} />
      {scoringSettings && scoreForPanel && isAccessible(userScoringAccess) ? (
        <ScoreDetailPanel
          open={showScorePanel}
          onOpenChange={setShowScorePanel}
          objectType={objectType}
          activeScore={scoreForPanel}
          scoringSettings={scoringSettings}
        />
      ) : null}
    </DataModelExplorerProvider>
  );
};

const PanelGraphLinks = ({ objectType, objectId }: { objectType: string; objectId: string }) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation(['common']);
  return (
    <Panel.Root open={open} onOpenChange={setOpen}>
      <Panel.Trigger asChild>
        <Button variant="secondary">
          <Icon icon="eye" className="size-4" />
          {t('common:see_all')}
        </Button>
      </Panel.Trigger>
      <Panel.Container size="full">
        <Panel.Content>
          <Panel.Header>{t('cases:manager.clients.main_links_title')}</Panel.Header>
          <GraphSessionProvider
            key={`${objectType}:${objectId}`}
            initialRecord={{ recordType: objectType, recordId: objectId }}
          >
            <LinksGraphBody />
          </GraphSessionProvider>
          <Panel.Footer>
            <Panel.FooterButton label={t('common:close')} isCloseButton onClick={() => setOpen(false)} />
          </Panel.Footer>
        </Panel.Content>
      </Panel.Container>
    </Panel.Root>
  );
};

function LinksGraphBody() {
  const { isGeneratingGraph } = useGraphSession();

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <SessionGraphCanvas
        placeholder={<Card className={cn('min-h-0 flex-1', isGeneratingGraph && 'animate-pulse bg-grey-background')} />}
        withCard={false}
      />
    </div>
  );
}
