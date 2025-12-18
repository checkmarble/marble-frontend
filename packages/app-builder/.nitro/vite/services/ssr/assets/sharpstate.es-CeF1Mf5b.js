import { a7 as requireReact, r as reactExports } from "../server.js";
var shim = { exports: {} };
var useSyncExternalStoreShim_production = {};
var hasRequiredUseSyncExternalStoreShim_production;
function requireUseSyncExternalStoreShim_production() {
  if (hasRequiredUseSyncExternalStoreShim_production) return useSyncExternalStoreShim_production;
  hasRequiredUseSyncExternalStoreShim_production = 1;
  var React = requireReact();
  function is(x2, y2) {
    return x2 === y2 && (0 !== x2 || 1 / x2 === 1 / y2) || x2 !== x2 && y2 !== y2;
  }
  var objectIs = "function" === typeof Object.is ? Object.is : is, useState = React.useState, useEffect = React.useEffect, useLayoutEffect = React.useLayoutEffect, useDebugValue = React.useDebugValue;
  function useSyncExternalStore$2(subscribe, getSnapshot) {
    var value = getSnapshot(), _useState = useState({ inst: { value, getSnapshot } }), inst = _useState[0].inst, forceUpdate = _useState[1];
    useLayoutEffect(
      function() {
        inst.value = value;
        inst.getSnapshot = getSnapshot;
        checkIfSnapshotChanged(inst) && forceUpdate({ inst });
      },
      [subscribe, value, getSnapshot]
    );
    useEffect(
      function() {
        checkIfSnapshotChanged(inst) && forceUpdate({ inst });
        return subscribe(function() {
          checkIfSnapshotChanged(inst) && forceUpdate({ inst });
        });
      },
      [subscribe]
    );
    useDebugValue(value);
    return value;
  }
  function checkIfSnapshotChanged(inst) {
    var latestGetSnapshot = inst.getSnapshot;
    inst = inst.value;
    try {
      var nextValue = latestGetSnapshot();
      return !objectIs(inst, nextValue);
    } catch (error) {
      return true;
    }
  }
  function useSyncExternalStore$1(subscribe, getSnapshot) {
    return getSnapshot();
  }
  var shim2 = "undefined" === typeof window || "undefined" === typeof window.document || "undefined" === typeof window.document.createElement ? useSyncExternalStore$1 : useSyncExternalStore$2;
  useSyncExternalStoreShim_production.useSyncExternalStore = void 0 !== React.useSyncExternalStore ? React.useSyncExternalStore : shim2;
  return useSyncExternalStoreShim_production;
}
var hasRequiredShim;
function requireShim() {
  if (hasRequiredShim) return shim.exports;
  hasRequiredShim = 1;
  {
    shim.exports = requireUseSyncExternalStoreShim_production();
  }
  return shim.exports;
}
var shimExports = requireShim();
const i$2 = /* @__PURE__ */ Symbol.for("preact-signals");
function t$1() {
  if (e > 1) {
    e--;
    return;
  }
  let i2, t2 = false;
  !(function() {
    let i3 = r;
    r = void 0;
    while (void 0 !== i3) {
      if (i3.S.v === i3.v) i3.S.i = i3.i;
      i3 = i3.o;
    }
  })();
  while (void 0 !== s) {
    let n2 = s;
    s = void 0;
    u$1++;
    while (void 0 !== n2) {
      const o2 = n2.u;
      n2.u = void 0;
      n2.f &= -3;
      if (!(8 & n2.f) && w$2(n2)) try {
        n2.c();
      } catch (n3) {
        if (!t2) {
          i2 = n3;
          t2 = true;
        }
      }
      n2 = o2;
    }
  }
  u$1 = 0;
  e--;
  if (t2) throw i2;
}
function n(i2) {
  if (e > 0) return i2();
  d$2 = ++c$2;
  e++;
  try {
    return i2();
  } finally {
    t$1();
  }
}
let o$1, s;
function h$1(i2) {
  const t2 = o$1;
  o$1 = void 0;
  try {
    return i2();
  } finally {
    o$1 = t2;
  }
}
let r, e = 0, u$1 = 0, c$2 = 0, d$2 = 0, v$2 = 0;
function l$1(i2) {
  if (void 0 === o$1) return;
  let t2 = i2.n;
  if (void 0 === t2 || t2.t !== o$1) {
    t2 = { i: 0, S: i2, p: o$1.s, n: void 0, t: o$1, e: void 0, x: void 0, r: t2 };
    if (void 0 !== o$1.s) o$1.s.n = t2;
    o$1.s = t2;
    i2.n = t2;
    if (32 & o$1.f) i2.S(t2);
    return t2;
  } else if (-1 === t2.i) {
    t2.i = 0;
    if (void 0 !== t2.n) {
      t2.n.p = t2.p;
      if (void 0 !== t2.p) t2.p.n = t2.n;
      t2.p = o$1.s;
      t2.n = void 0;
      o$1.s.n = t2;
      o$1.s = t2;
    }
    return t2;
  }
}
function y$1(i2, t2) {
  this.v = i2;
  this.i = 0;
  this.n = void 0;
  this.t = void 0;
  this.l = 0;
  this.W = null == t2 ? void 0 : t2.watched;
  this.Z = null == t2 ? void 0 : t2.unwatched;
  this.name = null == t2 ? void 0 : t2.name;
}
y$1.prototype.brand = i$2;
y$1.prototype.h = function() {
  return true;
};
y$1.prototype.S = function(i2) {
  const t2 = this.t;
  if (t2 !== i2 && void 0 === i2.e) {
    i2.x = t2;
    this.t = i2;
    if (void 0 !== t2) t2.e = i2;
    else h$1(() => {
      var i3;
      null == (i3 = this.W) || i3.call(this);
    });
  }
};
y$1.prototype.U = function(i2) {
  if (void 0 !== this.t) {
    const t2 = i2.e, n2 = i2.x;
    if (void 0 !== t2) {
      t2.x = n2;
      i2.e = void 0;
    }
    if (void 0 !== n2) {
      n2.e = t2;
      i2.x = void 0;
    }
    if (i2 === this.t) {
      this.t = n2;
      if (void 0 === n2) h$1(() => {
        var i3;
        null == (i3 = this.Z) || i3.call(this);
      });
    }
  }
};
y$1.prototype.subscribe = function(i2) {
  return j$1(() => {
    const t2 = this.value, n2 = o$1;
    o$1 = void 0;
    try {
      i2(t2);
    } finally {
      o$1 = n2;
    }
  }, { name: "sub" });
};
y$1.prototype.valueOf = function() {
  return this.value;
};
y$1.prototype.toString = function() {
  return this.value + "";
};
y$1.prototype.toJSON = function() {
  return this.value;
};
y$1.prototype.peek = function() {
  const i2 = o$1;
  o$1 = void 0;
  try {
    return this.value;
  } finally {
    o$1 = i2;
  }
};
Object.defineProperty(y$1.prototype, "value", { get() {
  const i2 = l$1(this);
  if (void 0 !== i2) i2.i = this.i;
  return this.v;
}, set(i2) {
  if (i2 !== this.v) {
    if (u$1 > 100) throw new Error("Cycle detected");
    !(function(i3) {
      if (0 !== e && 0 === u$1) {
        if (i3.l !== d$2) {
          i3.l = d$2;
          r = { S: i3, v: i3.v, i: i3.i, o: r };
        }
      }
    })(this);
    this.v = i2;
    this.i++;
    v$2++;
    e++;
    try {
      for (let i3 = this.t; void 0 !== i3; i3 = i3.x) i3.t.N();
    } finally {
      t$1();
    }
  }
} });
function a$2(i2, t2) {
  return new y$1(i2, t2);
}
function w$2(i2) {
  for (let t2 = i2.s; void 0 !== t2; t2 = t2.n) if (t2.S.i !== t2.i || !t2.S.h() || t2.S.i !== t2.i) return true;
  return false;
}
function _$1(i2) {
  for (let t2 = i2.s; void 0 !== t2; t2 = t2.n) {
    const n2 = t2.S.n;
    if (void 0 !== n2) t2.r = n2;
    t2.S.n = t2;
    t2.i = -1;
    if (void 0 === t2.n) {
      i2.s = t2;
      break;
    }
  }
}
function b$1(i2) {
  let t2, n2 = i2.s;
  while (void 0 !== n2) {
    const i3 = n2.p;
    if (-1 === n2.i) {
      n2.S.U(n2);
      if (void 0 !== i3) i3.n = n2.n;
      if (void 0 !== n2.n) n2.n.p = i3;
    } else t2 = n2;
    n2.S.n = n2.r;
    if (void 0 !== n2.r) n2.r = void 0;
    n2 = i3;
  }
  i2.s = t2;
}
function p$1(i2, t2) {
  y$1.call(this, void 0);
  this.x = i2;
  this.s = void 0;
  this.g = v$2 - 1;
  this.f = 4;
  this.W = null == t2 ? void 0 : t2.watched;
  this.Z = null == t2 ? void 0 : t2.unwatched;
  this.name = null == t2 ? void 0 : t2.name;
}
p$1.prototype = new y$1();
p$1.prototype.h = function() {
  this.f &= -3;
  if (1 & this.f) return false;
  if (32 == (36 & this.f)) return true;
  this.f &= -5;
  if (this.g === v$2) return true;
  this.g = v$2;
  this.f |= 1;
  if (this.i > 0 && !w$2(this)) {
    this.f &= -2;
    return true;
  }
  const i2 = o$1;
  try {
    _$1(this);
    o$1 = this;
    const i3 = this.x();
    if (16 & this.f || this.v !== i3 || 0 === this.i) {
      this.v = i3;
      this.f &= -17;
      this.i++;
    }
  } catch (i3) {
    this.v = i3;
    this.f |= 16;
    this.i++;
  }
  o$1 = i2;
  b$1(this);
  this.f &= -2;
  return true;
};
p$1.prototype.S = function(i2) {
  if (void 0 === this.t) {
    this.f |= 36;
    for (let i3 = this.s; void 0 !== i3; i3 = i3.n) i3.S.S(i3);
  }
  y$1.prototype.S.call(this, i2);
};
p$1.prototype.U = function(i2) {
  if (void 0 !== this.t) {
    y$1.prototype.U.call(this, i2);
    if (void 0 === this.t) {
      this.f &= -33;
      for (let i3 = this.s; void 0 !== i3; i3 = i3.n) i3.S.U(i3);
    }
  }
};
p$1.prototype.N = function() {
  if (!(2 & this.f)) {
    this.f |= 6;
    for (let i2 = this.t; void 0 !== i2; i2 = i2.x) i2.t.N();
  }
};
Object.defineProperty(p$1.prototype, "value", { get() {
  if (1 & this.f) throw new Error("Cycle detected");
  const i2 = l$1(this);
  this.h();
  if (void 0 !== i2) i2.i = this.i;
  if (16 & this.f) throw this.v;
  return this.v;
} });
function g$2(i2, t2) {
  return new p$1(i2, t2);
}
function S$1(i2) {
  const n2 = i2.m;
  i2.m = void 0;
  if ("function" == typeof n2) {
    e++;
    const s2 = o$1;
    o$1 = void 0;
    try {
      n2();
    } catch (t2) {
      i2.f &= -2;
      i2.f |= 8;
      m$2(i2);
      throw t2;
    } finally {
      o$1 = s2;
      t$1();
    }
  }
}
function m$2(i2) {
  for (let t2 = i2.s; void 0 !== t2; t2 = t2.n) t2.S.U(t2);
  i2.x = void 0;
  i2.s = void 0;
  S$1(i2);
}
function x$1(i2) {
  if (o$1 !== this) throw new Error("Out-of-order effect");
  b$1(this);
  o$1 = i2;
  this.f &= -2;
  if (8 & this.f) m$2(this);
  t$1();
}
function E(i2, t2) {
  this.x = i2;
  this.m = void 0;
  this.s = void 0;
  this.u = void 0;
  this.f = 32;
  this.name = null == t2 ? void 0 : t2.name;
}
E.prototype.c = function() {
  const i2 = this.S();
  try {
    if (8 & this.f) return;
    if (void 0 === this.x) return;
    const t2 = this.x();
    if ("function" == typeof t2) this.m = t2;
  } finally {
    i2();
  }
};
E.prototype.S = function() {
  if (1 & this.f) throw new Error("Cycle detected");
  this.f |= 1;
  this.f &= -9;
  S$1(this);
  _$1(this);
  e++;
  const i2 = o$1;
  o$1 = this;
  return x$1.bind(this, i2);
};
E.prototype.N = function() {
  if (!(2 & this.f)) {
    this.f |= 2;
    this.u = s;
    s = this;
  }
};
E.prototype.d = function() {
  this.f |= 8;
  if (!(1 & this.f)) m$2(this);
};
E.prototype.dispose = function() {
  this.d();
};
function j$1(i2, t2) {
  const n2 = new E(i2, t2);
  try {
    n2.c();
  } catch (i3) {
    n2.d();
    throw i3;
  }
  const o2 = n2.d.bind(n2);
  o2[Symbol.dispose] = o2;
  return o2;
}
const [a$1] = reactExports.version.split(".").map(Number), d$1 = [], m$1 = /* @__PURE__ */ Symbol.for(a$1 >= 19 ? "react.transitional.element" : "react.element"), p = "undefined" != typeof window && !!window.__PREACT_SIGNALS_DEVTOOLS__;
const y = Symbol.dispose || /* @__PURE__ */ Symbol.for("Symbol.dispose");
let g$1;
function v$1(n2, t2) {
  const e2 = t2.effect.S();
  g$1 = t2;
  return h.bind(t2, n2, e2);
}
function h(n2, t2) {
  t2();
  g$1 = n2;
}
const w$1 = () => {
}, _ = { o: 0, effect: { s: void 0, c() {
}, S: () => w$1, d() {
} }, subscribe: () => w$1, getSnapshot: () => 0, S() {
}, f() {
}, [y]() {
} }, S = Promise.prototype.then.bind(Promise.resolve());
let x;
function j() {
  if (!x) x = S(P);
}
function P() {
  var n2;
  x = void 0;
  null == (n2 = g$1) || n2.f();
}
const $ = "undefined" != typeof window ? reactExports.useLayoutEffect : reactExports.useEffect;
function k$1(n2 = 0, t2) {
  j();
  const e2 = reactExports.useRef();
  if (null == e2.current) if ("undefined" == typeof window) e2.current = _;
  else e2.current = (function(n3, t3) {
    let e3, i3, r2, u2 = 0, f2 = j$1(function() {
      e3 = this;
    }, { name: "Component" });
    e3.c = function() {
      u2 = u2 + 1 | 0;
      if (p) {
        var n4;
        null == (n4 = e3.y) || n4.call(e3);
      }
      if (r2) r2();
    };
    return { o: n3, effect: e3, subscribe(n4) {
      r2 = n4;
      return function() {
        u2 = u2 + 1 | 0;
        r2 = void 0;
        f2();
      };
    }, getSnapshot: () => u2, S() {
      if (null == g$1) {
        i3 = v$1(void 0, this);
        return;
      }
      const n4 = g$1.o, t4 = this.o;
      if (0 == n4 && 0 == t4 || 0 == n4 && 1 == t4) {
        g$1.f();
        i3 = v$1(void 0, this);
      } else if (1 == n4 && 0 == t4 || 2 == n4 && 0 == t4) ;
      else i3 = v$1(g$1, this);
    }, f() {
      const n4 = i3;
      i3 = void 0;
      null == n4 || n4();
    }, [y]() {
      this.f();
    } };
  })(n2);
  const i2 = e2.current;
  shimExports.useSyncExternalStore(i2.subscribe, i2.getSnapshot, i2.getSnapshot);
  i2.S();
  if (0 === n2) $(P);
  return i2;
}
Object.defineProperties(y$1.prototype, { $$typeof: { configurable: true, value: m$1 }, type: { configurable: true, value: function({ data: n2 }) {
  const t2 = k$1(1);
  try {
    return n2.value;
  } finally {
    t2.f();
  }
} }, props: { configurable: true, get() {
  const n2 = this;
  return { data: { get value() {
    return n2.value;
  } } };
} }, ref: { configurable: true, value: null } });
function C(n2, t2) {
  return k$1(n2);
}
function useSignalEffect(n2, t2) {
  const e2 = reactExports.useRef(n2);
  e2.current = n2;
  reactExports.useEffect(() => j$1(function() {
    return e2.current();
  }, t2), d$1);
}
const a = /* @__PURE__ */ new WeakMap(), o = /* @__PURE__ */ new WeakMap(), l = /* @__PURE__ */ new WeakMap(), c$1 = /* @__PURE__ */ new WeakSet(), i$1 = /* @__PURE__ */ new WeakMap(), f$1 = /^\$/, g = Object.getOwnPropertyDescriptor;
const u = (e2) => {
  if (!M(e2)) throw new Error("This object can't be observed.");
  return o.has(e2) || o.set(e2, w(e2, d)), o.get(e2);
};
const w = (e2, t2) => {
  const r2 = new Proxy(e2, t2);
  return c$1.add(r2), r2;
}, m = () => {
  throw new Error("Don't mutate the signals directly.");
}, v = (e2) => (t2, s2, c2) => {
  var i2;
  let u2 = e2 || "$" === s2[0];
  if (!e2 && u2 && Array.isArray(t2)) {
    if ("$" === s2) return l.has(t2) || l.set(t2, w(t2, b)), l.get(t2);
    u2 = "$length" === s2;
  }
  a.has(c2) || a.set(c2, /* @__PURE__ */ new Map());
  const h2 = a.get(c2), y2 = u2 ? s2.replace(f$1, "") : s2;
  if (h2.has(y2) || "function" != typeof (null == (i2 = g(t2, y2)) ? void 0 : i2.get)) {
    let e3 = Reflect.get(t2, y2, c2);
    if (u2 && "function" == typeof e3) return;
    if ("symbol" == typeof y2 && R.has(y2)) return e3;
    h2.has(y2) || (M(e3) && (o.has(e3) || o.set(e3, w(e3, d)), e3 = o.get(e3)), h2.set(y2, a$2(e3)));
  } else h2.set(y2, g$2(() => Reflect.get(t2, y2, c2)));
  return u2 ? h2.get(y2) : h2.get(y2).value;
}, d = { get: v(false), set(e2, n2, s2, l2) {
  var c2;
  if ("function" == typeof (null == (c2 = g(e2, n2)) ? void 0 : c2.set)) return Reflect.set(e2, n2, s2, l2);
  a.has(l2) || a.set(l2, /* @__PURE__ */ new Map());
  const p2 = a.get(l2);
  if ("$" === n2[0]) {
    s2 instanceof y$1 || m();
    const r2 = n2.replace(f$1, "");
    return p2.set(r2, s2), Reflect.set(e2, r2, s2.peek(), l2);
  }
  {
    let t2 = s2;
    M(s2) && (o.has(s2) || o.set(s2, w(s2, d)), t2 = o.get(s2));
    const a2 = !(n2 in e2), c3 = Reflect.set(e2, n2, s2, l2);
    return p2.has(n2) ? p2.get(n2).value = t2 : p2.set(n2, a$2(t2)), a2 && i$1.has(e2) && i$1.get(e2).value++, Array.isArray(e2) && p2.has("length") && (p2.get("length").value = e2.length), c3;
  }
}, deleteProperty(e2, t2) {
  "$" === t2[0] && m();
  const r2 = a.get(o.get(e2)), n2 = Reflect.deleteProperty(e2, t2);
  return r2 && r2.has(t2) && (r2.get(t2).value = void 0), i$1.has(e2) && i$1.get(e2).value++, n2;
}, ownKeys: (e2) => (i$1.has(e2) || i$1.set(e2, a$2(0)), i$1._ = i$1.get(e2).value, Reflect.ownKeys(e2)) }, b = { get: v(true), set: m, deleteProperty: m }, R = new Set(Object.getOwnPropertyNames(Symbol).map((e2) => Symbol[e2]).filter((e2) => "symbol" == typeof e2)), k = /* @__PURE__ */ new Set([Object, Array]), M = (e2) => "object" == typeof e2 && null !== e2 && k.has(e2.constructor) && !c$1.has(e2);
function c(e2) {
  const o2 = /* @__PURE__ */ Symbol(`Uninit value for ${e2}`), n2 = reactExports.createContext(o2), u2 = () => {
    const t2 = reactExports.useContext(n2);
    if (t2 === o2)
      throw `${e2}.useState must be used within ${e2}.Provider`;
    return t2;
  }, i2 = () => {
    const t2 = reactExports.useContext(n2);
    return t2 === o2 ? null : t2;
  };
  return { Provider: n2.Provider, useValue: u2, useOptionalValue: i2 };
}
const t = /* @__PURE__ */ Symbol("uninitialized_value");
function f(u2) {
  const n2 = reactExports.useRef(t);
  let e2 = n2.current;
  return e2 === t && (e2 = u2(), n2.current = e2), reactExports.useRef(e2);
}
function i(t2) {
  const b2 = t2.initializer, s2 = c(t2.name), p2 = () => (C(), s2.useValue()), h2 = () => (C(), s2.useOptionalValue());
  return {
    createSharp: function(...a2) {
      return C(), f(() => {
        const o2 = u(b2(...a2)), j2 = { value: o2, batch: n };
        let d2 = {};
        if ("actions" in t2 && t2.actions) {
          const e2 = t2.actions;
          d2 = {
            actions: Object.keys(t2.actions).reduce(
              (n2, u2) => (n2[u2] = (...x2) => e2[u2](j2, ...x2), n2),
              {}
            )
          };
        }
        let l2 = {};
        if ("computed" in t2 && t2.computed) {
          const e2 = t2.computed;
          l2 = {
            computed: Object.keys(t2.computed).reduce(
              (n2, u2) => (n2[u2] = g$2(() => e2[u2](o2)), n2),
              {}
            )
          };
        }
        return {
          value: o2,
          update: (e2) => {
            n(() => {
              e2(o2);
            });
          },
          select: (e2) => e2(o2),
          ...d2,
          ...l2
        };
      }).current;
    },
    Provider: s2.Provider,
    useSharp: p2,
    useOptionalSharp: h2,
    select: function(a2) {
      const m2 = p2();
      return a2(m2.value);
    },
    // Chainables
    ..."actions" in t2 ? {} : {
      withActions(r2) {
        return i({ ...t2, actions: r2 });
      }
    },
    ..."computed" in t2 ? {} : {
      withComputed(r2) {
        return i({ ...t2, computed: r2 });
      }
    }
  };
}
function B(t2) {
  return i(t2);
}
export {
  B,
  g$2 as g,
  requireShim as r,
  shimExports as s,
  useSignalEffect as u
};
