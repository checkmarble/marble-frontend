import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import {
  adaptTestRun,
  adaptTestRunCreateInputDto,
  type TestRun,
  type TestRunCreateInput,
} from '@app-builder/models/testrun';

export async function launchTestRun(api: MarbleCoreApi, args: TestRunCreateInput): Promise<TestRun> {
  const { scenario_test_run } = await api.createTestRun(adaptTestRunCreateInputDto(args));
  return adaptTestRun(scenario_test_run);
}

export async function listTestRuns(api: MarbleCoreApi, { scenarioId }: { scenarioId: string }): Promise<TestRun[]> {
  const result = await api.listTestRuns(scenarioId);
  return result.scenario_test_runs.map(adaptTestRun);
}
