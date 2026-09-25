import { makeQueryErrorComponent } from '@bo/components/common/ErrorComponent';
import { SuspenseQuery } from '@bo/components/core/SuspenseQuery';
import { MergeTenantsModal } from '@bo/components/organisms/MergeTenantsModal';
import { RenameTenantModal } from '@bo/components/organisms/RenameTenantModal';
import { listOrganizationsQueryOptions } from '@bo/data/organization';
import {
  groupOrganizationsByTenant,
  listTenantsQueryOptions,
  type Tenant,
  type TenantOrganization,
} from '@bo/data/tenants';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Button, Checkbox, Input, RadioGroup, RadioGroupItem, Tag, Typo } from 'ui-design-system';
import { Icon } from 'ui-icons';

const TenantsError = makeQueryErrorComponent(
  <span className="text-grey-secondary text-s">Could not load tenants.</span>,
);

const MIN_TENANTS_TO_MERGE = 2;

type TenantFilter = 'all' | 'merged';

const isMergedTenant = (organizations: TenantOrganization[]) => organizations.length > 1;

export function TenantsPage() {
  return (
    <div className="flex flex-col gap-lg pb-xl">
      <div className="flex max-w-2xl flex-col gap-xs">
        <Typo variant="title1">Tenants</Typo>
        <p className="text-grey-secondary text-s">
          A tenant groups the organizations of one customer. Every organization started in its own tenant: merge tenants
          to bring the organizations of the same customer together.
        </p>
      </div>

      <SuspenseQuery query={listTenantsQueryOptions()} fallback={<TenantsSkeleton />} errorComponent={TenantsError}>
        {(tenants) => <TenantsContent tenants={tenants} />}
      </SuspenseQuery>
    </div>
  );
}

function TenantsContent({ tenants }: { tenants: Tenant[] }) {
  const { data: organizations } = useSuspenseQuery(listOrganizationsQueryOptions());
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<TenantFilter>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [renamingTenant, setRenamingTenant] = useState<Tenant | null>(null);
  const [isMerging, setIsMerging] = useState(false);

  const organizationsByTenant = useMemo(() => groupOrganizationsByTenant(organizations), [organizations]);
  const getOrganizations = (tenantId: string) => organizationsByTenant.get(tenantId) ?? [];
  const mergedCount = tenants.filter((tenant) => isMergedTenant(getOrganizations(tenant.id))).length;

  const filteredTenants = useMemo(() => {
    const term = search.trim().toLowerCase();

    return tenants.filter((tenant) => {
      const tenantOrganizations = organizationsByTenant.get(tenant.id) ?? [];
      if (filter === 'merged' && !isMergedTenant(tenantOrganizations)) return false;
      if (!term) return true;

      return (
        tenant.name.toLowerCase().includes(term) ||
        tenant.id.includes(term) ||
        tenantOrganizations.some((organization) => organization.name.toLowerCase().includes(term))
      );
    });
  }, [filter, organizationsByTenant, search, tenants]);

  const selectedTenants = useMemo(() => {
    const tenantsById = new Map(tenants.map((tenant) => [tenant.id, tenant]));
    return selectedIds.flatMap((id) => tenantsById.get(id) ?? []);
  }, [selectedIds, tenants]);

  const toggleSelection = (tenantId: string, checked: boolean) => {
    setSelectedIds((current) =>
      checked ? [...current.filter((id) => id !== tenantId), tenantId] : current.filter((id) => id !== tenantId),
    );
  };
  const clearSelection = () => setSelectedIds([]);

  if (tenants.length === 0) {
    return <EmptyState title="No tenants" body="Tenants are created along with organizations." />;
  }

  return (
    <div className="flex flex-col gap-md">
      <div className="flex flex-wrap items-center gap-md">
        <div className="w-100 max-w-full">
          <Input
            startAdornment="search"
            endAdornment={search ? 'cross' : undefined}
            onEndAdornmentClick={() => setSearch('')}
            placeholder="Search by tenant, organization or ID"
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
            aria-label="Search tenants"
          />
        </div>
        <RadioGroup
          value={filter}
          onValueChange={(value) => setFilter(value as TenantFilter)}
          aria-label="Filter tenants"
        >
          <RadioGroupItem value="all">All ({tenants.length})</RadioGroupItem>
          <RadioGroupItem value="merged">Merged ({mergedCount})</RadioGroupItem>
        </RadioGroup>
      </div>

      {filteredTenants.length === 0 ? (
        filter === 'merged' && !search.trim() ? (
          <EmptyState
            title="No merged tenants yet"
            body="A tenant shows up here once it groups more than one organization."
          />
        ) : (
          <EmptyState title="No matches" body={`No tenant matches “${search.trim()}”.`} />
        )
      ) : (
        <div className="border-grey-border bg-surface-card overflow-hidden rounded-lg border">
          <div className="border-grey-border text-grey-secondary grid grid-cols-[auto_minmax(0,1fr)_auto] gap-md border-b px-md py-sm text-xs font-semibold uppercase tracking-wider">
            <span className="sr-only">Select</span>
            <span>Tenant and organizations</span>
            <span className="sr-only">Actions</span>
          </div>
          <ul className="divide-grey-border divide-y">
            {filteredTenants.map((tenant) => (
              <TenantRow
                key={tenant.id}
                tenant={tenant}
                organizations={getOrganizations(tenant.id)}
                selected={selectedIds.includes(tenant.id)}
                onSelectedChange={(checked) => toggleSelection(tenant.id, checked)}
                onRename={() => setRenamingTenant(tenant)}
              />
            ))}
          </ul>
        </div>
      )}

      {selectedTenants.length >= MIN_TENANTS_TO_MERGE ? (
        <SelectionBar count={selectedTenants.length} onClear={clearSelection} onMerge={() => setIsMerging(true)} />
      ) : null}

      <RenameTenantModal
        tenant={renamingTenant}
        onOpenChange={(open) => (open ? undefined : setRenamingTenant(null))}
      />
      <MergeTenantsModal
        tenants={selectedTenants}
        organizationsByTenant={organizationsByTenant}
        open={isMerging}
        onOpenChange={setIsMerging}
        onSettled={clearSelection}
      />
    </div>
  );
}

function TenantRow({
  tenant,
  organizations,
  selected,
  onSelectedChange,
  onRename,
}: {
  tenant: Tenant;
  organizations: TenantOrganization[];
  selected: boolean;
  onSelectedChange: (checked: boolean) => void;
  onRename: () => void;
}) {
  const checkboxName = `select-tenant-${tenant.id}`;

  return (
    <li className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-md px-md py-md hover:bg-surface-row-hover">
      <Checkbox
        name={checkboxName}
        size="small"
        checked={selected}
        onCheckedChange={(checked) => onSelectedChange(checked === true)}
        aria-label={`Select ${tenant.name}`}
      />
      <label htmlFor={checkboxName} className="flex min-w-0 cursor-pointer flex-col gap-2xs">
        <span className="flex min-w-0 items-center gap-sm">
          <span className="text-grey-primary truncate text-s font-medium">{tenant.name}</span>
          {isMergedTenant(organizations) ? (
            <Tag color="purple" size="xs">
              Merged
            </Tag>
          ) : null}
        </span>
        <span className="text-grey-placeholder truncate font-mono text-2xs">{tenant.id}</span>
        <OrganizationTags organizations={organizations} />
      </label>
      <Button variant="secondary" size="small" onClick={onRename}>
        <Icon icon="edit-square" className="size-4" />
        Rename
      </Button>
    </li>
  );
}

function OrganizationTags({ organizations }: { organizations: TenantOrganization[] }) {
  if (organizations.length === 0) {
    return <span className="text-grey-placeholder pt-xs text-xs">No organizations</span>;
  }

  return (
    <span className="flex flex-wrap items-center gap-xs pt-xs">
      <span className="text-grey-secondary text-xs">
        {organizations.length} {organizations.length === 1 ? 'organization' : 'organizations'}:
      </span>
      {organizations.map((organization) => (
        <Tag key={organization.id} color="white" size="small" title={organization.id}>
          {organization.name}
        </Tag>
      ))}
    </span>
  );
}

function SelectionBar({ count, onClear, onMerge }: { count: number; onClear: () => void; onMerge: () => void }) {
  return (
    <div className="sticky bottom-lg z-10 mx-auto flex w-fit items-center gap-lg rounded-xl border border-grey-border bg-surface-card px-lg py-sm shadow-[0px_8px_24px_-8px_rgba(0,0,0,0.12)]">
      <span className="text-grey-primary text-s font-medium">{count} tenants selected</span>
      <div className="flex items-center gap-sm">
        <Button variant="secondary" size="small" onClick={onClear}>
          Clear
        </Button>
        <Button variant="primary" size="small" onClick={onMerge}>
          Merge…
        </Button>
      </div>
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="border-grey-border bg-surface-card flex flex-col items-center gap-xs rounded-lg border border-dashed p-2xl text-center">
      <Typo variant="subtitle1">{title}</Typo>
      <p className="text-grey-secondary text-s">{body}</p>
    </div>
  );
}

function TenantsSkeleton() {
  return (
    <div className="flex flex-col gap-md">
      <div className="bg-grey-background-light h-10 w-100 max-w-full animate-pulse rounded-md" />
      <div className="border-grey-border bg-surface-card divide-grey-border flex flex-col divide-y overflow-hidden rounded-lg border">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center gap-md p-md">
            <div className="bg-grey-background-light size-4 animate-pulse rounded-sm" />
            <div className="flex flex-col gap-xs">
              <div className="bg-grey-background-light h-3.5 w-40 animate-pulse rounded" />
              <div className="bg-grey-background-light h-2.5 w-64 animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
