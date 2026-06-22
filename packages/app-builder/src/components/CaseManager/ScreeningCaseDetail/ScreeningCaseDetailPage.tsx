import { Callout, Page } from '@app-builder/components';
import { BreadCrumbs } from '@app-builder/components/Breadcrumbs';
import { DataListGrid } from '@app-builder/components/DataModelExplorer/DataListGrid';
import { PanelContainer, PanelContent } from '@app-builder/components/Panel';
import { PanelRoot, PanelSharpFactory } from '@app-builder/components/Panel/Panel';
import { EntityProperties } from '@app-builder/components/Screenings/EntityProperties';
import { EntityDatasetsList } from '@app-builder/components/Screenings/MatchCard/match-card-entity-components';
import { TopicTag } from '@app-builder/components/Screenings/TopicTag';
import { SquareTag } from '@app-builder/components/SquareTag';
import { Case, type CaseDetail } from '@app-builder/models/cases';
import {
  ContinuousScreening,
  ContinuousScreeningMarbleToScreeningEntity,
  ContinuousScreeningScreeningEntityToMarble,
  isDirectContinuousScreening,
  isIndirectContinuousScreening,
  OpenSanctionEntityPayload,
} from '@app-builder/models/continuous-screening';
import { Inbox } from '@app-builder/models/inbox';
import { useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Button, Tag, Typo } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { CaseDocuments } from '../shared/CaseDocuments/CaseDocuments';
import { CaseInvestigation } from '../shared/CaseInvestigation/CaseInvestigation';
import { CaseDetailInfo } from './CaseDetailInfo';
import { ObjectRelatedCases } from './ObjectRelatedCases';
import { ScreeningCaseMatches } from './ScreeningCaseMatches';
import { ScreeningObjectDetails } from './ScreeningObjectDetails';
import { ScreeningRequestDetail } from './ScreeningRequestDetail';

type ScreeningCaseDetailPageProps = {
  caseDetail: CaseDetail;
  caseInbox: Inbox;
  screening: ContinuousScreening;
  isUserAdmin: boolean;
};

export const ScreeningCaseDetailPage = ({
  caseDetail,
  caseInbox,
  screening,
  isUserAdmin,
}: ScreeningCaseDetailPageProps) => {
  const { t } = useTranslation(['continuousScreening']);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <Page.Main>
      <Page.Header className="justify-between">
        <BreadCrumbs />
      </Page.Header>
      <Page.Container>
        <Page.Content padding="none">
          <div className="grid grid-cols-[1fr_calc(var(--spacing)_*_130)] h-full relative">
            <div className="flex flex-col gap-lg p-lg">
              <CaseDetailInfo caseDetail={caseDetail} caseInbox={caseInbox} isUserAdmin={isUserAdmin} />
              <ScreeningCaseMatches screening={screening} isUserAdmin={isUserAdmin} caseDetail={caseDetail} />
              <CaseInvestigation caseId={caseDetail.id} events={caseDetail.events} root={containerRef} />
              {caseDetail.files.length > 0 ? <CaseDocuments files={caseDetail.files} /> : null}
            </div>
            <div className="h-full bg-surface-card border-l border-grey-border">
              <div className="p-lg flex flex-col gap-md top-0 sticky">
                <div className="flex items-center gap-sm">
                  <Typo variant="title2">{t('continuousScreening:review.information_title')}</Typo>
                  {isDirectContinuousScreening(screening) ? (
                    <Tag>{t(`continuousScreening:review.search_tag.${screening.triggerType}`)}</Tag>
                  ) : null}
                </div>
                <Callout color="orange">
                  <div>
                    <Trans
                      i18nKey={`continuousScreening:review.callout.${screening.triggerType}`}
                      components={{
                        EntityType: <Tag color="grey">{getEntityType(screening)}</Tag>,
                      }}
                    />
                  </div>
                </Callout>
                {match(screening)
                  .when(isDirectContinuousScreening, (directScreening) => {
                    return <DirectScreeningRequestDetail screening={directScreening} caseDetail={caseDetail} />;
                  })
                  .when(isIndirectContinuousScreening, (indirectScreening) => {
                    return <IndirectScreeningRequestDetail screening={indirectScreening} />;
                  })
                  .exhaustive()}
              </div>
            </div>
          </div>
        </Page.Content>
      </Page.Container>
    </Page.Main>
  );
};

const getEntityType = (screening: ContinuousScreening): string => {
  if (isDirectContinuousScreening(screening)) {
    return screening.objectType;
  }
  return screening.opensanctionEntityPayload.schema;
};

const DirectScreeningRequestDetail = ({
  screening,
  caseDetail,
}: {
  screening: ContinuousScreeningMarbleToScreeningEntity;
  caseDetail: Case;
}) => {
  return (
    <>
      <ScreeningRequestDetail
        configStableId={screening.continuousScreeningConfigStableId}
        request={screening.request}
      />
      <ScreeningObjectDetails
        objectType={screening.objectType}
        objectId={screening.objectId}
        className="bg-surface-card border border-grey-border"
      />
      <ObjectRelatedCases
        objectType={screening.objectType}
        objectId={screening.objectId}
        currentCase={caseDetail}
        className="bg-surface-card border border-grey-border"
      />
    </>
  );
};

const IndirectScreeningRequestDetail = ({ screening }: { screening: ContinuousScreeningScreeningEntityToMarble }) => {
  const { t } = useTranslation(['continuousScreening', 'screenings']);
  const [open, setOpen] = useState(false);

  return (
    <>
      <ScreeningRequestDetail
        configStableId={screening.continuousScreeningConfigStableId}
        request={screening.request}
      />
      <div className="flex flex-col gap-sm p-md bg-surface-card rounded-lg border border-grey-border">
        <div className="flex justify-between items-center gap-sm">
          <span className="font-medium">{screening.opensanctionEntityPayload.caption}</span>
          <span className="text-small text-grey-placeholder me-auto">{screening.opensanctionEntityPayload.schema}</span>
          <Button variant="secondary" onClick={() => setOpen(true)}>
            {t('continuousScreening:review.entity_details.view_all')}
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-sm">
          {screening.opensanctionEntityPayload.properties['topics']?.map((topic) => {
            return <TopicTag key={topic} topic={topic} className="text-small" />;
          })}
        </div>
        <DataListGrid>
          <div className="text-grey-placeholder truncate leading-6">
            {t('screenings:dataset', { count: screening.opensanctionEntityPayload.datasets.length })}
          </div>
          <div className="truncate flex flex-row flex-wrap gap-sm">
            {screening.opensanctionEntityPayload.datasets.map((dataset) => {
              return <SquareTag key={dataset}>{dataset}</SquareTag>;
            })}
          </div>
        </DataListGrid>
      </div>
      <PanelRoot open={open} onOpenChange={setOpen}>
        <ScreeningEntityDetailsPanel entity={screening.opensanctionEntityPayload} />
      </PanelRoot>
    </>
  );
};

const ScreeningEntityDetailsPanel = ({ entity }: { entity: OpenSanctionEntityPayload }) => {
  const panelSharp = PanelSharpFactory.useSharp();
  const { t } = useTranslation(['continuousScreening', 'screenings']);

  return (
    <PanelContainer size="xxxl">
      <PanelContent>
        <div className="flex flex-col gap-md">
          <Button variant="secondary" mode="icon" onClick={panelSharp.actions.close}>
            <Icon icon="left-panel-close" className="size-4" />
          </Button>
          <div className="text-h1">{t('continuousScreening:review.entity_details.title')}</div>
          <div className="flex items-center gap-sm">
            <span className="font-medium">{entity.caption}</span>
            <span className="text-small text-grey-placeholder">{entity.schema}</span>
          </div>
          <div className="flex items-center gap-sm">
            {entity.properties['topics']?.map((topic) => {
              return <TopicTag key={topic} topic={topic} className="text-small" />;
            })}
          </div>
          <EntityProperties
            entity={entity}
            before={
              <>
                <div className="font-bold">{t('screenings:dataset', { count: entity.datasets.length })}</div>
                <div className="">
                  <EntityDatasetsList
                    datasets={entity.datasets}
                    useCase="transaction_monitoring"
                    listClassName="list-disc list-inside"
                  />
                </div>
              </>
            }
          />
        </div>
      </PanelContent>
    </PanelContainer>
  );
};
