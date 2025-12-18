import { J as protectArray, aV as SCREENING_CATEGORIES } from "./services-middleware-DR8Hua1Y.js";
import { c as intersection, o as object, k as array, fs as _instanceof, m as literal, _ as _enum, j as uuid, s as string, gk as union } from "./short-uuid-MIi3jWzx.js";
const baseCreateAnnotationSchema = object({
  tableName: string(),
  objectId: string(),
  caseId: uuid().optional()
});
const createTagAnnotationSchema = intersection(
  baseCreateAnnotationSchema,
  object({
    type: literal("tag"),
    payload: object({
      addedTags: protectArray(array(uuid())).optional(),
      removedAnnotations: protectArray(array(uuid())).optional()
    })
  })
);
const tagAnnotationFormSchema = intersection(
  baseCreateAnnotationSchema,
  object({
    type: literal("tag"),
    payload: object({
      tags: protectArray(array(string()))
    })
  })
);
const createFileAnnotationSchema = intersection(
  baseCreateAnnotationSchema,
  object({
    type: literal("file"),
    payload: object({
      files: protectArray(array(_instanceof(File)).min(1))
    })
  })
);
const createCommentAnnotationSchema = intersection(
  baseCreateAnnotationSchema,
  object({
    type: literal("comment"),
    payload: object({
      text: string().nonempty()
    })
  })
);
const createRiskAnnotationSchema = intersection(
  baseCreateAnnotationSchema,
  object({
    type: literal("risk_tag"),
    payload: object({
      addedCategories: protectArray(array(_enum(SCREENING_CATEGORIES))).optional(),
      removedAnnotations: protectArray(array(uuid())).optional()
    })
  })
);
const riskAnnotationFormSchema = intersection(
  baseCreateAnnotationSchema,
  object({
    type: literal("risk_tag"),
    payload: object({
      categories: protectArray(array(_enum(SCREENING_CATEGORIES)))
    })
  })
);
const createAnnotationPayloadSchema = union([
  createTagAnnotationSchema,
  createFileAnnotationSchema,
  createCommentAnnotationSchema,
  createRiskAnnotationSchema
]);
export {
  createFileAnnotationSchema as a,
  createCommentAnnotationSchema as b,
  createAnnotationPayloadSchema as c,
  riskAnnotationFormSchema as r,
  tagAnnotationFormSchema as t
};
