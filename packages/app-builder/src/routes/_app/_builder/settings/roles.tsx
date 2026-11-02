import { Page } from '@app-builder/components';
import { Callout } from '@app-builder/components/Callout';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { RolePermissionSelector } from '@app-builder/components/Settings/RolePermissionSelector';
import { SettingCard } from '@app-builder/components/Settings/settingCard';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { createCustomRoleFormSchema, createCustomRoleSchema } from '@app-builder/schemas/custom-roles';
import { createCustomRoleFn, updateCustomRolePermissionsFn } from '@app-builder/server-fns/custom-roles';
import { saveCustomRole } from '@app-builder/services/custom-role-creation';
import { handleSubmit } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router';
import { createServerFn, useServerFn } from '@tanstack/react-start';
import { createColumnHelper } from '@tanstack/react-table';
import { type CustomRoleDto } from 'marble-api';
import { useId, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, type MarbleTableFeatures, Panel, Tooltip, useTable } from 'ui-design-system';
import { Icon } from 'ui-icons';

const rolesLoader = createServerFn()
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    if (!context.authInfo.user.permissions.canManageRoles) throw redirect({ to: '/' });
    try {
      return { roles: await context.authInfo.apiClient.listCustomRoles(), error: false };
    } catch {
      return { roles: [], error: true };
    }
  });

export const Route = createFileRoute('/_app/_builder/settings/roles')({
  loader: () => rolesLoader(),
  component: CustomRolesPage,
});

const columns = createColumnHelper<MarbleTableFeatures, CustomRoleDto>();

export function CustomRolesPage() {
  const { t } = useTranslation(['settings']);
  const { roles, error } = Route.useLoaderData();
  const router = useRouter();
  const [target, setTarget] = useState<'create' | CustomRoleDto | null>(null);
  const [saving, setSaving] = useState(false);
  const [roleCreated, setRoleCreated] = useState(false);
  const tableColumns = useMemo(
    () => [
      columns.accessor('name', { header: t('settings:custom_roles.name') }),
      columns.accessor('slug', { header: t('settings:custom_roles.slug') }),
      columns.display({
        id: 'actions',
        header: '',
        size: 1,
        minSize: 1,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Tooltip.Default content={t('settings:custom_roles.edit_permissions')}>
              <Button
                type="button"
                variant="secondary"
                appearance="stroked"
                size="small"
                mode="icon"
                className="opacity-0 group-hover/row:opacity-100 group-focus-within/row:opacity-100 [@media(hover:none)]:opacity-100"
                aria-label={t('settings:custom_roles.edit_permissions_for', { name: row.original.name })}
                onClick={() => setTarget(row.original)}
              >
                <Icon icon="edit-square" className="size-4" aria-hidden="true" />
              </Button>
            </Tooltip.Default>
          </div>
        ),
      }),
    ],
    [t],
  );
  const table = useTable({ data: roles, columns: tableColumns, enableSorting: false });

  return (
    <Page.Content width="readable">
      <SettingCard
        table={table}
        addButton={
          <Button appearance="stroked" variant="primary" onClick={() => setTarget('create')}>
            <Icon icon="plus" className="size-5" />
            {t('settings:custom_roles.create')}
          </Button>
        }
        emptyState={
          error ? (
            <div role="alert" className="flex items-center gap-sm">
              <span>{t('settings:custom_roles.load_error')}</span>
              <Button variant="secondary" appearance="stroked" onClick={() => router.invalidate()}>
                {t('settings:custom_roles.retry')}
              </Button>
            </div>
          ) : (
            <p className="text-grey-secondary text-center">{t('settings:custom_roles.empty')}</p>
          )
        }
      />
      <Panel.Root
        open={target !== null}
        onOpenChange={(nextOpen) => {
          if (saving) return false;
          if (!nextOpen) setTarget(null);
          if (!nextOpen && roleCreated) {
            setRoleCreated(false);
            void router.invalidate();
          }
        }}
      >
        <Panel.Container size="medium">
          {target ? (
            <CreateRolePanel
              key={target === 'create' ? 'create' : target.slug}
              role={target === 'create' ? undefined : target}
              roleCreated={roleCreated}
              onRoleCreated={() => setRoleCreated(true)}
              onSavingChange={setSaving}
              onSuccess={() => {
                setTarget(null);
                setRoleCreated(false);
                void router.invalidate();
              }}
            />
          ) : null}
        </Panel.Container>
      </Panel.Root>
    </Page.Content>
  );
}

export function CreateRolePanel({
  role,
  roleCreated,
  onRoleCreated,
  onSavingChange,
  onSuccess,
}: {
  role?: CustomRoleDto;
  roleCreated: boolean;
  onRoleCreated: () => void;
  onSavingChange: (saving: boolean) => void;
  onSuccess: () => void;
}) {
  const { t } = useTranslation(['settings', 'common']);
  const createRole = useServerFn(createCustomRoleFn);
  const updatePermissions = useServerFn(updateCustomRolePermissionsFn);
  const formId = useId();
  const form = useForm({
    defaultValues: {
      name: role?.name ?? '',
      slug: role?.slug ?? 'org/',
      permissions: role?.permissions ?? ([] as string[]),
    },
    validators: { onSubmit: createCustomRoleFormSchema },
    onSubmit: async ({ value }) => {
      onSavingChange(true);
      try {
        const result = await saveCustomRole(value, !!role || roleCreated, {
          create: (data) => createRole({ data }),
          updatePermissions: (data) => updatePermissions({ data }),
        });
        if (result === 'duplicate') {
          toast.error(t('settings:custom_roles.duplicate'));
          return;
        }
        if (result === 'permissions_failed') {
          if (role) toast.error(t('common:errors.unknown'));
          else onRoleCreated();
          return;
        }
        toast.success(role ? t('common:success.save') : t('settings:custom_roles.created'));
        onSuccess();
      } catch {
        toast.error(t('common:errors.unknown'));
      } finally {
        onSavingChange(false);
      }
    },
  });

  return (
    <Panel.Content>
      <Panel.Header>
        {role ? t('settings:custom_roles.edit_permissions') : t('settings:custom_roles.create')}
      </Panel.Header>
      <form id={formId} onSubmit={handleSubmit(form)} className="flex flex-col gap-lg">
        {roleCreated ? (
          <Callout role="alert" color="orange" icon="warning" iconColor="orange">
            {t('settings:custom_roles.permissions_failed')}
          </Callout>
        ) : null}
        <form.Field name="name" validators={{ onBlur: createCustomRoleSchema.shape.name }}>
          {(field) => (
            <div className="flex flex-col gap-sm">
              <FormLabel name={field.name}>{t('settings:custom_roles.name')}</FormLabel>
              <FormInput
                name={field.name}
                type="text"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.currentTarget.value)}
                valid={field.state.meta.errors.length === 0}
                disabled={!!role || roleCreated}
              />
              {field.state.meta.errors.length > 0 ? (
                <p role="alert">{t('settings:custom_roles.invalid_name')}</p>
              ) : null}
            </div>
          )}
        </form.Field>
        <form.Field name="slug" validators={{ onBlur: createCustomRoleSchema.shape.slug }}>
          {(field) => (
            <div className="flex flex-col gap-sm">
              <FormLabel name={field.name}>{t('settings:custom_roles.slug')}</FormLabel>
              <FormInput
                name={field.name}
                type="text"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.currentTarget.value)}
                valid={field.state.meta.errors.length === 0}
                disabled={!!role || roleCreated}
              />
              <p className="text-grey-secondary text-s">{t('settings:custom_roles.slug_hint')}</p>
              {field.state.meta.errors.length > 0 ? (
                <p role="alert">{t('settings:custom_roles.invalid_slug')}</p>
              ) : null}
            </div>
          )}
        </form.Field>
        <form.Field name="permissions">
          {(field) => (
            <RolePermissionSelector
              value={field.state.value}
              onChange={field.handleChange}
              existingPermissions={role?.permissions ?? []}
            />
          )}
        </form.Field>
      </form>
      <Panel.Footer>
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <>
              <Panel.FooterButton isCloseButton disabled={isSubmitting} label={t('common:cancel')} />
              <Panel.FooterButton
                type="submit"
                form={formId}
                variant="primary"
                isLoading={isSubmitting}
                label={
                  role
                    ? t('common:save')
                    : roleCreated
                      ? t('settings:custom_roles.retry_permissions')
                      : t('settings:custom_roles.create')
                }
              />
            </>
          )}
        </form.Subscribe>
      </Panel.Footer>
    </Panel.Content>
  );
}
