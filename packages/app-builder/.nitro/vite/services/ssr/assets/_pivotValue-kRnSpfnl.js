import { R as jsxRuntimeExports, r as reactExports } from "../server.js";
import { u as useGetAnnotationsQuery } from "./get-annotations-CiR2trFM.js";
import { u as useOrganizationDetails } from "./organization-detail-YGkE0F4y.js";
import { Q as CaseStatusBadgeV2, L as Link, q as clientDetailLinkParams, b6 as Route } from "./router-vb7i5euz.js";
import { y as useQueryClient } from "./QueryClientProvider-DYTpkCko.js";
import { u as useTranslation, t as useFormatDateTime, C as CtaV2ClassName, e as Icon, j as Tag, B as Button, e9 as Popover } from "./format-NPGUXq-g.js";
import { C as Card } from "./Card-9LKESqlf.js";
import { b as DataModelExplorerProvider, c as ClientDocumentsPopover } from "./DataModelExplorer-gjwcxdcr.js";
import { U as UserScoreBadge, C as ClientObjectTagList } from "./UserScoreBadge-CO8_r3Vc.js";
import { u as usePivotRelatedCasesQuery, P as PivotNavigationOptions } from "./PivotNavigationOptions-CrxM6N-5.js";
import { D as DocumentsList } from "./DocumentsList-Dy4UzBqm.js";
import { e as DataFields } from "./DataField-vckdVtrg.js";
import { C as CommentContext, b as ClientCommentsListCard } from "./ClientComments-C1YeqQ-K.js";
import { b as fromUUIDtoSUUID } from "./short-uuid-MIi3jWzx.js";
import { M } from "./services-middleware-DR8Hua1Y.js";
import { D as DataExplorerPanel } from "./ScoreDetailPanel-BpXEd2Rh.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
import "./data-BFm2FCTm.js";
import "./createSsrRpc-ZXUHv2Er.js";
import "./auth-middleware-C4ap47rJ.js";
import "./data-fdG1PpsD.js";
import "./useQuery-B7mL_evE.js";
import "./useBaseQuery-CMboOtTR.js";
import "./useServerFn-CrqFKl7V.js";
import "./create-context-CYc8deix.js";
import "./security-headers.server-BdP3HrPp.js";
import "./ThemeContext-B40HQxfH.js";
import "./config-ut8rAdyo.js";
import "./i18n-instance-store-UssbGYOM.js";
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
import "./useInfiniteQuery-D2tvMYRf.js";
import "./FormatData-TXRe9nHU.js";
import "./maplibre-gl-Dbgqr2_Q.js";
import "./ExternalLink-CG_77QdX.js";
import "./ClientCommentForm-D-0vcWN7.js";
import "./LoaderRevalidatorContext-C9s56i-l.js";
import "./useMutation-C5oG90Zs.js";
import "./Time-IafhAG3W.js";
import "./annotations-DpAN3M8g.js";
import "./form-D2XmDKeG.js";
import "./array-BFSjnO9c.js";
import "./useForm-BwABQKAs.js";
import "./DownloadFilesService-BW-xJtj3.js";
import "./download-file-C533i5xX.js";
import "./useFormDropzone-BjTKexsf.js";
import "./TagPreview-CjmrrQF6.js";
import "./organization-object-tags-C9Gf0Ixc.js";
import "./isDeepEqual-C0XXZLYo.js";
import "./organization-users-Bxl0ZW8k.js";
import "./Avatar-DpA4jY60.js";
import "./use-debounced-callback-ref-5JUm5kmy.js";
import "./scoring-NycAI253.js";
import "./user-scoring-BwKPLq1i.js";
import "./feature-access-B8PIS8ad.js";
import "./display-TKj7AN5a.js";
import "./cases-DJ9ABIdo.js";
import "./cases-PZYcTUxr.js";
import "./FormErrorOrDescription-DO6Hdfmn.js";
import "./create-navigation-option-DrtWhyLE.js";
import "./uniqueBy-Tn1hUkKJ.js";
import "./flatMap-CbF5uMEQ.js";
import "./Panel-kj8Z2GDk.js";
import "./user-C_y5ayGi.js";
import "./join-BeQTfqAC.js";
import "./Spinner-GK6cEAdR.js";
import "./constructNow-sBxu05z3.js";
import "./endOfDay-DlzjvxTr.js";
import "./isNonNullish-DgEqPJBU.js";
import "./data-model-B-Bz1o1P.js";
import "./dataTypeSchema-DvqJgdgd.js";
import "./mapToObj-wQ-uHOuD.js";
import "./omit-ZO4dmkWK.js";
import "./index-DhVP5FgH.js";
import "./index-C_WgunUr.js";
import "./index-CR1bHmei.js";
import "./Markdown-sjqeOXzy.js";
import "./Code-C6D_KXb1.js";
import "node:crypto";
function ClientRelatedAlertCasesCard({ caseId, pivotValue }) {
  const { t } = useTranslation(["common", "cases"]);
  const casesQuery = usePivotRelatedCasesQuery(pivotValue);
  const formatDateTime = useFormatDateTime();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: M(casesQuery).with({ isError: true }, () => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-red-disabled bg-red-background text-red-primary mt-md rounded-sm border", children: t("common:global_error") });
  }).with({ isPending: true }, () => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: t("common:loading") });
  }).otherwise((query) => {
    const cases = query.data.cases.filter((caseObj) => caseObj.id !== caseId);
    if (cases.length === 0) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: t("cases:manager.related_cases.no_cases") });
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid w-full grid-cols-[minmax(8rem,_auto)_1fr_auto] gap-sm", children: cases.map((caseObj, idx) => {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-subgrid col-span-full items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-secondary", children: formatDateTime(caseObj.createdAt, { dateStyle: "short" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: caseObj.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CaseStatusBadgeV2, { status: caseObj.status, variant: "icon-only" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: "/cases/s/$caseId",
            params: { caseId: fromUUIDtoSUUID(caseObj.id) },
            className: CtaV2ClassName({ variant: "primary", appearance: "stroked" }),
            children: t("common:open")
          }
        )
      ] }, caseObj.id);
    }) });
  }) });
}
function CaseManagerClientsPage({
  caseDetail,
  dataModel,
  pivotObject,
  ingestedInfo,
  client360Tables,
  userScoringAccess
}) {
  const { t } = useTranslation(["common", "cases"]);
  const queryClient = useQueryClient();
  const { currentUser } = useOrganizationDetails();
  const { set } = CommentContext.useValue();
  const annotationsQuery = useGetAnnotationsQuery(pivotObject.pivotObjectName, pivotObject.pivotObjectId, true);
  const [isEditingDocuments, setIsEditingDocuments] = reactExports.useState(false);
  const [explorationOpen, setExplorationOpen] = reactExports.useState(false);
  const currentTable = dataModel.find((t2) => t2.name === pivotObject.pivotObjectName);
  const metadata = client360Tables.find((t2) => t2.name === pivotObject.pivotObjectName);
  const entityName = metadata?.alias || metadata?.name || pivotObject.pivotObjectName;
  const clientName = metadata ? pivotObject.pivotObjectData.data[metadata.caption_field] : "";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-lg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: clientName }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
          ingestedInfo ? /* @__PURE__ */ jsxRuntimeExports.jsx(UserScoreBadge, { userScoringAccess, ...ingestedInfo }) : null,
          metadata && ingestedInfo ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Link,
            {
              to: "/client-detail/$objectType/$objectId",
              params: clientDetailLinkParams(ingestedInfo.objectType, ingestedInfo.objectId),
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
            caseId: caseDetail.id,
            tableName: pivotObject.pivotObjectName,
            objectId: pivotObject.pivotObjectId,
            annotations: annotationsQuery.data?.annotations.tags,
            placeholder: t("cases:manager.principal.add_tag_placeholder")
          }
        ) : null
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "flex flex-col gap-sm text-small", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          DataFields,
          {
            object: pivotObject.pivotObjectData,
            table: pivotObject.pivotObjectName,
            options: { layout: "2-columns" }
          }
        ),
        currentTable ? /* @__PURE__ */ jsxRuntimeExports.jsxs(DataModelExplorerProvider, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            PivotNavigationOptions,
            {
              className: "mt-xl",
              currentUser,
              pivotObject,
              table: currentTable,
              dataModel,
              onExplore: () => setExplorationOpen(true)
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DataExplorerPanel, { dataModel, open: explorationOpen, onOpenChange: setExplorationOpen })
        ] }) : null
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-lg", children: [
      ingestedInfo ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: t("cases:manager.clients.last_comments_title") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", onClick: () => set(ingestedInfo), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "plus", className: "size-4" }),
            t("common:add")
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ClientCommentsListCard, { annotationsQuery })
      ] }) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: t("cases:case_detail.pivot_panel.case_history") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ClientRelatedAlertCasesCard, { pivotValue: pivotObject.pivotValue, caseId: caseDetail.id })
      ] }),
      ingestedInfo ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: t("client360:client_detail.documents.title") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover.Root, { open: isEditingDocuments, onOpenChange: setIsEditingDocuments, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Popover.Trigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "plus", className: "size-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("common:add") })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Popover.Content, { side: "bottom", align: "end", sideOffset: 4, collisionPadding: 10, className: "w-[340px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              ClientDocumentsPopover,
              {
                tableName: ingestedInfo.objectType,
                objectId: ingestedInfo.objectId,
                onAnnotateSuccess: () => {
                  setIsEditingDocuments(false);
                  queryClient.invalidateQueries({
                    queryKey: ["annotations", ingestedInfo.objectType, ingestedInfo.objectId]
                  });
                }
              }
            ) })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "@container", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DocumentsList, { objectType: ingestedInfo.objectType, objectId: ingestedInfo.objectId }) })
      ] }) : null
    ] })
  ] });
}
function RouteComponent() {
  const {
    caseDetail,
    dataModel,
    pivotObject,
    client360Tables,
    userScoringAccess
  } = Route.useRouteContext();
  const {
    objectId,
    objectType
  } = Route.useLoaderData();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(CaseManagerClientsPage, { ingestedInfo: pivotObject.isIngested ? {
    objectId,
    objectType
  } : null, caseDetail, dataModel, pivotObject, client360Tables, userScoringAccess });
}
export {
  RouteComponent as component
};
