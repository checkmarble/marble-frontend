import { Callout, Page } from '@app-builder/components';
import { BreadCrumbs } from '@app-builder/components/Breadcrumbs';
import { DataListGrid } from '@app-builder/components/DataModelExplorer/DataListGrid';
import { PanelContainer, PanelContent, usePanel } from '@app-builder/components/Panel';
import { EntityProperties } from '@app-builder/components/Screenings/EntityProperties';
import { TopicTag } from '@app-builder/components/Screenings/TopicTag';
import { SquareTag } from '@app-builder/components/SquareTag';
import { type CaseDetail } from '@app-builder/models/cases';
import {
  ContinuousScreening,
  ContinuousScreeningMarbleToScreeningEntity,
  ContinuousScreeningScreeningEntityToMarble,
  isDirectContinuousScreening,
  isIndirectContinuousScreening,
  OpenSanctionEntityPayload,
} from '@app-builder/models/continuous-screening';
import { Inbox } from '@app-builder/models/inbox';
import { useRef } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { ButtonV2, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { CaseDocuments } from '../shared/CaseDocuments/CaseDocuments';
import { CaseInvestigation } from '../shared/CaseInvestigation/CaseInvestigation';
import { CaseDetailInfo } from './CaseDetailInfo';
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
        <Page.ContentV2 paddingLess>
          <div className="grid grid-cols-[1fr_calc(var(--spacing)_*_130)] h-full relative">
            <div className="flex flex-col gap-v2-lg p-v2-lg">
              <CaseDetailInfo caseDetail={caseDetail} caseInbox={caseInbox} isUserAdmin={isUserAdmin} />
              <ScreeningCaseMatches screening={screening} isUserAdmin={isUserAdmin} />
              <CaseInvestigation caseId={caseDetail.id} events={caseDetail.events} root={containerRef} />
              {caseDetail.files.length > 0 ? <CaseDocuments files={caseDetail.files} /> : null}
            </div>
            <div className="h-full bg-surface-card border-l border-grey-border">
              <div className="p-v2-lg flex flex-col gap-v2-md top-0 sticky">
                <div className="flex items-center gap-v2-sm">
                  <h2 className="text-h2 font-medium">{t('continuousScreening:review.information_title')}</h2>
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
                    return <DirectScreeningRequestDetail screening={directScreening} />;
                  })
                  .when(isIndirectContinuousScreening, (indirectScreening) => {
                    return <IndirectScreeningRequestDetail screening={indirectScreening} />;
                  })
                  .exhaustive()}
              </div>
            </div>
          </div>
        </Page.ContentV2>
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

const DirectScreeningRequestDetail = ({ screening }: { screening: ContinuousScreeningMarbleToScreeningEntity }) => {
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
    </>
  );
};

const IndirectScreeningRequestDetail = ({ screening }: { screening: ContinuousScreeningScreeningEntityToMarble }) => {
  const { t } = useTranslation(['continuousScreening', 'screenings']);
  const { openPanel } = usePanel();
  const handleViewAll = () => {
    openPanel(<ScreeningEntityDetailsPanel entity={screening.opensanctionEntityPayload} />);
  };

  return (
    <>
      <ScreeningRequestDetail
        configStableId={screening.continuousScreeningConfigStableId}
        request={screening.request}
      />
      <div className="flex flex-col gap-v2-sm p-v2-md bg-surface-card rounded-v2-lg border border-grey-border">
        <div className="flex justify-between items-center gap-v2-sm">
          <span className="font-medium">{screening.opensanctionEntityPayload.caption}</span>
          <span className="text-small text-grey-placeholder mr-auto">{screening.opensanctionEntityPayload.schema}</span>
          <ButtonV2 variant="secondary" onClick={handleViewAll}>
            {t('continuousScreening:review.entity_details.view_all')}
          </ButtonV2>
        </div>
        <div className="flex items-center gap-v2-sm">
          {screening.opensanctionEntityPayload.properties['topics']?.map((topic) => {
            return <TopicTag key={topic} topic={topic} className="text-small" />;
          })}
        </div>
        <DataListGrid>
          <div className="text-grey-placeholder truncate leading-6">
            {t('screenings:dataset', { count: screening.opensanctionEntityPayload.datasets.length })}
          </div>
          <div className="truncate flex flex-row flex-wrap gap-v2-sm">
            {screening.opensanctionEntityPayload.datasets.map((dataset) => {
              return <SquareTag key={dataset}>{dataset}</SquareTag>;
            })}
          </div>
        </DataListGrid>
      </div>
    </>
  );
};

const ScreeningEntityDetailsPanel = ({ entity }: { entity: OpenSanctionEntityPayload }) => {
  const { closePanel } = usePanel();
  const { t } = useTranslation(['continuousScreening', 'screenings']);

  return (
    <PanelContainer size="xxxl">
      <PanelContent>
        <div className="flex flex-col gap-v2-md">
          <ButtonV2 variant="secondary" mode="icon" onClick={closePanel}>
            <Icon icon="left-panel-close" className="size-4" />
          </ButtonV2>
          <div className="text-h1">{t('continuousScreening:review.entity_details.title')}</div>
          <div className="flex items-center gap-v2-sm">
            <span className="font-medium">{entity.caption}</span>
            <span className="text-small text-grey-placeholder">{entity.schema}</span>
          </div>
          <div className="flex items-center gap-v2-sm">
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
                  <ul className="list-disc list-inside">
                    {entity.datasets.map((dataset) => (
                      <li key={dataset}>{dataset}</li>
                    ))}
                  </ul>
                </div>
              </>
            }
          />
        </div>
      </PanelContent>
    </PanelContainer>
  );
};
