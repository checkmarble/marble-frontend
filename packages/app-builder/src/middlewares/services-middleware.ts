import { initServerServices } from '@app-builder/services/init.server';
import { createMiddleware } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';

export const servicesMiddleware = createMiddleware({ type: 'function' })
  .middleware([])
  .server(async ({ next }) => {
    const request = getRequest();
    const services = initServerServices(request);
    const appConfig = await services.appConfigRepository.getAppConfig();
    return next({ context: { services, appConfig } });
  });
