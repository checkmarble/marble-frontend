import { makeQueryErrorComponent } from '@bo/components/common/ErrorComponent';
import { SuspenseQuery } from '@bo/components/core/SuspenseQuery';
import { createLicense, listLicensesQueryOptions, updateLicense } from '@bo/data/licenses';
import { licensePayloadSchema } from '@bo/server-fns/licenses';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import type { LicenseDto, LicenseEntitlementsDto } from 'marble-api/generated/backoffice-api';
import { type ReactNode, useMemo, useState } from 'react';
import { Button, cn, Input, MenuCommand, Panel, Switch, Tag, TextArea, Typo } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod/v4';

/* ---------------------------------- Domain --------------------------------- */

const EXPIRING_SOON_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

type EntitlementKey = keyof LicenseEntitlementsDto;

const ENTITLEMENT_GROUPS: { title: string; items: { key: EntitlementKey; label: string }[] }[] = [
  {
    title: 'Platform',
    items: [
      { key: 'sso', label: 'SSO' },
      { key: 'user_roles', label: 'User roles' },
      { key: 'webhooks', label: 'Webhooks' },
      { key: 'analytics', label: 'Analytics' },
      { key: 'workflows', label: 'Workflows' },
      { key: 'rule_snoozes', label: 'Rule snoozes' },
      { key: 'test_run', label: 'Test run' },
      { key: 'data_enrichment', label: 'Data enrichment' },
      { key: 'user_scoring', label: 'User scoring' },
    ],
  },
  {
    title: 'Screening',
    items: [
      { key: 'sanctions', label: 'Sanctions' },
      { key: 'continuous_screening', label: 'Continuous screening' },
      { key: 'lexisnexis', label: 'LexisNexis' },
    ],
  },
  {
    title: 'Cases',
    items: [
      { key: 'auto_assignment', label: 'Auto-assignment' },
      { key: 'case_ai_assist', label: 'Case AI assist' },
    ],
  },
];

const ENTITLEMENT_KEYS = ENTITLEMENT_GROUPS.flatMap((group) => group.items.map((item) => item.key));
const ENTITLEMENT_TOTAL = ENTITLEMENT_KEYS.length;

const emptyEntitlements = (): LicenseEntitlementsDto =>
  Object.fromEntries(ENTITLEMENT_KEYS.map((key) => [key, false])) as LicenseEntitlementsDto;

function enabledCount(entitlements: LicenseEntitlementsDto) {
  return ENTITLEMENT_KEYS.reduce((count, key) => count + (entitlements[key] ? 1 : 0), 0);
}

type LicenseStatus = 'active' | 'expiring' | 'expired' | 'suspended';

function getStatus(license: LicenseDto, now: number): LicenseStatus {
  if (license.suspended_at) return 'suspended';
  const expiresAt = new Date(license.expiration_date).getTime();
  if (expiresAt < now) return 'expired';
  if (expiresAt < now + EXPIRING_SOON_DAYS * DAY_MS) return 'expiring';
  return 'active';
}

const STATUS_TAG: Record<LicenseStatus, { label: string; color: 'green' | 'yellow' | 'red' | 'grey' }> = {
  active: { label: 'Active', color: 'green' },
  expiring: { label: 'Expiring soon', color: 'yellow' },
  expired: { label: 'Expired', color: 'red' },
  suspended: { label: 'Suspended', color: 'grey' },
};

/* -------------------------------- Formatting ------------------------------- */

const dateFormatter = new Intl.DateTimeFormat('en', { day: '2-digit', month: 'short', year: 'numeric' });
const relativeFormatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

function formatDate(iso: string) {
  return dateFormatter.format(new Date(iso));
}

function formatRelative(iso: string, now: number) {
  const days = Math.round((new Date(iso).getTime() - now) / DAY_MS);
  if (Math.abs(days) >= 60) return relativeFormatter.format(Math.round(days / 30), 'month');
  if (Math.abs(days) >= 1) return relativeFormatter.format(days, 'day');
  return 'today';
}

/* ---------------------------------- Page ----------------------------------- */

const LicensesError = makeQueryErrorComponent(
  <span className="text-grey-secondary text-s">Could not load licences.</span>,
);

type PanelState = { mode: 'create' } | { mode: 'edit'; license: LicenseDto } | null;

export function LicensesPage() {
  const [panel, setPanel] = useState<PanelState>(null);

  return (
    <div className="flex flex-col gap-lg pb-xl">
      <div className="flex flex-wrap items-start justify-between gap-md">
        <div className="flex flex-col gap-xs">
          <Typo variant="title1">Licences</Typo>
          <p className="text-grey-secondary text-s">
            Issue, inspect and revoke the license keys that unlock Marble for each customer.
          </p>
        </div>
        <Button size="large" variant="primary" onClick={() => setPanel({ mode: 'create' })}>
          <Icon icon="plus" className="size-4" />
          Create licence
        </Button>
      </div>

      <SuspenseQuery query={listLicensesQueryOptions()} fallback={<LicensesSkeleton />} errorComponent={LicensesError}>
        {(licenses) => <LicensesList licenses={licenses} onEdit={(license) => setPanel({ mode: 'edit', license })} />}
      </SuspenseQuery>

      <LicensePanel state={panel} onOpenChange={(open) => (open ? null : setPanel(null))} />
    </div>
  );
}

/* ---------------------------------- List ----------------------------------- */

function LicensesList({ licenses, onEdit }: { licenses: LicenseDto[]; onEdit: (license: LicenseDto) => void }) {
  const now = Date.now();
  const [search, setSearch] = useState('');

  const sections = useMemo(() => {
    const term = search.trim().toLowerCase();
    const matched = term
      ? licenses.filter(
          (license) =>
            license.organization_name.toLowerCase().includes(term) || license.description.toLowerCase().includes(term),
        )
      : licenses;

    const attention: LicenseDto[] = [];
    const active: LicenseDto[] = [];
    const suspended: LicenseDto[] = [];
    for (const license of matched) {
      const status = getStatus(license, now);
      if (status === 'suspended') suspended.push(license);
      else if (status === 'expired' || status === 'expiring') attention.push(license);
      else active.push(license);
    }

    const byExpiry = (a: LicenseDto, b: LicenseDto) =>
      new Date(a.expiration_date).getTime() - new Date(b.expiration_date).getTime();
    const byName = (a: LicenseDto, b: LicenseDto) => a.organization_name.localeCompare(b.organization_name);

    return {
      matched,
      attention: attention.sort(byExpiry),
      active: active.sort(byName),
      suspended: suspended.sort(byName),
    };
  }, [licenses, search, now]);

  if (licenses.length === 0) {
    return <EmptyState title="No licences yet" body="Create the first licence to grant a customer access to Marble." />;
  }

  return (
    <div className="flex flex-col gap-lg">
      <div className="max-w-100">
        <Input
          startAdornment="search"
          endAdornment={search ? 'cross' : undefined}
          onEndAdornmentClick={() => setSearch('')}
          placeholder="Search by organisation or description"
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
          aria-label="Search licences"
        />
      </div>

      {sections.matched.length === 0 ? (
        <EmptyState title="No matches" body={`No licence matches “${search.trim()}”.`} />
      ) : (
        <div className="flex flex-col gap-xl">
          <LicenseSection
            title="Expiring soon & expired"
            icon="warning"
            tone="attention"
            licenses={sections.attention}
            now={now}
            onEdit={onEdit}
          />
          <LicenseSection title="Active" licenses={sections.active} now={now} onEdit={onEdit} />
          <LicenseSection title="Suspended" licenses={sections.suspended} now={now} onEdit={onEdit} />
        </div>
      )}
    </div>
  );
}

function LicenseSection({
  title,
  icon,
  tone,
  licenses,
  now,
  onEdit,
}: {
  title: string;
  icon?: 'warning';
  tone?: 'attention';
  licenses: LicenseDto[];
  now: number;
  onEdit: (license: LicenseDto) => void;
}) {
  if (licenses.length === 0) return null;

  return (
    <section className="flex flex-col gap-sm">
      <div className="flex items-center gap-sm">
        {icon ? (
          <Icon
            icon={icon}
            className={cn('size-4', tone === 'attention' ? 'text-red-primary' : 'text-grey-secondary')}
          />
        ) : null}
        <Typo variant="subtitle1">{title}</Typo>
        <span className="text-grey-secondary text-xs tabular-nums">{licenses.length}</span>
      </div>
      <ul className="divide-y divide-grey-border bg-surface-card border-grey-border flex flex-col rounded-lg border">
        {licenses.map((license) => (
          <LicenseRow key={license.id} license={license} now={now} onEdit={() => onEdit(license)} />
        ))}
      </ul>
    </section>
  );
}

function LicenseRow({ license, now, onEdit }: { license: LicenseDto; now: number; onEdit: () => void }) {
  const status = getStatus(license, now);
  const tag = STATUS_TAG[status];
  const count = enabledCount(license.license_entitlements);
  const updateMutation = useMutation(updateLicense());

  const toggleSuspend = (suspend: boolean) =>
    updateMutation.mutate({
      licenseId: license.id,
      payload: {
        expiration_date: license.expiration_date,
        organization_name: license.organization_name,
        description: license.description,
        license_entitlements: license.license_entitlements,
        suspend,
      },
    });

  return (
    <li className="grid grid-cols-1 items-center gap-md p-md sm:grid-cols-[minmax(0,2.5fr)_auto_auto_auto_auto]">
      <div className="flex min-w-0 flex-col">
        <span className="text-grey-primary truncate text-s font-medium">{license.organization_name}</span>
        {license.description ? (
          <span className="text-grey-secondary truncate text-xs">{license.description}</span>
        ) : null}
      </div>

      <Tag color={tag.color} size="small" className="justify-self-start sm:justify-self-center">
        {tag.label}
      </Tag>

      <span className="text-grey-secondary text-xs tabular-nums sm:text-center">
        {count}/{ENTITLEMENT_TOTAL} enabled
      </span>

      <span className="flex flex-col sm:items-end">
        <span className="text-grey-primary text-s tabular-nums">{formatDate(license.expiration_date)}</span>
        <span className={cn('text-xs', status === 'expired' ? 'text-red-primary' : 'text-grey-placeholder')}>
          {status === 'expired' ? 'Expired ' : 'Expires '}
          {formatRelative(license.expiration_date, now)}
        </span>
      </span>

      <div className="flex items-center gap-xs justify-self-start sm:justify-self-end">
        <SecretValue value={license.key} />
        <Button variant="secondary" size="small" onClick={onEdit}>
          <Icon icon="edit-square" className="size-4" />
          Edit
        </Button>
        <MenuCommand.Menu>
          <MenuCommand.Trigger>
            <Button variant="secondary" size="small" mode="icon" appearance="stroked" aria-label="More actions">
              <Icon icon="dots-three" className="size-4" />
            </Button>
          </MenuCommand.Trigger>
          <MenuCommand.Content sideOffset={4} align="end">
            <MenuCommand.List>
              {license.suspended_at ? (
                <MenuCommand.Item value="reactivate" onSelect={() => toggleSuspend(false)}>
                  Reactivate
                </MenuCommand.Item>
              ) : (
                <MenuCommand.Item value="suspend" onSelect={() => toggleSuspend(true)}>
                  Suspend
                </MenuCommand.Item>
              )}
            </MenuCommand.List>
          </MenuCommand.Content>
        </MenuCommand.Menu>
      </div>
    </li>
  );
}

/* ------------------------------- Secret value ------------------------------ */

function SecretValue({
  value,
  defaultRevealed = false,
  className,
}: {
  value: string;
  defaultRevealed?: boolean;
  className?: string;
}) {
  const [revealed, setRevealed] = useState(defaultRevealed);
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <span
      className={cn(
        'border-grey-border bg-surface-page inline-flex items-center gap-xs rounded-md border px-sm py-xs',
        className,
      )}
    >
      <span
        className={cn('text-grey-primary font-mono text-xs', revealed ? 'min-w-0 flex-1 truncate' : 'tracking-widest')}
      >
        {revealed ? value : '••••••••'}
      </span>
      <button
        type="button"
        onClick={() => setRevealed((current) => !current)}
        aria-label={revealed ? 'Hide license key' : 'Reveal license key'}
        className="text-grey-secondary hover:text-grey-primary transition-colors"
      >
        <Icon icon={revealed ? 'eye-slash' : 'eye'} className="size-4" />
      </button>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? 'Copied' : 'Copy license key'}
        className={cn(
          'transition-colors',
          copied ? 'text-green-primary' : 'text-grey-secondary hover:text-grey-primary',
        )}
      >
        <Icon icon={copied ? 'tick' : 'copy'} className="size-4" />
      </button>
    </span>
  );
}

/* ------------------------------ Empty / skeleton --------------------------- */

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="border-grey-border bg-surface-card flex flex-col items-center gap-xs rounded-lg border border-dashed p-2xl text-center">
      <Typo variant="subtitle1">{title}</Typo>
      <p className="text-grey-secondary text-s">{body}</p>
    </div>
  );
}

function LicensesSkeleton() {
  return (
    <div className="flex flex-col gap-lg">
      <div className="bg-grey-background-light h-10 w-100 max-w-full animate-pulse rounded-md" />
      <ul className="divide-y divide-grey-border bg-surface-card border-grey-border flex flex-col rounded-lg border">
        {Array.from({ length: 4 }).map((_, index) => (
          <li key={index} className="flex items-center justify-between gap-md p-md">
            <div className="flex flex-col gap-xs">
              <div className="bg-grey-background-light h-3.5 w-40 animate-pulse rounded" />
              <div className="bg-grey-background-light h-2.5 w-24 animate-pulse rounded" />
            </div>
            <div className="bg-grey-background-light h-6 w-20 animate-pulse rounded-full" />
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------- Create / edit ----------------------------- */

const licenseFormSchema = licensePayloadSchema.extend({
  expiration_date: z.string().min(1, 'An expiration date is required.'),
});

type LicenseFormValues = z.infer<typeof licenseFormSchema>;

const FORM_ID = 'license-form';

function toDateInputValue(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function LicensePanel({ state, onOpenChange }: { state: PanelState; onOpenChange: (open: boolean) => void }) {
  return (
    <Panel.Root open={state !== null} onOpenChange={onOpenChange}>
      <Panel.Container size="medium">
        <Panel.Content>
          {state ? <LicensePanelBody state={state} onClose={() => onOpenChange(false)} /> : null}
        </Panel.Content>
      </Panel.Container>
    </Panel.Root>
  );
}

function LicensePanelBody({ state, onClose }: { state: NonNullable<PanelState>; onClose: () => void }) {
  const isEdit = state.mode === 'edit';
  const existing = isEdit ? state.license : null;

  const createMutation = useMutation(createLicense());
  const updateMutation = useMutation(updateLicense());
  const [suspend, setSuspend] = useState(Boolean(existing?.suspended_at));
  const [createdLicense, setCreatedLicense] = useState<LicenseDto | null>(null);

  const form = useForm({
    defaultValues: {
      organization_name: existing?.organization_name ?? '',
      description: existing?.description ?? '',
      expiration_date: existing ? toDateInputValue(existing.expiration_date) : '',
      license_entitlements: existing?.license_entitlements ?? emptyEntitlements(),
    } as LicenseFormValues,
    validators: {
      onMount: licenseFormSchema,
      onChange: licenseFormSchema,
      onSubmit: licenseFormSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      if (!formApi.state.isValid) return;
      const payload = {
        ...value,
        expiration_date: new Date(value.expiration_date).toISOString(),
      };
      if (existing) {
        await updateMutation.mutateAsync({ licenseId: existing.id, payload: { ...payload, suspend } });
        onClose();
      } else {
        const created = await createMutation.mutateAsync(payload);
        setCreatedLicense(created);
      }
    },
  });

  if (createdLicense) {
    return <CreatedLicenseStep license={createdLicense} onDone={onClose} />;
  }

  const setAllEntitlements = (enabled: boolean) =>
    form.setFieldValue(
      'license_entitlements',
      Object.fromEntries(ENTITLEMENT_KEYS.map((key) => [key, enabled])) as LicenseEntitlementsDto,
    );

  return (
    <>
      <Panel.Header>
        <div className="flex flex-col">
          <span>{isEdit ? 'Edit licence' : 'Create licence'}</span>
          <p className="text-grey-secondary text-small font-normal">
            {isEdit
              ? 'Update entitlements, expiry, and access for this customer.'
              : 'Grant a customer access to Marble by issuing a new licence key.'}
          </p>
        </div>
      </Panel.Header>

      <form
        id={FORM_ID}
        className="flex flex-col gap-lg"
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          form.handleSubmit();
        }}
      >
        <form.Field name="organization_name">
          {(field) => (
            <Field label="Organisation name">
              <Input
                value={field.state.value}
                onChange={(event) => field.handleChange(event.currentTarget.value)}
                onBlur={field.handleBlur}
                placeholder="Acme Inc."
              />
            </Field>
          )}
        </form.Field>

        <form.Field name="description">
          {(field) => (
            <Field label="Description">
              <TextArea
                value={field.state.value}
                onChange={(event) => field.handleChange(event.currentTarget.value)}
                onBlur={field.handleBlur}
                placeholder="What is this licence for?"
              />
            </Field>
          )}
        </form.Field>

        <form.Field name="expiration_date">
          {(field) => (
            <Field label="Expiration date">
              <Input
                type="date"
                value={field.state.value}
                onChange={(event) => field.handleChange(event.currentTarget.value)}
                onBlur={field.handleBlur}
              />
            </Field>
          )}
        </form.Field>

        <div className="flex flex-col gap-sm">
          <div className="flex items-center justify-between gap-md">
            <span className="text-grey-primary text-s font-medium">Entitlements</span>
            <div className="flex items-center gap-xs">
              <Button variant="secondary" size="small" appearance="link" onClick={() => setAllEntitlements(true)}>
                Enable all
              </Button>
              <span className="text-grey-border">·</span>
              <Button variant="secondary" size="small" appearance="link" onClick={() => setAllEntitlements(false)}>
                Clear
              </Button>
            </div>
          </div>

          <form.Field name="license_entitlements">
            {(field) => (
              <div className="flex flex-col gap-md">
                {ENTITLEMENT_GROUPS.map((group) => (
                  <div key={group.title} className="flex flex-col gap-xs">
                    <span className="text-grey-secondary text-2xs font-semibold uppercase tracking-wider">
                      {group.title}
                    </span>
                    <div className="divide-y divide-grey-border border-grey-border flex flex-col rounded-md border px-md">
                      {group.items.map((item) => (
                        <label key={item.key} className="flex cursor-pointer items-center justify-between gap-md py-sm">
                          <span className="text-grey-primary text-s">{item.label}</span>
                          <Switch
                            checked={field.state.value[item.key]}
                            onCheckedChange={(checked) =>
                              field.handleChange({ ...field.state.value, [item.key]: checked })
                            }
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </form.Field>
        </div>

        {isEdit ? (
          <label className="border-grey-border flex items-center justify-between gap-md rounded-md border px-md py-sm">
            <span className="flex flex-col">
              <span className="text-grey-primary text-s font-medium">Suspend licence</span>
              <span className="text-grey-secondary text-xs">
                Suspended licences stop granting access until reactivated.
              </span>
            </span>
            <Switch checked={suspend} onCheckedChange={setSuspend} />
          </label>
        ) : null}
      </form>

      <Panel.Footer>
        <Panel.FooterButton isCloseButton label="Cancel" />
        <form.Subscribe selector={(formState) => [formState.canSubmit, formState.isDirty] as const}>
          {([canSubmit, isDirty]) => (
            <Panel.FooterButton
              type="submit"
              form={FORM_ID}
              label={isEdit ? 'Save changes' : 'Create licence'}
              variant="primary"
              disabled={!canSubmit || (isEdit && !isDirty && suspend === Boolean(existing?.suspended_at))}
              isLoading={createMutation.isPending || updateMutation.isPending}
            />
          )}
        </form.Subscribe>
      </Panel.Footer>
    </>
  );
}

function CreatedLicenseStep({ license, onDone }: { license: LicenseDto; onDone: () => void }) {
  return (
    <>
      <Panel.Header>
        <div className="flex flex-col">
          <span>Licence created</span>
          <p className="text-grey-secondary text-small font-normal">
            Copy the key now and share it securely — it unlocks Marble for {license.organization_name}.
          </p>
        </div>
      </Panel.Header>

      <div className="flex flex-col gap-md">
        <div className="border-green-border bg-green-background-light text-green-primary flex items-center gap-sm rounded-md border p-md">
          <Icon icon="tick" className="size-5 shrink-0" />
          <span className="text-s">Licence for {license.organization_name} is ready.</span>
        </div>
        <Field label="Licence key">
          <SecretValue value={license.key} defaultRevealed className="w-full" />
        </Field>
      </div>

      <Panel.Footer>
        <Panel.FooterButton label="Done" variant="primary" onClick={onDone} />
      </Panel.Footer>
    </>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-xs">
      <span className="text-grey-primary text-s font-medium">{label}</span>
      {children}
    </label>
  );
}
