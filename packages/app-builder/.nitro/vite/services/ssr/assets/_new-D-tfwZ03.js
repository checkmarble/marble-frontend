import { r as reactExports, R as jsxRuntimeExports, O as useRouter, ae as Outlet } from "../server.js";
import { C as CommentContext, a as ClientCommentForm } from "./ClientComments-C1YeqQ-K.js";
import { P as Page, B as BreadCrumbs, L as Link, aE as Route } from "./router-vb7i5euz.js";
import { B as Button, e as Icon, u as useTranslation, T as Typo, k as TooltipV2, d as cn, C as CtaV2ClassName, d_ as Tabs, d$ as tabClassName, e4 as Modal, e6 as Radio } from "./format-NPGUXq-g.js";
import { b as captureException, M } from "./services-middleware-DR8Hua1Y.js";
import { u as useFormDropzone } from "./useFormDropzone-BjTKexsf.js";
import { S as SnoozeCase, C as CloseCase, O as OpenCase, u as useEditSuspicionMutation } from "./SnoozeCase-BlOj3EC_.js";
import { I as listSuspicionActivityReportsFn, w as getNextUnassignedCaseFn } from "./cases-DJ9ABIdo.js";
import { u as useQuery } from "./useQuery-B7mL_evE.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
import { u as useGetAnnotationsQuery } from "./get-annotations-CiR2trFM.js";
import { D as DataModelContextProvider } from "./data-model-B-Bz1o1P.js";
import { b as fromUUIDtoSUUID } from "./short-uuid-MIi3jWzx.js";
import { u as useForm, a as useStore } from "./useForm-BwABQKAs.js";
import { y as useQueryClient } from "./QueryClientProvider-DYTpkCko.js";
import { z as zt } from "./CopyToClipboardButton-CJNJJful.js";
import { P as Panel } from "./Panel-kj8Z2GDk.js";
import { u as useLoaderRevalidator } from "./LoaderRevalidatorContext-C9s56i-l.js";
import { u as useAddCommentMutation } from "./add-comment-BaESvh7R.js";
import { u as useCreateKycEnrichmentQuery } from "./create-kyc-enrichment-CZ2VFgCE.js";
import { M as Markdown } from "./Markdown-sjqeOXzy.js";
import { C as Callout } from "./Callout-DX4NBXlG.js";
import { S as Spinner } from "./Spinner-GK6cEAdR.js";
import { g as editSuspicionPayloadSchema } from "./cases-PZYcTUxr.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
import "./organization-users-Bxl0ZW8k.js";
import "./create-context-CYc8deix.js";
import "./index-DhVP5FgH.js";
import "./index-C_WgunUr.js";
import "./index-CR1bHmei.js";
import "./Avatar-DpA4jY60.js";
import "./Card-9LKESqlf.js";
import "./ClientCommentForm-D-0vcWN7.js";
import "./data-BFm2FCTm.js";
import "./createSsrRpc-ZXUHv2Er.js";
import "./auth-middleware-C4ap47rJ.js";
import "./data-fdG1PpsD.js";
import "./useMutation-C5oG90Zs.js";
import "./Time-IafhAG3W.js";
import "./annotations-DpAN3M8g.js";
import "./form-D2XmDKeG.js";
import "./array-BFSjnO9c.js";
import "./use-callback-ref-DXzIzfqy.js";
import "./security-headers.server-BdP3HrPp.js";
import "./ThemeContext-B40HQxfH.js";
import "./config-ut8rAdyo.js";
import "./i18n-instance-store-UssbGYOM.js";
import "./inboxes-D556s0BB.js";
import "./files-fO9wUXBf.js";
import "./case-detail-middleware-C3JS8Yme.js";
import "./input-validation-CU_reV2S.js";
import "./async-C3pYACua.js";
import "./decisions-B-2DmJW1.js";
import "./unique-CBeBxAXx.js";
import "./scenarios-8U74nJp4.js";
import "./sharpstate.es-CeF1Mf5b.js";
import "./isNullish-B8pc8Ntu.js";
import "node:crypto";
import "./FormErrorOrDescription-DO6Hdfmn.js";
import "./FormLabel-DeCgtgtj.js";
import "./index-x7n7VJTa.js";
import "./FormTextArea-BlK7vs_g.js";
import "./open-case-BHErop52.js";
import "./index-BsFKI8Kt.js";
import "./constructNow-sBxu05z3.js";
import "./useBaseQuery-CMboOtTR.js";
import "./Code-C6D_KXb1.js";
function ActionBar({ children, more }) {
  const childrenArray = reactExports.Children.toArray(children);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex gap-sm bg-purple-background-light border border-purple-border rounded-md dark:bg-grey-background-light dark:border-grey-border p-sm", children: [
    childrenArray.map((child, i, arr) => {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(reactExports.Fragment, { children: [
        child,
        i < arr.length - 1 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "self-stretch w-px bg-purple-border dark:bg-grey-border" }) : null
      ] }, i);
    }),
    more ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", appearance: "stroked", mode: "icon", onClick: more.onClick, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: more.icon, className: "size-4" }) }) : null
  ] });
}
function ActionButton({ icon, disabled, text, onClick }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { disabled, appearance: "link", onClick, children: [
    icon ? /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon, className: "size-4" }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: text })
  ] });
}
function useSarReportsQuery(caseId) {
  const listSuspicionActivityReports = useServerFn(listSuspicionActivityReportsFn);
  return useQuery({
    queryKey: ["sar-reports", caseId],
    queryFn: () => {
      return listSuspicionActivityReports({ data: { caseId } });
    }
  });
}
function KycEnrichmentPanel({ caseId, open, onOpenChange }) {
  const { t } = useTranslation(["cases", "common"]);
  const revalidate = useLoaderRevalidator();
  const [isCommentAdded, setIsCommentAdded] = reactExports.useState(false);
  const { data, isPending, error, refetch, isSuccess, status } = useCreateKycEnrichmentQuery(caseId);
  const addCommentMutation = useAddCommentMutation();
  const kycCaseEnrichment = data?.kycCaseEnrichments[0];
  reactExports.useEffect(() => {
    if (open && status !== "success") {
      refetch();
    }
  }, [open, status, refetch]);
  reactExports.useEffect(() => {
    if ((error || isSuccess && !data.success) && open) {
      zt.error(t("cases:kyc_enrichment.loading.toaster.error"));
      onOpenChange(false);
    }
  }, [error, isSuccess, data?.success, open, onOpenChange, t]);
  const handleAddComment = async () => {
    if (!kycCaseEnrichment) return;
    const comment = kycCaseEnrichment.analysis + "\n\n" + kycCaseEnrichment.citations.map((citation, index) => `\\[${index + 1}\\] [${citation.title}](${citation.url} "${citation.title}")`).join("\n");
    try {
      await addCommentMutation.mutateAsync({ caseId, comment, files: [] });
      setIsCommentAdded(true);
      zt.success(t("cases:kyc_enrichment.comment_added.toaster.success"));
      revalidate();
      onOpenChange(false);
    } catch (e) {
      captureException(e);
      zt.error(t("cases:kyc_enrichment.comment_added.toaster.error"));
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Root, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Container, { size: "medium", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel.Content, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Header, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "ai-review", className: "size-5 text-purple-primary shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typo, { variant: "title2", className: "flex-1 text-grey-primary", children: t("cases:kyc_enrichment.title") })
    ] }) }),
    isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-center gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, { className: "size-6" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("cases:kyc_enrichment.loading") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AnalysisSkeleton, {})
    ] }) : null,
    error ? /* @__PURE__ */ jsxRuntimeExports.jsx(Callout, { variant: "outlined", children: error.message }) : null,
    isSuccess && data.success && kycCaseEnrichment ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Callout, { variant: "outlined", children: [
        t("cases:kyc_enrichment.for"),
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: kycCaseEnrichment.entityName })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Markdown, { children: kycCaseEnrichment.analysis }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-md", children: kycCaseEnrichment.citations.map((citation, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-sm flex gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "[",
          index + 1,
          "]"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "a",
          {
            className: "text-purple-primary hover:bg-purple-background hover:text-grey-secondary",
            href: citation.url,
            children: citation.title
          }
        )
      ] }, `citation.${index}`)) })
    ] }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel.Footer, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Panel.FooterButton,
        {
          isCloseButton: true,
          disabled: addCommentMutation.isPending,
          variant: "secondary",
          onClick: () => onOpenChange(false),
          label: t("common:close")
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Panel.FooterButton,
        {
          disabled: addCommentMutation.isPending || !isSuccess || isCommentAdded,
          variant: "primary",
          onClick: () => handleAddComment(),
          label: t("cases:kyc_enrichment.attach_to_case")
        }
      )
    ] })
  ] }) }) });
}
function AnalysisSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-row gap-lg p-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-fit flex-2 flex-col gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-row items-center justify-between gap-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-grey-border h-4 w-32 animate-pulse rounded-md" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-grey-border h-12 animate-pulse rounded-lg" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-grey-border h-14 animate-pulse rounded-lg" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-grey-border h-12 animate-pulse rounded-lg" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-grey-border h-16 animate-pulse rounded-lg" })
  ] }) });
}
function CaseManagerPageLayout({
  children,
  caseDetail,
  pivotObjects,
  dataModel,
  dataModelFeatureAccess
}) {
  const { t } = useTranslation(["cases"]);
  const [sarReportModalOpen, setSarReportModalOpen] = reactExports.useState(false);
  const [kycEnrichmentPanelOpen, setKycEnrichmentPanelOpen] = reactExports.useState(false);
  const { info } = CommentContext.useValue();
  const sarReportsQuery = useSarReportsQuery(caseDetail.id);
  const getNextUnassignedCase = useServerFn(getNextUnassignedCaseFn);
  const router = useRouter();
  const nextUnassignedCaseHref = router.buildLocation({
    to: "/ressources/cases/next-unassigned/$caseId",
    params: { caseId: fromUUIDtoSUUID(caseDetail.id) }
  }).href;
  const handleSarAction = () => {
    setSarReportModalOpen(true);
  };
  const handleKycEnrichAction = () => {
    setKycEnrichmentPanelOpen(true);
  };
  const sarStatus = sarReportsQuery.data?.[0]?.status;
  const isSarCompleted = sarStatus === "completed";
  const sarActionText = M(sarStatus).with(void 0, () => t("cases:manager.actions.create_sar")).with("pending", () => t("cases:manager.actions.complete_sar")).with("completed", () => t("cases:manager.actions.sar_completed")).exhaustive();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Page.Main, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Page.Header, { color: "page", className: "justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(BreadCrumbs, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-sm", children: [
        caseDetail.status !== "closed" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SnoozeCase, { caseId: caseDetail.id, snoozeUntil: caseDetail.snoozedUntil }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CloseCase, { id: caseDetail.id })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(OpenCase, { id: caseDetail.id }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TooltipV2.Tooltip, { delayDuration: 0, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipV2.TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "a",
            {
              href: nextUnassignedCaseHref,
              "aria-label": t("cases:next_unassigned_case"),
              className: cn(CtaV2ClassName({ variant: "secondary", mode: "icon" }), "hover:bg-grey-background"),
              onClick: (e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                e.preventDefault();
                getNextUnassignedCase({ data: { caseId: caseDetail.id } });
              },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "arrow-right", className: "size-4" })
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipV2.TooltipContent, { children: t("cases:next_unassigned_case") })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Page.Container, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Page.Content, { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between mb-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { className: tabClassName, from: "/cases/s/$caseId", to: "./principal", preload: "render", children: t("cases:case_detail.tab.principal") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Link,
            {
              disabled: !pivotObjects.length,
              className: tabClassName,
              from: "/cases/s/$caseId",
              to: "./clients",
              preload: pivotObjects.length ? "render" : false,
              children: t("cases:manager.tab.clients_concerned")
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(ActionBar, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ActionButton, { disabled: isSarCompleted, icon: "plus", text: sarActionText, onClick: handleSarAction }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            ActionButton,
            {
              disabled: pivotObjects.length === 0,
              icon: "plus",
              text: t("cases:manager.actions.enrich_kyc_profile"),
              onClick: handleKycEnrichAction
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DataModelContextProvider, { dataModel, dataModelFeatureAccess, children }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        SarReportModal,
        {
          open: sarReportModalOpen,
          onOpenChange: setSarReportModalOpen,
          caseId: caseDetail.id,
          report: sarReportsQuery.data?.[0]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        KycEnrichmentPanel,
        {
          caseId: caseDetail.id,
          open: kycEnrichmentPanelOpen,
          onOpenChange: setKycEnrichmentPanelOpen
        }
      ),
      info ? /* @__PURE__ */ jsxRuntimeExports.jsx(StickyCommentForm, { ...info }) : null
    ] }) })
  ] });
}
function StickyCommentForm({ objectId, objectType }) {
  const annotationsQuery = useGetAnnotationsQuery(objectType, objectId, true);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sticky flex justify-end right-lg bottom-lg mt-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClientCommentForm, { annotationsQuery, objectId, objectType }) });
}
function SarReportModal({ open, onOpenChange, caseId, report }) {
  const { t } = useTranslation(["common", "cases"]);
  const editSuspicionMutation = useEditSuspicionMutation();
  const initialStatus = report?.status;
  const queryClient = useQueryClient();
  const { getRootProps, getInputProps, isDragActive } = useFormDropzone({
    multiple: false,
    onDrop: (acceptedFiles) => {
      form.setFieldValue("file", acceptedFiles[0]);
      form.validate("change");
    }
  });
  const form = useForm({
    onSubmit: ({ value }) => {
      editSuspicionMutation.mutateAsync(value).then((res) => {
        if (!res.success) {
          zt.error(t("common:errors.unknown"));
          return;
        }
        onOpenChange(false);
        form.setFieldValue("reportId", res.data?.id);
        queryClient.invalidateQueries({ queryKey: ["sar-reports", caseId] });
      }).catch(() => {
        zt.error(t("common:errors.unknown"));
      });
    },
    defaultValues: {
      caseId,
      status: !initialStatus ? "none" : "completed",
      reportId: editSuspicionMutation.data?.data?.id ?? report?.id
    },
    validators: {
      onSubmit: editSuspicionPayloadSchema
    }
  });
  const reportFile = useStore(form.store, (state) => state.values.file);
  const newStatus = useStore(form.store, (state) => state.values.status);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Root, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Content, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-md p-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typo, { variant: "title2", children: t("cases:manager.sar_modal.title") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: initialStatus ? t("cases:sar.modale.callout_add_documents") : t("cases:sar.modale.callout_new_report") }),
      !initialStatus ? /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "status", children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Radio.Root,
        {
          value: field.state.value,
          onValueChange: (v) => field.handleChange(v),
          className: "flex flex-col",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-md px-md items-center h-9", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Radio.Item, { value: "pending" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: t("cases:manager.sar_modal.status_pending") })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-md px-md items-center h-9", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Radio.Item, { value: "completed" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: t("cases:manager.sar_modal.status_completed") })
            ] })
          ]
        }
      ) }) : null,
      newStatus === "completed" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          ...getRootProps(),
          className: cn(
            "flex flex-col items-center justify-center gap-lg rounded-sm border-2 border-dashed p-lg",
            isDragActive ? "bg-purple-background border-purple-disabled opacity-90" : "border-grey-border"
          ),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ...getInputProps() }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xs justify-center text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex gap-sm items-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "attachment", className: "size-6 -rotate-45 text-grey-secondary" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-purple-primary font-medium", children: t("cases:manager.sar_modal.add_documents") })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-tiny text-grey-secondary", children: t("cases:drop_file_accepted_types") })
            ] }),
            reportFile ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "border-grey-border flex items-center gap-xs rounded-sm border px-xs py-2xs text-xs font-medium", children: [
              reportFile.name,
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "secondary",
                  appearance: "link",
                  mode: "icon",
                  onClick: () => form.setFieldValue("file", void 0),
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "cross", className: "text-grey-primary size-4" })
                }
              )
            ] }) : null
          ]
        }
      ) : null
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Footer, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { isCloseButton: true, label: t("common:cancel") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { label: t("common:validate"), onClick: () => form.handleSubmit() })
    ] })
  ] }) });
}
function RouteComponent() {
  const routeContext = Route.useRouteContext();
  const [currentlyInvestigated, setCurrentlyInvestigated] = reactExports.useState(null);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(CommentContext.Provider, { value: {
    info: currentlyInvestigated,
    set: setCurrentlyInvestigated
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CaseManagerPageLayout, { ...routeContext, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) }) });
}
export {
  RouteComponent as component
};
