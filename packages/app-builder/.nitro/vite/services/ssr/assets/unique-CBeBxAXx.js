import { u as t$1, a0 as t$2 } from "./services-middleware-DR8Hua1Y.js";
function t(t2, n2) {
  let r2 = n2.length - t2.length;
  if (r2 === 1) {
    let [r3, ...i] = n2;
    return t$1(r3, { lazy: t2, lazyArgs: i });
  }
  if (r2 === 0) {
    let r3 = { lazy: t2, lazyArgs: n2 };
    return Object.assign((t3) => t$1(t3, r3), r3);
  }
  throw Error(`Wrong number of arguments`);
}
function n(...e) {
  return t(r, e);
}
function r() {
  let t2 = /* @__PURE__ */ new Set();
  return (n2) => t2.has(n2) ? t$2 : (t2.add(n2), { done: false, hasNext: true, next: n2 });
}
export {
  n,
  t
};
