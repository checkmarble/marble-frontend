import { AsyncLocalStorage } from "node:async_hooks";
import { Readable, PassThrough } from "node:stream";
import { ReadableStream as ReadableStream$1 } from "node:stream/web";
import require$$1 from "stream";
import require$$0 from "util";
function _mergeNamespaces(n2, m2) {
  for (var i = 0; i < m2.length; i++) {
    const e = m2[i];
    if (typeof e !== "string" && !Array.isArray(e)) {
      for (const k2 in e) {
        if (k2 !== "default" && !(k2 in n2)) {
          const d = Object.getOwnPropertyDescriptor(e, k2);
          if (d) {
            Object.defineProperty(n2, k2, d.get ? d : {
              enumerable: true,
              get: () => e[k2]
            });
          }
        }
      }
    }
  }
  return Object.freeze(Object.defineProperty(n2, Symbol.toStringTag, { value: "Module" }));
}
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
function getDefaultExportFromCjs(x3) {
  return x3 && x3.__esModule && Object.prototype.hasOwnProperty.call(x3, "default") ? x3["default"] : x3;
}
var react = { exports: {} };
var react_production_min = {};
var hasRequiredReact_production_min;
function requireReact_production_min() {
  if (hasRequiredReact_production_min) return react_production_min;
  hasRequiredReact_production_min = 1;
  var l = /* @__PURE__ */ Symbol.for("react.element"), n2 = /* @__PURE__ */ Symbol.for("react.portal"), p2 = /* @__PURE__ */ Symbol.for("react.fragment"), q2 = /* @__PURE__ */ Symbol.for("react.strict_mode"), r = /* @__PURE__ */ Symbol.for("react.profiler"), t = /* @__PURE__ */ Symbol.for("react.provider"), u = /* @__PURE__ */ Symbol.for("react.context"), v2 = /* @__PURE__ */ Symbol.for("react.forward_ref"), w2 = /* @__PURE__ */ Symbol.for("react.suspense"), x3 = /* @__PURE__ */ Symbol.for("react.memo"), y2 = /* @__PURE__ */ Symbol.for("react.lazy"), z2 = Symbol.iterator;
  function A2(a) {
    if (null === a || "object" !== typeof a) return null;
    a = z2 && a[z2] || a["@@iterator"];
    return "function" === typeof a ? a : null;
  }
  var B2 = { isMounted: function() {
    return false;
  }, enqueueForceUpdate: function() {
  }, enqueueReplaceState: function() {
  }, enqueueSetState: function() {
  } }, C2 = Object.assign, D2 = {};
  function E2(a, b2, e) {
    this.props = a;
    this.context = b2;
    this.refs = D2;
    this.updater = e || B2;
  }
  E2.prototype.isReactComponent = {};
  E2.prototype.setState = function(a, b2) {
    if ("object" !== typeof a && "function" !== typeof a && null != a) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
    this.updater.enqueueSetState(this, a, b2, "setState");
  };
  E2.prototype.forceUpdate = function(a) {
    this.updater.enqueueForceUpdate(this, a, "forceUpdate");
  };
  function F2() {
  }
  F2.prototype = E2.prototype;
  function G(a, b2, e) {
    this.props = a;
    this.context = b2;
    this.refs = D2;
    this.updater = e || B2;
  }
  var H2 = G.prototype = new F2();
  H2.constructor = G;
  C2(H2, E2.prototype);
  H2.isPureReactComponent = true;
  var I2 = Array.isArray, J2 = Object.prototype.hasOwnProperty, K = { current: null }, L2 = { key: true, ref: true, __self: true, __source: true };
  function M2(a, b2, e) {
    var d, c2 = {}, k2 = null, h2 = null;
    if (null != b2) for (d in void 0 !== b2.ref && (h2 = b2.ref), void 0 !== b2.key && (k2 = "" + b2.key), b2) J2.call(b2, d) && !L2.hasOwnProperty(d) && (c2[d] = b2[d]);
    var g = arguments.length - 2;
    if (1 === g) c2.children = e;
    else if (1 < g) {
      for (var f2 = Array(g), m2 = 0; m2 < g; m2++) f2[m2] = arguments[m2 + 2];
      c2.children = f2;
    }
    if (a && a.defaultProps) for (d in g = a.defaultProps, g) void 0 === c2[d] && (c2[d] = g[d]);
    return { $$typeof: l, type: a, key: k2, ref: h2, props: c2, _owner: K.current };
  }
  function N2(a, b2) {
    return { $$typeof: l, type: a.type, key: b2, ref: a.ref, props: a.props, _owner: a._owner };
  }
  function O2(a) {
    return "object" === typeof a && null !== a && a.$$typeof === l;
  }
  function escape(a) {
    var b2 = { "=": "=0", ":": "=2" };
    return "$" + a.replace(/[=:]/g, function(a2) {
      return b2[a2];
    });
  }
  var P2 = /\/+/g;
  function Q2(a, b2) {
    return "object" === typeof a && null !== a && null != a.key ? escape("" + a.key) : b2.toString(36);
  }
  function R2(a, b2, e, d, c2) {
    var k2 = typeof a;
    if ("undefined" === k2 || "boolean" === k2) a = null;
    var h2 = false;
    if (null === a) h2 = true;
    else switch (k2) {
      case "string":
      case "number":
        h2 = true;
        break;
      case "object":
        switch (a.$$typeof) {
          case l:
          case n2:
            h2 = true;
        }
    }
    if (h2) return h2 = a, c2 = c2(h2), a = "" === d ? "." + Q2(h2, 0) : d, I2(c2) ? (e = "", null != a && (e = a.replace(P2, "$&/") + "/"), R2(c2, b2, e, "", function(a2) {
      return a2;
    })) : null != c2 && (O2(c2) && (c2 = N2(c2, e + (!c2.key || h2 && h2.key === c2.key ? "" : ("" + c2.key).replace(P2, "$&/") + "/") + a)), b2.push(c2)), 1;
    h2 = 0;
    d = "" === d ? "." : d + ":";
    if (I2(a)) for (var g = 0; g < a.length; g++) {
      k2 = a[g];
      var f2 = d + Q2(k2, g);
      h2 += R2(k2, b2, e, f2, c2);
    }
    else if (f2 = A2(a), "function" === typeof f2) for (a = f2.call(a), g = 0; !(k2 = a.next()).done; ) k2 = k2.value, f2 = d + Q2(k2, g++), h2 += R2(k2, b2, e, f2, c2);
    else if ("object" === k2) throw b2 = String(a), Error("Objects are not valid as a React child (found: " + ("[object Object]" === b2 ? "object with keys {" + Object.keys(a).join(", ") + "}" : b2) + "). If you meant to render a collection of children, use an array instead.");
    return h2;
  }
  function S(a, b2, e) {
    if (null == a) return a;
    var d = [], c2 = 0;
    R2(a, d, "", "", function(a2) {
      return b2.call(e, a2, c2++);
    });
    return d;
  }
  function T2(a) {
    if (-1 === a._status) {
      var b2 = a._result;
      b2 = b2();
      b2.then(function(b3) {
        if (0 === a._status || -1 === a._status) a._status = 1, a._result = b3;
      }, function(b3) {
        if (0 === a._status || -1 === a._status) a._status = 2, a._result = b3;
      });
      -1 === a._status && (a._status = 0, a._result = b2);
    }
    if (1 === a._status) return a._result.default;
    throw a._result;
  }
  var U2 = { current: null }, V2 = { transition: null }, W2 = { ReactCurrentDispatcher: U2, ReactCurrentBatchConfig: V2, ReactCurrentOwner: K };
  function X2() {
    throw Error("act(...) is not supported in production builds of React.");
  }
  react_production_min.Children = { map: S, forEach: function(a, b2, e) {
    S(a, function() {
      b2.apply(this, arguments);
    }, e);
  }, count: function(a) {
    var b2 = 0;
    S(a, function() {
      b2++;
    });
    return b2;
  }, toArray: function(a) {
    return S(a, function(a2) {
      return a2;
    }) || [];
  }, only: function(a) {
    if (!O2(a)) throw Error("React.Children.only expected to receive a single React element child.");
    return a;
  } };
  react_production_min.Component = E2;
  react_production_min.Fragment = p2;
  react_production_min.Profiler = r;
  react_production_min.PureComponent = G;
  react_production_min.StrictMode = q2;
  react_production_min.Suspense = w2;
  react_production_min.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = W2;
  react_production_min.act = X2;
  react_production_min.cloneElement = function(a, b2, e) {
    if (null === a || void 0 === a) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + a + ".");
    var d = C2({}, a.props), c2 = a.key, k2 = a.ref, h2 = a._owner;
    if (null != b2) {
      void 0 !== b2.ref && (k2 = b2.ref, h2 = K.current);
      void 0 !== b2.key && (c2 = "" + b2.key);
      if (a.type && a.type.defaultProps) var g = a.type.defaultProps;
      for (f2 in b2) J2.call(b2, f2) && !L2.hasOwnProperty(f2) && (d[f2] = void 0 === b2[f2] && void 0 !== g ? g[f2] : b2[f2]);
    }
    var f2 = arguments.length - 2;
    if (1 === f2) d.children = e;
    else if (1 < f2) {
      g = Array(f2);
      for (var m2 = 0; m2 < f2; m2++) g[m2] = arguments[m2 + 2];
      d.children = g;
    }
    return { $$typeof: l, type: a.type, key: c2, ref: k2, props: d, _owner: h2 };
  };
  react_production_min.createContext = function(a) {
    a = { $$typeof: u, _currentValue: a, _currentValue2: a, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null };
    a.Provider = { $$typeof: t, _context: a };
    return a.Consumer = a;
  };
  react_production_min.createElement = M2;
  react_production_min.createFactory = function(a) {
    var b2 = M2.bind(null, a);
    b2.type = a;
    return b2;
  };
  react_production_min.createRef = function() {
    return { current: null };
  };
  react_production_min.forwardRef = function(a) {
    return { $$typeof: v2, render: a };
  };
  react_production_min.isValidElement = O2;
  react_production_min.lazy = function(a) {
    return { $$typeof: y2, _payload: { _status: -1, _result: a }, _init: T2 };
  };
  react_production_min.memo = function(a, b2) {
    return { $$typeof: x3, type: a, compare: void 0 === b2 ? null : b2 };
  };
  react_production_min.startTransition = function(a) {
    var b2 = V2.transition;
    V2.transition = {};
    try {
      a();
    } finally {
      V2.transition = b2;
    }
  };
  react_production_min.unstable_act = X2;
  react_production_min.useCallback = function(a, b2) {
    return U2.current.useCallback(a, b2);
  };
  react_production_min.useContext = function(a) {
    return U2.current.useContext(a);
  };
  react_production_min.useDebugValue = function() {
  };
  react_production_min.useDeferredValue = function(a) {
    return U2.current.useDeferredValue(a);
  };
  react_production_min.useEffect = function(a, b2) {
    return U2.current.useEffect(a, b2);
  };
  react_production_min.useId = function() {
    return U2.current.useId();
  };
  react_production_min.useImperativeHandle = function(a, b2, e) {
    return U2.current.useImperativeHandle(a, b2, e);
  };
  react_production_min.useInsertionEffect = function(a, b2) {
    return U2.current.useInsertionEffect(a, b2);
  };
  react_production_min.useLayoutEffect = function(a, b2) {
    return U2.current.useLayoutEffect(a, b2);
  };
  react_production_min.useMemo = function(a, b2) {
    return U2.current.useMemo(a, b2);
  };
  react_production_min.useReducer = function(a, b2, e) {
    return U2.current.useReducer(a, b2, e);
  };
  react_production_min.useRef = function(a) {
    return U2.current.useRef(a);
  };
  react_production_min.useState = function(a) {
    return U2.current.useState(a);
  };
  react_production_min.useSyncExternalStore = function(a, b2, e) {
    return U2.current.useSyncExternalStore(a, b2, e);
  };
  react_production_min.useTransition = function() {
    return U2.current.useTransition();
  };
  react_production_min.version = "18.3.1";
  return react_production_min;
}
var hasRequiredReact;
function requireReact() {
  if (hasRequiredReact) return react.exports;
  hasRequiredReact = 1;
  {
    react.exports = requireReact_production_min();
  }
  return react.exports;
}
var reactExports = requireReact();
const React = /* @__PURE__ */ getDefaultExportFromCjs(reactExports);
const React$1 = /* @__PURE__ */ _mergeNamespaces({
  __proto__: null,
  default: React
}, [reactExports]);
const isServer = true;
function last(arr) {
  return arr[arr.length - 1];
}
function isFunction(d) {
  return typeof d === "function";
}
function functionalUpdate(updater, previous) {
  if (isFunction(updater)) return updater(previous);
  return updater;
}
const hasOwn = Object.prototype.hasOwnProperty;
function hasKeys(obj) {
  for (const key in obj) if (hasOwn.call(obj, key)) return true;
  return false;
}
const createNull = () => /* @__PURE__ */ Object.create(null);
const nullReplaceEqualDeep = (prev, next) => replaceEqualDeep(prev, next, createNull);
function replaceEqualDeep(prev, _next, _makeObj = () => ({}), _depth = 0) {
  return _next;
}
function isPlainObject(o2) {
  if (!hasObjectPrototype(o2)) return false;
  const ctor = o2.constructor;
  if (typeof ctor === "undefined") return true;
  const prot = ctor.prototype;
  if (!hasObjectPrototype(prot)) return false;
  if (!prot.hasOwnProperty("isPrototypeOf")) return false;
  return true;
}
function hasObjectPrototype(o2) {
  return Object.prototype.toString.call(o2) === "[object Object]";
}
function deepEqual(a, b2, opts) {
  if (a === b2) return true;
  if (typeof a !== typeof b2) return false;
  if (Array.isArray(a) && Array.isArray(b2)) {
    if (a.length !== b2.length) return false;
    for (let i = 0, l = a.length; i < l; i++) if (!deepEqual(a[i], b2[i], opts)) return false;
    return true;
  }
  if (isPlainObject(a) && isPlainObject(b2)) {
    const ignoreUndefined = opts?.ignoreUndefined ?? true;
    if (opts?.partial) {
      for (const k2 in b2) if (!ignoreUndefined || b2[k2] !== void 0) {
        if (!deepEqual(a[k2], b2[k2], opts)) return false;
      }
      return true;
    }
    let aCount = 0;
    if (!ignoreUndefined) aCount = Object.keys(a).length;
    else for (const k2 in a) if (a[k2] !== void 0) aCount++;
    let bCount = 0;
    for (const k2 in b2) if (!ignoreUndefined || b2[k2] !== void 0) {
      bCount++;
      if (bCount > aCount || !deepEqual(a[k2], b2[k2], opts)) return false;
    }
    return aCount === bCount;
  }
  return false;
}
function createControlledPromise(onResolve) {
  let resolveLoadPromise;
  let rejectLoadPromise;
  const controlledPromise = new Promise((resolve, reject) => {
    resolveLoadPromise = resolve;
    rejectLoadPromise = reject;
  });
  controlledPromise.status = "pending";
  controlledPromise.resolve = (value) => {
    controlledPromise.status = "resolved";
    controlledPromise.value = value;
    resolveLoadPromise(value);
    onResolve?.(value);
  };
  controlledPromise.reject = (e) => {
    controlledPromise.status = "rejected";
    rejectLoadPromise(e);
  };
  return controlledPromise;
}
function isModuleNotFoundError(error) {
  if (typeof error?.message !== "string") return false;
  return error.message.startsWith("Failed to fetch dynamically imported module") || error.message.startsWith("error loading dynamically imported module") || error.message.startsWith("Importing a module script failed");
}
function isPromise(value) {
  return Boolean(value && typeof value === "object" && typeof value.then === "function");
}
function sanitizePathSegment(segment) {
  return segment.replace(/[\x00-\x1f\x7f]/g, "");
}
function decodeSegment(segment) {
  let decoded;
  try {
    decoded = decodeURI(segment);
  } catch {
    decoded = segment.replaceAll(/%[0-9A-F]{2}/gi, (match) => {
      try {
        return decodeURI(match);
      } catch {
        return match;
      }
    });
  }
  return sanitizePathSegment(decoded);
}
const DEFAULT_PROTOCOL_ALLOWLIST = [
  "http:",
  "https:",
  "mailto:",
  "tel:"
];
function isDangerousProtocol(url, allowlist) {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return !allowlist.has(parsed.protocol);
  } catch {
    return false;
  }
}
const HTML_ESCAPE_LOOKUP = {
  "&": "\\u0026",
  ">": "\\u003e",
  "<": "\\u003c",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
const HTML_ESCAPE_REGEX = /[&><\u2028\u2029]/g;
function escapeHtml(str) {
  return str.replace(HTML_ESCAPE_REGEX, (match) => HTML_ESCAPE_LOOKUP[match]);
}
function decodePath(path) {
  if (!path) return {
    path,
    handledProtocolRelativeURL: false
  };
  if (!/[%\\\x00-\x1f\x7f]/.test(path) && !path.startsWith("//")) return {
    path,
    handledProtocolRelativeURL: false
  };
  const re2 = /%25|%5C/gi;
  let cursor = 0;
  let result = "";
  let match;
  while (null !== (match = re2.exec(path))) {
    result += decodeSegment(path.slice(cursor, match.index)) + match[0];
    cursor = re2.lastIndex;
  }
  result = result + decodeSegment(cursor ? path.slice(cursor) : path);
  let handledProtocolRelativeURL = false;
  if (result.startsWith("//")) {
    handledProtocolRelativeURL = true;
    result = "/" + result.replace(/^\/+/, "");
  }
  return {
    path: result,
    handledProtocolRelativeURL
  };
}
function encodePathLikeUrl(path) {
  if (!/\s|[^\u0000-\u007F]/.test(path)) return path;
  return path.replace(/\s|[^\u0000-\u007F]/gu, encodeURIComponent);
}
function arraysEqual(a, b2) {
  if (a === b2) return true;
  if (a.length !== b2.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b2[i]) return false;
  return true;
}
function invariant() {
  throw new Error("Invariant failed");
}
function createLRUCache(max) {
  const cache = /* @__PURE__ */ new Map();
  let oldest;
  let newest;
  const touch = (entry) => {
    if (!entry.next) return;
    if (!entry.prev) {
      entry.next.prev = void 0;
      oldest = entry.next;
      entry.next = void 0;
      if (newest) {
        entry.prev = newest;
        newest.next = entry;
      }
    } else {
      entry.prev.next = entry.next;
      entry.next.prev = entry.prev;
      entry.next = void 0;
      if (newest) {
        newest.next = entry;
        entry.prev = newest;
      }
    }
    newest = entry;
  };
  return {
    get(key) {
      const entry = cache.get(key);
      if (!entry) return void 0;
      touch(entry);
      return entry.value;
    },
    set(key, value) {
      if (cache.size >= max && oldest) {
        const toDelete = oldest;
        cache.delete(toDelete.key);
        if (toDelete.next) {
          oldest = toDelete.next;
          toDelete.next.prev = void 0;
        }
        if (toDelete === newest) newest = void 0;
      }
      const existing = cache.get(key);
      if (existing) {
        existing.value = value;
        touch(existing);
      } else {
        const entry = {
          key,
          value,
          prev: newest
        };
        if (newest) newest.next = entry;
        newest = entry;
        if (!oldest) oldest = entry;
        cache.set(key, entry);
      }
    },
    clear() {
      cache.clear();
      oldest = void 0;
      newest = void 0;
    }
  };
}
const SEGMENT_TYPE_INDEX = 4;
const SEGMENT_TYPE_PATHLESS = 5;
function getOpenAndCloseBraces(part) {
  const openBrace = part.indexOf("{");
  if (openBrace === -1) return null;
  const closeBrace = part.indexOf("}", openBrace);
  if (closeBrace === -1) return null;
  if (openBrace + 1 >= part.length) return null;
  return [openBrace, closeBrace];
}
function parseSegment(path, start, output = new Uint16Array(6)) {
  const next = path.indexOf("/", start);
  const end = next === -1 ? path.length : next;
  const part = path.substring(start, end);
  if (!part || !part.includes("$")) {
    output[0] = 0;
    output[1] = start;
    output[2] = start;
    output[3] = end;
    output[4] = end;
    output[5] = end;
    return output;
  }
  if (part === "$") {
    const total = path.length;
    output[0] = 2;
    output[1] = start;
    output[2] = start;
    output[3] = total;
    output[4] = total;
    output[5] = total;
    return output;
  }
  if (part.charCodeAt(0) === 36) {
    output[0] = 1;
    output[1] = start;
    output[2] = start + 1;
    output[3] = end;
    output[4] = end;
    output[5] = end;
    return output;
  }
  const braces = getOpenAndCloseBraces(part);
  if (braces) {
    const [openBrace, closeBrace] = braces;
    const firstChar = part.charCodeAt(openBrace + 1);
    if (firstChar === 45) {
      if (openBrace + 2 < part.length && part.charCodeAt(openBrace + 2) === 36) {
        const paramStart = openBrace + 3;
        const paramEnd = closeBrace;
        if (paramStart < paramEnd) {
          output[0] = 3;
          output[1] = start + openBrace;
          output[2] = start + paramStart;
          output[3] = start + paramEnd;
          output[4] = start + closeBrace + 1;
          output[5] = end;
          return output;
        }
      }
    } else if (firstChar === 36) {
      const dollarPos = openBrace + 1;
      const afterDollar = openBrace + 2;
      if (afterDollar === closeBrace) {
        output[0] = 2;
        output[1] = start + openBrace;
        output[2] = start + dollarPos;
        output[3] = start + afterDollar;
        output[4] = start + closeBrace + 1;
        output[5] = path.length;
        return output;
      }
      output[0] = 1;
      output[1] = start + openBrace;
      output[2] = start + afterDollar;
      output[3] = start + closeBrace;
      output[4] = start + closeBrace + 1;
      output[5] = end;
      return output;
    }
  }
  output[0] = 0;
  output[1] = start;
  output[2] = start;
  output[3] = end;
  output[4] = end;
  output[5] = end;
  return output;
}
function parseSegments(defaultCaseSensitive, data, route, start, node, depth, onRoute) {
  onRoute?.(route);
  let cursor = start;
  {
    const path = route.fullPath ?? route.from;
    const length = path.length;
    const caseSensitive = route.options?.caseSensitive ?? defaultCaseSensitive;
    const parseParams = route.options?.params?.parse ?? route.options?.parseParams;
    while (cursor < length) {
      const segment = parseSegment(path, cursor, data);
      let nextNode;
      const start2 = cursor;
      const end = segment[5];
      cursor = end + 1;
      depth++;
      switch (segment[0]) {
        case 0: {
          const value = path.substring(segment[2], segment[3]);
          if (caseSensitive) {
            const existingNode = node.static?.get(value);
            if (existingNode) nextNode = existingNode;
            else {
              node.static ??= /* @__PURE__ */ new Map();
              const next = createStaticNode(route.fullPath ?? route.from);
              next.parent = node;
              next.depth = depth;
              nextNode = next;
              node.static.set(value, next);
            }
          } else {
            const name = value.toLowerCase();
            const existingNode = node.staticInsensitive?.get(name);
            if (existingNode) nextNode = existingNode;
            else {
              node.staticInsensitive ??= /* @__PURE__ */ new Map();
              const next = createStaticNode(route.fullPath ?? route.from);
              next.parent = node;
              next.depth = depth;
              nextNode = next;
              node.staticInsensitive.set(name, next);
            }
          }
          break;
        }
        case 1: {
          const prefix_raw = path.substring(start2, segment[1]);
          const suffix_raw = path.substring(segment[4], end);
          const actuallyCaseSensitive = caseSensitive && !!(prefix_raw || suffix_raw);
          const prefix = !prefix_raw ? void 0 : actuallyCaseSensitive ? prefix_raw : prefix_raw.toLowerCase();
          const suffix = !suffix_raw ? void 0 : actuallyCaseSensitive ? suffix_raw : suffix_raw.toLowerCase();
          const existingNode = !parseParams && node.dynamic?.find((s) => !s.parse && s.caseSensitive === actuallyCaseSensitive && s.prefix === prefix && s.suffix === suffix);
          if (existingNode) nextNode = existingNode;
          else {
            const next = createDynamicNode(1, route.fullPath ?? route.from, actuallyCaseSensitive, prefix, suffix);
            nextNode = next;
            next.depth = depth;
            next.parent = node;
            node.dynamic ??= [];
            node.dynamic.push(next);
          }
          break;
        }
        case 3: {
          const prefix_raw = path.substring(start2, segment[1]);
          const suffix_raw = path.substring(segment[4], end);
          const actuallyCaseSensitive = caseSensitive && !!(prefix_raw || suffix_raw);
          const prefix = !prefix_raw ? void 0 : actuallyCaseSensitive ? prefix_raw : prefix_raw.toLowerCase();
          const suffix = !suffix_raw ? void 0 : actuallyCaseSensitive ? suffix_raw : suffix_raw.toLowerCase();
          const existingNode = !parseParams && node.optional?.find((s) => !s.parse && s.caseSensitive === actuallyCaseSensitive && s.prefix === prefix && s.suffix === suffix);
          if (existingNode) nextNode = existingNode;
          else {
            const next = createDynamicNode(3, route.fullPath ?? route.from, actuallyCaseSensitive, prefix, suffix);
            nextNode = next;
            next.parent = node;
            next.depth = depth;
            node.optional ??= [];
            node.optional.push(next);
          }
          break;
        }
        case 2: {
          const prefix_raw = path.substring(start2, segment[1]);
          const suffix_raw = path.substring(segment[4], end);
          const actuallyCaseSensitive = caseSensitive && !!(prefix_raw || suffix_raw);
          const prefix = !prefix_raw ? void 0 : actuallyCaseSensitive ? prefix_raw : prefix_raw.toLowerCase();
          const suffix = !suffix_raw ? void 0 : actuallyCaseSensitive ? suffix_raw : suffix_raw.toLowerCase();
          const next = createDynamicNode(2, route.fullPath ?? route.from, actuallyCaseSensitive, prefix, suffix);
          nextNode = next;
          next.parent = node;
          next.depth = depth;
          node.wildcard ??= [];
          node.wildcard.push(next);
        }
      }
      node = nextNode;
    }
    if (parseParams && route.children && !route.isRoot && route.id && route.id.charCodeAt(route.id.lastIndexOf("/") + 1) === 95) {
      const pathlessNode = createStaticNode(route.fullPath ?? route.from);
      pathlessNode.kind = SEGMENT_TYPE_PATHLESS;
      pathlessNode.parent = node;
      depth++;
      pathlessNode.depth = depth;
      node.pathless ??= [];
      node.pathless.push(pathlessNode);
      node = pathlessNode;
    }
    const isLeaf = (route.path || !route.children) && !route.isRoot;
    if (isLeaf && path.endsWith("/")) {
      const indexNode = createStaticNode(route.fullPath ?? route.from);
      indexNode.kind = SEGMENT_TYPE_INDEX;
      indexNode.parent = node;
      depth++;
      indexNode.depth = depth;
      node.index = indexNode;
      node = indexNode;
    }
    node.parse = parseParams ?? null;
    node.priority = route.options?.params?.priority ?? 0;
    if (isLeaf && !node.route) {
      node.route = route;
      node.fullPath = route.fullPath ?? route.from;
    }
  }
  if (route.children) for (const child of route.children) parseSegments(defaultCaseSensitive, data, child, cursor, node, depth, onRoute);
}
function sortDynamic(a, b2) {
  if (a.parse && !b2.parse) return -1;
  if (!a.parse && b2.parse) return 1;
  if (a.parse && b2.parse && (a.priority || b2.priority)) return b2.priority - a.priority;
  if (a.prefix && b2.prefix && a.prefix !== b2.prefix) {
    if (a.prefix.startsWith(b2.prefix)) return -1;
    if (b2.prefix.startsWith(a.prefix)) return 1;
  }
  if (a.suffix && b2.suffix && a.suffix !== b2.suffix) {
    if (a.suffix.endsWith(b2.suffix)) return -1;
    if (b2.suffix.endsWith(a.suffix)) return 1;
  }
  if (a.prefix && !b2.prefix) return -1;
  if (!a.prefix && b2.prefix) return 1;
  if (a.suffix && !b2.suffix) return -1;
  if (!a.suffix && b2.suffix) return 1;
  if (a.caseSensitive && !b2.caseSensitive) return -1;
  if (!a.caseSensitive && b2.caseSensitive) return 1;
  return 0;
}
function sortTreeNodes(node) {
  if (node.pathless) for (const child of node.pathless) sortTreeNodes(child);
  if (node.static) for (const child of node.static.values()) sortTreeNodes(child);
  if (node.staticInsensitive) for (const child of node.staticInsensitive.values()) sortTreeNodes(child);
  if (node.dynamic?.length) {
    node.dynamic.sort(sortDynamic);
    for (const child of node.dynamic) sortTreeNodes(child);
  }
  if (node.optional?.length) {
    node.optional.sort(sortDynamic);
    for (const child of node.optional) sortTreeNodes(child);
  }
  if (node.wildcard?.length) {
    node.wildcard.sort(sortDynamic);
    for (const child of node.wildcard) sortTreeNodes(child);
  }
}
function createStaticNode(fullPath) {
  return {
    kind: 0,
    depth: 0,
    pathless: null,
    index: null,
    static: null,
    staticInsensitive: null,
    dynamic: null,
    optional: null,
    wildcard: null,
    route: null,
    fullPath,
    parent: null,
    parse: null,
    priority: 0
  };
}
function createDynamicNode(kind, fullPath, caseSensitive, prefix, suffix) {
  return {
    kind,
    depth: 0,
    pathless: null,
    index: null,
    static: null,
    staticInsensitive: null,
    dynamic: null,
    optional: null,
    wildcard: null,
    route: null,
    fullPath,
    parent: null,
    parse: null,
    priority: 0,
    caseSensitive,
    prefix,
    suffix
  };
}
function processRouteMasks(routeList, processedTree) {
  const segmentTree = createStaticNode("/");
  const data = new Uint16Array(6);
  for (const route of routeList) parseSegments(false, data, route, 1, segmentTree, 0);
  sortTreeNodes(segmentTree);
  processedTree.masksTree = segmentTree;
  processedTree.flatCache = createLRUCache(1e3);
}
function findFlatMatch(path, processedTree) {
  path ||= "/";
  const cached = processedTree.flatCache.get(path);
  if (cached) return cached;
  const result = findMatch(path, processedTree.masksTree);
  processedTree.flatCache.set(path, result);
  return result;
}
function findSingleMatch(from, caseSensitive, fuzzy, path, processedTree) {
  from ||= "/";
  path ||= "/";
  const key = caseSensitive ? `case\0${from}` : from;
  let tree = processedTree.singleCache.get(key);
  if (!tree) {
    tree = createStaticNode("/");
    parseSegments(caseSensitive, new Uint16Array(6), { from }, 1, tree, 0);
    processedTree.singleCache.set(key, tree);
  }
  return findMatch(path, tree, fuzzy);
}
function findRouteMatch(path, processedTree, fuzzy = false) {
  const key = fuzzy ? path : `nofuzz\0${path}`;
  const cached = processedTree.matchCache.get(key);
  if (cached !== void 0) return cached;
  path ||= "/";
  let result;
  try {
    result = findMatch(path, processedTree.segmentTree, fuzzy);
  } catch (err) {
    if (err instanceof URIError) result = null;
    else throw err;
  }
  if (result) result.branch = buildRouteBranch(result.route);
  processedTree.matchCache.set(key, result);
  return result;
}
function trimPathRight$1(path) {
  return path === "/" ? path : path.replace(/\/{1,}$/, "");
}
function processRouteTree(routeTree, caseSensitive = false, initRoute) {
  const segmentTree = createStaticNode(routeTree.fullPath);
  const data = new Uint16Array(6);
  const routesById = {};
  const routesByPath = {};
  let index = 0;
  parseSegments(caseSensitive, data, routeTree, 1, segmentTree, 0, (route) => {
    initRoute?.(route, index);
    if (route.id in routesById) {
      invariant();
    }
    routesById[route.id] = route;
    if (index !== 0 && route.path) {
      const trimmedFullPath = trimPathRight$1(route.fullPath);
      if (!routesByPath[trimmedFullPath] || route.fullPath.endsWith("/")) routesByPath[trimmedFullPath] = route;
    }
    index++;
  });
  sortTreeNodes(segmentTree);
  return {
    processedTree: {
      segmentTree,
      singleCache: createLRUCache(1e3),
      matchCache: createLRUCache(1e3),
      flatCache: null,
      masksTree: null
    },
    routesById,
    routesByPath
  };
}
function findMatch(path, segmentTree, fuzzy = false) {
  const parts = path.split("/");
  const leaf = getNodeMatch(path, parts, segmentTree, fuzzy);
  if (!leaf) return null;
  const [rawParams] = extractParams(path, parts, leaf);
  return {
    route: leaf.node.route,
    rawParams
  };
}
function extractParams(path, parts, leaf) {
  const list = buildBranch(leaf.node);
  let nodeParts = null;
  const rawParams = /* @__PURE__ */ Object.create(null);
  let partIndex = leaf.extract?.part ?? 0;
  let nodeIndex = leaf.extract?.node ?? 0;
  let pathIndex = leaf.extract?.path ?? 0;
  let segmentCount = leaf.extract?.segment ?? 0;
  for (; nodeIndex < list.length; partIndex++, nodeIndex++, pathIndex++, segmentCount++) {
    const node = list[nodeIndex];
    if (node.kind === SEGMENT_TYPE_INDEX) break;
    if (node.kind === SEGMENT_TYPE_PATHLESS) {
      segmentCount--;
      partIndex--;
      pathIndex--;
      continue;
    }
    const part = parts[partIndex];
    const currentPathIndex = pathIndex;
    if (part) pathIndex += part.length;
    if (node.kind === 1) {
      nodeParts ??= leaf.node.fullPath.split("/");
      const nodePart = nodeParts[segmentCount];
      const preLength = node.prefix?.length ?? 0;
      if (nodePart.charCodeAt(preLength) === 123) {
        const sufLength = node.suffix?.length ?? 0;
        const name = nodePart.substring(preLength + 2, nodePart.length - sufLength - 1);
        const value = part.substring(preLength, part.length - sufLength);
        rawParams[name] = decodeURIComponent(value);
      } else {
        const name = nodePart.substring(1);
        rawParams[name] = decodeURIComponent(part);
      }
    } else if (node.kind === 3) {
      if (leaf.skipped & 1 << nodeIndex) {
        partIndex--;
        pathIndex = currentPathIndex - 1;
        continue;
      }
      nodeParts ??= leaf.node.fullPath.split("/");
      const nodePart = nodeParts[segmentCount];
      const preLength = node.prefix?.length ?? 0;
      const sufLength = node.suffix?.length ?? 0;
      const name = nodePart.substring(preLength + 3, nodePart.length - sufLength - 1);
      const value = node.suffix || node.prefix ? part.substring(preLength, part.length - sufLength) : part;
      if (value) rawParams[name] = decodeURIComponent(value);
    } else if (node.kind === 2) {
      const n2 = node;
      const value = path.substring(currentPathIndex + (n2.prefix?.length ?? 0), path.length - (n2.suffix?.length ?? 0));
      const splat = decodeURIComponent(value);
      rawParams["*"] = splat;
      rawParams._splat = splat;
      break;
    }
  }
  if (leaf.rawParams) Object.assign(rawParams, leaf.rawParams);
  return [rawParams, {
    part: partIndex,
    node: nodeIndex,
    path: pathIndex,
    segment: segmentCount
  }];
}
function buildRouteBranch(route) {
  const list = [route];
  while (route.parentRoute) {
    route = route.parentRoute;
    list.push(route);
  }
  list.reverse();
  return list;
}
function buildBranch(node) {
  const list = Array(node.depth + 1);
  do {
    list[node.depth] = node;
    node = node.parent;
  } while (node);
  return list;
}
function getNodeMatch(path, parts, segmentTree, fuzzy) {
  if (path === "/" && segmentTree.index) return {
    node: segmentTree.index,
    skipped: 0
  };
  const trailingSlash = !last(parts);
  const pathIsIndex = trailingSlash && path !== "/";
  const partsLength = parts.length - (trailingSlash ? 1 : 0);
  const stack = [{
    node: segmentTree,
    index: 1,
    skipped: 0,
    depth: 1,
    statics: 0,
    dynamics: 0,
    optionals: 0
  }];
  let bestFuzzy = null;
  let bestMatch = null;
  while (stack.length) {
    const frame = stack.pop();
    const { node, index, skipped, depth, statics, dynamics, optionals } = frame;
    let { extract, rawParams } = frame;
    if (node.kind === 2 && node.route && !isFrameMoreSpecific(bestMatch, frame)) continue;
    if (node.parse) {
      if (!validateParseParams(path, parts, frame)) continue;
      rawParams = frame.rawParams;
      extract = frame.extract;
    }
    if (fuzzy && node.route && node.kind !== SEGMENT_TYPE_INDEX && isFrameMoreSpecific(bestFuzzy, frame)) bestFuzzy = frame;
    const isBeyondPath = index === partsLength;
    if (isBeyondPath) {
      if (node.route && (!pathIsIndex || node.kind === SEGMENT_TYPE_INDEX || node.kind === 2) && isFrameMoreSpecific(bestMatch, frame)) bestMatch = frame;
      if (!node.optional && !node.wildcard && !node.index && !node.pathless) continue;
    }
    const part = isBeyondPath ? void 0 : parts[index];
    let lowerPart;
    if (isBeyondPath && node.index) {
      const indexFrame = {
        node: node.index,
        index,
        skipped,
        depth: depth + 1,
        statics,
        dynamics,
        optionals,
        extract,
        rawParams
      };
      let indexValid = true;
      if (node.index.parse) {
        if (!validateParseParams(path, parts, indexFrame)) indexValid = false;
      }
      if (indexValid) {
        if (!dynamics && !optionals && !skipped && isPerfectStaticMatch(statics, partsLength)) return indexFrame;
        if (isFrameMoreSpecific(bestMatch, indexFrame)) bestMatch = indexFrame;
      }
    }
    if (node.wildcard) for (let i = node.wildcard.length - 1; i >= 0; i--) {
      const segment = node.wildcard[i];
      const { prefix, suffix } = segment;
      if (prefix) {
        if (isBeyondPath) continue;
        if (!(segment.caseSensitive ? part : lowerPart ??= part.toLowerCase()).startsWith(prefix)) continue;
      }
      if (suffix) {
        if (isBeyondPath) continue;
        const end = parts.slice(index).join("/").slice(-suffix.length);
        if ((segment.caseSensitive ? end : end.toLowerCase()) !== suffix) continue;
      }
      stack.push({
        node: segment,
        index: partsLength,
        skipped,
        depth: depth + 1,
        statics,
        dynamics,
        optionals,
        extract,
        rawParams
      });
    }
    if (node.optional) {
      const nextSkipped = skipped | 1 << depth;
      const nextDepth = depth + 1;
      for (let i = node.optional.length - 1; i >= 0; i--) {
        const segment = node.optional[i];
        stack.push({
          node: segment,
          index,
          skipped: nextSkipped,
          depth: nextDepth,
          statics,
          dynamics,
          optionals,
          extract,
          rawParams
        });
      }
      if (!isBeyondPath) for (let i = node.optional.length - 1; i >= 0; i--) {
        const segment = node.optional[i];
        const { prefix, suffix } = segment;
        if (prefix || suffix) {
          const casePart = segment.caseSensitive ? part : lowerPart ??= part.toLowerCase();
          if (prefix && !casePart.startsWith(prefix)) continue;
          if (suffix && !casePart.endsWith(suffix)) continue;
        }
        stack.push({
          node: segment,
          index: index + 1,
          skipped,
          depth: nextDepth,
          statics,
          dynamics,
          optionals: optionals + segmentScore(partsLength, index),
          extract,
          rawParams
        });
      }
    }
    if (!isBeyondPath && node.dynamic && part) for (let i = node.dynamic.length - 1; i >= 0; i--) {
      const segment = node.dynamic[i];
      const { prefix, suffix } = segment;
      if (prefix || suffix) {
        const casePart = segment.caseSensitive ? part : lowerPart ??= part.toLowerCase();
        if (prefix && !casePart.startsWith(prefix)) continue;
        if (suffix && !casePart.endsWith(suffix)) continue;
      }
      stack.push({
        node: segment,
        index: index + 1,
        skipped,
        depth: depth + 1,
        statics,
        dynamics: dynamics + segmentScore(partsLength, index),
        optionals,
        extract,
        rawParams
      });
    }
    if (!isBeyondPath && node.staticInsensitive) {
      const match = node.staticInsensitive.get(lowerPart ??= part.toLowerCase());
      if (match) stack.push({
        node: match,
        index: index + 1,
        skipped,
        depth: depth + 1,
        statics: statics + segmentScore(partsLength, index),
        dynamics,
        optionals,
        extract,
        rawParams
      });
    }
    if (!isBeyondPath && node.static) {
      const match = node.static.get(part);
      if (match) stack.push({
        node: match,
        index: index + 1,
        skipped,
        depth: depth + 1,
        statics: statics + segmentScore(partsLength, index),
        dynamics,
        optionals,
        extract,
        rawParams
      });
    }
    if (node.pathless) {
      const nextDepth = depth + 1;
      for (let i = node.pathless.length - 1; i >= 0; i--) {
        const segment = node.pathless[i];
        stack.push({
          node: segment,
          index,
          skipped,
          depth: nextDepth,
          statics,
          dynamics,
          optionals,
          extract,
          rawParams
        });
      }
    }
  }
  if (bestMatch) return bestMatch;
  if (fuzzy && bestFuzzy) {
    let sliceIndex = bestFuzzy.index;
    for (let i = 0; i < bestFuzzy.index; i++) sliceIndex += parts[i].length;
    const splat = sliceIndex === path.length ? "/" : path.slice(sliceIndex);
    bestFuzzy.rawParams ??= /* @__PURE__ */ Object.create(null);
    bestFuzzy.rawParams["**"] = decodeURIComponent(splat);
    return bestFuzzy;
  }
  return null;
}
function segmentScore(partsLength, index) {
  return 2 ** (partsLength - index - 1);
}
function isPerfectStaticMatch(statics, partsLength) {
  return statics === 2 ** (partsLength - 1) - 1;
}
function validateParseParams(path, parts, frame) {
  let rawParams;
  let state;
  try {
    [rawParams, state] = extractParams(path, parts, frame);
  } catch {
    return null;
  }
  frame.rawParams = rawParams;
  frame.extract = state;
  if (!frame.node.parse) return true;
  try {
    if (frame.node.parse(rawParams) === false) return null;
  } catch {
  }
  return true;
}
function isFrameMoreSpecific(prev, next) {
  if (!prev) return true;
  return next.statics > prev.statics || next.statics === prev.statics && (next.dynamics > prev.dynamics || next.dynamics === prev.dynamics && (next.optionals > prev.optionals || next.optionals === prev.optionals && ((next.node.kind === SEGMENT_TYPE_INDEX) > (prev.node.kind === SEGMENT_TYPE_INDEX) || next.node.kind === SEGMENT_TYPE_INDEX === (prev.node.kind === SEGMENT_TYPE_INDEX) && next.depth > prev.depth)));
}
function joinPaths(paths) {
  return cleanPath(paths.filter((val) => {
    return val !== void 0;
  }).join("/"));
}
function cleanPath(path) {
  return path.replace(/\/{2,}/g, "/");
}
function trimPathLeft(path) {
  return path === "/" ? path : path.replace(/^\/{1,}/, "");
}
function trimPathRight(path) {
  const len = path.length;
  return len > 1 && path[len - 1] === "/" ? path.replace(/\/{1,}$/, "") : path;
}
function trimPath(path) {
  return trimPathRight(trimPathLeft(path));
}
function removeTrailingSlash(value, basepath) {
  if (value?.endsWith("/") && value !== "/" && value !== `${basepath}/`) return value.slice(0, -1);
  return value;
}
function exactPathTest(pathName1, pathName2, basepath) {
  return removeTrailingSlash(pathName1, basepath) === removeTrailingSlash(pathName2, basepath);
}
function resolvePath({ base, to: to2, trailingSlash = "never", cache }) {
  const isAbsolute = to2.startsWith("/");
  const isBase = !isAbsolute && to2 === ".";
  let key;
  if (cache) {
    key = isAbsolute ? to2 : isBase ? base : base + "\0" + to2;
    const cached = cache.get(key);
    if (cached) return cached;
  }
  let baseSegments;
  if (isBase) baseSegments = base.split("/");
  else if (isAbsolute) baseSegments = to2.split("/");
  else {
    baseSegments = base.split("/");
    while (baseSegments.length > 1 && last(baseSegments) === "") baseSegments.pop();
    const toSegments = to2.split("/");
    for (let index = 0, length = toSegments.length; index < length; index++) {
      const value = toSegments[index];
      if (value === "") {
        if (!index) baseSegments = [value];
        else if (index === length - 1) baseSegments.push(value);
      } else if (value === "..") baseSegments.pop();
      else if (value === ".") ;
      else baseSegments.push(value);
    }
  }
  if (baseSegments.length > 1) {
    if (last(baseSegments) === "") {
      if (trailingSlash === "never") baseSegments.pop();
    } else if (trailingSlash === "always") baseSegments.push("");
  }
  const result = cleanPath(baseSegments.join("/")) || "/";
  if (key && cache) cache.set(key, result);
  return result;
}
function compileDecodeCharMap(pathParamsAllowedCharacters) {
  const charMap = new Map(pathParamsAllowedCharacters.map((char) => [encodeURIComponent(char), char]));
  const pattern2 = Array.from(charMap.keys()).map((key) => key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const regex = new RegExp(pattern2, "g");
  return (encoded) => encoded.replace(regex, (match) => charMap.get(match) ?? match);
}
function encodeParam(key, params, decoder) {
  const value = params[key];
  if (typeof value !== "string") return value;
  if (key === "_splat") {
    if (/^[a-zA-Z0-9\-._~!/]*$/.test(value)) return value;
    return value.split("/").map((segment) => encodePathParam(segment, decoder)).join("/");
  } else return encodePathParam(value, decoder);
}
function interpolatePath({ path, params, decoder, ...rest }) {
  let isMissingParams = false;
  const usedParams = /* @__PURE__ */ Object.create(null);
  if (!path || path === "/") return {
    interpolatedPath: "/",
    usedParams,
    isMissingParams
  };
  if (!path.includes("$")) return {
    interpolatedPath: path,
    usedParams,
    isMissingParams
  };
  {
    if (path.indexOf("{") === -1) {
      const length2 = path.length;
      let cursor2 = 0;
      let joined2 = "";
      while (cursor2 < length2) {
        while (cursor2 < length2 && path.charCodeAt(cursor2) === 47) cursor2++;
        if (cursor2 >= length2) break;
        const start = cursor2;
        let end = path.indexOf("/", cursor2);
        if (end === -1) end = length2;
        cursor2 = end;
        const part = path.substring(start, end);
        if (!part) continue;
        if (part.charCodeAt(0) === 36) if (part.length === 1) {
          const splat = params._splat;
          usedParams._splat = splat;
          usedParams["*"] = splat;
          if (!splat) {
            isMissingParams = true;
            continue;
          }
          const value = encodeParam("_splat", params, decoder);
          joined2 += "/" + value;
        } else {
          const key = part.substring(1);
          if (!isMissingParams && !(key in params)) isMissingParams = true;
          usedParams[key] = params[key];
          const value = encodeParam(key, params, decoder) ?? "undefined";
          joined2 += "/" + value;
        }
        else joined2 += "/" + part;
      }
      if (path.endsWith("/")) joined2 += "/";
      return {
        usedParams,
        interpolatedPath: joined2 || "/",
        isMissingParams
      };
    }
  }
  const length = path.length;
  let cursor = 0;
  let segment;
  let joined = "";
  while (cursor < length) {
    const start = cursor;
    segment = parseSegment(path, start, segment);
    const end = segment[5];
    cursor = end + 1;
    if (start === end) continue;
    const kind = segment[0];
    if (kind === 0) {
      joined += "/" + path.substring(start, end);
      continue;
    }
    if (kind === 2) {
      const splat = params._splat;
      usedParams._splat = splat;
      usedParams["*"] = splat;
      const prefix = path.substring(start, segment[1]);
      const suffix = path.substring(segment[4], end);
      if (!splat) {
        isMissingParams = true;
        if (prefix || suffix) joined += "/" + prefix + suffix;
        continue;
      }
      const value = encodeParam("_splat", params, decoder);
      joined += "/" + prefix + value + suffix;
      continue;
    }
    if (kind === 1) {
      const key = path.substring(segment[2], segment[3]);
      if (!isMissingParams && !(key in params)) isMissingParams = true;
      usedParams[key] = params[key];
      const prefix = path.substring(start, segment[1]);
      const suffix = path.substring(segment[4], end);
      const value = encodeParam(key, params, decoder) ?? "undefined";
      joined += "/" + prefix + value + suffix;
      continue;
    }
    if (kind === 3) {
      const key = path.substring(segment[2], segment[3]);
      const valueRaw = params[key];
      if (valueRaw == null) continue;
      usedParams[key] = valueRaw;
      const prefix = path.substring(start, segment[1]);
      const suffix = path.substring(segment[4], end);
      const value = encodeParam(key, params, decoder) ?? "";
      joined += "/" + prefix + value + suffix;
      continue;
    }
  }
  if (path.endsWith("/")) joined += "/";
  return {
    usedParams,
    interpolatedPath: joined || "/",
    isMissingParams
  };
}
function encodePathParam(value, decoder) {
  const encoded = encodeURIComponent(value);
  return decoder?.(encoded) ?? encoded;
}
function notFound(options = {}) {
  options.isNotFound = true;
  if (options.throw) throw options;
  return options;
}
function isNotFound(obj) {
  return obj?.isNotFound === true;
}
const rootRouteId = "__root__";
function redirect(opts) {
  opts.statusCode = opts.statusCode || opts.code || 307;
  if (!opts._builtLocation && !opts.reloadDocument && typeof opts.href === "string") try {
    new URL(opts.href);
    opts.reloadDocument = true;
  } catch {
  }
  const headers = new Headers(opts.headers);
  if (opts.href && headers.get("Location") === null) headers.set("Location", opts.href);
  const response = new Response(null, {
    status: opts.statusCode,
    headers
  });
  response.options = opts;
  if (opts.throw) throw response;
  return response;
}
function isRedirect(obj) {
  return obj instanceof Response && !!obj.options;
}
function isResolvedRedirect(obj) {
  return isRedirect(obj) && !!obj.options.href;
}
function parseRedirect(obj) {
  if (obj !== null && typeof obj === "object" && obj.isSerializedRedirect) return redirect(obj);
}
function composeRewrites(rewrites) {
  return {
    input: ({ url }) => {
      for (const rewrite of rewrites) url = executeRewriteInput(rewrite, url);
      return url;
    },
    output: ({ url }) => {
      for (let i = rewrites.length - 1; i >= 0; i--) url = executeRewriteOutput(rewrites[i], url);
      return url;
    }
  };
}
function rewriteBasepath(opts) {
  const trimmedBasepath = trimPath(opts.basepath);
  const normalizedBasepath = `/${trimmedBasepath}`;
  const checkBasepath = opts.caseSensitive ? normalizedBasepath : normalizedBasepath.toLowerCase();
  const checkBasepathWithSlash = `${checkBasepath}/`;
  return {
    input: ({ url }) => {
      const pathname = opts.caseSensitive ? url.pathname : url.pathname.toLowerCase();
      if (pathname === checkBasepath) url.pathname = "/";
      else if (pathname.startsWith(checkBasepathWithSlash)) url.pathname = url.pathname.slice(normalizedBasepath.length);
      return url;
    },
    output: ({ url }) => {
      url.pathname = joinPaths([
        "/",
        trimmedBasepath,
        url.pathname
      ]);
      return url;
    }
  };
}
function executeRewriteInput(rewrite, url) {
  const res = rewrite?.input?.({ url });
  if (res) {
    if (typeof res === "string") return new URL(res);
    else if (res instanceof URL) return res;
  }
  return url;
}
function executeRewriteOutput(rewrite, url) {
  const res = rewrite?.output?.({ url });
  if (res) {
    if (typeof res === "string") return new URL(res);
    else if (res instanceof URL) return res;
  }
  return url;
}
var stateIndexKey = "__TSR_index";
function createHistory(opts) {
  let location = opts.getLocation();
  const subscribers = /* @__PURE__ */ new Set();
  const notify = (action) => {
    location = opts.getLocation();
    subscribers.forEach((subscriber) => subscriber({
      location,
      action
    }));
  };
  const handleIndexChange = (action) => {
    if (opts.notifyOnIndexChange ?? true) notify(action);
    else location = opts.getLocation();
  };
  const tryNavigation = async ({ task, navigateOpts, ...actionInfo }) => {
    if (navigateOpts?.ignoreBlocker ?? false) {
      task();
      return;
    }
    const blockers = opts.getBlockers?.() ?? [];
    const isPushOrReplace = actionInfo.type === "PUSH" || actionInfo.type === "REPLACE";
    if (typeof document !== "undefined" && blockers.length && isPushOrReplace) for (const blocker of blockers) {
      const nextLocation = parseHref(actionInfo.path, actionInfo.state);
      if (await blocker.blockerFn({
        currentLocation: location,
        nextLocation,
        action: actionInfo.type
      })) {
        opts.onBlocked?.();
        return;
      }
    }
    task();
  };
  return {
    get location() {
      return location;
    },
    get length() {
      return opts.getLength();
    },
    subscribers,
    subscribe: (cb) => {
      subscribers.add(cb);
      return () => {
        subscribers.delete(cb);
      };
    },
    push: (path, state, navigateOpts) => {
      const currentIndex = location.state[stateIndexKey];
      state = assignKeyAndIndex(currentIndex + 1, state);
      tryNavigation({
        task: () => {
          opts.pushState(path, state);
          notify({ type: "PUSH" });
        },
        navigateOpts,
        type: "PUSH",
        path,
        state
      });
    },
    replace: (path, state, navigateOpts) => {
      const currentIndex = location.state[stateIndexKey];
      state = assignKeyAndIndex(currentIndex, state);
      tryNavigation({
        task: () => {
          opts.replaceState(path, state);
          notify({ type: "REPLACE" });
        },
        navigateOpts,
        type: "REPLACE",
        path,
        state
      });
    },
    go: (index, navigateOpts) => {
      tryNavigation({
        task: () => {
          opts.go(index);
          handleIndexChange({
            type: "GO",
            index
          });
        },
        navigateOpts,
        type: "GO"
      });
    },
    back: (navigateOpts) => {
      tryNavigation({
        task: () => {
          opts.back(navigateOpts?.ignoreBlocker ?? false);
          handleIndexChange({ type: "BACK" });
        },
        navigateOpts,
        type: "BACK"
      });
    },
    forward: (navigateOpts) => {
      tryNavigation({
        task: () => {
          opts.forward(navigateOpts?.ignoreBlocker ?? false);
          handleIndexChange({ type: "FORWARD" });
        },
        navigateOpts,
        type: "FORWARD"
      });
    },
    canGoBack: () => location.state[stateIndexKey] !== 0,
    createHref: (str) => opts.createHref(str),
    block: (blocker) => {
      if (!opts.setBlockers) return () => {
      };
      const blockers = opts.getBlockers?.() ?? [];
      opts.setBlockers([...blockers, blocker]);
      return () => {
        const blockers2 = opts.getBlockers?.() ?? [];
        opts.setBlockers?.(blockers2.filter((b2) => b2 !== blocker));
      };
    },
    flush: () => opts.flush?.(),
    destroy: () => opts.destroy?.(),
    notify
  };
}
function assignKeyAndIndex(index, state) {
  if (!state) state = {};
  const key = createRandomKey();
  return {
    ...state,
    key,
    __TSR_key: key,
    [stateIndexKey]: index
  };
}
function createMemoryHistory(opts = { initialEntries: ["/"] }) {
  const entries = opts.initialEntries;
  let index = opts.initialIndex ? Math.min(Math.max(opts.initialIndex, 0), entries.length - 1) : entries.length - 1;
  const states = entries.map((_entry, index2) => assignKeyAndIndex(index2, void 0));
  const getLocation = () => parseHref(entries[index], states[index]);
  let blockers = [];
  const _getBlockers = () => blockers;
  const _setBlockers = (newBlockers) => blockers = newBlockers;
  return createHistory({
    getLocation,
    getLength: () => entries.length,
    pushState: (path, state) => {
      if (index < entries.length - 1) {
        entries.splice(index + 1);
        states.splice(index + 1);
      }
      states.push(state);
      entries.push(path);
      index = Math.max(entries.length - 1, 0);
    },
    replaceState: (path, state) => {
      states[index] = state;
      entries[index] = path;
    },
    back: () => {
      index = Math.max(index - 1, 0);
    },
    forward: () => {
      index = Math.min(index + 1, entries.length - 1);
    },
    go: (n2) => {
      index = Math.min(Math.max(index + n2, 0), entries.length - 1);
    },
    createHref: (path) => path,
    getBlockers: _getBlockers,
    setBlockers: _setBlockers
  });
}
function sanitizePath(path) {
  let sanitized = path.replace(/[\x00-\x1f\x7f]/g, "");
  if (sanitized.startsWith("//")) sanitized = "/" + sanitized.replace(/^\/+/, "");
  return sanitized;
}
function parseHref(href, state) {
  const sanitizedHref = sanitizePath(href);
  const hashIndex = sanitizedHref.indexOf("#");
  const searchIndex = sanitizedHref.indexOf("?");
  const addedKey = createRandomKey();
  return {
    href: sanitizedHref,
    pathname: sanitizedHref.substring(0, hashIndex > 0 ? searchIndex > 0 ? Math.min(hashIndex, searchIndex) : hashIndex : searchIndex > 0 ? searchIndex : sanitizedHref.length),
    hash: hashIndex > -1 ? sanitizedHref.substring(hashIndex) : "",
    search: searchIndex > -1 ? sanitizedHref.slice(searchIndex, hashIndex === -1 ? void 0 : hashIndex) : "",
    state: state || {
      [stateIndexKey]: 0,
      key: addedKey,
      __TSR_key: addedKey
    }
  };
}
function createRandomKey() {
  return (Math.random() + 1).toString(36).substring(7);
}
function getSafeSessionStorage() {
  try {
    return sessionStorage;
  } catch {
    return;
  }
}
const storageKey = "tsr-scroll-restoration-v1_3";
getSafeSessionStorage();
const defaultGetScrollRestorationKey = (location) => {
  return location.state.__TSR_key || location.href;
};
function getAssetCrossOrigin(assetCrossOrigin, kind) {
  if (!assetCrossOrigin) return;
  if (typeof assetCrossOrigin === "string") return assetCrossOrigin;
  return assetCrossOrigin[kind];
}
function getManifestScriptFormat(manifest2) {
  return manifest2?.scriptFormat ?? "module";
}
function getScriptPreloadAttrs(manifest2, link, assetCrossOrigin) {
  const preloadLink = resolveManifestAssetLink(link);
  const crossOrigin = getAssetCrossOrigin(assetCrossOrigin, "script") ?? preloadLink.crossOrigin;
  return {
    ...getManifestScriptFormat(manifest2) === "iife" ? {
      rel: "preload",
      as: "script"
    } : { rel: "modulepreload" },
    href: preloadLink.href,
    ...crossOrigin ? { crossOrigin } : {}
  };
}
function resolveManifestAssetLink(link) {
  if (typeof link === "string") return {
    href: link,
    crossOrigin: void 0
  };
  return link;
}
function appendUniqueUserTags(target, tags) {
  if (tags.length === 0) return;
  if (tags.length === 1) {
    target.push(tags[0]);
    return;
  }
  const seen = /* @__PURE__ */ new Set();
  for (const tag of tags) {
    const key = JSON.stringify(tag);
    if (seen.has(key)) continue;
    seen.add(key);
    target.push(tag);
  }
}
function getStylesheetHref(asset) {
  return resolveManifestCssLink(asset).href;
}
function resolveManifestCssLink(link) {
  if (typeof link === "string") return {
    href: link,
    crossOrigin: void 0
  };
  return link;
}
function createInlineCssStyleAsset(css) {
  return {
    attrs: { suppressHydrationWarning: true },
    children: css
  };
}
function createInlineCssPlaceholderAsset() {
  return { attrs: { suppressHydrationWarning: true } };
}
const GLOBAL_TSR = "$_TSR";
const TSR_SCRIPT_BARRIER_ID = "$tsr-stream-barrier";
var M = ((i) => (i[i.AggregateError = 1] = "AggregateError", i[i.ArrowFunction = 2] = "ArrowFunction", i[i.ErrorPrototypeStack = 4] = "ErrorPrototypeStack", i[i.ObjectAssign = 8] = "ObjectAssign", i[i.BigIntTypedArray = 16] = "BigIntTypedArray", i[i.RegExp = 32] = "RegExp", i))(M || {});
var v = Symbol.asyncIterator, pr = Symbol.hasInstance, R = Symbol.isConcatSpreadable, C = Symbol.iterator, dr = Symbol.match, gr = Symbol.matchAll, yr = Symbol.replace, Nr = Symbol.search, br = Symbol.species, vr = Symbol.split, Cr = Symbol.toPrimitive, P$1 = Symbol.toStringTag, Ar = Symbol.unscopables;
var tt = { 0: "Symbol.asyncIterator", 1: "Symbol.hasInstance", 2: "Symbol.isConcatSpreadable", 3: "Symbol.iterator", 4: "Symbol.match", 5: "Symbol.matchAll", 6: "Symbol.replace", 7: "Symbol.search", 8: "Symbol.species", 9: "Symbol.split", 10: "Symbol.toPrimitive", 11: "Symbol.toStringTag", 12: "Symbol.unscopables" }, ve = { [v]: 0, [pr]: 1, [R]: 2, [C]: 3, [dr]: 4, [gr]: 5, [yr]: 6, [Nr]: 7, [br]: 8, [vr]: 9, [Cr]: 10, [P$1]: 11, [Ar]: 12 }, nt = { 0: v, 1: pr, 2: R, 3: C, 4: dr, 5: gr, 6: yr, 7: Nr, 8: br, 9: vr, 10: Cr, 11: P$1, 12: Ar }, ot = { 2: "!0", 3: "!1", 1: "void 0", 0: "null", 4: "-0", 5: "1/0", 6: "-1/0", 7: "0/0" }, o = void 0, at = { 2: true, 3: false, 1: o, 0: null, 4: -0, 5: Number.POSITIVE_INFINITY, 6: Number.NEGATIVE_INFINITY, 7: Number.NaN };
var Ce = { 0: "Error", 1: "EvalError", 2: "RangeError", 3: "ReferenceError", 4: "SyntaxError", 5: "TypeError", 6: "URIError" }, st = { 0: Error, 1: EvalError, 2: RangeError, 3: ReferenceError, 4: SyntaxError, 5: TypeError, 6: URIError };
function c(e, r, t, n2, a, s, i, u, l, g, S, d) {
  return { t: e, i: r, s: t, c: n2, m: a, p: s, e: i, a: u, f: l, b: g, o: S, l: d };
}
function B(e) {
  return c(2, o, e, o, o, o, o, o, o, o, o, o);
}
var H = B(2), J = B(3), Ae = B(1), Ee = B(0), it = B(4), ut = B(5), lt = B(6), ct = B(7);
function mn(e) {
  switch (e) {
    case '"':
      return '\\"';
    case "\\":
      return "\\\\";
    case `
`:
      return "\\n";
    case "\r":
      return "\\r";
    case "\b":
      return "\\b";
    case "	":
      return "\\t";
    case "\f":
      return "\\f";
    case "<":
      return "\\x3C";
    case "\u2028":
      return "\\u2028";
    case "\u2029":
      return "\\u2029";
    default:
      return o;
  }
}
function y(e) {
  let r = "", t = 0, n2;
  for (let a = 0, s = e.length; a < s; a++) n2 = mn(e[a]), n2 && (r += e.slice(t, a) + n2, t = a + 1);
  return t === 0 ? r = e : r += e.slice(t), r;
}
function pn(e) {
  switch (e) {
    case "\\\\":
      return "\\";
    case '\\"':
      return '"';
    case "\\n":
      return `
`;
    case "\\r":
      return "\r";
    case "\\b":
      return "\b";
    case "\\t":
      return "	";
    case "\\f":
      return "\f";
    case "\\x3C":
      return "<";
    case "\\u2028":
      return "\u2028";
    case "\\u2029":
      return "\u2029";
    default:
      return e;
  }
}
function D(e) {
  return e.replace(/(\\\\|\\"|\\n|\\r|\\b|\\t|\\f|\\u2028|\\u2029|\\x3C)/g, pn);
}
var L = "__SEROVAL_REFS__", le = "$R", Ie = `self.${le}`;
function dn(e) {
  return e == null ? `${Ie}=${Ie}||[]` : `(${Ie}=${Ie}||{})["${y(e)}"]=[]`;
}
var Er = /* @__PURE__ */ new Map(), U = /* @__PURE__ */ new Map();
function Ir(e) {
  return Er.has(e);
}
function yn(e) {
  return U.has(e);
}
function ft(e) {
  if (Ir(e)) return Er.get(e);
  throw new Re(e);
}
function St(e) {
  if (yn(e)) return U.get(e);
  throw new Pe(e);
}
typeof globalThis != "undefined" ? Object.defineProperty(globalThis, L, { value: U, configurable: true, writable: false, enumerable: false }) : typeof window != "undefined" ? Object.defineProperty(window, L, { value: U, configurable: true, writable: false, enumerable: false }) : typeof self != "undefined" ? Object.defineProperty(self, L, { value: U, configurable: true, writable: false, enumerable: false }) : typeof global != "undefined" && Object.defineProperty(global, L, { value: U, configurable: true, writable: false, enumerable: false });
function xe(e) {
  return e instanceof EvalError ? 1 : e instanceof RangeError ? 2 : e instanceof ReferenceError ? 3 : e instanceof SyntaxError ? 4 : e instanceof TypeError ? 5 : e instanceof URIError ? 6 : 0;
}
function Nn(e) {
  let r = Ce[xe(e)];
  return e.name !== r ? { name: e.name } : e.constructor.name !== r ? { name: e.constructor.name } : {};
}
function Z(e, r) {
  let t = Nn(e), n2 = Object.getOwnPropertyNames(e);
  for (let a = 0, s = n2.length, i; a < s; a++) i = n2[a], i !== "name" && i !== "message" && (i === "stack" ? r & 4 && (t = t || {}, t[i] = e[i]) : (t = t || {}, t[i] = e[i]));
  return t;
}
function Te(e) {
  return Object.isFrozen(e) ? 3 : Object.isSealed(e) ? 2 : Object.isExtensible(e) ? 0 : 1;
}
function Oe(e) {
  switch (e) {
    case Number.POSITIVE_INFINITY:
      return ut;
    case Number.NEGATIVE_INFINITY:
      return lt;
  }
  return e !== e ? ct : Object.is(e, -0) ? it : c(0, o, e, o, o, o, o, o, o, o, o, o);
}
function $(e) {
  return c(1, o, y(e), o, o, o, o, o, o, o, o, o);
}
function we(e) {
  return c(3, o, "" + e, o, o, o, o, o, o, o, o, o);
}
function pt(e) {
  return c(4, e, o, o, o, o, o, o, o, o, o, o);
}
function he(e, r) {
  let t = r.valueOf();
  return c(5, e, t !== t ? "" : r.toISOString(), o, o, o, o, o, o, o, o, o);
}
function ze(e, r) {
  return c(6, e, o, y(r.source), r.flags, o, o, o, o, o, o, o);
}
function dt(e, r) {
  return c(17, e, ve[r], o, o, o, o, o, o, o, o, o);
}
function gt(e, r) {
  return c(18, e, y(ft(r)), o, o, o, o, o, o, o, o, o);
}
function ce(e, r, t) {
  return c(25, e, t, y(r), o, o, o, o, o, o, o, o);
}
function _e(e, r, t) {
  return c(9, e, o, o, o, o, o, t, o, o, Te(r), o);
}
function ke(e, r) {
  return c(21, e, o, o, o, o, o, o, r, o, o, o);
}
function De(e, r, t) {
  return c(15, e, o, r.constructor.name, o, o, o, o, t, r.byteOffset, o, r.length);
}
function Fe(e, r, t) {
  return c(16, e, o, r.constructor.name, o, o, o, o, t, r.byteOffset, o, r.byteLength);
}
function Be(e, r, t) {
  return c(20, e, o, o, o, o, o, o, t, r.byteOffset, o, r.byteLength);
}
function Ve(e, r, t) {
  return c(13, e, xe(r), o, y(r.message), t, o, o, o, o, o, o);
}
function Me(e, r, t) {
  return c(14, e, xe(r), o, y(r.message), t, o, o, o, o, o, o);
}
function Le(e, r) {
  return c(7, e, o, o, o, o, o, r, o, o, o, o);
}
function Ue(e, r) {
  return c(28, o, o, o, o, o, o, [e, r], o, o, o, o);
}
function je(e, r) {
  return c(30, o, o, o, o, o, o, [e, r], o, o, o, o);
}
function Ye(e, r, t) {
  return c(31, e, o, o, o, o, o, t, r, o, o, o);
}
function qe(e, r) {
  return c(32, e, o, o, o, o, o, o, r, o, o, o);
}
function We(e, r) {
  return c(33, e, o, o, o, o, o, o, r, o, o, o);
}
function Ge(e, r) {
  return c(34, e, o, o, o, o, o, o, r, o, o, o);
}
function Ke(e, r, t, n2) {
  return c(35, e, t, o, o, o, o, r, o, o, o, n2);
}
var bn = { parsing: 1, serialization: 2, deserialization: 3 };
function vn(e) {
  return `Seroval Error (step: ${bn[e]})`;
}
var Cn = (e, r) => vn(e), fe = class extends Error {
  constructor(t, n2) {
    super(Cn(t));
    this.cause = n2;
  }
}, z = class extends fe {
  constructor(r) {
    super("parsing", r);
  }
}, He = class extends fe {
  constructor(r) {
    super("deserialization", r);
  }
};
function _(e) {
  return `Seroval Error (specific: ${e})`;
}
var x$1 = class x extends Error {
  constructor(t) {
    super(_(1));
    this.value = t;
  }
}, h = class extends Error {
  constructor(r) {
    super(_(2));
  }
}, X = class extends Error {
  constructor(r) {
    super(_(3));
  }
}, V = class extends Error {
  constructor(r) {
    super(_(4));
  }
}, Re = class extends Error {
  constructor(t) {
    super(_(5));
    this.value = t;
  }
}, Pe = class extends Error {
  constructor(r) {
    super(_(6));
  }
}, Je = class extends Error {
  constructor(r) {
    super(_(7));
  }
}, O = class extends Error {
  constructor(r) {
    super(_(8));
  }
}, Q = class extends Error {
  constructor(r) {
    super(_(9));
  }
};
var j = class {
  constructor(r, t) {
    this.value = r;
    this.replacement = t;
  }
};
var ee$1 = () => {
  let e = { p: 0, s: 0, f: 0 };
  return e.p = new Promise((r, t) => {
    e.s = r, e.f = t;
  }), e;
}, An = (e, r) => {
  e.s(r), e.p.s = 1, e.p.v = r;
}, En = (e, r) => {
  e.f(r), e.p.s = 2, e.p.v = r;
}, Nt = ee$1.toString(), bt = An.toString(), vt = En.toString(), Pr = () => {
  let e = [], r = [], t = true, n2 = false, a = 0, s = (l, g, S) => {
    for (S = 0; S < a; S++) r[S] && r[S][g](l);
  }, i = (l, g, S, d) => {
    for (g = 0, S = e.length; g < S; g++) d = e[g], !t && g === S - 1 ? l[n2 ? "return" : "throw"](d) : l.next(d);
  }, u = (l, g) => (t && (g = a++, r[g] = l), i(l), () => {
    t && (r[g] = r[a], r[a--] = void 0);
  });
  return { __SEROVAL_STREAM__: true, on: (l) => u(l), next: (l) => {
    t && (e.push(l), s(l, "next"));
  }, throw: (l) => {
    t && (e.push(l), s(l, "throw"), t = false, n2 = false, r.length = 0);
  }, return: (l) => {
    t && (e.push(l), s(l, "return"), t = false, n2 = true, r.length = 0);
  } };
}, Ct = Pr.toString(), xr = (e) => (r) => () => {
  let t = 0, n2 = { [e]: () => n2, next: () => {
    if (t > r.d) return { done: true, value: void 0 };
    let a = t++, s = r.v[a];
    if (a === r.t) throw s;
    return { done: a === r.d, value: s };
  } };
  return n2;
}, At = xr.toString(), Tr = (e, r) => (t) => () => {
  let n2 = 0, a = -1, s = false, i = [], u = [], l = (S = 0, d = u.length) => {
    for (; S < d; S++) u[S].s({ done: true, value: void 0 });
  };
  t.on({ next: (S) => {
    let d = u.shift();
    d && d.s({ done: false, value: S }), i.push(S);
  }, throw: (S) => {
    let d = u.shift();
    d && d.f(S), l(), a = i.length, s = true, i.push(S);
  }, return: (S) => {
    let d = u.shift();
    d && d.s({ done: true, value: S }), l(), a = i.length, i.push(S);
  } });
  let g = { [e]: () => g, next: () => {
    if (a === -1) {
      let G = n2++;
      if (G >= i.length) {
        let rt = r();
        return u.push(rt), rt.p;
      }
      return { done: false, value: i[G] };
    }
    if (n2 > a) return { done: true, value: void 0 };
    let S = n2++, d = i[S];
    if (S !== a) return { done: false, value: d };
    if (s) throw d;
    return { done: true, value: d };
  } };
  return g;
}, Et = Tr.toString(), Or = (e) => {
  let r = atob(e), t = r.length, n2 = new Uint8Array(t);
  for (let a = 0; a < t; a++) n2[a] = r.charCodeAt(a);
  return n2.buffer;
}, It = Or.toString();
function Ze(e) {
  return "__SEROVAL_SEQUENCE__" in e;
}
function wr(e, r, t) {
  return { __SEROVAL_SEQUENCE__: true, v: e, t: r, d: t };
}
function $e(e) {
  let r = [], t = -1, n2 = -1, a = e[C]();
  for (; ; ) try {
    let s = a.next();
    if (r.push(s.value), s.done) {
      n2 = r.length - 1;
      break;
    }
  } catch (s) {
    t = r.length, r.push(s);
  }
  return wr(r, t, n2);
}
var In = xr(C);
function Rt(e) {
  return In(e);
}
var Pt = {}, xt = {};
var Tt = { 0: {}, 1: {}, 2: {}, 3: {}, 4: {}, 5: {} }, Ot = { 0: "[]", 1: Nt, 2: bt, 3: vt, 4: Ct, 5: It };
function Xe(e) {
  return "__SEROVAL_STREAM__" in e;
}
function re() {
  return Pr();
}
function Qe(e) {
  let r = re(), t = e[v]();
  async function n2() {
    try {
      let a = await t.next();
      a.done ? r.return(a.value) : (r.next(a.value), await n2());
    } catch (a) {
      r.throw(a);
    }
  }
  return n2().catch(() => {
  }), r;
}
var Rn = Tr(v, ee$1);
function wt(e) {
  return Rn(e);
}
async function hr(e) {
  try {
    return [1, await e];
  } catch (r) {
    return [0, r];
  }
}
function me(e, r) {
  return { plugins: r.plugins, mode: e, marked: /* @__PURE__ */ new Set(), features: 63 ^ (r.disabledFeatures || 0), refs: r.refs || /* @__PURE__ */ new Map(), depthLimit: r.depthLimit || 1e3 };
}
function pe(e, r) {
  e.marked.add(r);
}
function zr(e, r) {
  let t = e.refs.size;
  return e.refs.set(r, t), t;
}
function er(e, r) {
  let t = e.refs.get(r);
  return t != null ? (pe(e, t), { type: 1, value: pt(t) }) : { type: 0, value: zr(e, r) };
}
function Y(e, r) {
  let t = er(e, r);
  return t.type === 1 ? t : Ir(r) ? { type: 2, value: gt(t.value, r) } : t;
}
function I(e, r) {
  let t = Y(e, r);
  if (t.type !== 0) return t.value;
  if (r in ve) return dt(t.value, r);
  throw new x$1(r);
}
function k(e, r) {
  let t = er(e, Tt[r]);
  return t.type === 1 ? t.value : c(26, t.value, r, o, o, o, o, o, o, o, o, o);
}
function rr(e) {
  let r = er(e, Pt);
  return r.type === 1 ? r.value : c(27, r.value, o, o, o, o, o, o, I(e, C), o, o, o);
}
function tr(e) {
  let r = er(e, xt);
  return r.type === 1 ? r.value : c(29, r.value, o, o, o, o, o, [k(e, 1), I(e, v)], o, o, o, o);
}
function nr(e, r, t, n2) {
  return c(t ? 11 : 10, e, o, o, o, n2, o, o, o, o, Te(r), o);
}
function or(e, r, t, n2) {
  return c(8, r, o, o, o, o, { k: t, v: n2 }, o, k(e, 0), o, o, o);
}
function zt(e, r, t) {
  return c(22, r, t, o, o, o, o, o, k(e, 1), o, o, o);
}
function ar(e, r, t) {
  let n2 = new Uint8Array(t), a = "";
  for (let s = 0, i = n2.length; s < i; s++) a += String.fromCharCode(n2[s]);
  return c(19, r, y(btoa(a)), o, o, o, o, o, k(e, 5), o, o, o);
}
function te(e, r) {
  return { base: me(e, r), child: void 0 };
}
var kr = class {
  constructor(r, t) {
    this._p = r;
    this.depth = t;
  }
  parse(r) {
    return N(this._p, this.depth, r);
  }
};
async function xn(e, r, t) {
  let n2 = [];
  for (let a = 0, s = t.length; a < s; a++) a in t ? n2[a] = await N(e, r, t[a]) : n2[a] = 0;
  return n2;
}
async function Tn(e, r, t, n2) {
  return _e(t, n2, await xn(e, r, n2));
}
async function Dr(e, r, t) {
  let n2 = Object.entries(t), a = [], s = [];
  for (let i = 0, u = n2.length; i < u; i++) a.push(y(n2[i][0])), s.push(await N(e, r, n2[i][1]));
  return C in t && (a.push(I(e.base, C)), s.push(Ue(rr(e.base), await N(e, r, $e(t))))), v in t && (a.push(I(e.base, v)), s.push(je(tr(e.base), await N(e, r, Qe(t))))), P$1 in t && (a.push(I(e.base, P$1)), s.push($(t[P$1]))), R in t && (a.push(I(e.base, R)), s.push(t[R] ? H : J)), { k: a, v: s };
}
async function _r(e, r, t, n2, a) {
  return nr(t, n2, a, await Dr(e, r, n2));
}
async function On(e, r, t, n2) {
  return ke(t, await N(e, r, n2.valueOf()));
}
async function wn(e, r, t, n2) {
  return De(t, n2, await N(e, r, n2.buffer));
}
async function hn(e, r, t, n2) {
  return Fe(t, n2, await N(e, r, n2.buffer));
}
async function zn(e, r, t, n2) {
  return Be(t, n2, await N(e, r, n2.buffer));
}
async function _t(e, r, t, n2) {
  let a = Z(n2, e.base.features);
  return Ve(t, n2, a ? await Dr(e, r, a) : o);
}
async function _n(e, r, t, n2) {
  let a = Z(n2, e.base.features);
  return Me(t, n2, a ? await Dr(e, r, a) : o);
}
async function kn(e, r, t, n2) {
  let a = [], s = [];
  for (let [i, u] of n2.entries()) a.push(await N(e, r, i)), s.push(await N(e, r, u));
  return or(e.base, t, a, s);
}
async function Dn(e, r, t, n2) {
  let a = [];
  for (let s of n2.keys()) a.push(await N(e, r, s));
  return Le(t, a);
}
async function kt(e, r, t, n2) {
  let a = e.base.plugins;
  if (a) for (let s = 0, i = a.length; s < i; s++) {
    let u = a[s];
    if (u.parse.async && u.test(n2)) return ce(t, u.tag, await u.parse.async(n2, new kr(e, r), { id: t }));
  }
  return o;
}
async function Fn(e, r, t, n2) {
  let [a, s] = await hr(n2);
  return c(12, t, a, o, o, o, o, o, await N(e, r, s), o, o, o);
}
function Bn(e, r, t, n2, a) {
  let s = [], i = t.on({ next: (u) => {
    pe(this.base, r), N(this, e, u).then((l) => {
      s.push(qe(r, l));
    }, (l) => {
      a(l), i();
    });
  }, throw: (u) => {
    pe(this.base, r), N(this, e, u).then((l) => {
      s.push(We(r, l)), n2(s), i();
    }, (l) => {
      a(l), i();
    });
  }, return: (u) => {
    pe(this.base, r), N(this, e, u).then((l) => {
      s.push(Ge(r, l)), n2(s), i();
    }, (l) => {
      a(l), i();
    });
  } });
}
async function Vn(e, r, t, n2) {
  return Ye(t, k(e.base, 4), await new Promise(Bn.bind(e, r, t, n2)));
}
async function Mn(e, r, t, n2) {
  let a = [];
  for (let s = 0, i = n2.v.length; s < i; s++) a[s] = await N(e, r, n2.v[s]);
  return Ke(t, a, n2.t, n2.d);
}
async function Ln(e, r, t, n2) {
  if (Array.isArray(n2)) return Tn(e, r, t, n2);
  if (Xe(n2)) return Vn(e, r, t, n2);
  if (Ze(n2)) return Mn(e, r, t, n2);
  let a = n2.constructor;
  if (a === j) return N(e, r, n2.replacement);
  let s = await kt(e, r, t, n2);
  if (s) return s;
  switch (a) {
    case Object:
      return _r(e, r, t, n2, false);
    case o:
      return _r(e, r, t, n2, true);
    case Date:
      return he(t, n2);
    case Error:
    case EvalError:
    case RangeError:
    case ReferenceError:
    case SyntaxError:
    case TypeError:
    case URIError:
      return _t(e, r, t, n2);
    case Number:
    case Boolean:
    case String:
    case BigInt:
      return On(e, r, t, n2);
    case ArrayBuffer:
      return ar(e.base, t, n2);
    case Int8Array:
    case Int16Array:
    case Int32Array:
    case Uint8Array:
    case Uint16Array:
    case Uint32Array:
    case Uint8ClampedArray:
    case Float32Array:
    case Float64Array:
      return wn(e, r, t, n2);
    case DataView:
      return zn(e, r, t, n2);
    case Map:
      return kn(e, r, t, n2);
    case Set:
      return Dn(e, r, t, n2);
  }
  if (a === Promise || n2 instanceof Promise) return Fn(e, r, t, n2);
  let i = e.base.features;
  if (i & 32 && a === RegExp) return ze(t, n2);
  if (i & 16) switch (a) {
    case BigInt64Array:
    case BigUint64Array:
      return hn(e, r, t, n2);
  }
  if (i & 1 && typeof AggregateError != "undefined" && (a === AggregateError || n2 instanceof AggregateError)) return _n(e, r, t, n2);
  if (n2 instanceof Error) return _t(e, r, t, n2);
  if (C in n2 || v in n2) return _r(e, r, t, n2, !!a);
  throw new x$1(n2);
}
async function Un(e, r, t) {
  let n2 = Y(e.base, t);
  if (n2.type !== 0) return n2.value;
  let a = await kt(e, r, n2.value, t);
  if (a) return a;
  throw new x$1(t);
}
async function N(e, r, t) {
  switch (typeof t) {
    case "boolean":
      return t ? H : J;
    case "undefined":
      return Ae;
    case "string":
      return $(t);
    case "number":
      return Oe(t);
    case "bigint":
      return we(t);
    case "object": {
      if (t) {
        let n2 = Y(e.base, t);
        return n2.type === 0 ? await Ln(e, r + 1, n2.value, t) : n2.value;
      }
      return Ee;
    }
    case "symbol":
      return I(e.base, t);
    case "function":
      return Un(e, r, t);
    default:
      throw new x$1(t);
  }
}
async function ne(e, r) {
  try {
    return await N(e, 0, r);
  } catch (t) {
    throw t instanceof z ? t : new z(t);
  }
}
var oe = ((t) => (t[t.Vanilla = 1] = "Vanilla", t[t.Cross = 2] = "Cross", t))(oe || {});
function ai(e) {
  return e;
}
function Dt(e, r) {
  for (let t = 0, n2 = r.length; t < n2; t++) {
    let a = r[t];
    e.has(a) || (e.add(a), a.extends && Dt(e, a.extends));
  }
}
function A(e) {
  if (e) {
    let r = /* @__PURE__ */ new Set();
    return Dt(r, e), [...r];
  }
}
function Ft(e) {
  switch (e) {
    case "Int8Array":
      return Int8Array;
    case "Int16Array":
      return Int16Array;
    case "Int32Array":
      return Int32Array;
    case "Uint8Array":
      return Uint8Array;
    case "Uint16Array":
      return Uint16Array;
    case "Uint32Array":
      return Uint32Array;
    case "Uint8ClampedArray":
      return Uint8ClampedArray;
    case "Float32Array":
      return Float32Array;
    case "Float64Array":
      return Float64Array;
    case "BigInt64Array":
      return BigInt64Array;
    case "BigUint64Array":
      return BigUint64Array;
    default:
      throw new Je(e);
  }
}
var jn = 1e6, Yn = 1e4, qn = 2e4;
function Vt(e, r) {
  switch (r) {
    case 3:
      return Object.freeze(e);
    case 1:
      return Object.preventExtensions(e);
    case 2:
      return Object.seal(e);
    default:
      return e;
  }
}
var Wn = 1e3;
function Mt(e, r) {
  var n2;
  let t = r.refs || /* @__PURE__ */ new Map();
  return "types" in t || Object.assign(t, { types: /* @__PURE__ */ new Map() }), { mode: e, plugins: r.plugins, refs: t, features: (n2 = r.features) != null ? n2 : 63 ^ (r.disabledFeatures || 0), depthLimit: r.depthLimit || Wn };
}
function Lt(e) {
  return { mode: 1, base: Mt(1, e), child: o, state: { marked: new Set(e.markedRefs) } };
}
var Fr = class {
  constructor(r, t) {
    this._p = r;
    this.depth = t;
  }
  deserialize(r) {
    return p$1(this._p, this.depth, r);
  }
};
function jt(e, r) {
  if (r < 0 || !Number.isFinite(r) || !Number.isInteger(r)) throw new O({ t: 4, i: r });
  if (e.refs.has(r)) throw new Error("Conflicted ref id: " + r);
}
function Gn(e, r, t) {
  return jt(e.base, r), e.state.marked.has(r) && e.base.refs.set(r, t), t;
}
function Kn(e, r, t) {
  return jt(e.base, r), e.base.refs.set(r, t), t;
}
function b(e, r, t) {
  return e.mode === 1 ? Gn(e, r, t) : Kn(e, r, t);
}
function Br(e, r, t) {
  if (Object.hasOwn(r, t)) return r[t];
  throw new O(e);
}
function Hn(e, r) {
  return b(e, r.i, St(D(r.s)));
}
function Jn(e, r, t) {
  let n2 = t.a, a = n2.length, s = b(e, t.i, new Array(a));
  for (let i = 0, u; i < a; i++) u = n2[i], u && (s[i] = p$1(e, r, u));
  return Vt(s, t.o), s;
}
function Zn(e) {
  switch (e) {
    case "constructor":
    case "__proto__":
    case "prototype":
    case "__defineGetter__":
    case "__defineSetter__":
    case "__lookupGetter__":
    case "__lookupSetter__":
      return false;
    default:
      return true;
  }
}
function $n(e) {
  switch (e) {
    case v:
    case R:
    case P$1:
    case C:
      return true;
    default:
      return false;
  }
}
function Bt(e, r, t) {
  Zn(r) ? e[r] = t : Object.defineProperty(e, r, { value: t, configurable: true, enumerable: true, writable: true });
}
function Xn(e, r, t, n2, a) {
  if (typeof n2 == "string") Bt(t, D(n2), p$1(e, r, a));
  else {
    let s = p$1(e, r, n2);
    switch (typeof s) {
      case "string":
        Bt(t, s, p$1(e, r, a));
        break;
      case "symbol":
        $n(s) && (t[s] = p$1(e, r, a));
        break;
      default:
        throw new O(n2);
    }
  }
}
function Yt(e, r, t) {
  e.base.refs.types.set(r, t);
}
function de(e, r, t, n2) {
  if (e.base.refs.types.get(t) !== n2) throw new O(r);
}
function qt(e, r, t, n2) {
  let a = t.k;
  if (a.length > 0) for (let i = 0, u = t.v, l = a.length; i < l; i++) Xn(e, r, n2, a[i], u[i]);
  return n2;
}
function Qn(e, r, t) {
  let n2 = b(e, t.i, t.t === 10 ? {} : /* @__PURE__ */ Object.create(null));
  return qt(e, r, t.p, n2), Vt(n2, t.o), n2;
}
function eo(e, r) {
  return b(e, r.i, new Date(r.s));
}
function ro(e, r) {
  if (e.base.features & 32) {
    let t = D(r.c);
    if (t.length > qn) throw new O(r);
    return b(e, r.i, new RegExp(t, r.m));
  }
  throw new h(r);
}
function to(e, r, t) {
  let n2 = b(e, t.i, /* @__PURE__ */ new Set());
  for (let a = 0, s = t.a, i = s.length; a < i; a++) n2.add(p$1(e, r, s[a]));
  return n2;
}
function no(e, r, t) {
  let n2 = b(e, t.i, /* @__PURE__ */ new Map());
  for (let a = 0, s = t.e.k, i = t.e.v, u = s.length; a < u; a++) n2.set(p$1(e, r, s[a]), p$1(e, r, i[a]));
  return n2;
}
function oo(e, r) {
  if (r.s.length > jn) throw new O(r);
  return b(e, r.i, Or(D(r.s)));
}
function ao(e, r, t) {
  var u;
  let n2 = Ft(t.c), a = p$1(e, r, t.f), s = (u = t.b) != null ? u : 0;
  if (s < 0 || s > a.byteLength) throw new O(t);
  return b(e, t.i, new n2(a, s, t.l));
}
function so(e, r, t) {
  var i;
  let n2 = p$1(e, r, t.f), a = (i = t.b) != null ? i : 0;
  if (a < 0 || a > n2.byteLength) throw new O(t);
  return b(e, t.i, new DataView(n2, a, t.l));
}
function Wt(e, r, t, n2) {
  if (t.p) {
    let a = qt(e, r, t.p, {});
    Object.defineProperties(n2, Object.getOwnPropertyDescriptors(a));
  }
  return n2;
}
function io(e, r, t) {
  let n2 = b(e, t.i, new AggregateError([], D(t.m)));
  return Wt(e, r, t, n2);
}
function uo(e, r, t) {
  let n2 = Br(t, st, t.s), a = b(e, t.i, new n2(D(t.m)));
  return Wt(e, r, t, a);
}
function lo(e, r, t) {
  let n2 = ee$1(), a = b(e, t.i, n2.p), s = p$1(e, r, t.f);
  return t.s ? n2.s(s) : n2.f(s), a;
}
function co(e, r, t) {
  return b(e, t.i, Object(p$1(e, r, t.f)));
}
function fo(e, r, t) {
  let n2 = e.base.plugins;
  if (n2) {
    let a = D(t.c);
    for (let s = 0, i = n2.length; s < i; s++) {
      let u = n2[s];
      if (u.tag === a) return b(e, t.i, u.deserialize(t.s, new Fr(e, r), { id: t.i }));
    }
  }
  throw new X(t.c);
}
function So(e, r) {
  let t = b(e, r.i, b(e, r.s, ee$1()).p);
  return Yt(e, r.s, 22), t;
}
function mo(e, r, t) {
  let n2 = e.base.refs.get(t.i);
  if (n2) return de(e, t, t.i, 22), n2.s(p$1(e, r, t.a[1])), o;
  throw new V("Promise");
}
function po(e, r, t) {
  let n2 = e.base.refs.get(t.i);
  if (n2) return de(e, t, t.i, 22), n2.f(p$1(e, r, t.a[1])), o;
  throw new V("Promise");
}
function go(e, r, t) {
  p$1(e, r, t.a[0]);
  let n2 = p$1(e, r, t.a[1]);
  return Rt(n2);
}
function yo(e, r, t) {
  p$1(e, r, t.a[0]);
  let n2 = p$1(e, r, t.a[1]);
  return wt(n2);
}
function No(e, r, t) {
  let n2 = b(e, t.i, re());
  Yt(e, t.i, 31);
  let a = t.a, s = a.length;
  if (s) for (let i = 0; i < s; i++) p$1(e, r, a[i]);
  return n2;
}
function bo(e, r, t) {
  let n2 = e.base.refs.get(t.i);
  if (n2) return de(e, t, t.i, 31), n2.next(p$1(e, r, t.f)), o;
  throw new V("Stream");
}
function vo(e, r, t) {
  let n2 = e.base.refs.get(t.i);
  if (n2) return de(e, t, t.i, 31), n2.throw(p$1(e, r, t.f)), o;
  throw new V("Stream");
}
function Co(e, r, t) {
  let n2 = e.base.refs.get(t.i);
  if (n2) return de(e, t, t.i, 31), n2.return(p$1(e, r, t.f)), o;
  throw new V("Stream");
}
function Ao(e, r, t) {
  return p$1(e, r, t.f), o;
}
function Eo(e, r, t) {
  return p$1(e, r, t.a[1]), o;
}
function Io(e, r, t) {
  let n2 = b(e, t.i, wr([], t.s, t.l));
  for (let a = 0, s = t.a.length; a < s; a++) n2.v[a] = p$1(e, r, t.a[a]);
  return n2;
}
function p$1(e, r, t) {
  if (r > e.base.depthLimit) throw new Q(e.base.depthLimit);
  switch (r += 1, t.t) {
    case 2:
      return Br(t, at, t.s);
    case 0:
      return Number(t.s);
    case 1:
      return D(String(t.s));
    case 3:
      if (String(t.s).length > Yn) throw new O(t);
      return BigInt(t.s);
    case 4:
      return e.base.refs.get(t.i);
    case 18:
      return Hn(e, t);
    case 9:
      return Jn(e, r, t);
    case 10:
    case 11:
      return Qn(e, r, t);
    case 5:
      return eo(e, t);
    case 6:
      return ro(e, t);
    case 7:
      return to(e, r, t);
    case 8:
      return no(e, r, t);
    case 19:
      return oo(e, t);
    case 16:
    case 15:
      return ao(e, r, t);
    case 20:
      return so(e, r, t);
    case 14:
      return io(e, r, t);
    case 13:
      return uo(e, r, t);
    case 12:
      return lo(e, r, t);
    case 17:
      return Br(t, nt, t.s);
    case 21:
      return co(e, r, t);
    case 25:
      return fo(e, r, t);
    case 22:
      return So(e, t);
    case 23:
      return mo(e, r, t);
    case 24:
      return po(e, r, t);
    case 28:
      return go(e, r, t);
    case 30:
      return yo(e, r, t);
    case 31:
      return No(e, r, t);
    case 32:
      return bo(e, r, t);
    case 33:
      return vo(e, r, t);
    case 34:
      return Co(e, r, t);
    case 27:
      return Ao(e, r, t);
    case 29:
      return Eo(e, r, t);
    case 35:
      return Io(e, r, t);
    default:
      throw new h(t);
  }
}
function sr(e, r) {
  try {
    return p$1(e, 0, r);
  } catch (t) {
    throw new He(t);
  }
}
var Ro = () => T, Po = Ro.toString(), Gt = /=>/.test(Po);
function ir(e, r) {
  return Gt ? (e.length === 1 ? e[0] : "(" + e.join(",") + ")") + "=>" + (r.startsWith("{") ? "(" + r + ")" : r) : "function(" + e.join(",") + "){return " + r + "}";
}
function Kt(e, r) {
  return Gt ? (e.length === 1 ? e[0] : "(" + e.join(",") + ")") + "=>{" + r + "}" : "function(" + e.join(",") + "){" + r + "}";
}
var Zt = "hjkmoquxzABCDEFGHIJKLNPQRTUVWXYZ$_", Ht = Zt.length, $t = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$_", Jt = $t.length;
function Vr(e) {
  let r = e % Ht, t = Zt[r];
  for (e = (e - r) / Ht; e > 0; ) r = e % Jt, t += $t[r], e = (e - r) / Jt;
  return t;
}
var xo = /^[$A-Z_][0-9A-Z_$]*$/i;
function Mr(e) {
  let r = e[0];
  return (r === "$" || r === "_" || r >= "A" && r <= "Z" || r >= "a" && r <= "z") && xo.test(e);
}
function ye(e) {
  switch (e.t) {
    case 0:
      return e.s + "=" + e.v;
    case 2:
      return e.s + ".set(" + e.k + "," + e.v + ")";
    case 1:
      return e.s + ".add(" + e.v + ")";
    case 3:
      return e.s + ".delete(" + e.k + ")";
  }
}
function To(e) {
  let r = [], t = e[0];
  for (let n2 = 1, a = e.length, s, i = t; n2 < a; n2++) s = e[n2], s.t === 0 && s.v === i.v ? t = { t: 0, s: s.s, k: o, v: ye(t) } : s.t === 2 && s.s === i.s ? t = { t: 2, s: ye(t), k: s.k, v: s.v } : s.t === 1 && s.s === i.s ? t = { t: 1, s: ye(t), k: o, v: s.v } : s.t === 3 && s.s === i.s ? t = { t: 3, s: ye(t), k: s.k, v: o } : (r.push(t), t = s), i = s;
  return r.push(t), r;
}
function on(e) {
  if (e.length) {
    let r = "", t = To(e);
    for (let n2 = 0, a = t.length; n2 < a; n2++) r += ye(t[n2]) + ",";
    return r;
  }
  return o;
}
var Oo = "Object.create(null)", wo = "new Set", ho = "new Map", zo = "Promise.resolve", _o = "Promise.reject", ko = { 3: "Object.freeze", 2: "Object.seal", 1: "Object.preventExtensions", 0: o };
function an(e, r) {
  return { mode: e, plugins: r.plugins, features: r.features, marked: new Set(r.markedRefs), stack: [], flags: [], assignments: [] };
}
function lr(e) {
  return { mode: 2, base: an(2, e), state: e, child: o };
}
var Lr = class {
  constructor(r) {
    this._p = r;
  }
  serialize(r) {
    return f(this._p, r);
  }
};
function Fo(e, r) {
  let t = e.valid.get(r);
  t == null && (t = e.valid.size, e.valid.set(r, t));
  let n2 = e.vars[t];
  return n2 == null && (n2 = Vr(t), e.vars[t] = n2), n2;
}
function Bo(e) {
  return le + "[" + e + "]";
}
function m(e, r) {
  return e.mode === 1 ? Fo(e.state, r) : Bo(r);
}
function w$1(e, r) {
  e.marked.add(r);
}
function Ur(e, r) {
  return e.marked.has(r);
}
function Yr(e, r, t) {
  r !== 0 && (w$1(e.base, t), e.base.flags.push({ type: r, value: m(e, t) }));
}
function Vo(e) {
  let r = "";
  for (let t = 0, n2 = e.flags, a = n2.length; t < a; t++) {
    let s = n2[t];
    r += ko[s.type] + "(" + s.value + "),";
  }
  return r;
}
function sn(e) {
  let r = on(e.assignments), t = Vo(e);
  return r ? t ? r + t : r : t;
}
function qr(e, r, t) {
  e.assignments.push({ t: 0, s: r, k: o, v: t });
}
function Mo(e, r, t) {
  e.base.assignments.push({ t: 1, s: m(e, r), k: o, v: t });
}
function ge(e, r, t, n2) {
  e.base.assignments.push({ t: 2, s: m(e, r), k: t, v: n2 });
}
function Xt(e, r, t) {
  e.base.assignments.push({ t: 3, s: m(e, r), k: t, v: o });
}
function Ne(e, r, t, n2) {
  qr(e.base, m(e, r) + "[" + t + "]", n2);
}
function jr(e, r, t, n2) {
  qr(e.base, m(e, r) + "." + t, n2);
}
function Lo(e, r, t, n2) {
  qr(e.base, m(e, r) + ".v[" + t + "]", n2);
}
function F(e, r) {
  return r.t === 4 && e.stack.includes(r.i);
}
function ae(e, r, t) {
  return e.mode === 1 && !Ur(e.base, r) ? t : m(e, r) + "=" + t;
}
function Uo(e) {
  return L + '.get("' + e.s + '")';
}
function Qt(e, r, t, n2) {
  return t ? F(e.base, t) ? (w$1(e.base, r), Ne(e, r, n2, m(e, t.i)), "") : f(e, t) : "";
}
function jo(e, r) {
  let t = r.i, n2 = r.a, a = n2.length;
  if (a > 0) {
    e.base.stack.push(t);
    let s = Qt(e, t, n2[0], 0), i = s === "";
    for (let u = 1, l; u < a; u++) l = Qt(e, t, n2[u], u), s += "," + l, i = l === "";
    return e.base.stack.pop(), Yr(e, r.o, r.i), "[" + s + (i ? ",]" : "]");
  }
  return "[]";
}
function en(e, r, t, n2) {
  if (typeof t == "string") {
    let a = Number(t), s = a >= 0 && a.toString() === t || Mr(t);
    if (F(e.base, n2)) {
      let i = m(e, n2.i);
      return w$1(e.base, r.i), s && a !== a ? jr(e, r.i, t, i) : Ne(e, r.i, s ? t : '"' + t + '"', i), "";
    }
    return (s ? t : '"' + t + '"') + ":" + f(e, n2);
  }
  return "[" + f(e, t) + "]:" + f(e, n2);
}
function un(e, r, t) {
  let n2 = t.k, a = n2.length;
  if (a > 0) {
    let s = t.v;
    e.base.stack.push(r.i);
    let i = en(e, r, n2[0], s[0]);
    for (let u = 1, l = i; u < a; u++) l = en(e, r, n2[u], s[u]), i += (l && i && ",") + l;
    return e.base.stack.pop(), "{" + i + "}";
  }
  return "{}";
}
function Yo(e, r) {
  return Yr(e, r.o, r.i), un(e, r, r.p);
}
function qo(e, r, t, n2) {
  let a = un(e, r, t);
  return a !== "{}" ? "Object.assign(" + n2 + "," + a + ")" : n2;
}
function Wo(e, r, t, n2, a) {
  let s = e.base, i = f(e, a), u = Number(n2), l = u >= 0 && u.toString() === n2 || Mr(n2);
  if (F(s, a)) l && u !== u ? jr(e, r.i, n2, i) : Ne(e, r.i, l ? n2 : '"' + n2 + '"', i);
  else {
    let g = s.assignments;
    s.assignments = t, l && u !== u ? jr(e, r.i, n2, i) : Ne(e, r.i, l ? n2 : '"' + n2 + '"', i), s.assignments = g;
  }
}
function Go(e, r, t, n2, a) {
  if (typeof n2 == "string") Wo(e, r, t, n2, a);
  else {
    let s = e.base, i = s.stack;
    s.stack = [];
    let u = f(e, a);
    s.stack = i;
    let l = s.assignments;
    s.assignments = t, Ne(e, r.i, f(e, n2), u), s.assignments = l;
  }
}
function Ko(e, r, t) {
  let n2 = t.k, a = n2.length;
  if (a > 0) {
    let s = [], i = t.v;
    e.base.stack.push(r.i);
    for (let u = 0; u < a; u++) Go(e, r, s, n2[u], i[u]);
    return e.base.stack.pop(), on(s);
  }
  return o;
}
function Wr(e, r, t) {
  if (r.p) {
    let n2 = e.base;
    if (n2.features & 8) t = qo(e, r, r.p, t);
    else {
      w$1(n2, r.i);
      let a = Ko(e, r, r.p);
      if (a) return "(" + ae(e, r.i, t) + "," + a + m(e, r.i) + ")";
    }
  }
  return t;
}
function Ho(e, r) {
  return Yr(e, r.o, r.i), Wr(e, r, Oo);
}
function Jo(e) {
  return 'new Date("' + e.s + '")';
}
function Zo(e, r) {
  if (e.base.features & 32) return "/" + r.c + "/" + r.m;
  throw new h(r);
}
function rn(e, r, t) {
  let n2 = e.base;
  return F(n2, t) ? (w$1(n2, r), Mo(e, r, m(e, t.i)), "") : f(e, t);
}
function $o(e, r) {
  let t = wo, n2 = r.a, a = n2.length, s = r.i;
  if (a > 0) {
    e.base.stack.push(s);
    let i = rn(e, s, n2[0]);
    for (let u = 1, l = i; u < a; u++) l = rn(e, s, n2[u]), i += (l && i && ",") + l;
    e.base.stack.pop(), i && (t += "([" + i + "])");
  }
  return t;
}
function tn(e, r, t, n2, a) {
  let s = e.base;
  if (F(s, t)) {
    let i = m(e, t.i);
    if (w$1(s, r), F(s, n2)) {
      let l = m(e, n2.i);
      return ge(e, r, i, l), "";
    }
    if (n2.t !== 4 && n2.i != null && Ur(s, n2.i)) {
      let l = "(" + f(e, n2) + ",[" + a + "," + a + "])";
      return ge(e, r, i, m(e, n2.i)), Xt(e, r, a), l;
    }
    let u = s.stack;
    return s.stack = [], ge(e, r, i, f(e, n2)), s.stack = u, "";
  }
  if (F(s, n2)) {
    let i = m(e, n2.i);
    if (w$1(s, r), t.t !== 4 && t.i != null && Ur(s, t.i)) {
      let l = "(" + f(e, t) + ",[" + a + "," + a + "])";
      return ge(e, r, m(e, t.i), i), Xt(e, r, a), l;
    }
    let u = s.stack;
    return s.stack = [], ge(e, r, f(e, t), i), s.stack = u, "";
  }
  return "[" + f(e, t) + "," + f(e, n2) + "]";
}
function Xo(e, r) {
  let t = ho, n2 = r.e.k, a = n2.length, s = r.i, i = r.f, u = m(e, i.i), l = e.base;
  if (a > 0) {
    let g = r.e.v;
    l.stack.push(s);
    let S = tn(e, s, n2[0], g[0], u);
    for (let d = 1, G = S; d < a; d++) G = tn(e, s, n2[d], g[d], u), S += (G && S && ",") + G;
    l.stack.pop(), S && (t += "([" + S + "])");
  }
  return i.t === 26 && (w$1(l, i.i), t = "(" + f(e, i) + "," + t + ")"), t;
}
function Qo(e, r) {
  return q(e, r.f) + '("' + r.s + '")';
}
function ea(e, r) {
  return "new " + r.c + "(" + f(e, r.f) + "," + r.b + "," + r.l + ")";
}
function ra(e, r) {
  return "new DataView(" + f(e, r.f) + "," + r.b + "," + r.l + ")";
}
function ta(e, r) {
  let t = r.i;
  e.base.stack.push(t);
  let n2 = Wr(e, r, 'new AggregateError([],"' + r.m + '")');
  return e.base.stack.pop(), n2;
}
function na(e, r) {
  return Wr(e, r, "new " + Ce[r.s] + '("' + r.m + '")');
}
function oa(e, r) {
  let t, n2 = r.f, a = r.i, s = r.s ? zo : _o, i = e.base;
  if (F(i, n2)) {
    let u = m(e, n2.i);
    t = s + (r.s ? "().then(" + ir([], u) + ")" : "().catch(" + Kt([], "throw " + u) + ")");
  } else {
    i.stack.push(a);
    let u = f(e, n2);
    i.stack.pop(), t = s + "(" + u + ")";
  }
  return t;
}
function aa(e, r) {
  return "Object(" + f(e, r.f) + ")";
}
function q(e, r) {
  let t = f(e, r);
  return r.t === 4 ? t : "(" + t + ")";
}
function sa(e, r) {
  if (e.mode === 1) throw new h(r);
  return "(" + ae(e, r.s, q(e, r.f) + "()") + ").p";
}
function ia(e, r) {
  if (e.mode === 1) throw new h(r);
  return q(e, r.a[0]) + "(" + m(e, r.i) + "," + f(e, r.a[1]) + ")";
}
function ua(e, r) {
  if (e.mode === 1) throw new h(r);
  return q(e, r.a[0]) + "(" + m(e, r.i) + "," + f(e, r.a[1]) + ")";
}
function la(e, r) {
  let t = e.base.plugins;
  if (t) for (let n2 = 0, a = t.length; n2 < a; n2++) {
    let s = t[n2];
    if (s.tag === r.c) return e.child == null && (e.child = new Lr(e)), s.serialize(r.s, e.child, { id: r.i });
  }
  throw new X(r.c);
}
function ca(e, r) {
  let t = "", n2 = false;
  return r.f.t !== 4 && (w$1(e.base, r.f.i), t = "(" + f(e, r.f) + ",", n2 = true), t += ae(e, r.i, "(" + At + ")(" + m(e, r.f.i) + ")"), n2 && (t += ")"), t;
}
function fa(e, r) {
  return q(e, r.a[0]) + "(" + f(e, r.a[1]) + ")";
}
function Sa(e, r) {
  let t = r.a[0], n2 = r.a[1], a = e.base, s = "";
  t.t !== 4 && (w$1(a, t.i), s += "(" + f(e, t)), n2.t !== 4 && (w$1(a, n2.i), s += (s ? "," : "(") + f(e, n2)), s && (s += ",");
  let i = ae(e, r.i, "(" + Et + ")(" + m(e, n2.i) + "," + m(e, t.i) + ")");
  return s ? s + i + ")" : i;
}
function ma(e, r) {
  return q(e, r.a[0]) + "(" + f(e, r.a[1]) + ")";
}
function pa(e, r) {
  let t = ae(e, r.i, q(e, r.f) + "()"), n2 = r.a.length;
  if (n2) {
    let a = f(e, r.a[0]);
    for (let s = 1; s < n2; s++) a += "," + f(e, r.a[s]);
    return "(" + t + "," + a + "," + m(e, r.i) + ")";
  }
  return t;
}
function da(e, r) {
  return m(e, r.i) + ".next(" + f(e, r.f) + ")";
}
function ga(e, r) {
  return m(e, r.i) + ".throw(" + f(e, r.f) + ")";
}
function ya(e, r) {
  return m(e, r.i) + ".return(" + f(e, r.f) + ")";
}
function nn(e, r, t, n2) {
  let a = e.base;
  return F(a, n2) ? (w$1(a, r), Lo(e, r, t, m(e, n2.i)), "") : f(e, n2);
}
function Na(e, r) {
  let t = r.a, n2 = t.length, a = r.i;
  if (n2 > 0) {
    e.base.stack.push(a);
    let s = nn(e, a, 0, t[0]);
    for (let i = 1, u = s; i < n2; i++) u = nn(e, a, i, t[i]), s += (u && s && ",") + u;
    if (e.base.stack.pop(), s) return "{__SEROVAL_SEQUENCE__:!0,v:[" + s + "],t:" + r.s + ",d:" + r.l + "}";
  }
  return "{__SEROVAL_SEQUENCE__:!0,v:[],t:-1,d:0}";
}
function ba(e, r) {
  switch (r.t) {
    case 17:
      return tt[r.s];
    case 18:
      return Uo(r);
    case 9:
      return jo(e, r);
    case 10:
      return Yo(e, r);
    case 11:
      return Ho(e, r);
    case 5:
      return Jo(r);
    case 6:
      return Zo(e, r);
    case 7:
      return $o(e, r);
    case 8:
      return Xo(e, r);
    case 19:
      return Qo(e, r);
    case 16:
    case 15:
      return ea(e, r);
    case 20:
      return ra(e, r);
    case 14:
      return ta(e, r);
    case 13:
      return na(e, r);
    case 12:
      return oa(e, r);
    case 21:
      return aa(e, r);
    case 22:
      return sa(e, r);
    case 25:
      return la(e, r);
    case 26:
      return Ot[r.s];
    case 35:
      return Na(e, r);
    default:
      throw new h(r);
  }
}
function f(e, r) {
  switch (r.t) {
    case 2:
      return ot[r.s];
    case 0:
      return "" + r.s;
    case 1:
      return '"' + r.s + '"';
    case 3:
      return r.s + "n";
    case 4:
      return m(e, r.i);
    case 23:
      return ia(e, r);
    case 24:
      return ua(e, r);
    case 27:
      return ca(e, r);
    case 28:
      return fa(e, r);
    case 29:
      return Sa(e, r);
    case 30:
      return ma(e, r);
    case 31:
      return pa(e, r);
    case 32:
      return da(e, r);
    case 33:
      return ga(e, r);
    case 34:
      return ya(e, r);
    default:
      return ae(e, r.i, ba(e, r));
  }
}
function fr(e, r) {
  let t = f(e, r), n2 = r.i;
  if (n2 == null) return t;
  let a = sn(e.base), s = m(e, n2), i = e.state.scopeId, u = i == null ? "" : le, l = a ? "(" + t + "," + a + s + ")" : t;
  if (u === "") return r.t === 10 && !a ? "(" + l + ")" : l;
  let g = i == null ? "()" : "(" + le + '["' + y(i) + '"])';
  return "(" + ir([u], l) + ")" + g;
}
var Kr = class {
  constructor(r, t) {
    this._p = r;
    this.depth = t;
  }
  parse(r) {
    return E(this._p, this.depth, r);
  }
}, Hr = class {
  constructor(r, t) {
    this._p = r;
    this.depth = t;
  }
  parse(r) {
    return E(this._p, this.depth, r);
  }
  parseWithError(r) {
    return W(this._p, this.depth, r);
  }
  isAlive() {
    return this._p.state.alive;
  }
  pushPendingState() {
    Qr(this._p);
  }
  popPendingState() {
    be(this._p);
  }
  onParse(r) {
    se(this._p, r);
  }
  onError(r) {
    $r(this._p, r);
  }
};
function va(e) {
  return { alive: true, pending: 0, initial: true, buffer: [], onParse: e.onParse, onError: e.onError, onDone: e.onDone };
}
function Jr(e) {
  return { type: 2, base: me(2, e), state: va(e) };
}
function Ca(e, r, t) {
  let n2 = [];
  for (let a = 0, s = t.length; a < s; a++) a in t ? n2[a] = E(e, r, t[a]) : n2[a] = 0;
  return n2;
}
function Aa(e, r, t, n2) {
  return _e(t, n2, Ca(e, r, n2));
}
function Zr(e, r, t) {
  let n2 = Object.entries(t), a = [], s = [];
  for (let i = 0, u = n2.length; i < u; i++) a.push(y(n2[i][0])), s.push(E(e, r, n2[i][1]));
  return C in t && (a.push(I(e.base, C)), s.push(Ue(rr(e.base), E(e, r, $e(t))))), v in t && (a.push(I(e.base, v)), s.push(je(tr(e.base), E(e, r, e.type === 1 ? re() : Qe(t))))), P$1 in t && (a.push(I(e.base, P$1)), s.push($(t[P$1]))), R in t && (a.push(I(e.base, R)), s.push(t[R] ? H : J)), { k: a, v: s };
}
function Gr(e, r, t, n2, a) {
  return nr(t, n2, a, Zr(e, r, n2));
}
function Ea(e, r, t, n2) {
  return ke(t, E(e, r, n2.valueOf()));
}
function Ia(e, r, t, n2) {
  return De(t, n2, E(e, r, n2.buffer));
}
function Ra(e, r, t, n2) {
  return Fe(t, n2, E(e, r, n2.buffer));
}
function Pa(e, r, t, n2) {
  return Be(t, n2, E(e, r, n2.buffer));
}
function ln(e, r, t, n2) {
  let a = Z(n2, e.base.features);
  return Ve(t, n2, a ? Zr(e, r, a) : o);
}
function xa(e, r, t, n2) {
  let a = Z(n2, e.base.features);
  return Me(t, n2, a ? Zr(e, r, a) : o);
}
function Ta(e, r, t, n2) {
  let a = [], s = [];
  for (let [i, u] of n2.entries()) a.push(E(e, r, i)), s.push(E(e, r, u));
  return or(e.base, t, a, s);
}
function Oa(e, r, t, n2) {
  let a = [];
  for (let s of n2.keys()) a.push(E(e, r, s));
  return Le(t, a);
}
function wa(e, r, t, n2) {
  let a = Ye(t, k(e.base, 4), []);
  return e.type === 1 || (Qr(e), n2.on({ next: (s) => {
    if (e.state.alive) {
      let i = W(e, r, s);
      i && se(e, qe(t, i));
    }
  }, throw: (s) => {
    if (e.state.alive) {
      let i = W(e, r, s);
      i && se(e, We(t, i));
    }
    be(e);
  }, return: (s) => {
    if (e.state.alive) {
      let i = W(e, r, s);
      i && se(e, Ge(t, i));
    }
    be(e);
  } })), a;
}
function ha(e, r, t) {
  if (this.state.alive) {
    let n2 = W(this, r, t);
    n2 && se(this, c(23, e, o, o, o, o, o, [k(this.base, 2), n2], o, o, o, o)), be(this);
  }
}
function za(e, r, t) {
  if (this.state.alive) {
    let n2 = W(this, r, t);
    n2 && se(this, c(24, e, o, o, o, o, o, [k(this.base, 3), n2], o, o, o, o));
  }
  be(this);
}
function _a(e, r, t, n2) {
  let a = zr(e.base, {});
  return e.type === 2 && (Qr(e), n2.then(ha.bind(e, a, r), za.bind(e, a, r))), zt(e.base, t, a);
}
function ka(e, r, t, n2, a) {
  for (let s = 0, i = a.length; s < i; s++) {
    let u = a[s];
    if (u.parse.sync && u.test(n2)) return ce(t, u.tag, u.parse.sync(n2, new Kr(e, r), { id: t }));
  }
  return o;
}
function Da(e, r, t, n2, a) {
  for (let s = 0, i = a.length; s < i; s++) {
    let u = a[s];
    if (u.parse.stream && u.test(n2)) return ce(t, u.tag, u.parse.stream(n2, new Hr(e, r), { id: t }));
  }
  return o;
}
function cn(e, r, t, n2) {
  let a = e.base.plugins;
  return a ? e.type === 1 ? ka(e, r, t, n2, a) : Da(e, r, t, n2, a) : o;
}
function Fa(e, r, t, n2) {
  let a = [];
  for (let s = 0, i = n2.v.length; s < i; s++) a[s] = E(e, r, n2.v[s]);
  return Ke(t, a, n2.t, n2.d);
}
function Ba(e, r, t, n2, a) {
  switch (a) {
    case Object:
      return Gr(e, r, t, n2, false);
    case o:
      return Gr(e, r, t, n2, true);
    case Date:
      return he(t, n2);
    case Error:
    case EvalError:
    case RangeError:
    case ReferenceError:
    case SyntaxError:
    case TypeError:
    case URIError:
      return ln(e, r, t, n2);
    case Number:
    case Boolean:
    case String:
    case BigInt:
      return Ea(e, r, t, n2);
    case ArrayBuffer:
      return ar(e.base, t, n2);
    case Int8Array:
    case Int16Array:
    case Int32Array:
    case Uint8Array:
    case Uint16Array:
    case Uint32Array:
    case Uint8ClampedArray:
    case Float32Array:
    case Float64Array:
      return Ia(e, r, t, n2);
    case DataView:
      return Pa(e, r, t, n2);
    case Map:
      return Ta(e, r, t, n2);
    case Set:
      return Oa(e, r, t, n2);
  }
  if (a === Promise || n2 instanceof Promise) return _a(e, r, t, n2);
  let s = e.base.features;
  if (s & 32 && a === RegExp) return ze(t, n2);
  if (s & 16) switch (a) {
    case BigInt64Array:
    case BigUint64Array:
      return Ra(e, r, t, n2);
  }
  if (s & 1 && typeof AggregateError != "undefined" && (a === AggregateError || n2 instanceof AggregateError)) return xa(e, r, t, n2);
  if (n2 instanceof Error) return ln(e, r, t, n2);
  if (C in n2 || v in n2) return Gr(e, r, t, n2, !!a);
  throw new x$1(n2);
}
function Va(e, r, t, n2) {
  if (Array.isArray(n2)) return Aa(e, r, t, n2);
  if (Xe(n2)) return wa(e, r, t, n2);
  if (Ze(n2)) return Fa(e, r, t, n2);
  let a = n2.constructor;
  if (a === j) return E(e, r, n2.replacement);
  let s = cn(e, r, t, n2);
  return s || Ba(e, r, t, n2, a);
}
function Ma(e, r, t) {
  let n2 = Y(e.base, t);
  if (n2.type !== 0) return n2.value;
  let a = cn(e, r, n2.value, t);
  if (a) return a;
  throw new x$1(t);
}
function E(e, r, t) {
  if (r >= e.base.depthLimit) throw new Q(e.base.depthLimit);
  switch (typeof t) {
    case "boolean":
      return t ? H : J;
    case "undefined":
      return Ae;
    case "string":
      return $(t);
    case "number":
      return Oe(t);
    case "bigint":
      return we(t);
    case "object": {
      if (t) {
        let n2 = Y(e.base, t);
        return n2.type === 0 ? Va(e, r + 1, n2.value, t) : n2.value;
      }
      return Ee;
    }
    case "symbol":
      return I(e.base, t);
    case "function":
      return Ma(e, r, t);
    default:
      throw new x$1(t);
  }
}
function se(e, r) {
  e.state.initial ? e.state.buffer.push(r) : Xr(e, r, false);
}
function $r(e, r) {
  if (e.state.onError) e.state.onError(r);
  else throw r instanceof z ? r : new z(r);
}
function fn(e) {
  e.state.onDone && e.state.onDone();
}
function Xr(e, r, t) {
  try {
    e.state.onParse(r, t);
  } catch (n2) {
    $r(e, n2);
  }
}
function Qr(e) {
  e.state.pending++;
}
function be(e) {
  --e.state.pending <= 0 && fn(e);
}
function W(e, r, t) {
  try {
    return E(e, r, t);
  } catch (n2) {
    return $r(e, n2), o;
  }
}
function et(e, r) {
  let t = W(e, 0, r);
  t && (Xr(e, t, true), e.state.initial = false, La(e, e.state), e.state.pending <= 0 && Sr(e));
}
function La(e, r) {
  for (let t = 0, n2 = r.buffer.length; t < n2; t++) Xr(e, r.buffer[t], false);
}
function Sr(e) {
  e.state.alive && (fn(e), e.state.alive = false);
}
async function su(e, r = {}) {
  let t = A(r.plugins), n2 = te(2, { plugins: t, disabledFeatures: r.disabledFeatures, refs: r.refs });
  return await ne(n2, e);
}
function Sn(e, r) {
  let t = A(r.plugins), n2 = Jr({ plugins: t, refs: r.refs, disabledFeatures: r.disabledFeatures, onParse(a, s) {
    let i = lr({ plugins: t, features: n2.base.features, scopeId: r.scopeId, markedRefs: n2.base.marked }), u;
    try {
      u = fr(i, a);
    } catch (l) {
      r.onError && r.onError(l);
      return;
    }
    r.onSerialize(u, s);
  }, onError: r.onError, onDone: r.onDone });
  return et(n2, e), Sr.bind(null, n2);
}
function iu(e, r) {
  let t = A(r.plugins), n2 = Jr({ plugins: t, refs: r.refs, disabledFeatures: r.disabledFeatures, depthLimit: r.depthLimit, onParse: r.onParse, onError: r.onError, onDone: r.onDone });
  return et(n2, e), Sr.bind(null, n2);
}
function Pu(e, r = {}) {
  var i;
  let t = A(r.plugins), n2 = r.disabledFeatures || 0, a = (i = e.f) != null ? i : 63, s = Lt({ plugins: t, markedRefs: e.m, features: a & ~n2, disabledFeatures: n2 });
  return sr(s, e.t);
}
function createSerializationAdapter(opts) {
  return opts;
}
// @__NO_SIDE_EFFECTS__
function makeSsrSerovalPlugin(serializationAdapter, options) {
  return /* @__PURE__ */ ai({
    tag: "$TSR/t/" + serializationAdapter.key,
    test: serializationAdapter.test,
    parse: { stream(value, ctx, _data) {
      return { v: ctx.parse(serializationAdapter.toSerializable(value)) };
    } },
    serialize(node, ctx, _data) {
      options.didRun = true;
      return GLOBAL_TSR + '.t.get("' + serializationAdapter.key + '")(' + ctx.serialize(node.v) + ")";
    },
    deserialize: void 0
  });
}
// @__NO_SIDE_EFFECTS__
function makeSerovalPlugin(serializationAdapter) {
  return /* @__PURE__ */ ai({
    tag: "$TSR/t/" + serializationAdapter.key,
    test: serializationAdapter.test,
    parse: {
      sync(value, ctx, _data) {
        return { v: ctx.parse(serializationAdapter.toSerializable(value)) };
      },
      async async(value, ctx, _data) {
        return { v: await ctx.parse(serializationAdapter.toSerializable(value)) };
      },
      stream(value, ctx, _data) {
        return { v: ctx.parse(serializationAdapter.toSerializable(value)) };
      }
    },
    serialize: void 0,
    deserialize(node, ctx, _data) {
      return serializationAdapter.fromSerializable(ctx.deserialize(node.v));
    }
  });
}
var RawStream = class {
  constructor(stream, options) {
    this.stream = stream;
    this.hint = options?.hint ?? "binary";
  }
};
const BufferCtor = globalThis.Buffer;
const hasNodeBuffer = !!BufferCtor && typeof BufferCtor.from === "function";
function uint8ArrayToBase64(bytes) {
  if (bytes.length === 0) return "";
  if (hasNodeBuffer) return BufferCtor.from(bytes).toString("base64");
  const CHUNK_SIZE = 32768;
  const chunks = [];
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    const chunk = bytes.subarray(i, i + CHUNK_SIZE);
    chunks.push(String.fromCharCode.apply(null, chunk));
  }
  return btoa(chunks.join(""));
}
function base64ToUint8Array(base64) {
  if (base64.length === 0) return new Uint8Array(0);
  if (hasNodeBuffer) {
    const buf = BufferCtor.from(base64, "base64");
    return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
const RAW_STREAM_FACTORY_BINARY = /* @__PURE__ */ Object.create(null);
const RAW_STREAM_FACTORY_TEXT = /* @__PURE__ */ Object.create(null);
const RAW_STREAM_FACTORY_CONSTRUCTOR_BINARY = (stream) => new ReadableStream({ start(controller) {
  stream.on({
    next(base64) {
      try {
        controller.enqueue(base64ToUint8Array(base64));
      } catch {
      }
    },
    throw(error) {
      controller.error(error);
    },
    return() {
      try {
        controller.close();
      } catch {
      }
    }
  });
} });
const textEncoderForFactory = new TextEncoder();
const RAW_STREAM_FACTORY_CONSTRUCTOR_TEXT = (stream) => {
  return new ReadableStream({ start(controller) {
    stream.on({
      next(value) {
        try {
          if (typeof value === "string") controller.enqueue(textEncoderForFactory.encode(value));
          else controller.enqueue(base64ToUint8Array(value.$b64));
        } catch {
        }
      },
      throw(error) {
        controller.error(error);
      },
      return() {
        try {
          controller.close();
        } catch {
        }
      }
    });
  } });
};
const FACTORY_BINARY = `(s=>new ReadableStream({start(c){s.on({next(b){try{const d=atob(b),a=new Uint8Array(d.length);for(let i=0;i<d.length;i++)a[i]=d.charCodeAt(i);c.enqueue(a)}catch(_){}},throw(e){c.error(e)},return(){try{c.close()}catch(_){}}})}}))`;
const FACTORY_TEXT = `(s=>{const e=new TextEncoder();return new ReadableStream({start(c){s.on({next(v){try{if(typeof v==='string'){c.enqueue(e.encode(v))}else{const d=atob(v.$b64),a=new Uint8Array(d.length);for(let i=0;i<d.length;i++)a[i]=d.charCodeAt(i);c.enqueue(a)}}catch(_){}},throw(x){c.error(x)},return(){try{c.close()}catch(_){}}})}})})`;
function toBinaryStream(readable) {
  const stream = re();
  const reader = readable.getReader();
  (async () => {
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          stream.return(void 0);
          break;
        }
        stream.next(uint8ArrayToBase64(value));
      }
    } catch (error) {
      stream.throw(error);
    } finally {
      reader.releaseLock();
    }
  })();
  return stream;
}
function toTextStream(readable) {
  const stream = re();
  const reader = readable.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  (async () => {
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          try {
            const remaining = decoder.decode();
            if (remaining.length > 0) stream.next(remaining);
          } catch {
          }
          stream.return(void 0);
          break;
        }
        try {
          const text = decoder.decode(value, { stream: true });
          if (text.length > 0) stream.next(text);
        } catch {
          stream.next({ $b64: uint8ArrayToBase64(value) });
        }
      }
    } catch (error) {
      stream.throw(error);
    } finally {
      reader.releaseLock();
    }
  })();
  return stream;
}
const RawStreamSSRPlugin = /* @__PURE__ */ ai({
  tag: "tss/RawStream",
  extends: [/* @__PURE__ */ ai({
    tag: "tss/RawStreamFactory",
    test(value) {
      return value === RAW_STREAM_FACTORY_BINARY;
    },
    parse: {
      sync(_value, _ctx, _data) {
        return {};
      },
      async async(_value, _ctx, _data) {
        return {};
      },
      stream(_value, _ctx, _data) {
        return {};
      }
    },
    serialize(_node, _ctx, _data) {
      return FACTORY_BINARY;
    },
    deserialize(_node, _ctx, _data) {
      return RAW_STREAM_FACTORY_BINARY;
    }
  }), /* @__PURE__ */ ai({
    tag: "tss/RawStreamFactoryText",
    test(value) {
      return value === RAW_STREAM_FACTORY_TEXT;
    },
    parse: {
      sync(_value, _ctx, _data) {
        return {};
      },
      async async(_value, _ctx, _data) {
        return {};
      },
      stream(_value, _ctx, _data) {
        return {};
      }
    },
    serialize(_node, _ctx, _data) {
      return FACTORY_TEXT;
    },
    deserialize(_node, _ctx, _data) {
      return RAW_STREAM_FACTORY_TEXT;
    }
  })],
  test(value) {
    return value instanceof RawStream;
  },
  parse: {
    sync(value, ctx, _data) {
      const factory = value.hint === "text" ? RAW_STREAM_FACTORY_TEXT : RAW_STREAM_FACTORY_BINARY;
      return {
        hint: ctx.parse(value.hint),
        factory: ctx.parse(factory),
        stream: ctx.parse(re())
      };
    },
    async async(value, ctx, _data) {
      const factory = value.hint === "text" ? RAW_STREAM_FACTORY_TEXT : RAW_STREAM_FACTORY_BINARY;
      const encodedStream = value.hint === "text" ? toTextStream(value.stream) : toBinaryStream(value.stream);
      return {
        hint: await ctx.parse(value.hint),
        factory: await ctx.parse(factory),
        stream: await ctx.parse(encodedStream)
      };
    },
    stream(value, ctx, _data) {
      const factory = value.hint === "text" ? RAW_STREAM_FACTORY_TEXT : RAW_STREAM_FACTORY_BINARY;
      const encodedStream = value.hint === "text" ? toTextStream(value.stream) : toBinaryStream(value.stream);
      return {
        hint: ctx.parse(value.hint),
        factory: ctx.parse(factory),
        stream: ctx.parse(encodedStream)
      };
    }
  },
  serialize(node, ctx, _data) {
    return "(" + ctx.serialize(node.factory) + ")(" + ctx.serialize(node.stream) + ")";
  },
  deserialize(node, ctx, _data) {
    const stream = ctx.deserialize(node.stream);
    return ctx.deserialize(node.hint) === "text" ? RAW_STREAM_FACTORY_CONSTRUCTOR_TEXT(stream) : RAW_STREAM_FACTORY_CONSTRUCTOR_BINARY(stream);
  }
});
// @__NO_SIDE_EFFECTS__
function createRawStreamRPCPlugin(onRawStream) {
  let nextStreamId = 1;
  return /* @__PURE__ */ ai({
    tag: "tss/RawStream",
    test(value) {
      return value instanceof RawStream;
    },
    parse: {
      async async(value, ctx, _data) {
        const streamId = nextStreamId++;
        onRawStream(streamId, value.stream);
        return { streamId: await ctx.parse(streamId) };
      },
      stream(value, ctx, _data) {
        const streamId = nextStreamId++;
        onRawStream(streamId, value.stream);
        return { streamId: ctx.parse(streamId) };
      }
    },
    serialize() {
      throw new Error("RawStreamRPCPlugin.serialize should not be called. RPC uses JSON serialization, not JS code generation.");
    },
    deserialize() {
      throw new Error("RawStreamRPCPlugin.deserialize should not be called. Use createRawStreamDeserializePlugin on client.");
    }
  });
}
const ShallowErrorPlugin = /* @__PURE__ */ ai({
  tag: "$TSR/Error",
  test(value) {
    return value instanceof Error;
  },
  parse: {
    sync(value, ctx) {
      return { message: ctx.parse(value.message) };
    },
    async async(value, ctx) {
      return { message: await ctx.parse(value.message) };
    },
    stream(value, ctx) {
      return { message: ctx.parse(value.message) };
    }
  },
  serialize(node, ctx) {
    return "new Error(" + ctx.serialize(node.message) + ")";
  },
  deserialize(node, ctx) {
    return new Error(ctx.deserialize(node.message));
  }
});
var n = {}, P = (e) => new ReadableStream({ start: (r) => {
  e.on({ next: (a) => {
    try {
      r.enqueue(a);
    } catch (t) {
    }
  }, throw: (a) => {
    r.error(a);
  }, return: () => {
    try {
      r.close();
    } catch (a) {
    }
  } });
} }), x2 = ai({ tag: "seroval-plugins/web/ReadableStreamFactory", test(e) {
  return e === n;
}, parse: { sync() {
  return n;
}, async async() {
  return await Promise.resolve(n);
}, stream() {
  return n;
} }, serialize() {
  return P.toString();
}, deserialize() {
  return n;
} });
function w(e) {
  let r = re(), a = e.getReader();
  async function t() {
    try {
      let s = await a.read();
      s.done ? r.return(s.value) : (r.next(s.value), await t());
    } catch (s) {
      r.throw(s);
    }
  }
  return t().catch(() => {
  }), r;
}
var ee = ai({ tag: "seroval/plugins/web/ReadableStream", extends: [x2], test(e) {
  return typeof ReadableStream == "undefined" ? false : e instanceof ReadableStream;
}, parse: { sync(e, r) {
  return { factory: r.parse(n), stream: r.parse(re()) };
}, async async(e, r) {
  return { factory: await r.parse(n), stream: await r.parse(w(e)) };
}, stream(e, r) {
  return { factory: r.parse(n), stream: r.parse(w(e)) };
} }, serialize(e, r) {
  return "(" + r.serialize(e.factory) + ")(" + r.serialize(e.stream) + ")";
}, deserialize(e, r) {
  let a = r.deserialize(e.stream);
  return P(a);
} }), p = ee;
const defaultSerovalPlugins = [
  ShallowErrorPlugin,
  RawStreamSSRPlugin,
  p
];
var jsxRuntime = { exports: {} };
var reactJsxRuntime_production_min = {};
var hasRequiredReactJsxRuntime_production_min;
function requireReactJsxRuntime_production_min() {
  if (hasRequiredReactJsxRuntime_production_min) return reactJsxRuntime_production_min;
  hasRequiredReactJsxRuntime_production_min = 1;
  var f2 = requireReact(), k2 = /* @__PURE__ */ Symbol.for("react.element"), l = /* @__PURE__ */ Symbol.for("react.fragment"), m2 = Object.prototype.hasOwnProperty, n2 = f2.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, p2 = { key: true, ref: true, __self: true, __source: true };
  function q2(c2, a, g) {
    var b2, d = {}, e = null, h2 = null;
    void 0 !== g && (e = "" + g);
    void 0 !== a.key && (e = "" + a.key);
    void 0 !== a.ref && (h2 = a.ref);
    for (b2 in a) m2.call(a, b2) && !p2.hasOwnProperty(b2) && (d[b2] = a[b2]);
    if (c2 && c2.defaultProps) for (b2 in a = c2.defaultProps, a) void 0 === d[b2] && (d[b2] = a[b2]);
    return { $$typeof: k2, type: c2, key: e, ref: h2, props: d, _owner: n2.current };
  }
  reactJsxRuntime_production_min.Fragment = l;
  reactJsxRuntime_production_min.jsx = q2;
  reactJsxRuntime_production_min.jsxs = q2;
  return reactJsxRuntime_production_min;
}
var hasRequiredJsxRuntime;
function requireJsxRuntime() {
  if (hasRequiredJsxRuntime) return jsxRuntime.exports;
  hasRequiredJsxRuntime = 1;
  {
    jsxRuntime.exports = requireReactJsxRuntime_production_min();
  }
  return jsxRuntime.exports;
}
var jsxRuntimeExports = requireJsxRuntime();
function CatchBoundary(props) {
  const errorComponent = props.errorComponent ?? ErrorComponent;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(CatchBoundaryImpl, {
    getResetKey: props.getResetKey,
    onCatch: props.onCatch,
    children: ({ error, reset }) => {
      if (error) return reactExports.createElement(errorComponent, {
        error,
        reset
      });
      return props.children;
    }
  });
}
var CatchBoundaryImpl = class extends reactExports.Component {
  constructor(..._args) {
    super(..._args);
    this.state = { error: null };
  }
  static getDerivedStateFromProps(props, state) {
    const resetKey = props.getResetKey();
    if (state.error && state.resetKey !== resetKey) return {
      resetKey,
      error: null
    };
    return { resetKey };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  reset() {
    this.setState({ error: null });
  }
  componentDidCatch(error, errorInfo) {
    if (this.props.onCatch) this.props.onCatch(error, errorInfo);
  }
  render() {
    return this.props.children({
      error: this.state.error,
      reset: () => {
        this.reset();
      }
    });
  }
};
function ErrorComponent({ error }) {
  const [show, setShow] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
    style: {
      padding: ".5rem",
      maxWidth: "100%"
    },
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: ".5rem"
        },
        children: [/* @__PURE__ */ jsxRuntimeExports.jsx("strong", {
          style: { fontSize: "1rem" },
          children: "Something went wrong!"
        }), /* @__PURE__ */ jsxRuntimeExports.jsx("button", {
          style: {
            appearance: "none",
            fontSize: ".6em",
            border: "1px solid currentColor",
            padding: ".1rem .2rem",
            fontWeight: "bold",
            borderRadius: ".25rem"
          },
          onClick: () => setShow((d) => !d),
          children: show ? "Hide Error" : "Show Error"
        })]
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { height: ".25rem" } }),
      show ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("pre", {
        style: {
          fontSize: ".7em",
          border: "1px solid red",
          borderRadius: ".25rem",
          padding: ".3rem",
          color: "red",
          overflow: "auto"
        },
        children: error.message ? /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: error.message }) : null
      }) }) : null
    ]
  });
}
function ClientOnly({ children, fallback = null }) {
  return useHydrated() ? /* @__PURE__ */ jsxRuntimeExports.jsx(React.Fragment, { children }) : /* @__PURE__ */ jsxRuntimeExports.jsx(React.Fragment, { children: fallback });
}
function useHydrated() {
  return React.useSyncExternalStore(subscribe, () => true, () => false);
}
function subscribe() {
  return () => {
  };
}
var routerContext = reactExports.createContext(null);
function useRouter(opts) {
  const value = reactExports.useContext(routerContext);
  return value;
}
var matchContext = reactExports.createContext(void 0);
var dummyMatchContext = reactExports.createContext(void 0);
function CatchNotFound(props) {
  const router = useRouter();
  {
    const resetKey = `not-found-${router.stores.location.get().pathname}-${router.stores.status.get()}`;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(CatchBoundary, {
      getResetKey: () => resetKey,
      onCatch: (error, errorInfo) => {
        if (isNotFound(error)) props.onCatch?.(error, errorInfo);
        else throw error;
      },
      errorComponent: ({ error }) => {
        if (isNotFound(error)) return props.fallback?.(error);
        else throw error;
      },
      children: props.children
    });
  }
}
function DefaultGlobalNotFound() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Not Found" });
}
function ScriptOnce({ children }) {
  const router = useRouter();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("script", {
    nonce: router.options.ssr?.nonce,
    dangerouslySetInnerHTML: { __html: children + ";document.currentScript.remove()" }
  });
}
function SafeFragment(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: props.children });
}
function renderRouteNotFound(router, route, data) {
  if (!route.options.notFoundComponent) {
    if (router.options.defaultNotFoundComponent) return /* @__PURE__ */ jsxRuntimeExports.jsx(router.options.defaultNotFoundComponent, { ...data });
    return /* @__PURE__ */ jsxRuntimeExports.jsx(DefaultGlobalNotFound, {});
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(route.options.notFoundComponent, { ...data });
}
var scroll_restoration_inline_default = 'function(a,f){let l;try{l=JSON.parse(sessionStorage.getItem(a)||"{}")}catch{return}const n=l?.[f||history.state?.__TSR_key];let c=!1;for(const t in n){const e=n[t],o=e?.scrollX,s=e?.scrollY;if(Number.isFinite(o)&&Number.isFinite(s)){if(t==="window")scrollTo(o,s),c=!0;else if(t)try{const r=document.querySelector(t);r&&(r.scrollLeft=o,r.scrollTop=s)}catch{}}}if(c)return;const i=location.hash.slice(1);if(i){const t=history.state?.__hashScrollIntoViewOptions??!0;if(t){const e=document.getElementById(i);e&&e.scrollIntoView(t)}return}scrollTo(0,0)}';
const defaultInlineScrollRestorationScript = `(${scroll_restoration_inline_default})(${escapeHtml(JSON.stringify(storageKey))})`;
function getScrollRestorationScript(key) {
  if (key === void 0) return defaultInlineScrollRestorationScript;
  return `(${scroll_restoration_inline_default})(${escapeHtml(JSON.stringify(storageKey))},${escapeHtml(JSON.stringify(key))})`;
}
function getScrollRestorationScriptForRouter(router) {
  if (typeof router.options.scrollRestoration === "function" && !router.options.scrollRestoration({ location: router.latestLocation })) return null;
  const getKey = router.options.getScrollRestorationKey;
  if (!getKey) return defaultInlineScrollRestorationScript;
  const location = router.latestLocation;
  const userKey = getKey(location);
  if (userKey === defaultGetScrollRestorationKey(location)) return defaultInlineScrollRestorationScript;
  return getScrollRestorationScript(userKey);
}
function ScrollRestoration() {
  const script = getScrollRestorationScriptForRouter(useRouter());
  if (!script) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ScriptOnce, { children: script });
}
var Match = reactExports.memo(function MatchImpl({ matchId }) {
  const router = useRouter();
  {
    const match2 = router.stores.matchStores.get(matchId)?.get();
    if (!match2) {
      invariant();
    }
    const routeId = match2.routeId;
    const parentRouteId = router.routesById[routeId].parentRoute?.id;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(MatchView, {
      router,
      matchId,
      resetKey: router.stores.loadedAt.get(),
      matchState: {
        routeId,
        ssr: match2.ssr,
        _displayPending: match2._displayPending,
        parentRouteId
      }
    });
  }
});
function MatchView({ router, matchId, resetKey, matchState }) {
  const route = router.routesById[matchState.routeId];
  const PendingComponent = route.options.pendingComponent ?? router.options.defaultPendingComponent;
  const pendingElement = PendingComponent ? /* @__PURE__ */ jsxRuntimeExports.jsx(PendingComponent, {}) : null;
  const routeErrorComponent = route.options.errorComponent ?? router.options.defaultErrorComponent;
  const routeOnCatch = route.options.onCatch ?? router.options.defaultOnCatch;
  const routeNotFoundComponent = route.isRoot ? route.options.notFoundComponent ?? router.options.notFoundRoute?.options.component : route.options.notFoundComponent;
  const resolvedNoSsr = matchState.ssr === false || matchState.ssr === "data-only";
  const ResolvedSuspenseBoundary = (!route.isRoot || route.options.wrapInSuspense || resolvedNoSsr) && (route.options.wrapInSuspense ?? PendingComponent ?? (route.options.errorComponent?.preload || resolvedNoSsr)) ? reactExports.Suspense : SafeFragment;
  const ResolvedCatchBoundary = routeErrorComponent ? CatchBoundary : SafeFragment;
  const ResolvedNotFoundBoundary = routeNotFoundComponent ? CatchNotFound : SafeFragment;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(route.isRoot ? route.options.shellComponent ?? SafeFragment : SafeFragment, { children: [/* @__PURE__ */ jsxRuntimeExports.jsx(matchContext.Provider, {
    value: matchId,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResolvedSuspenseBoundary, {
      fallback: pendingElement,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResolvedCatchBoundary, {
        getResetKey: () => resetKey,
        errorComponent: routeErrorComponent || ErrorComponent,
        onCatch: (error, errorInfo) => {
          if (isNotFound(error)) {
            error.routeId ??= matchState.routeId;
            throw error;
          }
          routeOnCatch?.(error, errorInfo);
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResolvedNotFoundBoundary, {
          fallback: (error) => {
            error.routeId ??= matchState.routeId;
            if (!routeNotFoundComponent || error.routeId && error.routeId !== matchState.routeId || !error.routeId && !route.isRoot) throw error;
            return reactExports.createElement(routeNotFoundComponent, error);
          },
          children: resolvedNoSsr || matchState._displayPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(ClientOnly, {
            fallback: pendingElement,
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(MatchInner, { matchId })
          }) : /* @__PURE__ */ jsxRuntimeExports.jsx(MatchInner, { matchId })
        })
      })
    })
  }), matchState.parentRouteId === rootRouteId ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [/* @__PURE__ */ jsxRuntimeExports.jsx(OnRendered, {}), router.options.scrollRestoration && isServer ? /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollRestoration, {}) : null] }) : null] });
}
function OnRendered() {
  useRouter();
  return null;
}
var MatchInner = reactExports.memo(function MatchInnerImpl({ matchId }) {
  const router = useRouter();
  const getMatchPromise = (match2, key2) => {
    return router.getMatch(match2.id)?._nonReactive[key2] ?? match2._nonReactive[key2];
  };
  {
    const match2 = router.stores.matchStores.get(matchId)?.get();
    if (!match2) {
      invariant();
    }
    const routeId2 = match2.routeId;
    const route2 = router.routesById[routeId2];
    const remountDeps = (router.routesById[routeId2].options.remountDeps ?? router.options.defaultRemountDeps)?.({
      routeId: routeId2,
      loaderDeps: match2.loaderDeps,
      params: match2._strictParams,
      search: match2._strictSearch
    });
    const key2 = remountDeps ? JSON.stringify(remountDeps) : void 0;
    const Comp = route2.options.component ?? router.options.defaultComponent;
    const out2 = Comp ? /* @__PURE__ */ jsxRuntimeExports.jsx(Comp, {}, key2) : /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {});
    if (match2._displayPending) throw getMatchPromise(match2, "displayPendingPromise");
    if (match2._forcePending) throw getMatchPromise(match2, "minPendingPromise");
    if (match2.status === "pending") throw getMatchPromise(match2, "loadPromise");
    if (match2.status === "notFound") {
      if (!isNotFound(match2.error)) {
        invariant();
      }
      return renderRouteNotFound(router, route2, match2.error);
    }
    if (match2.status === "redirected") {
      if (!isRedirect(match2.error)) {
        invariant();
      }
      throw getMatchPromise(match2, "loadPromise");
    }
    if (match2.status === "error") return /* @__PURE__ */ jsxRuntimeExports.jsx((route2.options.errorComponent ?? router.options.defaultErrorComponent) || ErrorComponent, {
      error: match2.error,
      reset: void 0,
      info: { componentStack: "" }
    });
    return out2;
  }
});
var Outlet = reactExports.memo(function OutletImpl() {
  const router = useRouter();
  const matchId = reactExports.useContext(matchContext);
  let routeId;
  let parentGlobalNotFound = false;
  let childMatchId;
  {
    const matches = router.stores.matches.get();
    const parentIndex = matchId ? matches.findIndex((match) => match.id === matchId) : -1;
    const parentMatch = parentIndex >= 0 ? matches[parentIndex] : void 0;
    routeId = parentMatch?.routeId;
    parentGlobalNotFound = parentMatch?.globalNotFound ?? false;
    childMatchId = parentIndex >= 0 ? matches[parentIndex + 1]?.id : void 0;
  }
  const route = routeId ? router.routesById[routeId] : void 0;
  const pendingElement = router.options.defaultPendingComponent ? /* @__PURE__ */ jsxRuntimeExports.jsx(router.options.defaultPendingComponent, {}) : null;
  if (parentGlobalNotFound) {
    if (!route) {
      invariant();
    }
    return renderRouteNotFound(router, route, void 0);
  }
  if (!childMatchId) return null;
  const nextMatch = /* @__PURE__ */ jsxRuntimeExports.jsx(Match, { matchId: childMatchId });
  if (routeId === rootRouteId) return /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, {
    fallback: pendingElement,
    children: nextMatch
  });
  return nextMatch;
});
function Matches() {
  const router = useRouter();
  const PendingComponent = router.routesById[rootRouteId].options.pendingComponent ?? router.options.defaultPendingComponent;
  const pendingElement = PendingComponent ? /* @__PURE__ */ jsxRuntimeExports.jsx(PendingComponent, {}) : null;
  const inner = /* @__PURE__ */ jsxRuntimeExports.jsxs(SafeFragment, {
    fallback: pendingElement,
    children: [false, /* @__PURE__ */ jsxRuntimeExports.jsx(MatchesInner, {})]
  });
  return router.options.InnerWrap ? /* @__PURE__ */ jsxRuntimeExports.jsx(router.options.InnerWrap, { children: inner }) : inner;
}
function MatchesInner() {
  const router = useRouter();
  const matchId = router.stores.firstId.get();
  const resetKey = router.stores.loadedAt.get();
  const matchComponent = matchId ? /* @__PURE__ */ jsxRuntimeExports.jsx(Match, { matchId }) : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(matchContext.Provider, {
    value: matchId,
    children: router.options.disableGlobalCatchBoundary ? matchComponent : /* @__PURE__ */ jsxRuntimeExports.jsx(CatchBoundary, {
      getResetKey: () => resetKey,
      errorComponent: ErrorComponent,
      onCatch: void 0,
      children: matchComponent
    })
  });
}
function useMatches(opts) {
  const router = useRouter();
  {
    const matches = router.stores.matches.get();
    return matches;
  }
}
function RouterContextProvider({ router, children, ...rest }) {
  if (hasKeys(rest)) router.update({
    ...router.options,
    ...rest,
    context: {
      ...router.options.context,
      ...rest.context
    }
  });
  const provider = /* @__PURE__ */ jsxRuntimeExports.jsx(routerContext.Provider, {
    value: router,
    children
  });
  if (router.options.Wrap) return /* @__PURE__ */ jsxRuntimeExports.jsx(router.options.Wrap, { children: provider });
  return provider;
}
function RouterProvider({ router, ...rest }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(RouterContextProvider, {
    router,
    ...rest,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Matches, {})
  });
}
function StartServer(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(RouterProvider, { router: props.router });
}
var server_node = {};
var reactDomServerLegacy_node_production_min = {};
var hasRequiredReactDomServerLegacy_node_production_min;
function requireReactDomServerLegacy_node_production_min() {
  if (hasRequiredReactDomServerLegacy_node_production_min) return reactDomServerLegacy_node_production_min;
  hasRequiredReactDomServerLegacy_node_production_min = 1;
  var ea2 = requireReact(), fa2 = require$$1, n2 = Object.prototype.hasOwnProperty, ha2 = /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/, ia2 = {}, ja = {};
  function ka2(a) {
    if (n2.call(ja, a)) return true;
    if (n2.call(ia2, a)) return false;
    if (ha2.test(a)) return ja[a] = true;
    ia2[a] = true;
    return false;
  }
  function q2(a, b2, c2, d, f2, e, g) {
    this.acceptsBooleans = 2 === b2 || 3 === b2 || 4 === b2;
    this.attributeName = d;
    this.attributeNamespace = f2;
    this.mustUseProperty = c2;
    this.propertyName = a;
    this.type = b2;
    this.sanitizeURL = e;
    this.removeEmptyString = g;
  }
  var r = {};
  "children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(a) {
    r[a] = new q2(a, 0, false, a, null, false, false);
  });
  [["acceptCharset", "accept-charset"], ["className", "class"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"]].forEach(function(a) {
    var b2 = a[0];
    r[b2] = new q2(b2, 1, false, a[1], null, false, false);
  });
  ["contentEditable", "draggable", "spellCheck", "value"].forEach(function(a) {
    r[a] = new q2(a, 2, false, a.toLowerCase(), null, false, false);
  });
  ["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function(a) {
    r[a] = new q2(a, 2, false, a, null, false, false);
  });
  "allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(a) {
    r[a] = new q2(a, 3, false, a.toLowerCase(), null, false, false);
  });
  ["checked", "multiple", "muted", "selected"].forEach(function(a) {
    r[a] = new q2(a, 3, true, a, null, false, false);
  });
  ["capture", "download"].forEach(function(a) {
    r[a] = new q2(a, 4, false, a, null, false, false);
  });
  ["cols", "rows", "size", "span"].forEach(function(a) {
    r[a] = new q2(a, 6, false, a, null, false, false);
  });
  ["rowSpan", "start"].forEach(function(a) {
    r[a] = new q2(a, 5, false, a.toLowerCase(), null, false, false);
  });
  var la2 = /[\-:]([a-z])/g;
  function ma2(a) {
    return a[1].toUpperCase();
  }
  "accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(a) {
    var b2 = a.replace(
      la2,
      ma2
    );
    r[b2] = new q2(b2, 1, false, a, null, false, false);
  });
  "xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(a) {
    var b2 = a.replace(la2, ma2);
    r[b2] = new q2(b2, 1, false, a, "http://www.w3.org/1999/xlink", false, false);
  });
  ["xml:base", "xml:lang", "xml:space"].forEach(function(a) {
    var b2 = a.replace(la2, ma2);
    r[b2] = new q2(b2, 1, false, a, "http://www.w3.org/XML/1998/namespace", false, false);
  });
  ["tabIndex", "crossOrigin"].forEach(function(a) {
    r[a] = new q2(a, 1, false, a.toLowerCase(), null, false, false);
  });
  r.xlinkHref = new q2("xlinkHref", 1, false, "xlink:href", "http://www.w3.org/1999/xlink", true, false);
  ["src", "href", "action", "formAction"].forEach(function(a) {
    r[a] = new q2(a, 1, false, a.toLowerCase(), null, true, true);
  });
  var t = {
    animationIterationCount: true,
    aspectRatio: true,
    borderImageOutset: true,
    borderImageSlice: true,
    borderImageWidth: true,
    boxFlex: true,
    boxFlexGroup: true,
    boxOrdinalGroup: true,
    columnCount: true,
    columns: true,
    flex: true,
    flexGrow: true,
    flexPositive: true,
    flexShrink: true,
    flexNegative: true,
    flexOrder: true,
    gridArea: true,
    gridRow: true,
    gridRowEnd: true,
    gridRowSpan: true,
    gridRowStart: true,
    gridColumn: true,
    gridColumnEnd: true,
    gridColumnSpan: true,
    gridColumnStart: true,
    fontWeight: true,
    lineClamp: true,
    lineHeight: true,
    opacity: true,
    order: true,
    orphans: true,
    tabSize: true,
    widows: true,
    zIndex: true,
    zoom: true,
    fillOpacity: true,
    floodOpacity: true,
    stopOpacity: true,
    strokeDasharray: true,
    strokeDashoffset: true,
    strokeMiterlimit: true,
    strokeOpacity: true,
    strokeWidth: true
  }, na2 = ["Webkit", "ms", "Moz", "O"];
  Object.keys(t).forEach(function(a) {
    na2.forEach(function(b2) {
      b2 = b2 + a.charAt(0).toUpperCase() + a.substring(1);
      t[b2] = t[a];
    });
  });
  var oa2 = /["'&<>]/;
  function u(a) {
    if ("boolean" === typeof a || "number" === typeof a) return "" + a;
    a = "" + a;
    var b2 = oa2.exec(a);
    if (b2) {
      var c2 = "", d, f2 = 0;
      for (d = b2.index; d < a.length; d++) {
        switch (a.charCodeAt(d)) {
          case 34:
            b2 = "&quot;";
            break;
          case 38:
            b2 = "&amp;";
            break;
          case 39:
            b2 = "&#x27;";
            break;
          case 60:
            b2 = "&lt;";
            break;
          case 62:
            b2 = "&gt;";
            break;
          default:
            continue;
        }
        f2 !== d && (c2 += a.substring(f2, d));
        f2 = d + 1;
        c2 += b2;
      }
      a = f2 !== d ? c2 + a.substring(f2, d) : c2;
    }
    return a;
  }
  var pa2 = /([A-Z])/g, qa = /^ms-/, ra2 = Array.isArray;
  function v2(a, b2) {
    return { insertionMode: a, selectedValue: b2 };
  }
  function sa2(a, b2, c2) {
    switch (b2) {
      case "select":
        return v2(1, null != c2.value ? c2.value : c2.defaultValue);
      case "svg":
        return v2(2, null);
      case "math":
        return v2(3, null);
      case "foreignObject":
        return v2(1, null);
      case "table":
        return v2(4, null);
      case "thead":
      case "tbody":
      case "tfoot":
        return v2(5, null);
      case "colgroup":
        return v2(7, null);
      case "tr":
        return v2(6, null);
    }
    return 4 <= a.insertionMode || 0 === a.insertionMode ? v2(1, null) : a;
  }
  var ta2 = /* @__PURE__ */ new Map();
  function ua2(a, b2, c2) {
    if ("object" !== typeof c2) throw Error("The `style` prop expects a mapping from style properties to values, not a string. For example, style={{marginRight: spacing + 'em'}} when using JSX.");
    b2 = true;
    for (var d in c2) if (n2.call(c2, d)) {
      var f2 = c2[d];
      if (null != f2 && "boolean" !== typeof f2 && "" !== f2) {
        if (0 === d.indexOf("--")) {
          var e = u(d);
          f2 = u(("" + f2).trim());
        } else {
          e = d;
          var g = ta2.get(e);
          void 0 !== g ? e = g : (g = u(e.replace(pa2, "-$1").toLowerCase().replace(qa, "-ms-")), ta2.set(e, g), e = g);
          f2 = "number" === typeof f2 ? 0 === f2 || n2.call(
            t,
            d
          ) ? "" + f2 : f2 + "px" : u(("" + f2).trim());
        }
        b2 ? (b2 = false, a.push(' style="', e, ":", f2)) : a.push(";", e, ":", f2);
      }
    }
    b2 || a.push('"');
  }
  function w2(a, b2, c2, d) {
    switch (c2) {
      case "style":
        ua2(a, b2, d);
        return;
      case "defaultValue":
      case "defaultChecked":
      case "innerHTML":
      case "suppressContentEditableWarning":
      case "suppressHydrationWarning":
        return;
    }
    if (!(2 < c2.length) || "o" !== c2[0] && "O" !== c2[0] || "n" !== c2[1] && "N" !== c2[1]) {
      if (b2 = r.hasOwnProperty(c2) ? r[c2] : null, null !== b2) {
        switch (typeof d) {
          case "function":
          case "symbol":
            return;
          case "boolean":
            if (!b2.acceptsBooleans) return;
        }
        c2 = b2.attributeName;
        switch (b2.type) {
          case 3:
            d && a.push(" ", c2, '=""');
            break;
          case 4:
            true === d ? a.push(" ", c2, '=""') : false !== d && a.push(" ", c2, '="', u(d), '"');
            break;
          case 5:
            isNaN(d) || a.push(" ", c2, '="', u(d), '"');
            break;
          case 6:
            !isNaN(d) && 1 <= d && a.push(" ", c2, '="', u(d), '"');
            break;
          default:
            b2.sanitizeURL && (d = "" + d), a.push(" ", c2, '="', u(d), '"');
        }
      } else if (ka2(c2)) {
        switch (typeof d) {
          case "function":
          case "symbol":
            return;
          case "boolean":
            if (b2 = c2.toLowerCase().slice(0, 5), "data-" !== b2 && "aria-" !== b2) return;
        }
        a.push(" ", c2, '="', u(d), '"');
      }
    }
  }
  function x3(a, b2, c2) {
    if (null != b2) {
      if (null != c2) throw Error("Can only set one of `children` or `props.dangerouslySetInnerHTML`.");
      if ("object" !== typeof b2 || !("__html" in b2)) throw Error("`props.dangerouslySetInnerHTML` must be in the form `{__html: ...}`. Please visit https://reactjs.org/link/dangerously-set-inner-html for more information.");
      b2 = b2.__html;
      null !== b2 && void 0 !== b2 && a.push("" + b2);
    }
  }
  function va2(a) {
    var b2 = "";
    ea2.Children.forEach(a, function(a2) {
      null != a2 && (b2 += a2);
    });
    return b2;
  }
  function wa2(a, b2, c2, d) {
    a.push(z2(c2));
    var f2 = c2 = null, e;
    for (e in b2) if (n2.call(b2, e)) {
      var g = b2[e];
      if (null != g) switch (e) {
        case "children":
          c2 = g;
          break;
        case "dangerouslySetInnerHTML":
          f2 = g;
          break;
        default:
          w2(a, d, e, g);
      }
    }
    a.push(">");
    x3(a, f2, c2);
    return "string" === typeof c2 ? (a.push(u(c2)), null) : c2;
  }
  var xa2 = /^[a-zA-Z][a-zA-Z:_\.\-\d]*$/, ya2 = /* @__PURE__ */ new Map();
  function z2(a) {
    var b2 = ya2.get(a);
    if (void 0 === b2) {
      if (!xa2.test(a)) throw Error("Invalid tag: " + a);
      b2 = "<" + a;
      ya2.set(a, b2);
    }
    return b2;
  }
  function za2(a, b2, c2, d, f2) {
    switch (b2) {
      case "select":
        a.push(z2("select"));
        var e = null, g = null;
        for (l in c2) if (n2.call(c2, l)) {
          var h2 = c2[l];
          if (null != h2) switch (l) {
            case "children":
              e = h2;
              break;
            case "dangerouslySetInnerHTML":
              g = h2;
              break;
            case "defaultValue":
            case "value":
              break;
            default:
              w2(a, d, l, h2);
          }
        }
        a.push(">");
        x3(a, g, e);
        return e;
      case "option":
        g = f2.selectedValue;
        a.push(z2("option"));
        var k2 = h2 = null, m2 = null;
        var l = null;
        for (e in c2) if (n2.call(c2, e)) {
          var p2 = c2[e];
          if (null != p2) switch (e) {
            case "children":
              h2 = p2;
              break;
            case "selected":
              m2 = p2;
              break;
            case "dangerouslySetInnerHTML":
              l = p2;
              break;
            case "value":
              k2 = p2;
            default:
              w2(a, d, e, p2);
          }
        }
        if (null != g) if (c2 = null !== k2 ? "" + k2 : va2(h2), ra2(g)) for (d = 0; d < g.length; d++) {
          if ("" + g[d] === c2) {
            a.push(' selected=""');
            break;
          }
        }
        else "" + g === c2 && a.push(' selected=""');
        else m2 && a.push(' selected=""');
        a.push(">");
        x3(a, l, h2);
        return h2;
      case "textarea":
        a.push(z2("textarea"));
        l = g = e = null;
        for (h2 in c2) if (n2.call(c2, h2) && (k2 = c2[h2], null != k2)) switch (h2) {
          case "children":
            l = k2;
            break;
          case "value":
            e = k2;
            break;
          case "defaultValue":
            g = k2;
            break;
          case "dangerouslySetInnerHTML":
            throw Error("`dangerouslySetInnerHTML` does not make sense on <textarea>.");
          default:
            w2(a, d, h2, k2);
        }
        null === e && null !== g && (e = g);
        a.push(">");
        if (null != l) {
          if (null != e) throw Error("If you supply `defaultValue` on a <textarea>, do not pass children.");
          if (ra2(l) && 1 < l.length) throw Error("<textarea> can only have at most one child.");
          e = "" + l;
        }
        "string" === typeof e && "\n" === e[0] && a.push("\n");
        null !== e && a.push(u("" + e));
        return null;
      case "input":
        a.push(z2("input"));
        k2 = l = h2 = e = null;
        for (g in c2) if (n2.call(c2, g) && (m2 = c2[g], null != m2)) switch (g) {
          case "children":
          case "dangerouslySetInnerHTML":
            throw Error("input is a self-closing tag and must neither have `children` nor use `dangerouslySetInnerHTML`.");
          case "defaultChecked":
            k2 = m2;
            break;
          case "defaultValue":
            h2 = m2;
            break;
          case "checked":
            l = m2;
            break;
          case "value":
            e = m2;
            break;
          default:
            w2(a, d, g, m2);
        }
        null !== l ? w2(a, d, "checked", l) : null !== k2 && w2(a, d, "checked", k2);
        null !== e ? w2(a, d, "value", e) : null !== h2 && w2(a, d, "value", h2);
        a.push("/>");
        return null;
      case "menuitem":
        a.push(z2("menuitem"));
        for (var B2 in c2) if (n2.call(c2, B2) && (e = c2[B2], null != e)) switch (B2) {
          case "children":
          case "dangerouslySetInnerHTML":
            throw Error("menuitems cannot have `children` nor `dangerouslySetInnerHTML`.");
          default:
            w2(
              a,
              d,
              B2,
              e
            );
        }
        a.push(">");
        return null;
      case "title":
        a.push(z2("title"));
        e = null;
        for (p2 in c2) if (n2.call(c2, p2) && (g = c2[p2], null != g)) switch (p2) {
          case "children":
            e = g;
            break;
          case "dangerouslySetInnerHTML":
            throw Error("`dangerouslySetInnerHTML` does not make sense on <title>.");
          default:
            w2(a, d, p2, g);
        }
        a.push(">");
        return e;
      case "listing":
      case "pre":
        a.push(z2(b2));
        g = e = null;
        for (k2 in c2) if (n2.call(c2, k2) && (h2 = c2[k2], null != h2)) switch (k2) {
          case "children":
            e = h2;
            break;
          case "dangerouslySetInnerHTML":
            g = h2;
            break;
          default:
            w2(a, d, k2, h2);
        }
        a.push(">");
        if (null != g) {
          if (null != e) throw Error("Can only set one of `children` or `props.dangerouslySetInnerHTML`.");
          if ("object" !== typeof g || !("__html" in g)) throw Error("`props.dangerouslySetInnerHTML` must be in the form `{__html: ...}`. Please visit https://reactjs.org/link/dangerously-set-inner-html for more information.");
          c2 = g.__html;
          null !== c2 && void 0 !== c2 && ("string" === typeof c2 && 0 < c2.length && "\n" === c2[0] ? a.push("\n", c2) : a.push("" + c2));
        }
        "string" === typeof e && "\n" === e[0] && a.push("\n");
        return e;
      case "area":
      case "base":
      case "br":
      case "col":
      case "embed":
      case "hr":
      case "img":
      case "keygen":
      case "link":
      case "meta":
      case "param":
      case "source":
      case "track":
      case "wbr":
        a.push(z2(b2));
        for (var C2 in c2) if (n2.call(c2, C2) && (e = c2[C2], null != e)) switch (C2) {
          case "children":
          case "dangerouslySetInnerHTML":
            throw Error(b2 + " is a self-closing tag and must neither have `children` nor use `dangerouslySetInnerHTML`.");
          default:
            w2(a, d, C2, e);
        }
        a.push("/>");
        return null;
      case "annotation-xml":
      case "color-profile":
      case "font-face":
      case "font-face-src":
      case "font-face-uri":
      case "font-face-format":
      case "font-face-name":
      case "missing-glyph":
        return wa2(a, c2, b2, d);
      case "html":
        return 0 === f2.insertionMode && a.push("<!DOCTYPE html>"), wa2(a, c2, b2, d);
      default:
        if (-1 === b2.indexOf("-") && "string" !== typeof c2.is) return wa2(a, c2, b2, d);
        a.push(z2(b2));
        g = e = null;
        for (m2 in c2) if (n2.call(c2, m2) && (h2 = c2[m2], null != h2)) switch (m2) {
          case "children":
            e = h2;
            break;
          case "dangerouslySetInnerHTML":
            g = h2;
            break;
          case "style":
            ua2(a, d, h2);
            break;
          case "suppressContentEditableWarning":
          case "suppressHydrationWarning":
            break;
          default:
            ka2(m2) && "function" !== typeof h2 && "symbol" !== typeof h2 && a.push(" ", m2, '="', u(h2), '"');
        }
        a.push(">");
        x3(a, g, e);
        return e;
    }
  }
  function Aa2(a, b2, c2) {
    a.push('<!--$?--><template id="');
    if (null === c2) throw Error("An ID must have been assigned before we can complete the boundary.");
    a.push(c2);
    return a.push('"></template>');
  }
  function Ba2(a, b2, c2, d) {
    switch (c2.insertionMode) {
      case 0:
      case 1:
        return a.push('<div hidden id="'), a.push(b2.segmentPrefix), b2 = d.toString(16), a.push(b2), a.push('">');
      case 2:
        return a.push('<svg aria-hidden="true" style="display:none" id="'), a.push(b2.segmentPrefix), b2 = d.toString(16), a.push(b2), a.push('">');
      case 3:
        return a.push('<math aria-hidden="true" style="display:none" id="'), a.push(b2.segmentPrefix), b2 = d.toString(16), a.push(b2), a.push('">');
      case 4:
        return a.push('<table hidden id="'), a.push(b2.segmentPrefix), b2 = d.toString(16), a.push(b2), a.push('">');
      case 5:
        return a.push('<table hidden><tbody id="'), a.push(b2.segmentPrefix), b2 = d.toString(16), a.push(b2), a.push('">');
      case 6:
        return a.push('<table hidden><tr id="'), a.push(b2.segmentPrefix), b2 = d.toString(16), a.push(b2), a.push('">');
      case 7:
        return a.push('<table hidden><colgroup id="'), a.push(b2.segmentPrefix), b2 = d.toString(16), a.push(b2), a.push('">');
      default:
        throw Error("Unknown insertion mode. This is a bug in React.");
    }
  }
  function Ca2(a, b2) {
    switch (b2.insertionMode) {
      case 0:
      case 1:
        return a.push("</div>");
      case 2:
        return a.push("</svg>");
      case 3:
        return a.push("</math>");
      case 4:
        return a.push("</table>");
      case 5:
        return a.push("</tbody></table>");
      case 6:
        return a.push("</tr></table>");
      case 7:
        return a.push("</colgroup></table>");
      default:
        throw Error("Unknown insertion mode. This is a bug in React.");
    }
  }
  var Da2 = /[<\u2028\u2029]/g;
  function Ea2(a) {
    return JSON.stringify(a).replace(Da2, function(a2) {
      switch (a2) {
        case "<":
          return "\\u003c";
        case "\u2028":
          return "\\u2028";
        case "\u2029":
          return "\\u2029";
        default:
          throw Error("escapeJSStringsForInstructionScripts encountered a match it does not know how to replace. this means the match regex and the replacement characters are no longer in sync. This is a bug in React");
      }
    });
  }
  function Fa2(a, b2) {
    b2 = void 0 === b2 ? "" : b2;
    return { bootstrapChunks: [], startInlineScript: "<script>", placeholderPrefix: b2 + "P:", segmentPrefix: b2 + "S:", boundaryPrefix: b2 + "B:", idPrefix: b2, nextSuspenseID: 0, sentCompleteSegmentFunction: false, sentCompleteBoundaryFunction: false, sentClientRenderFunction: false, generateStaticMarkup: a };
  }
  function Ga() {
    return { insertionMode: 1, selectedValue: null };
  }
  function Ha(a, b2, c2, d) {
    if (c2.generateStaticMarkup) return a.push(u(b2)), false;
    "" === b2 ? a = d : (d && a.push("<!-- -->"), a.push(u(b2)), a = true);
    return a;
  }
  var A2 = Object.assign, Ia2 = /* @__PURE__ */ Symbol.for("react.element"), Ja = /* @__PURE__ */ Symbol.for("react.portal"), Ka = /* @__PURE__ */ Symbol.for("react.fragment"), La2 = /* @__PURE__ */ Symbol.for("react.strict_mode"), Ma2 = /* @__PURE__ */ Symbol.for("react.profiler"), Na2 = /* @__PURE__ */ Symbol.for("react.provider"), Oa2 = /* @__PURE__ */ Symbol.for("react.context"), Pa2 = /* @__PURE__ */ Symbol.for("react.forward_ref"), Qa = /* @__PURE__ */ Symbol.for("react.suspense"), Ra2 = /* @__PURE__ */ Symbol.for("react.suspense_list"), Sa2 = /* @__PURE__ */ Symbol.for("react.memo"), Ta2 = /* @__PURE__ */ Symbol.for("react.lazy"), Ua = /* @__PURE__ */ Symbol.for("react.scope"), Va2 = /* @__PURE__ */ Symbol.for("react.debug_trace_mode"), Wa = /* @__PURE__ */ Symbol.for("react.legacy_hidden"), Xa = /* @__PURE__ */ Symbol.for("react.default_value"), Ya = Symbol.iterator;
  function Za(a) {
    if (null == a) return null;
    if ("function" === typeof a) return a.displayName || a.name || null;
    if ("string" === typeof a) return a;
    switch (a) {
      case Ka:
        return "Fragment";
      case Ja:
        return "Portal";
      case Ma2:
        return "Profiler";
      case La2:
        return "StrictMode";
      case Qa:
        return "Suspense";
      case Ra2:
        return "SuspenseList";
    }
    if ("object" === typeof a) switch (a.$$typeof) {
      case Oa2:
        return (a.displayName || "Context") + ".Consumer";
      case Na2:
        return (a._context.displayName || "Context") + ".Provider";
      case Pa2:
        var b2 = a.render;
        a = a.displayName;
        a || (a = b2.displayName || b2.name || "", a = "" !== a ? "ForwardRef(" + a + ")" : "ForwardRef");
        return a;
      case Sa2:
        return b2 = a.displayName || null, null !== b2 ? b2 : Za(a.type) || "Memo";
      case Ta2:
        b2 = a._payload;
        a = a._init;
        try {
          return Za(a(b2));
        } catch (c2) {
        }
    }
    return null;
  }
  var $a = {};
  function ab(a, b2) {
    a = a.contextTypes;
    if (!a) return $a;
    var c2 = {}, d;
    for (d in a) c2[d] = b2[d];
    return c2;
  }
  var D2 = null;
  function E2(a, b2) {
    if (a !== b2) {
      a.context._currentValue2 = a.parentValue;
      a = a.parent;
      var c2 = b2.parent;
      if (null === a) {
        if (null !== c2) throw Error("The stacks must reach the root at the same time. This is a bug in React.");
      } else {
        if (null === c2) throw Error("The stacks must reach the root at the same time. This is a bug in React.");
        E2(a, c2);
      }
      b2.context._currentValue2 = b2.value;
    }
  }
  function bb(a) {
    a.context._currentValue2 = a.parentValue;
    a = a.parent;
    null !== a && bb(a);
  }
  function cb(a) {
    var b2 = a.parent;
    null !== b2 && cb(b2);
    a.context._currentValue2 = a.value;
  }
  function db(a, b2) {
    a.context._currentValue2 = a.parentValue;
    a = a.parent;
    if (null === a) throw Error("The depth must equal at least at zero before reaching the root. This is a bug in React.");
    a.depth === b2.depth ? E2(a, b2) : db(a, b2);
  }
  function eb(a, b2) {
    var c2 = b2.parent;
    if (null === c2) throw Error("The depth must equal at least at zero before reaching the root. This is a bug in React.");
    a.depth === c2.depth ? E2(a, c2) : eb(a, c2);
    b2.context._currentValue2 = b2.value;
  }
  function F2(a) {
    var b2 = D2;
    b2 !== a && (null === b2 ? cb(a) : null === a ? bb(b2) : b2.depth === a.depth ? E2(b2, a) : b2.depth > a.depth ? db(b2, a) : eb(b2, a), D2 = a);
  }
  var fb = { isMounted: function() {
    return false;
  }, enqueueSetState: function(a, b2) {
    a = a._reactInternals;
    null !== a.queue && a.queue.push(b2);
  }, enqueueReplaceState: function(a, b2) {
    a = a._reactInternals;
    a.replace = true;
    a.queue = [b2];
  }, enqueueForceUpdate: function() {
  } };
  function gb(a, b2, c2, d) {
    var f2 = void 0 !== a.state ? a.state : null;
    a.updater = fb;
    a.props = c2;
    a.state = f2;
    var e = { queue: [], replace: false };
    a._reactInternals = e;
    var g = b2.contextType;
    a.context = "object" === typeof g && null !== g ? g._currentValue2 : d;
    g = b2.getDerivedStateFromProps;
    "function" === typeof g && (g = g(c2, f2), f2 = null === g || void 0 === g ? f2 : A2({}, f2, g), a.state = f2);
    if ("function" !== typeof b2.getDerivedStateFromProps && "function" !== typeof a.getSnapshotBeforeUpdate && ("function" === typeof a.UNSAFE_componentWillMount || "function" === typeof a.componentWillMount)) if (b2 = a.state, "function" === typeof a.componentWillMount && a.componentWillMount(), "function" === typeof a.UNSAFE_componentWillMount && a.UNSAFE_componentWillMount(), b2 !== a.state && fb.enqueueReplaceState(a, a.state, null), null !== e.queue && 0 < e.queue.length) if (b2 = e.queue, g = e.replace, e.queue = null, e.replace = false, g && 1 === b2.length) a.state = b2[0];
    else {
      e = g ? b2[0] : a.state;
      f2 = true;
      for (g = g ? 1 : 0; g < b2.length; g++) {
        var h2 = b2[g];
        h2 = "function" === typeof h2 ? h2.call(a, e, c2, d) : h2;
        null != h2 && (f2 ? (f2 = false, e = A2({}, e, h2)) : A2(e, h2));
      }
      a.state = e;
    }
    else e.queue = null;
  }
  var hb = { id: 1, overflow: "" };
  function ib(a, b2, c2) {
    var d = a.id;
    a = a.overflow;
    var f2 = 32 - G(d) - 1;
    d &= ~(1 << f2);
    c2 += 1;
    var e = 32 - G(b2) + f2;
    if (30 < e) {
      var g = f2 - f2 % 5;
      e = (d & (1 << g) - 1).toString(32);
      d >>= g;
      f2 -= g;
      return { id: 1 << 32 - G(b2) + f2 | c2 << f2 | d, overflow: e + a };
    }
    return { id: 1 << e | c2 << f2 | d, overflow: a };
  }
  var G = Math.clz32 ? Math.clz32 : jb, kb = Math.log, lb = Math.LN2;
  function jb(a) {
    a >>>= 0;
    return 0 === a ? 32 : 31 - (kb(a) / lb | 0) | 0;
  }
  function mb(a, b2) {
    return a === b2 && (0 !== a || 1 / a === 1 / b2) || a !== a && b2 !== b2;
  }
  var nb = "function" === typeof Object.is ? Object.is : mb, H2 = null, ob = null, I2 = null, J2 = null, K = false, L2 = false, M2 = 0, N2 = null, O2 = 0;
  function P2() {
    if (null === H2) throw Error("Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://reactjs.org/link/invalid-hook-call for tips about how to debug and fix this problem.");
    return H2;
  }
  function rb() {
    if (0 < O2) throw Error("Rendered more hooks than during the previous render");
    return { memoizedState: null, queue: null, next: null };
  }
  function sb() {
    null === J2 ? null === I2 ? (K = false, I2 = J2 = rb()) : (K = true, J2 = I2) : null === J2.next ? (K = false, J2 = J2.next = rb()) : (K = true, J2 = J2.next);
    return J2;
  }
  function tb() {
    ob = H2 = null;
    L2 = false;
    I2 = null;
    O2 = 0;
    J2 = N2 = null;
  }
  function ub(a, b2) {
    return "function" === typeof b2 ? b2(a) : b2;
  }
  function vb(a, b2, c2) {
    H2 = P2();
    J2 = sb();
    if (K) {
      var d = J2.queue;
      b2 = d.dispatch;
      if (null !== N2 && (c2 = N2.get(d), void 0 !== c2)) {
        N2.delete(d);
        d = J2.memoizedState;
        do
          d = a(d, c2.action), c2 = c2.next;
        while (null !== c2);
        J2.memoizedState = d;
        return [d, b2];
      }
      return [J2.memoizedState, b2];
    }
    a = a === ub ? "function" === typeof b2 ? b2() : b2 : void 0 !== c2 ? c2(b2) : b2;
    J2.memoizedState = a;
    a = J2.queue = { last: null, dispatch: null };
    a = a.dispatch = wb.bind(null, H2, a);
    return [J2.memoizedState, a];
  }
  function xb(a, b2) {
    H2 = P2();
    J2 = sb();
    b2 = void 0 === b2 ? null : b2;
    if (null !== J2) {
      var c2 = J2.memoizedState;
      if (null !== c2 && null !== b2) {
        var d = c2[1];
        a: if (null === d) d = false;
        else {
          for (var f2 = 0; f2 < d.length && f2 < b2.length; f2++) if (!nb(b2[f2], d[f2])) {
            d = false;
            break a;
          }
          d = true;
        }
        if (d) return c2[0];
      }
    }
    a = a();
    J2.memoizedState = [a, b2];
    return a;
  }
  function wb(a, b2, c2) {
    if (25 <= O2) throw Error("Too many re-renders. React limits the number of renders to prevent an infinite loop.");
    if (a === H2) if (L2 = true, a = { action: c2, next: null }, null === N2 && (N2 = /* @__PURE__ */ new Map()), c2 = N2.get(b2), void 0 === c2) N2.set(b2, a);
    else {
      for (b2 = c2; null !== b2.next; ) b2 = b2.next;
      b2.next = a;
    }
  }
  function yb() {
    throw Error("startTransition cannot be called during server rendering.");
  }
  function Q2() {
  }
  var zb = { readContext: function(a) {
    return a._currentValue2;
  }, useContext: function(a) {
    P2();
    return a._currentValue2;
  }, useMemo: xb, useReducer: vb, useRef: function(a) {
    H2 = P2();
    J2 = sb();
    var b2 = J2.memoizedState;
    return null === b2 ? (a = { current: a }, J2.memoizedState = a) : b2;
  }, useState: function(a) {
    return vb(ub, a);
  }, useInsertionEffect: Q2, useLayoutEffect: function() {
  }, useCallback: function(a, b2) {
    return xb(function() {
      return a;
    }, b2);
  }, useImperativeHandle: Q2, useEffect: Q2, useDebugValue: Q2, useDeferredValue: function(a) {
    P2();
    return a;
  }, useTransition: function() {
    P2();
    return [false, yb];
  }, useId: function() {
    var a = ob.treeContext;
    var b2 = a.overflow;
    a = a.id;
    a = (a & ~(1 << 32 - G(a) - 1)).toString(32) + b2;
    var c2 = R2;
    if (null === c2) throw Error("Invalid hook call. Hooks can only be called inside of the body of a function component.");
    b2 = M2++;
    a = ":" + c2.idPrefix + "R" + a;
    0 < b2 && (a += "H" + b2.toString(32));
    return a + ":";
  }, useMutableSource: function(a, b2) {
    P2();
    return b2(a._source);
  }, useSyncExternalStore: function(a, b2, c2) {
    if (void 0 === c2) throw Error("Missing getServerSnapshot, which is required for server-rendered content. Will revert to client rendering.");
    return c2();
  } }, R2 = null, Ab = ea2.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher;
  function Bb(a) {
    console.error(a);
    return null;
  }
  function S() {
  }
  function Cb(a, b2, c2, d, f2, e, g, h2, k2) {
    var m2 = [], l = /* @__PURE__ */ new Set();
    b2 = { destination: null, responseState: b2, progressiveChunkSize: void 0 === d ? 12800 : d, status: 0, fatalError: null, nextSegmentId: 0, allPendingTasks: 0, pendingRootTasks: 0, completedRootSegment: null, abortableTasks: l, pingedTasks: m2, clientRenderedBoundaries: [], completedBoundaries: [], partialBoundaries: [], onError: void 0 === f2 ? Bb : f2, onAllReady: void 0 === e ? S : e, onShellReady: void 0 === g ? S : g, onShellError: S, onFatalError: S };
    c2 = T2(b2, 0, null, c2, false, false);
    c2.parentFlushed = true;
    a = Db(b2, a, null, c2, l, $a, null, hb);
    m2.push(a);
    return b2;
  }
  function Db(a, b2, c2, d, f2, e, g, h2) {
    a.allPendingTasks++;
    null === c2 ? a.pendingRootTasks++ : c2.pendingTasks++;
    var k2 = { node: b2, ping: function() {
      var b3 = a.pingedTasks;
      b3.push(k2);
      1 === b3.length && Eb(a);
    }, blockedBoundary: c2, blockedSegment: d, abortSet: f2, legacyContext: e, context: g, treeContext: h2 };
    f2.add(k2);
    return k2;
  }
  function T2(a, b2, c2, d, f2, e) {
    return { status: 0, id: -1, index: b2, parentFlushed: false, chunks: [], children: [], formatContext: d, boundary: c2, lastPushedText: f2, textEmbedded: e };
  }
  function U2(a, b2) {
    a = a.onError(b2);
    if (null != a && "string" !== typeof a) throw Error('onError returned something with a type other than "string". onError should return a string and may return null or undefined but must not return anything else. It received something of type "' + typeof a + '" instead');
    return a;
  }
  function V2(a, b2) {
    var c2 = a.onShellError;
    c2(b2);
    c2 = a.onFatalError;
    c2(b2);
    null !== a.destination ? (a.status = 2, a.destination.destroy(b2)) : (a.status = 1, a.fatalError = b2);
  }
  function Fb(a, b2, c2, d, f2) {
    H2 = {};
    ob = b2;
    M2 = 0;
    for (a = c2(d, f2); L2; ) L2 = false, M2 = 0, O2 += 1, J2 = null, a = c2(d, f2);
    tb();
    return a;
  }
  function Gb(a, b2, c2, d) {
    var f2 = c2.render(), e = d.childContextTypes;
    if (null !== e && void 0 !== e) {
      var g = b2.legacyContext;
      if ("function" !== typeof c2.getChildContext) d = g;
      else {
        c2 = c2.getChildContext();
        for (var h2 in c2) if (!(h2 in e)) throw Error((Za(d) || "Unknown") + '.getChildContext(): key "' + h2 + '" is not defined in childContextTypes.');
        d = A2({}, g, c2);
      }
      b2.legacyContext = d;
      W2(a, b2, f2);
      b2.legacyContext = g;
    } else W2(a, b2, f2);
  }
  function Hb(a, b2) {
    if (a && a.defaultProps) {
      b2 = A2({}, b2);
      a = a.defaultProps;
      for (var c2 in a) void 0 === b2[c2] && (b2[c2] = a[c2]);
      return b2;
    }
    return b2;
  }
  function Ib(a, b2, c2, d, f2) {
    if ("function" === typeof c2) if (c2.prototype && c2.prototype.isReactComponent) {
      f2 = ab(c2, b2.legacyContext);
      var e = c2.contextType;
      e = new c2(d, "object" === typeof e && null !== e ? e._currentValue2 : f2);
      gb(e, c2, d, f2);
      Gb(a, b2, e, c2);
    } else {
      e = ab(c2, b2.legacyContext);
      f2 = Fb(a, b2, c2, d, e);
      var g = 0 !== M2;
      if ("object" === typeof f2 && null !== f2 && "function" === typeof f2.render && void 0 === f2.$$typeof) gb(f2, c2, d, e), Gb(a, b2, f2, c2);
      else if (g) {
        d = b2.treeContext;
        b2.treeContext = ib(d, 1, 0);
        try {
          W2(a, b2, f2);
        } finally {
          b2.treeContext = d;
        }
      } else W2(a, b2, f2);
    }
    else if ("string" === typeof c2) {
      f2 = b2.blockedSegment;
      e = za2(f2.chunks, c2, d, a.responseState, f2.formatContext);
      f2.lastPushedText = false;
      g = f2.formatContext;
      f2.formatContext = sa2(g, c2, d);
      Jb(a, b2, e);
      f2.formatContext = g;
      switch (c2) {
        case "area":
        case "base":
        case "br":
        case "col":
        case "embed":
        case "hr":
        case "img":
        case "input":
        case "keygen":
        case "link":
        case "meta":
        case "param":
        case "source":
        case "track":
        case "wbr":
          break;
        default:
          f2.chunks.push("</", c2, ">");
      }
      f2.lastPushedText = false;
    } else {
      switch (c2) {
        case Wa:
        case Va2:
        case La2:
        case Ma2:
        case Ka:
          W2(a, b2, d.children);
          return;
        case Ra2:
          W2(a, b2, d.children);
          return;
        case Ua:
          throw Error("ReactDOMServer does not yet support scope components.");
        case Qa:
          a: {
            c2 = b2.blockedBoundary;
            f2 = b2.blockedSegment;
            e = d.fallback;
            d = d.children;
            g = /* @__PURE__ */ new Set();
            var h2 = { id: null, rootSegmentID: -1, parentFlushed: false, pendingTasks: 0, forceClientRender: false, completedSegments: [], byteSize: 0, fallbackAbortableTasks: g, errorDigest: null }, k2 = T2(a, f2.chunks.length, h2, f2.formatContext, false, false);
            f2.children.push(k2);
            f2.lastPushedText = false;
            var m2 = T2(a, 0, null, f2.formatContext, false, false);
            m2.parentFlushed = true;
            b2.blockedBoundary = h2;
            b2.blockedSegment = m2;
            try {
              if (Jb(a, b2, d), a.responseState.generateStaticMarkup || m2.lastPushedText && m2.textEmbedded && m2.chunks.push("<!-- -->"), m2.status = 1, X2(h2, m2), 0 === h2.pendingTasks) break a;
            } catch (l) {
              m2.status = 4, h2.forceClientRender = true, h2.errorDigest = U2(a, l);
            } finally {
              b2.blockedBoundary = c2, b2.blockedSegment = f2;
            }
            b2 = Db(a, e, c2, k2, g, b2.legacyContext, b2.context, b2.treeContext);
            a.pingedTasks.push(b2);
          }
          return;
      }
      if ("object" === typeof c2 && null !== c2) switch (c2.$$typeof) {
        case Pa2:
          d = Fb(a, b2, c2.render, d, f2);
          if (0 !== M2) {
            c2 = b2.treeContext;
            b2.treeContext = ib(c2, 1, 0);
            try {
              W2(a, b2, d);
            } finally {
              b2.treeContext = c2;
            }
          } else W2(a, b2, d);
          return;
        case Sa2:
          c2 = c2.type;
          d = Hb(c2, d);
          Ib(a, b2, c2, d, f2);
          return;
        case Na2:
          f2 = d.children;
          c2 = c2._context;
          d = d.value;
          e = c2._currentValue2;
          c2._currentValue2 = d;
          g = D2;
          D2 = d = { parent: g, depth: null === g ? 0 : g.depth + 1, context: c2, parentValue: e, value: d };
          b2.context = d;
          W2(a, b2, f2);
          a = D2;
          if (null === a) throw Error("Tried to pop a Context at the root of the app. This is a bug in React.");
          d = a.parentValue;
          a.context._currentValue2 = d === Xa ? a.context._defaultValue : d;
          a = D2 = a.parent;
          b2.context = a;
          return;
        case Oa2:
          d = d.children;
          d = d(c2._currentValue2);
          W2(a, b2, d);
          return;
        case Ta2:
          f2 = c2._init;
          c2 = f2(c2._payload);
          d = Hb(c2, d);
          Ib(a, b2, c2, d, void 0);
          return;
      }
      throw Error("Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: " + ((null == c2 ? c2 : typeof c2) + "."));
    }
  }
  function W2(a, b2, c2) {
    b2.node = c2;
    if ("object" === typeof c2 && null !== c2) {
      switch (c2.$$typeof) {
        case Ia2:
          Ib(a, b2, c2.type, c2.props, c2.ref);
          return;
        case Ja:
          throw Error("Portals are not currently supported by the server renderer. Render them conditionally so that they only appear on the client render.");
        case Ta2:
          var d = c2._init;
          c2 = d(c2._payload);
          W2(a, b2, c2);
          return;
      }
      if (ra2(c2)) {
        Kb(a, b2, c2);
        return;
      }
      null === c2 || "object" !== typeof c2 ? d = null : (d = Ya && c2[Ya] || c2["@@iterator"], d = "function" === typeof d ? d : null);
      if (d && (d = d.call(c2))) {
        c2 = d.next();
        if (!c2.done) {
          var f2 = [];
          do
            f2.push(c2.value), c2 = d.next();
          while (!c2.done);
          Kb(a, b2, f2);
        }
        return;
      }
      a = Object.prototype.toString.call(c2);
      throw Error("Objects are not valid as a React child (found: " + ("[object Object]" === a ? "object with keys {" + Object.keys(c2).join(", ") + "}" : a) + "). If you meant to render a collection of children, use an array instead.");
    }
    "string" === typeof c2 ? (d = b2.blockedSegment, d.lastPushedText = Ha(b2.blockedSegment.chunks, c2, a.responseState, d.lastPushedText)) : "number" === typeof c2 && (d = b2.blockedSegment, d.lastPushedText = Ha(
      b2.blockedSegment.chunks,
      "" + c2,
      a.responseState,
      d.lastPushedText
    ));
  }
  function Kb(a, b2, c2) {
    for (var d = c2.length, f2 = 0; f2 < d; f2++) {
      var e = b2.treeContext;
      b2.treeContext = ib(e, d, f2);
      try {
        Jb(a, b2, c2[f2]);
      } finally {
        b2.treeContext = e;
      }
    }
  }
  function Jb(a, b2, c2) {
    var d = b2.blockedSegment.formatContext, f2 = b2.legacyContext, e = b2.context;
    try {
      return W2(a, b2, c2);
    } catch (k2) {
      if (tb(), "object" === typeof k2 && null !== k2 && "function" === typeof k2.then) {
        c2 = k2;
        var g = b2.blockedSegment, h2 = T2(a, g.chunks.length, null, g.formatContext, g.lastPushedText, true);
        g.children.push(h2);
        g.lastPushedText = false;
        a = Db(a, b2.node, b2.blockedBoundary, h2, b2.abortSet, b2.legacyContext, b2.context, b2.treeContext).ping;
        c2.then(a, a);
        b2.blockedSegment.formatContext = d;
        b2.legacyContext = f2;
        b2.context = e;
        F2(e);
      } else throw b2.blockedSegment.formatContext = d, b2.legacyContext = f2, b2.context = e, F2(e), k2;
    }
  }
  function Lb(a) {
    var b2 = a.blockedBoundary;
    a = a.blockedSegment;
    a.status = 3;
    Mb(this, b2, a);
  }
  function Nb(a, b2, c2) {
    var d = a.blockedBoundary;
    a.blockedSegment.status = 3;
    null === d ? (b2.allPendingTasks--, 2 !== b2.status && (b2.status = 2, null !== b2.destination && b2.destination.push(null))) : (d.pendingTasks--, d.forceClientRender || (d.forceClientRender = true, d.errorDigest = b2.onError(void 0 === c2 ? Error("The render was aborted by the server without a reason.") : c2), d.parentFlushed && b2.clientRenderedBoundaries.push(d)), d.fallbackAbortableTasks.forEach(function(a2) {
      return Nb(a2, b2, c2);
    }), d.fallbackAbortableTasks.clear(), b2.allPendingTasks--, 0 === b2.allPendingTasks && (a = b2.onAllReady, a()));
  }
  function X2(a, b2) {
    if (0 === b2.chunks.length && 1 === b2.children.length && null === b2.children[0].boundary) {
      var c2 = b2.children[0];
      c2.id = b2.id;
      c2.parentFlushed = true;
      1 === c2.status && X2(a, c2);
    } else a.completedSegments.push(b2);
  }
  function Mb(a, b2, c2) {
    if (null === b2) {
      if (c2.parentFlushed) {
        if (null !== a.completedRootSegment) throw Error("There can only be one root segment. This is a bug in React.");
        a.completedRootSegment = c2;
      }
      a.pendingRootTasks--;
      0 === a.pendingRootTasks && (a.onShellError = S, b2 = a.onShellReady, b2());
    } else b2.pendingTasks--, b2.forceClientRender || (0 === b2.pendingTasks ? (c2.parentFlushed && 1 === c2.status && X2(b2, c2), b2.parentFlushed && a.completedBoundaries.push(b2), b2.fallbackAbortableTasks.forEach(Lb, a), b2.fallbackAbortableTasks.clear()) : c2.parentFlushed && 1 === c2.status && (X2(b2, c2), 1 === b2.completedSegments.length && b2.parentFlushed && a.partialBoundaries.push(b2)));
    a.allPendingTasks--;
    0 === a.allPendingTasks && (a = a.onAllReady, a());
  }
  function Eb(a) {
    if (2 !== a.status) {
      var b2 = D2, c2 = Ab.current;
      Ab.current = zb;
      var d = R2;
      R2 = a.responseState;
      try {
        var f2 = a.pingedTasks, e;
        for (e = 0; e < f2.length; e++) {
          var g = f2[e];
          var h2 = a, k2 = g.blockedSegment;
          if (0 === k2.status) {
            F2(g.context);
            try {
              W2(h2, g, g.node), h2.responseState.generateStaticMarkup || k2.lastPushedText && k2.textEmbedded && k2.chunks.push("<!-- -->"), g.abortSet.delete(g), k2.status = 1, Mb(h2, g.blockedBoundary, k2);
            } catch (y2) {
              if (tb(), "object" === typeof y2 && null !== y2 && "function" === typeof y2.then) {
                var m2 = g.ping;
                y2.then(m2, m2);
              } else {
                g.abortSet.delete(g);
                k2.status = 4;
                var l = g.blockedBoundary, p2 = y2, B2 = U2(h2, p2);
                null === l ? V2(h2, p2) : (l.pendingTasks--, l.forceClientRender || (l.forceClientRender = true, l.errorDigest = B2, l.parentFlushed && h2.clientRenderedBoundaries.push(l)));
                h2.allPendingTasks--;
                if (0 === h2.allPendingTasks) {
                  var C2 = h2.onAllReady;
                  C2();
                }
              }
            } finally {
            }
          }
        }
        f2.splice(0, e);
        null !== a.destination && Ob(a, a.destination);
      } catch (y2) {
        U2(a, y2), V2(a, y2);
      } finally {
        R2 = d, Ab.current = c2, c2 === zb && F2(b2);
      }
    }
  }
  function Y2(a, b2, c2) {
    c2.parentFlushed = true;
    switch (c2.status) {
      case 0:
        var d = c2.id = a.nextSegmentId++;
        c2.lastPushedText = false;
        c2.textEmbedded = false;
        a = a.responseState;
        b2.push('<template id="');
        b2.push(a.placeholderPrefix);
        a = d.toString(16);
        b2.push(a);
        return b2.push('"></template>');
      case 1:
        c2.status = 2;
        var f2 = true;
        d = c2.chunks;
        var e = 0;
        c2 = c2.children;
        for (var g = 0; g < c2.length; g++) {
          for (f2 = c2[g]; e < f2.index; e++) b2.push(d[e]);
          f2 = Z2(a, b2, f2);
        }
        for (; e < d.length - 1; e++) b2.push(d[e]);
        e < d.length && (f2 = b2.push(d[e]));
        return f2;
      default:
        throw Error("Aborted, errored or already flushed boundaries should not be flushed again. This is a bug in React.");
    }
  }
  function Z2(a, b2, c2) {
    var d = c2.boundary;
    if (null === d) return Y2(a, b2, c2);
    d.parentFlushed = true;
    if (d.forceClientRender) return a.responseState.generateStaticMarkup || (d = d.errorDigest, b2.push("<!--$!-->"), b2.push("<template"), d && (b2.push(' data-dgst="'), d = u(d), b2.push(d), b2.push('"')), b2.push("></template>")), Y2(a, b2, c2), a = a.responseState.generateStaticMarkup ? true : b2.push("<!--/$-->"), a;
    if (0 < d.pendingTasks) {
      d.rootSegmentID = a.nextSegmentId++;
      0 < d.completedSegments.length && a.partialBoundaries.push(d);
      var f2 = a.responseState;
      var e = f2.nextSuspenseID++;
      f2 = f2.boundaryPrefix + e.toString(16);
      d = d.id = f2;
      Aa2(b2, a.responseState, d);
      Y2(a, b2, c2);
      return b2.push("<!--/$-->");
    }
    if (d.byteSize > a.progressiveChunkSize) return d.rootSegmentID = a.nextSegmentId++, a.completedBoundaries.push(d), Aa2(b2, a.responseState, d.id), Y2(a, b2, c2), b2.push("<!--/$-->");
    a.responseState.generateStaticMarkup || b2.push("<!--$-->");
    c2 = d.completedSegments;
    if (1 !== c2.length) throw Error("A previously unvisited boundary must have exactly one root segment. This is a bug in React.");
    Z2(a, b2, c2[0]);
    a = a.responseState.generateStaticMarkup ? true : b2.push("<!--/$-->");
    return a;
  }
  function Pb(a, b2, c2) {
    Ba2(b2, a.responseState, c2.formatContext, c2.id);
    Z2(a, b2, c2);
    return Ca2(b2, c2.formatContext);
  }
  function Qb(a, b2, c2) {
    for (var d = c2.completedSegments, f2 = 0; f2 < d.length; f2++) Rb(a, b2, c2, d[f2]);
    d.length = 0;
    a = a.responseState;
    d = c2.id;
    c2 = c2.rootSegmentID;
    b2.push(a.startInlineScript);
    a.sentCompleteBoundaryFunction ? b2.push('$RC("') : (a.sentCompleteBoundaryFunction = true, b2.push('function $RC(a,b){a=document.getElementById(a);b=document.getElementById(b);b.parentNode.removeChild(b);if(a){a=a.previousSibling;var f=a.parentNode,c=a.nextSibling,e=0;do{if(c&&8===c.nodeType){var d=c.data;if("/$"===d)if(0===e)break;else e--;else"$"!==d&&"$?"!==d&&"$!"!==d||e++}d=c.nextSibling;f.removeChild(c);c=d}while(c);for(;b.firstChild;)f.insertBefore(b.firstChild,c);a.data="$";a._reactRetry&&a._reactRetry()}};$RC("'));
    if (null === d) throw Error("An ID must have been assigned before we can complete the boundary.");
    c2 = c2.toString(16);
    b2.push(d);
    b2.push('","');
    b2.push(a.segmentPrefix);
    b2.push(c2);
    return b2.push('")<\/script>');
  }
  function Rb(a, b2, c2, d) {
    if (2 === d.status) return true;
    var f2 = d.id;
    if (-1 === f2) {
      if (-1 === (d.id = c2.rootSegmentID)) throw Error("A root segment ID must have been assigned by now. This is a bug in React.");
      return Pb(a, b2, d);
    }
    Pb(a, b2, d);
    a = a.responseState;
    b2.push(a.startInlineScript);
    a.sentCompleteSegmentFunction ? b2.push('$RS("') : (a.sentCompleteSegmentFunction = true, b2.push('function $RS(a,b){a=document.getElementById(a);b=document.getElementById(b);for(a.parentNode.removeChild(a);a.firstChild;)b.parentNode.insertBefore(a.firstChild,b);b.parentNode.removeChild(b)};$RS("'));
    b2.push(a.segmentPrefix);
    f2 = f2.toString(16);
    b2.push(f2);
    b2.push('","');
    b2.push(a.placeholderPrefix);
    b2.push(f2);
    return b2.push('")<\/script>');
  }
  function Ob(a, b2) {
    try {
      var c2 = a.completedRootSegment;
      if (null !== c2 && 0 === a.pendingRootTasks) {
        Z2(a, b2, c2);
        a.completedRootSegment = null;
        var d = a.responseState.bootstrapChunks;
        for (c2 = 0; c2 < d.length - 1; c2++) b2.push(d[c2]);
        c2 < d.length && b2.push(d[c2]);
      }
      var f2 = a.clientRenderedBoundaries, e;
      for (e = 0; e < f2.length; e++) {
        var g = f2[e];
        d = b2;
        var h2 = a.responseState, k2 = g.id, m2 = g.errorDigest, l = g.errorMessage, p2 = g.errorComponentStack;
        d.push(h2.startInlineScript);
        h2.sentClientRenderFunction ? d.push('$RX("') : (h2.sentClientRenderFunction = true, d.push('function $RX(b,c,d,e){var a=document.getElementById(b);a&&(b=a.previousSibling,b.data="$!",a=a.dataset,c&&(a.dgst=c),d&&(a.msg=d),e&&(a.stck=e),b._reactRetry&&b._reactRetry())};$RX("'));
        if (null === k2) throw Error("An ID must have been assigned before we can complete the boundary.");
        d.push(k2);
        d.push('"');
        if (m2 || l || p2) {
          d.push(",");
          var B2 = Ea2(m2 || "");
          d.push(B2);
        }
        if (l || p2) {
          d.push(",");
          var C2 = Ea2(l || "");
          d.push(C2);
        }
        if (p2) {
          d.push(",");
          var y2 = Ea2(p2);
          d.push(y2);
        }
        if (!d.push(")<\/script>")) {
          a.destination = null;
          e++;
          f2.splice(0, e);
          return;
        }
      }
      f2.splice(0, e);
      var aa2 = a.completedBoundaries;
      for (e = 0; e < aa2.length; e++) if (!Qb(a, b2, aa2[e])) {
        a.destination = null;
        e++;
        aa2.splice(0, e);
        return;
      }
      aa2.splice(0, e);
      var ba2 = a.partialBoundaries;
      for (e = 0; e < ba2.length; e++) {
        var pb = ba2[e];
        a: {
          f2 = a;
          g = b2;
          var ca2 = pb.completedSegments;
          for (h2 = 0; h2 < ca2.length; h2++) if (!Rb(f2, g, pb, ca2[h2])) {
            h2++;
            ca2.splice(0, h2);
            var qb = false;
            break a;
          }
          ca2.splice(0, h2);
          qb = true;
        }
        if (!qb) {
          a.destination = null;
          e++;
          ba2.splice(0, e);
          return;
        }
      }
      ba2.splice(0, e);
      var da2 = a.completedBoundaries;
      for (e = 0; e < da2.length; e++) if (!Qb(a, b2, da2[e])) {
        a.destination = null;
        e++;
        da2.splice(0, e);
        return;
      }
      da2.splice(0, e);
    } finally {
      0 === a.allPendingTasks && 0 === a.pingedTasks.length && 0 === a.clientRenderedBoundaries.length && 0 === a.completedBoundaries.length && b2.push(null);
    }
  }
  function Sb(a, b2) {
    if (1 === a.status) a.status = 2, b2.destroy(a.fatalError);
    else if (2 !== a.status && null === a.destination) {
      a.destination = b2;
      try {
        Ob(a, b2);
      } catch (c2) {
        U2(a, c2), V2(a, c2);
      }
    }
  }
  function Tb(a, b2) {
    try {
      var c2 = a.abortableTasks;
      c2.forEach(function(c3) {
        return Nb(c3, a, b2);
      });
      c2.clear();
      null !== a.destination && Ob(a, a.destination);
    } catch (d) {
      U2(a, d), V2(a, d);
    }
  }
  function Ub() {
  }
  function Vb(a, b2, c2, d) {
    var f2 = false, e = null, g = "", h2 = false;
    a = Cb(a, Fa2(c2, b2 ? b2.identifierPrefix : void 0), Ga(), Infinity, Ub, void 0, function() {
      h2 = true;
    });
    Eb(a);
    Tb(a, d);
    Sb(a, { push: function(a2) {
      null !== a2 && (g += a2);
      return true;
    }, destroy: function(a2) {
      f2 = true;
      e = a2;
    } });
    if (f2) throw e;
    if (!h2) throw Error("A component suspended while responding to synchronous input. This will cause the UI to be replaced with a loading indicator. To fix, updates that suspend should be wrapped with startTransition.");
    return g;
  }
  function Wb(a, b2) {
    a.prototype = Object.create(b2.prototype);
    a.prototype.constructor = a;
    a.__proto__ = b2;
  }
  var Xb = (function(a) {
    function b2() {
      var b3 = a.call(this, {}) || this;
      b3.request = null;
      b3.startedFlowing = false;
      return b3;
    }
    Wb(b2, a);
    var c2 = b2.prototype;
    c2._destroy = function(a2, b3) {
      Tb(this.request);
      b3(a2);
    };
    c2._read = function() {
      this.startedFlowing && Sb(this.request, this);
    };
    return b2;
  })(fa2.Readable);
  function Yb() {
  }
  function Zb(a, b2) {
    var c2 = new Xb(), d = Cb(a, Fa2(false, b2 ? b2.identifierPrefix : void 0), Ga(), Infinity, Yb, function() {
      c2.startedFlowing = true;
      Sb(d, c2);
    }, void 0);
    c2.request = d;
    Eb(d);
    return c2;
  }
  reactDomServerLegacy_node_production_min.renderToNodeStream = function(a, b2) {
    return Zb(a, b2);
  };
  reactDomServerLegacy_node_production_min.renderToStaticMarkup = function(a, b2) {
    return Vb(a, b2, true, 'The server used "renderToStaticMarkup" which does not support Suspense. If you intended to have the server wait for the suspended component please switch to "renderToPipeableStream" which supports Suspense on the server');
  };
  reactDomServerLegacy_node_production_min.renderToStaticNodeStream = function(a, b2) {
    return Zb(a, b2);
  };
  reactDomServerLegacy_node_production_min.renderToString = function(a, b2) {
    return Vb(a, b2, false, 'The server used "renderToString" which does not support Suspense. If you intended for this Suspense boundary to render the fallback content on the server consider throwing an Error somewhere within the Suspense boundary. If you intended to have the server wait for the suspended component please switch to "renderToPipeableStream" which supports Suspense on the server');
  };
  reactDomServerLegacy_node_production_min.version = "18.3.1";
  return reactDomServerLegacy_node_production_min;
}
var reactDomServer_node_production_min = {};
var hasRequiredReactDomServer_node_production_min;
function requireReactDomServer_node_production_min() {
  if (hasRequiredReactDomServer_node_production_min) return reactDomServer_node_production_min;
  hasRequiredReactDomServer_node_production_min = 1;
  var aa2 = require$$0, ba2 = requireReact(), k2 = null, l = 0, q2 = true;
  function r(a, b2) {
    if ("string" === typeof b2) {
      if (0 !== b2.length) if (2048 < 3 * b2.length) 0 < l && (t(a, k2.subarray(0, l)), k2 = new Uint8Array(2048), l = 0), t(a, u.encode(b2));
      else {
        var c2 = k2;
        0 < l && (c2 = k2.subarray(l));
        c2 = u.encodeInto(b2, c2);
        var d = c2.read;
        l += c2.written;
        d < b2.length && (t(a, k2), k2 = new Uint8Array(2048), l = u.encodeInto(b2.slice(d), k2).written);
        2048 === l && (t(a, k2), k2 = new Uint8Array(2048), l = 0);
      }
    } else 0 !== b2.byteLength && (2048 < b2.byteLength ? (0 < l && (t(a, k2.subarray(0, l)), k2 = new Uint8Array(2048), l = 0), t(a, b2)) : (c2 = k2.length - l, c2 < b2.byteLength && (0 === c2 ? t(
      a,
      k2
    ) : (k2.set(b2.subarray(0, c2), l), l += c2, t(a, k2), b2 = b2.subarray(c2)), k2 = new Uint8Array(2048), l = 0), k2.set(b2, l), l += b2.byteLength, 2048 === l && (t(a, k2), k2 = new Uint8Array(2048), l = 0)));
  }
  function t(a, b2) {
    a = a.write(b2);
    q2 = q2 && a;
  }
  function w2(a, b2) {
    r(a, b2);
    return q2;
  }
  function ca2(a) {
    k2 && 0 < l && a.write(k2.subarray(0, l));
    k2 = null;
    l = 0;
    q2 = true;
  }
  var u = new aa2.TextEncoder();
  function x3(a) {
    return u.encode(a);
  }
  var y2 = Object.prototype.hasOwnProperty, da2 = /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/, ea2 = {}, fa2 = {};
  function ha2(a) {
    if (y2.call(fa2, a)) return true;
    if (y2.call(ea2, a)) return false;
    if (da2.test(a)) return fa2[a] = true;
    ea2[a] = true;
    return false;
  }
  function z2(a, b2, c2, d, f2, e, g) {
    this.acceptsBooleans = 2 === b2 || 3 === b2 || 4 === b2;
    this.attributeName = d;
    this.attributeNamespace = f2;
    this.mustUseProperty = c2;
    this.propertyName = a;
    this.type = b2;
    this.sanitizeURL = e;
    this.removeEmptyString = g;
  }
  var A2 = {};
  "children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(a) {
    A2[a] = new z2(a, 0, false, a, null, false, false);
  });
  [["acceptCharset", "accept-charset"], ["className", "class"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"]].forEach(function(a) {
    var b2 = a[0];
    A2[b2] = new z2(b2, 1, false, a[1], null, false, false);
  });
  ["contentEditable", "draggable", "spellCheck", "value"].forEach(function(a) {
    A2[a] = new z2(a, 2, false, a.toLowerCase(), null, false, false);
  });
  ["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function(a) {
    A2[a] = new z2(a, 2, false, a, null, false, false);
  });
  "allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(a) {
    A2[a] = new z2(a, 3, false, a.toLowerCase(), null, false, false);
  });
  ["checked", "multiple", "muted", "selected"].forEach(function(a) {
    A2[a] = new z2(a, 3, true, a, null, false, false);
  });
  ["capture", "download"].forEach(function(a) {
    A2[a] = new z2(a, 4, false, a, null, false, false);
  });
  ["cols", "rows", "size", "span"].forEach(function(a) {
    A2[a] = new z2(a, 6, false, a, null, false, false);
  });
  ["rowSpan", "start"].forEach(function(a) {
    A2[a] = new z2(a, 5, false, a.toLowerCase(), null, false, false);
  });
  var ia2 = /[\-:]([a-z])/g;
  function ja(a) {
    return a[1].toUpperCase();
  }
  "accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(a) {
    var b2 = a.replace(
      ia2,
      ja
    );
    A2[b2] = new z2(b2, 1, false, a, null, false, false);
  });
  "xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(a) {
    var b2 = a.replace(ia2, ja);
    A2[b2] = new z2(b2, 1, false, a, "http://www.w3.org/1999/xlink", false, false);
  });
  ["xml:base", "xml:lang", "xml:space"].forEach(function(a) {
    var b2 = a.replace(ia2, ja);
    A2[b2] = new z2(b2, 1, false, a, "http://www.w3.org/XML/1998/namespace", false, false);
  });
  ["tabIndex", "crossOrigin"].forEach(function(a) {
    A2[a] = new z2(a, 1, false, a.toLowerCase(), null, false, false);
  });
  A2.xlinkHref = new z2("xlinkHref", 1, false, "xlink:href", "http://www.w3.org/1999/xlink", true, false);
  ["src", "href", "action", "formAction"].forEach(function(a) {
    A2[a] = new z2(a, 1, false, a.toLowerCase(), null, true, true);
  });
  var B2 = {
    animationIterationCount: true,
    aspectRatio: true,
    borderImageOutset: true,
    borderImageSlice: true,
    borderImageWidth: true,
    boxFlex: true,
    boxFlexGroup: true,
    boxOrdinalGroup: true,
    columnCount: true,
    columns: true,
    flex: true,
    flexGrow: true,
    flexPositive: true,
    flexShrink: true,
    flexNegative: true,
    flexOrder: true,
    gridArea: true,
    gridRow: true,
    gridRowEnd: true,
    gridRowSpan: true,
    gridRowStart: true,
    gridColumn: true,
    gridColumnEnd: true,
    gridColumnSpan: true,
    gridColumnStart: true,
    fontWeight: true,
    lineClamp: true,
    lineHeight: true,
    opacity: true,
    order: true,
    orphans: true,
    tabSize: true,
    widows: true,
    zIndex: true,
    zoom: true,
    fillOpacity: true,
    floodOpacity: true,
    stopOpacity: true,
    strokeDasharray: true,
    strokeDashoffset: true,
    strokeMiterlimit: true,
    strokeOpacity: true,
    strokeWidth: true
  }, ka2 = ["Webkit", "ms", "Moz", "O"];
  Object.keys(B2).forEach(function(a) {
    ka2.forEach(function(b2) {
      b2 = b2 + a.charAt(0).toUpperCase() + a.substring(1);
      B2[b2] = B2[a];
    });
  });
  var la2 = /["'&<>]/;
  function F2(a) {
    if ("boolean" === typeof a || "number" === typeof a) return "" + a;
    a = "" + a;
    var b2 = la2.exec(a);
    if (b2) {
      var c2 = "", d, f2 = 0;
      for (d = b2.index; d < a.length; d++) {
        switch (a.charCodeAt(d)) {
          case 34:
            b2 = "&quot;";
            break;
          case 38:
            b2 = "&amp;";
            break;
          case 39:
            b2 = "&#x27;";
            break;
          case 60:
            b2 = "&lt;";
            break;
          case 62:
            b2 = "&gt;";
            break;
          default:
            continue;
        }
        f2 !== d && (c2 += a.substring(f2, d));
        f2 = d + 1;
        c2 += b2;
      }
      a = f2 !== d ? c2 + a.substring(f2, d) : c2;
    }
    return a;
  }
  var ma2 = /([A-Z])/g, pa2 = /^ms-/, qa = Array.isArray, ra2 = x3("<script>"), sa2 = x3("<\/script>"), ta2 = x3('<script src="'), ua2 = x3('<script type="module" src="'), va2 = x3('" async=""><\/script>'), wa2 = /(<\/|<)(s)(cript)/gi;
  function xa2(a, b2, c2, d) {
    return "" + b2 + ("s" === c2 ? "\\u0073" : "\\u0053") + d;
  }
  function G(a, b2) {
    return { insertionMode: a, selectedValue: b2 };
  }
  function ya2(a, b2, c2) {
    switch (b2) {
      case "select":
        return G(1, null != c2.value ? c2.value : c2.defaultValue);
      case "svg":
        return G(2, null);
      case "math":
        return G(3, null);
      case "foreignObject":
        return G(1, null);
      case "table":
        return G(4, null);
      case "thead":
      case "tbody":
      case "tfoot":
        return G(5, null);
      case "colgroup":
        return G(7, null);
      case "tr":
        return G(6, null);
    }
    return 4 <= a.insertionMode || 0 === a.insertionMode ? G(1, null) : a;
  }
  var za2 = x3("<!-- -->");
  function Aa2(a, b2, c2, d) {
    if ("" === b2) return d;
    d && a.push(za2);
    a.push(F2(b2));
    return true;
  }
  var Ba2 = /* @__PURE__ */ new Map(), Ca2 = x3(' style="'), Da2 = x3(":"), Ea2 = x3(";");
  function Fa2(a, b2, c2) {
    if ("object" !== typeof c2) throw Error("The `style` prop expects a mapping from style properties to values, not a string. For example, style={{marginRight: spacing + 'em'}} when using JSX.");
    b2 = true;
    for (var d in c2) if (y2.call(c2, d)) {
      var f2 = c2[d];
      if (null != f2 && "boolean" !== typeof f2 && "" !== f2) {
        if (0 === d.indexOf("--")) {
          var e = F2(d);
          f2 = F2(("" + f2).trim());
        } else {
          e = d;
          var g = Ba2.get(e);
          void 0 !== g ? e = g : (g = x3(F2(e.replace(ma2, "-$1").toLowerCase().replace(pa2, "-ms-"))), Ba2.set(e, g), e = g);
          f2 = "number" === typeof f2 ? 0 === f2 || y2.call(
            B2,
            d
          ) ? "" + f2 : f2 + "px" : F2(("" + f2).trim());
        }
        b2 ? (b2 = false, a.push(Ca2, e, Da2, f2)) : a.push(Ea2, e, Da2, f2);
      }
    }
    b2 || a.push(H2);
  }
  var I2 = x3(" "), J2 = x3('="'), H2 = x3('"'), Ga = x3('=""');
  function K(a, b2, c2, d) {
    switch (c2) {
      case "style":
        Fa2(a, b2, d);
        return;
      case "defaultValue":
      case "defaultChecked":
      case "innerHTML":
      case "suppressContentEditableWarning":
      case "suppressHydrationWarning":
        return;
    }
    if (!(2 < c2.length) || "o" !== c2[0] && "O" !== c2[0] || "n" !== c2[1] && "N" !== c2[1]) {
      if (b2 = A2.hasOwnProperty(c2) ? A2[c2] : null, null !== b2) {
        switch (typeof d) {
          case "function":
          case "symbol":
            return;
          case "boolean":
            if (!b2.acceptsBooleans) return;
        }
        c2 = b2.attributeName;
        switch (b2.type) {
          case 3:
            d && a.push(I2, c2, Ga);
            break;
          case 4:
            true === d ? a.push(I2, c2, Ga) : false !== d && a.push(I2, c2, J2, F2(d), H2);
            break;
          case 5:
            isNaN(d) || a.push(I2, c2, J2, F2(d), H2);
            break;
          case 6:
            !isNaN(d) && 1 <= d && a.push(I2, c2, J2, F2(d), H2);
            break;
          default:
            b2.sanitizeURL && (d = "" + d), a.push(I2, c2, J2, F2(d), H2);
        }
      } else if (ha2(c2)) {
        switch (typeof d) {
          case "function":
          case "symbol":
            return;
          case "boolean":
            if (b2 = c2.toLowerCase().slice(0, 5), "data-" !== b2 && "aria-" !== b2) return;
        }
        a.push(I2, c2, J2, F2(d), H2);
      }
    }
  }
  var L2 = x3(">"), Ha = x3("/>");
  function M2(a, b2, c2) {
    if (null != b2) {
      if (null != c2) throw Error("Can only set one of `children` or `props.dangerouslySetInnerHTML`.");
      if ("object" !== typeof b2 || !("__html" in b2)) throw Error("`props.dangerouslySetInnerHTML` must be in the form `{__html: ...}`. Please visit https://reactjs.org/link/dangerously-set-inner-html for more information.");
      b2 = b2.__html;
      null !== b2 && void 0 !== b2 && a.push("" + b2);
    }
  }
  function Ia2(a) {
    var b2 = "";
    ba2.Children.forEach(a, function(a2) {
      null != a2 && (b2 += a2);
    });
    return b2;
  }
  var Ja = x3(' selected=""');
  function Ka(a, b2, c2, d) {
    a.push(N2(c2));
    var f2 = c2 = null, e;
    for (e in b2) if (y2.call(b2, e)) {
      var g = b2[e];
      if (null != g) switch (e) {
        case "children":
          c2 = g;
          break;
        case "dangerouslySetInnerHTML":
          f2 = g;
          break;
        default:
          K(a, d, e, g);
      }
    }
    a.push(L2);
    M2(a, f2, c2);
    return "string" === typeof c2 ? (a.push(F2(c2)), null) : c2;
  }
  var La2 = x3("\n"), Ma2 = /^[a-zA-Z][a-zA-Z:_\.\-\d]*$/, Na2 = /* @__PURE__ */ new Map();
  function N2(a) {
    var b2 = Na2.get(a);
    if (void 0 === b2) {
      if (!Ma2.test(a)) throw Error("Invalid tag: " + a);
      b2 = x3("<" + a);
      Na2.set(a, b2);
    }
    return b2;
  }
  var Oa2 = x3("<!DOCTYPE html>");
  function Pa2(a, b2, c2, d, f2) {
    switch (b2) {
      case "select":
        a.push(N2("select"));
        var e = null, g = null;
        for (p2 in c2) if (y2.call(c2, p2)) {
          var h2 = c2[p2];
          if (null != h2) switch (p2) {
            case "children":
              e = h2;
              break;
            case "dangerouslySetInnerHTML":
              g = h2;
              break;
            case "defaultValue":
            case "value":
              break;
            default:
              K(a, d, p2, h2);
          }
        }
        a.push(L2);
        M2(a, g, e);
        return e;
      case "option":
        g = f2.selectedValue;
        a.push(N2("option"));
        var m2 = h2 = null, n2 = null;
        var p2 = null;
        for (e in c2) if (y2.call(c2, e)) {
          var v2 = c2[e];
          if (null != v2) switch (e) {
            case "children":
              h2 = v2;
              break;
            case "selected":
              n2 = v2;
              break;
            case "dangerouslySetInnerHTML":
              p2 = v2;
              break;
            case "value":
              m2 = v2;
            default:
              K(a, d, e, v2);
          }
        }
        if (null != g) if (c2 = null !== m2 ? "" + m2 : Ia2(h2), qa(g)) for (d = 0; d < g.length; d++) {
          if ("" + g[d] === c2) {
            a.push(Ja);
            break;
          }
        }
        else "" + g === c2 && a.push(Ja);
        else n2 && a.push(Ja);
        a.push(L2);
        M2(a, p2, h2);
        return h2;
      case "textarea":
        a.push(N2("textarea"));
        p2 = g = e = null;
        for (h2 in c2) if (y2.call(c2, h2) && (m2 = c2[h2], null != m2)) switch (h2) {
          case "children":
            p2 = m2;
            break;
          case "value":
            e = m2;
            break;
          case "defaultValue":
            g = m2;
            break;
          case "dangerouslySetInnerHTML":
            throw Error("`dangerouslySetInnerHTML` does not make sense on <textarea>.");
          default:
            K(a, d, h2, m2);
        }
        null === e && null !== g && (e = g);
        a.push(L2);
        if (null != p2) {
          if (null != e) throw Error("If you supply `defaultValue` on a <textarea>, do not pass children.");
          if (qa(p2) && 1 < p2.length) throw Error("<textarea> can only have at most one child.");
          e = "" + p2;
        }
        "string" === typeof e && "\n" === e[0] && a.push(La2);
        null !== e && a.push(F2("" + e));
        return null;
      case "input":
        a.push(N2("input"));
        m2 = p2 = h2 = e = null;
        for (g in c2) if (y2.call(c2, g) && (n2 = c2[g], null != n2)) switch (g) {
          case "children":
          case "dangerouslySetInnerHTML":
            throw Error("input is a self-closing tag and must neither have `children` nor use `dangerouslySetInnerHTML`.");
          case "defaultChecked":
            m2 = n2;
            break;
          case "defaultValue":
            h2 = n2;
            break;
          case "checked":
            p2 = n2;
            break;
          case "value":
            e = n2;
            break;
          default:
            K(a, d, g, n2);
        }
        null !== p2 ? K(a, d, "checked", p2) : null !== m2 && K(a, d, "checked", m2);
        null !== e ? K(a, d, "value", e) : null !== h2 && K(a, d, "value", h2);
        a.push(Ha);
        return null;
      case "menuitem":
        a.push(N2("menuitem"));
        for (var C2 in c2) if (y2.call(c2, C2) && (e = c2[C2], null != e)) switch (C2) {
          case "children":
          case "dangerouslySetInnerHTML":
            throw Error("menuitems cannot have `children` nor `dangerouslySetInnerHTML`.");
          default:
            K(a, d, C2, e);
        }
        a.push(L2);
        return null;
      case "title":
        a.push(N2("title"));
        e = null;
        for (v2 in c2) if (y2.call(c2, v2) && (g = c2[v2], null != g)) switch (v2) {
          case "children":
            e = g;
            break;
          case "dangerouslySetInnerHTML":
            throw Error("`dangerouslySetInnerHTML` does not make sense on <title>.");
          default:
            K(a, d, v2, g);
        }
        a.push(L2);
        return e;
      case "listing":
      case "pre":
        a.push(N2(b2));
        g = e = null;
        for (m2 in c2) if (y2.call(c2, m2) && (h2 = c2[m2], null != h2)) switch (m2) {
          case "children":
            e = h2;
            break;
          case "dangerouslySetInnerHTML":
            g = h2;
            break;
          default:
            K(a, d, m2, h2);
        }
        a.push(L2);
        if (null != g) {
          if (null != e) throw Error("Can only set one of `children` or `props.dangerouslySetInnerHTML`.");
          if ("object" !== typeof g || !("__html" in g)) throw Error("`props.dangerouslySetInnerHTML` must be in the form `{__html: ...}`. Please visit https://reactjs.org/link/dangerously-set-inner-html for more information.");
          c2 = g.__html;
          null !== c2 && void 0 !== c2 && ("string" === typeof c2 && 0 < c2.length && "\n" === c2[0] ? a.push(La2, c2) : a.push("" + c2));
        }
        "string" === typeof e && "\n" === e[0] && a.push(La2);
        return e;
      case "area":
      case "base":
      case "br":
      case "col":
      case "embed":
      case "hr":
      case "img":
      case "keygen":
      case "link":
      case "meta":
      case "param":
      case "source":
      case "track":
      case "wbr":
        a.push(N2(b2));
        for (var D2 in c2) if (y2.call(c2, D2) && (e = c2[D2], null != e)) switch (D2) {
          case "children":
          case "dangerouslySetInnerHTML":
            throw Error(b2 + " is a self-closing tag and must neither have `children` nor use `dangerouslySetInnerHTML`.");
          default:
            K(a, d, D2, e);
        }
        a.push(Ha);
        return null;
      case "annotation-xml":
      case "color-profile":
      case "font-face":
      case "font-face-src":
      case "font-face-uri":
      case "font-face-format":
      case "font-face-name":
      case "missing-glyph":
        return Ka(a, c2, b2, d);
      case "html":
        return 0 === f2.insertionMode && a.push(Oa2), Ka(
          a,
          c2,
          b2,
          d
        );
      default:
        if (-1 === b2.indexOf("-") && "string" !== typeof c2.is) return Ka(a, c2, b2, d);
        a.push(N2(b2));
        g = e = null;
        for (n2 in c2) if (y2.call(c2, n2) && (h2 = c2[n2], null != h2)) switch (n2) {
          case "children":
            e = h2;
            break;
          case "dangerouslySetInnerHTML":
            g = h2;
            break;
          case "style":
            Fa2(a, d, h2);
            break;
          case "suppressContentEditableWarning":
          case "suppressHydrationWarning":
            break;
          default:
            ha2(n2) && "function" !== typeof h2 && "symbol" !== typeof h2 && a.push(I2, n2, J2, F2(h2), H2);
        }
        a.push(L2);
        M2(a, g, e);
        return e;
    }
  }
  var Qa = x3("</"), Ra2 = x3(">"), Sa2 = x3('<template id="'), Ta2 = x3('"></template>'), Ua = x3("<!--$-->"), Va2 = x3('<!--$?--><template id="'), Wa = x3('"></template>'), Xa = x3("<!--$!-->"), Ya = x3("<!--/$-->"), Za = x3("<template"), $a = x3('"'), ab = x3(' data-dgst="');
  x3(' data-msg="');
  x3(' data-stck="');
  var bb = x3("></template>");
  function cb(a, b2, c2) {
    r(a, Va2);
    if (null === c2) throw Error("An ID must have been assigned before we can complete the boundary.");
    r(a, c2);
    return w2(a, Wa);
  }
  var db = x3('<div hidden id="'), eb = x3('">'), fb = x3("</div>"), gb = x3('<svg aria-hidden="true" style="display:none" id="'), hb = x3('">'), ib = x3("</svg>"), jb = x3('<math aria-hidden="true" style="display:none" id="'), kb = x3('">'), lb = x3("</math>"), mb = x3('<table hidden id="'), nb = x3('">'), ob = x3("</table>"), pb = x3('<table hidden><tbody id="'), qb = x3('">'), rb = x3("</tbody></table>"), sb = x3('<table hidden><tr id="'), tb = x3('">'), ub = x3("</tr></table>"), vb = x3('<table hidden><colgroup id="'), wb = x3('">'), xb = x3("</colgroup></table>");
  function yb(a, b2, c2, d) {
    switch (c2.insertionMode) {
      case 0:
      case 1:
        return r(a, db), r(a, b2.segmentPrefix), r(a, d.toString(16)), w2(a, eb);
      case 2:
        return r(a, gb), r(a, b2.segmentPrefix), r(a, d.toString(16)), w2(a, hb);
      case 3:
        return r(a, jb), r(a, b2.segmentPrefix), r(a, d.toString(16)), w2(a, kb);
      case 4:
        return r(a, mb), r(a, b2.segmentPrefix), r(a, d.toString(16)), w2(a, nb);
      case 5:
        return r(a, pb), r(a, b2.segmentPrefix), r(a, d.toString(16)), w2(a, qb);
      case 6:
        return r(a, sb), r(a, b2.segmentPrefix), r(a, d.toString(16)), w2(a, tb);
      case 7:
        return r(a, vb), r(
          a,
          b2.segmentPrefix
        ), r(a, d.toString(16)), w2(a, wb);
      default:
        throw Error("Unknown insertion mode. This is a bug in React.");
    }
  }
  function zb(a, b2) {
    switch (b2.insertionMode) {
      case 0:
      case 1:
        return w2(a, fb);
      case 2:
        return w2(a, ib);
      case 3:
        return w2(a, lb);
      case 4:
        return w2(a, ob);
      case 5:
        return w2(a, rb);
      case 6:
        return w2(a, ub);
      case 7:
        return w2(a, xb);
      default:
        throw Error("Unknown insertion mode. This is a bug in React.");
    }
  }
  var Ab = x3('function $RS(a,b){a=document.getElementById(a);b=document.getElementById(b);for(a.parentNode.removeChild(a);a.firstChild;)b.parentNode.insertBefore(a.firstChild,b);b.parentNode.removeChild(b)};$RS("'), Bb = x3('$RS("'), Cb = x3('","'), Db = x3('")<\/script>'), Fb = x3('function $RC(a,b){a=document.getElementById(a);b=document.getElementById(b);b.parentNode.removeChild(b);if(a){a=a.previousSibling;var f=a.parentNode,c=a.nextSibling,e=0;do{if(c&&8===c.nodeType){var d=c.data;if("/$"===d)if(0===e)break;else e--;else"$"!==d&&"$?"!==d&&"$!"!==d||e++}d=c.nextSibling;f.removeChild(c);c=d}while(c);for(;b.firstChild;)f.insertBefore(b.firstChild,c);a.data="$";a._reactRetry&&a._reactRetry()}};$RC("'), Gb = x3('$RC("'), Hb = x3('","'), Ib = x3('")<\/script>'), Jb = x3('function $RX(b,c,d,e){var a=document.getElementById(b);a&&(b=a.previousSibling,b.data="$!",a=a.dataset,c&&(a.dgst=c),d&&(a.msg=d),e&&(a.stck=e),b._reactRetry&&b._reactRetry())};$RX("'), Kb = x3('$RX("'), Lb = x3('"'), Mb = x3(")<\/script>"), Nb = x3(","), Ob = /[<\u2028\u2029]/g;
  function Pb(a) {
    return JSON.stringify(a).replace(Ob, function(a2) {
      switch (a2) {
        case "<":
          return "\\u003c";
        case "\u2028":
          return "\\u2028";
        case "\u2029":
          return "\\u2029";
        default:
          throw Error("escapeJSStringsForInstructionScripts encountered a match it does not know how to replace. this means the match regex and the replacement characters are no longer in sync. This is a bug in React");
      }
    });
  }
  var O2 = Object.assign, Qb = /* @__PURE__ */ Symbol.for("react.element"), Rb = /* @__PURE__ */ Symbol.for("react.portal"), Sb = /* @__PURE__ */ Symbol.for("react.fragment"), Tb = /* @__PURE__ */ Symbol.for("react.strict_mode"), Ub = /* @__PURE__ */ Symbol.for("react.profiler"), Vb = /* @__PURE__ */ Symbol.for("react.provider"), Wb = /* @__PURE__ */ Symbol.for("react.context"), Xb = /* @__PURE__ */ Symbol.for("react.forward_ref"), Yb = /* @__PURE__ */ Symbol.for("react.suspense"), Zb = /* @__PURE__ */ Symbol.for("react.suspense_list"), $b = /* @__PURE__ */ Symbol.for("react.memo"), ac = /* @__PURE__ */ Symbol.for("react.lazy"), bc = /* @__PURE__ */ Symbol.for("react.scope"), cc = /* @__PURE__ */ Symbol.for("react.debug_trace_mode"), dc = /* @__PURE__ */ Symbol.for("react.legacy_hidden"), ec = /* @__PURE__ */ Symbol.for("react.default_value"), fc = Symbol.iterator;
  function gc(a) {
    if (null == a) return null;
    if ("function" === typeof a) return a.displayName || a.name || null;
    if ("string" === typeof a) return a;
    switch (a) {
      case Sb:
        return "Fragment";
      case Rb:
        return "Portal";
      case Ub:
        return "Profiler";
      case Tb:
        return "StrictMode";
      case Yb:
        return "Suspense";
      case Zb:
        return "SuspenseList";
    }
    if ("object" === typeof a) switch (a.$$typeof) {
      case Wb:
        return (a.displayName || "Context") + ".Consumer";
      case Vb:
        return (a._context.displayName || "Context") + ".Provider";
      case Xb:
        var b2 = a.render;
        a = a.displayName;
        a || (a = b2.displayName || b2.name || "", a = "" !== a ? "ForwardRef(" + a + ")" : "ForwardRef");
        return a;
      case $b:
        return b2 = a.displayName || null, null !== b2 ? b2 : gc(a.type) || "Memo";
      case ac:
        b2 = a._payload;
        a = a._init;
        try {
          return gc(a(b2));
        } catch (c2) {
        }
    }
    return null;
  }
  var hc = {};
  function ic(a, b2) {
    a = a.contextTypes;
    if (!a) return hc;
    var c2 = {}, d;
    for (d in a) c2[d] = b2[d];
    return c2;
  }
  var P2 = null;
  function Q2(a, b2) {
    if (a !== b2) {
      a.context._currentValue = a.parentValue;
      a = a.parent;
      var c2 = b2.parent;
      if (null === a) {
        if (null !== c2) throw Error("The stacks must reach the root at the same time. This is a bug in React.");
      } else {
        if (null === c2) throw Error("The stacks must reach the root at the same time. This is a bug in React.");
        Q2(a, c2);
      }
      b2.context._currentValue = b2.value;
    }
  }
  function jc(a) {
    a.context._currentValue = a.parentValue;
    a = a.parent;
    null !== a && jc(a);
  }
  function kc(a) {
    var b2 = a.parent;
    null !== b2 && kc(b2);
    a.context._currentValue = a.value;
  }
  function lc(a, b2) {
    a.context._currentValue = a.parentValue;
    a = a.parent;
    if (null === a) throw Error("The depth must equal at least at zero before reaching the root. This is a bug in React.");
    a.depth === b2.depth ? Q2(a, b2) : lc(a, b2);
  }
  function mc(a, b2) {
    var c2 = b2.parent;
    if (null === c2) throw Error("The depth must equal at least at zero before reaching the root. This is a bug in React.");
    a.depth === c2.depth ? Q2(a, c2) : mc(a, c2);
    b2.context._currentValue = b2.value;
  }
  function nc(a) {
    var b2 = P2;
    b2 !== a && (null === b2 ? kc(a) : null === a ? jc(b2) : b2.depth === a.depth ? Q2(b2, a) : b2.depth > a.depth ? lc(b2, a) : mc(b2, a), P2 = a);
  }
  var oc = { isMounted: function() {
    return false;
  }, enqueueSetState: function(a, b2) {
    a = a._reactInternals;
    null !== a.queue && a.queue.push(b2);
  }, enqueueReplaceState: function(a, b2) {
    a = a._reactInternals;
    a.replace = true;
    a.queue = [b2];
  }, enqueueForceUpdate: function() {
  } };
  function pc(a, b2, c2, d) {
    var f2 = void 0 !== a.state ? a.state : null;
    a.updater = oc;
    a.props = c2;
    a.state = f2;
    var e = { queue: [], replace: false };
    a._reactInternals = e;
    var g = b2.contextType;
    a.context = "object" === typeof g && null !== g ? g._currentValue : d;
    g = b2.getDerivedStateFromProps;
    "function" === typeof g && (g = g(c2, f2), f2 = null === g || void 0 === g ? f2 : O2({}, f2, g), a.state = f2);
    if ("function" !== typeof b2.getDerivedStateFromProps && "function" !== typeof a.getSnapshotBeforeUpdate && ("function" === typeof a.UNSAFE_componentWillMount || "function" === typeof a.componentWillMount)) if (b2 = a.state, "function" === typeof a.componentWillMount && a.componentWillMount(), "function" === typeof a.UNSAFE_componentWillMount && a.UNSAFE_componentWillMount(), b2 !== a.state && oc.enqueueReplaceState(a, a.state, null), null !== e.queue && 0 < e.queue.length) if (b2 = e.queue, g = e.replace, e.queue = null, e.replace = false, g && 1 === b2.length) a.state = b2[0];
    else {
      e = g ? b2[0] : a.state;
      f2 = true;
      for (g = g ? 1 : 0; g < b2.length; g++) {
        var h2 = b2[g];
        h2 = "function" === typeof h2 ? h2.call(a, e, c2, d) : h2;
        null != h2 && (f2 ? (f2 = false, e = O2({}, e, h2)) : O2(e, h2));
      }
      a.state = e;
    }
    else e.queue = null;
  }
  var qc = { id: 1, overflow: "" };
  function rc(a, b2, c2) {
    var d = a.id;
    a = a.overflow;
    var f2 = 32 - sc(d) - 1;
    d &= ~(1 << f2);
    c2 += 1;
    var e = 32 - sc(b2) + f2;
    if (30 < e) {
      var g = f2 - f2 % 5;
      e = (d & (1 << g) - 1).toString(32);
      d >>= g;
      f2 -= g;
      return { id: 1 << 32 - sc(b2) + f2 | c2 << f2 | d, overflow: e + a };
    }
    return { id: 1 << e | c2 << f2 | d, overflow: a };
  }
  var sc = Math.clz32 ? Math.clz32 : tc, uc = Math.log, vc = Math.LN2;
  function tc(a) {
    a >>>= 0;
    return 0 === a ? 32 : 31 - (uc(a) / vc | 0) | 0;
  }
  function wc(a, b2) {
    return a === b2 && (0 !== a || 1 / a === 1 / b2) || a !== a && b2 !== b2;
  }
  var xc = "function" === typeof Object.is ? Object.is : wc, R2 = null, yc = null, zc = null, S = null, T2 = false, Ac = false, U2 = 0, V2 = null, Bc = 0;
  function W2() {
    if (null === R2) throw Error("Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://reactjs.org/link/invalid-hook-call for tips about how to debug and fix this problem.");
    return R2;
  }
  function Cc() {
    if (0 < Bc) throw Error("Rendered more hooks than during the previous render");
    return { memoizedState: null, queue: null, next: null };
  }
  function Dc() {
    null === S ? null === zc ? (T2 = false, zc = S = Cc()) : (T2 = true, S = zc) : null === S.next ? (T2 = false, S = S.next = Cc()) : (T2 = true, S = S.next);
    return S;
  }
  function Ec() {
    yc = R2 = null;
    Ac = false;
    zc = null;
    Bc = 0;
    S = V2 = null;
  }
  function Fc(a, b2) {
    return "function" === typeof b2 ? b2(a) : b2;
  }
  function Gc(a, b2, c2) {
    R2 = W2();
    S = Dc();
    if (T2) {
      var d = S.queue;
      b2 = d.dispatch;
      if (null !== V2 && (c2 = V2.get(d), void 0 !== c2)) {
        V2.delete(d);
        d = S.memoizedState;
        do
          d = a(d, c2.action), c2 = c2.next;
        while (null !== c2);
        S.memoizedState = d;
        return [d, b2];
      }
      return [S.memoizedState, b2];
    }
    a = a === Fc ? "function" === typeof b2 ? b2() : b2 : void 0 !== c2 ? c2(b2) : b2;
    S.memoizedState = a;
    a = S.queue = { last: null, dispatch: null };
    a = a.dispatch = Hc.bind(null, R2, a);
    return [S.memoizedState, a];
  }
  function Ic(a, b2) {
    R2 = W2();
    S = Dc();
    b2 = void 0 === b2 ? null : b2;
    if (null !== S) {
      var c2 = S.memoizedState;
      if (null !== c2 && null !== b2) {
        var d = c2[1];
        a: if (null === d) d = false;
        else {
          for (var f2 = 0; f2 < d.length && f2 < b2.length; f2++) if (!xc(b2[f2], d[f2])) {
            d = false;
            break a;
          }
          d = true;
        }
        if (d) return c2[0];
      }
    }
    a = a();
    S.memoizedState = [a, b2];
    return a;
  }
  function Hc(a, b2, c2) {
    if (25 <= Bc) throw Error("Too many re-renders. React limits the number of renders to prevent an infinite loop.");
    if (a === R2) if (Ac = true, a = { action: c2, next: null }, null === V2 && (V2 = /* @__PURE__ */ new Map()), c2 = V2.get(b2), void 0 === c2) V2.set(b2, a);
    else {
      for (b2 = c2; null !== b2.next; ) b2 = b2.next;
      b2.next = a;
    }
  }
  function Jc() {
    throw Error("startTransition cannot be called during server rendering.");
  }
  function Kc() {
  }
  var Mc = { readContext: function(a) {
    return a._currentValue;
  }, useContext: function(a) {
    W2();
    return a._currentValue;
  }, useMemo: Ic, useReducer: Gc, useRef: function(a) {
    R2 = W2();
    S = Dc();
    var b2 = S.memoizedState;
    return null === b2 ? (a = { current: a }, S.memoizedState = a) : b2;
  }, useState: function(a) {
    return Gc(Fc, a);
  }, useInsertionEffect: Kc, useLayoutEffect: function() {
  }, useCallback: function(a, b2) {
    return Ic(function() {
      return a;
    }, b2);
  }, useImperativeHandle: Kc, useEffect: Kc, useDebugValue: Kc, useDeferredValue: function(a) {
    W2();
    return a;
  }, useTransition: function() {
    W2();
    return [false, Jc];
  }, useId: function() {
    var a = yc.treeContext;
    var b2 = a.overflow;
    a = a.id;
    a = (a & ~(1 << 32 - sc(a) - 1)).toString(32) + b2;
    var c2 = Lc;
    if (null === c2) throw Error("Invalid hook call. Hooks can only be called inside of the body of a function component.");
    b2 = U2++;
    a = ":" + c2.idPrefix + "R" + a;
    0 < b2 && (a += "H" + b2.toString(32));
    return a + ":";
  }, useMutableSource: function(a, b2) {
    W2();
    return b2(a._source);
  }, useSyncExternalStore: function(a, b2, c2) {
    if (void 0 === c2) throw Error("Missing getServerSnapshot, which is required for server-rendered content. Will revert to client rendering.");
    return c2();
  } }, Lc = null, Nc = ba2.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher;
  function Oc(a) {
    console.error(a);
    return null;
  }
  function X2() {
  }
  function Pc(a, b2) {
    var c2 = a.pingedTasks;
    c2.push(b2);
    1 === c2.length && setImmediate(function() {
      return Qc(a);
    });
  }
  function Rc(a, b2, c2, d, f2, e, g, h2) {
    a.allPendingTasks++;
    null === c2 ? a.pendingRootTasks++ : c2.pendingTasks++;
    var m2 = { node: b2, ping: function() {
      return Pc(a, m2);
    }, blockedBoundary: c2, blockedSegment: d, abortSet: f2, legacyContext: e, context: g, treeContext: h2 };
    f2.add(m2);
    return m2;
  }
  function Sc(a, b2, c2, d, f2, e) {
    return { status: 0, id: -1, index: b2, parentFlushed: false, chunks: [], children: [], formatContext: d, boundary: c2, lastPushedText: f2, textEmbedded: e };
  }
  function Y2(a, b2) {
    a = a.onError(b2);
    if (null != a && "string" !== typeof a) throw Error('onError returned something with a type other than "string". onError should return a string and may return null or undefined but must not return anything else. It received something of type "' + typeof a + '" instead');
    return a;
  }
  function Tc(a, b2) {
    var c2 = a.onShellError;
    c2(b2);
    c2 = a.onFatalError;
    c2(b2);
    null !== a.destination ? (a.status = 2, a.destination.destroy(b2)) : (a.status = 1, a.fatalError = b2);
  }
  function Uc(a, b2, c2, d, f2) {
    R2 = {};
    yc = b2;
    U2 = 0;
    for (a = c2(d, f2); Ac; ) Ac = false, U2 = 0, Bc += 1, S = null, a = c2(d, f2);
    Ec();
    return a;
  }
  function Vc(a, b2, c2, d) {
    var f2 = c2.render(), e = d.childContextTypes;
    if (null !== e && void 0 !== e) {
      var g = b2.legacyContext;
      if ("function" !== typeof c2.getChildContext) d = g;
      else {
        c2 = c2.getChildContext();
        for (var h2 in c2) if (!(h2 in e)) throw Error((gc(d) || "Unknown") + '.getChildContext(): key "' + h2 + '" is not defined in childContextTypes.');
        d = O2({}, g, c2);
      }
      b2.legacyContext = d;
      Z2(a, b2, f2);
      b2.legacyContext = g;
    } else Z2(a, b2, f2);
  }
  function Wc(a, b2) {
    if (a && a.defaultProps) {
      b2 = O2({}, b2);
      a = a.defaultProps;
      for (var c2 in a) void 0 === b2[c2] && (b2[c2] = a[c2]);
      return b2;
    }
    return b2;
  }
  function Xc(a, b2, c2, d, f2) {
    if ("function" === typeof c2) if (c2.prototype && c2.prototype.isReactComponent) {
      f2 = ic(c2, b2.legacyContext);
      var e = c2.contextType;
      e = new c2(d, "object" === typeof e && null !== e ? e._currentValue : f2);
      pc(e, c2, d, f2);
      Vc(a, b2, e, c2);
    } else {
      e = ic(c2, b2.legacyContext);
      f2 = Uc(a, b2, c2, d, e);
      var g = 0 !== U2;
      if ("object" === typeof f2 && null !== f2 && "function" === typeof f2.render && void 0 === f2.$$typeof) pc(f2, c2, d, e), Vc(a, b2, f2, c2);
      else if (g) {
        d = b2.treeContext;
        b2.treeContext = rc(d, 1, 0);
        try {
          Z2(a, b2, f2);
        } finally {
          b2.treeContext = d;
        }
      } else Z2(a, b2, f2);
    }
    else if ("string" === typeof c2) {
      f2 = b2.blockedSegment;
      e = Pa2(f2.chunks, c2, d, a.responseState, f2.formatContext);
      f2.lastPushedText = false;
      g = f2.formatContext;
      f2.formatContext = ya2(g, c2, d);
      Yc(a, b2, e);
      f2.formatContext = g;
      switch (c2) {
        case "area":
        case "base":
        case "br":
        case "col":
        case "embed":
        case "hr":
        case "img":
        case "input":
        case "keygen":
        case "link":
        case "meta":
        case "param":
        case "source":
        case "track":
        case "wbr":
          break;
        default:
          f2.chunks.push(Qa, c2, Ra2);
      }
      f2.lastPushedText = false;
    } else {
      switch (c2) {
        case dc:
        case cc:
        case Tb:
        case Ub:
        case Sb:
          Z2(a, b2, d.children);
          return;
        case Zb:
          Z2(
            a,
            b2,
            d.children
          );
          return;
        case bc:
          throw Error("ReactDOMServer does not yet support scope components.");
        case Yb:
          a: {
            c2 = b2.blockedBoundary;
            f2 = b2.blockedSegment;
            e = d.fallback;
            d = d.children;
            g = /* @__PURE__ */ new Set();
            var h2 = { id: null, rootSegmentID: -1, parentFlushed: false, pendingTasks: 0, forceClientRender: false, completedSegments: [], byteSize: 0, fallbackAbortableTasks: g, errorDigest: null }, m2 = Sc(a, f2.chunks.length, h2, f2.formatContext, false, false);
            f2.children.push(m2);
            f2.lastPushedText = false;
            var n2 = Sc(a, 0, null, f2.formatContext, false, false);
            n2.parentFlushed = true;
            b2.blockedBoundary = h2;
            b2.blockedSegment = n2;
            try {
              if (Yc(a, b2, d), n2.lastPushedText && n2.textEmbedded && n2.chunks.push(za2), n2.status = 1, Zc(h2, n2), 0 === h2.pendingTasks) break a;
            } catch (p2) {
              n2.status = 4, h2.forceClientRender = true, h2.errorDigest = Y2(a, p2);
            } finally {
              b2.blockedBoundary = c2, b2.blockedSegment = f2;
            }
            b2 = Rc(a, e, c2, m2, g, b2.legacyContext, b2.context, b2.treeContext);
            a.pingedTasks.push(b2);
          }
          return;
      }
      if ("object" === typeof c2 && null !== c2) switch (c2.$$typeof) {
        case Xb:
          d = Uc(a, b2, c2.render, d, f2);
          if (0 !== U2) {
            c2 = b2.treeContext;
            b2.treeContext = rc(c2, 1, 0);
            try {
              Z2(a, b2, d);
            } finally {
              b2.treeContext = c2;
            }
          } else Z2(
            a,
            b2,
            d
          );
          return;
        case $b:
          c2 = c2.type;
          d = Wc(c2, d);
          Xc(a, b2, c2, d, f2);
          return;
        case Vb:
          f2 = d.children;
          c2 = c2._context;
          d = d.value;
          e = c2._currentValue;
          c2._currentValue = d;
          g = P2;
          P2 = d = { parent: g, depth: null === g ? 0 : g.depth + 1, context: c2, parentValue: e, value: d };
          b2.context = d;
          Z2(a, b2, f2);
          a = P2;
          if (null === a) throw Error("Tried to pop a Context at the root of the app. This is a bug in React.");
          d = a.parentValue;
          a.context._currentValue = d === ec ? a.context._defaultValue : d;
          a = P2 = a.parent;
          b2.context = a;
          return;
        case Wb:
          d = d.children;
          d = d(c2._currentValue);
          Z2(a, b2, d);
          return;
        case ac:
          f2 = c2._init;
          c2 = f2(c2._payload);
          d = Wc(c2, d);
          Xc(a, b2, c2, d, void 0);
          return;
      }
      throw Error("Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: " + ((null == c2 ? c2 : typeof c2) + "."));
    }
  }
  function Z2(a, b2, c2) {
    b2.node = c2;
    if ("object" === typeof c2 && null !== c2) {
      switch (c2.$$typeof) {
        case Qb:
          Xc(a, b2, c2.type, c2.props, c2.ref);
          return;
        case Rb:
          throw Error("Portals are not currently supported by the server renderer. Render them conditionally so that they only appear on the client render.");
        case ac:
          var d = c2._init;
          c2 = d(c2._payload);
          Z2(a, b2, c2);
          return;
      }
      if (qa(c2)) {
        $c(a, b2, c2);
        return;
      }
      null === c2 || "object" !== typeof c2 ? d = null : (d = fc && c2[fc] || c2["@@iterator"], d = "function" === typeof d ? d : null);
      if (d && (d = d.call(c2))) {
        c2 = d.next();
        if (!c2.done) {
          var f2 = [];
          do
            f2.push(c2.value), c2 = d.next();
          while (!c2.done);
          $c(a, b2, f2);
        }
        return;
      }
      a = Object.prototype.toString.call(c2);
      throw Error("Objects are not valid as a React child (found: " + ("[object Object]" === a ? "object with keys {" + Object.keys(c2).join(", ") + "}" : a) + "). If you meant to render a collection of children, use an array instead.");
    }
    "string" === typeof c2 ? (d = b2.blockedSegment, d.lastPushedText = Aa2(b2.blockedSegment.chunks, c2, a.responseState, d.lastPushedText)) : "number" === typeof c2 && (d = b2.blockedSegment, d.lastPushedText = Aa2(
      b2.blockedSegment.chunks,
      "" + c2,
      a.responseState,
      d.lastPushedText
    ));
  }
  function $c(a, b2, c2) {
    for (var d = c2.length, f2 = 0; f2 < d; f2++) {
      var e = b2.treeContext;
      b2.treeContext = rc(e, d, f2);
      try {
        Yc(a, b2, c2[f2]);
      } finally {
        b2.treeContext = e;
      }
    }
  }
  function Yc(a, b2, c2) {
    var d = b2.blockedSegment.formatContext, f2 = b2.legacyContext, e = b2.context;
    try {
      return Z2(a, b2, c2);
    } catch (m2) {
      if (Ec(), "object" === typeof m2 && null !== m2 && "function" === typeof m2.then) {
        c2 = m2;
        var g = b2.blockedSegment, h2 = Sc(a, g.chunks.length, null, g.formatContext, g.lastPushedText, true);
        g.children.push(h2);
        g.lastPushedText = false;
        a = Rc(a, b2.node, b2.blockedBoundary, h2, b2.abortSet, b2.legacyContext, b2.context, b2.treeContext).ping;
        c2.then(a, a);
        b2.blockedSegment.formatContext = d;
        b2.legacyContext = f2;
        b2.context = e;
        nc(e);
      } else throw b2.blockedSegment.formatContext = d, b2.legacyContext = f2, b2.context = e, nc(e), m2;
    }
  }
  function ad(a) {
    var b2 = a.blockedBoundary;
    a = a.blockedSegment;
    a.status = 3;
    bd(this, b2, a);
  }
  function cd(a, b2, c2) {
    var d = a.blockedBoundary;
    a.blockedSegment.status = 3;
    null === d ? (b2.allPendingTasks--, 2 !== b2.status && (b2.status = 2, null !== b2.destination && b2.destination.end())) : (d.pendingTasks--, d.forceClientRender || (d.forceClientRender = true, d.errorDigest = b2.onError(void 0 === c2 ? Error("The render was aborted by the server without a reason.") : c2), d.parentFlushed && b2.clientRenderedBoundaries.push(d)), d.fallbackAbortableTasks.forEach(function(a2) {
      return cd(a2, b2, c2);
    }), d.fallbackAbortableTasks.clear(), b2.allPendingTasks--, 0 === b2.allPendingTasks && (a = b2.onAllReady, a()));
  }
  function Zc(a, b2) {
    if (0 === b2.chunks.length && 1 === b2.children.length && null === b2.children[0].boundary) {
      var c2 = b2.children[0];
      c2.id = b2.id;
      c2.parentFlushed = true;
      1 === c2.status && Zc(a, c2);
    } else a.completedSegments.push(b2);
  }
  function bd(a, b2, c2) {
    if (null === b2) {
      if (c2.parentFlushed) {
        if (null !== a.completedRootSegment) throw Error("There can only be one root segment. This is a bug in React.");
        a.completedRootSegment = c2;
      }
      a.pendingRootTasks--;
      0 === a.pendingRootTasks && (a.onShellError = X2, b2 = a.onShellReady, b2());
    } else b2.pendingTasks--, b2.forceClientRender || (0 === b2.pendingTasks ? (c2.parentFlushed && 1 === c2.status && Zc(b2, c2), b2.parentFlushed && a.completedBoundaries.push(b2), b2.fallbackAbortableTasks.forEach(ad, a), b2.fallbackAbortableTasks.clear()) : c2.parentFlushed && 1 === c2.status && (Zc(b2, c2), 1 === b2.completedSegments.length && b2.parentFlushed && a.partialBoundaries.push(b2)));
    a.allPendingTasks--;
    0 === a.allPendingTasks && (a = a.onAllReady, a());
  }
  function Qc(a) {
    if (2 !== a.status) {
      var b2 = P2, c2 = Nc.current;
      Nc.current = Mc;
      var d = Lc;
      Lc = a.responseState;
      try {
        var f2 = a.pingedTasks, e;
        for (e = 0; e < f2.length; e++) {
          var g = f2[e];
          var h2 = a, m2 = g.blockedSegment;
          if (0 === m2.status) {
            nc(g.context);
            try {
              Z2(h2, g, g.node), m2.lastPushedText && m2.textEmbedded && m2.chunks.push(za2), g.abortSet.delete(g), m2.status = 1, bd(h2, g.blockedBoundary, m2);
            } catch (E2) {
              if (Ec(), "object" === typeof E2 && null !== E2 && "function" === typeof E2.then) {
                var n2 = g.ping;
                E2.then(n2, n2);
              } else {
                g.abortSet.delete(g);
                m2.status = 4;
                var p2 = g.blockedBoundary, v2 = E2, C2 = Y2(h2, v2);
                null === p2 ? Tc(h2, v2) : (p2.pendingTasks--, p2.forceClientRender || (p2.forceClientRender = true, p2.errorDigest = C2, p2.parentFlushed && h2.clientRenderedBoundaries.push(p2)));
                h2.allPendingTasks--;
                if (0 === h2.allPendingTasks) {
                  var D2 = h2.onAllReady;
                  D2();
                }
              }
            } finally {
            }
          }
        }
        f2.splice(0, e);
        null !== a.destination && dd(a, a.destination);
      } catch (E2) {
        Y2(a, E2), Tc(a, E2);
      } finally {
        Lc = d, Nc.current = c2, c2 === Mc && nc(b2);
      }
    }
  }
  function ed(a, b2, c2) {
    c2.parentFlushed = true;
    switch (c2.status) {
      case 0:
        var d = c2.id = a.nextSegmentId++;
        c2.lastPushedText = false;
        c2.textEmbedded = false;
        a = a.responseState;
        r(b2, Sa2);
        r(b2, a.placeholderPrefix);
        a = d.toString(16);
        r(b2, a);
        return w2(b2, Ta2);
      case 1:
        c2.status = 2;
        var f2 = true;
        d = c2.chunks;
        var e = 0;
        c2 = c2.children;
        for (var g = 0; g < c2.length; g++) {
          for (f2 = c2[g]; e < f2.index; e++) r(b2, d[e]);
          f2 = fd(a, b2, f2);
        }
        for (; e < d.length - 1; e++) r(b2, d[e]);
        e < d.length && (f2 = w2(b2, d[e]));
        return f2;
      default:
        throw Error("Aborted, errored or already flushed boundaries should not be flushed again. This is a bug in React.");
    }
  }
  function fd(a, b2, c2) {
    var d = c2.boundary;
    if (null === d) return ed(a, b2, c2);
    d.parentFlushed = true;
    if (d.forceClientRender) d = d.errorDigest, w2(b2, Xa), r(b2, Za), d && (r(b2, ab), r(b2, F2(d)), r(b2, $a)), w2(b2, bb), ed(a, b2, c2);
    else if (0 < d.pendingTasks) {
      d.rootSegmentID = a.nextSegmentId++;
      0 < d.completedSegments.length && a.partialBoundaries.push(d);
      var f2 = a.responseState;
      var e = f2.nextSuspenseID++;
      f2 = x3(f2.boundaryPrefix + e.toString(16));
      d = d.id = f2;
      cb(b2, a.responseState, d);
      ed(a, b2, c2);
    } else if (d.byteSize > a.progressiveChunkSize) d.rootSegmentID = a.nextSegmentId++, a.completedBoundaries.push(d), cb(b2, a.responseState, d.id), ed(a, b2, c2);
    else {
      w2(b2, Ua);
      c2 = d.completedSegments;
      if (1 !== c2.length) throw Error("A previously unvisited boundary must have exactly one root segment. This is a bug in React.");
      fd(a, b2, c2[0]);
    }
    return w2(b2, Ya);
  }
  function gd(a, b2, c2) {
    yb(b2, a.responseState, c2.formatContext, c2.id);
    fd(a, b2, c2);
    return zb(b2, c2.formatContext);
  }
  function hd(a, b2, c2) {
    for (var d = c2.completedSegments, f2 = 0; f2 < d.length; f2++) id(a, b2, c2, d[f2]);
    d.length = 0;
    a = a.responseState;
    d = c2.id;
    c2 = c2.rootSegmentID;
    r(b2, a.startInlineScript);
    a.sentCompleteBoundaryFunction ? r(b2, Gb) : (a.sentCompleteBoundaryFunction = true, r(b2, Fb));
    if (null === d) throw Error("An ID must have been assigned before we can complete the boundary.");
    c2 = c2.toString(16);
    r(b2, d);
    r(b2, Hb);
    r(b2, a.segmentPrefix);
    r(b2, c2);
    return w2(b2, Ib);
  }
  function id(a, b2, c2, d) {
    if (2 === d.status) return true;
    var f2 = d.id;
    if (-1 === f2) {
      if (-1 === (d.id = c2.rootSegmentID)) throw Error("A root segment ID must have been assigned by now. This is a bug in React.");
      return gd(a, b2, d);
    }
    gd(a, b2, d);
    a = a.responseState;
    r(b2, a.startInlineScript);
    a.sentCompleteSegmentFunction ? r(b2, Bb) : (a.sentCompleteSegmentFunction = true, r(b2, Ab));
    r(b2, a.segmentPrefix);
    f2 = f2.toString(16);
    r(b2, f2);
    r(b2, Cb);
    r(b2, a.placeholderPrefix);
    r(b2, f2);
    return w2(b2, Db);
  }
  function dd(a, b2) {
    k2 = new Uint8Array(2048);
    l = 0;
    q2 = true;
    try {
      var c2 = a.completedRootSegment;
      if (null !== c2 && 0 === a.pendingRootTasks) {
        fd(a, b2, c2);
        a.completedRootSegment = null;
        var d = a.responseState.bootstrapChunks;
        for (c2 = 0; c2 < d.length - 1; c2++) r(b2, d[c2]);
        c2 < d.length && w2(b2, d[c2]);
      }
      var f2 = a.clientRenderedBoundaries, e;
      for (e = 0; e < f2.length; e++) {
        var g = f2[e];
        d = b2;
        var h2 = a.responseState, m2 = g.id, n2 = g.errorDigest, p2 = g.errorMessage, v2 = g.errorComponentStack;
        r(d, h2.startInlineScript);
        h2.sentClientRenderFunction ? r(d, Kb) : (h2.sentClientRenderFunction = true, r(d, Jb));
        if (null === m2) throw Error("An ID must have been assigned before we can complete the boundary.");
        r(d, m2);
        r(d, Lb);
        if (n2 || p2 || v2) r(d, Nb), r(d, Pb(n2 || ""));
        if (p2 || v2) r(d, Nb), r(d, Pb(p2 || ""));
        v2 && (r(d, Nb), r(d, Pb(v2)));
        if (!w2(d, Mb)) {
          a.destination = null;
          e++;
          f2.splice(0, e);
          return;
        }
      }
      f2.splice(0, e);
      var C2 = a.completedBoundaries;
      for (e = 0; e < C2.length; e++) if (!hd(a, b2, C2[e])) {
        a.destination = null;
        e++;
        C2.splice(0, e);
        return;
      }
      C2.splice(0, e);
      ca2(b2);
      k2 = new Uint8Array(2048);
      l = 0;
      q2 = true;
      var D2 = a.partialBoundaries;
      for (e = 0; e < D2.length; e++) {
        var E2 = D2[e];
        a: {
          f2 = a;
          g = b2;
          var na2 = E2.completedSegments;
          for (h2 = 0; h2 < na2.length; h2++) if (!id(f2, g, E2, na2[h2])) {
            h2++;
            na2.splice(0, h2);
            var Eb = false;
            break a;
          }
          na2.splice(0, h2);
          Eb = true;
        }
        if (!Eb) {
          a.destination = null;
          e++;
          D2.splice(0, e);
          return;
        }
      }
      D2.splice(0, e);
      var oa2 = a.completedBoundaries;
      for (e = 0; e < oa2.length; e++) if (!hd(a, b2, oa2[e])) {
        a.destination = null;
        e++;
        oa2.splice(0, e);
        return;
      }
      oa2.splice(0, e);
    } finally {
      ca2(b2), "function" === typeof b2.flush && b2.flush(), 0 === a.allPendingTasks && 0 === a.pingedTasks.length && 0 === a.clientRenderedBoundaries.length && 0 === a.completedBoundaries.length && b2.end();
    }
  }
  function jd(a) {
    setImmediate(function() {
      return Qc(a);
    });
  }
  function kd(a, b2) {
    if (1 === a.status) a.status = 2, b2.destroy(a.fatalError);
    else if (2 !== a.status && null === a.destination) {
      a.destination = b2;
      try {
        dd(a, b2);
      } catch (c2) {
        Y2(a, c2), Tc(a, c2);
      }
    }
  }
  function ld(a, b2) {
    try {
      var c2 = a.abortableTasks;
      c2.forEach(function(c3) {
        return cd(c3, a, b2);
      });
      c2.clear();
      null !== a.destination && dd(a, a.destination);
    } catch (d) {
      Y2(a, d), Tc(a, d);
    }
  }
  function md(a, b2) {
    return function() {
      return kd(b2, a);
    };
  }
  function nd(a, b2) {
    return function() {
      return ld(a, b2);
    };
  }
  function od(a, b2) {
    var c2 = b2 ? b2.identifierPrefix : void 0, d = b2 ? b2.nonce : void 0, f2 = b2 ? b2.bootstrapScriptContent : void 0, e = b2 ? b2.bootstrapScripts : void 0;
    var g = b2 ? b2.bootstrapModules : void 0;
    c2 = void 0 === c2 ? "" : c2;
    d = void 0 === d ? ra2 : x3('<script nonce="' + F2(d) + '">');
    var h2 = [];
    void 0 !== f2 && h2.push(d, ("" + f2).replace(wa2, xa2), sa2);
    if (void 0 !== e) for (f2 = 0; f2 < e.length; f2++) h2.push(ta2, F2(e[f2]), va2);
    if (void 0 !== g) for (e = 0; e < g.length; e++) h2.push(ua2, F2(g[e]), va2);
    g = {
      bootstrapChunks: h2,
      startInlineScript: d,
      placeholderPrefix: x3(c2 + "P:"),
      segmentPrefix: x3(c2 + "S:"),
      boundaryPrefix: c2 + "B:",
      idPrefix: c2,
      nextSuspenseID: 0,
      sentCompleteSegmentFunction: false,
      sentCompleteBoundaryFunction: false,
      sentClientRenderFunction: false
    };
    e = b2 ? b2.namespaceURI : void 0;
    e = G("http://www.w3.org/2000/svg" === e ? 2 : "http://www.w3.org/1998/Math/MathML" === e ? 3 : 0, null);
    f2 = b2 ? b2.progressiveChunkSize : void 0;
    d = b2 ? b2.onError : void 0;
    h2 = b2 ? b2.onAllReady : void 0;
    var m2 = b2 ? b2.onShellReady : void 0, n2 = b2 ? b2.onShellError : void 0;
    b2 = [];
    c2 = /* @__PURE__ */ new Set();
    g = {
      destination: null,
      responseState: g,
      progressiveChunkSize: void 0 === f2 ? 12800 : f2,
      status: 0,
      fatalError: null,
      nextSegmentId: 0,
      allPendingTasks: 0,
      pendingRootTasks: 0,
      completedRootSegment: null,
      abortableTasks: c2,
      pingedTasks: b2,
      clientRenderedBoundaries: [],
      completedBoundaries: [],
      partialBoundaries: [],
      onError: void 0 === d ? Oc : d,
      onAllReady: void 0 === h2 ? X2 : h2,
      onShellReady: void 0 === m2 ? X2 : m2,
      onShellError: void 0 === n2 ? X2 : n2,
      onFatalError: X2
    };
    e = Sc(g, 0, null, e, false, false);
    e.parentFlushed = true;
    a = Rc(g, a, null, e, c2, hc, null, qc);
    b2.push(a);
    return g;
  }
  reactDomServer_node_production_min.renderToPipeableStream = function(a, b2) {
    var c2 = od(a, b2), d = false;
    jd(c2);
    return { pipe: function(a2) {
      if (d) throw Error("React currently only supports piping to one writable stream.");
      d = true;
      kd(c2, a2);
      a2.on("drain", md(a2, c2));
      a2.on("error", nd(c2, Error("The destination stream errored while writing data.")));
      a2.on("close", nd(c2, Error("The destination stream closed early.")));
      return a2;
    }, abort: function(a2) {
      ld(c2, a2);
    } };
  };
  reactDomServer_node_production_min.version = "18.3.1";
  return reactDomServer_node_production_min;
}
var hasRequiredServer_node;
function requireServer_node() {
  if (hasRequiredServer_node) return server_node;
  hasRequiredServer_node = 1;
  var l, s;
  {
    l = requireReactDomServerLegacy_node_production_min();
    s = requireReactDomServer_node_production_min();
  }
  server_node.version = l.version;
  server_node.renderToString = l.renderToString;
  server_node.renderToStaticMarkup = l.renderToStaticMarkup;
  server_node.renderToNodeStream = l.renderToNodeStream;
  server_node.renderToStaticNodeStream = l.renderToStaticNodeStream;
  server_node.renderToPipeableStream = s.renderToPipeableStream;
  return server_node;
}
var server_nodeExports = requireServer_node();
const ReactDOMServer = /* @__PURE__ */ getDefaultExportFromCjs(server_nodeExports);
function dehydrateSsrMatchId(id) {
  return id.replaceAll("/", "\0");
}
var tsrScript_default = "self.$_TSR={h(){this.hydrated=!0,this.c()},e(){this.streamEnded=!0,this.c()},c(){this.hydrated&&this.streamEnded&&(delete self.$_TSR,delete self.$R.tsr)},p(e){this.initialized?e():this.buffer.push(e)},buffer:[]}";
const SCOPE_ID = "tsr";
const TSR_PREFIX = GLOBAL_TSR + ".router=";
const P_PREFIX = GLOBAL_TSR + ".p(()=>";
const P_SUFFIX = ")";
function dehydrateMatch(match) {
  const dehydratedMatch = {
    i: dehydrateSsrMatchId(match.id),
    u: match.updatedAt,
    s: match.status
  };
  for (const [key, shorthand] of [
    ["__beforeLoadContext", "b"],
    ["loaderData", "l"],
    ["error", "e"],
    ["ssr", "ssr"]
  ]) if (match[key] !== void 0) dehydratedMatch[shorthand] = match[key];
  if (match.globalNotFound) dehydratedMatch.g = true;
  return dehydratedMatch;
}
const INITIAL_SCRIPTS = [dn(SCOPE_ID), tsrScript_default];
var ScriptBuffer = class {
  constructor(injectScript) {
    this._scriptBarrierLifted = false;
    this._cleanedUp = false;
    this._microtaskVersion = 0;
    this._pendingMicrotaskVersion = 0;
    this.injectScript = injectScript;
    this._queue = INITIAL_SCRIPTS.slice();
  }
  enqueue(script) {
    if (this._cleanedUp) return;
    this._queue.push(script);
    if (this._scriptBarrierLifted) this.scheduleInjectBufferedScripts();
  }
  liftBarrier() {
    if (this._scriptBarrierLifted || this._cleanedUp) return;
    this._scriptBarrierLifted = true;
    if (this._queue.length > 0) this.scheduleInjectBufferedScripts();
  }
  scheduleInjectBufferedScripts() {
    if (this._pendingMicrotaskVersion !== 0) return;
    const pendingVersion = ++this._microtaskVersion;
    this._pendingMicrotaskVersion = pendingVersion;
    queueMicrotask(() => {
      if (this._pendingMicrotaskVersion !== pendingVersion) return;
      this._pendingMicrotaskVersion = 0;
      this.injectBufferedScripts();
    });
  }
  clearPendingMicrotask() {
    if (this._pendingMicrotaskVersion === 0) return;
    this._pendingMicrotaskVersion = 0;
    this._microtaskVersion++;
  }
  /**
  * Flushes any pending scripts synchronously.
  * Call this before signaling serialization finished to ensure all scripts are injected.
  *
  * IMPORTANT: Only injects if the barrier has been lifted. Before the barrier is lifted,
  * scripts should remain in the queue so takeBufferedScripts() can retrieve them
  */
  flush() {
    if (!this._scriptBarrierLifted) return;
    if (this._cleanedUp) return;
    this.clearPendingMicrotask();
    this.injectBufferedScripts();
  }
  takeAll() {
    return this.takeScripts(this._queue.length);
  }
  takeScripts(count) {
    if (count <= 0) return void 0;
    const bufferedScripts = this._queue.splice(0, count);
    if (bufferedScripts.length === 0) return;
    if (bufferedScripts.length === 1) return bufferedScripts[0] + ";document.currentScript.remove()";
    return bufferedScripts.join(";") + ";document.currentScript.remove()";
  }
  hasPending() {
    return this._queue.length > 0;
  }
  injectBufferedScripts() {
    if (this._cleanedUp) return;
    if (this._queue.length === 0) return;
    const scriptsToInject = this.takeAll();
    if (scriptsToInject) this.injectScript?.(scriptsToInject);
  }
  cleanup() {
    this._cleanedUp = true;
    this.clearPendingMicrotask();
    this._queue = [];
    this.injectScript = void 0;
  }
};
const MANIFEST_CACHE_SIZE = 100;
const manifestCaches = /* @__PURE__ */ new WeakMap();
function getManifestCache(manifest2) {
  const cache = manifestCaches.get(manifest2);
  if (cache) return cache;
  const newCache = createLRUCache(MANIFEST_CACHE_SIZE);
  manifestCaches.set(manifest2, newCache);
  return newCache;
}
function getInlineCssForPreparedRoutes(manifest2, preparedRoutes) {
  if (preparedRoutes.inlineCss !== void 0) return preparedRoutes.inlineCss;
  const styles = manifest2.inlineCss?.styles;
  const hrefs = preparedRoutes.inlineCssHrefs;
  if (!styles || !hrefs?.length) return void 0;
  let css = "";
  for (const href of hrefs) css += styles[href];
  preparedRoutes.inlineCss = css;
  return css;
}
function getInlineCssAssetForPreparedRoutes(manifest2, preparedRoutes) {
  const css = getInlineCssForPreparedRoutes(manifest2, preparedRoutes);
  return css === void 0 ? void 0 : createInlineCssStyleAsset(css);
}
function getMatchedRoutesCacheKey(matches) {
  let cacheKey = "";
  for (let i = 0; i < matches.length; i++) cacheKey += (i === 0 ? "" : "\0") + matches[i].routeId;
  return cacheKey;
}
function getPreparedMatchedManifestRoutes(manifest2, matches, cacheKey) {
  {
    const cached = getManifestCache(manifest2).get(cacheKey);
    if (cached) return cached;
  }
  const preparedRoutes = prepareMatchedManifestRoutes(manifest2, matches);
  getManifestCache(manifest2).set(cacheKey, preparedRoutes);
  return preparedRoutes;
}
function prepareMatchedManifestRoutes(manifest2, matches) {
  const inlineStyles = manifest2.inlineCss?.styles;
  const routes = {};
  if (!inlineStyles) {
    for (const match of matches) {
      const route = manifest2.routes[match.routeId];
      if (route) routes[match.routeId] = route;
    }
    return {
      routes,
      hasStrippedRoutes: false
    };
  }
  const inlineCssHrefs = [];
  const seenInlineCssHrefs = /* @__PURE__ */ new Set();
  let hasStrippedRoutes = false;
  for (const match of matches) {
    const routeId = match.routeId;
    const route = manifest2.routes[routeId];
    if (!route) continue;
    const nextRoute = stripInlinedStylesheetAssetsFromRoute(inlineStyles, route, inlineCssHrefs, seenInlineCssHrefs);
    if (nextRoute !== route) hasStrippedRoutes = true;
    routes[routeId] = nextRoute;
  }
  return {
    routes,
    hasStrippedRoutes,
    ...inlineCssHrefs.length ? { inlineCssHrefs } : {}
  };
}
function stripInlinedStylesheetAssetsFromRoute(inlineStyles, route, inlineCssHrefs, seenInlineCssHrefs) {
  const css = route.css;
  if (!css) return route;
  if (css.length === 0) {
    const nextRoute2 = { ...route };
    delete nextRoute2.css;
    return nextRoute2;
  }
  let cssLinks;
  for (let i = 0; i < css.length; i++) {
    const link = css[i];
    const href = getStylesheetHref(link);
    if (inlineStyles[href] === void 0) {
      if (cssLinks) cssLinks.push(link);
      continue;
    }
    if (!seenInlineCssHrefs.has(href)) {
      seenInlineCssHrefs.add(href);
      inlineCssHrefs.push(href);
    }
    if (!cssLinks) cssLinks = css.slice(0, i);
  }
  if (!cssLinks) return route;
  if (cssLinks.length > 0) return {
    ...route,
    css: cssLinks
  };
  const nextRoute = { ...route };
  delete nextRoute.css;
  return nextRoute;
}
function hasRouteAssets(route) {
  return !!route.scripts?.length || !!route.css?.length;
}
function hasRequestAssets(assets) {
  return !!assets && (!!assets.preloads?.length || hasRouteAssets(assets));
}
function mergeRequestAssetsIntoRootRoute(rootRoute, requestAssets) {
  const preloads = requestAssets?.preloads?.length ? [...requestAssets.preloads, ...rootRoute?.preloads ?? []] : rootRoute?.preloads;
  const scripts = requestAssets?.scripts?.length ? [...requestAssets.scripts, ...rootRoute?.scripts ?? []] : rootRoute?.scripts;
  const cssLinks = requestAssets?.css?.length ? [...requestAssets.css, ...rootRoute?.css ?? []] : rootRoute?.css;
  return {
    ...rootRoute ?? {},
    ...preloads?.length ? { preloads } : {},
    ...scripts?.length ? { scripts } : {},
    ...cssLinks?.length ? { css: cssLinks } : {}
  };
}
function attachRouterServerSsrUtils({ router, manifest: manifest2, getRequestAssets }) {
  router.ssr = { get manifest() {
    if (!manifest2) return manifest2;
    const requestAssets = getRequestAssets?.();
    const matches = router.stores.matches.get();
    const hasAssets = hasRequestAssets(requestAssets);
    if (!hasAssets && !manifest2.inlineCss) return manifest2;
    let inlineCssAsset;
    let routes = manifest2.routes;
    if (manifest2.inlineCss) {
      const preparedManifest = getPreparedMatchedManifestRoutes(manifest2, matches, getMatchedRoutesCacheKey(matches));
      inlineCssAsset = getInlineCssAssetForPreparedRoutes(manifest2, preparedManifest);
      if (preparedManifest.hasStrippedRoutes) routes = {
        ...manifest2.routes,
        ...preparedManifest.routes
      };
    }
    if (!hasAssets) return {
      ...manifest2.scriptFormat ? { scriptFormat: manifest2.scriptFormat } : {},
      ...inlineCssAsset ? { inlineStyle: inlineCssAsset } : {},
      routes
    };
    const rootRoute = routes[rootRouteId];
    return {
      ...manifest2.scriptFormat ? { scriptFormat: manifest2.scriptFormat } : {},
      ...inlineCssAsset ? { inlineStyle: inlineCssAsset } : {},
      routes: {
        ...routes,
        [rootRouteId]: mergeRequestAssetsIntoRootRoute(rootRoute, requestAssets)
      }
    };
  } };
  let _dehydrated = false;
  let _serializationFinished = false;
  let streamFastPathReserved = false;
  const renderFinishedListeners = [];
  const injectedHtmlListeners = [];
  const serializationFinishedListeners = [];
  const cleanupListeners = [];
  let cleanupStarted = false;
  let injectedHtmlBuffer = "";
  const callListeners = (listeners, errorPrefix) => {
    const snapshot = listeners.slice();
    for (const l of snapshot) try {
      l();
    } catch (err) {
      console.error(`${errorPrefix}:`, err);
    }
  };
  const removeListener = (listeners, listener) => {
    const index = listeners.indexOf(listener);
    if (index >= 0) listeners.splice(index, 1);
  };
  const scriptBuffer = new ScriptBuffer((script) => {
    serverSsr.injectScript(script);
  });
  const serverSsr = {
    injectHtml: (html) => {
      if (!html || cleanupStarted) return;
      injectedHtmlBuffer += html;
      callListeners(injectedHtmlListeners, "SSR injected HTML listener error");
    },
    injectScript: (script) => {
      if (!script || cleanupStarted) return;
      const html = `<script${router.options.ssr?.nonce ? ` nonce='${router.options.ssr.nonce}'` : ""}>${script}<\/script>`;
      serverSsr.injectHtml(html);
    },
    dehydrate: async (opts) => {
      if (_dehydrated) {
        invariant();
      }
      let matchesToDehydrate = router.stores.matches.get();
      if (router.isShell()) matchesToDehydrate = matchesToDehydrate.slice(0, 1);
      const matches = matchesToDehydrate.map(dehydrateMatch);
      let manifestToDehydrate = void 0;
      if (manifest2) {
        const cacheKey = getMatchedRoutesCacheKey(matchesToDehydrate);
        const preparedManifest = getPreparedMatchedManifestRoutes(manifest2, matchesToDehydrate, cacheKey);
        manifestToDehydrate = {
          ...manifest2.scriptFormat ? { scriptFormat: manifest2.scriptFormat } : {},
          ...preparedManifest.inlineCssHrefs ? { inlineStyle: createInlineCssPlaceholderAsset() } : {},
          routes: preparedManifest.routes
        };
        const requestAssets = opts?.requestAssets;
        if (hasRequestAssets(requestAssets)) {
          const existingRoot = manifestToDehydrate.routes[rootRouteId];
          manifestToDehydrate.routes = {
            ...manifestToDehydrate.routes,
            [rootRouteId]: mergeRequestAssetsIntoRootRoute(existingRoot, requestAssets)
          };
        }
      }
      const dehydratedRouter = {
        manifest: manifestToDehydrate,
        matches
      };
      const lastMatchId = matchesToDehydrate[matchesToDehydrate.length - 1]?.id;
      if (lastMatchId) dehydratedRouter.lastMatchId = dehydrateSsrMatchId(lastMatchId);
      const dehydratedData = await router.options.dehydrate?.();
      if (dehydratedData) dehydratedRouter.dehydratedData = dehydratedData;
      _dehydrated = true;
      const trackPlugins = { didRun: false };
      const serializationAdapters = router.options.serializationAdapters;
      const plugins = serializationAdapters ? serializationAdapters.map((t) => /* @__PURE__ */ makeSsrSerovalPlugin(t, trackPlugins)).concat(defaultSerovalPlugins) : defaultSerovalPlugins;
      let serializationCompleteSignaled = false;
      const signalSerializationComplete = () => {
        if (serializationCompleteSignaled || cleanupStarted) return;
        serializationCompleteSignaled = true;
        _serializationFinished = true;
        const listeners = serializationFinishedListeners.slice();
        serializationFinishedListeners.length = 0;
        for (const l of listeners) try {
          l();
        } catch (err) {
          console.error("Serialization listener error:", err);
        }
      };
      const finishScriptSerialization = () => {
        if (serializationCompleteSignaled || cleanupStarted) return;
        scriptBuffer.enqueue(GLOBAL_TSR + ".e()");
        scriptBuffer.flush();
        signalSerializationComplete();
      };
      Sn(dehydratedRouter, {
        refs: /* @__PURE__ */ new Map(),
        plugins,
        onSerialize: (data, initial) => {
          let serialized = initial ? TSR_PREFIX + data : data;
          if (trackPlugins.didRun) serialized = P_PREFIX + serialized + P_SUFFIX;
          scriptBuffer.enqueue(serialized);
        },
        onError: (err) => {
          console.error("Serialization error:", err);
          if (err && err.stack) console.error(err.stack);
          finishScriptSerialization();
        },
        scopeId: SCOPE_ID,
        onDone: () => {
          finishScriptSerialization();
        }
      });
    },
    isDehydrated() {
      return _dehydrated;
    },
    isSerializationFinished() {
      return _serializationFinished;
    },
    reserveStreamFastPath() {
      if (!cleanupStarted && _serializationFinished && !streamFastPathReserved && renderFinishedListeners.length === 0 && !injectedHtmlBuffer && !scriptBuffer.hasPending()) {
        streamFastPathReserved = true;
        return true;
      }
      return false;
    },
    onInjectedHtml: (listener) => {
      if (cleanupStarted) return () => {
      };
      injectedHtmlListeners.push(listener);
      return () => removeListener(injectedHtmlListeners, listener);
    },
    onRenderFinished: (listener) => {
      if (cleanupStarted || streamFastPathReserved) return;
      renderFinishedListeners.push(listener);
    },
    onSerializationFinished: (listener) => {
      if (cleanupStarted) return () => {
      };
      if (_serializationFinished && !cleanupStarted) {
        try {
          listener();
        } catch (err) {
          console.error("Serialization listener error:", err);
        }
        return () => {
        };
      }
      serializationFinishedListeners.push(listener);
      return () => removeListener(serializationFinishedListeners, listener);
    },
    onCleanup: (listener) => {
      if (cleanupStarted) return;
      cleanupListeners.push(listener);
    },
    setRenderFinished: () => {
      if (cleanupStarted) return;
      scriptBuffer.liftBarrier();
      const listeners = renderFinishedListeners.slice();
      renderFinishedListeners.length = 0;
      for (const l of listeners) try {
        l();
      } catch (err) {
        console.error("Error in render finished listener:", err);
      }
      if (_serializationFinished) scriptBuffer.flush();
    },
    takeBufferedScripts() {
      const scripts = scriptBuffer.takeAll();
      if (!scripts) return void 0;
      return {
        tag: "script",
        attrs: {
          nonce: router.options.ssr?.nonce,
          className: "$tsr",
          id: TSR_SCRIPT_BARRIER_ID
        },
        children: scripts
      };
    },
    liftScriptBarrier() {
      scriptBuffer.liftBarrier();
    },
    takeBufferedHtml() {
      if (!injectedHtmlBuffer) return;
      const buffered = injectedHtmlBuffer;
      injectedHtmlBuffer = "";
      return buffered;
    },
    cleanup() {
      if (cleanupStarted) return;
      cleanupStarted = true;
      const listeners = cleanupListeners.slice();
      cleanupListeners.length = 0;
      for (const l of listeners) try {
        l();
      } catch (err) {
        console.error("Error in SSR cleanup listener:", err);
      }
      renderFinishedListeners.length = 0;
      injectedHtmlListeners.length = 0;
      serializationFinishedListeners.length = 0;
      injectedHtmlBuffer = "";
      scriptBuffer.cleanup();
      router.serverSsr = void 0;
    }
  };
  router.serverSsr = serverSsr;
  for (const listener of router.serverSsrLifecycle?.onServerSsrAttach ?? []) try {
    listener(serverSsr);
  } catch (err) {
    console.error("SSR attach listener error:", err);
  }
}
function getOrigin(request) {
  try {
    return new URL(request.url).origin;
  } catch {
  }
  return "http://localhost";
}
function getNormalizedURL(url, base) {
  if (typeof url === "string") url = url.replace("\\", "%5C");
  const rawUrl = new URL(url, base);
  const { path: decodedPathname, handledProtocolRelativeURL } = decodePath(rawUrl.pathname);
  const searchParams = new URLSearchParams(rawUrl.search);
  const normalizedHref = decodedPathname + (searchParams.size > 0 ? "?" : "") + searchParams.toString() + rawUrl.hash;
  return {
    url: new URL(normalizedHref, rawUrl.origin),
    handledProtocolRelativeURL
  };
}
function isSsrResponse(value) {
  return typeof value === "object" && value !== null && "response" in value && "serverSsrCleanup" in value;
}
function normalizeSsrResponse(result) {
  return isSsrResponse(result) ? result : {
    response: result,
    serverSsrCleanup: "none"
  };
}
function createSsrStreamResponse(router, response) {
  if (!response.body) throw new Error("Invariant failed: SSR stream response requires a body");
  let disposed = false;
  return {
    response,
    serverSsrCleanup: "stream",
    async dispose(reason) {
      if (disposed) return;
      disposed = true;
      try {
        await response.body.cancel(reason);
      } catch {
      }
      router.serverSsr?.cleanup();
    }
  };
}
async function replaceSsrResponse(result, response, reason) {
  const ssrResponse = normalizeSsrResponse(result);
  if (ssrResponse.serverSsrCleanup === "stream") await ssrResponse.dispose(reason);
  return {
    response,
    serverSsrCleanup: "none"
  };
}
async function stripSsrResponseBody(result, reason) {
  const ssrResponse = normalizeSsrResponse(result);
  if (ssrResponse.serverSsrCleanup === "stream") await ssrResponse.dispose(reason);
  return {
    response: new Response(null, ssrResponse.response),
    serverSsrCleanup: "none"
  };
}
function defineHandlerCallback(handler) {
  return handler;
}
function splitSetCookieString(cookiesString) {
  if (Array.isArray(cookiesString)) return cookiesString.flatMap((c2) => splitSetCookieString(c2));
  if (typeof cookiesString !== "string") return [];
  const cookiesStrings = [];
  let pos = 0;
  let start;
  let ch;
  let lastComma;
  let nextStart;
  let cookiesSeparatorFound;
  const skipWhitespace = () => {
    while (pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))) pos += 1;
    return pos < cookiesString.length;
  };
  const notSpecialChar = () => {
    ch = cookiesString.charAt(pos);
    return ch !== "=" && ch !== ";" && ch !== ",";
  };
  while (pos < cookiesString.length) {
    start = pos;
    cookiesSeparatorFound = false;
    while (skipWhitespace()) {
      ch = cookiesString.charAt(pos);
      if (ch === ",") {
        lastComma = pos;
        pos += 1;
        skipWhitespace();
        nextStart = pos;
        while (pos < cookiesString.length && notSpecialChar()) pos += 1;
        if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
          cookiesSeparatorFound = true;
          pos = nextStart;
          cookiesStrings.push(cookiesString.slice(start, lastComma));
          start = pos;
        } else pos = lastComma + 1;
      } else pos += 1;
    }
    if (!cookiesSeparatorFound || pos >= cookiesString.length) cookiesStrings.push(cookiesString.slice(start));
  }
  return cookiesStrings;
}
function toHeadersInstance(init) {
  if (init instanceof Headers) return init;
  else if (Array.isArray(init)) return new Headers(init);
  else if (typeof init === "object") return new Headers(init);
  else return null;
}
function mergeHeaders(...headers) {
  return headers.reduce((acc, header) => {
    const headersInstance = toHeadersInstance(header);
    if (!headersInstance) return acc;
    for (const [key, value] of headersInstance.entries()) if (key === "set-cookie") splitSetCookieString(value).forEach((cookie) => acc.append("set-cookie", cookie));
    else acc.set(key, value);
    return acc;
  }, new Headers());
}
function transformReadableStreamWithRouter(router, routerStream, opts) {
  return transformStreamWithRouter(router, routerStream, opts);
}
function transformPipeableStreamWithRouter(router, routerStream, opts) {
  return Readable.fromWeb(transformStreamWithRouter(router, Readable.toWeb(routerStream), opts));
}
const MIN_CLOSING_TAG_LENGTH = 4;
const DEFAULT_SERIALIZATION_TIMEOUT_MS = 6e4;
const DEFAULT_LIFETIME_TIMEOUT_MS = DEFAULT_SERIALIZATION_TIMEOUT_MS * 2;
const MAX_LEFTOVER_CHARS = 2048;
const MAX_TAIL_CHARS = 64 * 1024;
const MAX_ROUTER_HTML_CHARS = 16 * 1024 * 1024;
const MAX_PENDING_WRITE_CHARS = 16 * 1024 * 1024;
const MergeState = {
  ReadingBody: 0,
  HoldingTail: 1,
  AppDone: 2,
  Draining: 3,
  Done: 4
};
const textEncoder$2 = new TextEncoder();
const noop$1 = () => {
};
const resolvedPromise = Promise.resolve();
function findHtmlBoundary(str) {
  let lastClosingTagEnd = -1;
  let searchFrom = str.length - MIN_CLOSING_TAG_LENGTH;
  while (searchFrom >= 0) {
    const openSlash = str.lastIndexOf("</", searchFrom);
    if (openSlash === -1) break;
    if ((str.charCodeAt(openSlash + 2) | 32) === 98 && (str.charCodeAt(openSlash + 3) | 32) === 111 && (str.charCodeAt(openSlash + 4) | 32) === 100 && (str.charCodeAt(openSlash + 5) | 32) === 121 && str.charCodeAt(openSlash + 6) === 62) return -openSlash - 2;
    if (lastClosingTagEnd === -1) {
      let i = openSlash + 2;
      const startCode = str.charCodeAt(i);
      if (startCode >= 97 && startCode <= 122 || startCode >= 65 && startCode <= 90) {
        i++;
        while (i < str.length) {
          const code = str.charCodeAt(i);
          if (code >= 97 && code <= 122 || code >= 65 && code <= 90 || code >= 48 && code <= 57 || code === 95 || code === 58 || code === 46 || code === 45) i++;
          else break;
        }
        if (str.charCodeAt(i) === 62) lastClosingTagEnd = i + 1;
      }
    }
    searchFrom = openSlash - 1;
  }
  return lastClosingTagEnd;
}
function safeReleaseReader(reader) {
  try {
    reader.releaseLock();
    return true;
  } catch {
    return false;
  }
}
function safeCancelReader(reader, reason) {
  let cancelPromise;
  try {
    cancelPromise = reader.cancel(reason);
  } catch {
  }
  if (!safeReleaseReader(reader) && cancelPromise) return cancelPromise.then(noop$1, noop$1).then(() => {
    safeReleaseReader(reader);
  });
  return cancelPromise ? cancelPromise.then(noop$1, noop$1) : resolvedPromise;
}
function createReaderState(appStream) {
  const reader = appStream.getReader();
  let released = false;
  return {
    reader,
    cancel: (reason) => {
      if (released) return resolvedPromise;
      released = true;
      return safeCancelReader(reader, reason);
    },
    release: () => {
      if (released) return;
      released = true;
      safeReleaseReader(reader);
    }
  };
}
function createAbortNotifier(opts) {
  let abortNotified = false;
  return (reason) => {
    if (abortNotified) return;
    abortNotified = true;
    try {
      opts?.onAbort?.(reason);
    } catch {
    }
  };
}
function transformStreamWithRouter(router, appStream, opts) {
  const serverSsr = router.serverSsr;
  if (!serverSsr) throw new Error("Invariant failed: router.serverSsr is required");
  if (serverSsr.reserveStreamFastPath()) return makeFastPathStream(appStream, opts, serverSsr);
  return makeMainStream(serverSsr, appStream, opts);
}
function makeFastPathStream(appStream, opts, serverSsr) {
  let cleanedUp = false;
  let controller;
  let state = MergeState.ReadingBody;
  let lifetimeTimeoutHandle;
  let stopListeningToInjectedHtml;
  const readerState = createReaderState(appStream);
  const notifyAbort = createAbortNotifier(opts);
  const isDone = () => state === MergeState.Done;
  let renderFinished = false;
  const finishSsrRendering = () => {
    if (!serverSsr || renderFinished) return true;
    renderFinished = true;
    try {
      serverSsr.setRenderFinished();
      return true;
    } catch (error) {
      safeError(error);
      cleanup(error);
      return false;
    }
  };
  const cleanup = (reason, cancelReader = true) => {
    if (cleanedUp) return resolvedPromise;
    cleanedUp = true;
    if (lifetimeTimeoutHandle !== void 0) {
      clearTimeout(lifetimeTimeoutHandle);
      lifetimeTimeoutHandle = void 0;
    }
    try {
      stopListeningToInjectedHtml?.();
    } catch {
    }
    stopListeningToInjectedHtml = void 0;
    if (cancelReader) notifyAbort(reason);
    const readerDone = cancelReader ? readerState.cancel(reason) : (readerState.release(), resolvedPromise);
    if (serverSsr) try {
      serverSsr.cleanup();
    } catch (error) {
      console.error("Error in SSR cleanup:", error);
    }
    return readerDone;
  };
  const safeClose = () => {
    if (isDone()) return;
    state = MergeState.Done;
    try {
      controller?.close();
    } catch {
    }
  };
  const safeError = (error) => {
    if (isDone()) return;
    state = MergeState.Done;
    try {
      controller?.error(error);
    } catch {
    }
  };
  if (serverSsr) stopListeningToInjectedHtml = serverSsr.onInjectedHtml(() => {
    const err = /* @__PURE__ */ new Error("SSR router HTML injected during fast path");
    safeError(err);
    cleanup(err);
  });
  const lifetimeMs = opts?.lifetimeMs ?? DEFAULT_LIFETIME_TIMEOUT_MS;
  lifetimeTimeoutHandle = setTimeout(() => {
    if (!cleanedUp && !isDone()) {
      const err = /* @__PURE__ */ new Error("Stream lifetime exceeded");
      console.warn(`SSR stream transform exceeded maximum lifetime (${lifetimeMs}ms), forcing cleanup`);
      safeError(err);
      cleanup(err);
    }
  }, lifetimeMs);
  return new ReadableStream$1({
    start(c2) {
      controller = c2;
    },
    async pull(c2) {
      if (cleanedUp || isDone()) return;
      try {
        const { done, value } = await readerState.reader.read();
        if (!done) {
          if (!cleanedUp && !isDone()) c2.enqueue(value);
          return;
        }
        if (cleanedUp || isDone()) return;
        if (!finishSsrRendering()) return;
        safeClose();
        return cleanup(void 0, false);
      } catch (error) {
        if (cleanedUp) return;
        console.error("Error reading appStream:", error);
        if (state < MergeState.AppDone) try {
          serverSsr?.setRenderFinished();
        } catch {
        }
        safeError(error);
        return cleanup(error);
      } finally {
        if (cleanedUp || isDone()) readerState.release();
      }
    },
    cancel(reason) {
      state = MergeState.Done;
      return cleanup(reason);
    }
  });
}
function makeMainStream(serverSsr, appStream, opts) {
  let stopListeningToInjectedHtml;
  let stopListeningToSerializationFinished;
  let serializationTimeoutHandle;
  let lifetimeTimeoutHandle;
  let cleanedUp = false;
  let controller;
  let closeWhenDrained = false;
  let state = MergeState.ReadingBody;
  const readerState = createReaderState(appStream);
  const notifyAbort = createAbortNotifier(opts);
  const pendingWrites = [];
  let pendingWriteHead = 0;
  let pendingWriteChars = 0;
  function clearPending() {
    pendingWrites.length = 0;
    pendingWriteHead = 0;
    pendingWriteChars = 0;
  }
  let drainResolve = null;
  const waitForDrain = () => new Promise((r) => {
    drainResolve = r;
  });
  const signalDrain = () => {
    if (drainResolve) {
      const r = drainResolve;
      drainResolve = null;
      r();
    }
  };
  const isDone = () => state === MergeState.Done;
  function drainPending() {
    if (!controller || isDone()) return;
    while (pendingWriteHead < pendingWrites.length) {
      const ds = controller.desiredSize;
      if (ds !== null && ds <= 0) return;
      const next = pendingWrites[pendingWriteHead];
      pendingWrites[pendingWriteHead] = "";
      pendingWriteHead++;
      pendingWriteChars -= next.length;
      try {
        controller.enqueue(textEncoder$2.encode(next));
      } catch (error) {
        safeError(error);
        cleanup(error);
        return;
      }
    }
    if (pendingWriteHead >= pendingWrites.length) {
      pendingWrites.length = 0;
      pendingWriteHead = 0;
    }
    if (closeWhenDrained && pendingWriteHead >= pendingWrites.length) {
      closeWhenDrained = false;
      safeClose();
      cleanup(void 0, false);
    }
  }
  function writeChunk(chunk) {
    if (cleanedUp || isDone()) return;
    if (!chunk.length) return;
    if (pendingWriteChars + chunk.length > MAX_PENDING_WRITE_CHARS) {
      const err = /* @__PURE__ */ new Error("SSR stream pending output exceeded maximum buffer");
      safeError(err);
      cleanup(err);
      return;
    }
    pendingWrites.push(chunk);
    pendingWriteChars += chunk.length;
    drainPending();
  }
  function safeClose() {
    if (isDone()) return;
    state = MergeState.Done;
    try {
      controller?.close();
    } catch {
    }
  }
  function safeError(error) {
    if (isDone()) return;
    state = MergeState.Done;
    try {
      controller?.error(error);
    } catch {
    }
  }
  function cleanup(reason, cancelReader = true) {
    if (cleanedUp) return resolvedPromise;
    cleanedUp = true;
    try {
      stopListeningToInjectedHtml?.();
      stopListeningToSerializationFinished?.();
    } catch {
    }
    stopListeningToInjectedHtml = void 0;
    stopListeningToSerializationFinished = void 0;
    if (serializationTimeoutHandle !== void 0) {
      clearTimeout(serializationTimeoutHandle);
      serializationTimeoutHandle = void 0;
    }
    if (lifetimeTimeoutHandle !== void 0) {
      clearTimeout(lifetimeTimeoutHandle);
      lifetimeTimeoutHandle = void 0;
    }
    clearPendingRouterHtml();
    leftover = "";
    pendingTail = "";
    clearPending();
    if (cancelReader) notifyAbort(reason);
    const readerDone = cancelReader ? readerState.cancel(reason) : (readerState.release(), resolvedPromise);
    signalDrain();
    try {
      serverSsr.cleanup();
    } catch (error) {
      console.error("Error in SSR cleanup:", error);
    }
    return readerDone;
  }
  const textDecoder2 = new TextDecoder();
  const pendingRouterHtml = [];
  let pendingRouterHtmlChars = 0;
  let leftover = "";
  let pendingTail = "";
  let streamBarrierLifted = false;
  let streamBarrierMarkerSeen = false;
  let serializationFinished = false;
  function noteBarrierMarker(chunk) {
    if (streamBarrierMarkerSeen) return;
    if (chunk.includes("$tsr-stream-barrier")) streamBarrierMarkerSeen = true;
  }
  function liftBarrierAfterBoundary() {
    if (streamBarrierLifted) return;
    if (!streamBarrierMarkerSeen) return;
    streamBarrierLifted = true;
    serverSsr.liftScriptBarrier();
  }
  const stream = new ReadableStream$1({
    start(c2) {
      controller = c2;
      drainPending();
    },
    pull() {
      drainPending();
      signalDrain();
    },
    cancel(reason) {
      state = MergeState.Done;
      return cleanup(reason);
    }
  });
  function drainRouterHtml() {
    if (cleanedUp || isDone()) return;
    let html;
    try {
      html = serverSsr.takeBufferedHtml();
    } catch (error) {
      safeError(error);
      cleanup(error);
      return;
    }
    if (!html) return;
    if (state >= MergeState.Draining) {
      const err = /* @__PURE__ */ new Error("SSR router HTML injected after stream finalization");
      safeError(err);
      cleanup(err);
      return;
    }
    if (state === MergeState.HoldingTail) {
      flushPendingRouterHtml();
      writeChunk(html);
    } else {
      if (pendingRouterHtmlChars + html.length > MAX_ROUTER_HTML_CHARS) {
        const err = /* @__PURE__ */ new Error("SSR router HTML exceeded maximum buffer");
        safeError(err);
        cleanup(err);
        return;
      }
      pendingRouterHtml.push(html);
      pendingRouterHtmlChars += html.length;
    }
  }
  function flushPendingRouterHtml() {
    if (!pendingRouterHtml.length) return;
    for (const html of pendingRouterHtml) writeChunk(html);
    clearPendingRouterHtml();
  }
  function clearPendingRouterHtml() {
    pendingRouterHtml.length = 0;
    pendingRouterHtmlChars = 0;
  }
  function appendTail(chunk) {
    pendingTail += chunk;
    if (pendingTail.length > MAX_TAIL_CHARS) throw new Error("SSR stream tail exceeded maximum buffer");
  }
  function waitForBackpressure() {
    return !!(controller && controller.desiredSize !== null && controller.desiredSize <= 0);
  }
  function startSerializationTimeout() {
    if (cleanedUp || isDone()) return;
    if (serializationTimeoutHandle !== void 0) return;
    const timeoutMs2 = opts?.timeoutMs ?? DEFAULT_SERIALIZATION_TIMEOUT_MS;
    serializationTimeoutHandle = setTimeout(() => {
      if (!cleanedUp && !isDone()) {
        const err = /* @__PURE__ */ new Error("Serialization timeout after app render finished");
        console.error("Serialization timeout after app render finished");
        safeError(err);
        cleanup(err);
      }
    }, timeoutMs2);
  }
  function tryFinish() {
    if (state !== MergeState.AppDone || !serializationFinished) return;
    if (cleanedUp || isDone()) return;
    if (serializationTimeoutHandle !== void 0) {
      clearTimeout(serializationTimeoutHandle);
      serializationTimeoutHandle = void 0;
    }
    drainRouterHtml();
    if (cleanedUp || isDone()) return;
    const decoderRemainder = textDecoder2.decode();
    if (leftover) writeChunk(leftover);
    if (cleanedUp || isDone()) return;
    if (decoderRemainder) writeChunk(decoderRemainder);
    if (cleanedUp || isDone()) return;
    flushPendingRouterHtml();
    if (cleanedUp || isDone()) return;
    if (pendingTail) writeChunk(pendingTail);
    if (cleanedUp || isDone()) return;
    leftover = "";
    pendingTail = "";
    state = MergeState.Draining;
    closeWhenDrained = true;
    drainPending();
  }
  function finishAppRendering() {
    if (state >= MergeState.AppDone) return;
    state = MergeState.AppDone;
    try {
      serverSsr.setRenderFinished();
    } catch (error) {
      safeError(error);
      cleanup(error);
      return;
    }
    drainRouterHtml();
    if (cleanedUp || isDone()) return;
    serializationFinished = serializationFinished || serverSsr.isSerializationFinished();
    if (serializationFinished) tryFinish();
    else startSerializationTimeout();
  }
  const timeoutMs = opts?.timeoutMs ?? DEFAULT_SERIALIZATION_TIMEOUT_MS;
  const lifetimeMs = opts?.lifetimeMs ?? timeoutMs * 2;
  lifetimeTimeoutHandle = setTimeout(() => {
    if (!cleanedUp && !isDone()) {
      const err = /* @__PURE__ */ new Error("Stream lifetime exceeded");
      console.warn(`SSR stream transform exceeded maximum lifetime (${lifetimeMs}ms), forcing cleanup`);
      safeError(err);
      cleanup(err);
    }
  }, lifetimeMs);
  stopListeningToInjectedHtml = serverSsr.onInjectedHtml(() => {
    drainRouterHtml();
  });
  stopListeningToSerializationFinished = serverSsr.onSerializationFinished(() => {
    serializationFinished = true;
    drainRouterHtml();
    tryFinish();
  });
  drainRouterHtml();
  if (cleanedUp || isDone()) return stream;
  serializationFinished = serializationFinished || serverSsr.isSerializationFinished();
  if (serializationFinished) {
    drainRouterHtml();
    if (cleanedUp || isDone()) return stream;
  }
  (async () => {
    try {
      while (true) {
        if (waitForBackpressure()) {
          await waitForDrain();
          if (cleanedUp || isDone()) return;
        }
        const { done, value } = await readerState.reader.read();
        if (done) break;
        if (cleanedUp || isDone()) return;
        const text = typeof value === "string" ? value : textDecoder2.decode(value, { stream: true });
        const chunkString = leftover ? leftover + text : text;
        if (state >= MergeState.HoldingTail) {
          appendTail(chunkString);
          leftover = "";
          continue;
        }
        const boundary = findHtmlBoundary(chunkString);
        if (boundary < -1) {
          const bodyEndIndex = -boundary - 2;
          state = MergeState.HoldingTail;
          appendTail(chunkString.slice(bodyEndIndex));
          const bodyChunk = chunkString.slice(0, bodyEndIndex);
          writeChunk(bodyChunk);
          if (cleanedUp || isDone()) return;
          noteBarrierMarker(bodyChunk);
          liftBarrierAfterBoundary();
          if (cleanedUp || isDone()) return;
          flushPendingRouterHtml();
          leftover = "";
          continue;
        }
        const lastClosingTagEnd = boundary;
        if (lastClosingTagEnd > 0) {
          const safeChunk = chunkString.slice(0, lastClosingTagEnd);
          writeChunk(safeChunk);
          if (cleanedUp || isDone()) return;
          noteBarrierMarker(safeChunk);
          liftBarrierAfterBoundary();
          if (cleanedUp || isDone()) return;
          flushPendingRouterHtml();
          leftover = chunkString.slice(lastClosingTagEnd);
          if (leftover.length > MAX_LEFTOVER_CHARS) {
            noteBarrierMarker(leftover);
            writeChunk(leftover.slice(0, leftover.length - MAX_LEFTOVER_CHARS));
            leftover = leftover.slice(-2048);
          }
        } else {
          const combined = chunkString;
          if (combined.length > MAX_LEFTOVER_CHARS) {
            noteBarrierMarker(combined);
            const flushUpto = combined.length - MAX_LEFTOVER_CHARS;
            writeChunk(combined.slice(0, flushUpto));
            leftover = combined.slice(flushUpto);
          } else leftover = combined;
        }
      }
      if (cleanedUp || isDone()) return;
      finishAppRendering();
    } catch (error) {
      if (cleanedUp) return;
      console.error("Error reading appStream:", error);
      if (state < MergeState.AppDone) try {
        serverSsr.setRenderFinished();
      } catch {
      }
      safeError(error);
      cleanup(error);
    } finally {
      readerState.release();
    }
  })().catch((error) => {
    if (cleanedUp) return;
    console.error("Error in stream transform:", error);
    safeError(error);
    cleanup(error);
  });
  return stream;
}
var fullPattern = " daum[ /]| deusu/|(?:^|[^g])news(?!sapphire)|(?<! (?:channel/|google/))google(?!(wv|app|/google| pixel))|(?<! cu)bots?(?:\\b|_)|(?<!(?:lib))http|(?<!cam)scan|24x7|;\\s\\w+;$|@[a-z][\\w-]+\\.|\\(\\)|\\.com\\b|\\b\\w+\\.ai|\\bbw/|\\bdlc\\b|\\bort/|\\bperl\\b|\\btime/|\\||^[\\w \\.\\-\\(?:\\):%]+(?:/v?\\d+(?:\\.\\d+)?(?:\\.\\d{1,10})*?)?(?:,|$)|^[\\w\\-]+/[\\w]+$|^[^ ]{50,}$|^\\d+\\b|^\\W|^\\w*search\\b|^\\w+/[\\w\\(\\)]*$|^\\w+/\\d\\.\\d\\s\\([\\w@]+\\)$|^active|^ad muncher|^amaya|^apache/|^avsdevicesdk/|^azure|^biglotron|^blackbox exporter|^bot|^clamav[ /]|^claude-code/|^client/|^cobweb/|^custom|^ddg[_-]android|^discourse|^dispatch/\\d|^downcast/|^duckduckgo|^email|^exodusmovement|^facebook|^getright/|^gozilla/|^hobbit|^hotzonu|^hwcdn/|^igetter/|^jeode/|^jetty/|^jigsaw|^microsoft bits|^movabletype|^mozilla/\\d\\.\\d\\s[\\w\\.-]+$|^mozilla/\\d\\.\\d\\s\\((?:compatible;)?(?:\\s?[\\w\\d-.]+\\/\\d+\\.\\d+)?\\)$|^navermailapp|^netsurf|^offline|^openai/|^owler|^php|^postman|^ps_daily/|^python|^rank|^read|^reed|^remove\\.bg/|^rest|^rss|^snapchat|^sora |^space bison|^stape/|^svn|^swcd |^taringa|^thumbor/|^track|^w3c|^webbandit/|^webcopier|^wget|^whatsapp|^wordpress|^xenu link sleuth|^yahoo|^yandex|^zdm/\\d|^zoom marketplace/|abuse|advisor|agent\\b|analyzer|archive|ask jeeves/teoma|attracta|audit|bluecoat drtr|browsex|burpcollaborator|capture|catch|check\\b|checker|chrome-lighthouse|chromeframe|classifier|cloudflare|collapsify\\b|convertify|cookiehubverify/|crawl|cursor/|cypress/|dareboost|datanyze|dejaclick|detect|dmbrowser|download|exaleadcloudview|feed|fetcher|firephp|foregenix|functionize|grab|productfinder|hardenize\\b|headless|hotjar|httrack|hubspot marketing grader|ibisbrowser|infrawatch|insight|inspect|iplabel|java(?!;)|library|linkcheck|linktiger|mail\\.ru/|manager|manus-user/|marketgoo/|measure|monitor\\b|neustar wpm|node\\b|nutch|offbyone|openvas|optimize|pageburst|pagespeed|parser|phantomjs|pingdom|playwright|powermarks|preview|proxy|ptst[ /]\\d|readable/|retriever|rexx;|rigor|rss\\b|scrape|securityheaders|selenium|server|silktide|sindup/|sogou|sparkler/|speedcurve|spider|splash|statuscake|supercleaner|synapse|synthetic|testlocally|tools|torrent|transcoder|upday/|url|validator|virtuoso|wappalyzer|watchtowr|webglance|webkit2png|whatcms/|xtate/";
var naivePattern = /bot|crawl|http|lighthouse|scan|search|spider/i;
var pattern;
function getPattern() {
  if (pattern instanceof RegExp) {
    return pattern;
  }
  try {
    pattern = new RegExp(fullPattern, "i");
  } catch (error) {
    pattern = naivePattern;
  }
  return pattern;
}
var isNonEmptyString = (value) => typeof value === "string" && value !== "";
function isbot(userAgent) {
  return isNonEmptyString(userAgent) && getPattern().test(userAgent);
}
var noop = () => {
};
async function waitForReadyOrAbort(ready, signal) {
  let cleanup = noop;
  try {
    await Promise.race([ready, new Promise((resolve) => {
      const onAbort = () => resolve();
      cleanup = () => signal.removeEventListener("abort", onAbort);
      signal.addEventListener("abort", onAbort, { once: true });
      if (signal.aborted) resolve();
    })]);
  } finally {
    cleanup();
  }
}
var isAbortError = (request, error) => request.signal.aborted && error === request.signal.reason || error instanceof Error && error.name === "AbortError";
var renderRouterToStream = async ({ request, router, responseHeaders, children }) => {
  if (typeof ReactDOMServer.renderToReadableStream === "function") {
    const stream = await ReactDOMServer.renderToReadableStream(children, {
      signal: request.signal,
      nonce: router.options.ssr?.nonce,
      progressiveChunkSize: Number.POSITIVE_INFINITY,
      onError: (error, info) => {
        if (!isAbortError(request, error)) console.error("Error in renderToReadableStream:", error, info);
      }
    });
    if (isbot(request.headers.get("User-Agent"))) await waitForReadyOrAbort(stream.allReady, request.signal);
    const responseStream = transformReadableStreamWithRouter(router, stream, { onAbort: () => stream.cancel().catch(() => {
    }) });
    return createSsrStreamResponse(router, new Response(responseStream, {
      status: router.stores.statusCode.get(),
      headers: responseHeaders
    }));
  }
  if (typeof ReactDOMServer.renderToPipeableStream === "function") {
    const reactAppPassthrough = new PassThrough();
    let pipeable;
    let responseAttached = false;
    let aborted = false;
    let endedBeforeAttach = false;
    let pendingAbortReason;
    const toError = (reason) => reason instanceof Error ? reason : new Error(String(reason ?? "SSR aborted"));
    const destroyError = (reason) => reason === void 0 ? void 0 : toError(reason);
    const pendingDestroyError = () => pendingAbortReason === void 0 ? toError(pendingAbortReason) : destroyError(pendingAbortReason);
    const finishPassThrough = (reason, opts) => {
      if (reactAppPassthrough.destroyed) return;
      if (responseAttached) reactAppPassthrough.destroy(opts?.defaultError ? toError(reason) : destroyError(reason));
      else endedBeforeAttach = true;
    };
    const abortPipeable = (reason, opts) => {
      if (aborted) return;
      aborted = true;
      pendingAbortReason = reason;
      const err = toError(reason);
      try {
        pipeable?.abort(err);
      } catch {
      }
      finishPassThrough(reason, opts);
    };
    if (request.signal.aborted) abortPipeable(request.signal.reason);
    else {
      const onRequestAbort = () => abortPipeable(request.signal.reason);
      request.signal.addEventListener("abort", onRequestAbort, { once: true });
      router.serverSsr?.onCleanup(() => {
        request.signal.removeEventListener("abort", onRequestAbort);
      });
    }
    try {
      pipeable = ReactDOMServer.renderToPipeableStream(children, {
        nonce: router.options.ssr?.nonce,
        progressiveChunkSize: Number.POSITIVE_INFINITY,
        ...isbot(request.headers.get("User-Agent")) ? { onAllReady() {
          pipeable.pipe(reactAppPassthrough);
        } } : { onShellReady() {
          pipeable.pipe(reactAppPassthrough);
        } },
        onError: (error, info) => {
          if (!isAbortError(request, error)) console.error("Error in renderToPipeableStream:", error, info);
          abortPipeable(error, { defaultError: true });
        }
      });
    } catch (e) {
      console.error("Error in renderToPipeableStream:", e);
      router.serverSsr?.cleanup();
      throw e;
    }
    const responseStream = transformPipeableStreamWithRouter(router, reactAppPassthrough, { onAbort: abortPipeable });
    responseAttached = true;
    if (endedBeforeAttach) reactAppPassthrough.destroy(pendingDestroyError());
    if (aborted && pipeable) try {
      pipeable.abort(toError(pendingAbortReason));
    } catch {
    }
    return createSsrStreamResponse(router, new Response(responseStream, {
      status: router.stores.statusCode.get(),
      headers: responseHeaders
    }));
  }
  throw new Error("No renderToReadableStream or renderToPipeableStream found in react-dom/server. Ensure you are using a version of react-dom that supports streaming.");
};
var defaultStreamHandler = defineHandlerCallback(({ request, router, responseHeaders }) => renderRouterToStream({
  request,
  router,
  responseHeaders,
  children: /* @__PURE__ */ jsxRuntimeExports.jsx(StartServer, { router })
}));
const NullProtoObj = /* @__PURE__ */ (() => {
  const e = function() {
  };
  return e.prototype = /* @__PURE__ */ Object.create(null), Object.freeze(e.prototype), e;
})();
function lazyInherit(target, source, sourceKey) {
  for (const key of [...Object.getOwnPropertyNames(source), ...Object.getOwnPropertySymbols(source)]) {
    if (key === "constructor") continue;
    const targetDesc = Object.getOwnPropertyDescriptor(target, key);
    const desc = Object.getOwnPropertyDescriptor(source, key);
    let modified = false;
    if (desc.get) {
      modified = true;
      desc.get = targetDesc?.get || function() {
        return this[sourceKey][key];
      };
    }
    if (desc.set) {
      modified = true;
      desc.set = targetDesc?.set || function(value) {
        this[sourceKey][key] = value;
      };
    }
    if (!targetDesc?.value && typeof desc.value === "function") {
      modified = true;
      desc.value = function(...args) {
        return this[sourceKey][key](...args);
      };
    }
    if (modified) Object.defineProperty(target, key, desc);
  }
}
const _needsNormRE = /(?:(?:^|\/)(?:\.|\.\.|%2e|%2e\.|\.%2e|%2e%2e)(?:\/|$))|[\\^#"<>{}`\x80-\uffff]/i;
const FastURL = /* @__PURE__ */ (() => {
  const NativeURL = globalThis.URL;
  const FastURL2 = class URL {
    #url;
    #href;
    #protocol;
    #host;
    #pathname;
    #search;
    #searchParams;
    #pos;
    constructor(url) {
      if (typeof url === "string") {
        const isOriginForm = url[0] === "/";
        if (isOriginForm && !url.includes("#")) this.#href = url;
        else this.#url = new NativeURL(isOriginForm ? `http://localhost${url}` : url);
      } else if (_needsNormRE.test(url.pathname) || url.search?.includes("#")) this.#url = new NativeURL(`${url.protocol || "http:"}//${url.host || "localhost"}${url.pathname}${url.search || ""}`);
      else {
        this.#protocol = url.protocol;
        this.#host = url.host;
        this.#pathname = url.pathname;
        this.#search = url.search;
      }
    }
    static [Symbol.hasInstance](val) {
      return val instanceof NativeURL;
    }
    get _url() {
      if (this.#url) return this.#url;
      this.#url = new NativeURL(this.href);
      this.#href = void 0;
      this.#protocol = void 0;
      this.#host = void 0;
      this.#pathname = void 0;
      this.#search = void 0;
      this.#searchParams = void 0;
      this.#pos = void 0;
      return this.#url;
    }
    get href() {
      if (this.#url) return this.#url.href;
      if (!this.#href) this.#href = `${this.#protocol || "http:"}//${this.#host || "localhost"}${this.#pathname || "/"}${this.#search || ""}`;
      return this.#href;
    }
    #getPos() {
      if (!this.#pos) {
        const url = this.href;
        const protoIndex = url.indexOf("://");
        const pathnameIndex = protoIndex === -1 ? -1 : url.indexOf("/", protoIndex + 4);
        const qIndex = pathnameIndex === -1 ? -1 : url.indexOf("?", pathnameIndex);
        this.#pos = [
          protoIndex,
          pathnameIndex,
          qIndex
        ];
      }
      return this.#pos;
    }
    get pathname() {
      if (this.#url) return this.#url.pathname;
      if (this.#pathname === void 0) {
        const [, pathnameIndex, queryIndex] = this.#getPos();
        if (pathnameIndex === -1) return this._url.pathname;
        this.#pathname = this.href.slice(pathnameIndex, queryIndex === -1 ? void 0 : queryIndex);
      }
      return this.#pathname;
    }
    get search() {
      if (this.#url) return this.#url.search;
      if (this.#search === void 0) {
        const [, pathnameIndex, queryIndex] = this.#getPos();
        if (pathnameIndex === -1) return this._url.search;
        const url = this.href;
        this.#search = queryIndex === -1 || queryIndex === url.length - 1 ? "" : url.slice(queryIndex);
      }
      return this.#search;
    }
    get searchParams() {
      if (this.#url) return this.#url.searchParams;
      if (!this.#searchParams) this.#searchParams = new URLSearchParams(this.search);
      return this.#searchParams;
    }
    get protocol() {
      if (this.#url) return this.#url.protocol;
      if (this.#protocol === void 0) {
        const [protocolIndex] = this.#getPos();
        if (protocolIndex === -1) return this._url.protocol;
        const url = this.href;
        this.#protocol = url.slice(0, protocolIndex + 1);
      }
      return this.#protocol;
    }
    toString() {
      return this.href;
    }
    toJSON() {
      return this.href;
    }
  };
  lazyInherit(FastURL2.prototype, NativeURL.prototype, "_url");
  Object.setPrototypeOf(FastURL2.prototype, NativeURL.prototype);
  Object.setPrototypeOf(FastURL2, NativeURL);
  return FastURL2;
})();
const NodeResponse = /* @__PURE__ */ (() => {
  const NativeResponse = globalThis.Response;
  const STATUS_CODES = globalThis.process?.getBuiltinModule?.("node:http")?.STATUS_CODES || {};
  class NodeResponse2 {
    #body;
    #init;
    #headers;
    #response;
    constructor(body, init) {
      this.#body = body;
      this.#init = init;
    }
    static [Symbol.hasInstance](val) {
      return val instanceof NativeResponse;
    }
    get status() {
      return this.#response?.status || this.#init?.status || 200;
    }
    get statusText() {
      return this.#response?.statusText || this.#init?.statusText || STATUS_CODES[this.status] || "";
    }
    get headers() {
      if (this.#response) return this.#response.headers;
      if (this.#headers) return this.#headers;
      const initHeaders = this.#init?.headers;
      return this.#headers = initHeaders instanceof Headers ? initHeaders : new Headers(initHeaders);
    }
    get ok() {
      if (this.#response) return this.#response.ok;
      const status = this.status;
      return status >= 200 && status < 300;
    }
    get _response() {
      if (this.#response) return this.#response;
      let body = this.#body;
      if (body && typeof body.pipe === "function" && !(body instanceof Readable)) {
        const stream = new PassThrough();
        body.pipe(stream);
        const abort = body.abort;
        if (abort) stream.once("close", () => abort());
        body = stream;
      }
      this.#response = new NativeResponse(body, this.#headers ? {
        ...this.#init,
        headers: this.#headers
      } : this.#init);
      this.#init = void 0;
      this.#headers = void 0;
      this.#body = void 0;
      return this.#response;
    }
    _toNodeResponse() {
      const status = this.status;
      const statusText = this.statusText;
      let body;
      let contentType;
      let contentLength;
      if (this.#response) body = this.#response.body;
      else if (this.#body) if (this.#body instanceof ReadableStream) body = this.#body;
      else if (typeof this.#body === "string") {
        body = this.#body;
        contentType = "text/plain; charset=UTF-8";
        contentLength = Buffer.byteLength(this.#body);
      } else if (this.#body instanceof ArrayBuffer) {
        body = Buffer.from(this.#body);
        contentLength = this.#body.byteLength;
      } else if (this.#body instanceof Uint8Array) {
        body = this.#body;
        contentLength = this.#body.byteLength;
      } else if (this.#body instanceof DataView) {
        body = Buffer.from(this.#body.buffer);
        contentLength = this.#body.byteLength;
      } else if (this.#body instanceof Blob) {
        body = this.#body.stream();
        contentType = this.#body.type;
        contentLength = this.#body.size;
      } else if (typeof this.#body.pipe === "function") body = this.#body;
      else body = this._response.body;
      const headers = [];
      const initHeaders = this.#init?.headers;
      const headerEntries = this.#response?.headers || this.#headers || (initHeaders ? Array.isArray(initHeaders) ? initHeaders : initHeaders?.entries ? initHeaders.entries() : Object.entries(initHeaders).map(([k2, v2]) => [k2.toLowerCase(), v2]) : void 0);
      let hasContentTypeHeader;
      let hasContentLength;
      if (headerEntries) for (const [key, value] of headerEntries) {
        if (Array.isArray(value)) for (const v2 of value) headers.push([key, v2]);
        else headers.push([key, value]);
        if (key === "content-type") hasContentTypeHeader = true;
        else if (key === "content-length") hasContentLength = true;
      }
      if (contentType && !hasContentTypeHeader) headers.push(["content-type", contentType]);
      if (contentLength && !hasContentLength) headers.push(["content-length", String(contentLength)]);
      this.#init = void 0;
      this.#headers = void 0;
      this.#response = void 0;
      this.#body = void 0;
      return {
        status,
        statusText,
        headers,
        body
      };
    }
  }
  lazyInherit(NodeResponse2.prototype, NativeResponse.prototype, "_response");
  Object.setPrototypeOf(NodeResponse2, NativeResponse);
  Object.setPrototypeOf(NodeResponse2.prototype, NativeResponse.prototype);
  return NodeResponse2;
})();
function decodePathname(pathname) {
  return decodeURI(pathname.includes("%25") ? pathname.replace(/%25/g, "%2525") : pathname);
}
const kEventNS = "h3.internal.event.";
const kEventRes = /* @__PURE__ */ Symbol.for(`${kEventNS}res`);
const kEventResHeaders = /* @__PURE__ */ Symbol.for(`${kEventNS}res.headers`);
const kEventResErrHeaders = /* @__PURE__ */ Symbol.for(`${kEventNS}res.err.headers`);
var H3Event = class {
  app;
  req;
  url;
  context;
  static __is_event__ = true;
  constructor(req, context, app) {
    this.context = context || req.context || new NullProtoObj();
    this.req = req;
    this.app = app;
    const _url = req._url;
    const url = _url && _url instanceof URL ? _url : new FastURL(req.url);
    if (url.pathname.includes("%")) url.pathname = decodePathname(url.pathname);
    this.url = url;
  }
  get res() {
    return this[kEventRes] ||= new H3EventResponse();
  }
  get runtime() {
    return this.req.runtime;
  }
  waitUntil(promise) {
    this.req.waitUntil?.(promise);
  }
  toString() {
    return `[${this.req.method}] ${this.req.url}`;
  }
  toJSON() {
    return this.toString();
  }
  get node() {
    return this.req.runtime?.node;
  }
  get headers() {
    return this.req.headers;
  }
  get path() {
    return this.url.pathname + this.url.search;
  }
  get method() {
    return this.req.method;
  }
};
var H3EventResponse = class {
  status;
  statusText;
  get headers() {
    return this[kEventResHeaders] ||= new Headers();
  }
  get errHeaders() {
    return this[kEventResErrHeaders] ||= new Headers();
  }
};
const DISALLOWED_STATUS_CHARS = /[^\u0009\u0020-\u007E]/g;
function sanitizeStatusMessage(statusMessage = "") {
  return statusMessage.replace(DISALLOWED_STATUS_CHARS, "");
}
function sanitizeStatusCode(statusCode, defaultStatusCode = 200) {
  if (!statusCode) return defaultStatusCode;
  if (typeof statusCode === "string") statusCode = +statusCode;
  if (statusCode < 100 || statusCode > 599) return defaultStatusCode;
  return statusCode;
}
var HTTPError = class HTTPError2 extends Error {
  get name() {
    return "HTTPError";
  }
  status;
  statusText;
  headers;
  cause;
  data;
  body;
  unhandled;
  static isError(input) {
    return input instanceof Error && input?.name === "HTTPError";
  }
  static status(status, statusText, details) {
    return new HTTPError2({
      ...details,
      statusText,
      status
    });
  }
  constructor(arg1, arg2) {
    let messageInput;
    let details;
    if (typeof arg1 === "string") {
      messageInput = arg1;
      details = arg2;
    } else details = arg1;
    const status = sanitizeStatusCode(details?.status || details?.statusCode || details?.cause?.status || details?.cause?.statusCode, 500);
    const statusText = sanitizeStatusMessage(details?.statusText || details?.statusMessage || details?.cause?.statusText || details?.cause?.statusMessage);
    const message = messageInput || details?.message || details?.cause?.message || details?.statusText || details?.statusMessage || [
      "HTTPError",
      status,
      statusText
    ].filter(Boolean).join(" ");
    super(message, { cause: details });
    this.cause = details;
    this.status = status;
    this.statusText = statusText || void 0;
    const rawHeaders = details?.headers || details?.cause?.headers;
    this.headers = rawHeaders ? new Headers(rawHeaders) : void 0;
    this.unhandled = details?.unhandled ?? details?.cause?.unhandled ?? void 0;
    this.data = details?.data;
    this.body = details?.body;
  }
  get statusCode() {
    return this.status;
  }
  get statusMessage() {
    return this.statusText;
  }
  toJSON() {
    const unhandled = this.unhandled;
    return {
      status: this.status,
      statusText: this.statusText,
      unhandled,
      message: unhandled ? "HTTPError" : this.message,
      data: unhandled ? void 0 : this.data,
      ...unhandled ? void 0 : this.body
    };
  }
};
function isJSONSerializable(value, _type) {
  if (value === null || value === void 0) return true;
  if (_type !== "object") return _type === "boolean" || _type === "number" || _type === "string";
  if (typeof value.toJSON === "function") return true;
  if (Array.isArray(value)) return true;
  if (typeof value.pipe === "function" || typeof value.pipeTo === "function") return false;
  if (value instanceof NullProtoObj) return true;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}
const kNotFound = /* @__PURE__ */ Symbol.for("h3.notFound");
const kHandled = /* @__PURE__ */ Symbol.for("h3.handled");
function toResponse(val, event, config = {}) {
  if (typeof val?.then === "function") return (val.catch?.((error) => error) || Promise.resolve(val)).then((resolvedVal) => toResponse(resolvedVal, event, config));
  const response = prepareResponse(val, event, config);
  if (typeof response?.then === "function") return toResponse(response, event, config);
  const { onResponse } = config;
  return onResponse ? Promise.resolve(onResponse(response, event)).then(() => response) : response;
}
var HTTPResponse = class {
  #headers;
  #init;
  body;
  constructor(body, init) {
    this.body = body;
    this.#init = init;
  }
  get status() {
    return this.#init?.status || 200;
  }
  get statusText() {
    return this.#init?.statusText || "OK";
  }
  get headers() {
    return this.#headers ||= new Headers(this.#init?.headers);
  }
};
function prepareResponse(val, event, config, nested) {
  if (val === kHandled) return new NodeResponse(null);
  if (val === kNotFound) val = new HTTPError({
    status: 404,
    message: `Cannot find any route matching [${event.req.method}] ${event.url}`
  });
  if (val && val instanceof Error) {
    const isHTTPError = HTTPError.isError(val);
    const error = isHTTPError ? val : new HTTPError(val);
    if (!isHTTPError) {
      error.unhandled = true;
      if (val?.stack) error.stack = val.stack;
    }
    if (error.unhandled && !config.silent) console.error(error);
    const { onError } = config;
    const errHeaders = event[kEventRes]?.[kEventResErrHeaders];
    return onError && !nested ? Promise.resolve(onError(error, event)).catch((error2) => error2).then((newVal) => prepareResponse(newVal ?? val, event, config, true)) : errorResponse(error, config.debug, errHeaders);
  }
  const preparedRes = event[kEventRes];
  const preparedHeaders = preparedRes?.[kEventResHeaders];
  event[kEventRes] = void 0;
  if (!(val instanceof Response)) {
    const res = prepareResponseBody(val, event, config);
    const status = res.status || preparedRes?.status;
    return new NodeResponse(nullBody(event.req.method, status) ? null : res.body, {
      status,
      statusText: res.statusText || preparedRes?.statusText,
      headers: res.headers && preparedHeaders ? mergeHeaders$1(res.headers, preparedHeaders) : res.headers || preparedHeaders
    });
  }
  if (!preparedHeaders || nested || !val.ok) return val;
  try {
    mergeHeaders$1(val.headers, preparedHeaders, val.headers);
    return val;
  } catch {
    return new NodeResponse(nullBody(event.req.method, val.status) ? null : val.body, {
      status: val.status,
      statusText: val.statusText,
      headers: mergeHeaders$1(val.headers, preparedHeaders)
    });
  }
}
function mergeHeaders$1(base, overrides, target = new Headers(base)) {
  for (const [name, value] of overrides) if (name === "set-cookie") target.append(name, value);
  else target.set(name, value);
  return target;
}
const frozen = (name) => (...args) => {
  throw new Error(`Headers are frozen (${name} ${args.join(", ")})`);
};
var FrozenHeaders = class extends Headers {
  set = frozen("set");
  append = frozen("append");
  delete = frozen("delete");
};
const emptyHeaders = /* @__PURE__ */ new FrozenHeaders({ "content-length": "0" });
const jsonHeaders = /* @__PURE__ */ new FrozenHeaders({ "content-type": "application/json;charset=UTF-8" });
function prepareResponseBody(val, event, config) {
  if (val === null || val === void 0) return {
    body: "",
    headers: emptyHeaders
  };
  const valType = typeof val;
  if (valType === "string") return { body: val };
  if (val instanceof Uint8Array) {
    event.res.headers.set("content-length", val.byteLength.toString());
    return { body: val };
  }
  if (val instanceof HTTPResponse || val?.constructor?.name === "HTTPResponse") return val;
  if (isJSONSerializable(val, valType)) return {
    body: JSON.stringify(val, void 0, config.debug ? 2 : void 0),
    headers: jsonHeaders
  };
  if (valType === "bigint") return {
    body: val.toString(),
    headers: jsonHeaders
  };
  if (val instanceof Blob) {
    const headers = new Headers({
      "content-type": val.type,
      "content-length": val.size.toString()
    });
    let filename = val.name;
    if (filename) {
      filename = encodeURIComponent(filename);
      headers.set("content-disposition", `filename="${filename}"; filename*=UTF-8''${filename}`);
    }
    return {
      body: val.stream(),
      headers
    };
  }
  if (valType === "symbol") return { body: val.toString() };
  if (valType === "function") return { body: `${val.name}()` };
  return { body: val };
}
function nullBody(method, status) {
  return method === "HEAD" || status === 100 || status === 101 || status === 102 || status === 204 || status === 205 || status === 304;
}
function errorResponse(error, debug, errHeaders) {
  let headers = error.headers ? mergeHeaders$1(jsonHeaders, error.headers) : new Headers(jsonHeaders);
  if (errHeaders) headers = mergeHeaders$1(headers, errHeaders);
  return new NodeResponse(JSON.stringify({
    ...error.toJSON(),
    stack: debug && error.stack ? error.stack.split("\n").map((l) => l.trim()) : void 0
  }, void 0, debug ? 2 : void 0), {
    status: error.status,
    statusText: error.statusText,
    headers
  });
}
function getEventContext(event) {
  if (event.context) return event.context;
  event.req.context ??= {};
  return event.req.context;
}
const textEncoder$1 = /* @__PURE__ */ new TextEncoder();
const textDecoder = /* @__PURE__ */ new TextDecoder();
const base64Code = [
  65,
  66,
  67,
  68,
  69,
  70,
  71,
  72,
  73,
  74,
  75,
  76,
  77,
  78,
  79,
  80,
  81,
  82,
  83,
  84,
  85,
  86,
  87,
  88,
  89,
  90,
  97,
  98,
  99,
  100,
  101,
  102,
  103,
  104,
  105,
  106,
  107,
  108,
  109,
  110,
  111,
  112,
  113,
  114,
  115,
  116,
  117,
  118,
  119,
  120,
  121,
  122,
  48,
  49,
  50,
  51,
  52,
  53,
  54,
  55,
  56,
  57,
  45,
  95
];
function base64Encode(data) {
  const buff = validateBinaryLike(data);
  if (globalThis.Buffer) return globalThis.Buffer.from(buff).toString("base64url");
  const bytes = [];
  let i;
  const len = buff.length;
  for (i = 2; i < len; i += 3) bytes.push(base64Code[buff[i - 2] >> 2], base64Code[(buff[i - 2] & 3) << 4 | buff[i - 1] >> 4], base64Code[(buff[i - 1] & 15) << 2 | buff[i] >> 6], base64Code[buff[i] & 63]);
  if (i === len + 1) bytes.push(base64Code[buff[i - 2] >> 2], base64Code[(buff[i - 2] & 3) << 4]);
  if (i === len) bytes.push(base64Code[buff[i - 2] >> 2], base64Code[(buff[i - 2] & 3) << 4 | buff[i - 1] >> 4], base64Code[(buff[i - 1] & 15) << 2]);
  return String.fromCharCode(...bytes);
}
function base64Decode(b64Url) {
  if (globalThis.Buffer) return new Uint8Array(globalThis.Buffer.from(b64Url, "base64url"));
  const b64 = b64Url.replace(/-/g, "+").replace(/_/g, "/");
  const binString = atob(b64);
  const size = binString.length;
  const bytes = new Uint8Array(size);
  for (let i = 0; i < size; i++) bytes[i] = binString.charCodeAt(i);
  return bytes;
}
function validateBinaryLike(source) {
  if (typeof source === "string") return textEncoder$1.encode(source);
  else if (source instanceof Uint8Array) return source;
  else if (source instanceof ArrayBuffer) return new Uint8Array(source);
  throw new TypeError(`The input must be a Uint8Array, a string, or an ArrayBuffer.`);
}
const COOKIE_MAX_AGE_LIMIT = 3456e4;
function endIndex(str, min, len) {
  const index = str.indexOf(";", min);
  return index === -1 ? len : index;
}
function eqIndex(str, min, max) {
  const index = str.indexOf("=", min);
  return index < max ? index : -1;
}
function valueSlice(str, min, max) {
  if (min === max) return "";
  let start = min;
  let end = max;
  do {
    const code = str.charCodeAt(start);
    if (code !== 32 && code !== 9) break;
  } while (++start < end);
  while (end > start) {
    const code = str.charCodeAt(end - 1);
    if (code !== 32 && code !== 9) break;
    end--;
  }
  return str.slice(start, end);
}
const NullObject = /* @__PURE__ */ (() => {
  const C2 = function() {
  };
  C2.prototype = /* @__PURE__ */ Object.create(null);
  return C2;
})();
function parse(str, options) {
  const obj = new NullObject();
  const len = str.length;
  if (len < 2) return obj;
  const dec = decode;
  let index = 0;
  do {
    const eqIdx = eqIndex(str, index, len);
    if (eqIdx === -1) break;
    const endIdx = endIndex(str, index, len);
    if (eqIdx > endIdx) {
      index = str.lastIndexOf(";", eqIdx - 1) + 1;
      continue;
    }
    const key = valueSlice(str, index, eqIdx);
    const val = dec(valueSlice(str, eqIdx + 1, endIdx));
    if (obj[key] === void 0) obj[key] = val;
    index = endIdx + 1;
  } while (index < len);
  return obj;
}
function decode(str) {
  if (!str.includes("%")) return str;
  try {
    return decodeURIComponent(str);
  } catch {
    return str;
  }
}
const cookieNameRegExp = /^[\u0021-\u003A\u003C\u003E-\u007E]+$/;
const cookieValueRegExp = /^[\u0021-\u003A\u003C-\u007E]*$/;
const domainValueRegExp = /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;
const pathValueRegExp = /^[\u0020-\u003A\u003C-\u007E]*$/;
const __toString = Object.prototype.toString;
function serialize(_a0, _a1, _a2) {
  const isObj = typeof _a0 === "object" && _a0 !== null;
  const cookie = isObj ? _a0 : {
    ..._a2,
    name: _a0,
    value: ""
  };
  const enc = encodeURIComponent;
  if (!cookieNameRegExp.test(cookie.name)) throw new TypeError(`argument name is invalid: ${cookie.name}`);
  const value = cookie.value ? enc(cookie.value) : "";
  if (!cookieValueRegExp.test(value)) throw new TypeError(`argument val is invalid: ${cookie.value}`);
  if (!cookie.secure) {
    if (cookie.partitioned) throw new TypeError(`Partitioned cookies must have the Secure attribute`);
    if (cookie.sameSite && String(cookie.sameSite).toLowerCase() === "none") throw new TypeError(`SameSite=None cookies must have the Secure attribute`);
    if (cookie.name.length > 9 && cookie.name.charCodeAt(0) === 95 && cookie.name.charCodeAt(1) === 95) {
      const nameLower = cookie.name.toLowerCase();
      if (nameLower.startsWith("__secure-") || nameLower.startsWith("__host-")) throw new TypeError(`${cookie.name} cookies must have the Secure attribute`);
    }
  }
  if (cookie.name.length > 7 && cookie.name.charCodeAt(0) === 95 && cookie.name.charCodeAt(1) === 95 && cookie.name.toLowerCase().startsWith("__host-")) {
    if (cookie.path !== "/") throw new TypeError(`__Host- cookies must have Path=/`);
    if (cookie.domain) throw new TypeError(`__Host- cookies must not have a Domain attribute`);
  }
  let str = cookie.name + "=" + value;
  if (cookie.maxAge !== void 0) {
    if (!Number.isInteger(cookie.maxAge)) throw new TypeError(`option maxAge is invalid: ${cookie.maxAge}`);
    str += "; Max-Age=" + Math.max(0, Math.min(cookie.maxAge, COOKIE_MAX_AGE_LIMIT));
  }
  if (cookie.domain) {
    if (!domainValueRegExp.test(cookie.domain)) throw new TypeError(`option domain is invalid: ${cookie.domain}`);
    str += "; Domain=" + cookie.domain;
  }
  if (cookie.path) {
    if (!pathValueRegExp.test(cookie.path)) throw new TypeError(`option path is invalid: ${cookie.path}`);
    str += "; Path=" + cookie.path;
  }
  if (cookie.expires) {
    if (!isDate(cookie.expires) || !Number.isFinite(cookie.expires.valueOf())) throw new TypeError(`option expires is invalid: ${cookie.expires}`);
    str += "; Expires=" + cookie.expires.toUTCString();
  }
  if (cookie.httpOnly) str += "; HttpOnly";
  if (cookie.secure) str += "; Secure";
  if (cookie.partitioned) str += "; Partitioned";
  if (cookie.priority) switch (typeof cookie.priority === "string" ? cookie.priority.toLowerCase() : void 0) {
    case "low":
      str += "; Priority=Low";
      break;
    case "medium":
      str += "; Priority=Medium";
      break;
    case "high":
      str += "; Priority=High";
      break;
    default:
      throw new TypeError(`option priority is invalid: ${cookie.priority}`);
  }
  if (cookie.sameSite) switch (typeof cookie.sameSite === "string" ? cookie.sameSite.toLowerCase() : cookie.sameSite) {
    case true:
    case "strict":
      str += "; SameSite=Strict";
      break;
    case "lax":
      str += "; SameSite=Lax";
      break;
    case "none":
      str += "; SameSite=None";
      break;
    default:
      throw new TypeError(`option sameSite is invalid: ${cookie.sameSite}`);
  }
  return str;
}
function isDate(val) {
  return __toString.call(val) === "[object Date]";
}
const maxAgeRegExp = /^-?\d+$/;
const _nullProto = /* @__PURE__ */ Object.getPrototypeOf({});
function parseSetCookie(str, options) {
  const len = str.length;
  let _endIdx = len;
  let eqIdx = -1;
  for (let i = 0; i < len; i++) {
    const c2 = str.charCodeAt(i);
    if (c2 === 59) {
      _endIdx = i;
      break;
    }
    if (c2 === 61 && eqIdx === -1) eqIdx = i;
  }
  if (eqIdx >= _endIdx) eqIdx = -1;
  const name = eqIdx === -1 ? "" : _trim(str, 0, eqIdx);
  if (name && name in _nullProto) return void 0;
  let value = eqIdx === -1 ? _trim(str, 0, _endIdx) : _trim(str, eqIdx + 1, _endIdx);
  if (!name && !value) return void 0;
  if (name.length + value.length > 4096) return void 0;
  value = _decode(value, options?.decode);
  const setCookie2 = {
    name,
    value
  };
  let index = _endIdx + 1;
  while (index < len) {
    let endIdx = len;
    let attrEqIdx = -1;
    for (let i = index; i < len; i++) {
      const c2 = str.charCodeAt(i);
      if (c2 === 59) {
        endIdx = i;
        break;
      }
      if (c2 === 61 && attrEqIdx === -1) attrEqIdx = i;
    }
    if (attrEqIdx >= endIdx) attrEqIdx = -1;
    const attr = attrEqIdx === -1 ? _trim(str, index, endIdx) : _trim(str, index, attrEqIdx);
    const val = attrEqIdx === -1 ? void 0 : _trim(str, attrEqIdx + 1, endIdx);
    if (val === void 0 || val.length <= 1024) switch (attr.toLowerCase()) {
      case "httponly":
        setCookie2.httpOnly = true;
        break;
      case "secure":
        setCookie2.secure = true;
        break;
      case "partitioned":
        setCookie2.partitioned = true;
        break;
      case "domain":
        if (val) setCookie2.domain = (val.charCodeAt(0) === 46 ? val.slice(1) : val).toLowerCase();
        break;
      case "path":
        setCookie2.path = val;
        break;
      case "max-age":
        if (val && maxAgeRegExp.test(val)) setCookie2.maxAge = Math.min(Number(val), COOKIE_MAX_AGE_LIMIT);
        break;
      case "expires": {
        if (!val) break;
        const date = new Date(val);
        if (Number.isFinite(date.valueOf())) {
          const maxDate = new Date(Date.now() + COOKIE_MAX_AGE_LIMIT * 1e3);
          setCookie2.expires = date > maxDate ? maxDate : date;
        }
        break;
      }
      case "priority": {
        if (!val) break;
        const priority = val.toLowerCase();
        if (priority === "low" || priority === "medium" || priority === "high") setCookie2.priority = priority;
        break;
      }
      case "samesite": {
        if (!val) break;
        const sameSite = val.toLowerCase();
        if (sameSite === "lax" || sameSite === "strict" || sameSite === "none") setCookie2.sameSite = sameSite;
        else setCookie2.sameSite = "lax";
        break;
      }
      default: {
        const attrLower = attr.toLowerCase();
        if (attrLower && !(attrLower in _nullProto)) setCookie2[attrLower] = val;
      }
    }
    index = endIdx + 1;
  }
  return setCookie2;
}
function _trim(str, start, end) {
  if (start === end) return "";
  let s = start;
  let e = end;
  while (s < e && (str.charCodeAt(s) === 32 || str.charCodeAt(s) === 9)) s++;
  while (e > s && (str.charCodeAt(e - 1) === 32 || str.charCodeAt(e - 1) === 9)) e--;
  return str.slice(s, e);
}
function _decode(value, decode2) {
  if (!value.includes("%")) return value;
  try {
    return (decode2 || decodeURIComponent)(value);
  } catch {
    return value;
  }
}
const CHUNKED_COOKIE = "__chunked__";
const CHUNKS_MAX_LENGTH = 4e3;
function parseCookies(event) {
  return parse(event.req.headers.get("cookie") || "");
}
function getCookie(event, name) {
  return parseCookies(event)[name];
}
function setCookie$1(event, name, value, options) {
  const newCookie = serialize({
    name,
    value,
    path: "/",
    ...options
  });
  const currentCookies = event.res.headers.getSetCookie();
  if (currentCookies.length === 0) {
    event.res.headers.set("set-cookie", newCookie);
    return;
  }
  const newCookieKey = _getDistinctCookieKey(name, options || {});
  event.res.headers.delete("set-cookie");
  for (const cookie of currentCookies) {
    const parsed = parseSetCookie(cookie);
    if (!parsed) continue;
    if (_getDistinctCookieKey(cookie.split("=")?.[0], parsed) === newCookieKey) continue;
    event.res.headers.append("set-cookie", cookie);
  }
  event.res.headers.append("set-cookie", newCookie);
}
function deleteCookie(event, name, serializeOptions) {
  setCookie$1(event, name, "", {
    ...serializeOptions,
    maxAge: 0
  });
}
function getChunkedCookie(event, name) {
  const mainCookie = getCookie(event, name);
  if (!mainCookie || !mainCookie.startsWith(CHUNKED_COOKIE)) return mainCookie;
  const chunksCount = getChunkedCookieCount(mainCookie);
  if (chunksCount === 0) return;
  const chunks = [];
  for (let i = 1; i <= chunksCount; i++) {
    const chunk = getCookie(event, chunkCookieName(name, i));
    if (!chunk) return;
    chunks.push(chunk);
  }
  return chunks.join("");
}
function setChunkedCookie(event, name, value, options) {
  const chunkMaxLength = options?.chunkMaxLength || CHUNKS_MAX_LENGTH;
  const chunkCount = Math.ceil(value.length / chunkMaxLength);
  const previousCookie = getCookie(event, name);
  if (previousCookie?.startsWith(CHUNKED_COOKIE)) {
    const previousChunkCount = getChunkedCookieCount(previousCookie);
    if (previousChunkCount > chunkCount) for (let i = chunkCount; i <= previousChunkCount; i++) deleteCookie(event, chunkCookieName(name, i), options);
  }
  if (chunkCount <= 1) {
    setCookie$1(event, name, value, options);
    return;
  }
  setCookie$1(event, name, `${CHUNKED_COOKIE}${chunkCount}`, options);
  for (let i = 1; i <= chunkCount; i++) {
    const start = (i - 1) * chunkMaxLength;
    const end = start + chunkMaxLength;
    const chunkValue = value.slice(start, end);
    setCookie$1(event, chunkCookieName(name, i), chunkValue, options);
  }
}
function deleteChunkedCookie(event, name, serializeOptions) {
  const mainCookie = getCookie(event, name);
  deleteCookie(event, name, serializeOptions);
  const chunksCount = getChunkedCookieCount(mainCookie);
  if (chunksCount >= 0) for (let i = 0; i < chunksCount; i++) deleteCookie(event, chunkCookieName(name, i + 1), serializeOptions);
}
function _getDistinctCookieKey(name, options) {
  return [
    name,
    options.domain || "",
    options.path || "/"
  ].join(";");
}
const MAX_CHUNKED_COOKIE_COUNT = 100;
function getChunkedCookieCount(cookie) {
  if (!cookie?.startsWith(CHUNKED_COOKIE)) return NaN;
  const count = Number.parseInt(cookie.slice(11));
  if (Number.isNaN(count) || count < 0 || count > MAX_CHUNKED_COOKIE_COUNT) return NaN;
  return count;
}
function chunkCookieName(name, chunkNumber) {
  return `${name}.${chunkNumber}`;
}
const defaults = /* @__PURE__ */ Object.freeze({
  ttl: 0,
  timestampSkewSec: 60,
  localtimeOffsetMsec: 0,
  encryption: /* @__PURE__ */ Object.freeze({
    saltBits: 256,
    algorithm: "aes-256-cbc",
    iterations: 1,
    minPasswordlength: 32
  }),
  integrity: /* @__PURE__ */ Object.freeze({
    saltBits: 256,
    algorithm: "sha256",
    iterations: 1,
    minPasswordlength: 32
  })
});
const algorithms = /* @__PURE__ */ Object.freeze({
  "aes-128-ctr": /* @__PURE__ */ Object.freeze({
    keyBits: 128,
    ivBits: 128,
    name: "AES-CTR"
  }),
  "aes-256-cbc": /* @__PURE__ */ Object.freeze({
    keyBits: 256,
    ivBits: 128,
    name: "AES-CBC"
  }),
  sha256: /* @__PURE__ */ Object.freeze({
    keyBits: 256,
    ivBits: 128,
    name: "SHA-256"
  })
});
const macPrefix = "Fe26.2";
async function seal(object, password, opts) {
  const now = Date.now() + (opts.localtimeOffsetMsec || 0);
  if (!password) throw new Error("Empty password");
  const { id = "", encryption, integrity } = normalizePassword(password);
  if (id && !/^\w+$/.test(id)) throw new Error("Invalid password id");
  const { encrypted, key } = await encrypt(encryption, opts.encryption, JSON.stringify(object));
  const encryptedB64 = base64Encode(encrypted);
  const iv = base64Encode(key.iv);
  const expiration = opts.ttl ? now + opts.ttl : "";
  const macBaseString = `${macPrefix}*${id}*${key.salt}*${iv}*${encryptedB64}*${expiration}`;
  const mac = await hmacWithPassword(integrity, opts.integrity, macBaseString);
  return `${macBaseString}*${mac.salt}*${mac.digest}`;
}
async function unseal(sealed, password, opts) {
  const now = Date.now() + (opts.localtimeOffsetMsec || 0);
  if (!password) throw new Error("Empty password");
  const parts = sealed.split("*");
  if (parts.length !== 8) throw new Error("Incorrect number of sealed components");
  const [prefix, passwordId, encryptionSalt, encryptionIv, encryptedB64, expiration, hmacSalt, hmac] = parts;
  const macBaseString = `${prefix}*${passwordId}*${encryptionSalt}*${encryptionIv}*${encryptedB64}*${expiration}`;
  if ("Fe26.2" !== prefix) throw new Error("Wrong mac prefix");
  if (expiration) {
    if (!/^\d+$/.test(expiration)) throw new Error("Invalid expiration");
    if (Number.parseInt(expiration, 10) <= now - opts.timestampSkewSec * 1e3) throw new Error("Expired seal");
  }
  let pass = "";
  const _passwordId = passwordId || "default";
  if (typeof password === "string" || password instanceof Uint8Array) pass = password;
  else if (_passwordId in password) pass = password[_passwordId];
  else throw new Error(`Cannot find password: ${_passwordId}`);
  pass = normalizePassword(pass);
  if (!fixedTimeComparison((await hmacWithPassword(pass.integrity, {
    ...opts.integrity,
    salt: hmacSalt
  }, macBaseString)).digest, hmac)) throw new Error("Bad hmac value");
  const encrypted = base64Decode(encryptedB64);
  const decryptOptions = {
    ...opts.encryption,
    salt: encryptionSalt,
    iv: base64Decode(encryptionIv)
  };
  const decrypted = await decrypt(pass.encryption, decryptOptions, encrypted);
  return decrypted ? JSON.parse(decrypted) : null;
}
async function hmacWithPassword(password, options, data) {
  const key = await generateKey(password, {
    ...options,
    hmac: true
  });
  const textBuffer = textEncoder$1.encode(data);
  const signed = await crypto.subtle.sign({ name: "HMAC" }, key.key, textBuffer);
  return {
    digest: base64Encode(new Uint8Array(signed)),
    salt: key.salt
  };
}
async function generateKey(password, options) {
  if (!password?.length) throw new Error("Empty password");
  if (options == null || typeof options !== "object") throw new Error("Bad options");
  if (!(options.algorithm in algorithms)) throw new Error(`Unknown algorithm: ${options.algorithm}`);
  const algorithm = algorithms[options.algorithm];
  let resultKey;
  let resultSalt;
  let resultIV;
  const hmac = options.hmac ?? false;
  const id = hmac ? {
    name: "HMAC",
    hash: algorithm.name
  } : { name: algorithm.name };
  const usage = hmac ? ["sign", "verify"] : ["encrypt", "decrypt"];
  if (typeof password === "string") {
    if (password.length < options.minPasswordlength) throw new Error(`Password string too short (min ${options.minPasswordlength} characters required)`);
    let { salt = "" } = options;
    if (!salt) {
      const { saltBits = 0 } = options;
      if (!saltBits) throw new Error("Missing salt and saltBits options");
      const randomSalt = randomBits(saltBits);
      salt = [...new Uint8Array(randomSalt)].map((x3) => x3.toString(16).padStart(2, "0")).join("");
    }
    const derivedKey = await pbkdf2(password, salt, options.iterations, algorithm.keyBits / 8, "SHA-1");
    resultKey = await crypto.subtle.importKey("raw", derivedKey, id, false, usage);
    resultSalt = salt;
  } else {
    if (password.length < algorithm.keyBits / 8) throw new Error("Key buffer (password) too small");
    resultKey = await crypto.subtle.importKey("raw", password, id, false, usage);
    resultSalt = "";
  }
  if (options.iv) resultIV = options.iv;
  else if ("ivBits" in algorithm) resultIV = randomBits(algorithm.ivBits);
  else throw new Error("Missing IV");
  return {
    key: resultKey,
    salt: resultSalt,
    iv: resultIV
  };
}
async function pbkdf2(password, salt, iterations, keyLength, hash) {
  const passwordBuffer = textEncoder$1.encode(password);
  const importedKey = await crypto.subtle.importKey("raw", passwordBuffer, { name: "PBKDF2" }, false, ["deriveBits"]);
  const params = {
    name: "PBKDF2",
    hash,
    salt: textEncoder$1.encode(salt),
    iterations
  };
  return await crypto.subtle.deriveBits(params, importedKey, keyLength * 8);
}
async function encrypt(password, options, data) {
  const key = await generateKey(password, options);
  const encrypted = await crypto.subtle.encrypt(...getEncryptParams(options.algorithm, key, data));
  return {
    encrypted: new Uint8Array(encrypted),
    key
  };
}
async function decrypt(password, options, data) {
  const key = await generateKey(password, options);
  const decrypted = await crypto.subtle.decrypt(...getEncryptParams(options.algorithm, key, data));
  return textDecoder.decode(decrypted);
}
function getEncryptParams(algorithm, key, data) {
  return [
    algorithm === "aes-128-ctr" ? {
      name: "AES-CTR",
      counter: key.iv,
      length: 128
    } : {
      name: "AES-CBC",
      iv: key.iv
    },
    key.key,
    typeof data === "string" ? textEncoder$1.encode(data) : data
  ];
}
function fixedTimeComparison(a, b2) {
  let mismatch = a.length === b2.length ? 0 : 1;
  if (mismatch) b2 = a;
  for (let i = 0; i < a.length; i += 1) mismatch |= a.charCodeAt(i) ^ b2.charCodeAt(i);
  return mismatch === 0;
}
function normalizePassword(password) {
  if (typeof password === "string" || password instanceof Uint8Array) return {
    encryption: password,
    integrity: password
  };
  if ("secret" in password) return {
    id: password.id,
    encryption: password.secret,
    integrity: password.secret
  };
  return {
    id: password.id,
    encryption: password.encryption,
    integrity: password.integrity
  };
}
function randomBits(bits) {
  if (bits < 1) throw new Error("Invalid random bits count");
  return randomBytes(Math.ceil(bits / 8));
}
function randomBytes(size) {
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);
  return bytes;
}
const kGetSession = /* @__PURE__ */ Symbol.for("h3.internal.session.promise");
const DEFAULT_SESSION_COOKIE = {
  path: "/",
  secure: true,
  httpOnly: true
};
async function useSession$1(event, config) {
  const sessionName = config.name || "h3";
  await getSession(event, config);
  const sessionManager = {
    get id() {
      return getEventContext(event)?.sessions?.[sessionName]?.id;
    },
    get data() {
      return getEventContext(event).sessions?.[sessionName]?.data || {};
    },
    update: async (update) => {
      await updateSession(event, config, update);
      return sessionManager;
    },
    clear: () => {
      clearSession(event, config);
      return Promise.resolve(sessionManager);
    }
  };
  return sessionManager;
}
async function getSession(event, config) {
  const sessionName = config.name || "h3";
  const context = getEventContext(event);
  if (!context.sessions) context.sessions = new NullProtoObj();
  const existingSession = context.sessions[sessionName];
  if (existingSession) return existingSession[kGetSession] || existingSession;
  const session = {
    id: "",
    createdAt: 0,
    data: new NullProtoObj()
  };
  context.sessions[sessionName] = session;
  let sealedSession;
  if (config.sessionHeader !== false) {
    const headerName = typeof config.sessionHeader === "string" ? config.sessionHeader.toLowerCase() : `x-${sessionName.toLowerCase()}-session`;
    const headerValue = event.req.headers.get(headerName);
    if (typeof headerValue === "string") sealedSession = headerValue;
  }
  if (!sealedSession) sealedSession = getChunkedCookie(event, sessionName);
  if (sealedSession) {
    const promise = unsealSession(event, config, sealedSession).catch(() => {
    }).then((unsealed) => {
      Object.assign(session, unsealed);
      delete context.sessions[sessionName][kGetSession];
      return session;
    });
    context.sessions[sessionName][kGetSession] = promise;
    await promise;
  }
  if (!session.id) {
    session.id = config.generateId?.() ?? (config.crypto || crypto).randomUUID();
    session.createdAt = Date.now();
    await updateSession(event, config);
  }
  return session;
}
async function updateSession(event, config, update) {
  const sessionName = config.name || "h3";
  const session = getEventContext(event).sessions?.[sessionName] || await getSession(event, config);
  if (typeof update === "function") update = update(session.data);
  if (update) Object.assign(session.data, update);
  if (config.cookie !== false && event.res) setChunkedCookie(event, sessionName, await sealSession(event, config), {
    ...DEFAULT_SESSION_COOKIE,
    expires: config.maxAge ? new Date(session.createdAt + config.maxAge * 1e3) : void 0,
    ...config.cookie
  });
  return session;
}
async function sealSession(event, config) {
  const sessionName = config.name || "h3";
  return await seal(getEventContext(event).sessions?.[sessionName] || await getSession(event, config), config.password, {
    ...defaults,
    ttl: config.maxAge ? config.maxAge * 1e3 : 0,
    ...config.seal
  });
}
async function unsealSession(_event, config, sealed) {
  const unsealed = await unseal(sealed, config.password, {
    ...defaults,
    ttl: config.maxAge ? config.maxAge * 1e3 : 0,
    ...config.seal
  });
  if (config.maxAge) {
    if (Date.now() - (unsealed.createdAt || Number.NEGATIVE_INFINITY) > config.maxAge * 1e3) throw new Error("Session expired!");
  }
  return unsealed;
}
function clearSession(event, config) {
  const context = getEventContext(event);
  const sessionName = config.name || "h3";
  if (context.sessions?.[sessionName]) delete context.sessions[sessionName];
  if (event.res && config.cookie !== false) deleteChunkedCookie(event, sessionName, {
    ...DEFAULT_SESSION_COOKIE,
    ...config.cookie
  });
  return Promise.resolve();
}
var GLOBAL_EVENT_STORAGE_KEY = /* @__PURE__ */ Symbol.for("tanstack-start:event-storage");
var globalObj$1 = globalThis;
if (!globalObj$1[GLOBAL_EVENT_STORAGE_KEY]) globalObj$1[GLOBAL_EVENT_STORAGE_KEY] = new AsyncLocalStorage();
var eventStorage = globalObj$1[GLOBAL_EVENT_STORAGE_KEY];
function isPromiseLike(value) {
  return typeof value.then === "function";
}
function getSetCookieValues(headers) {
  const headersWithSetCookie = headers;
  if (typeof headersWithSetCookie.getSetCookie === "function") return headersWithSetCookie.getSetCookie();
  const value = headers.get("set-cookie");
  return value ? [value] : [];
}
function mergeEventResponseHeaders(response, event) {
  if (response.ok) return;
  const eventSetCookies = getSetCookieValues(event.res.headers);
  if (eventSetCookies.length === 0) return;
  const responseSetCookies = getSetCookieValues(response.headers);
  response.headers.delete("set-cookie");
  for (const cookie of responseSetCookies) response.headers.append("set-cookie", cookie);
  for (const cookie of eventSetCookies) response.headers.append("set-cookie", cookie);
}
function attachResponseHeaders(value, event) {
  if (isPromiseLike(value)) return value.then((resolved) => {
    if (resolved instanceof Response) mergeEventResponseHeaders(resolved, event);
    return resolved;
  });
  if (value instanceof Response) mergeEventResponseHeaders(value, event);
  return value;
}
function requestHandler(handler) {
  return (request, requestOpts) => {
    let h3Event;
    try {
      h3Event = new H3Event(request);
    } catch (error) {
      if (error instanceof URIError) return new Response(null, {
        status: 400,
        statusText: "Bad Request"
      });
      throw error;
    }
    return toResponse(attachResponseHeaders(eventStorage.run({ h3Event }, () => handler(request, requestOpts)), h3Event), h3Event);
  };
}
function getH3Event() {
  const event = eventStorage.getStore();
  if (!event) throw new Error(`No StartEvent found in AsyncLocalStorage. Make sure you are using the function within the server runtime.`);
  return event.h3Event;
}
function getRequest() {
  return getH3Event().req;
}
function setCookie(name, value, options) {
  setCookie$1(getH3Event(), name, value, options);
}
function getDefaultSessionConfig(config) {
  return {
    name: "start",
    ...config
  };
}
function useSession(config) {
  return useSession$1(getH3Event(), getDefaultSessionConfig(config));
}
function getResponse() {
  return getH3Event().res;
}
var HEADERS = { TSS_SHELL: "X-TSS_SHELL" };
async function getStartManifest(matchedRoutes) {
  const { tsrStartManifest } = await import("./assets/_tanstack-start-manifest_v-BCWqTQoD.js");
  const startManifest = tsrStartManifest();
  let routes = startManifest.routes;
  routes[rootRouteId];
  const manifestRoutes = {};
  for (const k2 in routes) {
    const v2 = routes[k2];
    const result = {};
    if (v2.preloads && v2.preloads.length > 0) result.preloads = v2.preloads;
    if (v2.scripts && v2.scripts.length > 0) result.scripts = v2.scripts;
    if (v2.css?.length) result.css = v2.css;
    if (result.preloads || result.scripts || result.css) manifestRoutes[k2] = result;
  }
  return {
    ...startManifest.scriptFormat ? { scriptFormat: startManifest.scriptFormat } : {},
    ...startManifest.inlineCss ? { inlineCss: startManifest.inlineCss } : {},
    routes: manifestRoutes
  };
}
const manifest = {
  "00366bec50a64b6bd141516f681a2436de0d2a2120a775d12e3d98ca20eac340": {
    functionName: "deleteWebhookFn_createServerFn_handler",
    importer: () => import("./assets/settings-CSYsml77.js")
  },
  "00f474f606094326aac4853c55df25d8ac5a87795e7d4c1cf0744ba261b351f7": {
    functionName: "settingsIndexLoader_createServerFn_handler",
    importer: () => import("./assets/index-BkG5cFoY.js")
  },
  "027d0eec9ec7e47d62a3e8563fbaf8fd1dc56f10861ce1dd62ef047c7a0f7068": {
    functionName: "updateScreeningProvidersFn_createServerFn_handler",
    importer: () => import("./assets/settings-CSYsml77.js")
  },
  "037a9791565e873681cbb99b49b11c7d5c5e8e55f9c0bb1949a848090228caed": {
    functionName: "getDecisionOutcomesPerDayFn_createServerFn_handler",
    importer: () => import("./assets/analytics-CmNOkTDB.js")
  },
  "0515540a9075d9867aa221b0ea91f83ba7c6617449361ef13176b8b3939332a1": {
    functionName: "getListConfigFn_createServerFn_handler",
    importer: () => import("./assets/screenings-Bf2ZXJnb.js")
  },
  "05bb58e2b97b1cc2316fd5a122fc1baf8ed2ef60d1a52ae56a4f4402675f5a55": {
    functionName: "analyticsLoader_createServerFn_handler",
    importer: () => import("./assets/_scenarioId-2ajvghdJ.js")
  },
  "0609578262a15348986f5154cf9f83165e3b77426ebd476d8dbb607ad42ca5d5": {
    functionName: "getIterationRulesFn_createServerFn_handler",
    importer: () => import("./assets/scenarios-Cg3pzbM2.js")
  },
  "07f381cd947e2ce40d42defed41552acd2e4dc177cdb37795e212a29db386ba7": {
    functionName: "unarchiveScenarioFn_createServerFn_handler",
    importer: () => import("./assets/scenarios-Cg3pzbM2.js")
  },
  "08bc5d654d0807bad820723ab83cf6e710498caf8f694cb2f435d2611d4b69c9": {
    functionName: "listRulesetsFn_createServerFn_handler",
    importer: () => import("./assets/scoring-Dne_8qRx.js")
  },
  "0a8c31d1802e9960ac7cdbf4d3d0ce53fa03d7dd9066ca3efc7884c9c0ad9a4c": {
    functionName: "addListValueFn_createServerFn_handler",
    importer: () => import("./assets/lists-C0BQcZhN.js")
  },
  "0acb523b5f97ff683b231261a0120f2ad490d294ede3b29b519c3173ddc98731": {
    functionName: "scenariosLoader_createServerFn_handler",
    importer: () => import("./assets/index-HiPKXSOJ.js")
  },
  "0c899cff78c3e6695fdb4d23a45413751555d22e51100f0f136c217b2420654f": {
    functionName: "prepareScoringRulesetFn_createServerFn_handler",
    importer: () => import("./assets/scoring-Dne_8qRx.js")
  },
  "0d92ca36925f6c91df4f2d997376bca39f97a888df1a52aa719837221dfd77f4": {
    functionName: "getScreeningAiSuggestionsFn_createServerFn_handler",
    importer: () => import("./assets/screenings-Bf2ZXJnb.js")
  },
  "0e2334bbb8b7b4da8996b3da2eeccc089d1a6bc709d1825f329d799946a18335": {
    functionName: "enrichKycFn_createServerFn_handler",
    importer: () => import("./assets/cases-KrsxdIwI.js")
  },
  "0e375d3bb3847f92ec1d82fa9791a13d9afc0aafdf4095f73e9c449e03486792": {
    functionName: "dataLayoutLoader_createServerFn_handler",
    importer: () => import("./assets/data-DAUkuk70.js")
  },
  "0ece79298e72626dc7e25ecf49807a1d1b4bb51c0bdf73bd5232c1f157865de7": {
    functionName: "deleteListValueFn_createServerFn_handler",
    importer: () => import("./assets/lists-C0BQcZhN.js")
  },
  "11e598f40e3c339bd47fba6cf665d373350c37e3b13fa68de8ff98eba6c21d45": {
    functionName: "createCaseFn_createServerFn_handler",
    importer: () => import("./assets/cases-KrsxdIwI.js")
  },
  "1305a5ca68c1d5462d13d2186923325ca462bc612b1e00a809396a84c95c4792": {
    functionName: "updateTagFn_createServerFn_handler",
    importer: () => import("./assets/settings-CSYsml77.js")
  },
  "14e7d5aa898d82c7977f719e8dd399a2a401db0c7f57634d9f4772dbc350ab28": {
    functionName: "beforeLoadFn_createServerFn_handler",
    importer: () => import("./assets/_detail-oF5pJ2Md.js")
  },
  "1505871dc4e9095cf40f4174cb7188a3852778502c1123ef512a33e2360965cc": {
    functionName: "getAuditEventsFn_createServerFn_handler",
    importer: () => import("./assets/settings-CSYsml77.js")
  },
  "15091ae1ff83a56dbe3c9e2f02f6284aa0e95fb9f939e3a6a080396c6d923a78": {
    functionName: "editSemanticTableFn_createServerFn_handler",
    importer: () => import("./assets/data-Dzra87dl.js")
  },
  "1512977eb13f2e4b814a9d34bba714914509115fec399ac6cc34510c92286ab4": {
    functionName: "editAssigneeFn_createServerFn_handler",
    importer: () => import("./assets/cases-KrsxdIwI.js")
  },
  "1656d7f8c414c8212f0b15864ec148e50c260e727b88b57405ec2a5cd4948c8f": {
    functionName: "dismissContinuousScreeningFn_createServerFn_handler",
    importer: () => import("./assets/continuous-screening-BM9iKNo4.js")
  },
  "17ca890b622271b903097bbbed576a63389f3e45f0e5e1b1486d9f95d5f111f1": {
    functionName: "casesIndexLoader_createServerFn_handler",
    importer: () => import("./assets/index-69i1Z0On.js")
  },
  "17fe49fd9649a743daee9b2db7caa3d15a925dc14b9480bad78ab09d42f3167f": {
    functionName: "inboxesLoader_createServerFn_handler",
    importer: () => import("./assets/index-CdYf6JuR.js")
  },
  "18da7f26386e7ebb5a2edc840704787f306fb5982648e912fd5a034dc3e9f640": {
    functionName: "scoringRulesetLoader_createServerFn_handler",
    importer: () => import("./assets/_recordType._version-DA70SKlb.js")
  },
  "190e537a41b695e9074030a843c24f85222ff378bd328c6084ee189e8cf0869f": {
    functionName: "decisionLoader_createServerFn_handler",
    importer: () => import("./assets/_decisionId-BOnOFzW6.js")
  },
  "1a51b59e8f2284e84626a4f476423108c7369e3787808728279571cd10aad5b8": {
    functionName: "createWebhookFn_createServerFn_handler",
    importer: () => import("./assets/settings-CSYsml77.js")
  },
  "1a7b160b47d11879791526a71a49fce3e62a6ae808d0b9ac803e7bcd5fd335b6": {
    functionName: "updateScoringRulesetFn_createServerFn_handler",
    importer: () => import("./assets/scoring-Dne_8qRx.js")
  },
  "1cf2c2799fcef435af387b7771083e3938a3308e27b59e7b8d3d6ade3c637393": {
    functionName: "getCaseStatusByInboxFn_createServerFn_handler",
    importer: () => import("./assets/analytics-CmNOkTDB.js")
  },
  "1d24681fb4d9e54ee3acace0e37203e5829742ae19c4e9685f9dbc807c49ceff": {
    functionName: "catchAllLoader_createServerFn_handler",
    importer: () => import("./assets/_-CMZDtKte.js")
  },
  "1dcbe38ba17cbdc652d07f24bfdf63d4316f44cbee9115075ce645fae47afba7": {
    functionName: "updateExportedFieldFn_createServerFn_handler",
    importer: () => import("./assets/settings-CSYsml77.js")
  },
  "1dda07efb7eddbc1a3c062ed5bae0127a4b92d7ed30c6c541cf160b40c6cd9ce": {
    functionName: "analyticsIndexLoader_createServerFn_handler",
    importer: () => import("./assets/index-DBHdD3vb.js")
  },
  "1e9b661682fb912830b1f3efeaf46a1f996053f19f1f6f1a33dbd3a86b87f594": {
    functionName: "snoozeCaseFn_createServerFn_handler",
    importer: () => import("./assets/cases-KrsxdIwI.js")
  },
  "1efcd86b2bc7895d3981a5ebe0f645d5664ddd40ee87753a56ad300d6f336347": {
    functionName: "getObjectDetailsFn_createServerFn_handler",
    importer: () => import("./assets/data-Dzra87dl.js")
  },
  "1f1e07f6140177e3b7e1ee29119c29aa561583b5f4d305e63b5293ce6fba7c16": {
    functionName: "deleteAnnotationFn_createServerFn_handler",
    importer: () => import("./assets/data-Dzra87dl.js")
  },
  "1f732cf3a73e1a42731c4409721b5978c2deb610e7593242c697a8b12223b92b": {
    functionName: "testRunsLoader_createServerFn_handler",
    importer: () => import("./assets/index-3aYGqHJB.js")
  },
  "20e27ce745bfa21d99c5049a732de6c906a0875b8c80d67d3c2cf4e7ba6179e2": {
    functionName: "settingsLoader_createServerFn_handler",
    importer: () => import("./assets/settings-BbUcPJCv.js")
  },
  "2227302e87f743feb0e67e5f03797a3ffb72d6c61a523caf5738aba781254d06": {
    functionName: "openCaseFn_createServerFn_handler",
    importer: () => import("./assets/cases-KrsxdIwI.js")
  },
  "2275538994b192abc19ce1c514973b6b313fe7aae4da2322f304af4da7b1dbc0": {
    functionName: "editSuspicionFn_createServerFn_handler",
    importer: () => import("./assets/cases-KrsxdIwI.js")
  },
  "23078da067c0d054992a8f46ecb488d22fb36590eb3f3abe2bbb0f4b4b45f03b": {
    functionName: "signInFn_createServerFn_handler",
    importer: () => import("./assets/auth-B8LkeYzJ.js")
  },
  "239a100220ce69d029bfe6f709875485a9e1b81190f19996eca1e633a825bc01": {
    functionName: "updateInboxEscalationFn_createServerFn_handler",
    importer: () => import("./assets/cases-KrsxdIwI.js")
  },
  "2434b75a233407e6a0f02cb1d65aff801cf21dbf917ed2a61d873f754edc5c16": {
    functionName: "getRootLoaderDataFn_createServerFn_handler",
    importer: () => import("./assets/root-Ddvh_hf1.js")
  },
  "279107d104c29acf6321d72842c8ad8c82e53323706e5d0765563e0f15514bf7": {
    functionName: "uploadListDataFileFn_createServerFn_handler",
    importer: () => import("./assets/lists-C0BQcZhN.js")
  },
  "282f535518ae8a27880adef26c748090828e7284eabdc7e963339dd9a086f594": {
    functionName: "getRulesByPivotFn_createServerFn_handler",
    importer: () => import("./assets/cases-KrsxdIwI.js")
  },
  "2ae2f8aa739bc87b26179633dd7ab394f8ba7bc4489dbfa180c1f1922def10cd": {
    functionName: "createNavigationOptionFn_createServerFn_handler",
    importer: () => import("./assets/data-Dzra87dl.js")
  },
  "2b60cc427309ff778745eae07f27a802b823a9d85363fb673284fb34178e1eec": {
    functionName: "deleteListFn_createServerFn_handler",
    importer: () => import("./assets/lists-C0BQcZhN.js")
  },
  "2d2244244a5c168d712065e928972a8ce0e9d423fb5e81e7fd9a076255d70447": {
    functionName: "screeningSearchLayoutLoader_createServerFn_handler",
    importer: () => import("./assets/screening-search-CPjOxz9E.js")
  },
  "2d7100b40687945ab2456f35825bd6c33aaf217a51654dc55ee46af8bd1d928b": {
    functionName: "archiveScenarioFn_createServerFn_handler",
    importer: () => import("./assets/scenarios-Cg3pzbM2.js")
  },
  "2d8e3f709e51112f7756b3d1ab577bb35b7e3324c07eaf86864aa59ebbfebfeb": {
    functionName: "saveTriggerFn_createServerFn_handler",
    importer: () => import("./assets/scenarios-Cg3pzbM2.js")
  },
  "2e2c44dea917bd6673dd566a86500b4714ee81ec707b56dd2a1e439ef390befb": {
    functionName: "getAnnotationsFn_createServerFn_handler",
    importer: () => import("./assets/data-Dzra87dl.js")
  },
  "2ef10e921f72f4e8e31b7e4b2ec61553aa85ceb906bfa1c87c2e3d46dacf4a1f": {
    functionName: "prepareIterationFn_createServerFn_handler",
    importer: () => import("./assets/scenarios-Cg3pzbM2.js")
  },
  "318de7514267a3ed50ed84a75ae117487815eee16ca25aa6098d21129a219ebe": {
    functionName: "getClientDetailFn_createServerFn_handler",
    importer: () => import("./assets/index-Eb_T0HEt.js")
  },
  "339ed5e5c8cda03774b6192da2290ac8d1bea31a91b9728c4194875f31477c01": {
    functionName: "getScoreDistributionFn_createServerFn_handler",
    importer: () => import("./assets/scoring-Dne_8qRx.js")
  },
  "3409b04d1702a2d8544171e712f454ccb429ad4e30ec126fa85586fb5307674a": {
    functionName: "listArchetypesFn_createServerFn_handler",
    importer: () => import("./assets/data-Dzra87dl.js")
  },
  "35a259fecdcb9b6f37e5d9af14cde2d19eb31c44df12758aaa353d284a9d912b": {
    functionName: "signInLoader_createServerFn_handler",
    importer: () => import("./assets/sign-in--MAlqgCk.js")
  },
  "35ab51f7cbac3061cb7d3973f74ba220112989bf839f06f7ada19addb0361183": {
    functionName: "casesAnalyticsLoader_createServerFn_handler",
    importer: () => import("./assets/analytics-EDKTyWMx.js")
  },
  "35b91dd8aa3e517665c46541765abb8b29e3966a38ce7df8784c8847df4244f1": {
    functionName: "createConfigurationLoader_createServerFn_handler",
    importer: () => import("./assets/index-CaGJOQbd.js")
  },
  "366c9a4bfa6aa53b26e2907117b15ec8d4902ce64e2d612d436164f785e5bcc1": {
    functionName: "deleteInboxUserFn_createServerFn_handler",
    importer: () => import("./assets/settings-CSYsml77.js")
  },
  "3849fdd912adea42e0d27ed6c9cd470a212755e0d106e0e3bab820181742368f": {
    functionName: "renameWorkflowRuleFn_createServerFn_handler",
    importer: () => import("./assets/workflows-CFb2BeS_.js")
  },
  "38de87303a1eb1d76f20d407eabc0ac91aa62149465ebd28fd79ef32c79dd75f": {
    functionName: "updateInboxFn_createServerFn_handler",
    importer: () => import("./assets/settings-CSYsml77.js")
  },
  "390480427159ce14e4675efd04896a7ca68c435f7c2dcb40fb7d839403ae4157": {
    functionName: "casesInboxesLoader_createServerFn_handler",
    importer: () => import("./assets/inboxes._inboxId-XTov8iZb.js")
  },
  "3a651c5d7543d6a0711d8deb740e72de4c2f5a2f33409e8a72e8e4da000dad69": {
    functionName: "getDecisionFn_createServerFn_handler",
    importer: () => import("./assets/decisions-cyEoHNYS.js")
  },
  "3b062b345e1921e242ba2936359a49fe8a6f626cae2d091ac7192ce79e433da2": {
    functionName: "deleteUserFn_createServerFn_handler",
    importer: () => import("./assets/settings-CSYsml77.js")
  },
  "3b96000682e0b8b7a52a852b0752ff57a7956f274a561ca3c1cc9ac7a2b0fd9d": {
    functionName: "activityFollowUpLoader_createServerFn_handler",
    importer: () => import("./assets/audit-logs-Clbrikbr.js")
  },
  "3c7b9ca97df43ba2c4ebde6883b549e1ae7f45aa8843c816b74de7a5fddb4126": {
    functionName: "deleteScreeningRuleFn_createServerFn_handler",
    importer: () => import("./assets/scenarios-Cg3pzbM2.js")
  },
  "3cdce8234c75f1241e5f5a9a3bc4efa972d6329e9c37991994653b6488e308e7": {
    functionName: "getPublicationPreparationStatusFn_createServerFn_handler",
    importer: () => import("./assets/scenarios-Cg3pzbM2.js")
  },
  "3e3dd68bddc4fccfe463f50bf405f3ecaaa57570ec973292136a0b24e4393746": {
    functionName: "testRunLoader_createServerFn_handler",
    importer: () => import("./assets/index-CdjZY5k2.js")
  },
  "3f2cb24c490c45ed6617d17f08300a01526cd34abac3428fd6d0e6dd1ff2da74": {
    functionName: "reviewScreeningMatchFn_createServerFn_handler",
    importer: () => import("./assets/cases-KrsxdIwI.js")
  },
  "3face8d1e66d149b4aab1655e42cd59c7efb3b66972849e778b5022a4a3f4ad7": {
    functionName: "generateAstFn_createServerFn_handler",
    importer: () => import("./assets/scenarios-Cg3pzbM2.js")
  },
  "41481bc58996e49712fcc004313b6edff90b1f458957f10bc239a3f0d968e681": {
    functionName: "setAllMatchesToNoHitFn_createServerFn_handler",
    importer: () => import("./assets/cases-KrsxdIwI.js")
  },
  "414aee403d09219bd5b92225cb0dbcd1c444939c0987b5e50579c6c7495b151e": {
    functionName: "getCaseNameFn_createServerFn_handler",
    importer: () => import("./assets/cases-KrsxdIwI.js")
  },
  "41738591d4735d5497defefaf495d3540da1be13b94167cba19e58dace773927": {
    functionName: "getCaseAnalyticsFn_createServerFn_handler",
    importer: () => import("./assets/analytics-CmNOkTDB.js")
  },
  "449b6eafbc6e1bc44a3878aa31db01de693fd82bd0e3d759dd1b60b63dc571fa": {
    functionName: "getFreeformSearchFn_createServerFn_handler",
    importer: () => import("./assets/screenings-Bf2ZXJnb.js")
  },
  "44d25eb624775f1892a7ce7644c35a875a5bdf082c0dd1fa25a0f3220f5b36ab": {
    functionName: "uploadScreeningFileFn_createServerFn_handler",
    importer: () => import("./assets/screenings-Bf2ZXJnb.js")
  },
  "45a15b57970ff33b01c0ebbd0ba0bcf29c83ea97d71194d00d80e6532ea954cc": {
    functionName: "refineScreeningFn_createServerFn_handler",
    importer: () => import("./assets/screenings-Bf2ZXJnb.js")
  },
  "45cc9be38ba9c9cbbde847284a880e1a3b298e1cb0709facd5ac322c439440dc": {
    functionName: "getHierarchyFn_createServerFn_handler",
    importer: () => import("./assets/data-Dzra87dl.js")
  },
  "460c9e6b1a545f5d9b7814f245ff9a3c002a2d23a75049c9a0b67bef1c31ede8": {
    functionName: "getCustomFiltersConfigFn_createServerFn_handler",
    importer: () => import("./assets/analytics-CmNOkTDB.js")
  },
  "49be5c9418ff167bfeb32f5f00109527dcf7263db92f78d4b7c5effa6203d294": {
    functionName: "addToCaseFn_createServerFn_handler",
    importer: () => import("./assets/cases-KrsxdIwI.js")
  },
  "4a28384f0c1ddd01ba12aeab2b2ace7744773b2f0c0f887d7cbabaa408dd4843": {
    functionName: "screeningFilesLoader_createServerFn_handler",
    importer: () => import("./assets/files-BHQKNARX.js")
  },
  "4c9de4d330ace79a796e7585a6df95ddb3068812db24b1f202bd377cf0ce6664": {
    functionName: "createScreeningRuleFn_createServerFn_handler",
    importer: () => import("./assets/scenarios-Cg3pzbM2.js")
  },
  "4cbe671987772f5e5209a26475aa49126a52dc94032d8df86778e6294fcc7c20": {
    functionName: "casesLayoutLoader_createServerFn_handler",
    importer: () => import("./assets/cases-7gOIhfzJ.js")
  },
  "4d3bc23bbc393f0c22fb74aa313ecc4d1b221eb475ca56a220fd3b416d6ad25e": {
    functionName: "logoutFn_createServerFn_handler",
    importer: () => import("./assets/auth-B8LkeYzJ.js")
  },
  "4d86840ff3e9c7863c69d2b486dfb6807b55958410e70bdf312d7b4e94cd18f0": {
    functionName: "filtersLoader_createServerFn_handler",
    importer: () => import("./assets/filters-B_UAetov.js")
  },
  "4db6bfc45b50793333de3ae326dcbab4aec61b81c44aeb67d54a0544c0d06df2": {
    functionName: "commitIterationFn_createServerFn_handler",
    importer: () => import("./assets/scenarios-Cg3pzbM2.js")
  },
  "4dbe46c3c9bd4bb15e6f4100aca8694910e330b77268624364ca39804018b673": {
    functionName: "freeformSearchFn_createServerFn_handler",
    importer: () => import("./assets/screenings-Bf2ZXJnb.js")
  },
  "4ee212221fd2c5a6804cf0cbc02015d124e15beabde51f40dfd55a284d3b7eba": {
    functionName: "usersLoader_createServerFn_handler",
    importer: () => import("./assets/users-Ct_G5oiK.js")
  },
  "4f4c03013ad5745c2e6065c2028b7d8a55eafaeb72ed4cd83c7c480865d0b881": {
    functionName: "createContinuousScreeningConfigurationFn_createServerFn_handler",
    importer: () => import("./assets/continuous-screening-BM9iKNo4.js")
  },
  "52068080343d82e992504e273fbeb1c82e4164eb84fe791f5411bab1c4a385dd": {
    functionName: "listLoader_createServerFn_handler",
    importer: () => import("./assets/_listId-XiwMbUTm.js")
  },
  "522dc8ffa88e5fa33cd8ddfacbcdd4ce967dbf385b0fe394ff8eb713cfc119fd": {
    functionName: "editListFn_createServerFn_handler",
    importer: () => import("./assets/lists-C0BQcZhN.js")
  },
  "529c11e230cecc431623ebc64b78ad4822d0276b44fe54542de7db123b4ed455": {
    functionName: "refreshTokenFn_createServerFn_handler",
    importer: () => import("./assets/auth-B8LkeYzJ.js")
  },
  "532d11a3a313e967206b28dfb4fe70321052b586d522af5bec2717900087a9a1": {
    functionName: "decisionsLayoutLoader_createServerFn_handler",
    importer: () => import("./assets/decisions-B_MJq5GR.js")
  },
  "536c5d483d909feb789f3e636c7a91e9cadfdd2c714c28b79a89a7bb02ac6d13": {
    functionName: "webhookDetailLoader_createServerFn_handler",
    importer: () => import("./assets/webhooks_._webhookId-K4-McSz_.js")
  },
  "54f6369f93f640ea9ef7a8eef3570c00b16f7ed5b44f218829d97a325a705a4f": {
    functionName: "appRouterLoader_createServerFn_handler",
    importer: () => import("./assets/app-router-CHuBtgTY.js")
  },
  "550320d30c99ef1dc46ef4d34361dd96ea62195dd39befd7f0c642c2e7a0537d": {
    functionName: "deactivateIterationFn_createServerFn_handler",
    importer: () => import("./assets/scenarios-Cg3pzbM2.js")
  },
  "556d8a7680f56e413a90f30867650c09c290af8cf9bcb9bff6b92a9f3e7eeb2d": {
    functionName: "duplicateRuleFn_createServerFn_handler",
    importer: () => import("./assets/scenarios-Cg3pzbM2.js")
  },
  "562fb34c2b62884dfcccdfbffd301f0330be037546fdfdcc3c0c9cf0ebe31ff3": {
    functionName: "getRuleHitTableFn_createServerFn_handler",
    importer: () => import("./assets/analytics-CmNOkTDB.js")
  },
  "56f0cc55efe9f42480c18332b978130eb1b8c834d27c7b8d818d11fbe9a9fefe": {
    functionName: "setLanguageFn_createServerFn_handler",
    importer: () => import("./assets/user-B5esJmjg.js")
  },
  "586b6019eca85f8d98213e77d77ee3dd88859a41bd945819a7164bfdc8e96537": {
    functionName: "beforeLoadFn_createServerFn_handler",
    importer: () => import("./assets/index-p034z8Cn.js")
  },
  "589f847aaa1a3ef61540357f0aada39bc7f4543ff712b1eeeefaa030beba0ad5": {
    functionName: "addCommentFn_createServerFn_handler",
    importer: () => import("./assets/cases-KrsxdIwI.js")
  },
  "59a7650a5227dc2800373a38230e6720a235df16dbcf1b12e55dcb573e0f3a19": {
    functionName: "listCaseDecisionsFn_createServerFn_handler",
    importer: () => import("./assets/cases-KrsxdIwI.js")
  },
  "5a205b441cdb9490a6f3958d7bbe458fad090ffd16d25ef9608aa14d156876a4": {
    functionName: "decisionsLoader_createServerFn_handler",
    importer: () => import("./assets/index-ChEicu0U.js")
  },
  "5dd474035928800999c58e4504cb964c22ef188e309212a2b40ba741538ecc26": {
    functionName: "deleteApiKeyFn_createServerFn_handler",
    importer: () => import("./assets/settings-CSYsml77.js")
  },
  "61e04074ce129bbfdce54aba5d0f8d00a509af97018b86bcbf7811789406c510": {
    functionName: "checkVersionUpdateFn_createServerFn_handler",
    importer: () => import("./assets/version-DW4OU7UF.js")
  },
  "620c46bfa3baf7db386208078056700c83bd9579d70242df23c44c39513b8006": {
    functionName: "deleteTableFn_createServerFn_handler",
    importer: () => import("./assets/data-Dzra87dl.js")
  },
  "628d5a1aeaf107fb0f5e48757f5f0b6ae0578a3d5aa8028d7af77aa34542f748": {
    functionName: "listSavedFreeformSearchesFn_createServerFn_handler",
    importer: () => import("./assets/screenings-Bf2ZXJnb.js")
  },
  "62ebf56e36c69c039c1cc474de7eb5d971675bbdc2d6c91f69c807b1422a378b": {
    functionName: "getDataFn_createServerFn_handler",
    importer: () => import("./assets/_objectType._objectId-BelNKJ2r.js")
  },
  "638113da6a614e62eb9cfde6084f9a695ec0f455f864401e97cbf9680f4f58b9": {
    functionName: "getCaseDetailFn_createServerFn_handler",
    importer: () => import("./assets/cases-KrsxdIwI.js")
  },
  "657390759bf41fc09b64c2cb7e4f77389c9d27685c05d104e7d2f738d4daaacc": {
    functionName: "casesInboxesIndexLoader_createServerFn_handler",
    importer: () => import("./assets/index-C3DEKWiE.js")
  },
  "65bdacf95e97ec0a55a69b83fde6b36289c73a42072ae668760591a64c05f0ab": {
    functionName: "reviewContinuousScreeningMatchFn_createServerFn_handler",
    importer: () => import("./assets/continuous-screening-BM9iKNo4.js")
  },
  "67501a547b07672088001fd3643a7243f0defadae72c31f35ea7253014d0ed4f": {
    functionName: "updateWorkflowRuleFn_createServerFn_handler",
    importer: () => import("./assets/workflows-CFb2BeS_.js")
  },
  "6944613ffe0aa02bb2c4f5e334213d5ca9ee34cfdc427416708cf528d68ff3f2": {
    functionName: "getDataModelFn_createServerFn_handler",
    importer: () => import("./assets/data-Dzra87dl.js")
  },
  "69c1121ba3b9733ad8a1ec4ec65753e354d35c7612bd9734056c85c59b5b1017": {
    functionName: "userScoringLayoutLoader_createServerFn_handler",
    importer: () => import("./assets/user-scoring-D49silQd.js")
  },
  "6a1b75fb03d270db32566404572dd5ae749f05a9f3ffdfebbe1268ede86a7183": {
    functionName: "getUnavailabilityFn_createServerFn_handler",
    importer: () => import("./assets/settings-CSYsml77.js")
  },
  "6b4926a912ebab96f542f97312e6119773d323636fc3886a305ead95a794d825": {
    functionName: "reorderWorkflowsFn_createServerFn_handler",
    importer: () => import("./assets/workflows-CFb2BeS_.js")
  },
  "6c2d4274b8efb35e2bf7bcda438ff0aa337178dc081d76f95ef653851647b81d": {
    functionName: "homeLoader_createServerFn_handler",
    importer: () => import("./assets/home-CR-I1jeM.js")
  },
  "6d86c7f155864d7d15da8da5213c501e2d5f184e15aca786db098a47b307800e": {
    functionName: "getCasesFn_createServerFn_handler",
    importer: () => import("./assets/cases-KrsxdIwI.js")
  },
  "6da7fd1e937eb76a3da98c1eae2f5b00ba1261770e9e39059ea4e42fb39c05a0": {
    functionName: "createPasswordLoader_createServerFn_handler",
    importer: () => import("./assets/create-password-CJJ2uV4G.js")
  },
  "6dccf7228e9488e60f1e3ca3743c4d1d1c8eadb00bac9fa1b29371c74626582d": {
    functionName: "updateAllowedNetworksFn_createServerFn_handler",
    importer: () => import("./assets/settings-CSYsml77.js")
  },
  "6de3fef2843a06dda38d7559060c1f19b6dc1034167adacf40f0d4aafe45b8bd": {
    functionName: "cancelUnavailabilityFn_createServerFn_handler",
    importer: () => import("./assets/settings-CSYsml77.js")
  },
  "6ed0323ce7d6c65faeff90a4e9e625ad86d4bf93f776f82315856a0a4824ebd4": {
    functionName: "updateWebhookFn_createServerFn_handler",
    importer: () => import("./assets/settings-CSYsml77.js")
  },
  "700b8869e924868568e980111bd9786fcca6b7b6bd9ab16530036194587957dc": {
    functionName: "uploadLoader_createServerFn_handler",
    importer: () => import("./assets/_objectType-lzyGwipq.js")
  },
  "717fe6d459f3c0141c67184aac743c50d7678af1c5599c4181484d9b0fda244b": {
    functionName: "addRuleSnoozeFn_createServerFn_handler",
    importer: () => import("./assets/cases-KrsxdIwI.js")
  },
  "71b227037e9d2870a23391901108fa35fad4ad2916687fba8d82b11d83a3e0ff": {
    functionName: "editNameFn_createServerFn_handler",
    importer: () => import("./assets/cases-KrsxdIwI.js")
  },
  "730a630dc6d7eb67a3fbace85bbf001bed5e847a01d4298e0e6c12beb525b42d": {
    functionName: "getDecisionsScoreDistributionFn_createServerFn_handler",
    importer: () => import("./assets/analytics-CmNOkTDB.js")
  },
  "73d50d04b2d129e99c6df2d999e7261c56ca37cbc22971d21142d884f5129541": {
    functionName: "enqueueReviewFn_createServerFn_handler",
    importer: () => import("./assets/cases-KrsxdIwI.js")
  },
  "7469c7495fddd76f74b10442ddbeb940542862745f6115e6120f8287d6ff38af": {
    functionName: "deleteExportedFieldFn_createServerFn_handler",
    importer: () => import("./assets/settings-CSYsml77.js")
  },
  "749fc2cfb4693e85ee5f8ae5e2dce8038cc79455528884f28421b72fd049f498": {
    functionName: "scenarioCaseDetailLoader_createServerFn_handler",
    importer: () => import("./assets/old-CCOdCanT.js")
  },
  "75a4947011a2503d8a104142cd6ac180bd616d9a9a6fd524eeb348bf5f5c4e54": {
    functionName: "screeningProvidersLoader_createServerFn_handler",
    importer: () => import("./assets/screening-providers-CK_5XVWk.js")
  },
  "769522befd24b072c6865643d892e7ef5f97ce5a3401a8595862240f4cb9111f": {
    functionName: "getRuleDescriptionFn_createServerFn_handler",
    importer: () => import("./assets/scenarios-Cg3pzbM2.js")
  },
  "7742794cc8be33a097adf2021e2e520283bee78d2312e4fcf4ba47a465cadff1": {
    functionName: "tagsLoader_createServerFn_handler",
    importer: () => import("./assets/tags-3MTS79bH.js")
  },
  "77f970bfcb5f2e16f137b6d50579e1eaca7df3471d314b70a928bd2fffd6e4da": {
    functionName: "scheduledExecutionsLoader_createServerFn_handler",
    importer: () => import("./assets/scheduled-executions-CtMK_Fhk.js")
  },
  "7a5cf6ff5d57a37f56f723fe4f0b562bb341aec5227b7fc6ce6ac710588c3bfb": {
    functionName: "createRuleFn_createServerFn_handler",
    importer: () => import("./assets/scenarios-Cg3pzbM2.js")
  },
  "7bf3fa45f12dec9f5261b4c7fbc73143b17ef43501090d86132f22c529807c93": {
    functionName: "getCaseStatusByDateFn_createServerFn_handler",
    importer: () => import("./assets/analytics-CmNOkTDB.js")
  },
  "7d12d035dddab5de6291edae11fad895bbd0d54c4ddd305f06aba898e35a49ce": {
    functionName: "deleteWorkflowRuleFn_createServerFn_handler",
    importer: () => import("./assets/workflows-CFb2BeS_.js")
  },
  "7d98973cbaea0952d4593fcae71ef17fff2105f0f55b0362b6496a5a00f21399": {
    functionName: "createDraftIterationFn_createServerFn_handler",
    importer: () => import("./assets/scenarios-Cg3pzbM2.js")
  },
  "7de8f78e734f6d311b0794592f0fe7afa5c18a13e3c5015554d865d34486a594": {
    functionName: "activateIterationFn_createServerFn_handler",
    importer: () => import("./assets/scenarios-Cg3pzbM2.js")
  },
  "800d797038baf8d66ec1d637c90f597245b65a7eddb551ae33ef64f74f29ac44": {
    functionName: "commitScoringRulesetFn_createServerFn_handler",
    importer: () => import("./assets/scoring-Dne_8qRx.js")
  },
  "82a0606287e871253bee2695568cc074f02a79719a9c3912f1f286f334f44acb": {
    functionName: "listWorkflowRulesFn_createServerFn_handler",
    importer: () => import("./assets/workflows-CFb2BeS_.js")
  },
  "831980953e257f0ca8cd51639d31164df1ab717173c5888527336df5f04bb689": {
    functionName: "editInboxFn_createServerFn_handler",
    importer: () => import("./assets/cases-KrsxdIwI.js")
  },
  "8370bb112072e4230aaa7c77c7ba194d39985d69e4c9b7700b9e6ed1c051793d": {
    functionName: "caseDetailLoader_createServerFn_handler",
    importer: () => import("./assets/index-jc7JTp4B.js")
  },
  "84eac02c9d8f666b46122a63a8c2d500f028fba6ad6fe0463043c6d76a73a221": {
    functionName: "appBuilderLayoutLoader_createServerFn_handler",
    importer: () => import("./assets/_builder-BiCb1cZJ.js")
  },
  "8576e3c08aa7eeb60ef13888c99a08b2c94a9ccb2011e4b79e4a2747c8bd8e34": {
    functionName: "applyArchetypeFn_createServerFn_handler",
    importer: () => import("./assets/data-Dzra87dl.js")
  },
  "85a181416467a2a8d2e38f7c5f19dd32902af84a24705bb810477f7c5c63a1ad": {
    functionName: "addCaseReviewFeedbackFn_createServerFn_handler",
    importer: () => import("./assets/cases-KrsxdIwI.js")
  },
  "869f5d247e9a212cb4c13559fb791071613a77bbd6b823a7391a714e09347c62": {
    functionName: "updateScoringSettingsFn_createServerFn_handler",
    importer: () => import("./assets/scoring-Dne_8qRx.js")
  },
  "86f31f3978dc70721338902c9d7bb7f8b311426cf9a8af6ec9c5907fe8ecc0dc": {
    functionName: "setUnavailabilityFn_createServerFn_handler",
    importer: () => import("./assets/settings-CSYsml77.js")
  },
  "87fdcf7fcb5a7dfe1c2726c1e66ec7c76ecdff164f291ddb19f554e2d88b0a92": {
    functionName: "getNextUnassignedCaseFn_createServerFn_handler",
    importer: () => import("./assets/cases-KrsxdIwI.js")
  },
  "880d65aaf841161add62f19fc5a167b5b04291f468a24ee61ce02619a0370e1b": {
    functionName: "addClient360ConfigurationFn_createServerFn_handler",
    importer: () => import("./assets/client-360-ChoGrS2h.js")
  },
  "88c9ce0e9be42b3075dec429a85b9229e9ed0fd7288600c5bacafbcb50e93ae7": {
    functionName: "createTestRunFn_createServerFn_handler",
    importer: () => import("./assets/scenarios-Cg3pzbM2.js")
  },
  "896a1ecc11846a9461e21facf77adf667f611a1ae5b520fb3166be717fd06c95": {
    functionName: "rulesLoader_createServerFn_handler",
    importer: () => import("./assets/rules-BLTULsvW.js")
  },
  "8a31b898ccb0eac9b409e567b8b6c8a5e66000a39e2e0d0f343bce947215991e": {
    functionName: "createListFn_createServerFn_handler",
    importer: () => import("./assets/lists-C0BQcZhN.js")
  },
  "8a7664c76b372de8d60a46557e4b07a41388d73db5069a7aab81083cfa29607f": {
    functionName: "inboxDetailLoader_createServerFn_handler",
    importer: () => import("./assets/_inboxId-65JlPZGn.js")
  },
  "8d81d60bc69ddcecb83767f0588e917b9b1789d9c964349b5d1fec6ae2c91ed4": {
    functionName: "beforeLoadFn_createServerFn_handler",
    importer: () => import("./assets/_new-CKUyuLlp.js")
  },
  "8d9af50984926e24e1d954ca748ae0549e6d1b2ad9e2a9efb7e3a25c140c326e": {
    functionName: "getContinuousScreeningConfigurationFn_createServerFn_handler",
    importer: () => import("./assets/continuous-screening-BM9iKNo4.js")
  },
  "9400a11e6b2258983bbeb49c7002a1783418a7cb2735a2b7e80327517e28d11f": {
    functionName: "editRuleAction_createServerFn_handler",
    importer: () => import("./assets/RuleEditPanel-C48wlctR.js")
  },
  "9578f0945f70f45ec6b1514ebd9e2c58e82cea0a49e40bcdd2ec06401ff2260b": {
    functionName: "getRelatedCasesByObjectFn_createServerFn_handler",
    importer: () => import("./assets/cases-KrsxdIwI.js")
  },
  "9675e53932d479c3dca797a1ff9bfad4f8a7229c662af881bd200287d2a19dbe": {
    functionName: "getAppConfigFn_createServerFn_handler",
    importer: () => import("./assets/core-BNQ3xq-J.js")
  },
  "96de64f7fcf44a36c65a6c67c83dda0eb4c0ef81b9a23ffd6bfbfc0606607f59": {
    functionName: "revokeWebhookSecretFn_createServerFn_handler",
    importer: () => import("./assets/settings-CSYsml77.js")
  },
  "96e778b85525688a73f39daf945f12d0e8bf1582e4d62ff331d7c45582857d17": {
    functionName: "detectionLayoutLoader_createServerFn_handler",
    importer: () => import("./assets/detection-BfszBMnh.js")
  },
  "97aa765bfb2425b7c56f6b542173eb05eeb7bd8739a091781ebe74dfa31d9861": {
    functionName: "getBuilderOptionsFn_createServerFn_handler",
    importer: () => import("./assets/scenarios-Cg3pzbM2.js")
  },
  "99f4389ef92108f1572f002e85ac7949c8a6a26370aa3122e995fd3bd27bca0d": {
    functionName: "enrichMatchFn_createServerFn_handler",
    importer: () => import("./assets/screenings-Bf2ZXJnb.js")
  },
  "9a9ceeadd477b9b71ffa23dfcfc00027094ddb47f7d18acd749a9f69fcc0b4b2": {
    functionName: "apiKeysLoader_createServerFn_handler",
    importer: () => import("./assets/api-keys-DF9TQZ56.js")
  },
  "9c16c172bca160e3f7fc361739140c28a4097f84a9be3fdb80c65789479f4796": {
    functionName: "copyScenarioFn_createServerFn_handler",
    importer: () => import("./assets/scenarios-Cg3pzbM2.js")
  },
  "9e373c98a7ca5a88e36577c19656bba7280c710ca1f4b629f115dca016dcf558": {
    functionName: "continuousScreeningLayoutLoader_createServerFn_handler",
    importer: () => import("./assets/continuous-screening-BKZuxqCV.js")
  },
  "a140ea9b3129290100dd40aa3114c38f68c58f854cd3ca6624c3b39efdd53a4e": {
    functionName: "configurationsLoader_createServerFn_handler",
    importer: () => import("./assets/configurations-pP9HjAoE.js")
  },
  "a3f82d4acb2686ffe2e5b001f8c0c3edc2466641ccea4fb25f9ad76c4d0fcc41": {
    functionName: "validateAstFn_createServerFn_handler",
    importer: () => import("./assets/scenarios-Cg3pzbM2.js")
  },
  "a507f66df206343c0cbfa5cb1e2979f7807ec4b4075ed7bffc2845395c2f1389": {
    functionName: "getCaseReviewFn_createServerFn_handler",
    importer: () => import("./assets/cases-KrsxdIwI.js")
  },
  "a596d5a955719e10577b334de37fcc87ab4a008f47ea0fa506612b1d56199816": {
    functionName: "addReviewToCaseCommentsFn_createServerFn_handler",
    importer: () => import("./assets/cases-KrsxdIwI.js")
  },
  "a6ba1cd10eb1d07f91dba3a2fb2390c482352a27212ad29212b5cf30d4ff7aaa": {
    functionName: "getEnrichedDataFn_createServerFn_handler",
    importer: () => import("./assets/screenings-Bf2ZXJnb.js")
  },
  "a6c609d23543fed660adf412fbec853d2014c725efa26eaa1dd6838956a04008": {
    functionName: "updateOrganizationScenariosFn_createServerFn_handler",
    importer: () => import("./assets/settings-CSYsml77.js")
  },
  "a761d2402c537f6119f0a5ca64f12931c80b8e766b7a69e364b5561d15156c3d": {
    functionName: "escalateCaseFn_createServerFn_handler",
    importer: () => import("./assets/cases-KrsxdIwI.js")
  },
  "a81c48bc85c5208715b1ec58392c10a1ba8978e0e1bffe47b2426ae602ca368f": {
    functionName: "getIterationRuleFn_createServerFn_handler",
    importer: () => import("./assets/scenarios-Cg3pzbM2.js")
  },
  "a935492b06b3339671752674985c2bdbb3884594169301f4e22811733e16cf72": {
    functionName: "listObjectsFn_createServerFn_handler",
    importer: () => import("./assets/data-Dzra87dl.js")
  },
  "a98fd3361b7ced97078a718642448473da394f6499cd5f725003946a4fb4d6ce": {
    functionName: "getPivotRelatedCasesFn_createServerFn_handler",
    importer: () => import("./assets/cases-KrsxdIwI.js")
  },
  "aa2f6e9630b2170e61c566aee519bcfb49186ed4366802d880b3c61134ff66d4": {
    functionName: "getListsFn_createServerFn_handler",
    importer: () => import("./assets/lists-C0BQcZhN.js")
  },
  "ab2e176c49b659576c1b5874c54554746f80896a3854e2b4a34d9499cd6992fe": {
    functionName: "createWebhookSecretFn_createServerFn_handler",
    importer: () => import("./assets/settings-CSYsml77.js")
  },
  "ad3d01eeafa29cd4f2088158bee9026204a9de5c16c52683ac5449c13384cb30": {
    functionName: "caseDetailLayoutLoader_createServerFn_handler",
    importer: () => import("./assets/_detail-oF5pJ2Md.js")
  },
  "ad8fbd389de7e5a455788904859e3b8f3702c9f52e81c52078f165263976b78b": {
    functionName: "getScoringRulesetFn_createServerFn_handler",
    importer: () => import("./assets/scoring-Dne_8qRx.js")
  },
  "adfc3f80bda8e9cd2aaa38540facec344ddfce65c5acce62ded2e403374ce950": {
    functionName: "updateAiSettingsFn_createServerFn_handler",
    importer: () => import("./assets/cases-KrsxdIwI.js")
  },
  "aeb25831ddd4ebbae9b71adbb802ff454fa3049df29c01d8242dff7c101f760c": {
    functionName: "closeCaseFn_createServerFn_handler",
    importer: () => import("./assets/cases-KrsxdIwI.js")
  },
  "afff74a332f61da07ae725d09d5dc8755e663effc4cc7c6dd4c465b5bb29b65b": {
    functionName: "ipWhitelistingLoader_createServerFn_handler",
    importer: () => import("./assets/ip-whitelisting-CX0tjAmB.js")
  },
  "b0fc06ccceb6bbefac12913faef83bb4161aff5dc6c33399de4999681030364f": {
    functionName: "editTagsFn_createServerFn_handler",
    importer: () => import("./assets/cases-KrsxdIwI.js")
  },
  "b1dc2e1461471567ead26a6613de4a682628d8104ee743af22f44c67225a8e76": {
    functionName: "saveFreeformSearchFn_createServerFn_handler",
    importer: () => import("./assets/screenings-Bf2ZXJnb.js")
  },
  "b5763aef299fd3edda29c30c20c4016e86ac27e31697a1689163ff17d8d7b171": {
    functionName: "createWorkflowRuleFn_createServerFn_handler",
    importer: () => import("./assets/workflows-CFb2BeS_.js")
  },
  "b649b4f8bcb365c4a1d6fba3e15603506e752a6c72da13f32da492c5d9391cf9": {
    functionName: "getRuleSnoozeFn_createServerFn_handler",
    importer: () => import("./assets/scenarios-Cg3pzbM2.js")
  },
  "b7130ef00549d8fa7b6c392aa54b48f1b9ef9f4afe31fbf69bdb92ada74a5ec5": {
    functionName: "screeningCaseDetailLoader_createServerFn_handler",
    importer: () => import("./assets/m._caseId-BEY4Sn8u.js")
  },
  "b7150a870e9a1ea0cec101e043c9315f8e4f493bbf6f154280b4c83124d8c5dc": {
    functionName: "getWorkflowLatestReferencesFn_createServerFn_handler",
    importer: () => import("./assets/workflows-CFb2BeS_.js")
  },
  "b715dbcb72c4e13f7f23e5042eb58c4dc63388e4054266d8c58a136fdf4c4189": {
    functionName: "workflowLoader_createServerFn_handler",
    importer: () => import("./assets/workflow-vGsydwAH.js")
  },
  "b8bf408bf246f94058d958629a9de1020bec6836c75312d385d2d3d5c333547f": {
    functionName: "updateInboxUserFn_createServerFn_handler",
    importer: () => import("./assets/settings-CSYsml77.js")
  },
  "b8cfaed4b661eb58e1126fc2c19a1941d14bbee462adcfaf38d21c8ad608b5f5": {
    functionName: "uploadIngestionDataFn_createServerFn_handler",
    importer: () => import("./assets/data-Dzra87dl.js")
  },
  "b8d513e2878c20b977336765e71a6b1c5899e1fc4763f2c90904d86758c8f61c": {
    functionName: "createInboxUserFn_createServerFn_handler",
    importer: () => import("./assets/settings-CSYsml77.js")
  },
  "ba9c379c3bd9fefe648e379845f78650c969c6a20b6cd18078d4a9a7a1545fbb": {
    functionName: "editViewLoader_createServerFn_handler",
    importer: () => import("./assets/_edit-view-BsAbFsd_.js")
  },
  "bc39d831a3856af2a4d01bab1899d09c170fbc1cf3aff927b17e4b81eeb25232": {
    functionName: "createAnnotationFn_createServerFn_handler",
    importer: () => import("./assets/data-Dzra87dl.js")
  },
  "bcd60fdf1b642255312a33581a43354f2ff1a39b21a48272ce313b562293ed46": {
    functionName: "deleteRuleFn_createServerFn_handler",
    importer: () => import("./assets/scenarios-Cg3pzbM2.js")
  },
  "bd8ef66fdb4a2cddad36ed325a96ca450c0fd0700c664c236830da642b73ab90": {
    functionName: "createUserFn_createServerFn_handler",
    importer: () => import("./assets/settings-CSYsml77.js")
  },
  "bdda9c0781c975539c593039fa8c7b3413d8e3550b1457c51cbe91dd66dbbb66": {
    functionName: "saveDecisionAction_createServerFn_handler",
    importer: () => import("./assets/decision-DY1BSR0q.js")
  },
  "be70655bf46ebde519b189f0f0a811452f0cf60518a6ffc381b86125323c6449": {
    functionName: "analyticsLayoutLoader_createServerFn_handler",
    importer: () => import("./assets/analytics-C0ypvnd7.js")
  },
  "bf0a785a637f5f2a759fbb1e8081bc8508a66bcb98e6fac8cace8c3cf4b681c8": {
    functionName: "signInEmailLoader_createServerFn_handler",
    importer: () => import("./assets/sign-in-email-Cj36QwfY.js")
  },
  "bf56d34b66baeffb8e8738a9a75b1b5f0ca8916895407c31fadab20a997e6a3c": {
    functionName: "editScreeningAction_createServerFn_handler",
    importer: () => import("./assets/ScreeningRuleEditPanel-CCochku-.js")
  },
  "bf5a68bbacfe67480da132d5c9fb36f5e78e973d9ade9e1c58238089302d1de2": {
    functionName: "casesOverviewLoader_createServerFn_handler",
    importer: () => import("./assets/overview-CZINcugq.js")
  },
  "bffc3c813284c52f2a760b5057ce15887502aa1fd8b7ea49cc9a49bc9d30a25d": {
    functionName: "createTableFn_createServerFn_handler",
    importer: () => import("./assets/data-Dzra87dl.js")
  },
  "c0e2fb3099dd84649846cdeece17869d8799a9382d071057a6c5ea28032c73db": {
    functionName: "deleteInboxFn_createServerFn_handler",
    importer: () => import("./assets/settings-CSYsml77.js")
  },
  "c31af8b0b868ea45fe4522ba4e6e65a83ef5425f85581ff7f1d23c50fe1b8e9d": {
    functionName: "searchClient360Fn_createServerFn_handler",
    importer: () => import("./assets/client-360-ChoGrS2h.js")
  },
  "c4d7caa7ca210f7aecb8c771c038067f3b63800b136f7984b4e49342381762c0": {
    functionName: "getAvailableFiltersFn_createServerFn_handler",
    importer: () => import("./assets/analytics-CmNOkTDB.js")
  },
  "c6f2dde5ef292a65f4795cd0def69043a1a11bd2b7d87d95d19293ad131fd1a0": {
    functionName: "listScheduledExecutionsFn_createServerFn_handler",
    importer: () => import("./assets/decisions-cyEoHNYS.js")
  },
  "c936f761eda35384cd1c6d7aafa7b0037fb12f03b1e6eefafe382a6cdca4b8bf": {
    functionName: "getScoreLatestFn_createServerFn_handler",
    importer: () => import("./assets/scoring-Dne_8qRx.js")
  },
  "c9ddf304d678d86a712b97f7f51ac400b01e60a2a8ddd3bac685823a21b09302": {
    functionName: "updateOrganizationFn_createServerFn_handler",
    importer: () => import("./assets/settings-CSYsml77.js")
  },
  "cab926b64aeafcc571e19bf37ae1d359eb7532011c78212f36ce87752a271bad": {
    functionName: "createTagFn_createServerFn_handler",
    importer: () => import("./assets/settings-CSYsml77.js")
  },
  "ce8b59e9e76d8d79210beea37677a4cf76ee21a86983127fc1e9d1134439f0d4": {
    functionName: "createApiKeyFn_createServerFn_handler",
    importer: () => import("./assets/settings-CSYsml77.js")
  },
  "d070b3a7453d9a246e8b18cf318e8ca84bcf66985b248c4167766e8837922aaf": {
    functionName: "triggerManualExecutionAction_createServerFn_handler",
    importer: () => import("./assets/home-CR-I1jeM.js")
  },
  "d1a13ae8f732eefdeea5228ea79db17342d620a69832401c049ee1c8308fff01": {
    functionName: "updateAutoAssignFn_createServerFn_handler",
    importer: () => import("./assets/cases-KrsxdIwI.js")
  },
  "d258b3f9cee7bf652d5dcd6449e7207352b662ac5519d7f01102bacf5e6a309e": {
    functionName: "getScreeningHitsTableFn_createServerFn_handler",
    importer: () => import("./assets/analytics-CmNOkTDB.js")
  },
  "d6d738fdfcaabc026ee9a89bb634b70594e90146acb5a6d74919ce286495ffd1": {
    functionName: "listRulesetVersionsFn_createServerFn_handler",
    importer: () => import("./assets/scoring-Dne_8qRx.js")
  },
  "d7133cc4021ae7dfd97cb94f690467fe773bc29b8534fe756b9d992410e63545": {
    functionName: "searchScreeningMatchesFn_createServerFn_handler",
    importer: () => import("./assets/screenings-Bf2ZXJnb.js")
  },
  "d9f50a6ec4d0650a079b61e35c1e787e77c62b9d1229d6056ac3d33412b1c4f3": {
    functionName: "getScreeningDetailFn_createServerFn_handler",
    importer: () => import("./assets/screenings-Bf2ZXJnb.js")
  },
  "dae75fa64d986db72e5cabd904f22228db84e30d97fed369b04d3ff497ccdc02": {
    functionName: "cancelTestRunFn_createServerFn_handler",
    importer: () => import("./assets/scenarios-Cg3pzbM2.js")
  },
  "dba1c1f220424954a6cba811e467fc7cef5967c34fb495cfa073a4df63df92da": {
    functionName: "getUploadLogsFn_createServerFn_handler",
    importer: () => import("./assets/data-Dzra87dl.js")
  },
  "dc01a82806619825cf27ba790d89ffc7a69cc8ea1332600ea74ae86881644b5a": {
    functionName: "webhooksLoader_createServerFn_handler",
    importer: () => import("./assets/webhooks-GLUsThe4.js")
  },
  "dc22971611fdbbfc01da2718b94cb87e99d65f644986bf516efd80bb4f2dcccd": {
    functionName: "listWorkflowInboxesFn_createServerFn_handler",
    importer: () => import("./assets/workflows-CFb2BeS_.js")
  },
  "de09a804f89994e7c4b71dfae5351566175497947b3fa1b429fd992507f6f196": {
    functionName: "loadMoreContinuousScreeningMatchesFn_createServerFn_handler",
    importer: () => import("./assets/continuous-screening-BM9iKNo4.js")
  },
  "de490983d4997d232b884399c941d6395a6a47d83f1d2df248b24ed6ba673987": {
    functionName: "scenarioData_createServerFn_handler",
    importer: () => import("./assets/_scenarioId-BOvXk8Jg.js")
  },
  "ded1573960426155c88bc40540df73cd6f691d9bbc236ec1cfed89b2e792d63a": {
    functionName: "listSuspicionActivityReportsFn_createServerFn_handler",
    importer: () => import("./assets/cases-KrsxdIwI.js")
  },
  "df0559d9cda80ea6a0d0760b45380c378e605953fba51a6900562d5a851e2e10": {
    functionName: "getWorkflowRuleFn_createServerFn_handler",
    importer: () => import("./assets/workflows-CFb2BeS_.js")
  },
  "df48532154d9db27d92642acee665ab62e9a530971387ef6d65669994da54b1d": {
    functionName: "importOrgFn_createServerFn_handler",
    importer: () => import("./assets/data-Dzra87dl.js")
  },
  "e00f42a207141939bebd3399a0b318603c5778485365367b408e5fb0ff5ee8e1": {
    functionName: "deleteTagFn_createServerFn_handler",
    importer: () => import("./assets/settings-CSYsml77.js")
  },
  "e2057feec54b9c65463e5e5049fab560872be0e2364a37913ed87fce9cf5c98d": {
    functionName: "listContinuousScreeningConfigurationsFn_createServerFn_handler",
    importer: () => import("./assets/continuous-screening-BM9iKNo4.js")
  },
  "e2260ee1da905a472c233d98f5e030021e4975dde185a2a2af9c7aa4e84372cd": {
    functionName: "updateInboxWorkflowFn_createServerFn_handler",
    importer: () => import("./assets/cases-KrsxdIwI.js")
  },
  "e34efea5d0fd04848729b9d6a16c0c9deebf709db40984ac8169287e71fb45b7": {
    functionName: "importOrgFileFn_createServerFn_handler",
    importer: () => import("./assets/data-Dzra87dl.js")
  },
  "e43e9eeaeb4c49ea457b7f8042a90611c35a760ccb59ce0e4665bdd220dc0283": {
    functionName: "authRedirectLoader_createServerFn_handler",
    importer: () => import("./assets/auth-redirect-BBp0FXWc.js")
  },
  "e519385a986a1399e4d45bf7103b63f45a1eca15ff4ac1f5690d58dbb323fc40": {
    functionName: "massUpdateCasesFn_createServerFn_handler",
    importer: () => import("./assets/cases-KrsxdIwI.js")
  },
  "e6229feca3b3fb85b41ab0891207d4614d4bb03b4efa764297cd88ad37d290fb": {
    functionName: "getObjectCasesFn_createServerFn_handler",
    importer: () => import("./assets/data-Dzra87dl.js")
  },
  "e82cb92e0a1421821b2b686ddfb11374aaf0f63a2e78c46cbf81f54b996fb5b9": {
    functionName: "scenariosLoader_createServerFn_handler",
    importer: () => import("./assets/scenarios-mq0PktQH.js")
  },
  "e82e5e029e7551fe42617eac4de94cff4306ffdf6e7eb17491c10229cf7ce1fc": {
    functionName: "listCaseReviewsFn_createServerFn_handler",
    importer: () => import("./assets/cases-KrsxdIwI.js")
  },
  "eabff882048a1ed35120dd8d25bea4f62f65b62d9f736ee683738a9a1738f7a4": {
    functionName: "deleteWorkflowConditionFn_createServerFn_handler",
    importer: () => import("./assets/workflows-CFb2BeS_.js")
  },
  "eaf635be3a78a47c8689038767b8f9301a191d87399a6025d82e173bda71a6f3": {
    functionName: "getAiSettingsFn_createServerFn_handler",
    importer: () => import("./assets/cases-KrsxdIwI.js")
  },
  "eb62479776353becd07e0f2973114c3fdc87de23a85412642275da1738bcf29d": {
    functionName: "editInboxUserAutoAssignFn_createServerFn_handler",
    importer: () => import("./assets/settings-CSYsml77.js")
  },
  "eb80d39d041d4a500312cef62d9e84ae035bb19d48f065e3f80ea29ccb89081b": {
    functionName: "getScoringSettingsFn_createServerFn_handler",
    importer: () => import("./assets/scoring-Dne_8qRx.js")
  },
  "ec8c4b7b0966af1bbe93faf723d4a1602ac35ba6bcaa41896162c40e24575da0": {
    functionName: "screeningLayoutLoader_createServerFn_handler",
    importer: () => import("./assets/_screeningId-Nzx4Han-.js")
  },
  "ed217e8bd8c1d51a0cd2a59be32b49e8fb2aee2d06075740a27474147bc64c21": {
    functionName: "reviewDecisionFn_createServerFn_handler",
    importer: () => import("./assets/cases-KrsxdIwI.js")
  },
  "ed369d932318dab0b42256698a8e38d6f47487bdb776a258c2db28c0893fff84": {
    functionName: "screeningSearchLoader_createServerFn_handler",
    importer: () => import("./assets/index-BOD9G_PZ.js")
  },
  "edda937b3a03ff8cb495aeb66e4a69707d30c5b9c271d98d9fd6dabac503df33": {
    functionName: "updateScenarioFn_createServerFn_handler",
    importer: () => import("./assets/scenarios-Cg3pzbM2.js")
  },
  "ef0179542ce4f92a63bf12d039c8aac33a5d8d216e4258d8baa6b6d4cc611eed": {
    functionName: "listsLoader_createServerFn_handler",
    importer: () => import("./assets/index-DoqyupbR.js")
  },
  "efcf4c4ade647ef10c5850f4903cb036ee9c9cc6425af6151a1469dd30578d49": {
    functionName: "signInEmailFn_createServerFn_handler",
    importer: () => import("./assets/auth-B8LkeYzJ.js")
  },
  "f250aa514e96b274017194a32a92cb6bb673f9b5e588acf4d4d62265e3a8f860": {
    functionName: "getScreeningDatasetsFn_createServerFn_handler",
    importer: () => import("./assets/screenings-Bf2ZXJnb.js")
  },
  "f5641a95755d85fbbf752d30ca29b5a241cd44bb012fada0dbea71e1fe4dc7de": {
    functionName: "createScenarioFn_createServerFn_handler",
    importer: () => import("./assets/scenarios-Cg3pzbM2.js")
  },
  "f6ade2d030bce8b55f721d90fa3d9327598258d26781c52971bd4ed5ea65533e": {
    functionName: "emailVerificationLoader_createServerFn_handler",
    importer: () => import("./assets/email-verification-BrtTlL1R.js")
  },
  "f7b0a4515ec9a4aefb597cce3d3df2ffab191c3d5697df0a4ba0d155d12e2055": {
    functionName: "getRuleVsDecisionOutcomeFn_createServerFn_handler",
    importer: () => import("./assets/analytics-CmNOkTDB.js")
  },
  "f7fed4045f4d4840fd59c892fa21c1b39ccc6d120180acb824ca9162592c0264": {
    functionName: "updateUserFn_createServerFn_handler",
    importer: () => import("./assets/settings-CSYsml77.js")
  },
  "f83b5212fec014171a188acfaf7c75cdb389ad95ff8015a1b0d5e8fe47315f6b": {
    functionName: "analyticsLegacyLoader_createServerFn_handler",
    importer: () => import("./assets/analytics-legacy-giuAcyKT.js")
  },
  "f8f975475cd1f94c061db5e0fc94dc68631a5ce17d2b663c51ffc90322224c92": {
    functionName: "updateContinuousScreeningConfigurationFn_createServerFn_handler",
    importer: () => import("./assets/continuous-screening-BM9iKNo4.js")
  },
  "fae90b50f659174fbb10c5c418df19bf152d84db7c54afb41783f3357caf76e7": {
    functionName: "screeningIndexLoader_createServerFn_handler",
    importer: () => import("./assets/index-BgDPDG-D.js")
  },
  "fafa18929cdae382d01409ef2653af321d4e1509920f23eaf5ac11e8be1f519f": {
    functionName: "iterationLayoutLoader_createServerFn_handler",
    importer: () => import("./assets/_iterationId-DR3iKJCa.js")
  },
  "fe490a7a34f055a03e5f4d8ff13bd595a012710105cfa1bb59b94ed877c3f928": {
    functionName: "createInboxFn_createServerFn_handler",
    importer: () => import("./assets/settings-CSYsml77.js")
  },
  "ff3f275750e20031532404c4fa27e1be16278d0437a5907aeee79a0726aa8670": {
    functionName: "getInboxesFn_createServerFn_handler",
    importer: () => import("./assets/cases-KrsxdIwI.js")
  }
};
async function getServerFnById(id, access) {
  const serverFnInfo = manifest[id];
  if (!serverFnInfo) {
    throw new Error("Server function info not found for " + id);
  }
  const fnModule = serverFnInfo.module ?? await serverFnInfo.importer();
  if (!fnModule) {
    throw new Error("Server function module not resolved for " + id);
  }
  const action = fnModule[serverFnInfo.functionName];
  if (!action) {
    throw new Error("Server function module export not resolved for serverFn ID: " + id);
  }
  return action;
}
var TSS_FORMDATA_CONTEXT = "__TSS_CONTEXT";
var TSS_SERVER_FUNCTION = /* @__PURE__ */ Symbol.for("TSS_SERVER_FUNCTION");
var TSS_SERVER_FUNCTION_FACTORY = /* @__PURE__ */ Symbol.for("TSS_SERVER_FUNCTION_FACTORY");
var X_TSS_SERIALIZED = "x-tss-serialized";
var X_TSS_RAW_RESPONSE = "x-tss-raw";
var TSS_CONTENT_TYPE_FRAMED = "application/x-tss-framed";
var FrameType = {
  /** Seroval JSON chunk (NDJSON line) */
  JSON: 0,
  /** Raw stream data chunk */
  CHUNK: 1,
  /** Raw stream end (EOF) */
  END: 2,
  /** Raw stream error */
  ERROR: 3
};
var FRAME_HEADER_SIZE = 9;
var TSS_CONTENT_TYPE_FRAMED_VERSIONED = `${TSS_CONTENT_TYPE_FRAMED}; v=1`;
function isSafeKey(key) {
  return key !== "__proto__" && key !== "constructor" && key !== "prototype";
}
function safeObjectMerge(target, source) {
  const result = /* @__PURE__ */ Object.create(null);
  if (target) {
    for (const key of Object.keys(target)) if (isSafeKey(key)) result[key] = target[key];
  }
  if (source && typeof source === "object") {
    for (const key of Object.keys(source)) if (isSafeKey(key)) result[key] = source[key];
  }
  return result;
}
function createNullProtoObject(source) {
  if (!source) return /* @__PURE__ */ Object.create(null);
  const obj = /* @__PURE__ */ Object.create(null);
  for (const key of Object.keys(source)) if (isSafeKey(key)) obj[key] = source[key];
  return obj;
}
var GLOBAL_STORAGE_KEY = /* @__PURE__ */ Symbol.for("tanstack-start:start-storage-context");
var globalObj = globalThis;
if (!globalObj[GLOBAL_STORAGE_KEY]) globalObj[GLOBAL_STORAGE_KEY] = new AsyncLocalStorage();
var startStorage = globalObj[GLOBAL_STORAGE_KEY];
async function runWithStartContext(context, fn2) {
  return startStorage.run(context, fn2);
}
function getStartContext(opts) {
  const context = startStorage.getStore();
  if (!context && opts?.throwIfNotFound !== false) throw new Error(`No Start context found in AsyncLocalStorage. Make sure you are using the function within the server runtime.`);
  return context;
}
var getStartOptions = () => getStartContext().startOptions;
var getStartContextServerOnly = getStartContext;
var createServerFn = (options, __opts) => {
  const resolvedOptions = __opts || options || {};
  if (typeof resolvedOptions.method === "undefined") resolvedOptions.method = "GET";
  const setValidator = (validator) => {
    return createServerFn(void 0, {
      ...resolvedOptions,
      validator,
      inputValidator: validator
    });
  };
  const res = {
    options: resolvedOptions,
    middleware: (middleware) => {
      const newMiddleware = [...resolvedOptions.middleware || []];
      middleware.map((m2) => {
        if (TSS_SERVER_FUNCTION_FACTORY in m2) {
          if (m2.options.middleware) newMiddleware.push(...m2.options.middleware);
        } else newMiddleware.push(m2);
      });
      const res2 = createServerFn(void 0, {
        ...resolvedOptions,
        middleware: newMiddleware
      });
      res2[TSS_SERVER_FUNCTION_FACTORY] = true;
      return res2;
    },
    validator: setValidator,
    inputValidator: setValidator,
    handler: (...args) => {
      const [extractedFn, serverFn] = args;
      const newOptions = {
        ...resolvedOptions,
        extractedFn,
        serverFn
      };
      const resolvedMiddleware = [...newOptions.middleware || [], serverFnBaseToMiddleware(newOptions)];
      extractedFn.method = resolvedOptions.method;
      return Object.assign(async (opts) => {
        const result = await executeMiddleware$1(resolvedMiddleware, "client", {
          ...extractedFn,
          ...newOptions,
          data: opts?.data,
          headers: opts?.headers,
          signal: opts?.signal,
          fetch: opts?.fetch,
          context: createNullProtoObject()
        });
        const redirect2 = parseRedirect(result.error);
        if (redirect2) throw redirect2;
        if (result.error) throw result.error;
        return result.result;
      }, {
        ...extractedFn,
        method: resolvedOptions.method,
        __executeServer: async (opts) => {
          const startContext = getStartContextServerOnly();
          const serverContextAfterGlobalMiddlewares = startContext.contextAfterGlobalMiddlewares;
          return await executeMiddleware$1(resolvedMiddleware, "server", {
            ...extractedFn,
            ...opts,
            serverFnMeta: extractedFn.serverFnMeta,
            context: safeObjectMerge(opts.context, serverContextAfterGlobalMiddlewares),
            request: startContext.request
          }).then((d) => ({
            result: d.result,
            error: d.error,
            context: d.sendContext
          }));
        }
      });
    }
  };
  const fun = (options2) => {
    return createServerFn(void 0, {
      ...resolvedOptions,
      ...options2
    });
  };
  return Object.assign(fun, res);
};
async function executeMiddleware$1(middlewares, env, opts) {
  let flattenedMiddlewares = flattenMiddlewares([...getStartOptions()?.functionMiddleware || [], ...middlewares]);
  if (env === "server") {
    const startContext = getStartContextServerOnly({ throwIfNotFound: false });
    if (startContext?.executedRequestMiddlewares) flattenedMiddlewares = flattenedMiddlewares.filter((m2) => !startContext.executedRequestMiddlewares.has(m2));
  }
  const callNextMiddleware = async (ctx) => {
    const nextMiddleware = flattenedMiddlewares.shift();
    if (!nextMiddleware) return ctx;
    try {
      let validator = "validator" in nextMiddleware.options ? nextMiddleware.options.validator : void 0;
      if (!validator && "inputValidator" in nextMiddleware.options) validator = nextMiddleware.options.inputValidator;
      if (validator && env === "server") ctx.data = await execValidator(validator, ctx.data);
      let middlewareFn = void 0;
      if (env === "client") {
        if ("client" in nextMiddleware.options) middlewareFn = nextMiddleware.options.client;
      } else if ("server" in nextMiddleware.options) middlewareFn = nextMiddleware.options.server;
      if (middlewareFn) {
        const userNext = async (userCtx = {}) => {
          const result2 = await callNextMiddleware({
            ...ctx,
            ...userCtx,
            context: safeObjectMerge(ctx.context, userCtx.context),
            sendContext: safeObjectMerge(ctx.sendContext, userCtx.sendContext),
            headers: mergeHeaders(ctx.headers, userCtx.headers),
            _callSiteFetch: ctx._callSiteFetch,
            fetch: ctx._callSiteFetch ?? userCtx.fetch ?? ctx.fetch,
            result: userCtx.result !== void 0 ? userCtx.result : userCtx instanceof Response ? userCtx : ctx.result,
            error: userCtx.error ?? ctx.error
          });
          if (result2.error) throw result2.error;
          return result2;
        };
        const result = await middlewareFn({
          ...ctx,
          next: userNext
        });
        if (isRedirect(result)) return {
          ...ctx,
          error: result
        };
        if (result instanceof Response) return {
          ...ctx,
          result
        };
        if (!result) throw new Error("User middleware returned undefined. You must call next() or return a result in your middlewares.");
        return result;
      }
      return callNextMiddleware(ctx);
    } catch (error) {
      return {
        ...ctx,
        error
      };
    }
  };
  return callNextMiddleware({
    ...opts,
    headers: opts.headers || {},
    sendContext: opts.sendContext || {},
    context: opts.context || createNullProtoObject(),
    _callSiteFetch: opts.fetch
  });
}
function flattenMiddlewares(middlewares, maxDepth = 100) {
  const seen = /* @__PURE__ */ new Set();
  const flattened = [];
  const recurse = (middleware, depth) => {
    if (depth > maxDepth) throw new Error(`Middleware nesting depth exceeded maximum of ${maxDepth}. Check for circular references.`);
    middleware.forEach((m2) => {
      if (m2.options.middleware) recurse(m2.options.middleware, depth + 1);
      if (!seen.has(m2)) {
        seen.add(m2);
        flattened.push(m2);
      }
    });
  };
  recurse(middlewares, 0);
  return flattened;
}
async function execValidator(validator, input) {
  if (validator == null) return {};
  if ("~standard" in validator) {
    const result = await validator["~standard"].validate(input);
    if (result.issues) throw new Error(JSON.stringify(result.issues, void 0, 2));
    return result.value;
  }
  if ("parse" in validator) return validator.parse(input);
  if (typeof validator === "function") return validator(input);
  throw new Error("Invalid validator type!");
}
function serverFnBaseToMiddleware(options) {
  return {
    "~types": void 0,
    options: {
      inputValidator: options.validator ?? options.inputValidator,
      client: async ({ next, sendContext, fetch, ...ctx }) => {
        const payload = {
          ...ctx,
          context: sendContext,
          fetch
        };
        return next(await options.extractedFn?.(payload));
      },
      server: async ({ next, ...ctx }) => {
        const result = await options.serverFn?.(ctx);
        return next({
          ...ctx,
          result
        });
      }
    }
  };
}
var createMiddleware = (options, __opts) => {
  const resolvedOptions = {
    type: "request",
    ...__opts || options
  };
  const setValidator = (validator) => {
    return createMiddleware({}, Object.assign(resolvedOptions, {
      validator,
      inputValidator: validator
    }));
  };
  return {
    options: resolvedOptions,
    middleware: (middleware) => {
      return createMiddleware({}, Object.assign(resolvedOptions, { middleware }));
    },
    validator: setValidator,
    inputValidator: setValidator,
    client: (client) => {
      return createMiddleware({}, Object.assign(resolvedOptions, { client }));
    },
    server: (server2) => {
      return createMiddleware({}, Object.assign(resolvedOptions, { server: server2 }));
    }
  };
};
var innerCreateCsrfMiddleware = (opts = {}) => {
  const middleware = createMiddleware().server(async (ctx) => {
    const csrfCtx = ctx;
    if (opts.filter && !await opts.filter(csrfCtx)) return ctx.next();
    if (await isCsrfRequestAllowed(opts, csrfCtx)) return ctx.next();
    return getFailureResponse(opts, csrfCtx);
  });
  return middleware;
};
var createCsrfMiddleware = innerCreateCsrfMiddleware;
async function isCsrfRequestAllowed(opts, ctx) {
  const result = await getCsrfRequestValidationResult(opts, ctx);
  return result === true || result === void 0 && opts.allowRequestsWithoutOriginCheck === true;
}
async function getCsrfRequestValidationResult(opts, ctx) {
  const fetchSite = ctx.request.headers.get("Sec-Fetch-Site");
  if (fetchSite !== null) return matchValue(opts.secFetchSite ?? "same-origin", fetchSite, ctx);
  const origin = ctx.request.headers.get("Origin");
  if (origin !== null) {
    if (opts.origin) return matchValue(opts.origin, origin, ctx);
    return origin === new URL(ctx.request.url).origin;
  }
  const referer = ctx.request.headers.get("Referer");
  if (referer === null || opts.referer === false) return;
  if (typeof opts.referer === "function") return opts.referer(referer, ctx);
  if (opts.origin) {
    const refererOrigin = getOriginFromUrl(referer);
    return refererOrigin !== void 0 && matchValue(opts.origin, refererOrigin, ctx);
  }
  return isRefererSameOrigin(referer, new URL(ctx.request.url).origin);
}
async function matchValue(matcher, value, ctx) {
  if (typeof matcher === "function") return matcher(value, ctx);
  if (Array.isArray(matcher)) return matcher.includes(value);
  return value === matcher;
}
function getOriginFromUrl(url) {
  try {
    return new URL(url).origin;
  } catch {
    return;
  }
}
function isRefererSameOrigin(referer, requestOrigin) {
  if (referer === requestOrigin) return true;
  if (!referer.startsWith(requestOrigin)) return false;
  if (referer.length === requestOrigin.length) return true;
  const code = referer.charCodeAt(requestOrigin.length);
  return code === 47 || code === 63 || code === 35;
}
async function getFailureResponse(opts, ctx) {
  if (typeof opts.failureResponse === "function") return opts.failureResponse(ctx);
  return opts.failureResponse?.clone() ?? new Response("Forbidden", {
    status: 403
  });
}
function getDefaultSerovalPlugins() {
  return [...getStartOptions()?.serializationAdapters?.map(makeSerovalPlugin) ?? [], ...defaultSerovalPlugins];
}
var textEncoder = new TextEncoder();
var EMPTY_PAYLOAD = new Uint8Array(0);
function encodeFrame(type, streamId, payload) {
  const frame = new Uint8Array(FRAME_HEADER_SIZE + payload.length);
  frame[0] = type;
  frame[1] = streamId >>> 24 & 255;
  frame[2] = streamId >>> 16 & 255;
  frame[3] = streamId >>> 8 & 255;
  frame[4] = streamId & 255;
  frame[5] = payload.length >>> 24 & 255;
  frame[6] = payload.length >>> 16 & 255;
  frame[7] = payload.length >>> 8 & 255;
  frame[8] = payload.length & 255;
  frame.set(payload, FRAME_HEADER_SIZE);
  return frame;
}
function encodeJSONFrame(json) {
  return encodeFrame(FrameType.JSON, 0, textEncoder.encode(json));
}
function encodeChunkFrame(streamId, chunk) {
  return encodeFrame(FrameType.CHUNK, streamId, chunk);
}
function encodeEndFrame(streamId) {
  return encodeFrame(FrameType.END, streamId, EMPTY_PAYLOAD);
}
function encodeErrorFrame(streamId, error) {
  const message = error instanceof Error ? error.message : String(error ?? "Unknown error");
  return encodeFrame(FrameType.ERROR, streamId, textEncoder.encode(message));
}
function createMultiplexedStream(jsonStream, rawStreams, lateStreamSource) {
  let controller;
  let cancelled = false;
  const readers = [];
  const enqueue = (frame) => {
    if (cancelled) return false;
    try {
      controller.enqueue(frame);
      return true;
    } catch {
      return false;
    }
  };
  const errorOutput = (error) => {
    if (cancelled) return;
    cancelled = true;
    try {
      controller.error(error);
    } catch {
    }
    for (const reader of readers) reader.cancel().catch(() => {
    });
  };
  async function pumpRawStream(streamId, stream) {
    const reader = stream.getReader();
    readers.push(reader);
    try {
      while (!cancelled) {
        const { done, value } = await reader.read();
        if (done) {
          enqueue(encodeEndFrame(streamId));
          return;
        }
        if (!enqueue(encodeChunkFrame(streamId, value))) return;
      }
    } catch (error) {
      enqueue(encodeErrorFrame(streamId, error));
    } finally {
      reader.releaseLock();
    }
  }
  async function pumpJSON() {
    const reader = jsonStream.getReader();
    readers.push(reader);
    try {
      while (!cancelled) {
        const { done, value } = await reader.read();
        if (done) return;
        if (!enqueue(encodeJSONFrame(value))) return;
      }
    } catch (error) {
      errorOutput(error);
      throw error;
    } finally {
      reader.releaseLock();
    }
  }
  async function pumpLateStreams() {
    if (!lateStreamSource) return [];
    const lateStreamPumps = [];
    const reader = lateStreamSource.getReader();
    readers.push(reader);
    try {
      while (!cancelled) {
        const { done, value } = await reader.read();
        if (done) break;
        lateStreamPumps.push(pumpRawStream(value.id, value.stream));
      }
    } finally {
      reader.releaseLock();
    }
    return lateStreamPumps;
  }
  return new ReadableStream({
    async start(ctrl) {
      controller = ctrl;
      const pumps = [pumpJSON()];
      for (const [streamId, stream] of rawStreams) pumps.push(pumpRawStream(streamId, stream));
      if (lateStreamSource) pumps.push(pumpLateStreams());
      try {
        const latePumps = (await Promise.all(pumps)).find(Array.isArray);
        if (latePumps && latePumps.length > 0) await Promise.all(latePumps);
        if (!cancelled) try {
          controller.close();
        } catch {
        }
      } catch {
      }
    },
    cancel() {
      cancelled = true;
      for (const reader of readers) reader.cancel().catch(() => {
      });
      readers.length = 0;
    }
  });
}
var serovalPlugins = void 0;
var FORM_DATA_CONTENT_TYPES = ["multipart/form-data", "application/x-www-form-urlencoded"];
var MAX_PAYLOAD_SIZE = 1e6;
var handleServerAction = async ({ request, context, serverFnId }) => {
  const methodUpper = request.method.toUpperCase();
  const url = new URL(request.url);
  const action = await getServerFnById(serverFnId);
  if (action.method && methodUpper !== action.method) return new Response(`expected ${action.method} method. Got ${methodUpper}`, {
    status: 405,
    headers: { Allow: action.method }
  });
  const isServerFn = request.headers.get("x-tsr-serverFn") === "true";
  if (!serovalPlugins) serovalPlugins = getDefaultSerovalPlugins();
  const contentType = request.headers.get("Content-Type");
  function parsePayload(payload) {
    return Pu(payload, { plugins: serovalPlugins });
  }
  return await (async () => {
    try {
      let serializeResult = function(res2) {
        let nonStreamingBody = void 0;
        const alsResponse = getResponse();
        if (res2 !== void 0) {
          const rawStreams = /* @__PURE__ */ new Map();
          let initialPhase = true;
          let lateStreamWriter;
          let lateStreamReadable = void 0;
          const pendingLateStreams = [];
          const plugins = [/* @__PURE__ */ createRawStreamRPCPlugin((id, stream) => {
            if (initialPhase) {
              rawStreams.set(id, stream);
              return;
            }
            if (lateStreamWriter) {
              lateStreamWriter.write({
                id,
                stream
              }).catch(() => {
              });
              return;
            }
            pendingLateStreams.push({
              id,
              stream
            });
          }), ...serovalPlugins || []];
          let done = false;
          const callbacks = {
            onParse: (value) => {
              nonStreamingBody = value;
            },
            onDone: () => {
              done = true;
            },
            onError: (error) => {
              throw error;
            }
          };
          iu(res2, {
            refs: /* @__PURE__ */ new Map(),
            plugins,
            onParse(value) {
              callbacks.onParse(value);
            },
            onDone() {
              callbacks.onDone();
            },
            onError: (error) => {
              callbacks.onError(error);
            }
          });
          initialPhase = false;
          if (done && rawStreams.size === 0) return new Response(nonStreamingBody ? JSON.stringify(nonStreamingBody) : void 0, {
            status: alsResponse.status,
            statusText: alsResponse.statusText,
            headers: {
              "Content-Type": "application/json",
              [X_TSS_SERIALIZED]: "true"
            }
          });
          const { readable, writable } = new TransformStream();
          lateStreamReadable = readable;
          lateStreamWriter = writable.getWriter();
          for (const registration of pendingLateStreams) lateStreamWriter.write(registration).catch(() => {
          });
          pendingLateStreams.length = 0;
          const multiplexedStream = createMultiplexedStream(new ReadableStream({
            start(controller) {
              callbacks.onParse = (value) => {
                controller.enqueue(JSON.stringify(value) + "\n");
              };
              callbacks.onDone = () => {
                try {
                  controller.close();
                } catch {
                }
                lateStreamWriter?.close().catch(() => {
                }).finally(() => {
                  lateStreamWriter = void 0;
                });
              };
              callbacks.onError = (error) => {
                controller.error(error);
                lateStreamWriter?.abort(error).catch(() => {
                }).finally(() => {
                  lateStreamWriter = void 0;
                });
              };
              if (nonStreamingBody !== void 0) callbacks.onParse(nonStreamingBody);
              if (done) callbacks.onDone();
            },
            cancel() {
              lateStreamWriter?.abort().catch(() => {
              });
              lateStreamWriter = void 0;
            }
          }), rawStreams, lateStreamReadable);
          return new Response(multiplexedStream, {
            status: alsResponse.status,
            statusText: alsResponse.statusText,
            headers: {
              "Content-Type": TSS_CONTENT_TYPE_FRAMED_VERSIONED,
              [X_TSS_SERIALIZED]: "true"
            }
          });
        }
        return new Response(void 0, {
          status: alsResponse.status,
          statusText: alsResponse.statusText
        });
      };
      let res = await (async () => {
        if (FORM_DATA_CONTENT_TYPES.some((type) => contentType && contentType.includes(type))) {
          if (methodUpper === "GET") {
            if (false) ;
            invariant();
          }
          const formData = await request.formData();
          const serializedContext = formData.get(TSS_FORMDATA_CONTEXT);
          formData.delete(TSS_FORMDATA_CONTEXT);
          const params = {
            context,
            data: formData,
            method: methodUpper
          };
          if (typeof serializedContext === "string") try {
            const deserializedContext = Pu(JSON.parse(serializedContext), { plugins: serovalPlugins });
            if (typeof deserializedContext === "object" && deserializedContext) params.context = safeObjectMerge(deserializedContext, context);
          } catch (e) {
            if (false) ;
          }
          return await action(params);
        }
        if (methodUpper === "GET") {
          const payloadParam = url.searchParams.get("payload");
          if (payloadParam && payloadParam.length > MAX_PAYLOAD_SIZE) throw new Error("Payload too large");
          const payload2 = payloadParam ? parsePayload(JSON.parse(payloadParam)) : {};
          payload2.context = safeObjectMerge(payload2.context, context);
          payload2.method = methodUpper;
          return await action(payload2);
        }
        let jsonPayload;
        if (contentType?.includes("application/json")) jsonPayload = await request.json();
        const payload = jsonPayload ? parsePayload(jsonPayload) : {};
        payload.context = safeObjectMerge(payload.context, context);
        payload.method = methodUpper;
        return await action(payload);
      })();
      const unwrapped = res.result || res.error;
      if (isNotFound(res)) res = isNotFoundResponse(res);
      if (!isServerFn) return unwrapped;
      if (unwrapped instanceof Response) {
        if (isRedirect(unwrapped)) return unwrapped;
        unwrapped.headers.set(X_TSS_RAW_RESPONSE, "true");
        return unwrapped;
      }
      return serializeResult(res);
    } catch (error) {
      if (error instanceof Response) return error;
      if (isNotFound(error)) return isNotFoundResponse(error);
      console.info();
      console.info("Server Fn Error!");
      console.info();
      console.error(error);
      console.info();
      const serializedError = JSON.stringify(await Promise.resolve(su(error, {
        refs: /* @__PURE__ */ new Map(),
        plugins: serovalPlugins
      })));
      const response = getResponse();
      return new Response(serializedError, {
        status: response.status ?? 500,
        statusText: response.statusText,
        headers: {
          "Content-Type": "application/json",
          [X_TSS_SERIALIZED]: "true"
        }
      });
    }
  })();
};
function isNotFoundResponse(error) {
  const { headers, ...rest } = error;
  return new Response(JSON.stringify(rest), {
    status: 404,
    headers: {
      "Content-Type": "application/json",
      ...headers || {}
    }
  });
}
var LINK_PARAM_TOKEN_RE = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
var PRELOAD_AS_VALUES = /* @__PURE__ */ new Set([
  "fetch",
  "font",
  "image",
  "script",
  "style",
  "track"
]);
function buildLinkParam(name, value) {
  if (value === void 0) return name;
  if (LINK_PARAM_TOKEN_RE.test(value)) return `${name}=${value}`;
  return `${name}=${JSON.stringify(value)}`;
}
function serializeEarlyHint(hint) {
  const parts = [`<${hint.href}>`, buildLinkParam("rel", hint.rel)];
  if (hint.as) parts.push(buildLinkParam("as", hint.as));
  if (hint.crossOrigin !== void 0) parts.push(buildLinkParam("crossorigin", hint.crossOrigin || void 0));
  if (hint.type) parts.push(buildLinkParam("type", hint.type));
  if (hint.integrity) parts.push(buildLinkParam("integrity", hint.integrity));
  if (hint.referrerPolicy) parts.push(buildLinkParam("referrerpolicy", hint.referrerPolicy));
  if (hint.fetchPriority) parts.push(buildLinkParam("fetchpriority", hint.fetchPriority));
  return parts.join("; ");
}
function getStringAttr(attrs, name, fallbackName) {
  const value = attrs?.[name] ?? (fallbackName ? attrs?.[fallbackName] : void 0);
  return typeof value === "string" ? value : void 0;
}
function getPreloadAs(attrs) {
  const as = getStringAttr(attrs, "as");
  return as && PRELOAD_AS_VALUES.has(as) ? as : void 0;
}
function addEarlyHintFetchAttrs(hint, attrs) {
  const crossOrigin = getStringAttr(attrs, "crossOrigin", "crossorigin");
  const type = getStringAttr(attrs, "type");
  const integrity = getStringAttr(attrs, "integrity");
  const referrerPolicy = getStringAttr(attrs, "referrerPolicy", "referrerpolicy");
  const fetchPriority = getStringAttr(attrs, "fetchPriority", "fetchpriority");
  if (crossOrigin !== void 0) hint.crossOrigin = crossOrigin;
  if (type) hint.type = type;
  if (integrity) hint.integrity = integrity;
  if (referrerPolicy) hint.referrerPolicy = referrerPolicy;
  if (fetchPriority) hint.fetchPriority = fetchPriority;
}
function linkAttrsToEarlyHint(attrs) {
  const href = getStringAttr(attrs, "href");
  const rel = getStringAttr(attrs, "rel");
  if (!href || !rel) return void 0;
  const relTokens = rel.split(/\s+/);
  let hintRel;
  let hintAs;
  if (relTokens.includes("modulepreload")) {
    hintRel = "modulepreload";
    hintAs = "script";
  } else if (relTokens.includes("stylesheet")) {
    hintRel = "preload";
    hintAs = "style";
  } else if (relTokens.includes("preload")) {
    hintAs = getPreloadAs(attrs);
    if (!hintAs) return void 0;
    hintRel = "preload";
  } else if (relTokens.includes("preconnect")) {
    hintRel = "preconnect";
    hintAs = void 0;
  } else if (relTokens.includes("dns-prefetch")) {
    hintRel = "dns-prefetch";
    hintAs = void 0;
  }
  if (!hintRel) return void 0;
  const hint = {
    href,
    rel: hintRel
  };
  if (hintAs) hint.as = hintAs;
  addEarlyHintFetchAttrs(hint, attrs);
  return hint;
}
function collectStaticHintsFromManifest(manifest2, matchedRoutes) {
  const hints = [];
  for (const route of matchedRoutes) {
    const routeManifest = manifest2.routes[route.id];
    if (!routeManifest) continue;
    for (const link of routeManifest.preloads ?? []) {
      const attrs = getScriptPreloadAttrs(manifest2, link);
      const hint = {
        href: attrs.href,
        rel: attrs.rel,
        as: "script"
      };
      if (attrs.crossOrigin !== void 0) hint.crossOrigin = attrs.crossOrigin;
      hints.push(hint);
    }
    for (const link of routeManifest.css ?? []) {
      const stylesheetHref = getStylesheetHref(link);
      if (manifest2.inlineCss?.styles[stylesheetHref] !== void 0) continue;
      const resolvedLink = resolveManifestCssLink(link);
      const hint = {
        href: stylesheetHref,
        rel: "preload",
        as: "style"
      };
      if (resolvedLink.crossOrigin !== void 0) hint.crossOrigin = resolvedLink.crossOrigin;
      hints.push(hint);
    }
  }
  return hints;
}
function collectDynamicHintsFromMatches(matches) {
  const hints = [];
  for (const match of matches) {
    const links = match.links;
    if (!Array.isArray(links)) continue;
    for (const link of links) {
      const hint = linkAttrsToEarlyHint(link);
      if (hint) hints.push(hint);
    }
  }
  return hints;
}
function createEarlyHintsEvent(opts) {
  const nextHints = [];
  const nextLinks = [];
  for (const hint of opts.hints) {
    const link = serializeEarlyHint(hint);
    if (opts.sentLinks.has(link)) continue;
    opts.sentLinks.add(link);
    opts.sentHints.push(hint);
    nextHints.push(hint);
    nextLinks.push(link);
  }
  if (!nextHints.length && opts.phase !== "dynamic") return void 0;
  return {
    phase: opts.phase,
    hints: nextHints,
    links: nextLinks,
    allHints: opts.sentHints.slice(),
    allLinks: Array.from(opts.sentLinks)
  };
}
function createResponseLinkHeaderEntries(opts) {
  for (const hint of opts.hints) {
    const link = serializeEarlyHint(hint);
    if (opts.sentLinks.has(link)) continue;
    opts.sentLinks.add(link);
    opts.entries.push({
      phase: opts.phase,
      hint,
      link
    });
  }
}
function getResponseLinkHeaderEntries(opts) {
  if (!opts.filter) return opts.entries.map((entry) => entry.link);
  try {
    const links = [];
    for (const entry of opts.entries) if (opts.filter(entry)) links.push(entry.link);
    return links;
  } catch (err) {
    console.error("Error filtering response Link headers:", err);
    return [];
  }
}
function notifyEarlyHints(phase, event, onEarlyHints) {
  try {
    const result = onEarlyHints(event);
    if (result) Promise.resolve(result).catch((err) => {
      console.error(`Error sending ${phase} early hints:`, err);
    });
  } catch (err) {
    console.error(`Error sending ${phase} early hints:`, err);
  }
}
function getResponseLinkHeaderFilter(responseLinkHeader) {
  if (typeof responseLinkHeader !== "object") return;
  return responseLinkHeader.filter;
}
function appendResponseLinkHeaders(opts) {
  for (const link of getResponseLinkHeaderEntries(opts)) opts.responseHeaders.append("Link", link);
}
function collectResponseLinkHeaderEntries(opts) {
  for (let index = 0; index < opts.event.hints.length; index++) opts.entries.push({
    phase: opts.phase,
    hint: opts.event.hints[index],
    link: opts.event.links[index]
  });
}
function collectEarlyHintsPhase(opts) {
  const event = opts.onEarlyHints ? createEarlyHintsEvent({
    phase: opts.phase,
    hints: opts.hints,
    sentLinks: opts.sentLinks,
    sentHints: opts.sentHints
  }) : void 0;
  if (event) notifyEarlyHints(opts.phase, event, opts.onEarlyHints);
  if (!opts.responseLinkHeaderEntries) return;
  if (event) {
    collectResponseLinkHeaderEntries({
      phase: opts.phase,
      event,
      entries: opts.responseLinkHeaderEntries
    });
    return;
  }
  createResponseLinkHeaderEntries({
    phase: opts.phase,
    hints: opts.hints,
    sentLinks: opts.sentLinks,
    entries: opts.responseLinkHeaderEntries
  });
}
function createEarlyHintsCollector(opts) {
  if (!opts?.onEarlyHints && !opts?.responseLinkHeader) return;
  const sentLinks = /* @__PURE__ */ new Set();
  const sentHints = opts.onEarlyHints ? new Array() : void 0;
  const responseLinkHeaderEntries = opts.responseLinkHeader ? new Array() : void 0;
  const responseLinkHeaderFilter = getResponseLinkHeaderFilter(opts.responseLinkHeader);
  return {
    collectStatic: ({ manifest: manifest2, matchedRoutes }) => {
      if (!matchedRoutes?.length) return;
      collectEarlyHintsPhase({
        phase: "static",
        hints: collectStaticHintsFromManifest(manifest2, matchedRoutes),
        sentLinks,
        sentHints,
        onEarlyHints: opts.onEarlyHints,
        responseLinkHeaderEntries
      });
    },
    collectDynamic: (matches) => {
      collectEarlyHintsPhase({
        phase: "dynamic",
        hints: collectDynamicHintsFromMatches(matches),
        sentLinks,
        sentHints,
        onEarlyHints: opts.onEarlyHints,
        responseLinkHeaderEntries
      });
    },
    appendResponseHeaders: (headers) => {
      if (!responseLinkHeaderEntries?.length) return;
      appendResponseLinkHeaders({
        responseHeaders: headers,
        entries: responseLinkHeaderEntries,
        filter: responseLinkHeaderFilter
      });
    }
  };
}
function normalizeTransformAssetResult(result) {
  if (typeof result === "string") return { href: result };
  return result;
}
function escapeCssString(value) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\a ").replace(/\r/g, "\\d ").replace(/\f/g, "\\c ");
}
async function transformInlineCssTemplate(options) {
  const { strings, urls } = options.template;
  if (strings.length !== urls.length + 1) throw new Error(`TanStack Start inlineCss template for ${options.stylesheetHref} is invalid`);
  let css = strings[0];
  for (let index = 0; index < urls.length; index++) {
    const transformed = normalizeTransformAssetResult(await options.transformFn({
      kind: "css-url",
      url: urls[index],
      stylesheetHref: options.stylesheetHref
    }));
    css += escapeCssString(transformed.href) + strings[index + 1];
  }
  return css;
}
async function transformInlineCssStyles(inlineCss, transformFn) {
  const transformedStyles = {};
  const transformedEntries = await Promise.all(Object.entries(inlineCss.styles).map(async ([stylesheetHref, css]) => {
    const template = inlineCss.templates?.[stylesheetHref];
    return [stylesheetHref, template ? await transformInlineCssTemplate({
      stylesheetHref,
      template,
      transformFn
    }) : css];
  }));
  for (const [stylesheetHref, css] of transformedEntries) transformedStyles[stylesheetHref] = css;
  return {
    styles: transformedStyles,
    ...inlineCss.templates ? { templates: inlineCss.templates } : {}
  };
}
function resolveTransformAssetsCrossOrigin(config, kind) {
  if (!config) return void 0;
  if (typeof config === "string") return config;
  return config[kind];
}
function isObjectShorthand(transform) {
  return "prefix" in transform;
}
function resolveTransformAssetsConfig(transform) {
  if (typeof transform === "string") {
    const prefix = transform;
    return {
      type: "transform",
      transformFn: ({ url }) => ({ href: `${prefix}${url}` }),
      cache: true
    };
  }
  if (typeof transform === "function") return {
    type: "transform",
    transformFn: transform,
    cache: true
  };
  if (isObjectShorthand(transform)) {
    const { prefix, crossOrigin } = transform;
    return {
      type: "transform",
      transformFn: ({ url, kind }) => {
        const href = `${prefix}${url}`;
        if (kind === "css-url") return { href };
        const co2 = resolveTransformAssetsCrossOrigin(crossOrigin, kind);
        return co2 ? {
          href,
          crossOrigin: co2
        } : { href };
      },
      cache: true
    };
  }
  if ("createTransform" in transform && transform.createTransform) return {
    type: "createTransform",
    createTransform: transform.createTransform,
    cache: transform.cache !== false
  };
  return {
    type: "transform",
    transformFn: typeof transform.transform === "string" ? (({ url }) => ({ href: `${transform.transform}${url}` })) : transform.transform,
    cache: transform.cache !== false
  };
}
function assignManifestLink(link, next) {
  if (typeof link === "string") return next.crossOrigin ? next : next.href;
  const nextLink = {
    ...link,
    href: next.href
  };
  if (next.crossOrigin) nextLink.crossOrigin = next.crossOrigin;
  else delete nextLink.crossOrigin;
  return nextLink;
}
async function transformManifestAssets(source, transformFn, _opts) {
  const manifest2 = structuredClone(source);
  const inlineCssEnabled = _opts?.inlineCss !== false;
  const scriptTransforms = /* @__PURE__ */ new Map();
  const transformScript = (url) => {
    const cached = scriptTransforms.get(url);
    if (cached) return cached;
    const transformed = Promise.resolve(transformFn({
      url,
      kind: "script"
    })).then(normalizeTransformAssetResult);
    scriptTransforms.set(url, transformed);
    return transformed;
  };
  if (!inlineCssEnabled) delete manifest2.inlineCss;
  else if (manifest2.inlineCss) manifest2.inlineCss = await transformInlineCssStyles(manifest2.inlineCss, transformFn);
  for (const route of Object.values(manifest2.routes)) {
    if (route.preloads?.length) route.preloads = await Promise.all(route.preloads.map(async (link) => {
      const result = await transformScript(resolveManifestAssetLink(link).href);
      return assignManifestLink(link, {
        href: result.href,
        crossOrigin: result.crossOrigin
      });
    }));
    if (route.css?.length && !manifest2.inlineCss) route.css = await Promise.all(route.css.map(async (link) => {
      const result = normalizeTransformAssetResult(await transformFn({
        url: resolveManifestCssLink(link).href,
        kind: "stylesheet"
      }));
      return assignManifestLink(link, {
        href: result.href,
        crossOrigin: result.crossOrigin
      });
    }));
    if (route.scripts?.length) for (const script of route.scripts) {
      const src = script.attrs?.src;
      if (typeof src !== "string") continue;
      const result = await transformScript(src);
      script.attrs = {
        ...script.attrs,
        src: result.href
      };
      if (result.crossOrigin) script.attrs.crossOrigin = result.crossOrigin;
      else delete script.attrs.crossOrigin;
    }
  }
  return manifest2;
}
function buildManifest(source, opts) {
  return {
    ...source.scriptFormat ? { scriptFormat: source.scriptFormat } : {},
    ...opts?.inlineCss !== false && source.inlineCss ? { inlineCss: structuredClone(source.inlineCss) } : {},
    routes: { ...source.routes }
  };
}
function getStaticHandlerInlineCssDefault(handlerInlineCss) {
  if (typeof handlerInlineCss === "function") return;
  return handlerInlineCss ?? true;
}
async function resolveInlineCssForRequest(opts) {
  if (opts.requestInlineCss !== void 0) return opts.requestInlineCss;
  if (typeof opts.handlerInlineCss === "function") return await opts.handlerInlineCss({ request: opts.request });
  return opts.handlerInlineCss ?? true;
}
function createCachedBaseManifestLoader(loadBaseManifest) {
  let baseManifestPromise;
  return () => {
    if (!baseManifestPromise) baseManifestPromise = loadBaseManifest().catch((error) => {
      baseManifestPromise = void 0;
      throw error;
    });
    return baseManifestPromise;
  };
}
function createFinalManifestTransformResolver(transformAssets, opts) {
  const transformConfig = transformAssets !== void 0 ? resolveTransformAssetsConfig(transformAssets) : void 0;
  const cache = transformConfig ? transformConfig.cache : true;
  const warmup = !!transformAssets && typeof transformAssets === "object" && "warmup" in transformAssets && transformAssets.warmup === true;
  let cachedCreateTransformPromise;
  const clearCachedCreateTransform = () => {
    cachedCreateTransformPromise = void 0;
  };
  return {
    cache,
    warmup,
    clearCachedCreateTransform,
    getTransformFn: async (ctx) => {
      if (!transformConfig) return void 0;
      if (transformConfig.type !== "createTransform") return transformConfig.transformFn;
      if (!cache || false) return transformConfig.createTransform(ctx);
      if (!cachedCreateTransformPromise) cachedCreateTransformPromise = Promise.resolve(transformConfig.createTransform(ctx)).catch((error) => {
        clearCachedCreateTransform();
        throw error;
      });
      return cachedCreateTransformPromise;
    }
  };
}
function createFinalManifestResolver(opts) {
  const finalManifestCache = /* @__PURE__ */ new Map();
  const transformResolver = createFinalManifestTransformResolver(opts.transformAssets);
  const handlerDefaultInlineCss = getStaticHandlerInlineCssDefault(opts.inlineCss);
  const getRequestManifestOptions = async (requestOpts) => {
    const transformFn = await transformResolver.getTransformFn({
      warmup: false,
      request: requestOpts.request
    });
    const inlineCss = await resolveInlineCssForRequest({
      request: requestOpts.request,
      handlerInlineCss: opts.inlineCss,
      requestInlineCss: requestOpts.requestInlineCss
    });
    return {
      getBaseManifest: requestOpts.getBaseManifest,
      transformFn,
      cache: transformResolver.cache,
      inlineCss
    };
  };
  const resolveRequest = async (requestOpts, cache) => {
    return resolveFinalManifest({
      ...await getRequestManifestOptions(requestOpts),
      finalManifestCache: cache
    });
  };
  return {
    warmup: ({ getBaseManifest: getBaseManifest2 }) => warmupFinalManifest({
      enabled: transformResolver.warmup,
      handlerDefaultInlineCss,
      cache: transformResolver.cache,
      finalManifestCache,
      getBaseManifest: getBaseManifest2,
      getTransformFn: () => transformResolver.getTransformFn({ warmup: true }),
      onError: transformResolver.clearCachedCreateTransform
    }),
    resolveCached: (requestOpts) => resolveRequest(requestOpts, finalManifestCache),
    resolveUncached: (requestOpts) => resolveRequest(requestOpts, void 0)
  };
}
function getFinalManifestCacheKey(inlineCss) {
  return inlineCss ? "inline-css" : "linked-css";
}
function cacheFinalManifestPromise(cachedFinalManifestPromises, cacheKey, promise) {
  const cachedFinalManifestPromise = promise.catch((error) => {
    if (cachedFinalManifestPromises.get(cacheKey) === cachedFinalManifestPromise) cachedFinalManifestPromises.delete(cacheKey);
    throw error;
  });
  cachedFinalManifestPromises.set(cacheKey, cachedFinalManifestPromise);
  return cachedFinalManifestPromise;
}
function getOrCreateCachedFinalManifestPromise(cachedFinalManifestPromises, cacheKey, computeFinalManifest) {
  const cachedFinalManifestPromise = cachedFinalManifestPromises.get(cacheKey);
  if (cachedFinalManifestPromise) return cachedFinalManifestPromise;
  return cacheFinalManifestPromise(cachedFinalManifestPromises, cacheKey, Promise.resolve().then(computeFinalManifest));
}
async function buildFinalManifest(opts) {
  return opts.transformFn ? await transformManifestAssets(opts.base, opts.transformFn, { inlineCss: opts.inlineCss }) : buildManifest(opts.base, { inlineCss: opts.inlineCss });
}
async function resolveFinalManifest(opts) {
  const computeFinalManifest = async () => {
    return buildFinalManifest({
      base: await opts.getBaseManifest(),
      transformFn: opts.transformFn,
      inlineCss: opts.inlineCss
    });
  };
  if (opts.finalManifestCache && (!opts.transformFn || opts.cache)) return getOrCreateCachedFinalManifestPromise(opts.finalManifestCache, getFinalManifestCacheKey(opts.inlineCss), computeFinalManifest);
  return computeFinalManifest();
}
function warmupFinalManifest(opts) {
  if (!opts.enabled || opts.handlerDefaultInlineCss === void 0 || !opts.cache) return;
  const inlineCss = opts.handlerDefaultInlineCss;
  const warmupPromise = getOrCreateCachedFinalManifestPromise(opts.finalManifestCache, getFinalManifestCacheKey(inlineCss), async () => {
    const [base, transformFn] = await Promise.all([opts.getBaseManifest(), opts.getTransformFn()]);
    return buildFinalManifest({
      base,
      transformFn,
      inlineCss
    });
  });
  if (opts.onError) warmupPromise.catch(opts.onError);
  return warmupPromise;
}
var ServerFunctionSerializationAdapter = createSerializationAdapter({
  key: "$TSS/serverfn",
  test: (v2) => {
    if (typeof v2 !== "function") return false;
    if (!(TSS_SERVER_FUNCTION in v2)) return false;
    return !!v2[TSS_SERVER_FUNCTION];
  },
  toSerializable: ({ serverFnMeta }) => ({ functionId: serverFnMeta.id }),
  fromSerializable: ({ functionId }) => {
    const fn2 = async (opts, signal) => {
      return (await (await getServerFnById(functionId))(opts ?? {}, signal)).result;
    };
    return fn2;
  }
});
function getStartResponseHeaders(opts) {
  return mergeHeaders({ "Content-Type": "text/html; charset=utf-8" }, ...opts.router.stores.matches.get().map((match) => {
    return match.headers;
  }));
}
var entriesPromise;
var hasWarnedMissingCsrfMiddleware = false;
var defaultCsrfMiddleware = createCsrfMiddleware({ filter: (ctx) => ctx.handlerType === "serverFn" });
var getCachedBaseManifest = createCachedBaseManifestLoader(() => getStartManifest());
var getProdBaseManifest = () => getCachedBaseManifest();
var getBaseManifest = getProdBaseManifest;
var createEarlyHintsForRequest = createEarlyHintsCollector;
async function loadEntries() {
  const [routerEntry, startEntry, pluginAdapters] = await Promise.all([
    import("./assets/router-vb7i5euz.js").then((n2) => n2.b9),
    import("./assets/start-Crw2f3c2.js"),
    import("./assets/empty-plugin-adapters-BFgPZ6_d.js")
  ]);
  return {
    routerEntry,
    startEntry,
    pluginAdapters
  };
}
function getEntries() {
  if (!entriesPromise) entriesPromise = loadEntries();
  return entriesPromise;
}
function warnMissingCsrfMiddlewareOnce() {
  if (hasWarnedMissingCsrfMiddleware) return;
  hasWarnedMissingCsrfMiddleware = true;
  console.warn(`TanStack Start server functions are not protected by the CSRF middleware.

Server functions are same-origin RPC endpoints and should be protected from cross-site requests.

Add the CSRF middleware in src/start.ts:

  const csrfMiddleware = createCsrfMiddleware({
    filter: (ctx) => ctx.handlerType === 'serverFn',
  })

  export const startInstance = createStart(() => ({
    requestMiddleware: [csrfMiddleware],
  }))

If you intentionally handle CSRF another way, disable this warning:

  tanstackStart({
    serverFns: {
      disableCsrfMiddlewareWarning: true,
    },
  })`);
}
var ROUTER_BASEPATH = "/";
var SERVER_FN_BASE = "/_serverFn/";
var IS_PRERENDERING = process.env.TSS_PRERENDERING === "true";
var IS_SHELL_ENV = process.env.TSS_SHELL === "true";
var ERR_NO_RESPONSE = "Internal Server Error";
var ERR_NO_DEFER = "Internal Server Error";
function throwRouteHandlerError() {
  throw new Error(ERR_NO_RESPONSE);
}
function throwIfMayNotDefer() {
  throw new Error(ERR_NO_DEFER);
}
function isSpecialResponse(value) {
  return value instanceof Response || isRedirect(value);
}
function handleCtxResult(result) {
  if (isSsrResponse(result) || isSpecialResponse(result)) return { response: result };
  return result;
}
async function executeMiddleware(middlewares, ctx) {
  let index = -1;
  let streamResponse;
  const setResponse = (response) => {
    if (isSsrResponse(response)) {
      if (response.serverSsrCleanup === "stream") streamResponse = response;
      ctx.response = response.response;
      return;
    }
    ctx.response = response;
  };
  const disposeStreamResponse = async (reason) => {
    const response = streamResponse;
    if (!response) return;
    streamResponse = void 0;
    const currentResponse = ctx.response;
    if (currentResponse === response.response || currentResponse instanceof Response && response.response.body !== null && currentResponse.body === response.response.body) ctx.response = void 0;
    await response.dispose(reason);
  };
  const getFinalResponse = async () => {
    const response = ctx.response;
    if (!response) throwRouteHandlerError();
    if (!streamResponse) return response;
    if (response === streamResponse.response) return streamResponse;
    if (streamResponse.response.body !== null && response.body === streamResponse.response.body) return {
      ...streamResponse,
      response
    };
    await disposeStreamResponse("middleware response replaced");
    return response;
  };
  const next = async (nextCtx) => {
    if (nextCtx) {
      if (nextCtx.context) ctx.context = safeObjectMerge(ctx.context, nextCtx.context);
      for (const key of Object.keys(nextCtx)) if (key === "response") setResponse(nextCtx.response);
      else if (key !== "context") ctx[key] = nextCtx[key];
    }
    index++;
    const middleware = middlewares[index];
    if (!middleware) return ctx;
    let result;
    try {
      result = await middleware({
        ...ctx,
        next
      });
    } catch (err) {
      if (isSpecialResponse(err)) {
        setResponse(err);
        return ctx;
      }
      await disposeStreamResponse("middleware error");
      throw err;
    }
    const normalized = handleCtxResult(result);
    if (normalized) {
      if (normalized.response !== void 0) setResponse(normalized.response);
      if (normalized.context) ctx.context = safeObjectMerge(ctx.context, normalized.context);
    }
    return ctx;
  };
  await next();
  return {
    ctx,
    response: await getFinalResponse()
  };
}
function handlerToMiddleware(handler, mayDefer = false) {
  if (mayDefer) return handler;
  return async (ctx) => {
    const response = await handler({
      ...ctx,
      next: throwIfMayNotDefer
    });
    if (!response) throwRouteHandlerError();
    return response;
  };
}
function createStartHandler(cbOrOptions) {
  const handlerOptions = typeof cbOrOptions === "function" ? {} : cbOrOptions;
  const cb = typeof cbOrOptions === "function" ? cbOrOptions : cbOrOptions.handler;
  const finalManifestResolver = createFinalManifestResolver({
    ...handlerOptions
  });
  const resolveManifestForRequest = finalManifestResolver.resolveCached;
  finalManifestResolver.warmup({ getBaseManifest: () => getBaseManifest() });
  const startRequestResolver = async (request, requestOpts) => {
    let router = null;
    let responseOwnsCleanup = false;
    try {
      const { url, handledProtocolRelativeURL } = getNormalizedURL(request.url);
      const href = url.pathname + url.search + url.hash;
      const origin = getOrigin(request);
      if (handledProtocolRelativeURL) return Response.redirect(url, 308);
      const entries = await getEntries();
      const hasStartInstance = !!entries.startEntry.startInstance;
      const startOptions = await entries.startEntry.startInstance?.getOptions() || {};
      const { hasPluginAdapters, pluginSerializationAdapters } = entries.pluginAdapters;
      const serializationAdapters = [
        ...startOptions.serializationAdapters || [],
        ...hasPluginAdapters ? pluginSerializationAdapters : [],
        ServerFunctionSerializationAdapter
      ];
      const requestStartOptions = {
        ...startOptions,
        requestMiddleware: hasStartInstance ? startOptions.requestMiddleware : [defaultCsrfMiddleware],
        serializationAdapters
      };
      const flattenedRequestMiddlewares = requestStartOptions.requestMiddleware ? flattenMiddlewares(requestStartOptions.requestMiddleware) : [];
      const executedRequestMiddlewares = new Set(flattenedRequestMiddlewares);
      const getRouter = async () => {
        if (router) return router;
        router = await entries.routerEntry.getRouter();
        let isShell = IS_SHELL_ENV;
        if (IS_PRERENDERING && !isShell) isShell = request.headers.get(HEADERS.TSS_SHELL) === "true";
        const history = createMemoryHistory({ initialEntries: [href] });
        router.update({
          history,
          isShell,
          isPrerendering: IS_PRERENDERING,
          origin: router.options.origin ?? origin,
          defaultSsr: requestStartOptions.defaultSsr,
          serializationAdapters: [...requestStartOptions.serializationAdapters, ...router.options.serializationAdapters || []],
          basepath: ROUTER_BASEPATH
        });
        return router;
      };
      if (SERVER_FN_BASE && url.pathname.startsWith(SERVER_FN_BASE)) {
        if (false) ;
        const serverFnId = url.pathname.slice(SERVER_FN_BASE.length).split("/")[0];
        if (!serverFnId) throw new Error("Invalid server action param for serverFnId");
        const serverFnHandler = async ({ context }) => {
          return runWithStartContext({
            getRouter,
            startOptions: requestStartOptions,
            contextAfterGlobalMiddlewares: context,
            request,
            executedRequestMiddlewares,
            handlerType: "serverFn"
          }, () => handleServerAction({
            request,
            context: requestOpts?.context,
            serverFnId
          }));
        };
        const { response: middlewareResponse2 } = await executeMiddleware([...flattenedRequestMiddlewares.map((d) => d.options.server), serverFnHandler], {
          request,
          pathname: url.pathname,
          handlerType: "serverFn",
          context: createNullProtoObject(requestOpts?.context)
        });
        const result = await handleRedirectResponse(middlewareResponse2, request, getRouter);
        responseOwnsCleanup = result.serverSsrCleanup === "stream";
        return result.response;
      }
      const executeRouter = async (serverContext, matchedRoutes) => {
        const acceptParts = (request.headers.get("Accept") || "*/*").split(",");
        if (!["*/*", "text/html"].some((mimeType) => acceptParts.some((part) => part.trim().startsWith(mimeType)))) return normalizeSsrResponse(Response.json({ error: "Only HTML requests are supported here" }, { status: 500 }));
        const manifest2 = await resolveManifestForRequest({
          request,
          requestInlineCss: requestOpts?.inlineCss,
          getBaseManifest: () => getBaseManifest(matchedRoutes)
        });
        const earlyHints = createEarlyHintsForRequest({
          onEarlyHints: requestOpts?.onEarlyHints,
          responseLinkHeader: requestOpts?.responseLinkHeader
        });
        earlyHints?.collectStatic({
          manifest: manifest2,
          matchedRoutes
        });
        const routerInstance = await getRouter();
        attachRouterServerSsrUtils({
          router: routerInstance,
          manifest: manifest2,
          getRequestAssets: () => getStartContext({ throwIfNotFound: false })?.requestAssets
        });
        routerInstance.options.additionalContext = { serverContext };
        await routerInstance.load();
        if (routerInstance.state.redirect) return normalizeSsrResponse(routerInstance.state.redirect);
        earlyHints?.collectDynamic(routerInstance.stores.matches.get());
        const ctx = getStartContext({ throwIfNotFound: false });
        await routerInstance.serverSsr.dehydrate({ requestAssets: ctx?.requestAssets });
        const responseHeaders = getStartResponseHeaders({ router: routerInstance });
        earlyHints?.appendResponseHeaders(responseHeaders);
        return normalizeSsrResponse(await cb({
          request,
          router: routerInstance,
          responseHeaders
        }));
      };
      const requestHandlerMiddleware = async ({ context }) => {
        return runWithStartContext({
          getRouter,
          startOptions: requestStartOptions,
          contextAfterGlobalMiddlewares: context,
          request,
          executedRequestMiddlewares,
          handlerType: "router"
        }, async () => {
          try {
            return await handleServerRoutes({
              getRouter,
              request,
              url,
              executeRouter,
              context,
              executedRequestMiddlewares
            });
          } catch (err) {
            if (err instanceof Response) return err;
            throw err;
          }
        });
      };
      const { response: middlewareResponse } = await executeMiddleware([...flattenedRequestMiddlewares.map((d) => d.options.server), requestHandlerMiddleware], {
        request,
        pathname: url.pathname,
        handlerType: "router",
        context: createNullProtoObject(requestOpts?.context)
      });
      const response = await handleRedirectResponse(middlewareResponse, request, getRouter);
      responseOwnsCleanup = response.serverSsrCleanup === "stream";
      return response.response;
    } finally {
      if (router?.serverSsr && !responseOwnsCleanup) router.serverSsr.cleanup();
      router = null;
    }
  };
  return requestHandler(startRequestResolver);
}
async function handleRedirectResponse(response, request, getRouter) {
  const ssrResponse = normalizeSsrResponse(response);
  if (!isRedirect(ssrResponse.response)) return ssrResponse;
  if (isResolvedRedirect(ssrResponse.response)) {
    if (request.headers.get("x-tsr-serverFn") === "true") return replaceSsrResponse(ssrResponse, Response.json({
      ...ssrResponse.response.options,
      isSerializedRedirect: true
    }, { headers: ssrResponse.response.headers }), "redirect response replaced");
    return ssrResponse;
  }
  const opts = ssrResponse.response.options;
  if (opts.to && typeof opts.to === "string" && !opts.to.startsWith("/")) throw new Error(`Server side redirects must use absolute paths via the 'href' or 'to' options. The redirect() method's "to" property accepts an internal path only. Use the "href" property to provide an external URL. Received: ${JSON.stringify(opts)}`);
  if ([
    "params",
    "search",
    "hash"
  ].some((d) => typeof opts[d] === "function")) throw new Error(`Server side redirects must use static search, params, and hash values and do not support functional values. Received functional values for: ${Object.keys(opts).filter((d) => typeof opts[d] === "function").map((d) => `"${d}"`).join(", ")}`);
  const redirect2 = (await getRouter()).resolveRedirect(ssrResponse.response);
  if (request.headers.get("x-tsr-serverFn") === "true") return replaceSsrResponse(ssrResponse, Response.json({
    ...ssrResponse.response.options,
    isSerializedRedirect: true
  }, { headers: ssrResponse.response.headers }), "redirect response replaced");
  return replaceSsrResponse(ssrResponse, redirect2, "redirect response replaced");
}
async function handleServerRoutes({ getRouter, request, url, executeRouter, context, executedRequestMiddlewares }) {
  const router = await getRouter();
  const pathname = executeRewriteInput(router.rewrite, url).pathname;
  const { matchedRoutes, foundRoute, routeParams } = router.getMatchedRoutes(pathname);
  const isExactMatch = foundRoute && routeParams["**"] === void 0;
  const routeMiddlewares = [];
  for (const route of matchedRoutes) {
    const serverMiddleware = route.options.server?.middleware;
    if (serverMiddleware) {
      const flattened = flattenMiddlewares(serverMiddleware);
      for (const m2 of flattened) if (!executedRequestMiddlewares.has(m2)) routeMiddlewares.push(m2.options.server);
    }
  }
  const server2 = foundRoute?.options.server;
  let isHeadFallback = false;
  if (server2?.handlers && isExactMatch) {
    const handlers = typeof server2.handlers === "function" ? server2.handlers({ createHandlers: (d) => d }) : server2.handlers;
    const requestMethod = request.method.toUpperCase();
    const handler = requestMethod === "HEAD" ? handlers["HEAD"] ?? handlers["GET"] ?? handlers["ANY"] : handlers[requestMethod] ?? handlers["ANY"];
    isHeadFallback = requestMethod === "HEAD" && handler !== void 0 && !handlers["HEAD"];
    if (handler) {
      const mayDefer = !!foundRoute.options.component;
      if (typeof handler === "function") routeMiddlewares.push(handlerToMiddleware(handler, mayDefer));
      else {
        if (handler.middleware?.length) {
          const handlerMiddlewares = flattenMiddlewares(handler.middleware);
          for (const m2 of handlerMiddlewares) routeMiddlewares.push(m2.options.server);
        }
        if (handler.handler) routeMiddlewares.push(handlerToMiddleware(handler.handler, mayDefer));
      }
    }
  }
  routeMiddlewares.push(((ctx2) => executeRouter(ctx2.context, matchedRoutes)));
  const { ctx, response } = await executeMiddleware(routeMiddlewares, {
    request,
    context,
    params: routeParams,
    pathname,
    handlerType: "router"
  });
  if (isHeadFallback) {
    if (!ctx.response) throwRouteHandlerError();
    return stripSsrResponseBody(await handleRedirectResponse(response, request, getRouter), "HEAD body stripped");
  }
  return normalizeSsrResponse(response);
}
const fetch$1 = createStartHandler(defaultStreamHandler);
function createServerEntry(entry) {
  return {
    async fetch(...args) {
      return await entry.fetch(...args);
    }
  };
}
const server = createServerEntry({ fetch: fetch$1 });
export {
  ClientOnly as $,
  buildRouteBranch as A,
  interpolatePath as B,
  nullReplaceEqualDeep as C,
  DEFAULT_PROTOCOL_ALLOWLIST as D,
  replaceEqualDeep as E,
  last as F,
  decodePath as G,
  findFlatMatch as H,
  findRouteMatch as I,
  hasKeys as J,
  executeRewriteOutput as K,
  encodePathLikeUrl as L,
  trimPathLeft as M,
  joinPaths as N,
  useRouter as O,
  exactPathTest as P,
  removeTrailingSlash as Q,
  jsxRuntimeExports as R,
  React as S,
  isModuleNotFoundError as T,
  useHydrated as U,
  escapeHtml as V,
  getAssetCrossOrigin as W,
  getScriptPreloadAttrs as X,
  appendUniqueUserTags as Y,
  resolveManifestCssLink as Z,
  createServerFn as _,
  isRedirect as a,
  getDefaultExportFromCjs as a0,
  useMatches as a1,
  notFound as a2,
  createMiddleware as a3,
  getRequest as a4,
  useSession as a5,
  setCookie as a6,
  requireReact as a7,
  React$1 as a8,
  commonjsGlobal as a9,
  dummyMatchContext as aa,
  matchContext as ab,
  TSS_SERVER_FUNCTION as ac,
  getServerFnById as ad,
  Outlet as ae,
  ErrorComponent as af,
  isNotFound as b,
  invariant as c,
  createServerEntry,
  createControlledPromise as d,
  server as default,
  rootRouteId as e,
  isServer as f,
  functionalUpdate as g,
  arraysEqual as h,
  isPromise as i,
  createLRUCache as j,
  compileDecodeCharMap as k,
  rewriteBasepath as l,
  composeRewrites as m,
  processRouteMasks as n,
  resolvePath as o,
  processRouteTree as p,
  cleanPath as q,
  reactExports as r,
  trimPathRight as s,
  trimPath as t,
  parseHref as u,
  executeRewriteInput as v,
  isDangerousProtocol as w,
  redirect as x,
  findSingleMatch as y,
  deepEqual as z
};
