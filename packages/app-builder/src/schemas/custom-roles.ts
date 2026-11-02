import { isCustomRolePermission } from '@app-builder/models/custom-role-permissions';
import { z } from 'zod/v4';

export const createCustomRoleSchema = z.object({
  name: z.string().trim().min(1),
  slug: z.string().regex(/^org\/[a-zA-Z.]+$/),
});

export type CreateCustomRolePayload = z.infer<typeof createCustomRoleSchema>;

export const updateCustomRolePermissionsSchema = z.object({
  role: createCustomRoleSchema.shape.slug,
  permissions: z
    .array(z.string().min(1))
    .refine(
      (permissions) => permissions.every(isCustomRolePermission) && new Set(permissions).size === permissions.length,
    ),
});

export const createCustomRoleFormSchema = createCustomRoleSchema.extend({
  permissions: updateCustomRolePermissionsSchema.shape.permissions,
});
