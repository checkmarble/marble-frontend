import { n as number, J as protectArray, aJ as uniqueBy, aK as eventTypes, aL as apiKeyRoleOptions } from "./services-middleware-DR8Hua1Y.js";
import { o as object, j as uuid, s as string, ft as int, k as array, _ as _enum, gl as url, ff as email, gk as union, p as boolean, fO as _null, l as discriminatedUnion, m as literal, f4 as cidrv4, f5 as cidrv6, fx as ipv4, fy as ipv6 } from "./short-uuid-MIi3jWzx.js";
const tagColors = ["#C8C3FF", "#FDE9AD", "#FFA89A", "#B7DFF5", "#B2E5BA"];
const createApiKeyPayloadSchema = object({
  description: string().min(1),
  role: _enum(apiKeyRoleOptions)
});
const deleteApiKeyPayloadSchema = object({
  apiKeyId: uuid()
});
const createInboxRedirectRouteOptions = ["/cases/inboxes/$inboxId", "/settings/inboxes/$inboxId"];
const createInboxPayloadSchema = object({
  name: string().min(1),
  redirectRoute: _enum(createInboxRedirectRouteOptions).optional()
});
const deleteInboxPayloadSchema = object({
  inboxId: uuid()
});
const updateInboxPayloadSchema = object({
  id: uuid(),
  name: string().min(1),
  escalationInboxId: union([uuid(), _null()]),
  autoAssignEnabled: boolean(),
  redirectRoute: _enum(createInboxRedirectRouteOptions)
});
const createInboxUserPayloadSchema = object({
  userId: uuid().nonempty(),
  inboxId: uuid().nonempty(),
  role: _enum(["admin", "member"]),
  autoAssignable: boolean()
});
const deleteInboxUserPayloadSchema = object({
  inboxId: uuid(),
  inboxUserId: uuid()
});
const editInboxUserAutoAssignPayloadSchema = object({
  id: string(),
  autoAssignable: boolean()
});
const updateInboxUserPayloadSchema = object({
  id: uuid(),
  inboxId: uuid(),
  role: _enum(["admin", "member"]),
  autoAssignable: boolean()
});
const cidrSchema = union([cidrv4(), cidrv6(), ipv4(), ipv6()]);
const updateAllowedNetworksPayloadSchema = object({
  allowedNetworks: protectArray(
    uniqueBy(array(cidrSchema), (s) => s),
    { maxLength: 100 }
  )
});
const updateOrganizationPayloadSchema = object({
  organizationId: string().min(1),
  autoAssignQueueLimit: number().min(0).optional()
});
const screeningProviderSchema = _enum(["opensanctions", "lexisnexis"]);
const updateScreeningProvidersPayloadSchema = object({
  organizationId: uuid(),
  manualSearch: screeningProviderSchema,
  transactionMonitoring: screeningProviderSchema,
  continuousMonitoring: screeningProviderSchema
});
const updateOrganizationScenariosPayloadSchema = object({
  organizationId: string().min(1),
  defaultScenarioTimezone: string(),
  sanctionThreshold: number().min(0).max(100).optional(),
  sanctionLimit: number().min(0).optional()
});
const createTagPayloadSchema = object({
  name: string().min(1),
  color: _enum(tagColors),
  target: _enum(["case", "object"])
});
const deleteTagPayloadSchema = object({
  tagId: uuid()
});
const updateTagPayloadSchema = object({
  id: uuid(),
  name: string().min(1),
  color: _enum(tagColors)
});
const createUserPayloadSchema = object({
  firstName: string().nonempty(),
  lastName: string().nonempty(),
  email: email().nonempty(),
  role: _enum(["VIEWER", "BUILDER", "PUBLISHER", "ADMIN", "ANALYST"]),
  organizationId: uuid().nonempty()
});
const deleteUserPayloadSchema = object({
  userId: uuid()
});
const updateUserPayloadSchema = object({
  userId: uuid(),
  firstName: string().min(1),
  lastName: string().min(1),
  email: email().min(5),
  role: _enum(["VIEWER", "BUILDER", "PUBLISHER", "ADMIN", "ANALYST"]),
  organizationId: uuid()
});
const createWebhookPayloadSchema = object({
  url: url(),
  eventTypes: protectArray(array(_enum(eventTypes))),
  httpTimeout: int().positive().optional()
});
const createWebhookSecretPayloadSchema = object({
  webhookId: string(),
  expireExistingInDays: int().positive().optional()
});
const deleteWebhookPayloadSchema = object({
  webhookId: string()
});
const revokeWebhookSecretPayloadSchema = object({
  webhookId: string(),
  secretId: string()
});
const updateWebhookPayloadSchema = object({
  id: string().nonempty(),
  eventTypes: protectArray(array(_enum(eventTypes))),
  httpTimeout: int().positive().optional()
});
const ingestedDataFieldSchema = object({
  path: protectArray(array(string())),
  name: string()
});
const exportedFieldSchema = union([
  object({ triggerObjectField: string() }),
  object({ ingestedDataField: ingestedDataFieldSchema })
]);
const auditEventsDateRangeSchema = discriminatedUnion("type", [
  object({ type: literal("dynamic"), fromNow: string() }),
  object({ type: literal("static"), startDate: string(), endDate: string() })
]);
const auditEventsFiltersSchema = object({
  dateRange: auditEventsDateRangeSchema.optional(),
  userId: string().optional(),
  apiKeyId: string().optional(),
  table: string().optional(),
  entityId: string().optional()
});
const auditEventsPaginationSchema = object({
  limit: number().optional().default(25),
  after: string().optional()
});
auditEventsFiltersSchema.and(auditEventsPaginationSchema);
export {
  updateWebhookPayloadSchema as A,
  tagColors as B,
  auditEventsFiltersSchema as a,
  auditEventsPaginationSchema as b,
  createApiKeyPayloadSchema as c,
  deleteApiKeyPayloadSchema as d,
  exportedFieldSchema as e,
  createInboxPayloadSchema as f,
  deleteInboxPayloadSchema as g,
  createInboxUserPayloadSchema as h,
  deleteInboxUserPayloadSchema as i,
  editInboxUserAutoAssignPayloadSchema as j,
  updateInboxUserPayloadSchema as k,
  updateAllowedNetworksPayloadSchema as l,
  updateOrganizationPayloadSchema as m,
  updateOrganizationScenariosPayloadSchema as n,
  updateScreeningProvidersPayloadSchema as o,
  createTagPayloadSchema as p,
  deleteTagPayloadSchema as q,
  updateTagPayloadSchema as r,
  createUserPayloadSchema as s,
  deleteUserPayloadSchema as t,
  updateInboxPayloadSchema as u,
  updateUserPayloadSchema as v,
  createWebhookPayloadSchema as w,
  createWebhookSecretPayloadSchema as x,
  deleteWebhookPayloadSchema as y,
  revokeWebhookSecretPayloadSchema as z
};
