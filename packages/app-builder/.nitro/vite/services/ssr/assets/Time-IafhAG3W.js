import { R as jsxRuntimeExports } from "../server.js";
import { q as useFormatLanguage, t as useFormatDateTime, k as TooltipV2, r as formatDateRelative } from "./format-NPGUXq-g.js";
import { bv as differenceInDays } from "./services-middleware-DR8Hua1Y.js";
var src;
var hasRequiredSrc;
function requireSrc() {
  if (hasRequiredSrc) return src;
  hasRequiredSrc = 1;
  function isUndefined(value) {
    return value === void 0;
  }
  function isNull(value) {
    return value === null;
  }
  function isBoolean(value) {
    return typeof value === "boolean";
  }
  function isObject(value) {
    return value === Object(value);
  }
  function isArray(value) {
    return Array.isArray(value);
  }
  function isDate(value) {
    return value instanceof Date;
  }
  function isBlob(value, isReactNative) {
    return isReactNative ? isObject(value) && !isUndefined(value.uri) : isObject(value) && typeof value.size === "number" && typeof value.type === "string" && typeof value.slice === "function";
  }
  function isFile(value, isReactNative) {
    return isBlob(value, isReactNative) && typeof value.name === "string" && (isObject(value.lastModifiedDate) || typeof value.lastModified === "number");
  }
  function initCfg(value) {
    return isUndefined(value) ? false : value;
  }
  function serialize(obj, cfg, fd, pre) {
    cfg = cfg || {};
    fd = fd || new FormData();
    cfg.indices = initCfg(cfg.indices);
    cfg.nullsAsUndefineds = initCfg(cfg.nullsAsUndefineds);
    cfg.booleansAsIntegers = initCfg(cfg.booleansAsIntegers);
    cfg.allowEmptyArrays = initCfg(cfg.allowEmptyArrays);
    cfg.noAttributesWithArrayNotation = initCfg(
      cfg.noAttributesWithArrayNotation
    );
    cfg.noFilesWithArrayNotation = initCfg(cfg.noFilesWithArrayNotation);
    cfg.dotsForObjectNotation = initCfg(cfg.dotsForObjectNotation);
    const isReactNative = typeof fd.getParts === "function";
    if (isUndefined(obj)) {
      return fd;
    } else if (isNull(obj)) {
      if (!cfg.nullsAsUndefineds) {
        fd.append(pre, "");
      }
    } else if (isBoolean(obj)) {
      if (cfg.booleansAsIntegers) {
        fd.append(pre, obj ? 1 : 0);
      } else {
        fd.append(pre, obj);
      }
    } else if (isArray(obj)) {
      if (obj.length) {
        obj.forEach((value, index) => {
          let key = pre + "[" + (cfg.indices ? index : "") + "]";
          if (cfg.noAttributesWithArrayNotation || cfg.noFilesWithArrayNotation && isFile(value, isReactNative)) {
            key = pre;
          }
          serialize(value, cfg, fd, key);
        });
      } else if (cfg.allowEmptyArrays) {
        fd.append(cfg.noAttributesWithArrayNotation ? pre : pre + "[]", "");
      }
    } else if (isDate(obj)) {
      fd.append(pre, obj.toISOString());
    } else if (isObject(obj) && !isBlob(obj, isReactNative)) {
      Object.keys(obj).forEach((prop) => {
        const value = obj[prop];
        if (isArray(value)) {
          while (prop.length > 2 && prop.lastIndexOf("[]") === prop.length - 2) {
            prop = prop.substring(0, prop.length - 2);
          }
        }
        const key = pre ? cfg.dotsForObjectNotation ? pre + "." + prop : pre + "[" + prop + "]" : prop;
        serialize(value, cfg, fd, key);
      });
    } else {
      fd.append(pre, obj);
    }
    return fd;
  }
  src = {
    serialize
  };
  return src;
}
var srcExports = requireSrc();
const EventTime = ({ time }) => {
  const date = new Date(time);
  const language = useFormatLanguage();
  const formatDateTime = useFormatDateTime();
  const is6daysOld = Math.abs(differenceInDays(/* @__PURE__ */ new Date(), date)) > 6;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipV2.Provider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TooltipV2.Tooltip, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipV2.TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-secondary shrink-0 grow-0 text-xs font-normal", children: formatDateRelative(date, { language }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipV2.TooltipContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xs font-normal", children: formatDateTime(date, {
      timeStyle: is6daysOld ? "short" : void 0,
      dateStyle: is6daysOld ? void 0 : "short"
    }) }) })
  ] }) });
};
export {
  EventTime as E,
  srcExports as s
};
