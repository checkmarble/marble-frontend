import { UsersApi, Configuration } from '@marble-front/api/marble';
import { getServerEnv } from '@marble-front/builder/utils/environment';
import { AuthorizationMiddleware } from './authorization.server';

const usersApiConf = new Configuration({
  basePath: getServerEnv('MARBLE_API_DOMAIN'),
  middleware: [AuthorizationMiddleware],
});

export const usersApi = new UsersApi(usersApiConf);
