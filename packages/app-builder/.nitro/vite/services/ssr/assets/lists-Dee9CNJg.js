import { c as createSsrRpc } from "./createSsrRpc-ZXUHv2Er.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { c as createListPayloadSchema, b as deleteValuePayloadSchema, e as editListPayloadSchema, a as addValuePayloadSchema, d as deleteListPayloadSchema } from "./lists-DTaf1grX.js";
import { _ as createServerFn } from "../server.js";
const getListsFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).handler(createSsrRpc("aa2f6e9630b2170e61c566aee519bcfb49186ed4366802d880b3c61134ff66d4"));
const createListFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(createListPayloadSchema).handler(createSsrRpc("8a31b898ccb0eac9b409e567b8b6c8a5e66000a39e2e0d0f343bce947215991e"));
const deleteListFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(deleteListPayloadSchema).handler(createSsrRpc("2b60cc427309ff778745eae07f27a802b823a9d85363fb673284fb34178e1eec"));
const editListFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(editListPayloadSchema).handler(createSsrRpc("522dc8ffa88e5fa33cd8ddfacbcdd4ce967dbf385b0fe394ff8eb713cfc119fd"));
const addListValueFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(addValuePayloadSchema).handler(createSsrRpc("0a8c31d1802e9960ac7cdbf4d3d0ce53fa03d7dd9066ca3efc7884c9c0ad9a4c"));
const deleteListValueFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(deleteValuePayloadSchema).handler(createSsrRpc("0ece79298e72626dc7e25ecf49807a1d1b4bb51c0bdf73bd5232c1f157865de7"));
createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator((data) => {
  if (!(data instanceof FormData)) throw new Error("Expected FormData");
  return data;
}).handler(createSsrRpc("279107d104c29acf6321d72842c8ad8c82e53323706e5d0765563e0f15514bf7"));
export {
  addListValueFn as a,
  deleteListValueFn as b,
  createListFn as c,
  deleteListFn as d,
  editListFn as e,
  getListsFn as g
};
