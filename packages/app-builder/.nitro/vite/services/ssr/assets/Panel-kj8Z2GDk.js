import { R as jsxRuntimeExports, r as reactExports } from "../server.js";
import { d as cn, S as StickyComponent, e as Icon, T as Typo, dX as reactDomExports, B as Button, e2 as Slot, e3 as UnstyledInput } from "./format-NPGUXq-g.js";
import { B } from "./sharpstate.es-CeF1Mf5b.js";
import { M } from "./services-middleware-DR8Hua1Y.js";
function PanelOverlay() {
  const sharp = PanelSharpFactory.useSharp();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "absolute inset-0 bg-grey-primary/10 z-20 backdrop-blur-xs animate-overlay-show",
      onClick: sharp.actions.close,
      "aria-hidden": "true"
    }
  );
}
const sizeClasses = {
  small: "max-w-[calc(100vw_/_3)]",
  medium: "max-w-[50vw]",
  large: "max-w-[calc(100vw_*_(2_/_3))]"
};
const PanelSharpFactory = B({
  name: "Panel",
  initializer: (params) => {
    const isControlled = params.open !== void 0;
    return {
      isOpen: !!params.open,
      onOpenChange: params.onOpenChange,
      isControlled
    };
  }
}).withActions({
  open(api) {
    if (api.value.isControlled) {
      api.value.onOpenChange?.(true);
    } else {
      api.value.isOpen = true;
    }
  },
  close(api) {
    if (api.value.onOpenChange?.(false) === false) {
      return;
    }
    if (!api.value.isControlled) {
      api.value.isOpen = false;
    }
  }
});
function PanelRoot({ children, open, onOpenChange }) {
  const sharp = PanelSharpFactory.createSharp({
    open,
    onOpenChange
  });
  reactExports.useEffect(() => {
    if (!sharp.value.isControlled && open !== void 0) {
      console.warn(`Panel was initialized as uncontrolled but has its value change to ${open}`);
    }
    sharp.value.isOpen = !!open;
  }, [sharp, open]);
  reactExports.useEffect(() => {
    sharp.value.onOpenChange = onOpenChange;
  }, [onOpenChange, sharp]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(PanelSharpFactory.Provider, { value: sharp, children });
}
const PanelTrigger = reactExports.forwardRef(function PanelTrigger2({ asChild, onClick, ...props }, ref) {
  const sharp = PanelSharpFactory.useSharp();
  const Comp = asChild ? Slot : "button";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Comp,
    {
      ref,
      type: asChild ? void 0 : "button",
      ...props,
      onClick: (event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          sharp.actions.open();
        }
      }
    }
  );
});
PanelTrigger.displayName = "PanelTrigger";
function PanelContainer({ children, className, size = "small" }) {
  const sharp = PanelSharpFactory.useSharp();
  if (!sharp.value.isOpen) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(PanelContainerPortal, { className, size, children });
}
function PanelContainerPortal({ children, className, size = "small" }) {
  const sharp = PanelSharpFactory.useSharp();
  const panelRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        sharp.actions.close();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [sharp]);
  reactExports.useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const focusableElements = panel.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const handleTabKey = (event) => {
      if (event.key !== "Tab") return;
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          event.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          event.preventDefault();
        }
      }
    };
    firstElement?.focus();
    panel.addEventListener("keydown", handleTabKey);
    return () => panel.removeEventListener("keydown", handleTabKey);
  }, []);
  return reactDomExports.createPortal(
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 z-20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(PanelOverlay, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          ref: panelRef,
          className: cn(
            "fixed inset-y-0 z-20 right-0 bg-surface-card border-l border-grey-border w-full flex flex-col not-motion-reduce:animate-slide-right-fade-in overflow-y-auto",
            sizeClasses[size],
            className
          ),
          role: "dialog",
          "aria-modal": "true",
          children
        }
      )
    ] }),
    document.body
  );
}
function PanelHeader({ children, className }) {
  const sharp = PanelSharpFactory.useSharp();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(StickyComponent, { sentinelClassName: "h-0 top-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: cn(
        "sticky top-0 -m-lg mb-0 p-lg flex gap-md items-center bg-surface-card z-1 border-b border-transparent sentinel-intersect:border-grey-border sentinel-intersect:shadow-sticky-top"
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Icon,
          {
            icon: "x",
            className: "size-6 cursor-pointer text-grey-secondary hover:text-grey-primary",
            onClick: sharp.actions.close,
            "aria-label": "Close panel"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typo, { as: "div", variant: "title2", className: cn("grow", className), children })
      ]
    }
  ) });
}
const PanelHeaderInput = reactExports.forwardRef(function PanelHeaderInput2({ className, ...props }, ref) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    UnstyledInput,
    {
      ref,
      className: "field-sizing-content min-w-25 max-w-100 text-h2 font-semibold h-6 border-b border-transparent focus:border-grey-primary outline-none",
      ...props
    }
  );
});
function PanelContent({ children, className }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("relative min-h-screen p-lg flex flex-col grow", className), children });
}
function PanelFooter({ children, className }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(StickyComponent, { inFlow: "after", sentinelClassName: "top-lg -translate-y-2xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: cn(
        "sticky flex justify-end gap-sm bottom-0 bg-surface-card -m-lg mt-auto p-lg border-t border-transparent sentinel-intersect:border-grey-border sentinel-intersect:shadow-sticky-bottom",
        className
      ),
      children
    }
  ) });
}
const PanelFooterButton = reactExports.forwardRef(function PanelFooterButton2({
  variant,
  isCloseButton,
  isLoading,
  leadingIcon,
  trailingIcon,
  disabled,
  label,
  children,
  className,
  onClick,
  ...props
}, ref) {
  const sharp = PanelSharpFactory.useSharp();
  const { variant: buttonVariant, appearance } = M(variant).with("secondary", () => ({
    variant: "secondary",
    appearance: "stroked"
  })).with("destructive", () => ({
    variant: "destructive",
    appearance: "filled"
  })).with("primary-outline", () => ({
    variant: "primary",
    appearance: "stroked"
  })).otherwise(() => ({
    variant: isCloseButton ? variant ?? "secondary" : "primary",
    appearance: isCloseButton && variant !== "primary" ? "stroked" : "filled"
  }));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Button,
    {
      ref,
      variant: buttonVariant,
      appearance,
      disabled: disabled || isLoading,
      "aria-busy": isLoading || void 0,
      "aria-disabled": disabled || isLoading || void 0,
      size: "medium",
      className: cn(isLoading && "pointer-events-none", className),
      onClick: (event) => {
        onClick?.(event);
        if (!event.defaultPrevented && isCloseButton) {
          sharp.actions.close();
        }
      },
      ...props,
      children: [
        leadingIcon ? isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "spinner", className: "size-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: leadingIcon, className: "size-4" }) : null,
        label,
        children,
        trailingIcon ? isLoading && !leadingIcon ? /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "spinner", className: "size-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: trailingIcon, className: "size-4" }) : null,
        isLoading && !leadingIcon && !trailingIcon ? /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "spinner", className: "size-4 animate-spin" }) : null
      ]
    }
  );
});
PanelFooterButton.displayName = "PanelFooterButton";
const Panel = {
  Root: PanelRoot,
  Trigger: PanelTrigger,
  Container: PanelContainer,
  Content: PanelContent,
  Header: PanelHeader,
  HeaderInput: PanelHeaderInput,
  Footer: PanelFooter,
  FooterButton: PanelFooterButton
};
export {
  Panel as P,
  PanelSharpFactory as a
};
