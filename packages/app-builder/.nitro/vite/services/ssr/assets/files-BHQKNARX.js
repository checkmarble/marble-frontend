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
const screeningFilesLoader_createServerFn_handler = createServerRpc({
  id: "4a28384f0c1ddd01ba12aeab2b2ace7744773b2f0c0f887d7cbabaa408dd4843",
  name: "screeningFilesLoader",
  filename: "src/routes/_app/_builder/cases/$caseId/d/$decisionId/screenings/$screeningId/files.tsx"
}, (opts) => screeningFilesLoader.__executeServer(opts));
const screeningFilesLoader = createServerFn().middleware([authMiddleware]).validator((input) => input).handler(screeningFilesLoader_createServerFn_handler, async function screeningFilesLoader2({
  context,
  data
}) {
  const {
    screening: screeningRepository
  } = context.authInfo;
  const decisionId = fromParams(data?.params ?? {}, "decisionId");
  const screeningId = fromParams(data?.params ?? {}, "screeningId");
  const screenings = await screeningRepository.listScreenings({
    decisionId
  });
  const screening = screenings.find((s) => s.id === screeningId);
  if (!screening) {
    throw new Response(null, {
      status: 404,
      statusText: "Not Found"
    });
  }
  return {
    files: await screeningRepository.listScreeningFiles({
      screeningId: screening.id
    }),
    screening
  };
});
export {
  screeningFilesLoader_createServerFn_handler
};
