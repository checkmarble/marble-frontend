import { R as jsxRuntimeExports, r as reactExports, $ as ClientOnly, O as useRouter } from "../server.js";
import { av as casesI18n, Q as CaseStatusBadgeV2, aB as Route, P as Page, B as BreadCrumbs } from "./router-vb7i5euz.js";
import { b as clsx, f as cva, c as createSimpleContext, u as useTranslation, B as Button, e as Icon, d as cn, q as useFormatLanguage, t as useFormatDateTime, d_ as Tabs, d$ as tabClassName, fs as formatRelative, e4 as Modal, T as Typo, C as CtaV2ClassName } from "./format-NPGUXq-g.js";
import { c_ as isRuleExecutionHit, aE as getDateFnsLocale, M, B as isAdmin } from "./services-middleware-DR8Hua1Y.js";
import { D as DataModelExplorerContext, u as useIntersection, d as DataModelExplorer, b as DataModelExplorerProvider } from "./DataModelExplorer-gjwcxdcr.js";
import { P as PivotsPanelContent, u as useRulesByPivotQuery, e, a as PivotObjectDetails, A as AddRuleSnooze, S as ScoreModifier, b as useCaseReviewFeedbackMutation, c as useAddReviewToCaseCommentsMutation, d as useCaseDecisionsQuery, C as CaseAlerts } from "./CaseAlerts-ZrdMVN_1.js";
import { N as Nudge } from "./Nudge-C1ux5IUa.js";
import { R as RuleGroup } from "./RuleGroup-DlaoMKK-.js";
import { E as EditCaseInbox, a as EditCaseAssignee, C as CaseEvents, A as AddComment } from "./escalate-case-CwnOzYrx.js";
import { u as useEditSuspicionMutation, S as SnoozeCase, C as CloseCase, O as OpenCase } from "./SnoozeCase-BlOj3EC_.js";
import { u as useLoaderRevalidator } from "./LoaderRevalidatorContext-C9s56i-l.js";
import { z as zt, u as useGetCopyToClipboard } from "./CopyToClipboardButton-CJNJJful.js";
import { M as Markdown } from "./Markdown-sjqeOXzy.js";
import { a as EscalateCase, E as EditCaseName, b as EditCaseTags, C as CaseFileButton } from "./EscalateCase-DTzFZeIC.js";
import { C as Callout } from "./Callout-DX4NBXlG.js";
import { u as useFormDropzone } from "./useFormDropzone-BjTKexsf.js";
import { u as useForm, a as useStore } from "./useForm-BwABQKAs.js";
import { g as editSuspicionPayloadSchema } from "./cases-PZYcTUxr.js";
import { M as MY_INBOX_ID } from "./inboxes-D556s0BB.js";
import { w as getNextUnassignedCaseFn } from "./cases-DJ9ABIdo.js";
import { b as fromUUIDtoSUUID } from "./short-uuid-MIi3jWzx.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
import "./QueryClientProvider-DYTpkCko.js";
import "./security-headers.server-BdP3HrPp.js";
import "./ThemeContext-B40HQxfH.js";
import "./config-ut8rAdyo.js";
import "./createSsrRpc-ZXUHv2Er.js";
import "./i18n-instance-store-UssbGYOM.js";
import "./auth-middleware-C4ap47rJ.js";
import "./files-fO9wUXBf.js";
import "./case-detail-middleware-C3JS8Yme.js";
import "./input-validation-CU_reV2S.js";
import "./async-C3pYACua.js";
import "./decisions-B-2DmJW1.js";
import "./unique-CBeBxAXx.js";
import "./scenarios-8U74nJp4.js";
import "./sharpstate.es-CeF1Mf5b.js";
import "./isNullish-B8pc8Ntu.js";
import "./use-callback-ref-DXzIzfqy.js";
import "node:crypto";
import "./data-BFm2FCTm.js";
import "./data-fdG1PpsD.js";
import "./useInfiniteQuery-D2tvMYRf.js";
import "./useBaseQuery-CMboOtTR.js";
import "./DataField-vckdVtrg.js";
import "./Spinner-GK6cEAdR.js";
import "./useQuery-B7mL_evE.js";
import "./isNonNullish-DgEqPJBU.js";
import "./data-model-B-Bz1o1P.js";
import "./create-context-CYc8deix.js";
import "./dataTypeSchema-DvqJgdgd.js";
import "./mapToObj-wQ-uHOuD.js";
import "./omit-ZO4dmkWK.js";
import "./FormatData-TXRe9nHU.js";
import "./maplibre-gl-Dbgqr2_Q.js";
import "./ExternalLink-CG_77QdX.js";
import "./ClientCommentForm-D-0vcWN7.js";
import "./useMutation-C5oG90Zs.js";
import "./Time-IafhAG3W.js";
import "./annotations-DpAN3M8g.js";
import "./form-D2XmDKeG.js";
import "./array-BFSjnO9c.js";
import "./DownloadFilesService-BW-xJtj3.js";
import "./download-file-C533i5xX.js";
import "./TagPreview-CjmrrQF6.js";
import "./organization-object-tags-C9Gf0Ixc.js";
import "./isDeepEqual-C0XXZLYo.js";
import "./organization-users-Bxl0ZW8k.js";
import "./Avatar-DpA4jY60.js";
import "./PivotNavigationOptions-CrxM6N-5.js";
import "./FormErrorOrDescription-DO6Hdfmn.js";
import "./create-navigation-option-DrtWhyLE.js";
import "./uniqueBy-Tn1hUkKJ.js";
import "./flatMap-CbF5uMEQ.js";
import "./add-comment-BaESvh7R.js";
import "./create-kyc-enrichment-CZ2VFgCE.js";
import "./FormInput-S5xzkMXf.js";
import "./FormLabel-DeCgtgtj.js";
import "./index-x7n7VJTa.js";
import "./index-C_WgunUr.js";
import "./documentation-href-uAe88WFl.js";
import "./Panel-kj8Z2GDk.js";
import "./screenings-CS8peAlI.js";
import "./search-screening-matches-CgACX5Vl.js";
import "./match-sorting-Cy-ZyfsJ.js";
import "./FreeformMatchCard-JGOBIPO0.js";
import "./dataset-utils-C1Lb7jdi.js";
import "./screening-entity-DVQtf50p.js";
import "./lists-config-CsQWGvXL.js";
import "./useEntityName-n7_MOPuL.js";
import "./use-callback-ref-AfyBSz95.js";
import "./EntityTypePopover-CRaDLSH9.js";
import "./set-additional-fields-BAjwURJS.js";
import "./keys-CPbIGTB1.js";
import "./TriggerObjectDetail-BL8JBhBZ.js";
import "./StatusRadioGroup-BTpRIK0f.js";
import "./user-C_y5ayGi.js";
import "./join-BeQTfqAC.js";
import "./Card-9LKESqlf.js";
import "./IngestedObjectDetailModal-BFFwOF2a.js";
import "./RulesDetail-19MjhcYa.js";
import "./Paper-6W_X6MFt.js";
import "./index-DCH5hwXA.js";
import "./isArray-gJc74O_I.js";
import "./index-CtZTigeT.js";
import "./index-BF4TC3go.js";
import "./index-CR1bHmei.js";
import "./display-TKj7AN5a.js";
import "./scenario-validation-error-messages-CB3GcwJ8.js";
import "./hovercard-provider-BchUL2eY.js";
import "./organization-detail-YGkE0F4y.js";
import "./index-DhVP5FgH.js";
import "./decisions-lgLe1L4K.js";
import "./OutcomeTag-BH_m80fa.js";
import "./Code-C6D_KXb1.js";
import "./endOfDay-DlzjvxTr.js";
import "./get-inboxes-6fSfvled.js";
import "./organization-tags-CEJpwTHZ.js";
import "./allPass-LKKfzhYC.js";
import "./curry-D3P8tFW_.js";
import "./FormTextArea-BlK7vs_g.js";
import "./open-case-BHErop52.js";
import "./index-BsFKI8Kt.js";
import "./constructNow-sBxu05z3.js";
const drawerIconColorVariants = cva(["flex items-center justify-center"], {
  variants: {
    active: {
      false: "text-grey-secondary",
      true: "text-purple-primary"
    }
  },
  defaultVariants: {
    active: false
  }
});
function DrawerIcon({ size, active }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { tabIndex: -1, className: clsx("size-3.5", drawerIconColorVariants({ active })), children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", children: size === "large" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
    "path",
    {
      fillRule: "evenodd",
      clipRule: "evenodd",
      d: "M4 4C2.89543 4 2 4.89543 2 6V18C2 19.1046 2.89543 20 4 20H20C21.1046 20 22 19.1046 22 18V6C22 4.89543 21.1046 4 20 4H4ZM8 6C7.44772 6 7 6.44772 7 7V17C7 17.5523 7.44772 18 8 18H19C19.5523 18 20 17.5523 20 17V7C20 6.44772 19.5523 6 19 6H8Z",
      fill: "currentColor"
    }
  ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
    "path",
    {
      fillRule: "evenodd",
      clipRule: "evenodd",
      d: "M4 4C2.89543 4 2 4.89543 2 6V18C2 19.1046 2.89543 20 4 20H20C21.1046 20 22 19.1046 22 18V6C22 4.89543 21.1046 4 20 4H4ZM14 6C13.4477 6 13 6.44772 13 7V17C13 17.5523 13.4477 18 14 18H19C19.5523 18 20 17.5523 20 17V7C20 6.44772 19.5523 6 19 6H14Z",
      fill: "currentColor"
    }
  ) }) });
}
const DrawerContext = createSimpleContext("Drawer");
const drawerVariants = cva(
  ["w-[360px] lg:w-[520px] h-full border-grey-border sticky z-10 top-0 border-l", "transition-all duration-500"],
  {
    variants: {
      expanded: {
        false: "",
        true: "ltr:translate-x-[calc(-80vw+519px)] rtl:translate-x-[calc(80vw-519px)] shadow-2xl"
      }
    }
  }
);
const drawerContainerVariants = cva(["bg-surface-card h-full overflow-y-auto", "transition-all duration-500"], {
  variants: {
    expanded: {
      false: "w-[359px] lg:w-[519px]",
      true: "w-[80vw]"
    }
  }
});
function CaseManagerDrawer({ children }) {
  const [drawerExpanded, setDrawerExpanded] = reactExports.useState(false);
  const containerRef = reactExports.useRef(null);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    DrawerContext.Provider,
    {
      value: {
        isExpanded: drawerExpanded,
        container: containerRef,
        setExpanded: setDrawerExpanded
      },
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("aside", { className: drawerVariants({ expanded: drawerExpanded }), children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: containerRef, className: drawerContainerVariants({ expanded: drawerExpanded }), children }) })
    }
  );
}
function CaseManagerDrawerButtons({ expandable = false }) {
  const context = DrawerContext.useValue();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-grey-border bg-surface-card z-10 flex gap-sm p-sm rounded-md border", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick: expandable ? () => context.setExpanded(false) : void 0,
        disabled: !expandable,
        className: "",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(DrawerIcon, { size: "small", active: !context.isExpanded })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick: expandable ? () => context.setExpanded(true) : void 0,
        disabled: !expandable,
        className: "",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(DrawerIcon, { size: "large", active: context.isExpanded })
      }
    )
  ] }) });
}
function DrawerBreadcrumb({ items }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex shrink-0 items-center gap-md font-medium", children: items.map((item, i) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(reactExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item }),
      i < items.length - 1 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-secondary", children: "/" }) : null
    ] }, `${item}_${i}`);
  }) });
}
function PivotsPanel(props) {
  const { t } = useTranslation(["common", "cases"]);
  const dataModelExplorerContext = DataModelExplorerContext.useValue();
  const drawerContext = DrawerContext.useValue();
  const sentinelRef = reactExports.useRef(null);
  const intersection = useIntersection(sentinelRef, {
    root: drawerContext.container.current,
    rootMargin: "1px",
    threshold: 1
  });
  reactExports.useEffect(() => {
    if (!dataModelExplorerContext.explorerState && drawerContext.isExpanded) {
      drawerContext.setExpanded(false);
    }
  }, [dataModelExplorerContext.explorerState, drawerContext]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: sentinelRef }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: cn("bg-surface-card sticky top-0 z-10 flex items-center", {
          "shadow-sticky-top": !intersection?.isIntersecting
        }),
        children: [
          dataModelExplorerContext.explorerState ? drawerContext.isExpanded ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { mode: "icon", variant: "secondary", onClick: () => dataModelExplorerContext.setExplorerState(null), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "cross", className: "size-4" }) }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CaseManagerDrawerButtons, { expandable: true }) : null,
          drawerContext.isExpanded && dataModelExplorerContext.explorerState ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            DrawerBreadcrumb,
            {
              items: [
                t("cases:case_detail.pivot_panel.breadcrumb_client", {
                  clientName: dataModelExplorerContext.explorerState.currentTab.pivotObject.pivotValue
                }),
                t("cases:case_detail.pivot_panel.breadcrumb_explore")
              ]
            }
          ) : null
        ]
      }
    ),
    drawerContext.isExpanded ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-w-[80vw] px-2xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DataModelExplorer, { caseId: props.case.id, dataModel: props.dataModel }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-[519px] p-lg pt-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      PivotsPanelContent,
      {
        currentUser: props.currentUser,
        case: props.case,
        pivotObjects: props.pivotObjects,
        reviewProofs: props.reviewProofs,
        dataModel: props.dataModel,
        isKycEnrichmentEnabled: props.isKycEnrichmentEnabled,
        onExplore: () => {
          drawerContext.setExpanded(true);
        }
      }
    ) })
  ] });
}
const findDataFromPivotValue = (pivots, pivotValue) => {
  return pivots.find((p) => p.pivotValue === pivotValue);
};
const SnoozePanel = ({
  setDrawerContentMode,
  caseDetail,
  dataModel,
  pivotObjects,
  entitlements
}) => {
  const { t } = useTranslation(casesI18n);
  const language = useFormatLanguage();
  const formatDateTime = useFormatDateTime();
  const { setExpanded } = DrawerContext.useValue();
  const rulesByPivotQuery = useRulesByPivotQuery(caseDetail.id);
  const pivotKeys = rulesByPivotQuery.data ? Object.keys(rulesByPivotQuery.data.rulesByPivot) : [];
  const [activeTab, setActiveTab] = reactExports.useState(null);
  const effectiveActiveTab = activeTab ?? pivotKeys[0] ?? null;
  reactExports.useEffect(() => {
    setExpanded(true);
  }, [setExpanded]);
  if (rulesByPivotQuery.isPending) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Loading..." });
  }
  if (rulesByPivotQuery.isError) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Error" });
  }
  const rulesByPivot = rulesByPivotQuery.data.rulesByPivot;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-lg p-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        variant: "secondary",
        size: "small",
        onClick: () => {
          setExpanded(false);
          setDrawerContentMode("pivot");
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "cross", className: "size-5" })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-full flex-col gap-lg px-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-l font-semibold", children: "Rules" }),
      pivotKeys.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center gap-md py-xl text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "inbox", className: "size-8 text-grey-secondary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-grey-secondary", children: t("cases:case_detail.rules.no_rules") })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-full flex-col", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tabs, { children: pivotKeys.map((pivotValue) => {
          return /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              className: cn(tabClassName, "gap-sm"),
              "data-status": effectiveActiveTab === pivotValue ? "active" : void 0,
              onClick: () => setActiveTab(pivotValue),
              children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: pivotValue })
            },
            `trigger-${pivotValue}`
          );
        }) }),
        e.entries(rulesByPivot).map(([pivotValue, rules]) => {
          if (effectiveActiveTab !== pivotValue) return null;
          const client = findDataFromPivotValue(pivotObjects ?? [], pivotValue);
          const table = dataModel.find((t2) => t2.name === client?.pivotObjectName);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-lg flex w-full flex-col items-start gap-lg", children: [
            table && client ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-grey-border flex flex-col gap-md border p-md bg-grey-background-light rounded-lg", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "capitalize font-semibold", children: table.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(PivotObjectDetails, { tableModel: table, dataModel, pivotObject: client })
            ] }) : null,
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-grey-border bg-surface-card relative w-full rounded-lg border", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-2xs text-grey-secondary relative grid grid-cols-[150px_120px_1fr_1fr_0.5fr_0.5fr_150px] font-normal", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-sm p-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("cases:decisions.rule.snooze") }),
                  entitlements.ruleSnoozes !== "allowed" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Nudge,
                    {
                      className: "size-4",
                      iconClass: "size-2.5",
                      kind: entitlements.ruleSnoozes,
                      link: "https://docs.checkmarble.com/docs/rule-snoozes",
                      content: entitlements.ruleSnoozes === "missing_configuration" ? t("common:missing_configuration") : t("cases:case_detail.add_rule_snooze.nudge")
                    }
                  ) : null
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "p-sm", children: t("cases:decisions.rule.last_hit_timestamp") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "p-sm", children: t("cases:decisions.rule.name_and_score") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "p-sm", children: t("cases:decisions.rule.description") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "p-sm", children: t("cases:decisions.rule.rule_group") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "p-sm", children: t("cases:decisions.rule.snooze_until") })
              ] }),
              rules.map((r) => {
                const formattedHitAt = /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("text-grey-secondary text-xs", { "opacity-30": r.isSnoozed }), children: formatDateTime(r.hitAt, { dateStyle: "short" }) });
                return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: "border-grey-border hover:bg-purple-background-light grid grid-cols-[150px_120px_1fr_1fr_0.5fr_0.5fr_150px] items-center border-t transition-colors",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-full items-center justify-center p-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AddRuleSnooze, { decisionId: r.decisionId, ruleId: r.ruleId, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        Button,
                        {
                          variant: "secondary",
                          size: "small",
                          className: cn({ "bg-purple-background": r.isSnoozed }),
                          disabled: r.isSnoozed || entitlements.ruleSnoozes !== "allowed" && entitlements.ruleSnoozes !== "test",
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: r.isSnoozed ? "snooze-on" : "snooze", className: "size-4", "aria-hidden": true }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium", children: t("cases:decisions.rule.snooze") })
                          ]
                        }
                      ) }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-grey-border flex min-h-full items-center justify-center border-x p-sm", children: formattedHitAt }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-grey-border flex min-h-full items-center justify-between border-r p-sm", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "span",
                          {
                            className: cn("text-grey-primary text-xs font-normal", {
                              "opacity-30": r.isSnoozed
                            }),
                            children: r.name
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          ScoreModifier,
                          {
                            score: isRuleExecutionHit(r) ? r.scoreModifier : 0,
                            className: cn({ "opacity-30": r.isSnoozed })
                          }
                        )
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-grey-border flex min-h-full items-center border-r p-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("text-xs", { "opacity-30": r.isSnoozed }), children: r.description }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-grey-border flex min-h-full items-center border-r p-sm", children: r.ruleGroup ? /* @__PURE__ */ jsxRuntimeExports.jsx(RuleGroup, { className: cn({ "opacity-30": r.isSnoozed }), ruleGroup: r.ruleGroup }) : null }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-full items-center p-sm", children: r.isSnoozed && r.end ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "opacity-30", children: formatRelative(r.end, /* @__PURE__ */ new Date(), {
                        locale: getDateFnsLocale(language)
                      }) }) : null })
                    ]
                  },
                  r.ruleId
                );
              })
            ] })
          ] }, `content-${pivotValue}`);
        })
      ] })
    ] })
  ] });
};
const EditCaseSuspicion = ({
  id,
  reports
}) => {
  const {
    t
  } = useTranslation();
  const [openReportModal, setOpenReportModal] = reactExports.useState(false);
  const initialStatus = reports[0] ? reports[0]?.status : "none";
  const [isCompleted, setIsCompleted] = reactExports.useState(initialStatus === "completed");
  const editSuspicionMutation = useEditSuspicionMutation();
  const revalidate = useLoaderRevalidator();
  const lastData = editSuspicionMutation.data;
  const form = useForm({
    onSubmit: ({
      value
    }) => {
      editSuspicionMutation.mutateAsync(value).then((res) => {
        if (!res.success) {
          zt.error(t("common:errors.unknown"));
          return;
        }
        setOpenReportModal(false);
        form.setFieldValue("reportId", res.data?.id);
        setIsCompleted(res.data?.status === "completed");
        revalidate();
      }).catch(() => {
        zt.error(t("common:errors.unknown"));
      });
    },
    defaultValues: {
      caseId: id,
      status: initialStatus,
      reportId: lastData?.data?.id ?? reports[0]?.id
    },
    validators: {
      onSubmit: editSuspicionPayloadSchema
    }
  });
  const reportFile = useStore(form.store, (state) => state.values.file);
  const {
    getRootProps,
    getInputProps,
    isDragActive
  } = useFormDropzone({
    multiple: false,
    onDrop: (acceptedFiles) => {
      form.setFieldValue("file", acceptedFiles[0]);
      form.validate("change");
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "status", validators: {
    onBlur: editSuspicionPayloadSchema.shape.status,
    onChange: editSuspicionPayloadSchema.shape.status
  }, children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-full gap-xs", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-sm", children: M(field.state.value).with("none", () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("cases:sar.action.mark_as") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", size: "small", onClick: () => {
        field.handleChange("pending");
        form.handleSubmit();
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "half-flag", className: "size-3.5 text-orange-primary" }),
        t("cases:sar.status.pending")
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", size: "small", onClick: () => {
        setOpenReportModal(true);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "full-flag", className: "text-red-primary size-3.5" }),
        t("cases:sar.status.completed")
      ] })
    ] })).with("pending", () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "half-flag", className: "size-3.5 text-orange-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium", children: t("cases:sar.status.pending") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", size: "small", onClick: () => {
        setOpenReportModal(true);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "full-flag", className: "text-red-primary size-3.5" }),
        t("cases:sar.action.mark_as_completed")
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", mode: "icon", size: "small", onClick: () => {
        field.handleChange("none");
        form.handleSubmit();
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "cross", className: "text-grey-secondary size-4" }) })
    ] })).with("completed", () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "full-flag", className: "text-red-primary size-3.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium", children: t("cases:sar.status.completed") })
      ] }),
      reports[0]?.hasFile ? /* @__PURE__ */ jsxRuntimeExports.jsx(ClientOnly, {}) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", size: "small", onClick: () => setOpenReportModal(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "attachment", className: "size-3.5" }),
        t("cases:sar.action.upload")
      ] })
    ] })).exhaustive() }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Root, { open: openReportModal, onOpenChange: setOpenReportModal, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Content, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: !isCompleted ? t("cases:sar.modale.title") : t("cases:sar.modale.title_choose_file") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xl p-xl", children: [
        isCompleted ? /* @__PURE__ */ jsxRuntimeExports.jsx(Callout, { children: t("cases:sar.modale.callout") }) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ...getRootProps(), className: cn("flex flex-col items-center justify-center gap-lg rounded-sm border-2 border-dashed p-lg", isDragActive ? "bg-purple-background border-purple-disabled opacity-90" : "border-grey-placeholder"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ...getInputProps() }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-r flex flex-col gap-xs text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-primary", children: t("cases:sar.modale.heading") }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-grey-secondary inline-flex flex-col", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("cases:sar.modale.supported_extensions") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("cases:drop_file_accepted_types") })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-secondary text-r", children: "or" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "plus", className: "size-5" }),
            t("cases:sar.modale.cta_choose_file")
          ] }),
          reportFile ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "border-grey-border flex items-center gap-xs rounded-sm border px-xs py-2xs text-xs font-medium", children: [
            reportFile.name,
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", appearance: "link", mode: "icon", onClick: () => form.setFieldValue("file", void 0), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "cross", className: "text-grey-primary size-4" }) })
          ] }) : null
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Footer, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { isCloseButton: true, label: t("common:cancel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { label: isCompleted ? t("cases:sar.modale.save") : reportFile ? t("cases:sar.modale.confirm_with_file") : t("cases:sar.modale.confirm_without_file"), type: "submit", disabled: isCompleted && reportFile === void 0, onClick: () => {
          field.handleChange("completed");
          form.handleSubmit();
        } })
      ] })
    ] }) })
  ] }) });
};
const CaseDetails = ({
  currentUser,
  setDrawerContentMode,
  caseReview,
  caseDetail,
  dataModel,
  reports
}) => {
  const { t } = useTranslation(["common", "cases"]);
  const formatDateTime = useFormatDateTime();
  const getCopyToClipboardProps = useGetCopyToClipboard();
  const sentinelRef = reactExports.useRef(null);
  const containerRef = reactExports.useRef(null);
  const intersection = useIntersection(sentinelRef, {
    root: containerRef.current,
    threshold: 1
  });
  const reviewReactionMutation = useCaseReviewFeedbackMutation(caseDetail.id, caseReview?.id);
  const addReviewToCaseCommentsMutation = useAddReviewToCaseCommentsMutation(caseDetail.id, caseReview?.id);
  const caseDecisionsQuery = useCaseDecisionsQuery(caseDetail.id);
  const hasRuleHits = caseDecisionsQuery.data?.pages.some(
    (page) => page.decisions.some((d) => d.rules.some((r) => r.outcome === "hit"))
  );
  const [selectedTab, setSelectedTab] = reactExports.useState("caseDetails");
  const revalidate = useLoaderRevalidator();
  const handleReviewReaction = (reaction) => {
    reviewReactionMutation.mutateAsync(reaction).then(() => revalidate());
  };
  const handleAddCommentReview = () => {
    addReviewToCaseCommentsMutation.mutateAsync().then(() => {
      zt.success(t("cases:case_detail.ai_review.actions.add_to_comment.success"));
      revalidate();
    }).catch(() => {
      zt.error(t("common:errors.unknown"));
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      ref: containerRef,
      className: "relative flex w-full min-w-0 flex-col gap-lg overflow-y-auto overflow-x-hidden bg-surface-page pb-lg",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: sentinelRef, className: "absolute left-0 top-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: cn("bg-inherit sticky top-0 z-10 flex flex-col gap-md px-lg pt-lg", {
              "border-b-grey-border border-b": !intersection?.isIntersecting
            }),
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("flex shrink-0 items-center justify-between gap-sm", { "pb-lg": !caseReview }), children: [
              caseReview ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-purple-background-light flex rounded-lg p-xs", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    className: cn("flex items-center gap-sm rounded px-sm py-xs text-s font-medium transition-colors", {
                      "bg-purple-primary text-white": selectedTab === "caseDetails",
                      "text-purple-primary": selectedTab !== "caseDetails"
                    }),
                    onClick: () => setSelectedTab("caseDetails"),
                    children: t("cases:case_detail.tab.principal")
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    className: cn("flex items-center gap-sm rounded px-sm py-xs text-s font-medium transition-colors", {
                      "bg-purple-primary text-white": selectedTab === "review",
                      "text-purple-primary": selectedTab !== "review"
                    }),
                    onClick: () => setSelectedTab("review"),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        {
                          className: cn("size-5 rounded-md p-2xs", {
                            "text-white": selectedTab === "review",
                            "text-purple-primary": selectedTab !== "review"
                          }),
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "ai-review", className: "size-4" })
                        }
                      ),
                      t("cases:case_detail.tab.ai_review"),
                      !caseReview.review.ok ? /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "warning", className: "size-4 text-red-primary" }) : null
                    ]
                  }
                )
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", {}),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex shrink-0 items-center gap-sm", children: [
                caseDetail.status !== "closed" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(EscalateCase, { id: caseDetail.id, inboxId: caseDetail.inboxId, isAdminUser: isAdmin(currentUser) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SnoozeCase, { caseId: caseDetail.id, snoozeUntil: caseDetail.snoozedUntil })
                ] }) : null,
                caseDetail.status !== "closed" ? /* @__PURE__ */ jsxRuntimeExports.jsx(CloseCase, { id: caseDetail.id }) : /* @__PURE__ */ jsxRuntimeExports.jsx(OpenCase, { id: caseDetail.id })
              ] })
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-lg flex flex-col gap-lg", children: selectedTab === "caseDetails" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col justify-start gap-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-h2 text-grey-primary px-2xs font-medium", children: t("cases:case.information") }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-grey-border text-small flex flex-col gap-lg border p-md bg-surface-card rounded-lg xl:flex-row", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col gap-md", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-sm items-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-secondary w-[90px] shrink-0 font-normal leading-[18px]", children: t("cases:case.name_of_case") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(EditCaseName, { name: caseDetail.name, id: caseDetail.id })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-6 items-center gap-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-secondary w-[90px] shrink-0 font-normal leading-[18px]", children: t("cases:case.id") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      className: "border-grey-border flex h-6 w-fit shrink-0 cursor-pointer items-center gap-sm overflow-hidden rounded border py-2xs ps-sm pe-xs",
                      ...getCopyToClipboardProps(caseDetail.id),
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "font-['Menlo',monospace] text-[10px] whitespace-nowrap overflow-hidden text-ellipsis", children: caseDetail.id }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "copy", className: "size-4 shrink-0 text-grey-primary" })
                      ]
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-6 items-center gap-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-secondary w-[90px] shrink-0 font-normal leading-[18px]", children: t("cases:case.status") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-sm", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(CaseStatusBadgeV2, { status: caseDetail.status, outcome: caseDetail.outcome, variant: "semi-full" }),
                    caseDetail.snoozedUntil ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-grey-primary", children: t("cases:case.snoozed_until", {
                      date: formatDateTime(caseDetail.snoozedUntil, { dateStyle: "short" })
                    }) }) : null
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-secondary w-[90px] shrink-0 font-normal leading-[18px]", children: t("cases:creation_date") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("time", { className: "font-medium", dateTime: caseDetail.createdAt, children: formatDateTime(caseDetail.createdAt, { dateStyle: "short" }) })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col gap-md", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-secondary w-[90px] shrink-0 font-normal leading-[18px]", children: t("cases:case.inbox") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(EditCaseInbox, { id: caseDetail.id, inboxId: caseDetail.inboxId })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-secondary w-[90px] shrink-0 font-normal leading-[18px]", children: t("cases:case.tags") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(EditCaseTags, { id: caseDetail.id, tagIds: caseDetail.tags.map(({ tagId }) => tagId) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-secondary w-[90px] shrink-0 font-normal leading-[18px]", children: t("cases:assigned_to") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    EditCaseAssignee,
                    {
                      disabled: caseDetail.status === "closed",
                      assigneeId: caseDetail.assignedTo,
                      currentUser,
                      id: caseDetail.id
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-6 items-center gap-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-secondary w-[90px] shrink-0 font-normal leading-[18px]", children: t("cases:sar.title") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(EditCaseSuspicion, { id: caseDetail.id, reports })
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col justify-start gap-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-h2 text-grey-primary px-2xs font-medium", children: t("cases:investigation") }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-grey-border bg-surface-card flex flex-col rounded-lg border", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CaseEvents, { events: caseDetail.events, root: containerRef }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(AddComment, { caseId: caseDetail.id })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col justify-start gap-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-h2 text-grey-primary flex items-center justify-between px-2xs font-medium", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("cases:alerts") }),
              hasRuleHits ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", onClick: () => setDrawerContentMode("snooze"), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "snooze", className: "size-3.5" }),
                t("cases:decisions.snooze_rules")
              ] }) : null
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CaseAlerts, { caseDecisionsQuery, dataModel })
          ] }),
          caseDetail.files.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col justify-start gap-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between px-2xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-primary text-h2 font-medium", children: t("common:documents") }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-grey-border bg-surface-card flex flex-wrap gap-sm rounded-lg border p-md", children: caseDetail.files.map((file) => /* @__PURE__ */ jsxRuntimeExports.jsx(CaseFileButton, { file }, file.id)) })
          ] }) : null
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typo, { variant: "title2", children: t("cases:case_detail.ai_review.title") }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-sm justify-end", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  variant: caseReview?.reaction === "ok" ? "primary" : "secondary",
                  onClick: () => handleReviewReaction("ok"),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "thumb-up", className: "size-4" }),
                    t("cases:case_detail.ai_review.actions.feedback_ok")
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  variant: caseReview?.reaction === "ko" ? "primary" : "secondary",
                  onClick: () => handleReviewReaction("ko"),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "thumb-down", className: "size-4" }),
                    t("cases:case_detail.ai_review.actions.feedback_ko")
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", onClick: () => handleAddCommentReview(), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "comment", className: "size-4" }),
                t("cases:case_detail.ai_review.actions.add_to_comment")
              ] })
            ] })
          ] }),
          caseReview && !caseReview.review.ok ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm rounded-lg border border-red-primary bg-red-primary/10 p-md", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "warning", className: "size-5 shrink-0 text-red-primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s font-medium text-red-primary", children: t("cases:case_detail.ai_review.consistency_warning") })
          ] }) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-grey-border rounded-lg p-md bg-surface-card", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Markdown, { children: caseReview?.review.output ?? "" }) })
        ] }) })
      ]
    }
  );
};
function CaseManagerIndexPage() {
  const {
    case: details,
    dataModel,
    pivotObjects,
    currentUser,
    entitlements,
    mostRecentReview,
    isKycEnrichmentEnabled,
    reports
  } = Route.useLoaderData();
  const {
    fromInbox
  } = Route.useSearch();
  const {
    caseAiAssist: aiAssistEnabled
  } = entitlements;
  const {
    t
  } = useTranslation(casesI18n);
  const getNextUnassignedCase = useServerFn(getNextUnassignedCaseFn);
  const router = useRouter();
  const nextUnassignedCaseHref = router.buildLocation({
    to: "/ressources/cases/next-unassigned/$caseId",
    params: {
      caseId: fromUUIDtoSUUID(details.id)
    }
  }).href;
  const [drawerContentMode, setDrawerContentMode] = reactExports.useState("pivot");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Page.Main, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Page.Header, { className: "justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(BreadCrumbs, { back: `/cases/inboxes/${fromInbox ?? MY_INBOX_ID}` }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Root, { children: [
          aiAssistEnabled === "allowed" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Trigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "case-manager", className: "size-3.5" }),
            "AI assist"
          ] }) }) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsx(ClientOnly, {})
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: nextUnassignedCaseHref, className: cn(CtaV2ClassName({
          variant: "secondary"
        }), "hover:bg-grey-background"), onClick: (e2) => {
          if (e2.metaKey || e2.ctrlKey || e2.shiftKey || e2.altKey) return;
          e2.preventDefault();
          getNextUnassignedCase({
            data: {
              caseId: details.id
            }
          });
        }, children: [
          t("cases:next_unassigned_case"),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "arrow-up", className: "size-3.5 rotate-90" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative text-default h-full flex flex-row p-0 lg:p-0 z-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CaseDetails, { caseDetail: details, currentUser, setDrawerContentMode, caseReview: mostRecentReview, dataModel, reports }, details.id),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DataModelExplorerProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CaseManagerDrawer, { children: M(drawerContentMode).with("pivot", () => {
        if (!pivotObjects && !mostRecentReview?.proofs.length) return null;
        return /* @__PURE__ */ jsxRuntimeExports.jsx(PivotsPanel, { currentUser, case: details, dataModel, pivotObjects: pivotObjects ?? [], reviewProofs: mostRecentReview?.proofs ?? [], isKycEnrichmentEnabled }, details.id);
      }).with("snooze", () => /* @__PURE__ */ jsxRuntimeExports.jsx(SnoozePanel, { setDrawerContentMode, caseDetail: details, dataModel, pivotObjects: pivotObjects ?? [], entitlements }, details.id)).exhaustive() }) })
    ] })
  ] });
}
export {
  CaseManagerIndexPage as component
};
