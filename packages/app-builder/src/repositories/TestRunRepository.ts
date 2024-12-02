import { MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import {
  TestRunStatus,
  testRunStatuses,
  type TestRun,
  type TestRunCreateInput,
} from '@app-builder/models/testrun';
import { randomInteger } from 'remeda';

export interface TestRunRepository {
  getTestRun(args: { testRunId: string }): Promise<TestRun>;
  launchTestRun(args: TestRunCreateInput): Promise<TestRun>;
  listTestRuns(args: { scenarioId: string }): Promise<TestRun[]>;
}

const testruns: TestRun[] = [];

export const makeGetTestRunRepository = () => {
  return (_: MarbleCoreApi): TestRunRepository => ({
    getTestRun: ({ testRunId }) => {
      const run = testruns.find((run) => run.id === testRunId);
      return run
        ? Promise.resolve(run)
        : Promise.reject(new Error('Test run not found'));
    },
    listTestRuns: () => {
      return Promise.resolve(testruns);
    },
    launchTestRun: (args: TestRunCreateInput) => {
      const lastRun = testruns[testruns.length - 1];

      const testRun: TestRun = {
        id: lastRun ? String(+lastRun.id + 1) : '1',
        refIterationId: '6f6fe0d8-9a1a-4d5a-bdd7-fa7fcda1b4e3',
        scenarioId: args.scenarioId,
        testIterationId: args.testIterationId,
        startDate: String(new Date().getTime()),
        endDate: args.endDate,
        creatorId: '1',
        status: testRunStatuses[
          randomInteger(0, testRunStatuses.length - 1)
        ] as TestRunStatus,
      };

      testruns.push(testRun);

      return Promise.resolve(testRun);
    },
  });
};

// export const makeGetTestRunRepository = () => {
//   return (marbleCoreApiClient: MarbleCoreApi): TestRunRepository => ({
//     getTestRun: async ({ testRunId }) => {
//       const result = await marbleCoreApiClient.getTestRun(testRunId);
//       return adaptTestRun(result);
//     },
//     launchTestRun: async (args) => {
//       const result = await marbleCoreApiClient.createTestRun(
//         adaptTestRunCreateInputDto(args),
//       );
//       return adaptTestRun(result);
//     },
//     listTestRuns: async ({ scenarioId }) => {
//       console.log('ScenarioId', scenarioId);

//       const runs = await marbleCoreApiClient.listTestRuns(scenarioId);

//       //TODO: Implement pagination & sorting

//       return {
//         items: runs.map(adaptTestRun),
//         totalCount: {
//           value: runs.length,
//           isMaxCount: false,
//         },
//         startIndex: 0,
//         endIndex: runs.length - 1,
//       };
//     },
//   });
// };
