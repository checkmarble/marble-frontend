import { uniqueBy } from '@app-builder/utils/schema/helpers/unique-array';
import { z } from 'zod';

export const caseReviewSettingSchema = z.object({
  language: z.string(),
  structure: z.string(),
  orgDescription: z.string(),
});

export const caseReviewSettingDtoSchema = z.object({
  language: z.string().nullable(),
  structure: z.string().nullable(),
  org_description: z.string().nullable(),
});

export const kycEnrichmentSettingDtoSchema = z.object({
  domain_filter: z.array(z.string()),
});

export const kycEnrichmentSettingSchema = z.object({
  domainsFilter: uniqueBy(z.array(z.url()), (s) => s).max(10),
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
      language: caseReviewSetting.language ?? null,
      structure: caseReviewSetting.structure ?? null,
      org_description: caseReviewSetting.orgDescription ?? null,
    },
    kyc_enrichment_setting: {
      domain_filter: kycEnrichmentSetting.domainsFilter ?? [],
    },
  }),
  decode: ({ case_review_setting, kyc_enrichment_setting }) => ({
    caseReviewSetting: {
      language: case_review_setting.language ?? 'en-US',
      structure: case_review_setting.structure ?? '',
      orgDescription: case_review_setting.org_description ?? '',
    },
    kycEnrichmentSetting: {
      domainsFilter: kyc_enrichment_setting.domain_filter ?? [],
    },
  }),
});

export type CaseReviewSetting = z.infer<typeof caseReviewSettingSchema>;
export type KYCEnrichmentSetting = z.infer<typeof kycEnrichmentSettingSchema>;
export type CaseReviewSettingDto = z.infer<typeof caseReviewSettingDtoSchema>;
export type KYCEnrichmentSettingDto = z.infer<typeof kycEnrichmentSettingDtoSchema>;
export type AiSettingDtoSchema = z.infer<typeof aiSettingDtoSchema>;
export type AiSettingSchema = z.infer<typeof aiSettingSchema>;
