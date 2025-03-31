import { casesI18n } from '@app-builder/components/Cases';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { useForm, useStore } from '@tanstack/react-form';
import { addDays, addMonths, format, isMonday, isSameDay, isThisMonth, nextMonday } from 'date-fns';
import { type Namespace } from 'i18next';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Button, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

export const handle = {
  i18n: [...casesI18n, 'common'] satisfies Namespace,
};

const editSnoozeSchema = z.object({
  caseId: z.string(),
  snoozeUntil: z.string().nullable(),
});

type EditSnoozeForm = z.infer<typeof editSnoozeSchema>;

type Durations = 'tomorrow' | 'oneWeek' | 'oneMonth' | 'nextMonday';

const getDurations = () => {
  const now = new Date();
  const tomorrow = addDays(now, 1);
  const oneWeek = addDays(now, 7);
  const oneMonth = addMonths(now, 1);
  const nextMon = nextMonday(now);

  // Set all dates to 9:00 AM
  const setTo9AM = (date: Date) => {
    const d = new Date(date);
    d.setHours(9, 0, 0, 0);
    return d;
  };

  const options: { duration: Durations; date: Date }[] = [
    { duration: 'tomorrow', date: setTo9AM(tomorrow) },
    { duration: 'oneWeek', date: setTo9AM(oneWeek) },
    { duration: 'oneMonth', date: setTo9AM(oneMonth) },
  ];

  // Only add "Next Monday" if it's not tomorrow and not in a week
  if (!isMonday(tomorrow) && !isSameDay(nextMon, oneWeek)) {
    options.splice(1, 0, { duration: 'nextMonday', date: setTo9AM(nextMon) });
  }

  return options;
};

export async function action({ request }: ActionFunctionArgs) {
  const { authService } = initServerServices(request);

  const [raw, { cases }] = await Promise.all([
    request.json(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const { success, data } = editSnoozeSchema.safeParse(raw);

  if (!success) return { success: 'false' };

  await (data.snoozeUntil
    ? cases.snoozeCase({ caseId: data.caseId, snoozeUntil: data.snoozeUntil })
    : cases.unsnoozeCase(data));

  return { success: 'true' };
}

export function SnoozeCase({
  caseId,
  snoozeUntil,
}: Pick<EditSnoozeForm, 'caseId'> & { snoozeUntil?: string }) {
  const { t } = useTranslation(handle.i18n);
  const fetcher = useFetcher<typeof action>();

  const formatDate = (date: Date) =>
    isThisMonth(date) ? format(date, 'EEE h:mm a') : format(date, 'EEE, MMM d, h:mm a');

  const form = useForm({
    onSubmit: ({ value }) => {
      const finalValue = {
        ...value,
        snoozeUntil: snoozeUntil ? null : value.snoozeUntil,
      };

      fetcher.submit(finalValue, {
        method: 'PATCH',
        action: getRoute('/ressources/cases/snooze-case'),
        encType: 'application/json',
      });
    },
    validators: {
      onChangeAsync: editSnoozeSchema,
      onBlurAsync: editSnoozeSchema,
      onSubmitAsync: editSnoozeSchema,
    },
    defaultValues: {
      snoozeUntil: snoozeUntil ?? null,
      caseId: caseId,
    } as EditSnoozeForm,
  });

  const selectedDate = useStore(form.store, (state) => state.values.snoozeUntil);

  const isCustomDate = useMemo(() => {
    if (!selectedDate) return false;
    const availableDates = getDurations().map(({ date }) => date);
    return !availableDates.some((date) => isSameDay(date, new Date(selectedDate)));
  }, [selectedDate]);

  return (
    <form.Field name="snoozeUntil">
      {(field) => (
        <MenuCommand.Menu>
          <MenuCommand.Trigger>
            <Button variant="secondary" size="medium">
              <Icon icon="snooze" className="size-5" aria-hidden />
              {t('cases:snooze.title')}
            </Button>
          </MenuCommand.Trigger>
          <MenuCommand.Content className="mt-2 min-w-[250px]">
            <MenuCommand.List>
              {getDurations().map(({ duration, date }) => (
                <MenuCommand.Item
                  onSelect={() => {
                    field.handleChange(date.toISOString());
                    form.handleSubmit();
                  }}
                  key={duration}
                  className="cursor-pointer items-end"
                >
                  <span className="text-r inline-flex items-center gap-1">
                    <span>
                      {match(duration)
                        .with('tomorrow', () => 'Tomorrow')
                        .with('oneWeek', () => 'Next week')
                        .with('oneMonth', () => 'Next month')
                        .with('nextMonday', () => 'Next Monday')
                        .exhaustive()}
                    </span>
                    <span className="text-2xs text-grey-50">{formatDate(date)}</span>
                  </span>
                  {field.state.value && isSameDay(date, new Date(field.state.value)) ? (
                    <Icon icon="tick" className="text-purple-65 size-6" />
                  ) : null}
                </MenuCommand.Item>
              ))}
              <MenuCommand.Item key="custom" className="cursor-pointer">
                <span className="text-r inline-flex items-center gap-1">
                  <span>Custom</span>
                  {field.state.value && isCustomDate ? (
                    <span className="text-2xs text-grey-50">
                      {formatDate(new Date(field.state.value))}
                    </span>
                  ) : null}
                </span>
              </MenuCommand.Item>
            </MenuCommand.List>
          </MenuCommand.Content>
        </MenuCommand.Menu>
      )}
    </form.Field>
  );
}
