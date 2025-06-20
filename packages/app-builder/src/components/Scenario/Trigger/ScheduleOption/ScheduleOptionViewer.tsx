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
    } catch (_e) {
      return undefined;
    }
  }, [language, schedule]);

  if (!formattedSchedule) return t('scenarios:no_scheduled');

  return (
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
  );
};
