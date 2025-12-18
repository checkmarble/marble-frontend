import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { n as number, B as isAdmin } from "./services-middleware-DR8Hua1Y.js";
import { _ as createServerFn, x as redirect } from "../server.js";
import { o as object, s as string } from "./short-uuid-MIi3jWzx.js";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const DEFAULT_LIMIT = 25;
const pageQueryStringSchema = object({
  q: string().optional().default(""),
  limit: number().optional().default(DEFAULT_LIMIT)
});
const activityFollowUpLoaderSchema = object({
  query: pageQueryStringSchema
});
const activityFollowUpLoader_createServerFn_handler = createServerRpc({
  id: "3b96000682e0b8b7a52a852b0752ff57a7956f274a561ca3c1cc9ac7a2b0fd9d",
  name: "activityFollowUpLoader",
  filename: "src/routes/_app/_builder/settings/audit-logs.tsx"
}, (opts) => activityFollowUpLoader.__executeServer(opts));
const activityFollowUpLoader = createServerFn().middleware([authMiddleware]).validator(activityFollowUpLoaderSchema).handler(activityFollowUpLoader_createServerFn_handler, async function activityFollowUpLoader2({
  context,
  data: {
    query
  }
}) {
  const {
    user,
    apiKey
  } = context.authInfo;
  if (!isAdmin(user)) {
    throw redirect({
      to: "/"
    });
  }
  const apiKeys = await apiKey.listApiKeys();
  return {
    query: query.q,
    limit: query.limit,
    apiKeys
  };
});
export {
  activityFollowUpLoader_createServerFn_handler
};
