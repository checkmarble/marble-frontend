function omitUndefined(value) {
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== void 0));
}
export {
  omitUndefined as o
};
