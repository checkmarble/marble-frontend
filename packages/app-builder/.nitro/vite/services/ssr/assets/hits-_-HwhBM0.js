import { R as jsxRuntimeExports, S as React, r as reactExports } from "../server.js";
import { b7 as dataI18n, av as casesI18n, s as screeningsI18n, ag as ScreeningStatusTag, t as useLoaderData, N as useAgnosticNavigation } from "./router-vb7i5euz.js";
import { u as useTranslation, s as Trans, j as Tag, et as HovercardAnchor, e as Icon, b as clsx, eu as Hovercard, d_ as Tabs, d$ as tabClassName, e4 as Modal, e1 as Input, eF as Select, B as Button } from "./format-NPGUXq-g.js";
import { C as CopyToClipboardButton, z as zt } from "./CopyToClipboardButton-CJNJJful.js";
import { g as getPivotDisplayValue, S as ScreeningErrors } from "./ScreeningErrors-DkCn4Jug.js";
import { C as Code } from "./Code-C6D_KXb1.js";
import { H as HovercardProvider } from "./hovercard-provider-BchUL2eY.js";
import { I as IngestedObjectDetailModal } from "./IngestedObjectDetailModal-BFFwOF2a.js";
import { M as MatchCard, C as CaseDetailTriggerObject } from "./TriggerObjectDetail-BL8JBhBZ.js";
import { F as FormatData } from "./FormatData-TXRe9nHU.js";
import { u as useEntityName } from "./useEntityName-n7_MOPuL.js";
import { p as parseUnknownData } from "./DataField-vckdVtrg.js";
import { C as Callout } from "./Callout-DX4NBXlG.js";
import { u as t, cZ as t$2, v as n$1, cY as isScreeningError, dc as isScreeningReviewCompleted, M, o as t$4 } from "./services-middleware-DR8Hua1Y.js";
import { S as SEARCH_ENTITIES } from "./screening-entity-DVQtf50p.js";
import { u as useSearchScreeningMatchesMutation, a as useRefineScreeningMutation } from "./search-screening-matches-CgACX5Vl.js";
import { r as refineSearchSchema } from "./screenings-CS8peAlI.js";
import { h as handleSubmit } from "./form-D2XmDKeG.js";
import { u as useCallbackRef } from "./use-callback-ref-AfyBSz95.js";
import { u as useForm, a as useStore } from "./useForm-BwABQKAs.js";
import { s as setAdditionalFields } from "./set-additional-fields-BAjwURJS.js";
import { n } from "./flat-BPaRpdYE.js";
import { t as t$1 } from "./flatMap-CbF5uMEQ.js";
import { t as t$3 } from "./keys-CPbIGTB1.js";
import { e } from "./isNonNullish-DgEqPJBU.js";
import { b as fromUUIDtoSUUID } from "./short-uuid-MIi3jWzx.js";
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
import "./use-callback-ref-DXzIzfqy.js";
import "./LoaderRevalidatorContext-C9s56i-l.js";
import "./useMutation-C5oG90Zs.js";
import "./useServerFn-CrqFKl7V.js";
import "./FreeformMatchCard-JGOBIPO0.js";
import "./Spinner-GK6cEAdR.js";
import "./useQuery-B7mL_evE.js";
import "./useBaseQuery-CMboOtTR.js";
import "./dataset-utils-C1Lb7jdi.js";
import "./lists-config-CsQWGvXL.js";
import "./cases-PZYcTUxr.js";
import "./cases-DJ9ABIdo.js";
import "./StatusRadioGroup-BTpRIK0f.js";
import "./organization-users-Bxl0ZW8k.js";
import "./create-context-CYc8deix.js";
import "./user-C_y5ayGi.js";
import "./join-BeQTfqAC.js";
import "./Avatar-DpA4jY60.js";
import "./Card-9LKESqlf.js";
import "./mapToObj-wQ-uHOuD.js";
import "./maplibre-gl-Dbgqr2_Q.js";
import "./ExternalLink-CG_77QdX.js";
import "./data-BFm2FCTm.js";
import "./data-fdG1PpsD.js";
import "./data-model-B-Bz1o1P.js";
import "./dataTypeSchema-DvqJgdgd.js";
import "./omit-ZO4dmkWK.js";
import "node:crypto";
import "./array-BFSjnO9c.js";
function PivotDetails({ pivot }) {
  const { t: t2 } = useTranslation(dataI18n);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-start gap-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-wrap", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PivotDescription, { ...{ pivot } }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row items-center gap-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-secondary text-s min-w-[90px]", children: t2("data:view_pivot.table") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-m text-grey-primary", children: pivot.type === "link" ? pivot.pivotTable : pivot.baseTable })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row items-center gap-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-secondary text-s min-w-[90px]", children: t2("data:view_pivot.definition") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: getPivotDisplayValue(pivot) })
    ] })
  ] });
}
function PivotDescription({ pivot }) {
  const { t: t2 } = useTranslation(dataI18n);
  if (pivot.type === "link") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Trans,
      {
        i18nKey: "data:view_pivot.link.description",
        values: {
          child: pivot.baseTable,
          parent: pivot.pivotTable,
          link: getPivotDisplayValue(pivot)
        },
        components: {
          Code: /* @__PURE__ */ jsxRuntimeExports.jsx(Code, {})
        }
      }
    );
  }
  if (pivot.type === "field" && pivot.field === "object_id") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Trans,
      {
        t: t2,
        i18nKey: "data:view_pivot.self_link.description",
        values: { table: pivot.baseTable },
        components: {
          Code: /* @__PURE__ */ jsxRuntimeExports.jsx(Code, {})
        }
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Trans,
    {
      t: t2,
      i18nKey: "data:view_pivot.field.description",
      values: { table: pivot.baseTable, field: pivot.field },
      components: {
        Code: /* @__PURE__ */ jsxRuntimeExports.jsx(Code, {})
      }
    }
  );
}
function CasePivotValues({
  pivotValues
}) {
  const { i18n } = useTranslation(casesI18n);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-[repeat(2,max-content)] items-center gap-sm", children: pivotValues.map(({ pivot, value }) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Tag,
        {
          size: "big",
          color: pivot.type === "field" ? "grey" : "purple",
          className: "col-start-1 flex flex-row gap-sm",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1", children: pivot.type }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              HovercardProvider,
              {
                showTimeout: 0,
                hideTimeout: 0,
                placement: i18n.dir() === "ltr" ? "right" : "left",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    HovercardAnchor,
                    {
                      tabIndex: -1,
                      className: clsx(
                        "cursor-pointer transition-colors",
                        pivot.type === "field" && "text-grey-disabled hover:text-grey-secondary",
                        pivot.type === "link" && "hover:text-purple-primary text-purple-disabled"
                      ),
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "tip", className: "size-5" })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Hovercard,
                    {
                      portal: true,
                      gutter: 16,
                      className: "bg-surface-card border-grey-border flex w-fit rounded-sm border p-sm shadow-md",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(PivotDetails, { pivot })
                    }
                  )
                ]
              }
            )
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CopyToClipboardButton, { toCopy: value, className: "bg-surface-card", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s line-clamp-1 max-w-40 font-normal", children: value }) })
    ] }, pivot.id);
  }) });
}
const QueryObjectDetail = ({ query }) => {
  const { getEntityName } = useEntityName();
  const parsed = reactExports.useMemo(
    () => Object.entries(query.properties).map(([k, v]) => [k, parseUnknownData(v)]),
    [query.properties]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-s text-grey-primary bg-grey-background-light grid grid-cols-[max-content_1fr] gap-md gap-x-4 break-all rounded-lg p-md mb-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "type" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: getEntityName(query.schema) }),
    parsed.map(([property, data]) => /* @__PURE__ */ jsxRuntimeExports.jsxs(reactExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: property }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FormatData, { data })
    ] }, property))
  ] });
};
function ScreeningQueryDetail({
  request,
  initialQuery
}) {
  const { t: t2 } = useTranslation(screeningsI18n);
  const processedQueries = Object.values(request.queries);
  const hasInitialQuery = Array.isArray(initialQuery) && initialQuery.length > 0;
  const [activeTab, setActiveTab] = reactExports.useState("preprocessed");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { children: [
      hasInitialQuery && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          className: tabClassName,
          "data-status": activeTab === "initial" ? "active" : void 0,
          onClick: () => setActiveTab("initial"),
          children: t2("screenings:initial_query")
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          className: tabClassName,
          "data-status": activeTab === "preprocessed" ? "active" : void 0,
          onClick: () => setActiveTab("preprocessed"),
          children: !hasInitialQuery ? t2("screenings:query") : t2("screenings:processed_query")
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-sm", children: [
      activeTab === "initial" && hasInitialQuery && /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: initialQuery.map((q, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(QueryObjectDetail, { query: q }, i)) }),
      activeTab === "preprocessed" && /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: processedQueries.map((q, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(QueryObjectDetail, { query: q }, i)) })
    ] })
  ] });
}
function MatchResult({ entity }) {
  const { t: t2 } = useTranslation(screeningsI18n);
  const entitySchema = entity.schema.toLowerCase();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-s bg-grey-background-light flex items-center rounded-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm p-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "max-w-60 truncate font-semibold", children: entity.caption }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t2(`screenings:entity.schema.${entitySchema}`, { defaultValue: entitySchema }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: "grey", className: "shrink-0", children: t2("screenings:match.similarity", {
      percent: Math.round(entity.score * 100)
    }) })
  ] }) });
}
function RefineSearchModal({
  open,
  screeningId,
  screening,
  onRefineSuccess: _onRefineSuccess,
  onClose: _onClose
}) {
  const { t: t2 } = useTranslation(screeningsI18n);
  const formValuesRef = reactExports.useRef(null);
  const onClose = useCallbackRef(_onClose);
  const onRefineSuccess = useCallbackRef(_onRefineSuccess);
  const [searchResults, setSearchResults] = reactExports.useState(null);
  const searchMutation = useSearchScreeningMatchesMutation();
  const refineMutation = useRefineScreeningMutation();
  const form = useForm({
    defaultValues: {
      screeningId,
      fields: {}
    },
    validators: {
      onChange: refineSearchSchema
    },
    onSubmit: ({ value }) => {
      formValuesRef.current = value;
      searchMutation.mutateAsync(value).then((data) => {
        setSearchResults(data);
      }).catch(() => {
        zt.error(t2("common:errors.unknown"));
      });
    }
  });
  const entityType = useStore(form.store, (state) => state.values.entityType);
  const additionalFields = entityType ? SEARCH_ENTITIES[entityType].fields : [];
  const onSearchEntityChange = ({ value }) => {
    if (value) {
      form.setFieldValue("fields", setAdditionalFields(SEARCH_ENTITIES[value].fields, form.state.values.fields));
    }
  };
  const handleBackToSearch = () => {
    setSearchResults(null);
  };
  const handleRefine = () => {
    if (formValuesRef.current) {
      refineMutation.mutateAsync(formValuesRef.current).then((data) => {
        onRefineSuccess(data.id);
        onClose();
      });
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Modal.Root,
    {
      open,
      onOpenChange: (isOpen) => {
        if (!isOpen) onClose();
      },
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Modal.Content,
        {
          fixedHeight: !searchResults,
          size: "medium",
          className: clsx({ "h-[80vh]": !searchResults }, "max-h-[80vh]"),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: t2("screenings:refine_modal.title") }),
            searchResults ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-xl overflow-y-scroll p-lg", children: searchResults.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t2("screenings:refine_modal.result_label"), children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex grow flex-col gap-sm", children: searchResults.map((match) => {
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(MatchResult, { entity: match }, match.id);
                }) }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Callout, { bordered: true, children: t2("screenings:refine_modal.refine_callout") })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t2("screenings:refine_modal.no_match_label") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Callout, { bordered: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col items-start gap-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Trans,
                  {
                    t: t2,
                    i18nKey: "screenings:refine_modal.no_match_callout",
                    components: {
                      Status: /* @__PURE__ */ jsxRuntimeExports.jsx(ScreeningStatusTag, { status: "no_hit", pendingHitCount: 0 })
                    }
                  }
                ) }) })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Footer, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Modal.FooterButton,
                  {
                    variant: "secondary",
                    label: t2("screenings:refine_modal.back_search"),
                    onClick: handleBackToSearch
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Modal.FooterButton,
                  {
                    label: t2("screenings:refine_modal.apply_search"),
                    onClick: handleRefine,
                    disabled: searchResults.length > (screening.request?.limit ?? Infinity),
                    isLoading: refineMutation.isPending
                  }
                )
              ] })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit(form), className: "contents", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full flex-col gap-lg overflow-y-scroll p-xl", children: [
                screening.request ? /* @__PURE__ */ jsxRuntimeExports.jsx(SearchInput, { request: screening.request }) : null,
                /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "entityType", listeners: { onChange: onSearchEntityChange }, children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t2("screenings:search_entity_type"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(EntitySelect, { name: field.name, value: field.state.value, onChange: field.handleChange }) }) }),
                additionalFields.map((field) => /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: `fields.${field}`, children: (formField) => /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t2(`screenings:entity.property.${field}`), children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    name: formField.name,
                    value: formField.state.value,
                    onChange: (e2) => formField.handleChange(e2.target.value),
                    className: "grow"
                  }
                ) }) }, field))
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Footer, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { isCloseButton: true, label: t2("common:cancel") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(form.Subscribe, { selector: (state) => [state.isPristine, state.canSubmit, state.isSubmitting], children: ([isPristine, canSubmit, isSubmitting]) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Modal.FooterButton,
                  {
                    label: isSubmitting ? "..." : t2("screenings:refine_modal.test_search"),
                    type: "submit",
                    disabled: isPristine || !canSubmit,
                    isLoading: isSubmitting
                  }
                ) })
              ] })
            ] })
          ]
        }
      )
    }
  );
}
function Field({ label, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-sm", children })
  ] });
}
function EntitySelect({ name, value, onChange }) {
  const { t: t2 } = useTranslation(screeningsI18n);
  const schemas = t$3(SEARCH_ENTITIES);
  const lowerCasedSchema = value?.toLowerCase();
  const handleChange = (v) => {
    if (v) {
      onChange(v);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Select.Root, { name, value, onValueChange: handleChange, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Select.Trigger, { className: "grow", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Select.Value, { align: "start", placeholder: "Select", children: lowerCasedSchema ? t2(`screenings:refine_modal.schema.${lowerCasedSchema}`) : "" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Select.Arrow, {})
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Select.Content, { className: "min-w-(--radix-select-trigger-width)", align: "start", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Select.Viewport, { children: schemas.map((schema) => {
      const schemaKey = schema.toLowerCase();
      const fieldForSchema = SEARCH_ENTITIES[schema].fields;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Select.Item, { value: schema, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm p-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "plus", className: "size-5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t2(`screenings:refine_modal.schema.${schemaKey}`) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-grey-secondary text-xs", children: [
            t2("screenings:refine_modal.search_by"),
            " ",
            fieldForSchema.map((f) => t2(`screenings:entity.property.${f}`)).join(", ")
          ] })
        ] })
      ] }) }, schema);
    }) }) })
  ] });
}
function SearchInput({ request }) {
  const { t: t$32 } = useTranslation(["screenings"]);
  const searchInputs = t(
    t$2(request.queries),
    t$1((query) => t$2(query.properties)),
    n()
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: t$32("screenings:refine_modal.search_input_label"), children: searchInputs.map((input, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-grey-border flex items-center gap-sm rounded-sm border p-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-grey-background size-6 rounded-xs p-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "string", className: "size-4" }) }),
    input
  ] }, i)) });
}
function ScreeningReviewSection({ screening, onRefineSuccess }) {
  const { t: t2 } = useTranslation(screeningsI18n);
  const [isRefining, setIsRefining] = reactExports.useState(false);
  const matchesToReviewCount = n$1(screening.matches, (m) => m.status === "pending").length;
  const hasError = isScreeningError(screening);
  const isRefinable = !isScreeningReviewCompleted(screening);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-fit flex-2 flex-col gap-lg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-m font-semibold", children: t2("screenings:potential_matches") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-secondary text-s", children: t2("screenings:callout.needs_review", {
          toReview: matchesToReviewCount,
          totalMatches: screening.matches.length
        }) }),
        isRefinable ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "ms-auto", variant: "secondary", onClick: () => setIsRefining(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "restart-alt", className: "size-5" }),
          t2("screenings:refine_search")
        ] }) : null
      ] }),
      M(screening).when(isScreeningError, (sc) => /* @__PURE__ */ jsxRuntimeExports.jsx(ScreeningErrors, { screening: sc })).when(
        (sc) => sc.status === "in_review" && sc.partial,
        (sc) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-s bg-red-background text-red-primary flex items-center gap-sm rounded-sm p-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "error", className: "size-5 shrink-0" }),
          t2("screenings:callout.needs_refine", {
            matchCount: sc.request.limit
          })
        ] })
      ).when(
        (sc) => sc.status === "in_review",
        () => /* @__PURE__ */ jsxRuntimeExports.jsx(Callout, { bordered: true, children: t2("screenings:callout.review") })
      ).otherwise(() => null)
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-sm", children: screening.matches.map((screeningMatch) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      MatchCard,
      {
        screening,
        match: screeningMatch,
        unreviewable: hasError,
        defaultOpen: screening.matches.length === 1
      },
      screeningMatch.id
    )) }),
    isRefining ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      RefineSearchModal,
      {
        screeningId: screening.id,
        screening,
        open: isRefining,
        onClose: () => setIsRefining(false),
        onRefineSuccess
      }
    ) : null
  ] });
}
function usePivotValues(pivotValues, pivots) {
  const value = reactExports.useMemo(() => {
    return t(
      pivotValues,
      t$4(({ id, value: value2 }) => {
        const pivot = pivots.find((p) => p.id === id);
        if (!pivot || !value2) {
          return null;
        }
        return { pivot, value: value2 };
      }),
      n$1(e)
    );
  }, [pivotValues, pivots]);
  return value;
}
function CaseSanctionsHitsPage() {
  const {
    t: t2
  } = useTranslation(casesI18n);
  const {
    caseDetail,
    screening,
    decision,
    dataModel,
    pivots
  } = useLoaderData({
    from: "/_app/_builder/cases/$caseId/d/$decisionId/screenings/$screeningId"
  });
  const pivotValues = usePivotValues(decision.pivotValues, pivots);
  const [objectLink, setObjectLink] = reactExports.useState(null);
  const navigate = useAgnosticNavigation();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-surface-card border-grey-border grid grid-cols-[max-content_2fr_1fr_repeat(3,max-content)] gap-x-6 gap-y-2 rounded-md border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-full flex flex-row gap-3xl p-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(ScreeningReviewSection, { screening, onRefineSuccess: (screeningId) => {
      navigate(`/cases/${fromUUIDtoSUUID(caseDetail.id)}/d/${fromUUIDtoSUUID(decision.id)}/screenings/${fromUUIDtoSUUID(screeningId)}`);
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sticky top-0 flex h-fit flex-1 flex-col gap-lg", children: [
      screening.request ? /* @__PURE__ */ jsxRuntimeExports.jsx(ScreeningQueryDetail, { request: screening.request, initialQuery: screening.initialQuery }) : null,
      pivotValues.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-fit flex-col gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-start-2 row-start-1 flex flex-row items-center justify-between gap-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-primary text-xs font-medium first-letter:capitalize", children: t2("cases:case_detail.pivot_values") }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CasePivotValues, { pivotValues })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-fit flex-col gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-row items-center justify-between gap-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-primary text-xs font-medium first-letter:capitalize", children: t2("cases:case_detail.trigger_object") }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CaseDetailTriggerObject, { className: "h-fit max-h-[50dvh] overflow-auto", dataModel, triggerObject: decision.triggerObject, triggerObjectType: decision.triggerObjectType, onLinkClicked: (tableName, objectId) => setObjectLink({
          tableName,
          objectId
        }) }),
        objectLink ? /* @__PURE__ */ jsxRuntimeExports.jsx(IngestedObjectDetailModal, { dataModel, tableName: objectLink.tableName, objectId: objectLink.objectId, onClose: () => setObjectLink(null) }) : null
      ] })
    ] })
  ] }) });
}
export {
  CaseSanctionsHitsPage as component
};
