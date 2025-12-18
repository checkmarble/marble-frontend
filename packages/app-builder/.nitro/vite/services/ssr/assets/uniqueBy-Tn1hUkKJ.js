import { a0 as t$1 } from "./services-middleware-DR8Hua1Y.js";
import { t } from "./unique-CBeBxAXx.js";
function n(...e) {
  return t(r, e);
}
function r(t2) {
  let n2 = t2, r2 = /* @__PURE__ */ new Set();
  return (t3, i, a) => {
    let o = n2(t3, i, a);
    return r2.has(o) ? t$1 : (r2.add(o), { done: false, hasNext: true, next: t3 });
  };
}
export {
  n
};
