import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { J as isReadWebhookAvailable, K as isDeleteWebhookAvailable, L as isEditWebhookAvailable } from "./feature-access-B8PIS8ad.js";
import { _ as createServerFn, x as redirect } from "../server.js";
import { i as invariant } from "./short-uuid-MIi3jWzx.js";
import "./services-middleware-DR8Hua1Y.js";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const webhookDetailLoader_createServerFn_handler = createServerRpc({
  id: "536c5d483d909feb789f3e636c7a91e9cadfdd2c714c28b79a89a7bb02ac6d13",
  name: "webhookDetailLoader",
  filename: "src/routes/_app/_builder/settings/webhooks_.$webhookId.tsx"
}, (opts) => webhookDetailLoader.__executeServer(opts));
const webhookDetailLoader = createServerFn().middleware([authMiddleware]).validator((input) => input).handler(webhookDetailLoader_createServerFn_handler, async function webhookDetailLoader2({
  context,
  data
}) {
  const {
    webhookRepository,
    user,
    entitlements
  } = context.authInfo;
  if (!isReadWebhookAvailable(user)) throw redirect({
    to: "/"
  });
  const webhookId = data?.params?.["webhookId"];
  invariant(webhookId);
  const webhook = await webhookRepository.getWebhook({
    webhookId
  });
  return {
    webhook,
    isEditWebhookAvailable: isEditWebhookAvailable(user),
    isDeleteWebhookAvailable: isDeleteWebhookAvailable(user),
    webhookStatus: entitlements.webhooks
  };
});
export {
  webhookDetailLoader_createServerFn_handler
};
