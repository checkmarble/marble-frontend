import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { type CustomRole } from '@app-builder/models/roles';
import { createRolePayloadSchema, updateRolePermissionsPayloadSchema } from '@app-builder/schemas/roles';
import { redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';

export const createRoleFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(createRolePayloadSchema)
  .handler(async ({ context, data }): Promise<CustomRole> => {
    const { user, organization } = context.authInfo;

    if (!user.permissions.canManageRoles) {
      throw redirect({ to: '/' });
    }

    return organization.createRole({ name: data.name });
  });

export const updateRolePermissionsFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(updateRolePermissionsPayloadSchema)
  .handler(async ({ context, data }): Promise<CustomRole> => {
    const { user, organization } = context.authInfo;

    if (!user.permissions.canManageRoles) {
      throw redirect({ to: '/' });
    }

    return organization.updateRolePermissions(data.roleId, data.permissions);
  });
