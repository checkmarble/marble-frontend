import { aU as r$1, a0 as t$1 } from "./services-middleware-DR8Hua1Y.js";
import { t } from "./unique-CBeBxAXx.js";
function r(...e) {
  return t(i, e);
}
function i(n) {
  if (n.length === 0) return r$1;
  let r2 = /* @__PURE__ */ new Map();
  for (let e of n) r2.set(e, (r2.get(e) ?? 0) + 1);
  return (e) => {
    let n2 = r2.get(e);
    return n2 === void 0 || n2 === 0 ? { done: false, hasNext: true, next: e } : (r2.set(e, n2 - 1), t$1);
  };
}
export {
  r
};
