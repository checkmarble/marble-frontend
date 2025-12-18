import { R as jsxRuntimeExports, r as reactExports } from "../server.js";
import { T as TagList, U as UserScoreBadge, C as ClientObjectTagList } from "./UserScoreBadge-CO8_r3Vc.js";
import { J as enqueueReviewFn, K as getCaseReviewFn, L as listCaseReviewsFn } from "./cases-DJ9ABIdo.js";
import { u as useMutation } from "./useMutation-C5oG90Zs.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
import { u as useQuery } from "./useQuery-B7mL_evE.js";
import { y as useQueryClient } from "./QueryClientProvider-DYTpkCko.js";
import { M, B as isAdmin, c_ as isRuleExecutionHit, aE as getDateFnsLocale } from "./services-middleware-DR8Hua1Y.js";
import { u as useTranslation, t as useFormatDateTime, e as Icon, T as Typo, B as Button, j as Tag, e4 as Modal, k as TooltipV2, s as Trans, q as useFormatLanguage, d_ as Tabs, d as cn, d$ as tabClassName, fs as formatRelative, C as CtaV2ClassName } from "./format-NPGUXq-g.js";
import { A as AIText } from "./AIText-26XR7fL6.js";
import { C as Card } from "./Card-9LKESqlf.js";
import { P as Panel } from "./Panel-kj8Z2GDk.js";
import { b as useCaseReviewFeedbackMutation, c as useAddReviewToCaseCommentsMutation, u as useRulesByPivotQuery, e, a as PivotObjectDetails, A as AddRuleSnooze, S as ScoreModifier, d as useCaseDecisionsQuery, C as CaseAlerts } from "./CaseAlerts-ZrdMVN_1.js";
import { z as zt, C as CopyToClipboardButton } from "./CopyToClipboardButton-CJNJJful.js";
import { M as Markdown } from "./Markdown-sjqeOXzy.js";
import { b as useEscalateCaseMutation, u as useEditTagsMutation, a as EditCaseAssignee, E as EditCaseInbox } from "./escalate-case-CwnOzYrx.js";
import { u as useOrganizationDetails } from "./organization-detail-YGkE0F4y.js";
import { u as useOrganizationTags } from "./organization-tags-CEJpwTHZ.js";
import { av as casesI18n, L as Link, Q as CaseStatusBadgeV2, q as clientDetailLinkParams, aS as Route } from "./router-vb7i5euz.js";
import { u as useForm } from "./useForm-BwABQKAs.js";
import { P as PivotNavigationOptions } from "./PivotNavigationOptions-CrxM6N-5.js";
import { C as CaseInvestigation } from "./CaseInvestigation-BPg2MpJz.js";
import { e as DataFields } from "./DataField-vckdVtrg.js";
import { b as DataModelExplorerProvider } from "./DataModelExplorer-gjwcxdcr.js";
import { D as DataExplorerPanel } from "./ScoreDetailPanel-BpXEd2Rh.js";
import { C as Callout } from "./Callout-DX4NBXlG.js";
import { u as useLoaderRevalidator } from "./LoaderRevalidatorContext-C9s56i-l.js";
import { u as useGetInboxesQuery } from "./get-inboxes-6fSfvled.js";
import { h as handleSubmit } from "./form-D2XmDKeG.js";
import { b as fromUUIDtoSUUID } from "./short-uuid-MIi3jWzx.js";
import { e as escalateCasePayloadSchema, f as editTagsPayloadSchema } from "./cases-PZYcTUxr.js";
import { N as Nudge } from "./Nudge-C1ux5IUa.js";
import { R as RuleGroup } from "./RuleGroup-DlaoMKK-.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
import "./ClientCommentForm-D-0vcWN7.js";
import "./data-BFm2FCTm.js";
import "./createSsrRpc-ZXUHv2Er.js";
import "./auth-middleware-C4ap47rJ.js";
import "./data-fdG1PpsD.js";
import "./Time-IafhAG3W.js";
import "./annotations-DpAN3M8g.js";
import "./use-callback-ref-DXzIzfqy.js";
import "./get-annotations-CiR2trFM.js";
import "./organization-object-tags-C9Gf0Ixc.js";
import "./create-context-CYc8deix.js";
import "./use-debounced-callback-ref-5JUm5kmy.js";
import "./scoring-NycAI253.js";
import "./user-scoring-BwKPLq1i.js";
import "./feature-access-B8PIS8ad.js";
import "./display-TKj7AN5a.js";
import "./useBaseQuery-CMboOtTR.js";
import "node:crypto";
import "./sharpstate.es-CeF1Mf5b.js";
import "./isNullish-B8pc8Ntu.js";
import "./add-comment-BaESvh7R.js";
import "./create-kyc-enrichment-CZ2VFgCE.js";
import "./Spinner-GK6cEAdR.js";
import "./ExternalLink-CG_77QdX.js";
import "./FormErrorOrDescription-DO6Hdfmn.js";
import "./FormInput-S5xzkMXf.js";
import "./FormLabel-DeCgtgtj.js";
import "./index-x7n7VJTa.js";
import "./index-C_WgunUr.js";
import "./documentation-href-uAe88WFl.js";
import "./screenings-CS8peAlI.js";
import "./FormatData-TXRe9nHU.js";
import "./ThemeContext-B40HQxfH.js";
import "./config-ut8rAdyo.js";
import "./maplibre-gl-Dbgqr2_Q.js";
import "./useInfiniteQuery-D2tvMYRf.js";
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
import "./organization-users-Bxl0ZW8k.js";
import "./user-C_y5ayGi.js";
import "./join-BeQTfqAC.js";
import "./Avatar-DpA4jY60.js";
import "./mapToObj-wQ-uHOuD.js";
import "./IngestedObjectDetailModal-BFFwOF2a.js";
import "./RulesDetail-19MjhcYa.js";
import "./Paper-6W_X6MFt.js";
import "./index-DCH5hwXA.js";
import "./dataTypeSchema-DvqJgdgd.js";
import "./isArray-gJc74O_I.js";
import "./index-CtZTigeT.js";
import "./index-BF4TC3go.js";
import "./index-CR1bHmei.js";
import "./scenario-validation-error-messages-CB3GcwJ8.js";
import "./flatMap-CbF5uMEQ.js";
import "./hovercard-provider-BchUL2eY.js";
import "./create-navigation-option-DrtWhyLE.js";
import "./isNonNullish-DgEqPJBU.js";
import "./index-DhVP5FgH.js";
import "./decisions-lgLe1L4K.js";
import "./Code-C6D_KXb1.js";
import "./useFormDropzone-BjTKexsf.js";
import "./array-BFSjnO9c.js";
import "./OutcomeTag-BH_m80fa.js";
import "./TagPreview-CjmrrQF6.js";
import "./endOfDay-DlzjvxTr.js";
import "./allPass-LKKfzhYC.js";
import "./curry-D3P8tFW_.js";
import "./security-headers.server-BdP3HrPp.js";
import "./i18n-instance-store-UssbGYOM.js";
import "./inboxes-D556s0BB.js";
import "./files-fO9wUXBf.js";
import "./case-detail-middleware-C3JS8Yme.js";
import "./input-validation-CU_reV2S.js";
import "./async-C3pYACua.js";
import "./decisions-B-2DmJW1.js";
import "./unique-CBeBxAXx.js";
import "./scenarios-8U74nJp4.js";
import "./uniqueBy-Tn1hUkKJ.js";
import "./data-model-B-Bz1o1P.js";
import "./omit-ZO4dmkWK.js";
import "./DownloadFilesService-BW-xJtj3.js";
import "./download-file-C533i5xX.js";
import "./isDeepEqual-C0XXZLYo.js";
function useEnqueueCaseReviewMutation() {
  const enqueueReview = useServerFn(enqueueReviewFn);
  return useMutation({
    mutationFn: async (caseId) => {
      await enqueueReview({ data: { caseId } });
    }
  });
}
function useCaseReviewQuery(caseId, reviewId) {
  const getCaseReview = useServerFn(getCaseReviewFn);
  return useQuery({
    queryKey: ["cases", caseId, "review", reviewId],
    queryFn: async () => {
      const result = await getCaseReview({ data: { caseId, reviewId } });
      return result.review;
    },
    enabled: !!caseId && !!reviewId
  });
}
function useCaseReviewsQuery(caseId, options) {
  const listCaseReviews = useServerFn(listCaseReviewsFn);
  return useQuery({
    queryKey: ["cases", caseId, "reviews"],
    queryFn: async () => {
      const result = await listCaseReviews({ data: { caseId } });
      return result.reviews;
    },
    enabled: !!caseId,
    refetchInterval: options?.refetchInterval
  });
}
function AiReviewPanel({ caseId, canManuallyReview, open, onOpenChange, reviews }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Root, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsx(AiReviewPanelContent, { ...{ caseId, canManuallyReview, open, onOpenChange, reviews } }) });
}
function AiReviewPanelContent({ caseId, canManuallyReview, onOpenChange, reviews }) {
  const { t } = useTranslation(["cases", "common"]);
  const formatDateTime = useFormatDateTime();
  const enqueueReviewMutation = useEnqueueCaseReviewMutation();
  const [selectedIndex, setSelectedIndex] = reactExports.useState(0);
  const selectedListItem = reviews[selectedIndex] ?? reviews[0];
  const reviewQuery = useCaseReviewQuery(caseId, selectedListItem?.id ?? "");
  const review = reviewQuery.data;
  const hasPreviousReport = selectedIndex < reviews.length - 1;
  const hasNextReport = selectedIndex > 0;
  if (!selectedListItem) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Container, { size: "medium", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel.Content, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Header, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "ai-review", className: "size-4 text-purple-primary shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typo, { variant: "title2", className: "text-grey-primary shrink-0", children: t("cases:case_detail.ai_review.panel.title") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewStatusBadge, { status: selectedListItem.status }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("time", { className: "text-xs text-grey-secondary shrink-0", dateTime: selectedListItem.createdAt, children: formatDateTime(selectedListItem.createdAt, { dateStyle: "short", timeStyle: "short" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ms-auto flex items-center gap-xs flex-wrap justify-end", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "secondary",
            size: "small",
            onClick: () => setSelectedIndex((i) => Math.min(i + 1, reviews.length - 1)),
            disabled: !hasPreviousReport,
            children: t("cases:case.ai_reviews.see_previous_report")
          }
        ),
        hasNextReport ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "secondary",
            size: "small",
            onClick: () => setSelectedIndex((i) => Math.max(i - 1, 0)),
            disabled: !hasNextReport,
            children: t("cases:case.ai_reviews.see_next_report")
          }
        ) : null,
        canManuallyReview ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "secondary",
            size: "small",
            onClick: () => enqueueReviewMutation.mutate(caseId),
            disabled: enqueueReviewMutation.isPending,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "wand", className: "size-4 text-purple-primary" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-purple-primary", children: t("cases:case.ai_reviews.generate") })
            ]
          }
        ) : null
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-md flex-1 overflow-y-auto py-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 min-w-0 text-small", children: reviewQuery.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "spinner", className: "size-6 animate-spin text-grey-secondary" }) }) : reviewQuery.isError ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full items-center justify-center text-s text-red-primary", children: t("cases:case.ai_reviews.error_loading") }) : review ? /* @__PURE__ */ jsxRuntimeExports.jsx(Markdown, { children: review.review.output }) : null }),
      review && !review.review.ok ? /* @__PURE__ */ jsxRuntimeExports.jsx(SanityCheckWarning, { message: review.review.sanityCheck }) : null
    ] }),
    review ? /* @__PURE__ */ jsxRuntimeExports.jsx(PanelFooter, { caseId, reviewId: review.id, reaction: review.reaction }) : null
  ] }) });
}
function SanityCheckWarning({ message }) {
  const { t } = useTranslation(["cases"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("aside", { className: "w-[403px] shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-red-background-light border border-red-border rounded-md p-md flex flex-col gap-xs", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "warning", className: "size-4 text-red-primary shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-default font-medium text-red-primary", children: t("cases:case_detail.ai_review.sanity_check_warning_title") })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-small text-grey-primary whitespace-pre-line", children: message })
  ] }) });
}
function PanelFooter({
  caseId,
  reviewId,
  reaction
}) {
  const { t } = useTranslation(["cases", "common"]);
  const feedbackMutation = useCaseReviewFeedbackMutation(caseId, reviewId);
  const addCommentMutation = useAddReviewToCaseCommentsMutation(caseId, reviewId);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel.Footer, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Panel.FooterButton,
      {
        variant: reaction === "ok" ? "primary" : "secondary",
        onClick: () => feedbackMutation.mutate("ok"),
        label: t("cases:case_detail.ai_review.actions.feedback_ok"),
        leadingIcon: "thumb-up"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Panel.FooterButton,
      {
        variant: reaction === "ko" ? "primary" : "secondary",
        label: t("cases:case_detail.ai_review.actions.feedback_ko"),
        leadingIcon: "thumb-down",
        onClick: () => feedbackMutation.mutate("ko")
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Panel.FooterButton,
      {
        variant: "secondary",
        label: t("cases:case_detail.ai_review.actions.add_to_comment"),
        leadingIcon: "comment",
        onClick: () => addCommentMutation.mutate(void 0, {
          onSuccess: () => zt.success(t("cases:case_detail.ai_review.actions.add_to_comment.success")),
          onError: () => zt.error(t("common:errors.unknown"))
        })
      }
    )
  ] });
}
function ReviewStatusBadge({ status }) {
  const { t } = useTranslation(["cases"]);
  switch (status) {
    case "completed":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: "green", size: "small", children: t("cases:case.ai_reviews.status.completed") });
    case "pending":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: "grey", size: "small", children: t("cases:case.ai_reviews.status.pending") });
    case "failed":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: "red", size: "small", children: t("cases:case.ai_reviews.status.failed") });
    case "insufficient_funds":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: "orange", size: "small", children: t("cases:case.ai_reviews.status.insufficient_funds") });
  }
}
const PENDING_POLL_INTERVAL_MS = 5e3;
function AiReviewCard({ caseId, canManuallyReview }) {
  const [panelOpen, setPanelOpen] = reactExports.useState(false);
  const enqueueReviewMutation = useEnqueueCaseReviewMutation();
  const queryClient = useQueryClient();
  const reviewsQuery = useCaseReviewsQuery(caseId, {
    refetchInterval: (query) => (query.state.data ?? []).some((r) => r.status === "pending") ? PENDING_POLL_INTERVAL_MS : false
  });
  const reviews = reviewsQuery.data ?? [];
  const latestReview = reviews[0];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { color: "purple", className: "flex flex-col gap-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Header,
        {
          showSeeAll: !!latestReview && latestReview.status === "completed",
          onSeeAll: () => setPanelOpen(true)
        }
      ),
      M(reviewsQuery).with({ isLoading: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingBody, {})).with({ isError: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorBody, {})).otherwise(
        () => !latestReview ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          EmptyBody,
          {
            canManuallyReview,
            onGenerate: () => enqueueReviewMutation.mutateAsync(caseId).then(() => {
              queryClient.invalidateQueries({ queryKey: ["cases", caseId, "reviews"] });
            }),
            isGenerating: enqueueReviewMutation.isPending
          }
        ) : latestReview.status === "pending" ? /* @__PURE__ */ jsxRuntimeExports.jsx(PendingBody, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(PopulatedBody, { review: reviewsQuery.data?.[0] })
      )
    ] }),
    latestReview ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      AiReviewPanel,
      {
        caseId,
        canManuallyReview,
        open: panelOpen,
        onOpenChange: setPanelOpen,
        reviews
      }
    ) : null
  ] });
}
function Header({ showSeeAll, onSeeAll }) {
  const { t } = useTranslation(["cases"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-xs", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "ai-review", className: "size-4 text-purple-primary shrink-0" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 text-default font-medium text-purple-primary", children: t("cases:case.ai_reviews.extract_title") }),
    showSeeAll ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", size: "small", onClick: onSeeAll, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "visibility", className: "size-4" }),
      t("cases:case.ai_reviews.see_all")
    ] }) : null
  ] });
}
function EmptyBody({
  canManuallyReview,
  onGenerate,
  isGenerating
}) {
  const { t } = useTranslation(["cases"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-small text-grey-secondary", children: t("cases:case.ai_reviews.empty") }),
    canManuallyReview ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", size: "small", onClick: onGenerate, disabled: isGenerating, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: isGenerating ? "spinner" : "wand", className: `size-4 ${isGenerating ? "animate-spin" : ""}` }),
      t("cases:case.ai_reviews.generate")
    ] }) : null
  ] });
}
function PendingBody() {
  const { t } = useTranslation(["cases"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-xs text-small text-grey-secondary", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "spinner", className: "size-4 animate-spin" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("cases:case.ai_reviews.generating") })
  ] });
}
function LoadingBody() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-xs text-small text-grey-secondary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "spinner", className: "size-4 animate-spin" }) });
}
function ErrorBody() {
  const { t } = useTranslation(["cases"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-small text-red-primary", children: t("cases:case.ai_reviews.error_loading") });
}
function PopulatedBody({ review }) {
  const reviewQuery = useCaseReviewQuery(review?.caseId ?? "", review?.id ?? "");
  if (reviewQuery.isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingBody, {});
  if (reviewQuery.isError) return /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorBody, {});
  let excerpt = "";
  if (reviewQuery.data) {
    if (reviewQuery.data.review?.summary) excerpt = reviewQuery.data.review.summary;
    else {
      const output = reviewQuery.data.review?.output?.trim();
      if (!output) return null;
      excerpt = stripMarkdown(output);
    }
    if (!excerpt) return null;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AIText, { text: excerpt, maxLines: 6 });
  }
  return null;
}
function stripMarkdown(text) {
  return text.replace(/^#{1,6}\s+/gm, "").replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1").replace(/`([^`]+)`/g, "$1").replace(/^>\s+/gm, "").replace(/^[-*]\s+/gm, "").replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}
function EscalateCaseButton({ caseId, inboxId, className }) {
  const { t } = useTranslation([...casesI18n, "common"]);
  const escalateCaseMutation = useEscalateCaseMutation();
  const revalidate = useLoaderRevalidator();
  const inboxesQuery = useGetInboxesQuery();
  const { currentUser } = useOrganizationDetails();
  const isAdminUser = isAdmin(currentUser);
  const inboxes = inboxesQuery.data?.inboxes ?? [];
  const inboxDetail = inboxes.find((inbox) => inbox.id === inboxId);
  const targetInbox = inboxes.find((inbox) => inbox.id === inboxDetail?.escalationInboxId);
  const canEscalate = !!inboxDetail?.escalationInboxId;
  const form = useForm({
    onSubmit: async ({ value }) => {
      escalateCaseMutation.mutateAsync(value).then(() => {
        revalidate();
      }).catch(() => {
        zt.error(t("common:errors.unknown"));
      });
    },
    defaultValues: { caseId, inboxId },
    validators: {
      onSubmit: escalateCasePayloadSchema
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Root, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(TooltipV2.Tooltip, { delayDuration: 0, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipV2.TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Trigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "secondary",
          size: "small",
          mode: "icon",
          className,
          disabled: !canEscalate,
          "aria-label": t("cases:escalate-button.label"),
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "arrow-up", className: "size-4" })
        }
      ) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TooltipV2.TooltipContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: canEscalate ? t("cases:escalate-button.hint", { inboxName: targetInbox?.name }) : isAdminUser ? t("cases:escalate-button.forbidden.hint.admin") : t("cases:escalate-button.forbidden.hint") }),
        !canEscalate && isAdminUser ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: "/settings/inboxes/$inboxId",
            params: { inboxId: fromUUIDtoSUUID(inboxId) },
            className: "hover:text-purple-hover focus:text-purple-hover text-purple-primary font-semibold hover:underline focus:underline",
            children: t("cases:case.inbox_settings_link")
          }
        ) : null
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Content, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: "Escalate Case" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-xl p-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Callout, { className: "text-balance", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trans, { i18nKey: "cases:escalate-case.modal.callout" }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("form", { onSubmit: handleSubmit(form), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Footer, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { isCloseButton: true, label: t("common:cancel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { label: t("cases:escalate-case.modal.submit-button.label"), type: "submit" })
      ] }) })
    ] })
  ] });
}
const findDataFromPivotValue = (pivots, pivotValue) => {
  return pivots.find((p) => p.pivotValue === pivotValue);
};
function CaseSnoozePanel({ onClose, caseDetail, dataModel, pivotObjects, entitlements }) {
  const { t } = useTranslation(casesI18n);
  const language = useFormatLanguage();
  const formatDateTime = useFormatDateTime();
  const rulesByPivotQuery = useRulesByPivotQuery(caseDetail.id);
  const pivotKeys = rulesByPivotQuery.data ? Object.keys(rulesByPivotQuery.data.rulesByPivot) : [];
  const [activeTab, setActiveTab] = reactExports.useState(null);
  const effectiveActiveTab = activeTab ?? pivotKeys[0] ?? null;
  if (rulesByPivotQuery.isPending) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Loading..." });
  }
  if (rulesByPivotQuery.isError) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Error" });
  }
  const rulesByPivot = rulesByPivotQuery.data.rulesByPivot;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Header, { children: "Rules" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex w-full flex-col gap-lg px-sm", children: pivotKeys.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center gap-md py-xl text-center", children: [
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
        const client = findDataFromPivotValue(pivotObjects, pivotValue);
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
    ] }) })
  ] });
}
function getClientDisplayInfo(pivotObject, client360Tables) {
  const metadata = client360Tables.find((t) => t.name === pivotObject.pivotObjectName);
  const entityName = metadata?.alias || metadata?.name || pivotObject.pivotObjectName;
  const clientName = metadata ? pivotObject.pivotObjectData.data[metadata.caption_field] : "";
  return { metadata, entityName, clientName };
}
function CaseManagerPrincipalPage({
  caseDetail,
  dataModel,
  pivotObjects,
  inboxes,
  client360Tables,
  userScoringAccess,
  entitlements
}) {
  const { t } = useTranslation(["common", "cases"]);
  const { orgTags } = useOrganizationTags();
  const { currentUser } = useOrganizationDetails();
  const caseInbox = inboxes.find((inbox) => inbox.id === caseDetail.inboxId) ?? null;
  const mainPivotObject = pivotObjects?.[0] ?? null;
  const caseDecisionsQuery = useCaseDecisionsQuery(caseDetail.id);
  const hasRuleHits = caseDecisionsQuery.data?.pages.some(
    (page) => page?.decisions?.some((d) => d.rules?.some((r) => r.outcome === "hit"))
  );
  const rootRef = reactExports.useRef(null);
  const editTagsMutation = useEditTagsMutation();
  const caseTagsIds = caseDetail.tags.map((t2) => t2.tagId);
  const tagsForm = useForm({
    onSubmit: ({ value }) => {
      editTagsMutation.mutateAsync(value);
    },
    defaultValues: {
      caseId: caseDetail.id,
      tagIds: caseTagsIds
    },
    validators: {
      onSubmit: editTagsPayloadSchema
    }
  });
  const [snoozePanelOpen, setSnoozePanelOpen] = reactExports.useState(false);
  const handleDisplaySnoozePanel = () => setSnoozePanelOpen(true);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-default font-medium", children: t("cases:case_detail.pivot_panel.informations") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "flex flex-col gap-sm text-small self-start", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CaseStatusBadgeV2, { status: caseDetail.status, outcome: caseDetail.outcome, variant: "semi-full" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(tagsForm.Field, { name: "tagIds", children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                TagList,
                {
                  editable: true,
                  placeholder: t("cases:manager.principal.add_tag_placeholder"),
                  tags: orgTags,
                  value: field.state.value,
                  onChange: (tags) => {
                    tagsForm.setFieldValue("tagIds", tags);
                    tagsForm.handleSubmit();
                  }
                }
              ) }),
              caseDetail.status !== "closed" ? /* @__PURE__ */ jsxRuntimeExports.jsx(EscalateCaseButton, { caseId: caseDetail.id, inboxId: caseDetail.inboxId, className: "ms-auto" }) : null
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CopyToClipboardButton, { toCopy: caseDetail.id, children: caseDetail.id }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                EditCaseAssignee,
                {
                  disabled: false,
                  id: caseDetail.id,
                  assigneeId: caseDetail.assignedTo,
                  currentUser
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(EditCaseInbox, { id: caseDetail.id, inboxId: caseDetail.inboxId })
            ] }) })
          ] }),
          mainPivotObject ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            ClientCard,
            {
              caseId: caseDetail.id,
              pivotObject: mainPivotObject,
              dataModel,
              client360Tables,
              userScoringAccess
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "flex flex-col items-center justify-center gap-sm text-small text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-secondary", children: isAdmin(currentUser) ? t("cases:case_detail.pivot_panel.missing_pivot.admin") : t("cases:case_detail.pivot_panel.missing_pivot") }),
            isAdmin(currentUser) ? /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/data", className: CtaV2ClassName({ variant: "primary", appearance: "stroked" }), children: t("cases:case_detail.pivot_panel.missing_pivot_cta") }) : null
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-[2fr_minmax(500px,_1fr)] gap-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-md", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(AiReviewCard, { caseId: caseDetail.id, canManuallyReview: caseInbox?.caseReviewManual ?? false }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col justify-start gap-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-default text-grey-primary flex items-center justify-between px-2xs font-medium", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("cases:alerts") }),
              hasRuleHits ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", onClick: () => handleDisplaySnoozePanel(), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "snooze", className: "size-3.5" }),
                t("cases:decisions.snooze_rules")
              ] }) : null
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CaseAlerts, { caseDecisionsQuery, dataModel })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CaseInvestigation, { root: rootRef, caseId: caseDetail.id, events: caseDetail.events }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Root, { open: snoozePanelOpen, onOpenChange: setSnoozePanelOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Container, { size: "medium", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Content, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      CaseSnoozePanel,
      {
        onClose: () => setSnoozePanelOpen(false),
        caseDetail,
        dataModel,
        pivotObjects: pivotObjects ?? [],
        entitlements
      }
    ) }) }) })
  ] });
}
function ClientCard({ caseId, pivotObject, dataModel, client360Tables, userScoringAccess }) {
  const { t } = useTranslation(["common"]);
  const { currentUser } = useOrganizationDetails();
  const currentTable = dataModel.find((t2) => t2.name === pivotObject.pivotObjectName);
  const { metadata, entityName, clientName } = getClientDisplayInfo(pivotObject, client360Tables);
  const [explorationOpen, setExplorationOpen] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "flex flex-col gap-sm text-small", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: clientName }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
        pivotObject.pivotObjectId ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          UserScoreBadge,
          {
            objectType: pivotObject.pivotObjectName,
            objectId: pivotObject.pivotObjectId,
            userScoringAccess
          }
        ) : null,
        metadata && pivotObject.isIngested ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: "/client-detail/$objectType/$objectId",
            params: clientDetailLinkParams(pivotObject.pivotObjectName, pivotObject.pivotObjectId),
            className: CtaV2ClassName({ appearance: "link", variant: "primary" }),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "eye", className: "size-4" }),
              t("common:see_all")
            ]
          }
        ) : null
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-xs items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: "grey", className: "capitalize", children: entityName }),
      pivotObject.pivotObjectId ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        ClientObjectTagList,
        {
          caseId,
          tableName: pivotObject.pivotObjectName,
          objectId: pivotObject.pivotObjectId
        }
      ) : null
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        DataFields,
        {
          options: { layout: "2-columns" },
          object: pivotObject.pivotObjectData,
          table: pivotObject.pivotObjectName
        }
      ),
      currentTable ? /* @__PURE__ */ jsxRuntimeExports.jsxs(DataModelExplorerProvider, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          PivotNavigationOptions,
          {
            currentUser,
            pivotObject,
            table: currentTable,
            dataModel,
            onExplore: () => setExplorationOpen(true),
            options: { layout: "2-columns" }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DataExplorerPanel, { dataModel, open: explorationOpen, onOpenChange: setExplorationOpen })
      ] }) : null
    ] })
  ] });
}
function RouteComponent() {
  const {
    caseDetail,
    dataModel,
    pivotObjects,
    inboxes,
    client360Tables,
    userScoringAccess,
    entitlements
  } = Route.useRouteContext();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(CaseManagerPrincipalPage, { caseDetail, dataModel, pivotObjects, inboxes, client360Tables, userScoringAccess, entitlements });
}
export {
  RouteComponent as component
};
