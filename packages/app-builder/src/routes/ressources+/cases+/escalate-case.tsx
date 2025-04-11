import { Callout, casesI18n } from '@app-builder/components';
import { handleSubmit } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

const schema = z.object({ caseId: z.string() });

export const EscalateCase = ({ id }: { id: string }) => {
  const { t } = useTranslation(casesI18n);

  const form = useForm({
    defaultValues: { caseId: id },
    validators: {
      onChange: schema,
      onBlur: schema,
      onSubmit: schema,
    },
  });

  return (
    <Modal.Root>
      <Modal.Trigger asChild>
        <Button variant="secondary" size="medium" type="button">
          <Icon icon="arrow-up" className="size-5" aria-hidden />
          Escalate
        </Button>
      </Modal.Trigger>
      <Modal.Content>
        <Modal.Title>Escalate Case</Modal.Title>
        <div className="flex flex-col gap-8 p-8">
          <Callout>
            By escalating this decision, you will no longer have access to the case and will no
            longer be assigned to the case. You will be redirected to your inbox.
          </Callout>
          <form onSubmit={handleSubmit(form)} className="flex w-full flex-row gap-2">
            <Modal.Close asChild>
              <Button variant="secondary" type="button" className="flex-1 first-letter:capitalize">
                {t('common:cancel')}
              </Button>
            </Modal.Close>

            <Button type="submit" className="flex-1 first-letter:capitalize">
              Escalate
            </Button>
          </form>
        </div>
      </Modal.Content>
    </Modal.Root>
  );
};
