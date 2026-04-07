import { ErrorComponent, Page } from '@app-builder/components';
import { BreadCrumbLink, type BreadCrumbProps, BreadCrumbs } from '@app-builder/components/Breadcrumbs';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isAnalyticsAvailable } from '@app-builder/services/feature-access';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

const analyticsLegacyLoader = createServerFn()
  .middleware([authMiddleware])
  .handler(async function analyticsLegacyLoader({ context }) {
    const { user, analytics, entitlements } = context.authInfo;

    if (!isAnalyticsAvailable(user, entitlements)) {
      throw redirect({ to: '/' });
    }

    const analyticsList = await analytics.legacyListAnalytics();
    const globalDashbord = analyticsList.find(({ embeddingType }) => embeddingType === 'global_dashboard');
    if (!globalDashbord) {
      throw new Response("Global dashboard doesn't exist", { status: 404 });
    }

    return {
      globalDashbord: {
        title: 'Global Dashboard',
        src: globalDashbord.signedEmbeddingUrl,
      },
    };
  });

export const Route = createFileRoute('/_app/_builder/analytics-legacy')({
  staticData: {
    BreadCrumbs: [
      ({ isLast }: BreadCrumbProps) => {
        const { t } = useTranslation(['navigation']);

        return (
          <BreadCrumbLink to="/detection/analytics" isLast={isLast}>
            <Icon icon="analytics" className="me-2 size-6" />
            <span className="line-clamp-1 text-start">{t('navigation:analytics')}</span>
          </BreadCrumbLink>
        );
      },
    ],
  },
  staleTime: Infinity,
  loader: () => analyticsLegacyLoader(),
  component: Analytics,
  errorComponent: ({ error }: { error: unknown }) => <ErrorComponent error={error} />,
});

function Analytics() {
  const { globalDashbord } = Route.useLoaderData();

  return (
    <Page.Main>
      <Page.Header className="justify-between">
        <BreadCrumbs />
      </Page.Header>
      <iframe src={globalDashbord.src} title={globalDashbord.title} className="size-full"></iframe>
    </Page.Main>
  );
}
