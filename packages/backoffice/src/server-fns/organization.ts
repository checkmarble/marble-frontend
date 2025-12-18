import { env } from '@bo/env';
import { needAuth } from '@bo/middlewares/auth';
import { createServerFn } from '@tanstack/react-start';
import { marblecoreApi } from 'marble-api';
import { z } from 'zod/v4';

export const getOrganizationsFn = createServerFn({ method: 'GET' })
  .middleware([needAuth])
  .handler(async ({ context }) => {
    const { organizations } = await marblecoreApi.listOrganizations({
      baseUrl: env.API_BASE_URL,
      fetch: context.authFetch,
    });

    await new Promise((resolve) => setTimeout(resolve, 3000));

    return organizations;
  });

export const getOrganizationFn = createServerFn({ method: 'GET' })
  .middleware([needAuth])
  .inputValidator(
    z.object({
      orgId: z.uuid(),
    }),
  )
  .handler(async ({ context, data }) => {
    const { organization } = await marblecoreApi.getOrganization(data.orgId, {
      baseUrl: env.API_BASE_URL,
      fetch: context.authFetch,
    });

    return organization;
  });

export const getOrganizationUsersFn = createServerFn({ method: 'GET' })
  .middleware([needAuth])
  .inputValidator(
    z.object({
      orgId: z.uuid(),
    }),
  )
  .handler(async ({ context, data }) => {
    const { users } = await marblecoreApi.listOrganizationUsers(data.orgId, {
      baseUrl: env.API_BASE_URL,
      fetch: context.authFetch,
    });

    return users;
  });
