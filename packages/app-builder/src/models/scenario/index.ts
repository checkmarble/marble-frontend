import { type ScenarioCreateInputDto, type ScenarioDto } from 'marble-api';

export type DecisionToCaseWorkflowType = 'DISABLED' | 'CREATE_CASE' | 'ADD_TO_CASE_IF_POSSIBLE';

export interface Scenario {
  id: string;
  createdAt: string;
  description: string;
  liveVersionId?: string;
  name: string;
  organizationId: string;
  triggerObjectType: string;
}

export function adaptScenario(dto: ScenarioDto): Scenario {
  return {
    id: dto.id,
    createdAt: dto.created_at,
    description: dto.description,
    liveVersionId: dto.live_version_id,
    name: dto.name,
    organizationId: dto.organization_id,
    triggerObjectType: dto.trigger_object_type,
  };
}

export interface ScenarioCreateInput {
  name: string;
  description: string | null;
  triggerObjectType: string;
}

export function adaptScenarioCreateInputDto(input: ScenarioCreateInput): ScenarioCreateInputDto {
  return {
    name: input.name,
    description: input.description ?? '',
    trigger_object_type: input.triggerObjectType,
  };
}
