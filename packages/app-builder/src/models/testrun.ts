import {
  type TestRunCreateInputDto,
  type TestRunDto,
  type TestRunStatusDto,
  type TestRunDecisionDataDto,
  type TestRunRuleExecutionDataDto,
} from 'marble-api/generated/marblecore-api';
import { knownOutcomes } from './outcome';

type Outcome = (typeof knownOutcomes)[number];

export type TestRunStatus = TestRunStatusDto;
export const testRunStatuses = [
  'up',
  'down',
  'pending',
  'unknown',
] satisfies TestRunStatus[];

export type TestRunRuleStatus = TestRunRuleExecutionDataDto['status'];
export const testRunRuleStatuses = [
  'hit',
  'no_hit',
  'error',
  'snoozed',
] satisfies TestRunRuleStatus[];

export interface TestRunRuleExecution {
  version: string;
  name: string;
  status: TestRunRuleStatus;
  total: number;
  rule_id: string;
}

export function adaptTestRunRuleExecution(
  dto: TestRunRuleExecutionDataDto,
): TestRunRuleExecution {
  return {
    version: dto.version,
    name: dto.name,
    status: dto.status,
    total: dto.total,
    rule_id: dto.stable_rule_id,
  };
}

export interface TestRunDecision {
  version: string;
  outcome: Outcome;
  count: number;
}

export function adaptTestRunDecision(
  dto: TestRunDecisionDataDto,
): TestRunDecision {
  return {
    version: dto.version,
    outcome: dto.outcome as Outcome,
    count: dto.total,
  };
}

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
