import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import { knownOutcomes } from '@app-builder/models/outcome';
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
import { sleep } from 'radash';
import { randomInteger } from 'remeda';
import short from 'short-uuid';

export interface TestRunRepository {
  getTestRun(args: { testRunId: string }): Promise<TestRun>;
  cancelTestRun(args: { testRunId: string }): Promise<void>;
  launchTestRun(args: TestRunCreateInput): Promise<TestRun>;
  listTestRuns(args: { scenarioId: string }): Promise<TestRun[]>;
  listDecisions(args: { testRunId: string }): Promise<TestRunDecision[]>;
  listRuleExecutions(args: { testRunId: string }): Promise<TestRunRuleExecutionCount[]>;
}

const testruns: TestRun[] = [
  {
    id: '84386e82-2da2-493a-a08f-0e6456756193',
    refIterationId: '84386e82-45cf-4fdf-9112-9fab1a55e8be',
    scenarioId: '84386e82-a26f-4317-b1e3-373efdf6f6b1',
    testIterationId: '84386e82-4d57-4aea-9c62-d60d496319a6',
    startDate: new Date().toISOString(),
    endDate: addDays(new Date(), 1).toISOString(),
    creatorId: '34c74c92-4570-4623-9ea8-fa9374d11e4b',
    status: 'up',
  },
];

const testrunDecisions: TestRunDecision[] = [...(Array(200000) as number[])].map(() => ({
  version: Math.random() > 0.5 ? '1' : '4',
  outcome: knownOutcomes[randomInteger(0, testRunStatuses.length - 1)]!,
  count: randomInteger(1, 100),
}));

const testrunRuleExecutions: TestRunRuleExecutionCount[] = [
  {
    version: '1',
    name: 'Rule 1 name',
    status: 'hit',
    total: 10,
    ruleId: 'rule-1',
  },
  {
    version: '4',
    name: 'Rule 1 name',
    status: 'hit',
    total: 15,
    ruleId: 'rule-1',
  },
  {
    version: '1',
    name: 'Rule 1 name',
    status: 'no_hit',
    total: 20,
    ruleId: 'rule-1',
  },
  {
    version: '4',
    name: 'Rule 1 name',
    status: 'no_hit',
    total: 15,
    ruleId: 'rule-1',
  },
  {
    version: '1',
    name: 'Rule 1 name',
    status: 'error',
    total: 5,
    ruleId: 'rule-1',
  },
  {
    version: '4',
    name: 'Rule 1 name',
    status: 'snoozed',
    total: 5,
    ruleId: 'rule-1',
  },
  {
    version: '1',
    name: 'Rule 2 name',
    status: 'no_hit',
    total: 5,
    ruleId: 'rule-2',
  },
  {
    version: '4',
    name: 'New Rule 2 name',
    status: 'no_hit',
    total: 0, // I don't know if this is a possible return from the backend but I'm adding it here to test the UI
    ruleId: 'rule-2',
  },
  {
    version: '1',
    name: 'Rule 2 name',
    status: 'hit',
    total: 15,
    ruleId: 'rule-2',
  },
  {
    version: '4',
    name: 'New Rule 2 name',
    status: 'hit',
    total: 50,
    ruleId: 'rule-2',
  },
  {
    version: '1',
    name: 'Rule 2 name',
    status: 'error',
    total: 15,
    ruleId: 'rule-2',
  },
  {
    version: '1',
    name: 'Rule 3 name',
    status: 'hit',
    total: 15,
    ruleId: 'rule-3',
  },
  {
    version: '4',
    name: 'Rule 3 name',
    status: 'no_hit',
    total: 15,
    ruleId: null,
  },
  {
    version: '1',
    name: 'Rule 4 name',
    status: 'hit',
    total: 15,
    ruleId: 'rule-4',
  },
  {
    version: '4',
    name: 'Rule 4 name',
    status: 'hit',
    total: 15,
    ruleId: 'rule-4',
  },
];

export const makeGetTestRunRepository2 = () => {
  return (_: MarbleCoreApi): TestRunRepository => ({
    getTestRun: ({ testRunId }) => {
      const run = testruns.find((run) => run.id === testRunId);
      return run ? Promise.resolve(run) : Promise.reject(new Error('Test run not found'));
    },
    cancelTestRun: ({ testRunId }) => {
      const run = testruns.find((run) => run.id === testRunId);
      if (!run) {
        return Promise.reject(new Error('Test run not found'));
      }

      run.status = 'down';

      return Promise.resolve();
    },
    listTestRuns: () => Promise.resolve(testruns),
    listDecisions: async () => {
      await sleep(1500);
      return testrunDecisions;
    },
    listRuleExecutions: async () => {
      await sleep(4000);
      //throw new Error('Some Timeout');
      return testrunRuleExecutions;
    },
    launchTestRun: (args: TestRunCreateInput) => {
      const testRun: TestRun = {
        id: toUUID(short.generate()),
        refIterationId: '6f6fe0d8-9a1a-4d5a-bdd7-fa7fcda1b4e3',
        scenarioId: args.scenarioId,
        testIterationId: args.testIterationId,
        startDate: new Date().toISOString(),
        endDate: args.endDate,
        creatorId: '96762987-8895-4af2-9c0a-2dffde09985c',
        status: (!testruns.some((r) => r.status === 'up')
          ? testRunStatuses[0]
          : testRunStatuses[randomInteger(1, testRunStatuses.length - 1)]) as TestRunStatus,
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
      return adaptTestRun(result.scenario_test_run);
    },
    cancelTestRun: async ({ testRunId }) => {
      await marbleCoreApiClient.cancelTestRun(testRunId);
      return;
    },
    launchTestRun: async (args) => {
      const { scenario_test_run } = await marbleCoreApiClient.createTestRun(
        adaptTestRunCreateInputDto(args),
      );
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
