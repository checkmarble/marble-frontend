import { createMiddleware } from '@app-builder/core/requests';
import { initServerServices } from '@app-builder/services/init.server';

export const servicesMiddleware = createMiddleware(
  [],
  async function servicesMiddleware({ request }, next) {
    const services = initServerServices(request);
    return next({ context: { services } });
  },
);
