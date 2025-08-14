import { z } from 'zod/v4';

export const baseCreateAnnotationSchema = z.object({
  tableName: z.string(),
  objectId: z.string(),
  caseId: z.uuid(),
});

export const createTagAnnotationSchema = z.intersection(
  baseCreateAnnotationSchema,
  z.object({
    type: z.literal('tag'),
    payload: z.object({
      addedTags: z.array(z.uuid()).optional(),
      removedAnnotations: z.array(z.uuid()).optional(),
    }),
  }),
);

export const tagAnnotationFormSchema = z.intersection(
  baseCreateAnnotationSchema,
  z.object({
    type: z.literal('tag'),
    payload: z.object({
      tags: z.array(z.string()),
    }),
  }),
);

export const createFileAnnotationSchema = z.intersection(
  baseCreateAnnotationSchema,
  z.object({
    type: z.literal('file'),
    payload: z.object({
      files: z.array(z.instanceof(File)).min(1),
    }),
  }),
);

export const createCommentAnnotationSchema = z.intersection(
  baseCreateAnnotationSchema,
  z.object({
    type: z.literal('comment'),
    payload: z.object({
      text: z.string().nonempty(),
    }),
  }),
);

export const createAnnotationPayloadSchema = z.union([
  createTagAnnotationSchema,
  createFileAnnotationSchema,
  createCommentAnnotationSchema,
]);

export type CreateAnnotationPayload = z.infer<typeof createAnnotationPayloadSchema>;
