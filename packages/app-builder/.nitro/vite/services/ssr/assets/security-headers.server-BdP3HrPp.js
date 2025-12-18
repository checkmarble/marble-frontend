import { AsyncLocalStorage } from "node:async_hooks";
const storage = new AsyncLocalStorage();
function runWithSecurityHeadersStore(nonce, fn) {
  return storage.run({ nonce }, fn);
}
function getRequestNonce() {
  return storage.getStore()?.nonce;
}
function setContentSecurityPolicy(csp) {
  const store = storage.getStore();
  if (store) store.csp = csp;
}
function getContentSecurityPolicy() {
  return storage.getStore()?.csp;
}
export {
  getContentSecurityPolicy as a,
  getRequestNonce as g,
  runWithSecurityHeadersStore as r,
  setContentSecurityPolicy as s
};
