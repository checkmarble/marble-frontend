import { Callout, Page } from '@app-builder/components';
import { BreadCrumbs } from '@app-builder/components/Breadcrumbs';
import { type CaseDetail } from '@app-builder/models/cases';
import {
  ContinuousScreening,
  isDirectContinuousScreening,
  isIndirectContinuousScreening,
} from '@app-builder/models/continuous-screening';
import { Inbox } from '@app-builder/models/inbox';
import { useRef } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Tag } from 'ui-design-system';
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
                <ScreeningRequestDetail
                  configStableId={screening.continuousScreeningConfigStableId}
                  request={screening.request}
                />
                {match(screening)
                  .when(isDirectContinuousScreening, (screening) => {
                    return (
                      <ScreeningObjectDetails
                        objectType={screening.objectType}
                        objectId={screening.objectId}
                        className="bg-surface-card border border-grey-border"
                      />
                    );
                  })
                  .when(isIndirectContinuousScreening, (screening) => {
                    return null;
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
  return screening.entityPayload.schema;
};
