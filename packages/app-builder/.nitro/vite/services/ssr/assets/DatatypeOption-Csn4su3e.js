import { R as jsxRuntimeExports, r as reactExports } from "../server.js";
import { bz as getDataTypeIcon, M } from "./services-middleware-DR8Hua1Y.js";
import { e as Icon } from "./format-NPGUXq-g.js";
const dataTypeOptions = [
  { value: "String", labelKey: "String" },
  { value: "Timestamp", labelKey: "Timestamp" },
  { value: "Float", labelKey: "Number" },
  { value: "Bool", labelKey: "Boolean" },
  { value: "Coords", labelKey: "GPS Coords" },
  { value: "IpAddress", labelKey: "IP Address" }
];
function DatatypeOption({ dataType }) {
  const labelKey = dataTypeOptions.find((opt) => opt.value === dataType)?.labelKey ?? dataType;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DatatypeIcon, { dataType }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: labelKey })
  ] });
}
function DatatypeIcon({ dataType }) {
  const labelKey = dataTypeOptions.find((opt) => opt.value === dataType)?.labelKey;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: " text-grey-secondary bg-grey-background rounded p-sm grid place-items-center", title: labelKey, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: getDataTypeIcon(dataType) ?? "string", className: "size-4" }) });
}
function useDatatypeOptions() {
  return reactExports.useMemo(
    () => dataTypeOptions.map((opt) => ({
      label: /* @__PURE__ */ jsxRuntimeExports.jsx(DatatypeOption, { dataType: opt.value }),
      value: opt.value
    })),
    []
  );
}
function DatatypeToPrimitiveType(dataType) {
  return M(dataType).with("Timestamp", "Timestamp[]", () => "Timestamp").with("String", "String[]", () => "String").with("Float", "Float[]", () => "Float").with("Bool", "Bool[]", () => "Bool").with("Coords", "Coords[]", () => "Coords").with("IpAddress", "IpAddress[]", () => "IpAddress").with("Int", "Int[]", () => "Int").otherwise(() => "String");
}
export {
  DatatypeIcon as D,
  DatatypeToPrimitiveType as a,
  useDatatypeOptions as u
};
