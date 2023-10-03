import { useTranslation } from 'react-i18next';

import { scenarioI18n } from '../../scenario-i18n';
import {
  adaptCronToScheduleOption,
  adaptScheduleOptionToCron,
} from './ScheduleOption.models';
import { ScheduleOptionEditor } from './ScheduleOptionEditor';
import { ScheduleOptionViewer } from './ScheduleOptionViewer';

export function ScheduleOption({
  schedule,
  setSchedule,
  hasExportBucket,
  viewOnly,
}: {
  schedule: string;
  setSchedule: (schedule: string) => void;
  hasExportBucket: boolean;
  viewOnly?: boolean;
}) {
  const { t } = useTranslation(scenarioI18n);
  const scheduleOption = adaptCronToScheduleOption(schedule ?? '');

  return (
    <>
      {viewOnly || scheduleOption === undefined ? (
        <ScheduleOptionViewer schedule={schedule} />
      ) : (
        <ScheduleOptionEditor
          scheduleOption={scheduleOption}
          setScheduleOption={(scheduleOption) => {
            setSchedule(adaptScheduleOptionToCron(scheduleOption));
          }}
        />
      )}
      {!hasExportBucket && (
        <p className="text-s text-red-110">
          {t('scenarios:trigger.schedule_scenario.export_location_warning')}
        </p>
      )}
    </>
  );
}
