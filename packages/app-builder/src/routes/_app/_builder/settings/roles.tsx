import { CollapsiblePaper, Page } from '@app-builder/components';
import { CreateRole } from '@app-builder/components/Settings/Roles/CreateRole';
import { EditRolePermissions } from '@app-builder/components/Settings/Roles/EditRolePermissions';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { type CustomRole } from '@app-builder/models/roles';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { createColumnHelper, getCoreRowModel } from '@tanstack/react-table';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, useTable } from 'ui-design-system';

const rolesLoader = createServerFn()
  .middleware([authMiddleware])
  .handler(async function rolesLoader({ context }) {
    const { user, organization } = context.authInfo;

    if (!user.permissions.canManageRoles) throw redirect({ to: '/' });

    const { roles, availablePermissions } = await organization.listCustomRoles();

    return { roles, availablePermissions };
  });

export const Route = createFileRoute('/_app/_builder/settings/roles')({
  loader: () => rolesLoader(),
  component: Roles,
});

const columnHelper = createColumnHelper<CustomRole>();

function Roles() {
  const { t } = useTranslation(['settings']);
  const { roles, availablePermissions } = Route.useLoaderData();

  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => row.name, {
        id: 'name',
        header: t('settings:roles.name'),
        size: 200,
      }),
      columnHelper.accessor((row) => row.permissions.length, {
        id: 'permissions',
        header: t('settings:roles.permissions'),
        size: 150,
        cell: ({ getValue }) => t('settings:roles.permissions_count', { count: getValue() }),
      }),
      columnHelper.display({
        id: 'actions',
        size: 50,
        cell: ({ cell }) => (
          <div className="group-hover:text-grey-primary focus-within:text-grey-primary flex justify-end text-transparent">
            <EditRolePermissions role={cell.row.original} availablePermissions={availablePermissions} />
          </div>
        ),
      }),
    ],
    [t, availablePermissions],
  );

  const { table, getBodyProps, rows, getContainerProps } = useTable({
    data: roles,
    columns,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    enableSorting: false,
  });

  return (
    <Page.Content width="readable">
      <CollapsiblePaper.Container>
        <CollapsiblePaper.Title>
          <span className="flex-1">{t('settings:roles')}</span>
          <CreateRole />
        </CollapsiblePaper.Title>
        <CollapsiblePaper.Content>
          <Table.Container {...getContainerProps()} className="max-h-96">
            <Table.Header headerGroups={table.getHeaderGroups()} />
            <Table.Body {...getBodyProps()}>
              {rows.map((row) => (
                <Table.Row key={row.id} className="hover:bg-surface-row-hover group" row={row} />
              ))}
            </Table.Body>
          </Table.Container>
        </CollapsiblePaper.Content>
      </CollapsiblePaper.Container>
    </Page.Content>
  );
}
