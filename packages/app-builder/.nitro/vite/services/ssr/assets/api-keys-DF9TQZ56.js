import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { y as useAuthSession } from "./services-middleware-DR8Hua1Y.js";
import { o as isReadApiKeyAvailable, J as isReadWebhookAvailable, W as isCreateWebhookAvailable, X as isDeleteApiKeyAvailable, Y as isCreateApiKeyAvailable } from "./feature-access-B8PIS8ad.js";
import { _ as createServerFn, x as redirect } from "../server.js";
import "./short-uuid-MIi3jWzx.js";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const apiKeysLoader_createServerFn_handler = createServerRpc({
  id: "9a9ceeadd477b9b71ffa23dfcfc00027094ddb47f7d18acd749a9f69fcc0b4b2",
  name: "apiKeysLoader",
  filename: "src/routes/_app/_builder/settings/api-keys.tsx"
}, (opts) => apiKeysLoader.__executeServer(opts));
const apiKeysLoader = createServerFn().middleware([authMiddleware]).handler(apiKeysLoader_createServerFn_handler, async function apiKeysLoader2({
  context
}) {
  const {
    apiKey,
    webhookRepository,
    dataModelRepository,
    user,
    entitlements
  } = context.authInfo;
  if (!isReadApiKeyAvailable(user)) throw redirect({
    to: "/"
  });
  const [apiKeys, openapiV1] = await Promise.all([apiKey.listApiKeys(), dataModelRepository.getOpenApiSpecOfVersion("v1")]);
  const authSession = await useAuthSession();
  const createdApiKey = authSession.data.createdApiKey;
  if (createdApiKey) {
    await authSession.update({
      createdApiKey: void 0
    });
  }
  const canReadWebhooks = isReadWebhookAvailable(user);
  let webhooks = [];
  let webhooksError = false;
  if (canReadWebhooks) {
    try {
      webhooks = await webhookRepository.listWebhooks();
    } catch {
      webhooksError = true;
    }
  }
  return {
    apiKeys,
    openapiV1,
    createdApiKey,
    isCreateApiKeyAvailable: isCreateApiKeyAvailable(user),
    isDeleteApiKeyAvailable: isDeleteApiKeyAvailable(user),
    webhooks,
    canReadWebhooks,
    webhooksError,
    isCreateWebhookAvailable: canReadWebhooks && !webhooksError && isCreateWebhookAvailable(user),
    webhooksStatus: entitlements.webhooks
  };
});
export {
  apiKeysLoader_createServerFn_handler
};
