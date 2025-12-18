import { c as createSsrRpc } from "./createSsrRpc-ZXUHv2Er.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { c as createTableValueSchema, b as applyArchetypePayloadSchema, l as listObjectsInputSchema, a as createNavigationOptionSchema, d as deleteTablePayloadSchema, e as editSemanticTablePayloadSchema } from "./data-fdG1PpsD.js";
import { _ as createServerFn } from "../server.js";
import { o as object, p as boolean, s as string, e as unknown } from "./short-uuid-MIi3jWzx.js";
const getDataModelFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).handler(createSsrRpc("6944613ffe0aa02bb2c4f5e334213d5ca9ee34cfdc427416708cf528d68ff3f2"));
const getObjectDetailsFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(object({
  objectType: string(),
  objectId: string()
})).handler(createSsrRpc("1efcd86b2bc7895d3981a5ebe0f645d5664ddd40ee87753a56ad300d6f336347"));
const getObjectCasesFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(object({
  objectType: string(),
  objectId: string()
})).handler(createSsrRpc("e6229feca3b3fb85b41ab0891207d4614d4bb03b4efa764297cd88ad37d290fb"));
const getAnnotationsFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(object({
  objectType: string(),
  objectId: string(),
  loadThumbnails: boolean().optional()
})).handler(createSsrRpc("2e2c44dea917bd6673dd566a86500b4714ee81ec707b56dd2a1e439ef390befb"));
const getHierarchyFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(object({
  objectType: string(),
  objectId: string(),
  showAll: boolean().optional()
})).handler(createSsrRpc("45cc9be38ba9c9cbbde847284a880e1a3b298e1cb0709facd5ac322c439440dc"));
const listObjectsFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(listObjectsInputSchema).handler(createSsrRpc("a935492b06b3339671752674985c2bdbb3884594169301f4e22811733e16cf72"));
const listArchetypesFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).handler(createSsrRpc("3409b04d1702a2d8544171e712f454ccb429ad4e30ec126fa85586fb5307674a"));
const createTableFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(createTableValueSchema).handler(createSsrRpc("bffc3c813284c52f2a760b5057ce15887502aa1fd8b7ea49cc9a49bc9d30a25d"));
createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(deleteTablePayloadSchema).handler(createSsrRpc("620c46bfa3baf7db386208078056700c83bd9579d70242df23c44c39513b8006"));
const createNavigationOptionFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(object({
  tableId: string(),
  ...createNavigationOptionSchema.shape
})).handler(createSsrRpc("2ae2f8aa739bc87b26179633dd7ab394f8ba7bc4489dbfa180c1f1922def10cd"));
const applyArchetypeFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(applyArchetypePayloadSchema).handler(createSsrRpc("8576e3c08aa7eeb60ef13888c99a08b2c94a9ccb2011e4b79e4a2747c8bd8e34"));
createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(editSemanticTablePayloadSchema).handler(createSsrRpc("15091ae1ff83a56dbe3c9e2f02f6284aa0e95fb9f939e3a6a080396c6d923a78"));
const createAnnotationFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator((data) => {
  if (!(data instanceof FormData)) throw new Error("Expected FormData");
  return data;
}).handler(createSsrRpc("bc39d831a3856af2a4d01bab1899d09c170fbc1cf3aff927b17e4b81eeb25232"));
const deleteAnnotationFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(object({
  annotationId: string()
})).handler(createSsrRpc("1f1e07f6140177e3b7e1ee29119c29aa561583b5f4d305e63b5293ce6fba7c16"));
createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator((data) => {
  if (!(data instanceof FormData)) throw new Error("Expected FormData");
  return data;
}).handler(createSsrRpc("b8cfaed4b661eb58e1126fc2c19a1941d14bbee462adcfaf38d21c8ad608b5f5"));
const getUploadLogsFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(object({
  objectType: string()
})).handler(createSsrRpc("dba1c1f220424954a6cba811e467fc7cef5967c34fb495cfa073a4df63df92da"));
const importOrgFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(object({
  body: unknown()
})).handler(createSsrRpc("df48532154d9db27d92642acee665ab62e9a530971387ef6d65669994da54b1d"));
const importOrgFileFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator((data) => {
  if (!(data instanceof FormData)) throw new Error("Expected FormData");
  return data;
}).handler(createSsrRpc("e34efea5d0fd04848729b9d6a16c0c9deebf709db40984ac8169287e71fb45b7"));
export {
  getDataModelFn as a,
  getAnnotationsFn as b,
  getUploadLogsFn as c,
  importOrgFn as d,
  applyArchetypeFn as e,
  createTableFn as f,
  getObjectDetailsFn as g,
  createNavigationOptionFn as h,
  importOrgFileFn as i,
  getObjectCasesFn as j,
  getHierarchyFn as k,
  listArchetypesFn as l,
  deleteAnnotationFn as m,
  listObjectsFn as n,
  createAnnotationFn as o
};
