import { R as jsxRuntimeExports } from "../server.js";
function HiddenInputs(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: Object.entries(props).filter(([_, value]) => value !== void 0).map(([name, value]) => /* @__PURE__ */ jsxRuntimeExports.jsx("input", { hidden: true, readOnly: true, id: name, name, value }, name)) });
}
export {
  HiddenInputs as H
};
