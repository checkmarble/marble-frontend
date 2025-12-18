import { r as reactExports } from "../server.js";
function useCallbackRef(callback) {
  const callbackRef = reactExports.useRef();
  callbackRef.current = callback;
  return reactExports.useMemo(() => ((...args) => callbackRef.current?.(...args)), []);
}
export {
  useCallbackRef as u
};
