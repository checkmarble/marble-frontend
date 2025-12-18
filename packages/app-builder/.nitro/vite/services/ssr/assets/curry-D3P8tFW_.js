const debounce = ({ delay }, func) => {
  let timer = void 0;
  let active = true;
  const debounced = (...args) => {
    if (active) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        active && func(...args);
        timer = void 0;
      }, delay);
    } else {
      func(...args);
    }
  };
  debounced.isPending = () => {
    return timer !== void 0;
  };
  debounced.cancel = () => {
    active = false;
  };
  debounced.flush = (...args) => func(...args);
  return debounced;
};
export {
  debounce as d
};
