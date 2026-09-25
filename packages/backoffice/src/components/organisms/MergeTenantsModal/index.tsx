import {
  listTenantsQueryOptions,
  type OrganizationsByTenant,
  type Tenant,
  useMergeTenantsMutationOptions,
} from '@bo/data/tenants';
import {
  type MergeTenantsFormValues,
  mergeTenantsFormSchema,
  TENANT_MERGE_CONFLICT_ERROR,
  TENANT_NOT_FOUND_ERROR,
} from '@bo/schemas/tenant';
import { useForm } from '@tanstack/react-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Checkbox, Input, Modal, Radio, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';

const FORM_ID = 'merge-tenants-form';
const CONFIRM_CHECKBOX_NAME = 'confirm-merge-tenants';

export function MergeTenantsModal({
  tenants,
  organizationsByTenant,
  open,
  onOpenChange,
  onSettled,
}: {
  tenants: Tenant[];
  organizationsByTenant: OrganizationsByTenant;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSettled: () => void;
}) {
  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="medium">
        <Modal.Title>Merge tenants</Modal.Title>
        {tenants.length > 0 ? (
          <MergeTenantsForm
            tenants={tenants}
            organizationsByTenant={organizationsByTenant}
            onSettled={() => {
              onOpenChange(false);
              onSettled();
            }}
          />
        ) : null}
      </Modal.Content>
    </Modal.Root>
  );
}

function MergeTenantsForm({
  tenants,
  organizationsByTenant,
  onSettled,
}: {
  tenants: Tenant[];
  organizationsByTenant: OrganizationsByTenant;
  onSettled: () => void;
}) {
  const getOrganizationNames = (tenantId: string) =>
    (organizationsByTenant.get(tenantId) ?? []).map((organization) => organization.name);

  const queryClient = useQueryClient();
  const mergeTenantsMutation = useMutation(useMergeTenantsMutationOptions());
  const [hasRoleConflict, setHasRoleConflict] = useState(false);
  const [initialTarget] = tenants;

  const form = useForm({
    defaultValues: {
      targetTenantId: initialTarget?.id ?? '',
      name: initialTarget?.name ?? '',
      confirmed: false,
    } as MergeTenantsFormValues,
    validators: {
      onMount: mergeTenantsFormSchema,
      onChange: mergeTenantsFormSchema,
      onSubmit: mergeTenantsFormSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      if (!formApi.state.isValid) return;

      const target = tenants.find((tenant) => tenant.id === value.targetTenantId);
      if (!target) return;

      const name = value.name.trim();
      const sources = tenants.filter((tenant) => tenant.id !== target.id);
      setHasRoleConflict(false);

      try {
        await mergeTenantsMutation.mutateAsync({
          targetTenantId: target.id,
          sourceTenantIds: sources.map((tenant) => tenant.id),
          name: name !== target.name ? name : undefined,
        });
        toast.success(`${sources.length + 1} tenants merged into ${name}`);
        onSettled();
      } catch (error) {
        const message = error instanceof Error ? error.message : undefined;
        if (message === TENANT_MERGE_CONFLICT_ERROR) {
          setHasRoleConflict(true);
          return;
        }
        if (message === TENANT_NOT_FOUND_ERROR) {
          toast.error('The selection is out of date. The tenant list has been refreshed.');
          void queryClient.invalidateQueries({ queryKey: listTenantsQueryOptions().queryKey });
          onSettled();
          return;
        }
        toast.error('Something went wrong while merging the tenants. If you set a new name, it may already be in use.');
      }
    },
  });

  return (
    <>
      <form
        id={FORM_ID}
        className="flex flex-col gap-lg p-md"
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <form.Field name="targetTenantId">
          {(field) => (
            <fieldset className="flex flex-col gap-sm">
              <legend className="text-grey-primary mb-xs text-s font-medium">Keep as target</legend>
              <Radio.Root
                size="small"
                value={field.state.value}
                onValueChange={(targetTenantId) => {
                  const previousTarget = tenants.find((tenant) => tenant.id === field.state.value);
                  const nextTarget = tenants.find((tenant) => tenant.id === targetTenantId);
                  field.handleChange(targetTenantId);
                  if (nextTarget && form.getFieldValue('name').trim() === previousTarget?.name) {
                    form.setFieldValue('name', nextTarget.name);
                  }
                }}
              >
                {tenants.map((tenant) => {
                  const organizationNames = getOrganizationNames(tenant.id);

                  return (
                    <Radio.Item key={tenant.id} value={tenant.id} className="items-start">
                      <span className="flex min-w-0 flex-col gap-2xs">
                        <span className="text-grey-primary text-s font-medium">{tenant.name}</span>
                        <span className="text-grey-placeholder font-mono text-2xs">{tenant.id}</span>
                        <span className="text-grey-secondary text-xs">
                          {organizationNames.length === 0
                            ? 'No organizations'
                            : `${organizationNames.length} ${organizationNames.length === 1 ? 'organization' : 'organizations'}: ${organizationNames.join(', ')}`}
                        </span>
                      </span>
                    </Radio.Item>
                  );
                })}
              </Radio.Root>
            </fieldset>
          )}
        </form.Field>

        <form.Field name="name">
          {(field) => (
            <div className="flex flex-col gap-xs">
              <label htmlFor={field.name} className="text-grey-primary text-s font-medium">
                Target name
              </label>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onChange={(event) => field.handleChange(event.currentTarget.value)}
                onBlur={field.handleBlur}
              />
            </div>
          )}
        </form.Field>

        <form.Subscribe selector={(state) => [state.values.targetTenantId, state.values.name] as const}>
          {([targetTenantId, name]) => (
            <MergeSummary
              target={tenants.find((tenant) => tenant.id === targetTenantId)}
              sources={tenants.filter((tenant) => tenant.id !== targetTenantId)}
              organizationsByTenant={organizationsByTenant}
              newName={name.trim()}
            />
          )}
        </form.Subscribe>

        {hasRoleConflict ? (
          <div role="alert" className="bg-red-background text-red-primary flex items-start gap-sm rounded-md p-md">
            <Icon icon="error" className="size-5 shrink-0" />
            <p className="text-s">
              Some users have different tenant roles across these tenants. Align their roles before merging.
            </p>
          </div>
        ) : null}

        <form.Field name="confirmed">
          {(field) => (
            <div className="flex items-center gap-sm">
              <Checkbox
                name={CONFIRM_CHECKBOX_NAME}
                size="small"
                checked={field.state.value}
                onCheckedChange={(checked) => field.handleChange(checked === true)}
              />
              <label htmlFor={CONFIRM_CHECKBOX_NAME} className="text-grey-primary cursor-pointer text-s">
                I understand this cannot be undone
              </label>
            </div>
          )}
        </form.Field>
      </form>
      <Modal.Footer>
        <Modal.FooterButton isCloseButton label="Cancel" disabled={mergeTenantsMutation.isPending} />
        <form.Subscribe selector={(state) => state.canSubmit}>
          {(canSubmit) => (
            <Modal.FooterButton
              type="submit"
              form={FORM_ID}
              label={`Merge ${tenants.length} tenants`}
              variant="destructive"
              disabled={!canSubmit || mergeTenantsMutation.isPending}
              isLoading={mergeTenantsMutation.isPending}
            />
          )}
        </form.Subscribe>
      </Modal.Footer>
    </>
  );
}

function MergeSummary({
  target,
  sources,
  organizationsByTenant,
  newName,
}: {
  target?: Tenant;
  sources: Tenant[];
  organizationsByTenant: OrganizationsByTenant;
  newName: string;
}) {
  if (!target) return null;

  const sourceNames = sources.map((tenant) => tenant.name).join(', ');
  const isRenamed = newName.length > 0 && newName !== target.name;
  const movingOrganizations = sources.flatMap((tenant) => organizationsByTenant.get(tenant.id) ?? []);
  const resultingCount = (organizationsByTenant.get(target.id)?.length ?? 0) + movingOrganizations.length;

  return (
    <div className="bg-grey-background-light text-grey-primary flex flex-col gap-xs rounded-md p-md text-s">
      <p>
        Organizations and tenant access from <strong>{sourceNames}</strong> will move to <strong>{target.name}</strong>.
      </p>
      {movingOrganizations.length > 0 ? (
        <div className="flex flex-wrap items-center gap-xs">
          <span>Organizations moving:</span>
          {movingOrganizations.map((organization) => (
            <Tag key={organization.id} color="white" size="small" title={organization.id}>
              {organization.name}
            </Tag>
          ))}
        </div>
      ) : (
        <p>No organizations will move.</p>
      )}
      <p>
        <strong>{target.name}</strong> will then group {resultingCount}{' '}
        {resultingCount === 1 ? 'organization' : 'organizations'}.
      </p>
      <p>
        <strong>{sourceNames}</strong> will be deleted.
      </p>
      {isRenamed ? (
        <p>
          <strong>{target.name}</strong> will be renamed to <strong>{newName}</strong>.
        </p>
      ) : null}
    </div>
  );
}
