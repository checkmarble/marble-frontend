import { initServerServices } from '@app-builder/services/init.server';
import { type LoaderFunctionArgs } from '@remix-run/node';
import { OIDCStrategy } from 'remix-auth-openid';

export interface Tokens extends OIDCStrategy.BaseUser {}

export async function loader({ request }: LoaderFunctionArgs) {
  const { appConfigRepository, authService } = initServerServices(request);
  const oidc = await authService.makeOidcService(appConfigRepository);

  await oidc.authenticate(request);
}
