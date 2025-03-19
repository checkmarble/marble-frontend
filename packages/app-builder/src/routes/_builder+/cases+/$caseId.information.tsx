import { casesI18n } from '@app-builder/components/Cases';
import { EditCase } from '@app-builder/routes/ressources+/cases+/edit';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { type Namespace } from 'i18next';

import { useCurrentCase } from './$caseId._layout';

export const handle = {
  i18n: ['common', 'navigation', ...casesI18n] satisfies Namespace,
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const { inbox } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  return { inboxes: await inbox.listInboxes() };
}

export default function CasePage() {
  const { caseDetail } = useCurrentCase();
  const { inboxes } = useLoaderData<typeof loader>();

  return <EditCase detail={caseDetail} inboxes={inboxes} />;
}
