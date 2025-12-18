import { z } from 'zod/v4';

export const OVERRIDABLE_FEATURES = [
  'test_run',
  'sanctions',
  'case_auto_assign',
  'case_ai_assist',
  'continuous_screening',
] as const;

export const featureValueSchema = z.enum(['allowed', 'restricted', 'test']);

export type FeatureValue = z.infer<typeof featureValueSchema>;

export const patchOrganizationFeaturesPayloadSchema = z.record(z.enum(OVERRIDABLE_FEATURES), featureValueSchema);

export type PatchOrganizationFeaturesPayload = z.infer<typeof patchOrganizationFeaturesPayloadSchema>;
