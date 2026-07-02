import { z } from 'zod/v4';

export const createRolePayloadSchema = z.object({
  name: z.string().min(1),
});
export type CreateRolePayload = z.infer<typeof createRolePayloadSchema>;

export const updateRolePermissionsPayloadSchema = z.object({
  roleId: z.uuid(),
  permissions: z.array(z.string()),
});
export type UpdateRolePermissionsPayload = z.infer<typeof updateRolePermissionsPayloadSchema>;
