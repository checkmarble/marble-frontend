import { r as reactExports, R as jsxRuntimeExports } from "../server.js";
import { eH as createStoreContext, eI as CompositeScopedContextProvider, eJ as CompositeContextProvider, eK as memo, eL as forwardRef, eM as createElement, eN as createHook, eO as useId, eP as useStoreState, eQ as useTagName, eR as disabledFromProps, eS as useForceUpdate, eT as useEvent, eU as useMergeRefs, eV as useCompositeItem, eW as removeUndefinedValues, eX as invariant, eY as useWrapElement, eZ as isFocusEventOutside, e_ as useComposite, e$ as createCompositeStore, f0 as defaultValue, f1 as createStore, f2 as useCompositeStoreOptions, f3 as useStore, f4 as useCompositeStoreProps, f5 as useStoreProps, u as useTranslation, j as Tag, e as Icon, b as clsx, f as cva } from "./format-NPGUXq-g.js";
import { s as screeningsI18n } from "./router-vb7i5euz.js";
const ctx = createStoreContext([CompositeContextProvider], [CompositeScopedContextProvider]);
const useRadioContext = ctx.useContext;
const useRadioProviderContext = ctx.useProviderContext;
const RadioContextProvider = ctx.ContextProvider;
const RadioScopedContextProvider = ctx.ScopedContextProvider;
const TagName$1 = "input";
function getIsChecked(value, storeValue) {
  if (storeValue === void 0) return;
  if (value != null && storeValue != null) return storeValue === value;
  return !!storeValue;
}
function isNativeRadio(tagName, type) {
  return tagName === "input" && (!type || type === "radio");
}
const useRadio = createHook(function useRadio2({ store, name: nameProp, value, checked, ...props }) {
  const context = useRadioContext();
  store = store || context;
  const id = useId(props.id);
  const ref = reactExports.useRef(null);
  const isChecked = useStoreState(store, (state) => checked ?? getIsChecked(value, state?.value));
  const storeId = useStoreState(store, "id");
  const name = nameProp ?? storeId;
  reactExports.useEffect(() => {
    if (!id) return;
    if (!isChecked) return;
    if (store?.getState().activeId === id) return;
    store?.setActiveId(id);
  }, [
    store,
    isChecked,
    id
  ]);
  const onChangeProp = props.onChange;
  const nativeRadio = isNativeRadio(useTagName(ref, TagName$1), props.type);
  const disabled = disabledFromProps(props);
  const [propertyUpdated, schedulePropertyUpdate] = useForceUpdate();
  reactExports.useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (nativeRadio) return;
    if (isChecked !== void 0) element.checked = isChecked;
    if (name !== void 0) element.name = name;
    if (value !== void 0) element.value = `${value}`;
  }, [
    propertyUpdated,
    nativeRadio,
    isChecked,
    name,
    value
  ]);
  const onChange = useEvent((event) => {
    if (disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (store?.getState().value === value) return;
    if (!nativeRadio) {
      event.currentTarget.checked = true;
      schedulePropertyUpdate();
    }
    onChangeProp?.(event);
    if (event.defaultPrevented) return;
    store?.setValue(value);
  });
  const onClickProp = props.onClick;
  const onClick = useEvent((event) => {
    onClickProp?.(event);
    if (event.defaultPrevented) return;
    if (nativeRadio) return;
    onChange(event);
  });
  const onFocusProp = props.onFocus;
  const onFocus = useEvent((event) => {
    onFocusProp?.(event);
    if (event.defaultPrevented) return;
    if (!nativeRadio) return;
    if (!store) return;
    const { moves, activeId } = store.getState();
    if (!moves) return;
    if (id && activeId !== id) return;
    onChange(event);
  });
  props = {
    role: !nativeRadio ? "radio" : void 0,
    type: nativeRadio ? "radio" : void 0,
    "aria-checked": isChecked,
    ...props,
    id,
    ref: useMergeRefs(ref, props.ref),
    onChange,
    onClick,
    onFocus
  };
  props = useCompositeItem({
    store,
    clickOnEnter: !nativeRadio,
    ...props
  });
  return removeUndefinedValues({
    name: nativeRadio ? name : void 0,
    value: nativeRadio ? value : void 0,
    checked: isChecked,
    ...props
  });
});
const Radio = memo(forwardRef(function Radio2(props) {
  return createElement(TagName$1, useRadio(props));
}));
const TagName = "div";
function isCheckedRadio(element) {
  if (!element) return false;
  if (element.tagName === "INPUT") {
    const { type, checked } = element;
    if (type === "radio") return checked;
  }
  if (element.getAttribute("role") !== "radio") return false;
  return element.getAttribute("aria-checked") === "true";
}
function getCheckedRadioId(store) {
  const { renderedItems } = store.getState();
  return renderedItems.find((item) => isCheckedRadio(item.element))?.id;
}
const useRadioGroup = createHook(function useRadioGroup2({ store, ...props }) {
  const context = useRadioProviderContext();
  store = store || context;
  invariant(store, false);
  props = useWrapElement(props, (element) => /* @__PURE__ */ jsxRuntimeExports.jsx(RadioScopedContextProvider, {
    value: store,
    children: element
  }), [store]);
  const onBlurCaptureProp = props.onBlurCapture;
  const onBlurCapture = useEvent((event) => {
    onBlurCaptureProp?.(event);
    if (event.defaultPrevented) return;
    if (!isFocusEventOutside(event)) return;
    const checkedId = getCheckedRadioId(store);
    if (!checkedId) return;
    store.setActiveId(checkedId);
  });
  props = {
    role: "radiogroup",
    ...props,
    onBlurCapture
  };
  props = useComposite({
    store,
    ...props
  });
  return props;
});
const RadioGroup = forwardRef(function RadioGroup2(props) {
  return createElement(TagName, useRadioGroup(props));
});
function createRadioStore(props = {}) {
  const syncState = props.store?.getState();
  const composite = createCompositeStore({
    ...props,
    focusLoop: defaultValue(props.focusLoop, syncState?.focusLoop, true)
  });
  const radio2 = createStore({
    ...composite.getState(),
    value: defaultValue(props.value, syncState?.value, props.defaultValue, null)
  }, composite, props.store);
  return {
    ...composite,
    ...radio2,
    setValue: (value) => radio2.setState("value", value)
  };
}
function useRadioStoreProps(store, update, props) {
  store = useCompositeStoreProps(store, update, props);
  useStoreProps(store, props, "value", "setValue");
  return store;
}
function useRadioStore(props = {}) {
  props = useCompositeStoreOptions(props);
  const [store, update] = useStore(createRadioStore, props);
  return useRadioStoreProps(store, update, props);
}
function RadioProvider(props = {}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(RadioContextProvider, {
    value: useRadioStore(props),
    children: props.children
  });
}
const statusTagColors = {
  pending: "orange",
  no_hit: "grey",
  confirmed_hit: "red",
  skipped: "grey"
};
function StatusTag({ status, disabled, onClick }) {
  const { t } = useTranslation(screeningsI18n);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Tag,
    {
      color: statusTagColors[status],
      onClick: () => !disabled && onClick?.(),
      className: clsx("inline-flex h-8 gap-xs", {
        "cursor-pointer": !!onClick && !disabled
      }),
      children: [
        t(`screenings:match.status.${status}`),
        !disabled ? /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "caret-down", className: "size-5" }) : null
      ]
    }
  );
}
function StatusRadioGroup({ value, onChange }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(RadioProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(RadioGroup, { className: "flex flex-col gap-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(RadioItem, { value: "confirmed_hit", checked: value === "confirmed_hit", onCheck: () => onChange("confirmed_hit"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusTag, { disabled: true, status: "confirmed_hit" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(RadioItem, { value: "no_hit", checked: value === "no_hit", onCheck: () => onChange("no_hit"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusTag, { disabled: true, status: "no_hit" }) })
  ] }) });
}
const radio = cva("transition-colors flex items-center gap-sm rounded-sm", {
  variants: {
    checked: {
      true: "text-purple-primary",
      false: "text-grey-secondary cursor-pointer"
    }
  }
});
function RadioItem({ value, children, checked, onCheck }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: clsx(radio({ checked }), ""), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, { name: "status", className: "hidden", value, checked, onChange: onCheck }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: checked ? "radio-selected" : "radio-unselected", className: "size-6" }),
    children
  ] });
}
export {
  RadioProvider as R,
  StatusTag as S,
  RadioGroup as a,
  RadioItem as b,
  StatusRadioGroup as c
};
