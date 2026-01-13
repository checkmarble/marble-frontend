import { BreadCrumbLink, type BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import { OverviewPage } from '@app-builder/components/Cases/Overview/OverviewPage';
import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isAdmin } from '@app-builder/models';
import { isInboxAdmin } from '@app-builder/services/feature-access';
import { getRoute } from '@app-builder/utils/routes';
import { useLoaderData } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

export const handle = {
  i18n: ['cases', 'common', 'navigation'] satisfies Namespace,
  BreadCrumbs: [
    ({ isLast }: BreadCrumbProps) => {
      const { t } = useTranslation(['navigation']);
      return (
        <BreadCrumbLink to={getRoute('/cases')} isLast={isLast}>
          <Icon icon="case-manager" className="me-2 size-6" />
          {t('navigation:case_manager')}
        </BreadCrumbLink>
      );
    },
    ({ isLast }: BreadCrumbProps) => {
      const { t } = useTranslation(['navigation']);
      return (
        <BreadCrumbLink to={getRoute('/cases/overview')} isLast={isLast}>
          {t('navigation:cases.overview')}
        </BreadCrumbLink>
      );
    },
  ],
};

export const loader = createServerFn([authMiddleware], async function casesOverviewLoader({ context }) {
  const { user, entitlements, inbox: inboxRepository } = context.authInfo;

  const [inboxes, allInboxesMetadata] = await Promise.all([
    inboxRepository.listInboxes(),
    inboxRepository.listInboxesMetadata(),
  ]);
  const canViewAdminSections = isAdmin(user) || inboxes.some((inbox) => isInboxAdmin(user, inbox));

  return {
    currentUserId: user.actorIdentity.userId,
    isGlobalAdmin: isAdmin(user),
    canViewAdminSections,
    allInboxesMetadata,
    entitlements: {
      autoAssignment: entitlements.autoAssignment,
      aiAssist: entitlements.caseAiAssist,
      workflows: entitlements.workflows,
    },
  };
});

export default function CasesOverview() {
  const loaderData = useLoaderData<typeof loader>();
  return <OverviewPage {...loaderData} />;
}
