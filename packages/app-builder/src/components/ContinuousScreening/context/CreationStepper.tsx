import { CreateContinuousScreeningConfig, CreateMappingConfig } from '@app-builder/models/continuous-screening';
import { buildStepper } from '@app-builder/utils/build-stepper';
import { FtmEntity } from 'marble-api';
import { z } from 'zod/v4';

export type PartialCreateContinuousScreeningConfig = Omit<
  CreateContinuousScreeningConfig,
  'inboxId' | 'inboxName' | 'mappingConfigs'
> & {
  inboxId: string | null;
  inboxName: string | null;
  mappingConfigs: (Omit<CreateMappingConfig, 'ftmEntity'> & { ftmEntity: FtmEntity | null })[];
};

const objectMappingStepSchema = z
  .object({
    mappingConfigs: z.array(
      z.object({
        objectType: z.string(),
        ftmEntity: z.enum(['Person', 'Company', 'Vessel']),
        fieldMapping: z.record(z.string(), z.string().nullable()),
      }),
    ),
  })
  .refine(
    (data) =>
      data.mappingConfigs.length > 0 &&
      data.mappingConfigs.some((m) => Object.values(m.fieldMapping).filter((v) => !!v).length > 0),
    {
      message: 'At least one mapping config must be provided',
      path: ['mappingConfigs'],
    },
  );
const scoringConfigurationStepSchema = z
  .object({
    matchThreshold: z.number(),
    matchLimit: z.number(),
    inboxId: z.string().nullable(),
    inboxName: z.string().nullable(),
  })
  .refine((data) => data.inboxId !== null || data.inboxName !== null, {
    message: 'Either inboxId or inboxName must be provided',
    path: ['inboxId', 'inboxName'],
  });
const datasetSelectionStepSchema = z
  .object({
    datasets: z.record(z.string(), z.boolean()),
  })
  .refine((data) => Object.values(data.datasets).filter(Boolean).length > 0, {
    message: 'At least one dataset must be selected',
    path: ['datasets'],
  });

export const createContinuousScreeningConfigSchema = z.intersection(
  z.object({
    name: z.string(),
    description: z.string(),
  }),
  z.intersection(objectMappingStepSchema, z.intersection(scoringConfigurationStepSchema, datasetSelectionStepSchema)),
);

export const ContinuousScreeningCreationStepper = buildStepper({
  __types: {
    initialData: {} as PartialCreateContinuousScreeningConfig,
  },
  name: 'ContinuousScreeningCreationStepper',
  steps: [
    { name: 'objectMapping', schema: objectMappingStepSchema },
    { name: 'scoringConfiguration', schema: scoringConfigurationStepSchema },
    { name: 'datasetSelection', schema: datasetSelectionStepSchema },
  ] as const,
  validator: createContinuousScreeningConfigSchema,
});
