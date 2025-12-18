import { R as jsxRuntimeExports, r as reactExports, a0 as getDefaultExportFromCjs } from "../server.js";
import { aj as Route, b as useNavigate, P as Page } from "./router-vb7i5euz.js";
import { f6 as useI18n, e9 as Popover, B as Button, d as cn, e as Icon, f7 as useFiltersBarContext, dD as Tooltip, eg as Checkbox, f8 as useFormatting, f9 as formatDistanceStrict, fa as DateRangeFilter, e8 as MenuCommand, e1 as Input, fb as FiltersBarContext, f as cva, u as useTranslation, T as Typo, e4 as Modal, q as useFormatLanguage, fc as getYear, s as Trans, fd as getWeek, k as TooltipV2, dA as formatNumber, en as useTable, em as getCoreRowModel, ek as Table, el as createColumnHelper, fe as formatPercentage, ff as FormattingProvider, ea as formatDuration, w as formatDateTimeWithoutPresets } from "./format-NPGUXq-g.js";
import { t } from "./isDeepEqual-C0XXZLYo.js";
import { ak as enUS, d2 as ar, b2 as fr, T as Temporal, aC as add, M, bv as differenceInDays, d3 as analyticsFiltersQuery, u as t$1, o as t$2 } from "./services-middleware-DR8Hua1Y.js";
import { P as Panel } from "./Panel-kj8Z2GDk.js";
import { c as getCustomFiltersConfigFn, X as Xe, l as linear, Y, j as j$1, V, h as hn$1, q as q$1, W as W$1, d as getAvailableFiltersFn, e as getDecisionOutcomesPerDayFn, f as getDecisionsScoreDistributionFn, i as getRuleHitTableFn, k as getRuleVsDecisionOutcomeFn, m as getScreeningHitsTableFn } from "./nivo-bar-A7O08vfo.js";
import { u as useQuery } from "./useQuery-B7mL_evE.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
import { u as useCreateFilterMutation, a as useDeleteFilterMutation } from "./delete-filter-C4u-CT-i.js";
import { c as createEmptyDraftRow, a as buildDraftRowsFromExisting, h as hasIncompleteActiveRow, d as hasDraftChanges, e as canAddFilterRow, n as needsDeleteConfirmation, i as isActiveRow, f as isRowComplete, j as getSelectionKey, k as diffFilterChanges, l as getFieldSelectionLabel } from "./custom-filters-DeyaL8MH.js";
import { y as useQueryClient, B as keepPreviousData } from "./QueryClientProvider-DYTpkCko.js";
import { z as zt } from "./CopyToClipboardButton-CJNJJful.js";
import { d as downloadFile } from "./download-file-C533i5xX.js";
import { S as Spinner } from "./Spinner-GK6cEAdR.js";
import { k as array, a as constant, U as U$1, bm as requireToString, bn as un, N as kn, B as yn, I as z, F as Fr, $ as $r, C as cn$1, R as Rt, bj as Pt, J as E$1, E as Mn, bo as V$1, M as M$1, bp as E$2, bq as w$1, T as T$1, G as hn, H as hr, Y as Ye, br as pn, bs as Ct, bt as Et, bh as It, o as animated, D as Dr, aV as useSpring, L as L$1, bl as wn, K as Rn } from "./nivo-legends-6l5H9E2i.js";
import { w as withPath, x as x$1, y as y$1, P as P$1 } from "./line-BbnWu1FG.js";
import { U as UpsellCard } from "./UpsellCard-TgF0jFAp.js";
import { D as DetectionNavigationTabs } from "./Tabs-CwLwDEXt.js";
import { b as fromUUIDtoSUUID } from "./short-uuid-MIi3jWzx.js";
import { n } from "./unique-CBeBxAXx.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
import "./security-headers.server-BdP3HrPp.js";
import "./ThemeContext-B40HQxfH.js";
import "./config-ut8rAdyo.js";
import "./createSsrRpc-ZXUHv2Er.js";
import "./i18n-instance-store-UssbGYOM.js";
import "./auth-middleware-C4ap47rJ.js";
import "./inboxes-D556s0BB.js";
import "./files-fO9wUXBf.js";
import "./case-detail-middleware-C3JS8Yme.js";
import "./input-validation-CU_reV2S.js";
import "./async-C3pYACua.js";
import "./decisions-B-2DmJW1.js";
import "./scenarios-8U74nJp4.js";
import "./sharpstate.es-CeF1Mf5b.js";
import "./isNullish-B8pc8Ntu.js";
import "./use-callback-ref-DXzIzfqy.js";
import "node:crypto";
import "./useBaseQuery-CMboOtTR.js";
import "./settings-CEpHMlp5.js";
import "./settings-CPv2zx4k.js";
import "./useMutation-C5oG90Zs.js";
const filterPopoverContentProps = {
  side: "bottom",
  align: "start",
  sideOffset: 8,
  collisionPadding: 10,
  className: "animate-slideUpAndFade p-0 shadow-md"
};
function FilterTrigger({
  children,
  className,
  id,
  onClear
}) {
  const { t: t2 } = useI18n();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: cn(
        "inline-flex items-center rounded-sm",
        "focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-purple-primary"
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Popover.Trigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { appearance: "filter", size: "large", className: cn("focus-visible:outline-none", className), id, children }) }),
        onClear ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            appearance: "filter",
            mode: "icon",
            size: "large",
            className: "-ms-xs focus-visible:outline-none",
            onClick: onClear,
            "aria-label": t2("filters:ds.clear_button.label"),
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "cross", className: "text-purple-primary size-5 shrink-0" })
          }
        ) : null
      ]
    }
  );
}
function BooleanValueFilter({
  filter,
  level,
  buttonState
}) {
  const committed = level === "additional" ? filter.selectedValue : filter.selectedValue;
  const label = committed ? String(committed) : filter.placeholder;
  const [isOpen, setOpen] = reactExports.useState(false);
  const [localChecked, setLocalChecked] = reactExports.useState(
    filter.selectedValue === null ? "indeterminate" : Boolean(filter.selectedValue)
  );
  const { emitSet, emitRemove } = useFiltersBarContext();
  const { t: t2 } = useI18n();
  reactExports.useEffect(() => {
    if (isOpen) {
      setLocalChecked(filter.selectedValue === null ? "indeterminate" : Boolean(filter.selectedValue));
    }
  }, [isOpen]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover.Root, { open: isOpen, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      FilterTrigger,
      {
        className: buttonState,
        onClear: filter.removable ? () => {
          setLocalChecked("indeterminate");
          emitRemove(filter.name);
          setOpen(false);
        } : void 0,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: buttonState, children: label }),
          filter.unavailable ? /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip.Default, { content: t2("filters:unavailable_filter_tooltip"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "error", className: "text-red-base size-4" }) }) : null
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Popover.Content, { ...filterPopoverContentProps, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-md flex flex-col gap-md w-64", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: localChecked, onCheckedChange: (checked) => setLocalChecked(checked) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Checked" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: cn("text-s bg-purple-primary text-white rounded-sm px-md py-xs outline-hidden"),
          onClick: () => {
            if (localChecked === "indeterminate") {
              emitSet(filter.name, null);
            } else {
              emitSet(filter.name, localChecked);
            }
            setOpen(false);
          },
          children: "Done"
        }
      ) })
    ] }) })
  ] });
}
function DateRangeFilterPopover({ filter }) {
  const { t: t2 } = useI18n();
  const drFilter = filter;
  const { language, formatDateTimeWithoutPresets: formatDateTimeWithoutPresets2 } = useFormatting();
  const { emitSet, emitRemove } = useFiltersBarContext();
  const dateFnsLocale = reactExports.useMemo(() => {
    switch (language) {
      case "fr":
        return fr;
      case "ar":
        return ar;
      default:
        return enUS;
    }
  }, [language]);
  const presetDurations = reactExports.useMemo(
    () => /* @__PURE__ */ new Map([
      [Temporal.Duration.from({ days: -7 }).toString(), t2("filters:date_range_filter.preset.last_7_days")],
      [Temporal.Duration.from({ days: -14 }).toString(), t2("filters:date_range_filter.preset.last_14_days")],
      [Temporal.Duration.from({ days: -30 }).toString(), t2("filters:date_range_filter.preset.last_30_days")],
      [Temporal.Duration.from({ months: -3 }).toString(), t2("filters:date_range_filter.preset.last_3_months")],
      [Temporal.Duration.from({ months: -6 }).toString(), t2("filters:date_range_filter.preset.last_6_months")],
      [Temporal.Duration.from({ months: -12 }).toString(), t2("filters:date_range_filter.preset.last_12_months")]
    ]),
    [t2]
  );
  const summary = (() => {
    if (drFilter.selectedValue?.type === "dynamic") {
      const presetDuration = presetDurations.get(drFilter.selectedValue.fromNow);
      if (presetDuration) return presetDuration;
      const date = /* @__PURE__ */ new Date();
      const duration = Temporal.Duration.from(drFilter.selectedValue.fromNow);
      return formatDistanceStrict(add(date, duration), date, {
        addSuffix: true,
        locale: dateFnsLocale
      });
    }
    const from = drFilter.selectedValue?.type === "static" ? drFilter.selectedValue.startDate : void 0;
    const to = drFilter.selectedValue?.type === "static" ? drFilter.selectedValue.endDate : void 0;
    if (!from && !to) return drFilter.placeholder;
    const fmt = (d) => d ? formatDateTimeWithoutPresets2(d, { language, dateStyle: "short" }) : "--/--/----";
    return from && to ? `${fmt(new Date(from))} → ${fmt(new Date(to))}` : drFilter.placeholder;
  })();
  const defaultDynamicFromNow = "-P7D";
  const [localDateRangeFilter, setLocalDateRangeFilter] = reactExports.useState(
    filter.selectedValue ?? { type: "dynamic", fromNow: defaultDynamicFromNow }
  );
  const [isOpen, setIsOpen] = reactExports.useState(false);
  const buttonState = cn("font-semibold", drFilter.selectedValue ? "text-purple-primary" : "text-grey-secondary");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Popover.Root,
    {
      open: isOpen,
      onOpenChange: (open) => {
        setIsOpen(open);
        if (!open) {
          emitSet(drFilter.name, localDateRangeFilter);
        }
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          FilterTrigger,
          {
            className: buttonState,
            onClear: drFilter.removable ? () => {
              emitRemove(drFilter.name);
              setIsOpen(false);
            } : void 0,
            children: summary
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Popover.Content, { ...filterPopoverContentProps, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          DateRangeFilter.Root,
          {
            dateRangeFilter: localDateRangeFilter,
            setDateRangeFilter: (value) => setLocalDateRangeFilter(value),
            locale: dateFnsLocale,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col md:flex-row gap-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  DateRangeFilter.FromNowPicker,
                  {
                    presetDurations,
                    title: "Quick ranges",
                    className: "border-e-1 border-grey-border pe-md"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(DateRangeFilter.Calendar, { locale: dateFnsLocale })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                DateRangeFilter.Summary,
                {
                  className: "border-t-1 border-grey-border pt-sm mt-0",
                  presetDurations
                }
              )
            ]
          }
        ) })
      ]
    }
  );
}
function NumberValueFilter({ filter, buttonState }) {
  const [isOpen, setOpen] = reactExports.useState(false);
  const { t: t2 } = useI18n();
  const [opSelectIsOpen, setOpSelectIsOpen] = reactExports.useState(false);
  const [localValue, setLocalValue] = reactExports.useState(
    (() => {
      const selectedValue = filter.selectedValue ?? { op: "=", value: 0 };
      const raw = selectedValue.value;
      const num = Array.isArray(raw) ? Number(raw[0]) : Number(raw);
      return { op: selectedValue.op ?? "=", value: Number.isNaN(num) ? 0 : num };
    })()
  );
  const [inputValue, setInputValue] = reactExports.useState(localValue.value === 0 ? "" : String(localValue.value));
  const { emitSet, emitRemove } = useFiltersBarContext();
  reactExports.useEffect(() => {
    if (isOpen) {
      const selectedValue = filter.selectedValue ?? { op: "=", value: 0 };
      const raw = selectedValue.value;
      const num = Array.isArray(raw) ? Number(raw[0]) : Number(raw);
      const newValue = Number.isNaN(num) ? 0 : num;
      setLocalValue({
        op: selectedValue.op ?? "=",
        value: newValue
      });
      setInputValue(newValue === 0 ? "" : String(newValue));
    }
  }, [isOpen, filter.selectedValue]);
  const onOperatorChange = (operator) => {
    if (!NUMBER_OPERATORS.has(operator)) throw new Error(`Invalid operator: ${operator}`);
    setLocalValue({ op: operator, value: localValue.value });
    setOpSelectIsOpen(false);
  };
  const validate = () => {
    const trimmed = inputValue.trim();
    const numberValue = trimmed === "" ? NaN : Number(trimmed);
    const payload = Number.isNaN(numberValue) ? null : { op: localValue.op, value: numberValue };
    emitSet(filter.name, payload);
    setOpen(false);
  };
  const clear = () => {
    emitRemove(filter.name);
    setLocalValue({ op: "=", value: 0 });
    setInputValue("");
    setOpen(false);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover.Root, { open: isOpen, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      FilterTrigger,
      {
        id: filter.name,
        className: buttonState,
        onClear: filter.removable ? () => {
          emitRemove(filter.name);
          setOpen(false);
        } : void 0,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: buttonState, children: filter.name }),
          " ",
          (() => {
            if (!filter.selectedValue) return null;
            const op = filter.selectedValue?.op ?? localValue.op;
            const raw = filter.selectedValue?.value ?? localValue.value;
            const val = Array.isArray(raw) ? Number(raw[0]) : Number(raw);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: buttonState, children: [
              op,
              " ",
              val
            ] });
          })(),
          filter.unavailable ? /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip.Default, { content: t2("filters:unavailable_filter_tooltip"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "error", className: "text-red-base size-4" }) }) : null
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Popover.Content, { ...filterPopoverContentProps, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-md flex flex-col gap-md w-80", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Menu, { open: opSelectIsOpen, onOpenChange: setOpSelectIsOpen, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Trigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.SelectButton, { className: "w-s", children: localValue.op }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Content, { sameWidth: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.List, { children: Array.from(NUMBER_OPERATORS).map((op) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            MenuCommand.Item,
            {
              value: op,
              selected: localValue.op === op,
              onSelect: () => onOperatorChange(op),
              children: op
            },
            op
          )) }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "number",
            placeholder: filter.placeholder,
            value: inputValue,
            onChange: (e) => {
              const stringValue = e.currentTarget.value;
              setInputValue(stringValue);
              const numValue = Number(stringValue);
              setLocalValue({
                op: localValue.op,
                value: stringValue === "" || Number.isNaN(numValue) ? 0 : numValue
              });
            },
            onKeyDown: (e) => {
              if (e.key === "Enter") {
                validate();
              }
            }
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", size: "medium", onClick: clear, children: t2("filters:ds.clear_button.label") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "medium", onClick: validate, children: t2("filters:ds.apply_button.label") })
      ] })
    ] }) })
  ] });
}
function SelectOptionFilter({ options, placeholder, selectedValue, name }) {
  const { t: t2 } = useI18n();
  const { emitSet } = useFiltersBarContext();
  const [internalSelectedValue, setInternalSelectedValue] = reactExports.useState(selectedValue || "");
  const [open, setOpen] = reactExports.useState(false);
  reactExports.useEffect(() => {
    setInternalSelectedValue(selectedValue || "");
  }, [selectedValue]);
  const hasOptions = options?.length ?? false;
  const handleSelect = (value) => {
    if (value === internalSelectedValue) {
      setOpen(false);
      return;
    }
    setInternalSelectedValue(value);
    emitSet(name, value, { reconcileDynamicFilters: true });
    setOpen(false);
  };
  const getOptionLabel = (option) => {
    return typeof option === "string" ? option : option.label;
  };
  const getOptionValue = (option) => {
    return typeof option === "string" ? option : option.value;
  };
  const getSelectedLabel = () => {
    if (!internalSelectedValue) return placeholder || "Select";
    const selectedOption = options?.find(
      (option) => getOptionValue(option) === internalSelectedValue
    );
    return selectedOption ? getOptionLabel(selectedOption) : internalSelectedValue;
  };
  const maxOptionLabelLength = Math.max(...options?.map((option) => getOptionLabel(option).length) ?? [0]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Menu, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Trigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Button,
      {
        variant: "primary",
        mode: "normal",
        size: "medium",
        className: "justify-between w-full",
        style: { width: `${maxOptionLabelLength + 3}ch` },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm truncate flex items-center gap-xs", children: [
            getSelectedLabel(),
            selectedValue?.unavailable ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              Tooltip.Default,
              {
                content: t2("filters:unavailable_filter_tooltip", {
                  defaultValue: "May not be available for selected range"
                }),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "warning", className: "text-warning-60 size-4" })
              }
            ) : null
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Arrow, {})
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Content, { sameWidth: true, align: "start", sideOffset: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.List, { children: hasOptions ? options?.map((option) => {
      const value = getOptionValue(option);
      const label = getOptionLabel(option);
      return /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Item, { value, onSelect: () => handleSelect(value), children: label }, value);
    }) : /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Empty, { children: t2("filters:ds.noOptionsAvailable.label") }) }) })
  ] }) });
}
function TextMatchFilter({ filter, buttonState }) {
  const [isOpen, setOpen] = reactExports.useState(false);
  const [localText, setLocalText] = reactExports.useState(filter.selectedValue?.value?.join(",") ?? "");
  const { emitSet, emitRemove } = useFiltersBarContext();
  const { t: t2 } = useI18n();
  reactExports.useEffect(() => {
    setLocalText(filter.selectedValue?.value?.join(",") ?? "");
    if (!filter.selectedValue?.value?.length) setOpen(true);
  }, [filter.selectedValue]);
  const validate = () => {
    const value = localText.split(",").map((v) => v.trim()).filter((v) => v.length > 0);
    if (value.length === 0) {
      emitRemove(filter.name);
      setOpen(false);
      return;
    }
    const committed = { op: filter.op, value };
    emitSet(filter.name, committed);
    setOpen(false);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover.Root, { open: isOpen, onOpenChange: validate, modal: true, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      FilterTrigger,
      {
        id: filter.name,
        className: buttonState,
        onClear: filter.removable ? () => {
          emitRemove(filter.name);
          setOpen(false);
        } : void 0,
        children: [
          filter.selectedValue?.value && filter.selectedValue.value.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("font-medium", buttonState), children: t2("filters:ds.text_match_filter.selected_values", {
            values: filter.selectedValue.value.join(", "),
            label: filter.name
          }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: buttonState, children: filter.name }),
          filter.unavailable ? /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip.Default, { content: t2("filters:unavailable_filter_tooltip"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "error", className: "text-red-base size-4" }) }) : null
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Popover.Content, { ...filterPopoverContentProps, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-md flex flex-col gap-sm w-80", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "bg-purple-background-light text-s text-purple-primary flex flex-row gap-sm rounded-lg p-md font-normal items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "tip", className: "size-4 shrink-0" }),
        t2("filters:ds.text_match_filter.description")
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          placeholder: filter.placeholder,
          value: localText,
          onChange: (e) => setLocalText(e.currentTarget.value),
          onKeyDown: (e) => {
            if (e.key === "Enter") {
              validate();
            }
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "secondary",
            size: "medium",
            onClick: () => {
              setLocalText("");
              emitRemove(filter.name);
              setOpen(false);
            },
            children: t2("filters:ds.clear_button.label")
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "medium", onClick: validate, children: t2("filters:ds.apply_button.label") })
      ] })
    ] }) })
  ] });
}
const NUMBER_OPERATORS = /* @__PURE__ */ new Set(["=", "!=", ">", ">=", "<", "<=", "in"]);
function FiltersBar({ descriptors = [], dynamicDescriptors = [], value, onChange, onUpdate }) {
  const { t: t$12 } = useI18n();
  const [draftValue, setDraftValue] = reactExports.useState(value);
  reactExports.useEffect(() => {
    setDraftValue(value);
  }, [value]);
  const getFilter = (d, value2, opts) => {
    const selectedValue = (() => {
      switch (d.type) {
        case "number": {
          const sv = value2 ?? null;
          if (sv && typeof sv === "object" && "op" in sv && "value" in sv) {
            const raw = sv.value;
            if (Array.isArray(raw)) {
              if (raw.length === 0) return null;
              const num2 = Number(raw[0]);
              if (Number.isNaN(num2)) return null;
              return {
                op: sv.op ?? d.op,
                value: num2
              };
            }
            const num = Number(raw);
            if (Number.isNaN(num)) return null;
            return {
              op: sv.op ?? d.op,
              value: num
            };
          }
          return sv;
        }
        case "text": {
          const sv = value2 ?? null;
          if (!sv || typeof sv !== "object" || !("op" in sv) || !("value" in sv)) return null;
          const op = sv.op ?? d.op;
          const v = sv.value;
          const arr = Array.isArray(v) ? v : [v];
          const filtered = arr.filter((val) => val != null && String(val).length > 0);
          return filtered.length > 0 ? { op, value: filtered } : null;
        }
        case "date-range-popover":
          return value2 ?? null;
        default:
          return value2?.value ?? value2 ?? null;
      }
    })();
    const commonProps = {
      name: d.name,
      placeholder: d.placeholder,
      removable: opts.removable ?? d.removable ?? false,
      isActive: opts.isActive ?? selectedValue ?? false,
      unavailable: d.unavailable ?? false
    };
    switch (d.type) {
      case "text":
        return {
          ...commonProps,
          type: "text",
          selectedValue: selectedValue ?? null,
          op: d.op
        };
      case "number":
        return {
          ...commonProps,
          type: "number",
          selectedValue: selectedValue ?? null,
          op: d.op
        };
      case "boolean":
        return {
          ...commonProps,
          type: "boolean",
          selectedValue: selectedValue ?? null
        };
      case "checkbox":
        return {
          ...commonProps,
          type: "checkbox",
          selectedValue: selectedValue ?? null
        };
      case "select":
        return {
          ...commonProps,
          type: "select",
          selectedValue: selectedValue ?? null,
          options: d.options
        };
      case "multi-select":
        return {
          ...commonProps,
          type: "multi-select",
          selectedValue: selectedValue ?? null,
          options: d.options
        };
      case "date-range-popover":
        return {
          ...commonProps,
          type: "date-range-popover",
          selectedValue: selectedValue ?? null
        };
      case "radio":
        return {
          ...commonProps,
          type: "radio",
          selectedValue: selectedValue ?? null,
          options: d.options
        };
      default:
        return void 0;
    }
  };
  const mainFilters = reactExports.useMemo(
    () => descriptors.map((d) => getFilter(d, draftValue[d.name], {})),
    [descriptors, draftValue]
  );
  const additionalFilters = reactExports.useMemo(
    () => dynamicDescriptors.map((d) => getFilter(d, draftValue[d.name], { removable: true })),
    [dynamicDescriptors, draftValue]
  );
  const previousDynamicFilterNamesRef = reactExports.useRef(/* @__PURE__ */ new Set());
  reactExports.useEffect(() => {
    const currentDynamicFilterNames = new Set(dynamicDescriptors.map((d) => d.name));
    const removedFilterNames = [...previousDynamicFilterNamesRef.current].filter(
      (name) => !currentDynamicFilterNames.has(name)
    );
    if (removedFilterNames.length > 0) {
      setDraftValue((prev) => {
        const next = { ...prev };
        for (const name of removedFilterNames) delete next[name];
        return next;
      });
    }
    previousDynamicFilterNamesRef.current = currentDynamicFilterNames;
  }, [dynamicDescriptors]);
  const filtersByPriority = reactExports.useMemo(
    () => [
      mainFilters.map((filter) => ({ ...filter, priority: "main" })),
      additionalFilters.length > 0 ? additionalFilters.map((filter) => ({ ...filter, priority: "additional" })) : []
    ],
    [mainFilters, additionalFilters]
  );
  const allDescriptors = reactExports.useMemo(() => [...descriptors, ...dynamicDescriptors], [descriptors, dynamicDescriptors]);
  const contextValue = reactExports.useMemo(() => {
    const emitSet = (name, newValue, options) => {
      setDraftValue((prev) => ({ ...prev, [name]: newValue }));
      if (allDescriptors.find((d) => d.name === name)?.instantUpdate && onChange) {
        const nextValue = { ...draftValue, [name]: newValue };
        onChange(
          { type: "set", name, value: newValue, reconcileDynamicFilters: options?.reconcileDynamicFilters },
          { value: nextValue }
        );
      }
    };
    const emitRemove = (name) => {
      setDraftValue((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
      if (onChange) {
        const nextValue = { ...draftValue };
        delete nextValue[name];
        onChange({ type: "remove", name }, { value: nextValue });
      }
    };
    const emitUpdate = () => {
      if (onUpdate) return onUpdate({ value: draftValue });
    };
    const getValue = (name) => draftValue[name];
    return { emitSet, emitRemove, emitUpdate, getValue };
  }, [draftValue, onUpdate, onChange, descriptors, dynamicDescriptors]);
  const buttonState = cva("font-semibold", {
    variants: {
      state: {
        enabled: " text-purple-primary",
        disabled: "text-grey-secondary"
      }
    },
    defaultVariants: {
      state: "disabled"
    }
  });
  const hasChanges = reactExports.useMemo(() => !t(value, draftValue), [value, draftValue]);
  const hasAnyDynamicSelected = reactExports.useMemo(() => {
    const isSelected = (f) => {
      switch (f.type) {
        case "text": {
          const sv = f.selectedValue;
          return sv != null && Array.isArray(sv.value) && sv.value.length > 0;
        }
        case "number":
          return f.selectedValue != null;
        case "boolean":
        case "checkbox":
          return f.selectedValue !== null && f.selectedValue !== void 0;
        case "select":
        case "radio":
          return f.selectedValue != null && String(f.selectedValue).length > 0;
        case "multi-select":
          return Array.isArray(f.selectedValue) && f.selectedValue.length > 0;
        case "date-range-popover":
          return f.selectedValue != null;
        default:
          return false;
      }
    };
    return additionalFilters.some(isSelected);
  }, [additionalFilters]);
  const clearDynamicFilters = () => {
    setDraftValue((prev) => {
      const next = { ...prev };
      for (const d of dynamicDescriptors) delete next[d.name];
      return next;
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(FiltersBarContext.Provider, { value: contextValue, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-row gap-md w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-md", children: filtersByPriority.map((filters, priorityIndex) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row items-center w-full gap-xl h-xl", children: [
    priorityIndex === 1 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        className: "min-w-[110px] justify-center",
        variant: "primary",
        size: "medium",
        onClick: () => contextValue.emitUpdate(),
        disabled: !hasChanges,
        children: hasChanges ? t$12("filters:ds.reapply_button.label") : t$12("filters:ds.apply_button.label")
      }
    ) : null,
    filters.map(
      (filter) => M(filter).with({ type: "text" }, (textFilter) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        TextMatchFilter,
        {
          filter: textFilter,
          buttonState: buttonState({
            state: !textFilter.unavailable && textFilter.selectedValue?.value && textFilter.selectedValue.value.length > 0 ? "enabled" : "disabled"
          })
        },
        filter.name
      )).with({ type: "checkbox" }, () => /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, {}, filter.name)).with({ type: "number" }, (numberFilter) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        NumberValueFilter,
        {
          filter: numberFilter,
          buttonState: buttonState({
            state: numberFilter.selectedValue ? "enabled" : "disabled"
          })
        },
        filter.name
      )).with({ type: "boolean" }, (booleanFilter) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        BooleanValueFilter,
        {
          filter: booleanFilter,
          level: filter.priority,
          buttonState: buttonState({
            state: booleanFilter.selectedValue ? "enabled" : "disabled"
          })
        },
        filter.name
      )).with({ type: "select" }, (selectFilter) => /* @__PURE__ */ reactExports.createElement(SelectOptionFilter, { ...selectFilter, key: filter.name })).with({ type: "date-range-popover" }, (dateRangePopoverFilter) => /* @__PURE__ */ jsxRuntimeExports.jsx(DateRangeFilterPopover, { filter: dateRangePopoverFilter }, filter.name)).with({ type: "radio" }, () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Radio filter not implemented yet" }, filter.name)).with({ type: "multi-select" }, () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Multi-select filter not implemented yet" }, filter.name)).otherwise(() => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Filter not implemented yet" }, filter.name))
    ),
    priorityIndex === 1 && dynamicDescriptors.length ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        variant: "secondary",
        size: "medium",
        onClick: clearDynamicFilters,
        disabled: !hasAnyDynamicSelected,
        children: t$12("filters:ds.clear_dynamic_button.label")
      }
    ) : null
  ] }, priorityIndex)) }) }) });
}
const useResizeObserver = (options = {}) => {
  const {
    throttleMs = 16,
    // ~60fps
    observeHeight = true,
    initialDimensions = { width: 0, height: 0 }
  } = options;
  const elementRef = reactExports.useRef(null);
  const [dimensions, setDimensions] = reactExports.useState(initialDimensions);
  const animationFrameIdRef = reactExports.useRef();
  const lastUpdateTimeRef = reactExports.useRef(0);
  const updateDimensions = reactExports.useCallback((newDimensions) => {
    setDimensions(newDimensions);
  }, []);
  reactExports.useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const now = performance.now();
        if (animationFrameIdRef.current) {
          cancelAnimationFrame(animationFrameIdRef.current);
        }
        if (now - lastUpdateTimeRef.current >= throttleMs) {
          lastUpdateTimeRef.current = now;
          updateDimensions({ width, height });
        } else {
          animationFrameIdRef.current = requestAnimationFrame(() => {
            lastUpdateTimeRef.current = performance.now();
            updateDimensions({ width, height });
          });
        }
      }
    });
    resizeObserver.observe(element);
    const rect = element.getBoundingClientRect();
    updateDimensions({
      width: rect.width,
      height: observeHeight ? rect.height : 0
    });
    return () => {
      resizeObserver.disconnect();
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [throttleMs, observeHeight, updateDimensions]);
  return {
    ref: elementRef,
    dimensions
  };
};
function R$1(x0, y0, y1) {
  var x1 = null, defined = constant(true), context = null, curve = U$1, output = null, path = withPath(area);
  x0 = typeof x0 === "function" ? x0 : x0 === void 0 ? x$1 : constant(+x0);
  y0 = typeof y0 === "function" ? y0 : y0 === void 0 ? constant(0) : constant(+y0);
  y1 = typeof y1 === "function" ? y1 : y1 === void 0 ? y$1 : constant(+y1);
  function area(data) {
    var i, j2, k, n2 = (data = array(data)).length, d, defined0 = false, buffer, x0z = new Array(n2), y0z = new Array(n2);
    if (context == null) output = curve(buffer = path());
    for (i = 0; i <= n2; ++i) {
      if (!(i < n2 && defined(d = data[i], i, data)) === defined0) {
        if (defined0 = !defined0) {
          j2 = i;
          output.areaStart();
          output.lineStart();
        } else {
          output.lineEnd();
          output.lineStart();
          for (k = i - 1; k >= j2; --k) {
            output.point(x0z[k], y0z[k]);
          }
          output.lineEnd();
          output.areaEnd();
        }
      }
      if (defined0) {
        x0z[i] = +x0(d, i, data), y0z[i] = +y0(d, i, data);
        output.point(x1 ? +x1(d, i, data) : x0z[i], y1 ? +y1(d, i, data) : y0z[i]);
      }
    }
    if (buffer) return output = null, buffer + "" || null;
  }
  function arealine() {
    return P$1().defined(defined).curve(curve).context(context);
  }
  area.x = function(_2) {
    return arguments.length ? (x0 = typeof _2 === "function" ? _2 : constant(+_2), x1 = null, area) : x0;
  };
  area.x0 = function(_2) {
    return arguments.length ? (x0 = typeof _2 === "function" ? _2 : constant(+_2), area) : x0;
  };
  area.x1 = function(_2) {
    return arguments.length ? (x1 = _2 == null ? null : typeof _2 === "function" ? _2 : constant(+_2), area) : x1;
  };
  area.y = function(_2) {
    return arguments.length ? (y0 = typeof _2 === "function" ? _2 : constant(+_2), y1 = null, area) : y0;
  };
  area.y0 = function(_2) {
    return arguments.length ? (y0 = typeof _2 === "function" ? _2 : constant(+_2), area) : y0;
  };
  area.y1 = function(_2) {
    return arguments.length ? (y1 = _2 == null ? null : typeof _2 === "function" ? _2 : constant(+_2), area) : y1;
  };
  area.lineX0 = area.lineY0 = function() {
    return arealine().x(x0).y(y0);
  };
  area.lineY1 = function() {
    return arealine().x(x0).y(y1);
  };
  area.lineX1 = function() {
    return arealine().x(x1).y(y0);
  };
  area.defined = function(_2) {
    return arguments.length ? (defined = typeof _2 === "function" ? _2 : constant(!!_2), area) : defined;
  };
  area.curve = function(_2) {
    return arguments.length ? (curve = _2, context != null && (output = curve(context)), area) : curve;
  };
  area.context = function(_2) {
    return arguments.length ? (_2 == null ? context = output = null : output = curve(context = _2), area) : context;
  };
  return area;
}
const useGetCustomFiltersConfigQuery = (triggerObjectTypes) => {
  const getCustomFiltersConfig = useServerFn(getCustomFiltersConfigFn);
  return useQuery({
    queryKey: ["analytics", "custom-filters-config", triggerObjectTypes],
    enabled: triggerObjectTypes.length > 0,
    queryFn: async () => getCustomFiltersConfig({ data: { triggerObjectTypes } })
  });
};
function CustomFiltersForm({ triggerObjects, scenarioId, ranges }) {
  const { t: t2 } = useTranslation(["common", "analytics", "settings"]);
  const queryClient = useQueryClient();
  const [open, setOpen] = reactExports.useState(false);
  const [draftRows, setDraftRows] = reactExports.useState([createEmptyDraftRow()]);
  const [rowIdPendingDelete, setRowIdPendingDelete] = reactExports.useState(null);
  const { data: config, isLoading } = useGetCustomFiltersConfigQuery(triggerObjects);
  const createFilterMutation = useCreateFilterMutation();
  const deleteFilterMutation = useDeleteFilterMutation();
  const existingFilters = config?.existingFilters ?? [];
  const tableConfigs = config?.tableConfigs ?? [];
  const tableConfigByName = reactExports.useMemo(
    () => new Map(tableConfigs.map((table) => [table.tableName, table])),
    [tableConfigs]
  );
  reactExports.useEffect(() => {
    if (config) {
      setDraftRows(buildDraftRowsFromExisting(config.existingFilters));
    }
  }, [config]);
  const isSaving = createFilterMutation.isPending || deleteFilterMutation.isPending;
  const hasIncompleteRow = hasIncompleteActiveRow(draftRows);
  const hasChanges = hasDraftChanges(existingFilters, draftRows);
  const canSave = hasChanges && !hasIncompleteRow && !isSaving && !isLoading;
  const canAddRow = canAddFilterRow(draftRows, tableConfigs);
  function resetDraft() {
    if (config) {
      setDraftRows(buildDraftRowsFromExisting(config.existingFilters));
    } else {
      setDraftRows([createEmptyDraftRow()]);
    }
  }
  function onOpenChange(nextOpen) {
    if (!nextOpen) {
      resetDraft();
      setRowIdPendingDelete(null);
    }
    setOpen(nextOpen);
  }
  function updateRow(rowId, updater) {
    setDraftRows((rows) => rows.map((row) => row.id === rowId ? updater(row) : row));
  }
  function removeRow(rowId) {
    setDraftRows((rows) => rows.filter((row) => row.id !== rowId));
  }
  function markRowDeleted(rowId) {
    updateRow(rowId, (current) => ({ ...current, isDeleted: true }));
  }
  function undeleteRow(rowId) {
    updateRow(rowId, (current) => ({ ...current, isDeleted: false }));
  }
  function requestRemoveRow(rowId) {
    const row = draftRows.find((item) => item.id === rowId);
    if (!row || row.isDeleted) return;
    if (row.isNew) {
      removeRow(rowId);
      return;
    }
    if (needsDeleteConfirmation(row, existingFilters)) {
      setRowIdPendingDelete(rowId);
      return;
    }
    removeRow(rowId);
  }
  function confirmRemoveRow() {
    if (!rowIdPendingDelete) return;
    markRowDeleted(rowIdPendingDelete);
    setRowIdPendingDelete(null);
  }
  function addRow() {
    setDraftRows((rows) => [...rows, createEmptyDraftRow()]);
  }
  async function saveFilters() {
    if (!canSave) return;
    const { toCreate, toDelete } = diffFilterChanges(existingFilters, draftRows);
    try {
      for (const item of toDelete) {
        await deleteFilterMutation.mutateAsync(item);
      }
      for (const item of toCreate) {
        await createFilterMutation.mutateAsync(item);
      }
      await queryClient.invalidateQueries({ queryKey: ["analytics", "available-filters", scenarioId, ranges] });
      await queryClient.invalidateQueries({ queryKey: ["analytics", "custom-filters-config", triggerObjects] });
      setOpen(false);
      if (toCreate.length > 0 || toDelete.length > 0) {
        zt.success(
          () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex max-w-sm flex-col gap-2xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s font-semibold", children: t2("analytics:filters.custom_filters.save_success.title") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s font-normal", children: t2("analytics:filters.custom_filters.save_success.description") })
          ] }),
          { duration: 8e3 }
        );
      }
    } catch {
      zt.error(t2("common:errors.unknown"));
      await queryClient.invalidateQueries({ queryKey: ["analytics", "custom-filters-config", triggerObjects] });
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel.Root, { open, onOpenChange, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Trigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "primary", appearance: "stroked", size: "medium", className: "shrink-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "settings", className: "size-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t2("analytics:filters.custom_filters.label") })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Container, { size: "medium", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel.Content, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Header, { children: t2("analytics:filters.custom_filters.title") }),
      triggerObjects.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Typo, { variant: "text", className: "text-grey-secondary px-lg pb-lg", children: t2("analytics:filters.custom_filters.no_filters") }) : isLoading ? null : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-[1fr_1fr_auto_auto] gap-md px-lg pb-lg", children: draftRows.map((row) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          CustomFilterRow,
          {
            row,
            triggerObjects,
            tableConfig: row.triggerObjectType ? tableConfigByName.get(row.triggerObjectType) : void 0,
            usedSelectionKeys: getUsedSelectionKeys(draftRows, row.id),
            onTriggerObjectChange: (triggerObjectType) => {
              const tableId = tableConfigByName.get(triggerObjectType)?.tableId ?? null;
              updateRow(row.id, (current) => ({
                ...current,
                triggerObjectType,
                tableId,
                selection: null,
                persistedKey: void 0
              }));
            },
            onSelectionChange: (selection) => {
              updateRow(row.id, (current) => ({
                ...current,
                selection,
                persistedKey: void 0
              }));
            },
            onRemove: () => requestRemoveRow(row.id),
            onUndelete: () => undeleteRow(row.id)
          },
          row.id
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "primary",
            appearance: "stroked",
            className: "self-start",
            disabled: !canAddRow,
            onClick: addRow,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t2("analytics:filters.custom_filters.add_filter") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "plus", className: "size-4" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel.Footer, { className: "flex gap-md items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typo, { variant: "text", className: "text-grey-secondary", children: t2("analytics:filters.custom_filters.description") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.FooterButton, { label: t2("common:cancel"), isCloseButton: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Panel.FooterButton,
          {
            variant: "primary",
            onClick: saveFilters,
            label: t2("common:save"),
            disabled: !canSave,
            isLoading: isSaving
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Root, { open: rowIdPendingDelete !== null, onOpenChange: (isOpen) => !isOpen && setRowIdPendingDelete(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Content, { size: "medium", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: t2("settings:filters.delete_filter.title") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Description, { className: "p-lg text-left", children: t2("settings:filters.delete_filter.content") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Footer, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Modal.FooterButton,
          {
            isCloseButton: true,
            variant: "secondary",
            label: t2("common:cancel"),
            onClick: () => setRowIdPendingDelete(null)
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Modal.FooterButton,
          {
            variant: "destructive",
            label: t2("settings:filters.delete_filter"),
            onClick: confirmRemoveRow,
            leadingIcon: "delete"
          }
        )
      ] })
    ] }) })
  ] });
}
function getUsedSelectionKeys(rows, currentRowId) {
  return new Set(
    rows.filter((row) => row.id !== currentRowId && isActiveRow(row) && isRowComplete(row)).map((row) => getSelectionKey(row.tableId, row.selection))
  );
}
function CustomFilterRow({
  row,
  triggerObjects,
  tableConfig,
  usedSelectionKeys,
  onTriggerObjectChange,
  onSelectionChange,
  onRemove,
  onUndelete
}) {
  const { t: t2 } = useTranslation(["analytics", "common"]);
  const isDeleted = Boolean(row.isDeleted);
  const deletedTextClassName = "text-grey-secondary line-through";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("col-span-full grid grid-cols-subgrid items-center gap-md", isDeleted && "opacity-60"), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      TriggerObjectSelect,
      {
        triggerObjects,
        value: row.triggerObjectType,
        placeholder: t2("analytics:filters.custom_filters.select_table"),
        onChange: onTriggerObjectChange,
        disabled: isDeleted,
        textClassName: isDeleted ? deletedTextClassName : void 0
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      FieldLinkSelect,
      {
        tableConfig,
        selection: row.selection,
        usedSelectionKeys,
        tableId: row.tableId,
        placeholder: t2("analytics:filters.custom_filters.select_field"),
        searchPlaceholder: t2("analytics:filters.custom_filters.search_field"),
        fieldsGroupLabel: t2("analytics:filters.custom_filters.fields_group"),
        linksGroupLabel: t2("analytics:filters.custom_filters.links_group"),
        onChange: onSelectionChange,
        disabled: isDeleted,
        textClassName: isDeleted ? deletedTextClassName : void 0
      }
    ),
    isDeleted ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        variant: "secondary",
        mode: "icon",
        onClick: onUndelete,
        "aria-label": t2("analytics:filters.custom_filters.undelete_filter"),
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "restart-alt", className: "size-4" })
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", mode: "icon", onClick: onRemove, "aria-label": t2("common:delete"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "delete", className: "size-4" }) }),
    row.isNew ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex shrink-0 items-center", title: t2("analytics:filters.custom_filters.new_filter_indicator"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "star", className: "text-purple-primary size-2" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-2 shrink-0", "aria-hidden": "true" })
  ] });
}
function TriggerObjectSelect({
  triggerObjects,
  value,
  placeholder,
  onChange,
  disabled = false,
  textClassName
}) {
  const [menuOpen, setMenuOpen] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Menu, { open: menuOpen, onOpenChange: setMenuOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Trigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.SelectButton, { className: "min-w-40", disabled, readOnly: disabled, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("px-xs", textClassName), children: value ?? placeholder }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Content, { align: "start", sameWidth: true, sideOffset: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.List, { children: triggerObjects.map((triggerObject) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      MenuCommand.Item,
      {
        value: triggerObject,
        selected: value === triggerObject,
        onSelect: () => {
          onChange(triggerObject);
          setMenuOpen(false);
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-xs", children: triggerObject })
      },
      triggerObject
    )) }) })
  ] });
}
function FieldLinkSelect({
  tableConfig,
  selection,
  usedSelectionKeys,
  tableId,
  placeholder,
  searchPlaceholder,
  fieldsGroupLabel,
  linksGroupLabel,
  onChange,
  disabled = false,
  textClassName
}) {
  const [menuOpen, setMenuOpen] = reactExports.useState(false);
  const isDisabled = disabled || !tableConfig || !tableId;
  const label = tableConfig && selection ? getFieldSelectionLabel(tableConfig.tableName, selection) : placeholder;
  const availableFields = tableId === null ? [] : (tableConfig?.fields ?? []).filter(
    (field) => !usedSelectionKeys.has(getSelectionKey(tableId, { kind: "trigger", fieldName: field.name }))
  );
  const availableLinks = tableId === null ? [] : (tableConfig?.links ?? []).filter(
    (linkConfig) => linkConfig.fields.some(
      (field) => !usedSelectionKeys.has(
        getSelectionKey(tableId, {
          kind: "ingested",
          path: [linkConfig.link.name],
          fieldName: field.name
        })
      )
    )
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Menu, { open: menuOpen, onOpenChange: setMenuOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Trigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.SelectButton, { className: "min-w-56 flex-1", disabled: isDisabled, readOnly: disabled, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("px-xs", textClassName), children: label }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Content, { align: "start", sameWidth: true, sideOffset: 4, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Combobox, { placeholder: searchPlaceholder }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.List, { children: [
        availableFields.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          MenuCommand.Group,
          {
            heading: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-xs py-2xs text-xs text-grey-secondary", children: fieldsGroupLabel }),
            children: availableFields.map((field) => {
              const fieldSelection = { kind: "trigger", fieldName: field.name };
              const isSelected = selection?.kind === "trigger" && selection.fieldName === field.name;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                MenuCommand.Item,
                {
                  value: field.name,
                  selected: isSelected,
                  onSelect: () => {
                    onChange(fieldSelection);
                    setMenuOpen(false);
                  },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-xs", children: field.name })
                },
                `field-${field.id}`
              );
            })
          }
        ) : null,
        availableLinks.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          availableFields.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Separator, {}) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            MenuCommand.Group,
            {
              heading: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-xs py-2xs text-xs text-grey-secondary", children: linksGroupLabel }),
              children: availableLinks.map((linkConfig) => /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.SubMenu, { trigger: linkConfig.link.name, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Combobox, { placeholder: searchPlaceholder }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.List, { children: linkConfig.fields.filter(
                  (field) => tableId !== null && !usedSelectionKeys.has(
                    getSelectionKey(tableId, {
                      kind: "ingested",
                      path: [linkConfig.link.name],
                      fieldName: field.name
                    })
                  )
                ).map((field) => {
                  const fieldSelection = {
                    kind: "ingested",
                    path: [linkConfig.link.name],
                    fieldName: field.name
                  };
                  const isSelected = selection?.kind === "ingested" && selection.fieldName === field.name && selection.path[0] === linkConfig.link.name;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    MenuCommand.Item,
                    {
                      value: `${linkConfig.link.name}.${field.name}`,
                      selected: isSelected,
                      onSelect: () => {
                        onChange(fieldSelection);
                        setMenuOpen(false);
                      },
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-xs", children: field.name })
                    },
                    `link-${linkConfig.link.id}-${field.id}`
                  );
                }) })
              ] }, linkConfig.link.id))
            }
          )
        ] }) : null
      ] })
    ] })
  ] });
}
const outcomes = ["approve", "review", "blockAndReview", "decline"];
const OUTCOME_COLORS = {
  approve: "#46BB7F",
  review: "#FDBD35",
  blockAndReview: "#FF8533",
  decline: "#DB5F4A"
};
const getOutcomeTranslationKey = (outcome) => {
  if (outcome === "blockAndReview") {
    return "decisions:outcome.block_and_review";
  }
  return `decisions:outcome.${outcome}`;
};
const GraphSpinnerOverlay = () => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-grey-background", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, { className: "size-6" }) });
};
function OutcomeFilter({
  decisions,
  highlight = false,
  onChange,
  disabled = false
}) {
  const hasHighlightedRef = reactExports.useRef(false);
  const { t: t2 } = useTranslation(["analytics", "decisions"]);
  reactExports.useEffect(() => {
    if (!highlight) {
      hasHighlightedRef.current = false;
    }
  }, [highlight]);
  const handleToggle = (key) => {
    const newDecisions = new Map(decisions);
    newDecisions.set(key, !decisions.get(key));
    hasHighlightedRef.current = true;
    onChange(newDecisions);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: cn("flex flex-row gap-lg select-none", { "opacity-50": disabled, "pointer-events-none": disabled }),
      children: outcomes.map((outcome) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        FilterItem,
        {
          handleToggle,
          label: t2(getOutcomeTranslationKey(outcome)),
          outcome,
          checked: decisions.get(outcome) ?? false,
          highlight,
          hasHighlightedRef
        },
        outcome
      ))
    }
  );
}
const FilterItem = ({
  label,
  outcome,
  checked,
  handleToggle,
  highlight,
  hasHighlightedRef
}) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  "div",
  {
    className: cn("flex items-center gap-sm cursor-pointer flex-1 min-w-fit", { "opacity-50": !checked }),
    onClick: () => handleToggle(outcome),
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: cn(
            "w-4 h-4 border border-grey-border rounded-sm flex items-center justify-center hover:bg-grey-placeholder"
          ),
          style: { backgroundColor: OUTCOME_COLORS[outcome] }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center flex-1 whitespace-nowrap min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: label }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-4 h-4 flex items-center justify-center flex-shrink-0 lg-analytics:ms-md ms-0 relative", children: [
          highlight && !hasHighlightedRef.current ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            Icon,
            {
              icon: checked ? "eye" : "eye-slash",
              className: cn("absolute size-4 animate-ping-once", checked ? "text-blue-58" : "text-grey-secondary")
            }
          ) : null,
          highlight || !checked ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            Icon,
            {
              icon: checked ? "eye" : "eye-slash",
              className: cn("relative size-4", checked ? "text-blue-58" : "text-grey-secondary")
            }
          ) : null
        ] })
      ] })
    ]
  }
);
const defaultDecisions = /* @__PURE__ */ new Map([
  ["decline", true],
  ["blockAndReview", true],
  ["review", true],
  ["approve", false]
]);
const getBarColors = (d) => {
  const id = String(d.id);
  return OUTCOME_COLORS[id] ?? "#9ca3af";
};
function Decisions({ data, scenarioVersions, isLoading = false }) {
  const { t: t2 } = useTranslation();
  const language = useFormatLanguage();
  const { ref: divRef, dimensions } = useResizeObserver({
    throttleMs: 16,
    observeHeight: false
  });
  const MAX_RANGE_SIZE_FOR_DAILY = 182;
  const [decisions, setDecisions] = reactExports.useState(defaultDecisions);
  const [percentage, setPercentage] = reactExports.useState(false);
  const [scale, setScale] = reactExports.useState("linear");
  const [groupDate, setGroupDate] = reactExports.useState("weekly");
  const [isHovered, setIsHovered] = reactExports.useState(false);
  const currentDataGroup = reactExports.useMemo(() => data?.[groupDate], [data, groupDate]);
  const sanitizedData = reactExports.useMemo(
    () => percentage ? currentDataGroup?.data.ratio ?? [] : currentDataGroup?.data.absolute ?? [],
    [percentage, currentDataGroup]
  );
  const chartData = reactExports.useMemo(() => sanitizedData, [sanitizedData]);
  const isSameYear = getYear(data?.metadata.start) === getYear(data?.metadata.end);
  const isDailyViewAvailable = reactExports.useMemo(
    () => differenceInDays(new Date(data?.metadata.end), new Date(data?.metadata.start)) <= MAX_RANGE_SIZE_FOR_DAILY,
    [data?.metadata.start, data?.metadata.end]
  );
  reactExports.useEffect(() => {
    if (!data?.metadata.totalDecisions) {
      return setGroupDate("daily");
    }
    if (!isDailyViewAvailable && groupDate === "daily") {
      return setGroupDate("weekly");
    }
  }, [data?.metadata.totalDecisions, isDailyViewAvailable]);
  const padding = reactExports.useMemo(() => {
    if (scale !== "symlog") {
      return 0.5;
    }
    if (!data?.metadata.start || !data?.metadata.end) {
      return 0.01;
    }
    const days = Math.abs(differenceInDays(new Date(data.metadata.end), new Date(data.metadata.start)));
    const threshold = 90;
    if (days > threshold) {
      return 0.01;
    }
    const ratio = days / threshold;
    return 0.5 - ratio * (0.5 - 0.01);
  }, [scale, data?.metadata.start, data?.metadata.end]);
  const getTootlipDateFormat = (date) => {
    const dateObj = new Date(date);
    switch (groupDate) {
      case "monthly":
        return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "capitalize", children: dateObj.toLocaleDateString(language, {
          month: "long",
          year: isSameYear ? void 0 : "numeric"
        }) });
      case "weekly":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          Trans,
          {
            i18nKey: "analytics:decisions.tooltip.weekly",
            values: {
              date: dateObj.toLocaleDateString(language, {
                day: "numeric",
                month: "short",
                year: isSameYear ? void 0 : "numeric"
              }),
              weekNumber: getWeek(dateObj)
            },
            components: {
              Br: /* @__PURE__ */ jsxRuntimeExports.jsx("br", {})
            }
          }
        );
      case "daily":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          Trans,
          {
            i18nKey: "analytics:decisions.tooltip.daily",
            values: {
              date: dateObj.toLocaleDateString(language, {
                day: "numeric",
                month: "short",
                year: isSameYear ? void 0 : "numeric"
              })
            }
          }
        );
    }
  };
  const getSymlogTickValues = () => {
    if (chartData.length === 0) return [0];
    const values = chartData.flatMap((d) => [d.approve, d.decline, d.review, d.blockAndReview]);
    const maxValue = Math.max(...values);
    if (maxValue === 0) return [0];
    const ticks = /* @__PURE__ */ new Set([0]);
    let step = 1;
    while (step <= maxValue) {
      ticks.add(step);
      if (step * 2 <= maxValue) ticks.add(step * 2);
      if (step * 5 <= maxValue) ticks.add(step * 5);
      step *= 10;
    }
    return Array.from(ticks).sort((a, b) => a - b);
  };
  const getXTickValues = () => {
    if (!currentDataGroup?.gridXValues) {
      return [];
    }
    if (!data?.metadata.totalDecisions) {
      return [data?.metadata.start, data?.metadata.end];
    }
    if (dimensions.width < 400) {
      return currentDataGroup.gridXValues.filter((_2, index) => index % 4 === 0);
    }
    if (dimensions.width < 800 && currentDataGroup.gridXValues.length >= 10) {
      return currentDataGroup?.gridXValues.filter((_2, index) => index % 2 === 0);
    }
    return currentDataGroup?.gridXValues;
  };
  const handleExportCsv2 = () => {
    if (!data?.daily?.data?.absolute.length) return;
    const headers = ["date", "rangeId", ...decisions.keys(), ["total"]];
    const lines = data.daily.data.absolute.map((row) => {
      const base = [row.date, row.rangeId];
      const outcomeValues = Array.from(decisions.entries()).map(([k]) => {
        const v = row[k];
        return String(v);
      });
      const maybeTotal = [String(row.total ?? 0)];
      return [...base, ...outcomeValues, ...maybeTotal].join(",");
    });
    const csv = [headers.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8," });
    const url = URL.createObjectURL(blob);
    downloadFile(url, `decisions_outcomes_per_day.csv`);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "bg-surface-card border border-grey-border rounded-lg p-md flex flex-col gap-sm",
      onMouseEnter: () => {
        setIsHovered(true);
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typo, { variant: "title2", children: t2("analytics:decisions.title") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "secondary",
              className: "flex items-center gap-sm",
              disabled: isLoading || !currentDataGroup || (percentage ? (currentDataGroup.data.ratio?.length ?? 0) === 0 : (currentDataGroup.data.absolute?.length ?? 0) === 0),
              onClick: handleExportCsv2,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "download", className: "size-4" }),
                t2("analytics:export.button")
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: divRef, className: "bg-surface-card border border-grey-border rounded-lg p-md mt-sm relative", children: [
          isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(GraphSpinnerOverlay, {}) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-full h-[500px] flex-col items-start gap-md", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between w-full", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-s", children: [
                  t2("analytics:decisions.count.label"),
                  ":"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      variant: "secondary",
                      onClick: () => {
                        setPercentage(true);
                        setDecisions(
                          /* @__PURE__ */ new Map([
                            ["decline", true],
                            ["blockAndReview", true],
                            ["review", true],
                            ["approve", true]
                          ])
                        );
                      },
                      className: percentage ? "bg-purple-background-light border-purple-primary text-purple-primary" : "",
                      children: "%"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      variant: "secondary",
                      onClick: () => setPercentage(false),
                      className: !percentage ? "bg-purple-background-light border-purple-primary text-purple-primary" : "",
                      children: "#"
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-s", children: [
                  t2("analytics:decisions.scale.label"),
                  ":"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      variant: "secondary",
                      onClick: () => {
                        setScale("linear");
                      },
                      className: scale === "linear" ? "bg-purple-background-light border-purple-primary text-purple-primary" : "",
                      children: t2("analytics:decisions.scale.linear.label")
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      variant: "secondary",
                      onClick: () => {
                        setGroupDate("weekly");
                        setScale("symlog");
                      },
                      className: scale === "symlog" ? "bg-purple-background-light border-purple-primary text-purple-primary" : "",
                      children: t2("analytics:decisions.scale.symlog.label")
                    }
                  )
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Xe,
              {
                data: chartData,
                indexBy: "date",
                enableLabel: false,
                keys: Array.from(decisions).filter(([_2, value]) => value).map(([key]) => key),
                padding,
                margin: { top: 5, right: 5, bottom: 24, left: 54 },
                colors: getBarColors,
                borderRadius: 4,
                borderWidth: 1,
                borderColor: { from: "color" },
                defs: [
                  {
                    id: "compareOpacity",
                    type: "linearGradient",
                    colors: [
                      { offset: 0, color: "inherit", opacity: 0.5 },
                      { offset: 100, color: "inherit", opacity: 0.5 }
                    ]
                  },
                  {
                    id: "barGradient",
                    type: "linearGradient",
                    colors: [
                      { offset: 0, color: "inherit", opacity: 0.85 },
                      { offset: 100, color: "inherit", opacity: 0.2 }
                    ]
                  }
                ],
                fill: [
                  {
                    match: (n2) => n2.data.data.rangeId === "compare",
                    id: "compareOpacity"
                  },
                  {
                    match: (n2) => n2.data.data.rangeId !== "compare",
                    id: "barGradient"
                  }
                ],
                groupMode: scale === "symlog" ? "grouped" : "stacked",
                valueScale: !data?.metadata.totalDecisions ? { type: "linear", min: 0, max: 1e3 } : { type: scale, round: true, nice: true },
                axisLeft: {
                  legend: "outcome (indexBy)",
                  legendOffset: -70,
                  tickValues: !data?.metadata.totalDecisions ? [0, 200, 400, 600, 800, 1e3] : scale === "symlog" ? getSymlogTickValues() : void 0
                },
                axisBottom: {
                  tickValues: getXTickValues(),
                  format: (value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString(language, {
                      year: !isSameYear ? "numeric" : void 0,
                      month: "short",
                      day: groupDate !== "monthly" ? "numeric" : void 0
                    });
                  }
                },
                tooltip: ({ data: data2 }) => {
                  const outcomes2 = ["approve", "decline", "review", "blockAndReview"];
                  const totalValue = !percentage && typeof data2.total === "number" ? data2.total : void 0;
                  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xs bg-surface-card px-md py-sm rounded-lg border border-grey-border shadow-md min-w-52 w-max whitespace-nowrap", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-primary font-semibold", children: getTootlipDateFormat(data2?.date) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-xs", children: outcomes2.map((outcome) => {
                      const outcomeValue = data2?.[outcome] ?? 0;
                      const displayValue = percentage ? `${outcomeValue.toFixed(1)}%` : outcomeValue;
                      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-md", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-xs", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "div",
                            {
                              className: "size-2.5 rounded-full flex-shrink-0",
                              style: { backgroundColor: OUTCOME_COLORS[outcome] }
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-secondary", children: t2(getOutcomeTranslationKey(outcome)) })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-primary font-semibold", children: displayValue })
                      ] }, outcome);
                    }) }),
                    !percentage && totalValue !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-md pt-xs border-t border-grey-border mt-xs", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-secondary", children: t2("analytics:decisions.tooltip.total", { defaultValue: "Total" }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-primary font-semibold", children: totalValue })
                    ] })
                  ] });
                },
                theme: {
                  text: { fill: "var(--color-grey-secondary)" },
                  axis: { ticks: { text: { fill: "var(--color-grey-secondary)" } } },
                  legends: { text: { fill: "var(--color-grey-secondary)" } },
                  grid: { line: { stroke: "var(--color-grey-border)", strokeWidth: 1, strokeDasharray: "4 4" } }
                },
                layout: "vertical",
                motionConfig: {
                  mass: 1,
                  tension: 170,
                  friction: 8,
                  clamp: true,
                  precision: 0.01,
                  velocity: 0
                }
              },
              `${percentage ? "percentage" : "absolute"}-${groupDate}`
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex w-full justify-end mt-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  disabled: !isDailyViewAvailable || !data?.metadata.totalDecisions,
                  variant: "secondary",
                  mode: "normal",
                  onClick: () => {
                    setGroupDate("daily");
                    setScale("linear");
                  },
                  className: groupDate === "daily" ? "bg-purple-background-light border-purple-primary text-purple-primary" : "",
                  children: t2("analytics:time_granularity.day")
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  disabled: !data?.weekly || !data?.metadata.totalDecisions,
                  variant: "secondary",
                  mode: "normal",
                  onClick: () => setGroupDate("weekly"),
                  className: groupDate === "weekly" ? "bg-purple-background-light border-purple-primary text-purple-primary" : "",
                  children: t2("analytics:time_granularity.week")
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  disabled: !data?.monthly || !data?.metadata.totalDecisions,
                  variant: "secondary",
                  mode: "normal",
                  onClick: () => setGroupDate("monthly"),
                  className: groupDate === "monthly" ? "bg-purple-background-light border-purple-primary text-purple-primary" : "",
                  children: t2("analytics:time_granularity.month")
                }
              )
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex w-full justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(OutcomeFilter, { decisions, onChange: setDecisions, highlight: isHovered }) })
          ] })
        ] })
      ]
    }
  );
}
var uniqueId_1;
var hasRequiredUniqueId;
function requireUniqueId() {
  if (hasRequiredUniqueId) return uniqueId_1;
  hasRequiredUniqueId = 1;
  var toString = requireToString();
  var idCounter = 0;
  function uniqueId(prefix) {
    var id = ++idCounter;
    return toString(prefix) + id;
  }
  uniqueId_1 = uniqueId;
  return uniqueId_1;
}
var uniqueIdExports = requireUniqueId();
const O$1 = /* @__PURE__ */ getDefaultExportFromCjs(uniqueIdExports);
const epsilon$1 = 11102230246251565e-32;
const splitter = 134217729;
const resulterrbound = (3 + 8 * epsilon$1) * epsilon$1;
function sum(elen, e, flen, f, h) {
  let Q, Qnew, hh, bvirt;
  let enow = e[0];
  let fnow = f[0];
  let eindex = 0;
  let findex = 0;
  if (fnow > enow === fnow > -enow) {
    Q = enow;
    enow = e[++eindex];
  } else {
    Q = fnow;
    fnow = f[++findex];
  }
  let hindex = 0;
  if (eindex < elen && findex < flen) {
    if (fnow > enow === fnow > -enow) {
      Qnew = enow + Q;
      hh = Q - (Qnew - enow);
      enow = e[++eindex];
    } else {
      Qnew = fnow + Q;
      hh = Q - (Qnew - fnow);
      fnow = f[++findex];
    }
    Q = Qnew;
    if (hh !== 0) {
      h[hindex++] = hh;
    }
    while (eindex < elen && findex < flen) {
      if (fnow > enow === fnow > -enow) {
        Qnew = Q + enow;
        bvirt = Qnew - Q;
        hh = Q - (Qnew - bvirt) + (enow - bvirt);
        enow = e[++eindex];
      } else {
        Qnew = Q + fnow;
        bvirt = Qnew - Q;
        hh = Q - (Qnew - bvirt) + (fnow - bvirt);
        fnow = f[++findex];
      }
      Q = Qnew;
      if (hh !== 0) {
        h[hindex++] = hh;
      }
    }
  }
  while (eindex < elen) {
    Qnew = Q + enow;
    bvirt = Qnew - Q;
    hh = Q - (Qnew - bvirt) + (enow - bvirt);
    enow = e[++eindex];
    Q = Qnew;
    if (hh !== 0) {
      h[hindex++] = hh;
    }
  }
  while (findex < flen) {
    Qnew = Q + fnow;
    bvirt = Qnew - Q;
    hh = Q - (Qnew - bvirt) + (fnow - bvirt);
    fnow = f[++findex];
    Q = Qnew;
    if (hh !== 0) {
      h[hindex++] = hh;
    }
  }
  if (Q !== 0 || hindex === 0) {
    h[hindex++] = Q;
  }
  return hindex;
}
function estimate(elen, e) {
  let Q = e[0];
  for (let i = 1; i < elen; i++) Q += e[i];
  return Q;
}
function vec(n2) {
  return new Float64Array(n2);
}
const ccwerrboundA = (3 + 16 * epsilon$1) * epsilon$1;
const ccwerrboundB = (2 + 12 * epsilon$1) * epsilon$1;
const ccwerrboundC = (9 + 64 * epsilon$1) * epsilon$1 * epsilon$1;
const B = vec(4);
const C1 = vec(8);
const C2 = vec(12);
const D$1 = vec(16);
const u = vec(4);
function orient2dadapt(ax, ay, bx, by, cx, cy, detsum) {
  let acxtail, acytail, bcxtail, bcytail;
  let bvirt, c, ahi, alo, bhi, blo, _i, _j, _0, s1, s0, t1, t0, u3;
  const acx = ax - cx;
  const bcx = bx - cx;
  const acy = ay - cy;
  const bcy = by - cy;
  s1 = acx * bcy;
  c = splitter * acx;
  ahi = c - (c - acx);
  alo = acx - ahi;
  c = splitter * bcy;
  bhi = c - (c - bcy);
  blo = bcy - bhi;
  s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
  t1 = acy * bcx;
  c = splitter * acy;
  ahi = c - (c - acy);
  alo = acy - ahi;
  c = splitter * bcx;
  bhi = c - (c - bcx);
  blo = bcx - bhi;
  t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
  _i = s0 - t0;
  bvirt = s0 - _i;
  B[0] = s0 - (_i + bvirt) + (bvirt - t0);
  _j = s1 + _i;
  bvirt = _j - s1;
  _0 = s1 - (_j - bvirt) + (_i - bvirt);
  _i = _0 - t1;
  bvirt = _0 - _i;
  B[1] = _0 - (_i + bvirt) + (bvirt - t1);
  u3 = _j + _i;
  bvirt = u3 - _j;
  B[2] = _j - (u3 - bvirt) + (_i - bvirt);
  B[3] = u3;
  let det = estimate(4, B);
  let errbound = ccwerrboundB * detsum;
  if (det >= errbound || -det >= errbound) {
    return det;
  }
  bvirt = ax - acx;
  acxtail = ax - (acx + bvirt) + (bvirt - cx);
  bvirt = bx - bcx;
  bcxtail = bx - (bcx + bvirt) + (bvirt - cx);
  bvirt = ay - acy;
  acytail = ay - (acy + bvirt) + (bvirt - cy);
  bvirt = by - bcy;
  bcytail = by - (bcy + bvirt) + (bvirt - cy);
  if (acxtail === 0 && acytail === 0 && bcxtail === 0 && bcytail === 0) {
    return det;
  }
  errbound = ccwerrboundC * detsum + resulterrbound * Math.abs(det);
  det += acx * bcytail + bcy * acxtail - (acy * bcxtail + bcx * acytail);
  if (det >= errbound || -det >= errbound) return det;
  s1 = acxtail * bcy;
  c = splitter * acxtail;
  ahi = c - (c - acxtail);
  alo = acxtail - ahi;
  c = splitter * bcy;
  bhi = c - (c - bcy);
  blo = bcy - bhi;
  s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
  t1 = acytail * bcx;
  c = splitter * acytail;
  ahi = c - (c - acytail);
  alo = acytail - ahi;
  c = splitter * bcx;
  bhi = c - (c - bcx);
  blo = bcx - bhi;
  t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
  _i = s0 - t0;
  bvirt = s0 - _i;
  u[0] = s0 - (_i + bvirt) + (bvirt - t0);
  _j = s1 + _i;
  bvirt = _j - s1;
  _0 = s1 - (_j - bvirt) + (_i - bvirt);
  _i = _0 - t1;
  bvirt = _0 - _i;
  u[1] = _0 - (_i + bvirt) + (bvirt - t1);
  u3 = _j + _i;
  bvirt = u3 - _j;
  u[2] = _j - (u3 - bvirt) + (_i - bvirt);
  u[3] = u3;
  const C1len = sum(4, B, 4, u, C1);
  s1 = acx * bcytail;
  c = splitter * acx;
  ahi = c - (c - acx);
  alo = acx - ahi;
  c = splitter * bcytail;
  bhi = c - (c - bcytail);
  blo = bcytail - bhi;
  s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
  t1 = acy * bcxtail;
  c = splitter * acy;
  ahi = c - (c - acy);
  alo = acy - ahi;
  c = splitter * bcxtail;
  bhi = c - (c - bcxtail);
  blo = bcxtail - bhi;
  t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
  _i = s0 - t0;
  bvirt = s0 - _i;
  u[0] = s0 - (_i + bvirt) + (bvirt - t0);
  _j = s1 + _i;
  bvirt = _j - s1;
  _0 = s1 - (_j - bvirt) + (_i - bvirt);
  _i = _0 - t1;
  bvirt = _0 - _i;
  u[1] = _0 - (_i + bvirt) + (bvirt - t1);
  u3 = _j + _i;
  bvirt = u3 - _j;
  u[2] = _j - (u3 - bvirt) + (_i - bvirt);
  u[3] = u3;
  const C2len = sum(C1len, C1, 4, u, C2);
  s1 = acxtail * bcytail;
  c = splitter * acxtail;
  ahi = c - (c - acxtail);
  alo = acxtail - ahi;
  c = splitter * bcytail;
  bhi = c - (c - bcytail);
  blo = bcytail - bhi;
  s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
  t1 = acytail * bcxtail;
  c = splitter * acytail;
  ahi = c - (c - acytail);
  alo = acytail - ahi;
  c = splitter * bcxtail;
  bhi = c - (c - bcxtail);
  blo = bcxtail - bhi;
  t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
  _i = s0 - t0;
  bvirt = s0 - _i;
  u[0] = s0 - (_i + bvirt) + (bvirt - t0);
  _j = s1 + _i;
  bvirt = _j - s1;
  _0 = s1 - (_j - bvirt) + (_i - bvirt);
  _i = _0 - t1;
  bvirt = _0 - _i;
  u[1] = _0 - (_i + bvirt) + (bvirt - t1);
  u3 = _j + _i;
  bvirt = u3 - _j;
  u[2] = _j - (u3 - bvirt) + (_i - bvirt);
  u[3] = u3;
  const Dlen = sum(C2len, C2, 4, u, D$1);
  return D$1[Dlen - 1];
}
function orient2d(ax, ay, bx, by, cx, cy) {
  const detleft = (ay - cy) * (bx - cx);
  const detright = (ax - cx) * (by - cy);
  const det = detleft - detright;
  const detsum = Math.abs(detleft + detright);
  if (Math.abs(det) >= ccwerrboundA * detsum) return det;
  return -orient2dadapt(ax, ay, bx, by, cx, cy, detsum);
}
const EPSILON = Math.pow(2, -52);
const EDGE_STACK = new Uint32Array(512);
class Delaunator {
  /**
   * Constructs a delaunay triangulation object given an array of points (`[x, y]` by default).
   * `getX` and `getY` are optional functions of the form `(point) => value` for custom point formats.
   *
   * @template P
   * @param {P[]} points
   * @param {(p: P) => number} [getX]
   * @param {(p: P) => number} [getY]
   */
  // @ts-expect-error TS2322
  static from(points, getX = defaultGetX, getY = defaultGetY) {
    const n2 = points.length;
    const coords = new Float64Array(n2 * 2);
    for (let i = 0; i < n2; i++) {
      const p = points[i];
      coords[2 * i] = getX(p);
      coords[2 * i + 1] = getY(p);
    }
    return new Delaunator(coords);
  }
  /**
   * Constructs a delaunay triangulation object given an array of point coordinates of the form:
   * `[x0, y0, x1, y1, ...]` (use a typed array for best performance). Duplicate points are skipped.
   *
   * @param {T} coords
   */
  constructor(coords) {
    const n2 = coords.length >> 1;
    if (n2 > 0 && typeof coords[0] !== "number") throw new Error("Expected coords to contain numbers.");
    this.coords = coords;
    const maxTriangles = Math.max(2 * n2 - 5, 0);
    this._triangles = new Uint32Array(maxTriangles * 3);
    this._halfedges = new Int32Array(maxTriangles * 3);
    this._hashSize = Math.ceil(Math.sqrt(n2));
    this._hullPrev = new Uint32Array(n2);
    this._hullNext = new Uint32Array(n2);
    this._hullTri = new Uint32Array(n2);
    this._hullHash = new Int32Array(this._hashSize);
    this._ids = new Uint32Array(n2);
    this._dists = new Float64Array(n2);
    this.trianglesLen = 0;
    this._cx = 0;
    this._cy = 0;
    this._hullStart = 0;
    this.hull = this._triangles;
    this.triangles = this._triangles;
    this.halfedges = this._halfedges;
    this.update();
  }
  /**
   * Updates the triangulation if you modified `delaunay.coords` values in place, avoiding expensive memory allocations.
   * Useful for iterative relaxation algorithms such as Lloyd's.
   */
  update() {
    const { coords, _hullPrev: hullPrev, _hullNext: hullNext, _hullTri: hullTri, _hullHash: hullHash } = this;
    const n2 = coords.length >> 1;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (let i = 0; i < n2; i++) {
      const x2 = coords[2 * i];
      const y2 = coords[2 * i + 1];
      if (x2 < minX) minX = x2;
      if (y2 < minY) minY = y2;
      if (x2 > maxX) maxX = x2;
      if (y2 > maxY) maxY = y2;
      this._ids[i] = i;
    }
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    let i0 = 0, i1 = 0, i2 = 0;
    for (let i = 0, minDist = Infinity; i < n2; i++) {
      const d = dist(cx, cy, coords[2 * i], coords[2 * i + 1]);
      if (d < minDist) {
        i0 = i;
        minDist = d;
      }
    }
    const i0x = coords[2 * i0];
    const i0y = coords[2 * i0 + 1];
    for (let i = 0, minDist = Infinity; i < n2; i++) {
      if (i === i0) continue;
      const d = dist(i0x, i0y, coords[2 * i], coords[2 * i + 1]);
      if (d < minDist && d > 0) {
        i1 = i;
        minDist = d;
      }
    }
    let i1x = coords[2 * i1];
    let i1y = coords[2 * i1 + 1];
    let minRadius = Infinity;
    for (let i = 0; i < n2; i++) {
      if (i === i0 || i === i1) continue;
      const r = circumradius(i0x, i0y, i1x, i1y, coords[2 * i], coords[2 * i + 1]);
      if (r < minRadius) {
        i2 = i;
        minRadius = r;
      }
    }
    let i2x = coords[2 * i2];
    let i2y = coords[2 * i2 + 1];
    if (minRadius === Infinity) {
      for (let i = 0; i < n2; i++) {
        this._dists[i] = coords[2 * i] - coords[0] || coords[2 * i + 1] - coords[1];
      }
      quicksort(this._ids, this._dists, 0, n2 - 1);
      const hull = new Uint32Array(n2);
      let j2 = 0;
      for (let i = 0, d0 = -Infinity; i < n2; i++) {
        const id = this._ids[i];
        const d = this._dists[id];
        if (d > d0) {
          hull[j2++] = id;
          d0 = d;
        }
      }
      this.hull = hull.subarray(0, j2);
      this.triangles = new Uint32Array(0);
      this.halfedges = new Int32Array(0);
      return;
    }
    if (orient2d(i0x, i0y, i1x, i1y, i2x, i2y) < 0) {
      const i = i1;
      const x2 = i1x;
      const y2 = i1y;
      i1 = i2;
      i1x = i2x;
      i1y = i2y;
      i2 = i;
      i2x = x2;
      i2y = y2;
    }
    const center = circumcenter(i0x, i0y, i1x, i1y, i2x, i2y);
    this._cx = center.x;
    this._cy = center.y;
    for (let i = 0; i < n2; i++) {
      this._dists[i] = dist(coords[2 * i], coords[2 * i + 1], center.x, center.y);
    }
    quicksort(this._ids, this._dists, 0, n2 - 1);
    this._hullStart = i0;
    let hullSize = 3;
    hullNext[i0] = hullPrev[i2] = i1;
    hullNext[i1] = hullPrev[i0] = i2;
    hullNext[i2] = hullPrev[i1] = i0;
    hullTri[i0] = 0;
    hullTri[i1] = 1;
    hullTri[i2] = 2;
    hullHash.fill(-1);
    hullHash[this._hashKey(i0x, i0y)] = i0;
    hullHash[this._hashKey(i1x, i1y)] = i1;
    hullHash[this._hashKey(i2x, i2y)] = i2;
    this.trianglesLen = 0;
    this._addTriangle(i0, i1, i2, -1, -1, -1);
    for (let k = 0, xp = 0, yp = 0; k < this._ids.length; k++) {
      const i = this._ids[k];
      const x2 = coords[2 * i];
      const y2 = coords[2 * i + 1];
      if (k > 0 && Math.abs(x2 - xp) <= EPSILON && Math.abs(y2 - yp) <= EPSILON) continue;
      xp = x2;
      yp = y2;
      if (i === i0 || i === i1 || i === i2) continue;
      let start = 0;
      for (let j2 = 0, key = this._hashKey(x2, y2); j2 < this._hashSize; j2++) {
        start = hullHash[(key + j2) % this._hashSize];
        if (start !== -1 && start !== hullNext[start]) break;
      }
      start = hullPrev[start];
      let e = start, q2;
      while (q2 = hullNext[e], orient2d(x2, y2, coords[2 * e], coords[2 * e + 1], coords[2 * q2], coords[2 * q2 + 1]) >= 0) {
        e = q2;
        if (e === start) {
          e = -1;
          break;
        }
      }
      if (e === -1) continue;
      let t2 = this._addTriangle(e, i, hullNext[e], -1, -1, hullTri[e]);
      hullTri[i] = this._legalize(t2 + 2);
      hullTri[e] = t2;
      hullSize++;
      let n3 = hullNext[e];
      while (q2 = hullNext[n3], orient2d(x2, y2, coords[2 * n3], coords[2 * n3 + 1], coords[2 * q2], coords[2 * q2 + 1]) < 0) {
        t2 = this._addTriangle(n3, i, q2, hullTri[i], -1, hullTri[n3]);
        hullTri[i] = this._legalize(t2 + 2);
        hullNext[n3] = n3;
        hullSize--;
        n3 = q2;
      }
      if (e === start) {
        while (q2 = hullPrev[e], orient2d(x2, y2, coords[2 * q2], coords[2 * q2 + 1], coords[2 * e], coords[2 * e + 1]) < 0) {
          t2 = this._addTriangle(q2, i, e, -1, hullTri[e], hullTri[q2]);
          this._legalize(t2 + 2);
          hullTri[q2] = t2;
          hullNext[e] = e;
          hullSize--;
          e = q2;
        }
      }
      this._hullStart = hullPrev[i] = e;
      hullNext[e] = hullPrev[n3] = i;
      hullNext[i] = n3;
      hullHash[this._hashKey(x2, y2)] = i;
      hullHash[this._hashKey(coords[2 * e], coords[2 * e + 1])] = e;
    }
    this.hull = new Uint32Array(hullSize);
    for (let i = 0, e = this._hullStart; i < hullSize; i++) {
      this.hull[i] = e;
      e = hullNext[e];
    }
    this.triangles = this._triangles.subarray(0, this.trianglesLen);
    this.halfedges = this._halfedges.subarray(0, this.trianglesLen);
  }
  /**
   * Calculate an angle-based key for the edge hash used for advancing convex hull.
   *
   * @param {number} x
   * @param {number} y
   * @private
   */
  _hashKey(x2, y2) {
    return Math.floor(pseudoAngle(x2 - this._cx, y2 - this._cy) * this._hashSize) % this._hashSize;
  }
  /**
   * Flip an edge in a pair of triangles if it doesn't satisfy the Delaunay condition.
   *
   * @param {number} a
   * @private
   */
  _legalize(a) {
    const { _triangles: triangles, _halfedges: halfedges, coords } = this;
    let i = 0;
    let ar2 = 0;
    while (true) {
      const b = halfedges[a];
      const a0 = a - a % 3;
      ar2 = a0 + (a + 2) % 3;
      if (b === -1) {
        if (i === 0) break;
        a = EDGE_STACK[--i];
        continue;
      }
      const b0 = b - b % 3;
      const al = a0 + (a + 1) % 3;
      const bl = b0 + (b + 2) % 3;
      const p0 = triangles[ar2];
      const pr = triangles[a];
      const pl = triangles[al];
      const p1 = triangles[bl];
      const illegal = inCircle(
        coords[2 * p0],
        coords[2 * p0 + 1],
        coords[2 * pr],
        coords[2 * pr + 1],
        coords[2 * pl],
        coords[2 * pl + 1],
        coords[2 * p1],
        coords[2 * p1 + 1]
      );
      if (illegal) {
        triangles[a] = p1;
        triangles[b] = p0;
        const hbl = halfedges[bl];
        if (hbl === -1) {
          let e = this._hullStart;
          do {
            if (this._hullTri[e] === bl) {
              this._hullTri[e] = a;
              break;
            }
            e = this._hullPrev[e];
          } while (e !== this._hullStart);
        }
        this._link(a, hbl);
        this._link(b, halfedges[ar2]);
        this._link(ar2, bl);
        const br = b0 + (b + 1) % 3;
        if (i < EDGE_STACK.length) {
          EDGE_STACK[i++] = br;
        }
      } else {
        if (i === 0) break;
        a = EDGE_STACK[--i];
      }
    }
    return ar2;
  }
  /**
   * Link two half-edges to each other.
   * @param {number} a
   * @param {number} b
   * @private
   */
  _link(a, b) {
    this._halfedges[a] = b;
    if (b !== -1) this._halfedges[b] = a;
  }
  /**
   * Add a new triangle given vertex indices and adjacent half-edge ids.
   *
   * @param {number} i0
   * @param {number} i1
   * @param {number} i2
   * @param {number} a
   * @param {number} b
   * @param {number} c
   * @private
   */
  _addTriangle(i0, i1, i2, a, b, c) {
    const t2 = this.trianglesLen;
    this._triangles[t2] = i0;
    this._triangles[t2 + 1] = i1;
    this._triangles[t2 + 2] = i2;
    this._link(t2, a);
    this._link(t2 + 1, b);
    this._link(t2 + 2, c);
    this.trianglesLen += 3;
    return t2;
  }
}
function pseudoAngle(dx, dy) {
  const p = dx / (Math.abs(dx) + Math.abs(dy));
  return (dy > 0 ? 3 - p : 1 + p) / 4;
}
function dist(ax, ay, bx, by) {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}
function inCircle(ax, ay, bx, by, cx, cy, px, py) {
  const dx = ax - px;
  const dy = ay - py;
  const ex = bx - px;
  const ey = by - py;
  const fx = cx - px;
  const fy = cy - py;
  const ap = dx * dx + dy * dy;
  const bp = ex * ex + ey * ey;
  const cp = fx * fx + fy * fy;
  return dx * (ey * cp - bp * fy) - dy * (ex * cp - bp * fx) + ap * (ex * fy - ey * fx) < 0;
}
function circumradius(ax, ay, bx, by, cx, cy) {
  const dx = bx - ax;
  const dy = by - ay;
  const ex = cx - ax;
  const ey = cy - ay;
  const bl = dx * dx + dy * dy;
  const cl = ex * ex + ey * ey;
  const d = 0.5 / (dx * ey - dy * ex);
  const x2 = (ey * bl - dy * cl) * d;
  const y2 = (dx * cl - ex * bl) * d;
  return x2 * x2 + y2 * y2;
}
function circumcenter(ax, ay, bx, by, cx, cy) {
  const dx = bx - ax;
  const dy = by - ay;
  const ex = cx - ax;
  const ey = cy - ay;
  const bl = dx * dx + dy * dy;
  const cl = ex * ex + ey * ey;
  const d = 0.5 / (dx * ey - dy * ex);
  const x2 = ax + (ey * bl - dy * cl) * d;
  const y2 = ay + (dx * cl - ex * bl) * d;
  return { x: x2, y: y2 };
}
function quicksort(ids, dists, left, right) {
  if (right - left <= 20) {
    for (let i = left + 1; i <= right; i++) {
      const temp = ids[i];
      const tempDist = dists[temp];
      let j2 = i - 1;
      while (j2 >= left && dists[ids[j2]] > tempDist) ids[j2 + 1] = ids[j2--];
      ids[j2 + 1] = temp;
    }
  } else {
    const median = left + right >> 1;
    let i = left + 1;
    let j2 = right;
    swap(ids, median, i);
    if (dists[ids[left]] > dists[ids[right]]) swap(ids, left, right);
    if (dists[ids[i]] > dists[ids[right]]) swap(ids, i, right);
    if (dists[ids[left]] > dists[ids[i]]) swap(ids, left, i);
    const temp = ids[i];
    const tempDist = dists[temp];
    while (true) {
      do
        i++;
      while (dists[ids[i]] < tempDist);
      do
        j2--;
      while (dists[ids[j2]] > tempDist);
      if (j2 < i) break;
      swap(ids, i, j2);
    }
    ids[left + 1] = ids[j2];
    ids[j2] = temp;
    if (right - i + 1 >= j2 - left) {
      quicksort(ids, dists, i, right);
      quicksort(ids, dists, left, j2 - 1);
    } else {
      quicksort(ids, dists, left, j2 - 1);
      quicksort(ids, dists, i, right);
    }
  }
}
function swap(arr, i, j2) {
  const tmp = arr[i];
  arr[i] = arr[j2];
  arr[j2] = tmp;
}
function defaultGetX(p) {
  return p[0];
}
function defaultGetY(p) {
  return p[1];
}
const epsilon = 1e-6;
class Path {
  constructor() {
    this._x0 = this._y0 = // start of current subpath
    this._x1 = this._y1 = null;
    this._ = "";
  }
  moveTo(x2, y2) {
    this._ += `M${this._x0 = this._x1 = +x2},${this._y0 = this._y1 = +y2}`;
  }
  closePath() {
    if (this._x1 !== null) {
      this._x1 = this._x0, this._y1 = this._y0;
      this._ += "Z";
    }
  }
  lineTo(x2, y2) {
    this._ += `L${this._x1 = +x2},${this._y1 = +y2}`;
  }
  arc(x2, y2, r) {
    x2 = +x2, y2 = +y2, r = +r;
    const x0 = x2 + r;
    const y0 = y2;
    if (r < 0) throw new Error("negative radius");
    if (this._x1 === null) this._ += `M${x0},${y0}`;
    else if (Math.abs(this._x1 - x0) > epsilon || Math.abs(this._y1 - y0) > epsilon) this._ += "L" + x0 + "," + y0;
    if (!r) return;
    this._ += `A${r},${r},0,1,1,${x2 - r},${y2}A${r},${r},0,1,1,${this._x1 = x0},${this._y1 = y0}`;
  }
  rect(x2, y2, w2, h) {
    this._ += `M${this._x0 = this._x1 = +x2},${this._y0 = this._y1 = +y2}h${+w2}v${+h}h${-w2}Z`;
  }
  value() {
    return this._ || null;
  }
}
class Polygon {
  constructor() {
    this._ = [];
  }
  moveTo(x2, y2) {
    this._.push([x2, y2]);
  }
  closePath() {
    this._.push(this._[0].slice());
  }
  lineTo(x2, y2) {
    this._.push([x2, y2]);
  }
  value() {
    return this._.length ? this._ : null;
  }
}
class Voronoi {
  constructor(delaunay, [xmin, ymin, xmax, ymax] = [0, 0, 960, 500]) {
    if (!((xmax = +xmax) >= (xmin = +xmin)) || !((ymax = +ymax) >= (ymin = +ymin))) throw new Error("invalid bounds");
    this.delaunay = delaunay;
    this._circumcenters = new Float64Array(delaunay.points.length * 2);
    this.vectors = new Float64Array(delaunay.points.length * 2);
    this.xmax = xmax, this.xmin = xmin;
    this.ymax = ymax, this.ymin = ymin;
    this._init();
  }
  update() {
    this.delaunay.update();
    this._init();
    return this;
  }
  _init() {
    const { delaunay: { points, hull, triangles }, vectors } = this;
    let bx, by;
    const circumcenters = this.circumcenters = this._circumcenters.subarray(0, triangles.length / 3 * 2);
    for (let i = 0, j2 = 0, n2 = triangles.length, x2, y2; i < n2; i += 3, j2 += 2) {
      const t1 = triangles[i] * 2;
      const t2 = triangles[i + 1] * 2;
      const t3 = triangles[i + 2] * 2;
      const x12 = points[t1];
      const y12 = points[t1 + 1];
      const x22 = points[t2];
      const y22 = points[t2 + 1];
      const x3 = points[t3];
      const y3 = points[t3 + 1];
      const dx = x22 - x12;
      const dy = y22 - y12;
      const ex = x3 - x12;
      const ey = y3 - y12;
      const ab = (dx * ey - dy * ex) * 2;
      if (Math.abs(ab) < 1e-9) {
        if (bx === void 0) {
          bx = by = 0;
          for (const i2 of hull) bx += points[i2 * 2], by += points[i2 * 2 + 1];
          bx /= hull.length, by /= hull.length;
        }
        const a = 1e9 * Math.sign((bx - x12) * ey - (by - y12) * ex);
        x2 = (x12 + x3) / 2 - a * ey;
        y2 = (y12 + y3) / 2 + a * ex;
      } else {
        const d = 1 / ab;
        const bl = dx * dx + dy * dy;
        const cl = ex * ex + ey * ey;
        x2 = x12 + (ey * bl - dy * cl) * d;
        y2 = y12 + (dx * cl - ex * bl) * d;
      }
      circumcenters[j2] = x2;
      circumcenters[j2 + 1] = y2;
    }
    let h = hull[hull.length - 1];
    let p0, p1 = h * 4;
    let x0, x1 = points[2 * h];
    let y0, y1 = points[2 * h + 1];
    vectors.fill(0);
    for (let i = 0; i < hull.length; ++i) {
      h = hull[i];
      p0 = p1, x0 = x1, y0 = y1;
      p1 = h * 4, x1 = points[2 * h], y1 = points[2 * h + 1];
      vectors[p0 + 2] = vectors[p1] = y0 - y1;
      vectors[p0 + 3] = vectors[p1 + 1] = x1 - x0;
    }
  }
  render(context) {
    const buffer = context == null ? context = new Path() : void 0;
    const { delaunay: { halfedges, inedges, hull }, circumcenters, vectors } = this;
    if (hull.length <= 1) return null;
    for (let i = 0, n2 = halfedges.length; i < n2; ++i) {
      const j2 = halfedges[i];
      if (j2 < i) continue;
      const ti = Math.floor(i / 3) * 2;
      const tj = Math.floor(j2 / 3) * 2;
      const xi = circumcenters[ti];
      const yi = circumcenters[ti + 1];
      const xj = circumcenters[tj];
      const yj = circumcenters[tj + 1];
      this._renderSegment(xi, yi, xj, yj, context);
    }
    let h0, h1 = hull[hull.length - 1];
    for (let i = 0; i < hull.length; ++i) {
      h0 = h1, h1 = hull[i];
      const t2 = Math.floor(inedges[h1] / 3) * 2;
      const x2 = circumcenters[t2];
      const y2 = circumcenters[t2 + 1];
      const v = h0 * 4;
      const p = this._project(x2, y2, vectors[v + 2], vectors[v + 3]);
      if (p) this._renderSegment(x2, y2, p[0], p[1], context);
    }
    return buffer && buffer.value();
  }
  renderBounds(context) {
    const buffer = context == null ? context = new Path() : void 0;
    context.rect(this.xmin, this.ymin, this.xmax - this.xmin, this.ymax - this.ymin);
    return buffer && buffer.value();
  }
  renderCell(i, context) {
    const buffer = context == null ? context = new Path() : void 0;
    const points = this._clip(i);
    if (points === null || !points.length) return;
    context.moveTo(points[0], points[1]);
    let n2 = points.length;
    while (points[0] === points[n2 - 2] && points[1] === points[n2 - 1] && n2 > 1) n2 -= 2;
    for (let i2 = 2; i2 < n2; i2 += 2) {
      if (points[i2] !== points[i2 - 2] || points[i2 + 1] !== points[i2 - 1])
        context.lineTo(points[i2], points[i2 + 1]);
    }
    context.closePath();
    return buffer && buffer.value();
  }
  *cellPolygons() {
    const { delaunay: { points } } = this;
    for (let i = 0, n2 = points.length / 2; i < n2; ++i) {
      const cell = this.cellPolygon(i);
      if (cell) cell.index = i, yield cell;
    }
  }
  cellPolygon(i) {
    const polygon = new Polygon();
    this.renderCell(i, polygon);
    return polygon.value();
  }
  _renderSegment(x0, y0, x1, y1, context) {
    let S2;
    const c0 = this._regioncode(x0, y0);
    const c1 = this._regioncode(x1, y1);
    if (c0 === 0 && c1 === 0) {
      context.moveTo(x0, y0);
      context.lineTo(x1, y1);
    } else if (S2 = this._clipSegment(x0, y0, x1, y1, c0, c1)) {
      context.moveTo(S2[0], S2[1]);
      context.lineTo(S2[2], S2[3]);
    }
  }
  contains(i, x2, y2) {
    if ((x2 = +x2, x2 !== x2) || (y2 = +y2, y2 !== y2)) return false;
    return this.delaunay._step(i, x2, y2) === i;
  }
  *neighbors(i) {
    const ci = this._clip(i);
    if (ci) for (const j2 of this.delaunay.neighbors(i)) {
      const cj = this._clip(j2);
      if (cj) loop: for (let ai = 0, li = ci.length; ai < li; ai += 2) {
        for (let aj = 0, lj = cj.length; aj < lj; aj += 2) {
          if (ci[ai] === cj[aj] && ci[ai + 1] === cj[aj + 1] && ci[(ai + 2) % li] === cj[(aj + lj - 2) % lj] && ci[(ai + 3) % li] === cj[(aj + lj - 1) % lj]) {
            yield j2;
            break loop;
          }
        }
      }
    }
  }
  _cell(i) {
    const { circumcenters, delaunay: { inedges, halfedges, triangles } } = this;
    const e0 = inedges[i];
    if (e0 === -1) return null;
    const points = [];
    let e = e0;
    do {
      const t2 = Math.floor(e / 3);
      points.push(circumcenters[t2 * 2], circumcenters[t2 * 2 + 1]);
      e = e % 3 === 2 ? e - 2 : e + 1;
      if (triangles[e] !== i) break;
      e = halfedges[e];
    } while (e !== e0 && e !== -1);
    return points;
  }
  _clip(i) {
    if (i === 0 && this.delaunay.hull.length === 1) {
      return [this.xmax, this.ymin, this.xmax, this.ymax, this.xmin, this.ymax, this.xmin, this.ymin];
    }
    const points = this._cell(i);
    if (points === null) return null;
    const { vectors: V2 } = this;
    const v = i * 4;
    return this._simplify(V2[v] || V2[v + 1] ? this._clipInfinite(i, points, V2[v], V2[v + 1], V2[v + 2], V2[v + 3]) : this._clipFinite(i, points));
  }
  _clipFinite(i, points) {
    const n2 = points.length;
    let P2 = null;
    let x0, y0, x1 = points[n2 - 2], y1 = points[n2 - 1];
    let c0, c1 = this._regioncode(x1, y1);
    let e0, e1 = 0;
    for (let j2 = 0; j2 < n2; j2 += 2) {
      x0 = x1, y0 = y1, x1 = points[j2], y1 = points[j2 + 1];
      c0 = c1, c1 = this._regioncode(x1, y1);
      if (c0 === 0 && c1 === 0) {
        e0 = e1, e1 = 0;
        if (P2) P2.push(x1, y1);
        else P2 = [x1, y1];
      } else {
        let S2, sx0, sy0, sx1, sy1;
        if (c0 === 0) {
          if ((S2 = this._clipSegment(x0, y0, x1, y1, c0, c1)) === null) continue;
          [sx0, sy0, sx1, sy1] = S2;
        } else {
          if ((S2 = this._clipSegment(x1, y1, x0, y0, c1, c0)) === null) continue;
          [sx1, sy1, sx0, sy0] = S2;
          e0 = e1, e1 = this._edgecode(sx0, sy0);
          if (e0 && e1) this._edge(i, e0, e1, P2, P2.length);
          if (P2) P2.push(sx0, sy0);
          else P2 = [sx0, sy0];
        }
        e0 = e1, e1 = this._edgecode(sx1, sy1);
        if (e0 && e1) this._edge(i, e0, e1, P2, P2.length);
        if (P2) P2.push(sx1, sy1);
        else P2 = [sx1, sy1];
      }
    }
    if (P2) {
      e0 = e1, e1 = this._edgecode(P2[0], P2[1]);
      if (e0 && e1) this._edge(i, e0, e1, P2, P2.length);
    } else if (this.contains(i, (this.xmin + this.xmax) / 2, (this.ymin + this.ymax) / 2)) {
      return [this.xmax, this.ymin, this.xmax, this.ymax, this.xmin, this.ymax, this.xmin, this.ymin];
    }
    return P2;
  }
  _clipSegment(x0, y0, x1, y1, c0, c1) {
    const flip = c0 < c1;
    if (flip) [x0, y0, x1, y1, c0, c1] = [x1, y1, x0, y0, c1, c0];
    while (true) {
      if (c0 === 0 && c1 === 0) return flip ? [x1, y1, x0, y0] : [x0, y0, x1, y1];
      if (c0 & c1) return null;
      let x2, y2, c = c0 || c1;
      if (c & 8) x2 = x0 + (x1 - x0) * (this.ymax - y0) / (y1 - y0), y2 = this.ymax;
      else if (c & 4) x2 = x0 + (x1 - x0) * (this.ymin - y0) / (y1 - y0), y2 = this.ymin;
      else if (c & 2) y2 = y0 + (y1 - y0) * (this.xmax - x0) / (x1 - x0), x2 = this.xmax;
      else y2 = y0 + (y1 - y0) * (this.xmin - x0) / (x1 - x0), x2 = this.xmin;
      if (c0) x0 = x2, y0 = y2, c0 = this._regioncode(x0, y0);
      else x1 = x2, y1 = y2, c1 = this._regioncode(x1, y1);
    }
  }
  _clipInfinite(i, points, vx0, vy0, vxn, vyn) {
    let P2 = Array.from(points), p;
    if (p = this._project(P2[0], P2[1], vx0, vy0)) P2.unshift(p[0], p[1]);
    if (p = this._project(P2[P2.length - 2], P2[P2.length - 1], vxn, vyn)) P2.push(p[0], p[1]);
    if (P2 = this._clipFinite(i, P2)) {
      for (let j2 = 0, n2 = P2.length, c0, c1 = this._edgecode(P2[n2 - 2], P2[n2 - 1]); j2 < n2; j2 += 2) {
        c0 = c1, c1 = this._edgecode(P2[j2], P2[j2 + 1]);
        if (c0 && c1) j2 = this._edge(i, c0, c1, P2, j2), n2 = P2.length;
      }
    } else if (this.contains(i, (this.xmin + this.xmax) / 2, (this.ymin + this.ymax) / 2)) {
      P2 = [this.xmin, this.ymin, this.xmax, this.ymin, this.xmax, this.ymax, this.xmin, this.ymax];
    }
    return P2;
  }
  _edge(i, e0, e1, P2, j2) {
    while (e0 !== e1) {
      let x2, y2;
      switch (e0) {
        case 5:
          e0 = 4;
          continue;
        // top-left
        case 4:
          e0 = 6, x2 = this.xmax, y2 = this.ymin;
          break;
        // top
        case 6:
          e0 = 2;
          continue;
        // top-right
        case 2:
          e0 = 10, x2 = this.xmax, y2 = this.ymax;
          break;
        // right
        case 10:
          e0 = 8;
          continue;
        // bottom-right
        case 8:
          e0 = 9, x2 = this.xmin, y2 = this.ymax;
          break;
        // bottom
        case 9:
          e0 = 1;
          continue;
        // bottom-left
        case 1:
          e0 = 5, x2 = this.xmin, y2 = this.ymin;
          break;
      }
      if ((P2[j2] !== x2 || P2[j2 + 1] !== y2) && this.contains(i, x2, y2)) {
        P2.splice(j2, 0, x2, y2), j2 += 2;
      }
    }
    return j2;
  }
  _project(x0, y0, vx, vy) {
    let t2 = Infinity, c, x2, y2;
    if (vy < 0) {
      if (y0 <= this.ymin) return null;
      if ((c = (this.ymin - y0) / vy) < t2) y2 = this.ymin, x2 = x0 + (t2 = c) * vx;
    } else if (vy > 0) {
      if (y0 >= this.ymax) return null;
      if ((c = (this.ymax - y0) / vy) < t2) y2 = this.ymax, x2 = x0 + (t2 = c) * vx;
    }
    if (vx > 0) {
      if (x0 >= this.xmax) return null;
      if ((c = (this.xmax - x0) / vx) < t2) x2 = this.xmax, y2 = y0 + (t2 = c) * vy;
    } else if (vx < 0) {
      if (x0 <= this.xmin) return null;
      if ((c = (this.xmin - x0) / vx) < t2) x2 = this.xmin, y2 = y0 + (t2 = c) * vy;
    }
    return [x2, y2];
  }
  _edgecode(x2, y2) {
    return (x2 === this.xmin ? 1 : x2 === this.xmax ? 2 : 0) | (y2 === this.ymin ? 4 : y2 === this.ymax ? 8 : 0);
  }
  _regioncode(x2, y2) {
    return (x2 < this.xmin ? 1 : x2 > this.xmax ? 2 : 0) | (y2 < this.ymin ? 4 : y2 > this.ymax ? 8 : 0);
  }
  _simplify(P2) {
    if (P2 && P2.length > 4) {
      for (let i = 0; i < P2.length; i += 2) {
        const j2 = (i + 2) % P2.length, k = (i + 4) % P2.length;
        if (P2[i] === P2[j2] && P2[j2] === P2[k] || P2[i + 1] === P2[j2 + 1] && P2[j2 + 1] === P2[k + 1]) {
          P2.splice(j2, 2), i -= 2;
        }
      }
      if (!P2.length) P2 = null;
    }
    return P2;
  }
}
const tau = 2 * Math.PI, pow = Math.pow;
function pointX(p) {
  return p[0];
}
function pointY(p) {
  return p[1];
}
function collinear(d) {
  const { triangles, coords } = d;
  for (let i = 0; i < triangles.length; i += 3) {
    const a = 2 * triangles[i], b = 2 * triangles[i + 1], c = 2 * triangles[i + 2], cross = (coords[c] - coords[a]) * (coords[b + 1] - coords[a + 1]) - (coords[b] - coords[a]) * (coords[c + 1] - coords[a + 1]);
    if (cross > 1e-10) return false;
  }
  return true;
}
function jitter(x2, y2, r) {
  return [x2 + Math.sin(x2 + y2) * r, y2 + Math.cos(x2 - y2) * r];
}
class Delaunay {
  static from(points, fx = pointX, fy = pointY, that) {
    return new Delaunay("length" in points ? flatArray(points, fx, fy, that) : Float64Array.from(flatIterable(points, fx, fy, that)));
  }
  constructor(points) {
    this._delaunator = new Delaunator(points);
    this.inedges = new Int32Array(points.length / 2);
    this._hullIndex = new Int32Array(points.length / 2);
    this.points = this._delaunator.coords;
    this._init();
  }
  update() {
    this._delaunator.update();
    this._init();
    return this;
  }
  _init() {
    const d = this._delaunator, points = this.points;
    if (d.hull && d.hull.length > 2 && collinear(d)) {
      this.collinear = Int32Array.from({ length: points.length / 2 }, (_2, i) => i).sort((i, j2) => points[2 * i] - points[2 * j2] || points[2 * i + 1] - points[2 * j2 + 1]);
      const e = this.collinear[0], f = this.collinear[this.collinear.length - 1], bounds = [points[2 * e], points[2 * e + 1], points[2 * f], points[2 * f + 1]], r = 1e-8 * Math.hypot(bounds[3] - bounds[1], bounds[2] - bounds[0]);
      for (let i = 0, n2 = points.length / 2; i < n2; ++i) {
        const p = jitter(points[2 * i], points[2 * i + 1], r);
        points[2 * i] = p[0];
        points[2 * i + 1] = p[1];
      }
      this._delaunator = new Delaunator(points);
    } else {
      delete this.collinear;
    }
    const halfedges = this.halfedges = this._delaunator.halfedges;
    const hull = this.hull = this._delaunator.hull;
    const triangles = this.triangles = this._delaunator.triangles;
    const inedges = this.inedges.fill(-1);
    const hullIndex = this._hullIndex.fill(-1);
    for (let e = 0, n2 = halfedges.length; e < n2; ++e) {
      const p = triangles[e % 3 === 2 ? e - 2 : e + 1];
      if (halfedges[e] === -1 || inedges[p] === -1) inedges[p] = e;
    }
    for (let i = 0, n2 = hull.length; i < n2; ++i) {
      hullIndex[hull[i]] = i;
    }
    if (hull.length <= 2 && hull.length > 0) {
      this.triangles = new Int32Array(3).fill(-1);
      this.halfedges = new Int32Array(3).fill(-1);
      this.triangles[0] = hull[0];
      inedges[hull[0]] = 1;
      if (hull.length === 2) {
        inedges[hull[1]] = 0;
        this.triangles[1] = hull[1];
        this.triangles[2] = hull[1];
      }
    }
  }
  voronoi(bounds) {
    return new Voronoi(this, bounds);
  }
  *neighbors(i) {
    const { inedges, hull, _hullIndex, halfedges, triangles, collinear: collinear2 } = this;
    if (collinear2) {
      const l = collinear2.indexOf(i);
      if (l > 0) yield collinear2[l - 1];
      if (l < collinear2.length - 1) yield collinear2[l + 1];
      return;
    }
    const e0 = inedges[i];
    if (e0 === -1) return;
    let e = e0, p0 = -1;
    do {
      yield p0 = triangles[e];
      e = e % 3 === 2 ? e - 2 : e + 1;
      if (triangles[e] !== i) return;
      e = halfedges[e];
      if (e === -1) {
        const p = hull[(_hullIndex[i] + 1) % hull.length];
        if (p !== p0) yield p;
        return;
      }
    } while (e !== e0);
  }
  find(x2, y2, i = 0) {
    if ((x2 = +x2, x2 !== x2) || (y2 = +y2, y2 !== y2)) return -1;
    const i0 = i;
    let c;
    while ((c = this._step(i, x2, y2)) >= 0 && c !== i && c !== i0) i = c;
    return c;
  }
  _step(i, x2, y2) {
    const { inedges, hull, _hullIndex, halfedges, triangles, points } = this;
    if (inedges[i] === -1 || !points.length) return (i + 1) % (points.length >> 1);
    let c = i;
    let dc = pow(x2 - points[i * 2], 2) + pow(y2 - points[i * 2 + 1], 2);
    const e0 = inedges[i];
    let e = e0;
    do {
      let t2 = triangles[e];
      const dt = pow(x2 - points[t2 * 2], 2) + pow(y2 - points[t2 * 2 + 1], 2);
      if (dt < dc) dc = dt, c = t2;
      e = e % 3 === 2 ? e - 2 : e + 1;
      if (triangles[e] !== i) break;
      e = halfedges[e];
      if (e === -1) {
        e = hull[(_hullIndex[i] + 1) % hull.length];
        if (e !== t2) {
          if (pow(x2 - points[e * 2], 2) + pow(y2 - points[e * 2 + 1], 2) < dc) return e;
        }
        break;
      }
    } while (e !== e0);
    return c;
  }
  render(context) {
    const buffer = context == null ? context = new Path() : void 0;
    const { points, halfedges, triangles } = this;
    for (let i = 0, n2 = halfedges.length; i < n2; ++i) {
      const j2 = halfedges[i];
      if (j2 < i) continue;
      const ti = triangles[i] * 2;
      const tj = triangles[j2] * 2;
      context.moveTo(points[ti], points[ti + 1]);
      context.lineTo(points[tj], points[tj + 1]);
    }
    this.renderHull(context);
    return buffer && buffer.value();
  }
  renderPoints(context, r) {
    if (r === void 0 && (!context || typeof context.moveTo !== "function")) r = context, context = null;
    r = r == void 0 ? 2 : +r;
    const buffer = context == null ? context = new Path() : void 0;
    const { points } = this;
    for (let i = 0, n2 = points.length; i < n2; i += 2) {
      const x2 = points[i], y2 = points[i + 1];
      context.moveTo(x2 + r, y2);
      context.arc(x2, y2, r, 0, tau);
    }
    return buffer && buffer.value();
  }
  renderHull(context) {
    const buffer = context == null ? context = new Path() : void 0;
    const { hull, points } = this;
    const h = hull[0] * 2, n2 = hull.length;
    context.moveTo(points[h], points[h + 1]);
    for (let i = 1; i < n2; ++i) {
      const h2 = 2 * hull[i];
      context.lineTo(points[h2], points[h2 + 1]);
    }
    context.closePath();
    return buffer && buffer.value();
  }
  hullPolygon() {
    const polygon = new Polygon();
    this.renderHull(polygon);
    return polygon.value();
  }
  renderTriangle(i, context) {
    const buffer = context == null ? context = new Path() : void 0;
    const { points, triangles } = this;
    const t0 = triangles[i *= 3] * 2;
    const t1 = triangles[i + 1] * 2;
    const t2 = triangles[i + 2] * 2;
    context.moveTo(points[t0], points[t0 + 1]);
    context.lineTo(points[t1], points[t1 + 1]);
    context.lineTo(points[t2], points[t2 + 1]);
    context.closePath();
    return buffer && buffer.value();
  }
  *trianglePolygons() {
    const { triangles } = this;
    for (let i = 0, n2 = triangles.length / 3; i < n2; ++i) {
      yield this.trianglePolygon(i);
    }
  }
  trianglePolygon(i) {
    const polygon = new Polygon();
    this.renderTriangle(i, polygon);
    return polygon.value();
  }
}
function flatArray(points, fx, fy, that) {
  const n2 = points.length;
  const array2 = new Float64Array(n2 * 2);
  for (let i = 0; i < n2; ++i) {
    const p = points[i];
    array2[i * 2] = fx.call(that, p, i, points);
    array2[i * 2 + 1] = fy.call(that, p, i, points);
  }
  return array2;
}
function* flatIterable(points, fx, fy, that) {
  let i = 0;
  for (const p of points) {
    yield fx.call(that, p, i, points);
    yield fy.call(that, p, i, points);
    ++i;
  }
}
function C() {
  return C = Object.assign ? Object.assign.bind() : function(n2) {
    for (var o = 1; o < arguments.length; o++) {
      var e = arguments[o];
      for (var i in e) ({}).hasOwnProperty.call(e, i) && (n2[i] = e[i]);
    }
    return n2;
  }, C.apply(null, arguments);
}
function y(n2, o) {
  if (null == n2) return {};
  var e = {};
  for (var i in n2) if ({}.hasOwnProperty.call(n2, i)) {
    if (-1 !== o.indexOf(i)) continue;
    e[i] = n2[i];
  }
  return e;
}
var w = { xDomain: [0, 1], yDomain: [0, 1], layers: ["links", "cells", "points", "bounds"], enableLinks: false, linkLineWidth: 1, linkLineColor: "#bbbbbb", enableCells: true, cellLineWidth: 2, cellLineColor: "#000000", pointSize: 4, pointColor: "#666666", role: "img" }, D = function(n2) {
  return [n2.x, n2.y];
}, L = un, T = "cursor", P = "top", R = function(n2) {
  var o = n2.points, e = n2.getNodePosition, i = void 0 === e ? D : e, t2 = n2.margin, l = void 0 === t2 ? L : t2;
  return o.map((function(n3) {
    var o2 = i(n3), e2 = o2[0], t3 = o2[1];
    return [e2 + l.left, t3 + l.top];
  }));
}, W = function(n2) {
  var o = n2.points, e = n2.width, i = n2.height, t2 = n2.margin, l = void 0 === t2 ? L : t2, r = n2.debug, u2 = Delaunay.from(o), a = r ? u2.voronoi([0, 0, l.left + e + l.right, l.top + i + l.bottom]) : void 0;
  return { points: o, delaunay: u2, voronoi: a };
}, E = function(o) {
  var e = o.points, i = o.getNodePosition, t2 = void 0 === i ? D : i, l = o.width, r = o.height, u2 = o.margin, a = void 0 === u2 ? L : u2, d = o.debug;
  return reactExports.useMemo((function() {
    return W({ points: R({ points: e, margin: a, getNodePosition: t2 }), width: l, height: r, margin: a, debug: d });
  }), [t2, e, l, r, a, d]);
}, x = function(o) {
  var e = o.data, i = o.width, t2 = o.height, l = o.xDomain, r = o.yDomain, u2 = reactExports.useMemo((function() {
    return linear().domain(l).range([0, i]);
  }), [l, i]), a = reactExports.useMemo((function() {
    return linear().domain(r).range([0, t2]);
  }), [r, t2]), d = reactExports.useMemo((function() {
    return e.map((function(n2) {
      return { x: u2(n2.x), y: a(n2.y), data: n2 };
    }));
  }), [e, u2, a]);
  return reactExports.useMemo((function() {
    var n2 = Delaunay.from(d.map((function(n3) {
      return [n3.x, n3.y];
    }))), o2 = n2.voronoi([0, 0, i, t2]);
    return { points: d, delaunay: n2, voronoi: o2 };
  }), [d, i, t2]);
}, S = function(o) {
  var e = o.points, i = o.delaunay, t2 = o.voronoi;
  return reactExports.useMemo((function() {
    return { points: e, delaunay: i, voronoi: t2 };
  }), [e, i, t2]);
}, U = function(l) {
  var r = l.elementRef, u2 = l.nodes, a = l.getNodePosition, h = void 0 === a ? D : a, c = l.delaunay, v = l.setCurrent, f = l.margin, p = void 0 === f ? L : f, g = l.detectionRadius, m = void 0 === g ? 1 / 0 : g, b = l.isInteractive, k = void 0 === b || b, C3 = l.onMouseEnter, y2 = l.onMouseMove, w2 = l.onMouseLeave, R2 = l.onMouseDown, W2 = l.onMouseUp, E2 = l.onClick, x2 = l.onDoubleClick, S2 = l.onTouchStart, U2 = l.onTouchMove, z$1 = l.onTouchEnd, A2 = l.enableTouchCrosshair, N2 = void 0 !== A2 && A2, H2 = l.tooltip, O2 = l.tooltipPosition, I = void 0 === O2 ? T : O2, j2 = l.tooltipAnchor, F2 = void 0 === j2 ? P : j2, B2 = reactExports.useState(null), q2 = B2[0], G = B2[1], J = reactExports.useRef(null);
  reactExports.useEffect((function() {
    J.current = q2;
  }), [J, q2]);
  var K = reactExports.useCallback((function(n2) {
    if (!r.current || 0 === u2.length) return null;
    var o = kn(r.current, n2), e = o[0], i = o[1], t2 = c.find(e, i), l2 = void 0 !== t2 ? u2[t2] : null;
    if (l2 && m !== 1 / 0) {
      var a2 = h(l2), v2 = a2[0], f2 = a2[1];
      yn(e, i, v2 + p.left, f2 + p.top) > m && (t2 = null, l2 = null);
    }
    return null === t2 || null === l2 ? null : [t2, l2];
  }), [r, c, u2, h, p, m]), Q = z(), V2 = Q.showTooltipAt, X = Q.showTooltipFromEvent, Y2 = Q.hideTooltip, Z = reactExports.useMemo((function() {
    if (H2) return "cursor" === I ? function(n2, o) {
      X(H2(n2), o, F2);
    } : function(n2) {
      var o = h(n2), e = o[0], i = o[1];
      V2(H2(n2), [e + p.left, i + p.top], F2);
    };
  }), [V2, X, H2, I, F2, h, p]), $2 = reactExports.useCallback((function(n2) {
    var o = K(n2);
    if (G(o), null == v || v(o ? o[1] : null), o) {
      var e = o[1];
      null == Z || Z(e, n2), null == C3 || C3(o[1], n2);
    }
  }), [K, G, v, Z, C3]), _2 = reactExports.useCallback((function(n2) {
    var o = K(n2);
    if (G(o), o) {
      var e = o[0], i = o[1];
      if (null == v || v(i), null == Z || Z(i, n2), J.current) {
        var t2 = J.current, l2 = t2[0], r2 = t2[1];
        e !== l2 ? null == w2 || w2(r2, n2) : null == y2 || y2(i, n2);
      } else null == C3 || C3(i, n2);
    } else null == v || v(null), null == Y2 || Y2(), J.current && (null == w2 || w2(J.current[1], n2));
  }), [K, G, v, J, C3, y2, w2, Z, Y2]), nn = reactExports.useCallback((function(n2) {
    G(null), null == v || v(null), Y2(), w2 && J.current && w2(J.current[1], n2);
  }), [G, v, J, Y2, w2]), on = reactExports.useCallback((function(n2) {
    var o = K(n2);
    G(o), o && (null == R2 || R2(o[1], n2));
  }), [K, G, R2]), en = reactExports.useCallback((function(n2) {
    var o = K(n2);
    G(o), o && (null == W2 || W2(o[1], n2));
  }), [K, G, W2]), tn = reactExports.useCallback((function(n2) {
    var o = K(n2);
    G(o), o && (null == E2 || E2(o[1], n2));
  }), [K, G, E2]), ln = reactExports.useCallback((function(n2) {
    var o = K(n2);
    G(o), o && (null == x2 || x2(o[1], n2));
  }), [K, G, x2]), rn = reactExports.useCallback((function(n2) {
    var o = K(n2);
    N2 && (G(o), null == v || v(o ? o[1] : null)), o && (null == S2 || S2(o[1], n2));
  }), [K, G, v, N2, S2]), un2 = reactExports.useCallback((function(n2) {
    var o = K(n2);
    N2 && (G(o), null == v || v(o ? o[1] : null)), o && (null == U2 || U2(o[1], n2));
  }), [K, G, v, N2, U2]), an = reactExports.useCallback((function(n2) {
    N2 && (G(null), null == v || v(null)), z$1 && J.current && z$1(J.current[1], n2);
  }), [N2, G, v, z$1, J]);
  return { current: q2, handleMouseEnter: k ? $2 : void 0, handleMouseMove: k ? _2 : void 0, handleMouseLeave: k ? nn : void 0, handleMouseDown: k ? on : void 0, handleMouseUp: k ? en : void 0, handleClick: k ? tn : void 0, handleDoubleClick: k ? ln : void 0, handleTouchStart: k ? rn : void 0, handleTouchMove: k ? un2 : void 0, handleTouchEnd: k ? an : void 0 };
}, A = ["theme"], N = function(n2) {
  var o = n2.data, e = n2.width, i = n2.height, t2 = n2.margin, l = n2.layers, a = void 0 === l ? w.layers : l, d = n2.xDomain, s = void 0 === d ? w.xDomain : d, h = n2.yDomain, f = void 0 === h ? w.yDomain : h, p = n2.enableLinks, g = void 0 === p ? w.enableLinks : p, M2 = n2.linkLineWidth, b = void 0 === M2 ? w.linkLineWidth : M2, k = n2.linkLineColor, C3 = void 0 === k ? w.linkLineColor : k, y2 = n2.enableCells, D2 = void 0 === y2 ? w.enableCells : y2, L2 = n2.cellLineWidth, T2 = void 0 === L2 ? w.cellLineWidth : L2, P2 = n2.cellLineColor, R2 = void 0 === P2 ? w.cellLineColor : P2, W2 = n2.enablePoints, E2 = void 0 === W2 ? w.enableCells : W2, U2 = n2.pointSize, z2 = void 0 === U2 ? w.pointSize : U2, A2 = n2.pointColor, N2 = void 0 === A2 ? w.pointColor : A2, H2 = n2.role, O2 = void 0 === H2 ? w.role : H2, I = n2.forwardedRef, j2 = cn$1(e, i, t2), F2 = j2.outerWidth, B2 = j2.outerHeight, q2 = j2.margin, G = j2.innerWidth, J = j2.innerHeight, K = x({ data: o, width: G, height: J, xDomain: s, yDomain: f }), Q = K.points, V2 = K.delaunay, X = K.voronoi, Y2 = { links: null, cells: null, points: null, bounds: null };
  g && a.includes("links") && (Y2.links = jsxRuntimeExports.jsx("path", { stroke: C3, strokeWidth: b, fill: "none", d: V2.render() }, "links")), D2 && a.includes("cells") && (Y2.cells = jsxRuntimeExports.jsx("path", { d: X.render(), fill: "none", stroke: R2, strokeWidth: T2 }, "cells")), E2 && a.includes("points") && (Y2.points = jsxRuntimeExports.jsx("path", { stroke: "none", fill: N2, d: V2.renderPoints(void 0, z2 / 2) }, "points")), a.includes("bounds") && (Y2.bounds = jsxRuntimeExports.jsx("path", { fill: "none", stroke: R2, strokeWidth: T2, d: X.renderBounds() }, "bounds"));
  var Z = S({ points: Q, delaunay: V2, voronoi: X });
  return jsxRuntimeExports.jsx(Rt, { width: F2, height: B2, margin: q2, role: O2, ref: I, children: a.map((function(n3, o2) {
    return void 0 !== Y2[n3] ? Y2[n3] : "function" == typeof n3 ? jsxRuntimeExports.jsx(reactExports.Fragment, { children: reactExports.createElement(n3, Z) }, o2) : null;
  })) });
}, H = reactExports.forwardRef((function(n2, o) {
  var e = n2.theme, i = y(n2, A);
  return jsxRuntimeExports.jsx(Fr, { isInteractive: false, animate: false, theme: e, children: jsxRuntimeExports.jsx(N, C({}, i, { forwardedRef: o })) });
})), O = ["defaultWidth", "defaultHeight", "onResize", "debounceResize"];
reactExports.forwardRef((function(n2, o) {
  var e = n2.defaultWidth, i = n2.defaultHeight, t2 = n2.onResize, l = n2.debounceResize, r = y(n2, O);
  return jsxRuntimeExports.jsx($r, { defaultWidth: e, defaultHeight: i, onResize: t2, debounceResize: l, children: function(n3) {
    var e2 = n3.width, i2 = n3.height;
    return jsxRuntimeExports.jsx(H, C({}, r, { width: e2, height: i2, ref: o }));
  } });
}));
var j = function(o) {
  var i = o.nodes, t2 = o.width, l = o.height, r = o.margin, u2 = void 0 === r ? L : r, a = o.getNodePosition, d = o.setCurrent, s = o.onMouseEnter, h = o.onMouseMove, c = o.onMouseLeave, v = o.onMouseDown, f = o.onMouseUp, p = o.onClick, g = o.onDoubleClick, M2 = o.onTouchStart, C3 = o.onTouchMove, y2 = o.onTouchEnd, w2 = o.enableTouchCrosshair, D2 = void 0 !== w2 && w2, R2 = o.detectionRadius, W2 = void 0 === R2 ? 1 / 0 : R2, x2 = o.tooltip, S2 = o.tooltipPosition, z2 = void 0 === S2 ? T : S2, A2 = o.tooltipAnchor, N2 = void 0 === A2 ? P : A2, H2 = o.debug, O2 = reactExports.useRef(null), I = E({ points: i, getNodePosition: a, width: t2, height: l, margin: u2, debug: H2 }), j2 = I.delaunay, F2 = I.voronoi, B2 = U({ elementRef: O2, nodes: i, delaunay: j2, margin: u2, detectionRadius: W2, setCurrent: d, onMouseEnter: s, onMouseMove: h, onMouseLeave: c, onMouseDown: v, onMouseUp: f, onClick: p, onDoubleClick: g, onTouchStart: M2, onTouchMove: C3, onTouchEnd: y2, enableTouchCrosshair: D2, tooltip: x2, tooltipPosition: z2, tooltipAnchor: N2 }), q2 = B2.current, G = B2.handleMouseEnter, J = B2.handleMouseMove, K = B2.handleMouseLeave, Q = B2.handleMouseDown, V2 = B2.handleMouseUp, X = B2.handleClick, Y2 = B2.handleDoubleClick, Z = B2.handleTouchStart, $2 = B2.handleTouchMove, _2 = B2.handleTouchEnd, nn = reactExports.useMemo((function() {
    if (H2 && F2) return F2.render();
  }), [H2, F2]);
  return jsxRuntimeExports.jsxs("g", { ref: O2, transform: "translate(" + -u2.left + "," + -u2.top + ")", children: [H2 && F2 && jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [jsxRuntimeExports.jsx("path", { d: nn, stroke: "red", strokeWidth: 1, opacity: 0.75 }), W2 < 1 / 0 && jsxRuntimeExports.jsx("path", { stroke: "red", strokeWidth: 0.35, fill: "none", d: j2.renderPoints(void 0, W2) }), q2 && jsxRuntimeExports.jsx("path", { fill: "pink", opacity: 0.35, d: F2.renderCell(q2[0]) })] }), jsxRuntimeExports.jsx("rect", { "data-ref": "mesh-interceptor", width: u2.left + t2 + u2.right, height: u2.top + l + u2.bottom, fill: "red", opacity: 0, style: { cursor: "auto" }, onMouseEnter: G, onMouseMove: J, onMouseLeave: K, onMouseDown: Q, onMouseUp: V2, onTouchStart: Z, onTouchMove: $2, onTouchEnd: _2, onClick: X, onDoubleClick: Y2 })] });
}, F = function(n2, o) {
  n2.save(), n2.globalAlpha = 0.75, n2.beginPath(), o.render(n2), n2.strokeStyle = "red", n2.lineWidth = 1, n2.stroke(), n2.restore();
}, q = function(n2, o, e) {
  n2.save(), n2.globalAlpha = 0.35, n2.beginPath(), o.renderCell(e, n2), n2.fillStyle = "pink", n2.fill(), n2.restore();
};
function $() {
  return $ = Object.assign ? Object.assign.bind() : function(e) {
    for (var o = 1; o < arguments.length; o++) {
      var i = arguments[o];
      for (var n2 in i) ({}).hasOwnProperty.call(i, n2) && (e[n2] = i[n2]);
    }
    return e;
  }, $.apply(null, arguments);
}
function _(e, o) {
  if (null == e) return {};
  var i = {};
  for (var n2 in e) if ({}.hasOwnProperty.call(e, n2)) {
    if (-1 !== o.indexOf(n2)) continue;
    i[n2] = e[n2];
  }
  return i;
}
var ee, oe = { xScale: { type: "point" }, yScale: { type: "linear", min: 0, max: "auto" }, curve: "linear", colors: { scheme: "nivo" }, lineWidth: 2, layers: ["grid", "markers", "axes", "areas", "crosshair", "lines", "points", "slices", "mesh", "legends"], enablePoints: true, pointSize: 6, pointColor: { from: "series.color" }, pointBorderWidth: 0, pointBorderColor: { theme: "background" }, enableArea: false, areaBaselineValue: 0, areaOpacity: 0.2, enableGridX: true, enableGridY: true, legends: [], isInteractive: true, tooltip: reactExports.memo((function(e) {
  var o = e.point;
  return jsxRuntimeExports.jsx(T$1, { id: jsxRuntimeExports.jsxs("span", { children: ["x: ", jsxRuntimeExports.jsx("strong", { children: o.data.xFormatted }), ", y:", " ", jsxRuntimeExports.jsx("strong", { children: o.data.yFormatted })] }), enableChip: true, color: o.seriesColor });
})), sliceTooltip: reactExports.memo((function(e) {
  var o = e.slice, i = e.axis, n2 = M$1(), t2 = "x" === i ? "y" : "x";
  return jsxRuntimeExports.jsx(E$2, { rows: o.points.map((function(e2) {
    return [jsxRuntimeExports.jsx(w$1, { color: e2.seriesColor, style: n2.tooltip.chip }, "chip"), e2.seriesId, jsxRuntimeExports.jsx("span", { style: n2.tooltip.tableCellValue, children: e2.data[t2 + "Formatted"] }, "value")];
  })) });
})), debugMesh: false, renderWrapper: true }, ie = $({}, oe, { defs: [], fill: [], enablePointLabel: false, pointLabel: "data.yFormatted", areaBlendMode: "normal", axisTop: null, axisRight: null, axisBottom: Y, axisLeft: Y, useMesh: false, enableSlices: false, debugSlices: false, enableCrosshair: true, crosshairType: "bottom-left", enableTouchCrosshair: false, initialHiddenIds: [], animate: true, motionConfig: "gentle", role: "img", isFocusable: false }), ne = $({}, oe, { pixelRatio: "undefined" != typeof window && null != (ee = window.devicePixelRatio) ? ee : 1, axisTop: null, axisRight: null, axisBottom: Y, axisLeft: Y });
function te(e) {
  return reactExports.useMemo((function() {
    return P$1().defined((function(e2) {
      return null !== e2.x && null !== e2.y;
    })).x((function(e2) {
      return e2.x;
    })).y((function(e2) {
      return e2.y;
    })).curve(Et(e));
  }), [e]);
}
function re(e) {
  var i = e.curve, n2 = e.yScale, t2 = e.areaBaselineValue;
  return reactExports.useMemo((function() {
    return R$1().defined((function(e2) {
      return null !== e2.x && null !== e2.y;
    })).x((function(e2) {
      return e2.x;
    })).y1((function(e2) {
      return e2.y;
    })).curve(Et(i)).y0(n2(t2));
  }), [i, n2, t2]);
}
var ae = function(e) {
  var i = e.componentId, n2 = e.enableSlices, t2 = e.points, r = e.width, a = e.height;
  return reactExports.useMemo((function() {
    if ("x" === n2) {
      var e2 = /* @__PURE__ */ new Map();
      return t2.forEach((function(o2) {
        null !== o2.data.x && null !== o2.data.y && (e2.has(o2.x) ? e2.get(o2.x).push(o2) : e2.set(o2.x, [o2]));
      })), Array.from(e2.entries()).sort((function(e3, o2) {
        return e3[0] - o2[0];
      })).map((function(e3, o2, n3) {
        var t3, l, s = e3[0], u2 = e3[1], d = n3[o2 - 1], c = n3[o2 + 1];
        return t3 = d ? s - (s - d[0]) / 2 : s, l = c ? s - t3 + (c[0] - s) / 2 : r - t3, { id: "slice:" + i + ":" + s, x0: t3, x: s, y0: 0, y: 0, width: l, height: a, points: u2.reverse() };
      }));
    }
    if ("y" === n2) {
      var o = /* @__PURE__ */ new Map();
      return t2.forEach((function(e3) {
        null !== e3.data.x && null !== e3.data.y && (o.has(e3.y) ? o.get(e3.y).push(e3) : o.set(e3.y, [e3]));
      })), Array.from(o.entries()).sort((function(e3, o2) {
        return e3[0] - o2[0];
      })).map((function(e3, o2, i2) {
        var n3, t3, l = e3[0], s = e3[1], u2 = i2[o2 - 1], d = i2[o2 + 1];
        return n3 = u2 ? l - (l - u2[0]) / 2 : l, t3 = d ? l - n3 + (d[0] - l) / 2 : a - n3, { id: l, x0: 0, x: 0, y0: n3, y: l, width: r, height: t3, points: s.reverse() };
      }));
    }
    return [];
  }), [i, n2, a, t2, r]);
}, le = "line", se = function(e) {
  var t2 = e.data, r = e.xScale, a = void 0 === r ? oe.xScale : r, l = e.xFormat, s = e.yScale, u2 = void 0 === s ? oe.yScale : s, c = e.yFormat, h = e.width, f = e.height, p = e.colors, v = void 0 === p ? oe.colors : p, b = e.curve, g = void 0 === b ? oe.curve : b, m = e.areaBaselineValue, y2 = void 0 === m ? oe.areaBaselineValue : m, x2 = e.pointColor, M2 = void 0 === x2 ? oe.pointColor : x2, C3 = e.pointBorderColor, S2 = void 0 === C3 ? oe.pointBorderColor : C3, B2 = e.enableSlices, w2 = void 0 === B2 ? ie.enableSlices : B2, T2 = e.initialHiddenIds, k = void 0 === T2 ? ie.initialHiddenIds : T2, W2 = reactExports.useState(O$1(le))[0], L2 = hn(l), D2 = hn(c), I = hr(v, "id"), F2 = M$1(), E2 = Ye(M2, F2), G = Ye(S2, F2), H2 = reactExports.useState(null != k ? k : []), P2 = H2[0], R2 = H2[1], U2 = reactExports.useMemo((function() {
    return hn$1(t2.filter((function(e2) {
      return -1 === P2.indexOf(e2.id);
    })), a, u2, h, f);
  }), [t2, P2, a, u2, h, f]), X = U2.xScale, j2 = U2.yScale, q2 = U2.series, J = reactExports.useMemo((function() {
    var e2 = t2.map((function(e3) {
      return { id: e3.id, label: "" + e3.id, color: I(e3) };
    })), o = e2.map((function(e3) {
      return $({}, q2.find((function(o2) {
        return o2.id === e3.id;
      })), { color: e3.color });
    })).filter((function(e3) {
      return Boolean(e3.id);
    }));
    return { legendData: e2.map((function(e3) {
      return $({}, e3, { hidden: !o.find((function(o2) {
        return o2.id === e3.id;
      })) });
    })).reverse(), series: o };
  }), [t2, q2, I]), K = J.legendData, N2 = J.series, Q = reactExports.useCallback((function(e2) {
    R2((function(o) {
      return o.indexOf(e2) > -1 ? o.filter((function(o2) {
        return o2 !== e2;
      })) : [].concat(o, [e2]);
    }));
  }), []), Z = (function(e2) {
    var i = e2.series, n2 = e2.getPointColor, t3 = e2.getPointBorderColor, r2 = e2.formatX, a2 = e2.formatY;
    return reactExports.useMemo((function() {
      return i.reduce((function(e3, o, i2) {
        return [].concat(e3, o.data.filter((function(e4) {
          return null !== e4.position.x && null !== e4.position.y;
        })).map((function(l2, s2) {
          var u3 = { id: o.id + "." + s2, indexInSeries: s2, absIndex: e3.length + s2, seriesIndex: i2, seriesId: o.id, seriesColor: o.color, x: l2.position.x, y: l2.position.y, data: $({}, l2.data, { xFormatted: r2(l2.data.x), yFormatted: a2(l2.data.y) }) };
          return u3.color = n2({ series: o, point: u3 }), u3.borderColor = t3(u3), u3;
        })));
      }), []);
    }), [i, n2, t3, r2, a2]);
  })({ series: N2, getPointColor: E2, getPointBorderColor: G, formatX: L2, formatY: D2 }), _2 = ae({ componentId: W2, enableSlices: w2, points: Z, width: h, height: f });
  return { legendData: K, toggleSeries: Q, lineGenerator: te(g), areaGenerator: re({ curve: g, yScale: j2, areaBaselineValue: y2 }), getColor: I, series: N2, xScale: X, yScale: j2, slices: _2, points: Z };
}, ue = function(e) {
  var o = e.areaBlendMode, i = e.areaOpacity, n2 = e.color, t2 = e.fill, r = e.path, a = Dr(), l = a.animate, s = a.config, u2 = It(r), d = useSpring({ color: n2, config: s, immediate: !l });
  return jsxRuntimeExports.jsx(animated.path, { d: u2, fill: t2 || d.color, fillOpacity: i, strokeWidth: 0, style: { mixBlendMode: o } });
}, de = reactExports.memo((function(e) {
  var o = e.areaGenerator, i = e.areaOpacity, n2 = e.areaBlendMode, t2 = e.series.slice(0).reverse();
  return jsxRuntimeExports.jsx("g", { children: t2.map((function(e2) {
    return jsxRuntimeExports.jsx(ue, $({ path: o(e2.data.map((function(e3) {
      return e3.position;
    }))) }, $({ areaOpacity: i, areaBlendMode: n2 }, e2)), "" + e2.id);
  })) });
})), ce = reactExports.memo((function(e) {
  var i = e.lineGenerator, n2 = e.points, t2 = e.color, r = e.thickness, a = reactExports.useMemo((function() {
    return i(n2);
  }), [i, n2]), l = It(a);
  return jsxRuntimeExports.jsx(animated.path, { d: l, fill: "none", strokeWidth: r, stroke: t2 });
})), he = reactExports.memo((function(e) {
  var o = e.series, i = e.lineGenerator, n2 = e.lineWidth;
  return jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: o.slice(0).reverse().map((function(e2) {
    var o2 = e2.id, t2 = e2.data, r = e2.color;
    return jsxRuntimeExports.jsx(ce, { points: t2.map((function(e3) {
      return e3.position;
    })), lineGenerator: i, color: r, thickness: n2 }, o2);
  })) });
})), fe = reactExports.memo((function(e) {
  var o = e.slice, i = e.slices, r = e.axis, a = e.debug, l = e.tooltip, s = e.isCurrent, u2 = e.setCurrent, d = e.onMouseEnter, c = e.onMouseMove, h = e.onMouseLeave, f = e.onMouseDown, p = e.onMouseUp, v = e.onClick, b = e.onDoubleClick, g = e.onTouchStart, m = e.onTouchMove, y2 = e.onTouchEnd, x2 = z(), M2 = x2.showTooltipFromEvent, C3 = x2.hideTooltip, S2 = reactExports.useCallback((function(e2) {
    M2(reactExports.createElement(l, { slice: o, axis: r }), e2, "right"), u2(o), null == d || d(o, e2);
  }), [M2, l, o, r, u2, d]), B2 = reactExports.useCallback((function(e2) {
    M2(reactExports.createElement(l, { slice: o, axis: r }), e2, "right"), null == c || c(o, e2);
  }), [M2, l, o, r, c]), w2 = reactExports.useCallback((function(e2) {
    C3(), u2(null), null == h || h(o, e2);
  }), [C3, u2, h, o]), T2 = reactExports.useCallback((function(e2) {
    null == f || f(o, e2);
  }), [o, f]), k = reactExports.useCallback((function(e2) {
    null == p || p(o, e2);
  }), [o, p]), W2 = reactExports.useCallback((function(e2) {
    null == v || v(o, e2);
  }), [o, v]), L2 = reactExports.useCallback((function(e2) {
    null == b || b(o, e2);
  }), [o, b]), D2 = reactExports.useCallback((function(e2) {
    M2(reactExports.createElement(l, { slice: o, axis: r }), e2, "right"), u2(o), null == g || g(o, e2);
  }), [r, g, u2, M2, o, l]), I = reactExports.useCallback((function(e2) {
    var n2 = e2.touches[0], a2 = document.elementFromPoint(n2.clientX, n2.clientY), s2 = null == a2 ? void 0 : a2.getAttribute("data-ref");
    if (s2) {
      var d2 = i.find((function(e3) {
        return e3.id === s2;
      }));
      d2 && (M2(reactExports.createElement(l, { slice: d2, axis: r }), e2, "right"), u2(d2));
    }
    null == m || m(o, e2);
  }), [r, m, u2, M2, o, i, l]), F2 = reactExports.useCallback((function(e2) {
    C3(), u2(null), null == y2 || y2(o, e2);
  }), [C3, u2, y2, o]);
  return jsxRuntimeExports.jsx("rect", { x: o.x0, y: o.y0, width: o.width, height: o.height, stroke: "red", strokeWidth: a ? 1 : 0, strokeOpacity: 0.75, fill: "red", fillOpacity: s && a ? 0.35 : 0, onMouseEnter: S2, onMouseMove: B2, onMouseLeave: w2, onMouseDown: T2, onMouseUp: k, onClick: W2, onDoubleClick: L2, onTouchStart: D2, onTouchMove: I, onTouchEnd: F2, "data-ref": o.id });
})), pe = reactExports.memo((function(e) {
  var o = e.slices, i = e.axis, n2 = e.debug, t2 = e.tooltip, r = e.current, a = e.setCurrent, l = e.onMouseEnter, s = e.onMouseMove, u2 = e.onMouseLeave, d = e.onMouseDown, c = e.onMouseUp, h = e.onClick, f = e.onDoubleClick, p = e.onTouchStart, v = e.onTouchMove, b = e.onTouchEnd;
  return jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: o.map((function(e2) {
    return jsxRuntimeExports.jsx(fe, { slice: e2, slices: o, axis: i, debug: n2, tooltip: t2, setCurrent: a, isCurrent: null !== r && r.id === e2.id, onMouseEnter: l, onMouseMove: s, onMouseLeave: u2, onMouseDown: d, onMouseUp: c, onClick: h, onDoubleClick: f, onTouchStart: p, onTouchMove: v, onTouchEnd: b }, e2.id);
  })) });
})), ve = reactExports.memo((function(e) {
  var o = e.points, i = e.symbol, n2 = e.size, r = e.borderWidth, a = e.enableLabel, l = e.label, s = e.labelYOffset, u2 = e.isFocusable, d = e.setCurrentPoint, c = e.tooltip, h = e.margin, v = e.ariaLabel, b = e.ariaLabelledBy, g = e.ariaDescribedBy, m = e.ariaHidden, y2 = e.ariaDisabled, x2 = pn(l), M2 = z(), C3 = M2.showTooltipAt, S2 = M2.hideTooltip, B2 = o.slice(0).sort((function(e2, o2) {
    return e2.indexInSeries - o2.indexInSeries;
  })).sort((function(e2, o2) {
    return o2.seriesIndex - e2.seriesIndex;
  })).map((function(e2) {
    return { id: e2.id, x: e2.x, y: e2.y, datum: e2.data, fill: e2.color, stroke: e2.borderColor, label: a ? x2(e2) : null, ariaLabel: v ? v(e2) : void 0, ariaLabelledBy: b ? b(e2) : void 0, ariaDescribedBy: g ? g(e2) : void 0, ariaHidden: m ? m(e2) : void 0, ariaDisabled: y2 ? y2(e2) : void 0, onFocus: u2 ? function() {
      d(e2), C3(reactExports.createElement(c, { point: e2 }), [h.left + e2.x, h.top + e2.y], "top");
    } : void 0, onBlur: u2 ? function() {
      d(null), S2();
    } : void 0 };
  }));
  return jsxRuntimeExports.jsx("g", { children: B2.map((function(e2) {
    return jsxRuntimeExports.jsx(Ct, { x: e2.x, y: e2.y, datum: e2.datum, symbol: i, size: n2, color: e2.fill, borderWidth: r, borderColor: e2.stroke, label: e2.label, labelYOffset: s, ariaLabel: e2.ariaLabel, ariaLabelledBy: e2.ariaLabelledBy, ariaDescribedBy: e2.ariaDescribedBy, ariaHidden: e2.ariaHidden, ariaDisabled: e2.ariaDisabled, isFocusable: u2, onFocus: e2.onFocus, onBlur: e2.onBlur, testId: "line.point." + e2.id }, e2.id);
  })) });
})), be = reactExports.memo((function(e) {
  var o = e.points, i = e.width, r = e.height, a = e.margin, l = e.setCurrent, s = e.onMouseEnter, u2 = e.onMouseMove, d = e.onMouseLeave, c = e.onMouseDown, h = e.onMouseUp, f = e.onClick, p = e.onDoubleClick, v = e.onTouchStart, b = e.onTouchMove, g = e.onTouchEnd, m = e.tooltip, y2 = e.debug, x2 = e.enableTouchCrosshair, M2 = z(), C3 = M2.showTooltipAt, S2 = M2.hideTooltip, B2 = reactExports.useCallback((function(e2, o2) {
    C3(reactExports.createElement(m, { point: e2 }), [e2.x + a.left, e2.y + a.top], "top"), null == s || s(e2, o2);
  }), [C3, m, s, a]), w2 = reactExports.useCallback((function(e2, o2) {
    C3(reactExports.createElement(m, { point: e2 }), [e2.x + a.left, e2.y + a.top], "top"), null == u2 || u2(e2, o2);
  }), [C3, m, a.left, a.top, u2]), T2 = reactExports.useCallback((function(e2, o2) {
    S2(), null == d || d(e2, o2);
  }), [S2, d]), k = reactExports.useCallback((function(e2, o2) {
    null == c || c(e2, o2);
  }), [c]), W2 = reactExports.useCallback((function(e2, o2) {
    null == h || h(e2, o2);
  }), [h]), L2 = reactExports.useCallback((function(e2, o2) {
    null == f || f(e2, o2);
  }), [f]), D2 = reactExports.useCallback((function(e2, o2) {
    null == p || p(e2, o2);
  }), [p]), I = reactExports.useCallback((function(e2, o2) {
    C3(reactExports.createElement(m, { point: e2 }), [e2.x + a.left, e2.y + a.top], "top"), null == v || v(e2, o2);
  }), [a.left, a.top, v, C3, m]), F2 = reactExports.useCallback((function(e2, o2) {
    C3(reactExports.createElement(m, { point: e2 }), [e2.x + a.left, e2.y + a.top], "top"), null == b || b(e2, o2);
  }), [a.left, a.top, b, C3, m]), E2 = reactExports.useCallback((function(e2, o2) {
    S2(), null == g || g(e2, o2);
  }), [g, S2]);
  return jsxRuntimeExports.jsx(j, { nodes: o, width: i, height: r, setCurrent: l, onMouseEnter: B2, onMouseMove: w2, onMouseLeave: T2, onMouseDown: k, onMouseUp: W2, onClick: L2, onDoubleClick: D2, onTouchStart: I, onTouchMove: F2, onTouchEnd: E2, enableTouchCrosshair: x2, debug: y2 });
})), ge = ["isInteractive", "animate", "motionConfig", "theme", "renderWrapper"];
function me(e) {
  var o = e.data, n2 = e.xScale, t2 = void 0 === n2 ? ie.xScale : n2, r = e.xFormat, l = e.yScale, s = void 0 === l ? ie.yScale : l, u2 = e.yFormat, d = e.curve, c = void 0 === d ? ie.curve : d, h = e.margin, f = e.width, p = e.height, v = e.colors, x2 = void 0 === v ? ie.colors : v, M2 = e.lineWidth, C3 = void 0 === M2 ? ie.lineWidth : M2, S2 = e.layers, B2 = void 0 === S2 ? ie.layers : S2, k = e.enableArea, W2 = void 0 === k ? ie.enableArea : k, D2 = e.areaBaselineValue, I = void 0 === D2 ? ie.areaBaselineValue : D2, F2 = e.areaOpacity, E2 = void 0 === F2 ? ie.areaOpacity : F2, G = e.areaBlendMode, P2 = void 0 === G ? ie.areaBlendMode : G, R2 = e.enablePoints, O2 = void 0 === R2 ? ie.enablePoints : R2, z2 = e.pointSymbol, A2 = e.pointSize, V$2 = void 0 === A2 ? ie.pointSize : A2, Y2 = e.pointColor, X = void 0 === Y2 ? ie.pointColor : Y2, j2 = e.pointBorderWidth, q2 = void 0 === j2 ? ie.pointBorderWidth : j2, J = e.pointBorderColor, K = void 0 === J ? ie.pointBorderColor : J, N2 = e.enablePointLabel, Q = void 0 === N2 ? ie.enablePointLabel : N2, Z = e.pointLabel, _2 = void 0 === Z ? ie.pointLabel : Z, ee2 = e.pointLabelYOffset, oe2 = e.enableGridX, ne2 = void 0 === oe2 ? ie.enableGridX : oe2, te2 = e.gridXValues, re2 = e.enableGridY, ae2 = void 0 === re2 ? ie.enableGridY : re2, le2 = e.gridYValues, ue2 = e.axisTop, ce2 = e.axisRight, fe2 = e.axisBottom, ge2 = void 0 === fe2 ? ie.axisBottom : fe2, me2 = e.axisLeft, ye2 = void 0 === me2 ? ie.axisLeft : me2, xe2 = e.defs, Me2 = void 0 === xe2 ? ie.defs : xe2, Ce2 = e.fill, Se2 = void 0 === Ce2 ? ie.fill : Ce2, Be2 = e.markers, we2 = e.legends, Te = void 0 === we2 ? ie.legends : we2, ke = e.isInteractive, We = void 0 === ke ? ie.isInteractive : ke, Le = e.useMesh, De = void 0 === Le ? ie.useMesh : Le, Ie = e.debugMesh, Fe = void 0 === Ie ? ie.debugMesh : Ie, Ee = e.onMouseEnter, Ge = e.onMouseMove, He = e.onMouseLeave, Pe = e.onMouseDown, Re = e.onMouseUp, Oe = e.onClick, ze = e.onDoubleClick, Ae = e.onTouchStart, Ve = e.onTouchMove, Ye2 = e.onTouchEnd, Ue = e.tooltip, Xe2 = void 0 === Ue ? ie.tooltip : Ue, je = e.enableSlices, qe = void 0 === je ? ie.enableSlices : je, Je = e.debugSlices, Ke = void 0 === Je ? ie.debugSlices : Je, Ne = e.sliceTooltip, Qe = void 0 === Ne ? ie.sliceTooltip : Ne, Ze = e.enableCrosshair, $e = void 0 === Ze ? ie.enableCrosshair : Ze, _e = e.crosshairType, eo = void 0 === _e ? ie.crosshairType : _e, oo = e.enableTouchCrosshair, io = void 0 === oo ? ie.enableTouchCrosshair : oo, no = e.role, to = void 0 === no ? ie.role : no, ro = e.ariaLabel, ao = e.ariaLabelledBy, lo = e.ariaDescribedBy, so = e.isFocusable, uo = void 0 === so ? ie.isFocusable : so, co = e.pointAriaLabel, ho = e.pointAriaLabelledBy, fo = e.pointAriaDescribedBy, po = e.pointAriaHidden, vo = e.pointAriaDisabled, bo = e.initialHiddenIds, go = void 0 === bo ? ie.initialHiddenIds : bo, mo = e.forwardedRef, yo = cn$1(f, p, h), xo = yo.margin, Mo = yo.innerWidth, Co = yo.innerHeight, So = yo.outerWidth, Bo = yo.outerHeight, wo = se({ data: o, xScale: t2, xFormat: r, yScale: s, yFormat: u2, width: Mo, height: Co, colors: x2, curve: c, areaBaselineValue: I, pointColor: X, pointBorderColor: K, enableSlices: qe, initialHiddenIds: go }), To = wo.legendData, ko = wo.toggleSeries, Wo = wo.lineGenerator, Lo = wo.areaGenerator, Do = wo.series, Io = wo.xScale, Fo = wo.yScale, Eo = wo.slices, Go = wo.points, Ho = reactExports.useState(null), Po = Ho[0], Ro = Ho[1], Oo = reactExports.useState(null), zo = Oo[0], Ao = Oo[1], Vo = { grid: null, markers: null, axes: null, areas: null, crosshair: null, lines: null, points: null, slices: null, mesh: null, legends: null };
  B2.includes("grid") && (ne2 || ae2) && (Vo.grid = jsxRuntimeExports.jsx(j$1, { width: Mo, height: Co, xScale: ne2 ? Io : null, yScale: ae2 ? Fo : null, xValues: te2, yValues: le2 }, "grid")), B2.includes("markers") && Array.isArray(Be2) && Be2.length > 0 && (Vo.markers = jsxRuntimeExports.jsx(Pt, { markers: Be2, width: Mo, height: Co, xScale: Io, yScale: Fo }, "markers")), B2.includes("axes") && (Vo.axes = jsxRuntimeExports.jsx(V, { xScale: Io, yScale: Fo, width: Mo, height: Co, top: ue2, right: ce2, bottom: ge2, left: ye2 }, "axes")), B2.includes("lines") && (Vo.lines = jsxRuntimeExports.jsx(he, { series: Do, lineGenerator: Wo, lineWidth: C3 }, "lines")), B2.includes("legends") && Te.length > 0 && (Vo.legends = jsxRuntimeExports.jsx(reactExports.Fragment, { children: Te.map((function(e2, o2) {
    return jsxRuntimeExports.jsx(E$1, $({}, e2, { containerWidth: Mo, containerHeight: Co, data: e2.data || To, toggleSerie: e2.toggleSerie ? ko : void 0 }), o2);
  })) }, "legends"));
  var Yo = Mn(Me2, Do, Se2);
  W2 && (Vo.areas = jsxRuntimeExports.jsx(de, { areaGenerator: Lo, areaOpacity: E2, areaBlendMode: P2, series: Do }, "areas")), We && false !== qe && (Vo.slices = jsxRuntimeExports.jsx(pe, { slices: Eo, axis: qe, debug: Ke, tooltip: Qe, current: zo, setCurrent: Ao, onMouseEnter: Ee, onMouseMove: Ge, onMouseLeave: He, onMouseDown: Pe, onMouseUp: Re, onClick: Oe, onDoubleClick: ze, onTouchStart: Ae, onTouchMove: Ve, onTouchEnd: Ye2 }, "slices")), O2 && (Vo.points = jsxRuntimeExports.jsx(ve, { points: Go, symbol: z2, size: V$2, borderWidth: q2, enableLabel: Q, label: _2, labelYOffset: ee2, isFocusable: uo, setCurrentPoint: Ro, tooltip: Xe2, margin: xo, ariaLabel: co, ariaLabelledBy: ho, ariaDescribedBy: fo, ariaHidden: po, ariaDisabled: vo }, "points")), We && $e && (null !== Po && (Vo.crosshair = jsxRuntimeExports.jsx(V$1, { width: Mo, height: Co, x: Po.x, y: Po.y, type: eo }, "crosshair")), null !== zo && qe && (Vo.crosshair = jsxRuntimeExports.jsx(V$1, { width: Mo, height: Co, x: zo.x, y: zo.y, type: qe }, "crosshair"))), We && De && false === qe && (Vo.mesh = jsxRuntimeExports.jsx(be, { points: Go, width: Mo, height: Co, margin: xo, setCurrent: Ro, onMouseEnter: Ee, onMouseMove: Ge, onMouseLeave: He, onMouseDown: Pe, onMouseUp: Re, onClick: Oe, onDoubleClick: ze, onTouchStart: Ae, onTouchMove: Ve, onTouchEnd: Ye2, tooltip: Xe2, enableTouchCrosshair: io, debug: Fe }, "mesh"));
  var Uo = $({}, e, { innerWidth: Mo, innerHeight: Co, series: Do, slices: Eo, points: Go, xScale: Io, yScale: Fo, lineGenerator: Wo, areaGenerator: Lo, currentPoint: Po, setCurrentPoint: Ro, currentSlice: zo, setCurrentSlice: Ao });
  return jsxRuntimeExports.jsx(Rt, { defs: Yo, width: So, height: Bo, margin: xo, role: to, ariaLabel: ro, ariaLabelledBy: ao, ariaDescribedBy: lo, isFocusable: uo, ref: mo, children: B2.map((function(e2, o2) {
    return "function" == typeof e2 ? jsxRuntimeExports.jsx(reactExports.Fragment, { children: e2(Uo) }, o2) : Vo[e2];
  })) });
}
var ye = reactExports.forwardRef((function(e, o) {
  var i = e.isInteractive, n2 = void 0 === i ? ie.isInteractive : i, t2 = e.animate, r = void 0 === t2 ? ie.animate : t2, a = e.motionConfig, l = void 0 === a ? ie.motionConfig : a, s = e.theme, u2 = e.renderWrapper, d = _(e, ge);
  return jsxRuntimeExports.jsx(Fr, { animate: r, isInteractive: n2, motionConfig: l, renderWrapper: u2, theme: s, children: jsxRuntimeExports.jsx(me, $({ isInteractive: n2 }, d, { forwardedRef: o })) });
})), xe = ["defaultWidth", "defaultHeight", "onResize", "debounceResize"], Me = reactExports.forwardRef((function(e, o) {
  var i = e.defaultWidth, n2 = e.defaultHeight, t2 = e.onResize, r = e.debounceResize, a = _(e, xe);
  return jsxRuntimeExports.jsx($r, { defaultWidth: i, defaultHeight: n2, onResize: t2, debounceResize: r, children: function(e2) {
    var i2 = e2.width, n3 = e2.height;
    return jsxRuntimeExports.jsx(ye, $({ width: i2, height: n3 }, a, { ref: o }));
  } });
})), Ce = ["isInteractive", "renderWrapper", "theme"], Se = function(e) {
  var r = e.width, a = e.height, u2 = e.margin, d = e.pixelRatio, c = void 0 === d ? ne.pixelRatio : d, h = e.data, f = e.xScale, p = void 0 === f ? ne.xScale : f, v = e.xFormat, g = e.yScale, m = void 0 === g ? ne.yScale : g, y2 = e.yFormat, x2 = e.curve, B2 = void 0 === x2 ? ne.curve : x2, w2 = e.layers, T2 = void 0 === w2 ? ne.layers : w2, L2 = e.colors, I = void 0 === L2 ? ne.colors : L2, F$1 = e.lineWidth, E$12 = void 0 === F$1 ? ne.lineWidth : F$1, H2 = e.enableArea, P2 = void 0 === H2 ? ne.enableArea : H2, R2 = e.areaBaselineValue, O2 = void 0 === R2 ? ne.areaBaselineValue : R2, A2 = e.areaOpacity, V2 = void 0 === A2 ? ne.areaOpacity : A2, Y2 = e.enablePoints, X = void 0 === Y2 ? ne.enablePoints : Y2, j2 = e.pointSize, q$2 = void 0 === j2 ? ne.pointSize : j2, J = e.pointColor, K = void 0 === J ? ne.pointColor : J, _2 = e.pointBorderWidth, ee2 = void 0 === _2 ? ne.pointBorderWidth : _2, oe2 = e.pointBorderColor, ie2 = void 0 === oe2 ? ne.pointBorderColor : oe2, te2 = e.enableGridX, re2 = void 0 === te2 ? ne.enableGridX : te2, ae2 = e.gridXValues, le2 = e.enableGridY, ue2 = void 0 === le2 ? ne.enableGridY : le2, de2 = e.gridYValues, ce2 = e.axisTop, he2 = e.axisRight, fe2 = e.axisBottom, pe2 = void 0 === fe2 ? ne.axisBottom : fe2, ve2 = e.axisLeft, be2 = void 0 === ve2 ? ne.axisLeft : ve2, ge2 = e.legends, me2 = void 0 === ge2 ? ne.legends : ge2, ye2 = e.isInteractive, xe2 = void 0 === ye2 ? ne.isInteractive : ye2, Me2 = e.debugMesh, Ce2 = void 0 === Me2 ? ne.debugMesh : Me2, Se2 = e.onMouseLeave, Be2 = e.onMouseDown, we2 = e.onMouseUp, Te = e.onClick, ke = e.onDoubleClick, We = e.tooltip, Le = void 0 === We ? ne.tooltip : We, De = e.role, Ie = e.forwardedRef, Fe = reactExports.useRef(null), Ee = cn$1(r, a, u2), Ge = Ee.margin, He = Ee.innerWidth, Pe = Ee.innerHeight, Re = Ee.outerWidth, Oe = Ee.outerHeight, ze = M$1(), Ae = reactExports.useState(null), Ve = Ae[0], Ye2 = Ae[1], Ue = se({ data: h, xScale: p, xFormat: v, yScale: m, yFormat: y2, width: He, height: Pe, colors: I, curve: B2, areaBaselineValue: O2, pointColor: K, pointBorderColor: ie2 }), Xe2 = Ue.lineGenerator, je = Ue.areaGenerator, qe = Ue.series, Je = Ue.xScale, Ke = Ue.yScale, Ne = Ue.points, Qe = reactExports.useMemo((function() {
    return { innerWidth: He, innerHeight: Pe, series: qe, points: Ne, xScale: Je, yScale: Ke, lineWidth: E$12, lineGenerator: Xe2, areaGenerator: je, currentPoint: Ve, setCurrentPoint: Ye2 };
  }), [He, Pe, qe, Ne, Je, Ke, E$12, Xe2, je, Ve, Ye2]), Ze = E({ points: Ne, width: He, height: Pe, debug: Ce2 }), $e = Ze.delaunay, _e = Ze.voronoi;
  reactExports.useEffect((function() {
    if (null !== Fe.current) {
      Fe.current.width = Re * c, Fe.current.height = Oe * c;
      var e2 = Fe.current.getContext("2d");
      e2.scale(c, c), e2.fillStyle = ze.background, e2.fillRect(0, 0, Re, Oe), e2.translate(Ge.left, Ge.top), T2.forEach((function(o) {
        var i;
        "function" == typeof o && o(e2, Qe);
        var n2 = null != (i = ze.grid.line.strokeWidth) ? i : 0;
        if ("grid" === o && "string" != typeof n2 && n2 > 0 && (e2.lineWidth = n2, e2.strokeStyle = ze.grid.line.stroke, re2 && q$1(e2, { width: He, height: Pe, scale: Je, axis: "x", values: ae2 }), ue2 && q$1(e2, { width: He, height: Pe, scale: Ke, axis: "y", values: de2 })), "axes" === o && W$1(e2, { xScale: Je, yScale: Ke, width: He, height: Pe, top: ce2, right: he2, bottom: pe2, left: be2, theme: ze }), "areas" === o && true === P2) {
          e2.save(), e2.globalAlpha = V2, je.context(e2);
          for (var t2 = qe.length - 1; t2 >= 0; t2--) e2.fillStyle = qe[t2].color, e2.beginPath(), je(qe[t2].data.map((function(e3) {
            return e3.position;
          }))), e2.fill();
          e2.restore();
        }
        if ("lines" === o && (Xe2.context(e2), qe.forEach((function(o2) {
          e2.strokeStyle = o2.color, e2.lineWidth = E$12, e2.beginPath(), Xe2(o2.data.map((function(e3) {
            return e3.position;
          }))), e2.stroke();
        }))), "points" === o && true === X && q$2 > 0 && Ne.forEach((function(o2) {
          e2.fillStyle = o2.color, e2.beginPath(), e2.arc(o2.x, o2.y, q$2 / 2, 0, 2 * Math.PI), e2.fill(), ee2 > 0 && (e2.strokeStyle = o2.borderColor, e2.lineWidth = ee2, e2.stroke());
        })), "mesh" === o && true === Ce2 && void 0 !== _e && (F(e2, _e), Ve && q(e2, _e, Ve.absIndex)), "legends" === o) {
          var r2 = qe.map((function(e3) {
            return { id: e3.id, label: e3.id, color: e3.color };
          })).reverse();
          me2.forEach((function(o2) {
            L$1(e2, $({}, o2, { data: o2.data || r2, containerWidth: He, containerHeight: Pe, theme: ze }));
          }));
        }
      }));
    }
  }), [Fe, He, Re, Pe, Oe, Ge.left, Ge.top, c, T2, ze, Xe2, qe, Je, Ke, re2, ae2, ue2, de2, ce2, he2, pe2, be2, me2, Ne, X, q$2, ee2, Ve, Qe, Ce2, P2, je, V2, E$12, _e]);
  var eo = reactExports.useCallback((function(e2) {
    if (!Fe.current) return null;
    var o = kn(Fe.current, e2), i = o[0], n2 = o[1];
    if (!wn(Ge.left, Ge.top, He, Pe, i, n2)) return null;
    var t2 = $e.find(i - Ge.left, n2 - Ge.top);
    return Ne[t2];
  }), [Fe, Ge, He, Pe, $e, Ne]), oo = z(), io = oo.showTooltipFromEvent, no = oo.hideTooltip, to = reactExports.useCallback((function(e2) {
    var o = eo(e2);
    Ye2(o), o ? io(reactExports.createElement(Le, { point: o }), e2) : no();
  }), [eo, Ye2, io, no, Le]), ro = reactExports.useCallback((function(e2) {
    no(), Ye2(null), Ve && (null == Se2 || Se2(Ve, e2));
  }), [no, Ye2, Se2, Ve]), ao = reactExports.useCallback((function(e2) {
    if (Be2) {
      var o = eo(e2);
      o && Be2(o, e2);
    }
  }), [eo, Be2]), lo = reactExports.useCallback((function(e2) {
    if (we2) {
      var o = eo(e2);
      o && we2(o, e2);
    }
  }), [eo, we2]), so = reactExports.useCallback((function(e2) {
    if (Te) {
      var o = eo(e2);
      o && Te(o, e2);
    }
  }), [eo, Te]), uo = reactExports.useCallback((function(e2) {
    if (ke) {
      var o = eo(e2);
      o && ke(o, e2);
    }
  }), [eo, ke]);
  return jsxRuntimeExports.jsx("canvas", { ref: Rn(Fe, Ie), width: Re * c, height: Oe * c, style: { width: Re, height: Oe, cursor: xe2 ? "auto" : "normal" }, onMouseEnter: xe2 ? to : void 0, onMouseMove: xe2 ? to : void 0, onMouseLeave: xe2 ? ro : void 0, onMouseDown: xe2 ? ao : void 0, onMouseUp: xe2 ? lo : void 0, onClick: xe2 ? so : void 0, onDoubleClick: xe2 ? uo : void 0, role: De });
}, Be = reactExports.forwardRef((function(e, o) {
  var i = e.isInteractive, n2 = e.renderWrapper, t2 = e.theme, r = _(e, Ce);
  return jsxRuntimeExports.jsx(Fr, { isInteractive: i, renderWrapper: n2, theme: t2, animate: false, children: jsxRuntimeExports.jsx(Se, $({}, r, { forwardedRef: o })) });
})), we = ["defaultWidth", "defaultHeight", "onResize", "debounceResize"];
reactExports.forwardRef((function(e, o) {
  var i = e.defaultWidth;
  e.defaultHeight;
  var n2 = e.onResize, t2 = e.debounceResize, r = _(e, we);
  return jsxRuntimeExports.jsx($r, { defaultWidth: i, defaultHeight: i, onResize: n2, debounceResize: t2, children: function(e2) {
    var i2 = e2.width, n3 = e2.height;
    return jsxRuntimeExports.jsx(Be, $({ width: i2, height: n3 }, r, { ref: o }));
  } });
}));
const getFocusRange = (data, percentile = 0.9, padding = 0.1) => {
  const values = data.map((d) => d.y).sort((a, b) => a - b);
  if (!values.length) return { min: 0, max: 100 };
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  if (maxVal - minVal < 20) {
    const range2 = maxVal - minVal;
    const suggestedMax2 = maxVal + range2 * padding;
    const suggestedMin2 = Math.max(0, minVal - range2 * padding);
    return {
      min: Math.floor(suggestedMin2),
      max: Math.ceil(suggestedMax2),
      hasOutliers: false
    };
  }
  const cutoffIndex = Math.floor(values.length * percentile);
  const outlierThreshold = values[cutoffIndex] ?? 0;
  const normalValues = values.filter((v) => v <= outlierThreshold);
  const normalMinVal = Math.min(...normalValues);
  const normalMaxVal = Math.max(...normalValues);
  const range = normalMaxVal - normalMinVal;
  const suggestedMax = normalMaxVal + range * padding;
  const suggestedMin = Math.max(0, normalMinVal - range * padding);
  return {
    min: Math.floor(suggestedMin),
    max: Math.ceil(suggestedMax),
    hasOutliers: values.some((v) => v > suggestedMax)
    // Flag to turn on your dashed line
  };
};
const handleExportCsv$1 = (data) => {
  const headers = ["score", "percentage"];
  const lines = data.map(({ x: x2, y: y2 }) => [x2, y2]);
  const csv = [headers.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8," });
  const url = URL.createObjectURL(blob);
  downloadFile(url, "decisions_score_distribution.csv");
};
const DecisionsScoreDistribution = ({ query }) => {
  const { t: t2 } = useTranslation(["common", "analytics"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface-card border border-grey-border rounded-lg p-md flex flex-col gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typo, { variant: "title2", children: t2("analytics:decisions_score_distribution.title") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          disabled: !query.isSuccess || !query.data,
          variant: "secondary",
          className: "flex items-center gap-sm",
          onClick: () => query.data && handleExportCsv$1(query.data),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "download", className: "size-4" }),
            t2("analytics:export.button")
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-[500px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface-card border border-grey-border rounded-lg p-md mt-sm relative", children: [
      query.isFetching ? /* @__PURE__ */ jsxRuntimeExports.jsx(GraphSpinnerOverlay, {}) : null,
      query.isError ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 z-5 flex items-center justify-center rounded-lg bg-grey-background/80", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-60", children: t2("common:global_error") }) }) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex w-full h-[500px] flex-col items-end justify-end gap-md", children: M(query).with({ isSuccess: true }, (successQuery) => /* @__PURE__ */ jsxRuntimeExports.jsx(DecisionsScoreDistributionGraph, { data: successQuery.data ?? [] })).otherwise(() => null) })
    ] }) }) })
  ] });
};
const DecisionsScoreDistributionGraph = ({ data }) => {
  const { t: t2 } = useTranslation();
  const { bucketSize, min, max, hasOutliers } = reactExports.useMemo(() => {
    const bucketSize2 = Math.abs((data[1]?.x ?? 0) - (data[0]?.x ?? 0));
    const { min: min2, max: max2, hasOutliers: hasOutliers2 } = getFocusRange(data ?? []);
    return { bucketSize: bucketSize2, min: min2, max: max2, hasOutliers: hasOutliers2 };
  }, [data]);
  const values = reactExports.useMemo(() => {
    const rawData = data ?? [];
    if (!rawData.length) return [];
    const lastPoint = rawData[rawData.length - 1];
    if (!lastPoint) return rawData;
    if (bucketSize === 0) return rawData;
    return [{ x: rawData[0].x, y: min }, ...rawData, { x: lastPoint.x + bucketSize, y: min }];
  }, [data]);
  const [isExpanded, setIsExpanded] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between w-full items-baseline", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s", children: t2("analytics:decisions_score_distribution.left-axis-legend") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "secondary",
          className: "flex items-center gap-sm",
          disabled: !hasOutliers,
          onClick: () => setIsExpanded(!isExpanded),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: isExpanded ? "unfold_less" : "unfold_more", className: "size-4" }),
            isExpanded ? "Zoom in" : "Zoom out"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Me,
      {
        data: [
          {
            id: "distribution",
            data: values
          }
        ],
        margin: { top: 5, right: 10, bottom: 50, left: 50 },
        xScale: {
          type: "linear",
          min: values[0]?.x ?? 0,
          max: values[values.length - 1]?.x ?? 100
        },
        yScale: {
          type: "linear",
          min,
          max: isExpanded ? void 0 : max
        },
        curve: "stepAfter",
        enableArea: false,
        areaBaselineValue: Number(min),
        enablePoints: false,
        useMesh: true,
        theme: {
          text: { fill: "var(--color-grey-secondary)" },
          axis: { ticks: { text: { fill: "var(--color-grey-secondary)" } } },
          legends: { text: { fill: "var(--color-grey-secondary)" } },
          grid: { line: { stroke: "var(--color-grey-border)", strokeWidth: 1, strokeDasharray: "4 4" } }
        },
        axisLeft: {
          format: (value) => `${value} %`
        },
        axisBottom: {
          legendPosition: "end",
          legend: t2("analytics:decisions_score_distribution.bottom-axis-legend"),
          legendOffset: 40
        },
        yFormat: (value) => `${Number(value).toFixed(1)}%`,
        tooltip: ({ point }) => {
          if (point.absIndex === 0 || point.absIndex > data.length) {
            return null;
          }
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xs bg-surface-card px-md py-sm rounded-lg border border-grey-border shadow-md min-w-52 w-max whitespace-nowrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-primary font-semibold", children: `Score: ${point.data.x.toFixed(0)} → ${(point.data.x + bucketSize).toFixed(0)}` }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-md", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-secondary", children: t2("analytics:decisions_score_distribution.left-axis-legend") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-primary font-semibold", children: `${point.data.y.toFixed(2)}%` })
            ] })
          ] });
        },
        colors: ["#6D28D9"],
        motionConfig: {
          mass: 1,
          tension: 170,
          friction: 8,
          clamp: true
        }
      }
    ) })
  ] });
};
function AnalyticsTooltip({ className, content }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipV2.Provider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TooltipV2.Tooltip, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipV2.TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Icon,
      {
        icon: "tip",
        className: cn("text-grey-60 text-purple-primary hover:text-grey-secondary cursor-pointer ms-sm", className)
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipV2.TooltipContent, { children: content })
  ] }) });
}
const columnHelper$1 = createColumnHelper();
function RulesHit({ isComparingRanges, data, isLoading }) {
  const { t: t2 } = useTranslation(["analytics"]);
  const language = useFormatLanguage();
  const [expanded, setExpanded] = reactExports.useState(false);
  const visibleData = reactExports.useMemo(() => expanded ? data : data.slice(0, 5), [expanded, data]);
  const columns = reactExports.useMemo(
    () => [
      columnHelper$1.accessor((row) => row.ruleName, {
        id: "rule",
        header: t2("analytics:rule_hits.columns.rule"),
        size: 220,
        cell: ({ getValue }) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "line-clamp-1", children: getValue() })
      }),
      ...!isComparingRanges ? [
        columnHelper$1.accessor((row) => row.hitCount, {
          id: "hitCount",
          header: () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-s text-grey-primary flex flex-row items-center font-semibold", children: [
            t2("analytics:rule_hits.columns.hit_count"),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AnalyticsTooltip, { className: "size-4", content: t2("analytics:rule_hits.columns.hit_count.tooltip") })
          ] }),
          size: 100,
          cell: ({ getValue }) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatNumber(getValue().value, { language }) })
        })
      ] : [],
      columnHelper$1.accessor((row) => row.hitRatio, {
        id: "hitRatio",
        header: () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-s text-grey-primary flex flex-row items-center font-semibold", children: [
          t2("analytics:rule_hits.columns.hit_ratio"),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AnalyticsTooltip, { className: "size-4", content: t2("analytics:rule_hits.columns.hit_ratio.tooltip") })
        ] }),
        size: 120,
        cell: ({ getValue }) => {
          const value = getValue().value;
          const compare = getValue().compare;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "grid grid-cols-3 items-start font-semibold w-50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              formatNumber(Number(value), { language, maximumFractionDigits: 2 }),
              "%"
            ] }),
            compare !== void 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(CompareValue, { value: compare, delta: compare - value, className: "text-purple-primary" }) : null
          ] });
        }
      }),
      columnHelper$1.accessor((row) => row.falsePositiveRatio, {
        id: "falsePositiveRatio",
        header: () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-s text-grey-primary flex flex-row items-center font-semibold", children: [
          t2("analytics:rule_hits.columns.false_positive_ratio"),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            AnalyticsTooltip,
            {
              className: "size-4",
              content: t2("analytics:rule_hits.columns.false_positive_ratio.tooltip")
            }
          )
        ] }),
        size: 120,
        cell: ({ getValue }) => {
          const value = getValue().value;
          const compare = getValue().compare;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "grid grid-cols-3 items-start font-semibold w-50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              formatNumber(Number(value), { language, maximumFractionDigits: 2 }),
              "%"
            ] }),
            compare !== void 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              CompareValue,
              {
                higherIsBetter: false,
                value: compare,
                delta: compare - value,
                className: "text-purple-primary"
              }
            ) : null
          ] });
        }
      }),
      ...!isComparingRanges ? [
        columnHelper$1.accessor((row) => row.distinctPivots, {
          id: "distinctPivots",
          header: () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-s text-grey-primary flex flex-row items-center font-semibold", children: [
            t2("analytics:rule_hits.columns.pivot_count"),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AnalyticsTooltip, { className: "size-4", content: t2("analytics:rule_hits.columns.pivot_count.tooltip") })
          ] }),
          size: 140,
          cell: ({ getValue }) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatNumber(getValue().value, { language }) })
        })
      ] : [],
      columnHelper$1.accessor((row) => row.repeatRatio, {
        id: "repeatRatio",
        header: () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-s text-grey-primary flex flex-row items-center font-semibold", children: [
          t2("analytics:rule_hits.columns.pivot_ratio"),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AnalyticsTooltip, { className: "size-4", content: t2("analytics:rule_hits.columns.pivot_ratio.tooltip") })
        ] }),
        size: 160,
        cell: ({ getValue }) => {
          const value = getValue().value;
          const compare = getValue().compare;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "grid grid-cols-3 items-start w-50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              formatNumber(Number(getValue().value), { language, maximumFractionDigits: 2 }),
              " %"
            ] }),
            compare !== void 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(CompareValue, { value: compare, delta: compare - value, className: "text-purple-primary" }) : null
          ] });
        }
      })
    ],
    [columnHelper$1, language, t2, isComparingRanges]
  );
  const { table, getBodyProps, rows, getContainerProps } = useTable({
    data: visibleData,
    columns,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    enableSorting: false
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface-card border border-grey-border rounded-lg p-md flex flex-col gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typo, { variant: "title2", children: t2("analytics:rule_hits.title") }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { "aria-busy": isLoading, className: "relative", children: [
      isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-grey-background", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, { className: "size-6" }) }) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex w-full flex-col items-start gap-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table.Container, { ...getContainerProps(), className: "bg-surface-card w-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Table.Header, { headerGroups: table.getHeaderGroups() }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Table.Body, { ...getBodyProps(), children: [
          rows.map((row) => /* @__PURE__ */ jsxRuntimeExports.jsx(Table.Row, { row }, row.id)),
          !expanded && data.length > 5 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "tr",
            {
              className: "even:bg-surface-row h-12 hover:bg-purple-background-light cursor-pointer",
              onClick: () => setExpanded(true),
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "td",
                {
                  className: "text-s w-full truncate px-md font-medium text-purple-primary",
                  colSpan: table.getHeaderGroups()[0]?.headers.length ?? 5,
                  children: t2("analytics:rule_hits.see_more.label")
                }
              )
            }
          ) : null
        ] })
      ] }) }),
      !isLoading && !data.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-md text-grey-disabled", children: t2("analytics:no_data") }) }) : null
    ] })
  ] });
}
const deltaColor = cva("flex flex-row items-center text-xs", {
  variants: {
    higherIsBetter: {
      true: "",
      false: "",
      undefined: "text-purple-primary"
    },
    delta: {
      higher: "",
      lower: "",
      equal: "text-purple-primary"
    }
  },
  compoundVariants: [
    {
      higherIsBetter: true,
      delta: "higher",
      class: "text-green-primary"
    },
    {
      higherIsBetter: true,
      delta: "lower",
      class: "text-red-primary"
    },
    {
      higherIsBetter: false,
      delta: "lower",
      class: "text-green-primary"
    },
    {
      higherIsBetter: false,
      delta: "higher",
      class: "text-red-primary"
    }
  ]
});
function CompareValue({ value, delta, className, higherIsBetter }) {
  const language = useFormatLanguage();
  const absoluteDelta = Math.abs(delta);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className, children: formatNumber(value / 100, { language, maximumFractionDigits: 2, style: "percent" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: deltaColor({ higherIsBetter, delta: delta > 0 ? "higher" : delta === 0 ? "equal" : "lower" }), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: delta > 0 ? "arrow-2-up" : "arrow-2-down", className: "size-6 shrink-0" }),
      formatNumber(absoluteDelta, { language, maximumFractionDigits: 2 }),
      "pts"
    ] })
  ] });
}
const handleExportCsv = (data, decisions) => {
  const headers = ["rule", ...decisions.keys(), "total"];
  const lines = data.map(
    (row) => [
      row.rule,
      String(row.decline ?? 0),
      String(row.blockAndReview ?? 0),
      String(row.review ?? 0),
      String(row.approve ?? 0),
      String(row.total ?? 0)
    ].join(",")
  );
  const csv = [headers.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8," });
  const url = URL.createObjectURL(blob);
  downloadFile(url, `rule_vs_decision_outcomes.csv`);
};
function RuleVsDecisionOutcomes({
  data,
  isLoading = false
}) {
  const { t: t2 } = useTranslation(["analytics"]);
  const [decisions, setDecisions] = reactExports.useState(
    /* @__PURE__ */ new Map([
      ["decline", true],
      ["blockAndReview", true],
      ["review", true],
      ["approve", true]
    ])
  );
  const selectedOutcomes = Array.from(decisions.entries()).filter(([, value]) => value).map(([key]) => key);
  const maxValueScale = reactExports.useMemo(
    () => Math.max(
      ...data?.map((rule) => selectedOutcomes.reduce((acc, outcome) => acc + (rule[outcome] ?? 0), 0)) ?? []
    ),
    [data, selectedOutcomes]
  );
  const getBarColors2 = (d) => {
    const id = String(d.id);
    return OUTCOME_COLORS[id] ?? "#9ca3af";
  };
  const [isHovered, setIsHovered] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      onMouseEnter: () => {
        setIsHovered(true);
      },
      className: "bg-surface-card border border-grey-border rounded-lg p-md flex flex-col gap-sm",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typo, { variant: "title2", children: t2("analytics:rule_vs_decision_outcomes.title") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AnalyticsTooltip, { className: "size-5", content: t2("analytics:rule_vs_decision_outcomes.tooltip") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "secondary",
              className: "flex items-center gap-sm",
              disabled: isLoading || !data?.length,
              onClick: () => data && handleExportCsv(data, decisions),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "download", className: "size-4" }),
                t2("analytics:export.button")
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col relative", children: [
          isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-grey-background", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, { className: "size-6" }) }) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col", style: { height: data?.length ? data.length * 30 + 42 : "120px" }, children: data ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            RulesVsDecisionsOutcomesGraph,
            {
              data,
              selectedOutcomes,
              maxValueScale,
              getBarColors: getBarColors2
            }
          ) : null }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex w-full justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(OutcomeFilter, { disabled: !data?.length, decisions, onChange: setDecisions, highlight: isHovered }) })
        ] })
      ]
    }
  );
}
const RulesVsDecisionsOutcomesGraph = ({
  data,
  selectedOutcomes,
  maxValueScale,
  getBarColors: getBarColors2
}) => {
  const { t: t2 } = useTranslation(["analytics"]);
  const language = useFormatLanguage();
  return data.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-md h-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    Xe,
    {
      data: data ?? [],
      indexBy: "rule",
      enableLabel: false,
      keys: selectedOutcomes,
      padding: 0.6,
      margin: { top: 0, right: 20, bottom: 42, left: 240 },
      colors: getBarColors2,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: { from: "color" },
      defs: [
        {
          id: "ruleGradient",
          type: "linearGradient",
          colors: [
            { offset: 0, color: "inherit", opacity: 0.85 },
            { offset: 100, color: "inherit", opacity: 0.2 }
          ]
        }
      ],
      fill: [{ match: "*", id: "ruleGradient" }],
      layout: "horizontal",
      valueScale: { type: "linear", min: 0, max: maxValueScale },
      theme: {
        axis: {
          ticks: {
            text: {
              fontSize: "12px",
              fontFamily: "Inter",
              fill: "var(--color-grey-placeholder)"
            }
          }
        },
        grid: {
          line: {
            stroke: "var(--color-grey-border)",
            strokeWidth: 1,
            strokeDasharray: "4 4"
          }
        }
      },
      axisLeft: {
        tickSize: 0,
        tickPadding: 26,
        truncateTickAt: 35
      },
      enableGridX: true,
      gridXValues: [0, 25, 50, 75, 100],
      axisBottom: {
        format: (value) => formatPercentage(value, language),
        tickValues: [0, 25, 50, 75, 100]
      },
      tooltip: ({ id, value, data: data2 }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xs bg-surface-card px-md py-sm rounded-lg border border-grey-border shadow-md min-w-52 w-max whitespace-nowrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-primary font-semibold", children: data2.rule }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-md", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-secondary", children: String(id) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-s text-grey-primary font-semibold", children: [
            Number(value).toFixed(1),
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-grey-secondary", children: [
          t2("analytics:decisions.tooltip.total", { defaultValue: "Total" }),
          ": ",
          data2.total
        ] })
      ] }),
      motionConfig: {
        mass: 1,
        tension: 170,
        friction: 8,
        clamp: true,
        precision: 0.01,
        velocity: 0
      }
    }
  ) }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-md text-grey-disabled", children: t2("analytics:no_data") }) });
};
const columnHelper = createColumnHelper();
function ScreeningHits({ data, isLoading }) {
  const { t: t2 } = useTranslation(["analytics"]);
  const language = useFormatLanguage();
  const [expanded, setExpanded] = reactExports.useState(false);
  const toPercent = (value) => formatNumber(value > 1 ? value / 100 : value, {
    language,
    style: "percent",
    maximumFractionDigits: 1
  });
  const visibleData = reactExports.useMemo(() => expanded ? data : data.slice(0, 5), [expanded, data]);
  const columns = reactExports.useMemo(
    () => [
      columnHelper.accessor((row) => row.name, {
        id: "name",
        header: t2("analytics:screening_hits.columns.name"),
        cell: ({ getValue }) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "line-clamp-1", children: getValue() })
      }),
      columnHelper.accessor((row) => row.execs, {
        id: "execs",
        header: () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-s text-grey-primary flex flex-row items-center font-semibold", children: [
          t2("analytics:screening_hits.columns.execs"),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AnalyticsTooltip, { className: "size-4", content: t2("analytics:screening_hits.columns.execs.tooltip") })
        ] })
      }),
      columnHelper.accessor((row) => row.hits, {
        id: "hits",
        header: () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-s text-grey-primary flex flex-row items-center font-semibold", children: [
          t2("analytics:screening_hits.columns.hits"),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AnalyticsTooltip, { className: "size-4", content: t2("analytics:screening_hits.columns.hits.tooltip") })
        ] })
      }),
      columnHelper.accessor((row) => row.hitRatio, {
        id: "hitRatio",
        header: () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-s text-grey-primary flex flex-row items-center font-semibold", children: [
          t2("analytics:screening_hits.columns.hit_ratio"),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AnalyticsTooltip, { className: "size-4", content: t2("analytics:screening_hits.columns.hit_ratio.tooltip") })
        ] }),
        cell: ({ getValue }) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: toPercent(getValue()) })
      }),
      columnHelper.accessor((row) => row.avgHitsPerScreening, {
        id: "avgHitsPerScreening",
        header: () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-s text-grey-primary flex flex-row items-center font-semibold", children: [
          t2("analytics:screening_hits.columns.avg_hits_per_screening"),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            AnalyticsTooltip,
            {
              className: "size-4",
              content: t2("analytics:screening_hits.columns.avg_hits_per_screening.tooltip")
            }
          )
        ] }),
        cell: ({ getValue }) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatNumber(getValue(), { language }) })
      })
    ],
    [columnHelper, language, t2]
  );
  const { table, getBodyProps, rows, getContainerProps } = useTable({
    data: visibleData,
    columns,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    enableSorting: false
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface-card border border-grey-border rounded-lg p-md flex flex-col gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typo, { variant: "title2", children: t2("analytics:screening_hits.title") }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { "aria-busy": isLoading, className: "relative", children: [
      isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-grey-background", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, { className: "size-6" }) }) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex w-full flex-col items-start gap-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table.Container, { ...getContainerProps(), className: "bg-surface-card w-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Table.Header, { headerGroups: table.getHeaderGroups() }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Table.Body, { ...getBodyProps(), children: [
          rows.map((row) => /* @__PURE__ */ jsxRuntimeExports.jsx(Table.Row, { row }, row.id)),
          !expanded && data.length > 5 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "tr",
            {
              className: "even:bg-surface-row h-12 hover:bg-purple-background-light cursor-pointer",
              onClick: () => setExpanded(true),
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "td",
                {
                  className: "text-s w-full truncate px-md font-medium text-purple-primary",
                  colSpan: table.getHeaderGroups()[0]?.headers.length ?? 5,
                  children: t2("analytics:rule_hits.see_more.label")
                }
              )
            }
          ) : null
        ] })
      ] }) }),
      !isLoading && !data.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-md text-grey-disabled", children: t2("analytics:no_data") }) }) : null
    ] })
  ] });
}
const useGetAvailableFilters = ({ scenarioId, ranges }) => {
  const getAvailableFilters = useServerFn(getAvailableFiltersFn);
  return useQuery({
    queryKey: ["analytics", "available-filters", scenarioId, ranges],
    enabled: Array.isArray(ranges) && ranges.length > 0,
    placeholderData: keepPreviousData,
    queryFn: async () => getAvailableFilters({ data: { scenarioId, ranges } })
  });
};
const useAnalyticsDataQuery = ({ scenarioId, queryString }) => {
  const getDecisionOutcomesPerDay = useServerFn(getDecisionOutcomesPerDayFn);
  const getDecisionsScoreDistribution = useServerFn(getDecisionsScoreDistributionFn);
  const getRuleHitTable = useServerFn(getRuleHitTableFn);
  const getRuleVsDecisionOutcome = useServerFn(getRuleVsDecisionOutcomeFn);
  const getScreeningHitsTable = useServerFn(getScreeningHitsTableFn);
  const qs = queryString ? atob(queryString) : null;
  const parsed = JSON.parse(qs || "{}");
  const { range, compareRange, scenarioVersion, trigger } = parsed;
  const enabled = Boolean(qs && range);
  const queryData = { scenarioId, range, compareRange, scenarioVersion, trigger };
  const decisionsOutcomesPerDayQuery = useQuery({
    queryKey: ["analytics", "query", scenarioId, "decision-outcomes-per-day", queryString],
    enabled,
    queryFn: async () => getDecisionOutcomesPerDay({ data: queryData }),
    placeholderData: keepPreviousData
  });
  const decisionsScoreDistributionQuery = useQuery({
    queryKey: ["analytics", "query", scenarioId, "decisions-score-distribution", queryString],
    enabled,
    queryFn: async () => getDecisionsScoreDistribution({ data: queryData }),
    placeholderData: keepPreviousData
  });
  const ruleHitTableQuery = useQuery({
    queryKey: ["analytics", "query", scenarioId, "rule-hit-table", queryString],
    enabled,
    queryFn: async () => getRuleHitTable({ data: queryData }),
    placeholderData: keepPreviousData
  });
  const ruleVsDecisionOutcomeQuery = useQuery({
    queryKey: ["analytics", "query", scenarioId, "rule-vs-decision-outcome", queryString],
    enabled,
    queryFn: async () => getRuleVsDecisionOutcome({ data: queryData }),
    placeholderData: keepPreviousData
  });
  const screeningHitsTableQuery = useQuery({
    queryKey: ["analytics", "query", scenarioId, "screening-hits-table", queryString],
    enabled,
    queryFn: async () => getScreeningHitsTable({ data: queryData }),
    placeholderData: keepPreviousData
  });
  return {
    decisionsOutcomesPerDayQuery,
    decisionsScoreDistributionQuery,
    ruleHitTableQuery,
    ruleVsDecisionOutcomeQuery,
    screeningHitsTableQuery
  };
};
function Analytics() {
  const {
    scenarioId,
    scenarios,
    scenarioVersions,
    isAnalyticsAvailable: hasAnalyticsLicense
  } = Route.useLoaderData();
  const {
    t: t2,
    i18n
  } = useTranslation(["filters", "analytics"]);
  const navigate = useNavigate();
  const {
    q: queryString
  } = Route.useSearch();
  const parsedFiltersResult = reactExports.useMemo(() => {
    try {
      const decoded = queryString ? atob(queryString) : null;
      return decoded ? analyticsFiltersQuery.parse(JSON.parse(decoded)) : null;
    } catch {
      return null;
    }
  }, [queryString]);
  const [volatileScenarioId, setVolatileScenarioId] = reactExports.useState(null);
  const [volatileRange, setVolatileRange] = reactExports.useState();
  const [volatileCompareRange, setVolatileCompareRange] = reactExports.useState();
  const [selectedFilterNames, setSelectedFilterNames] = reactExports.useState([]);
  const [pendingDynamicFiltersReconciliationFor, setPendingDynamicFiltersReconciliationFor] = reactExports.useState(null);
  const triggerObjects = reactExports.useMemo(() => t$1(scenarios, t$2((scenario) => scenario.triggerObjectType), n()), [scenarios]);
  reactExports.useEffect(() => {
    setVolatileScenarioId(null);
    setVolatileRange(void 0);
    setVolatileCompareRange(void 0);
    setPendingDynamicFiltersReconciliationFor(null);
  }, [queryString]);
  reactExports.useEffect(() => {
    const triggerNames = parsedFiltersResult?.trigger?.map((t22) => t22.name) ?? [];
    setSelectedFilterNames(triggerNames);
  }, [scenarioId, queryString, parsedFiltersResult?.trigger]);
  const filtersValues = reactExports.useMemo(() => {
    const {
      trigger,
      scenarioVersion: _scenarioVersion,
      ...rest
    } = parsedFiltersResult ?? {};
    return {
      scenarioId,
      ...rest,
      ...Object.fromEntries(trigger?.map((t22) => [t22.name, t22]) ?? [])
    };
  }, [parsedFiltersResult, scenarioId]);
  const effectiveScenarioId = volatileScenarioId ?? scenarioId;
  const effectiveRanges = reactExports.useMemo(() => {
    const primary = volatileRange ?? parsedFiltersResult?.range;
    const secondary = volatileCompareRange ?? parsedFiltersResult?.compareRange;
    return [primary, secondary].filter(Boolean);
  }, [volatileRange, volatileCompareRange, parsedFiltersResult]);
  const availableFiltersQuery = useGetAvailableFilters({
    ranges: effectiveRanges,
    scenarioId: effectiveScenarioId
  });
  const {
    data: availableFilters
  } = availableFiltersQuery;
  const seenAvailableFilters = reactExports.useRef(/* @__PURE__ */ new Map());
  reactExports.useEffect(() => {
    availableFilters?.forEach((filter) => {
      seenAvailableFilters.current.set(filter.name, filter);
    });
  }, [availableFilters]);
  reactExports.useEffect(() => {
    if (pendingDynamicFiltersReconciliationFor !== effectiveScenarioId || availableFiltersQuery.isPlaceholderData || !availableFilters) {
      return;
    }
    const availableFilterNames = new Set(availableFilters.map((filter) => filter.name));
    setSelectedFilterNames((prev) => prev.filter((name) => availableFilterNames.has(name)));
    setPendingDynamicFiltersReconciliationFor(null);
  }, [availableFilters, availableFiltersQuery.isPlaceholderData, effectiveScenarioId, pendingDynamicFiltersReconciliationFor]);
  const allDynamicDescriptors = reactExports.useMemo(() => {
    const descriptors2 = /* @__PURE__ */ new Map();
    const appendToDescriptors = (filter, unavailable) => {
      const baseDescriptor = {
        name: filter.name,
        placeholder: filter.name,
        removable: true,
        unavailable,
        source: filter.source
      };
      switch (filter.type) {
        case "string":
          descriptors2.set(filter.name, {
            ...baseDescriptor,
            type: "text",
            op: "in"
          });
          break;
        case "number":
          descriptors2.set(filter.name, {
            ...baseDescriptor,
            type: "number",
            op: "="
          });
          break;
        case "boolean":
          descriptors2.set(filter.name, {
            ...baseDescriptor,
            type: "boolean"
          });
          break;
      }
    };
    seenAvailableFilters.current.forEach((filter) => appendToDescriptors(filter, true));
    availableFilters?.forEach((filter) => appendToDescriptors(filter, false));
    return Array.from(descriptors2.values());
  }, [availableFilters, seenAvailableFilters]);
  const dynamicDescriptors = reactExports.useMemo(() => allDynamicDescriptors.filter((d) => selectedFilterNames.includes(d.name)), [allDynamicDescriptors, selectedFilterNames]);
  const addSelectedFilter = (name) => setSelectedFilterNames((prev) => prev.includes(name) ? prev : [...prev, name]);
  const removeSelectedFilter = (name) => setSelectedFilterNames((prev) => prev.filter((n2) => n2 !== name));
  const {
    decisionsOutcomesPerDayQuery,
    decisionsScoreDistributionQuery,
    ruleHitTableQuery,
    ruleVsDecisionOutcomeQuery,
    screeningHitsTableQuery
  } = useAnalyticsDataQuery({
    scenarioId,
    queryString: queryString ?? ""
  });
  const onFiltersUpdate = (next) => {
    const draft = next.value;
    const nextScenarioId = draft["scenarioId"] ?? scenarioId;
    const filterDescriptorMap = new Map([...descriptors, ...dynamicDescriptors].map((d) => [d.name, d]));
    const trigger = Object.entries(draft).flatMap(([name, v]) => {
      const val = v;
      if (name === "scenarioId" || name === "range" || name === "compareRange") return [];
      const descriptor = filterDescriptorMap.get(name);
      if (!descriptor) return [];
      switch (descriptor.type) {
        case "text": {
          if (!val || typeof val !== "object" || !("op" in val) || !("value" in val)) {
            return [];
          }
          const textFilter = val;
          const values = Array.isArray(textFilter.value) ? textFilter.value.filter((v2) => v2 != null && String(v2).length > 0) : [];
          return values.length ? [{
            name,
            op: textFilter.op,
            value: values,
            unavailable: descriptor.unavailable
          }] : [];
        }
        case "number": {
          if (!val || typeof val !== "object" || !("op" in val) || !("value" in val)) {
            return [];
          }
          const numFilter = val;
          const raw = numFilter.value;
          const values = Array.isArray(raw) ? raw : [raw];
          const cleaned = values.filter((v2) => v2 !== null && v2 !== void 0 && (typeof v2 !== "string" || v2.length > 0));
          return cleaned.length ? [{
            name,
            op: numFilter.op,
            value: cleaned,
            unavailable: descriptor.unavailable
          }] : [];
        }
        case "boolean": {
          if (typeof val !== "boolean") return [];
          return [{
            name,
            op: "=",
            value: [val],
            unavailable: descriptor.unavailable
          }];
        }
        default:
          return [];
      }
    });
    const nextQuery = {
      range: draft["range"] ?? parsedFiltersResult?.range ?? {
        type: "dynamic",
        fromNow: "-P30D"
      },
      compareRange: draft["compareRange"],
      ...parsedFiltersResult?.scenarioVersion ? {
        scenarioVersion: parsedFiltersResult.scenarioVersion
      } : {},
      ...trigger.length && nextScenarioId === scenarioId ? {
        trigger
      } : {}
    };
    navigate({
      to: "/detection/analytics/$scenarioId",
      params: {
        scenarioId: fromUUIDtoSUUID(nextScenarioId)
      },
      search: {
        q: btoa(JSON.stringify(nextQuery))
      }
    });
  };
  const onInstantUpdate = (change) => {
    if (change.type === "set") {
      switch (change.name) {
        case "scenarioId":
          return setVolatileScenarioId(change.value);
        case "range":
          return setVolatileRange(change.value);
        case "compareRange":
          return setVolatileCompareRange(change.value);
      }
    }
    if (change.type === "remove" && change.name === "compareRange") {
      return setVolatileCompareRange(void 0);
    }
  };
  const onFilterChange = (change) => {
    onInstantUpdate(change);
    if (change.type === "set" && change.reconcileDynamicFilters) {
      setPendingDynamicFiltersReconciliationFor(change.value);
    }
    if (change.type === "remove" && selectedFilterNames.includes(change.name)) {
      removeSelectedFilter(change.name);
    }
  };
  const descriptors = [{
    type: "select",
    name: "scenarioId",
    placeholder: "placeholder-do-not-happen",
    options: scenarios.map((scenario) => ({
      label: scenario.name,
      value: scenario.id
    })),
    removable: false,
    instantUpdate: true
  }, {
    type: "date-range-popover",
    name: "range",
    placeholder: "placeholder-do-not-happen",
    removable: false,
    instantUpdate: true
  }, {
    type: "date-range-popover",
    name: "compareRange",
    placeholder: t2("analytics:filters.select_comparison_date_range.placeholder"),
    removable: true,
    instantUpdate: true
  }];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Page.Main, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Page.Content, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      DetectionNavigationTabs,
      {}
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(FormattingProvider, { value: {
      language: i18n.language,
      formatDateTimeWithoutPresets: (d, opts) => formatDateTimeWithoutPresets(d, {
        language: i18n.language,
        ...opts ?? {}
      }),
      formatDuration: (dur, lang) => formatDuration(dur, lang ?? i18n.language)
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface-page min-[2000px]:px-sm flex flex-col gap-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row gap-md mb-lg w-full justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-sm items-start", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FiltersBar, { descriptors, dynamicDescriptors, value: filtersValues, onUpdate: onFiltersUpdate, onChange: (change, _next) => onFilterChange(change) }),
          availableFilters && availableFilters.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(AddFilterMenu, { availableFilters, selectedFilterNames, onAddFilter: addSelectedFilter })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CustomFiltersForm, { triggerObjects, scenarioId: effectiveScenarioId, ranges: effectiveRanges })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col lg-analytics:flex-row gap-md w-full items-stretch h-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: hasAnalyticsLicense ? "lg-analytics:basis-2/3 min-w-0" : "min-w-0 w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Decisions, { data: decisionsOutcomesPerDayQuery.data ?? null, scenarioVersions, isLoading: decisionsOutcomesPerDayQuery.isFetching }) }),
        hasAnalyticsLicense ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg-analytics:basis-1/3 min-w-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DecisionsScoreDistribution, { query: decisionsScoreDistributionQuery }) }) : null
      ] }),
      hasAnalyticsLicense ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RulesHit, { isComparingRanges: effectiveRanges.length > 1, data: ruleHitTableQuery.data ?? [], isLoading: ruleHitTableQuery.isFetching }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(RuleVsDecisionOutcomes, { data: ruleVsDecisionOutcomeQuery.data ?? null, isLoading: ruleVsDecisionOutcomeQuery.isFetching }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ScreeningHits, { data: screeningHitsTableQuery.data ?? [], isLoading: screeningHitsTableQuery.isFetching })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(UpsellCard, { title: t2("analytics:upsell.title"), description: t2("analytics:upsell.description"), benefits: [t2("analytics:upsell.benefit_1"), t2("analytics:upsell.benefit_2"), t2("analytics:upsell.benefit_3")] })
    ] }) })
  ] }) });
}
function AddFilterMenu({
  availableFilters,
  selectedFilterNames,
  onAddFilter
}) {
  const {
    t: t2
  } = useTranslation(["analytics"]);
  const [open, setOpen] = reactExports.useState(false);
  const remainingFilters = availableFilters.filter((filter) => !selectedFilterNames.includes(filter.name));
  if (remainingFilters.length === 0) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Menu, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Trigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", appearance: "link", className: "my-xs shrink-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "plus", className: "size-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t2("analytics:filters.custom_filters.add_filter") })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Content, { align: "start", sideOffset: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.List, { children: remainingFilters.map((filter) => /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Item, { value: filter.name, onSelect: () => {
      onAddFilter(filter.name);
      setOpen(false);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: filter.name }) }, filter.name)) }) })
  ] });
}
export {
  Analytics as component
};
