import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type LoaderFunctionArgs } from '@remix-run/node';

// TODO: this should run in the browser
export async function loader({ request }: LoaderFunctionArgs) {
  const { appConfigRepository, authService } = initServerServices(request);
  const oidc = await authService.makeOidcService(appConfigRepository);
  const tokens = await oidc.authenticate(request);

  const response = await authService.authenticateOidc(request, tokens, {
    successRedirect: getRoute('/app-router'),
    failureRedirect: getRoute('/oidc/auth'),
  });

  return response;
}
