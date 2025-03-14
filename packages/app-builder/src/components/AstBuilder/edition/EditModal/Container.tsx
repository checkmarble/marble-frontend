import { type EditableAstNode } from '@app-builder/models/astNode/builder-ast-node';
import { type ReactElement, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, cn, Modal } from 'ui-design-system';

import { AstBuilderNodeSharpFactory } from '../node-store';
import { type OperandEditModalProps } from './EditModal';

export type OperandEditModalContainerProps = Omit<OperandEditModalProps, 'node'> & {
  title: ReactElement | string;
  children: ReactNode;
  size?: 'small' | 'medium' | 'large';
  className?: string;
};
export function OperandEditModalContainer({ className, ...props }: OperandEditModalContainerProps) {
  const { t } = useTranslation(['common']);
  const nodeSharp = AstBuilderNodeSharpFactory.useSharp();
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      props.onCancel();
    }
  };

  return (
    <Modal.Root open onOpenChange={handleOpenChange}>
      <Modal.Content size={props.size}>
        <Modal.Title>{props.title}</Modal.Title>
        <div className={cn('flex flex-col gap-4 p-4', className)}>{props.children}</div>
        <Modal.Footer>
          <div className="flex flex-1 flex-row gap-2 p-4">
            <Modal.Close asChild>
              <Button variant="secondary" className="flex-1">
                {t('common:cancel')}
              </Button>
            </Modal.Close>
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => {
                props.onSave(nodeSharp.value.node as EditableAstNode);
              }}
            >
              {t('common:save')}
            </Button>
          </div>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
