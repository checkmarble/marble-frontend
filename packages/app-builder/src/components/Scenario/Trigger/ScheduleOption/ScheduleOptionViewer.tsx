import { formatSchedule } from '@app-builder/utils/format';
import { Trans, useTranslation } from 'react-i18next';

import { scenarioI18n } from '../../scenario-i18n';

export const ScheduleOptionViewer = ({ schedule }: { schedule: string }) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(scenarioI18n);

  return (
    <p className="text-s text-grey-100 font-normal">
      <Trans
        t={t}
        i18nKey="scenarios:scheduled"
        components={{
          ScheduleLocale: <span style={{ fontWeight: 'bold' }} />,
        }}
        values={{
          schedule: formatSchedule(schedule, {
            language,
          }),
        }}
      />
    </p>
  );
};
