import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';

// API response types from generated client
const ASTValidationDetailSchema = z.object({
  is_valid: z.boolean(),
  errors: z.array(z.string()).optional().nullable(),
  warnings: z.array(z.string()).optional().nullable(),
});

const GenerateRuleResponseSchema = z.object({
  rule_ast: z.any().nullable(), // NodeDto from backend or null
  validation: ASTValidationDetailSchema,
});

export type GenerateRuleResponse = z.infer<typeof GenerateRuleResponseSchema>;
export type ASTValidationDetail = z.infer<typeof ASTValidationDetailSchema>;

export function useGenerateRuleMutation(ruleId: string) {
  return useMutation({
    mutationFn: async (instruction: string) => {
      const response = await fetch(`/ressources/scenario-iteration-rules/${ruleId}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instruction }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate rule: ${response.statusText}`);
      }

      const data = await response.json();
      return GenerateRuleResponseSchema.parse(data);
    },
  });
}
