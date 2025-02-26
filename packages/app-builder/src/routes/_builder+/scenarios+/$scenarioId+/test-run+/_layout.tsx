import { BreadCrumbLink, type BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUID } from '@app-builder/utils/short-uuid';
import { Outlet } from '@remix-run/react';
import { useTranslation } from 'react-i18next';

import { useCurrentScenario } from '../_layout';

export const handle = {
  BreadCrumbs: [
    ({ isLast }: BreadCrumbProps) => {
      const { t } = useTranslation(['scenarios']);
      const currentScenario = useCurrentScenario();

      return (
        <BreadCrumbLink
          isLast={isLast}
          to={getRoute('/scenarios/:scenarioId/test-run', {
            scenarioId: fromUUID(currentScenario.id),
          })}
        >
          {t('scenarios:testrun.home')}
        </BreadCrumbLink>
      );
    },
  ],
};

export const TestRunLayout = () => {
  return <Outlet />;
};
