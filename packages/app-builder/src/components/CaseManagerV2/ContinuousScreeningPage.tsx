import { BreadCrumbs } from '@app-builder/components/Breadcrumbs';
import { Page } from '@app-builder/components/Page';
import { pageLayoutGutter } from '@app-builder/components/Page/page-layout';
import { isAdmin } from '@app-builder/models';
import { CaseDetail } from '@app-builder/models/cases';
import { ContinuousScreening } from '@app-builder/models/continuous-screening';
import { Inbox } from '@app-builder/models/inbox';
import { useOrganizationDetails } from '@app-builder/services/organization/organization-detail';
import { Card, cn } from 'ui-design-system';
import { CaseInfo } from './CaseInfo';
import { RequestDetail } from './ContinuousScreening/RequestDetail';
import { ScreeningMatchList } from './Screening/MatchList';

type ContinuousScreeningPageProps = {
  caseDetail: CaseDetail;
  screening: ContinuousScreening;
  inboxes: Inbox[];
};

export function ContinuousScreeningPage({ caseDetail, inboxes, screening }: ContinuousScreeningPageProps) {
  const { currentUser } = useOrganizationDetails();
  const isUserAdmin = isAdmin(currentUser);

  return (
    <Page.Main>
      <Page.Header>
        <BreadCrumbs />
      </Page.Header>
      <Page.Container>
        <Page.Content className={cn('grid grid-cols-[2fr_1fr]', pageLayoutGutter.padding)}>
          <div className="flex flex-col gap-lg">
            <div className="flex flex-col gap-sm">
              <Card className="text-small">
                <CaseInfo caseDetail={caseDetail} currentUser={currentUser} />
              </Card>
            </div>
            <ScreeningMatchList screening={screening} isUserAdmin={isUserAdmin} caseDetail={caseDetail} />
          </div>
          <RequestDetail caseDetail={caseDetail} screening={screening} />
        </Page.Content>
      </Page.Container>
    </Page.Main>
  );
}
