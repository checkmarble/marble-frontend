import { r as reactExports, R as jsxRuntimeExports } from "../server.js";
import { dG as useControllableState, dH as composeEventHandlers, dI as useComposedRefs, dJ as createContextScope } from "./format-NPGUXq-g.js";
import { R as Root2, A as Anchor, P as Portal, c as createPopperScope, D as DismissableLayer, C as Content, a as Arrow } from "./index-BF4TC3go.js";
import { P as Presence } from "./index-CR1bHmei.js";
import { P as Primitive } from "./index-C_WgunUr.js";
var originalBodyUserSelect;
var HOVERCARD_NAME = "HoverCard";
var [createHoverCardContext] = createContextScope(HOVERCARD_NAME, [
  createPopperScope
]);
var usePopperScope = createPopperScope();
var [HoverCardProvider, useHoverCardContext] = createHoverCardContext(HOVERCARD_NAME);
var HoverCard = (props) => {
  const {
    __scopeHoverCard,
    children,
    open: openProp,
    defaultOpen,
    onOpenChange,
    openDelay = 700,
    closeDelay = 300
  } = props;
  const popperScope = usePopperScope(__scopeHoverCard);
  const openTimerRef = reactExports.useRef(0);
  const closeTimerRef = reactExports.useRef(0);
  const hasSelectionRef = reactExports.useRef(false);
  const isPointerDownOnContentRef = reactExports.useRef(false);
  const [open, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen ?? false,
    onChange: onOpenChange,
    caller: HOVERCARD_NAME
  });
  const handleOpen = reactExports.useCallback(() => {
    clearTimeout(closeTimerRef.current);
    openTimerRef.current = window.setTimeout(() => setOpen(true), openDelay);
  }, [openDelay, setOpen]);
  const handleClose = reactExports.useCallback(() => {
    clearTimeout(openTimerRef.current);
    if (!hasSelectionRef.current && !isPointerDownOnContentRef.current) {
      closeTimerRef.current = window.setTimeout(() => setOpen(false), closeDelay);
    }
  }, [closeDelay, setOpen]);
  const handleDismiss = reactExports.useCallback(() => setOpen(false), [setOpen]);
  reactExports.useEffect(() => {
    return () => {
      clearTimeout(openTimerRef.current);
      clearTimeout(closeTimerRef.current);
    };
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    HoverCardProvider,
    {
      scope: __scopeHoverCard,
      open,
      onOpenChange: setOpen,
      onOpen: handleOpen,
      onClose: handleClose,
      onDismiss: handleDismiss,
      hasSelectionRef,
      isPointerDownOnContentRef,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Root2, { ...popperScope, children })
    }
  );
};
HoverCard.displayName = HOVERCARD_NAME;
var TRIGGER_NAME = "HoverCardTrigger";
var HoverCardTrigger = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeHoverCard, ...triggerProps } = props;
    const context = useHoverCardContext(TRIGGER_NAME, __scopeHoverCard);
    const popperScope = usePopperScope(__scopeHoverCard);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Anchor, { asChild: true, ...popperScope, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.a,
      {
        "data-state": context.open ? "open" : "closed",
        ...triggerProps,
        ref: forwardedRef,
        onPointerEnter: composeEventHandlers(props.onPointerEnter, excludeTouch(context.onOpen)),
        onPointerLeave: composeEventHandlers(props.onPointerLeave, excludeTouch(context.onClose)),
        onFocus: composeEventHandlers(props.onFocus, context.onOpen),
        onBlur: composeEventHandlers(props.onBlur, context.onClose),
        onTouchStart: composeEventHandlers(props.onTouchStart, (event) => event.preventDefault())
      }
    ) });
  }
);
HoverCardTrigger.displayName = TRIGGER_NAME;
var PORTAL_NAME = "HoverCardPortal";
var [PortalProvider, usePortalContext] = createHoverCardContext(PORTAL_NAME, {
  forceMount: void 0
});
var HoverCardPortal = (props) => {
  const { __scopeHoverCard, forceMount, children, container } = props;
  const context = useHoverCardContext(PORTAL_NAME, __scopeHoverCard);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(PortalProvider, { scope: __scopeHoverCard, forceMount, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Presence, { present: forceMount || context.open, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Portal, { asChild: true, container, children }) }) });
};
HoverCardPortal.displayName = PORTAL_NAME;
var CONTENT_NAME = "HoverCardContent";
var HoverCardContent = reactExports.forwardRef(
  (props, forwardedRef) => {
    const portalContext = usePortalContext(CONTENT_NAME, props.__scopeHoverCard);
    const { forceMount = portalContext.forceMount, ...contentProps } = props;
    const context = useHoverCardContext(CONTENT_NAME, props.__scopeHoverCard);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Presence, { present: forceMount || context.open, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      HoverCardContentImpl,
      {
        "data-state": context.open ? "open" : "closed",
        ...contentProps,
        onPointerEnter: composeEventHandlers(props.onPointerEnter, excludeTouch(context.onOpen)),
        onPointerLeave: composeEventHandlers(props.onPointerLeave, excludeTouch(context.onClose)),
        ref: forwardedRef
      }
    ) });
  }
);
HoverCardContent.displayName = CONTENT_NAME;
var HoverCardContentImpl = reactExports.forwardRef((props, forwardedRef) => {
  const {
    __scopeHoverCard,
    onEscapeKeyDown,
    onPointerDownOutside,
    onFocusOutside,
    onInteractOutside,
    ...contentProps
  } = props;
  const context = useHoverCardContext(CONTENT_NAME, __scopeHoverCard);
  const popperScope = usePopperScope(__scopeHoverCard);
  const ref = reactExports.useRef(null);
  const composedRefs = useComposedRefs(forwardedRef, ref);
  const [containSelection, setContainSelection] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (containSelection) {
      const body = document.body;
      originalBodyUserSelect = body.style.userSelect || body.style.webkitUserSelect;
      body.style.userSelect = "none";
      body.style.webkitUserSelect = "none";
      return () => {
        body.style.userSelect = originalBodyUserSelect;
        body.style.webkitUserSelect = originalBodyUserSelect;
      };
    }
  }, [containSelection]);
  reactExports.useEffect(() => {
    if (ref.current) {
      const handlePointerUp = () => {
        setContainSelection(false);
        context.isPointerDownOnContentRef.current = false;
        setTimeout(() => {
          const hasSelection = document.getSelection()?.toString() !== "";
          if (hasSelection) context.hasSelectionRef.current = true;
        });
      };
      document.addEventListener("pointerup", handlePointerUp);
      return () => {
        document.removeEventListener("pointerup", handlePointerUp);
        context.hasSelectionRef.current = false;
        context.isPointerDownOnContentRef.current = false;
      };
    }
  }, [context.isPointerDownOnContentRef, context.hasSelectionRef]);
  reactExports.useEffect(() => {
    if (ref.current) {
      const tabbables = getTabbableNodes(ref.current);
      tabbables.forEach((tabbable) => tabbable.setAttribute("tabindex", "-1"));
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    DismissableLayer,
    {
      asChild: true,
      disableOutsidePointerEvents: false,
      onInteractOutside,
      onEscapeKeyDown,
      onPointerDownOutside,
      onFocusOutside: composeEventHandlers(onFocusOutside, (event) => {
        event.preventDefault();
      }),
      onDismiss: context.onDismiss,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Content,
        {
          ...popperScope,
          ...contentProps,
          onPointerDown: composeEventHandlers(contentProps.onPointerDown, (event) => {
            if (event.currentTarget.contains(event.target)) {
              setContainSelection(true);
            }
            context.hasSelectionRef.current = false;
            context.isPointerDownOnContentRef.current = true;
          }),
          ref: composedRefs,
          style: {
            ...contentProps.style,
            userSelect: containSelection ? "text" : void 0,
            // Safari requires prefix
            WebkitUserSelect: containSelection ? "text" : void 0,
            // re-namespace exposed content custom properties
            ...{
              "--radix-hover-card-content-transform-origin": "var(--radix-popper-transform-origin)",
              "--radix-hover-card-content-available-width": "var(--radix-popper-available-width)",
              "--radix-hover-card-content-available-height": "var(--radix-popper-available-height)",
              "--radix-hover-card-trigger-width": "var(--radix-popper-anchor-width)",
              "--radix-hover-card-trigger-height": "var(--radix-popper-anchor-height)"
            }
          }
        }
      )
    }
  );
});
var ARROW_NAME = "HoverCardArrow";
var HoverCardArrow = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeHoverCard, ...arrowProps } = props;
    const popperScope = usePopperScope(__scopeHoverCard);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Arrow, { ...popperScope, ...arrowProps, ref: forwardedRef });
  }
);
HoverCardArrow.displayName = ARROW_NAME;
function excludeTouch(eventHandler) {
  return (event) => event.pointerType === "touch" ? void 0 : eventHandler();
}
function getTabbableNodes(container) {
  const nodes = [];
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (node) => {
      return node.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    }
  });
  while (walker.nextNode()) nodes.push(walker.currentNode);
  return nodes;
}
export {
  HoverCard as H,
  HoverCardTrigger as a,
  HoverCardPortal as b,
  HoverCardContent as c
};
