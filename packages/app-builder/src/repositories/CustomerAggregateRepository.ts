import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import { type CreateCustomerAggregateBodyDto, type CustomerAggregateDto } from 'marble-api';

export interface CustomerAggregateRepository {
  createCustomerAggregate(args: {
    recordType: string;
    body: CreateCustomerAggregateBodyDto;
    dryRun?: boolean;
  }): Promise<CustomerAggregateDto>;
  updateCustomerAggregate(args: {
    recordType: string;
    aggregateId: string;
    body: CreateCustomerAggregateBodyDto;
    dryRun?: boolean;
  }): Promise<CustomerAggregateDto>;
  deleteCustomerAggregate(args: { recordType: string; aggregateId: string }): Promise<void>;
  listCustomerAggregates(args: { recordType: string; customerId: string }): Promise<CustomerAggregateDto[]>;
}

export function makeGetCustomerAggregateRepository() {
  return (marbleCoreApiClient: MarbleCoreApi): CustomerAggregateRepository => ({
    createCustomerAggregate: async ({ recordType, body, dryRun }) => {
      return marbleCoreApiClient.createCustomerAggregate(recordType, body, { dryRun });
    },
    updateCustomerAggregate: async ({ recordType, aggregateId, body, dryRun }) => {
      return marbleCoreApiClient.updateCustomerAggregate(recordType, aggregateId, body, { dryRun });
    },
    deleteCustomerAggregate: async ({ recordType, aggregateId }) => {
      await marbleCoreApiClient.deleteCustomerAggregate(recordType, aggregateId);
    },
    listCustomerAggregates: async ({ recordType, customerId }) => {
      return marbleCoreApiClient.listCustomerAggregates(recordType, customerId);
    },
  });
}
