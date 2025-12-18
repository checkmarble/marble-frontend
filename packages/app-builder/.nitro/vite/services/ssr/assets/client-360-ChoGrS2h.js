import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { a as addConfigurationPayloadSchema, c as client360SearchPayloadSchema } from "./client360-CLU9wRk8.js";
import { _ as createServerFn } from "../server.js";
import "./services-middleware-DR8Hua1Y.js";
import "./short-uuid-MIi3jWzx.js";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const addClient360ConfigurationFn_createServerFn_handler = createServerRpc({
  id: "880d65aaf841161add62f19fc5a167b5b04291f468a24ee61ce02619a0370e1b",
  name: "addClient360ConfigurationFn",
  filename: "src/server-fns/client-360.ts"
}, (opts) => addClient360ConfigurationFn.__executeServer(opts));
const addClient360ConfigurationFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(addConfigurationPayloadSchema).handler(addClient360ConfigurationFn_createServerFn_handler, async ({
  context,
  data
}) => {
  try {
    const {
      tableId,
      semanticType,
      captionField,
      alias
    } = data;
    const {
      dataModelRepository
    } = context.authInfo;
    const dataModel = await dataModelRepository.getDataModel();
    const table = dataModel.find((t) => t.id === tableId);
    const field = table?.fields.find((f) => f.name === captionField);
    await dataModelRepository.patchDataModelTable(tableId, {
      semantic_type: semanticType,
      caption_field: captionField,
      alias,
      // Set the caption field's semantic_type to 'name' only if it has none
      // Treat both undefined and "" as "no semantic type"
      fields: field && !field.semanticType ? [{
        op: "MOD",
        data: {
          id: field.id,
          semantic_type: "name"
        }
      }] : void 0
    });
  } catch {
    throw new Error("Failed to add configuration");
  }
});
const searchClient360Fn_createServerFn_handler = createServerRpc({
  id: "c31af8b0b868ea45fe4522ba4e6e65a83ef5425f85581ff7f1d23c50fe1b8e9d",
  name: "searchClient360Fn",
  filename: "src/server-fns/client-360.ts"
}, (opts) => searchClient360Fn.__executeServer(opts));
const searchClient360Fn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(client360SearchPayloadSchema).handler(searchClient360Fn_createServerFn_handler, async ({
  context,
  data
}) => {
  return context.authInfo.client360.searchClient360(data);
});
export {
  addClient360ConfigurationFn_createServerFn_handler,
  searchClient360Fn_createServerFn_handler
};
