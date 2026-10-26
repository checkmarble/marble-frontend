import { createFormHook } from '@tanstack/react-form';

import { ScheduleOption } from './ScheduleOption';
import { fieldContext, formContext } from './schedule-form-context';

const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: { ScheduleOption },
  formComponents: {},
});

export function useScheduleForm(schedule: string, onSubmit: (schedule: string) => Promise<void>) {
  return useAppForm({
    defaultValues: { schedule },
    onSubmit: ({ value }) => onSubmit(value.schedule),
  });
}
