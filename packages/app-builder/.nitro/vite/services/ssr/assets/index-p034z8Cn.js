import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { g as getServerEnv } from "./services-middleware-DR8Hua1Y.js";
import { _ as createServerFn } from "../server.js";
import "./short-uuid-MIi3jWzx.js";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const beforeLoadFn_createServerFn_handler = createServerRpc({
  id: "586b6019eca85f8d98213e77d77ee3dd88859a41bd945819a7164bfdc8e96537",
  name: "beforeLoadFn",
  filename: "src/routes/_app/_builder/cases/_detail/s.$caseId/_new/index.tsx"
}, (opts) => beforeLoadFn.__executeServer(opts));
const beforeLoadFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).handler(beforeLoadFn_createServerFn_handler, ({
  context
}) => {
  const caseManagerV2Enabled = getServerEnv("CASE_MANAGER_V2_ENABLED") ?? "";
  return {
    hasAccessToNewVersion: caseManagerV2Enabled === "all" || caseManagerV2Enabled.split(",").includes(context.authInfo.user.organizationId)
  };
});
export {
  beforeLoadFn_createServerFn_handler
};
