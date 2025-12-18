import { a7 as requireReact, r as reactExports, R as jsxRuntimeExports } from "../server.js";
import { u as useTranslation, s as Trans, e as Icon, d as cn, f as cva } from "./format-NPGUXq-g.js";
var dist$1 = { exports: {} };
var dist = dist$1.exports;
var hasRequiredDist;
function requireDist() {
  if (hasRequiredDist) return dist$1.exports;
  hasRequiredDist = 1;
  (function(module, exports) {
    (function(global, factory) {
      factory(exports, requireReact());
    })(dist, (function(exports2, react) {
      const defaultOptions = {
        delay: 500,
        minDuration: 200,
        ssr: true
      };
      function useIsSSR() {
        const [isSSR, setIsSSR] = react.useState(true);
        react.useEffect(() => {
          setIsSSR(false);
        }, []);
        return isSSR;
      }
      function useSpinDelay(loading, options) {
        options = Object.assign({}, defaultOptions, options);
        const isSSR = useIsSSR() && options.ssr;
        const initialState = isSSR && loading ? "DISPLAY" : "IDLE";
        const [state, setState] = react.useState(initialState);
        const timeout = react.useRef(null);
        react.useEffect(() => {
          if (loading && (state === "IDLE" || isSSR)) {
            clearTimeout(timeout.current);
            const delay = isSSR ? 0 : options.delay;
            timeout.current = setTimeout(() => {
              if (!loading) {
                return setState("IDLE");
              }
              timeout.current = setTimeout(() => {
                setState("EXPIRE");
              }, options.minDuration);
              setState("DISPLAY");
            }, delay);
            if (!isSSR) {
              setState("DELAY");
            }
          }
          if (!loading && state !== "DISPLAY") {
            clearTimeout(timeout.current);
            setState("IDLE");
          }
        }, [loading, state, options.delay, options.minDuration, isSSR]);
        react.useEffect(() => {
          return () => clearTimeout(timeout.current);
        }, []);
        return state === "DISPLAY" || state === "EXPIRE";
      }
      exports2.defaultOptions = defaultOptions;
      exports2.useSpinDelay = useSpinDelay;
    }));
  })(dist$1, dist$1.exports);
  return dist$1.exports;
}
var distExports = requireDist();
let e = { data: "" }, t = (t2) => {
  if ("object" == typeof window) {
    let e2 = (t2 ? t2.querySelector("#_goober") : window._goober) || Object.assign(document.createElement("style"), { innerHTML: " ", id: "_goober" });
    return e2.nonce = window.__nonce__, e2.parentNode || (t2 || document.head).appendChild(e2), e2.firstChild;
  }
  return t2 || e;
}, a = /(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g, l = /\/\*[^]*?\*\/|  +/g, n$1 = /\n+/g, o = (e2, t2) => {
  let r = "", a2 = "", l2 = "";
  for (let n2 in e2) {
    let c2 = e2[n2];
    "@" == n2[0] ? "i" == n2[1] ? r = n2 + " " + c2 + ";" : a2 += "f" == n2[1] ? o(c2, n2) : n2 + "{" + o(c2, "k" == n2[1] ? "" : t2) + "}" : "object" == typeof c2 ? a2 += o(c2, t2 ? t2.replace(/([^,])+/g, (e3) => n2.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g, (t3) => /&/.test(t3) ? t3.replace(/&/g, e3) : e3 ? e3 + " " + t3 : t3)) : n2) : null != c2 && (n2 = "-" == n2[1] ? n2 : n2.replace(/[A-Z]/g, "-$&").toLowerCase(), l2 += o.p ? o.p(n2, c2) : n2 + ":" + c2 + ";");
  }
  return r + (t2 && l2 ? t2 + "{" + l2 + "}" : l2) + a2;
}, c = {}, i = (e2) => {
  if ("object" == typeof e2) {
    let t2 = "";
    for (let r in e2) t2 += r + i(e2[r]);
    return t2;
  }
  return e2;
}, s = (e2, t2, r, s2, p2) => {
  let u2 = i(e2), d2 = c[u2] || (c[u2] = ((e3) => {
    let t3 = 0, r2 = 11;
    for (; t3 < e3.length; ) r2 = 101 * r2 + e3.charCodeAt(t3++) >>> 0;
    return "go" + r2;
  })(u2));
  if (!c[d2]) {
    let t3 = u2 !== e2 ? e2 : ((e3) => {
      let t4, r2, o2 = [{}];
      for (; t4 = a.exec(e3.replace(l, "")); ) t4[4] ? o2.shift() : t4[3] ? (r2 = t4[3].replace(n$1, " ").trim(), o2.unshift(o2[0][r2] = o2[0][r2] || {})) : o2[0][t4[1]] = t4[2].replace(n$1, " ").trim();
      return o2[0];
    })(e2);
    c[d2] = o(p2 ? { ["@keyframes " + d2]: t3 } : t3, r ? "" : "." + d2);
  }
  let f2 = r && c.g;
  return r && (c.g = c[d2]), ((e3, t3, r2, a2) => {
    a2 ? t3.data = t3.data.replace(a2, e3) : -1 === t3.data.indexOf(e3) && (t3.data = r2 ? e3 + t3.data : t3.data + e3);
  })(c[d2], t2, s2, f2), d2;
}, p = (e2, t2, r) => e2.reduce((e3, a2, l2) => {
  let n2 = t2[l2];
  if (n2 && n2.call) {
    let e4 = n2(r), t3 = e4 && e4.props && e4.props.className || /^go/.test(e4) && e4;
    n2 = t3 ? "." + t3 : e4 && "object" == typeof e4 ? e4.props ? "" : o(e4, "") : false === e4 ? "" : e4;
  }
  return e3 + a2 + (null == n2 ? "" : n2);
}, "");
function u(e2) {
  let r = this || {}, a2 = e2.call ? e2(r.p) : e2;
  return s(a2.unshift ? a2.raw ? p(a2, [].slice.call(arguments, 1), r.p) : a2.reduce((e3, t2) => Object.assign(e3, t2 && t2.call ? t2(r.p) : t2), {}) : a2, t(r.target), r.g, r.o, r.k);
}
let d, f$1, g;
u.bind({ g: 1 });
let h$1 = u.bind({ k: 1 });
function m(e2, t2, r, a2) {
  o.p = t2, d = e2, f$1 = r, g = a2;
}
function w(e2, t2) {
  let r = this || {};
  return function() {
    let a2 = arguments;
    function l2(n2, o2) {
      let c2 = Object.assign({}, n2), i2 = c2.className || l2.className;
      r.p = Object.assign({ theme: f$1 && f$1() }, c2), r.o = /go\d/.test(i2), c2.className = u.apply(r, a2) + (i2 ? " " + i2 : "");
      let s2 = e2;
      return e2[0] && (s2 = c2.as || e2, delete c2.as), g && s2[0] && g(c2), d(s2, c2);
    }
    return l2;
  };
}
var Z = (e2) => typeof e2 == "function", h = (e2, t2) => Z(e2) ? e2(t2) : e2;
var W = /* @__PURE__ */ (() => {
  let e2 = 0;
  return () => (++e2).toString();
})(), E = /* @__PURE__ */ (() => {
  let e2;
  return () => {
    if (e2 === void 0 && typeof window < "u") {
      let t2 = matchMedia("(prefers-reduced-motion: reduce)");
      e2 = !t2 || t2.matches;
    }
    return e2;
  };
})();
var re = 20, k = "default";
var H = (e2, t2) => {
  let { toastLimit: o2 } = e2.settings;
  switch (t2.type) {
    case 0:
      return { ...e2, toasts: [t2.toast, ...e2.toasts].slice(0, o2) };
    case 1:
      return { ...e2, toasts: e2.toasts.map((r) => r.id === t2.toast.id ? { ...r, ...t2.toast } : r) };
    case 2:
      let { toast: s2 } = t2;
      return H(e2, { type: e2.toasts.find((r) => r.id === s2.id) ? 1 : 0, toast: s2 });
    case 3:
      let { toastId: a2 } = t2;
      return { ...e2, toasts: e2.toasts.map((r) => r.id === a2 || a2 === void 0 ? { ...r, dismissed: true, visible: false } : r) };
    case 4:
      return t2.toastId === void 0 ? { ...e2, toasts: [] } : { ...e2, toasts: e2.toasts.filter((r) => r.id !== t2.toastId) };
    case 5:
      return { ...e2, pausedAt: t2.time };
    case 6:
      let i2 = t2.time - (e2.pausedAt || 0);
      return { ...e2, pausedAt: void 0, toasts: e2.toasts.map((r) => ({ ...r, pauseDuration: r.pauseDuration + i2 })) };
  }
}, v = [], j = { toasts: [], pausedAt: void 0, settings: { toastLimit: re } }, f = {}, Y = (e2, t2 = k) => {
  f[t2] = H(f[t2] || j, e2), v.forEach(([o2, s2]) => {
    o2 === t2 && s2(f[t2]);
  });
}, _ = (e2) => Object.keys(f).forEach((t2) => Y(e2, t2)), Q = (e2) => Object.keys(f).find((t2) => f[t2].toasts.some((o2) => o2.id === e2)), S = (e2 = k) => (t2) => {
  Y(t2, e2);
};
var ie = (e2, t2 = "blank", o2) => ({ createdAt: Date.now(), visible: true, dismissed: false, type: t2, ariaProps: { role: "status", "aria-live": "polite" }, message: e2, pauseDuration: 0, ...o2, id: (o2 == null ? void 0 : o2.id) || W() }), P = (e2) => (t2, o2) => {
  let s2 = ie(t2, e2, o2);
  return S(s2.toasterId || Q(s2.id))({ type: 2, toast: s2 }), s2.id;
}, n = (e2, t2) => P("blank")(e2, t2);
n.error = P("error");
n.success = P("success");
n.loading = P("loading");
n.custom = P("custom");
n.dismiss = (e2, t2) => {
  let o2 = { type: 3, toastId: e2 };
  t2 ? S(t2)(o2) : _(o2);
};
n.dismissAll = (e2) => n.dismiss(void 0, e2);
n.remove = (e2, t2) => {
  let o2 = { type: 4, toastId: e2 };
  t2 ? S(t2)(o2) : _(o2);
};
n.removeAll = (e2) => n.remove(void 0, e2);
n.promise = (e2, t2, o2) => {
  let s2 = n.loading(t2.loading, { ...o2, ...o2 == null ? void 0 : o2.loading });
  return typeof e2 == "function" && (e2 = e2()), e2.then((a2) => {
    let i2 = t2.success ? h(t2.success, a2) : void 0;
    return i2 ? n.success(i2, { id: s2, ...o2, ...o2 == null ? void 0 : o2.success }) : n.dismiss(s2), a2;
  }).catch((a2) => {
    let i2 = t2.error ? h(t2.error, a2) : void 0;
    i2 ? n.error(i2, { id: s2, ...o2, ...o2 == null ? void 0 : o2.error }) : n.dismiss(s2);
  }), e2;
};
var de = h$1`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`, me = h$1`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`, le = h$1`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`, C = w("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${(e2) => e2.primary || "#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${de} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${me} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${(e2) => e2.secondary || "#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${le} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`;
var Te = h$1`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`, F = w("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${(e2) => e2.secondary || "#e0e0e0"};
  border-right-color: ${(e2) => e2.primary || "#616161"};
  animation: ${Te} 1s linear infinite;
`;
var ge = h$1`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`, he = h$1`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`, L = w("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${(e2) => e2.primary || "#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${ge} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${he} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${(e2) => e2.secondary || "#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`;
var be = w("div")`
  position: absolute;
`, Se = w("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`, Ae = h$1`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`, Pe = w("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${Ae} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`, $ = ({ toast: e2 }) => {
  let { icon: t2, type: o2, iconTheme: s2 } = e2;
  return t2 !== void 0 ? typeof t2 == "string" ? reactExports.createElement(Pe, null, t2) : t2 : o2 === "blank" ? null : reactExports.createElement(Se, null, reactExports.createElement(F, { ...s2 }), o2 !== "loading" && reactExports.createElement(be, null, o2 === "error" ? reactExports.createElement(C, { ...s2 }) : reactExports.createElement(L, { ...s2 })));
};
var Re = (e2) => `
0% {transform: translate3d(0,${e2 * -200}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`, Ee = (e2) => `
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${e2 * -150}%,-1px) scale(.6); opacity:0;}
`, ve = "0%{opacity:0;} 100%{opacity:1;}", De = "0%{opacity:1;} 100%{opacity:0;}", Oe = w("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`, Ie = w("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`, ke = (e2, t2) => {
  let s2 = e2.includes("top") ? 1 : -1, [a2, i2] = E() ? [ve, De] : [Re(s2), Ee(s2)];
  return { animation: t2 ? `${h$1(a2)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards` : `${h$1(i2)} 0.4s forwards cubic-bezier(.06,.71,.55,1)` };
};
reactExports.memo(({ toast: e2, position: t2, style: o2, children: s2 }) => {
  let a2 = e2.height ? ke(e2.position || t2 || "top-center", e2.visible) : { opacity: 0 }, i2 = reactExports.createElement($, { toast: e2 }), r = reactExports.createElement(Ie, { ...e2.ariaProps }, h(e2.message, e2));
  return reactExports.createElement(Oe, { className: e2.className, style: { ...a2, ...o2, ...e2.style } }, typeof s2 == "function" ? s2({ icon: i2, message: r }) : reactExports.createElement(reactExports.Fragment, null, i2, r));
});
m(reactExports.createElement);
u`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`;
var zt = n;
function useGetCopyToClipboard() {
  const { t: t2 } = useTranslation("common");
  return (value) => ({
    "aria-label": t2("clipboard.aria-label", {
      replace: {
        value
      }
    }),
    onClick: async (e2) => {
      e2.stopPropagation();
      e2.preventDefault();
      try {
        await navigator.clipboard.writeText(value);
        zt.success(() => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-primary font-normal first-letter:capitalize", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Trans,
          {
            t: t2,
            i18nKey: "clipboard.copy",
            components: {
              Value: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-primary whitespace-pre-wrap break-all font-semibold" })
            },
            values: {
              value
            }
          }
        ) }));
      } catch (_err) {
        zt.error(t2("errors.unknown"));
      }
    }
  });
}
const variances = cva(
  "border-grey-border text-grey-primary bg-purple-background-light hover:bg-grey-background active:bg-grey-border flex w-fit shrink-0 cursor-pointer select-none items-center break-all border font-normal transition-colors max-w-full",
  {
    variants: {
      size: {
        sm: "p-2xs gap-sm",
        lg: "min-h-8 gap-md px-sm",
        chip: "py-xs px-sm gap-xs font-semibold text-small bg-surface-card"
      },
      dimmed: {
        true: "text-grey-secondary",
        false: null
      },
      rounded: {
        true: "rounded-full",
        false: "rounded-sm"
      }
    },
    defaultVariants: {
      dimmed: false,
      size: "lg",
      rounded: false
    }
  }
);
const CopyToClipboardButton = reactExports.forwardRef(
  function CopyToClipboardButton2({ children, className, toCopy, dimmed, size, rounded, ...props }, ref) {
    const getCopyToClipboardProps = useGetCopyToClipboard();
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        ref,
        className: variances({ dimmed, className, size, rounded }),
        ...getCopyToClipboardProps(toCopy),
        ...props,
        children: [
          children,
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Icon,
            {
              icon: "copy",
              className: cn("shrink-0 text-current", {
                "size-4": size === void 0 || size === "lg" || size === "chip",
                "size-3": size === "sm"
              })
            }
          )
        ]
      }
    );
  }
);
export {
  CopyToClipboardButton as C,
  distExports as d,
  n,
  useGetCopyToClipboard as u,
  zt as z
};
