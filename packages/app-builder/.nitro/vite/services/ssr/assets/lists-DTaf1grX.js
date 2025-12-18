import { z } from "./services-middleware-DR8Hua1Y.js";
const createListPayloadSchema = z.object({
  name: z.string().nonempty(),
  description: z.string(),
  kind: z.enum(["text", "cidrs"])
});
const deleteListPayloadSchema = z.object({
  listId: z.uuid()
});
const editListPayloadSchema = z.object({
  listId: z.uuid(),
  name: z.string().nonempty(),
  description: z.string()
});
const cidrValueSchema = z.union([z.cidrv4(), z.cidrv6(), z.ipv4(), z.ipv6()]);
function normalizeCidr(value) {
  const trimmed = value.trim();
  if (trimmed.includes("/")) return trimmed;
  if (z.ipv4().safeParse(trimmed).success) return `${trimmed}/32`;
  if (z.ipv6().safeParse(trimmed).success) return `${trimmed}/128`;
  return trimmed;
}
const addValuePayloadSchema = z.object({
  listId: z.uuid(),
  value: z.string().nonempty(),
  kind: z.enum(["text", "cidrs"])
});
const addCidrValuePayloadSchema = z.object({
  listId: z.uuid(),
  value: cidrValueSchema,
  kind: z.literal("cidrs")
});
const deleteValuePayloadSchema = z.object({
  listId: z.uuid(),
  listValueId: z.uuid()
});
export {
  addValuePayloadSchema as a,
  deleteValuePayloadSchema as b,
  createListPayloadSchema as c,
  deleteListPayloadSchema as d,
  editListPayloadSchema as e,
  addCidrValuePayloadSchema as f,
  normalizeCidr as n
};
