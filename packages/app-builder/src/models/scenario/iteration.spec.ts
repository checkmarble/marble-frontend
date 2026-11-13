import { describe, expect, it } from 'vitest';

import { groupVersionsByScenario, type ScenarioIterationSummary } from './iteration';

function iteration(scenarioId: string, version: number | null): ScenarioIterationSummary {
  return {
    id: `${scenarioId}-${version}`,
    scenarioId,
    version,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    archived: false,
  };
}

describe('groupVersionsByScenario', () => {
  it('keeps the versions of each scenario apart', () => {
    const result = groupVersionsByScenario(
      ['a', 'b'],
      [iteration('a', 1), iteration('b', 3), iteration('a', 2), iteration('b', null)],
    );

    expect(result).toEqual({ a: { versions: [1, 2] }, b: { versions: [3, null] } });
  });

  it('gives a scenario without iterations an empty list', () => {
    expect(groupVersionsByScenario(['a'], [])).toEqual({ a: { versions: [] } });
  });

  it('leaves out iterations of scenarios that are not listed', () => {
    expect(groupVersionsByScenario(['a'], [iteration('a', 1), iteration('archived', 7)])).toEqual({
      a: { versions: [1] },
    });
  });
});
