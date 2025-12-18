import { t as t$1 } from "./services-middleware-DR8Hua1Y.js";
function t(...t2) {
  return t$1(n, t2);
}
function n(e, t2) {
  let n2 = {};
  for (let [r, i] of e.entries()) {
    let [a, o] = t2(i, r, e);
    n2[a] = o;
  }
  return n2;
}
export {
  t
};
