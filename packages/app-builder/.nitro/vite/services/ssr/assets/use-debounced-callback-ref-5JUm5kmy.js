import { S as React } from "../server.js";
function debounce(callback, delay) {
  let timeoutId;
  return ((...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback(...args), delay);
  });
}
function useDebouncedCallbackRef(callback, delay) {
  const callbackRef = React.useRef();
  callbackRef.current = callback;
  const debouncedFn = React.useRef();
  React.useEffect(() => {
    debouncedFn.current = debounce(((...args) => callbackRef.current?.(...args)), delay);
  }, [delay]);
  return React.useMemo(() => ((...args) => debouncedFn.current?.(...args)), []);
}
export {
  useDebouncedCallbackRef as u
};
