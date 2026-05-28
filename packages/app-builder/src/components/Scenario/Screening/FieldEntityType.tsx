import { SearchableSchema } from '@app-builder/constants/screening-entity';
import { useEntityName } from '@app-builder/hooks/useEntityName';
import { useEditorMode } from '@app-builder/services/editor/editor-mode';
import { useState } from 'react';
import { Button, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const FieldEntityType = ({
  entityType,
  onChange,
}: {
  entityType?: SearchableSchema;
  onChange: (entityType: SearchableSchema) => void;
}) => {
  const editor = useEditorMode();
  const { getEntityName } = useEntityName();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <MenuCommand.Menu persistOnSelect={false} open={open} onOpenChange={setOpen}>
        <MenuCommand.Trigger>
          <Button variant="secondary" className="w-52 justify-between" disabled={editor === 'view'}>
            <span className="text-grey-primary text-s font-medium">{getEntityName(entityType)}</span>
            <Icon icon="caret-down" className="text-grey-secondary size-4" />
          </Button>
        </MenuCommand.Trigger>
        <MenuCommand.Content sameWidth className="mt-2">
          <MenuCommand.List>
            <MenuCommand.Item onSelect={() => onChange('Thing')}>{getEntityName('Thing')}</MenuCommand.Item>
            <MenuCommand.Item onSelect={() => onChange('Person')}>{getEntityName('Person')}</MenuCommand.Item>
            <MenuCommand.Item onSelect={() => onChange('Organization')}>
              {getEntityName('Organization')}
            </MenuCommand.Item>
            <MenuCommand.Item onSelect={() => onChange('Vehicle')}>{getEntityName('Vehicle')}</MenuCommand.Item>
          </MenuCommand.List>
        </MenuCommand.Content>
      </MenuCommand.Menu>
    </div>
  );
};
