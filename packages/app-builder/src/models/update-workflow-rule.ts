import { protectArray } from '@app-builder/utils/schema/helpers/array';
import { z } from 'zod/v4';

const astNodeSchema: z.ZodTypeAny = z.object({
  id: z.string().optional(),
  name: z.string().nullish(),
  constant: z.any().optional(),
  children: protectArray(z.array(z.lazy(() => astNodeSchema))).optional(),
  namedChildren: z
    .record(
      z.string(),
      z.lazy(() => astNodeSchema),
    )
    .optional(),
});

const workflowConditionSchema = z
  .object({
    id: z.string(),
  })
  .and(
    z.discriminatedUnion('function', [
      z.object({
        function: z.literal('always'),
      }),
      z.object({
        function: z.literal('never'),
      }),
      z.object({
        function: z.literal('outcome_in'),
        params: protectArray(z.array(z.enum(['approve', 'review', 'decline', 'block_and_review', 'unknown']))),
      }),
      z.object({
        function: z.literal('rule_hit'),
        params: z.object({
          ruleIds: protectArray(z.array(z.string())),
        }),
      }),
      z.object({
        function: z.literal('payload_evaluates'),
        params: z.object({
          expression: astNodeSchema,
        }),
      }),
    ]),
  );

const workflowActionSchema = z
  .object({
    id: z.string(),
  })
  .and(
    z.discriminatedUnion('action', [
      z.object({
        action: z.literal('DISABLED'),
      }),
      z.object({
        action: z.enum(['CREATE_CASE', 'ADD_TO_CASE_IF_POSSIBLE']),
        params: z.object({
          inboxId: z.string(),
          anyInbox: z.boolean().optional(),
          titleTemplate: astNodeSchema.optional(),
          tagIds: protectArray(z.array(z.string())).optional(),
        }),
      }),
    ]),
  );

export const ruleSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Rule name is required'),
  fallthrough: z.boolean(),
  conditions: protectArray(z.array(workflowConditionSchema)),
  actions: protectArray(z.array(workflowActionSchema).length(1, 'Exactly one action is required')),
});
