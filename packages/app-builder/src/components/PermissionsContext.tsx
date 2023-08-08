import { createContext, useContext } from 'react';

type Permissions = string[];
type UserPermissions = {
  canManageList: boolean;
  canManageListItem: boolean;
};

type PermissionsContextType = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
> & {
  permissions: Permissions;
  userPermissions: UserPermissions;
};

const PermissionsList = {
  canManageList: 'CUSTOM_LISTS_PUBLISH',
  canManageListItem: 'CUSTOM_LISTS_PUBLISH',
};

const defaultUserPermissions: UserPermissions = {
  canManageList: false,
  canManageListItem: false,
};

const Context = createContext<PermissionsContextType>({
  permissions: [],
  userPermissions: defaultUserPermissions,
});

const PermissionsProvider = ({
  permissions,
  ...props
}: PermissionsContextType) => {
  const userPermissions = Object.fromEntries(
    Object.entries(PermissionsList).map(([permission, permissionKey]) => [
      permission,
      permissions.includes(permissionKey),
    ])
  );

  return (
    <Context.Provider
      value={{
        permissions,
        userPermissions: userPermissions as UserPermissions,
      }}
      {...props}
    />
  );
};

const usePermissionsContext = (): PermissionsContextType => useContext(Context);

export {
  defaultUserPermissions,
  PermissionsProvider,
  usePermissionsContext,
  type UserPermissions,
};
