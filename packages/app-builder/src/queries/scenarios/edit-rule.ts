import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { astNodeSchema } from '@app-builder/models';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import { ZodType, z } from 'zod/v4';

export const editRulePayloadSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  ruleGroup: z.string().optional(),
  scoreModifier: z.number().int().min(-1000).max(1000),
  formula: astNodeSchema.nullable(),
});

export type EditRulePayload = z.infer<typeof editRulePayloadSchema>;

type EditRuleFormValue = Omit<EditRulePayload, 'formula'> & { formula: any };
export type AdaptedEditRulePayloadSchema = ZodType<EditRuleFormValue, EditRuleFormValue>;

const endpoint = (ruleId: string) => getRoute('/ressources/scenarios/edit-rule/:ruleId', { ruleId });

export const useEditRuleMutation = (ruleId: string) => {
  const navigate = useAgnosticNavigation();

  return useMutation({
    mutationKey: ['scenarios', 'edit-rule', ruleId],
    mutationFn: async (payload: EditRulePayload) => {
      const response = await fetch(endpoint(ruleId), {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.redirectTo) {
        navigate(result.redirectTo);
        return;
      }

      return result;
    },
  });
};
