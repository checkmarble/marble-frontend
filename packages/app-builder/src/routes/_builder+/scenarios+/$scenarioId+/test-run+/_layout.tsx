import { Outlet } from '@remix-run/react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

export const BreadCrumb = () => {
  const { t } = useTranslation(['scenarios']);

  return (
    <div className={clsx('flex flex-row items-center gap-4')}>
      <p className="line-clamp-2 text-start">{t('scenarios:testrun.home')}</p>
    </div>
  );
};

export const TestRunLayout = () => {
  return <Outlet />;
};
