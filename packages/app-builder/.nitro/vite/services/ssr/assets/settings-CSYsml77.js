import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { y as useAuthSession, B as isAdmin, T as Temporal, C as pick, E as isHttpError, U as UNPROCESSABLE_ENTITY, F as FORBIDDEN, G as isMarbleError, H as isNotFoundHttpError, I as isStatusConflictHttpError } from "./services-middleware-DR8Hua1Y.js";
import { c as createApiKeyPayloadSchema, d as deleteApiKeyPayloadSchema, a as auditEventsFiltersSchema, b as auditEventsPaginationSchema, e as exportedFieldSchema, f as createInboxPayloadSchema, g as deleteInboxPayloadSchema, u as updateInboxPayloadSchema, h as createInboxUserPayloadSchema, i as deleteInboxUserPayloadSchema, j as editInboxUserAutoAssignPayloadSchema, k as updateInboxUserPayloadSchema, l as updateAllowedNetworksPayloadSchema, m as updateOrganizationPayloadSchema, n as updateOrganizationScenariosPayloadSchema, o as updateScreeningProvidersPayloadSchema, p as createTagPayloadSchema, q as deleteTagPayloadSchema, r as updateTagPayloadSchema, s as createUserPayloadSchema, t as deleteUserPayloadSchema, v as updateUserPayloadSchema, w as createWebhookPayloadSchema, x as createWebhookSecretPayloadSchema, y as deleteWebhookPayloadSchema, z as revokeWebhookSecretPayloadSchema, A as updateWebhookPayloadSchema } from "./settings-CEpHMlp5.js";
import { o as object, s as string, b as fromUUIDtoSUUID } from "./short-uuid-MIi3jWzx.js";
import { _ as createServerFn, x as redirect } from "../server.js";
import { t } from "./isDeepEqual-C0XXZLYo.js";
import { n } from "./omit-ZO4dmkWK.js";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const createApiKeyFn_createServerFn_handler = createServerRpc({
  id: "ce8b59e9e76d8d79210beea37677a4cf76ee21a86983127fc1e9d1134439f0d4",
  name: "createApiKeyFn",
  filename: "src/server-fns/settings.ts"
}, (opts) => createApiKeyFn.__executeServer(opts));
const createApiKeyFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(createApiKeyPayloadSchema).handler(createApiKeyFn_createServerFn_handler, async ({
  context,
  data
}) => {
  try {
    const authSession = await useAuthSession();
    await authSession.update({
      createdApiKey: await context.authInfo.apiKey.createApiKey(data)
    });
    throw redirect({
      to: "/settings/api-keys"
    });
  } catch (error) {
    if (error instanceof Response || error._isRedirect) throw error;
    throw new Error("Failed to create API key");
  }
});
const deleteApiKeyFn_createServerFn_handler = createServerRpc({
  id: "5dd474035928800999c58e4504cb964c22ef188e309212a2b40ba741538ecc26",
  name: "deleteApiKeyFn",
  filename: "src/server-fns/settings.ts"
}, (opts) => deleteApiKeyFn.__executeServer(opts));
const deleteApiKeyFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(deleteApiKeyPayloadSchema).handler(deleteApiKeyFn_createServerFn_handler, async ({
  context,
  data
}) => {
  try {
    await context.authInfo.apiKey.deleteApiKey(data);
    throw redirect({
      to: "/settings/api-keys"
    });
  } catch (error) {
    if (error instanceof Response || error._isRedirect) throw error;
    throw new Error("Failed to delete API key");
  }
});
const getAuditEventsFn_createServerFn_handler = createServerRpc({
  id: "1505871dc4e9095cf40f4174cb7188a3852778502c1123ef512a33e2360965cc",
  name: "getAuditEventsFn",
  filename: "src/server-fns/settings.ts"
}, (opts) => getAuditEventsFn.__executeServer(opts));
const getAuditEventsFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(auditEventsFiltersSchema.and(auditEventsPaginationSchema)).handler(getAuditEventsFn_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    user,
    auditEvents
  } = context.authInfo;
  if (!isAdmin(user)) {
    throw redirect({
      to: "/"
    });
  }
  let from;
  let to;
  if (data.dateRange) {
    if (data.dateRange.type === "dynamic") {
      const now = Temporal.Now.zonedDateTimeISO();
      from = now.add(data.dateRange.fromNow).toInstant().toString();
      to = now.toInstant().toString();
    } else {
      from = data.dateRange.startDate;
      to = data.dateRange.endDate;
    }
  }
  return auditEvents.listAuditEvents({
    from,
    to,
    userId: data.userId,
    apiKeyId: data.apiKeyId,
    table: data.table,
    entityId: data.entityId,
    limit: data.limit,
    after: data.after
  });
});
const deleteExportedFieldFn_createServerFn_handler = createServerRpc({
  id: "7469c7495fddd76f74b10442ddbeb940542862745f6115e6120f8287d6ff38af",
  name: "deleteExportedFieldFn",
  filename: "src/server-fns/settings.ts"
}, (opts) => deleteExportedFieldFn.__executeServer(opts));
const deleteExportedFieldFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(exportedFieldSchema.and(object({
  tableId: string()
}))).handler(deleteExportedFieldFn_createServerFn_handler, async ({
  context,
  data
}) => {
  try {
    const {
      tableId,
      ...field
    } = data;
    const current = await context.authInfo.dataModelRepository.getDataModelTableExportedFields(tableId);
    if ("triggerObjectField" in field) {
      if (!current.triggerObjectFields.includes(field.triggerObjectField)) {
        throw new Error("Field not exported");
      }
      return context.authInfo.dataModelRepository.updateDataModelTableExportedFields(tableId, {
        triggerObjectFields: current.triggerObjectFields.filter((f) => f !== field.triggerObjectField),
        ingestedDataFields: current.ingestedDataFields
      });
    }
    if ("ingestedDataField" in field) {
      if (!current.ingestedDataFields.some((f) => t(f, field.ingestedDataField))) {
        throw new Error("Field not exported");
      }
      return context.authInfo.dataModelRepository.updateDataModelTableExportedFields(tableId, {
        triggerObjectFields: current.triggerObjectFields,
        ingestedDataFields: current.ingestedDataFields.filter((f) => !t(f, field.ingestedDataField))
      });
    }
    throw new Error("Invalid payload");
  } catch {
    throw new Error("Failed to delete exported field");
  }
});
const updateExportedFieldFn_createServerFn_handler = createServerRpc({
  id: "1dcbe38ba17cbdc652d07f24bfdf63d4316f44cbee9115075ce645fae47afba7",
  name: "updateExportedFieldFn",
  filename: "src/server-fns/settings.ts"
}, (opts) => updateExportedFieldFn.__executeServer(opts));
const updateExportedFieldFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(exportedFieldSchema.and(object({
  tableId: string()
}))).handler(updateExportedFieldFn_createServerFn_handler, async ({
  context,
  data
}) => {
  try {
    const {
      tableId,
      ...field
    } = data;
    const current = await context.authInfo.dataModelRepository.getDataModelTableExportedFields(tableId);
    if ("triggerObjectField" in field) {
      if (current.triggerObjectFields.includes(field.triggerObjectField)) {
        throw new Error("Field already exported");
      }
      return context.authInfo.dataModelRepository.updateDataModelTableExportedFields(tableId, {
        triggerObjectFields: [...current.triggerObjectFields, field.triggerObjectField],
        ingestedDataFields: current.ingestedDataFields
      });
    }
    if ("ingestedDataField" in field) {
      const exists = (current.ingestedDataFields ?? []).some((f) => f.name === field.ingestedDataField.name && (f.path ?? []).join(".") === field.ingestedDataField.path.join("."));
      if (exists) {
        throw new Error("Field already exported");
      }
      return context.authInfo.dataModelRepository.updateDataModelTableExportedFields(tableId, {
        triggerObjectFields: current.triggerObjectFields,
        ingestedDataFields: [...current.ingestedDataFields ?? [], field.ingestedDataField]
      });
    }
    throw new Error("Invalid payload");
  } catch {
    throw new Error("Failed to update exported field");
  }
});
const createInboxFn_createServerFn_handler = createServerRpc({
  id: "fe490a7a34f055a03e5f4d8ff13bd595a012710105cfa1bb59b94ed877c3f928",
  name: "createInboxFn",
  filename: "src/server-fns/settings.ts"
}, (opts) => createInboxFn.__executeServer(opts));
const createInboxFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(createInboxPayloadSchema).handler(createInboxFn_createServerFn_handler, async ({
  context,
  data
}) => {
  try {
    const createdInbox = await context.authInfo.inbox.createInbox(data);
    if (data.redirectRoute) {
      throw redirect({
        to: data.redirectRoute,
        params: {
          inboxId: fromUUIDtoSUUID(createdInbox.id)
        }
      });
    }
    return {
      inboxId: createdInbox.id
    };
  } catch (error) {
    if (error instanceof Response || error._isRedirect) throw error;
    throw new Error("Failed to create inbox");
  }
});
const deleteInboxFn_createServerFn_handler = createServerRpc({
  id: "c0e2fb3099dd84649846cdeece17869d8799a9382d071057a6c5ea28032c73db",
  name: "deleteInboxFn",
  filename: "src/server-fns/settings.ts"
}, (opts) => deleteInboxFn.__executeServer(opts));
const deleteInboxFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(deleteInboxPayloadSchema).handler(deleteInboxFn_createServerFn_handler, async ({
  context,
  data
}) => {
  try {
    await context.authInfo.inbox.deleteInbox(data.inboxId);
    throw redirect({
      to: "/settings/inboxes"
    });
  } catch (error) {
    if (error instanceof Response || error._isRedirect) throw error;
    throw new Error("Failed to delete inbox");
  }
});
const updateInboxFn_createServerFn_handler = createServerRpc({
  id: "38de87303a1eb1d76f20d407eabc0ac91aa62149465ebd28fd79ef32c79dd75f",
  name: "updateInboxFn",
  filename: "src/server-fns/settings.ts"
}, (opts) => updateInboxFn.__executeServer(opts));
const updateInboxFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(updateInboxPayloadSchema).handler(updateInboxFn_createServerFn_handler, async ({
  context,
  data
}) => {
  try {
    const updatedInbox = await context.authInfo.inbox.updateInbox(data.id, pick(data, ["name", "escalationInboxId", "autoAssignEnabled"]));
    throw redirect({
      to: data.redirectRoute,
      params: {
        inboxId: fromUUIDtoSUUID(updatedInbox.id)
      }
    });
  } catch (error) {
    if (error instanceof Response || error._isRedirect) throw error;
    throw new Error("Failed to update inbox");
  }
});
const createInboxUserFn_createServerFn_handler = createServerRpc({
  id: "b8d513e2878c20b977336765e71a6b1c5899e1fc4763f2c90904d86758c8f61c",
  name: "createInboxUserFn",
  filename: "src/server-fns/settings.ts"
}, (opts) => createInboxUserFn.__executeServer(opts));
const createInboxUserFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(createInboxUserPayloadSchema).handler(createInboxUserFn_createServerFn_handler, async ({
  context,
  data
}) => {
  try {
    await context.authInfo.inbox.createInboxUser(data.inboxId, n(data, ["inboxId"]));
    throw redirect({
      to: "/settings/inboxes/$inboxId",
      params: {
        inboxId: fromUUIDtoSUUID(data.inboxId)
      }
    });
  } catch (error) {
    if (error instanceof Response || error._isRedirect) throw error;
    throw new Error("Failed to create inbox user");
  }
});
const deleteInboxUserFn_createServerFn_handler = createServerRpc({
  id: "366c9a4bfa6aa53b26e2907117b15ec8d4902ce64e2d612d436164f785e5bcc1",
  name: "deleteInboxUserFn",
  filename: "src/server-fns/settings.ts"
}, (opts) => deleteInboxUserFn.__executeServer(opts));
const deleteInboxUserFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(deleteInboxUserPayloadSchema).handler(deleteInboxUserFn_createServerFn_handler, async ({
  context,
  data
}) => {
  try {
    await context.authInfo.inbox.deleteInboxUser(data.inboxUserId);
    throw redirect({
      to: "/settings/inboxes/$inboxId",
      params: {
        inboxId: fromUUIDtoSUUID(data.inboxId)
      }
    });
  } catch (error) {
    if (error instanceof Response || error._isRedirect) throw error;
    throw new Error("Failed to delete inbox user");
  }
});
const editInboxUserAutoAssignFn_createServerFn_handler = createServerRpc({
  id: "eb62479776353becd07e0f2973114c3fdc87de23a85412642275da1738bcf29d",
  name: "editInboxUserAutoAssignFn",
  filename: "src/server-fns/settings.ts"
}, (opts) => editInboxUserAutoAssignFn.__executeServer(opts));
const editInboxUserAutoAssignFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(editInboxUserAutoAssignPayloadSchema).handler(editInboxUserAutoAssignFn_createServerFn_handler, async ({
  context,
  data
}) => {
  await context.authInfo.inbox.updateInboxUser(data.id, {
    autoAssignable: data.autoAssignable
  });
});
const updateInboxUserFn_createServerFn_handler = createServerRpc({
  id: "b8bf408bf246f94058d958629a9de1020bec6836c75312d385d2d3d5c333547f",
  name: "updateInboxUserFn",
  filename: "src/server-fns/settings.ts"
}, (opts) => updateInboxUserFn.__executeServer(opts));
const updateInboxUserFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(updateInboxUserPayloadSchema).handler(updateInboxUserFn_createServerFn_handler, async ({
  context,
  data
}) => {
  try {
    await context.authInfo.inbox.updateInboxUser(data.id, pick(data, ["role", "autoAssignable"]));
    throw redirect({
      to: "/settings/inboxes/$inboxId",
      params: {
        inboxId: fromUUIDtoSUUID(data.inboxId)
      }
    });
  } catch (error) {
    if (error instanceof Response || error._isRedirect) throw error;
    throw new Error("Failed to update inbox user");
  }
});
const updateAllowedNetworksFn_createServerFn_handler = createServerRpc({
  id: "6dccf7228e9488e60f1e3ca3743c4d1d1c8eadb00bac9fa1b29371c74626582d",
  name: "updateAllowedNetworksFn",
  filename: "src/server-fns/settings.ts"
}, (opts) => updateAllowedNetworksFn.__executeServer(opts));
const updateAllowedNetworksFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(updateAllowedNetworksPayloadSchema.and(object({
  organizationId: string()
}))).handler(updateAllowedNetworksFn_createServerFn_handler, async ({
  context,
  data
}) => {
  try {
    const subnets = await context.authInfo.organization.updateAllowedNetworks(data.organizationId, data.allowedNetworks);
    return {
      subnets
    };
  } catch (error) {
    if (isHttpError(error) && error.status === UNPROCESSABLE_ENTITY) {
      return {
        error: "ip_not_in_range"
      };
    }
    throw new Error("Failed to update allowed networks");
  }
});
const updateOrganizationFn_createServerFn_handler = createServerRpc({
  id: "c9ddf304d678d86a712b97f7f51ac400b01e60a2a8ddd3bac685823a21b09302",
  name: "updateOrganizationFn",
  filename: "src/server-fns/settings.ts"
}, (opts) => updateOrganizationFn.__executeServer(opts));
const updateOrganizationFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(updateOrganizationPayloadSchema).handler(updateOrganizationFn_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    organizationId,
    autoAssignQueueLimit
  } = data;
  await context.authInfo.organization.updateOrganization({
    organizationId,
    changes: {
      autoAssignQueueLimit
    }
  });
});
const updateOrganizationScenariosFn_createServerFn_handler = createServerRpc({
  id: "a6c609d23543fed660adf412fbec853d2014c725efa26eaa1dd6838956a04008",
  name: "updateOrganizationScenariosFn",
  filename: "src/server-fns/settings.ts"
}, (opts) => updateOrganizationScenariosFn.__executeServer(opts));
const updateOrganizationScenariosFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(updateOrganizationScenariosPayloadSchema).handler(updateOrganizationScenariosFn_createServerFn_handler, async ({
  context,
  data
}) => {
  await context.authInfo.organization.updateOrganization({
    organizationId: data.organizationId,
    changes: {
      defaultScenarioTimezone: data.defaultScenarioTimezone,
      sanctionThreshold: data.sanctionThreshold,
      sanctionLimit: data.sanctionLimit
    }
  });
});
const updateScreeningProvidersFn_createServerFn_handler = createServerRpc({
  id: "027d0eec9ec7e47d62a3e8563fbaf8fd1dc56f10861ce1dd62ef047c7a0f7068",
  name: "updateScreeningProvidersFn",
  filename: "src/server-fns/settings.ts"
}, (opts) => updateScreeningProvidersFn.__executeServer(opts));
const updateScreeningProvidersFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(updateScreeningProvidersPayloadSchema).handler(updateScreeningProvidersFn_createServerFn_handler, async ({
  context,
  data
}) => {
  try {
    await context.authInfo.organization.updateOrganization({
      organizationId: data.organizationId,
      changes: {
        screeningProviders: {
          manualSearch: data.manualSearch,
          transactionMonitoring: data.transactionMonitoring,
          continuousMonitoring: data.continuousMonitoring
        }
      }
    });
  } catch (error) {
    if (isHttpError(error) && (error.status === FORBIDDEN || error.status === UNPROCESSABLE_ENTITY)) {
      return {
        error: getHttpErrorMessage(error) ?? "Failed to update screening providers"
      };
    }
    throw new Error("Failed to update screening providers");
  }
});
function getHttpErrorMessage(error) {
  if (isMarbleError(error)) return error.data.message;
  if (typeof error.data === "string") return error.data;
  if (error.data && typeof error.data === "object" && "message" in error.data && typeof error.data.message === "string") {
    return error.data.message;
  }
}
const getUnavailabilityFn_createServerFn_handler = createServerRpc({
  id: "6a1b75fb03d270db32566404572dd5ae749f05a9f3ffdfebbe1268ede86a7183",
  name: "getUnavailabilityFn",
  filename: "src/server-fns/settings.ts"
}, (opts) => getUnavailabilityFn.__executeServer(opts));
const getUnavailabilityFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).handler(getUnavailabilityFn_createServerFn_handler, async ({
  context
}) => {
  try {
    return await context.authInfo.personalSettings.getUnavailability();
  } catch (error) {
    if (isNotFoundHttpError(error)) {
      return {
        until: null
      };
    }
    throw new Error("Failed to fetch unavailability");
  }
});
const setUnavailabilityFn_createServerFn_handler = createServerRpc({
  id: "86f31f3978dc70721338902c9d7bb7f8b311426cf9a8af6ec9c5907fe8ecc0dc",
  name: "setUnavailabilityFn",
  filename: "src/server-fns/settings.ts"
}, (opts) => setUnavailabilityFn.__executeServer(opts));
const setUnavailabilityFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(object({
  until: string().nullable()
})).handler(setUnavailabilityFn_createServerFn_handler, async ({
  context,
  data
}) => {
  try {
    await context.authInfo.personalSettings.setUnavailability({
      until: data.until ? new Date(data.until) : null
    });
  } catch (error) {
    if (isMarbleError(error)) {
      throw new Error(error.data?.message ?? "Failed to set unavailability");
    }
    throw new Error("Failed to set unavailability");
  }
});
const cancelUnavailabilityFn_createServerFn_handler = createServerRpc({
  id: "6de3fef2843a06dda38d7559060c1f19b6dc1034167adacf40f0d4aafe45b8bd",
  name: "cancelUnavailabilityFn",
  filename: "src/server-fns/settings.ts"
}, (opts) => cancelUnavailabilityFn.__executeServer(opts));
const cancelUnavailabilityFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).handler(cancelUnavailabilityFn_createServerFn_handler, async ({
  context
}) => {
  try {
    await context.authInfo.personalSettings.cancelUnavailability();
  } catch (error) {
    if (isMarbleError(error)) {
      throw new Error(error.data?.message ?? "Failed to cancel unavailability");
    }
    throw new Error("Failed to cancel unavailability");
  }
});
const createTagFn_createServerFn_handler = createServerRpc({
  id: "cab926b64aeafcc571e19bf37ae1d359eb7532011c78212f36ce87752a271bad",
  name: "createTagFn",
  filename: "src/server-fns/settings.ts"
}, (opts) => createTagFn.__executeServer(opts));
const createTagFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(createTagPayloadSchema).handler(createTagFn_createServerFn_handler, async ({
  context,
  data
}) => {
  await context.authInfo.apiClient.createTag(data);
});
const deleteTagFn_createServerFn_handler = createServerRpc({
  id: "e00f42a207141939bebd3399a0b318603c5778485365367b408e5fb0ff5ee8e1",
  name: "deleteTagFn",
  filename: "src/server-fns/settings.ts"
}, (opts) => deleteTagFn.__executeServer(opts));
const deleteTagFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(deleteTagPayloadSchema).handler(deleteTagFn_createServerFn_handler, async ({
  context,
  data
}) => {
  try {
    await context.authInfo.apiClient.deleteTag(data.tagId);
  } catch {
    throw new Error("Failed to delete tag");
  }
});
const updateTagFn_createServerFn_handler = createServerRpc({
  id: "1305a5ca68c1d5462d13d2186923325ca462bc612b1e00a809396a84c95c4792",
  name: "updateTagFn",
  filename: "src/server-fns/settings.ts"
}, (opts) => updateTagFn.__executeServer(opts));
const updateTagFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(updateTagPayloadSchema).handler(updateTagFn_createServerFn_handler, async ({
  context,
  data
}) => {
  await context.authInfo.apiClient.updateTag(data.id, data);
});
const createUserFn_createServerFn_handler = createServerRpc({
  id: "bd8ef66fdb4a2cddad36ed325a96ca450c0fd0700c664c236830da642b73ab90",
  name: "createUserFn",
  filename: "src/server-fns/settings.ts"
}, (opts) => createUserFn.__executeServer(opts));
const createUserFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(createUserPayloadSchema).handler(createUserFn_createServerFn_handler, async ({
  context,
  data
}) => {
  try {
    await context.authInfo.apiClient.createUser({
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      role: data.role,
      organization_id: data.organizationId
    });
  } catch (error) {
    if (isStatusConflictHttpError(error)) {
      return {
        error: "duplicate_email"
      };
    }
    throw new Error("Failed to create user");
  }
});
const deleteUserFn_createServerFn_handler = createServerRpc({
  id: "3b062b345e1921e242ba2936359a49fe8a6f626cae2d091ac7192ce79e433da2",
  name: "deleteUserFn",
  filename: "src/server-fns/settings.ts"
}, (opts) => deleteUserFn.__executeServer(opts));
const deleteUserFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(deleteUserPayloadSchema).handler(deleteUserFn_createServerFn_handler, async ({
  context,
  data
}) => {
  try {
    await context.authInfo.apiClient.deleteUser(data.userId);
  } catch {
    throw new Error("Failed to delete user");
  }
});
const updateUserFn_createServerFn_handler = createServerRpc({
  id: "f7fed4045f4d4840fd59c892fa21c1b39ccc6d120180acb824ca9162592c0264",
  name: "updateUserFn",
  filename: "src/server-fns/settings.ts"
}, (opts) => updateUserFn.__executeServer(opts));
const updateUserFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(updateUserPayloadSchema).handler(updateUserFn_createServerFn_handler, async ({
  context,
  data
}) => {
  await context.authInfo.apiClient.updateUser(data.userId, {
    first_name: data.firstName,
    last_name: data.lastName,
    email: data.email,
    role: data.role,
    organization_id: data.organizationId
  });
});
const createWebhookFn_createServerFn_handler = createServerRpc({
  id: "1a51b59e8f2284e84626a4f476423108c7369e3787808728279571cd10aad5b8",
  name: "createWebhookFn",
  filename: "src/server-fns/settings.ts"
}, (opts) => createWebhookFn.__executeServer(opts));
const createWebhookFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(createWebhookPayloadSchema).handler(createWebhookFn_createServerFn_handler, async ({
  context,
  data
}) => {
  try {
    const webhook = await context.authInfo.webhookRepository.createWebhook({
      webhookCreateBody: data
    });
    throw redirect({
      to: "/settings/webhooks/$webhookId",
      params: {
        webhookId: webhook.id
      }
    });
  } catch (error) {
    if (error instanceof Response || error._isRedirect) throw error;
    throw new Error("Failed to create webhook");
  }
});
const createWebhookSecretFn_createServerFn_handler = createServerRpc({
  id: "ab2e176c49b659576c1b5874c54554746f80896a3854e2b4a34d9499cd6992fe",
  name: "createWebhookSecretFn",
  filename: "src/server-fns/settings.ts"
}, (opts) => createWebhookSecretFn.__executeServer(opts));
const createWebhookSecretFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(createWebhookSecretPayloadSchema).handler(createWebhookSecretFn_createServerFn_handler, async ({
  context,
  data
}) => {
  await context.authInfo.webhookRepository.createWebhookSecret({
    webhookId: data.webhookId,
    createSecretBody: {
      expireExistingInDays: data.expireExistingInDays
    }
  });
});
const deleteWebhookFn_createServerFn_handler = createServerRpc({
  id: "00366bec50a64b6bd141516f681a2436de0d2a2120a775d12e3d98ca20eac340",
  name: "deleteWebhookFn",
  filename: "src/server-fns/settings.ts"
}, (opts) => deleteWebhookFn.__executeServer(opts));
const deleteWebhookFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(deleteWebhookPayloadSchema).handler(deleteWebhookFn_createServerFn_handler, async ({
  context,
  data
}) => {
  try {
    await context.authInfo.webhookRepository.deleteWebhook({
      webhookId: data.webhookId
    });
    throw redirect({
      to: "/settings/webhooks"
    });
  } catch (error) {
    if (error instanceof Response || error._isRedirect) throw error;
    throw new Error("Failed to delete webhook");
  }
});
const revokeWebhookSecretFn_createServerFn_handler = createServerRpc({
  id: "96de64f7fcf44a36c65a6c67c83dda0eb4c0ef81b9a23ffd6bfbfc0606607f59",
  name: "revokeWebhookSecretFn",
  filename: "src/server-fns/settings.ts"
}, (opts) => revokeWebhookSecretFn.__executeServer(opts));
const revokeWebhookSecretFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(revokeWebhookSecretPayloadSchema).handler(revokeWebhookSecretFn_createServerFn_handler, async ({
  context,
  data
}) => {
  await context.authInfo.webhookRepository.revokeWebhookSecret({
    webhookId: data.webhookId,
    secretId: data.secretId
  });
});
const updateWebhookFn_createServerFn_handler = createServerRpc({
  id: "6ed0323ce7d6c65faeff90a4e9e625ad86d4bf93f776f82315856a0a4824ebd4",
  name: "updateWebhookFn",
  filename: "src/server-fns/settings.ts"
}, (opts) => updateWebhookFn.__executeServer(opts));
const updateWebhookFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(updateWebhookPayloadSchema).handler(updateWebhookFn_createServerFn_handler, async ({
  context,
  data
}) => {
  await context.authInfo.webhookRepository.updateWebhook({
    webhookId: data.id,
    webhookUpdateBody: data
  });
});
export {
  cancelUnavailabilityFn_createServerFn_handler,
  createApiKeyFn_createServerFn_handler,
  createInboxFn_createServerFn_handler,
  createInboxUserFn_createServerFn_handler,
  createTagFn_createServerFn_handler,
  createUserFn_createServerFn_handler,
  createWebhookFn_createServerFn_handler,
  createWebhookSecretFn_createServerFn_handler,
  deleteApiKeyFn_createServerFn_handler,
  deleteExportedFieldFn_createServerFn_handler,
  deleteInboxFn_createServerFn_handler,
  deleteInboxUserFn_createServerFn_handler,
  deleteTagFn_createServerFn_handler,
  deleteUserFn_createServerFn_handler,
  deleteWebhookFn_createServerFn_handler,
  editInboxUserAutoAssignFn_createServerFn_handler,
  getAuditEventsFn_createServerFn_handler,
  getUnavailabilityFn_createServerFn_handler,
  revokeWebhookSecretFn_createServerFn_handler,
  setUnavailabilityFn_createServerFn_handler,
  updateAllowedNetworksFn_createServerFn_handler,
  updateExportedFieldFn_createServerFn_handler,
  updateInboxFn_createServerFn_handler,
  updateInboxUserFn_createServerFn_handler,
  updateOrganizationFn_createServerFn_handler,
  updateOrganizationScenariosFn_createServerFn_handler,
  updateScreeningProvidersFn_createServerFn_handler,
  updateTagFn_createServerFn_handler,
  updateUserFn_createServerFn_handler,
  updateWebhookFn_createServerFn_handler
};
