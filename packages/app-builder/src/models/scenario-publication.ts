import { type ScenarioPublicationStatusDto } from 'marble-api';

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
