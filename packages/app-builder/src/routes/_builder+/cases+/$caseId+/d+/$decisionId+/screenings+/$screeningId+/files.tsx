import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams } from '@app-builder/utils/short-uuid';
import { type LoaderFunctionArgs } from '@remix-run/node';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const { screening: screeningRepository } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const decisionId = fromParams(params, 'decisionId');
  const screeningId = fromParams(params, 'screeningId');
  const screenings = await screeningRepository.listScreenings({ decisionId });
  const screening = screenings.find((s) => s.id === screeningId);

  if (!screening) {
    throw new Response(null, { status: 404, statusText: 'Not Found' });
  }

  return {
    files: await screeningRepository.listScreeningFiles({
      screeningId: screening.id,
    }),
    screening,
  };
}
