import { type Case } from '@app-builder/models/cases';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type LoaderFunctionArgs } from '@remix-run/node';
import invariant from 'tiny-invariant';

export type PivotRelatedCasesResource = {
  cases: Case[];
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const { cases: caseRepository } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const pivotValue = params['pivotValue'];
  invariant(pivotValue, 'Expected pivotValue param to be present in url');

  const [cases] = await Promise.all([caseRepository.getPivotRelatedCases({ pivotValue })]);

  return Response.json({
    cases,
  });
}
