import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { t as isIngestDataAvailable } from "./feature-access-B8PIS8ad.js";
import { _ as createServerFn, x as redirect } from "../server.js";
import "./services-middleware-DR8Hua1Y.js";
import "./short-uuid-MIi3jWzx.js";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const uploadLoader_createServerFn_handler = createServerRpc({
  id: "700b8869e924868568e980111bd9786fcca6b7b6bd9ab16530036194587957dc",
  name: "uploadLoader",
  filename: "src/routes/_app/_builder/upload/$objectType.tsx"
}, (opts) => uploadLoader.__executeServer(opts));
const uploadLoader = createServerFn().middleware([authMiddleware]).validator((input) => input).handler(uploadLoader_createServerFn_handler, async function uploadLoader2({
  data,
  context
}) {
  const {
    user,
    apiClient,
    dataModelRepository
  } = context.authInfo;
  if (!isIngestDataAvailable(user)) {
    throw redirect({
      to: "/data"
    });
  }
  const objectType = data?.params?.["objectType"];
  if (!objectType) {
    throw redirect({
      to: "/data"
    });
  }
  const dataModel = await dataModelRepository.getDataModel();
  const table = dataModel.find((t) => t.name === objectType);
  if (!table) {
    throw redirect({
      to: "/data"
    });
  }
  const uploadLogs = await apiClient.getIngestionUploadLogs(objectType);
  return {
    objectType,
    table,
    uploadLogs
  };
});
export {
  uploadLoader_createServerFn_handler
};
