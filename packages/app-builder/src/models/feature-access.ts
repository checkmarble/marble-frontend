import { type FeatureAccessDto, type FeatureAccessLevelDto } from 'marble-api/generated/feature-access-api';

export interface FeatureAccesses {
  workflows: FeatureAccessLevelDto;
  analytics: FeatureAccessLevelDto;
  userRoles: FeatureAccessLevelDto;
  webhooks: FeatureAccessLevelDto;
  ruleSnoozes: FeatureAccessLevelDto;
  testRun: FeatureAccessLevelDto;
  sanctions: FeatureAccessLevelDto;
  nameRecognition: FeatureAccessLevelDto;
  AiAssist: FeatureAccessLevelDto;
  autoAssignment: FeatureAccessLevelDto;
  caseAiAssist: FeatureAccessLevelDto;
  continuousScreening: FeatureAccessLevelDto;
}

export function emptyFeatureAccesses(): FeatureAccesses {
  return {
    workflows: 'restricted',
    analytics: 'restricted',
    userRoles: 'restricted',
    webhooks: 'restricted',
    ruleSnoozes: 'restricted',
    testRun: 'restricted',
    sanctions: 'restricted',
    nameRecognition: 'restricted',
    AiAssist: 'restricted',
    autoAssignment: 'restricted',
    caseAiAssist: 'restricted',
    continuousScreening: 'restricted',
  };
}

export function adaptFeatureAccesses(dto: FeatureAccessDto): FeatureAccesses {
  return {
    workflows: dto.workflows,
    analytics: dto.analytics,
    userRoles: dto.roles,
    webhooks: dto.webhooks,
    ruleSnoozes: dto.rule_snoozes,
    testRun: dto.test_run,
    sanctions: dto.sanctions,
    nameRecognition: dto.name_recognition,
    AiAssist: dto.ai_assist,
    autoAssignment: dto.case_auto_assign,
    caseAiAssist: dto.case_ai_assist,
    continuousScreening: dto.continuous_screening,
  };
}
