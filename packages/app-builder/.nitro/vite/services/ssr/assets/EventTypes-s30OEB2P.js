import { R as jsxRuntimeExports, r as reactExports } from "../server.js";
import { w as matchSorter, H as Highlight } from "./router-vb7i5euz.js";
import { aK as eventTypes } from "./services-middleware-DR8Hua1Y.js";
import { dD as Tooltip, b as clsx, u as useTranslation, eo as SelectWithCombobox, e1 as Input } from "./format-NPGUXq-g.js";
function SelectEvents({
  selectedEventTypes,
  className,
  webhookStatus,
  name,
  onChange,
  onBlur,
  disabled
}) {
  const { t } = useTranslation(["settings"]);
  const [searchValue, setSearchValue] = reactExports.useState("");
  const deferredSearchValue = reactExports.useDeferredValue(searchValue);
  const matches = reactExports.useMemo(() => matchSorter(eventTypes, deferredSearchValue), [deferredSearchValue]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    SelectWithCombobox.Root,
    {
      selectedValue: selectedEventTypes,
      searchValue,
      onSearchValueChange: setSearchValue,
      onSelectedValueChange: onChange,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectWithCombobox.Select, { name, disabled, onBlur, className, children: [
          selectedEventTypes.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EventTypes, { eventTypes: selectedEventTypes }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-disabled text-s", children: t("settings:webhooks.event_types.placeholder") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectWithCombobox.Arrow, {})
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectWithCombobox.Popover, { className: "z-50 flex flex-col gap-sm p-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectWithCombobox.Combobox, { render: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "shrink-0" }), autoSelect: true, autoFocus: true }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectWithCombobox.ComboboxList, { children: [
            matches.map((event) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              SelectWithCombobox.ComboboxItem,
              {
                value: event,
                disabled: webhookStatus === "restricted" && !event.includes("decision."),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(EventType, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Highlight, { text: event, query: deferredSearchValue }) })
              },
              event
            )),
            matches.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-grey-secondary flex items-center justify-center p-sm", children: t("settings:webhooks.event_types.empty_matches") }) : null
          ] })
        ] })
      ]
    }
  );
}
function EventTypes({ className, eventTypes: eventTypes2 }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Tooltip.Default,
    {
      content: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex max-w-sm flex-wrap gap-xs", children: eventTypes2.map((event) => /* @__PURE__ */ jsxRuntimeExports.jsx(EventType, { children: event }, event)) }),
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: clsx("flex w-fit flex-wrap items-center gap-xs", className), children: [
        eventTypes2.slice(0, 3).map((event) => /* @__PURE__ */ jsxRuntimeExports.jsx(EventType, { children: event }, event)),
        eventTypes2.length > 3 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-grey-primary bg-grey-background flex h-6 items-center rounded-full px-xs text-xs font-normal", children: `+${eventTypes2.length - 3}` }) : null
      ] })
    }
  );
}
function EventType({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-grey-background flex h-6 items-center rounded-sm px-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-primary line-clamp-1 text-xs font-normal", children }) });
}
export {
  EventTypes as E,
  SelectEvents as S
};
