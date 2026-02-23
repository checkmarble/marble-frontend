import { env } from '@bo/env';
import { createServerFn } from '@tanstack/react-start';
import { marblecoreApi } from 'marble-api';

export const getAppConfigFn = createServerFn({ method: 'GET' }).handler(async () => {
  console.log('GET APP CONFIG FN', env.API_BASE_URL);
  const appConfig = await marblecoreApi.getAppConfig({ baseUrl: env.API_BASE_URL });
  return appConfig;
});
