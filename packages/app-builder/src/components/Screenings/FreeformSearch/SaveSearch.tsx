import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { useEntityName } from '@app-builder/hooks/useEntityName';
// import { useSaveFreeformSearchMutation } from '@app-builder/queries/screening/freeform-search';
import { getFieldErrors, handleSubmit } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
// import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod/v4';
import { FreeformSearchState } from './FreeformSearchPage';

const saveSearchFormSchema = z.object({
  name: z.string().min(1).max(120),
});

export const SaveSearch = ({ search }: { search: FreeformSearchState }) => {
  const { t } = useTranslation(['screenings', 'common']);
  const [open, setOpen] = useState(false);
  // const saveSearchMutation = useSaveFreeformSearchMutation();
  const { getEntityName } = useEntityName();

  const form = useForm({
    defaultValues: { name: '' },
    onSubmit: ({ value, formApi }) => {
      if (!formApi.state.isValid) return;
      // saveSearchMutation
      //   .mutateAsync({
      //     name: value.name,
      //     inputs: search.inputs,
      //     results: search.results,
      //   })
      //   .then((res) => {
      //     if (res.success) {
      //       toast.success(t('screenings:freeform_search.save.success'));
      //       setOpen(false);
      //       form.reset();
      //     } else {
      //       toast.error(t('common:errors.unknown'));
      //     }
      //   })
      //   .catch(() => toast.error(t('common:errors.unknown')));
    },
    validators: {
      onSubmit: saveSearchFormSchema,
    },
  });

  const filledFields = Object.entries(search.inputs.fields).filter(([, v]) => v && v.length > 0);

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button variant="secondary">
          <Icon icon="save" className="size-4" />
          {t('screenings:freeform_search.save.button')}
        </Button>
      </Modal.Trigger>
      <Modal.Content>
        <form onSubmit={handleSubmit(form)}>
          <Modal.Title>{t('screenings:freeform_search.save.title')}</Modal.Title>
          <div className="flex flex-col gap-v2-md p-v2-md">
            <Modal.Description>{t('screenings:freeform_search.save.description')}</Modal.Description>
            <div className="bg-grey-02 flex flex-col gap-2 rounded-md">
              <h3 className="text-s text-grey-primary font-semibold">
                {t('screenings:freeform_search.save.summary_title')}
              </h3>
              <div className="grid grid-cols-2 gap-x-v2-lg">
                <SummaryRow
                  label={t('screenings:freeform_search.save.entity')}
                  value={getEntityName(search.inputs.entityType)}
                />
                {filledFields.map(([key, value]) => (
                  <SummaryRow key={key} label={key} value={value} />
                ))}
                <SummaryRow
                  label={t('screenings:freeform_search.save.datasets')}
                  value={
                    search.inputs.datasets.length
                      ? String(search.inputs.datasets.length)
                      : t('screenings:freeform_search.datasets_all')
                  }
                />
                {search.inputs.threshold !== undefined ? (
                  <SummaryRow
                    label={t('screenings:freeform_search.save.threshold')}
                    value={String(search.inputs.threshold)}
                  />
                ) : null}
                {search.inputs.limit !== undefined ? (
                  <SummaryRow label={t('screenings:freeform_search.save.limit')} value={String(search.inputs.limit)} />
                ) : null}
                <SummaryRow
                  label={t('screenings:freeform_search.save.results')}
                  value={t('screenings:freeform_search.results_count', { count: search.results.length })}
                />
              </div>
            </div>

            <form.Field name="name">
              {(field) => (
                <div className="flex flex-col gap-2">
                  <FormLabel name={field.name}>{t('screenings:freeform_search.save.name_label')}</FormLabel>
                  <FormInput
                    type="text"
                    name={field.name}
                    defaultValue={field.state.value}
                    onChange={(e) => field.handleChange(e.currentTarget.value)}
                    onBlur={field.handleBlur}
                    valid={field.state.meta.errors.length === 0}
                    placeholder={t('screenings:freeform_search.save.name_placeholder')}
                  />
                  <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                </div>
              )}
            </form.Field>
          </div>
          <Modal.Footer>
            <Modal.Close asChild>
              <Button type="button" variant="secondary" appearance="stroked">
                {t('common:cancel')}
              </Button>
            </Modal.Close>
            {/* <Button variant="primary" type="submit" disabled={saveSearchMutation.isPending}>
              <Icon icon="save" className="size-4" />
              {t('screenings:freeform_search.save.submit')}
            </Button> */}
          </Modal.Footer>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
};

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-sm flex items-baseline justify-between gap-v2-sm">
      <span className="text-grey-secondary capitalize">{label}</span>
      <span className=" truncate font-bold text-grey-primary">{value}</span>
    </div>
  );
}
