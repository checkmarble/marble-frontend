import { MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import {
  TestRunStatus,
  testRunStatuses,
  type TestRun,
  type TestRunCreateInput,
} from '@app-builder/models/testrun';
import { toUUID } from '@app-builder/utils/short-uuid';
import { randomInteger } from 'remeda';
import short from 'short-uuid';

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
    listTestRuns: () => Promise.resolve(testruns),
    launchTestRun: (args: TestRunCreateInput) => {
      const testRun: TestRun = {
        id: toUUID(short.generate()),
        refIterationId: '6f6fe0d8-9a1a-4d5a-bdd7-fa7fcda1b4e3',
        scenarioId: args.scenarioId,
        testIterationId: args.testIterationId,
        startDate: String(new Date().getTime()),
        endDate: args.endDate,
        creatorId: '96762987-8895-4af2-9c0a-2dffde09985c',
        status:
          testruns.length === 0
            ? testRunStatuses[0]
            : (testRunStatuses[
                randomInteger(1, testRunStatuses.length - 1)
              ] as TestRunStatus),
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
