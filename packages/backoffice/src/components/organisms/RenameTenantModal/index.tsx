import { listTenantsQueryOptions, type Tenant, useRenameTenantMutationOptions } from '@bo/data/tenants';
import { type RenameTenantPayload, renameTenantPayloadSchema, TENANT_NOT_FOUND_ERROR } from '@bo/schemas/tenant';
import { useForm } from '@tanstack/react-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Input, Modal } from 'ui-design-system';

const FORM_ID = 'rename-tenant-form';

export function RenameTenantModal({
  tenant,
  onOpenChange,
}: {
  tenant: Tenant | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Modal.Root open={tenant !== null} onOpenChange={onOpenChange}>
      <Modal.Content size="small">
        <Modal.Title>Rename tenant</Modal.Title>
        {tenant ? <RenameTenantForm tenant={tenant} onClose={() => onOpenChange(false)} /> : null}
      </Modal.Content>
    </Modal.Root>
  );
}

function RenameTenantForm({ tenant, onClose }: { tenant: Tenant; onClose: () => void }) {
  const queryClient = useQueryClient();
  const renameTenantMutation = useMutation(useRenameTenantMutationOptions());

  const form = useForm({
    defaultValues: { tenantId: tenant.id, name: tenant.name } as RenameTenantPayload,
    validators: {
      onMount: renameTenantPayloadSchema,
      onChange: renameTenantPayloadSchema,
      onSubmit: renameTenantPayloadSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      if (!formApi.state.isValid) return;

      const name = value.name.trim();
      try {
        await renameTenantMutation.mutateAsync({ tenantId: value.tenantId, name });
        toast.success(`Tenant renamed to ${name}`);
        onClose();
      } catch (error) {
        if (error instanceof Error && error.message === TENANT_NOT_FOUND_ERROR) {
          toast.error('This tenant no longer exists. The list has been refreshed.');
          void queryClient.invalidateQueries({ queryKey: listTenantsQueryOptions().queryKey });
          onClose();
          return;
        }
        toast.error('Could not rename the tenant. The name may already be in use.');
      }
    },
  });

  return (
    <>
      <form
        id={FORM_ID}
        className="flex flex-col gap-xs p-md"
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <form.Field name="name">
          {(field) => (
            <>
              <label htmlFor={field.name} className="text-grey-primary text-s font-medium">
                Name
              </label>
              <Input
                id={field.name}
                name={field.name}
                autoFocus
                value={field.state.value}
                onChange={(event) => field.handleChange(event.currentTarget.value)}
                onBlur={field.handleBlur}
              />
              <span className="text-grey-placeholder font-mono text-2xs">{tenant.id}</span>
            </>
          )}
        </form.Field>
      </form>
      <Modal.Footer>
        <Modal.FooterButton isCloseButton label="Cancel" disabled={renameTenantMutation.isPending} />
        <form.Subscribe selector={(state) => [state.canSubmit, state.values.name.trim() !== tenant.name] as const}>
          {([canSubmit, hasChanged]) => (
            <Modal.FooterButton
              type="submit"
              form={FORM_ID}
              label="Rename"
              variant="primary"
              disabled={!canSubmit || !hasChanged || renameTenantMutation.isPending}
              isLoading={renameTenantMutation.isPending}
            />
          )}
        </form.Subscribe>
      </Modal.Footer>
    </>
  );
}
