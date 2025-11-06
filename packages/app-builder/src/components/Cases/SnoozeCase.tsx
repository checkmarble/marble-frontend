import { casesI18n } from '@app-builder/components/Cases';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import {
  type SnoozeCasePayload,
  snoozeCasePayloadSchema,
  useSnoozeCaseMutation,
} from '@app-builder/queries/cases/snooze-case';
import { formatDateTimeWithoutPresets, useFormatLanguage } from '@app-builder/utils/format';
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
  startOfTomorrow,
} from 'date-fns';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { ButtonV2, Calendar, cn, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';

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

export function SnoozeCase({ caseId, snoozeUntil }: Pick<SnoozeCasePayload, 'caseId'> & { snoozeUntil?: string }) {
  const { t } = useTranslation(casesI18n);
  const language = useFormatLanguage();
  const snoozeCaseMutation = useSnoozeCaseMutation();
  const revalidate = useLoaderRevalidator();
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (date: Date) =>
    formatDateTimeWithoutPresets(date, { language, dateStyle: 'medium', timeStyle: 'short' });

  const form = useForm({
    onSubmit: ({ value }) => {
      const finalValue = {
        ...value,
        snoozeUntil: snoozeUntil ? null : value.snoozeUntil,
      };

      snoozeCaseMutation.mutateAsync(finalValue).then(() => {
        revalidate();
      });
    },
    validators: {
      onSubmitAsync: snoozeCasePayloadSchema,
    },
    defaultValues: {
      snoozeUntil: snoozeUntil ?? null,
      caseId: caseId,
    } as SnoozeCasePayload,
  });

  useStore(form.store, (state) => state.values.snoozeUntil);

  return (
    <form.Field
      name="snoozeUntil"
      validators={{
        onBlur: snoozeCasePayloadSchema.shape.snoozeUntil,
        onChange: snoozeCasePayloadSchema.shape.snoozeUntil,
      }}
    >
      {(field) =>
        field.state.value ? (
          <ButtonV2
            variant="secondary"
            className={cn({
              'bg-purple-96': field.state.value,
            })}
            onClick={() => {
              field.handleChange(null);
              form.handleSubmit();
            }}
          >
            <Icon icon="snooze-on" className="size-5" aria-hidden />
            {t('cases:unsnooze_case.title')}
          </ButtonV2>
        ) : (
          <MenuCommand.Menu open={isOpen} onOpenChange={setIsOpen}>
            <MenuCommand.Trigger>
              <ButtonV2 variant="secondary">
                <Icon icon="snooze" className="size-5" aria-hidden />
                {t('cases:snooze_case.title')}
              </ButtonV2>
            </MenuCommand.Trigger>
            <MenuCommand.Content className="mt-2 min-w-[264px]">
              <MenuCommand.List>
                {getDurations().map(({ duration, date }) => (
                  <MenuCommand.Item
                    onSelect={() => {
                      field.handleChange(field.state.value === date.toISOString() ? null : date.toISOString());
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
                  </MenuCommand.Item>
                ))}
                <MenuCommand.SubMenu
                  arrow={false}
                  hover={false}
                  trigger={
                    <>
                      <span className="text-r inline-flex h-full items-center gap-1">
                        <span>{t('common:snooze.custom')}</span>
                      </span>
                    </>
                  }
                >
                  <MenuCommand.List>
                    <Calendar
                      mode="single"
                      selected={field.state.value ? new Date(field.state.value) : undefined}
                      disabled={{ before: startOfTomorrow() }}
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
              </MenuCommand.List>
            </MenuCommand.Content>
          </MenuCommand.Menu>
        )
      }
    </form.Field>
  );
}
