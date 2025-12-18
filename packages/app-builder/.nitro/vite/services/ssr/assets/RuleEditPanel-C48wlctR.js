import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { _ as createServerFn } from "../server.js";
import { o as object, d as any, n as number, s as string } from "./short-uuid-MIi3jWzx.js";
import "./services-middleware-DR8Hua1Y.js";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const editRuleFormSchema = object({
  name: string().nonempty(),
  description: string().optional(),
  ruleGroup: string().optional(),
  scoreModifier: number().int().min(-1e3).max(1e3),
  formula: any()
});
const editRuleConfigurationSchema = object({
  params: object({
    ruleId: string()
  }),
  payload: editRuleFormSchema
});
const editRuleAction_createServerFn_handler = createServerRpc({
  id: "9400a11e6b2258983bbeb49c7002a1783418a7cb2735a2b7e80327517e28d11f",
  name: "editRuleAction",
  filename: "src/components/Scenario/Rules/RuleEditPanel.tsx"
}, (opts) => editRuleAction.__executeServer(opts));
const editRuleAction = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(editRuleConfigurationSchema).handler(editRuleAction_createServerFn_handler, async function editRuleAction2({
  context,
  data: {
    params,
    payload
  }
}) {
  const {
    scenarioIterationRuleRepository
  } = context.authInfo;
  return await scenarioIterationRuleRepository.updateRule({
    ruleId: params.ruleId,
    ...payload
  });
});
export {
  editRuleAction_createServerFn_handler
};
