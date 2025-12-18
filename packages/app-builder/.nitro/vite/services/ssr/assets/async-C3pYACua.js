const isFunction = (value) => {
  return !!(value && value.constructor && value.call && value.apply);
};
const isPromise = (value) => {
  if (!value)
    return false;
  if (!value.then)
    return false;
  if (!isFunction(value.then))
    return false;
  return true;
};
const tryit = (func) => {
  return (...args) => {
    try {
      const result = func(...args);
      if (isPromise(result)) {
        return result.then((value) => [void 0, value]).catch((err) => [err, void 0]);
      }
      return [void 0, result];
    } catch (err) {
      return [err, void 0];
    }
  };
};
export {
  tryit as t
};
