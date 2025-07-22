import { type OutcomeDto } from 'marble-api';
import { z } from 'zod';
import { undefinedAstNodeName } from '../astNode/ast-node';
import { isBinaryMainAstOperatorFunction } from '../astNode/builder-ast-node-node-operator';
import { knownOutcomes } from '../outcome';
import { type Rule, type WorkflowAction, type WorkflowCondition } from './workflow';

// OutcomeDto validation schema
const outcomeSchema = z.enum([
  'approve',
  'review',
  'decline',
  'block_and_review',
  'unknown',
] as const);

// Enhanced node schema for AST nodes with recursive validation
const baseNodeSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  constant: z.unknown().optional(),
  children: z.array(z.unknown()).optional(),
  namedChildren: z.record(z.unknown()).optional(),
});

// Create a recursive schema for complete AST node validation
const nodeSchema: z.ZodType<any> = baseNodeSchema.extend({
  children: z.lazy(() => z.array(nodeSchema)).optional(),
  namedChildren: z.lazy(() => z.record(nodeSchema)).optional(),
});

// Specific schema for binary expression validation
const binaryExpressionSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .refine(
      (name) =>
        name !== null && name !== undefinedAstNodeName && isBinaryMainAstOperatorFunction(name),
      {
        message: 'A valid operator must be selected',
      },
    ),
  constant: z.undefined(),
  children: z
    .array(
      z
        .object({
          id: z.string(),
          name: z
            .string()
            .nullable()
            .refine((name) => name !== undefinedAstNodeName, {
              message: 'Operand cannot be empty',
            }),
        })
        .passthrough(),
    )
    .length(2, 'Binary expression must have exactly 2 operands'),
  namedChildren: z.record(z.unknown()).optional(),
});

// Workflow condition schemas
const alwaysConditionSchema = z.object({
  function: z.literal('always'),
});

const neverConditionSchema = z.object({
  function: z.literal('never'),
});

const outcomeInConditionSchema = z.object({
  function: z.literal('outcome_in'),
  params: z.array(outcomeSchema).min(1, 'At least one outcome must be selected'),
});

const ruleHitConditionSchema = z.object({
  function: z.literal('rule_hit'),
  params: z.object({
    rule_id: z.string().min(1, 'Rule ID cannot be empty'),
  }),
});

const payloadEvaluatesConditionSchema = z.object({
  function: z.literal('payload_evaluates'),
  params: z.object({
    expression: binaryExpressionSchema,
  }),
});

// Union of all condition types - keeping for potential future use
export const workflowConditionDetailSchema = z.discriminatedUnion('function', [
  alwaysConditionSchema,
  neverConditionSchema,
  outcomeInConditionSchema,
  ruleHitConditionSchema,
  payloadEvaluatesConditionSchema,
]);

// Rule validation schema - more flexible approach
export const ruleValidationSchema = z
  .object({
    id: z.string(),
    name: z.string().min(1, ''),
    fallthrough: z.boolean(),
    conditions: z.array(
      z
        .object({
          id: z.string(),
          function: z.string(),
        })
        .passthrough(),
    ),
    // .min(1, t('workflows:condition.error.atLeastOneCondition')),
    actions: z
      .array(
        z
          .object({
            id: z.string(),
            action: z.string(),
          })
          .passthrough(),
      )
      .length(1, 'An action is required'),
  })
  .passthrough(); // Allow additional fields that might exist in the actual data

// Helper function to validate payload_evaluates conditions
// function validatePayloadEvaluatesCondition(
//   condition: any,
//   conditionIndex: number,
// ): {
//   isValid: boolean;
//   errors: string[];
// } {
//   const errors: string[] = [];

//   if (!('params' in condition) || !condition.params || typeof condition.params !== 'object') {
//     errors.push(`Condition ${conditionIndex}: Payload condition must have parameters`);
//     return { isValid: false, errors };
//   }

//   if (!('expression' in condition.params) || !condition.params.expression) {
//     errors.push(`Condition ${conditionIndex}: Payload condition must have an expression`);
//     return { isValid: false, errors };
//   }

//   const expression = condition.params.expression;

//   // Check if operator is selected (name should not be null, undefined, or "Undefined")
//   if (!expression.name || expression.name === undefinedAstNodeName) {
//     errors.push(`Condition ${conditionIndex}: An operator must be selected`);
//   } else if (!isBinaryMainAstOperatorFunction(expression.name)) {
//     errors.push(`Condition ${conditionIndex}: Invalid operator selected`);
//   }

//   // Check if both operands are defined
//   if (!Array.isArray(expression.children) || expression.children.length !== 2) {
//     errors.push(`Condition ${conditionIndex}: Expression must have exactly 2 operands`);
//   } else {
//     expression.children.forEach((child: any, childIndex: number) => {
//       if (!child || child.name === undefinedAstNodeName) {
//         const operandLabel = childIndex === 0 ? 'left' : 'right';
//         errors.push(`Condition ${conditionIndex}: The ${operandLabel} operand must be set`);
//       }
//     });
//   }

//   return { isValid: errors.length === 0, errors };
// }

// More specific validation functions for better error messages
export function validateRuleConditions(conditions: WorkflowCondition[]): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // if (!Array.isArray(conditions) || conditions.length === 0) {
  //   errors.push(t('workflows:condition.error.atLeastOneCondition'));
  //   return { isValid: false, errors };
  // }

  conditions.forEach((condition, index) => {
    if (!condition.function) {
      errors.push(`Condition ${index + 1}: Missing function type`);
    }
    // } else if (condition.function === 'outcome_in') {
    //   if (
    //     !('params' in condition) ||
    //     !Array.isArray(condition.params) ||
    //     condition.params.length === 0
    //   ) {
    //     errors.push(
    //       `Condition ${index + 1}: Outcome condition must have at least one outcome selected`,
    //     );
    //   }
    // } else if (condition.function === 'payload_evaluates') {
    //   console.log('🔍 Validating payload_evaluates condition:', condition);
    //   const validationResult = validatePayloadEvaluatesCondition(condition, index + 1);
    //   console.log('📋 Payload validation result:', validationResult);
    //   errors.push(...validationResult.errors);
    // }
  });

  return { isValid: errors.length === 0, errors };
}

export function validateRuleAction(actions: WorkflowAction[]): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!Array.isArray(actions) || actions.length === 0) {
    errors.push('At least one action is required');
    return { isValid: false, errors };
  }

  return { isValid: errors.length === 0, errors };
}

// Enhanced validation function
export function validateRuleEnhanced(rule: Rule): {
  success: boolean;
  error?: { errors: Array<{ message: string; path: string[] }> };
} {
  // console.log('🔍 Enhanced validation for rule:', rule);

  try {
    // First try the basic Zod validation
    const zodResult = ruleValidationSchema.safeParse(rule);
    // console.log('📋 Zod validation result:', JSON.stringify(zodResult, null, 2));

    if (zodResult.success) {
      // Additional custom validations
      const ruleData = zodResult.data;
      const conditionValidation = validateRuleConditions(
        ruleData.conditions as WorkflowCondition[],
      );
      const actionValidation = validateRuleAction(ruleData.actions as WorkflowAction[]);

      const allErrors: Array<{ message: string; path: string[] }> = [];

      conditionValidation.errors.forEach((error) => {
        allErrors.push({ message: error, path: ['conditions'] });
      });

      actionValidation.errors.forEach((error) => {
        allErrors.push({ message: error, path: ['actions'] });
      });

      if (allErrors.length > 0) {
        return { success: false, error: { errors: allErrors } };
      }

      return { success: true };
    } else {
      // Map Zod errors to our format
      const mappedErrors = zodResult.error.errors.map((error) => ({
        message: error.message,
        path: error.path.map((p) => String(p)),
      }));

      return { success: false, error: { errors: mappedErrors } };
    }
  } catch (error) {
    console.error('Validation error:', error);
    return {
      success: false,
      error: {
        errors: [
          {
            message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            path: [],
          },
        ],
      },
    };
  }
}

// Type for validation errors
export type RuleValidationError = z.ZodError<typeof ruleValidationSchema._type>;

// Helper function to validate a rule (legacy support)
export function validateRule(rule: unknown) {
  return ruleValidationSchema.safeParse(rule);
}

// Helper function to check if outcomes are valid
export function validateOutcomes(outcomes: OutcomeDto[]): boolean {
  return (
    outcomes.length > 0 &&
    outcomes.every(
      (outcome) =>
        knownOutcomes.includes(outcome as (typeof knownOutcomes)[number]) || outcome === 'unknown',
    )
  );
}

// Helper function to get validation errors for a specific field
export function getFieldErrors(error: z.ZodError, fieldPath: string): string[] {
  return error.errors.filter((err) => err.path.join('.') === fieldPath).map((err) => err.message);
}

// Helper function to check if a rule has validation errors
export function hasValidationErrors(rule: Rule): boolean {
  const result = validateRuleEnhanced(rule);
  return !result.success;
}
