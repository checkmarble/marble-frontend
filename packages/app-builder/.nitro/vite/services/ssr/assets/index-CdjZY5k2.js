import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { f as fromParams } from "./short-uuid-MIi3jWzx.js";
import { _ as createServerFn } from "../server.js";
import "./services-middleware-DR8Hua1Y.js";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const testRunLoader_createServerFn_handler = createServerRpc({
  id: "3e3dd68bddc4fccfe463f50bf405f3ecaaa57570ec973292136a0b24e4393746",
  name: "testRunLoader",
  filename: "src/routes/_app/_builder/detection/scenarios/$scenarioId/test-run/$testRunId/index.tsx"
}, (opts) => testRunLoader.__executeServer(opts));
const testRunLoader = createServerFn().middleware([authMiddleware]).validator((input) => input).handler(testRunLoader_createServerFn_handler, async function testRunLoader2({
  data,
  context
}) {
  const testRunId = fromParams(data?.params ?? {}, "testRunId");
  const {
    testRun
  } = context.authInfo;
  const decisionsPromise = testRun.listDecisions({
    testRunId
  });
  const rulesPromise = testRun.listRuleExecutions({
    testRunId
  });
  const run = await testRun.getTestRun({
    testRunId
  });
  return {
    run,
    decisionsPromise,
    rulesPromise
  };
});
export {
  testRunLoader_createServerFn_handler
};
