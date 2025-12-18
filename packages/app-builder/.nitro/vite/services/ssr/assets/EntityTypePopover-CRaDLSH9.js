import { R as jsxRuntimeExports, r as reactExports } from "../server.js";
import { S as SEARCH_ENTITIES } from "./screening-entity-DVQtf50p.js";
import { t as tryCatch, C as CountryFlag } from "./DataField-vckdVtrg.js";
import { c as createSimpleContext, u as useTranslation, e9 as Popover, j as Tag, e as Icon, d as cn, eh as SelectCountry, e1 as Input, B as Button, dC as formatCountryName } from "./format-NPGUXq-g.js";
import { s as screeningsI18n } from "./router-vb7i5euz.js";
import { s as setAdditionalFields } from "./set-additional-fields-BAjwURJS.js";
import { a as useStore } from "./useForm-BwABQKAs.js";
import { t } from "./keys-CPbIGTB1.js";
const EntitySearchFormContext = createSimpleContext("EntitySearchForm");
function EntitySearchFormProvider({ form, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(EntitySearchFormContext.Provider, { value: form, children });
}
function useEntitySearchForm() {
  return EntitySearchFormContext.useValue();
}
function useEntitySearchFormStore(selector) {
  const { store } = useEntitySearchForm();
  return useStore(store, selector);
}
const EntityTypePopover = ({ disabled }) => {
  const { t: t$1 } = useTranslation(screeningsI18n);
  const [open, setOpen] = reactExports.useState(false);
  const form = useEntitySearchForm();
  const value = useEntitySearchFormStore((state) => state.values.entityType);
  const [additionalFieldsOpenRequest, setAdditionalFieldsOpenRequest] = reactExports.useState(0);
  const handleSelect = (schema) => {
    form.setFieldValue("entityType", schema);
    form.setFieldValue("fields", setAdditionalFields(SEARCH_ENTITIES[schema].fields, form.state.values.fields));
    setOpen(false);
    if (schema !== "Thing") {
      setAdditionalFieldsOpenRequest((count) => count + 1);
    }
  };
  const hasSelection = value && value !== "Thing";
  const schemas = t(SEARCH_ENTITIES);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover.Root, { open, onOpenChange: setOpen, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Popover.Trigger, { asChild: true, disabled, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-sm flex-wrap", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Tag,
        {
          color: disabled ? "grey" : "purple",
          className: "cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: hasSelection ? t$1(`screenings:refine_modal.schema.${value.toLowerCase()}`) : t$1("screenings:freeform_search.all_entities") })
        }
      ) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Popover.Content,
        {
          className: "bg-surface-card border-grey-border z-50 flex w-[400px] flex-col rounded-lg border shadow-lg",
          sideOffset: 4,
          align: "start",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-[300px] overflow-y-auto p-sm", children: schemas.map((schema) => {
            const schemaKey = schema.toLowerCase();
            const fieldForSchema = SEARCH_ENTITIES[schema].fields;
            const isSelected = value === schema;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: () => handleSelect(schema),
                className: cn(
                  "text-s flex w-full items-center gap-sm rounded px-md py-xs text-left",
                  isSelected ? "bg-purple-background-light text-purple-primary" : "hover:bg-grey-background-light"
                ),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: t$1(`screenings:refine_modal.schema.${schemaKey}`) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-grey-placeholder text-xs", children: [
                      t$1("screenings:refine_modal.search_by"),
                      " ",
                      fieldForSchema.map((f) => t$1(`screenings:entity.property.${f}`)).join(", ")
                    ] })
                  ] }),
                  isSelected && /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "tick", className: "text-purple-primary size-4" })
                ]
              },
              schema
            );
          }) })
        }
      )
    ] }),
    hasSelection && /* @__PURE__ */ jsxRuntimeExports.jsx(AdditionalEntityTypePopover, { disabled, openRequest: additionalFieldsOpenRequest })
  ] });
};
function AdditionalEntityTypePopover({ disabled, openRequest }) {
  const [open, setOpen] = reactExports.useState(false);
  const form = useEntitySearchForm();
  const entityType = useEntitySearchFormStore((state) => state.values.entityType);
  const entityTypeFields = entityType && entityType in SEARCH_ENTITIES ? SEARCH_ENTITIES[entityType].fields.filter((f) => f !== "name") : [];
  const { t: t2, i18n } = useTranslation(screeningsI18n);
  const fields = useEntitySearchFormStore((state) => state.values.fields);
  const lastProcessedOpenRequest = reactExports.useRef(0);
  const [localFields, setLocalFields] = reactExports.useState({});
  const [birthDateError, setBirthDateError] = reactExports.useState(void 0);
  const syncLocalFromForm = () => {
    const next = {};
    for (const fieldName of entityTypeFields) {
      next[fieldName] = fields[fieldName] ?? "";
    }
    setLocalFields(next);
    setBirthDateError(void 0);
  };
  const handleOpenChange = (isOpen) => {
    if (disabled) return;
    if (isOpen) {
      syncLocalFromForm();
    } else {
      setBirthDateError(void 0);
    }
    setOpen(isOpen);
  };
  reactExports.useEffect(() => {
    if (openRequest <= lastProcessedOpenRequest.current || disabled) return;
    lastProcessedOpenRequest.current = openRequest;
    syncLocalFromForm();
    setOpen(true);
  }, [openRequest, disabled]);
  const handleApply = () => {
    const birthDateValue = localFields["birthDate"] ?? "";
    if (entityTypeFields.includes("birthDate") && birthDateValue) {
      if (!/^\d{4}(-\d{2}-\d{2})?$/.test(birthDateValue)) {
        setBirthDateError(t2("screenings:freeform_search.birth_date_invalid"));
        return;
      }
    }
    setBirthDateError(void 0);
    form.setFieldValue("fields", { ...form.state.values.fields, ...localFields });
    setOpen(false);
  };
  const handleCancel = () => {
    syncLocalFromForm();
    setOpen(false);
  };
  const hasSelection = entityType && entityType !== "Thing";
  const filterTags = hasSelection ? SEARCH_ENTITIES[entityType].fields.filter((f) => f !== "name").map((fieldName) => {
    const fieldValue = fields[fieldName];
    if (!fieldValue) return null;
    const label = getFilterTagLabel(fieldName, fieldValue, t2);
    if (!label) return null;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Tag,
      {
        color: disabled ? "grey" : "purple",
        className: "cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: label })
      },
      fieldName
    );
  }).filter(Boolean) : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover.Root, { open, onOpenChange: handleOpenChange, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Popover.Trigger, { asChild: true, disabled, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        className: "flex items-center gap-sm flex-wrap",
        "aria-label": t2("screenings:freeform_search.advanced_filters"),
        children: [
          filterTags,
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Icon,
            {
              icon: "plus",
              className: cn(
                "size-4 text-purple-primary cursor-pointer ",
                disabled && "text-grey-placeholder opacity-50 cursor-not-allowed "
              )
            }
          )
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Popover.Content,
      {
        className: "bg-surface-card border-grey-border z-50 flex w-[400px] flex-col rounded-lg border shadow-lg",
        sideOffset: 8,
        align: "start",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-sm grid grid-cols-2 gap-sm lg:grid-cols-1 p-sm", children: entityTypeFields.map((fieldName, index) => {
            const isLastOdd = index === entityTypeFields.length - 1 && entityTypeFields.length % 2 === 1;
            const localValue = localFields[fieldName] ?? "";
            if (fieldName === "country" || fieldName === "nationality") {
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                SelectCountry,
                {
                  name: `fields.${fieldName}`,
                  rootClassName: cn("w-full", isLastOdd && "col-span-2 lg:col-span-1"),
                  className: "w-full",
                  value: countryFormStringToValue(localValue, i18n.language),
                  onValueChange: (v) => setLocalFields((prev) => ({ ...prev, [fieldName]: countryValueToFormString(v) })),
                  placeholder: t2(`screenings:entity.property.${fieldName}`)
                },
                fieldName
              );
            }
            if (fieldName === "birthDate") {
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("flex flex-col gap-xs", isLastOdd && "col-span-2 lg:col-span-1"), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Input,
                  {
                    name: `fields.${fieldName}`,
                    value: localValue,
                    onChange: (e) => setLocalFields((prev) => ({ ...prev, [fieldName]: e.target.value })),
                    className: "w-full",
                    placeholder: t2("screenings:entity.property.birthDate.format")
                  }
                ),
                birthDateError && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-primary text-xs", children: birthDateError })
              ] }, fieldName);
            }
            return /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                name: `fields.${fieldName}`,
                value: localValue,
                onChange: (e) => setLocalFields((prev) => ({ ...prev, [fieldName]: e.target.value })),
                className: cn("w-full", isLastOdd && "col-span-2 lg:col-span-1"),
                placeholder: t2(`screenings:entity.property.${fieldName}`)
              },
              fieldName
            );
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Popover.Footer, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "secondary", size: "large", onClick: handleCancel, children: t2("common:cancel") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "primary", size: "large", onClick: handleApply, children: t2("screenings:freeform_search.apply") })
          ] })
        ]
      }
    )
  ] });
}
function getFilterTagLabel(fieldName, value, t2) {
  switch (fieldName) {
    case "country":
    case "nationality":
    case "birthDate":
      return value;
    case "passportNumber":
      return t2("screenings:freeform_search.tag.passport", { value });
    case "address": {
      const truncated = value.length > 15 ? `${value.slice(0, 15)}…` : value;
      return t2("screenings:freeform_search.tag.address", { value: truncated });
    }
    case "registrationNumber":
      return t2("screenings:freeform_search.tag.registration", { value });
    default:
      return null;
  }
}
function countryFormStringToValue(raw, language) {
  const trimmed = raw.trim();
  if (trimmed === "") return null;
  const cc = trimmed.length <= 3 ? trimmed.toUpperCase() : trimmed;
  const res = tryCatch(() => CountryFlag.byCountryCode(cc));
  if (res.ok) {
    const c = res.value;
    return {
      isoAlpha2: c.isoAlpha2,
      isoAlpha3: c.isoAlpha3,
      name: formatCountryName(c.isoAlpha2, language) ?? c.nameEnglish,
      isManual: false
    };
  }
  return { isoAlpha2: "", isoAlpha3: "", name: trimmed, isManual: true };
}
function countryValueToFormString(v) {
  if (!v) return "";
  if (v.isManual) return v.name;
  return v.isoAlpha3;
}
export {
  EntitySearchFormProvider as E,
  EntityTypePopover as a
};
