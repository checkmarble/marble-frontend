import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Tabs, tabClassName } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function DataTabs({ actions }: { actions?: React.ReactNode }) {
  const { t } = useTranslation(['navigation']);

  return (
    <div className="flex flex-col gap-v2-sm">
      <h1 className="text-xl font-bold">{t('navigation:data')}</h1>
      <div className="flex items-center justify-between">
        <Tabs>
          <Link to="/data/list" className={tabClassName}>
            <Icon icon="lists" className="mr-1 size-5" />
            {t('navigation:data.list')}
          </Link>
          <Link to="/data/schema" className={tabClassName}>
            <Icon icon="tree-schema" className="mr-1 size-5" />
            {t('navigation:data.schema')}
          </Link>
          <Link to="/data/view" className={tabClassName}>
            <Icon icon="visibility" className="mr-1 size-5" />
            {t('navigation:data.viewer')}
          </Link>
        </Tabs>
        {actions}
      </div>
    </div>
  );
}
