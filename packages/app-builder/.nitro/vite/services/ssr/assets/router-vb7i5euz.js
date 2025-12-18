import { r as reactExports, i as isPromise, a as isRedirect, b as isNotFound, c as invariant, d as createControlledPromise, e as rootRouteId, f as isServer, g as functionalUpdate, h as arraysEqual, j as createLRUCache, k as compileDecodeCharMap, t as trimPath, l as rewriteBasepath, m as composeRewrites, p as processRouteTree, n as processRouteMasks, o as resolvePath, q as cleanPath, s as trimPathRight, u as parseHref, v as executeRewriteInput, w as isDangerousProtocol, x as redirect, y as findSingleMatch, z as deepEqual, D as DEFAULT_PROTOCOL_ALLOWLIST, A as buildRouteBranch, B as interpolatePath, C as nullReplaceEqualDeep, E as replaceEqualDeep, F as last, G as decodePath, H as findFlatMatch, I as findRouteMatch, J as hasKeys, K as executeRewriteOutput, L as encodePathLikeUrl, M as trimPathLeft, N as joinPaths, O as useRouter, P as exactPathTest, Q as removeTrailingSlash, R as jsxRuntimeExports, S as React, T as isModuleNotFoundError, U as useHydrated, V as escapeHtml, W as getAssetCrossOrigin, X as getScriptPreloadAttrs, Y as appendUniqueUserTags, Z as resolveManifestCssLink, _ as createServerFn, $ as ClientOnly, a0 as getDefaultExportFromCjs, a1 as useMatches, a2 as notFound } from "../server.js";
import { n as noop, R as Removable, c as createRetryer, a as notifyManager, S as Subscribable, m as matchMutation, h as hashQueryKeyByOptions, Q as Query, b as matchQuery, f as focusManager, o as onlineManager, r as resolveStaleTime, d as functionalUpdate$1, e as hashKey, p as partialMatchKey, s as skipToken, g as QueryClientProvider } from "./QueryClientProvider-DYTpkCko.js";
import { g as getRequestNonce } from "./security-headers.server-BdP3HrPp.js";
import { t as t$1, F as FORBIDDEN, N as NOT_FOUND, s as servicesMiddleware, c as createInstance, i as initReactI18next, A as ALL_NAMESPACES, r as resources, a as i18nConfig, b as captureException, d as supportedLngs, g as getServerEnv, e as getOauth2Cookie, f as initServerServices, m as makeOidcService, h as setToast, n as number, z as z$1, M, j as NewPayloadAstNode, k as NewDatabaseAccessAstNode, l as isKnownOperandAstNode, o as t$2, p as t$3, q as isLeafOperandAstNode, u as t$4, v as n$1, D as DEFAULT_CASE_PAGINATION_SIZE, w as getPivotObjectKey, x as instance } from "./services-middleware-DR8Hua1Y.js";
import { I as I18nContext, u as useTranslation, T as Typo, B as Button, c as createSimpleContext, l as logosSVGSpriteHref, i as iconsSVGSpriteHref, a as I18nProvider, F as FormatContext, b as clsx, d as cn, S as StickyComponent, e as Icon, f as cva, C as CtaV2ClassName, M as MenuButton, g as MenuPopover, h as MenuItem, j as Tag, k as TooltipV2, m as MenuRoot, n as MenuContent, o as MenuGroup, p as MenuGroupLabel, q as useFormatLanguage, r as formatDateRelative } from "./format-NPGUXq-g.js";
import { T as ThemeProvider } from "./ThemeContext-B40HQxfH.js";
import { c as createSsrRpc } from "./createSsrRpc-ZXUHv2Er.js";
import { g as getSSRInstance } from "./i18n-instance-store-UssbGYOM.js";
import { u as useMatch, a as useParams, _ as _enum, s as string, o as object, f as fromParams, b as fromUUIDtoSUUID, i as invariant$1, c as intersection, d as any, e as unknown, g as fromSUUIDtoUUID, h as useParam } from "./short-uuid-MIi3jWzx.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { M as MY_INBOX_ID } from "./inboxes-D556s0BB.js";
import { g as getCaseInvestigationDataDownloadEndpoint } from "./files-fO9wUXBf.js";
import { C as CopyToClipboardButton } from "./CopyToClipboardButton-CJNJJful.js";
import { c as caseDetailMiddleware } from "./case-detail-middleware-C3JS8Yme.js";
import { p as paginationSchema, d as decisionFiltersSchema } from "./decisions-B-2DmJW1.js";
import { n as n$2 } from "./unique-CBeBxAXx.js";
import { u as unarchiveScenarioPayloadSchema, c as createScenarioPayloadSchema, a as updateScenarioPayloadSchema, b as copyScenarioPayloadSchema, d as archiveScenarioPayloadSchema, e as createTestRunPayloadSchema, f as commitIterationPayloadSchema, p as prepareIterationPayloadSchema, g as activateIterationPayloadSchema, h as deactivateIterationPayloadSchema, i as duplicateRulePayloadSchema, j as deleteRulePayloadSchema, k as generateRuleInputSchema } from "./scenarios-8U74nJp4.js";
var reactUse = reactExports.use;
function useForwardedRef(ref) {
  const innerRef = reactExports.useRef(null);
  reactExports.useImperativeHandle(ref, () => innerRef.current, []);
  return innerRef;
}
function encode(obj, stringify = String) {
  const result = new URLSearchParams();
  for (const key in obj) {
    const val = obj[key];
    if (val !== void 0) result.set(key, stringify(val));
  }
  return result.toString();
}
function toValue(str) {
  if (!str) return "";
  if (str === "false") return false;
  if (str === "true") return true;
  return +str * 0 === 0 && +str + "" === str ? +str : str;
}
function decode(str) {
  const searchParams = new URLSearchParams(str);
  const result = /* @__PURE__ */ Object.create(null);
  for (const [key, value] of searchParams.entries()) {
    const previousValue = result[key];
    if (previousValue == null) result[key] = toValue(value);
    else if (Array.isArray(previousValue)) previousValue.push(toValue(value));
    else result[key] = [previousValue, toValue(value)];
  }
  return result;
}
const defaultParseSearch = parseSearchWith(JSON.parse);
const defaultStringifySearch = stringifySearchWith(JSON.stringify, JSON.parse);
function parseSearchWith(parser) {
  return (searchStr) => {
    if (searchStr[0] === "?") searchStr = searchStr.substring(1);
    const query = decode(searchStr);
    for (const key in query) {
      const value = query[key];
      if (typeof value === "string") try {
        query[key] = parser(value);
      } catch (_err) {
      }
    }
    return query;
  };
}
function stringifySearchWith(stringify, parser) {
  const hasParser = typeof parser === "function";
  function stringifyValue(val) {
    if (typeof val === "object" && val !== null) try {
      return stringify(val);
    } catch (_err) {
    }
    else if (hasParser && typeof val === "string") try {
      parser(val);
      return stringify(val);
    } catch (_err) {
    }
    return val;
  }
  return (search) => {
    const searchStr = encode(search, stringifyValue);
    return searchStr ? `?${searchStr}` : "";
  };
}
const triggerOnReady = (inner) => {
  if (!inner.rendered) {
    inner.rendered = true;
    return inner.onReady?.();
  }
};
const resolvePreload = (inner, matchId) => {
  return !!(inner.preload && !inner.router.stores.matchStores.has(matchId));
};
const buildMatchContext = (inner, index, includeCurrentMatch = true) => {
  const context = { ...inner.router.options.context ?? {} };
  const end = includeCurrentMatch ? index : index - 1;
  for (let i = 0; i <= end; i++) {
    const innerMatch = inner.matches[i];
    if (!innerMatch) continue;
    const m = inner.router.getMatch(innerMatch.id);
    if (!m) continue;
    Object.assign(context, m.__routeContext, m.__beforeLoadContext);
  }
  return context;
};
const getNotFoundBoundaryIndex = (inner, err) => {
  if (!inner.matches.length) return;
  const requestedRouteId = err.routeId;
  const matchedRootIndex = inner.matches.findIndex((m) => m.routeId === inner.router.routeTree.id);
  const rootIndex = matchedRootIndex >= 0 ? matchedRootIndex : 0;
  let startIndex = requestedRouteId ? inner.matches.findIndex((match2) => match2.routeId === requestedRouteId) : inner.firstBadMatchIndex ?? inner.matches.length - 1;
  if (startIndex < 0) startIndex = rootIndex;
  for (let i = startIndex; i >= 0; i--) {
    const match2 = inner.matches[i];
    if (inner.router.looseRoutesById[match2.routeId].options.notFoundComponent) return i;
  }
  return requestedRouteId ? startIndex : rootIndex;
};
const handleRedirectAndNotFound = (inner, match2, err) => {
  if (!isRedirect(err) && !isNotFound(err)) return;
  if (isRedirect(err) && err.redirectHandled && !err.options.reloadDocument) throw err;
  if (match2) {
    match2._nonReactive.beforeLoadPromise?.resolve();
    match2._nonReactive.loaderPromise?.resolve();
    match2._nonReactive.beforeLoadPromise = void 0;
    match2._nonReactive.loaderPromise = void 0;
    match2._nonReactive.error = err;
    inner.updateMatch(match2.id, (prev) => ({
      ...prev,
      status: isRedirect(err) ? "redirected" : isNotFound(err) ? "notFound" : prev.status === "pending" ? "success" : prev.status,
      context: buildMatchContext(inner, match2.index),
      isFetching: false,
      error: err
    }));
    if (isNotFound(err) && !err.routeId) err.routeId = match2.routeId;
    match2._nonReactive.loadPromise?.resolve();
  }
  if (isRedirect(err)) {
    inner.rendered = true;
    err.options._fromLocation = inner.location;
    err.redirectHandled = true;
    err = inner.router.resolveRedirect(err);
  }
  throw err;
};
const shouldSkipLoader = (inner, matchId) => {
  const match2 = inner.router.getMatch(matchId);
  if (!match2) return true;
  if (match2.ssr === false) return true;
  return false;
};
const syncMatchContext = (inner, matchId, index) => {
  const nextContext = buildMatchContext(inner, index);
  inner.updateMatch(matchId, (prev) => {
    return {
      ...prev,
      context: nextContext
    };
  });
};
const handleSerialError = (inner, index, err) => {
  const { id: matchId, routeId } = inner.matches[index];
  const route = inner.router.looseRoutesById[routeId];
  if (err instanceof Promise) throw err;
  inner.firstBadMatchIndex ??= index;
  handleRedirectAndNotFound(inner, inner.router.getMatch(matchId), err);
  try {
    route.options.onError?.(err);
  } catch (errorHandlerErr) {
    err = errorHandlerErr;
    handleRedirectAndNotFound(inner, inner.router.getMatch(matchId), err);
  }
  inner.updateMatch(matchId, (prev) => {
    prev._nonReactive.beforeLoadPromise?.resolve();
    prev._nonReactive.beforeLoadPromise = void 0;
    prev._nonReactive.loadPromise?.resolve();
    return {
      ...prev,
      error: err,
      status: "error",
      isFetching: false,
      updatedAt: Date.now(),
      abortController: new AbortController()
    };
  });
  if (!inner.preload && !isRedirect(err) && !isNotFound(err)) inner.serialError ??= err;
};
const isBeforeLoadSsr = (inner, matchId, index, route) => {
  const existingMatch = inner.router.getMatch(matchId);
  const parentMatchId = inner.matches[index - 1]?.id;
  const parentMatch = parentMatchId ? inner.router.getMatch(parentMatchId) : void 0;
  if (inner.router.isShell()) {
    existingMatch.ssr = route.id === rootRouteId;
    return;
  }
  if (parentMatch?.ssr === false) {
    existingMatch.ssr = false;
    return;
  }
  const parentOverride = (tempSsr2) => {
    if (tempSsr2 === true && parentMatch?.ssr === "data-only") return "data-only";
    return tempSsr2;
  };
  const defaultSsr = inner.router.options.defaultSsr ?? true;
  if (route.options.ssr === void 0) {
    existingMatch.ssr = parentOverride(defaultSsr);
    return;
  }
  if (typeof route.options.ssr !== "function") {
    existingMatch.ssr = parentOverride(route.options.ssr);
    return;
  }
  const { search, params } = existingMatch;
  const ssrFnContext = {
    search: makeMaybe(search, existingMatch.searchError),
    params: makeMaybe(params, existingMatch.paramsError),
    location: inner.location,
    matches: inner.matches.map((match2) => ({
      index: match2.index,
      pathname: match2.pathname,
      fullPath: match2.fullPath,
      staticData: match2.staticData,
      id: match2.id,
      routeId: match2.routeId,
      search: makeMaybe(match2.search, match2.searchError),
      params: makeMaybe(match2.params, match2.paramsError),
      ssr: match2.ssr
    }))
  };
  const tempSsr = route.options.ssr(ssrFnContext);
  if (isPromise(tempSsr)) return tempSsr.then((ssr) => {
    existingMatch.ssr = parentOverride(ssr ?? defaultSsr);
  });
  existingMatch.ssr = parentOverride(tempSsr ?? defaultSsr);
};
const setupPendingTimeout = (inner, matchId, route, match2) => {
  if (match2._nonReactive.pendingTimeout !== void 0) return;
  const pendingMs = route.options.pendingMs ?? inner.router.options.defaultPendingMs;
  if (!!(inner.onReady && false)) {
    const pendingTimeout = setTimeout(() => {
      triggerOnReady(inner);
    }, pendingMs);
    match2._nonReactive.pendingTimeout = pendingTimeout;
  }
};
const preBeforeLoadSetup = (inner, matchId, route) => {
  const existingMatch = inner.router.getMatch(matchId);
  if (!existingMatch._nonReactive.beforeLoadPromise && !existingMatch._nonReactive.loaderPromise) return;
  setupPendingTimeout(inner, matchId, route, existingMatch);
  const then = () => {
    const match2 = inner.router.getMatch(matchId);
    if (match2.preload && (match2.status === "redirected" || match2.status === "notFound")) handleRedirectAndNotFound(inner, match2, match2.error);
  };
  return existingMatch._nonReactive.beforeLoadPromise ? existingMatch._nonReactive.beforeLoadPromise.then(then) : then();
};
const executeBeforeLoad = (inner, matchId, index, route) => {
  const match2 = inner.router.getMatch(matchId);
  let prevLoadPromise = match2._nonReactive.loadPromise;
  match2._nonReactive.loadPromise = createControlledPromise(() => {
    prevLoadPromise?.resolve();
    prevLoadPromise = void 0;
  });
  const { paramsError, searchError } = match2;
  if (paramsError) handleSerialError(inner, index, paramsError);
  if (searchError) handleSerialError(inner, index, searchError);
  setupPendingTimeout(inner, matchId, route, match2);
  const abortController = new AbortController();
  let isPending = false;
  const pending = () => {
    if (isPending) return;
    isPending = true;
    inner.updateMatch(matchId, (prev) => ({
      ...prev,
      isFetching: "beforeLoad",
      fetchCount: prev.fetchCount + 1,
      abortController
    }));
  };
  const resolve = () => {
    match2._nonReactive.beforeLoadPromise?.resolve();
    match2._nonReactive.beforeLoadPromise = void 0;
    inner.updateMatch(matchId, (prev) => ({
      ...prev,
      isFetching: false
    }));
  };
  if (!route.options.beforeLoad) {
    inner.router.batch(() => {
      pending();
      resolve();
    });
    return;
  }
  match2._nonReactive.beforeLoadPromise = createControlledPromise();
  const context = {
    ...buildMatchContext(inner, index, false),
    ...match2.__routeContext
  };
  const { search, params, cause } = match2;
  const preload = resolvePreload(inner, matchId);
  const beforeLoadFnContext = {
    search,
    abortController,
    params,
    preload,
    context,
    location: inner.location,
    navigate: (opts) => inner.router.navigate({
      ...opts,
      _fromLocation: inner.location
    }),
    buildLocation: inner.router.buildLocation,
    cause: preload ? "preload" : cause,
    matches: inner.matches,
    routeId: route.id,
    ...inner.router.options.additionalContext
  };
  const updateContext = (beforeLoadContext2) => {
    if (beforeLoadContext2 === void 0) {
      inner.router.batch(() => {
        pending();
        resolve();
      });
      return;
    }
    if (isRedirect(beforeLoadContext2) || isNotFound(beforeLoadContext2)) {
      pending();
      handleSerialError(inner, index, beforeLoadContext2);
    }
    inner.router.batch(() => {
      pending();
      inner.updateMatch(matchId, (prev) => ({
        ...prev,
        __beforeLoadContext: beforeLoadContext2
      }));
      resolve();
    });
  };
  let beforeLoadContext;
  try {
    beforeLoadContext = route.options.beforeLoad(beforeLoadFnContext);
    if (isPromise(beforeLoadContext)) {
      pending();
      return beforeLoadContext.catch((err) => {
        handleSerialError(inner, index, err);
      }).then(updateContext);
    }
  } catch (err) {
    pending();
    handleSerialError(inner, index, err);
  }
  updateContext(beforeLoadContext);
};
const handleBeforeLoad = (inner, index) => {
  const { id: matchId, routeId } = inner.matches[index];
  const route = inner.router.looseRoutesById[routeId];
  const serverSsr = () => {
    {
      const maybePromise = isBeforeLoadSsr(inner, matchId, index, route);
      if (isPromise(maybePromise)) return maybePromise.then(queueExecution);
    }
    return queueExecution();
  };
  const execute = () => executeBeforeLoad(inner, matchId, index, route);
  const queueExecution = () => {
    if (shouldSkipLoader(inner, matchId)) return;
    const result = preBeforeLoadSetup(inner, matchId, route);
    return isPromise(result) ? result.then(execute) : execute();
  };
  return serverSsr();
};
const executeHead = (inner, matchId, route) => {
  const match2 = inner.router.getMatch(matchId);
  if (!match2) return;
  if (!route.options.head && !route.options.scripts && !route.options.headers) return;
  const assetContext = {
    ssr: inner.router.options.ssr,
    matches: inner.matches,
    match: match2,
    params: match2.params,
    loaderData: match2.loaderData
  };
  return Promise.all([
    route.options.head?.(assetContext),
    route.options.scripts?.(assetContext),
    route.options.headers?.(assetContext)
  ]).then(([headFnContent, scripts, headers]) => {
    return {
      meta: headFnContent?.meta,
      links: headFnContent?.links,
      headScripts: headFnContent?.scripts,
      headers,
      scripts,
      styles: headFnContent?.styles
    };
  });
};
const getLoaderContext = (inner, matchPromises, matchId, index, route) => {
  const parentMatchPromise = matchPromises[index - 1];
  const { params, loaderDeps, abortController, cause } = inner.router.getMatch(matchId);
  const context = buildMatchContext(inner, index);
  const preload = resolvePreload(inner, matchId);
  return {
    params,
    deps: loaderDeps,
    preload: !!preload,
    parentMatchPromise,
    abortController,
    context,
    location: inner.location,
    navigate: (opts) => inner.router.navigate({
      ...opts,
      _fromLocation: inner.location
    }),
    cause: preload ? "preload" : cause,
    route,
    ...inner.router.options.additionalContext
  };
};
const runLoader = async (inner, matchPromises, matchId, index, route) => {
  try {
    const match2 = inner.router.getMatch(matchId);
    try {
      if (!(isServer ?? inner.router.isServer) || match2.ssr === true) loadRouteChunk(route);
      const routeLoader = route.options.loader;
      const loader = typeof routeLoader === "function" ? routeLoader : routeLoader?.handler;
      const loaderResult = loader?.(getLoaderContext(inner, matchPromises, matchId, index, route));
      const loaderResultIsPromise = !!loader && isPromise(loaderResult);
      if (!!(loaderResultIsPromise || route._lazyPromise || route._componentsPromise || route.options.head || route.options.scripts || route.options.headers || match2._nonReactive.minPendingPromise)) inner.updateMatch(matchId, (prev) => ({
        ...prev,
        isFetching: "loader"
      }));
      if (loader) {
        const loaderData = loaderResultIsPromise ? await loaderResult : loaderResult;
        handleRedirectAndNotFound(inner, inner.router.getMatch(matchId), loaderData);
        if (loaderData !== void 0) inner.updateMatch(matchId, (prev) => ({
          ...prev,
          loaderData
        }));
      }
      if (route._lazyPromise) await route._lazyPromise;
      const pendingPromise = match2._nonReactive.minPendingPromise;
      if (pendingPromise) await pendingPromise;
      if (route._componentsPromise) await route._componentsPromise;
      inner.updateMatch(matchId, (prev) => ({
        ...prev,
        error: void 0,
        context: buildMatchContext(inner, index),
        status: "success",
        isFetching: false,
        updatedAt: Date.now()
      }));
    } catch (e2) {
      let error = e2;
      if (error?.name === "AbortError") {
        if (match2.abortController.signal.aborted) {
          match2._nonReactive.loaderPromise?.resolve();
          match2._nonReactive.loaderPromise = void 0;
          return;
        }
        inner.updateMatch(matchId, (prev) => ({
          ...prev,
          status: prev.status === "pending" ? "success" : prev.status,
          isFetching: false,
          context: buildMatchContext(inner, index)
        }));
        return;
      }
      const pendingPromise = match2._nonReactive.minPendingPromise;
      if (pendingPromise) await pendingPromise;
      if (isNotFound(e2)) await route.options.notFoundComponent?.preload?.();
      handleRedirectAndNotFound(inner, inner.router.getMatch(matchId), e2);
      try {
        route.options.onError?.(e2);
      } catch (onErrorError) {
        error = onErrorError;
        handleRedirectAndNotFound(inner, inner.router.getMatch(matchId), onErrorError);
      }
      if (!isRedirect(error) && !isNotFound(error)) await loadRouteChunk(route, ["errorComponent"]);
      inner.updateMatch(matchId, (prev) => ({
        ...prev,
        error,
        context: buildMatchContext(inner, index),
        status: "error",
        isFetching: false
      }));
    }
  } catch (err) {
    const match2 = inner.router.getMatch(matchId);
    if (match2) match2._nonReactive.loaderPromise = void 0;
    handleRedirectAndNotFound(inner, match2, err);
  }
};
const loadRouteMatch = async (inner, matchPromises, index) => {
  async function handleLoader(preload, prevMatch, previousRouteMatchId, match22, route2) {
    const age = Date.now() - prevMatch.updatedAt;
    const staleAge = preload ? route2.options.preloadStaleTime ?? inner.router.options.defaultPreloadStaleTime ?? 3e4 : route2.options.staleTime ?? inner.router.options.defaultStaleTime ?? 0;
    const shouldReloadOption = route2.options.shouldReload;
    const shouldReload = typeof shouldReloadOption === "function" ? shouldReloadOption(getLoaderContext(inner, matchPromises, matchId, index, route2)) : shouldReloadOption;
    const { status, invalid } = match22;
    const staleMatchShouldReload = age >= staleAge && (!!inner.forceStaleReload || match22.cause === "enter" || previousRouteMatchId !== void 0 && previousRouteMatchId !== match22.id);
    loaderShouldRunAsync = status === "success" && (invalid || (shouldReload ?? staleMatchShouldReload));
    if (preload && route2.options.preload === false) ;
    else if (loaderShouldRunAsync && !inner.sync && shouldReloadInBackground) {
      loaderIsRunningAsync = true;
      (async () => {
        try {
          await runLoader(inner, matchPromises, matchId, index, route2);
          const match3 = inner.router.getMatch(matchId);
          match3._nonReactive.loaderPromise?.resolve();
          match3._nonReactive.loadPromise?.resolve();
          match3._nonReactive.loaderPromise = void 0;
          match3._nonReactive.loadPromise = void 0;
        } catch (err) {
          if (isRedirect(err)) await inner.router.navigate(err.options);
        }
      })();
    } else if (status !== "success" || loaderShouldRunAsync) await runLoader(inner, matchPromises, matchId, index, route2);
    else syncMatchContext(inner, matchId, index);
  }
  const { id: matchId, routeId } = inner.matches[index];
  let loaderShouldRunAsync = false;
  let loaderIsRunningAsync = false;
  const route = inner.router.looseRoutesById[routeId];
  const routeLoader = route.options.loader;
  const shouldReloadInBackground = ((typeof routeLoader === "function" ? void 0 : routeLoader?.staleReloadMode) ?? inner.router.options.defaultStaleReloadMode) !== "blocking";
  if (shouldSkipLoader(inner, matchId)) {
    if (!inner.router.getMatch(matchId)) return inner.matches[index];
    syncMatchContext(inner, matchId, index);
    return inner.router.getMatch(matchId);
  } else {
    const prevMatch = inner.router.getMatch(matchId);
    const activeIdAtIndex = inner.router.stores.matchesId.get()[index];
    const previousRouteMatchId = (activeIdAtIndex && inner.router.stores.matchStores.get(activeIdAtIndex) || null)?.routeId === routeId ? activeIdAtIndex : inner.router.stores.matches.get().find((d) => d.routeId === routeId)?.id;
    const preload = resolvePreload(inner, matchId);
    if (prevMatch._nonReactive.loaderPromise) {
      if (prevMatch.status === "success" && !inner.sync && !prevMatch.preload && shouldReloadInBackground) return prevMatch;
      await prevMatch._nonReactive.loaderPromise;
      const match22 = inner.router.getMatch(matchId);
      const error = match22._nonReactive.error || match22.error;
      if (error) handleRedirectAndNotFound(inner, match22, error);
      if (match22.status === "pending") await handleLoader(preload, prevMatch, previousRouteMatchId, match22, route);
    } else {
      const nextPreload = preload && !inner.router.stores.matchStores.has(matchId);
      const match22 = inner.router.getMatch(matchId);
      match22._nonReactive.loaderPromise = createControlledPromise();
      if (nextPreload !== match22.preload) inner.updateMatch(matchId, (prev) => ({
        ...prev,
        preload: nextPreload
      }));
      await handleLoader(preload, prevMatch, previousRouteMatchId, match22, route);
    }
  }
  const match2 = inner.router.getMatch(matchId);
  if (!loaderIsRunningAsync) {
    match2._nonReactive.loaderPromise?.resolve();
    match2._nonReactive.loadPromise?.resolve();
    match2._nonReactive.loadPromise = void 0;
  }
  clearTimeout(match2._nonReactive.pendingTimeout);
  match2._nonReactive.pendingTimeout = void 0;
  if (!loaderIsRunningAsync) match2._nonReactive.loaderPromise = void 0;
  match2._nonReactive.dehydrated = void 0;
  const nextIsFetching = loaderIsRunningAsync ? match2.isFetching : false;
  if (nextIsFetching !== match2.isFetching || match2.invalid !== false) {
    inner.updateMatch(matchId, (prev) => ({
      ...prev,
      isFetching: nextIsFetching,
      invalid: false
    }));
    return inner.router.getMatch(matchId);
  } else return match2;
};
async function loadMatches(arg) {
  const inner = arg;
  const matchPromises = [];
  let beforeLoadNotFound;
  for (let i = 0; i < inner.matches.length; i++) {
    try {
      const beforeLoad = handleBeforeLoad(inner, i);
      if (isPromise(beforeLoad)) await beforeLoad;
    } catch (err) {
      if (isRedirect(err)) throw err;
      if (isNotFound(err)) beforeLoadNotFound = err;
      else if (!inner.preload) throw err;
      break;
    }
    if (inner.serialError || inner.firstBadMatchIndex != null) break;
  }
  const baseMaxIndexExclusive = inner.firstBadMatchIndex ?? inner.matches.length;
  const boundaryIndex = beforeLoadNotFound && !inner.preload ? getNotFoundBoundaryIndex(inner, beforeLoadNotFound) : void 0;
  const maxIndexExclusive = beforeLoadNotFound && inner.preload ? 0 : boundaryIndex !== void 0 ? Math.min(boundaryIndex + 1, baseMaxIndexExclusive) : baseMaxIndexExclusive;
  let firstNotFound;
  let firstUnhandledRejection;
  for (let i = 0; i < maxIndexExclusive; i++) matchPromises.push(loadRouteMatch(inner, matchPromises, i));
  try {
    await Promise.all(matchPromises);
  } catch {
    const settled = await Promise.allSettled(matchPromises);
    for (const result of settled) {
      if (result.status !== "rejected") continue;
      const reason = result.reason;
      if (isRedirect(reason)) throw reason;
      if (isNotFound(reason)) firstNotFound ??= reason;
      else firstUnhandledRejection ??= reason;
    }
    if (firstUnhandledRejection !== void 0) throw firstUnhandledRejection;
  }
  const notFoundToThrow = firstNotFound ?? (beforeLoadNotFound && !inner.preload ? beforeLoadNotFound : void 0);
  let headMaxIndex = inner.firstBadMatchIndex !== void 0 ? inner.firstBadMatchIndex : inner.matches.length - 1;
  if (!notFoundToThrow && beforeLoadNotFound && inner.preload) return inner.matches;
  if (notFoundToThrow) {
    const renderedBoundaryIndex = getNotFoundBoundaryIndex(inner, notFoundToThrow);
    if (renderedBoundaryIndex === void 0) {
      invariant();
    }
    const boundaryMatch = inner.matches[renderedBoundaryIndex];
    const boundaryRoute = inner.router.looseRoutesById[boundaryMatch.routeId];
    const defaultNotFoundComponent = inner.router.options?.defaultNotFoundComponent;
    if (!boundaryRoute.options.notFoundComponent && defaultNotFoundComponent) boundaryRoute.options.notFoundComponent = defaultNotFoundComponent;
    notFoundToThrow.routeId = boundaryMatch.routeId;
    const boundaryIsRoot = boundaryMatch.routeId === inner.router.routeTree.id;
    inner.updateMatch(boundaryMatch.id, (prev) => ({
      ...prev,
      ...boundaryIsRoot ? {
        status: "success",
        globalNotFound: true,
        error: void 0
      } : {
        status: "notFound",
        error: notFoundToThrow
      },
      isFetching: false
    }));
    headMaxIndex = renderedBoundaryIndex;
    await loadRouteChunk(boundaryRoute, ["notFoundComponent"]);
  } else if (!inner.preload) {
    const rootMatch = inner.matches[0];
    if (!rootMatch.globalNotFound) {
      if (inner.router.getMatch(rootMatch.id)?.globalNotFound) inner.updateMatch(rootMatch.id, (prev) => ({
        ...prev,
        globalNotFound: false,
        error: void 0
      }));
    }
  }
  if (inner.serialError && inner.firstBadMatchIndex !== void 0) {
    const errorRoute = inner.router.looseRoutesById[inner.matches[inner.firstBadMatchIndex].routeId];
    await loadRouteChunk(errorRoute, ["errorComponent"]);
  }
  for (let i = 0; i <= headMaxIndex; i++) {
    const { id: matchId, routeId } = inner.matches[i];
    const route = inner.router.looseRoutesById[routeId];
    try {
      const headResult = executeHead(inner, matchId, route);
      if (headResult) {
        const head = await headResult;
        inner.updateMatch(matchId, (prev) => ({
          ...prev,
          ...head
        }));
      }
    } catch (err) {
      console.error(`Error executing head for route ${routeId}:`, err);
    }
  }
  const readyPromise = triggerOnReady(inner);
  if (isPromise(readyPromise)) await readyPromise;
  if (notFoundToThrow) throw notFoundToThrow;
  if (inner.serialError && !inner.preload && !inner.onReady) throw inner.serialError;
  return inner.matches;
}
function preloadRouteComponents(route, componentTypesToLoad) {
  const preloads = componentTypesToLoad.map((type) => route.options[type]?.preload?.()).filter(Boolean);
  if (preloads.length === 0) return void 0;
  return Promise.all(preloads);
}
function loadRouteChunk(route, componentTypesToLoad = componentTypes) {
  if (!route._lazyLoaded && route._lazyPromise === void 0) if (route.lazyFn) route._lazyPromise = route.lazyFn().then((lazyRoute) => {
    const { id: _id, ...options } = lazyRoute.options;
    Object.assign(route.options, options);
    route._lazyLoaded = true;
    route._lazyPromise = void 0;
  });
  else route._lazyLoaded = true;
  const runAfterLazy = () => route._componentsLoaded ? void 0 : componentTypesToLoad === componentTypes ? (() => {
    if (route._componentsPromise === void 0) {
      const componentsPromise = preloadRouteComponents(route, componentTypes);
      if (componentsPromise) route._componentsPromise = componentsPromise.then(() => {
        route._componentsLoaded = true;
        route._componentsPromise = void 0;
      });
      else route._componentsLoaded = true;
    }
    return route._componentsPromise;
  })() : preloadRouteComponents(route, componentTypesToLoad);
  return route._lazyPromise ? route._lazyPromise.then(runAfterLazy) : runAfterLazy();
}
function makeMaybe(value, error) {
  if (error) return {
    status: "error",
    error
  };
  return {
    status: "success",
    value
  };
}
function routeNeedsPreload(route) {
  for (const componentType of componentTypes) if (route.options[componentType]?.preload) return true;
  return false;
}
const componentTypes = [
  "component",
  "errorComponent",
  "pendingComponent",
  "notFoundComponent"
];
function createNonReactiveMutableStore(initialValue) {
  let value = initialValue;
  return {
    get() {
      return value;
    },
    set(nextOrUpdater) {
      value = functionalUpdate(nextOrUpdater, value);
    }
  };
}
function createNonReactiveReadonlyStore(read) {
  return { get() {
    return read();
  } };
}
function createRouterStores(initialState, config) {
  const { createMutableStore, createReadonlyStore, batch, init } = config;
  const matchStores = /* @__PURE__ */ new Map();
  const pendingMatchStores = /* @__PURE__ */ new Map();
  const cachedMatchStores = /* @__PURE__ */ new Map();
  const status = createMutableStore(initialState.status);
  const loadedAt = createMutableStore(initialState.loadedAt);
  const isLoading = createMutableStore(initialState.isLoading);
  const isTransitioning = createMutableStore(initialState.isTransitioning);
  const location = createMutableStore(initialState.location);
  const resolvedLocation = createMutableStore(initialState.resolvedLocation);
  const statusCode = createMutableStore(initialState.statusCode);
  const redirect2 = createMutableStore(initialState.redirect);
  const matchesId = createMutableStore([]);
  const pendingIds = createMutableStore([]);
  const cachedIds = createMutableStore([]);
  const matches = createReadonlyStore(() => readPoolMatches(matchStores, matchesId.get()));
  const pendingMatches = createReadonlyStore(() => readPoolMatches(pendingMatchStores, pendingIds.get()));
  const cachedMatches = createReadonlyStore(() => readPoolMatches(cachedMatchStores, cachedIds.get()));
  const firstId = createReadonlyStore(() => matchesId.get()[0]);
  const hasPending = createReadonlyStore(() => matchesId.get().some((matchId) => {
    return matchStores.get(matchId)?.get().status === "pending";
  }));
  const matchRouteDeps = createReadonlyStore(() => ({
    locationHref: location.get().href,
    resolvedLocationHref: resolvedLocation.get()?.href,
    status: status.get()
  }));
  const __store = createReadonlyStore(() => ({
    status: status.get(),
    loadedAt: loadedAt.get(),
    isLoading: isLoading.get(),
    isTransitioning: isTransitioning.get(),
    matches: matches.get(),
    location: location.get(),
    resolvedLocation: resolvedLocation.get(),
    statusCode: statusCode.get(),
    redirect: redirect2.get()
  }));
  const matchStoreByRouteIdCache = createLRUCache(64);
  function getRouteMatchStore(routeId) {
    let cached = matchStoreByRouteIdCache.get(routeId);
    if (!cached) {
      cached = createReadonlyStore(() => {
        const ids = matchesId.get();
        for (const id of ids) {
          const matchStore = matchStores.get(id);
          if (matchStore && matchStore.routeId === routeId) return matchStore.get();
        }
      });
      matchStoreByRouteIdCache.set(routeId, cached);
    }
    return cached;
  }
  const store = {
    status,
    loadedAt,
    isLoading,
    isTransitioning,
    location,
    resolvedLocation,
    statusCode,
    redirect: redirect2,
    matchesId,
    pendingIds,
    cachedIds,
    matches,
    pendingMatches,
    cachedMatches,
    firstId,
    hasPending,
    matchRouteDeps,
    matchStores,
    pendingMatchStores,
    cachedMatchStores,
    __store,
    getRouteMatchStore,
    setMatches,
    setPending,
    setCached
  };
  setMatches(initialState.matches);
  init?.(store);
  function setMatches(nextMatches) {
    reconcileMatchPool(nextMatches, matchStores, matchesId, createMutableStore, batch);
  }
  function setPending(nextMatches) {
    reconcileMatchPool(nextMatches, pendingMatchStores, pendingIds, createMutableStore, batch);
  }
  function setCached(nextMatches) {
    reconcileMatchPool(nextMatches, cachedMatchStores, cachedIds, createMutableStore, batch);
  }
  return store;
}
function readPoolMatches(pool, ids) {
  const matches = [];
  for (const id of ids) {
    const matchStore = pool.get(id);
    if (matchStore) matches.push(matchStore.get());
  }
  return matches;
}
function reconcileMatchPool(nextMatches, pool, idStore, createMutableStore, batch) {
  const nextIds = nextMatches.map((d) => d.id);
  const nextIdSet = new Set(nextIds);
  batch(() => {
    for (const id of pool.keys()) if (!nextIdSet.has(id)) pool.delete(id);
    for (const nextMatch of nextMatches) {
      const existing = pool.get(nextMatch.id);
      if (!existing) {
        const matchStore = createMutableStore(nextMatch);
        matchStore.routeId = nextMatch.routeId;
        pool.set(nextMatch.id, matchStore);
        continue;
      }
      existing.routeId = nextMatch.routeId;
      if (existing.get() !== nextMatch) existing.set(nextMatch);
    }
    if (!arraysEqual(idStore.get(), nextIds)) idStore.set(nextIds);
  });
}
function defaultSerializeError(err) {
  if (err instanceof Error) {
    const obj = {
      name: err.name,
      message: err.message
    };
    return obj;
  }
  return { data: err };
}
function getLocationChangeInfo(location, resolvedLocation) {
  const fromLocation = resolvedLocation;
  const toLocation = location;
  return {
    fromLocation,
    toLocation,
    pathChanged: fromLocation?.pathname !== toLocation.pathname,
    hrefChanged: fromLocation?.href !== toLocation.href,
    hashChanged: fromLocation?.hash !== toLocation.hash
  };
}
const locationHistoryActions = /* @__PURE__ */ new WeakMap();
var RouterCore = class {
  /**
  * @deprecated Use the `createRouter` function instead
  */
  constructor(options, getStoreConfig) {
    this.tempLocationKey = `${Math.round(Math.random() * 1e7)}`;
    this._scroll = { next: true };
    this.shouldViewTransition = void 0;
    this.isViewTransitionTypesSupported = void 0;
    this.subscribers = /* @__PURE__ */ new Set();
    this.routeBranchCache = /* @__PURE__ */ new WeakMap();
    this.startTransition = (fn2) => fn2();
    this.update = (newOptions) => {
      const prevOptions = this.options;
      const prevBasepath = this.basepath ?? prevOptions?.basepath ?? "/";
      const basepathWasUnset = this.basepath === void 0;
      const prevRewriteOption = prevOptions?.rewrite;
      this.options = {
        ...prevOptions,
        ...newOptions
      };
      this.isServer = this.options.isServer ?? typeof document === "undefined";
      this.protocolAllowlist = new Set(this.options.protocolAllowlist);
      if (this.options.pathParamsAllowedCharacters) this.pathParamsDecoder = compileDecodeCharMap(this.options.pathParamsAllowedCharacters);
      if (!this.history || this.options.history && this.options.history !== this.history) if (!this.options.history) ;
      else this.history = this.options.history;
      this.origin = this.options.origin;
      if (!this.origin) this.origin = "http://localhost";
      if (this.history) this.updateLatestLocation();
      if (this.options.routeTree !== this.routeTree) {
        this.routeTree = this.options.routeTree;
        let processRouteTreeResult;
        if (globalThis.__TSR_CACHE__ && globalThis.__TSR_CACHE__.routeTree === this.routeTree) {
          const cached = globalThis.__TSR_CACHE__;
          this.resolvePathCache = cached.resolvePathCache;
          processRouteTreeResult = cached.processRouteTreeResult;
        } else {
          this.resolvePathCache = createLRUCache(1e3);
          processRouteTreeResult = this.buildRouteTree();
          if (globalThis.__TSR_CACHE__ === void 0) globalThis.__TSR_CACHE__ = {
            routeTree: this.routeTree,
            processRouteTreeResult,
            resolvePathCache: this.resolvePathCache
          };
        }
        this.setRoutes(processRouteTreeResult);
      }
      if (!this.stores && this.latestLocation) {
        const config = this.getStoreConfig(this);
        this.batch = config.batch;
        this.stores = createRouterStores(getInitialRouterState(this.latestLocation), config);
      }
      let needsLocationUpdate = false;
      const nextBasepath = this.options.basepath ?? "/";
      const nextRewriteOption = this.options.rewrite;
      if (basepathWasUnset || prevBasepath !== nextBasepath || prevRewriteOption !== nextRewriteOption) {
        this.basepath = nextBasepath;
        const rewrites = [];
        const trimmed = trimPath(nextBasepath);
        if (trimmed && trimmed !== "/") rewrites.push(rewriteBasepath({ basepath: nextBasepath }));
        if (nextRewriteOption) rewrites.push(nextRewriteOption);
        this.rewrite = rewrites.length === 0 ? void 0 : rewrites.length === 1 ? rewrites[0] : composeRewrites(rewrites);
        if (this.history) this.updateLatestLocation();
        needsLocationUpdate = true;
      }
      if (needsLocationUpdate && this.stores) this.stores.location.set(this.latestLocation);
      if (typeof window !== "undefined" && "CSS" in window && typeof window.CSS?.supports === "function") this.isViewTransitionTypesSupported = window.CSS.supports("selector(:active-view-transition-type(a))");
    };
    this.updateLatestLocation = () => {
      this.latestLocation = this.parseLocation(this.history.location, this.latestLocation);
    };
    this.buildRouteTree = () => {
      const result = processRouteTree(this.routeTree, this.options.caseSensitive, (route, i) => {
        route.init({ originalIndex: i });
      });
      if (this.options.routeMasks) processRouteMasks(this.options.routeMasks, result.processedTree);
      return result;
    };
    this.subscribe = (eventType, fn2) => {
      const listener = {
        eventType,
        fn: fn2
      };
      this.subscribers.add(listener);
      return () => {
        this.subscribers.delete(listener);
      };
    };
    this.emit = (routerEvent) => {
      this.subscribers.forEach((listener) => {
        if (listener.eventType === routerEvent.type) listener.fn(routerEvent);
      });
    };
    this.parseLocation = (locationToParse, previousLocation) => {
      const parse2 = ({ pathname, search, hash, href, state }) => {
        if (!this.rewrite && !/[ \x00-\x1f\x7f\u0080-\uffff]/.test(pathname)) {
          const parsedSearch2 = this.options.parseSearch(search);
          const searchStr2 = this.options.stringifySearch(parsedSearch2);
          return {
            href: pathname + searchStr2 + hash,
            publicHref: pathname + searchStr2 + hash,
            pathname: decodePath(pathname).path,
            external: false,
            searchStr: searchStr2,
            search: nullReplaceEqualDeep(previousLocation?.search, parsedSearch2),
            hash: decodePath(hash.slice(1)).path,
            state: replaceEqualDeep(previousLocation?.state, state)
          };
        }
        const fullUrl = new URL(href, this.origin);
        const url = executeRewriteInput(this.rewrite, fullUrl);
        const parsedSearch = this.options.parseSearch(url.search);
        const searchStr = this.options.stringifySearch(parsedSearch);
        url.search = searchStr;
        return {
          href: url.href.replace(url.origin, ""),
          publicHref: href,
          pathname: decodePath(url.pathname).path,
          external: !!this.rewrite && url.origin !== this.origin,
          searchStr,
          search: nullReplaceEqualDeep(previousLocation?.search, parsedSearch),
          hash: decodePath(url.hash.slice(1)).path,
          state: replaceEqualDeep(previousLocation?.state, state)
        };
      };
      const location = parse2(locationToParse);
      const { __tempLocation, __tempKey } = location.state;
      if (__tempLocation && (!__tempKey || __tempKey === this.tempLocationKey)) {
        const parsedTempLocation = parse2(__tempLocation);
        parsedTempLocation.state.key = location.state.key;
        parsedTempLocation.state.__TSR_key = location.state.__TSR_key;
        delete parsedTempLocation.state.__tempLocation;
        return {
          ...parsedTempLocation,
          maskedLocation: location
        };
      }
      return location;
    };
    this.resolvePathWithBase = (from, path) => {
      return resolvePath({
        base: from,
        to: path.includes("//") ? cleanPath(path) : path,
        trailingSlash: this.options.trailingSlash,
        cache: this.resolvePathCache
      });
    };
    this.matchRoutes = (pathnameOrNext, locationSearchOrOpts, opts) => {
      if (typeof pathnameOrNext === "string") return this.matchRoutesInternal({
        pathname: pathnameOrNext,
        search: locationSearchOrOpts
      }, opts);
      return this.matchRoutesInternal(pathnameOrNext, locationSearchOrOpts);
    };
    this.getMatchedRoutes = (pathname) => {
      return getMatchedRoutes({
        pathname,
        routesById: this.routesById,
        processedTree: this.processedTree
      });
    };
    this.cancelMatch = (id) => {
      const match2 = this.getMatch(id);
      if (!match2) return;
      match2.abortController.abort();
      clearTimeout(match2._nonReactive.pendingTimeout);
      match2._nonReactive.pendingTimeout = void 0;
    };
    this.cancelMatches = () => {
      this.stores.pendingIds.get().forEach((matchId) => {
        this.cancelMatch(matchId);
      });
      this.stores.matchesId.get().forEach((matchId) => {
        if (this.stores.pendingMatchStores.has(matchId)) return;
        const match2 = this.stores.matchStores.get(matchId)?.get();
        if (!match2) return;
        if (match2.status === "pending" || match2.isFetching === "loader") this.cancelMatch(matchId);
      });
    };
    this.buildLocation = (opts) => {
      const build = (dest = {}) => {
        const currentLocation = dest._fromLocation || this.pendingBuiltLocation || this.latestLocation;
        const lightweightResult = this.matchRoutesLightweight(currentLocation);
        if (dest.from && false) ;
        const defaultedFromPath = dest.unsafeRelative === "path" ? currentLocation.pathname : dest.from ?? lightweightResult.fullPath;
        const destTo = dest.to ? `${dest.to}` : void 0;
        const fromSearch = lightweightResult.search;
        const fromParams2 = Object.assign(/* @__PURE__ */ Object.create(null), lightweightResult.params);
        const sourcePath = destTo?.charCodeAt(0) === 47 ? "/" : this.resolvePathWithBase(defaultedFromPath, ".");
        const nextTo = destTo ? this.resolvePathWithBase(sourcePath, destTo) : sourcePath;
        const nextParams = dest.params === false || dest.params === null ? /* @__PURE__ */ Object.create(null) : (dest.params ?? true) === true ? fromParams2 : Object.assign(fromParams2, functionalUpdate(dest.params, fromParams2));
        const destRoute = this.routesByPath[trimPathRight(nextTo)];
        let destRoutes;
        if (destRoute) destRoutes = this.getRouteBranch(destRoute);
        else if (nextTo.includes("$")) destRoutes = [];
        else {
          const destMatchResult = this.getMatchedRoutes(nextTo);
          destRoutes = destMatchResult.matchedRoutes;
          if (this.options.notFoundRoute && (!destMatchResult.foundRoute || destMatchResult.foundRoute.path !== "/" && destMatchResult.routeParams["**"])) destRoutes = [...destRoutes, this.options.notFoundRoute];
        }
        if (destRoutes.length && hasKeys(nextParams)) for (const route of destRoutes) {
          const fn2 = route.options.params?.stringify ?? route.options.stringifyParams;
          if (fn2) try {
            Object.assign(nextParams, fn2(nextParams));
          } catch {
          }
        }
        const nextPathname = opts.leaveParams ? nextTo : decodePath(interpolatePath({
          path: nextTo,
          params: nextParams,
          decoder: this.pathParamsDecoder,
          server: this.isServer
        }).interpolatedPath).path;
        let nextSearch = fromSearch;
        if (opts._includeValidateSearch && this.options.search?.strict) {
          const validatedSearch = {};
          destRoutes.forEach((route) => {
            if (route.options.validateSearch) try {
              Object.assign(validatedSearch, validateSearch(route.options.validateSearch, {
                ...validatedSearch,
                ...nextSearch
              }));
            } catch {
            }
          });
          nextSearch = validatedSearch;
        }
        nextSearch = applySearchMiddleware({
          search: nextSearch,
          dest,
          destRoutes,
          _includeValidateSearch: opts._includeValidateSearch
        });
        nextSearch = nullReplaceEqualDeep(fromSearch, nextSearch);
        const searchStr = this.options.stringifySearch(nextSearch);
        const hash = dest.hash === true ? currentLocation.hash : dest.hash ? functionalUpdate(dest.hash, currentLocation.hash) : void 0;
        const hashStr = hash ? `#${hash}` : "";
        let nextState = dest.state === true ? currentLocation.state : dest.state ? functionalUpdate(dest.state, currentLocation.state) : {};
        nextState = replaceEqualDeep(currentLocation.state, nextState);
        const fullPath = `${nextPathname}${searchStr}${hashStr}`;
        let href;
        let publicHref;
        let external = false;
        if (this.rewrite) {
          const url = new URL(fullPath, this.origin);
          const rewrittenUrl = executeRewriteOutput(this.rewrite, url);
          href = url.href.replace(url.origin, "");
          if (rewrittenUrl.origin !== this.origin) {
            publicHref = rewrittenUrl.href;
            external = true;
          } else publicHref = rewrittenUrl.pathname + rewrittenUrl.search + rewrittenUrl.hash;
        } else {
          href = encodePathLikeUrl(fullPath);
          publicHref = href;
        }
        return {
          publicHref,
          href,
          pathname: nextPathname,
          search: nextSearch,
          searchStr,
          state: nextState,
          hash: hash ?? "",
          external,
          unmaskOnReload: dest.unmaskOnReload
        };
      };
      const buildWithMatches = (dest = {}, maskedDest) => {
        const next = build(dest);
        let maskedNext = maskedDest ? build(maskedDest) : void 0;
        if (!maskedNext) {
          const params = /* @__PURE__ */ Object.create(null);
          if (this.options.routeMasks) {
            const match2 = findFlatMatch(next.pathname, this.processedTree);
            if (match2) {
              Object.assign(params, match2.rawParams);
              const { from: _from, params: maskParams, ...maskProps } = match2.route;
              const nextParams = maskParams === false || maskParams === null ? /* @__PURE__ */ Object.create(null) : (maskParams ?? true) === true ? params : Object.assign(params, functionalUpdate(maskParams, params));
              maskedDest = {
                from: opts.from,
                ...maskProps,
                params: nextParams
              };
              maskedNext = build(maskedDest);
            }
          }
        }
        if (maskedNext) next.maskedLocation = maskedNext;
        return next;
      };
      if (opts.mask) return buildWithMatches(opts, {
        from: opts.from,
        ...opts.mask
      });
      return buildWithMatches(opts);
    };
    this.commitLocation = async ({ viewTransition, ignoreBlocker, ...next }) => {
      let historyAction;
      const isSameState = () => {
        const ignoredProps = [
          "key",
          "__TSR_key",
          "__TSR_index",
          "__hashScrollIntoViewOptions"
        ];
        ignoredProps.forEach((prop) => {
          next.state[prop] = this.latestLocation.state[prop];
        });
        const isEqual = deepEqual(next.state, this.latestLocation.state);
        ignoredProps.forEach((prop) => {
          delete next.state[prop];
        });
        return isEqual;
      };
      const isSameUrl = trimPathRight(this.latestLocation.href) === trimPathRight(next.href);
      let previousCommitPromise = this.commitLocationPromise;
      this.commitLocationPromise = createControlledPromise(() => {
        previousCommitPromise?.resolve();
        previousCommitPromise = void 0;
      });
      if (isSameUrl && isSameState()) this.load();
      else {
        let { maskedLocation, hashScrollIntoView, ...nextHistory } = next;
        if (maskedLocation) {
          nextHistory = {
            ...maskedLocation,
            state: {
              ...maskedLocation.state,
              __tempKey: void 0,
              __tempLocation: {
                ...nextHistory,
                search: nextHistory.searchStr,
                state: {
                  ...nextHistory.state,
                  __tempKey: void 0,
                  __tempLocation: void 0,
                  __TSR_key: void 0,
                  key: void 0
                }
              }
            }
          };
          if (nextHistory.unmaskOnReload ?? this.options.unmaskOnReload ?? false) nextHistory.state.__tempKey = this.tempLocationKey;
        }
        nextHistory.state.__hashScrollIntoViewOptions = hashScrollIntoView ?? this.options.defaultHashScrollIntoView ?? true;
        this.shouldViewTransition = viewTransition;
        historyAction = next.replace ? "REPLACE" : "PUSH";
        this.history[historyAction === "REPLACE" ? "replace" : "push"](nextHistory.publicHref, nextHistory.state, { ignoreBlocker });
      }
      this._scroll.next = next.resetScroll ?? true;
      if (!this.history.subscribers.size) this.load(historyAction ? { action: { type: historyAction } } : void 0);
      return this.commitLocationPromise;
    };
    this.buildAndCommitLocation = ({ replace, resetScroll, hashScrollIntoView, viewTransition, ignoreBlocker, href, ...rest } = {}) => {
      if (href) {
        const currentIndex = this.history.location.state.__TSR_index;
        const parsed = parseHref(href, { __TSR_index: replace ? currentIndex : currentIndex + 1 });
        const hrefUrl = new URL(parsed.pathname, this.origin);
        rest.to = executeRewriteInput(this.rewrite, hrefUrl).pathname;
        rest.search = this.options.parseSearch(parsed.search);
        rest.hash = parsed.hash.slice(1);
      }
      const location = this.buildLocation({
        ...rest,
        _includeValidateSearch: true
      });
      this.pendingBuiltLocation = location;
      const commitPromise = this.commitLocation({
        ...location,
        viewTransition,
        replace,
        resetScroll,
        hashScrollIntoView,
        ignoreBlocker
      });
      Promise.resolve().then(() => {
        if (this.pendingBuiltLocation === location) this.pendingBuiltLocation = void 0;
      });
      return commitPromise;
    };
    this.navigate = async ({ to, reloadDocument, href, publicHref, ...rest }) => {
      let hrefIsUrl = false;
      if (href) try {
        new URL(`${href}`);
        hrefIsUrl = true;
      } catch {
      }
      if (hrefIsUrl && !reloadDocument) reloadDocument = true;
      if (reloadDocument) {
        if (to !== void 0 || !href) {
          const location = this.buildLocation({
            to,
            ...rest
          });
          href = href ?? location.publicHref;
          publicHref = publicHref ?? location.publicHref;
        }
        const reloadHref = !hrefIsUrl && publicHref ? publicHref : href;
        if (isDangerousProtocol(reloadHref, this.protocolAllowlist)) {
          return Promise.resolve();
        }
        if (!rest.ignoreBlocker) {
          const blockers = this.history.getBlockers?.() ?? [];
          for (const blocker of blockers) if (blocker?.blockerFn) {
            if (await blocker.blockerFn({
              currentLocation: this.latestLocation,
              nextLocation: this.latestLocation,
              action: "PUSH"
            })) return Promise.resolve();
          }
        }
        if (rest.replace) window.location.replace(reloadHref);
        else window.location.href = reloadHref;
        return Promise.resolve();
      }
      return this.buildAndCommitLocation({
        ...rest,
        href,
        to,
        _isNavigate: true
      });
    };
    this.beforeLoad = () => {
      this.cancelMatches();
      this.updateLatestLocation();
      {
        const nextLocation = this.buildLocation({
          to: this.latestLocation.pathname,
          search: true,
          params: true,
          hash: true,
          state: true,
          _includeValidateSearch: true
        });
        if (this.latestLocation.publicHref !== nextLocation.publicHref) {
          const href = this.getParsedLocationHref(nextLocation);
          if (nextLocation.external) throw redirect({ href });
          else throw redirect({
            href,
            _builtLocation: nextLocation
          });
        }
      }
      const pendingMatches = this.matchRoutes(this.latestLocation);
      const nextCachedMatches = this.stores.cachedMatches.get().filter((d) => !pendingMatches.some((e2) => e2.id === d.id));
      this.batch(() => {
        this.stores.status.set("pending");
        this.stores.statusCode.set(200);
        this.stores.isLoading.set(true);
        this.stores.location.set(this.latestLocation);
        this.stores.setPending(pendingMatches);
        this.stores.setCached(nextCachedMatches);
      });
    };
    this.load = async (opts) => {
      const historyAction = opts?.action?.type;
      let redirect2;
      let notFound2;
      let loadPromise;
      const previousLocation = this.stores.resolvedLocation.get() ?? this.stores.location.get();
      loadPromise = new Promise((resolve) => {
        this.startTransition(async () => {
          try {
            this.beforeLoad();
            if (historyAction) locationHistoryActions.set(this.latestLocation, historyAction);
            else locationHistoryActions.delete(this.latestLocation);
            const next = this.latestLocation;
            const locationChangeInfo = getLocationChangeInfo(next, this.stores.resolvedLocation.get());
            if (!this.stores.redirect.get()) this.emit({
              type: "onBeforeNavigate",
              ...locationChangeInfo
            });
            this.emit({
              type: "onBeforeLoad",
              ...locationChangeInfo
            });
            await loadMatches({
              router: this,
              sync: opts?.sync,
              forceStaleReload: previousLocation.href === next.href,
              matches: this.stores.pendingMatches.get(),
              location: next,
              updateMatch: this.updateMatch,
              onReady: async () => {
                this.startTransition(() => {
                  this.startViewTransition(async () => {
                    let exitingMatches = null;
                    let hookExitingMatches = null;
                    let hookEnteringMatches = null;
                    let hookStayingMatches = null;
                    this.batch(() => {
                      const pendingMatches = this.stores.pendingMatches.get();
                      const mountPending = pendingMatches.length;
                      const currentMatches = this.stores.matches.get();
                      exitingMatches = mountPending ? currentMatches.filter((match2) => !this.stores.pendingMatchStores.has(match2.id)) : null;
                      const pendingRouteIds = /* @__PURE__ */ new Set();
                      for (const s of this.stores.pendingMatchStores.values()) if (s.routeId) pendingRouteIds.add(s.routeId);
                      const activeRouteIds = /* @__PURE__ */ new Set();
                      for (const s of this.stores.matchStores.values()) if (s.routeId) activeRouteIds.add(s.routeId);
                      hookExitingMatches = mountPending ? currentMatches.filter((match2) => !pendingRouteIds.has(match2.routeId)) : null;
                      hookEnteringMatches = mountPending ? pendingMatches.filter((match2) => !activeRouteIds.has(match2.routeId)) : null;
                      hookStayingMatches = mountPending ? pendingMatches.filter((match2) => activeRouteIds.has(match2.routeId)) : currentMatches;
                      this.stores.isLoading.set(false);
                      this.stores.loadedAt.set(Date.now());
                      if (mountPending) {
                        this.stores.setMatches(pendingMatches);
                        this.stores.setPending([]);
                        this.stores.setCached([...this.stores.cachedMatches.get(), ...exitingMatches.filter((d) => d.status !== "error" && d.status !== "notFound" && d.status !== "redirected")]);
                        this.clearExpiredCache();
                      }
                    });
                    for (const [matches, hook] of [
                      [hookExitingMatches, "onLeave"],
                      [hookEnteringMatches, "onEnter"],
                      [hookStayingMatches, "onStay"]
                    ]) {
                      if (!matches) continue;
                      for (const match2 of matches) this.looseRoutesById[match2.routeId].options[hook]?.(match2);
                    }
                  });
                });
              }
            });
          } catch (err) {
            if (isRedirect(err)) {
              redirect2 = err;
            } else if (isNotFound(err)) notFound2 = err;
            const nextStatusCode = redirect2 ? redirect2.status : notFound2 ? 404 : this.stores.matches.get().some((d) => d.status === "error") ? 500 : 200;
            this.batch(() => {
              this.stores.statusCode.set(nextStatusCode);
              this.stores.redirect.set(redirect2);
            });
          }
          if (this.latestLoadPromise === loadPromise) {
            this.commitLocationPromise?.resolve();
            this.latestLoadPromise = void 0;
            this.commitLocationPromise = void 0;
          }
          resolve();
        });
      });
      this.latestLoadPromise = loadPromise;
      await loadPromise;
      while (this.latestLoadPromise && loadPromise !== this.latestLoadPromise) await this.latestLoadPromise;
      let newStatusCode = void 0;
      if (this.hasNotFoundMatch()) newStatusCode = 404;
      else if (this.stores.matches.get().some((d) => d.status === "error")) newStatusCode = 500;
      if (newStatusCode !== void 0) this.stores.statusCode.set(newStatusCode);
    };
    this.startViewTransition = (fn2) => {
      const shouldViewTransition = this.shouldViewTransition ?? this.options.defaultViewTransition;
      this.shouldViewTransition = void 0;
      if (shouldViewTransition && typeof document !== "undefined" && "startViewTransition" in document && typeof document.startViewTransition === "function") {
        let startViewTransitionParams;
        if (typeof shouldViewTransition === "object" && this.isViewTransitionTypesSupported) {
          const next = this.latestLocation;
          const prevLocation = this.stores.resolvedLocation.get();
          const resolvedViewTransitionTypes = typeof shouldViewTransition.types === "function" ? shouldViewTransition.types(getLocationChangeInfo(next, prevLocation)) : shouldViewTransition.types;
          if (resolvedViewTransitionTypes === false) {
            fn2();
            return;
          }
          startViewTransitionParams = {
            update: fn2,
            types: resolvedViewTransitionTypes
          };
        } else startViewTransitionParams = fn2;
        document.startViewTransition(startViewTransitionParams);
      } else fn2();
    };
    this.updateMatch = (id, updater) => {
      this.startTransition(() => {
        const pendingMatch = this.stores.pendingMatchStores.get(id);
        if (pendingMatch) {
          pendingMatch.set(updater);
          return;
        }
        const activeMatch = this.stores.matchStores.get(id);
        if (activeMatch) {
          activeMatch.set(updater);
          return;
        }
        const cachedMatch = this.stores.cachedMatchStores.get(id);
        if (cachedMatch) {
          const next = updater(cachedMatch.get());
          if (next.status === "redirected") {
            if (this.stores.cachedMatchStores.delete(id)) this.stores.cachedIds.set((prev) => prev.filter((matchId) => matchId !== id));
          } else cachedMatch.set(next);
        }
      });
    };
    this.getMatch = (matchId) => {
      return this.stores.cachedMatchStores.get(matchId)?.get() ?? this.stores.pendingMatchStores.get(matchId)?.get() ?? this.stores.matchStores.get(matchId)?.get();
    };
    this.invalidate = (opts) => {
      const invalidate = (d) => {
        if (opts?.filter?.(d) ?? true) return {
          ...d,
          invalid: true,
          ...opts?.forcePending || d.status === "error" || d.status === "notFound" ? {
            status: "pending",
            error: void 0
          } : void 0
        };
        return d;
      };
      this.batch(() => {
        this.stores.setMatches(this.stores.matches.get().map(invalidate));
        this.stores.setCached(this.stores.cachedMatches.get().map(invalidate));
        this.stores.setPending(this.stores.pendingMatches.get().map(invalidate));
      });
      this.shouldViewTransition = false;
      return this.load({ sync: opts?.sync });
    };
    this.getParsedLocationHref = (location) => {
      return location.publicHref || "/";
    };
    this.resolveRedirect = (redirect2) => {
      const locationHeader = redirect2.headers.get("Location");
      if (!redirect2.options.href || redirect2.options._builtLocation) {
        const location = redirect2.options._builtLocation ?? this.buildLocation(redirect2.options);
        const href = this.getParsedLocationHref(location);
        redirect2.options.href = href;
        redirect2.headers.set("Location", href);
      } else if (locationHeader) try {
        const url = new URL(locationHeader);
        if (this.origin && url.origin === this.origin) {
          const href = url.pathname + url.search + url.hash;
          redirect2.options.href = href;
          redirect2.headers.set("Location", href);
        }
      } catch {
      }
      if (redirect2.options.href && !redirect2.options._builtLocation && isDangerousProtocol(redirect2.options.href, this.protocolAllowlist)) throw new Error("Redirect blocked: unsafe protocol");
      if (!redirect2.headers.get("Location")) redirect2.headers.set("Location", redirect2.options.href);
      return redirect2;
    };
    this.clearCache = (opts) => {
      const filter = opts?.filter;
      if (filter !== void 0) this.stores.setCached(this.stores.cachedMatches.get().filter((m) => !filter(m)));
      else this.stores.setCached([]);
    };
    this.clearExpiredCache = () => {
      const now = Date.now();
      const filter = (d) => {
        const route = this.looseRoutesById[d.routeId];
        if (!route.options.loader) return true;
        const gcTime = (d.preload ? route.options.preloadGcTime ?? this.options.defaultPreloadGcTime : route.options.gcTime ?? this.options.defaultGcTime) ?? 300 * 1e3;
        if (d.status === "error") return true;
        return now - d.updatedAt >= gcTime;
      };
      this.clearCache({ filter });
    };
    this.loadRouteChunk = loadRouteChunk;
    this.preloadRoute = async (opts) => {
      const next = opts._builtLocation ?? this.buildLocation(opts);
      let matches = this.matchRoutes(next, {
        throwOnError: true,
        preload: true,
        dest: opts
      });
      const activeMatchIds = /* @__PURE__ */ new Set([...this.stores.matchesId.get(), ...this.stores.pendingIds.get()]);
      const loadedMatchIds = /* @__PURE__ */ new Set([...activeMatchIds, ...this.stores.cachedIds.get()]);
      const matchesToCache = matches.filter((match2) => !loadedMatchIds.has(match2.id));
      if (matchesToCache.length) {
        const cachedMatches = this.stores.cachedMatches.get();
        this.stores.setCached([...cachedMatches, ...matchesToCache]);
      }
      try {
        matches = await loadMatches({
          router: this,
          matches,
          location: next,
          preload: true,
          updateMatch: (id, updater) => {
            if (activeMatchIds.has(id)) matches = matches.map((d) => d.id === id ? updater(d) : d);
            else this.updateMatch(id, updater);
          }
        });
        return matches;
      } catch (err) {
        if (isRedirect(err)) {
          if (err.options.reloadDocument) return;
          return await this.preloadRoute({
            ...err.options,
            _fromLocation: next
          });
        }
        if (!isNotFound(err)) console.error(err);
        return;
      }
    };
    this.matchRoute = (location, opts) => {
      const matchLocation = {
        ...location,
        to: location.to ? this.resolvePathWithBase(location.from || "", location.to) : void 0,
        params: location.params || {},
        leaveParams: true
      };
      const next = this.buildLocation(matchLocation);
      if (opts?.pending && this.stores.status.get() !== "pending") return false;
      const baseLocation = (opts?.pending === void 0 ? !this.stores.isLoading.get() : opts.pending) ? this.latestLocation : this.stores.resolvedLocation.get() || this.stores.location.get();
      const match2 = findSingleMatch(next.pathname, opts?.caseSensitive ?? false, opts?.fuzzy ?? false, baseLocation.pathname, this.processedTree);
      if (!match2) return false;
      if (location.params) {
        if (!deepEqual(match2.rawParams, location.params, { partial: true })) return false;
      }
      if (opts?.includeSearch ?? true) return deepEqual(baseLocation.search, next.search, { partial: true }) ? match2.rawParams : false;
      return match2.rawParams;
    };
    this.hasNotFoundMatch = () => {
      return this.stores.matches.get().some((d) => d.status === "notFound" || d.globalNotFound);
    };
    this.getStoreConfig = getStoreConfig;
    this.update({
      defaultPreloadDelay: 50,
      defaultPendingMs: 1e3,
      defaultPendingMinMs: 500,
      context: void 0,
      ...options,
      caseSensitive: options.caseSensitive ?? false,
      notFoundMode: options.notFoundMode ?? "fuzzy",
      stringifySearch: options.stringifySearch ?? defaultStringifySearch,
      parseSearch: options.parseSearch ?? defaultParseSearch,
      protocolAllowlist: options.protocolAllowlist ?? DEFAULT_PROTOCOL_ALLOWLIST
    });
    if (typeof document !== "undefined") self.__TSR_ROUTER__ = this;
  }
  isShell() {
    return !!this.options.isShell;
  }
  isPrerendering() {
    return !!this.options.isPrerendering;
  }
  get state() {
    return this.stores.__store.get();
  }
  setRoutes({ routesById, routesByPath, processedTree }) {
    this.routesById = routesById;
    this.routesByPath = routesByPath;
    this.processedTree = processedTree;
    const notFoundRoute = this.options.notFoundRoute;
    if (notFoundRoute) {
      notFoundRoute.init({ originalIndex: 99999999999 });
      this.routesById[notFoundRoute.id] = notFoundRoute;
    }
  }
  getRouteBranch(route) {
    let branch = this.routeBranchCache.get(route);
    if (!branch) {
      branch = buildRouteBranch(route);
      this.routeBranchCache.set(route, branch);
    }
    return branch;
  }
  get looseRoutesById() {
    return this.routesById;
  }
  getParentContext(parentMatch) {
    return !parentMatch?.id ? this.options.context ?? void 0 : parentMatch.context ?? this.options.context ?? void 0;
  }
  matchRoutesInternal(next, opts) {
    const matchedRoutesResult = this.getMatchedRoutes(next.pathname);
    const { foundRoute, routeParams } = matchedRoutesResult;
    let { matchedRoutes } = matchedRoutesResult;
    let isGlobalNotFound = false;
    if (foundRoute ? foundRoute.path !== "/" && routeParams["**"] : trimPathRight(next.pathname)) if (this.options.notFoundRoute) matchedRoutes = [...matchedRoutes, this.options.notFoundRoute];
    else isGlobalNotFound = true;
    const globalNotFoundRouteId = isGlobalNotFound ? findGlobalNotFoundRouteId(this.options.notFoundMode, matchedRoutes) : void 0;
    const matches = new Array(matchedRoutes.length);
    const previousActiveMatchesByRouteId = /* @__PURE__ */ new Map();
    for (const store of this.stores.matchStores.values()) if (store.routeId) previousActiveMatchesByRouteId.set(store.routeId, store.get());
    for (let index = 0; index < matchedRoutes.length; index++) {
      const route = matchedRoutes[index];
      const parentMatch = matches[index - 1];
      let preMatchSearch;
      let strictMatchSearch;
      let searchError;
      {
        const parentSearch = parentMatch?.search ?? next.search;
        const parentStrictSearch = parentMatch?._strictSearch ?? void 0;
        try {
          const strictSearch = validateSearch(route.options.validateSearch, { ...parentSearch }) ?? void 0;
          preMatchSearch = {
            ...parentSearch,
            ...strictSearch
          };
          strictMatchSearch = {
            ...parentStrictSearch,
            ...strictSearch
          };
          searchError = void 0;
        } catch (err) {
          let searchParamError = err;
          if (!(err instanceof SearchParamError)) searchParamError = new SearchParamError(err.message, { cause: err });
          if (opts?.throwOnError) throw searchParamError;
          preMatchSearch = parentSearch;
          strictMatchSearch = {};
          searchError = searchParamError;
        }
      }
      const loaderDeps = route.options.loaderDeps?.({ search: preMatchSearch }) ?? "";
      const loaderDepsHash = loaderDeps ? JSON.stringify(loaderDeps) : "";
      const { interpolatedPath, usedParams } = interpolatePath({
        path: route.fullPath,
        params: routeParams,
        decoder: this.pathParamsDecoder,
        server: this.isServer
      });
      const matchId = route.id + interpolatedPath + loaderDepsHash;
      const existingMatch = this.getMatch(matchId);
      const previousMatch = previousActiveMatchesByRouteId.get(route.id);
      const strictParams = existingMatch?._strictParams ?? usedParams;
      let paramsError = void 0;
      if (!existingMatch) try {
        extractStrictParams(route, strictParams);
      } catch (err) {
        if (isNotFound(err) || isRedirect(err)) paramsError = err;
        else paramsError = new PathParamError(err.message, { cause: err });
        if (opts?.throwOnError) throw paramsError;
      }
      Object.assign(routeParams, strictParams);
      const cause = previousMatch ? "stay" : "enter";
      let match2;
      if (existingMatch) match2 = {
        ...existingMatch,
        cause,
        params: previousMatch?.params ?? routeParams,
        _strictParams: strictParams,
        search: previousMatch ? nullReplaceEqualDeep(previousMatch.search, preMatchSearch) : nullReplaceEqualDeep(existingMatch.search, preMatchSearch),
        _strictSearch: strictMatchSearch
      };
      else {
        const status = route.options.loader || route.options.beforeLoad || route.lazyFn || routeNeedsPreload(route) ? "pending" : "success";
        match2 = {
          id: matchId,
          ssr: void 0,
          index,
          routeId: route.id,
          params: previousMatch?.params ?? routeParams,
          _strictParams: strictParams,
          pathname: interpolatedPath,
          updatedAt: Date.now(),
          search: previousMatch ? nullReplaceEqualDeep(previousMatch.search, preMatchSearch) : preMatchSearch,
          _strictSearch: strictMatchSearch,
          searchError: void 0,
          status,
          isFetching: false,
          error: void 0,
          paramsError,
          __routeContext: void 0,
          _nonReactive: { loadPromise: createControlledPromise() },
          __beforeLoadContext: void 0,
          context: {},
          abortController: new AbortController(),
          fetchCount: 0,
          cause,
          loaderDeps: previousMatch ? replaceEqualDeep(previousMatch.loaderDeps, loaderDeps) : loaderDeps,
          invalid: false,
          preload: false,
          links: void 0,
          scripts: void 0,
          headScripts: void 0,
          meta: void 0,
          staticData: route.options.staticData || {},
          fullPath: route.fullPath
        };
      }
      if (!opts?.preload) match2.globalNotFound = globalNotFoundRouteId === route.id;
      match2.searchError = searchError;
      const parentContext = this.getParentContext(parentMatch);
      match2.context = {
        ...parentContext,
        ...match2.__routeContext,
        ...match2.__beforeLoadContext
      };
      matches[index] = match2;
    }
    for (let index = 0; index < matches.length; index++) {
      const match2 = matches[index];
      const route = this.looseRoutesById[match2.routeId];
      const existingMatch = this.getMatch(match2.id);
      const previousMatch = previousActiveMatchesByRouteId.get(match2.routeId);
      match2.params = previousMatch ? nullReplaceEqualDeep(previousMatch.params, routeParams) : routeParams;
      if (!existingMatch) {
        const parentMatch = matches[index - 1];
        const parentContext = this.getParentContext(parentMatch);
        if (route.options.context) {
          const contextFnContext = {
            deps: match2.loaderDeps,
            params: match2.params,
            context: parentContext ?? {},
            location: next,
            navigate: (opts2) => this.navigate({
              ...opts2,
              _fromLocation: next
            }),
            buildLocation: this.buildLocation,
            cause: match2.cause,
            abortController: match2.abortController,
            preload: !!match2.preload,
            matches,
            routeId: route.id
          };
          match2.__routeContext = route.options.context(contextFnContext) ?? void 0;
        }
        match2.context = {
          ...parentContext,
          ...match2.__routeContext,
          ...match2.__beforeLoadContext
        };
      }
    }
    return matches;
  }
  /**
  * Lightweight route matching for buildLocation.
  * Only computes fullPath, accumulated search, and params - skipping expensive
  * operations like AbortController, ControlledPromise, loaderDeps, and full match objects.
  */
  matchRoutesLightweight(location) {
    const { matchedRoutes, routeParams } = this.getMatchedRoutes(location.pathname);
    const lastRoute = last(matchedRoutes);
    const accumulatedSearch = { ...location.search };
    for (const route of matchedRoutes) try {
      Object.assign(accumulatedSearch, validateSearch(route.options.validateSearch, accumulatedSearch));
    } catch {
    }
    const lastStateMatchId = last(this.stores.matchesId.get());
    const lastStateMatch = lastStateMatchId && this.stores.matchStores.get(lastStateMatchId)?.get();
    const canReuseParams = lastStateMatch && lastStateMatch.routeId === lastRoute.id && lastStateMatch.pathname === location.pathname;
    let params;
    if (canReuseParams) params = lastStateMatch.params;
    else {
      const strictParams = Object.assign(/* @__PURE__ */ Object.create(null), routeParams);
      for (const route of matchedRoutes) try {
        extractStrictParams(route, strictParams);
      } catch {
      }
      params = strictParams;
    }
    return {
      matchedRoutes,
      fullPath: lastRoute.fullPath,
      search: accumulatedSearch,
      params
    };
  }
};
var SearchParamError = class extends Error {
};
var PathParamError = class extends Error {
};
function getInitialRouterState(location) {
  return {
    loadedAt: 0,
    isLoading: false,
    isTransitioning: false,
    status: "idle",
    resolvedLocation: void 0,
    location,
    matches: [],
    statusCode: 200
  };
}
function validateSearch(validateSearch2, input) {
  if (validateSearch2 == null) return {};
  if ("~standard" in validateSearch2) {
    const result = validateSearch2["~standard"].validate(input);
    if (result instanceof Promise) throw new SearchParamError("Async validation not supported");
    if (result.issues) throw new SearchParamError(JSON.stringify(result.issues, void 0, 2), { cause: result });
    return result.value;
  }
  if ("parse" in validateSearch2) return validateSearch2.parse(input);
  if (typeof validateSearch2 === "function") return validateSearch2(input);
  return {};
}
function getMatchedRoutes({ pathname, routesById, processedTree }) {
  const routeParams = /* @__PURE__ */ Object.create(null);
  const trimmedPath = trimPathRight(pathname);
  let foundRoute = void 0;
  const match2 = findRouteMatch(trimmedPath, processedTree, true);
  if (match2) {
    foundRoute = match2.route;
    Object.assign(routeParams, match2.rawParams);
  }
  return {
    matchedRoutes: match2?.branch || [routesById["__root__"]],
    routeParams,
    foundRoute
  };
}
function applySearchMiddleware({ search, dest, destRoutes, _includeValidateSearch }) {
  return buildMiddlewareChain(destRoutes)(search, dest, _includeValidateSearch ?? false);
}
function buildMiddlewareChain(destRoutes) {
  let dest;
  let includeValidateSearch;
  const middlewares = [];
  for (const route of destRoutes) {
    const routeOptions = route.options;
    if ("search" in routeOptions) {
      if (routeOptions.search?.middlewares) middlewares.push(...routeOptions.search.middlewares);
    } else if (routeOptions.preSearchFilters || routeOptions.postSearchFilters) {
      const legacyMiddleware = ({ search, next }) => {
        const result = next(routeOptions.preSearchFilters ? routeOptions.preSearchFilters.reduce((prev, next2) => next2(prev), search) : search);
        return routeOptions.postSearchFilters ? routeOptions.postSearchFilters.reduce((prev, next2) => next2(prev), result) : result;
      };
      middlewares.push(legacyMiddleware);
    }
    const routeValidateSearch = routeOptions.validateSearch;
    if (routeValidateSearch) {
      const validate = ({ search, next, meta }) => {
        const result = next(search);
        if (includeValidateSearch) try {
          const validated = validateSearch(routeValidateSearch, result);
          if (meta && validated) {
            for (const key in validated) if (!(key in result)) (meta.defaulted ||= /* @__PURE__ */ new Map()).set(key, validated[key]);
          }
          return {
            ...result,
            ...validated
          };
        } catch {
        }
        return result;
      };
      middlewares.push(validate);
    }
  }
  const applyNext = (index, currentSearch, meta) => {
    if (index >= middlewares.length) {
      if (!dest.search) return {};
      if (dest.search === true) return currentSearch;
      const result = functionalUpdate(dest.search, currentSearch);
      if (meta) meta.explicit = result;
      return result;
    }
    const next = (newSearch, collectMeta) => {
      if (collectMeta) {
        const nextMeta = meta || {};
        return {
          search: applyNext(index + 1, newSearch, nextMeta),
          meta: nextMeta
        };
      }
      return applyNext(index + 1, newSearch, meta);
    };
    return middlewares[index]({
      search: currentSearch,
      next,
      meta
    });
  };
  return function middleware(search, nextDest, _includeValidateSearch) {
    dest = nextDest;
    includeValidateSearch = _includeValidateSearch;
    return applyNext(0, search);
  };
}
function findGlobalNotFoundRouteId(notFoundMode, routes) {
  if (notFoundMode !== "root") for (let i = routes.length - 1; i >= 0; i--) {
    const route = routes[i];
    if (route.children) return route.id;
  }
  return rootRouteId;
}
function extractStrictParams(route, accumulatedParams) {
  const parseParams = route.options.params?.parse ?? route.options.parseParams;
  if (parseParams) {
    const result = parseParams(accumulatedParams);
    if (result === false) throw new Error("Route params.parse returned false for a matched route");
    Object.assign(accumulatedParams, result);
  }
}
var BaseRoute = class {
  get to() {
    return this._to;
  }
  get id() {
    return this._id;
  }
  get path() {
    return this._path;
  }
  get fullPath() {
    return this._fullPath;
  }
  constructor(options) {
    this.init = (opts) => {
      this.originalIndex = opts.originalIndex;
      const options2 = this.options;
      const isRoot = !options2?.path && !options2?.id;
      this.parentRoute = this.options.getParentRoute?.();
      if (isRoot) this._path = rootRouteId;
      else if (!this.parentRoute) {
        invariant();
      }
      let path = isRoot ? rootRouteId : options2?.path;
      if (path && path !== "/") path = trimPathLeft(path);
      const customId = options2?.id || path;
      let id = isRoot ? rootRouteId : joinPaths([this.parentRoute.id === "__root__" ? "" : this.parentRoute.id, customId]);
      if (path === "__root__") path = "/";
      if (id !== "__root__") id = joinPaths(["/", id]);
      const fullPath = id === "__root__" ? "/" : joinPaths([this.parentRoute.fullPath, path]);
      this._path = path;
      this._id = id;
      this._fullPath = fullPath;
      this._to = trimPathRight(fullPath);
    };
    this.addChildren = (children) => {
      return this._addFileChildren(children);
    };
    this._addFileChildren = (children) => {
      if (Array.isArray(children)) this.children = children;
      if (typeof children === "object" && children !== null) this.children = Object.values(children);
      return this;
    };
    this._addFileTypes = () => {
      return this;
    };
    this.updateLoader = (options2) => {
      Object.assign(this.options, options2);
      return this;
    };
    this.update = (options2) => {
      Object.assign(this.options, options2);
      return this;
    };
    this.lazy = (lazyFn) => {
      this.lazyFn = lazyFn;
      return this;
    };
    this.redirect = (opts) => redirect({
      from: this.fullPath,
      ...opts
    });
    this.options = options || {};
    this.isRoot = !options?.getParentRoute;
    if (options?.id && options?.path) throw new Error(`Route cannot have both an 'id' and a 'path' option.`);
  }
};
var BaseRootRoute = class extends BaseRoute {
  constructor(options) {
    super(options);
  }
};
function useLoaderData(opts) {
  return useMatch({
    from: opts.from,
    strict: opts.strict,
    structuralSharing: opts.structuralSharing,
    select: (match2) => {
      return opts.select ? opts.select(match2.loaderData) : match2.loaderData;
    }
  });
}
function useLoaderDeps(opts) {
  const { select, ...rest } = opts;
  return useMatch({
    ...rest,
    select: (match2) => {
      return select ? select(match2.loaderDeps) : match2.loaderDeps;
    }
  });
}
function useSearch(opts) {
  return useMatch({
    from: opts.from,
    strict: opts.strict,
    shouldThrow: opts.shouldThrow,
    structuralSharing: opts.structuralSharing,
    select: (match2) => {
      return opts.select ? opts.select(match2.search) : match2.search;
    }
  });
}
function useNavigate(_defaultOpts) {
  const router2 = useRouter();
  return reactExports.useCallback((options) => {
    return router2.navigate({
      ...options,
      from: options.from ?? _defaultOpts?.from
    });
  }, [_defaultOpts?.from, router2]);
}
function useRouteContext(opts) {
  return useMatch({
    ...opts,
    select: (match2) => opts.select ? opts.select(match2.context) : match2.context
  });
}
function useLinkProps(options, forwardedRef) {
  const router2 = useRouter();
  const innerRef = useForwardedRef(forwardedRef);
  const { activeProps, inactiveProps, activeOptions, to, preload: userPreload, preloadDelay: userPreloadDelay, preloadIntentProximity: _preloadIntentProximity, hashScrollIntoView, replace, startTransition, resetScroll, viewTransition, children, target, disabled, style, className, onClick, onBlur, onFocus, onMouseEnter, onMouseLeave, onTouchStart, ignoreBlocker, params: _params, search: _search, hash: _hash, state: _state, mask: _mask, reloadDocument: _reloadDocument, unsafeRelative: _unsafeRelative, from: _from, _fromLocation, ...propsSafeToSpread } = options;
  {
    const safeInternal = isSafeInternal(to);
    if (typeof to === "string" && !safeInternal && to.indexOf(":") > -1) try {
      new URL(to);
      if (isDangerousProtocol(to, router2.protocolAllowlist)) {
        if (false) ;
        return {
          ...propsSafeToSpread,
          ref: innerRef,
          href: void 0,
          ...children && { children },
          ...target && { target },
          ...disabled && { disabled },
          ...style && { style },
          ...className && { className }
        };
      }
      return {
        ...propsSafeToSpread,
        ref: innerRef,
        href: to,
        ...children && { children },
        ...target && { target },
        ...disabled && { disabled },
        ...style && { style },
        ...className && { className }
      };
    } catch {
    }
    const next2 = router2.buildLocation({
      ...options,
      from: options.from
    });
    const hrefOption2 = getHrefOption(next2.maskedLocation ? next2.maskedLocation.publicHref : next2.publicHref, next2.maskedLocation ? next2.maskedLocation.external : next2.external, router2.history, disabled);
    const externalLink2 = (() => {
      if (hrefOption2?.external) {
        if (isDangerousProtocol(hrefOption2.href, router2.protocolAllowlist)) {
          return;
        }
        return hrefOption2.href;
      }
      if (safeInternal) return void 0;
      if (typeof to === "string" && to.indexOf(":") > -1) try {
        new URL(to);
        if (isDangerousProtocol(to, router2.protocolAllowlist)) {
          if (false) ;
          return;
        }
        return to;
      } catch {
      }
    })();
    const isActive2 = (() => {
      if (externalLink2) return false;
      const currentLocation2 = router2.stores.location.get();
      const exact = activeOptions?.exact ?? false;
      if (exact) {
        if (!exactPathTest(currentLocation2.pathname, next2.pathname, router2.basepath)) return false;
      } else {
        const currentPathSplit = removeTrailingSlash(currentLocation2.pathname, router2.basepath);
        const nextPathSplit = removeTrailingSlash(next2.pathname, router2.basepath);
        if (!(currentPathSplit.startsWith(nextPathSplit) && (currentPathSplit.length === nextPathSplit.length || currentPathSplit[nextPathSplit.length] === "/"))) return false;
      }
      if (activeOptions?.includeSearch ?? true) {
        if (currentLocation2.search !== next2.search) {
          const currentSearchEmpty = !currentLocation2.search || typeof currentLocation2.search === "object" && !hasKeys(currentLocation2.search);
          const nextSearchEmpty = !next2.search || typeof next2.search === "object" && !hasKeys(next2.search);
          if (!(currentSearchEmpty && nextSearchEmpty)) {
            if (!deepEqual(currentLocation2.search, next2.search, {
              partial: !exact,
              ignoreUndefined: !activeOptions?.explicitUndefined
            })) return false;
          }
        }
      }
      if (activeOptions?.includeHash) return false;
      return true;
    })();
    if (externalLink2) return {
      ...propsSafeToSpread,
      ref: innerRef,
      href: externalLink2,
      ...children && { children },
      ...target && { target },
      ...disabled && { disabled },
      ...style && { style },
      ...className && { className }
    };
    const resolvedActiveProps2 = isActive2 ? functionalUpdate(activeProps, {}) ?? STATIC_ACTIVE_OBJECT : STATIC_EMPTY_OBJECT;
    const resolvedInactiveProps2 = isActive2 ? STATIC_EMPTY_OBJECT : functionalUpdate(inactiveProps, {}) ?? STATIC_EMPTY_OBJECT;
    const resolvedStyle2 = (() => {
      const baseStyle = style;
      const activeStyle = resolvedActiveProps2.style;
      const inactiveStyle = resolvedInactiveProps2.style;
      if (!baseStyle && !activeStyle && !inactiveStyle) return;
      if (baseStyle && !activeStyle && !inactiveStyle) return baseStyle;
      if (!baseStyle && activeStyle && !inactiveStyle) return activeStyle;
      if (!baseStyle && !activeStyle && inactiveStyle) return inactiveStyle;
      return {
        ...baseStyle,
        ...activeStyle,
        ...inactiveStyle
      };
    })();
    const resolvedClassName2 = (() => {
      const baseClassName = className;
      const activeClassName = resolvedActiveProps2.className;
      const inactiveClassName = resolvedInactiveProps2.className;
      if (!baseClassName && !activeClassName && !inactiveClassName) return "";
      let out = "";
      if (baseClassName) out = baseClassName;
      if (activeClassName) out = out ? `${out} ${activeClassName}` : activeClassName;
      if (inactiveClassName) out = out ? `${out} ${inactiveClassName}` : inactiveClassName;
      return out;
    })();
    return {
      ...propsSafeToSpread,
      ...resolvedActiveProps2,
      ...resolvedInactiveProps2,
      href: hrefOption2?.href,
      ref: innerRef,
      disabled: !!disabled,
      target,
      ...resolvedStyle2 && { style: resolvedStyle2 },
      ...resolvedClassName2 && { className: resolvedClassName2 },
      ...disabled && STATIC_DISABLED_PROPS,
      ...isActive2 && STATIC_ACTIVE_PROPS
    };
  }
}
var STATIC_EMPTY_OBJECT = {};
var STATIC_ACTIVE_OBJECT = { className: "active" };
var STATIC_DISABLED_PROPS = {
  role: "link",
  "aria-disabled": true
};
var STATIC_ACTIVE_PROPS = {
  "data-status": "active",
  "aria-current": "page"
};
function getHrefOption(publicHref, external, history, disabled) {
  if (disabled) return void 0;
  if (external) return {
    href: publicHref,
    external: true
  };
  return {
    href: history.createHref(publicHref) || "/",
    external: false
  };
}
function isSafeInternal(to) {
  if (typeof to !== "string") return false;
  const zero = to.charCodeAt(0);
  if (zero === 47) return to.charCodeAt(1) !== 47;
  return zero === 46;
}
function createLink(Comp) {
  return reactExports.forwardRef(function CreatedLink(props, ref) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Link, {
      ...props,
      _asChild: Comp,
      ref
    });
  });
}
var Link = reactExports.forwardRef((props, ref) => {
  const { _asChild, ...rest } = props;
  const { type: _type, ...linkProps } = useLinkProps(rest, ref);
  const children = typeof rest.children === "function" ? rest.children({ isActive: linkProps["data-status"] === "active" }) : rest.children;
  if (!_asChild) {
    const { disabled: _, ...rest2 } = linkProps;
    return reactExports.createElement("a", rest2, children);
  }
  return reactExports.createElement(_asChild, linkProps, children);
});
var Route$1L = class Route extends BaseRoute {
  /**
  * @deprecated Use the `createRoute` function instead.
  */
  constructor(options) {
    super(options);
    this.useMatch = (opts) => {
      return useMatch({
        select: opts?.select,
        from: this.id,
        structuralSharing: opts?.structuralSharing
      });
    };
    this.useRouteContext = (opts) => {
      return useRouteContext({
        ...opts,
        from: this.id
      });
    };
    this.useSearch = (opts) => {
      return useSearch({
        select: opts?.select,
        structuralSharing: opts?.structuralSharing,
        from: this.id
      });
    };
    this.useParams = (opts) => {
      return useParams({
        select: opts?.select,
        structuralSharing: opts?.structuralSharing,
        from: this.id
      });
    };
    this.useLoaderDeps = (opts) => {
      return useLoaderDeps({
        ...opts,
        from: this.id
      });
    };
    this.useLoaderData = (opts) => {
      return useLoaderData({
        ...opts,
        from: this.id
      });
    };
    this.useNavigate = () => {
      return useNavigate({ from: this.fullPath });
    };
    this.Link = React.forwardRef((props, ref) => {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Link, {
        ref,
        from: this.fullPath,
        ...props
      });
    });
  }
};
function createRoute(options) {
  return new Route$1L(options);
}
function createRootRouteWithContext() {
  return (options) => {
    return createRootRoute(options);
  };
}
var RootRoute = class extends BaseRootRoute {
  /**
  * @deprecated `RootRoute` is now an internal implementation detail. Use `createRootRoute()` instead.
  */
  constructor(options) {
    super(options);
    this.useMatch = (opts) => {
      return useMatch({
        select: opts?.select,
        from: this.id,
        structuralSharing: opts?.structuralSharing
      });
    };
    this.useRouteContext = (opts) => {
      return useRouteContext({
        ...opts,
        from: this.id
      });
    };
    this.useSearch = (opts) => {
      return useSearch({
        select: opts?.select,
        structuralSharing: opts?.structuralSharing,
        from: this.id
      });
    };
    this.useParams = (opts) => {
      return useParams({
        select: opts?.select,
        structuralSharing: opts?.structuralSharing,
        from: this.id
      });
    };
    this.useLoaderDeps = (opts) => {
      return useLoaderDeps({
        ...opts,
        from: this.id
      });
    };
    this.useLoaderData = (opts) => {
      return useLoaderData({
        ...opts,
        from: this.id
      });
    };
    this.useNavigate = () => {
      return useNavigate({ from: this.fullPath });
    };
    this.Link = React.forwardRef((props, ref) => {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Link, {
        ref,
        from: this.fullPath,
        ...props
      });
    });
  }
};
function createRootRoute(options) {
  return new RootRoute(options);
}
function createFileRoute(path) {
  return new FileRoute(path, { silent: true }).createRoute;
}
var FileRoute = class {
  constructor(path, _opts) {
    this.path = path;
    this.createRoute = (options) => {
      const route = createRoute(options);
      route.isRoot = false;
      return route;
    };
    this.silent = _opts?.silent;
  }
};
function lazyRouteComponent(importer, exportName) {
  let loadPromise;
  let comp;
  let error;
  let reload;
  const load = () => {
    if (!loadPromise) loadPromise = importer().then((res) => {
      loadPromise = void 0;
      comp = res[exportName ?? "default"];
    }).catch((err) => {
      error = err;
      if (isModuleNotFoundError(error)) {
        if (error instanceof Error && typeof window !== "undefined" && typeof sessionStorage !== "undefined") {
          const storageKey = `tanstack_router_reload:${error.message}`;
          if (!sessionStorage.getItem(storageKey)) {
            sessionStorage.setItem(storageKey, "1");
            reload = true;
          }
        }
      }
    });
    return loadPromise;
  };
  const lazyComp = function Lazy(props) {
    if (reload) {
      window.location.reload();
      throw new Promise(() => {
      });
    }
    if (error) throw error;
    if (!comp) if (reactUse) reactUse(load());
    else throw load();
    return reactExports.createElement(comp, props);
  };
  lazyComp.preload = load;
  return lazyComp;
}
var getStoreFactory = (opts) => {
  return {
    createMutableStore: createNonReactiveMutableStore,
    createReadonlyStore: createNonReactiveReadonlyStore,
    batch: (fn2) => fn2()
  };
};
var createRouter = (options) => {
  return new Router(options);
};
var Router = class extends RouterCore {
  constructor(options) {
    super(options, getStoreFactory);
  }
};
function useLocation(opts) {
  const router2 = useRouter();
  {
    const location = router2.stores.location.get();
    return location;
  }
}
function useCanGoBack() {
  const router2 = useRouter();
  return router2.stores.location.get().state.__TSR_index !== 0;
}
var noopScriptHandler = () => {
};
function setScriptAttrs(script, attrs) {
  if (!attrs) return;
  for (const [key, value] of Object.entries(attrs)) if (key !== "suppressHydrationWarning" && value !== void 0 && value !== false) script.setAttribute(key, typeof value === "boolean" ? "" : String(value));
}
function Asset(asset) {
  const { attrs, children, nonce, preventScriptHoist } = asset;
  switch (asset.tag) {
    case "title":
      return /* @__PURE__ */ jsxRuntimeExports.jsx("title", {
        ...attrs,
        suppressHydrationWarning: true,
        children
      });
    case "meta":
      return /* @__PURE__ */ jsxRuntimeExports.jsx("meta", {
        ...attrs,
        suppressHydrationWarning: true
      });
    case "link":
      return /* @__PURE__ */ jsxRuntimeExports.jsx("link", {
        ...attrs,
        precedence: attrs?.precedence ?? (attrs?.rel === "stylesheet" ? "default" : void 0),
        nonce,
        suppressHydrationWarning: true
      });
    case "style":
      if (asset.inlineCss && false) ;
      return /* @__PURE__ */ jsxRuntimeExports.jsx("style", {
        ...attrs,
        dangerouslySetInnerHTML: { __html: children },
        nonce
      });
    case "script":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Script, {
        attrs,
        preventScriptHoist,
        children
      });
    default:
      return null;
  }
}
function Script({ attrs, children, preventScriptHoist }) {
  useRouter();
  useHydrated();
  const dataScript = typeof attrs?.type === "string" && attrs.type !== "" && attrs.type !== "text/javascript" && attrs.type !== "module";
  reactExports.useEffect(() => {
    if (dataScript) return;
    if (attrs?.src) {
      const normSrc = (() => {
        try {
          const base = document.baseURI || window.location.href;
          return new URL(attrs.src, base).href;
        } catch {
          return attrs.src;
        }
      })();
      for (const el of document.querySelectorAll("script[src]")) if (el.src === normSrc) return;
      const script = document.createElement("script");
      setScriptAttrs(script, attrs);
      document.head.appendChild(script);
      return () => script.remove();
    }
    if (typeof children === "string") {
      const typeAttr = typeof attrs?.type === "string" ? attrs.type : "text/javascript";
      const nonceAttr = typeof attrs?.nonce === "string" ? attrs.nonce : void 0;
      for (const el of document.querySelectorAll("script:not([src])")) {
        if (!(el instanceof HTMLScriptElement)) continue;
        const sType = el.getAttribute("type") ?? "text/javascript";
        const sNonce = el.getAttribute("nonce") ?? void 0;
        if (el.textContent === children && sType === typeAttr && sNonce === nonceAttr) return;
      }
      const script = document.createElement("script");
      script.textContent = children;
      setScriptAttrs(script, attrs);
      document.head.appendChild(script);
      return () => script.remove();
    }
  }, [
    attrs,
    children,
    dataScript
  ]);
  {
    if (attrs?.src) {
      if (!preventScriptHoist) return /* @__PURE__ */ jsxRuntimeExports.jsx("script", {
        ...attrs,
        suppressHydrationWarning: true
      });
      return /* @__PURE__ */ jsxRuntimeExports.jsx("script", {
        ...attrs,
        onLoad: noopScriptHandler,
        suppressHydrationWarning: true
      });
    }
    if (typeof children === "string") return /* @__PURE__ */ jsxRuntimeExports.jsx("script", {
      ...attrs,
      dangerouslySetInnerHTML: { __html: children },
      suppressHydrationWarning: true
    });
    return null;
  }
}
function buildTagsFromMatches(router2, nonce, matches, assetCrossOrigin) {
  const routeMeta = matches.map((match2) => match2.meta).filter((meta) => meta !== void 0);
  const resultMeta = [];
  const metaByAttribute = {};
  let title;
  for (let i = routeMeta.length - 1; i >= 0; i--) {
    const metas = routeMeta[i];
    for (let j = metas.length - 1; j >= 0; j--) {
      const m = metas[j];
      if (!m) continue;
      if (m.title) {
        if (!title) title = {
          tag: "title",
          children: m.title
        };
      } else if ("script:ld+json" in m) try {
        const json = JSON.stringify(m["script:ld+json"]);
        resultMeta.push({
          tag: "script",
          attrs: { type: "application/ld+json" },
          children: escapeHtml(json)
        });
      } catch {
      }
      else {
        const attribute = m.name ?? m.property;
        if (attribute) if (metaByAttribute[attribute]) continue;
        else metaByAttribute[attribute] = true;
        resultMeta.push({
          tag: "meta",
          attrs: {
            ...m,
            nonce
          }
        });
      }
    }
  }
  if (title) resultMeta.push(title);
  if (nonce) resultMeta.push({
    tag: "meta",
    attrs: {
      property: "csp-nonce",
      content: nonce
    }
  });
  resultMeta.reverse();
  const constructedLinks = matches.flatMap((match2) => match2.links ?? []).filter((link) => link !== void 0).map((link) => ({
    tag: "link",
    attrs: {
      ...link,
      nonce
    }
  }));
  const manifest = router2.ssr?.manifest;
  const manifestCssTags = [];
  if (manifest) {
    matches.forEach((match2) => {
      manifest.routes[match2.routeId]?.css?.forEach((link) => {
        const resolvedLink = resolveManifestCssLink(link);
        manifestCssTags.push({
          tag: "link",
          attrs: {
            rel: "stylesheet",
            ...resolvedLink,
            crossOrigin: getAssetCrossOrigin(assetCrossOrigin, "stylesheet") ?? resolvedLink.crossOrigin,
            suppressHydrationWarning: true,
            nonce
          }
        });
      });
    });
    if (manifest.inlineStyle) manifestCssTags.push({
      tag: "style",
      attrs: {
        ...manifest.inlineStyle.attrs,
        nonce
      },
      children: manifest.inlineStyle.children,
      inlineCss: true
    });
  }
  const preloadLinks = [];
  if (manifest) matches.forEach((match2) => {
    manifest.routes[match2.routeId]?.preloads?.forEach((preload) => {
      preloadLinks.push({
        tag: "link",
        attrs: {
          ...getScriptPreloadAttrs(manifest, preload, assetCrossOrigin),
          nonce
        }
      });
    });
  });
  const styles = matches.flatMap((match2) => match2.styles ?? []).filter((style) => style !== void 0).map(({ children, ...attrs }) => ({
    tag: "style",
    attrs: {
      ...attrs,
      nonce
    },
    children
  }));
  const headScripts = matches.flatMap((match2) => match2.headScripts ?? []).filter((script) => script !== void 0).map(({ children, ...script }) => ({
    tag: "script",
    attrs: {
      ...script,
      nonce
    },
    children
  }));
  const tags = [];
  appendUniqueUserTags(tags, resultMeta);
  tags.push(...preloadLinks);
  appendUniqueUserTags(tags, constructedLinks);
  tags.push(...manifestCssTags);
  appendUniqueUserTags(tags, styles);
  appendUniqueUserTags(tags, headScripts);
  return tags;
}
var useTags = (assetCrossOrigin) => {
  const router2 = useRouter();
  const nonce = router2.options.ssr?.nonce;
  return buildTagsFromMatches(router2, nonce, router2.stores.matches.get(), assetCrossOrigin);
};
function HeadContent(props) {
  const tags = useTags(props.assetCrossOrigin);
  const nonce = useRouter().options.ssr?.nonce;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: tags.map((tag) => /* @__PURE__ */ reactExports.createElement(Asset, {
    ...tag,
    key: `tsr-meta-${JSON.stringify(tag)}`,
    nonce
  })) });
}
var Scripts = () => {
  const router2 = useRouter();
  const nonce = router2.options.ssr?.nonce;
  const getAssetScripts = (matches) => {
    const assetScripts = [];
    const manifest = router2.ssr?.manifest;
    if (!manifest) return [];
    for (const match2 of matches) {
      const scripts = manifest.routes[match2.routeId]?.scripts;
      if (!scripts) continue;
      for (const asset of scripts) assetScripts.push({
        tag: "script",
        attrs: {
          ...asset.attrs,
          nonce
        },
        children: asset.children,
        ...typeof asset.attrs?.src === "string" ? { preventScriptHoist: true } : {}
      });
    }
    return assetScripts;
  };
  const getScripts = (matches) => matches.map((match2) => match2.scripts).flat(1).filter(Boolean).map(({ children, ...script }) => ({
    tag: "script",
    attrs: {
      ...script,
      suppressHydrationWarning: true,
      nonce
    },
    children
  }));
  {
    const activeMatches = router2.stores.matches.get();
    const assetScripts = getAssetScripts(activeMatches);
    return renderScripts(router2, getScripts(activeMatches), assetScripts);
  }
};
function renderScripts(router2, scripts, assetScripts) {
  const allScripts = [...scripts, ...assetScripts];
  if (router2.serverSsr) {
    const serverBufferedScript = router2.serverSsr.takeBufferedScripts();
    if (serverBufferedScript) allScripts.unshift(serverBufferedScript);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: allScripts.map((asset, i) => /* @__PURE__ */ reactExports.createElement(Asset, {
    ...asset,
    key: `tsr-scripts-${asset.tag}-${i}`
  })) });
}
function t(...t2) {
  return t$1(n, t2);
}
const n = (e2, t2) => [...e2, ...t2];
function e(e2) {
  return e2 === `` || e2 === void 0 ? true : Array.isArray(e2) ? e2.length === 0 : Object.keys(e2).length === 0;
}
function I18nextProvider({
  i18n,
  defaultNS,
  children
}) {
  const value = reactExports.useMemo(() => ({
    i18n,
    defaultNS
  }), [i18n, defaultNS]);
  return reactExports.createElement(I18nContext.Provider, {
    value
  }, children);
}
function defaultTransformerFn(data) {
  return data;
}
function dehydrateMutation(mutation) {
  return {
    mutationKey: mutation.options.mutationKey,
    state: mutation.state,
    ...mutation.options.scope && { scope: mutation.options.scope },
    ...mutation.meta && { meta: mutation.meta }
  };
}
function dehydrateQuery(query, serializeData, shouldRedactErrors) {
  const dehydratePromise = () => {
    const promise = query.promise?.then(serializeData).catch((error) => {
      if (!shouldRedactErrors(error)) {
        return Promise.reject(error);
      }
      return Promise.reject(new Error("redacted"));
    });
    promise?.catch(noop);
    return promise;
  };
  return {
    dehydratedAt: Date.now(),
    state: {
      ...query.state,
      ...query.state.data !== void 0 && {
        data: serializeData(query.state.data)
      }
    },
    queryKey: query.queryKey,
    queryHash: query.queryHash,
    ...query.state.status === "pending" && {
      promise: dehydratePromise()
    },
    ...query.meta && { meta: query.meta },
    ...query.queryType && { queryType: query.queryType }
  };
}
function defaultShouldDehydrateMutation(mutation) {
  return mutation.state.isPaused;
}
function defaultShouldDehydrateQuery(query) {
  return query.state.status === "success";
}
function defaultShouldRedactErrors(_) {
  return true;
}
function dehydrate(client, options = {}) {
  const filterMutation = options.shouldDehydrateMutation ?? client.getDefaultOptions().dehydrate?.shouldDehydrateMutation ?? defaultShouldDehydrateMutation;
  const mutations = client.getMutationCache().getAll().flatMap(
    (mutation) => filterMutation(mutation) ? [dehydrateMutation(mutation)] : []
  );
  const filterQuery = options.shouldDehydrateQuery ?? client.getDefaultOptions().dehydrate?.shouldDehydrateQuery ?? defaultShouldDehydrateQuery;
  const shouldRedactErrors = options.shouldRedactErrors ?? client.getDefaultOptions().dehydrate?.shouldRedactErrors ?? defaultShouldRedactErrors;
  const serializeData = options.serializeData ?? client.getDefaultOptions().dehydrate?.serializeData ?? defaultTransformerFn;
  const queries = client.getQueryCache().getAll().flatMap(
    (query) => filterQuery(query) ? [dehydrateQuery(query, serializeData, shouldRedactErrors)] : []
  );
  return { mutations, queries };
}
var Mutation = class extends Removable {
  #client;
  #observers;
  #mutationCache;
  #retryer;
  constructor(config) {
    super();
    this.#client = config.client;
    this.mutationId = config.mutationId;
    this.#mutationCache = config.mutationCache;
    this.#observers = [];
    this.state = config.state || getDefaultState();
    this.setOptions(config.options);
    this.scheduleGc();
  }
  setOptions(options) {
    this.options = options;
    this.updateGcTime(this.options.gcTime);
  }
  get meta() {
    return this.options.meta;
  }
  addObserver(observer) {
    if (!this.#observers.includes(observer)) {
      this.#observers.push(observer);
      this.clearGcTimeout();
      this.#mutationCache.notify({
        type: "observerAdded",
        mutation: this,
        observer
      });
    }
  }
  removeObserver(observer) {
    this.#observers = this.#observers.filter((x) => x !== observer);
    this.scheduleGc();
    this.#mutationCache.notify({
      type: "observerRemoved",
      mutation: this,
      observer
    });
  }
  optionalRemove() {
    if (!this.#observers.length) {
      if (this.state.status === "pending") {
        this.scheduleGc();
      } else {
        this.#mutationCache.remove(this);
      }
    }
  }
  continue() {
    return this.#retryer?.continue() ?? // continuing a mutation assumes that variables are set, mutation must have been dehydrated before
    this.execute(this.state.variables);
  }
  async execute(variables) {
    const onContinue = () => {
      this.#dispatch({ type: "continue" });
    };
    const mutationFnContext = {
      client: this.#client,
      meta: this.options.meta,
      mutationKey: this.options.mutationKey
    };
    this.#retryer = createRetryer({
      fn: () => {
        if (!this.options.mutationFn) {
          return Promise.reject(new Error("No mutationFn found"));
        }
        return this.options.mutationFn(variables, mutationFnContext);
      },
      onFail: (failureCount, error) => {
        this.#dispatch({ type: "failed", failureCount, error });
      },
      onPause: () => {
        this.#dispatch({ type: "pause" });
      },
      onContinue,
      retry: this.options.retry ?? 0,
      retryDelay: this.options.retryDelay,
      networkMode: this.options.networkMode,
      canRun: () => this.#mutationCache.canRun(this)
    });
    const restored = this.state.status === "pending";
    const isPaused = !this.#retryer.canStart();
    try {
      if (restored) {
        onContinue();
      } else {
        this.#dispatch({ type: "pending", variables, isPaused });
        if (this.#mutationCache.config.onMutate) {
          await this.#mutationCache.config.onMutate(
            variables,
            this,
            mutationFnContext
          );
        }
        const context = await this.options.onMutate?.(
          variables,
          mutationFnContext
        );
        if (context !== this.state.context) {
          this.#dispatch({
            type: "pending",
            context,
            variables,
            isPaused
          });
        }
      }
      const data = await this.#retryer.start();
      await this.#mutationCache.config.onSuccess?.(
        data,
        variables,
        this.state.context,
        this,
        mutationFnContext
      );
      await this.options.onSuccess?.(
        data,
        variables,
        this.state.context,
        mutationFnContext
      );
      await this.#mutationCache.config.onSettled?.(
        data,
        null,
        this.state.variables,
        this.state.context,
        this,
        mutationFnContext
      );
      await this.options.onSettled?.(
        data,
        null,
        variables,
        this.state.context,
        mutationFnContext
      );
      this.#dispatch({ type: "success", data });
      return data;
    } catch (error) {
      try {
        await this.#mutationCache.config.onError?.(
          error,
          variables,
          this.state.context,
          this,
          mutationFnContext
        );
      } catch (e2) {
        void Promise.reject(e2);
      }
      try {
        await this.options.onError?.(
          error,
          variables,
          this.state.context,
          mutationFnContext
        );
      } catch (e2) {
        void Promise.reject(e2);
      }
      try {
        await this.#mutationCache.config.onSettled?.(
          void 0,
          error,
          this.state.variables,
          this.state.context,
          this,
          mutationFnContext
        );
      } catch (e2) {
        void Promise.reject(e2);
      }
      try {
        await this.options.onSettled?.(
          void 0,
          error,
          variables,
          this.state.context,
          mutationFnContext
        );
      } catch (e2) {
        void Promise.reject(e2);
      }
      this.#dispatch({ type: "error", error });
      throw error;
    } finally {
      this.#mutationCache.runNext(this);
    }
  }
  #dispatch(action) {
    const reducer = (state) => {
      switch (action.type) {
        case "failed":
          return {
            ...state,
            failureCount: action.failureCount,
            failureReason: action.error
          };
        case "pause":
          return {
            ...state,
            isPaused: true
          };
        case "continue":
          return {
            ...state,
            isPaused: false
          };
        case "pending":
          return {
            ...state,
            context: action.context,
            data: void 0,
            failureCount: 0,
            failureReason: null,
            error: null,
            isPaused: action.isPaused,
            status: "pending",
            variables: action.variables,
            submittedAt: Date.now()
          };
        case "success":
          return {
            ...state,
            data: action.data,
            failureCount: 0,
            failureReason: null,
            error: null,
            status: "success",
            isPaused: false
          };
        case "error":
          return {
            ...state,
            data: void 0,
            error: action.error,
            failureCount: state.failureCount + 1,
            failureReason: action.error,
            isPaused: false,
            status: "error"
          };
      }
    };
    this.state = reducer(this.state);
    notifyManager.batch(() => {
      this.#observers.forEach((observer) => {
        observer.onMutationUpdate(action);
      });
      this.#mutationCache.notify({
        mutation: this,
        type: "updated",
        action
      });
    });
  }
};
function getDefaultState() {
  return {
    context: void 0,
    data: void 0,
    error: null,
    failureCount: 0,
    failureReason: null,
    isPaused: false,
    status: "idle",
    variables: void 0,
    submittedAt: 0
  };
}
var MutationCache = class extends Subscribable {
  constructor(config = {}) {
    super();
    this.config = config;
    this.#mutations = /* @__PURE__ */ new Set();
    this.#scopes = /* @__PURE__ */ new Map();
    this.#mutationId = 0;
  }
  #mutations;
  #scopes;
  #mutationId;
  build(client, options, state) {
    const mutation = new Mutation({
      client,
      mutationCache: this,
      mutationId: ++this.#mutationId,
      options: client.defaultMutationOptions(options),
      state
    });
    this.add(mutation);
    return mutation;
  }
  add(mutation) {
    this.#mutations.add(mutation);
    const scope = scopeFor(mutation);
    if (typeof scope === "string") {
      const scopedMutations = this.#scopes.get(scope);
      if (scopedMutations) {
        scopedMutations.push(mutation);
      } else {
        this.#scopes.set(scope, [mutation]);
      }
    }
    this.notify({ type: "added", mutation });
  }
  remove(mutation) {
    if (this.#mutations.delete(mutation)) {
      const scope = scopeFor(mutation);
      if (typeof scope === "string") {
        const scopedMutations = this.#scopes.get(scope);
        if (scopedMutations) {
          if (scopedMutations.length > 1) {
            const index = scopedMutations.indexOf(mutation);
            if (index !== -1) {
              scopedMutations.splice(index, 1);
            }
          } else if (scopedMutations[0] === mutation) {
            this.#scopes.delete(scope);
          }
        }
      }
    }
    this.notify({ type: "removed", mutation });
  }
  canRun(mutation) {
    const scope = scopeFor(mutation);
    if (typeof scope === "string") {
      const mutationsWithSameScope = this.#scopes.get(scope);
      const firstPendingMutation = mutationsWithSameScope?.find(
        (m) => m.state.status === "pending"
      );
      return !firstPendingMutation || firstPendingMutation === mutation;
    } else {
      return true;
    }
  }
  runNext(mutation) {
    const scope = scopeFor(mutation);
    if (typeof scope === "string") {
      const foundMutation = this.#scopes.get(scope)?.find((m) => m !== mutation && m.state.isPaused);
      return foundMutation?.continue() ?? Promise.resolve();
    } else {
      return Promise.resolve();
    }
  }
  clear() {
    notifyManager.batch(() => {
      this.#mutations.forEach((mutation) => {
        this.notify({ type: "removed", mutation });
      });
      this.#mutations.clear();
      this.#scopes.clear();
    });
  }
  getAll() {
    return Array.from(this.#mutations);
  }
  find(filters) {
    const defaultedFilters = { exact: true, ...filters };
    return this.getAll().find(
      (mutation) => matchMutation(defaultedFilters, mutation)
    );
  }
  findAll(filters = {}) {
    return this.getAll().filter((mutation) => matchMutation(filters, mutation));
  }
  notify(event) {
    notifyManager.batch(() => {
      this.listeners.forEach((listener) => {
        listener(event);
      });
    });
  }
  resumePausedMutations() {
    const pausedMutations = this.getAll().filter((x) => x.state.isPaused);
    return notifyManager.batch(
      () => Promise.all(
        pausedMutations.map((mutation) => mutation.continue().catch(noop))
      )
    );
  }
};
function scopeFor(mutation) {
  return mutation.options.scope?.id;
}
var QueryCache = class extends Subscribable {
  constructor(config = {}) {
    super();
    this.config = config;
    this.#queries = /* @__PURE__ */ new Map();
  }
  #queries;
  build(client, options, state) {
    const queryKey = options.queryKey;
    const queryHash = options.queryHash ?? hashQueryKeyByOptions(queryKey, options);
    let query = this.get(queryHash);
    if (!query) {
      query = new Query({
        client,
        queryKey,
        queryHash,
        options: client.defaultQueryOptions(options),
        state,
        defaultOptions: client.getQueryDefaults(queryKey)
      });
      this.add(query);
    }
    return query;
  }
  add(query) {
    if (!this.#queries.has(query.queryHash)) {
      this.#queries.set(query.queryHash, query);
      this.notify({
        type: "added",
        query
      });
    }
  }
  remove(query) {
    const queryInMap = this.#queries.get(query.queryHash);
    if (queryInMap) {
      query.destroy();
      if (queryInMap === query) {
        this.#queries.delete(query.queryHash);
      }
      this.notify({ type: "removed", query });
    }
  }
  clear() {
    notifyManager.batch(() => {
      this.getAll().forEach((query) => {
        this.remove(query);
      });
    });
  }
  get(queryHash) {
    return this.#queries.get(queryHash);
  }
  getAll() {
    return [...this.#queries.values()];
  }
  find(filters) {
    const defaultedFilters = { exact: true, ...filters };
    return this.getAll().find(
      (query) => matchQuery(defaultedFilters, query)
    );
  }
  findAll(filters = {}) {
    const queries = this.getAll();
    return Object.keys(filters).length > 0 ? queries.filter((query) => matchQuery(filters, query)) : queries;
  }
  notify(event) {
    notifyManager.batch(() => {
      this.listeners.forEach((listener) => {
        listener(event);
      });
    });
  }
  onFocus() {
    notifyManager.batch(() => {
      this.getAll().forEach((query) => {
        query.onFocus();
      });
    });
  }
  onOnline() {
    notifyManager.batch(() => {
      this.getAll().forEach((query) => {
        query.onOnline();
      });
    });
  }
};
var QueryClient = class {
  #queryCache;
  #mutationCache;
  #defaultOptions;
  #queryDefaults;
  #mutationDefaults;
  #mountCount;
  #unsubscribeFocus;
  #unsubscribeOnline;
  constructor(config = {}) {
    this.#queryCache = config.queryCache || new QueryCache();
    this.#mutationCache = config.mutationCache || new MutationCache();
    this.#defaultOptions = config.defaultOptions || {};
    this.#queryDefaults = /* @__PURE__ */ new Map();
    this.#mutationDefaults = /* @__PURE__ */ new Map();
    this.#mountCount = 0;
  }
  mount() {
    this.#mountCount++;
    if (this.#mountCount !== 1) return;
    this.#unsubscribeFocus = focusManager.subscribe(async (focused) => {
      if (focused) {
        await this.resumePausedMutations();
        this.#queryCache.onFocus();
      }
    });
    this.#unsubscribeOnline = onlineManager.subscribe(async (online) => {
      if (online) {
        await this.resumePausedMutations();
        this.#queryCache.onOnline();
      }
    });
  }
  unmount() {
    this.#mountCount--;
    if (this.#mountCount !== 0) return;
    this.#unsubscribeFocus?.();
    this.#unsubscribeFocus = void 0;
    this.#unsubscribeOnline?.();
    this.#unsubscribeOnline = void 0;
  }
  isFetching(filters) {
    return this.#queryCache.findAll({ ...filters, fetchStatus: "fetching" }).length;
  }
  isMutating(filters) {
    return this.#mutationCache.findAll({ ...filters, status: "pending" }).length;
  }
  /**
   * Imperative (non-reactive) way to retrieve data for a QueryKey.
   * Should only be used in callbacks or functions where reading the latest data is necessary, e.g. for optimistic updates.
   *
   * Hint: Do not use this function inside a component, because it won't receive updates.
   * Use `useQuery` to create a `QueryObserver` that subscribes to changes.
   */
  getQueryData(queryKey) {
    const options = this.defaultQueryOptions({ queryKey });
    return this.#queryCache.get(options.queryHash)?.state.data;
  }
  ensureQueryData(options) {
    const defaultedOptions = this.defaultQueryOptions(options);
    const query = this.#queryCache.build(this, defaultedOptions);
    const cachedData = query.state.data;
    if (cachedData === void 0) {
      return this.fetchQuery(options);
    }
    if (options.revalidateIfStale && query.isStaleByTime(resolveStaleTime(defaultedOptions.staleTime, query))) {
      void this.prefetchQuery(defaultedOptions);
    }
    return Promise.resolve(cachedData);
  }
  getQueriesData(filters) {
    return this.#queryCache.findAll(filters).map(({ queryKey, state }) => {
      const data = state.data;
      return [queryKey, data];
    });
  }
  setQueryData(queryKey, updater, options) {
    const defaultedOptions = this.defaultQueryOptions({ queryKey });
    const query = this.#queryCache.get(
      defaultedOptions.queryHash
    );
    const prevData = query?.state.data;
    const data = functionalUpdate$1(updater, prevData);
    if (data === void 0) {
      return void 0;
    }
    return this.#queryCache.build(this, defaultedOptions).setData(data, { ...options, manual: true });
  }
  setQueriesData(filters, updater, options) {
    return notifyManager.batch(
      () => this.#queryCache.findAll(filters).map(({ queryKey }) => [
        queryKey,
        this.setQueryData(queryKey, updater, options)
      ])
    );
  }
  getQueryState(queryKey) {
    const options = this.defaultQueryOptions({ queryKey });
    return this.#queryCache.get(
      options.queryHash
    )?.state;
  }
  removeQueries(filters) {
    const queryCache = this.#queryCache;
    notifyManager.batch(() => {
      queryCache.findAll(filters).forEach((query) => {
        queryCache.remove(query);
      });
    });
  }
  resetQueries(filters, options) {
    const queryCache = this.#queryCache;
    return notifyManager.batch(() => {
      queryCache.findAll(filters).forEach((query) => {
        query.reset();
      });
      return this.refetchQueries(
        {
          type: "active",
          ...filters
        },
        options
      );
    });
  }
  cancelQueries(filters, cancelOptions = {}) {
    const defaultedCancelOptions = { revert: true, ...cancelOptions };
    const promises = notifyManager.batch(
      () => this.#queryCache.findAll(filters).map((query) => query.cancel(defaultedCancelOptions))
    );
    return Promise.all(promises).then(noop).catch(noop);
  }
  invalidateQueries(filters, options = {}) {
    return notifyManager.batch(() => {
      this.#queryCache.findAll(filters).forEach((query) => {
        query.invalidate();
      });
      if (filters?.refetchType === "none") {
        return Promise.resolve();
      }
      return this.refetchQueries(
        {
          ...filters,
          type: filters?.refetchType ?? filters?.type ?? "active"
        },
        options
      );
    });
  }
  refetchQueries(filters, options = {}) {
    const fetchOptions = {
      ...options,
      cancelRefetch: options.cancelRefetch ?? true
    };
    const promises = notifyManager.batch(
      () => this.#queryCache.findAll(filters).filter((query) => !query.isDisabled() && !query.isStatic()).map((query) => {
        let promise = query.fetch(void 0, fetchOptions);
        if (!fetchOptions.throwOnError) {
          promise = promise.catch(noop);
        }
        return query.state.fetchStatus === "paused" ? Promise.resolve() : promise;
      })
    );
    return Promise.all(promises).then(noop);
  }
  fetchQuery(options) {
    const defaultedOptions = this.defaultQueryOptions(options);
    if (defaultedOptions.retry === void 0) {
      defaultedOptions.retry = false;
    }
    const query = this.#queryCache.build(this, defaultedOptions);
    return query.isStaleByTime(
      resolveStaleTime(defaultedOptions.staleTime, query)
    ) ? query.fetch(defaultedOptions) : Promise.resolve(query.state.data);
  }
  prefetchQuery(options) {
    return this.fetchQuery(options).then(noop).catch(noop);
  }
  fetchInfiniteQuery(options) {
    options._type = "infinite";
    return this.fetchQuery(options);
  }
  prefetchInfiniteQuery(options) {
    return this.fetchInfiniteQuery(options).then(noop).catch(noop);
  }
  ensureInfiniteQueryData(options) {
    options._type = "infinite";
    return this.ensureQueryData(options);
  }
  resumePausedMutations() {
    if (onlineManager.isOnline()) {
      return this.#mutationCache.resumePausedMutations();
    }
    return Promise.resolve();
  }
  getQueryCache() {
    return this.#queryCache;
  }
  getMutationCache() {
    return this.#mutationCache;
  }
  getDefaultOptions() {
    return this.#defaultOptions;
  }
  setDefaultOptions(options) {
    this.#defaultOptions = options;
  }
  setQueryDefaults(queryKey, options) {
    this.#queryDefaults.set(hashKey(queryKey), {
      queryKey,
      defaultOptions: options
    });
  }
  getQueryDefaults(queryKey) {
    const defaults = [...this.#queryDefaults.values()];
    const result = {};
    defaults.forEach((queryDefault) => {
      if (partialMatchKey(queryKey, queryDefault.queryKey)) {
        Object.assign(result, queryDefault.defaultOptions);
      }
    });
    return result;
  }
  setMutationDefaults(mutationKey, options) {
    this.#mutationDefaults.set(hashKey(mutationKey), {
      mutationKey,
      defaultOptions: options
    });
  }
  getMutationDefaults(mutationKey) {
    const defaults = [...this.#mutationDefaults.values()];
    const result = {};
    defaults.forEach((queryDefault) => {
      if (partialMatchKey(mutationKey, queryDefault.mutationKey)) {
        Object.assign(result, queryDefault.defaultOptions);
      }
    });
    return result;
  }
  defaultQueryOptions(options) {
    if (options._defaulted) {
      return options;
    }
    const defaultedOptions = {
      ...this.#defaultOptions.queries,
      ...this.getQueryDefaults(options.queryKey),
      ...options,
      _defaulted: true
    };
    if (!defaultedOptions.queryHash) {
      defaultedOptions.queryHash = hashQueryKeyByOptions(
        defaultedOptions.queryKey,
        defaultedOptions
      );
    }
    if (defaultedOptions.refetchOnReconnect === void 0) {
      defaultedOptions.refetchOnReconnect = defaultedOptions.networkMode !== "always";
    }
    if (defaultedOptions.throwOnError === void 0) {
      defaultedOptions.throwOnError = !!defaultedOptions.suspense;
    }
    if (!defaultedOptions.networkMode && defaultedOptions.persister) {
      defaultedOptions.networkMode = "offlineFirst";
    }
    if (defaultedOptions.queryFn === skipToken) {
      defaultedOptions.enabled = false;
    }
    return defaultedOptions;
  }
  defaultMutationOptions(options) {
    if (options?._defaulted) {
      return options;
    }
    return {
      ...this.#defaultOptions.mutations,
      ...options?.mutationKey && this.getMutationDefaults(options.mutationKey),
      ...options,
      _defaulted: true
    };
  }
  clear() {
    this.#queryCache.clear();
    this.#mutationCache.clear();
  }
};
const screeningsI18n = ["common", "screenings"];
const __variableDynamicImportRuntimeHelper = (glob$1, path$13, segs) => {
  const v = glob$1[path$13];
  if (v) return typeof v === "function" ? v() : Promise.resolve(v);
  return new Promise((_, reject) => {
    (typeof queueMicrotask === "function" ? queueMicrotask : setTimeout)(reject.bind(null, /* @__PURE__ */ new Error("Unknown variable dynamic import: " + path$13 + (path$13.split("/").length !== segs ? ". Note that variables only represent file names one level deep." : ""))));
  });
};
class DoubleIndexedKV {
  constructor() {
    this.keyToValue = /* @__PURE__ */ new Map();
    this.valueToKey = /* @__PURE__ */ new Map();
  }
  set(key, value) {
    this.keyToValue.set(key, value);
    this.valueToKey.set(value, key);
  }
  getByKey(key) {
    return this.keyToValue.get(key);
  }
  getByValue(value) {
    return this.valueToKey.get(value);
  }
  clear() {
    this.keyToValue.clear();
    this.valueToKey.clear();
  }
}
class Registry {
  constructor(generateIdentifier) {
    this.generateIdentifier = generateIdentifier;
    this.kv = new DoubleIndexedKV();
  }
  register(value, identifier) {
    if (this.kv.getByValue(value)) {
      return;
    }
    if (!identifier) {
      identifier = this.generateIdentifier(value);
    }
    this.kv.set(identifier, value);
  }
  clear() {
    this.kv.clear();
  }
  getIdentifier(value) {
    return this.kv.getByValue(value);
  }
  getValue(identifier) {
    return this.kv.getByKey(identifier);
  }
}
class ClassRegistry extends Registry {
  constructor() {
    super((c) => c.name);
    this.classToAllowedProps = /* @__PURE__ */ new Map();
  }
  register(value, options) {
    if (typeof options === "object") {
      if (options.allowProps) {
        this.classToAllowedProps.set(value, options.allowProps);
      }
      super.register(value, options.identifier);
    } else {
      super.register(value, options);
    }
  }
  getAllowedProps(value) {
    return this.classToAllowedProps.get(value);
  }
}
function valuesOfObj(record) {
  if ("values" in Object) {
    return Object.values(record);
  }
  const values = [];
  for (const key in record) {
    if (record.hasOwnProperty(key)) {
      values.push(record[key]);
    }
  }
  return values;
}
function find(record, predicate) {
  const values = valuesOfObj(record);
  if ("find" in values) {
    return values.find(predicate);
  }
  const valuesNotNever = values;
  for (let i = 0; i < valuesNotNever.length; i++) {
    const value = valuesNotNever[i];
    if (predicate(value)) {
      return value;
    }
  }
  return void 0;
}
function forEach(record, run) {
  Object.entries(record).forEach(([key, value]) => run(value, key));
}
function includes(arr, value) {
  return arr.indexOf(value) !== -1;
}
function findArr(record, predicate) {
  for (let i = 0; i < record.length; i++) {
    const value = record[i];
    if (predicate(value)) {
      return value;
    }
  }
  return void 0;
}
class CustomTransformerRegistry {
  constructor() {
    this.transfomers = {};
  }
  register(transformer) {
    this.transfomers[transformer.name] = transformer;
  }
  findApplicable(v) {
    return find(this.transfomers, (transformer) => transformer.isApplicable(v));
  }
  findByName(name) {
    return this.transfomers[name];
  }
}
const getType$1 = (payload) => Object.prototype.toString.call(payload).slice(8, -1);
const isUndefined = (payload) => typeof payload === "undefined";
const isNull = (payload) => payload === null;
const isPlainObject$1 = (payload) => {
  if (typeof payload !== "object" || payload === null)
    return false;
  if (payload === Object.prototype)
    return false;
  if (Object.getPrototypeOf(payload) === null)
    return true;
  return Object.getPrototypeOf(payload) === Object.prototype;
};
const isEmptyObject = (payload) => isPlainObject$1(payload) && Object.keys(payload).length === 0;
const isArray$1 = (payload) => Array.isArray(payload);
const isString = (payload) => typeof payload === "string";
const isNumber = (payload) => typeof payload === "number" && !isNaN(payload);
const isBoolean = (payload) => typeof payload === "boolean";
const isRegExp = (payload) => payload instanceof RegExp;
const isMap = (payload) => payload instanceof Map;
const isSet = (payload) => payload instanceof Set;
const isSymbol = (payload) => getType$1(payload) === "Symbol";
const isDate = (payload) => payload instanceof Date && !isNaN(payload.valueOf());
const isError = (payload) => payload instanceof Error;
const isNaNValue = (payload) => typeof payload === "number" && isNaN(payload);
const isPrimitive = (payload) => isBoolean(payload) || isNull(payload) || isUndefined(payload) || isNumber(payload) || isString(payload) || isSymbol(payload);
const isBigint = (payload) => typeof payload === "bigint";
const isInfinite = (payload) => payload === Infinity || payload === -Infinity;
const isTypedArray = (payload) => ArrayBuffer.isView(payload) && !(payload instanceof DataView);
const isURL = (payload) => payload instanceof URL;
const escapeKey = (key) => key.replace(/\\/g, "\\\\").replace(/\./g, "\\.");
const stringifyPath = (path) => path.map(String).map(escapeKey).join(".");
const parsePath = (string2, legacyPaths) => {
  const result = [];
  let segment = "";
  for (let i = 0; i < string2.length; i++) {
    let char = string2.charAt(i);
    if (!legacyPaths && char === "\\") {
      const escaped = string2.charAt(i + 1);
      if (escaped === "\\") {
        segment += "\\";
        i++;
        continue;
      } else if (escaped !== ".") {
        throw Error("invalid path");
      }
    }
    const isEscapedDot = char === "\\" && string2.charAt(i + 1) === ".";
    if (isEscapedDot) {
      segment += ".";
      i++;
      continue;
    }
    const isEndOfSegment = char === ".";
    if (isEndOfSegment) {
      result.push(segment);
      segment = "";
      continue;
    }
    segment += char;
  }
  const lastSegment = segment;
  result.push(lastSegment);
  return result;
};
function simpleTransformation(isApplicable, annotation, transform, untransform) {
  return {
    isApplicable,
    annotation,
    transform,
    untransform
  };
}
const simpleRules = [
  simpleTransformation(isUndefined, "undefined", () => null, () => void 0),
  simpleTransformation(isBigint, "bigint", (v) => v.toString(), (v) => {
    if (typeof BigInt !== "undefined") {
      return BigInt(v);
    }
    console.error("Please add a BigInt polyfill.");
    return v;
  }),
  simpleTransformation(isDate, "Date", (v) => v.toISOString(), (v) => new Date(v)),
  simpleTransformation(isError, "Error", (v, superJson) => {
    const baseError = {
      name: v.name,
      message: v.message
    };
    if ("cause" in v) {
      baseError.cause = v.cause;
    }
    superJson.allowedErrorProps.forEach((prop) => {
      baseError[prop] = v[prop];
    });
    return baseError;
  }, (v, superJson) => {
    const e2 = new Error(v.message, { cause: v.cause });
    e2.name = v.name;
    e2.stack = v.stack;
    superJson.allowedErrorProps.forEach((prop) => {
      e2[prop] = v[prop];
    });
    return e2;
  }),
  simpleTransformation(isRegExp, "regexp", (v) => "" + v, (regex) => {
    const body = regex.slice(1, regex.lastIndexOf("/"));
    const flags = regex.slice(regex.lastIndexOf("/") + 1);
    return new RegExp(body, flags);
  }),
  simpleTransformation(
    isSet,
    "set",
    // (sets only exist in es6+)
    // eslint-disable-next-line es5/no-es6-methods
    (v) => [...v.values()],
    (v) => new Set(v)
  ),
  simpleTransformation(isMap, "map", (v) => [...v.entries()], (v) => new Map(v)),
  simpleTransformation((v) => isNaNValue(v) || isInfinite(v), "number", (v) => {
    if (isNaNValue(v)) {
      return "NaN";
    }
    if (v > 0) {
      return "Infinity";
    } else {
      return "-Infinity";
    }
  }, Number),
  simpleTransformation((v) => v === 0 && 1 / v === -Infinity, "number", () => {
    return "-0";
  }, Number),
  simpleTransformation(isURL, "URL", (v) => v.toString(), (v) => new URL(v))
];
function compositeTransformation(isApplicable, annotation, transform, untransform) {
  return {
    isApplicable,
    annotation,
    transform,
    untransform
  };
}
const symbolRule = compositeTransformation((s, superJson) => {
  if (isSymbol(s)) {
    const isRegistered = !!superJson.symbolRegistry.getIdentifier(s);
    return isRegistered;
  }
  return false;
}, (s, superJson) => {
  const identifier = superJson.symbolRegistry.getIdentifier(s);
  return ["symbol", identifier];
}, (v) => v.description, (_, a, superJson) => {
  const value = superJson.symbolRegistry.getValue(a[1]);
  if (!value) {
    throw new Error("Trying to deserialize unknown symbol");
  }
  return value;
});
const constructorToName = [
  Int8Array,
  Uint8Array,
  Int16Array,
  Uint16Array,
  Int32Array,
  Uint32Array,
  Float32Array,
  Float64Array,
  Uint8ClampedArray
].reduce((obj, ctor) => {
  obj[ctor.name] = ctor;
  return obj;
}, {});
const typedArrayRule = compositeTransformation(isTypedArray, (v) => ["typed-array", v.constructor.name], (v) => [...v], (v, a) => {
  const ctor = constructorToName[a[1]];
  if (!ctor) {
    throw new Error("Trying to deserialize unknown typed array");
  }
  return new ctor(v);
});
function isInstanceOfRegisteredClass(potentialClass, superJson) {
  if (potentialClass?.constructor) {
    const isRegistered = !!superJson.classRegistry.getIdentifier(potentialClass.constructor);
    return isRegistered;
  }
  return false;
}
const classRule = compositeTransformation(isInstanceOfRegisteredClass, (clazz, superJson) => {
  const identifier = superJson.classRegistry.getIdentifier(clazz.constructor);
  return ["class", identifier];
}, (clazz, superJson) => {
  const allowedProps = superJson.classRegistry.getAllowedProps(clazz.constructor);
  if (!allowedProps) {
    return { ...clazz };
  }
  const result = {};
  allowedProps.forEach((prop) => {
    result[prop] = clazz[prop];
  });
  return result;
}, (v, a, superJson) => {
  const clazz = superJson.classRegistry.getValue(a[1]);
  if (!clazz) {
    throw new Error(`Trying to deserialize unknown class '${a[1]}' - check https://github.com/blitz-js/superjson/issues/116#issuecomment-773996564`);
  }
  return Object.assign(Object.create(clazz.prototype), v);
});
const customRule = compositeTransformation((value, superJson) => {
  return !!superJson.customTransformerRegistry.findApplicable(value);
}, (value, superJson) => {
  const transformer = superJson.customTransformerRegistry.findApplicable(value);
  return ["custom", transformer.name];
}, (value, superJson) => {
  const transformer = superJson.customTransformerRegistry.findApplicable(value);
  return transformer.serialize(value);
}, (v, a, superJson) => {
  const transformer = superJson.customTransformerRegistry.findByName(a[1]);
  if (!transformer) {
    throw new Error("Trying to deserialize unknown custom value");
  }
  return transformer.deserialize(v);
});
const compositeRules = [classRule, symbolRule, customRule, typedArrayRule];
const transformValue = (value, superJson) => {
  const applicableCompositeRule = findArr(compositeRules, (rule) => rule.isApplicable(value, superJson));
  if (applicableCompositeRule) {
    return {
      value: applicableCompositeRule.transform(value, superJson),
      type: applicableCompositeRule.annotation(value, superJson)
    };
  }
  const applicableSimpleRule = findArr(simpleRules, (rule) => rule.isApplicable(value, superJson));
  if (applicableSimpleRule) {
    return {
      value: applicableSimpleRule.transform(value, superJson),
      type: applicableSimpleRule.annotation
    };
  }
  return void 0;
};
const simpleRulesByAnnotation = {};
simpleRules.forEach((rule) => {
  simpleRulesByAnnotation[rule.annotation] = rule;
});
const untransformValue = (json, type, superJson) => {
  if (isArray$1(type)) {
    switch (type[0]) {
      case "symbol":
        return symbolRule.untransform(json, type, superJson);
      case "class":
        return classRule.untransform(json, type, superJson);
      case "custom":
        return customRule.untransform(json, type, superJson);
      case "typed-array":
        return typedArrayRule.untransform(json, type, superJson);
      default:
        throw new Error("Unknown transformation: " + type);
    }
  } else {
    const transformation = simpleRulesByAnnotation[type];
    if (!transformation) {
      throw new Error("Unknown transformation: " + type);
    }
    return transformation.untransform(json, superJson);
  }
};
const getNthKey = (value, n2) => {
  if (n2 > value.size)
    throw new Error("index out of bounds");
  const keys = value.keys();
  while (n2 > 0) {
    keys.next();
    n2--;
  }
  return keys.next().value;
};
function validatePath(path) {
  if (includes(path, "__proto__")) {
    throw new Error("__proto__ is not allowed as a property");
  }
  if (includes(path, "prototype")) {
    throw new Error("prototype is not allowed as a property");
  }
  if (includes(path, "constructor")) {
    throw new Error("constructor is not allowed as a property");
  }
}
const getDeep = (object2, path) => {
  validatePath(path);
  for (let i = 0; i < path.length; i++) {
    const key = path[i];
    if (isSet(object2)) {
      object2 = getNthKey(object2, +key);
    } else if (isMap(object2)) {
      const row = +key;
      const type = +path[++i] === 0 ? "key" : "value";
      const keyOfRow = getNthKey(object2, row);
      switch (type) {
        case "key":
          object2 = keyOfRow;
          break;
        case "value":
          object2 = object2.get(keyOfRow);
          break;
      }
    } else {
      object2 = object2[key];
    }
  }
  return object2;
};
const setDeep = (object2, path, mapper) => {
  validatePath(path);
  if (path.length === 0) {
    return mapper(object2);
  }
  let parent = object2;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    if (isArray$1(parent)) {
      const index = +key;
      parent = parent[index];
    } else if (isPlainObject$1(parent)) {
      parent = parent[key];
    } else if (isSet(parent)) {
      const row = +key;
      parent = getNthKey(parent, row);
    } else if (isMap(parent)) {
      const isEnd = i === path.length - 2;
      if (isEnd) {
        break;
      }
      const row = +key;
      const type = +path[++i] === 0 ? "key" : "value";
      const keyOfRow = getNthKey(parent, row);
      switch (type) {
        case "key":
          parent = keyOfRow;
          break;
        case "value":
          parent = parent.get(keyOfRow);
          break;
      }
    }
  }
  const lastKey = path[path.length - 1];
  if (isArray$1(parent)) {
    parent[+lastKey] = mapper(parent[+lastKey]);
  } else if (isPlainObject$1(parent)) {
    parent[lastKey] = mapper(parent[lastKey]);
  }
  if (isSet(parent)) {
    const oldValue = getNthKey(parent, +lastKey);
    const newValue = mapper(oldValue);
    if (oldValue !== newValue) {
      parent.delete(oldValue);
      parent.add(newValue);
    }
  }
  if (isMap(parent)) {
    const row = +path[path.length - 2];
    const keyToRow = getNthKey(parent, row);
    const type = +lastKey === 0 ? "key" : "value";
    switch (type) {
      case "key": {
        const newKey = mapper(keyToRow);
        parent.set(newKey, parent.get(keyToRow));
        if (newKey !== keyToRow) {
          parent.delete(keyToRow);
        }
        break;
      }
      case "value": {
        parent.set(keyToRow, mapper(parent.get(keyToRow)));
        break;
      }
    }
  }
  return object2;
};
const enableLegacyPaths = (version) => version < 1;
function traverse(tree, walker2, version, origin = []) {
  if (!tree) {
    return;
  }
  const legacyPaths = enableLegacyPaths(version);
  if (!isArray$1(tree)) {
    forEach(tree, (subtree, key) => traverse(subtree, walker2, version, [
      ...origin,
      ...parsePath(key, legacyPaths)
    ]));
    return;
  }
  const [nodeValue, children] = tree;
  if (children) {
    forEach(children, (child, key) => {
      traverse(child, walker2, version, [
        ...origin,
        ...parsePath(key, legacyPaths)
      ]);
    });
  }
  walker2(nodeValue, origin);
}
function applyValueAnnotations(plain, annotations, version, superJson) {
  traverse(annotations, (type, path) => {
    plain = setDeep(plain, path, (v) => untransformValue(v, type, superJson));
  }, version);
  return plain;
}
function applyReferentialEqualityAnnotations(plain, annotations, version) {
  const legacyPaths = enableLegacyPaths(version);
  function apply(identicalPaths, path) {
    const object2 = getDeep(plain, parsePath(path, legacyPaths));
    identicalPaths.map((path2) => parsePath(path2, legacyPaths)).forEach((identicalObjectPath) => {
      plain = setDeep(plain, identicalObjectPath, () => object2);
    });
  }
  if (isArray$1(annotations)) {
    const [root, other] = annotations;
    root.forEach((identicalPath) => {
      plain = setDeep(plain, parsePath(identicalPath, legacyPaths), () => plain);
    });
    if (other) {
      forEach(other, apply);
    }
  } else {
    forEach(annotations, apply);
  }
  return plain;
}
const isDeep = (object2, superJson) => isPlainObject$1(object2) || isArray$1(object2) || isMap(object2) || isSet(object2) || isError(object2) || isInstanceOfRegisteredClass(object2, superJson);
function addIdentity(object2, path, identities) {
  const existingSet = identities.get(object2);
  if (existingSet) {
    existingSet.push(path);
  } else {
    identities.set(object2, [path]);
  }
}
function generateReferentialEqualityAnnotations(identitites, dedupe) {
  const result = {};
  let rootEqualityPaths = void 0;
  identitites.forEach((paths) => {
    if (paths.length <= 1) {
      return;
    }
    if (!dedupe) {
      paths = paths.map((path) => path.map(String)).sort((a, b) => a.length - b.length);
    }
    const [representativePath, ...identicalPaths] = paths;
    if (representativePath.length === 0) {
      rootEqualityPaths = identicalPaths.map(stringifyPath);
    } else {
      result[stringifyPath(representativePath)] = identicalPaths.map(stringifyPath);
    }
  });
  if (rootEqualityPaths) {
    if (isEmptyObject(result)) {
      return [rootEqualityPaths];
    } else {
      return [rootEqualityPaths, result];
    }
  } else {
    return isEmptyObject(result) ? void 0 : result;
  }
}
const walker = (object2, identities, superJson, dedupe, path = [], objectsInThisPath = [], seenObjects = /* @__PURE__ */ new Map()) => {
  const primitive = isPrimitive(object2);
  if (!primitive) {
    addIdentity(object2, path, identities);
    const seen = seenObjects.get(object2);
    if (seen) {
      return dedupe ? {
        transformedValue: null
      } : seen;
    }
  }
  if (!isDeep(object2, superJson)) {
    const transformed2 = transformValue(object2, superJson);
    const result2 = transformed2 ? {
      transformedValue: transformed2.value,
      annotations: [transformed2.type]
    } : {
      transformedValue: object2
    };
    if (!primitive) {
      seenObjects.set(object2, result2);
    }
    return result2;
  }
  if (includes(objectsInThisPath, object2)) {
    return {
      transformedValue: null
    };
  }
  const transformationResult = transformValue(object2, superJson);
  const transformed = transformationResult?.value ?? object2;
  const transformedValue = isArray$1(transformed) ? [] : {};
  const innerAnnotations = {};
  forEach(transformed, (value, index) => {
    if (index === "__proto__" || index === "constructor" || index === "prototype") {
      throw new Error(`Detected property ${index}. This is a prototype pollution risk, please remove it from your object.`);
    }
    const recursiveResult = walker(value, identities, superJson, dedupe, [...path, index], [...objectsInThisPath, object2], seenObjects);
    transformedValue[index] = recursiveResult.transformedValue;
    if (isArray$1(recursiveResult.annotations)) {
      innerAnnotations[escapeKey(index)] = recursiveResult.annotations;
    } else if (isPlainObject$1(recursiveResult.annotations)) {
      forEach(recursiveResult.annotations, (tree, key) => {
        innerAnnotations[escapeKey(index) + "." + key] = tree;
      });
    }
  });
  const result = isEmptyObject(innerAnnotations) ? {
    transformedValue,
    annotations: !!transformationResult ? [transformationResult.type] : void 0
  } : {
    transformedValue,
    annotations: !!transformationResult ? [transformationResult.type, innerAnnotations] : innerAnnotations
  };
  if (!primitive) {
    seenObjects.set(object2, result);
  }
  return result;
};
function getType(payload) {
  return Object.prototype.toString.call(payload).slice(8, -1);
}
function isArray(payload) {
  return getType(payload) === "Array";
}
function isPlainObject(payload) {
  if (getType(payload) !== "Object")
    return false;
  const prototype = Object.getPrototypeOf(payload);
  return !!prototype && prototype.constructor === Object && prototype === Object.prototype;
}
function assignProp(carry, key, newVal, originalObject, includeNonenumerable) {
  const propType = {}.propertyIsEnumerable.call(originalObject, key) ? "enumerable" : "nonenumerable";
  if (propType === "enumerable")
    carry[key] = newVal;
  if (includeNonenumerable && propType === "nonenumerable") {
    Object.defineProperty(carry, key, {
      value: newVal,
      enumerable: false,
      writable: true,
      configurable: true
    });
  }
}
function copy(target, options = {}) {
  if (isArray(target)) {
    return target.map((item) => copy(item, options));
  }
  if (!isPlainObject(target)) {
    return target;
  }
  const props = Object.getOwnPropertyNames(target);
  const symbols = Object.getOwnPropertySymbols(target);
  return [...props, ...symbols].reduce((carry, key) => {
    if (key === "__proto__")
      return carry;
    if (isArray(options.props) && !options.props.includes(key)) {
      return carry;
    }
    const val = target[key];
    const newVal = copy(val, options);
    assignProp(carry, key, newVal, target, options.nonenumerable);
    return carry;
  }, {});
}
class SuperJSON {
  /**
   * @param dedupeReferentialEqualities  If true, SuperJSON will make sure only one instance of referentially equal objects are serialized and the rest are replaced with `null`.
   */
  constructor({ dedupe = false } = {}) {
    this.classRegistry = new ClassRegistry();
    this.symbolRegistry = new Registry((s) => s.description ?? "");
    this.customTransformerRegistry = new CustomTransformerRegistry();
    this.allowedErrorProps = [];
    this.dedupe = dedupe;
  }
  serialize(object2) {
    const identities = /* @__PURE__ */ new Map();
    const output = walker(object2, identities, this, this.dedupe);
    const res = {
      json: output.transformedValue
    };
    if (output.annotations) {
      res.meta = {
        ...res.meta,
        values: output.annotations
      };
    }
    const equalityAnnotations = generateReferentialEqualityAnnotations(identities, this.dedupe);
    if (equalityAnnotations) {
      res.meta = {
        ...res.meta,
        referentialEqualities: equalityAnnotations
      };
    }
    if (res.meta)
      res.meta.v = 1;
    return res;
  }
  deserialize(payload, options) {
    const { json, meta } = payload;
    let result = options?.inPlace ? json : copy(json);
    if (meta?.values) {
      result = applyValueAnnotations(result, meta.values, meta.v ?? 0, this);
    }
    if (meta?.referentialEqualities) {
      result = applyReferentialEqualityAnnotations(result, meta.referentialEqualities, meta.v ?? 0);
    }
    return result;
  }
  stringify(object2) {
    return JSON.stringify(this.serialize(object2));
  }
  parse(string2) {
    return this.deserialize(JSON.parse(string2), { inPlace: true });
  }
  registerClass(v, options) {
    this.classRegistry.register(v, options);
  }
  registerSymbol(v, identifier) {
    this.symbolRegistry.register(v, identifier);
  }
  registerCustom(transformer, name) {
    this.customTransformerRegistry.register({
      name,
      ...transformer
    });
  }
  allowErrorProps(...props) {
    this.allowedErrorProps.push(...props);
  }
}
SuperJSON.defaultInstance = new SuperJSON();
SuperJSON.serialize = SuperJSON.defaultInstance.serialize.bind(SuperJSON.defaultInstance);
SuperJSON.deserialize = SuperJSON.defaultInstance.deserialize.bind(SuperJSON.defaultInstance);
SuperJSON.stringify = SuperJSON.defaultInstance.stringify.bind(SuperJSON.defaultInstance);
SuperJSON.parse = SuperJSON.defaultInstance.parse.bind(SuperJSON.defaultInstance);
SuperJSON.registerClass = SuperJSON.defaultInstance.registerClass.bind(SuperJSON.defaultInstance);
SuperJSON.registerSymbol = SuperJSON.defaultInstance.registerSymbol.bind(SuperJSON.defaultInstance);
SuperJSON.registerCustom = SuperJSON.defaultInstance.registerCustom.bind(SuperJSON.defaultInstance);
SuperJSON.allowErrorProps = SuperJSON.defaultInstance.allowErrorProps.bind(SuperJSON.defaultInstance);
function getContext() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 10 * 1e3,
        retry(failureCount, error) {
          if (error instanceof Response && error.status >= 300 && error.status < 400) {
            return false;
          }
          return failureCount < 3;
        }
      },
      dehydrate: { serializeData: SuperJSON.serialize },
      hydrate: { deserializeData: SuperJSON.deserialize }
    },
    mutationCache: new MutationCache({
      onSuccess(_data, variables, _context, mutation) {
        const invalidates = mutation.meta?.invalidates;
        if (!invalidates) {
          return;
        }
        const queryKeys = invalidates(variables);
        if (queryKeys.length === 0) {
          return;
        }
        queryClient.invalidateQueries({
          predicate(query) {
            return queryKeys.some((queryKey) => matchQuery({ queryKey }, query));
          }
        });
      }
    })
  });
  return {
    queryClient
  };
}
function Provider({
  children,
  queryClient
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(QueryClientProvider, { client: queryClient, children });
}
function setupCoreRouterSsrQueryIntegration({ router: router2, queryClient, dehydrateOptions, hydrateOptions, handleRedirects = true }) {
  router2.options.hydrate;
  const ogDehydrate = router2.options.dehydrate;
  {
    const sentQueries = /* @__PURE__ */ new Set();
    const queryStream = createPushableStream();
    let unsubscribe = void 0;
    let cleanupRegistered = false;
    let tornDown = false;
    const teardown = () => {
      if (tornDown) return;
      tornDown = true;
      try {
        unsubscribe?.();
      } catch {
      }
      unsubscribe = void 0;
      try {
        if (!queryStream.isClosed()) queryStream.close();
      } catch {
      }
      try {
        queryClient.cancelQueries();
      } catch {
      }
      try {
        queryClient.clear();
      } catch {
      }
      sentQueries.clear();
    };
    const registerCleanup = (serverSsr = router2.serverSsr) => {
      if (cleanupRegistered) return;
      if (!serverSsr) return;
      serverSsr.onCleanup(teardown);
      cleanupRegistered = true;
    };
    router2.serverSsrLifecycle = {
      ...router2.serverSsrLifecycle,
      onServerSsrAttach: [...router2.serverSsrLifecycle?.onServerSsrAttach ?? [], registerCleanup]
    };
    router2.options.dehydrate = async () => {
      router2.serverSsr.onRenderFinished(() => {
        if (!queryStream.isClosed()) queryStream.close();
        unsubscribe?.();
        unsubscribe = void 0;
      });
      const dehydratedRouter = {
        ...await ogDehydrate?.(),
        queryStream: queryStream.stream
      };
      const dehydratedQueryClient = dehydrate(queryClient, dehydrateOptions);
      if (dehydratedQueryClient.queries.length > 0) {
        dehydratedQueryClient.queries.forEach((query) => {
          sentQueries.add(query.queryHash);
        });
        dehydratedRouter.dehydratedQueryClient = dehydratedQueryClient;
      }
      return dehydratedRouter;
    };
    const ogClientOptions = queryClient.getDefaultOptions();
    queryClient.setDefaultOptions({
      ...ogClientOptions,
      dehydrate: {
        shouldDehydrateQuery: () => true,
        ...ogClientOptions.dehydrate
      }
    });
    unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (!router2.serverSsr?.isDehydrated()) return;
      if (sentQueries.has(event.query.queryHash)) return;
      if (!event.query.promise) return;
      if (queryStream.isClosed()) {
        console.warn(`tried to stream query ${event.query.queryHash} after stream was already closed`);
        return;
      }
      const dehydratedQuery = dehydrate(queryClient, {
        ...dehydrateOptions,
        shouldDehydrateQuery: (query) => {
          if (query.queryHash !== event.query.queryHash) return false;
          return (ogClientOptions.dehydrate?.shouldDehydrateQuery?.(query) ?? true) && (dehydrateOptions?.shouldDehydrateQuery?.(query) ?? true);
        }
      });
      if (dehydratedQuery.queries.length === 0) return;
      sentQueries.add(event.query.queryHash);
      queryStream.enqueue(dehydratedQuery);
    });
  }
}
function createPushableStream() {
  let controllerRef;
  const stream = new ReadableStream({ start(controller) {
    controllerRef = controller;
  } });
  let _isClosed = false;
  return {
    stream,
    enqueue: (chunk) => {
      if (!_isClosed) controllerRef.enqueue(chunk);
    },
    close: () => {
      if (_isClosed) return;
      controllerRef.close();
      _isClosed = true;
    },
    isClosed: () => _isClosed,
    error: (err) => {
      if (_isClosed) return;
      _isClosed = true;
      controllerRef.error(err);
    }
  };
}
function setupRouterSsrQueryIntegration(opts) {
  setupCoreRouterSsrQueryIntegration(opts);
  if (opts.wrapQueryClient === false) return;
  const OGWrap = opts.router.options.Wrap || reactExports.Fragment;
  opts.router.options.Wrap = ({ children }) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(QueryClientProvider, {
      client: opts.queryClient,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(OGWrap, { children })
    });
  };
}
var resourcesToBackend = function resourcesToBackend2(res) {
  return {
    type: "backend",
    init: function init(services, backendOptions, i18nextOptions) {
    },
    read: function read(language, namespace, callback) {
      if (typeof res === "function") {
        if (res.length < 3) {
          try {
            var r = res(language, namespace);
            if (r && typeof r.then === "function") {
              r.then(function(data) {
                return callback(null, data && data.default || data);
              }).catch(callback);
            } else {
              callback(null, r);
            }
          } catch (err) {
            callback(err);
          }
          return;
        }
        res(language, namespace, callback);
        return;
      }
      callback(null, res && res[language] && res[language][namespace]);
    }
  };
};
const handle$1 = {
  i18n: ["common"]
};
const ErrorComponent = ({ error }) => {
  const router2 = useRouter();
  const canGoBack = useCanGoBack();
  const { t: t2 } = useTranslation(handle$1.i18n);
  let title, subtitle;
  if (error instanceof Response && error.status === FORBIDDEN) {
    title = t2("common:errors.forbidden.title");
    subtitle = t2("common:errors.forbidden.subtitle");
  } else if (error instanceof Response && error.status === NOT_FOUND) {
    title = t2("common:errors.not_found");
    subtitle = null;
  } else {
    title = t2("common:error_boundary.default.title");
    subtitle = t2("common:error_boundary.default.subtitle");
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col items-center justify-center gap-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Typo, { variant: "title1", className: "text-purple-hover", children: title }),
    subtitle ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-grey-primary text-s mb-lg", children: subtitle }) : null,
    canGoBack ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        variant: "primary",
        onClick: () => {
          router2.history.back();
        },
        children: t2("common:go_back")
      }
    ) }) : null,
    null
  ] });
};
const AppConfigContext = createSimpleContext("AppConfig");
const getRootLoaderDataFn = createServerFn({
  method: "GET"
}).middleware([servicesMiddleware]).handler(createSsrRpc("2434b75a233407e6a0f02cb1d65aff801cf21dbf917ed2a61d873f754edc5c16"));
function makeI18nInstance(locale) {
  const instance2 = createInstance();
  instance2.use(initReactI18next).init({
    ...i18nConfig,
    resources,
    lng: locale,
    ns: ALL_NAMESPACES,
    initAsync: false
  });
  return instance2;
}
function SegmentScript({ script, nonce }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "script",
    {
      async: true,
      nonce,
      suppressHydrationWarning: true,
      dangerouslySetInnerHTML: {
        __html: script
      }
    }
  );
}
const tailwindStyles = "/assets/tailwind-CtkJZku9.css";
const CsrfContext = reactExports.createContext("");
const NonceContext = reactExports.createContext("");
const NonceProvider = NonceContext.Provider;
const Route$1K = createRootRouteWithContext()({
  head: () => ({
    meta: [{
      charSet: "utf-8"
    }, {
      name: "viewport",
      content: "width=device-width,initial-scale=1"
    }, {
      title: "Marble"
    }],
    links: [{
      rel: "preload",
      href: logosSVGSpriteHref,
      as: "image"
    }, {
      rel: "preload",
      href: iconsSVGSpriteHref,
      as: "image"
    }, {
      rel: "stylesheet",
      href: tailwindStyles
    }, {
      rel: "stylesheet",
      href: "/fonts/Inter/inter.css"
    }, {
      rel: "apple-touch-icon",
      sizes: "180x180",
      href: "/favicons/apple-touch-icon.png"
    }, {
      rel: "icon",
      type: "image/png",
      sizes: "32x32",
      href: "/favicons/favicon-32x32.png"
    }, {
      rel: "icon",
      type: "image/png",
      sizes: "16x16",
      href: "/favicons/favicon-16x16.png"
    }, {
      rel: "manifest",
      href: "/site.webmanifest"
    }, {
      rel: "icon",
      href: "/favicon.ico"
    }]
  }),
  loader: () => getRootLoaderDataFn(),
  shellComponent: RootShell,
  errorComponent: RootErrorBoundary
});
function useRootLoaderData() {
  const match2 = useMatch({
    from: "__root__",
    shouldThrow: false
  });
  return match2?.loaderData;
}
function RootShell({
  children
}) {
  const loaderData = useRootLoaderData();
  const locale = loaderData?.locale ?? "en";
  const theme = loaderData?.theme ?? "light";
  const timezone = loaderData?.timezone ?? "UTC";
  const nonce = loaderData?.nonce ?? "";
  const csrf = loaderData?.csrf ?? "";
  const appConfig = loaderData?.appConfig;
  const segmentScript = loaderData?.segmentScript;
  const env = loaderData?.ENV ?? {};
  const [i18n] = reactExports.useState(() => getSSRInstance(locale) ?? makeI18nInstance(locale));
  reactExports.useEffect(() => {
    if (i18n.language !== locale) {
      void i18n.changeLanguage(locale);
    }
  }, [i18n, locale]);
  const [hydrated, setHydrated] = reactExports.useState(false);
  reactExports.useEffect(() => {
    setHydrated(true);
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("html", { lang: locale, dir: i18n.dir(), className: clsx("overscroll-y-none", theme === "dark" && "dark"), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("head", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(HeadContent, {}),
      segmentScript ? /* @__PURE__ */ jsxRuntimeExports.jsx(SegmentScript, { nonce, script: segmentScript }) : null
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("body", { "data-hydrated": hydrated || void 0, className: "bg-surface-page selection:text-grey-white selection:bg-purple-primary min-h-screen w-full antialiased text-grey-primary", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(I18nextProvider, { i18n, children: /* @__PURE__ */ jsxRuntimeExports.jsx(I18nProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(NonceProvider, { value: nonce, children: /* @__PURE__ */ jsxRuntimeExports.jsx(FormatContext.Provider, { value: {
        locale,
        timezone
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CsrfContext.Provider, { value: csrf, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ThemeProvider, { defaultTheme: theme, children: appConfig ? /* @__PURE__ */ jsxRuntimeExports.jsx(AppConfigContext.Provider, { value: appConfig, children }) : children }) }) }) }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("script", { suppressHydrationWarning: true, nonce, dangerouslySetInnerHTML: {
        __html: `window.ENV = ${JSON.stringify(env)}`
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scripts, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ClientOnly, {})
    ] })
  ] });
}
function RootErrorBoundary({
  error
}) {
  reactExports.useEffect(() => {
    captureException(error);
  }, [error]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(RootErrorBoundaryBody, { error });
}
function RootErrorBoundaryBody({
  error
}) {
  useTranslation();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-surface-page flex size-full flex-col items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-surface-card mt-sm0 flex shrink-0 rounded-2xl p-2xl text-center shadow-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorComponent, { error }) }) });
}
const Route$1J = createFileRoute("/healthcheck")({
  server: {
    handlers: {
      GET: async () => {
        try {
          return new Response("OK");
        } catch (error) {
          console.error("healthcheck ❌", { error });
          return new Response("ERROR", { status: 500 });
        }
      }
    }
  }
});
const $$splitErrorComponentImporter$g = () => import("./app-router-DY1Lzv2h.js");
const appRouterLoader = createServerFn().middleware([authMiddleware]).handler(createSsrRpc("54f6369f93f640ea9ef7a8eef3570c00b16f7ed5b44f218829d97a325a705a4f"));
const Route$1I = createFileRoute("/app-router")({
  loader: () => appRouterLoader(),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$g, "errorComponent")
});
const $$splitComponentImporter$1f = () => import("./_app-CVU5elUV.js");
const Route$1H = createFileRoute("/_app")({
  component: lazyRouteComponent($$splitComponentImporter$1f, "component")
});
const catchAllLoader = createServerFn().middleware([servicesMiddleware]).handler(createSsrRpc("1d24681fb4d9e54ee3acace0e37203e5829742ae19c4e9685f9dbc807c49ceff"));
const Route$1G = createFileRoute("/$")({
  loader: () => catchAllLoader()
});
const Route$1F = createFileRoute("/")({
  server: {
    handlers: {
      GET: async () => {
        return new Response(null, { status: 302, headers: { Location: "/sign-in" } });
      }
    }
  }
});
const Route$1E = createFileRoute("/robots/txt")({
  server: {
    handlers: {
      GET: async () => {
        const content = ["User-agent: *", "Disallow: /"];
        return new Response(content.join("\n"), {
          status: 200,
          headers: {
            "content-type": "text/plain"
          }
        });
      }
    }
  }
});
var timestring$1;
var hasRequiredTimestring;
function requireTimestring() {
  if (hasRequiredTimestring) return timestring$1;
  hasRequiredTimestring = 1;
  timestring$1 = parseTimestring;
  const DEFAULT_OPTS = {
    hoursPerDay: 24,
    daysPerWeek: 7,
    weeksPerMonth: 4,
    monthsPerYear: 12,
    daysPerYear: 365.25
  };
  const UNIT_MAP = {
    ms: ["ms", "milli", "millisecond", "milliseconds"],
    s: ["s", "sec", "secs", "second", "seconds"],
    m: ["m", "min", "mins", "minute", "minutes"],
    h: ["h", "hr", "hrs", "hour", "hours"],
    d: ["d", "day", "days"],
    w: ["w", "week", "weeks"],
    mth: ["mon", "mth", "mths", "month", "months"],
    y: ["y", "yr", "yrs", "year", "years"]
  };
  function parseTimestring(string2, returnUnit, opts) {
    opts = Object.assign({}, DEFAULT_OPTS, opts || {});
    let totalSeconds = 0;
    let unitValues = getUnitValues(opts);
    let groups = string2.toLowerCase().replace(/[^.\w+-]+/g, "").match(/[-+]?[0-9.]+[a-z]+/g);
    if (groups === null) {
      throw new Error(`The string [${string2}] could not be parsed by timestring`);
    }
    groups.forEach((group) => {
      let value = group.match(/[0-9.]+/g)[0];
      let unit = group.match(/[a-z]+/g)[0];
      totalSeconds += getSeconds(value, unit, unitValues);
    });
    if (returnUnit) {
      return convert(totalSeconds, returnUnit, unitValues);
    }
    return totalSeconds;
  }
  function getUnitValues(opts) {
    let unitValues = {
      ms: 1e-3,
      s: 1,
      m: 60,
      h: 3600
    };
    unitValues.d = opts.hoursPerDay * unitValues.h;
    unitValues.w = opts.daysPerWeek * unitValues.d;
    unitValues.mth = opts.daysPerYear / opts.monthsPerYear * unitValues.d;
    unitValues.y = opts.daysPerYear * unitValues.d;
    return unitValues;
  }
  function getUnitKey(unit) {
    for (let key of Object.keys(UNIT_MAP)) {
      if (UNIT_MAP[key].indexOf(unit) > -1) {
        return key;
      }
    }
    throw new Error(`The unit [${unit}] is not supported by timestring`);
  }
  function getSeconds(value, unit, unitValues) {
    return value * unitValues[getUnitKey(unit)];
  }
  function convert(value, unit, unitValues) {
    return value / unitValues[getUnitKey(unit)];
  }
  return timestring$1;
}
var timestringExports = requireTimestring();
const timestring = /* @__PURE__ */ getDefaultExportFromCjs(timestringExports);
function cacheHeader(params) {
  const transformed = Object.entries(params).reduce((acc, [key, value]) => {
    const kebabKey = key.replace(/[A-Z]/g, (char) => "-" + char.toLowerCase());
    return typeof value === "string" || value === true ? [...acc, value === true ? kebabKey : `${kebabKey}=${timestring(value)}`] : acc;
  }, []);
  return transformed.join(", ");
}
const Route$1D = createFileRoute("/ressources/locales")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const lng = _enum(supportedLngs).parse(url.searchParams.get("lng"));
        const namespaces = resources[lng];
        const ns = string().refine((key) => Object.keys(namespaces).includes(String(key))).parse(url.searchParams.get("ns"));
        const headers = new Headers();
        {
          headers.set(
            "Cache-Control",
            cacheHeader({
              maxAge: "1d",
              staleWhileRevalidate: "7d",
              staleIfError: "7d"
            })
          );
        }
        return Response.json(namespaces[ns], { headers });
      }
    }
  }
});
const Route$1C = createFileRoute("/oidc/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const proto = request.headers.get("x-forwarded-proto") ?? url.protocol;
        const secrets = [getServerEnv("SESSION_SECRET")];
        const secure = proto === "https:";
        const oauth2Cookie = getOauth2Cookie({ secrets, secure });
        const rawCookie = await oauth2Cookie.parse(request.headers.get("cookie"));
        const { appConfigRepository, authService } = initServerServices(request);
        const clearOauth2Cookie = await oauth2Cookie.serialize("", { maxAge: 0 });
        if (!code || !state || !rawCookie) {
          return Response.redirect(new URL("/sign-in", request.url).toString(), 302);
        }
        let storedState;
        let codeVerifier;
        try {
          const parsed = JSON.parse(rawCookie);
          storedState = parsed.state;
          codeVerifier = parsed.codeVerifier;
        } catch {
          return new Response("Invalid oauth2 cookie", {
            status: 400,
            headers: { "Set-Cookie": clearOauth2Cookie }
          });
        }
        if (state !== storedState) {
          return new Response("State mismatch", {
            status: 400,
            headers: { "Set-Cookie": clearOauth2Cookie }
          });
        }
        const appConfig = await appConfigRepository.getAppConfig();
        const oidc = await makeOidcService(appConfig);
        let tokens;
        try {
          tokens = await oidc.exchangeCode(code, codeVerifier);
        } catch (err) {
          if (err instanceof Error) {
            await setToast({ type: "error", message: err.message });
          }
          return new Response(null, {
            status: 302,
            headers: [
              ["Location", new URL("/sign-in", request.url).toString()],
              ["Set-Cookie", clearOauth2Cookie]
            ]
          });
        }
        try {
          await authService.authenticateOidc(request, tokens, {
            successRedirect: "/app-router",
            failureRedirect: "/sign-in"
          });
          return new Response(null, { status: 302, headers: { Location: "/sign-in" } });
        } catch (err) {
          if (err instanceof Response && err.status >= 300 && err.status < 400) {
            const headers = new Headers(err.headers);
            headers.append("Set-Cookie", clearOauth2Cookie);
            return new Response(null, { status: err.status, headers });
          }
          throw err;
        }
      }
    }
  }
});
const Route$1B = createFileRoute("/oidc/auth")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { appConfigRepository } = initServerServices(request);
        const appConfig = await appConfigRepository.getAppConfig();
        if (appConfig.auth.provider !== "oidc") {
          return Response.redirect(new URL("/sign-in", request.url).toString(), 302);
        }
        const oidc = await makeOidcService(appConfig);
        const { url, state, codeVerifier } = await oidc.buildAuthorizationUrl();
        const proto = request.headers.get("x-forwarded-proto") ?? new URL(request.url).protocol;
        const oauth2Cookie = getOauth2Cookie({
          secrets: [getServerEnv("SESSION_SECRET")],
          secure: proto === "https:"
        });
        const cookieHeader = await oauth2Cookie.serialize(JSON.stringify({ state, codeVerifier }));
        return new Response(null, {
          status: 302,
          headers: {
            Location: url,
            "Set-Cookie": cookieHeader
          }
        });
      }
    }
  }
});
const $$splitComponentImporter$1e = () => import("./_builder-Ca44XOC9.js");
const appBuilderLayoutLoader = createServerFn().middleware([authMiddleware]).handler(createSsrRpc("84eac02c9d8f666b46122a63a8c2d500f028fba6ad6fe0463043c6d76a73a221"));
const Route$1A = createFileRoute("/_app/_builder")({
  loader: () => appBuilderLayoutLoader(),
  component: lazyRouteComponent($$splitComponentImporter$1e, "component")
});
const authI18n = ["auth", "common"];
const $$splitComponentImporter$1d = () => import("./_auth-DwPMIjk_.js");
const Route$1z = createFileRoute("/_app/_auth")({
  staticData: {
    i18n: authI18n
  },
  beforeLoad: async ({
    context
  }) => {
    await context.i18n.loadNamespaces(["common", "auth"]);
  },
  component: lazyRouteComponent($$splitComponentImporter$1d, "component")
});
const Route$1y = createFileRoute("/ressources/data/export-org")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { authService } = initServerServices(request);
        const { organization } = await authService.isAuthenticated(request, {
          failureRedirect: "/sign-in"
        });
        const exportData = await organization.exportOrganization();
        return new Response(JSON.stringify(exportData), {
          headers: {
            "Content-Type": "application/json",
            "Content-Disposition": 'attachment; filename="org-export.json"'
          }
        });
      }
    }
  }
});
const $$splitComponentImporter$1c = () => import("./user-scoring-CsuPwnSF.js");
const userScoringLayoutLoader = createServerFn().middleware([authMiddleware]).handler(createSsrRpc("69c1121ba3b9733ad8a1ec4ec65753e354d35c7612bd9734056c85c59b5b1017"));
const Route$1x = createFileRoute("/_app/_builder/user-scoring")({
  staticData: {
    i18n: ["common", "user-scoring"]
  },
  loader: () => userScoringLayoutLoader(),
  component: lazyRouteComponent($$splitComponentImporter$1c, "component")
});
const $$splitComponentImporter$1b = () => import("./settings-BJTktQAJ.js");
const settingsLoader = createServerFn().middleware([authMiddleware]).handler(createSsrRpc("20e27ce745bfa21d99c5049a732de6c906a0875b8c80d67d3c2cf4e7ba6179e2"));
const Route$1w = createFileRoute("/_app/_builder/settings")({
  staticData: {
    BreadCrumbs: [({
      isLast
    }) => {
      const {
        t: t2
      } = useTranslation(["settings"]);
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/settings/api-keys", className: cn("text-s flex items-center font-bold transition-colors", {
        "text-grey-secondary hover:text-grey-primary": !isLast
      }), children: t2("settings:api") });
    }]
  },
  loader: () => settingsLoader(),
  component: lazyRouteComponent($$splitComponentImporter$1b, "component")
});
const AgnosticNavigationContext = createSimpleContext("AgnosticNavigation");
const useAgnosticNavigation = () => {
  return AgnosticNavigationContext.useValue();
};
const pageLayoutGutter = {
  padding: "p-md gap-md md:p-lg md:gap-lg lg:px-2xl lg:gap-2xl lg:py-lg",
  paddingX: "px-md md:px-lg lg:px-2xl",
  paddingTop: "pt-md md:pt-lg lg:pt-lg",
  bleedX: "-mx-md md:-mx-lg lg:-mx-2xl",
  bleedBottom: "-mb-md md:-mb-lg lg:-mb-lg",
  footerPaddingY: "pt-md pb-md md:pb-lg lg:pb-lg"
};
const PageStickyFooter = reactExports.forwardRef(function PageStickyFooter2({ className, surface = "page", ...props }, ref) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      ref,
      className: cn(
        "sticky bottom-0 flex items-center justify-between border-t border-transparent",
        surface === "page" ? "bg-surface-page" : "bg-surface-card",
        pageLayoutGutter.bleedX,
        pageLayoutGutter.bleedBottom,
        pageLayoutGutter.paddingX,
        pageLayoutGutter.footerPaddingY,
        className
      ),
      ...props
    }
  );
});
PageStickyFooter.displayName = "PageStickyFooter";
function PageMain({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: cn("relative bg-surface-page flex flex-1 flex-col", className), ...props });
}
function PageHeader({ className, children, color, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(StickyComponent, { sentinelClassName: "top-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: cn(
        "sticky top-0 z-1 h-12 text-l flex shrink-0 flex-row items-center font-semibold px-md bg-surface-page border-y border-transparent sentinel-intersect:border-b-grey-border sentinel-intersect:shadow-sticky-top",
        className
      ),
      ...props,
      children
    }
  ) });
}
const PageContainer = reactExports.forwardRef(function PageContainer2({ className, children, ...props }, ref) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref, className: cn("flex min-w-0 flex-1 flex-col", className), ...props, children });
});
const pageDescriptionClassName = cva(
  "bg-grey-white text-s text-grey-secondary flex flex-row gap-sm p-md font-normal border-grey-border dark:bg-grey-background",
  {
    variants: {
      headerBanner: {
        true: "border-b",
        false: "border rounded-md "
      }
    },
    defaultVariants: {
      headerBanner: false
    }
  }
);
function PageDescription({
  className,
  withIcon = true,
  headerBanner = false,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: cn(pageDescriptionClassName({ headerBanner }), className), ...props, children: [
    withIcon ? /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "tip", className: "size-5 shrink-0" }) : null,
    props.children
  ] });
}
const PageContentClassName = cva("flex flex-1 flex-col text-default", {
  variants: {
    padding: {
      default: pageLayoutGutter.padding,
      compact: "p-md gap-md",
      none: "p-0"
    },
    width: {
      fluid: null,
      readable: "w-full max-w-(--breakpoint-xl)",
      form: "w-full max-w-(--breakpoint-lg)",
      table: "min-w-0 w-full"
    },
    centered: {
      true: "mx-auto",
      false: null
    }
  },
  defaultVariants: {
    padding: "default",
    width: "fluid",
    centered: false
  }
});
function PageContent({ className, centered, padding, width, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: PageContentClassName({ centered, padding, width, className }), ...props });
}
function PageBackLink({ className: _className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { className: CtaV2ClassName({ variant: "secondary", appearance: "stroked", mode: "icon" }), ...props, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "arrow-left", className: "size-4 rtl:rotate-180", "aria-hidden": true }) });
}
const Page = {
  Main: PageMain,
  Header: PageHeader,
  BackLink: PageBackLink,
  Container: PageContainer,
  Content: PageContent,
  StickyFooter: PageStickyFooter,
  Description: PageDescription
};
const BreadCrumbLinkInner = React.forwardRef(
  ({ isLast, className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    "a",
    {
      ref,
      ...props,
      className: cn(
        "text-h2 flex items-center font-semibold transition-colors shrink-0",
        { "text-grey-placeholder hover:text-grey-primary": !isLast },
        className
      ),
      children
    }
  )
);
BreadCrumbLinkInner.displayName = "BreadCrumbLinkInner";
const CreatedBreadCrumbLink = createLink(BreadCrumbLinkInner);
const BreadCrumbLink = (props) => /* @__PURE__ */ jsxRuntimeExports.jsx(CreatedBreadCrumbLink, { preload: "intent", ...props });
const BreadCrumbs = ({ back }) => {
  const matches = useMatches();
  const links = reactExports.useMemo(
    () => matches.filter((match2) => Boolean(match2.staticData?.BreadCrumbs)).map((match2) => ({
      Elements: match2.staticData?.BreadCrumbs?.filter(Boolean),
      pathname: match2.pathname,
      data: match2.loaderData
    })),
    [matches]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row items-center gap-md", children: [
    back ? /* @__PURE__ */ jsxRuntimeExports.jsx(Page.BackLink, { to: back }) : links.length > 1 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Page.BackLink, { to: links.at(-2).pathname }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-sm items-center", children: links.map(({ Elements, pathname, data }, linkIndex) => {
      const isLastLink = linkIndex === links.length - 1;
      return Elements ? Elements.map((Element, elementIndex) => {
        const isLastElement = elementIndex === Elements.length - 1;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(reactExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Element, { isLast: isLastElement && isLastLink, data }, pathname),
          !(isLastElement && isLastLink) ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-h2 text-grey-disabled font-semibold", children: "/" }) : null
        ] }, `${pathname}-${elementIndex}`);
      }) : null;
    }) })
  ] });
};
const BackButton = ({ back }) => {
  const matches = useMatches();
  const links = reactExports.useMemo(
    () => matches.filter((match2) => Boolean(match2.staticData?.BreadCrumbs)).map((match2) => ({
      Elements: match2.staticData?.BreadCrumbs?.filter(Boolean),
      pathname: match2.pathname
    })),
    [matches]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-row items-center gap-md", children: back ? /* @__PURE__ */ jsxRuntimeExports.jsx(Page.BackLink, { to: back }) : links.length > 1 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Page.BackLink, { to: links.at(-2).pathname }) : null });
};
const $$splitComponentImporter$1a = () => import("./screening-search-CfFaSTLi.js");
const screeningSearchLayoutLoader = createServerFn().middleware([authMiddleware]).handler(createSsrRpc("2d2244244a5c168d712065e928972a8ce0e9d423fb5e81e7fd9a076255d70447"));
const Route$1v = createFileRoute("/_app/_builder/screening-search")({
  loader: () => screeningSearchLayoutLoader(),
  staticData: {
    BreadCrumbs: [({
      isLast
    }) => {
      const {
        t: t2
      } = useTranslation(["navigation"]);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(BreadCrumbLink, { to: "/screening-search", isLast, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "search", className: "me-sm size-6" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t2("navigation:screening_search") })
      ] });
    }]
  },
  component: lazyRouteComponent($$splitComponentImporter$1a, "component")
});
const $$splitComponentImporter$19 = () => import("./detection-CfFaSTLi.js");
const detectionLayoutLoader = createServerFn().middleware([authMiddleware]).handler(createSsrRpc("96e778b85525688a73f39daf945f12d0e8bf1582e4d62ff331d7c45582857d17"));
const Route$1u = createFileRoute("/_app/_builder/detection")({
  loader: () => detectionLayoutLoader(),
  staticData: {
    BreadCrumbs: [({
      isLast
    }) => {
      const {
        t: t2
      } = useTranslation(["navigation"]);
      return /* @__PURE__ */ jsxRuntimeExports.jsx(BreadCrumbLink, { to: "/detection", isLast, children: t2("navigation:detection") });
    }]
  },
  component: lazyRouteComponent($$splitComponentImporter$19, "component")
});
const $$splitComponentImporter$18 = () => import("./data-CpXClvSV.js");
const dataLayoutLoader = createServerFn().middleware([authMiddleware]).handler(createSsrRpc("0e375d3bb3847f92ec1d82fa9791a13d9afc0aafdf4095f73e9c449e03486792"));
const Route$1t = createFileRoute("/_app/_builder/data")({
  staticData: {
    i18n: ["navigation", "data"]
  },
  loader: () => dataLayoutLoader(),
  component: lazyRouteComponent($$splitComponentImporter$18, "component")
});
const $$splitComponentImporter$17 = () => import("./continuous-screening-CfFaSTLi.js");
const continuousScreeningLayoutLoader = createServerFn().middleware([authMiddleware]).handler(createSsrRpc("9e373c98a7ca5a88e36577c19656bba7280c710ca1f4b629f115dca016dcf558"));
const Route$1s = createFileRoute("/_app/_builder/continuous-screening")({
  loader: () => continuousScreeningLayoutLoader(),
  component: lazyRouteComponent($$splitComponentImporter$17, "component")
});
const $$splitComponentImporter$16 = () => import("./cases-Ds3M3Lgj.js");
const casesLayoutLoader = createServerFn().middleware([authMiddleware]).handler(createSsrRpc("4cbe671987772f5e5209a26475aa49126a52dc94032d8df86778e6294fcc7c20"));
const Route$1r = createFileRoute("/_app/_builder/cases")({
  staticData: {
    BreadCrumbs: [({
      isLast
    }) => {
      const {
        t: t2
      } = useTranslation(["navigation"]);
      return /* @__PURE__ */ jsxRuntimeExports.jsx(BreadCrumbLink, { to: "/cases", isLast, children: t2("navigation:case_manager") });
    }]
  },
  loader: () => casesLayoutLoader(),
  component: lazyRouteComponent($$splitComponentImporter$16, "component")
});
const $$splitErrorComponentImporter$f = () => import("./analytics-legacy-CF6dbxnC.js");
const $$splitComponentImporter$15 = () => import("./analytics-legacy-BX-Grw8B.js");
const analyticsLegacyLoader = createServerFn().middleware([authMiddleware]).handler(createSsrRpc("f83b5212fec014171a188acfaf7c75cdb389ad95ff8015a1b0d5e8fe47315f6b"));
const Route$1q = createFileRoute("/_app/_builder/analytics-legacy")({
  staticData: {
    BreadCrumbs: [({
      isLast
    }) => {
      const {
        t: t2
      } = useTranslation(["navigation"]);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(BreadCrumbLink, { to: "/detection/analytics", isLast, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "analytics", className: "me-sm size-6" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "line-clamp-1 text-start", children: t2("navigation:analytics") })
      ] });
    }]
  },
  staleTime: Infinity,
  loader: () => analyticsLegacyLoader(),
  component: lazyRouteComponent($$splitComponentImporter$15, "component"),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$f, "errorComponent")
});
const $$splitComponentImporter$14 = () => import("./account-CNTC-wrE.js");
const Route$1p = createFileRoute("/_app/_builder/account")({
  staticData: {
    BreadCrumbs: [({
      isLast
    }) => {
      const {
        t: t2
      } = useTranslation(["navigation"]);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(BreadCrumbLink, { to: "/account", isLast, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "user", className: "me-sm size-6" }),
        t2("navigation:my_account")
      ] });
    }]
  },
  component: lazyRouteComponent($$splitComponentImporter$14, "component")
});
const $$splitComponentImporter$13 = () => import("./sign-in-email-Co5YqstG.js");
const signInEmailLoader = createServerFn().middleware([servicesMiddleware]).handler(createSsrRpc("bf0a785a637f5f2a759fbb1e8081bc8508a66bcb98e6fac8cace8c3cf4b681c8"));
const Route$1o = createFileRoute("/_app/_auth/sign-in-email")({
  staticData: {
    i18n: authI18n
  },
  loader: () => signInEmailLoader(),
  component: lazyRouteComponent($$splitComponentImporter$13, "component")
});
const $$splitErrorComponentImporter$e = () => import("./sign-in-D7mcni8N.js");
const $$splitComponentImporter$12 = () => import("./sign-in-gLIcNPm5.js");
const signInLoader = createServerFn().middleware([servicesMiddleware]).handler(createSsrRpc("35a259fecdcb9b6f37e5d9af14cde2d19eb31c44df12758aaa353d284a9d912b"));
const Route$1n = createFileRoute("/_app/_auth/sign-in")({
  staticData: {
    i18n: authI18n
  },
  loader: () => signInLoader(),
  component: lazyRouteComponent($$splitComponentImporter$12, "component"),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$e, "errorComponent")
});
const $$splitComponentImporter$11 = () => import("./email-verification-DjQ04ybR.js");
const emailVerificationLoader = createServerFn().middleware([servicesMiddleware]).handler(createSsrRpc("f6ade2d030bce8b55f721d90fa3d9327598258d26781c52971bd4ed5ea65533e"));
const Route$1m = createFileRoute("/_app/_auth/email-verification")({
  staticData: {
    i18n: authI18n,
    alignment: "reverse"
  },
  loader: () => emailVerificationLoader(),
  component: lazyRouteComponent($$splitComponentImporter$11, "component")
});
const $$splitComponentImporter$10 = () => import("./create-password-zFtFAPnY.js");
const createPasswordLoader = createServerFn().middleware([servicesMiddleware]).handler(createSsrRpc("6da7fd1e937eb76a3da98c1eae2f5b00ba1261770e9e39059ea4e42fb39c05a0"));
const Route$1l = createFileRoute("/_app/_auth/create-password")({
  staticData: {
    i18n: authI18n
  },
  loader: () => createPasswordLoader(),
  component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
const authRedirectLoader = createServerFn().middleware([servicesMiddleware]).handler(createSsrRpc("e43e9eeaeb4c49ea457b7f8042a90611c35a760ccb59ce0e4665bdd220dc0283"));
const Route$1k = createFileRoute("/_app/_auth/auth-redirect")({
  loader: () => authRedirectLoader()
});
const Route$1j = createFileRoute("/_app/_builder/user-scoring/")({
  beforeLoad: () => {
    throw redirect({ to: "/user-scoring/overview" });
  }
});
const settingsIndexLoader = createServerFn().middleware([authMiddleware]).handler(createSsrRpc("00f474f606094326aac4853c55df25d8ac5a87795e7d4c1cf0744ba261b351f7"));
const Route$1i = createFileRoute("/_app/_builder/settings/")({
  loader: () => settingsIndexLoader()
});
const $$splitComponentImporter$$ = () => import("./index-D429ZdMm.js");
const $$splitErrorComponentImporter$d = () => import("./index-D_ngG3T3.js");
const screeningSearchLoader = createServerFn().middleware([authMiddleware]).handler(createSsrRpc("ed369d932318dab0b42256698a8e38d6f47487bdb776a258c2db28c0893fff84"));
const Route$1h = createFileRoute("/_app/_builder/screening-search/")({
  staticData: {
    i18n: ["common", "screenings", "navigation"]
  },
  loader: () => screeningSearchLoader(),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$d, "errorComponent"),
  component: lazyRouteComponent($$splitComponentImporter$$, "component")
});
const Route$1g = createFileRoute("/_app/_builder/detection/")({
  beforeLoad: () => {
    throw redirect({ to: "/detection/scenarios" });
  }
});
const Route$1f = createFileRoute("/_app/_builder/data/")({
  beforeLoad: () => {
    throw redirect({ to: "/data/list" });
  }
});
const Route$1e = createFileRoute("/_app/_builder/continuous-screening/")({
  beforeLoad: () => {
    throw redirect({ to: "/continuous-screening/configurations" });
  }
});
const $$splitComponentImporter$_ = () => import("./index-DwOhNEaT.js");
const queryParams = object({
  table: string().optional(),
  terms: string().optional()
});
const getClientDetailFn = createServerFn().middleware([authMiddleware]).validator(queryParams).handler(createSsrRpc("318de7514267a3ed50ed84a75ae117487815eee16ca25aa6098d21129a219ebe"));
const Route$1d = createFileRoute("/_app/_builder/client-detail/")({
  validateSearch: queryParams,
  loaderDeps: ({
    search: {
      table,
      terms
    }
  }) => ({
    table,
    terms
  }),
  loader: ({
    deps
  }) => getClientDetailFn({
    data: deps
  }),
  component: lazyRouteComponent($$splitComponentImporter$_, "component")
});
const casesIndexLoader = createServerFn().middleware([authMiddleware]).handler(createSsrRpc("17ca890b622271b903097bbbed576a63389f3e45f0e5e1b1486d9f95d5f111f1"));
const Route$1c = createFileRoute("/_app/_builder/cases/")({
  loader: () => casesIndexLoader()
});
const Route$1b = createFileRoute("/ressources/lists/download-csv-file/$listId")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const { authService } = initServerServices(request);
        const { customListsRepository } = await authService.isAuthenticated(request, {
          failureRedirect: "/sign-in"
        });
        const listId = fromParams(params, "listId");
        const fileContents = await customListsRepository.downloadValues(listId);
        return new Response(fileContents, {
          headers: {
            "Content-Disposition": `attachment; filename="list-${listId}.csv"`,
            "Content-Type": "text/csv"
          }
        });
      }
    }
  }
});
const Route$1a = createFileRoute("/ressources/cases/next-unassigned/$caseId")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const { authService } = initServerServices(request);
        const { cases } = await authService.isAuthenticated(request, {
          failureRedirect: "/sign-in"
        });
        const fallback = `/cases/inboxes/${MY_INBOX_ID}`;
        try {
          const caseId = fromParams(params, "caseId");
          const nextCaseId = await cases.getNextUnassignedCaseId({ caseId });
          return new Response(null, {
            status: 302,
            headers: { Location: nextCaseId ? `/cases/${fromUUIDtoSUUID(nextCaseId)}` : fallback }
          });
        } catch {
          return new Response(null, { status: 302, headers: { Location: fallback } });
        }
      }
    }
  }
});
const Route$19 = createFileRoute("/ressources/cases/download-file/$fileId")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const { authService } = initServerServices(request);
        const { cases: caseRepository } = await authService.isAuthenticated(request, {
          failureRedirect: "/sign-in"
        });
        const fileId = params["fileId"];
        invariant$1(fileId);
        return Response.json(await caseRepository.getCaseFileDownloadLink(fileId));
      }
    }
  }
});
const Route$18 = createFileRoute("/ressources/cases/download-data/$caseId")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const { authService } = initServerServices(request);
        const { tokenService } = await authService.isAuthenticated(request, {
          failureRedirect: "/sign-in"
        });
        const caseId = params["caseId"];
        invariant$1(caseId);
        return fetch(`${getServerEnv("MARBLE_API_URL")}${getCaseInvestigationDataDownloadEndpoint(caseId)}`, {
          headers: {
            Authorization: `Bearer ${await tokenService.getToken()}`
          }
        });
      }
    }
  }
});
const $$splitComponentImporter$Z = () => import("./overview-C5sxOCIs.js");
const Route$17 = createFileRoute("/_app/_builder/user-scoring/overview")({
  staticData: {
    showCreateRulesetButton: true
  },
  component: lazyRouteComponent($$splitComponentImporter$Z, "component")
});
const $$splitComponentImporter$Y = () => import("./_objectType-B60ZEwOh.js");
const uploadLoader = createServerFn().middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("700b8869e924868568e980111bd9786fcca6b7b6bd9ab16530036194587957dc"));
const Route$16 = createFileRoute("/_app/_builder/upload/$objectType")({
  staticData: {
    i18n: ["common", "upload"]
  },
  loader: ({
    params
  }) => uploadLoader({
    data: {
      params
    }
  }),
  component: lazyRouteComponent($$splitComponentImporter$Y, "component")
});
const $$splitErrorComponentImporter$c = () => import("./webhooks-AF9PyqjI.js");
const $$splitComponentImporter$X = () => import("./webhooks-BeE-lFGW.js");
const webhooksLoader = createServerFn().middleware([authMiddleware]).handler(createSsrRpc("dc01a82806619825cf27ba790d89ffc7a69cc8ea1332600ea74ae86881644b5a"));
const Route$15 = createFileRoute("/_app/_builder/settings/webhooks")({
  loader: () => webhooksLoader(),
  component: lazyRouteComponent($$splitComponentImporter$X, "component"),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$c, "errorComponent")
});
const $$splitComponentImporter$W = () => import("./users-FC91CwIg.js");
const usersLoader = createServerFn().middleware([authMiddleware]).handler(createSsrRpc("4ee212221fd2c5a6804cf0cbc02015d124e15beabde51f40dfd55a284d3b7eba"));
const Route$14 = createFileRoute("/_app/_builder/settings/users")({
  loader: () => usersLoader(),
  component: lazyRouteComponent($$splitComponentImporter$W, "component")
});
const $$splitComponentImporter$V = () => import("./tags-CIz2PL_8.js");
const tagsLoader = createServerFn().middleware([authMiddleware]).handler(createSsrRpc("7742794cc8be33a097adf2021e2e520283bee78d2312e4fcf4ba47a465cadff1"));
const Route$13 = createFileRoute("/_app/_builder/settings/tags")({
  loader: () => tagsLoader(),
  component: lazyRouteComponent($$splitComponentImporter$V, "component")
});
const $$splitComponentImporter$U = () => import("./screening-providers-C6Oy93xd.js");
const screeningProvidersLoader = createServerFn().middleware([authMiddleware]).handler(createSsrRpc("75a4947011a2503d8a104142cd6ac180bd616d9a9a6fd524eeb348bf5f5c4e54"));
const Route$12 = createFileRoute("/_app/_builder/settings/screening-providers")({
  loader: () => screeningProvidersLoader(),
  component: lazyRouteComponent($$splitComponentImporter$U, "component")
});
const $$splitComponentImporter$T = () => import("./scenarios-CZcoxOqV.js");
const scenariosLoader$1 = createServerFn().middleware([authMiddleware]).handler(createSsrRpc("e82cb92e0a1421821b2b686ddfb11374aaf0f63a2e78c46cbf81f54b996fb5b9"));
const Route$11 = createFileRoute("/_app/_builder/settings/scenarios")({
  loader: () => scenariosLoader$1(),
  component: lazyRouteComponent($$splitComponentImporter$T, "component")
});
const $$splitComponentImporter$S = () => import("./ip-whitelisting-XKYHLQeJ.js");
const ipWhitelistingLoader = createServerFn().middleware([authMiddleware]).handler(createSsrRpc("afff74a332f61da07ae725d09d5dc8755e663effc4cc7c6dd4c465b5bb29b65b"));
const Route$10 = createFileRoute("/_app/_builder/settings/ip-whitelisting")({
  loader: () => ipWhitelistingLoader(),
  component: lazyRouteComponent($$splitComponentImporter$S, "component")
});
const $$splitComponentImporter$R = () => import("./inboxes-CfFaSTLi.js");
const Route$$ = createFileRoute("/_app/_builder/settings/inboxes")({
  component: lazyRouteComponent($$splitComponentImporter$R, "component")
});
const DEFAULT_LIMIT = 25;
const $$splitComponentImporter$Q = () => import("./audit-logs-BWOEsyDt.js");
const pageQueryStringSchema$1 = object({
  q: string().optional().default(""),
  limit: number().optional().default(DEFAULT_LIMIT)
});
const activityFollowUpLoaderSchema = object({
  query: pageQueryStringSchema$1
});
const activityFollowUpLoader = createServerFn().middleware([authMiddleware]).validator(activityFollowUpLoaderSchema).handler(createSsrRpc("3b96000682e0b8b7a52a852b0752ff57a7956f274a561ca3c1cc9ac7a2b0fd9d"));
const Route$_ = createFileRoute("/_app/_builder/settings/audit-logs")({
  validateSearch: pageQueryStringSchema$1,
  loaderDeps: ({
    search
  }) => search,
  loader: ({
    deps
  }) => activityFollowUpLoader({
    data: {
      query: deps
    }
  }),
  component: lazyRouteComponent($$splitComponentImporter$Q, "component")
});
const $$splitComponentImporter$P = () => import("./api-keys-DE61KPF6.js");
const apiKeysLoader = createServerFn().middleware([authMiddleware]).handler(createSsrRpc("9a9ceeadd477b9b71ffa23dfcfc00027094ddb47f7d18acd749a9f69fcc0b4b2"));
const Route$Z = createFileRoute("/_app/_builder/settings/api-keys")({
  loader: () => apiKeysLoader(),
  component: lazyRouteComponent($$splitComponentImporter$P, "component")
});
const $$splitComponentImporter$O = () => import("./analytics-CfFaSTLi.js");
const Route$Y = createFileRoute("/_app/_builder/settings/analytics")({
  component: lazyRouteComponent($$splitComponentImporter$O, "component")
});
const $$splitComponentImporter$N = () => import("./scenarios-CfFaSTLi.js");
const Route$X = createFileRoute("/_app/_builder/detection/scenarios")({
  staticData: {
    BreadCrumbs: [({
      isLast
    }) => {
      const {
        t: t2
      } = useTranslation(["navigation"]);
      return /* @__PURE__ */ jsxRuntimeExports.jsx(BreadCrumbLink, { to: "/detection/scenarios", isLast, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t2("navigation:scenarios") }) });
    }]
  },
  component: lazyRouteComponent($$splitComponentImporter$N, "component")
});
const $$splitComponentImporter$M = () => import("./lists-CfFaSTLi.js");
const Route$W = createFileRoute("/_app/_builder/detection/lists")({
  staticData: {
    BreadCrumbs: [({
      isLast
    }) => {
      const {
        t: t2
      } = useTranslation(["navigation"]);
      return /* @__PURE__ */ jsxRuntimeExports.jsx(BreadCrumbLink, { to: "/detection/lists", isLast, children: t2("navigation:lists") });
    }]
  },
  component: lazyRouteComponent($$splitComponentImporter$M, "component")
});
const $$splitComponentImporter$L = () => import("./decisions-P8Ogzw73.js");
const decisionsLayoutLoader = createServerFn().middleware([authMiddleware]).handler(createSsrRpc("532d11a3a313e967206b28dfb4fe70321052b586d522af5bec2717900087a9a1"));
const Route$V = createFileRoute("/_app/_builder/detection/decisions")({
  loader: () => decisionsLayoutLoader(),
  staticData: {
    BreadCrumbs: [({
      isLast
    }) => {
      const {
        t: t2
      } = useTranslation(["navigation"]);
      return /* @__PURE__ */ jsxRuntimeExports.jsx(BreadCrumbLink, { to: "/detection/decisions", isLast, children: t2("navigation:decisions") });
    }]
  },
  component: lazyRouteComponent($$splitComponentImporter$L, "component")
});
const $$splitComponentImporter$K = () => import("./analytics-BFLjcje2.js");
const analyticsLayoutLoader = createServerFn().middleware([authMiddleware]).handler(createSsrRpc("be70655bf46ebde519b189f0f0a811452f0cf60518a6ffc381b86125323c6449"));
const Route$U = createFileRoute("/_app/_builder/detection/analytics")({
  loader: () => analyticsLayoutLoader(),
  staticData: {
    BreadCrumbs: [({
      isLast
    }) => {
      const {
        t: t2
      } = useTranslation(["navigation"]);
      return /* @__PURE__ */ jsxRuntimeExports.jsx(BreadCrumbLink, { to: "/detection/analytics", isLast, children: t2("navigation:analytics") });
    }]
  },
  component: lazyRouteComponent($$splitComponentImporter$K, "component")
});
const dataI18n = ["common", "data"];
reactExports.forwardRef(
  function SchemaMenuMenuButton2({ className, ...props }, ref) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      MenuButton,
      {
        ref,
        className: clsx(
          "hover:bg-purple-hover active:bg-purple-hover text-grey-white bg-purple-primary flex size-fit flex-row gap-xs rounded-sm p-sm",
          className
        ),
        ...props
      }
    );
  }
);
reactExports.forwardRef(
  function SchemaMenuMenuPopover2({ className, ...props }, ref) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      MenuPopover,
      {
        ref,
        modal: true,
        unmountOnHide: false,
        className: clsx("flex flex-col gap-sm p-sm", className),
        ...props
      }
    );
  }
);
reactExports.forwardRef(
  function SchemaMenuMenuItem2({ className, ...props }, ref) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      MenuItem,
      {
        ref,
        className: clsx(
          "data-active-item:bg-purple-background-light flex flex-row gap-sm rounded-sm p-sm outline-hidden",
          className
        ),
        ...props
      }
    );
  }
);
var ge = Object.defineProperty;
var fn = (e2, n2) => {
  for (var t2 in n2) ge(e2, t2, { get: n2[t2], enumerable: true });
};
var z = {};
fn(z, { Graph: () => p, alg: () => R, json: () => ye, version: () => pn });
var bn = Object.defineProperty, Le = (e2, n2) => {
  for (var t2 in n2) bn(e2, t2, { get: n2[t2], enumerable: true });
}, p = class {
  constructor(e2) {
    this._isDirected = true, this._isMultigraph = false, this._isCompound = false, this._nodes = {}, this._in = {}, this._preds = {}, this._out = {}, this._sucs = {}, this._edgeObjs = {}, this._edgeLabels = {}, this._nodeCount = 0, this._edgeCount = 0, this._defaultNodeLabelFn = () => {
    }, this._defaultEdgeLabelFn = () => {
    }, e2 && (this._isDirected = "directed" in e2 ? e2.directed : true, this._isMultigraph = "multigraph" in e2 ? e2.multigraph : false, this._isCompound = "compound" in e2 ? e2.compound : false), this._isCompound && (this._parent = {}, this._children = {}, this._children["\0"] = {});
  }
  isDirected() {
    return this._isDirected;
  }
  isMultigraph() {
    return this._isMultigraph;
  }
  isCompound() {
    return this._isCompound;
  }
  setGraph(e2) {
    return this._label = e2, this;
  }
  graph() {
    return this._label;
  }
  setDefaultNodeLabel(e2) {
    return typeof e2 != "function" ? this._defaultNodeLabelFn = () => e2 : this._defaultNodeLabelFn = e2, this;
  }
  nodeCount() {
    return this._nodeCount;
  }
  nodes() {
    return Object.keys(this._nodes);
  }
  sources() {
    return this.nodes().filter((e2) => Object.keys(this._in[e2]).length === 0);
  }
  sinks() {
    return this.nodes().filter((e2) => Object.keys(this._out[e2]).length === 0);
  }
  setNodes(e2, n2) {
    return e2.forEach((t2) => {
      n2 !== void 0 ? this.setNode(t2, n2) : this.setNode(t2);
    }), this;
  }
  setNode(e2, n2) {
    return e2 in this._nodes ? (arguments.length > 1 && (this._nodes[e2] = n2), this) : (this._nodes[e2] = arguments.length > 1 ? n2 : this._defaultNodeLabelFn(e2), this._isCompound && (this._parent[e2] = "\0", this._children[e2] = {}, this._children["\0"][e2] = true), this._in[e2] = {}, this._preds[e2] = {}, this._out[e2] = {}, this._sucs[e2] = {}, ++this._nodeCount, this);
  }
  node(e2) {
    return this._nodes[e2];
  }
  hasNode(e2) {
    return e2 in this._nodes;
  }
  removeNode(e2) {
    if (e2 in this._nodes) {
      let n2 = (t2) => this.removeEdge(this._edgeObjs[t2]);
      delete this._nodes[e2], this._isCompound && (this._removeFromParentsChildList(e2), delete this._parent[e2], this.children(e2).forEach((t2) => {
        this.setParent(t2);
      }), delete this._children[e2]), Object.keys(this._in[e2]).forEach(n2), delete this._in[e2], delete this._preds[e2], Object.keys(this._out[e2]).forEach(n2), delete this._out[e2], delete this._sucs[e2], --this._nodeCount;
    }
    return this;
  }
  setParent(e2, n2) {
    if (!this._isCompound) throw new Error("Cannot set parent in a non-compound graph");
    if (n2 === void 0) n2 = "\0";
    else {
      n2 += "";
      for (let t2 = n2; t2 !== void 0; t2 = this.parent(t2)) if (t2 === e2) throw new Error("Setting " + n2 + " as parent of " + e2 + " would create a cycle");
      this.setNode(n2);
    }
    return this.setNode(e2), this._removeFromParentsChildList(e2), this._parent[e2] = n2, this._children[n2][e2] = true, this;
  }
  parent(e2) {
    if (this._isCompound) {
      let n2 = this._parent[e2];
      if (n2 !== "\0") return n2;
    }
  }
  children(e2 = "\0") {
    if (this._isCompound) {
      let n2 = this._children[e2];
      if (n2) return Object.keys(n2);
    } else {
      if (e2 === "\0") return this.nodes();
      if (this.hasNode(e2)) return [];
    }
    return [];
  }
  predecessors(e2) {
    let n2 = this._preds[e2];
    if (n2) return Object.keys(n2);
  }
  successors(e2) {
    let n2 = this._sucs[e2];
    if (n2) return Object.keys(n2);
  }
  neighbors(e2) {
    let n2 = this.predecessors(e2);
    if (n2) {
      let t2 = new Set(n2);
      for (let r of this.successors(e2)) t2.add(r);
      return Array.from(t2.values());
    }
  }
  isLeaf(e2) {
    let n2;
    return this.isDirected() ? n2 = this.successors(e2) : n2 = this.neighbors(e2), n2.length === 0;
  }
  filterNodes(e2) {
    let n2 = new this.constructor({ directed: this._isDirected, multigraph: this._isMultigraph, compound: this._isCompound });
    n2.setGraph(this.graph()), Object.entries(this._nodes).forEach(([o, i]) => {
      e2(o) && n2.setNode(o, i);
    }), Object.values(this._edgeObjs).forEach((o) => {
      n2.hasNode(o.v) && n2.hasNode(o.w) && n2.setEdge(o, this.edge(o));
    });
    let t2 = {}, r = (o) => {
      let i = this.parent(o);
      return !i || n2.hasNode(i) ? (t2[o] = i != null ? i : void 0, i != null ? i : void 0) : i in t2 ? t2[i] : r(i);
    };
    return this._isCompound && n2.nodes().forEach((o) => n2.setParent(o, r(o))), n2;
  }
  setDefaultEdgeLabel(e2) {
    return typeof e2 != "function" ? this._defaultEdgeLabelFn = () => e2 : this._defaultEdgeLabelFn = e2, this;
  }
  edgeCount() {
    return this._edgeCount;
  }
  edges() {
    return Object.values(this._edgeObjs);
  }
  setPath(e2, n2) {
    return e2.reduce((t2, r) => (n2 !== void 0 ? this.setEdge(t2, r, n2) : this.setEdge(t2, r), r)), this;
  }
  setEdge(e2, n2, t2, r) {
    let o, i, s, a, d = false;
    typeof e2 == "object" && e2 !== null && "v" in e2 ? (o = e2.v, i = e2.w, s = e2.name, arguments.length === 2 && (a = n2, d = true)) : (o = e2, i = n2, s = r, arguments.length > 2 && (a = t2, d = true)), o = "" + o, i = "" + i, s !== void 0 && (s = "" + s);
    let l = C(this._isDirected, o, i, s);
    if (l in this._edgeLabels) return d && (this._edgeLabels[l] = a), this;
    if (s !== void 0 && !this._isMultigraph) throw new Error("Cannot set a named edge when isMultigraph = false");
    this.setNode(o), this.setNode(i), this._edgeLabels[l] = d ? a : this._defaultEdgeLabelFn(o, i, s);
    let u = gn(this._isDirected, o, i, s);
    return o = u.v, i = u.w, Object.freeze(u), this._edgeObjs[l] = u, me(this._preds[i], o), me(this._sucs[o], i), this._in[i][l] = u, this._out[o][l] = u, this._edgeCount++, this;
  }
  edge(e2, n2, t2) {
    let r = arguments.length === 1 ? Y(this._isDirected, e2) : C(this._isDirected, e2, n2, t2);
    return this._edgeLabels[r];
  }
  edgeAsObj(e2, n2, t2) {
    let r = arguments.length === 1 ? this.edge(e2) : this.edge(e2, n2, t2);
    return typeof r != "object" ? { label: r } : r;
  }
  hasEdge(e2, n2, t2) {
    return (arguments.length === 1 ? Y(this._isDirected, e2) : C(this._isDirected, e2, n2, t2)) in this._edgeLabels;
  }
  removeEdge(e2, n2, t2) {
    let r = arguments.length === 1 ? Y(this._isDirected, e2) : C(this._isDirected, e2, n2, t2), o = this._edgeObjs[r];
    if (o) {
      let i = o.v, s = o.w;
      delete this._edgeLabels[r], delete this._edgeObjs[r], Ee(this._preds[s], i), Ee(this._sucs[i], s), delete this._in[s][r], delete this._out[i][r], this._edgeCount--;
    }
    return this;
  }
  inEdges(e2, n2) {
    return this.isDirected() ? this.filterEdges(this._in[e2], e2, n2) : this.nodeEdges(e2, n2);
  }
  outEdges(e2, n2) {
    return this.isDirected() ? this.filterEdges(this._out[e2], e2, n2) : this.nodeEdges(e2, n2);
  }
  nodeEdges(e2, n2) {
    if (e2 in this._nodes) return this.filterEdges({ ...this._in[e2], ...this._out[e2] }, e2, n2);
  }
  _removeFromParentsChildList(e2) {
    delete this._children[this._parent[e2]][e2];
  }
  filterEdges(e2, n2, t2) {
    if (!e2) return;
    let r = Object.values(e2);
    return t2 ? r.filter((o) => o.v === n2 && o.w === t2 || o.v === t2 && o.w === n2) : r;
  }
};
function me(e2, n2) {
  e2[n2] ? e2[n2]++ : e2[n2] = 1;
}
function Ee(e2, n2) {
  e2[n2] !== void 0 && !--e2[n2] && delete e2[n2];
}
function C(e2, n2, t2, r) {
  let o = "" + n2, i = "" + t2;
  if (!e2 && o > i) {
    let s = o;
    o = i, i = s;
  }
  return o + "" + i + "" + (r === void 0 ? "\0" : r);
}
function gn(e2, n2, t2, r) {
  let o = "" + n2, i = "" + t2;
  if (!e2 && o > i) {
    let a = o;
    o = i, i = a;
  }
  let s = { v: o, w: i };
  return r && (s.name = r), s;
}
function Y(e2, n2) {
  return C(e2, n2.v, n2.w, n2.name);
}
var pn = "4.0.1", ye = {};
Le(ye, { read: () => yn, write: () => mn });
function mn(e2) {
  let n2 = { options: { directed: e2.isDirected(), multigraph: e2.isMultigraph(), compound: e2.isCompound() }, nodes: En(e2), edges: Ln(e2) }, t2 = e2.graph();
  return t2 !== void 0 && (n2.value = structuredClone(t2)), n2;
}
function En(e2) {
  return e2.nodes().map((n2) => {
    let t2 = e2.node(n2), r = e2.parent(n2), o = { v: n2 };
    return t2 !== void 0 && (o.value = t2), r !== void 0 && (o.parent = r), o;
  });
}
function Ln(e2) {
  return e2.edges().map((n2) => {
    let t2 = e2.edge(n2), r = { v: n2.v, w: n2.w };
    return n2.name !== void 0 && (r.name = n2.name), t2 !== void 0 && (r.value = t2), r;
  });
}
function yn(e2) {
  let n2 = new p(e2.options);
  return e2.value !== void 0 && n2.setGraph(e2.value), e2.nodes.forEach((t2) => {
    n2.setNode(t2.v, t2.value), t2.parent && n2.setParent(t2.v, t2.parent);
  }), e2.edges.forEach((t2) => {
    n2.setEdge({ v: t2.v, w: t2.w, name: t2.name }, t2.value);
  }), n2;
}
var R = {};
Le(R, { CycleException: () => D, bellmanFord: () => we, components: () => Gn, dijkstra: () => F, dijkstraAll: () => _n, findCycles: () => xn, floydWarshall: () => On, isAcyclic: () => Cn, postorder: () => Pn, preorder: () => Mn, prim: () => jn, shortestPaths: () => Sn, tarjan: () => Ge, topsort: () => ke });
var wn = () => 1;
function we(e2, n2, t2, r) {
  return Nn(e2, String(n2), t2 || wn, r || function(o) {
    return e2.outEdges(o);
  });
}
function Nn(e2, n2, t2, r) {
  let o = {}, i, s = 0, a = e2.nodes(), d = function(c) {
    let h = t2(c);
    o[c.v].distance + h < o[c.w].distance && (o[c.w] = { distance: o[c.v].distance + h, predecessor: c.v }, i = true);
  }, l = function() {
    a.forEach(function(c) {
      r(c).forEach(function(h) {
        let f = h.v === c ? h.v : h.w, g = f === h.v ? h.w : h.v;
        d({ v: f, w: g });
      });
    });
  };
  a.forEach(function(c) {
    let h = c === n2 ? 0 : Number.POSITIVE_INFINITY;
    o[c] = { distance: h, predecessor: "" };
  });
  let u = a.length;
  for (let c = 1; c < u && (i = false, s++, l(), !!i); c++) ;
  if (s === u - 1 && (i = false, l(), i)) throw new Error("The graph contains a negative weight cycle");
  return o;
}
function Gn(e2) {
  let n2 = {}, t2 = [], r;
  function o(i) {
    i in n2 || (n2[i] = true, r.push(i), e2.successors(i).forEach(o), e2.predecessors(i).forEach(o));
  }
  return e2.nodes().forEach(function(i) {
    r = [], o(i), r.length && t2.push(r);
  }), t2;
}
var Ne = class {
  constructor() {
    this._arr = [], this._keyIndices = {};
  }
  size() {
    return this._arr.length;
  }
  keys() {
    return this._arr.map((e2) => e2.key);
  }
  has(e2) {
    return e2 in this._keyIndices;
  }
  priority(e2) {
    let n2 = this._keyIndices[e2];
    if (n2 !== void 0) return this._arr[n2].priority;
  }
  min() {
    if (this.size() === 0) throw new Error("Queue underflow");
    return this._arr[0].key;
  }
  add(e2, n2) {
    let t2 = this._keyIndices, r = String(e2);
    if (!(r in t2)) {
      let o = this._arr, i = o.length;
      return t2[r] = i, o.push({ key: r, priority: n2 }), this._decrease(i), true;
    }
    return false;
  }
  removeMin() {
    this._swap(0, this._arr.length - 1);
    let e2 = this._arr.pop();
    return delete this._keyIndices[e2.key], this._heapify(0), e2.key;
  }
  decrease(e2, n2) {
    let t2 = this._keyIndices[e2];
    if (t2 === void 0) throw new Error(`Key not found: ${e2}`);
    let r = this._arr[t2].priority;
    if (n2 > r) throw new Error(`New priority is greater than current priority. Key: ${e2} Old: ${r} New: ${n2}`);
    this._arr[t2].priority = n2, this._decrease(t2);
  }
  _heapify(e2) {
    let n2 = this._arr, t2 = 2 * e2, r = t2 + 1, o = e2;
    t2 < n2.length && (o = n2[t2].priority < n2[o].priority ? t2 : o, r < n2.length && (o = n2[r].priority < n2[o].priority ? r : o), o !== e2 && (this._swap(e2, o), this._heapify(o)));
  }
  _decrease(e2) {
    let n2 = this._arr, t2 = n2[e2].priority, r;
    for (; e2 !== 0 && (r = e2 >> 1, !(n2[r].priority < t2)); ) this._swap(e2, r), e2 = r;
  }
  _swap(e2, n2) {
    let t2 = this._arr, r = this._keyIndices, o = t2[e2], i = t2[n2];
    t2[e2] = i, t2[n2] = o, r[i.key] = e2, r[o.key] = n2;
  }
}, kn = () => 1;
function F(e2, n2, t2, r) {
  let o = function(i) {
    return e2.outEdges(i);
  };
  return vn(e2, String(n2), t2 || kn, r || o);
}
function vn(e2, n2, t2, r) {
  let o = {}, i = new Ne(), s, a, d = function(l) {
    let u = l.v !== s ? l.v : l.w, c = o[u], h = t2(l), f = a.distance + h;
    if (h < 0) throw new Error("dijkstra does not allow negative edge weights. Bad edge: " + l + " Weight: " + h);
    f < c.distance && (c.distance = f, c.predecessor = s, i.decrease(u, f));
  };
  for (e2.nodes().forEach(function(l) {
    let u = l === n2 ? 0 : Number.POSITIVE_INFINITY;
    o[l] = { distance: u, predecessor: "" }, i.add(l, u);
  }); i.size() > 0 && (s = i.removeMin(), a = o[s], a.distance !== Number.POSITIVE_INFINITY); ) r(s).forEach(d);
  return o;
}
function _n(e2, n2, t2) {
  return e2.nodes().reduce(function(r, o) {
    return r[o] = F(e2, o, n2, t2), r;
  }, {});
}
function Ge(e2) {
  let n2 = 0, t2 = [], r = {}, o = [];
  function i(s) {
    let a = r[s] = { onStack: true, lowlink: n2, index: n2++ };
    if (t2.push(s), e2.successors(s).forEach(function(d) {
      d in r ? r[d].onStack && (a.lowlink = Math.min(a.lowlink, r[d].index)) : (i(d), a.lowlink = Math.min(a.lowlink, r[d].lowlink));
    }), a.lowlink === a.index) {
      let d = [], l;
      do
        l = t2.pop(), r[l].onStack = false, d.push(l);
      while (s !== l);
      o.push(d);
    }
  }
  return e2.nodes().forEach(function(s) {
    s in r || i(s);
  }), o;
}
function xn(e2) {
  return Ge(e2).filter(function(n2) {
    return n2.length > 1 || n2.length === 1 && e2.hasEdge(n2[0], n2[0]);
  });
}
var Tn = () => 1;
function On(e2, n2, t2) {
  return In(e2, n2 || Tn, t2 || function(r) {
    return e2.outEdges(r);
  });
}
function In(e2, n2, t2) {
  let r = {}, o = e2.nodes();
  return o.forEach(function(i) {
    r[i] = {}, r[i][i] = { distance: 0, predecessor: "" }, o.forEach(function(s) {
      i !== s && (r[i][s] = { distance: Number.POSITIVE_INFINITY, predecessor: "" });
    }), t2(i).forEach(function(s) {
      let a = s.v === i ? s.w : s.v, d = n2(s);
      r[i][a] = { distance: d, predecessor: i };
    });
  }), o.forEach(function(i) {
    let s = r[i];
    o.forEach(function(a) {
      let d = r[a];
      o.forEach(function(l) {
        let u = d[i], c = s[l], h = d[l], f = u.distance + c.distance;
        f < h.distance && (h.distance = f, h.predecessor = c.predecessor);
      });
    });
  }), r;
}
var D = class extends Error {
  constructor(...e2) {
    super(...e2);
  }
};
function ke(e2) {
  let n2 = {}, t2 = {}, r = [];
  function o(i) {
    if (i in t2) throw new D();
    i in n2 || (t2[i] = true, n2[i] = true, e2.predecessors(i).forEach(o), delete t2[i], r.push(i));
  }
  if (e2.sinks().forEach(o), Object.keys(n2).length !== e2.nodeCount()) throw new D();
  return r;
}
function Cn(e2) {
  try {
    ke(e2);
  } catch (n2) {
    if (n2 instanceof D) return false;
    throw n2;
  }
  return true;
}
function Rn(e2, n2, t2, r, o) {
  Array.isArray(n2) || (n2 = [n2]);
  let i = ((a) => {
    var d;
    return (d = e2.isDirected() ? e2.successors(a) : e2.neighbors(a)) != null ? d : [];
  }), s = {};
  return n2.forEach(function(a) {
    if (!e2.hasNode(a)) throw new Error("Graph does not have node: " + a);
    o = ve(e2, a, t2 === "post", s, i, r, o);
  }), o;
}
function ve(e2, n2, t2, r, o, i, s) {
  return n2 in r || (r[n2] = true, t2 || (s = i(s, n2)), o(n2).forEach(function(a) {
    s = ve(e2, a, t2, r, o, i, s);
  }), t2 && (s = i(s, n2))), s;
}
function _e(e2, n2, t2) {
  return Rn(e2, n2, t2, function(r, o) {
    return r.push(o), r;
  }, []);
}
function Pn(e2, n2) {
  return _e(e2, n2, "post");
}
function Mn(e2, n2) {
  return _e(e2, n2, "pre");
}
function jn(e2, n2) {
  let t2 = new p(), r = {}, o = new Ne(), i;
  function s(d) {
    let l = d.v === i ? d.w : d.v, u = o.priority(l);
    if (u !== void 0) {
      let c = n2(d);
      c < u && (r[l] = i, o.decrease(l, c));
    }
  }
  if (e2.nodeCount() === 0) return t2;
  e2.nodes().forEach(function(d) {
    o.add(d, Number.POSITIVE_INFINITY), t2.setNode(d);
  }), o.decrease(e2.nodes()[0], 0);
  let a = false;
  for (; o.size() > 0; ) {
    if (i = o.removeMin(), i in r) t2.setEdge(i, r[i]);
    else {
      if (a) throw new Error("Input graph is not connected: " + e2);
      a = true;
    }
    e2.nodeEdges(i).forEach(s);
  }
  return t2;
}
function Sn(e2, n2, t2, r) {
  return Fn(e2, n2, t2, r != null ? r : ((o) => {
    let i = e2.outEdges(o);
    return i != null ? i : [];
  }));
}
function Fn(e2, n2, t2, r) {
  if (t2 === void 0) return F(e2, n2, t2, r);
  let o = false, i = e2.nodes();
  for (let s = 0; s < i.length; s++) {
    let a = r(i[s]);
    for (let d = 0; d < a.length; d++) {
      let l = a[d], u = l.v === i[s] ? l.v : l.w, c = u === l.v ? l.w : l.v;
      t2({ v: u, w: c }) < 0 && (o = true);
    }
    if (o) return we(e2, n2, t2, r);
  }
  return F(e2, n2, t2, r);
}
var { preorder: Zn, postorder: et } = R;
const reactflowStyles = "/assets/style-C5ap-Sga.css";
const dataModelFlowStyles = reactflowStyles;
const $$splitComponentImporter$J = () => import("./list-pilZ3d74.js");
const Route$T = createFileRoute("/_app/_builder/data/list")({
  staticData: {
    i18n: dataI18n
  },
  component: lazyRouteComponent($$splitComponentImporter$J, "component"),
  head: () => ({
    links: [{
      rel: "stylesheet",
      href: dataModelFlowStyles
    }]
  })
});
const handle = {
  i18n: dataI18n
};
const $$splitComponentImporter$I = () => import("./configurations-Ce3Colhj.js");
const configurationsLoader = createServerFn().middleware([authMiddleware]).handler(createSsrRpc("a140ea9b3129290100dd40aa3114c38f68c58f854cd3ca6624c3b39efdd53a4e"));
const Route$S = createFileRoute("/_app/_builder/continuous-screening/configurations")({
  staticData: {
    i18n: ["navigation", "continuousScreening"],
    BreadCrumbs: [({
      isLast
    }) => {
      const {
        t: t2
      } = useTranslation(["navigation"]);
      return /* @__PURE__ */ jsxRuntimeExports.jsx(BreadCrumbLink, { to: "/continuous-screening/configurations", isLast, children: t2("navigation:continuous-screening.configurations") });
    }]
  },
  loader: () => configurationsLoader(),
  component: lazyRouteComponent($$splitComponentImporter$I, "component")
});
const $$splitComponentImporter$H = () => import("./overview-Jrzskdsk.js");
const casesOverviewLoader = createServerFn().middleware([authMiddleware]).handler(createSsrRpc("bf5a68bbacfe67480da132d5c9fb36f5e78e973d9ade9e1c58238089302d1de2"));
const Route$R = createFileRoute("/_app/_builder/cases/overview")({
  loader: () => casesOverviewLoader(),
  component: lazyRouteComponent($$splitComponentImporter$H, "component")
});
const $$splitComponentImporter$G = () => import("./inboxes-BFLjcje2.js");
const Route$Q = createFileRoute("/_app/_builder/cases/inboxes")({
  component: lazyRouteComponent($$splitComponentImporter$G, "component")
});
const $$splitComponentImporter$F = () => import("./analytics-CdK5fjcN.js");
const casesAnalyticsLoader = createServerFn().middleware([authMiddleware]).handler(createSsrRpc("35ab51f7cbac3061cb7d3973f74ba220112989bf839f06f7ada19addb0361183"));
const Route$P = createFileRoute("/_app/_builder/cases/analytics")({
  loader: () => casesAnalyticsLoader(),
  component: lazyRouteComponent($$splitComponentImporter$F, "component")
});
const $$splitComponentImporter$E = () => import("./_detail-CfFaSTLi.js");
const beforeLoadFn$2 = createServerFn().middleware([authMiddleware]).handler(createSsrRpc("14e7d5aa898d82c7977f719e8dd399a2a401db0c7f57634d9f4772dbc350ab28"));
const caseDetailLayoutLoader = createServerFn().middleware([authMiddleware, caseDetailMiddleware]).validator((input) => input).handler(createSsrRpc("ad3d01eeafa29cd4f2088158bee9026204a9de5c16c52683ac5449c13384cb30"));
const Route$O = createFileRoute("/_app/_builder/cases/_detail")({
  staticData: {
    BreadCrumbs: [({
      isLast,
      data
    }) => {
      const caseInbox = data.caseInbox;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(BreadCrumbLink, { to: "/cases/inboxes/$inboxId", params: {
        inboxId: fromUUIDtoSUUID(caseInbox.id)
      }, isLast, children: caseInbox.name });
    }, ({
      isLast,
      data
    }) => {
      const caseDetail = data.caseDetail;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(BreadCrumbLink, { to: "/cases/$caseId", params: {
        caseId: fromUUIDtoSUUID(caseDetail.id)
      }, isLast, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "line-clamp-2 text-start", children: caseDetail.name }) });
    }]
  },
  beforeLoad: () => beforeLoadFn$2(),
  loader: ({
    params
  }) => caseDetailLayoutLoader({
    data: {
      params
    }
  }),
  component: lazyRouteComponent($$splitComponentImporter$E, "component")
});
const $$splitComponentImporter$D = () => import("./_caseId-CfFaSTLi.js");
const Route$N = createFileRoute("/_app/_builder/cases/$caseId")({
  component: lazyRouteComponent($$splitComponentImporter$D, "component")
});
const $$splitComponentImporter$C = () => import("./index-pzxa9ip4.js");
const inboxesLoader = createServerFn().middleware([authMiddleware]).handler(createSsrRpc("17fe49fd9649a743daee9b2db7caa3d15a925dc14b9480bad78ab09d42f3167f"));
const Route$M = createFileRoute("/_app/_builder/settings/inboxes/")({
  loader: () => inboxesLoader(),
  component: lazyRouteComponent($$splitComponentImporter$C, "component")
});
const $$splitComponentImporter$B = () => import("./index-BUrNkOa9.js");
const $$splitErrorComponentImporter$b = () => import("./index-CNbol9jY.js");
const scenariosLoader = createServerFn().middleware([authMiddleware]).handler(createSsrRpc("0acb523b5f97ff683b231261a0120f2ad490d294ede3b29b519c3173ddc98731"));
const Route$L = createFileRoute("/_app/_builder/detection/scenarios/")({
  loader: () => scenariosLoader(),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$b, "errorComponent"),
  component: lazyRouteComponent($$splitComponentImporter$B, "component")
});
const $$splitComponentImporter$A = () => import("./index-CBXe33Jp.js");
const $$splitErrorComponentImporter$a = () => import("./index-DSXt0YBK.js");
const listsLoader = createServerFn().middleware([authMiddleware]).handler(createSsrRpc("ef0179542ce4f92a63bf12d039c8aac33a5d8d216e4258d8baa6b6d4cc611eed"));
const Route$K = createFileRoute("/_app/_builder/detection/lists/")({
  loader: () => listsLoader(),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$a, "errorComponent"),
  component: lazyRouteComponent($$splitComponentImporter$A, "component")
});
const $$splitComponentImporter$z = () => import("./index-BL3xd5tQ.js");
const $$splitErrorComponentImporter$9 = () => import("./index-S2CkJ-zV.js");
const decisionsListQueryParamsSchema = intersection(decisionFiltersSchema, paginationSchema);
const buildQueryParams = (filters, paginationParams) => {
  return {
    outcomeAndReviewStatus: filters.outcomeAndReviewStatus,
    triggerObject: filters.triggerObject,
    triggerObjectId: filters.triggerObjectId,
    dateRange: filters.dateRange ? filters.dateRange.type === "static" ? {
      type: "static",
      endDate: filters.dateRange.endDate,
      startDate: filters.dateRange.startDate
    } : {
      type: "dynamic",
      fromNow: filters.dateRange.fromNow
    } : void 0,
    pivotValue: filters.pivotValue,
    scenarioId: filters.scenarioId,
    scheduledExecutionId: filters.scheduledExecutionId,
    caseInboxId: filters.caseInboxId,
    hasCase: filters?.hasCase,
    offsetId: paginationParams?.offsetId,
    next: paginationParams?.next,
    previous: paginationParams?.previous,
    order: paginationParams?.order,
    sorting: paginationParams?.sorting,
    limit: paginationParams?.limit
  };
};
const decisionsLoader = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(decisionsListQueryParamsSchema).handler(createSsrRpc("5a205b441cdb9490a6f3958d7bbe458fad090ffd16d25ef9608aa14d156876a4"));
const Route$J = createFileRoute("/_app/_builder/detection/decisions/")({
  validateSearch: decisionsListQueryParamsSchema,
  loaderDeps: ({
    search
  }) => search,
  loader: ({
    deps
  }) => decisionsLoader({
    data: deps
  }),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$9, "errorComponent"),
  component: lazyRouteComponent($$splitComponentImporter$z, "component")
});
const $$splitComponentImporter$y = () => import("./index-BTU5dmpx.js");
const analyticsIndexLoader = createServerFn().middleware([authMiddleware]).handler(createSsrRpc("1dda07efb7eddbc1a3c062ed5bae0127a4b92d7ed30c6c541cf160b40c6cd9ce"));
const Route$I = createFileRoute("/_app/_builder/detection/analytics/")({
  loader: () => analyticsIndexLoader(),
  component: lazyRouteComponent($$splitComponentImporter$y, "component")
});
const $$splitComponentImporter$x = () => import("./index-CA2rFHmv.js");
const searchSchema = object({
  name: string().optional(),
  description: string().optional()
});
const createConfigurationLoader = createServerFn().middleware([authMiddleware]).validator(object({
  name: string(),
  description: string().optional()
})).handler(createSsrRpc("35b91dd8aa3e517665c46541765abb8b29e3966a38ce7df8784c8847df4244f1"));
const Route$H = createFileRoute("/_app/_builder/continuous-screening/create/")({
  validateSearch: searchSchema,
  loaderDeps: ({
    search: {
      name,
      description
    }
  }) => ({
    name,
    description
  }),
  loader: ({
    deps
  }) => {
    if (!deps.name) {
      throw redirect({
        to: "/continuous-screening/configurations"
      });
    }
    return createConfigurationLoader({
      data: {
        name: deps.name,
        description: deps.description
      }
    });
  },
  staticData: {
    i18n: ["continuousScreening"],
    BreadCrumbs: [(_) => {
      const {
        t: t2
      } = useTranslation(["continuousScreening"]);
      const {
        name
      } = Route$H.useLoaderData();
      return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t2("continuousScreening:creation.title", {
        name
      }) });
    }]
  },
  component: lazyRouteComponent($$splitComponentImporter$x, "component")
});
const casesInboxesIndexLoader = createServerFn().middleware([authMiddleware]).handler(createSsrRpc("657390759bf41fc09b64c2cb7e4f77389c9d27685c05d104e7d2f738d4daaacc"));
const Route$G = createFileRoute("/_app/_builder/cases/inboxes/")({
  loader: () => casesInboxesIndexLoader()
});
const caseDetailLoader = createServerFn().middleware([authMiddleware, caseDetailMiddleware]).validator(z$1.object({
  params: z$1.record(z$1.string(), z$1.string()).optional(),
  search: z$1.object({
    fromInbox: z$1.string().optional()
  }).optional()
})).handler(createSsrRpc("8370bb112072e4230aaa7c77c7ba194d39985d69e4c9b7700b9e6ed1c051793d"));
const Route$F = createFileRoute("/_app/_builder/cases/$caseId/")({
  validateSearch: z$1.object({
    fromInbox: z$1.string().optional()
  }),
  loaderDeps: ({
    search: {
      fromInbox
    }
  }) => ({
    fromInbox
  }),
  loader: ({
    params,
    deps
  }) => caseDetailLoader({
    data: {
      params,
      search: deps
    }
  })
});
const Route$E = createFileRoute("/ressources/screenings/download/$screeningId/$fileId")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const { authService } = initServerServices(request);
        const { apiClient } = await authService.isAuthenticated(request, {
          failureRedirect: "/sign-in"
        });
        const screeningId = params["screeningId"];
        invariant$1(screeningId);
        const fileId = params["fileId"];
        invariant$1(fileId);
        return Response.json(await apiClient.downloadScreeningFile(screeningId, fileId));
      }
    }
  }
});
const Route$D = createFileRoute("/ressources/annotations/download-file/$annotationId/$fileId")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const { authService } = initServerServices(request);
        const { apiClient } = await authService.isAuthenticated(request, {
          failureRedirect: "/sign-in"
        });
        const annotationId = params["annotationId"];
        invariant$1(annotationId);
        const fileId = params["fileId"];
        invariant$1(fileId);
        return Response.json(await apiClient.downloadAnnotationFile(annotationId, fileId));
      }
    }
  }
});
const $$splitComponentImporter$w = () => import("./_recordType._version-Dvrj136r.js");
const scoringRulesetLoader = createServerFn().middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("18da7f26386e7ebb5a2edc840704787f306fb5982648e912fd5a034dc3e9f640"));
const Route$C = createFileRoute("/_app/_builder/user-scoring/$recordType/$version")({
  loader: ({
    params
  }) => scoringRulesetLoader({
    data: {
      params
    }
  }),
  component: lazyRouteComponent($$splitComponentImporter$w, "component")
});
const $$splitComponentImporter$v = () => import("./webhooks_._webhookId-af6_qHlz.js");
const webhookDetailLoader = createServerFn().middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("536c5d483d909feb789f3e636c7a91e9cadfdd2c714c28b79a89a7bb02ac6d13"));
const Route$B = createFileRoute("/_app/_builder/settings/webhooks_/$webhookId")({
  staticData: {
    hideTabs: true,
    BreadCrumbs: [({
      isLast: _
    }) => {
      const {
        t: t2
      } = useTranslation(["settings"]);
      return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s font-bold", children: t2("settings:webhook_details") });
    }]
  },
  loader: ({
    params
  }) => webhookDetailLoader({
    data: {
      params
    }
  }),
  component: lazyRouteComponent($$splitComponentImporter$v, "component")
});
const $$splitComponentImporter$u = () => import("./_inboxId-Dc-AxCaC.js");
const inboxDetailLoader = createServerFn().middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("8a7664c76b372de8d60a46557e4b07a41388d73db5069a7aab81083cfa29607f"));
const Route$A = createFileRoute("/_app/_builder/settings/inboxes/$inboxId")({
  loader: ({
    params
  }) => inboxDetailLoader({
    data: {
      params
    }
  }),
  component: lazyRouteComponent($$splitComponentImporter$u, "component")
});
const $$splitComponentImporter$t = () => import("./filters-DL0i3DVo.js");
const filtersLoader = createServerFn().middleware([authMiddleware]).handler(createSsrRpc("4d86840ff3e9c7863c69d2b486dfb6807b55958410e70bdf312d7b4e94cd18f0"));
const Route$z = createFileRoute("/_app/_builder/settings/analytics/filters")({
  loader: () => filtersLoader(),
  component: lazyRouteComponent($$splitComponentImporter$t, "component")
});
function TriggerObjectTag({ children }) {
  const { t: t2 } = useTranslation(["scenarios"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Tag, { size: "small", color: "grey", className: "flex items-center gap-sm", children: [
    children,
    /* @__PURE__ */ jsxRuntimeExports.jsxs(TooltipV2.Tooltip, { delayDuration: 0, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipV2.TooltipTrigger, { tabIndex: -1, className: "cursor-pointer transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "tip", className: "size-3.5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        TooltipV2.TooltipContent,
        {
          side: "bottom",
          align: "start",
          sideOffset: 8,
          className: "bg-surface-card border-grey-border flex w-fit max-w-80 rounded-sm border p-sm z-50 shadow-md",
          children: t2("scenarios:trigger_object.description")
        }
      )
    ] })
  ] });
}
const $$splitComponentImporter$s = () => import("./_scenarioId-CfFaSTLi.js");
const $$splitErrorComponentImporter$8 = () => import("./_scenarioId-u-R0qred.js");
const scenarioData = createServerFn().middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("de490983d4997d232b884399c941d6395a6a47d83f1d2df248b24ed6ba673987"));
const Route$y = createFileRoute("/_app/_builder/detection/scenarios/$scenarioId")({
  beforeLoad: ({
    params
  }) => scenarioData({
    data: {
      params
    }
  }),
  staticData: {
    BreadCrumbs: [({
      isLast
    }) => {
      const {
        currentScenario
      } = Route$y.useRouteContext();
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row items-center gap-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(BreadCrumbLink, { isLast, to: "/detection/scenarios/$scenarioId", params: {
          scenarioId: fromUUIDtoSUUID(currentScenario.id)
        }, children: currentScenario.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriggerObjectTag, { children: currentScenario.triggerObjectType })
      ] });
    }]
  },
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$8, "errorComponent"),
  component: lazyRouteComponent($$splitComponentImporter$s, "component")
});
const $$splitComponentImporter$r = () => import("./_listId-DA_p7mY7.js");
const $$splitErrorComponentImporter$7 = () => import("./_listId-DVvQVFxv.js");
const listLoader = createServerFn().middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("52068080343d82e992504e273fbeb1c82e4164eb84fe791f5411bab1c4a385dd"));
const Route$x = createFileRoute("/_app/_builder/detection/lists/$listId")({
  loader: ({
    params
  }) => listLoader({
    data: {
      params
    }
  }),
  staticData: {
    BreadCrumbs: [({
      isLast
    }) => {
      const {
        customList
      } = Route$x.useLoaderData();
      return /* @__PURE__ */ jsxRuntimeExports.jsx(BreadCrumbLink, { to: "/detection/lists/$listId", params: {
        listId: fromUUIDtoSUUID(customList.id)
      }, isLast, children: customList.name });
    }]
  },
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$7, "errorComponent"),
  component: lazyRouteComponent($$splitComponentImporter$r, "component")
});
const filtersI18n = ["filters"];
const decisionsI18n = [
  "decisions",
  "common",
  "scenarios",
  "cases",
  "screenings",
  ...filtersI18n
];
const casesI18n = ["cases", ...filtersI18n, ...decisionsI18n, ...screeningsI18n];
const caseStatusBadgeVariants = cva("inline-flex items-center w-fit shrink-0 grow-0 border border-transparent", {
  variants: {
    size: {
      large: "justify-center rounded-sm p-sm gap-sm text-r font-medium",
      small: "gap-xs rounded-full px-xs py-2xs text-xs font-normal"
    }
  },
  defaultVariants: {
    size: "small"
  }
});
const CaseStatusBadge = ({
  status,
  outcome,
  showText = true,
  showBackground = true,
  size,
  className,
  ...rest
}) => {
  const { t: t2 } = useTranslation(casesI18n);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { ...rest, className: "inline-flex items-center gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "span",
      {
        className: caseStatusBadgeVariants({
          size,
          className: cn(className, {
            "bg-purple-background dark:bg-transparent dark:border-purple-primary": (status === "snoozed" || status === "closed") && showBackground,
            "bg-red-background dark:bg-transparent dark:border-red-primary": status === "waiting_for_action" && showBackground,
            "bg-grey-background dark:bg-transparent dark:border-grey-placeholder": status === "pending" && showBackground,
            "bg-blue-96 dark:bg-transparent dark:border-blue-58": status === "investigating" && showBackground
          })
        }),
        children: [
          M(status).with("snoozed", () => /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "status_snoozed", className: "text-purple-primary size-4" })).with("waiting_for_action", () => /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "waiting_for_action", className: "text-red-primary size-4" })).with("pending", () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-grey-disabled size-3.5 rounded-full border-2" })).with("investigating", () => /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "investigating", className: "text-blue-58 size-4" })).with("closed", () => /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "resolved", className: "text-purple-primary size-4" })).exhaustive(),
          showText ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: cn("text-grey-primary", {
                "text-purple-primary": status === "snoozed" || status === "closed",
                "text-red-primary": status === "waiting_for_action",
                "text-grey-secondary": status === "pending",
                "text-blue-58": status === "investigating"
              }),
              children: t2(`cases:case.status.${status}`)
            }
          ) : null
        ]
      }
    ),
    outcome && outcome !== "unset" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      "span",
      {
        className: cn("rounded-full border px-xs py-0.5 text-xs", {
          "border-red-primary text-red-primary": outcome === "confirmed_risk",
          "border-green-primary text-green-primary": outcome === "valuable_alert",
          "border-grey-placeholder text-grey-secondary": outcome === "false_positive"
        }),
        children: t2(`cases:case.outcome.${outcome}`)
      }
    ) : null
  ] });
};
const statusIconMap = {
  pending: "status-pending",
  investigating: "search",
  closed: "resolved",
  waiting_for_action: "waiting_for_action",
  snoozed: "status_snoozed"
};
const badgeTextVariants = cva("", {
  variants: {
    status: {
      pending: "text-yellow-primary",
      investigating: "text-purple-primary",
      closed: "text-green-primary",
      waiting_for_action: "text-orange-primary",
      snoozed: "text-grey-secondary"
    }
  }
});
const badgeBorderVariants = cva("border", {
  variants: {
    status: {
      pending: "border-yellow-primary",
      investigating: "border-purple-primary",
      closed: "border-green-primary",
      waiting_for_action: "border-orange-primary",
      snoozed: "border-grey-secondary"
    }
  }
});
const outcomeVariants = cva("border rounded-full px-sm h-6 flex items-center", {
  variants: {
    outcome: {
      false_positive: "text-green-secondary border-green-secondary",
      valuable_alert: "text-orange-primary border-orange-primary",
      confirmed_risk: "text-red-primary border-red-primary"
    }
  }
});
const CaseStatusBadgeV2 = ({ status, outcome, variant }) => {
  const { t: t2 } = useTranslation(["cases"]);
  const resolvedOutcome = outcome ?? "unset";
  if (variant === "text-only") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn(badgeTextVariants({ status }), "text-small font-medium whitespace-nowrap"), children: t2(`cases:case.status.${status}`) });
  }
  if (variant === "full" || variant === "icon-only") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: cn(badgeTextVariants({ status }), "inline-flex items-center gap-sm text-small whitespace-nowrap"),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-xs shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: statusIconMap[status], className: "size-5 shrink-0" }),
            variant === "full" ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: t2(`cases:case.status.${status}`) }) : null
          ] }),
          resolvedOutcome !== "unset" && variant !== "icon-only" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn(outcomeVariants({ outcome: resolvedOutcome }), "shrink-0 whitespace-nowrap"), children: t2(`cases:case.outcome.${resolvedOutcome}`) }) : null
        ]
      }
    );
  }
  if (variant === "semi-full") {
    if (status !== "closed") {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: cn(
            badgeTextVariants({ status }),
            badgeBorderVariants({ status }),
            "inline-flex items-center gap-xs h-6 rounded-full px-sm text-small whitespace-nowrap"
          ),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: statusIconMap[status], className: "size-4 shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0 whitespace-nowrap", children: t2(`cases:case.status.${status}`) })
          ]
        }
      );
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-xs text-small whitespace-nowrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: statusIconMap[status], className: cn(badgeTextVariants({ status }), "size-5 shrink-0") }),
      resolvedOutcome !== "unset" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn(outcomeVariants({ outcome: resolvedOutcome }), "shrink-0 whitespace-nowrap"), children: t2(`cases:case.outcome.${resolvedOutcome}`) }) : null
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: cn(
        badgeTextVariants({ status }),
        badgeBorderVariants({ status }),
        "flex items-center gap-sm h-10 rounded-sm px-sm text-default font-medium whitespace-nowrap"
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: statusIconMap[status], className: "size-5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t2(`cases:case.status.${status}`) })
      ]
    }
  );
};
var removeAccents$1 = { exports: {} };
var hasRequiredRemoveAccents;
function requireRemoveAccents() {
  if (hasRequiredRemoveAccents) return removeAccents$1.exports;
  hasRequiredRemoveAccents = 1;
  var characterMap = {
    "À": "A",
    "Á": "A",
    "Â": "A",
    "Ã": "A",
    "Ä": "A",
    "Å": "A",
    "Ấ": "A",
    "Ắ": "A",
    "Ẳ": "A",
    "Ẵ": "A",
    "Ặ": "A",
    "Æ": "AE",
    "Ầ": "A",
    "Ằ": "A",
    "Ȃ": "A",
    "Ả": "A",
    "Ạ": "A",
    "Ẩ": "A",
    "Ẫ": "A",
    "Ậ": "A",
    "Ç": "C",
    "Ḉ": "C",
    "È": "E",
    "É": "E",
    "Ê": "E",
    "Ë": "E",
    "Ế": "E",
    "Ḗ": "E",
    "Ề": "E",
    "Ḕ": "E",
    "Ḝ": "E",
    "Ȇ": "E",
    "Ẻ": "E",
    "Ẽ": "E",
    "Ẹ": "E",
    "Ể": "E",
    "Ễ": "E",
    "Ệ": "E",
    "Ì": "I",
    "Í": "I",
    "Î": "I",
    "Ï": "I",
    "Ḯ": "I",
    "Ȋ": "I",
    "Ỉ": "I",
    "Ị": "I",
    "Ð": "D",
    "Ñ": "N",
    "Ò": "O",
    "Ó": "O",
    "Ô": "O",
    "Õ": "O",
    "Ö": "O",
    "Ø": "O",
    "Ố": "O",
    "Ṍ": "O",
    "Ṓ": "O",
    "Ȏ": "O",
    "Ỏ": "O",
    "Ọ": "O",
    "Ổ": "O",
    "Ỗ": "O",
    "Ộ": "O",
    "Ờ": "O",
    "Ở": "O",
    "Ỡ": "O",
    "Ớ": "O",
    "Ợ": "O",
    "Ù": "U",
    "Ú": "U",
    "Û": "U",
    "Ü": "U",
    "Ủ": "U",
    "Ụ": "U",
    "Ử": "U",
    "Ữ": "U",
    "Ự": "U",
    "Ý": "Y",
    "à": "a",
    "á": "a",
    "â": "a",
    "ã": "a",
    "ä": "a",
    "å": "a",
    "ấ": "a",
    "ắ": "a",
    "ẳ": "a",
    "ẵ": "a",
    "ặ": "a",
    "æ": "ae",
    "ầ": "a",
    "ằ": "a",
    "ȃ": "a",
    "ả": "a",
    "ạ": "a",
    "ẩ": "a",
    "ẫ": "a",
    "ậ": "a",
    "ç": "c",
    "ḉ": "c",
    "è": "e",
    "é": "e",
    "ê": "e",
    "ë": "e",
    "ế": "e",
    "ḗ": "e",
    "ề": "e",
    "ḕ": "e",
    "ḝ": "e",
    "ȇ": "e",
    "ẻ": "e",
    "ẽ": "e",
    "ẹ": "e",
    "ể": "e",
    "ễ": "e",
    "ệ": "e",
    "ì": "i",
    "í": "i",
    "î": "i",
    "ï": "i",
    "ḯ": "i",
    "ȋ": "i",
    "ỉ": "i",
    "ị": "i",
    "ð": "d",
    "ñ": "n",
    "ò": "o",
    "ó": "o",
    "ô": "o",
    "õ": "o",
    "ö": "o",
    "ø": "o",
    "ố": "o",
    "ṍ": "o",
    "ṓ": "o",
    "ȏ": "o",
    "ỏ": "o",
    "ọ": "o",
    "ổ": "o",
    "ỗ": "o",
    "ộ": "o",
    "ờ": "o",
    "ở": "o",
    "ỡ": "o",
    "ớ": "o",
    "ợ": "o",
    "ù": "u",
    "ú": "u",
    "û": "u",
    "ü": "u",
    "ủ": "u",
    "ụ": "u",
    "ử": "u",
    "ữ": "u",
    "ự": "u",
    "ý": "y",
    "ÿ": "y",
    "Ā": "A",
    "ā": "a",
    "Ă": "A",
    "ă": "a",
    "Ą": "A",
    "ą": "a",
    "Ć": "C",
    "ć": "c",
    "Ĉ": "C",
    "ĉ": "c",
    "Ċ": "C",
    "ċ": "c",
    "Č": "C",
    "č": "c",
    "C̆": "C",
    "c̆": "c",
    "Ď": "D",
    "ď": "d",
    "Đ": "D",
    "đ": "d",
    "Ē": "E",
    "ē": "e",
    "Ĕ": "E",
    "ĕ": "e",
    "Ė": "E",
    "ė": "e",
    "Ę": "E",
    "ę": "e",
    "Ě": "E",
    "ě": "e",
    "Ĝ": "G",
    "Ǵ": "G",
    "ĝ": "g",
    "ǵ": "g",
    "Ğ": "G",
    "ğ": "g",
    "Ġ": "G",
    "ġ": "g",
    "Ģ": "G",
    "ģ": "g",
    "Ĥ": "H",
    "ĥ": "h",
    "Ħ": "H",
    "ħ": "h",
    "Ḫ": "H",
    "ḫ": "h",
    "Ĩ": "I",
    "ĩ": "i",
    "Ī": "I",
    "ī": "i",
    "Ĭ": "I",
    "ĭ": "i",
    "Į": "I",
    "į": "i",
    "İ": "I",
    "ı": "i",
    "Ĳ": "IJ",
    "ĳ": "ij",
    "Ĵ": "J",
    "ĵ": "j",
    "Ķ": "K",
    "ķ": "k",
    "Ḱ": "K",
    "ḱ": "k",
    "K̆": "K",
    "k̆": "k",
    "Ĺ": "L",
    "ĺ": "l",
    "Ļ": "L",
    "ļ": "l",
    "Ľ": "L",
    "ľ": "l",
    "Ŀ": "L",
    "ŀ": "l",
    "Ł": "l",
    "ł": "l",
    "Ḿ": "M",
    "ḿ": "m",
    "M̆": "M",
    "m̆": "m",
    "Ń": "N",
    "ń": "n",
    "Ņ": "N",
    "ņ": "n",
    "Ň": "N",
    "ň": "n",
    "ŉ": "n",
    "N̆": "N",
    "n̆": "n",
    "Ō": "O",
    "ō": "o",
    "Ŏ": "O",
    "ŏ": "o",
    "Ő": "O",
    "ő": "o",
    "Œ": "OE",
    "œ": "oe",
    "P̆": "P",
    "p̆": "p",
    "Ŕ": "R",
    "ŕ": "r",
    "Ŗ": "R",
    "ŗ": "r",
    "Ř": "R",
    "ř": "r",
    "R̆": "R",
    "r̆": "r",
    "Ȓ": "R",
    "ȓ": "r",
    "Ś": "S",
    "ś": "s",
    "Ŝ": "S",
    "ŝ": "s",
    "Ş": "S",
    "Ș": "S",
    "ș": "s",
    "ş": "s",
    "Š": "S",
    "š": "s",
    "Ţ": "T",
    "ţ": "t",
    "ț": "t",
    "Ț": "T",
    "Ť": "T",
    "ť": "t",
    "Ŧ": "T",
    "ŧ": "t",
    "T̆": "T",
    "t̆": "t",
    "Ũ": "U",
    "ũ": "u",
    "Ū": "U",
    "ū": "u",
    "Ŭ": "U",
    "ŭ": "u",
    "Ů": "U",
    "ů": "u",
    "Ű": "U",
    "ű": "u",
    "Ų": "U",
    "ų": "u",
    "Ȗ": "U",
    "ȗ": "u",
    "V̆": "V",
    "v̆": "v",
    "Ŵ": "W",
    "ŵ": "w",
    "Ẃ": "W",
    "ẃ": "w",
    "X̆": "X",
    "x̆": "x",
    "Ŷ": "Y",
    "ŷ": "y",
    "Ÿ": "Y",
    "Y̆": "Y",
    "y̆": "y",
    "Ź": "Z",
    "ź": "z",
    "Ż": "Z",
    "ż": "z",
    "Ž": "Z",
    "ž": "z",
    "ſ": "s",
    "ƒ": "f",
    "Ơ": "O",
    "ơ": "o",
    "Ư": "U",
    "ư": "u",
    "Ǎ": "A",
    "ǎ": "a",
    "Ǐ": "I",
    "ǐ": "i",
    "Ǒ": "O",
    "ǒ": "o",
    "Ǔ": "U",
    "ǔ": "u",
    "Ǖ": "U",
    "ǖ": "u",
    "Ǘ": "U",
    "ǘ": "u",
    "Ǚ": "U",
    "ǚ": "u",
    "Ǜ": "U",
    "ǜ": "u",
    "Ứ": "U",
    "ứ": "u",
    "Ṹ": "U",
    "ṹ": "u",
    "Ǻ": "A",
    "ǻ": "a",
    "Ǽ": "AE",
    "ǽ": "ae",
    "Ǿ": "O",
    "ǿ": "o",
    "Þ": "TH",
    "þ": "th",
    "Ṕ": "P",
    "ṕ": "p",
    "Ṥ": "S",
    "ṥ": "s",
    "X́": "X",
    "x́": "x",
    "Ѓ": "Г",
    "ѓ": "г",
    "Ќ": "К",
    "ќ": "к",
    "A̋": "A",
    "a̋": "a",
    "E̋": "E",
    "e̋": "e",
    "I̋": "I",
    "i̋": "i",
    "Ǹ": "N",
    "ǹ": "n",
    "Ồ": "O",
    "ồ": "o",
    "Ṑ": "O",
    "ṑ": "o",
    "Ừ": "U",
    "ừ": "u",
    "Ẁ": "W",
    "ẁ": "w",
    "Ỳ": "Y",
    "ỳ": "y",
    "Ȁ": "A",
    "ȁ": "a",
    "Ȅ": "E",
    "ȅ": "e",
    "Ȉ": "I",
    "ȉ": "i",
    "Ȍ": "O",
    "ȍ": "o",
    "Ȑ": "R",
    "ȑ": "r",
    "Ȕ": "U",
    "ȕ": "u",
    "B̌": "B",
    "b̌": "b",
    "Č̣": "C",
    "č̣": "c",
    "Ê̌": "E",
    "ê̌": "e",
    "F̌": "F",
    "f̌": "f",
    "Ǧ": "G",
    "ǧ": "g",
    "Ȟ": "H",
    "ȟ": "h",
    "J̌": "J",
    "ǰ": "j",
    "Ǩ": "K",
    "ǩ": "k",
    "M̌": "M",
    "m̌": "m",
    "P̌": "P",
    "p̌": "p",
    "Q̌": "Q",
    "q̌": "q",
    "Ř̩": "R",
    "ř̩": "r",
    "Ṧ": "S",
    "ṧ": "s",
    "V̌": "V",
    "v̌": "v",
    "W̌": "W",
    "w̌": "w",
    "X̌": "X",
    "x̌": "x",
    "Y̌": "Y",
    "y̌": "y",
    "A̧": "A",
    "a̧": "a",
    "B̧": "B",
    "b̧": "b",
    "Ḑ": "D",
    "ḑ": "d",
    "Ȩ": "E",
    "ȩ": "e",
    "Ɛ̧": "E",
    "ɛ̧": "e",
    "Ḩ": "H",
    "ḩ": "h",
    "I̧": "I",
    "i̧": "i",
    "Ɨ̧": "I",
    "ɨ̧": "i",
    "M̧": "M",
    "m̧": "m",
    "O̧": "O",
    "o̧": "o",
    "Q̧": "Q",
    "q̧": "q",
    "U̧": "U",
    "u̧": "u",
    "X̧": "X",
    "x̧": "x",
    "Z̧": "Z",
    "z̧": "z",
    "й": "и",
    "Й": "И",
    "ё": "е",
    "Ё": "Е"
  };
  var chars = Object.keys(characterMap).join("|");
  var allAccents = new RegExp(chars, "g");
  var firstAccent = new RegExp(chars, "");
  function matcher(match2) {
    return characterMap[match2];
  }
  var removeAccents2 = function(string2) {
    return string2.replace(allAccents, matcher);
  };
  var hasAccents = function(string2) {
    return !!string2.match(firstAccent);
  };
  removeAccents$1.exports = removeAccents2;
  removeAccents$1.exports.has = hasAccents;
  removeAccents$1.exports.remove = removeAccents2;
  return removeAccents$1.exports;
}
var removeAccentsExports = requireRemoveAccents();
const removeAccents = /* @__PURE__ */ getDefaultExportFromCjs(removeAccentsExports);
const rankings = {
  CASE_SENSITIVE_EQUAL: 7,
  EQUAL: 6,
  STARTS_WITH: 5,
  WORD_STARTS_WITH: 4,
  CONTAINS: 3,
  ACRONYM: 2,
  MATCHES: 1,
  NO_MATCH: 0
};
const defaultBaseSortFn = (a, b) => String(a.rankedValue).localeCompare(String(b.rankedValue));
function matchSorter(items, value, options = {}) {
  return getRankedItems(items, value, options).map(({
    item
  }) => item);
}
function getRankedItems(items, value, options) {
  const {
    keys,
    threshold = rankings.MATCHES,
    baseSort = defaultBaseSortFn,
    sorter = (matchedItems2) => matchedItems2.sort((a, b) => sortRankedValues(a, b, baseSort))
  } = options;
  const matchedItems = items.reduce(reduceItemsToRanked, []);
  return sorter(matchedItems);
  function reduceItemsToRanked(matches, item, index) {
    const rankingInfo = getHighestRanking(item, keys, value, options);
    const {
      rank,
      keyThreshold = threshold
    } = rankingInfo;
    if (rank >= keyThreshold) {
      matches.push({
        ...rankingInfo,
        item,
        index
      });
    }
    return matches;
  }
}
matchSorter.rankings = rankings;
function getHighestRanking(item, keys, value, options) {
  if (!keys) {
    const stringItem = item;
    return {
      // ends up being duplicate of 'item' in matches but consistent
      rankedValue: stringItem,
      rank: getMatchRanking(stringItem, value, options),
      keyIndex: -1,
      keyThreshold: options.threshold
    };
  }
  const valuesToRank = getAllValuesToRank(item, keys);
  return valuesToRank.reduce(({
    rank,
    rankedValue,
    keyIndex,
    keyThreshold
  }, {
    itemValue,
    attributes
  }, i) => {
    let newRank = getMatchRanking(itemValue, value, options);
    let newRankedValue = rankedValue;
    const {
      minRanking,
      maxRanking,
      threshold
    } = attributes;
    if (newRank < minRanking && newRank >= rankings.MATCHES) {
      newRank = minRanking;
    } else if (newRank > maxRanking) {
      newRank = maxRanking;
    }
    if (newRank > rank) {
      rank = newRank;
      keyIndex = i;
      keyThreshold = threshold;
      newRankedValue = itemValue;
    }
    return {
      rankedValue: newRankedValue,
      rank,
      keyIndex,
      keyThreshold
    };
  }, {
    rankedValue: item,
    rank: rankings.NO_MATCH,
    keyIndex: -1,
    keyThreshold: options.threshold
  });
}
function* indexesOf(testString, stringToRank) {
  let index = -1;
  while ((index = testString.indexOf(stringToRank, index + 1)) > -1) {
    yield index;
  }
  return -1;
}
function getMatchRanking(testString, stringToRank, options) {
  testString = prepareValueForComparison(testString, options);
  stringToRank = prepareValueForComparison(stringToRank, options);
  if (stringToRank.length > testString.length) {
    return rankings.NO_MATCH;
  }
  if (testString === stringToRank) {
    return rankings.CASE_SENSITIVE_EQUAL;
  }
  testString = testString.toLowerCase();
  stringToRank = stringToRank.toLowerCase();
  const indexesOfStringToRankInTestString = indexesOf(testString, stringToRank);
  const firstIndexOfStringToRankInTestStringResult = indexesOfStringToRankInTestString.next();
  const indexOfStringToRankInTestString = firstIndexOfStringToRankInTestStringResult.value;
  if (testString.length === stringToRank.length && indexOfStringToRankInTestString === 0) {
    return rankings.EQUAL;
  }
  if (indexOfStringToRankInTestString === 0) {
    return rankings.STARTS_WITH;
  }
  let indexOfStringToRankInTestStringResult = firstIndexOfStringToRankInTestStringResult;
  while (!indexOfStringToRankInTestStringResult.done) {
    if (indexOfStringToRankInTestStringResult.value > 0 && testString[indexOfStringToRankInTestStringResult.value - 1] === " ") {
      return rankings.WORD_STARTS_WITH;
    }
    indexOfStringToRankInTestStringResult = indexesOfStringToRankInTestString.next();
  }
  if (indexOfStringToRankInTestString > 0) {
    return rankings.CONTAINS;
  } else if (stringToRank.length === 1) {
    return rankings.NO_MATCH;
  }
  if (getAcronym(testString).includes(stringToRank)) {
    return rankings.ACRONYM;
  }
  return getClosenessRanking(testString, stringToRank);
}
function getAcronym(string2) {
  let acronym = "";
  let prev = " ";
  for (let i = 0; i < string2.length; i++) {
    const ch = string2.charAt(i);
    const prevWasDelimiter = prev === " " || prev === "-";
    const currIsDelimiter = ch === " " || ch === "-";
    if (prevWasDelimiter && !currIsDelimiter) {
      acronym += ch;
    }
    prev = ch;
  }
  return acronym;
}
function getClosenessRanking(testString, stringToRank) {
  let matchingInOrderCharCount = 0;
  let charNumber = 0;
  function findMatchingCharacter(matchChar, string2, index) {
    for (let j = index, J = string2.length; j < J; j++) {
      const stringChar = string2[j];
      if (stringChar === matchChar) {
        matchingInOrderCharCount += 1;
        return j + 1;
      }
    }
    return -1;
  }
  function getRanking(spread2) {
    const spreadPercentage = 1 / spread2;
    const inOrderPercentage = matchingInOrderCharCount / stringToRank.length;
    const ranking = rankings.MATCHES + inOrderPercentage * spreadPercentage;
    return ranking;
  }
  const firstIndex = findMatchingCharacter(stringToRank[0], testString, 0);
  if (firstIndex < 0) {
    return rankings.NO_MATCH;
  }
  charNumber = firstIndex;
  for (let i = 1, I = stringToRank.length; i < I; i++) {
    const matchChar = stringToRank[i];
    charNumber = findMatchingCharacter(matchChar, testString, charNumber);
    const found = charNumber > -1;
    if (!found) {
      return rankings.NO_MATCH;
    }
  }
  const spread = charNumber - firstIndex;
  return getRanking(spread);
}
function sortRankedValues(a, b, baseSort) {
  const aFirst = -1;
  const bFirst = 1;
  const {
    rank: aRank,
    keyIndex: aKeyIndex
  } = a;
  const {
    rank: bRank,
    keyIndex: bKeyIndex
  } = b;
  const same = aRank === bRank;
  if (same) {
    if (aKeyIndex === bKeyIndex) {
      return baseSort(a, b);
    } else {
      return aKeyIndex < bKeyIndex ? aFirst : bFirst;
    }
  } else {
    return aRank > bRank ? aFirst : bFirst;
  }
}
function prepareValueForComparison(value, {
  keepDiacritics
}) {
  value = `${value}`;
  if (!keepDiacritics) {
    value = removeAccents(value);
  }
  return value;
}
function getItemValues(item, key) {
  if (typeof key === "object") {
    key = key.key;
  }
  let value;
  if (typeof key === "function") {
    value = key(item);
  } else if (item == null) {
    value = null;
  } else if (Object.hasOwnProperty.call(item, key)) {
    value = item[key];
  } else if (key.includes(".")) {
    return getNestedValues(key, item);
  } else {
    value = null;
  }
  if (value == null) {
    return [];
  }
  if (Array.isArray(value)) {
    return value;
  }
  return [String(value)];
}
function getNestedValues(path, item) {
  const keys = path.split(".");
  let values = [item];
  for (let i = 0, I = keys.length; i < I; i++) {
    const nestedKey = keys[i];
    let nestedValues = [];
    for (let j = 0, J = values.length; j < J; j++) {
      const nestedItem = values[j];
      if (nestedItem == null) continue;
      if (Object.hasOwnProperty.call(nestedItem, nestedKey)) {
        const nestedValue = nestedItem[nestedKey];
        if (nestedValue != null) {
          nestedValues.push(nestedValue);
        }
      } else if (nestedKey === "*") {
        nestedValues = nestedValues.concat(nestedItem);
      }
    }
    values = nestedValues;
  }
  if (Array.isArray(values[0])) {
    const result = [];
    return result.concat(...values);
  }
  return values;
}
function getAllValuesToRank(item, keys) {
  const allValues = [];
  for (let j = 0, J = keys.length; j < J; j++) {
    const key = keys[j];
    const attributes = getKeyAttributes(key);
    const itemValues = getItemValues(item, key);
    for (let i = 0, I = itemValues.length; i < I; i++) {
      allValues.push({
        itemValue: itemValues[i],
        attributes
      });
    }
  }
  return allValues;
}
const defaultKeyAttributes = {
  maxRanking: Infinity,
  minRanking: -Infinity
};
function getKeyAttributes(key) {
  if (typeof key === "string") {
    return defaultKeyAttributes;
  }
  return {
    ...defaultKeyAttributes,
    ...key
  };
}
var match$2 = { exports: {} };
var match$1 = match$2.exports;
var hasRequiredMatch;
function requireMatch() {
  if (hasRequiredMatch) return match$2.exports;
  hasRequiredMatch = 1;
  (function(module, exports) {
    !(function(e2, t2) {
      module.exports = t2();
    })(match$1, (() => {
      return e2 = { 772: (e3, t3, o) => {
        const r = o(826).remove, i = /[.*+?^${}()|[\]\\]/g, n2 = /[a-z0-9_]/i, u = /\s+/;
        e3.exports = function(e4, t4, o2) {
          var s, a;
          a = { insideWords: false, findAllOccurrences: false, requireMatchAll: false }, s = (s = o2) || {}, Object.keys(s).forEach(((e5) => {
            a[e5] = !!s[e5];
          })), o2 = a;
          const c = Array.from(e4).map(((e5) => r(e5)));
          let l = c.join("");
          return (t4 = r(t4)).trim().split(u).filter(((e5) => e5.length > 0)).reduce(((e5, t5) => {
            const r2 = t5.length, u2 = !o2.insideWords && n2.test(t5[0]) ? "\\b" : "", s2 = new RegExp(u2 + t5.replace(i, "\\$&"), "i");
            let a2, A;
            if (a2 = s2.exec(l), o2.requireMatchAll && null === a2) return l = "", [];
            for (; a2; ) {
              A = a2.index;
              const t6 = r2 - c.slice(A, A + r2).join("").length, i2 = A - c.slice(0, A).join("").length, n3 = [A + i2, A + r2 + i2 + t6];
              if (n3[0] !== n3[1] && e5.push(n3), l = l.slice(0, A) + new Array(r2 + 1).join(" ") + l.slice(A + r2), !o2.findAllOccurrences) break;
              a2 = s2.exec(l);
            }
            return e5;
          }), []).sort(((e5, t5) => e5[0] - t5[0]));
        };
      }, 826: (e3) => {
        var t3 = { À: "A", Á: "A", Â: "A", Ã: "A", Ä: "A", Å: "A", Ấ: "A", Ắ: "A", Ẳ: "A", Ẵ: "A", Ặ: "A", Æ: "AE", Ầ: "A", Ằ: "A", Ȃ: "A", Ç: "C", Ḉ: "C", È: "E", É: "E", Ê: "E", Ë: "E", Ế: "E", Ḗ: "E", Ề: "E", Ḕ: "E", Ḝ: "E", Ȇ: "E", Ì: "I", Í: "I", Î: "I", Ï: "I", Ḯ: "I", Ȋ: "I", Ð: "D", Ñ: "N", Ò: "O", Ó: "O", Ô: "O", Õ: "O", Ö: "O", Ø: "O", Ố: "O", Ṍ: "O", Ṓ: "O", Ȏ: "O", Ù: "U", Ú: "U", Û: "U", Ü: "U", Ý: "Y", à: "a", á: "a", â: "a", ã: "a", ä: "a", å: "a", ấ: "a", ắ: "a", ẳ: "a", ẵ: "a", ặ: "a", æ: "ae", ầ: "a", ằ: "a", ȃ: "a", ç: "c", ḉ: "c", è: "e", é: "e", ê: "e", ë: "e", ế: "e", ḗ: "e", ề: "e", ḕ: "e", ḝ: "e", ȇ: "e", ì: "i", í: "i", î: "i", ï: "i", ḯ: "i", ȋ: "i", ð: "d", ñ: "n", ò: "o", ó: "o", ô: "o", õ: "o", ö: "o", ø: "o", ố: "o", ṍ: "o", ṓ: "o", ȏ: "o", ù: "u", ú: "u", û: "u", ü: "u", ý: "y", ÿ: "y", Ā: "A", ā: "a", Ă: "A", ă: "a", Ą: "A", ą: "a", Ć: "C", ć: "c", Ĉ: "C", ĉ: "c", Ċ: "C", ċ: "c", Č: "C", č: "c", C̆: "C", c̆: "c", Ď: "D", ď: "d", Đ: "D", đ: "d", Ē: "E", ē: "e", Ĕ: "E", ĕ: "e", Ė: "E", ė: "e", Ę: "E", ę: "e", Ě: "E", ě: "e", Ĝ: "G", Ǵ: "G", ĝ: "g", ǵ: "g", Ğ: "G", ğ: "g", Ġ: "G", ġ: "g", Ģ: "G", ģ: "g", Ĥ: "H", ĥ: "h", Ħ: "H", ħ: "h", Ḫ: "H", ḫ: "h", Ĩ: "I", ĩ: "i", Ī: "I", ī: "i", Ĭ: "I", ĭ: "i", Į: "I", į: "i", İ: "I", ı: "i", Ĳ: "IJ", ĳ: "ij", Ĵ: "J", ĵ: "j", Ķ: "K", ķ: "k", Ḱ: "K", ḱ: "k", K̆: "K", k̆: "k", Ĺ: "L", ĺ: "l", Ļ: "L", ļ: "l", Ľ: "L", ľ: "l", Ŀ: "L", ŀ: "l", Ł: "l", ł: "l", Ḿ: "M", ḿ: "m", M̆: "M", m̆: "m", Ń: "N", ń: "n", Ņ: "N", ņ: "n", Ň: "N", ň: "n", ŉ: "n", N̆: "N", n̆: "n", Ō: "O", ō: "o", Ŏ: "O", ŏ: "o", Ő: "O", ő: "o", Œ: "OE", œ: "oe", P̆: "P", p̆: "p", Ŕ: "R", ŕ: "r", Ŗ: "R", ŗ: "r", Ř: "R", ř: "r", R̆: "R", r̆: "r", Ȓ: "R", ȓ: "r", Ś: "S", ś: "s", Ŝ: "S", ŝ: "s", Ş: "S", Ș: "S", ș: "s", ş: "s", Š: "S", š: "s", Ţ: "T", ţ: "t", ț: "t", Ț: "T", Ť: "T", ť: "t", Ŧ: "T", ŧ: "t", T̆: "T", t̆: "t", Ũ: "U", ũ: "u", Ū: "U", ū: "u", Ŭ: "U", ŭ: "u", Ů: "U", ů: "u", Ű: "U", ű: "u", Ų: "U", ų: "u", Ȗ: "U", ȗ: "u", V̆: "V", v̆: "v", Ŵ: "W", ŵ: "w", Ẃ: "W", ẃ: "w", X̆: "X", x̆: "x", Ŷ: "Y", ŷ: "y", Ÿ: "Y", Y̆: "Y", y̆: "y", Ź: "Z", ź: "z", Ż: "Z", ż: "z", Ž: "Z", ž: "z", ſ: "s", ƒ: "f", Ơ: "O", ơ: "o", Ư: "U", ư: "u", Ǎ: "A", ǎ: "a", Ǐ: "I", ǐ: "i", Ǒ: "O", ǒ: "o", Ǔ: "U", ǔ: "u", Ǖ: "U", ǖ: "u", Ǘ: "U", ǘ: "u", Ǚ: "U", ǚ: "u", Ǜ: "U", ǜ: "u", Ứ: "U", ứ: "u", Ṹ: "U", ṹ: "u", Ǻ: "A", ǻ: "a", Ǽ: "AE", ǽ: "ae", Ǿ: "O", ǿ: "o", Þ: "TH", þ: "th", Ṕ: "P", ṕ: "p", Ṥ: "S", ṥ: "s", X́: "X", x́: "x", Ѓ: "Г", ѓ: "г", Ќ: "К", ќ: "к", A̋: "A", a̋: "a", E̋: "E", e̋: "e", I̋: "I", i̋: "i", Ǹ: "N", ǹ: "n", Ồ: "O", ồ: "o", Ṑ: "O", ṑ: "o", Ừ: "U", ừ: "u", Ẁ: "W", ẁ: "w", Ỳ: "Y", ỳ: "y", Ȁ: "A", ȁ: "a", Ȅ: "E", ȅ: "e", Ȉ: "I", ȉ: "i", Ȍ: "O", ȍ: "o", Ȑ: "R", ȑ: "r", Ȕ: "U", ȕ: "u", B̌: "B", b̌: "b", Č̣: "C", č̣: "c", Ê̌: "E", ê̌: "e", F̌: "F", f̌: "f", Ǧ: "G", ǧ: "g", Ȟ: "H", ȟ: "h", J̌: "J", ǰ: "j", Ǩ: "K", ǩ: "k", M̌: "M", m̌: "m", P̌: "P", p̌: "p", Q̌: "Q", q̌: "q", Ř̩: "R", ř̩: "r", Ṧ: "S", ṧ: "s", V̌: "V", v̌: "v", W̌: "W", w̌: "w", X̌: "X", x̌: "x", Y̌: "Y", y̌: "y", A̧: "A", a̧: "a", B̧: "B", b̧: "b", Ḑ: "D", ḑ: "d", Ȩ: "E", ȩ: "e", Ɛ̧: "E", ɛ̧: "e", Ḩ: "H", ḩ: "h", I̧: "I", i̧: "i", Ɨ̧: "I", ɨ̧: "i", M̧: "M", m̧: "m", O̧: "O", o̧: "o", Q̧: "Q", q̧: "q", U̧: "U", u̧: "u", X̧: "X", x̧: "x", Z̧: "Z", z̧: "z" }, o = Object.keys(t3).join("|"), r = new RegExp(o, "g"), i = new RegExp(o, ""), n2 = function(e4) {
          return e4.replace(r, (function(e5) {
            return t3[e5];
          }));
        };
        e3.exports = n2, e3.exports.has = function(e4) {
          return !!e4.match(i);
        }, e3.exports.remove = n2;
      } }, t2 = {}, (function o(r) {
        var i = t2[r];
        if (void 0 !== i) return i.exports;
        var n2 = t2[r] = { exports: {} };
        return e2[r](n2, n2.exports, o), n2.exports;
      })(772);
      var e2, t2;
    }));
  })(match$2);
  return match$2.exports;
}
var matchExports = requireMatch();
const match = /* @__PURE__ */ getDefaultExportFromCjs(matchExports);
var parse$2 = { exports: {} };
var parse$1 = parse$2.exports;
var hasRequiredParse;
function requireParse() {
  if (hasRequiredParse) return parse$2.exports;
  hasRequiredParse = 1;
  (function(module, exports) {
    !(function(t2, e2) {
      module.exports = e2();
    })(parse$1, (() => {
      return t2 = { 705: (t3) => {
        t3.exports = function(t4, e3) {
          const h = [];
          return 0 === e3.length ? h.push({ text: t4, highlight: false }) : e3[0][0] > 0 && h.push({ text: t4.slice(0, e3[0][0]), highlight: false }), e3.forEach(((i, o) => {
            const s = i[0], r = i[1];
            h.push({ text: t4.slice(s, r), highlight: true }), o === e3.length - 1 ? r < t4.length && h.push({ text: t4.slice(r, t4.length), highlight: false }) : r < e3[o + 1][0] && h.push({ text: t4.slice(r, e3[o + 1][0]), highlight: false });
          })), h;
        };
      } }, e2 = {}, (function h(i) {
        var o = e2[i];
        if (void 0 !== o) return o.exports;
        var s = e2[i] = { exports: {} };
        return t2[i](s, s.exports, h), s.exports;
      })(705);
      var t2, e2;
    }));
  })(parse$2);
  return parse$2.exports;
}
var parseExports = requireParse();
const parse = /* @__PURE__ */ getDefaultExportFromCjs(parseExports);
const defaultMatchOptions = {
  insideWords: true,
  findAllOccurrences: false,
  requireMatchAll: false
};
function adaptHighlightedParts(text, query) {
  const matches = match(text, query, defaultMatchOptions);
  return parse(text, matches);
}
const Highlight = reactExports.forwardRef(function Highlight2({ text, query, markClassName, ...spanProps }, ref) {
  const parts = adaptHighlightedParts(text, query);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { ref, ...spanProps, children: parts.map(
    (part, index) => part.highlight ? /* @__PURE__ */ jsxRuntimeExports.jsx("mark", { className: markClassName ?? "text-purple-primary bg-transparent", children: part.text }, index) : /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Fragment, { children: part.text }, index)
  ) });
});
function adaptUnifiedEvaluationError(error) {
  return {
    error: error.error,
    message: error.message,
    path: error.path ?? error.argumentIndex?.toString() ?? error.argumentName
  };
}
function getErrorsForChild(errors, indexOrKey) {
  return t$4(errors, n$1((err) => {
    if (err.path === void 0) return false;
    return err.path === indexOrKey || err.path.startsWith(`${indexOrKey}.`);
  }), t$2((err) => {
    let fieldPath = err.path;
    if (fieldPath != void 0) {
      if (fieldPath === indexOrKey) {
        fieldPath = void 0;
      } else if (fieldPath?.toString().startsWith(`${indexOrKey}.`)) {
        fieldPath = fieldPath.replace(new RegExp(`^${indexOrKey}\\.`), "");
      }
    }
    return {
      ...err,
      path: fieldPath
    };
  }));
}
function generateFlatEvaluation(node, evaluation, relatedIds = []) {
  const isOperandNode = isKnownOperandAstNode(node);
  const errors = t$2(evaluation.errors, adaptUnifiedEvaluationError);
  const currentRelatedId = isOperandNode ? [node.id] : [...relatedIds, node.id];
  const childrenEvaluations = node.children.flatMap((childNode, i) => {
    const childEvaluation = evaluation.children[i];
    if (!childEvaluation) return [];
    const childErrorsFromParent = getErrorsForChild(errors, i.toString());
    const childEvaluationWithParentError = {
      ...childEvaluation,
      errors: [...childEvaluation.errors, ...childErrorsFromParent]
    };
    return generateFlatEvaluation(childNode, childEvaluationWithParentError, currentRelatedId);
  });
  const namedChildrenEvaluations = t$3(node.namedChildren).flatMap(([key, childNode]) => {
    const childEvaluation = evaluation.namedChildren[key];
    if (!childEvaluation) return [];
    const childErrorsFromParent = getErrorsForChild(errors, key);
    const childEvaluationWithParentError = {
      ...childEvaluation,
      errors: [...childEvaluation.errors, ...childErrorsFromParent]
    };
    return generateFlatEvaluation(childNode, childEvaluationWithParentError, currentRelatedId);
  });
  const hasChildError = childrenEvaluations.filter((e2) => e2.errors.length > 0).length > 0 || namedChildrenEvaluations.filter((e2) => e2.errors.length > 0).length > 0;
  const currentErrors = [...errors.filter((err) => !err.path), ...hasChildError && isLeafOperandAstNode(node) ? [{
    error: "FUNCTION_ERROR",
    message: "function has error"
  }] : []];
  const currentNodeEvaluation = {
    returnValue: evaluation.returnValue,
    errors: currentErrors,
    skipped: evaluation.skipped,
    nodeId: node.id,
    relatedIds: [...relatedIds, node.id]
  };
  return [currentNodeEvaluation, ...childrenEvaluations, ...namedChildrenEvaluations];
}
function buildPayloadAccessorsFromDataModel(dataModel, triggerObjectType) {
  const table = dataModel.find((t2) => t2.name === triggerObjectType);
  if (!table) return [];
  return table.fields.map((f) => NewPayloadAstNode(f.name));
}
function buildDatabaseAccessorsFromDataModel(dataModel, triggerObjectType) {
  const triggerTable = dataModel.find((t2) => t2.name === triggerObjectType);
  if (!triggerTable) return [];
  const accessors = [];
  function recurse(path, linksToSingle, visited) {
    for (const link of linksToSingle) {
      const linkedTable = dataModel.find((t2) => t2.name === link.parentTableName);
      if (!linkedTable || visited.includes(linkedTable.name)) continue;
      const pathForLink = [...path, link.name];
      for (const field of linkedTable.fields) {
        if (field.hidden) continue;
        accessors.push(NewDatabaseAccessAstNode({
          tableName: triggerObjectType,
          fieldName: field.name,
          path: pathForLink
        }));
      }
      recurse(pathForLink, linkedTable.linksToSingle, [...visited, linkedTable.name]);
    }
  }
  recurse([], triggerTable.linksToSingle, [triggerTable.name]);
  return accessors;
}
const archiveScenarioFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(archiveScenarioPayloadSchema).handler(createSsrRpc("2d7100b40687945ab2456f35825bd6c33aaf217a51654dc55ee46af8bd1d928b"));
const copyScenarioFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(copyScenarioPayloadSchema).handler(createSsrRpc("9c16c172bca160e3f7fc361739140c28a4097f84a9be3fdb80c65789479f4796"));
const createScenarioFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(createScenarioPayloadSchema).handler(createSsrRpc("f5641a95755d85fbbf752d30ca29b5a241cd44bb012fada0dbea71e1fe4dc7de"));
const unarchiveScenarioFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(unarchiveScenarioPayloadSchema).handler(createSsrRpc("07f381cd947e2ce40d42defed41552acd2e4dc177cdb37795e212a29db386ba7"));
const updateScenarioFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(updateScenarioPayloadSchema).handler(createSsrRpc("edda937b3a03ff8cb495aeb66e4a69707d30c5b9c271d98d9fd6dabac503df33"));
const getRuleDescriptionFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(object({
  scenarioId: string(),
  astNode: unknown()
})).handler(createSsrRpc("769522befd24b072c6865643d892e7ef5f97ce5a3401a8595862240f4cb9111f"));
const getBuilderOptionsFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(object({
  scenarioId: string()
})).handler(createSsrRpc("97aa765bfb2425b7c56f6b542173eb05eeb7bd8739a091781ebe74dfa31d9861"));
const validateAstFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(object({
  scenarioId: string(),
  node: unknown(),
  expectedReturnType: string().optional()
})).handler(createSsrRpc("a3f82d4acb2686ffe2e5b001f8c0c3edc2466641ccea4fb25f9ad76c4d0fcc41"));
const generateAstFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(generateRuleInputSchema).handler(createSsrRpc("3face8d1e66d149b4aab1655e42cd59c7efb3b66972849e778b5022a4a3f4ad7"));
const saveTriggerPayloadSchema = object({
  iterationId: string(),
  schedule: string(),
  astNode: any()
});
const saveTriggerFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(saveTriggerPayloadSchema).handler(createSsrRpc("2d8e3f709e51112f7756b3d1ab577bb35b7e3324c07eaf86864aa59ebbfebfeb"));
const activateIterationFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(activateIterationPayloadSchema.and(object({
  scenarioId: string(),
  iterationId: string()
}))).handler(createSsrRpc("7de8f78e734f6d311b0794592f0fe7afa5c18a13e3c5015554d865d34486a594"));
const commitIterationFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(commitIterationPayloadSchema.and(object({
  scenarioId: string(),
  iterationId: string()
}))).handler(createSsrRpc("4db6bfc45b50793333de3ae326dcbab4aec61b81c44aeb67d54a0544c0d06df2"));
const createDraftIterationFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(object({
  scenarioId: string(),
  iterationId: string()
})).handler(createSsrRpc("7d98973cbaea0952d4593fcae71ef17fff2105f0f55b0362b6496a5a00f21399"));
const deactivateIterationFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(deactivateIterationPayloadSchema.and(object({
  scenarioId: string(),
  iterationId: string()
}))).handler(createSsrRpc("550320d30c99ef1dc46ef4d34361dd96ea62195dd39befd7f0c642c2e7a0537d"));
const prepareIterationFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(prepareIterationPayloadSchema.and(object({
  scenarioId: string(),
  iterationId: string()
}))).handler(createSsrRpc("2ef10e921f72f4e8e31b7e4b2ec61553aa85ceb906bfa1c87c2e3d46dacf4a1f"));
const getPublicationPreparationStatusFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(object({
  scenarioId: string(),
  iterationId: string()
})).handler(createSsrRpc("3cdce8234c75f1241e5f5a9a3bc4efa972d6329e9c37991994653b6488e308e7"));
const getRuleSnoozeFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(object({
  iterationId: string()
})).handler(createSsrRpc("b649b4f8bcb365c4a1d6fba3e15603506e752a6c72da13f32da492c5d9391cf9"));
const createRuleFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(object({
  scenarioId: string(),
  iterationId: string()
})).handler(createSsrRpc("7a5cf6ff5d57a37f56f723fe4f0b562bb341aec5227b7fc6ce6ac710588c3bfb"));
const deleteRuleFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(deleteRulePayloadSchema.and(object({
  scenarioId: string(),
  iterationId: string()
}))).handler(createSsrRpc("bcd60fdf1b642255312a33581a43354f2ff1a39b21a48272ce313b562293ed46"));
const duplicateRuleFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(duplicateRulePayloadSchema.and(object({
  scenarioId: string(),
  iterationId: string()
}))).handler(createSsrRpc("556d8a7680f56e413a90f30867650c09c290af8cf9bcb9bff6b92a9f3e7eeb2d"));
const createScreeningRuleFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(object({
  scenarioId: string(),
  iterationId: string()
})).handler(createSsrRpc("4c9de4d330ace79a796e7585a6df95ddb3068812db24b1f202bd377cf0ce6664"));
const deleteScreeningRuleFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(object({
  scenarioId: string(),
  iterationId: string(),
  screeningId: string()
})).handler(createSsrRpc("3c7b9ca97df43ba2c4ebde6883b549e1ae7f45aa8843c816b74de7a5fddb4126"));
const cancelTestRunFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(object({
  scenarioId: string(),
  testRunId: string()
})).handler(createSsrRpc("dae75fa64d986db72e5cabd904f22228db84e30d97fed369b04d3ff497ccdc02"));
const createTestRunFn = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(createTestRunPayloadSchema.and(object({
  scenarioId: string()
}))).handler(createSsrRpc("88c9ce0e9be42b3075dec429a85b9229e9ed0fd7288600c5bacafbcb50e93ae7"));
const getIterationRulesFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(object({
  iterationId: string()
})).handler(createSsrRpc("0609578262a15348986f5154cf9f83165e3b77426ebd476d8dbb607ad42ca5d5"));
const getIterationRuleFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(object({
  ruleId: string()
})).handler(createSsrRpc("a81c48bc85c5208715b1ec58392c10a1ba8978e0e1bffe47b2426ae602ca368f"));
const scenarioI18n = ["common", "scenarios"];
const $$splitComponentImporter$q = () => import("./_decisionId-BrOhd5CL.js");
const $$splitErrorComponentImporter$6 = () => import("./_decisionId-CHn4MooV.js");
const decisionLoader = createServerFn().middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("190e537a41b695e9074030a843c24f85222ff378bd328c6084ee189e8cf0869f"));
const Route$w = createFileRoute("/_app/_builder/detection/decisions/$decisionId")({
  loader: ({
    params
  }) => decisionLoader({
    data: {
      params
    }
  }),
  staticData: {
    BreadCrumbs: [({
      isLast
    }) => {
      const {
        t: t2
      } = useTranslation(["decisions"]);
      const {
        decision
      } = Route$w.useLoaderData();
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(BreadCrumbLink, { isLast, to: "/detection/decisions/$decisionId", params: {
          decisionId: fromUUIDtoSUUID(decision.id)
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "line-clamp-1 text-start", children: t2("decisions:decision") }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CopyToClipboardButton, { toCopy: decision.id, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-s line-clamp-1 max-w-40 font-normal", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "ID" }),
          " ",
          decision.id
        ] }) })
      ] });
    }]
  },
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$6, "errorComponent"),
  component: lazyRouteComponent($$splitComponentImporter$q, "component")
});
const $$splitComponentImporter$p = () => import("./_scenarioId-BXSwbOaB.js");
const $$splitErrorComponentImporter$5 = () => import("./_scenarioId-BbI4kFys.js");
const paramsSchema$1 = object({
  scenarioId: string().transform((id) => fromSUUIDtoUUID(id))
});
const searchParamsSchema = object({
  q: string().default(() => btoa(JSON.stringify({
    range: {
      type: "dynamic",
      fromNow: "-P30D"
    }
  })))
});
const analyticsLoader = createServerFn().middleware([authMiddleware]).validator(paramsSchema$1).handler(createSsrRpc("05bb58e2b97b1cc2316fd5a122fc1baf8ed2ef60d1a52ae56a4f4402675f5a55"));
const Route$v = createFileRoute("/_app/_builder/detection/analytics/$scenarioId")({
  validateSearch: searchParamsSchema,
  loader: ({
    params
  }) => analyticsLoader({
    data: params
  }),
  staleTime: Infinity,
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$5, "errorComponent"),
  component: lazyRouteComponent($$splitComponentImporter$p, "component")
});
const B64_PREFIX = "b64.";
function toBase64Url(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function fromBase64Url(encoded) {
  const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - base64.length % 4) % 4);
  const binary = atob(base64 + padding);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}
function encodeClientDetailObjectIdParam(objectId) {
  if (!objectId.includes("/") && !objectId.startsWith(B64_PREFIX)) {
    return objectId;
  }
  return `${B64_PREFIX}${toBase64Url(objectId)}`;
}
function decodeClientDetailObjectIdParam(objectIdParam) {
  if (!objectIdParam.startsWith(B64_PREFIX)) {
    return objectIdParam;
  }
  return fromBase64Url(objectIdParam.slice(B64_PREFIX.length));
}
function clientDetailLinkParams(objectType, objectId) {
  return { objectType, objectId: encodeClientDetailObjectIdParam(objectId) };
}
const $$splitComponentImporter$o = () => import("./_objectType._objectId-D1CYyAVf.js");
const $$splitErrorComponentImporter$4 = () => import("./_objectType._objectId-DzTNZmKj.js");
const paramsSchema = object({
  objectType: string(),
  objectId: string()
});
const getDataFn = createServerFn().middleware([authMiddleware]).validator(paramsSchema).handler(createSsrRpc("62ebf56e36c69c039c1cc474de7eb5d971675bbdc2d6c91f69c807b1422a378b"));
const Route$u = createFileRoute("/_app/_builder/client-detail/$objectType/$objectId")({
  loader: ({
    params: {
      objectType,
      objectId
    }
  }) => getDataFn({
    data: {
      objectType,
      objectId: decodeClientDetailObjectIdParam(objectId)
    }
  }),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$4, "errorComponent"),
  component: lazyRouteComponent($$splitComponentImporter$o, "component")
});
const $$splitComponentImporter$n = () => import("./inboxes._inboxId-Cgp4GF9v.js");
const pageQueryStringSchema = object({
  q: string().optional().default(""),
  limit: number().optional().default(DEFAULT_CASE_PAGINATION_SIZE),
  order: _enum(["ASC", "DESC"]).optional().default("DESC")
});
const casesInboxesLoaderSchema = object({
  params: object({
    inboxId: string().transform((id) => id === MY_INBOX_ID ? id : fromSUUIDtoUUID(id))
  }),
  query: pageQueryStringSchema
});
const casesInboxesLoader = createServerFn().middleware([authMiddleware]).validator(casesInboxesLoaderSchema).handler(createSsrRpc("390480427159ce14e4675efd04896a7ca68c435f7c2dcb40fb7d839403ae4157"));
const Route$t = createFileRoute("/_app/_builder/cases/inboxes/$inboxId")({
  validateSearch: pageQueryStringSchema,
  loaderDeps: ({
    search
  }) => search,
  loader: ({
    params,
    deps
  }) => casesInboxesLoader({
    data: {
      params,
      query: deps
    }
  }),
  component: lazyRouteComponent($$splitComponentImporter$n, "component")
});
const $$splitComponentImporter$m = () => import("./d-CfFaSTLi.js");
const Route$s = createFileRoute("/_app/_builder/cases/$caseId/d")({
  component: lazyRouteComponent($$splitComponentImporter$m, "component")
});
const Route$r = createFileRoute("/_app/_builder/detection/scenarios/$scenarioId/")({
  beforeLoad: ({ params }) => {
    const { scenarioId } = params;
    throw redirect({
      to: "/detection/scenarios/$scenarioId/home",
      params: { scenarioId }
    });
  }
});
const Route$q = createFileRoute("/ressources/cases/sar/download/$caseId/$reportId")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const { authService } = initServerServices(request);
        const { apiClient } = await authService.isAuthenticated(request, {
          failureRedirect: "/sign-in"
        });
        const caseId = params["caseId"];
        invariant$1(caseId);
        const reportId = params["reportId"];
        invariant$1(reportId);
        return Response.json(await apiClient.sarDownload(caseId, reportId));
      }
    }
  }
});
const useBuilderLayoutData = () => {
  return useLoaderData({
    from: "/_app/_builder"
  });
};
const useDetectionScenarioData = () => {
  return useRouteContext({
    from: "/_app/_builder/detection/scenarios/$scenarioId"
  });
};
const useDetectionScenarioIterationData = () => {
  return useRouteContext({
    from: "/_app/_builder/detection/scenarios/$scenarioId/i/$iterationId"
  });
};
const useDerivedIterationRuleGroupsData = () => {
  const {
    rulesMetadata,
    scenarioIteration: { screeningConfigs }
  } = useDetectionScenarioIterationData();
  const configGroups = reactExports.useMemo(
    () => t$4(
      screeningConfigs,
      t$2((c) => c.ruleGroup),
      n$1((group) => group !== void 0)
    ),
    [screeningConfigs]
  );
  return reactExports.useMemo(
    () => t$4(
      rulesMetadata,
      t$2((r) => r.ruleGroup),
      t(configGroups),
      n$1((val) => !e(val)),
      n$2()
    ),
    [rulesMetadata, configGroups]
  );
};
const $$splitComponentImporter$l = () => import("./workflow-D6xpPxmI.js");
const $$splitErrorComponentImporter$3 = () => import("./workflow-cyEfN8W4.js");
const workflowLoader = createServerFn().middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("b715dbcb72c4e13f7f23e5042eb58c4dc63388e4054266d8c58a136fdf4c4189"));
const Route$p = createFileRoute("/_app/_builder/detection/scenarios/$scenarioId/workflow")({
  loader: ({
    params
  }) => workflowLoader({
    data: {
      params
    }
  }),
  staticData: {
    BreadCrumbs: [({
      isLast
    }) => {
      const {
        t: t2
      } = useTranslation(["scenarios"]);
      const {
        currentScenario
      } = useDetectionScenarioData();
      return /* @__PURE__ */ jsxRuntimeExports.jsx(BreadCrumbLink, { isLast, to: "/detection/scenarios/$scenarioId/workflow", params: {
        scenarioId: fromUUIDtoSUUID(currentScenario.id)
      }, children: t2("scenarios:home.workflow") });
    }]
  },
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$3, "errorComponent"),
  component: lazyRouteComponent($$splitComponentImporter$l, "component")
});
const $$splitComponentImporter$k = () => import("./test-run-CfFaSTLi.js");
const Route$o = createFileRoute("/_app/_builder/detection/scenarios/$scenarioId/test-run")({
  staticData: {
    BreadCrumbs: [({
      isLast
    }) => {
      const {
        t: t2
      } = useTranslation(["scenarios"]);
      const {
        currentScenario
      } = useDetectionScenarioData();
      return /* @__PURE__ */ jsxRuntimeExports.jsx(BreadCrumbLink, { isLast, to: "/detection/scenarios/$scenarioId/test-run", params: {
        scenarioId: fromUUIDtoSUUID(currentScenario.id)
      }, children: t2("scenarios:testrun.home") });
    }]
  },
  component: lazyRouteComponent($$splitComponentImporter$k, "component")
});
const $$splitComponentImporter$j = () => import("./scheduled-executions-B7v_TK28.js");
const $$splitErrorComponentImporter$2 = () => import("./scheduled-executions-JDQt79Cn.js");
const scheduledExecutionsLoader = createServerFn().middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("77f970bfcb5f2e16f137b6d50579e1eaca7df3471d314b70a928bd2fffd6e4da"));
const Route$n = createFileRoute("/_app/_builder/detection/scenarios/$scenarioId/scheduled-executions")({
  loader: ({
    params
  }) => scheduledExecutionsLoader({
    data: {
      params
    }
  }),
  staticData: {
    BreadCrumbs: [({
      isLast
    }) => {
      const {
        t: t2
      } = useTranslation(scenarioI18n);
      const {
        currentScenario
      } = useDetectionScenarioData();
      return /* @__PURE__ */ jsxRuntimeExports.jsx(BreadCrumbLink, { to: "/detection/scenarios/$scenarioId/scheduled-executions", params: {
        scenarioId: fromUUIDtoSUUID(currentScenario.id)
      }, isLast, children: t2("scenarios:home.execution") });
    }]
  },
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$2, "errorComponent"),
  component: lazyRouteComponent($$splitComponentImporter$j, "component")
});
const $$splitComponentImporter$i = () => import("./home-8LzLsyNF.js");
const homeLoader = createServerFn().middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("6c2d4274b8efb35e2bf7bcda438ff0aa337178dc081d76f95ef653851647b81d"));
const Route$m = createFileRoute("/_app/_builder/detection/scenarios/$scenarioId/home")({
  loader: ({
    params
  }) => homeLoader({
    data: {
      params
    }
  }),
  component: lazyRouteComponent($$splitComponentImporter$i, "component")
});
const $$splitComponentImporter$h = () => import("./m._caseId-Di2MHPJP.js");
const screeningCaseDetailLoader = createServerFn().middleware([authMiddleware, caseDetailMiddleware]).validator((input) => input).handler(createSsrRpc("b7130ef00549d8fa7b6c392aa54b48f1b9ef9f4afe31fbf69bdb92ada74a5ec5"));
const Route$l = createFileRoute("/_app/_builder/cases/_detail/m/$caseId")({
  loader: ({
    params
  }) => screeningCaseDetailLoader({
    data: {
      params
    }
  }),
  component: lazyRouteComponent($$splitComponentImporter$h, "component")
});
const $$splitComponentImporter$g = () => import("./_decisionId-CfFaSTLi.js");
const Route$k = createFileRoute("/_app/_builder/cases/$caseId/d/$decisionId")({
  component: lazyRouteComponent($$splitComponentImporter$g, "component")
});
const $$splitComponentImporter$f = () => import("./index-lCm7kB0m.js");
const $$splitErrorComponentImporter$1 = () => import("./index-m6x_A6ng.js");
const testRunsLoader = createServerFn().middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("1f732cf3a73e1a42731c4409721b5978c2deb610e7593242c697a8b12223b92b"));
const Route$j = createFileRoute("/_app/_builder/detection/scenarios/$scenarioId/test-run/")({
  loader: ({
    params
  }) => testRunsLoader({
    data: {
      params
    }
  }),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter$1, "errorComponent"),
  component: lazyRouteComponent($$splitComponentImporter$f, "component")
});
function getFormattedVersion({ version }, t2) {
  return version ? `V${version}` : t2("scenarios:draft");
}
function getFormattedLive({ type }, t2) {
  return type === "live version" ? t2("scenarios:live") : void 0;
}
function getFormattedArchived({ archived }, t2) {
  return archived ? t2("scenarios:archived") : void 0;
}
function sortScenarioIteration(lhs, rhs) {
  if (lhs.type === "draft" && rhs.type !== "draft") {
    return -1;
  }
  if (lhs.type !== "draft" && rhs.type === "draft") {
    return 1;
  }
  return lhs.updatedAt > rhs.updatedAt ? -1 : 1;
}
function ScenarioIterationMenu({
  labelledScenarioIteration: scenarioIterations,
  children,
  scenario
}) {
  const { i18n } = useTranslation();
  const [searchValue, setSearchValue] = reactExports.useState("");
  const deferredSearchValue = reactExports.useDeferredValue(searchValue);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuRoot, { searchValue, onSearch: setSearchValue, rtl: i18n.dir() === "rtl", children: [
    children,
    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuPopover, { className: "flex max-h-[min(400px,var(--popover-available-height))] flex-col min-w-48 rounded-xl py-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      ScenarioIterationContent,
      {
        searchValue: deferredSearchValue,
        labelledScenarioIteration: scenarioIterations,
        scenario
      }
    ) })
  ] });
}
function ScenarioIterationContent({ labelledScenarioIteration, searchValue, scenario }) {
  const { t: t2 } = useTranslation(["common", "scenarios"]);
  const matches = reactExports.useMemo(
    () => matchSorter(labelledScenarioIteration, searchValue, {
      keys: ["formattedVersion", "formattedLive", "formattedUpdatedAt"],
      baseSort: (a, b) => sortScenarioIteration(a.item, b.item)
    }),
    [labelledScenarioIteration, searchValue]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuGroup, { className: "flex flex-col gap-sm overflow-y-auto p-sm", children: [
    !matches.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-grey-disabled w-full text-center", children: t2("common:help_center.no_results") }) : /* @__PURE__ */ jsxRuntimeExports.jsx(MenuGroupLabel, { className: "px-sm", children: t2("scenarios:home.versions_label") }),
    matches.map((iteration) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      MenuItem,
      {
        className: " bg-surface-card data-active-item:bg-purple-background-light data-active-item:border-purple-primary flex scroll-my-sm flex-row items-center justify-between gap-sm py-xs px-sm outline-hidden",
        render: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: iteration.linkTo }),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-s flex flex-row gap-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Highlight,
              {
                className: cn("capitalize", { "text-purple-primary": iteration.id === scenario.id }),
                query: searchValue,
                text: iteration.formattedVersion
              }
            ),
            iteration.formattedLive ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-purple-primary capitalize", children: iteration.formattedLive }) : null,
            iteration.formattedArchived ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-secondary capitalize", children: iteration.formattedArchived }) : null
          ] }),
          iteration.id === scenario.id ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-purple-primary ms-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "tick", className: "size-4" }) }) : null
        ]
      },
      iteration.id
    ))
  ] }) }) });
}
const $$splitComponentImporter$e = () => import("./_iterationId-B9WDK6YO.js");
const iterationLayoutLoader = createServerFn().middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("fafa18929cdae382d01409ef2653af321d4e1509920f23eaf5ac11e8be1f519f"));
const Route$i = createFileRoute("/_app/_builder/detection/scenarios/$scenarioId/i/$iterationId")({
  beforeLoad: ({
    params
  }) => iterationLayoutLoader({
    data: {
      params
    }
  }),
  staticData: {
    BreadCrumbs: [({
      isLast
    }) => {
      const {
        t: t2
      } = useTranslation(["scenarios"]);
      const {
        scenarioIterations
      } = Route$i.useRouteContext();
      const iterationId = useParam("iterationId");
      const currentIteration = React.useMemo(() => {
        const currentIteration2 = scenarioIterations.find(({
          id
        }) => id === iterationId);
        invariant$1(currentIteration2);
        return currentIteration2;
      }, [iterationId, scenarioIterations]);
      const currentFormattedVersion = getFormattedVersion(currentIteration, t2);
      const currentFormattedLive = getFormattedLive(currentIteration, t2);
      const currentFormattedArchived = getFormattedArchived(currentIteration, t2);
      if (!isLast) {
        return /* @__PURE__ */ jsxRuntimeExports.jsx(BreadCrumbLink, { isLast, to: "/detection/scenarios/$scenarioId/i/$iterationId", params: {
          scenarioId: fromUUIDtoSUUID(currentIteration.scenarioId),
          iterationId: fromUUIDtoSUUID(currentIteration.id)
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-s flex flex-row gap-xs font-semibold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "capitalize", children: currentFormattedVersion }),
          currentFormattedLive ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-purple-primary capitalize", children: currentFormattedLive }) : null,
          currentFormattedArchived ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-secondary capitalize", children: currentFormattedArchived }) : null
        ] }) });
      }
      return /* @__PURE__ */ jsxRuntimeExports.jsx(VersionSelect, { currentIteration, scenarioIterations });
    }]
  },
  component: lazyRouteComponent($$splitComponentImporter$e, "component")
});
function VersionSelect({
  currentIteration,
  scenarioIterations
}) {
  const {
    t: t2
  } = useTranslation(["scenarios"]);
  const location = useLocation();
  const language = useFormatLanguage();
  const {
    currentScenario
  } = useDetectionScenarioData();
  const labelledScenarioIteration = React.useMemo(() => scenarioIterations.map((si) => ({
    id: si.id,
    type: si.type,
    version: si.version,
    updatedAt: si.updatedAt,
    linkTo: location.pathname.replace(fromUUIDtoSUUID(currentIteration.id), fromUUIDtoSUUID(si.id)),
    formattedVersion: getFormattedVersion(si, t2),
    formattedLive: getFormattedLive(si, t2),
    formattedArchived: getFormattedArchived(si, t2),
    formattedUpdatedAt: formatDateRelative(si.updatedAt, {
      language
    })
  })), [currentIteration.id, language, location.pathname, scenarioIterations, t2]);
  const currentFormattedVersion = getFormattedVersion(currentIteration, t2);
  const currentFormattedLive = getFormattedLive(currentIteration, t2);
  const currentFormattedArchived = getFormattedArchived(currentIteration, t2);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ScenarioIterationMenu, { labelledScenarioIteration, scenario: currentScenario, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuButton, { className: "text-s text-purple-primary border-purple-border focus:border-purple-primary flex items-center rounded-full border py-xs px-sm gap-xs outline-hidden font-normal", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex gap-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "capitalize", children: currentFormattedVersion }),
      currentFormattedLive ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-purple-primary capitalize font-bold", children: currentFormattedLive }) : null,
      currentFormattedArchived ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-secondary capitalize", children: currentFormattedArchived }) : null
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { "aria-hidden": true, icon: "caret-down", className: "size-6 shrink-0" })
  ] }) });
}
const $$splitComponentImporter$d = () => import("./old-ChdXj0dD.js");
const $$splitErrorComponentImporter = () => import("./old-Bgj7sBGq.js");
const scenarioCaseDetailLoader = createServerFn().middleware([authMiddleware, caseDetailMiddleware]).validator((input) => input).handler(createSsrRpc("749fc2cfb4693e85ee5f8ae5e2dce8038cc79455528884f28421b72fd049f498"));
const Route$h = createFileRoute("/_app/_builder/cases/_detail/s/$caseId/old")({
  validateSearch: z$1.object({
    fromInbox: z$1.string().optional()
  }),
  loaderDeps: ({
    search: {
      fromInbox
    }
  }) => ({
    fromInbox
  }),
  loader: ({
    params
  }) => scenarioCaseDetailLoader({
    data: {
      params
    }
  }),
  errorComponent: lazyRouteComponent($$splitErrorComponentImporter, "errorComponent"),
  component: lazyRouteComponent($$splitComponentImporter$d, "component")
});
const $$splitComponentImporter$c = () => import("./_new-D-tfwZ03.js");
const beforeLoadFn$1 = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).validator(object({
  caseId: string().transform((shortuuid) => fromSUUIDtoUUID(shortuuid))
})).handler(createSsrRpc("8d81d60bc69ddcecb83767f0588e917b9b1789d9c964349b5d1fec6ae2c91ed4"));
const Route$g = createFileRoute("/_app/_builder/cases/_detail/s/$caseId/_new")({
  beforeLoad: async ({
    params
  }) => {
    return beforeLoadFn$1({
      data: {
        caseId: params.caseId
      }
    });
  },
  component: lazyRouteComponent($$splitComponentImporter$c, "component")
});
const $$splitComponentImporter$b = () => import("./screenings-CfFaSTLi.js");
const Route$f = createFileRoute("/_app/_builder/cases/$caseId/d/$decisionId/screenings")({
  component: lazyRouteComponent($$splitComponentImporter$b, "component")
});
const $$splitComponentImporter$a = () => import("./index-aepgRhC8.js");
const testRunLoader = createServerFn().middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("3e3dd68bddc4fccfe463f50bf405f3ecaaa57570ec973292136a0b24e4393746"));
const Route$e = createFileRoute("/_app/_builder/detection/scenarios/$scenarioId/test-run/$testRunId/")({
  loader: ({
    params
  }) => testRunLoader({
    data: {
      params
    }
  }),
  staticData: {
    BreadCrumbs: [({
      isLast
    }) => {
      const {
        run
      } = Route$e.useLoaderData();
      const {
        t: t2
      } = useTranslation(["scenarios"]);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(BreadCrumbLink, { isLast, to: "/detection/scenarios/$scenarioId/test-run/$testRunId", params: {
          scenarioId: fromUUIDtoSUUID(run.scenarioId),
          testRunId: fromUUIDtoSUUID(run.id)
        }, children: t2("scenarios:home.testrun") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CopyToClipboardButton, { toCopy: run.id, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-s line-clamp-1 max-w-40 font-normal", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "ID" }),
          " ",
          run.id
        ] }) })
      ] });
    }]
  },
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const beforeLoadFn = createServerFn({
  method: "GET"
}).middleware([authMiddleware]).handler(createSsrRpc("586b6019eca85f8d98213e77d77ee3dd88859a41bd945819a7164bfdc8e96537"));
const Route$d = createFileRoute("/_app/_builder/cases/_detail/s/$caseId/_new/")({
  beforeLoad: async () => {
    const {
      hasAccessToNewVersion
    } = await beforeLoadFn();
    if (hasAccessToNewVersion) {
      throw redirect({
        from: "/cases/s/$caseId",
        to: "./principal"
      });
    }
    throw redirect({
      from: "/cases/s/$caseId",
      to: "./old"
    });
  }
});
const $$splitComponentImporter$9 = () => import("./_edit-view-CleFG5dL.js");
const editViewLoader = createServerFn().middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("ba9c379c3bd9fefe648e379845f78650c969c6a20b6cd18078d4a9a7a1545fbb"));
const Route$c = createFileRoute("/_app/_builder/detection/scenarios/$scenarioId/i/$iterationId/_edit-view")({
  loader: ({
    params
  }) => editViewLoader({
    data: {
      params
    }
  }),
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("./principal-DwQy_HkO.js");
const Route$b = createFileRoute("/_app/_builder/cases/_detail/s/$caseId/_new/principal")({
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./clients-2l_kATBJ.js");
const Route$a = createFileRoute("/_app/_builder/cases/_detail/s/$caseId/_new/clients")({
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const screeningStatusMapping = {
  in_review: { color: "orange", tKey: "screenings:status.in_review" },
  confirmed_hit: { color: "red", tKey: "screenings:status.confirmed_hit" },
  no_hit: { color: "green", tKey: "screenings:status.no_hit" },
  error: { color: "red", tKey: "screenings:status.error" }
};
function ScreeningStatusTag({
  status,
  pendingHitCount,
  className
}) {
  const { t: t2 } = useTranslation(screeningsI18n);
  const screeningStatus = screeningStatusMapping[status];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: screeningStatus.color, className, children: t2(screeningStatus.tKey, { count: pendingHitCount ?? 0 }) });
}
const $$splitComponentImporter$6 = () => import("./_screeningId-DK1MgDTP.js");
const screeningLayoutLoader = createServerFn().middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("ec8c4b7b0966af1bbe93faf723d4a1602ac35ba6bcaa41896162c40e24575da0"));
const Route$9 = createFileRoute("/_app/_builder/cases/$caseId/d/$decisionId/screenings/$screeningId")({
  staticData: {
    BreadCrumbs: [({
      isLast
    }) => {
      const {
        t: t2
      } = useTranslation(["navigation"]);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(BreadCrumbLink, { to: "/cases", isLast, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "case-manager", className: "me-sm size-6" }),
        t2("navigation:case_manager")
      ] });
    }, ({
      isLast
    }) => {
      const {
        inbox
      } = Route$9.useLoaderData();
      return /* @__PURE__ */ jsxRuntimeExports.jsx(BreadCrumbLink, { to: "/cases/inboxes/$inboxId", params: {
        inboxId: fromUUIDtoSUUID(inbox.id)
      }, isLast, children: inbox.name });
    }, ({
      isLast
    }) => {
      const {
        t: t2
      } = useTranslation(["cases"]);
      const {
        caseDetail
      } = Route$9.useLoaderData();
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(BreadCrumbLink, { to: "/cases/$caseId", params: {
          caseId: fromUUIDtoSUUID(caseDetail.id)
        }, isLast, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "line-clamp-2 text-start", children: t2("cases:case.page_title") }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-s border-grey-border text-grey-secondary inline-flex gap-sm rounded-sm border px-xs font-normal", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "ID" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-rtl max-w-20 truncate", children: caseDetail.id })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CaseStatusBadgeV2, { status: caseDetail.status, outcome: caseDetail.outcome, variant: "semi-full" })
      ] });
    }, ({
      isLast
    }) => {
      const {
        caseDetail,
        decision,
        screening
      } = Route$9.useLoaderData();
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(BreadCrumbLink, { to: "/cases/$caseId/d/$decisionId/screenings/$screeningId", params: {
          caseId: fromUUIDtoSUUID(caseDetail.id),
          decisionId: fromUUIDtoSUUID(decision.id),
          screeningId: fromUUIDtoSUUID(screening.id)
        }, isLast, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "line-clamp-2 text-start", children: screening.config.name }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ScreeningStatusTag, { status: screening.status, pendingHitCount: screening.matches.filter((m) => m.status === "pending").length })
      ] });
    }]
  },
  loader: ({
    params
  }) => screeningLayoutLoader({
    data: {
      params
    }
  }),
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const Route$8 = createFileRoute("/_app/_builder/detection/scenarios/$scenarioId/i/$iterationId/_edit-view/")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/detection/scenarios/$scenarioId/i/$iterationId/trigger",
      params: { scenarioId: params.scenarioId, iterationId: params.iterationId }
    });
  }
});
const Route$7 = createFileRoute("/_app/_builder/cases/_detail/s/$caseId/_new/clients/")({
  beforeLoad: async ({ context }) => {
    const { pivotObjects } = context;
    if (pivotObjects.length > 0 && pivotObjects[0]) {
      throw redirect({
        from: "/cases/s/$caseId/clients",
        to: "./$pivotValue",
        params: { pivotValue: getPivotObjectKey(pivotObjects[0]) }
      });
    }
    throw notFound();
  }
});
const screeningIndexLoader = createServerFn().middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("fae90b50f659174fbb10c5c418df19bf152d84db7c54afb41783f3357caf76e7"));
const Route$6 = createFileRoute("/_app/_builder/cases/$caseId/d/$decisionId/screenings/$screeningId/")({
  loader: ({
    params
  }) => screeningIndexLoader({
    data: {
      params
    }
  })
});
const $$splitComponentImporter$5 = () => import("./trigger-DQJiowU8.js");
const Route$5 = createFileRoute("/_app/_builder/detection/scenarios/$scenarioId/i/$iterationId/_edit-view/trigger")({
  loader: ({
    params
  }) => getBuilderOptionsFn({
    data: {
      scenarioId: fromSUUIDtoUUID(params.scenarioId)
    }
  }),
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./rules-DeVJxgiX.js");
const rulesLoader = createServerFn().middleware([authMiddleware]).handler(createSsrRpc("896a1ecc11846a9461e21facf77adf667f611a1ae5b520fb3166be717fd06c95"));
const Route$4 = createFileRoute("/_app/_builder/detection/scenarios/$scenarioId/i/$iterationId/_edit-view/rules")({
  loader: () => rulesLoader(),
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./decision-DSuljbOA.js");
const Route$3 = createFileRoute("/_app/_builder/detection/scenarios/$scenarioId/i/$iterationId/_edit-view/decision")({
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./_pivotValue-kRnSpfnl.js");
const Route$2 = createFileRoute("/_app/_builder/cases/_detail/s/$caseId/_new/clients/$pivotValue")({
  beforeLoad: ({
    context,
    params
  }) => {
    const {
      pivotObjects
    } = context;
    const pivotObject = (pivotObjects ?? []).find((p2) => getPivotObjectKey(p2) === params.pivotValue);
    if (!pivotObject) {
      throw redirect({
        from: "/cases/s/$caseId/",
        to: "./principal"
      });
    }
    return {
      pivotObject
    };
  },
  loader: ({
    context: {
      pivotObject
    }
  }) => {
    return {
      objectId: pivotObject.pivotObjectId,
      objectType: pivotObject.pivotObjectName
    };
  },
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./hits-_-HwhBM0.js");
const Route$1 = createFileRoute("/_app/_builder/cases/$caseId/d/$decisionId/screenings/$screeningId/hits")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./files-BnpImGHj.js");
const screeningFilesLoader = createServerFn().middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("4a28384f0c1ddd01ba12aeab2b2ace7744773b2f0c0f887d7cbabaa408dd4843"));
const Route2 = createFileRoute("/_app/_builder/cases/$caseId/d/$decisionId/screenings/$screeningId/files")({
  loader: ({
    params
  }) => screeningFilesLoader({
    data: {
      params
    }
  }),
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const HealthcheckRoute = Route$1J.update({
  id: "/healthcheck",
  path: "/healthcheck",
  getParentRoute: () => Route$1K
});
const AppRouterRoute = Route$1I.update({
  id: "/app-router",
  path: "/app-router",
  getParentRoute: () => Route$1K
});
const AppRoute = Route$1H.update({
  id: "/_app",
  getParentRoute: () => Route$1K
});
const SplatRoute = Route$1G.update({
  id: "/$",
  path: "/$",
  getParentRoute: () => Route$1K
});
const IndexRoute = Route$1F.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$1K
});
const RobotsTxtRoute = Route$1E.update({
  id: "/robots/txt",
  path: "/robots/txt",
  getParentRoute: () => Route$1K
});
const RessourcesLocalesRoute = Route$1D.update({
  id: "/ressources/locales",
  path: "/ressources/locales",
  getParentRoute: () => Route$1K
});
const OidcCallbackRoute = Route$1C.update({
  id: "/oidc/callback",
  path: "/oidc/callback",
  getParentRoute: () => Route$1K
});
const OidcAuthRoute = Route$1B.update({
  id: "/oidc/auth",
  path: "/oidc/auth",
  getParentRoute: () => Route$1K
});
const AppBuilderRoute = Route$1A.update({
  id: "/_builder",
  getParentRoute: () => AppRoute
});
const AppAuthRoute = Route$1z.update({
  id: "/_auth",
  getParentRoute: () => AppRoute
});
const RessourcesDataExportOrgRoute = Route$1y.update({
  id: "/ressources/data/export-org",
  path: "/ressources/data/export-org",
  getParentRoute: () => Route$1K
});
const AppBuilderUserScoringRoute = Route$1x.update({
  id: "/user-scoring",
  path: "/user-scoring",
  getParentRoute: () => AppBuilderRoute
});
const AppBuilderSettingsRoute = Route$1w.update({
  id: "/settings",
  path: "/settings",
  getParentRoute: () => AppBuilderRoute
});
const AppBuilderScreeningSearchRoute = Route$1v.update({
  id: "/screening-search",
  path: "/screening-search",
  getParentRoute: () => AppBuilderRoute
});
const AppBuilderDetectionRoute = Route$1u.update({
  id: "/detection",
  path: "/detection",
  getParentRoute: () => AppBuilderRoute
});
const AppBuilderDataRoute = Route$1t.update({
  id: "/data",
  path: "/data",
  getParentRoute: () => AppBuilderRoute
});
const AppBuilderContinuousScreeningRoute = Route$1s.update({
  id: "/continuous-screening",
  path: "/continuous-screening",
  getParentRoute: () => AppBuilderRoute
});
const AppBuilderCasesRoute = Route$1r.update({
  id: "/cases",
  path: "/cases",
  getParentRoute: () => AppBuilderRoute
});
const AppBuilderAnalyticsLegacyRoute = Route$1q.update({
  id: "/analytics-legacy",
  path: "/analytics-legacy",
  getParentRoute: () => AppBuilderRoute
});
const AppBuilderAccountRoute = Route$1p.update({
  id: "/account",
  path: "/account",
  getParentRoute: () => AppBuilderRoute
});
const AppAuthSignInEmailRoute = Route$1o.update({
  id: "/sign-in-email",
  path: "/sign-in-email",
  getParentRoute: () => AppAuthRoute
});
const AppAuthSignInRoute = Route$1n.update({
  id: "/sign-in",
  path: "/sign-in",
  getParentRoute: () => AppAuthRoute
});
const AppAuthEmailVerificationRoute = Route$1m.update({
  id: "/email-verification",
  path: "/email-verification",
  getParentRoute: () => AppAuthRoute
});
const AppAuthCreatePasswordRoute = Route$1l.update({
  id: "/create-password",
  path: "/create-password",
  getParentRoute: () => AppAuthRoute
});
const AppAuthAuthRedirectRoute = Route$1k.update({
  id: "/auth-redirect",
  path: "/auth-redirect",
  getParentRoute: () => AppAuthRoute
});
const AppBuilderUserScoringIndexRoute = Route$1j.update({
  id: "/",
  path: "/",
  getParentRoute: () => AppBuilderUserScoringRoute
});
const AppBuilderSettingsIndexRoute = Route$1i.update({
  id: "/",
  path: "/",
  getParentRoute: () => AppBuilderSettingsRoute
});
const AppBuilderScreeningSearchIndexRoute = Route$1h.update({
  id: "/",
  path: "/",
  getParentRoute: () => AppBuilderScreeningSearchRoute
});
const AppBuilderDetectionIndexRoute = Route$1g.update({
  id: "/",
  path: "/",
  getParentRoute: () => AppBuilderDetectionRoute
});
const AppBuilderDataIndexRoute = Route$1f.update({
  id: "/",
  path: "/",
  getParentRoute: () => AppBuilderDataRoute
});
const AppBuilderContinuousScreeningIndexRoute = Route$1e.update({
  id: "/",
  path: "/",
  getParentRoute: () => AppBuilderContinuousScreeningRoute
});
const AppBuilderClientDetailIndexRoute = Route$1d.update({
  id: "/client-detail/",
  path: "/client-detail/",
  getParentRoute: () => AppBuilderRoute
});
const AppBuilderCasesIndexRoute = Route$1c.update({
  id: "/",
  path: "/",
  getParentRoute: () => AppBuilderCasesRoute
});
const RessourcesListsDownloadCsvFileListIdRoute = Route$1b.update({
  id: "/ressources/lists/download-csv-file/$listId",
  path: "/ressources/lists/download-csv-file/$listId",
  getParentRoute: () => Route$1K
});
const RessourcesCasesNextUnassignedCaseIdRoute = Route$1a.update({
  id: "/ressources/cases/next-unassigned/$caseId",
  path: "/ressources/cases/next-unassigned/$caseId",
  getParentRoute: () => Route$1K
});
const RessourcesCasesDownloadFileFileIdRoute = Route$19.update({
  id: "/ressources/cases/download-file/$fileId",
  path: "/ressources/cases/download-file/$fileId",
  getParentRoute: () => Route$1K
});
const RessourcesCasesDownloadDataCaseIdRoute = Route$18.update({
  id: "/ressources/cases/download-data/$caseId",
  path: "/ressources/cases/download-data/$caseId",
  getParentRoute: () => Route$1K
});
const AppBuilderUserScoringOverviewRoute = Route$17.update({
  id: "/overview",
  path: "/overview",
  getParentRoute: () => AppBuilderUserScoringRoute
});
const AppBuilderUploadObjectTypeRoute = Route$16.update({
  id: "/upload/$objectType",
  path: "/upload/$objectType",
  getParentRoute: () => AppBuilderRoute
});
const AppBuilderSettingsWebhooksRoute = Route$15.update({
  id: "/webhooks",
  path: "/webhooks",
  getParentRoute: () => AppBuilderSettingsRoute
});
const AppBuilderSettingsUsersRoute = Route$14.update({
  id: "/users",
  path: "/users",
  getParentRoute: () => AppBuilderSettingsRoute
});
const AppBuilderSettingsTagsRoute = Route$13.update({
  id: "/tags",
  path: "/tags",
  getParentRoute: () => AppBuilderSettingsRoute
});
const AppBuilderSettingsScreeningProvidersRoute = Route$12.update({
  id: "/screening-providers",
  path: "/screening-providers",
  getParentRoute: () => AppBuilderSettingsRoute
});
const AppBuilderSettingsScenariosRoute = Route$11.update({
  id: "/scenarios",
  path: "/scenarios",
  getParentRoute: () => AppBuilderSettingsRoute
});
const AppBuilderSettingsIpWhitelistingRoute = Route$10.update({
  id: "/ip-whitelisting",
  path: "/ip-whitelisting",
  getParentRoute: () => AppBuilderSettingsRoute
});
const AppBuilderSettingsInboxesRoute = Route$$.update({
  id: "/inboxes",
  path: "/inboxes",
  getParentRoute: () => AppBuilderSettingsRoute
});
const AppBuilderSettingsAuditLogsRoute = Route$_.update({
  id: "/audit-logs",
  path: "/audit-logs",
  getParentRoute: () => AppBuilderSettingsRoute
});
const AppBuilderSettingsApiKeysRoute = Route$Z.update({
  id: "/api-keys",
  path: "/api-keys",
  getParentRoute: () => AppBuilderSettingsRoute
});
const AppBuilderSettingsAnalyticsRoute = Route$Y.update({
  id: "/analytics",
  path: "/analytics",
  getParentRoute: () => AppBuilderSettingsRoute
});
const AppBuilderDetectionScenariosRoute = Route$X.update({
  id: "/scenarios",
  path: "/scenarios",
  getParentRoute: () => AppBuilderDetectionRoute
});
const AppBuilderDetectionListsRoute = Route$W.update({
  id: "/lists",
  path: "/lists",
  getParentRoute: () => AppBuilderDetectionRoute
});
const AppBuilderDetectionDecisionsRoute = Route$V.update({
  id: "/decisions",
  path: "/decisions",
  getParentRoute: () => AppBuilderDetectionRoute
});
const AppBuilderDetectionAnalyticsRoute = Route$U.update({
  id: "/analytics",
  path: "/analytics",
  getParentRoute: () => AppBuilderDetectionRoute
});
const AppBuilderDataListRoute = Route$T.update({
  id: "/list",
  path: "/list",
  getParentRoute: () => AppBuilderDataRoute
});
const AppBuilderContinuousScreeningConfigurationsRoute = Route$S.update({
  id: "/configurations",
  path: "/configurations",
  getParentRoute: () => AppBuilderContinuousScreeningRoute
});
const AppBuilderCasesOverviewRoute = Route$R.update({
  id: "/overview",
  path: "/overview",
  getParentRoute: () => AppBuilderCasesRoute
});
const AppBuilderCasesInboxesRoute = Route$Q.update({
  id: "/inboxes",
  path: "/inboxes",
  getParentRoute: () => AppBuilderCasesRoute
});
const AppBuilderCasesAnalyticsRoute = Route$P.update({
  id: "/analytics",
  path: "/analytics",
  getParentRoute: () => AppBuilderCasesRoute
});
const AppBuilderCasesDetailRoute = Route$O.update({
  id: "/_detail",
  getParentRoute: () => AppBuilderCasesRoute
});
const AppBuilderCasesCaseIdRoute = Route$N.update({
  id: "/$caseId",
  path: "/$caseId",
  getParentRoute: () => AppBuilderCasesRoute
});
const AppBuilderSettingsInboxesIndexRoute = Route$M.update({
  id: "/",
  path: "/",
  getParentRoute: () => AppBuilderSettingsInboxesRoute
});
const AppBuilderDetectionScenariosIndexRoute = Route$L.update({
  id: "/",
  path: "/",
  getParentRoute: () => AppBuilderDetectionScenariosRoute
});
const AppBuilderDetectionListsIndexRoute = Route$K.update({
  id: "/",
  path: "/",
  getParentRoute: () => AppBuilderDetectionListsRoute
});
const AppBuilderDetectionDecisionsIndexRoute = Route$J.update({
  id: "/",
  path: "/",
  getParentRoute: () => AppBuilderDetectionDecisionsRoute
});
const AppBuilderDetectionAnalyticsIndexRoute = Route$I.update({
  id: "/",
  path: "/",
  getParentRoute: () => AppBuilderDetectionAnalyticsRoute
});
const AppBuilderContinuousScreeningCreateIndexRoute = Route$H.update({
  id: "/create/",
  path: "/create/",
  getParentRoute: () => AppBuilderContinuousScreeningRoute
});
const AppBuilderCasesInboxesIndexRoute = Route$G.update({
  id: "/",
  path: "/",
  getParentRoute: () => AppBuilderCasesInboxesRoute
});
const AppBuilderCasesCaseIdIndexRoute = Route$F.update({
  id: "/",
  path: "/",
  getParentRoute: () => AppBuilderCasesCaseIdRoute
});
const RessourcesScreeningsDownloadScreeningIdFileIdRoute = Route$E.update({
  id: "/ressources/screenings/download/$screeningId/$fileId",
  path: "/ressources/screenings/download/$screeningId/$fileId",
  getParentRoute: () => Route$1K
});
const RessourcesAnnotationsDownloadFileAnnotationIdFileIdRoute = Route$D.update({
  id: "/ressources/annotations/download-file/$annotationId/$fileId",
  path: "/ressources/annotations/download-file/$annotationId/$fileId",
  getParentRoute: () => Route$1K
});
const AppBuilderUserScoringRecordTypeVersionRoute = Route$C.update({
  id: "/$recordType/$version",
  path: "/$recordType/$version",
  getParentRoute: () => AppBuilderUserScoringRoute
});
const AppBuilderSettingsWebhooksWebhookIdRoute = Route$B.update({
  id: "/webhooks_/$webhookId",
  path: "/webhooks/$webhookId",
  getParentRoute: () => AppBuilderSettingsRoute
});
const AppBuilderSettingsInboxesInboxIdRoute = Route$A.update({
  id: "/$inboxId",
  path: "/$inboxId",
  getParentRoute: () => AppBuilderSettingsInboxesRoute
});
const AppBuilderSettingsAnalyticsFiltersRoute = Route$z.update({
  id: "/filters",
  path: "/filters",
  getParentRoute: () => AppBuilderSettingsAnalyticsRoute
});
const AppBuilderDetectionScenariosScenarioIdRoute = Route$y.update({
  id: "/$scenarioId",
  path: "/$scenarioId",
  getParentRoute: () => AppBuilderDetectionScenariosRoute
});
const AppBuilderDetectionListsListIdRoute = Route$x.update({
  id: "/$listId",
  path: "/$listId",
  getParentRoute: () => AppBuilderDetectionListsRoute
});
const AppBuilderDetectionDecisionsDecisionIdRoute = Route$w.update({
  id: "/$decisionId",
  path: "/$decisionId",
  getParentRoute: () => AppBuilderDetectionDecisionsRoute
});
const AppBuilderDetectionAnalyticsScenarioIdRoute = Route$v.update({
  id: "/$scenarioId",
  path: "/$scenarioId",
  getParentRoute: () => AppBuilderDetectionAnalyticsRoute
});
const AppBuilderClientDetailObjectTypeObjectIdRoute = Route$u.update({
  id: "/client-detail/$objectType/$objectId",
  path: "/client-detail/$objectType/$objectId",
  getParentRoute: () => AppBuilderRoute
});
const AppBuilderCasesInboxesInboxIdRoute = Route$t.update({
  id: "/$inboxId",
  path: "/$inboxId",
  getParentRoute: () => AppBuilderCasesInboxesRoute
});
const AppBuilderCasesCaseIdDRoute = Route$s.update({
  id: "/d",
  path: "/d",
  getParentRoute: () => AppBuilderCasesCaseIdRoute
});
const AppBuilderDetectionScenariosScenarioIdIndexRoute = Route$r.update({
  id: "/",
  path: "/",
  getParentRoute: () => AppBuilderDetectionScenariosScenarioIdRoute
});
const RessourcesCasesSarDownloadCaseIdReportIdRoute = Route$q.update({
  id: "/ressources/cases/sar/download/$caseId/$reportId",
  path: "/ressources/cases/sar/download/$caseId/$reportId",
  getParentRoute: () => Route$1K
});
const AppBuilderDetectionScenariosScenarioIdWorkflowRoute = Route$p.update({
  id: "/workflow",
  path: "/workflow",
  getParentRoute: () => AppBuilderDetectionScenariosScenarioIdRoute
});
const AppBuilderDetectionScenariosScenarioIdTestRunRoute = Route$o.update({
  id: "/test-run",
  path: "/test-run",
  getParentRoute: () => AppBuilderDetectionScenariosScenarioIdRoute
});
const AppBuilderDetectionScenariosScenarioIdScheduledExecutionsRoute = Route$n.update({
  id: "/scheduled-executions",
  path: "/scheduled-executions",
  getParentRoute: () => AppBuilderDetectionScenariosScenarioIdRoute
});
const AppBuilderDetectionScenariosScenarioIdHomeRoute = Route$m.update({
  id: "/home",
  path: "/home",
  getParentRoute: () => AppBuilderDetectionScenariosScenarioIdRoute
});
const AppBuilderCasesDetailMCaseIdRoute = Route$l.update({
  id: "/m/$caseId",
  path: "/m/$caseId",
  getParentRoute: () => AppBuilderCasesDetailRoute
});
const AppBuilderCasesCaseIdDDecisionIdRoute = Route$k.update({
  id: "/$decisionId",
  path: "/$decisionId",
  getParentRoute: () => AppBuilderCasesCaseIdDRoute
});
const AppBuilderDetectionScenariosScenarioIdTestRunIndexRoute = Route$j.update({
  id: "/",
  path: "/",
  getParentRoute: () => AppBuilderDetectionScenariosScenarioIdTestRunRoute
});
const AppBuilderDetectionScenariosScenarioIdIIterationIdRoute = Route$i.update({
  id: "/i/$iterationId",
  path: "/i/$iterationId",
  getParentRoute: () => AppBuilderDetectionScenariosScenarioIdRoute
});
const AppBuilderCasesDetailSCaseIdOldRoute = Route$h.update({
  id: "/s/$caseId/old",
  path: "/s/$caseId/old",
  getParentRoute: () => AppBuilderCasesDetailRoute
});
const AppBuilderCasesDetailSCaseIdNewRoute = Route$g.update({
  id: "/s/$caseId/_new",
  path: "/s/$caseId",
  getParentRoute: () => AppBuilderCasesDetailRoute
});
const AppBuilderCasesCaseIdDDecisionIdScreeningsRoute = Route$f.update({
  id: "/screenings",
  path: "/screenings",
  getParentRoute: () => AppBuilderCasesCaseIdDDecisionIdRoute
});
const AppBuilderDetectionScenariosScenarioIdTestRunTestRunIdIndexRoute = Route$e.update(
  {
    id: "/$testRunId/",
    path: "/$testRunId/",
    getParentRoute: () => AppBuilderDetectionScenariosScenarioIdTestRunRoute
  }
);
const AppBuilderCasesDetailSCaseIdNewIndexRoute = Route$d.update({
  id: "/",
  path: "/",
  getParentRoute: () => AppBuilderCasesDetailSCaseIdNewRoute
});
const AppBuilderDetectionScenariosScenarioIdIIterationIdEditViewRoute = Route$c.update({
  id: "/_edit-view",
  getParentRoute: () => AppBuilderDetectionScenariosScenarioIdIIterationIdRoute
});
const AppBuilderCasesDetailSCaseIdNewPrincipalRoute = Route$b.update({
  id: "/principal",
  path: "/principal",
  getParentRoute: () => AppBuilderCasesDetailSCaseIdNewRoute
});
const AppBuilderCasesDetailSCaseIdNewClientsRoute = Route$a.update({
  id: "/clients",
  path: "/clients",
  getParentRoute: () => AppBuilderCasesDetailSCaseIdNewRoute
});
const AppBuilderCasesCaseIdDDecisionIdScreeningsScreeningIdRoute = Route$9.update({
  id: "/$screeningId",
  path: "/$screeningId",
  getParentRoute: () => AppBuilderCasesCaseIdDDecisionIdScreeningsRoute
});
const AppBuilderDetectionScenariosScenarioIdIIterationIdEditViewIndexRoute = Route$8.update(
  {
    id: "/",
    path: "/",
    getParentRoute: () => AppBuilderDetectionScenariosScenarioIdIIterationIdEditViewRoute
  }
);
const AppBuilderCasesDetailSCaseIdNewClientsIndexRoute = Route$7.update({
  id: "/",
  path: "/",
  getParentRoute: () => AppBuilderCasesDetailSCaseIdNewClientsRoute
});
const AppBuilderCasesCaseIdDDecisionIdScreeningsScreeningIdIndexRoute = Route$6.update({
  id: "/",
  path: "/",
  getParentRoute: () => AppBuilderCasesCaseIdDDecisionIdScreeningsScreeningIdRoute
});
const AppBuilderDetectionScenariosScenarioIdIIterationIdEditViewTriggerRoute = Route$5.update(
  {
    id: "/trigger",
    path: "/trigger",
    getParentRoute: () => AppBuilderDetectionScenariosScenarioIdIIterationIdEditViewRoute
  }
);
const AppBuilderDetectionScenariosScenarioIdIIterationIdEditViewRulesRoute = Route$4.update(
  {
    id: "/rules",
    path: "/rules",
    getParentRoute: () => AppBuilderDetectionScenariosScenarioIdIIterationIdEditViewRoute
  }
);
const AppBuilderDetectionScenariosScenarioIdIIterationIdEditViewDecisionRoute = Route$3.update(
  {
    id: "/decision",
    path: "/decision",
    getParentRoute: () => AppBuilderDetectionScenariosScenarioIdIIterationIdEditViewRoute
  }
);
const AppBuilderCasesDetailSCaseIdNewClientsPivotValueRoute = Route$2.update({
  id: "/$pivotValue",
  path: "/$pivotValue",
  getParentRoute: () => AppBuilderCasesDetailSCaseIdNewClientsRoute
});
const AppBuilderCasesCaseIdDDecisionIdScreeningsScreeningIdHitsRoute = Route$1.update({
  id: "/hits",
  path: "/hits",
  getParentRoute: () => AppBuilderCasesCaseIdDDecisionIdScreeningsScreeningIdRoute
});
const AppBuilderCasesCaseIdDDecisionIdScreeningsScreeningIdFilesRoute = Route2.update({
  id: "/files",
  path: "/files",
  getParentRoute: () => AppBuilderCasesCaseIdDDecisionIdScreeningsScreeningIdRoute
});
const AppAuthRouteChildren = {
  AppAuthAuthRedirectRoute,
  AppAuthCreatePasswordRoute,
  AppAuthEmailVerificationRoute,
  AppAuthSignInRoute,
  AppAuthSignInEmailRoute
};
const AppAuthRouteWithChildren = AppAuthRoute._addFileChildren(AppAuthRouteChildren);
const AppBuilderCasesCaseIdDDecisionIdScreeningsScreeningIdRouteChildren = {
  AppBuilderCasesCaseIdDDecisionIdScreeningsScreeningIdFilesRoute,
  AppBuilderCasesCaseIdDDecisionIdScreeningsScreeningIdHitsRoute,
  AppBuilderCasesCaseIdDDecisionIdScreeningsScreeningIdIndexRoute
};
const AppBuilderCasesCaseIdDDecisionIdScreeningsScreeningIdRouteWithChildren = AppBuilderCasesCaseIdDDecisionIdScreeningsScreeningIdRoute._addFileChildren(
  AppBuilderCasesCaseIdDDecisionIdScreeningsScreeningIdRouteChildren
);
const AppBuilderCasesCaseIdDDecisionIdScreeningsRouteChildren = {
  AppBuilderCasesCaseIdDDecisionIdScreeningsScreeningIdRoute: AppBuilderCasesCaseIdDDecisionIdScreeningsScreeningIdRouteWithChildren
};
const AppBuilderCasesCaseIdDDecisionIdScreeningsRouteWithChildren = AppBuilderCasesCaseIdDDecisionIdScreeningsRoute._addFileChildren(
  AppBuilderCasesCaseIdDDecisionIdScreeningsRouteChildren
);
const AppBuilderCasesCaseIdDDecisionIdRouteChildren = {
  AppBuilderCasesCaseIdDDecisionIdScreeningsRoute: AppBuilderCasesCaseIdDDecisionIdScreeningsRouteWithChildren
};
const AppBuilderCasesCaseIdDDecisionIdRouteWithChildren = AppBuilderCasesCaseIdDDecisionIdRoute._addFileChildren(
  AppBuilderCasesCaseIdDDecisionIdRouteChildren
);
const AppBuilderCasesCaseIdDRouteChildren = {
  AppBuilderCasesCaseIdDDecisionIdRoute: AppBuilderCasesCaseIdDDecisionIdRouteWithChildren
};
const AppBuilderCasesCaseIdDRouteWithChildren = AppBuilderCasesCaseIdDRoute._addFileChildren(
  AppBuilderCasesCaseIdDRouteChildren
);
const AppBuilderCasesCaseIdRouteChildren = {
  AppBuilderCasesCaseIdDRoute: AppBuilderCasesCaseIdDRouteWithChildren,
  AppBuilderCasesCaseIdIndexRoute
};
const AppBuilderCasesCaseIdRouteWithChildren = AppBuilderCasesCaseIdRoute._addFileChildren(
  AppBuilderCasesCaseIdRouteChildren
);
const AppBuilderCasesDetailSCaseIdNewClientsRouteChildren = {
  AppBuilderCasesDetailSCaseIdNewClientsPivotValueRoute,
  AppBuilderCasesDetailSCaseIdNewClientsIndexRoute
};
const AppBuilderCasesDetailSCaseIdNewClientsRouteWithChildren = AppBuilderCasesDetailSCaseIdNewClientsRoute._addFileChildren(
  AppBuilderCasesDetailSCaseIdNewClientsRouteChildren
);
const AppBuilderCasesDetailSCaseIdNewRouteChildren = {
  AppBuilderCasesDetailSCaseIdNewClientsRoute: AppBuilderCasesDetailSCaseIdNewClientsRouteWithChildren,
  AppBuilderCasesDetailSCaseIdNewPrincipalRoute,
  AppBuilderCasesDetailSCaseIdNewIndexRoute
};
const AppBuilderCasesDetailSCaseIdNewRouteWithChildren = AppBuilderCasesDetailSCaseIdNewRoute._addFileChildren(
  AppBuilderCasesDetailSCaseIdNewRouteChildren
);
const AppBuilderCasesDetailRouteChildren = {
  AppBuilderCasesDetailMCaseIdRoute,
  AppBuilderCasesDetailSCaseIdNewRoute: AppBuilderCasesDetailSCaseIdNewRouteWithChildren,
  AppBuilderCasesDetailSCaseIdOldRoute
};
const AppBuilderCasesDetailRouteWithChildren = AppBuilderCasesDetailRoute._addFileChildren(
  AppBuilderCasesDetailRouteChildren
);
const AppBuilderCasesInboxesRouteChildren = {
  AppBuilderCasesInboxesInboxIdRoute,
  AppBuilderCasesInboxesIndexRoute
};
const AppBuilderCasesInboxesRouteWithChildren = AppBuilderCasesInboxesRoute._addFileChildren(
  AppBuilderCasesInboxesRouteChildren
);
const AppBuilderCasesRouteChildren = {
  AppBuilderCasesCaseIdRoute: AppBuilderCasesCaseIdRouteWithChildren,
  AppBuilderCasesDetailRoute: AppBuilderCasesDetailRouteWithChildren,
  AppBuilderCasesAnalyticsRoute,
  AppBuilderCasesInboxesRoute: AppBuilderCasesInboxesRouteWithChildren,
  AppBuilderCasesOverviewRoute,
  AppBuilderCasesIndexRoute
};
const AppBuilderCasesRouteWithChildren = AppBuilderCasesRoute._addFileChildren(
  AppBuilderCasesRouteChildren
);
const AppBuilderContinuousScreeningRouteChildren = {
  AppBuilderContinuousScreeningConfigurationsRoute,
  AppBuilderContinuousScreeningIndexRoute,
  AppBuilderContinuousScreeningCreateIndexRoute
};
const AppBuilderContinuousScreeningRouteWithChildren = AppBuilderContinuousScreeningRoute._addFileChildren(
  AppBuilderContinuousScreeningRouteChildren
);
const AppBuilderDataRouteChildren = {
  AppBuilderDataListRoute,
  AppBuilderDataIndexRoute
};
const AppBuilderDataRouteWithChildren = AppBuilderDataRoute._addFileChildren(
  AppBuilderDataRouteChildren
);
const AppBuilderDetectionAnalyticsRouteChildren = {
  AppBuilderDetectionAnalyticsScenarioIdRoute,
  AppBuilderDetectionAnalyticsIndexRoute
};
const AppBuilderDetectionAnalyticsRouteWithChildren = AppBuilderDetectionAnalyticsRoute._addFileChildren(
  AppBuilderDetectionAnalyticsRouteChildren
);
const AppBuilderDetectionDecisionsRouteChildren = {
  AppBuilderDetectionDecisionsDecisionIdRoute,
  AppBuilderDetectionDecisionsIndexRoute
};
const AppBuilderDetectionDecisionsRouteWithChildren = AppBuilderDetectionDecisionsRoute._addFileChildren(
  AppBuilderDetectionDecisionsRouteChildren
);
const AppBuilderDetectionListsRouteChildren = {
  AppBuilderDetectionListsListIdRoute,
  AppBuilderDetectionListsIndexRoute
};
const AppBuilderDetectionListsRouteWithChildren = AppBuilderDetectionListsRoute._addFileChildren(
  AppBuilderDetectionListsRouteChildren
);
const AppBuilderDetectionScenariosScenarioIdTestRunRouteChildren = {
  AppBuilderDetectionScenariosScenarioIdTestRunIndexRoute,
  AppBuilderDetectionScenariosScenarioIdTestRunTestRunIdIndexRoute
};
const AppBuilderDetectionScenariosScenarioIdTestRunRouteWithChildren = AppBuilderDetectionScenariosScenarioIdTestRunRoute._addFileChildren(
  AppBuilderDetectionScenariosScenarioIdTestRunRouteChildren
);
const AppBuilderDetectionScenariosScenarioIdIIterationIdEditViewRouteChildren = {
  AppBuilderDetectionScenariosScenarioIdIIterationIdEditViewDecisionRoute,
  AppBuilderDetectionScenariosScenarioIdIIterationIdEditViewRulesRoute,
  AppBuilderDetectionScenariosScenarioIdIIterationIdEditViewTriggerRoute,
  AppBuilderDetectionScenariosScenarioIdIIterationIdEditViewIndexRoute
};
const AppBuilderDetectionScenariosScenarioIdIIterationIdEditViewRouteWithChildren = AppBuilderDetectionScenariosScenarioIdIIterationIdEditViewRoute._addFileChildren(
  AppBuilderDetectionScenariosScenarioIdIIterationIdEditViewRouteChildren
);
const AppBuilderDetectionScenariosScenarioIdIIterationIdRouteChildren = {
  AppBuilderDetectionScenariosScenarioIdIIterationIdEditViewRoute: AppBuilderDetectionScenariosScenarioIdIIterationIdEditViewRouteWithChildren
};
const AppBuilderDetectionScenariosScenarioIdIIterationIdRouteWithChildren = AppBuilderDetectionScenariosScenarioIdIIterationIdRoute._addFileChildren(
  AppBuilderDetectionScenariosScenarioIdIIterationIdRouteChildren
);
const AppBuilderDetectionScenariosScenarioIdRouteChildren = {
  AppBuilderDetectionScenariosScenarioIdHomeRoute,
  AppBuilderDetectionScenariosScenarioIdScheduledExecutionsRoute,
  AppBuilderDetectionScenariosScenarioIdTestRunRoute: AppBuilderDetectionScenariosScenarioIdTestRunRouteWithChildren,
  AppBuilderDetectionScenariosScenarioIdWorkflowRoute,
  AppBuilderDetectionScenariosScenarioIdIndexRoute,
  AppBuilderDetectionScenariosScenarioIdIIterationIdRoute: AppBuilderDetectionScenariosScenarioIdIIterationIdRouteWithChildren
};
const AppBuilderDetectionScenariosScenarioIdRouteWithChildren = AppBuilderDetectionScenariosScenarioIdRoute._addFileChildren(
  AppBuilderDetectionScenariosScenarioIdRouteChildren
);
const AppBuilderDetectionScenariosRouteChildren = {
  AppBuilderDetectionScenariosScenarioIdRoute: AppBuilderDetectionScenariosScenarioIdRouteWithChildren,
  AppBuilderDetectionScenariosIndexRoute
};
const AppBuilderDetectionScenariosRouteWithChildren = AppBuilderDetectionScenariosRoute._addFileChildren(
  AppBuilderDetectionScenariosRouteChildren
);
const AppBuilderDetectionRouteChildren = {
  AppBuilderDetectionAnalyticsRoute: AppBuilderDetectionAnalyticsRouteWithChildren,
  AppBuilderDetectionDecisionsRoute: AppBuilderDetectionDecisionsRouteWithChildren,
  AppBuilderDetectionListsRoute: AppBuilderDetectionListsRouteWithChildren,
  AppBuilderDetectionScenariosRoute: AppBuilderDetectionScenariosRouteWithChildren,
  AppBuilderDetectionIndexRoute
};
const AppBuilderDetectionRouteWithChildren = AppBuilderDetectionRoute._addFileChildren(AppBuilderDetectionRouteChildren);
const AppBuilderScreeningSearchRouteChildren = {
  AppBuilderScreeningSearchIndexRoute
};
const AppBuilderScreeningSearchRouteWithChildren = AppBuilderScreeningSearchRoute._addFileChildren(
  AppBuilderScreeningSearchRouteChildren
);
const AppBuilderSettingsAnalyticsRouteChildren = {
  AppBuilderSettingsAnalyticsFiltersRoute
};
const AppBuilderSettingsAnalyticsRouteWithChildren = AppBuilderSettingsAnalyticsRoute._addFileChildren(
  AppBuilderSettingsAnalyticsRouteChildren
);
const AppBuilderSettingsInboxesRouteChildren = {
  AppBuilderSettingsInboxesInboxIdRoute,
  AppBuilderSettingsInboxesIndexRoute
};
const AppBuilderSettingsInboxesRouteWithChildren = AppBuilderSettingsInboxesRoute._addFileChildren(
  AppBuilderSettingsInboxesRouteChildren
);
const AppBuilderSettingsRouteChildren = {
  AppBuilderSettingsAnalyticsRoute: AppBuilderSettingsAnalyticsRouteWithChildren,
  AppBuilderSettingsApiKeysRoute,
  AppBuilderSettingsAuditLogsRoute,
  AppBuilderSettingsInboxesRoute: AppBuilderSettingsInboxesRouteWithChildren,
  AppBuilderSettingsIpWhitelistingRoute,
  AppBuilderSettingsScenariosRoute,
  AppBuilderSettingsScreeningProvidersRoute,
  AppBuilderSettingsTagsRoute,
  AppBuilderSettingsUsersRoute,
  AppBuilderSettingsWebhooksRoute,
  AppBuilderSettingsIndexRoute,
  AppBuilderSettingsWebhooksWebhookIdRoute
};
const AppBuilderSettingsRouteWithChildren = AppBuilderSettingsRoute._addFileChildren(AppBuilderSettingsRouteChildren);
const AppBuilderUserScoringRouteChildren = {
  AppBuilderUserScoringOverviewRoute,
  AppBuilderUserScoringIndexRoute,
  AppBuilderUserScoringRecordTypeVersionRoute
};
const AppBuilderUserScoringRouteWithChildren = AppBuilderUserScoringRoute._addFileChildren(
  AppBuilderUserScoringRouteChildren
);
const AppBuilderRouteChildren = {
  AppBuilderAccountRoute,
  AppBuilderAnalyticsLegacyRoute,
  AppBuilderCasesRoute: AppBuilderCasesRouteWithChildren,
  AppBuilderContinuousScreeningRoute: AppBuilderContinuousScreeningRouteWithChildren,
  AppBuilderDataRoute: AppBuilderDataRouteWithChildren,
  AppBuilderDetectionRoute: AppBuilderDetectionRouteWithChildren,
  AppBuilderScreeningSearchRoute: AppBuilderScreeningSearchRouteWithChildren,
  AppBuilderSettingsRoute: AppBuilderSettingsRouteWithChildren,
  AppBuilderUserScoringRoute: AppBuilderUserScoringRouteWithChildren,
  AppBuilderUploadObjectTypeRoute,
  AppBuilderClientDetailIndexRoute,
  AppBuilderClientDetailObjectTypeObjectIdRoute
};
const AppBuilderRouteWithChildren = AppBuilderRoute._addFileChildren(
  AppBuilderRouteChildren
);
const AppRouteChildren = {
  AppAuthRoute: AppAuthRouteWithChildren,
  AppBuilderRoute: AppBuilderRouteWithChildren
};
const AppRouteWithChildren = AppRoute._addFileChildren(AppRouteChildren);
const rootRouteChildren = {
  IndexRoute,
  SplatRoute,
  AppRoute: AppRouteWithChildren,
  AppRouterRoute,
  HealthcheckRoute,
  OidcAuthRoute,
  OidcCallbackRoute,
  RessourcesLocalesRoute,
  RobotsTxtRoute,
  RessourcesDataExportOrgRoute,
  RessourcesCasesDownloadDataCaseIdRoute,
  RessourcesCasesDownloadFileFileIdRoute,
  RessourcesCasesNextUnassignedCaseIdRoute,
  RessourcesListsDownloadCsvFileListIdRoute,
  RessourcesAnnotationsDownloadFileAnnotationIdFileIdRoute,
  RessourcesScreeningsDownloadScreeningIdFileIdRoute,
  RessourcesCasesSarDownloadCaseIdReportIdRoute
};
const routeTree = Route$1K._addFileChildren(rootRouteChildren)._addFileTypes();
const getNonce = () => getRequestNonce();
const routerI18n = instance.createInstance();
routerI18n.use(initReactI18next).use(resourcesToBackend((language, namespace) => __variableDynamicImportRuntimeHelper(/* @__PURE__ */ Object.assign({ "./locales/ar/account.json": () => import("./services-middleware-DR8Hua1Y.js").then((n2) => n2.dC), "./locales/ar/analytics.json": () => import("./services-middleware-DR8Hua1Y.js").then((n2) => n2.dD), "./locales/ar/api.json": () => import("./services-middleware-DR8Hua1Y.js").then((n2) => n2.dE), "./locales/ar/auth.json": () => import("./services-middleware-DR8Hua1Y.js").then((n2) => n2.dF), "./locales/ar/cases.json": () => import("./services-middleware-DR8Hua1Y.js").then((n2) => n2.dG), "./locales/ar/client360.json": () => import("./services-middleware-DR8Hua1Y.js").then((n2) => n2.dH), "./locales/ar/common.json": () => import("./services-middleware-DR8Hua1Y.js").then((n2) => n2.dI), "./locales/ar/continuous-screening.json": () => import("./services-middleware-DR8Hua1Y.js").then((n2) => n2.dJ), "./locales/ar/data.json": () => import("./services-middleware-DR8Hua1Y.js").then((n2) => n2.dK), "./locales/ar/decisions.json": () => import("./services-middleware-DR8Hua1Y.js").then((n2) => n2.dL), "./locales/ar/filters.json": () => import("./services-middleware-DR8Hua1Y.js").then((n2) => n2.dM), "./locales/ar/lists.json": () => import("./services-middleware-DR8Hua1Y.js").then((n2) => n2.dN), "./locales/ar/navigation.json": () => import("./services-middleware-DR8Hua1Y.js").then((n2) => n2.dO), "./locales/ar/scenarios.json": () => import("./services-middleware-DR8Hua1Y.js").then((n2) => n2.dP), "./locales/ar/screening-topics.json": () => import("./services-middleware-DR8Hua1Y.js").then((n2) => n2.dQ), "./locales/ar/screenings.json": () => import("./services-middleware-DR8Hua1Y.js").then((n2) => n2.dR), "./locales/ar/settings.json": () => import("./services-middleware-DR8Hua1Y.js").then((n2) => n2.dS), "./locales/ar/upload.json": () => import("./services-middleware-DR8Hua1Y.js").then((n2) => n2.dT), "./locales/ar/user-scoring.json": () => import("./services-middleware-DR8Hua1Y.js").then((n2) => n2.dU), "./locales/ar/workflows.json": () => import("./services-middleware-DR8Hua1Y.js").then((n2) => n2.dV), "./locales/en/account.json": () => import("./services-middleware-DR8Hua1Y.js").then((n2) => n2.dW), "./locales/en/analytics.json": () => import("./services-middleware-DR8Hua1Y.js").then((n2) => n2.dX), "./locales/en/api.json": () => import("./services-middleware-DR8Hua1Y.js").then((n2) => n2.dY), "./locales/en/auth.json": () => import("./services-middleware-DR8Hua1Y.js").then((n2) => n2.dZ), "./locales/en/cases.json": () => import("./services-middleware-DR8Hua1Y.js").then((n2) => n2.d_), "./locales/en/client360.json": () => import("./services-middleware-DR8Hua1Y.js").then((n2) => n2.d$), "./locales/en/common.json": () => import("./services-middleware-DR8Hua1Y.js").then((n2) => n2.e0), "./locales/en/continuous-screening.json": () => import("./services-middleware-DR8Hua1Y.js").then((n2) => n2.e1), "./locales/en/data.json": () => import("./services-middleware-DR8Hua1Y.js").then((n2) => n2.e2), "./locales/en/decisions.json": () => import("./services-middleware-DR8Hua1Y.js").then((n2) => n2.e3), "./locales/en/filters.json": () => import("./services-middleware-DR8Hua1Y.js").then((n2) => n2.e4), "./locales/en/lists.json": () => import("./services-middleware-DR8Hua1Y.js").then((n2) => n2.e5), "./locales/en/navigation.json": () => import("./services-middleware-DR8Hua1Y.js").then((n2) => n2.e6), "./locales/en/scenarios.json": () => import("./services-middleware-DR8Hua1Y.js").then((n2) => n2.e7), "./locales/en/screening-topics.json": () => import("./services-middleware-DR8Hua1Y.js").then((n2) => n2.e8), "./locales/en/screenings.json": () => import("./services-middleware-DR8Hua1Y.js").then((n2) => n2.e9), "./locales/en/settings.json": () => import("./services-middleware-DR8Hua1Y.js").then((n2) => n2.ea), "./locales/en/upload.json": () => import("./services-middleware-DR8Hua1Y.js").then((n2) => n2.eb), "./locales/en/user-scoring.json": () => import("./services-middleware-DR8Hua1Y.js").then((n2) => n2.ec), "./locales/en/workflows.json": () => import("./services-middleware-DR8Hua1Y.js").then((n2) => n2.ed), "./locales/fr/account.json": () => import("./services-middleware-DR8Hua1Y.js").then((n2) => n2.ee), "./locales/fr/analytics.json": () => import("./services-middleware-DR8Hua1Y.js").then((n2) => n2.ef), "./locales/fr/api.json": () => import("./services-middleware-DR8Hua1Y.js").then((n2) => n2.eg), "./locales/fr/auth.json": () => import("./services-middleware-DR8Hua1Y.js").then((n2) => n2.eh), "./locales/fr/cases.json": () => import("./services-middleware-DR8Hua1Y.js").then((n2) => n2.ei), "./locales/fr/client360.json": () => import("./services-middleware-DR8Hua1Y.js").then((n2) => n2.ej), "./locales/fr/common.json": () => import("./services-middleware-DR8Hua1Y.js").then((n2) => n2.ek), "./locales/fr/continuous-screening.json": () => import("./services-middleware-DR8Hua1Y.js").then((n2) => n2.el), "./locales/fr/data.json": () => import("./services-middleware-DR8Hua1Y.js").then((n2) => n2.em), "./locales/fr/decisions.json": () => import("./services-middleware-DR8Hua1Y.js").then((n2) => n2.en), "./locales/fr/filters.json": () => import("./services-middleware-DR8Hua1Y.js").then((n2) => n2.eo), "./locales/fr/lists.json": () => import("./services-middleware-DR8Hua1Y.js").then((n2) => n2.ep), "./locales/fr/navigation.json": () => import("./services-middleware-DR8Hua1Y.js").then((n2) => n2.eq), "./locales/fr/scenarios.json": () => import("./services-middleware-DR8Hua1Y.js").then((n2) => n2.er), "./locales/fr/screening-topics.json": () => import("./services-middleware-DR8Hua1Y.js").then((n2) => n2.es), "./locales/fr/screenings.json": () => import("./services-middleware-DR8Hua1Y.js").then((n2) => n2.et), "./locales/fr/settings.json": () => import("./services-middleware-DR8Hua1Y.js").then((n2) => n2.eu), "./locales/fr/upload.json": () => import("./services-middleware-DR8Hua1Y.js").then((n2) => n2.ev), "./locales/fr/user-scoring.json": () => import("./services-middleware-DR8Hua1Y.js").then((n2) => n2.ew), "./locales/fr/workflows.json": () => import("./services-middleware-DR8Hua1Y.js").then((n2) => n2.ex) }), `./locales/${language}/${namespace}.json`, 4))).init({
  lng: "en",
  fallbackLng: "en",
  ns: ALL_NAMESPACES
});
function getRouter() {
  const rqContext = getContext();
  const router2 = createRouter({
    routeTree,
    context: {
      ...rqContext,
      i18n: routerI18n
    },
    scrollRestoration: true,
    // Start route loaders on hover/focus so data is usually ready by click time,
    // hiding loader RPC latency behind the intent-to-click gap.
    defaultPreload: "intent",
    ssr: {
      nonce: getNonce()
    },
    Wrap: (props) => {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(I18nextProvider, { i18n: routerI18n, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Provider, { ...rqContext, children: props.children }) });
    }
  });
  setupRouterSsrQueryIntegration({
    router: router2,
    queryClient: rqContext.queryClient
  });
  router2.serverSsr?.onCleanup(() => {
    rqContext.queryClient.clear();
  });
  return router2;
}
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  updateScenarioFn as $,
  AgnosticNavigationContext as A,
  BreadCrumbs as B,
  Route$12 as C,
  Route$11 as D,
  ErrorComponent as E,
  Route$10 as F,
  Route$_ as G,
  Highlight as H,
  DEFAULT_LIMIT as I,
  Route$Z as J,
  Route$V as K,
  Link as L,
  handle as M,
  useAgnosticNavigation as N,
  Route$S as O,
  Page as P,
  CaseStatusBadgeV2 as Q,
  Route$1A as R,
  Route$R as S,
  Route$P as T,
  Route$M as U,
  archiveScenarioFn as V,
  copyScenarioFn as W,
  createScenarioFn as X,
  unarchiveScenarioFn as Y,
  Route$L as Z,
  getFormattedVersion as _,
  authI18n as a,
  deleteRuleFn as a$,
  Route$K as a0,
  decisionsI18n as a1,
  e as a2,
  Route$J as a3,
  buildQueryParams as a4,
  Route$H as a5,
  buildPayloadAccessorsFromDataModel as a6,
  buildDatabaseAccessorsFromDataModel as a7,
  Route$C as a8,
  validateAstFn as a9,
  Route$i as aA,
  Route$h as aB,
  CaseStatusBadge as aC,
  getIterationRulesFn as aD,
  Route$g as aE,
  defaultSerializeError as aF,
  reactUse as aG,
  cancelTestRunFn as aH,
  Route$e as aI,
  deactivateIterationFn as aJ,
  activateIterationFn as aK,
  commitIterationFn as aL,
  prepareIterationFn as aM,
  getPublicationPreparationStatusFn as aN,
  getRuleSnoozeFn as aO,
  useDetectionScenarioIterationData as aP,
  Route$c as aQ,
  VersionSelect as aR,
  Route$b as aS,
  Route$a as aT,
  Route$9 as aU,
  saveTriggerFn as aV,
  Route$5 as aW,
  createScreeningRuleFn as aX,
  getIterationRuleFn as aY,
  createRuleFn as aZ,
  getRuleDescriptionFn as a_,
  getBuilderOptionsFn as aa,
  scenarioI18n as ab,
  Route$B as ac,
  Route$A as ad,
  Route$z as ae,
  Route$x as af,
  ScreeningStatusTag as ag,
  Route$w as ah,
  generateFlatEvaluation as ai,
  Route$v as aj,
  BackButton as ak,
  Route$u as al,
  Route$t as am,
  Route$p as an,
  Route$n as ao,
  Route$m as ap,
  useDetectionScenarioData as aq,
  createTestRunFn as ar,
  createDraftIterationFn as as,
  TriggerObjectTag as at,
  Route$l as au,
  casesI18n as av,
  Route$j as aw,
  getFormattedArchived as ax,
  getFormattedLive as ay,
  ScenarioIterationMenu as az,
  useNavigate as b,
  duplicateRuleFn as b0,
  generateAstFn as b1,
  deleteScreeningRuleFn as b2,
  Route$4 as b3,
  useDerivedIterationRuleGroupsData as b4,
  Route$3 as b5,
  Route$2 as b6,
  dataI18n as b7,
  Route2 as b8,
  router as b9,
  Route$1x as c,
  Route$1w as d,
  Route$1t as e,
  Route$1r as f,
  getDefaultState as g,
  Route$1q as h,
  AppConfigContext as i,
  useBuilderLayoutData as j,
  Route$1o as k,
  Route$1n as l,
  Route$1l as m,
  Route$1h as n,
  filtersI18n as o,
  pageLayoutGutter as p,
  clientDetailLinkParams as q,
  Route$1d as r,
  screeningsI18n as s,
  useLoaderData as t,
  useLocation as u,
  Route$16 as v,
  matchSorter as w,
  Route$15 as x,
  Route$14 as y,
  Route$13 as z
};
