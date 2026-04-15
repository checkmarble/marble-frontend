import { BreadCrumbLink, type BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import { useDetectionScenarioData } from '@app-builder/hooks/routes-layout-data';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/_app/_builder/detection/scenarios/$scenarioId/test-run')({
  staticData: {
    BreadCrumbs: [
      ({ isLast }: BreadCrumbProps) => {
        const { t } = useTranslation(['scenarios']);
        const { currentScenario } = useDetectionScenarioData();

        return (
          <BreadCrumbLink
            isLast={isLast}
            to="/detection/scenarios/$scenarioId/test-run"
            params={{ scenarioId: fromUUIDtoSUUID(currentScenario.id) }}
          >
            {t('scenarios:testrun.home')}
          </BreadCrumbLink>
        );
      },
    ],
  },
  component: () => <Outlet />,
});
