import { ClientObjectTagList } from '@app-builder/components/Annotations/ClientObjectTagList';
import { AiReviewCard } from '@app-builder/components/CaseManagerV2/AiReview/AiReviewCard';
import { UserScoreBadge } from '@app-builder/components/CaseManagerV2/UserScore/UserScoreBadge';
import { CaseAlerts } from '@app-builder/components/Cases/CaseAlerts';
import { DataModel, DataModelObject } from '@app-builder/models';
import { CaseDetail, PivotObject } from '@app-builder/models/cases';
import { Inbox } from '@app-builder/models/inbox';
import { editTagsPayloadSchema, useEditTagsMutation } from '@app-builder/queries/cases/edit-tags';
import { useOrganizationDetails } from '@app-builder/services/organization/organization-detail';
import { useOrganizationTags } from '@app-builder/services/organization/organization-tags';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { useForm } from '@tanstack/react-form';
import { Link } from '@tanstack/react-router';
import type { Client360Table } from 'marble-api';
import { type FeatureAccessLevelDto } from 'marble-api/generated/feature-access-api';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, Button, Card, CtaV2ClassName, Tag, TagList, TooltipV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { PivotNavigationOptions } from '../CaseManager/PivotsPanel/PivotNavigationOptions';
import { CaseInvestigation } from '../CaseManager/shared/CaseInvestigation/CaseInvestigation';
import { CaseStatusBadgeV2 } from '../Cases';
import { CopyToClipboardButton } from '../CopyToClipboardButton';
import { DataFields } from '../Data/DataVisualisation/DataFields';
import { DataModelExplorer } from '../DataModelExplorer/DataModelExplorer';
import { DataModelExplorerProvider } from '../DataModelExplorer/Provider';
import { PanelContainer, PanelContent, PanelRoot } from '../Panel';

export type CaseManagerPrincipalPageProps = {
  caseDetail: CaseDetail;
  dataModel: DataModel;
  pivotObjects: PivotObject[] | null;
  inboxes: Inbox[];
  client360Tables: Client360Table[];
  userScoringAccess: FeatureAccessLevelDto;
};

export function CaseManagerPrincipalPage({
  caseDetail,
  dataModel,
  pivotObjects,
  inboxes,
  client360Tables,
  userScoringAccess,
}: CaseManagerPrincipalPageProps) {
  const { t } = useTranslation(['common', 'cases']);
  const { orgTags } = useOrganizationTags();
  const { orgUsers } = useOrganizationUsers();
  const { currentUser } = useOrganizationDetails();
  const caseInbox = inboxes.find((inbox) => inbox.id === caseDetail.inboxId) ?? null;
  const mainPivotObject = pivotObjects?.[0] ?? null;

  const assignedUser = orgUsers.find((user) => user.userId === caseDetail.assignedTo);
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

  return (
    <div className="flex flex-col gap-v2-lg">
      <div className="flex flex-col gap-v2-sm">
        <div className="text-default font-medium">{t('cases:case_detail.pivot_panel.informations')}</div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-v2-lg">
          <Card className="flex flex-col gap-v2-sm text-small">
            <div className="flex items-center gap-v2-xs">
              <CaseStatusBadgeV2 status={caseDetail.status} variant="semi-full" />
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
              <TooltipV2.Tooltip delayDuration={0}>
                <TooltipV2.TooltipTrigger asChild>
                  <Button variant="secondary" size="small" mode="icon" className="ml-auto">
                    <Icon icon="arrow-up" className="size-4" />
                  </Button>
                </TooltipV2.TooltipTrigger>
                <TooltipV2.TooltipContent className="capitalize">{t('cases:escalate')}</TooltipV2.TooltipContent>
              </TooltipV2.Tooltip>
            </div>
            <div className="grid grid-cols-2 gap-v2-sm">
              <div className="flex flex-col gap-v2-sm">
                <CopyToClipboardButton toCopy={caseDetail.id}>{caseDetail.id}</CopyToClipboardButton>
                <div className="flex items-center gap-v2-xs">
                  {/* Make it a select */}
                  <Avatar
                    color="transparent"
                    firstName={assignedUser?.firstName}
                    lastName={assignedUser?.lastName}
                    size="xs"
                  />
                  {assignedUser?.firstName + (assignedUser?.lastName ? ' ' + assignedUser.lastName : '')}
                  {assignedUser?.userId === currentUser.actorIdentity.userId
                    ? t('cases:manager.principal.you_marker')
                    : ''}
                </div>
                <div>{caseInbox?.name}</div>
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
            <Card />
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_minmax(500px,_1fr)] gap-v2-lg">
        <div className="flex flex-col gap-v2-md">
          <AiReviewCard caseId={caseDetail.id} canManuallyReview={caseInbox?.caseReviewManual ?? false} />

          <div className="flex flex-col justify-start gap-1.5">
            <div className="text-default text-grey-primary flex items-center justify-between px-1 font-medium">
              <span>{t('cases:alerts')}</span>
              {/*{hasRuleHits ? (
                  <Button variant="secondary" onClick={() => {}}>
                    <Icon icon="snooze" className="size-3.5" />
                    {t('cases:decisions.snooze_rules')}
                  </Button>
                ) : null}*/}
            </div>
            <CaseAlerts caseDetail={caseDetail} dataModel={dataModel} />
          </div>
        </div>
        <div className="flex flex-col gap-v2-md">
          <CaseInvestigation root={rootRef} caseId={caseDetail.id} events={caseDetail.events} />
        </div>
      </div>
    </div>
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
  const metadata = client360Tables.find((t) => t.name === pivotObject.pivotObjectName);
  const entityName = metadata?.alias || metadata?.name || pivotObject.pivotObjectName;
  const clientName = metadata ? (pivotObject.pivotObjectData.data[metadata.caption_field] as string) : '';
  const [explorationOpen, setExplorationOpen] = useState(false);

  return (
    <Card className="flex flex-col gap-v2-sm text-small">
      <div className="flex justify-between items-center">
        <span className="font-medium">{clientName}</span>
        <div className="flex items-center gap-v2-sm">
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
              params={{ objectId: pivotObject.pivotObjectId!, objectType: pivotObject.pivotObjectName }}
              className={CtaV2ClassName({ appearance: 'link', variant: 'primary' })}
            >
              <Icon icon="eye" className="size-4" />
              {t('common:see_all')}
            </Link>
          ) : null}
        </div>
      </div>
      <div className="flex gap-v2-xs items-center">
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
            <PanelRoot open={explorationOpen} onOpenChange={setExplorationOpen}>
              <PanelContainer size="max" className="max-w-[80vw]!">
                <PanelContent>
                  <DataModelExplorer dataModel={dataModel} />
                </PanelContent>
              </PanelContainer>
            </PanelRoot>
          </DataModelExplorerProvider>
        ) : null}
      </div>
    </Card>
  );
}
