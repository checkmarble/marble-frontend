import { Callout, Paper } from '@app-builder/components';
import { TriggerCondition } from '@app-builder/components/Scenario/Trigger/Trigger';
import { formatSchedule } from '@app-builder/utils/format';
import { type Namespace } from 'i18next';
import { toast } from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';

import { useCurrentScenarioIteration } from '../../$iterationId';

export const handle = {
  i18n: ['scenarios', 'common'] satisfies Namespace,
};

export default function Trigger() {
  const { t } = useTranslation(handle.i18n);

  return (
    <Paper.Container className="max-w-3xl">
      <HowToRun />

      <div className="flex flex-col gap-2 lg:gap-4">
        <Paper.Title>{t('scenarios:trigger.trigger_object.title')}</Paper.Title>
        <Callout className="w-fit">
          {t('scenarios:trigger.trigger_object.callout')}
        </Callout>
      </div>

      <TriggerCondition />
    </Paper.Container>
  );
}

function HowToRun() {
  const { t, i18n } = useTranslation(handle.i18n);

  const { scenarioId, schedule } = useCurrentScenarioIteration();

  return (
    <div className="flex flex-col gap-2 lg:gap-4">
      <Paper.Title>{t('scenarios:trigger.run_scenario.title')}</Paper.Title>

      <p className="text-s text-grey-100 font-normal">
        {schedule ? (
          <Trans
            t={t}
            i18nKey="scenarios:scheduled"
            components={{
              ScheduleLocale: <span style={{ fontWeight: 'bold' }} />,
            }}
            values={{
              schedule: formatSchedule(schedule, { language: i18n.language }),
            }}
          />
        ) : (
          <>
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
          </>
        )}
      </p>
    </div>
  );
}
