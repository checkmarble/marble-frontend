import { t as t$1 } from "./services-middleware-DR8Hua1Y.js";
import { r as reactExports, R as jsxRuntimeExports } from "../server.js";
import { u as useTranslation, B as Button, e as Icon, C as CtaV2ClassName, e9 as Popover, b as clsx } from "./format-NPGUXq-g.js";
import { o as filtersI18n, L as Link } from "./router-vb7i5euz.js";
import { R as Root2, T as Trigger, P as Portal2, C as Content2, I as Item2 } from "./index-BAiW6m4Z.js";
function e(e2) {
  if (typeof e2 != `object` || !e2) return false;
  let t2 = Object.getPrototypeOf(e2);
  return t2 === null || t2 === Object.prototype;
}
function t(...t2) {
  return t$1(n, t2);
}
const n = (e2, t2) => {
  let n2 = [[], []];
  for (let [r, i] of e2.entries()) t2(i, r, e2) ? n2[0].push(i) : n2[1].push(i);
  return n2;
};
const AddNewFilterButton = reactExports.forwardRef(
  function AddNewFilterButton2(props, ref) {
    const { t: t2 } = useTranslation(filtersI18n);
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", ref, ...props, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "plus", className: "size-5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "line-clamp-1 capitalize", children: t2("filters:new_filter") })
    ] });
  }
);
const ClearAllFiltersLink = reactExports.forwardRef(
  function ClearAllFiltersButton2(props, ref) {
    const { t: t2 } = useTranslation(filtersI18n);
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Link,
      {
        "data-test": "clear-all-filters-link",
        className: CtaV2ClassName({ variant: "secondary", color: "grey", className: "shrink-0" }),
        ref,
        ...props,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "cross", className: "size-5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "line-clamp-1", children: t2("filters:clear_filters") })
        ]
      }
    );
  }
);
const ClearAllFiltersButton = reactExports.forwardRef(function ClearAllFiltersButton3(props, ref) {
  const { t: t2 } = useTranslation(filtersI18n);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      className: CtaV2ClassName({ variant: "secondary", color: "grey", className: "shrink-0" }),
      ref,
      ...props,
      type: "button",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "cross", className: "size-5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "line-clamp-1", children: t2("filters:clear_filters") })
      ]
    }
  );
});
const FilterPopoverContent = reactExports.forwardRef(
  function FilterPopoverContent2({ className, children, ...props }, ref) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Popover.Content,
      {
        ref,
        side: "bottom",
        align: "start",
        sideOffset: 8,
        collisionPadding: 10,
        className: clsx("animate-slideUpAndFade p-0 text-xs shadow-md", className),
        ...props,
        children
      }
    );
  }
);
const FilterPopover = {
  Root: Popover.Root,
  Trigger: Popover.Trigger,
  Content: FilterPopoverContent
};
const FilterItemRoot = reactExports.forwardRef(function FilterItem2({ className, ...props }, ref) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      ref,
      className: clsx(
        "bg-purple-background-light dark:bg-grey-background-light flex h-10 flex-row items-center rounded-sm",
        className
      ),
      ...props
    }
  );
});
const FilterItemTrigger = reactExports.forwardRef(
  function FilterItem3({ className, ...props }, ref) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      FilterPopover.Trigger,
      {
        ref,
        className: clsx(
          "text-purple-primary dark:text-grey-primary focus:border-purple-primary dark:focus:border-purple-hover -me-xs flex h-full flex-row items-center gap-xs rounded-sm border border-solid border-transparent px-xs outline-hidden",
          className
        ),
        ...props
      }
    );
  }
);
const FilterItemClear = reactExports.forwardRef(function FilterItem4({ className, ...props }, ref) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      ref,
      "data-test": "filter-item-clear",
      className: clsx(
        "focus:border-purple-primary dark:focus:border-purple-hover -ms-xs h-full rounded-sm border border-solid border-transparent px-xs outline-hidden",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "cross", className: "text-purple-primary dark:text-grey-primary size-5 shrink-0" })
    }
  );
});
const FilterItem = {
  Root: FilterItemRoot,
  Trigger: FilterItemTrigger,
  Clear: FilterItemClear
};
const FiltersDropdownMenuContent = reactExports.forwardRef(
  function FiltersDropdownMenuContent2({ className, children, ...props }, ref) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Portal2, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Content2,
      {
        ref,
        className: clsx(
          "animate-slide-up-and-fade bg-surface-card border-grey-border rounded-sm border shadow-md will-change-[transform,opacity]",
          className
        ),
        side: "bottom",
        align: "end",
        sideOffset: 8,
        ...props,
        children
      }
    ) });
  }
);
const FiltersDropdownMenuItem = reactExports.forwardRef(
  function FiltersDropdownMenuItem2({ className, ...props }, ref) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Item2,
      {
        ref,
        className: clsx(
          "radix-highlighted:bg-purple-background-light flex flex-row gap-sm rounded-sm p-sm outline-hidden transition-colors",
          className
        ),
        ...props
      }
    );
  }
);
const FiltersDropdownMenu = {
  Root: Root2,
  Trigger,
  Content: FiltersDropdownMenuContent,
  Item: FiltersDropdownMenuItem
};
export {
  AddNewFilterButton as A,
  ClearAllFiltersLink as C,
  FiltersDropdownMenu as F,
  FilterPopover as a,
  FilterItem as b,
  ClearAllFiltersButton as c,
  e,
  t
};
