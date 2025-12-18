import { makeQueryErrorComponent } from '@bo/components/common/ErrorComponent';
import { SuspenseQuery } from '@bo/components/core/SuspenseQuery';
import { CreateOrganizationPanel } from '@bo/components/organisms/CreateOrganizationPanel';
import { listOrganizationsQueryOptions } from '@bo/data/organization';
import { useRouter } from '@tanstack/react-router';
import { type ReactNode, useState } from 'react';
import {
  Button,
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  Kbd,
  Panel,
  Typo,
} from 'ui-design-system';
import { Icon } from 'ui-icons';

const ErrorComponent = makeQueryErrorComponent(<span>Something went wrong while fetching organizations</span>);

export function DashboardPage() {
  const [isCreatingOrg, setIsCreatingOrg] = useState(false);
  const openCreate = () => setIsCreatingOrg(true);

  return (
    <>
      <SuspenseQuery
        query={listOrganizationsQueryOptions()}
        fallback={
          <LaunchpadColumn>
            <LaunchpadHeader onCreate={openCreate} />
            <LaunchpadSkeleton />
          </LaunchpadColumn>
        }
        errorComponent={ErrorComponent}
      >
        {(organizations) =>
          organizations.length === 0 ? (
            <div className="animate-launchpad-rise flex min-h-[70vh] items-center justify-center">
              <EmptyState onCreate={openCreate} />
            </div>
          ) : (
            <LaunchpadColumn>
              <LaunchpadHeader onCreate={openCreate} />
              <OrganizationLauncher organizations={organizations} onCreate={openCreate} />
            </LaunchpadColumn>
          )
        }
      </SuspenseQuery>

      <Panel.Root open={isCreatingOrg} onOpenChange={setIsCreatingOrg}>
        <CreateOrganizationPanel />
      </Panel.Root>
    </>
  );
}

function LaunchpadColumn({ children }: { children: ReactNode }) {
  return <div className="animate-launchpad-rise mx-auto flex w-full max-w-3xl flex-col gap-lg py-xl">{children}</div>;
}

function LaunchpadHeader({ onCreate }: { onCreate: () => void }) {
  return (
    <header className="flex items-end justify-between gap-lg">
      <div className="flex flex-col gap-xs">
        <Typo variant="title1">Organizations</Typo>
        <span className="text-m text-grey-secondary">Jump to an organization or provision a new one.</span>
      </div>
      <Button variant="primary" size="large" onClick={onCreate}>
        <Icon icon="plus" className="size-5" />
        Create organization
      </Button>
    </header>
  );
}

type Organization = { id: string; name: string };

function OrganizationLauncher({ organizations, onCreate }: { organizations: Organization[]; onCreate: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const openOrganization = (orgId: string) => {
    router.navigate({ to: '/organizations/$orgId', params: { orgId } });
  };

  const sorted = [...organizations].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
  const hasQuery = query.trim().length > 0;

  return (
    <Command
      loop
      className="rounded-xl border-grey-border bg-surface-card p-0 shadow-[0px_8px_24px_-8px_rgba(0,0,0,0.12)]"
    >
      <div className="flex items-center gap-sm border-b border-grey-border px-lg">
        <Icon icon="search" className="size-5 shrink-0 text-grey-secondary" />
        <CommandInput
          autoFocus
          value={query}
          onValueChange={setQuery}
          placeholder="Search organizations by name or ID…"
          className="text-h1 h-14 w-full"
        />
        {query.length > 0 ? (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="text-xs text-grey-secondary transition-colors hover:text-grey-primary"
          >
            Clear
          </button>
        ) : null}
      </div>

      <CommandList className="max-h-105 p-xs">
        {hasQuery ? (
          <CommandEmpty className="w-full">
            <div className="flex w-full flex-col items-center gap-sm px-md py-xl text-center">
              <span className="text-s text-grey-primary">No organization matches your search.</span>
              <Button variant="secondary" size="medium" onClick={onCreate}>
                <Icon icon="plus" className="size-4" />
                Create “{query.trim()}”
              </Button>
            </div>
          </CommandEmpty>
        ) : null}

        {sorted.map((organization) => (
          <CommandItem
            key={organization.id}
            value={`${organization.name} ${organization.id}`}
            onSelect={() => openOrganization(organization.id)}
            className="group gap-md rounded-lg px-md py-sm data-[selected=true]:bg-purple-background-light"
          >
            <span
              aria-hidden
              className="grid size-9 shrink-0 place-content-center rounded-md bg-purple-background text-s font-semibold text-purple-primary"
            >
              {organization.name.charAt(0).toUpperCase()}
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-s font-medium text-grey-primary">{organization.name}</span>
              <span className="truncate font-mono text-xs text-grey-secondary" title={organization.id}>
                {organization.id}
              </span>
            </span>
            <Icon
              icon="arrow-right"
              className="size-5 shrink-0 -translate-x-1 text-purple-primary opacity-0 transition-all group-data-[selected=true]:translate-x-0 group-data-[selected=true]:opacity-100"
            />
          </CommandItem>
        ))}
      </CommandList>

      <div className="flex items-center justify-between border-t border-grey-border px-lg py-sm">
        <div className="flex items-center gap-md text-xs text-grey-secondary">
          <span className="flex items-center gap-xs">
            <Kbd className="text-xs px-xs">↑</Kbd>
            <Kbd className="text-xs px-xs">↓</Kbd>
            to navigate
          </span>
          <span className="flex items-center gap-xs">
            <Kbd className="text-xs px-xs">↵</Kbd>
            to open
          </span>
        </div>
        <span className="text-xs text-grey-secondary">
          {organizations.length} {organizations.length === 1 ? 'organization' : 'organizations'}
        </span>
      </div>
    </Command>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-md rounded-xl border border-dashed border-grey-border bg-surface-card px-lg py-3xl text-center">
      <span
        aria-hidden
        className="grid size-14 place-content-center rounded-xl bg-purple-background text-purple-primary"
      >
        <Icon icon="plus" className="size-7" />
      </span>
      <div className="flex flex-col gap-xs">
        <Typo variant="title2">No organizations yet</Typo>
        <span className="text-m text-grey-secondary">Provision your first customer organization to get started.</span>
      </div>
      <Button variant="primary" size="large" onClick={onCreate} className="mt-sm">
        <Icon icon="plus" className="size-5" />
        Create organization
      </Button>
    </div>
  );
}

function LaunchpadSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-grey-border bg-surface-card">
      <div className="flex items-center gap-sm border-b border-grey-border px-lg">
        <Icon icon="search" className="size-5 shrink-0 text-grey-disabled" />
        <div className="h-14 flex-1" />
      </div>
      <div className="flex flex-col gap-xs p-xs">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex items-center gap-md rounded-lg px-md py-sm">
            <div className="size-9 shrink-0 animate-pulse rounded-md bg-grey-background-light" />
            <div className="flex flex-1 flex-col gap-xs">
              <div
                className="h-3.5 animate-pulse rounded bg-grey-background-light"
                style={{ width: `${45 + ((index * 13) % 35)}%` }}
              />
              <div className="h-2.5 w-1/3 animate-pulse rounded bg-grey-background-light" />
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-grey-border px-lg py-sm">
        <div className="h-3 w-24 animate-pulse rounded bg-grey-background-light" />
      </div>
    </div>
  );
}
