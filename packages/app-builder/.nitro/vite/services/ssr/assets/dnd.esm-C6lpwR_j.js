import { a7 as requireReact, r as reactExports, S as React } from "../server.js";
import { eq as ReactDOM, dX as reactDomExports } from "./format-NPGUXq-g.js";
import { i as invariant$1 } from "./short-uuid-MIi3jWzx.js";
function formatProdErrorMessage(code) {
  return `Minified Redux error #${code}; visit https://redux.js.org/Errors?code=${code} for the full message or use the non-minified dev environment for full errors. `;
}
var $$observable = /* @__PURE__ */ (() => typeof Symbol === "function" && Symbol.observable || "@@observable")();
var symbol_observable_default = $$observable;
var randomString = () => Math.random().toString(36).substring(7).split("").join(".");
var ActionTypes = {
  INIT: `@@redux/INIT${/* @__PURE__ */ randomString()}`,
  REPLACE: `@@redux/REPLACE${/* @__PURE__ */ randomString()}`
};
var actionTypes_default = ActionTypes;
function isPlainObject(obj) {
  if (typeof obj !== "object" || obj === null)
    return false;
  let proto = obj;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }
  return Object.getPrototypeOf(obj) === proto || Object.getPrototypeOf(obj) === null;
}
function createStore$1(reducer2, preloadedState, enhancer) {
  if (typeof reducer2 !== "function") {
    throw new Error(formatProdErrorMessage(2));
  }
  if (typeof preloadedState === "function" && typeof enhancer === "function" || typeof enhancer === "function" && typeof arguments[3] === "function") {
    throw new Error(formatProdErrorMessage(0));
  }
  if (typeof preloadedState === "function" && typeof enhancer === "undefined") {
    enhancer = preloadedState;
    preloadedState = void 0;
  }
  if (typeof enhancer !== "undefined") {
    if (typeof enhancer !== "function") {
      throw new Error(formatProdErrorMessage(1));
    }
    return enhancer(createStore$1)(reducer2, preloadedState);
  }
  let currentReducer = reducer2;
  let currentState = preloadedState;
  let currentListeners = /* @__PURE__ */ new Map();
  let nextListeners = currentListeners;
  let listenerIdCounter = 0;
  let isDispatching = false;
  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = /* @__PURE__ */ new Map();
      currentListeners.forEach((listener, key) => {
        nextListeners.set(key, listener);
      });
    }
  }
  function getState() {
    if (isDispatching) {
      throw new Error(formatProdErrorMessage(3));
    }
    return currentState;
  }
  function subscribe(listener) {
    if (typeof listener !== "function") {
      throw new Error(formatProdErrorMessage(4));
    }
    if (isDispatching) {
      throw new Error(formatProdErrorMessage(5));
    }
    let isSubscribed = true;
    ensureCanMutateNextListeners();
    const listenerId = listenerIdCounter++;
    nextListeners.set(listenerId, listener);
    return function unsubscribe() {
      if (!isSubscribed) {
        return;
      }
      if (isDispatching) {
        throw new Error(formatProdErrorMessage(6));
      }
      isSubscribed = false;
      ensureCanMutateNextListeners();
      nextListeners.delete(listenerId);
      currentListeners = null;
    };
  }
  function dispatch(action) {
    if (!isPlainObject(action)) {
      throw new Error(formatProdErrorMessage(7));
    }
    if (typeof action.type === "undefined") {
      throw new Error(formatProdErrorMessage(8));
    }
    if (typeof action.type !== "string") {
      throw new Error(formatProdErrorMessage(17));
    }
    if (isDispatching) {
      throw new Error(formatProdErrorMessage(9));
    }
    try {
      isDispatching = true;
      currentState = currentReducer(currentState, action);
    } finally {
      isDispatching = false;
    }
    const listeners = currentListeners = nextListeners;
    listeners.forEach((listener) => {
      listener();
    });
    return action;
  }
  function replaceReducer(nextReducer) {
    if (typeof nextReducer !== "function") {
      throw new Error(formatProdErrorMessage(10));
    }
    currentReducer = nextReducer;
    dispatch({
      type: actionTypes_default.REPLACE
    });
  }
  function observable() {
    const outerSubscribe = subscribe;
    return {
      /**
       * The minimal observable subscription method.
       * @param observer Any object that can be used as an observer.
       * The observer object should have a `next` method.
       * @returns An object with an `unsubscribe` method that can
       * be used to unsubscribe the observable from the store, and prevent further
       * emission of values from the observable.
       */
      subscribe(observer) {
        if (typeof observer !== "object" || observer === null) {
          throw new Error(formatProdErrorMessage(11));
        }
        function observeState() {
          const observerAsObserver = observer;
          if (observerAsObserver.next) {
            observerAsObserver.next(getState());
          }
        }
        observeState();
        const unsubscribe = outerSubscribe(observeState);
        return {
          unsubscribe
        };
      },
      [symbol_observable_default]() {
        return this;
      }
    };
  }
  dispatch({
    type: actionTypes_default.INIT
  });
  const store = {
    dispatch,
    subscribe,
    getState,
    replaceReducer,
    [symbol_observable_default]: observable
  };
  return store;
}
function bindActionCreator(actionCreator, dispatch) {
  return function(...args) {
    return dispatch(actionCreator.apply(this, args));
  };
}
function bindActionCreators$1(actionCreators, dispatch) {
  if (typeof actionCreators === "function") {
    return bindActionCreator(actionCreators, dispatch);
  }
  if (typeof actionCreators !== "object" || actionCreators === null) {
    throw new Error(formatProdErrorMessage(16));
  }
  const boundActionCreators = {};
  for (const key in actionCreators) {
    const actionCreator = actionCreators[key];
    if (typeof actionCreator === "function") {
      boundActionCreators[key] = bindActionCreator(actionCreator, dispatch);
    }
  }
  return boundActionCreators;
}
function compose(...funcs) {
  if (funcs.length === 0) {
    return (arg) => arg;
  }
  if (funcs.length === 1) {
    return funcs[0];
  }
  return funcs.reduce((a, b) => (...args) => a(b(...args)));
}
function applyMiddleware(...middlewares) {
  return (createStore2) => (reducer2, preloadedState) => {
    const store = createStore2(reducer2, preloadedState);
    let dispatch = () => {
      throw new Error(formatProdErrorMessage(15));
    };
    const middlewareAPI = {
      getState: store.getState,
      dispatch: (action, ...args) => dispatch(action, ...args)
    };
    const chain = middlewares.map((middleware) => middleware(middlewareAPI));
    dispatch = compose(...chain)(store.dispatch);
    return {
      ...store,
      dispatch
    };
  };
}
var withSelector = { exports: {} };
var useSyncExternalStoreWithSelector_production = {};
var hasRequiredUseSyncExternalStoreWithSelector_production;
function requireUseSyncExternalStoreWithSelector_production() {
  if (hasRequiredUseSyncExternalStoreWithSelector_production) return useSyncExternalStoreWithSelector_production;
  hasRequiredUseSyncExternalStoreWithSelector_production = 1;
  var React2 = requireReact();
  function is2(x, y) {
    return x === y && (0 !== x || 1 / x === 1 / y) || x !== x && y !== y;
  }
  var objectIs = "function" === typeof Object.is ? Object.is : is2, useSyncExternalStore = React2.useSyncExternalStore, useRef = React2.useRef, useEffect = React2.useEffect, useMemo2 = React2.useMemo, useDebugValue = React2.useDebugValue;
  useSyncExternalStoreWithSelector_production.useSyncExternalStoreWithSelector = function(subscribe, getSnapshot, getServerSnapshot, selector, isEqual2) {
    var instRef = useRef(null);
    if (null === instRef.current) {
      var inst = { hasValue: false, value: null };
      instRef.current = inst;
    } else inst = instRef.current;
    instRef = useMemo2(
      function() {
        function memoizedSelector(nextSnapshot) {
          if (!hasMemo) {
            hasMemo = true;
            memoizedSnapshot = nextSnapshot;
            nextSnapshot = selector(nextSnapshot);
            if (void 0 !== isEqual2 && inst.hasValue) {
              var currentSelection = inst.value;
              if (isEqual2(currentSelection, nextSnapshot))
                return memoizedSelection = currentSelection;
            }
            return memoizedSelection = nextSnapshot;
          }
          currentSelection = memoizedSelection;
          if (objectIs(memoizedSnapshot, nextSnapshot)) return currentSelection;
          var nextSelection = selector(nextSnapshot);
          if (void 0 !== isEqual2 && isEqual2(currentSelection, nextSelection))
            return memoizedSnapshot = nextSnapshot, currentSelection;
          memoizedSnapshot = nextSnapshot;
          return memoizedSelection = nextSelection;
        }
        var hasMemo = false, memoizedSnapshot, memoizedSelection, maybeGetServerSnapshot = void 0 === getServerSnapshot ? null : getServerSnapshot;
        return [
          function() {
            return memoizedSelector(getSnapshot());
          },
          null === maybeGetServerSnapshot ? void 0 : function() {
            return memoizedSelector(maybeGetServerSnapshot());
          }
        ];
      },
      [getSnapshot, getServerSnapshot, selector, isEqual2]
    );
    var value = useSyncExternalStore(subscribe, instRef[0], instRef[1]);
    useEffect(
      function() {
        inst.hasValue = true;
        inst.value = value;
      },
      [value]
    );
    useDebugValue(value);
    return value;
  };
  return useSyncExternalStoreWithSelector_production;
}
var hasRequiredWithSelector;
function requireWithSelector() {
  if (hasRequiredWithSelector) return withSelector.exports;
  hasRequiredWithSelector = 1;
  {
    withSelector.exports = requireUseSyncExternalStoreWithSelector_production();
  }
  return withSelector.exports;
}
requireWithSelector();
var IS_REACT_19 = /* @__PURE__ */ reactExports.version.startsWith("19");
var REACT_ELEMENT_TYPE = /* @__PURE__ */ Symbol.for(
  IS_REACT_19 ? "react.transitional.element" : "react.element"
);
var REACT_PORTAL_TYPE = /* @__PURE__ */ Symbol.for("react.portal");
var REACT_FRAGMENT_TYPE = /* @__PURE__ */ Symbol.for("react.fragment");
var REACT_STRICT_MODE_TYPE = /* @__PURE__ */ Symbol.for("react.strict_mode");
var REACT_PROFILER_TYPE = /* @__PURE__ */ Symbol.for("react.profiler");
var REACT_CONSUMER_TYPE = /* @__PURE__ */ Symbol.for("react.consumer");
var REACT_CONTEXT_TYPE = /* @__PURE__ */ Symbol.for("react.context");
var REACT_FORWARD_REF_TYPE = /* @__PURE__ */ Symbol.for("react.forward_ref");
var REACT_SUSPENSE_TYPE = /* @__PURE__ */ Symbol.for("react.suspense");
var REACT_SUSPENSE_LIST_TYPE = /* @__PURE__ */ Symbol.for(
  "react.suspense_list"
);
var REACT_MEMO_TYPE = /* @__PURE__ */ Symbol.for("react.memo");
var REACT_LAZY_TYPE = /* @__PURE__ */ Symbol.for("react.lazy");
var ForwardRef = REACT_FORWARD_REF_TYPE;
var Memo = REACT_MEMO_TYPE;
function typeOf(object) {
  if (typeof object === "object" && object !== null) {
    const { $$typeof } = object;
    switch ($$typeof) {
      case REACT_ELEMENT_TYPE:
        switch (object = object.type, object) {
          case REACT_FRAGMENT_TYPE:
          case REACT_PROFILER_TYPE:
          case REACT_STRICT_MODE_TYPE:
          case REACT_SUSPENSE_TYPE:
          case REACT_SUSPENSE_LIST_TYPE:
            return object;
          default:
            switch (object = object && object.$$typeof, object) {
              case REACT_CONTEXT_TYPE:
              case REACT_FORWARD_REF_TYPE:
              case REACT_LAZY_TYPE:
              case REACT_MEMO_TYPE:
                return object;
              case REACT_CONSUMER_TYPE:
                return object;
              default:
                return $$typeof;
            }
        }
      case REACT_PORTAL_TYPE:
        return $$typeof;
    }
  }
}
function isMemo(object) {
  return typeOf(object) === REACT_MEMO_TYPE;
}
function pureFinalPropsSelectorFactory(mapStateToProps, mapDispatchToProps2, mergeProps, dispatch, {
  areStatesEqual,
  areOwnPropsEqual,
  areStatePropsEqual
}) {
  let hasRunAtLeastOnce = false;
  let state;
  let ownProps;
  let stateProps;
  let dispatchProps;
  let mergedProps;
  function handleFirstCall(firstState, firstOwnProps) {
    state = firstState;
    ownProps = firstOwnProps;
    stateProps = mapStateToProps(state, ownProps);
    dispatchProps = mapDispatchToProps2(dispatch, ownProps);
    mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
    hasRunAtLeastOnce = true;
    return mergedProps;
  }
  function handleNewPropsAndNewState() {
    stateProps = mapStateToProps(state, ownProps);
    if (mapDispatchToProps2.dependsOnOwnProps)
      dispatchProps = mapDispatchToProps2(dispatch, ownProps);
    mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
    return mergedProps;
  }
  function handleNewProps() {
    if (mapStateToProps.dependsOnOwnProps)
      stateProps = mapStateToProps(state, ownProps);
    if (mapDispatchToProps2.dependsOnOwnProps)
      dispatchProps = mapDispatchToProps2(dispatch, ownProps);
    mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
    return mergedProps;
  }
  function handleNewState() {
    const nextStateProps = mapStateToProps(state, ownProps);
    const statePropsChanged = !areStatePropsEqual(nextStateProps, stateProps);
    stateProps = nextStateProps;
    if (statePropsChanged)
      mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
    return mergedProps;
  }
  function handleSubsequentCalls(nextState, nextOwnProps) {
    const propsChanged = !areOwnPropsEqual(nextOwnProps, ownProps);
    const stateChanged = !areStatesEqual(
      nextState,
      state,
      nextOwnProps,
      ownProps
    );
    state = nextState;
    ownProps = nextOwnProps;
    if (propsChanged && stateChanged) return handleNewPropsAndNewState();
    if (propsChanged) return handleNewProps();
    if (stateChanged) return handleNewState();
    return mergedProps;
  }
  return function pureFinalPropsSelector(nextState, nextOwnProps) {
    return hasRunAtLeastOnce ? handleSubsequentCalls(nextState, nextOwnProps) : handleFirstCall(nextState, nextOwnProps);
  };
}
function finalPropsSelectorFactory(dispatch, {
  initMapStateToProps,
  initMapDispatchToProps,
  initMergeProps,
  ...options
}) {
  const mapStateToProps = initMapStateToProps(dispatch, options);
  const mapDispatchToProps2 = initMapDispatchToProps(dispatch, options);
  const mergeProps = initMergeProps(dispatch, options);
  return pureFinalPropsSelectorFactory(mapStateToProps, mapDispatchToProps2, mergeProps, dispatch, options);
}
function bindActionCreators(actionCreators, dispatch) {
  const boundActionCreators = {};
  for (const key in actionCreators) {
    const actionCreator = actionCreators[key];
    if (typeof actionCreator === "function") {
      boundActionCreators[key] = (...args) => dispatch(actionCreator(...args));
    }
  }
  return boundActionCreators;
}
function wrapMapToPropsConstant(getConstant) {
  return function initConstantSelector(dispatch) {
    const constant = getConstant(dispatch);
    function constantSelector() {
      return constant;
    }
    constantSelector.dependsOnOwnProps = false;
    return constantSelector;
  };
}
function getDependsOnOwnProps(mapToProps) {
  return mapToProps.dependsOnOwnProps ? Boolean(mapToProps.dependsOnOwnProps) : mapToProps.length !== 1;
}
function wrapMapToPropsFunc(mapToProps, methodName) {
  return function initProxySelector(dispatch, { displayName }) {
    const proxy = function mapToPropsProxy(stateOrDispatch, ownProps) {
      return proxy.dependsOnOwnProps ? proxy.mapToProps(stateOrDispatch, ownProps) : proxy.mapToProps(stateOrDispatch, void 0);
    };
    proxy.dependsOnOwnProps = true;
    proxy.mapToProps = function detectFactoryAndVerify(stateOrDispatch, ownProps) {
      proxy.mapToProps = mapToProps;
      proxy.dependsOnOwnProps = getDependsOnOwnProps(mapToProps);
      let props = proxy(stateOrDispatch, ownProps);
      if (typeof props === "function") {
        proxy.mapToProps = props;
        proxy.dependsOnOwnProps = getDependsOnOwnProps(props);
        props = proxy(stateOrDispatch, ownProps);
      }
      return props;
    };
    return proxy;
  };
}
function createInvalidArgFactory(arg, name) {
  return (dispatch, options) => {
    throw new Error(
      `Invalid value of type ${typeof arg} for ${name} argument when connecting component ${options.wrappedComponentName}.`
    );
  };
}
function mapDispatchToPropsFactory(mapDispatchToProps2) {
  return mapDispatchToProps2 && typeof mapDispatchToProps2 === "object" ? wrapMapToPropsConstant(
    (dispatch) => (
      // @ts-ignore
      bindActionCreators(mapDispatchToProps2, dispatch)
    )
  ) : !mapDispatchToProps2 ? wrapMapToPropsConstant((dispatch) => ({
    dispatch
  })) : typeof mapDispatchToProps2 === "function" ? (
    // @ts-ignore
    wrapMapToPropsFunc(mapDispatchToProps2)
  ) : createInvalidArgFactory(mapDispatchToProps2, "mapDispatchToProps");
}
function mapStateToPropsFactory(mapStateToProps) {
  return !mapStateToProps ? wrapMapToPropsConstant(() => ({})) : typeof mapStateToProps === "function" ? (
    // @ts-ignore
    wrapMapToPropsFunc(mapStateToProps)
  ) : createInvalidArgFactory(mapStateToProps, "mapStateToProps");
}
function defaultMergeProps(stateProps, dispatchProps, ownProps) {
  return { ...ownProps, ...stateProps, ...dispatchProps };
}
function wrapMergePropsFunc(mergeProps) {
  return function initMergePropsProxy(dispatch, { displayName, areMergedPropsEqual }) {
    let hasRunOnce = false;
    let mergedProps;
    return function mergePropsProxy(stateProps, dispatchProps, ownProps) {
      const nextMergedProps = mergeProps(stateProps, dispatchProps, ownProps);
      if (hasRunOnce) {
        if (!areMergedPropsEqual(nextMergedProps, mergedProps))
          mergedProps = nextMergedProps;
      } else {
        hasRunOnce = true;
        mergedProps = nextMergedProps;
      }
      return mergedProps;
    };
  };
}
function mergePropsFactory(mergeProps) {
  return !mergeProps ? () => defaultMergeProps : typeof mergeProps === "function" ? wrapMergePropsFunc(mergeProps) : createInvalidArgFactory(mergeProps, "mergeProps");
}
function defaultNoopBatch(callback) {
  callback();
}
function createListenerCollection() {
  let first = null;
  let last = null;
  return {
    clear() {
      first = null;
      last = null;
    },
    notify() {
      defaultNoopBatch(() => {
        let listener = first;
        while (listener) {
          listener.callback();
          listener = listener.next;
        }
      });
    },
    get() {
      const listeners = [];
      let listener = first;
      while (listener) {
        listeners.push(listener);
        listener = listener.next;
      }
      return listeners;
    },
    subscribe(callback) {
      let isSubscribed = true;
      const listener = last = {
        callback,
        next: null,
        prev: last
      };
      if (listener.prev) {
        listener.prev.next = listener;
      } else {
        first = listener;
      }
      return function unsubscribe() {
        if (!isSubscribed || first === null) return;
        isSubscribed = false;
        if (listener.next) {
          listener.next.prev = listener.prev;
        } else {
          last = listener.prev;
        }
        if (listener.prev) {
          listener.prev.next = listener.next;
        } else {
          first = listener.next;
        }
      };
    }
  };
}
var nullListeners = {
  notify() {
  },
  get: () => []
};
function createSubscription(store, parentSub) {
  let unsubscribe;
  let listeners = nullListeners;
  let subscriptionsAmount = 0;
  let selfSubscribed = false;
  function addNestedSub(listener) {
    trySubscribe();
    const cleanupListener = listeners.subscribe(listener);
    let removed = false;
    return () => {
      if (!removed) {
        removed = true;
        cleanupListener();
        tryUnsubscribe();
      }
    };
  }
  function notifyNestedSubs() {
    listeners.notify();
  }
  function handleChangeWrapper() {
    if (subscription.onStateChange) {
      subscription.onStateChange();
    }
  }
  function isSubscribed() {
    return selfSubscribed;
  }
  function trySubscribe() {
    subscriptionsAmount++;
    if (!unsubscribe) {
      unsubscribe = parentSub ? parentSub.addNestedSub(handleChangeWrapper) : store.subscribe(handleChangeWrapper);
      listeners = createListenerCollection();
    }
  }
  function tryUnsubscribe() {
    subscriptionsAmount--;
    if (unsubscribe && subscriptionsAmount === 0) {
      unsubscribe();
      unsubscribe = void 0;
      listeners.clear();
      listeners = nullListeners;
    }
  }
  function trySubscribeSelf() {
    if (!selfSubscribed) {
      selfSubscribed = true;
      trySubscribe();
    }
  }
  function tryUnsubscribeSelf() {
    if (selfSubscribed) {
      selfSubscribed = false;
      tryUnsubscribe();
    }
  }
  const subscription = {
    addNestedSub,
    notifyNestedSubs,
    handleChangeWrapper,
    isSubscribed,
    trySubscribe: trySubscribeSelf,
    tryUnsubscribe: tryUnsubscribeSelf,
    getListeners: () => listeners
  };
  return subscription;
}
var canUseDOM = () => !!(typeof window !== "undefined" && typeof window.document !== "undefined" && typeof window.document.createElement !== "undefined");
var isDOM = /* @__PURE__ */ canUseDOM();
var isRunningInReactNative = () => typeof navigator !== "undefined" && navigator.product === "ReactNative";
var isReactNative = /* @__PURE__ */ isRunningInReactNative();
var getUseIsomorphicLayoutEffect = () => isDOM || isReactNative ? reactExports.useLayoutEffect : reactExports.useEffect;
var useIsomorphicLayoutEffect$1 = /* @__PURE__ */ getUseIsomorphicLayoutEffect();
function is(x, y) {
  if (x === y) {
    return x !== 0 || y !== 0 || 1 / x === 1 / y;
  } else {
    return x !== x && y !== y;
  }
}
function shallowEqual(objA, objB) {
  if (is(objA, objB)) return true;
  if (typeof objA !== "object" || objA === null || typeof objB !== "object" || objB === null) {
    return false;
  }
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  if (keysA.length !== keysB.length) return false;
  for (let i = 0; i < keysA.length; i++) {
    if (!Object.prototype.hasOwnProperty.call(objB, keysA[i]) || !is(objA[keysA[i]], objB[keysA[i]])) {
      return false;
    }
  }
  return true;
}
var REACT_STATICS = {
  childContextTypes: true,
  contextType: true,
  contextTypes: true,
  defaultProps: true,
  displayName: true,
  getDefaultProps: true,
  getDerivedStateFromError: true,
  getDerivedStateFromProps: true,
  mixins: true,
  propTypes: true,
  type: true
};
var KNOWN_STATICS = {
  name: true,
  length: true,
  prototype: true,
  caller: true,
  callee: true,
  arguments: true,
  arity: true
};
var FORWARD_REF_STATICS = {
  $$typeof: true,
  render: true,
  defaultProps: true,
  displayName: true,
  propTypes: true
};
var MEMO_STATICS = {
  $$typeof: true,
  compare: true,
  defaultProps: true,
  displayName: true,
  propTypes: true,
  type: true
};
var TYPE_STATICS = {
  [ForwardRef]: FORWARD_REF_STATICS,
  [Memo]: MEMO_STATICS
};
function getStatics(component) {
  if (isMemo(component)) {
    return MEMO_STATICS;
  }
  return TYPE_STATICS[component["$$typeof"]] || REACT_STATICS;
}
var defineProperty = Object.defineProperty;
var getOwnPropertyNames = Object.getOwnPropertyNames;
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
var getPrototypeOf = Object.getPrototypeOf;
var objectPrototype = Object.prototype;
function hoistNonReactStatics(targetComponent, sourceComponent) {
  if (typeof sourceComponent !== "string") {
    if (objectPrototype) {
      const inheritedComponent = getPrototypeOf(sourceComponent);
      if (inheritedComponent && inheritedComponent !== objectPrototype) {
        hoistNonReactStatics(targetComponent, inheritedComponent);
      }
    }
    let keys = getOwnPropertyNames(sourceComponent);
    if (getOwnPropertySymbols) {
      keys = keys.concat(getOwnPropertySymbols(sourceComponent));
    }
    const targetStatics = getStatics(targetComponent);
    const sourceStatics = getStatics(sourceComponent);
    for (let i = 0; i < keys.length; ++i) {
      const key = keys[i];
      if (!KNOWN_STATICS[key] && !(sourceStatics && sourceStatics[key]) && !(targetStatics && targetStatics[key])) {
        const descriptor = getOwnPropertyDescriptor(sourceComponent, key);
        try {
          defineProperty(targetComponent, key, descriptor);
        } catch (e) {
        }
      }
    }
  }
  return targetComponent;
}
var ContextKey = /* @__PURE__ */ Symbol.for(`react-redux-context`);
var gT = typeof globalThis !== "undefined" ? globalThis : (
  /* fall back to a per-module scope (pre-8.1 behaviour) if `globalThis` is not available */
  {}
);
function getContext() {
  if (!reactExports.createContext) return {};
  const contextMap = gT[ContextKey] ??= /* @__PURE__ */ new Map();
  let realContext = contextMap.get(reactExports.createContext);
  if (!realContext) {
    realContext = reactExports.createContext(
      null
    );
    contextMap.set(reactExports.createContext, realContext);
  }
  return realContext;
}
var ReactReduxContext = /* @__PURE__ */ getContext();
var NO_SUBSCRIPTION_ARRAY = [null, null];
function useIsomorphicLayoutEffectWithArgs(effectFunc, effectArgs, dependencies) {
  useIsomorphicLayoutEffect$1(() => effectFunc(...effectArgs), dependencies);
}
function captureWrapperProps(lastWrapperProps, lastChildProps, renderIsScheduled, wrapperProps, childPropsFromStoreUpdate, notifyNestedSubs) {
  lastWrapperProps.current = wrapperProps;
  renderIsScheduled.current = false;
  if (childPropsFromStoreUpdate.current) {
    childPropsFromStoreUpdate.current = null;
    notifyNestedSubs();
  }
}
function subscribeUpdates(shouldHandleStateChanges, store, subscription, childPropsSelector, lastWrapperProps, lastChildProps, renderIsScheduled, isMounted, childPropsFromStoreUpdate, notifyNestedSubs, additionalSubscribeListener) {
  if (!shouldHandleStateChanges) return () => {
  };
  let didUnsubscribe = false;
  let lastThrownError = null;
  const checkForUpdates = () => {
    if (didUnsubscribe || !isMounted.current) {
      return;
    }
    const latestStoreState = store.getState();
    let newChildProps, error;
    try {
      newChildProps = childPropsSelector(
        latestStoreState,
        lastWrapperProps.current
      );
    } catch (e) {
      error = e;
      lastThrownError = e;
    }
    if (!error) {
      lastThrownError = null;
    }
    if (newChildProps === lastChildProps.current) {
      if (!renderIsScheduled.current) {
        notifyNestedSubs();
      }
    } else {
      lastChildProps.current = newChildProps;
      childPropsFromStoreUpdate.current = newChildProps;
      renderIsScheduled.current = true;
      additionalSubscribeListener();
    }
  };
  subscription.onStateChange = checkForUpdates;
  subscription.trySubscribe();
  checkForUpdates();
  const unsubscribeWrapper = () => {
    didUnsubscribe = true;
    subscription.tryUnsubscribe();
    subscription.onStateChange = null;
    if (lastThrownError) {
      throw lastThrownError;
    }
  };
  return unsubscribeWrapper;
}
function strictEqual(a, b) {
  return a === b;
}
function _connect(mapStateToProps, mapDispatchToProps2, mergeProps, {
  // The `pure` option has been removed, so TS doesn't like us destructuring this to check its existence.
  // @ts-ignore
  pure,
  areStatesEqual = strictEqual,
  areOwnPropsEqual = shallowEqual,
  areStatePropsEqual = shallowEqual,
  areMergedPropsEqual = shallowEqual,
  // use React's forwardRef to expose a ref of the wrapped component
  forwardRef = false,
  // the context consumer to use
  context = ReactReduxContext
} = {}) {
  const Context = context;
  const initMapStateToProps = mapStateToPropsFactory(mapStateToProps);
  const initMapDispatchToProps = mapDispatchToPropsFactory(mapDispatchToProps2);
  const initMergeProps = mergePropsFactory(mergeProps);
  const shouldHandleStateChanges = Boolean(mapStateToProps);
  const wrapWithConnect = (WrappedComponent) => {
    const wrappedComponentName = WrappedComponent.displayName || WrappedComponent.name || "Component";
    const displayName = `Connect(${wrappedComponentName})`;
    const selectorFactoryOptions = {
      shouldHandleStateChanges,
      displayName,
      wrappedComponentName,
      WrappedComponent,
      // @ts-ignore
      initMapStateToProps,
      initMapDispatchToProps,
      initMergeProps,
      areStatesEqual,
      areStatePropsEqual,
      areOwnPropsEqual,
      areMergedPropsEqual
    };
    function ConnectFunction(props) {
      const [propsContext, reactReduxForwardedRef, wrapperProps] = reactExports.useMemo(() => {
        const { reactReduxForwardedRef: reactReduxForwardedRef2, ...wrapperProps2 } = props;
        return [props.context, reactReduxForwardedRef2, wrapperProps2];
      }, [props]);
      const ContextToUse = reactExports.useMemo(() => {
        let ResultContext = Context;
        if (propsContext?.Consumer) ;
        return ResultContext;
      }, [propsContext, Context]);
      const contextValue = reactExports.useContext(ContextToUse);
      const didStoreComeFromProps = Boolean(props.store) && Boolean(props.store.getState) && Boolean(props.store.dispatch);
      const didStoreComeFromContext = Boolean(contextValue) && Boolean(contextValue.store);
      const store = didStoreComeFromProps ? props.store : contextValue.store;
      const getServerState = didStoreComeFromContext ? contextValue.getServerState : store.getState;
      const childPropsSelector = reactExports.useMemo(() => {
        return finalPropsSelectorFactory(store.dispatch, selectorFactoryOptions);
      }, [store]);
      const [subscription, notifyNestedSubs] = reactExports.useMemo(() => {
        if (!shouldHandleStateChanges) return NO_SUBSCRIPTION_ARRAY;
        const subscription2 = createSubscription(
          store,
          didStoreComeFromProps ? void 0 : contextValue.subscription
        );
        const notifyNestedSubs2 = subscription2.notifyNestedSubs.bind(subscription2);
        return [subscription2, notifyNestedSubs2];
      }, [store, didStoreComeFromProps, contextValue]);
      const overriddenContextValue = reactExports.useMemo(() => {
        if (didStoreComeFromProps) {
          return contextValue;
        }
        return {
          ...contextValue,
          subscription
        };
      }, [didStoreComeFromProps, contextValue, subscription]);
      const lastChildProps = reactExports.useRef(void 0);
      const lastWrapperProps = reactExports.useRef(wrapperProps);
      const childPropsFromStoreUpdate = reactExports.useRef(void 0);
      const renderIsScheduled = reactExports.useRef(false);
      const isMounted = reactExports.useRef(false);
      const latestSubscriptionCallbackError = reactExports.useRef(
        void 0
      );
      useIsomorphicLayoutEffect$1(() => {
        isMounted.current = true;
        return () => {
          isMounted.current = false;
        };
      }, []);
      const actualChildPropsSelector = reactExports.useMemo(() => {
        const selector = () => {
          if (childPropsFromStoreUpdate.current && wrapperProps === lastWrapperProps.current) {
            return childPropsFromStoreUpdate.current;
          }
          return childPropsSelector(store.getState(), wrapperProps);
        };
        return selector;
      }, [store, wrapperProps]);
      const subscribeForReact = reactExports.useMemo(() => {
        const subscribe = (reactListener) => {
          if (!subscription) {
            return () => {
            };
          }
          return subscribeUpdates(
            shouldHandleStateChanges,
            store,
            subscription,
            // @ts-ignore
            childPropsSelector,
            lastWrapperProps,
            lastChildProps,
            renderIsScheduled,
            isMounted,
            childPropsFromStoreUpdate,
            notifyNestedSubs,
            reactListener
          );
        };
        return subscribe;
      }, [subscription]);
      useIsomorphicLayoutEffectWithArgs(captureWrapperProps, [
        lastWrapperProps,
        lastChildProps,
        renderIsScheduled,
        wrapperProps,
        childPropsFromStoreUpdate,
        notifyNestedSubs
      ]);
      let actualChildProps;
      try {
        actualChildProps = reactExports.useSyncExternalStore(
          // TODO We're passing through a big wrapper that does a bunch of extra side effects besides subscribing
          subscribeForReact,
          // TODO This is incredibly hacky. We've already processed the store update and calculated new child props,
          // TODO and we're just passing that through so it triggers a re-render for us rather than relying on `uSES`.
          actualChildPropsSelector,
          getServerState ? () => childPropsSelector(getServerState(), wrapperProps) : actualChildPropsSelector
        );
      } catch (err) {
        if (latestSubscriptionCallbackError.current) {
          err.message += `
The error may be correlated with this previous error:
${latestSubscriptionCallbackError.current.stack}

`;
        }
        throw err;
      }
      useIsomorphicLayoutEffect$1(() => {
        latestSubscriptionCallbackError.current = void 0;
        childPropsFromStoreUpdate.current = void 0;
        lastChildProps.current = actualChildProps;
      });
      const renderedWrappedComponent = reactExports.useMemo(() => {
        return (
          // @ts-ignore
          /* @__PURE__ */ reactExports.createElement(
            WrappedComponent,
            {
              ...actualChildProps,
              ref: reactReduxForwardedRef
            }
          )
        );
      }, [reactReduxForwardedRef, WrappedComponent, actualChildProps]);
      const renderedChild = reactExports.useMemo(() => {
        if (shouldHandleStateChanges) {
          return /* @__PURE__ */ reactExports.createElement(ContextToUse.Provider, { value: overriddenContextValue }, renderedWrappedComponent);
        }
        return renderedWrappedComponent;
      }, [ContextToUse, renderedWrappedComponent, overriddenContextValue]);
      return renderedChild;
    }
    const _Connect = reactExports.memo(ConnectFunction);
    const Connect = _Connect;
    Connect.WrappedComponent = WrappedComponent;
    Connect.displayName = ConnectFunction.displayName = displayName;
    if (forwardRef) {
      const _forwarded = reactExports.forwardRef(
        function forwardConnectRef(props, ref) {
          return /* @__PURE__ */ reactExports.createElement(Connect, { ...props, reactReduxForwardedRef: ref });
        }
      );
      const forwarded = _forwarded;
      forwarded.displayName = displayName;
      forwarded.WrappedComponent = WrappedComponent;
      return /* @__PURE__ */ hoistNonReactStatics(forwarded, WrappedComponent);
    }
    return /* @__PURE__ */ hoistNonReactStatics(Connect, WrappedComponent);
  };
  return wrapWithConnect;
}
var connect = _connect;
function Provider(providerProps) {
  const { children, context, serverState, store } = providerProps;
  const contextValue = reactExports.useMemo(() => {
    const subscription = createSubscription(store);
    const baseContextValue = {
      store,
      subscription,
      getServerState: serverState ? () => serverState : void 0
    };
    {
      return baseContextValue;
    }
  }, [store, serverState]);
  const previousState = reactExports.useMemo(() => store.getState(), [store]);
  useIsomorphicLayoutEffect$1(() => {
    const { subscription } = contextValue;
    subscription.onStateChange = subscription.notifyNestedSubs;
    subscription.trySubscribe();
    if (previousState !== store.getState()) {
      subscription.notifyNestedSubs();
    }
    return () => {
      subscription.tryUnsubscribe();
      subscription.onStateChange = void 0;
    };
  }, [contextValue, previousState]);
  const Context = context || ReactReduxContext;
  return /* @__PURE__ */ reactExports.createElement(Context.Provider, { value: contextValue }, children);
}
var Provider_default = Provider;
var getRect = function getRect2(_ref) {
  var top = _ref.top, right = _ref.right, bottom = _ref.bottom, left = _ref.left;
  var width = right - left;
  var height = bottom - top;
  var rect = {
    top,
    right,
    bottom,
    left,
    width,
    height,
    x: left,
    y: top,
    center: {
      x: (right + left) / 2,
      y: (bottom + top) / 2
    }
  };
  return rect;
};
var expand = function expand2(target, expandBy) {
  return {
    top: target.top - expandBy.top,
    left: target.left - expandBy.left,
    bottom: target.bottom + expandBy.bottom,
    right: target.right + expandBy.right
  };
};
var shrink = function shrink2(target, shrinkBy) {
  return {
    top: target.top + shrinkBy.top,
    left: target.left + shrinkBy.left,
    bottom: target.bottom - shrinkBy.bottom,
    right: target.right - shrinkBy.right
  };
};
var shift = function shift2(target, shiftBy) {
  return {
    top: target.top + shiftBy.y,
    left: target.left + shiftBy.x,
    bottom: target.bottom + shiftBy.y,
    right: target.right + shiftBy.x
  };
};
var noSpacing$1 = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0
};
var createBox = function createBox2(_ref2) {
  var borderBox = _ref2.borderBox, _ref2$margin = _ref2.margin, margin = _ref2$margin === void 0 ? noSpacing$1 : _ref2$margin, _ref2$border = _ref2.border, border = _ref2$border === void 0 ? noSpacing$1 : _ref2$border, _ref2$padding = _ref2.padding, padding = _ref2$padding === void 0 ? noSpacing$1 : _ref2$padding;
  var marginBox = getRect(expand(borderBox, margin));
  var paddingBox = getRect(shrink(borderBox, border));
  var contentBox = getRect(shrink(paddingBox, padding));
  return {
    marginBox,
    borderBox: getRect(borderBox),
    paddingBox,
    contentBox,
    margin,
    border,
    padding
  };
};
var parse = function parse2(raw) {
  var value = raw.slice(0, -2);
  var suffix = raw.slice(-2);
  if (suffix !== "px") {
    return 0;
  }
  var result = Number(value);
  !!isNaN(result) ? invariant$1(false) : void 0;
  return result;
};
var getWindowScroll$1 = function getWindowScroll2() {
  return {
    x: window.pageXOffset,
    y: window.pageYOffset
  };
};
var offset = function offset2(original, change) {
  var borderBox = original.borderBox, border = original.border, margin = original.margin, padding = original.padding;
  var shifted = shift(borderBox, change);
  return createBox({
    borderBox: shifted,
    border,
    margin,
    padding
  });
};
var withScroll = function withScroll2(original, scroll2) {
  if (scroll2 === void 0) {
    scroll2 = getWindowScroll$1();
  }
  return offset(original, scroll2);
};
var calculateBox = function calculateBox2(borderBox, styles) {
  var margin = {
    top: parse(styles.marginTop),
    right: parse(styles.marginRight),
    bottom: parse(styles.marginBottom),
    left: parse(styles.marginLeft)
  };
  var padding = {
    top: parse(styles.paddingTop),
    right: parse(styles.paddingRight),
    bottom: parse(styles.paddingBottom),
    left: parse(styles.paddingLeft)
  };
  var border = {
    top: parse(styles.borderTopWidth),
    right: parse(styles.borderRightWidth),
    bottom: parse(styles.borderBottomWidth),
    left: parse(styles.borderLeftWidth)
  };
  return createBox({
    borderBox,
    margin,
    padding,
    border
  });
};
var getBox = function getBox2(el) {
  var borderBox = el.getBoundingClientRect();
  var styles = window.getComputedStyle(el);
  return calculateBox(borderBox, styles);
};
var rafSchd = function rafSchd2(fn) {
  var lastArgs = [];
  var frameId = null;
  var wrapperFn = function wrapperFn2() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    lastArgs = args;
    if (frameId) {
      return;
    }
    frameId = requestAnimationFrame(function() {
      frameId = null;
      fn.apply(void 0, lastArgs);
    });
  };
  wrapperFn.cancel = function() {
    if (!frameId) {
      return;
    }
    cancelAnimationFrame(frameId);
    frameId = null;
  };
  return wrapperFn;
};
function _extends() {
  return _extends = Object.assign ? Object.assign.bind() : function(n) {
    for (var e = 1; e < arguments.length; e++) {
      var t = arguments[e];
      for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
    }
    return n;
  }, _extends.apply(null, arguments);
}
function log(type, message) {
  {
    return;
  }
}
log.bind(null, "warn");
log.bind(null, "error");
function noop$2() {
}
function getOptions(shared2, fromBinding) {
  return {
    ...shared2,
    ...fromBinding
  };
}
function bindEvents(el, bindings, sharedOptions) {
  const unbindings = bindings.map((binding) => {
    const options = getOptions(sharedOptions, binding.options);
    el.addEventListener(binding.eventName, binding.fn, options);
    return function unbind() {
      el.removeEventListener(binding.eventName, binding.fn, options);
    };
  });
  return function unbindAll() {
    unbindings.forEach((unbind) => {
      unbind();
    });
  };
}
const prefix$1 = "Invariant failed";
class RbdInvariant extends Error {
}
RbdInvariant.prototype.toString = function toString() {
  return this.message;
};
function invariant(condition, message) {
  {
    throw new RbdInvariant(prefix$1);
  }
}
class ErrorBoundary extends React.Component {
  constructor(...args) {
    super(...args);
    this.callbacks = null;
    this.unbind = noop$2;
    this.onWindowError = (event) => {
      const callbacks = this.getCallbacks();
      if (callbacks.isDragging()) {
        callbacks.tryAbort();
      }
      const err = event.error;
      if (err instanceof RbdInvariant) {
        event.preventDefault();
      }
    };
    this.getCallbacks = () => {
      if (!this.callbacks) {
        throw new Error("Unable to find AppCallbacks in <ErrorBoundary/>");
      }
      return this.callbacks;
    };
    this.setCallbacks = (callbacks) => {
      this.callbacks = callbacks;
    };
  }
  componentDidMount() {
    this.unbind = bindEvents(window, [{
      eventName: "error",
      fn: this.onWindowError
    }]);
  }
  componentDidCatch(err) {
    if (err instanceof RbdInvariant) {
      this.setState({});
      return;
    }
    throw err;
  }
  componentWillUnmount() {
    this.unbind();
  }
  render() {
    return this.props.children(this.setCallbacks);
  }
}
const dragHandleUsageInstructions = `
  Press space bar to start a drag.
  When dragging you can use the arrow keys to move the item around and escape to cancel.
  Some screen readers may require you to be in focus mode or to use your pass through key
`;
const position = (index) => index + 1;
const onDragStart = (start2) => `
  You have lifted an item in position ${position(start2.source.index)}
`;
const withLocation = (source, destination) => {
  const isInHomeList = source.droppableId === destination.droppableId;
  const startPosition = position(source.index);
  const endPosition = position(destination.index);
  if (isInHomeList) {
    return `
      You have moved the item from position ${startPosition}
      to position ${endPosition}
    `;
  }
  return `
    You have moved the item from position ${startPosition}
    in list ${source.droppableId}
    to list ${destination.droppableId}
    in position ${endPosition}
  `;
};
const withCombine = (id, source, combine2) => {
  const inHomeList = source.droppableId === combine2.droppableId;
  if (inHomeList) {
    return `
      The item ${id}
      has been combined with ${combine2.draggableId}`;
  }
  return `
      The item ${id}
      in list ${source.droppableId}
      has been combined with ${combine2.draggableId}
      in list ${combine2.droppableId}
    `;
};
const onDragUpdate = (update2) => {
  const location = update2.destination;
  if (location) {
    return withLocation(update2.source, location);
  }
  const combine2 = update2.combine;
  if (combine2) {
    return withCombine(update2.draggableId, update2.source, combine2);
  }
  return "You are over an area that cannot be dropped on";
};
const returnedToStart = (source) => `
  The item has returned to its starting position
  of ${position(source.index)}
`;
const onDragEnd = (result) => {
  if (result.reason === "CANCEL") {
    return `
      Movement cancelled.
      ${returnedToStart(result.source)}
    `;
  }
  const location = result.destination;
  const combine2 = result.combine;
  if (location) {
    return `
      You have dropped the item.
      ${withLocation(result.source, location)}
    `;
  }
  if (combine2) {
    return `
      You have dropped the item.
      ${withCombine(result.draggableId, result.source, combine2)}
    `;
  }
  return `
    The item has been dropped while not over a drop area.
    ${returnedToStart(result.source)}
  `;
};
const preset = {
  dragHandleUsageInstructions,
  onDragStart,
  onDragUpdate,
  onDragEnd
};
function isEqual$2(first, second) {
  if (first === second) {
    return true;
  }
  if (Number.isNaN(first) && Number.isNaN(second)) {
    return true;
  }
  return false;
}
function areInputsEqual(newInputs, lastInputs) {
  if (newInputs.length !== lastInputs.length) {
    return false;
  }
  for (let i = 0; i < newInputs.length; i++) {
    if (!isEqual$2(newInputs[i], lastInputs[i])) {
      return false;
    }
  }
  return true;
}
function useMemo(getResult, inputs) {
  const initial = reactExports.useState(() => ({
    inputs,
    result: getResult()
  }))[0];
  const isFirstRun = reactExports.useRef(true);
  const committed = reactExports.useRef(initial);
  const useCache = isFirstRun.current || Boolean(inputs && committed.current.inputs && areInputsEqual(inputs, committed.current.inputs));
  const cache = useCache ? committed.current : {
    inputs,
    result: getResult()
  };
  reactExports.useEffect(() => {
    isFirstRun.current = false;
    committed.current = cache;
  }, [cache]);
  return cache.result;
}
function useCallback(callback, inputs) {
  return useMemo(() => callback, inputs);
}
const origin = {
  x: 0,
  y: 0
};
const add = (point1, point2) => ({
  x: point1.x + point2.x,
  y: point1.y + point2.y
});
const subtract = (point1, point2) => ({
  x: point1.x - point2.x,
  y: point1.y - point2.y
});
const isEqual$1 = (point1, point2) => point1.x === point2.x && point1.y === point2.y;
const negate = (point) => ({
  x: point.x !== 0 ? -point.x : 0,
  y: point.y !== 0 ? -point.y : 0
});
const patch = (line, value, otherValue = 0) => {
  if (line === "x") {
    return {
      x: value,
      y: otherValue
    };
  }
  return {
    x: otherValue,
    y: value
  };
};
const distance = (point1, point2) => Math.sqrt((point2.x - point1.x) ** 2 + (point2.y - point1.y) ** 2);
const closest$1 = (target, points) => Math.min(...points.map((point) => distance(target, point)));
const apply = (fn) => (point) => ({
  x: fn(point.x),
  y: fn(point.y)
});
var executeClip = (frame, subject) => {
  const result = getRect({
    top: Math.max(subject.top, frame.top),
    right: Math.min(subject.right, frame.right),
    bottom: Math.min(subject.bottom, frame.bottom),
    left: Math.max(subject.left, frame.left)
  });
  if (result.width <= 0 || result.height <= 0) {
    return null;
  }
  return result;
};
const offsetByPosition = (spacing, point) => ({
  top: spacing.top + point.y,
  left: spacing.left + point.x,
  bottom: spacing.bottom + point.y,
  right: spacing.right + point.x
});
const getCorners = (spacing) => [{
  x: spacing.left,
  y: spacing.top
}, {
  x: spacing.right,
  y: spacing.top
}, {
  x: spacing.left,
  y: spacing.bottom
}, {
  x: spacing.right,
  y: spacing.bottom
}];
const noSpacing = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0
};
const scroll$1 = (target, frame) => {
  if (!frame) {
    return target;
  }
  return offsetByPosition(target, frame.scroll.diff.displacement);
};
const increase = (target, axis, withPlaceholder) => {
  if (withPlaceholder && withPlaceholder.increasedBy) {
    return {
      ...target,
      [axis.end]: target[axis.end] + withPlaceholder.increasedBy[axis.line]
    };
  }
  return target;
};
const clip = (target, frame) => {
  if (frame && frame.shouldClipSubject) {
    return executeClip(frame.pageMarginBox, target);
  }
  return getRect(target);
};
var getSubject = ({
  page,
  withPlaceholder,
  axis,
  frame
}) => {
  const scrolled = scroll$1(page.marginBox, frame);
  const increased = increase(scrolled, axis, withPlaceholder);
  const clipped = clip(increased, frame);
  return {
    page,
    withPlaceholder,
    active: clipped
  };
};
var scrollDroppable = (droppable2, newScroll) => {
  !droppable2.frame ? invariant() : void 0;
  const scrollable = droppable2.frame;
  const scrollDiff = subtract(newScroll, scrollable.scroll.initial);
  const scrollDisplacement = negate(scrollDiff);
  const frame = {
    ...scrollable,
    scroll: {
      initial: scrollable.scroll.initial,
      current: newScroll,
      diff: {
        value: scrollDiff,
        displacement: scrollDisplacement
      },
      max: scrollable.scroll.max
    }
  };
  const subject = getSubject({
    page: droppable2.subject.page,
    withPlaceholder: droppable2.subject.withPlaceholder,
    axis: droppable2.axis,
    frame
  });
  const result = {
    ...droppable2,
    frame,
    subject
  };
  return result;
};
function memoizeOne(resultFn, isEqual2 = areInputsEqual) {
  let cache = null;
  function memoized(...newArgs) {
    if (cache && cache.lastThis === this && isEqual2(newArgs, cache.lastArgs)) {
      return cache.lastResult;
    }
    const lastResult = resultFn.apply(this, newArgs);
    cache = {
      lastResult,
      lastArgs: newArgs,
      lastThis: this
    };
    return lastResult;
  }
  memoized.clear = function clear() {
    cache = null;
  };
  return memoized;
}
const toDroppableMap = memoizeOne((droppables) => droppables.reduce((previous, current) => {
  previous[current.descriptor.id] = current;
  return previous;
}, {}));
const toDraggableMap = memoizeOne((draggables) => draggables.reduce((previous, current) => {
  previous[current.descriptor.id] = current;
  return previous;
}, {}));
const toDroppableList = memoizeOne((droppables) => Object.values(droppables));
const toDraggableList = memoizeOne((draggables) => Object.values(draggables));
var getDraggablesInsideDroppable = memoizeOne((droppableId, draggables) => {
  const result = toDraggableList(draggables).filter((draggable2) => droppableId === draggable2.descriptor.droppableId).sort((a, b) => a.descriptor.index - b.descriptor.index);
  return result;
});
function tryGetDestination(impact) {
  if (impact.at && impact.at.type === "REORDER") {
    return impact.at.destination;
  }
  return null;
}
function tryGetCombine(impact) {
  if (impact.at && impact.at.type === "COMBINE") {
    return impact.at.combine;
  }
  return null;
}
var removeDraggableFromList = memoizeOne((remove, list) => list.filter((item) => item.descriptor.id !== remove.descriptor.id));
var moveToNextCombine = ({
  isMovingForward,
  draggable: draggable2,
  destination,
  insideDestination,
  previousImpact
}) => {
  if (!destination.isCombineEnabled) {
    return null;
  }
  const location = tryGetDestination(previousImpact);
  if (!location) {
    return null;
  }
  function getImpact(target) {
    const at = {
      type: "COMBINE",
      combine: {
        draggableId: target,
        droppableId: destination.descriptor.id
      }
    };
    return {
      ...previousImpact,
      at
    };
  }
  const all = previousImpact.displaced.all;
  const closestId = all.length ? all[0] : null;
  if (isMovingForward) {
    return closestId ? getImpact(closestId) : null;
  }
  const withoutDraggable = removeDraggableFromList(draggable2, insideDestination);
  if (!closestId) {
    if (!withoutDraggable.length) {
      return null;
    }
    const last = withoutDraggable[withoutDraggable.length - 1];
    return getImpact(last.descriptor.id);
  }
  const indexOfClosest = withoutDraggable.findIndex((d) => d.descriptor.id === closestId);
  !(indexOfClosest !== -1) ? invariant() : void 0;
  const proposedIndex = indexOfClosest - 1;
  if (proposedIndex < 0) {
    return null;
  }
  const before = withoutDraggable[proposedIndex];
  return getImpact(before.descriptor.id);
};
var isHomeOf = (draggable2, destination) => draggable2.descriptor.droppableId === destination.descriptor.id;
const noDisplacedBy = {
  point: origin,
  value: 0
};
const emptyGroups = {
  invisible: {},
  visible: {},
  all: []
};
const noImpact = {
  displaced: emptyGroups,
  displacedBy: noDisplacedBy,
  at: null
};
var isWithin = (lowerBound, upperBound) => (value) => lowerBound <= value && value <= upperBound;
var isPartiallyVisibleThroughFrame = (frame) => {
  const isWithinVertical = isWithin(frame.top, frame.bottom);
  const isWithinHorizontal = isWithin(frame.left, frame.right);
  return (subject) => {
    const isContained = isWithinVertical(subject.top) && isWithinVertical(subject.bottom) && isWithinHorizontal(subject.left) && isWithinHorizontal(subject.right);
    if (isContained) {
      return true;
    }
    const isPartiallyVisibleVertically = isWithinVertical(subject.top) || isWithinVertical(subject.bottom);
    const isPartiallyVisibleHorizontally = isWithinHorizontal(subject.left) || isWithinHorizontal(subject.right);
    const isPartiallyContained = isPartiallyVisibleVertically && isPartiallyVisibleHorizontally;
    if (isPartiallyContained) {
      return true;
    }
    const isBiggerVertically = subject.top < frame.top && subject.bottom > frame.bottom;
    const isBiggerHorizontally = subject.left < frame.left && subject.right > frame.right;
    const isTargetBiggerThanFrame = isBiggerVertically && isBiggerHorizontally;
    if (isTargetBiggerThanFrame) {
      return true;
    }
    const isTargetBiggerOnOneAxis = isBiggerVertically && isPartiallyVisibleHorizontally || isBiggerHorizontally && isPartiallyVisibleVertically;
    return isTargetBiggerOnOneAxis;
  };
};
var isTotallyVisibleThroughFrame = (frame) => {
  const isWithinVertical = isWithin(frame.top, frame.bottom);
  const isWithinHorizontal = isWithin(frame.left, frame.right);
  return (subject) => {
    const isContained = isWithinVertical(subject.top) && isWithinVertical(subject.bottom) && isWithinHorizontal(subject.left) && isWithinHorizontal(subject.right);
    return isContained;
  };
};
const vertical = {
  direction: "vertical",
  line: "y",
  crossAxisLine: "x",
  start: "top",
  end: "bottom",
  size: "height",
  crossAxisStart: "left",
  crossAxisEnd: "right",
  crossAxisSize: "width"
};
const horizontal = {
  direction: "horizontal",
  line: "x",
  crossAxisLine: "y",
  start: "left",
  end: "right",
  size: "width",
  crossAxisStart: "top",
  crossAxisEnd: "bottom",
  crossAxisSize: "height"
};
var isTotallyVisibleThroughFrameOnAxis = (axis) => (frame) => {
  const isWithinVertical = isWithin(frame.top, frame.bottom);
  const isWithinHorizontal = isWithin(frame.left, frame.right);
  return (subject) => {
    if (axis === vertical) {
      return isWithinVertical(subject.top) && isWithinVertical(subject.bottom);
    }
    return isWithinHorizontal(subject.left) && isWithinHorizontal(subject.right);
  };
};
const getDroppableDisplaced = (target, destination) => {
  const displacement = destination.frame ? destination.frame.scroll.diff.displacement : origin;
  return offsetByPosition(target, displacement);
};
const isVisibleInDroppable = (target, destination, isVisibleThroughFrameFn) => {
  if (!destination.subject.active) {
    return false;
  }
  return isVisibleThroughFrameFn(destination.subject.active)(target);
};
const isVisibleInViewport = (target, viewport, isVisibleThroughFrameFn) => isVisibleThroughFrameFn(viewport)(target);
const isVisible$1 = ({
  target: toBeDisplaced,
  destination,
  viewport,
  withDroppableDisplacement: withDroppableDisplacement2,
  isVisibleThroughFrameFn
}) => {
  const displacedTarget = withDroppableDisplacement2 ? getDroppableDisplaced(toBeDisplaced, destination) : toBeDisplaced;
  return isVisibleInDroppable(displacedTarget, destination, isVisibleThroughFrameFn) && isVisibleInViewport(displacedTarget, viewport, isVisibleThroughFrameFn);
};
const isPartiallyVisible = (args) => isVisible$1({
  ...args,
  isVisibleThroughFrameFn: isPartiallyVisibleThroughFrame
});
const isTotallyVisible = (args) => isVisible$1({
  ...args,
  isVisibleThroughFrameFn: isTotallyVisibleThroughFrame
});
const isTotallyVisibleOnAxis = (args) => isVisible$1({
  ...args,
  isVisibleThroughFrameFn: isTotallyVisibleThroughFrameOnAxis(args.destination.axis)
});
const getShouldAnimate = (id, last, forceShouldAnimate) => {
  if (typeof forceShouldAnimate === "boolean") {
    return forceShouldAnimate;
  }
  if (!last) {
    return true;
  }
  const {
    invisible,
    visible
  } = last;
  if (invisible[id]) {
    return false;
  }
  const previous = visible[id];
  return previous ? previous.shouldAnimate : true;
};
function getTarget(draggable2, displacedBy) {
  const marginBox = draggable2.page.marginBox;
  const expandBy = {
    top: displacedBy.point.y,
    right: 0,
    bottom: 0,
    left: displacedBy.point.x
  };
  return getRect(expand(marginBox, expandBy));
}
function getDisplacementGroups({
  afterDragging,
  destination,
  displacedBy,
  viewport,
  forceShouldAnimate,
  last
}) {
  return afterDragging.reduce(function process2(groups, draggable2) {
    const target = getTarget(draggable2, displacedBy);
    const id = draggable2.descriptor.id;
    groups.all.push(id);
    const isVisible2 = isPartiallyVisible({
      target,
      destination,
      viewport,
      withDroppableDisplacement: true
    });
    if (!isVisible2) {
      groups.invisible[draggable2.descriptor.id] = true;
      return groups;
    }
    const shouldAnimate = getShouldAnimate(id, last, forceShouldAnimate);
    const displacement = {
      draggableId: id,
      shouldAnimate
    };
    groups.visible[id] = displacement;
    return groups;
  }, {
    all: [],
    visible: {},
    invisible: {}
  });
}
function getIndexOfLastItem(draggables, options) {
  if (!draggables.length) {
    return 0;
  }
  const indexOfLastItem = draggables[draggables.length - 1].descriptor.index;
  return options.inHomeList ? indexOfLastItem : indexOfLastItem + 1;
}
function goAtEnd({
  insideDestination,
  inHomeList,
  displacedBy,
  destination
}) {
  const newIndex = getIndexOfLastItem(insideDestination, {
    inHomeList
  });
  return {
    displaced: emptyGroups,
    displacedBy,
    at: {
      type: "REORDER",
      destination: {
        droppableId: destination.descriptor.id,
        index: newIndex
      }
    }
  };
}
function calculateReorderImpact({
  draggable: draggable2,
  insideDestination,
  destination,
  viewport,
  displacedBy,
  last,
  index,
  forceShouldAnimate
}) {
  const inHomeList = isHomeOf(draggable2, destination);
  if (index == null) {
    return goAtEnd({
      insideDestination,
      inHomeList,
      displacedBy,
      destination
    });
  }
  const match = insideDestination.find((item) => item.descriptor.index === index);
  if (!match) {
    return goAtEnd({
      insideDestination,
      inHomeList,
      displacedBy,
      destination
    });
  }
  const withoutDragging = removeDraggableFromList(draggable2, insideDestination);
  const sliceFrom = insideDestination.indexOf(match);
  const impacted = withoutDragging.slice(sliceFrom);
  const displaced = getDisplacementGroups({
    afterDragging: impacted,
    destination,
    displacedBy,
    last,
    viewport: viewport.frame,
    forceShouldAnimate
  });
  return {
    displaced,
    displacedBy,
    at: {
      type: "REORDER",
      destination: {
        droppableId: destination.descriptor.id,
        index
      }
    }
  };
}
function didStartAfterCritical(draggableId, afterCritical) {
  return Boolean(afterCritical.effected[draggableId]);
}
var fromCombine = ({
  isMovingForward,
  destination,
  draggables,
  combine: combine2,
  afterCritical
}) => {
  if (!destination.isCombineEnabled) {
    return null;
  }
  const combineId = combine2.draggableId;
  const combineWith = draggables[combineId];
  const combineWithIndex = combineWith.descriptor.index;
  const didCombineWithStartAfterCritical = didStartAfterCritical(combineId, afterCritical);
  if (didCombineWithStartAfterCritical) {
    if (isMovingForward) {
      return combineWithIndex;
    }
    return combineWithIndex - 1;
  }
  if (isMovingForward) {
    return combineWithIndex + 1;
  }
  return combineWithIndex;
};
var fromReorder = ({
  isMovingForward,
  isInHomeList,
  insideDestination,
  location
}) => {
  if (!insideDestination.length) {
    return null;
  }
  const currentIndex = location.index;
  const proposedIndex = isMovingForward ? currentIndex + 1 : currentIndex - 1;
  const firstIndex = insideDestination[0].descriptor.index;
  const lastIndex = insideDestination[insideDestination.length - 1].descriptor.index;
  const upperBound = isInHomeList ? lastIndex : lastIndex + 1;
  if (proposedIndex < firstIndex) {
    return null;
  }
  if (proposedIndex > upperBound) {
    return null;
  }
  return proposedIndex;
};
var moveToNextIndex = ({
  isMovingForward,
  isInHomeList,
  draggable: draggable2,
  draggables,
  destination,
  insideDestination,
  previousImpact,
  viewport,
  afterCritical
}) => {
  const wasAt = previousImpact.at;
  !wasAt ? invariant() : void 0;
  if (wasAt.type === "REORDER") {
    const newIndex2 = fromReorder({
      isMovingForward,
      isInHomeList,
      location: wasAt.destination,
      insideDestination
    });
    if (newIndex2 == null) {
      return null;
    }
    return calculateReorderImpact({
      draggable: draggable2,
      insideDestination,
      destination,
      viewport,
      last: previousImpact.displaced,
      displacedBy: previousImpact.displacedBy,
      index: newIndex2
    });
  }
  const newIndex = fromCombine({
    isMovingForward,
    destination,
    displaced: previousImpact.displaced,
    draggables,
    combine: wasAt.combine,
    afterCritical
  });
  if (newIndex == null) {
    return null;
  }
  return calculateReorderImpact({
    draggable: draggable2,
    insideDestination,
    destination,
    viewport,
    last: previousImpact.displaced,
    displacedBy: previousImpact.displacedBy,
    index: newIndex
  });
};
var getCombinedItemDisplacement = ({
  displaced,
  afterCritical,
  combineWith,
  displacedBy
}) => {
  const isDisplaced = Boolean(displaced.visible[combineWith] || displaced.invisible[combineWith]);
  if (didStartAfterCritical(combineWith, afterCritical)) {
    return isDisplaced ? origin : negate(displacedBy.point);
  }
  return isDisplaced ? displacedBy.point : origin;
};
var whenCombining = ({
  afterCritical,
  impact,
  draggables
}) => {
  const combine2 = tryGetCombine(impact);
  !combine2 ? invariant() : void 0;
  const combineWith = combine2.draggableId;
  const center = draggables[combineWith].page.borderBox.center;
  const displaceBy = getCombinedItemDisplacement({
    displaced: impact.displaced,
    afterCritical,
    combineWith,
    displacedBy: impact.displacedBy
  });
  return add(center, displaceBy);
};
const distanceFromStartToBorderBoxCenter = (axis, box) => box.margin[axis.start] + box.borderBox[axis.size] / 2;
const distanceFromEndToBorderBoxCenter = (axis, box) => box.margin[axis.end] + box.borderBox[axis.size] / 2;
const getCrossAxisBorderBoxCenter = (axis, target, isMoving) => target[axis.crossAxisStart] + isMoving.margin[axis.crossAxisStart] + isMoving.borderBox[axis.crossAxisSize] / 2;
const goAfter = ({
  axis,
  moveRelativeTo,
  isMoving
}) => patch(axis.line, moveRelativeTo.marginBox[axis.end] + distanceFromStartToBorderBoxCenter(axis, isMoving), getCrossAxisBorderBoxCenter(axis, moveRelativeTo.marginBox, isMoving));
const goBefore = ({
  axis,
  moveRelativeTo,
  isMoving
}) => patch(axis.line, moveRelativeTo.marginBox[axis.start] - distanceFromEndToBorderBoxCenter(axis, isMoving), getCrossAxisBorderBoxCenter(axis, moveRelativeTo.marginBox, isMoving));
const goIntoStart = ({
  axis,
  moveInto,
  isMoving
}) => patch(axis.line, moveInto.contentBox[axis.start] + distanceFromStartToBorderBoxCenter(axis, isMoving), getCrossAxisBorderBoxCenter(axis, moveInto.contentBox, isMoving));
var whenReordering = ({
  impact,
  draggable: draggable2,
  draggables,
  droppable: droppable2,
  afterCritical
}) => {
  const insideDestination = getDraggablesInsideDroppable(droppable2.descriptor.id, draggables);
  const draggablePage = draggable2.page;
  const axis = droppable2.axis;
  if (!insideDestination.length) {
    return goIntoStart({
      axis,
      moveInto: droppable2.page,
      isMoving: draggablePage
    });
  }
  const {
    displaced,
    displacedBy
  } = impact;
  const closestAfter = displaced.all[0];
  if (closestAfter) {
    const closest2 = draggables[closestAfter];
    if (didStartAfterCritical(closestAfter, afterCritical)) {
      return goBefore({
        axis,
        moveRelativeTo: closest2.page,
        isMoving: draggablePage
      });
    }
    const withDisplacement = offset(closest2.page, displacedBy.point);
    return goBefore({
      axis,
      moveRelativeTo: withDisplacement,
      isMoving: draggablePage
    });
  }
  const last = insideDestination[insideDestination.length - 1];
  if (last.descriptor.id === draggable2.descriptor.id) {
    return draggablePage.borderBox.center;
  }
  if (didStartAfterCritical(last.descriptor.id, afterCritical)) {
    const page = offset(last.page, negate(afterCritical.displacedBy.point));
    return goAfter({
      axis,
      moveRelativeTo: page,
      isMoving: draggablePage
    });
  }
  return goAfter({
    axis,
    moveRelativeTo: last.page,
    isMoving: draggablePage
  });
};
var withDroppableDisplacement = (droppable2, point) => {
  const frame = droppable2.frame;
  if (!frame) {
    return point;
  }
  return add(point, frame.scroll.diff.displacement);
};
const getResultWithoutDroppableDisplacement = ({
  impact,
  draggable: draggable2,
  droppable: droppable2,
  draggables,
  afterCritical
}) => {
  const original = draggable2.page.borderBox.center;
  const at = impact.at;
  if (!droppable2) {
    return original;
  }
  if (!at) {
    return original;
  }
  if (at.type === "REORDER") {
    return whenReordering({
      impact,
      draggable: draggable2,
      draggables,
      droppable: droppable2,
      afterCritical
    });
  }
  return whenCombining({
    impact,
    draggables,
    afterCritical
  });
};
var getPageBorderBoxCenterFromImpact = (args) => {
  const withoutDisplacement = getResultWithoutDroppableDisplacement(args);
  const droppable2 = args.droppable;
  const withDisplacement = droppable2 ? withDroppableDisplacement(droppable2, withoutDisplacement) : withoutDisplacement;
  return withDisplacement;
};
var scrollViewport = (viewport, newScroll) => {
  const diff = subtract(newScroll, viewport.scroll.initial);
  const displacement = negate(diff);
  const frame = getRect({
    top: newScroll.y,
    bottom: newScroll.y + viewport.frame.height,
    left: newScroll.x,
    right: newScroll.x + viewport.frame.width
  });
  const updated = {
    frame,
    scroll: {
      initial: viewport.scroll.initial,
      max: viewport.scroll.max,
      current: newScroll,
      diff: {
        value: diff,
        displacement
      }
    }
  };
  return updated;
};
function getDraggables$1(ids, draggables) {
  return ids.map((id) => draggables[id]);
}
function tryGetVisible(id, groups) {
  for (let i = 0; i < groups.length; i++) {
    const displacement = groups[i].visible[id];
    if (displacement) {
      return displacement;
    }
  }
  return null;
}
var speculativelyIncrease = ({
  impact,
  viewport,
  destination,
  draggables,
  maxScrollChange
}) => {
  const scrolledViewport = scrollViewport(viewport, add(viewport.scroll.current, maxScrollChange));
  const scrolledDroppable = destination.frame ? scrollDroppable(destination, add(destination.frame.scroll.current, maxScrollChange)) : destination;
  const last = impact.displaced;
  const withViewportScroll = getDisplacementGroups({
    afterDragging: getDraggables$1(last.all, draggables),
    destination,
    displacedBy: impact.displacedBy,
    viewport: scrolledViewport.frame,
    last,
    forceShouldAnimate: false
  });
  const withDroppableScroll2 = getDisplacementGroups({
    afterDragging: getDraggables$1(last.all, draggables),
    destination: scrolledDroppable,
    displacedBy: impact.displacedBy,
    viewport: viewport.frame,
    last,
    forceShouldAnimate: false
  });
  const invisible = {};
  const visible = {};
  const groups = [last, withViewportScroll, withDroppableScroll2];
  last.all.forEach((id) => {
    const displacement = tryGetVisible(id, groups);
    if (displacement) {
      visible[id] = displacement;
      return;
    }
    invisible[id] = true;
  });
  const newImpact = {
    ...impact,
    displaced: {
      all: last.all,
      invisible,
      visible
    }
  };
  return newImpact;
};
var withViewportDisplacement = (viewport, point) => add(viewport.scroll.diff.displacement, point);
var getClientFromPageBorderBoxCenter = ({
  pageBorderBoxCenter,
  draggable: draggable2,
  viewport
}) => {
  const withoutPageScrollChange = withViewportDisplacement(viewport, pageBorderBoxCenter);
  const offset22 = subtract(withoutPageScrollChange, draggable2.page.borderBox.center);
  return add(draggable2.client.borderBox.center, offset22);
};
var isTotallyVisibleInNewLocation = ({
  draggable: draggable2,
  destination,
  newPageBorderBoxCenter,
  viewport,
  withDroppableDisplacement: withDroppableDisplacement2,
  onlyOnMainAxis = false
}) => {
  const changeNeeded = subtract(newPageBorderBoxCenter, draggable2.page.borderBox.center);
  const shifted = offsetByPosition(draggable2.page.borderBox, changeNeeded);
  const args = {
    target: shifted,
    destination,
    withDroppableDisplacement: withDroppableDisplacement2,
    viewport
  };
  return onlyOnMainAxis ? isTotallyVisibleOnAxis(args) : isTotallyVisible(args);
};
var moveToNextPlace = ({
  isMovingForward,
  draggable: draggable2,
  destination,
  draggables,
  previousImpact,
  viewport,
  previousPageBorderBoxCenter,
  previousClientSelection,
  afterCritical
}) => {
  if (!destination.isEnabled) {
    return null;
  }
  const insideDestination = getDraggablesInsideDroppable(destination.descriptor.id, draggables);
  const isInHomeList = isHomeOf(draggable2, destination);
  const impact = moveToNextCombine({
    isMovingForward,
    draggable: draggable2,
    destination,
    insideDestination,
    previousImpact
  }) || moveToNextIndex({
    isMovingForward,
    isInHomeList,
    draggable: draggable2,
    draggables,
    destination,
    insideDestination,
    previousImpact,
    viewport,
    afterCritical
  });
  if (!impact) {
    return null;
  }
  const pageBorderBoxCenter = getPageBorderBoxCenterFromImpact({
    impact,
    draggable: draggable2,
    droppable: destination,
    draggables,
    afterCritical
  });
  const isVisibleInNewLocation = isTotallyVisibleInNewLocation({
    draggable: draggable2,
    destination,
    newPageBorderBoxCenter: pageBorderBoxCenter,
    viewport: viewport.frame,
    withDroppableDisplacement: false,
    onlyOnMainAxis: true
  });
  if (isVisibleInNewLocation) {
    const clientSelection = getClientFromPageBorderBoxCenter({
      pageBorderBoxCenter,
      draggable: draggable2,
      viewport
    });
    return {
      clientSelection,
      impact,
      scrollJumpRequest: null
    };
  }
  const distance2 = subtract(pageBorderBoxCenter, previousPageBorderBoxCenter);
  const cautious = speculativelyIncrease({
    impact,
    viewport,
    destination,
    draggables,
    maxScrollChange: distance2
  });
  return {
    clientSelection: previousClientSelection,
    impact: cautious,
    scrollJumpRequest: distance2
  };
};
const getKnownActive = (droppable2) => {
  const rect = droppable2.subject.active;
  !rect ? invariant() : void 0;
  return rect;
};
var getBestCrossAxisDroppable = ({
  isMovingForward,
  pageBorderBoxCenter,
  source,
  droppables,
  viewport
}) => {
  const active = source.subject.active;
  if (!active) {
    return null;
  }
  const axis = source.axis;
  const isBetweenSourceClipped = isWithin(active[axis.start], active[axis.end]);
  const candidates = toDroppableList(droppables).filter((droppable2) => droppable2 !== source).filter((droppable2) => droppable2.isEnabled).filter((droppable2) => Boolean(droppable2.subject.active)).filter((droppable2) => isPartiallyVisibleThroughFrame(viewport.frame)(getKnownActive(droppable2))).filter((droppable2) => {
    const activeOfTarget = getKnownActive(droppable2);
    if (isMovingForward) {
      return active[axis.crossAxisEnd] < activeOfTarget[axis.crossAxisEnd];
    }
    return activeOfTarget[axis.crossAxisStart] < active[axis.crossAxisStart];
  }).filter((droppable2) => {
    const activeOfTarget = getKnownActive(droppable2);
    const isBetweenDestinationClipped = isWithin(activeOfTarget[axis.start], activeOfTarget[axis.end]);
    return isBetweenSourceClipped(activeOfTarget[axis.start]) || isBetweenSourceClipped(activeOfTarget[axis.end]) || isBetweenDestinationClipped(active[axis.start]) || isBetweenDestinationClipped(active[axis.end]);
  }).sort((a, b) => {
    const first = getKnownActive(a)[axis.crossAxisStart];
    const second = getKnownActive(b)[axis.crossAxisStart];
    if (isMovingForward) {
      return first - second;
    }
    return second - first;
  }).filter((droppable2, index, array) => getKnownActive(droppable2)[axis.crossAxisStart] === getKnownActive(array[0])[axis.crossAxisStart]);
  if (!candidates.length) {
    return null;
  }
  if (candidates.length === 1) {
    return candidates[0];
  }
  const contains = candidates.filter((droppable2) => {
    const isWithinDroppable = isWithin(getKnownActive(droppable2)[axis.start], getKnownActive(droppable2)[axis.end]);
    return isWithinDroppable(pageBorderBoxCenter[axis.line]);
  });
  if (contains.length === 1) {
    return contains[0];
  }
  if (contains.length > 1) {
    return contains.sort((a, b) => getKnownActive(a)[axis.start] - getKnownActive(b)[axis.start])[0];
  }
  return candidates.sort((a, b) => {
    const first = closest$1(pageBorderBoxCenter, getCorners(getKnownActive(a)));
    const second = closest$1(pageBorderBoxCenter, getCorners(getKnownActive(b)));
    if (first !== second) {
      return first - second;
    }
    return getKnownActive(a)[axis.start] - getKnownActive(b)[axis.start];
  })[0];
};
const getCurrentPageBorderBoxCenter = (draggable2, afterCritical) => {
  const original = draggable2.page.borderBox.center;
  return didStartAfterCritical(draggable2.descriptor.id, afterCritical) ? subtract(original, afterCritical.displacedBy.point) : original;
};
const getCurrentPageBorderBox = (draggable2, afterCritical) => {
  const original = draggable2.page.borderBox;
  return didStartAfterCritical(draggable2.descriptor.id, afterCritical) ? offsetByPosition(original, negate(afterCritical.displacedBy.point)) : original;
};
var getClosestDraggable = ({
  pageBorderBoxCenter,
  viewport,
  destination,
  insideDestination,
  afterCritical
}) => {
  const sorted = insideDestination.filter((draggable2) => isTotallyVisible({
    target: getCurrentPageBorderBox(draggable2, afterCritical),
    destination,
    viewport: viewport.frame,
    withDroppableDisplacement: true
  })).sort((a, b) => {
    const distanceToA = distance(pageBorderBoxCenter, withDroppableDisplacement(destination, getCurrentPageBorderBoxCenter(a, afterCritical)));
    const distanceToB = distance(pageBorderBoxCenter, withDroppableDisplacement(destination, getCurrentPageBorderBoxCenter(b, afterCritical)));
    if (distanceToA < distanceToB) {
      return -1;
    }
    if (distanceToB < distanceToA) {
      return 1;
    }
    return a.descriptor.index - b.descriptor.index;
  });
  return sorted[0] || null;
};
var getDisplacedBy = memoizeOne(function getDisplacedBy2(axis, displaceBy) {
  const displacement = displaceBy[axis.line];
  return {
    value: displacement,
    point: patch(axis.line, displacement)
  };
});
const getRequiredGrowthForPlaceholder = (droppable2, placeholderSize, draggables) => {
  const axis = droppable2.axis;
  if (droppable2.descriptor.mode === "virtual") {
    return patch(axis.line, placeholderSize[axis.line]);
  }
  const availableSpace = droppable2.subject.page.contentBox[axis.size];
  const insideDroppable = getDraggablesInsideDroppable(droppable2.descriptor.id, draggables);
  const spaceUsed = insideDroppable.reduce((sum, dimension) => sum + dimension.client.marginBox[axis.size], 0);
  const requiredSpace = spaceUsed + placeholderSize[axis.line];
  const needsToGrowBy = requiredSpace - availableSpace;
  if (needsToGrowBy <= 0) {
    return null;
  }
  return patch(axis.line, needsToGrowBy);
};
const withMaxScroll = (frame, max) => ({
  ...frame,
  scroll: {
    ...frame.scroll,
    max
  }
});
const addPlaceholder = (droppable2, draggable2, draggables) => {
  const frame = droppable2.frame;
  !!isHomeOf(draggable2, droppable2) ? invariant() : void 0;
  !!droppable2.subject.withPlaceholder ? invariant() : void 0;
  const placeholderSize = getDisplacedBy(droppable2.axis, draggable2.displaceBy).point;
  const requiredGrowth = getRequiredGrowthForPlaceholder(droppable2, placeholderSize, draggables);
  const added = {
    placeholderSize,
    increasedBy: requiredGrowth,
    oldFrameMaxScroll: droppable2.frame ? droppable2.frame.scroll.max : null
  };
  if (!frame) {
    const subject2 = getSubject({
      page: droppable2.subject.page,
      withPlaceholder: added,
      axis: droppable2.axis,
      frame: droppable2.frame
    });
    return {
      ...droppable2,
      subject: subject2
    };
  }
  const maxScroll = requiredGrowth ? add(frame.scroll.max, requiredGrowth) : frame.scroll.max;
  const newFrame = withMaxScroll(frame, maxScroll);
  const subject = getSubject({
    page: droppable2.subject.page,
    withPlaceholder: added,
    axis: droppable2.axis,
    frame: newFrame
  });
  return {
    ...droppable2,
    subject,
    frame: newFrame
  };
};
const removePlaceholder = (droppable2) => {
  const added = droppable2.subject.withPlaceholder;
  !added ? invariant() : void 0;
  const frame = droppable2.frame;
  if (!frame) {
    const subject2 = getSubject({
      page: droppable2.subject.page,
      axis: droppable2.axis,
      frame: null,
      withPlaceholder: null
    });
    return {
      ...droppable2,
      subject: subject2
    };
  }
  const oldMaxScroll = added.oldFrameMaxScroll;
  !oldMaxScroll ? invariant() : void 0;
  const newFrame = withMaxScroll(frame, oldMaxScroll);
  const subject = getSubject({
    page: droppable2.subject.page,
    axis: droppable2.axis,
    frame: newFrame,
    withPlaceholder: null
  });
  return {
    ...droppable2,
    subject,
    frame: newFrame
  };
};
var moveToNewDroppable = ({
  previousPageBorderBoxCenter,
  moveRelativeTo,
  insideDestination,
  draggable: draggable2,
  draggables,
  destination,
  viewport,
  afterCritical
}) => {
  if (!moveRelativeTo) {
    if (insideDestination.length) {
      return null;
    }
    const proposed = {
      displaced: emptyGroups,
      displacedBy: noDisplacedBy,
      at: {
        type: "REORDER",
        destination: {
          droppableId: destination.descriptor.id,
          index: 0
        }
      }
    };
    const proposedPageBorderBoxCenter = getPageBorderBoxCenterFromImpact({
      impact: proposed,
      draggable: draggable2,
      droppable: destination,
      draggables,
      afterCritical
    });
    const withPlaceholder = isHomeOf(draggable2, destination) ? destination : addPlaceholder(destination, draggable2, draggables);
    const isVisibleInNewLocation = isTotallyVisibleInNewLocation({
      draggable: draggable2,
      destination: withPlaceholder,
      newPageBorderBoxCenter: proposedPageBorderBoxCenter,
      viewport: viewport.frame,
      withDroppableDisplacement: false,
      onlyOnMainAxis: true
    });
    return isVisibleInNewLocation ? proposed : null;
  }
  const isGoingBeforeTarget = Boolean(previousPageBorderBoxCenter[destination.axis.line] <= moveRelativeTo.page.borderBox.center[destination.axis.line]);
  const proposedIndex = (() => {
    const relativeTo = moveRelativeTo.descriptor.index;
    if (moveRelativeTo.descriptor.id === draggable2.descriptor.id) {
      return relativeTo;
    }
    if (isGoingBeforeTarget) {
      return relativeTo;
    }
    return relativeTo + 1;
  })();
  const displacedBy = getDisplacedBy(destination.axis, draggable2.displaceBy);
  return calculateReorderImpact({
    draggable: draggable2,
    insideDestination,
    destination,
    viewport,
    displacedBy,
    last: emptyGroups,
    index: proposedIndex
  });
};
var moveCrossAxis = ({
  isMovingForward,
  previousPageBorderBoxCenter,
  draggable: draggable2,
  isOver,
  draggables,
  droppables,
  viewport,
  afterCritical
}) => {
  const destination = getBestCrossAxisDroppable({
    isMovingForward,
    pageBorderBoxCenter: previousPageBorderBoxCenter,
    source: isOver,
    droppables,
    viewport
  });
  if (!destination) {
    return null;
  }
  const insideDestination = getDraggablesInsideDroppable(destination.descriptor.id, draggables);
  const moveRelativeTo = getClosestDraggable({
    pageBorderBoxCenter: previousPageBorderBoxCenter,
    viewport,
    destination,
    insideDestination,
    afterCritical
  });
  const impact = moveToNewDroppable({
    previousPageBorderBoxCenter,
    destination,
    draggable: draggable2,
    draggables,
    moveRelativeTo,
    insideDestination,
    viewport,
    afterCritical
  });
  if (!impact) {
    return null;
  }
  const pageBorderBoxCenter = getPageBorderBoxCenterFromImpact({
    impact,
    draggable: draggable2,
    droppable: destination,
    draggables,
    afterCritical
  });
  const clientSelection = getClientFromPageBorderBoxCenter({
    pageBorderBoxCenter,
    draggable: draggable2,
    viewport
  });
  return {
    clientSelection,
    impact,
    scrollJumpRequest: null
  };
};
var whatIsDraggedOver = (impact) => {
  const at = impact.at;
  if (!at) {
    return null;
  }
  if (at.type === "REORDER") {
    return at.destination.droppableId;
  }
  return at.combine.droppableId;
};
const getDroppableOver$1 = (impact, droppables) => {
  const id = whatIsDraggedOver(impact);
  return id ? droppables[id] : null;
};
var moveInDirection = ({
  state,
  type
}) => {
  const isActuallyOver = getDroppableOver$1(state.impact, state.dimensions.droppables);
  const isMainAxisMovementAllowed = Boolean(isActuallyOver);
  const home2 = state.dimensions.droppables[state.critical.droppable.id];
  const isOver = isActuallyOver || home2;
  const direction = isOver.axis.direction;
  const isMovingOnMainAxis = direction === "vertical" && (type === "MOVE_UP" || type === "MOVE_DOWN") || direction === "horizontal" && (type === "MOVE_LEFT" || type === "MOVE_RIGHT");
  if (isMovingOnMainAxis && !isMainAxisMovementAllowed) {
    return null;
  }
  const isMovingForward = type === "MOVE_DOWN" || type === "MOVE_RIGHT";
  const draggable2 = state.dimensions.draggables[state.critical.draggable.id];
  const previousPageBorderBoxCenter = state.current.page.borderBoxCenter;
  const {
    draggables,
    droppables
  } = state.dimensions;
  return isMovingOnMainAxis ? moveToNextPlace({
    isMovingForward,
    previousPageBorderBoxCenter,
    draggable: draggable2,
    destination: isOver,
    draggables,
    viewport: state.viewport,
    previousClientSelection: state.current.client.selection,
    previousImpact: state.impact,
    afterCritical: state.afterCritical
  }) : moveCrossAxis({
    isMovingForward,
    previousPageBorderBoxCenter,
    draggable: draggable2,
    isOver,
    draggables,
    droppables,
    viewport: state.viewport,
    afterCritical: state.afterCritical
  });
};
function isMovementAllowed(state) {
  return state.phase === "DRAGGING" || state.phase === "COLLECTING";
}
function isPositionInFrame(frame) {
  const isWithinVertical = isWithin(frame.top, frame.bottom);
  const isWithinHorizontal = isWithin(frame.left, frame.right);
  return function run(point) {
    return isWithinVertical(point.y) && isWithinHorizontal(point.x);
  };
}
function getHasOverlap(first, second) {
  return first.left < second.right && first.right > second.left && first.top < second.bottom && first.bottom > second.top;
}
function getFurthestAway({
  pageBorderBox,
  draggable: draggable2,
  candidates
}) {
  const startCenter = draggable2.page.borderBox.center;
  const sorted = candidates.map((candidate) => {
    const axis = candidate.axis;
    const target = patch(candidate.axis.line, pageBorderBox.center[axis.line], candidate.page.borderBox.center[axis.crossAxisLine]);
    return {
      id: candidate.descriptor.id,
      distance: distance(startCenter, target)
    };
  }).sort((a, b) => b.distance - a.distance);
  return sorted[0] ? sorted[0].id : null;
}
function getDroppableOver({
  pageBorderBox,
  draggable: draggable2,
  droppables
}) {
  const candidates = toDroppableList(droppables).filter((item) => {
    if (!item.isEnabled) {
      return false;
    }
    const active = item.subject.active;
    if (!active) {
      return false;
    }
    if (!getHasOverlap(pageBorderBox, active)) {
      return false;
    }
    if (isPositionInFrame(active)(pageBorderBox.center)) {
      return true;
    }
    const axis = item.axis;
    const childCenter = active.center[axis.crossAxisLine];
    const crossAxisStart = pageBorderBox[axis.crossAxisStart];
    const crossAxisEnd = pageBorderBox[axis.crossAxisEnd];
    const isContained = isWithin(active[axis.crossAxisStart], active[axis.crossAxisEnd]);
    const isStartContained = isContained(crossAxisStart);
    const isEndContained = isContained(crossAxisEnd);
    if (!isStartContained && !isEndContained) {
      return true;
    }
    if (isStartContained) {
      return crossAxisStart < childCenter;
    }
    return crossAxisEnd > childCenter;
  });
  if (!candidates.length) {
    return null;
  }
  if (candidates.length === 1) {
    return candidates[0].descriptor.id;
  }
  return getFurthestAway({
    pageBorderBox,
    draggable: draggable2,
    candidates
  });
}
const offsetRectByPosition = (rect, point) => getRect(offsetByPosition(rect, point));
var withDroppableScroll = (droppable2, area) => {
  const frame = droppable2.frame;
  if (!frame) {
    return area;
  }
  return offsetRectByPosition(area, frame.scroll.diff.value);
};
function getIsDisplaced({
  displaced,
  id
}) {
  return Boolean(displaced.visible[id] || displaced.invisible[id]);
}
function atIndex({
  draggable: draggable2,
  closest: closest2,
  inHomeList
}) {
  if (!closest2) {
    return null;
  }
  if (!inHomeList) {
    return closest2.descriptor.index;
  }
  if (closest2.descriptor.index > draggable2.descriptor.index) {
    return closest2.descriptor.index - 1;
  }
  return closest2.descriptor.index;
}
var getReorderImpact = ({
  pageBorderBoxWithDroppableScroll: targetRect,
  draggable: draggable2,
  destination,
  insideDestination,
  last,
  viewport,
  afterCritical
}) => {
  const axis = destination.axis;
  const displacedBy = getDisplacedBy(destination.axis, draggable2.displaceBy);
  const displacement = displacedBy.value;
  const targetStart = targetRect[axis.start];
  const targetEnd = targetRect[axis.end];
  const withoutDragging = removeDraggableFromList(draggable2, insideDestination);
  const closest2 = withoutDragging.find((child) => {
    const id = child.descriptor.id;
    const childCenter = child.page.borderBox.center[axis.line];
    const didStartAfterCritical$1 = didStartAfterCritical(id, afterCritical);
    const isDisplaced = getIsDisplaced({
      displaced: last,
      id
    });
    if (didStartAfterCritical$1) {
      if (isDisplaced) {
        return targetEnd <= childCenter;
      }
      return targetStart < childCenter - displacement;
    }
    if (isDisplaced) {
      return targetEnd <= childCenter + displacement;
    }
    return targetStart < childCenter;
  }) || null;
  const newIndex = atIndex({
    draggable: draggable2,
    closest: closest2,
    inHomeList: isHomeOf(draggable2, destination)
  });
  return calculateReorderImpact({
    draggable: draggable2,
    insideDestination,
    destination,
    viewport,
    last,
    displacedBy,
    index: newIndex
  });
};
const combineThresholdDivisor = 4;
var getCombineImpact = ({
  draggable: draggable2,
  pageBorderBoxWithDroppableScroll: targetRect,
  previousImpact,
  destination,
  insideDestination,
  afterCritical
}) => {
  if (!destination.isCombineEnabled) {
    return null;
  }
  const axis = destination.axis;
  const displacedBy = getDisplacedBy(destination.axis, draggable2.displaceBy);
  const displacement = displacedBy.value;
  const targetStart = targetRect[axis.start];
  const targetEnd = targetRect[axis.end];
  const withoutDragging = removeDraggableFromList(draggable2, insideDestination);
  const combineWith = withoutDragging.find((child) => {
    const id = child.descriptor.id;
    const childRect = child.page.borderBox;
    const childSize = childRect[axis.size];
    const threshold = childSize / combineThresholdDivisor;
    const didStartAfterCritical$1 = didStartAfterCritical(id, afterCritical);
    const isDisplaced = getIsDisplaced({
      displaced: previousImpact.displaced,
      id
    });
    if (didStartAfterCritical$1) {
      if (isDisplaced) {
        return targetEnd > childRect[axis.start] + threshold && targetEnd < childRect[axis.end] - threshold;
      }
      return targetStart > childRect[axis.start] - displacement + threshold && targetStart < childRect[axis.end] - displacement - threshold;
    }
    if (isDisplaced) {
      return targetEnd > childRect[axis.start] + displacement + threshold && targetEnd < childRect[axis.end] + displacement - threshold;
    }
    return targetStart > childRect[axis.start] + threshold && targetStart < childRect[axis.end] - threshold;
  });
  if (!combineWith) {
    return null;
  }
  const impact = {
    displacedBy,
    displaced: previousImpact.displaced,
    at: {
      type: "COMBINE",
      combine: {
        draggableId: combineWith.descriptor.id,
        droppableId: destination.descriptor.id
      }
    }
  };
  return impact;
};
var getDragImpact = ({
  pageOffset,
  draggable: draggable2,
  draggables,
  droppables,
  previousImpact,
  viewport,
  afterCritical
}) => {
  const pageBorderBox = offsetRectByPosition(draggable2.page.borderBox, pageOffset);
  const destinationId = getDroppableOver({
    pageBorderBox,
    draggable: draggable2,
    droppables
  });
  if (!destinationId) {
    return noImpact;
  }
  const destination = droppables[destinationId];
  const insideDestination = getDraggablesInsideDroppable(destination.descriptor.id, draggables);
  const pageBorderBoxWithDroppableScroll = withDroppableScroll(destination, pageBorderBox);
  return getCombineImpact({
    pageBorderBoxWithDroppableScroll,
    draggable: draggable2,
    previousImpact,
    destination,
    insideDestination,
    afterCritical
  }) || getReorderImpact({
    pageBorderBoxWithDroppableScroll,
    draggable: draggable2,
    destination,
    insideDestination,
    last: previousImpact.displaced,
    viewport,
    afterCritical
  });
};
var patchDroppableMap = (droppables, updated) => ({
  ...droppables,
  [updated.descriptor.id]: updated
});
const clearUnusedPlaceholder = ({
  previousImpact,
  impact,
  droppables
}) => {
  const last = whatIsDraggedOver(previousImpact);
  const now = whatIsDraggedOver(impact);
  if (!last) {
    return droppables;
  }
  if (last === now) {
    return droppables;
  }
  const lastDroppable = droppables[last];
  if (!lastDroppable.subject.withPlaceholder) {
    return droppables;
  }
  const updated = removePlaceholder(lastDroppable);
  return patchDroppableMap(droppables, updated);
};
var recomputePlaceholders = ({
  draggable: draggable2,
  draggables,
  droppables,
  previousImpact,
  impact
}) => {
  const cleaned = clearUnusedPlaceholder({
    previousImpact,
    impact,
    droppables
  });
  const isOver = whatIsDraggedOver(impact);
  if (!isOver) {
    return cleaned;
  }
  const droppable2 = droppables[isOver];
  if (isHomeOf(draggable2, droppable2)) {
    return cleaned;
  }
  if (droppable2.subject.withPlaceholder) {
    return cleaned;
  }
  const patched = addPlaceholder(droppable2, draggable2, draggables);
  return patchDroppableMap(cleaned, patched);
};
var update = ({
  state,
  clientSelection: forcedClientSelection,
  dimensions: forcedDimensions,
  viewport: forcedViewport,
  impact: forcedImpact,
  scrollJumpRequest
}) => {
  const viewport = forcedViewport || state.viewport;
  const dimensions = forcedDimensions || state.dimensions;
  const clientSelection = forcedClientSelection || state.current.client.selection;
  const offset22 = subtract(clientSelection, state.initial.client.selection);
  const client = {
    offset: offset22,
    selection: clientSelection,
    borderBoxCenter: add(state.initial.client.borderBoxCenter, offset22)
  };
  const page = {
    selection: add(client.selection, viewport.scroll.current),
    borderBoxCenter: add(client.borderBoxCenter, viewport.scroll.current),
    offset: add(client.offset, viewport.scroll.diff.value)
  };
  const current = {
    client,
    page
  };
  if (state.phase === "COLLECTING") {
    return {
      ...state,
      dimensions,
      viewport,
      current
    };
  }
  const draggable2 = dimensions.draggables[state.critical.draggable.id];
  const newImpact = forcedImpact || getDragImpact({
    pageOffset: page.offset,
    draggable: draggable2,
    draggables: dimensions.draggables,
    droppables: dimensions.droppables,
    previousImpact: state.impact,
    viewport,
    afterCritical: state.afterCritical
  });
  const withUpdatedPlaceholders = recomputePlaceholders({
    draggable: draggable2,
    impact: newImpact,
    previousImpact: state.impact,
    draggables: dimensions.draggables,
    droppables: dimensions.droppables
  });
  const result = {
    ...state,
    current,
    dimensions: {
      draggables: dimensions.draggables,
      droppables: withUpdatedPlaceholders
    },
    impact: newImpact,
    viewport,
    scrollJumpRequest: scrollJumpRequest || null,
    forceShouldAnimate: scrollJumpRequest ? false : null
  };
  return result;
};
function getDraggables(ids, draggables) {
  return ids.map((id) => draggables[id]);
}
var recompute = ({
  impact,
  viewport,
  draggables,
  destination,
  forceShouldAnimate
}) => {
  const last = impact.displaced;
  const afterDragging = getDraggables(last.all, draggables);
  const displaced = getDisplacementGroups({
    afterDragging,
    destination,
    displacedBy: impact.displacedBy,
    viewport: viewport.frame,
    forceShouldAnimate,
    last
  });
  return {
    ...impact,
    displaced
  };
};
var getClientBorderBoxCenter = ({
  impact,
  draggable: draggable2,
  droppable: droppable2,
  draggables,
  viewport,
  afterCritical
}) => {
  const pageBorderBoxCenter = getPageBorderBoxCenterFromImpact({
    impact,
    draggable: draggable2,
    draggables,
    droppable: droppable2,
    afterCritical
  });
  return getClientFromPageBorderBoxCenter({
    pageBorderBoxCenter,
    draggable: draggable2,
    viewport
  });
};
var refreshSnap = ({
  state,
  dimensions: forcedDimensions,
  viewport: forcedViewport
}) => {
  !(state.movementMode === "SNAP") ? invariant() : void 0;
  const needsVisibilityCheck = state.impact;
  const viewport = forcedViewport || state.viewport;
  const dimensions = forcedDimensions || state.dimensions;
  const {
    draggables,
    droppables
  } = dimensions;
  const draggable2 = draggables[state.critical.draggable.id];
  const isOver = whatIsDraggedOver(needsVisibilityCheck);
  !isOver ? invariant() : void 0;
  const destination = droppables[isOver];
  const impact = recompute({
    impact: needsVisibilityCheck,
    viewport,
    destination,
    draggables
  });
  const clientSelection = getClientBorderBoxCenter({
    impact,
    draggable: draggable2,
    droppable: destination,
    draggables,
    viewport,
    afterCritical: state.afterCritical
  });
  return update({
    impact,
    clientSelection,
    state,
    dimensions,
    viewport
  });
};
var getHomeLocation = (descriptor) => ({
  index: descriptor.index,
  droppableId: descriptor.droppableId
});
var getLiftEffect = ({
  draggable: draggable2,
  home: home2,
  draggables,
  viewport
}) => {
  const displacedBy = getDisplacedBy(home2.axis, draggable2.displaceBy);
  const insideHome = getDraggablesInsideDroppable(home2.descriptor.id, draggables);
  const rawIndex = insideHome.indexOf(draggable2);
  !(rawIndex !== -1) ? invariant() : void 0;
  const afterDragging = insideHome.slice(rawIndex + 1);
  const effected = afterDragging.reduce((previous, item) => {
    previous[item.descriptor.id] = true;
    return previous;
  }, {});
  const afterCritical = {
    inVirtualList: home2.descriptor.mode === "virtual",
    displacedBy,
    effected
  };
  const displaced = getDisplacementGroups({
    afterDragging,
    destination: home2,
    displacedBy,
    last: null,
    viewport: viewport.frame,
    forceShouldAnimate: false
  });
  const impact = {
    displaced,
    displacedBy,
    at: {
      type: "REORDER",
      destination: getHomeLocation(draggable2.descriptor)
    }
  };
  return {
    impact,
    afterCritical
  };
};
var patchDimensionMap = (dimensions, updated) => ({
  draggables: dimensions.draggables,
  droppables: patchDroppableMap(dimensions.droppables, updated)
});
var offsetDraggable = ({
  draggable: draggable2,
  offset: offset$1,
  initialWindowScroll
}) => {
  const client = offset(draggable2.client, offset$1);
  const page = withScroll(client, initialWindowScroll);
  const moved = {
    ...draggable2,
    placeholder: {
      ...draggable2.placeholder,
      client
    },
    client,
    page
  };
  return moved;
};
var getFrame = (droppable2) => {
  const frame = droppable2.frame;
  !frame ? invariant() : void 0;
  return frame;
};
var adjustAdditionsForScrollChanges = ({
  additions,
  updatedDroppables,
  viewport
}) => {
  const windowScrollChange = viewport.scroll.diff.value;
  return additions.map((draggable2) => {
    const droppableId = draggable2.descriptor.droppableId;
    const modified = updatedDroppables[droppableId];
    const frame = getFrame(modified);
    const droppableScrollChange = frame.scroll.diff.value;
    const totalChange = add(windowScrollChange, droppableScrollChange);
    const moved = offsetDraggable({
      draggable: draggable2,
      offset: totalChange,
      initialWindowScroll: viewport.scroll.initial
    });
    return moved;
  });
};
var publishWhileDraggingInVirtual = ({
  state,
  published
}) => {
  const withScrollChange = published.modified.map((update2) => {
    const existing = state.dimensions.droppables[update2.droppableId];
    const scrolled = scrollDroppable(existing, update2.scroll);
    return scrolled;
  });
  const droppables = {
    ...state.dimensions.droppables,
    ...toDroppableMap(withScrollChange)
  };
  const updatedAdditions = toDraggableMap(adjustAdditionsForScrollChanges({
    additions: published.additions,
    updatedDroppables: droppables,
    viewport: state.viewport
  }));
  const draggables = {
    ...state.dimensions.draggables,
    ...updatedAdditions
  };
  published.removals.forEach((id) => {
    delete draggables[id];
  });
  const dimensions = {
    droppables,
    draggables
  };
  const wasOverId = whatIsDraggedOver(state.impact);
  const wasOver = wasOverId ? dimensions.droppables[wasOverId] : null;
  const draggable2 = dimensions.draggables[state.critical.draggable.id];
  const home2 = dimensions.droppables[state.critical.droppable.id];
  const {
    impact: onLiftImpact,
    afterCritical
  } = getLiftEffect({
    draggable: draggable2,
    home: home2,
    draggables,
    viewport: state.viewport
  });
  const previousImpact = wasOver && wasOver.isCombineEnabled ? state.impact : onLiftImpact;
  const impact = getDragImpact({
    pageOffset: state.current.page.offset,
    draggable: dimensions.draggables[state.critical.draggable.id],
    draggables: dimensions.draggables,
    droppables: dimensions.droppables,
    previousImpact,
    viewport: state.viewport,
    afterCritical
  });
  const draggingState = {
    ...state,
    phase: "DRAGGING",
    impact,
    onLiftImpact,
    dimensions,
    afterCritical,
    forceShouldAnimate: false
  };
  if (state.phase === "COLLECTING") {
    return draggingState;
  }
  const dropPending2 = {
    ...draggingState,
    phase: "DROP_PENDING",
    reason: state.reason,
    isWaiting: false
  };
  return dropPending2;
};
const isSnapping = (state) => state.movementMode === "SNAP";
const postDroppableChange = (state, updated, isEnabledChanging) => {
  const dimensions = patchDimensionMap(state.dimensions, updated);
  if (!isSnapping(state) || isEnabledChanging) {
    return update({
      state,
      dimensions
    });
  }
  return refreshSnap({
    state,
    dimensions
  });
};
function removeScrollJumpRequest(state) {
  if (state.isDragging && state.movementMode === "SNAP") {
    return {
      ...state,
      scrollJumpRequest: null
    };
  }
  return state;
}
const idle$2 = {
  phase: "IDLE",
  completed: null,
  shouldFlush: false
};
var reducer = (state = idle$2, action) => {
  if (action.type === "FLUSH") {
    return {
      ...idle$2,
      shouldFlush: true
    };
  }
  if (action.type === "INITIAL_PUBLISH") {
    !(state.phase === "IDLE") ? invariant() : void 0;
    const {
      critical,
      clientSelection,
      viewport,
      dimensions,
      movementMode
    } = action.payload;
    const draggable2 = dimensions.draggables[critical.draggable.id];
    const home2 = dimensions.droppables[critical.droppable.id];
    const client = {
      selection: clientSelection,
      borderBoxCenter: draggable2.client.borderBox.center,
      offset: origin
    };
    const initial = {
      client,
      page: {
        selection: add(client.selection, viewport.scroll.initial),
        borderBoxCenter: add(client.selection, viewport.scroll.initial),
        offset: add(client.selection, viewport.scroll.diff.value)
      }
    };
    const isWindowScrollAllowed = toDroppableList(dimensions.droppables).every((item) => !item.isFixedOnPage);
    const {
      impact,
      afterCritical
    } = getLiftEffect({
      draggable: draggable2,
      home: home2,
      draggables: dimensions.draggables,
      viewport
    });
    const result = {
      phase: "DRAGGING",
      isDragging: true,
      critical,
      movementMode,
      dimensions,
      initial,
      current: initial,
      isWindowScrollAllowed,
      impact,
      afterCritical,
      onLiftImpact: impact,
      viewport,
      scrollJumpRequest: null,
      forceShouldAnimate: null
    };
    return result;
  }
  if (action.type === "COLLECTION_STARTING") {
    if (state.phase === "COLLECTING" || state.phase === "DROP_PENDING") {
      return state;
    }
    !(state.phase === "DRAGGING") ? invariant() : void 0;
    const result = {
      ...state,
      phase: "COLLECTING"
    };
    return result;
  }
  if (action.type === "PUBLISH_WHILE_DRAGGING") {
    !(state.phase === "COLLECTING" || state.phase === "DROP_PENDING") ? invariant() : void 0;
    return publishWhileDraggingInVirtual({
      state,
      published: action.payload
    });
  }
  if (action.type === "MOVE") {
    if (state.phase === "DROP_PENDING") {
      return state;
    }
    !isMovementAllowed(state) ? invariant() : void 0;
    const {
      client: clientSelection
    } = action.payload;
    if (isEqual$1(clientSelection, state.current.client.selection)) {
      return state;
    }
    return update({
      state,
      clientSelection,
      impact: isSnapping(state) ? state.impact : null
    });
  }
  if (action.type === "UPDATE_DROPPABLE_SCROLL") {
    if (state.phase === "DROP_PENDING") {
      return removeScrollJumpRequest(state);
    }
    if (state.phase === "COLLECTING") {
      return removeScrollJumpRequest(state);
    }
    !isMovementAllowed(state) ? invariant() : void 0;
    const {
      id,
      newScroll
    } = action.payload;
    const target = state.dimensions.droppables[id];
    if (!target) {
      return state;
    }
    const scrolled = scrollDroppable(target, newScroll);
    return postDroppableChange(state, scrolled, false);
  }
  if (action.type === "UPDATE_DROPPABLE_IS_ENABLED") {
    if (state.phase === "DROP_PENDING") {
      return state;
    }
    !isMovementAllowed(state) ? invariant() : void 0;
    const {
      id,
      isEnabled
    } = action.payload;
    const target = state.dimensions.droppables[id];
    !target ? invariant() : void 0;
    !(target.isEnabled !== isEnabled) ? invariant() : void 0;
    const updated = {
      ...target,
      isEnabled
    };
    return postDroppableChange(state, updated, true);
  }
  if (action.type === "UPDATE_DROPPABLE_IS_COMBINE_ENABLED") {
    if (state.phase === "DROP_PENDING") {
      return state;
    }
    !isMovementAllowed(state) ? invariant() : void 0;
    const {
      id,
      isCombineEnabled
    } = action.payload;
    const target = state.dimensions.droppables[id];
    !target ? invariant() : void 0;
    !(target.isCombineEnabled !== isCombineEnabled) ? invariant() : void 0;
    const updated = {
      ...target,
      isCombineEnabled
    };
    return postDroppableChange(state, updated, true);
  }
  if (action.type === "MOVE_BY_WINDOW_SCROLL") {
    if (state.phase === "DROP_PENDING" || state.phase === "DROP_ANIMATING") {
      return state;
    }
    !isMovementAllowed(state) ? invariant() : void 0;
    !state.isWindowScrollAllowed ? invariant() : void 0;
    const newScroll = action.payload.newScroll;
    if (isEqual$1(state.viewport.scroll.current, newScroll)) {
      return removeScrollJumpRequest(state);
    }
    const viewport = scrollViewport(state.viewport, newScroll);
    if (isSnapping(state)) {
      return refreshSnap({
        state,
        viewport
      });
    }
    return update({
      state,
      viewport
    });
  }
  if (action.type === "UPDATE_VIEWPORT_MAX_SCROLL") {
    if (!isMovementAllowed(state)) {
      return state;
    }
    const maxScroll = action.payload.maxScroll;
    if (isEqual$1(maxScroll, state.viewport.scroll.max)) {
      return state;
    }
    const withMaxScroll2 = {
      ...state.viewport,
      scroll: {
        ...state.viewport.scroll,
        max: maxScroll
      }
    };
    return {
      ...state,
      viewport: withMaxScroll2
    };
  }
  if (action.type === "MOVE_UP" || action.type === "MOVE_DOWN" || action.type === "MOVE_LEFT" || action.type === "MOVE_RIGHT") {
    if (state.phase === "COLLECTING" || state.phase === "DROP_PENDING") {
      return state;
    }
    !(state.phase === "DRAGGING") ? invariant() : void 0;
    const result = moveInDirection({
      state,
      type: action.type
    });
    if (!result) {
      return state;
    }
    return update({
      state,
      impact: result.impact,
      clientSelection: result.clientSelection,
      scrollJumpRequest: result.scrollJumpRequest
    });
  }
  if (action.type === "DROP_PENDING") {
    const reason = action.payload.reason;
    !(state.phase === "COLLECTING") ? invariant() : void 0;
    const newState = {
      ...state,
      phase: "DROP_PENDING",
      isWaiting: true,
      reason
    };
    return newState;
  }
  if (action.type === "DROP_ANIMATE") {
    const {
      completed,
      dropDuration,
      newHomeClientOffset
    } = action.payload;
    !(state.phase === "DRAGGING" || state.phase === "DROP_PENDING") ? invariant() : void 0;
    const result = {
      phase: "DROP_ANIMATING",
      completed,
      dropDuration,
      newHomeClientOffset,
      dimensions: state.dimensions
    };
    return result;
  }
  if (action.type === "DROP_COMPLETE") {
    const {
      completed
    } = action.payload;
    return {
      phase: "IDLE",
      completed,
      shouldFlush: false
    };
  }
  return state;
};
function guard(action, predicate) {
  return action instanceof Object && "type" in action && action.type === predicate;
}
const beforeInitialCapture = (args) => ({
  type: "BEFORE_INITIAL_CAPTURE",
  payload: args
});
const lift$1 = (args) => ({
  type: "LIFT",
  payload: args
});
const initialPublish = (args) => ({
  type: "INITIAL_PUBLISH",
  payload: args
});
const publishWhileDragging = (args) => ({
  type: "PUBLISH_WHILE_DRAGGING",
  payload: args
});
const collectionStarting = () => ({
  type: "COLLECTION_STARTING",
  payload: null
});
const updateDroppableScroll = (args) => ({
  type: "UPDATE_DROPPABLE_SCROLL",
  payload: args
});
const updateDroppableIsEnabled = (args) => ({
  type: "UPDATE_DROPPABLE_IS_ENABLED",
  payload: args
});
const updateDroppableIsCombineEnabled = (args) => ({
  type: "UPDATE_DROPPABLE_IS_COMBINE_ENABLED",
  payload: args
});
const move = (args) => ({
  type: "MOVE",
  payload: args
});
const moveByWindowScroll = (args) => ({
  type: "MOVE_BY_WINDOW_SCROLL",
  payload: args
});
const updateViewportMaxScroll = (args) => ({
  type: "UPDATE_VIEWPORT_MAX_SCROLL",
  payload: args
});
const moveUp = () => ({
  type: "MOVE_UP",
  payload: null
});
const moveDown = () => ({
  type: "MOVE_DOWN",
  payload: null
});
const moveRight = () => ({
  type: "MOVE_RIGHT",
  payload: null
});
const moveLeft = () => ({
  type: "MOVE_LEFT",
  payload: null
});
const flush = () => ({
  type: "FLUSH",
  payload: null
});
const animateDrop = (args) => ({
  type: "DROP_ANIMATE",
  payload: args
});
const completeDrop = (args) => ({
  type: "DROP_COMPLETE",
  payload: args
});
const drop = (args) => ({
  type: "DROP",
  payload: args
});
const dropPending = (args) => ({
  type: "DROP_PENDING",
  payload: args
});
const dropAnimationFinished = () => ({
  type: "DROP_ANIMATION_FINISHED",
  payload: null
});
var lift = (marshal) => ({
  getState,
  dispatch
}) => (next) => (action) => {
  if (!guard(action, "LIFT")) {
    next(action);
    return;
  }
  const {
    id,
    clientSelection,
    movementMode
  } = action.payload;
  const initial = getState();
  if (initial.phase === "DROP_ANIMATING") {
    dispatch(completeDrop({
      completed: initial.completed
    }));
  }
  !(getState().phase === "IDLE") ? invariant() : void 0;
  dispatch(flush());
  dispatch(beforeInitialCapture({
    draggableId: id,
    movementMode
  }));
  const scrollOptions = {
    shouldPublishImmediately: movementMode === "SNAP"
  };
  const request = {
    draggableId: id,
    scrollOptions
  };
  const {
    critical,
    dimensions,
    viewport
  } = marshal.startPublishing(request);
  dispatch(initialPublish({
    critical,
    dimensions,
    clientSelection,
    movementMode,
    viewport
  }));
};
var style = (marshal) => () => (next) => (action) => {
  if (guard(action, "INITIAL_PUBLISH")) {
    marshal.dragging();
  }
  if (guard(action, "DROP_ANIMATE")) {
    marshal.dropping(action.payload.completed.result.reason);
  }
  if (guard(action, "FLUSH") || guard(action, "DROP_COMPLETE")) {
    marshal.resting();
  }
  next(action);
};
const curves = {
  outOfTheWay: "cubic-bezier(0.2, 0, 0, 1)",
  drop: "cubic-bezier(.2,1,.1,1)"
};
const combine = {
  opacity: {
    drop: 0,
    combining: 0.7
  },
  scale: {
    drop: 0.75
  }
};
const timings = {
  outOfTheWay: 0.2,
  minDropTime: 0.33,
  maxDropTime: 0.55
};
const outOfTheWayTiming = `${timings.outOfTheWay}s ${curves.outOfTheWay}`;
const transitions = {
  fluid: `opacity ${outOfTheWayTiming}`,
  snap: `transform ${outOfTheWayTiming}, opacity ${outOfTheWayTiming}`,
  drop: (duration) => {
    const timing = `${duration}s ${curves.drop}`;
    return `transform ${timing}, opacity ${timing}`;
  },
  outOfTheWay: `transform ${outOfTheWayTiming}`,
  placeholder: `height ${outOfTheWayTiming}, width ${outOfTheWayTiming}, margin ${outOfTheWayTiming}`
};
const moveTo = (offset22) => isEqual$1(offset22, origin) ? void 0 : `translate(${offset22.x}px, ${offset22.y}px)`;
const transforms = {
  moveTo,
  drop: (offset22, isCombining) => {
    const translate = moveTo(offset22);
    if (!translate) {
      return void 0;
    }
    if (!isCombining) {
      return translate;
    }
    return `${translate} scale(${combine.scale.drop})`;
  }
};
const {
  minDropTime,
  maxDropTime
} = timings;
const dropTimeRange = maxDropTime - minDropTime;
const maxDropTimeAtDistance = 1500;
const cancelDropModifier = 0.6;
var getDropDuration = ({
  current,
  destination,
  reason
}) => {
  const distance$1 = distance(current, destination);
  if (distance$1 <= 0) {
    return minDropTime;
  }
  if (distance$1 >= maxDropTimeAtDistance) {
    return maxDropTime;
  }
  const percentage = distance$1 / maxDropTimeAtDistance;
  const duration = minDropTime + dropTimeRange * percentage;
  const withDuration = reason === "CANCEL" ? duration * cancelDropModifier : duration;
  return Number(withDuration.toFixed(2));
};
var getNewHomeClientOffset = ({
  impact,
  draggable: draggable2,
  dimensions,
  viewport,
  afterCritical
}) => {
  const {
    draggables,
    droppables
  } = dimensions;
  const droppableId = whatIsDraggedOver(impact);
  const destination = droppableId ? droppables[droppableId] : null;
  const home2 = droppables[draggable2.descriptor.droppableId];
  const newClientCenter = getClientBorderBoxCenter({
    impact,
    draggable: draggable2,
    draggables,
    afterCritical,
    droppable: destination || home2,
    viewport
  });
  const offset22 = subtract(newClientCenter, draggable2.client.borderBox.center);
  return offset22;
};
var getDropImpact = ({
  draggables,
  reason,
  lastImpact,
  home: home2,
  viewport,
  onLiftImpact
}) => {
  if (!lastImpact.at || reason !== "DROP") {
    const recomputedHomeImpact = recompute({
      draggables,
      impact: onLiftImpact,
      destination: home2,
      viewport,
      forceShouldAnimate: true
    });
    return {
      impact: recomputedHomeImpact,
      didDropInsideDroppable: false
    };
  }
  if (lastImpact.at.type === "REORDER") {
    return {
      impact: lastImpact,
      didDropInsideDroppable: true
    };
  }
  const withoutMovement = {
    ...lastImpact,
    displaced: emptyGroups
  };
  return {
    impact: withoutMovement,
    didDropInsideDroppable: true
  };
};
const dropMiddleware = ({
  getState,
  dispatch
}) => (next) => (action) => {
  if (!guard(action, "DROP")) {
    next(action);
    return;
  }
  const state = getState();
  const reason = action.payload.reason;
  if (state.phase === "COLLECTING") {
    dispatch(dropPending({
      reason
    }));
    return;
  }
  if (state.phase === "IDLE") {
    return;
  }
  const isWaitingForDrop = state.phase === "DROP_PENDING" && state.isWaiting;
  !!isWaitingForDrop ? invariant() : void 0;
  !(state.phase === "DRAGGING" || state.phase === "DROP_PENDING") ? invariant() : void 0;
  const critical = state.critical;
  const dimensions = state.dimensions;
  const draggable2 = dimensions.draggables[state.critical.draggable.id];
  const {
    impact,
    didDropInsideDroppable
  } = getDropImpact({
    reason,
    lastImpact: state.impact,
    afterCritical: state.afterCritical,
    onLiftImpact: state.onLiftImpact,
    home: state.dimensions.droppables[state.critical.droppable.id],
    viewport: state.viewport,
    draggables: state.dimensions.draggables
  });
  const destination = didDropInsideDroppable ? tryGetDestination(impact) : null;
  const combine2 = didDropInsideDroppable ? tryGetCombine(impact) : null;
  const source = {
    index: critical.draggable.index,
    droppableId: critical.droppable.id
  };
  const result = {
    draggableId: draggable2.descriptor.id,
    type: draggable2.descriptor.type,
    source,
    reason,
    mode: state.movementMode,
    destination,
    combine: combine2
  };
  const newHomeClientOffset = getNewHomeClientOffset({
    impact,
    draggable: draggable2,
    dimensions,
    viewport: state.viewport,
    afterCritical: state.afterCritical
  });
  const completed = {
    critical: state.critical,
    afterCritical: state.afterCritical,
    result,
    impact
  };
  const isAnimationRequired = !isEqual$1(state.current.client.offset, newHomeClientOffset) || Boolean(result.combine);
  if (!isAnimationRequired) {
    dispatch(completeDrop({
      completed
    }));
    return;
  }
  const dropDuration = getDropDuration({
    current: state.current.client.offset,
    destination: newHomeClientOffset,
    reason
  });
  const args = {
    newHomeClientOffset,
    dropDuration,
    completed
  };
  dispatch(animateDrop(args));
};
var getWindowScroll = () => ({
  x: window.pageXOffset,
  y: window.pageYOffset
});
function getWindowScrollBinding(update2) {
  return {
    eventName: "scroll",
    options: {
      passive: true,
      capture: false
    },
    fn: (event) => {
      if (event.target !== window && event.target !== window.document) {
        return;
      }
      update2();
    }
  };
}
function getScrollListener({
  onWindowScroll
}) {
  function updateScroll() {
    onWindowScroll(getWindowScroll());
  }
  const scheduled = rafSchd(updateScroll);
  const binding = getWindowScrollBinding(scheduled);
  let unbind = noop$2;
  function isActive2() {
    return unbind !== noop$2;
  }
  function start2() {
    !!isActive2() ? invariant() : void 0;
    unbind = bindEvents(window, [binding]);
  }
  function stop() {
    !isActive2() ? invariant() : void 0;
    scheduled.cancel();
    unbind();
    unbind = noop$2;
  }
  return {
    start: start2,
    stop,
    isActive: isActive2
  };
}
const shouldStop$1 = (action) => guard(action, "DROP_COMPLETE") || guard(action, "DROP_ANIMATE") || guard(action, "FLUSH");
const scrollListener = (store) => {
  const listener = getScrollListener({
    onWindowScroll: (newScroll) => {
      store.dispatch(moveByWindowScroll({
        newScroll
      }));
    }
  });
  return (next) => (action) => {
    if (!listener.isActive() && guard(action, "INITIAL_PUBLISH")) {
      listener.start();
    }
    if (listener.isActive() && shouldStop$1(action)) {
      listener.stop();
    }
    next(action);
  };
};
var getExpiringAnnounce = (announce) => {
  let wasCalled = false;
  let isExpired = false;
  const timeoutId = setTimeout(() => {
    isExpired = true;
  });
  const result = (message) => {
    if (wasCalled) {
      return;
    }
    if (isExpired) {
      return;
    }
    wasCalled = true;
    announce(message);
    clearTimeout(timeoutId);
  };
  result.wasCalled = () => wasCalled;
  return result;
};
var getAsyncMarshal = () => {
  const entries = [];
  const execute2 = (timerId) => {
    const index = entries.findIndex((item) => item.timerId === timerId);
    !(index !== -1) ? invariant() : void 0;
    const [entry] = entries.splice(index, 1);
    entry.callback();
  };
  const add2 = (fn) => {
    const timerId = setTimeout(() => execute2(timerId));
    const entry = {
      timerId,
      callback: fn
    };
    entries.push(entry);
  };
  const flush2 = () => {
    if (!entries.length) {
      return;
    }
    const shallow = [...entries];
    entries.length = 0;
    shallow.forEach((entry) => {
      clearTimeout(entry.timerId);
      entry.callback();
    });
  };
  return {
    add: add2,
    flush: flush2
  };
};
const areLocationsEqual = (first, second) => {
  if (first == null && second == null) {
    return true;
  }
  if (first == null || second == null) {
    return false;
  }
  return first.droppableId === second.droppableId && first.index === second.index;
};
const isCombineEqual = (first, second) => {
  if (first == null && second == null) {
    return true;
  }
  if (first == null || second == null) {
    return false;
  }
  return first.draggableId === second.draggableId && first.droppableId === second.droppableId;
};
const isCriticalEqual = (first, second) => {
  if (first === second) {
    return true;
  }
  const isDraggableEqual = first.draggable.id === second.draggable.id && first.draggable.droppableId === second.draggable.droppableId && first.draggable.type === second.draggable.type && first.draggable.index === second.draggable.index;
  const isDroppableEqual = first.droppable.id === second.droppable.id && first.droppable.type === second.droppable.type;
  return isDraggableEqual && isDroppableEqual;
};
const withTimings = (key, fn) => {
  fn();
};
const getDragStart = (critical, mode) => ({
  draggableId: critical.draggable.id,
  type: critical.droppable.type,
  source: {
    droppableId: critical.droppable.id,
    index: critical.draggable.index
  },
  mode
});
function execute(responder, data, announce, getDefaultMessage) {
  if (!responder) {
    announce(getDefaultMessage(data));
    return;
  }
  const willExpire = getExpiringAnnounce(announce);
  const provided = {
    announce: willExpire
  };
  responder(data, provided);
  if (!willExpire.wasCalled()) {
    announce(getDefaultMessage(data));
  }
}
var getPublisher = (getResponders, announce) => {
  const asyncMarshal = getAsyncMarshal();
  let dragging = null;
  const beforeCapture = (draggableId, mode) => {
    !!dragging ? invariant() : void 0;
    withTimings("onBeforeCapture", () => {
      const fn = getResponders().onBeforeCapture;
      if (fn) {
        const before = {
          draggableId,
          mode
        };
        fn(before);
      }
    });
  };
  const beforeStart = (critical, mode) => {
    !!dragging ? invariant() : void 0;
    withTimings("onBeforeDragStart", () => {
      const fn = getResponders().onBeforeDragStart;
      if (fn) {
        fn(getDragStart(critical, mode));
      }
    });
  };
  const start2 = (critical, mode) => {
    !!dragging ? invariant() : void 0;
    const data = getDragStart(critical, mode);
    dragging = {
      mode,
      lastCritical: critical,
      lastLocation: data.source,
      lastCombine: null
    };
    asyncMarshal.add(() => {
      withTimings("onDragStart", () => execute(getResponders().onDragStart, data, announce, preset.onDragStart));
    });
  };
  const update2 = (critical, impact) => {
    const location = tryGetDestination(impact);
    const combine2 = tryGetCombine(impact);
    !dragging ? invariant() : void 0;
    const hasCriticalChanged = !isCriticalEqual(critical, dragging.lastCritical);
    if (hasCriticalChanged) {
      dragging.lastCritical = critical;
    }
    const hasLocationChanged = !areLocationsEqual(dragging.lastLocation, location);
    if (hasLocationChanged) {
      dragging.lastLocation = location;
    }
    const hasGroupingChanged = !isCombineEqual(dragging.lastCombine, combine2);
    if (hasGroupingChanged) {
      dragging.lastCombine = combine2;
    }
    if (!hasCriticalChanged && !hasLocationChanged && !hasGroupingChanged) {
      return;
    }
    const data = {
      ...getDragStart(critical, dragging.mode),
      combine: combine2,
      destination: location
    };
    asyncMarshal.add(() => {
      withTimings("onDragUpdate", () => execute(getResponders().onDragUpdate, data, announce, preset.onDragUpdate));
    });
  };
  const flush2 = () => {
    !dragging ? invariant() : void 0;
    asyncMarshal.flush();
  };
  const drop2 = (result) => {
    !dragging ? invariant() : void 0;
    dragging = null;
    withTimings("onDragEnd", () => execute(getResponders().onDragEnd, result, announce, preset.onDragEnd));
  };
  const abort = () => {
    if (!dragging) {
      return;
    }
    const result = {
      ...getDragStart(dragging.lastCritical, dragging.mode),
      combine: null,
      destination: null,
      reason: "CANCEL"
    };
    drop2(result);
  };
  return {
    beforeCapture,
    beforeStart,
    start: start2,
    update: update2,
    flush: flush2,
    drop: drop2,
    abort
  };
};
var responders = (getResponders, announce) => {
  const publisher = getPublisher(getResponders, announce);
  return (store) => (next) => (action) => {
    if (guard(action, "BEFORE_INITIAL_CAPTURE")) {
      publisher.beforeCapture(action.payload.draggableId, action.payload.movementMode);
      return;
    }
    if (guard(action, "INITIAL_PUBLISH")) {
      const critical = action.payload.critical;
      publisher.beforeStart(critical, action.payload.movementMode);
      next(action);
      publisher.start(critical, action.payload.movementMode);
      return;
    }
    if (guard(action, "DROP_COMPLETE")) {
      const result = action.payload.completed.result;
      publisher.flush();
      next(action);
      publisher.drop(result);
      return;
    }
    next(action);
    if (guard(action, "FLUSH")) {
      publisher.abort();
      return;
    }
    const state = store.getState();
    if (state.phase === "DRAGGING") {
      publisher.update(state.critical, state.impact);
    }
  };
};
const dropAnimationFinishMiddleware = (store) => (next) => (action) => {
  if (!guard(action, "DROP_ANIMATION_FINISHED")) {
    next(action);
    return;
  }
  const state = store.getState();
  !(state.phase === "DROP_ANIMATING") ? invariant() : void 0;
  store.dispatch(completeDrop({
    completed: state.completed
  }));
};
const dropAnimationFlushOnScrollMiddleware = (store) => {
  let unbind = null;
  let frameId = null;
  function clear() {
    if (frameId) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }
    if (unbind) {
      unbind();
      unbind = null;
    }
  }
  return (next) => (action) => {
    if (guard(action, "FLUSH") || guard(action, "DROP_COMPLETE") || guard(action, "DROP_ANIMATION_FINISHED")) {
      clear();
    }
    next(action);
    if (!guard(action, "DROP_ANIMATE")) {
      return;
    }
    const binding = {
      eventName: "scroll",
      options: {
        capture: true,
        passive: false,
        once: true
      },
      fn: function flushDropAnimation() {
        const state = store.getState();
        if (state.phase === "DROP_ANIMATING") {
          store.dispatch(dropAnimationFinished());
        }
      }
    };
    frameId = requestAnimationFrame(() => {
      frameId = null;
      unbind = bindEvents(window, [binding]);
    });
  };
};
var dimensionMarshalStopper = (marshal) => () => (next) => (action) => {
  if (guard(action, "DROP_COMPLETE") || guard(action, "FLUSH") || guard(action, "DROP_ANIMATE")) {
    marshal.stopPublishing();
  }
  next(action);
};
var focus = (marshal) => {
  let isWatching = false;
  return () => (next) => (action) => {
    if (guard(action, "INITIAL_PUBLISH")) {
      isWatching = true;
      marshal.tryRecordFocus(action.payload.critical.draggable.id);
      next(action);
      marshal.tryRestoreFocusRecorded();
      return;
    }
    next(action);
    if (!isWatching) {
      return;
    }
    if (guard(action, "FLUSH")) {
      isWatching = false;
      marshal.tryRestoreFocusRecorded();
      return;
    }
    if (guard(action, "DROP_COMPLETE")) {
      isWatching = false;
      const result = action.payload.completed.result;
      if (result.combine) {
        marshal.tryShiftRecord(result.draggableId, result.combine.draggableId);
      }
      marshal.tryRestoreFocusRecorded();
    }
  };
};
const shouldStop = (action) => guard(action, "DROP_COMPLETE") || guard(action, "DROP_ANIMATE") || guard(action, "FLUSH");
var autoScroll = (autoScroller) => (store) => (next) => (action) => {
  if (shouldStop(action)) {
    autoScroller.stop();
    next(action);
    return;
  }
  if (guard(action, "INITIAL_PUBLISH")) {
    next(action);
    const state = store.getState();
    !(state.phase === "DRAGGING") ? invariant() : void 0;
    autoScroller.start(state);
    return;
  }
  next(action);
  autoScroller.scroll(store.getState());
};
const pendingDrop = (store) => (next) => (action) => {
  next(action);
  if (!guard(action, "PUBLISH_WHILE_DRAGGING")) {
    return;
  }
  const postActionState = store.getState();
  if (postActionState.phase !== "DROP_PENDING") {
    return;
  }
  if (postActionState.isWaiting) {
    return;
  }
  store.dispatch(drop({
    reason: postActionState.reason
  }));
};
const composeEnhancers = compose;
var createStore = ({
  dimensionMarshal,
  focusMarshal,
  styleMarshal,
  getResponders,
  announce,
  autoScroller
}) => createStore$1(reducer, composeEnhancers(applyMiddleware(style(styleMarshal), dimensionMarshalStopper(dimensionMarshal), lift(dimensionMarshal), dropMiddleware, dropAnimationFinishMiddleware, dropAnimationFlushOnScrollMiddleware, pendingDrop, autoScroll(autoScroller), scrollListener, focus(focusMarshal), responders(getResponders, announce))));
const clean$1 = () => ({
  additions: {},
  removals: {},
  modified: {}
});
function createPublisher({
  registry,
  callbacks
}) {
  let staging = clean$1();
  let frameId = null;
  const collect = () => {
    if (frameId) {
      return;
    }
    callbacks.collectionStarting();
    frameId = requestAnimationFrame(() => {
      frameId = null;
      const {
        additions,
        removals,
        modified
      } = staging;
      const added = Object.keys(additions).map((id) => registry.draggable.getById(id).getDimension(origin)).sort((a, b) => a.descriptor.index - b.descriptor.index);
      const updated = Object.keys(modified).map((id) => {
        const entry = registry.droppable.getById(id);
        const scroll2 = entry.callbacks.getScrollWhileDragging();
        return {
          droppableId: id,
          scroll: scroll2
        };
      });
      const result = {
        additions: added,
        removals: Object.keys(removals),
        modified: updated
      };
      staging = clean$1();
      callbacks.publish(result);
    });
  };
  const add2 = (entry) => {
    const id = entry.descriptor.id;
    staging.additions[id] = entry;
    staging.modified[entry.descriptor.droppableId] = true;
    if (staging.removals[id]) {
      delete staging.removals[id];
    }
    collect();
  };
  const remove = (entry) => {
    const descriptor = entry.descriptor;
    staging.removals[descriptor.id] = true;
    staging.modified[descriptor.droppableId] = true;
    if (staging.additions[descriptor.id]) {
      delete staging.additions[descriptor.id];
    }
    collect();
  };
  const stop = () => {
    if (!frameId) {
      return;
    }
    cancelAnimationFrame(frameId);
    frameId = null;
    staging = clean$1();
  };
  return {
    add: add2,
    remove,
    stop
  };
}
var getMaxScroll = ({
  scrollHeight,
  scrollWidth,
  height,
  width
}) => {
  const maxScroll = subtract({
    x: scrollWidth,
    y: scrollHeight
  }, {
    x: width,
    y: height
  });
  const adjustedMaxScroll = {
    x: Math.max(0, maxScroll.x),
    y: Math.max(0, maxScroll.y)
  };
  return adjustedMaxScroll;
};
var getDocumentElement = () => {
  const doc = document.documentElement;
  !doc ? invariant() : void 0;
  return doc;
};
var getMaxWindowScroll = () => {
  const doc = getDocumentElement();
  const maxScroll = getMaxScroll({
    scrollHeight: doc.scrollHeight,
    scrollWidth: doc.scrollWidth,
    width: doc.clientWidth,
    height: doc.clientHeight
  });
  return maxScroll;
};
var getViewport = () => {
  const scroll2 = getWindowScroll();
  const maxScroll = getMaxWindowScroll();
  const top = scroll2.y;
  const left = scroll2.x;
  const doc = getDocumentElement();
  const width = doc.clientWidth;
  const height = doc.clientHeight;
  const right = left + width;
  const bottom = top + height;
  const frame = getRect({
    top,
    left,
    right,
    bottom
  });
  const viewport = {
    frame,
    scroll: {
      initial: scroll2,
      current: scroll2,
      max: maxScroll,
      diff: {
        value: origin,
        displacement: origin
      }
    }
  };
  return viewport;
};
var getInitialPublish = ({
  critical,
  scrollOptions,
  registry
}) => {
  const viewport = getViewport();
  const windowScroll = viewport.scroll.current;
  const home2 = critical.droppable;
  const droppables = registry.droppable.getAllByType(home2.type).map((entry) => entry.callbacks.getDimensionAndWatchScroll(windowScroll, scrollOptions));
  const draggables = registry.draggable.getAllByType(critical.draggable.type).map((entry) => entry.getDimension(windowScroll));
  const dimensions = {
    draggables: toDraggableMap(draggables),
    droppables: toDroppableMap(droppables)
  };
  const result = {
    dimensions,
    critical,
    viewport
  };
  return result;
};
function shouldPublishUpdate(registry, dragging, entry) {
  if (entry.descriptor.id === dragging.id) {
    return false;
  }
  if (entry.descriptor.type !== dragging.type) {
    return false;
  }
  const home2 = registry.droppable.getById(entry.descriptor.droppableId);
  if (home2.descriptor.mode !== "virtual") {
    return false;
  }
  return true;
}
var createDimensionMarshal = (registry, callbacks) => {
  let collection = null;
  const publisher = createPublisher({
    callbacks: {
      publish: callbacks.publishWhileDragging,
      collectionStarting: callbacks.collectionStarting
    },
    registry
  });
  const updateDroppableIsEnabled2 = (id, isEnabled) => {
    !registry.droppable.exists(id) ? invariant() : void 0;
    if (!collection) {
      return;
    }
    callbacks.updateDroppableIsEnabled({
      id,
      isEnabled
    });
  };
  const updateDroppableIsCombineEnabled2 = (id, isCombineEnabled) => {
    if (!collection) {
      return;
    }
    !registry.droppable.exists(id) ? invariant() : void 0;
    callbacks.updateDroppableIsCombineEnabled({
      id,
      isCombineEnabled
    });
  };
  const updateDroppableScroll2 = (id, newScroll) => {
    if (!collection) {
      return;
    }
    !registry.droppable.exists(id) ? invariant() : void 0;
    callbacks.updateDroppableScroll({
      id,
      newScroll
    });
  };
  const scrollDroppable2 = (id, change) => {
    if (!collection) {
      return;
    }
    registry.droppable.getById(id).callbacks.scroll(change);
  };
  const stopPublishing = () => {
    if (!collection) {
      return;
    }
    publisher.stop();
    const home2 = collection.critical.droppable;
    registry.droppable.getAllByType(home2.type).forEach((entry) => entry.callbacks.dragStopped());
    collection.unsubscribe();
    collection = null;
  };
  const subscriber = (event) => {
    !collection ? invariant() : void 0;
    const dragging = collection.critical.draggable;
    if (event.type === "ADDITION") {
      if (shouldPublishUpdate(registry, dragging, event.value)) {
        publisher.add(event.value);
      }
    }
    if (event.type === "REMOVAL") {
      if (shouldPublishUpdate(registry, dragging, event.value)) {
        publisher.remove(event.value);
      }
    }
  };
  const startPublishing = (request) => {
    !!collection ? invariant() : void 0;
    const entry = registry.draggable.getById(request.draggableId);
    const home2 = registry.droppable.getById(entry.descriptor.droppableId);
    const critical = {
      draggable: entry.descriptor,
      droppable: home2.descriptor
    };
    const unsubscribe = registry.subscribe(subscriber);
    collection = {
      critical,
      unsubscribe
    };
    return getInitialPublish({
      critical,
      registry,
      scrollOptions: request.scrollOptions
    });
  };
  const marshal = {
    updateDroppableIsEnabled: updateDroppableIsEnabled2,
    updateDroppableIsCombineEnabled: updateDroppableIsCombineEnabled2,
    scrollDroppable: scrollDroppable2,
    updateDroppableScroll: updateDroppableScroll2,
    startPublishing,
    stopPublishing
  };
  return marshal;
};
var canStartDrag = (state, id) => {
  if (state.phase === "IDLE") {
    return true;
  }
  if (state.phase !== "DROP_ANIMATING") {
    return false;
  }
  if (state.completed.result.draggableId === id) {
    return false;
  }
  return state.completed.result.reason === "DROP";
};
var scrollWindow = (change) => {
  window.scrollBy(change.x, change.y);
};
const getScrollableDroppables = memoizeOne((droppables) => toDroppableList(droppables).filter((droppable2) => {
  if (!droppable2.isEnabled) {
    return false;
  }
  if (!droppable2.frame) {
    return false;
  }
  return true;
}));
const getScrollableDroppableOver = (target, droppables) => {
  const maybe = getScrollableDroppables(droppables).find((droppable2) => {
    !droppable2.frame ? invariant() : void 0;
    return isPositionInFrame(droppable2.frame.pageMarginBox)(target);
  }) || null;
  return maybe;
};
var getBestScrollableDroppable = ({
  center,
  destination,
  droppables
}) => {
  if (destination) {
    const dimension2 = droppables[destination];
    if (!dimension2.frame) {
      return null;
    }
    return dimension2;
  }
  const dimension = getScrollableDroppableOver(center, droppables);
  return dimension;
};
const defaultAutoScrollerOptions = {
  startFromPercentage: 0.25,
  maxScrollAtPercentage: 0.05,
  maxPixelScroll: 28,
  ease: (percentage) => percentage ** 2,
  durationDampening: {
    stopDampeningAt: 1200,
    accelerateAt: 360
  },
  disabled: false
};
var getDistanceThresholds = (container, axis, getAutoScrollerOptions = () => defaultAutoScrollerOptions) => {
  const autoScrollerOptions = getAutoScrollerOptions();
  const startScrollingFrom = container[axis.size] * autoScrollerOptions.startFromPercentage;
  const maxScrollValueAt = container[axis.size] * autoScrollerOptions.maxScrollAtPercentage;
  const thresholds = {
    startScrollingFrom,
    maxScrollValueAt
  };
  return thresholds;
};
var getPercentage = ({
  startOfRange,
  endOfRange,
  current
}) => {
  const range = endOfRange - startOfRange;
  if (range === 0) {
    return 0;
  }
  const currentInRange = current - startOfRange;
  const percentage = currentInRange / range;
  return percentage;
};
var minScroll = 1;
var getValueFromDistance = (distanceToEdge, thresholds, getAutoScrollerOptions = () => defaultAutoScrollerOptions) => {
  const autoScrollerOptions = getAutoScrollerOptions();
  if (distanceToEdge > thresholds.startScrollingFrom) {
    return 0;
  }
  if (distanceToEdge <= thresholds.maxScrollValueAt) {
    return autoScrollerOptions.maxPixelScroll;
  }
  if (distanceToEdge === thresholds.startScrollingFrom) {
    return minScroll;
  }
  const percentageFromMaxScrollValueAt = getPercentage({
    startOfRange: thresholds.maxScrollValueAt,
    endOfRange: thresholds.startScrollingFrom,
    current: distanceToEdge
  });
  const percentageFromStartScrollingFrom = 1 - percentageFromMaxScrollValueAt;
  const scroll2 = autoScrollerOptions.maxPixelScroll * autoScrollerOptions.ease(percentageFromStartScrollingFrom);
  return Math.ceil(scroll2);
};
var dampenValueByTime = (proposedScroll, dragStartTime, getAutoScrollerOptions) => {
  const autoScrollerOptions = getAutoScrollerOptions();
  const accelerateAt = autoScrollerOptions.durationDampening.accelerateAt;
  const stopAt = autoScrollerOptions.durationDampening.stopDampeningAt;
  const startOfRange = dragStartTime;
  const endOfRange = stopAt;
  const now = Date.now();
  const runTime = now - startOfRange;
  if (runTime >= stopAt) {
    return proposedScroll;
  }
  if (runTime < accelerateAt) {
    return minScroll;
  }
  const betweenAccelerateAtAndStopAtPercentage = getPercentage({
    startOfRange: accelerateAt,
    endOfRange,
    current: runTime
  });
  const scroll2 = proposedScroll * autoScrollerOptions.ease(betweenAccelerateAtAndStopAtPercentage);
  return Math.ceil(scroll2);
};
var getValue = ({
  distanceToEdge,
  thresholds,
  dragStartTime,
  shouldUseTimeDampening,
  getAutoScrollerOptions
}) => {
  const scroll2 = getValueFromDistance(distanceToEdge, thresholds, getAutoScrollerOptions);
  if (scroll2 === 0) {
    return 0;
  }
  if (!shouldUseTimeDampening) {
    return scroll2;
  }
  return Math.max(dampenValueByTime(scroll2, dragStartTime, getAutoScrollerOptions), minScroll);
};
var getScrollOnAxis = ({
  container,
  distanceToEdges,
  dragStartTime,
  axis,
  shouldUseTimeDampening,
  getAutoScrollerOptions
}) => {
  const thresholds = getDistanceThresholds(container, axis, getAutoScrollerOptions);
  const isCloserToEnd = distanceToEdges[axis.end] < distanceToEdges[axis.start];
  if (isCloserToEnd) {
    return getValue({
      distanceToEdge: distanceToEdges[axis.end],
      thresholds,
      dragStartTime,
      shouldUseTimeDampening,
      getAutoScrollerOptions
    });
  }
  return -1 * getValue({
    distanceToEdge: distanceToEdges[axis.start],
    thresholds,
    dragStartTime,
    shouldUseTimeDampening,
    getAutoScrollerOptions
  });
};
var adjustForSizeLimits = ({
  container,
  subject,
  proposedScroll
}) => {
  const isTooBigVertically = subject.height > container.height;
  const isTooBigHorizontally = subject.width > container.width;
  if (!isTooBigHorizontally && !isTooBigVertically) {
    return proposedScroll;
  }
  if (isTooBigHorizontally && isTooBigVertically) {
    return null;
  }
  return {
    x: isTooBigHorizontally ? 0 : proposedScroll.x,
    y: isTooBigVertically ? 0 : proposedScroll.y
  };
};
const clean = apply((value) => value === 0 ? 0 : value);
var getScroll$1 = ({
  dragStartTime,
  container,
  subject,
  center,
  shouldUseTimeDampening,
  getAutoScrollerOptions
}) => {
  const distanceToEdges = {
    top: center.y - container.top,
    right: container.right - center.x,
    bottom: container.bottom - center.y,
    left: center.x - container.left
  };
  const y = getScrollOnAxis({
    container,
    distanceToEdges,
    dragStartTime,
    axis: vertical,
    shouldUseTimeDampening,
    getAutoScrollerOptions
  });
  const x = getScrollOnAxis({
    container,
    distanceToEdges,
    dragStartTime,
    axis: horizontal,
    shouldUseTimeDampening,
    getAutoScrollerOptions
  });
  const required2 = clean({
    x,
    y
  });
  if (isEqual$1(required2, origin)) {
    return null;
  }
  const limited = adjustForSizeLimits({
    container,
    subject,
    proposedScroll: required2
  });
  if (!limited) {
    return null;
  }
  return isEqual$1(limited, origin) ? null : limited;
};
const smallestSigned = apply((value) => {
  if (value === 0) {
    return 0;
  }
  return value > 0 ? 1 : -1;
});
const getOverlap = /* @__PURE__ */ (() => {
  const getRemainder = (target, max) => {
    if (target < 0) {
      return target;
    }
    if (target > max) {
      return target - max;
    }
    return 0;
  };
  return ({
    current,
    max,
    change
  }) => {
    const targetScroll = add(current, change);
    const overlap = {
      x: getRemainder(targetScroll.x, max.x),
      y: getRemainder(targetScroll.y, max.y)
    };
    if (isEqual$1(overlap, origin)) {
      return null;
    }
    return overlap;
  };
})();
const canPartiallyScroll = ({
  max: rawMax,
  current,
  change
}) => {
  const max = {
    x: Math.max(current.x, rawMax.x),
    y: Math.max(current.y, rawMax.y)
  };
  const smallestChange = smallestSigned(change);
  const overlap = getOverlap({
    max,
    current,
    change: smallestChange
  });
  if (!overlap) {
    return true;
  }
  if (smallestChange.x !== 0 && overlap.x === 0) {
    return true;
  }
  if (smallestChange.y !== 0 && overlap.y === 0) {
    return true;
  }
  return false;
};
const canScrollWindow = (viewport, change) => canPartiallyScroll({
  current: viewport.scroll.current,
  max: viewport.scroll.max,
  change
});
const getWindowOverlap = (viewport, change) => {
  if (!canScrollWindow(viewport, change)) {
    return null;
  }
  const max = viewport.scroll.max;
  const current = viewport.scroll.current;
  return getOverlap({
    current,
    max,
    change
  });
};
const canScrollDroppable = (droppable2, change) => {
  const frame = droppable2.frame;
  if (!frame) {
    return false;
  }
  return canPartiallyScroll({
    current: frame.scroll.current,
    max: frame.scroll.max,
    change
  });
};
const getDroppableOverlap = (droppable2, change) => {
  const frame = droppable2.frame;
  if (!frame) {
    return null;
  }
  if (!canScrollDroppable(droppable2, change)) {
    return null;
  }
  return getOverlap({
    current: frame.scroll.current,
    max: frame.scroll.max,
    change
  });
};
var getWindowScrollChange = ({
  viewport,
  subject,
  center,
  dragStartTime,
  shouldUseTimeDampening,
  getAutoScrollerOptions
}) => {
  const scroll2 = getScroll$1({
    dragStartTime,
    container: viewport.frame,
    subject,
    center,
    shouldUseTimeDampening,
    getAutoScrollerOptions
  });
  return scroll2 && canScrollWindow(viewport, scroll2) ? scroll2 : null;
};
var getDroppableScrollChange = ({
  droppable: droppable2,
  subject,
  center,
  dragStartTime,
  shouldUseTimeDampening,
  getAutoScrollerOptions
}) => {
  const frame = droppable2.frame;
  if (!frame) {
    return null;
  }
  const scroll2 = getScroll$1({
    dragStartTime,
    container: frame.pageMarginBox,
    subject,
    center,
    shouldUseTimeDampening,
    getAutoScrollerOptions
  });
  return scroll2 && canScrollDroppable(droppable2, scroll2) ? scroll2 : null;
};
var scroll = ({
  state,
  dragStartTime,
  shouldUseTimeDampening,
  scrollWindow: scrollWindow2,
  scrollDroppable: scrollDroppable2,
  getAutoScrollerOptions
}) => {
  const center = state.current.page.borderBoxCenter;
  const draggable2 = state.dimensions.draggables[state.critical.draggable.id];
  const subject = draggable2.page.marginBox;
  if (state.isWindowScrollAllowed) {
    const viewport = state.viewport;
    const change2 = getWindowScrollChange({
      dragStartTime,
      viewport,
      subject,
      center,
      shouldUseTimeDampening,
      getAutoScrollerOptions
    });
    if (change2) {
      scrollWindow2(change2);
      return;
    }
  }
  const droppable2 = getBestScrollableDroppable({
    center,
    destination: whatIsDraggedOver(state.impact),
    droppables: state.dimensions.droppables
  });
  if (!droppable2) {
    return;
  }
  const change = getDroppableScrollChange({
    dragStartTime,
    droppable: droppable2,
    subject,
    center,
    shouldUseTimeDampening,
    getAutoScrollerOptions
  });
  if (change) {
    scrollDroppable2(droppable2.descriptor.id, change);
  }
};
var createFluidScroller = ({
  scrollWindow: scrollWindow2,
  scrollDroppable: scrollDroppable2,
  getAutoScrollerOptions = () => defaultAutoScrollerOptions
}) => {
  const scheduleWindowScroll = rafSchd(scrollWindow2);
  const scheduleDroppableScroll = rafSchd(scrollDroppable2);
  let dragging = null;
  const tryScroll = (state) => {
    !dragging ? invariant() : void 0;
    const {
      shouldUseTimeDampening,
      dragStartTime
    } = dragging;
    scroll({
      state,
      scrollWindow: scheduleWindowScroll,
      scrollDroppable: scheduleDroppableScroll,
      dragStartTime,
      shouldUseTimeDampening,
      getAutoScrollerOptions
    });
  };
  const start$1 = (state) => {
    !!dragging ? invariant() : void 0;
    const dragStartTime = Date.now();
    let wasScrollNeeded = false;
    const fakeScrollCallback = () => {
      wasScrollNeeded = true;
    };
    scroll({
      state,
      dragStartTime: 0,
      shouldUseTimeDampening: false,
      scrollWindow: fakeScrollCallback,
      scrollDroppable: fakeScrollCallback,
      getAutoScrollerOptions
    });
    dragging = {
      dragStartTime,
      shouldUseTimeDampening: wasScrollNeeded
    };
    if (wasScrollNeeded) {
      tryScroll(state);
    }
  };
  const stop = () => {
    if (!dragging) {
      return;
    }
    scheduleWindowScroll.cancel();
    scheduleDroppableScroll.cancel();
    dragging = null;
  };
  return {
    start: start$1,
    stop,
    scroll: tryScroll
  };
};
var createJumpScroller = ({
  move: move2,
  scrollDroppable: scrollDroppable2,
  scrollWindow: scrollWindow2
}) => {
  const moveByOffset = (state, offset22) => {
    const client = add(state.current.client.selection, offset22);
    move2({
      client
    });
  };
  const scrollDroppableAsMuchAsItCan = (droppable2, change) => {
    if (!canScrollDroppable(droppable2, change)) {
      return change;
    }
    const overlap = getDroppableOverlap(droppable2, change);
    if (!overlap) {
      scrollDroppable2(droppable2.descriptor.id, change);
      return null;
    }
    const whatTheDroppableCanScroll = subtract(change, overlap);
    scrollDroppable2(droppable2.descriptor.id, whatTheDroppableCanScroll);
    const remainder = subtract(change, whatTheDroppableCanScroll);
    return remainder;
  };
  const scrollWindowAsMuchAsItCan = (isWindowScrollAllowed, viewport, change) => {
    if (!isWindowScrollAllowed) {
      return change;
    }
    if (!canScrollWindow(viewport, change)) {
      return change;
    }
    const overlap = getWindowOverlap(viewport, change);
    if (!overlap) {
      scrollWindow2(change);
      return null;
    }
    const whatTheWindowCanScroll = subtract(change, overlap);
    scrollWindow2(whatTheWindowCanScroll);
    const remainder = subtract(change, whatTheWindowCanScroll);
    return remainder;
  };
  const jumpScroller = (state) => {
    const request = state.scrollJumpRequest;
    if (!request) {
      return;
    }
    const destination = whatIsDraggedOver(state.impact);
    !destination ? invariant() : void 0;
    const droppableRemainder = scrollDroppableAsMuchAsItCan(state.dimensions.droppables[destination], request);
    if (!droppableRemainder) {
      return;
    }
    const viewport = state.viewport;
    const windowRemainder = scrollWindowAsMuchAsItCan(state.isWindowScrollAllowed, viewport, droppableRemainder);
    if (!windowRemainder) {
      return;
    }
    moveByOffset(state, windowRemainder);
  };
  return jumpScroller;
};
var createAutoScroller = ({
  scrollDroppable: scrollDroppable2,
  scrollWindow: scrollWindow2,
  move: move2,
  getAutoScrollerOptions
}) => {
  const fluidScroller = createFluidScroller({
    scrollWindow: scrollWindow2,
    scrollDroppable: scrollDroppable2,
    getAutoScrollerOptions
  });
  const jumpScroll = createJumpScroller({
    move: move2,
    scrollWindow: scrollWindow2,
    scrollDroppable: scrollDroppable2
  });
  const scroll2 = (state) => {
    const autoScrollerOptions = getAutoScrollerOptions();
    if (autoScrollerOptions.disabled || state.phase !== "DRAGGING") {
      return;
    }
    if (state.movementMode === "FLUID") {
      fluidScroller.scroll(state);
      return;
    }
    if (!state.scrollJumpRequest) {
      return;
    }
    jumpScroll(state);
  };
  const scroller = {
    scroll: scroll2,
    start: fluidScroller.start,
    stop: fluidScroller.stop
  };
  return scroller;
};
const prefix = "data-rfd";
const dragHandle = (() => {
  const base = `${prefix}-drag-handle`;
  return {
    base,
    draggableId: `${base}-draggable-id`,
    contextId: `${base}-context-id`
  };
})();
const draggable = (() => {
  const base = `${prefix}-draggable`;
  return {
    base,
    contextId: `${base}-context-id`,
    id: `${base}-id`
  };
})();
const droppable = (() => {
  const base = `${prefix}-droppable`;
  return {
    base,
    contextId: `${base}-context-id`,
    id: `${base}-id`
  };
})();
const scrollContainer = {
  contextId: `${prefix}-scroll-container-context-id`
};
const makeGetSelector = (context) => (attribute) => `[${attribute}="${context}"]`;
const getStyles = (rules, property) => rules.map((rule) => {
  const value = rule.styles[property];
  if (!value) {
    return "";
  }
  return `${rule.selector} { ${value} }`;
}).join(" ");
const noPointerEvents = "pointer-events: none;";
var getStyles$1 = (contextId) => {
  const getSelector2 = makeGetSelector(contextId);
  const dragHandle$1 = (() => {
    const grabCursor = `
      cursor: -webkit-grab;
      cursor: grab;
    `;
    return {
      selector: getSelector2(dragHandle.contextId),
      styles: {
        always: `
          -webkit-touch-callout: none;
          -webkit-tap-highlight-color: rgba(0,0,0,0);
          touch-action: manipulation;
        `,
        resting: grabCursor,
        dragging: noPointerEvents,
        dropAnimating: grabCursor
      }
    };
  })();
  const draggable$1 = (() => {
    const transition = `
      transition: ${transitions.outOfTheWay};
    `;
    return {
      selector: getSelector2(draggable.contextId),
      styles: {
        dragging: transition,
        dropAnimating: transition,
        userCancel: transition
      }
    };
  })();
  const droppable$1 = {
    selector: getSelector2(droppable.contextId),
    styles: {
      always: `overflow-anchor: none;`
    }
  };
  const body = {
    selector: "body",
    styles: {
      dragging: `
        cursor: grabbing;
        cursor: -webkit-grabbing;
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        overflow-anchor: none;
      `
    }
  };
  const rules = [draggable$1, dragHandle$1, droppable$1, body];
  return {
    always: getStyles(rules, "always"),
    resting: getStyles(rules, "resting"),
    dragging: getStyles(rules, "dragging"),
    dropAnimating: getStyles(rules, "dropAnimating"),
    userCancel: getStyles(rules, "userCancel")
  };
};
const useIsomorphicLayoutEffect = typeof window !== "undefined" && typeof window.document !== "undefined" && typeof window.document.createElement !== "undefined" ? reactExports.useLayoutEffect : reactExports.useEffect;
const getHead = () => {
  const head = document.querySelector("head");
  !head ? invariant() : void 0;
  return head;
};
const createStyleEl = (nonce) => {
  const el = document.createElement("style");
  if (nonce) {
    el.setAttribute("nonce", nonce);
  }
  el.type = "text/css";
  return el;
};
function useStyleMarshal(contextId, nonce) {
  const styles = useMemo(() => getStyles$1(contextId), [contextId]);
  const alwaysRef = reactExports.useRef(null);
  const dynamicRef = reactExports.useRef(null);
  const setDynamicStyle = useCallback(memoizeOne((proposed) => {
    const el = dynamicRef.current;
    !el ? invariant() : void 0;
    el.textContent = proposed;
  }), []);
  const setAlwaysStyle = useCallback((proposed) => {
    const el = alwaysRef.current;
    !el ? invariant() : void 0;
    el.textContent = proposed;
  }, []);
  useIsomorphicLayoutEffect(() => {
    !(!alwaysRef.current && !dynamicRef.current) ? invariant() : void 0;
    const always = createStyleEl(nonce);
    const dynamic = createStyleEl(nonce);
    alwaysRef.current = always;
    dynamicRef.current = dynamic;
    always.setAttribute(`${prefix}-always`, contextId);
    dynamic.setAttribute(`${prefix}-dynamic`, contextId);
    getHead().appendChild(always);
    getHead().appendChild(dynamic);
    setAlwaysStyle(styles.always);
    setDynamicStyle(styles.resting);
    return () => {
      const remove = (ref2) => {
        const current = ref2.current;
        !current ? invariant() : void 0;
        getHead().removeChild(current);
        ref2.current = null;
      };
      remove(alwaysRef);
      remove(dynamicRef);
    };
  }, [nonce, setAlwaysStyle, setDynamicStyle, styles.always, styles.resting, contextId]);
  const dragging = useCallback(() => setDynamicStyle(styles.dragging), [setDynamicStyle, styles.dragging]);
  const dropping = useCallback((reason) => {
    if (reason === "DROP") {
      setDynamicStyle(styles.dropAnimating);
      return;
    }
    setDynamicStyle(styles.userCancel);
  }, [setDynamicStyle, styles.dropAnimating, styles.userCancel]);
  const resting = useCallback(() => {
    if (!dynamicRef.current) {
      return;
    }
    setDynamicStyle(styles.resting);
  }, [setDynamicStyle, styles.resting]);
  const marshal = useMemo(() => ({
    dragging,
    dropping,
    resting
  }), [dragging, dropping, resting]);
  return marshal;
}
function querySelectorAll(parentNode, selector) {
  return Array.from(parentNode.querySelectorAll(selector));
}
var getWindowFromEl = (el) => {
  if (el && el.ownerDocument && el.ownerDocument.defaultView) {
    return el.ownerDocument.defaultView;
  }
  return window;
};
function isHtmlElement(el) {
  return el instanceof getWindowFromEl(el).HTMLElement;
}
function findDragHandle(contextId, draggableId) {
  const selector = `[${dragHandle.contextId}="${contextId}"]`;
  const possible = querySelectorAll(document, selector);
  if (!possible.length) {
    return null;
  }
  const handle = possible.find((el) => {
    return el.getAttribute(dragHandle.draggableId) === draggableId;
  });
  if (!handle) {
    return null;
  }
  if (!isHtmlElement(handle)) {
    return null;
  }
  return handle;
}
function useFocusMarshal(contextId) {
  const entriesRef = reactExports.useRef({});
  const recordRef = reactExports.useRef(null);
  const restoreFocusFrameRef = reactExports.useRef(null);
  const isMountedRef = reactExports.useRef(false);
  const register = useCallback(function register2(id, focus2) {
    const entry = {
      id,
      focus: focus2
    };
    entriesRef.current[id] = entry;
    return function unregister() {
      const entries = entriesRef.current;
      const current = entries[id];
      if (current !== entry) {
        delete entries[id];
      }
    };
  }, []);
  const tryGiveFocus = useCallback(function tryGiveFocus2(tryGiveFocusTo) {
    const handle = findDragHandle(contextId, tryGiveFocusTo);
    if (handle && handle !== document.activeElement) {
      handle.focus();
    }
  }, [contextId]);
  const tryShiftRecord = useCallback(function tryShiftRecord2(previous, redirectTo) {
    if (recordRef.current === previous) {
      recordRef.current = redirectTo;
    }
  }, []);
  const tryRestoreFocusRecorded = useCallback(function tryRestoreFocusRecorded2() {
    if (restoreFocusFrameRef.current) {
      return;
    }
    if (!isMountedRef.current) {
      return;
    }
    restoreFocusFrameRef.current = requestAnimationFrame(() => {
      restoreFocusFrameRef.current = null;
      const record = recordRef.current;
      if (record) {
        tryGiveFocus(record);
      }
    });
  }, [tryGiveFocus]);
  const tryRecordFocus = useCallback(function tryRecordFocus2(id) {
    recordRef.current = null;
    const focused = document.activeElement;
    if (!focused) {
      return;
    }
    if (focused.getAttribute(dragHandle.draggableId) !== id) {
      return;
    }
    recordRef.current = id;
  }, []);
  useIsomorphicLayoutEffect(() => {
    isMountedRef.current = true;
    return function clearFrameOnUnmount() {
      isMountedRef.current = false;
      const frameId = restoreFocusFrameRef.current;
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, []);
  const marshal = useMemo(() => ({
    register,
    tryRecordFocus,
    tryRestoreFocusRecorded,
    tryShiftRecord
  }), [register, tryRecordFocus, tryRestoreFocusRecorded, tryShiftRecord]);
  return marshal;
}
function createRegistry() {
  const entries = {
    draggables: {},
    droppables: {}
  };
  const subscribers = [];
  function subscribe(cb) {
    subscribers.push(cb);
    return function unsubscribe() {
      const index = subscribers.indexOf(cb);
      if (index === -1) {
        return;
      }
      subscribers.splice(index, 1);
    };
  }
  function notify(event) {
    if (subscribers.length) {
      subscribers.forEach((cb) => cb(event));
    }
  }
  function findDraggableById(id) {
    return entries.draggables[id] || null;
  }
  function getDraggableById(id) {
    const entry = findDraggableById(id);
    !entry ? invariant() : void 0;
    return entry;
  }
  const draggableAPI = {
    register: (entry) => {
      entries.draggables[entry.descriptor.id] = entry;
      notify({
        type: "ADDITION",
        value: entry
      });
    },
    update: (entry, last) => {
      const current = entries.draggables[last.descriptor.id];
      if (!current) {
        return;
      }
      if (current.uniqueId !== entry.uniqueId) {
        return;
      }
      delete entries.draggables[last.descriptor.id];
      entries.draggables[entry.descriptor.id] = entry;
    },
    unregister: (entry) => {
      const draggableId = entry.descriptor.id;
      const current = findDraggableById(draggableId);
      if (!current) {
        return;
      }
      if (entry.uniqueId !== current.uniqueId) {
        return;
      }
      delete entries.draggables[draggableId];
      if (entries.droppables[entry.descriptor.droppableId]) {
        notify({
          type: "REMOVAL",
          value: entry
        });
      }
    },
    getById: getDraggableById,
    findById: findDraggableById,
    exists: (id) => Boolean(findDraggableById(id)),
    getAllByType: (type) => Object.values(entries.draggables).filter((entry) => entry.descriptor.type === type)
  };
  function findDroppableById(id) {
    return entries.droppables[id] || null;
  }
  function getDroppableById(id) {
    const entry = findDroppableById(id);
    !entry ? invariant() : void 0;
    return entry;
  }
  const droppableAPI = {
    register: (entry) => {
      entries.droppables[entry.descriptor.id] = entry;
    },
    unregister: (entry) => {
      const current = findDroppableById(entry.descriptor.id);
      if (!current) {
        return;
      }
      if (entry.uniqueId !== current.uniqueId) {
        return;
      }
      delete entries.droppables[entry.descriptor.id];
    },
    getById: getDroppableById,
    findById: findDroppableById,
    exists: (id) => Boolean(findDroppableById(id)),
    getAllByType: (type) => Object.values(entries.droppables).filter((entry) => entry.descriptor.type === type)
  };
  function clean2() {
    entries.draggables = {};
    entries.droppables = {};
    subscribers.length = 0;
  }
  return {
    draggable: draggableAPI,
    droppable: droppableAPI,
    subscribe,
    clean: clean2
  };
}
function useRegistry() {
  const registry = useMemo(createRegistry, []);
  reactExports.useEffect(() => {
    return function unmount() {
      registry.clean();
    };
  }, [registry]);
  return registry;
}
var StoreContext = React.createContext(null);
var getBodyElement = () => {
  const body = document.body;
  !body ? invariant() : void 0;
  return body;
};
const visuallyHidden = {
  position: "absolute",
  width: "1px",
  height: "1px",
  margin: "-1px",
  border: "0",
  padding: "0",
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  "clip-path": "inset(100%)"
};
const getId = (contextId) => `rfd-announcement-${contextId}`;
function useAnnouncer(contextId) {
  const id = useMemo(() => getId(contextId), [contextId]);
  const ref2 = reactExports.useRef(null);
  reactExports.useEffect(function setup() {
    const el = document.createElement("div");
    ref2.current = el;
    el.id = id;
    el.setAttribute("aria-live", "assertive");
    el.setAttribute("aria-atomic", "true");
    _extends(el.style, visuallyHidden);
    getBodyElement().appendChild(el);
    return function cleanup() {
      setTimeout(function remove() {
        const body = getBodyElement();
        if (body.contains(el)) {
          body.removeChild(el);
        }
        if (el === ref2.current) {
          ref2.current = null;
        }
      });
    };
  }, [id]);
  const announce = useCallback((message) => {
    const el = ref2.current;
    if (el) {
      el.textContent = message;
      return;
    }
  }, []);
  return announce;
}
const defaults = {
  separator: "::"
};
function useUniqueId(prefix2, options = defaults) {
  const id = React.useId();
  return useMemo(() => `${prefix2}${options.separator}${id}`, [options.separator, prefix2, id]);
}
function getElementId({
  contextId,
  uniqueId
}) {
  return `rfd-hidden-text-${contextId}-${uniqueId}`;
}
function useHiddenTextElement({
  contextId,
  text
}) {
  const uniqueId = useUniqueId("hidden-text", {
    separator: "-"
  });
  const id = useMemo(() => getElementId({
    contextId,
    uniqueId
  }), [uniqueId, contextId]);
  reactExports.useEffect(function mount() {
    const el = document.createElement("div");
    el.id = id;
    el.textContent = text;
    el.style.display = "none";
    getBodyElement().appendChild(el);
    return function unmount() {
      const body = getBodyElement();
      if (body.contains(el)) {
        body.removeChild(el);
      }
    };
  }, [id, text]);
  return id;
}
var AppContext = React.createContext(null);
function usePrevious(current) {
  const ref2 = reactExports.useRef(current);
  reactExports.useEffect(() => {
    ref2.current = current;
  });
  return ref2;
}
function create() {
  let lock = null;
  function isClaimed() {
    return Boolean(lock);
  }
  function isActive2(value) {
    return value === lock;
  }
  function claim(abandon) {
    !!lock ? invariant() : void 0;
    const newLock = {
      abandon
    };
    lock = newLock;
    return newLock;
  }
  function release() {
    !lock ? invariant() : void 0;
    lock = null;
  }
  function tryAbandon() {
    if (lock) {
      lock.abandon();
      release();
    }
  }
  return {
    isClaimed,
    isActive: isActive2,
    claim,
    release,
    tryAbandon
  };
}
function isDragging(state) {
  if (state.phase === "IDLE" || state.phase === "DROP_ANIMATING") {
    return false;
  }
  return state.isDragging;
}
const tab = 9;
const enter = 13;
const escape = 27;
const space = 32;
const pageUp = 33;
const pageDown = 34;
const end = 35;
const home = 36;
const arrowLeft = 37;
const arrowUp = 38;
const arrowRight = 39;
const arrowDown = 40;
const preventedKeys = {
  [enter]: true,
  [tab]: true
};
var preventStandardKeyEvents = (event) => {
  if (preventedKeys[event.keyCode]) {
    event.preventDefault();
  }
};
const supportedEventName = (() => {
  const base = "visibilitychange";
  if (typeof document === "undefined") {
    return base;
  }
  const candidates = [base, `ms${base}`, `webkit${base}`, `moz${base}`, `o${base}`];
  const supported = candidates.find((eventName) => `on${eventName}` in document);
  return supported || base;
})();
const primaryButton = 0;
const sloppyClickThreshold = 5;
function isSloppyClickThresholdExceeded(original, current) {
  return Math.abs(current.x - original.x) >= sloppyClickThreshold || Math.abs(current.y - original.y) >= sloppyClickThreshold;
}
const idle$1 = {
  type: "IDLE"
};
function getCaptureBindings({
  cancel,
  completed,
  getPhase,
  setPhase
}) {
  return [{
    eventName: "mousemove",
    fn: (event) => {
      const {
        button,
        clientX,
        clientY
      } = event;
      if (button !== primaryButton) {
        return;
      }
      const point = {
        x: clientX,
        y: clientY
      };
      const phase = getPhase();
      if (phase.type === "DRAGGING") {
        event.preventDefault();
        phase.actions.move(point);
        return;
      }
      !(phase.type === "PENDING") ? invariant() : void 0;
      const pending = phase.point;
      if (!isSloppyClickThresholdExceeded(pending, point)) {
        return;
      }
      event.preventDefault();
      const actions = phase.actions.fluidLift(point);
      setPhase({
        type: "DRAGGING",
        actions
      });
    }
  }, {
    eventName: "mouseup",
    fn: (event) => {
      const phase = getPhase();
      if (phase.type !== "DRAGGING") {
        cancel();
        return;
      }
      event.preventDefault();
      phase.actions.drop({
        shouldBlockNextClick: true
      });
      completed();
    }
  }, {
    eventName: "mousedown",
    fn: (event) => {
      if (getPhase().type === "DRAGGING") {
        event.preventDefault();
      }
      cancel();
    }
  }, {
    eventName: "keydown",
    fn: (event) => {
      const phase = getPhase();
      if (phase.type === "PENDING") {
        cancel();
        return;
      }
      if (event.keyCode === escape) {
        event.preventDefault();
        cancel();
        return;
      }
      preventStandardKeyEvents(event);
    }
  }, {
    eventName: "resize",
    fn: cancel
  }, {
    eventName: "scroll",
    options: {
      passive: true,
      capture: false
    },
    fn: () => {
      if (getPhase().type === "PENDING") {
        cancel();
      }
    }
  }, {
    eventName: "webkitmouseforcedown",
    fn: (event) => {
      const phase = getPhase();
      !(phase.type !== "IDLE") ? invariant() : void 0;
      if (phase.actions.shouldRespectForcePress()) {
        cancel();
        return;
      }
      event.preventDefault();
    }
  }, {
    eventName: supportedEventName,
    fn: cancel
  }];
}
function useMouseSensor(api) {
  const phaseRef = reactExports.useRef(idle$1);
  const unbindEventsRef = reactExports.useRef(noop$2);
  const startCaptureBinding = useMemo(() => ({
    eventName: "mousedown",
    fn: function onMouseDown(event) {
      if (event.defaultPrevented) {
        return;
      }
      if (event.button !== primaryButton) {
        return;
      }
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
        return;
      }
      const draggableId = api.findClosestDraggableId(event);
      if (!draggableId) {
        return;
      }
      const actions = api.tryGetLock(draggableId, stop, {
        sourceEvent: event
      });
      if (!actions) {
        return;
      }
      event.preventDefault();
      const point = {
        x: event.clientX,
        y: event.clientY
      };
      unbindEventsRef.current();
      startPendingDrag(actions, point);
    }
  }), [api]);
  const preventForcePressBinding = useMemo(() => ({
    eventName: "webkitmouseforcewillbegin",
    fn: (event) => {
      if (event.defaultPrevented) {
        return;
      }
      const id = api.findClosestDraggableId(event);
      if (!id) {
        return;
      }
      const options = api.findOptionsForDraggable(id);
      if (!options) {
        return;
      }
      if (options.shouldRespectForcePress) {
        return;
      }
      if (!api.canGetLock(id)) {
        return;
      }
      event.preventDefault();
    }
  }), [api]);
  const listenForCapture = useCallback(function listenForCapture2() {
    const options = {
      passive: false,
      capture: true
    };
    unbindEventsRef.current = bindEvents(window, [preventForcePressBinding, startCaptureBinding], options);
  }, [preventForcePressBinding, startCaptureBinding]);
  const stop = useCallback(() => {
    const current = phaseRef.current;
    if (current.type === "IDLE") {
      return;
    }
    phaseRef.current = idle$1;
    unbindEventsRef.current();
    listenForCapture();
  }, [listenForCapture]);
  const cancel = useCallback(() => {
    const phase = phaseRef.current;
    stop();
    if (phase.type === "DRAGGING") {
      phase.actions.cancel({
        shouldBlockNextClick: true
      });
    }
    if (phase.type === "PENDING") {
      phase.actions.abort();
    }
  }, [stop]);
  const bindCapturingEvents = useCallback(function bindCapturingEvents2() {
    const options = {
      capture: true,
      passive: false
    };
    const bindings = getCaptureBindings({
      cancel,
      completed: stop,
      getPhase: () => phaseRef.current,
      setPhase: (phase) => {
        phaseRef.current = phase;
      }
    });
    unbindEventsRef.current = bindEvents(window, bindings, options);
  }, [cancel, stop]);
  const startPendingDrag = useCallback(function startPendingDrag2(actions, point) {
    !(phaseRef.current.type === "IDLE") ? invariant() : void 0;
    phaseRef.current = {
      type: "PENDING",
      point,
      actions
    };
    bindCapturingEvents();
  }, [bindCapturingEvents]);
  useIsomorphicLayoutEffect(function mount() {
    listenForCapture();
    return function unmount() {
      unbindEventsRef.current();
    };
  }, [listenForCapture]);
}
function noop$1() {
}
const scrollJumpKeys = {
  [pageDown]: true,
  [pageUp]: true,
  [home]: true,
  [end]: true
};
function getDraggingBindings(actions, stop) {
  function cancel() {
    stop();
    actions.cancel();
  }
  function drop2() {
    stop();
    actions.drop();
  }
  return [{
    eventName: "keydown",
    fn: (event) => {
      if (event.keyCode === escape) {
        event.preventDefault();
        cancel();
        return;
      }
      if (event.keyCode === space) {
        event.preventDefault();
        drop2();
        return;
      }
      if (event.keyCode === arrowDown) {
        event.preventDefault();
        actions.moveDown();
        return;
      }
      if (event.keyCode === arrowUp) {
        event.preventDefault();
        actions.moveUp();
        return;
      }
      if (event.keyCode === arrowRight) {
        event.preventDefault();
        actions.moveRight();
        return;
      }
      if (event.keyCode === arrowLeft) {
        event.preventDefault();
        actions.moveLeft();
        return;
      }
      if (scrollJumpKeys[event.keyCode]) {
        event.preventDefault();
        return;
      }
      preventStandardKeyEvents(event);
    }
  }, {
    eventName: "mousedown",
    fn: cancel
  }, {
    eventName: "mouseup",
    fn: cancel
  }, {
    eventName: "click",
    fn: cancel
  }, {
    eventName: "touchstart",
    fn: cancel
  }, {
    eventName: "resize",
    fn: cancel
  }, {
    eventName: "wheel",
    fn: cancel,
    options: {
      passive: true
    }
  }, {
    eventName: supportedEventName,
    fn: cancel
  }];
}
function useKeyboardSensor(api) {
  const unbindEventsRef = reactExports.useRef(noop$1);
  const startCaptureBinding = useMemo(() => ({
    eventName: "keydown",
    fn: function onKeyDown(event) {
      if (event.defaultPrevented) {
        return;
      }
      if (event.keyCode !== space) {
        return;
      }
      const draggableId = api.findClosestDraggableId(event);
      if (!draggableId) {
        return;
      }
      const preDrag = api.tryGetLock(draggableId, stop, {
        sourceEvent: event
      });
      if (!preDrag) {
        return;
      }
      event.preventDefault();
      let isCapturing = true;
      const actions = preDrag.snapLift();
      unbindEventsRef.current();
      function stop() {
        !isCapturing ? invariant() : void 0;
        isCapturing = false;
        unbindEventsRef.current();
        listenForCapture();
      }
      unbindEventsRef.current = bindEvents(window, getDraggingBindings(actions, stop), {
        capture: true,
        passive: false
      });
    }
  }), [api]);
  const listenForCapture = useCallback(function tryStartCapture() {
    const options = {
      passive: false,
      capture: true
    };
    unbindEventsRef.current = bindEvents(window, [startCaptureBinding], options);
  }, [startCaptureBinding]);
  useIsomorphicLayoutEffect(function mount() {
    listenForCapture();
    return function unmount() {
      unbindEventsRef.current();
    };
  }, [listenForCapture]);
}
const idle = {
  type: "IDLE"
};
const timeForLongPress = 120;
const forcePressThreshold = 0.15;
function getWindowBindings({
  cancel,
  getPhase
}) {
  return [{
    eventName: "orientationchange",
    fn: cancel
  }, {
    eventName: "resize",
    fn: cancel
  }, {
    eventName: "contextmenu",
    fn: (event) => {
      event.preventDefault();
    }
  }, {
    eventName: "keydown",
    fn: (event) => {
      if (getPhase().type !== "DRAGGING") {
        cancel();
        return;
      }
      if (event.keyCode === escape) {
        event.preventDefault();
      }
      cancel();
    }
  }, {
    eventName: supportedEventName,
    fn: cancel
  }];
}
function getHandleBindings({
  cancel,
  completed,
  getPhase
}) {
  return [{
    eventName: "touchmove",
    options: {
      capture: false
    },
    fn: (event) => {
      const phase = getPhase();
      if (phase.type !== "DRAGGING") {
        cancel();
        return;
      }
      phase.hasMoved = true;
      const {
        clientX,
        clientY
      } = event.touches[0];
      const point = {
        x: clientX,
        y: clientY
      };
      event.preventDefault();
      phase.actions.move(point);
    }
  }, {
    eventName: "touchend",
    fn: (event) => {
      const phase = getPhase();
      if (phase.type !== "DRAGGING") {
        cancel();
        return;
      }
      event.preventDefault();
      phase.actions.drop({
        shouldBlockNextClick: true
      });
      completed();
    }
  }, {
    eventName: "touchcancel",
    fn: (event) => {
      if (getPhase().type !== "DRAGGING") {
        cancel();
        return;
      }
      event.preventDefault();
      cancel();
    }
  }, {
    eventName: "touchforcechange",
    fn: (event) => {
      const phase = getPhase();
      !(phase.type !== "IDLE") ? invariant() : void 0;
      const touch = event.touches[0];
      if (!touch) {
        return;
      }
      const isForcePress = touch.force >= forcePressThreshold;
      if (!isForcePress) {
        return;
      }
      const shouldRespect = phase.actions.shouldRespectForcePress();
      if (phase.type === "PENDING") {
        if (shouldRespect) {
          cancel();
        }
        return;
      }
      if (shouldRespect) {
        if (phase.hasMoved) {
          event.preventDefault();
          return;
        }
        cancel();
        return;
      }
      event.preventDefault();
    }
  }, {
    eventName: supportedEventName,
    fn: cancel
  }];
}
function useTouchSensor(api) {
  const phaseRef = reactExports.useRef(idle);
  const unbindEventsRef = reactExports.useRef(noop$2);
  const getPhase = useCallback(function getPhase2() {
    return phaseRef.current;
  }, []);
  const setPhase = useCallback(function setPhase2(phase) {
    phaseRef.current = phase;
  }, []);
  const startCaptureBinding = useMemo(() => ({
    eventName: "touchstart",
    fn: function onTouchStart(event) {
      if (event.defaultPrevented) {
        return;
      }
      const draggableId = api.findClosestDraggableId(event);
      if (!draggableId) {
        return;
      }
      const actions = api.tryGetLock(draggableId, stop, {
        sourceEvent: event
      });
      if (!actions) {
        return;
      }
      const touch = event.touches[0];
      const {
        clientX,
        clientY
      } = touch;
      const point = {
        x: clientX,
        y: clientY
      };
      unbindEventsRef.current();
      startPendingDrag(actions, point);
    }
  }), [api]);
  const listenForCapture = useCallback(function listenForCapture2() {
    const options = {
      capture: true,
      passive: false
    };
    unbindEventsRef.current = bindEvents(window, [startCaptureBinding], options);
  }, [startCaptureBinding]);
  const stop = useCallback(() => {
    const current = phaseRef.current;
    if (current.type === "IDLE") {
      return;
    }
    if (current.type === "PENDING") {
      clearTimeout(current.longPressTimerId);
    }
    setPhase(idle);
    unbindEventsRef.current();
    listenForCapture();
  }, [listenForCapture, setPhase]);
  const cancel = useCallback(() => {
    const phase = phaseRef.current;
    stop();
    if (phase.type === "DRAGGING") {
      phase.actions.cancel({
        shouldBlockNextClick: true
      });
    }
    if (phase.type === "PENDING") {
      phase.actions.abort();
    }
  }, [stop]);
  const bindCapturingEvents = useCallback(function bindCapturingEvents2() {
    const options = {
      capture: true,
      passive: false
    };
    const args = {
      cancel,
      completed: stop,
      getPhase
    };
    const unbindTarget = bindEvents(window, getHandleBindings(args), options);
    const unbindWindow = bindEvents(window, getWindowBindings(args), options);
    unbindEventsRef.current = function unbindAll() {
      unbindTarget();
      unbindWindow();
    };
  }, [cancel, getPhase, stop]);
  const startDragging = useCallback(function startDragging2() {
    const phase = getPhase();
    !(phase.type === "PENDING") ? invariant() : void 0;
    const actions = phase.actions.fluidLift(phase.point);
    setPhase({
      type: "DRAGGING",
      actions,
      hasMoved: false
    });
  }, [getPhase, setPhase]);
  const startPendingDrag = useCallback(function startPendingDrag2(actions, point) {
    !(getPhase().type === "IDLE") ? invariant() : void 0;
    const longPressTimerId = setTimeout(startDragging, timeForLongPress);
    setPhase({
      type: "PENDING",
      point,
      actions,
      longPressTimerId
    });
    bindCapturingEvents();
  }, [bindCapturingEvents, getPhase, setPhase, startDragging]);
  useIsomorphicLayoutEffect(function mount() {
    listenForCapture();
    return function unmount() {
      unbindEventsRef.current();
      const phase = getPhase();
      if (phase.type === "PENDING") {
        clearTimeout(phase.longPressTimerId);
        setPhase(idle);
      }
    };
  }, [getPhase, listenForCapture, setPhase]);
  useIsomorphicLayoutEffect(function webkitHack() {
    const unbind = bindEvents(window, [{
      eventName: "touchmove",
      fn: () => {
      },
      options: {
        capture: false,
        passive: false
      }
    }]);
    return unbind;
  }, []);
}
const interactiveTagNames = ["input", "button", "textarea", "select", "option", "optgroup", "video", "audio"];
function isAnInteractiveElement(parent, current) {
  if (current == null) {
    return false;
  }
  const hasAnInteractiveTag = interactiveTagNames.includes(current.tagName.toLowerCase());
  if (hasAnInteractiveTag) {
    return true;
  }
  const attribute = current.getAttribute("contenteditable");
  if (attribute === "true" || attribute === "") {
    return true;
  }
  if (current === parent) {
    return false;
  }
  return isAnInteractiveElement(parent, current.parentElement);
}
function isEventInInteractiveElement(draggable2, event) {
  const target = event.target;
  if (!isHtmlElement(target)) {
    return false;
  }
  return isAnInteractiveElement(draggable2, target);
}
var getBorderBoxCenterPosition = (el) => getRect(el.getBoundingClientRect()).center;
function isElement(el) {
  return el instanceof getWindowFromEl(el).Element;
}
const supportedMatchesName = (() => {
  const base = "matches";
  if (typeof document === "undefined") {
    return base;
  }
  const candidates = [base, "msMatchesSelector", "webkitMatchesSelector"];
  const value = candidates.find((name) => name in Element.prototype);
  return value || base;
})();
function closestPonyfill(el, selector) {
  if (el == null) {
    return null;
  }
  if (el[supportedMatchesName](selector)) {
    return el;
  }
  return closestPonyfill(el.parentElement, selector);
}
function closest(el, selector) {
  if (el.closest) {
    return el.closest(selector);
  }
  return closestPonyfill(el, selector);
}
function getSelector(contextId) {
  return `[${dragHandle.contextId}="${contextId}"]`;
}
function findClosestDragHandleFromEvent(contextId, event) {
  const target = event.target;
  if (!isElement(target)) {
    return null;
  }
  const selector = getSelector(contextId);
  const handle = closest(target, selector);
  if (!handle) {
    return null;
  }
  if (!isHtmlElement(handle)) {
    return null;
  }
  return handle;
}
function tryGetClosestDraggableIdFromEvent(contextId, event) {
  const handle = findClosestDragHandleFromEvent(contextId, event);
  if (!handle) {
    return null;
  }
  return handle.getAttribute(dragHandle.draggableId);
}
function findDraggable(contextId, draggableId) {
  const selector = `[${draggable.contextId}="${contextId}"]`;
  const possible = querySelectorAll(document, selector);
  const draggable$1 = possible.find((el) => {
    return el.getAttribute(draggable.id) === draggableId;
  });
  if (!draggable$1) {
    return null;
  }
  if (!isHtmlElement(draggable$1)) {
    return null;
  }
  return draggable$1;
}
function preventDefault(event) {
  event.preventDefault();
}
function isActive({
  expected,
  phase,
  isLockActive,
  shouldWarn
}) {
  if (!isLockActive()) {
    return false;
  }
  if (expected !== phase) {
    return false;
  }
  return true;
}
function canStart({
  lockAPI,
  store,
  registry,
  draggableId
}) {
  if (lockAPI.isClaimed()) {
    return false;
  }
  const entry = registry.draggable.findById(draggableId);
  if (!entry) {
    return false;
  }
  if (!entry.options.isEnabled) {
    return false;
  }
  if (!canStartDrag(store.getState(), draggableId)) {
    return false;
  }
  return true;
}
function tryStart({
  lockAPI,
  contextId,
  store,
  registry,
  draggableId,
  forceSensorStop,
  sourceEvent
}) {
  const shouldStart = canStart({
    lockAPI,
    store,
    registry,
    draggableId
  });
  if (!shouldStart) {
    return null;
  }
  const entry = registry.draggable.getById(draggableId);
  const el = findDraggable(contextId, entry.descriptor.id);
  if (!el) {
    return null;
  }
  if (sourceEvent && !entry.options.canDragInteractiveElements && isEventInInteractiveElement(el, sourceEvent)) {
    return null;
  }
  const lock = lockAPI.claim(forceSensorStop || noop$2);
  let phase = "PRE_DRAG";
  function getShouldRespectForcePress() {
    return entry.options.shouldRespectForcePress;
  }
  function isLockActive() {
    return lockAPI.isActive(lock);
  }
  function tryDispatch(expected, getAction) {
    if (isActive({
      expected,
      phase,
      isLockActive,
      shouldWarn: true
    })) {
      store.dispatch(getAction());
    }
  }
  const tryDispatchWhenDragging = tryDispatch.bind(null, "DRAGGING");
  function lift2(args) {
    function completed() {
      lockAPI.release();
      phase = "COMPLETED";
    }
    if (phase !== "PRE_DRAG") {
      completed();
      invariant();
    }
    store.dispatch(lift$1(args.liftActionArgs));
    phase = "DRAGGING";
    function finish2(reason, options = {
      shouldBlockNextClick: false
    }) {
      args.cleanup();
      if (options.shouldBlockNextClick) {
        const unbind = bindEvents(window, [{
          eventName: "click",
          fn: preventDefault,
          options: {
            once: true,
            passive: false,
            capture: true
          }
        }]);
        setTimeout(unbind);
      }
      completed();
      store.dispatch(drop({
        reason
      }));
    }
    return {
      isActive: () => isActive({
        expected: "DRAGGING",
        phase,
        isLockActive,
        shouldWarn: false
      }),
      shouldRespectForcePress: getShouldRespectForcePress,
      drop: (options) => finish2("DROP", options),
      cancel: (options) => finish2("CANCEL", options),
      ...args.actions
    };
  }
  function fluidLift(clientSelection) {
    const move$1 = rafSchd((client) => {
      tryDispatchWhenDragging(() => move({
        client
      }));
    });
    const api = lift2({
      liftActionArgs: {
        id: draggableId,
        clientSelection,
        movementMode: "FLUID"
      },
      cleanup: () => move$1.cancel(),
      actions: {
        move: move$1
      }
    });
    return {
      ...api,
      move: move$1
    };
  }
  function snapLift() {
    const actions = {
      moveUp: () => tryDispatchWhenDragging(moveUp),
      moveRight: () => tryDispatchWhenDragging(moveRight),
      moveDown: () => tryDispatchWhenDragging(moveDown),
      moveLeft: () => tryDispatchWhenDragging(moveLeft)
    };
    return lift2({
      liftActionArgs: {
        id: draggableId,
        clientSelection: getBorderBoxCenterPosition(el),
        movementMode: "SNAP"
      },
      cleanup: noop$2,
      actions
    });
  }
  function abortPreDrag() {
    const shouldRelease = isActive({
      expected: "PRE_DRAG",
      phase,
      isLockActive,
      shouldWarn: true
    });
    if (shouldRelease) {
      lockAPI.release();
    }
  }
  const preDrag = {
    isActive: () => isActive({
      expected: "PRE_DRAG",
      phase,
      isLockActive,
      shouldWarn: false
    }),
    shouldRespectForcePress: getShouldRespectForcePress,
    fluidLift,
    snapLift,
    abort: abortPreDrag
  };
  return preDrag;
}
const defaultSensors = [useMouseSensor, useKeyboardSensor, useTouchSensor];
function useSensorMarshal({
  contextId,
  store,
  registry,
  customSensors,
  enableDefaultSensors
}) {
  const useSensors = [...enableDefaultSensors ? defaultSensors : [], ...customSensors || []];
  const lockAPI = reactExports.useState(() => create())[0];
  const tryAbandonLock = useCallback(function tryAbandonLock2(previous, current) {
    if (isDragging(previous) && !isDragging(current)) {
      lockAPI.tryAbandon();
    }
  }, [lockAPI]);
  useIsomorphicLayoutEffect(function listenToStore() {
    let previous = store.getState();
    const unsubscribe = store.subscribe(() => {
      const current = store.getState();
      tryAbandonLock(previous, current);
      previous = current;
    });
    return unsubscribe;
  }, [lockAPI, store, tryAbandonLock]);
  useIsomorphicLayoutEffect(() => {
    return lockAPI.tryAbandon;
  }, [lockAPI.tryAbandon]);
  const canGetLock = useCallback((draggableId) => {
    return canStart({
      lockAPI,
      registry,
      store,
      draggableId
    });
  }, [lockAPI, registry, store]);
  const tryGetLock = useCallback((draggableId, forceStop, options) => tryStart({
    lockAPI,
    registry,
    contextId,
    store,
    draggableId,
    forceSensorStop: forceStop || null,
    sourceEvent: options && options.sourceEvent ? options.sourceEvent : null
  }), [contextId, lockAPI, registry, store]);
  const findClosestDraggableId = useCallback((event) => tryGetClosestDraggableIdFromEvent(contextId, event), [contextId]);
  const findOptionsForDraggable = useCallback((id) => {
    const entry = registry.draggable.findById(id);
    return entry ? entry.options : null;
  }, [registry.draggable]);
  const tryReleaseLock = useCallback(function tryReleaseLock2() {
    if (!lockAPI.isClaimed()) {
      return;
    }
    lockAPI.tryAbandon();
    if (store.getState().phase !== "IDLE") {
      store.dispatch(flush());
    }
  }, [lockAPI, store]);
  const isLockClaimed = useCallback(() => lockAPI.isClaimed(), [lockAPI]);
  const api = useMemo(() => ({
    canGetLock,
    tryGetLock,
    findClosestDraggableId,
    findOptionsForDraggable,
    tryReleaseLock,
    isLockClaimed
  }), [canGetLock, tryGetLock, findClosestDraggableId, findOptionsForDraggable, tryReleaseLock, isLockClaimed]);
  for (let i = 0; i < useSensors.length; i++) {
    useSensors[i](api);
  }
}
const createResponders = (props) => ({
  onBeforeCapture: (t) => {
    const onBeforeCapureCallback = () => {
      if (props.onBeforeCapture) {
        props.onBeforeCapture(t);
      }
    };
    reactDomExports.flushSync(onBeforeCapureCallback);
  },
  onBeforeDragStart: props.onBeforeDragStart,
  onDragStart: props.onDragStart,
  onDragEnd: props.onDragEnd,
  onDragUpdate: props.onDragUpdate
});
const createAutoScrollerOptions = (props) => ({
  ...defaultAutoScrollerOptions,
  ...props.autoScrollerOptions,
  durationDampening: {
    ...defaultAutoScrollerOptions.durationDampening,
    ...props.autoScrollerOptions
  }
});
function getStore(lazyRef) {
  !lazyRef.current ? invariant() : void 0;
  return lazyRef.current;
}
function App(props) {
  const {
    contextId,
    setCallbacks,
    sensors,
    nonce,
    dragHandleUsageInstructions: dragHandleUsageInstructions2
  } = props;
  const lazyStoreRef = reactExports.useRef(null);
  const lastPropsRef = usePrevious(props);
  const getResponders = useCallback(() => {
    return createResponders(lastPropsRef.current);
  }, [lastPropsRef]);
  const getAutoScrollerOptions = useCallback(() => {
    return createAutoScrollerOptions(lastPropsRef.current);
  }, [lastPropsRef]);
  const announce = useAnnouncer(contextId);
  const dragHandleUsageInstructionsId = useHiddenTextElement({
    contextId,
    text: dragHandleUsageInstructions2
  });
  const styleMarshal = useStyleMarshal(contextId, nonce);
  const lazyDispatch = useCallback((action) => {
    getStore(lazyStoreRef).dispatch(action);
  }, []);
  const marshalCallbacks = useMemo(() => bindActionCreators$1({
    publishWhileDragging,
    updateDroppableScroll,
    updateDroppableIsEnabled,
    updateDroppableIsCombineEnabled,
    collectionStarting
  }, lazyDispatch), [lazyDispatch]);
  const registry = useRegistry();
  const dimensionMarshal = useMemo(() => {
    return createDimensionMarshal(registry, marshalCallbacks);
  }, [registry, marshalCallbacks]);
  const autoScroller = useMemo(() => createAutoScroller({
    scrollWindow,
    scrollDroppable: dimensionMarshal.scrollDroppable,
    getAutoScrollerOptions,
    ...bindActionCreators$1({
      move
    }, lazyDispatch)
  }), [dimensionMarshal.scrollDroppable, lazyDispatch, getAutoScrollerOptions]);
  const focusMarshal = useFocusMarshal(contextId);
  const store = useMemo(() => createStore({
    announce,
    autoScroller,
    dimensionMarshal,
    focusMarshal,
    getResponders,
    styleMarshal
  }), [announce, autoScroller, dimensionMarshal, focusMarshal, getResponders, styleMarshal]);
  lazyStoreRef.current = store;
  const tryResetStore = useCallback(() => {
    const current = getStore(lazyStoreRef);
    const state = current.getState();
    if (state.phase !== "IDLE") {
      current.dispatch(flush());
    }
  }, []);
  const isDragging2 = useCallback(() => {
    const state = getStore(lazyStoreRef).getState();
    if (state.phase === "DROP_ANIMATING") {
      return true;
    }
    if (state.phase === "IDLE") {
      return false;
    }
    return state.isDragging;
  }, []);
  const appCallbacks = useMemo(() => ({
    isDragging: isDragging2,
    tryAbort: tryResetStore
  }), [isDragging2, tryResetStore]);
  setCallbacks(appCallbacks);
  const getCanLift = useCallback((id) => canStartDrag(getStore(lazyStoreRef).getState(), id), []);
  const getIsMovementAllowed = useCallback(() => isMovementAllowed(getStore(lazyStoreRef).getState()), []);
  const appContext = useMemo(() => ({
    marshal: dimensionMarshal,
    focus: focusMarshal,
    contextId,
    canLift: getCanLift,
    isMovementAllowed: getIsMovementAllowed,
    dragHandleUsageInstructionsId,
    registry
  }), [contextId, dimensionMarshal, dragHandleUsageInstructionsId, focusMarshal, getCanLift, getIsMovementAllowed, registry]);
  useSensorMarshal({
    contextId,
    store,
    registry,
    customSensors: sensors || null,
    enableDefaultSensors: props.enableDefaultSensors !== false
  });
  reactExports.useEffect(() => {
    return tryResetStore;
  }, [tryResetStore]);
  return React.createElement(AppContext.Provider, {
    value: appContext
  }, React.createElement(Provider_default, {
    context: StoreContext,
    store
  }, props.children));
}
function useUniqueContextId() {
  return React.useId();
}
function DragDropContext(props) {
  const contextId = useUniqueContextId();
  const dragHandleUsageInstructions2 = props.dragHandleUsageInstructions || preset.dragHandleUsageInstructions;
  return React.createElement(ErrorBoundary, null, (setCallbacks) => React.createElement(App, {
    nonce: props.nonce,
    contextId,
    setCallbacks,
    dragHandleUsageInstructions: dragHandleUsageInstructions2,
    enableDefaultSensors: props.enableDefaultSensors,
    sensors: props.sensors,
    onBeforeCapture: props.onBeforeCapture,
    onBeforeDragStart: props.onBeforeDragStart,
    onDragStart: props.onDragStart,
    onDragUpdate: props.onDragUpdate,
    onDragEnd: props.onDragEnd,
    autoScrollerOptions: props.autoScrollerOptions
  }, props.children));
}
const zIndexOptions = {
  dragging: 5e3,
  dropAnimating: 4500
};
const getDraggingTransition = (shouldAnimateDragMovement, dropping) => {
  if (dropping) {
    return transitions.drop(dropping.duration);
  }
  if (shouldAnimateDragMovement) {
    return transitions.snap;
  }
  return transitions.fluid;
};
const getDraggingOpacity = (isCombining, isDropAnimating) => {
  if (!isCombining) {
    return void 0;
  }
  return isDropAnimating ? combine.opacity.drop : combine.opacity.combining;
};
const getShouldDraggingAnimate = (dragging) => {
  if (dragging.forceShouldAnimate != null) {
    return dragging.forceShouldAnimate;
  }
  return dragging.mode === "SNAP";
};
function getDraggingStyle(dragging) {
  const dimension = dragging.dimension;
  const box = dimension.client;
  const {
    offset: offset22,
    combineWith,
    dropping
  } = dragging;
  const isCombining = Boolean(combineWith);
  const shouldAnimate = getShouldDraggingAnimate(dragging);
  const isDropAnimating = Boolean(dropping);
  const transform = isDropAnimating ? transforms.drop(offset22, isCombining) : transforms.moveTo(offset22);
  const style2 = {
    position: "fixed",
    top: box.marginBox.top,
    left: box.marginBox.left,
    boxSizing: "border-box",
    width: box.borderBox.width,
    height: box.borderBox.height,
    transition: getDraggingTransition(shouldAnimate, dropping),
    transform,
    opacity: getDraggingOpacity(isCombining, isDropAnimating),
    zIndex: isDropAnimating ? zIndexOptions.dropAnimating : zIndexOptions.dragging,
    pointerEvents: "none"
  };
  return style2;
}
function getSecondaryStyle(secondary) {
  return {
    transform: transforms.moveTo(secondary.offset),
    transition: secondary.shouldAnimateDisplacement ? void 0 : "none"
  };
}
function getStyle$1(mapped) {
  return mapped.type === "DRAGGING" ? getDraggingStyle(mapped) : getSecondaryStyle(mapped);
}
function getDimension$1(descriptor, el, windowScroll = origin) {
  const computedStyles = window.getComputedStyle(el);
  const borderBox = el.getBoundingClientRect();
  const client = calculateBox(borderBox, computedStyles);
  const page = withScroll(client, windowScroll);
  const placeholder2 = {
    client,
    tagName: el.tagName.toLowerCase(),
    display: computedStyles.display
  };
  const displaceBy = {
    x: client.marginBox.width,
    y: client.marginBox.height
  };
  const dimension = {
    descriptor,
    placeholder: placeholder2,
    displaceBy,
    client,
    page
  };
  return dimension;
}
function useDraggablePublisher(args) {
  const uniqueId = useUniqueId("draggable");
  const {
    descriptor,
    registry,
    getDraggableRef,
    canDragInteractiveElements,
    shouldRespectForcePress,
    isEnabled
  } = args;
  const options = useMemo(() => ({
    canDragInteractiveElements,
    shouldRespectForcePress,
    isEnabled
  }), [canDragInteractiveElements, isEnabled, shouldRespectForcePress]);
  const getDimension2 = useCallback((windowScroll) => {
    const el = getDraggableRef();
    !el ? invariant() : void 0;
    return getDimension$1(descriptor, el, windowScroll);
  }, [descriptor, getDraggableRef]);
  const entry = useMemo(() => ({
    uniqueId,
    descriptor,
    options,
    getDimension: getDimension2
  }), [descriptor, getDimension2, options, uniqueId]);
  const publishedRef = reactExports.useRef(entry);
  const isFirstPublishRef = reactExports.useRef(true);
  useIsomorphicLayoutEffect(() => {
    registry.draggable.register(publishedRef.current);
    return () => registry.draggable.unregister(publishedRef.current);
  }, [registry.draggable]);
  useIsomorphicLayoutEffect(() => {
    if (isFirstPublishRef.current) {
      isFirstPublishRef.current = false;
      return;
    }
    const last = publishedRef.current;
    publishedRef.current = entry;
    registry.draggable.update(entry, last);
  }, [entry, registry.draggable]);
}
var DroppableContext = React.createContext(null);
function useRequiredContext(Context) {
  const result = reactExports.useContext(Context);
  !result ? invariant() : void 0;
  return result;
}
function preventHtml5Dnd(event) {
  event.preventDefault();
}
const Draggable = (props) => {
  const ref2 = reactExports.useRef(null);
  const setRef = useCallback((el = null) => {
    ref2.current = el;
  }, []);
  const getRef = useCallback(() => ref2.current, []);
  const {
    contextId,
    dragHandleUsageInstructionsId,
    registry
  } = useRequiredContext(AppContext);
  const {
    type,
    droppableId
  } = useRequiredContext(DroppableContext);
  const descriptor = useMemo(() => ({
    id: props.draggableId,
    index: props.index,
    type,
    droppableId
  }), [props.draggableId, props.index, type, droppableId]);
  const {
    children,
    draggableId,
    isEnabled,
    shouldRespectForcePress,
    canDragInteractiveElements,
    isClone,
    mapped,
    dropAnimationFinished: dropAnimationFinishedAction
  } = props;
  if (!isClone) {
    const forPublisher = useMemo(() => ({
      descriptor,
      registry,
      getDraggableRef: getRef,
      canDragInteractiveElements,
      shouldRespectForcePress,
      isEnabled
    }), [descriptor, registry, getRef, canDragInteractiveElements, shouldRespectForcePress, isEnabled]);
    useDraggablePublisher(forPublisher);
  }
  const dragHandleProps = useMemo(() => isEnabled ? {
    tabIndex: 0,
    role: "button",
    "aria-describedby": dragHandleUsageInstructionsId,
    "data-rfd-drag-handle-draggable-id": draggableId,
    "data-rfd-drag-handle-context-id": contextId,
    draggable: false,
    onDragStart: preventHtml5Dnd
  } : null, [contextId, dragHandleUsageInstructionsId, draggableId, isEnabled]);
  const onMoveEnd = useCallback((event) => {
    if (mapped.type !== "DRAGGING") {
      return;
    }
    if (!mapped.dropping) {
      return;
    }
    if (event.propertyName !== "transform") {
      return;
    }
    reactDomExports.flushSync(dropAnimationFinishedAction);
  }, [dropAnimationFinishedAction, mapped]);
  const provided = useMemo(() => {
    const style2 = getStyle$1(mapped);
    const onTransitionEnd = mapped.type === "DRAGGING" && mapped.dropping ? onMoveEnd : void 0;
    const result = {
      innerRef: setRef,
      draggableProps: {
        "data-rfd-draggable-context-id": contextId,
        "data-rfd-draggable-id": draggableId,
        style: style2,
        onTransitionEnd
      },
      dragHandleProps
    };
    return result;
  }, [contextId, dragHandleProps, draggableId, mapped, onMoveEnd, setRef]);
  const rubric = useMemo(() => ({
    draggableId: descriptor.id,
    type: descriptor.type,
    source: {
      index: descriptor.index,
      droppableId: descriptor.droppableId
    }
  }), [descriptor.droppableId, descriptor.id, descriptor.index, descriptor.type]);
  return React.createElement(React.Fragment, null, children(provided, mapped.snapshot, rubric));
};
var isStrictEqual = (a, b) => a === b;
var whatIsDraggedOverFromResult = (result) => {
  const {
    combine: combine2,
    destination
  } = result;
  if (destination) {
    return destination.droppableId;
  }
  if (combine2) {
    return combine2.droppableId;
  }
  return null;
};
const getCombineWithFromResult = (result) => {
  return result.combine ? result.combine.draggableId : null;
};
const getCombineWithFromImpact = (impact) => {
  return impact.at && impact.at.type === "COMBINE" ? impact.at.combine.draggableId : null;
};
function getDraggableSelector() {
  const memoizedOffset = memoizeOne((x, y) => ({
    x,
    y
  }));
  const getMemoizedSnapshot = memoizeOne((mode, isClone, draggingOver = null, combineWith = null, dropping = null) => ({
    isDragging: true,
    isClone,
    isDropAnimating: Boolean(dropping),
    dropAnimation: dropping,
    mode,
    draggingOver,
    combineWith,
    combineTargetFor: null
  }));
  const getMemoizedProps = memoizeOne((offset22, mode, dimension, isClone, draggingOver = null, combineWith = null, forceShouldAnimate = null) => ({
    mapped: {
      type: "DRAGGING",
      dropping: null,
      draggingOver,
      combineWith,
      mode,
      offset: offset22,
      dimension,
      forceShouldAnimate,
      snapshot: getMemoizedSnapshot(mode, isClone, draggingOver, combineWith, null)
    }
  }));
  const selector = (state, ownProps) => {
    if (isDragging(state)) {
      if (state.critical.draggable.id !== ownProps.draggableId) {
        return null;
      }
      const offset22 = state.current.client.offset;
      const dimension = state.dimensions.draggables[ownProps.draggableId];
      const draggingOver = whatIsDraggedOver(state.impact);
      const combineWith = getCombineWithFromImpact(state.impact);
      const forceShouldAnimate = state.forceShouldAnimate;
      return getMemoizedProps(memoizedOffset(offset22.x, offset22.y), state.movementMode, dimension, ownProps.isClone, draggingOver, combineWith, forceShouldAnimate);
    }
    if (state.phase === "DROP_ANIMATING") {
      const completed = state.completed;
      if (completed.result.draggableId !== ownProps.draggableId) {
        return null;
      }
      const isClone = ownProps.isClone;
      const dimension = state.dimensions.draggables[ownProps.draggableId];
      const result = completed.result;
      const mode = result.mode;
      const draggingOver = whatIsDraggedOverFromResult(result);
      const combineWith = getCombineWithFromResult(result);
      const duration = state.dropDuration;
      const dropping = {
        duration,
        curve: curves.drop,
        moveTo: state.newHomeClientOffset,
        opacity: combineWith ? combine.opacity.drop : null,
        scale: combineWith ? combine.scale.drop : null
      };
      return {
        mapped: {
          type: "DRAGGING",
          offset: state.newHomeClientOffset,
          dimension,
          dropping,
          draggingOver,
          combineWith,
          mode,
          forceShouldAnimate: null,
          snapshot: getMemoizedSnapshot(mode, isClone, draggingOver, combineWith, dropping)
        }
      };
    }
    return null;
  };
  return selector;
}
function getSecondarySnapshot(combineTargetFor = null) {
  return {
    isDragging: false,
    isDropAnimating: false,
    isClone: false,
    dropAnimation: null,
    mode: null,
    draggingOver: null,
    combineTargetFor,
    combineWith: null
  };
}
const atRest = {
  mapped: {
    type: "SECONDARY",
    offset: origin,
    combineTargetFor: null,
    shouldAnimateDisplacement: true,
    snapshot: getSecondarySnapshot(null)
  }
};
function getSecondarySelector() {
  const memoizedOffset = memoizeOne((x, y) => ({
    x,
    y
  }));
  const getMemoizedSnapshot = memoizeOne(getSecondarySnapshot);
  const getMemoizedProps = memoizeOne((offset22, combineTargetFor = null, shouldAnimateDisplacement) => ({
    mapped: {
      type: "SECONDARY",
      offset: offset22,
      combineTargetFor,
      shouldAnimateDisplacement,
      snapshot: getMemoizedSnapshot(combineTargetFor)
    }
  }));
  const getFallback = (combineTargetFor) => {
    return combineTargetFor ? getMemoizedProps(origin, combineTargetFor, true) : null;
  };
  const getProps = (ownId, draggingId, impact, afterCritical) => {
    const visualDisplacement = impact.displaced.visible[ownId];
    const isAfterCriticalInVirtualList = Boolean(afterCritical.inVirtualList && afterCritical.effected[ownId]);
    const combine2 = tryGetCombine(impact);
    const combineTargetFor = combine2 && combine2.draggableId === ownId ? draggingId : null;
    if (!visualDisplacement) {
      if (!isAfterCriticalInVirtualList) {
        return getFallback(combineTargetFor);
      }
      if (impact.displaced.invisible[ownId]) {
        return null;
      }
      const change = negate(afterCritical.displacedBy.point);
      const offset3 = memoizedOffset(change.x, change.y);
      return getMemoizedProps(offset3, combineTargetFor, true);
    }
    if (isAfterCriticalInVirtualList) {
      return getFallback(combineTargetFor);
    }
    const displaceBy = impact.displacedBy.point;
    const offset22 = memoizedOffset(displaceBy.x, displaceBy.y);
    return getMemoizedProps(offset22, combineTargetFor, visualDisplacement.shouldAnimate);
  };
  const selector = (state, ownProps) => {
    if (isDragging(state)) {
      if (state.critical.draggable.id === ownProps.draggableId) {
        return null;
      }
      return getProps(ownProps.draggableId, state.critical.draggable.id, state.impact, state.afterCritical);
    }
    if (state.phase === "DROP_ANIMATING") {
      const completed = state.completed;
      if (completed.result.draggableId === ownProps.draggableId) {
        return null;
      }
      return getProps(ownProps.draggableId, completed.result.draggableId, completed.impact, completed.afterCritical);
    }
    return null;
  };
  return selector;
}
const makeMapStateToProps$1 = () => {
  const draggingSelector = getDraggableSelector();
  const secondarySelector = getSecondarySelector();
  const selector = (state, ownProps) => draggingSelector(state, ownProps) || secondarySelector(state, ownProps) || atRest;
  return selector;
};
const mapDispatchToProps$1 = {
  dropAnimationFinished
};
const ConnectedDraggable = connect(makeMapStateToProps$1, mapDispatchToProps$1, null, {
  context: StoreContext,
  areStatePropsEqual: isStrictEqual
})(Draggable);
function PrivateDraggable(props) {
  const droppableContext = useRequiredContext(DroppableContext);
  const isUsingCloneFor = droppableContext.isUsingCloneFor;
  if (isUsingCloneFor === props.draggableId && !props.isClone) {
    return null;
  }
  return React.createElement(ConnectedDraggable, props);
}
function PublicDraggable(props) {
  const isEnabled = typeof props.isDragDisabled === "boolean" ? !props.isDragDisabled : true;
  const canDragInteractiveElements = Boolean(props.disableInteractiveElementBlocking);
  const shouldRespectForcePress = Boolean(props.shouldRespectForcePress);
  return React.createElement(PrivateDraggable, _extends({}, props, {
    isClone: false,
    isEnabled,
    canDragInteractiveElements,
    shouldRespectForcePress
  }));
}
const isEqual = (base) => (value) => base === value;
const isScroll = isEqual("scroll");
const isAuto = isEqual("auto");
const isEither = (overflow, fn) => fn(overflow.overflowX) || fn(overflow.overflowY);
const isElementScrollable = (el) => {
  const style2 = window.getComputedStyle(el);
  const overflow = {
    overflowX: style2.overflowX,
    overflowY: style2.overflowY
  };
  return isEither(overflow, isScroll) || isEither(overflow, isAuto);
};
const isBodyScrollable = () => {
  {
    return false;
  }
};
const getClosestScrollable = (el) => {
  if (el == null) {
    return null;
  }
  if (el === document.body) {
    return isBodyScrollable() ? el : null;
  }
  if (el === document.documentElement) {
    return null;
  }
  if (!isElementScrollable(el)) {
    return getClosestScrollable(el.parentElement);
  }
  return el;
};
var getScroll = (el) => ({
  x: el.scrollLeft,
  y: el.scrollTop
});
const getIsFixed = (el) => {
  if (!el) {
    return false;
  }
  const style2 = window.getComputedStyle(el);
  if (style2.position === "fixed") {
    return true;
  }
  return getIsFixed(el.parentElement);
};
var getEnv = (start2) => {
  const closestScrollable = getClosestScrollable(start2);
  const isFixedOnPage = getIsFixed(start2);
  return {
    closestScrollable,
    isFixedOnPage
  };
};
var getDroppableDimension = ({
  descriptor,
  isEnabled,
  isCombineEnabled,
  isFixedOnPage,
  direction,
  client,
  page,
  closest: closest2
}) => {
  const frame = (() => {
    if (!closest2) {
      return null;
    }
    const {
      scrollSize,
      client: frameClient
    } = closest2;
    const maxScroll = getMaxScroll({
      scrollHeight: scrollSize.scrollHeight,
      scrollWidth: scrollSize.scrollWidth,
      height: frameClient.paddingBox.height,
      width: frameClient.paddingBox.width
    });
    return {
      pageMarginBox: closest2.page.marginBox,
      frameClient,
      scrollSize,
      shouldClipSubject: closest2.shouldClipSubject,
      scroll: {
        initial: closest2.scroll,
        current: closest2.scroll,
        max: maxScroll,
        diff: {
          value: origin,
          displacement: origin
        }
      }
    };
  })();
  const axis = direction === "vertical" ? vertical : horizontal;
  const subject = getSubject({
    page,
    withPlaceholder: null,
    axis,
    frame
  });
  const dimension = {
    descriptor,
    isCombineEnabled,
    isFixedOnPage,
    axis,
    isEnabled,
    client,
    page,
    frame,
    subject
  };
  return dimension;
};
const getClient = (targetRef, closestScrollable) => {
  const base = getBox(targetRef);
  if (!closestScrollable) {
    return base;
  }
  if (targetRef !== closestScrollable) {
    return base;
  }
  const top = base.paddingBox.top - closestScrollable.scrollTop;
  const left = base.paddingBox.left - closestScrollable.scrollLeft;
  const bottom = top + closestScrollable.scrollHeight;
  const right = left + closestScrollable.scrollWidth;
  const paddingBox = {
    top,
    right,
    bottom,
    left
  };
  const borderBox = expand(paddingBox, base.border);
  const client = createBox({
    borderBox,
    margin: base.margin,
    border: base.border,
    padding: base.padding
  });
  return client;
};
var getDimension = ({
  ref: ref2,
  descriptor,
  env,
  windowScroll,
  direction,
  isDropDisabled,
  isCombineEnabled,
  shouldClipSubject
}) => {
  const closestScrollable = env.closestScrollable;
  const client = getClient(ref2, closestScrollable);
  const page = withScroll(client, windowScroll);
  const closest2 = (() => {
    if (!closestScrollable) {
      return null;
    }
    const frameClient = getBox(closestScrollable);
    const scrollSize = {
      scrollHeight: closestScrollable.scrollHeight,
      scrollWidth: closestScrollable.scrollWidth
    };
    return {
      client: frameClient,
      page: withScroll(frameClient, windowScroll),
      scroll: getScroll(closestScrollable),
      scrollSize,
      shouldClipSubject
    };
  })();
  const dimension = getDroppableDimension({
    descriptor,
    isEnabled: !isDropDisabled,
    isCombineEnabled,
    isFixedOnPage: env.isFixedOnPage,
    direction,
    client,
    page,
    closest: closest2
  });
  return dimension;
};
const immediate = {
  passive: false
};
const delayed = {
  passive: true
};
var getListenerOptions = (options) => options.shouldPublishImmediately ? immediate : delayed;
const getClosestScrollableFromDrag = (dragging) => dragging && dragging.env.closestScrollable || null;
function useDroppablePublisher(args) {
  const whileDraggingRef = reactExports.useRef(null);
  const appContext = useRequiredContext(AppContext);
  const uniqueId = useUniqueId("droppable");
  const {
    registry,
    marshal
  } = appContext;
  const previousRef = usePrevious(args);
  const descriptor = useMemo(() => ({
    id: args.droppableId,
    type: args.type,
    mode: args.mode
  }), [args.droppableId, args.mode, args.type]);
  const publishedDescriptorRef = reactExports.useRef(descriptor);
  const memoizedUpdateScroll = useMemo(() => memoizeOne((x, y) => {
    !whileDraggingRef.current ? invariant() : void 0;
    const scroll3 = {
      x,
      y
    };
    marshal.updateDroppableScroll(descriptor.id, scroll3);
  }), [descriptor.id, marshal]);
  const getClosestScroll = useCallback(() => {
    const dragging = whileDraggingRef.current;
    if (!dragging || !dragging.env.closestScrollable) {
      return origin;
    }
    return getScroll(dragging.env.closestScrollable);
  }, []);
  const updateScroll = useCallback(() => {
    const scroll3 = getClosestScroll();
    memoizedUpdateScroll(scroll3.x, scroll3.y);
  }, [getClosestScroll, memoizedUpdateScroll]);
  const scheduleScrollUpdate = useMemo(() => rafSchd(updateScroll), [updateScroll]);
  const onClosestScroll = useCallback(() => {
    const dragging = whileDraggingRef.current;
    const closest2 = getClosestScrollableFromDrag(dragging);
    !(dragging && closest2) ? invariant() : void 0;
    const options = dragging.scrollOptions;
    if (options.shouldPublishImmediately) {
      updateScroll();
      return;
    }
    scheduleScrollUpdate();
  }, [scheduleScrollUpdate, updateScroll]);
  const getDimensionAndWatchScroll = useCallback((windowScroll, options) => {
    !!whileDraggingRef.current ? invariant() : void 0;
    const previous = previousRef.current;
    const ref2 = previous.getDroppableRef();
    !ref2 ? invariant() : void 0;
    const env = getEnv(ref2);
    const dragging = {
      ref: ref2,
      descriptor,
      env,
      scrollOptions: options
    };
    whileDraggingRef.current = dragging;
    const dimension = getDimension({
      ref: ref2,
      descriptor,
      env,
      windowScroll,
      direction: previous.direction,
      isDropDisabled: previous.isDropDisabled,
      isCombineEnabled: previous.isCombineEnabled,
      shouldClipSubject: !previous.ignoreContainerClipping
    });
    const scrollable = env.closestScrollable;
    if (scrollable) {
      scrollable.setAttribute(scrollContainer.contextId, appContext.contextId);
      scrollable.addEventListener("scroll", onClosestScroll, getListenerOptions(dragging.scrollOptions));
    }
    return dimension;
  }, [appContext.contextId, descriptor, onClosestScroll, previousRef]);
  const getScrollWhileDragging = useCallback(() => {
    const dragging = whileDraggingRef.current;
    const closest2 = getClosestScrollableFromDrag(dragging);
    !(dragging && closest2) ? invariant() : void 0;
    return getScroll(closest2);
  }, []);
  const dragStopped = useCallback(() => {
    const dragging = whileDraggingRef.current;
    !dragging ? invariant() : void 0;
    const closest2 = getClosestScrollableFromDrag(dragging);
    whileDraggingRef.current = null;
    if (!closest2) {
      return;
    }
    scheduleScrollUpdate.cancel();
    closest2.removeAttribute(scrollContainer.contextId);
    closest2.removeEventListener("scroll", onClosestScroll, getListenerOptions(dragging.scrollOptions));
  }, [onClosestScroll, scheduleScrollUpdate]);
  const scroll2 = useCallback((change) => {
    const dragging = whileDraggingRef.current;
    !dragging ? invariant() : void 0;
    const closest2 = getClosestScrollableFromDrag(dragging);
    !closest2 ? invariant() : void 0;
    closest2.scrollTop += change.y;
    closest2.scrollLeft += change.x;
  }, []);
  const callbacks = useMemo(() => {
    return {
      getDimensionAndWatchScroll,
      getScrollWhileDragging,
      dragStopped,
      scroll: scroll2
    };
  }, [dragStopped, getDimensionAndWatchScroll, getScrollWhileDragging, scroll2]);
  const entry = useMemo(() => ({
    uniqueId,
    descriptor,
    callbacks
  }), [callbacks, descriptor, uniqueId]);
  useIsomorphicLayoutEffect(() => {
    publishedDescriptorRef.current = entry.descriptor;
    registry.droppable.register(entry);
    return () => {
      if (whileDraggingRef.current) {
        dragStopped();
      }
      registry.droppable.unregister(entry);
    };
  }, [callbacks, descriptor, dragStopped, entry, marshal, registry.droppable]);
  useIsomorphicLayoutEffect(() => {
    if (!whileDraggingRef.current) {
      return;
    }
    marshal.updateDroppableIsEnabled(publishedDescriptorRef.current.id, !args.isDropDisabled);
  }, [args.isDropDisabled, marshal]);
  useIsomorphicLayoutEffect(() => {
    if (!whileDraggingRef.current) {
      return;
    }
    marshal.updateDroppableIsCombineEnabled(publishedDescriptorRef.current.id, args.isCombineEnabled);
  }, [args.isCombineEnabled, marshal]);
}
function noop() {
}
const empty = {
  width: 0,
  height: 0,
  margin: noSpacing
};
const getSize = ({
  isAnimatingOpenOnMount,
  placeholder: placeholder2,
  animate
}) => {
  if (isAnimatingOpenOnMount) {
    return empty;
  }
  if (animate === "close") {
    return empty;
  }
  return {
    height: placeholder2.client.borderBox.height,
    width: placeholder2.client.borderBox.width,
    margin: placeholder2.client.margin
  };
};
const getStyle = ({
  isAnimatingOpenOnMount,
  placeholder: placeholder2,
  animate
}) => {
  const size = getSize({
    isAnimatingOpenOnMount,
    placeholder: placeholder2,
    animate
  });
  return {
    display: placeholder2.display,
    boxSizing: "border-box",
    width: size.width,
    height: size.height,
    marginTop: size.margin.top,
    marginRight: size.margin.right,
    marginBottom: size.margin.bottom,
    marginLeft: size.margin.left,
    flexShrink: "0",
    flexGrow: "0",
    pointerEvents: "none",
    transition: animate !== "none" ? transitions.placeholder : null
  };
};
const Placeholder = (props) => {
  const animateOpenTimerRef = reactExports.useRef(null);
  const tryClearAnimateOpenTimer = useCallback(() => {
    if (!animateOpenTimerRef.current) {
      return;
    }
    clearTimeout(animateOpenTimerRef.current);
    animateOpenTimerRef.current = null;
  }, []);
  const {
    animate,
    onTransitionEnd,
    onClose,
    contextId
  } = props;
  const [isAnimatingOpenOnMount, setIsAnimatingOpenOnMount] = reactExports.useState(props.animate === "open");
  reactExports.useEffect(() => {
    if (!isAnimatingOpenOnMount) {
      return noop;
    }
    if (animate !== "open") {
      tryClearAnimateOpenTimer();
      setIsAnimatingOpenOnMount(false);
      return noop;
    }
    if (animateOpenTimerRef.current) {
      return noop;
    }
    animateOpenTimerRef.current = setTimeout(() => {
      animateOpenTimerRef.current = null;
      setIsAnimatingOpenOnMount(false);
    });
    return tryClearAnimateOpenTimer;
  }, [animate, isAnimatingOpenOnMount, tryClearAnimateOpenTimer]);
  const onSizeChangeEnd = useCallback((event) => {
    if (event.propertyName !== "height") {
      return;
    }
    onTransitionEnd();
    if (animate === "close") {
      onClose();
    }
  }, [animate, onClose, onTransitionEnd]);
  const style2 = getStyle({
    isAnimatingOpenOnMount,
    animate: props.animate,
    placeholder: props.placeholder
  });
  return React.createElement(props.placeholder.tagName, {
    style: style2,
    "data-rfd-placeholder-context-id": contextId,
    onTransitionEnd: onSizeChangeEnd,
    ref: props.innerRef
  });
};
var Placeholder$1 = React.memo(Placeholder);
class AnimateInOut extends React.PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {
      isVisible: Boolean(this.props.on),
      data: this.props.on,
      animate: this.props.shouldAnimate && this.props.on ? "open" : "none"
    };
    this.onClose = () => {
      if (this.state.animate !== "close") {
        return;
      }
      this.setState({
        isVisible: false
      });
    };
  }
  static getDerivedStateFromProps(props, state) {
    if (!props.shouldAnimate) {
      return {
        isVisible: Boolean(props.on),
        data: props.on,
        animate: "none"
      };
    }
    if (props.on) {
      return {
        isVisible: true,
        data: props.on,
        animate: "open"
      };
    }
    if (state.isVisible) {
      return {
        isVisible: true,
        data: state.data,
        animate: "close"
      };
    }
    return {
      isVisible: false,
      animate: "close",
      data: null
    };
  }
  render() {
    if (!this.state.isVisible) {
      return null;
    }
    const provided = {
      onClose: this.onClose,
      data: this.state.data,
      animate: this.state.animate
    };
    return this.props.children(provided);
  }
}
const Droppable = (props) => {
  const appContext = reactExports.useContext(AppContext);
  !appContext ? invariant() : void 0;
  const {
    contextId,
    isMovementAllowed: isMovementAllowed2
  } = appContext;
  const droppableRef = reactExports.useRef(null);
  const placeholderRef = reactExports.useRef(null);
  const {
    children,
    droppableId,
    type,
    mode,
    direction,
    ignoreContainerClipping,
    isDropDisabled,
    isCombineEnabled,
    snapshot,
    useClone,
    updateViewportMaxScroll: updateViewportMaxScroll2,
    getContainerForClone
  } = props;
  const getDroppableRef = useCallback(() => droppableRef.current, []);
  const setDroppableRef = useCallback((value = null) => {
    droppableRef.current = value;
  }, []);
  useCallback(() => placeholderRef.current, []);
  const setPlaceholderRef = useCallback((value = null) => {
    placeholderRef.current = value;
  }, []);
  const onPlaceholderTransitionEnd = useCallback(() => {
    if (isMovementAllowed2()) {
      updateViewportMaxScroll2({
        maxScroll: getMaxWindowScroll()
      });
    }
  }, [isMovementAllowed2, updateViewportMaxScroll2]);
  useDroppablePublisher({
    droppableId,
    type,
    mode,
    direction,
    isDropDisabled,
    isCombineEnabled,
    ignoreContainerClipping,
    getDroppableRef
  });
  const placeholder2 = useMemo(() => React.createElement(AnimateInOut, {
    on: props.placeholder,
    shouldAnimate: props.shouldAnimatePlaceholder
  }, ({
    onClose,
    data,
    animate
  }) => React.createElement(Placeholder$1, {
    placeholder: data,
    onClose,
    innerRef: setPlaceholderRef,
    animate,
    contextId,
    onTransitionEnd: onPlaceholderTransitionEnd
  })), [contextId, onPlaceholderTransitionEnd, props.placeholder, props.shouldAnimatePlaceholder, setPlaceholderRef]);
  const provided = useMemo(() => ({
    innerRef: setDroppableRef,
    placeholder: placeholder2,
    droppableProps: {
      "data-rfd-droppable-id": droppableId,
      "data-rfd-droppable-context-id": contextId
    }
  }), [contextId, droppableId, placeholder2, setDroppableRef]);
  const isUsingCloneFor = useClone ? useClone.dragging.draggableId : null;
  const droppableContext = useMemo(() => ({
    droppableId,
    type,
    isUsingCloneFor
  }), [droppableId, isUsingCloneFor, type]);
  function getClone() {
    if (!useClone) {
      return null;
    }
    const {
      dragging,
      render
    } = useClone;
    const node = React.createElement(PrivateDraggable, {
      draggableId: dragging.draggableId,
      index: dragging.source.index,
      isClone: true,
      isEnabled: true,
      shouldRespectForcePress: false,
      canDragInteractiveElements: true
    }, (draggableProvided, draggableSnapshot) => render(draggableProvided, draggableSnapshot, dragging));
    return ReactDOM.createPortal(node, getContainerForClone());
  }
  return React.createElement(DroppableContext.Provider, {
    value: droppableContext
  }, children(provided, snapshot), getClone());
};
function getBody() {
  !document.body ? invariant() : void 0;
  return document.body;
}
const defaultProps = {
  mode: "standard",
  type: "DEFAULT",
  direction: "vertical",
  isDropDisabled: false,
  isCombineEnabled: false,
  ignoreContainerClipping: false,
  renderClone: null,
  getContainerForClone: getBody
};
const attachDefaultPropsToOwnProps = (ownProps) => {
  let mergedProps = {
    ...ownProps
  };
  let defaultPropKey;
  for (defaultPropKey in defaultProps) {
    if (ownProps[defaultPropKey] === void 0) {
      mergedProps = {
        ...mergedProps,
        [defaultPropKey]: defaultProps[defaultPropKey]
      };
    }
  }
  return mergedProps;
};
const isMatchingType = (type, critical) => type === critical.droppable.type;
const getDraggable = (critical, dimensions) => dimensions.draggables[critical.draggable.id];
const makeMapStateToProps = () => {
  const idleWithAnimation = {
    placeholder: null,
    shouldAnimatePlaceholder: true,
    snapshot: {
      isDraggingOver: false,
      draggingOverWith: null,
      draggingFromThisWith: null,
      isUsingPlaceholder: false
    },
    useClone: null
  };
  const idleWithoutAnimation = {
    ...idleWithAnimation,
    shouldAnimatePlaceholder: false
  };
  const getDraggableRubric = memoizeOne((descriptor) => ({
    draggableId: descriptor.id,
    type: descriptor.type,
    source: {
      index: descriptor.index,
      droppableId: descriptor.droppableId
    }
  }));
  const getMapProps = memoizeOne((id, isEnabled, isDraggingOverForConsumer, isDraggingOverForImpact, dragging, renderClone) => {
    const draggableId = dragging.descriptor.id;
    const isHome = dragging.descriptor.droppableId === id;
    if (isHome) {
      const useClone = renderClone ? {
        render: renderClone,
        dragging: getDraggableRubric(dragging.descriptor)
      } : null;
      const snapshot2 = {
        isDraggingOver: isDraggingOverForConsumer,
        draggingOverWith: isDraggingOverForConsumer ? draggableId : null,
        draggingFromThisWith: draggableId,
        isUsingPlaceholder: true
      };
      return {
        placeholder: dragging.placeholder,
        shouldAnimatePlaceholder: false,
        snapshot: snapshot2,
        useClone
      };
    }
    if (!isEnabled) {
      return idleWithoutAnimation;
    }
    if (!isDraggingOverForImpact) {
      return idleWithAnimation;
    }
    const snapshot = {
      isDraggingOver: isDraggingOverForConsumer,
      draggingOverWith: draggableId,
      draggingFromThisWith: null,
      isUsingPlaceholder: true
    };
    return {
      placeholder: dragging.placeholder,
      shouldAnimatePlaceholder: true,
      snapshot,
      useClone: null
    };
  });
  const selector = (state, ownProps) => {
    const ownPropsWithDefaultProps = attachDefaultPropsToOwnProps(ownProps);
    const id = ownPropsWithDefaultProps.droppableId;
    const type = ownPropsWithDefaultProps.type;
    const isEnabled = !ownPropsWithDefaultProps.isDropDisabled;
    const renderClone = ownPropsWithDefaultProps.renderClone;
    if (isDragging(state)) {
      const critical = state.critical;
      if (!isMatchingType(type, critical)) {
        return idleWithoutAnimation;
      }
      const dragging = getDraggable(critical, state.dimensions);
      const isDraggingOver = whatIsDraggedOver(state.impact) === id;
      return getMapProps(id, isEnabled, isDraggingOver, isDraggingOver, dragging, renderClone);
    }
    if (state.phase === "DROP_ANIMATING") {
      const completed = state.completed;
      if (!isMatchingType(type, completed.critical)) {
        return idleWithoutAnimation;
      }
      const dragging = getDraggable(completed.critical, state.dimensions);
      return getMapProps(id, isEnabled, whatIsDraggedOverFromResult(completed.result) === id, whatIsDraggedOver(completed.impact) === id, dragging, renderClone);
    }
    if (state.phase === "IDLE" && state.completed && !state.shouldFlush) {
      const completed = state.completed;
      if (!isMatchingType(type, completed.critical)) {
        return idleWithoutAnimation;
      }
      const wasOver = whatIsDraggedOver(completed.impact) === id;
      const wasCombining = Boolean(completed.impact.at && completed.impact.at.type === "COMBINE");
      const isHome = completed.critical.droppable.id === id;
      if (wasOver) {
        return wasCombining ? idleWithAnimation : idleWithoutAnimation;
      }
      if (isHome) {
        return idleWithAnimation;
      }
      return idleWithoutAnimation;
    }
    return idleWithoutAnimation;
  };
  return selector;
};
const mapDispatchToProps = {
  updateViewportMaxScroll
};
const ConnectedDroppable = connect(makeMapStateToProps, mapDispatchToProps, (stateProps, dispatchProps, ownProps) => {
  return {
    ...attachDefaultPropsToOwnProps(ownProps),
    ...stateProps,
    ...dispatchProps
  };
}, {
  context: StoreContext,
  areStatePropsEqual: isStrictEqual
})(Droppable);
export {
  ConnectedDroppable as C,
  DragDropContext as D,
  PublicDraggable as P
};
