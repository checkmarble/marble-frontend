import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import type { LoaderFunctionArgs } from '@remix-run/node';
import type { Namespace } from 'i18next';

export const handle = {
  i18n: ['scenarios'] satisfies Namespace,
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const { scenarioId } = params;
  if (!scenarioId) {
    return {
      redirect: getRoute('/scenarios'),
    };
  }

  return authService.isAuthenticated(request, {
    successRedirect: getRoute('/scenarios/:scenarioId/home', {
      scenarioId,
    }),
    failureRedirect: getRoute('/sign-in'),
  });
}
