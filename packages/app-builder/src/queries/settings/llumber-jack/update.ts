import { AiSettingSchema } from '@app-builder/models/ai-settings';
import { getRoute } from '@app-builder/utils/routes';
import { useMutation } from '@tanstack/react-query';

export const languages = new Map([
  ['fr-FR', 'French'],
  ['en-US', 'English'],
  ['ar-SA', 'Arabic'],
  ['bn-BD', 'Bengali'],
  ['zh-Hans', 'Chinese'],
  ['hi-IN', 'Hindi'],
  ['ja-JP', 'Japanese'],
  ['pa-IN', 'Lahnda Punjabi'],
  ['pt-BR', 'Portuguese'],
  ['ru-RU', 'Russian'],
  ['es-ES', 'Spanish'],
]);

// const languageCodes = Array.from(languages.keys()) as [string, ...string[]];
// const domainsArraySchema = z.array(z.union([z.literal(''), z.url()])).superRefine((arr, ctx) => {
//   const seen = new Set<string>();
//   arr.forEach((value, index) => {
//     if (value === '') return;
//     if (seen.has(value)) {
//       ctx.addIssue({
//         code: 'custom',
//         path: [index],
//         params: { code: 'duplicate_value' },
//       });
//     } else {
//       seen.add(value);
//     }
//   });
// });
// export const editAISettingsSchema = z.object({
//   caseReviewSetting: z.object({
// language: z.enum(languageCodes).default('en-US'),
//     structure: z.string().nullable(),
//     orgDescription: z.string().nullable(),
//   }),
//   kycEnrichmentSetting: z.object({
//     domainsFilter: domainsArraySchema,
//   }),
// });

// export type editAiSettingsPayload = z.infer<typeof editAISettingsSchema>;

// Flat form schema matching UI fields
// export const editAISettingsFormSchema = z.object({
// language: z.enum(languageCodes),
//   structure: z.string(),
//   orgDescription: z.string(),
//   domainsFilter: domainsArraySchema,
// });

// export type editAISettingsFormValues = z.infer<typeof editAISettingsFormSchema>;

// export const toEditAICaseReviewPayload = (
//   values: EditAICaseReviewFormValues,
// ): editAiCaseReviewPayload => ({
//   caseReviewSetting: {
//     language: values.language,
//     structure: values.structure || undefined,
//     orgDescription: values.orgDescription || undefined,
//   },
//   kycEnrichmentSetting: {
//     domainsFilter: values.domainsFilter.filter((v) => v !== ''),
//   },
// });

const endpoint = () => getRoute('/ressources/settings/ai-review');

export const useUpdateLumberJack = () => {
  return useMutation({
    mutationKey: ['settings', 'llumber-jack', 'update'],
    mutationFn: async (payload: AiSettingSchema) => {
      const response = await fetch(endpoint(), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return response.json();
    },
  });
};
