import { c as createServerRpc } from "./createServerRpc-O8YXUCWH.js";
import { s as servicesMiddleware, a3 as getLocale, a4 as commitCsrfToken, a5 as getToast, a6 as makeI18nextServerInstance, a7 as getClientEnvVars, g as getServerEnv } from "./services-middleware-DR8Hua1Y.js";
import { r as registerSSRInstance } from "./i18n-instance-store-UssbGYOM.js";
import { g as getPreferencesCookie } from "./preferences-cookie-read.server-uzB5Nz-e.js";
import { g as getRequestNonce, s as setContentSecurityPolicy } from "./security-headers.server-BdP3HrPp.js";
import { _ as createServerFn, a4 as getRequest } from "../server.js";
import "./short-uuid-MIi3jWzx.js";
import "node:crypto";
import "./config-ut8rAdyo.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
var lib = {};
var keys_1;
var hasRequiredKeys;
function requireKeys() {
  if (hasRequiredKeys) return keys_1;
  hasRequiredKeys = 1;
  var hop = Object.prototype.hasOwnProperty;
  var strCharAt = String.prototype.charAt;
  var toStr = Object.prototype.toString;
  var charAt = function(str, index) {
    return strCharAt.call(str, index);
  };
  var has = function has2(context, prop) {
    return hop.call(context, prop);
  };
  var isString = function isString2(val) {
    return toStr.call(val) === "[object String]";
  };
  var isArrayLike = function isArrayLike2(val) {
    return val != null && (typeof val !== "function" && typeof val.length === "number");
  };
  var indexKeys = function indexKeys2(target, pred) {
    pred = pred || has;
    var results = [];
    for (var i = 0, len = target.length; i < len; i += 1) {
      if (pred(target, i)) {
        results.push(String(i));
      }
    }
    return results;
  };
  var objectKeys = function objectKeys2(target, pred) {
    pred = pred || has;
    var results = [];
    for (var key in target) {
      if (pred(target, key)) {
        results.push(String(key));
      }
    }
    return results;
  };
  var keys = function keys2(source) {
    if (source == null) {
      return [];
    }
    if (isString(source)) {
      return indexKeys(source, charAt);
    }
    if (isArrayLike(source)) {
      return indexKeys(source, has);
    }
    return objectKeys(source);
  };
  keys_1 = keys;
  return keys_1;
}
var each_1;
var hasRequiredEach;
function requireEach() {
  if (hasRequiredEach) return each_1;
  hasRequiredEach = 1;
  var keys = requireKeys();
  var objToString = Object.prototype.toString;
  var isNumber = function isNumber2(val) {
    var type = typeof val;
    return type === "number" || type === "object" && objToString.call(val) === "[object Number]";
  };
  var isArray = typeof Array.isArray === "function" ? Array.isArray : function isArray2(val) {
    return objToString.call(val) === "[object Array]";
  };
  var isArrayLike = function isArrayLike2(val) {
    return val != null && (isArray(val) || val !== "function" && isNumber(val.length));
  };
  var arrayEach = function arrayEach2(iterator, array) {
    for (var i = 0; i < array.length; i += 1) {
      if (iterator(array[i], i, array) === false) {
        break;
      }
    }
  };
  var baseEach = function baseEach2(iterator, object) {
    var ks = keys(object);
    for (var i = 0; i < ks.length; i += 1) {
      if (iterator(object[ks[i]], ks[i], object) === false) {
        break;
      }
    }
  };
  var each = function each2(iterator, collection) {
    return (isArrayLike(collection) ? arrayEach : baseEach).call(this, iterator, collection);
  };
  each_1 = each;
  return each_1;
}
var map_1;
var hasRequiredMap;
function requireMap() {
  if (hasRequiredMap) return map_1;
  hasRequiredMap = 1;
  var each = requireEach();
  var map = function map2(iterator, collection) {
    if (typeof iterator !== "function") {
      throw new TypeError("Expected a function but received a " + typeof iterator);
    }
    var result = [];
    each(function(val, i, collection2) {
      result.push(iterator(val, i, collection2));
    }, collection);
    return result;
  };
  map_1 = map;
  return map_1;
}
var max_template;
var hasRequiredMax_template;
function requireMax_template() {
  if (hasRequiredMax_template) return max_template;
  hasRequiredMax_template = 1;
  max_template = function(settings) {
    var __t, __p = "";
    __p += '(function() {\n  // define the key where the global analytics object will be accessible\n  // customers can safely set this to be something else if need be\n  var globalAnalyticsKey = "' + ((__t = settings.globalAnalyticsKey) == null ? "" : __t) + `"

  // Create a queue, but don't obliterate an existing one!
  var analytics = window[globalAnalyticsKey] = window[globalAnalyticsKey] || [];

  // If the real analytics.js is already on the page return.
  if (analytics.initialize) return;

  // If the snippet was invoked already show an error.
  if (analytics.invoked) {
    if (window.console && console.error) {
      console.error("Segment snippet included twice.");
    }
    return;
  }

  // Invoked flag, to make sure the snippet
  // is never invoked twice.
  analytics.invoked = true;

  // A list of the methods in Analytics.js to stub.
  analytics.methods = [
    "trackSubmit",
    "trackClick",
    "trackLink",
    "trackForm",
    "pageview",
    "identify",
    "reset",
    "group",
    "track",
    "ready",
    "alias",
    "debug",
    "page",
    "screen",
    "once",
    "off",
    "on",
    "addSourceMiddleware",
    "addIntegrationMiddleware",
    "setAnonymousId",
    "addDestinationMiddleware",
    "register"
  ];

  // Define a factory to create stubs. These are placeholders
  // for methods in Analytics.js so that you never have to wait
  // for it to load to actually record data. The \`method\` is
  // stored as the first argument, so we can replay the data.
  analytics.factory = function(e) {
    return function() {
      if (window[globalAnalyticsKey].initialized) {
        // Sometimes users assigned analytics to a variable before analytics is done loading, resulting in a stale reference.
        // If so, proxy any calls to the 'real' analytics instance.
        return window[globalAnalyticsKey][e].apply(window[globalAnalyticsKey], arguments);
      }
      var args = Array.prototype.slice.call(arguments);
      
      // Add buffered page context object so page information is always up-to-date
      if (["track", "screen", "alias", "group", "page", "identify"].indexOf(e) > -1) {
        var c = document.querySelector("link[rel='canonical']");
        args.push({
          __t: "bpc",
          c: c && c.getAttribute("href") || undefined,
          p: location.pathname,
          u: location.href,
          s: location.search,
          t: document.title,
          r: document.referrer
        });
      }

      args.unshift(e);
      analytics.push(args);
      return analytics;
    };
  };


  // For each of our methods, generate a queueing stub.
  for (var i = 0; i < analytics.methods.length; i++) {
    var key = analytics.methods[i];
    analytics[key] = analytics.factory(key);
  }

  // Define a method to load Analytics.js from our CDN,
  // and that will be sure to only ever load it once.
  analytics.load = function(key, options) {
    // Create an async script element based on your key.
    var t = document.createElement("script");
    t.type = "text/javascript";
    t.async = true;
    t.setAttribute("data-global-segment-analytics-key", globalAnalyticsKey)
    t.src = "https://` + ((__t = settings.host) == null ? "" : __t) + ((__t = settings.ajsPath) == null ? "" : __t) + '";\n\n    // Insert our script next to the first script element.\n    var first = document.getElementsByTagName("script")[0];\n    first.parentNode.insertBefore(t, first);\n    analytics._loadOptions = options;\n  };\n  analytics._writeKey = "' + ((__t = settings.apiKey) == null ? "" : __t) + '";\n\n  ' + ((__t = settings.optionalCDN) == null ? "" : __t) + `

  // Add a version to keep track of what's in the wild.
  analytics.SNIPPET_VERSION = "5.2.0";

  // Load Analytics.js with your key, which will automatically
  // load the tools you've enabled for your account. Boosh!
  ` + ((__t = settings.load) == null ? "" : __t) + "\n\n  // Make the first page call to load the integrations. If\n  // you'd like to manually name or tag the page, edit or\n  // move this call however you'd like.\n  " + ((__t = settings.page) == null ? "" : __t) + "\n})();";
    return __p;
  };
  return max_template;
}
var min_template;
var hasRequiredMin_template;
function requireMin_template() {
  if (hasRequiredMin_template) return min_template;
  hasRequiredMin_template = 1;
  min_template = function(settings) {
    var __t, __p = "";
    __p += '!function(){var i="' + ((__t = settings.globalAnalyticsKey) == null ? "" : __t) + `",analytics=window[i]=window[i]||[];if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error("Segment snippet included twice.");else{analytics.invoked=!0;analytics.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","reset","group","track","ready","alias","debug","page","screen","once","off","on","addSourceMiddleware","addIntegrationMiddleware","setAnonymousId","addDestinationMiddleware","register"];analytics.factory=function(e){return function(){if(window[i].initialized)return window[i][e].apply(window[i],arguments);var n=Array.prototype.slice.call(arguments);if(["track","screen","alias","group","page","identify"].indexOf(e)>-1){var c=document.querySelector("link[rel='canonical']");n.push({__t:"bpc",c:c&&c.getAttribute("href")||void 0,p:location.pathname,u:location.href,s:location.search,t:document.title,r:document.referrer})}n.unshift(e);analytics.push(n);return analytics}};for(var n=0;n<analytics.methods.length;n++){var key=analytics.methods[n];analytics[key]=analytics.factory(key)}analytics.load=function(key,n){var t=document.createElement("script");t.type="text/javascript";t.async=!0;t.setAttribute("data-global-segment-analytics-key",i);t.src="https://` + ((__t = settings.host) == null ? "" : __t) + ((__t = settings.ajsPath) == null ? "" : __t) + '";var r=document.getElementsByTagName("script")[0];r.parentNode.insertBefore(t,r);analytics._loadOptions=n};analytics._writeKey="' + ((__t = settings.apiKey) == null ? "" : __t) + '";' + ((__t = settings.optionalCDN) == null ? "" : __t) + ';analytics.SNIPPET_VERSION="5.2.0";\n' + ((__t = settings.load) == null ? "" : __t) + "\n" + ((__t = settings.page) == null ? "" : __t) + "\n}}();";
    return __p;
  };
  return min_template;
}
var hasRequiredLib;
function requireLib() {
  if (hasRequiredLib) return lib;
  hasRequiredLib = 1;
  var map = requireMap();
  var maxTemplate = requireMax_template();
  var minTemplate = requireMin_template();
  var has = Object.prototype.hasOwnProperty;
  lib.max = function(options) {
    var settings = defaults(options);
    settings.load = renderLoad(settings);
    settings.page = renderPage(settings.page);
    settings.optionalCDN = renderOptionalCDNHost(settings);
    return maxTemplate(settings);
  };
  lib.min = function(options) {
    var settings = defaults(options);
    settings.load = renderLoad(settings);
    settings.page = renderPage(settings.page);
    settings.optionalCDN = renderOptionalCDNHost(settings);
    return minTemplate(settings);
  };
  function defaults(options) {
    options || (options = {});
    options.globalAnalyticsKey || (options.globalAnalyticsKey = "analytics");
    options.apiKey || (options.apiKey = "YOUR_API_KEY");
    options.host || (options.host = "cdn.segment.com");
    options.ajsPath || (options.ajsPath = '/analytics.js/v1/" + key + "/analytics.min.js');
    options.useHostForBundles || (options.useHostForBundles = false);
    if (!has.call(options, "page")) options.page = true;
    if (!has.call(options, "load")) options.load = true;
    return options;
  }
  function renderPage(page) {
    if (!page) return "";
    var args = [];
    if (page.category) args.push(page.category);
    if (page.name) args.push(page.name);
    if (page.properties) args.push(page.properties);
    var res = "analytics.page(" + map(JSON.stringify, args).join(", ") + ");";
    return res;
  }
  function renderLoad(settings) {
    if (!settings.load) return "";
    if (typeof settings.load !== "boolean") {
      var loadOptions = JSON.stringify(settings.load);
      return 'analytics.load("' + settings.apiKey + '", ' + loadOptions + ");";
    }
    return 'analytics.load("' + settings.apiKey + '");';
  }
  function renderOptionalCDNHost(settings) {
    if (!settings) return "";
    if (typeof settings.useHostForBundles === "boolean" && settings.useHostForBundles) {
      return 'analytics._cdn = "https://' + settings.host + '"';
    }
    return "";
  }
  return lib;
}
var libExports = requireLib();
function getSegmentScript(apiKey) {
  return libExports.min({
    apiKey,
    // TODO(GDPR): uncomment to lazy load segment after GDPR consent
    // Ressource to implement in house cookie consent banner: https://github.com/remix-run/examples/tree/main/gdpe-cookie-consent
    // load: false,
    // page tracking is done manually
    page: false
  });
}
const SPLIT_LOWER_UPPER_RE = new RegExp("([\\p{Ll}\\d])(\\p{Lu})", "gu");
const SPLIT_UPPER_UPPER_RE = new RegExp("(\\p{Lu})([\\p{Lu}][\\p{Ll}])", "gu");
const SPLIT_SEPARATE_NUMBER_RE = new RegExp("(\\d)\\p{Ll}|(\\p{L})\\d", "u");
const DEFAULT_STRIP_REGEXP = /[^\p{L}\d]+/giu;
const SPLIT_REPLACE_VALUE = "$1\0$2";
const DEFAULT_PREFIX_SUFFIX_CHARACTERS = "";
function split(value) {
  let result = value.trim();
  result = result.replace(SPLIT_LOWER_UPPER_RE, SPLIT_REPLACE_VALUE).replace(SPLIT_UPPER_UPPER_RE, SPLIT_REPLACE_VALUE);
  result = result.replace(DEFAULT_STRIP_REGEXP, "\0");
  let start = 0;
  let end = result.length;
  while (result.charAt(start) === "\0")
    start++;
  if (start === end)
    return [];
  while (result.charAt(end - 1) === "\0")
    end--;
  return result.slice(start, end).split(/\0/g);
}
function splitSeparateNumbers(value) {
  const words = split(value);
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const match = SPLIT_SEPARATE_NUMBER_RE.exec(word);
    if (match) {
      const offset = match.index + (match[1] ?? match[2]).length;
      words.splice(i, 1, word.slice(0, offset), word.slice(offset));
    }
  }
  return words;
}
function noCase(input, options) {
  const [prefix, words, suffix] = splitPrefixSuffix(input, options);
  return prefix + words.map(lowerFactory(options?.locale)).join(options?.delimiter ?? " ") + suffix;
}
function kebabCase(input, options) {
  return noCase(input, { delimiter: "-", ...options });
}
function lowerFactory(locale) {
  return locale === false ? (input) => input.toLowerCase() : (input) => input.toLocaleLowerCase(locale);
}
function splitPrefixSuffix(input, options = {}) {
  const splitFn = options.split ?? (options.separateNumbers ? splitSeparateNumbers : split);
  const prefixCharacters = options.prefixCharacters ?? DEFAULT_PREFIX_SUFFIX_CHARACTERS;
  const suffixCharacters = options.suffixCharacters ?? DEFAULT_PREFIX_SUFFIX_CHARACTERS;
  let prefixIndex = 0;
  let suffixIndex = input.length;
  while (prefixIndex < input.length) {
    const char = input.charAt(prefixIndex);
    if (!prefixCharacters.includes(char))
      break;
    prefixIndex++;
  }
  while (suffixIndex > prefixIndex) {
    const index = suffixIndex - 1;
    const char = input.charAt(index);
    if (!suffixCharacters.includes(char))
      break;
    suffixIndex = index;
  }
  return [
    input.slice(0, prefixIndex),
    splitFn(input.slice(prefixIndex, suffixIndex)),
    input.slice(suffixIndex)
  ];
}
function isQuoted(value) {
  return /^".*"$/.test(value);
}
let reservedCSPKeywords = /* @__PURE__ */ new Set([
  "self",
  "none",
  "unsafe-inline",
  "unsafe-eval"
]);
function createContentSecurityPolicy(settings) {
  let { "upgrade-insecure-requests": upgradeInsecureRequests, ...rest } = Object.entries(settings).reduce((acc, [key, value]) => {
    let kebab = kebabCase(key);
    if (acc[kebab]) throw new Error(`[createContentSecurityPolicy]: The key "${key}" was specified in camelCase and kebab-case.`);
    acc[kebab] = value;
    return acc;
  }, {});
  let policy = [];
  if (upgradeInsecureRequests) policy.push("upgrade-insecure-requests");
  for (let [key, values] of Object.entries(rest)) {
    let allowedValuesSeen = /* @__PURE__ */ new Set();
    if (!Array.isArray(values)) throw new Error(`[createContentSecurityPolicy]: The value of the "${key}" must be array of strings.`);
    let definedValues = values.filter((v) => typeof v !== "undefined");
    definedValues.forEach((allowedValue) => {
      if (typeof allowedValue !== "string") throw new Error(`[createContentSecurityPolicy]: The value of the "${key}" contains a non-string, which is not supported.`);
      if (allowedValuesSeen.has(allowedValue)) throw new Error(`[createContentSecurityPolicy]: The value of the "${key}" contains duplicates, which it shouldn't.`);
      if (reservedCSPKeywords.has(allowedValue) && !isQuoted(allowedValue)) throw new Error(`[createContentSecurityPolicy]: reserved keyword ${allowedValue} must be quoted.`);
      allowedValuesSeen.add(allowedValue);
    });
    if (definedValues.length === 0) throw new Error(`[createContentSecurityPolicy]: key "${key}" has no defined options`);
    policy.push(`${key} ${definedValues.join(" ")}`);
  }
  return policy.join("; ");
}
const getRootLoaderDataFn_createServerFn_handler = createServerRpc({
  id: "2434b75a233407e6a0f02cb1d65aff801cf21dbf917ed2a61d873f754edc5c16",
  name: "getRootLoaderDataFn",
  filename: "src/server-fns/root.ts"
}, (opts) => getRootLoaderDataFn.__executeServer(opts));
const getRootLoaderDataFn = createServerFn({
  method: "GET"
}).middleware([servicesMiddleware]).handler(getRootLoaderDataFn_createServerFn_handler, async ({
  context
}) => {
  const request = getRequest();
  const appConfig = context.appConfig;
  const [locale, csrfToken, toastMessage] = await Promise.all([getLocale(request), commitCsrfToken(request), getToast()]);
  const i18nInstance = makeI18nextServerInstance(locale);
  registerSSRInstance(locale, i18nInstance);
  const timezone = getPreferencesCookie(request, "timezone") ?? "UTC";
  const theme = getPreferencesCookie(request, "theme") ?? "light";
  const ENV = getClientEnvVars();
  const segmentApiKey = getServerEnv("SEGMENT_WRITE_KEY");
  const disableSegment = getServerEnv("DISABLE_SEGMENT") ?? false;
  const segmentScript = !disableSegment && segmentApiKey ? getSegmentScript(segmentApiKey) : void 0;
  const nonce = getRequestNonce() ?? crypto.randomUUID().replace(/-/g, "");
  const firebaseUrl = appConfig.auth.firebase.isEmulator ? [appConfig.auth.firebase.emulatorUrl] : ["https://identitytoolkit.googleapis.com", "https://securetoken.googleapis.com"];
  const externalDomains = ["cdn.segment.com", "api.segment.io", "*.sentry.io", "*.maplibre.org", "*.cartocdn.com"];
  const frames = [];
  const metabaseUrl = ENV.METABASE_URL ?? appConfig.urls.metabase;
  const fbAuthDomain = appConfig.auth.firebase.authDomain;
  if (metabaseUrl) frames.push(metabaseUrl);
  if (fbAuthDomain) frames.push(fbAuthDomain);
  const imgSrc = ["'self'", "data:"];
  if (ENV.CUSTOM_LOGO_URL) {
    try {
      imgSrc.push(new URL(ENV.CUSTOM_LOGO_URL).origin);
    } catch {
    }
  }
  for (const blobDomain of appConfig.urls.blobs) {
    imgSrc.push(blobDomain);
  }
  const csp = createContentSecurityPolicy({
    baseUri: ["'none'"],
    defaultSrc: ["'self'"],
    frameAncestors: ["'none'"],
    objectSrc: ["'none'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    scriptSrc: [`'nonce-${nonce}'`, "'unsafe-eval'", "'strict-dynamic'"],
    connectSrc: ["'self'", ...firebaseUrl, ...externalDomains.map((d) => `https://${d}`)],
    imgSrc,
    frameSrc: frames.length > 0 ? frames : ["'none'"]
  });
  setContentSecurityPolicy(csp);
  return {
    ENV,
    locale,
    timezone,
    theme,
    csrf: csrfToken,
    toastMessage,
    segmentScript,
    appConfig,
    nonce
  };
});
export {
  getRootLoaderDataFn_createServerFn_handler
};
