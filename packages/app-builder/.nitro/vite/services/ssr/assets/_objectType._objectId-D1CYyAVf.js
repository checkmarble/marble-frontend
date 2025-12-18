import { R as jsxRuntimeExports, r as reactExports } from "../server.js";
import { Q as CaseStatusBadgeV2, L as Link, q as clientDetailLinkParams, P as Page, ak as BackButton, al as Route } from "./router-vb7i5euz.js";
import { P as Panel } from "./Panel-kj8Z2GDk.js";
import { M, aV as SCREENING_CATEGORIES, bj as SCREENING_CATEGORY_COLORS, a1 as isAnalyst } from "./services-middleware-DR8Hua1Y.js";
import { R as ReviewStatusBadge, u as useRelatedCasesByObjectQuery } from "./ReviewStatusBadge-BDobORZ6.js";
import { u as useGetAnnotationsQuery } from "./get-annotations-CiR2trFM.js";
import { u as useDataModelQuery } from "./get-data-model-CAY4ZWaH.js";
import { j as getObjectCasesFn, k as getHierarchyFn } from "./data-BFm2FCTm.js";
import { u as useQuery } from "./useQuery-B7mL_evE.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
import { A as isAccessible } from "./feature-access-B8PIS8ad.js";
import { u as useOrganizationDetails } from "./organization-detail-YGkE0F4y.js";
import { y as useQueryClient } from "./QueryClientProvider-DYTpkCko.js";
import { u as useTranslation, t as useFormatDateTime, B as Button, C as CtaV2ClassName, e as Icon, d as cn, e4 as Modal, j as Tag, ee as ExpandableGroupTagLine, e8 as MenuCommand, T as Typo, s as Trans, e9 as Popover } from "./format-NPGUXq-g.js";
import { D as DataModelExplorerContext, C as ClientTagsList, a as ClientTagsEditSelect, b as DataModelExplorerProvider, c as ClientDocumentsPopover } from "./DataModelExplorer-gjwcxdcr.js";
import { D as DataExplorerPanel, S as ScoreDetailPanel } from "./ScoreDetailPanel-BpXEd2Rh.js";
import { e as DataFields } from "./DataField-vckdVtrg.js";
import { S as Spinner } from "./Spinner-GK6cEAdR.js";
import { b as fromUUIDtoSUUID } from "./short-uuid-MIi3jWzx.js";
import { u as useOrganizationUsers } from "./organization-users-Bxl0ZW8k.js";
import { M as Markdown } from "./Markdown-sjqeOXzy.js";
import { A as Avatar } from "./Avatar-DpA4jY60.js";
import { C as ClientCommentForm, u as useCreateAnnotationMutation } from "./ClientCommentForm-D-0vcWN7.js";
import { E as EventTime } from "./Time-IafhAG3W.js";
import { d as debounce } from "./curry-D3P8tFW_.js";
import { D as DocumentsList } from "./DocumentsList-Dy4UzBqm.js";
import { f as getCaseDetailFn } from "./cases-DJ9ABIdo.js";
import { u as useLoaderRevalidator } from "./LoaderRevalidatorContext-C9s56i-l.js";
import { r as riskAnnotationFormSchema } from "./annotations-DpAN3M8g.js";
import { h as handleSubmit } from "./form-D2XmDKeG.js";
import { u as useForm } from "./useForm-BwABQKAs.js";
import { z as zt } from "./CopyToClipboardButton-CJNJJful.js";
import { t } from "./isDeepEqual-C0XXZLYo.js";
import { t as toggle } from "./array-BFSjnO9c.js";
import { S as SCORING_LEVELS_COLORS, a as SCORING_LEVELS_LABEL_KEYS } from "./display-TKj7AN5a.js";
import { D as DataModelContextProvider } from "./data-model-B-Bz1o1P.js";
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
import "./unique-CBeBxAXx.js";
import "./scenarios-8U74nJp4.js";
import "./sharpstate.es-CeF1Mf5b.js";
import "node:crypto";
import "./data-fdG1PpsD.js";
import "./useBaseQuery-CMboOtTR.js";
import "./create-context-CYc8deix.js";
import "./isNullish-B8pc8Ntu.js";
import "./use-callback-ref-DXzIzfqy.js";
import "./useInfiniteQuery-D2tvMYRf.js";
import "./FormatData-TXRe9nHU.js";
import "./maplibre-gl-Dbgqr2_Q.js";
import "./ExternalLink-CG_77QdX.js";
import "./DownloadFilesService-BW-xJtj3.js";
import "./download-file-C533i5xX.js";
import "./useMutation-C5oG90Zs.js";
import "./useFormDropzone-BjTKexsf.js";
import "./TagPreview-CjmrrQF6.js";
import "./organization-object-tags-C9Gf0Ixc.js";
import "./scoring-NycAI253.js";
import "./user-scoring-BwKPLq1i.js";
import "./isNonNullish-DgEqPJBU.js";
import "./dataTypeSchema-DvqJgdgd.js";
import "./mapToObj-wQ-uHOuD.js";
import "./omit-ZO4dmkWK.js";
import "./Code-C6D_KXb1.js";
import "./user-C_y5ayGi.js";
import "./join-BeQTfqAC.js";
import "./constructNow-sBxu05z3.js";
import "./endOfDay-DlzjvxTr.js";
import "./cases-PZYcTUxr.js";
const useGetObjectCasesQuery = (objectType, objectId) => {
  const getObjectCases = useServerFn(getObjectCasesFn);
  return useQuery({
    queryKey: ["data", objectType, objectId, "cases"],
    queryFn: async () => {
      return getObjectCases({ data: { objectType, objectId } });
    }
  });
};
const MAX_ROWS$1 = 3;
const AlertHitsList = ({ alertHitsQuery, showAll = false }) => {
  const { t: t2 } = useTranslation(["common"]);
  const formatDateTime = useFormatDateTime();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: M(alertHitsQuery).with({ isError: true }, () => {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm items-center justify-center h-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-secondary text-center", children: t2("common:generic_fetch_data_error") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", onClick: () => alertHitsQuery.refetch(), children: t2("common:retry") })
    ] });
  }).with({ isPending: true }, () => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: t2("common:loading") });
  }).with({ isSuccess: true }, ({ data: { cases } }) => {
    if (cases.length === 0) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-sm text-small", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-secondary", children: t2("common:no_data_to_display") }) });
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-md", children: (showAll ? cases : cases.slice(0, MAX_ROWS$1)).map((caseItem) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[auto_1fr_auto] gap-sm items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-secondary pe-md", children: formatDateTime(caseItem.createdAt) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm truncate", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: caseItem.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CaseStatusBadgeV2, { status: caseItem.status, outcome: caseItem.outcome, variant: "semi-full" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: "/cases/$caseId",
          params: { caseId: fromUUIDtoSUUID(caseItem.id) },
          className: CtaV2ClassName({ variant: "primary", appearance: "stroked" }),
          children: t2("common:open")
        }
      ) })
    ] }, caseItem.id)) });
  }).exhaustive() });
};
const MAX_EVENTS_BEFORE_DEBOUNCE = 60;
const EVENT_DELAY = 100;
const ClientComments = ({ objectType, objectId, annotationsQuery, root }) => {
  const { t: t2 } = useTranslation(["common"]);
  const queryClient = useQueryClient();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-grey-border bg-surface-card flex flex-col rounded-lg border overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-md", children: M(annotationsQuery).with({ isPending: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-20 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, { className: "size-6" }) })).with({ isError: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-20 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-center", children: t2("common:generic_fetch_data_error") }) })).with({ isSuccess: true }, ({ data }) => /* @__PURE__ */ jsxRuntimeExports.jsx(Comments, { comments: data.annotations.comments, root })).exhaustive() }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-grey-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      ClientCommentForm,
      {
        tableName: objectType,
        objectId,
        onAnnotateSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["annotations", objectType, objectId] });
        },
        className: "rounded-t-none"
      }
    ) })
  ] });
};
const Comments = ({ comments: _comments, root }) => {
  const comments = reactExports.useMemo(() => _comments.toReversed(), [_comments]);
  const { t: t2 } = useTranslation(["common"]);
  const containerRef = reactExports.useRef(null);
  const [showAll, setShowAll] = reactExports.useState(false);
  const [olderCommentCount, setOlderCommentCount] = reactExports.useState(0);
  const [newerCommentCount, setNewerCommentCount] = reactExports.useState(0);
  const { getOrgUserById } = useOrganizationUsers();
  reactExports.useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const items = Array.from(container.children);
    let callback = () => {
      let itemsBeforeVisible = 0;
      let itemsAfterVisible = 0;
      for (const item of items) {
        const itemRect = item.getBoundingClientRect();
        if (itemRect.bottom + (root.current?.scrollTop ?? 0) < containerRect.top) {
          itemsBeforeVisible++;
        } else if (itemRect.top + (root.current?.scrollTop ?? 0) > containerRect.bottom) {
          itemsAfterVisible++;
        }
      }
      setNewerCommentCount(itemsBeforeVisible);
      setOlderCommentCount(itemsAfterVisible);
    };
    if (comments.length > MAX_EVENTS_BEFORE_DEBOUNCE) {
      callback = debounce({ delay: EVENT_DELAY }, callback);
    }
    callback();
    container.addEventListener("scroll", callback);
    return () => container.removeEventListener("scroll", callback);
  }, [comments]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-0 flex w-full flex-col gap-md", children: [
    comments.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-0 top-0 flex h-full w-6 flex-col items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-grey-border -z-10 h-full w-px" }) }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface-card sticky left-0 top-0 z-[-15] flex w-full items-center justify-between ps-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-secondary text-small", children: t2("cases:investigation.more_recent", { number: newerCommentCount }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", onClick: () => setShowAll(!showAll), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: showAll ? "eye-slash" : "eye", className: "size-3.5" }),
        showAll ? t2("common:collapse") : t2("common:expand")
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        ref: containerRef,
        className: cn("flex flex-col gap-md overflow-x-hidden", {
          "max-h-[400px] overflow-y-scroll": !showAll
        }),
        children: comments.map((comment) => {
          const user = getOrgUserById(comment.annotated_by);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { firstName: user?.firstName, lastName: user?.lastName, size: "xxs", color: "grey" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-primary whitespace-pre-wrap text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Markdown, { children: comment.payload.text }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(EventTime, { time: comment.created_at })
          ] }, comment.id);
        })
      }
    ),
    showAll ? null : /* @__PURE__ */ jsxRuntimeExports.jsx(
      "span",
      {
        className: cn("bg-surface-card text-grey-secondary sticky left-0 top-0 z-[-15] ps-lg text-xs", {
          "text-grey-white": showAll
        }),
        children: comments.length === 0 || olderCommentCount === 0 ? t2("cases:investigation.no_older") : t2("cases:investigation.older", { number: olderCommentCount })
      }
    )
  ] });
};
const useGetCaseDetailQuery = (caseId) => {
  const getCaseDetail = useServerFn(getCaseDetailFn);
  return useQuery({
    queryKey: ["cases", caseId, "get-details"],
    queryFn: async () => {
      const result = await getCaseDetail({ data: { caseId } });
      return result;
    }
  });
};
const MAX_ROWS = 3;
const MonitoringHitsList = ({ monitoringHitsQuery, showAll = false }) => {
  const { t: t2 } = useTranslation(["common"]);
  const formatDateTime = useFormatDateTime();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: M(monitoringHitsQuery).with({ isError: true }, () => {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm items-center justify-center h-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-60 text-center", children: t2("common:generic_fetch_data_error") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", onClick: () => monitoringHitsQuery.refetch(), children: t2("common:retry") })
    ] });
  }).with({ isPending: true }, () => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: t2("common:loading") });
  }).with({ isSuccess: true }, ({ data: { cases } = { cases: [] } }) => {
    if (cases.length === 0) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-sm text-small", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-secondary", children: t2("common:no_data_to_display") }) });
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-md", children: (showAll ? cases : cases.slice(0, MAX_ROWS)).map((caseItem) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[auto_1fr_auto] gap-sm items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-secondary pe-md", children: formatDateTime(caseItem.createdAt) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm truncate", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: caseItem.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CaseStatusBadgeV2, { status: caseItem.status, outcome: caseItem.outcome, variant: "icon-only" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AsyncMonitoringReviewState, { caseId: caseItem.id })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: "/cases/$caseId",
          params: { caseId: fromUUIDtoSUUID(caseItem.id) },
          className: CtaV2ClassName({ variant: "primary", appearance: "stroked" }),
          children: t2("common:open")
        }
      ) })
    ] }, caseItem.id)) });
  }).exhaustive() });
};
function AsyncMonitoringReviewState({ caseId }) {
  const caseDetailQuery = useGetCaseDetailQuery(caseId);
  return M(caseDetailQuery).with({ isPending: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, { className: "size-4" })).with({ isError: true }, () => null).with({ isSuccess: true }, ({ data: { caseDetail } }) => {
    if (!caseDetail || caseDetail.continuousScreenings.length === 0) return null;
    const screening = caseDetail.continuousScreenings[0];
    if (!screening) return null;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewStatusBadge, { status: screening.status, hitsCount: screening.matches.length });
  }).exhaustive();
}
const useHierarchyQuery = (objectType, objectId, showAll) => {
  const getHierarchy = useServerFn(getHierarchyFn);
  return useQuery({
    queryKey: ["hierarchy", objectType, objectId, showAll],
    queryFn: async () => {
      return getHierarchy({ data: { objectType, objectId, showAll } });
    }
  });
};
const ObjectHierarchy = ({
  showAll = false,
  objectType,
  objectId,
  metadata,
  allMetadata,
  handleExplore: handleExploreProps,
  dataModelQuery
}) => {
  const { t: t2 } = useTranslation(["common", "client360"]);
  const hierarchyQuery = useHierarchyQuery(objectType, objectId, showAll);
  const [selectedParent, _setSelectedParent] = reactExports.useState(null);
  const dataModelExplorerContext = DataModelExplorerContext.useValue();
  const handleExplore = (parent, child) => {
    if (!dataModelQuery.isSuccess) return;
    const navigationOptions = dataModelQuery.data.dataModel.find(
      (table) => table.name === parent.objectType
    )?.navigationOptions;
    const navigationOption = (child.navigationOptionId ? navigationOptions?.find((option) => option.id === child.navigationOptionId) : void 0) ?? navigationOptions?.find((option) => option.targetTableName === child.objectType);
    if (!navigationOption) return;
    dataModelExplorerContext.startNavigation({
      pivotObject: {
        isIngested: true,
        pivotValue: parent.data["object_id"],
        pivotObjectName: parent.objectType
      },
      sourceObject: parent.data,
      sourceTableName: navigationOption.sourceTableName,
      sourceFieldName: navigationOption.sourceFieldName,
      targetTableName: navigationOption.targetTableName,
      filterFieldName: navigationOption.filterFieldName,
      orderingFieldName: navigationOption.orderingFieldName
    });
    handleExploreProps(parent, child);
  };
  return M(hierarchyQuery).with({ isPending: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-20 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, { className: "size-6" }) })).with({ isError: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-20 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-center", children: t2("common:generic_fetch_data_error") }) })).with({ isSuccess: true }, ({ data: { hierarchy } = { hierarchy: null } }) => {
    if (!hierarchy) {
      return null;
    }
    const dataModel = dataModelQuery.isSuccess ? dataModelQuery.data.dataModel : [];
    const currentParent = selectedParent ?? hierarchy.parents[0];
    const currentParentMetadata = currentParent ? allMetadata.find((m) => m.name === currentParent.objectType) ?? null : null;
    return currentParent ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      TreeWithParent,
      {
        parent: currentParent,
        parentMetadata: currentParentMetadata,
        tree: hierarchy,
        metadata,
        allMetadata,
        dataModel,
        handleExplore
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      TreeWithoutParent,
      {
        tree: hierarchy,
        metadata,
        allMetadata,
        dataModel,
        handleExplore
      }
    );
  }).exhaustive();
};
const TreeSeparator = ({ className }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "svg",
    {
      className: cn("w-[60px] h-[56px] text-purple-border-light dark:text-purple-border group/separator", className),
      viewBox: "0 0 60 56",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M29.5 0 L29.5 28 Z", strokeWidth: "1.5", stroke: "currentColor" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "path",
          {
            d: "M29.5 28 L29.5 56 Z",
            strokeWidth: "1.5",
            stroke: "currentColor",
            className: "group-[.last-child]/separator:hidden"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M29 29 L60 29 Z", strokeWidth: "1.5", stroke: "currentColor", className: "group-[.parent]/separator:hidden" })
      ]
    }
  );
};
const TreeWithParent = ({
  parent,
  parentMetadata,
  tree,
  metadata,
  allMetadata,
  dataModel,
  handleExplore
}) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[60px_60px_1fr]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(TreeItem, { item: parent, metadata: parentMetadata, dataModel, className: "col-span-full" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-subgrid col-span-full group/tree-line h-12", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TreeSeparator, { className: cn({ "last-child": parent.children.length === 0 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        TreeItem,
        {
          hideAction: true,
          item: tree,
          metadata,
          className: "col-span-2 bg-purple-background-light my-sm dark:bg-purple-primary/10"
        }
      )
    ] }),
    tree.children.map((child, idx) => {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-subgrid col-span-full", children: [
        parent.children.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(TreeSeparator, { className: "parent" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TreeSeparator, { className: cn({ "last-child": idx === tree.children.length - 1 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TreeItem,
          {
            item: child,
            metadata: allMetadata.find((m) => m.name === child.objectType) ?? null,
            className: "my-sm",
            handleExplore: () => handleExplore(tree, child)
          }
        )
      ] }, `child_${child.objectType}`);
    }),
    parent.children.map((child, idx) => {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-subgrid col-span-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TreeSeparator, { className: cn({ "last-child": idx === parent.children.length - 1 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TreeItem,
          {
            item: child,
            metadata: allMetadata.find((m) => m.name === child.objectType) ?? null,
            className: "my-sm col-span-2",
            handleExplore: () => handleExplore(parent, child)
          }
        )
      ] }, `parent_child_${child.objectType}`);
    })
  ] });
};
const TreeWithoutParent = ({ tree, metadata, allMetadata, handleExplore }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[60px_1fr]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      TreeItem,
      {
        hideAction: true,
        item: tree,
        metadata,
        className: "col-span-full bg-purple-background-light dark:bg-purple-primary/10"
      }
    ),
    tree.children.map((child, idx) => {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-subgrid col-span-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TreeSeparator, { className: cn({ "last-child": idx === tree.children.length - 1 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TreeItem,
          {
            item: child,
            metadata: allMetadata.find((m) => m.name === child.objectType) ?? null,
            className: "my-sm",
            handleExplore: () => handleExplore(tree, child)
          }
        )
      ] }, `child_${child.objectType}`);
    })
  ] });
};
const isHierarchyLeaf = (item) => {
  return Array.isArray(item.data);
};
const TreeItem = ({
  item,
  metadata,
  dataModel,
  className,
  hideAction = false,
  handleExplore
}) => {
  const [modalOpen, setModalOpen] = reactExports.useState(false);
  const showModal = !hideAction && !isHierarchyLeaf(item) && !metadata && !!dataModel;
  const isClickable = !!handleExplore || showModal;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: cn(
          "border border-purple-border-light rounded-md p-sm h-10 flex items-center justify-between gap-md",
          "dark:border-purple-border",
          isClickable && "cursor-pointer hover:bg-purple-background-light dark:hover:bg-purple-primary/10 transition-colors",
          className
        ),
        onClick: handleExplore ?? (showModal ? () => setModalOpen(true) : void 0),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TreeItemLabel, { item, metadata }),
          !hideAction ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            isHierarchyLeaf(item) ? /* @__PURE__ */ jsxRuntimeExports.jsx(TreeItemData, { item, metadata, handleExplore }) : null,
            !isHierarchyLeaf(item) && metadata ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              Link,
              {
                to: "/client-detail/$objectType/$objectId",
                params: clientDetailLinkParams(item.objectType, item.data["object_id"]),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "arrow-up-right", className: "size-5" })
              }
            ) : null,
            showModal ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                className: "cursor-pointer shrink-0",
                onClick: (e) => {
                  e.stopPropagation();
                  setModalOpen(true);
                },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "eye", className: "size-5" })
              }
            ) : null
          ] }) : null
        ]
      }
    ),
    showModal && modalOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      Modal.Root,
      {
        open: true,
        onOpenChange: (isOpen) => {
          if (!isOpen) setModalOpen(false);
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Content, { size: "large", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: item.objectType }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-y-auto max-h-[calc(100vh-140px)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            DataFields,
            {
              className: "p-md",
              table: item.objectType,
              object: { data: item.data },
              options: { hideLinks: true }
            }
          ) })
        ] })
      }
    ) : null
  ] });
};
const TreeItemData = ({
  item,
  metadata,
  handleExplore
}) => {
  const itemsWithLabels = item.data.map((itemObject) => ({
    itemObject,
    label: String(itemObject[metadata?.caption_field ?? ""] ?? "").trim()
  })).filter(({ label }) => label.length > 0);
  if (!metadata) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick: (e) => {
          e.stopPropagation();
          handleExplore?.();
        },
        className: "cursor-pointer",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "eye", className: "size-5" })
      }
    );
  }
  const tagItems = itemsWithLabels.map(({ itemObject, label }) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: "white", className: "min-w-0 max-w-40 shrink overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: "/client-detail/$objectType/$objectId",
        params: clientDetailLinkParams(item.objectType, itemObject["object_id"]),
        className: "min-w-0 hover:underline",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block truncate", children: label })
      }
    ) }, itemObject["object_id"]);
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-w-0 flex-1 items-center overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    ExpandableGroupTagLine,
    {
      items: tagItems,
      classname: "gap-xs",
      overflowBehavior: "popover",
      moreButton: (overflow, onExpand) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Tag,
        {
          color: "white",
          className: "cursor-pointer shrink-0 hover:bg-purple-primary/20 transition-colors min-w-min",
          onClick: onExpand,
          children: [
            "+",
            overflow
          ]
        }
      )
    }
  ) });
};
const TreeItemLabel = ({
  item,
  metadata
}) => {
  const { t: t2 } = useTranslation(["client360"]);
  const entityName = metadata?.alias || metadata?.name;
  return metadata && !Array.isArray(item.data) ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2xl shrink-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: entityName }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.data[metadata.caption_field] })
  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0", children: t2("client360:client_detail.hierarchy.related", { objectType: item.objectType }) });
};
function ClientRiskCategoriesEditSelect({
  caseId,
  tableName,
  objectId,
  annotations,
  onAnnotateSuccess
}) {
  const { t: t$1 } = useTranslation(["cases", "common"]);
  const createAnnotationMutation = useCreateAnnotationMutation();
  const categories = annotations.map((annotation) => annotation.payload.tag);
  const revalidate = useLoaderRevalidator();
  const form = useForm({
    defaultValues: {
      caseId,
      tableName,
      objectId,
      type: "risk_tag",
      payload: {
        categories
      }
    },
    validators: {
      onSubmit: riskAnnotationFormSchema,
      onChange: riskAnnotationFormSchema,
      onMount: riskAnnotationFormSchema
    },
    onSubmit({ value }) {
      const addedCategories = value.payload.categories.filter((t2) => !categories.includes(t2));
      const removedAnnotations = annotations.filter((annotation) => {
        return !value.payload.categories.includes(annotation.payload.tag);
      });
      createAnnotationMutation.mutateAsync({
        tableName,
        objectId,
        caseId,
        type: "risk_tag",
        payload: {
          addedCategories,
          removedAnnotations: removedAnnotations.map((annotation) => annotation.id)
        }
      }).then((result) => {
        revalidate();
        if (result.success) {
          onAnnotateSuccess?.();
        } else {
          zt.error(t$1("common:errors.unknown"));
        }
      }).catch(() => {
        zt.error(t$1("common:errors.unknown"));
      });
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit(form), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "payload.categories", children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.List, { children: [
      SCREENING_CATEGORIES.map((cat) => /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Item, { value: cat, onSelect: () => field.handleChange((prev) => toggle(prev, cat)), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: SCREENING_CATEGORY_COLORS[cat], children: cat }),
        field.state.value.includes(cat) ? /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "tick", className: "text-purple-primary size-5" }) : null
      ] }, cat)),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Empty, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center", children: t$1("cases:case_detail.add_a_tag.empty") }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      form.Subscribe,
      {
        selector: (state) => [t(state.values.payload.categories, categories), state.isSubmitting],
        children: ([isDefaultValue, isSubmitting]) => !isDefaultValue ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-grey-border flex justify-end gap-sm overflow-x-auto border-t p-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.HeadlessItem, { children: isSubmitting ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { mode: "icon", type: "submit", disabled: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "spinner", className: "size-4 animate-spin" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "small", type: "submit", children: t$1("common:confirm") }) }) }) : null
      }
    )
  ] });
}
const TitleBar = ({ objectType, objectId, objectDetails, annotationsQuery, metadata }) => {
  const { t: t2 } = useTranslation(["common", "client360"]);
  const [editTagsOpen, setEditTagsOpen] = reactExports.useState(false);
  const [editRiskCateogoriesOpen, setEditRiskCategoriesOpen] = reactExports.useState(false);
  const queryClient = useQueryClient();
  const entityName = metadata?.alias || metadata.name;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-md items-center min-w-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-xs items-center shrink-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typo, { variant: "title1", children: objectDetails.data[metadata.caption_field] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: "grey", children: entityName })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-xs items-center font-normal", children: M(annotationsQuery).with({ isPending: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, { className: "size-4" })).with({ isError: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t2("common:generic_fetch_data_error") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", onClick: () => annotationsQuery.refetch(), children: t2("common:retry") })
    ] })).with({ isSuccess: true }, ({ data: { annotations } }) => {
      const tagsAnnotations = annotations.tags;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        tagsAnnotations.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClientTagsList, { tagsIds: tagsAnnotations.map((annotation) => annotation.payload.tag_id) }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-normal text-s text-grey-secondary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Trans,
          {
            t: t2,
            i18nKey: "client360:entity_tags.no_tag_present",
            components: {
              Entity: /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: "grey" })
            },
            values: {
              objectType: entityName
            }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Menu, { persistOnSelect: true, open: editTagsOpen, onOpenChange: setEditTagsOpen, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Trigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", mode: "icon", variant: "secondary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "edit-square", className: "size-3.5" }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Content, { side: "bottom", align: "end", sideOffset: 4, className: "w-[340px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            ClientTagsEditSelect,
            {
              tableName: objectType,
              objectId,
              annotations: tagsAnnotations,
              onAnnotateSuccess: () => {
                setEditTagsOpen(false);
                queryClient.invalidateQueries({ queryKey: ["annotations", objectType, objectId] });
              }
            }
          ) })
        ] })
      ] });
    }).exhaustive() }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-px self-stretch bg-grey-border" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-xs items-center font-normal", children: M(annotationsQuery).with({ isPending: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, { className: "size-4" })).with({ isError: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t2("common:generic_fetch_data_error") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", onClick: () => annotationsQuery.refetch(), children: t2("common:retry") })
    ] })).with({ isSuccess: true }, ({ data: { annotations } }) => {
      const riskTopicsAnnotations = annotations.risk_tags;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        riskTopicsAnnotations.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-sm", children: riskTopicsAnnotations.map((annotation) => /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: SCREENING_CATEGORY_COLORS[annotation.payload.tag], children: annotation.payload.tag }, annotation.id)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-normal text-s text-grey-secondary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Trans,
          {
            t: t2,
            i18nKey: "client360:entity_tags.no_screening_tag_present",
            components: {
              Entity: /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: "grey" })
            },
            values: {
              objectType: entityName
            }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          MenuCommand.Menu,
          {
            persistOnSelect: true,
            open: editRiskCateogoriesOpen,
            onOpenChange: setEditRiskCategoriesOpen,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Trigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", mode: "icon", variant: "secondary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "edit-square", className: "size-3.5" }) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Content, { side: "bottom", align: "end", sideOffset: 4, className: "w-[340px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                ClientRiskCategoriesEditSelect,
                {
                  tableName: objectType,
                  objectId,
                  annotations: riskTopicsAnnotations,
                  onAnnotateSuccess: () => {
                    setEditRiskCategoriesOpen(false);
                    queryClient.invalidateQueries({ queryKey: ["annotations", objectType, objectId] });
                  }
                }
              ) })
            ]
          }
        )
      ] });
    }).exhaustive() })
  ] });
};
const ClientDetailPage$1 = ({
  objectType,
  objectId,
  objectDetails,
  metadata,
  allMetadata,
  scoringSettings,
  activeScore,
  userScoringAccess
}) => {
  const { t: t2 } = useTranslation(["common", "client360", "user-scoring"]);
  const { currentUser } = useOrganizationDetails();
  const canConfigureUserScoring = isAccessible(userScoringAccess) && !isAnalyst(currentUser);
  const dataModelQuery = useDataModelQuery();
  const annotationsQuery = useGetAnnotationsQuery(objectType, objectId, true);
  const [showExplorer, setShowExplorer] = reactExports.useState(false);
  const [isEditingDocuments, setIsEditingDocuments] = reactExports.useState(false);
  const queryClient = useQueryClient();
  const containerRef = reactExports.useRef(null);
  const [showHierarchyPanel, setShowHierarchyPanel] = reactExports.useState(false);
  const [showMonitoringHitsPanel, setShowMonitoringHitsPanel] = reactExports.useState(false);
  const monitoringHitsQuery = useRelatedCasesByObjectQuery(objectType, objectId);
  const monitoringHitsCount = monitoringHitsQuery.data?.cases.length ?? 0;
  const [showAlertHitsPanel, setShowAlertHitsPanel] = reactExports.useState(false);
  const alertHitsQuery = useGetObjectCasesQuery(objectType, objectId);
  const alertHitsCount = alertHitsQuery.data?.cases.length ?? 0;
  const [showScorePanel, setShowScorePanel] = reactExports.useState(false);
  let [scoreColor, scoreLabel] = ["", ""];
  if (scoringSettings && activeScore) {
    scoreColor = SCORING_LEVELS_COLORS[scoringSettings.maxRiskLevel][activeScore.risk_level] ?? "inherit";
    scoreLabel = t2(
      SCORING_LEVELS_LABEL_KEYS[scoringSettings.maxRiskLevel][activeScore.risk_level] ?? activeScore.risk_level.toString()
    );
  }
  const handleScoreClick = () => setShowScorePanel(true);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(DataModelExplorerProvider, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Page.Main, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Page.Header, { className: "gap-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(BackButton, { back: "/client-detail" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TitleBar,
          {
            objectType,
            objectId,
            objectDetails,
            annotationsQuery,
            metadata
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Page.Container, { ref: containerRef, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Page.Content, { width: "table", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-md", children: [
          isAccessible(userScoringAccess) ? scoringSettings && activeScore ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              className: "flex flex-col gap-sm border rounded-lg p-md py-sm w-[180px] self-start shrink-0 items-start",
              style: { borderColor: scoreColor, backgroundColor: `${scoreColor}20` },
              onClick: handleScoreClick,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-small", children: t2("client360:client_detail.risk_level") }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-xs items-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-4 rounded-full", style: { backgroundColor: scoreColor } }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: scoreLabel }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "eye", className: "size-4" })
                ] })
              ]
            }
          ) : canConfigureUserScoring ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-purple-border bg-purple-background-light flex flex-col items-center gap-sm rounded-lg border p-md py-sm w-[180px] self-start shrink-0 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "comet", className: "size-10 shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: t2("client360:client_detail.risk_level") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Link,
              {
                to: "/user-scoring",
                className: "border-purple-primary text-purple-primary text-xs font-medium w-full rounded-lg border py-xs text-center hover:bg-purple-primary/10 transition-colors",
                children: t2("client360:client_detail.risk_level.configure")
              }
            )
          ] }) : null : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-purple-border bg-purple-background-light flex flex-col items-center gap-sm rounded-lg border p-md py-sm w-[180px] self-start shrink-0 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "comet", className: "size-10 shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: t2("client360:client_detail.risk_level") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "a",
              {
                href: "https://checkmarble.com/upgrade",
                target: "_blank",
                rel: "noreferrer",
                className: "border-purple-primary text-purple-primary text-xs font-medium w-full rounded-lg border py-xs text-center hover:bg-purple-primary/10 transition-colors",
                children: t2("client360:client_detail.risk_level.upgrade")
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "grow", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-[140px]", children: M(dataModelQuery).with({ isPending: true }, () => {
            return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center items-center min-h-[140px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, { className: "size-10" }) });
          }).with({ isError: true }, () => {
            return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: t2("common:generic_fetch_data_error") });
          }).with({ isSuccess: true }, (dmQuery) => {
            return /* @__PURE__ */ jsxRuntimeExports.jsx(
              DataFields,
              {
                table: objectType,
                object: objectDetails,
                options: {
                  layout: "2-columns"
                }
              }
            );
          }).exhaustive() }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-[7fr_5fr] gap-md", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-md", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "flex flex-col gap-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: t2("client360:client_detail.monitoring_hits.title") }),
                monitoringHitsCount > 3 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { appearance: "link", onClick: () => setShowMonitoringHitsPanel(true), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t2("common:show") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "eye", className: "size-4" })
                ] }) : null
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(MonitoringHitsList, { monitoringHitsQuery })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "flex flex-col gap-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: t2("client360:client_detail.alert_hits.title") }),
                alertHitsCount > 3 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { appearance: "link", onClick: () => setShowAlertHitsPanel(true), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t2("common:show") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "eye", className: "size-4" })
                ] }) : null
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(AlertHitsList, { alertHitsQuery })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "flex flex-col gap-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: t2("client360:client_detail.hierarchy.title") }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { appearance: "link", onClick: () => setShowHierarchyPanel(true), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t2("common:show") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "eye", className: "size-4" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              ObjectHierarchy,
              {
                objectType,
                objectId,
                metadata,
                allMetadata,
                dataModelQuery,
                handleExplore: () => setShowExplorer(true)
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: t2("client360:client_detail.documents.title") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover.Root, { open: isEditingDocuments, onOpenChange: setIsEditingDocuments, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Popover.Trigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "add-circle", className: "size-4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t2("client360:client_detail.documents.add_button") })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Popover.Content,
                {
                  side: "bottom",
                  align: "end",
                  sideOffset: 4,
                  collisionPadding: 10,
                  className: "w-[340px]",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    ClientDocumentsPopover,
                    {
                      tableName: objectType,
                      objectId,
                      onAnnotateSuccess: () => {
                        setIsEditingDocuments(false);
                        queryClient.invalidateQueries({ queryKey: ["annotations", objectType, objectId] });
                      }
                    }
                  )
                }
              )
            ] }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "@container", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DocumentsList, { objectType, objectId }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: t2("client360:client_detail.comments.title") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            ClientComments,
            {
              objectType,
              objectId,
              annotationsQuery,
              root: containerRef
            }
          )
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Root, { open: showAlertHitsPanel, onOpenChange: setShowAlertHitsPanel, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Container, { size: "medium", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel.Content, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Header, { children: t2("client360:client_detail.alert_hits.panel_title") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AlertHitsList, { alertHitsQuery, showAll: true })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Root, { open: showMonitoringHitsPanel, onOpenChange: setShowMonitoringHitsPanel, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Container, { size: "medium", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel.Content, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Header, { children: t2("client360:client_detail.monitoring_hits.panel_title") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MonitoringHitsList, { monitoringHitsQuery, showAll: true })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Root, { open: showHierarchyPanel, onOpenChange: setShowHierarchyPanel, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Container, { size: "small", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel.Content, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Header, { children: t2("client360:client_detail.hierarchy.title") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        ObjectHierarchy,
        {
          showAll: true,
          objectType,
          objectId,
          metadata,
          allMetadata,
          dataModelQuery,
          handleExplore: () => setShowExplorer(true)
        }
      )
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      DataExplorerPanel,
      {
        open: showExplorer,
        onOpenChange: setShowExplorer,
        dataModel: dataModelQuery.data?.dataModel ?? []
      }
    ),
    scoringSettings && activeScore && isAccessible(userScoringAccess) ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      ScoreDetailPanel,
      {
        open: showScorePanel,
        onOpenChange: setShowScorePanel,
        objectType,
        activeScore,
        scoringSettings
      }
    ) : null
  ] });
};
const Card = ({ children, className }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("p-lg border border-grey-border rounded-md bg-surface-card", className), children });
};
function ClientDetailPage() {
  const loaderData = Route.useLoaderData();
  const {
    objectType,
    objectId,
    objectDetails,
    metadata,
    allMetadata,
    dataModel,
    dataModelFeatureAccess,
    scoringSettings,
    activeScore,
    userScoringAccess
  } = loaderData;
  if (!metadata) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(DataModelContextProvider, { dataModel, dataModelFeatureAccess, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClientDetailPage$1, { objectType, objectId, objectDetails, metadata, allMetadata, scoringSettings, activeScore, userScoringAccess }, `${objectType}_${objectId}`) });
}
export {
  ClientDetailPage as component
};
