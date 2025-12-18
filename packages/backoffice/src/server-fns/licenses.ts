import { env } from '@bo/env';
import { needAuth } from '@bo/middlewares/auth';
import { createServerFn } from '@tanstack/react-start';
import { backofficeApi } from 'marble-api';
import { z } from 'zod/v4';

export const getLicensesFn = createServerFn({ method: 'GET' })
  .middleware([needAuth])
  .handler(async ({ context }) => {
    const { licenses } = await backofficeApi.getLicenses({
      baseUrl: env.API_BASE_URL,
      fetch: context.authFetch,
    });

    return licenses;
  });

const licenseEntitlementsSchema = z.object({
  sso: z.boolean(),
  workflows: z.boolean(),
  analytics: z.boolean(),
  data_enrichment: z.boolean(),
  user_roles: z.boolean(),
  webhooks: z.boolean(),
  rule_snoozes: z.boolean(),
  test_run: z.boolean(),
  sanctions: z.boolean(),
  auto_assignment: z.boolean(),
  case_ai_assist: z.boolean(),
  continuous_screening: z.boolean(),
  user_scoring: z.boolean(),
  lexisnexis: z.boolean(),
});

export const licensePayloadSchema = z.object({
  expiration_date: z.string(),
  organization_name: z.string().min(1),
  description: z.string(),
  license_entitlements: licenseEntitlementsSchema,
});

export type LicensePayload = z.infer<typeof licensePayloadSchema>;

export const createLicenseFn = createServerFn({ method: 'POST' })
  .middleware([needAuth])
  .validator(licensePayloadSchema)
  .handler(async ({ context, data }) => {
    const { license } = await backofficeApi.createLicense(data, {
      baseUrl: env.API_BASE_URL,
      fetch: context.authFetch,
    });

    return license;
  });

export const updateLicenseFnInputSchema = z.object({
  licenseId: z.uuid(),
  payload: licensePayloadSchema.extend({
    suspend: z.boolean().optional(),
  }),
});

export type UpdateLicenseInput = z.infer<typeof updateLicenseFnInputSchema>;

export const updateLicenseFn = createServerFn({ method: 'POST' })
  .middleware([needAuth])
  .validator(updateLicenseFnInputSchema)
  .handler(async ({ context, data }) => {
    const { license } = await backofficeApi.updateLicense(data.licenseId, data.payload, {
      baseUrl: env.API_BASE_URL,
      fetch: context.authFetch,
    });

    return license;
  });
