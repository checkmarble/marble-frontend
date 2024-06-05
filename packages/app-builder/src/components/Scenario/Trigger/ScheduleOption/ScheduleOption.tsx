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
  viewOnly,
}: {
  schedule: string;
  setSchedule: (schedule: string) => void;
  viewOnly?: boolean;
}) {
  if (!viewOnly && isEditableScheduleOption(schedule)) {
    return (
      <ScheduleOptionEditor
        scheduleOption={adaptScheduleOption(schedule)}
        setScheduleOption={(scheduleOption) => {
          setSchedule(adaptScheduleOptionToCron(scheduleOption));
        }}
      />
    );
  }
  return <ScheduleOptionViewer schedule={schedule} />;
}
