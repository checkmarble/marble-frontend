import { z } from 'zod/v4';

export const renameTenantPayloadSchema = z.object({
  tenantId: z.uuid(),
  name: z.string().trim().min(1),
});
export type RenameTenantPayload = z.infer<typeof renameTenantPayloadSchema>;

export const mergeTenantsPayloadSchema = z
  .object({
    targetTenantId: z.uuid(),
    sourceTenantIds: z.array(z.uuid()).min(1),
    name: z.string().trim().min(1).optional(),
  })
  .refine((payload) => !payload.sourceTenantIds.includes(payload.targetTenantId), {
    message: 'The target tenant cannot also be a source',
    path: ['sourceTenantIds'],
  })
  .refine((payload) => new Set(payload.sourceTenantIds).size === payload.sourceTenantIds.length, {
    message: 'Source tenants must be unique',
    path: ['sourceTenantIds'],
  });
export type MergeTenantsPayload = z.infer<typeof mergeTenantsPayloadSchema>;

export const mergeTenantsFormSchema = z.object({
  targetTenantId: z.uuid(),
  name: z.string().trim().min(1),
  confirmed: z.boolean().refine((confirmed) => confirmed, 'Confirm that the merge cannot be undone'),
});
export type MergeTenantsFormValues = z.input<typeof mergeTenantsFormSchema>;

/**
 * Error code thrown by `mergeTenantsFn` when the same principal holds different roles on the
 * tenants being merged, so the client can tell that case apart from a generic failure.
 */
export const TENANT_MERGE_CONFLICT_ERROR = 'tenant_merge_conflict';

/**
 * Error code thrown by `mergeTenantsFn` when the target tenant no longer exists, which means the
 * list the operator selected from is out of date.
 */
export const TENANT_NOT_FOUND_ERROR = 'tenant_not_found';
