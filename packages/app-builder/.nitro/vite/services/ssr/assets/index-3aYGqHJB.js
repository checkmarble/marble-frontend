import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { H as isNotFoundHttpError, X as isForbiddenHttpError } from "./services-middleware-DR8Hua1Y.js";
import { f as fromParams } from "./short-uuid-MIi3jWzx.js";
import { _ as createServerFn, x as redirect } from "../server.js";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const testRunsLoader_createServerFn_handler = createServerRpc({
  id: "1f732cf3a73e1a42731c4409721b5978c2deb610e7593242c697a8b12223b92b",
  name: "testRunsLoader",
  filename: "src/routes/_app/_builder/detection/scenarios/$scenarioId/test-run/index.tsx"
}, (opts) => testRunsLoader.__executeServer(opts));
const testRunsLoader = createServerFn().middleware([authMiddleware]).validator((input) => input).handler(testRunsLoader_createServerFn_handler, async function testRunsLoader2({
  data,
  context
}) {
  const scenarioId = fromParams(data?.params ?? {}, "scenarioId");
  const {
    testRun
  } = context.authInfo;
  try {
    return {
      runs: await testRun.listTestRuns({
        scenarioId
      })
    };
  } catch (error) {
    if (isNotFoundHttpError(error) || isForbiddenHttpError(error)) {
      throw redirect({
        to: "/detection/scenarios"
      });
    } else {
      throw error;
    }
  }
});
export {
  testRunsLoader_createServerFn_handler
};
