import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import { type CreateCustomerAggregateBodyDto, type CustomerAggregateDto } from 'marble-api';

export async function createCustomerAggregate(
  api: MarbleCoreApi,
  { recordType, body, dryRun }: { recordType: string; body: CreateCustomerAggregateBodyDto; dryRun?: boolean },
): Promise<CustomerAggregateDto> {
  return api.createCustomerAggregate(recordType, body, { dryRun });
}

export async function updateCustomerAggregate(
  api: MarbleCoreApi,
  {
    recordType,
    aggregateId,
    body,
    dryRun,
  }: { recordType: string; aggregateId: string; body: CreateCustomerAggregateBodyDto; dryRun?: boolean },
): Promise<CustomerAggregateDto> {
  return api.updateCustomerAggregate(recordType, aggregateId, body, { dryRun });
}
