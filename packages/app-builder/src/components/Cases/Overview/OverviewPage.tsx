import { CasesNavigationTabs } from '@app-builder/components/Cases/Navigation/Tabs';
import { Page } from '@app-builder/components/Page';
import { type InboxMetadata } from '@app-builder/models/inbox';
import { type FeatureAccessLevelDto } from 'marble-api/generated/feature-access-api';
import { useTranslation } from 'react-i18next';
import { Typo } from 'ui-design-system';
import { CaseByDateGraph } from './Graph/CaseByDateGraph';
import { CaseByInboxGraph } from './Graph/CaseByInboxGraph';
import { AIConfigSection } from './Section/AIConfigSection';
import { AutoAssignmentSection } from './Section/AutoAssignmentSection';
import { WorkflowConfigSection } from './Section/WorkflowConfigSection';

interface OverviewPageProps {
  currentUserId?: string;
  isGlobalAdmin: boolean;
  canViewAdminSections: boolean;
  allInboxesMetadata: InboxMetadata[];
  entitlements: {
    autoAssignment: FeatureAccessLevelDto;
    aiAssist: FeatureAccessLevelDto;
  };
}

export const OverviewPage = ({
  currentUserId,
  isGlobalAdmin,
  canViewAdminSections,
  allInboxesMetadata,
  entitlements,
}: OverviewPageProps) => {
  const { t } = useTranslation(['cases']);

  return (
    <Page.Main>
      <Page.Container>
        <Page.ContentV2 className="gap-md">
          <div className="grid grid-cols-[1fr_calc(var(--spacing-xs)_*_90)] gap-lg">
            <div className="flex flex-col gap-md">
              <CasesNavigationTabs />
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-md">
                <CaseByDateGraph />
                <CaseByInboxGraph />
              </div>
            </div>
            <div className="flex flex-col gap-lg">
              <Typo variant="title2">{t('cases:overview.general_config.title')}</Typo>
              {canViewAdminSections ? (
                <AutoAssignmentSection
                  currentUserId={currentUserId}
                  isGlobalAdmin={isGlobalAdmin}
                  access={entitlements.autoAssignment}
                />
              ) : null}
              {canViewAdminSections ? (
                <AIConfigSection isGlobalAdmin={isGlobalAdmin} access={entitlements.aiAssist} />
              ) : null}
              {canViewAdminSections ? (
                <WorkflowConfigSection
                  isGlobalAdmin={isGlobalAdmin}
                  aiAssistAccess={entitlements.aiAssist}
                  allInboxesMetadata={allInboxesMetadata}
                />
              ) : null}
            </div>
          </div>
        </Page.ContentV2>
      </Page.Container>
    </Page.Main>
  );
};
