import { R as jsxRuntimeExports, r as reactExports } from "../server.js";
import { u as useTheme } from "./ThemeContext-B40HQxfH.js";
import { q as useFormatLanguage, t as useFormatDateTime, dA as formatNumber, e4 as Modal, e as Icon, d as cn, u as useTranslation } from "./format-NPGUXq-g.js";
import { M as Map, a as Marker } from "./maplibre-gl-Dbgqr2_Q.js";
import { C as CopyToClipboardButton } from "./CopyToClipboardButton-CJNJJful.js";
import { E as ExternalLink } from "./ExternalLink-CG_77QdX.js";
import { r as resolveCoords, h as CARTO_BASEMAP, j as parseCoords } from "./DataField-vckdVtrg.js";
function FormatData({
  type,
  data,
  className,
  mapHeight,
  compact
}) {
  const language = useFormatLanguage();
  const formatDateTime = useFormatDateTime();
  if (!data) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className, children: "-" });
  }
  if (type === "Coords") {
    const opts = resolveCoords(data.value);
    if (!opts) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className, children: "-" });
    }
    if (compact) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(CompactCoordsField, { latitude: opts.latitude, longitude: opts.longitude, className });
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx(CoordsMap, { value: `${opts.latitude},${opts.longitude}`, height: mapHeight });
  }
  if (type === "IpAddress" && typeof data.value === "string") {
    const display = data.value.replace(/\/(32|128)$/, "");
    return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className, children: display });
  }
  switch (data.type) {
    case "DerivedData":
      if (compact) {
        return /* @__PURE__ */ jsxRuntimeExports.jsx(CompactDerivedDataField, { value: data.value });
      }
      return /* @__PURE__ */ jsxRuntimeExports.jsx(DerivedDataDetails, { value: data.value });
    case "url":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { href: data.value, className, children: data.value });
    case "datetime":
      return /* @__PURE__ */ jsxRuntimeExports.jsx("time", { dateTime: data.value, className, children: formatDateTime(data.value, {
        dateStyle: "short",
        timeStyle: "short"
      }) });
    case "number":
      return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className, children: formatNumber(data.value, { language }) });
    case "unknown":
      return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className, children: data.value ? String(data.value) : "-" });
  }
}
function DerivedDataDetails({ value }) {
  const { t } = useTranslation(["scenarios"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-start-2 grid w-full grid-cols-[auto_1fr] gap-x-4 rounded-lg border border-grey-border bg-surface-card p-md", children: Object.entries(value).map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs(reactExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-secondary", children: t(`scenarios:enriched_metadata.${k}`) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: String(v) })
  ] }, k)) });
}
function CompactDerivedDataField({ value }) {
  const { t } = useTranslation(["scenarios"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Root, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Trigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "text-purple-primary hover:text-purple-hover shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "eye", className: "size-4" }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Content, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { className: "sr-only", children: t("scenarios:enriched_metadata.title") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 p-lg", children: Object.entries(value).map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs(reactExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-secondary", children: t(`scenarios:enriched_metadata.${k}`) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: String(v) })
      ] }, k)) })
    ] })
  ] });
}
function CompactCoordsField({
  latitude,
  longitude,
  className
}) {
  const { theme } = useTheme();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("inline-flex items-center gap-xs", className), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "truncate", children: [
      latitude,
      ", ",
      longitude
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Root, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Trigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "text-purple-primary hover:text-purple-hover shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "world", className: "size-4" }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Content, { size: "medium", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CopyToClipboardButton, { toCopy: `${latitude},${longitude}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-s font-semibold", children: [
          latitude,
          ", ",
          longitude
        ] }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "isolate overflow-hidden rounded-lg border border-grey-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Map,
          {
            initialViewState: { latitude, longitude, zoom: 5 },
            style: { width: "100%", height: 400 },
            mapStyle: CARTO_BASEMAP[theme],
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Marker, { longitude, latitude, anchor: "bottom", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "map-pin", className: "size-4" }) })
          }
        ) }) })
      ] })
    ] })
  ] });
}
function CoordsMap({ value, height = 400 }) {
  const opts = parseCoords(value);
  const { theme } = useTheme();
  if (!opts) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "-" });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-start-2 flex w-full min-w-0 flex-col gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CopyToClipboardButton, { toCopy: `${opts.latitude},${opts.longitude}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-s line-clamp-1 font-semibold", children: [
      opts.latitude,
      ", ",
      opts.longitude
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "isolate overflow-hidden rounded-lg border border-grey-border bg-surface-card", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Map, { initialViewState: opts, style: { width: "100%", height }, mapStyle: CARTO_BASEMAP[theme], children: /* @__PURE__ */ jsxRuntimeExports.jsx(Marker, { longitude: opts.longitude, latitude: opts.latitude, anchor: "bottom", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "map-pin", className: "size-4" }) }) }) })
  ] });
}
export {
  FormatData as F
};
