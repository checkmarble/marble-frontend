import { Page } from '@app-builder/components';
import { InboxPanel, type InboxPanelTarget } from '@app-builder/components/Settings/Inboxes/InboxPanel';
import { UpdateOrganizationSettings } from '@app-builder/components/Settings/Organization/UpdateOrganization';
import { SettingCard } from '@app-builder/components/Settings/settingCard';
import { CreateTag } from '@app-builder/components/Settings/Tags/CreateTag';
import { DeleteTag } from '@app-builder/components/Settings/Tags/DeleteTag';
import { UpdateTag } from '@app-builder/components/Settings/Tags/UpdateTag';
import { ColorPreview } from '@app-builder/components/Tags/ColorPreview';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isAdmin } from '@app-builder/models';
import { type InboxWithCasesCount, tKeyForInboxUserRole } from '@app-builder/models/inbox';
import { type TagColor } from '@app-builder/models/tags';
import {
  getInboxUserRoles,
  isAutoAssignmentAvailable,
  isCreateInboxAvailable,
  isCreateTagAvailable,
  isDeleteInboxAvailable,
  isDeleteTagAvailable,
  isEditInboxAvailable,
  isEditTagAvailable,
  isInboxAdmin,
  isReadTagAvailable,
} from '@app-builder/services/feature-access';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { createColumnHelper } from '@tanstack/react-table';
import { type Tag } from 'marble-api';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import type { MarbleTableFeatures } from 'ui-design-system';
import { Button, useTable } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod/v4';

const inboxesLoader = createServerFn()
  .middleware([authMiddleware])
  .handler(async function inboxesLoader({ context }) {
    const { entitlements, inbox, user, organization } = context.authInfo;

    const [allInboxes, escalationInboxes, currentOrganization] = await Promise.all([
      inbox.listInboxesWithCaseCount(),
      inbox.listInboxesMetadata(),
      organization.getCurrentOrganization(),
    ]);

    const inboxes = allInboxes.filter((inbox) => isAdmin(user) || isInboxAdmin(user, inbox));
    if (inboxes.length === 0 && !isAdmin(user)) {
      throw redirect({ to: '/' });
    }

    const canReadTags = isReadTagAvailable(user);
    let tags: (Tag & { target: 'case' | 'object' })[] = [];
    if (canReadTags) {
      const [caseTags, objectTags] = await Promise.all([
        organization
          .listTags({ withCaseCount: true })
          .then((tags) => tags.map((t) => ({ ...t, target: 'case' as const }))),
        organization
          .listTags({ target: 'object' })
          .then((tags) => tags.map((t) => ({ ...t, target: 'object' as const }))),
      ]);
      tags = [...caseTags, ...objectTags];
    }

    return {
      inboxes,
      editableInboxIds: inboxes.filter((inbox) => isEditInboxAvailable(user, inbox)).map((inbox) => inbox.id),
      escalationInboxes,
      isAutoAssignmentAvailable: isAutoAssignmentAvailable(entitlements),
      isDeleteInboxAvailable: isDeleteInboxAvailable(user),
      inboxUserRoles: getInboxUserRoles(entitlements),
      userRolesAccess: entitlements.userRoles,
      isCreateInboxAvailable: isCreateInboxAvailable(user),
      canUpdateOrganization: user.permissions.canUpdateOrganization,
      organizationId: currentOrganization.id,
      autoAssignQueueLimit: currentOrganization.autoAssignQueueLimit ?? 0,
      canReadTags,
      tags,
      isCreateTagAvailable: canReadTags && isCreateTagAvailable(user),
      isEditTagAvailable: canReadTags && isEditTagAvailable(user),
      isDeleteTagAvailable: canReadTags && isDeleteTagAvailable(user),
    };
  });

export const Route = createFileRoute('/_app/_builder/settings/inboxes')({
  validateSearch: z.object({ inboxId: z.string().optional() }),
  loader: () => inboxesLoader(),
  component: CaseManagerSettings,
});

const inboxColumnHelper = createColumnHelper<MarbleTableFeatures, InboxWithCasesCount>();
const tagColumnHelper = createColumnHelper<
  MarbleTableFeatures,
  (Tag & { target: 'case' }) | (Tag & { target: 'object' })
>();

function CaseManagerSettings() {
  const { t } = useTranslation(['common', 'settings']);
  const {
    inboxes,
    editableInboxIds,
    escalationInboxes,
    isAutoAssignmentAvailable,
    isDeleteInboxAvailable,
    inboxUserRoles,
    userRolesAccess,
    isCreateInboxAvailable,
    canUpdateOrganization,
    organizationId,
    autoAssignQueueLimit,
    canReadTags,
    tags,
    isCreateTagAvailable,
    isEditTagAvailable,
    isDeleteTagAvailable,
  } = Route.useLoaderData();
  const { inboxId: shortInboxId } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [isCreatingInbox, setIsCreatingInbox] = useState(false);

  const editedInbox = shortInboxId
    ? inboxes.find((inbox) => fromUUIDtoSUUID(inbox.id) === shortInboxId && editableInboxIds.includes(inbox.id))
    : undefined;
  const inboxPanelTarget: InboxPanelTarget | null = isCreatingInbox
    ? { mode: 'create' }
    : editedInbox
      ? { mode: 'edit', inboxId: editedInbox.id }
      : null;

  const openEditPanel = (inboxId: string) => {
    setIsCreatingInbox(false);
    navigate({ search: { inboxId: fromUUIDtoSUUID(inboxId) }, resetScroll: false });
  };
  const closePanel = () => {
    setIsCreatingInbox(false);
    if (shortInboxId) navigate({ search: {}, resetScroll: false });
  };

  const inboxColumns = useMemo(() => {
    return [
      inboxColumnHelper.accessor((row) => row.name, {
        id: 'name',
        header: t('settings:inboxes.name'),
        size: 100,
      }),
      inboxColumnHelper.accessor((row) => row.users, {
        id: 'users',
        header: t('settings:inboxes.users'),
        size: 200,
        cell: ({ getValue }) => {
          const users = getValue();
          if (!users) return null;

          return R.pipe(
            users,
            R.groupBy((u) => u.role),
            R.entries(),
            R.map(([role, users]) => {
              return t(tKeyForInboxUserRole(role), { count: users.length });
            }),
            R.join(', '),
          );
        },
      }),
      inboxColumnHelper.accessor((row) => row.casesCount, {
        id: 'cases',
        header: t('settings:inboxes.cases'),
        size: 100,
      }),
      inboxColumnHelper.accessor((row) => row.hasCases, {
        id: 'hasCases',
        header: t('settings:inboxes.hasCases'),
        size: 100,
        cell: ({ getValue }) => {
          return getValue() ? <Icon icon="tick" className="size-4" /> : <Icon icon="x" className="size-4" />;
        },
      }),
    ];
  }, [t]);

  const inboxTable = useTable({
    data: inboxes,
    columns: inboxColumns,
    columnResizeMode: 'onChange',

    enableSorting: false,
  });

  return (
    <Page.Content width="readable">
      <SettingCard
        title={t('settings:inboxes')}
        table={inboxTable}
        onRowClick={(inbox) => openEditPanel(inbox.id)}
        isRowClickable={(inbox) => editableInboxIds.includes(inbox.id)}
        additionalButtons={
          canUpdateOrganization ? (
            <UpdateOrganizationSettings
              isAutoAssignmentAvailable={isAutoAssignmentAvailable}
              organizationId={organizationId}
              autoAssignQueueLimit={autoAssignQueueLimit}
            />
          ) : null
        }
        addButton={
          isCreateInboxAvailable ? (
            <Button
              className="whitespace-nowrap"
              variant="primary"
              appearance="stroked"
              onClick={() => setIsCreatingInbox(true)}
            >
              <Icon icon="new-inbox" className="size-5 shrink-0" />
              {t('settings:inboxes.new_inbox.create')}
            </Button>
          ) : null
        }
      />
      <InboxPanel
        target={inboxPanelTarget}
        onClose={closePanel}
        onInboxCreated={openEditPanel}
        inboxes={inboxes}
        escalationInboxes={escalationInboxes}
        isAutoAssignmentAvailable={isAutoAssignmentAvailable}
        isDeleteInboxAvailable={isDeleteInboxAvailable}
        inboxUserRoles={inboxUserRoles}
        userRolesAccess={userRolesAccess}
      />
      {canReadTags ? (
        <TagsSection
          tags={tags}
          isCreateTagAvailable={isCreateTagAvailable}
          isEditTagAvailable={isEditTagAvailable}
          isDeleteTagAvailable={isDeleteTagAvailable}
        />
      ) : null}
    </Page.Content>
  );
}

function TagsSection({
  tags,
  isCreateTagAvailable,
  isEditTagAvailable,
  isDeleteTagAvailable,
}: {
  tags: (Tag & { target: 'case' | 'object' })[];
  isCreateTagAvailable: boolean;
  isEditTagAvailable: boolean;
  isDeleteTagAvailable: boolean;
}) {
  const { t } = useTranslation(['settings']);

  const columns = useMemo(() => {
    return [
      tagColumnHelper.accessor((row) => row.name, {
        id: 'name',
        header: t('settings:tags.name'),
        size: 200,
      }),
      tagColumnHelper.accessor((row) => row.color, {
        id: 'color',
        header: t('settings:tags.color'),
        size: 100,
        cell: ({ getValue }) => <ColorPreview color={getValue() as TagColor} />,
      }),
      tagColumnHelper.accessor((row) => row.cases_count, {
        id: 'cases',
        header: t('settings:tags.cases'),
        size: 200,
      }),
      tagColumnHelper.accessor((row) => row.target, {
        id: 'target',
        header: t('settings:tags.target'),
        cell: ({ cell }) => {
          return t(`settings:tags.target.${cell.getValue()}`);
        },
        size: 100,
      }),
      ...(isEditTagAvailable || isDeleteTagAvailable
        ? [
            tagColumnHelper.display({
              id: 'actions',
              size: 100,
              cell: ({ cell }) => {
                return (
                  <div className="flex gap-sm">
                    {isEditTagAvailable ? (
                      <div className="group-hover:text-grey-primary focus-within:text-grey-primary text-transparent">
                        <UpdateTag tag={cell.row.original} />
                      </div>
                    ) : null}
                    {isDeleteTagAvailable ? (
                      <div className="group-hover:text-grey-primary focus-within:text-grey-primary text-transparent">
                        <DeleteTag tag={cell.row.original} />
                      </div>
                    ) : null}
                  </div>
                );
              },
            }),
          ]
        : []),
    ];
  }, [isDeleteTagAvailable, isEditTagAvailable, t]);

  const table = useTable({
    data: tags,
    columns,
    columnResizeMode: 'onChange',

    enableSorting: false,
  });

  return (
    <SettingCard title={t('settings:tags')} table={table} addButton={isCreateTagAvailable ? <CreateTag /> : null} />
  );
}
