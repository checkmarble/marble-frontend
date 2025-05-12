import type {
  CreateScenarioPublicationBody as CreateScenarioPublicationBodyDto,
  ScenarioPublicationStatusDto,
} from 'marble-api';

export interface ScenarioPublicationStatus {
  status: 'required' | 'ready_to_activate';
  serviceStatus: 'available' | 'occupied';
}

export function adaptScenarioPublicationStatus(
  dto: ScenarioPublicationStatusDto,
): ScenarioPublicationStatus {
  return {
    status: dto.preparation_status,
    serviceStatus: dto.preparation_service_status,
  };
}

export interface CreateScenarioPublicationBody {
  publicationAction: 'publish' | 'unpublish';
  scenarioIterationId: string;
}

export function adaptCreateScenarioPublicationBodyDto(
  body: CreateScenarioPublicationBody,
): CreateScenarioPublicationBodyDto {
  return {
    publication_action: body.publicationAction,
    scenario_iteration_id: body.scenarioIterationId,
  };
}
