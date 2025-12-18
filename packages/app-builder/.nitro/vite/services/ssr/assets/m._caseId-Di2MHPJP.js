import { R as jsxRuntimeExports, r as reactExports } from "../server.js";
import { C as Callout } from "./Callout-DX4NBXlG.js";
import { d as cn, u as useTranslation, t as useFormatDateTime, B as Button, e as Icon, T as Typo, C as CtaV2ClassName, f as cva, e4 as Modal, er as TextArea, j as Tag, s as Trans } from "./format-NPGUXq-g.js";
import { M, d4 as isIndirectContinuousScreening, p as t, d5 as getHigherCategory, d6 as isDirectContinuousScreening, aX as z, d7 as isDirectContinuousScreeningMatch, d8 as isIndirectContinuousScreeningMatch, u as t$1, _ as t$2 } from "./services-middleware-DR8Hua1Y.js";
import { L as Link, Q as CaseStatusBadgeV2, P as Page, B as BreadCrumbs, au as Route } from "./router-vb7i5euz.js";
import { P as Panel, a as PanelSharpFactory } from "./Panel-kj8Z2GDk.js";
import { b as TopicTag, M as MatchDetails, c as EntityProperties, E as EntityDatasetsList } from "./FreeformMatchCard-JGOBIPO0.js";
import { C as CaseFileButton, E as EditCaseName, a as EscalateCase, b as EditCaseTags } from "./EscalateCase-DTzFZeIC.js";
import { C as CaseInvestigation } from "./CaseInvestigation-BPg2MpJz.js";
import { E as EditCaseInbox, a as EditCaseAssignee } from "./escalate-case-CwnOzYrx.js";
import { R as ReviewStatusBadge, u as useRelatedCasesByObjectQuery } from "./ReviewStatusBadge-BDobORZ6.js";
import { u as useLoaderRevalidator } from "./LoaderRevalidatorContext-C9s56i-l.js";
import { u as useCloseCaseMutation, a as useOpenCaseMutation } from "./open-case-BHErop52.js";
import { u as useOrganizationDetails } from "./organization-detail-YGkE0F4y.js";
import { z as zt } from "./CopyToClipboardButton-CJNJJful.js";
import { S as Spinner } from "./Spinner-GK6cEAdR.js";
import { b as fromUUIDtoSUUID } from "./short-uuid-MIi3jWzx.js";
import { s as sortScreeningMatchesByTopics } from "./match-sorting-Cy-ZyfsJ.js";
import { d as dismissContinuousScreeningFn, a as loadMoreContinuousScreeningMatchesFn, r as reviewContinuousScreeningMatchFn, g as getContinuousScreeningConfigurationFn } from "./continuous-screening-By89dWjI.js";
import { u as useMutation } from "./useMutation-C5oG90Zs.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
import { R as Root, T as Trigger, C as Content } from "./index-DhVP5FgH.js";
import { c as StatusRadioGroup } from "./StatusRadioGroup-BTpRIK0f.js";
import { r as reviewMatchPayloadSchema } from "./continuous-screenings-DX2ib6rI.js";
import { s as submitOnCtrlEnter, h as handleSubmit } from "./form-D2XmDKeG.js";
import { u as useForm, a as useStore } from "./useForm-BwABQKAs.js";
import { u as useObjectDetailsQuery, e as DataFields, p as parseUnknownData } from "./DataField-vckdVtrg.js";
import { u as useDataModelQuery } from "./get-data-model-CAY4ZWaH.js";
import { F as FormatData } from "./FormatData-TXRe9nHU.js";
import { u as useQuery } from "./useQuery-B7mL_evE.js";
import { H as HoverCard, a as HoverCardTrigger, b as HoverCardPortal, c as HoverCardContent } from "./index-CtZTigeT.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
import "./sharpstate.es-CeF1Mf5b.js";
import "./isNullish-B8pc8Ntu.js";
import "./use-callback-ref-DXzIzfqy.js";
import "node:crypto";
import "./QueryClientProvider-DYTpkCko.js";
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
import "./unique-CBeBxAXx.js";
import "./scenarios-8U74nJp4.js";
import "./screenings-CS8peAlI.js";
import "./dataset-utils-C1Lb7jdi.js";
import "./screening-entity-DVQtf50p.js";
import "./ExternalLink-CG_77QdX.js";
import "./lists-config-CsQWGvXL.js";
import "./DownloadFilesService-BW-xJtj3.js";
import "./download-file-C533i5xX.js";
import "./FormErrorOrDescription-DO6Hdfmn.js";
import "./cases-PZYcTUxr.js";
import "./cases-DJ9ABIdo.js";
import "./TagPreview-CjmrrQF6.js";
import "./organization-tags-CEJpwTHZ.js";
import "./create-context-CYc8deix.js";
import "./array-BFSjnO9c.js";
import "./isDeepEqual-C0XXZLYo.js";
import "./get-inboxes-6fSfvled.js";
import "./useFormDropzone-BjTKexsf.js";
import "./add-comment-BaESvh7R.js";
import "./Time-IafhAG3W.js";
import "./organization-users-Bxl0ZW8k.js";
import "./user-C_y5ayGi.js";
import "./join-BeQTfqAC.js";
import "./Markdown-sjqeOXzy.js";
import "./Code-C6D_KXb1.js";
import "./Avatar-DpA4jY60.js";
import "./OutcomeTag-BH_m80fa.js";
import "./IngestedObjectDetailModal-BFFwOF2a.js";
import "./organization-object-tags-C9Gf0Ixc.js";
import "./endOfDay-DlzjvxTr.js";
import "./allPass-LKKfzhYC.js";
import "./curry-D3P8tFW_.js";
import "./index-C_WgunUr.js";
import "./index-CR1bHmei.js";
import "./data-BFm2FCTm.js";
import "./data-fdG1PpsD.js";
import "./isNonNullish-DgEqPJBU.js";
import "./data-model-B-Bz1o1P.js";
import "./dataTypeSchema-DvqJgdgd.js";
import "./mapToObj-wQ-uHOuD.js";
import "./omit-ZO4dmkWK.js";
import "./maplibre-gl-Dbgqr2_Q.js";
import "./useBaseQuery-CMboOtTR.js";
import "./index-BF4TC3go.js";
const DataListGrid = ({ className, children }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("grid grid-cols-[116px_1fr] gap-x-3 gap-y-2", className), children });
};
const SquareTag = ({ children, className }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "span",
    {
      className: cn(
        "text-small border border-grey-border rounded-sm h-6 px-xs text-grey-primary inline-flex items-center bg-surface-card",
        className
      ),
      children
    }
  );
};
const CaseDocuments = ({ files }) => {
  const { t: t2 } = useTranslation(["common"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col justify-start gap-xs", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between px-2xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-00 text-h2 font-medium", children: t2("common:documents") }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-grey-90 bg-grey-100 flex flex-wrap gap-sm rounded-lg border p-md", children: files.map((file) => /* @__PURE__ */ jsxRuntimeExports.jsx(CaseFileButton, { file }, file.id)) })
  ] });
};
const CaseDetailInfo = ({ caseDetail, caseInbox, isUserAdmin }) => {
  const { t: t2 } = useTranslation(["cases", "common"]);
  const formatDateTime = useFormatDateTime();
  const { currentUser } = useOrganizationDetails();
  const revalidate = useLoaderRevalidator();
  const closeCaseMutation = useCloseCaseMutation();
  const reopenCaseMutation = useOpenCaseMutation();
  const screening = caseDetail.continuousScreenings[0];
  const hasRemainingMatchesToExamine = screening?.matches.some((match2) => match2.status === "pending");
  const handleCloseCase = () => {
    closeCaseMutation.mutateAsync({ caseId: caseDetail.id, comment: "" }).then(() => revalidate()).catch(() => zt.error(t2("common:errors.unknown")));
  };
  const handleReopenCase = () => {
    reopenCaseMutation.mutateAsync({ caseId: caseDetail.id, comment: "" }).then(() => revalidate()).catch(() => zt.error(t2("common:errors.unknown")));
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[1fr_auto] gap-lg items-start", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-xs items-center", children: [
          screening ? /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewStatusBadge, { status: screening.status, hitsCount: screening.matches.length }) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsx(EditCaseName, { name: caseDetail.name, id: caseDetail.id })
        ] }),
        screening ? /* @__PURE__ */ jsxRuntimeExports.jsx(ScreeningCaseSubtitle, { screening }) : null
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(EscalateCase, { id: caseDetail.id, inboxId: caseInbox.id, isAdminUser: isUserAdmin }),
        caseDetail.status !== "closed" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "primary",
            className: "flex-1 first-letter:capitalize",
            disabled: hasRemainingMatchesToExamine,
            onClick: handleCloseCase,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "save", className: "size-3.5" }),
              t2("cases:case.close")
            ]
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "primary", className: "flex-1 first-letter:capitalize", onClick: handleReopenCase, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "save", className: "size-3.5" }),
          t2("cases:case.reopen")
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-small grid grid-cols-[repeat(2,_minmax(auto,_calc(var(--spacing)_*_35))_1fr)] gap-sm p-md rounded-lg border border-grey-border bg-surface-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-subgrid col-span-full h-8 items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-grey-secondary", children: t2("cases:case.date") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: formatDateTime(caseDetail.createdAt, { dateStyle: "short" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-grey-secondary", children: t2("cases:case.tags") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(EditCaseTags, { id: caseDetail.id, tagIds: caseDetail.tags.map(({ tagId }) => tagId) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-subgrid col-span-full h-8 items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-grey-secondary", children: t2("cases:case.inbox") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(EditCaseInbox, { id: caseDetail.id, inboxId: caseDetail.inboxId }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-grey-secondary", children: t2("cases:assigned_to") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          EditCaseAssignee,
          {
            currentUser,
            assigneeId: caseDetail.assignedTo,
            id: caseDetail.id,
            disabled: false
          }
        ) })
      ] })
    ] })
  ] });
};
function ScreeningCaseSubtitle({ screening }) {
  const { t: t$12 } = useTranslation(["continuousScreening", "screeningTopics"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Typo, { variant: "title2", className: "text-grey-secondary", children: M(screening).when(isIndirectContinuousScreening, (indirectScreening) => {
    const queries = t(indirectScreening.request.searchInput.queries).map(([key, value]) => value);
    if (!queries[0]) return null;
    const queryTopics = queries[0].properties["topics"];
    if (!queryTopics) return null;
    const category = getHigherCategory(queryTopics);
    if (!category) return null;
    return t$12(`continuousScreening:review.indirect_subtitle`, {
      category: t$12(`screeningTopics:screening_case.category.${category}`)
    });
  }).when(isDirectContinuousScreening, (directScreening) => {
    let entityName = "";
    const queries = t(directScreening.request.searchInput.queries).map(([key, value]) => value);
    if (queries[0]) {
      entityName = queries[0].properties["name"]?.[0] ?? "";
    }
    return t$12(`continuousScreening:review.direct_subtitle.${screening.triggerType}`, {
      entityType: directScreening.objectType,
      name: entityName
    });
  }).exhaustive() });
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
function ObjectRelatedCases({
  currentCase,
  objectType,
  objectId,
  className
}) {
  const { t: t2 } = useTranslation(["common", "cases"]);
  const casesQuery = useRelatedCasesByObjectQuery(objectType, objectId);
  const formatDateTime = useFormatDateTime();
  return M(casesQuery).with({ isError: true }, () => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-red-disabled bg-red-background text-red-primary mt-md rounded-sm border p-sm", children: t2("common:global_error") });
  }).with({ isPending: true }, () => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, { className: "size-6" });
  }).otherwise((query) => {
    const cases = query.data?.cases.filter((caseObj) => caseObj.id !== currentCase.id) ?? [];
    if (cases.length === 0) {
      return null;
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("p-md rounded-md", className), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: t2("cases:case_detail.pivot_panel.case_history") }),
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
              children: t2("common:open")
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cellVariants({ isLast, className: "flex items-center border-l" }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(CaseStatusBadgeV2, { status: caseObj.status, variant: "icon-only", outcome: caseObj.outcome }) })
        ] }, caseObj.id);
      }) })
    ] }) });
  });
}
const useDismissContinuousScreeningMutation = () => {
  const dismissContinuousScreening = useServerFn(dismissContinuousScreeningFn);
  return useMutation({
    mutationFn: async (screeningId) => {
      await dismissContinuousScreening({ data: { screeningId } });
    }
  });
};
const useLoadMoreContinuousScreeningMatchesMutation = (screeningId) => {
  const loadMoreContinuousScreeningMatches = useServerFn(loadMoreContinuousScreeningMatchesFn);
  return useMutation({
    mutationFn: async () => {
      await loadMoreContinuousScreeningMatches({ data: { screeningId } });
    }
  });
};
const useReviewContinuousScreeningMatchMutation = () => {
  const reviewContinuousScreeningMatch = useServerFn(reviewContinuousScreeningMatchFn);
  return useMutation({
    mutationFn: async (payload) => {
      await reviewContinuousScreeningMatch({ data: payload });
    }
  });
};
const ReviewScreeningMatch = ({
  screeningMatch,
  children,
  automaticallyConfirmScreening = false
}) => {
  const { t: t2 } = useTranslation(["common", "screenings"]);
  const [open, setOpen] = reactExports.useState(false);
  const reviewScreeningMatchMutation = useReviewContinuousScreeningMatchMutation();
  const revalidate = useLoaderRevalidator();
  const form = useForm({
    defaultValues: {
      matchId: screeningMatch.id,
      status: "confirmed_hit",
      comment: ""
    },
    onSubmit: async ({ value }) => {
      reviewScreeningMatchMutation.mutateAsync(value).then(() => {
        setOpen(false);
        revalidate();
      }).catch(() => {
        zt.error(t2("common:errors.unknown"));
      });
    },
    validators: {
      onSubmit: reviewMatchPayloadSchema
    }
  });
  const currentStatus = useStore(form.store, (state) => state.values.status);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Root, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Trigger, { asChild: true, children }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Content, { size: "small", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: t2("screenings:review_modal.title") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit(form), id: "review-screening-match", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xl p-xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { name: "matchId", type: "hidden", value: screeningMatch.id }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "status", children: (field) => {
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-m", children: t2("screenings:review_modal.status_label") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(StatusRadioGroup, { value: field.state.value, onChange: field.handleChange }),
              currentStatus === "confirmed_hit" && automaticallyConfirmScreening ? /* @__PURE__ */ jsxRuntimeExports.jsx(Callout, { children: t2("screenings:review_modal.callout_confirmed_hit") }) : null
            ] });
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "comment", children: (field) => {
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-m", children: t2("screenings:review_modal.comment_label") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextArea,
                {
                  name: field.name,
                  value: field.state.value,
                  onChange: (e) => field.handleChange(e.target.value),
                  onKeyDown: submitOnCtrlEnter
                }
              )
            ] });
          } })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Footer, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { isCloseButton: true, label: t2("common:cancel") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { label: t2("common:save"), disabled: !currentStatus, type: "submit" })
        ] })
      ] })
    ] })
  ] });
};
const ScreeningObjectDetails = ({ objectType, objectId, className }) => {
  const { t: t2 } = useTranslation(["common", "continuousScreening"]);
  const dataModelQuery = useDataModelQuery();
  const objectDetailsQuery = useObjectDetailsQuery(objectType, objectId);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("p-md rounded-lg flex flex-col gap-sm", className), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: t2("continuousScreening:review.object_details_subtitle") }),
    M([dataModelQuery, objectDetailsQuery]).with([{ isPending: true }, z.any], () => {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, { className: "size-6" });
    }).with([z.any, { isPending: true }], () => {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, { className: "size-6" });
    }).with([{ isError: true }, z.any], () => {
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: t2("common:generic_fetch_data_error") });
    }).with([z.any, { isError: true }], () => {
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: t2("common:generic_fetch_data_error") });
    }).with([{ isSuccess: true }, { isSuccess: true }], ([dmQuery, objQuery]) => {
      const tableModel = dmQuery.data.dataModel.find((t22) => t22.name === objectType);
      if (!tableModel) return null;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(DataFields, { table: tableModel.name, object: { data: objQuery.data.data } });
    }).exhaustive()
  ] });
};
const ScreeningCaseMatches = ({
  screening,
  caseDetail,
  isUserAdmin
}) => {
  const { t: t2 } = useTranslation(["continuousScreening", "screenings", "common"]);
  const loadMoreMatchesMutation = useLoadMoreContinuousScreeningMatchesMutation(screening.id);
  const revalidate = useLoaderRevalidator();
  const handleLoadMore = () => {
    loadMoreMatchesMutation.mutateAsync().then(() => {
      revalidate();
    }).catch(() => {
      zt.error(t2("common:errors.unknown"));
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-h2 font-semibold", children: t2("continuousScreening:review.matches.title") }),
      isUserAdmin ? /* @__PURE__ */ jsxRuntimeExports.jsx(DismissAlertButton, { screening }) : null
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[1fr_calc(var(--spacing)_*_52)] border border-grey-border rounded-md bg-surface-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-subgrid col-span-full border-b border-grey-border text-tiny text-grey-secondary", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-sm", children: t2("continuousScreening:review.matches.match_label") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-sm", children: t2("continuousScreening:review.matches.status_label") })
      ] }),
      [...screening.matches].sort(sortScreeningMatchesByTopics).map((screeningMatch) => {
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "grid grid-cols-subgrid col-span-full not-last:border-b not-last:border-grey-border",
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-subgrid col-span-full", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Root,
                {
                  defaultOpen: screening.matches.length === 1,
                  className: "border-r border-grey-border p-md flex flex-col gap-md overflow-hidden group/collapsible",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Trigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Icon,
                        {
                          icon: "caret-down",
                          className: "size-4 group-radix-state-open/collapsible:rotate-180 transition-transform duration-200"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: screeningMatch.payload.caption }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-small text-grey-secondary", children: getMatchEntityType(screeningMatch) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: "grey", className: "shrink-0", children: t2("screenings:match.score", { score: screeningMatch.payload.score * 100 }) }),
                      screeningMatch.payload.properties["topics"]?.map((topic) => {
                        return /* @__PURE__ */ jsxRuntimeExports.jsx(TopicTag, { topic, className: "text-small" }, topic);
                      })
                    ] }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Content, { className: "radix-state-open:animate-slide-down radix-state-closed:animate-slide-up", children: M(screeningMatch).when(isDirectContinuousScreeningMatch, (directMatch) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-sm bg-grey-background-light rounded-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      MatchDetails,
                      {
                        entity: directMatch.payload,
                        before: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold capitalize", children: t2("screenings:dataset", { count: directMatch.payload.datasets.length }) }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-row flex-wrap", children: directMatch.payload.datasets.map((dataset, index) => {
                            return /* @__PURE__ */ jsxRuntimeExports.jsxs(reactExports.Fragment, { children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: dataset }),
                              index < directMatch.payload.datasets.length - 1 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mx-xs", children: "·" }) : null
                            ] }, dataset);
                          }) })
                        ] })
                      }
                    ) })).when(isIndirectContinuousScreeningMatch, (indirectMatch) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-md", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        ScreeningObjectDetails,
                        {
                          objectType: indirectMatch.objectType,
                          objectId: indirectMatch.objectId,
                          className: "bg-grey-background-light rounded-md"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        ObjectRelatedCases,
                        {
                          objectType: indirectMatch.objectType,
                          objectId: indirectMatch.objectId,
                          currentCase: caseDetail,
                          className: "bg-grey-background-light"
                        }
                      )
                    ] })).exhaustive() })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-sm", children: M(screeningMatch.status).with("confirmed_hit", () => /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: "red", children: t2("screenings:match.status.confirmed_hit") })).with("no_hit", () => /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: "green", children: t2("screenings:match.status.no_hit") })).with("pending", () => /* @__PURE__ */ jsxRuntimeExports.jsx(
                ReviewScreeningMatch,
                {
                  screeningMatch,
                  automaticallyConfirmScreening: isDirectContinuousScreening(screening),
                  children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "px-sm py-xs cursor-pointer bg-orange-primary text-white dark:bg-transparent dark:border dark:border-orange-primary dark:text-orange-primary rounded-md inline-flex items-center", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t2("screenings:match.status.pending") }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "caret-down", className: "size-4" })
                  ] })
                }
              )).with("skipped", () => /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: "grey", children: t2("screenings:match.status.skipped") })).exhaustive() })
            ] })
          },
          screeningMatch.id
        );
      }),
      screening.partial ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-subgrid col-span-full p-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "primary", onClick: () => handleLoadMore(), disabled: loadMoreMatchesMutation.isPending, children: [
        loadMoreMatchesMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "spinner", className: "size-4 animate-spin" }) : null,
        t2("continuousScreening:review.matches.partial_search_button")
      ] }) }) : null
    ] })
  ] });
};
const getMatchEntityType = (screeningMatch) => {
  if (isIndirectContinuousScreeningMatch(screeningMatch)) {
    return screeningMatch.objectType;
  }
  return screeningMatch.payload.schema;
};
const DismissAlertButton = ({ screening }) => {
  const { t: t2 } = useTranslation(["common", "continuousScreening"]);
  const dismissMutation = useDismissContinuousScreeningMutation();
  const revalidate = useLoaderRevalidator();
  const [open, setOpen] = reactExports.useState(false);
  const dismissAlert = () => {
    dismissMutation.mutateAsync(screening.id).then(() => {
      zt.success(t2("continuousScreening:success.dismissed"));
      revalidate();
      setOpen(false);
    }).catch(() => {
      zt.error(t2("common:errors.unknown"));
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Root, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Trigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", size: "small", disabled: screening.status !== "in_review", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "snooze-stroke", className: "size-4" }),
      t2("continuousScreening:review.dismiss_alert")
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Content, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: t2("continuousScreening:review.dismiss_alert") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-lg p-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: t2("continuousScreening:review.dismiss_alert_modal.warning_text") }),
        screening.partial ? /* @__PURE__ */ jsxRuntimeExports.jsx(Callout, { color: "red", children: t2("continuousScreening:review.dismiss_alert_modal.partial_search_warning") }) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: t2("continuousScreening:review.dismiss_alert_modal.confirmation_text") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Footer, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { isCloseButton: true, label: t2("common:cancel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Modal.FooterButton,
          {
            label: t2("continuousScreening:review.dismiss_alert_modal.confirm_button"),
            onClick: dismissAlert
          }
        )
      ] })
    ] })
  ] });
};
const useContinuousScreeningConfigurationQuery = (stableId) => {
  const getContinuousScreeningConfiguration = useServerFn(getContinuousScreeningConfigurationFn);
  return useQuery({
    queryKey: ["continuous-screening", "configuration", stableId],
    queryFn: async () => {
      const result = await getContinuousScreeningConfiguration({ data: { stableId } });
      return result.config;
    }
  });
};
const ScreeningRequestDetail = ({ configStableId, request }) => {
  const { t: t$3 } = useTranslation(["common", "continuousScreening", "screenings"]);
  const configQuery = useContinuousScreeningConfigurationQuery(configStableId);
  const queries = t(request.searchInput.queries).map(([key, value]) => value);
  if (!queries[0]) return null;
  const queryEntries = t$1(
    queries[0].properties,
    t$2((property) => parseUnknownData(property[0])),
    t()
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-lg p-md bg-surface-card rounded-lg border border-grey-border", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: t$3("continuousScreening:review.request_detail_subtitle") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DataListGrid, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-grey-placeholder truncate leading-6", children: t$3("continuousScreening:review.entity_type_label") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SquareTag, { className: "", children: queries[0]?.schema }) }),
        queryEntries.map(([key, value]) => /* @__PURE__ */ jsxRuntimeExports.jsxs(reactExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-grey-secondary truncate", children: t$3(`screenings:entity.property.${key}`) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FormatData, { data: value, className: "truncate" })
        ] }, key))
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: t$3("continuousScreening:review.search_parameters_subtitle") }),
      M(configQuery).with({ isPending: true }, () => {
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, { className: "size-6" });
      }).with({ isError: true }, () => {
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: t$3("common:generic_fetch_data_error") });
      }).with({ isSuccess: true }, (query) => {
        if (!query.data) return null;
        const displayedDatasets = query.data.datasets.slice(0, 3);
        const restCount = query.data.datasets.length - displayedDatasets.length;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(DataListGrid, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-grey-secondary truncate leading-6 capitalize", children: t$3("screenings:dataset", { count: query.data.datasets.length }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "truncate flex flex-row flex-wrap gap-sm", children: [
            displayedDatasets.map((dataset) => /* @__PURE__ */ jsxRuntimeExports.jsx(SquareTag, { children: dataset }, dataset)),
            restCount > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(HoverCard, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(HoverCardTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(SquareTag, { children: [
                "+",
                restCount
              ] }) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(HoverCardPortal, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(HoverCardContent, { side: "left", sideOffset: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-surface-card p-md flex flex-wrap gap-sm max-w-200 border border-grey-border rounded-sm", children: query.data.datasets.slice(3).map((dataset) => /* @__PURE__ */ jsxRuntimeExports.jsx(SquareTag, { children: dataset }, dataset)) }) }) })
            ] }) : null
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-grey-secondary truncate leading-6", children: t$3("screenings:match_threshold") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SquareTag, { children: query.data.matchThreshold }) })
        ] });
      }).exhaustive()
    ] })
  ] });
};
const ScreeningCaseDetailPage = ({
  caseDetail,
  caseInbox,
  screening,
  isUserAdmin
}) => {
  const { t: t2 } = useTranslation(["continuousScreening"]);
  const containerRef = reactExports.useRef(null);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Page.Main, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Page.Header, { className: "justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BreadCrumbs, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Page.Container, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Page.Content, { padding: "none", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[1fr_calc(var(--spacing)_*_130)] h-full relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-lg p-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CaseDetailInfo, { caseDetail, caseInbox, isUserAdmin }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ScreeningCaseMatches, { screening, isUserAdmin, caseDetail }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CaseInvestigation, { caseId: caseDetail.id, events: caseDetail.events, root: containerRef }),
        caseDetail.files.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(CaseDocuments, { files: caseDetail.files }) : null
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-surface-card border-l border-grey-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-lg flex flex-col gap-md top-0 sticky", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typo, { variant: "title2", children: t2("continuousScreening:review.information_title") }),
          isDirectContinuousScreening(screening) ? /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { children: t2(`continuousScreening:review.search_tag.${screening.triggerType}`) }) : null
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Callout, { color: "orange", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Trans,
          {
            i18nKey: `continuousScreening:review.callout.${screening.triggerType}`,
            components: {
              EntityType: /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: "grey", children: getEntityType(screening) })
            }
          }
        ) }) }),
        M(screening).when(isDirectContinuousScreening, (directScreening) => {
          return /* @__PURE__ */ jsxRuntimeExports.jsx(DirectScreeningRequestDetail, { screening: directScreening, caseDetail });
        }).when(isIndirectContinuousScreening, (indirectScreening) => {
          return /* @__PURE__ */ jsxRuntimeExports.jsx(IndirectScreeningRequestDetail, { screening: indirectScreening });
        }).exhaustive()
      ] }) })
    ] }) }) })
  ] });
};
const getEntityType = (screening) => {
  if (isDirectContinuousScreening(screening)) {
    return screening.objectType;
  }
  return screening.opensanctionEntityPayload.schema;
};
const DirectScreeningRequestDetail = ({
  screening,
  caseDetail
}) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ScreeningRequestDetail,
      {
        configStableId: screening.continuousScreeningConfigStableId,
        request: screening.request
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ScreeningObjectDetails,
      {
        objectType: screening.objectType,
        objectId: screening.objectId,
        className: "bg-surface-card border border-grey-border"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ObjectRelatedCases,
      {
        objectType: screening.objectType,
        objectId: screening.objectId,
        currentCase: caseDetail,
        className: "bg-surface-card border border-grey-border"
      }
    )
  ] });
};
const IndirectScreeningRequestDetail = ({ screening }) => {
  const { t: t2 } = useTranslation(["continuousScreening", "screenings"]);
  const [open, setOpen] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ScreeningRequestDetail,
      {
        configStableId: screening.continuousScreeningConfigStableId,
        request: screening.request
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm p-md bg-surface-card rounded-lg border border-grey-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: screening.opensanctionEntityPayload.caption }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-small text-grey-placeholder me-auto", children: screening.opensanctionEntityPayload.schema }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", onClick: () => setOpen(true), children: t2("continuousScreening:review.entity_details.view_all") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap items-center gap-sm", children: screening.opensanctionEntityPayload.properties["topics"]?.map((topic) => {
        return /* @__PURE__ */ jsxRuntimeExports.jsx(TopicTag, { topic, className: "text-small" }, topic);
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DataListGrid, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-grey-placeholder truncate leading-6", children: t2("screenings:dataset", { count: screening.opensanctionEntityPayload.datasets.length }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate flex flex-row flex-wrap gap-sm", children: screening.opensanctionEntityPayload.datasets.map((dataset) => {
          return /* @__PURE__ */ jsxRuntimeExports.jsx(SquareTag, { children: dataset }, dataset);
        }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Root, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScreeningEntityDetailsPanel, { entity: screening.opensanctionEntityPayload }) })
  ] });
};
const ScreeningEntityDetailsPanel = ({ entity }) => {
  const panelSharp = PanelSharpFactory.useSharp();
  const { t: t2 } = useTranslation(["continuousScreening", "screenings"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Container, { size: "medium", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel.Content, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel.Header, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", mode: "icon", onClick: panelSharp.actions.close, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "left-panel-close", className: "size-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-h1", children: t2("continuousScreening:review.entity_details.title") })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: entity.caption }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-small text-grey-placeholder", children: entity.schema })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-sm", children: entity.properties["topics"]?.map((topic) => {
        return /* @__PURE__ */ jsxRuntimeExports.jsx(TopicTag, { topic, className: "text-small" }, topic);
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        EntityProperties,
        {
          entity,
          before: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold", children: t2("screenings:dataset", { count: entity.datasets.length }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              EntityDatasetsList,
              {
                datasets: entity.datasets,
                useCase: "transaction_monitoring",
                listClassName: "list-disc list-inside"
              }
            ) })
          ] })
        }
      )
    ] })
  ] }) });
};
function ScreeningCaseDetail() {
  const {
    caseDetail,
    caseInbox,
    screening,
    isUserAdmin
  } = Route.useLoaderData();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ScreeningCaseDetailPage, { caseDetail, caseInbox, screening, isUserAdmin });
}
export {
  ScreeningCaseDetail as component
};
