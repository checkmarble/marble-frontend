import { type AstNode } from '@app-builder/models/astNode/ast-node';
import { createCustomerAggregateFn } from '@app-builder/server-fns/customer-aggregates';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { customerAggregatesQueryKey } from './get-customer-aggregates';

export type CreateCustomerAggregatePayload = {
  recordType: string;
  customerId: string;
  name: string;
  timeSlice: string;
  expression: AstNode;
};

export function useCreateCustomerAggregateMutation() {
  const createCustomerAggregate = useServerFn(createCustomerAggregateFn);
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['customer-aggregates', 'create'],
    mutationFn: (payload: CreateCustomerAggregatePayload) => createCustomerAggregate({ data: payload }),
    onSuccess: async (_, { recordType, customerId }) => {
      await queryClient.invalidateQueries({ queryKey: customerAggregatesQueryKey(recordType, customerId) });
    },
  });
}
