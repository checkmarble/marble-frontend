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

export const createInboxRedirectRouteOptions = ['/cases/inboxes/$inboxId', '/settings/inboxes/$inboxId'] as const;

export const createInboxPayloadSchema = z.object({
  name: z.string().min(1),
  redirectRoute: z.enum(createInboxRedirectRouteOptions).optional(),
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
  redirectRoute: z.enum(createInboxRedirectRouteOptions),
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
  inboxId: z.uuid(),
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
  inboxId: z.uuid(),
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

export const createUserPayloadSchema = z.object({
  firstName: z.string().nonempty(),
  lastName: z.string().nonempty(),
  email: z.email().nonempty(),
  role: z.enum(['VIEWER', 'BUILDER', 'PUBLISHER', 'ADMIN', 'ANALYST']),
  organizationId: z.uuid().nonempty(),
});
export type CreateUserPayload = z.infer<typeof createUserPayloadSchema>;

export const deleteUserPayloadSchema = z.object({
  userId: z.uuid(),
});
export type DeleteUserPayload = z.infer<typeof deleteUserPayloadSchema>;

export const updateUserPayloadSchema = z.object({
  userId: z.uuid(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.email().min(5),
  role: z.enum(['VIEWER', 'BUILDER', 'PUBLISHER', 'ADMIN', 'ANALYST']),
  organizationId: z.uuid(),
});
export type UpdateUserPayload = z.infer<typeof updateUserPayloadSchema>;

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
