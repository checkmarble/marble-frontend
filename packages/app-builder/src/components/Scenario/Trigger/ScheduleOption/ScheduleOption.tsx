import { useTranslation } from 'react-i18next';

import { scenarioI18n } from '../../scenario-i18n';
import {
  adaptScheduleOption,
  adaptScheduleOptionToCron,
  isEditableScheduleOption,
} from './models';
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

  return (
    <>
      {!viewOnly && isEditableScheduleOption(schedule) ? (
        <ScheduleOptionEditor
          scheduleOption={adaptScheduleOption(schedule)}
          setScheduleOption={(scheduleOption) => {
            setSchedule(adaptScheduleOptionToCron(scheduleOption));
          }}
        />
      ) : (
        <ScheduleOptionViewer schedule={schedule} />
      )}
      {!hasExportBucket ? (
        <p className="text-s text-red-110">
          {t('scenarios:trigger.schedule_scenario.export_location_warning')}
        </p>
      ) : null}
    </>
  );
}
