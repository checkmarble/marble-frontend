import { ClientObjectTagList } from '@app-builder/components/Annotations/ClientObjectTagList';
import { CaseStatusBadgeV2 } from '@app-builder/components/Cases';
import { CaseAlerts } from '@app-builder/components/Cases/CaseAlerts';
import { DataFields } from '@app-builder/components/Data/DataVisualisation/DataFields';
import { DataExplorerPanel } from '@app-builder/components/DataModelExplorer/DataExplorerPanel';
import { DataModelExplorerProvider } from '@app-builder/components/DataModelExplorer/Provider';
import { pageLayoutGutter } from '@app-builder/components/Page/page-layout';
import { DataModel } from '@app-builder/models';
import { type CaseClient, CaseDetail, getCaseClients, PivotObject } from '@app-builder/models/cases';
import { FeatureAccesses } from '@app-builder/models/feature-access';
import { Inbox } from '@app-builder/models/inbox';
import { isAdmin } from '@app-builder/models/user';
import { editTagsPayloadSchema, useEditTagsMutation } from '@app-builder/queries/cases/edit-tags';
import { useCaseDecisionsQuery } from '@app-builder/queries/cases/list-decisions';
import { useOrganizationDetails } from '@app-builder/services/organization/organization-detail';
import { useOrganizationTags } from '@app-builder/services/organization/organization-tags';
import { clientDetailLinkParams } from '@app-builder/utils/routes/client-detail-url';
import { useForm } from '@tanstack/react-form';
import { Link } from '@tanstack/react-router';
import type { Client360Table } from 'marble-api';
import { type FeatureAccessLevelDto } from 'marble-api/generated/feature-access-api';
import { useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card, CtaV2ClassName, cn, Panel, Tabs, Tag, TagList, Typo } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { AiReviewCard } from './AiReview/AiReviewCard';
import { CaseDocuments } from './CaseDocuments/CaseDocuments';
import { CaseEvents } from './CaseEvents';
import { CaseInfo } from './CaseInfo';
import { CaseInvestigation } from './CaseInvestigation/CaseInvestigation';
import { EscalateCaseButton } from './EscalateCaseButton';
import { ManageClientsPanel } from './ManageClientsPanel';
import { NavigationOptions } from './NavigationOptions';
import { getObjectName } from './PivotTabs';
import { CaseSnoozePanel } from './SnoozePanel/CaseSnoozePanel';
import { UserScoreBadge } from './UserScore/UserScoreBadge';

export type CaseManagerPrincipalPageProps = {
  caseDetail: CaseDetail;
  dataModel: DataModel;
  pivotObjects: PivotObject[] | null;
  inboxes: Inbox[];
  client360Tables: Client360Table[];
  userScoringAccess: FeatureAccessLevelDto;
  entitlements: FeatureAccesses;
};

export function CaseManagerPrincipalPage({
  caseDetail,
  dataModel,
  pivotObjects,
  inboxes,
  client360Tables,
  userScoringAccess,
  entitlements,
}: CaseManagerPrincipalPageProps) {
  const { t } = useTranslation(['common', 'cases']);
  const { orgTags } = useOrganizationTags();
  const { currentUser } = useOrganizationDetails();
  const caseInbox = inboxes.find((inbox) => inbox.id === caseDetail.inboxId) ?? null;
  const caseClients = getCaseClients(pivotObjects ?? [], caseDetail.entities);
  const pivotClients = caseClients.filter((c) => c.kind === 'pivot');
  const entityClients = caseClients.filter((c) => c.kind === 'entity');
  const caseDecisionsQuery = useCaseDecisionsQuery(caseDetail.id);
  const hasRuleHits = caseDecisionsQuery.data?.pages.some((page) =>
    page?.decisions?.some((d) => d.rules?.some((r) => r.outcome === 'hit')),
  );

  const rootRef = useRef<HTMLDivElement>(null);
  const editTagsMutation = useEditTagsMutation();
  const caseTagsIds = caseDetail.tags.map((t) => t.tagId);
  const [activePivotKey, setActivePivotKey] = useState<string | undefined>(undefined);
  const activePivotClient = pivotClients.find((c) => c.key === activePivotKey) ?? pivotClients[0];
  const [activeEntityKey, setActiveEntityKey] = useState<string | undefined>(undefined);
  const activeEntityClient = entityClients.find((c) => c.key === activeEntityKey) ?? entityClients[0];
  const pivotTabsId = useId();
  const entityTabsId = useId();
  const renderClientCard = (client: CaseClient) => (
    <ClientCard
      key={client.key}
      caseId={caseDetail.id}
      client={client}
      dataModel={dataModel}
      client360Tables={client360Tables}
      userScoringAccess={userScoringAccess}
    />
  );

  const tagsForm = useForm({
    onSubmit: ({ value }) => {
      editTagsMutation.mutateAsync(value);
    },
    defaultValues: {
      caseId: caseDetail.id,
      tagIds: caseTagsIds,
    },
    validators: {
      onSubmit: editTagsPayloadSchema,
    },
  });

  const [snoozePanelOpen, setSnoozePanelOpen] = useState(false);
  const handleDisplaySnoozePanel = () => setSnoozePanelOpen(true);

  return (
    <>
      <div className={cn('grid grid-cols-1 lg:grid-cols-2', pageLayoutGutter.gap)}>
        <div className="flex flex-col gap-lg">
          <Card className="flex flex-col gap-sm text-small">
            <div className="flex items-center gap-xs">
              <CaseStatusBadgeV2 status={caseDetail.status} outcome={caseDetail.outcome} variant="semi-full" />
              <tagsForm.Field name="tagIds">
                {(field) => (
                  <TagList
                    editable
                    placeholder={t('cases:manager.principal.add_tag_placeholder')}
                    tags={orgTags}
                    value={field.state.value}
                    onChange={(tags) => {
                      tagsForm.setFieldValue('tagIds', tags);
                      tagsForm.handleSubmit();
                    }}
                  />
                )}
              </tagsForm.Field>
              {caseDetail.status !== 'closed' ? (
                <EscalateCaseButton caseId={caseDetail.id} inboxId={caseDetail.inboxId} className="ms-auto" />
              ) : null}
            </div>
            <div className="grid grid-cols-[2fr_1fr] gap-sm">
              <CaseInfo caseDetail={caseDetail} currentUser={currentUser} />
              <CaseEvents
                events={caseDetail.events}
                currentInboxId={caseDetail.inboxId}
                inboxes={inboxes}
                includeEventTypes={['case_created', 'inbox_changed', 'case_snoozed', 'case_unsnoozed', 'case_assigned']}
                dueAt={caseDetail.dueAt}
                status={caseDetail.status}
              />
            </div>
          </Card>

          <AiReviewCard caseId={caseDetail.id} canManuallyReview={caseInbox?.caseReviewManual ?? false} />

          <div className="flex flex-col justify-start gap-sm">
            <div className="flex items-center justify-between px-2xs font-medium">
              <Typo variant="subtitle1">{t('cases:alerts')}</Typo>
              {hasRuleHits ? (
                <Button variant="secondary" onClick={() => handleDisplaySnoozePanel()}>
                  <Icon icon="snooze" className="size-3.5" />
                  {t('cases:decisions.snooze_rules')}
                </Button>
              ) : null}
            </div>
            <CaseAlerts caseDecisionsQuery={caseDecisionsQuery} dataModel={dataModel} />
          </div>
        </div>
        <div className="flex flex-col gap-lg">
          {activePivotClient ? (
            <div className="flex flex-col gap-sm">
              {pivotClients.length > 1 ? (
                <>
                  <Tabs
                    id={pivotTabsId}
                    variant="fluid"
                    value={activePivotClient.key}
                    onValueChange={setActivePivotKey}
                  >
                    {pivotClients.map((client) => (
                      <Tabs.Button key={client.key} value={client.key}>
                        {getObjectName(dataModel, client.tableName, client.object.data, client.objectId ?? '')}
                      </Tabs.Button>
                    ))}
                  </Tabs>
                  <Tabs.Panel tabsId={pivotTabsId} value={activePivotClient.key}>
                    {renderClientCard(activePivotClient)}
                  </Tabs.Panel>
                </>
              ) : (
                renderClientCard(activePivotClient)
              )}
            </div>
          ) : entityClients.length === 0 ? (
            <Card className="flex flex-col items-center justify-center gap-sm text-small text-center">
              <span className="text-grey-secondary">
                {isAdmin(currentUser)
                  ? t('cases:case_detail.pivot_panel.missing_pivot.admin')
                  : t('cases:case_detail.pivot_panel.missing_pivot')}
              </span>
              {isAdmin(currentUser) ? (
                <Link to="/data" className={CtaV2ClassName({ variant: 'primary', appearance: 'stroked' })}>
                  {t('cases:case_detail.pivot_panel.missing_pivot_cta')}
                </Link>
              ) : null}
              <ManageClientsPanel
                clients={caseClients}
                caseId={caseDetail.id}
                caseStatus={caseDetail.status}
                userScoringAccess={userScoringAccess}
              >
                <Button variant="primary" appearance="stroked">
                  <Icon icon="plus" className="size-4" />
                  {t('cases:manage_clients')}
                </Button>
              </ManageClientsPanel>
            </Card>
          ) : null}
          {activeEntityClient ? (
            <div className="flex flex-col gap-sm">
              <Typo variant="subtitle1">{t('cases:case_detail.entities')}</Typo>
              {entityClients.length > 1 ? (
                <>
                  <Tabs
                    id={entityTabsId}
                    variant="fluid"
                    value={activeEntityClient.key}
                    onValueChange={setActiveEntityKey}
                  >
                    {entityClients.map((client) => (
                      <Tabs.Button key={client.key} value={client.key}>
                        {getObjectName(dataModel, client.tableName, client.object.data, client.objectId ?? '')}
                      </Tabs.Button>
                    ))}
                  </Tabs>
                  <Tabs.Panel tabsId={entityTabsId} value={activeEntityClient.key}>
                    {renderClientCard(activeEntityClient)}
                  </Tabs.Panel>
                </>
              ) : (
                renderClientCard(activeEntityClient)
              )}
            </div>
          ) : null}
          <CaseDocuments files={caseDetail.files} />
          <CaseInvestigation
            root={rootRef}
            caseId={caseDetail.id}
            currentInboxId={caseDetail.inboxId}
            events={caseDetail.events}
            inboxes={inboxes}
          />
        </div>
      </div>
      <Panel.Root open={snoozePanelOpen} onOpenChange={setSnoozePanelOpen}>
        <Panel.Container size="medium">
          <Panel.Content>
            <CaseSnoozePanel
              onClose={() => setSnoozePanelOpen(false)}
              caseDetail={caseDetail}
              dataModel={dataModel}
              pivotObjects={pivotObjects ?? []}
              entitlements={entitlements}
            />
          </Panel.Content>
        </Panel.Container>
      </Panel.Root>
    </>
  );
}

type ClientCardProps = {
  caseId: string;
  client: CaseClient;
  dataModel: DataModel;
  client360Tables: Client360Table[];
  userScoringAccess: FeatureAccessLevelDto;
};

function ClientCard({ caseId, client, dataModel, client360Tables, userScoringAccess }: ClientCardProps) {
  const { t } = useTranslation(['common']);
  const { currentUser } = useOrganizationDetails();
  const currentTable = dataModel.find((t) => t.name === client.tableName);
  const client360Table = client360Tables.find((table) => table.name === client.tableName);
  const entityName = client360Table?.alias || client360Table?.name || client.tableName;
  const clientName = getObjectName(dataModel, client.tableName, client.object.data, client.objectId ?? '');
  const [explorationOpen, setExplorationOpen] = useState(false);

  return (
    <Card className="flex flex-col gap-sm text-small">
      <div className="flex justify-between items-center">
        <span className="font-medium">{clientName}</span>
        <div className="flex items-center gap-sm">
          {client.objectId ? (
            <UserScoreBadge
              objectType={client.tableName}
              objectId={client.objectId}
              userScoringAccess={userScoringAccess}
            />
          ) : null}
          {client360Table && client.isIngested && client.objectId ? (
            <Link
              to="/client-detail/$objectType/$objectId"
              params={clientDetailLinkParams(client.tableName, client.objectId)}
              className={CtaV2ClassName({ appearance: 'link', variant: 'primary' })}
            >
              <Icon icon="eye" className="size-4" />
              {t('common:see_all')}
            </Link>
          ) : null}
        </div>
      </div>
      <div className="flex gap-xs items-center">
        <Tag color="grey" className="capitalize">
          {entityName}
        </Tag>
        {client.objectId ? (
          <ClientObjectTagList caseId={caseId} tableName={client.tableName} objectId={client.objectId} />
        ) : null}
      </div>
      <div>
        <DataFields
          options={{ layout: '2-columns', maxVisibleFields: 6, displayExpandButton: false }}
          object={client.object}
          table={client.tableName}
        />
        {currentTable ? (
          <DataModelExplorerProvider>
            <NavigationOptions
              currentUser={currentUser}
              client={client}
              table={currentTable}
              dataModel={dataModel}
              onExplore={() => setExplorationOpen(true)}
            />
            <DataExplorerPanel dataModel={dataModel} open={explorationOpen} onOpenChange={setExplorationOpen} />
          </DataModelExplorerProvider>
        ) : null}
      </div>
    </Card>
  );
}
