import { Configuration, ScenariosApi } from '@marble-front/api/marble';
import { getServerEnv } from '@marble-front/builder/utils/environment';

import { AuthorizationMiddleware } from './authorization.server';

const scenariosApiConf = new Configuration({
  basePath: getServerEnv('MARBLE_API_DOMAIN'),
  middleware: [AuthorizationMiddleware],
});

export const scenariosApi = new ScenariosApi(scenariosApiConf);
