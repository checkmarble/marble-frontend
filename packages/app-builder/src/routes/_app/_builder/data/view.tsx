import { Page } from '@app-builder/components';
import { BreadCrumbLink, type BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import { DataTabs } from '@app-builder/components/Data/DataTabs';
import { dataI18n } from '@app-builder/components/Data/data-i18n';
import { useAgnosticNavigation } from '@app-builder/contexts/AgnosticNavigationContext';
import { useDataModel } from '@app-builder/services/data/data-model';
import { createFileRoute, Outlet, useParams } from '@tanstack/react-router';
import { type Namespace } from 'i18next';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, MenuCommand } from 'ui-design-system';

export const Route = createFileRoute('/_app/_builder/data/view')({
  staticData: {
    i18n: dataI18n satisfies Namespace,
    BreadCrumbs: [
      ({ isLast }: BreadCrumbProps) => {
        const { t } = useTranslation(['navigation']);

        return (
          <BreadCrumbLink to="/data/view" isLast={isLast}>
            {t('navigation:data.viewer')}
          </BreadCrumbLink>
        );
      },
    ],
  },
  component: DataViewer,
});

function DataViewer() {
  const { t } = useTranslation(dataI18n);
  const dataModel = useDataModel();
  // Access child route params non-strictly to pre-populate form when on the detail page
  const params = useParams({ strict: false });
  const navigate = useAgnosticNavigation();
  const [open, setOpen] = useState(false);
  const [tableName, setTableName] = useState(params.tableName ?? '');
  const [objectId, setObjectId] = useState(params.objectId ?? '');

  const handleTableNameChange = (value: string) => {
    setTableName(value);
    if (tableName) setObjectId('');
    setOpen(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate(`/data/view/${tableName}/${objectId}`);
  };

  return (
    <Page.Container>
      <Page.Content>
        <DataTabs />
        <form className="grid gap-2" onSubmit={handleSubmit}>
          <div className="flex items-end gap-2">
            <div className="text-s flex flex-col gap-1">
              <label htmlFor="tableNameField">{t('data:viewer.object_type')}</label>
              <MenuCommand.Menu open={open} onOpenChange={setOpen}>
                <MenuCommand.Trigger>
                  <MenuCommand.SelectButton className="min-w-40">
                    <span className={tableName ? undefined : 'text-grey-50'}>{tableName || 'select a table'}</span>
                  </MenuCommand.SelectButton>
                </MenuCommand.Trigger>
                <MenuCommand.Content sameWidth>
                  <MenuCommand.List>
                    {dataModel.map((table) => (
                      <MenuCommand.Item key={table.name} value={table.name} onSelect={handleTableNameChange}>
                        {table.name}
                      </MenuCommand.Item>
                    ))}
                  </MenuCommand.List>
                </MenuCommand.Content>
              </MenuCommand.Menu>
            </div>
            <div className="flex gap-2">
              <div className="text-s flex flex-col gap-1">
                <label htmlFor="objectIdField">{t('data:viewer.object_id')}</label>
                <Input
                  name="objectId"
                  type="text"
                  id="objectIdField"
                  value={objectId}
                  onChange={(e) => setObjectId(e.target.value)}
                  className="min-w-96"
                />
              </div>
            </div>
            <Button type="submit" variant="primary" disabled={!tableName || !objectId} className="h-10">
              {t('common:search')}
            </Button>
          </div>
          <Outlet />
        </form>
      </Page.Content>
    </Page.Container>
  );
}
