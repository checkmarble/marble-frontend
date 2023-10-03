import { formatSchedule } from '@app-builder/utils/format';
import { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { scenarioI18n } from '../../scenario-i18n';

export const ScheduleOptionViewer = ({ schedule }: { schedule: string }) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(scenarioI18n);

  const formattedSchedule = useMemo(() => {
    try {
      return formatSchedule(schedule, {
        language,
        throwExceptionOnParseError: true,
      });
    } catch (e) {}
  }, [language, schedule]);

  if (!formattedSchedule) return null;

  return (
    <p className="text-s text-grey-100 font-normal">
      <Trans
        t={t}
        i18nKey="scenarios:scheduled"
        components={{
          ScheduleLocale: <span style={{ fontWeight: 'bold' }} />,
        }}
        values={{
          schedule: formattedSchedule,
        }}
      />
    </p>
  );
};
