export const testRunStatuses = ['up', 'down', 'unknown', 'pending'] as const;
export type TestRunStatus = (typeof testRunStatuses)[number];

export interface TestRunCreateBody {
  scenarioId: string;
  refIterationId: string;
  phantomIterationId: string;
  endDate: string;
}

export interface TestRun {
  id: string;
  scenarioId: string;
  refIterationId: string;
  phantomIterationId: string;
  startDate: string;
  endDate: string;
  creatorId: string;
  status: TestRunStatus;
}
