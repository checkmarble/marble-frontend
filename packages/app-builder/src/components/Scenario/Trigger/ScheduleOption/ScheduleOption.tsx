import { adaptScheduleOption, adaptScheduleOptionToCron, isEditableScheduleOption } from './models';
import { ScheduleOptionEditor } from './ScheduleOptionEditor';
import { ScheduleOptionViewer } from './ScheduleOptionViewer';

export function ScheduleOption({
  schedule,
  setSchedule,
  viewOnly,
  deduplicationEnabled,
}: {
  schedule: string;
  setSchedule: (schedule: string) => void;
  viewOnly?: boolean;
  deduplicationEnabled?: boolean;
}) {
  if (!viewOnly && isEditableScheduleOption(schedule)) {
    return (
      <ScheduleOptionEditor
        scheduleOption={adaptScheduleOption(schedule)}
        setScheduleOption={(scheduleOption) => {
          setSchedule(adaptScheduleOptionToCron(scheduleOption));
        }}
        deduplicationEnabled={deduplicationEnabled}
      />
    );
  }
  return <ScheduleOptionViewer schedule={schedule} />;
}
