import { r as reactExports, R as jsxRuntimeExports, _ as createServerFn, O as useRouter } from "../server.js";
import { b as AstBuilder, c as getDataAccessorDisplayName } from "./index-DCH5hwXA.js";
import { O as OutcomeBadge } from "./OutcomeTag-BH_m80fa.js";
import { a as FocusScope, F as FiltersButton, R as Root2$2, T as Trigger$2, C as Content2$1 } from "./index-BAiW6m4Z.js";
import { a as PanelSharpFactory, P as Panel } from "./Panel-kj8Z2GDk.js";
import { aX as createScreeningRuleFn, aY as getIterationRuleFn, aZ as createRuleFn, a_ as getRuleDescriptionFn, a$ as deleteRuleFn, b0 as duplicateRuleFn, b1 as generateAstFn, b2 as deleteScreeningRuleFn, w as matchSorter, ab as scenarioI18n, b3 as Route, b4 as useDerivedIterationRuleGroupsData } from "./router-vb7i5euz.js";
import { u as useMutation } from "./useMutation-C5oG90Zs.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
import { A as isAccessible } from "./feature-access-B8PIS8ad.js";
import { u as useTranslation, B as Button, e as Icon, s as Trans, dG as useControllableState, es as useId, dI as useComposedRefs, dH as composeEventHandlers, eA as hideOthers, eC as ReactRemoveScroll, dJ as createContextScope, eD as createSlot, eB as useFocusGuards, b as clsx, fx as Command, fy as CommandInput, fz as CommandList, fA as CommandGroup, fB as CommandItem, fC as CommandEmpty, e4 as Modal, d as cn, T as Typo, e0 as NumberInput, e8 as MenuCommand, eo as SelectWithCombobox, e1 as Input, dz as Switch, et as HovercardAnchor, eu as Hovercard, q as useFormatLanguage, ei as SearchInput, j as Tag, dA as formatNumber, C as CtaV2ClassName } from "./format-NPGUXq-g.js";
import { N as Nudge } from "./Nudge-C1ux5IUa.js";
import { cj as isUndefinedAstNode, dk as NewEmptyTriggerAstNode, a_ as NewUndefinedAstNode, M, dl as findRuleValidation, dm as hasRuleErrors, dn as collectRuleValidationMessages, dp as NewEmptyRuleAstNode, b6 as makeDatasetsMap, b8 as getCanonicalSelectedKeys, l as isKnownOperandAstNode, dq as NewStringConcatAstNode, dr as findScreeningValidation, ds as getScreeningQueryFieldLabel, dt as collectFormValidationIssues, du as hasScreeningErrors, dv as collectScreeningValidationIssues, dw as mergeScreeningValidationIssues, dx as hasRequiredScreeningCriteria, dy as screeningFieldHasError, dz as screeningSectionHasError, dA as issueDedupeKey, aI as knownOutcomes, dB as isStringConcatAstNode, J as protectArray, c4 as isDataAccessorAstNode, u as t$1, v as n$2, p as t$2 } from "./services-middleware-DR8Hua1Y.js";
import { u as useQuery } from "./useQuery-B7mL_evE.js";
import { u as useOrganizationDetails } from "./organization-detail-YGkE0F4y.js";
import { R as Root, T as Trigger$1, C as Content$1 } from "./index-DhVP5FgH.js";
import { c as createSsrRpc } from "./createSsrRpc-ZXUHv2Er.js";
import { C as Callout } from "./Callout-DX4NBXlG.js";
import { F as FormErrorOrDescription } from "./FormErrorOrDescription-DO6Hdfmn.js";
import { a as authMiddleware } from "./auth-middleware-C4ap47rJ.js";
import { u as useGetScenarioErrorMessage } from "./scenario-validation-error-messages-CB3GcwJ8.js";
import { g as getFieldErrors, h as handleSubmit } from "./form-D2XmDKeG.js";
import { u as useDebouncedCallbackRef } from "./use-debounced-callback-ref-5JUm5kmy.js";
import { u as useForm, a as useStore } from "./useForm-BwABQKAs.js";
import { z as zt } from "./CopyToClipboardButton-CJNJJful.js";
import { C as Card } from "./Card-9LKESqlf.js";
import { u as useEditorMode } from "./editor-mode-BAuR_YJJ.js";
import { E as EvaluationErrors } from "./ScenarioValidationError-DADb1taj.js";
import { R as Root2$1, A as Anchor, c as createPopperScope, D as DismissableLayer, C as Content, a as Arrow } from "./index-BF4TC3go.js";
import { P as Presence } from "./index-CR1bHmei.js";
import { P as Primitive } from "./index-C_WgunUr.js";
import { n as n$1 } from "./unique-CBeBxAXx.js";
import { R as RuleGroup } from "./RuleGroup-DlaoMKK-.js";
import "./scenarios-8U74nJp4.js";
import { A as AIText } from "./AIText-26XR7fL6.js";
import { o as object, d as any, n as number, s as string, p as boolean, f_ as record, _ as _enum, k as array, h as useParam } from "./short-uuid-MIi3jWzx.js";
import { E as ExternalLink } from "./ExternalLink-CG_77QdX.js";
import { S as ScreeningThreshold } from "./ScreeningThreshold-6mmbXp7u.js";
import { L as ListAndTopicDatasetConfiguration, D as DatasetSelectionContent } from "./DatasetSelectionContent-CZ4GOM-S.js";
import { S as Spinner } from "./Spinner-GK6cEAdR.js";
import { u as useListConfigQuery } from "./lists-config-CsQWGvXL.js";
import { u as useSignalEffect } from "./sharpstate.es-CeF1Mf5b.js";
import { u as useEntityName } from "./useEntityName-n7_MOPuL.js";
import { D as DragDropContext, C as ConnectedDroppable, P as PublicDraggable } from "./dnd.esm-C6lpwR_j.js";
import { r as replace } from "./array-BFSjnO9c.js";
import { H as HovercardProvider } from "./hovercard-provider-BchUL2eY.js";
import { g as getListsFn } from "./lists-Dee9CNJg.js";
import { r } from "./difference-Byy3Ycrn.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
import "./use-callback-ref-AfyBSz95.js";
import "./dataTypeSchema-DvqJgdgd.js";
import "./isArray-gJc74O_I.js";
import "./isNullish-B8pc8Ntu.js";
import "./join-BeQTfqAC.js";
import "./index-CtZTigeT.js";
import "./display-TKj7AN5a.js";
import "./use-callback-ref-DXzIzfqy.js";
import "./documentation-href-uAe88WFl.js";
import "./flatMap-CbF5uMEQ.js";
import "./create-navigation-option-DrtWhyLE.js";
import "./data-fdG1PpsD.js";
import "./data-BFm2FCTm.js";
import "./QueryClientProvider-DYTpkCko.js";
import "./isNonNullish-DgEqPJBU.js";
import "./index-BsFKI8Kt.js";
import "./security-headers.server-BdP3HrPp.js";
import "./ThemeContext-B40HQxfH.js";
import "./config-ut8rAdyo.js";
import "./i18n-instance-store-UssbGYOM.js";
import "./inboxes-D556s0BB.js";
import "./files-fO9wUXBf.js";
import "./case-detail-middleware-C3JS8Yme.js";
import "./input-validation-CU_reV2S.js";
import "./async-C3pYACua.js";
import "./decisions-B-2DmJW1.js";
import "node:crypto";
import "./useBaseQuery-CMboOtTR.js";
import "./create-context-CYc8deix.js";
import "./Markdown-sjqeOXzy.js";
import "./Code-C6D_KXb1.js";
import "./capitalize-CzwYzf_g.js";
import "./dataset-utils-C1Lb7jdi.js";
import "./screenings-CS8peAlI.js";
import "./lists-DTaf1grX.js";
function e(e2, t2, n2) {
  return e2(n2[0]) ? (e3) => t2(e3, ...n2) : t2(...n2);
}
function t(...t2) {
  return e((e2) => typeof e2 == `number`, n, t2);
}
function n(e2, t2, n2, r2 = []) {
  let i = [...e2];
  return i.splice(t2, n2, ...r2), i;
}
const useCreateScreeningRuleMutation = (scenarioId, iterationId) => {
  const createScreeningRule = useServerFn(createScreeningRuleFn);
  return useMutation({
    mutationKey: ["scenarios", "iteration", "create-screening-rule", scenarioId, iterationId],
    mutationFn: async () => createScreeningRule({ data: { scenarioId, iterationId } })
  });
};
function CreateScreeningButton({
  scenarioId,
  iterationId,
  isSanctionAvailable,
  onSuccess
}) {
  const { t: t2 } = useTranslation(["scenarios"]);
  const createScreeningRuleMutation = useCreateScreeningRuleMutation(scenarioId, iterationId);
  const disabled = reactExports.useMemo(() => !isAccessible(isSanctionAvailable), [isSanctionAvailable]);
  const handleCreateScreeningRule = () => {
    createScreeningRuleMutation.mutateAsync().then((screeningConfig) => {
      onSuccess(screeningConfig.id);
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Button,
    {
      type: "submit",
      variant: "secondary",
      appearance: "link",
      disabled,
      className: "w-full gap-sm",
      onClick: handleCreateScreeningRule,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-md", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "plus", className: "size-5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-normal", children: t2("scenarios:create_sanction.title") })
        ] }),
        isSanctionAvailable !== "allowed" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Nudge, { kind: isSanctionAvailable, content: t2("scenarios:sanction.nudge"), className: "p-xs" }) : null
      ]
    }
  );
}
function useScenarioIterationRule(ruleId) {
  const getIterationRule = useServerFn(getIterationRuleFn);
  return useQuery({
    queryKey: ["scenario-iteration-rule", ruleId],
    queryFn: async () => getIterationRule({ data: { ruleId } })
  });
}
const useCreateRuleMutation = (scenarioId, iterationId) => {
  const createRule = useServerFn(createRuleFn);
  return useMutation({
    mutationKey: ["scenarios", "iteration", "create-rule", scenarioId],
    mutationFn: async () => createRule({ data: { scenarioId, iterationId } })
  });
};
function CreateRule({
  scenarioId,
  iterationId,
  onSuccess
}) {
  const { t: t2 } = useTranslation(["scenarios"]);
  const createRuleMutation = useCreateRuleMutation(scenarioId, iterationId);
  const handleCreateRule = () => {
    createRuleMutation.mutateAsync().then((rule) => {
      onSuccess(rule.id);
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Button,
    {
      variant: "secondary",
      appearance: "link",
      disabled: createRuleMutation.isPending,
      className: "w-full gap-sm",
      onClick: handleCreateRule,
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "plus", className: "size-5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-normal", children: t2("scenarios:create_rule.title") })
      ] })
    }
  );
}
const useRuleDescriptionMutation = (identifier) => {
  const getRuleDescription = useServerFn(getRuleDescriptionFn);
  return useMutation({
    mutationKey: ["scenario-iteration-rule", "rule-description", identifier],
    mutationFn: async (payload) => {
      const result = await getRuleDescription({
        data: { scenarioId: payload.scenarioId, astNode: payload.astNode }
      });
      return { success: true, data: result };
    }
  });
};
const EvaluationErrorsWrapper = ({
  errors,
  evaluation
}) => {
  const getScenarioErrorMessage = useGetScenarioErrorMessage();
  const hasMeaningfulErrors = evaluation ? evaluation.some((node) => node.errors.filter((err) => err.error != "ARGUMENT_MUST_BE_BOOLEAN").length > 0) : false;
  const filteredErrors = errors.filter((error) => {
    if (error === "FORMULA_MUST_RETURN_BOOLEAN" || error.startsWith("FORMULA_INCORRECT_RETURN_TYPE")) {
      return !hasMeaningfulErrors;
    }
    return true;
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(EvaluationErrors, { errors: filteredErrors.map(getScenarioErrorMessage) });
};
const FieldAstFormula = ({
  type,
  astNode,
  scenarioId,
  triggerObjectType,
  options,
  onChange,
  onBlur,
  defaultValue
}) => {
  const { t: t2 } = useTranslation(["scenarios"]);
  const editor = useEditorMode();
  const formula = astNode ?? defaultValue;
  const isAstNull = isUndefinedAstNode(formula);
  const nodeStoreRef = reactExports.useRef(null);
  const [validationErrors, setValidationErrors] = reactExports.useState([]);
  const [validationEvaluation, setValidationEvaluation] = reactExports.useState([]);
  const handleAddTrigger = () => {
    onChange?.(NewEmptyTriggerAstNode());
  };
  const handleDeleteTrigger = () => {
    onChange?.(NewUndefinedAstNode());
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onBlur, className: "flex flex-col gap-md", children: [
    isAstNull ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-blue-58 bg-blue-96 text-blue-58 text-s flex items-center rounded-sm border p-sm dark:bg-transparent", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Trans,
      {
        t: t2,
        i18nKey: "scenarios:trigger.trigger_object.no_trigger",
        values: { objectType: triggerObjectType }
      }
    ) }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(AstBuilder.Provider, { scenarioId, initialData: options, mode: editor, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      AstBuilder.Root,
      {
        node: formula,
        onStoreChange: (nodeStore) => {
          nodeStoreRef.current = nodeStore;
        },
        onValidationUpdate: (validation) => {
          setValidationErrors(validation.errors);
          setValidationEvaluation(validation.evaluation);
        },
        onUpdate: onChange,
        returnType: "bool"
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      EvaluationErrorsWrapper,
      {
        errors: isAstNull ? [] : validationErrors,
        evaluation: isAstNull ? [] : validationEvaluation
      }
    ),
    type === "screening" && editor === "edit" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: isAstNull ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "secondary", onClick: handleAddTrigger, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: t2("scenarios:trigger.trigger_object.add_trigger") }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "secondary", onClick: handleDeleteTrigger, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs", children: t2("scenarios:trigger.trigger_object.delete_trigger") }) }) }) : null
  ] });
};
var POPOVER_NAME = "Popover";
var [createPopoverContext] = createContextScope(POPOVER_NAME, [
  createPopperScope
]);
var usePopperScope = createPopperScope();
var [PopoverProvider, usePopoverContext] = createPopoverContext(POPOVER_NAME);
var Popover = (props) => {
  const {
    __scopePopover,
    children,
    open: openProp,
    defaultOpen,
    onOpenChange,
    modal = false
  } = props;
  const popperScope = usePopperScope(__scopePopover);
  const triggerRef = reactExports.useRef(null);
  const [hasCustomAnchor, setHasCustomAnchor] = reactExports.useState(false);
  const [open, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen ?? false,
    onChange: onOpenChange,
    caller: POPOVER_NAME
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Root2$1, { ...popperScope, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    PopoverProvider,
    {
      scope: __scopePopover,
      contentId: useId(),
      triggerRef,
      open,
      onOpenChange: setOpen,
      onOpenToggle: reactExports.useCallback(() => setOpen((prevOpen) => !prevOpen), [setOpen]),
      hasCustomAnchor,
      onCustomAnchorAdd: reactExports.useCallback(() => setHasCustomAnchor(true), []),
      onCustomAnchorRemove: reactExports.useCallback(() => setHasCustomAnchor(false), []),
      modal,
      children
    }
  ) });
};
Popover.displayName = POPOVER_NAME;
var ANCHOR_NAME = "PopoverAnchor";
var PopoverAnchor = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopePopover, ...anchorProps } = props;
    const context = usePopoverContext(ANCHOR_NAME, __scopePopover);
    const popperScope = usePopperScope(__scopePopover);
    const { onCustomAnchorAdd, onCustomAnchorRemove } = context;
    reactExports.useEffect(() => {
      onCustomAnchorAdd();
      return () => onCustomAnchorRemove();
    }, [onCustomAnchorAdd, onCustomAnchorRemove]);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Anchor, { ...popperScope, ...anchorProps, ref: forwardedRef });
  }
);
PopoverAnchor.displayName = ANCHOR_NAME;
var TRIGGER_NAME = "PopoverTrigger";
var PopoverTrigger = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopePopover, ...triggerProps } = props;
    const context = usePopoverContext(TRIGGER_NAME, __scopePopover);
    const popperScope = usePopperScope(__scopePopover);
    const composedTriggerRef = useComposedRefs(forwardedRef, context.triggerRef);
    const trigger = /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.button,
      {
        type: "button",
        "aria-haspopup": "dialog",
        "aria-expanded": context.open,
        "aria-controls": context.open ? context.contentId : void 0,
        "data-state": getState(context.open),
        ...triggerProps,
        ref: composedTriggerRef,
        onClick: composeEventHandlers(props.onClick, context.onOpenToggle)
      }
    );
    return context.hasCustomAnchor ? trigger : /* @__PURE__ */ jsxRuntimeExports.jsx(Anchor, { asChild: true, ...popperScope, children: trigger });
  }
);
PopoverTrigger.displayName = TRIGGER_NAME;
var PORTAL_NAME = "PopoverPortal";
var [PortalProvider, usePortalContext] = createPopoverContext(PORTAL_NAME, {
  forceMount: void 0
});
var CONTENT_NAME = "PopoverContent";
var PopoverContent = reactExports.forwardRef(
  (props, forwardedRef) => {
    const portalContext = usePortalContext(CONTENT_NAME, props.__scopePopover);
    const { forceMount = portalContext.forceMount, ...contentProps } = props;
    const context = usePopoverContext(CONTENT_NAME, props.__scopePopover);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Presence, { present: forceMount || context.open, children: context.modal ? /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverContentModal, { ...contentProps, ref: forwardedRef }) : /* @__PURE__ */ jsxRuntimeExports.jsx(PopoverContentNonModal, { ...contentProps, ref: forwardedRef }) });
  }
);
PopoverContent.displayName = CONTENT_NAME;
var Slot = createSlot("PopoverContent.RemoveScroll");
var PopoverContentModal = reactExports.forwardRef(
  (props, forwardedRef) => {
    const context = usePopoverContext(CONTENT_NAME, props.__scopePopover);
    const contentRef = reactExports.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, contentRef);
    const isRightClickOutsideRef = reactExports.useRef(false);
    reactExports.useEffect(() => {
      const content = contentRef.current;
      if (content) return hideOthers(content);
    }, []);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(ReactRemoveScroll, { as: Slot, allowPinchZoom: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      PopoverContentImpl,
      {
        ...props,
        ref: composedRefs,
        trapFocus: context.open,
        disableOutsidePointerEvents: true,
        onCloseAutoFocus: composeEventHandlers(props.onCloseAutoFocus, (event) => {
          event.preventDefault();
          if (!isRightClickOutsideRef.current) context.triggerRef.current?.focus();
        }),
        onPointerDownOutside: composeEventHandlers(
          props.onPointerDownOutside,
          (event) => {
            const originalEvent = event.detail.originalEvent;
            const ctrlLeftClick = originalEvent.button === 0 && originalEvent.ctrlKey === true;
            const isRightClick = originalEvent.button === 2 || ctrlLeftClick;
            isRightClickOutsideRef.current = isRightClick;
          },
          { checkForDefaultPrevented: false }
        ),
        onFocusOutside: composeEventHandlers(
          props.onFocusOutside,
          (event) => event.preventDefault(),
          { checkForDefaultPrevented: false }
        )
      }
    ) });
  }
);
var PopoverContentNonModal = reactExports.forwardRef(
  (props, forwardedRef) => {
    const context = usePopoverContext(CONTENT_NAME, props.__scopePopover);
    const hasInteractedOutsideRef = reactExports.useRef(false);
    const hasPointerDownOutsideRef = reactExports.useRef(false);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      PopoverContentImpl,
      {
        ...props,
        ref: forwardedRef,
        trapFocus: false,
        disableOutsidePointerEvents: false,
        onCloseAutoFocus: (event) => {
          props.onCloseAutoFocus?.(event);
          if (!event.defaultPrevented) {
            if (!hasInteractedOutsideRef.current) context.triggerRef.current?.focus();
            event.preventDefault();
          }
          hasInteractedOutsideRef.current = false;
          hasPointerDownOutsideRef.current = false;
        },
        onInteractOutside: (event) => {
          props.onInteractOutside?.(event);
          if (!event.defaultPrevented) {
            hasInteractedOutsideRef.current = true;
            if (event.detail.originalEvent.type === "pointerdown") {
              hasPointerDownOutsideRef.current = true;
            }
          }
          const target = event.target;
          const targetIsTrigger = context.triggerRef.current?.contains(target);
          if (targetIsTrigger) event.preventDefault();
          if (event.detail.originalEvent.type === "focusin" && hasPointerDownOutsideRef.current) {
            event.preventDefault();
          }
        }
      }
    );
  }
);
var PopoverContentImpl = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopePopover,
      trapFocus,
      onOpenAutoFocus,
      onCloseAutoFocus,
      disableOutsidePointerEvents,
      onEscapeKeyDown,
      onPointerDownOutside,
      onFocusOutside,
      onInteractOutside,
      ...contentProps
    } = props;
    const context = usePopoverContext(CONTENT_NAME, __scopePopover);
    const popperScope = usePopperScope(__scopePopover);
    useFocusGuards();
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      FocusScope,
      {
        asChild: true,
        loop: true,
        trapped: trapFocus,
        onMountAutoFocus: onOpenAutoFocus,
        onUnmountAutoFocus: onCloseAutoFocus,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          DismissableLayer,
          {
            asChild: true,
            disableOutsidePointerEvents,
            onInteractOutside,
            onEscapeKeyDown,
            onPointerDownOutside,
            onFocusOutside,
            onDismiss: () => context.onOpenChange(false),
            deferPointerDownOutside: true,
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Content,
              {
                "data-state": getState(context.open),
                role: "dialog",
                id: context.contentId,
                ...popperScope,
                ...contentProps,
                ref: forwardedRef,
                style: {
                  ...contentProps.style,
                  // re-namespace exposed content custom properties
                  ...{
                    "--radix-popover-content-transform-origin": "var(--radix-popper-transform-origin)",
                    "--radix-popover-content-available-width": "var(--radix-popper-available-width)",
                    "--radix-popover-content-available-height": "var(--radix-popper-available-height)",
                    "--radix-popover-trigger-width": "var(--radix-popper-anchor-width)",
                    "--radix-popover-trigger-height": "var(--radix-popper-anchor-height)"
                  }
                }
              }
            )
          }
        )
      }
    );
  }
);
var CLOSE_NAME = "PopoverClose";
var PopoverClose = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopePopover, ...closeProps } = props;
    const context = usePopoverContext(CLOSE_NAME, __scopePopover);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.button,
      {
        type: "button",
        ...closeProps,
        ref: forwardedRef,
        onClick: composeEventHandlers(props.onClick, () => context.onOpenChange(false))
      }
    );
  }
);
PopoverClose.displayName = CLOSE_NAME;
var ARROW_NAME = "PopoverArrow";
var PopoverArrow = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopePopover, ...arrowProps } = props;
    const popperScope = usePopperScope(__scopePopover);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Arrow, { ...popperScope, ...arrowProps, ref: forwardedRef });
  }
);
PopoverArrow.displayName = ARROW_NAME;
function getState(open) {
  return open ? "open" : "closed";
}
var Root2 = Popover;
var Trigger = PopoverTrigger;
var Content2 = PopoverContent;
const FieldRuleGroup = ({
  selectedRuleGroup,
  ruleGroups,
  disabled,
  onChange,
  onBlur
}) => {
  const { t: t2 } = useTranslation(["scenarios"]);
  const [newRule, setNewRule] = reactExports.useState();
  const [value, setValue] = reactExports.useState();
  const finalRuleGroups = reactExports.useMemo(
    () => n$1([selectedRuleGroup, newRule, ...ruleGroups].filter(Boolean)),
    [selectedRuleGroup, ruleGroups, newRule]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Root2,
    {
      defaultOpen: false,
      onOpenChange: (open) => {
        if (open === false) {
          setValue("");
          onBlur?.();
        }
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
          selectedRuleGroup ? /* @__PURE__ */ jsxRuntimeExports.jsx(RuleGroup, { ruleGroup: selectedRuleGroup }) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsx(Trigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              disabled,
              variant: "secondary",
              mode: selectedRuleGroup ? "icon" : void 0,
              className: clsx({ "w-fit": !selectedRuleGroup }),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: selectedRuleGroup ? "edit-square" : "plus", className: "text-grey-disabled size-4" }),
                !selectedRuleGroup ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t2("scenarios:rules.add_group") }) : null
              ]
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Content2, { className: "mt-xs min-w-[280px] shadow-md", align: "start", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Command, { className: "flex flex-col gap-sm p-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-grey-border flex items-center gap-sm border-b p-sm pb-md", children: [
            selectedRuleGroup ? /* @__PURE__ */ jsxRuntimeExports.jsx(RuleGroup, { ruleGroup: selectedRuleGroup, onClear: () => onChange?.("") }) : null,
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              CommandInput,
              {
                placeholder: t2("scenarios:rules.new_group"),
                value,
                onInput: (e2) => setValue(e2.currentTarget.value),
                onKeyDown: (e2) => {
                  if (e2.key === "Enter" && value) {
                    setNewRule(value);
                    onChange?.(value);
                    setValue("");
                  }
                }
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CommandList, { children: [
            finalRuleGroups.length ? /* @__PURE__ */ jsxRuntimeExports.jsx(CommandGroup, { heading: t2("scenarios:rules.heading"), children: finalRuleGroups.map((r2) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              CommandItem,
              {
                className: "data-[selected=true]:bg-purple-background-light rounded-sm",
                onSelect: () => onChange?.(r2),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(RuleGroup, { ruleGroup: r2 })
              },
              r2
            )) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(CommandEmpty, { className: "flex items-center gap-sm p-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "plus", className: "text-grey-disabled size-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-disabled", children: t2("scenarios:rules.empty_groups") })
            ] }),
            value && !finalRuleGroups.includes(value) ? /* @__PURE__ */ jsxRuntimeExports.jsx(CommandItem, { asChild: true, forceMount: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Button,
              {
                variant: "secondary",
                appearance: "link",
                onClick: () => {
                  setNewRule(value);
                  onChange?.(value);
                  setValue("");
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "plus", className: "text-grey-primary size-4" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-grey-primary text-s inline-flex items-center gap-sm", children: [
                    t2("scenarios:rules.create"),
                    value ? /* @__PURE__ */ jsxRuntimeExports.jsx(RuleGroup, { ruleGroup: value }) : null
                  ] })
                ]
              }
            ) }) : null
          ] })
        ] }) })
      ]
    }
  );
};
const useDeleteRuleMutation = (scenarioId, iterationId) => {
  const deleteRule = useServerFn(deleteRuleFn);
  return useMutation({
    mutationKey: ["scenarios", "iteration", "delete-rule", scenarioId],
    mutationFn: async (payload) => deleteRule({ data: { ...payload, scenarioId, iterationId } })
  });
};
function DeleteRule({
  ruleId,
  scenarioId,
  iterationId,
  children,
  onDeleteSuccess
}) {
  const { t: t2 } = useTranslation(["common", "scenarios"]);
  const deleteRuleMutation = useDeleteRuleMutation(scenarioId, iterationId);
  const [open, setOpen] = reactExports.useState(false);
  const handleDeleteRule = () => {
    deleteRuleMutation.mutateAsync({ ruleId }).then(() => {
      setOpen(false);
      onDeleteSuccess();
      zt.success(t2("scenarios:delete_rule.success"));
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Root, { open, onOpenChange: setOpen, children: [
    children ? /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Trigger, { asChild: true, children }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Content, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: t2("scenarios:delete_rule.title") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center", children: t2("scenarios:delete_rule.content") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Footer, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { isCloseButton: true, label: t2("common:cancel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Modal.FooterButton,
          {
            label: t2("common:delete"),
            variant: "destructive",
            onClick: handleDeleteRule,
            isLoading: deleteRuleMutation.isPending,
            leadingIcon: "delete"
          }
        )
      ] })
    ] })
  ] });
}
const useDuplicateRuleMutation = (scenarioId, iterationId) => {
  const duplicateRule = useServerFn(duplicateRuleFn);
  return useMutation({
    mutationKey: ["scenarios", "iteration", "duplicate-rule", scenarioId],
    mutationFn: async (payload) => duplicateRule({ data: { ...payload, scenarioId, iterationId } })
  });
};
function DuplicateRule({
  ruleId,
  scenarioId,
  iterationId,
  children,
  onDuplicateSuccess
}) {
  const { t: t2 } = useTranslation(["common", "scenarios"]);
  const duplicateRuleMutation = useDuplicateRuleMutation(scenarioId, iterationId);
  const [open, setOpen] = reactExports.useState(false);
  const handleDuplicateRule = () => {
    duplicateRuleMutation.mutateAsync({ ruleId }).then((rule) => {
      setOpen(false);
      onDuplicateSuccess(rule.id);
      zt.success(t2("scenarios:duplicate_rule.success"));
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Root, { open, onOpenChange: setOpen, children: [
    children ? /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Trigger, { asChild: true, children }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Content, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: t2("scenarios:clone_rule.title") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-lg p-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: t2("scenarios:clone_rule.content") }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Footer, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { isCloseButton: true, label: t2("common:cancel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Modal.FooterButton,
          {
            label: t2("scenarios:clone_rule.confirmation_button"),
            onClick: handleDuplicateRule,
            isLoading: duplicateRuleMutation.isPending,
            leadingIcon: "copy"
          }
        )
      ] })
    ] })
  ] });
}
function AiDescription({ isPending, description, className }) {
  const { t: t2 } = useTranslation(["scenarios"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: cn(
        "text-default rounded-md border border-purple-border bg-purple-background-light text-purple-primary flex flex-col gap-sm p-md dark:border-grey-border",
        className
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "ai-review", className: "size-5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: t2("scenarios:rules.ai_description.title") })
        ] }),
        description ? /* @__PURE__ */ jsxRuntimeExports.jsx(AIText, { text: description }) : null,
        isPending && description ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: t2("scenarios:rules.ai_description.check_reformulation") }) : null
      ]
    }
  );
}
function useGenerateRuleMutation(scenarioId) {
  const generateAst = useServerFn(generateAstFn);
  return useMutation({
    mutationKey: ["scenario", "generate-ast", scenarioId],
    mutationFn: async ({ ruleId, instruction }) => generateAst({ data: { scenarioId, ruleId, instruction } })
  });
}
function AiGenerateRule({ scenarioId, ruleId, onFormulaGenerated }) {
  const { t: t2 } = useTranslation(["scenarios", "common"]);
  const [instruction, setInstruction] = reactExports.useState("");
  const mutation = useGenerateRuleMutation(scenarioId);
  const handleGenerate = async () => {
    const result = await mutation.mutateAsync({ ruleId, instruction }).catch(() => null);
    if (result === null || !result.success) {
      zt.error(t2("scenarios:rules.ai_generate.error_generating"));
      return;
    }
    if (result.ruleAst) {
      setInstruction("");
      onFormulaGenerated(result.ruleAst);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Typo, { variant: "subtitle1", className: "text-s font-medium mb-md", children: t2("scenarios:rules.ai_generate.title") }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "textarea",
        {
          value: instruction,
          onChange: (e2) => setInstruction(e2.currentTarget.value),
          placeholder: t2("scenarios:rules.ai_generate.placeholder"),
          disabled: mutation.isPending,
          className: "form-textarea text-grey-primary text-s w-full resize-none border-none bg-transparent font-medium outline-hidden",
          rows: 3
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          onClick: handleGenerate,
          disabled: !instruction.trim() || mutation.isPending,
          variant: "primary",
          size: "small",
          children: mutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "spinner", className: "size-4 animate-spin", "aria-hidden": true }),
            t2("scenarios:rules.ai_generate.generating")
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "wand", className: "size-4", "aria-hidden": true }),
            t2("scenarios:rules.ai_generate.generate_button")
          ] })
        }
      )
    ] })
  ] });
}
function RuleEditPanel({
  ruleId,
  ...props
}) {
  const {
    t: t2
  } = useTranslation(["common"]);
  const ruleQuery = useScenarioIterationRule(ruleId);
  return M(ruleQuery).with({
    isError: true
  }, ({
    error
  }) => /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: error.message })).with({
    isPending: true
  }, () => /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: t2("common:loading") })).with({
    isSuccess: true
  }, ({
    data
  }) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(RuleEditForm, { rule: data.rule, ...props });
  }).exhaustive();
}
const editRuleFormSchema = object({
  name: string().nonempty(),
  description: string().optional(),
  ruleGroup: string().optional(),
  scoreModifier: number().int().min(-1e3).max(1e3),
  formula: any()
});
const editRuleConfigurationSchema = object({
  params: object({
    ruleId: string()
  }),
  payload: editRuleFormSchema
});
const editRuleAction = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(editRuleConfigurationSchema).handler(createSsrRpc("9400a11e6b2258983bbeb49c7002a1783418a7cb2735a2b7e80327517e28d11f"));
function RuleEditForm({
  rule,
  scenario,
  scenarioValidation,
  ruleGroups,
  isAiRuleDescriptionEnabled,
  onSuccess,
  onDelete
}) {
  const {
    t: t2
  } = useTranslation(["common"]);
  const panelSharp = PanelSharpFactory.useSharp();
  const nameInputRef = reactExports.useRef(null);
  const mutation = useMutation({
    mutationFn: (value) => editRuleAction({
      data: {
        params: {
          ruleId: rule.id
        },
        payload: value
      }
    }),
    onSuccess: async () => {
      zt.success(t2("common:success.save"));
      await onSuccess();
    },
    onError: () => {
      zt.error(t2("common:errors.unknown"));
    },
    meta: {
      invalidates: () => [["scenario-iteration-rule", rule.id]]
    }
  });
  const ruleDescriptionMutation = useRuleDescriptionMutation(rule.id);
  const [ruleDescription, setRuleDescription] = reactExports.useState(void 0);
  const getScenarioErrorMessage = useGetScenarioErrorMessage();
  const ruleValidation = reactExports.useMemo(() => findRuleValidation(scenarioValidation, rule.id), [scenarioValidation, rule.id]);
  const form = useForm({
    onSubmit: ({
      value,
      formApi
    }) => {
      if (serverValidationMessages.length > 0 || !formApi.state.isValid) {
        return;
      }
      return mutation.mutateAsync(value);
    },
    validators: {
      onSubmit: editRuleFormSchema,
      onChange: editRuleFormSchema,
      onMount: editRuleFormSchema
    },
    defaultValues: rule
  });
  const formFormula = useStore(form.store, (state) => state.values.formula);
  const [formulaKey, setFormulaKey] = reactExports.useState(0);
  const [isDebouncing, setIsDebouncing] = reactExports.useState(false);
  const serverValidationMessages = reactExports.useMemo(() => {
    if (!hasRuleErrors(ruleValidation, {
      formFormula
    })) {
      return [];
    }
    return collectRuleValidationMessages(ruleValidation, getScenarioErrorMessage, t2("scenarios:edit_rule.formula"), {
      formFormula
    });
  }, [ruleValidation, formFormula, getScenarioErrorMessage, t2]);
  const innerHandleFormulaChange = useDebouncedCallbackRef((value) => {
    setIsDebouncing(false);
    if (value) {
      ruleDescriptionMutation.mutateAsync({
        scenarioId: scenario.id,
        astNode: value
      }).then((res) => {
        if (res.success && res.data.isRuleValid) {
          setRuleDescription(res.data.description);
        }
      });
    }
  }, 3e3);
  const handleFormulaChange = (value) => {
    if (!isAiRuleDescriptionEnabled) return;
    setIsDebouncing(true);
    innerHandleFormulaChange(value);
  };
  const handleRuleSubmit = async (closeOnSuccess) => {
    await form.handleSubmit();
    if (closeOnSuccess) {
      panelSharp.actions.close();
    }
  };
  const handleRuleDelete = async () => {
    await onDelete();
  };
  const handleRuleDuplicate = async (ruleId) => {
    await onSuccess(ruleId);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("form", { onSubmit: handleSubmit(form), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel.Content, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel.Header, { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "name", children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.HeaderInput, { ref: nameInputRef, name: field.name, value: field.state.value, onChange: (e2) => field.handleChange(e2.target.value), placeholder: t2("scenarios:edit_rule.name_placeholder"), "data-testid": "rule_edit_panel.name_input" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "ruleGroup", validators: {
          onChange: editRuleFormSchema.shape.ruleGroup,
          onBlur: editRuleFormSchema.shape.ruleGroup
        }, children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FieldRuleGroup, { onChange: field.handleChange, onBlur: field.handleBlur, selectedRuleGroup: field.state.value, ruleGroups }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DuplicateRule, { ruleId: rule.id, iterationId: rule.scenarioIterationId, scenarioId: scenario.id, onDuplicateSuccess: handleRuleDuplicate, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "small", variant: "primary", appearance: "stroked", mode: "icon", "aria-label": "Clone rule", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "copy", className: "size-4" }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteRule, { ruleId: rule.id, iterationId: rule.scenarioIterationId, scenarioId: scenario.id, onDeleteSuccess: handleRuleDelete, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "small", variant: "destructive", appearance: "stroked", mode: "icon", "aria-label": "Delete rule", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "delete", className: "size-4" }) }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-md", children: [
      serverValidationMessages.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Callout, { color: "red", icon: "lightbulb", iconColor: "red", className: "max-w-3xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "flex flex-col gap-xs ps-md", children: serverValidationMessages.map((message) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: message }, message)) }) }) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "description", validators: {
        onChange: editRuleFormSchema.shape.description,
        onBlur: editRuleFormSchema.shape.description
      }, children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "flex w-full flex-col gap-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { name: field.name, defaultValue: field.state.value, onChange: (e2) => field.handleChange(e2.currentTarget.value), onBlur: field.handleBlur, className: "form-textarea text-grey-primary text-s w-full resize-none border-none bg-transparent font-medium outline-hidden", placeholder: t2("scenarios:edit_rule.description_placeholder") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("grid grid-cols-1", {
        "grid-cols-[2fr_1fr] gap-md": isAiRuleDescriptionEnabled
      }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s font-medium", children: t2("scenarios:edit_rule.formula") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: cn({
            "border-red-primary": serverValidationMessages.length > 0
          }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "formula", validators: {
            onChange: editRuleFormSchema.shape.formula,
            onBlur: editRuleFormSchema.shape.formula
          }, children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsx(FieldAstFormula, { type: "rule", scenarioId: scenario.id, triggerObjectType: scenario.triggerObjectType, onBlur: field.handleBlur, onChange: (node) => {
            field.handleChange(node);
            handleFormulaChange(node);
          }, astNode: field.state.value, defaultValue: NewEmptyRuleAstNode() }, formulaKey) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AiGenerateRule, { scenarioId: scenario.id, ruleId: rule.id, onFormulaGenerated: (ruleAst) => {
            form.setFieldValue("formula", ruleAst);
            handleFormulaChange(ruleAst);
            setFormulaKey((k) => k + 1);
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-grey-background text-grey-secondary dark:text-grey-secondary text-s inline-flex rounded-sm p-sm font-medium", children: t2("scenarios:edit_rule.score_heading") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "scoreModifier", validators: {
              onChange: editRuleFormSchema.shape.scoreModifier,
              onBlur: editRuleFormSchema.shape.scoreModifier
            }, children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(NumberInput, { name: field.name, value: field.state.value, onBlur: field.handleBlur, onChange: field.handleChange, borderColor: field.state.meta.errors?.length === 0 ? "greyfigma-90" : "redfigma-47" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors) })
            ] }) })
          ] }) })
        ] }) }),
        isAiRuleDescriptionEnabled ? /* @__PURE__ */ jsxRuntimeExports.jsx(AiDescription, { isPending: isDebouncing || ruleDescriptionMutation.isPending, description: ruleDescription, className: "self-start max-w-2xl" }) : null
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Footer, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(form.Subscribe, { selector: (state) => [state.canSubmit, state.isSubmitting], children: ([canSubmit, isSubmitting]) => /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.FooterButton, { disabled: !canSubmit, isLoading: isSubmitting, onClick: () => handleRuleSubmit(false), variant: "primary-outline", label: t2("common:save") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.FooterButton, { disabled: !canSubmit, isLoading: isSubmitting, onClick: () => handleRuleSubmit(true), trailingIcon: "save", variant: "primary", label: t2("common:save_and_close") })
    ] }) }) })
  ] }) });
}
const useDeleteScreeningRuleMutation = (scenarioId, iterationId) => {
  const deleteScreeningRule = useServerFn(deleteScreeningRuleFn);
  return useMutation({
    mutationKey: ["scenarios", "iteration", "delete-screening-rule", scenarioId, iterationId],
    mutationFn: async (screeningId) => deleteScreeningRule({ data: { scenarioId, iterationId, screeningId } })
  });
};
function DeleteScreeningRule({
  scenarioId,
  iterationId,
  screeningId,
  children,
  onDeleteSuccess
}) {
  const { t: t2 } = useTranslation(["common", "scenarios"]);
  const deleteScreeningRuleMutation = useDeleteScreeningRuleMutation(scenarioId, iterationId);
  const handleDeleteScreeningRule = () => {
    deleteScreeningRuleMutation.mutateAsync(screeningId).then(() => {
      onDeleteSuccess();
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Root, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Trigger, { asChild: true, children }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Content, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: t2("scenarios:delete_sanction.title") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-lg p-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: t2("scenarios:delete_sanction.content") }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Footer, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { isCloseButton: true, label: t2("common:cancel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Modal.FooterButton,
          {
            label: t2("common:delete"),
            variant: "destructive",
            onClick: handleDeleteScreeningRule,
            isLoading: deleteScreeningRuleMutation.isPending,
            leadingIcon: "delete"
          }
        )
      ] })
    ] })
  ] });
}
function getDatasetsKey(datasets) {
  return [...datasets].sort().join(",");
}
const FieldDataset = ({ value, onChange, readOnly = false }) => {
  const { t: t2 } = useTranslation();
  const listConfigQuery = useListConfigQuery("transaction_monitoring");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s font-semibold", children: t2("scenarios:sanction.lists.title") }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface-card border-grey-border flex flex-col gap-md rounded-sm border p-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Callout, { variant: "outlined", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-wrap", children: t2("scenarios:sanction.lists.callout") }) }),
      M(listConfigQuery).with({ isPending: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, { className: "size-10" }) })).with({ isError: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-md items-center justify-center h-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "", children: t2("common:generic_fetch_data_error") }) })).otherwise(({ data }) => /* @__PURE__ */ jsxRuntimeExports.jsx(FieldDatasetInner, { provider: data.provider, value, onChange, readOnly }))
    ] })
  ] });
};
const FieldDatasetInner = ({
  provider,
  value,
  onChange,
  readOnly
}) => {
  const valueKey = reactExports.useMemo(() => getDatasetsKey(value ?? []), [value]);
  const listSharp = ListAndTopicDatasetConfiguration.createSharp({
    datasets: makeDatasetsMap(value ?? []),
    mode: readOnly ? "view" : "edit",
    provider
  });
  const onChangeRef = reactExports.useRef(onChange);
  onChangeRef.current = onChange;
  const lastValueKeyRef = reactExports.useRef(valueKey);
  lastValueKeyRef.current = valueKey;
  reactExports.useEffect(() => {
    const selectedKey = getDatasetsKey(getCanonicalSelectedKeys(listSharp.value.datasets));
    if (selectedKey === valueKey) return;
    const nextDatasets = makeDatasetsMap(value ?? []);
    listSharp.update((state) => {
      for (const key of Object.keys(state.datasets)) {
        delete state.datasets[key];
      }
      for (const [key, isSelected] of Object.entries(nextDatasets)) {
        state.datasets[key] = isSelected;
      }
    });
  }, [listSharp, value, valueKey]);
  useSignalEffect(() => {
    const selectedDatasets = getCanonicalSelectedKeys(listSharp.value.datasets);
    const selectedKey = getDatasetsKey(selectedDatasets);
    if (selectedKey === lastValueKeyRef.current) {
      return;
    }
    lastValueKeyRef.current = selectedKey;
    onChangeRef.current?.(selectedDatasets);
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ListAndTopicDatasetConfiguration.Provider, { value: listSharp, children: /* @__PURE__ */ jsxRuntimeExports.jsx(DatasetSelectionContent, { useCase: "transaction_monitoring" }) });
};
const FieldEntityType = ({
  entityType,
  onChange
}) => {
  const editor = useEditorMode();
  const { getEntityName } = useEntityName();
  const [open, setOpen] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Menu, { persistOnSelect: false, open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Trigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.SelectButton, { className: "w-52", disabled: editor === "view", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-primary text-s font-medium", children: getEntityName(entityType) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Content, { sameWidth: true, className: "mt-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.List, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Item, { onSelect: () => onChange("Thing"), children: getEntityName("Thing") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Item, { onSelect: () => onChange("Person"), children: getEntityName("Person") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Item, { onSelect: () => onChange("Organization"), children: getEntityName("Organization") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Item, { onSelect: () => onChange("Vehicle"), children: getEntityName("Vehicle") })
    ] }) })
  ] }) });
};
const MatchOperand = reactExports.memo(function MatchOperand2({
  node,
  onSave,
  placeholder,
  withDate
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    AstBuilder.Operand,
    {
      placeholder,
      node: node ?? NewUndefinedAstNode(),
      optionsDataType: withDate ? ["String", "Timestamp"] : ["String"],
      excludeFields: withDate ? ["updated_at"] : void 0,
      validationStatus: "valid",
      onChange: onSave
    }
  );
});
const FieldNode = ({
  value,
  placeholder,
  onChange,
  onBlur
}) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { onBlur, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
  MatchOperand,
  {
    node: value,
    placeholder,
    onSave: (node) => {
      if (isKnownOperandAstNode(node)) {
        onChange?.(!isUndefinedAstNode(node) ? node : null);
      }
    }
  }
) });
function reorder(list, startIndex, endIndex) {
  const result = [...list];
  const [removed] = result.splice(startIndex, 1);
  if (removed) result.splice(endIndex, 0, removed);
  return result;
}
function concatFromNodes(nodes) {
  const finalNodes = nodes.filter((n2) => !isUndefinedAstNode(n2));
  return finalNodes.length !== 0 ? NewStringConcatAstNode(finalNodes, { withSeparator: true }) : null;
}
function FieldNodeConcat({
  value,
  limit,
  onBlur,
  onChange,
  viewOnly,
  placeholder,
  withDate
}) {
  const [nodes, setNodes] = reactExports.useState(
    () => value?.children?.length ? value.children : [NewUndefinedAstNode()]
  );
  const onChangeRef = reactExports.useRef(onChange);
  onChangeRef.current = onChange;
  const emitFromNodes = (nextNodes) => {
    onChangeRef.current?.(concatFromNodes(nextNodes));
  };
  const applyNodes = (nextNodes) => {
    setNodes(nextNodes);
    emitFromNodes(nextNodes);
  };
  reactExports.useEffect(() => {
    setNodes((prev) => {
      const filled = prev.filter((node) => !isUndefinedAstNode(node));
      if (value?.children?.length) {
        const isOwnEcho = value.children.length === filled.length && value.children.every((child, index) => child.id === filled[index]?.id);
        return isOwnEcho ? prev : value.children;
      }
      return filled.length === 0 ? prev : [NewUndefinedAstNode()];
    });
  }, [value]);
  const onDragEnd = (result) => {
    if (!result.destination || result.destination.index === result.source.index) {
      return;
    }
    applyNodes(reorder(nodes, result.source.index, result.destination.index));
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(DragDropContext, { onDragEnd, autoScrollerOptions: { disabled: true }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { onBlur, className: "flex flex-col gap-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ConnectedDroppable, { isDropDisabled: viewOnly, droppableId: "NODES", direction: "vertical", children: (dropProvided) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", ref: dropProvided.innerRef, children: [
    nodes.map((node, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(PublicDraggable, { isDragDisabled: viewOnly, draggableId: node.id, index, children: (dragProvided) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        ref: dragProvided.innerRef,
        ...dragProvided.draggableProps,
        className: "flex items-center gap-2xs",
        children: [
          !viewOnly ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-row", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "hover:bg-grey-background flex size-6 items-center justify-center rounded-sm",
                ...dragProvided.dragHandleProps,
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "drag", className: "text-grey-disabled size-3" })
              },
              node.id
            ),
            nodes.length > 1 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                mode: "icon",
                variant: "secondary",
                appearance: "link",
                onClick: () => applyNodes(t(nodes, index, 1, [])),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "cross", className: "size-4" })
              }
            ) : null,
            !limit || nodes.length < limit ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                mode: "icon",
                variant: "secondary",
                appearance: "link",
                disabled: nodes.length === limit,
                onClick: () => applyNodes(
                  t(nodes, index, 1, [
                    { ...nodes[index], id: nodes[index].id },
                    NewUndefinedAstNode()
                  ])
                ),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "plus", className: "size-4" })
              }
            ) : null
          ] }) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            MatchOperand,
            {
              node,
              placeholder,
              onSave: (savedNode) => {
                if (isKnownOperandAstNode(savedNode)) {
                  applyNodes(replace(nodes, { ...savedNode, id: node.id }, (_, i) => i === index));
                }
              },
              withDate
            },
            `node-${index}`
          )
        ]
      },
      node.id
    ) }, node.id)),
    dropProvided.placeholder
  ] }) }) }) });
}
const FieldOutcomes = ({
  selectedOutcome,
  outcomes,
  disabled,
  name,
  onChange,
  onBlur
}) => {
  const [searchValue, setSearchValue] = reactExports.useState("");
  const deferredSearchValue = reactExports.useDeferredValue(searchValue);
  const matches = reactExports.useMemo(() => matchSorter(outcomes, deferredSearchValue), [outcomes, deferredSearchValue]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    SelectWithCombobox.Root,
    {
      selectedValue: selectedOutcome,
      searchValue,
      onSearchValueChange: setSearchValue,
      onSelectedValueChange: onChange,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          SelectWithCombobox.Select,
          {
            name,
            disabled,
            onBlur,
            className: "hover:bg-grey-background-light w-full border-0 transition-colors",
            children: [
              selectedOutcome ? /* @__PURE__ */ jsxRuntimeExports.jsx(OutcomeBadge, { size: "sm", outcome: selectedOutcome }) : null,
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectWithCombobox.Arrow, {})
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectWithCombobox.Popover, { className: "z-50 flex flex-col gap-sm p-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectWithCombobox.Combobox, { render: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "shrink-0" }), autoSelect: true, autoFocus: true }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectWithCombobox.ComboboxList, { children: matches.map((outcome) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectWithCombobox.ComboboxItem, { value: outcome, children: /* @__PURE__ */ jsxRuntimeExports.jsx(OutcomeBadge, { size: "sm", outcome }) }, outcome)) })
        ] })
      ]
    }
  );
};
const FieldSkipIfUnder = ({ value, onBlur, onChange, editor, name }) => {
  const { t: t2 } = useTranslation(scenarioI18n);
  const [inputValue, setInputValue] = reactExports.useState(value ?? 5);
  const handleInputChange = (e2) => {
    const newValue = +e2.currentTarget.value;
    setInputValue(newValue);
    onChange(newValue);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Switch,
      {
        checked: value !== null,
        onCheckedChange: (checked) => onChange(checked ? inputValue : null),
        onBlur,
        disabled: editor === "view",
        id: "ignore-check-if-under"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "ignore-check-if-under", className: "text-s flex flex-row items-center gap-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Trans,
      {
        t: t2,
        i18nKey: "scenarios:edit_sanction.ignore_check_if_under",
        components: {
          NbNumbers: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              size: "small",
              type: "number",
              name,
              className: "z-0 w-14 py-0",
              value: inputValue,
              min: 0,
              onChange: handleInputChange,
              disabled: editor === "view" || value === null
            }
          )
        }
      }
    ) })
  ] });
};
const FieldToolTip = ({ children }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(HovercardProvider, { showTimeout: 0, hideTimeout: 0, placement: "right", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      HovercardAnchor,
      {
        tabIndex: -1,
        className: "hover:text-purple-primary text-purple-disabled cursor-pointer transition-colors",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "tip", className: "size-5" })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Hovercard,
      {
        portal: true,
        gutter: 16,
        className: "bg-surface-card border-grey-border flex w-fit max-w-80 rounded-sm border p-sm shadow-md z-100 text-s",
        children
      }
    )
  ] });
};
function useGetCustomListsQuery() {
  const getLists = useServerFn(getListsFn);
  return useQuery({
    queryKey: ["custom-lists"],
    queryFn: () => getLists()
  });
}
const ScreeningTermIgnoreList = ({ value, onBlur, onChange, editor }) => {
  const { t: t2 } = useTranslation(scenarioI18n);
  const [selectedListId, setSelectedListId] = reactExports.useState(value ?? null);
  const [open, setOpen] = reactExports.useState(false);
  const customListsQuery = useGetCustomListsQuery();
  const handleListSelect = (listId) => {
    setSelectedListId(listId);
    onChange(listId);
  };
  return M(customListsQuery).with({ isPending: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: "Loading..." })).with({ isError: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: "Error" })).with({ isSuccess: true }, ({ data: customLists }) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Switch,
          {
            checked: value !== null,
            onBlur,
            onCheckedChange: (checked) => onChange(checked ? selectedListId ?? customLists[0]?.id ?? null : null),
            disabled: editor === "view",
            id: "remove-terms-from-list"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "remove-terms-from-list", className: "text-s", children: t2("scenarios:edit_sanction.remove_terms_from_list") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FieldToolTip, { children: t2("scenarios:edit_sanction.remove_terms_from_list.tooltip") })
      ] }),
      value ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Menu, { persistOnSelect: false, open, onOpenChange: setOpen, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Trigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.SelectButton, { className: "w-52", disabled: editor === "view", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-primary text-s font-medium", children: customLists.find((list) => list.id === selectedListId)?.name || t2("scenarios:edit_sanction.select_list") }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Content, { sameWidth: true, className: "mt-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.List, { children: customLists.map((list) => /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Item, { onSelect: () => handleListSelect(list.id), children: list.name }, list.id)) }) })
      ] }) }) : null
    ] });
  }).exhaustive();
};
const editScreeningFormSchema = object({
  id: string().nonempty(),
  name: string().nonempty(),
  description: string().optional(),
  ruleGroup: string().optional(),
  datasets: protectArray(array(string())),
  threshold: number().optional(),
  forcedOutcome: _enum(["review", "decline", "block_and_review"]),
  triggerRule: any(),
  entityType: _enum(["Person", "Organization", "Vehicle", "Thing"]).optional(),
  query: record(string(), any()),
  counterPartyId: any().nullish(),
  preprocessing: object({
    useNer: boolean().optional(),
    nerIgnoreClassification: boolean().optional(),
    skipIfUnder: number().nullish(),
    removeNumbers: boolean().optional(),
    blacklistListId: string().nullish()
  }).optional()
});
const editScreeningConfigurationSchema = object({
  params: object({
    scenarioId: string(),
    iterationId: string(),
    screeningId: string()
  }),
  payload: editScreeningFormSchema
});
const editScreeningAction = createServerFn({
  method: "POST"
}).middleware([authMiddleware]).validator(editScreeningConfigurationSchema).handler(createSsrRpc("bf56d34b66baeffb8e8738a9a75b1b5f0ca8916895407c31fadab20a997e6a3c"));
function ScreeningRuleEditPanel({
  configs,
  rule,
  scenario,
  iterationId,
  ruleGroups,
  scenarioValidation,
  isNameRecognitionAvailable,
  onSuccess,
  onDelete
}) {
  const {
    t: t2
  } = useTranslation(["common", "scenarios", "decisions"]);
  const panelSharp = PanelSharpFactory.useSharp();
  const [showValidationSummary, setShowValidationSummary] = reactExports.useState(false);
  const {
    org
  } = useOrganizationDetails();
  const getScenarioErrorMessage = useGetScenarioErrorMessage();
  const screeningValidationIndex = reactExports.useMemo(() => configs.findIndex((c) => c.id === rule.id).toString(), [configs, rule]);
  const screeningValidation = reactExports.useMemo(() => findScreeningValidation(scenarioValidation, screeningValidationIndex), [scenarioValidation, screeningValidationIndex]);
  const screeningValidationLabels = reactExports.useMemo(() => ({
    trigger: t2("scenarios:edit_sanction.trigger_title"),
    counterparty: t2("scenarios:sanction_counterparty_id"),
    matchCriteria: t2("scenarios:sanction.match_settings.title"),
    queryField: (fieldKey) => getScreeningQueryFieldLabel(fieldKey, t2)
  }), [t2]);
  const mutation = useMutation({
    mutationFn: (value) => editScreeningAction({
      data: {
        params: {
          scenarioId: scenario.id,
          iterationId,
          screeningId: rule.id
        },
        payload: value
      }
    }),
    onSuccess: () => {
      zt.success(t2("common:success.save"));
      onSuccess();
    },
    onError: () => {
      zt.error(t2("common:errors.unknown"));
    }
  });
  const nameInputRef = reactExports.useRef(null);
  const form = useForm({
    onSubmit: async ({
      value
    }) => {
      const submitValidationOptions = {
        ignoreLegacyAggregateQuery: true,
        formQuery: value.query ?? {},
        entityType: value.entityType
      };
      const formIssues = collectFormValidationIssues(value, editScreeningFormSchema, t2);
      const serverIssues = hasScreeningErrors(screeningValidation, submitValidationOptions) ? collectScreeningValidationIssues(screeningValidation, getScenarioErrorMessage, screeningValidationLabels, submitValidationOptions) : [];
      const blockingServerIssues = serverIssues.filter((issue) => !(issue.source.type === "section" && (issue.source.section === "trigger" || issue.source.section === "counterparty")));
      const allIssues = mergeScreeningValidationIssues(formIssues, blockingServerIssues);
      if (allIssues.length > 0) {
        setShowValidationSummary(true);
        return;
      }
      if (form.state.isValid) {
        mutation.mutateAsync({
          ...value,
          threshold: value.threshold === org.sanctionThreshold ? void 0 : value.threshold
        });
      }
    },
    validators: {
      onSubmit: editScreeningFormSchema
    },
    defaultValues: {
      id: rule?.id,
      name: rule?.name ?? "",
      description: rule?.description ?? "",
      ruleGroup: rule?.ruleGroup ?? "Screening",
      datasets: rule?.datasets ?? [],
      threshold: rule?.threshold ?? org.sanctionThreshold ?? 70,
      forcedOutcome: rule?.forcedOutcome ?? "block_and_review",
      triggerRule: rule?.triggerRule,
      entityType: rule?.entityType,
      query: rule?.query,
      counterPartyId: rule?.counterPartyId,
      preprocessing: rule?.preprocessing
    }
  });
  const formValues = useStore(form.store, (state) => state.values);
  const entityType = formValues.entityType;
  const query = formValues.query;
  const useNerEnabled = formValues.preprocessing?.useNer === true;
  const hasRequiredFields = hasRequiredScreeningCriteria(entityType, query);
  const screeningValidationOptions = reactExports.useMemo(() => ({
    ignoreLegacyAggregateQuery: true,
    formQuery: query ?? {},
    entityType
  }), [query, entityType]);
  const serverValidationIssues = reactExports.useMemo(() => {
    if (!showValidationSummary) {
      return [];
    }
    if (!hasScreeningErrors(screeningValidation, screeningValidationOptions)) {
      return [];
    }
    return collectScreeningValidationIssues(screeningValidation, getScenarioErrorMessage, screeningValidationLabels, screeningValidationOptions);
  }, [showValidationSummary, screeningValidation, getScenarioErrorMessage, screeningValidationLabels, screeningValidationOptions]);
  const formValidationIssues = reactExports.useMemo(() => {
    if (!showValidationSummary) {
      return [];
    }
    return collectFormValidationIssues(formValues, editScreeningFormSchema, t2);
  }, [showValidationSummary, formValues, t2]);
  const validationIssues = reactExports.useMemo(() => mergeScreeningValidationIssues(formValidationIssues, serverValidationIssues), [formValidationIssues, serverValidationIssues]);
  const highlight = reactExports.useMemo(() => ({
    name: screeningFieldHasError(validationIssues, "name"),
    trigger: screeningSectionHasError(validationIssues, "trigger"),
    counterparty: screeningSectionHasError(validationIssues, "counterparty"),
    matchSettings: screeningSectionHasError(validationIssues, "matchSettings"),
    queryField: (fieldKey) => screeningFieldHasError(validationIssues, `query.${fieldKey}`)
  }), [validationIssues]);
  const screeningCardClassName = (hasError, className) => cn("bg-surface-card border-grey-border flex flex-col gap-md rounded-md border p-md", hasError && "border-red-primary", className);
  const queryFieldHighlightClassName = (fieldKey) => cn(highlight.queryField(fieldKey) && "rounded-sm border border-red-primary p-xs");
  const handleRuleSubmit = async (closeOnSuccess) => {
    await form.handleSubmit();
    if (closeOnSuccess) {
      panelSharp.actions.close();
    }
  };
  const handleRuleDelete = async () => {
    await onDelete();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("form", { onSubmit: handleSubmit(form), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel.Content, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel.Header, { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "name", children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.HeaderInput, { ref: nameInputRef, name: field.name, value: field.state.value, onChange: (e2) => field.handleChange(e2.target.value) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "ruleGroup", children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FieldRuleGroup, { onChange: field.handleChange, onBlur: field.handleBlur, selectedRuleGroup: field.state.value, ruleGroups }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-sm", children: rule.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteScreeningRule, { screeningId: rule.id, iterationId, scenarioId: scenario.id, onDeleteSuccess: handleRuleDelete, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "small", variant: "destructive", appearance: "stroked", mode: "icon", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "delete", className: "size-4" }) }) }) : null })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-md", children: [
      validationIssues.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Callout, { color: "red", icon: "lightbulb", iconColor: "red", className: "max-w-3xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "flex flex-col gap-xs ps-md", children: validationIssues.map((issue) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: issue.message }, issueDedupeKey(issue))) }) }) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "description", children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "flex w-full flex-col gap-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { name: field.name, defaultValue: field.state.value, onChange: (e2) => field.handleChange(e2.currentTarget.value), onBlur: field.handleBlur, className: "form-textarea text-grey-primary text-s w-full resize-none border-none bg-transparent font-medium outline-hidden", placeholder: t2("scenarios:edit_rule.description_placeholder") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s font-semibold", children: t2("scenarios:edit_sanction.global_settings") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: screeningCardClassName(highlight.trigger), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Callout, { variant: "outlined", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trans, { t: t2, i18nKey: "scenarios:sanction.trigger_object.callout", components: {
              DocLink: /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { href: "https://docs.checkmarble.com/docs/getting-started" })
            } }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "triggerRule", validators: {
              onChange: editScreeningFormSchema.shape.triggerRule,
              onBlur: editScreeningFormSchema.shape.triggerRule
            }, children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsx(FieldAstFormula, { type: "screening", scenarioId: scenario.id, triggerObjectType: scenario.triggerObjectType, onBlur: field.handleBlur, onChange: field.handleChange, astNode: field.state.value, defaultValue: NewUndefinedAstNode() }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface-card border-grey-border flex flex-col gap-sm rounded-md border p-md", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "threshold", validators: {
              onChange: editScreeningFormSchema.shape.threshold,
              onBlur: editScreeningFormSchema.shape.threshold
            }, children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ScreeningThreshold, { threshold: field.state.value, onChange: (value) => form.setFieldValue(field.name, value), title: t2("scenarios:edit_sanction.consideration_matchings") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors) })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s", children: t2("scenarios:sanction_forced_outcome_heading") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "forcedOutcome", children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xs", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FieldOutcomes, { name: field.name, onChange: field.handleChange, onBlur: field.handleBlur, selectedOutcome: field.state.value, outcomes: r(knownOutcomes, ["approve"]) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors) })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s", children: t2("scenarios:sanction_forced_outcome_suffix") })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-s inline-flex items-center gap-sm font-semibold", children: [
            t2("scenarios:sanction_counterparty_id"),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FieldToolTip, { children: t2("scenarios:sanction_counterparty_id.tooltip") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "counterPartyId", children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: screeningCardClassName(highlight.counterparty, "rounded-sm"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AstBuilder.Provider, { scenarioId: scenario.id, mode: "edit", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FieldNode, { value: field.state.value, onChange: field.handleChange, onBlur: field.handleBlur, placeholder: t2("scenarios:sanction_counterparty_id_placeholder") }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors) })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AstBuilder.Provider, { scenarioId: scenario.id, mode: "edit", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s font-semibold", children: t2("scenarios:sanction.match_settings.title") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: screeningCardClassName(highlight.matchSettings, "rounded-sm"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Callout, { variant: "outlined", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-wrap", children: t2("scenarios:sanction.match_settings.callout") }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-s inline-flex items-center gap-xs", children: [
                t2("scenarios:edit_sanction.entity_type.heading"),
                /* @__PURE__ */ jsxRuntimeExports.jsx(FieldToolTip, { children: t2("scenarios:edit_sanction.entity_type.tooltip") })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "entityType", children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsx(FieldEntityType, { entityType: field.state.value, onChange: field.handleChange }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface-card border-grey-border flex flex-col gap-sm rounded-sm border p-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "query.name", children: (field) => {
                  const value = field.state.value;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("flex flex-col gap-xs", queryFieldHighlightClassName("name")), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xs", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-s inline-flex items-center gap-xs", children: [
                      t2("scenarios:screening.filter.name"),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(FieldToolTip, { children: t2("scenarios:screening.filter.name.tooltip") })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(FieldNodeConcat, { value: value && isStringConcatAstNode(value) ? value : void 0, onChange: field.handleChange, onBlur: field.handleBlur, placeholder: t2("scenarios:screening.filter.name_placeholder"), limit: 5 }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors) })
                  ] }) });
                } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "preprocessing.blacklistListId", children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsx(ScreeningTermIgnoreList, { value: field.state.value ?? null, onBlur: field.handleBlur, onChange: field.handleChange, editor: "edit" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "preprocessing.removeNumbers", children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: field.state.value, onCheckedChange: field.handleChange, onBlur: field.handleBlur, id: "exclude-numbers" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "exclude-numbers", className: "text-s", children: t2("scenarios:edit_sanction.exclude_numbers") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FieldToolTip, { children: t2("scenarios:edit_sanction.exclude_numbers.tooltip") })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "preprocessing.skipIfUnder", children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsx(FieldSkipIfUnder, { value: field.state.value ?? null, onBlur: field.handleBlur, onChange: field.handleChange, editor: "edit", name: field.name }) }),
                entityType === "Thing" ? /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "preprocessing.useNer", children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: field.state.value, onCheckedChange: (checked) => field.handleChange(checked), onBlur: field.handleBlur, disabled: !isNameRecognitionAvailable, id: "enable-entity-recognition" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "enable-entity-recognition", className: "text-s", children: t2("scenarios:edit_sanction.enable_entity_recognition") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FieldToolTip, { children: t2("scenarios:edit_sanction.enable_entity_recognition.tooltip") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs rounded-full bg-purple-primary px-xs py-0.5 text-grey-white", children: t2("common:beta") })
                ] }) }) : null,
                useNerEnabled ? /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "preprocessing.nerIgnoreClassification", children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm ms-3xl mt-xs", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: field.state.value, onCheckedChange: (checked) => field.handleChange(checked), onBlur: field.handleBlur }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s", children: t2("scenarios:edit_sanction.skip_entity_recognition") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FieldToolTip, { children: t2("scenarios:edit_sanction.skip_entity_recognition.tooltip") })
                ] }) }) : null
              ] }),
              M(entityType).with("Person", () => /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "query.birthDate", children: (field) => {
                  const value = field.state.value;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("flex flex-col gap-xs", queryFieldHighlightClassName("birthDate")), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xs", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s inline-flex items-center gap-xs", children: t2("scenarios:edit_sanction.birthdate") }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(FieldNodeConcat, { value: value && isStringConcatAstNode(value) ? value : void 0, onChange: field.handleChange, onBlur: field.handleBlur, placeholder: t2("scenarios:edit_sanction.birthdate_placeholder"), limit: 5, withDate: true }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors) })
                  ] }) });
                } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "query.nationality", children: (field) => {
                  const value = field.state.value;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("flex flex-col gap-xs", queryFieldHighlightClassName("nationality")), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xs", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s inline-flex items-center gap-xs", children: t2("scenarios:edit_sanction.nationality") }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(FieldNodeConcat, { value: value && isStringConcatAstNode(value) ? value : void 0, onChange: field.handleChange, onBlur: field.handleBlur, placeholder: t2("scenarios:edit_sanction.nationality_placeholder"), limit: 5 }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors) })
                  ] }) });
                } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "query.passportNumber", children: (field) => {
                  const value = field.state.value;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("flex flex-col gap-xs", queryFieldHighlightClassName("passportNumber")), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xs", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s inline-flex items-center gap-xs", children: t2("scenarios:edit_sanction.passport_number") }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(FieldNodeConcat, { value: value && isStringConcatAstNode(value) ? value : void 0, onChange: field.handleChange, onBlur: field.handleBlur, placeholder: t2("scenarios:edit_sanction.passport_number_placeholder"), limit: 5 }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors) })
                  ] }) });
                } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "query.address", children: (field) => {
                  const value = field.state.value;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("flex flex-col gap-xs", queryFieldHighlightClassName("address")), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xs", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s inline-flex items-center gap-xs", children: t2("scenarios:edit_sanction.address") }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(FieldNodeConcat, { value: value && isStringConcatAstNode(value) ? value : void 0, onChange: field.handleChange, onBlur: field.handleBlur, placeholder: t2("scenarios:edit_sanction.address_placeholder"), limit: 5 }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors) })
                  ] }) });
                } })
              ] })).with("Organization", () => /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "query.country", children: (field) => {
                  const value = field.state.value;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("flex flex-col gap-xs", queryFieldHighlightClassName("country")), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xs", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s inline-flex items-center gap-xs", children: t2("scenarios:edit_sanction.country") }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(FieldNodeConcat, { value: value && isStringConcatAstNode(value) ? value : void 0, onChange: field.handleChange, onBlur: field.handleBlur, placeholder: t2("scenarios:edit_sanction.country_placeholder"), limit: 5 }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors) })
                  ] }) });
                } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "query.registrationNumber", children: (field) => {
                  const value = field.state.value;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("flex flex-col gap-xs", queryFieldHighlightClassName("registrationNumber")), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xs", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s inline-flex items-center gap-xs", children: t2("scenarios:edit_sanction.registrationnumber") }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(FieldNodeConcat, { value: value && isStringConcatAstNode(value) ? value : void 0, onChange: field.handleChange, onBlur: field.handleBlur, placeholder: t2("scenarios:edit_sanction.registrationnumber_placeholder"), limit: 5 }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors) })
                  ] }) });
                } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "query.address", children: (field) => {
                  const value = field.state.value;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("flex flex-col gap-xs", queryFieldHighlightClassName("address")), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xs", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s inline-flex items-center gap-xs", children: t2("scenarios:edit_sanction.address") }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(FieldNodeConcat, { value: value && isStringConcatAstNode(value) ? value : void 0, onChange: field.handleChange, onBlur: field.handleBlur, placeholder: t2("scenarios:edit_sanction.address_placeholder"), limit: 5 }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors) })
                  ] }) });
                } })
              ] })).with("Vehicle", () => /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "query.registrationNumber", children: (field) => {
                const value = field.state.value;
                return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("flex flex-col gap-xs", queryFieldHighlightClassName("registrationNumber")), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xs", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s inline-flex items-center gap-xs", children: t2("scenarios:edit_sanction.registrationnumber") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FieldNodeConcat, { value: value && isStringConcatAstNode(value) ? value : void 0, onChange: field.handleChange, onBlur: field.handleBlur, placeholder: t2("scenarios:edit_sanction.registrationnumber_placeholder"), limit: 5 }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors) })
                ] }) });
              } })).otherwise(() => null)
            ] }),
            !hasRequiredFields && /* @__PURE__ */ jsxRuntimeExports.jsx(Callout, { icon: "warning", color: "yellow", children: t2("scenarios:edit_sanction.required_fields_disclaimer") }),
            !hasRequiredFields && /* @__PURE__ */ jsxRuntimeExports.jsx(EvaluationErrors, { errors: [t2("scenarios:edit_sanction.required_fields_error")] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "datasets", children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsx(FieldDataset, { value: field.state.value, onChange: field.handleChange }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Footer, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(form.Subscribe, { selector: (state) => [state.canSubmit, state.isSubmitting], children: ([canSubmit, isSubmitting]) => /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.FooterButton, { disabled: !canSubmit, onClick: () => handleRuleSubmit(false), variant: "primary-outline", label: t2("common:save") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.FooterButton, { disabled: !canSubmit, onClick: () => handleRuleSubmit(true), trailingIcon: "save", variant: "primary", label: t2("common:save_and_close") })
    ] }) }) })
  ] }) });
}
const getRowLink = (currentTarget) => {
  if (!(currentTarget instanceof HTMLElement)) return null;
  const rowLink = currentTarget.querySelector("[data-row-button]");
  return rowLink instanceof HTMLButtonElement ? rowLink : null;
};
const handleRowClick = (e2) => {
  const rowLink = getRowLink(e2.currentTarget);
  if (rowLink && rowLink !== e2.target) {
    rowLink.dispatchEvent(new MouseEvent(e2.type, e2.nativeEvent));
  }
};
const handleRowKeyDown = (e2) => {
  if (e2.key !== "Enter" && e2.key !== " ") return;
  e2.preventDefault();
  getRowLink(e2.currentTarget)?.click();
};
function RulesPage({
  scenario,
  iterationId,
  screeningConfigs,
  scenarioValidation,
  editorMode,
  list,
  ruleGroups,
  isSanctionAvailable,
  isAiRuleDescriptionEnabled,
  isNameRecognitionAvailable,
  onRuleEditSuccess
}) {
  const { t: t2 } = useTranslation(["common", "scenarios"]);
  const language = useFormatLanguage();
  const [searchValue, setSearchValue] = reactExports.useState("");
  const [currentEditing, setCurrentEditing] = reactExports.useState(null);
  const { org } = useOrganizationDetails();
  const currentScreeningRule = currentEditing?.type === "sanction" ? screeningConfigs.find((sc) => sc.id === currentEditing.id) : null;
  const onPanelOpenChange = (state) => {
    if (!state) {
      setCurrentEditing(null);
    }
  };
  const handleRuleEditSuccess = async (ruleId) => {
    await onRuleEditSuccess();
    if (ruleId) {
      setCurrentEditing({ id: ruleId, type: "rule" });
    }
  };
  const handleScreeningRuleEditSuccess = async (ruleId) => {
    await onRuleEditSuccess();
    if (ruleId) {
      setCurrentEditing({ id: ruleId, type: "sanction" });
    }
  };
  const handleRuleDelete = async () => {
    setCurrentEditing(null);
    await onRuleEditSuccess();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SearchInput, { size: "medium", value: searchValue, onChange: setSearchValue, className: "w-100" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FiltersButton, {}),
        editorMode === "edit" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          AddRuleOrScreening,
          {
            scenarioId: scenario.id,
            iterationId,
            isSanctionAvailable,
            onSuccess: async (value) => {
              await onRuleEditSuccess();
              setCurrentEditing(value);
            }
          }
        ) : null
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[0px_auto_2fr_12.5rem_12.5rem] border border-grey-border rounded-md bg-surface-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-subgrid col-span-full items-center group/table-row not-last:border-b border-grey-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(HeaderCell, { className: "col-span-2", children: t2("scenarios:rules.title") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(HeaderCell, { children: t2("scenarios:rules.description") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(HeaderCell, { children: t2("scenarios:rules.rule_group") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(HeaderCell, { children: t2("scenarios:rules.score_or_outcome") })
      ] }),
      list.map((rule) => {
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Root,
          {
            className: "overflow-hidden grid grid-cols-subgrid col-span-full group/table-row hover:bg-purple-background-light cursor-pointer ",
            onClick: handleRowClick,
            onKeyDown: handleRowKeyDown,
            "data-row": true,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Trigger$1, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  role: "link",
                  tabIndex: 0,
                  className: "grid grid-cols-subgrid col-span-full items-center focus-visible:outline-2 -outline-offset-2 outline-purple-primary",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "invisible", children: editorMode === "edit" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        "data-row-button": true,
                        "aria-label": t2("scenarios:rules.edit_rule_aria_label"),
                        onClick: () => {
                          if (rule.id) {
                            setCurrentEditing({ id: rule.id, type: rule.type });
                          }
                        }
                      }
                    ) : null }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      GridCell,
                      {
                        className: cn({ "grid grid-cols-[1rem_1fr] items-center gap-x-sm": editorMode === "view" }),
                        children: [
                          editorMode === "view" ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "caret-down", className: "size-4" }) }) : null,
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: rule.name })
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(GridCell, { children: rule.description }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(GridCell, { children: rule.ruleGroup ? /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { children: rule.ruleGroup }) : null }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(GridCell, { children: rule.type === "rule" ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: rule.scoreModifier < 0 ? "text-green-primary" : "text-red-primary", children: formatNumber(rule.scoreModifier, {
                      language,
                      signDisplay: "exceptZero"
                    }) }) : rule.forcedOutcome ? /* @__PURE__ */ jsxRuntimeExports.jsx(OutcomeBadge, { outcome: rule.forcedOutcome, size: "md" }) : null })
                  ]
                }
              ) }),
              rule.type === "rule" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Content$1, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-full p-md grid grid-cols-[1rem_1fr] items-center gap-x-sm radix-state-open:animate-slide-down radix-state-closed:animate-slide-up", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-grey-border rounded-md px-md py-sm bg-surface-card max-w-3/4 col-start-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RuleView, { scenarioId: scenario.id, ruleId: rule.id }) }) }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Content$1, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-full p-md grid grid-cols-[1rem_1fr] items-center gap-x-sm radix-state-open:animate-slide-down radix-state-closed:animate-slide-up", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-grey-border rounded-md px-md py-sm bg-surface-card max-w-3/4 col-start-2 flex flex-col gap-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Trans,
                  {
                    t: t2,
                    i18nKey: "scenarios:rules.screening_view.trigger_intro",
                    values: { triggerObject: scenario.triggerObjectType },
                    components: { Tag: /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: "grey" }) }
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "list-disc flex flex-col gap-sm pl-5", children: [
                  rule.triggerRule && !isUndefinedAstNode(rule.triggerRule) ? /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "list-item", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-col gap-sm", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t2("scenarios:rules.screening_view.trigger_condition") }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(AstBuilder.Provider, { scenarioId: scenario.id, mode: "view", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AstBuilder.Root, { node: rule.triggerRule }) })
                  ] }) }) : null,
                  rule.entityType && rule.query ? /* @__PURE__ */ jsxRuntimeExports.jsx(ScreeningRuleQueryView, { entityType: rule.entityType, query: rule.query }) : null,
                  rule.counterPartyId && isDataAccessorAstNode(rule.counterPartyId) ? /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "list-item", children: [
                    t2("scenarios:rules.screening_view.counterparty_id"),
                    " ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: "grey", children: getDataAccessorDisplayName(rule.counterPartyId) })
                  ] }) : null
                ] }),
                rule.forcedOutcome ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Trans,
                  {
                    t: t2,
                    i18nKey: "scenarios:rules.screening_view.match_outcome",
                    values: { threshold: rule.threshold ?? org.sanctionThreshold },
                    components: {
                      Tag: /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: "grey" }),
                      Outcome: /* @__PURE__ */ jsxRuntimeExports.jsx(OutcomeBadge, { outcome: rule.forcedOutcome })
                    }
                  }
                ) }) : null
              ] }) }) })
            ]
          },
          `${rule.type}_${rule.id}`
        );
      })
    ] }) }),
    editorMode === "edit" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Root, { open: currentEditing?.type === "rule", onOpenChange: onPanelOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Container, { size: isAiRuleDescriptionEnabled ? "large" : "medium", children: currentEditing?.type === "rule" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        RuleEditPanel,
        {
          scenario,
          ruleId: currentEditing.id,
          ruleGroups,
          scenarioValidation,
          isAiRuleDescriptionEnabled,
          onSuccess: handleRuleEditSuccess,
          onDelete: handleRuleDelete
        }
      ) : null }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Root, { open: currentEditing?.type === "sanction", onOpenChange: onPanelOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Container, { size: "medium", children: currentScreeningRule ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        ScreeningRuleEditPanel,
        {
          rule: currentScreeningRule,
          scenario,
          iterationId,
          configs: screeningConfigs,
          ruleGroups,
          scenarioValidation,
          isNameRecognitionAvailable,
          onSuccess: handleScreeningRuleEditSuccess,
          onDelete: handleRuleDelete
        }
      ) : null }) })
    ] }) : null
  ] });
}
function GridCell({ children, className }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("p-md", className), children });
}
function HeaderCell({ children, className }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(GridCell, { className: cn("font-normal text-left not-first:border-l border-grey-border", className), children });
}
const RuleView = ({ scenarioId, ruleId }) => {
  const { t: t2 } = useTranslation(["common"]);
  const ruleQuery = useScenarioIterationRule(ruleId);
  return M(ruleQuery).with({ isError: true }, ({ error }) => /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: error.message })).with({ isPending: true }, () => /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: t2("common:loading") })).with({ isSuccess: true }, ({ data }) => {
    if (!data.rule.formula) {
      return null;
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AstBuilder.Provider, { scenarioId, mode: "view", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AstBuilder.Root, { node: data.rule.formula }) });
  }).exhaustive();
};
const AddRuleOrScreening = ({
  scenarioId,
  iterationId,
  isSanctionAvailable,
  onSuccess
}) => {
  const { t: t2 } = useTranslation(["common", "scenarios", "decisions", "filters"]);
  const [open, setOpen] = reactExports.useState(false);
  const handleSuccess = (value) => {
    setOpen(false);
    onSuccess(value);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Root2$2, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Trigger$2, { className: CtaV2ClassName({ variant: "primary", color: "primary", size: "medium" }), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "plus", className: "size-6" }),
      t2("common:add")
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Content2$1,
      {
        align: "end",
        className: "bg-surface-card border-grey-border z-10 mt-sm flex flex-col gap-sm rounded-sm border p-sm",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            CreateRule,
            {
              scenarioId,
              iterationId,
              onSuccess: (ruleId) => handleSuccess({ id: ruleId, type: "rule" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            CreateScreeningButton,
            {
              scenarioId,
              iterationId,
              isSanctionAvailable,
              onSuccess: (screeningId) => handleSuccess({ id: screeningId, type: "sanction" })
            }
          )
        ]
      }
    )
  ] });
};
const filterNodes = (value) => {
  return !!value[1] && isStringConcatAstNode(value[1]);
};
const ScreeningRuleQueryView = ({ entityType, query }) => {
  const { t: t2 } = useTranslation(["common", "scenarios"]);
  const queries = t$1(t$2(query), n$2(filterNodes));
  return /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "list-item", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[auto_1fr] gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Trans,
      {
        t: t2,
        i18nKey: "scenarios:rules.screening_view.we_look_for",
        values: { entityType },
        components: { Tag: /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: "grey" }) }
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-sm", children: queries.map(([k, q]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: "grey", children: k }),
      " ",
      t2("scenarios:rules.screening_view.included_in"),
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex gap-xs", children: q.children.map((node) => /* @__PURE__ */ jsxRuntimeExports.jsx(DataAccessorAstNodeTag, { node }, node.id)) })
    ] }, q.id)) })
  ] }) });
};
const DataAccessorAstNodeTag = ({ node }) => {
  if (!isDataAccessorAstNode(node)) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: "grey", children: getDataAccessorDisplayName(node) });
};
function PageComponent() {
  const router = useRouter();
  const iterationId = useParam("iterationId");
  const {
    editorMode,
    rulesList,
    screeningsConfigs,
    currentScenario,
    scenarioValidation
  } = Route.useRouteContext();
  const {
    isAiRuleDescriptionEnabled,
    isSanctionAvailable,
    isNameRecognitionAvailable
  } = Route.useLoaderData();
  const ruleGroups = useDerivedIterationRuleGroupsData();
  const handleRuleEditSuccess = async () => {
    await router.invalidate();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(RulesPage, { scenario: currentScenario, iterationId, screeningConfigs: screeningsConfigs, scenarioValidation, editorMode, list: rulesList, ruleGroups, isSanctionAvailable, isAiRuleDescriptionEnabled, isNameRecognitionAvailable, onRuleEditSuccess: handleRuleEditSuccess });
}
export {
  PageComponent as component
};
