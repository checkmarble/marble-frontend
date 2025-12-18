import { c as createSsrRpc } from "./createSsrRpc-ZXUHv2Er.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { o as updateScreeningProvidersPayloadSchema, l as updateAllowedNetworksPayloadSchema, j as editInboxUserAutoAssignPayloadSchema, a as auditEventsFiltersSchema, b as auditEventsPaginationSchema, e as exportedFieldSchema, A as updateWebhookPayloadSchema, x as createWebhookSecretPayloadSchema, y as deleteWebhookPayloadSchema, w as createWebhookPayloadSchema, v as updateUserPayloadSchema, t as deleteUserPayloadSchema, s as createUserPayloadSchema, r as updateTagPayloadSchema, q as deleteTagPayloadSchema, p as createTagPayloadSchema, n as updateOrganizationScenariosPayloadSchema, d as deleteApiKeyPayloadSchema, c as createApiKeyPayloadSchema, z as revokeWebhookSecretPayloadSchema, m as updateOrganizationPayloadSchema, f as createInboxPayloadSchema, k as updateInboxUserPayloadSchema, i as deleteInboxUserPayloadSchema, u as updateInboxPayloadSchema, h as createInboxUserPayloadSchema, g as deleteInboxPayloadSchema } from "./settings-CEpHMlp5.js";
import { _ as createServerFn } from "../server.js";
import { o as object, s as string } from "./short-uuid-MIi3jWzx.js";
const createApiKeyFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(createApiKeyPayloadSchema).handler(createSsrRpc("ce8b59e9e76d8d79210beea37677a4cf76ee21a86983127fc1e9d1134439f0d4"));
const deleteApiKeyFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(deleteApiKeyPayloadSchema).handler(createSsrRpc("5dd474035928800999c58e4504cb964c22ef188e309212a2b40ba741538ecc26"));
const getAuditEventsFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(auditEventsFiltersSchema.and(auditEventsPaginationSchema)).handler(createSsrRpc("1505871dc4e9095cf40f4174cb7188a3852778502c1123ef512a33e2360965cc"));
const deleteExportedFieldFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(exportedFieldSchema.and(object({
  tableId: string()
}))).handler(createSsrRpc("7469c7495fddd76f74b10442ddbeb940542862745f6115e6120f8287d6ff38af"));
const updateExportedFieldFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(exportedFieldSchema.and(object({
  tableId: string()
}))).handler(createSsrRpc("1dcbe38ba17cbdc652d07f24bfdf63d4316f44cbee9115075ce645fae47afba7"));
const createInboxFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(createInboxPayloadSchema).handler(createSsrRpc("fe490a7a34f055a03e5f4d8ff13bd595a012710105cfa1bb59b94ed877c3f928"));
const deleteInboxFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(deleteInboxPayloadSchema).handler(createSsrRpc("c0e2fb3099dd84649846cdeece17869d8799a9382d071057a6c5ea28032c73db"));
const updateInboxFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(updateInboxPayloadSchema).handler(createSsrRpc("38de87303a1eb1d76f20d407eabc0ac91aa62149465ebd28fd79ef32c79dd75f"));
const createInboxUserFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(createInboxUserPayloadSchema).handler(createSsrRpc("b8d513e2878c20b977336765e71a6b1c5899e1fc4763f2c90904d86758c8f61c"));
const deleteInboxUserFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(deleteInboxUserPayloadSchema).handler(createSsrRpc("366c9a4bfa6aa53b26e2907117b15ec8d4902ce64e2d612d436164f785e5bcc1"));
const editInboxUserAutoAssignFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(editInboxUserAutoAssignPayloadSchema).handler(createSsrRpc("eb62479776353becd07e0f2973114c3fdc87de23a85412642275da1738bcf29d"));
const updateInboxUserFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(updateInboxUserPayloadSchema).handler(createSsrRpc("b8bf408bf246f94058d958629a9de1020bec6836c75312d385d2d3d5c333547f"));
const updateAllowedNetworksFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(updateAllowedNetworksPayloadSchema.and(object({
  organizationId: string()
}))).handler(createSsrRpc("6dccf7228e9488e60f1e3ca3743c4d1d1c8eadb00bac9fa1b29371c74626582d"));
const updateOrganizationFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(updateOrganizationPayloadSchema).handler(createSsrRpc("c9ddf304d678d86a712b97f7f51ac400b01e60a2a8ddd3bac685823a21b09302"));
const updateOrganizationScenariosFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(updateOrganizationScenariosPayloadSchema).handler(createSsrRpc("a6c609d23543fed660adf412fbec853d2014c725efa26eaa1dd6838956a04008"));
const updateScreeningProvidersFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(updateScreeningProvidersPayloadSchema).handler(createSsrRpc("027d0eec9ec7e47d62a3e8563fbaf8fd1dc56f10861ce1dd62ef047c7a0f7068"));
const getUnavailabilityFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).handler(createSsrRpc("6a1b75fb03d270db32566404572dd5ae749f05a9f3ffdfebbe1268ede86a7183"));
const setUnavailabilityFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(object({
  until: string().nullable()
})).handler(createSsrRpc("86f31f3978dc70721338902c9d7bb7f8b311426cf9a8af6ec9c5907fe8ecc0dc"));
const cancelUnavailabilityFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).handler(createSsrRpc("6de3fef2843a06dda38d7559060c1f19b6dc1034167adacf40f0d4aafe45b8bd"));
const createTagFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(createTagPayloadSchema).handler(createSsrRpc("cab926b64aeafcc571e19bf37ae1d359eb7532011c78212f36ce87752a271bad"));
const deleteTagFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(deleteTagPayloadSchema).handler(createSsrRpc("e00f42a207141939bebd3399a0b318603c5778485365367b408e5fb0ff5ee8e1"));
const updateTagFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(updateTagPayloadSchema).handler(createSsrRpc("1305a5ca68c1d5462d13d2186923325ca462bc612b1e00a809396a84c95c4792"));
const createUserFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(createUserPayloadSchema).handler(createSsrRpc("bd8ef66fdb4a2cddad36ed325a96ca450c0fd0700c664c236830da642b73ab90"));
const deleteUserFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(deleteUserPayloadSchema).handler(createSsrRpc("3b062b345e1921e242ba2936359a49fe8a6f626cae2d091ac7192ce79e433da2"));
const updateUserFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(updateUserPayloadSchema).handler(createSsrRpc("f7fed4045f4d4840fd59c892fa21c1b39ccc6d120180acb824ca9162592c0264"));
const createWebhookFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(createWebhookPayloadSchema).handler(createSsrRpc("1a51b59e8f2284e84626a4f476423108c7369e3787808728279571cd10aad5b8"));
const createWebhookSecretFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(createWebhookSecretPayloadSchema).handler(createSsrRpc("ab2e176c49b659576c1b5874c54554746f80896a3854e2b4a34d9499cd6992fe"));
const deleteWebhookFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(deleteWebhookPayloadSchema).handler(createSsrRpc("00366bec50a64b6bd141516f681a2436de0d2a2120a775d12e3d98ca20eac340"));
const revokeWebhookSecretFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(revokeWebhookSecretPayloadSchema).handler(createSsrRpc("96de64f7fcf44a36c65a6c67c83dda0eb4c0ef81b9a23ffd6bfbfc0606607f59"));
const updateWebhookFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(updateWebhookPayloadSchema).handler(createSsrRpc("6ed0323ce7d6c65faeff90a4e9e625ad86d4bf93f776f82315856a0a4824ebd4"));
export {
  updateInboxUserFn as A,
  editInboxUserAutoAssignFn as B,
  updateExportedFieldFn as C,
  deleteExportedFieldFn as D,
  createWebhookFn as a,
  createUserFn as b,
  cancelUnavailabilityFn as c,
  deleteUserFn as d,
  createTagFn as e,
  deleteTagFn as f,
  getUnavailabilityFn as g,
  updateTagFn as h,
  updateScreeningProvidersFn as i,
  updateOrganizationScenariosFn as j,
  updateAllowedNetworksFn as k,
  getAuditEventsFn as l,
  createApiKeyFn as m,
  deleteApiKeyFn as n,
  createInboxFn as o,
  updateOrganizationFn as p,
  createWebhookSecretFn as q,
  deleteWebhookFn as r,
  setUnavailabilityFn as s,
  revokeWebhookSecretFn as t,
  updateUserFn as u,
  updateWebhookFn as v,
  createInboxUserFn as w,
  deleteInboxFn as x,
  deleteInboxUserFn as y,
  updateInboxFn as z
};
