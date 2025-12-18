import { a7 as requireReact, a0 as getDefaultExportFromCjs, r as reactExports, R as jsxRuntimeExports, a8 as React } from "../server.js";
import { r as requireShim } from "./sharpstate.es-CeF1Mf5b.js";
var withSelector = { exports: {} };
var withSelector_production = {};
var hasRequiredWithSelector_production;
function requireWithSelector_production() {
  if (hasRequiredWithSelector_production) return withSelector_production;
  hasRequiredWithSelector_production = 1;
  var React2 = requireReact(), shim = requireShim();
  function is(x, y) {
    return x === y && (0 !== x || 1 / x === 1 / y) || x !== x && y !== y;
  }
  var objectIs = "function" === typeof Object.is ? Object.is : is, useSyncExternalStore = shim.useSyncExternalStore, useRef = React2.useRef, useEffect = React2.useEffect, useMemo = React2.useMemo, useDebugValue = React2.useDebugValue;
  withSelector_production.useSyncExternalStoreWithSelector = function(subscribe, getSnapshot, getServerSnapshot, selector, isEqual) {
    var instRef = useRef(null);
    if (null === instRef.current) {
      var inst = { hasValue: false, value: null };
      instRef.current = inst;
    } else inst = instRef.current;
    instRef = useMemo(
      function() {
        function memoizedSelector(nextSnapshot) {
          if (!hasMemo) {
            hasMemo = true;
            memoizedSnapshot = nextSnapshot;
            nextSnapshot = selector(nextSnapshot);
            if (void 0 !== isEqual && inst.hasValue) {
              var currentSelection = inst.value;
              if (isEqual(currentSelection, nextSnapshot))
                return memoizedSelection = currentSelection;
            }
            return memoizedSelection = nextSnapshot;
          }
          currentSelection = memoizedSelection;
          if (objectIs(memoizedSnapshot, nextSnapshot)) return currentSelection;
          var nextSelection = selector(nextSnapshot);
          if (void 0 !== isEqual && isEqual(currentSelection, nextSelection))
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
      [getSnapshot, getServerSnapshot, selector, isEqual]
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
  return withSelector_production;
}
var hasRequiredWithSelector;
function requireWithSelector() {
  if (hasRequiredWithSelector) return withSelector.exports;
  hasRequiredWithSelector = 1;
  {
    withSelector.exports = requireWithSelector_production();
  }
  return withSelector.exports;
}
var withSelectorExports = requireWithSelector();
const useSyncExternalStoreExports = /* @__PURE__ */ getDefaultExportFromCjs(withSelectorExports);
let ReactiveFlags = /* @__PURE__ */ (function(ReactiveFlags2) {
  ReactiveFlags2[ReactiveFlags2["None"] = 0] = "None";
  ReactiveFlags2[ReactiveFlags2["Mutable"] = 1] = "Mutable";
  ReactiveFlags2[ReactiveFlags2["Watching"] = 2] = "Watching";
  ReactiveFlags2[ReactiveFlags2["RecursedCheck"] = 4] = "RecursedCheck";
  ReactiveFlags2[ReactiveFlags2["Recursed"] = 8] = "Recursed";
  ReactiveFlags2[ReactiveFlags2["Dirty"] = 16] = "Dirty";
  ReactiveFlags2[ReactiveFlags2["Pending"] = 32] = "Pending";
  return ReactiveFlags2;
})({});
// @__NO_SIDE_EFFECTS__
function createReactiveSystem({ update, notify, unwatched }) {
  return {
    link: link2,
    unlink: unlink2,
    propagate: propagate2,
    checkDirty: checkDirty2,
    shallowPropagate: shallowPropagate2
  };
  function link2(dep, sub, version) {
    const prevDep = sub.depsTail;
    if (prevDep !== void 0 && prevDep.dep === dep) return;
    const nextDep = prevDep !== void 0 ? prevDep.nextDep : sub.deps;
    if (nextDep !== void 0 && nextDep.dep === dep) {
      nextDep.version = version;
      sub.depsTail = nextDep;
      return;
    }
    const prevSub = dep.subsTail;
    if (prevSub !== void 0 && prevSub.version === version && prevSub.sub === sub) return;
    const newLink = sub.depsTail = dep.subsTail = {
      version,
      dep,
      sub,
      prevDep,
      nextDep,
      prevSub,
      nextSub: void 0
    };
    if (nextDep !== void 0) nextDep.prevDep = newLink;
    if (prevDep !== void 0) prevDep.nextDep = newLink;
    else sub.deps = newLink;
    if (prevSub !== void 0) prevSub.nextSub = newLink;
    else dep.subs = newLink;
  }
  function unlink2(link3, sub = link3.sub) {
    const dep = link3.dep;
    const prevDep = link3.prevDep;
    const nextDep = link3.nextDep;
    const nextSub = link3.nextSub;
    const prevSub = link3.prevSub;
    if (nextDep !== void 0) nextDep.prevDep = prevDep;
    else sub.depsTail = prevDep;
    if (prevDep !== void 0) prevDep.nextDep = nextDep;
    else sub.deps = nextDep;
    if (nextSub !== void 0) nextSub.prevSub = prevSub;
    else dep.subsTail = prevSub;
    if (prevSub !== void 0) prevSub.nextSub = nextSub;
    else if ((dep.subs = nextSub) === void 0) unwatched(dep);
    return nextDep;
  }
  function propagate2(link3) {
    let next = link3.nextSub;
    let stack;
    top: do {
      const sub = link3.sub;
      let flags = sub.flags;
      if (!(flags & (ReactiveFlags.RecursedCheck | ReactiveFlags.Recursed | ReactiveFlags.Dirty | ReactiveFlags.Pending))) sub.flags = flags | ReactiveFlags.Pending;
      else if (!(flags & (ReactiveFlags.RecursedCheck | ReactiveFlags.Recursed))) flags = ReactiveFlags.None;
      else if (!(flags & ReactiveFlags.RecursedCheck)) sub.flags = flags & ~ReactiveFlags.Recursed | ReactiveFlags.Pending;
      else if (!(flags & (ReactiveFlags.Dirty | ReactiveFlags.Pending)) && isValidLink(link3, sub)) {
        sub.flags = flags | (ReactiveFlags.Recursed | ReactiveFlags.Pending);
        flags &= ReactiveFlags.Mutable;
      } else flags = ReactiveFlags.None;
      if (flags & ReactiveFlags.Watching) notify(sub);
      if (flags & ReactiveFlags.Mutable) {
        const subSubs = sub.subs;
        if (subSubs !== void 0) {
          const nextSub = (link3 = subSubs).nextSub;
          if (nextSub !== void 0) {
            stack = {
              value: next,
              prev: stack
            };
            next = nextSub;
          }
          continue;
        }
      }
      if ((link3 = next) !== void 0) {
        next = link3.nextSub;
        continue;
      }
      while (stack !== void 0) {
        link3 = stack.value;
        stack = stack.prev;
        if (link3 !== void 0) {
          next = link3.nextSub;
          continue top;
        }
      }
      break;
    } while (true);
  }
  function checkDirty2(link3, sub) {
    let stack;
    let checkDepth = 0;
    let dirty = false;
    top: do {
      const dep = link3.dep;
      const flags = dep.flags;
      if (sub.flags & ReactiveFlags.Dirty) dirty = true;
      else if ((flags & (ReactiveFlags.Mutable | ReactiveFlags.Dirty)) === (ReactiveFlags.Mutable | ReactiveFlags.Dirty)) {
        if (update(dep)) {
          const subs = dep.subs;
          if (subs.nextSub !== void 0) shallowPropagate2(subs);
          dirty = true;
        }
      } else if ((flags & (ReactiveFlags.Mutable | ReactiveFlags.Pending)) === (ReactiveFlags.Mutable | ReactiveFlags.Pending)) {
        if (link3.nextSub !== void 0 || link3.prevSub !== void 0) stack = {
          value: link3,
          prev: stack
        };
        link3 = dep.deps;
        sub = dep;
        ++checkDepth;
        continue;
      }
      if (!dirty) {
        const nextDep = link3.nextDep;
        if (nextDep !== void 0) {
          link3 = nextDep;
          continue;
        }
      }
      while (checkDepth--) {
        const firstSub = sub.subs;
        const hasMultipleSubs = firstSub.nextSub !== void 0;
        if (hasMultipleSubs) {
          link3 = stack.value;
          stack = stack.prev;
        } else link3 = firstSub;
        if (dirty) {
          if (update(sub)) {
            if (hasMultipleSubs) shallowPropagate2(firstSub);
            sub = link3.sub;
            continue;
          }
          dirty = false;
        } else sub.flags &= ~ReactiveFlags.Pending;
        sub = link3.sub;
        const nextDep = link3.nextDep;
        if (nextDep !== void 0) {
          link3 = nextDep;
          continue top;
        }
      }
      return dirty;
    } while (true);
  }
  function shallowPropagate2(link3) {
    do {
      const sub = link3.sub;
      const flags = sub.flags;
      if ((flags & (ReactiveFlags.Pending | ReactiveFlags.Dirty)) === ReactiveFlags.Pending) {
        sub.flags = flags | ReactiveFlags.Dirty;
        if ((flags & (ReactiveFlags.Watching | ReactiveFlags.RecursedCheck)) === ReactiveFlags.Watching) notify(sub);
      }
    } while ((link3 = link3.nextSub) !== void 0);
  }
  function isValidLink(checkLink, sub) {
    let link3 = sub.depsTail;
    while (link3 !== void 0) {
      if (link3 === checkLink) return true;
      link3 = link3.prevDep;
    }
    return false;
  }
}
function toObserver(nextHandler, errorHandler, completionHandler) {
  const isObserver = typeof nextHandler === "object";
  const self = isObserver ? nextHandler : void 0;
  return {
    next: (isObserver ? nextHandler.next : nextHandler)?.bind(self),
    error: (isObserver ? nextHandler.error : errorHandler)?.bind(self),
    complete: (isObserver ? nextHandler.complete : completionHandler)?.bind(self)
  };
}
const queuedEffects = [];
let cycle = 0;
const { link, unlink, propagate, checkDirty, shallowPropagate } = /* @__PURE__ */ createReactiveSystem({
  update(atom) {
    return atom._update();
  },
  notify(effect2) {
    queuedEffects[queuedEffectsLength++] = effect2;
    effect2.flags &= ~ReactiveFlags.Watching;
  },
  unwatched(atom) {
    if (atom.depsTail !== void 0) {
      atom.depsTail = void 0;
      atom.flags = ReactiveFlags.Mutable | ReactiveFlags.Dirty;
      purgeDeps(atom);
    }
  }
});
let notifyIndex = 0;
let queuedEffectsLength = 0;
let activeSub;
let batchDepth = 0;
function batch(fn) {
  try {
    ++batchDepth;
    fn();
  } finally {
    if (!--batchDepth) flush();
  }
}
function purgeDeps(sub) {
  const depsTail = sub.depsTail;
  let dep = depsTail !== void 0 ? depsTail.nextDep : sub.deps;
  while (dep !== void 0) dep = unlink(dep, sub);
}
function flush() {
  if (batchDepth > 0) return;
  while (notifyIndex < queuedEffectsLength) {
    const effect2 = queuedEffects[notifyIndex];
    queuedEffects[notifyIndex++] = void 0;
    effect2.notify();
  }
  notifyIndex = 0;
  queuedEffectsLength = 0;
}
function createAtom(valueOrFn, options) {
  const isComputed = typeof valueOrFn === "function";
  const getter = valueOrFn;
  const atom = {
    _snapshot: isComputed ? void 0 : valueOrFn,
    subs: void 0,
    subsTail: void 0,
    deps: void 0,
    depsTail: void 0,
    flags: isComputed ? ReactiveFlags.None : ReactiveFlags.Mutable,
    get() {
      if (activeSub !== void 0) link(atom, activeSub, cycle);
      return atom._snapshot;
    },
    subscribe(observerOrFn) {
      const obs = toObserver(observerOrFn);
      const observed = { current: false };
      const e = effect(() => {
        atom.get();
        if (!observed.current) observed.current = true;
        else obs.next?.(atom._snapshot);
      });
      return { unsubscribe: () => {
        e.stop();
      } };
    },
    _update(getValue) {
      const prevSub = activeSub;
      const compare = Object.is;
      if (isComputed) {
        activeSub = atom;
        ++cycle;
        atom.depsTail = void 0;
      } else if (getValue === void 0) return false;
      if (isComputed) atom.flags = ReactiveFlags.Mutable | ReactiveFlags.RecursedCheck;
      try {
        const oldValue = atom._snapshot;
        const newValue = typeof getValue === "function" ? getValue(oldValue) : getValue === void 0 && isComputed ? getter(oldValue) : getValue;
        if (oldValue === void 0 || !compare(oldValue, newValue)) {
          atom._snapshot = newValue;
          return true;
        }
        return false;
      } finally {
        activeSub = prevSub;
        if (isComputed) atom.flags &= ~ReactiveFlags.RecursedCheck;
        purgeDeps(atom);
      }
    }
  };
  if (isComputed) {
    atom.flags = ReactiveFlags.Mutable | ReactiveFlags.Dirty;
    atom.get = function() {
      const flags = atom.flags;
      if (flags & ReactiveFlags.Dirty || flags & ReactiveFlags.Pending && checkDirty(atom.deps, atom)) {
        if (atom._update()) {
          const subs = atom.subs;
          if (subs !== void 0) shallowPropagate(subs);
        }
      } else if (flags & ReactiveFlags.Pending) atom.flags = flags & ~ReactiveFlags.Pending;
      if (activeSub !== void 0) link(atom, activeSub, cycle);
      return atom._snapshot;
    };
  } else atom.set = function(valueOrFn2) {
    if (atom._update(valueOrFn2)) {
      const subs = atom.subs;
      if (subs !== void 0) {
        propagate(subs);
        shallowPropagate(subs);
        flush();
      }
    }
  };
  return atom;
}
function effect(fn) {
  const run = () => {
    const prevSub = activeSub;
    activeSub = effectObj;
    ++cycle;
    effectObj.depsTail = void 0;
    effectObj.flags = ReactiveFlags.Watching | ReactiveFlags.RecursedCheck;
    try {
      return fn();
    } finally {
      activeSub = prevSub;
      effectObj.flags &= ~ReactiveFlags.RecursedCheck;
      purgeDeps(effectObj);
    }
  };
  const effectObj = {
    deps: void 0,
    depsTail: void 0,
    subs: void 0,
    subsTail: void 0,
    flags: ReactiveFlags.Watching | ReactiveFlags.RecursedCheck,
    notify() {
      const flags = this.flags;
      if (flags & ReactiveFlags.Dirty || flags & ReactiveFlags.Pending && checkDirty(this.deps, this)) run();
      else this.flags = ReactiveFlags.Watching;
    },
    stop() {
      this.flags = ReactiveFlags.None;
      this.depsTail = void 0;
      purgeDeps(this);
    }
  };
  run();
  return effectObj;
}
var Store = class {
  constructor(valueOrFn, actionsFactory) {
    this.atom = createAtom(valueOrFn);
    this.get = this.get.bind(this);
    this.setState = this.setState.bind(this);
    this.subscribe = this.subscribe.bind(this);
    if (actionsFactory) this.actions = actionsFactory(this);
  }
  setState(updater) {
    this.atom.set(updater);
  }
  get state() {
    return this.atom.get();
  }
  get() {
    return this.state;
  }
  subscribe(observerOrFn) {
    return this.atom.subscribe(toObserver(observerOrFn));
  }
};
var ReadonlyStore = class {
  constructor(valueOrFn) {
    this.atom = createAtom(valueOrFn);
  }
  get state() {
    return this.atom.get();
  }
  get() {
    return this.state;
  }
  subscribe(observerOrFn) {
    return this.atom.subscribe(toObserver(observerOrFn));
  }
};
function createStore(valueOrFn, actions) {
  if (typeof valueOrFn === "function") return new ReadonlyStore(valueOrFn);
  return new Store(valueOrFn);
}
var LiteThrottler = class {
  constructor(fn, options) {
    this.fn = fn;
    this.options = options;
    this.lastExecutionTime = 0;
    this.isPending = false;
    this.maybeExecute = (...args) => {
      const timeSinceLastExecution = Date.now() - this.lastExecutionTime;
      if (this.options.leading && timeSinceLastExecution >= this.options.wait) this.execute(...args);
      else {
        this.lastArgs = args;
        if (!this.timeoutId && this.options.trailing) {
          const timeoutDuration = this.options.wait - timeSinceLastExecution;
          this.isPending = true;
          this.timeoutId = setTimeout(() => {
            if (this.lastArgs !== void 0) this.execute(...this.lastArgs);
          }, timeoutDuration);
        }
      }
    };
    this.execute = (...args) => {
      this.fn(...args);
      this.options.onExecute?.(args, this);
      this.lastExecutionTime = Date.now();
      this.clearTimeout();
      this.lastArgs = void 0;
      this.isPending = false;
    };
    this.flush = () => {
      if (this.isPending && this.lastArgs) this.execute(...this.lastArgs);
    };
    this.cancel = () => {
      this.clearTimeout();
      this.lastArgs = void 0;
      this.isPending = false;
    };
    this.clearTimeout = () => {
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.timeoutId = void 0;
      }
    };
    if (this.options.leading === void 0 && this.options.trailing === void 0) {
      this.options.leading = true;
      this.options.trailing = true;
    }
  }
};
function liteThrottle(fn, options) {
  return new LiteThrottler(fn, options).maybeExecute;
}
var EventClient = class {
  #enabled = true;
  #pluginId;
  #eventTarget;
  #debug;
  #queuedEvents;
  #connected;
  #connectIntervalId;
  #connectEveryMs;
  #retryCount = 0;
  #maxRetries = 5;
  #connecting = false;
  #failedToConnect = false;
  #internalEventTarget = null;
  #onConnected = () => {
    this.debugLog("Connected to event bus");
    this.#connected = true;
    this.#connecting = false;
    this.debugLog("Emitting queued events", this.#queuedEvents);
    this.#queuedEvents.forEach((event) => this.emitEventToBus(event));
    this.#queuedEvents = [];
    this.stopConnectLoop();
    this.#eventTarget().removeEventListener("tanstack-connect-success", this.#onConnected);
  };
  #retryConnection = () => {
    if (this.#retryCount < this.#maxRetries) {
      this.#retryCount++;
      this.dispatchCustomEvent("tanstack-connect", {});
      return;
    }
    this.#eventTarget().removeEventListener("tanstack-connect", this.#retryConnection);
    this.#failedToConnect = true;
    this.debugLog("Max retries reached, giving up on connection");
    this.stopConnectLoop();
  };
  #connectFunction = () => {
    if (this.#connecting) return;
    this.#connecting = true;
    this.#eventTarget().addEventListener("tanstack-connect-success", this.#onConnected);
    this.#retryConnection();
  };
  constructor({ pluginId, debug = false, enabled = true, reconnectEveryMs = 300 }) {
    this.#pluginId = pluginId;
    this.#enabled = enabled;
    this.#eventTarget = this.getGlobalTarget;
    this.#debug = debug;
    this.debugLog(" Initializing event subscription for plugin", this.#pluginId);
    this.#queuedEvents = [];
    this.#connected = false;
    this.#failedToConnect = false;
    this.#connectIntervalId = null;
    this.#connectEveryMs = reconnectEveryMs;
  }
  startConnectLoop() {
    if (this.#connectIntervalId !== null || this.#connected) return;
    this.debugLog(`Starting connect loop (every ${this.#connectEveryMs}ms)`);
    this.#connectIntervalId = setInterval(this.#retryConnection, this.#connectEveryMs);
  }
  stopConnectLoop() {
    this.#connecting = false;
    if (this.#connectIntervalId === null) return;
    clearInterval(this.#connectIntervalId);
    this.#connectIntervalId = null;
    this.#queuedEvents = [];
    this.debugLog("Stopped connect loop");
  }
  debugLog(...args) {
    if (this.#debug) console.log(`🌴 [tanstack-devtools:${this.#pluginId}-plugin]`, ...args);
  }
  getGlobalTarget() {
    if (typeof globalThis !== "undefined" && globalThis.__TANSTACK_EVENT_TARGET__) {
      this.debugLog("Using global event target");
      return globalThis.__TANSTACK_EVENT_TARGET__;
    }
    if (typeof window !== "undefined" && typeof window.addEventListener !== "undefined") {
      this.debugLog("Using window as event target");
      return window;
    }
    const eventTarget = typeof EventTarget !== "undefined" ? new EventTarget() : void 0;
    if (typeof eventTarget === "undefined" || typeof eventTarget.addEventListener === "undefined") {
      this.debugLog("No event mechanism available, running in non-web environment");
      return {
        addEventListener: () => {
        },
        removeEventListener: () => {
        },
        dispatchEvent: () => false
      };
    }
    this.debugLog("Using new EventTarget as fallback");
    return eventTarget;
  }
  getPluginId() {
    return this.#pluginId;
  }
  dispatchCustomEventShim(eventName, detail) {
    try {
      const event = new Event(eventName, { detail });
      this.#eventTarget().dispatchEvent(event);
    } catch (e) {
      this.debugLog("Failed to dispatch shim event");
    }
  }
  dispatchCustomEvent(eventName, detail) {
    try {
      this.#eventTarget().dispatchEvent(new CustomEvent(eventName, { detail }));
    } catch (e) {
      this.dispatchCustomEventShim(eventName, detail);
    }
  }
  emitEventToBus(event) {
    this.debugLog("Emitting event to client bus", event);
    this.dispatchCustomEvent("tanstack-dispatch-event", event);
  }
  createEventPayload(eventSuffix, payload) {
    return {
      type: `${this.#pluginId}:${eventSuffix}`,
      payload,
      pluginId: this.#pluginId
    };
  }
  emit(eventSuffix, payload) {
    if (!this.#enabled) {
      this.debugLog("Event bus client is disabled, not emitting event", eventSuffix, payload);
      return;
    }
    if (this.#internalEventTarget) {
      this.debugLog("Emitting event to internal event target", eventSuffix, payload);
      this.#internalEventTarget.dispatchEvent(new CustomEvent(`${this.#pluginId}:${eventSuffix}`, { detail: this.createEventPayload(eventSuffix, payload) }));
    }
    if (this.#failedToConnect) {
      this.debugLog("Previously failed to connect, not emitting to bus");
      return;
    }
    if (!this.#connected) {
      this.debugLog("Bus not available, will be pushed as soon as connected");
      this.#queuedEvents.push(this.createEventPayload(eventSuffix, payload));
      if (typeof CustomEvent !== "undefined" && !this.#connecting) {
        this.#connectFunction();
        this.startConnectLoop();
      }
      return;
    }
    return this.emitEventToBus(this.createEventPayload(eventSuffix, payload));
  }
  on(eventSuffix, cb, options) {
    const withEventTarget = options?.withEventTarget ?? false;
    const eventName = `${this.#pluginId}:${eventSuffix}`;
    if (withEventTarget) {
      if (!this.#internalEventTarget) this.#internalEventTarget = new EventTarget();
      this.#internalEventTarget.addEventListener(eventName, (e) => {
        cb(e.detail);
      });
    }
    if (!this.#enabled) {
      this.debugLog("Event bus client is disabled, not registering event", eventName);
      return () => {
      };
    }
    const handler = (e) => {
      this.debugLog("Received event from bus", e.detail);
      cb(e.detail);
    };
    this.#eventTarget().addEventListener(eventName, handler);
    this.debugLog("Registered event to bus", eventName);
    return () => {
      if (withEventTarget) this.#internalEventTarget?.removeEventListener(eventName, handler);
      this.#eventTarget().removeEventListener(eventName, handler);
    };
  }
  onAll(cb) {
    if (!this.#enabled) {
      this.debugLog("Event bus client is disabled, not registering event");
      return () => {
      };
    }
    const handler = (e) => {
      const event = e.detail;
      cb(event);
    };
    this.#eventTarget().addEventListener("tanstack-devtools-global", handler);
    return () => this.#eventTarget().removeEventListener("tanstack-devtools-global", handler);
  }
  onAllPluginEvents(cb) {
    if (!this.#enabled) {
      this.debugLog("Event bus client is disabled, not registering event");
      return () => {
      };
    }
    const handler = (e) => {
      const event = e.detail;
      if (this.#pluginId && event.pluginId !== this.#pluginId) return;
      cb(event);
    };
    this.#eventTarget().addEventListener("tanstack-devtools-global", handler);
    return () => this.#eventTarget().removeEventListener("tanstack-devtools-global", handler);
  }
};
class FormEventClient extends EventClient {
  constructor() {
    super({
      pluginId: "form-devtools",
      reconnectEveryMs: 1e3
    });
  }
}
const formEventClient = new FormEventClient();
function functionalUpdate(updater, input) {
  return typeof updater === "function" ? updater(input) : updater;
}
function getBy(obj, path) {
  const pathObj = makePathArray(path);
  return pathObj.reduce((current, pathPart) => {
    if (current === null) return null;
    if (typeof current !== "undefined") {
      return current[pathPart];
    }
    return void 0;
  }, obj);
}
function setBy(obj, _path, updater) {
  const path = makePathArray(_path);
  function doSet(parent) {
    if (!path.length) {
      return functionalUpdate(updater, parent);
    }
    const key = path.shift();
    if (typeof key === "string" || typeof key === "number" && !Array.isArray(parent)) {
      if (typeof parent === "object") {
        if (parent === null) {
          parent = {};
        }
        return {
          ...parent,
          [key]: doSet(parent[key])
        };
      }
      return {
        [key]: doSet()
      };
    }
    if (Array.isArray(parent) && typeof key === "number") {
      const prefix = parent.slice(0, key);
      return [
        ...prefix.length ? prefix : new Array(key),
        doSet(parent[key]),
        ...parent.slice(key + 1)
      ];
    }
    return [...new Array(key), doSet()];
  }
  return doSet(obj);
}
function deleteBy(obj, _path) {
  const path = makePathArray(_path);
  function doDelete(parent) {
    if (!parent) return;
    if (path.length === 1) {
      const finalPath = path[0];
      if (Array.isArray(parent) && typeof finalPath === "number") {
        return parent.filter((_, i) => i !== finalPath);
      }
      const { [finalPath]: remove, ...rest } = parent;
      return rest;
    }
    const key = path.shift();
    if (typeof key === "string" || typeof key === "number" && !Array.isArray(parent)) {
      if (typeof parent === "object") {
        return {
          ...parent,
          [key]: doDelete(parent[key])
        };
      }
    }
    if (typeof key === "number") {
      if (Array.isArray(parent)) {
        if (key >= parent.length) {
          return parent;
        }
        const prefix = parent.slice(0, key);
        return [
          ...prefix.length ? prefix : new Array(key),
          doDelete(parent[key]),
          ...parent.slice(key + 1)
        ];
      }
    }
    throw new Error("It seems we have created an infinite loop in deleteBy. ");
  }
  return doDelete(obj);
}
const CC_DOT = 46;
const CC_OPEN = 91;
const CC_CLOSE = 93;
const CC_ZERO = 48;
const CC_NINE = 57;
function makePathArray(str) {
  if (Array.isArray(str)) {
    return [...str];
  }
  if (typeof str !== "string") {
    throw new Error("Path must be a string.");
  }
  const len = str.length;
  const result = [];
  let segStart = len > 0 && str.charCodeAt(0) === CC_OPEN ? 1 : 0;
  let allDigits = true;
  let prev = -1;
  for (let i = segStart; i <= len; i++) {
    const char = i < len ? str.charCodeAt(i) : -1;
    if (i === len || char === CC_DOT || char === CC_OPEN || char === CC_CLOSE) {
      const segLen = i - segStart;
      if (segLen > 0) {
        const treatAsNumber = (
          // ...it must contain only digits...
          allDigits && // ...and either be a single '0' or not start with '0'.
          (segLen === 1 || str.charCodeAt(segStart) !== CC_ZERO)
        );
        const seg = str.slice(segStart, i);
        if (treatAsNumber) {
          const num = parseInt(seg, 10);
          if (segLen <= 15 || String(num) === seg) {
            result.push(num);
          } else {
            result.push(seg);
          }
        } else {
          result.push(seg);
        }
      } else if (
        // This branch, which handles empty segments, only exists to preserve
        // the old behavior for malformed input.
        // Push the empty segment unless this is a "phantom boundary" the
        // old regex impl would have absorbed:
        //   1. `]` was always stripped — `prev === ']'` means the real
        //      boundary already happened on the previous iteration.
        //   2. A leading `]` was stripped too (the leading `[` strip
        //      above handles its counterpart for `[`).
        //   3. `..` and `[[` collapse to a single boundary.
        prev !== CC_CLOSE && !(prev === -1 && char === CC_CLOSE) && !(prev === char && (char === CC_DOT || char === CC_OPEN))
      ) {
        result.push("");
      }
      segStart = i + 1;
      allDigits = true;
    } else if (char < CC_ZERO || char > CC_NINE) {
      allDigits = false;
    }
    prev = char;
  }
  if (!result.length) result.push("");
  return result;
}
function isNonEmptyArray(obj) {
  return !(Array.isArray(obj) && obj.length === 0);
}
function getSyncValidatorArray(cause, options) {
  const runValidation = (props) => {
    return props.validators.filter(Boolean).map((validator) => {
      return {
        cause: validator.cause,
        validate: validator.fn
      };
    });
  };
  return options.validationLogic({
    form: options.form,
    group: options.group,
    validators: options.validators,
    event: { type: cause, fieldName: options.fieldName, async: false },
    runValidation
  });
}
function getAsyncValidatorArray(cause, options) {
  const { asyncDebounceMs } = options;
  const {
    onBlurAsyncDebounceMs,
    onChangeAsyncDebounceMs,
    onDynamicAsyncDebounceMs
  } = options.validators || {};
  const defaultDebounceMs = asyncDebounceMs ?? 0;
  const runValidation = (props) => {
    return props.validators.filter(Boolean).map((validator) => {
      const validatorCause = validator?.cause || cause;
      let debounceMs = defaultDebounceMs;
      switch (validatorCause) {
        case "change":
          debounceMs = onChangeAsyncDebounceMs ?? defaultDebounceMs;
          break;
        case "blur":
          debounceMs = onBlurAsyncDebounceMs ?? defaultDebounceMs;
          break;
        case "dynamic":
          debounceMs = onDynamicAsyncDebounceMs ?? defaultDebounceMs;
          break;
        case "submit":
          debounceMs = 0;
          break;
      }
      if (cause === "submit") {
        debounceMs = 0;
      }
      return {
        cause: validatorCause,
        validate: validator.fn,
        debounceMs
      };
    });
  };
  return options.validationLogic({
    form: options.form,
    group: options.group,
    validators: options.validators,
    event: { type: cause, fieldName: options.fieldName, async: true },
    runValidation
  });
}
const isGlobalFormValidationError = (error) => {
  return !!error && typeof error === "object" && "fields" in error;
};
function evaluate(objA, objB) {
  if (Object.is(objA, objB)) {
    return true;
  }
  if (typeof objA !== "object" || objA === null || typeof objB !== "object" || objB === null) {
    return false;
  }
  if (objA instanceof Date && objB instanceof Date) {
    return objA.getTime() === objB.getTime();
  }
  if (objA instanceof Map && objB instanceof Map) {
    if (objA.size !== objB.size) return false;
    for (const [k, v] of objA) {
      if (!objB.has(k) || !Object.is(v, objB.get(k))) return false;
    }
    return true;
  }
  if (objA instanceof Set && objB instanceof Set) {
    if (objA.size !== objB.size) return false;
    for (const v of objA) {
      if (!objB.has(v)) return false;
    }
    return true;
  }
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  if (keysA.length !== keysB.length) {
    return false;
  }
  if (keysA.length === 0 && !Array.isArray(objA) && !Array.isArray(objB) && (Object.getPrototypeOf(objA) !== Object.prototype || Object.getPrototypeOf(objB) !== Object.prototype)) {
    return false;
  }
  for (const key of keysA) {
    if (!keysB.includes(key) || !evaluate(objA[key], objB[key])) {
      return false;
    }
  }
  return true;
}
const determineFormLevelErrorSourceAndValue = ({
  newFormValidatorError,
  isPreviousErrorFromFormValidator,
  previousErrorValue
}) => {
  if (newFormValidatorError) {
    return { newErrorValue: newFormValidatorError, newSource: "form" };
  }
  if (isPreviousErrorFromFormValidator) {
    return { newErrorValue: void 0, newSource: void 0 };
  }
  if (previousErrorValue) {
    return { newErrorValue: previousErrorValue, newSource: "field" };
  }
  return { newErrorValue: void 0, newSource: void 0 };
};
const determineFieldLevelErrorSourceAndValue = ({
  formLevelError,
  fieldLevelError
}) => {
  if (fieldLevelError) {
    return { newErrorValue: fieldLevelError, newSource: "field" };
  }
  if (formLevelError) {
    return { newErrorValue: formLevelError, newSource: "form" };
  }
  return { newErrorValue: void 0, newSource: void 0 };
};
function mergeOpts(originalOpts, overrides) {
  if (originalOpts === void 0 || originalOpts === null) {
    return overrides;
  }
  return { ...originalOpts, ...overrides };
}
let IDX = 256;
const HEX = [];
let BUFFER;
while (IDX--) {
  HEX[IDX] = (IDX + 256).toString(16).substring(1);
}
function uuid() {
  let i = 0;
  let num;
  let out = "";
  if (!BUFFER || IDX + 16 > 256) {
    BUFFER = new Array(256);
    i = 256;
    while (i--) {
      BUFFER[i] = 256 * Math.random() | 0;
    }
    i = 0;
    IDX = 0;
  }
  for (; i < 16; i++) {
    num = BUFFER[IDX + i];
    if (i === 6) out += HEX[num & 15 | 64];
    else if (i === 8) out += HEX[num & 63 | 128];
    else out += HEX[num];
    if (i & 1 && i > 1 && i < 11) out += "-";
  }
  IDX++;
  return out;
}
const throttleFormState = liteThrottle(
  (form) => formEventClient.emit("form-state", {
    id: form.formId,
    state: form.store.state
  }),
  {
    wait: 300
  }
);
function deepCopy(obj) {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  if (Array.isArray(obj)) {
    const arrCopy = [];
    for (let i = 0; i < obj.length; i++) {
      arrCopy[i] = deepCopy(obj[i]);
    }
    return arrCopy;
  }
  if (obj instanceof Map) {
    const mapCopy = /* @__PURE__ */ new Map();
    obj.forEach((value, key) => {
      mapCopy.set(key, deepCopy(value));
    });
    return mapCopy;
  }
  if (obj instanceof Set) {
    const setCopy = /* @__PURE__ */ new Set();
    obj.forEach((value) => {
      setCopy.add(deepCopy(value));
    });
    return setCopy;
  }
  const copy = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      copy[key] = deepCopy(obj[key]);
    }
  }
  return copy;
}
function isFieldInGroup(groupName, fieldName) {
  return fieldName === groupName || fieldName.startsWith(`${groupName}.`) || fieldName.startsWith(`${groupName}[`);
}
const defaultValidationLogic = (props) => {
  if (!props.validators) {
    return props.runValidation({
      validators: [],
      form: props.form
    });
  }
  const isAsync = props.event.async;
  const onMountValidator = isAsync ? void 0 : { fn: props.validators.onMount, cause: "mount" };
  const onChangeValidator = {
    fn: isAsync ? props.validators.onChangeAsync : props.validators.onChange,
    cause: "change"
  };
  const onBlurValidator = {
    fn: isAsync ? props.validators.onBlurAsync : props.validators.onBlur,
    cause: "blur"
  };
  const onSubmitValidator = {
    fn: isAsync ? props.validators.onSubmitAsync : props.validators.onSubmit,
    cause: "submit"
  };
  const onServerValidator = isAsync ? void 0 : { fn: () => void 0, cause: "server" };
  switch (props.event.type) {
    case "mount": {
      return props.runValidation({
        validators: [onMountValidator],
        form: props.form
      });
    }
    case "submit": {
      return props.runValidation({
        validators: [
          onChangeValidator,
          onBlurValidator,
          onSubmitValidator,
          onServerValidator
        ],
        form: props.form
      });
    }
    case "server": {
      return props.runValidation({
        validators: [],
        form: props.form
      });
    }
    case "blur": {
      return props.runValidation({
        validators: [onBlurValidator, onServerValidator],
        form: props.form
      });
    }
    case "change": {
      return props.runValidation({
        validators: [onChangeValidator, onServerValidator],
        form: props.form
      });
    }
    default: {
      throw new Error(`Unknown validation event type: ${props.event.type}`);
    }
  }
};
function prefixSchemaToErrors(issues, formValue) {
  const schema = /* @__PURE__ */ new Map();
  for (const issue of issues) {
    const issuePath = issue.path ?? [];
    let currentFormValue = formValue;
    let path = "";
    for (let i = 0; i < issuePath.length; i++) {
      const pathSegment = issuePath[i];
      if (pathSegment === void 0) continue;
      const segment = typeof pathSegment === "object" ? pathSegment.key : pathSegment;
      const segmentAsNumber = Number(segment);
      if (Array.isArray(currentFormValue) && !Number.isNaN(segmentAsNumber)) {
        path += `[${segmentAsNumber}]`;
      } else {
        path += (i > 0 ? "." : "") + String(segment);
      }
      if (typeof currentFormValue === "object" && currentFormValue !== null) {
        currentFormValue = currentFormValue[segment];
      } else {
        currentFormValue = void 0;
      }
    }
    schema.set(path, (schema.get(path) ?? []).concat(issue));
  }
  return Object.fromEntries(schema);
}
const transformFormIssues = (issues, formValue) => {
  const schemaErrors = prefixSchemaToErrors(issues, formValue);
  return {
    form: schemaErrors,
    fields: schemaErrors
  };
};
const standardSchemaValidators = {
  validate({
    value,
    validationSource
  }, schema) {
    const result = schema["~standard"].validate(value);
    if (result instanceof Promise) {
      throw new Error("async function passed to sync validator");
    }
    if (!result.issues) return;
    if (validationSource === "field") {
      return result.issues;
    }
    return transformFormIssues(result.issues, value);
  },
  async validateAsync({
    value,
    validationSource
  }, schema) {
    const result = await schema["~standard"].validate(value);
    if (!result.issues) return;
    if (validationSource === "field") {
      return result.issues;
    }
    return transformFormIssues(result.issues, value);
  }
};
const isStandardSchemaValidator = (validator) => !!validator && "~standard" in validator;
const defaultFieldMeta = {
  isValidating: false,
  isTouched: false,
  isBlurred: false,
  isDirty: false,
  isPristine: true,
  isValid: true,
  isDefaultValue: true,
  errors: [],
  errorMap: {},
  errorSourceMap: {},
  _arrayVersion: 0
};
function metaHelper(formApi) {
  function bumpArrayVersion(field) {
    const currentMeta = formApi.getFieldMeta(field) ?? defaultFieldMeta;
    formApi.setFieldMeta(field, {
      ...currentMeta,
      _arrayVersion: (currentMeta._arrayVersion || 0) + 1
    });
  }
  function handleArrayMove(field, fromIndex, toIndex) {
    bumpArrayVersion(field);
    const affectedFields = getAffectedFields(field, fromIndex, "move", toIndex);
    const startIndex = Math.min(fromIndex, toIndex);
    const endIndex = Math.max(fromIndex, toIndex);
    for (let i = startIndex; i <= endIndex; i++) {
      affectedFields.push(getFieldPath(field, i));
    }
    const fromFields = Object.keys(formApi.fieldInfo).reduce(
      (fieldMap, fieldKey) => {
        if (fieldKey.startsWith(getFieldPath(field, fromIndex))) {
          fieldMap.set(
            fieldKey,
            formApi.getFieldMeta(fieldKey)
          );
        }
        return fieldMap;
      },
      /* @__PURE__ */ new Map()
    );
    shiftMeta(affectedFields, fromIndex < toIndex ? "up" : "down");
    Object.keys(formApi.fieldInfo).filter((fieldKey) => fieldKey.startsWith(getFieldPath(field, toIndex))).forEach((fieldKey) => {
      const fromKey = fieldKey.replace(
        getFieldPath(field, toIndex),
        getFieldPath(field, fromIndex)
      );
      const fromMeta = fromFields.get(fromKey);
      if (fromMeta) {
        formApi.setFieldMeta(fieldKey, fromMeta);
      }
    });
  }
  function handleArrayRemove(field, index) {
    bumpArrayVersion(field);
    const affectedFields = getAffectedFields(field, index, "remove");
    shiftMeta(affectedFields, "up");
  }
  function handleArraySwap(field, index, secondIndex) {
    bumpArrayVersion(field);
    const affectedFields = getAffectedFields(field, index, "swap", secondIndex);
    affectedFields.forEach((fieldKey) => {
      if (!fieldKey.toString().startsWith(getFieldPath(field, index))) {
        return;
      }
      const swappedKey = fieldKey.toString().replace(
        getFieldPath(field, index),
        getFieldPath(field, secondIndex)
      );
      const [meta1, meta2] = [
        formApi.getFieldMeta(fieldKey),
        formApi.getFieldMeta(swappedKey)
      ];
      if (meta1) formApi.setFieldMeta(swappedKey, meta1);
      if (meta2) formApi.setFieldMeta(fieldKey, meta2);
    });
  }
  function handleArrayInsert(field, insertIndex) {
    bumpArrayVersion(field);
    const affectedFields = getAffectedFields(field, insertIndex, "insert");
    shiftMeta(affectedFields, "down");
    affectedFields.forEach((fieldKey) => {
      if (fieldKey.toString().startsWith(getFieldPath(field, insertIndex))) {
        formApi.setFieldMeta(fieldKey, getEmptyFieldMeta());
      }
    });
  }
  function getFieldPath(field, index) {
    return `${field}[${index}]`;
  }
  function getAffectedFields(field, index, mode, secondIndex) {
    const affectedFieldKeys = [getFieldPath(field, index)];
    switch (mode) {
      case "swap":
        affectedFieldKeys.push(getFieldPath(field, secondIndex));
        break;
      case "move": {
        const [startIndex, endIndex] = [
          Math.min(index, secondIndex),
          Math.max(index, secondIndex)
        ];
        for (let i = startIndex; i <= endIndex; i++) {
          affectedFieldKeys.push(getFieldPath(field, i));
        }
        break;
      }
      default: {
        const currentValue = formApi.getFieldValue(field);
        const fieldItems = Array.isArray(currentValue) ? currentValue.length : 0;
        for (let i = index + 1; i < fieldItems; i++) {
          affectedFieldKeys.push(getFieldPath(field, i));
        }
        break;
      }
    }
    return Object.keys(formApi.fieldInfo).filter(
      (fieldKey) => affectedFieldKeys.some((key) => fieldKey.startsWith(key))
    );
  }
  function updateIndex(fieldKey, direction) {
    return fieldKey.replace(/\[(\d+)\]/, (_, num) => {
      const currIndex = parseInt(num, 10);
      const newIndex = direction === "up" ? currIndex + 1 : Math.max(0, currIndex - 1);
      return `[${newIndex}]`;
    });
  }
  function shiftMeta(fields, direction) {
    const sortedFields = direction === "up" ? fields : [...fields].reverse();
    sortedFields.forEach((fieldKey) => {
      const nextFieldKey = updateIndex(fieldKey.toString(), direction);
      const nextFieldMeta = formApi.getFieldMeta(nextFieldKey);
      if (nextFieldMeta) {
        formApi.setFieldMeta(fieldKey, nextFieldMeta);
      } else {
        formApi.setFieldMeta(fieldKey, getEmptyFieldMeta());
      }
    });
  }
  const getEmptyFieldMeta = () => defaultFieldMeta;
  return {
    bumpArrayVersion,
    handleArrayMove,
    handleArrayRemove,
    handleArraySwap,
    handleArrayInsert
  };
}
function getDefaultFormState(defaultState) {
  return {
    values: defaultState.values ?? {},
    errorMap: defaultState.errorMap ?? {},
    fieldMetaBase: defaultState.fieldMetaBase ?? {},
    formGroupStateBase: defaultState.formGroupStateBase ?? {},
    isSubmitted: defaultState.isSubmitted ?? false,
    isSubmitting: defaultState.isSubmitting ?? false,
    isValidating: defaultState.isValidating ?? false,
    submissionAttempts: defaultState.submissionAttempts ?? 0,
    isSubmitSuccessful: defaultState.isSubmitSuccessful ?? false,
    validationMetaMap: defaultState.validationMetaMap ?? {
      onChange: void 0,
      onBlur: void 0,
      onSubmit: void 0,
      onMount: void 0,
      onServer: void 0,
      onDynamic: void 0
    }
  };
}
class FormApi {
  /**
   * Constructs a new `FormApi` instance with the given form options.
   */
  constructor(opts) {
    this.options = {};
    this.fieldInfo = {};
    this.formGroupApis = /* @__PURE__ */ new Set();
    this.mount = () => {
      const cleanupDevtoolBroadcast = this.store.subscribe(() => {
        throttleFormState(this);
      });
      const cleanupFormStateListener = formEventClient.on(
        "request-form-state",
        (e) => {
          if (e.payload.id === this._formId) {
            formEventClient.emit("form-api", {
              id: this._formId,
              state: this.store.state,
              options: this.options
            });
          }
        }
      );
      const cleanupFormResetListener = formEventClient.on(
        "request-form-reset",
        (e) => {
          if (e.payload.id === this._formId) {
            this.reset();
          }
        }
      );
      const cleanupFormForceSubmitListener = formEventClient.on(
        "request-form-force-submit",
        (e) => {
          if (e.payload.id === this._formId) {
            this._devtoolsSubmissionOverride = true;
            this.handleSubmit();
            this._devtoolsSubmissionOverride = false;
          }
        }
      );
      const cleanup = () => {
        cleanupFormForceSubmitListener();
        cleanupFormResetListener();
        cleanupFormStateListener();
        cleanupDevtoolBroadcast.unsubscribe();
        formEventClient.emit("form-unmounted", {
          id: this._formId
        });
      };
      this.options.listeners?.onMount?.({ formApi: this });
      const { onMount } = this.options.validators || {};
      formEventClient.emit("form-api", {
        id: this._formId,
        state: this.store.state,
        options: this.options
      });
      if (!onMount) return cleanup;
      this.validateSync("mount");
      return cleanup;
    };
    this.update = (options) => {
      if (!options) return;
      const oldOptions = this.options;
      this.options = options;
      const shouldUpdateValues = options.defaultValues && !evaluate(options.defaultValues, oldOptions.defaultValues) && !this.state.isTouched;
      const shouldUpdateState = !evaluate(options.defaultState, oldOptions.defaultState) && !this.state.isTouched;
      if (!shouldUpdateValues && !shouldUpdateState) return;
      batch(() => {
        this.baseStore.setState(
          () => getDefaultFormState(
            Object.assign(
              {},
              this.state,
              shouldUpdateState ? options.defaultState : {},
              shouldUpdateValues ? {
                values: options.defaultValues
              } : {}
            )
          )
        );
      });
      if (shouldUpdateValues) {
        const helper = metaHelper(this);
        for (const fieldKey of Object.keys(
          this.fieldInfo
        )) {
          if (Array.isArray(this.getFieldValue(fieldKey))) {
            helper.bumpArrayVersion(fieldKey);
          }
        }
      }
      formEventClient.emit("form-api", {
        id: this._formId,
        state: this.store.state,
        options: this.options
      });
    };
    this.reset = (values, opts2) => {
      const { fieldMeta: currentFieldMeta } = this.state;
      const fieldMetaBase = this.resetFieldMeta(currentFieldMeta);
      if (values && !opts2?.keepDefaultValues) {
        this.options = {
          ...this.options,
          defaultValues: values
        };
      }
      this.baseStore.setState(() => {
        let nextValues = values ?? this.options.defaultValues ?? this.options.defaultState?.values;
        if (!values) {
          Object.values(this.fieldInfo).forEach(
            (fieldInfo) => {
              if (fieldInfo.instance && fieldInfo.instance.options.defaultValue !== void 0) {
                nextValues = setBy(
                  nextValues,
                  fieldInfo.instance.name,
                  fieldInfo.instance.options.defaultValue
                );
              }
            }
          );
        }
        return getDefaultFormState({
          ...this.options.defaultState,
          values: nextValues,
          fieldMetaBase
        });
      });
    };
    this.validateAllFields = async (cause) => {
      const fieldValidationPromises = [];
      batch(() => {
        void Object.values(this.fieldInfo).forEach(
          (field) => {
            if (!field.instance) return;
            const fieldInstance = field.instance;
            fieldValidationPromises.push(
              // Remember, `validate` is either a sync operation or a promise
              Promise.resolve().then(
                () => fieldInstance.validate(cause, {
                  skipFormValidation: true,
                  skipGroupValidation: true
                })
              )
            );
            if (!field.instance.store.state.meta.isTouched) {
              field.instance.setMeta((prev) => ({ ...prev, isTouched: true }));
            }
          }
        );
      });
      const fieldErrorMapMap = await Promise.all(fieldValidationPromises);
      return fieldErrorMapMap.flat();
    };
    this.validateArrayFieldsStartingFrom = async (field, index, cause) => {
      const currentValue = this.getFieldValue(field);
      const lastIndex = Array.isArray(currentValue) ? Math.max(currentValue.length - 1, 0) : null;
      const fieldKeysToValidate = [`${field}[${index}]`];
      for (let i = index + 1; i <= (lastIndex ?? 0); i++) {
        fieldKeysToValidate.push(`${field}[${i}]`);
      }
      const fieldsToValidate = Object.keys(this.fieldInfo).filter(
        (fieldKey) => fieldKeysToValidate.some((key) => fieldKey.startsWith(key))
      );
      const fieldValidationPromises = [];
      batch(() => {
        fieldsToValidate.forEach((nestedField) => {
          fieldValidationPromises.push(
            Promise.resolve().then(() => this.validateField(nestedField, cause))
          );
        });
      });
      const fieldErrorMapMap = await Promise.all(fieldValidationPromises);
      return fieldErrorMapMap.flat();
    };
    this.validateField = (field, cause) => {
      const fieldInstance = this.fieldInfo[field]?.instance;
      if (!fieldInstance) {
        const { hasErrored } = this.validateSync(cause);
        if (hasErrored && !this.options.asyncAlways) {
          return this.getFieldMeta(field)?.errors ?? [];
        }
        return this.validateAsync(cause).then(() => {
          return this.getFieldMeta(field)?.errors ?? [];
        });
      }
      if (!fieldInstance.store.state.meta.isTouched) {
        fieldInstance.setMeta((prev) => ({ ...prev, isTouched: true }));
      }
      return fieldInstance.validate(cause);
    };
    this.validateSync = (cause, validateOpts) => {
      const validates = getSyncValidatorArray(cause, {
        ...this.options,
        form: this,
        group: validateOpts?.group,
        validationLogic: this.options.validationLogic || defaultValidationLogic
      });
      let hasErrored = false;
      const currentValidationErrorMap = {};
      batch(() => {
        for (const validateObj of validates) {
          if (!validateObj.validate) continue;
          const rawError = this.runValidator({
            validate: validateObj.validate,
            value: {
              value: this.state.values,
              formApi: this,
              validationSource: "form"
            },
            type: "validate"
          });
          const { formError, fieldErrors } = normalizeError$2(rawError);
          const errorMapKey = getErrorMapKey$2(validateObj.cause);
          let allFieldsToProcess = /* @__PURE__ */ new Set([
            ...Object.keys(this.state.fieldMeta),
            ...Object.keys(fieldErrors || {})
          ]);
          if (validateOpts?.filterFieldNames) {
            allFieldsToProcess = new Set(
              [...allFieldsToProcess].filter(validateOpts.filterFieldNames)
            );
          }
          for (const field of allFieldsToProcess) {
            if (this.baseStore.state.fieldMetaBase[field] === void 0 && !fieldErrors?.[field]) {
              continue;
            }
            const fieldMeta = this.getFieldMeta(field) ?? defaultFieldMeta;
            const {
              errorMap: currentErrorMap,
              errorSourceMap: currentErrorMapSource
            } = fieldMeta;
            const newFormValidatorError = fieldErrors?.[field];
            const { newErrorValue, newSource } = determineFormLevelErrorSourceAndValue({
              newFormValidatorError,
              isPreviousErrorFromFormValidator: (
                // These conditional checks are required, otherwise we get runtime errors.
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                currentErrorMapSource?.[errorMapKey] === "form"
              ),
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              previousErrorValue: currentErrorMap?.[errorMapKey]
            });
            if (newSource === "form") {
              currentValidationErrorMap[field] = {
                ...currentValidationErrorMap[field],
                [errorMapKey]: newFormValidatorError
              };
            }
            if (currentErrorMap?.[errorMapKey] !== newErrorValue) {
              this.setFieldMeta(field, (prev = defaultFieldMeta) => ({
                ...prev,
                errorMap: {
                  ...prev.errorMap,
                  [errorMapKey]: newErrorValue
                },
                errorSourceMap: {
                  ...prev.errorSourceMap,
                  [errorMapKey]: newSource
                }
              }));
            }
          }
          if (!validateOpts?.dontUpdateFormErrorMap) {
            if (this.state.errorMap?.[errorMapKey] !== formError) {
              this.baseStore.setState((prev) => ({
                ...prev,
                errorMap: {
                  ...prev.errorMap,
                  [errorMapKey]: formError
                }
              }));
            }
          }
          if (formError || fieldErrors) {
            hasErrored = true;
          }
        }
        if (validateOpts?.dontUpdateFormErrorMap) {
          return;
        }
        const submitErrKey = getErrorMapKey$2("submit");
        if (
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          this.state.errorMap?.[submitErrKey] && cause !== "submit" && !hasErrored
        ) {
          this.baseStore.setState((prev) => ({
            ...prev,
            errorMap: {
              ...prev.errorMap,
              [submitErrKey]: void 0
            }
          }));
        }
        const serverErrKey = getErrorMapKey$2("server");
        if (
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          this.state.errorMap?.[serverErrKey] && cause !== "server" && !hasErrored
        ) {
          this.baseStore.setState((prev) => ({
            ...prev,
            errorMap: {
              ...prev.errorMap,
              [serverErrKey]: void 0
            }
          }));
        }
      });
      return { hasErrored, fieldsErrorMap: currentValidationErrorMap };
    };
    this.validateAsync = async (cause, validateOpts) => {
      const validates = getAsyncValidatorArray(cause, {
        ...this.options,
        form: this,
        group: validateOpts?.group,
        validationLogic: this.options.validationLogic || defaultValidationLogic
      });
      if (!this.state.isFormValidating) {
        this.baseStore.setState((prev) => ({ ...prev, isFormValidating: true }));
      }
      const promises = [];
      let fieldErrorsFromFormValidators;
      for (const validateObj of validates) {
        if (!validateObj.validate) continue;
        const key = getErrorMapKey$2(validateObj.cause);
        const fieldValidatorMeta = this.state.validationMetaMap[key];
        fieldValidatorMeta?.lastAbortController.abort();
        const controller = new AbortController();
        this.state.validationMetaMap[key] = {
          lastAbortController: controller
        };
        promises.push(
          new Promise(async (resolve) => {
            let rawError;
            try {
              rawError = await new Promise((rawResolve, rawReject) => {
                setTimeout(async () => {
                  if (controller.signal.aborted) return rawResolve(void 0);
                  try {
                    rawResolve(
                      await this.runValidator({
                        validate: validateObj.validate,
                        value: {
                          value: this.state.values,
                          formApi: this,
                          validationSource: "form",
                          signal: controller.signal
                        },
                        type: "validateAsync"
                      })
                    );
                  } catch (e) {
                    rawReject(e);
                  }
                }, validateObj.debounceMs);
              });
            } catch (e) {
              rawError = e;
            }
            const { formError, fieldErrors: fieldErrorsFromNormalizeError } = normalizeError$2(rawError);
            if (fieldErrorsFromNormalizeError) {
              fieldErrorsFromFormValidators = fieldErrorsFromFormValidators ? {
                ...fieldErrorsFromFormValidators,
                ...fieldErrorsFromNormalizeError
              } : fieldErrorsFromNormalizeError;
            }
            const errorMapKey = getErrorMapKey$2(validateObj.cause);
            let fields = Object.keys(this.state.fieldMeta);
            if (validateOpts?.filterFieldNames) {
              fields = fields.filter(validateOpts.filterFieldNames);
            }
            for (const field of fields) {
              if (this.baseStore.state.fieldMetaBase[field] === void 0) {
                continue;
              }
              const fieldMeta = this.getFieldMeta(field);
              if (!fieldMeta) continue;
              const {
                errorMap: currentErrorMap,
                errorSourceMap: currentErrorMapSource
              } = fieldMeta;
              const newFormValidatorError = fieldErrorsFromFormValidators?.[field];
              const { newErrorValue, newSource } = determineFormLevelErrorSourceAndValue({
                newFormValidatorError,
                isPreviousErrorFromFormValidator: (
                  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                  currentErrorMapSource?.[errorMapKey] === "form"
                ),
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                previousErrorValue: currentErrorMap?.[errorMapKey]
              });
              if (currentErrorMap?.[errorMapKey] !== newErrorValue) {
                this.setFieldMeta(field, (prev) => ({
                  ...prev,
                  errorMap: {
                    ...prev.errorMap,
                    [errorMapKey]: newErrorValue
                  },
                  errorSourceMap: {
                    ...prev.errorSourceMap,
                    [errorMapKey]: newSource
                  }
                }));
              }
            }
            if (!validateOpts?.dontUpdateFormErrorMap) {
              this.baseStore.setState((prev) => ({
                ...prev,
                errorMap: {
                  ...prev.errorMap,
                  [errorMapKey]: formError
                }
              }));
            }
            resolve(
              fieldErrorsFromFormValidators ? { fieldErrors: fieldErrorsFromFormValidators, errorMapKey } : void 0
            );
          })
        );
      }
      let results = [];
      const fieldsErrorMap = {};
      if (promises.length) {
        results = await Promise.all(promises);
        for (const fieldValidationResult of results) {
          if (fieldValidationResult?.fieldErrors) {
            const { errorMapKey } = fieldValidationResult;
            for (const [field, fieldError] of Object.entries(
              fieldValidationResult.fieldErrors
            )) {
              const oldErrorMap = fieldsErrorMap[field] || {};
              const newErrorMap = {
                ...oldErrorMap,
                [errorMapKey]: fieldError
              };
              fieldsErrorMap[field] = newErrorMap;
            }
          }
        }
      }
      this.baseStore.setState((prev) => ({
        ...prev,
        isFormValidating: false
      }));
      return fieldsErrorMap;
    };
    this.validate = (cause, validateOpts) => {
      const { hasErrored, fieldsErrorMap } = this.validateSync(
        cause,
        validateOpts
      );
      if (hasErrored && !this.options.asyncAlways) {
        return fieldsErrorMap;
      }
      return this.validateAsync(cause, validateOpts);
    };
    this._handleSubmit = async (submitMeta) => {
      this.baseStore.setState((old) => ({
        ...old,
        // Submission attempts mark the form as not submitted
        isSubmitted: false,
        // Count submission attempts
        submissionAttempts: old.submissionAttempts + 1,
        isSubmitSuccessful: false
        // Reset isSubmitSuccessful at the start of submission
      }));
      batch(() => {
        void Object.values(this.fieldInfo).forEach(
          (field) => {
            if (!field.instance) return;
            if (!field.instance.store.state.meta.isTouched) {
              field.instance.setMeta((prev) => ({ ...prev, isTouched: true }));
            }
          }
        );
      });
      const submitMetaArg = submitMeta ?? this.options.onSubmitMeta;
      if (!this.state.canSubmit && !this._devtoolsSubmissionOverride) {
        this.options.onSubmitInvalid?.({
          value: this.state.values,
          formApi: this,
          meta: submitMetaArg
        });
        return;
      }
      this.baseStore.setState((d) => ({ ...d, isSubmitting: true }));
      const done = () => {
        this.baseStore.setState((prev) => ({ ...prev, isSubmitting: false }));
      };
      await this.validateAllFields("submit");
      if (!this.state.isFieldsValid) {
        done();
        this.options.onSubmitInvalid?.({
          value: this.state.values,
          formApi: this,
          meta: submitMetaArg
        });
        formEventClient.emit("form-submission", {
          id: this._formId,
          submissionAttempt: this.state.submissionAttempts,
          successful: false,
          stage: "validateAllFields",
          errors: Object.values(this.state.fieldMeta).map((meta) => meta.errors).flat()
        });
        return;
      }
      await this.validate("submit");
      if (!this.state.isValid) {
        done();
        this.options.onSubmitInvalid?.({
          value: this.state.values,
          formApi: this,
          meta: submitMetaArg
        });
        formEventClient.emit("form-submission", {
          id: this._formId,
          submissionAttempt: this.state.submissionAttempts,
          successful: false,
          stage: "validate",
          errors: this.state.errors
        });
        return;
      }
      batch(() => {
        void Object.values(this.fieldInfo).forEach(
          (field) => {
            field.instance?.triggerOnSubmitListener();
          }
        );
      });
      this.options.listeners?.onSubmit?.({ formApi: this, meta: submitMetaArg });
      try {
        await this.options.onSubmit?.({
          value: this.state.values,
          formApi: this,
          meta: submitMetaArg
        });
        batch(() => {
          this.baseStore.setState((prev) => ({
            ...prev,
            isSubmitted: true,
            isSubmitSuccessful: true
            // Set isSubmitSuccessful to true on successful submission
          }));
          formEventClient.emit("form-submission", {
            id: this._formId,
            submissionAttempt: this.state.submissionAttempts,
            successful: true
          });
          done();
        });
      } catch (err) {
        this.baseStore.setState((prev) => ({
          ...prev,
          isSubmitSuccessful: false
          // Ensure isSubmitSuccessful is false if an error occurs
        }));
        formEventClient.emit("form-submission", {
          id: this._formId,
          submissionAttempt: this.state.submissionAttempts,
          successful: false,
          stage: "inflight",
          onError: err
        });
        done();
        throw err;
      }
    };
    this.getFieldValue = (field) => getBy(this.state.values, field);
    this.getFieldMeta = (field) => {
      return this.state.fieldMeta[field];
    };
    this.getFormGroupMeta = (name) => {
      return this.formGroupMetaDerived.state[name];
    };
    this.getFieldInfo = (field) => {
      return this.fieldInfo[field] ||= {
        instance: null,
        validationMetaMap: {
          onChange: void 0,
          onBlur: void 0,
          onSubmit: void 0,
          onMount: void 0,
          onServer: void 0,
          onDynamic: void 0
        }
      };
    };
    this.setFieldMeta = (field, updater) => {
      this.baseStore.setState((prev) => {
        return {
          ...prev,
          fieldMetaBase: {
            ...prev.fieldMetaBase,
            [field]: functionalUpdate(
              updater,
              prev.fieldMetaBase[field]
            )
          }
        };
      });
    };
    this.resetFieldMeta = (fieldMeta) => {
      return Object.keys(fieldMeta).reduce(
        (acc, key) => {
          const fieldKey = key;
          acc[fieldKey] = defaultFieldMeta;
          return acc;
        },
        {}
      );
    };
    this.setFieldValue = (field, updater, opts2) => {
      const dontUpdateMeta = opts2?.dontUpdateMeta ?? false;
      const dontRunListeners = opts2?.dontRunListeners ?? false;
      const dontValidate = opts2?.dontValidate ?? false;
      batch(() => {
        if (!dontUpdateMeta) {
          this.setFieldMeta(field, (prev) => ({
            ...prev,
            isTouched: true,
            isDirty: true,
            errorMap: {
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              ...prev?.errorMap,
              onMount: void 0
            }
          }));
        }
        this.baseStore.setState((prev) => {
          return {
            ...prev,
            values: setBy(prev.values, field, updater)
          };
        });
      });
      if (!dontRunListeners) {
        this.getFieldInfo(field).instance?.triggerOnChangeListener();
      }
      if (!dontValidate) {
        this.validateField(field, "change");
      }
    };
    this.deleteField = (field) => {
      const subFieldsToDelete = Object.keys(this.fieldInfo).filter((f) => {
        const fieldStr = field.toString();
        return f !== fieldStr && f.startsWith(fieldStr);
      });
      const fieldsToDelete = [...subFieldsToDelete, field];
      this.baseStore.setState((prev) => {
        const newState = { ...prev };
        fieldsToDelete.forEach((f) => {
          newState.values = deleteBy(newState.values, f);
          delete this.fieldInfo[f];
          delete newState.fieldMetaBase[f];
        });
        return newState;
      });
    };
    this.pushFieldValue = (field, value, options) => {
      this.setFieldValue(
        field,
        (prev) => [...Array.isArray(prev) ? prev : [], value],
        options
      );
      metaHelper(this).bumpArrayVersion(field);
    };
    this.insertFieldValue = async (field, index, value, options) => {
      this.setFieldValue(
        field,
        (prev) => {
          return [
            ...prev.slice(0, index),
            value,
            ...prev.slice(index)
          ];
        },
        mergeOpts(options, { dontValidate: true })
      );
      const dontValidate = options?.dontValidate ?? false;
      if (!dontValidate) {
        await this.validateField(field, "change");
      }
      metaHelper(this).handleArrayInsert(field, index);
      if (!dontValidate) {
        await this.validateArrayFieldsStartingFrom(field, index, "change");
      }
    };
    this.replaceFieldValue = async (field, index, value, options) => {
      this.setFieldValue(
        field,
        (prev) => {
          return prev.map(
            (d, i) => i === index ? value : d
          );
        },
        mergeOpts(options, { dontValidate: true })
      );
      metaHelper(this).bumpArrayVersion(field);
      const dontValidate = options?.dontValidate ?? false;
      if (!dontValidate) {
        await this.validateField(field, "change");
        await this.validateArrayFieldsStartingFrom(field, index, "change");
      }
    };
    this.removeFieldValue = async (field, index, options) => {
      const fieldValue = this.getFieldValue(field);
      const lastIndex = Array.isArray(fieldValue) ? Math.max(fieldValue.length - 1, 0) : null;
      this.setFieldValue(
        field,
        (prev) => {
          return prev.filter(
            (_d, i) => i !== index
          );
        },
        mergeOpts(options, { dontValidate: true })
      );
      metaHelper(this).handleArrayRemove(field, index);
      if (lastIndex !== null) {
        const start = `${field}[${lastIndex}]`;
        this.deleteField(start);
      }
      const dontValidate = options?.dontValidate ?? false;
      if (!dontValidate) {
        await this.validateField(field, "change");
        await this.validateArrayFieldsStartingFrom(field, index, "change");
      }
    };
    this.swapFieldValues = (field, index1, index2, options) => {
      this.setFieldValue(
        field,
        (prev) => {
          const prev1 = prev[index1];
          const prev2 = prev[index2];
          return setBy(setBy(prev, `${index1}`, prev2), `${index2}`, prev1);
        },
        mergeOpts(options, { dontValidate: true })
      );
      metaHelper(this).handleArraySwap(field, index1, index2);
      const dontValidate = options?.dontValidate ?? false;
      if (!dontValidate) {
        this.validateField(field, "change");
        this.validateField(`${field}[${index1}]`, "change");
        this.validateField(`${field}[${index2}]`, "change");
      }
    };
    this.moveFieldValues = (field, index1, index2, options) => {
      this.setFieldValue(
        field,
        (prev) => {
          const next = [...prev];
          next.splice(index2, 0, next.splice(index1, 1)[0]);
          return next;
        },
        mergeOpts(options, { dontValidate: true })
      );
      metaHelper(this).handleArrayMove(field, index1, index2);
      const dontValidate = options?.dontValidate ?? false;
      if (!dontValidate) {
        this.validateField(field, "change");
        this.validateField(`${field}[${index1}]`, "change");
        this.validateField(`${field}[${index2}]`, "change");
      }
    };
    this.clearFieldValues = (field, options) => {
      const fieldValue = this.getFieldValue(field);
      const lastIndex = Array.isArray(fieldValue) ? Math.max(fieldValue.length - 1, 0) : null;
      this.setFieldValue(
        field,
        [],
        mergeOpts(options, { dontValidate: true })
      );
      metaHelper(this).bumpArrayVersion(field);
      if (lastIndex !== null) {
        for (let i = 0; i <= lastIndex; i++) {
          const fieldKey = `${field}[${i}]`;
          this.deleteField(fieldKey);
        }
      }
      const dontValidate = options?.dontValidate ?? false;
      if (!dontValidate) {
        this.validateField(field, "change");
      }
    };
    this.resetField = (field) => {
      this.baseStore.setState((prev) => {
        const fieldDefault = this.getFieldInfo(field).instance?.options.defaultValue;
        const formDefault = getBy(this.options.defaultValues, field);
        const targetValue = fieldDefault ?? formDefault;
        return {
          ...prev,
          fieldMetaBase: {
            ...prev.fieldMetaBase,
            [field]: defaultFieldMeta
          },
          values: targetValue !== void 0 ? setBy(prev.values, field, targetValue) : prev.values
        };
      });
    };
    this.setErrorMap = (errorMap) => {
      batch(() => {
        Object.entries(errorMap).forEach(([key, value]) => {
          const errorMapKey = key;
          if (isGlobalFormValidationError(value)) {
            const { formError, fieldErrors } = normalizeError$2(value);
            for (const fieldName of Object.keys(
              this.fieldInfo
            )) {
              const fieldMeta = this.getFieldMeta(fieldName);
              if (!fieldMeta) continue;
              this.setFieldMeta(fieldName, (prev) => ({
                ...prev,
                errorMap: {
                  ...prev.errorMap,
                  [errorMapKey]: fieldErrors?.[fieldName]
                },
                errorSourceMap: {
                  ...prev.errorSourceMap,
                  [errorMapKey]: "form"
                }
              }));
            }
            this.baseStore.setState((prev) => ({
              ...prev,
              errorMap: {
                ...prev.errorMap,
                [errorMapKey]: formError
              }
            }));
          } else {
            this.baseStore.setState((prev) => ({
              ...prev,
              errorMap: {
                ...prev.errorMap,
                [errorMapKey]: value
              }
            }));
          }
        });
      });
    };
    this.getAllErrors = () => {
      return {
        form: {
          errors: this.state.errors,
          errorMap: this.state.errorMap
        },
        fields: Object.entries(this.state.fieldMeta).reduce(
          (acc, [fieldName, fieldMeta]) => {
            if (Object.keys(fieldMeta).length && fieldMeta.errors.length) {
              acc[fieldName] = {
                errors: fieldMeta.errors,
                errorMap: fieldMeta.errorMap
              };
            }
            return acc;
          },
          {}
        )
      };
    };
    this.parseValuesWithSchema = (schema) => {
      return standardSchemaValidators.validate(
        { value: this.state.values, validationSource: "form" },
        schema
      );
    };
    this.parseValuesWithSchemaAsync = (schema) => {
      return standardSchemaValidators.validateAsync(
        { value: this.state.values, validationSource: "form" },
        schema
      );
    };
    this.timeoutIds = {
      validations: {},
      listeners: {},
      formListeners: {}
    };
    this._formId = opts?.formId ?? uuid();
    this._devtoolsSubmissionOverride = false;
    let baseStoreVal = getDefaultFormState({
      ...opts?.defaultState,
      values: opts?.defaultValues ?? opts?.defaultState?.values
    });
    if (opts?.transform) {
      baseStoreVal = opts.transform({ state: baseStoreVal }).state;
      for (const errKey of Object.keys(baseStoreVal.errorMap)) {
        const errKeyMap = baseStoreVal.errorMap[errKey];
        if (errKeyMap === void 0 || !isGlobalFormValidationError(errKeyMap)) {
          continue;
        }
        for (const fieldName of Object.keys(errKeyMap.fields)) {
          const fieldErr = errKeyMap.fields[fieldName];
          if (fieldErr === void 0) {
            continue;
          }
          const existingFieldMeta = baseStoreVal.fieldMetaBase[fieldName];
          baseStoreVal.fieldMetaBase[fieldName] = {
            isTouched: false,
            isValidating: false,
            isBlurred: false,
            isDirty: false,
            _arrayVersion: 0,
            ...existingFieldMeta ?? {},
            errorSourceMap: {
              ...existingFieldMeta?.["errorSourceMap"] ?? {},
              onChange: "form"
            },
            errorMap: {
              ...existingFieldMeta?.["errorMap"] ?? {},
              [errKey]: fieldErr
            }
          };
        }
      }
    }
    this.baseStore = createStore(baseStoreVal);
    let prevBaseStore = void 0;
    this.fieldMetaDerived = createStore(
      (prevVal) => {
        const currBaseStore = this.baseStore.get();
        let originalMetaCount = 0;
        const fieldMeta = {};
        for (const fieldName of Object.keys(
          currBaseStore.fieldMetaBase
        )) {
          const currBaseMeta = currBaseStore.fieldMetaBase[fieldName];
          const prevBaseMeta = prevBaseStore?.fieldMetaBase[fieldName];
          const prevFieldInfo = prevVal?.[fieldName];
          const curFieldVal = getBy(currBaseStore.values, fieldName);
          let fieldErrors = prevFieldInfo?.errors;
          if (!prevBaseMeta || currBaseMeta.errorMap !== prevBaseMeta.errorMap) {
            fieldErrors = Object.values(currBaseMeta.errorMap ?? {}).filter(
              (val) => val !== void 0
            );
            const fieldInstance = this.getFieldInfo(fieldName)?.instance;
            if (!fieldInstance || !fieldInstance.options.disableErrorFlat) {
              fieldErrors = fieldErrors.flat(1);
            }
          }
          const isFieldValid = !isNonEmptyArray(fieldErrors);
          const isFieldPristine = !currBaseMeta.isDirty;
          const isDefaultValue = evaluate(
            curFieldVal,
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            this.getFieldInfo(fieldName)?.instance?.options.defaultValue ?? getBy(this.options.defaultValues, fieldName)
          );
          if (prevFieldInfo && prevFieldInfo.isPristine === isFieldPristine && prevFieldInfo.isValid === isFieldValid && prevFieldInfo.isDefaultValue === isDefaultValue && prevFieldInfo.errors === fieldErrors && currBaseMeta === prevBaseMeta) {
            fieldMeta[fieldName] = prevFieldInfo;
            originalMetaCount++;
            continue;
          }
          fieldMeta[fieldName] = {
            ...currBaseMeta,
            errors: fieldErrors ?? [],
            isPristine: isFieldPristine,
            isValid: isFieldValid,
            isDefaultValue
          };
        }
        if (!Object.keys(currBaseStore.fieldMetaBase).length) return fieldMeta;
        if (prevVal && originalMetaCount === Object.keys(currBaseStore.fieldMetaBase).length) {
          return prevVal;
        }
        prevBaseStore = this.baseStore.get();
        return fieldMeta;
      }
    );
    this.formGroupMetaDerived = createStore(
      (prevVal) => {
        const currBaseStore = this.baseStore.get();
        const currFieldMeta = this.fieldMetaDerived.get();
        const result = {};
        for (const group of this.formGroupApis) {
          const groupName = group.name;
          const lifecycle = currBaseStore.formGroupStateBase[groupName] ?? {
            isSubmitted: false,
            isSubmitting: false,
            isValidating: false,
            submissionAttempts: 0,
            isSubmitSuccessful: false
          };
          const ownFieldMeta = currFieldMeta[groupName];
          let isFieldsValidating = false;
          let isFieldsValid = true;
          let aggIsTouched = false;
          let aggIsBlurred = false;
          let aggIsDefaultValue = true;
          let aggIsDirty = false;
          for (const fieldName in currFieldMeta) {
            if (fieldName === groupName) continue;
            if (!isFieldInGroup(groupName, fieldName)) continue;
            const m = currFieldMeta[fieldName];
            if (!m) continue;
            if (m.isValidating) isFieldsValidating = true;
            if (!m.isValid) isFieldsValid = false;
            if (m.isTouched) aggIsTouched = true;
            if (m.isBlurred) aggIsBlurred = true;
            if (!m.isDefaultValue) aggIsDefaultValue = false;
            if (m.isDirty) aggIsDirty = true;
          }
          const isPristine = !aggIsDirty;
          const isValidating = !!isFieldsValidating || lifecycle.isValidating;
          const errorMap = ownFieldMeta?.errorMap ?? {};
          const errorSourceMap = ownFieldMeta?.errorSourceMap ?? {};
          const hasOnMountError = Boolean(
            errorMap.onMount || Object.entries(currFieldMeta).some(
              ([fieldName, field]) => field && fieldName !== groupName && isFieldInGroup(groupName, fieldName) && field.errorMap.onMount
            )
          );
          const prevGroupMeta = prevVal?.[groupName];
          let errors = prevGroupMeta?.errors ?? [];
          if (!prevGroupMeta || prevGroupMeta.__srcErrorMap !== errorMap) {
            errors = Object.values(errorMap).reduce((acc, curr) => {
              if (curr === void 0) return acc;
              if (curr && typeof curr === "object" && "fields" in curr) {
                const groupErr = curr.group;
                if (groupErr !== void 0) acc.push(groupErr);
                return acc;
              }
              acc.push(curr);
              return acc;
            }, []);
          }
          const isGroupValid = errors.length === 0;
          const isValid = isFieldsValid && isGroupValid;
          const submitInvalid = group.options.canSubmitWhenInvalid ?? false;
          const canSubmit = lifecycle.submissionAttempts === 0 && !aggIsTouched && !hasOnMountError || !isValidating && !lifecycle.isSubmitting && isValid || submitInvalid;
          if (prevGroupMeta && prevGroupMeta.errorMap === errorMap && prevGroupMeta.errorSourceMap === errorSourceMap && prevGroupMeta.errors === errors && prevGroupMeta.isFieldsValidating === isFieldsValidating && prevGroupMeta.isFieldsValid === isFieldsValid && prevGroupMeta.isGroupValid === isGroupValid && prevGroupMeta.isValid === isValid && prevGroupMeta.canSubmit === canSubmit && prevGroupMeta.isTouched === aggIsTouched && prevGroupMeta.isBlurred === aggIsBlurred && prevGroupMeta.isPristine === isPristine && prevGroupMeta.isDefaultValue === aggIsDefaultValue && prevGroupMeta.isDirty === aggIsDirty && prevGroupMeta.isValidating === isValidating && prevGroupMeta.isSubmitting === lifecycle.isSubmitting && prevGroupMeta.isSubmitted === lifecycle.isSubmitted && prevGroupMeta.submissionAttempts === lifecycle.submissionAttempts && prevGroupMeta.isSubmitSuccessful === lifecycle.isSubmitSuccessful) {
            result[groupName] = prevGroupMeta;
            continue;
          }
          const meta = {
            // Submission lifecycle (spread first; `isValidating` below
            // intentionally overrides `lifecycle.isValidating` with the
            // OR of group-level + descendant-field validating).
            ...lifecycle,
            // Field-meta-base fields (so `setMeta` updates can roundtrip
            // through `state.meta`).
            errorMap,
            errorSourceMap,
            _arrayVersion: ownFieldMeta?._arrayVersion ?? 0,
            // Aggregated descendant booleans (override field-level meaning
            // for groups — a group's "field" itself never receives input).
            isTouched: aggIsTouched,
            isBlurred: aggIsBlurred,
            isDirty: aggIsDirty,
            isPristine,
            isDefaultValue: aggIsDefaultValue,
            // Aggregated validity
            isValid,
            errors,
            isValidating,
            // Group-only flags
            isFieldsValidating,
            isFieldsValid,
            isGroupValid,
            canSubmit
          };
          Object.defineProperty(meta, "__srcErrorMap", {
            value: errorMap,
            enumerable: false,
            configurable: true
          });
          result[groupName] = meta;
        }
        return result;
      }
    );
    let prevBaseStoreForStore = void 0;
    this.store = createStore((prevVal) => {
      const currBaseStore = this.baseStore.get();
      const currFieldMeta = this.fieldMetaDerived.get();
      const fieldMetaValues = Object.values(currFieldMeta).filter(
        Boolean
      );
      const isFieldsValidating = fieldMetaValues.some(
        (field) => field.isValidating
      );
      const isFieldsValid = fieldMetaValues.every((field) => field.isValid);
      const isTouched = fieldMetaValues.some((field) => field.isTouched);
      const isBlurred = fieldMetaValues.some((field) => field.isBlurred);
      const isDefaultValue = fieldMetaValues.every(
        (field) => field.isDefaultValue
      );
      const shouldInvalidateOnMount = (
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        isTouched && currBaseStore.errorMap?.onMount
      );
      const isDirty = fieldMetaValues.some((field) => field.isDirty);
      const isPristine = !isDirty;
      const hasOnMountError = Boolean(
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        currBaseStore.errorMap?.onMount || // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        fieldMetaValues.some((f) => f?.errorMap?.onMount)
      );
      const isValidating = !!isFieldsValidating;
      let errors = prevVal?.errors ?? [];
      if (!prevBaseStoreForStore || currBaseStore.errorMap !== prevBaseStoreForStore.errorMap) {
        errors = Object.values(currBaseStore.errorMap).reduce((prev, curr) => {
          if (curr === void 0) return prev;
          if (curr && isGlobalFormValidationError(curr)) {
            prev.push(curr.form);
            return prev;
          }
          prev.push(curr);
          return prev;
        }, []);
      }
      const isFormValid = errors.length === 0;
      const isValid = isFieldsValid && isFormValid;
      const submitInvalid = this.options.canSubmitWhenInvalid ?? false;
      const canSubmit = currBaseStore.submissionAttempts === 0 && !isTouched && !hasOnMountError || !isValidating && !currBaseStore.isSubmitting && isValid || submitInvalid;
      let errorMap = currBaseStore.errorMap;
      if (shouldInvalidateOnMount) {
        errors = errors.filter((err) => err !== currBaseStore.errorMap.onMount);
        errorMap = Object.assign(errorMap, { onMount: void 0 });
      }
      if (prevVal && prevBaseStoreForStore && prevVal.errorMap === errorMap && prevVal.fieldMeta === this.fieldMetaDerived.state && prevVal.errors === errors && prevVal.isFieldsValidating === isFieldsValidating && prevVal.isFieldsValid === isFieldsValid && prevVal.isFormValid === isFormValid && prevVal.isValid === isValid && prevVal.canSubmit === canSubmit && prevVal.isTouched === isTouched && prevVal.isBlurred === isBlurred && prevVal.isPristine === isPristine && prevVal.isDefaultValue === isDefaultValue && prevVal.isDirty === isDirty && evaluate(prevBaseStoreForStore, currBaseStore)) {
        return prevVal;
      }
      const state = {
        ...currBaseStore,
        errorMap,
        fieldMeta: this.fieldMetaDerived.state,
        errors,
        isFieldsValidating,
        isFieldsValid,
        isFormValid,
        isValid,
        canSubmit,
        isTouched,
        isBlurred,
        isPristine,
        isDefaultValue,
        isDirty
      };
      prevBaseStoreForStore = this.baseStore.get();
      return state;
    });
    this.handleSubmit = this.handleSubmit.bind(this);
    this.update(opts || {});
  }
  get state() {
    return this.store.state;
  }
  get formId() {
    return this._formId;
  }
  /**
   * @private
   */
  runValidator(props) {
    if (isStandardSchemaValidator(props.validate)) {
      return standardSchemaValidators[props.type](
        props.value,
        props.validate
      );
    }
    return props.validate(props.value);
  }
  handleSubmit(submitMeta) {
    return this._handleSubmit(submitMeta);
  }
}
function normalizeError$2(rawError) {
  if (rawError) {
    if (isGlobalFormValidationError(rawError)) {
      const formError = normalizeError$2(rawError.form).formError;
      const fieldErrors = rawError.fields;
      return { formError, fieldErrors };
    }
    return { formError: rawError };
  }
  return { formError: void 0 };
}
function getErrorMapKey$2(cause) {
  switch (cause) {
    case "submit":
      return "onSubmit";
    case "blur":
      return "onBlur";
    case "mount":
      return "onMount";
    case "server":
      return "onServer";
    case "dynamic":
      return "onDynamic";
    case "change":
    default:
      return "onChange";
  }
}
class FieldApi {
  /**
   * Initializes a new `FieldApi` instance.
   */
  constructor(opts) {
    this.options = {};
    this.mount = () => {
      if (this.options.defaultValue !== void 0 && !this.getMeta().isTouched) {
        this.form.setFieldValue(this.name, this.options.defaultValue, {
          dontUpdateMeta: true
        });
      }
      const info = this.getInfo();
      info.instance = this;
      this.update(this.options);
      const { onMount } = this.options.validators || {};
      if (onMount) {
        const error = this.runValidator({
          validate: onMount,
          value: {
            value: this.state.value,
            fieldApi: this,
            validationSource: "field"
          },
          type: "validate"
        });
        if (error) {
          this.setMeta(
            (prev) => ({
              ...prev,
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              errorMap: { ...prev?.errorMap, onMount: error },
              errorSourceMap: {
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                ...prev?.errorSourceMap,
                onMount: "field"
              }
            })
          );
        }
      }
      this.options.listeners?.onMount?.({
        value: this.state.value,
        fieldApi: this
      });
      return () => {
        for (const [key, timeout] of Object.entries(
          this.timeoutIds.validations
        )) {
          if (timeout) {
            clearTimeout(timeout);
            this.timeoutIds.validations[key] = null;
          }
        }
        for (const [key, timeout] of Object.entries(this.timeoutIds.listeners)) {
          if (timeout) {
            clearTimeout(timeout);
            this.timeoutIds.listeners[key] = null;
          }
        }
        for (const [key, timeout] of Object.entries(
          this.timeoutIds.formListeners
        )) {
          if (timeout) {
            clearTimeout(timeout);
            this.timeoutIds.formListeners[key] = null;
          }
        }
        const fieldInfo = this.form.fieldInfo[this.name];
        if (!fieldInfo) return;
        if (fieldInfo.instance !== this) return;
        for (const [key, validationMeta] of Object.entries(
          fieldInfo.validationMetaMap
        )) {
          validationMeta?.lastAbortController.abort();
          fieldInfo.validationMetaMap[key] = void 0;
        }
        this.form.baseStore.setState((prev) => ({
          // Preserve interaction flags so field-level defaultValue does not
          // reseed user-entered values on remount.
          ...prev,
          fieldMetaBase: {
            ...prev.fieldMetaBase,
            [this.name]: {
              ...defaultFieldMeta,
              isTouched: prev.fieldMetaBase[this.name]?.isTouched ?? defaultFieldMeta.isTouched,
              isBlurred: prev.fieldMetaBase[this.name]?.isBlurred ?? defaultFieldMeta.isBlurred,
              isDirty: prev.fieldMetaBase[this.name]?.isDirty ?? defaultFieldMeta.isDirty
            }
          }
        }));
        fieldInfo.instance = null;
        this.options.listeners?.onUnmount?.({
          value: this.state.value,
          fieldApi: this
        });
        this.form.options.listeners?.onFieldUnmount?.({
          formApi: this.form,
          fieldApi: this
        });
      };
    };
    this.update = (opts2) => {
      this.options = opts2;
      this.name = opts2.name;
      if (!this.state.meta.isTouched && this.options.defaultValue !== void 0) {
        const formField = this.form.getFieldValue(this.name);
        if (!evaluate(formField, opts2.defaultValue)) {
          this.form.setFieldValue(this.name, opts2.defaultValue, {
            dontUpdateMeta: true,
            dontValidate: true,
            dontRunListeners: true
          });
        }
      }
      if (!this.form.getFieldMeta(this.name)) {
        this.form.setFieldMeta(this.name, this.state.meta);
      }
    };
    this.getValue = () => {
      return this.form.getFieldValue(this.name);
    };
    this.setValue = (updater, options) => {
      this.form.setFieldValue(
        this.name,
        updater,
        mergeOpts(options, { dontRunListeners: true, dontValidate: true })
      );
      if (!options?.dontRunListeners) {
        this.triggerOnChangeListener();
      }
      if (!options?.dontValidate) {
        this.validate("change");
      }
    };
    this.getMeta = () => this.store.state.meta;
    this.setMeta = (updater) => this.form.setFieldMeta(this.name, updater);
    this.getInfo = () => this.form.getFieldInfo(this.name);
    this.pushValue = (value, options) => {
      this.form.pushFieldValue(
        this.name,
        value,
        mergeOpts(options, { dontRunListeners: true })
      );
      if (!options?.dontRunListeners) {
        this.triggerOnChangeListener();
      }
    };
    this.insertValue = (index, value, options) => {
      this.form.insertFieldValue(
        this.name,
        index,
        value,
        mergeOpts(options, { dontRunListeners: true })
      );
      if (!options?.dontRunListeners) {
        this.triggerOnChangeListener();
      }
    };
    this.replaceValue = (index, value, options) => {
      this.form.replaceFieldValue(
        this.name,
        index,
        value,
        mergeOpts(options, { dontRunListeners: true })
      );
      if (!options?.dontRunListeners) {
        this.triggerOnChangeListener();
      }
    };
    this.removeValue = (index, options) => {
      this.form.removeFieldValue(
        this.name,
        index,
        mergeOpts(options, { dontRunListeners: true })
      );
      if (!options?.dontRunListeners) {
        this.triggerOnChangeListener();
      }
    };
    this.swapValues = (aIndex, bIndex, options) => {
      this.form.swapFieldValues(
        this.name,
        aIndex,
        bIndex,
        mergeOpts(options, { dontRunListeners: true })
      );
      if (!options?.dontRunListeners) {
        this.triggerOnChangeListener();
      }
    };
    this.moveValue = (aIndex, bIndex, options) => {
      this.form.moveFieldValues(
        this.name,
        aIndex,
        bIndex,
        mergeOpts(options, { dontRunListeners: true })
      );
      if (!options?.dontRunListeners) {
        this.triggerOnChangeListener();
      }
    };
    this.clearValues = (options) => {
      this.form.clearFieldValues(
        this.name,
        mergeOpts(options, { dontRunListeners: true })
      );
      if (!options?.dontRunListeners) {
        this.triggerOnChangeListener();
      }
    };
    this.getLinkedFields = (cause) => {
      const fields = Object.values(this.form.fieldInfo);
      const linkedFields = [];
      for (const field of fields) {
        if (!field.instance) continue;
        if (!(field.instance instanceof FieldApi)) {
          continue;
        }
        const { onChangeListenTo, onBlurListenTo } = field.instance.options.validators || {};
        if (cause === "change" && onChangeListenTo?.includes(this.name)) {
          linkedFields.push(field.instance);
        }
        if (cause === "blur" && onBlurListenTo?.includes(this.name)) {
          linkedFields.push(field.instance);
        }
      }
      return linkedFields;
    };
    this.validateSync = (cause, errorFromForm) => {
      const validates = getSyncValidatorArray(cause, {
        ...this.options,
        form: this.form,
        fieldName: this.name,
        validationLogic: this.form.options.validationLogic || defaultValidationLogic
      });
      const linkedFields = this.getLinkedFields(cause);
      const linkedFieldValidates = linkedFields.reduce(
        (acc, field) => {
          const fieldValidates = getSyncValidatorArray(cause, {
            ...field.options,
            form: field.form,
            fieldName: field.name,
            validationLogic: field.form.options.validationLogic || defaultValidationLogic
          });
          fieldValidates.forEach((validate) => {
            validate.field = field;
          });
          return acc.concat(fieldValidates);
        },
        []
      );
      let hasErrored = false;
      batch(() => {
        const validateFieldFn = (field, validateObj) => {
          const errorMapKey = getErrorMapKey$1(validateObj.cause);
          const fieldLevelError = validateObj.validate ? normalizeError$1(
            field.runValidator({
              validate: validateObj.validate,
              value: {
                value: field.store.state.value,
                validationSource: "field",
                fieldApi: field
              },
              type: "validate"
            })
          ) : void 0;
          const formLevelError = errorFromForm[errorMapKey];
          const { newErrorValue, newSource } = determineFieldLevelErrorSourceAndValue({
            formLevelError,
            fieldLevelError
          });
          if (field.state.meta.errorMap?.[errorMapKey] !== newErrorValue) {
            field.setMeta((prev) => ({
              ...prev,
              errorMap: {
                ...prev.errorMap,
                [errorMapKey]: newErrorValue
              },
              errorSourceMap: {
                ...prev.errorSourceMap,
                [errorMapKey]: newSource
              }
            }));
          }
          if (newErrorValue) {
            hasErrored = true;
          }
        };
        for (const validateObj of validates) {
          validateFieldFn(this, validateObj);
        }
        for (const fieldValitateObj of linkedFieldValidates) {
          if (!fieldValitateObj.validate) continue;
          validateFieldFn(fieldValitateObj.field, fieldValitateObj);
        }
      });
      const submitErrKey = getErrorMapKey$1("submit");
      if (
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        this.state.meta.errorMap?.[submitErrKey] && cause !== "submit" && !hasErrored
      ) {
        this.setMeta((prev) => ({
          ...prev,
          errorMap: {
            ...prev.errorMap,
            [submitErrKey]: void 0
          },
          errorSourceMap: {
            ...prev.errorSourceMap,
            [submitErrKey]: void 0
          }
        }));
      }
      return { hasErrored };
    };
    this.validateAsync = async (cause, formValidationResultPromise) => {
      const validates = getAsyncValidatorArray(cause, {
        ...this.options,
        form: this.form,
        fieldName: this.name,
        validationLogic: this.form.options.validationLogic || defaultValidationLogic
      });
      const asyncFormValidationResults = await formValidationResultPromise;
      const linkedFields = this.getLinkedFields(cause);
      const linkedFieldValidates = linkedFields.reduce(
        (acc, field) => {
          const fieldValidates = getAsyncValidatorArray(cause, {
            ...field.options,
            form: field.form,
            fieldName: field.name,
            validationLogic: field.form.options.validationLogic || defaultValidationLogic
          });
          fieldValidates.forEach((validate) => {
            validate.field = field;
          });
          return acc.concat(fieldValidates);
        },
        []
      );
      const validatesPromises = [];
      const linkedPromises = [];
      const hasAsyncValidators = validates.some((v) => v.validate) || linkedFieldValidates.some((v) => v.validate);
      if (hasAsyncValidators) {
        if (!this.state.meta.isValidating) {
          this.setMeta((prev) => ({ ...prev, isValidating: true }));
        }
        for (const linkedField of linkedFields) {
          linkedField.setMeta((prev) => ({ ...prev, isValidating: true }));
        }
      }
      const validateFieldAsyncFn = (field, validateObj, promises) => {
        const errorMapKey = getErrorMapKey$1(validateObj.cause);
        const fieldInfo = field.getInfo();
        const fieldValidatorMeta = fieldInfo.validationMetaMap[errorMapKey];
        fieldValidatorMeta?.lastAbortController.abort();
        const controller = new AbortController();
        fieldInfo.validationMetaMap[errorMapKey] = {
          lastAbortController: controller
        };
        promises.push(
          new Promise(async (resolve) => {
            let rawError;
            try {
              rawError = await new Promise((rawResolve, rawReject) => {
                if (field.timeoutIds.validations[validateObj.cause]) {
                  clearTimeout(field.timeoutIds.validations[validateObj.cause]);
                }
                field.timeoutIds.validations[validateObj.cause] = setTimeout(
                  async () => {
                    if (controller.signal.aborted) return rawResolve(void 0);
                    try {
                      rawResolve(
                        await this.runValidator({
                          validate: validateObj.validate,
                          value: {
                            value: field.store.state.value,
                            fieldApi: field,
                            signal: controller.signal,
                            validationSource: "field"
                          },
                          type: "validateAsync"
                        })
                      );
                    } catch (e) {
                      rawReject(e);
                    }
                  },
                  validateObj.debounceMs
                );
              });
            } catch (e) {
              rawError = e;
            }
            if (controller.signal.aborted) return resolve(void 0);
            const fieldLevelError = normalizeError$1(rawError);
            const formLevelError = asyncFormValidationResults[field.name]?.[errorMapKey];
            const { newErrorValue, newSource } = determineFieldLevelErrorSourceAndValue({
              formLevelError,
              fieldLevelError
            });
            if (field.getInfo().instance !== field) {
              return resolve(void 0);
            }
            field.setMeta((prev) => {
              return {
                ...prev,
                errorMap: {
                  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                  ...prev?.errorMap,
                  [errorMapKey]: newErrorValue
                },
                errorSourceMap: {
                  ...prev.errorSourceMap,
                  [errorMapKey]: newSource
                }
              };
            });
            resolve(newErrorValue);
          })
        );
      };
      for (const validateObj of validates) {
        if (!validateObj.validate) continue;
        validateFieldAsyncFn(this, validateObj, validatesPromises);
      }
      for (const fieldValitateObj of linkedFieldValidates) {
        if (!fieldValitateObj.validate) continue;
        validateFieldAsyncFn(
          fieldValitateObj.field,
          fieldValitateObj,
          linkedPromises
        );
      }
      let results = [];
      if (validatesPromises.length || linkedPromises.length) {
        results = await Promise.all(validatesPromises);
        await Promise.all(linkedPromises);
      }
      if (hasAsyncValidators) {
        this.setMeta((prev) => ({ ...prev, isValidating: false }));
        for (const linkedField of linkedFields) {
          linkedField.setMeta((prev) => ({ ...prev, isValidating: false }));
        }
      }
      return results.filter(Boolean);
    };
    this.validate = (cause, opts2) => {
      if (!this.state.meta.isTouched) return [];
      const encompassingGroups = opts2?.skipGroupValidation ? [] : Array.from(this.form.formGroupApis).filter(
        (group) => this.name.startsWith(group.name)
      );
      const formSyncResult = opts2?.skipFormValidation ? { fieldsErrorMap: {} } : this.form.validateSync(cause);
      let fieldsErrorMap = formSyncResult.fieldsErrorMap[this.name] ?? {};
      if (!opts2?.skipFormValidation) {
        for (const group of encompassingGroups) {
          if (group.state.meta.submissionAttempts === 0) continue;
          const { fieldsErrorMap: groupFormErrors } = this.form.validateSync(
            cause,
            {
              group,
              dontUpdateFormErrorMap: true,
              filterFieldNames: (fieldName) => isFieldInGroup(group.name, fieldName)
            }
          );
          fieldsErrorMap = {
            ...fieldsErrorMap,
            ...groupFormErrors[this.name] ?? {}
          };
        }
      }
      const { hasErrored } = this.validateSync(cause, fieldsErrorMap);
      const groupHasErroredWeakMap = /* @__PURE__ */ new WeakMap();
      for (const group of encompassingGroups) {
        const { hasErrored: groupHasErrored } = group.validateSync(
          cause,
          {},
          { skipRelatedFieldValidation: true }
        );
        groupHasErroredWeakMap.set(group, groupHasErrored);
      }
      if (hasErrored && !this.options.asyncAlways) {
        this.getInfo().validationMetaMap[getErrorMapKey$1(cause)]?.lastAbortController.abort();
        const groupErrors = [];
        for (const group of encompassingGroups) {
          group.getInfo().validationMetaMap[getErrorMapKey$1(cause)]?.lastAbortController.abort();
          groupErrors.push(group.state.meta.errors);
        }
        return [...this.state.meta.errors, ...groupErrors.flat()];
      }
      const formValidationResultPromise = opts2?.skipFormValidation ? Promise.resolve({}) : this.form.validateAsync(cause);
      const fieldAsyncResults = this.validateAsync(
        cause,
        formValidationResultPromise
      );
      const groupAsyncResults = [];
      for (const group of encompassingGroups) {
        if (groupHasErroredWeakMap.get(group) && !group.options.asyncAlways) {
          continue;
        }
        groupAsyncResults.push(
          group.validateAsync(cause, formValidationResultPromise, {
            skipRelatedFieldValidation: true
          })
        );
      }
      if (groupAsyncResults.length === 0) {
        return fieldAsyncResults;
      }
      return Promise.all([fieldAsyncResults, ...groupAsyncResults]).then(
        (results) => results.flat()
      );
    };
    this.handleChange = (updater) => {
      this.setValue(updater);
    };
    this.handleBlur = () => {
      const prevTouched = this.state.meta.isTouched;
      if (!prevTouched) {
        this.setMeta((prev) => ({ ...prev, isTouched: true }));
      }
      if (!this.state.meta.isBlurred) {
        this.setMeta((prev) => ({ ...prev, isBlurred: true }));
      }
      this.validate("blur");
      this.triggerOnBlurListener();
    };
    this.setErrorMap = (errorMap) => {
      this.setMeta((prev) => ({
        ...prev,
        errorMap: {
          ...prev.errorMap,
          ...errorMap
        }
      }));
    };
    this.parseValueWithSchema = (schema) => {
      return standardSchemaValidators.validate(
        { value: this.state.value, validationSource: "field" },
        schema
      );
    };
    this.parseValueWithSchemaAsync = (schema) => {
      return standardSchemaValidators.validateAsync(
        { value: this.state.value, validationSource: "field" },
        schema
      );
    };
    this.triggerOnBlurListener = () => {
      const formDebounceMs = this.form.options.listeners?.onBlurDebounceMs;
      if (formDebounceMs && formDebounceMs > 0) {
        if (this.timeoutIds.formListeners.blur) {
          clearTimeout(this.timeoutIds.formListeners.blur);
        }
        this.timeoutIds.formListeners.blur = setTimeout(() => {
          this.form.options.listeners?.onBlur?.({
            formApi: this.form,
            fieldApi: this
          });
        }, formDebounceMs);
      } else {
        this.form.options.listeners?.onBlur?.({
          formApi: this.form,
          fieldApi: this
        });
      }
      const fieldDebounceMs = this.options.listeners?.onBlurDebounceMs;
      if (fieldDebounceMs && fieldDebounceMs > 0) {
        if (this.timeoutIds.listeners.blur) {
          clearTimeout(this.timeoutIds.listeners.blur);
        }
        this.timeoutIds.listeners.blur = setTimeout(() => {
          this.options.listeners?.onBlur?.({
            value: this.state.value,
            fieldApi: this
          });
        }, fieldDebounceMs);
      } else {
        this.options.listeners?.onBlur?.({
          value: this.state.value,
          fieldApi: this
        });
      }
    };
    this.triggerOnChangeListener = () => {
      const formDebounceMs = this.form.options.listeners?.onChangeDebounceMs;
      if (formDebounceMs && formDebounceMs > 0) {
        if (this.timeoutIds.formListeners.change) {
          clearTimeout(this.timeoutIds.formListeners.change);
        }
        this.timeoutIds.formListeners.change = setTimeout(() => {
          this.form.options.listeners?.onChange?.({
            formApi: this.form,
            fieldApi: this
          });
        }, formDebounceMs);
      } else {
        this.form.options.listeners?.onChange?.({
          formApi: this.form,
          fieldApi: this
        });
      }
      const fieldDebounceMs = this.options.listeners?.onChangeDebounceMs;
      if (fieldDebounceMs && fieldDebounceMs > 0) {
        if (this.timeoutIds.listeners.change) {
          clearTimeout(this.timeoutIds.listeners.change);
        }
        this.timeoutIds.listeners.change = setTimeout(() => {
          this.options.listeners?.onChange?.({
            value: this.state.value,
            fieldApi: this
          });
        }, fieldDebounceMs);
      } else {
        this.options.listeners?.onChange?.({
          value: this.state.value,
          fieldApi: this
        });
      }
      for (const group of this.form.formGroupApis) {
        if (isFieldInGroup(group.name, this.name)) {
          group.triggerOnChangeListener();
        }
      }
    };
    this.triggerOnSubmitListener = () => {
      this.options.listeners?.onSubmit?.({
        value: this.state.value,
        fieldApi: this
      });
    };
    this.form = opts.form;
    this.name = opts.name;
    this.options = opts;
    this.timeoutIds = {
      validations: {},
      listeners: {},
      formListeners: {}
    };
    this.store = createStore(
      (prevVal) => {
        this.form.store.get();
        const meta = this.form.getFieldMeta(this.name) ?? {
          ...defaultFieldMeta,
          ...opts.defaultMeta
        };
        let value = this.form.getFieldValue(this.name);
        if (!meta.isTouched && value === void 0 && this.options.defaultValue !== void 0 && !evaluate(value, this.options.defaultValue)) {
          value = this.options.defaultValue;
        }
        if (prevVal && prevVal.value === value && prevVal.meta === meta) {
          return prevVal;
        }
        return {
          value,
          meta
        };
      }
    );
  }
  /**
   * The current field state.
   */
  get state() {
    return this.store.state;
  }
  /**
   * @private
   */
  runValidator(props) {
    if (isStandardSchemaValidator(props.validate)) {
      return standardSchemaValidators[props.type](
        props.value,
        props.validate
      );
    }
    return props.validate(props.value);
  }
}
function normalizeError$1(rawError) {
  if (rawError) {
    return rawError;
  }
  return void 0;
}
function getErrorMapKey$1(cause) {
  switch (cause) {
    case "submit":
      return "onSubmit";
    case "blur":
      return "onBlur";
    case "mount":
      return "onMount";
    case "server":
      return "onServer";
    case "dynamic":
      return "onDynamic";
    case "change":
    default:
      return "onChange";
  }
}
function getDefaultFormGroupState(defaultState) {
  return {
    isSubmitted: defaultState.isSubmitted ?? false,
    isSubmitting: defaultState.isSubmitting ?? false,
    isValidating: defaultState.isValidating ?? false,
    submissionAttempts: defaultState.submissionAttempts ?? 0,
    isSubmitSuccessful: defaultState.isSubmitSuccessful ?? false
  };
}
function getDefaultFormGroupMeta(defaultMeta) {
  return {
    ...defaultFieldMeta,
    ...defaultMeta,
    errors: [],
    isPristine: true,
    isValid: true,
    isDefaultValue: true,
    isFieldsValidating: false,
    isFieldsValid: true,
    isGroupValid: true,
    canSubmit: true,
    isSubmitting: false,
    isSubmitted: false,
    isValidating: false,
    submissionAttempts: 0,
    isSubmitSuccessful: false
  };
}
class FormGroupApi {
  constructor(opts) {
    this.options = {};
    this.setFormGroupState = (updater) => {
      this.form.baseStore.setState((prev) => {
        const prevGroupState = prev.formGroupStateBase[this.name] ?? getDefaultFormGroupState({});
        return {
          ...prev,
          formGroupStateBase: {
            ...prev.formGroupStateBase,
            [this.name]: updater(prevGroupState)
          }
        };
      });
    };
    this._lastDistributedFieldNames = {};
    this.update = (opts2) => {
      this.options = opts2;
      this.name = opts2.name;
      if (!this.state.meta.isTouched && this.options.defaultValue !== void 0) {
        const formField = this.form.getFieldValue(this.name);
        if (!evaluate(formField, opts2.defaultValue)) {
          this.form.setFieldValue(this.name, opts2.defaultValue, {
            dontUpdateMeta: true,
            dontValidate: true,
            dontRunListeners: true
          });
        }
      }
      if (!this.form.getFieldMeta(this.name)) {
        this.form.setFieldMeta(this.name, {
          ...defaultFieldMeta,
          ...this.options.defaultMeta
        });
      }
    };
    this.mount = () => {
      this.update(this.options);
      this.form.formGroupApis.add(this);
      this.fieldInfo.instance = this;
      this.form.baseStore.setState((prev) => ({
        ...prev,
        formGroupStateBase: {
          ...prev.formGroupStateBase,
          [this.name]: prev.formGroupStateBase[this.name] ?? getDefaultFormGroupState({
            ...this.options.defaultState
          })
        }
      }));
      const { onMount } = this.options.validators || {};
      if (onMount) {
        const rawError = this.runValidator({
          validate: onMount,
          value: {
            value: this.state.value,
            groupApi: this,
            validationSource: "form"
          },
          type: "validate"
        });
        let groupOwnRawError = rawError;
        let groupFieldErrors = void 0;
        if (isGlobalGroupValidationError(rawError)) {
          groupOwnRawError = rawError.group;
          groupFieldErrors = rawError.fields;
        }
        const error = normalizeError(groupOwnRawError);
        if (error) {
          this.setMeta(
            (prev) => ({
              ...prev,
              errorMap: {
                ...prev.errorMap,
                onMount: error
              },
              errorSourceMap: {
                ...prev.errorSourceMap,
                onMount: "field"
              }
            })
          );
        }
        this.distributeFieldErrors("onMount", groupFieldErrors);
      }
      this.options.listeners?.onMount?.({
        value: this.state.value,
        groupApi: this
      });
      return () => {
        for (const [key, timeout] of Object.entries(
          this.timeoutIds.validations
        )) {
          if (timeout) {
            clearTimeout(timeout);
            this.timeoutIds.validations[key] = null;
          }
        }
        for (const [key, timeout] of Object.entries(this.timeoutIds.listeners)) {
          if (timeout) {
            clearTimeout(timeout);
            this.timeoutIds.listeners[key] = null;
          }
        }
        for (const [key, timeout] of Object.entries(
          this.timeoutIds.formListeners
        )) {
          if (timeout) {
            clearTimeout(timeout);
            this.timeoutIds.formListeners[key] = null;
          }
        }
        if (this.fieldInfo.instance !== this) return;
        for (const [key, validationMeta] of Object.entries(
          this.fieldInfo.validationMetaMap
        )) {
          validationMeta?.lastAbortController.abort();
          this.fieldInfo.validationMetaMap[key] = void 0;
        }
        this.form.formGroupApis.delete(this);
        this.form.baseStore.setState((prev) => ({
          ...prev,
          formGroupStateBase: {
            ...prev.formGroupStateBase,
            [this.name]: getDefaultFormGroupState({})
          }
        }));
        this.fieldInfo.instance = null;
        this.options.listeners?.onUnmount?.({
          value: this.state.value,
          groupApi: this
        });
      };
    };
    this.setValue = (updater, options) => {
      this.form.setFieldValue(
        this.name,
        updater,
        mergeOpts(options, { dontRunListeners: true, dontValidate: true })
      );
      if (!options?.dontRunListeners) {
        this.triggerOnChangeListener();
      }
      if (!options?.dontValidate) {
        this.validate("change");
      }
    };
    this.getMeta = () => this.store.state.meta;
    this.setMeta = (updater) => this.form.setFieldMeta(this.name, updater);
    this.getInfo = () => this.fieldInfo;
    this.getRelatedFields = () => {
      const fields = Object.values(this.form.fieldInfo);
      const relatedFields = [];
      for (const field of fields) {
        if (!field.instance) continue;
        if (!(field.instance instanceof FieldApi)) continue;
        if (field.instance.name.startsWith(this.name)) {
          relatedFields.push(field.instance);
        }
      }
      return relatedFields;
    };
    this.getRelatedFieldMetasDerived = () => {
      const fields = Object.entries(this.form.fieldMetaDerived.state);
      const relatedFieldMetas = [];
      for (const [fieldName, fieldMeta] of fields) {
        if (fieldName === this.name) continue;
        if (isFieldInGroup(this.name, fieldName)) {
          relatedFieldMetas.push({ ...fieldMeta, name: fieldName });
        }
      }
      return relatedFieldMetas;
    };
    this.buildChildFieldName = (relativeName) => {
      if (relativeName === "") return this.name;
      if (relativeName.startsWith("[")) return `${this.name}${relativeName}`;
      return `${this.name}.${relativeName}`;
    };
    this.distributeFieldErrors = (errorMapKey, fieldErrors) => {
      const previousNames = this._lastDistributedFieldNames[errorMapKey] ?? /* @__PURE__ */ new Set();
      const currentNames = /* @__PURE__ */ new Set();
      if (fieldErrors) {
        for (const [relativeName, err] of Object.entries(fieldErrors)) {
          if (err === void 0 || err === null || err === false) continue;
          currentNames.add(this.buildChildFieldName(relativeName));
        }
      }
      const allNames = /* @__PURE__ */ new Set([...previousNames, ...currentNames]);
      let hasErrored = false;
      for (const fullName of allNames) {
        const relativeName = fullName.startsWith(this.name + "[") ? fullName.slice(this.name.length) : fullName.slice(this.name.length + 1);
        const newFormValidatorError = fieldErrors?.[relativeName];
        const fieldMeta = this.form.getFieldMeta(fullName);
        if (!fieldMeta && !newFormValidatorError) continue;
        const previousErrorValue = fieldMeta?.errorMap[errorMapKey];
        const isPreviousErrorFromFormValidator = fieldMeta?.errorSourceMap[errorMapKey] === "form";
        const { newErrorValue, newSource } = determineFormLevelErrorSourceAndValue({
          newFormValidatorError,
          isPreviousErrorFromFormValidator,
          previousErrorValue
        });
        if (newErrorValue) hasErrored = true;
        if (previousErrorValue === newErrorValue && fieldMeta?.errorSourceMap[errorMapKey] === newSource) {
          continue;
        }
        this.form.setFieldMeta(fullName, (prev) => ({
          ...prev,
          errorMap: {
            ...prev.errorMap,
            [errorMapKey]: newErrorValue
          },
          errorSourceMap: {
            ...prev.errorSourceMap,
            [errorMapKey]: newSource
          }
        }));
      }
      this._lastDistributedFieldNames[errorMapKey] = currentNames;
      return hasErrored;
    };
    this.validateSync = (cause, errorFromForm, opts2 = {}) => {
      const validates = getSyncValidatorArray(cause, {
        ...this.options,
        form: this.form,
        group: this,
        validationLogic: this.options.validationLogic || this.form.options.validationLogic || defaultValidationLogic
      });
      const relatedFields = opts2.skipRelatedFieldValidation ? [] : this.getRelatedFields();
      const relatedFieldValidates = relatedFields.reduce(
        (acc, field) => {
          const fieldValidates = getSyncValidatorArray(cause, {
            ...field.options,
            form: field.form,
            validationLogic: field.form.options.validationLogic || defaultValidationLogic
          });
          fieldValidates.forEach((validate) => {
            validate.field = field;
          });
          return acc.concat(fieldValidates);
        },
        []
      );
      let hasErrored = false;
      batch(() => {
        const validateFieldOrGroupFn = (fieldOrGroup, validateObj) => {
          const errorMapKey = getErrorMapKey(validateObj.cause);
          const isGroup = fieldOrGroup === this;
          let rawError = void 0;
          if (validateObj.validate) {
            rawError = fieldOrGroup.runValidator({
              validate: validateObj.validate,
              value: {
                value: fieldOrGroup.store.state.value,
                // For the group's own validators we want standard schemas to
                // produce a `{ form, fields }` shape (with relative keys) so
                // we can fan errors out to children. Field-level validators on
                // related fields keep the regular field source.
                validationSource: isGroup ? "form" : "field",
                ...fieldOrGroup instanceof FormGroupApi ? {
                  groupApi: fieldOrGroup
                } : { fieldApi: fieldOrGroup }
              },
              type: "validate"
            });
          }
          let groupOwnRawError = rawError;
          let groupFieldErrors = void 0;
          if (isGroup && isGlobalGroupValidationError(rawError)) {
            groupOwnRawError = rawError.group;
            groupFieldErrors = rawError.fields;
          }
          const fieldLevelError = normalizeError(
            groupOwnRawError
          );
          const formLevelError = errorFromForm[errorMapKey];
          const { newErrorValue, newSource } = determineFieldLevelErrorSourceAndValue({
            formLevelError,
            fieldLevelError
          });
          if (fieldOrGroup.state.meta.errorMap?.[errorMapKey] !== newErrorValue) {
            fieldOrGroup.setMeta((prev) => ({
              ...prev,
              errorMap: {
                ...prev.errorMap,
                [errorMapKey]: newErrorValue
              },
              errorSourceMap: {
                ...prev.errorSourceMap,
                [errorMapKey]: newSource
              }
            }));
          }
          if (newErrorValue) {
            hasErrored = true;
          }
          if (isGroup) {
            const distributedHasErrored = this.distributeFieldErrors(
              errorMapKey,
              groupFieldErrors
            );
            if (distributedHasErrored) {
              hasErrored = true;
            }
          }
        };
        for (const validateObj of validates) {
          validateFieldOrGroupFn(this, validateObj);
        }
        for (const fieldValidateObj of relatedFieldValidates) {
          if (!fieldValidateObj.validate) continue;
          validateFieldOrGroupFn(fieldValidateObj.field, fieldValidateObj);
        }
      });
      const submitErrKey = getErrorMapKey("submit");
      if (
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        this.state.meta.errorMap?.[submitErrKey] && cause !== "submit" && !hasErrored
      ) {
        this.setMeta((prev) => ({
          ...prev,
          errorMap: {
            ...prev.errorMap,
            [submitErrKey]: void 0
          },
          errorSourceMap: {
            ...prev.errorSourceMap,
            [submitErrKey]: void 0
          }
        }));
      }
      return { hasErrored };
    };
    this.validateAsync = async (cause, formValidationResultPromise, opts2 = {}) => {
      const validates = getAsyncValidatorArray(cause, {
        ...this.options,
        form: this.form,
        group: this,
        validationLogic: this.options.validationLogic || this.form.options.validationLogic || defaultValidationLogic
      });
      const asyncFormValidationResults = await formValidationResultPromise;
      const relatedFields = opts2.skipRelatedFieldValidation ? [] : this.getRelatedFields();
      const relatedFieldValidates = relatedFields.reduce(
        (acc, field) => {
          const fieldValidates = getAsyncValidatorArray(cause, {
            ...field.options,
            form: field.form,
            validationLogic: field.form.options.validationLogic || defaultValidationLogic
          });
          fieldValidates.forEach((validate) => {
            validate.field = field;
          });
          return acc.concat(fieldValidates);
        },
        []
      );
      const validatesPromises = [];
      const linkedPromises = [];
      const hasAsyncValidators = validates.some((v) => v.validate) || relatedFieldValidates.some((v) => v.validate);
      if (hasAsyncValidators) {
        if (!this.state.meta.isValidating) {
          this.setMeta((prev) => ({ ...prev, isValidating: true }));
        }
        for (const linkedField of relatedFields) {
          linkedField.setMeta((prev) => ({ ...prev, isValidating: true }));
        }
      }
      const validateFieldOrGroupAsyncFn = (fieldOrGroup, validateObj, promises) => {
        const errorMapKey = getErrorMapKey(validateObj.cause);
        const fieldInfo = fieldOrGroup.getInfo();
        const fieldValidatorMeta = fieldInfo.validationMetaMap[errorMapKey];
        fieldValidatorMeta?.lastAbortController.abort();
        const controller = new AbortController();
        fieldInfo.validationMetaMap[errorMapKey] = {
          lastAbortController: controller
        };
        const isGroup = fieldOrGroup === this;
        promises.push(
          new Promise(async (resolve) => {
            let rawError;
            try {
              rawError = await new Promise((rawResolve, rawReject) => {
                if (fieldOrGroup.timeoutIds.validations[validateObj.cause]) {
                  clearTimeout(
                    fieldOrGroup.timeoutIds.validations[validateObj.cause]
                  );
                }
                fieldOrGroup.timeoutIds.validations[validateObj.cause] = setTimeout(async () => {
                  if (controller.signal.aborted) return rawResolve(void 0);
                  try {
                    rawResolve(
                      await this.runValidator({
                        validate: validateObj.validate,
                        value: {
                          value: fieldOrGroup.store.state.value,
                          signal: controller.signal,
                          // See sync counterpart: produce `{ form, fields }`
                          // from standard schemas attached to the group so we
                          // can fan errors out to children.
                          validationSource: isGroup ? "form" : "field",
                          ...fieldOrGroup instanceof FormGroupApi ? {
                            groupApi: fieldOrGroup
                          } : { fieldApi: fieldOrGroup }
                        },
                        type: "validateAsync"
                      })
                    );
                  } catch (e) {
                    rawReject(e);
                  }
                }, validateObj.debounceMs);
              });
            } catch (e) {
              rawError = e;
            }
            if (controller.signal.aborted) return resolve(void 0);
            let groupOwnRawError = rawError;
            let groupFieldErrors = void 0;
            if (isGroup && isGlobalGroupValidationError(rawError)) {
              groupOwnRawError = rawError.group;
              groupFieldErrors = rawError.fields;
            }
            const fieldLevelError = normalizeError(groupOwnRawError);
            const formLevelError = asyncFormValidationResults[fieldOrGroup.name]?.[errorMapKey];
            const { newErrorValue, newSource } = determineFieldLevelErrorSourceAndValue({
              formLevelError,
              fieldLevelError
            });
            if (fieldOrGroup.getInfo().instance !== fieldOrGroup) {
              return resolve(void 0);
            }
            fieldOrGroup.setMeta((prev) => {
              return {
                ...prev,
                errorMap: {
                  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                  ...prev?.errorMap,
                  [errorMapKey]: newErrorValue
                },
                errorSourceMap: {
                  ...prev.errorSourceMap,
                  [errorMapKey]: newSource
                }
              };
            });
            if (isGroup) {
              this.distributeFieldErrors(errorMapKey, groupFieldErrors);
            }
            resolve(newErrorValue);
          })
        );
      };
      for (const validateObj of validates) {
        if (!validateObj.validate) continue;
        validateFieldOrGroupAsyncFn(this, validateObj, validatesPromises);
      }
      for (const fieldValitateObj of relatedFieldValidates) {
        if (!fieldValitateObj.validate) continue;
        validateFieldOrGroupAsyncFn(
          fieldValitateObj.field,
          fieldValitateObj,
          linkedPromises
        );
      }
      let results = [];
      if (validatesPromises.length || linkedPromises.length) {
        results = await Promise.all(validatesPromises);
        await Promise.all(linkedPromises);
      }
      if (hasAsyncValidators) {
        this.setMeta((prev) => ({ ...prev, isValidating: false }));
        for (const linkedField of relatedFields) {
          linkedField.setMeta((prev) => ({ ...prev, isValidating: false }));
        }
      }
      return results.filter(Boolean);
    };
    this.validateAllFields = async (cause) => {
      const fieldValidationPromises = [];
      batch(() => {
        void Object.values(this.getRelatedFields()).forEach((fieldInstance) => {
          fieldValidationPromises.push(
            // Remember, `validate` is either a sync operation or a promise
            Promise.resolve().then(
              () => fieldInstance.validate(cause, {
                skipFormValidation: true,
                skipGroupValidation: true
              })
            )
          );
          if (!fieldInstance.store.state.meta.isTouched) {
            fieldInstance.setMeta((prev) => ({ ...prev, isTouched: true }));
          }
        });
      });
      const fieldErrorMapMap = await Promise.all(fieldValidationPromises);
      return fieldErrorMapMap.flat();
    };
    this.validateArrayFieldsStartingFrom = (field, index, cause) => {
      return this.form.validateArrayFieldsStartingFrom(field, index, cause);
    };
    this.validateField = (field, cause) => {
      return this.form.validateField(field, cause);
    };
    this.getFieldValue = (field) => {
      return this.form.getFieldValue(field);
    };
    this.getFieldMeta = (field) => {
      return this.form.getFieldMeta(field);
    };
    this.setFieldMeta = (field, updater) => {
      return this.form.setFieldMeta(field, updater);
    };
    this.setFieldValue = (field, value) => {
      return this.form.setFieldValue(field, value);
    };
    this.deleteField = (field) => {
      return this.form.deleteField(field);
    };
    this.pushFieldValue = (field, value) => {
      return this.form.pushFieldValue(field, value);
    };
    this.insertFieldValue = (field, index, value) => {
      return this.form.insertFieldValue(field, index, value);
    };
    this.replaceFieldValue = (field, index, value) => {
      return this.form.replaceFieldValue(field, index, value);
    };
    this.swapFieldValues = (field, index1, index2) => {
      return this.form.swapFieldValues(field, index1, index2);
    };
    this.moveFieldValues = (field, fromIndex, toIndex) => {
      return this.form.moveFieldValues(field, fromIndex, toIndex);
    };
    this.clearFieldValues = (field) => {
      return this.form.clearFieldValues(field);
    };
    this.resetField = (field) => {
      return this.form.resetField(field);
    };
    this.removeFieldValue = (field, index) => {
      return this.form.removeFieldValue(field, index);
    };
    this.areRelatedFieldsValid = () => {
      return Object.values(this.getRelatedFields()).every(
        (field) => field.state.meta.isValid
      );
    };
    this.validate = (cause, opts2) => {
      const { fieldsErrorMap } = opts2?.skipFormValidation ? { fieldsErrorMap: {} } : this.form.validateSync(cause, {
        dontUpdateFormErrorMap: true,
        filterFieldNames: (fieldName) => isFieldInGroup(this.name, fieldName)
      });
      const { hasErrored } = this.validateSync(
        cause,
        fieldsErrorMap[this.name] ?? {},
        { skipRelatedFieldValidation: opts2?.skipRelatedFieldValidation }
      );
      if (hasErrored && !this.options.asyncAlways) {
        this.getInfo().validationMetaMap[getErrorMapKey(cause)]?.lastAbortController.abort();
        return this.state.meta.errors;
      }
      const formValidationResultPromise = opts2?.skipFormValidation ? Promise.resolve({}) : this.form.validateAsync(cause, {
        dontUpdateFormErrorMap: true,
        filterFieldNames: (fieldName) => isFieldInGroup(this.name, fieldName)
      });
      return this.validateAsync(cause, formValidationResultPromise, {
        skipRelatedFieldValidation: opts2?.skipRelatedFieldValidation
      });
    };
    this.triggerOnChangeListener = () => {
      const formDebounceMs = this.form.options.listeners?.onChangeGroupDebounceMs;
      if (formDebounceMs && formDebounceMs > 0) {
        if (this.timeoutIds.formListeners.change) {
          clearTimeout(this.timeoutIds.formListeners.change);
        }
        this.timeoutIds.formListeners.change = setTimeout(() => {
          this.form.options.listeners?.onChangeGroup?.({
            formApi: this.form,
            groupApi: this
          });
        }, formDebounceMs);
      } else {
        this.form.options.listeners?.onChangeGroup?.({
          formApi: this.form,
          groupApi: this
        });
      }
      const fieldDebounceMs = this.options.listeners?.onChangeDebounceMs;
      if (fieldDebounceMs && fieldDebounceMs > 0) {
        if (this.timeoutIds.listeners.change) {
          clearTimeout(this.timeoutIds.listeners.change);
        }
        this.timeoutIds.listeners.change = setTimeout(() => {
          this.options.listeners?.onChange?.({
            value: this.state.value,
            groupApi: this
          });
        }, fieldDebounceMs);
      } else {
        this.options.listeners?.onChange?.({
          value: this.state.value,
          groupApi: this
        });
      }
    };
    this.triggerOnSubmitListener = () => {
      this.options.listeners?.onSubmit?.({
        value: this.state.value,
        groupApi: this
      });
    };
    this._handleSubmit = async (submitMeta) => {
      this.setFormGroupState((old) => ({
        ...old,
        // Submission attempts mark the form as not submitted
        isSubmitted: false,
        // Count submission attempts
        submissionAttempts: old.submissionAttempts + 1,
        isSubmitSuccessful: false
        // Reset isSubmitSuccessful at the start of submission
      }));
      batch(() => {
        void Object.values(this.getRelatedFields()).forEach((field) => {
          if (!field.state.meta.isTouched) {
            field.setMeta((prev) => ({ ...prev, isTouched: true }));
          }
        });
      });
      const submitMetaArg = submitMeta ?? this.options.onSubmitMeta;
      this.setFormGroupState((d) => ({ ...d, isSubmitting: true }));
      const done = () => {
        this.setFormGroupState((prev) => ({ ...prev, isSubmitting: false }));
      };
      await this.validateAllFields("submit");
      if (!this.areRelatedFieldsValid()) {
        done();
        this.options.onGroupSubmitInvalid?.({
          value: this.state.value,
          groupApi: this,
          meta: submitMetaArg
        });
        return;
      }
      await this.validate("submit", {
        // This has already happened in the previous step
        skipRelatedFieldValidation: true
      });
      if (!this.areRelatedFieldsValid() || !this.state.meta.isValid) {
        done();
        this.options.onGroupSubmitInvalid?.({
          value: this.state.value,
          groupApi: this,
          meta: submitMetaArg
        });
        return;
      }
      batch(() => {
        void Object.values(this.getRelatedFields()).forEach((field) => {
          field.options.listeners?.onGroupSubmit?.({
            value: field.state.value,
            fieldApi: field
          });
        });
      });
      this.options.listeners?.onSubmit?.({
        groupApi: this,
        value: this.state.value
      });
      try {
        await this.options.onGroupSubmit?.({
          value: this.state.value,
          groupApi: this,
          meta: submitMetaArg
        });
        batch(() => {
          this.setFormGroupState((prev) => ({
            ...prev,
            isSubmitted: true,
            isSubmitSuccessful: true
            // Set isSubmitSuccessful to true on successful submission
          }));
          done();
        });
      } catch (err) {
        this.setFormGroupState((prev) => ({
          ...prev,
          isSubmitSuccessful: false
          // Ensure isSubmitSuccessful is false if an error occurs
        }));
        done();
        throw err;
      }
    };
    this.form = opts.form;
    this.name = opts.name;
    this.options = opts;
    this.timeoutIds = {
      validations: {},
      listeners: {},
      formListeners: {}
    };
    this.fieldInfo = {
      instance: null,
      validationMetaMap: {
        onChange: void 0,
        onBlur: void 0,
        onSubmit: void 0,
        onMount: void 0,
        onServer: void 0,
        onDynamic: void 0
      }
    };
    this.store = createStore(
      (prevVal) => {
        this.form.formGroupMetaDerived.get();
        this.form.baseStore.get();
        const meta = this.form.getFormGroupMeta(this.name) ?? getDefaultFormGroupMeta(opts.defaultMeta);
        let value = this.form.getFieldValue(this.name);
        if (!meta.isTouched && value === void 0 && this.options.defaultValue !== void 0 && !evaluate(value, this.options.defaultValue)) {
          value = this.options.defaultValue;
        }
        if (prevVal && prevVal.value === value && prevVal.meta === meta) {
          return prevVal;
        }
        return {
          value,
          meta
        };
      }
    );
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  /**
   * The current field state.
   */
  get state() {
    return this.store.state;
  }
  /**
   * @private
   */
  runValidator(props) {
    if (isStandardSchemaValidator(props.validate)) {
      const result = standardSchemaValidators[props.type](
        props.value,
        props.validate
      );
      if (props.type === "validate") {
        return remapStandardSchemaResultForGroup(result);
      }
      return result.then(
        remapStandardSchemaResultForGroup
      );
    }
    return props.validate(
      props.value
    );
  }
  handleSubmit(submitMeta) {
    return this._handleSubmit(submitMeta);
  }
}
function normalizeError(rawError) {
  if (rawError) {
    return rawError;
  }
  return void 0;
}
function isGlobalGroupValidationError(error) {
  return !!error && typeof error === "object" && "fields" in error;
}
function remapStandardSchemaResultForGroup(result) {
  if (!result || typeof result !== "object") return result;
  if (!("form" in result) && !("fields" in result)) return result;
  const { form, fields, ...rest } = result;
  return { ...rest, group: form, fields };
}
function getErrorMapKey(cause) {
  switch (cause) {
    case "submit":
      return "onSubmit";
    case "blur":
      return "onBlur";
    case "mount":
      return "onMount";
    case "server":
      return "onServer";
    case "dynamic":
      return "onDynamic";
    case "change":
    default:
      return "onChange";
  }
}
function mergeAndUpdate(form, fn) {
  if (!fn) return;
  const newObj = Object.assign({}, form, {
    state: deepCopy(form.state)
  });
  fn(newObj);
  if (newObj.fieldInfo !== form.fieldInfo) {
    form.fieldInfo = newObj.fieldInfo;
  }
  if (newObj.options !== form.options) {
    form.options = newObj.options;
  }
  const baseFormKeys = Object.keys({
    values: null,
    validationMetaMap: null,
    fieldMetaBase: null,
    formGroupStateBase: null,
    isSubmitting: null,
    isSubmitted: null,
    isValidating: null,
    submissionAttempts: null,
    isSubmitSuccessful: null,
    _force_re_eval: null
    // Do not remove this, it ensures that we have all the keys in `BaseFormState`
  });
  const diffedObject = baseFormKeys.reduce((prev, key) => {
    if (form.state[key] !== newObj.state[key]) {
      prev[key] = newObj.state[key];
    }
    return prev;
  }, {});
  batch(() => {
    if (Object.keys(diffedObject).length) {
      form.baseStore.setState((prev) => ({ ...prev, ...diffedObject }));
    }
    if (newObj.state.errorMap !== form.state.errorMap) {
      form.setErrorMap(newObj.state.errorMap);
    }
  });
  return newObj;
}
function defaultCompare(a, b) {
  return a === b;
}
function useSelector(source, selector = (s) => s, options) {
  const compare = defaultCompare;
  const subscribe = reactExports.useCallback((handleStoreChange) => {
    const { unsubscribe } = source.subscribe(handleStoreChange);
    return unsubscribe;
  }, [source]);
  const getSnapshot = reactExports.useCallback(() => source.get(), [source]);
  return withSelectorExports.useSyncExternalStoreWithSelector(subscribe, getSnapshot, getSnapshot, selector, compare);
}
const useStore = (source, selector = (s) => s, compare) => useSelector(source, selector);
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? reactExports.useLayoutEffect : reactExports.useEffect;
function useField(opts) {
  const [prevOptions, setPrevOptions] = reactExports.useState(() => ({
    form: opts.form,
    name: opts.name
  }));
  const [fieldApi, setFieldApi] = reactExports.useState(() => {
    return new FieldApi({
      ...opts
    });
  });
  if (prevOptions.form !== opts.form || prevOptions.name !== opts.name) {
    setFieldApi(
      new FieldApi({
        ...opts
      })
    );
    setPrevOptions({ form: opts.form, name: opts.name });
  }
  const reactiveStateValue = useStore(
    fieldApi.store,
    opts.mode === "array" ? (state) => state.meta._arrayVersion || 0 : (state) => state.value
  );
  const reactiveMetaIsTouched = useStore(
    fieldApi.store,
    (state) => state.meta.isTouched
  );
  const reactiveMetaIsBlurred = useStore(
    fieldApi.store,
    (state) => state.meta.isBlurred
  );
  const reactiveMetaIsDirty = useStore(
    fieldApi.store,
    (state) => state.meta.isDirty
  );
  const reactiveMetaErrorMap = useStore(
    fieldApi.store,
    (state) => state.meta.errorMap
  );
  const reactiveMetaErrorSourceMap = useStore(
    fieldApi.store,
    (state) => state.meta.errorSourceMap
  );
  const reactiveMetaIsValidating = useStore(
    fieldApi.store,
    (state) => state.meta.isValidating
  );
  const extendedFieldApi = reactExports.useMemo(() => {
    const reactiveFieldApi = {
      ...fieldApi,
      get state() {
        return {
          // For array mode, reactiveStateValue is the length (for reactivity tracking),
          // so we need to get the actual value from fieldApi
          value: opts.mode === "array" ? fieldApi.state.value : reactiveStateValue,
          get meta() {
            return {
              ...fieldApi.state.meta,
              isTouched: reactiveMetaIsTouched,
              isBlurred: reactiveMetaIsBlurred,
              isDirty: reactiveMetaIsDirty,
              errorMap: reactiveMetaErrorMap,
              errorSourceMap: reactiveMetaErrorSourceMap,
              isValidating: reactiveMetaIsValidating
            };
          }
        };
      }
    };
    const extendedApi = reactiveFieldApi;
    return extendedApi;
  }, [
    fieldApi,
    opts.mode,
    reactiveStateValue,
    reactiveMetaIsTouched,
    reactiveMetaIsBlurred,
    reactiveMetaIsDirty,
    reactiveMetaErrorMap,
    reactiveMetaErrorSourceMap,
    reactiveMetaIsValidating
  ]);
  useIsomorphicLayoutEffect(fieldApi.mount, [fieldApi]);
  useIsomorphicLayoutEffect(() => {
    fieldApi.update(opts);
  });
  return extendedFieldApi;
}
const Field = (({
  children,
  ...fieldOptions
}) => {
  const fieldApi = useField(fieldOptions);
  const jsxToDisplay = reactExports.useMemo(
    () => functionalUpdate(children, fieldApi),
    [children, fieldApi]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: jsxToDisplay });
});
function useUUID() {
  return reactExports.useState(() => uuid())[0];
}
const _React = React;
const useFormId = reactExports.version.split(".")[0] === "17" ? useUUID : _React.useId;
function useFormGroup(opts) {
  const [prevOptions, setPrevOptions] = reactExports.useState(() => ({
    form: opts.form,
    name: opts.name
  }));
  const [formGroupApi, setFormGroupApi] = reactExports.useState(() => {
    return new FormGroupApi({
      ...opts
    });
  });
  if (prevOptions.form !== opts.form || prevOptions.name !== opts.name) {
    setFormGroupApi(
      new FormGroupApi({
        ...opts
      })
    );
    setPrevOptions({ form: opts.form, name: opts.name });
  }
  const reactiveStateValue = useStore(
    formGroupApi.store,
    (state) => state.value
  );
  const reactiveMetaIsTouched = useStore(
    formGroupApi.store,
    (state) => state.meta.isTouched
  );
  const reactiveMetaIsBlurred = useStore(
    formGroupApi.store,
    (state) => state.meta.isBlurred
  );
  const reactiveMetaIsDirty = useStore(
    formGroupApi.store,
    (state) => state.meta.isDirty
  );
  const reactiveMetaErrorMap = useStore(
    formGroupApi.store,
    (state) => state.meta.errorMap
  );
  const reactiveMetaErrorSourceMap = useStore(
    formGroupApi.store,
    (state) => state.meta.errorSourceMap
  );
  const reactiveMetaIsValidating = useStore(
    formGroupApi.store,
    (state) => state.meta.isValidating
  );
  const reactiveMetaIsSubmitting = useStore(
    formGroupApi.store,
    (state) => state.meta.isSubmitting
  );
  const reactiveMetaIsSubmitted = useStore(
    formGroupApi.store,
    (state) => state.meta.isSubmitted
  );
  const reactiveMetaSubmissionAttempts = useStore(
    formGroupApi.store,
    (state) => state.meta.submissionAttempts
  );
  const reactiveMetaIsSubmitSuccessful = useStore(
    formGroupApi.store,
    (state) => state.meta.isSubmitSuccessful
  );
  const reactiveMetaCanSubmit = useStore(
    formGroupApi.store,
    (state) => state.meta.canSubmit
  );
  const reactiveMetaIsValid = useStore(
    formGroupApi.store,
    (state) => state.meta.isValid
  );
  const reactiveMetaIsFieldsValid = useStore(
    formGroupApi.store,
    (state) => state.meta.isFieldsValid
  );
  const reactiveMetaIsFieldsValidating = useStore(
    formGroupApi.store,
    (state) => state.meta.isFieldsValidating
  );
  const reactiveMetaIsGroupValid = useStore(
    formGroupApi.store,
    (state) => state.meta.isGroupValid
  );
  const extendedFieldApi = reactExports.useMemo(() => {
    const reactiveFieldApi = {
      ...formGroupApi,
      handleSubmit: ((...props) => {
        return formGroupApi._handleSubmit(...props);
      }),
      get state() {
        return {
          ...formGroupApi.state,
          value: reactiveStateValue,
          get meta() {
            return {
              ...formGroupApi.state.meta,
              isTouched: reactiveMetaIsTouched,
              isBlurred: reactiveMetaIsBlurred,
              isDirty: reactiveMetaIsDirty,
              errorMap: reactiveMetaErrorMap,
              errorSourceMap: reactiveMetaErrorSourceMap,
              isValidating: reactiveMetaIsValidating,
              isSubmitting: reactiveMetaIsSubmitting,
              isSubmitted: reactiveMetaIsSubmitted,
              submissionAttempts: reactiveMetaSubmissionAttempts,
              isSubmitSuccessful: reactiveMetaIsSubmitSuccessful,
              canSubmit: reactiveMetaCanSubmit,
              isValid: reactiveMetaIsValid,
              isFieldsValid: reactiveMetaIsFieldsValid,
              isFieldsValidating: reactiveMetaIsFieldsValidating,
              isGroupValid: reactiveMetaIsGroupValid
            };
          }
        };
      }
    };
    const extendedApi = reactiveFieldApi;
    return extendedApi;
  }, [
    formGroupApi,
    reactiveStateValue,
    reactiveMetaIsTouched,
    reactiveMetaIsBlurred,
    reactiveMetaIsDirty,
    reactiveMetaErrorMap,
    reactiveMetaErrorSourceMap,
    reactiveMetaIsValidating,
    reactiveMetaIsSubmitting,
    reactiveMetaIsSubmitted,
    reactiveMetaSubmissionAttempts,
    reactiveMetaIsSubmitSuccessful,
    reactiveMetaCanSubmit,
    reactiveMetaIsValid,
    reactiveMetaIsFieldsValid,
    reactiveMetaIsFieldsValidating,
    reactiveMetaIsGroupValid
  ]);
  useIsomorphicLayoutEffect(formGroupApi.mount, [formGroupApi]);
  useIsomorphicLayoutEffect(() => {
    formGroupApi.update(opts);
  });
  return extendedFieldApi;
}
const FormGroup = (({
  children,
  ...formGroupOptions
}) => {
  const formGroupApi = useFormGroup(formGroupOptions);
  const jsxToDisplay = reactExports.useMemo(
    () => functionalUpdate(children, formGroupApi),
    [children, formGroupApi]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: jsxToDisplay });
});
function LocalSubscribe({
  form,
  selector = (state) => state,
  children
}) {
  const data = useStore(form.store, selector);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: functionalUpdate(children, data) });
}
function useForm(opts) {
  const fallbackFormId = useFormId();
  const [prevFormId, setPrevFormId] = reactExports.useState(opts?.formId);
  const [formApi, setFormApi] = reactExports.useState(() => {
    return new FormApi({ ...opts, formId: opts?.formId ?? fallbackFormId });
  });
  if (prevFormId !== opts?.formId) {
    const formId = opts?.formId ?? fallbackFormId;
    setFormApi(new FormApi({ ...opts, formId }));
    setPrevFormId(formId);
  }
  const extendedFormApi = reactExports.useMemo(() => {
    const extendedApi = {
      ...formApi,
      handleSubmit: ((...props) => {
        return formApi._handleSubmit(...props);
      }),
      // We must add all `get`ters from `core`'s `FormApi` here, as otherwise the spread operator won't catch those
      get formId() {
        return formApi._formId;
      },
      get state() {
        return formApi.store.state;
      }
    };
    extendedApi.Field = function APIField(props) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { ...props, form: formApi });
    };
    extendedApi.FormGroup = function APIFormGroup(props) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(FormGroup, { ...props, form: formApi });
    };
    extendedApi.Subscribe = function Subscribe(props) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        LocalSubscribe,
        {
          form: formApi,
          selector: props.selector,
          children: props.children
        }
      );
    };
    return extendedApi;
  }, [formApi]);
  useIsomorphicLayoutEffect(formApi.mount, []);
  useIsomorphicLayoutEffect(() => {
    formApi.update(opts);
  });
  const hasRan = reactExports.useRef(false);
  useIsomorphicLayoutEffect(() => {
    if (!hasRan.current) return;
    if (!opts?.transform) return;
    mergeAndUpdate(formApi, opts.transform);
  }, [formApi, opts?.transform]);
  useIsomorphicLayoutEffect(() => {
    hasRan.current = true;
  });
  return extendedFormApi;
}
export {
  useStore as a,
  useForm as u
};
