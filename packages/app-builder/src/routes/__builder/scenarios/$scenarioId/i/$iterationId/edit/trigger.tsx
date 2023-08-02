import { Callout, Paper } from '@app-builder/components';
import { EditAstNode, RootOrOperator } from '@app-builder/components/Edit';
import { Button } from '@ui-design-system';
import { type Namespace } from 'i18next';
import { toast } from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';

import { useCurrentScenarioIteration } from '../../$iterationId';

export const handle = {
  i18n: ['scenarios', 'common'] satisfies Namespace,
};

export default function Trigger() {
  const { t } = useTranslation(handle.i18n);

  const { scenarioId } = useCurrentScenarioIteration();

  return (
    <div>
      <Paper.Container scrollable={false}>
        <div className="flex flex-col gap-2 lg:gap-4">
          <Paper.Title>{t('scenarios:trigger.run_scenario.title')}</Paper.Title>
          <p className="text-s text-grey-100 font-normal">
            <Trans
              t={t}
              i18nKey="scenarios:trigger.run_scenario.description.docs"
              components={{
                DocLink: (
                  // eslint-disable-next-line jsx-a11y/anchor-has-content
                  <a
                    className="text-purple-100"
                    href="https://docs.checkmarble.com/reference/introduction-1"
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                ),
              }}
            />
            <br />
            <Trans
              t={t}
              i18nKey="scenarios:trigger.run_scenario.description.scenario_id"
              components={{
                ScenarioIdLabel: <code className="select-none" />,
                ScenarioIdValue: (
                  <code
                    aria-hidden="true"
                    className="border-grey-10 cursor-pointer select-none rounded-sm border px-1"
                    onClick={() => {
                      void navigator.clipboard
                        .writeText(scenarioId)
                        .then(() => {
                          toast.success(
                            t('common:clipboard.copy', {
                              replace: { value: scenarioId },
                            })
                          );
                        });
                    }}
                  />
                ),
              }}
              values={{
                scenarioId: scenarioId,
              }}
            />
          </p>
        </div>

        <div className="flex flex-col gap-2 lg:gap-4">
          <Paper.Title>
            {t('scenarios:trigger.trigger_object.title')}
          </Paper.Title>
          <Callout>{t('scenarios:trigger.trigger_object.callout')}</Callout>
        </div>
        <RootOrOperator
          renderAstNode={({ name }) => <EditAstNode name={name} />}
        />
      </Paper.Container>
      <Button type="submit" className="w-fit">
        {t('common:save')}
      </Button>
    </div>
  );
}
