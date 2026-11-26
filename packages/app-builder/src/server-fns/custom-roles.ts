import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isStatusConflictHttpError } from '@app-builder/models/http-errors';
import {
  createCustomRoleSchema,
  deleteCustomRoleSchema,
  updateCustomRolePermissionsSchema,
  updateCustomRoleSectionsSchema,
} from '@app-builder/schemas/custom-roles';
import { createServerFn } from '@tanstack/react-start';

export const createCustomRoleFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(createCustomRoleSchema)
  .handler(async ({ context, data }) => {
    try {
      await context.authInfo.apiClient.createCustomRole(data);
      return { success: true as const };
    } catch (error) {
      if (isStatusConflictHttpError(error)) return { success: false as const };
      throw error;
    }
  });

export const updateCustomRolePermissionsFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(updateCustomRolePermissionsSchema)
  .handler(async ({ context, data }) => {
    await context.authInfo.apiClient.updateCustomRolePermissions(data);
  });

export const updateCustomRoleSectionsFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(updateCustomRoleSectionsSchema)
  .handler(async ({ context, data }) => {
    await context.authInfo.apiClient.updateCustomRoleSections(data);
  });

export const deleteCustomRoleFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(deleteCustomRoleSchema)
  .handler(async ({ context, data }) => {
    try {
      await context.authInfo.apiClient.deleteCustomRole(data.slug);
      return { success: true as const };
    } catch (error) {
      // The backend refuses to delete a role still bound to users or API keys
      if (isStatusConflictHttpError(error)) return { success: false as const, reason: 'in_use' as const };
      throw error;
    }
  });
