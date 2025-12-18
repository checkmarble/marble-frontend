import { c as createSsrRpc } from "./createSsrRpc-ZXUHv2Er.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { r as ruleSchema } from "./update-workflow-rule-D4tbolCA.js";
import { _ as createServerFn } from "../server.js";
import { o as object, s as string, p as boolean, k as array } from "./short-uuid-MIi3jWzx.js";
import { u as useQuery } from "./useQuery-B7mL_evE.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
createServerFn({
  method: "GET"
}).middleware([authMiddleware]).handler(createSsrRpc("dc22971611fdbbfc01da2718b94cb87e99d65f644986bf516efd80bb4f2dcccd"));
const listWorkflowRulesFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(object({
  scenarioId: string()
})).handler(createSsrRpc("82a0606287e871253bee2695568cc074f02a79719a9c3912f1f286f334f44acb"));
createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(object({
  scenarioId: string()
})).handler(createSsrRpc("b7150a870e9a1ea0cec101e043c9315f8e4f493bbf6f154280b4c83124d8c5dc"));
const reorderWorkflowsFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(object({
  scenarioId: string(),
  ruleIds: array(string())
})).handler(createSsrRpc("6b4926a912ebab96f542f97312e6119773d323636fc3886a305ead95a794d825"));
const createWorkflowRuleFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(object({
  scenarioId: string(),
  name: string().min(1),
  fallthrough: boolean()
})).handler(createSsrRpc("b5763aef299fd3edda29c30c20c4016e86ac27e31697a1689163ff17d8d7b171"));
createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(object({
  ruleId: string()
})).handler(createSsrRpc("df0559d9cda80ea6a0d0760b45380c378e605953fba51a6900562d5a851e2e10"));
createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(ruleSchema).handler(createSsrRpc("67501a547b07672088001fd3643a7243f0defadae72c31f35ea7253014d0ed4f"));
const deleteWorkflowRuleFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(object({
  ruleId: string()
})).handler(createSsrRpc("7d12d035dddab5de6291edae11fad895bbd0d54c4ddd305f06aba898e35a49ce"));
createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(object({
  ruleId: string(),
  name: string(),
  fallthrough: boolean()
})).handler(createSsrRpc("3849fdd912adea42e0d27ed6c9cd470a212755e0d106e0e3bab820181742368f"));
createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(object({
  ruleId: string(),
  conditionId: string()
})).handler(createSsrRpc("eabff882048a1ed35120dd8d25bea4f62f65b62d9f736ee683738a9a1738f7a4"));
function useListRulesQuery(scenarioId) {
  const listWorkflowRules = useServerFn(listWorkflowRulesFn);
  return useQuery({
    queryKey: ["workflow-rules", scenarioId],
    queryFn: async () => {
      const data = await listWorkflowRules({ data: { scenarioId } });
      return data;
    }
  });
}
export {
  createWorkflowRuleFn as c,
  deleteWorkflowRuleFn as d,
  reorderWorkflowsFn as r,
  useListRulesQuery as u
};
