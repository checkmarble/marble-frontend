import { t as t$1 } from "./services-middleware-DR8Hua1Y.js";
function t(...t2) {
  return t$1(n, t2);
}
const n = (e, t2) => {
  let n2 = e.entries(), r = n2.next();
  if (`done` in r && r.done) return 0;
  let { value: [, i] } = r, a = t2(i, 0, e);
  for (let [r2, i2] of n2) {
    let n3 = t2(i2, r2, e);
    a += n3;
  }
  return a;
};
export {
  t
};
