import { MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import {
  TestRunStatus,
  testRunStatuses,
  type TestRun,
  type TestRunCreateInput,
} from '@app-builder/models/testrun';
import { toUUID } from '@app-builder/utils/short-uuid';
import { addDays } from 'date-fns';
import { randomInteger } from 'remeda';
import short from 'short-uuid';

export interface TestRunRepository {
  getTestRun(args: { testRunId: string }): Promise<TestRun>;
  launchTestRun(args: TestRunCreateInput): Promise<TestRun>;
  listTestRuns(args: { scenarioId: string }): Promise<TestRun[]>;
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
//       const runs = await marbleCoreApiClient.listTestRuns(scenarioId);
//       return runs.map(adaptTestRun);
//     },
//   });
// };
