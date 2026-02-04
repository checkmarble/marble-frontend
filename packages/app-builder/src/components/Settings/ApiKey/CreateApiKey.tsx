import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { apiKeyRoleOptions } from '@app-builder/models/api-keys';
import {
  CreateApiKeyPayload,
  createApiKeyPayloadSchema,
  useCreateApiKeyMutation,
} from '@app-builder/queries/settings/api-keys/create-api-key';
import { tKeyForApiKeyRole } from '@app-builder/services/i18n/translation-keys/api-key';
import { getFieldErrors, handleSubmit } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonV2, Modal, Select } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function CreateApiKey() {
  const { t } = useTranslation(['settings']);
  const [open, setOpen] = useState(false);

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger onClick={(e) => e.stopPropagation()} asChild>
        <ButtonV2 type="button">
          <Icon icon="plus" className="size-5" />
          {t('settings:api_keys.new_api_key')}
        </ButtonV2>
      </Modal.Trigger>
      <Modal.Content onClick={(e) => e.stopPropagation()}>
        <CreateApiKeyContent onSuccess={() => setOpen(false)} />
      </Modal.Content>
    </Modal.Root>
  );
}

const CreateApiKeyContent = ({ onSuccess }: { onSuccess: () => void }) => {
  const { t } = useTranslation(['settings', 'common']);
  const createApiKeyMutation = useCreateApiKeyMutation();
  const revalidate = useLoaderRevalidator();

  const form = useForm({
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        createApiKeyMutation.mutateAsync(value).then((res) => {
          if (!res) {
            onSuccess();
          }
          revalidate();
        });
      }
    },
    defaultValues: { description: '', role: 'API_CLIENT' } as CreateApiKeyPayload,
    validators: {
      onChange: createApiKeyPayloadSchema,
      onSubmit: createApiKeyPayloadSchema,
    },
  });

  return (
    <form onSubmit={handleSubmit(form)}>
      <Modal.Title>{t('settings:api_keys.new_api_key')}</Modal.Title>
      <div className="bg-surface-card flex flex-col gap-6 p-6">
        <form.Field name="description">
          {(field) => (
            <div className="group flex flex-col gap-2">
              <FormLabel name={field.name}>{t('settings:api_keys.description')}</FormLabel>
              <FormInput
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.currentTarget.value)}
                valid={field.state.meta.errors.length === 0}
                type="text"
              />
              <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
            </div>
          )}
        </form.Field>
        <form.Field name="role">
          {(field) => (
            <div className="group flex flex-col gap-2">
              <FormLabel name={field.name}>{t('settings:api_keys.role')}</FormLabel>
              <Select.Default
                name={field.name}
                disabled={apiKeyRoleOptions.length === 1}
                defaultValue={field.state.value}
                borderColor={field.state.meta.errors.length === 0 ? 'greyfigma-90' : 'redfigma-47'}
              >
                {apiKeyRoleOptions.map((role) => (
                  <Select.DefaultItem key={role} value={role}>
                    {t(tKeyForApiKeyRole(role))}
                  </Select.DefaultItem>
                ))}
              </Select.Default>
              <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
            </div>
          )}
        </form.Field>
      </div>
      <Modal.Footer>
        <Modal.Close asChild>
          <ButtonV2 type="button" variant="secondary" appearance="stroked">
            {t('common:cancel')}
          </ButtonV2>
        </Modal.Close>
        <ButtonV2 variant="primary" type="submit">
          {t('settings:api_keys.create')}
        </ButtonV2>
      </Modal.Footer>
    </form>
  );
};
