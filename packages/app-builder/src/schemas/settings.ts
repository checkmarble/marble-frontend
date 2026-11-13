import { apiKeyRoleOptions } from '@app-builder/models/api-keys';
import { tagColors } from '@app-builder/models/tags';
import { eventTypes } from '@app-builder/models/webhook';
import { protectArray } from '@app-builder/utils/schema/helpers/array';
import { uniqueBy } from '@app-builder/utils/schema/helpers/unique-array';
import { z } from 'zod/v4';

// ---- API Keys ----

export const createApiKeyPayloadSchema = z.object({
  description: z.string().min(1),
  role: z.enum(apiKeyRoleOptions),
});
export type CreateApiKeyPayload = z.infer<typeof createApiKeyPayloadSchema>;

export const deleteApiKeyPayloadSchema = z.object({
  apiKeyId: z.uuid(),
});
export type DeleteApiKeyPayload = z.infer<typeof deleteApiKeyPayloadSchema>;

// ---- Inboxes ----

export const createInboxPayloadSchema = z.object({
  name: z.string().min(1),
  escalationInboxId: z.union([z.uuid(), z.null()]).optional(),
  autoAssignEnabled: z.boolean().optional(),
});
export type CreateInboxPayload = z.infer<typeof createInboxPayloadSchema>;

export const deleteInboxPayloadSchema = z.object({
  inboxId: z.uuid(),
});
export type DeleteInboxPayload = z.infer<typeof deleteInboxPayloadSchema>;

export const updateInboxPayloadSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  escalationInboxId: z.union([z.uuid(), z.null()]),
  autoAssignEnabled: z.boolean(),
});
export type UpdateInboxPayload = z.infer<typeof updateInboxPayloadSchema>;

export const createInboxUserPayloadSchema = z.object({
  userId: z.uuid().nonempty(),
  inboxId: z.uuid().nonempty(),
  role: z.enum(['admin', 'member']),
  autoAssignable: z.boolean(),
});
export type CreateInboxUserPayload = z.infer<typeof createInboxUserPayloadSchema>;

export const deleteInboxUserPayloadSchema = z.object({
  inboxUserId: z.uuid(),
});
export type DeleteInboxUserPayload = z.infer<typeof deleteInboxUserPayloadSchema>;

export const editInboxUserAutoAssignPayloadSchema = z.object({
  id: z.string(),
  autoAssignable: z.boolean(),
});
export type EditInboxUserAutoAssignPayload = z.infer<typeof editInboxUserAutoAssignPayloadSchema>;

export const updateInboxUserPayloadSchema = z.object({
  id: z.uuid(),
  role: z.enum(['admin', 'member']),
  autoAssignable: z.boolean(),
});
export type UpdateInboxUserPayload = z.infer<typeof updateInboxUserPayloadSchema>;

// ---- Organization ----

export const cidrSchema = z.union([z.cidrv4(), z.cidrv6(), z.ipv4(), z.ipv6()]);

export const updateAllowedNetworksPayloadSchema = z.object({
  allowedNetworks: protectArray(
    uniqueBy(z.array(cidrSchema), (s) => s),
    { maxLength: 100 },
  ),
});
export type UpdateAllowedNetworksPayload = z.infer<typeof updateAllowedNetworksPayloadSchema>;

export const updateOrganizationPayloadSchema = z.object({
  organizationId: z.string().min(1),
  autoAssignQueueLimit: z.coerce.number().min(0).optional(),
});
export type UpdateOrganizationPayload = z.infer<typeof updateOrganizationPayloadSchema>;

export const screeningProviderSchema = z.enum(['opensanctions', 'lexisnexis']);

export const updateScreeningProvidersPayloadSchema = z.object({
  organizationId: z.uuid(),
  manualSearch: screeningProviderSchema,
  transactionMonitoring: screeningProviderSchema,
  continuousMonitoring: screeningProviderSchema,
});
export type UpdateScreeningProvidersPayload = z.infer<typeof updateScreeningProvidersPayloadSchema>;

export const updateOrganizationScenariosPayloadSchema = z.object({
  organizationId: z.string().min(1),
  defaultScenarioTimezone: z.string(),
  sanctionThreshold: z.coerce.number().min(0).max(100).optional(),
  sanctionLimit: z.coerce.number().min(0).optional(),
});
export type UpdateOrganizationScenariosPayload = z.infer<typeof updateOrganizationScenariosPayloadSchema>;

// ---- Tags ----

export const createTagPayloadSchema = z.object({
  name: z.string().min(1),
  color: z.enum(tagColors),
  target: z.enum(['case', 'object']),
});
export type CreateTagPayload = z.infer<typeof createTagPayloadSchema>;

export const deleteTagPayloadSchema = z.object({
  tagId: z.uuid(),
});
export type DeleteTagPayload = z.infer<typeof deleteTagPayloadSchema>;

export const updateTagPayloadSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  color: z.enum(tagColors),
});
export type UpdateTagPayload = z.infer<typeof updateTagPayloadSchema>;

// ---- Users ----

export const roleBindingsSchema = z
  .array(
    z.object({
      id: z.string().optional(),
      role: z.string().min(1),
      conditions: z
        .object({
          not_before: z.iso.datetime({ offset: true }).optional(),
          not_after: z.iso.datetime({ offset: true }).optional(),
          day_of_week: z.array(z.number().int().min(1).max(7)).optional(),
          time_of_day: z
            .array(
              z
                .number()
                .int()
                .min(0)
                .max(2359)
                .refine((time) => time % 100 < 60),
            )
            .length(2)
            .optional(),
          networks: z.array(cidrSchema).optional(),
          used_second_factor: z.boolean().optional(),
        })
        .refine(
          (conditions) =>
            !conditions.not_before ||
            !conditions.not_after ||
            Date.parse(conditions.not_before) <= Date.parse(conditions.not_after),
          {
            message: 'Start date must be before end date',
            path: ['not_after'],
          },
        )
        .optional(),
    }),
  )
  .min(1);

export const createUserPayloadSchema = z.object({
  firstName: z.string().nonempty(),
  lastName: z.string().nonempty(),
  email: z.email().nonempty(),
  roles: roleBindingsSchema,
  organizationId: z.uuid().nonempty(),
});
export type CreateUserPayload = z.infer<typeof createUserPayloadSchema>;

export const organizationGrantRoleSchema = z.enum(['VIEWER', 'BUILDER', 'PUBLISHER', 'ADMIN', 'ANALYST']);
export type OrganizationGrantRole = z.infer<typeof organizationGrantRoleSchema>;

export const grantOrganizationAccessPayloadSchema = z.object({
  userId: z.uuid(),
  roles: roleBindingsSchema,
});
export type GrantOrganizationAccessPayload = z.infer<typeof grantOrganizationAccessPayloadSchema>;

export const editOrganizationUserFormSchema = z.object({
  firstName: z.string().trim().nonempty(),
  lastName: z.string().trim().nonempty(),
  roles: z.array(roleBindingsSchema.element),
});
export type EditOrganizationUserForm = z.infer<typeof editOrganizationUserFormSchema>;

// Only the provided fields are updated.
export const updateOrganizationUserPayloadSchema = editOrganizationUserFormSchema
  .omit({ roles: true })
  .partial()
  .extend({
    userId: z.uuid(),
    roles: roleBindingsSchema.optional(),
  });
export type UpdateOrganizationUserPayload = z.infer<typeof updateOrganizationUserPayloadSchema>;

export const revokeOrganizationAccessPayloadSchema = z.object({
  userId: z.uuid(),
});
export type RevokeOrganizationAccessPayload = z.infer<typeof revokeOrganizationAccessPayloadSchema>;

// ---- Webhooks ----

export const createWebhookPayloadSchema = z.object({
  url: z.url(),
  eventTypes: protectArray(z.array(z.enum(eventTypes))),
  httpTimeout: z.int().positive().optional(),
});
export type CreateWebhookPayload = z.infer<typeof createWebhookPayloadSchema>;

export const createWebhookSecretPayloadSchema = z.object({
  webhookId: z.string(),
  expireExistingInDays: z.int().positive().optional(),
});
export type CreateWebhookSecretPayload = z.infer<typeof createWebhookSecretPayloadSchema>;

export const deleteWebhookPayloadSchema = z.object({
  webhookId: z.string(),
});
export type DeleteWebhookPayload = z.infer<typeof deleteWebhookPayloadSchema>;

export const revokeWebhookSecretPayloadSchema = z.object({
  webhookId: z.string(),
  secretId: z.string(),
});
export type RevokeWebhookSecretPayload = z.infer<typeof revokeWebhookSecretPayloadSchema>;

export const updateWebhookPayloadSchema = z.object({
  id: z.string().nonempty(),
  eventTypes: protectArray(z.array(z.enum(eventTypes))),
  httpTimeout: z.int().positive().optional(),
});
export type UpdateWebhookPayload = z.infer<typeof updateWebhookPayloadSchema>;

// ---- Exported Fields (Data Model) ----

export const ingestedDataFieldSchema = z.object({
  path: protectArray(z.array(z.string())),
  name: z.string(),
});
export type IngestedDataField = z.infer<typeof ingestedDataFieldSchema>;

export const exportedFieldSchema = z.union([
  z.object({ triggerObjectField: z.string() }),
  z.object({ ingestedDataField: ingestedDataFieldSchema }),
]);
export type ExportedFieldPayload = z.infer<typeof exportedFieldSchema>;

// ---- Audit Events ----

export const auditEventsDateRangeSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('dynamic'), fromNow: z.string() }),
  z.object({ type: z.literal('static'), startDate: z.string(), endDate: z.string() }),
]);

export const auditEventsFiltersSchema = z.object({
  dateRange: auditEventsDateRangeSchema.optional(),
  userId: z.string().optional(),
  apiKeyId: z.string().optional(),
  table: z.string().optional(),
  entityId: z.string().optional(),
});

export type AuditEventsFilters = z.infer<typeof auditEventsFiltersSchema>;

export const auditEventsPaginationSchema = z.object({
  limit: z.coerce.number().optional().default(25),
  after: z.string().optional(),
});

export const getAuditEventsInputSchema = auditEventsFiltersSchema.and(auditEventsPaginationSchema);
export type GetAuditEventsInput = z.infer<typeof getAuditEventsInputSchema>;
