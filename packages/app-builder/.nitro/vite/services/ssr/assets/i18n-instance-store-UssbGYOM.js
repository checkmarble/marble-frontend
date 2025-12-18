const ssrInstanceCache = /* @__PURE__ */ new Map();
function registerSSRInstance(locale, instance) {
  ssrInstanceCache.set(locale, instance);
}
function getSSRInstance(locale) {
  return ssrInstanceCache.get(locale);
}
export {
  getSSRInstance as g,
  registerSSRInstance as r
};
