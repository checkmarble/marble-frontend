import { getRoute } from '@app-builder/utils/routes';
import { NavLink } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { Tabs, tabClassName } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function DataTabs() {
  const { t } = useTranslation(['navigation']);

  return (
    <Tabs>
      <NavLink to={getRoute('/data/list')} className={tabClassName}>
        <Icon icon="lists" className="mr-1 size-5" />
        {t('navigation:data.list')}
      </NavLink>
      <NavLink to={getRoute('/data/schema')} className={tabClassName}>
        <Icon icon="tree-schema" className="mr-1 size-5" />
        {t('navigation:data.schema')}
      </NavLink>
      <NavLink to={getRoute('/data/view')} className={tabClassName}>
        <Icon icon="visibility" className="mr-1 size-5" />
        {t('navigation:data.viewer')}
      </NavLink>
    </Tabs>
  );
}
