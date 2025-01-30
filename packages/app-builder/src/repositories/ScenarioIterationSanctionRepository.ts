import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import {
  type CreateScenarioIterationSanctionInput,
  type ScenarioIterationSanction,
  type UpdateScenarioIterationSanctionInput,
} from '@app-builder/models/scenario-iteration-sanction';

export interface ScenarioIterationSanctionRepository {
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
    getSanction: async ({ sanctionId }) => {
      const sanction = sanctions.find((s) => s.id === sanctionId);
      return sanction
        ? Promise.resolve(sanction)
        : Promise.reject(new Error('Sanction not found'));
    },
    createSanction: async (args) => {
      const sanction = {
        id: args.scenarioIterationId,
        scenarioIterationId: args.scenarioIterationId,
        name: args.name,
        description: args.description,
        ruleGroup: args.ruleGroup,
        trigger: args.trigger,
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
      if (args.name !== undefined) {
        sanction.name = args.name;
      }
      if (args.description !== undefined) {
        sanction.description = args.description;
      }
      if (args.ruleGroup !== undefined) {
        sanction.ruleGroup = args.ruleGroup;
      }
      if (args.trigger !== undefined) {
        sanction.trigger = args.trigger;
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
