import { MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import {
  CaseReviewSetting,
  KYCEnrichmentSetting,
  transformCaseReviewSetting,
} from '@app-builder/models/ai-settings';

export interface AiAssistRepository {
  getAiAssistSettings(): Promise<{
    caseReviewSetting: CaseReviewSetting;
    kycEnrichmentSetting: KYCEnrichmentSetting;
  }>;
  updateAiAssistSettings(settings: {
    caseReviewSetting: CaseReviewSetting;
    kycEnrichmentSetting: KYCEnrichmentSetting;
  }): Promise<void>;
}

export const makeGetAiAssistSettingsRepository =
  () =>
  (client: MarbleCoreApi): AiAssistRepository => ({
    getAiAssistSettings: async () => {
      try {
        const settings = await client.getAiSettings();
        return transformCaseReviewSetting.decode(settings);
      } catch (error: unknown) {
        if ((error as { status?: number })?.status === 404) {
          return transformCaseReviewSetting.decode({
            case_review_setting: {
              language: 'en-US',
              structure: null,
              org_description: null,
            },
            kyc_enrichment_setting: {
              domain_filter: [],
            },
          });
        }
        throw error;
      }
    },
    updateAiAssistSettings: async (settings: {
      caseReviewSetting: CaseReviewSetting;
      kycEnrichmentSetting: KYCEnrichmentSetting;
    }) => {
      await client.updateAiSettings(transformCaseReviewSetting.encode(settings));
    },
  });
