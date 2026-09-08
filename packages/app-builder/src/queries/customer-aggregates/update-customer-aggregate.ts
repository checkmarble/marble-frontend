import { type AstNode } from '@app-builder/models/astNode/ast-node';
import { updateCustomerAggregateFn } from '@app-builder/server-fns/customer-aggregates';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { customerAggregatesQueryKey } from './get-customer-aggregates';

export type UpdateCustomerAggregatePayload = {
  recordType: string;
  aggregateId: string;
  customerId: string;
  name: string;
  timeSlice: string;
  expression: AstNode;
};

export function useUpdateCustomerAggregateMutation() {
  const updateCustomerAggregate = useServerFn(updateCustomerAggregateFn);
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['customer-aggregates', 'update'],
    mutationFn: (payload: UpdateCustomerAggregatePayload) => updateCustomerAggregate({ data: payload }),
    onSuccess: async (_, { recordType, customerId }) => {
      await queryClient.invalidateQueries({ queryKey: customerAggregatesQueryKey(recordType, customerId) });
    },
  });
}
