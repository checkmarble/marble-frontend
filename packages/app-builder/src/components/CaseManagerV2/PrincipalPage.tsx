import { ClientObjectTagList } from '@app-builder/components/Annotations/ClientObjectTagList';
import { AiReviewCard } from '@app-builder/components/CaseManagerV2/AiReview/AiReviewCard';
import { UserScoreBadge } from '@app-builder/components/CaseManagerV2/UserScore/UserScoreBadge';
import { CaseAlerts } from '@app-builder/components/Cases/CaseAlerts';
import { Panel } from '@app-builder/components/Panel';
import { DataModel, DataModelObject } from '@app-builder/models';
import { CaseDetail, PivotObject } from '@app-builder/models/cases';
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
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card, CtaV2ClassName, Tag, TagList } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { PivotNavigationOptions } from '../CaseManager/PivotsPanel/PivotNavigationOptions';
import { CaseInvestigation } from '../CaseManager/shared/CaseInvestigation/CaseInvestigation';
import { CaseStatusBadgeV2 } from '../Cases';
import { EditCaseAssignee } from '../Cases/EditAssignee';
import { EditCaseInbox } from '../Cases/EditCaseInbox';
import { CopyToClipboardButton } from '../CopyToClipboardButton';
import { DataFields } from '../Data/DataVisualisation/DataFields';
import { DataModelExplorerProvider } from '../DataModelExplorer/Provider';
import { DataExplorerPanel } from './DataExplorerPanel';
import { EscalateCaseButton } from './EscalateCaseButton';
import { CaseSnoozePanel } from './SnoozePanel/CaseSnoozePanel';
import { getClientDisplayInfo } from './utils/client';

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
  const mainPivotObject = pivotObjects?.[0] ?? null;
  const caseDecisionsQuery = useCaseDecisionsQuery(caseDetail.id);
  const hasRuleHits = caseDecisionsQuery.data?.pages.some((page) =>
    page.decisions.some((d) => d.rules.some((r) => r.outcome === 'hit')),
  );

  const rootRef = useRef<HTMLDivElement>(null);
  const editTagsMutation = useEditTagsMutation();
  const caseTagsIds = caseDetail.tags.map((t) => t.tagId);

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
      <div className="flex flex-col gap-lg">
        <div className="flex flex-col gap-sm">
          <div className="text-default font-medium">{t('cases:case_detail.pivot_panel.informations')}</div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
            <Card className="flex flex-col gap-sm text-small self-start">
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
              <div className="grid grid-cols-2 gap-sm">
                <div className="flex flex-col gap-sm">
                  <CopyToClipboardButton toCopy={caseDetail.id}>{caseDetail.id}</CopyToClipboardButton>
                  <EditCaseAssignee
                    disabled={false}
                    id={caseDetail.id}
                    assigneeId={caseDetail.assignedTo}
                    currentUser={currentUser}
                  />
                  <EditCaseInbox id={caseDetail.id} inboxId={caseDetail.inboxId} />
                </div>
              </div>
            </Card>
            {mainPivotObject ? (
              <ClientCard
                caseId={caseDetail.id}
                pivotObject={mainPivotObject}
                dataModel={dataModel}
                client360Tables={client360Tables}
                userScoringAccess={userScoringAccess}
              />
            ) : (
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
              </Card>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_minmax(500px,_1fr)] gap-lg">
          <div className="flex flex-col gap-md">
            <AiReviewCard caseId={caseDetail.id} canManuallyReview={caseInbox?.caseReviewManual ?? false} />

            <div className="flex flex-col justify-start gap-xs">
              <div className="text-default text-grey-primary flex items-center justify-between px-2xs font-medium">
                <span>{t('cases:alerts')}</span>
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
          <div className="flex flex-col gap-md">
            <CaseInvestigation root={rootRef} caseId={caseDetail.id} events={caseDetail.events} />
          </div>
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
  pivotObject: PivotObject;
  dataModel: DataModel;
  client360Tables: Client360Table[];
  userScoringAccess: FeatureAccessLevelDto;
};

function ClientCard({ caseId, pivotObject, dataModel, client360Tables, userScoringAccess }: ClientCardProps) {
  const { t } = useTranslation(['common']);
  const { currentUser } = useOrganizationDetails();
  const currentTable = dataModel.find((t) => t.name === pivotObject.pivotObjectName);
  const { metadata, entityName, clientName } = getClientDisplayInfo(pivotObject, client360Tables);
  const [explorationOpen, setExplorationOpen] = useState(false);

  return (
    <Card className="flex flex-col gap-sm text-small">
      <div className="flex justify-between items-center">
        <span className="font-medium">{clientName}</span>
        <div className="flex items-center gap-sm">
          {pivotObject.pivotObjectId ? (
            <UserScoreBadge
              objectType={pivotObject.pivotObjectName}
              objectId={pivotObject.pivotObjectId}
              userScoringAccess={userScoringAccess}
            />
          ) : null}
          {metadata && pivotObject.isIngested ? (
            <Link
              to="/client-detail/$objectType/$objectId"
              params={clientDetailLinkParams(pivotObject.pivotObjectName, pivotObject.pivotObjectId!)}
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
        {pivotObject.pivotObjectId ? (
          <ClientObjectTagList
            caseId={caseId}
            tableName={pivotObject.pivotObjectName}
            objectId={pivotObject.pivotObjectId}
          />
        ) : null}
      </div>
      <div>
        <DataFields
          options={{ layout: '2-columns' }}
          object={pivotObject.pivotObjectData as DataModelObject}
          table={pivotObject.pivotObjectName}
        />
        {currentTable ? (
          <DataModelExplorerProvider>
            <PivotNavigationOptions
              currentUser={currentUser}
              pivotObject={pivotObject}
              table={currentTable}
              dataModel={dataModel}
              onExplore={() => setExplorationOpen(true)}
              options={{ layout: '2-columns' }}
            />
            <DataExplorerPanel dataModel={dataModel} open={explorationOpen} onOpenChange={setExplorationOpen} />
          </DataModelExplorerProvider>
        ) : null}
      </div>
    </Card>
  );
}
