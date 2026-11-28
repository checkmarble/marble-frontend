import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import {
  type CaseReviewSetting,
  type KYCEnrichmentSetting,
  transformCaseReviewSetting,
} from '@app-builder/models/ai-settings';
import * as Sentry from '@sentry/tanstackstart-react';

export async function getAiAssistSettings(api: MarbleCoreApi): Promise<{
  caseReviewSetting: CaseReviewSetting;
  kycEnrichmentSetting: KYCEnrichmentSetting;
}> {
  try {
    const settings = await api.getAiSettings();
    return transformCaseReviewSetting.decode(settings);
  } catch (error: unknown) {
    Sentry.captureException(error);
    throw error;
  }
}
