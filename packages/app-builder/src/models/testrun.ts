import {
  type TestRunCreateInputDto,
  type TestRunDto,
} from 'marble-api/generated/marblecore-api';

export const testRunStatuses = ['up', 'down', 'pending', 'unknown'] as const;
export type TestRunStatus = (typeof testRunStatuses)[number];

export interface TestRun {
  id: string;
  scenarioId: string;
  refIterationId: string;
  testIterationId: string;
  startDate: string;
  endDate: string;
  creatorId: string;
  status: TestRunStatus;
}

export function adaptTestRun(dto: TestRunDto): TestRun {
  return {
    id: dto.id,
    scenarioId: dto.scenario_id,
    refIterationId: dto.test_iteration_id,
    testIterationId: dto.test_iteration_id,
    startDate: dto.start_date,
    endDate: dto.end_date,
    creatorId: dto.creator_id,
    status: dto.status,
  };
}

export interface TestRunCreateInput {
  scenarioId: string;
  testIterationId: string;
  endDate: string;
}

export function adaptTestRunCreateInputDto(
  input: TestRunCreateInput,
): TestRunCreateInputDto {
  return {
    scenario_id: input.scenarioId,
    test_iteration_id: input.testIterationId,
    end_date: input.endDate,
  };
}
