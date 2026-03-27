import z from 'zod/v4';
import {
  type FtmEntityV2,
  ftmEntities,
  ftmEntityPersonOptions,
  ftmEntityVehicleOptions,
} from '../UploadData/uploadData-types';

export type CreateTableFormValues = {
  name: string;
  alias: string;
  entityType: FtmEntityV2 | '';
  subEntity: string;
  belongsToTableId: string;
};

export const defaultCreateTableFormValues: CreateTableFormValues = {
  name: '',
  alias: '',
  entityType: '',
  subEntity: '',
  belongsToTableId: '',
};

const entityTypesWithSubEntity = ['person', 'vehicle'] as const;
const entityTypesRequiringLink = ['transaction', 'event'] as const;

export const createTableEntityStepSchema = z
  .object({
    name: z
      .string()
      .min(1)
      .regex(/^[a-z]+[a-z0-9_]+$/, {
        error: 'Only lower case alphanumeric and _, must start with a letter',
      }),
    alias: z.string(),
    entityType: z.enum(ftmEntities),
    subEntity: z.string(),
    belongsToTableId: z.string(),
  })
  .refine(
    (data) => {
      if (data.entityType === 'person') {
        return ftmEntityPersonOptions.includes(data.subEntity as (typeof ftmEntityPersonOptions)[number]);
      }
      if (data.entityType === 'vehicle') {
        return ftmEntityVehicleOptions.includes(data.subEntity as (typeof ftmEntityVehicleOptions)[number]);
      }
      return true;
    },
    { error: 'Please select a sub-entity', path: ['subEntity'] },
  )
  .refine(
    (data) => {
      if (data.entityType === 'transaction' || data.entityType === 'event') {
        return data.belongsToTableId.length > 0;
      }
      return true;
    },
    { error: 'Please select a destination table', path: ['belongsToTableId'] },
  );

export function hasSubEntityOptions(entityType: FtmEntityV2 | ''): entityType is 'person' | 'vehicle' {
  return entityTypesWithSubEntity.includes(entityType as (typeof entityTypesWithSubEntity)[number]);
}

export function requiresLink(entityType: FtmEntityV2 | ''): entityType is 'transaction' | 'event' {
  return entityTypesRequiringLink.includes(entityType as (typeof entityTypesRequiringLink)[number]);
}

export function canProceedToStep2(values: CreateTableFormValues): boolean {
  return createTableEntityStepSchema.safeParse(values).success;
}
