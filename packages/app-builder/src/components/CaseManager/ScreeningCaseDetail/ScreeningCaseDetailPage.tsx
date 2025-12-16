import { Callout, Page } from '@app-builder/components';
import { BreadCrumbs } from '@app-builder/components/Breadcrumbs';
import { type CaseDetail } from '@app-builder/models/cases';
import { ContinuousScreening } from '@app-builder/models/continuous-screening';
import { Inbox } from '@app-builder/models/inbox';
import { useRef } from 'react';
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
};

export const ScreeningCaseDetailPage = ({ caseDetail, caseInbox, screening }: ScreeningCaseDetailPageProps) => {
  // const { openPanel, closePanel } = usePanel();
  const containerRef = useRef<HTMLDivElement>(null);

  // const handleOpenPanel = () => {
  //   openPanel(
  //     <PanelContainer size="xxxl" className="p-v2-xxxl">
  //       <Icon icon="left-panel-close" className="size-5 absolute inset-v2-md" onClick={closePanel} />
  //     </PanelContainer>,
  //   );
  // };

  return (
    <Page.Main>
      <Page.Header className="justify-between">
        <BreadCrumbs />
      </Page.Header>
      <Page.Container>
        <Page.ContentV2 paddingLess>
          <div className="grid grid-cols-[1fr_calc(var(--spacing)_*_130)] h-full relative">
            <div className="flex flex-col gap-v2-lg p-v2-lg">
              <CaseDetailInfo caseDetail={caseDetail} caseInbox={caseInbox} />
              <ScreeningCaseMatches screening={screening} />
              <CaseInvestigation caseId={caseDetail.id} events={caseDetail.events} root={containerRef} />
              {caseDetail.files.length > 0 ? <CaseDocuments files={caseDetail.files} /> : null}
            </div>
            <div className="h-full bg-white border-l border-grey-border">
              <div className="p-v2-lg flex flex-col gap-v2-md top-0 sticky">
                <div className="flex items-center gap-v2-sm">
                  <h2 className="text-h2 font-medium">Informations</h2>
                  <Tag>Recherche initiale</Tag>
                </div>
                <Callout color="orange">
                  Un nouveau User à été mis sous surveillance: des correspondances ont été trouvées dans les listes sous
                  surveillance.
                </Callout>
                <ScreeningRequestDetail
                  configStableId={screening.continuousScreeningConfigStableId}
                  request={screening.request}
                />
                <ScreeningObjectDetails objectType={screening.objectType} objectId={screening.objectId} />
              </div>
            </div>
          </div>
        </Page.ContentV2>
      </Page.Container>
    </Page.Main>
  );
};
