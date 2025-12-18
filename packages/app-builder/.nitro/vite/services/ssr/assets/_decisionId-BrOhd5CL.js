import { R as jsxRuntimeExports, r as reactExports } from "../server.js";
import { u as useTranslation, t as useFormatDateTime, eb as Collapsible, j as Tag, s as Trans, el as createColumnHelper, dD as Tooltip, ej as useVirtualTable, em as getCoreRowModel, ek as Table, B as Button, e as Icon } from "./format-NPGUXq-g.js";
import { a1 as decisionsI18n, L as Link, Q as CaseStatusBadgeV2, ag as ScreeningStatusTag, ah as Route, P as Page, B as BreadCrumbs } from "./router-vb7i5euz.js";
import { C as Callout } from "./Callout-DX4NBXlG.js";
import { g as getPivotDisplayValue, S as ScreeningErrors } from "./ScreeningErrors-DkCn4Jug.js";
import { p as pivotValuesDocHref } from "./documentation-href-uAe88WFl.js";
import { e as DataFields, D as DateBirthdateComponent, g as StringMainComponent, d as DateDatetimeComponent } from "./DataField-vckdVtrg.js";
import { E as ExternalLink, l as linkClasses } from "./ExternalLink-CG_77QdX.js";
import { a as ScorePanel, D as DecisionRightPanel } from "./Score-DhwNAmQk.js";
import { cY as isScreeningError, u as t, cZ as t$2, p as t$3, v as n, o as t$4 } from "./services-middleware-DR8Hua1Y.js";
import { D as DatatypeIcon, a as DatatypeToPrimitiveType } from "./DatatypeOption-Csn4su3e.js";
import { M as MatchCard, D as DecisionDetailTriggerObject } from "./TriggerObjectDetail-BL8JBhBZ.js";
import { t as t$1 } from "./flatMap-CbF5uMEQ.js";
import { P as Panel } from "./Panel-kj8Z2GDk.js";
import { b as fromUUIDtoSUUID } from "./short-uuid-MIi3jWzx.js";
import { R as RulesDetail } from "./RulesDetail-19MjhcYa.js";
import { a as OutcomePanel } from "./OutcomeTag-BH_m80fa.js";
import { e } from "./isNonNullish-DgEqPJBU.js";
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
import "./Spinner-GK6cEAdR.js";
import "./data-BFm2FCTm.js";
import "./data-fdG1PpsD.js";
import "./useQuery-B7mL_evE.js";
import "./useBaseQuery-CMboOtTR.js";
import "./useServerFn-CrqFKl7V.js";
import "./data-model-B-Bz1o1P.js";
import "./create-context-CYc8deix.js";
import "./dataTypeSchema-DvqJgdgd.js";
import "./mapToObj-wQ-uHOuD.js";
import "./omit-ZO4dmkWK.js";
import "./FormErrorOrDescription-DO6Hdfmn.js";
import "./cases-PZYcTUxr.js";
import "./cases-DJ9ABIdo.js";
import "./useMutation-C5oG90Zs.js";
import "./get-inboxes-6fSfvled.js";
import "./form-D2XmDKeG.js";
import "./array-BFSjnO9c.js";
import "./useForm-BwABQKAs.js";
import "node:crypto";
import "./LoaderRevalidatorContext-C9s56i-l.js";
import "./screenings-CS8peAlI.js";
import "./use-callback-ref-AfyBSz95.js";
import "./FreeformMatchCard-JGOBIPO0.js";
import "./dataset-utils-C1Lb7jdi.js";
import "./screening-entity-DVQtf50p.js";
import "./lists-config-CsQWGvXL.js";
import "./StatusRadioGroup-BTpRIK0f.js";
import "./organization-users-Bxl0ZW8k.js";
import "./user-C_y5ayGi.js";
import "./join-BeQTfqAC.js";
import "./Avatar-DpA4jY60.js";
import "./Card-9LKESqlf.js";
import "./FormatData-TXRe9nHU.js";
import "./maplibre-gl-Dbgqr2_Q.js";
import "./Paper-6W_X6MFt.js";
import "./index-DCH5hwXA.js";
import "./isArray-gJc74O_I.js";
import "./index-CtZTigeT.js";
import "./index-BF4TC3go.js";
import "./index-C_WgunUr.js";
import "./index-CR1bHmei.js";
import "./display-TKj7AN5a.js";
import "./scenario-validation-error-messages-CB3GcwJ8.js";
import "./Nudge-C1ux5IUa.js";
import "./hovercard-provider-BchUL2eY.js";
import "./create-navigation-option-DrtWhyLE.js";
import "./organization-detail-YGkE0F4y.js";
import "./index-DhVP5FgH.js";
function DecisionDetail({ decision }) {
  const { t: t2 } = useTranslation(decisionsI18n);
  const formatDateTime = useFormatDateTime();
  const { case: caseDetail, createdAt, scenario, triggerObjectType } = decision;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Collapsible.Container, { className: "bg-surface-card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Collapsible.Title, { children: t2("decisions:decision_detail.title") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Collapsible.Content, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid auto-rows-fr grid-cols-[max-content_1fr] items-center gap-x-10 gap-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DetailLabel, { children: t2("decisions:created_at") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("time", { dateTime: createdAt, children: formatDateTime(createdAt, {
        dateStyle: "short",
        timeStyle: "short"
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DetailLabel, { children: t2("decisions:scenario.name") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: "/detection/scenarios/$scenarioId",
          params: { scenarioId: fromUUIDtoSUUID(scenario.id) },
          className: "hover:text-purple-hover focus:text-purple-hover text-purple-primary font-semibold hover:underline focus:underline",
          children: scenario.name
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DetailLabel, { children: t2("decisions:scenario.version") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: "/detection/scenarios/$scenarioId/i/$iterationId",
          params: {
            scenarioId: fromUUIDtoSUUID(scenario.id),
            iterationId: fromUUIDtoSUUID(scenario.scenarioIterationId)
          },
          className: "hover:text-purple-hover focus:text-purple-hover text-purple-primary font-semibold hover:underline focus:underline",
          children: `V${scenario.version}`
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DetailLabel, { children: t2("decisions:object_type") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: triggerObjectType }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DetailLabel, { children: t2("decisions:case") }),
      caseDetail ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-fit flex-row items-center justify-center gap-xs align-baseline", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CaseStatusBadgeV2, { status: caseDetail.status, variant: "semi-full" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: "/cases/$caseId",
            params: { caseId: fromUUIDtoSUUID(caseDetail.id) },
            className: "hover:text-purple-hover focus:text-purple-hover text-purple-primary font-semibold hover:underline focus:underline",
            children: caseDetail.name
          }
        )
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "-" })
    ] }) })
  ] });
}
const DetailLabel = ({ children }) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold first-letter:capitalize", children });
function PivotType({ type }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { size: "small", color: type === "field" ? "grey" : "purple", className: "w-fit", children: type });
}
function PivotDetail({ pivotValues, existingPivotDefinition }) {
  const { t: t2 } = useTranslation(decisionsI18n);
  let content;
  if (pivotValues.length > 0) {
    content = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Callout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "whitespace-pre text-balance", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Trans,
        {
          t: t2,
          i18nKey: "decisions:pivot_detail.description",
          components: {
            DocLink: /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { href: pivotValuesDocHref })
          }
        }
      ) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(PivotList, { pivotValues })
    ] });
  } else if (existingPivotDefinition) {
    content = /* @__PURE__ */ jsxRuntimeExports.jsx(Callout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "whitespace-pre text-balance", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Trans,
      {
        t: t2,
        i18nKey: "decisions:pivot_detail.no_pivot_description",
        components: {
          DocLink: /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { href: pivotValuesDocHref })
        }
      }
    ) }) });
  } else {
    content = /* @__PURE__ */ jsxRuntimeExports.jsx(Callout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "whitespace-pre text-balance", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Trans,
      {
        t: t2,
        i18nKey: "decisions:pivot_detail.missing_pivot_definition",
        components: {
          DataModelLink: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/data/list", className: linkClasses }),
          DocLink: /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { href: pivotValuesDocHref })
        }
      }
    ) }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Collapsible.Container, { className: "bg-surface-card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Collapsible.Title, { children: t2("decisions:pivot_detail.title") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Collapsible.Content, { children: content })
  ] });
}
function PivotList({ pivotValues }) {
  const { t: t2 } = useTranslation(decisionsI18n);
  const columnHelper = reactExports.useMemo(
    () => createColumnHelper(),
    []
  );
  const columns = reactExports.useMemo(
    () => [
      columnHelper.accessor((row) => row.pivot.type, {
        id: "type",
        header: t2("decisions:pivot_detail.type"),
        size: 50,
        cell: ({ getValue }) => {
          const type = getValue();
          return /* @__PURE__ */ jsxRuntimeExports.jsx(PivotType, { ...{ type } });
        }
      }),
      columnHelper.accessor((row) => getPivotDisplayValue(row.pivot), {
        id: "definition",
        header: t2("decisions:pivot_detail.definition"),
        size: 160,
        cell: ({ getValue }) => {
          const definition = getValue();
          return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: definition });
        }
      }),
      columnHelper.accessor(
        (row) => ({
          value: row.value,
          table: row.pivot.type === "field" ? row.pivot.baseTable : row.pivot.pivotTable,
          object: row.object
        }),
        {
          id: "filter_decisions",
          header: t2("decisions:pivot_detail.pivot_value"),
          size: 240,
          cell: ({ getValue }) => /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip.Default, { content: t2("decisions:pivot_detail.pivot_value.tooltip"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/detection/decisions", search: { pivotValue: getValue().value }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(PivotDetails, { value: getValue().value, table: getValue().table, object: getValue().object }) }) })
        }
      )
    ],
    [t2, columnHelper]
  );
  const { table, getBodyProps, rows, getContainerProps } = useVirtualTable({
    data: pivotValues,
    columns,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    enableSorting: false
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Table.Container, { ...getContainerProps(), className: "bg-surface-card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Table.Header, { headerGroups: table.getHeaderGroups() }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Table.Body, { ...getBodyProps(), children: rows.map((row) => {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Table.Row, { row }, row.id);
    }) })
  ] });
}
function PivotDetails({ value, table, object }) {
  if (!object) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hover:text-purple-hover focus:text-purple-hover text-purple-primary relative font-semibold hover:underline focus:underline", children: value });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    DataFields,
    {
      table,
      object,
      preset: "essentials",
      options: { withId: true },
      className: "p-sm my-sm bg-surface-card rounded-lg border-grey-border border cursor-pointer"
    }
  );
}
function ScreeningDetail({ screening, table }) {
  const hasError = isScreeningError(screening);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Collapsible.Container, { className: "bg-surface-card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Collapsible.Title, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex grow items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: screening.config.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        ScreeningStatusTag,
        {
          status: screening.status,
          pendingHitCount: screening.matches.filter((m) => m.status === "pending").length,
          className: "h-8"
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Collapsible.Content, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-md", children: [
      hasError ? /* @__PURE__ */ jsxRuntimeExports.jsx(ScreeningErrors, { screening }) : null,
      screening.request ? /* @__PURE__ */ jsxRuntimeExports.jsx(SearchInput, { request: screening.request, fields: table?.fields }) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-2", children: screening.matches.map((match) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        MatchCard,
        {
          readonly: true,
          screening,
          unreviewable: hasError || screening.partial,
          match
        },
        match.id
      )) })
    ] }) })
  ] });
}
function toSearchInputItem(value, field) {
  return {
    value,
    type: field?.dataType ?? "String",
    semanticType: field?.semanticType ?? "text"
  };
}
const SearchInput = ({
  request,
  fields
}) => {
  const { t: t$42 } = useTranslation(decisionsI18n);
  const searchInputList = t(
    t$2(request.queries),
    t$1(
      (query) => t(
        t$3(query.properties),
        t$1(([ftmProperty, values]) => {
          const field = fields?.find((f) => f.ftmProperty === ftmProperty);
          return values.map((value) => toSearchInputItem(value, field));
        })
      )
    )
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t$42("screenings:search_input") }),
    searchInputList.map(({ value, type, semanticType }, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-grey-border flex items-center gap-sm rounded-sm border p-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DatatypeIcon, { dataType: DatatypeToPrimitiveType(type) }),
      semanticType === "date_of_birth" ? /* @__PURE__ */ jsxRuntimeExports.jsx(DateBirthdateComponent, { value, compact: true }) : semanticType === "name" ? /* @__PURE__ */ jsxRuntimeExports.jsx(StringMainComponent, { value }) : type === "Timestamp" ? /* @__PURE__ */ jsxRuntimeExports.jsx(DateDatetimeComponent, { value }) : value
    ] }, i))
  ] });
};
function DecisionPage() {
  const {
    decision,
    pivots,
    pivotObjects,
    scenarioRules,
    screening,
    isIterationArchived,
    dataModel
  } = Route.useLoaderData();
  const pivotValues = t(decision.pivotValues, t$4(({
    id,
    value
  }) => {
    if (!id || !value) return null;
    const pivot = pivots.find((p) => p.id === id);
    if (!pivot) return null;
    const pivotObject = pivotObjects.find((o) => o.pivotId === id && o.value === value);
    return {
      pivot,
      value,
      object: pivotObject?.object ?? null
    };
  }), n(e));
  const table = dataModel.find((table2) => table2.name == decision.triggerObjectType);
  const existingPivotDefinition = pivots.some((pivot) => pivot.baseTable === decision.triggerObjectType);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel.Root, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Page.Main, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Page.Header, { className: "justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(BreadCrumbs, {}),
        !decision.case ? /* @__PURE__ */ jsxRuntimeExports.jsx(AddToCase, {}) : null
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Page.Container, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Page.Content, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[2fr_1fr] gap-md lg:gap-xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-md lg:gap-xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DecisionDetail, { decision }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(PivotDetail, { pivotValues, existingPivotDefinition }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(RulesDetail, { scenarioId: decision.scenario.id, ruleExecutions: decision.rules, rules: scenarioRules, isIterationArchived }),
          screening.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(ScreeningDetail, { screening: s, table }, s.id))
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-md lg:gap-xl shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-md lg:flex-row lg:gap-xl", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ScorePanel, { score: decision.score }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(OutcomePanel, { outcome: decision.outcome })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DecisionDetailTriggerObject, { table: decision.triggerObjectType, triggerObject: decision.triggerObject })
        ] })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DecisionRightPanel, { decisionIds: [decision.id] })
  ] });
}
function AddToCase() {
  const {
    t: t2
  } = useTranslation(decisionsI18n);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Trigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "primary", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "plus", className: "size-5" }),
    t2("decisions:add_to_case")
  ] }) });
}
export {
  DecisionPage as component
};
