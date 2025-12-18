import { c as createSsrRpc } from "./createSsrRpc-ZXUHv2Er.js";
import { s as servicesMiddleware } from "./services-middleware-DR8Hua1Y.js";
import { _ as createServerFn } from "../server.js";
import { o as object, s as string } from "./short-uuid-MIi3jWzx.js";
const signInPayload = object({
  idToken: string(),
  refreshToken: string().optional(),
  csrf: string(),
  redirectTo: string().optional()
});
const signInFn = createServerFn({
  method: "POST"
}).middleware([servicesMiddleware]).validator(signInPayload).handler(createSsrRpc("23078da067c0d054992a8f46ecb488d22fb36590eb3f3abe2bbb0f4b4b45f03b"));
createServerFn({
  method: "POST"
}).middleware([servicesMiddleware]).validator(signInPayload).handler(createSsrRpc("efcf4c4ade647ef10c5850f4903cb036ee9c9cc6425af6151a1469dd30578d49"));
const logoutFn = createServerFn({
  method: "POST"
}).middleware([servicesMiddleware]).validator(object({
  redirectTo: string().optional()
})).handler(createSsrRpc("4d3bc23bbc393f0c22fb74aa313ecc4d1b221eb475ca56a220fd3b416d6ad25e"));
createServerFn({
  method: "POST"
}).middleware([servicesMiddleware]).validator(object({
  idToken: string(),
  csrf: string()
})).handler(createSsrRpc("529c11e230cecc431623ebc64b78ad4822d0276b44fe54542de7db123b4ed455"));
export {
  logoutFn as l,
  signInFn as s
};
