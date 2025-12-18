import { r as reactExports, R as jsxRuntimeExports } from "../server.js";
import { av as casesI18n } from "./router-vb7i5euz.js";
import { ez as useDirection, dG as useControllableState, dI as useComposedRefs, dH as composeEventHandlers, dJ as createContextScope, ft as usePrevious, dM as useSize, u as useTranslation, e4 as Modal, B as Button, e as Icon, d as cn, t as useFormatDateTime, e8 as MenuCommand, e5 as Calendar, fu as isSameDay } from "./format-NPGUXq-g.js";
import { a9 as constructFrom, aa as toDate, de as millisecondsInHour, aw as addDays, aQ as finalOutcomes, M, az as isBefore, a8 as addMonths } from "./services-middleware-DR8Hua1Y.js";
import { F as FormErrorOrDescription } from "./FormErrorOrDescription-DO6Hdfmn.js";
import { F as FormLabel } from "./FormLabel-DeCgtgtj.js";
import { F as FormTextArea } from "./FormTextArea-BlK7vs_g.js";
import { u as useLoaderRevalidator } from "./LoaderRevalidatorContext-C9s56i-l.js";
import { u as useCloseCaseMutation, a as useOpenCaseMutation } from "./open-case-BHErop52.js";
import { g as getFieldErrors, s as submitOnCtrlEnter, h as handleSubmit } from "./form-D2XmDKeG.js";
import { P as Primitive } from "./index-C_WgunUr.js";
import { R as Root, c as createRovingFocusGroupScope, I as Item } from "./index-BsFKI8Kt.js";
import { P as Presence } from "./index-CR1bHmei.js";
import { u as useForm, a as useStore } from "./useForm-BwABQKAs.js";
import { z as zt } from "./CopyToClipboardButton-CJNJJful.js";
import { c as closeCasePayloadSchema, o as openCasePayloadSchema, s as snoozeCasePayloadSchema } from "./cases-PZYcTUxr.js";
import { C as Callout } from "./Callout-DX4NBXlG.js";
import { E as editSuspicionFn, F as snoozeCaseFn } from "./cases-DJ9ABIdo.js";
import { y as useQueryClient } from "./QueryClientProvider-DYTpkCko.js";
import { u as useMutation } from "./useMutation-C5oG90Zs.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
import { s as srcExports } from "./Time-IafhAG3W.js";
import { c as constructNow } from "./constructNow-sBxu05z3.js";
function addMilliseconds(date, amount, options) {
  return constructFrom(date, +toDate(date) + amount);
}
function addHours(date, amount, options) {
  return addMilliseconds(date, amount * millisecondsInHour);
}
function getDay(date, options) {
  return toDate(date, options?.in).getDay();
}
function isMonday(date, options) {
  return toDate(date, options?.in).getDay() === 1;
}
function startOfHour(date, options) {
  const _date = toDate(date, options?.in);
  _date.setMinutes(0, 0, 0);
  return _date;
}
function nextDay(date, day, options) {
  let delta = day - getDay(date, options);
  if (delta <= 0) delta += 7;
  return addDays(date, delta, options);
}
function nextMonday(date, options) {
  return nextDay(date, 1, options);
}
function startOfTomorrow(options) {
  const now = constructNow(options?.in);
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();
  const date = constructFrom(options?.in, 0);
  date.setFullYear(year, month, day + 1);
  date.setHours(0, 0, 0, 0);
  return date;
}
var RADIO_NAME = "Radio";
var [createRadioContext, createRadioScope] = createContextScope(RADIO_NAME);
var [RadioProviderImpl, useRadioContext] = createRadioContext(RADIO_NAME);
function RadioProvider(props) {
  const {
    __scopeRadio,
    checked = false,
    children,
    disabled,
    form,
    name,
    onCheck,
    required,
    value = "on",
    // @ts-expect-error
    internal_do_not_use_render
  } = props;
  const [control, setControl] = reactExports.useState(null);
  const [bubbleInput, setBubbleInput] = reactExports.useState(null);
  const hasConsumerStoppedPropagationRef = reactExports.useRef(false);
  const isFormControl = control ? !!form || !!control.closest("form") : (
    // We set this to true by default so that events bubble to forms without JS (SSR)
    true
  );
  const context = {
    checked,
    disabled,
    required,
    name,
    form,
    value,
    control,
    setControl,
    hasConsumerStoppedPropagationRef,
    isFormControl,
    bubbleInput,
    setBubbleInput,
    onCheck: () => onCheck?.()
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(RadioProviderImpl, { scope: __scopeRadio, ...context, children: isFunction(internal_do_not_use_render) ? internal_do_not_use_render(context) : children });
}
var TRIGGER_NAME = "RadioTrigger";
var RadioTrigger = reactExports.forwardRef(
  ({ __scopeRadio, onClick, ...radioProps }, forwardedRef) => {
    const {
      checked,
      disabled,
      value,
      setControl,
      onCheck,
      hasConsumerStoppedPropagationRef,
      isFormControl,
      bubbleInput
    } = useRadioContext(TRIGGER_NAME, __scopeRadio);
    const composedRefs = useComposedRefs(forwardedRef, setControl);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.button,
      {
        type: "button",
        role: "radio",
        "aria-checked": checked,
        "data-state": getState(checked),
        "data-disabled": disabled ? "" : void 0,
        disabled,
        value,
        ...radioProps,
        ref: composedRefs,
        onClick: composeEventHandlers(onClick, (event) => {
          if (!checked) onCheck();
          if (bubbleInput && isFormControl) {
            hasConsumerStoppedPropagationRef.current = event.isPropagationStopped();
            if (!hasConsumerStoppedPropagationRef.current) event.stopPropagation();
          }
        })
      }
    );
  }
);
RadioTrigger.displayName = TRIGGER_NAME;
var Radio = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeRadio, name, checked, required, disabled, value, onCheck, form, ...radioProps } = props;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      RadioProvider,
      {
        __scopeRadio,
        checked,
        disabled,
        required,
        onCheck,
        name,
        form,
        value,
        internal_do_not_use_render: ({ isFormControl }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            RadioTrigger,
            {
              ...radioProps,
              ref: forwardedRef,
              __scopeRadio
            }
          ),
          isFormControl && /* @__PURE__ */ jsxRuntimeExports.jsx(
            RadioBubbleInput,
            {
              __scopeRadio
            }
          )
        ] })
      }
    );
  }
);
Radio.displayName = RADIO_NAME;
var INDICATOR_NAME = "RadioIndicator";
var RadioIndicator = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeRadio, forceMount, ...indicatorProps } = props;
    const context = useRadioContext(INDICATOR_NAME, __scopeRadio);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Presence, { present: forceMount || context.checked, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.span,
      {
        "data-state": getState(context.checked),
        "data-disabled": context.disabled ? "" : void 0,
        ...indicatorProps,
        ref: forwardedRef
      }
    ) });
  }
);
RadioIndicator.displayName = INDICATOR_NAME;
var BUBBLE_INPUT_NAME = "RadioBubbleInput";
var RadioBubbleInput = reactExports.forwardRef(
  ({ __scopeRadio, ...props }, forwardedRef) => {
    const {
      control,
      checked,
      required,
      disabled,
      name,
      value,
      form,
      bubbleInput,
      setBubbleInput,
      hasConsumerStoppedPropagationRef
    } = useRadioContext(BUBBLE_INPUT_NAME, __scopeRadio);
    const composedRefs = useComposedRefs(forwardedRef, setBubbleInput);
    const prevChecked = usePrevious(checked);
    const controlSize = useSize(control);
    reactExports.useEffect(() => {
      const input = bubbleInput;
      if (!input) return;
      const inputProto = window.HTMLInputElement.prototype;
      const descriptor = Object.getOwnPropertyDescriptor(
        inputProto,
        "checked"
      );
      const setChecked = descriptor.set;
      const bubbles = !hasConsumerStoppedPropagationRef.current;
      if (prevChecked !== checked && setChecked) {
        const event = new Event("click", { bubbles });
        setChecked.call(input, checked);
        input.dispatchEvent(event);
      }
    }, [bubbleInput, prevChecked, checked, hasConsumerStoppedPropagationRef]);
    const defaultCheckedRef = reactExports.useRef(checked);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.input,
      {
        type: "radio",
        "aria-hidden": true,
        defaultChecked: defaultCheckedRef.current,
        required,
        disabled,
        name,
        value,
        form,
        ...props,
        tabIndex: -1,
        ref: composedRefs,
        style: {
          ...props.style,
          ...controlSize,
          position: "absolute",
          pointerEvents: "none",
          opacity: 0,
          margin: 0,
          // We transform because the input is absolutely positioned but we have
          // rendered it **after** the button. This pulls it back to sit on top
          // of the button.
          transform: "translateX(-100%)"
        }
      }
    );
  }
);
RadioBubbleInput.displayName = BUBBLE_INPUT_NAME;
function isFunction(value) {
  return typeof value === "function";
}
function getState(checked) {
  return checked ? "checked" : "unchecked";
}
var ARROW_KEYS = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
var RADIO_GROUP_NAME = "RadioGroup";
var [createRadioGroupContext] = createContextScope(RADIO_GROUP_NAME, [
  createRovingFocusGroupScope,
  createRadioScope
]);
var useRovingFocusGroupScope = createRovingFocusGroupScope();
var useRadioScope = createRadioScope();
var [RadioGroupProvider, useRadioGroupContext] = createRadioGroupContext(RADIO_GROUP_NAME);
var RadioGroup = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeRadioGroup,
      name,
      defaultValue,
      value: valueProp,
      required = false,
      disabled = false,
      orientation,
      dir,
      loop = true,
      onValueChange,
      ...groupProps
    } = props;
    const rovingFocusGroupScope = useRovingFocusGroupScope(__scopeRadioGroup);
    const direction = useDirection(dir);
    const [value, setValue] = useControllableState({
      prop: valueProp,
      defaultProp: defaultValue ?? null,
      onChange: onValueChange,
      caller: RADIO_GROUP_NAME
    });
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      RadioGroupProvider,
      {
        scope: __scopeRadioGroup,
        name,
        required,
        disabled,
        value,
        onValueChange: setValue,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Root,
          {
            asChild: true,
            ...rovingFocusGroupScope,
            orientation,
            dir: direction,
            loop,
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Primitive.div,
              {
                role: "radiogroup",
                "aria-required": required,
                "aria-orientation": orientation,
                "data-disabled": disabled ? "" : void 0,
                dir: direction,
                ...groupProps,
                ref: forwardedRef
              }
            )
          }
        )
      }
    );
  }
);
RadioGroup.displayName = RADIO_GROUP_NAME;
var ITEM_NAME = "RadioGroupItem";
var ITEM_PROVIDER_NAME = "RadioGroupItemProvider";
var ITEM_TRIGGER_NAME = "RadioGroupItemTrigger";
var ITEM_BUBBLE_INPUT_NAME = "RadioGroupItemBubbleInput";
function RadioGroupItemProvider(props) {
  const {
    __scopeRadioGroup,
    value,
    disabled,
    children,
    // @ts-expect-error
    internal_do_not_use_render
  } = props;
  const context = useRadioGroupContext(ITEM_PROVIDER_NAME, __scopeRadioGroup);
  const radioScope = useRadioScope(__scopeRadioGroup);
  const isDisabled = context.disabled || disabled;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    RadioProvider,
    {
      ...radioScope,
      checked: context.value === value,
      disabled: isDisabled,
      required: context.required,
      name: context.name,
      value,
      onCheck: () => context.onValueChange(value),
      internal_do_not_use_render,
      children
    }
  );
}
var RadioGroupItemTrigger = reactExports.forwardRef((props, forwardedRef) => {
  const { __scopeRadioGroup, ...triggerProps } = props;
  const rovingFocusGroupScope = useRovingFocusGroupScope(__scopeRadioGroup);
  const radioScope = useRadioScope(__scopeRadioGroup);
  const { checked, disabled } = useRadioContext(ITEM_TRIGGER_NAME, radioScope.__scopeRadio);
  const ref = reactExports.useRef(null);
  const composedRefs = useComposedRefs(forwardedRef, ref);
  const isArrowKeyPressedRef = reactExports.useRef(false);
  reactExports.useEffect(() => {
    const handleKeyDown = (event) => {
      if (ARROW_KEYS.includes(event.key)) {
        isArrowKeyPressedRef.current = true;
      }
    };
    const handleKeyUp = () => isArrowKeyPressedRef.current = false;
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Item,
    {
      asChild: true,
      ...rovingFocusGroupScope,
      focusable: !disabled,
      active: checked,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        RadioTrigger,
        {
          ...radioScope,
          ...triggerProps,
          ref: composedRefs,
          onKeyDown: composeEventHandlers(triggerProps.onKeyDown, (event) => {
            if (event.key === "Enter") event.preventDefault();
          }),
          onFocus: composeEventHandlers(triggerProps.onFocus, () => {
            if (isArrowKeyPressedRef.current) {
              ref.current?.click();
            }
          })
        }
      )
    }
  );
});
RadioGroupItemTrigger.displayName = ITEM_TRIGGER_NAME;
var RadioGroupItem = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeRadioGroup, value, disabled, ...itemProps } = props;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      RadioGroupItemProvider,
      {
        __scopeRadioGroup,
        value,
        disabled,
        internal_do_not_use_render: ({ isFormControl }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            RadioGroupItemTrigger,
            {
              ...itemProps,
              ref: forwardedRef,
              __scopeRadioGroup
            }
          ),
          isFormControl && /* @__PURE__ */ jsxRuntimeExports.jsx(
            RadioGroupItemBubbleInput,
            {
              __scopeRadioGroup
            }
          )
        ] })
      }
    );
  }
);
RadioGroupItem.displayName = ITEM_NAME;
var RadioGroupItemBubbleInput = reactExports.forwardRef((props, forwardedRef) => {
  const { __scopeRadioGroup, ...bubbleProps } = props;
  const radioScope = useRadioScope(__scopeRadioGroup);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(RadioBubbleInput, { ...radioScope, ...bubbleProps, ref: forwardedRef });
});
RadioGroupItemBubbleInput.displayName = ITEM_BUBBLE_INPUT_NAME;
var INDICATOR_NAME2 = "RadioGroupIndicator";
var RadioGroupIndicator = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeRadioGroup, ...indicatorProps } = props;
    const radioScope = useRadioScope(__scopeRadioGroup);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(RadioIndicator, { ...radioScope, ...indicatorProps, ref: forwardedRef });
  }
);
RadioGroupIndicator.displayName = INDICATOR_NAME2;
const CloseCase = ({
  id,
  disabled,
  withoutOutcome
}) => {
  const { t } = useTranslation([...casesI18n, "common"]);
  const closeCaseMutation = useCloseCaseMutation();
  const revalidate = useLoaderRevalidator();
  const [open, setOpen] = reactExports.useState(false);
  const form = useForm({
    defaultValues: {
      caseId: id,
      comment: "",
      outcome: void 0
    },
    onSubmit: ({ value }) => {
      closeCaseMutation.mutateAsync(value).then(() => {
        setOpen(false);
        revalidate();
      }).catch(() => {
        zt.error(t("common:errors.unknown"));
      });
    },
    validators: {
      onSubmit: closeCasePayloadSchema
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Root, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Trigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "primary", className: "flex-1 first-letter:capitalize", disabled, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "save", className: "size-3.5" }),
      t("cases:case.close")
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Content, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: t("cases:case.close") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit(form), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xl p-xl", children: [
          !withoutOutcome ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            form.Field,
            {
              name: "outcome",
              validators: {
                onChange: closeCasePayloadSchema.shape.outcome,
                onBlur: closeCasePayloadSchema.shape.outcome
              },
              children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { name: field.name, children: t("cases:case.close.choose_outcome") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  RadioGroup,
                  {
                    name: field.name,
                    onValueChange: (v) => field.handleChange(v),
                    onBlur: field.handleBlur,
                    className: "flex items-center gap-xs rtl:flex-row-reverse",
                    children: finalOutcomes.map((s) => {
                      return /* @__PURE__ */ jsxRuntimeExports.jsx(
                        RadioGroupItem,
                        {
                          value: s,
                          className: "border-grey-border data-[state=checked]:border-purple-hover flex items-center justify-center rounded-[20px] border bg-transparent p-xs",
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "span",
                            {
                              className: cn("rounded-full border px-sm py-2xs text-xs", {
                                "border-red-primary text-red-primary": s === "confirmed_risk",
                                "border-green-secondary text-green-secondary": s === "false_positive",
                                "border-orange-primary text-orange-primary": s === "valuable_alert"
                              }),
                              children: M(s).with("confirmed_risk", () => t("cases:case.outcome.confirmed_risk")).with("valuable_alert", () => t("cases:case.outcome.valuable_alert")).with("false_positive", () => t("cases:case.outcome.false_positive")).exhaustive()
                            }
                          )
                        },
                        s
                      );
                    })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors) })
              ] })
            }
          ) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            form.Field,
            {
              name: "comment",
              validators: {
                onChange: closeCasePayloadSchema.shape.comment,
                onBlur: closeCasePayloadSchema.shape.comment
              },
              children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  FormTextArea,
                  {
                    name: field.name,
                    defaultValue: field.state.value,
                    placeholder: t("cases:case.close.add_comment_placeholder"),
                    valid: field.state.meta.errors.length === 0,
                    onChange: (e) => field.handleChange(e.currentTarget.value),
                    onKeyDown: submitOnCtrlEnter
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors) })
              ] })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Footer, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { isCloseButton: true, label: t("common:cancel") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { label: t("common:validate"), type: "submit" })
        ] })
      ] })
    ] })
  ] });
};
const OpenCase = ({ id }) => {
  const { t } = useTranslation([...casesI18n, "common"]);
  const openCaseMutation = useOpenCaseMutation();
  const revalide = useLoaderRevalidator();
  const [open, setOpen] = reactExports.useState(false);
  const form = useForm({
    defaultValues: { caseId: id, comment: "" },
    onSubmit: ({ value }) => {
      openCaseMutation.mutateAsync(value).then(() => {
        setOpen(false);
        revalide();
      }).catch(() => {
        zt.error(t("common:errors.unknown"));
      });
    },
    validators: {
      onSubmit: openCasePayloadSchema
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Root, { open, onOpenChange: setOpen, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Trigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "primary", className: "flex-1 first-letter:capitalize", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "save", className: "size-3.5" }),
      t("cases:case.reopen")
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Content, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: t("cases:case.reopen") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit(form), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xl p-xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Callout, { children: t("cases:reopen-case.modal.callout") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            form.Field,
            {
              name: "comment",
              validators: {
                onChange: openCasePayloadSchema.shape.comment,
                onBlur: openCasePayloadSchema.shape.comment
              },
              children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { name: field.name, children: "Add a comment" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  FormTextArea,
                  {
                    name: field.name,
                    defaultValue: field.state.value,
                    placeholder: "Input your comment here",
                    valid: field.state.meta.errors.length === 0,
                    onChange: (e) => field.handleChange(e.currentTarget.value),
                    onKeyDown: submitOnCtrlEnter
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors(field.state.meta.errors) })
              ] })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Footer, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { isCloseButton: true, label: t("common:cancel") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { label: t("cases:reopen-case.modal.submit-button.label"), type: "submit" })
        ] })
      ] })
    ] })
  ] });
};
const useEditSuspicionMutation = () => {
  const editSuspicion = useServerFn(editSuspicionFn);
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["cases", "edit-suspicion"],
    mutationFn: async (payload) => editSuspicion({ data: srcExports.serialize(payload) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
    }
  });
};
const useSnoozeCaseMutation = () => {
  const snoozeCase = useServerFn(snoozeCaseFn);
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["cases", "snooze-case"],
    mutationFn: async (payload) => snoozeCase({ data: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
    }
  });
};
const setTo9AM = (date) => {
  const d = new Date(date);
  d.setHours(9, 0, 0, 0);
  return d;
};
const getDurations = () => {
  const now = /* @__PURE__ */ new Date();
  const tomorrow = addDays(now, 1);
  const oneWeek = addDays(now, 7);
  const oneMonth = addMonths(now, 1);
  const nextMon = nextMonday(now);
  const options = [
    { duration: "tomorrow", date: setTo9AM(tomorrow) },
    { duration: "oneWeek", date: setTo9AM(oneWeek) },
    { duration: "oneMonth", date: setTo9AM(oneMonth) }
  ];
  if (!isMonday(tomorrow) && !isSameDay(nextMon, oneWeek)) {
    options.splice(1, 0, { duration: "nextMonday", date: setTo9AM(nextMon) });
  }
  return options;
};
function SnoozeCase({ caseId, snoozeUntil }) {
  const { t } = useTranslation(casesI18n);
  const formatDateTime = useFormatDateTime();
  const snoozeCaseMutation = useSnoozeCaseMutation();
  const revalidate = useLoaderRevalidator();
  const [isOpen, setIsOpen] = reactExports.useState(false);
  const formatDate = (date) => formatDateTime(date, { dateStyle: "medium", timeStyle: "short" });
  const form = useForm({
    onSubmit: ({ value }) => {
      const finalValue = {
        ...value,
        snoozeUntil: snoozeUntil ? null : value.snoozeUntil
      };
      snoozeCaseMutation.mutateAsync(finalValue).then(() => {
        revalidate();
      });
    },
    validators: {
      onSubmitAsync: snoozeCasePayloadSchema
    },
    defaultValues: {
      snoozeUntil: snoozeUntil ?? null,
      caseId
    }
  });
  useStore(form.store, (state) => state.values.snoozeUntil);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    form.Field,
    {
      name: "snoozeUntil",
      validators: {
        onBlur: snoozeCasePayloadSchema.shape.snoozeUntil,
        onChange: snoozeCasePayloadSchema.shape.snoozeUntil
      },
      children: (field) => field.state.value ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "secondary",
          onClick: () => {
            field.handleChange(null);
            form.handleSubmit();
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "snooze-on", className: "size-5", "aria-hidden": true }),
            t("cases:unsnooze_case.title")
          ]
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Menu, { open: isOpen, onOpenChange: setIsOpen, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Trigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "snooze", className: "size-4", "aria-hidden": true }),
          t("cases:snooze_case.title")
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Content, { className: "mt-sm min-w-[264px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.List, { children: [
          getDurations().map(({ duration, date }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            MenuCommand.Item,
            {
              onSelect: () => {
                field.handleChange(field.state.value === date.toISOString() ? null : date.toISOString());
                form.handleSubmit();
              },
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-r inline-flex items-center gap-xs", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: M(duration).with("tomorrow", () => t("common:snooze.tomorrow")).with("oneWeek", () => t("common:snooze.oneWeek")).with("oneMonth", () => t("common:snooze.oneMonth")).with("nextMonday", () => t("common:snooze.nextMonday")).exhaustive() }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xs text-grey-secondary", children: formatDate(date) })
              ] })
            },
            duration
          )),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            MenuCommand.SubMenu,
            {
              arrow: false,
              hover: false,
              trigger: /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-r inline-flex h-full items-center gap-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("common:snooze.custom") }) }) }),
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.List, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Calendar,
                {
                  mode: "single",
                  selected: field.state.value ? new Date(field.state.value) : void 0,
                  disabled: { before: startOfTomorrow() },
                  onSelect: (date) => {
                    if (date) {
                      field.handleChange(
                        isBefore(date, /* @__PURE__ */ new Date()) ? startOfHour(addHours(/* @__PURE__ */ new Date(), 3)).toISOString() : setTo9AM(date).toISOString()
                      );
                      setIsOpen(false);
                      form.handleSubmit();
                    }
                  }
                }
              ) })
            }
          )
        ] }) })
      ] })
    }
  );
}
export {
  CloseCase as C,
  OpenCase as O,
  SnoozeCase as S,
  useEditSuspicionMutation as u
};
