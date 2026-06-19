import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { useCreateListMutation } from '@app-builder/queries/lists/create-list';
import { CreateListPayload, createListPayloadSchema } from '@app-builder/schemas/lists';
import { getFieldErrors } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, Modal, SelectV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { Nudge } from '../Nudge';

export function CreateListModal({ isIpGpsAvailable }: { isIpGpsAvailable: boolean }) {
  const { t } = useTranslation(['lists', 'navigation', 'common']);
  const createListMutation = useCreateListMutation();

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      kind: 'text',
    } as CreateListPayload,
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        createListMutation
          .mutateAsync(value)
          .then((res) => {
            // On success the server redirects — this only runs if it returned an error object
            if (res && 'error' in res) {
              toast.error(t('common:errors.list.duplicate_list_name'));
              return;
            }
          })
          .catch(() => {
            toast.error(t('common:errors.unknown'));
          });
      }
    },
    validators: {
      onSubmitAsync: createListPayloadSchema,
    },
  });

  return (
    <Modal.Root>
      <Modal.Trigger asChild>
        <Button size="medium">
          <Icon icon="plus" className="size-5" />
          {t('lists:create_list.title')}
        </Button>
      </Modal.Trigger>
      <Modal.Content>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <Modal.Title>{t('lists:create_list.title')}</Modal.Title>
          <div className="flex flex-col gap-6 p-6">
            <div className="flex flex-1 flex-col gap-4">
              <form.Field name="name">
                {(field) => (
                  <div className="flex flex-col gap-2">
                    <FormLabel name={field.name}>{t('lists:name')}</FormLabel>
                    <FormInput
                      type="text"
                      name={field.name}
                      defaultValue={field.state.value}
                      onChange={(e) => field.handleChange(e.currentTarget.value)}
                      onBlur={field.handleBlur}
                      valid={field.state.meta.errors.length === 0}
                      placeholder={t('lists:create_list.name_placeholder')}
                    />
                    <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                  </div>
                )}
              </form.Field>
              <form.Field name="description">
                {(field) => (
                  <div className="flex flex-col gap-2">
                    <FormLabel name={field.name}>{t('lists:description')}</FormLabel>
                    <FormInput
                      type="text"
                      name={field.name}
                      defaultValue={field.state.value}
                      onChange={(e) => field.handleChange(e.currentTarget.value)}
                      onBlur={field.handleBlur}
                      valid={field.state.meta.errors.length === 0}
                      placeholder={t('lists:create_list.description_placeholder')}
                    />
                    <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                  </div>
                )}
              </form.Field>

              <form.Field name="kind">
                {(field) => (
                  <div className="flex flex-1 flex-col gap-2">
                    <FormLabel name={field.name}>{t('lists:kind')}</FormLabel>
                    <SelectV2
                      className="w-full overflow-hidden"
                      value={field.state.value}
                      onChange={(value) => field.handleChange(value)}
                      placeholder={t('lists:kind')}
                      options={[
                        {
                          label: t('lists:kind.text'),
                          value: 'text' as const,
                        },
                        {
                          label: (
                            <span className="flex w-full items-center gap-2">
                              <span>{t('lists:kind.cidrs')}</span>
                              {!isIpGpsAvailable ? <Nudge kind="restricted" content={t('common:premium')} /> : null}
                            </span>
                          ),
                          value: 'cidrs' as const,
                        },
                      ].filter((option) => isIpGpsAvailable || option.value !== 'cidrs')}
                    />
                    <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                  </div>
                )}
              </form.Field>
            </div>
          </div>
          <Modal.Footer>
            <Modal.FooterButton isCloseButton label={t('common:cancel')} />
            <Modal.FooterButton
              label={t('lists:create_list.button_accept')}
              type="submit"
              name="create"
              isLoading={createListMutation.isPending}
            />
          </Modal.Footer>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
}
