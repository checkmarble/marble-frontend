import { useNavigate } from '@remix-run/react';
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
} from 'react';

type Permissions = string[];
type UserPermissions = {
  canManageList: boolean;
  canManageListItem: boolean;
  canManageScenario: boolean;
  canPublishScenario: boolean;
};

type PermissionsContextType = {
  permissions: Permissions;
  userPermissions: UserPermissions;
};

const PermissionsList = {
  canManageList: 'CUSTOM_LISTS_PUBLISH',
  canManageListItem: 'CUSTOM_LISTS_PUBLISH',
  canManageScenario: 'SCENARIO_CREATE',
  canPublishScenario: 'SCENARIO_PUBLISH',
};

const emptyUserPermissions: UserPermissions = {
  canManageList: false,
  canManageListItem: false,
  canManageScenario: false,
  canPublishScenario: false,
};

const Context = createContext<PermissionsContextType>({
  permissions: [],
  userPermissions: emptyUserPermissions,
});

const PermissionsProvider = ({
  permissions,
  ...props
}: PropsWithChildren & { permissions: string[] }) => {
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

const usePermissionRedirect = (
  permission: keyof UserPermissions,
  options: { redirectUrl: string }
) => {
  const { userPermissions } = usePermissionsContext();
  const navigate = useNavigate();

  const permissionValue = userPermissions[permission];

  useEffect(() => {
    if (!permissionValue) {
      navigate(options.redirectUrl, { replace: true });
    }
  }, [navigate, options.redirectUrl, permissionValue]);
};

export {
  PermissionsProvider,
  usePermissionRedirect,
  usePermissionsContext,
  type UserPermissions,
};
