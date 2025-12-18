import { aT as e, aU as r$1 } from "./services-middleware-DR8Hua1Y.js";
function n(t, n2) {
  return typeof t == `object` ? r(t, n2) : e(r, t === void 0 ? [] : [t], i);
}
const r = (e2, t) => t === void 0 ? e2.flat() : e2.flat(t), i = (e2) => e2 === void 0 || e2 === 1 ? a : e2 <= 0 ? r$1 : (t) => Array.isArray(t) ? { next: t.flat(e2 - 1), hasNext: true, hasMany: true, done: false } : { next: t, hasNext: true, done: false }, a = (e2) => Array.isArray(e2) ? { next: e2, hasNext: true, hasMany: true, done: false } : { next: e2, hasNext: true, done: false };
export {
  n
};
