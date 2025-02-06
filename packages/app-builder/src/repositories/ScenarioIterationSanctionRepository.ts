import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import {
  type CreateScenarioIterationSanctionInput,
  type ScenarioIterationSanction,
  type UpdateScenarioIterationSanctionInput,
} from '@app-builder/models/scenario-iteration-sanction';
import shortUuid from 'short-uuid';

export interface ScenarioIterationSanctionRepository {
  listSanctions(args: {
    scenarioIterationId: string;
  }): Promise<ScenarioIterationSanction[]>;
  getSanction(args: { sanctionId: string }): Promise<ScenarioIterationSanction>;
  createSanction(
    args: CreateScenarioIterationSanctionInput,
  ): Promise<ScenarioIterationSanction>;
  updateSanction(
    args: UpdateScenarioIterationSanctionInput,
  ): Promise<ScenarioIterationSanction>;
  deleteSanction(args: { sanctionId: string }): Promise<void>;
}

export function makeGetScenarioIterationSanctionRepository() {
  const sanctions: ScenarioIterationSanction[] = [];

  return (_: MarbleCoreApi): ScenarioIterationSanctionRepository => ({
    listSanctions: async ({ scenarioIterationId }) => {
      return Promise.resolve(
        sanctions.filter((s) => s.scenarioIterationId === scenarioIterationId),
      );
    },
    getSanction: async ({ sanctionId }) => {
      const sanction = sanctions.find((s) => s.id === sanctionId);
      return sanction
        ? Promise.resolve(sanction)
        : Promise.reject(new Error('Sanction not found'));
    },
    createSanction: async (args) => {
      const sanction: ScenarioIterationSanction = {
        id: shortUuid.uuid(),
        scenarioIterationId: args.scenarioIterationId,
        displayOrder: args.displayOrder,
        name: args.name,
        description: args.description,
        ruleGroup: args.ruleGroup,
        formula: args.formula,
        counterPartyName: args.counterPartyName,
        transactionLabel: args.transationLabel,
        createdAt: new Date().toISOString(),
      };
      sanctions.push(sanction);
      return Promise.resolve(sanction);
    },
    updateSanction: async (args) => {
      const sanction = sanctions.find((s) => s.id === args.sanctionId);
      if (!sanction) {
        return Promise.reject(new Error('Sanction not found'));
      }
      if (args.displayOrder !== undefined) {
        sanction.displayOrder = args.displayOrder;
      }
      if (args.name !== undefined) {
        sanction.name = args.name;
      }
      if (args.description !== undefined) {
        sanction.description = args.description;
      }
      if (args.ruleGroup !== undefined) {
        sanction.ruleGroup = args.ruleGroup;
      }
      if (args.formula !== undefined) {
        sanction.formula = args.formula;
      }
      if (args.counterPartyName !== undefined) {
        sanction.counterPartyName = args.counterPartyName;
      }
      if (args.transactionLabel !== undefined) {
        sanction.transactionLabel = args.transactionLabel;
      }
      return Promise.resolve(sanction);
    },
    deleteSanction: async ({ sanctionId }) => {
      const sanction = sanctions.find((s) => s.id === sanctionId);
      if (!sanction) {
        return Promise.reject(new Error('Sanction not found'));
      }
      sanctions.splice(sanctions.indexOf(sanction), 1);
      return Promise.resolve();
    },
  });
}
