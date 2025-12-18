import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { _ as isDeploymentActionsAvailable, $ as isCreateDraftAvailable, b as isEditScenarioAvailable } from "./feature-access-B8PIS8ad.js";
import { f as fromParams } from "./short-uuid-MIi3jWzx.js";
import { _ as createServerFn } from "../server.js";
import "./services-middleware-DR8Hua1Y.js";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const editViewLoader_createServerFn_handler = createServerRpc({
  id: "ba9c379c3bd9fefe648e379845f78650c969c6a20b6cd18078d4a9a7a1545fbb",
  name: "editViewLoader",
  filename: "src/routes/_app/_builder/detection/scenarios/$scenarioId/i/$iterationId/_edit-view.tsx"
}, (opts) => editViewLoader.__executeServer(opts));
const editViewLoader = createServerFn().middleware([authMiddleware]).validator((input) => input).handler(editViewLoader_createServerFn_handler, async function editViewLoader2({
  data,
  context
}) {
  const {
    scenario,
    user
  } = context.authInfo;
  const iterationId = fromParams(data?.params ?? {}, "iterationId");
  if (!isDeploymentActionsAvailable(user)) {
    return {
      isEditScenarioAvailable: isEditScenarioAvailable(user),
      isDeploymentActionsAvailable: false,
      isCreateDraftAvailable: isCreateDraftAvailable(user)
    };
  }
  const publicationPreparationStatus = await scenario.getPublicationPreparationStatus({
    iterationId
  });
  return {
    isEditScenarioAvailable: isEditScenarioAvailable(user),
    isDeploymentActionsAvailable: true,
    isCreateDraftAvailable: isCreateDraftAvailable(user),
    publicationPreparationStatus
  };
});
export {
  editViewLoader_createServerFn_handler
};
