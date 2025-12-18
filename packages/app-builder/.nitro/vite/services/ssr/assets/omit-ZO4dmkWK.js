import { t, aM as t$1 } from "./services-middleware-DR8Hua1Y.js";
function n(...t$12) {
  return t(r, t$12);
}
function r(e, n2) {
  if (!t$1(n2, 1)) return { ...e };
  if (!t$1(n2, 2)) {
    let { [n2[0]]: t2, ...r3 } = e;
    return r3;
  }
  let r2 = { ...e };
  for (let e2 of n2) delete r2[e2];
  return r2;
}
export {
  n
};
