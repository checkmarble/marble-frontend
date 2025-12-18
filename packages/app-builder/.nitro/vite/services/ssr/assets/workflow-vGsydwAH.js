import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { Z as isWorkflowsAvailable, j as isCreateInboxAvailable } from "./feature-access-B8PIS8ad.js";
import { b as fromUUIDtoSUUID, f as fromParams } from "./short-uuid-MIi3jWzx.js";
import { _ as createServerFn, x as redirect } from "../server.js";
import "./services-middleware-DR8Hua1Y.js";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const workflowLoader_createServerFn_handler = createServerRpc({
  id: "b715dbcb72c4e13f7f23e5042eb58c4dc63388e4054266d8c58a136fdf4c4189",
  name: "workflowLoader",
  filename: "src/routes/_app/_builder/detection/scenarios/$scenarioId/workflow.tsx"
}, (opts) => workflowLoader.__executeServer(opts));
const workflowLoader = createServerFn().middleware([authMiddleware]).validator((input) => input).handler(workflowLoader_createServerFn_handler, async function workflowLoader2({
  data,
  context
}) {
  const {
    dataModelRepository,
    entitlements,
    user
  } = context.authInfo;
  if (!isWorkflowsAvailable(entitlements)) {
    throw redirect({
      to: "/detection/scenarios/$scenarioId/home",
      params: {
        scenarioId: fromUUIDtoSUUID(fromParams(data?.params ?? {}, "scenarioId"))
      }
    });
  }
  const [dataModel] = await Promise.all([dataModelRepository.getDataModel()]);
  return {
    scenarioId: fromParams(data?.params ?? {}, "scenarioId"),
    dataModel,
    workflowFeatureAccess: {
      isCreateInboxAvailable: isCreateInboxAvailable(user)
    }
  };
});
export {
  workflowLoader_createServerFn_handler
};
