import { R as jsxRuntimeExports, r as reactExports } from "../server.js";
import { S as Spinner } from "./Spinner-GK6cEAdR.js";
import { u as useDataModelQuery } from "./get-data-model-CAY4ZWaH.js";
import { g as getScoreDistributionFn, a as updateScoringSettingsFn } from "./scoring-NycAI253.js";
import { u as useQuery } from "./useQuery-B7mL_evE.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
import { C as CreateRulesetPanelContext, u as useListScoringRulesetsQuery } from "./ScoringSectionLayout-BdgAnb_C.js";
import { p as pi, c as cos, s as sin, a as constant, h as halfPi, e as epsilon, t as tau, b as sqrt, m as min, d as abs, f as atan2, g as max, i as asin, j as acos, k as array, l as bn, M, Y as Ye, n as ct, D as Dr, u as useTransition, o as animated, q as b$1, r as ft, v as to, w as st, x as ut, y as a, z as gt, A as d, B as yn, _ as _n, $ as $r, F as Fr, C as cn, E as Mn, R as Rt, G as hn, H as hr, I as z$1, J as E$2, T, L as L$1, K as Rn, N as kn } from "./nivo-legends-6l5H9E2i.js";
import { w as withPath, P as P$2 } from "./line-BbnWu1FG.js";
import { M as M$1 } from "./services-middleware-DR8Hua1Y.js";
import { u as useTranslation, B as Button, d as cn$1 } from "./format-NPGUXq-g.js";
import { u as useLoaderRevalidator } from "./LoaderRevalidatorContext-C9s56i-l.js";
import { y as useQueryClient } from "./QueryClientProvider-DYTpkCko.js";
import { u as useMutation } from "./useMutation-C5oG90Zs.js";
import { z as zt } from "./CopyToClipboardButton-CJNJJful.js";
import { M as MAX_RISK_LEVELS, i as isMaxRiskLevelInRange, s as scoringLevelEntries, S as SCORING_LEVELS_COLORS, a as SCORING_LEVELS_LABEL_KEYS } from "./display-TKj7AN5a.js";
import { t as useLoaderData } from "./router-vb7i5euz.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
import "./data-BFm2FCTm.js";
import "./createSsrRpc-ZXUHv2Er.js";
import "./auth-middleware-C4ap47rJ.js";
import "./data-fdG1PpsD.js";
import "./short-uuid-MIi3jWzx.js";
import "./user-scoring-BwKPLq1i.js";
import "./useBaseQuery-CMboOtTR.js";
import "./ScoringLevelThresholds-bJ2AGLf_.js";
import "./form-D2XmDKeG.js";
import "./array-BFSjnO9c.js";
import "./useForm-BwABQKAs.js";
import "./sharpstate.es-CeF1Mf5b.js";
import "./Panel-kj8Z2GDk.js";
import "node:crypto";
import "./isNullish-B8pc8Ntu.js";
import "./use-callback-ref-DXzIzfqy.js";
import "./security-headers.server-BdP3HrPp.js";
import "./ThemeContext-B40HQxfH.js";
import "./config-ut8rAdyo.js";
import "./i18n-instance-store-UssbGYOM.js";
import "./inboxes-D556s0BB.js";
import "./files-fO9wUXBf.js";
import "./case-detail-middleware-C3JS8Yme.js";
import "./input-validation-CU_reV2S.js";
import "./async-C3pYACua.js";
import "./decisions-B-2DmJW1.js";
import "./unique-CBeBxAXx.js";
import "./scenarios-8U74nJp4.js";
const useGetScoreDistributionQuery = (recordType) => {
  const getScoreDistribution = useServerFn(getScoreDistributionFn);
  return useQuery({
    queryKey: ["scoring", "distribution", recordType],
    queryFn: () => getScoreDistribution({ data: { recordType } }),
    enabled: !!recordType
  });
};
function arcInnerRadius(d2) {
  return d2.innerRadius;
}
function arcOuterRadius(d2) {
  return d2.outerRadius;
}
function arcStartAngle(d2) {
  return d2.startAngle;
}
function arcEndAngle(d2) {
  return d2.endAngle;
}
function arcPadAngle(d2) {
  return d2 && d2.padAngle;
}
function intersect(x0, y0, x1, y1, x2, y2, x3, y3) {
  var x10 = x1 - x0, y10 = y1 - y0, x32 = x3 - x2, y32 = y3 - y2, t = y32 * x10 - x32 * y10;
  if (t * t < epsilon) return;
  t = (x32 * (y0 - y2) - y32 * (x0 - x2)) / t;
  return [x0 + t * x10, y0 + t * y10];
}
function cornerTangents(x0, y0, x1, y1, r1, rc, cw) {
  var x01 = x0 - x1, y01 = y0 - y1, lo = (cw ? rc : -rc) / sqrt(x01 * x01 + y01 * y01), ox = lo * y01, oy = -lo * x01, x11 = x0 + ox, y11 = y0 + oy, x10 = x1 + ox, y10 = y1 + oy, x00 = (x11 + x10) / 2, y00 = (y11 + y10) / 2, dx = x10 - x11, dy = y10 - y11, d2 = dx * dx + dy * dy, r = r1 - rc, D2 = x11 * y10 - x10 * y11, d3 = (dy < 0 ? -1 : 1) * sqrt(max(0, r * r * d2 - D2 * D2)), cx0 = (D2 * dy - dx * d3) / d2, cy0 = (-D2 * dx - dy * d3) / d2, cx1 = (D2 * dy + dx * d3) / d2, cy1 = (-D2 * dx + dy * d3) / d2, dx0 = cx0 - x00, dy0 = cy0 - y00, dx1 = cx1 - x00, dy1 = cy1 - y00;
  if (dx0 * dx0 + dy0 * dy0 > dx1 * dx1 + dy1 * dy1) cx0 = cx1, cy0 = cy1;
  return {
    cx: cx0,
    cy: cy0,
    x01: -ox,
    y01: -oy,
    x11: cx0 * (r1 / r - 1),
    y11: cy0 * (r1 / r - 1)
  };
}
function C() {
  var innerRadius = arcInnerRadius, outerRadius = arcOuterRadius, cornerRadius = constant(0), padRadius = null, startAngle = arcStartAngle, endAngle = arcEndAngle, padAngle = arcPadAngle, context = null, path = withPath(arc);
  function arc() {
    var buffer, r, r0 = +innerRadius.apply(this, arguments), r1 = +outerRadius.apply(this, arguments), a0 = startAngle.apply(this, arguments) - halfPi, a1 = endAngle.apply(this, arguments) - halfPi, da = abs(a1 - a0), cw = a1 > a0;
    if (!context) context = buffer = path();
    if (r1 < r0) r = r1, r1 = r0, r0 = r;
    if (!(r1 > epsilon)) context.moveTo(0, 0);
    else if (da > tau - epsilon) {
      context.moveTo(r1 * cos(a0), r1 * sin(a0));
      context.arc(0, 0, r1, a0, a1, !cw);
      if (r0 > epsilon) {
        context.moveTo(r0 * cos(a1), r0 * sin(a1));
        context.arc(0, 0, r0, a1, a0, cw);
      }
    } else {
      var a01 = a0, a11 = a1, a00 = a0, a10 = a1, da0 = da, da1 = da, ap = padAngle.apply(this, arguments) / 2, rp = ap > epsilon && (padRadius ? +padRadius.apply(this, arguments) : sqrt(r0 * r0 + r1 * r1)), rc = min(abs(r1 - r0) / 2, +cornerRadius.apply(this, arguments)), rc0 = rc, rc1 = rc, t0, t1;
      if (rp > epsilon) {
        var p0 = asin(rp / r0 * sin(ap)), p1 = asin(rp / r1 * sin(ap));
        if ((da0 -= p0 * 2) > epsilon) p0 *= cw ? 1 : -1, a00 += p0, a10 -= p0;
        else da0 = 0, a00 = a10 = (a0 + a1) / 2;
        if ((da1 -= p1 * 2) > epsilon) p1 *= cw ? 1 : -1, a01 += p1, a11 -= p1;
        else da1 = 0, a01 = a11 = (a0 + a1) / 2;
      }
      var x01 = r1 * cos(a01), y01 = r1 * sin(a01), x10 = r0 * cos(a10), y10 = r0 * sin(a10);
      if (rc > epsilon) {
        var x11 = r1 * cos(a11), y11 = r1 * sin(a11), x00 = r0 * cos(a00), y00 = r0 * sin(a00), oc;
        if (da < pi) {
          if (oc = intersect(x01, y01, x00, y00, x11, y11, x10, y10)) {
            var ax = x01 - oc[0], ay = y01 - oc[1], bx = x11 - oc[0], by = y11 - oc[1], kc = 1 / sin(acos((ax * bx + ay * by) / (sqrt(ax * ax + ay * ay) * sqrt(bx * bx + by * by))) / 2), lc = sqrt(oc[0] * oc[0] + oc[1] * oc[1]);
            rc0 = min(rc, (r0 - lc) / (kc - 1));
            rc1 = min(rc, (r1 - lc) / (kc + 1));
          } else {
            rc0 = rc1 = 0;
          }
        }
      }
      if (!(da1 > epsilon)) context.moveTo(x01, y01);
      else if (rc1 > epsilon) {
        t0 = cornerTangents(x00, y00, x01, y01, r1, rc1, cw);
        t1 = cornerTangents(x11, y11, x10, y10, r1, rc1, cw);
        context.moveTo(t0.cx + t0.x01, t0.cy + t0.y01);
        if (rc1 < rc) context.arc(t0.cx, t0.cy, rc1, atan2(t0.y01, t0.x01), atan2(t1.y01, t1.x01), !cw);
        else {
          context.arc(t0.cx, t0.cy, rc1, atan2(t0.y01, t0.x01), atan2(t0.y11, t0.x11), !cw);
          context.arc(0, 0, r1, atan2(t0.cy + t0.y11, t0.cx + t0.x11), atan2(t1.cy + t1.y11, t1.cx + t1.x11), !cw);
          context.arc(t1.cx, t1.cy, rc1, atan2(t1.y11, t1.x11), atan2(t1.y01, t1.x01), !cw);
        }
      } else context.moveTo(x01, y01), context.arc(0, 0, r1, a01, a11, !cw);
      if (!(r0 > epsilon) || !(da0 > epsilon)) context.lineTo(x10, y10);
      else if (rc0 > epsilon) {
        t0 = cornerTangents(x10, y10, x11, y11, r0, -rc0, cw);
        t1 = cornerTangents(x01, y01, x00, y00, r0, -rc0, cw);
        context.lineTo(t0.cx + t0.x01, t0.cy + t0.y01);
        if (rc0 < rc) context.arc(t0.cx, t0.cy, rc0, atan2(t0.y01, t0.x01), atan2(t1.y01, t1.x01), !cw);
        else {
          context.arc(t0.cx, t0.cy, rc0, atan2(t0.y01, t0.x01), atan2(t0.y11, t0.x11), !cw);
          context.arc(0, 0, r0, atan2(t0.cy + t0.y11, t0.cx + t0.x11), atan2(t1.cy + t1.y11, t1.cx + t1.x11), cw);
          context.arc(t1.cx, t1.cy, rc0, atan2(t1.y11, t1.x11), atan2(t1.y01, t1.x01), !cw);
        }
      } else context.arc(0, 0, r0, a10, a00, cw);
    }
    context.closePath();
    if (buffer) return context = null, buffer + "" || null;
  }
  arc.centroid = function() {
    var r = (+innerRadius.apply(this, arguments) + +outerRadius.apply(this, arguments)) / 2, a2 = (+startAngle.apply(this, arguments) + +endAngle.apply(this, arguments)) / 2 - pi / 2;
    return [cos(a2) * r, sin(a2) * r];
  };
  arc.innerRadius = function(_2) {
    return arguments.length ? (innerRadius = typeof _2 === "function" ? _2 : constant(+_2), arc) : innerRadius;
  };
  arc.outerRadius = function(_2) {
    return arguments.length ? (outerRadius = typeof _2 === "function" ? _2 : constant(+_2), arc) : outerRadius;
  };
  arc.cornerRadius = function(_2) {
    return arguments.length ? (cornerRadius = typeof _2 === "function" ? _2 : constant(+_2), arc) : cornerRadius;
  };
  arc.padRadius = function(_2) {
    return arguments.length ? (padRadius = _2 == null ? null : typeof _2 === "function" ? _2 : constant(+_2), arc) : padRadius;
  };
  arc.startAngle = function(_2) {
    return arguments.length ? (startAngle = typeof _2 === "function" ? _2 : constant(+_2), arc) : startAngle;
  };
  arc.endAngle = function(_2) {
    return arguments.length ? (endAngle = typeof _2 === "function" ? _2 : constant(+_2), arc) : endAngle;
  };
  arc.padAngle = function(_2) {
    return arguments.length ? (padAngle = typeof _2 === "function" ? _2 : constant(+_2), arc) : padAngle;
  };
  arc.context = function(_2) {
    return arguments.length ? (context = _2 == null ? null : _2, arc) : context;
  };
  return arc;
}
function descending(a2, b2) {
  return b2 < a2 ? -1 : b2 > a2 ? 1 : b2 >= a2 ? 0 : NaN;
}
function identity(d2) {
  return d2;
}
function D$1() {
  var value = identity, sortValues = descending, sort = null, startAngle = constant(0), endAngle = constant(tau), padAngle = constant(0);
  function pie(data) {
    var i, n = (data = array(data)).length, j2, k, sum = 0, index = new Array(n), arcs = new Array(n), a0 = +startAngle.apply(this, arguments), da = Math.min(tau, Math.max(-tau, endAngle.apply(this, arguments) - a0)), a1, p = Math.min(Math.abs(da) / n, padAngle.apply(this, arguments)), pa = p * (da < 0 ? -1 : 1), v;
    for (i = 0; i < n; ++i) {
      if ((v = arcs[index[i] = i] = +value(data[i], i, data)) > 0) {
        sum += v;
      }
    }
    if (sortValues != null) index.sort(function(i2, j3) {
      return sortValues(arcs[i2], arcs[j3]);
    });
    else if (sort != null) index.sort(function(i2, j3) {
      return sort(data[i2], data[j3]);
    });
    for (i = 0, k = sum ? (da - n * pa) / sum : 0; i < n; ++i, a0 = a1) {
      j2 = index[i], v = arcs[j2], a1 = a0 + (v > 0 ? v * k : 0) + pa, arcs[j2] = {
        data: data[j2],
        index: i,
        value: v,
        startAngle: a0,
        endAngle: a1,
        padAngle: p
      };
    }
    return arcs;
  }
  pie.value = function(_2) {
    return arguments.length ? (value = typeof _2 === "function" ? _2 : constant(+_2), pie) : value;
  };
  pie.sortValues = function(_2) {
    return arguments.length ? (sortValues = _2, sort = null, pie) : sortValues;
  };
  pie.sort = function(_2) {
    return arguments.length ? (sort = _2, sortValues = null, pie) : sort;
  };
  pie.startAngle = function(_2) {
    return arguments.length ? (startAngle = typeof _2 === "function" ? _2 : constant(+_2), pie) : startAngle;
  };
  pie.endAngle = function(_2) {
    return arguments.length ? (endAngle = typeof _2 === "function" ? _2 : constant(+_2), pie) : endAngle;
  };
  pie.padAngle = function(_2) {
    return arguments.length ? (padAngle = typeof _2 === "function" ? _2 : constant(+_2), pie) : padAngle;
  };
  return pie;
}
function b() {
  return b = Object.assign ? Object.assign.bind() : function(n) {
    for (var t = 1; t < arguments.length; t++) {
      var e = arguments[t];
      for (var r in e) ({}).hasOwnProperty.call(e, r) && (n[r] = e[r]);
    }
    return n;
  }, b.apply(null, arguments);
}
var L = { pointerEvents: "none" }, P$1 = function(t) {
  var e = t.label, r = t.style, o = M();
  return jsxRuntimeExports.jsx(animated.g, { transform: r.transform, opacity: r.progress, style: L, children: jsxRuntimeExports.jsx(b$1, { textAnchor: "middle", dominantBaseline: "central", style: b({}, o.labels.text, { fill: r.textColor }), children: e }) });
}, O = function(n) {
  var t = n % (2 * Math.PI);
  return t < 0 && (t += 2 * Math.PI), t;
}, E$1 = function(n, t) {
  return n.filter((function(n2) {
    return Math.abs(ct(n2.arc.endAngle - n2.arc.startAngle)) >= t;
  }));
}, W = { startAngle: { enter: function(n) {
  return b({}, n, { endAngle: n.startAngle });
}, update: function(n) {
  return n;
}, leave: function(n) {
  return b({}, n, { startAngle: n.endAngle });
} }, middleAngle: { enter: function(n) {
  var t = n.startAngle + (n.endAngle - n.startAngle) / 2;
  return b({}, n, { startAngle: t, endAngle: t });
}, update: function(n) {
  return n;
}, leave: function(n) {
  var t = n.startAngle + (n.endAngle - n.startAngle) / 2;
  return b({}, n, { startAngle: t, endAngle: t });
} }, endAngle: { enter: function(n) {
  return b({}, n, { startAngle: n.endAngle });
}, update: function(n) {
  return n;
}, leave: function(n) {
  return b({}, n, { endAngle: n.startAngle });
} }, innerRadius: { enter: function(n) {
  return b({}, n, { outerRadius: n.innerRadius });
}, update: function(n) {
  return n;
}, leave: function(n) {
  return b({}, n, { innerRadius: n.outerRadius });
} }, centerRadius: { enter: function(n) {
  var t = n.innerRadius + (n.outerRadius - n.innerRadius) / 2;
  return b({}, n, { innerRadius: t, outerRadius: t });
}, update: function(n) {
  return n;
}, leave: function(n) {
  var t = n.innerRadius + (n.outerRadius - n.innerRadius) / 2;
  return b({}, n, { innerRadius: t, outerRadius: t });
} }, outerRadius: { enter: function(n) {
  return b({}, n, { innerRadius: n.outerRadius });
}, update: function(n) {
  return n;
}, leave: function(n) {
  return b({}, n, { outerRadius: n.innerRadius });
} }, pushIn: { enter: function(n) {
  return b({}, n, { innerRadius: n.innerRadius - n.outerRadius + n.innerRadius, outerRadius: n.innerRadius });
}, update: function(n) {
  return n;
}, leave: function(n) {
  return b({}, n, { innerRadius: n.outerRadius, outerRadius: n.outerRadius + n.outerRadius - n.innerRadius });
} }, pushOut: { enter: function(n) {
  return b({}, n, { innerRadius: n.outerRadius, outerRadius: n.outerRadius + n.outerRadius - n.innerRadius });
}, update: function(n) {
  return n;
}, leave: function(n) {
  return b({}, n, { innerRadius: n.innerRadius - n.outerRadius + n.innerRadius, outerRadius: n.innerRadius });
} } }, j$1 = function(n, t) {
  return reactExports.useMemo((function() {
    var e = W[n];
    return { enter: function(n2) {
      return b({ progress: 0 }, e.enter(n2.arc), t ? t.enter(n2) : {});
    }, update: function(n2) {
      return b({ progress: 1 }, e.update(n2.arc), t ? t.update(n2) : {});
    }, leave: function(n2) {
      return b({ progress: 0 }, e.leave(n2.arc), t ? t.leave(n2) : {});
    } };
  }), [n, t]);
}, w = function(n, t) {
  var e = st(n) - Math.PI / 2, r = n.innerRadius + (n.outerRadius - n.innerRadius) * t;
  return ft(e, r);
}, B = function(n) {
  return function(e, r, i, a2) {
    return to([e, r, i, a2], (function(t, e2, r2, i2) {
      var a3 = w({ startAngle: t, endAngle: e2, innerRadius: r2, outerRadius: i2 }, n);
      return "translate(" + a3.x + "," + a3.y + ")";
    }));
  };
}, S = function(n, t, r, i) {
  void 0 === t && (t = 0.5), void 0 === r && (r = "innerRadius");
  var a2 = Dr(), o = a2.animate, u = a2.config, s = j$1(r, i);
  return { transition: useTransition(n, { keys: function(n2) {
    return n2.id;
  }, initial: s.update, from: s.enter, enter: s.update, update: s.update, leave: s.leave, config: u, immediate: !o }), interpolate: B(t) };
}, G = function(n) {
  var t = n.data, e = n.offset, r = void 0 === e ? 0.5 : e, i = n.skipAngle, a2 = void 0 === i ? 0 : i, o = n.computeExtraProps, u = void 0 === o ? function() {
    return {};
  } : o;
  return reactExports.useMemo((function() {
    return E$1(t, a2).map((function(n2) {
      var t2 = w(n2.arc, r);
      return b({}, u(n2), { x: t2.x, y: t2.y, data: n2 });
    }));
  }), [t, r, a2, u]);
}, q$1 = function(n) {
  var t = n.center, e = n.data, r = n.transitionMode, a2 = n.label, o = n.radiusOffset, u = n.skipAngle, l = n.skipRadius, f = n.textColor, p = n.component, h = void 0 === p ? P$1 : p, v = bn(a2), R = M(), x = Ye(f, R), m = reactExports.useMemo((function() {
    return e.filter((function(n2) {
      var t2 = Math.abs(ct(n2.arc.endAngle - n2.arc.startAngle)), e2 = Math.abs(n2.arc.outerRadius - n2.arc.innerRadius);
      return t2 >= u && e2 >= l;
    }));
  }), [e, u, l]), y = S(m, o, r), k = y.transition, C2 = y.interpolate, b2 = h;
  return jsxRuntimeExports.jsx("g", { transform: "translate(" + t[0] + "," + t[1] + ")", children: k((function(n2, t2) {
    return reactExports.createElement(b2, { key: t2.id, datum: t2, label: v(t2), style: { progress: n2.progress, transform: C2(n2.startAngle, n2.endAngle, n2.innerRadius, n2.outerRadius), textColor: x(t2) } });
  })) });
}, z = function(n, t, e) {
  a(n, e.labels.text), n.textAlign = "center", n.textBaseline = "middle", t.forEach((function(t2) {
    d(n, b({}, e.labels.text, { fill: t2.textColor }), String(t2.label), t2.x, t2.y);
  }));
}, D = function(n) {
  var t = n.data, e = n.offset, r = n.skipAngle, a2 = n.label, o = n.textColor, u = bn(a2), s = M(), l = Ye(o, s), d2 = reactExports.useCallback((function(n2) {
    return { label: u(n2), textColor: l(n2) };
  }), [u, l]);
  return G({ data: t, offset: e, skipAngle: r, computeExtraProps: d2 });
}, H = function(t) {
  var e = t.label, r = t.style, o = M();
  return jsxRuntimeExports.jsxs(animated.g, { opacity: r.opacity, children: [jsxRuntimeExports.jsx(animated.path, { fill: "none", stroke: r.linkColor, strokeWidth: r.thickness, d: r.path }), jsxRuntimeExports.jsx(b$1, { transform: r.textPosition, textAnchor: r.textAnchor, dominantBaseline: "central", style: b({}, o.labels.text, { fill: r.textColor }), children: e })] });
}, J$1 = function(n) {
  var t = O(n.startAngle + (n.endAngle - n.startAngle) / 2 - Math.PI / 2);
  return t < Math.PI / 2 || t > 1.5 * Math.PI ? "start" : "end";
}, K$1 = function(n, t, e, r) {
  var i, a2, o = O(n.startAngle + (n.endAngle - n.startAngle) / 2 - Math.PI / 2), u = ft(o, n.outerRadius + t), s = ft(o, n.outerRadius + t + e);
  return o < Math.PI / 2 || o > 1.5 * Math.PI ? (i = "after", a2 = { x: s.x + r, y: s.y }) : (i = "before", a2 = { x: s.x - r, y: s.y }), { side: i, points: [u, s, a2] };
}, N = P$2().x((function(n) {
  return n.x;
})).y((function(n) {
  return n.y;
})), Q$1 = function(n, e, r, i, a2, o, u) {
  return to([n, e, r, i, a2, o, u], (function(n2, t, e2, r2, i2, a3, o2) {
    var u2 = K$1({ startAngle: n2, endAngle: t, outerRadius: r2 }, i2, a3, o2).points;
    return N(u2);
  }));
}, U$1 = function(n, e, r, i) {
  return to([n, e, r, i], (function(n2, t, e2, r2) {
    return J$1({ startAngle: n2, endAngle: t });
  }));
}, V = function(n, e, r, i, a2, o, u, s) {
  return to([n, e, r, i, a2, o, u, s], (function(n2, t, e2, r2, i2, a3, o2, u2) {
    var s2 = K$1({ startAngle: n2, endAngle: t, outerRadius: r2 }, i2, a3, o2), l = s2.points, d2 = s2.side, c = l[2];
    return "before" === d2 ? c.x -= u2 : c.x += u2, "translate(" + c.x + "," + c.y + ")";
  }));
}, X$1 = function(n) {
  var t = n.data, r = n.offset, a2 = void 0 === r ? 0 : r, o = n.diagonalLength, u = n.straightLength, s = n.skipAngle, l = void 0 === s ? 0 : s, c = n.textOffset, f = n.linkColor, g = n.textColor, p = Dr(), h = p.animate, v = p.config, A = M(), x = Ye(f, A), m = Ye(g, A), y = (function(n2, t2) {
    return reactExports.useMemo((function() {
      return E$1(n2, t2);
    }), [n2, t2]);
  })(t, l), k = (function(n2) {
    var t2 = n2.offset, e = n2.diagonalLength, r2 = n2.straightLength, i = n2.textOffset, a3 = n2.getLinkColor, o2 = n2.getTextColor;
    return reactExports.useMemo((function() {
      return { enter: function(n3) {
        return { startAngle: n3.arc.startAngle, endAngle: n3.arc.endAngle, innerRadius: n3.arc.innerRadius, outerRadius: n3.arc.outerRadius, offset: t2, diagonalLength: 0, straightLength: 0, textOffset: i, linkColor: a3(n3), textColor: o2(n3), opacity: 0 };
      }, update: function(n3) {
        return { startAngle: n3.arc.startAngle, endAngle: n3.arc.endAngle, innerRadius: n3.arc.innerRadius, outerRadius: n3.arc.outerRadius, offset: t2, diagonalLength: e, straightLength: r2, textOffset: i, linkColor: a3(n3), textColor: o2(n3), opacity: 1 };
      }, leave: function(n3) {
        return { startAngle: n3.arc.startAngle, endAngle: n3.arc.endAngle, innerRadius: n3.arc.innerRadius, outerRadius: n3.arc.outerRadius, offset: t2, diagonalLength: 0, straightLength: 0, textOffset: i, linkColor: a3(n3), textColor: o2(n3), opacity: 0 };
      } };
    }), [e, r2, i, a3, o2, t2]);
  })({ offset: a2, diagonalLength: o, straightLength: u, textOffset: c, getLinkColor: x, getTextColor: m });
  return { transition: useTransition(y, { keys: function(n2) {
    return n2.id;
  }, initial: k.update, from: k.enter, enter: k.update, update: k.update, leave: k.leave, config: v, immediate: !h }), interpolateLink: Q$1, interpolateTextAnchor: U$1, interpolateTextPosition: V };
}, Y$1 = function(n) {
  var t = n.center, e = n.data, r = n.label, i = n.skipAngle, a2 = n.offset, o = n.diagonalLength, u = n.straightLength, l = n.strokeWidth, d2 = n.textOffset, f = n.textColor, g = n.linkColor, p = n.component, h = void 0 === p ? H : p, v = bn(r), R = X$1({ data: e, skipAngle: i, offset: a2, diagonalLength: o, straightLength: u, textOffset: d2, linkColor: g, textColor: f }), x = R.transition, m = R.interpolateLink, y = R.interpolateTextAnchor, M2 = R.interpolateTextPosition, k = h;
  return jsxRuntimeExports.jsx("g", { transform: "translate(" + t[0] + "," + t[1] + ")", children: x((function(n2, t2) {
    return reactExports.createElement(k, { key: t2.id, datum: t2, label: v(t2), style: b({}, n2, { thickness: l, path: m(n2.startAngle, n2.endAngle, n2.innerRadius, n2.outerRadius, n2.offset, n2.diagonalLength, n2.straightLength), textAnchor: y(n2.startAngle, n2.endAngle, n2.innerRadius, n2.outerRadius), textPosition: M2(n2.startAngle, n2.endAngle, n2.innerRadius, n2.outerRadius, n2.offset, n2.diagonalLength, n2.straightLength, n2.textOffset) }) });
  })) });
}, Z$1 = function(n, t, e, r) {
  n.textBaseline = "middle", a(n, e.labels.text), t.forEach((function(t2) {
    n.textAlign = gt.canvas.align[t2.textAnchor], d(n, b({}, e.labels.text, { fill: t2.textColor }), String(t2.label), t2.x, t2.y), n.beginPath(), n.strokeStyle = t2.linkColor, n.lineWidth = r, t2.points.forEach((function(t3, e2) {
      0 === e2 ? n.moveTo(t3.x, t3.y) : n.lineTo(t3.x, t3.y);
    })), n.stroke();
  }));
}, $$1 = function(n) {
  var t = n.data, e = n.skipAngle, r = void 0 === e ? 0 : e, i = n.offset, a2 = void 0 === i ? 0.5 : i, o = n.diagonalLength, u = n.straightLength, s = n.computeExtraProps, l = void 0 === s ? function() {
    return {};
  } : s, c = reactExports.useMemo((function() {
    return t.filter((function(n2) {
      return Math.abs(ct(n2.arc.endAngle - n2.arc.startAngle)) >= r;
    })).map((function(n2) {
      return b({}, K$1(n2.arc, a2, o, u), { data: n2 });
    }));
  }), [t, r, a2, o, u]);
  return reactExports.useMemo((function() {
    return c.map((function(n2) {
      return b({}, l(n2), n2);
    }));
  }), [c, l]);
}, _$1 = function(n) {
  var t = n.data, e = n.skipAngle, r = n.offset, a2 = n.diagonalLength, o = n.straightLength, u = n.textOffset, s = void 0 === u ? 0 : u, l = n.label, d2 = n.linkColor, c = n.textColor, g = bn(l), p = M(), h = Ye(d2, p), v = Ye(c, p), R = reactExports.useCallback((function(n2) {
    var t2, e2 = { x: n2.points[2].x, y: n2.points[2].y };
    return "before" === n2.side ? (e2.x -= s, t2 = "end") : (e2.x += s, t2 = "start"), b({}, e2, { label: g(n2.data), linkColor: h(n2.data), textAnchor: t2, textColor: v(n2.data) });
  }), [g, h, v, s]);
  return $$1({ data: t, skipAngle: e, offset: r, diagonalLength: a2, straightLength: o, computeExtraProps: R });
}, rn = function(t) {
  var e = t.datum, r = t.style, i = t.onClick, a2 = t.onMouseEnter, o = t.onMouseMove, u = t.onMouseLeave, l = reactExports.useCallback((function(n) {
    return null == i ? void 0 : i(e, n);
  }), [i, e]), d2 = reactExports.useCallback((function(n) {
    return null == a2 ? void 0 : a2(e, n);
  }), [a2, e]), c = reactExports.useCallback((function(n) {
    return null == o ? void 0 : o(e, n);
  }), [o, e]), g = reactExports.useCallback((function(n) {
    return null == u ? void 0 : u(e, n);
  }), [u, e]);
  return jsxRuntimeExports.jsx(animated.path, { d: r.path, opacity: r.opacity, fill: e.fill || r.color, stroke: r.borderColor, strokeWidth: r.borderWidth, onClick: i ? l : void 0, onMouseEnter: a2 ? d2 : void 0, onMouseMove: o ? c : void 0, onMouseLeave: u ? g : void 0, "data-testid": "arc." + e.id });
}, an = function(n, e, r, i, a2) {
  return to([n, e, r, i], (function(n2, t, e2, r2) {
    return a2({ startAngle: n2, endAngle: t, innerRadius: Math.max(0, e2), outerRadius: Math.max(0, r2) });
  }));
}, on = function(n, t, r) {
  void 0 === t && (t = "innerRadius");
  var i = Dr(), a2 = i.animate, o = i.config, u = j$1(t, r);
  return { transition: useTransition(n, { keys: function(n2) {
    return n2.id;
  }, initial: u.update, from: u.enter, enter: u.update, update: u.update, leave: u.leave, config: o, immediate: !a2 }), interpolate: an };
}, un = function(n) {
  var t = n.center, e = n.data, r = n.arcGenerator, a2 = n.borderWidth, o = n.borderColor, u = n.onClick, l = n.onMouseEnter, d2 = n.onMouseMove, f = n.onMouseLeave, g = n.transitionMode, p = n.component, h = void 0 === p ? rn : p, v = M(), R = Ye(o, v), A = on(e, g, { enter: function(n2) {
    return { opacity: 0, color: n2.color, borderColor: R(n2) };
  }, update: function(n2) {
    return { opacity: 1, color: n2.color, borderColor: R(n2) };
  }, leave: function(n2) {
    return { opacity: 0, color: n2.color, borderColor: R(n2) };
  } }), x = A.transition, m = A.interpolate, y = h;
  return jsxRuntimeExports.jsx("g", { transform: "translate(" + t[0] + "," + t[1] + ")", children: x((function(n2, t2) {
    return reactExports.createElement(y, { key: t2.id, datum: t2, style: b({}, n2, { borderWidth: a2, path: m(n2.startAngle, n2.endAngle, n2.innerRadius, n2.outerRadius, r) }), onClick: u, onMouseEnter: l, onMouseMove: d2, onMouseLeave: f });
  })) });
}, sn = function(n, t, e, r, i, a2) {
  void 0 === a2 && (a2 = true);
  var o = [], u = ft(ut(r), e);
  o.push([u.x, u.y]);
  var s = ft(ut(i), e);
  o.push([s.x, s.y]);
  for (var l = Math.round(Math.min(r, i)); l <= Math.round(Math.max(r, i)); l++) if (l % 90 == 0) {
    var d2 = ft(ut(l), e);
    o.push([d2.x, d2.y]);
  }
  o = o.map((function(e2) {
    var r2 = e2[0], i2 = e2[1];
    return [n + r2, t + i2];
  })), a2 && o.push([n, t]);
  var c = o.map((function(n2) {
    return n2[0];
  })), f = o.map((function(n2) {
    return n2[1];
  })), g = Math.min.apply(Math, c), v = Math.max.apply(Math, c), R = Math.min.apply(Math, f);
  return { points: o, x: g, y: R, width: v - g, height: Math.max.apply(Math, f) - R };
}, ln = function(n, t, e, r, i, a2) {
  var o = yn(i, a2, n, t);
  return o < e && o > r;
}, dn = function(n, t, e, r, i, a2, o) {
  if (ln(n, t, e, r, a2, o)) {
    var u = _n(a2, o, n, t);
    return i.find((function(n2) {
      var t2 = n2.startAngle, e2 = n2.endAngle;
      return u >= t2 && u < e2;
    }));
  }
}, fn = function(n) {
  var t = void 0 === n ? {} : n, e = t.cornerRadius, r = void 0 === e ? 0 : e, i = t.padAngle, a2 = void 0 === i ? 0 : i;
  return reactExports.useMemo((function() {
    return C().innerRadius((function(n2) {
      return n2.innerRadius;
    })).outerRadius((function(n2) {
      return n2.outerRadius;
    })).cornerRadius(r).padAngle(a2);
  }), [r, a2]);
};
function E() {
  return E = Object.assign ? Object.assign.bind() : function(e) {
    for (var i = 1; i < arguments.length; i++) {
      var t = arguments[i];
      for (var a2 in t) ({}).hasOwnProperty.call(t, a2) && (e[a2] = t[a2]);
    }
    return e;
  }, E.apply(null, arguments);
}
function F(e, i) {
  if (null == e) return {};
  var t = {};
  for (var a2 in e) if ({}.hasOwnProperty.call(e, a2)) {
    if (-1 !== i.indexOf(a2)) continue;
    t[a2] = e[a2];
  }
  return t;
}
var X, Y = function(e) {
  var i = e.width, t = e.height, a2 = e.legends, n = e.data, r = e.toggleSerie;
  return jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: a2.map((function(e2, a3) {
    var o;
    return jsxRuntimeExports.jsx(E$2, E({}, e2, { containerWidth: i, containerHeight: t, data: null != (o = e2.data) ? o : n, toggleSerie: e2.toggleSerie ? r : void 0 }), a3);
  })) });
}, P = { id: "id", value: "value", sortByValue: false, innerRadius: 0, padAngle: 0, cornerRadius: 0, layers: ["arcs", "arcLinkLabels", "arcLabels", "legends"], startAngle: 0, endAngle: 360, fit: true, activeInnerRadiusOffset: 0, activeOuterRadiusOffset: 0, borderWidth: 0, borderColor: { from: "color", modifiers: [["darker", 1]] }, enableArcLabels: true, arcLabel: "formattedValue", arcLabelsSkipAngle: 0, arcLabelsSkipRadius: 0, arcLabelsRadiusOffset: 0.5, arcLabelsTextColor: { theme: "labels.text.fill" }, enableArcLinkLabels: true, arcLinkLabel: "id", arcLinkLabelsSkipAngle: 0, arcLinkLabelsOffset: 0, arcLinkLabelsDiagonalLength: 16, arcLinkLabelsStraightLength: 24, arcLinkLabelsThickness: 1, arcLinkLabelsTextOffset: 6, arcLinkLabelsTextColor: { theme: "labels.text.fill" }, arcLinkLabelsColor: { theme: "axis.ticks.line.stroke" }, colors: { scheme: "nivo" }, defs: [], fill: [], isInteractive: true, animate: true, motionConfig: "gentle", transitionMode: "innerRadius", tooltip: function(e) {
  var i = e.datum;
  return jsxRuntimeExports.jsx(T, { id: i.id, value: i.formattedValue, enableChip: true, color: i.color });
}, legends: [], role: "img", pixelRatio: "undefined" != typeof window && null != (X = window.devicePixelRatio) ? X : 1 }, j = ["points"], q = function(i) {
  var t = i.data, a2 = i.id, n = void 0 === a2 ? P.id : a2, r = i.value, o = void 0 === r ? P.value : r, d2 = i.valueFormat, c = i.colors, u = void 0 === c ? P.colors : c, f = bn(n), v = bn(o), g = hn(d2), h = hr(u, "id");
  return reactExports.useMemo((function() {
    return t.map((function(e) {
      var i2, t2 = f(e), a3 = v(e), n2 = { id: t2, label: null != (i2 = e.label) ? i2 : t2, hidden: false, value: a3, formattedValue: g(a3), data: e };
      return E({}, n2, { color: h(n2) });
    }));
  }), [t, f, v, g, h]);
}, J = function(a2) {
  var n = a2.data, r = a2.startAngle, o = a2.endAngle, d2 = a2.innerRadius, l = a2.outerRadius, s = a2.padAngle, f = a2.sortByValue, v = a2.activeId, g = a2.activeInnerRadiusOffset, h = a2.activeOuterRadiusOffset, L2 = a2.hiddenIds, b2 = a2.forwardLegendData, A = reactExports.useMemo((function() {
    var e = D$1().value((function(e2) {
      return e2.value;
    })).startAngle(ut(r)).endAngle(ut(o)).padAngle(ut(s));
    return f || e.sortValues(null), e;
  }), [r, o, s, f]), p = reactExports.useMemo((function() {
    var e = n.filter((function(e2) {
      return !L2.includes(e2.id);
    }));
    return { dataWithArc: A(e).map((function(e2) {
      var i = Math.abs(e2.endAngle - e2.startAngle);
      return E({}, e2.data, { arc: { index: e2.index, startAngle: e2.startAngle, endAngle: e2.endAngle, innerRadius: v === e2.data.id ? d2 - g : d2, outerRadius: v === e2.data.id ? l + h : l, thickness: l - d2, padAngle: e2.padAngle, angle: i, angleDeg: ct(i) } });
    })), legendData: n.map((function(e2) {
      return { id: e2.id, label: e2.label, color: e2.color, hidden: L2.includes(e2.id), data: e2 };
    })) };
  }), [A, n, L2, v, d2, g, l, h]), R = p.legendData, k = reactExports.useRef(b2);
  return reactExports.useEffect((function() {
    "function" == typeof k.current && k.current(R);
  }), [k, R]), p;
}, K = function(e) {
  var i = e.activeId, t = e.onActiveIdChange, r = e.defaultActiveId, o = void 0 !== i, d2 = reactExports.useState(o ? null : void 0 === r ? null : r), l = d2[0], s = d2[1];
  return { activeId: o ? i : l, setActiveId: reactExports.useCallback((function(e2) {
    t && t(e2), o || s(e2);
  }), [o, t, s]) };
}, Q = function(i) {
  var t = i.data, r = i.width, o = i.height, d2 = i.innerRadius, l = void 0 === d2 ? P.innerRadius : d2, s = i.startAngle, u = void 0 === s ? P.startAngle : s, f = i.endAngle, v = void 0 === f ? P.endAngle : f, g = i.padAngle, h = void 0 === g ? P.padAngle : g, L2 = i.sortByValue, b2 = void 0 === L2 ? P.sortByValue : L2, A = i.cornerRadius, k = void 0 === A ? P.cornerRadius : A, m = i.fit, I = void 0 === m ? P.fit : m, O2 = i.activeInnerRadiusOffset, C2 = void 0 === O2 ? P.activeInnerRadiusOffset : O2, w2 = i.activeOuterRadiusOffset, x = void 0 === w2 ? P.activeOuterRadiusOffset : w2, W2 = i.activeId, M2 = i.onActiveIdChange, y = i.defaultActiveId, S2 = i.forwardLegendData, T2 = K({ activeId: W2, onActiveIdChange: M2, defaultActiveId: y }), D2 = T2.activeId, V2 = T2.setActiveId, B2 = reactExports.useState([]), z2 = B2[0], H2 = B2[1], G2 = reactExports.useMemo((function() {
    var e, i2 = Math.min(r, o) / 2, t2 = i2 * Math.min(l, 1), a2 = r / 2, n = o / 2;
    if (I) {
      var d3 = sn(a2, n, i2, u - 90, v - 90), s2 = d3.points, c = F(d3, j), f2 = Math.min(r / c.width, o / c.height), g2 = { width: c.width * f2, height: c.height * f2 };
      g2.x = (r - g2.width) / 2, g2.y = (o - g2.height) / 2, a2 = (a2 - c.x) / c.width * c.width * f2 + g2.x, n = (n - c.y) / c.height * c.height * f2 + g2.y, e = { box: c, ratio: f2, points: s2 }, i2 *= f2, t2 *= f2;
    }
    return { centerX: a2, centerY: n, radius: i2, innerRadius: t2, debug: e };
  }), [r, o, l, u, v, I]), X2 = J({ data: t, startAngle: u, endAngle: v, innerRadius: G2.innerRadius, outerRadius: G2.radius, padAngle: h, sortByValue: b2, activeId: D2, activeInnerRadiusOffset: C2, activeOuterRadiusOffset: x, hiddenIds: z2, forwardLegendData: S2 }), Y2 = reactExports.useCallback((function(e) {
    H2((function(i2) {
      return i2.indexOf(e) > -1 ? i2.filter((function(i3) {
        return i3 !== e;
      })) : [].concat(i2, [e]);
    }));
  }), []);
  return E({ arcGenerator: fn({ cornerRadius: k, padAngle: ut(h) }), activeId: D2, setActiveId: V2, toggleSerie: Y2 }, X2, G2);
}, U = function(i) {
  var t = i.dataWithArc, a2 = i.arcGenerator, n = i.centerX, r = i.centerY, o = i.radius, d2 = i.innerRadius;
  return reactExports.useMemo((function() {
    return { dataWithArc: t, arcGenerator: a2, centerX: n, centerY: r, radius: o, innerRadius: d2 };
  }), [t, a2, n, r, o, d2]);
}, Z = function(i) {
  var t = i.center, a2 = i.data, n = i.arcGenerator, o = i.borderWidth, d2 = i.borderColor, l = i.isInteractive, s = i.onClick, c = i.onMouseEnter, u = i.onMouseMove, f = i.onMouseLeave, v = i.setActiveId, g = i.tooltip, h = i.transitionMode, L2 = z$1(), b2 = L2.showTooltipFromEvent, A = L2.hideTooltip, p = reactExports.useMemo((function() {
    if (l) return function(e, i2) {
      null == s || s(e, i2);
    };
  }), [l, s]), R = reactExports.useMemo((function() {
    if (l) return function(e, i2) {
      b2(reactExports.createElement(g, { datum: e }), i2), v(e.id), null == c || c(e, i2);
    };
  }), [l, b2, v, c, g]), m = reactExports.useMemo((function() {
    if (l) return function(e, i2) {
      b2(reactExports.createElement(g, { datum: e }), i2), null == u || u(e, i2);
    };
  }), [l, b2, u, g]), I = reactExports.useMemo((function() {
    if (l) return function(e, i2) {
      A(), v(null), null == f || f(e, i2);
    };
  }), [l, A, v, f]);
  return jsxRuntimeExports.jsx(un, { center: t, data: a2, arcGenerator: n, borderWidth: o, borderColor: d2, transitionMode: h, onClick: p, onMouseEnter: R, onMouseMove: m, onMouseLeave: I });
}, $ = ["isInteractive", "animate", "motionConfig", "theme", "renderWrapper"], _ = function(e) {
  var i = e.data, t = e.id, a2 = void 0 === t ? P.id : t, n = e.value, o = void 0 === n ? P.value : n, l = e.valueFormat, s = e.sortByValue, c = void 0 === s ? P.sortByValue : s, u = e.layers, f = void 0 === u ? P.layers : u, L2 = e.startAngle, b2 = void 0 === L2 ? P.startAngle : L2, A = e.endAngle, p = void 0 === A ? P.endAngle : A, R = e.padAngle, k = void 0 === R ? P.padAngle : R, O2 = e.fit, C2 = void 0 === O2 ? P.fit : O2, w2 = e.innerRadius, x = void 0 === w2 ? P.innerRadius : w2, W2 = e.cornerRadius, M2 = void 0 === W2 ? P.cornerRadius : W2, y = e.activeInnerRadiusOffset, T2 = void 0 === y ? P.activeInnerRadiusOffset : y, D2 = e.activeOuterRadiusOffset, V2 = void 0 === D2 ? P.activeOuterRadiusOffset : D2, B2 = e.width, z2 = e.height, H2 = e.margin, G2 = e.colors, E2 = void 0 === G2 ? P.colors : G2, F2 = e.borderWidth, X2 = void 0 === F2 ? P.borderWidth : F2, j2 = e.borderColor, J2 = void 0 === j2 ? P.borderColor : j2, K2 = e.enableArcLabels, N2 = void 0 === K2 ? P.enableArcLabels : K2, $2 = e.arcLabel, _2 = void 0 === $2 ? P.arcLabel : $2, ee2 = e.arcLabelsSkipAngle, ie2 = void 0 === ee2 ? P.arcLabelsSkipAngle : ee2, te2 = e.arcLabelsSkipRadius, ae2 = void 0 === te2 ? P.arcLabelsSkipRadius : te2, ne2 = e.arcLabelsTextColor, re2 = void 0 === ne2 ? P.arcLabelsTextColor : ne2, oe2 = e.arcLabelsRadiusOffset, de = void 0 === oe2 ? P.arcLabelsRadiusOffset : oe2, le = e.arcLabelsComponent, se = e.enableArcLinkLabels, ce = void 0 === se ? P.enableArcLinkLabels : se, ue = e.arcLinkLabel, fe = void 0 === ue ? P.arcLinkLabel : ue, ve = e.arcLinkLabelsSkipAngle, ge = void 0 === ve ? P.arcLinkLabelsSkipAngle : ve, he = e.arcLinkLabelsOffset, Le = void 0 === he ? P.arcLinkLabelsOffset : he, be = e.arcLinkLabelsDiagonalLength, Ae = void 0 === be ? P.arcLinkLabelsDiagonalLength : be, pe = e.arcLinkLabelsStraightLength, Re = void 0 === pe ? P.arcLinkLabelsStraightLength : pe, ke = e.arcLinkLabelsThickness, me = void 0 === ke ? P.arcLinkLabelsThickness : ke, Ie = e.arcLinkLabelsTextOffset, Oe = void 0 === Ie ? P.arcLinkLabelsTextOffset : Ie, Ce = e.arcLinkLabelsTextColor, we = void 0 === Ce ? P.arcLinkLabelsTextColor : Ce, xe = e.arcLinkLabelsColor, We = void 0 === xe ? P.arcLinkLabelsColor : xe, Me = e.arcLinkLabelComponent, ye = e.defs, Se = void 0 === ye ? P.defs : ye, Te = e.fill, De = void 0 === Te ? P.fill : Te, Ve = e.isInteractive, Be = void 0 === Ve ? P.isInteractive : Ve, ze = e.onClick, He = e.onMouseEnter, Ge = e.onMouseMove, Ee = e.onMouseLeave, Fe = e.tooltip, Xe = void 0 === Fe ? P.tooltip : Fe, Ye2 = e.activeId, Pe = e.onActiveIdChange, je = e.defaultActiveId, qe = e.transitionMode, Je = void 0 === qe ? P.transitionMode : qe, Ke = e.legends, Ne = void 0 === Ke ? P.legends : Ke, Qe = e.forwardLegendData, Ue = e.role, Ze = void 0 === Ue ? P.role : Ue, $e = e.forwardedRef, _e = cn(B2, z2, H2), ei = _e.outerWidth, ii = _e.outerHeight, ti = _e.margin, ai = _e.innerWidth, ni = _e.innerHeight, ri = q({ data: i, id: a2, value: o, valueFormat: l, colors: E2 }), oi = Q({ data: ri, width: ai, height: ni, fit: C2, innerRadius: x, startAngle: b2, endAngle: p, padAngle: k, sortByValue: c, cornerRadius: M2, activeInnerRadiusOffset: T2, activeOuterRadiusOffset: V2, activeId: Ye2, onActiveIdChange: Pe, defaultActiveId: je, forwardLegendData: Qe }), di = oi.dataWithArc, li = oi.legendData, si = oi.arcGenerator, ci = oi.centerX, ui = oi.centerY, fi = oi.radius, vi = oi.innerRadius, gi = oi.setActiveId, hi = oi.toggleSerie, Li = Mn(Se, di, De), bi = { arcs: null, arcLinkLabels: null, arcLabels: null, legends: null };
  f.includes("arcs") && (bi.arcs = jsxRuntimeExports.jsx(Z, { center: [ci, ui], data: di, arcGenerator: si, borderWidth: X2, borderColor: J2, isInteractive: Be, onClick: ze, onMouseEnter: He, onMouseMove: Ge, onMouseLeave: Ee, setActiveId: gi, tooltip: Xe, transitionMode: Je }, "arcs")), ce && f.includes("arcLinkLabels") && (bi.arcLinkLabels = jsxRuntimeExports.jsx(Y$1, { center: [ci, ui], data: di, label: fe, skipAngle: ge, offset: Le, diagonalLength: Ae, straightLength: Re, strokeWidth: me, textOffset: Oe, textColor: we, linkColor: We, component: Me }, "arcLinkLabels")), N2 && f.includes("arcLabels") && (bi.arcLabels = jsxRuntimeExports.jsx(q$1, { center: [ci, ui], data: di, label: _2, radiusOffset: de, skipAngle: ie2, skipRadius: ae2, textColor: re2, transitionMode: Je, component: le }, "arcLabels")), Ne.length > 0 && f.includes("legends") && (bi.legends = jsxRuntimeExports.jsx(Y, { width: ai, height: ni, data: li, legends: Ne, toggleSerie: hi }, "legends"));
  var Ai = U({ dataWithArc: di, arcGenerator: si, centerX: ci, centerY: ui, radius: fi, innerRadius: vi });
  return jsxRuntimeExports.jsx(Rt, { width: ei, height: ii, margin: ti, defs: Li, role: Ze, ref: $e, children: f.map((function(e2, i2) {
    return void 0 !== bi[e2] ? bi[e2] : "function" == typeof e2 ? jsxRuntimeExports.jsx(reactExports.Fragment, { children: reactExports.createElement(e2, Ai) }, i2) : null;
  })) });
}, ee = reactExports.forwardRef((function(e, i) {
  var t = e.isInteractive, a2 = void 0 === t ? P.isInteractive : t, n = e.animate, r = void 0 === n ? P.animate : n, o = e.motionConfig, d2 = void 0 === o ? P.motionConfig : o, l = e.theme, s = e.renderWrapper, c = F(e, $);
  return jsxRuntimeExports.jsx(Fr, { animate: r, isInteractive: a2, motionConfig: d2, renderWrapper: s, theme: l, children: jsxRuntimeExports.jsx(_, E({ isInteractive: a2 }, c, { forwardedRef: i })) });
})), ie = ["defaultWidth", "defaultHeight", "onResize", "debounceResize"], te = reactExports.forwardRef((function(e, i) {
  var t = e.defaultWidth, a2 = e.defaultHeight, n = e.onResize, r = e.debounceResize, o = F(e, ie);
  return jsxRuntimeExports.jsx($r, { defaultWidth: t, defaultHeight: a2, onResize: n, debounceResize: r, children: function(e2) {
    var t2 = e2.width, a3 = e2.height;
    return jsxRuntimeExports.jsx(ee, E({ width: t2, height: a3 }, o, { ref: i }));
  } });
})), ae = ["isInteractive", "theme", "renderWrapper"], ne = function(a2) {
  var n = a2.data, o = a2.id, d2 = void 0 === o ? P.id : o, l = a2.value, s = void 0 === l ? P.value : l, c = a2.valueFormat, u = a2.sortByValue, f = void 0 === u ? P.sortByValue : u, g = a2.startAngle, h = void 0 === g ? P.startAngle : g, L2 = a2.endAngle, p = void 0 === L2 ? P.endAngle : L2, R = a2.padAngle, k = void 0 === R ? P.padAngle : R, m = a2.fit, I = void 0 === m ? P.fit : m, M$12 = a2.innerRadius, T2 = void 0 === M$12 ? P.innerRadius : M$12, D$12 = a2.cornerRadius, V2 = void 0 === D$12 ? P.cornerRadius : D$12, z$2 = a2.activeInnerRadiusOffset, F2 = void 0 === z$2 ? P.activeInnerRadiusOffset : z$2, X2 = a2.activeOuterRadiusOffset, Y2 = void 0 === X2 ? P.activeOuterRadiusOffset : X2, j2 = a2.width, J2 = a2.height, K2 = a2.margin, N2 = a2.pixelRatio, U2 = void 0 === N2 ? P.pixelRatio : N2, Z2 = a2.colors, $2 = void 0 === Z2 ? P.colors : Z2, _2 = a2.borderWidth, ee2 = void 0 === _2 ? P.borderWidth : _2, ie2 = a2.borderColor, te2 = void 0 === ie2 ? P.borderColor : ie2, ae2 = a2.enableArcLabels, ne2 = void 0 === ae2 ? P.enableArcLabels : ae2, re2 = a2.arcLabel, oe2 = void 0 === re2 ? P.arcLabel : re2, de = a2.arcLabelsSkipAngle, le = void 0 === de ? P.arcLabelsSkipAngle : de, se = a2.arcLabelsTextColor, ce = void 0 === se ? P.arcLabelsTextColor : se, ue = a2.arcLabelsRadiusOffset, fe = void 0 === ue ? P.arcLabelsRadiusOffset : ue, ve = a2.enableArcLinkLabels, ge = void 0 === ve ? P.enableArcLinkLabels : ve, he = a2.arcLinkLabel, Le = void 0 === he ? P.arcLinkLabel : he, be = a2.arcLinkLabelsSkipAngle, Ae = void 0 === be ? P.arcLinkLabelsSkipAngle : be, pe = a2.arcLinkLabelsOffset, Re = void 0 === pe ? P.arcLinkLabelsOffset : pe, ke = a2.arcLinkLabelsDiagonalLength, me = void 0 === ke ? P.arcLinkLabelsDiagonalLength : ke, Ie = a2.arcLinkLabelsStraightLength, Oe = void 0 === Ie ? P.arcLinkLabelsStraightLength : Ie, Ce = a2.arcLinkLabelsThickness, we = void 0 === Ce ? P.arcLinkLabelsThickness : Ce, xe = a2.arcLinkLabelsTextOffset, We = void 0 === xe ? P.arcLinkLabelsTextOffset : xe, Me = a2.arcLinkLabelsTextColor, ye = void 0 === Me ? P.arcLinkLabelsTextColor : Me, Se = a2.arcLinkLabelsColor, Te = void 0 === Se ? P.arcLinkLabelsColor : Se, De = a2.isInteractive, Ve = void 0 === De ? P.isInteractive : De, Be = a2.onClick, ze = a2.onMouseMove, He = a2.tooltip, Ge = void 0 === He ? P.tooltip : He, Ee = a2.activeId, Fe = a2.onActiveIdChange, Xe = a2.defaultActiveId, Ye$1 = a2.legends, Pe = void 0 === Ye$1 ? P.legends : Ye$1, je = a2.forwardLegendData, qe = a2.role, Je = a2.forwardedRef, Ke = reactExports.useRef(null), Ne = M(), Qe = cn(j2, J2, K2), Ue = Qe.margin, Ze = Qe.innerWidth, $e = Qe.innerHeight, _e = Qe.outerWidth, ei = Qe.outerHeight, ii = q({ data: n, id: d2, value: s, valueFormat: c, colors: $2 }), ti = Q({ data: ii, width: Ze, height: $e, fit: I, innerRadius: T2, startAngle: h, endAngle: p, padAngle: k, sortByValue: f, cornerRadius: V2, activeInnerRadiusOffset: F2, activeOuterRadiusOffset: Y2, activeId: Ee, onActiveIdChange: Fe, defaultActiveId: Xe, forwardLegendData: je }), ai = ti.dataWithArc, ni = ti.arcGenerator, ri = ti.centerX, oi = ti.centerY, di = ti.radius, li = ti.innerRadius, si = ti.setActiveId, ci = Ye(te2, Ne), ui = D({ data: ai, label: oe2, skipAngle: le, offset: fe, textColor: ce }), fi = _$1({ data: ai, skipAngle: Ae, offset: Re, diagonalLength: me, straightLength: Oe, label: Le, linkColor: Te, textOffset: We, textColor: ye });
  reactExports.useEffect((function() {
    if (Ke.current) {
      Ke.current.width = _e * U2, Ke.current.height = ei * U2;
      var e = Ke.current.getContext("2d");
      e.scale(U2, U2), e.fillStyle = Ne.background, e.fillRect(0, 0, _e, ei), e.save(), e.translate(Ue.left, Ue.top), ni.context(e), e.save(), e.translate(ri, oi), ai.forEach((function(i) {
        e.beginPath(), e.fillStyle = i.color, e.strokeStyle = ci(i), e.lineWidth = ee2, ni(i.arc), e.fill(), ee2 > 0 && e.stroke();
      })), true === ge && Z$1(e, fi, Ne, we), true === ne2 && z(e, ui, Ne), e.restore(), Pe.forEach((function(i) {
        L$1(e, E({}, i, { data: ai, containerWidth: Ze, containerHeight: $e, theme: Ne }));
      }));
    }
  }), [Ke, Ze, $e, _e, ei, Ue.top, Ue.left, U2, ri, oi, ni, ai, ee2, ci, ne2, ui, ge, fi, we, Pe, Ne]);
  var vi = reactExports.useMemo((function() {
    return ai.map((function(e) {
      return E({ id: e.id }, e.arc);
    }));
  }), [ai]), gi = function(e) {
    if (!Ke.current) return null;
    var i = kn(Ke.current, e), t = i[0], a3 = i[1], n2 = dn(Ue.left + ri, Ue.top + oi, di, li, vi, t, a3);
    return n2 ? ai.find((function(e2) {
      return e2.id === n2.id;
    })) : null;
  }, hi = z$1(), Li = hi.showTooltipFromEvent, bi = hi.hideTooltip, Ai = function(e) {
    var i = gi(e);
    i ? (null == ze || ze(i, e), si(i.id), Li(reactExports.createElement(Ge, { datum: i }), e)) : (si(null), bi());
  };
  return jsxRuntimeExports.jsx("canvas", { ref: Rn(Ke, Je), width: _e * U2, height: ei * U2, style: { width: _e, height: ei, cursor: Ve ? "auto" : "normal" }, onMouseEnter: Ve ? Ai : void 0, onMouseMove: Ve ? Ai : void 0, onMouseLeave: Ve ? function() {
    bi();
  } : void 0, onClick: Ve ? function(e) {
    if (Be) {
      var i = gi(e);
      i && Be(i, e);
    }
  } : void 0, role: qe });
}, re = reactExports.forwardRef((function(e, i) {
  var t = e.isInteractive, a2 = void 0 === t ? P.isInteractive : t, n = e.theme, r = e.renderWrapper, o = F(e, ae);
  return jsxRuntimeExports.jsx(Fr, { isInteractive: a2, renderWrapper: r, theme: n, children: jsxRuntimeExports.jsx(ne, E({ isInteractive: a2 }, o, { forwardedRef: i })) });
})), oe = ["defaultWidth", "defaultHeight", "onResize", "debounceResize"];
reactExports.forwardRef((function(e, i) {
  var t = e.defaultWidth, a2 = e.defaultHeight, n = e.onResize, r = e.debounceResize, o = F(e, oe);
  return jsxRuntimeExports.jsx($r, { defaultWidth: t, defaultHeight: a2, onResize: n, debounceResize: r, children: function(e2) {
    var t2 = e2.width, a3 = e2.height;
    return jsxRuntimeExports.jsx(re, E({ width: t2, height: a3 }, o, { ref: i }));
  } });
}));
const useUpdateScoringSettingsMutation = () => {
  const updateScoringSettings = useServerFn(updateScoringSettingsFn);
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["scoring", "update-settings"],
    mutationFn: async (payload) => {
      await updateScoringSettings({ data: payload });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scoring"] });
    }
  });
};
function ScoringSettings({ settings }) {
  return settings ? /* @__PURE__ */ jsxRuntimeExports.jsx(ScoringSettingsDisplay, { settings }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ScoringSettingsForm, {});
}
function ScoringSettingsDisplay({ settings }) {
  const { t } = useTranslation(["user-scoring"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface-card border border-grey-border rounded-md p-md flex gap-md items-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("user-scoring:settings.scale_used") }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-md items-center py-sm px-md bg-grey-background-light border border-grey-border rounded-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("user-scoring:settings.risk_levels_count", { count: settings.maxRiskLevel }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ScoringLevels, { maxLevel: settings.maxRiskLevel, className: "flex items-center gap-md" })
    ] })
  ] });
}
function ScoringSettingsForm() {
  const { t } = useTranslation(["user-scoring", "common"]);
  const [maxRiskLevel, setMaxRiskLevel] = reactExports.useState(3);
  const updateScoringSettingsMutation = useUpdateScoringSettingsMutation();
  const revalidate = useLoaderRevalidator();
  const handleValidateScale = () => {
    updateScoringSettingsMutation.mutateAsync({ maxRiskLevel }).then(() => {
      revalidate();
    }).catch(() => {
      zt.error(t("common:errors.unknown"));
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface-card border border-grey-border rounded-md p-md flex flex-col gap-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("user-scoring:settings.define_scale") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { appearance: "stroked", onClick: handleValidateScale, disabled: updateScoringSettingsMutation.isPending, children: t("user-scoring:settings.validate_scale") })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-4 gap-md", children: MAX_RISK_LEVELS.map((v) => /* @__PURE__ */ jsxRuntimeExports.jsx(ScoringScaleCard, { maxLevel: v, selected: maxRiskLevel === v, onSelect: () => setMaxRiskLevel(v) }, v)) })
  ] });
}
function ScoringScaleCard({ maxLevel, selected, onSelect }) {
  const { t } = useTranslation(["user-scoring"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      type: "button",
      className: cn$1(
        "bg-grey-background-light border border-grey-border p-md rounded-md flex flex-col gap-md text-left",
        {
          "bg-purple-background-light border-purple-primary": selected
        }
      ),
      onClick: onSelect,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: t("user-scoring:settings.levels", { count: maxLevel }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ScoringLevels, { maxLevel, className: "flex flex-col gap-md" })
      ]
    }
  );
}
function ScoringLevels({ maxLevel, className }) {
  const { t } = useTranslation(["user-scoring"]);
  if (!isMaxRiskLevelInRange(maxLevel)) {
    return null;
  }
  const colorEntries = scoringLevelEntries(SCORING_LEVELS_COLORS[maxLevel]);
  const labelKeys = SCORING_LEVELS_LABEL_KEYS[maxLevel];
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn$1(className), children: colorEntries.map(([level, color]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-sm items-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-4 rounded-full", style: { backgroundColor: color } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t(labelKeys[level] ?? "") })
  ] }, level)) });
}
function ScoringOverviewPage({ settings }) {
  const { t } = useTranslation(["common", "user-scoring"]);
  const { setOpen } = CreateRulesetPanelContext.useValue();
  const rulesetsQuery = useListScoringRulesetsQuery();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(ScoringSettings, { settings }),
    settings ? M$1(rulesetsQuery).with({ isPending: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, {}) })).with({ isError: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm items-center justify-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-60 text-center", children: t("common:generic_fetch_data_error") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", onClick: () => rulesetsQuery.refetch(), children: t("common:retry") })
    ] })).with({ isSuccess: true }, ({ data }) => {
      const rulesets = data?.rulesets ?? [];
      if (rulesets.length > 0) {
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-[repeat(auto-fill,minmax(500px,1fr))] gap-md", children: rulesets.map((ruleset) => /* @__PURE__ */ jsxRuntimeExports.jsx(ScoringRulesetCard, { ruleset, settings }, ruleset.id)) });
      }
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface-card border border-grey-border p-md rounded-md flex flex-col gap-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("user-scoring:overview.no_ruleset") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { appearance: "stroked", onClick: () => setOpen(true), children: t("user-scoring:overview.configure_score") })
      ] });
    }).exhaustive() : null
  ] });
}
function ScoringRulesetCard({ ruleset, settings }) {
  const { t } = useTranslation(["user-scoring", "common"]);
  const distributionQuery = useGetScoreDistributionQuery(ruleset.recordType);
  const dataModel = useDataModelQuery().data?.dataModel ?? [];
  const entityName = dataModel.find((table) => table.name === ruleset.recordType)?.alias || ruleset.recordType;
  const maxRiskLevel = settings.maxRiskLevel;
  const colors = SCORING_LEVELS_COLORS[maxRiskLevel];
  const labelKeys = SCORING_LEVELS_LABEL_KEYS[maxRiskLevel];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface-card border border-grey-border rounded-md p-md flex flex-col gap-md h-[400px]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-s font-medium", children: t("user-scoring:overview.ruleset_card.title", { name: entityName }) }),
    M$1(distributionQuery).with({ isPending: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-1 items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, { className: "size-10" }) })).with({ isError: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-1 items-center justify-center text-s text-grey-secondary", children: t("common:generic_fetch_data_error") })).with({ isSuccess: true }, (query) => {
      const distribution = query.data?.distribution ?? [];
      const total = distribution.reduce((sum, item) => sum + item.count, 0);
      if (total === 0)
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-1 items-center justify-center text-s text-grey-secondary", children: t("user-scoring:overview.ruleset_card.no_distribution") });
      const pieData = distribution.filter((item) => item.count > 0).map((item) => ({
        id: item.risk_level,
        label: t(labelKeys[item.risk_level] ?? item.risk_level.toString()),
        value: item.count,
        color: colors[item.risk_level] ?? "#ccc"
      }));
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          te,
          {
            data: pieData,
            innerRadius: 0.7,
            padAngle: 1,
            colors: { datum: "data.color" },
            enableArcLabels: false,
            tooltip: ({ datum }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-xs bg-surface-card p-xs rounded-lg border border-grey-border shadow-sm text-s text-grey-primary whitespace-nowrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-3 rounded-full shrink-0", style: { backgroundColor: datum.color } }),
              datum.label,
              ": ",
              datum.value,
              " (",
              Math.round(datum.value / total * 100),
              "%)"
            ] }),
            enableArcLinkLabels: false,
            margin: { top: 20, right: 20, bottom: 20, left: 20 }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap items-center justify-center gap-x-md gap-y-xs", children: pieData.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-3 rounded-full shrink-0", style: { backgroundColor: item.color } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-grey-secondary", children: item.label })
        ] }, item.id)) })
      ] });
    }).exhaustive()
  ] });
}
function UserScoringIndex() {
  const {
    settings
  } = useLoaderData({
    from: "/_app/_builder/user-scoring"
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ScoringOverviewPage, { settings });
}
export {
  UserScoringIndex as component
};
