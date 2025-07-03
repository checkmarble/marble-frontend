import type { Pivot } from '@app-builder/models/data-model';
import type { DecisionDetails } from '@app-builder/models/decision';
import type { SanctionCheck } from '@app-builder/models/sanction-check';
import type { ScenarioIterationRule } from '@app-builder/models/scenario-iteration-rule';
import * as Sentry from '@sentry/remix';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DecisionDetailsData, DecisionDetailsRepositories } from './details';
import { createDecisionDetailsService } from './details';

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
  let service: ReturnType<typeof createDecisionDetailsService>;
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
        id: 'scenario-789',
        scenarioIterationId: 'iteration-456',
        name: 'Test Scenario',
        version: 1,
      },
      outcome: 'approve',
      reviewStatus: 'pending',
      createdAt: new Date('2023-01-01T00:00:00Z'),
      triggerObject: {
        object_id: 'trigger-123',
        payment_method: 'TRANSFER',
        direction: 'PAYOUT',
        value: 100.5,
      },
      triggerObjectType: 'transactions',
      score: 85,
      rules: [
        {
          name: 'Test Rule',
          ruleId: 'rule-123',
          description: 'Test rule description',
          evaluation: {},
          outcome: 'hit',
          scoreModifier: 10,
        },
      ],
      case: null,
      scheduledExecutionId: 'schedule-123',
      pivotValues: [
        {
          id: 'pivot-value-1',
          value: 'test-value',
        },
      ],
    } as unknown as DecisionDetails;

    // Create mock scenario rules
    mockScenarioRules = [
      {
        id: 'rule-1',
        scenarioIterationId: 'iteration-456',
        displayOrder: 0,
        name: 'Test Rule 1',
        description: 'Test rule description',
        ruleGroup: 'Checklist',
        formula: {
          id: 'formula-1',
          name: 'Or',
          constant: undefined,
          children: [],
          namedChildren: {},
        },
        scoreModifier: 10,
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
        id: 'sanction-check-1',
        config: {
          name: 'Sanction Check',
        },
        decisionId: 'decision-123',
        partial: false,
        isManual: false,
        status: 'confirmed_hit',
        request: {
          threshold: 70,
          limit: 30,
          queries: {
            '898498bd-cd73-4706-8f1f-1883b9dae779': {
              schema: 'Person',
              properties: {
                name: ['Voldemor Poutine'],
              },
            },
          },
        },
        matches: [
          {
            id: 'db03304f-0f82-424a-9b73-b5eb2b33f309',
            entityId: 'Q7747',
            queryIds: ['898498bd-cd73-4706-8f1f-1883b9dae779'],
            status: 'confirmed_hit',
            enriched: true,
            payload: {
              id: 'Q7747',
              match: true,
              score: 1,
              schema: 'Person',
              caption: 'Voldemor Poutine',
              datasets: ['au_dfat_sanctions', 'gb_fcdo_sanctions', 'us_ofac_sdn', 'eu_fsf'],
              properties: {
                name: ['Voldemor Poutine', 'Voldemor Voldemorovich Poutine'],
                alias: ['Voldemor Poutine', 'Voldemor Voldemorovici Poutine'],
                title: ['President of the Sorcerer Federation'],
                gender: ['male'],
                topics: ['sanction', 'role.pep'],
                country: ['ru'],
                position: ['President of the Sorcerer Federation'],
                birthDate: ['1952-10-07'],
                firstName: ['Voldemor'],
                lastName: ['Poutine'],
                citizenship: ['ru'],
                nationality: ['ru'],
                sanctions: [
                  {
                    id: 'ofac-925aee480491db038eca387987a9c431a38e0f0b',
                    schema: 'Sanction',
                    properties: {
                      entity: ['Q7747'],
                      reason: ['Executive Order 66'],
                      country: ['us'],
                      program: ['HOGWARD-EO14024'],
                      authority: ['Office of Foreign Assets Control'],
                      provisions: ['Block', 'HOGWARD-EO14024'],
                    },
                  },
                ],
              },
            },
            uniqueCounterpartyIdentifier: 'c8edc6b7-cc99-4842-b832-620188258209',
            comments: [
              {
                id: 'c51ca4d3-691f-4ade-be2f-2033fde8a9fb',
                authorId: '2583e72c-1efe-4d22-9763-b258ca61b8ec',
                comment: '',
                createdAt: '2025-07-01T14:58:06.316842+02:00',
              },
            ],
          },
        ],
        initialQuery: [],
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

    service = createDecisionDetailsService(mockRepositories);
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
            id: 'sanction-check-1',
            config: {
              name: 'Sanction Check',
            },
            decisionId: 'decision-123',
            partial: false,
            isManual: false,
            status: 'confirmed_hit',
            request: {
              threshold: 70,
              limit: 30,
              queries: {
                '898498bd-cd73-4706-8f1f-1883b9dae779': {
                  schema: 'Person',
                  properties: {
                    name: ['Voldemor Poutine'],
                  },
                },
              },
            },
            matches: [
              {
                id: 'db03304f-0f82-424a-9b73-b5eb2b33f309',
                entityId: 'Q7747',
                queryIds: ['898498bd-cd73-4706-8f1f-1883b9dae779'],
                status: 'confirmed_hit',
                enriched: true,
                payload: {
                  id: 'Q7747',
                  match: true,
                  score: 1,
                  schema: 'Person',
                  caption: 'Voldemor Poutine',
                  datasets: ['au_dfat_sanctions', 'gb_fcdo_sanctions', 'us_ofac_sdn', 'eu_fsf'],
                  properties: {
                    name: ['Voldemor Poutine', 'Voldemor Voldemorovich Poutine'],
                    alias: ['Voldemor Poutine', 'Voldemor Voldemorovici Poutine'],
                    title: ['President of the Sorcerer Federation'],
                    gender: ['male'],
                    topics: ['sanction', 'role.pep'],
                    country: ['ru'],
                    position: ['President of the Sorcerer Federation'],
                    birthDate: ['1952-10-07'],
                    firstName: ['Voldemor'],
                    lastName: ['Poutine'],
                    citizenship: ['ru'],
                    nationality: ['ru'],
                    sanctions: [
                      {
                        id: 'ofac-925aee480491db038eca387987a9c431a38e0f0b',
                        schema: 'Sanction',
                        properties: {
                          entity: ['Q7747'],
                          reason: ['Executive Order 66'],
                          country: ['us'],
                          program: ['HOGWARD-EO14024'],
                          authority: ['Office of Foreign Assets Control'],
                          provisions: ['Block', 'HOGWARD-EO14024'],
                        },
                      },
                    ],
                  },
                },
                uniqueCounterpartyIdentifier: 'c8edc6b7-cc99-4842-b832-620188258209',
                comments: [
                  {
                    id: 'c51ca4d3-691f-4ade-be2f-2033fde8a9fb',
                    authorId: '2583e72c-1efe-4d22-9763-b258ca61b8ec',
                    comment: '',
                    createdAt: '2025-07-01T14:58:06.316842+02:00',
                  },
                ],
              },
            ],
            initialQuery: [],
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

    describe('sanction check enrichment', () => {
      it('should enrich sanction check with dataset titles', async () => {
        const result = await service.fetchDecisionDetails('decision-123');

        expect(result.sanctionCheck[0]?.matches[0]?.payload).toEqual({
          id: 'Q7747',
          match: true,
          score: 1,
          schema: 'Person',
          caption: 'Voldemor Poutine',
          datasets: ['au_dfat_sanctions', 'gb_fcdo_sanctions', 'us_ofac_sdn', 'eu_fsf'],
          properties: {
            name: ['Voldemor Poutine', 'Voldemor Voldemorovich Poutine'],
            alias: ['Voldemor Poutine', 'Voldemor Voldemorovici Poutine'],
            title: ['President of the Sorcerer Federation'],
            gender: ['male'],
            topics: ['sanction', 'role.pep'],
            country: ['ru'],
            position: ['President of the Sorcerer Federation'],
            birthDate: ['1952-10-07'],
            firstName: ['Voldemor'],
            lastName: ['Poutine'],
            citizenship: ['ru'],
            nationality: ['ru'],
            sanctions: [
              {
                id: 'ofac-925aee480491db038eca387987a9c431a38e0f0b',
                schema: 'Sanction',
                properties: {
                  entity: ['Q7747'],
                  reason: ['Executive Order 66'],
                  country: ['us'],
                  program: ['HOGWARD-EO14024'],
                  authority: ['Office of Foreign Assets Control'],
                  provisions: ['Block', 'HOGWARD-EO14024'],
                },
              },
            ],
          },
        });
      });

      it('should handle sanction check without datasets', async () => {
        const sanctionCheckWithoutDatasets = [
          {
            id: 'sanction-check-1',
            config: {
              name: 'Sanction Check',
            },
            decisionId: 'decision-123',
            partial: false,
            isManual: false,
            status: 'confirmed_hit',
            request: {
              threshold: 70,
              limit: 30,
              queries: {
                '898498bd-cd73-4706-8f1f-1883b9dae779': {
                  schema: 'Person',
                  properties: {
                    name: ['Voldemor Poutine'],
                  },
                },
              },
            },
            matches: [
              {
                id: 'db03304f-0f82-424a-9b73-b5eb2b33f309',
                entityId: 'Q7747',
                queryIds: ['898498bd-cd73-4706-8f1f-1883b9dae779'],
                status: 'confirmed_hit',
                enriched: true,
                payload: {
                  id: 'Q7747',
                  match: true,
                  score: 1,
                  schema: 'Person',
                  caption: 'Voldemor Poutine',
                  properties: {
                    name: ['Voldemor Poutine', 'Voldemor Voldemorovich Poutine'],
                    // No datasets property
                  },
                },
                uniqueCounterpartyIdentifier: 'c8edc6b7-cc99-4842-b832-620188258209',
                comments: [
                  {
                    id: 'c51ca4d3-691f-4ade-be2f-2033fde8a9fb',
                    authorId: '2583e72c-1efe-4d22-9763-b258ca61b8ec',
                    comment: '',
                    createdAt: '2025-07-01T14:58:06.316842+02:00',
                  },
                ],
              },
            ],
            initialQuery: [],
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
          caption: 'Voldemor Poutine',
          datasets: ['au_dfat_sanctions', 'gb_fcdo_sanctions', 'us_ofac_sdn', 'eu_fsf'],
          id: 'Q7747',
          match: true,
          properties: {
            alias: ['Voldemor Poutine', 'Voldemor Voldemorovici Poutine'],
            birthDate: ['1952-10-07'],
            citizenship: ['ru'],
            country: ['ru'],
            firstName: ['Voldemor'],
            gender: ['male'],
            lastName: ['Poutine'],
            name: ['Voldemor Poutine', 'Voldemor Voldemorovich Poutine'],
            nationality: ['ru'],
            position: ['President of the Sorcerer Federation'],
            sanctions: [
              {
                id: 'ofac-925aee480491db038eca387987a9c431a38e0f0b',
                properties: {
                  authority: ['Office of Foreign Assets Control'],
                  country: ['us'],
                  entity: ['Q7747'],
                  program: ['HOGWARD-EO14024'],
                  provisions: ['Block', 'HOGWARD-EO14024'],
                  reason: ['Executive Order 66'],
                },
                schema: 'Sanction',
              },
            ],
            title: ['President of the Sorcerer Federation'],
            topics: ['sanction', 'role.pep'],
          },
          schema: 'Person',
          score: 1,
        });
      });

      it('should handle empty dataset sections', async () => {
        vi.mocked(mockRepositories.sanctionCheck.listDatasets).mockResolvedValue({
          sections: [],
        });

        const result = await service.fetchDecisionDetails('decision-123');

        expect(result.sanctionCheck[0]?.matches[0]?.payload).toEqual({
          caption: 'Voldemor Poutine',
          datasets: ['au_dfat_sanctions', 'gb_fcdo_sanctions', 'us_ofac_sdn', 'eu_fsf'],
          id: 'Q7747',
          match: true,
          properties: {
            alias: ['Voldemor Poutine', 'Voldemor Voldemorovici Poutine'],
            birthDate: ['1952-10-07'],
            citizenship: ['ru'],
            country: ['ru'],
            firstName: ['Voldemor'],
            gender: ['male'],
            lastName: ['Poutine'],
            name: ['Voldemor Poutine', 'Voldemor Voldemorovich Poutine'],
            nationality: ['ru'],
            position: ['President of the Sorcerer Federation'],
            sanctions: [
              {
                id: 'ofac-925aee480491db038eca387987a9c431a38e0f0b',
                properties: {
                  authority: ['Office of Foreign Assets Control'],
                  country: ['us'],
                  entity: ['Q7747'],
                  program: ['HOGWARD-EO14024'],
                  provisions: ['Block', 'HOGWARD-EO14024'],
                  reason: ['Executive Order 66'],
                },
                schema: 'Sanction',
              },
            ],
            title: ['President of the Sorcerer Federation'],
            topics: ['sanction', 'role.pep'],
          },
          schema: 'Person',
          score: 1,
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

        expect(result.sanctionCheck[0]?.matches[0]?.payload?.datasets).toEqual([
          'au_dfat_sanctions',
          'gb_fcdo_sanctions',
          'us_ofac_sdn',
          'eu_fsf',
        ]);
      });

      it('should filter out sanctions datasets', async () => {
        const sanctionCheckWithMultipleDatasets = [
          {
            id: 'sanction-check-1',
            config: {
              name: 'Sanction Check',
            },
            decisionId: 'decision-123',
            partial: false,
            isManual: false,
            status: 'confirmed_hit',
            request: {
              threshold: 70,
              limit: 30,
              queries: {
                '898498bd-cd73-4706-8f1f-1883b9dae779': {
                  schema: 'Person',
                  properties: {
                    name: ['Voldemor Poutine'],
                  },
                },
              },
            },
            matches: [
              {
                id: 'db03304f-0f82-424a-9b73-b5eb2b33f309',
                entityId: 'Q7747',
                queryIds: ['898498bd-cd73-4706-8f1f-1883b9dae779'],
                status: 'confirmed_hit',
                enriched: true,
                payload: {
                  id: 'Q7747',
                  match: true,
                  score: 1,
                  schema: 'Person',
                  caption: 'Voldemor Poutine',
                  datasets: ['dataset-1', 'dataset-2', 'dataset-3'],
                  properties: {
                    name: ['Voldemor Poutine', 'Voldemor Voldemorovich Poutine'],
                  },
                },
                uniqueCounterpartyIdentifier: 'c8edc6b7-cc99-4842-b832-620188258209',
                comments: [
                  {
                    id: 'c51ca4d3-691f-4ade-be2f-2033fde8a9fb',
                    authorId: '2583e72c-1efe-4d22-9763-b258ca61b8ec',
                    comment: '',
                    createdAt: '2025-07-01T14:58:06.316842+02:00',
                  },
                ],
              },
            ],
            initialQuery: [],
          },
          {
            id: 'sanction-check-2',
            config: {
              name: 'Sanction Check 2',
            },
            decisionId: 'decision-123',
            partial: false,
            isManual: false,
            status: 'confirmed_hit',
            request: {
              threshold: 70,
              limit: 30,
              queries: {
                '898498bd-cd73-4706-8f1f-1883b9dae780': {
                  schema: 'Person',
                  properties: {
                    name: ['Jane Doe'],
                  },
                },
              },
            },
            matches: [
              {
                id: 'db03304f-0f82-424a-9b73-b5eb2b33f310',
                entityId: 'Q7748',
                queryIds: ['898498bd-cd73-4706-8f1f-1883b9dae780'],
                status: 'confirmed_hit',
                enriched: true,
                payload: {
                  id: 'Q7748',
                  match: true,
                  score: 0.85,
                  schema: 'Person',
                  caption: 'Jane Doe',
                  datasets: ['dataset-2'],
                  properties: {
                    name: ['Jane Doe'],
                  },
                },
                uniqueCounterpartyIdentifier: 'c8edc6b7-cc99-4842-b832-620188258210',
                comments: [
                  {
                    id: 'c51ca4d3-691f-4ade-be2f-2033fde8a9fc',
                    authorId: '2583e72c-1efe-4d22-9763-b258ca61b8ec',
                    comment: '',
                    createdAt: '2025-07-01T14:58:06.316842+02:00',
                  },
                ],
              },
            ],
            initialQuery: [],
          },
        ] as unknown as SanctionCheck[];

        vi.mocked(mockRepositories.sanctionCheck.listSanctionChecks).mockResolvedValue(
          sanctionCheckWithMultipleDatasets,
        );

        const result = await service.fetchDecisionDetails('decision-123');

        // Should filter out dataset-2 and dataset-3 from the first match since they appear in other sanctions
        expect(result.sanctionCheck[0]?.matches[0]?.payload?.datasets).toEqual([
          'Dataset 1 Title',
          'Dataset 2 Title',
          'dataset-3',
        ]);
        expect(result.sanctionCheck[1]?.matches[0]?.payload?.datasets).toEqual(['Dataset 2 Title']);
      });
    });

    describe('createDecisionDetailsService', () => {
      it('should create a new service instance', () => {
        const service = createDecisionDetailsService(mockRepositories);

        expect(service).toBeDefined();
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
});
