import { r as reactExports, R as jsxRuntimeExports } from "../server.js";
import { c as columnHelper } from "./webhooks-B7GfXoFP.js";
import { C as Callout } from "./Callout-DX4NBXlG.js";
import { u as useTranslation, en as useTable, T as Typo, s as Trans, B as Button, e as Icon, ek as Table, em as getCoreRowModel } from "./format-NPGUXq-g.js";
import { P as Page } from "./router-vb7i5euz.js";
import { C as CollapsiblePaper } from "./Paper-6W_X6MFt.js";
import { E as ExternalLink } from "./ExternalLink-CG_77QdX.js";
import { E as EventTypes } from "./EventTypes-s30OEB2P.js";
import { w as webhooksSetupDocHref } from "./documentation-href-uAe88WFl.js";
import { b as captureException } from "./services-middleware-DR8Hua1Y.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
import "./sharpstate.es-CeF1Mf5b.js";
import "./isNullish-B8pc8Ntu.js";
import "./use-callback-ref-DXzIzfqy.js";
import "./QueryClientProvider-DYTpkCko.js";
import "./security-headers.server-BdP3HrPp.js";
import "./ThemeContext-B40HQxfH.js";
import "./config-ut8rAdyo.js";
import "./short-uuid-MIi3jWzx.js";
import "./createSsrRpc-ZXUHv2Er.js";
import "./i18n-instance-store-UssbGYOM.js";
import "./auth-middleware-C4ap47rJ.js";
import "./inboxes-D556s0BB.js";
import "./files-fO9wUXBf.js";
import "./CopyToClipboardButton-CJNJJful.js";
import "./case-detail-middleware-C3JS8Yme.js";
import "./input-validation-CU_reV2S.js";
import "./async-C3pYACua.js";
import "./decisions-B-2DmJW1.js";
import "./unique-CBeBxAXx.js";
import "./scenarios-8U74nJp4.js";
import "node:crypto";
function WebhooksError({
  error
}) {
  captureException(error);
  const {
    t
  } = useTranslation(["settings"]);
  const columns = reactExports.useMemo(() => {
    return [columnHelper.accessor((row) => row.url, {
      id: "url",
      header: t("settings:webhooks.url"),
      size: 200
    }), columnHelper.accessor((row) => row.eventTypes, {
      id: "eventTypes",
      header: t("settings:webhooks.event_types"),
      size: 200,
      cell: ({
        getValue
      }) => {
        const eventTypes = getValue();
        if (eventTypes.length === 0) {
          return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-disabled text-s", children: t("settings:webhooks.event_types.placeholder") });
        }
        return /* @__PURE__ */ jsxRuntimeExports.jsx(EventTypes, { eventTypes });
      }
    })];
  }, [t]);
  const {
    table,
    getBodyProps,
    rows,
    getContainerProps
  } = useTable({
    data: [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    enableSorting: false,
    enableColumnResizing: false
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Page.Content, { width: "readable", className: "relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-grey-primary/20 absolute z-50 flex size-full items-center justify-center p-md backdrop-blur-[2px] transition-all", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface-card border-grey-border flex max-w-[500px] flex-col items-center rounded-sm border shadow-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typo, { variant: "title1", className: "bg-grey-background w-full p-xl text-center", children: t("settings:webhooks.configuration_error") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full p-3xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Callout, { variant: "outlined", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-wrap", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trans, { t, i18nKey: "settings:webhooks.convoy_error", components: {
        DocLink: /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { href: webhooksSetupDocHref })
      } }) }) }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CollapsiblePaper.Container, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CollapsiblePaper.Title, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1", children: t("settings:webhooks") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "primary", disabled: true, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "plus", className: "size-5" }),
          t("settings:webhooks.new_webhook")
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CollapsiblePaper.Content, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Callout, { className: "mb-md lg:mb-lg", variant: "outlined", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-wrap", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trans, { t, i18nKey: "settings:webhooks.setup_documentation", components: {
          DocLink: /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { href: webhooksSetupDocHref })
        } }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Table.Container, { ...getContainerProps(), className: "max-h-96", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Table.Header, { headerGroups: table.getHeaderGroups() }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Table.Body, { ...getBodyProps(), children: rows.map((row) => {
            return /* @__PURE__ */ jsxRuntimeExports.jsx(Table.Row, { row }, row.id);
          }) })
        ] })
      ] })
    ] })
  ] });
}
export {
  WebhooksError as errorComponent
};
