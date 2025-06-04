import { casesI18n } from '@app-builder/components/Cases';
import { initServerServices } from '@app-builder/services/init.server';
import { formatDateTimeWithoutPresets, useFormatLanguage } from '@app-builder/utils/format';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { useForm, useStore } from '@tanstack/react-form';
import {
  addDays,
  addHours,
  addMonths,
  isBefore,
  isMonday,
  isSameDay,
  nextMonday,
  startOfHour,
} from 'date-fns';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Button, Calendar, cn, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

const editSnoozeSchema = z.object({
  caseId: z.string(),
  snoozeUntil: z.string().nullable(),
});

type EditSnoozeForm = z.infer<typeof editSnoozeSchema>;

type Durations = 'tomorrow' | 'oneWeek' | 'oneMonth' | 'nextMonday';

// Set all dates to 9:00 AM
const setTo9AM = (date: Date) => {
  const d = new Date(date);
  d.setHours(9, 0, 0, 0);
  return d;
};

const getDurations = () => {
  const now = new Date();
  const tomorrow = addDays(now, 1);
  const oneWeek = addDays(now, 7);
  const oneMonth = addMonths(now, 1);
  const nextMon = nextMonday(now);

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
  const { t } = useTranslation(casesI18n);
  const language = useFormatLanguage();
  const fetcher = useFetcher<typeof action>();
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (date: Date) =>
    formatDateTimeWithoutPresets(date, { language, dateStyle: 'medium', timeStyle: 'short' });

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
        <MenuCommand.Menu open={isOpen} onOpenChange={setIsOpen}>
          <MenuCommand.Trigger>
            <Button
              variant="secondary"
              size="medium"
              className={cn({
                'bg-purple-96': field.state.value,
              })}
            >
              <Icon
                icon={field.state.value ? 'snooze-on' : 'snooze'}
                className="size-5"
                aria-hidden
              />
              {field.state.value ? t('cases:unsnooze_case.title') : t('cases:snooze_case.title')}
            </Button>
          </MenuCommand.Trigger>
          <MenuCommand.Content className="mt-2 min-w-[264px]">
            <MenuCommand.List>
              {getDurations().map(({ duration, date }) => (
                <MenuCommand.Item
                  onSelect={() => {
                    field.handleChange(
                      field.state.value === date.toISOString() ? null : date.toISOString(),
                    );
                    form.handleSubmit();
                  }}
                  key={duration}
                >
                  <span className="text-r inline-flex items-center gap-1">
                    <span>
                      {match(duration)
                        .with('tomorrow', () => t('common:snooze.tomorrow'))
                        .with('oneWeek', () => t('common:snooze.oneWeek'))
                        .with('oneMonth', () => t('common:snooze.oneMonth'))
                        .with('nextMonday', () => t('common:snooze.nextMonday'))
                        .exhaustive()}
                    </span>
                    <span className="text-2xs text-grey-50">{formatDate(date)}</span>
                  </span>
                  {field.state.value && isSameDay(date, new Date(field.state.value)) ? (
                    <Icon icon="tick" className="text-purple-65 size-6" />
                  ) : null}
                </MenuCommand.Item>
              ))}
              {field.state.value && isCustomDate ? (
                <MenuCommand.Item
                  onSelect={() => {
                    field.handleChange(null);
                    form.handleSubmit();
                  }}
                >
                  <span className="text-r inline-flex h-full items-center gap-1">
                    <span>{t('common:snooze.custom')}</span>
                    <span className="text-2xs text-grey-50">
                      {formatDate(new Date(field.state.value))}
                    </span>
                  </span>
                  <Icon icon="tick" className="text-purple-65 size-6" />
                </MenuCommand.Item>
              ) : (
                <MenuCommand.SubMenu
                  arrow={false}
                  hover={false}
                  trigger={
                    <>
                      <span className="text-r inline-flex h-full items-center gap-1">
                        <span>{t('common:snooze.custom')}</span>
                        {field.state.value && isCustomDate ? (
                          <span className="text-2xs text-grey-50">
                            {formatDate(new Date(field.state.value))}
                          </span>
                        ) : null}
                      </span>
                      {field.state.value && isCustomDate ? (
                        <Icon icon="tick" className="text-purple-65 size-6" />
                      ) : null}
                    </>
                  }
                >
                  <MenuCommand.List>
                    <Calendar
                      mode="single"
                      selected={field.state.value ? new Date(field.state.value) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          field.handleChange(
                            isBefore(date, new Date())
                              ? startOfHour(addHours(new Date(), 3)).toISOString()
                              : setTo9AM(date).toISOString(),
                          );
                          setIsOpen(false);
                          form.handleSubmit();
                        }
                      }}
                    />
                  </MenuCommand.List>
                </MenuCommand.SubMenu>
              )}
            </MenuCommand.List>
          </MenuCommand.Content>
        </MenuCommand.Menu>
      )}
    </form.Field>
  );
}
