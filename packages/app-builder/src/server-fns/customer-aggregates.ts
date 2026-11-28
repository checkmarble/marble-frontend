import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { type AstNode, adaptNodeDto } from '@app-builder/models/astNode/ast-node';
import { createCustomerAggregate, updateCustomerAggregate } from '@app-builder/server/customer-aggregates';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod/v4';

export const getCustomerAggregatesFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(z.object({ objectType: z.string(), objectId: z.string() }))
  .handler(async ({ context, data }) => {
    return context.api.listCustomerAggregates(data.objectType, data.objectId);
  });

const createCustomerAggregatePayloadSchema = z.object({
  recordType: z.string(),
  customerId: z.string(),
  name: z.string().min(1),
  timeSlice: z.string().min(1),
  expression: z.unknown(),
});

export type CreateCustomerAggregatePayload = z.infer<typeof createCustomerAggregatePayloadSchema>;

export const createCustomerAggregateFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(createCustomerAggregatePayloadSchema)
  .handler(async ({ context, data }) => {
    return createCustomerAggregate(context.api, {
      recordType: data.recordType,
      body: {
        name: data.name,
        type: 'period',
        expression: adaptNodeDto(data.expression as AstNode),
        customer_id: data.customerId,
        time_slice: data.timeSlice,
      },
    });
  });

export const updateCustomerAggregateFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(
    z.object({
      recordType: z.string(),
      aggregateId: z.string(),
      customerId: z.string(),
      name: z.string().min(1),
      timeSlice: z.string().min(1),
      expression: z.unknown(),
    }),
  )
  .handler(async ({ context, data }) => {
    return updateCustomerAggregate(context.api, {
      recordType: data.recordType,
      aggregateId: data.aggregateId,
      body: {
        name: data.name,
        type: 'period',
        expression: adaptNodeDto(data.expression as AstNode),
        customer_id: data.customerId,
        time_slice: data.timeSlice,
      },
    });
  });
