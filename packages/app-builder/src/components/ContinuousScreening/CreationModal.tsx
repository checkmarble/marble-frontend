import { ButtonV2, Modal } from 'ui-design-system';

type CreationModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (value: { name: string; description: string }) => void;
};

export const CreationModal = ({ open, onOpenChange, onSubmit }: CreationModalProps) => {
  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content>
        <Modal.Title>New monitoring</Modal.Title>
        <div className="flex flex-col gap-6 p-6"></div>
        <Modal.Footer>
          <div className="flex gap-v2-sm justify-end p-v2-md">
            <Modal.Close asChild>
              <ButtonV2 variant="secondary">Cancel</ButtonV2>
            </Modal.Close>
            <ButtonV2 variant="primary" onClick={() => onSubmit({ name: 'test', description: 'test' })}>
              Create
            </ButtonV2>
          </div>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
};
