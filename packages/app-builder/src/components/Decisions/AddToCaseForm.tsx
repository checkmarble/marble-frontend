import { useDecisionRightPanelContext } from '@app-builder/components';
import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { addToCasePayloadSchema, useAddToCaseMutation } from '@app-builder/queries/cases/add-to-case';
import { useGetInboxesQuery } from '@app-builder/queries/cases/get-inboxes';
import { getFieldErrors } from '@app-builder/utils/form';
import { useForm, useStore } from '@tanstack/react-form';
import { useTranslation } from 'react-i18next';
import { Button, Select, Switch } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function AddToCaseForm() {
  const { t } = useTranslation(['decisions', 'navigation', 'common']);
  const inboxesQuery = useGetInboxesQuery();
  const addToCaseMutation = useAddToCaseMutation();
  const revalidate = useLoaderRevalidator();
  const { data, closePanel } = useDecisionRightPanelContext();

  const form = useForm({
    defaultValues: {
      newCase: false,
      decisionIds: data?.decisionIds ? data?.decisionIds : [],
      caseId: '',
      name: '',
      inboxId: '',
    },
    onSubmit: ({ value }) => {
      const payload = addToCasePayloadSchema.safeParse(value);
      if (!payload.success) return;
      addToCaseMutation.mutateAsync(payload.data).then((res) => {
        if (res?.success) {
          closePanel();
        }
        revalidate();
      });
    },
  });

  const isNewCase = useStore(form.store, (state) => state.values.newCase);

  if (inboxesQuery.isPending) {
    return <p>Loading...</p>;
  }

  if (inboxesQuery.isError) {
    return <p>Error</p>;
  }

  const inboxes = inboxesQuery.data?.inboxes ?? [];
  if (inboxes.length === 0) {
    return <p>{t('decisions:add_to_case.new_case.no_inbox')}</p>;
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      id="add-to-case-form"
    >
      <div className="flex flex-col gap-4">
        <form.Field name="newCase">
          {(field) => (
            <div className="flex items-center gap-2">
              <FormLabel name={field.name} className="text-xs first-letter:capitalize">
                {t('decisions:add_to_case.create_new_case')}
              </FormLabel>
              <Switch
                id="newCase"
                checked={field.state.value}
                onBlur={field.handleBlur}
                onCheckedChange={(checked) => field.handleChange(checked)}
              />
              <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
            </div>
          )}
        </form.Field>
        {isNewCase ? (
          <>
            <p className="text-s text-grey-primary font-semibold first-letter:capitalize">
              {t('decisions:add_to_case.new_case.informations')}
            </p>
            <form.Field name="name">
              {(field) => (
                <div className="flex flex-col gap-2">
                  <FormLabel name={field.name} className="text-xs first-letter:capitalize">
                    {t('decisions:add_to_case.new_case.new_case_name')}
                  </FormLabel>
                  <FormInput
                    type="text"
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.currentTarget.value)}
                    onBlur={field.handleBlur}
                    valid={field.state.meta.errors.length === 0}
                  />
                  <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                </div>
              )}
            </form.Field>
            <form.Field name="inboxId">
              {(field) => (
                <div className="flex flex-1 flex-col gap-2">
                  <FormLabel name={field.name} className="text-xs first-letter:capitalize">
                    {t('decisions:add_to_case.new_case.select_inbox')}
                  </FormLabel>
                  <Select.Default
                    className="w-full overflow-hidden"
                    value={field.state.value}
                    onValueChange={(type) => {
                      field.handleChange(type);
                      field.handleBlur();
                    }}
                  >
                    {inboxes.map(({ name, id }) => {
                      return (
                        <Select.DefaultItem key={id} value={id}>
                          {name}
                        </Select.DefaultItem>
                      );
                    })}
                  </Select.Default>
                  <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                </div>
              )}
            </form.Field>
            <Button type="submit" form="add-to-case-form">
              <Icon icon="plus" className="size-5" />
              {t('decisions:add_to_case.create_new_case')}
            </Button>
          </>
        ) : (
          <>
            <p className="text-s text-grey-primary font-semibold first-letter:capitalize">
              {t('decisions:add_to_case.new_case.attribution')}
            </p>
            <form.Field name="caseId">
              {(field) => (
                <div className="flex flex-col gap-2">
                  <FormLabel name={field.name} className="text-xs first-letter:capitalize">
                    {t('decisions:add_to_case.new_case.case_id.label')}
                  </FormLabel>

                  <FormInput
                    type="text"
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.currentTarget.value)}
                    onBlur={field.handleBlur}
                    valid={field.state.meta.errors.length === 0}
                  />
                  <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                </div>
              )}
            </form.Field>
            <Button type="submit" form="add-to-case-form">
              <Icon icon="plus" className="size-5" />
              {t('decisions:add_to_case')}
            </Button>
          </>
        )}
      </div>
    </form>
  );
}
