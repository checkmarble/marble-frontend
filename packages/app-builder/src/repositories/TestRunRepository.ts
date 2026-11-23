import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import {
  adaptTestRun,
  adaptTestRunCreateInputDto,
  adaptTestRunDecision,
  adaptTestRunRuleExecution,
  type TestRun,
  type TestRunCreateInput,
  type TestRunDecision,
  type TestRunRuleExecutionCount,
} from '@app-builder/models/testrun';

export interface TestRunRepository {
  getTestRun(args: { testRunId: string }): Promise<TestRun>;
  cancelTestRun(args: { testRunId: string }): Promise<void>;
  launchTestRun(args: TestRunCreateInput): Promise<TestRun>;
  listTestRuns(args: { scenarioId: string }): Promise<TestRun[]>;
  listDecisions(args: { testRunId: string }): Promise<TestRunDecision[]>;
  listRuleExecutions(args: { testRunId: string }): Promise<TestRunRuleExecutionCount[]>;
}

export const makeGetTestRunRepository = () => {
  return (marbleCoreApiClient: MarbleCoreApi): TestRunRepository => ({
    getTestRun: async ({ testRunId }) => {
      const result = await marbleCoreApiClient.getTestRun(testRunId);
      return adaptTestRun(result.scenario_test_run);
    },
    cancelTestRun: async ({ testRunId }) => {
      await marbleCoreApiClient.cancelTestRun(testRunId);
      return;
    },
    launchTestRun: async (args) => {
      const { scenario_test_run } = await marbleCoreApiClient.createTestRun(adaptTestRunCreateInputDto(args));
      return adaptTestRun(scenario_test_run);
    },
    listTestRuns: async ({ scenarioId }) => {
      const result = await marbleCoreApiClient.listTestRuns(scenarioId);
      return result.scenario_test_runs.map(adaptTestRun);
    },
    listDecisions: async ({ testRunId }) => {
      const { decisions: result } = await marbleCoreApiClient.getDecisionData(testRunId);
      return result.map(adaptTestRunDecision);
    },
    listRuleExecutions: async ({ testRunId }) => {
      const { rules: result } = await marbleCoreApiClient.getRuleData(testRunId);
      return result.map(adaptTestRunRuleExecution);
    },
  });
};
