import { Callout } from '@app-builder/components';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { FormErrorOrDescription } from '@app-builder/components/Form/FormErrorOrDescription';
import { FormField } from '@app-builder/components/Form/FormField';
import { FormInput } from '@app-builder/components/Form/FormInput';
import { FormLabel } from '@app-builder/components/Form/FormLabel';
import { FormSelect } from '@app-builder/components/Form/FormSelect';
import { FormTextArea } from '@app-builder/components/Form/FormTextArea';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { LoadingIcon } from '@app-builder/components/Spinner';
import { adaptDateTimeFieldCodes } from '@app-builder/models/duration';
import { isStatusConflictHttpError } from '@app-builder/models/http-errors';
import { ruleSnoozesDocHref } from '@app-builder/services/documentation-href';
import { serverServices } from '@app-builder/services/init.server';
import { useFormatLanguage } from '@app-builder/utils/format';
import { getRoute } from '@app-builder/utils/routes';
import {
  FormProvider,
  getFormProps,
  getInputProps,
  useForm,
} from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Temporal } from 'temporal-polyfill';
import { Button, ModalV2 } from 'ui-design-system';
import { z } from 'zod';

const durationUnitOptions = ['days', 'weeks', 'hours'] as const;

const addRuleSnoozeFormSchema = z.object({
  decisionId: z.string(),
  ruleId: z.string(),
  comment: z.string().optional(),
  durationValue: z.number().min(1),
  durationUnit: z.enum(durationUnitOptions),
});

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
  } = serverServices;
  const { decision } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const formData = await request.formData();
  const submission = parseWithZod(formData, {
    schema: addRuleSnoozeFormSchema,
  });

  if (submission.status !== 'success') {
    return json(submission.reply());
  }

  const { decisionId, ruleId, comment, durationUnit, durationValue } =
    submission.value;
  const duration = Temporal.Duration.from({
    [durationUnit]: durationValue,
  });

  if (
    Temporal.Duration.compare(duration, Temporal.Duration.from({ days: 180 }), {
      relativeTo: Temporal.Now.plainDateTime('gregory'),
    }) >= 0
  ) {
    const t = await getFixedT(request, ['cases']);
    return json(
      submission.reply({
        fieldErrors: {
          durationValue: [
            t('cases:case_detail.add_rule_snooze.errors.max_duration'),
          ],
        },
      }),
    );
  }

  try {
    await decision.createSnoozeForDecision(decisionId, {
      ruleId,
      duration,
      comment,
    });

    return json(submission.reply());
  } catch (error) {
    const session = await getSession(request);
    const t = await getFixedT(request, ['common', 'cases']);

    let message: string;
    if (isStatusConflictHttpError(error)) {
      message = t(
        'cases:case_detail.add_rule_snooze.errors.duplicate_rule_snooze',
      );
    } else {
      message = t('common:errors.unknown');
    }

    setToastMessage(session, {
      type: 'error',
      message,
    });

    return json(submission.reply({ formErrors: [message] }), {
      headers: { 'Set-Cookie': await commitSession(session) },
    });
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
  const [open, setOpen] = React.useState(false);

  return (
    <ModalV2.Root open={open} setOpen={setOpen}>
      <ModalV2.Trigger render={children} />
      <ModalV2.Content>
        <AddRuleSnoozeContent
          setOpen={setOpen}
          decisionId={decisionId}
          ruleId={ruleId}
        />
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
  const dateTimeFieldNames = React.useMemo(
    () =>
      new Intl.DisplayNames(language, {
        type: 'dateTimeField',
      }),
    [language],
  );

  const fetcher = useFetcher<typeof action>();
  React.useEffect(() => {
    if (fetcher?.data?.status === 'success') {
      setOpen(false);
    }
  }, [setOpen, fetcher?.data?.status]);

  const [form, fields] = useForm({
    shouldRevalidate: 'onInput',
    defaultValue: {
      decisionId,
      ruleId,
      durationValue: 1,
      durationUnit: 'days',
    },
    lastResult: fetcher.data,
    constraint: getZodConstraint(addRuleSnoozeFormSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: addRuleSnoozeFormSchema,
      });
    },
  });

  return (
    <FormProvider context={form.context}>
      <fetcher.Form
        method="post"
        action={getRoute('/ressources/cases/add-rule-snooze')}
        {...getFormProps(form)}
      >
        <ModalV2.Title>
          {t('cases:case_detail.add_rule_snooze.title')}
        </ModalV2.Title>
        <div className="flex flex-col gap-6 p-6">
          <ModalV2.Description render={<Callout variant="outlined" />}>
            <p className="whitespace-pre text-wrap">
              <Trans
                t={t}
                i18nKey="cases:case_detail.add_rule_snooze.callout"
                components={{
                  DocLink: <ExternalLink href={ruleSnoozesDocHref} />,
                }}
              />
            </p>
          </ModalV2.Description>
          <input
            {...getInputProps(fields.decisionId, {
              type: 'hidden',
            })}
          />
          <input
            {...getInputProps(fields.ruleId, {
              type: 'hidden',
            })}
          />

          <FormField
            name={fields.comment.name}
            className="row-span-full grid grid-rows-subgrid gap-2"
          >
            <FormLabel>
              {t('cases:case_detail.add_rule_snooze.comment.label')}
            </FormLabel>
            <FormTextArea
              className="w-full"
              placeholder={t(
                'cases:case_detail.add_rule_snooze.comment.placeholder',
              )}
            />
          </FormField>

          <div className="grid w-full grid-cols-2 grid-rows-[repeat(3,_max-content)] gap-2">
            <FormField
              name={fields.durationValue.name}
              className="row-span-full grid grid-rows-subgrid gap-2"
            >
              <FormLabel>
                {t('cases:case_detail.add_rule_snooze.duration_value')}
              </FormLabel>
              <FormInput type="number" className="w-full" />
              <FormErrorOrDescription />
            </FormField>

            <FormField
              name={fields.durationUnit.name}
              className="row-span-full grid grid-rows-subgrid gap-2"
            >
              <FormLabel>
                {t('cases:case_detail.add_rule_snooze.duration_unit')}
              </FormLabel>
              <FormSelect.Default
                className="h-10 w-full"
                options={durationUnitOptions}
              >
                {durationUnitOptions.map((unit) => (
                  <FormSelect.DefaultItem key={unit} value={unit}>
                    {dateTimeFieldNames.of(adaptDateTimeFieldCodes(unit))}
                  </FormSelect.DefaultItem>
                ))}
              </FormSelect.Default>
              <FormErrorOrDescription />
            </FormField>
          </div>

          <div className="flex flex-1 flex-row gap-2">
            <ModalV2.Close
              render={<Button className="flex-1" variant="secondary" />}
            >
              {t('common:cancel')}
            </ModalV2.Close>
            <Button
              className="flex-1"
              variant="primary"
              type="submit"
              name="update"
            >
              <LoadingIcon
                icon="plus"
                className="size-5"
                loading={fetcher.state === 'submitting'}
              />
              {t('cases:case_detail.add_rule_snooze')}
            </Button>
          </div>
        </div>
      </fetcher.Form>
    </FormProvider>
  );
}
