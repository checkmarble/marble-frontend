import { makeQueryErrorComponent } from '@bo/components/common/ErrorComponent';
import { SuspenseQuery } from '@bo/components/core/SuspenseQuery';
import { applyOrganizationArchetype, createEmptyOrganization, listOrganizationArchetypes } from '@bo/data/organization';
import { orgImportSpecSchema } from '@bo/schemas/org-import';
import { createEmptyOrganizationFnInputSchema } from '@bo/server-fns/organization';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import type { ArchetypeDto } from 'marble-api/generated/marblecore-api';
import { type ReactNode, useState } from 'react';
import { useDropzone } from 'react-dropzone-esm';
import { Button, cn, Input } from 'ui-design-system';
import { Icon, type IconName } from 'ui-icons';
import { z } from 'zod/v4';
import { OrganizationCreationFlow } from './types';

export const MAX_FILE_SIZE_MB = 20;
export const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

type MethodKey = 'upload' | 'archetype' | 'empty';

const METHODS: { key: MethodKey; icon: IconName; title: string; description: string }[] = [
  {
    key: 'upload',
    icon: 'upload',
    title: 'From a data upload',
    description: 'Provision a fully configured org from a JSON import spec.',
  },
  {
    key: 'archetype',
    icon: 'category',
    title: 'From an archetype',
    description: 'Start from a predefined organization template.',
  },
  {
    key: 'empty',
    icon: 'plus',
    title: 'Empty organization',
    description: 'Create a blank org with just a name, then configure it later.',
  },
];

export const ChoiceStep = ({ onChooseFlow }: { onChooseFlow: (flow: OrganizationCreationFlow) => void }) => {
  const [selected, setSelected] = useState<MethodKey>('upload');

  return (
    <div role="radiogroup" aria-label="How to create the organization" className="flex flex-col gap-sm pt-sm">
      {METHODS.map((method) => (
        <MethodRow
          key={method.key}
          method={method}
          active={selected === method.key}
          onSelect={() => setSelected(method.key)}
        >
          {method.key === 'upload' ? <UploadMethod onChooseFlow={onChooseFlow} /> : null}
          {method.key === 'archetype' ? <ArchetypeMethod /> : null}
          {method.key === 'empty' ? <EmptyMethod /> : null}
        </MethodRow>
      ))}
    </div>
  );
};

function MethodRow({
  method,
  active,
  onSelect,
  children,
}: {
  method: (typeof METHODS)[number];
  active: boolean;
  onSelect: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        'rounded-lg border transition-colors',
        active ? 'border-purple-primary bg-purple-background-light' : 'border-grey-border bg-surface-card',
      )}
    >
      <button
        type="button"
        role="radio"
        aria-checked={active}
        onClick={onSelect}
        className="flex w-full items-center gap-md p-md text-left"
      >
        <span
          aria-hidden
          className={cn(
            'grid size-9 shrink-0 place-content-center rounded-md transition-colors',
            active ? 'bg-purple-primary text-grey-white' : 'bg-grey-background text-grey-secondary',
          )}
        >
          <Icon icon={method.icon} className="size-5" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-grey-primary text-s font-medium">{method.title}</span>
          <span className="text-grey-secondary text-xs">{method.description}</span>
        </span>
        <Icon
          icon="arrow-down"
          aria-hidden
          className={cn('text-grey-secondary size-4 shrink-0 transition-transform', active ? 'rotate-180' : 'rotate-0')}
        />
      </button>
      {active ? <div className="border-grey-border border-t p-md">{children}</div> : null}
    </div>
  );
}

/* --------------------------------- Upload ---------------------------------- */

function UploadMethod({ onChooseFlow }: { onChooseFlow: (flow: OrganizationCreationFlow) => void }) {
  const [error, setError] = useState<string | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles, fileRejections) => {
      setError(null);
      if (fileRejections.length > 0) {
        setError(`Upload a single JSON file under ${MAX_FILE_SIZE_MB} MB.`);
        return;
      }
      const file = acceptedFiles[0];
      if (!file) return;

      try {
        const data = JSON.parse(await file.text());
        const parsed = orgImportSpecSchema.safeParse(data);
        if (parsed.success) {
          onChooseFlow({ type: 'import', data: parsed.data });
        } else {
          // Surface the offending paths — a generic message here makes a spec produced by a
          // newer backend indistinguishable from a corrupt file.
          console.error('Invalid organization import spec', parsed.error.issues);
          setError(`This file isn’t a valid organization import spec.\n${z.prettifyError(parsed.error)}`);
        }
      } catch {
        setError('This file isn’t valid JSON.');
      }
    },
    accept: { 'application/json': ['.json'] },
    multiple: false,
    maxSize: MAX_FILE_SIZE,
  });

  return (
    <div className="flex flex-col gap-sm">
      <div
        {...getRootProps()}
        className={cn(
          'flex min-h-40 cursor-pointer flex-col items-center justify-center gap-xs rounded-md border border-dashed p-lg text-center transition-colors',
          isDragActive
            ? 'border-purple-primary bg-purple-background-light'
            : 'border-grey-border hover:border-purple-secondary',
        )}
      >
        <input {...getInputProps()} />
        <span aria-hidden className="bg-surface-card text-grey-secondary grid size-10 place-content-center rounded-md">
          <Icon icon="upload" className="size-5" />
        </span>
        <span className="text-grey-primary text-s font-medium">
          {isDragActive ? 'Drop the file to import' : 'Drag a JSON import spec here'}
        </span>
        <span className="text-grey-secondary text-xs">
          or click to browse · JSON only · up to {MAX_FILE_SIZE_MB} MB
        </span>
      </div>
      {error ? (
        <p role="alert" className="text-red-primary flex items-start gap-xs text-s">
          <Icon icon="warning" className="mt-px size-4 shrink-0" />
          <span className="whitespace-pre-line">{error}</span>
        </p>
      ) : null}
    </div>
  );
}

/* -------------------------------- Archetype -------------------------------- */

const ArchetypesError = makeQueryErrorComponent(
  <span className="text-grey-secondary text-s">Could not load archetypes.</span>,
);

function ArchetypeMethod() {
  return (
    <SuspenseQuery
      query={listOrganizationArchetypes()}
      fallback={<ArchetypesSkeleton />}
      errorComponent={ArchetypesError}
    >
      {(archetypes) => <ArchetypeStep archetypes={archetypes} />}
    </SuspenseQuery>
  );
}

const archetypeFormSchema = z.object({
  org_name: z.string().min(1, 'An organisation name is required.'),
  admins: z
    .array(
      z.object({
        email: z.email('Enter a valid email address.'),
        first_name: z.string().optional(),
        last_name: z.string().optional(),
      }),
    )
    .min(1),
});

type ArchetypeFormValues = z.infer<typeof archetypeFormSchema>;

function firstError(errors: unknown[]): string | null {
  for (const error of errors) {
    if (typeof error === 'string') return error;
    if (error && typeof error === 'object' && 'message' in error) {
      return String((error as { message: unknown }).message);
    }
  }
  return null;
}

function ErrorText({ children }: { children: ReactNode }) {
  if (!children) return null;
  return <span className="text-red-primary text-xs">{children}</span>;
}

function ArchetypeStep({ archetypes }: { archetypes: ArchetypeDto[] }) {
  const router = useRouter();
  const applyMutation = useMutation(applyOrganizationArchetype());
  const [selected, setSelected] = useState<string | null>(archetypes[0]?.name ?? null);

  const form = useForm({
    defaultValues: {
      org_name: '',
      admins: [{ email: '', first_name: '', last_name: '' }],
    } as ArchetypeFormValues,
    validators: {
      onMount: archetypeFormSchema,
      onChange: archetypeFormSchema,
      onSubmit: archetypeFormSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      if (!selected || !formApi.state.isValid) return;
      const { orgId } = await applyMutation.mutateAsync({
        name: selected,
        org_name: value.org_name,
        admins: value.admins,
      });
      router.navigate({ to: '/organizations/$orgId', params: { orgId } });
    },
  });

  if (archetypes.length === 0) {
    return <p className="text-grey-secondary py-sm text-s">No archetypes are available yet.</p>;
  }

  return (
    <div className="flex flex-col gap-md">
      <div role="radiogroup" aria-label="Archetype" className="flex flex-col gap-xs">
        {archetypes.map((archetype) => {
          const active = selected === archetype.name;
          return (
            <button
              key={archetype.name}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setSelected(archetype.name)}
              className={cn(
                'flex flex-col gap-2xs rounded-md border p-md text-left transition-colors',
                active ? 'border-purple-primary bg-purple-background-light' : 'border-grey-border bg-surface-card',
              )}
            >
              <span className="text-grey-primary text-s font-medium">{archetype.label ?? archetype.name}</span>
              {archetype.description ? (
                <span className="text-grey-secondary text-xs">{archetype.description}</span>
              ) : null}
            </button>
          );
        })}
      </div>

      <form
        className="flex flex-col gap-md"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <form.Field name="org_name">
          {(field) => (
            <label className="flex flex-col gap-xs">
              <span className="text-grey-primary text-s font-medium">Organisation name</span>
              <Input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="Acme Inc."
              />
              {field.state.meta.isTouched ? <ErrorText>{firstError(field.state.meta.errors)}</ErrorText> : null}
            </label>
          )}
        </form.Field>

        <form.Field name="admins" mode="array">
          {(adminsField) => (
            <div className="flex flex-col gap-sm">
              <div className="flex items-center justify-between">
                <span className="text-grey-primary text-s font-medium">Admins</span>
                <Button
                  variant="secondary"
                  size="small"
                  appearance="link"
                  onClick={() => adminsField.pushValue({ email: '', first_name: '', last_name: '' })}
                >
                  <Icon icon="plus" className="size-4" />
                  Add admin
                </Button>
              </div>

              {adminsField.state.value.map((_, index) => (
                <div key={index} className="border-grey-border flex flex-col gap-xs rounded-md border p-sm">
                  <div className="flex items-start gap-xs">
                    <form.Field name={`admins[${index}].email`}>
                      {(field) => (
                        <div className="flex flex-1 flex-col gap-2xs">
                          <Input
                            type="email"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                            placeholder="admin@company.com"
                          />
                          {field.state.meta.isTouched ? (
                            <ErrorText>{firstError(field.state.meta.errors)}</ErrorText>
                          ) : null}
                        </div>
                      )}
                    </form.Field>
                    {adminsField.state.value.length > 1 ? (
                      <Button
                        variant="secondary"
                        size="large"
                        mode="icon"
                        appearance="stroked"
                        onClick={() => adminsField.removeValue(index)}
                        aria-label="Remove admin"
                      >
                        <Icon icon="cross" className="size-4" />
                      </Button>
                    ) : null}
                  </div>
                  <div className="flex gap-xs">
                    <form.Field name={`admins[${index}].first_name`}>
                      {(field) => (
                        <Input
                          className="flex-1"
                          value={field.state.value ?? ''}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="First name (optional)"
                        />
                      )}
                    </form.Field>
                    <form.Field name={`admins[${index}].last_name`}>
                      {(field) => (
                        <Input
                          className="flex-1"
                          value={field.state.value ?? ''}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder="Last name (optional)"
                        />
                      )}
                    </form.Field>
                  </div>
                </div>
              ))}
            </div>
          )}
        </form.Field>

        {applyMutation.isError ? (
          <p role="alert" className="text-red-primary flex items-start gap-xs text-s">
            <Icon icon="warning" className="mt-px size-4 shrink-0" />
            <span>Could not create the organization. Check the details and try again.</span>
          </p>
        ) : null}

        <form.Subscribe selector={(state) => [state.canSubmit] as const}>
          {([canSubmit]) => (
            <Button
              variant="primary"
              size="large"
              type="submit"
              disabled={!canSubmit || !selected || applyMutation.isPending}
              className="self-start"
            >
              {applyMutation.isPending ? <Icon icon="spinner" className="size-4 animate-spin" /> : null}
              Create organization
            </Button>
          )}
        </form.Subscribe>
      </form>
    </div>
  );
}

function ArchetypesSkeleton() {
  return (
    <div className="flex flex-col gap-xs">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="border-grey-border flex flex-col gap-xs rounded-md border p-md">
          <div className="bg-grey-background-light h-3.5 w-32 animate-pulse rounded" />
          <div className="bg-grey-background-light h-2.5 w-48 animate-pulse rounded" />
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------- Empty ---------------------------------- */

function EmptyMethod() {
  const createEmptyOrganizationMutation = useMutation(createEmptyOrganization());
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      name: '',
    },
    validators: {
      onSubmit: createEmptyOrganizationFnInputSchema,
      onChange: createEmptyOrganizationFnInputSchema,
      onMount: createEmptyOrganizationFnInputSchema,
    },
    onSubmit: async ({ value }) => {
      const organization = await createEmptyOrganizationMutation.mutateAsync(value);
      router.navigate({
        to: '/organizations/$orgId',
        params: { orgId: organization.id },
      });
    },
  });

  return (
    <form
      className="flex flex-col gap-sm sm:flex-row sm:items-end"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <form.Field name="name">
        {(field) => (
          <label className="flex flex-1 flex-col gap-xs">
            <span className="text-grey-primary text-s font-medium">Organisation name</span>
            <Input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              placeholder="Acme Inc."
            />
          </label>
        )}
      </form.Field>
      <form.Subscribe selector={(state) => [state.canSubmit]}>
        {([canSubmit]) => (
          <Button
            variant="primary"
            size="large"
            type="submit"
            disabled={!canSubmit || createEmptyOrganizationMutation.isPending}
          >
            {createEmptyOrganizationMutation.isPending ? <Icon icon="spinner" className="size-4 animate-spin" /> : null}
            Create organization
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
