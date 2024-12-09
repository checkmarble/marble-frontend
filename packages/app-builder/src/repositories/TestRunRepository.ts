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
  type TestRunStatus,
  testRunStatuses,
} from '@app-builder/models/testrun';
import { toUUID } from '@app-builder/utils/short-uuid';
import { addDays } from 'date-fns';
import { randomInteger } from 'remeda';
import short from 'short-uuid';

export interface TestRunRepository {
  getTestRun(args: { testRunId: string }): Promise<TestRun>;
  launchTestRun(args: TestRunCreateInput): Promise<TestRun>;
  listTestRuns(args: { scenarioId: string }): Promise<TestRun[]>;
  listDecisions(args: { testRunId: string }): Promise<TestRunDecision[]>;
  listRuleExecutions(args: {
    testRunId: string;
  }): Promise<TestRunRuleExecutionCount[]>;
}

const testruns: TestRun[] = [
  {
    id: '989ed5e4-c7ca-4685-9535-a3e1ab9dfc75',
    refIterationId: '6f6fe0d8-9a1a-4d5a-bdd7-fa7fcda1b4e3',
    scenarioId: '6f6fe0d8-0804-4500-ae68-f4e56ea780d7',
    testIterationId: '6f6fe0d8-bbc8-4df3-a913-c0064ed99e4e',
    startDate: String(new Date().getTime()),
    endDate: String(addDays(new Date(), 1).getTime()),
    creatorId: '96762987-8895-4af2-9c0a-2dffde09985c',
    status: 'up',
  },
];

const testrunDecisions: TestRunDecision[] = [
  { version: 'V1', outcome: 'approve', count: 10 },
  { version: 'V4', outcome: 'approve', count: 20 },
  { version: 'V1', outcome: 'decline', count: 5 },
  { version: 'V1', outcome: 'approve', count: 30 },
  { version: 'V4', outcome: 'decline', count: 15 },
  { version: 'V1', outcome: 'review', count: 9 },
  { version: 'V4', outcome: 'review', count: 22 },
  { version: 'V1', outcome: 'block_and_review', count: 20 },
];

const testrunRuleExecutions: TestRunRuleExecutionCount[] = [
  {
    version: 'V1',
    name: 'Rule 1 name',
    status: 'hit',
    total: 10,
    ruleId: 'rule-1',
  },
  {
    version: 'V4',
    name: 'Rule 1 name',
    status: 'hit',
    total: 15,
    ruleId: 'rule-1',
  },
  {
    version: 'V1',
    name: 'Rule 1 name',
    status: 'no_hit',
    total: 20,
    ruleId: 'rule-1',
  },
  {
    version: 'V4',
    name: 'Rule 1 name',
    status: 'no_hit',
    total: 15,
    ruleId: 'rule-1',
  },
  {
    version: 'V1',
    name: 'Rule 1 name',
    status: 'error',
    total: 5,
    ruleId: 'rule-1',
  },
  {
    version: 'V4',
    name: 'Rule 1 name',
    status: 'snoozed',
    total: 5,
    ruleId: 'rule-1',
  },
  {
    version: 'V1',
    name: 'Rule 2 name',
    status: 'no_hit',
    total: 5,
    ruleId: 'rule-2',
  },
  {
    version: 'V4',
    name: 'New Rule 2 name',
    status: 'no_hit',
    total: 0, // I don't know if this is a possible return from the backend but I'm adding it here to test the UI
    ruleId: 'rule-2',
  },
  {
    version: 'V1',
    name: 'Rule 2 name',
    status: 'hit',
    total: 15,
    ruleId: 'rule-2',
  },
  {
    version: 'V4',
    name: 'New Rule 2 name',
    status: 'hit',
    total: 50,
    ruleId: 'rule-2',
  },
  {
    version: 'V1',
    name: 'Rule 2 name',
    status: 'error',
    total: 15,
    ruleId: 'rule-2',
  },
  {
    version: 'V1',
    name: 'Rule 3 name',
    status: 'hit',
    total: 15,
    ruleId: 'rule-3',
  },
  {
    version: 'V4',
    name: 'Rule 3 name',
    status: 'hit',
    total: 15,
    ruleId: 'rule-3',
  },
];

export const makeGetTestRunRepository2 = () => {
  return (_: MarbleCoreApi): TestRunRepository => ({
    getTestRun: ({ testRunId }) => {
      const run = testruns.find((run) => run.id === testRunId);
      return run
        ? Promise.resolve(run)
        : Promise.reject(new Error('Test run not found'));
    },
    listTestRuns: () => Promise.resolve(testruns),
    listDecisions: () => Promise.resolve(testrunDecisions),
    listRuleExecutions: () => Promise.resolve(testrunRuleExecutions),
    launchTestRun: (args: TestRunCreateInput) => {
      const testRun: TestRun = {
        id: toUUID(short.generate()),
        refIterationId: '6f6fe0d8-9a1a-4d5a-bdd7-fa7fcda1b4e3',
        scenarioId: args.scenarioId,
        testIterationId: args.testIterationId,
        startDate: String(new Date().getTime()),
        endDate: args.endDate,
        creatorId: '96762987-8895-4af2-9c0a-2dffde09985c',
        status: (testruns.length === 0
          ? testRunStatuses[0]
          : testRunStatuses[
              randomInteger(1, testRunStatuses.length - 1)
            ]) as TestRunStatus,
      };

      testruns.push(testRun);

      return Promise.resolve(testRun);
    },
  });
};

export const makeGetTestRunRepository = () => {
  return (marbleCoreApiClient: MarbleCoreApi): TestRunRepository => ({
    getTestRun: async ({ testRunId }) => {
      const result = await marbleCoreApiClient.getTestRun(testRunId);
      console.log('TestRun', result.scenario_test_run);
      return adaptTestRun(result.scenario_test_run);
    },
    launchTestRun: async (args) => {
      const result = await marbleCoreApiClient.createTestRun(
        adaptTestRunCreateInputDto(args),
      );
      return adaptTestRun(result.scenario_test_run);
    },
    listTestRuns: async ({ scenarioId }) => {
      const result = await marbleCoreApiClient.listTestRuns(scenarioId);
      return result.scenario_test_runs.map(adaptTestRun);
    },
    listDecisions: async ({ testRunId }) => {
      const { decisions: result } =
        await marbleCoreApiClient.getDecisionData(testRunId);
      return result.map(adaptTestRunDecision);
    },
    listRuleExecutions: async ({ testRunId }) => {
      const { rules: result } =
        await marbleCoreApiClient.getRuleData(testRunId);
      return result.map(adaptTestRunRuleExecution);
    },
  });
};
