import { aW as semanticTypesByDataType, M, aX as z, aY as primitiveTypes, aZ as linkRelationTypes } from "./services-middleware-DR8Hua1Y.js";
import { o as object, s as string, k as array, f_ as record, _ as _enum, gk as union, n as number, j as uuid, p as boolean, m as literal } from "./short-uuid-MIi3jWzx.js";
const enumColors = [
  "green",
  "orange",
  "red",
  "blue",
  "yellow",
  "purple",
  "pink",
  "brown",
  "gray",
  "black",
  "white"
];
const semanticTypeTable = ["person", "company", "account", "transaction", "event", "partner", "other"];
function getSemanticSubOptions(dataType, semanticType) {
  const options = semanticTypesByDataType[dataType];
  if (!options) return void 0;
  const match2 = options.find((o) => o.value === semanticType);
  return match2 && "subOptions" in match2 ? match2.subOptions : void 0;
}
function getMockValue(dataType, semanticType, semanticSubType) {
  try {
    if (dataType === "Coords") return "48.8566, 2.3522";
    if (dataType === "IpAddress") return "127.0.0.1";
    if (dataType === "Bool") return true;
    if (!semanticType) {
      return M(dataType).with("String", () => "Welcome to Marble").with("Timestamp", () => "2021-01-01T14:20:00.000Z").with(z.union("Int", "Float"), () => 12345678).otherwise(() => "unexpected value");
    }
    const value = M(semanticType).with("text", () => "Welcome to Marble").with(
      "name",
      () => semanticSubType ? M(semanticSubType).with("caption", () => "Company name or John Doe Jr").with("first_name", () => "John").with("last_name", () => "Doe").with("middle_name", () => "Jr").otherwise(() => "unexpected value") : "John Doe Jr"
    ).with(
      "enum",
      () => semanticSubType ? M(semanticSubType).with("currency", () => "EUR").with("country", () => "FR").with("key_color_value", () => "value from enum").with("mcc_code", () => "5219").with("autocomplete", () => "Autocompleted value").otherwise(() => "unexpected value") : "Enum value"
    ).with("currency_code", () => "EUR").with("foreign_key", () => "ForeignKey").with("country", () => "FR").with("address", () => "123 Main St, Anytown, USA").with(
      "unique_id",
      () => semanticSubType ? M(semanticSubType).with("registration_number", () => "REG1234567890").with("tax_id", () => "TAX1234567890").with("opaque_id", () => "58e6908a-4eab-4985-8ebe-00b2f6900507").otherwise(() => "unexpected value") : "Unique ID value"
    ).with(
      "link",
      () => semanticSubType ? M(semanticSubType).with("url", () => "https://www.google.com").with("email", () => "john.doe@example.com").with("phone", () => "+33612345678").otherwise(() => "unexpected value") : "Link value"
    ).with(
      "account_identifier",
      () => semanticSubType ? M(semanticSubType).with("account_number", () => "12345678901234567890").with("iban", () => "FR7612345678901234567890123").with("bic", () => "TRZFR32AXXX").otherwise(() => "unexpected value") : "Account identifier value"
    ).with("timestamp", () => "2021-01-01T14:20:00.000Z").with("date_of_birth", () => "1990-01-01").with("last_update", () => "2021-01-01T14:20:00.000Z").with("creation_date", () => "2021-01-01T14:20:00.000Z").with("deletion_date", () => "2021-01-01T14:20:00.000Z").with("initiation_date", () => "2021-01-01T14:20:00.000Z").with("validation_date", () => "2021-01-01T14:20:00.000Z").with("number", () => 12345.6789).with("monetary_amount", () => 1234567890).with("percentage", () => 0.34).otherwise(() => "unknown value");
    return value;
  } catch {
    return "unexpected value";
  }
}
function isLinkableTable(table) {
  return table.semanticType === "person";
}
const dataModelNameRegex = /^[a-z]+[a-z0-9_]*$/;
function isValidDataModelName(name) {
  return dataModelNameRegex.test(name);
}
const semanticFieldForBack = [
  "name",
  "first_name",
  "middle_name",
  "last_name",
  "enum",
  "currency",
  "foreign_key",
  "country",
  "address",
  "id",
  "registration_number",
  "tax_id",
  "account_number",
  "iban",
  "bic",
  "url",
  "email",
  "phone_number",
  "date_of_birth",
  "last_update",
  "creation_date",
  "deletion_date",
  "initiation_date",
  "validation_date",
  "monetary_amount",
  "percentage"
];
const applyArchetypePayloadSchema = object({
  name: string().min(1)
});
const createFieldValuesSchema = object({
  name: string().min(1).regex(dataModelNameRegex, {
    error: "Field/name: Only lower case alphanumeric and _, must start with a letter"
  }),
  description: string().optional(),
  type: _enum(primitiveTypes),
  alias: string().optional(),
  nullable: boolean().optional(),
  is_enum: boolean().optional(),
  is_unique: boolean().optional(),
  ftm_property: string().optional(),
  metadata: record(string(), union([string(), number(), boolean()]).optional()).optional(),
  semantic_type: _enum(semanticFieldForBack).optional()
});
const createLinksValuesSchema = object({
  name: string().min(1).regex(dataModelNameRegex, {
    error: "Link/name: Only lower case alphanumeric and _, must start with a letter"
  }),
  child_field_name: string().min(1).regex(dataModelNameRegex, {
    error: "Link/Child field name: Only lower case alphanumeric and _, must start with a letter"
  }),
  parent_table_id: uuid(),
  parent_field_id: uuid().optional(),
  link_type: _enum(linkRelationTypes)
});
const createTableValueSchema = object({
  name: string().min(1).regex(dataModelNameRegex, {
    error: "Table/name: Only lower case alphanumeric and _, must start with a letter"
  }),
  description: string().optional(),
  alias: string().optional(),
  semantic_type: _enum(semanticTypeTable),
  ftm_entity: string().optional(),
  metadata: record(string(), string().optional()).optional(),
  fields: array(createFieldValuesSchema),
  links: array(createLinksValuesSchema),
  primary_ordering_field: string()
});
const deleteTablePayloadSchema = object({
  tableId: uuid(),
  perform: boolean()
});
const createNavigationOptionSchema = object({
  sourceFieldId: uuid(),
  targetTableId: uuid(),
  filterFieldId: uuid(),
  orderingFieldId: uuid()
});
const listObjectsInputSchema = object({
  tableName: string(),
  sourceTableName: string(),
  filterFieldName: string(),
  filterFieldValue: union([string(), number()]),
  orderingFieldName: string(),
  limit: number().optional(),
  offsetId: union([string(), number()]).optional()
});
const fieldOperationSchema = union([
  object({
    op: literal("MOD"),
    data: object({
      id: string(),
      description: string().optional(),
      is_enum: boolean().optional(),
      is_unique: boolean().optional(),
      is_nullable: boolean().optional(),
      ftm_property: string().optional(),
      alias: string().optional(),
      semantic_type: _enum(semanticFieldForBack).optional(),
      metadata: record(string(), union([string(), number(), boolean()]).optional()).optional()
    })
  }),
  object({
    op: literal("DEL"),
    data: object({ id: uuid() })
  }),
  object({
    op: literal("ADD"),
    data: createFieldValuesSchema
  })
]);
const linkOperationSchema = union([
  object({
    op: literal("ADD"),
    data: createLinksValuesSchema
  }),
  object({
    op: literal("MOD"),
    data: object({
      id: string(),
      name: string().min(1).regex(dataModelNameRegex, {
        error: "Link/name: Only lower case alphanumeric and _, must start with a letter"
      }).optional(),
      child_field_name: string().min(1).regex(dataModelNameRegex, {
        error: "Link/Child field name: Only lower case alphanumeric and _, must start with a letter"
      }).optional(),
      parent_table_id: uuid().optional(),
      parent_field_id: uuid().optional(),
      link_type: _enum(linkRelationTypes).optional()
    })
  }),
  object({
    op: literal("DEL"),
    data: object({ id: uuid() })
  })
]);
const editSemanticTablePayloadSchema = object({
  tableId: string(),
  description: string().optional(),
  semantic_type: _enum(semanticTypeTable).optional(),
  caption_field: string().optional(),
  alias: string().optional(),
  ftm_entity: string().optional(),
  primary_ordering_field: string().optional(),
  fields: array(fieldOperationSchema).optional(),
  links: array(linkOperationSchema).optional(),
  metadata: record(string(), string().optional()).optional()
});
export {
  createNavigationOptionSchema as a,
  applyArchetypePayloadSchema as b,
  createTableValueSchema as c,
  deleteTablePayloadSchema as d,
  editSemanticTablePayloadSchema as e,
  dataModelNameRegex as f,
  getSemanticSubOptions as g,
  getMockValue as h,
  isValidDataModelName as i,
  enumColors as j,
  isLinkableTable as k,
  listObjectsInputSchema as l
};
