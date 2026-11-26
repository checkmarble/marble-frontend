import { isCustomRolePermission } from '@app-builder/models/custom-role-permissions';
import { APP_SECTIONS } from '@app-builder/models/custom-role-sections';
import { z } from 'zod/v4';

export const createCustomRoleSchema = z.object({
  name: z.string().trim().min(1),
  slug: z.string().regex(/^org\/[a-zA-Z.]+$/),
});

export type CreateCustomRolePayload = z.infer<typeof createCustomRoleSchema>;

// Roles created through the API or by a newer backend can use slugs the creation form rejects.
export const customRoleSlugSchema = z.string().startsWith('org/').min(5);

export const updateCustomRolePermissionsSchema = z.object({
  role: customRoleSlugSchema,
  permissions: z
    .array(z.string().min(1))
    .refine(
      (permissions) => permissions.every(isCustomRolePermission) && new Set(permissions).size === permissions.length,
    ),
});

export type UpdateCustomRolePermissionsPayload = z.infer<typeof updateCustomRolePermissionsSchema>;

// Keys are not limited to APP_SECTIONS so sections this frontend doesn't know yet keep their visibility.
export const updateCustomRoleSectionsSchema = z.object({
  role: customRoleSlugSchema,
  sections: z.record(z.string(), z.boolean()),
});

export type UpdateCustomRoleSectionsPayload = z.infer<typeof updateCustomRoleSectionsSchema>;

export const createCustomRoleFormSchema = createCustomRoleSchema.extend({
  permissions: updateCustomRolePermissionsSchema.shape.permissions,
  sections: z.record(z.enum(APP_SECTIONS), z.boolean()),
});

export const editCustomRoleFormSchema = createCustomRoleFormSchema.extend({
  slug: customRoleSlugSchema,
});

export const deleteCustomRoleSchema = z.object({
  slug: customRoleSlugSchema,
});

export type DeleteCustomRolePayload = z.infer<typeof deleteCustomRoleSchema>;
