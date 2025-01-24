import { Outlet } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

export const BreadCrumb = () => {
  const { t } = useTranslation(['navigation']);

  return (
    <div className="flex flex-row items-center">
      <Icon icon="scenarios" className="me-2 size-6" />
      <span>{t('navigation:scenarios')}</span>
    </div>
  );
};

export default function ScenarioLayout() {
  return <Outlet />;
}
