import { useCaseRightPanelContext } from '@app-builder/components';
import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import {
  CreateCasePayload,
  createCasePayloadSchema,
  useCreateCaseMutation,
} from '@app-builder/queries/cases/create-case';
import { useGetInboxesQuery } from '@app-builder/queries/cases/get-inboxes';
import { getFieldErrors } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Button, Select } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function CreateCase() {
  const { t } = useTranslation(['cases']);
  const inboxesQuery = useGetInboxesQuery();
  const createCaseMutation = useCreateCaseMutation();
  const { data } = useCaseRightPanelContext();
  const revalidate = useLoaderRevalidator();
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      name: '',
      inboxId: data?.inboxId ?? '',
    } satisfies CreateCasePayload,
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        createCaseMutation.mutateAsync(value).then((res) => {
          queryClient.invalidateQueries({ queryKey: ['cases', 'get-cases', value.inboxId] });
          revalidate();
        });
      }
    },
    validators: {
      onSubmit: createCasePayloadSchema,
    },
  });

  if (inboxesQuery.isPending) return <div>Loading...</div>;
  if (inboxesQuery.isError) return <div>Error</div>;

  const inboxes = inboxesQuery.data.inboxes;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <div className="flex flex-col gap-4">
        <form.Field
          name="name"
          validators={{
            onBlur: createCasePayloadSchema.shape.name,
            onChange: createCasePayloadSchema.shape.name,
          }}
        >
          {(field) => (
            <div className="flex flex-col gap-2">
              <FormLabel name={field.name} className="text-xs first-letter:capitalize">
                {t('cases:case.name')}
              </FormLabel>
              <FormInput
                type="text"
                name={field.name}
                defaultValue={field.state.value}
                onChange={(e) => field.handleChange(e.currentTarget.value)}
                valid={field.state.meta.errors.length === 0}
                placeholder={t('cases:case.new_case.placeholder')}
              />
              <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
            </div>
          )}
        </form.Field>
        <form.Field
          name="inboxId"
          validators={{
            onBlur: createCasePayloadSchema.shape.inboxId,
            onChange: createCasePayloadSchema.shape.inboxId,
          }}
        >
          {(field) => (
            <div className="flex flex-1 flex-col gap-2">
              <FormLabel name={field.name} className="text-xs first-letter:capitalize">
                {t('cases:case.new_case.select_inbox')}
              </FormLabel>
              <Select.Default
                className="w-full overflow-hidden"
                defaultValue={field.state.value}
                onValueChange={(inboxId) => {
                  field.handleChange(inboxId);
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
        <Button type="submit">
          <Icon icon="plus" className="size-6" />
          {t('cases:case.new_case.create')}
        </Button>
      </div>
    </form>
  );
}
