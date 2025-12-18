import { R as jsxRuntimeExports, r as reactExports, ae as Outlet } from "../server.js";
import { C as Callout } from "./Callout-DX4NBXlG.js";
import { aJ as deactivateIterationFn, aK as activateIterationFn, aL as commitIterationFn, aM as prepareIterationFn, aN as getPublicationPreparationStatusFn, aO as getRuleSnoozeFn, a1 as decisionsI18n, ab as scenarioI18n, aq as useDetectionScenarioData, aP as useDetectionScenarioIterationData, aQ as Route, P as Page, aR as VersionSelect, L as Link } from "./router-vb7i5euz.js";
import { d as cn, f as cva, b as clsx, u as useTranslation, e4 as Modal, B as Button, e as Icon, eb as Collapsible, dD as Tooltip, j as Tag, en as useTable, ev as getSortedRowModel, em as getCoreRowModel, ek as Table, el as createColumnHelper, d_ as Tabs, d$ as tabClassName } from "./format-NPGUXq-g.js";
import { n as navigationI18n } from "./Navigation-BesW3Lcl.js";
import { S as ScenarioHeader, C as CreateDraftIteration } from "./ScenarioHeader-Cl_wDUSR.js";
import { u as useLoaderRevalidator } from "./LoaderRevalidatorContext-C9s56i-l.js";
import "./scenarios-8U74nJp4.js";
import { u as useMutation } from "./useMutation-C5oG90Zs.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
import { z as zt } from "./CopyToClipboardButton-CJNJJful.js";
import { u as useQuery } from "./useQuery-B7mL_evE.js";
import { S as Spinner } from "./Spinner-GK6cEAdR.js";
import { S as ScoreOutcomeThresholds } from "./ScoreOutcomeThresholds-Co722Qdl.js";
import { O as OutcomeBadge } from "./OutcomeTag-BH_m80fa.js";
import { u as useEditorMode } from "./editor-mode-BAuR_YJJ.js";
import { dg as hasTriggerErrors, dh as hasRulesErrors, di as hasScreeningsErrors, dj as hasDecisionErrors } from "./services-middleware-DR8Hua1Y.js";
import { h as useParam, i as invariant } from "./short-uuid-MIi3jWzx.js";
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
import "./sharpstate.es-CeF1Mf5b.js";
import "./isNullish-B8pc8Ntu.js";
import "./use-callback-ref-DXzIzfqy.js";
import "./FormErrorOrDescription-DO6Hdfmn.js";
import "./update-scenario-BLeSCsGD.js";
import "./form-D2XmDKeG.js";
import "./array-BFSjnO9c.js";
import "./useForm-BwABQKAs.js";
import "./useBaseQuery-CMboOtTR.js";
import "./create-context-CYc8deix.js";
import "node:crypto";
const colorClassName = cva("", {
  variants: {
    color: {
      purple: "text-purple-primary",
      blue: "text-blue-58",
      green: "text-green-primary",
      yellow: "text-yellow-primary",
      orange: "text-orange-primary",
      red: "text-red-primary",
      grey: "text-grey-primary",
      white: "text-grey-primary"
    }
  },
  defaultVariants: {
    color: "purple"
  }
});
function StepProgressBar({
  steps,
  value,
  color = "purple",
  numbered = true,
  isPending = false,
  className
}) {
  const activeIndex = steps.findIndex((step) => step.key === value);
  const fillPercent = activeIndex < 0 ? 0 : (activeIndex + 1) / steps.length * 100;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("flex w-full flex-col gap-sm", className), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex w-full", children: steps.map((step, index) => {
      const isActive = index <= activeIndex;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "span",
        {
          className: cn(
            "text-s flex-1 text-start font-semibold",
            isActive ? colorClassName({ color }) : "text-grey-placeholder"
          ),
          children: [
            numbered ? `${index + 1}. ` : null,
            step.label
          ]
        },
        step.key
      );
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        role: "progressbar",
        "aria-valuemin": 1,
        "aria-valuemax": steps.length,
        "aria-valuenow": activeIndex + 1,
        className: "bg-grey-border relative h-1 w-full overflow-hidden rounded-full",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: cn(
              "absolute inset-y-0 left-0 rounded-full bg-current transition-[width] duration-500 ease-out",
              colorClassName({ color }),
              isPending && "animate-pulse [animation-duration:2.5s]"
            ),
            style: { width: `${fillPercent}%` }
          }
        )
      }
    )
  ] });
}
function Ping({ className }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: clsx("flex items-center justify-center rounded-full", className), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "animate-ping-slow absolute inline-flex size-full rounded-full bg-current opacity-75" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative inline-flex size-full rounded-full bg-current" })
  ] });
}
const corner_ping = cva("border-grey-white absolute box-content size-[6px] border-2 text-red-primary", {
  variants: {
    position: {
      "top-right": "top-0 end-0",
      "top-left": "top-0 start-0",
      "bottom-right": "bottom-0 end-0",
      "bottom-left": "bottom-0 start-0"
    }
  }
});
function CornerPing({
  children,
  className,
  position
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: clsx("relative", className), children: [
    children,
    /* @__PURE__ */ jsxRuntimeExports.jsx(Ping, { "aria-hidden": "true", className: corner_ping({ position }) })
  ] });
}
const useDeactivateIterationMutation = (scenarioId, iterationId) => {
  const deactivateIteration = useServerFn(deactivateIterationFn);
  return useMutation({
    mutationKey: ["scenarios", "iteration", "deactivate", scenarioId, iterationId],
    mutationFn: async (payload) => deactivateIteration({ data: { ...payload, scenarioId, iterationId } })
  });
};
function DeactivateScenarioVersion({ scenarioId, iterationId }) {
  const { t } = useTranslation(["scenarios"]);
  const [open, setOpen] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Root, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Trigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "flex-1", variant: "destructive", size: "medium", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "stop", className: "size-5" }),
      t("scenarios:deployment_modal.deactivate.button")
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Content, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DeactivateScenarioVersionContent, { scenarioId, iterationId }) })
  ] });
}
function DeactivateScenarioVersionContent({ scenarioId, iterationId }) {
  const { t } = useTranslation(["common", "scenarios"]);
  const deactivateIterationMutation = useDeactivateIterationMutation(scenarioId, iterationId);
  const revalidate = useLoaderRevalidator();
  function handleDeactivate() {
    deactivateIterationMutation.mutateAsync({ stopOperating: true, changeIsImmediate: true }).then(() => {
      zt.success(t("scenarios:deployment_modal.deactivate.success"));
      revalidate();
    }).catch(() => {
      zt.error(t("common:errors.unknown"));
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: t("scenarios:deployment_modal.deactivate.title") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-lg p-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-s flex flex-col gap-md font-medium", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: t("scenarios:deployment_modal.deactivate.confirm") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "flex list-disc flex-col gap-md ps-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: t("scenarios:deployment_modal.deactivate.stop_operating") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: t("scenarios:deployment_modal.deactivate.change_is_immediate") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-grey-disabled text-xs font-medium", children: t("scenarios:deployment_modal.deactivate.helper") })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Footer, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { isCloseButton: true, label: t("common:cancel") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Modal.FooterButton,
        {
          label: t("scenarios:deployment_modal.deactivate.button"),
          onClick: handleDeactivate,
          variant: "destructive",
          leadingIcon: "stop"
        }
      )
    ] })
  ] });
}
const useActivateIterationMutation = (scenarioId, iterationId) => {
  const activateIteration = useServerFn(activateIterationFn);
  return useMutation({
    mutationKey: ["scenarios", "iterations", "activate", scenarioId, iterationId],
    mutationFn: async (payload) => activateIteration({ data: { ...payload, scenarioId, iterationId } })
  });
};
const useCommitIterationMutation = (scenarioId, iterationId) => {
  const commitIteration = useServerFn(commitIterationFn);
  return useMutation({
    mutationKey: ["scenarios", "iterations", "commit", scenarioId, iterationId],
    mutationFn: async (payload) => commitIteration({ data: { ...payload, scenarioId, iterationId } })
  });
};
const usePrepareIterationMutation = (scenarioId, iterationId) => {
  const prepareIteration = useServerFn(prepareIterationFn);
  return useMutation({
    mutationKey: ["scenarios", "iteration", "prepare", scenarioId, iterationId],
    mutationFn: async (payload) => prepareIteration({ data: { ...payload, scenarioId, iterationId } })
  });
};
function usePublicationPreparationStatusQuery(scenarioId, iterationId, options) {
  const getPublicationPreparationStatus = useServerFn(getPublicationPreparationStatusFn);
  return useQuery({
    queryKey: ["scenarios", "iterations", "publicationPreparationStatus", scenarioId, iterationId],
    queryFn: async () => getPublicationPreparationStatus({ data: { scenarioId, iterationId } }),
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval
  });
}
const useRuleSnoozesQuery = (scenarioId, iterationId) => {
  const getRuleSnooze = useServerFn(getRuleSnoozeFn);
  return useQuery({
    queryKey: ["scenarios", "iterations", "ruleSnoozes", scenarioId, iterationId],
    queryFn: async () => getRuleSnooze({ data: { iterationId } })
  });
};
function RuleSnoozeDetail({
  scenarioId,
  iterationId,
  rulesMetadata
}) {
  const { t } = useTranslation(["common", "scenarios"]);
  const ruleSnoozesQuery = useRuleSnoozesQuery(scenarioId, iterationId);
  if (ruleSnoozesQuery.isPending) return /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, { className: "size-5 shrink-0" });
  if (ruleSnoozesQuery.isError) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-s text-red-primary", children: t("common:errors.unknown") });
  }
  const ruleSnoozes = ruleSnoozesQuery.data.ruleSnoozes;
  const hasSnoozesActive = ruleSnoozes.some((snooze) => snooze.hasSnoozesActive);
  if (!hasSnoozesActive) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-grey-secondary text-s first-letter:capitalize", children: t("scenarios:deployment_modal.activate.without_rule_snooze") });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Collapsible.Container, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Collapsible.Title, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-secondary text-s first-letter:capitalize", children: t("scenarios:deployment_modal.activate.with_rule_snooze") }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Collapsible.Content, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-40 overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "list-none", children: rulesMetadata.map((rule) => {
      const hasSnoozesActive2 = ruleSnoozes.find((snooze) => snooze.ruleId === rule.id)?.hasSnoozesActive;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex flex-row", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Icon,
          {
            className: clsx(
              "size-5 shrink-0",
              hasSnoozesActive2 === true && "text-green-primary",
              hasSnoozesActive2 === false && "text-red-primary"
            ),
            icon: hasSnoozesActive2 ? "tick" : "cross"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-primary font-normal", children: rule.name })
      ] }, rule.id);
    }) }) }) })
  ] });
}
const PREPARATION_POLL_INTERVAL_MS = 2e3;
const PREPARATION_WAIT_CALLOUT_DELAY_MS = 1e3;
function* generateDeploymentSteps(iteration, includePreparationStep, t) {
  yield {
    key: "draft",
    label: t("scenarios:deployment_modal.steps.draft"),
    isCurrent: false
  };
  yield {
    key: "commit",
    label: t("scenarios:deployment_modal.steps.commit"),
    isCurrent: iteration.type === "draft"
  };
  if (includePreparationStep) {
    yield {
      key: "prepare",
      label: t("scenarios:deployment_modal.steps.prepare"),
      isCurrent: iteration.type !== "draft" && iteration.status === "required"
    };
  }
  yield {
    key: "activate",
    label: t("scenarios:deployment_modal.steps.activate"),
    isCurrent: iteration.type !== "draft" && iteration.status === "ready_to_activate"
  };
}
function ScenarioDeploymentModal({
  scenario,
  iteration,
  isPreparationServiceOccupied,
  rulesMetadata
}) {
  const { t } = useTranslation(["common", "scenarios"]);
  const [open, setOpen] = reactExports.useState(false);
  const [errorMessage, setErrorMessage] = reactExports.useState(null);
  const [isPreparationPollingStarted, setIsPreparationPollingStarted] = reactExports.useState(false);
  const [shouldPersistPreparationStep, setShouldPersistPreparationStep] = reactExports.useState(false);
  const [showPreparationWaitCallout, setShowPreparationWaitCallout] = reactExports.useState(false);
  const revalidate = useLoaderRevalidator();
  const commitMutation = useCommitIterationMutation(scenario.id, iteration.id);
  const prepareMutation = usePrepareIterationMutation(scenario.id, iteration.id);
  const activateMutation = useActivateIterationMutation(scenario.id, iteration.id);
  const ruleSnoozesQuery = useRuleSnoozesQuery(scenario.id, iteration.id);
  const publicationPreparationStatusQuery = usePublicationPreparationStatusQuery(scenario.id, iteration.id, {
    enabled: isPreparationPollingStarted && iteration.status !== "ready_to_activate",
    refetchInterval: (query) => {
      if (!isPreparationPollingStarted) return false;
      if (query.state.data?.status === "ready_to_activate") return false;
      return PREPARATION_POLL_INTERVAL_MS;
    }
  });
  const effectiveIteration = {
    ...iteration,
    status: publicationPreparationStatusQuery.data?.status ?? iteration.status
  };
  const steps = Array.from(
    generateDeploymentSteps(effectiveIteration, iteration.status === "required" || shouldPersistPreparationStep, t)
  );
  const currentStep = steps.find((step) => step.isCurrent)?.key ?? "activate";
  const hasActivationBecomeAvailable = effectiveIteration.status === "ready_to_activate";
  const isWaitingForActivation = isPreparationPollingStarted && !hasActivationBecomeAvailable;
  reactExports.useEffect(() => {
    setErrorMessage(null);
  }, [currentStep]);
  reactExports.useEffect(() => {
    setIsPreparationPollingStarted(false);
    setShouldPersistPreparationStep(false);
    setShowPreparationWaitCallout(false);
  }, [iteration.id]);
  reactExports.useEffect(() => {
    if (!isPreparationPollingStarted || !hasActivationBecomeAvailable) return;
    setIsPreparationPollingStarted(false);
    revalidate();
  }, [hasActivationBecomeAvailable, isPreparationPollingStarted, revalidate]);
  reactExports.useEffect(() => {
    if (!isWaitingForActivation) {
      setShowPreparationWaitCallout(false);
      return;
    }
    const timeoutId = window.setTimeout(() => {
      setShowPreparationWaitCallout(true);
    }, PREPARATION_WAIT_CALLOUT_DELAY_MS);
    return () => clearTimeout(timeoutId);
  }, [isWaitingForActivation]);
  const activeMutation = currentStep === "commit" ? commitMutation : currentStep === "prepare" ? prepareMutation : activateMutation;
  const isPending = activeMutation.isPending || isWaitingForActivation || currentStep === "activate" && ruleSnoozesQuery.isPending;
  const action = currentStep === "commit" ? { label: t("scenarios:deployment_modal.commit.button"), icon: "commit" } : currentStep === "prepare" ? { label: t("scenarios:deployment_modal.prepare.button"), icon: "queue-list" } : { label: t("scenarios:deployment_modal.activate.button"), icon: "pushtolive" };
  const title = t(`scenarios:deployment_modal.${currentStep}.title`);
  const confirm = t(`scenarios:deployment_modal.${currentStep}.confirm`);
  const bullets = currentStep === "commit" ? [
    {
      text: t("scenarios:deployment_modal.commit.draft_is_readonly"),
      tooltip: t("scenarios:deployment_modal.commit.draft_is_readonly.tooltip")
    },
    {
      text: t("scenarios:deployment_modal.commit.activate_to_go_in_prod"),
      tooltip: t("scenarios:deployment_modal.commit.activate_to_go_in_prod.tooltip")
    },
    { text: t("scenarios:deployment_modal.commit.change_is_immediate") }
  ] : currentStep === "prepare" ? [
    {
      text: t("scenarios:deployment_modal.prepare.activate_to_go_in_prod"),
      tooltip: t("scenarios:deployment_modal.prepare.activate_to_go_in_prod.tooltip")
    },
    { text: t("scenarios:deployment_modal.prepare.preparation_is_async") }
  ] : [
    {
      text: scenario.isLive ? t("scenarios:deployment_modal.activate.replace_current_live_version") : t("scenarios:deployment_modal.activate.will_be_live"),
      tooltip: t("scenarios:deployment_modal.activate.live_version.tooltip")
    },
    { text: t("scenarios:deployment_modal.activate.change_is_immediate") }
  ];
  const gating = !iteration.isValid ? {
    disabled: true,
    tooltip: t(`scenarios:deployment_modal.${currentStep}.validation_error`),
    variant: currentStep === "prepare" ? "destructive" : "primary"
  } : currentStep === "prepare" && isPreparationServiceOccupied ? {
    disabled: true,
    tooltip: t("scenarios:deployment_modal.prepare.preparation_service_occupied"),
    variant: "primary"
  } : { disabled: false, tooltip: null, variant: "primary" };
  const handleAction = async () => {
    setErrorMessage(null);
    try {
      if (currentStep === "commit") {
        const res = await commitMutation.mutateAsync({
          draftIsReadOnly: true,
          activateToGoInProd: true,
          changeIsImmediate: true
        });
        if (res?.error) {
          setErrorMessage(
            res.error === "validation_error" ? t("scenarios:deployment_modal.commit.validation_error") : t("common:errors.unknown")
          );
          return;
        }
      } else if (currentStep === "prepare") {
        const res = await prepareMutation.mutateAsync({ activateToGoInProd: true, preparationIsAsync: true });
        if (res?.error) {
          setErrorMessage(
            res.error === "preparation_service_occupied" ? t("scenarios:deployment_modal.prepare.preparation_service_occupied") : t("common:errors.unknown")
          );
          return;
        }
        setShouldPersistPreparationStep(true);
        setIsPreparationPollingStarted(true);
        return;
      } else {
        const res = await activateMutation.mutateAsync({ willBeLive: true, changeIsImmediate: true });
        if (res?.error) {
          setErrorMessage(getActivateErrorMessage(res.error, t));
          return;
        }
      }
      revalidate();
    } catch {
      setErrorMessage(t("common:errors.unknown"));
    }
  };
  const triggerButton = /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Button,
    {
      className: "flex-1",
      variant: gating.variant,
      size: "medium",
      disabled: gating.disabled,
      onClick: () => setOpen(true),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: action.icon, className: "size-5" }),
        action.label
      ]
    }
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    gating.tooltip ? /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip.Default, { className: "text-xs", content: gating.tooltip, children: triggerButton }) : triggerButton,
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Modal.Root,
      {
        open,
        onOpenChange: (nextOpen) => {
          if (!isPending) setOpen(nextOpen);
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Modal.Content,
          {
            onInteractOutside: (event) => {
              if (isPending) event.preventDefault();
            },
            onEscapeKeyDown: (event) => {
              if (isPending) event.preventDefault();
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: title }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-lg p-lg", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(StepProgressBar, { steps, value: currentStep, isPending }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-s flex flex-col gap-md font-medium", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: confirm }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "flex list-disc flex-col gap-md ps-lg", children: bullets.map((bullet) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-sm", children: [
                    bullet.text,
                    bullet.tooltip ? /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip.Default, { content: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "max-w-60", children: bullet.tooltip }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "tip", className: "hover:text-purple-primary text-purple-disabled size-5" }) }) : null
                  ] }) }, bullet.text)) }),
                  currentStep === "activate" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-6 w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RuleSnoozeDetail, { scenarioId: scenario.id, iterationId: iteration.id, rulesMetadata }) }) : null,
                  showPreparationWaitCallout ? /* @__PURE__ */ jsxRuntimeExports.jsx(Callout, { color: "purple", icon: "tip", children: t("scenarios:deployment_modal.prepare.waiting_for_activation") }) : null,
                  errorMessage ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-s text-red-primary font-medium", children: errorMessage }) : null
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Footer, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Modal.FooterButton,
                  {
                    isCloseButton: true,
                    label: t("common:cancel"),
                    disabled: isPending,
                    onClick: () => setOpen(false)
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Modal.FooterButton,
                  {
                    label: action.label,
                    disabled: isPending || !iteration.isValid,
                    onClick: handleAction,
                    isLoading: isPending,
                    leadingIcon: action.icon
                  }
                )
              ] })
            ]
          }
        )
      }
    )
  ] });
}
function getActivateErrorMessage(error, t) {
  switch (error) {
    case "validation_error":
      return t("scenarios:deployment_modal.activate.validation_error");
    case "preparation_is_required":
      return t("scenarios:deployment_modal.activate.preparation_is_required_error");
    case "preparation_service_occupied":
      return t("scenarios:deployment_modal.activate.preparation_service_occupied_error");
    case "is_draft":
      return t("scenarios:deployment_modal.activate.is_draft_error");
    default:
      return t("common:errors.unknown");
  }
}
const archivedIterationI18n = [...decisionsI18n, ...scenarioI18n, "common"];
const columnHelper = createColumnHelper();
function ArchivedIterationView({ rulesMetadata, scenarioIteration }) {
  const { t } = useTranslation(archivedIterationI18n);
  const { screeningConfigs, scoreReviewThreshold, scoreBlockAndReviewThreshold, scoreDeclineThreshold } = scenarioIteration;
  const items = reactExports.useMemo(
    () => [
      ...rulesMetadata.map((r) => ({ ...r, type: "rule" })),
      ...screeningConfigs.map((s) => ({ ...s, type: "sanction" }))
    ],
    [rulesMetadata, screeningConfigs]
  );
  const columns = reactExports.useMemo(
    () => [
      columnHelper.accessor((row) => row.name, {
        id: "name",
        header: t("scenarios:rules.name"),
        size: 200
      }),
      columnHelper.accessor((row) => row.description, {
        id: "description",
        header: t("scenarios:rules.description"),
        size: 360
      }),
      columnHelper.accessor((row) => row.ruleGroup, {
        id: "ruleGroup",
        header: t("scenarios:rules.rule_group"),
        size: 150,
        cell: ({ getValue }) => {
          const value = getValue();
          if (!value) return null;
          return /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { children: value });
        }
      }),
      columnHelper.accessor((row) => row.type === "sanction" ? row.forcedOutcome : void 0, {
        id: "outcome",
        header: t("decisions:outcome"),
        size: 120,
        cell: ({ getValue }) => {
          const outcome = getValue();
          if (!outcome) return null;
          return /* @__PURE__ */ jsxRuntimeExports.jsx(OutcomeBadge, { outcome, size: "md" });
        }
      })
    ],
    [t]
  );
  const hasItems = items.length > 0;
  const { table, getBodyProps, rows, getContainerProps } = useTable({
    data: items,
    columns,
    columnResizeMode: "onChange",
    enableSorting: hasItems,
    initialState: {
      sorting: [{ id: "name", desc: false }]
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  });
  const columnLength = table.getHeaderGroups()[0]?.headers.length ?? 1;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-lg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Table.Container, { ...getContainerProps(), className: "bg-surface-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Table.Header, { headerGroups: table.getHeaderGroups() }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Table.Body, { ...getBodyProps(), children: hasItems ? rows.map((row) => /* @__PURE__ */ jsxRuntimeExports.jsx(Table.Row, { row }, row.id)) : /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "h-28", children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: columnLength, children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center", children: t("scenarios:rules.empty") }) }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Collapsible.Container, { className: "bg-surface-card max-w-3xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Collapsible.Title, { children: t("scenarios:decision.score_based.title") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Collapsible.Content, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        ScoreOutcomeThresholds,
        {
          scoreReviewThreshold,
          scoreBlockAndReviewThreshold,
          scoreDeclineThreshold
        }
      ) })
    ] })
  ] });
}
function ScenarioEditLayout() {
  const {
    t
  } = useTranslation([...navigationI18n, "scenarios", "common"]);
  const iterationId = useParam("iterationId");
  const {
    scenarioIterations,
    currentScenario
  } = useDetectionScenarioData();
  const {
    scenarioValidation,
    scenarioIteration,
    rulesMetadata
  } = useDetectionScenarioIterationData();
  const {
    isEditScenarioAvailable,
    isCreateDraftAvailable,
    ...loaderData
  } = Route.useLoaderData();
  const {
    currentIteration,
    draftIteration
  } = reactExports.useMemo(() => {
    const currentIteration2 = scenarioIterations.find(({
      id
    }) => id === iterationId);
    const draftIteration2 = scenarioIterations.find(({
      version
    }) => version === null);
    invariant(currentIteration2);
    return {
      currentIteration: currentIteration2,
      draftIteration: draftIteration2
    };
  }, [iterationId, scenarioIterations]);
  const editorMode = useEditorMode();
  const withEditTag = editorMode === "edit";
  const withCreateDraftIteration = isCreateDraftAvailable && currentIteration.type !== "draft" && !scenarioIteration.archived;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Page.Main, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Page.Header, { className: "justify-between gap-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row items-center gap-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ScenarioHeader, { isEditScenarioAvailable, scenario: currentScenario }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(VersionSelect, { currentIteration, scenarioIterations }),
      withEditTag ? /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { size: "big", children: t("common:edit") }) : null
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Page.Content, { width: "readable", children: [
      scenarioIteration.archived ? /* @__PURE__ */ jsxRuntimeExports.jsx(Callout, { color: "red", icon: "warning", className: "mb-md", children: t("scenarios:iteration.archived_message") }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "flex flex-row gap-lg items-center", children: [
        currentScenario.description ? /* @__PURE__ */ jsxRuntimeExports.jsx(Page.Description, { withIcon: false, className: "flex-1", children: currentScenario.description }) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row items-center gap-md", children: [
          withCreateDraftIteration ? /* @__PURE__ */ jsxRuntimeExports.jsx(CreateDraftIteration, { iterationId: currentIteration.id, scenarioId: currentScenario.id, draftId: draftIteration?.id }) : null,
          loaderData.isDeploymentActionsAvailable ? /* @__PURE__ */ jsxRuntimeExports.jsx(DeploymentActions, { scenario: {
            id: currentScenario.id,
            isLive: !!currentScenario.liveVersionId
          }, iteration: {
            id: currentIteration.id,
            type: currentIteration.type,
            isValid: !hasTriggerErrors(scenarioValidation) && !hasRulesErrors(scenarioValidation) && !hasScreeningsErrors(scenarioValidation) && !hasDecisionErrors(scenarioValidation),
            status: loaderData.publicationPreparationStatus.status
          }, isPreparationServiceOccupied: loaderData.publicationPreparationStatus.serviceStatus === "occupied" }) : null
        ] })
      ] }),
      scenarioIteration.archived ? /* @__PURE__ */ jsxRuntimeExports.jsx(ArchivedIterationView, { rulesMetadata, scenarioIteration }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { from: "/detection/scenarios/$scenarioId/i/$iterationId", to: "./trigger", className: cn(tabClassName, "gap-sm"), "aria-invalid": hasTriggerErrors(scenarioValidation), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ScenariosLinkIcon, { icon: "trigger", withPing: hasTriggerErrors(scenarioValidation), className: "size-5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "first-letter:capitalize", children: t("navigation:scenario.trigger") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { from: "/detection/scenarios/$scenarioId/i/$iterationId", to: "./rules", className: cn(tabClassName, "gap-sm"), "aria-invalid": hasRulesErrors(scenarioValidation), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ScenariosLinkIcon, { icon: "rules", withPing: hasRulesErrors(scenarioValidation), className: "size-5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "first-letter:capitalize", children: t("navigation:scenario.rules") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { from: "/detection/scenarios/$scenarioId/i/$iterationId", to: "./decision", className: cn(tabClassName, "gap-sm"), "aria-invalid": hasDecisionErrors(scenarioValidation), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ScenariosLinkIcon, { icon: "decision", withPing: hasDecisionErrors(scenarioValidation), className: "size-5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "first-letter:capitalize", children: t("navigation:scenario.decision") })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {})
      ] })
    ] })
  ] });
}
function ScenariosLinkIcon({
  withPing,
  ...props
}) {
  if (withPing) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(CornerPing, { position: "top-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { ...props }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { ...props });
}
function DeploymentActions({
  scenario,
  iteration,
  isPreparationServiceOccupied
}) {
  const {
    rulesMetadata
  } = useDetectionScenarioIterationData();
  if (iteration.type === "live version") return /* @__PURE__ */ jsxRuntimeExports.jsx(DeactivateScenarioVersion, { scenarioId: scenario.id, iterationId: iteration.id });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ScenarioDeploymentModal, { scenario, iteration, isPreparationServiceOccupied, rulesMetadata });
}
export {
  ScenarioEditLayout as component
};
