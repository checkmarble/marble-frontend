import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { I as isStatusConflictHttpError, Y as omit, g as getServerEnv } from "./services-middleware-DR8Hua1Y.js";
import { c as createListPayloadSchema, d as deleteListPayloadSchema, e as editListPayloadSchema, a as addValuePayloadSchema, b as deleteValuePayloadSchema } from "./lists-DTaf1grX.js";
import { b as getCustomListDataUploadEndpoint } from "./files-fO9wUXBf.js";
import { b as fromUUIDtoSUUID } from "./short-uuid-MIi3jWzx.js";
import { _ as createServerFn, x as redirect } from "../server.js";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
const getListsFn_createServerFn_handler = createServerRpc({
  id: "aa2f6e9630b2170e61c566aee519bcfb49186ed4366802d880b3c61134ff66d4",
  name: "getListsFn",
  filename: "src/server-fns/lists.ts"
}, (opts) => getListsFn.__executeServer(opts));
const getListsFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).handler(getListsFn_createServerFn_handler, async ({
  context
}) => {
  return context.authInfo.customListsRepository.listCustomLists();
});
const createListFn_createServerFn_handler = createServerRpc({
  id: "8a31b898ccb0eac9b409e567b8b6c8a5e66000a39e2e0d0f343bce947215991e",
  name: "createListFn",
  filename: "src/server-fns/lists.ts"
}, (opts) => createListFn.__executeServer(opts));
const createListFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(createListPayloadSchema).handler(createListFn_createServerFn_handler, async ({
  context,
  data
}) => {
  try {
    const result = await context.authInfo.customListsRepository.createCustomList(data);
    throw redirect({
      to: "/detection/lists/$listId",
      params: {
        listId: fromUUIDtoSUUID(result.id)
      }
    });
  } catch (error) {
    if (error instanceof Response && error.status >= 300 && error.status < 400) {
      throw error;
    }
    if (isStatusConflictHttpError(error)) {
      return {
        error: "duplicate_list_name"
      };
    }
    throw new Error("Failed to create list");
  }
});
const deleteListFn_createServerFn_handler = createServerRpc({
  id: "2b60cc427309ff778745eae07f27a802b823a9d85363fb673284fb34178e1eec",
  name: "deleteListFn",
  filename: "src/server-fns/lists.ts"
}, (opts) => deleteListFn.__executeServer(opts));
const deleteListFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(deleteListPayloadSchema).handler(deleteListFn_createServerFn_handler, async ({
  context,
  data
}) => {
  await context.authInfo.customListsRepository.deleteCustomList(data.listId);
  throw redirect({
    to: "/detection/lists"
  });
});
const editListFn_createServerFn_handler = createServerRpc({
  id: "522dc8ffa88e5fa33cd8ddfacbcdd4ce967dbf385b0fe394ff8eb713cfc119fd",
  name: "editListFn",
  filename: "src/server-fns/lists.ts"
}, (opts) => editListFn.__executeServer(opts));
const editListFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(editListPayloadSchema).handler(editListFn_createServerFn_handler, async ({
  context,
  data
}) => {
  await context.authInfo.customListsRepository.updateCustomList(data.listId, omit(data, ["listId"]));
});
const addListValueFn_createServerFn_handler = createServerRpc({
  id: "0a8c31d1802e9960ac7cdbf4d3d0ce53fa03d7dd9066ca3efc7884c9c0ad9a4c",
  name: "addListValueFn",
  filename: "src/server-fns/lists.ts"
}, (opts) => addListValueFn.__executeServer(opts));
const addListValueFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(addValuePayloadSchema).handler(addListValueFn_createServerFn_handler, async ({
  context,
  data
}) => {
  await context.authInfo.customListsRepository.createCustomListValue(data.listId, {
    value: data.value
  });
});
const deleteListValueFn_createServerFn_handler = createServerRpc({
  id: "0ece79298e72626dc7e25ecf49807a1d1b4bb51c0bdf73bd5232c1f157865de7",
  name: "deleteListValueFn",
  filename: "src/server-fns/lists.ts"
}, (opts) => deleteListValueFn.__executeServer(opts));
const deleteListValueFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(deleteValuePayloadSchema).handler(deleteListValueFn_createServerFn_handler, async ({
  context,
  data
}) => {
  await context.authInfo.customListsRepository.deleteCustomListValue(data.listId, data.listValueId);
});
const uploadListDataFileFn_createServerFn_handler = createServerRpc({
  id: "279107d104c29acf6321d72842c8ad8c82e53323706e5d0765563e0f15514bf7",
  name: "uploadListDataFileFn",
  filename: "src/server-fns/lists.ts"
}, (opts) => uploadListDataFileFn.__executeServer(opts));
const uploadListDataFileFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator((data) => {
  if (!(data instanceof FormData)) throw new Error("Expected FormData");
  return data;
}).handler(uploadListDataFileFn_createServerFn_handler, async ({
  context,
  data
}) => {
  const listId = data.get("listId");
  if (!listId) return new Response(null, {
    status: 400
  });
  const token = await context.authInfo.tokenService.getToken();
  const backendData = new FormData();
  for (const [key, value] of data.entries()) {
    if (key !== "listId") backendData.append(key, value);
  }
  const upstream = await fetch(`${getServerEnv("MARBLE_API_URL")}${getCustomListDataUploadEndpoint(listId)}`, {
    body: backendData,
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  const headers = new Headers(upstream.headers);
  headers.delete("content-encoding");
  headers.delete("content-length");
  const body = [204, 205, 304].includes(upstream.status) ? null : await upstream.arrayBuffer();
  return new Response(body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers
  });
});
export {
  addListValueFn_createServerFn_handler,
  createListFn_createServerFn_handler,
  deleteListFn_createServerFn_handler,
  deleteListValueFn_createServerFn_handler,
  editListFn_createServerFn_handler,
  getListsFn_createServerFn_handler,
  uploadListDataFileFn_createServerFn_handler
};
