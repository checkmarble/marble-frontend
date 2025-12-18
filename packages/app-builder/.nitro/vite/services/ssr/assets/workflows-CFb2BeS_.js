import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { r as ruleSchema, u as updateWorkflowRule } from "./update-workflow-rule-D4tbolCA.js";
import { _ as createServerFn } from "../server.js";
import { o as object, s as string, k as array, p as boolean } from "./short-uuid-MIi3jWzx.js";
import "./services-middleware-DR8Hua1Y.js";
import "node:crypto";
import "./isDeepEqual-C0XXZLYo.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const listWorkflowInboxesFn_createServerFn_handler = createServerRpc({
  id: "dc22971611fdbbfc01da2718b94cb87e99d65f644986bf516efd80bb4f2dcccd",
  name: "listWorkflowInboxesFn",
  filename: "src/server-fns/workflows.ts"
}, (opts) => listWorkflowInboxesFn.__executeServer(opts));
const listWorkflowInboxesFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).handler(listWorkflowInboxesFn_createServerFn_handler, async ({
  context
}) => {
  return context.authInfo.inbox.listInboxesMetadata();
});
const listWorkflowRulesFn_createServerFn_handler = createServerRpc({
  id: "82a0606287e871253bee2695568cc074f02a79719a9c3912f1f286f334f44acb",
  name: "listWorkflowRulesFn",
  filename: "src/server-fns/workflows.ts"
}, (opts) => listWorkflowRulesFn.__executeServer(opts));
const listWorkflowRulesFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(object({
  scenarioId: string()
})).handler(listWorkflowRulesFn_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    triggerObjectType
  } = await context.authInfo.scenario.getScenario({
    scenarioId: data.scenarioId
  });
  const workflow = await context.authInfo.scenario.listWorkflowRules({
    scenarioId: data.scenarioId
  });
  return {
    workflow,
    triggerObjectType
  };
});
const getWorkflowLatestReferencesFn_createServerFn_handler = createServerRpc({
  id: "b7150a870e9a1ea0cec101e043c9315f8e4f493bbf6f154280b4c83124d8c5dc",
  name: "getWorkflowLatestReferencesFn",
  filename: "src/server-fns/workflows.ts"
}, (opts) => getWorkflowLatestReferencesFn.__executeServer(opts));
const getWorkflowLatestReferencesFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(object({
  scenarioId: string()
})).handler(getWorkflowLatestReferencesFn_createServerFn_handler, async ({
  context,
  data
}) => {
  const references = await context.authInfo.scenario.getLatestRulesReferences(data.scenarioId);
  return references.sort((a, b) => Number(b.latestVersion) - Number(a.latestVersion));
});
const reorderWorkflowsFn_createServerFn_handler = createServerRpc({
  id: "6b4926a912ebab96f542f97312e6119773d323636fc3886a305ead95a794d825",
  name: "reorderWorkflowsFn",
  filename: "src/server-fns/workflows.ts"
}, (opts) => reorderWorkflowsFn.__executeServer(opts));
const reorderWorkflowsFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(object({
  scenarioId: string(),
  ruleIds: array(string())
})).handler(reorderWorkflowsFn_createServerFn_handler, async ({
  context,
  data
}) => {
  await context.authInfo.scenario.reorderWorkflows({
    scenarioId: data.scenarioId,
    workflowIds: data.ruleIds
  });
});
const createWorkflowRuleFn_createServerFn_handler = createServerRpc({
  id: "b5763aef299fd3edda29c30c20c4016e86ac27e31697a1689163ff17d8d7b171",
  name: "createWorkflowRuleFn",
  filename: "src/server-fns/workflows.ts"
}, (opts) => createWorkflowRuleFn.__executeServer(opts));
const createWorkflowRuleFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(object({
  scenarioId: string(),
  name: string().min(1),
  fallthrough: boolean()
})).handler(createWorkflowRuleFn_createServerFn_handler, async ({
  context,
  data
}) => {
  const rule = await context.authInfo.scenario.createWorkflowRule({
    scenarioId: data.scenarioId,
    name: data.name,
    fallthrough: data.fallthrough
  });
  const action = await context.authInfo.scenario.createWorkflowAction({
    ruleId: rule.id,
    action: {
      id: "default-disabled-action",
      action: "DISABLED"
    }
  });
  return action;
});
const getWorkflowRuleFn_createServerFn_handler = createServerRpc({
  id: "df0559d9cda80ea6a0d0760b45380c378e605953fba51a6900562d5a851e2e10",
  name: "getWorkflowRuleFn",
  filename: "src/server-fns/workflows.ts"
}, (opts) => getWorkflowRuleFn.__executeServer(opts));
const getWorkflowRuleFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(object({
  ruleId: string()
})).handler(getWorkflowRuleFn_createServerFn_handler, async ({
  context,
  data
}) => {
  return context.authInfo.scenario.getWorkflowRule({
    ruleId: data.ruleId
  });
});
const updateWorkflowRuleFn_createServerFn_handler = createServerRpc({
  id: "67501a547b07672088001fd3643a7243f0defadae72c31f35ea7253014d0ed4f",
  name: "updateWorkflowRuleFn",
  filename: "src/server-fns/workflows.ts"
}, (opts) => updateWorkflowRuleFn.__executeServer(opts));
const updateWorkflowRuleFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(ruleSchema).handler(updateWorkflowRuleFn_createServerFn_handler, async ({
  context,
  data
}) => {
  await updateWorkflowRule(context.authInfo.scenario, data);
});
const deleteWorkflowRuleFn_createServerFn_handler = createServerRpc({
  id: "7d12d035dddab5de6291edae11fad895bbd0d54c4ddd305f06aba898e35a49ce",
  name: "deleteWorkflowRuleFn",
  filename: "src/server-fns/workflows.ts"
}, (opts) => deleteWorkflowRuleFn.__executeServer(opts));
const deleteWorkflowRuleFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(object({
  ruleId: string()
})).handler(deleteWorkflowRuleFn_createServerFn_handler, async ({
  context,
  data
}) => {
  await context.authInfo.scenario.deleteWorkflowRule({
    ruleId: data.ruleId
  });
});
const renameWorkflowRuleFn_createServerFn_handler = createServerRpc({
  id: "3849fdd912adea42e0d27ed6c9cd470a212755e0d106e0e3bab820181742368f",
  name: "renameWorkflowRuleFn",
  filename: "src/server-fns/workflows.ts"
}, (opts) => renameWorkflowRuleFn.__executeServer(opts));
const renameWorkflowRuleFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(object({
  ruleId: string(),
  name: string(),
  fallthrough: boolean()
})).handler(renameWorkflowRuleFn_createServerFn_handler, async ({
  context,
  data
}) => {
  await context.authInfo.apiClient.updateWorkflowRule(data.ruleId, {
    name: data.name,
    fallthrough: data.fallthrough
  });
});
const deleteWorkflowConditionFn_createServerFn_handler = createServerRpc({
  id: "eabff882048a1ed35120dd8d25bea4f62f65b62d9f736ee683738a9a1738f7a4",
  name: "deleteWorkflowConditionFn",
  filename: "src/server-fns/workflows.ts"
}, (opts) => deleteWorkflowConditionFn.__executeServer(opts));
const deleteWorkflowConditionFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(object({
  ruleId: string(),
  conditionId: string()
})).handler(deleteWorkflowConditionFn_createServerFn_handler, async ({
  context,
  data
}) => {
  await context.authInfo.scenario.deleteWorkflowCondition({
    ruleId: data.ruleId,
    conditionId: data.conditionId
  });
});
export {
  createWorkflowRuleFn_createServerFn_handler,
  deleteWorkflowConditionFn_createServerFn_handler,
  deleteWorkflowRuleFn_createServerFn_handler,
  getWorkflowLatestReferencesFn_createServerFn_handler,
  getWorkflowRuleFn_createServerFn_handler,
  listWorkflowInboxesFn_createServerFn_handler,
  listWorkflowRulesFn_createServerFn_handler,
  renameWorkflowRuleFn_createServerFn_handler,
  reorderWorkflowsFn_createServerFn_handler,
  updateWorkflowRuleFn_createServerFn_handler
};
