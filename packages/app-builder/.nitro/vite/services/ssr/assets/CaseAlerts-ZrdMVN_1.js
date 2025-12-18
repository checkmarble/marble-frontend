import { r as reactExports, R as jsxRuntimeExports } from "../server.js";
import { L as Link, aC as CaseStatusBadge, a1 as decisionsI18n, aD as getIterationRulesFn, av as casesI18n, s as screeningsI18n, ag as ScreeningStatusTag } from "./router-vb7i5euz.js";
import { e as DataFields, p as parseUnknownData } from "./DataField-vckdVtrg.js";
import { C as ClientTagsList, a as ClientTagsEditSelect, e as ClientDocumentsList, c as ClientDocumentsPopover, f as ClientObjectComments, D as DataModelExplorerContext } from "./DataModelExplorer-gjwcxdcr.js";
import { t as t$1, da as n$2, b as captureException, B as isAdmin, M, db as adaptDateTimeFieldCodes, aS as nonPendingReviewStatuses, dc as isScreeningReviewCompleted, v as n$3, dd as getTriggerObjectFields, u as t$2, o as t$3 } from "./services-middleware-DR8Hua1Y.js";
import { P as PivotNavigationOptions, u as usePivotRelatedCasesQuery } from "./PivotNavigationOptions-CrxM6N-5.js";
import { u as useTranslation, e4 as Modal, B as Button, e as Icon, ef as ScrollAreaV2, T as Typo, f as cva, e8 as MenuCommand, e9 as Popover, C as CtaV2ClassName, d as cn, t as useFormatDateTime, q as useFormatLanguage, s as Trans, er as TextArea, dZ as SelectV2, j as Tag, dz as Switch, eg as Checkbox, ee as ExpandableGroupTagLine, dD as Tooltip } from "./format-NPGUXq-g.js";
import { b as fromUUIDtoSUUID } from "./short-uuid-MIi3jWzx.js";
import { u as useLoaderRevalidator, L as LoaderRevalidatorContext } from "./LoaderRevalidatorContext-C9s56i-l.js";
import { u as useAddCommentMutation } from "./add-comment-BaESvh7R.js";
import { u as useCreateKycEnrichmentQuery } from "./create-kyc-enrichment-CZ2VFgCE.js";
import { z as zt, C as CopyToClipboardButton } from "./CopyToClipboardButton-CJNJJful.js";
import { M as Markdown } from "./Markdown-sjqeOXzy.js";
import { C as Callout, a as CalloutV2 } from "./Callout-DX4NBXlG.js";
import { S as Spinner, L as LoadingIcon } from "./Spinner-GK6cEAdR.js";
import { C as ClientCommentForm } from "./ClientCommentForm-D-0vcWN7.js";
import { E as ExternalLink } from "./ExternalLink-CG_77QdX.js";
import { F as FormErrorOrDescription } from "./FormErrorOrDescription-DO6Hdfmn.js";
import { F as FormInput } from "./FormInput-S5xzkMXf.js";
import { F as FormLabel } from "./FormLabel-DeCgtgtj.js";
import { i as addRuleSnoozePayloadSchema, z as durationUnitOptions, r as reviewDecisionPayloadSchema } from "./cases-PZYcTUxr.js";
import { x as addRuleSnoozeFn, y as getRulesByPivotFn, z as addReviewToCaseCommentsFn, A as addCaseReviewFeedbackFn, B as listCaseDecisionsFn, C as reviewDecisionFn, D as setAllMatchesToNoHitFn } from "./cases-DJ9ABIdo.js";
import { y as useQueryClient } from "./QueryClientProvider-DYTpkCko.js";
import { u as useMutation } from "./useMutation-C5oG90Zs.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
import { r as ruleSnoozesDocHref } from "./documentation-href-uAe88WFl.js";
import { s as submitOnCtrlEnter, g as getFieldErrors, h as handleSubmit } from "./form-D2XmDKeG.js";
import { u as useForm } from "./useForm-BwABQKAs.js";
import { u as useQuery } from "./useQuery-B7mL_evE.js";
import { P as Panel } from "./Panel-kj8Z2GDk.js";
import { c as getScreeningDetailFn, d as getScreeningAiSuggestionsFn, r as refineSearchSchema } from "./screenings-CS8peAlI.js";
import { F as FormatData } from "./FormatData-TXRe9nHU.js";
import { u as useInfiniteQuery } from "./useInfiniteQuery-D2tvMYRf.js";
import { u as useSearchScreeningMatchesMutation, a as useRefineScreeningMutation } from "./search-screening-matches-CgACX5Vl.js";
import { s as sortScreeningMatchesByTopics } from "./match-sorting-Cy-ZyfsJ.js";
import { u as useEntityName } from "./useEntityName-n7_MOPuL.js";
import { S as SEARCH_ENTITIES } from "./screening-entity-DVQtf50p.js";
import { u as useCallbackRef } from "./use-callback-ref-AfyBSz95.js";
import { E as EntitySearchFormProvider, a as EntityTypePopover } from "./EntityTypePopover-CRaDLSH9.js";
import { s as setAdditionalFields } from "./set-additional-fields-BAjwURJS.js";
import { C as CaseDetailTriggerObject, M as MatchCard } from "./TriggerObjectDetail-BL8JBhBZ.js";
import { I as IngestedObjectDetailModal } from "./IngestedObjectDetailModal-BFFwOF2a.js";
import { a as RulesExecutionsContainer, b as RuleExecutionCollapsible, c as RuleExecutionTitle, d as RuleExecutionContent, e as RuleExecutionDescription, f as RuleExecutionDetail } from "./RulesDetail-19MjhcYa.js";
import { g as getDecisionFn } from "./decisions-lgLe1L4K.js";
function n$1(...t2) {
  return t$1(r$1, t2, i$1);
}
const r$1 = (e2, t2) => t2 < 0 ? [] : e2.slice(0, t2);
function i$1(e2) {
  if (e2 <= 0) return n$2;
  let n2 = e2;
  return (e3) => (--n2, { done: n2 <= 0, hasNext: true, next: e3 });
}
function KycEnrichment({ caseId }) {
  const [open, setOpen] = reactExports.useState(false);
  const [isCommentAdded, setIsCommentAdded] = reactExports.useState(false);
  const revalidate = useLoaderRevalidator();
  const { t: t2 } = useTranslation(["cases", "common"]);
  const { data, isPending, error, refetch, isSuccess, status } = useCreateKycEnrichmentQuery(caseId);
  const addCommentMutation = useAddCommentMutation();
  const kycCaseEnrichment = data?.kycCaseEnrichments[0];
  reactExports.useEffect(() => {
    if ((error || isSuccess && !data.success) && open) {
      zt.error(t2("cases:kyc_enrichment.loading.toaster.error"));
      setOpen(false);
    }
  }, [error, isSuccess, data?.success, open]);
  const handleAddComment = async () => {
    if (!kycCaseEnrichment) {
      return;
    }
    const comment = kycCaseEnrichment.analysis + "\n\n" + kycCaseEnrichment.citations.map(
      (citation, index) => `[${index + 1}] [${citation.title}](${citation.url} "${citation.title}")`
    ).join("\n");
    try {
      await addCommentMutation.mutateAsync({
        caseId,
        comment,
        files: []
      });
      setIsCommentAdded(true);
      zt.success(t2("cases:kyc_enrichment.comment_added.toaster.success"));
      revalidate();
      setOpen(false);
    } catch (error2) {
      captureException(error2);
      zt.error(t2("cases:kyc_enrichment.comment_added.toaster.error"));
    }
  };
  const handleOpen = () => {
    if (status !== "success") refetch();
    setOpen(true);
  };
  const AnalysisSkeleton = () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-row gap-lg p-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-fit flex-2 flex-col gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-row items-center justify-between gap-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-grey-border h-4 w-32 animate-pulse rounded-md" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-grey-border h-12 animate-pulse rounded-lg" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-grey-border h-14 animate-pulse rounded-lg" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-grey-border h-12 animate-pulse rounded-lg" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-grey-border h-16 animate-pulse rounded-lg" })
  ] }) });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Root, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Trigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", className: "align-baseline", onClick: () => handleOpen(), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "ai-review", className: "size-5" }),
      " ",
      t2("cases:kyc_enrichment.title")
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Content, { size: "xlarge", className: "h-[90vh] flex flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: t2("cases:kyc_enrichment.title") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-md py-xl px-sm flex-1 min-h-0", children: [
        isPending && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-md", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-center gap-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, { className: "size-6" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t2("cases:kyc_enrichment.loading") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AnalysisSkeleton, {})
        ] }),
        error && /* @__PURE__ */ jsxRuntimeExports.jsx(Callout, { variant: "outlined", children: error.message }),
        isSuccess && data.success && kycCaseEnrichment ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-md flex-1 min-h-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Callout, { variant: "outlined", children: [
            t2("cases:kyc_enrichment.for"),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: kycCaseEnrichment.entityName })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollAreaV2, { orientation: "vertical", className: "flex-1 min-h-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-md", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Markdown, { children: kycCaseEnrichment.analysis }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-md", children: kycCaseEnrichment.citations.map((citation, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "[",
                index + 1,
                "]"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "a",
                {
                  className: "text-purple-primary hover:bg-purple-background hover:text-grey-secondary",
                  href: citation.url,
                  children: citation.title
                }
              ) })
            ] }, `citation.${index}`)) })
          ] }) })
        ] }) : null
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Footer, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Modal.FooterButton,
          {
            label: t2("cases:kyc_enrichment.attach_to_case"),
            onClick: () => handleAddComment(),
            disabled: addCommentMutation.isPending || !isSuccess || isCommentAdded
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { isCloseButton: true, label: t2("common:close"), onClick: () => setOpen(false) })
      ] })
    ] })
  ] });
}
const titleVariants = cva("text-s px-xs py-sm font-semibold flex justify-between items-center", {
  variants: {
    borderless: {
      true: null,
      false: "border-b border-grey-border"
    }
  },
  defaultVariants: {
    borderless: false
  }
});
function DataCard({ title, subtitle, children, borderless }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Typo, { variant: "subtitle1", className: titleVariants({ borderless }), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: title }),
      subtitle ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-purple-disabled text-xs", children: subtitle }) : null
    ] }),
    children
  ] });
}
function PivotAnnotations({ caseId, tableName, objectId, annotations }) {
  const { t: t2 } = useTranslation(["common", "cases"]);
  const [commentSectionOpen, setCommentSectionOpen] = reactExports.useState(true);
  const [editTagsOpen, setEditTagsOpen] = reactExports.useState(false);
  const comments = annotations?.comments ?? [];
  const documents = annotations?.files ?? [];
  const tagsAnnotations = annotations?.tags ?? [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-h2 font-semibold", children: t2("cases:case_detail.pivot_panel.annotations") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-grey-border flex flex-col gap-md border p-md bg-surface-card rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[116px_1fr] gap-x-3 gap-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: t2("cases:annotations.tags.title") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClientTagsList, { tagsIds: tagsAnnotations.map((annotation) => annotation.payload.tag_id) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Menu, { persistOnSelect: true, open: editTagsOpen, onOpenChange: setEditTagsOpen, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Trigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", mode: "icon", variant: "secondary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "edit-square", className: "size-3.5" }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Content, { side: "bottom", align: "end", sideOffset: 4, className: "w-[340px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            ClientTagsEditSelect,
            {
              caseId,
              tableName,
              objectId,
              annotations: tagsAnnotations,
              onAnnotateSuccess: () => {
                setEditTagsOpen(false);
              }
            }
          ) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: t2("cases:annotations.documents.title") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClientDocumentsList, { documents }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover.Root, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Popover.Trigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { mode: "icon", variant: "secondary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "edit-square", className: "size-3.5" }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Popover.Content, { side: "bottom", align: "end", sideOffset: 4, collisionPadding: 10, className: "w-[340px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            ClientDocumentsPopover,
            {
              caseId,
              documents,
              tableName,
              objectId
            }
          ) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          "data-open": commentSectionOpen,
          className: "group/comment data-[open=true]:border-grey-border col-span-full flex items-center justify-between pb-sm data-[open=true]:border-b",
          children: [
            t2("cases:annotations.comments.title"),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { mode: "icon", variant: "secondary", onClick: () => setCommentSectionOpen((o2) => !o2), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "caret-down", className: "size-3.5 group-data-[open=true]/comment:rotate-180" }) })
          ]
        }
      ),
      commentSectionOpen ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-full flex flex-col gap-md pt-md", children: [
        comments.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(ClientObjectComments, { comments, className: "mx-md" }) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          ClientCommentForm,
          {
            caseId,
            tableName,
            objectId,
            className: "border-grey-border border"
          }
        )
      ] }) : null
    ] }) })
  ] });
}
function pivotUniqKey(pivotObject) {
  return pivotObject ? `${pivotObject.pivotId ?? ""}_${pivotObject.pivotObjectName}_${pivotObject.pivotFieldName}_${pivotObject.pivotValue}` : null;
}
function PivotsPanelContent({
  currentUser,
  case: caseObj,
  pivotObjects,
  reviewProofs,
  dataModel,
  onExplore,
  isKycEnrichmentEnabled
}) {
  const { t: t2 } = useTranslation(["cases"]);
  const [isDisplayingProofs, setIsDisplayingProofs] = reactExports.useState(false);
  const [currentPivotUniqKey, setCurrentPivotObjectUniqKey] = reactExports.useState(pivotUniqKey(pivotObjects[0]));
  const currentPivotObject = pivotObjects.find((pivotObject) => pivotUniqKey(pivotObject) === currentPivotUniqKey);
  const currentTable = dataModel.find((t22) => t22.name === currentPivotObject?.pivotObjectName);
  const decisionsPivotValues = reactExports.useMemo(() => caseObj.decisions.flatMap((d) => d.pivotValues), [caseObj]);
  const isAllMissingPivotObject = decisionsPivotValues.every(
    (pivotValue) => !pivotObjects.find((pivotObject) => pivotObject.pivotValue === pivotValue.value)
  );
  const dataModelExplorerContext = DataModelExplorerContext.useValue();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xl", children: [
    isAllMissingPivotObject ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-grey-border flex h-40 flex-col items-center justify-center gap-sm rounded-sm border p-xl mt-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-center", children: isAdmin(currentUser) ? t2("cases:case_detail.pivot_panel.missing_pivot.admin") : t2("cases:case_detail.pivot_panel.missing_pivot") }),
      isAdmin(currentUser) ? /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/data", className: CtaV2ClassName({ variant: "secondary", size: "small" }), children: t2("cases:case_detail.pivot_panel.missing_pivot_cta") }) : null
    ] }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm mt-md", children: [
      reviewProofs.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            setIsDisplayingProofs(true);
            setCurrentPivotObjectUniqKey(null);
          },
          className: cn("h-7 px-sm rounded-lg flex items-center border", {
            "bg-purple-background text-purple-primary border-transparent": isDisplayingProofs,
            "bg-surface-card text-grey-secondary border-grey-border cursor-pointer": !isDisplayingProofs
          }),
          children: t2("cases:ai_review.proof.title")
        }
      ) : null,
      pivotObjects.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-grey-border flex gap-sm self-start rounded-lg border p-xs", children: pivotObjects.map((pivotObject, idx) => {
        const uniqKey = pivotUniqKey(pivotObject);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            className: "text-grey-secondary aria-current:bg-purple-background aria-current:text-purple-primary aria-current:dark:bg-grey-background-light aria-current:dark:text-purple-hover rounded-md p-xs px-sm cursor-pointer",
            "aria-current": uniqKey === pivotUniqKey(currentPivotObject),
            onClick: () => {
              setCurrentPivotObjectUniqKey(pivotUniqKey(pivotObject));
              setIsDisplayingProofs(false);
            },
            children: [
              pivotObject.pivotObjectName,
              " ",
              idx + 1
            ]
          },
          uniqKey
        );
      }) }) : null
    ] }),
    !isDisplayingProofs ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      currentTable && currentPivotObject ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row gap-md", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-h2 font-semibold", children: t2("cases:case_detail.pivot_panel.informations") }),
          isKycEnrichmentEnabled ? /* @__PURE__ */ jsxRuntimeExports.jsx(KycEnrichment, { caseId: caseObj.id }) : null
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-grey-border flex flex-col gap-md border p-md bg-surface-card rounded-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "capitalize font-semibold", children: currentTable.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(PivotObjectDetails, { tableModel: currentTable, dataModel, pivotObject: currentPivotObject }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px bg-grey-border" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            PivotNavigationOptions,
            {
              currentUser,
              pivotObject: currentPivotObject,
              table: currentTable,
              dataModel,
              onExplore
            }
          )
        ] })
      ] }) : null,
      currentPivotObject ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        currentTable && currentPivotObject.pivotObjectId && currentPivotObject.pivotObjectData.metadata.canBeAnnotated ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          PivotAnnotations,
          {
            caseId: caseObj.id,
            tableName: currentTable.name,
            objectId: currentPivotObject.pivotObjectId,
            annotations: currentPivotObject.pivotObjectData.annotations
          }
        ) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsx(RelatedCases, { pivotValue: currentPivotObject.pivotValue, currentCase: caseObj })
      ] }) : null
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: reviewProofs.map((proof, idx) => {
      const tableModel = dataModel.find((t22) => t22.name === proof.type);
      if (!tableModel) return null;
      const navigationOptions = tableModel.navigationOptions;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "rounded-xl border border-grey-border bg-surface-card",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-surface-card px-sm py-xs rounded-t-xl border-b border-grey-border", children: t2("cases:ai_review.proof.tab_title", { number: idx + 1 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-md flex flex-col gap-md", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                DataFields,
                {
                  table: tableModel.name,
                  object: {
                    data: proof.object.data
                  }
                }
              ),
              navigationOptions ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px bg-grey-border" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-sm", children: navigationOptions.map((navOption) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[116px_1fr] gap-x-3 items-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: navOption.targetTableName }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Button,
                    {
                      disabled: navOption.status === "pending",
                      variant: "secondary",
                      onClick: () => {
                        dataModelExplorerContext.startNavigation({
                          pivotObject: {
                            isIngested: true,
                            pivotValue: proof.object.data["object_id"],
                            pivotObjectName: tableModel.name
                          },
                          sourceObject: proof.object.data,
                          navigationOptionId: navOption.id,
                          sourceTableName: tableModel.name,
                          sourceFieldName: navOption.sourceFieldName,
                          targetTableName: navOption.targetTableName,
                          filterFieldName: navOption.filterFieldName,
                          orderingFieldName: navOption.orderingFieldName
                        });
                        onExplore();
                      },
                      className: "flex items-center gap-xs",
                      children: [
                        navOption.status === "pending" ? t2("cases:case_detail.pivot_panel.explore_waiting_creation") : t2("cases:case_detail.pivot_panel.explore"),
                        navOption.status === "pending" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "spinner", className: "size-3.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "arrow-up-right", className: "size-3.5" })
                      ]
                    }
                  )
                ] }, navOption.id)) })
              ] }) : null
            ] })
          ]
        },
        `${proof.type}-${proof.object.data["object_id"]}`
      );
    }) })
  ] });
}
const cellVariants = cva("border-grey-border border-t p-sm", {
  variants: {
    isLast: {
      true: "border-b",
      false: null
    }
  },
  defaultVariants: {
    isLast: false
  }
});
function RelatedCases({ currentCase, pivotValue }) {
  const { t: t2 } = useTranslation(["common", "cases"]);
  const casesQuery = usePivotRelatedCasesQuery(pivotValue);
  const formatDateTime = useFormatDateTime();
  return M(casesQuery).with({ isError: true }, () => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(DataCard, { title: t2("cases:case_detail.pivot_panel.case_history"), children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-red-disabled bg-red-background text-red-primary mt-md rounded-sm border p-sm", children: t2("common:global_error") }) });
  }).with({ isPending: true }, () => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: "Loading..." });
  }).otherwise((query) => {
    const cases = query.data.cases.filter((caseObj) => caseObj.id !== currentCase.id);
    if (cases.length === 0) {
      return null;
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-h2 font-semibold", children: t2("cases:case_detail.pivot_panel.case_history") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid w-full grid-cols-[auto_1fr_auto_auto]", children: cases.map((caseObj, idx) => {
        const isLast = idx === cases.length - 1;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(reactExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: cellVariants({
                isLast,
                className: "shrink border-r leading-[28px]"
              }),
              children: formatDateTime(caseObj.createdAt, { dateStyle: "short" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: cellVariants({
                isLast,
                className: "shrink truncate leading-[28px]"
              }),
              children: caseObj.name
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cellVariants({ isLast, className: "shrink-0" }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Link,
            {
              to: "/cases/$caseId",
              params: { caseId: fromUUIDtoSUUID(caseObj.id) },
              className: CtaV2ClassName({ variant: "secondary" }),
              children: "Open"
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cellVariants({ isLast, className: "flex items-center border-l" }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            CaseStatusBadge,
            {
              status: caseObj.status,
              showText: false,
              showBackground: false,
              outcome: caseObj.outcome
            }
          ) })
        ] }, caseObj.id);
      }) })
    ] });
  });
}
function PivotObjectDetails({ tableModel, dataModel, pivotObject }) {
  const { t: t2 } = useTranslation(["common", "cases"]);
  const { data, relatedObjects } = pivotObject.pivotObjectData;
  const filteredRelatedObjects = relatedObjects.filter((r2) => !!r2.relatedObjectDetail?.metadata);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DataFields, { table: tableModel.name, object: { data } }),
    filteredRelatedObjects.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "", children: filteredRelatedObjects.map((relatedObject) => {
      if (!relatedObject.relatedObjectDetail?.metadata) return null;
      const relatedObjectType = relatedObject.relatedObjectDetail.metadata.objectType;
      const relatedObjectTable = dataModel.find((tm) => tm.name === relatedObjectType);
      if (!relatedObjectTable) return null;
      const tableName = relatedObject.linkName ?? relatedObjectType;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(reactExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Typo,
          {
            variant: "subtitle2",
            className: "border-grey-border mb-md border-b text-right text-xs font-semibold",
            children: t2("cases:case_detail.pivot_panel.related_object", {
              tableName
            })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DataFields, { table: relatedObjectType, object: { data: relatedObject.relatedObjectDetail.data } })
      ] }, relatedObjectType);
    }) }) : null
  ] }) });
}
const useAddRuleSnoozeMutation = () => {
  const addRuleSnooze = useServerFn(addRuleSnoozeFn);
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["cases", "add-rule-snooze"],
    mutationFn: async (payload) => addRuleSnooze({ data: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
    }
  });
};
function AddRuleSnooze({
  decisionId,
  ruleId,
  children
}) {
  const [open, setOpen] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Root, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Trigger, { asChild: true, children }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Content, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(AddRuleSnoozeContent, { setOpen, decisionId, ruleId }) })
  ] });
}
function AddRuleSnoozeContent({
  decisionId,
  ruleId,
  setOpen
}) {
  const { t: t2 } = useTranslation(["common", "cases"]);
  const language = useFormatLanguage();
  const addRuleSnoozeMutation = useAddRuleSnoozeMutation();
  const revalidate = useLoaderRevalidator();
  const queryClient = useQueryClient();
  const dateTimeFieldNames = reactExports.useMemo(
    () => new Intl.DisplayNames(language, {
      type: "dateTimeField"
    }),
    [language]
  );
  const form = useForm({
    defaultValues: {
      decisionId,
      ruleId,
      durationValue: 1,
      durationUnit: "days"
    },
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        addRuleSnoozeMutation.mutateAsync(value).then((res) => {
          if (res.status === "success") {
            queryClient.invalidateQueries({ queryKey: ["cases", "rulesByPivot"] });
            setOpen(false);
          } else if ("error" in res && res.error === "duplicate_rule_snooze") {
            zt.error(t2("cases:case_detail.add_rule_snooze.errors.duplicate_rule_snooze"));
          }
          revalidate();
        }).catch(() => {
          zt.error(t2("common:errors.unknown"));
        });
      }
    },
    validators: {
      onSubmit: addRuleSnoozePayloadSchema
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "form",
    {
      onSubmit: (e2) => {
        e2.preventDefault();
        e2.stopPropagation();
        form.handleSubmit();
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: t2("cases:case_detail.add_rule_snooze.title") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-lg p-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Description, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Callout, { variant: "outlined", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-wrap", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Trans,
            {
              t: t2,
              i18nKey: "cases:case_detail.add_rule_snooze.callout",
              components: {
                DocLink: /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { href: ruleSnoozesDocHref })
              }
            }
          ) }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            form.Field,
            {
              name: "comment",
              validators: {
                onBlur: addRuleSnoozePayloadSchema.shape.comment,
                onChange: addRuleSnoozePayloadSchema.shape.comment
              },
              children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row-span-full grid grid-rows-subgrid gap-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { name: field.name, children: t2("cases:case_detail.add_rule_snooze.comment.label") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TextArea,
                  {
                    className: "w-full",
                    defaultValue: field.state.value,
                    onChange: (e2) => field.handleChange(e2.currentTarget.value),
                    onKeyDown: submitOnCtrlEnter,
                    name: field.name,
                    onBlur: field.handleBlur,
                    borderColor: field.state.meta.errors.length === 0 ? "greyfigma-90" : "redfigma-47",
                    placeholder: t2("cases:case_detail.add_rule_snooze.comment.placeholder")
                  }
                )
              ] })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid w-full grid-cols-2 grid-rows-[repeat(3,max-content)] gap-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              form.Field,
              {
                name: "durationValue",
                validators: {
                  onBlur: addRuleSnoozePayloadSchema.shape.durationValue,
                  onChange: addRuleSnoozePayloadSchema.shape.durationValue
                },
                children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row-span-full grid grid-rows-subgrid gap-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { name: field.name, valid: field.state.meta.errors.length === 0, children: t2("cases:case_detail.add_rule_snooze.duration_value") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    FormInput,
                    {
                      type: "number",
                      name: field.name,
                      defaultValue: field.state.value,
                      onChange: (e2) => field.handleChange(+e2.currentTarget.value),
                      onBlur: field.handleBlur,
                      valid: field.state.meta.errors.length === 0,
                      className: "w-full"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors) })
                ] })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              form.Field,
              {
                name: "durationUnit",
                validators: {
                  onBlur: addRuleSnoozePayloadSchema.shape.durationUnit,
                  onChange: addRuleSnoozePayloadSchema.shape.durationUnit
                },
                children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "row-span-full grid grid-rows-subgrid gap-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { name: field.name, children: t2("cases:case_detail.add_rule_snooze.duration_unit") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    SelectV2,
                    {
                      className: "h-10 w-full",
                      value: field.state.value,
                      onChange: (unit) => field.handleChange(unit),
                      placeholder: t2("cases:case_detail.add_rule_snooze.duration_unit"),
                      options: durationUnitOptions.map((unit) => ({
                        label: dateTimeFieldNames.of(adaptDateTimeFieldCodes(unit)),
                        value: unit
                      }))
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors) })
                ] })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Footer, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { isCloseButton: true, label: t2("common:cancel") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Modal.FooterButton,
            {
              label: t2("cases:decisions.rule.snooze"),
              type: "submit",
              name: "update",
              isLoading: addRuleSnoozeMutation.isPending
            }
          )
        ] })
      ]
    }
  );
}
const ScoreModifier = ({ score, className, ...rest }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Tag, { color: "grey", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: score >= 0 ? "+" : "-" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: Math.abs(score) })
  ] });
};
const useRulesByPivotQuery = (caseId) => {
  const getRulesByPivot = useServerFn(getRulesByPivotFn);
  return useQuery({
    queryKey: ["cases", "rulesByPivot", caseId],
    queryFn: async () => {
      return getRulesByPivot({ data: { caseId } });
    }
  });
};
var t = function(t2) {
  return Object.keys(t2);
}, n = function(t2) {
  return Object.values(t2);
}, r = Object.prototype.hasOwnProperty, e = { __proto__: null, fromEntries: Object.fromEntries, entries: function(t2) {
  return Object.entries(t2);
}, keys: t, values: n, fromOptional: function(t2) {
  var n2 = {};
  for (var e2 in t2) if (r.call(t2, e2)) {
    var u2 = t2[e2];
    if (void 0 === u2) continue;
    u2.isSome() && (n2[e2] = u2.get());
  }
  return n2;
} }, u = /* @__PURE__ */ new WeakMap(), o = "function" == typeof WeakRef ? WeakRef : /* @__PURE__ */ (function() {
  function t2(t3) {
    u.set(this, t3);
  }
  return t2.prototype.deref = function() {
    return u.get(this);
  }, t2;
})(), i = function() {
  var t2 = /* @__PURE__ */ new Map(), n2 = "function" == typeof FinalizationRegistry ? new FinalizationRegistry(function(n3) {
    t2.delete(n3);
  }) : void 0;
  return { set: function(r2, e2) {
    t2.set(r2, new o(e2)), void 0 !== n2 && n2.register(e2, r2);
  }, get: function(n3) {
    var r2 = t2.get(n3);
    if (void 0 !== r2) return r2.deref();
  } };
}, a = /* @__PURE__ */ Symbol.for("__boxed_type__"), c = function(t2, n2) {
  for (var r2 = Math.min(t2.length, n2.length), e2 = Array(r2), u2 = -1; ++u2 < r2; ) e2[u2] = [t2[u2], n2[u2]];
  return e2;
}, f = i(), s = /* @__PURE__ */ (function() {
  function t2() {
  }
  t2.fromPredicate = function(t3, n3) {
    return n3(t3) ? p.Some(t3) : v;
  };
  var n2 = t2.prototype;
  return n2.map = function(t3) {
    return this === v ? this : p.Some(t3(this.value));
  }, n2.flatMap = function(t3) {
    return this === v ? this : t3(this.value);
  }, n2.filter = function(t3) {
    return this === v || t3(this.value) ? this : v;
  }, n2.get = function() {
    return this.value;
  }, n2.getWithDefault = function(t3) {
    return this === v ? t3 : this.value;
  }, n2.getOr = function(t3) {
    return this === v ? t3 : this.value;
  }, n2.orElse = function(t3) {
    return this === v ? t3 : this;
  }, n2.mapOr = function(t3, n3) {
    return this === v ? t3 : n3(this.value);
  }, n2.match = function(t3) {
    return this === v ? t3.None() : t3.Some(this.value);
  }, n2.tap = function(t3) {
    return t3(this), this;
  }, n2.tapSome = function(t3) {
    return this === v || t3(this.value), this;
  }, n2.toUndefined = function() {
    if (this !== v) return this.value;
  }, n2.toNull = function() {
    return this === v ? null : this.value;
  }, n2.toResult = function(t3) {
    return this.match({ Some: function(t4) {
      return k.Ok(t4);
    }, None: function() {
      return k.Error(t3);
    } });
  }, n2.isSome = function() {
    return this !== v;
  }, n2.isNone = function() {
    return this === v;
  }, n2.toJSON = function() {
    return this.match({ None: function() {
      var t3;
      return (t3 = {})[a] = "Option", t3.tag = "None", t3;
    }, Some: function(t3) {
      var n3;
      return (n3 = {})[a] = "Option", n3.tag = "Some", n3.value = t3, n3;
    } });
  }, t2;
})();
s.P = { Some: function(t2) {
  return { tag: "Some", value: t2 };
}, None: { tag: "None" } }, s.Some = function(t2) {
  var n2 = f.get(t2);
  if (null == n2) {
    var r2 = Object.create(h);
    return r2.tag = "Some", r2.value = t2, Object.freeze(r2), f.set(t2, r2), r2;
  }
  return n2;
}, s.None = function() {
  return v;
}, s.isOption = function(t2) {
  return null != t2 && "Option" === t2.__boxed_type__;
}, s.fromNullable = function(t2) {
  return null == t2 ? v : p.Some(t2);
}, s.fromNull = function(t2) {
  return null === t2 ? v : p.Some(t2);
}, s.fromUndefined = function(t2) {
  return void 0 === t2 ? v : p.Some(t2);
}, s.all = function(t2) {
  for (var n2, r2 = t2.length, e2 = p.Some([]), u2 = 0, o2 = function() {
    if (u2 >= r2) return { v: e2 };
    var n3 = t2[u2];
    null != n3 && (e2 = e2.flatMap(function(t3) {
      return n3.map(function(n4) {
        return t3.push(n4), t3;
      });
    })), u2++;
  }; ; ) if (n2 = o2()) return n2.v;
}, s.allFromDict = function(r2) {
  var e2 = t(r2);
  return p.all(n(r2)).map(function(t2) {
    return Object.fromEntries(c(e2, t2));
  });
}, s.equals = function(t2, n2, r2) {
  return t2.isSome() && n2.isSome() ? r2(t2.get(), n2.get()) : t2.tag === n2.tag;
}, s.fromJSON = function(t2) {
  return "None" === t2.tag ? p.None() : p.Some(t2.value);
}, s.prototype.__boxed_type__ = "Option";
var l, h = s.prototype, v = ((l = Object.create(h)).tag = "None", Object.freeze(l), l), p = s, m = i(), g = i(), O = /* @__PURE__ */ (function() {
  function t2() {
  }
  var n2 = t2.prototype;
  return n2.map = function(t3) {
    return "Ok" === this.tag ? k.Ok(t3(this.value)) : this;
  }, n2.mapError = function(t3) {
    return "Ok" === this.tag ? this : k.Error(t3(this.error));
  }, n2.flatMap = function(t3) {
    return "Ok" === this.tag ? t3(this.value) : this;
  }, n2.flatMapError = function(t3) {
    return "Ok" === this.tag ? this : t3(this.error);
  }, n2.get = function() {
    return this.value;
  }, n2.getError = function() {
    return this.error;
  }, n2.getWithDefault = function(t3) {
    return "Ok" === this.tag ? this.value : t3;
  }, n2.getOr = function(t3) {
    return "Ok" === this.tag ? this.value : t3;
  }, n2.mapOr = function(t3, n3) {
    return "Error" === this.tag ? t3 : n3(this.value);
  }, n2.match = function(t3) {
    return "Ok" === this.tag ? t3.Ok(this.value) : t3.Error(this.error);
  }, n2.tap = function(t3) {
    return t3(this), this;
  }, n2.tapOk = function(t3) {
    return "Ok" === this.tag && t3(this.value), this;
  }, n2.tapError = function(t3) {
    return "Error" === this.tag && t3(this.error), this;
  }, n2.toOption = function() {
    return "Ok" === this.tag ? p.Some(this.value) : v;
  }, n2.isOk = function() {
    return "Ok" === this.tag;
  }, n2.isError = function() {
    return "Error" === this.tag;
  }, n2.toJSON = function() {
    return this.match({ Ok: function(t3) {
      var n3;
      return (n3 = {})[a] = "Result", n3.tag = "Ok", n3.value = t3, n3;
    }, Error: function(t3) {
      var n3;
      return (n3 = {})[a] = "Result", n3.tag = "Error", n3.error = t3, n3;
    } });
  }, t2;
})();
O.P = { Ok: function(t2) {
  return { tag: "Ok", value: t2 };
}, Error: function(t2) {
  return { tag: "Error", error: t2 };
} }, O.Ok = function(t2) {
  var n2 = m.get(t2);
  if (null == n2) {
    var r2 = Object.create(_);
    return r2.tag = "Ok", r2.value = t2, Object.freeze(r2), m.set(t2, r2), r2;
  }
  return n2;
}, O.Error = function(t2) {
  var n2 = g.get(t2);
  if (null == n2) {
    var r2 = Object.create(_);
    return r2.tag = "Error", r2.error = t2, Object.freeze(r2), g.set(t2, r2), r2;
  }
  return n2;
}, O.isResult = function(t2) {
  return null != t2 && "Result" === t2.__boxed_type__;
}, O.fromExecution = function(t2) {
  try {
    return k.Ok(t2());
  } catch (t3) {
    return k.Error(t3);
  }
}, O.fromPromise = function(t2) {
  try {
    return Promise.resolve((function(n2, r2) {
      try {
        var e2 = Promise.resolve(t2).then(function(t3) {
          return k.Ok(t3);
        });
      } catch (t3) {
        return r2(t3);
      }
      return e2 && e2.then ? e2.then(void 0, r2) : e2;
    })(0, function(t3) {
      return k.Error(t3);
    }));
  } catch (t3) {
    return Promise.reject(t3);
  }
}, O.fromOption = function(t2, n2) {
  return t2.toResult(n2);
}, O.all = function(t2) {
  for (var n2, r2 = t2.length, e2 = k.Ok([]), u2 = 0, o2 = function() {
    if (u2 >= r2) return { v: e2 };
    var n3 = t2[u2];
    null != n3 && (e2 = e2.flatMap(function(t3) {
      return n3.map(function(n4) {
        return t3.push(n4), t3;
      });
    })), u2++;
  }; ; ) if (n2 = o2()) return n2.v;
}, O.allFromDict = function(r2) {
  var e2 = t(r2);
  return k.all(n(r2)).map(function(t2) {
    return Object.fromEntries(c(e2, t2));
  });
}, O.equals = function(t2, n2, r2) {
  return t2.tag === n2.tag && (!(!t2.isError() || !n2.isError()) || !(!t2.isOk() || !n2.isOk()) && r2(t2.get(), n2.get()));
}, O.fromJSON = function(t2) {
  return "Ok" === t2.tag ? k.Ok(t2.value) : k.Error(t2.error);
}, O.prototype.__boxed_type__ = "Result";
var _ = O.prototype, k = O, E = i(), b = /* @__PURE__ */ (function() {
  function t2() {
  }
  var n2 = t2.prototype;
  return n2.map = function(t3) {
    return this === D || this === j ? this : R.Done(t3(this.value));
  }, n2.flatMap = function(t3) {
    return this === D || this === j ? this : t3(this.value);
  }, n2.mapOkToResult = function(t3) {
    return this.map(function(n3) {
      return n3.match({ Ok: function(n4) {
        return t3(n4);
      }, Error: function() {
        return n3;
      } });
    });
  }, n2.mapErrorToResult = function(t3) {
    return this.map(function(n3) {
      return n3.match({ Error: function(n4) {
        return t3(n4);
      }, Ok: function() {
        return n3;
      } });
    });
  }, n2.mapOk = function(t3) {
    return this.map(function(n3) {
      return n3.match({ Ok: function(n4) {
        return k.Ok(t3(n4));
      }, Error: function() {
        return n3;
      } });
    });
  }, n2.mapError = function(t3) {
    return this.map(function(n3) {
      return n3.match({ Ok: function() {
        return n3;
      }, Error: function(n4) {
        return k.Error(t3(n4));
      } });
    });
  }, n2.flatMapOk = function(t3) {
    return this.flatMap(function(n3) {
      return n3.match({ Ok: function(n4) {
        return t3(n4);
      }, Error: function() {
        return R.Done(n3);
      } });
    });
  }, n2.flatMapError = function(t3) {
    return this.flatMap(function(n3) {
      return n3.match({ Ok: function() {
        return R.Done(n3);
      }, Error: function(n4) {
        return t3(n4);
      } });
    });
  }, n2.get = function() {
    return this.value;
  }, n2.getWithDefault = function(t3) {
    return this === D || this === j ? t3 : this.value;
  }, n2.getOr = function(t3) {
    return this === D || this === j ? t3 : this.value;
  }, n2.mapOr = function(t3, n3) {
    return this === D || this === j ? t3 : n3(this.value);
  }, n2.match = function(t3) {
    return this === D ? t3.NotAsked() : this === j ? t3.Loading() : t3.Done(this.value);
  }, n2.tap = function(t3) {
    return t3(this), this;
  }, n2.toOption = function() {
    return this === D || this === j ? p.None() : p.Some(this.value);
  }, n2.isDone = function() {
    return this !== D && this !== j;
  }, n2.isLoading = function() {
    return this === j;
  }, n2.isNotAsked = function() {
    return this === D;
  }, n2.toJSON = function() {
    return this.match({ NotAsked: function() {
      var t3;
      return (t3 = {})[a] = "AsyncData", t3.tag = "NotAsked", t3;
    }, Loading: function() {
      var t3;
      return (t3 = {})[a] = "AsyncData", t3.tag = "Loading", t3;
    }, Done: function(t3) {
      var n3;
      return (n3 = {})[a] = "AsyncData", n3.tag = "Done", n3.value = t3, n3;
    } });
  }, t2;
})();
b.P = { Done: function(t2) {
  return { tag: "Done", value: t2 };
}, NotAsked: { tag: "NotAsked" }, Loading: { tag: "Loading" } }, b.Done = function(t2) {
  var n2 = E.get(t2);
  if (null == n2) {
    var r2 = Object.create(S);
    return r2.tag = "Done", r2.value = t2, Object.freeze(r2), E.set(t2, r2), r2;
  }
  return n2;
}, b.Loading = function() {
  return j;
}, b.NotAsked = function() {
  return D;
}, b.all = function(t2) {
  for (var n2, r2 = t2.length, e2 = R.Done([]), u2 = 0, o2 = function() {
    if (u2 >= r2) return { v: e2 };
    var n3 = t2[u2];
    null != n3 && (e2 = e2.flatMap(function(t3) {
      return n3.map(function(n4) {
        return t3.push(n4), t3;
      });
    })), u2++;
  }; ; ) if (n2 = o2()) return n2.v;
}, b.allFromDict = function(r2) {
  var e2 = t(r2);
  return R.all(n(r2)).map(function(t2) {
    return Object.fromEntries(c(e2, t2));
  });
}, b.equals = function(t2, n2, r2) {
  return "Done" === t2.tag && "Done" === n2.tag ? r2(t2.value, n2.value) : t2.tag === n2.tag;
}, b.isAsyncData = function(t2) {
  return null != t2 && "AsyncData" === t2.__boxed_type__;
}, b.fromJSON = function(t2) {
  return "NotAsked" === t2.tag ? R.NotAsked() : "Loading" === t2.tag ? R.Loading() : R.Done(t2.value);
}, b.prototype.__boxed_type__ = "AsyncData";
var N, S = b.prototype, j = ((N = Object.create(S)).tag = "Loading", Object.freeze(N), N), D = (function() {
  var t2 = Object.create(S);
  return t2.tag = "NotAsked", Object.freeze(t2), t2;
})(), R = b;
function useAddReviewToCaseCommentsMutation(caseId, reviewId) {
  const queryClient = useQueryClient();
  const addReviewToCaseComments = useServerFn(addReviewToCaseCommentsFn);
  return useMutation({
    mutationFn: async () => {
      if (!reviewId) {
        throw new Error("Review ID is required");
      }
      await addReviewToCaseComments({ data: { caseId, reviewId } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases", caseId, "reviews"] });
    }
  });
}
function useCaseReviewFeedbackMutation(caseId, reviewId) {
  const queryClient = useQueryClient();
  const addCaseReviewFeedback = useServerFn(addCaseReviewFeedbackFn);
  return useMutation({
    mutationFn: async (reaction) => {
      if (!reviewId) {
        throw new Error("Review ID is required");
      }
      await addCaseReviewFeedback({ data: { caseId, reviewId, reaction } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases", caseId, "reviews"] });
    }
  });
}
const caseDecisionsQueryKey = ["cases", "list-decisions"];
function useInvalidateCaseDecisions() {
  const queryClient = useQueryClient();
  return reactExports.useCallback(() => {
    queryClient.invalidateQueries({ queryKey: caseDecisionsQueryKey });
  }, [queryClient]);
}
function useCaseDecisionsQuery(caseId) {
  const listCaseDecisions = useServerFn(listCaseDecisionsFn);
  const queryKey = [...caseDecisionsQueryKey, caseId];
  return useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam }) => {
      return listCaseDecisions({
        data: { caseId, cursorId: pageParam ?? void 0 }
      });
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => {
      if (!lastPage) return null;
      return lastPage.pagination.hasMore ? lastPage.pagination.cursorId : null;
    }
  });
}
const getScreeningDetailQueryKey = (decisionId, screeningId) => [
  "screenings",
  "detail",
  decisionId,
  screeningId
];
function useScreeningDetailQuery(decisionId, screeningId, enabled) {
  const getScreeningDetail = useServerFn(getScreeningDetailFn);
  return useQuery({
    queryKey: getScreeningDetailQueryKey(decisionId, screeningId),
    queryFn: async () => {
      const result = await getScreeningDetail({ data: { decisionId, screeningId } });
      return result.screening;
    },
    enabled
  });
}
function useInvalidateScreeningDetail() {
  const queryClient = useQueryClient();
  return reactExports.useCallback(
    (decisionId, screeningId) => {
      queryClient.invalidateQueries({
        queryKey: getScreeningDetailQueryKey(decisionId, screeningId)
      });
    },
    [queryClient]
  );
}
const useReviewDecisionMutation = () => {
  const reviewDecision = useServerFn(reviewDecisionFn);
  const invalidateCaseDecisions = useInvalidateCaseDecisions();
  return useMutation({
    mutationKey: ["cases", "review-decision"],
    mutationFn: async (payload) => reviewDecision({ data: payload }),
    onSuccess: () => {
      invalidateCaseDecisions();
    }
  });
};
const reviewStatusMapping = {
  pending: {
    color: "orange",
    tKey: "decisions:review_status.pending"
  },
  approve: { color: "green", tKey: "decisions:review_status.approve" },
  decline: { color: "red", tKey: "decisions:review_status.decline" }
};
function ReviewStatusTag({ reviewStatus, disabled, ...tagProps }) {
  const { t: t2 } = useTranslation(decisionsI18n);
  const { color, tKey } = reviewStatusMapping[reviewStatus];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { ...tagProps, color: disabled ? "grey" : color, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-center capitalize", children: t2(tKey) }) });
}
function ReviewDecisionModal({
  decisionId,
  screening,
  children
}) {
  const [open, setOpen] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Root, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Trigger, { asChild: true, children }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Content, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewDecisionContent, { setOpen, decisionId, screening }) })
  ] });
}
function ReviewDecisionContent({
  decisionId,
  screening,
  setOpen
}) {
  const { t: t2 } = useTranslation(["common", "cases"]);
  const reviewDecisionMutation = useReviewDecisionMutation();
  const form = useForm({
    defaultValues: {
      decisionId,
      reviewComment: "",
      reviewStatus: ""
    },
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        reviewDecisionMutation.mutate(value, {
          onSuccess: (res) => {
            if (res.status === "error") {
              zt.error(t2("common:errors.unknown"));
              return;
            }
            zt.success(t2("common:success.save"));
            setOpen(false);
          },
          onError: () => {
            zt.error(t2("common:errors.unknown"));
          }
        });
      }
    },
    validators: {
      onSubmit: reviewDecisionPayloadSchema
    }
  });
  return (
    // Stop React synthetic events from bubbling through the portal to the parent AlertCard
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "form",
      {
        onClick: (e2) => e2.stopPropagation(),
        onKeyDown: (e2) => e2.stopPropagation(),
        onSubmit: (e2) => {
          e2.preventDefault();
          e2.stopPropagation();
          form.handleSubmit();
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm p-md", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-grey-primary text-base font-semibold leading-[1.1]", children: t2("cases:case_detail.review_decision.title") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Description, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-grey-primary text-s leading-[1.4]", children: t2("cases:case_detail.review_decision.description") }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              form.Field,
              {
                name: "reviewStatus",
                validators: {
                  onChange: reviewDecisionPayloadSchema.shape.reviewStatus
                },
                children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
                  nonPendingReviewStatuses.map((reviewStatus) => {
                    const isSelected = field.state.value === reviewStatus;
                    const hasScreeningWarning = screening && screening.status !== "no_hit" && reviewStatus === "approve";
                    return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex cursor-pointer items-center gap-sm", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "input",
                        {
                          type: "radio",
                          name: "reviewStatus",
                          value: reviewStatus,
                          checked: isSelected,
                          onChange: () => field.handleChange(reviewStatus),
                          className: cn(
                            "size-4 shrink-0 appearance-none rounded-full border",
                            isSelected ? "border-[5px] border-purple-primary" : "border border-purple-primary bg-white"
                          )
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2xs", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewStatusTag, { size: "small", className: "w-fit", reviewStatus }),
                        hasScreeningWarning ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-hover text-xs", children: t2("cases:case_detail.review_decision.warning_approve") }) : null
                      ] })
                    ] }, reviewStatus);
                  }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors) })
                ] })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              form.Field,
              {
                name: "reviewComment",
                validators: {
                  onChange: reviewDecisionPayloadSchema.shape.reviewComment
                },
                children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TextArea,
                  {
                    className: "w-full",
                    name: field.name,
                    defaultValue: field.state.value,
                    onChange: (e2) => field.handleChange(e2.currentTarget.value),
                    borderColor: field.state.meta.errors.length === 0 ? "greyfigma-90" : "redfigma-47",
                    placeholder: t2("cases:case_detail.review_decision.comment.placeholder")
                  }
                )
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Footer, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { isCloseButton: true, label: t2("cases:case_detail.review_decision.go_back") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Modal.FooterButton,
              {
                variant: "primary",
                type: "submit",
                label: t2("common:validate"),
                disabled: reviewDecisionMutation.isPending,
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingIcon, { icon: "case-manager", className: "size-5", loading: reviewDecisionMutation.isPending })
              }
            )
          ] })
        ]
      }
    )
  );
}
const useDetailDecisionQuery = (decisionId) => {
  const getDecision = useServerFn(getDecisionFn);
  return useQuery({
    queryKey: ["decisions", decisionId],
    queryFn: async () => getDecision({ data: { decisionId } })
  });
};
function useScenarioIterationRules(scenarioIterationId) {
  const getIterationRules = useServerFn(getIterationRulesFn);
  return useQuery({
    queryKey: ["scenario-iteration-rules", scenarioIterationId],
    queryFn: async () => getIterationRules({ data: { iterationId: scenarioIterationId } })
  });
}
function DecisionPanel({ decision, dataModel, onClose, onScreeningSelect }) {
  const { t: t2 } = useTranslation(casesI18n);
  const detailDecisionQuery = useDetailDecisionQuery(decision.id);
  const [showHitOnly, setShowHitOnly] = reactExports.useState(true);
  const screenings = decision.screenings ?? [];
  const [objectLink, setObjectLink] = reactExports.useState(null);
  const isPendingReview = decision.outcome === "block_and_review" && decision.reviewStatus === "pending";
  const scenarioIterationRules = useScenarioIterationRules(
    detailDecisionQuery.data?.decision.scenario.scenarioIterationId ?? ""
  );
  const filteredRuleExecutions = reactExports.useMemo(() => {
    if (!detailDecisionQuery.data) return [];
    const rules = detailDecisionQuery.data.decision.rules;
    if (showHitOnly) {
      return rules.filter((r2) => r2.outcome === "hit");
    }
    return rules;
  }, [detailDecisionQuery.data, showHitOnly]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel.Content, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Header, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col gap-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(AlertOutcomeIcon, { outcome: decision.outcome, reviewStatus: decision.reviewStatus, showLabel: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-primary font-semibold", children: decision.scenario.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ScoreModifier, { score: decision.score })
        ] }),
        isPendingReview ? /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewDecisionModal, { decisionId: decision.id, screening: screenings[0], children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "primary", size: "small", children: t2("cases:decisions.approve_or_decline") }) }) : null
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CopyToClipboardButton, { size: "sm", toCopy: decision.id, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-normal", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "ID" }),
        " ",
        decision.id
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-md", children: [
      screenings.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-m text-grey-primary font-medium", children: t2("cases:decisions.screenings_rules") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-sm", children: screenings.map((screening) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-placeholder text-xs font-medium", children: "•" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-placeholder text-xs font-medium", children: screening.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              role: "button",
              tabIndex: 0,
              onClick: (e2) => {
                e2.stopPropagation();
                onScreeningSelect(screening.id);
              },
              onKeyDown: (e2) => {
                if (e2.key === "Enter" || e2.key === " ") {
                  e2.stopPropagation();
                  onScreeningSelect(screening.id);
                }
              },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                ScreeningStatusBadge,
                {
                  status: screening.status,
                  decisionId: decision.id,
                  screeningId: screening.id,
                  nbHits: screening.count
                }
              )
            }
          )
        ] }, screening.id)) })
      ] }) : null,
      M(detailDecisionQuery).with({ isPending: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center p-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, { className: "size-8" }) })).with({ isError: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-grey-secondary p-md text-center text-xs", children: t2("common:global_error") })).otherwise(() => {
        const allRules = detailDecisionQuery.data?.decision.rules ?? [];
        if (allRules.length === 0) return null;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-m text-grey-primary font-medium", children: t2("cases:decisions.rules") }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "showHitOnly", className: "text-grey-primary cursor-pointer select-none text-xs", children: t2("cases:case_detail.rules_execution.show_hit_only") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { id: "showHitOnly", checked: showHitOnly, onCheckedChange: setShowHitOnly })
            ] })
          ] }),
          filteredRuleExecutions.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(RulesExecutionsContainer, { className: "h-fit", children: filteredRuleExecutions.map((ruleExecution) => /* @__PURE__ */ jsxRuntimeExports.jsxs(RuleExecutionCollapsible, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RuleExecutionTitle, { ruleExecution }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(RuleExecutionContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(RuleExecutionDescription, { description: ruleExecution.description }),
              scenarioIterationRules.data ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                RuleExecutionDetail,
                {
                  scenarioId: detailDecisionQuery.data?.decision.scenario.id ?? "",
                  ruleExecution,
                  rules: scenarioIterationRules.data.rules,
                  isIterationArchived: scenarioIterationRules.data.archived
                }
              ) : null
            ] })
          ] }, ruleExecution.ruleId)) }) : null
        ] });
      }),
      detailDecisionQuery.data ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-m text-grey-primary font-medium", children: t2("cases:case_detail.trigger_object") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          CaseDetailTriggerObject,
          {
            className: "max-h-[50dvh] overflow-auto",
            dataModel,
            triggerObject: detailDecisionQuery.data.decision.triggerObject,
            triggerObjectType: detailDecisionQuery.data.decision.triggerObjectType,
            onLinkClicked: (tableName, objectId) => setObjectLink({ tableName, objectId })
          }
        ),
        objectLink ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          IngestedObjectDetailModal,
          {
            dataModel,
            tableName: objectLink.tableName,
            objectId: objectLink.objectId,
            onClose: () => setObjectLink(null)
          }
        ) : null
      ] }) : null
    ] })
  ] });
}
const useBulkReviewMatchesMutation = () => {
  const setAllMatchesToNoHit = useServerFn(setAllMatchesToNoHitFn);
  return useMutation({
    mutationFn: async (matchIds) => {
      return setAllMatchesToNoHit({ data: { matchIds } });
    }
  });
};
const getScreeningAiSuggestionsQueryKey = (screeningId) => ["screenings", "ai-suggestions", screeningId];
function useScreeningAiSuggestionsQuery(screeningId, enabled) {
  const getScreeningAiSuggestions = useServerFn(getScreeningAiSuggestionsFn);
  return useQuery({
    queryKey: getScreeningAiSuggestionsQueryKey(screeningId),
    queryFn: async () => {
      const result = await getScreeningAiSuggestions({ data: { screeningId } });
      return result.suggestions;
    },
    enabled
  });
}
function useInvalidateScreeningAiSuggestions() {
  const queryClient = useQueryClient();
  return reactExports.useCallback(
    (screeningId) => {
      queryClient.invalidateQueries({
        queryKey: getScreeningAiSuggestionsQueryKey(screeningId)
      });
    },
    [queryClient]
  );
}
function getScreeningSearchName(screening) {
  const request = screening.request;
  if (!request) return "";
  const queries = Object.values(request.queries);
  const name = queries.flatMap((query) => query.properties["name"] ?? [])[0];
  if (name) return name;
  return queries.flatMap((query) => Object.values(query.properties).flat()).join(" ");
}
function getRefineSearchDefaultValues(screening, searchName) {
  const base = {
    screeningId: screening.id,
    entityType: "Thing",
    fields: { name: searchName }
  };
  const request = screening.request;
  if (!request) return base;
  const query = Object.values(request.queries)[0];
  if (!query) return base;
  const schema = query.schema;
  if (!(schema in SEARCH_ENTITIES)) return base;
  const entityType = schema;
  const properties = { name: searchName };
  for (const [key, values] of Object.entries(query.properties)) {
    if (key !== "name") properties[key] = values[0];
  }
  return {
    screeningId: screening.id,
    entityType,
    fields: setAdditionalFields(SEARCH_ENTITIES[entityType].fields, properties)
  };
}
function withSearchName(value, searchName) {
  return { ...value, fields: { ...value.fields, name: searchName } };
}
function InlineRefineSearch({
  screening,
  onBack: _onBack,
  onSearchComplete: _onSearchComplete
}) {
  const { t: t2 } = useTranslation(screeningsI18n);
  const onBack = useCallbackRef(_onBack);
  const onSearchComplete = useCallbackRef(_onSearchComplete);
  const searchMutation = useSearchScreeningMatchesMutation();
  const searchName = getScreeningSearchName(screening);
  const form = useForm({
    defaultValues: getRefineSearchDefaultValues(screening, searchName),
    validators: {
      onChange: refineSearchSchema
    },
    onSubmit: ({ value }) => {
      const submitValue = withSearchName(value, searchName);
      searchMutation.mutateAsync(submitValue).then((data) => {
        onSearchComplete(data, submitValue);
      }).catch(() => {
        zt.error(t2("common:errors.unknown"));
      });
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sticky top-0 flex h-fit w-[360px] shrink-0 flex-col gap-md border-l border-grey-border ps-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-m font-medium", children: t2("screenings:panel.search_details") }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-md rounded-lg border border-purple-primary bg-purple-background-light p-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s font-medium", children: t2("screenings:refine_inline.edit_search_label") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit(form), className: "contents", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
          searchName ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-clip text-purple-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-s font-medium", children: searchName }) }) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsx(EntitySearchFormProvider, { form, children: /* @__PURE__ */ jsxRuntimeExports.jsx(EntityTypePopover, { disabled: searchMutation.isPending }) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", appearance: "stroked", size: "small", onClick: onBack, children: t2("screenings:refine_inline.back") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(form.Subscribe, { selector: (state) => [state.isPristine, state.canSubmit, state.isSubmitting], children: ([isPristine, canSubmit, isSubmitting]) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "submit",
              size: "small",
              disabled: isPristine || !canSubmit || !searchName.trim(),
              variant: "primary",
              children: isSubmitting ? "..." : t2("screenings:refine_inline.search")
            }
          ) })
        ] })
      ] })
    ] })
  ] });
}
function PanelSearchDetails({
  screening,
  onRefineSuccess,
  onSearchComplete
}) {
  const { t: t2 } = useTranslation(screeningsI18n);
  const [isRefining, setIsRefining] = reactExports.useState(false);
  const isRefinable = !isScreeningReviewCompleted(screening);
  const request = screening.request;
  const queries = request ? Object.values(request.queries) : [];
  if (isRefining) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      InlineRefineSearch,
      {
        screening,
        onBack: () => setIsRefining(false),
        onSearchComplete
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sticky top-0 flex h-fit w-[360px] shrink-0 flex-col gap-md ps-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-m font-medium", children: t2("screenings:panel.search_details") }),
    request ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-grey-background-light border border-grey-border flex flex-col rounded-lg p-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s font-medium", children: t2("screenings:panel.search_label") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-sm", children: queries.map((query, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(QueryProperties, { query }, idx)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-grey-border my-sm" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SearchDetailRow, { label: t2("screenings:match_threshold"), children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: `> ${request.threshold}%` }) }) })
    ] }) : null,
    isRefinable ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        variant: "primary",
        appearance: "stroked",
        size: "small",
        className: "w-fit",
        onClick: () => setIsRefining(true),
        children: t2("screenings:refine_search")
      }
    ) : null
  ] });
}
function SearchDetailRow({ label, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-md items-start text-s", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-[133px] shrink-0 opacity-50", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 min-w-0", children })
  ] });
}
function QueryProperties({ query }) {
  const { getEntityName, t: t2 } = useEntityName();
  const entityTypeLabel = getEntityName(query.schema);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    Object.entries(query.properties).map(([key, values]) => /* @__PURE__ */ jsxRuntimeExports.jsx(SearchDetailRow, { label: key, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: values.join(", ") }) }, key)),
    /* @__PURE__ */ jsxRuntimeExports.jsx(SearchDetailRow, { label: t2("screenings:search_entity_type"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: "grey", children: entityTypeLabel }) })
  ] });
}
function ScreeningHitsPanel({
  open,
  onOpenChange,
  decisionId,
  screeningId: initialScreeningId,
  screeningName,
  screeningStatus
}) {
  const { t: t2 } = useTranslation([...screeningsI18n, "common"]);
  const [currentScreeningId, setCurrentScreeningId] = reactExports.useState(initialScreeningId);
  reactExports.useEffect(() => {
    setCurrentScreeningId(initialScreeningId);
  }, [initialScreeningId]);
  const invalidateScreeningDetail = useInvalidateScreeningDetail();
  const invalidateCaseDecisions = useInvalidateCaseDecisions();
  const handleOpenChange = reactExports.useCallback(
    (isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) {
        invalidateCaseDecisions();
      }
    },
    [onOpenChange, invalidateCaseDecisions]
  );
  const screeningQuery = useScreeningDetailQuery(decisionId, currentScreeningId, open);
  const aiSuggestionsQuery = useScreeningAiSuggestionsQuery(currentScreeningId, open);
  const invalidateAiSuggestions = useInvalidateScreeningAiSuggestions();
  const bulkReviewMutation = useBulkReviewMatchesMutation();
  const [selectedMatchIds, setSelectedMatchIds] = reactExports.useState([]);
  const revalidate = reactExports.useCallback(() => {
    invalidateScreeningDetail(decisionId, currentScreeningId);
  }, [invalidateScreeningDetail, decisionId, currentScreeningId]);
  const revalidateAfterBulk = reactExports.useCallback(() => {
    invalidateScreeningDetail(decisionId, currentScreeningId);
    invalidateAiSuggestions(currentScreeningId);
  }, [invalidateScreeningDetail, invalidateAiSuggestions, decisionId, currentScreeningId]);
  const handleRefineSuccess = reactExports.useCallback(
    (newScreeningId) => {
      setCurrentScreeningId(newScreeningId);
      setPreviewResults(null);
      invalidateScreeningDetail(decisionId, newScreeningId);
    },
    [invalidateScreeningDetail, decisionId]
  );
  const [previewResults, setPreviewResults] = reactExports.useState(null);
  const previewFormValuesRef = reactExports.useRef(null);
  const refineMutation = useRefineScreeningMutation();
  const handleSearchComplete = reactExports.useCallback((results, formValues) => {
    setPreviewResults(results);
    previewFormValuesRef.current = formValues;
  }, []);
  const handleValidate = reactExports.useCallback(() => {
    if (previewFormValuesRef.current) {
      refineMutation.mutateAsync(previewFormValuesRef.current).then((data) => {
        handleRefineSuccess(data.id);
      });
    }
  }, [refineMutation]);
  const handleCancelPreview = reactExports.useCallback(() => {
    setPreviewResults(null);
    previewFormValuesRef.current = null;
  }, []);
  const currentName = screeningQuery.data?.config.name ?? screeningName;
  const currentStatus = screeningQuery.data?.status ?? screeningStatus;
  const screening = screeningQuery.data;
  const aiSuggestions = aiSuggestionsQuery.data ?? [];
  const isInPreview = !!previewResults;
  const pendingMatches = reactExports.useMemo(
    () => screening ? n$3(screening.matches, (m2) => m2.status === "pending") : [],
    [screening]
  );
  const aiSuggestionsByMatchId = reactExports.useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    for (const suggestion of aiSuggestions) {
      map.set(suggestion.matchId, suggestion);
    }
    return map;
  }, [aiSuggestions]);
  const probableFalsePositiveMatchIds = reactExports.useMemo(
    () => pendingMatches.filter((m2) => aiSuggestionsByMatchId.get(m2.id)?.confidence === "probable_false_positive").map((m2) => m2.id),
    [pendingMatches, aiSuggestionsByMatchId]
  );
  const showDismissButton = !isInPreview && probableFalsePositiveMatchIds.length >= 1;
  const showBulkButton = !isInPreview && selectedMatchIds.length >= 2;
  const handleDismissFalsePositives = reactExports.useCallback(() => {
    bulkReviewMutation.mutate(probableFalsePositiveMatchIds, {
      onSuccess: revalidateAfterBulk,
      onError: () => zt.error(t2("common:errors.unknown"))
    });
  }, [bulkReviewMutation, probableFalsePositiveMatchIds, revalidateAfterBulk, t2]);
  const handleBulkMarkFalsePositive = reactExports.useCallback(() => {
    bulkReviewMutation.mutate(selectedMatchIds, {
      onSuccess: revalidateAfterBulk,
      onError: () => zt.error(t2("common:errors.unknown"))
    });
  }, [bulkReviewMutation, selectedMatchIds, revalidateAfterBulk, t2]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Root, { open, onOpenChange: handleOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Container, { size: "large", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel.Content, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Header, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-md pb-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 items-center gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typo, { variant: "title2", children: currentName }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          ScreeningStatusTag,
          {
            status: currentStatus,
            pendingHitCount: screeningQuery.data?.matches.filter((m2) => m2.status === "pending").length
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm shrink-0", children: [
        showBulkButton ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "primary",
            size: "small",
            onClick: handleBulkMarkFalsePositive,
            disabled: bulkReviewMutation.isPending,
            children: t2("screenings:panel.mark_all_false_positive")
          }
        ) : null,
        showDismissButton ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "secondary",
            appearance: "stroked",
            size: "small",
            onClick: handleDismissFalsePositives,
            disabled: bulkReviewMutation.isPending,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "wand", className: "size-4" }),
              t2("screenings:panel.dismiss_false_positives")
            ]
          }
        ) : null
      ] })
    ] }) }),
    M(screeningQuery).with({ isPending: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center p-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, {}) })).with({ isError: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-grey-secondary p-xl text-center text-s", children: t2("common:global_error") })).otherwise((query) => {
      const screeningData = query.data;
      if (!screeningData) {
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-grey-secondary p-xl text-center text-s", children: t2("common:global_error") });
      }
      return /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderRevalidatorContext.Provider, { value: revalidate, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full items-start", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          PanelMatchList,
          {
            screening: screeningData,
            previewResults,
            onValidate: handleValidate,
            onCancel: handleCancelPreview,
            aiSuggestionsByMatchId,
            selectedMatchIds,
            setSelectedMatchIds,
            isInPreview
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shrink-0 border-l border-grey-border self-stretch" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          PanelSearchDetails,
          {
            screening: screeningData,
            onRefineSuccess: handleRefineSuccess,
            onSearchComplete: handleSearchComplete
          }
        )
      ] }) });
    })
  ] }) }) });
}
function PanelMatchList({
  screening,
  previewResults,
  onValidate,
  onCancel,
  aiSuggestionsByMatchId,
  selectedMatchIds,
  setSelectedMatchIds,
  isInPreview
}) {
  const { t: t2 } = useTranslation(screeningsI18n);
  const pendingMatches = reactExports.useMemo(() => n$3(screening.matches, (m2) => m2.status === "pending"), [screening.matches]);
  const matchesToReviewCount = pendingMatches.length;
  const toggleMatch = reactExports.useCallback(
    (matchId, checked) => {
      setSelectedMatchIds((prev) => {
        if (checked) {
          return prev.includes(matchId) ? prev : [...prev, matchId];
        }
        return prev.filter((id) => id !== matchId);
      });
    },
    [setSelectedMatchIds]
  );
  const pendingMatchIds = reactExports.useMemo(() => pendingMatches.map((m2) => m2.id), [pendingMatches]);
  const pendingMatchIdsSet = reactExports.useMemo(() => new Set(pendingMatchIds), [pendingMatchIds]);
  const selectedMatchIdsSet = reactExports.useMemo(() => new Set(selectedMatchIds), [selectedMatchIds]);
  reactExports.useEffect(() => {
    setSelectedMatchIds((prev) => {
      const next = prev.filter((id) => pendingMatchIdsSet.has(id));
      return next.length === prev.length ? prev : next;
    });
  }, [pendingMatchIdsSet, setSelectedMatchIds]);
  const toggleAll = reactExports.useCallback(() => {
    setSelectedMatchIds((prev) => {
      const allSelected2 = pendingMatchIds.every((id) => prev.includes(id));
      return allSelected2 ? [] : pendingMatchIds;
    });
  }, [pendingMatchIds, setSelectedMatchIds]);
  const showSelectControls = !isInPreview && pendingMatches.length >= 1;
  const allSelected = pendingMatchIds.length > 0 && pendingMatchIds.every((id) => selectedMatchIdsSet.has(id));
  const previewMatches = reactExports.useMemo(() => {
    if (!previewResults) return null;
    return previewResults.map((payload) => ({
      id: payload.id,
      entityId: payload.id,
      queryIds: [],
      status: "pending",
      enriched: false,
      payload,
      comments: []
    }));
  }, [previewResults]);
  const matches = previewMatches ?? screening.matches;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col gap-sm pe-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-m font-medium", children: t2("screenings:potential_matches") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s opacity-50", children: t2("screenings:callout.needs_review", {
      toReview: matchesToReviewCount,
      totalMatches: screening.matches.length
    }) }),
    showSelectControls ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        className: "text-s text-purple-primary hover:text-purple-hover w-fit cursor-pointer",
        onClick: toggleAll,
        children: allSelected ? t2("screenings:panel.deselect_all") : t2("screenings:panel.select_all")
      }
    ) : null,
    previewMatches ? /* @__PURE__ */ jsxRuntimeExports.jsx(CalloutV2, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 items-center justify-between gap-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s", children: t2("screenings:refine_inline.new_results_callout") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", appearance: "stroked", size: "small", onClick: onCancel, children: t2("screenings:refine_inline.cancel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "primary", size: "small", onClick: onValidate, children: t2("screenings:refine_inline.validate_results") })
      ] })
    ] }) }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-sm mt-sm", children: [...matches].sort(sortScreeningMatchesByTopics).map((screeningMatch) => {
      const isPending = screeningMatch.status === "pending";
      const showCheckbox = showSelectControls && isPending;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-sm", children: [
        showCheckbox ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex shrink-0 items-start pt-md w-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Checkbox,
          {
            size: "small",
            checked: selectedMatchIdsSet.has(screeningMatch.id),
            onCheckedChange: (checked) => toggleMatch(screeningMatch.id, checked === true)
          }
        ) }) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 min-w-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          MatchCard,
          {
            screening,
            match: screeningMatch,
            defaultOpen: matches.length === 1,
            hideEnrich: true,
            hideReview: !!previewMatches,
            aiSuggestion: aiSuggestionsByMatchId.get(screeningMatch.id)
          }
        ) })
      ] }, screeningMatch.id);
    }) })
  ] });
}
const MAX_RULES_DISPLAYED = 3;
const CaseAlerts = ({ caseDecisionsQuery, dataModel }) => {
  const { t: t2 } = useTranslation(casesI18n);
  return M(caseDecisionsQuery).with({ isPending: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center p-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, {}) })).with({ isError: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-grey-secondary p-md text-center text-xs", children: t2("common:global_error") })).otherwise((query) => {
    const decisions = query.data.pages.flatMap((page) => page.decisions);
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-sm", children: decisions.map((decision) => {
        const triggerObjectFields = getTriggerObjectFields(dataModel, decision.triggerObjectType);
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          AlertCard,
          {
            dataModel,
            decision,
            triggerObjectFields
          },
          decision.id
        );
      }) }),
      query.hasNextPage ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", onClick: () => query.fetchNextPage(), children: t2("common:load_more_results") }) : null
    ] });
  });
};
const AlertCard = ({
  dataModel,
  decision,
  triggerObjectFields
}) => {
  const { t: t2 } = useTranslation(casesI18n);
  const formatDateTime = useFormatDateTime();
  const [panelScreeningId, setPanelScreeningId] = reactExports.useState(null);
  const [openDetails, setOpenDetails] = reactExports.useState(false);
  const screenings = decision.screenings ?? [];
  const hitRules = decision.rules.filter((r2) => r2.outcome === "hit");
  const openScreening = screenings.find((s2) => s2.id === panelScreeningId);
  const onSelect = () => {
    setOpenDetails(true);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        tabIndex: 0,
        role: "button",
        className: cn(
          "border-grey-border bg-surface-card grid grid-cols-[80px_1fr] gap-sm rounded-lg border p-md transition-colors cursor-pointer hover:bg-purple-background-light",
          { "bg-purple-background-light": openDetails }
        ),
        onClick: () => {
          onSelect();
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-6 items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-secondary text-xs font-normal", children: formatDateTime(decision.createdAt, { dateStyle: "short" }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm overflow-hidden", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(AlertOutcomeIcon, { outcome: decision.outcome, reviewStatus: decision.reviewStatus }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-xs font-normal", children: decision.scenario.name }),
                decision.rules.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "border-grey-placeholder text-grey-placeholder inline-flex shrink-0 items-center gap-xs rounded-full border px-xs py-0.5 text-xs font-normal", children: [
                  decision.score >= 0 ? "+" : "",
                  decision.score
                ] }) : null
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-sm", children: [
                decision.reviewStatus === "approve" ? /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewStatusTag, { reviewStatus: decision.reviewStatus }) : null,
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", size: "small", appearance: "stroked", mode: "icon", onClick: onSelect, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "eye", className: "size-4" }) })
              ] })
            ] }),
            triggerObjectFields.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TriggerFieldsRow, { fields: triggerObjectFields, triggerObject: decision.triggerObject }) : null,
            hitRules.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-xs text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-secondary shrink-0", children: t2("cases:decisions.rule_hits") }),
              t$2(
                hitRules,
                n$1(MAX_RULES_DISPLAYED),
                t$3((r2) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "span",
                  {
                    className: "border-grey-border truncate rounded-sm border px-xs py-2xs text-xs font-normal",
                    children: [
                      r2.scoreModifier > 0 ? "+" : "",
                      r2.scoreModifier,
                      " ",
                      r2.name
                    ]
                  },
                  r2.ruleId || r2.name
                ))
              ),
              hitRules.length > MAX_RULES_DISPLAYED ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "border-grey-border rounded-sm border px-xs py-2xs text-xs font-medium", children: [
                "+",
                hitRules.length - MAX_RULES_DISPLAYED
              ] }) : null
            ] }) : null,
            screenings.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-secondary text-xs", children: t2("cases:decisions.status_on_hits") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-sm", children: screenings.map((screening) => {
                return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-placeholder text-xs font-medium", children: "•" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-placeholder text-xs font-medium", children: screening.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      role: "button",
                      tabIndex: 0,
                      onClick: (e2) => {
                        e2.stopPropagation();
                        setPanelScreeningId(screening.id);
                      },
                      onKeyDown: (e2) => {
                        if (e2.key === "Enter" || e2.key === " ") {
                          e2.stopPropagation();
                          setPanelScreeningId(screening.id);
                        }
                      },
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        ScreeningStatusBadge,
                        {
                          status: screening.status,
                          decisionId: decision.id,
                          screeningId: screening.id,
                          nbHits: screening.count
                        }
                      )
                    }
                  )
                ] }, screening.id);
              }) })
            ] }) : null
          ] })
        ]
      }
    ),
    openDetails ? /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Root, { open: true, onOpenChange: (isOpen) => setOpenDetails(isOpen), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Container, { size: "medium", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      DecisionPanel,
      {
        dataModel,
        decision,
        onClose: () => setOpenDetails(false),
        onScreeningSelect: setPanelScreeningId
      }
    ) }) }) : null,
    openScreening ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      ScreeningHitsPanel,
      {
        open: true,
        onOpenChange: (isOpen) => {
          if (!isOpen) setPanelScreeningId(null);
        },
        decisionId: decision.id,
        screeningId: openScreening.id,
        screeningName: openScreening.name,
        screeningStatus: openScreening.status
      }
    ) : null
  ] });
};
const TriggerFieldsRow = ({
  fields,
  triggerObject
}) => {
  const { t: t2 } = useTranslation(casesI18n);
  const renderField = (field, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { "data-field-item": true, className: "inline-flex shrink-0 items-baseline gap-xs", children: [
    index > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-placeholder", children: "·" }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
      field.name,
      ":"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "max-w-[120px] truncate", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FormatData, { data: parseUnknownData(triggerObject[field.name]) }) })
  ] }, field.id);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-secondary shrink-0", children: t2("cases:decisions.trigger_objects") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ExpandableGroupTagLine,
      {
        items: fields.map(renderField),
        moreButton: (overflow) => /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip.Default, { content: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap w-min text-xs", children: fields.map(renderField) }), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "border-grey-border ms-xs inline-flex shrink-0 rounded-sm border px-xs py-2xs text-xs font-medium", children: [
          "+",
          overflow
        ] }) }),
        overflowTagWidth: 40,
        classname: "gap-xs"
      }
    )
  ] }) });
};
const AlertOutcomeIcon = ({
  outcome,
  reviewStatus,
  showLabel = true
}) => {
  const { t: t2 } = useTranslation(casesI18n);
  const icon = M(outcome).with("approve", () => /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "accepted", className: "size-4 text-green-primary" })).with("decline", () => /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "denied", className: "size-4 text-red-primary" })).with("review", () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-3.5 rounded-full border-2 border-yellow-primary" })).with("unknown", () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-grey-placeholder size-4 rounded-full border-2" })).with(
    "block_and_review",
    () => M(reviewStatus).with("approve", () => /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "manually_accepted", className: "size-4 text-green-primary" })).with("decline", () => /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "manually_denied", className: "size-4 text-red-primary" })).otherwise(() => /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "block_and_review", className: "size-4 text-orange-primary" }))
  ).exhaustive();
  const label = M(outcome).with("approve", () => t2("decisions:outcome.tag.approved.label")).with("decline", () => t2("decisions:outcome.tag.declined.label")).with("review", () => t2("decisions:outcome.tag.review.label")).with("unknown", () => t2("decisions:outcome.tag.unknown.label")).with(
    "block_and_review",
    () => M(reviewStatus).with("approve", () => t2("decisions:outcome.tag.manually_approved.label")).with("decline", () => t2("decisions:outcome.tag.manually_declined.label")).otherwise(() => t2("decisions:outcome.block_and_review"))
  ).exhaustive();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex shrink-0 items-center gap-xs", children: [
    icon,
    showLabel ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium", children: label }) : null
  ] });
};
const screeningButtonStatusConfig = {
  in_review: { variant: "primary" },
  error: { variant: "secondary" }
};
const screeningLabelColors = {
  confirmed_hit: "text-red-primary",
  no_hit: "text-green-primary"
};
const ScreeningStatusBadge = ({
  status,
  decisionId,
  screeningId,
  nbHits
}) => {
  const { t: t2 } = useTranslation(casesI18n);
  const screeningQuery = useScreeningDetailQuery(decisionId, screeningId, true);
  if (status === "confirmed_hit" || status === "no_hit") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: cn("inline-flex items-center gap-xs text-xs font-medium", screeningLabelColors[status]), children: [
      t2(`screenings:status.${status}`),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "eye", className: "size-4 shrink-0" })
    ] });
  }
  const config = screeningButtonStatusConfig[status];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: config.variant, size: "small", className: "shadow-sm", tabIndex: -1, children: M(screeningQuery).with({ isPending: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, { className: "size-4" })).with({ isError: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-grey-secondary p-xl text-center text-s", children: t2("common:global_error") })).otherwise((query) => {
    const screeningData = query.data;
    if (!screeningData) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-grey-secondary p-xl text-center text-s", children: t2("common:global_error") });
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: t2(`screenings:status.${status}`, { count: nbHits }) }, status),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "eye", className: "size-4 shrink-0" })
    ] });
  }) });
};
export {
  AddRuleSnooze as A,
  CaseAlerts as C,
  PivotsPanelContent as P,
  ScoreModifier as S,
  PivotObjectDetails as a,
  useCaseReviewFeedbackMutation as b,
  useAddReviewToCaseCommentsMutation as c,
  useCaseDecisionsQuery as d,
  e,
  useRulesByPivotQuery as u
};
