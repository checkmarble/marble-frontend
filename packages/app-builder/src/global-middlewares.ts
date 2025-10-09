import { setGlobalMiddlewares } from '@app-builder/core/requests';
import { servicesMiddleware } from './middlewares/services-middleware';

export const globalMiddlewares = setGlobalMiddlewares(servicesMiddleware);
