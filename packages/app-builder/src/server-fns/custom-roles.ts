import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isStatusConflictHttpError } from '@app-builder/models/http-errors';
import { createCustomRoleSchema, updateCustomRolePermissionsSchema } from '@app-builder/schemas/custom-roles';
import { createServerFn } from '@tanstack/react-start';

export const createCustomRoleFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(createCustomRoleSchema)
  .handler(async ({ context, data }) => {
    if (!context.authInfo.user.permissions.canManageRoles) throw new Error('Forbidden');

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
    if (!context.authInfo.user.permissions.canManageRoles) throw new Error('Forbidden');
    await context.authInfo.apiClient.updateCustomRolePermissions(data);
  });
