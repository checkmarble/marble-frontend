import { gk as union, n as number, fE as looseObject, s as string } from "./short-uuid-MIi3jWzx.js";
const protocolWhitelist = ["http:", "https:"];
const urlDataTypeSchema = string().refine((value) => {
  try {
    const url = new URL(value);
    return protocolWhitelist.includes(url.protocol);
  } catch {
    return false;
  }
});
const dateTimeDataTypeSchema = string().datetime({ offset: true });
const knownDataTypeSchema = union([
  urlDataTypeSchema.transform((value) => ({
    type: "url",
    value
  })),
  dateTimeDataTypeSchema.transform((value) => ({
    type: "datetime",
    value
  })),
  number().transform((value) => ({
    type: "number",
    value
  })),
  looseObject({}).transform((value) => ({
    type: "DerivedData",
    value
  }))
]);
export {
  dateTimeDataTypeSchema as d,
  knownDataTypeSchema as k
};
