import { Page } from '@app-builder/components';
import { SettingCard } from '@app-builder/components/Settings/settingCard';
import { CreateTag } from '@app-builder/components/Settings/Tags/CreateTag';
import { DeleteTag } from '@app-builder/components/Settings/Tags/DeleteTag';
import { UpdateTag } from '@app-builder/components/Settings/Tags/UpdateTag';
import { ColorPreview } from '@app-builder/components/Tags/ColorPreview';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { type TagColor } from '@app-builder/models/tags';
import {
  isCreateTagAvailable,
  isDeleteTagAvailable,
  isEditTagAvailable,
  isReadTagAvailable,
} from '@app-builder/services/feature-access';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { createColumnHelper } from '@tanstack/react-table';
import { type Tag } from 'marble-api';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { MarbleTableFeatures } from 'ui-design-system';
import { useTable } from 'ui-design-system';

const tagsLoader = createServerFn()
  .middleware([authMiddleware])
  .handler(async function tagsLoader({ context }) {
    const { organization, user } = context.authInfo;

    if (!isReadTagAvailable(user)) throw redirect({ to: '/' });

    const [caseTags, objectTags] = await Promise.all([
      organization
        .listTags({ withCaseCount: true })
        .then((tags) => tags.map((t) => ({ ...t, target: 'case' as const }))),
      organization
        .listTags({ target: 'object' })
        .then((tags) => tags.map((t) => ({ ...t, target: 'object' as const }))),
    ]);

    return {
      tags: [...caseTags, ...objectTags],
      isCreateTagAvailable: isCreateTagAvailable(user),
      isEditTagAvailable: isEditTagAvailable(user),
      isDeleteTagAvailable: isDeleteTagAvailable(user),
    };
  });

export const Route = createFileRoute('/_app/_builder/settings/tags')({
  loader: () => tagsLoader(),
  component: Tags,
});

const columnHelper = createColumnHelper<
  MarbleTableFeatures,
  (Tag & { target: 'case' }) | (Tag & { target: 'object' })
>();

function Tags() {
  const { t } = useTranslation(['settings']);
  const { tags, isCreateTagAvailable, isEditTagAvailable, isDeleteTagAvailable } = Route.useLoaderData();

  const columns = useMemo(() => {
    return [
      columnHelper.accessor((row) => row.name, {
        id: 'name',
        header: t('settings:tags.name'),
        size: 200,
      }),
      columnHelper.accessor((row) => row.color, {
        id: 'color',
        header: t('settings:tags.color'),
        size: 100,
        cell: ({ getValue }) => <ColorPreview color={getValue() as TagColor} />,
      }),
      columnHelper.accessor((row) => row.cases_count, {
        id: 'cases',
        header: t('settings:tags.cases'),
        size: 200,
      }),
      columnHelper.accessor((row) => row.target, {
        id: 'target',
        header: t('settings:tags.target'),
        cell: ({ cell }) => {
          return t(`settings:tags.target.${cell.getValue()}`);
        },
        size: 100,
      }),
      ...(isEditTagAvailable || isDeleteTagAvailable
        ? [
            columnHelper.display({
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
    <Page.Content width="readable">
      <SettingCard title={t('settings:tags')} table={table} addButton={isCreateTagAvailable ? <CreateTag /> : null} />
    </Page.Content>
  );
}
