import { c as createSsrRpc } from "./createSsrRpc-ZXUHv2Er.js";
import { c as createContinuousScreeningConfigSchema, r as reviewMatchPayloadSchema } from "./continuous-screenings-DX2ib6rI.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { _ as createServerFn } from "../server.js";
import { o as object, s as string } from "./short-uuid-MIi3jWzx.js";
const getContinuousScreeningConfigurationFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(object({
  stableId: string()
})).handler(createSsrRpc("8d9af50984926e24e1d954ca748ae0549e6d1b2ad9e2a9efb7e3a25c140c326e"));
const listContinuousScreeningConfigurationsFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).handler(createSsrRpc("e2057feec54b9c65463e5e5049fab560872be0e2364a37913ed87fce9cf5c98d"));
const createContinuousScreeningConfigurationFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(createContinuousScreeningConfigSchema).handler(createSsrRpc("4f4c03013ad5745c2e6065c2028b7d8a55eafaeb72ed4cd83c7c480865d0b881"));
const dismissContinuousScreeningFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(object({
  screeningId: string()
})).handler(createSsrRpc("1656d7f8c414c8212f0b15864ec148e50c260e727b88b57405ec2a5cd4948c8f"));
const loadMoreContinuousScreeningMatchesFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(object({
  screeningId: string()
})).handler(createSsrRpc("de09a804f89994e7c4b71dfae5351566175497947b3fa1b429fd992507f6f196"));
const reviewContinuousScreeningMatchFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(reviewMatchPayloadSchema).handler(createSsrRpc("65bdacf95e97ec0a55a69b83fde6b36289c73a42072ae668760591a64c05f0ab"));
const updateContinuousScreeningConfigurationFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(createContinuousScreeningConfigSchema.and(object({
  configStableId: string()
}))).handler(createSsrRpc("f8f975475cd1f94c061db5e0fc94dc68631a5ce17d2b663c51ffc90322224c92"));
export {
  loadMoreContinuousScreeningMatchesFn as a,
  createContinuousScreeningConfigurationFn as c,
  dismissContinuousScreeningFn as d,
  getContinuousScreeningConfigurationFn as g,
  listContinuousScreeningConfigurationsFn as l,
  reviewContinuousScreeningMatchFn as r,
  updateContinuousScreeningConfigurationFn as u
};
