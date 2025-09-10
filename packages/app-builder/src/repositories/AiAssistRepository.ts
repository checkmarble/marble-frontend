import { MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import {
  CaseReviewSetting,
  KYCEnrichmentSetting,
  transformCaseReviewSetting,
} from '@app-builder/models/ai-settings';
import * as Sentry from '@sentry/remix';

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
        Sentry.captureException(error);
        throw error;
      }
    },
    updateAiAssistSettings: async (settings: {
      caseReviewSetting: CaseReviewSetting;
      kycEnrichmentSetting: KYCEnrichmentSetting;
    }) => {
      await client.upsertAiSettings(transformCaseReviewSetting.encode(settings));
    },
  });
