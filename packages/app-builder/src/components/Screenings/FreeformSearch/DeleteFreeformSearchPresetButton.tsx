import { type SavedFreeformSearchPreset } from '@app-builder/models/freeform-search-preset';
import { useDeleteFreeFormSearchPresetMutation } from '@app-builder/queries/screening/freeform-search';
import { useId, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, Modal, TooltipV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';

interface DeleteFreeformSearchPresetButtonProps {
  preset: Pick<SavedFreeformSearchPreset, 'id' | 'name'>;
  onDeleted: () => void;
}

export function DeleteFreeformSearchPresetButton({ preset, onDeleted }: DeleteFreeformSearchPresetButtonProps) {
  const { t } = useTranslation(['common', 'screenings']);
  const [open, setOpen] = useState(false);
  const descriptionId = useId();
  const deletePresetMutation = useDeleteFreeFormSearchPresetMutation();

  const handleDelete = async () => {
    try {
      await deletePresetMutation.mutateAsync({ id: preset.id });
      setOpen(false);
      onDeleted();
      toast.success(t('common:success.deleted'));
    } catch {
      toast.error(t('common:errors.unknown'));
    }
  };

  return (
    <Modal.Root open={open} onOpenChange={(nextOpen) => !deletePresetMutation.isPending && setOpen(nextOpen)}>
      <TooltipV2.Provider>
        <TooltipV2.Tooltip>
          <TooltipV2.TooltipTrigger asChild>
            <Modal.Trigger asChild>
              <Button
                type="button"
                variant="secondary"
                appearance="stroked"
                size="medium"
                aria-label={t('screenings:freeform_search.delete_preset')}
                className="me-auto"
              >
                <Icon icon="delete" className="size-5 text-red-primary" aria-hidden="true" />
              </Button>
            </Modal.Trigger>
          </TooltipV2.TooltipTrigger>
          <TooltipV2.TooltipContent>{t('screenings:freeform_search.delete_preset')}</TooltipV2.TooltipContent>
        </TooltipV2.Tooltip>
      </TooltipV2.Provider>
      <Modal.Content size="small" aria-describedby={descriptionId}>
        <Modal.Title>{t('screenings:freeform_search.delete_preset')}</Modal.Title>
        <p id={descriptionId} className="p-lg text-s">
          {t('screenings:freeform_search.delete_preset_confirmation', { name: preset.name })}
        </p>
        <Modal.Footer>
          <Modal.FooterButton isCloseButton label={t('common:cancel')} disabled={deletePresetMutation.isPending} />
          <Modal.FooterButton
            type="button"
            variant="destructive"
            label={t('common:delete')}
            leadingIcon="delete"
            isLoading={deletePresetMutation.isPending}
            onClick={handleDelete}
          />
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
