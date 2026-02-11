import { type ScreeningMatchPayload } from '@app-builder/models/screening';
import {
  type FreeformSearchInput,
  freeformSearchSchema,
} from '@app-builder/routes/ressources+/screenings+/freeform-search';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';
import { serialize as objectToFormData } from 'object-to-formdata';

type FreeformSearchResponse = { success: true; data: ScreeningMatchPayload[] } | { success: false; error: unknown };

export const useFreeformSearchMutation = () => {
  return useMutation({
    mutationKey: ['screening', 'freeform-search'],
    mutationFn: async (input: FreeformSearchInput): Promise<FreeformSearchResponse> => {
      // Validate input
      const validation = freeformSearchSchema.safeParse(input);
      if (!validation.success) {
        return { success: false, error: validation.error };
      }

      const formData = objectToFormData(input, {
        dotsForObjectNotation: true,
        noAttributesWithArrayNotation: true,
      });

      const response = await fetch(getRoute('/ressources/screenings/freeform-search'), {
        method: 'POST',
        body: formData,
      });

      return response.json() as Promise<FreeformSearchResponse>;
    },
  });
};
