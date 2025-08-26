import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type LoaderFunctionArgs } from '@remix-run/node';

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const { inbox, cases } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });
  const inboxes = await inbox.listInboxes();

  return Response.json({
    inboxes,
    casesList: await cases.listCases({
      inboxIds: inboxes.map(({ id }) => id),
    }),
  });
}
