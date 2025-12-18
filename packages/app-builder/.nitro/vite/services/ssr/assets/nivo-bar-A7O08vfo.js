import { c as createSsrRpc } from "./createSsrRpc-ZXUHv2Er.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { L as analyticsQuery, J as protectArray, K as dateRangeFilterSchema } from "./services-middleware-DR8Hua1Y.js";
import { _ as createServerFn, a0 as getDefaultExportFromCjs, r as reactExports, R as jsxRuntimeExports } from "../server.js";
import { o as object$1, k as array$1, j as uuid, s as string } from "./short-uuid-MIi3jWzx.js";
import { O as constant, P as p, Q as color, S as interpolateRgb, V as B$1, a as constant$1, k as array, W as ordinal, X as initRange, Z as exponent, a0 as formatSpecifier, a1 as formatPrefix, a2 as format, a3 as newInterval, a4 as durationSecond$1, a5 as durationMinute$1, a6 as durationHour$1, a7 as timeFormat, a8 as utcFormat, a9 as require_Set, aa as require_setToArray, ab as require_SetCache, ac as require_arrayIncludes, ad as require_cacheHas, ae as require_arrayIncludesWith, af as require_Stack, ag as require_baseIsEqual, ah as requireIsObject, ai as requireKeys, aj as requireGet, ak as requireHasIn, al as require_isKey, am as require_toKey, an as require_baseGet, ao as requireIdentity, ap as requireIsArray, aq as require_baseFor, ar as requireIsArrayLike, as as requireIsSymbol, at as require_arrayMap, au as require_baseUnary, av as require_baseFlatten, aw as require_baseRest, ax as require_isIterateeCall, ay as require_baseGetTag, az as requireIsObjectLike, aA as require_nodeUtil, aB as year, aC as utcYear$1, aD as saturday, aE as utcSaturday$1, aF as friday, aG as utcFriday$1, aH as thursday, aI as utcThursday$1, aJ as wednesday, aK as utcWednesday$1, aL as tuesday, aM as utcTuesday$1, aN as monday, aO as utcMonday$1, aP as sunday, aQ as utcSunday$1, aR as r, aS as utcParse, aT as timeParse, D as Dr, u as useTransition, M as M$1, aU as w$2, q as b$1, aV as useSpring, o as animated, z as gt, aW as R$2, y as a$1, x as ut, A as d, aX as require_arrayFilter, aY as require_copyObject, aZ as requireKeysIn, a_ as require_getSymbols, a$ as require_getPrototype, b0 as requireStubArray, b1 as require_arrayPush, b2 as require_baseGetAllKeys, b3 as require_cloneArrayBuffer, b4 as require_Symbol, b5 as require_cloneTypedArray, b6 as require_getTag, b7 as require_assignValue, b8 as require_cloneBuffer, b9 as require_getAllKeys, ba as require_initCloneObject, bb as requireIsBuffer, bc as require_copyArray, bd as require_castPath, be as requireLast, bf as requireIsPlainObject, bg as require_flatRest, bh as It, r as ft, bi as ht, n as ct, $ as $r, F as Fr, C as cn$1, E as Mn$1, bj as Pt, R as Rt, T as T$2, I as z$2, v as to, l as bn$1, G as hn$1, H as hr, Y as Ye$1, J as E$2, bk as gn$1, L as L$2, N as kn$1, K as Rn, bl as wn$1 } from "./nivo-legends-6l5H9E2i.js";
function numberArray(a2, b2) {
  if (!b2) b2 = [];
  var n2 = a2 ? Math.min(b2.length, a2.length) : 0, c = b2.slice(), i2;
  return function(t) {
    for (i2 = 0; i2 < n2; ++i2) c[i2] = a2[i2] * (1 - t) + b2[i2] * t;
    return c;
  };
}
function isNumberArray(x) {
  return ArrayBuffer.isView(x) && !(x instanceof DataView);
}
function genericArray(a2, b2) {
  var nb = b2 ? b2.length : 0, na = a2 ? Math.min(nb, a2.length) : 0, x = new Array(na), c = new Array(nb), i2;
  for (i2 = 0; i2 < na; ++i2) x[i2] = interpolate(a2[i2], b2[i2]);
  for (; i2 < nb; ++i2) c[i2] = b2[i2];
  return function(t) {
    for (i2 = 0; i2 < na; ++i2) c[i2] = x[i2](t);
    return c;
  };
}
function date$1(a2, b2) {
  var d2 = /* @__PURE__ */ new Date();
  return a2 = +a2, b2 = +b2, function(t) {
    return d2.setTime(a2 * (1 - t) + b2 * t), d2;
  };
}
function object(a2, b2) {
  var i2 = {}, c = {}, k2;
  if (a2 === null || typeof a2 !== "object") a2 = {};
  if (b2 === null || typeof b2 !== "object") b2 = {};
  for (k2 in b2) {
    if (k2 in a2) {
      i2[k2] = interpolate(a2[k2], b2[k2]);
    } else {
      c[k2] = b2[k2];
    }
  }
  return function(t) {
    for (k2 in i2) c[k2] = i2[k2](t);
    return c;
  };
}
function interpolate(a2, b2) {
  var t = typeof b2, c;
  return b2 == null || t === "boolean" ? constant(b2) : (t === "number" ? p : t === "string" ? (c = color(b2)) ? (b2 = c, interpolateRgb) : B$1 : b2 instanceof color ? interpolateRgb : b2 instanceof Date ? date$1 : isNumberArray(b2) ? numberArray : Array.isArray(b2) ? genericArray : typeof b2.valueOf !== "function" && typeof b2.toString !== "function" || isNaN(b2) ? object : p)(a2, b2);
}
function v$1(a2, b2) {
  return a2 = +a2, b2 = +b2, function(t) {
    return Math.round(a2 * (1 - t) + b2 * t);
  };
}
function ne$1(series, order) {
  if (!((n2 = series.length) > 1)) return;
  for (var i2 = 1, j2, s0, s1 = series[order[0]], n2, m = s1.length; i2 < n2; ++i2) {
    s0 = s1, s1 = series[order[i2]];
    for (j2 = 0; j2 < m; ++j2) {
      s1[j2][1] += s1[j2][0] = isNaN(s0[j2][1]) ? s0[j2][0] : s0[j2][1];
    }
  }
}
function Z$2(series) {
  var n2 = series.length, o2 = new Array(n2);
  while (--n2 >= 0) o2[n2] = n2;
  return o2;
}
function stackValue(d2, key) {
  return d2[key];
}
function stackSeries(key) {
  const series = [];
  series.key = key;
  return series;
}
function _$1() {
  var keys = constant$1([]), order = Z$2, offset = ne$1, value = stackValue;
  function stack(data) {
    var sz = Array.from(keys.apply(this, arguments), stackSeries), i2, n2 = sz.length, j2 = -1, oz;
    for (const d2 of data) {
      for (i2 = 0, ++j2; i2 < n2; ++i2) {
        (sz[i2][j2] = [0, +value(d2, sz[i2].key, j2, data)]).data = d2;
      }
    }
    for (i2 = 0, oz = array(order(sz)); i2 < n2; ++i2) {
      sz[oz[i2]].index = i2;
    }
    offset(sz, oz);
    return sz;
  }
  stack.keys = function(_2) {
    return arguments.length ? (keys = typeof _2 === "function" ? _2 : constant$1(Array.from(_2)), stack) : keys;
  };
  stack.value = function(_2) {
    return arguments.length ? (value = typeof _2 === "function" ? _2 : constant$1(+_2), stack) : value;
  };
  stack.order = function(_2) {
    return arguments.length ? (order = _2 == null ? Z$2 : typeof _2 === "function" ? _2 : constant$1(Array.from(_2)), stack) : order;
  };
  stack.offset = function(_2) {
    return arguments.length ? (offset = _2 == null ? ne$1 : _2, stack) : offset;
  };
  return stack;
}
function q$2(series, order) {
  if (!((n2 = series.length) > 0)) return;
  for (var i2, j2 = 0, d2, dy, yp, yn2, n2, m = series[order[0]].length; j2 < m; ++j2) {
    for (yp = yn2 = 0, i2 = 0; i2 < n2; ++i2) {
      if ((dy = (d2 = series[order[i2]][j2])[1] - d2[0]) > 0) {
        d2[0] = yp, d2[1] = yp += dy;
      } else if (dy < 0) {
        d2[1] = yn2, d2[0] = yn2 += dy;
      } else {
        d2[0] = 0, d2[1] = dy;
      }
    }
  }
}
function ascending(a2, b2) {
  return a2 == null || b2 == null ? NaN : a2 < b2 ? -1 : a2 > b2 ? 1 : a2 >= b2 ? 0 : NaN;
}
function descending(a2, b2) {
  return a2 == null || b2 == null ? NaN : b2 < a2 ? -1 : b2 > a2 ? 1 : b2 >= a2 ? 0 : NaN;
}
function bisector(f) {
  let compare1, compare2, delta;
  if (f.length !== 2) {
    compare1 = ascending;
    compare2 = (d2, x) => ascending(f(d2), x);
    delta = (d2, x) => f(d2) - x;
  } else {
    compare1 = f === ascending || f === descending ? f : zero;
    compare2 = f;
    delta = f;
  }
  function left(a2, x, lo = 0, hi = a2.length) {
    if (lo < hi) {
      if (compare1(x, x) !== 0) return hi;
      do {
        const mid = lo + hi >>> 1;
        if (compare2(a2[mid], x) < 0) lo = mid + 1;
        else hi = mid;
      } while (lo < hi);
    }
    return lo;
  }
  function right(a2, x, lo = 0, hi = a2.length) {
    if (lo < hi) {
      if (compare1(x, x) !== 0) return hi;
      do {
        const mid = lo + hi >>> 1;
        if (compare2(a2[mid], x) <= 0) lo = mid + 1;
        else hi = mid;
      } while (lo < hi);
    }
    return lo;
  }
  function center(a2, x, lo = 0, hi = a2.length) {
    const i2 = left(a2, x, lo, hi - 1);
    return i2 > lo && delta(a2[i2 - 1], x) > -delta(a2[i2], x) ? i2 - 1 : i2;
  }
  return { left, center, right };
}
function zero() {
  return 0;
}
function number$2(x) {
  return x === null ? NaN : +x;
}
const ascendingBisect = bisector(ascending);
const bisectRight = ascendingBisect.right;
bisector(number$2).center;
const e10 = Math.sqrt(50), e5 = Math.sqrt(10), e2 = Math.sqrt(2);
function tickSpec(start, stop, count) {
  const step = (stop - start) / Math.max(0, count), power = Math.floor(Math.log10(step)), error = step / Math.pow(10, power), factor = error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1;
  let i1, i2, inc;
  if (power < 0) {
    inc = Math.pow(10, -power) / factor;
    i1 = Math.round(start * inc);
    i2 = Math.round(stop * inc);
    if (i1 / inc < start) ++i1;
    if (i2 / inc > stop) --i2;
    inc = -inc;
  } else {
    inc = Math.pow(10, power) * factor;
    i1 = Math.round(start / inc);
    i2 = Math.round(stop / inc);
    if (i1 * inc < start) ++i1;
    if (i2 * inc > stop) --i2;
  }
  if (i2 < i1 && 0.5 <= count && count < 2) return tickSpec(start, stop, count * 2);
  return [i1, i2, inc];
}
function ticks(start, stop, count) {
  stop = +stop, start = +start, count = +count;
  if (!(count > 0)) return [];
  if (start === stop) return [start];
  const reverse = stop < start, [i1, i2, inc] = reverse ? tickSpec(stop, start, count) : tickSpec(start, stop, count);
  if (!(i2 >= i1)) return [];
  const n2 = i2 - i1 + 1, ticks2 = new Array(n2);
  if (reverse) {
    if (inc < 0) for (let i3 = 0; i3 < n2; ++i3) ticks2[i3] = (i2 - i3) / -inc;
    else for (let i3 = 0; i3 < n2; ++i3) ticks2[i3] = (i2 - i3) * inc;
  } else {
    if (inc < 0) for (let i3 = 0; i3 < n2; ++i3) ticks2[i3] = (i1 + i3) / -inc;
    else for (let i3 = 0; i3 < n2; ++i3) ticks2[i3] = (i1 + i3) * inc;
  }
  return ticks2;
}
function tickIncrement(start, stop, count) {
  stop = +stop, start = +start, count = +count;
  return tickSpec(start, stop, count)[2];
}
function tickStep(start, stop, count) {
  stop = +stop, start = +start, count = +count;
  const reverse = stop < start, inc = reverse ? tickIncrement(stop, start, count) : tickIncrement(start, stop, count);
  return (reverse ? -1 : 1) * (inc < 0 ? 1 / -inc : inc);
}
function range(start, stop, step) {
  start = +start, stop = +stop, step = (n2 = arguments.length) < 2 ? (stop = start, start = 0, 1) : n2 < 3 ? 1 : +step;
  var i2 = -1, n2 = Math.max(0, Math.ceil((stop - start) / step)) | 0, range2 = new Array(n2);
  while (++i2 < n2) {
    range2[i2] = start + i2 * step;
  }
  return range2;
}
function band() {
  var scale = ordinal().unknown(void 0), domain = scale.domain, ordinalRange = scale.range, r0 = 0, r1 = 1, step, bandwidth, round = false, paddingInner = 0, paddingOuter = 0, align = 0.5;
  delete scale.unknown;
  function rescale() {
    var n2 = domain().length, reverse = r1 < r0, start = reverse ? r1 : r0, stop = reverse ? r0 : r1;
    step = (stop - start) / Math.max(1, n2 - paddingInner + paddingOuter * 2);
    if (round) step = Math.floor(step);
    start += (stop - start - step * (n2 - paddingInner)) * align;
    bandwidth = step * (1 - paddingInner);
    if (round) start = Math.round(start), bandwidth = Math.round(bandwidth);
    var values = range(n2).map(function(i2) {
      return start + step * i2;
    });
    return ordinalRange(reverse ? values.reverse() : values);
  }
  scale.domain = function(_2) {
    return arguments.length ? (domain(_2), rescale()) : domain();
  };
  scale.range = function(_2) {
    return arguments.length ? ([r0, r1] = _2, r0 = +r0, r1 = +r1, rescale()) : [r0, r1];
  };
  scale.rangeRound = function(_2) {
    return [r0, r1] = _2, r0 = +r0, r1 = +r1, round = true, rescale();
  };
  scale.bandwidth = function() {
    return bandwidth;
  };
  scale.step = function() {
    return step;
  };
  scale.round = function(_2) {
    return arguments.length ? (round = !!_2, rescale()) : round;
  };
  scale.padding = function(_2) {
    return arguments.length ? (paddingInner = Math.min(1, paddingOuter = +_2), rescale()) : paddingInner;
  };
  scale.paddingInner = function(_2) {
    return arguments.length ? (paddingInner = Math.min(1, _2), rescale()) : paddingInner;
  };
  scale.paddingOuter = function(_2) {
    return arguments.length ? (paddingOuter = +_2, rescale()) : paddingOuter;
  };
  scale.align = function(_2) {
    return arguments.length ? (align = Math.max(0, Math.min(1, _2)), rescale()) : align;
  };
  scale.copy = function() {
    return band(domain(), [r0, r1]).round(round).paddingInner(paddingInner).paddingOuter(paddingOuter).align(align);
  };
  return initRange.apply(rescale(), arguments);
}
function pointish(scale) {
  var copy2 = scale.copy;
  scale.padding = scale.paddingOuter;
  delete scale.paddingInner;
  delete scale.paddingOuter;
  scale.copy = function() {
    return pointish(copy2());
  };
  return scale;
}
function point() {
  return pointish(band.apply(null, arguments).paddingInner(1));
}
function constants(x) {
  return function() {
    return x;
  };
}
function number$1(x) {
  return +x;
}
var unit = [0, 1];
function identity(x) {
  return x;
}
function normalize(a2, b2) {
  return (b2 -= a2 = +a2) ? function(x) {
    return (x - a2) / b2;
  } : constants(isNaN(b2) ? NaN : 0.5);
}
function clamper(a2, b2) {
  var t;
  if (a2 > b2) t = a2, a2 = b2, b2 = t;
  return function(x) {
    return Math.max(a2, Math.min(b2, x));
  };
}
function bimap(domain, range2, interpolate2) {
  var d0 = domain[0], d1 = domain[1], r0 = range2[0], r1 = range2[1];
  if (d1 < d0) d0 = normalize(d1, d0), r0 = interpolate2(r1, r0);
  else d0 = normalize(d0, d1), r0 = interpolate2(r0, r1);
  return function(x) {
    return r0(d0(x));
  };
}
function polymap(domain, range2, interpolate2) {
  var j2 = Math.min(domain.length, range2.length) - 1, d2 = new Array(j2), r2 = new Array(j2), i2 = -1;
  if (domain[j2] < domain[0]) {
    domain = domain.slice().reverse();
    range2 = range2.slice().reverse();
  }
  while (++i2 < j2) {
    d2[i2] = normalize(domain[i2], domain[i2 + 1]);
    r2[i2] = interpolate2(range2[i2], range2[i2 + 1]);
  }
  return function(x) {
    var i3 = bisectRight(domain, x, 1, j2) - 1;
    return r2[i3](d2[i3](x));
  };
}
function copy(source, target) {
  return target.domain(source.domain()).range(source.range()).interpolate(source.interpolate()).clamp(source.clamp()).unknown(source.unknown());
}
function transformer() {
  var domain = unit, range2 = unit, interpolate$1 = interpolate, transform, untransform, unknown, clamp = identity, piecewise, output, input;
  function rescale() {
    var n2 = Math.min(domain.length, range2.length);
    if (clamp !== identity) clamp = clamper(domain[0], domain[n2 - 1]);
    piecewise = n2 > 2 ? polymap : bimap;
    output = input = null;
    return scale;
  }
  function scale(x) {
    return x == null || isNaN(x = +x) ? unknown : (output || (output = piecewise(domain.map(transform), range2, interpolate$1)))(transform(clamp(x)));
  }
  scale.invert = function(y) {
    return clamp(untransform((input || (input = piecewise(range2, domain.map(transform), p)))(y)));
  };
  scale.domain = function(_2) {
    return arguments.length ? (domain = Array.from(_2, number$1), rescale()) : domain.slice();
  };
  scale.range = function(_2) {
    return arguments.length ? (range2 = Array.from(_2), rescale()) : range2.slice();
  };
  scale.rangeRound = function(_2) {
    return range2 = Array.from(_2), interpolate$1 = v$1, rescale();
  };
  scale.clamp = function(_2) {
    return arguments.length ? (clamp = _2 ? true : identity, rescale()) : clamp !== identity;
  };
  scale.interpolate = function(_2) {
    return arguments.length ? (interpolate$1 = _2, rescale()) : interpolate$1;
  };
  scale.unknown = function(_2) {
    return arguments.length ? (unknown = _2, scale) : unknown;
  };
  return function(t, u) {
    transform = t, untransform = u;
    return rescale();
  };
}
function continuous() {
  return transformer()(identity, identity);
}
function precisionFixed(step) {
  return Math.max(0, -exponent(Math.abs(step)));
}
function precisionPrefix(step, value) {
  return Math.max(0, Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3 - exponent(Math.abs(step)));
}
function precisionRound(step, max) {
  step = Math.abs(step), max = Math.abs(max) - step;
  return Math.max(0, exponent(max) - exponent(step)) + 1;
}
function tickFormat(start, stop, count, specifier) {
  var step = tickStep(start, stop, count), precision;
  specifier = formatSpecifier(specifier == null ? ",f" : specifier);
  switch (specifier.type) {
    case "s": {
      var value = Math.max(Math.abs(start), Math.abs(stop));
      if (specifier.precision == null && !isNaN(precision = precisionPrefix(step, value))) specifier.precision = precision;
      return formatPrefix(specifier, value);
    }
    case "":
    case "e":
    case "g":
    case "p":
    case "r": {
      if (specifier.precision == null && !isNaN(precision = precisionRound(step, Math.max(Math.abs(start), Math.abs(stop))))) specifier.precision = precision - (specifier.type === "e");
      break;
    }
    case "f":
    case "%": {
      if (specifier.precision == null && !isNaN(precision = precisionFixed(step))) specifier.precision = precision - (specifier.type === "%") * 2;
      break;
    }
  }
  return format(specifier);
}
function linearish(scale) {
  var domain = scale.domain;
  scale.ticks = function(count) {
    var d2 = domain();
    return ticks(d2[0], d2[d2.length - 1], count == null ? 10 : count);
  };
  scale.tickFormat = function(count, specifier) {
    var d2 = domain();
    return tickFormat(d2[0], d2[d2.length - 1], count == null ? 10 : count, specifier);
  };
  scale.nice = function(count) {
    if (count == null) count = 10;
    var d2 = domain();
    var i0 = 0;
    var i1 = d2.length - 1;
    var start = d2[i0];
    var stop = d2[i1];
    var prestep;
    var step;
    var maxIter = 10;
    if (stop < start) {
      step = start, start = stop, stop = step;
      step = i0, i0 = i1, i1 = step;
    }
    while (maxIter-- > 0) {
      step = tickIncrement(start, stop, count);
      if (step === prestep) {
        d2[i0] = start;
        d2[i1] = stop;
        return domain(d2);
      } else if (step > 0) {
        start = Math.floor(start / step) * step;
        stop = Math.ceil(stop / step) * step;
      } else if (step < 0) {
        start = Math.ceil(start * step) / step;
        stop = Math.floor(stop * step) / step;
      } else {
        break;
      }
      prestep = step;
    }
    return scale;
  };
  return scale;
}
function linear() {
  var scale = continuous();
  scale.copy = function() {
    return copy(scale, linear());
  };
  initRange.apply(scale, arguments);
  return linearish(scale);
}
function nice(domain, interval) {
  domain = domain.slice();
  var i0 = 0, i1 = domain.length - 1, x0 = domain[i0], x1 = domain[i1], t;
  if (x1 < x0) {
    t = i0, i0 = i1, i1 = t;
    t = x0, x0 = x1, x1 = t;
  }
  domain[i0] = interval.floor(x0);
  domain[i1] = interval.ceil(x1);
  return domain;
}
function transformLog(x) {
  return Math.log(x);
}
function transformExp(x) {
  return Math.exp(x);
}
function transformLogn(x) {
  return -Math.log(-x);
}
function transformExpn(x) {
  return -Math.exp(-x);
}
function pow10(x) {
  return isFinite(x) ? +("1e" + x) : x < 0 ? 0 : x;
}
function powp(base) {
  return base === 10 ? pow10 : base === Math.E ? Math.exp : (x) => Math.pow(base, x);
}
function logp(base) {
  return base === Math.E ? Math.log : base === 10 && Math.log10 || base === 2 && Math.log2 || (base = Math.log(base), (x) => Math.log(x) / base);
}
function reflect(f) {
  return (x, k2) => -f(-x, k2);
}
function loggish(transform) {
  const scale = transform(transformLog, transformExp);
  const domain = scale.domain;
  let base = 10;
  let logs;
  let pows;
  function rescale() {
    logs = logp(base), pows = powp(base);
    if (domain()[0] < 0) {
      logs = reflect(logs), pows = reflect(pows);
      transform(transformLogn, transformExpn);
    } else {
      transform(transformLog, transformExp);
    }
    return scale;
  }
  scale.base = function(_2) {
    return arguments.length ? (base = +_2, rescale()) : base;
  };
  scale.domain = function(_2) {
    return arguments.length ? (domain(_2), rescale()) : domain();
  };
  scale.ticks = (count) => {
    const d2 = domain();
    let u = d2[0];
    let v2 = d2[d2.length - 1];
    const r2 = v2 < u;
    if (r2) [u, v2] = [v2, u];
    let i2 = logs(u);
    let j2 = logs(v2);
    let k2;
    let t;
    const n2 = count == null ? 10 : +count;
    let z2 = [];
    if (!(base % 1) && j2 - i2 < n2) {
      i2 = Math.floor(i2), j2 = Math.ceil(j2);
      if (u > 0) for (; i2 <= j2; ++i2) {
        for (k2 = 1; k2 < base; ++k2) {
          t = i2 < 0 ? k2 / pows(-i2) : k2 * pows(i2);
          if (t < u) continue;
          if (t > v2) break;
          z2.push(t);
        }
      }
      else for (; i2 <= j2; ++i2) {
        for (k2 = base - 1; k2 >= 1; --k2) {
          t = i2 > 0 ? k2 / pows(-i2) : k2 * pows(i2);
          if (t < u) continue;
          if (t > v2) break;
          z2.push(t);
        }
      }
      if (z2.length * 2 < n2) z2 = ticks(u, v2, n2);
    } else {
      z2 = ticks(i2, j2, Math.min(j2 - i2, n2)).map(pows);
    }
    return r2 ? z2.reverse() : z2;
  };
  scale.tickFormat = (count, specifier) => {
    if (count == null) count = 10;
    if (specifier == null) specifier = base === 10 ? "s" : ",";
    if (typeof specifier !== "function") {
      if (!(base % 1) && (specifier = formatSpecifier(specifier)).precision == null) specifier.trim = true;
      specifier = format(specifier);
    }
    if (count === Infinity) return specifier;
    const k2 = Math.max(1, base * count / scale.ticks().length);
    return (d2) => {
      let i2 = d2 / pows(Math.round(logs(d2)));
      if (i2 * base < base - 0.5) i2 *= base;
      return i2 <= k2 ? specifier(d2) : "";
    };
  };
  scale.nice = () => {
    return domain(nice(domain(), {
      floor: (x) => pows(Math.floor(logs(x))),
      ceil: (x) => pows(Math.ceil(logs(x)))
    }));
  };
  return scale;
}
function log() {
  const scale = loggish(transformer()).domain([1, 10]);
  scale.copy = () => copy(scale, log()).base(scale.base());
  initRange.apply(scale, arguments);
  return scale;
}
function transformSymlog(c) {
  return function(x) {
    return Math.sign(x) * Math.log1p(Math.abs(x / c));
  };
}
function transformSymexp(c) {
  return function(x) {
    return Math.sign(x) * Math.expm1(Math.abs(x)) * c;
  };
}
function symlogish(transform) {
  var c = 1, scale = transform(transformSymlog(c), transformSymexp(c));
  scale.constant = function(_2) {
    return arguments.length ? transform(transformSymlog(c = +_2), transformSymexp(c)) : c;
  };
  return linearish(scale);
}
function symlog() {
  var scale = symlogish(transformer());
  scale.copy = function() {
    return copy(scale, symlog()).constant(scale.constant());
  };
  return initRange.apply(scale, arguments);
}
const t0 = /* @__PURE__ */ new Date(), t1 = /* @__PURE__ */ new Date();
function timeInterval(floori, offseti, count, field) {
  function interval(date2) {
    return floori(date2 = arguments.length === 0 ? /* @__PURE__ */ new Date() : /* @__PURE__ */ new Date(+date2)), date2;
  }
  interval.floor = (date2) => {
    return floori(date2 = /* @__PURE__ */ new Date(+date2)), date2;
  };
  interval.ceil = (date2) => {
    return floori(date2 = new Date(date2 - 1)), offseti(date2, 1), floori(date2), date2;
  };
  interval.round = (date2) => {
    const d0 = interval(date2), d1 = interval.ceil(date2);
    return date2 - d0 < d1 - date2 ? d0 : d1;
  };
  interval.offset = (date2, step) => {
    return offseti(date2 = /* @__PURE__ */ new Date(+date2), step == null ? 1 : Math.floor(step)), date2;
  };
  interval.range = (start, stop, step) => {
    const range2 = [];
    start = interval.ceil(start);
    step = step == null ? 1 : Math.floor(step);
    if (!(start < stop) || !(step > 0)) return range2;
    let previous;
    do
      range2.push(previous = /* @__PURE__ */ new Date(+start)), offseti(start, step), floori(start);
    while (previous < start && start < stop);
    return range2;
  };
  interval.filter = (test) => {
    return timeInterval((date2) => {
      if (date2 >= date2) while (floori(date2), !test(date2)) date2.setTime(date2 - 1);
    }, (date2, step) => {
      if (date2 >= date2) {
        if (step < 0) while (++step <= 0) {
          while (offseti(date2, -1), !test(date2)) {
          }
        }
        else while (--step >= 0) {
          while (offseti(date2, 1), !test(date2)) {
          }
        }
      }
    });
  };
  if (count) {
    interval.count = (start, end) => {
      t0.setTime(+start), t1.setTime(+end);
      floori(t0), floori(t1);
      return Math.floor(count(t0, t1));
    };
    interval.every = (step) => {
      step = Math.floor(step);
      return !isFinite(step) || !(step > 0) ? null : !(step > 1) ? interval : interval.filter(field ? (d2) => field(d2) % step === 0 : (d2) => interval.count(0, d2) % step === 0);
    };
  }
  return interval;
}
const millisecond$1 = timeInterval(() => {
}, (date2, step) => {
  date2.setTime(+date2 + step);
}, (start, end) => {
  return end - start;
});
millisecond$1.every = (k2) => {
  k2 = Math.floor(k2);
  if (!isFinite(k2) || !(k2 > 0)) return null;
  if (!(k2 > 1)) return millisecond$1;
  return timeInterval((date2) => {
    date2.setTime(Math.floor(date2 / k2) * k2);
  }, (date2, step) => {
    date2.setTime(+date2 + step * k2);
  }, (start, end) => {
    return (end - start) / k2;
  });
};
millisecond$1.range;
const durationSecond = 1e3;
const durationMinute = durationSecond * 60;
const durationHour = durationMinute * 60;
const durationDay = durationHour * 24;
const durationWeek = durationDay * 7;
const durationMonth = durationDay * 30;
const durationYear = durationDay * 365;
const second$1 = timeInterval((date2) => {
  date2.setTime(date2 - date2.getMilliseconds());
}, (date2, step) => {
  date2.setTime(+date2 + step * durationSecond);
}, (start, end) => {
  return (end - start) / durationSecond;
}, (date2) => {
  return date2.getUTCSeconds();
});
second$1.range;
const timeMinute = timeInterval((date2) => {
  date2.setTime(date2 - date2.getMilliseconds() - date2.getSeconds() * durationSecond);
}, (date2, step) => {
  date2.setTime(+date2 + step * durationMinute);
}, (start, end) => {
  return (end - start) / durationMinute;
}, (date2) => {
  return date2.getMinutes();
});
timeMinute.range;
const utcMinute$1 = timeInterval((date2) => {
  date2.setUTCSeconds(0, 0);
}, (date2, step) => {
  date2.setTime(+date2 + step * durationMinute);
}, (start, end) => {
  return (end - start) / durationMinute;
}, (date2) => {
  return date2.getUTCMinutes();
});
utcMinute$1.range;
const timeHour = timeInterval((date2) => {
  date2.setTime(date2 - date2.getMilliseconds() - date2.getSeconds() * durationSecond - date2.getMinutes() * durationMinute);
}, (date2, step) => {
  date2.setTime(+date2 + step * durationHour);
}, (start, end) => {
  return (end - start) / durationHour;
}, (date2) => {
  return date2.getHours();
});
timeHour.range;
const utcHour$1 = timeInterval((date2) => {
  date2.setUTCMinutes(0, 0, 0);
}, (date2, step) => {
  date2.setTime(+date2 + step * durationHour);
}, (start, end) => {
  return (end - start) / durationHour;
}, (date2) => {
  return date2.getUTCHours();
});
utcHour$1.range;
const timeDay = timeInterval(
  (date2) => date2.setHours(0, 0, 0, 0),
  (date2, step) => date2.setDate(date2.getDate() + step),
  (start, end) => (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * durationMinute) / durationDay,
  (date2) => date2.getDate() - 1
);
timeDay.range;
const utcDay = timeInterval((date2) => {
  date2.setUTCHours(0, 0, 0, 0);
}, (date2, step) => {
  date2.setUTCDate(date2.getUTCDate() + step);
}, (start, end) => {
  return (end - start) / durationDay;
}, (date2) => {
  return date2.getUTCDate() - 1;
});
utcDay.range;
const unixDay = timeInterval((date2) => {
  date2.setUTCHours(0, 0, 0, 0);
}, (date2, step) => {
  date2.setUTCDate(date2.getUTCDate() + step);
}, (start, end) => {
  return (end - start) / durationDay;
}, (date2) => {
  return Math.floor(date2 / durationDay);
});
unixDay.range;
function timeWeekday(i2) {
  return timeInterval((date2) => {
    date2.setDate(date2.getDate() - (date2.getDay() + 7 - i2) % 7);
    date2.setHours(0, 0, 0, 0);
  }, (date2, step) => {
    date2.setDate(date2.getDate() + step * 7);
  }, (start, end) => {
    return (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * durationMinute) / durationWeek;
  });
}
const timeSunday = timeWeekday(0);
const timeMonday = timeWeekday(1);
const timeTuesday = timeWeekday(2);
const timeWednesday = timeWeekday(3);
const timeThursday = timeWeekday(4);
const timeFriday = timeWeekday(5);
const timeSaturday = timeWeekday(6);
timeSunday.range;
timeMonday.range;
timeTuesday.range;
timeWednesday.range;
timeThursday.range;
timeFriday.range;
timeSaturday.range;
function utcWeekday(i2) {
  return timeInterval((date2) => {
    date2.setUTCDate(date2.getUTCDate() - (date2.getUTCDay() + 7 - i2) % 7);
    date2.setUTCHours(0, 0, 0, 0);
  }, (date2, step) => {
    date2.setUTCDate(date2.getUTCDate() + step * 7);
  }, (start, end) => {
    return (end - start) / durationWeek;
  });
}
const utcSunday = utcWeekday(0);
const utcMonday = utcWeekday(1);
const utcTuesday = utcWeekday(2);
const utcWednesday = utcWeekday(3);
const utcThursday = utcWeekday(4);
const utcFriday = utcWeekday(5);
const utcSaturday = utcWeekday(6);
utcSunday.range;
utcMonday.range;
utcTuesday.range;
utcWednesday.range;
utcThursday.range;
utcFriday.range;
utcSaturday.range;
const timeMonth = timeInterval((date2) => {
  date2.setDate(1);
  date2.setHours(0, 0, 0, 0);
}, (date2, step) => {
  date2.setMonth(date2.getMonth() + step);
}, (start, end) => {
  return end.getMonth() - start.getMonth() + (end.getFullYear() - start.getFullYear()) * 12;
}, (date2) => {
  return date2.getMonth();
});
timeMonth.range;
const utcMonth$1 = timeInterval((date2) => {
  date2.setUTCDate(1);
  date2.setUTCHours(0, 0, 0, 0);
}, (date2, step) => {
  date2.setUTCMonth(date2.getUTCMonth() + step);
}, (start, end) => {
  return end.getUTCMonth() - start.getUTCMonth() + (end.getUTCFullYear() - start.getUTCFullYear()) * 12;
}, (date2) => {
  return date2.getUTCMonth();
});
utcMonth$1.range;
const timeYear = timeInterval((date2) => {
  date2.setMonth(0, 1);
  date2.setHours(0, 0, 0, 0);
}, (date2, step) => {
  date2.setFullYear(date2.getFullYear() + step);
}, (start, end) => {
  return end.getFullYear() - start.getFullYear();
}, (date2) => {
  return date2.getFullYear();
});
timeYear.every = (k2) => {
  return !isFinite(k2 = Math.floor(k2)) || !(k2 > 0) ? null : timeInterval((date2) => {
    date2.setFullYear(Math.floor(date2.getFullYear() / k2) * k2);
    date2.setMonth(0, 1);
    date2.setHours(0, 0, 0, 0);
  }, (date2, step) => {
    date2.setFullYear(date2.getFullYear() + step * k2);
  });
};
timeYear.range;
const utcYear = timeInterval((date2) => {
  date2.setUTCMonth(0, 1);
  date2.setUTCHours(0, 0, 0, 0);
}, (date2, step) => {
  date2.setUTCFullYear(date2.getUTCFullYear() + step);
}, (start, end) => {
  return end.getUTCFullYear() - start.getUTCFullYear();
}, (date2) => {
  return date2.getUTCFullYear();
});
utcYear.every = (k2) => {
  return !isFinite(k2 = Math.floor(k2)) || !(k2 > 0) ? null : timeInterval((date2) => {
    date2.setUTCFullYear(Math.floor(date2.getUTCFullYear() / k2) * k2);
    date2.setUTCMonth(0, 1);
    date2.setUTCHours(0, 0, 0, 0);
  }, (date2, step) => {
    date2.setUTCFullYear(date2.getUTCFullYear() + step * k2);
  });
};
utcYear.range;
function ticker(year2, month2, week, day, hour2, minute2) {
  const tickIntervals = [
    [second$1, 1, durationSecond],
    [second$1, 5, 5 * durationSecond],
    [second$1, 15, 15 * durationSecond],
    [second$1, 30, 30 * durationSecond],
    [minute2, 1, durationMinute],
    [minute2, 5, 5 * durationMinute],
    [minute2, 15, 15 * durationMinute],
    [minute2, 30, 30 * durationMinute],
    [hour2, 1, durationHour],
    [hour2, 3, 3 * durationHour],
    [hour2, 6, 6 * durationHour],
    [hour2, 12, 12 * durationHour],
    [day, 1, durationDay],
    [day, 2, 2 * durationDay],
    [week, 1, durationWeek],
    [month2, 1, durationMonth],
    [month2, 3, 3 * durationMonth],
    [year2, 1, durationYear]
  ];
  function ticks2(start, stop, count) {
    const reverse = stop < start;
    if (reverse) [start, stop] = [stop, start];
    const interval = count && typeof count.range === "function" ? count : tickInterval(start, stop, count);
    const ticks3 = interval ? interval.range(start, +stop + 1) : [];
    return reverse ? ticks3.reverse() : ticks3;
  }
  function tickInterval(start, stop, count) {
    const target = Math.abs(stop - start) / count;
    const i2 = bisector(([, , step2]) => step2).right(tickIntervals, target);
    if (i2 === tickIntervals.length) return year2.every(tickStep(start / durationYear, stop / durationYear, count));
    if (i2 === 0) return millisecond$1.every(Math.max(tickStep(start, stop, count), 1));
    const [t, step] = tickIntervals[target / tickIntervals[i2 - 1][2] < tickIntervals[i2][2] / target ? i2 - 1 : i2];
    return t.every(step);
  }
  return [ticks2, tickInterval];
}
const [utcTicks, utcTickInterval] = ticker(utcYear, utcMonth$1, utcSunday, unixDay, utcHour$1, utcMinute$1);
const [timeTicks, timeTickInterval] = ticker(timeYear, timeMonth, timeSunday, timeDay, timeHour, timeMinute);
var millisecond = newInterval(function() {
}, function(date2, step) {
  date2.setTime(+date2 + step);
}, function(start, end) {
  return end - start;
});
millisecond.every = function(k2) {
  k2 = Math.floor(k2);
  if (!isFinite(k2) || !(k2 > 0)) return null;
  if (!(k2 > 1)) return millisecond;
  return newInterval(function(date2) {
    date2.setTime(Math.floor(date2 / k2) * k2);
  }, function(date2, step) {
    date2.setTime(+date2 + step * k2);
  }, function(start, end) {
    return (end - start) / k2;
  });
};
millisecond.range;
var second = newInterval(function(date2) {
  date2.setTime(date2 - date2.getMilliseconds());
}, function(date2, step) {
  date2.setTime(+date2 + step * durationSecond$1);
}, function(start, end) {
  return (end - start) / durationSecond$1;
}, function(date2) {
  return date2.getUTCSeconds();
});
second.range;
var minute = newInterval(function(date2) {
  date2.setTime(date2 - date2.getMilliseconds() - date2.getSeconds() * durationSecond$1);
}, function(date2, step) {
  date2.setTime(+date2 + step * durationMinute$1);
}, function(start, end) {
  return (end - start) / durationMinute$1;
}, function(date2) {
  return date2.getMinutes();
});
minute.range;
var hour = newInterval(function(date2) {
  date2.setTime(date2 - date2.getMilliseconds() - date2.getSeconds() * durationSecond$1 - date2.getMinutes() * durationMinute$1);
}, function(date2, step) {
  date2.setTime(+date2 + step * durationHour$1);
}, function(start, end) {
  return (end - start) / durationHour$1;
}, function(date2) {
  return date2.getHours();
});
hour.range;
var month = newInterval(function(date2) {
  date2.setDate(1);
  date2.setHours(0, 0, 0, 0);
}, function(date2, step) {
  date2.setMonth(date2.getMonth() + step);
}, function(start, end) {
  return end.getMonth() - start.getMonth() + (end.getFullYear() - start.getFullYear()) * 12;
}, function(date2) {
  return date2.getMonth();
});
month.range;
var utcMinute = newInterval(function(date2) {
  date2.setUTCSeconds(0, 0);
}, function(date2, step) {
  date2.setTime(+date2 + step * durationMinute$1);
}, function(start, end) {
  return (end - start) / durationMinute$1;
}, function(date2) {
  return date2.getUTCMinutes();
});
utcMinute.range;
var utcHour = newInterval(function(date2) {
  date2.setUTCMinutes(0, 0, 0);
}, function(date2, step) {
  date2.setTime(+date2 + step * durationHour$1);
}, function(start, end) {
  return (end - start) / durationHour$1;
}, function(date2) {
  return date2.getUTCHours();
});
utcHour.range;
var utcMonth = newInterval(function(date2) {
  date2.setUTCDate(1);
  date2.setUTCHours(0, 0, 0, 0);
}, function(date2, step) {
  date2.setUTCMonth(date2.getUTCMonth() + step);
}, function(start, end) {
  return end.getUTCMonth() - start.getUTCMonth() + (end.getUTCFullYear() - start.getUTCFullYear()) * 12;
}, function(date2) {
  return date2.getUTCMonth();
});
utcMonth.range;
function date(t) {
  return new Date(t);
}
function number(t) {
  return t instanceof Date ? +t : +/* @__PURE__ */ new Date(+t);
}
function calendar(ticks2, tickInterval, year2, month2, week, day, hour2, minute2, second2, format2) {
  var scale = continuous(), invert = scale.invert, domain = scale.domain;
  var formatMillisecond = format2(".%L"), formatSecond = format2(":%S"), formatMinute = format2("%I:%M"), formatHour = format2("%I %p"), formatDay = format2("%a %d"), formatWeek = format2("%b %d"), formatMonth = format2("%B"), formatYear = format2("%Y");
  function tickFormat2(date2) {
    return (second2(date2) < date2 ? formatMillisecond : minute2(date2) < date2 ? formatSecond : hour2(date2) < date2 ? formatMinute : day(date2) < date2 ? formatHour : month2(date2) < date2 ? week(date2) < date2 ? formatDay : formatWeek : year2(date2) < date2 ? formatMonth : formatYear)(date2);
  }
  scale.invert = function(y) {
    return new Date(invert(y));
  };
  scale.domain = function(_2) {
    return arguments.length ? domain(Array.from(_2, number)) : domain().map(date);
  };
  scale.ticks = function(interval) {
    var d2 = domain();
    return ticks2(d2[0], d2[d2.length - 1], interval == null ? 10 : interval);
  };
  scale.tickFormat = function(count, specifier) {
    return specifier == null ? tickFormat2 : format2(specifier);
  };
  scale.nice = function(interval) {
    var d2 = domain();
    if (!interval || typeof interval.range !== "function") interval = tickInterval(d2[0], d2[d2.length - 1], interval == null ? 10 : interval);
    return interval ? domain(nice(d2, interval)) : scale;
  };
  scale.copy = function() {
    return copy(scale, calendar(ticks2, tickInterval, year2, month2, week, day, hour2, minute2, second2, format2));
  };
  return scale;
}
function time() {
  return initRange.apply(calendar(timeTicks, timeTickInterval, timeYear, timeMonth, timeSunday, timeDay, timeHour, timeMinute, second$1, timeFormat).domain([new Date(2e3, 0, 1), new Date(2e3, 0, 2)]), arguments);
}
function utcTime() {
  return initRange.apply(calendar(utcTicks, utcTickInterval, utcYear, utcMonth$1, utcSunday, utcDay, utcHour$1, utcMinute$1, second$1, utcFormat).domain([Date.UTC(2e3, 0, 1), Date.UTC(2e3, 0, 2)]), arguments);
}
const caseAnalyticsQuerySchema = object$1({
  start: string(),
  end: string(),
  timezone: string()
});
const getCaseStatusByDateFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(caseAnalyticsQuerySchema).handler(createSsrRpc("7bf3fa45f12dec9f5261b4c7fbc73143b17ef43501090d86132f22c529807c93"));
const getCaseStatusByInboxFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(caseAnalyticsQuerySchema).handler(createSsrRpc("1cf2c2799fcef435af387b7771083e3938a3308e27b59e7b8d3d6ade3c637393"));
const availableFiltersInputSchema = object$1({
  scenarioId: uuid(),
  ranges: protectArray(array$1(dateRangeFilterSchema).min(1))
});
const customFiltersConfigInputSchema = object$1({
  triggerObjectTypes: protectArray(array$1(string()))
});
const getCustomFiltersConfigFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(customFiltersConfigInputSchema).handler(createSsrRpc("460c9e6b1a545f5d9b7814f245ff9a3c002a2d23a75049c9a0b67bef1c31ede8"));
const getAvailableFiltersFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(availableFiltersInputSchema).handler(createSsrRpc("c4d7caa7ca210f7aecb8c771c038067f3b63800b136f7984b4e49342381762c0"));
const getDecisionOutcomesPerDayFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(analyticsQuery).handler(createSsrRpc("037a9791565e873681cbb99b49b11c7d5c5e8e55f9c0bb1949a848090228caed"));
const getDecisionsScoreDistributionFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(analyticsQuery).handler(createSsrRpc("730a630dc6d7eb67a3fbace85bbf001bed5e847a01d4298e0e6c12beb525b42d"));
const getRuleHitTableFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(analyticsQuery).handler(createSsrRpc("562fb34c2b62884dfcccdfbffd301f0330be037546fdfdcc3c0c9cf0ebe31ff3"));
const getRuleVsDecisionOutcomeFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(analyticsQuery).handler(createSsrRpc("f7b0a4515ec9a4aefb597cce3d3df2ffab191c3d5697df0a4ba0d155d12e2055"));
const getScreeningHitsTableFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(analyticsQuery).handler(createSsrRpc("d258b3f9cee7bf652d5dcd6449e7207352b662ac5519d7f01102bacf5e6a309e"));
const caseAnalyticsInputSchema = object$1({
  startDate: string(),
  endDate: string(),
  timezone: string(),
  inboxId: string().optional(),
  userId: string().optional()
});
const getCaseAnalyticsFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(caseAnalyticsInputSchema).handler(createSsrRpc("41738591d4735d5497defefaf495d3540da1be13b94167cba19e58dace773927"));
var noop_1;
var hasRequiredNoop;
function requireNoop() {
  if (hasRequiredNoop) return noop_1;
  hasRequiredNoop = 1;
  function noop() {
  }
  noop_1 = noop;
  return noop_1;
}
var _createSet;
var hasRequired_createSet;
function require_createSet() {
  if (hasRequired_createSet) return _createSet;
  hasRequired_createSet = 1;
  var Set = require_Set(), noop = requireNoop(), setToArray = require_setToArray();
  var INFINITY = 1 / 0;
  var createSet = !(Set && 1 / setToArray(new Set([, -0]))[1] == INFINITY) ? noop : function(values) {
    return new Set(values);
  };
  _createSet = createSet;
  return _createSet;
}
var _baseUniq;
var hasRequired_baseUniq;
function require_baseUniq() {
  if (hasRequired_baseUniq) return _baseUniq;
  hasRequired_baseUniq = 1;
  var SetCache = require_SetCache(), arrayIncludes = require_arrayIncludes(), arrayIncludesWith = require_arrayIncludesWith(), cacheHas = require_cacheHas(), createSet = require_createSet(), setToArray = require_setToArray();
  var LARGE_ARRAY_SIZE = 200;
  function baseUniq(array2, iteratee, comparator) {
    var index = -1, includes = arrayIncludes, length = array2.length, isCommon = true, result = [], seen = result;
    if (comparator) {
      isCommon = false;
      includes = arrayIncludesWith;
    } else if (length >= LARGE_ARRAY_SIZE) {
      var set = iteratee ? null : createSet(array2);
      if (set) {
        return setToArray(set);
      }
      isCommon = false;
      includes = cacheHas;
      seen = new SetCache();
    } else {
      seen = iteratee ? [] : result;
    }
    outer:
      while (++index < length) {
        var value = array2[index], computed = iteratee ? iteratee(value) : value;
        value = comparator || value !== 0 ? value : 0;
        if (isCommon && computed === computed) {
          var seenIndex = seen.length;
          while (seenIndex--) {
            if (seen[seenIndex] === computed) {
              continue outer;
            }
          }
          if (iteratee) {
            seen.push(computed);
          }
          result.push(value);
        } else if (!includes(seen, computed, comparator)) {
          if (seen !== result) {
            seen.push(computed);
          }
          result.push(value);
        }
      }
    return result;
  }
  _baseUniq = baseUniq;
  return _baseUniq;
}
var uniq_1;
var hasRequiredUniq;
function requireUniq() {
  if (hasRequiredUniq) return uniq_1;
  hasRequiredUniq = 1;
  var baseUniq = require_baseUniq();
  function uniq(array2) {
    return array2 && array2.length ? baseUniq(array2) : [];
  }
  uniq_1 = uniq;
  return uniq_1;
}
var uniqExports = requireUniq();
const n = /* @__PURE__ */ getDefaultExportFromCjs(uniqExports);
var _baseIsMatch;
var hasRequired_baseIsMatch;
function require_baseIsMatch() {
  if (hasRequired_baseIsMatch) return _baseIsMatch;
  hasRequired_baseIsMatch = 1;
  var Stack = require_Stack(), baseIsEqual = require_baseIsEqual();
  var COMPARE_PARTIAL_FLAG = 1, COMPARE_UNORDERED_FLAG = 2;
  function baseIsMatch(object2, source, matchData, customizer) {
    var index = matchData.length, length = index, noCustomizer = !customizer;
    if (object2 == null) {
      return !length;
    }
    object2 = Object(object2);
    while (index--) {
      var data = matchData[index];
      if (noCustomizer && data[2] ? data[1] !== object2[data[0]] : !(data[0] in object2)) {
        return false;
      }
    }
    while (++index < length) {
      data = matchData[index];
      var key = data[0], objValue = object2[key], srcValue = data[1];
      if (noCustomizer && data[2]) {
        if (objValue === void 0 && !(key in object2)) {
          return false;
        }
      } else {
        var stack = new Stack();
        if (customizer) {
          var result = customizer(objValue, srcValue, key, object2, source, stack);
        }
        if (!(result === void 0 ? baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG, customizer, stack) : result)) {
          return false;
        }
      }
    }
    return true;
  }
  _baseIsMatch = baseIsMatch;
  return _baseIsMatch;
}
var _isStrictComparable;
var hasRequired_isStrictComparable;
function require_isStrictComparable() {
  if (hasRequired_isStrictComparable) return _isStrictComparable;
  hasRequired_isStrictComparable = 1;
  var isObject = requireIsObject();
  function isStrictComparable(value) {
    return value === value && !isObject(value);
  }
  _isStrictComparable = isStrictComparable;
  return _isStrictComparable;
}
var _getMatchData;
var hasRequired_getMatchData;
function require_getMatchData() {
  if (hasRequired_getMatchData) return _getMatchData;
  hasRequired_getMatchData = 1;
  var isStrictComparable = require_isStrictComparable(), keys = requireKeys();
  function getMatchData(object2) {
    var result = keys(object2), length = result.length;
    while (length--) {
      var key = result[length], value = object2[key];
      result[length] = [key, value, isStrictComparable(value)];
    }
    return result;
  }
  _getMatchData = getMatchData;
  return _getMatchData;
}
var _matchesStrictComparable;
var hasRequired_matchesStrictComparable;
function require_matchesStrictComparable() {
  if (hasRequired_matchesStrictComparable) return _matchesStrictComparable;
  hasRequired_matchesStrictComparable = 1;
  function matchesStrictComparable(key, srcValue) {
    return function(object2) {
      if (object2 == null) {
        return false;
      }
      return object2[key] === srcValue && (srcValue !== void 0 || key in Object(object2));
    };
  }
  _matchesStrictComparable = matchesStrictComparable;
  return _matchesStrictComparable;
}
var _baseMatches;
var hasRequired_baseMatches;
function require_baseMatches() {
  if (hasRequired_baseMatches) return _baseMatches;
  hasRequired_baseMatches = 1;
  var baseIsMatch = require_baseIsMatch(), getMatchData = require_getMatchData(), matchesStrictComparable = require_matchesStrictComparable();
  function baseMatches(source) {
    var matchData = getMatchData(source);
    if (matchData.length == 1 && matchData[0][2]) {
      return matchesStrictComparable(matchData[0][0], matchData[0][1]);
    }
    return function(object2) {
      return object2 === source || baseIsMatch(object2, source, matchData);
    };
  }
  _baseMatches = baseMatches;
  return _baseMatches;
}
var _baseMatchesProperty;
var hasRequired_baseMatchesProperty;
function require_baseMatchesProperty() {
  if (hasRequired_baseMatchesProperty) return _baseMatchesProperty;
  hasRequired_baseMatchesProperty = 1;
  var baseIsEqual = require_baseIsEqual(), get = requireGet(), hasIn = requireHasIn(), isKey = require_isKey(), isStrictComparable = require_isStrictComparable(), matchesStrictComparable = require_matchesStrictComparable(), toKey = require_toKey();
  var COMPARE_PARTIAL_FLAG = 1, COMPARE_UNORDERED_FLAG = 2;
  function baseMatchesProperty(path, srcValue) {
    if (isKey(path) && isStrictComparable(srcValue)) {
      return matchesStrictComparable(toKey(path), srcValue);
    }
    return function(object2) {
      var objValue = get(object2, path);
      return objValue === void 0 && objValue === srcValue ? hasIn(object2, path) : baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG);
    };
  }
  _baseMatchesProperty = baseMatchesProperty;
  return _baseMatchesProperty;
}
var _baseProperty;
var hasRequired_baseProperty;
function require_baseProperty() {
  if (hasRequired_baseProperty) return _baseProperty;
  hasRequired_baseProperty = 1;
  function baseProperty(key) {
    return function(object2) {
      return object2 == null ? void 0 : object2[key];
    };
  }
  _baseProperty = baseProperty;
  return _baseProperty;
}
var _basePropertyDeep;
var hasRequired_basePropertyDeep;
function require_basePropertyDeep() {
  if (hasRequired_basePropertyDeep) return _basePropertyDeep;
  hasRequired_basePropertyDeep = 1;
  var baseGet = require_baseGet();
  function basePropertyDeep(path) {
    return function(object2) {
      return baseGet(object2, path);
    };
  }
  _basePropertyDeep = basePropertyDeep;
  return _basePropertyDeep;
}
var property_1;
var hasRequiredProperty;
function requireProperty() {
  if (hasRequiredProperty) return property_1;
  hasRequiredProperty = 1;
  var baseProperty = require_baseProperty(), basePropertyDeep = require_basePropertyDeep(), isKey = require_isKey(), toKey = require_toKey();
  function property(path) {
    return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
  }
  property_1 = property;
  return property_1;
}
var _baseIteratee;
var hasRequired_baseIteratee;
function require_baseIteratee() {
  if (hasRequired_baseIteratee) return _baseIteratee;
  hasRequired_baseIteratee = 1;
  var baseMatches = require_baseMatches(), baseMatchesProperty = require_baseMatchesProperty(), identity2 = requireIdentity(), isArray = requireIsArray(), property = requireProperty();
  function baseIteratee(value) {
    if (typeof value == "function") {
      return value;
    }
    if (value == null) {
      return identity2;
    }
    if (typeof value == "object") {
      return isArray(value) ? baseMatchesProperty(value[0], value[1]) : baseMatches(value);
    }
    return property(value);
  }
  _baseIteratee = baseIteratee;
  return _baseIteratee;
}
var uniqBy_1;
var hasRequiredUniqBy;
function requireUniqBy() {
  if (hasRequiredUniqBy) return uniqBy_1;
  hasRequiredUniqBy = 1;
  var baseIteratee = require_baseIteratee(), baseUniq = require_baseUniq();
  function uniqBy(array2, iteratee) {
    return array2 && array2.length ? baseUniq(array2, baseIteratee(iteratee, 2)) : [];
  }
  uniqBy_1 = uniqBy;
  return uniqBy_1;
}
var uniqByExports = requireUniqBy();
const J$2 = /* @__PURE__ */ getDefaultExportFromCjs(uniqByExports);
var _baseForOwn;
var hasRequired_baseForOwn;
function require_baseForOwn() {
  if (hasRequired_baseForOwn) return _baseForOwn;
  hasRequired_baseForOwn = 1;
  var baseFor = require_baseFor(), keys = requireKeys();
  function baseForOwn(object2, iteratee) {
    return object2 && baseFor(object2, iteratee, keys);
  }
  _baseForOwn = baseForOwn;
  return _baseForOwn;
}
var _createBaseEach;
var hasRequired_createBaseEach;
function require_createBaseEach() {
  if (hasRequired_createBaseEach) return _createBaseEach;
  hasRequired_createBaseEach = 1;
  var isArrayLike = requireIsArrayLike();
  function createBaseEach(eachFunc, fromRight) {
    return function(collection, iteratee) {
      if (collection == null) {
        return collection;
      }
      if (!isArrayLike(collection)) {
        return eachFunc(collection, iteratee);
      }
      var length = collection.length, index = fromRight ? length : -1, iterable = Object(collection);
      while (fromRight ? index-- : ++index < length) {
        if (iteratee(iterable[index], index, iterable) === false) {
          break;
        }
      }
      return collection;
    };
  }
  _createBaseEach = createBaseEach;
  return _createBaseEach;
}
var _baseEach;
var hasRequired_baseEach;
function require_baseEach() {
  if (hasRequired_baseEach) return _baseEach;
  hasRequired_baseEach = 1;
  var baseForOwn = require_baseForOwn(), createBaseEach = require_createBaseEach();
  var baseEach = createBaseEach(baseForOwn);
  _baseEach = baseEach;
  return _baseEach;
}
var _baseMap;
var hasRequired_baseMap;
function require_baseMap() {
  if (hasRequired_baseMap) return _baseMap;
  hasRequired_baseMap = 1;
  var baseEach = require_baseEach(), isArrayLike = requireIsArrayLike();
  function baseMap(collection, iteratee) {
    var index = -1, result = isArrayLike(collection) ? Array(collection.length) : [];
    baseEach(collection, function(value, key, collection2) {
      result[++index] = iteratee(value, key, collection2);
    });
    return result;
  }
  _baseMap = baseMap;
  return _baseMap;
}
var _baseSortBy;
var hasRequired_baseSortBy;
function require_baseSortBy() {
  if (hasRequired_baseSortBy) return _baseSortBy;
  hasRequired_baseSortBy = 1;
  function baseSortBy(array2, comparer) {
    var length = array2.length;
    array2.sort(comparer);
    while (length--) {
      array2[length] = array2[length].value;
    }
    return array2;
  }
  _baseSortBy = baseSortBy;
  return _baseSortBy;
}
var _compareAscending;
var hasRequired_compareAscending;
function require_compareAscending() {
  if (hasRequired_compareAscending) return _compareAscending;
  hasRequired_compareAscending = 1;
  var isSymbol = requireIsSymbol();
  function compareAscending(value, other) {
    if (value !== other) {
      var valIsDefined = value !== void 0, valIsNull = value === null, valIsReflexive = value === value, valIsSymbol = isSymbol(value);
      var othIsDefined = other !== void 0, othIsNull = other === null, othIsReflexive = other === other, othIsSymbol = isSymbol(other);
      if (!othIsNull && !othIsSymbol && !valIsSymbol && value > other || valIsSymbol && othIsDefined && othIsReflexive && !othIsNull && !othIsSymbol || valIsNull && othIsDefined && othIsReflexive || !valIsDefined && othIsReflexive || !valIsReflexive) {
        return 1;
      }
      if (!valIsNull && !valIsSymbol && !othIsSymbol && value < other || othIsSymbol && valIsDefined && valIsReflexive && !valIsNull && !valIsSymbol || othIsNull && valIsDefined && valIsReflexive || !othIsDefined && valIsReflexive || !othIsReflexive) {
        return -1;
      }
    }
    return 0;
  }
  _compareAscending = compareAscending;
  return _compareAscending;
}
var _compareMultiple;
var hasRequired_compareMultiple;
function require_compareMultiple() {
  if (hasRequired_compareMultiple) return _compareMultiple;
  hasRequired_compareMultiple = 1;
  var compareAscending = require_compareAscending();
  function compareMultiple(object2, other, orders) {
    var index = -1, objCriteria = object2.criteria, othCriteria = other.criteria, length = objCriteria.length, ordersLength = orders.length;
    while (++index < length) {
      var result = compareAscending(objCriteria[index], othCriteria[index]);
      if (result) {
        if (index >= ordersLength) {
          return result;
        }
        var order = orders[index];
        return result * (order == "desc" ? -1 : 1);
      }
    }
    return object2.index - other.index;
  }
  _compareMultiple = compareMultiple;
  return _compareMultiple;
}
var _baseOrderBy;
var hasRequired_baseOrderBy;
function require_baseOrderBy() {
  if (hasRequired_baseOrderBy) return _baseOrderBy;
  hasRequired_baseOrderBy = 1;
  var arrayMap = require_arrayMap(), baseGet = require_baseGet(), baseIteratee = require_baseIteratee(), baseMap = require_baseMap(), baseSortBy = require_baseSortBy(), baseUnary = require_baseUnary(), compareMultiple = require_compareMultiple(), identity2 = requireIdentity(), isArray = requireIsArray();
  function baseOrderBy(collection, iteratees, orders) {
    if (iteratees.length) {
      iteratees = arrayMap(iteratees, function(iteratee) {
        if (isArray(iteratee)) {
          return function(value) {
            return baseGet(value, iteratee.length === 1 ? iteratee[0] : iteratee);
          };
        }
        return iteratee;
      });
    } else {
      iteratees = [identity2];
    }
    var index = -1;
    iteratees = arrayMap(iteratees, baseUnary(baseIteratee));
    var result = baseMap(collection, function(value, key, collection2) {
      var criteria = arrayMap(iteratees, function(iteratee) {
        return iteratee(value);
      });
      return { "criteria": criteria, "index": ++index, "value": value };
    });
    return baseSortBy(result, function(object2, other) {
      return compareMultiple(object2, other, orders);
    });
  }
  _baseOrderBy = baseOrderBy;
  return _baseOrderBy;
}
var sortBy_1;
var hasRequiredSortBy;
function requireSortBy() {
  if (hasRequiredSortBy) return sortBy_1;
  hasRequiredSortBy = 1;
  var baseFlatten = require_baseFlatten(), baseOrderBy = require_baseOrderBy(), baseRest = require_baseRest(), isIterateeCall = require_isIterateeCall();
  var sortBy = baseRest(function(collection, iteratees) {
    if (collection == null) {
      return [];
    }
    var length = iteratees.length;
    if (length > 1 && isIterateeCall(collection, iteratees[0], iteratees[1])) {
      iteratees = [];
    } else if (length > 2 && isIterateeCall(iteratees[0], iteratees[1], iteratees[2])) {
      iteratees = [iteratees[0]];
    }
    return baseOrderBy(collection, baseFlatten(iteratees, 1), []);
  });
  sortBy_1 = sortBy;
  return sortBy_1;
}
var sortByExports = requireSortBy();
const e$1 = /* @__PURE__ */ getDefaultExportFromCjs(sortByExports);
var _baseIsDate;
var hasRequired_baseIsDate;
function require_baseIsDate() {
  if (hasRequired_baseIsDate) return _baseIsDate;
  hasRequired_baseIsDate = 1;
  var baseGetTag = require_baseGetTag(), isObjectLike = requireIsObjectLike();
  var dateTag = "[object Date]";
  function baseIsDate(value) {
    return isObjectLike(value) && baseGetTag(value) == dateTag;
  }
  _baseIsDate = baseIsDate;
  return _baseIsDate;
}
var isDate_1;
var hasRequiredIsDate;
function requireIsDate() {
  if (hasRequiredIsDate) return isDate_1;
  hasRequiredIsDate = 1;
  var baseIsDate = require_baseIsDate(), baseUnary = require_baseUnary(), nodeUtil = require_nodeUtil();
  var nodeIsDate = nodeUtil && nodeUtil.isDate;
  var isDate = nodeIsDate ? baseUnary(nodeIsDate) : baseIsDate;
  isDate_1 = isDate;
  return isDate_1;
}
var isDateExports = requireIsDate();
const i = /* @__PURE__ */ getDefaultExportFromCjs(isDateExports);
function J$1() {
  return J$1 = Object.assign ? Object.assign.bind() : function(n2) {
    for (var t = 1; t < arguments.length; t++) {
      var e3 = arguments[t];
      for (var r2 in e3) ({}).hasOwnProperty.call(e3, r2) && (n2[r2] = e3[r2]);
    }
    return n2;
  }, J$1.apply(null, arguments);
}
var L$1 = [function(n2) {
  return n2.setMilliseconds(0);
}, function(n2) {
  return n2.setSeconds(0);
}, function(n2) {
  return n2.setMinutes(0);
}, function(n2) {
  return n2.setHours(0);
}, function(n2) {
  return n2.setDate(1);
}, function(n2) {
  return n2.setMonth(0);
}], Q$1 = { millisecond: [], second: L$1.slice(0, 1), minute: L$1.slice(0, 2), hour: L$1.slice(0, 3), day: L$1.slice(0, 4), month: L$1.slice(0, 5), year: L$1.slice(0, 6) }, W$2 = function(n2) {
  return function(t) {
    return Q$1[n2].forEach((function(n3) {
      n3(t);
    })), t;
  };
}, X$1 = function(n2) {
  var t = n2.format, e3 = void 0 === t ? "native" : t, r2 = n2.precision, i2 = void 0 === r2 ? "millisecond" : r2, u = n2.useUTC, c = void 0 === u || u, s = W$2(i2);
  return function(n3) {
    if (void 0 === n3) return n3;
    if ("native" === e3 || n3 instanceof Date) return s(n3);
    var t2 = c ? utcParse(e3) : timeParse(e3);
    return s(t2(n3));
  };
}, Y$1 = { min: 0, max: "auto", stacked: false, reverse: false, clamp: false, nice: true, round: false }, Z$1 = function(n2, t, e3, r2) {
  var i2, a2, o2, c, s = n2.min, d2 = void 0 === s ? Y$1.min : s, m = n2.max, f = void 0 === m ? Y$1.max : m, l = n2.stacked, y = void 0 === l ? Y$1.stacked : l, h = n2.reverse, g2 = void 0 === h ? Y$1.reverse : h, x = n2.clamp, k2 = void 0 === x ? Y$1.clamp : x, T2 = n2.nice, b2 = void 0 === T2 ? Y$1.nice : T2, M2 = n2.round, w2 = void 0 === M2 ? Y$1.round : M2;
  "auto" === d2 ? i2 = true === y ? null != (a2 = t.minStacked) ? a2 : 0 : t.min : i2 = d2;
  "auto" === f ? o2 = true === y ? null != (c = t.maxStacked) ? c : 0 : t.max : o2 = f;
  var E2 = linear().range("x" === r2 ? [0, e3] : [e3, 0]).interpolate(w2 ? v$1 : p).domain(g2 ? [o2, i2] : [i2, o2]).clamp(k2);
  return true === b2 ? E2.nice() : "number" == typeof b2 && E2.nice(b2), _(E2, y);
}, _ = function(n2, t) {
  void 0 === t && (t = false);
  var e3 = n2;
  return e3.type = "linear", e3.stacked = t, e3;
}, nn = function(n2, t, e3) {
  var r2 = point().range([0, e3]).domain(t.all);
  return r2.type = "point", r2;
}, en = { round: false }, rn = function(n2, t, e3, r2) {
  var i2 = n2.round, a2 = void 0 === i2 ? en.round : i2, o2 = band().range("x" === r2 ? [0, e3] : [e3, 0]).domain(t.all).round(a2);
  return an(o2);
}, an = function(n2) {
  var t = n2;
  return t.type = "band", t;
}, on = { format: "native", precision: "millisecond", min: "auto", max: "auto", useUTC: true, nice: false }, un = function(n2, t, e3) {
  var r2, i2, a2 = n2.format, o2 = void 0 === a2 ? on.format : a2, u = n2.precision, c = void 0 === u ? on.precision : u, s = n2.min, f = void 0 === s ? on.min : s, l = n2.max, v2 = void 0 === l ? on.max : l, p2 = n2.useUTC, y = void 0 === p2 ? on.useUTC : p2, h = n2.nice, g2 = void 0 === h ? on.nice : h, x = X$1({ format: o2, precision: c, useUTC: y });
  r2 = "auto" === f ? x(t.min) : "native" !== o2 ? x(f) : f, i2 = "auto" === v2 ? x(t.max) : "native" !== o2 ? x(v2) : v2;
  var k2 = y ? utcTime() : time();
  k2.range([0, e3]), r2 && i2 && k2.domain([r2, i2]), true === g2 ? k2.nice() : "object" != typeof g2 && "number" != typeof g2 || k2.nice(g2);
  var T2 = k2;
  return T2.type = "time", T2.useUTC = y, T2;
}, cn = { base: 10, min: "auto", max: "auto", round: false, reverse: false, nice: true }, sn = function(n2, t, e3, r2) {
  var i2, a2 = n2.base, o2 = void 0 === a2 ? cn.base : a2, u = n2.min, c = void 0 === u ? cn.min : u, s = n2.max, d2 = void 0 === s ? cn.max : s, m = n2.round, l = void 0 === m ? cn.round : m, v2 = n2.reverse, p2 = void 0 === v2 ? cn.reverse : v2, y = n2.nice, h = void 0 === y ? cn.nice : y;
  if (t.all.some((function(n3) {
    return 0 === n3;
  }))) throw new Error("a log scale domain must not include or cross zero");
  var g2, x, k2 = false;
  if (t.all.filter((function(n3) {
    return null != n3;
  })).forEach((function(n3) {
    k2 || (void 0 === i2 ? i2 = Math.sign(n3) : Math.sign(n3) !== i2 && (k2 = true));
  })), k2) throw new Error("a log scale domain must be strictly-positive or strictly-negative");
  g2 = "auto" === c ? t.min : c, x = "auto" === d2 ? t.max : d2;
  var T2 = log().base(o2), b2 = "x" === r2 ? [0, e3] : [e3, 0];
  true === l ? T2.rangeRound(b2) : T2.range(b2), true === p2 ? T2.domain([x, g2]) : T2.domain([g2, x]), true === h ? T2.nice() : "number" == typeof h && T2.nice(h);
  var M2 = T2;
  return M2.type = "log", M2;
}, dn = { constant: 1, min: "auto", max: "auto", round: false, reverse: false, nice: true }, mn = function(n2, t, e3, r2) {
  var i2, a2, o2 = n2.constant, u = void 0 === o2 ? dn.constant : o2, c = n2.min, s = void 0 === c ? dn.min : c, d2 = n2.max, m = void 0 === d2 ? dn.max : d2, f = n2.round, v2 = void 0 === f ? dn.round : f, p2 = n2.reverse, y = void 0 === p2 ? dn.reverse : p2, h = n2.nice, g2 = void 0 === h ? dn.nice : h;
  i2 = "auto" === s ? t.min : s, a2 = "auto" === m ? t.max : m;
  var x = symlog().constant(u), k2 = "x" === r2 ? [0, e3] : [e3, 0];
  true === v2 ? x.rangeRound(k2) : x.range(k2), true === y ? x.domain([a2, i2]) : x.domain([i2, a2]), true === g2 ? x.nice() : "number" == typeof g2 && x.nice(g2);
  var T2 = x;
  return T2.type = "symlog", T2;
}, fn = function(n2) {
  return "x" === n2 ? "y" : "x";
}, ln = function(n2, t) {
  return n2 === t;
}, vn = function(n2, t) {
  return n2.getTime() === t.getTime();
};
function pn(n2, t, e3, r2) {
  switch (n2.type) {
    case "linear":
      return Z$1(n2, t, e3, r2);
    case "point":
      return nn(0, t, e3);
    case "band":
      return rn(n2, t, e3, r2);
    case "time":
      return un(n2, t, e3);
    case "log":
      return sn(n2, t, e3, r2);
    case "symlog":
      return mn(n2, t, e3, r2);
    default:
      throw new Error("invalid scale spec");
  }
}
var yn = function(n2, t, e3) {
  var r2;
  if ("stacked" in e3 && e3.stacked) {
    var i2 = n2.data["x" === t ? "xStacked" : "yStacked"];
    return null == i2 ? null : e3(i2);
  }
  return null != (r2 = e3(n2.data[t])) ? r2 : null;
}, hn = function(n2, t, e3, r2, i2) {
  var a2 = n2.map((function(n3) {
    return (function(n4) {
      return J$1({}, n4, { data: n4.data.map((function(n5) {
        return { data: J$1({}, n5) };
      })) });
    })(n3);
  })), o2 = gn(a2, t, e3);
  "stacked" in t && true === t.stacked && Tn(o2, a2), "stacked" in e3 && true === e3.stacked && bn(o2, a2);
  var u = pn(t, o2.x, r2, "x"), c = pn(e3, o2.y, i2, "y"), s = a2.map((function(n3) {
    return J$1({}, n3, { data: n3.data.map((function(n4) {
      return J$1({}, n4, { position: { x: yn(n4, "x", u), y: yn(n4, "y", c) } });
    })) });
  }));
  return J$1({}, o2, { series: s, xScale: u, yScale: c });
}, gn = function(n2, t, e3) {
  return { x: xn(n2, "x", t), y: xn(n2, "y", e3) };
}, xn = function(i2, a2, o2, u) {
  var c = {}, s = c.getValue, d2 = void 0 === s ? function(n2) {
    return n2.data[a2];
  } : s, m = c.setValue, f = void 0 === m ? function(n2, t) {
    n2.data[a2] = t;
  } : m;
  if ("linear" === o2.type) i2.forEach((function(n2) {
    n2.data.forEach((function(n3) {
      var t = d2(n3);
      t && f(n3, parseFloat(String(t)));
    }));
  }));
  else if ("time" === o2.type && "native" !== o2.format) {
    var l = X$1(o2);
    i2.forEach((function(n2) {
      n2.data.forEach((function(n3) {
        var t = d2(n3);
        t && f(n3, l(t));
      }));
    }));
  }
  var v2 = [];
  switch (i2.forEach((function(n2) {
    n2.data.forEach((function(n3) {
      v2.push(d2(n3));
    }));
  })), o2.type) {
    case "linear":
      var p2 = e$1(n(v2).filter((function(n2) {
        return null !== n2;
      })), (function(n2) {
        return n2;
      }));
      return { all: p2, min: Math.min.apply(Math, p2), max: Math.max.apply(Math, p2) };
    case "time":
      var y = J$2(v2, (function(n2) {
        return n2.getTime();
      })).slice(0).sort((function(n2, t) {
        return t.getTime() - n2.getTime();
      })).reverse();
      return { all: y, min: y[0], max: r(y) };
    default:
      var h = n(v2);
      return { all: h, min: h[0], max: r(h) };
  }
}, kn = function(n2, t, e3) {
  var a2 = fn(n2), o2 = [];
  t[a2].all.forEach((function(t2) {
    var u = i(t2) ? vn : ln, c = [];
    e3.forEach((function(e4) {
      var i2 = e4.data.find((function(n3) {
        return u(n3.data[a2], t2);
      })), s = null, d2 = null;
      if (void 0 !== i2) {
        if (null !== (s = i2.data[n2])) {
          var m = r(c);
          void 0 === m ? d2 = s : null !== m && (d2 = m + s);
        }
        i2.data["x" === n2 ? "xStacked" : "yStacked"] = d2;
      }
      c.push(d2), null !== d2 && o2.push(d2);
    }));
  })), t[n2].minStacked = Math.min.apply(Math, o2), t[n2].maxStacked = Math.max.apply(Math, o2);
}, Tn = function(n2, t) {
  return kn("x", n2, t);
}, bn = function(n2, t) {
  return kn("y", n2, t);
}, Mn = function(n2) {
  var t = n2.bandwidth();
  if (0 === t) return n2;
  var e3 = t / 2;
  return n2.round() && (e3 = Math.round(e3)), function(t2) {
    var r2;
    return (null != (r2 = n2(t2)) ? r2 : 0) + e3;
  };
}, wn = { millisecond: [millisecond, millisecond], second: [second, second], minute: [minute, utcMinute], hour: [hour, utcHour], day: [newInterval((function(n2) {
  return n2.setHours(0, 0, 0, 0);
}), (function(n2, t) {
  return n2.setDate(n2.getDate() + t);
}), (function(n2, t) {
  return (t.getTime() - n2.getTime()) / 864e5;
}), (function(n2) {
  return Math.floor(n2.getTime() / 864e5);
})), newInterval((function(n2) {
  return n2.setUTCHours(0, 0, 0, 0);
}), (function(n2, t) {
  return n2.setUTCDate(n2.getUTCDate() + t);
}), (function(n2, t) {
  return (t.getTime() - n2.getTime()) / 864e5;
}), (function(n2) {
  return Math.floor(n2.getTime() / 864e5);
}))], week: [sunday, utcSunday$1], sunday: [sunday, utcSunday$1], monday: [monday, utcMonday$1], tuesday: [tuesday, utcTuesday$1], wednesday: [wednesday, utcWednesday$1], thursday: [thursday, utcThursday$1], friday: [friday, utcFriday$1], saturday: [saturday, utcSaturday$1], month: [month, utcMonth], year: [year, utcYear$1] }, En = Object.keys(wn), Sn = new RegExp("^every\\s*(\\d+)?\\s*(" + En.join("|") + ")s?$", "i"), Cn = function(n2, t) {
  if (Array.isArray(t)) return t;
  if ("string" == typeof t && "useUTC" in n2) {
    var e3 = t.match(Sn);
    if (e3) {
      var r2 = e3[1], i2 = e3[2], a2 = wn[i2][n2.useUTC ? 1 : 0];
      if ("day" === i2) {
        var o2, u, c = n2.domain(), s = c[0], d2 = c[1], m = new Date(d2);
        return m.setDate(m.getDate() + 1), null != (o2 = null == (u = a2.every(Number(null != r2 ? r2 : 1))) ? void 0 : u.range(s, m)) ? o2 : [];
      }
      if (void 0 === r2) return n2.ticks(a2);
      var f = a2.every(Number(r2));
      if (f) return n2.ticks(f);
    }
    throw new Error("Invalid tickValues: " + t);
  }
  if ("ticks" in n2) {
    if (void 0 === t) return n2.ticks();
    if ("number" == typeof (l = t) && isFinite(l) && Math.floor(l) === l) return n2.ticks(t);
  }
  var l;
  return n2.domain();
};
function A() {
  return A = Object.assign ? Object.assign.bind() : function(t) {
    for (var e3 = 1; e3 < arguments.length; e3++) {
      var i2 = arguments[e3];
      for (var n2 in i2) ({}).hasOwnProperty.call(i2, n2) && (t[n2] = i2[n2]);
    }
    return t;
  }, A.apply(null, arguments);
}
var T$1 = function(t) {
  var e3, i2 = t.axis, n2 = t.scale, r2 = t.ticksPosition, o2 = t.tickValues, l = t.tickSize, c = t.tickPadding, s = t.tickRotation, f = t.truncateTickAt, d2 = t.engine, u = void 0 === d2 ? "svg" : d2, x = Cn(n2, o2), m = gt[u], y = "bandwidth" in n2 ? Mn(n2) : n2, g2 = { lineX: 0, lineY: 0 }, v2 = { textX: 0, textY: 0 }, k2 = "object" == typeof document && "rtl" === document.dir, b2 = m.align.center, P2 = m.baseline.center;
  "x" === i2 ? (e3 = function(t2) {
    var e4;
    return { x: null != (e4 = y(t2)) ? e4 : 0, y: 0 };
  }, g2.lineY = l * ("after" === r2 ? 1 : -1), v2.textY = (l + c) * ("after" === r2 ? 1 : -1), P2 = "after" === r2 ? m.baseline.top : m.baseline.bottom, 0 === s ? b2 = m.align.center : "after" === r2 && s < 0 || "before" === r2 && s > 0 ? (b2 = m.align[k2 ? "left" : "right"], P2 = m.baseline.center) : ("after" === r2 && s > 0 || "before" === r2 && s < 0) && (b2 = m.align[k2 ? "right" : "left"], P2 = m.baseline.center)) : (e3 = function(t2) {
    var e4;
    return { x: 0, y: null != (e4 = y(t2)) ? e4 : 0 };
  }, g2.lineX = l * ("after" === r2 ? 1 : -1), v2.textX = (l + c) * ("after" === r2 ? 1 : -1), b2 = "after" === r2 ? m.align.left : m.align.right);
  return { ticks: x.map((function(t2) {
    var i3 = "string" == typeof t2 ? (function(t3) {
      var e4 = String(t3).length;
      return f && f > 0 && e4 > f ? "" + String(t3).slice(0, f).concat("...") : "" + t3;
    })(t2) : t2;
    return A({ key: t2 instanceof Date ? "" + t2.valueOf() : "" + t2, value: i3 }, e3(t2), g2, v2);
  })), textAlign: b2, textBaseline: P2 };
}, w$1 = function(t, e3) {
  if (void 0 === t || "function" == typeof t) return t;
  if ("time" === e3.type) {
    var i2 = timeFormat(t);
    return function(t2) {
      return i2(t2 instanceof Date ? t2 : new Date(t2));
    };
  }
  return format(t);
}, O$1 = function(t) {
  var e3, i2 = t.width, n2 = t.height, r2 = t.scale, a2 = t.axis, o2 = t.values, l = (e3 = o2, Array.isArray(e3) ? o2 : void 0) || Cn(r2, o2), c = "bandwidth" in r2 ? Mn(r2) : r2, s = "x" === a2 ? l.map((function(t2) {
    var e4, i3;
    return { key: t2 instanceof Date ? "" + t2.valueOf() : "" + t2, x1: null != (e4 = c(t2)) ? e4 : 0, x2: null != (i3 = c(t2)) ? i3 : 0, y1: 0, y2: n2 };
  })) : l.map((function(t2) {
    var e4, n3;
    return { key: t2 instanceof Date ? "" + t2.valueOf() : "" + t2, x1: 0, x2: i2, y1: null != (e4 = c(t2)) ? e4 : 0, y2: null != (n3 = c(t2)) ? n3 : 0 };
  }));
  return s;
}, X = reactExports.memo((function(t) {
  var e3, n2 = t.value, r2 = t.format, a2 = t.lineX, o2 = t.lineY, l = t.onClick, c = t.textBaseline, s = t.textAnchor, f = t.theme, u = t.animatedProps, x = null != (e3 = null == r2 ? void 0 : r2(n2)) ? e3 : n2, y = reactExports.useMemo((function() {
    var t2 = { opacity: u.opacity };
    return l ? { style: A({}, t2, { cursor: "pointer" }), onClick: function(t3) {
      return l(t3, x);
    } } : { style: t2 };
  }), [u.opacity, l, x]);
  return jsxRuntimeExports.jsxs(animated.g, A({ transform: u.transform }, y, { children: [jsxRuntimeExports.jsx("line", { x1: 0, x2: a2, y1: 0, y2: o2, style: f.line }), jsxRuntimeExports.jsx(b$1, { dominantBaseline: c, textAnchor: s, transform: u.textTransform, style: f.text, children: "" + x })] }));
})), Y = { tickSize: 5, tickPadding: 5, tickRotation: 0, legendPosition: "middle", legendOffset: 0 }, B = function(e3) {
  var r2 = e3.axis, a2 = e3.scale, l = e3.x, f = void 0 === l ? 0 : l, u = e3.y, x = void 0 === u ? 0 : u, v2 = e3.length, k2 = e3.ticksPosition, h = e3.tickValues, p2 = e3.tickSize, O2 = void 0 === p2 ? Y.tickSize : p2, B2 = e3.tickPadding, z2 = void 0 === B2 ? Y.tickPadding : B2, R2 = e3.tickRotation, V2 = void 0 === R2 ? Y.tickRotation : R2, C2 = e3.format, D2 = e3.renderTick, j2 = void 0 === D2 ? X : D2, E2 = e3.truncateTickAt, W2 = e3.legend, q2 = e3.legendPosition, H = void 0 === q2 ? Y.legendPosition : q2, I2 = e3.legendOffset, F = void 0 === I2 ? Y.legendOffset : I2, G = e3.style, J2 = e3.onClick, K = e3.ariaHidden, L2 = M$1(), M2 = w$2(L2.axis, G), N = reactExports.useMemo((function() {
    return w$1(C2, a2);
  }), [C2, a2]), Q2 = T$1({ axis: r2, scale: a2, ticksPosition: k2, tickValues: h, tickSize: O2, tickPadding: z2, tickRotation: V2, truncateTickAt: E2 }), U2 = Q2.ticks, Z2 = Q2.textAlign, $2 = Q2.textBaseline, _2 = null;
  if (void 0 !== W2) {
    var tt, et = 0, it = 0, nt = 0;
    "y" === r2 ? (nt = -90, et = F, "start" === H ? (tt = "start", it = v2) : "middle" === H ? (tt = "middle", it = v2 / 2) : "end" === H && (tt = "end")) : (it = F, "start" === H ? tt = "start" : "middle" === H ? (tt = "middle", et = v2 / 2) : "end" === H && (tt = "end", et = v2)), _2 = jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: jsxRuntimeExports.jsx(b$1, { transform: "translate(" + et + ", " + it + ") rotate(" + nt + ")", textAnchor: tt, style: A({}, M2.legend.text, { dominantBaseline: "central" }), children: W2 }) });
  }
  var rt = Dr(), at = rt.animate, ot = rt.config, lt = useSpring({ transform: "translate(" + f + "," + x + ")", lineX2: "x" === r2 ? v2 : 0, lineY2: "x" === r2 ? 0 : v2, config: ot, immediate: !at }), ct2 = reactExports.useCallback((function(t) {
    return { opacity: 1, transform: "translate(" + t.x + "," + t.y + ")", textTransform: "translate(" + t.textX + "," + t.textY + ") rotate(" + V2 + ")" };
  }), [V2]), st = reactExports.useCallback((function(t) {
    return { opacity: 0, transform: "translate(" + t.x + "," + t.y + ")", textTransform: "translate(" + t.textX + "," + t.textY + ") rotate(" + V2 + ")" };
  }), [V2]), ft2 = useTransition(U2, { keys: function(t) {
    return t.key;
  }, initial: ct2, from: st, enter: ct2, update: ct2, leave: { opacity: 0 }, config: ot, immediate: !at });
  return jsxRuntimeExports.jsxs(animated.g, { transform: lt.transform, "aria-hidden": K, children: [ft2((function(e4, i2, n2, r3) {
    return reactExports.createElement(j2, A({ tickIndex: r3, format: N, rotate: V2, textBaseline: $2, textAnchor: Z2, truncateTickAt: E2, animatedProps: e4, theme: M2.ticks }, i2, J2 ? { onClick: J2 } : {}));
  })), jsxRuntimeExports.jsx(animated.line, { style: M2.domain.line, x1: 0, x2: lt.lineX2, y1: 0, y2: lt.lineY2 }), _2] });
}, z$1 = reactExports.memo(B), R$1 = ["top", "right", "bottom", "left"], V = reactExports.memo((function(t) {
  var e3 = t.xScale, i2 = t.yScale, n2 = t.width, r2 = t.height, a2 = { top: t.top, right: t.right, bottom: t.bottom, left: t.left };
  return jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: R$1.map((function(t2) {
    var o2 = a2[t2];
    if (!o2) return null;
    var l = "top" === t2 || "bottom" === t2;
    return jsxRuntimeExports.jsx(z$1, A({}, o2, { axis: l ? "x" : "y", x: "right" === t2 ? n2 : 0, y: "bottom" === t2 ? r2 : 0, scale: l ? e3 : i2, length: l ? n2 : r2, ticksPosition: "top" === t2 || "left" === t2 ? "before" : "after", truncateTickAt: o2.truncateTickAt }), t2);
  })) });
})), C$1 = reactExports.memo((function(t) {
  var e3 = t.animatedProps, i2 = M$1();
  return jsxRuntimeExports.jsx(animated.line, A({}, e3, i2.grid.line));
})), D$1 = reactExports.memo((function(t) {
  var e3 = t.lines, i2 = Dr(), n2 = i2.animate, a2 = i2.config, l = useTransition(e3, { keys: function(t2) {
    return t2.key;
  }, initial: function(t2) {
    return { opacity: 1, x1: t2.x1, x2: t2.x2, y1: t2.y1, y2: t2.y2 };
  }, from: function(t2) {
    return { opacity: 0, x1: t2.x1, x2: t2.x2, y1: t2.y1, y2: t2.y2 };
  }, enter: function(t2) {
    return { opacity: 1, x1: t2.x1, x2: t2.x2, y1: t2.y1, y2: t2.y2 };
  }, update: function(t2) {
    return { opacity: 1, x1: t2.x1, x2: t2.x2, y1: t2.y1, y2: t2.y2 };
  }, leave: { opacity: 0 }, config: a2, immediate: !n2 });
  return jsxRuntimeExports.jsx("g", { children: l((function(t2, e4) {
    return reactExports.createElement(C$1, A({}, e4, { key: e4.key, animatedProps: t2 }));
  })) });
})), j$1 = reactExports.memo((function(t) {
  var e3 = t.width, n2 = t.height, r2 = t.xScale, a2 = t.yScale, o2 = t.xValues, l = t.yValues, c = reactExports.useMemo((function() {
    return !!r2 && O$1({ width: e3, height: n2, scale: r2, axis: "x", values: o2 });
  }), [r2, o2, e3, n2]), s = reactExports.useMemo((function() {
    return !!a2 && O$1({ width: e3, height: n2, scale: a2, axis: "y", values: l });
  }), [n2, e3, a2, l]);
  return jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [c && jsxRuntimeExports.jsx(D$1, { lines: c }), s && jsxRuntimeExports.jsx(D$1, { lines: s })] });
})), E$1 = function(t, e3) {
  var i2, n2, r2 = e3.axis, a2 = e3.scale, o2 = e3.x, c = void 0 === o2 ? 0 : o2, s = e3.y, d$1 = void 0 === s ? 0 : s, m = e3.length, y = e3.ticksPosition, g2 = e3.tickValues, v2 = e3.tickSize, k2 = void 0 === v2 ? Y.tickSize : v2, h = e3.tickPadding, p2 = void 0 === h ? Y.tickPadding : h, b2 = e3.tickRotation, P2 = void 0 === b2 ? Y.tickRotation : b2, S2 = e3.format, A2 = e3.legend, w2 = e3.legendPosition, O2 = void 0 === w2 ? Y.legendPosition : w2, X2 = e3.legendOffset, B2 = void 0 === X2 ? Y.legendOffset : X2, z2 = e3.theme, R2 = e3.style, V2 = T$1({ axis: r2, scale: a2, ticksPosition: y, tickValues: g2, tickSize: k2, tickPadding: p2, tickRotation: P2, engine: "canvas" }), C2 = V2.ticks, D2 = V2.textAlign, j2 = V2.textBaseline;
  t.save(), t.translate(c, d$1);
  var E2 = R$2(z2.axis, R2);
  t.textAlign = D2, t.textBaseline = j2, a$1(t, E2.ticks.text);
  var W2 = null != (i2 = E2.domain.line.strokeWidth) ? i2 : 0;
  "string" != typeof W2 && W2 > 0 && (t.lineWidth = W2, t.lineCap = "square", E2.domain.line.stroke && (t.strokeStyle = E2.domain.line.stroke), t.beginPath(), t.moveTo(0, 0), t.lineTo("x" === r2 ? m : 0, "x" === r2 ? 0 : m), t.stroke());
  var q2 = "function" == typeof S2 ? S2 : function(t2) {
    return "" + t2;
  }, H = null != (n2 = E2.ticks.line.strokeWidth) ? n2 : 0, I2 = "string" != typeof H && H > 0;
  if (C2.forEach((function(e4) {
    I2 && (t.lineWidth = H, t.lineCap = "square", E2.ticks.line.stroke && (t.strokeStyle = E2.ticks.line.stroke), t.beginPath(), t.moveTo(e4.x, e4.y), t.lineTo(e4.x + e4.lineX, e4.y + e4.lineY), t.stroke());
    var i3 = q2(e4.value);
    t.save(), t.translate(e4.x + e4.textX, e4.y + e4.textY), t.rotate(ut(P2)), d(t, E2.ticks.text, "" + i3), t.fillText("" + i3, 0, 0), t.restore();
  })), void 0 !== A2) {
    var F = 0, G = 0, J2 = 0, K = "center";
    "y" === r2 ? (J2 = -90, F = B2, "start" === O2 ? (K = "start", G = m) : "middle" === O2 ? (K = "center", G = m / 2) : "end" === O2 && (K = "end")) : (G = B2, "start" === O2 ? K = "start" : "middle" === O2 ? (K = "center", F = m / 2) : "end" === O2 && (K = "end", F = m)), t.translate(F, G), t.rotate(ut(J2)), a$1(t, E2.legend.text), E2.legend.text.fill && (t.fillStyle = E2.legend.text.fill), t.textAlign = K, t.textBaseline = "middle", d(t, E2.legend.text, A2);
  }
  t.restore();
}, W$1 = function(t, e3) {
  var i2 = e3.xScale, n2 = e3.yScale, r2 = e3.width, a2 = e3.height, o2 = e3.top, l = e3.right, c = e3.bottom, s = e3.left, f = e3.theme, d2 = { top: o2, right: l, bottom: c, left: s };
  R$1.forEach((function(e4) {
    var o3 = d2[e4];
    if (!o3) return null;
    var l2 = "top" === e4 || "bottom" === e4, c2 = "top" === e4 || "left" === e4 ? "before" : "after", s2 = l2 ? i2 : n2, u = w$1(o3.format, s2);
    E$1(t, A({}, o3, { axis: l2 ? "x" : "y", x: "right" === e4 ? r2 : 0, y: "bottom" === e4 ? a2 : 0, scale: s2, format: u, length: l2 ? r2 : a2, ticksPosition: c2, theme: f }));
  }));
}, q$1 = function(t, e3) {
  var i2 = e3.width, n2 = e3.height, r2 = e3.scale, a2 = e3.axis, o2 = e3.values;
  O$1({ width: i2, height: n2, scale: r2, axis: a2, values: o2 }).forEach((function(e4) {
    t.beginPath(), t.moveTo(e4.x1, e4.y1), t.lineTo(e4.x2, e4.y2), t.stroke();
  }));
};
var _baseFilter;
var hasRequired_baseFilter;
function require_baseFilter() {
  if (hasRequired_baseFilter) return _baseFilter;
  hasRequired_baseFilter = 1;
  var baseEach = require_baseEach();
  function baseFilter(collection, predicate) {
    var result = [];
    baseEach(collection, function(value, index, collection2) {
      if (predicate(value, index, collection2)) {
        result.push(value);
      }
    });
    return result;
  }
  _baseFilter = baseFilter;
  return _baseFilter;
}
var filter_1;
var hasRequiredFilter;
function requireFilter() {
  if (hasRequiredFilter) return filter_1;
  hasRequiredFilter = 1;
  var arrayFilter = require_arrayFilter(), baseFilter = require_baseFilter(), baseIteratee = require_baseIteratee(), isArray = requireIsArray();
  function filter(collection, predicate) {
    var func = isArray(collection) ? arrayFilter : baseFilter;
    return func(collection, baseIteratee(predicate, 3));
  }
  filter_1 = filter;
  return filter_1;
}
var filterExports = requireFilter();
const o$1 = /* @__PURE__ */ getDefaultExportFromCjs(filterExports);
var isNumber_1;
var hasRequiredIsNumber;
function requireIsNumber() {
  if (hasRequiredIsNumber) return isNumber_1;
  hasRequiredIsNumber = 1;
  var baseGetTag = require_baseGetTag(), isObjectLike = requireIsObjectLike();
  var numberTag = "[object Number]";
  function isNumber(value) {
    return typeof value == "number" || isObjectLike(value) && baseGetTag(value) == numberTag;
  }
  isNumber_1 = isNumber;
  return isNumber_1;
}
var isNumberExports = requireIsNumber();
const e = /* @__PURE__ */ getDefaultExportFromCjs(isNumberExports);
var _arrayEach;
var hasRequired_arrayEach;
function require_arrayEach() {
  if (hasRequired_arrayEach) return _arrayEach;
  hasRequired_arrayEach = 1;
  function arrayEach(array2, iteratee) {
    var index = -1, length = array2 == null ? 0 : array2.length;
    while (++index < length) {
      if (iteratee(array2[index], index, array2) === false) {
        break;
      }
    }
    return array2;
  }
  _arrayEach = arrayEach;
  return _arrayEach;
}
var _baseAssign;
var hasRequired_baseAssign;
function require_baseAssign() {
  if (hasRequired_baseAssign) return _baseAssign;
  hasRequired_baseAssign = 1;
  var copyObject = require_copyObject(), keys = requireKeys();
  function baseAssign(object2, source) {
    return object2 && copyObject(source, keys(source), object2);
  }
  _baseAssign = baseAssign;
  return _baseAssign;
}
var _baseAssignIn;
var hasRequired_baseAssignIn;
function require_baseAssignIn() {
  if (hasRequired_baseAssignIn) return _baseAssignIn;
  hasRequired_baseAssignIn = 1;
  var copyObject = require_copyObject(), keysIn = requireKeysIn();
  function baseAssignIn(object2, source) {
    return object2 && copyObject(source, keysIn(source), object2);
  }
  _baseAssignIn = baseAssignIn;
  return _baseAssignIn;
}
var _copySymbols;
var hasRequired_copySymbols;
function require_copySymbols() {
  if (hasRequired_copySymbols) return _copySymbols;
  hasRequired_copySymbols = 1;
  var copyObject = require_copyObject(), getSymbols = require_getSymbols();
  function copySymbols(source, object2) {
    return copyObject(source, getSymbols(source), object2);
  }
  _copySymbols = copySymbols;
  return _copySymbols;
}
var _getSymbolsIn;
var hasRequired_getSymbolsIn;
function require_getSymbolsIn() {
  if (hasRequired_getSymbolsIn) return _getSymbolsIn;
  hasRequired_getSymbolsIn = 1;
  var arrayPush = require_arrayPush(), getPrototype = require_getPrototype(), getSymbols = require_getSymbols(), stubArray = requireStubArray();
  var nativeGetSymbols = Object.getOwnPropertySymbols;
  var getSymbolsIn = !nativeGetSymbols ? stubArray : function(object2) {
    var result = [];
    while (object2) {
      arrayPush(result, getSymbols(object2));
      object2 = getPrototype(object2);
    }
    return result;
  };
  _getSymbolsIn = getSymbolsIn;
  return _getSymbolsIn;
}
var _copySymbolsIn;
var hasRequired_copySymbolsIn;
function require_copySymbolsIn() {
  if (hasRequired_copySymbolsIn) return _copySymbolsIn;
  hasRequired_copySymbolsIn = 1;
  var copyObject = require_copyObject(), getSymbolsIn = require_getSymbolsIn();
  function copySymbolsIn(source, object2) {
    return copyObject(source, getSymbolsIn(source), object2);
  }
  _copySymbolsIn = copySymbolsIn;
  return _copySymbolsIn;
}
var _getAllKeysIn;
var hasRequired_getAllKeysIn;
function require_getAllKeysIn() {
  if (hasRequired_getAllKeysIn) return _getAllKeysIn;
  hasRequired_getAllKeysIn = 1;
  var baseGetAllKeys = require_baseGetAllKeys(), getSymbolsIn = require_getSymbolsIn(), keysIn = requireKeysIn();
  function getAllKeysIn(object2) {
    return baseGetAllKeys(object2, keysIn, getSymbolsIn);
  }
  _getAllKeysIn = getAllKeysIn;
  return _getAllKeysIn;
}
var _initCloneArray;
var hasRequired_initCloneArray;
function require_initCloneArray() {
  if (hasRequired_initCloneArray) return _initCloneArray;
  hasRequired_initCloneArray = 1;
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  function initCloneArray(array2) {
    var length = array2.length, result = new array2.constructor(length);
    if (length && typeof array2[0] == "string" && hasOwnProperty.call(array2, "index")) {
      result.index = array2.index;
      result.input = array2.input;
    }
    return result;
  }
  _initCloneArray = initCloneArray;
  return _initCloneArray;
}
var _cloneDataView;
var hasRequired_cloneDataView;
function require_cloneDataView() {
  if (hasRequired_cloneDataView) return _cloneDataView;
  hasRequired_cloneDataView = 1;
  var cloneArrayBuffer = require_cloneArrayBuffer();
  function cloneDataView(dataView, isDeep) {
    var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
    return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
  }
  _cloneDataView = cloneDataView;
  return _cloneDataView;
}
var _cloneRegExp;
var hasRequired_cloneRegExp;
function require_cloneRegExp() {
  if (hasRequired_cloneRegExp) return _cloneRegExp;
  hasRequired_cloneRegExp = 1;
  var reFlags = /\w*$/;
  function cloneRegExp(regexp) {
    var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
    result.lastIndex = regexp.lastIndex;
    return result;
  }
  _cloneRegExp = cloneRegExp;
  return _cloneRegExp;
}
var _cloneSymbol;
var hasRequired_cloneSymbol;
function require_cloneSymbol() {
  if (hasRequired_cloneSymbol) return _cloneSymbol;
  hasRequired_cloneSymbol = 1;
  var Symbol = require_Symbol();
  var symbolProto = Symbol ? Symbol.prototype : void 0, symbolValueOf = symbolProto ? symbolProto.valueOf : void 0;
  function cloneSymbol(symbol) {
    return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
  }
  _cloneSymbol = cloneSymbol;
  return _cloneSymbol;
}
var _initCloneByTag;
var hasRequired_initCloneByTag;
function require_initCloneByTag() {
  if (hasRequired_initCloneByTag) return _initCloneByTag;
  hasRequired_initCloneByTag = 1;
  var cloneArrayBuffer = require_cloneArrayBuffer(), cloneDataView = require_cloneDataView(), cloneRegExp = require_cloneRegExp(), cloneSymbol = require_cloneSymbol(), cloneTypedArray = require_cloneTypedArray();
  var boolTag = "[object Boolean]", dateTag = "[object Date]", mapTag = "[object Map]", numberTag = "[object Number]", regexpTag = "[object RegExp]", setTag = "[object Set]", stringTag = "[object String]", symbolTag = "[object Symbol]";
  var arrayBufferTag = "[object ArrayBuffer]", dataViewTag = "[object DataView]", float32Tag = "[object Float32Array]", float64Tag = "[object Float64Array]", int8Tag = "[object Int8Array]", int16Tag = "[object Int16Array]", int32Tag = "[object Int32Array]", uint8Tag = "[object Uint8Array]", uint8ClampedTag = "[object Uint8ClampedArray]", uint16Tag = "[object Uint16Array]", uint32Tag = "[object Uint32Array]";
  function initCloneByTag(object2, tag, isDeep) {
    var Ctor = object2.constructor;
    switch (tag) {
      case arrayBufferTag:
        return cloneArrayBuffer(object2);
      case boolTag:
      case dateTag:
        return new Ctor(+object2);
      case dataViewTag:
        return cloneDataView(object2, isDeep);
      case float32Tag:
      case float64Tag:
      case int8Tag:
      case int16Tag:
      case int32Tag:
      case uint8Tag:
      case uint8ClampedTag:
      case uint16Tag:
      case uint32Tag:
        return cloneTypedArray(object2, isDeep);
      case mapTag:
        return new Ctor();
      case numberTag:
      case stringTag:
        return new Ctor(object2);
      case regexpTag:
        return cloneRegExp(object2);
      case setTag:
        return new Ctor();
      case symbolTag:
        return cloneSymbol(object2);
    }
  }
  _initCloneByTag = initCloneByTag;
  return _initCloneByTag;
}
var _baseIsMap;
var hasRequired_baseIsMap;
function require_baseIsMap() {
  if (hasRequired_baseIsMap) return _baseIsMap;
  hasRequired_baseIsMap = 1;
  var getTag = require_getTag(), isObjectLike = requireIsObjectLike();
  var mapTag = "[object Map]";
  function baseIsMap(value) {
    return isObjectLike(value) && getTag(value) == mapTag;
  }
  _baseIsMap = baseIsMap;
  return _baseIsMap;
}
var isMap_1;
var hasRequiredIsMap;
function requireIsMap() {
  if (hasRequiredIsMap) return isMap_1;
  hasRequiredIsMap = 1;
  var baseIsMap = require_baseIsMap(), baseUnary = require_baseUnary(), nodeUtil = require_nodeUtil();
  var nodeIsMap = nodeUtil && nodeUtil.isMap;
  var isMap = nodeIsMap ? baseUnary(nodeIsMap) : baseIsMap;
  isMap_1 = isMap;
  return isMap_1;
}
var _baseIsSet;
var hasRequired_baseIsSet;
function require_baseIsSet() {
  if (hasRequired_baseIsSet) return _baseIsSet;
  hasRequired_baseIsSet = 1;
  var getTag = require_getTag(), isObjectLike = requireIsObjectLike();
  var setTag = "[object Set]";
  function baseIsSet(value) {
    return isObjectLike(value) && getTag(value) == setTag;
  }
  _baseIsSet = baseIsSet;
  return _baseIsSet;
}
var isSet_1;
var hasRequiredIsSet;
function requireIsSet() {
  if (hasRequiredIsSet) return isSet_1;
  hasRequiredIsSet = 1;
  var baseIsSet = require_baseIsSet(), baseUnary = require_baseUnary(), nodeUtil = require_nodeUtil();
  var nodeIsSet = nodeUtil && nodeUtil.isSet;
  var isSet = nodeIsSet ? baseUnary(nodeIsSet) : baseIsSet;
  isSet_1 = isSet;
  return isSet_1;
}
var _baseClone;
var hasRequired_baseClone;
function require_baseClone() {
  if (hasRequired_baseClone) return _baseClone;
  hasRequired_baseClone = 1;
  var Stack = require_Stack(), arrayEach = require_arrayEach(), assignValue = require_assignValue(), baseAssign = require_baseAssign(), baseAssignIn = require_baseAssignIn(), cloneBuffer = require_cloneBuffer(), copyArray = require_copyArray(), copySymbols = require_copySymbols(), copySymbolsIn = require_copySymbolsIn(), getAllKeys = require_getAllKeys(), getAllKeysIn = require_getAllKeysIn(), getTag = require_getTag(), initCloneArray = require_initCloneArray(), initCloneByTag = require_initCloneByTag(), initCloneObject = require_initCloneObject(), isArray = requireIsArray(), isBuffer = requireIsBuffer(), isMap = requireIsMap(), isObject = requireIsObject(), isSet = requireIsSet(), keys = requireKeys(), keysIn = requireKeysIn();
  var CLONE_DEEP_FLAG = 1, CLONE_FLAT_FLAG = 2, CLONE_SYMBOLS_FLAG = 4;
  var argsTag = "[object Arguments]", arrayTag = "[object Array]", boolTag = "[object Boolean]", dateTag = "[object Date]", errorTag = "[object Error]", funcTag = "[object Function]", genTag = "[object GeneratorFunction]", mapTag = "[object Map]", numberTag = "[object Number]", objectTag = "[object Object]", regexpTag = "[object RegExp]", setTag = "[object Set]", stringTag = "[object String]", symbolTag = "[object Symbol]", weakMapTag = "[object WeakMap]";
  var arrayBufferTag = "[object ArrayBuffer]", dataViewTag = "[object DataView]", float32Tag = "[object Float32Array]", float64Tag = "[object Float64Array]", int8Tag = "[object Int8Array]", int16Tag = "[object Int16Array]", int32Tag = "[object Int32Array]", uint8Tag = "[object Uint8Array]", uint8ClampedTag = "[object Uint8ClampedArray]", uint16Tag = "[object Uint16Array]", uint32Tag = "[object Uint32Array]";
  var cloneableTags = {};
  cloneableTags[argsTag] = cloneableTags[arrayTag] = cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] = cloneableTags[boolTag] = cloneableTags[dateTag] = cloneableTags[float32Tag] = cloneableTags[float64Tag] = cloneableTags[int8Tag] = cloneableTags[int16Tag] = cloneableTags[int32Tag] = cloneableTags[mapTag] = cloneableTags[numberTag] = cloneableTags[objectTag] = cloneableTags[regexpTag] = cloneableTags[setTag] = cloneableTags[stringTag] = cloneableTags[symbolTag] = cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] = cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
  cloneableTags[errorTag] = cloneableTags[funcTag] = cloneableTags[weakMapTag] = false;
  function baseClone(value, bitmask, customizer, key, object2, stack) {
    var result, isDeep = bitmask & CLONE_DEEP_FLAG, isFlat = bitmask & CLONE_FLAT_FLAG, isFull = bitmask & CLONE_SYMBOLS_FLAG;
    if (customizer) {
      result = object2 ? customizer(value, key, object2, stack) : customizer(value);
    }
    if (result !== void 0) {
      return result;
    }
    if (!isObject(value)) {
      return value;
    }
    var isArr = isArray(value);
    if (isArr) {
      result = initCloneArray(value);
      if (!isDeep) {
        return copyArray(value, result);
      }
    } else {
      var tag = getTag(value), isFunc = tag == funcTag || tag == genTag;
      if (isBuffer(value)) {
        return cloneBuffer(value, isDeep);
      }
      if (tag == objectTag || tag == argsTag || isFunc && !object2) {
        result = isFlat || isFunc ? {} : initCloneObject(value);
        if (!isDeep) {
          return isFlat ? copySymbolsIn(value, baseAssignIn(result, value)) : copySymbols(value, baseAssign(result, value));
        }
      } else {
        if (!cloneableTags[tag]) {
          return object2 ? value : {};
        }
        result = initCloneByTag(value, tag, isDeep);
      }
    }
    stack || (stack = new Stack());
    var stacked = stack.get(value);
    if (stacked) {
      return stacked;
    }
    stack.set(value, result);
    if (isSet(value)) {
      value.forEach(function(subValue) {
        result.add(baseClone(subValue, bitmask, customizer, subValue, value, stack));
      });
    } else if (isMap(value)) {
      value.forEach(function(subValue, key2) {
        result.set(key2, baseClone(subValue, bitmask, customizer, key2, value, stack));
      });
    }
    var keysFunc = isFull ? isFlat ? getAllKeysIn : getAllKeys : isFlat ? keysIn : keys;
    var props = isArr ? void 0 : keysFunc(value);
    arrayEach(props || value, function(subValue, key2) {
      if (props) {
        key2 = subValue;
        subValue = value[key2];
      }
      assignValue(result, key2, baseClone(subValue, bitmask, customizer, key2, value, stack));
    });
    return result;
  }
  _baseClone = baseClone;
  return _baseClone;
}
var _baseSlice;
var hasRequired_baseSlice;
function require_baseSlice() {
  if (hasRequired_baseSlice) return _baseSlice;
  hasRequired_baseSlice = 1;
  function baseSlice(array2, start, end) {
    var index = -1, length = array2.length;
    if (start < 0) {
      start = -start > length ? 0 : length + start;
    }
    end = end > length ? length : end;
    if (end < 0) {
      end += length;
    }
    length = start > end ? 0 : end - start >>> 0;
    start >>>= 0;
    var result = Array(length);
    while (++index < length) {
      result[index] = array2[index + start];
    }
    return result;
  }
  _baseSlice = baseSlice;
  return _baseSlice;
}
var _parent;
var hasRequired_parent;
function require_parent() {
  if (hasRequired_parent) return _parent;
  hasRequired_parent = 1;
  var baseGet = require_baseGet(), baseSlice = require_baseSlice();
  function parent(object2, path) {
    return path.length < 2 ? object2 : baseGet(object2, baseSlice(path, 0, -1));
  }
  _parent = parent;
  return _parent;
}
var _baseUnset;
var hasRequired_baseUnset;
function require_baseUnset() {
  if (hasRequired_baseUnset) return _baseUnset;
  hasRequired_baseUnset = 1;
  var castPath = require_castPath(), last = requireLast(), parent = require_parent(), toKey = require_toKey();
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  function baseUnset(object2, path) {
    path = castPath(path, object2);
    var index = -1, length = path.length;
    if (!length) {
      return true;
    }
    while (++index < length) {
      var key = toKey(path[index]);
      if (key === "__proto__" && !hasOwnProperty.call(object2, "__proto__")) {
        return false;
      }
      if ((key === "constructor" || key === "prototype") && index < length - 1) {
        return false;
      }
    }
    var obj = parent(object2, path);
    return obj == null || delete obj[toKey(last(path))];
  }
  _baseUnset = baseUnset;
  return _baseUnset;
}
var _customOmitClone;
var hasRequired_customOmitClone;
function require_customOmitClone() {
  if (hasRequired_customOmitClone) return _customOmitClone;
  hasRequired_customOmitClone = 1;
  var isPlainObject = requireIsPlainObject();
  function customOmitClone(value) {
    return isPlainObject(value) ? void 0 : value;
  }
  _customOmitClone = customOmitClone;
  return _customOmitClone;
}
var omit_1;
var hasRequiredOmit;
function requireOmit() {
  if (hasRequiredOmit) return omit_1;
  hasRequiredOmit = 1;
  var arrayMap = require_arrayMap(), baseClone = require_baseClone(), baseUnset = require_baseUnset(), castPath = require_castPath(), copyObject = require_copyObject(), customOmitClone = require_customOmitClone(), flatRest = require_flatRest(), getAllKeysIn = require_getAllKeysIn();
  var CLONE_DEEP_FLAG = 1, CLONE_FLAT_FLAG = 2, CLONE_SYMBOLS_FLAG = 4;
  var omit = flatRest(function(object2, paths) {
    var result = {};
    if (object2 == null) {
      return result;
    }
    var isDeep = false;
    paths = arrayMap(paths, function(path) {
      path = castPath(path, object2);
      isDeep || (isDeep = path.length > 1);
      return path;
    });
    copyObject(object2, getAllKeysIn(object2), result);
    if (isDeep) {
      result = baseClone(result, CLONE_DEEP_FLAG | CLONE_FLAT_FLAG | CLONE_SYMBOLS_FLAG, customOmitClone);
    }
    var length = paths.length;
    while (length--) {
      baseUnset(result, paths[length]);
    }
    return result;
  });
  omit_1 = omit;
  return omit_1;
}
var omitExports = requireOmit();
const a = /* @__PURE__ */ getDefaultExportFromCjs(omitExports);
function g() {
  return g = Object.assign ? Object.assign.bind() : function(t) {
    for (var n2 = 1; n2 < arguments.length; n2++) {
      var i2 = arguments[n2];
      for (var o2 in i2) ({}).hasOwnProperty.call(i2, o2) && (t[o2] = i2[o2]);
    }
    return t;
  }, g.apply(null, arguments);
}
var k = { dotSize: 4, noteWidth: 120, noteTextOffset: 8 }, W = function(n2) {
  var i2 = typeof n2;
  return reactExports.isValidElement(n2) || "string" === i2 || "function" === i2 || "object" === i2;
}, v = function(t) {
  var n2 = typeof t;
  return "string" === n2 || "function" === n2;
}, b = function(t) {
  return "circle" === t.type;
}, w = function(t) {
  return "dot" === t.type;
}, z = function(t) {
  return "rect" === t.type;
}, P = function(t) {
  var n2 = t.data, i2 = t.annotations, e3 = t.getPosition, r2 = t.getDimensions;
  return i2.reduce((function(t2, i3) {
    var s = i3.offset || 0;
    return [].concat(t2, o$1(n2, i3.match).map((function(t3) {
      var n3 = e3(t3), o2 = r2(t3);
      return (b(i3) || z(i3)) && (o2.size = o2.size + 2 * s, o2.width = o2.width + 2 * s, o2.height = o2.height + 2 * s), g({}, a(i3, ["match", "offset"]), n3, o2, { size: i3.size || o2.size, datum: t3 });
    })));
  }), []);
}, C = function(t, n2, i2, o2) {
  var e3 = Math.atan2(o2 - n2, i2 - t);
  return ht(ct(e3));
}, S = function(t) {
  var n2, i2, o2 = t.x, a2 = t.y, r2 = t.noteX, s = t.noteY, h = t.noteWidth, d2 = void 0 === h ? k.noteWidth : h, c = t.noteTextOffset, f = void 0 === c ? k.noteTextOffset : c;
  if (e(r2)) n2 = o2 + r2;
  else {
    if (void 0 === r2.abs) throw new Error("noteX should be either a number or an object containing an 'abs' property");
    n2 = r2.abs;
  }
  if (e(s)) i2 = a2 + s;
  else {
    if (void 0 === s.abs) throw new Error("noteY should be either a number or an object containing an 'abs' property");
    i2 = s.abs;
  }
  var y = o2, x = a2, m = C(o2, a2, n2, i2);
  if (b(t)) {
    var p2 = ft(ut(m), t.size / 2);
    y += p2.x, x += p2.y;
  }
  if (z(t)) {
    var g2 = Math.round((m + 90) / 45) % 8;
    0 === g2 && (x -= t.height / 2), 1 === g2 && (y += t.width / 2, x -= t.height / 2), 2 === g2 && (y += t.width / 2), 3 === g2 && (y += t.width / 2, x += t.height / 2), 4 === g2 && (x += t.height / 2), 5 === g2 && (y -= t.width / 2, x += t.height / 2), 6 === g2 && (y -= t.width / 2), 7 === g2 && (y -= t.width / 2, x -= t.height / 2);
  }
  var W2 = n2, v2 = n2;
  return (m + 90) % 360 > 180 ? (W2 -= d2, v2 -= d2) : v2 += d2, { points: [[y, x], [n2, i2], [v2, i2]], text: [W2, i2 - f], angle: m + 90 };
}, O = function(t) {
  var i2 = t.data, o2 = t.annotations, e3 = t.getPosition, a2 = t.getDimensions;
  return reactExports.useMemo((function() {
    return P({ data: i2, annotations: o2, getPosition: e3, getDimensions: a2 });
  }), [i2, o2, e3, a2]);
}, j = function(t) {
  var i2 = t.annotations;
  return reactExports.useMemo((function() {
    return i2.map((function(t2) {
      return g({}, t2, { computed: S(g({}, t2)) });
    }));
  }), [i2]);
}, M = function(t) {
  return reactExports.useMemo((function() {
    return S(t);
  }), [t]);
}, T = function(t) {
  var n2 = t.datum, o2 = t.x, e3 = t.y, r2 = t.note, s = M$1(), l = Dr(), u = l.animate, d2 = l.config, k2 = useSpring({ x: o2, y: e3, config: d2, immediate: !u });
  return "function" == typeof r2 ? reactExports.createElement(r2, { x: o2, y: e3, datum: n2 }) : jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [s.annotations.text.outlineWidth > 0 && jsxRuntimeExports.jsx(animated.text, { x: k2.x, y: k2.y, style: g({}, s.annotations.text, { strokeLinejoin: "round", strokeWidth: 2 * s.annotations.text.outlineWidth, stroke: s.annotations.text.outlineColor }), children: r2 }), jsxRuntimeExports.jsx(animated.text, { x: k2.x, y: k2.y, style: a(s.annotations.text, ["outlineWidth", "outlineColor"]), children: r2 })] });
}, E = function(t) {
  var i2 = t.points, o2 = t.isOutline, e3 = void 0 !== o2 && o2, a2 = M$1(), r2 = reactExports.useMemo((function() {
    var t2 = i2[0];
    return i2.slice(1).reduce((function(t3, n2) {
      return t3 + " L" + n2[0] + "," + n2[1];
    }), "M" + t2[0] + "," + t2[1]);
  }), [i2]), s = It(r2);
  if (e3 && a2.annotations.link.outlineWidth <= 0) return null;
  var l = g({}, a2.annotations.link);
  return e3 && (l.strokeLinecap = "square", l.strokeWidth = a2.annotations.link.strokeWidth + 2 * a2.annotations.link.outlineWidth, l.stroke = a2.annotations.link.outlineColor, l.opacity = a2.annotations.link.outlineOpacity), jsxRuntimeExports.jsx(animated.path, { fill: "none", d: s, style: l });
}, I = function(t) {
  var n2 = t.x, i2 = t.y, o2 = t.size, e3 = M$1(), a2 = Dr(), r2 = a2.animate, s = a2.config, l = useSpring({ x: n2, y: i2, radius: o2 / 2, config: s, immediate: !r2 });
  return jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [e3.annotations.outline.outlineWidth > 0 && jsxRuntimeExports.jsx(animated.circle, { cx: l.x, cy: l.y, r: l.radius, style: g({}, e3.annotations.outline, { fill: "none", strokeWidth: e3.annotations.outline.strokeWidth + 2 * e3.annotations.outline.outlineWidth, stroke: e3.annotations.outline.outlineColor, opacity: e3.annotations.outline.outlineOpacity }) }), jsxRuntimeExports.jsx(animated.circle, { cx: l.x, cy: l.y, r: l.radius, style: e3.annotations.outline })] });
}, D = function(t) {
  var n2 = t.x, i2 = t.y, o2 = t.size, e3 = void 0 === o2 ? k.dotSize : o2, a2 = M$1(), r2 = Dr(), s = r2.animate, l = r2.config, u = useSpring({ x: n2, y: i2, radius: e3 / 2, config: l, immediate: !s });
  return jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [a2.annotations.outline.outlineWidth > 0 && jsxRuntimeExports.jsx(animated.circle, { cx: u.x, cy: u.y, r: u.radius, style: g({}, a2.annotations.outline, { fill: "none", strokeWidth: 2 * a2.annotations.outline.outlineWidth, stroke: a2.annotations.outline.outlineColor, opacity: a2.annotations.outline.outlineOpacity }) }), jsxRuntimeExports.jsx(animated.circle, { cx: u.x, cy: u.y, r: u.radius, style: a2.annotations.symbol })] });
}, L = function(t) {
  var n2 = t.x, i2 = t.y, o2 = t.width, e3 = t.height, a2 = t.borderRadius, r2 = void 0 === a2 ? 6 : a2, s = M$1(), l = Dr(), u = l.animate, d2 = l.config, k2 = useSpring({ x: n2 - o2 / 2, y: i2 - e3 / 2, width: o2, height: e3, config: d2, immediate: !u });
  return jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [s.annotations.outline.outlineWidth > 0 && jsxRuntimeExports.jsx(animated.rect, { x: k2.x, y: k2.y, rx: r2, ry: r2, width: k2.width, height: k2.height, style: g({}, s.annotations.outline, { fill: "none", strokeWidth: s.annotations.outline.strokeWidth + 2 * s.annotations.outline.outlineWidth, stroke: s.annotations.outline.outlineColor, opacity: s.annotations.outline.outlineOpacity }) }), jsxRuntimeExports.jsx(animated.rect, { x: k2.x, y: k2.y, rx: r2, ry: r2, width: k2.width, height: k2.height, style: s.annotations.outline })] });
}, R = function(t) {
  var n2 = t.datum, i2 = t.x, o2 = t.y, e3 = t.note, a2 = M(t);
  if (!W(e3)) throw new Error("note should be a valid react element");
  return jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [jsxRuntimeExports.jsx(E, { points: a2.points, isOutline: true }), b(t) && jsxRuntimeExports.jsx(I, { x: i2, y: o2, size: t.size }), w(t) && jsxRuntimeExports.jsx(D, { x: i2, y: o2, size: t.size }), z(t) && jsxRuntimeExports.jsx(L, { x: i2, y: o2, width: t.width, height: t.height, borderRadius: t.borderRadius }), jsxRuntimeExports.jsx(E, { points: a2.points }), jsxRuntimeExports.jsx(T, { datum: n2, x: a2.text[0], y: a2.text[1], note: e3 })] });
}, q = function(t, n2) {
  n2.forEach((function(n3, i2) {
    var o2 = n3[0], e3 = n3[1];
    0 === i2 ? t.moveTo(o2, e3) : t.lineTo(o2, e3);
  }));
}, J = function(t, n2) {
  var i2 = n2.annotations, o2 = n2.theme;
  0 !== i2.length && (t.save(), i2.forEach((function(n3) {
    if (!v(n3.note)) throw new Error("note is invalid for canvas implementation");
    o2.annotations.link.outlineWidth > 0 && (t.lineCap = "square", t.strokeStyle = o2.annotations.link.outlineColor, t.lineWidth = o2.annotations.link.strokeWidth + 2 * o2.annotations.link.outlineWidth, t.beginPath(), q(t, n3.computed.points), t.stroke(), t.lineCap = "butt"), b(n3) && o2.annotations.outline.outlineWidth > 0 && (t.strokeStyle = o2.annotations.outline.outlineColor, t.lineWidth = o2.annotations.outline.strokeWidth + 2 * o2.annotations.outline.outlineWidth, t.beginPath(), t.arc(n3.x, n3.y, n3.size / 2, 0, 2 * Math.PI), t.stroke()), w(n3) && o2.annotations.symbol.outlineWidth > 0 && (t.strokeStyle = o2.annotations.symbol.outlineColor, t.lineWidth = 2 * o2.annotations.symbol.outlineWidth, t.beginPath(), t.arc(n3.x, n3.y, n3.size / 2, 0, 2 * Math.PI), t.stroke()), z(n3) && o2.annotations.outline.outlineWidth > 0 && (t.strokeStyle = o2.annotations.outline.outlineColor, t.lineWidth = o2.annotations.outline.strokeWidth + 2 * o2.annotations.outline.outlineWidth, t.beginPath(), t.rect(n3.x - n3.width / 2, n3.y - n3.height / 2, n3.width, n3.height), t.stroke()), t.strokeStyle = o2.annotations.link.stroke, t.lineWidth = o2.annotations.link.strokeWidth, t.beginPath(), q(t, n3.computed.points), t.stroke(), b(n3) && (t.strokeStyle = o2.annotations.outline.stroke, t.lineWidth = o2.annotations.outline.strokeWidth, t.beginPath(), t.arc(n3.x, n3.y, n3.size / 2, 0, 2 * Math.PI), t.stroke()), w(n3) && (t.fillStyle = o2.annotations.symbol.fill, t.beginPath(), t.arc(n3.x, n3.y, n3.size / 2, 0, 2 * Math.PI), t.fill()), z(n3) && (t.strokeStyle = o2.annotations.outline.stroke, t.lineWidth = o2.annotations.outline.strokeWidth, t.beginPath(), t.rect(n3.x - n3.width / 2, n3.y - n3.height / 2, n3.width, n3.height), t.stroke()), "function" == typeof n3.note ? n3.note(t, { datum: n3.datum, x: n3.computed.text[0], y: n3.computed.text[1], theme: o2 }) : (t.font = o2.annotations.text.fontSize + "px " + o2.annotations.text.fontFamily, t.textAlign = "left", t.textBaseline = "alphabetic", t.fillStyle = o2.annotations.text.fill, t.strokeStyle = o2.annotations.text.outlineColor, t.lineWidth = 2 * o2.annotations.text.outlineWidth, o2.annotations.text.outlineWidth > 0 && (t.lineJoin = "round", t.strokeText(n3.note, n3.computed.text[0], n3.computed.text[1]), t.lineJoin = "miter"), t.fillText(n3.note, n3.computed.text[0], n3.computed.text[1]));
  })), t.restore());
};
var o = function(o2, e3, r2, a2, i2, u) {
  u > 0 ? (o2.moveTo(e3 + u, r2), o2.lineTo(e3 + a2 - u, r2), o2.quadraticCurveTo(e3 + a2, r2, e3 + a2, r2 + u), o2.lineTo(e3 + a2, r2 + i2 - u), o2.quadraticCurveTo(e3 + a2, r2 + i2, e3 + a2 - u, r2 + i2), o2.lineTo(e3 + u, r2 + i2), o2.quadraticCurveTo(e3, r2 + i2, e3, r2 + i2 - u), o2.lineTo(e3, r2 + u), o2.quadraticCurveTo(e3, r2, e3 + u, r2), o2.closePath()) : o2.rect(e3, r2, a2, i2);
};
function Q() {
  return Q = Object.assign ? Object.assign.bind() : function(e3) {
    for (var t = 1; t < arguments.length; t++) {
      var a2 = arguments[t];
      for (var i2 in a2) ({}).hasOwnProperty.call(a2, i2) && (e3[i2] = a2[i2]);
    }
    return e3;
  }, Q.apply(null, arguments);
}
function U(e3, t) {
  if (null == e3) return {};
  var a2 = {};
  for (var i2 in e3) if ({}.hasOwnProperty.call(e3, i2)) {
    if (-1 !== t.indexOf(i2)) continue;
    a2[i2] = e3[i2];
  }
  return a2;
}
var Z, $ = function(e3) {
  var t = e3.bars, a2 = e3.annotations, i2 = O({ data: t, annotations: a2, getPosition: function(e4) {
    return { x: e4.x + e4.width / 2, y: e4.y + e4.height / 2 };
  }, getDimensions: function(e4) {
    var t2 = e4.height, a3 = e4.width;
    return { width: a3, height: t2, size: Math.max(a3, t2) };
  } });
  return jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: i2.map((function(e4, t2) {
    return jsxRuntimeExports.jsx(R, Q({}, e4), t2);
  })) });
}, ee = function(e3) {
  var t = e3.width, a2 = e3.height, i2 = e3.legends, n2 = e3.toggleSerie;
  return jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: i2.map((function(e4, i3) {
    var l, r2 = e4[0], o2 = e4[1];
    return jsxRuntimeExports.jsx(E$2, Q({}, r2, { containerWidth: t, containerHeight: a2, data: null != (l = r2.data) ? l : o2, toggleSerie: r2.toggleSerie && "keys" === r2.dataFrom ? n2 : void 0 }), i3);
  })) });
}, te = ["data"], ae = function(i2) {
  var n2, l = i2.bar, r2 = l.data, o2 = U(l, te), d2 = i2.style, u = d2.borderColor, s = d2.color, c = d2.height, h = d2.labelColor, f = d2.labelOpacity, b2 = d2.labelX, g2 = d2.labelY, v2 = d2.transform, m = d2.width, p2 = d2.textAnchor, y = i2.borderRadius, x = i2.borderWidth, S2 = i2.label, k2 = i2.shouldRenderLabel, w2 = i2.isInteractive, L2 = i2.onClick, M2 = i2.onMouseEnter, B2 = i2.onMouseLeave, R2 = i2.tooltip, O2 = i2.isFocusable, I2 = i2.ariaLabel, T2 = i2.ariaLabelledBy, P2 = i2.ariaDescribedBy, E2 = i2.ariaDisabled, F = i2.ariaHidden, z2 = M$1(), X2 = z$2(), G = X2.showTooltipFromEvent, N = X2.showTooltipAt, j2 = X2.hideTooltip, K = reactExports.useMemo((function() {
    return function() {
      return reactExports.createElement(R2, Q({}, o2, r2));
    };
  }), [R2, o2, r2]), _2 = reactExports.useCallback((function(e3) {
    null == L2 || L2(Q({ color: o2.color }, r2), e3);
  }), [o2, r2, L2]), q2 = reactExports.useCallback((function(e3) {
    return G(K(), e3);
  }), [G, K]), J2 = reactExports.useCallback((function(e3) {
    null == M2 || M2(r2, e3), G(K(), e3);
  }), [r2, M2, G, K]), Z2 = reactExports.useCallback((function(e3) {
    null == B2 || B2(r2, e3), j2();
  }), [r2, j2, B2]), $2 = reactExports.useCallback((function() {
    N(K(), [o2.absX + o2.width / 2, o2.absY]);
  }), [N, K, o2]), ee2 = reactExports.useCallback((function() {
    j2();
  }), [j2]);
  return jsxRuntimeExports.jsxs(animated.g, { transform: v2, children: [jsxRuntimeExports.jsx(animated.rect, { width: to(m, (function(e3) {
    return Math.max(e3, 0);
  })), height: to(c, (function(e3) {
    return Math.max(e3, 0);
  })), rx: y, ry: y, fill: null != (n2 = r2.fill) ? n2 : s, strokeWidth: x, stroke: u, focusable: O2, tabIndex: O2 ? 0 : void 0, "aria-label": I2 ? I2(r2) : void 0, "aria-labelledby": T2 ? T2(r2) : void 0, "aria-describedby": P2 ? P2(r2) : void 0, "aria-disabled": E2 ? E2(r2) : void 0, "aria-hidden": F ? F(r2) : void 0, onMouseEnter: w2 ? J2 : void 0, onMouseMove: w2 ? q2 : void 0, onMouseLeave: w2 ? Z2 : void 0, onClick: w2 ? _2 : void 0, onFocus: w2 && O2 ? $2 : void 0, onBlur: w2 && O2 ? ee2 : void 0, "data-testid": "bar.item." + r2.id + "." + r2.index }), k2 && jsxRuntimeExports.jsx(b$1, { x: b2, y: g2, textAnchor: p2, dominantBaseline: "central", fillOpacity: f, style: Q({}, z2.labels.text, { pointerEvents: "none", fill: h }), children: S2 })] });
}, ie = ["color", "label"], ne = function(e3) {
  var t = e3.color, a2 = e3.label, i2 = U(e3, ie);
  return jsxRuntimeExports.jsx(T$2, { id: a2, value: i2.formattedValue, enableChip: true, color: t });
}, le = { indexBy: "id", keys: ["value"], groupMode: "stacked", layout: "vertical", valueScale: { type: "linear", nice: true, round: false }, indexScale: { type: "band", round: false }, padding: 0.1, innerPadding: 0, enableGridX: false, enableGridY: true, enableLabel: true, label: "formattedValue", labelPosition: "middle", labelOffset: 0, labelSkipWidth: 0, labelSkipHeight: 0, labelTextColor: { theme: "labels.text.fill" }, colorBy: "id", colors: { scheme: "nivo" }, borderRadius: 0, borderWidth: 0, borderColor: { from: "color" }, isInteractive: true, tooltip: ne, tooltipLabel: function(e3) {
  return e3.id + " - " + e3.indexValue;
}, legends: [], initialHiddenIds: [], annotations: [], enableTotals: false, totalsOffset: 10 }, re = Q({}, le, { layers: ["grid", "axes", "bars", "totals", "markers", "legends", "annotations"], axisTop: null, axisRight: null, axisBottom: {}, axisLeft: {}, barComponent: ae, defs: [], fill: [], markers: [], animate: true, animateOnMount: false, motionConfig: "default", role: "img", isFocusable: false }), oe = Q({}, le, { layers: ["grid", "axes", "bars", "totals", "legends", "annotations"], axisTop: null, axisRight: null, axisBottom: {}, axisLeft: {}, renderBar: function(e3, t) {
  var a2 = t.bar, i2 = a2.color, n2 = a2.height, l = a2.width, r2 = a2.x, o$12 = a2.y, d$1 = t.borderColor, u = t.borderRadius, s = t.borderWidth, c = t.label, h = t.shouldRenderLabel, f = t.labelStyle, b2 = t.labelX, g2 = t.labelY, v2 = t.textAnchor;
  e3.fillStyle = i2, s > 0 && (e3.strokeStyle = d$1, e3.lineWidth = s), e3.beginPath(), o(e3, r2, o$12, l, n2, Math.min(u, n2)), e3.fill(), s > 0 && e3.stroke(), h && (e3.textBaseline = "middle", e3.textAlign = "middle" === v2 ? "center" : v2, d(e3, f, c, r2 + b2, o$12 + g2));
}, pixelRatio: "undefined" != typeof window && null != (Z = window.devicePixelRatio) ? Z : 1 }), de = function(e3, t, a2, i2, n2, l) {
  return pn(i2, { all: e3.map(t), min: 0, max: 0 }, n2, l).padding(a2);
}, ue = function(e3, t) {
  return e3.map((function(e4) {
    return Q({}, t.reduce((function(e6, t2) {
      return e6[t2] = null, e6;
    }), {}), e4);
  }));
}, se = function(e3) {
  return Object.keys(e3).reduce((function(t, a2) {
    return e3[a2] && (t[a2] = e3[a2]), t;
  }), {});
}, ce = function(e3) {
  return [e3, Number(e3)];
};
function he(e3, t, a2, i2) {
  return void 0 === e3 && (e3 = le.layout), void 0 === a2 && (a2 = le.labelPosition), void 0 === i2 && (i2 = le.labelOffset), function(n2, l) {
    var r2 = i2 * (t ? -1 : 1);
    if ("horizontal" === e3) {
      var o2 = n2 / 2;
      return "start" === a2 ? o2 = t ? n2 : 0 : "end" === a2 && (o2 = t ? 0 : n2), { labelX: o2 + r2, labelY: l / 2, textAnchor: "middle" === a2 ? "middle" : t ? "end" : "start" };
    }
    var d2 = l / 2;
    return "start" === a2 ? d2 = t ? 0 : l : "end" === a2 && (d2 = t ? l : 0), { labelX: n2 / 2, labelY: d2 - r2, textAnchor: "middle" };
  };
}
var fe = ["layout", "width", "height", "padding", "innerPadding", "valueScale", "indexScale", "hiddenIds"], be = function(e3, t) {
  return e3 > t;
}, ge = function(e3, t) {
  return e3 < t;
}, ve = function(e3, t) {
  return Array.from(" ".repeat(t - e3), (function(t2, a2) {
    return e3 + a2;
  }));
}, me = function(e3) {
  return be(e3, 0) ? 0 : e3;
}, pe = function(e3, t, a2, i2) {
  var n2 = e3.data, l = e3.formatValue, r2 = e3.getColor, o2 = e3.getIndex, d2 = e3.getTooltipLabel, u = e3.innerPadding, s = void 0 === u ? 0 : u, c = e3.keys, h = e3.xScale, f = e3.yScale, b2 = e3.margin, g2 = a2 ? ge : be, v2 = n2.map(se), m = [];
  return c.forEach((function(e4, a3) {
    return ve(0, h.domain().length).forEach((function(u2) {
      var c2, p2, y, x = ce(n2[u2][e4]), S2 = x[0], k2 = x[1], w2 = o2(n2[u2]), L2 = (null != (c2 = h(w2)) ? c2 : 0) + t * a3 + s * a3, C2 = g2(p2 = k2, 0) ? null != (y = f(p2)) ? y : 0 : i2, W2 = (function(e6, t2) {
        var a4;
        return g2(e6, 0) ? i2 - t2 : (null != (a4 = f(e6)) ? a4 : 0) - i2;
      })(k2, C2), M2 = { id: e4, value: null === S2 ? S2 : k2, formattedValue: l(k2), hidden: false, index: u2, indexValue: w2, data: v2[u2] };
      m.push({ key: e4 + "." + M2.indexValue, index: m.length, data: M2, x: L2, y: C2, absX: b2.left + L2, absY: b2.top + C2, width: t, height: W2, color: r2(M2), label: d2(M2) });
    }));
  })), m;
}, ye = function(e3, t, a2, i2) {
  var n2 = e3.data, l = e3.formatValue, r2 = e3.getIndex, o2 = e3.getColor, d2 = e3.getTooltipLabel, u = e3.keys, s = e3.innerPadding, c = void 0 === s ? 0 : s, h = e3.xScale, f = e3.yScale, b2 = e3.margin, g2 = a2 ? ge : be, v2 = n2.map(se), m = [];
  return u.forEach((function(e4, a3) {
    return ve(0, f.domain().length).forEach((function(u2) {
      var s2, p2, y, x = ce(n2[u2][e4]), S2 = x[0], k2 = x[1], w2 = r2(n2[u2]), L2 = g2(p2 = k2, 0) ? i2 : null != (y = h(p2)) ? y : 0, C2 = (null != (s2 = f(w2)) ? s2 : 0) + t * a3 + c * a3, W2 = (function(e6, t2) {
        var a4;
        return g2(e6, 0) ? (null != (a4 = h(e6)) ? a4 : 0) - i2 : i2 - t2;
      })(k2, L2), M2 = { id: e4, value: null === S2 ? S2 : k2, formattedValue: l(k2), hidden: false, index: u2, indexValue: w2, data: v2[u2] };
      m.push({ key: e4 + "." + M2.indexValue, index: m.length, data: M2, x: L2, y: C2, absX: b2.left + L2, absY: b2.top + C2, width: W2, height: t, color: o2(M2), label: d2(M2) });
    }));
  })), m;
}, xe = function(e3) {
  var t, a2, i2, n2 = e3.layout, l = e3.width, r2 = e3.height, o2 = e3.padding, d2 = void 0 === o2 ? 0 : o2, u = e3.innerPadding, s = void 0 === u ? 0 : u, c = e3.valueScale, h = e3.indexScale, f = e3.hiddenIds, b2 = void 0 === f ? [] : f, g2 = U(e3, fe), v2 = g2.keys.filter((function(e4) {
    return !b2.includes(e4);
  })), m = ue(g2.data, v2), p2 = "vertical" === n2 ? ["y", "x", l] : ["x", "y", r2], y = p2[0], x = p2[1], S2 = p2[2], k2 = de(m, g2.getIndex, d2, h, S2, x), w2 = "auto" === c.min ? me : function(e4) {
    return e4;
  }, L2 = m.reduce((function(e4, t2) {
    return [].concat(e4, v2.map((function(e6) {
      return t2[e6];
    })));
  }), []).filter(Boolean), C2 = w2(Math.min.apply(Math, L2)), W2 = (i2 = Math.max.apply(Math, L2), isFinite(i2) ? i2 : 0), M2 = pn(c, { all: L2, min: C2, max: W2 }, "x" === y ? l : r2, y), B2 = "vertical" === n2 ? [k2, M2] : [M2, k2], R2 = B2[0], O2 = B2[1], I2 = (k2.bandwidth() - s * (v2.length - 1)) / v2.length, V2 = [Q({}, g2, { data: m, keys: v2, innerPadding: s, xScale: R2, yScale: O2 }), I2, null != (t = c.reverse) && t, null != (a2 = M2(0)) ? a2 : 0];
  return { xScale: R2, yScale: O2, bars: I2 > 0 ? "vertical" === n2 ? pe.apply(void 0, V2) : ye.apply(void 0, V2) : [] };
}, Se = ["data", "layout", "width", "height", "padding", "valueScale", "indexScale", "hiddenIds"], ke = function(e3) {
  var t;
  return e3.some(Array.isArray) ? ke((t = []).concat.apply(t, e3)) : e3;
}, we = function(e3, t, a2) {
  var i2 = e3.formatValue, n2 = e3.getColor, l = e3.getIndex, r2 = e3.getTooltipLabel, o2 = e3.innerPadding, d2 = e3.stackedData, u = e3.xScale, s = e3.yScale, c = e3.margin, h = [];
  return d2.forEach((function(e4) {
    return u.domain().forEach((function(d3, f) {
      var b2, g2, v2 = e4[f], m = null != (b2 = u(l(v2.data))) ? b2 : 0, p2 = (null != (g2 = (function(e6) {
        return s(e6[a2 ? 0 : 1]);
      })(v2)) ? g2 : 0) + 0.5 * o2, y = (function(e6, t2) {
        var i3;
        return (null != (i3 = s(e6[a2 ? 1 : 0])) ? i3 : 0) - t2;
      })(v2, p2) - o2, x = ce(v2.data[e4.key]), S2 = x[0], k2 = x[1], w2 = { id: e4.key, value: null === S2 ? S2 : k2, formattedValue: i2(k2), hidden: false, index: f, indexValue: d3, data: se(v2.data) };
      h.push({ key: e4.key + "." + d3, index: h.length, data: w2, x: m, y: p2, absX: c.left + m, absY: c.top + p2, width: t, height: y, color: n2(w2), label: r2(w2) });
    }));
  })), h;
}, Le = function(e3, t, a2) {
  var i2 = e3.formatValue, n2 = e3.getColor, l = e3.getIndex, r2 = e3.getTooltipLabel, o2 = e3.innerPadding, d2 = e3.stackedData, u = e3.xScale, s = e3.yScale, c = e3.margin, h = [];
  return d2.forEach((function(e4) {
    return s.domain().forEach((function(d3, f) {
      var b2, g2, v2 = e4[f], m = null != (b2 = s(l(v2.data))) ? b2 : 0, p2 = (null != (g2 = (function(e6) {
        return u(e6[a2 ? 1 : 0]);
      })(v2)) ? g2 : 0) + 0.5 * o2, y = (function(e6, t2) {
        var i3;
        return (null != (i3 = u(e6[a2 ? 0 : 1])) ? i3 : 0) - t2;
      })(v2, p2) - o2, x = ce(v2.data[e4.key]), S2 = x[0], k2 = x[1], w2 = { id: e4.key, value: null === S2 ? S2 : k2, formattedValue: i2(k2), hidden: false, index: f, indexValue: d3, data: se(v2.data) };
      h.push({ key: e4.key + "." + d3, index: h.length, data: w2, x: p2, y: m, absX: c.left + p2, absY: c.top + m, width: y, height: t, color: n2(w2), label: r2(w2) });
    }));
  })), h;
}, Ce = function(e3) {
  var t, a2, i2 = e3.data, n2 = e3.layout, l = e3.width, r2 = e3.height, o2 = e3.padding, d2 = void 0 === o2 ? 0 : o2, u = e3.valueScale, s = e3.indexScale, c = e3.hiddenIds, h = void 0 === c ? [] : c, f = U(e3, Se), b2 = f.keys.filter((function(e4) {
    return !h.includes(e4);
  })), g2 = _$1().keys(b2).offset(q$2)(ue(i2, b2)), v2 = "vertical" === n2 ? ["y", "x", l] : ["x", "y", r2], m = v2[0], p2 = v2[1], y = v2[2], x = de(i2, f.getIndex, d2, s, y, p2), S2 = (a2 = ke(g2), "log" === u.type ? a2.filter((function(e4) {
    return 0 !== e4;
  })) : a2), k2 = Math.min.apply(Math, S2), w2 = Math.max.apply(Math, S2), L2 = pn(u, { all: S2, min: k2, max: w2 }, "x" === m ? l : r2, m), C2 = "vertical" === n2 ? [x, L2] : [L2, x], W2 = C2[0], M2 = C2[1], B2 = f.innerPadding > 0 ? f.innerPadding : 0, R2 = x.bandwidth(), O2 = [Q({}, f, { innerPadding: B2, stackedData: g2, xScale: W2, yScale: M2 }), R2, null != (t = u.reverse) && t];
  return { xScale: W2, yScale: M2, bars: R2 > 0 ? "vertical" === n2 ? we.apply(void 0, O2) : Le.apply(void 0, O2) : [] };
}, We = function(e3) {
  var t = e3.bars, a2 = e3.direction, i2 = e3.from, n2 = e3.groupMode, l = e3.layout, r2 = e3.legendLabel, o2 = e3.reverse, d2 = gn$1(null != r2 ? r2 : "indexes" === i2 ? "indexValue" : "id");
  return "indexes" === i2 ? (function(e4, t2, a3) {
    var i3 = J$2(e4.map((function(e6) {
      var t3, i4;
      return { id: null != (t3 = e6.data.indexValue) ? t3 : "", label: a3(e6.data), hidden: e6.data.hidden, color: null != (i4 = e6.color) ? i4 : "#000" };
    })), (function(e6) {
      return e6.id;
    }));
    return "horizontal" === t2 && i3.reverse(), i3;
  })(t, l, d2) : (function(e4, t2, a3, i3, n3, l2) {
    var r3 = J$2(e4.map((function(e6) {
      var t3;
      return { id: e6.data.id, label: l2(e6.data), hidden: e6.data.hidden, color: null != (t3 = e6.color) ? t3 : "#000" };
    })), (function(e6) {
      return e6.id;
    }));
    return ("vertical" === t2 && "stacked" === i3 && "column" === a3 && true !== n3 || "horizontal" === t2 && "stacked" === i3 && true === n3) && r3.reverse(), r3;
  })(t, l, a2, n2, o2, d2);
}, Me = function(e3, t, a2) {
  var i2 = e3.get(t) || 0;
  e3.set(t, i2 + a2);
}, Be = function(e3, t, a2) {
  var i2 = e3.get(t) || 0;
  e3.set(t, i2 + (a2 > 0 ? a2 : 0));
}, Re = function(e3, t, a2) {
  var i2 = e3.get(t) || 0;
  e3.set(t, Math.max(i2, Number(a2)));
}, Oe = function(e3, t) {
  var a2 = e3.get(t) || 0;
  e3.set(t, a2 + 1);
}, Ie = function(t) {
  var n2, l = t.indexBy, r2 = void 0 === l ? le.indexBy : l, o2 = t.keys, d2 = void 0 === o2 ? le.keys : o2, u = t.label, s = void 0 === u ? le.label : u, c = t.tooltipLabel, h = void 0 === c ? le.tooltipLabel : c, g2 = t.valueFormat, v2 = t.colors, m = void 0 === v2 ? le.colors : v2, p2 = t.colorBy, y = void 0 === p2 ? le.colorBy : p2, x = t.borderColor, S2 = void 0 === x ? le.borderColor : x, k2 = t.labelTextColor, w2 = void 0 === k2 ? le.labelTextColor : k2, L2 = t.groupMode, C2 = void 0 === L2 ? le.groupMode : L2, W2 = t.layout, M2 = void 0 === W2 ? le.layout : W2, B2 = t.data, R2 = t.margin, O2 = t.width, I2 = t.height, V2 = t.padding, T2 = void 0 === V2 ? le.padding : V2, H = t.innerPadding, P2 = void 0 === H ? le.innerPadding : H, E2 = t.valueScale, A2 = void 0 === E2 ? le.valueScale : E2, X2 = t.indexScale, Y2 = void 0 === X2 ? le.indexScale : X2, G = t.initialHiddenIds, N = void 0 === G ? le.initialHiddenIds : G, j2 = t.enableLabel, K = void 0 === j2 ? le.enableLabel : j2, _2 = t.labelSkipWidth, q2 = void 0 === _2 ? le.labelSkipWidth : _2, J2 = t.labelSkipHeight, U2 = void 0 === J2 ? le.labelSkipHeight : J2, Z2 = t.legends, $2 = void 0 === Z2 ? le.legends : Z2, ee2 = t.legendLabel, te2 = t.totalsOffset, ae2 = void 0 === te2 ? le.totalsOffset : te2, ie2 = reactExports.useState(null != N ? N : []), ne2 = ie2[0], re2 = ie2[1], oe2 = reactExports.useCallback((function(e3) {
    re2((function(t2) {
      return t2.indexOf(e3) > -1 ? t2.filter((function(t3) {
        return t3 !== e3;
      })) : [].concat(t2, [e3]);
    }));
  }), []), de2 = bn$1(r2), ue2 = bn$1(s), se2 = bn$1(h), ce2 = hn$1(g2), he2 = M$1(), fe2 = hr(m, y), be2 = Ye$1(S2, he2), ge2 = Ye$1(w2, he2), ve2 = ("grouped" === C2 ? xe : Ce)({ layout: M2, data: B2, getIndex: de2, keys: d2, width: O2, height: I2, getColor: fe2, padding: T2, innerPadding: P2, valueScale: A2, indexScale: Y2, hiddenIds: ne2, formatValue: ce2, getTooltipLabel: se2, margin: R2 }), me2 = ve2.bars, pe2 = ve2.xScale, ye2 = ve2.yScale, Se2 = reactExports.useMemo((function() {
    return me2.filter((function(e3) {
      return null !== e3.data.value;
    })).map((function(e3, t2) {
      return Q({}, e3, { index: t2 });
    }));
  }), [me2]), ke2 = reactExports.useCallback((function(e3) {
    var t2 = e3.width, a2 = e3.height;
    return !!K && (!(q2 > 0 && t2 < q2) && !(U2 > 0 && a2 < U2));
  }), [K, q2, U2]), we2 = reactExports.useMemo((function() {
    return d2.map((function(e3) {
      var t2 = me2.find((function(t3) {
        return t3.data.id === e3;
      }));
      return Q({}, t2, { data: Q({ id: e3 }, null == t2 ? void 0 : t2.data, { hidden: ne2.includes(e3) }) });
    }));
  }), [ne2, d2, me2]), Le2 = null != (n2 = A2.reverse) && n2, Ie2 = reactExports.useMemo((function() {
    return $2.map((function(e3) {
      return [e3, We({ bars: "keys" === e3.dataFrom ? we2 : me2, direction: e3.direction, from: e3.dataFrom, groupMode: C2, layout: M2, legendLabel: ee2, reverse: Le2 })];
    }));
  }), [$2, we2, me2, C2, M2, ee2, Le2]), Ve2 = reactExports.useMemo((function() {
    return (function(e3, t2, a2, i2, n3, l2, r3) {
      void 0 === i2 && (i2 = le.layout), void 0 === n3 && (n3 = le.groupMode);
      var o3 = [];
      if (0 === e3.length) return o3;
      var d3 = /* @__PURE__ */ new Map(), u2 = e3[0].width, s2 = e3[0].height;
      if ("stacked" === n3) {
        var c2 = /* @__PURE__ */ new Map();
        e3.forEach((function(e4) {
          var t3 = e4.data, a3 = t3.indexValue, i3 = t3.value;
          Me(d3, a3, Number(i3)), Be(c2, a3, Number(i3));
        })), c2.forEach((function(e4, n4) {
          var c3, h3, f2, b2 = d3.get(n4) || 0;
          "vertical" === i2 ? (c3 = t2(n4), h3 = a2(e4), f2 = a2(e4 / 2)) : (c3 = t2(e4), h3 = a2(n4), f2 = t2(e4 / 2)), c3 += "vertical" === i2 ? u2 / 2 : l2, h3 += "vertical" === i2 ? -l2 : s2 / 2, o3.push({ key: "total_" + n4, x: c3, y: h3, value: b2, formattedValue: r3(b2), animationOffset: f2 });
        }));
      } else if ("grouped" === n3) {
        var h2 = /* @__PURE__ */ new Map(), f = /* @__PURE__ */ new Map();
        e3.forEach((function(e4) {
          var t3 = e4.data, a3 = t3.indexValue, i3 = t3.value;
          Me(d3, a3, Number(i3)), Re(h2, a3, Number(i3)), Oe(f, a3);
        })), h2.forEach((function(e4, n4) {
          var c3, h3, b2, g3 = d3.get(n4) || 0, v3 = f.get(n4);
          "vertical" === i2 ? (c3 = t2(n4), h3 = a2(e4), b2 = a2(e4 / 2)) : (c3 = t2(e4), h3 = a2(n4), b2 = t2(e4 / 2)), c3 += "vertical" === i2 ? v3 * u2 / 2 : l2, h3 += "vertical" === i2 ? -l2 : v3 * s2 / 2, o3.push({ key: "total_" + n4, x: c3, y: h3, value: g3, formattedValue: r3(g3), animationOffset: b2 });
        }));
      }
      return o3;
    })(me2, pe2, ye2, M2, C2, ae2, ce2);
  }), [me2, pe2, ye2, M2, C2, ae2, ce2]);
  return { bars: me2, barsWithValue: Se2, xScale: pe2, yScale: ye2, getIndex: de2, getLabel: ue2, getTooltipLabel: se2, formatValue: ce2, getColor: fe2, getBorderColor: be2, getLabelColor: ge2, shouldRenderBarLabel: ke2, hiddenIds: ne2, toggleSerie: oe2, legendsWithData: Ie2, barTotals: Ve2 };
}, Ve = function(e3) {
  var t = e3.data, a2 = e3.springConfig, i2 = e3.animate, n2 = e3.layout, l = void 0 === n2 ? re.layout : n2, r2 = M$1();
  return useTransition(t, { keys: function(e4) {
    return e4.key;
  }, from: function(e4) {
    return { x: "vertical" === l ? e4.x : e4.animationOffset, y: "vertical" === l ? e4.animationOffset : e4.y, labelOpacity: 0 };
  }, enter: function(e4) {
    return { x: e4.x, y: e4.y, labelOpacity: 1 };
  }, update: function(e4) {
    return { x: e4.x, y: e4.y, labelOpacity: 1 };
  }, leave: function(e4) {
    return { x: "vertical" === l ? e4.x : e4.animationOffset, y: "vertical" === l ? e4.animationOffset : e4.y, labelOpacity: 0 };
  }, config: a2, immediate: !i2, initial: i2 ? void 0 : null })((function(e4, t2) {
    return jsxRuntimeExports.jsx(animated.text, { x: e4.x, y: e4.y, fillOpacity: e4.labelOpacity, style: Q({}, r2.labels.text, { pointerEvents: "none" }), fontWeight: "bold", fontSize: r2.labels.text.fontSize, fontFamily: r2.labels.text.fontFamily, textAnchor: "vertical" === l ? "middle" : "start", alignmentBaseline: "vertical" === l ? "alphabetic" : "middle", children: t2.formattedValue }, t2.key);
  }));
}, Te = ["isInteractive", "animate", "motionConfig", "theme", "renderWrapper"], He = function(a2) {
  var i2, n2 = a2.data, r2 = a2.indexBy, o2 = a2.keys, s = a2.margin, c = a2.width, h = a2.height, f = a2.groupMode, b2 = a2.layout, g2 = a2.valueScale, S2 = a2.indexScale, k2 = a2.padding, w2 = a2.innerPadding, L2 = a2.axisTop, C2 = a2.axisRight, W2 = a2.axisBottom, B2 = void 0 === W2 ? re.axisBottom : W2, R2 = a2.axisLeft, O2 = void 0 === R2 ? re.axisLeft : R2, I2 = a2.enableGridX, T2 = void 0 === I2 ? re.enableGridX : I2, H = a2.enableGridY, P2 = void 0 === H ? re.enableGridY : H, E2 = a2.gridXValues, F = a2.gridYValues, z2 = a2.layers, D2 = void 0 === z2 ? re.layers : z2, A2 = a2.barComponent, X2 = void 0 === A2 ? re.barComponent : A2, Y2 = a2.enableLabel, G = void 0 === Y2 ? re.enableLabel : Y2, N = a2.label, j2 = a2.labelSkipWidth, K = void 0 === j2 ? re.labelSkipWidth : j2, _2 = a2.labelSkipHeight, q2 = void 0 === _2 ? re.labelSkipHeight : _2, J2 = a2.labelTextColor, U2 = a2.labelPosition, Z2 = void 0 === U2 ? re.labelPosition : U2, te2 = a2.labelOffset, ae2 = void 0 === te2 ? re.labelOffset : te2, ie2 = a2.markers, ne2 = void 0 === ie2 ? re.markers : ie2, le2 = a2.colorBy, oe2 = a2.colors, de2 = a2.defs, ue2 = void 0 === de2 ? re.defs : de2, se2 = a2.fill, ce2 = void 0 === se2 ? re.fill : se2, fe2 = a2.borderRadius, be2 = void 0 === fe2 ? re.borderRadius : fe2, ge2 = a2.borderWidth, ve2 = void 0 === ge2 ? re.borderWidth : ge2, me2 = a2.borderColor, pe2 = a2.annotations, ye2 = void 0 === pe2 ? re.annotations : pe2, xe2 = a2.legendLabel, Se2 = a2.tooltipLabel, ke2 = a2.valueFormat, we2 = a2.isInteractive, Le2 = void 0 === we2 ? re.isInteractive : we2, Ce2 = a2.tooltip, We2 = void 0 === Ce2 ? re.tooltip : Ce2, Me2 = a2.onClick, Be2 = a2.onMouseEnter, Re2 = a2.onMouseLeave, Oe2 = a2.legends, Te2 = a2.role, He2 = void 0 === Te2 ? re.role : Te2, Pe2 = a2.ariaLabel, Ee2 = a2.ariaLabelledBy, Fe2 = a2.ariaDescribedBy, ze2 = a2.isFocusable, De2 = void 0 === ze2 ? re.isFocusable : ze2, Ae2 = a2.barAriaLabel, Xe2 = a2.barAriaLabelledBy, Ye2 = a2.barAriaDescribedBy, Ge = a2.barAriaHidden, Ne = a2.barAriaDisabled, je = a2.initialHiddenIds, Ke = a2.enableTotals, _e = void 0 === Ke ? re.enableTotals : Ke, qe = a2.totalsOffset, Je = void 0 === qe ? re.totalsOffset : qe, Qe = a2.forwardedRef, Ue = Dr(), Ze = Ue.animate, $e = Ue.config, et = cn$1(c, h, s), tt = et.outerWidth, at = et.outerHeight, it = et.margin, nt = et.innerWidth, lt = et.innerHeight, rt = Ie({ indexBy: r2, label: N, tooltipLabel: Se2, valueFormat: ke2, colors: oe2, colorBy: le2, borderColor: me2, labelTextColor: J2, groupMode: f, layout: b2, data: n2, keys: o2, margin: it, width: nt, height: lt, padding: k2, innerPadding: w2, valueScale: g2, indexScale: S2, enableLabel: G, labelSkipWidth: K, labelSkipHeight: q2, legends: Oe2, legendLabel: xe2, initialHiddenIds: je, totalsOffset: Je }), ot = rt.bars, dt = rt.barsWithValue, ut2 = rt.xScale, st = rt.yScale, ct2 = rt.getLabel, ht2 = rt.getTooltipLabel, ft2 = rt.getBorderColor, bt = rt.getLabelColor, gt2 = rt.shouldRenderBarLabel, vt = rt.toggleSerie, mt = rt.legendsWithData, pt = rt.barTotals, yt = rt.getColor, xt = he(b2, null != (i2 = null == g2 ? void 0 : g2.reverse) && i2, Z2, ae2), St = useTransition(dt, { keys: function(e3) {
    return e3.key;
  }, from: function(e3) {
    return Q({ borderColor: ft2(e3), color: e3.color, height: 0, labelColor: bt(e3), labelOpacity: 0 }, xt(e3.width, e3.height), { transform: "translate(" + e3.x + ", " + (e3.y + e3.height) + ")", width: e3.width }, "vertical" === b2 ? {} : { height: e3.height, transform: "translate(" + e3.x + ", " + e3.y + ")", width: 0 });
  }, enter: function(e3) {
    return Q({ borderColor: ft2(e3), color: e3.color, height: e3.height, labelColor: bt(e3), labelOpacity: 1 }, xt(e3.width, e3.height), { transform: "translate(" + e3.x + ", " + e3.y + ")", width: e3.width });
  }, update: function(e3) {
    return Q({ borderColor: ft2(e3), color: e3.color, height: e3.height, labelColor: bt(e3), labelOpacity: 1 }, xt(e3.width, e3.height), { transform: "translate(" + e3.x + ", " + e3.y + ")", width: e3.width });
  }, leave: function(e3) {
    return Q({ borderColor: ft2(e3), color: e3.color, height: 0, labelColor: bt(e3), labelOpacity: 0 }, xt(e3.width, e3.height), { labelY: 0, transform: "translate(" + e3.x + ", " + (e3.y + e3.height) + ")", width: e3.width }, "vertical" === b2 ? {} : Q({}, xt(e3.width, e3.height), { labelX: 0, height: e3.height, transform: "translate(" + e3.x + ", " + e3.y + ")", width: 0 }));
  }, config: $e, immediate: !Ze, initial: Ze ? void 0 : null }), kt = reactExports.useMemo((function() {
    return { borderRadius: be2, borderWidth: ve2, enableLabel: G, isInteractive: Le2, labelSkipWidth: K, labelSkipHeight: q2, onClick: Me2, onMouseEnter: Be2, onMouseLeave: Re2, getTooltipLabel: ht2, tooltip: We2, isFocusable: De2, ariaLabel: Ae2, ariaLabelledBy: Xe2, ariaDescribedBy: Ye2, ariaHidden: Ge, ariaDisabled: Ne };
  }), [be2, ve2, G, ht2, Le2, q2, K, Me2, Be2, Re2, We2, De2, Ae2, Xe2, Ye2, Ge, Ne]), wt = Mn$1(ue2, ot, ce2, { dataKey: "data", targetKey: "data.fill" }), Lt = { annotations: null, axes: null, bars: null, grid: null, legends: null, markers: null, totals: null };
  D2.includes("annotations") && (Lt.annotations = jsxRuntimeExports.jsx($, { bars: ot, annotations: ye2 }, "annotations")), D2.includes("axes") && (Lt.axes = jsxRuntimeExports.jsx(V, { xScale: ut2, yScale: st, width: nt, height: lt, top: L2, right: C2, bottom: B2, left: O2 }, "axes")), D2.includes("bars") && (Lt.bars = jsxRuntimeExports.jsx(reactExports.Fragment, { children: St((function(e3, a3) {
    return reactExports.createElement(X2, Q({}, kt, { bar: a3, style: e3, shouldRenderLabel: gt2(a3), label: ct2(a3.data) }));
  })) }, "bars")), D2.includes("grid") && (Lt.grid = jsxRuntimeExports.jsx(j$1, { width: nt, height: lt, xScale: T2 ? ut2 : null, yScale: P2 ? st : null, xValues: E2, yValues: F }, "grid")), D2.includes("legends") && (Lt.legends = jsxRuntimeExports.jsx(ee, { width: nt, height: lt, legends: mt, toggleSerie: vt }, "legends")), D2.includes("markers") && (Lt.markers = jsxRuntimeExports.jsx(Pt, { markers: ne2, width: nt, height: lt, xScale: ut2, yScale: st }, "markers")), D2.includes("totals") && _e && (Lt.totals = jsxRuntimeExports.jsx(Ve, { data: pt, springConfig: $e, animate: Ze, layout: b2 }, "totals"));
  var Ct = Q({}, kt, { margin: it, width: c, height: h, innerWidth: nt, innerHeight: lt, bars: ot, legendData: mt, enableLabel: G, xScale: ut2, yScale: st, tooltip: We2, getTooltipLabel: ht2, onClick: Me2, onMouseEnter: Be2, onMouseLeave: Re2, getColor: yt });
  return jsxRuntimeExports.jsx(Rt, { width: tt, height: at, margin: it, defs: wt, role: He2, ariaLabel: Pe2, ariaLabelledBy: Ee2, ariaDescribedBy: Fe2, isFocusable: De2, ref: Qe, children: D2.map((function(e3, a3) {
    var i3;
    return "function" == typeof e3 ? jsxRuntimeExports.jsx(reactExports.Fragment, { children: reactExports.createElement(e3, Ct) }, a3) : null != (i3 = null == Lt ? void 0 : Lt[e3]) ? i3 : null;
  })) });
}, Pe = reactExports.forwardRef((function(e3, t) {
  var a2 = e3.isInteractive, i2 = void 0 === a2 ? re.isInteractive : a2, n2 = e3.animate, l = void 0 === n2 ? re.animate : n2, r2 = e3.motionConfig, o2 = void 0 === r2 ? re.motionConfig : r2, d2 = e3.theme, u = e3.renderWrapper, s = U(e3, Te);
  return jsxRuntimeExports.jsx(Fr, { animate: l, isInteractive: i2, motionConfig: o2, renderWrapper: u, theme: d2, children: jsxRuntimeExports.jsx(He, Q({}, s, { isInteractive: i2, forwardedRef: t })) });
})), Ee = ["isInteractive", "renderWrapper", "theme"], Fe = function(e3, t, a2, i2) {
  return e3.find((function(e4) {
    return wn$1(e4.x + t.left, e4.y + t.top, e4.width, e4.height, a2, i2);
  }));
};
var ze = function(i2) {
  var n2, l = i2.data, d$1 = i2.indexBy, u = i2.keys, h = i2.margin, f = i2.width, g2 = i2.height, v2 = i2.groupMode, p2 = i2.layout, y = i2.valueScale, x = i2.indexScale, w2 = i2.padding, L2 = i2.innerPadding, C2 = i2.axisTop, W2 = i2.axisRight, M2 = i2.axisBottom, R2 = void 0 === M2 ? oe.axisBottom : M2, T2 = i2.axisLeft, H = void 0 === T2 ? oe.axisLeft : T2, P2 = i2.enableGridX, F = void 0 === P2 ? oe.enableGridX : P2, z2 = i2.enableGridY, X2 = void 0 === z2 ? oe.enableGridY : z2, Y2 = i2.gridXValues, j$12 = i2.gridYValues, K = i2.labelPosition, _2 = void 0 === K ? oe.labelPosition : K, q2 = i2.labelOffset, J$12 = void 0 === q2 ? oe.labelOffset : q2, U2 = i2.layers, Z2 = void 0 === U2 ? oe.layers : U2, $2 = i2.renderBar, ee2 = void 0 === $2 ? oe.renderBar : $2, te2 = i2.enableLabel, ae2 = void 0 === te2 ? oe.enableLabel : te2, ie2 = i2.label, ne2 = i2.labelSkipWidth, le2 = void 0 === ne2 ? oe.labelSkipWidth : ne2, re2 = i2.labelSkipHeight, de2 = void 0 === re2 ? oe.labelSkipHeight : re2, ue2 = i2.labelTextColor, se2 = i2.colorBy, ce2 = i2.colors, fe2 = i2.borderRadius, be2 = void 0 === fe2 ? oe.borderRadius : fe2, ge2 = i2.borderWidth, ve2 = void 0 === ge2 ? oe.borderWidth : ge2, me2 = i2.borderColor, pe2 = i2.annotations, ye2 = void 0 === pe2 ? oe.annotations : pe2, xe2 = i2.legendLabel, Se2 = i2.tooltipLabel, ke2 = i2.valueFormat, we2 = i2.isInteractive, Le2 = void 0 === we2 ? oe.isInteractive : we2, Ce2 = i2.tooltip, We2 = void 0 === Ce2 ? oe.tooltip : Ce2, Me2 = i2.onClick, Be2 = i2.onMouseEnter, Re2 = i2.onMouseLeave, Oe2 = i2.legends, Ve2 = i2.pixelRatio, Te2 = void 0 === Ve2 ? oe.pixelRatio : Ve2, He2 = i2.role, Pe2 = i2.forwardedRef, Ee2 = i2.enableTotals, ze2 = void 0 === Ee2 ? oe.enableTotals : Ee2, De2 = i2.totalsOffset, Ae2 = void 0 === De2 ? oe.totalsOffset : De2, Xe2 = reactExports.useRef(null), Ye2 = M$1(), Ge = cn$1(f, g2, h), Ne = Ge.margin, je = Ge.innerWidth, Ke = Ge.innerHeight, _e = Ge.outerWidth, qe = Ge.outerHeight, Je = Ie({ indexBy: d$1, label: ie2, tooltipLabel: Se2, valueFormat: ke2, colors: ce2, colorBy: se2, borderColor: me2, labelTextColor: ue2, groupMode: v2, layout: p2, data: l, keys: u, margin: Ne, width: je, height: Ke, padding: w2, innerPadding: L2, valueScale: y, indexScale: x, enableLabel: ae2, labelSkipWidth: le2, labelSkipHeight: de2, legends: Oe2, legendLabel: xe2, totalsOffset: Ae2 }), Qe = Je.bars, Ue = Je.barsWithValue, Ze = Je.xScale, $e = Je.yScale, et = Je.getLabel, tt = Je.getTooltipLabel, at = Je.getBorderColor, it = Je.getLabelColor, nt = Je.shouldRenderBarLabel, lt = Je.legendsWithData, rt = Je.barTotals, ot = Je.getColor, dt = z$2(), ut2 = dt.showTooltipFromEvent, st = dt.hideTooltip, ct2 = j({ annotations: O({ data: Qe, annotations: ye2, getPosition: function(e3) {
    return { x: e3.x, y: e3.y };
  }, getDimensions: function(e3) {
    var t = e3.width, a2 = e3.height;
    return { width: t, height: a2, size: Math.max(t, a2) };
  } }) }), ht2 = reactExports.useMemo((function() {
    return { borderRadius: be2, borderWidth: ve2, isInteractive: Le2, isFocusable: false, labelSkipWidth: le2, labelSkipHeight: de2, margin: Ne, width: f, height: g2, innerWidth: je, innerHeight: Ke, bars: Qe, legendData: lt, enableLabel: ae2, xScale: Ze, yScale: $e, tooltip: We2, getTooltipLabel: tt, onClick: Me2, onMouseEnter: Be2, onMouseLeave: Re2, getColor: ot };
  }), [be2, ve2, Le2, le2, de2, Ne, f, g2, je, Ke, Qe, lt, ae2, Ze, $e, We2, tt, Me2, Be2, Re2, ot]), ft2 = hn$1(ke2), bt = he(p2, null != (n2 = null == y ? void 0 : y.reverse) && n2, _2, J$12);
  reactExports.useEffect((function() {
    if (Xe2.current) {
      Xe2.current.width = _e * Te2, Xe2.current.height = qe * Te2;
      var e3 = Xe2.current.getContext("2d");
      e3.scale(Te2, Te2), e3.fillStyle = Ye2.background, e3.fillRect(0, 0, _e, qe), e3.translate(Ne.left, Ne.top), Z2.forEach((function(t) {
        "grid" === t ? "number" == typeof Ye2.grid.line.strokeWidth && Ye2.grid.line.strokeWidth > 0 && (e3.lineWidth = Ye2.grid.line.strokeWidth, e3.strokeStyle = Ye2.grid.line.stroke, F && q$1(e3, { width: je, height: Ke, scale: Ze, axis: "x", values: Y2 }), X2 && q$1(e3, { width: je, height: Ke, scale: $e, axis: "y", values: j$12 })) : "axes" === t ? W$1(e3, { xScale: Ze, yScale: $e, width: je, height: Ke, top: C2, right: W2, bottom: R2, left: H, theme: Ye2 }) : "bars" === t ? (a$1(e3, Ye2.text), Ue.forEach((function(t2) {
          ee2(e3, Q({ bar: t2, borderColor: at(t2), borderRadius: be2, borderWidth: ve2, label: et(t2.data), shouldRenderLabel: nt(t2), labelStyle: Q({}, Ye2.labels.text, { fill: it(t2) }) }, bt(t2.width, t2.height)));
        }))) : "legends" === t ? lt.forEach((function(t2) {
          var a2 = t2[0], i3 = t2[1];
          L$2(e3, Q({}, a2, { data: i3, containerWidth: je, containerHeight: Ke, theme: Ye2 }));
        })) : "annotations" === t ? J(e3, { annotations: ct2, theme: Ye2 }) : "totals" === t && ze2 ? (function(e4, t2, a2, i3) {
          void 0 === i3 && (i3 = oe.layout), a$1(e4, a2.labels.text), e4.textBaseline = "vertical" === i3 ? "alphabetic" : "middle", e4.textAlign = "vertical" === i3 ? "center" : "start", t2.forEach((function(t3) {
            d(e4, a2.labels.text, t3.formattedValue, t3.x, t3.y);
          }));
        })(e3, rt, Ye2, p2) : "function" == typeof t && t(e3, ht2);
      })), e3.save();
    }
  }), [R2, H, W2, C2, Ue, be2, ve2, ct2, F, X2, at, et, it, Y2, j$12, v2, g2, Ke, je, ht2, Z2, p2, lt, Ne.left, Ne.top, qe, _e, Te2, ee2, Ze, $e, nt, Ye2, f, rt, ze2, ft2, bt]);
  var gt2 = reactExports.useCallback((function(e3) {
    if (Qe && Xe2.current) {
      var a2 = kn$1(Xe2.current, e3), i3 = a2[0], n3 = a2[1], l2 = Fe(Qe, Ne, i3, n3);
      void 0 !== l2 ? (ut2(reactExports.createElement(We2, Q({}, l2.data, { color: l2.color, label: l2.label, value: Number(l2.data.value) })), e3), "mouseenter" === e3.type && (null == Be2 || Be2(l2.data, e3))) : st();
    }
  }), [st, Ne, Be2, Qe, ut2, We2]), vt = reactExports.useCallback((function(e3) {
    if (Qe && Xe2.current) {
      st();
      var t = kn$1(Xe2.current, e3), a2 = t[0], i3 = t[1], n3 = Fe(Qe, Ne, a2, i3);
      n3 && (null == Re2 || Re2(n3.data, e3));
    }
  }), [st, Ne, Re2, Qe]), mt = reactExports.useCallback((function(e3) {
    if (Qe && Xe2.current) {
      var t = kn$1(Xe2.current, e3), a2 = t[0], i3 = t[1], n3 = Fe(Qe, Ne, a2, i3);
      void 0 !== n3 && (null == Me2 || Me2(Q({}, n3.data, { color: n3.color }), e3));
    }
  }), [Ne, Me2, Qe]);
  return jsxRuntimeExports.jsx("canvas", { ref: Rn(Xe2, Pe2), width: _e * Te2, height: qe * Te2, style: { width: _e, height: qe, cursor: Le2 ? "auto" : "normal" }, onMouseEnter: Le2 ? gt2 : void 0, onMouseMove: Le2 ? gt2 : void 0, onMouseLeave: Le2 ? vt : void 0, onClick: Le2 ? mt : void 0, role: He2 });
}, De = reactExports.forwardRef((function(e3, t) {
  var a2 = e3.isInteractive, i2 = e3.renderWrapper, n2 = e3.theme, l = U(e3, Ee);
  return jsxRuntimeExports.jsx(Fr, { isInteractive: a2, renderWrapper: i2, theme: n2, animate: false, children: jsxRuntimeExports.jsx(ze, Q({}, l, { isInteractive: a2, forwardedRef: t })) });
})), Ae = ["defaultWidth", "defaultHeight", "onResize", "debounceResize"], Xe = reactExports.forwardRef((function(e3, t) {
  var a2 = e3.defaultWidth, i2 = e3.defaultHeight, n2 = e3.onResize, l = e3.debounceResize, r2 = U(e3, Ae);
  return jsxRuntimeExports.jsx($r, { defaultWidth: a2, defaultHeight: i2, onResize: n2, debounceResize: l, children: function(e4) {
    var a3 = e4.width, i3 = e4.height;
    return jsxRuntimeExports.jsx(Pe, Q({}, r2, { width: a3, height: i3, ref: t }));
  } });
})), Ye = ["defaultWidth", "defaultHeight", "onResize", "debounceResize"];
reactExports.forwardRef((function(e3, t) {
  var a2 = e3.defaultWidth, i2 = e3.defaultHeight, n2 = e3.onResize, l = e3.debounceResize, r2 = U(e3, Ye);
  return jsxRuntimeExports.jsx($r, { defaultWidth: a2, defaultHeight: i2, onResize: n2, debounceResize: l, children: function(e4) {
    var a3 = e4.width, i3 = e4.height;
    return jsxRuntimeExports.jsx(De, Q({}, r2, { width: a3, height: i3, ref: t }));
  } });
}));
export {
  V,
  W$1 as W,
  Xe as X,
  Y,
  getCaseStatusByInboxFn as a,
  getCaseAnalyticsFn as b,
  getCustomFiltersConfigFn as c,
  getAvailableFiltersFn as d,
  getDecisionOutcomesPerDayFn as e,
  getDecisionsScoreDistributionFn as f,
  getCaseStatusByDateFn as g,
  hn as h,
  getRuleHitTableFn as i,
  j$1 as j,
  getRuleVsDecisionOutcomeFn as k,
  linear as l,
  getScreeningHitsTableFn as m,
  q$1 as q
};
