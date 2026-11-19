import { makeQueryErrorComponent } from '@bo/components/common/ErrorComponent';
import { SuspenseQuery } from '@bo/components/core/SuspenseQuery';
import { CreateOrganizationPanel } from '@bo/components/organisms/CreateOrganizationPanel';
import {
  groupMembersByOrganization,
  type MembersByOrganization,
} from '@bo/components/organisms/TenantUsersPanel/tenant-users';
import {
  listOrganizationsQueryOptions,
  ORGANIZATION_ENVIRONMENT_LABELS,
  ORGANIZATION_ENVIRONMENT_TAG_COLORS,
} from '@bo/data/organization';
import { listUsersQueryOptions } from '@bo/data/users';
import { useQuery } from '@tanstack/react-query';
import { Link, useRouter } from '@tanstack/react-router';
import type { OrganizationDto } from 'marble-api';
import { type ReactNode, useMemo, useState } from 'react';
import { Button, cn, Input, Tag, Typo } from 'ui-design-system';
import { Icon } from 'ui-icons';

const OrganizationsError = makeQueryErrorComponent(
  <span className="text-grey-secondary text-s">Could not load organizations.</span>,
);

// Header and rows are subgrids of the table, so the `auto` columns line up across rows.
const ORGANIZATION_TABLE_COLUMNS = 'grid grid-cols-[minmax(0,1fr)_auto_auto_auto] gap-x-xl';
const ORGANIZATION_TABLE_ROW = 'col-span-full grid grid-cols-subgrid';

export function DashboardPage() {
  const [isCreatingOrg, setIsCreatingOrg] = useState(false);
  const openCreate = () => setIsCreatingOrg(true);

  return (
    <div className="flex flex-col gap-lg pb-xl">
      <div className="flex flex-wrap items-end justify-between gap-md">
        <div className="flex max-w-2xl flex-col gap-xs">
          <Typo variant="title1">Organizations</Typo>
          <p className="text-grey-secondary text-s">Jump to an organization or provision a new one.</p>
        </div>
        <Button variant="primary" onClick={openCreate}>
          <Icon icon="plus" className="size-4" />
          Create organization
        </Button>
      </div>

      <SuspenseQuery
        query={listOrganizationsQueryOptions()}
        fallback={<OrganizationsSkeleton />}
        errorComponent={OrganizationsError}
      >
        {(organizations) => <OrganizationsContent organizations={organizations} onCreate={openCreate} />}
      </SuspenseQuery>

      <CreateOrganizationPanel open={isCreatingOrg} onOpenChange={setIsCreatingOrg} />
    </div>
  );
}

function OrganizationsContent({ organizations, onCreate }: { organizations: OrganizationDto[]; onCreate: () => void }) {
  const router = useRouter();
  const usersQuery = useQuery(listUsersQueryOptions());
  const [search, setSearch] = useState('');

  const membersByOrganization = useMemo(
    () => (usersQuery.data ? groupMembersByOrganization(usersQuery.data) : null),
    [usersQuery.data],
  );

  const filteredOrganizations = useMemo(() => {
    const term = search.trim().toLowerCase();
    const sorted = [...organizations].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
    if (!term) return sorted;

    return sorted.filter(
      (organization) => organization.name.toLowerCase().includes(term) || organization.id.includes(term),
    );
  }, [organizations, search]);

  if (organizations.length === 0) {
    return (
      <EmptyState title="No organizations yet" body="Provision your first customer organization to get started.">
        <Button variant="primary" onClick={onCreate}>
          <Icon icon="plus" className="size-4" />
          Create organization
        </Button>
      </EmptyState>
    );
  }

  const openFirstMatch = () => {
    const [firstMatch] = filteredOrganizations;
    if (!firstMatch) return;
    router.navigate({ to: '/organizations/$orgId', params: { orgId: firstMatch.id } });
  };

  return (
    <div className="flex flex-col gap-md">
      <div className="flex flex-wrap items-center gap-md">
        <div className="w-100 max-w-full">
          <Input
            autoFocus
            startAdornment="search"
            endAdornment={search ? 'cross' : undefined}
            onEndAdornmentClick={() => setSearch('')}
            placeholder="Search by name or ID"
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && search.trim()) openFirstMatch();
            }}
            aria-label="Search organizations"
          />
        </div>
        <span className="text-grey-secondary text-s">
          {organizations.length} {organizations.length === 1 ? 'organization' : 'organizations'}
        </span>
      </div>

      {filteredOrganizations.length === 0 ? (
        <EmptyState title="No matches" body={`No organization matches “${search.trim()}”.`}>
          <Button variant="secondary" onClick={onCreate}>
            <Icon icon="plus" className="size-4" />
            Create organization
          </Button>
        </EmptyState>
      ) : (
        <div
          className={cn(
            'border-grey-border bg-surface-card overflow-hidden rounded-lg border',
            ORGANIZATION_TABLE_COLUMNS,
          )}
        >
          <div
            className={cn(
              'border-grey-border text-grey-secondary border-b px-md py-sm text-xs font-semibold uppercase tracking-wider',
              ORGANIZATION_TABLE_ROW,
            )}
          >
            <span>Organization</span>
            <span>Environment</span>
            <span>Users</span>
            {/* `sr-only` is absolutely positioned and would not take a grid cell on its own. */}
            <span>
              <span className="sr-only">Open</span>
            </span>
          </div>
          <ul className={cn('divide-grey-border divide-y', ORGANIZATION_TABLE_ROW)}>
            {filteredOrganizations.map((organization) => (
              <OrganizationRow
                key={organization.id}
                organization={organization}
                membersByOrganization={membersByOrganization}
                isUsersError={usersQuery.isError}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function OrganizationRow({
  organization,
  membersByOrganization,
  isUsersError,
}: {
  organization: OrganizationDto;
  membersByOrganization: MembersByOrganization | null;
  isUsersError: boolean;
}) {
  return (
    <li className={ORGANIZATION_TABLE_ROW}>
      <Link
        to="/organizations/$orgId"
        params={{ orgId: organization.id }}
        className={cn(
          'group items-center px-md py-md outline-hidden hover:bg-surface-row-hover focus-visible:bg-surface-row-hover',
          ORGANIZATION_TABLE_ROW,
        )}
      >
        <span className="flex min-w-0 flex-col gap-2xs">
          <span className="text-grey-primary truncate text-s font-medium">{organization.name}</span>
          <span className="text-grey-placeholder truncate font-mono text-2xs">{organization.id}</span>
        </span>
        <span>
          <Tag color={ORGANIZATION_ENVIRONMENT_TAG_COLORS[organization.environment]} size="small">
            {ORGANIZATION_ENVIRONMENT_LABELS[organization.environment]}
          </Tag>
        </span>
        <UsersCount
          organizationId={organization.id}
          membersByOrganization={membersByOrganization}
          isError={isUsersError}
        />
        <Icon
          icon="arrow-right"
          className="text-grey-placeholder group-hover:text-purple-primary group-focus-visible:text-purple-primary size-5"
        />
      </Link>
    </li>
  );
}

function UsersCount({
  organizationId,
  membersByOrganization,
  isError,
}: {
  organizationId: string;
  membersByOrganization: MembersByOrganization | null;
  isError: boolean;
}) {
  if (isError) {
    return <span className="text-grey-placeholder text-s">—</span>;
  }
  if (!membersByOrganization) {
    return <span className="bg-grey-background-light h-5 w-10 animate-pulse rounded" />;
  }

  const count = membersByOrganization.get(organizationId)?.length ?? 0;

  return (
    <span className="text-grey-primary flex items-center gap-xs text-s">
      <Icon icon="users" className="text-grey-secondary size-4" />
      {count}
    </span>
  );
}

function EmptyState({ title, body, children }: { title: string; body: string; children?: ReactNode }) {
  return (
    <div className="border-grey-border bg-surface-card flex flex-col items-center gap-xs rounded-lg border border-dashed p-2xl text-center">
      <Typo variant="subtitle1">{title}</Typo>
      <p className="text-grey-secondary text-s">{body}</p>
      {children ? <div className="pt-sm">{children}</div> : null}
    </div>
  );
}

function OrganizationsSkeleton() {
  return (
    <div className="flex flex-col gap-md">
      <div className="bg-grey-background-light h-10 w-100 max-w-full animate-pulse rounded-md" />
      <div className="border-grey-border bg-surface-card divide-grey-border flex flex-col divide-y overflow-hidden rounded-lg border">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex items-center gap-md p-md">
            <div className="flex flex-1 flex-col gap-xs">
              <div className="bg-grey-background-light h-3.5 w-48 animate-pulse rounded" />
              <div className="bg-grey-background-light h-2.5 w-72 animate-pulse rounded" />
            </div>
            <div className="bg-grey-background-light h-6 w-20 animate-pulse rounded-full" />
            <div className="bg-grey-background-light h-5 w-10 animate-pulse rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
