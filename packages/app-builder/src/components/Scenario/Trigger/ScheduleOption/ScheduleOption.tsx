import { adaptScheduleOption, adaptScheduleOptionToCron, isEditableScheduleOption } from './models';
import { ScheduleOptionEditor } from './ScheduleOptionEditor';
import { ScheduleOptionViewer } from './ScheduleOptionViewer';
import { useFieldContext } from './schedule-form-context';

interface ScheduleOptionProps {
  viewOnly?: boolean;
  deduplicationEnabled?: boolean;
}

export function ScheduleOption({ viewOnly, deduplicationEnabled }: ScheduleOptionProps) {
  const field = useFieldContext<string>();
  const schedule = field.state.value;

  if (!viewOnly && isEditableScheduleOption(schedule)) {
    return (
      <ScheduleOptionEditor
        scheduleOption={adaptScheduleOption(schedule)}
        setScheduleOption={(scheduleOption) => {
          field.handleChange(adaptScheduleOptionToCron(scheduleOption));
        }}
        deduplicationEnabled={deduplicationEnabled}
      />
    );
  }

  return <ScheduleOptionViewer schedule={schedule} />;
}
