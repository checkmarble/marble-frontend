import { r as reactExports, R as jsxRuntimeExports } from "../server.js";
import { c as columnHelper } from "./webhooks-B7GfXoFP.js";
import { C as Callout } from "./Callout-DX4NBXlG.js";
import { x as Route, P as Page, L as Link } from "./router-vb7i5euz.js";
import { u as useTranslation, en as useTable, B as Button, e as Icon, s as Trans, ek as Table, em as getCoreRowModel } from "./format-NPGUXq-g.js";
import { C as CollapsiblePaper } from "./Paper-6W_X6MFt.js";
import { E as ExternalLink } from "./ExternalLink-CG_77QdX.js";
import { C as CreateWebhook } from "./CreateWebhook-CGusmE0t.js";
import { E as EventTypes } from "./EventTypes-s30OEB2P.js";
import { w as webhooksSetupDocHref } from "./documentation-href-uAe88WFl.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
import "./QueryClientProvider-DYTpkCko.js";
import "./security-headers.server-BdP3HrPp.js";
import "./services-middleware-DR8Hua1Y.js";
import "./short-uuid-MIi3jWzx.js";
import "node:crypto";
import "./ThemeContext-B40HQxfH.js";
import "./config-ut8rAdyo.js";
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
import "./sharpstate.es-CeF1Mf5b.js";
import "./isNullish-B8pc8Ntu.js";
import "./use-callback-ref-DXzIzfqy.js";
import "./FormErrorOrDescription-DO6Hdfmn.js";
import "./FormInput-S5xzkMXf.js";
import "./FormLabel-DeCgtgtj.js";
import "./index-x7n7VJTa.js";
import "./index-C_WgunUr.js";
import "./Nudge-C1ux5IUa.js";
import "./index-CtZTigeT.js";
import "./index-BF4TC3go.js";
import "./index-CR1bHmei.js";
import "./LoaderRevalidatorContext-C9s56i-l.js";
import "./settings-CEpHMlp5.js";
import "./settings-CPv2zx4k.js";
import "./useMutation-C5oG90Zs.js";
import "./useServerFn-CrqFKl7V.js";
import "./form-D2XmDKeG.js";
import "./array-BFSjnO9c.js";
import "./useForm-BwABQKAs.js";
function Webhooks() {
  const {
    t
  } = useTranslation(["settings"]);
  const {
    webhooks,
    isCreateWebhookAvailable,
    webhooksStatus
  } = Route.useLoaderData();
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
    data: webhooks,
    columns,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    enableSorting: false,
    rowLink: (webhook) => /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/settings/webhooks/$webhookId", params: {
      webhookId: webhook.id
    } })
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Page.Content, { width: "readable", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CollapsiblePaper.Container, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CollapsiblePaper.Title, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1", children: t("settings:webhooks") }),
      isCreateWebhookAvailable ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(CreateWebhook, { webhookStatus: webhooksStatus, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "primary", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "plus", className: "size-5" }),
        t("settings:webhooks.new_webhook")
      ] }) }) }) : null
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
  ] }) });
}
export {
  Webhooks as component
};
