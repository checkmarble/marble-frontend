import { Outlet } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

export const BreadCrumb = () => {
  const { t } = useTranslation(['navigation', 'cases']);

  return (
    <div className="flex items-center">
      <Icon icon="case-manager" className="me-2 size-6" />
      {t('navigation:case_manager')}
    </div>
  );
};

export default function CasesLayout() {
  return <Outlet />;
}
