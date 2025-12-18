import { R as jsxRuntimeExports, ae as Outlet } from "../server.js";
import { av as casesI18n, aU as Route, P as Page, B as BreadCrumbs } from "./router-vb7i5euz.js";
import { u as useTranslation, e as Icon, B as Button } from "./format-NPGUXq-g.js";
import { T as TabLink } from "./Navigation-BesW3Lcl.js";
import { u as useUploadScreeningFile, U as UploadFile } from "./upload-screening-file-BMRNTnx5.js";
import { b as fromUUIDtoSUUID } from "./short-uuid-MIi3jWzx.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
import "./QueryClientProvider-DYTpkCko.js";
import "./security-headers.server-BdP3HrPp.js";
import "./services-middleware-DR8Hua1Y.js";
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
import "./LoaderRevalidatorContext-C9s56i-l.js";
import "./useFormDropzone-BjTKexsf.js";
import "./screenings-CS8peAlI.js";
import "./useMutation-C5oG90Zs.js";
import "./useServerFn-CrqFKl7V.js";
function CaseSanctionReviewPage() {
  const {
    t
  } = useTranslation([...casesI18n, "common", "navigation"]);
  const {
    caseDetail,
    screening
  } = Route.useLoaderData();
  const {
    mutateAsync: uploadScreeningFile
  } = useUploadScreeningFile(screening.id);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Page.Main, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Page.Header, { className: "justify-between gap-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BreadCrumbs, { back: `/cases/${fromUUIDtoSUUID(caseDetail.id)}` }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex size-full flex-col overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Page.Container, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Page.Content, { width: "readable", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "bg-surface-card border-grey-border inline-flex flex-row gap-sm rounded-lg border p-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TabLink, { labelTKey: "navigation:case_manager.hits", to: "./hits", Icon: (props) => /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { ...props, icon: "tip" }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TabLink, { labelTKey: "navigation:case_manager.files", to: "./files", Icon: (props) => /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { ...props, icon: "attachment" }) }) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-surface-card border-t-grey-border flex shrink-0 flex-row items-center justify-end gap-md border-t p-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx(UploadFile, { uploadFileEndpoint: uploadScreeningFile, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "h-14 w-fit whitespace-nowrap", variant: "secondary", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "attachment", className: "size-5" }),
        t("cases:add_file")
      ] }) }) })
    ] })
  ] });
}
export {
  CaseSanctionReviewPage as component
};
