import { importOrganization } from '@bo/data/organization';
import { OrgImportSpec } from '@bo/schemas/org-import';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';
import { Button, Checkbox, Input, Panel, PanelSharpFactory, Tabs, Typo, tabClassName } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod/v4';

const FORM_ID = 'org-import-form';

// Both sanctions fields are `*int` on the backend, so reject floats here rather than
// letting the spec schema fail later with no field to point at.
const numericString = z
  .string()
  .optional()
  .refine((value) => !value || Number.isInteger(Number(value)), 'Enter a whole number.');

const importEditSchema = z.object({
  org: z.object({
    name: z.string().min(1, 'A name is required.'),
    default_scenario_timezone: z.string().optional(),
    sanctions_threshold: numericString,
    sanctions_limit: numericString,
  }),
  admins: z
    .array(
      z.object({
        // Only the email is required — the backend stores both names as-is and never
        // validates them (createAdmins in org_import_usecase.go).
        email: z.email('Enter a valid email address.'),
        first_name: z.string(),
        last_name: z.string(),
      }),
    )
    // The export never carries admins, and the backend indexes `admins[0]` without a guard
    // (org_import_usecase.go), so submitting an empty list crashes the import.
    .min(1, 'Add at least one admin.'),
});

type ImportEditValues = z.infer<typeof importEditSchema>;

export const ImportFlow = ({ data }: { data: OrgImportSpec }) => {
  const panelSharp = PanelSharpFactory.useSharp();
  const importOrgMutation = useMutation(importOrganization());

  const form = useForm({
    defaultValues: {
      org: {
        name: data.org.name,
        default_scenario_timezone: data.org.default_scenario_timezone ?? '',
        sanctions_threshold: data.org.sanctions_threshold?.toString() ?? '',
        sanctions_limit: data.org.sanctions_limit?.toString() ?? '',
      },
      admins: (data.admins ?? []).map((admin) => ({
        email: admin.email,
        first_name: admin.first_name ?? '',
        last_name: admin.last_name ?? '',
      })),
    } as ImportEditValues,
    validators: {
      onMount: importEditSchema,
      onChange: importEditSchema,
      onSubmit: importEditSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      if (!formApi.state.isValid) return;
      const editedSpec: OrgImportSpec = {
        ...data,
        org: {
          // Spread first: the form only covers four fields, and rebuilding `org` from
          // scratch would drop everything else the spec carries (screening_providers,
          // environment, and any key a newer backend added).
          ...data.org,
          name: value.org.name,
          default_scenario_timezone: value.org.default_scenario_timezone || undefined,
          sanctions_threshold: value.org.sanctions_threshold ? Number(value.org.sanctions_threshold) : undefined,
          sanctions_limit: value.org.sanctions_limit ? Number(value.org.sanctions_limit) : undefined,
        },
        admins: value.admins,
      };
      await importOrgMutation.mutateAsync(editedSpec);

      panelSharp.actions.close();
    },
  });

  return (
    <>
      <form
        id={FORM_ID}
        className="flex flex-col gap-lg"
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          form.handleSubmit();
        }}
      >
        {/* -------- Organization settings (editable) -------- */}
        <Section title="Organization settings" hint="Review and adjust before importing.">
          <div className="border-grey-border flex flex-col gap-md rounded-md border p-md">
            <form.Field name="org.name">
              {(field) => (
                <Field label="Name">
                  <Input
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="Acme Inc."
                  />
                  {field.state.meta.isTouched ? <ErrorText>{firstError(field.state.meta.errors)}</ErrorText> : null}
                </Field>
              )}
            </form.Field>

            <form.Field name="org.default_scenario_timezone">
              {(field) => (
                <Field label="Default scenario timezone">
                  <Input
                    value={field.state.value ?? ''}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                    placeholder="Europe/Paris"
                  />
                </Field>
              )}
            </form.Field>

            <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
              <form.Field name="org.sanctions_threshold">
                {(field) => (
                  <Field label="Sanctions threshold">
                    <Input
                      type="number"
                      inputMode="numeric"
                      value={field.state.value ?? ''}
                      onChange={(event) => field.handleChange(event.target.value)}
                      onBlur={field.handleBlur}
                      placeholder="Optional"
                    />
                    {field.state.meta.isTouched ? <ErrorText>{firstError(field.state.meta.errors)}</ErrorText> : null}
                  </Field>
                )}
              </form.Field>

              <form.Field name="org.sanctions_limit">
                {(field) => (
                  <Field label="Sanctions limit">
                    <Input
                      type="number"
                      inputMode="numeric"
                      value={field.state.value ?? ''}
                      onChange={(event) => field.handleChange(event.target.value)}
                      onBlur={field.handleBlur}
                      placeholder="Optional"
                    />
                    {field.state.meta.isTouched ? <ErrorText>{firstError(field.state.meta.errors)}</ErrorText> : null}
                  </Field>
                )}
              </form.Field>
            </div>
          </div>
        </Section>

        {/* -------- Admins (editable) -------- */}
        <form.Field name="admins" mode="array">
          {(adminsField) => (
            <Section
              title="Admins"
              action={
                <Button
                  variant="secondary"
                  size="small"
                  appearance="link"
                  onClick={() => adminsField.pushValue({ email: '', first_name: '', last_name: '' })}
                >
                  <Icon icon="plus" className="size-4" />
                  Add admin
                </Button>
              }
            >
              {adminsField.state.value.length === 0 ? (
                <p className="text-grey-secondary border-grey-border rounded-md border border-dashed p-md text-s">
                  No admins yet — add at least one to administer this organization.
                </p>
              ) : (
                <div className="flex flex-col gap-sm">
                  {adminsField.state.value.map((_, index) => (
                    <div key={index} className="border-grey-border flex flex-col gap-xs rounded-md border p-sm">
                      <div className="flex items-start gap-xs">
                        <form.Field name={`admins[${index}].email`}>
                          {(field) => (
                            <div className="flex flex-1 flex-col gap-2xs">
                              <Input
                                type="email"
                                value={field.state.value}
                                onChange={(event) => field.handleChange(event.target.value)}
                                onBlur={field.handleBlur}
                                placeholder="admin@company.com"
                              />
                              {field.state.meta.isTouched ? (
                                <ErrorText>{firstError(field.state.meta.errors)}</ErrorText>
                              ) : null}
                            </div>
                          )}
                        </form.Field>
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
                      </div>
                      <div className="flex flex-col gap-xs sm:flex-row">
                        <form.Field name={`admins[${index}].first_name`}>
                          {(field) => (
                            <div className="flex flex-1 flex-col gap-2xs">
                              <Input
                                value={field.state.value}
                                onChange={(event) => field.handleChange(event.target.value)}
                                onBlur={field.handleBlur}
                                placeholder="First name (optional)"
                              />
                              {field.state.meta.isTouched ? (
                                <ErrorText>{firstError(field.state.meta.errors)}</ErrorText>
                              ) : null}
                            </div>
                          )}
                        </form.Field>
                        <form.Field name={`admins[${index}].last_name`}>
                          {(field) => (
                            <div className="flex flex-1 flex-col gap-2xs">
                              <Input
                                value={field.state.value}
                                onChange={(event) => field.handleChange(event.target.value)}
                                onBlur={field.handleBlur}
                                placeholder="Last name (optional)"
                              />
                              {field.state.meta.isTouched ? (
                                <ErrorText>{firstError(field.state.meta.errors)}</ErrorText>
                              ) : null}
                            </div>
                          )}
                        </form.Field>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          )}
        </form.Field>

        {/* -------- Read-only recap (imported as-is) -------- */}
        <DataModelRecap data={data} />
        <SeedingSection lines={seedLines(data.seeds)} />

        {importOrgMutation.isError ? (
          <p role="alert" className="text-red-primary flex items-start gap-xs text-s">
            <Icon icon="warning" className="mt-px size-4 shrink-0" />
            <span>Import failed. Check the settings above and try again.</span>
          </p>
        ) : null}
      </form>

      <Panel.Footer>
        <Panel.FooterButton isCloseButton label="Cancel" />
        <form.Subscribe selector={(state) => [state.canSubmit] as const}>
          {([canSubmit]) => (
            <Panel.FooterButton
              type="submit"
              form={FORM_ID}
              label="Import organization"
              variant="primary"
              disabled={!canSubmit || importOrgMutation.isPending}
              isLoading={importOrgMutation.isPending}
            />
          )}
        </form.Subscribe>
      </Panel.Footer>
    </>
  );
};

/* -------------------------------- Helpers ---------------------------------- */

function Section({
  title,
  hint,
  action,
  children,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-sm">
      <div className="flex items-center justify-between gap-md">
        <div className="flex flex-col">
          <Typo variant="subtitle1">{title}</Typo>
          {hint ? <span className="text-grey-secondary text-xs">{hint}</span> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
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

function ErrorText({ children }: { children: ReactNode }) {
  if (!children) return null;
  return <span className="text-red-primary text-xs">{children}</span>;
}

function firstError(errors: unknown[]): string | null {
  for (const error of errors) {
    if (typeof error === 'string') return error;
    if (error && typeof error === 'object' && 'message' in error) {
      return String((error as { message: unknown }).message);
    }
  }
  return null;
}

/* --------------------------- Read-only recap ------------------------------- */

/**
 * `seeds` is a struct on the backend, so an export always carries it — with both maps
 * `null`. Presence therefore says nothing; only content does.
 */
function seedLines(seeds: OrgImportSpec['seeds']) {
  if (!seeds) return [];
  return [
    ...Object.entries(seeds.ingestion ?? {}).map(([table, { count }]) => `${count} ${table}`),
    ...Object.entries(seeds.decisions ?? {}).map(([triggerType, count]) => `${count} ${triggerType} decisions`),
  ];
}

const SeedingSection = ({ lines }: { lines: string[] }) => {
  if (lines.length === 0) return null;

  return (
    <section className="flex flex-col gap-sm">
      <div className="flex items-center justify-between">
        <Typo variant="subtitle1">Seeding</Typo>
        <label className="flex items-center gap-xs text-s">
          Activate auto seeding <Checkbox size="small" />
        </label>
      </div>
      <div className="border-blue-58 flex flex-col gap-sm rounded-md border p-md">
        <span className="text-s">Activating the seeding will create:</span>
        <div className="pl-lg text-s">
          {lines.map((line) => (
            <div key={line}>{line}</div>
          ))}
        </div>
      </div>
    </section>
  );
};

const DataModelRecap = ({ data }: { data: OrgImportSpec }) => {
  const tables = data.data_model.tables ?? [];
  const [activeTab, setActiveTab] = useState<string | undefined>(tables[0]?.name);
  const currentTable = tables.find((table) => table.name === activeTab);

  return (
    <section className="flex flex-col gap-sm">
      <Typo variant="subtitle1" className="flex items-baseline gap-sm">
        <span>Data model</span>
        <span className="text-default text-grey-placeholder font-normal">({tables.length} tables)</span>
      </Typo>
      <Tabs>
        {tables.map((table) => (
          <button
            key={table.id}
            type="button"
            onClick={() => setActiveTab(table.name)}
            className={tabClassName}
            data-status={activeTab === table.name ? 'active' : 'inactive'}
          >
            {table.name}
          </button>
        ))}
      </Tabs>
      {currentTable ? (
        <div className="border-grey-border grid grid-cols-[1fr_1fr_1fr] rounded-md border">
          <div className="border-grey-border col-span-full grid grid-cols-subgrid not-last:border-b">
            <div className="p-md">Name</div>
            <div className="p-md">Description</div>
            <div className="p-md">Type</div>
          </div>
          {Object.entries(currentTable.fields ?? {}).map(([key, field]) => (
            <div key={key} className="col-span-full grid grid-cols-subgrid">
              <div className="p-md">{key}</div>
              <div className="p-md">{field.description}</div>
              <div className="p-md">{field.data_type}</div>
            </div>
          ))}
          <TableLinks data={data} currentTable={currentTable} />
        </div>
      ) : null}
    </section>
  );
};

type TableLinksProps = {
  data: OrgImportSpec;
  currentTable: NonNullable<OrgImportSpec['data_model']['tables']>[number];
};

const TableLinks = ({ data, currentTable }: TableLinksProps) => {
  const linksForTable = (data.data_model.links ?? []).filter(
    (link) => link.parent_table_name === currentTable.name || link.child_table_name === currentTable.name,
  );

  return (
    <>
      <div className="border-grey-border col-span-full grid grid-cols-subgrid border-y">
        <div className="p-md">Links</div>
      </div>
      {linksForTable.map((link) => (
        <div key={link.id} className="col-span-full grid grid-cols-subgrid">
          <div className="p-md">
            {link.parent_table_name} → {link.child_table_name}
          </div>
        </div>
      ))}
    </>
  );
};
