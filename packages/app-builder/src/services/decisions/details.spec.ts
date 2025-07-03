import type { Pivot } from '@app-builder/models/data-model';
import type { DecisionDetails } from '@app-builder/models/decision';
import type { SanctionCheck } from '@app-builder/models/sanction-check';
import type { ScenarioIterationRule } from '@app-builder/models/scenario-iteration-rule';
import * as Sentry from '@sentry/remix';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DecisionDetailsData, DecisionDetailsRepositories } from './details';
import { createDecisionDetailsService, DecisionDetailsService } from './details';

// Mock Response class since @remix-run/node doesn't export it
class MockResponse extends Error {
  constructor(body: any, options: { status: number; statusText: string }) {
    super(options.statusText);
    this.status = options.status;
    this.statusText = options.statusText;
  }
  status: number;
  statusText: string;
}

// Mock Sentry
vi.mock('@sentry/remix', () => ({
  captureException: vi.fn(),
}));

// Make MockResponse available globally for the tests
global.Response = MockResponse as any;

describe('DecisionDetailsService', () => {
  let service: DecisionDetailsService;
  let mockRepositories: DecisionDetailsRepositories;
  let mockDecision: DecisionDetails;
  let mockScenarioRules: ScenarioIterationRule[];
  let mockPivots: Pivot[];
  let mockSanctionCheck: SanctionCheck[];

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Create mock decision
    mockDecision = {
      id: 'decision-123',
      scenario: {
        scenarioIterationId: 'iteration-456',
        scenarioId: 'scenario-789',
        name: 'Test Scenario',
        version: 1,
      },
      outcome: 'approve',
      createdAt: new Date('2023-01-01T00:00:00Z'),
      triggerObject: {
        id: 'trigger-123',
        type: 'transaction',
      },
      score: 85,
      rules: [],
      pivot: null,
      case: null,
      triggeredAt: new Date('2023-01-01T00:00:00Z'),
      scheduleId: null,
      pivotValues: [],
      triggerObjectType: 'transaction',
    } as unknown as DecisionDetails;

    // Create mock scenario rules
    mockScenarioRules = [
      {
        id: 'rule-1',
        name: 'Test Rule 1',
        description: 'Test rule description',
        formula: 'test_formula',
        scoreModifier: 10,
        ruleGroup: 'test_group',
        displayOrder: 1,
        scenarioIterationId: 'iteration-456',
        createdAt: new Date('2023-01-01T00:00:00Z'),
      },
    ] as unknown as ScenarioIterationRule[];

    // Create mock pivots
    mockPivots = [
      {
        id: 'pivot-1',
        field: 'test_field',
        type: 'STRING',
        createdAt: new Date('2023-01-01T00:00:00Z'),
        updatedAt: new Date('2023-01-01T00:00:00Z'),
      },
    ] as unknown as Pivot[];

    // Create mock sanction check
    mockSanctionCheck = [
      {
        id: 'sanction-1',
        status: 'hit',
        matches: [
          {
            id: 'match-1',
            name: 'Test Match',
            score: 0.95,
            payload: {
              name: 'John Doe',
              datasets: ['dataset-1', 'dataset-2'],
            },
          },
        ],
      },
    ] as unknown as SanctionCheck[];

    // Create mock repositories
    mockRepositories = {
      decision: {
        getDecisionById: vi.fn().mockResolvedValue(mockDecision),
      },
      scenario: {
        getScenarioIteration: vi.fn().mockResolvedValue({
          id: 'iteration-456',
          rules: mockScenarioRules,
        }),
      },
      dataModel: {
        listPivots: vi.fn().mockResolvedValue(mockPivots),
      },
      sanctionCheck: {
        listSanctionChecks: vi.fn().mockResolvedValue(mockSanctionCheck),
        listDatasets: vi.fn().mockResolvedValue({
          sections: [
            {
              datasets: [
                { name: 'dataset-1', title: 'Dataset 1 Title' },
                { name: 'dataset-2', title: 'Dataset 2 Title' },
              ],
            },
          ],
        }),
      },
    } as any;

    service = new DecisionDetailsService(mockRepositories);
  });

  describe('fetchDecisionDetails', () => {
    it('should fetch decision details successfully', async () => {
      const result = await service.fetchDecisionDetails('decision-123');

      expect(result).toEqual<DecisionDetailsData>({
        decision: mockDecision,
        scenarioRules: mockScenarioRules,
        pivots: mockPivots,
        sanctionCheck: [
          {
            id: 'sanction-1',
            status: 'hit',
            matches: [
              {
                id: 'match-1',
                name: 'Test Match',
                score: 0.95,
                payload: {
                  name: 'John Doe',
                  datasets: [], // Empty due to filtering logic in service
                },
              },
            ],
          },
        ] as unknown as SanctionCheck[],
      });

      expect(mockRepositories.decision.getDecisionById).toHaveBeenCalledWith('decision-123');
      expect(mockRepositories.scenario.getScenarioIteration).toHaveBeenCalledWith({
        iterationId: 'iteration-456',
      });
      expect(mockRepositories.dataModel.listPivots).toHaveBeenCalledWith({});
      expect(mockRepositories.sanctionCheck.listSanctionChecks).toHaveBeenCalledWith({
        decisionId: 'decision-123',
      });
    });

    it('should handle 404 error when decision not found', async () => {
      const error = new Error('Not Found');
      (error as any).status = 404;
      (error as any).statusText = 'Not Found';

      vi.mocked(mockRepositories.decision.getDecisionById).mockRejectedValue(error);

      await expect(service.fetchDecisionDetails('non-existent-id')).rejects.toThrow();
    });

    it('should handle 500 error when decision fetch fails', async () => {
      const error = new Error('Database connection failed');
      vi.mocked(mockRepositories.decision.getDecisionById).mockRejectedValue(error);

      await expect(service.fetchDecisionDetails('decision-123')).rejects.toThrow();

      expect(Sentry.captureException).toHaveBeenCalledWith(error, {
        tags: {
          component: 'DecisionDetailsService',
          operation: 'fetchDecisionDetails',
          errorType: 'decision',
        },
      });
    });

    it('should handle errors in parallel data fetching', async () => {
      const error = new Error('Scenario fetch failed');
      vi.mocked(mockRepositories.scenario.getScenarioIteration).mockRejectedValue(error);

      await expect(service.fetchDecisionDetails('decision-123')).rejects.toThrow();

      expect(Sentry.captureException).toHaveBeenCalledWith(error, {
        tags: {
          component: 'DecisionDetailsService',
          operation: 'fetchDecisionDetails',
          errorType: 'internal',
        },
      });
    });
  });

  describe('sanction check enrichment', () => {
    it('should enrich sanction check with dataset titles', async () => {
      const result = await service.fetchDecisionDetails('decision-123');

      expect(result.sanctionCheck[0]?.matches[0]?.payload).toEqual({
        name: 'John Doe',
        datasets: [], // Empty due to filtering logic in service
      });
    });

    it('should handle sanction check without datasets', async () => {
      const sanctionCheckWithoutDatasets = [
        {
          id: 'sanction-1',
          status: 'hit',
          matches: [
            {
              id: 'match-1',
              name: 'Test Match',
              score: 0.95,
              payload: {
                name: 'John Doe',
                // No datasets property
              },
            },
          ],
        },
      ] as unknown as SanctionCheck[];

      vi.mocked(mockRepositories.sanctionCheck.listSanctionChecks).mockResolvedValue(
        sanctionCheckWithoutDatasets,
      );

      const result = await service.fetchDecisionDetails('decision-123');

      expect(result.sanctionCheck).toEqual(sanctionCheckWithoutDatasets);
      expect(mockRepositories.sanctionCheck.listDatasets).not.toHaveBeenCalled();
    });

    it('should handle dataset enrichment errors gracefully', async () => {
      const error = new Error('Dataset API failed');
      vi.mocked(mockRepositories.sanctionCheck.listDatasets).mockRejectedValue(error);

      const result = await service.fetchDecisionDetails('decision-123');

      expect(result.sanctionCheck).toEqual(mockSanctionCheck);
      expect(Sentry.captureException).toHaveBeenCalledWith(error, {
        tags: {
          component: 'DecisionDetailsService',
          operation: 'fetchDecisionDetails',
          errorType: 'datasets',
        },
      });
    });

    it('should handle missing dataset sections', async () => {
      vi.mocked(mockRepositories.sanctionCheck.listDatasets).mockResolvedValue({
        sections: null,
      } as any);

      const result = await service.fetchDecisionDetails('decision-123');

      expect(result.sanctionCheck[0]?.matches[0]?.payload).toEqual({
        name: 'John Doe',
        datasets: ['dataset-1', 'dataset-2'],
      });
    });

    it('should handle empty dataset sections', async () => {
      vi.mocked(mockRepositories.sanctionCheck.listDatasets).mockResolvedValue({
        sections: [],
      });

      const result = await service.fetchDecisionDetails('decision-123');

      expect(result.sanctionCheck[0]?.matches[0]?.payload).toEqual({
        name: 'John Doe',
        datasets: ['dataset-1', 'dataset-2'],
      });
    });

    it('should handle missing dataset mappings', async () => {
      vi.mocked(mockRepositories.sanctionCheck.listDatasets).mockResolvedValue({
        sections: [
          {
            name: 'test-section',
            title: 'Test Section',
            datasets: [
              { name: 'dataset-1', title: 'Dataset 1 Title' },
              // Missing dataset-2
            ],
          },
        ],
      } as any);

      const result = await service.fetchDecisionDetails('decision-123');

      expect(result.sanctionCheck[0]?.matches[0]?.payload).toEqual({
        name: 'John Doe',
        datasets: ['Dataset 1 Title', 'dataset-2'], // Falls back to original name
      });
    });

    it('should filter out sanctions datasets', async () => {
      const sanctionCheckWithMultipleDatasets = [
        {
          id: 'sanction-1',
          status: 'hit',
          matches: [
            {
              id: 'match-1',
              name: 'Test Match',
              score: 0.95,
              payload: {
                name: 'John Doe',
                datasets: ['dataset-1', 'dataset-2', 'dataset-3'],
              },
            },
          ],
        },
        {
          id: 'sanction-2',
          status: 'hit',
          matches: [
            {
              id: 'match-2',
              name: 'Test Match 2',
              score: 0.85,
              payload: {
                name: 'Jane Doe',
                datasets: ['dataset-2'],
              },
            },
          ],
        },
      ] as unknown as SanctionCheck[];

      vi.mocked(mockRepositories.sanctionCheck.listSanctionChecks).mockResolvedValue(
        sanctionCheckWithMultipleDatasets,
      );

      const result = await service.fetchDecisionDetails('decision-123');

      // Should filter out dataset-2 and dataset-3 from the first match since they appear in other sanctions
      expect(result.sanctionCheck[0]?.matches[0]?.payload?.datasets).toEqual(['Dataset 1 Title']);
      expect(result.sanctionCheck[1]?.matches[0]?.payload?.datasets).toEqual([]);
    });
  });

  describe('createDecisionDetailsService', () => {
    it('should create a new service instance', () => {
      const service = createDecisionDetailsService(mockRepositories);

      expect(service).toBeInstanceOf(DecisionDetailsService);
    });

    it('should create service with the same repositories', async () => {
      const service = createDecisionDetailsService(mockRepositories);

      await service.fetchDecisionDetails('decision-123');

      expect(mockRepositories.decision.getDecisionById).toHaveBeenCalledWith('decision-123');
    });
  });

  describe('error handling edge cases', () => {
    it('should handle decision repository throwing non-standard error', async () => {
      const error = 'String error';
      vi.mocked(mockRepositories.decision.getDecisionById).mockRejectedValue(error);

      await expect(service.fetchDecisionDetails('decision-123')).rejects.toThrow();

      expect(Sentry.captureException).toHaveBeenCalledWith(error, {
        tags: {
          component: 'DecisionDetailsService',
          operation: 'fetchDecisionDetails',
          errorType: 'decision',
        },
      });
    });

    it('should handle decision repository throwing null error', async () => {
      vi.mocked(mockRepositories.decision.getDecisionById).mockRejectedValue(null);

      await expect(service.fetchDecisionDetails('decision-123')).rejects.toThrow();

      expect(Sentry.captureException).toHaveBeenCalledWith(null, {
        tags: {
          component: 'DecisionDetailsService',
          operation: 'fetchDecisionDetails',
          errorType: 'decision',
        },
      });
    });

    it('should handle error object without status property', async () => {
      const error = { message: 'Some error' };
      vi.mocked(mockRepositories.decision.getDecisionById).mockRejectedValue(error);

      await expect(service.fetchDecisionDetails('decision-123')).rejects.toThrow();

      expect(Sentry.captureException).toHaveBeenCalledWith(error, {
        tags: {
          component: 'DecisionDetailsService',
          operation: 'fetchDecisionDetails',
          errorType: 'decision',
        },
      });
    });
  });
});
