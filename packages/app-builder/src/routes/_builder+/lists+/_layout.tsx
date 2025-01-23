import { Outlet } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

export const BreadCrumb = () => {
  const { t } = useTranslation(['navigation']);

  return (
    <div className="flex items-center">
      <Icon icon="lists" className="me-2 size-6" />
      {t('navigation:lists')}
    </div>
  );
};

export default function ListsLayout() {
  return <Outlet />;
}
