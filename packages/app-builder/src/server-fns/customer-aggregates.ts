import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { type AstNode, adaptNodeDto } from '@app-builder/models/astNode/ast-node';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod/v4';

export const getCustomerAggregatesFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(z.object({ objectType: z.string(), objectId: z.string() }))
  .handler(async ({ context, data }) => {
    return context.authInfo.customerAggregates.listCustomerAggregates({
      recordType: data.objectType,
      customerId: data.objectId,
    });
  });

export const createCustomerAggregateFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(
    z.object({
      recordType: z.string(),
      customerId: z.string(),
      name: z.string().min(1),
      timeSlice: z.string().min(1),
      expression: z.unknown(),
    }),
  )
  .handler(async ({ context, data }) => {
    return context.authInfo.customerAggregates.createCustomerAggregate({
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
    return context.authInfo.customerAggregates.updateCustomerAggregate({
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
