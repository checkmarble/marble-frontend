import { FormError } from '@app-builder/components/Form/Tanstack/FormError';
import { type CustomListKind } from '@app-builder/models/custom-list';
import { useAddListValueMutation } from '@app-builder/queries/lists/add-value';
import {
  type AddValuePayload,
  addCidrValuePayloadSchema,
  addValuePayloadSchema,
  normalizeCidr,
} from '@app-builder/schemas/lists';
import { useForm } from '@tanstack/react-form';
import { useRouter } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function AddListValueModal({ listId, kind }: { listId: string; kind: CustomListKind }) {
  const { t } = useTranslation(['lists', 'navigation', 'common']);
  const addListValueMutation = useAddListValueMutation();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const validationSchema = useMemo(
    () => (kind === 'cidrs' ? addCidrValuePayloadSchema : addValuePayloadSchema),
    [kind],
  );

  const form = useForm({
    defaultValues: {
      listId,
      value: '',
      kind,
    } as AddValuePayload,
    onSubmit: async ({ value }) => {
      const payload = kind === 'cidrs' ? { ...value, value: normalizeCidr(value.value) } : value;
      await addListValueMutation.mutateAsync(payload);
      router.invalidate();
      setIsOpen(false);
      form.reset();
    },
    validators: {
      onSubmitAsync: validationSchema,
    },
  });

  return (
    <Modal.Root open={isOpen} onOpenChange={setIsOpen}>
      <Modal.Trigger asChild>
        <Button size="medium">
          <Icon icon="plus" className="size-5" />
          {t('lists:create_value.title')}
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
          <Modal.Title>{t('lists:create_value.title')}</Modal.Title>
          <div className="flex flex-col gap-lg p-lg">
            <form.Field name="value">
              {(field) => (
                <div className="flex flex-col gap-sm">
                  <label htmlFor={field.name}>{t('lists:detail.value.create.form.label')}</label>
                  <Input
                    id={field.name}
                    type="text"
                    name={field.name}
                    defaultValue={field.state.value}
                    onChange={(e) => field.handleChange(e.currentTarget.value)}
                    onBlur={field.handleBlur}
                    aria-invalid={field.state.meta.errors.length > 0 || undefined}
                    borderColor={field.state.meta.errors.length === 0 ? 'greyfigma-90' : 'redfigma-47'}
                    placeholder={
                      kind === 'cidrs'
                        ? t('lists:create_value.cidr_placeholder')
                        : t('lists:create_value.value_placeholder')
                    }
                  />
                  <FormError
                    field={field}
                    asString
                    translations={{
                      invalid_union: t('lists:create_value.cidr_error'),
                    }}
                  />
                </div>
              )}
            </form.Field>
          </div>
          <Modal.Footer>
            <Modal.FooterButton
              isCloseButton
              label={t('common:cancel')}
              onClick={(e) => {
                e.preventDefault();
                setIsOpen(false);
              }}
            />
            <Modal.FooterButton
              variant="primary"
              type="submit"
              label={t('common:save')}
              isLoading={addListValueMutation.isPending}
            />
          </Modal.Footer>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
}
