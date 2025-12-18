import { makeQueryErrorComponent } from '@bo/components/common/ErrorComponent';
import { SuspenseQuery } from '@bo/components/core/SuspenseQuery';
import { FeatureAccessPanel } from '@bo/components/organisms/FeatureAccessPanel';
import {
  getOrganizationQueryOptions,
  listOrganizationFeatures,
  listOrganizationUsersQueryOptions,
} from '@bo/data/organization';
import { OVERRIDABLE_FEATURES } from '@bo/schemas/features';
import { Link } from '@tanstack/react-router';
import { OrganizationDto } from 'marble-api';
import { FeatureAccessDto } from 'marble-api/generated/backoffice-api';
import { type ReactNode, useState } from 'react';
import { Button, cn, Tag, Typo } from 'ui-design-system';
import { Icon, type IconName } from 'ui-icons';

export function OrganizationOverviewPage({ orgId }: { orgId: string }) {
  const [editingFeatures, setEditingFeatures] = useState(false);

  return (
    <div className="flex flex-col gap-lg pb-xl">
      <div className="grid grid-cols-1 gap-lg lg:grid-cols-12 lg:items-start">
        <Region title="Configuration" className="lg:col-span-7">
          <SuspenseQuery
            query={getOrganizationQueryOptions(orgId)}
            fallback={<ConfigurationSkeleton />}
            errorComponent={ConfigurationError}
          >
            {(organization) => <ConfigurationFields organization={organization} />}
          </SuspenseQuery>
        </Region>

        <div className="flex flex-col gap-lg lg:col-span-5">
          <Region
            title="People"
            action={
              <JumpLink orgId={orgId} to="/organizations/$orgId/users">
                Manage users
              </JumpLink>
            }
          >
            <SuspenseQuery
              query={listOrganizationUsersQueryOptions(orgId)}
              fallback={<PeopleSkeleton />}
              errorComponent={PeopleError}
            >
              {(users) => <People users={users} orgId={orgId} />}
            </SuspenseQuery>
          </Region>

          <Region
            title="Feature access"
            action={
              <Button variant="secondary" size="small" onClick={() => setEditingFeatures(true)}>
                <Icon icon="edit-square" className="size-4" />
                Edit
              </Button>
            }
          >
            <SuspenseQuery
              query={listOrganizationFeatures(orgId)}
              fallback={<FeaturesSkeleton />}
              errorComponent={FeaturesError}
            >
              {(featureAccess) => <FeatureAccess featureAccess={featureAccess} />}
            </SuspenseQuery>
          </Region>
        </div>
      </div>

      <OperationalData />

      <FeatureAccessPanel orgId={orgId} open={editingFeatures} onOpenChange={setEditingFeatures} />
    </div>
  );
}

/* ------------------------------- Layout shells ------------------------------ */

function Region({
  title,
  action,
  className,
  children,
}: {
  title: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn('flex flex-col gap-md rounded-lg border border-grey-border bg-surface-card p-lg', className)}
    >
      <div className="flex min-h-6 items-center justify-between gap-md">
        <Typo variant="subtitle1">{title}</Typo>
        {action}
      </div>
      {children}
    </section>
  );
}

function JumpLink({ orgId, to, children }: { orgId: string; to: '/organizations/$orgId/users'; children: ReactNode }) {
  return (
    <Link
      to={to}
      params={{ orgId }}
      className="text-purple-primary hover:text-purple-hover inline-flex items-center gap-xs text-s font-medium transition-colors"
    >
      {children}
      <Icon icon="arrow-right" className="size-4" />
    </Link>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return <dt className="text-grey-secondary text-2xs font-semibold uppercase tracking-wider">{children}</dt>;
}

function NotSet() {
  return <span className="text-grey-placeholder">Not set</span>;
}

/* ------------------------------ Configuration ------------------------------ */

const PROVIDER_LABELS: Record<string, string> = {
  opensanctions: 'OpenSanctions',
  lexisnexis: 'LexisNexis',
};

const SCREENING_CHANNELS = [
  { key: 'transaction_monitoring', label: 'Transaction monitoring' },
  { key: 'continuous_monitoring', label: 'Continuous monitoring' },
  { key: 'manual_search', label: 'Manual search' },
] as const;

function ConfigurationFields({ organization }: { organization: OrganizationDto }) {
  const providers = organization.screening_providers;

  return (
    <dl className="grid grid-cols-1 gap-lg sm:grid-cols-2">
      <div className="flex flex-col gap-xs sm:col-span-2">
        <FieldLabel>Organization ID</FieldLabel>
        <dd>
          <CopyableValue value={organization.id} />
        </dd>
      </div>

      <div className="flex flex-col gap-xs">
        <FieldLabel>Default scenario timezone</FieldLabel>
        <dd className="text-grey-primary text-s">{organization.default_scenario_timezone ?? <NotSet />}</dd>
      </div>

      <div className="flex flex-col gap-xs">
        <FieldLabel>Auto-assign queue limit</FieldLabel>
        <dd className="text-grey-primary text-s tabular-nums">{organization.auto_assign_queue_limit ?? <NotSet />}</dd>
      </div>

      <div className="flex flex-col gap-xs">
        <FieldLabel>Sanctions threshold</FieldLabel>
        <dd className="text-grey-primary text-s tabular-nums">{organization.sanctions_threshold ?? <NotSet />}</dd>
      </div>

      <div className="flex flex-col gap-xs">
        <FieldLabel>Sanctions limit</FieldLabel>
        <dd className="text-grey-primary text-s tabular-nums">{organization.sanctions_limit ?? <NotSet />}</dd>
      </div>

      <div className="flex flex-col gap-sm sm:col-span-2">
        <FieldLabel>Screening providers</FieldLabel>
        <dd className="flex flex-col divide-y divide-grey-border rounded-md border border-grey-border">
          {SCREENING_CHANNELS.map(({ key, label }) => {
            const value = providers?.[key];
            return (
              <div key={key} className="flex items-center justify-between gap-md px-md py-sm">
                <span className="text-grey-secondary text-s">{label}</span>
                {value ? (
                  <Tag color="grey" size="small">
                    {PROVIDER_LABELS[value] ?? value}
                  </Tag>
                ) : (
                  <span className="text-grey-placeholder text-s">Not set</span>
                )}
              </div>
            );
          })}
        </dd>
      </div>

      <div className="flex flex-col gap-xs sm:col-span-2">
        <FieldLabel>Allowed networks</FieldLabel>
        <dd className="flex flex-wrap gap-xs">
          {organization.allowed_networks.length > 0 ? (
            organization.allowed_networks.map((network) => (
              <Tag key={network} color="grey" size="small" appearance="monospace">
                {network}
              </Tag>
            ))
          ) : (
            <span className="text-grey-placeholder text-s">None</span>
          )}
        </dd>
      </div>
    </dl>
  );
}

function CopyableValue({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? 'Copied to clipboard' : `Copy ${value} to clipboard`}
      className="group border-grey-border bg-surface-page hover:bg-grey-background-light inline-flex max-w-full items-center gap-sm rounded-md border px-sm py-xs transition-colors"
    >
      <span className="text-grey-primary truncate font-mono text-xs">{value}</span>
      <Icon
        icon={copied ? 'tick' : 'copy'}
        className={cn(
          'size-4 shrink-0 transition-colors',
          copied ? 'text-green-primary' : 'text-grey-secondary group-hover:text-grey-primary',
        )}
      />
    </button>
  );
}

/* --------------------------------- People ---------------------------------- */

type OrgUser = {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
};

const ROSTER_PREVIEW = 5;

function humanizeRole(role: string) {
  return role.charAt(0) + role.slice(1).toLowerCase();
}

function People({ users, orgId }: { users: OrgUser[]; orgId: string }) {
  if (users.length === 0) {
    return (
      <div className="flex flex-col items-start gap-sm py-sm">
        <span className="text-grey-secondary text-s">No users have access to this organization yet.</span>
        <JumpLink orgId={orgId} to="/organizations/$orgId/users">
          Add the first user
        </JumpLink>
      </div>
    );
  }

  const roleCounts = users.reduce<Record<string, number>>((acc, user) => {
    acc[user.role] = (acc[user.role] ?? 0) + 1;
    return acc;
  }, {});

  const preview = users.slice(0, ROSTER_PREVIEW);
  const remaining = users.length - preview.length;

  return (
    <div className="flex flex-col gap-md">
      <div className="flex flex-wrap items-baseline gap-x-sm gap-y-xs">
        <span className="text-grey-primary text-l font-semibold tabular-nums">{users.length}</span>
        <span className="text-grey-secondary text-s">{users.length === 1 ? 'user' : 'users'}</span>
        <div className="ml-auto flex flex-wrap justify-end gap-xs">
          {Object.entries(roleCounts).map(([role, count]) => (
            <Tag key={role} color="grey" size="small">
              {humanizeRole(role)} · {count}
            </Tag>
          ))}
        </div>
      </div>

      <ul className="flex flex-col divide-y divide-grey-border rounded-md border border-grey-border">
        {preview.map((user) => {
          const fullName = `${user.first_name} ${user.last_name}`.trim();
          const monogram = (user.first_name || user.email).charAt(0).toUpperCase();
          return (
            <li key={user.user_id} className="flex items-center gap-md px-md py-sm">
              <span
                aria-hidden
                className="bg-purple-background text-purple-primary grid size-8 shrink-0 place-content-center rounded-md text-xs font-semibold"
              >
                {monogram}
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-grey-primary truncate text-s font-medium">{fullName || user.email}</span>
                <span className="text-grey-secondary truncate text-xs">{user.email}</span>
              </span>
              <span className="text-grey-secondary shrink-0 text-xs">{humanizeRole(user.role)}</span>
            </li>
          );
        })}
      </ul>

      {remaining > 0 ? (
        <JumpLink orgId={orgId} to="/organizations/$orgId/users">
          View all {users.length} users
        </JumpLink>
      ) : null}
    </div>
  );
}

/* ----------------------------- Feature access ------------------------------ */

const FEATURE_STATE: Record<string, { label: string; color: 'green' | 'yellow' | 'grey' | 'red' }> = {
  allowed: { label: 'Allowed', color: 'green' },
  test: { label: 'Test', color: 'yellow' },
  restricted: { label: 'Restricted', color: 'grey' },
  missing_configuration: { label: 'Not configured', color: 'red' },
};

function humanizeFeatureName(featureName: string) {
  return featureName
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function FeatureAccess({ featureAccess }: { featureAccess: FeatureAccessDto }) {
  return (
    <ul className="flex flex-col divide-y divide-grey-border">
      {OVERRIDABLE_FEATURES.map((feature) => {
        const value = featureAccess[feature];
        const state = FEATURE_STATE[value] ?? { label: value, color: 'grey' as const };
        return (
          <li key={feature} className="flex items-center justify-between gap-md py-sm first:pt-0 last:pb-0">
            <span className="text-grey-primary text-s">{humanizeFeatureName(feature)}</span>
            <Tag color={state.color} size="small">
              {state.label}
            </Tag>
          </li>
        );
      })}
    </ul>
  );
}

/* --------------------------- Operational data ------------------------------ */

const OPERATIONAL_SLOTS: { icon: IconName; label: string }[] = [
  { icon: 'version', label: 'Live scenario versions' },
  { icon: 'decision', label: 'Decisions' },
  { icon: 'lock', label: 'API keys' },
];

function OperationalData() {
  return (
    <section className="flex flex-col gap-md rounded-lg border border-grey-border bg-surface-card p-lg">
      <div className="flex flex-col gap-xs">
        <Typo variant="subtitle1">Operational data</Typo>
        <span className="text-grey-secondary text-s">
          Not yet available per organization — coming with org-scoped reporting.
        </span>
      </div>
      <div className="grid grid-cols-1 divide-y divide-grey-border rounded-md border border-grey-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {OPERATIONAL_SLOTS.map(({ icon, label }) => (
          <div key={label} className="flex items-center gap-md px-md py-md">
            <span
              aria-hidden
              className="bg-grey-background text-grey-disabled grid size-9 shrink-0 place-content-center rounded-md"
            >
              <Icon icon={icon} className="size-5" />
            </span>
            <span className="flex flex-col">
              <span className="text-grey-secondary text-s font-medium">{label}</span>
              <span className="text-grey-placeholder text-xs">Coming soon</span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------- Skeletons -------------------------------- */

function SkeletonBar({ className }: { className?: string }) {
  return <div className={cn('bg-grey-background-light animate-pulse rounded', className)} />;
}

function ConfigurationSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-lg sm:grid-cols-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className={cn('flex flex-col gap-xs', index === 0 && 'sm:col-span-2')}>
          <SkeletonBar className="h-2.5 w-24" />
          <SkeletonBar className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  );
}

function PeopleSkeleton() {
  return (
    <div className="flex flex-col gap-md">
      <SkeletonBar className="h-5 w-20" />
      <div className="flex flex-col gap-sm rounded-md border border-grey-border p-md">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex items-center gap-md">
            <SkeletonBar className="size-8 rounded-md" />
            <div className="flex flex-1 flex-col gap-xs">
              <SkeletonBar className="h-3.5 w-1/2" />
              <SkeletonBar className="h-2.5 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeaturesSkeleton() {
  return (
    <div className="flex flex-col gap-md">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center justify-between gap-md">
          <SkeletonBar className="h-3.5 w-32" />
          <SkeletonBar className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

/* ------------------------------ Error states ------------------------------- */

const ConfigurationError = makeQueryErrorComponent(
  <span className="text-grey-secondary text-s">Could not load configuration.</span>,
);
const PeopleError = makeQueryErrorComponent(<span className="text-grey-secondary text-s">Could not load users.</span>);
const FeaturesError = makeQueryErrorComponent(
  <span className="text-grey-secondary text-s">Could not load feature access.</span>,
);
