import { initServerServices } from '@app-builder/services/init.server';
import { LoaderFunctionArgs } from '@remix-run/server-runtime';

export async function loader({ request }: LoaderFunctionArgs) {
  const { appConfigRepository } = initServerServices(request);

  const appConfig = await appConfigRepository.getAppConfig();

  return Response.json(appConfig);
}
