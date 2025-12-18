import { r as reactExports, a1 as useMatches, R as jsxRuntimeExports, ae as Outlet, O as useRouter } from "../server.js";
import { u as useDataModelQuery } from "./get-data-model-CAY4ZWaH.js";
import { l as listRulesetsFn } from "./scoring-NycAI253.js";
import { u as useQuery } from "./useQuery-B7mL_evE.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
import { u as useUpdateScoringRulesetMutation, S as ScoringLevelThresholds } from "./ScoringLevelThresholds-bJ2AGLf_.js";
import { u as updateScoringRulesetPayloadSchema } from "./user-scoring-BwKPLq1i.js";
import { h as handleSubmit } from "./form-D2XmDKeG.js";
import { u as useTranslation, T as Typo, B as Button, d_ as Tabs, d$ as tabClassName, c as createSimpleContext, dZ as SelectV2, dD as Tooltip, e as Icon, e0 as NumberInput } from "./format-NPGUXq-g.js";
import { u as useForm } from "./useForm-BwABQKAs.js";
import { a as useParams } from "./short-uuid-MIi3jWzx.js";
import { P as Page, L as Link, b as useNavigate } from "./router-vb7i5euz.js";
import { z as zt } from "./CopyToClipboardButton-CJNJJful.js";
import { P as Panel, a as PanelSharpFactory } from "./Panel-kj8Z2GDk.js";
import { S as Spinner } from "./Spinner-GK6cEAdR.js";
import { aN as SECONDS_PER_UNIT } from "./services-middleware-DR8Hua1Y.js";
const useListScoringRulesetsQuery = () => {
  const listRulesets = useServerFn(listRulesetsFn);
  return useQuery({
    queryKey: ["scoring", "rulesets"],
    queryFn: async () => {
      const result = await listRulesets();
      return result;
    }
  });
};
const CreateRulesetPanelContext = createSimpleContext(
  "CreateRulesetPanel"
);
function ScoringSectionLayout({ maxRiskLevel }) {
  const { t } = useTranslation(["user-scoring"]);
  const [panelOpen, setPanelOpen] = reactExports.useState(false);
  const { data, isPending } = useListScoringRulesetsQuery();
  const matches = useMatches();
  const showCreateButton = matches.some(
    (m) => m.staticData?.showCreateRulesetButton
  );
  const rulesets = data?.rulesets ?? [];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(CreateRulesetPanelContext.Provider, { value: { open: panelOpen, setOpen: setPanelOpen }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Page.Main, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Page.Content, { width: "readable", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typo, { variant: "title1", children: t("user-scoring:section.title") }),
      showCreateButton ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "secondary", onClick: () => setPanelOpen(true), children: t("user-scoring:section.configure_button") }) : null
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/user-scoring/overview", className: tabClassName, children: t("user-scoring:section.tab_overview") }),
      isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full flex items-center px-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, { className: "size-4" }) }) : rulesets.map((ruleset) => /* @__PURE__ */ jsxRuntimeExports.jsx(RulesetTab, { ruleset }, ruleset.recordType))
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}),
    maxRiskLevel ? /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Root, { open: panelOpen, onOpenChange: setPanelOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScoringRulesetCreationPanel, { maxRiskLevel }) }) : null
  ] }) }) });
}
function RulesetTab({ ruleset }) {
  const params = useParams({ strict: false });
  const isActive = params.recordType === ruleset.recordType;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Link,
    {
      to: "/user-scoring/$recordType/$version",
      params: {
        recordType: ruleset.recordType,
        version: ruleset.status === "draft" ? "draft" : ruleset.version.toString()
      },
      className: tabClassName,
      activeProps: {},
      inactiveProps: {},
      "data-status": isActive ? "active" : void 0,
      children: ruleset.name
    }
  );
}
function DurationDaysField({
  value,
  onChange
}) {
  const { t } = useTranslation(["common"]);
  const [days, setDays] = reactExports.useState(value !== void 0 ? value / SECONDS_PER_UNIT.days : 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      NumberInput,
      {
        className: "max-w-15",
        borderColor: days < 1 ? "redfigma-47" : "greyfigma-90",
        value: days,
        onChange: (v) => {
          setDays(v);
          onChange(v > 0 ? v * SECONDS_PER_UNIT.days : void 0);
        }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-secondary", children: t("common:duration_unit.days") })
  ] });
}
function ScoringRulesetCreationPanel({ maxRiskLevel }) {
  const { t } = useTranslation(["common", "user-scoring"]);
  const router = useRouter();
  const navigate = useNavigate();
  const updateScoringRulesetMutation = useUpdateScoringRulesetMutation();
  const dataModelQuery = useDataModelQuery();
  const panelSharp = PanelSharpFactory.useSharp();
  const form = useForm({
    defaultValues: {
      name: "",
      recordType: "",
      thresholds: Array.from({ length: maxRiskLevel - 1 }, (_, i) => (i + 1) * 10),
      rules: [],
      cooldownSeconds: 90 * SECONDS_PER_UNIT.days,
      scoringIntervalSeconds: 180 * SECONDS_PER_UNIT.days
    },
    validators: {
      onChange: updateScoringRulesetPayloadSchema
    },
    onSubmit: async ({ formApi, value }) => {
      if (formApi.state.isValid) {
        try {
          let ruleset = await updateScoringRulesetMutation.mutateAsync(value);
          zt.success(t("common:success.save"));
          panelSharp.actions.close();
          await router.invalidate();
          if (ruleset) {
            navigate({
              to: "/user-scoring/$recordType/$version",
              params: {
                recordType: ruleset.recordType,
                version: "draft"
              }
            });
          }
        } catch {
          zt.error(t("common:errors.unknown"));
        }
      }
    }
  });
  const entityOptions = (dataModelQuery.data?.dataModel ?? []).map((t2) => ({
    label: t2.name,
    value: t2.name
  }));
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Container, { size: "small", children: /* @__PURE__ */ jsxRuntimeExports.jsx("form", { className: "contents", onSubmit: handleSubmit(form), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel.Content, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Header, { children: t("user-scoring:section.create_panel.title") }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "recordType", children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        SelectV2,
        {
          placeholder: t("user-scoring:section.create_panel.entity_placeholder"),
          value: field.state.value,
          options: entityOptions,
          onChange: field.handleChange,
          className: "w-full"
        }
      ) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
        t("user-scoring:section.create_panel.general_settings"),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-grey-border rounded-md p-md grid grid-cols-[1fr_repeat(3,_auto)] gap-x-sm gap-y-md", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-subgrid col-span-full items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s", children: t("user-scoring:section.create_panel.lower_score_duration") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "cooldownSeconds", children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsx(DurationDaysField, { value: field.state.value, onChange: field.handleChange }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip.Default, { content: t("user-scoring:section.create_panel.lower_score_duration_tooltip"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "helpcenter", className: "size-5 text-grey-secondary" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-subgrid col-span-full items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s", children: t("user-scoring:section.create_panel.recalculation_duration") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "scoringIntervalSeconds", children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsx(DurationDaysField, { value: field.state.value, onChange: field.handleChange }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip.Default, { content: t("user-scoring:section.create_panel.recalculation_duration_tooltip"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "helpcenter", className: "size-5 text-grey-secondary" }) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "thresholds", children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        ScoringLevelThresholds,
        {
          maxRiskLevel,
          thresholds: field.state.value,
          onThresholdsChange: field.handleChange
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel.Footer, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Panel.FooterButton,
        {
          variant: "secondary",
          onClick: () => {
            panelSharp.actions.close();
          },
          label: t("user-scoring:section.create_panel.cancel")
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(form.Subscribe, { selector: (s) => [s.canSubmit, s.isSubmitting], children: ([canSubmit, isSubmitting]) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        Panel.FooterButton,
        {
          disabled: !canSubmit,
          isLoading: isSubmitting,
          type: "submit",
          label: t("user-scoring:section.create_panel.validate")
        }
      ) })
    ] })
  ] }) }) });
}
export {
  CreateRulesetPanelContext as C,
  ScoringSectionLayout as S,
  useListScoringRulesetsQuery as u
};
