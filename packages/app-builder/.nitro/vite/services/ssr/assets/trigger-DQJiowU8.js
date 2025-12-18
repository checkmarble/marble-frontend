import { R as jsxRuntimeExports, r as reactExports } from "../server.js";
import { C as Callout } from "./Callout-DX4NBXlG.js";
import { C as CopyToClipboardButton, z as zt } from "./CopyToClipboardButton-CJNJJful.js";
import { u as useTranslation, q as useFormatLanguage, eg as Checkbox, s as Trans, dZ as SelectV2, fr as formatSchedule, eb as Collapsible, B as Button, e as Icon } from "./format-NPGUXq-g.js";
import { ab as scenarioI18n, aV as saveTriggerFn, aW as Route, aq as useDetectionScenarioData } from "./router-vb7i5euz.js";
import { b as AstBuilder } from "./index-DCH5hwXA.js";
import { E as ExternalLink } from "./ExternalLink-CG_77QdX.js";
import { E as EvaluationErrors } from "./ScenarioValidationError-DADb1taj.js";
import { a_ as NewUndefinedAstNode, cj as isUndefinedAstNode, dk as NewEmptyTriggerAstNode } from "./services-middleware-DR8Hua1Y.js";
import { u as useMutation } from "./useMutation-C5oG90Zs.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
import { g as executeAScenarioDocHref, e as createDecisionDocHref } from "./documentation-href-uAe88WFl.js";
import { u as useEditorMode } from "./editor-mode-BAuR_YJJ.js";
import { u as useGetScenarioErrorMessage } from "./scenario-validation-error-messages-CB3GcwJ8.js";
import { L as Label } from "./index-x7n7VJTa.js";
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
import "./short-uuid-MIi3jWzx.js";
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
import "./use-callback-ref-AfyBSz95.js";
import "./useQuery-B7mL_evE.js";
import "./useBaseQuery-CMboOtTR.js";
import "./dataTypeSchema-DvqJgdgd.js";
import "./isArray-gJc74O_I.js";
import "./join-BeQTfqAC.js";
import "./index-CtZTigeT.js";
import "./index-BF4TC3go.js";
import "./index-C_WgunUr.js";
import "./index-CR1bHmei.js";
import "./display-TKj7AN5a.js";
import "./flatMap-CbF5uMEQ.js";
import "./Nudge-C1ux5IUa.js";
import "./hovercard-provider-BchUL2eY.js";
import "./create-navigation-option-DrtWhyLE.js";
import "./data-fdG1PpsD.js";
import "./data-BFm2FCTm.js";
import "./organization-detail-YGkE0F4y.js";
import "./create-context-CYc8deix.js";
import "./isNonNullish-DgEqPJBU.js";
import "node:crypto";
const editableCron = [
  {
    frequency: "daily",
    regex: new RegExp(/^0 (?<scheduleDetail>([0-9]|1[0-9]|[2][0-3])) \* \* \*$/)
  },
  {
    frequency: "weekly",
    regex: new RegExp(/^0 0 \* \* (?<scheduleDetail>[0-6])$/)
  },
  {
    frequency: "monthly",
    regex: new RegExp(/^0 0 (?<scheduleDetail>([1-9]|[12][0-9]|3[01])) \* \*$/)
  }
];
function isEditableScheduleOption(schedule) {
  if (!schedule) return true;
  for (const { regex } of editableCron) {
    if (regex.test(schedule)) {
      return true;
    }
  }
  return false;
}
function adaptScheduleOption(schedule) {
  for (const { frequency, regex } of editableCron) {
    const match = schedule.trim().match(regex);
    const scheduleDetail = match?.groups?.["scheduleDetail"];
    if (scheduleDetail) {
      return {
        isScenarioScheduled: true,
        frequency,
        scheduleDetail
      };
    }
  }
  return {
    isScenarioScheduled: false,
    frequency: "daily",
    scheduleDetail: "0"
  };
}
function adaptScheduleOptionToCron({ isScenarioScheduled, frequency, scheduleDetail }) {
  if (!isScenarioScheduled) {
    return "";
  }
  switch (frequency) {
    case "daily":
      return `0 ${scheduleDetail} * * *`;
    case "weekly":
      return `0 0 * * ${scheduleDetail}`;
    case "monthly":
      return `0 0 ${scheduleDetail} * *`;
  }
}
const textForFrequency = {
  daily: "scenarios:trigger.schedule_scenario.schedule_detail_daily_label",
  weekly: "scenarios:trigger.schedule_scenario.schedule_detail_weekly_label",
  monthly: "scenarios:trigger.schedule_scenario.schedule_detail_monthly_label"
};
function ScheduleOptionEditor({
  scheduleOption,
  setScheduleOption
}) {
  const { t } = useTranslation(scenarioI18n);
  const language = useFormatLanguage();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-s flex items-center gap-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Checkbox,
        {
          id: "scheduleScenario",
          name: "scheduleScenario",
          defaultChecked: scheduleOption.isScenarioScheduled,
          onCheckedChange: () => setScheduleOption({
            ...scheduleOption,
            isScenarioScheduled: !scheduleOption.isScenarioScheduled
          })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "scheduleScenario", children: t("scenarios:trigger.schedule_scenario.option") })
    ] }),
    scheduleOption.isScenarioScheduled ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-s flex items-center gap-sm", children: [
        t("scenarios:trigger.schedule_scenario.frequency_label"),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          ScheduleFrequencySelect,
          {
            onChange: (frequency) => {
              const scheduleDetail = getScheduleDetailOptions(frequency, language)[0];
              if (!scheduleDetail) return;
              setScheduleOption({
                ...scheduleOption,
                frequency,
                scheduleDetail
              });
            },
            value: scheduleOption.frequency
          }
        ),
        t(textForFrequency[scheduleOption.frequency]),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          ScheduleDetailSelect,
          {
            frequency: scheduleOption.frequency,
            onChange: (value) => setScheduleOption({ ...scheduleOption, scheduleDetail: value }),
            value: scheduleOption.scheduleDetail
          }
        )
      ] }),
      scheduleOption.frequency === "monthly" && ["29", "30", "31"].includes(scheduleOption.scheduleDetail) ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-s text-purple-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Trans,
        {
          t,
          i18nKey: "scenarios:trigger.schedule_scenario.monthly_warning",
          values: { scheduleDetail: scheduleOption.scheduleDetail }
        }
      ) }) : null
    ] }) : null
  ] });
}
const scheduleFrequencyOptions = [
  {
    value: "daily",
    labelTKey: "scenarios:trigger.schedule_scenario.frequency_daily"
  },
  {
    value: "weekly",
    labelTKey: "scenarios:trigger.schedule_scenario.frequency_weekly"
  },
  {
    value: "monthly",
    labelTKey: "scenarios:trigger.schedule_scenario.frequency_monthly"
  }
];
const ScheduleFrequencySelect = ({
  value,
  onChange
}) => {
  const { t } = useTranslation(scenarioI18n);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    SelectV2,
    {
      value,
      onChange,
      placeholder: "...",
      options: scheduleFrequencyOptions.map(({ value: value2, labelTKey }) => ({
        label: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-primary", children: t(labelTKey) }),
        value: value2
      }))
    }
  );
};
const ScheduleDetailSelect = ({
  value,
  onChange,
  frequency
}) => {
  const {
    i18n: { language }
  } = useTranslation(scenarioI18n);
  const scheduleDetailOptions = getScheduleDetailOptions(frequency, language);
  const displayNameForFrequency = (frequency2) => (option) => {
    switch (frequency2) {
      case "daily":
        return option.padStart(2, "0") + ":00";
      case "weekly":
        return getWeekDayName(option, language);
      case "monthly":
        return option;
    }
  };
  const displayName = displayNameForFrequency(frequency);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    SelectV2,
    {
      value,
      onChange,
      placeholder: "...",
      options: scheduleDetailOptions.map((option) => ({
        label: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-primary", children: displayName(option) }),
        value: option
      }))
    }
  );
};
const getScheduleDetailOptions = (frequency, locale) => {
  switch (frequency) {
    case "daily":
      return dailyScheduleOptions;
    case "weekly":
      return weeklyScheduleOptions(locale);
    case "monthly":
      return monthlyScheduleOptions;
  }
};
const dailyScheduleOptions = Array.from({ length: 24 }, (_, i) => `${i}`);
const weekDays = Array.from({ length: 7 }, (_, i) => `${i}`);
const getWeekInfo = (locale) => {
  const intl = new Intl.Locale(locale);
  return (
    // @ts-expect-error Property 'weekInfo' does not exist on type 'Locale'.
    intl.weekInfo ?? // @ts-expect-error Property 'getWeekInfo' does not exist on type 'Locale'.
    intl.getWeekInfo?.() ?? { firstDay: 1, weekend: [6, 7], minimalDays: 4 }
  );
};
const weeklyScheduleOptions = (locale) => {
  const weekInfo = getWeekInfo(locale);
  if (weekInfo.firstDay === 1) {
    return [...weekDays.slice(1), ...weekDays.slice(0, 1)];
  }
  return weekDays;
};
const monthlyScheduleOptions = Array.from({ length: 31 }, (_, i) => `${i + 1}`);
const getWeekDayName = (option, locale, format) => {
  const formatter = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    timeZone: "UTC"
  });
  const day = parseInt(option) + 1;
  const date = /* @__PURE__ */ new Date(`2017-01-0${day}T00:00:00+00:00`);
  return formatter.format(date);
};
const ScheduleOptionViewer = ({ schedule }) => {
  const {
    t,
    i18n: { language }
  } = useTranslation(scenarioI18n);
  const formattedSchedule = reactExports.useMemo(() => {
    try {
      return formatSchedule(schedule, {
        language,
        throwExceptionOnParseError: true
      });
    } catch (_e) {
      return void 0;
    }
  }, [language, schedule]);
  if (!formattedSchedule) return t("scenarios:no_scheduled");
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Trans,
    {
      t,
      i18nKey: "scenarios:scheduled",
      components: {
        ScheduleLocale: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: "bold" } })
      },
      values: {
        schedule: formattedSchedule
      }
    }
  );
};
function ScheduleOption({
  schedule,
  setSchedule,
  viewOnly
}) {
  if (!viewOnly && isEditableScheduleOption(schedule)) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      ScheduleOptionEditor,
      {
        scheduleOption: adaptScheduleOption(schedule),
        setScheduleOption: (scheduleOption) => {
          setSchedule(adaptScheduleOptionToCron(scheduleOption));
        }
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ScheduleOptionViewer, { schedule });
}
const useSaveTriggerMutation = () => {
  const saveTrigger = useServerFn(saveTriggerFn);
  return useMutation({
    mutationFn: (payload) => saveTrigger({ data: payload })
  });
};
function Trigger() {
  const {
    t
  } = useTranslation([...scenarioI18n, "common"]);
  const {
    scenarioIteration,
    scenarioValidation
  } = Route.useRouteContext();
  const [validationErrors, setValidationErrors] = reactExports.useState(scenarioValidation.trigger.errors);
  const saveTriggerMutation = useSaveTriggerMutation();
  const builderOptions = Route.useLoaderData();
  const editorMode = useEditorMode();
  const [schedule, setSchedule] = reactExports.useState(scenarioIteration.schedule ?? "");
  const {
    currentScenario
  } = useDetectionScenarioData();
  const getScenarioErrorMessage = useGetScenarioErrorMessage();
  const [trigger, setTrigger] = reactExports.useState(scenarioIteration.trigger ?? NewUndefinedAstNode());
  const isTriggerNull = isUndefinedAstNode(trigger);
  const nodeStoreRef = reactExports.useRef(null);
  const handleSave = async () => {
    const node = nodeStoreRef.current ? nodeStoreRef.current.select((s) => s.$node).peek() : NewUndefinedAstNode();
    try {
      await saveTriggerMutation.mutateAsync({
        iterationId: scenarioIteration.id,
        schedule,
        astNode: node
      });
      zt.success(t("common:success.save"));
    } catch {
      zt.error(t("common:errors.unknown"));
    }
  };
  const handleAddTrigger = () => {
    setTrigger(NewEmptyTriggerAstNode());
  };
  const handleDeleteTrigger = () => {
    setTrigger(NewUndefinedAstNode());
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Collapsible.Container, { className: "bg-surface-card max-w-3xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Collapsible.Title, { children: t("scenarios:trigger.run_scenario.title") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Collapsible.Content, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trans, { t, i18nKey: "scenarios:trigger.run_scenario.description", components: {
          DocLink: /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { href: executeAScenarioDocHref })
        } }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("ol", { className: "list-outside list-decimal space-y-md ps-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Trans, { t, i18nKey: "scenarios:trigger.run_scenario.description.api_execution", components: {
              DocLink: /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { href: createDecisionDocHref })
            } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "list-outside space-y-xs ps-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trans, { t, i18nKey: "scenarios:trigger.run_scenario.description.api_execution.scenario_id", components: {
              ScenarioIdLabel: /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "select-none" }),
              ScenarioIdValue: /* @__PURE__ */ jsxRuntimeExports.jsx(CopyToClipboardButton, { toCopy: scenarioIteration.scenarioId, className: "inline-flex" })
            }, values: {
              scenarioId: scenarioIteration.scenarioId
            } }) }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Trans, { t, i18nKey: "scenarios:trigger.run_scenario.description.batch_execution" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "list-outside space-y-xs ps-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScheduleOption, { schedule, setSchedule, viewOnly: editorMode === "view" }) }) })
          ] })
        ] })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Collapsible.Container, { className: "bg-surface-card max-w-3xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Collapsible.Title, { children: t("scenarios:trigger.trigger_object.title") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Collapsible.Content, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Callout, { variant: "outlined", className: "mb-md lg:mb-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-wrap", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trans, { t, i18nKey: "scenarios:trigger.trigger_object.callout", components: {
          DocLink: /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { href: executeAScenarioDocHref })
        } }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm lg:gap-md", children: [
          isTriggerNull ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-blue-58 bg-blue-96 text-blue-58 flex items-center rounded-sm border p-sm dark:bg-transparent", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trans, { t, i18nKey: "scenarios:trigger.trigger_object.no_trigger", values: {
            objectType: currentScenario.triggerObjectType
          } }) }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(AstBuilder.Provider, { scenarioId: currentScenario.id, initialData: {
            ...builderOptions
          }, mode: editorMode, children: /* @__PURE__ */ jsxRuntimeExports.jsx(AstBuilder.Root, { node: trigger, onStoreChange: (nodeStore) => {
            nodeStoreRef.current = nodeStore;
          }, onValidationUpdate: (validation) => {
            setValidationErrors(validation.errors);
          }, returnType: "bool" }) }),
          editorMode === "edit" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row-reverse items-center justify-between gap-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
              isTriggerNull ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "secondary", onClick: handleAddTrigger, children: t("scenarios:trigger.trigger_object.add_trigger") }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "secondary", onClick: handleDeleteTrigger, children: t("scenarios:trigger.trigger_object.delete_trigger") }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "primary", type: "submit", onClick: handleSave, disabled: saveTriggerMutation.isPending, children: [
                saveTriggerMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "spinner", className: "size-4" }) : null,
                t("common:save")
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(EvaluationErrors, { errors: validationErrors.filter((error) => error != "TRIGGER_CONDITION_REQUIRED").map(getScenarioErrorMessage) })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(EvaluationErrors, { errors: scenarioValidation.trigger.errors.filter((error) => error != "TRIGGER_CONDITION_REQUIRED").map(getScenarioErrorMessage) })
        ] })
      ] })
    ] })
  ] });
}
export {
  Trigger as component
};
