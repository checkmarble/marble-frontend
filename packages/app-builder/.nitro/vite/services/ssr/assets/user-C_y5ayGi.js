import { u as t, v as n } from "./services-middleware-DR8Hua1Y.js";
import { t as t$1 } from "./join-BeQTfqAC.js";
function e(e2) {
  return !!e2;
}
function getFullName(user) {
  return t([user?.firstName, user?.lastName], n(e), t$1(" "));
}
export {
  getFullName as g
};
