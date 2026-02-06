import { FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, Modal, TextArea } from 'ui-design-system';
import { z } from 'zod/v4';

const basePayloadSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
});

type CreationModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (value: { name: string; description: string }) => void;
};

export const CreationModal = ({ open, onOpenChange, onSubmit }: CreationModalProps) => {
  const { t } = useTranslation(['common', 'continuousScreening']);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const isValid = basePayloadSchema.safeParse({ name, description }).success;
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isValid) {
      onSubmit({ name, description });
    }
  };
  const innerOpenChange = (open: boolean) => {
    if (!open) {
      setName('');
      setDescription('');
    }
    onOpenChange(open);
  };

  return (
    <Modal.Root open={open} onOpenChange={innerOpenChange}>
      <Modal.Content>
        <Modal.Title>{t('continuousScreening:creation.modal.title')}</Modal.Title>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6 p-6">
            <Input
              name="name"
              placeholder={t('continuousScreening:creation.modal.name_placeholder')}
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
            />
            <TextArea
              name="description"
              placeholder={t('continuousScreening:creation.modal.description_placeholder')}
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.currentTarget.value)}
            />
          </div>
          <Modal.Footer>
            <Modal.Close asChild>
              <Button variant="secondary">{t('common:cancel')}</Button>
            </Modal.Close>
            <Button type="submit" variant="primary" disabled={!isValid}>
              {t('common:create')}
            </Button>
          </Modal.Footer>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
};
