import { Page } from '@app-builder/components';
import { fromUUID } from '@app-builder/utils/short-uuid';
import { useCurrentScenario } from './_layout';
import { Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { getRoute } from '@app-builder/utils/routes';

export const handle = {
  i18n: ['scenarios', 'navigation', 'common'] satisfies Namespace,
};

export default function TestRun() {
  const { t } = useTranslation(handle.i18n);
  const currentScenario = useCurrentScenario();

  return (
    <Page.Main>
      <Page.Header className="gap-4">
        <Page.BackLink
          to={getRoute('/scenarios/:scenarioId/test-run', {
            scenarioId: fromUUID(currentScenario.id),
          })}
        />
        <p className="line-clamp-2 text-start">{currentScenario.name}</p>
        <p className="text-grey-50 line-clamp-2">
          {t('scenarios:home.testrun')}
        </p>
      </Page.Header>

      <Page.Container>
        <Page.Description>
          {t('scenarios:testrun.description')}
        </Page.Description>
        <Page.Content className="max-w-screen-lg">POULOP</Page.Content>
      </Page.Container>
    </Page.Main>
  );
}
