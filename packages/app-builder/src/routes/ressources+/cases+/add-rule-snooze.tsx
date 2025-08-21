import { Callout } from '@app-builder/components';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { LoadingIcon } from '@app-builder/components/Spinner';
import { adaptDateTimeFieldCodes, type DurationUnit } from '@app-builder/models/duration';
import { isStatusConflictHttpError } from '@app-builder/models/http-errors';
import { ruleSnoozesDocHref } from '@app-builder/services/documentation-href';
import { initServerServices } from '@app-builder/services/init.server';
import { getFieldErrors } from '@app-builder/utils/form';
import { useFormatLanguage } from '@app-builder/utils/format';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { useForm } from '@tanstack/react-form';
import { useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Temporal } from 'temporal-polyfill';
import { Button, ModalV2, Select, TextArea } from 'ui-design-system';
import { z } from 'zod/v4';

const durationUnitOptions = ['hours', 'days', 'weeks'] as const;

const addRuleSnoozeFormSchema = z.object({
  decisionId: z.string(),
  ruleId: z.string(),
  comment: z.string().optional(),
  durationValue: z.number().min(1),
  durationUnit: z.enum(durationUnitOptions),
});

type AddRuleSnoozeForm = z.infer<typeof addRuleSnoozeFormSchema>;

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
  } = initServerServices(request);

  const [t, session, rawData, { decision }] = await Promise.all([
    getFixedT(request, ['common', 'cases']),
    getSession(request),
    request.json(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const { data, success, error } = addRuleSnoozeFormSchema.safeParse(rawData);

  if (!success) {
    return json(
      { status: 'error', errors: z.treeifyError(error) },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }

  const { decisionId, ruleId, comment, durationUnit, durationValue } = data;

  const duration = Temporal.Duration.from({
    [durationUnit]: durationValue,
  });

  if (
    Temporal.Duration.compare(duration, Temporal.Duration.from({ days: 180 }), {
      relativeTo: Temporal.Now.plainDateTime('gregory'),
    }) >= 0
  ) {
    return json(
      {
        status: 'error',
        errors: [
          {
            durationValue: [t('cases:case_detail.add_rule_snooze.errors.max_duration')],
          },
        ],
      },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }

  try {
    await decision.createSnoozeForDecision(decisionId, {
      ruleId,
      duration,
      comment,
    });

    return { status: 'success', errors: [] };
  } catch (error) {
    setToastMessage(session, {
      type: 'error',
      message: isStatusConflictHttpError(error)
        ? t('cases:case_detail.add_rule_snooze.errors.duplicate_rule_snooze')
        : t('common:errors.unknown'),
    });

    return json(
      { status: 'error', errors: [] },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }
}

export function AddRuleSnooze({
  decisionId,
  ruleId,
  children,
}: {
  children: React.ReactElement;
  decisionId: string;
  ruleId: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <ModalV2.Root open={open} setOpen={setOpen}>
      <ModalV2.Trigger render={children} />
      <ModalV2.Content>
        <AddRuleSnoozeContent setOpen={setOpen} decisionId={decisionId} ruleId={ruleId} />
      </ModalV2.Content>
    </ModalV2.Root>
  );
}

function AddRuleSnoozeContent({
  decisionId,
  ruleId,
  setOpen,
}: {
  decisionId: string;
  ruleId: string;
  setOpen: (open: boolean) => void;
}) {
  const { t } = useTranslation(['common', 'cases']);
  const language = useFormatLanguage();
  const fetcher = useFetcher<typeof action>();
  const dateTimeFieldNames = useMemo(
    () =>
      new Intl.DisplayNames(language, {
        type: 'dateTimeField',
      }),
    [language],
  );

  useEffect(() => {
    if (fetcher?.data?.status === 'success') {
      setOpen(false);
    }
  }, [setOpen, fetcher?.data?.status]);

  const form = useForm({
    defaultValues: {
      decisionId,
      ruleId,
      durationValue: 1,
      durationUnit: 'days',
    } as AddRuleSnoozeForm,
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        fetcher.submit(value, {
          method: 'POST',
          action: getRoute('/ressources/cases/add-rule-snooze'),
          encType: 'application/json',
        });
      }
    },
    validators: {
      onSubmit: addRuleSnoozeFormSchema,
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <ModalV2.Title>{t('cases:case_detail.add_rule_snooze.title')}</ModalV2.Title>
      <div className="flex flex-col gap-6 p-6">
        <ModalV2.Description render={<Callout variant="outlined" />}>
          <p className="whitespace-pre-wrap">
            <Trans
              t={t}
              i18nKey="cases:case_detail.add_rule_snooze.callout"
              components={{
                DocLink: <ExternalLink href={ruleSnoozesDocHref} />,
              }}
            />
          </p>
        </ModalV2.Description>

        <form.Field
          name="comment"
          validators={{
            onBlur: addRuleSnoozeFormSchema.shape.comment,
            onChange: addRuleSnoozeFormSchema.shape.comment,
          }}
        >
          {(field) => (
            <div className="row-span-full grid grid-rows-subgrid gap-2">
              <FormLabel name={field.name}>
                {t('cases:case_detail.add_rule_snooze.comment.label')}
              </FormLabel>
              <TextArea
                className="w-full"
                defaultValue={field.state.value}
                onChange={(e) => field.handleChange(e.currentTarget.value)}
                name={field.name}
                onBlur={field.handleBlur}
                borderColor={field.state.meta.errors.length === 0 ? 'greyfigma-90' : 'redfigma-47'}
                placeholder={t('cases:case_detail.add_rule_snooze.comment.placeholder')}
              />
            </div>
          )}
        </form.Field>

        <div className="grid w-full grid-cols-2 grid-rows-[repeat(3,max-content)] gap-2">
          <form.Field
            name="durationValue"
            validators={{
              onBlur: addRuleSnoozeFormSchema.shape.durationValue,
              onChange: addRuleSnoozeFormSchema.shape.durationValue,
            }}
          >
            {(field) => (
              <div className="row-span-full grid grid-rows-subgrid gap-2">
                <FormLabel name={field.name} valid={field.state.meta.errors.length === 0}>
                  {t('cases:case_detail.add_rule_snooze.duration_value')}
                </FormLabel>
                <FormInput
                  type="number"
                  name={field.name}
                  defaultValue={field.state.value}
                  onChange={(e) => field.handleChange(+e.currentTarget.value)}
                  onBlur={field.handleBlur}
                  valid={field.state.meta.errors.length === 0}
                  className="w-full"
                />
                <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
              </div>
            )}
          </form.Field>

          <form.Field
            name="durationUnit"
            validators={{
              onBlur: addRuleSnoozeFormSchema.shape.durationUnit,
              onChange: addRuleSnoozeFormSchema.shape.durationUnit,
            }}
          >
            {(field) => (
              <div className="row-span-full grid grid-rows-subgrid gap-2">
                <FormLabel name={field.name}>
                  {t('cases:case_detail.add_rule_snooze.duration_unit')}
                </FormLabel>
                <Select.Default
                  className="h-10 w-full"
                  defaultValue={field.state.value}
                  onValueChange={(unit) =>
                    field.handleChange(
                      unit as Exclude<DurationUnit, 'seconds' | 'years' | 'minutes' | 'months'>,
                    )
                  }
                >
                  {durationUnitOptions.map((unit) => (
                    <Select.DefaultItem key={unit} value={unit}>
                      {dateTimeFieldNames.of(adaptDateTimeFieldCodes(unit))}
                    </Select.DefaultItem>
                  ))}
                </Select.Default>
                <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
              </div>
            )}
          </form.Field>
        </div>

        <div className="flex flex-1 flex-row gap-2">
          <ModalV2.Close render={<Button className="flex-1" variant="secondary" />}>
            {t('common:cancel')}
          </ModalV2.Close>
          <Button className="flex-1" variant="primary" type="submit" name="update">
            <LoadingIcon
              icon="snooze"
              className="size-5"
              loading={fetcher.state === 'submitting'}
            />
            {t('cases:decisions.rule.snooze')}
          </Button>
        </div>
      </div>
    </form>
  );
}
