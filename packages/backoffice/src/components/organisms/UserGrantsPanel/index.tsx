import { listOrganizationFeatures, listOrganizationsQueryOptions } from '@bo/data/organization';
import { listTenantsQueryOptions, type Tenant } from '@bo/data/tenants';
import {
  type UserGrant,
  useReplaceOrganizationGrantMutationOptions,
  useRevokeOrganizationGrantMutationOptions,
  userGrantsQueryOptions,
} from '@bo/data/users';
import { GRANT_FORBIDDEN_ERROR, GRANT_NOT_FOUND_ERROR, type GrantRole } from '@bo/schemas/user';
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import type { FeatureAccessDto } from 'marble-api/generated/backoffice-api';
import type { UserDto } from 'marble-api/generated/marblecore-api';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Button, Panel, SelectV2, Tag, Typo } from 'ui-design-system';
import { Icon } from 'ui-icons';
import {
  type GrantEntry,
  type GrantOrganization,
  getAllowedGrantRoles,
  getCustomerServiceGrantsView,
  getGrantRoleOptions,
  getTenantGrantsView,
  isCustomerServiceUser,
} from './grants';

type GrantAction = 'adding' | 'updating' | 'revoking';

const getGrantErrorMessage = (error: unknown, action: GrantAction) => {
  if (error instanceof Error && error.message === GRANT_NOT_FOUND_ERROR) {
    return 'Organization or user is no longer in this tenant';
  }
  if (error instanceof Error && error.message === GRANT_FORBIDDEN_ERROR) {
    return 'Not allowed';
  }
  return `Something went wrong while ${action} the grant`;
};

// Each organization's `roles` feature decides which roles it can grant.
const useRolesFeatures = (organizationIds: string[]) =>
  useQueries({
    queries: organizationIds.map((organizationId) => listOrganizationFeatures(organizationId)),
    combine: (results) =>
      new Map(organizationIds.map((organizationId, index) => [organizationId, results[index]?.data?.roles])),
  });

const useGrantActions = (user: UserDto) => {
  const queryClient = useQueryClient();
  const replaceMutation = useMutation(useReplaceOrganizationGrantMutationOptions());
  const revokeMutation = useMutation(useRevokeOrganizationGrantMutationOptions());

  const handleError = (error: unknown, action: GrantAction) => {
    toast.error(getGrantErrorMessage(error, action));
    if (error instanceof Error && error.message === GRANT_NOT_FOUND_ERROR) {
      void queryClient.invalidateQueries({ queryKey: userGrantsQueryOptions(user.user_id).queryKey });
    }
  };

  const replace = async (organization: GrantOrganization, role: GrantRole, action: GrantAction) => {
    try {
      await replaceMutation.mutateAsync({
        userId: user.user_id,
        tenantId: organization.tenant_id,
        organizationId: organization.id,
        role,
      });
      toast.success(
        action === 'adding' ? `Granted ${role} on ${organization.name}` : `Role on ${organization.name} set to ${role}`,
      );
      return true;
    } catch (error) {
      handleError(error, action);
      return false;
    }
  };

  const revoke = async (organization: GrantOrganization) => {
    try {
      await revokeMutation.mutateAsync({
        userId: user.user_id,
        tenantId: organization.tenant_id,
        organizationId: organization.id,
      });
      toast.success(`Access to ${organization.name} revoked`);
    } catch (error) {
      handleError(error, 'revoking');
    }
  };

  return { replace, revoke };
};

type GrantActions = ReturnType<typeof useGrantActions>;

export function UserGrantsPanel({ user }: { user: UserDto }) {
  const grantsQuery = useQuery(userGrantsQueryOptions(user.user_id));
  const organizationsQuery = useQuery(listOrganizationsQueryOptions());
  const tenantsQuery = useQuery(listTenantsQueryOptions());
  const actions = useGrantActions(user);
  const isCustomerService = isCustomerServiceUser(user);

  const renderBody = () => {
    if (grantsQuery.isError || organizationsQuery.isError || tenantsQuery.isError) {
      return <p className="text-grey-secondary text-s">Could not load the user's grants.</p>;
    }
    if (!grantsQuery.data || !organizationsQuery.data || !tenantsQuery.data) {
      return <GrantsSkeleton />;
    }

    return isCustomerService ? (
      <CustomerServiceGrants
        grants={grantsQuery.data}
        organizations={organizationsQuery.data}
        tenants={tenantsQuery.data}
        actions={actions}
      />
    ) : (
      <TenantGrants
        user={user}
        grants={grantsQuery.data}
        organizations={organizationsQuery.data}
        tenants={tenantsQuery.data}
        actions={actions}
      />
    );
  };

  return (
    <>
      <Panel.Header>
        <div className="flex flex-col gap-2xs">
          <span>Manage grants</span>
          <p className="text-grey-secondary text-small font-normal">
            {user.first_name} {user.last_name} · {user.email}
          </p>
          {isCustomerService ? (
            <Tag color="purple" size="small" className="self-start">
              Marble admin
            </Tag>
          ) : null}
        </div>
      </Panel.Header>
      <div className="flex flex-col gap-lg">{renderBody()}</div>
      <Panel.Footer>
        <Panel.FooterButton isCloseButton label="Close" />
      </Panel.Footer>
    </>
  );
}

function TenantGrants({
  user,
  grants,
  organizations,
  tenants,
  actions,
}: {
  user: UserDto;
  grants: UserGrant[];
  organizations: GrantOrganization[];
  tenants: Tenant[];
  actions: GrantActions;
}) {
  const view = getTenantGrantsView({ user, grants, organizations });
  const tenant = tenants.find(({ id }) => id === view.tenantId);
  const rolesFeatures = useRolesFeatures(view.grants.map(({ organization }) => organization.id));

  return (
    <>
      <p className="text-grey-secondary text-s">
        Tenant: <span className="text-grey-primary font-medium">{tenant?.name ?? view.tenantId ?? 'Unknown'}</span>
      </p>
      <GrantList>
        {view.home ? (
          <li className="flex items-center justify-between gap-md px-md py-sm">
            <div className="flex min-w-0 items-center gap-sm">
              <span className="text-grey-primary truncate text-s font-medium">{view.home.organization.name}</span>
              <Tag color="grey" size="small">
                Home
              </Tag>
              {view.home.isLegacy ? (
                <Tag color="orange" size="small">
                  Legacy
                </Tag>
              ) : null}
            </div>
            <Tag color="grey" size="small">
              {view.home.role}
            </Tag>
          </li>
        ) : null}
        {view.grants.map((entry) => (
          <GrantRow
            key={`${entry.organization.id}:${entry.role}`}
            entry={entry}
            rolesFeature={rolesFeatures.get(entry.organization.id)}
            actions={actions}
          />
        ))}
      </GrantList>
      {view.addable.length > 0 ? (
        <AddGrantForm groups={[{ tenant: tenant ?? null, organizations: view.addable }]} actions={actions} />
      ) : (
        <p className="text-grey-secondary text-s">
          {organizations.some(({ id, tenant_id }) => tenant_id === view.tenantId && id !== user.organization_id)
            ? 'The user has access to every organization in this tenant.'
            : 'No other organization in this tenant.'}
        </p>
      )}
    </>
  );
}

function CustomerServiceGrants({
  grants,
  organizations,
  tenants,
  actions,
}: {
  grants: UserGrant[];
  organizations: GrantOrganization[];
  tenants: Tenant[];
  actions: GrantActions;
}) {
  const view = getCustomerServiceGrantsView({ grants, organizations, tenants });
  const rolesFeatures = useRolesFeatures(grants.map((grant) => grant.organization_id));

  return (
    <>
      {view.groups.length === 0 ? (
        <p className="text-grey-secondary text-s">No organization grant yet.</p>
      ) : (
        view.groups.map(({ tenant, grants: tenantGrants }) => (
          <div key={tenant.id} className="flex flex-col gap-xs">
            <Typo variant="subtitle1">{tenant.name}</Typo>
            <GrantList>
              {tenantGrants.map((entry) => (
                <GrantRow
                  key={`${entry.organization.id}:${entry.role}`}
                  entry={entry}
                  rolesFeature={rolesFeatures.get(entry.organization.id)}
                  actions={actions}
                />
              ))}
            </GrantList>
          </div>
        ))
      )}
      {view.addableByTenant.length > 0 ? (
        <AddGrantForm groups={view.addableByTenant} withTenantSelect actions={actions} />
      ) : null}
    </>
  );
}

function GrantList({ children }: { children: React.ReactNode }) {
  return (
    <ul className="border-grey-border bg-surface-card divide-grey-border divide-y overflow-hidden rounded-lg border">
      {children}
    </ul>
  );
}

function GrantRow({
  entry,
  rolesFeature,
  actions,
}: {
  entry: GrantEntry;
  rolesFeature: FeatureAccessDto['roles'] | undefined;
  actions: GrantActions;
}) {
  const [role, setRole] = useState(entry.role);
  const [pending, setPending] = useState(false);
  const allowedRoles = getAllowedGrantRoles(rolesFeature);
  const options = getGrantRoleOptions(allowedRoles, role);

  const handleRoleChange = async (nextRole: string) => {
    if (nextRole === role) return;
    const previousRole = role;
    setRole(nextRole);
    setPending(true);
    const saved = await actions.replace(entry.organization, nextRole as GrantRole, 'updating');
    setPending(false);
    if (!saved) setRole(previousRole);
  };

  const handleRevoke = async () => {
    setPending(true);
    await actions.revoke(entry.organization);
    setPending(false);
  };

  return (
    <li className="flex items-center justify-between gap-md px-md py-sm">
      <span className="text-grey-primary min-w-0 truncate text-s font-medium">{entry.organization.name}</span>
      <div className="flex shrink-0 items-center gap-sm">
        <SelectV2<string>
          value={role}
          onChange={(nextRole) => void handleRoleChange(nextRole)}
          placeholder="Role"
          aria-label={`Role on ${entry.organization.name}`}
          disabled={pending || allowedRoles.length === 0}
          options={options.map((option) => ({ label: option, value: option }))}
        />
        <Button
          variant="secondary"
          mode="icon"
          aria-label={`Revoke access to ${entry.organization.name}`}
          disabled={pending}
          onClick={() => void handleRevoke()}
        >
          <Icon icon="delete" className="size-4" />
        </Button>
      </div>
    </li>
  );
}

function AddGrantForm({
  groups,
  withTenantSelect = false,
  actions,
}: {
  // Regular users pass their own tenant only; customer service users pick among every tenant.
  groups: { tenant: Tenant | null; organizations: GrantOrganization[] }[];
  withTenantSelect?: boolean;
  actions: GrantActions;
}) {
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [role, setRole] = useState<GrantRole | null>(null);
  const [pending, setPending] = useState(false);

  const organizations = withTenantSelect
    ? (groups.find((group) => group.tenant?.id === tenantId)?.organizations ?? [])
    : (groups[0]?.organizations ?? []);
  const organization = organizations.find(({ id }) => id === organizationId);
  const rolesFeatures = useRolesFeatures(organization ? [organization.id] : []);
  const allowedRoles = organization ? getAllowedGrantRoles(rolesFeatures.get(organization.id)) : [];

  const handleAdd = async () => {
    if (!organization || !role) return;
    setPending(true);
    const saved = await actions.replace(organization, role, 'adding');
    setPending(false);
    if (saved) {
      setOrganizationId(null);
      setRole(null);
    }
  };

  return (
    <div className="flex flex-col gap-sm">
      <Typo variant="subtitle1">Add to organization</Typo>
      <div className="flex flex-wrap items-center gap-sm">
        {withTenantSelect ? (
          <SelectV2<string | null>
            value={tenantId}
            onChange={(nextTenantId) => {
              setTenantId(nextTenantId);
              setOrganizationId(null);
              setRole(null);
            }}
            placeholder="Tenant"
            aria-label="Tenant"
            disabled={pending}
            options={groups.flatMap(({ tenant }) => (tenant ? [{ label: tenant.name, value: tenant.id }] : []))}
          />
        ) : null}
        <SelectV2<string | null>
          value={organizationId}
          onChange={(nextOrganizationId) => {
            setOrganizationId(nextOrganizationId);
            setRole(null);
          }}
          placeholder="Organization"
          aria-label="Organization"
          disabled={pending || organizations.length === 0}
          options={organizations.map(({ id, name }) => ({ label: name, value: id }))}
        />
        <SelectV2<GrantRole | null>
          value={role}
          onChange={setRole}
          placeholder="Role"
          aria-label="Role"
          disabled={pending || allowedRoles.length === 0}
          options={allowedRoles.map((allowedRole) => ({ label: allowedRole, value: allowedRole }))}
        />
        <Button variant="primary" disabled={pending || !organization || !role} onClick={() => void handleAdd()}>
          <Icon icon="plus" className="size-4" />
          Add
        </Button>
      </div>
    </div>
  );
}

function GrantsSkeleton() {
  return (
    <div className="border-grey-border bg-surface-card divide-grey-border flex flex-col divide-y overflow-hidden rounded-lg border">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex items-center justify-between gap-md p-md">
          <div className="bg-grey-background-light h-3.5 w-40 animate-pulse rounded" />
          <div className="bg-grey-background-light h-6 w-24 animate-pulse rounded" />
        </div>
      ))}
    </div>
  );
}
