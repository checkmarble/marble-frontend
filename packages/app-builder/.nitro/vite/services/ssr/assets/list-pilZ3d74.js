import { r as reactExports, R as jsxRuntimeExports, O as useRouter, $ as ClientOnly } from "../server.js";
import { C as Callout, a as CalloutV2 } from "./Callout-DX4NBXlG.js";
import { c as createSimpleContext, u as useTranslation, e as Icon, T as Typo, B as Button, dZ as SelectV2, e1 as Input, dz as Switch, e4 as Modal, e0 as NumberInput, ef as ScrollAreaV2, d as cn, b as clsx, ep as Stepper, e8 as MenuCommand } from "./format-NPGUXq-g.js";
import { M as handle, P as Page } from "./router-vb7i5euz.js";
import { u as useLoaderRevalidator } from "./LoaderRevalidatorContext-C9s56i-l.js";
import { i as importOrgFileFn, d as importOrgFn, e as applyArchetypeFn, l as listArchetypesFn, f as createTableFn } from "./data-BFm2FCTm.js";
import { u as useMutation } from "./useMutation-C5oG90Zs.js";
import { u as useServerFn } from "./useServerFn-CrqFKl7V.js";
import { z as zt } from "./CopyToClipboardButton-CJNJJful.js";
import { f as dataModelNameRegex, g as getSemanticSubOptions, h as getMockValue, i as isValidDataModelName, j as enumColors, k as isLinkableTable } from "./data-fdG1PpsD.js";
import { u as useQuery } from "./useQuery-B7mL_evE.js";
import { P as Panel } from "./Panel-kj8Z2GDk.js";
import { u as useDataModel, a as useDataModelFeatureAccess } from "./data-model-B-Bz1o1P.js";
import { g as getFieldErrors$1, h as handleSubmit } from "./form-D2XmDKeG.js";
import { u as useForm, a as useStore } from "./useForm-BwABQKAs.js";
import { M, z, bw as ftmEntityPersonOptions, bx as ftmEntities, aW as semanticTypesByDataType, by as isSemanticTypeField, aZ as linkRelationTypes } from "./services-middleware-DR8Hua1Y.js";
import { F as FormErrorOrDescription } from "./FormErrorOrDescription-DO6Hdfmn.js";
import { F as FormInput } from "./FormInput-S5xzkMXf.js";
import { F as FormLabel } from "./FormLabel-DeCgtgtj.js";
import { f as DataField, i as inferSemanticTypeFromName } from "./DataField-vckdVtrg.js";
import { u as useDatatypeOptions, D as DatatypeIcon } from "./DatatypeOption-Csn4su3e.js";
import { D as DragDropContext, C as ConnectedDroppable, P as PublicDraggable } from "./dnd.esm-C6lpwR_j.js";
import { u as useCallbackRef } from "./use-callback-ref-DXzIzfqy.js";
import { S as Spinner } from "./Spinner-GK6cEAdR.js";
import { i as isTableMutationError, f as formatTableMutationError } from "./table-mutation-errors-DAbLsi0Q.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "stream";
import "util";
import "./sharpstate.es-CeF1Mf5b.js";
import "./isNullish-B8pc8Ntu.js";
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
import "./useBaseQuery-CMboOtTR.js";
import "./create-context-CYc8deix.js";
import "./array-BFSjnO9c.js";
import "node:crypto";
import "./index-x7n7VJTa.js";
import "./index-C_WgunUr.js";
import "./isNonNullish-DgEqPJBU.js";
import "./dataTypeSchema-DvqJgdgd.js";
import "./mapToObj-wQ-uHOuD.js";
import "./omit-ZO4dmkWK.js";
const defaultCreateTableFields = [
  {
    id: "default_object_id",
    name: "object_id",
    description: "",
    dataType: "String",
    tableId: "",
    isEnum: false,
    nullable: false,
    alias: "object_id",
    hidden: false,
    unicityConstraint: "no_unicity_constraint",
    semanticType: "unique_id",
    semanticSubType: "opaque_id",
    isNew: false,
    locked: true
  },
  {
    id: "default_updated_at",
    name: "updated_at",
    description: "",
    dataType: "Timestamp",
    tableId: "",
    isEnum: false,
    nullable: false,
    alias: "updated_at",
    hidden: false,
    unicityConstraint: "no_unicity_constraint",
    semanticType: "last_update",
    semanticSubType: void 0,
    isNew: false,
    locked: true
  }
];
const defaultCreateTableFormValues = {
  tableId: "",
  name: "",
  alias: "",
  entityType: "person",
  subEntity: "moral",
  belongsToTableId: "",
  fields: defaultCreateTableFields,
  mainTimestampFieldName: "updated_at",
  links: [],
  metaData: {},
  isCanceled: false,
  isVisited: false
};
const entityTypesRequiringLink = ["transaction", "event", "account"];
const tableEntityStepCommonShape = {
  name: z.string().min(1).regex(dataModelNameRegex, {
    error: "Table/name: Only lower case alphanumeric and _, must start with a letter"
  }),
  alias: z.string(),
  belongsToTableId: z.string()
};
const createTableEntityStepSchema = z.object({
  ...tableEntityStepCommonShape,
  entityType: z.enum(ftmEntities),
  subEntity: z.enum(ftmEntityPersonOptions).optional()
}).refine(
  (data) => {
    if (data.entityType === "person") return !!data.subEntity;
    return true;
  },
  { error: "Please select a sub-entity", path: ["subEntity"] }
).refine(
  (data) => {
    if (requiresLink(data.entityType)) return data.belongsToTableId.length > 0;
    return true;
  },
  { error: "Please select a destination table", path: ["belongsToTableId"] }
);
const editTableEntityStepSchema = z.object({
  ...tableEntityStepCommonShape,
  entityType: z.union([z.enum(ftmEntities), z.literal("unset")]),
  subEntity: z.union([z.enum(ftmEntityPersonOptions), z.literal("unset")]).optional()
}).refine(
  (data) => {
    if (data.entityType === "person") return !!data.subEntity && data.subEntity !== "unset";
    return true;
  },
  { error: "Please select a sub-entity", path: ["subEntity"] }
).refine(
  (data) => {
    if (data.entityType === "unset") return true;
    if (requiresLink(data.entityType)) return data.belongsToTableId.length > 0;
    return true;
  },
  { error: "Please select a destination table", path: ["belongsToTableId"] }
);
function requiresLink(entityType) {
  return entityTypesRequiringLink.includes(entityType);
}
function adaptSemanticField(semanticType, subType) {
  return M(semanticType).with(void 0, () => void 0).with("text", () => void 0).with(
    "name",
    () => M(subType).with(void 0, () => void 0).with("first_name", () => "first_name").with("middle_name", () => "middle_name").with("last_name", () => "last_name").with("caption", () => "name").otherwise(() => void 0)
  ).with("enum", () => "enum").with("currency_code", () => "currency").with("foreign_key", () => "foreign_key").with("country", () => "country").with("address", () => "address").with("unique_id", () => "id").with(
    "link",
    () => M(subType).with(void 0, () => void 0).with("url", () => "url").with("email", () => "email").with("phone", () => "phone_number").otherwise(() => void 0)
  ).with(
    "account_identifier",
    () => M(subType).with(void 0, () => void 0).with("account_number", () => "account_number").with("iban", () => "iban").with("bic", () => "bic").otherwise(() => void 0)
  ).with("timestamp", () => void 0).with("date_of_birth", () => "date_of_birth").with("last_update", () => "last_update").with("creation_date", () => "creation_date").with("deletion_date", () => "deletion_date").with("initiation_date", () => "initiation_date").with("validation_date", () => "validation_date").with("number", () => void 0).with("monetary_amount", () => "monetary_amount").with("percentage", () => "percentage").otherwise(() => void 0);
}
function adaptCreateTableValue(values) {
  return {
    name: values.name,
    alias: values.alias || values.name,
    semantic_type: getEntityType(
      values.entityType === "unset" ? "other" : values.entityType,
      values.subEntity === "unset" ? "moral" : values.subEntity
    ),
    description: "",
    fields: values.fields.map(adaptTableField),
    links: values.links.map(adaptLink),
    primary_ordering_field: values.mainTimestampFieldName || "updated_at",
    metadata: {
      belongsToTableId: values.belongsToTableId || void 0,
      fieldOrder: values.fields.map((f) => f.name).join(",")
    }
  };
}
function adaptTableField(field) {
  return {
    name: field.name,
    description: field.description,
    type: field.dataType,
    alias: field.alias || field.name,
    nullable: field.nullable,
    is_enum: field.isEnum || field.semanticType === "enum",
    is_unique: field.unicityConstraint === "active_unique_constraint",
    semantic_type: adaptSemanticField(field.semanticType, field.semanticSubType),
    metadata: {
      semanticTypeForFront: field.semanticType,
      semanticSubType: field.semanticSubType,
      currencyExponent: field.currencyExponent,
      decimalPrecision: field.decimalPrecision,
      currencyFieldId: field.currencyFieldId,
      foreignkeyTable: field.foreignkeyTable,
      hidden: field.hidden,
      booleanDisplay: field.booleanDisplay,
      isInteger: field.isInteger
    }
  };
}
function adaptLink(link) {
  return {
    name: link.name,
    child_field_name: link.tableFieldId,
    link_type: link.relationType,
    parent_table_id: link.targetTableId
  };
}
function getEntityType(entityType, subEntity) {
  const fieldEntity = M(entityType).with("person", () => getEntitySubtype(subEntity)).with("transaction", () => "transaction").with("event", () => "event").with("other", () => "other").with("account", () => "account").exhaustive();
  return fieldEntity;
}
function getEntitySubtype(subEntity) {
  return M(subEntity).with("moral", () => "company").with("natural", () => "person").with("generic", () => "partner").exhaustive();
}
const tableConstraints = [
  { name: "object_id", type: "unique_id", subType: "opaque_id" },
  { name: "updated_at", type: "last_update" },
  { type: "name", dataType: "person" }
];
const knownTableFields = ["name", "entityType", "subEntity", "belongsToTableId"];
function getTablePropertyErrors(values, creationMode = false) {
  const parsing = creationMode ? createTableEntityStepSchema.safeParse(values) : editTableEntityStepSchema.safeParse(values);
  if (!parsing.success) {
    return parsing.error.issues.map((issue) => ({
      kind: "table",
      field: knownTableFields.includes(issue.path[0]) ? issue.path[0] : "name",
      message: issue.message
    }));
  }
  return [];
}
function resolveBelongsToParentTableId(table) {
  return table.belongsToTableId ?? table.linksToSingle.find((link) => link.relationType === "belongs_to")?.parentTableId;
}
function getEntityTypeChangeErrors(values, t, tables) {
  if (!tables || !values.tableId) return [];
  const previousTable = tables.find((table) => table.id === values.tableId);
  if (!previousTable) return [];
  const previousEntityType = previousTable.semanticType ?? "";
  const nextEntityType = values.entityType === "unset" ? "" : values.entityType;
  if (previousEntityType !== "person" || nextEntityType === "person") return [];
  const hasBlockingChild = tables.some((table) => {
    if (table.id === values.tableId) return false;
    if (!requiresLink(table.semanticType ?? "")) return false;
    return resolveBelongsToParentTableId(table) === values.tableId;
  });
  if (!hasBlockingChild) return [];
  return [
    {
      kind: "table",
      field: "entityType",
      message: t("data:create_table.person_parent_entity_type_change_forbidden")
    }
  ];
}
function getConstraintErrors(values, t) {
  const errors = [];
  const constraints = [...tableConstraints];
  const entityType = values.entityType === "unset" ? "" : values.entityType;
  for (const constraint of constraints) {
    if (constraint) {
      const { name, type, subType, dataType } = constraint;
      if (dataType !== void 0 && dataType !== entityType) continue;
      const found = values.fields.some((f) => {
        if (name && f.name !== name) return false;
        if (type && f.semanticType !== type) return false;
        if (subType && f.semanticSubType !== subType) return false;
        return true;
      });
      if (!found) {
        errors.push({
          kind: "table",
          field: "name",
          message: t("data:create_table.missing_required_field", { field: name ?? type })
        });
      }
    }
  }
  return errors;
}
function getFieldErrors(values, t) {
  const errors = [];
  const nameCounts = /* @__PURE__ */ new Map();
  for (const field of values.fields) {
    if (!field.name.trim()) {
      errors.push({
        kind: "field",
        fieldId: field.id,
        message: t("data:create_table.field_name_required", { field: field.alias || field.id })
      });
    } else if (!dataModelNameRegex.test(field.name)) {
      errors.push({
        kind: "field",
        fieldId: field.id,
        message: t("data:create_table.field_name_regex_error", { field: field.name })
      });
    } else {
      const ids = nameCounts.get(field.name) ?? [];
      ids.push(field.id);
      nameCounts.set(field.name, ids);
    }
  }
  for (const [name, ids] of nameCounts) {
    if (ids.length > 1) {
      for (const fieldId of ids) {
        errors.push({ kind: "field", fieldId, message: t("data:create_table.duplicate_field_name", { name }) });
      }
    }
  }
  return errors;
}
function getLinkErrors(values, t) {
  const errors = [];
  const nameCounts = /* @__PURE__ */ new Map();
  const entityType = values.entityType === "unset" ? "" : values.entityType;
  const hasBelongsToLink = values.links.some((link) => link.relationType === "belongs_to");
  for (const link of values.links) {
    const linkField = values.fields.find((field) => field.name === link.tableFieldId);
    const trimmedName = link.name.trim();
    if (!trimmedName) {
      errors.push({ kind: "link", linkId: link.linkId, message: t("data:create_table.link_missing_name") });
    } else if (!dataModelNameRegex.test(trimmedName)) {
      errors.push({
        kind: "link",
        linkId: link.linkId,
        message: t("data:create_table.link_name_regex_error", { link: link.name })
      });
    } else {
      const ids = nameCounts.get(trimmedName) ?? [];
      ids.push(link.linkId);
      nameCounts.set(trimmedName, ids);
    }
    if (!link.targetTableId) {
      errors.push({
        kind: "link",
        linkId: link.linkId,
        message: t("data:create_table.link_target_table_required", { link: link.name || "(unnamed)" })
      });
    }
    if (!link.tableFieldId) {
      errors.push({
        kind: "link",
        linkId: link.linkId,
        message: t("data:create_table.link_field_required", { link: link.name || "(unnamed)" })
      });
    }
    if (linkField?.name === "object_id") {
      errors.push({
        kind: "link",
        linkId: link.linkId,
        message: t("data:create_table.link_object_id_cannot_point_to_current_table", {
          link: link.name || "(unnamed)"
        })
      });
    }
    if (requiresLink(entityType) && !hasBelongsToLink) {
      errors.push({
        kind: "link",
        linkId: link.linkId,
        message: t("data:create_table.link_to_related_table_required")
      });
    }
  }
  for (const [name, ids] of nameCounts) {
    if (ids.length > 1) {
      for (const linkId of ids) {
        errors.push({ kind: "link", linkId, message: t("data:create_table.duplicate_link_name", { name }) });
      }
    }
  }
  return errors;
}
function validateValues(values, scope = "all", t, creationMode = false, tables) {
  const errors = [];
  if (scope === "table" || scope === "all") {
    const hasUpdatedAt = values.fields.some((f) => f.name === "updated_at");
    if (!values.mainTimestampFieldName && hasUpdatedAt) values.mainTimestampFieldName = "updated_at";
    errors.push(...getTablePropertyErrors(values, creationMode));
    if (!creationMode) {
      errors.push(...getEntityTypeChangeErrors(values, t, tables));
    }
    if (!values.mainTimestampFieldName) {
      errors.push({
        kind: "table",
        field: "mainTimestampFieldName",
        message: t("data:create_table.one_timestamp_field_should_be_selected_as_the_main_ordering_field")
      });
    }
  }
  if (scope === "fields" || scope === "all") {
    errors.push(...getConstraintErrors(values, t), ...getFieldErrors(values, t));
  }
  if (scope === "links" || scope === "all") {
    errors.push(...getLinkErrors(values, t));
  }
  return errors.length > 0 ? { ok: false, errors } : { ok: true };
}
const CREATE_TABLE_SELF_LINK_TARGET_ID = "__create_table_self_link__";
const LinksEditorContext = createSimpleContext("LinksEditor");
const FieldsEditorContext = createSimpleContext("FieldsEditor");
function FieldDetailPanel({
  fieldId,
  onClose,
  title,
  tableOptions,
  links,
  removeLink
}) {
  const { fields, updateField, removeField, mainTimestampFieldName, setMainTimestampFieldName } = FieldsEditorContext.useValue();
  const dataModel = useDataModel();
  const { isEditDataModelInfoAvailable, isDeleteDataModelFieldAvailable } = useDataModelFeatureAccess();
  const [hasBeenChangedManually, setHasBeenChangedManually] = reactExports.useState(false);
  const { t } = useTranslation(["data", "common"]);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = reactExports.useState(false);
  const field = fields.find((f) => f.id === fieldId);
  const typeSelectRef = reactExports.useRef(null);
  const aliasInputRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (field?.isNew) {
      typeSelectRef.current?.focus();
    } else {
      aliasInputRef.current?.focus();
    }
    setHasBeenChangedManually(false);
  }, [fieldId]);
  const isNameDuplicate = reactExports.useMemo(() => {
    if (!field) return false;
    return fields.some((f) => f.id !== fieldId && f.name === field.name);
  }, [field, fieldId, fields]);
  const typeSelectOptions = useDatatypeOptions();
  const resolvedTableOptions = reactExports.useMemo(() => {
    const dataModelTableOptions = dataModel.map((table) => ({
      label: table.alias || table.name,
      value: table.name
    }));
    return [...dataModelTableOptions, ...tableOptions ?? []].filter(
      (option, index, allOptions) => allOptions.findIndex(({ value }) => value === option.value) === index
    );
  }, [dataModel, tableOptions]);
  const semanticOptions = reactExports.useMemo(() => {
    if (!field) return [];
    const options = semanticTypesByDataType[field.dataType];
    if (!options) return [];
    return options.filter((opt) => opt.value !== "foreign_key" || resolvedTableOptions.length > 0).map(
      (opt) => ({
        label: t(`data:upload_data.field_semantic.${opt.value}`),
        value: opt.value
      })
    );
  }, [field, resolvedTableOptions.length, t]);
  const semanticSubOptions = reactExports.useMemo(() => {
    if (!field || !field.semanticType) return [];
    const subOpts = getSemanticSubOptions(field.dataType, field.semanticType);
    if (!subOpts) return [];
    return subOpts.map(
      (opt) => ({
        label: t(`data:upload_data.field_semantic_sub.${opt.value}`),
        value: opt.value
      })
    );
  }, [field, t]);
  const currencyFieldOptions = reactExports.useMemo(
    () => fields.filter((f) => f.id !== fieldId && f.semanticType === "currency_code").map((f) => ({ label: f.alias || f.name, value: f.name })),
    [fields, fieldId]
  );
  const linkedLinks = reactExports.useMemo(
    () => (links ?? []).filter((l) => l.tableFieldId === field?.name || l.tableFieldId === fieldId),
    [links, field?.name, fieldId]
  );
  if (!field) return null;
  const isLocked = field.locked ?? false;
  const hasLinks = linkedLinks.length > 0;
  const canDeleteField = (field.isNew || isDeleteDataModelFieldAvailable) && !field.locked && !hasLinks;
  function update(values) {
    if (isEditDataModelInfoAvailable) updateField(fieldId, values);
  }
  function handleDeleteClick() {
    if (linkedLinks.length > 0) {
      setConfirmDeleteOpen(true);
    } else {
      performDelete();
    }
  }
  function performDelete() {
    if (!canDeleteField) return;
    if (field?.name === mainTimestampFieldName) {
      setMainTimestampFieldName("updated_at");
    }
    removeField(fieldId);
    for (const link of linkedLinks) {
      removeLink?.(link.linkId);
    }
    onClose();
  }
  function inferTypeFromName(field2) {
    if (hasBeenChangedManually) return;
    if (!field2.isNew) return;
    const { semanticType, semanticSubType } = inferSemanticTypeFromName(field2.name, field2.dataType, field2.isEnum);
    update({
      semanticType,
      semanticSubType
    });
  }
  const mockedValue = getMockValue(field.dataType, field.semanticType, field.semanticSubType);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-1/2 shrink-0 flex-col border-l border-grey-border overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-md border-b border-grey-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onClose, className: "rounded-lg p-xs hover:bg-grey-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "x", className: "size-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typo, { variant: "subtitle2", children: title ?? t("data:upload_data.field_detail_title") })
        ] }),
        canDeleteField ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: handleDeleteClick, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "delete", className: "size-4" }) }) : null,
        hasLinks && /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "linked-services", className: "size-4" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-lg p-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-s text-grey-secondary", children: t("data:upload_data.field_type_label") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            SelectV2,
            {
              ref: typeSelectRef,
              value: field.dataType,
              placeholder: "",
              onChange: (value) => update({
                dataType: value,
                semanticType: void 0,
                semanticSubType: void 0,
                foreignkeyTable: void 0,
                currencyFieldId: void 0,
                currencyExponent: void 0,
                decimalPrecision: void 0,
                booleanDisplay: void 0,
                isInteger: void 0,
                enumValues: void 0
              }),
              options: typeSelectOptions,
              disabled: isLocked || !field.isNew
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-s text-grey-secondary", children: t("data:upload_data.field_name_label") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: field.name,
              onChange: (e) => update({ name: e.currentTarget.value }),
              disabled: isLocked || !field.isNew,
              onBlur: () => inferTypeFromName(field)
            }
          ),
          isNameDuplicate ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-primary", children: t("data:upload_data.field_name_unique_error") }) : null,
          !field.name ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-primary", children: t("data:upload_data.field_name_required_error") }) : null,
          field.name && !isValidDataModelName(field.name) ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-primary", children: t("data:create_field.name_regex_error") }) : null
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-s text-grey-secondary", children: t("data:upload_data.field_alias") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { ref: aliasInputRef, value: field.alias, onChange: (e) => update({ alias: e.currentTarget.value }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-md", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { className: "text-s font-medium text-grey-secondary", children: t("data:upload_data.field_advanced_settings") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-s text-grey-secondary", children: t("data:upload_data.field_description_label") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: field.description,
                onChange: (e) => update({ description: e.currentTarget.value }),
                placeholder: t("data:upload_data.field_description_placeholder")
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-sm cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Switch,
              {
                checked: !field.nullable,
                onCheckedChange: (checked) => update({ nullable: !checked }),
                disabled: isLocked
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s", children: t("data:upload_data.field_required") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-sm cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: field.hidden, onCheckedChange: (checked) => update({ hidden: checked }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s", children: t("data:upload_data.field_hidden") })
          ] })
        ] }),
        semanticOptions.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-s text-grey-secondary", children: t("data:upload_data.field_semantic_type") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            SelectV2,
            {
              value: field.semanticType,
              placeholder: t("data:upload_data.field_semantic_placeholder"),
              onChange: (value) => {
                if (!isSemanticTypeField(value)) return;
                const subOpts = getSemanticSubOptions(field.dataType, value);
                const isCurrentSubTypeValid = subOpts?.some((opt) => opt.value === field.semanticSubType) ?? false;
                const firstSubType = subOpts?.[0]?.value;
                setHasBeenChangedManually(true);
                update({
                  semanticType: value,
                  semanticSubType: isCurrentSubTypeValid ? field.semanticSubType : firstSubType
                });
              },
              options: semanticOptions,
              disabled: isLocked
            }
          )
        ] }) : null,
        semanticSubOptions.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-s text-grey-secondary", children: t("data:upload_data.field_semantic_sub_type") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            SelectV2,
            {
              value: field.semanticSubType,
              placeholder: "",
              onChange: (value) => {
                setHasBeenChangedManually(true);
                update({ semanticSubType: value });
              },
              options: semanticSubOptions,
              disabled: isLocked
            }
          )
        ] }) : null,
        field.semanticType === "foreign_key" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          ForeignKeySettings,
          {
            foreignkeyTable: field.foreignkeyTable,
            onChange: update,
            tableOptions: resolvedTableOptions,
            disabled: isLocked
          }
        ) : null,
        field.semanticType === "monetary_amount" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          CurrencySettings,
          {
            field,
            currencyFieldOptions,
            onChange: update,
            disabled: isLocked
          }
        ) : null,
        field.semanticType === "number" ? /* @__PURE__ */ jsxRuntimeExports.jsx(NumberSettings, { field, onChange: update, disabled: isLocked }) : null,
        field.semanticType === "enum" && field.semanticSubType === "key_color_value" ? /* @__PURE__ */ jsxRuntimeExports.jsx(EnumValuesSettings, { field, onChange: update, disabled: isLocked }) : null,
        field.dataType === "Bool" ? /* @__PURE__ */ jsxRuntimeExports.jsx(BooleanSettings, { booleanDisplay: field.booleanDisplay, onChange: update, disabled: isLocked }) : null,
        field.dataType === "Timestamp" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          TimestampSettings,
          {
            fieldName: field.name,
            mainTimestampFieldName,
            setMainTimestampFieldName,
            disabled: isLocked
          }
        ) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-s text-grey-secondary italic", children: t("data:upload_data.field_visual_example") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border border-grey-border bg-grey-98 p-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-md", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-xs rounded border border-grey-border font-mono w-full text-xs text-grey-secondary", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: `${t("data:upload_data.raw_data")} { "${field.name}": ${typeof mockedValue === "string" ? '"' : ""}${mockedValue}${typeof mockedValue === "string" ? '"' : ""}}` }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              DataField,
              {
                field: {
                  id: field.id,
                  dataType: field.dataType,
                  description: field.description,
                  isEnum: false,
                  name: field.alias || field.name,
                  nullable: field.nullable,
                  tableId: "id",
                  unicityConstraint: "no_unicity_constraint",
                  semanticType: field.semanticType,
                  semanticSubType: field.semanticSubType,
                  currencyExponent: field.currencyExponent,
                  decimalPrecision: field.decimalPrecision,
                  currencyFieldId: field.currencyFieldId,
                  booleanDisplay: field.booleanDisplay,
                  isInteger: field.isInteger,
                  foreignkeyTable: field.foreignkeyTable
                },
                value: mockedValue
              }
            )
          ] }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Root, { open: confirmDeleteOpen, onOpenChange: setConfirmDeleteOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Content, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: t("data:delete_field.title", { name: field.alias || field.name }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-s text-grey-primary", children: t("data:delete_field.confirm_with_links", {
        linkNames: linkedLinks.map((l) => l.name).join(", ")
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Footer, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { isCloseButton: true, label: t("common:cancel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Modal.FooterButton,
          {
            label: t("common:delete"),
            onClick: performDelete,
            variant: "destructive",
            leadingIcon: "delete"
          }
        )
      ] })
    ] }) })
  ] });
}
function CurrencySettings({
  field,
  currencyFieldOptions,
  onChange,
  disabled
}) {
  const { t } = useTranslation(["data"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm rounded-lg border border-grey-border p-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-secondary", children: t("data:upload_data.field_currency_settings") }),
    currencyFieldOptions.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-s text-grey-secondary", children: t("data:upload_data.field_currency_field") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        SelectV2,
        {
          value: field.currencyFieldId,
          placeholder: t("data:upload_data.field_currency_field_placeholder"),
          onChange: (value) => onChange({ currencyFieldId: value }),
          options: currencyFieldOptions,
          disabled
        }
      )
    ] }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-s text-grey-secondary", children: t("data:upload_data.field_currency_exponent") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        NumberInput,
        {
          min: 0,
          max: 10,
          value: field.currencyExponent ?? 0,
          onChange: (value) => onChange({ currencyExponent: Math.min(10, Math.max(0, value)) }),
          disabled
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-s text-grey-secondary", children: t("data:upload_data.field_decimal_precision") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        NumberInput,
        {
          min: 0,
          max: 10,
          value: field.decimalPrecision ?? 2,
          onChange: (value) => onChange({ decimalPrecision: Math.min(10, Math.max(0, value)) }),
          disabled
        }
      )
    ] })
  ] });
}
function NumberSettings({
  field,
  onChange,
  disabled
}) {
  const { t } = useTranslation(["data"]);
  const isInteger = field.isInteger ?? true;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm rounded-lg border border-grey-border p-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-secondary", children: t("data:upload_data.field_number_settings") }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-sm cursor-pointer", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Switch,
        {
          checked: isInteger,
          onCheckedChange: (checked) => onChange({ isInteger: checked }),
          disabled
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s", children: t("data:upload_data.field_is_integer") })
    ] }),
    !isInteger ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-s text-grey-secondary", children: t("data:upload_data.field_decimal_precision") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        NumberInput,
        {
          min: 0,
          max: 10,
          value: field.decimalPrecision ?? 2,
          onChange: (value) => onChange({ decimalPrecision: Math.min(10, Math.max(0, value)) }),
          disabled
        }
      )
    ] }) : null
  ] });
}
function BooleanSettings({
  booleanDisplay,
  onChange,
  disabled
}) {
  const { t } = useTranslation(["data"]);
  const options = [
    { label: t("data:upload_data.field_boolean_display_switch"), value: "checkbox" },
    { label: t("data:upload_data.field_boolean_display_yes_no"), value: "yes_no" }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm rounded-lg border border-grey-border p-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-secondary", children: t("data:upload_data.field_boolean_settings") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-sm", children: options.map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick: () => onChange({ booleanDisplay: opt.value }),
        className: `flex-1 rounded-lg border px-sm py-xs text-s transition-colors ${(booleanDisplay ?? "checkbox") === opt.value ? "border-purple-primary bg-purple-10 text-purple-primary" : "border-grey-border text-grey-secondary hover:bg-grey-border"}`,
        disabled,
        children: opt.label
      },
      opt.value
    )) })
  ] });
}
function ForeignKeySettings({
  foreignkeyTable,
  onChange,
  tableOptions,
  disabled
}) {
  const { t } = useTranslation(["data"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm rounded-lg border border-grey-border p-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-secondary", children: t("data:upload_data.field_foreign_key_settings") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      SelectV2,
      {
        value: foreignkeyTable,
        placeholder: t("data:upload_data.field_foreign_key_placeholder"),
        onChange: (value) => onChange({ foreignkeyTable: value }),
        options: tableOptions,
        disabled
      }
    ),
    !foreignkeyTable ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-primary", children: t("data:upload_data.field_foreign_key_required_error") }) : null
  ] });
}
function toSnakeCase(str) {
  return str.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
}
function EnumValuesSettings({
  field,
  onChange,
  disabled
}) {
  const { t } = useTranslation(["data"]);
  const enumValues = field.enumValues ?? [];
  const colorOptions = reactExports.useMemo(
    () => enumColors.map((color) => ({
      value: color,
      label: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-4 rounded-full border border-grey-border", style: { backgroundColor: color }, children: " " })
    })),
    []
  );
  function addValue() {
    onChange({ enumValues: [...enumValues, { key: "", color: "gray", value: "" }] });
  }
  function updateValue(index, patch) {
    const newValues = enumValues.map((v, i) => {
      if (i !== index) return v;
      const newValue = patch.value !== void 0 ? patch.value : v.value;
      return {
        key: patch.value !== void 0 ? toSnakeCase(patch.value) : patch.key ?? v.key,
        color: patch.color ?? v.color,
        value: newValue
      };
    });
    onChange({ enumValues: newValues });
  }
  function removeValue(index) {
    onChange({ enumValues: enumValues.filter((_, i) => i !== index) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm rounded-lg border border-grey-border p-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-secondary", children: t("data:upload_data.field_enum_settings") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-sm", children: enumValues.map((enumValue, index) => {
      const candidateKey = toSnakeCase(enumValue.value);
      const isDuplicate = enumValue.value !== "" && enumValues.some((v, i) => i !== index && toSnakeCase(v.value) === candidateKey);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-max shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            SelectV2,
            {
              value: enumValue.color,
              placeholder: "",
              onChange: (value) => updateValue(index, { color: value }),
              options: colorOptions,
              disabled
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              className: "flex-1",
              value: enumValue.value,
              placeholder: t("data:upload_data.field_enum_value_placeholder"),
              onChange: (e) => updateValue(index, { value: e.currentTarget.value }),
              disabled
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => removeValue(index),
              className: "shrink-0 rounded-lg p-xs text-grey-secondary hover:bg-grey-border hover:text-red-primary",
              disabled,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "delete", className: "size-4" })
            }
          )
        ] }),
        isDuplicate ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-primary", children: t("data:upload_data.field_enum_value_unique_error") }) : null
      ] }, `enum-value-${index}`);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "secondary", appearance: "stroked", onClick: addValue, disabled, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "plus", className: "size-4" }),
      t("data:upload_data.field_enum_add_value")
    ] })
  ] });
}
function TimestampSettings({
  fieldName,
  mainTimestampFieldName,
  setMainTimestampFieldName,
  disabled
}) {
  const { t } = useTranslation(["data"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm rounded-lg border border-grey-border p-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-secondary", children: t("data:upload_data.field_timestamp_settings") }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-sm cursor-pointer", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Switch,
        {
          checked: mainTimestampFieldName === fieldName,
          onCheckedChange: (checked) => setMainTimestampFieldName(checked ? fieldName : "updated_at"),
          disabled
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s", children: t("data:upload_data.field_main_ordering_timestamp") })
    ] })
  ] });
}
function FieldsForm({
  onFieldSelect,
  selectedFieldId,
  title,
  description,
  droppableId = "fields-list",
  errorFieldIds,
  hasError
}) {
  const { isCreateDataModelFieldAvailable } = useDataModelFeatureAccess();
  const { fields, reorderFields, addField } = FieldsEditorContext.useValue();
  const { t } = useTranslation(["data"]);
  const buttonRefs = reactExports.useRef([]);
  const handleDragEnd = useCallbackRef((result) => {
    if (!result.destination || result.source.index === result.destination.index) return;
    reorderFields(result.source.index, result.destination.index);
  });
  const handleFieldKeyDown = reactExports.useCallback(
    (e, index) => {
      const isCmd = e.metaKey || e.ctrlKey;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (isCmd) {
          if (index < fields.length - 1) {
            reorderFields(index, index + 1);
            setTimeout(() => buttonRefs.current[index + 1]?.focus(), 0);
          }
        } else {
          buttonRefs.current[index + 1]?.focus();
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (isCmd) {
          if (index > 0) {
            reorderFields(index, index - 1);
            setTimeout(() => buttonRefs.current[index - 1]?.focus(), 0);
          }
        } else {
          buttonRefs.current[index - 1]?.focus();
        }
      }
    },
    [fields.length, reorderFields]
  );
  function handleAddField() {
    const fieldId = addField("");
    onFieldSelect(fieldId);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "section",
    {
      className: cn("flex flex-1 min-h-0 flex-col gap-md rounded-lg", hasError && "border border-red-primary p-md"),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex shrink-0 items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typo, { variant: "subtitle2", children: title ?? t("data:upload_data.fields_title") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-s text-grey-secondary", children: description ?? t("data:upload_data.fields_description") })
          ] }),
          isCreateDataModelFieldAvailable && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "primary", appearance: "stroked", onClick: handleAddField, className: "shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "plus", className: "size-4" }),
            t("data:upload_data.field_add")
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollAreaV2, { className: "flex-1 min-h-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DragDropContext, { onDragEnd: handleDragEnd, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ConnectedDroppable, { droppableId, children: (dropProvided) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: dropProvided.innerRef, ...dropProvided.droppableProps, className: "flex flex-col gap-sm pe-sm", children: [
          fields.map((field, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(PublicDraggable, { draggableId: field.id, index, children: (dragProvided, snapshot) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              ref: dragProvided.innerRef,
              ...dragProvided.draggableProps,
              className: cn(snapshot.isDragging && "opacity-80"),
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                FieldRow,
                {
                  field,
                  isSelected: field.id === selectedFieldId,
                  onSelect: () => onFieldSelect(field.id),
                  dragHandleProps: dragProvided.dragHandleProps,
                  hasError: errorFieldIds?.has(field.id) ?? false,
                  buttonRef: (el) => {
                    buttonRefs.current[index] = el;
                  },
                  onKeyDown: (e) => handleFieldKeyDown(e, index)
                }
              )
            }
          ) }, field.id)),
          dropProvided.placeholder
        ] }) }) }) })
      ]
    }
  );
}
function FieldRow({
  field,
  isSelected,
  onSelect,
  dragHandleProps,
  hasError,
  buttonRef,
  onKeyDown
}) {
  const { t } = useTranslation(["data"]);
  const { mainTimestampFieldName: orderingFieldName } = FieldsEditorContext.useValue();
  const isOrderingField = orderingFieldName !== "" && field.name === orderingFieldName;
  const semanticLabel = getSemanticLabel(field, t);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ...dragHandleProps, className: "flex shrink-0 items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "drag", className: "size-4 text-grey-secondary cursor-grab" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        ref: buttonRef,
        type: "button",
        onClick: onSelect,
        onKeyDown,
        className: cn(
          "flex flex-1 items-center gap-md rounded-lg border p-md transition-colors",
          hasError ? "border-red-primary" : isSelected ? "border-purple-primary" : "border-grey-border hover:bg-grey-98",
          isSelected ? "bg-purple-96" : "",
          field.hidden && "opacity-50"
        ),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DatatypeIcon, { dataType: field.dataType }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s font-medium", children: field.alias || field.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ms-auto flex items-center gap-sm", children: [
            semanticLabel ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-sm border border-grey-border bg-grey-98 px-sm py-0.5 text-xs text-grey-secondary", children: semanticLabel }) : null,
            isOrderingField ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { title: t("data:upload_data.field_main_ordering_timestamp"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "filters", className: "size-4 text-grey-secondary" }) }) : null,
            field.locked ? /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "lock", className: "size-4 text-grey-secondary" }) : null,
            !field.nullable ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-2 rounded-full bg-purple-primary" }) : null,
            field.hidden ? /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "visibility_off", className: "size-4 text-grey-secondary" }) : null,
            /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "arrow-right", className: "size-4 text-grey-secondary" })
          ] })
        ]
      }
    )
  ] });
}
const getSemanticLabel = (field, t) => {
  const subOpts = getSemanticSubOptions(field.dataType, field.semanticType);
  if (field.dataType === "Bool") return t("data:upload_data.field_semantic.boolean");
  if (field.dataType === "IpAddress") return t("data:upload_data.field_semantic.ip_address");
  if (field.dataType === "Coords") return t("data:upload_data.field_semantic.coords");
  if (subOpts?.length && subOpts.some((opt) => opt.value === field.semanticSubType))
    return t(`data:upload_data.field_semantic_sub.${field.semanticSubType}`);
  if (field.semanticType) return t(`data:upload_data.field_semantic.${field.semanticType}`);
  return null;
};
function LinkForm({
  compact,
  errorLinkIds,
  hasError
}) {
  const { links, sourceTableName, addLink, destinationTableOptions } = LinksEditorContext.useValue();
  const { t } = useTranslation(["data"]);
  const { isCreateDataModelLinkAvailable } = useDataModelFeatureAccess();
  const tableLabel = sourceTableName.trim() || t("data:upload_data.table_name_fallback");
  const belongsToLinks = links.filter((link) => link.relationType === "belongs_to");
  const belongsToFieldNames = belongsToLinks.map((link) => link.tableFieldId).filter(Boolean);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: cn("flex flex-col gap-md rounded-lg", hasError && "bg-red-primary/5 p-sm"), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typo, { variant: "subtitle2", children: t("data:upload_data.links_title") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-s text-grey-secondary", children: t("data:upload_data.links_description", { tableName: tableLabel }) })
    ] }),
    belongsToLinks.length > 1 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Callout, { color: "orange", icon: "warning", iconColor: "orange", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
      t("data:upload_data.multiple_belongs_to_warning", { tableName: tableLabel }),
      belongsToFieldNames.length > 0 ? ` ${t("data:upload_data.multiple_belongs_to_warning_fields", {
        fields: belongsToFieldNames.join(", ")
      })}` : null
    ] }) }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-md", children: links.map((link) => /* @__PURE__ */ jsxRuntimeExports.jsx(LinkRow, { linkId: link.linkId, compact, hasError: errorLinkIds?.has(link.linkId) }, link.linkId)) }),
    isCreateDataModelLinkAvailable && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "primary",
          appearance: "stroked",
          onClick: () => addLink(),
          disabled: !destinationTableOptions.length,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "plus", className: "size-4" }),
            t("data:upload_data.link_add")
          ]
        }
      ),
      !destinationTableOptions.length && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-grey-secondary", children: t("data:create_table.link_destination_table_required") })
    ] })
  ] });
}
function LinkRow({ linkId, compact, hasError }) {
  const { links, sourceTableFields, destinationTableOptions, updateLink, removeLink } = LinksEditorContext.useValue();
  const { t } = useTranslation(["data"]);
  const { isDeleteDataModelLinkAvailable } = useDataModelFeatureAccess();
  const link = links.find((l) => l.linkId === linkId);
  const fieldOptions = reactExports.useMemo(
    () => sourceTableFields.filter((field) => field.dataType === "String" && field.name !== "object_id").map((field) => ({
      label: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-sm", title: field.alias !== field.name ? field.name : void 0, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DatatypeIcon, { dataType: field.dataType }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: field.alias || field.name })
      ] }),
      value: field.name
    })),
    [sourceTableFields]
  );
  const relationOptions = reactExports.useMemo(
    () => linkRelationTypes.map((rel) => ({
      label: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Icon,
          {
            icon: rel === "belongs_to" ? "arrow-forward" : "arrow-range",
            className: "size-4 text-purple-primary"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t(`data:upload_data.link_relation_${rel}`) })
      ] }),
      value: rel
    })),
    [t]
  );
  const destinationOptions = reactExports.useMemo(
    () => destinationTableOptions.map((t2) => ({
      label: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t2.label }),
      value: t2.tableId
    })),
    [destinationTableOptions]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: cn(
        "flex gap-x-md gap-y-sm rounded-lg",
        compact ? "flex-wrap items-start" : "items-center",
        hasError && "border border-red-primary/40 bg-red-primary/5 p-sm"
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: link.name,
            onChange: (e) => updateLink(linkId, { name: e.currentTarget.value }),
            placeholder: t("data:upload_data.link_name_placeholder"),
            className: "w-36 min-w-fit",
            disabled: link.isNew === false
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          SelectV2,
          {
            value: link.tableFieldId,
            placeholder: t("data:upload_data.link_field_placeholder"),
            onChange: (value) => updateLink(linkId, { tableFieldId: value }),
            options: fieldOptions,
            className: "flex-1 min-w-fit",
            disabled: link.isNew === false
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          SelectV2,
          {
            value: link.relationType,
            placeholder: "",
            onChange: (value) => updateLink(linkId, { relationType: value }),
            options: relationOptions,
            className: "w-40 min-w-fit"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          SelectV2,
          {
            value: link.targetTableId,
            placeholder: t("data:upload_data.link_destination_placeholder"),
            onChange: (value) => updateLink(linkId, { targetTableId: value }),
            options: destinationOptions,
            className: "flex-1 min-w-fit",
            disabled: link.isNew === false
          }
        ),
        isDeleteDataModelLinkAvailable && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => removeLink(linkId),
            className: "shrink-0 rounded-lg p-sm text-grey-secondary hover:bg-grey-border hover:text-red-primary",
            title: t("data:upload_data.link_delete"),
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "delete", className: "size-4" })
          }
        )
      ]
    }
  );
}
function UnsavedChangesDialog({ open, onOpenChange, onConfirm }) {
  const { t } = useTranslation(["data", "common"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Root, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Content, { onClick: (event) => event.stopPropagation(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: t("data:unsaved_changes.title") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-s text-grey-primary", children: t("data:unsaved_changes.description") }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Footer, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { isCloseButton: true, label: t("common:cancel") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { label: t("data:unsaved_changes.confirm"), onClick: onConfirm })
    ] })
  ] }) });
}
const useImportOrgFromFileMutation = () => {
  const importOrgFile = useServerFn(importOrgFileFn);
  return useMutation({
    mutationKey: ["data", "import-org-file"],
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      return importOrgFile({ data: formData });
    }
  });
};
const useImportOrgMutation = () => {
  const importOrg = useServerFn(importOrgFn);
  return useMutation({
    mutationKey: ["data", "import-org"],
    mutationFn: async (fileContent) => importOrg({ data: { body: fileContent } })
  });
};
function ImportOrg({ children }) {
  const { t } = useTranslation(["data", "common"]);
  const [isOpen, setIsOpen] = reactExports.useState(false);
  const [selectedFile, setSelectedFile] = reactExports.useState(null);
  const [jsonContent, setJsonContent] = reactExports.useState("");
  const [jsonError, setJsonError] = reactExports.useState(null);
  const [isParsing, setIsParsing] = reactExports.useState(false);
  const fileInputRef = reactExports.useRef(null);
  const importFileMutation = useImportOrgFromFileMutation();
  const importBodyMutation = useImportOrgMutation();
  const revalidate = useLoaderRevalidator();
  const [errorMessage, setErrorMessage] = reactExports.useState(null);
  const hasFile = selectedFile !== null;
  const hasJson = jsonContent.trim().length > 0;
  const canImport = (hasFile || hasJson) && !(hasFile && hasJson);
  const resetState = () => {
    setSelectedFile(null);
    setJsonContent("");
    setJsonError(null);
    setIsParsing(false);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  const handleImport = async () => {
    setErrorMessage(null);
    if (hasFile) {
      setIsParsing(true);
      importFileMutation.mutate(selectedFile, {
        onSuccess: (result) => {
          if (result.success) {
            revalidate();
            zt.success(t("data:import_org.success"));
            setIsOpen(false);
            resetState();
          } else {
            setErrorMessage(result.message);
            setIsParsing(false);
          }
        },
        onError: () => {
          zt.error(t("common:errors.backend_global_error.unknown"));
          setIsParsing(false);
        }
      });
    } else if (hasJson) {
      try {
        setIsParsing(true);
        const parsed = JSON.parse(jsonContent);
        setJsonError(null);
        importBodyMutation.mutate(parsed, {
          onSuccess: (result) => {
            if (result.success) {
              zt.success(t("data:import_org.success"));
              revalidate();
              setIsOpen(false);
              resetState();
            } else {
              setErrorMessage(result.message);
              setIsParsing(false);
            }
          },
          onError: () => {
            zt.error(t("common:errors.backend_global_error.unknown"));
            setIsParsing(false);
          }
        });
      } catch {
        setJsonError(t("data:import_org.invalid_json"));
      }
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Modal.Root,
    {
      open: isOpen,
      onOpenChange: (open) => {
        setIsOpen(open);
        if (!open) resetState();
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Trigger, { asChild: true, children }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Content, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: t("data:import_org.title") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-md p-lg", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-s font-medium text-grey-primary", children: t("data:import_org.method_file") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  ref: fileInputRef,
                  type: "file",
                  accept: ".json",
                  disabled: hasJson,
                  onChange: (e) => setSelectedFile(e.target.files?.[0] ?? null),
                  className: "hidden"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  variant: "secondary",
                  appearance: "stroked",
                  disabled: hasJson,
                  onClick: () => fileInputRef.current?.click(),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "upload", className: "size-5" }),
                    selectedFile ? selectedFile.name : t("data:import_org.select_file")
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-md", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-grey-border h-px flex-1" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-grey-secondary", children: t("common:or") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-grey-border h-px flex-1" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-s font-medium text-grey-primary", children: t("data:import_org.method_body") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "textarea",
                {
                  className: "border-grey-border focus:border-purple-primary text-s min-h-[120px] w-full rounded-lg border p-md font-mono outline-none disabled:opacity-50",
                  placeholder: t("data:import_org.json_placeholder"),
                  disabled: hasFile,
                  value: jsonContent,
                  onChange: (e) => {
                    setJsonContent(e.target.value);
                    setJsonError(null);
                  }
                }
              ),
              jsonError ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-primary", children: jsonError }) : null,
              errorMessage ? /* @__PURE__ */ jsxRuntimeExports.jsx(Callout, { color: "red", icon: "error", iconColor: "red", children: errorMessage }) : null
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Footer, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { isCloseButton: true, label: t("common:cancel") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Modal.FooterButton,
              {
                label: t("data:import_org.button_accept"),
                type: "submit",
                disabled: !canImport || isParsing,
                isLoading: isParsing,
                onClick: handleImport
              }
            )
          ] })
        ] })
      ]
    }
  );
}
const useApplyArchetypeMutation = () => {
  const applyArchetype = useServerFn(applyArchetypeFn);
  return useMutation({
    mutationKey: ["data", "apply-archetype"],
    mutationFn: async (payload) => applyArchetype({ data: payload })
  });
};
const useListArchetypesQuery = () => {
  const listArchetypes = useServerFn(listArchetypesFn);
  return useQuery({
    queryKey: ["data", "archetypes"],
    queryFn: () => {
      return listArchetypes({});
    }
  });
};
function SelectArchetype({ children }) {
  const { t } = useTranslation(["data", "common"]);
  const { data: archetypes, isLoading } = useListArchetypesQuery();
  const applyArchetypeMutation = useApplyArchetypeMutation();
  const [isOpen, setIsOpen] = reactExports.useState(false);
  const [selectedArchetype, setSelectedArchetype] = reactExports.useState(null);
  const revalidate = useLoaderRevalidator();
  const handleApply = () => {
    if (!selectedArchetype) return;
    applyArchetypeMutation.mutateAsync({ name: selectedArchetype.name }).then((result) => {
      revalidate();
      if (result.success) {
        zt.success(t("data:apply_archetype.success"));
        setIsOpen(false);
        setSelectedArchetype(null);
      } else {
        zt.error(t("common:errors.unknown"));
      }
    }).catch(() => {
      zt.error(t("common:errors.unknown"));
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Modal.Root,
    {
      open: isOpen,
      onOpenChange: (open) => {
        setIsOpen(open);
        if (!open) {
          setSelectedArchetype(null);
        }
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Trigger, { asChild: true, children }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Content, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.Title, { children: t("data:select_archetype.title") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-md p-lg", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "spinner", className: "size-8 animate-spin" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-sm", children: archetypes?.map((archetype) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            ArchetypeCard,
            {
              archetype,
              isSelected: selectedArchetype?.name === archetype.name,
              onSelect: () => setSelectedArchetype(archetype)
            },
            archetype.name
          )) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Modal.Footer, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Modal.FooterButton, { isCloseButton: true, label: t("common:cancel") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Modal.FooterButton,
              {
                label: t("data:select_archetype.button_accept"),
                disabled: !selectedArchetype || applyArchetypeMutation.isPending,
                onClick: handleApply,
                isLoading: applyArchetypeMutation.isPending
              }
            )
          ] })
        ] })
      ]
    }
  );
}
function ArchetypeCard({
  archetype,
  isSelected,
  onSelect
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      type: "button",
      onClick: onSelect,
      className: clsx(
        "flex flex-col gap-xs rounded-lg border-2 p-md text-left transition-colors",
        isSelected ? "border-purple-primary bg-purple-background dark:bg-purple-border" : "border-grey-border hover:border-grey-placeholder"
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s font-semibold text-grey-primary", children: archetype.label ?? archetype.name }),
        archetype.description ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s text-grey-secondary", children: archetype.description }) : null
      ]
    }
  );
}
function useCreateTableForm(onSubmit) {
  return useForm({
    defaultValues: defaultCreateTableFormValues,
    onSubmit: ({ value }) => onSubmit(value)
  });
}
const CreateTableFormContext = reactExports.createContext(null);
function useCreateTableFormContext() {
  const ctx = reactExports.useContext(CreateTableFormContext);
  if (!ctx) throw new Error("useCreateTableFormContext must be used within CreateTableDrawer");
  return ctx;
}
function CreateTableEntityStep({ errorFields }) {
  const form = useCreateTableFormContext();
  const { t } = useTranslation(["data"]);
  const dataModel = useDataModel();
  const selectedEntityType = useStore(form.store, (state) => state.values.entityType);
  const selectedSubEntity = useStore(form.store, (state) => state.values.subEntity);
  const selectedBelongsToTableId = useStore(form.store, (state) => state.values.belongsToTableId);
  const personOrOtherTables = reactExports.useMemo(() => dataModel.filter(isLinkableTable), [dataModel]);
  const canSelectTypeThatNeedsAPerson = personOrOtherTables.length > 0;
  const hasNameError = errorFields?.has("name") ?? false;
  const hasEntityTypeError = errorFields?.has("entityType") ?? false;
  const hasSubEntityError = errorFields?.has("subEntity") ?? false;
  const hasBelongsToError = errorFields?.has("belongsToTableId") ?? false;
  const linkTargetOptions = reactExports.useMemo(
    () => personOrOtherTables.map((table) => ({
      label: table.alias || table.name,
      value: table.id
    })),
    [personOrOtherTables]
  );
  function handleEntitySelect(entity) {
    form.setFieldValue("entityType", entity);
    form.setFieldValue("subEntity", "moral");
    form.setFieldValue("belongsToTableId", "");
  }
  function handleSubEntitySelect(sub) {
    form.setFieldValue("subEntity", sub);
  }
  function isEntityDisabled(entity) {
    return requiresLink(entity) && !canSelectTypeThatNeedsAPerson;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-lg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        form.Field,
        {
          name: "name",
          validators: {
            onChange: ({ value }) => {
              if (value.length > 0 && !isValidDataModelName(value)) {
                return { message: t("data:create_table.name_regex_error") };
              }
              return void 0;
            }
          },
          children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col gap-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { name: field.name, children: t("data:create_table.name_label") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              FormInput,
              {
                type: "text",
                name: field.name,
                defaultValue: field.state.value,
                onChange: (e) => field.handleChange(e.currentTarget.value),
                onBlur: field.handleBlur,
                valid: field.state.meta.errors.length === 0 && !hasNameError,
                placeholder: t("data:create_table.name_placeholder")
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors$1(field.state.meta.errors) })
          ] })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(form.Field, { name: "alias", children: (field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col gap-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, { name: field.name, children: t("data:create_table.alias_label") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          FormInput,
          {
            type: "text",
            name: field.name,
            defaultValue: field.state.value,
            onChange: (e) => field.handleChange(e.currentTarget.value),
            onBlur: field.handleBlur,
            valid: field.state.meta.errors.length === 0,
            placeholder: t("data:create_table.alias_placeholder")
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(FormErrorOrDescription, { errors: getFieldErrors$1(field.state.meta.errors) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("flex flex-col gap-md rounded-lg", hasEntityTypeError && "border border-red-primary p-md"), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-s font-medium", children: t("data:create_table.choose_entity") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-sm", children: ftmEntities.map((entity) => {
        const isSelected = selectedEntityType === entity;
        const disabled = isEntityDisabled(entity);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => !disabled && handleEntitySelect(entity),
              disabled,
              className: cn(
                "flex items-center gap-sm rounded-md px-md py-xs text-left text-s transition-colors",
                isSelected && "text-purple-primary font-medium",
                !isSelected && !disabled && "text-grey-primary hover:bg-grey-bg",
                disabled && "cursor-not-allowed opacity-50"
              ),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: cn(
                      "flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                      isSelected ? "border-purple-primary" : "border-grey-border"
                    ),
                    children: isSelected ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-2 rounded-full bg-purple-primary" }) : null
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t(`data:upload_data.ftm_entity.${entity}`) })
              ]
            }
          ),
          disabled ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ms-3xl text-xs text-grey-secondary", children: t("data:create_table.entity_disabled_hint") }) : null,
          isSelected && entity === "person" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            SubEntityOptions,
            {
              options: [...ftmEntityPersonOptions],
              selected: selectedSubEntity,
              onSelect: handleSubEntitySelect,
              labelPrefix: "data:upload_data.ftm_entity_person",
              hasError: hasSubEntityError
            }
          ) : null,
          isSelected && requiresLink(entity) ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ms-3xl mt-xs flex items-center gap-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-grey-secondary", children: t("data:create_table.belongs_to") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              SelectV2,
              {
                value: selectedBelongsToTableId,
                placeholder: t("data:create_table.select_destination_table"),
                onChange: (value) => form.setFieldValue("belongsToTableId", value),
                options: linkTargetOptions,
                className: cn("w-60", hasBelongsToError && "border-red-primary")
              }
            )
          ] }) : null
        ] }, entity);
      }) })
    ] })
  ] });
}
function SubEntityOptions({
  options,
  selected,
  onSelect,
  labelPrefix,
  hasError
}) {
  const { t } = useTranslation(["data"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: cn("ms-3xl flex flex-col gap-xs rounded-md bg-grey-bg p-sm", hasError && "border border-red-primary"),
      children: options.map((option) => {
        const isSelected = selected === option;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: () => onSelect(option),
            className: cn(
              "flex items-center gap-sm rounded px-xs py-2xs text-left text-s transition-colors",
              isSelected && "text-purple-primary font-medium",
              !isSelected && "text-grey-primary hover:bg-grey-border"
            ),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: cn(
                    "flex size-3.5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                    isSelected ? "border-purple-primary" : "border-grey-border"
                  ),
                  children: isSelected ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-1.5 rounded-full bg-purple-primary" }) : null
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t(`${labelPrefix}.${option}`) })
            ]
          },
          option
        );
      })
    }
  );
}
function CreateTableFieldsStep({
  errorFieldIds,
  hasError
}) {
  const { t } = useTranslation(["data"]);
  const form = useCreateTableFormContext();
  const dataModel = useDataModel();
  const fields = useStore(form.store, (s) => s.values.fields);
  const mainTimestampFieldName = useStore(form.store, (s) => s.values.mainTimestampFieldName);
  const entityType = useStore(form.store, (s) => s.values.entityType);
  const belongsToTableId = useStore(form.store, (s) => s.values.belongsToTableId);
  const [selectedFieldId, setSelectedFieldId] = reactExports.useState(null);
  const belongsToTableName = reactExports.useMemo(
    () => dataModel.find((table) => table.id === belongsToTableId)?.name,
    [belongsToTableId, dataModel]
  );
  reactExports.useEffect(() => {
    form.setFieldValue("fields", (prev) => {
      const withoutDefault = prev.filter((field) => !field.isDefaultBelongsTo);
      if (!belongsToTableName) return withoutDefault;
      const fieldName = `${belongsToTableName}_id`;
      const hasExistingForeignKeyField = withoutDefault.some(
        (field) => field.name === fieldName || field.foreignkeyTable === belongsToTableName
      );
      if (hasExistingForeignKeyField) return withoutDefault;
      const defaultForeignKeyField = {
        id: crypto.randomUUID(),
        name: fieldName,
        description: "",
        dataType: "String",
        tableId: "",
        isEnum: false,
        nullable: true,
        alias: fieldName,
        hidden: false,
        unicityConstraint: "no_unicity_constraint",
        semanticType: "foreign_key",
        foreignkeyTable: belongsToTableName,
        isDefaultBelongsTo: true,
        isNew: true
      };
      return [...withoutDefault, defaultForeignKeyField];
    });
  }, [belongsToTableName, form]);
  const updateField = reactExports.useCallback(
    (fieldId, values) => {
      form.setFieldValue("fields", (prev) => prev.map((f) => f.id === fieldId ? { ...f, ...values } : f));
    },
    [form]
  );
  const reorderFields = reactExports.useCallback(
    (startIndex, endIndex) => {
      form.setFieldValue("fields", (prev) => {
        const next = [...prev];
        const [moved] = next.splice(startIndex, 1);
        next.splice(endIndex, 0, moved);
        return next;
      });
    },
    [form]
  );
  const addField = reactExports.useCallback(
    (name) => {
      const fieldId = crypto.randomUUID();
      form.setFieldValue("fields", (prev) => [
        ...prev,
        {
          id: fieldId,
          name,
          description: "",
          dataType: "String",
          isEnum: false,
          nullable: true,
          alias: name,
          hidden: false,
          unicityConstraint: "no_unicity_constraint",
          isNew: true,
          semanticType: "text",
          tableId: ""
        }
      ]);
      return fieldId;
    },
    [form]
  );
  const removeField = reactExports.useCallback(
    (fieldId) => {
      form.setFieldValue("fields", (prev) => prev.filter((f) => f.id !== fieldId));
      if (selectedFieldId === fieldId) setSelectedFieldId(null);
    },
    [form, selectedFieldId]
  );
  const setMainTimestampFieldName = reactExports.useCallback(
    (fieldName) => {
      form.setFieldValue("mainTimestampFieldName", fieldName);
    },
    [form]
  );
  const editorValue = reactExports.useMemo(
    () => ({
      fields,
      mainTimestampFieldName,
      updateField,
      reorderFields,
      addField,
      removeField,
      setMainTimestampFieldName
    }),
    [fields, mainTimestampFieldName, updateField, reorderFields, addField, removeField, setMainTimestampFieldName]
  );
  const title = entityType ? t("data:create_table.suggested_fields_title", {
    entity: t(`data:upload_data.ftm_entity.${entityType}`)
  }) : t("data:create_table.suggested_fields_title_default");
  return /* @__PURE__ */ jsxRuntimeExports.jsx(FieldsEditorContext.Provider, { value: editorValue, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 min-h-0 gap-lg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-w-0 flex-1 min-h-0 flex flex-col", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      FieldsForm,
      {
        onFieldSelect: setSelectedFieldId,
        selectedFieldId,
        title,
        description: t("data:create_table.suggested_fields_description"),
        droppableId: "create-table-fields",
        errorFieldIds,
        hasError
      }
    ) }),
    selectedFieldId ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      FieldDetailPanel,
      {
        fieldId: selectedFieldId,
        onClose: () => setSelectedFieldId(null),
        title: t("data:create_table.detailed_setup_title")
      }
    ) : null
  ] }) });
}
function CreateTableLinksStep({
  errorLinkIds,
  hasError
}) {
  const form = useCreateTableFormContext();
  const { t } = useTranslation(["data"]);
  const dataModel = useDataModel();
  const tableName = useStore(form.store, (s) => s.values.name);
  const tableAlias = useStore(form.store, (s) => s.values.alias);
  const fields = useStore(form.store, (s) => s.values.fields);
  const links = useStore(form.store, (s) => s.values.links);
  const initializedRef = reactExports.useRef(false);
  reactExports.useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    if (links.length > 0) return;
    const inferred = fields.filter((f) => f.foreignkeyTable).map((f) => {
      const savedTarget = dataModel.find((t2) => t2.name === f.foreignkeyTable);
      const targetTableId = savedTarget?.id ?? "";
      return {
        linkId: crypto.randomUUID(),
        name: `${tableName}_${f.foreignkeyTable}_link`,
        tableFieldId: f.name,
        relationType: f.isDefaultBelongsTo ? "belongs_to" : "related",
        targetTableId,
        sourceTableId: ""
      };
    });
    if (inferred.length > 0) form.setFieldValue("links", inferred);
  }, [fields, dataModel, form, links.length]);
  const destinationTableOptions = reactExports.useMemo(
    () => [
      ...dataModel.map((table) => ({ tableId: table.id, label: table.name })),
      {
        tableId: CREATE_TABLE_SELF_LINK_TARGET_ID,
        label: tableAlias.trim() || tableName.trim() || t("data:create_table.current_table_option"),
        isCurrentTable: true
      }
    ],
    [dataModel, tableAlias, tableName, t]
  );
  const updateLink = reactExports.useCallback(
    (linkId, values) => form.setFieldValue("links", (prev) => prev.map((l) => l.linkId === linkId ? { ...l, ...values } : l)),
    [form]
  );
  const addLink = reactExports.useCallback(
    () => form.setFieldValue("links", (prev) => [
      ...prev,
      {
        linkId: crypto.randomUUID(),
        name: "",
        tableFieldId: "",
        relationType: "related",
        targetTableId: "",
        sourceTableId: ""
      }
    ]),
    [form]
  );
  const removeLink = reactExports.useCallback(
    (linkId) => form.setFieldValue("links", (prev) => prev.filter((l) => l.linkId !== linkId)),
    [form]
  );
  const editorValue = {
    links,
    sourceTableName: tableAlias.trim() || tableName.trim(),
    sourceTableFields: fields,
    destinationTableOptions,
    updateLink,
    addLink,
    removeLink
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(LinksEditorContext.Provider, { value: editorValue, children: /* @__PURE__ */ jsxRuntimeExports.jsx(LinkForm, { errorLinkIds, hasError }) });
}
function CreateTableDrawer({
  open,
  onClose,
  onSave
}) {
  const { t } = useTranslation(["data", "common"]);
  const dataModel = useDataModel();
  const [currentStep, setCurrentStep] = reactExports.useState(0);
  const [validationErrors, setValidationErrors] = reactExports.useState([]);
  const [isUnsavedChangesDialogOpen, setIsUnsavedChangesDialogOpen] = reactExports.useState(false);
  const form = useCreateTableForm(async (value) => {
    if (!form.state.isValid) return;
    const checkValidation = validateValues(value, "all", t, false, dataModel);
    if (!checkValidation.ok) {
      setValidationErrors(checkValidation.errors);
      return;
    }
    setValidationErrors([]);
    const saved = await onSave(value);
    if (!saved) return;
    form.reset();
    setCurrentStep(0);
  });
  const handleClose = reactExports.useCallback(() => {
    setIsUnsavedChangesDialogOpen(false);
    setValidationErrors([]);
    form.reset();
    setCurrentStep(0);
    onClose();
  }, [form, onClose]);
  const steps = reactExports.useMemo(
    () => [
      { key: "entity", label: t("data:create_table.step_entity") },
      { key: "fields", label: t("data:create_table.step_fields") },
      { key: "links", label: t("data:create_table.step_links") }
    ],
    [t]
  );
  const formValues = useStore(form.store, (state) => state.values);
  const isDirty = useStore(form.store, (state) => state.isDirty);
  const currentValidationScope = reactExports.useMemo(() => {
    if (currentStep === 0) return "table";
    if (currentStep === 1) return "fields";
    return "links";
  }, [currentStep]);
  const handleBackdropClose = reactExports.useCallback(() => {
    if (!isDirty) {
      handleClose();
      return;
    }
    setIsUnsavedChangesDialogOpen(true);
  }, [handleClose, isDirty]);
  const handleConfirmDiscardChanges = reactExports.useCallback(() => {
    handleClose();
  }, [handleClose]);
  const tableErrorFields = reactExports.useMemo(
    () => new Set(
      validationErrors.filter((error) => error.kind === "table").map((error) => error.field)
    ),
    [validationErrors]
  );
  const fieldErrorIds = reactExports.useMemo(
    () => new Set(
      validationErrors.filter((error) => error.kind === "field").map((error) => error.fieldId)
    ),
    [validationErrors]
  );
  const linkErrorIds = reactExports.useMemo(
    () => new Set(
      validationErrors.filter((error) => error.kind === "link").map((error) => error.linkId)
    ),
    [validationErrors]
  );
  function handleNext(e) {
    e.preventDefault();
    e.stopPropagation();
    const result = validateValues(formValues, currentValidationScope, t, true, dataModel);
    if (!result.ok) {
      setValidationErrors(result.errors);
      return;
    }
    setValidationErrors([]);
    setCurrentStep((s) => s + 1);
  }
  function handleBack() {
    if (currentStep > 0) {
      setValidationErrors([]);
      setCurrentStep((s) => s - 1);
    }
  }
  if (!open) return;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(CreateTableFormContext.Provider, { value: form, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Panel.Root,
      {
        open,
        onOpenChange: (state) => {
          if (!state) {
            handleBackdropClose();
          }
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Container, { size: "large", children: /* @__PURE__ */ jsxRuntimeExports.jsx("form", { onSubmit: handleSubmit(form), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel.Content, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.Header, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex shrink-0 items-center gap-md", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typo, { variant: "subtitle1", className: "flex-1", children: t("data:create_table.title") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Stepper, { steps, currentStep })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col", children: [
            currentStep === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(CreateTableEntityStep, { errorFields: tableErrorFields }) : null,
            currentStep === 1 ? /* @__PURE__ */ jsxRuntimeExports.jsx(CreateTableFieldsStep, { errorFieldIds: fieldErrorIds, hasError: validationErrors.length > 0 }) : null,
            currentStep === 2 ? /* @__PURE__ */ jsxRuntimeExports.jsx(CreateTableLinksStep, { errorLinkIds: linkErrorIds, hasError: validationErrors.length > 0 }) : null
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel.Footer, { children: [
            validationErrors.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Callout, { color: "red", icon: "lightbulb", iconColor: "red", children: /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "flex flex-col gap-xs ps-md", children: validationErrors.map((error, index) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: error.message }, `${error.kind}-${index}`)) }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", {}),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-md ms-auto", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Panel.FooterButton, { variant: "secondary", onClick: handleBackdropClose, label: t("common:cancel") }),
              currentStep > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                Panel.FooterButton,
                {
                  variant: "secondary",
                  onClick: handleBack,
                  label: t("data:create_table.button_back")
                }
              ) : null,
              currentStep === 2 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                Panel.FooterButton,
                {
                  variant: "primary",
                  type: "submit",
                  label: t("data:create_table.button_save_table")
                }
              ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                Panel.FooterButton,
                {
                  variant: "primary",
                  onClick: handleNext,
                  type: "button",
                  label: t("data:create_table.button_next")
                }
              )
            ] })
          ] })
        ] }) }) })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      UnsavedChangesDialog,
      {
        open: isUnsavedChangesDialogOpen,
        onOpenChange: setIsUnsavedChangesDialogOpen,
        onConfirm: handleConfirmDiscardChanges
      }
    )
  ] });
}
const useExportOrgMutation = () => {
  const router = useRouter();
  return useMutation({
    mutationKey: ["data", "export-org"],
    mutationFn: async () => {
      const endpoint = router.buildLocation({ to: "/ressources/data/export-org" });
      const response = await fetch(endpoint.href);
      if (!response.ok) {
        throw new Error("Export failed");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "org-export.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return { success: true };
    }
  });
};
function DataPageHeader({ handleOpenCreateDrawer }) {
  const { t } = useTranslation(["navigation"]);
  const { isCreateDataModelTableAvailable } = useDataModelFeatureAccess();
  const exportOrgMutation = useExportOrgMutation();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Typo, { variant: "title1", children: t("navigation:data") }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "secondary",
          appearance: "stroked",
          onClick: () => exportOrgMutation.mutate(),
          disabled: exportOrgMutation.isPending,
          children: [
            exportOrgMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "spinner", className: "size-5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "download", className: "size-5" }),
            t("data:export_org.button")
          ]
        }
      ),
      isCreateDataModelTableAvailable ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "primary", onClick: handleOpenCreateDrawer, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "plus", className: "size-5" }),
        t("data:create_table.title")
      ] }) : null
    ] }),
    " "
  ] });
}
const useCreateTableMutation = () => {
  const createTable = useServerFn(createTableFn);
  return useMutation({
    mutationKey: ["data", "create-table"],
    mutationFn: async (table) => createTable({ data: table }),
    onError: (error) => {
      if (isTableMutationError(error)) {
        zt.error(formatTableMutationError(error));
      }
    }
  });
};
function DataList() {
  const {
    t
  } = useTranslation(handle.i18n);
  const dataModel = useDataModel();
  const revalidate = useLoaderRevalidator();
  const createTableMutation = useCreateTableMutation();
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = reactExports.useState(false);
  const isEmpty = dataModel.length === 0;
  const handleOpenCreateDrawer = () => setIsCreateDrawerOpen(true);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full min-h-0 flex-1 flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Page.Content, { width: "fluid", className: "min-h-0 flex-1", children: [
      isEmpty ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyHeader, { onCreateTable: handleOpenCreateDrawer }) : /* @__PURE__ */ jsxRuntimeExports.jsx(DataPageHeader, { handleOpenCreateDrawer }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CalloutV2, { children: t("data:callout") }),
      isEmpty ? /* @__PURE__ */ jsxRuntimeExports.jsx(DataListEmptyState, { onCreateTable: handleOpenCreateDrawer }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-[min(600px,75vh)] w-full min-h-[min(600px,75vh)] flex-1 flex-col", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClientOnly, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex size-full items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Spinner, { className: "size-8" }) }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CreateTableDrawer, { open: isCreateDrawerOpen, onClose: () => setIsCreateDrawerOpen(false), onSave: async (values) => {
      try {
        await createTableMutation.mutateAsync(adaptCreateTableValue(values));
        setIsCreateDrawerOpen(false);
        revalidate();
        return true;
      } catch {
        return false;
      }
    } })
  ] });
}
function EmptyHeader({
  onCreateTable
}) {
  const {
    t
  } = useTranslation(["navigation", "data"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-md", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Typo, { variant: "title1", className: "flex-1", children: t("data:data-model") }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.Menu, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Trigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", size: "medium", children: [
        t("data:empty_state.create_table.title"),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "plus", className: " size-4" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Content, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuCommand.List, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Item, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ImportOrg, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-sm cursor-pointer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "upload", className: "size-4" }),
          t("data:create_new_table.from_file")
        ] }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(MenuCommand.Item, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "flex items-center gap-sm", onClick: onCreateTable, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "edit", className: "size-4" }),
          t("data:create_new_table.manually")
        ] }) })
      ] }) })
    ] })
  ] }) });
}
function DataListEmptyState({
  onCreateTable
}) {
  const {
    t
  } = useTranslation(handle.i18n);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "px-lg py-2xl grid gap-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid py-xl w-full place-items-center gap-lg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: t("data:empty_state.title") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-grey-secondary", children: t("data:empty_state.description") })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectArchetype, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", appearance: "stroked", size: "medium", className: "w-full justify-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("data:empty_state.select_archetype.title") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "category", className: "size-4" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ImportOrg, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", appearance: "stroked", size: "medium", className: "w-full justify-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("data:empty_state.import_org.title") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "upload", className: "size-4" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", appearance: "stroked", size: "medium", className: "w-full justify-center", onClick: onCreateTable, children: [
        t("data:empty_state.create_table.title"),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { icon: "plus", className: " size-4" })
      ] })
    ] })
  ] }) });
}
export {
  DataList as component
};
