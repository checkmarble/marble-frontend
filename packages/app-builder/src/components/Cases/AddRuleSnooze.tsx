import { Callout } from '@app-builder/components';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { LoadingIcon } from '@app-builder/components/Spinner';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { adaptDateTimeFieldCodes, type DurationUnit } from '@app-builder/models/duration';
import {
  AddRuleSnoozePayload,
  addRuleSnoozePayloadSchema,
  durationUnitOptions,
  useAddRuleSnoozeMutation,
} from '@app-builder/queries/cases/add-rule-snooze';
import { ruleSnoozesDocHref } from '@app-builder/services/documentation-href';
import { getFieldErrors } from '@app-builder/utils/form';
import { useFormatLanguage } from '@app-builder/utils/format';
import { useForm } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button, ModalV2, Select, TextArea } from 'ui-design-system';

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
  const addRuleSnoozeMutation = useAddRuleSnoozeMutation();
  const revalidate = useLoaderRevalidator();
  const queryClient = useQueryClient();
  const dateTimeFieldNames = useMemo(
    () =>
      new Intl.DisplayNames(language, {
        type: 'dateTimeField',
      }),
    [language],
  );

  const form = useForm({
    defaultValues: {
      decisionId,
      ruleId,
      durationValue: 1,
      durationUnit: 'days',
    } as AddRuleSnoozePayload,
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        addRuleSnoozeMutation.mutateAsync(value).then((res) => {
          if (res.status === 'success') {
            queryClient.invalidateQueries({ queryKey: ['cases', 'rulesByPivot'] });
            setOpen(false);
          }
          revalidate();
        });
      }
    },
    validators: {
      onSubmit: addRuleSnoozePayloadSchema,
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
            onBlur: addRuleSnoozePayloadSchema.shape.comment,
            onChange: addRuleSnoozePayloadSchema.shape.comment,
          }}
        >
          {(field) => (
            <div className="row-span-full grid grid-rows-subgrid gap-2">
              <FormLabel name={field.name}>{t('cases:case_detail.add_rule_snooze.comment.label')}</FormLabel>
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
              onBlur: addRuleSnoozePayloadSchema.shape.durationValue,
              onChange: addRuleSnoozePayloadSchema.shape.durationValue,
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
              onBlur: addRuleSnoozePayloadSchema.shape.durationUnit,
              onChange: addRuleSnoozePayloadSchema.shape.durationUnit,
            }}
          >
            {(field) => (
              <div className="row-span-full grid grid-rows-subgrid gap-2">
                <FormLabel name={field.name}>{t('cases:case_detail.add_rule_snooze.duration_unit')}</FormLabel>
                <Select.Default
                  className="h-10 w-full"
                  defaultValue={field.state.value}
                  onValueChange={(unit) =>
                    field.handleChange(unit as Exclude<DurationUnit, 'seconds' | 'years' | 'minutes' | 'months'>)
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
          <ModalV2.Close render={<Button className="flex-1" variant="secondary" />}>{t('common:cancel')}</ModalV2.Close>
          <Button className="flex-1" variant="primary" type="submit" name="update">
            <LoadingIcon icon="snooze" className="size-5" loading={addRuleSnoozeMutation.isPending} />
            {t('cases:decisions.rule.snooze')}
          </Button>
        </div>
      </div>
    </form>
  );
}
