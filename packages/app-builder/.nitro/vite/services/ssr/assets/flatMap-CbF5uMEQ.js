import { t as t$1 } from "./services-middleware-DR8Hua1Y.js";
function t(...t2) {
  return t$1(n, t2, r);
}
const n = (e, t2) => e.flatMap(t2), r = (e) => (t2, n2, r2) => {
  let i = e(t2, n2, r2);
  return Array.isArray(i) ? { done: false, hasNext: true, hasMany: true, next: i } : { done: false, hasNext: true, next: i };
};
export {
  t
};
