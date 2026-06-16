import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { Panel } from '@app-builder/components/Panel';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import {
  CreateCasePayload,
  createCasePayloadSchema,
  useCreateCaseMutation,
} from '@app-builder/queries/cases/create-case';
import { useGetInboxesQuery } from '@app-builder/queries/cases/get-inboxes';
import { getFieldErrors, handleSubmit } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { SelectV2 } from 'ui-design-system';

export function CreateCase({ inboxId }: { inboxId: string | null }) {
  const { t } = useTranslation(['cases', 'common']);
  const inboxesQuery = useGetInboxesQuery();
  const createCaseMutation = useCreateCaseMutation();
  const revalidate = useLoaderRevalidator();
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      name: '',
      inboxId: inboxId ?? '',
    } satisfies CreateCasePayload,
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        createCaseMutation
          .mutateAsync(value)
          .then(() => {
            queryClient.invalidateQueries({ queryKey: ['cases', 'get-cases', value.inboxId] });
            revalidate();
          })
          .catch(() => {
            toast.error(t('common:errors.unknown'));
          });
      }
    },
    validators: {
      onSubmit: createCasePayloadSchema,
    },
  });

  return (
    <Panel.Container size="small">
      <form onSubmit={handleSubmit(form)}>
        <Panel.Content>
          <Panel.Header>{t('cases:case.new_case')}</Panel.Header>

          <div className="flex flex-col gap-md">
            <form.Field
              name="name"
              validators={{
                onBlur: createCasePayloadSchema.shape.name,
                onChange: createCasePayloadSchema.shape.name,
              }}
            >
              {(field) => (
                <div className="flex flex-col gap-sm">
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
                <div className="flex flex-1 flex-col gap-sm">
                  <FormLabel name={field.name} className="text-xs first-letter:capitalize">
                    {t('cases:case.new_case.select_inbox')}
                  </FormLabel>
                  {inboxesQuery.isSuccess ? (
                    <SelectV2
                      className="w-full overflow-hidden"
                      placeholder=""
                      value={field.state.value}
                      options={inboxesQuery.data.inboxes.map(({ name, id }) => ({ label: name, value: id }))}
                      onChange={(inboxId) => {
                        field.handleChange(inboxId);
                      }}
                    />
                  ) : null}
                  <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                </div>
              )}
            </form.Field>
          </div>
          <Panel.Footer>
            <Panel.FooterButton type="submit" label={t('cases:case.new_case.create')} leadingIcon="plus" />
          </Panel.Footer>
        </Panel.Content>
      </form>
    </Panel.Container>
  );
}
