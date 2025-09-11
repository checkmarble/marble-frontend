import { uniqueBy } from '@app-builder/utils/schema/helpers/unique-array';
import { z } from 'zod';

export const languages = new Map([
  ['fr', 'French'],
  ['en', 'English'],
  ['ar', 'Arabic'],
  ['bn', 'Bengali'],
  ['zh', 'Chinese'],
  ['hi', 'Hindi'],
  ['ja', 'Japanese'],
  ['pa', 'Lahnda Punjabi'],
  ['pt', 'Portuguese'],
  ['ru', 'Russian'],
  ['es', 'Spanish'],
]);

export const languageCodeSchema = z.enum(Array.from(languages.keys()));

const httpUrlValidationSchema = z.string().superRefine((val, ctx) => {
  const url = val.startsWith('http://') || val.startsWith('https://') ? val : `https://${val}`;
  try {
    const urlObj = new URL(url);
    const isValid =
      (urlObj.protocol === 'https:' || urlObj.protocol === 'http:') &&
      urlObj.hostname.includes('.') &&
      !urlObj.hostname.startsWith('.') &&
      !urlObj.hostname.endsWith('.') &&
      urlObj.hostname.length > 3;

    if (!isValid) {
      ctx.addIssue({
        code: 'custom',
        params: {
          code: 'invalid_domain',
        },
      });
    }
  } catch {
    ctx.addIssue({
      code: 'custom',
      params: {
        code: 'invalid_domain',
      },
    });
  }
});

const httpUrlSchema = httpUrlValidationSchema;

// Helper function to extract domain from URL
const extractDomain = (val: string): string => {
  const url = val.startsWith('http://') || val.startsWith('https://') ? val : `https://${val}`;
  const urlObj = new URL(url);
  return urlObj.hostname;
};

export const caseReviewSettingDtoSchema = z.object({
  language: languageCodeSchema,
  structure: z.string().nullable(),
  org_description: z.string().nullable(),
});

export const caseReviewSettingSchema = z.object({
  language: languageCodeSchema,
  structure: z.string(),
  orgDescription: z.string(),
});

export const kycEnrichmentSettingDtoSchema = z.object({
  enabled: z.boolean(),
  custom_instructions: z.string().optional().nullable(),
  domain_filter: z.array(z.string()),
});

export const kycEnrichmentSettingSchema = z.object({
  enabled: z.boolean(),
  customInstructions: z.string(),
  domainsFilter: uniqueBy(z.array(httpUrlSchema), (s) => s).max(10),
});

export const aiSettingSchema = z.object({
  caseReviewSetting: caseReviewSettingSchema,
  kycEnrichmentSetting: kycEnrichmentSettingSchema,
});

export const aiSettingDtoSchema = z.object({
  case_review_setting: caseReviewSettingDtoSchema,
  kyc_enrichment_setting: kycEnrichmentSettingDtoSchema,
});

export const transformCaseReviewSetting = z.codec(aiSettingDtoSchema, aiSettingSchema, {
  encode: ({ caseReviewSetting, kycEnrichmentSetting }) => ({
    case_review_setting: {
      language: caseReviewSetting.language,
      structure: caseReviewSetting.structure,
      org_description: caseReviewSetting.orgDescription,
    },
    kyc_enrichment_setting: {
      enabled: kycEnrichmentSetting.enabled,
      custom_instructions: kycEnrichmentSetting.customInstructions,
      domain_filter: kycEnrichmentSetting.domainsFilter.map(extractDomain),
    },
  }),
  decode: ({ case_review_setting, kyc_enrichment_setting }) => ({
    caseReviewSetting: {
      language: case_review_setting.language,
      structure: case_review_setting.structure ?? '',
      orgDescription: case_review_setting.org_description ?? '',
    },
    kycEnrichmentSetting: {
      enabled: kyc_enrichment_setting.enabled,
      customInstructions: kyc_enrichment_setting.custom_instructions ?? '',
      domainsFilter: kyc_enrichment_setting.domain_filter,
    },
  }),
});

export type CaseReviewSetting = z.infer<typeof caseReviewSettingSchema>;
export type KYCEnrichmentSetting = z.infer<typeof kycEnrichmentSettingSchema>;
export type CaseReviewSettingDto = z.infer<typeof caseReviewSettingDtoSchema>;
export type KYCEnrichmentSettingDto = z.infer<typeof kycEnrichmentSettingDtoSchema>;
export type AiSettingDtoSchema = z.infer<typeof aiSettingDtoSchema>;
export type AiSettingSchema = z.infer<typeof aiSettingSchema>;
