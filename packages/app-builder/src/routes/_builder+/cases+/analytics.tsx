import { AnalyticsPage } from '@app-builder/components/Cases/Analytics/AnalyticsPage';
import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { useLoaderData } from '@remix-run/react';
import { type Namespace } from 'i18next';

export const handle = {
  i18n: ['cases', 'common', 'navigation'] satisfies Namespace,
};

export const loader = createServerFn([authMiddleware], async function casesAnalyticsLoader({ context }) {
  const { inbox: inboxRepository } = context.authInfo;
  const inboxes = await inboxRepository.listInboxes();
  return { inboxes };
});

export default function CasesAnalytics() {
  const { inboxes } = useLoaderData<typeof loader>();
  return <AnalyticsPage inboxes={inboxes} />;
}
