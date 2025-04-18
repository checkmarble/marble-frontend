import { Page, TabLink } from '@app-builder/components';
import { BreadCrumbLink, type BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import { dataI18n } from '@app-builder/components/Data/data-i18n';
import { useDataModel } from '@app-builder/services/data/data-model';
import { getRoute } from '@app-builder/utils/routes';
import { type RoutePath } from '@app-builder/utils/routes/types';
import { Outlet, useMatch, useNavigate } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, Select } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const handle = {
  i18n: dataI18n satisfies Namespace,
  BreadCrumbs: [
    ({ isLast }: BreadCrumbProps) => {
      const { t } = useTranslation(['navigation', 'data']);

      return (
        <BreadCrumbLink to={getRoute('/data/view')} isLast={isLast}>
          {t('navigation:data.viewer')}
        </BreadCrumbLink>
      );
    },
  ],
};

export default function DataSearchPage() {
  const { t } = useTranslation(handle.i18n);
  const dataModel = useDataModel();
  const match = useMatch('/data/view/:tableName/:objectId' as RoutePath);
  const navigate = useNavigate();

  const [tableName, setTableName] = useState(match?.params.tableName ?? '');
  const [objectId, setObjectId] = useState(match?.params.objectId ?? '');

  const handleTableNameChange = (value: string) => {
    setTableName(value);
    if (tableName) {
      setObjectId('');
    }
  };

  return (
    <Page.Container>
      <Page.Content>
        <nav className="border border-transparent">
          <ul className="flex flex-row gap-2">
            <li>
              <TabLink
                labelTKey="navigation:data.list"
                to={getRoute('/data/list')}
                Icon={(props) => <Icon {...props} icon="lists" />}
              />
            </li>
            <li>
              <TabLink
                labelTKey="navigation:data.schema"
                to={getRoute('/data/schema')}
                Icon={(props) => <Icon {...props} icon="tree-schema" />}
              />
            </li>
            <li>
              <TabLink
                labelTKey="navigation:data.viewer"
                to={getRoute('/data/view')}
                Icon={(props) => <Icon {...props} icon="visibility" />}
              />
            </li>
          </ul>
        </nav>
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <div className="text-s flex flex-col gap-1">
              <label htmlFor="tableNameField">{t('data:viewer.object_type')}</label>
              <Select.Default
                value={tableName}
                onValueChange={handleTableNameChange}
                placeholder={t('data:viewer.object_type.placeholder')}
                className="h-10 min-w-40"
              >
                {dataModel.map((table) => (
                  <Select.DefaultItem value={table.name} key={table.name}>
                    {table.name}
                  </Select.DefaultItem>
                ))}
              </Select.Default>
            </div>
            <div className="flex gap-2">
              <div className="text-s flex flex-col gap-1">
                <label htmlFor="objectIdField">{t('data:viewer.object_id')}</label>
                <Input
                  type="text"
                  id="objectIdField"
                  value={objectId}
                  onChange={(e) => setObjectId(e.target.value)}
                  className="min-w-96"
                />
              </div>
            </div>
            <Button
              type="button"
              variant="primary"
              disabled={!tableName || !objectId}
              onClick={() => {
                navigate(
                  getRoute('/data/view/:tableName/:objectId', {
                    tableName,
                    objectId,
                  }),
                );
              }}
              className="self-end"
            >
              {t('common:search')}
            </Button>
          </div>
          <Outlet />
        </div>
      </Page.Content>
    </Page.Container>
  );
}
