import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { J as isReadWebhookAvailable, K as isDeleteWebhookAvailable, L as isEditWebhookAvailable, W as isCreateWebhookAvailable } from "./feature-access-B8PIS8ad.js";
import { _ as createServerFn, x as redirect } from "../server.js";
import "./services-middleware-DR8Hua1Y.js";
import "./short-uuid-MIi3jWzx.js";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const webhooksLoader_createServerFn_handler = createServerRpc({
  id: "dc01a82806619825cf27ba790d89ffc7a69cc8ea1332600ea74ae86881644b5a",
  name: "webhooksLoader",
  filename: "src/routes/_app/_builder/settings/webhooks.tsx"
}, (opts) => webhooksLoader.__executeServer(opts));
const webhooksLoader = createServerFn().middleware([authMiddleware]).handler(webhooksLoader_createServerFn_handler, async function webhooksLoader2({
  context
}) {
  const {
    webhookRepository,
    user,
    entitlements
  } = context.authInfo;
  if (!isReadWebhookAvailable(user)) throw redirect({
    to: "/"
  });
  const webhooks = await webhookRepository.listWebhooks();
  return {
    webhooks,
    isCreateWebhookAvailable: isCreateWebhookAvailable(user),
    isEditWebhookAvailable: isEditWebhookAvailable(user),
    isDeleteWebhookAvailable: isDeleteWebhookAvailable(user),
    webhooksStatus: entitlements.webhooks
  };
});
export {
  webhooksLoader_createServerFn_handler
};
