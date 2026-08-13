import { ClientDocumentsPopover } from '@app-builder/components/Annotations/ClientDocumentsPopover';
import { ClientObjectTagList } from '@app-builder/components/Annotations/ClientObjectTagList';
import { DocumentsList } from '@app-builder/components/ClientDetail/DocumentsList';
import { DataFields } from '@app-builder/components/Data/DataVisualisation/DataFields';
import { DataExplorerPanel } from '@app-builder/components/DataModelExplorer/DataExplorerPanel';
import { DataModel, DataModelObject } from '@app-builder/models';
import { CaseDetail, getPivotObjectKey, PivotObject } from '@app-builder/models/cases';
import { useGetAnnotationsQuery } from '@app-builder/queries/data/get-annotations';
import { useOrganizationDetails } from '@app-builder/services/organization/organization-detail';
import { clientDetailLinkParams } from '@app-builder/utils/routes/client-detail-url';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import type { Client360Table } from 'marble-api';
import { type FeatureAccessLevelDto } from 'marble-api/generated/feature-access-api';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card, CtaV2ClassName, cn, Popover, Tag, Typo } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { DataModelExplorerProvider } from '../DataModelExplorer/Provider';
import { pageLayoutGutter } from '../Page/page-layout';
import { ClientCommentsListCard } from './ClientComments';
import { ClientRelatedAlertCasesCard } from './ClientRelatedAlertCasesCard';
import { isGraphEligiblePivot } from './graph-pivots';
import { CommentContext } from './hooks/comment-context';
import { MainLinksGraph } from './MainLinksGraph';
import { NavigationOptions } from './NavigationOptions';
import { UserScoreBadge } from './UserScore/UserScoreBadge';

export type CaseManagerClientsPageProps = {
  caseDetail: CaseDetail;
  dataModel: DataModel;
  pivotObject: PivotObject;
  ingestedInfo: { objectId: string; objectType: string } | null;
  client360Tables: Client360Table[];
  userScoringAccess: FeatureAccessLevelDto;
};

export function CaseManagerClientsPage({
  caseDetail,
  dataModel,
  pivotObject,
  ingestedInfo,
  client360Tables,
  userScoringAccess,
}: CaseManagerClientsPageProps) {
  const { t } = useTranslation(['common', 'cases']);
  const queryClient = useQueryClient();
  const { currentUser } = useOrganizationDetails();
  const { set } = CommentContext.useValue();
  const annotationsQuery = useGetAnnotationsQuery(pivotObject.pivotObjectName, pivotObject.pivotObjectId!, true);
  const [isEditingDocuments, setIsEditingDocuments] = useState(false);
  const [explorationOpen, setExplorationOpen] = useState(false);

  const currentTable = dataModel.find((t) => t.name === pivotObject.pivotObjectName);
  const metadata = client360Tables.find((t) => t.name === pivotObject.pivotObjectName);
  const entityName = metadata?.alias || metadata?.name || pivotObject.pivotObjectName;
  const clientName = metadata ? (pivotObject.pivotObjectData.data[metadata.caption_field] as string) : '';
  const showMainLinks = isGraphEligiblePivot(pivotObject, dataModel);

  return (
    <div className={cn('grid grid-cols-1 lg:grid-cols-2', pageLayoutGutter.gap)}>
      <div className="flex flex-col gap-sm">
        <div className="flex justify-between items-center">
          <span className="font-medium">{clientName}</span>
          <div className="flex items-center gap-sm">
            {ingestedInfo ? <UserScoreBadge userScoringAccess={userScoringAccess} {...ingestedInfo} /> : null}
            {metadata && ingestedInfo ? (
              <Link
                to="/client-detail/$objectType/$objectId"
                params={clientDetailLinkParams(ingestedInfo.objectType, ingestedInfo.objectId)}
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
              caseId={caseDetail.id}
              tableName={pivotObject.pivotObjectName}
              objectId={pivotObject.pivotObjectId}
              annotations={annotationsQuery.data?.annotations.tags}
              placeholder={t('cases:manager.principal.add_tag_placeholder')}
            />
          ) : null}
        </div>
        <Card className="flex flex-col gap-sm text-small">
          <div>
            <DataFields
              object={pivotObject.pivotObjectData as DataModelObject}
              table={pivotObject.pivotObjectName}
              options={{ layout: '2-columns' }}
            />
            {currentTable ? (
              <DataModelExplorerProvider>
                <NavigationOptions
                  currentUser={currentUser}
                  pivotObject={pivotObject}
                  table={currentTable}
                  dataModel={dataModel}
                  onExplore={() => setExplorationOpen(true)}
                />
                <DataExplorerPanel dataModel={dataModel} open={explorationOpen} onOpenChange={setExplorationOpen} />
              </DataModelExplorerProvider>
            ) : null}
          </div>
        </Card>
        {showMainLinks && ingestedInfo ? (
          <div className="space-y-sm">
            <div className="flex justify-between items-center">
              <Typo variant="title2">{t('cases:manager.clients.main_links_title')}</Typo>
              <Link
                from="/cases/s/$caseId/clients/$pivotValue"
                to="/cases/s/$caseId/links/$pivotValue"
                params={{ pivotValue: getPivotObjectKey(pivotObject) }}
                className={CtaV2ClassName({ appearance: 'link', variant: 'primary' })}
              >
                <Icon icon="eye" className="size-4" />
                {t('common:see_all')}
              </Link>
            </div>
            <MainLinksGraph
              objectType={ingestedInfo.objectType}
              objectId={ingestedInfo.objectId}
              dataModel={dataModel}
            />
          </div>
        ) : null}
      </div>
      <div className="flex flex-col gap-lg">
        {ingestedInfo ? (
          <div className="flex flex-col gap-sm">
            <div className="flex justify-between items-center">
              <span className="font-medium">{t('cases:manager.clients.last_comments_title')}</span>
              <Button variant="secondary" onClick={() => set(ingestedInfo)}>
                <Icon icon="plus" className="size-4" />
                {t('common:add')}
              </Button>
            </div>
            <ClientCommentsListCard annotationsQuery={annotationsQuery} />
          </div>
        ) : null}

        <div className="flex flex-col gap-sm">
          <div className="font-medium">{t('cases:case_detail.pivot_panel.case_history')}</div>
          <ClientRelatedAlertCasesCard pivotValue={pivotObject.pivotValue} caseId={caseDetail.id} />
        </div>

        {ingestedInfo ? (
          <div className="flex flex-col gap-sm">
            <div className="flex justify-between items-center">
              <div className="font-medium">{t('client360:client_detail.documents.title')}</div>
              <div>
                <Popover.Root open={isEditingDocuments} onOpenChange={setIsEditingDocuments}>
                  <Popover.Trigger asChild>
                    <Button variant="secondary">
                      <Icon icon="plus" className="size-4" />
                      <span>{t('common:add')}</span>
                    </Button>
                  </Popover.Trigger>
                  <Popover.Content side="bottom" align="end" sideOffset={4} collisionPadding={10} className="w-[340px]">
                    <ClientDocumentsPopover
                      tableName={ingestedInfo.objectType}
                      objectId={ingestedInfo.objectId}
                      onAnnotateSuccess={() => {
                        setIsEditingDocuments(false);
                        queryClient.invalidateQueries({
                          queryKey: ['annotations', ingestedInfo.objectType, ingestedInfo.objectId],
                        });
                      }}
                    />
                  </Popover.Content>
                </Popover.Root>
              </div>
            </div>
            <Card className="@container">
              <DocumentsList objectType={ingestedInfo.objectType} objectId={ingestedInfo.objectId} />
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  );
}
